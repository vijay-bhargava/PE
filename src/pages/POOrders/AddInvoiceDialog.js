import React, { useState, useEffect, useMemo } from 'react';
import { HiCheck, HiOutlineLink, HiX } from 'react-icons/hi';
import { MdExpandMore } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
	downloadFilesOnAzure, getFileName,
	replaceMultipleDotsExceptExtension, getApiErrorMessage
} from '../../utils/common';
import { ApiClient, api } from '../../Apiclient';
import axios from 'axios';
import PEModal from '../../components/PEModal';
import { PETableSimple } from '../../components/RFQ/PETable';

const resolveUomString = (val) => {
	if (val == null || val === '') return '';
	if (typeof val === 'string') return val;
	if (typeof val === 'object') return val.uom ?? val.code ?? val.name ?? val.UOM ?? '';
	return String(val);
};

const fmtQty = (q, uom) => (q != null ? `${q} ${resolveUomString(uom)}`.trim() : '');

const fmtCurrency = (amt) => {
	if (amt == null || amt === '') return '';
	const num = Number(amt);
	if (isNaN(num)) return '';
	return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CALC_TYPES = ['Absolute', 'Percentage'];

const normalizeCalculationType = (val) => {
	if (!val) return 'Absolute';
	const v = String(val).toLowerCase();
	if (v === 'a' || v === 'absolute' || v === 'currency') return 'Absolute';
	if (v === 'p' || v === 'percentage') return 'Percentage';
	return CALC_TYPES.includes(val) ? val : 'Absolute';
};

const createEmptyCondition = (overrides = {}) => ({
	_key: `cond-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
	conditionType: '',
	calculationType: 'Absolute',
	conditionValue: '',
	currency: 'INR',
	isMatched: null,
	matchingReason: null,
	...overrides,
});

const mapPoConditionToInvoiceCondition = (c, idx) => createEmptyCondition({
	_key: c?.id != null ? `po-${c.id}` : `po-idx-${idx}`,
	conditionType: c?.conditionType || c?.conditionCategory || '',
	calculationType: normalizeCalculationType(c?.calculationType),
	conditionValue: '',
	currency: c?.currency || 'INR',
	isMatched: c?.isMatched ?? null,
	matchingReason: c?.matchingReason ?? null,
});

const mapApiConditionToInvoiceCondition = (c, idx) => createEmptyCondition({
	_key: c?.id != null ? `api-${c.id}` : `api-idx-${idx}`,
	conditionType: c?.conditionType || '',
	calculationType: normalizeCalculationType(c?.calculationType),
	conditionValue: c?.conditionValue ?? '',
	currency: c?.currency || 'INR',
	isMatched: c?.isMatched ?? null,
	matchingReason: c?.matchingReason ?? null,
});

const mapAiConditionToInvoiceCondition = (c, idx) => {
	const calculationType = normalizeCalculationType(c?.calculationType);
	const rawValue = calculationType === 'Percentage'
		? (c?.conditionRate ?? c?.conditionValue ?? c?.conditionAmount)
		: (c?.conditionAmount ?? c?.conditionValue);
	return createEmptyCondition({
		_key: c?.id != null ? `ai-${c.id}` : `ai-idx-${idx}-${Math.random().toString(36).slice(2, 6)}`,
		conditionType: c?.conditionType || '',
		calculationType,
		conditionValue: rawValue == null || rawValue === '' ? '' : String(rawValue),
		currency: c?.currency || 'INR',
		isMatched: c?.isMatched ?? null,
		matchingReason: c?.matchingReason ?? null,
	});
};

const parseAiInvoiceDate = (val) => {
	if (!val) return null;
	const s = String(val).trim();
	const dotted = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
	if (dotted) return `${dotted[3]}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`;
	const slashed = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (slashed) return `${slashed[3]}-${slashed[2].padStart(2, '0')}-${slashed[1].padStart(2, '0')}`;
	if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
	const d = new Date(s);
	if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
	return null;
};

const findLineItemForAiDetail = (lineItems, detail) => {
	if (!detail) return null;
	const detailId = detail.poCreationDetailId ?? detail.poItemId ?? detail.itemId;
	const byId = detailId != null
		? lineItems.find(li =>
			String(li.id) === String(detailId) ||
			String(li.poCreationDetailId) === String(detailId) ||
			String(li.poItemId) === String(detailId)
		)
		: null;
	if (byId) return byId;
	const code = detail.itemCode ?? detail.itemNo ?? detail.lineItemNo;
	if (code == null || code === '') return null;
	return lineItems.find(li =>
		String(li.itemCode) === String(code) ||
		String(li.itemNo) === String(code) ||
		String(li.lineItemNo) === String(code)
	) ?? null;
};

const hasKnownMatchStatus = (conditions = []) =>
	(conditions ?? []).some(c => c?.isMatched === true || c?.isMatched === false);

const getItemConditions = (itemConditions, item) =>
	(itemConditions ?? []).filter(c => {
		const condItemId = c?.poItemId ?? c?.poCreationDetailId ?? c?.itemId;
		const matchById = condItemId != null &&
			String(condItemId) === String(item?.id ?? item?.poItemId ?? item?.poCreationDetailId);
		const condItemNo = c?.itemNo ?? c?.lineItemNo;
		const matchByItemNo = condItemNo != null && (
			String(condItemNo) === String(item?.itemNo) || String(condItemNo) === String(item?.itemCode)
		);
		return matchById || matchByItemNo;
	});

const applyConditions = (baseAmount, conditions = []) => {
	const originalAmount = Number(baseAmount || 0);
	let total = originalAmount;
	(conditions ?? []).forEach(cond => {
		if (normalizeCalculationType(cond.calculationType) === 'Percentage') {
			total += (originalAmount * Number(cond.conditionValue ?? 0)) / 100;
		} else {
			total += Number(cond.conditionValue ?? 0);
		}
	});
	return total;
};

const toApiCondition = (cond) => ({
	conditionType: cond.conditionType || '',
	conditionValue: Number(cond.conditionValue || 0),
	currency: cond.currency || 'INR',
	calculationType: normalizeCalculationType(cond.calculationType),
	conditionRate: 0,
});

/** Editable/read-only conditions table */
const EditableConditionsTable = ({ conditions = [], onChange, onAdd, onRemove, disabled = false, title }) => {
	const showMatchingReason = disabled && hasKnownMatchStatus(conditions);

	const columns = [
		{
			key: 'conditionType', label: 'Condition Type',
			renderCell: (v, row) => disabled
				? (row._cond.conditionType || '')
				: <input type="text" className="pe-detail-form-input" value={row._cond.conditionType ?? ''} placeholder="e.g. GST" onChange={(e) => onChange(row._idx, 'conditionType', e.target.value)} />,
		},
		{
			key: 'calculationType', label: 'Calculation Type',
			renderCell: (v, row) => disabled
				? (row._cond.calculationType || '')
				: (
					<select className="pe-detail-form-input" value={normalizeCalculationType(row._cond.calculationType)} onChange={(e) => onChange(row._idx, 'calculationType', e.target.value)}>
						{CALC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
					</select>
				),
		},
		{
			key: 'conditionValue', label: 'Condition Amount',
			renderCell: (v, row) => disabled
				? fmtCurrency(row._cond.conditionValue)
				: <input type="number" className="pe-detail-form-input" value={row._cond.conditionValue ?? ''} step="0.01" onChange={(e) => onChange(row._idx, 'conditionValue', e.target.value)} />,
		},
		{
			key: 'currency', label: 'Currency',
			renderCell: (v, row) => disabled
				? (row._cond.currency || 'INR')
				: <input type="text" className="pe-detail-form-input" value={row._cond.currency ?? 'INR'} onChange={(e) => onChange(row._idx, 'currency', e.target.value)} />,
		},
		{
			key: '__total__', label: 'Total',
			renderCell: (v, row) => (
				<span style={{ fontWeight: 600, color: '#1976d2' }}>
					{normalizeCalculationType(row._cond.calculationType) === 'Percentage'
						? fmtCurrency((Number(row._cond.baseAmount || 0) * Number(row._cond.conditionValue || 0)) / 100)
						: fmtCurrency(row._cond.conditionValue)}
				</span>
			),
		},
		...(showMatchingReason ? [{
			key: '__match__', label: 'Matching Reason',
			renderCell: (v, row) => {
				const c = row._cond;
				if (c.isMatched === true || c.isMatched === false) {
					return (
						<div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: c.isMatched ? '#2e7d32' : '#d32f2f' }}>
							{c.isMatched ? <HiCheck /> : <HiX />}
							{c.matchingReason || (c.isMatched ? 'Matched' : 'Not matched')}
						</div>
					);
				}
				return <span style={{ color: '#999' }}></span>;
			},
		}] : []),
		...(!disabled ? [{
			key: '__remove__', label: '', width: 40,
			renderCell: (v, row) => (
				<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => onRemove(row._idx)} title="Remove">
					<HiX />
				</button>
			),
		}] : []),
	];

	const rows = conditions.map((cond, idx) => ({ _rowId: cond._key ?? idx, _cond: cond, _idx: idx }));

	return (
		<div style={{ marginTop: 8 }}>
			{title && <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>{title}</div>}
			{conditions.length === 0
				? <div style={{ fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 4 }}>No conditions added.</div>
				: (
					<PETableSimple
						columns={columns}
						rows={rows}
						getRowKey={(r) => r._rowId}
						wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 2 }}
					/>
				)
			}
			{!disabled && (
				<button type="button" className="pe-btn pe-btn--link" style={{ fontSize: 12, marginTop: 3 }} onClick={onAdd}>
					+ Add Condition
				</button>
			)}
		</div>
	);
};

/** Match status row (preview only) */
const MatchRow = ({ label, matched, reason }) => {
	const color = matched === true ? '#2e7d32' : matched === false ? '#d32f2f' : '#9e6a00';
	const text = matched === true ? 'Matched' : matched === false ? 'Mismatch' : 'Not Available';
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12, color: '#555' }}>
			{(matched === true || matched === false) ? (
				matched ? <HiCheck style={{ color, fontSize: 13 }} /> : <HiX style={{ color, fontSize: 13 }} />
			) : null}
			{label}: <span style={{ fontWeight: 600, color }}>{text}</span>
			{reason ? <span style={{ color: '#888' }}>({reason})</span> : null}
		</div>
	);
};

const MatchingStatusCard = ({ detail }) => {
	if (!detail) return null;
	const hasAnyMatchInfo = ['isItemMapped', 'isQuantityMapped', 'isInvoiceAmountMapped']
		.some(k => detail[k] !== undefined && detail[k] !== null);
	if (!hasAnyMatchInfo) return null;
	return (
		<div style={{ background: '#fff4e5', border: '1px solid #ffe0b2', borderRadius: 6, padding: '10px 14px', marginTop: 3 }}>
			<div style={{ fontSize: 12, fontWeight: 700, color: '#7a4a00', marginBottom: 8 }}>Matching Summary</div>
			<MatchRow label="Invoice Match" matched={detail.isItemMapped} reason={detail.invItemMatchResion} />
			<MatchRow label="Quantity Match" matched={detail.isQuantityMapped} reason={detail.invQtyMatchResion} />
			<MatchRow label="Amount Match" matched={detail.isInvoiceAmountMapped} reason={detail.invAmountMatchResion} />
		</div>
	);
};

const AddInvoiceDialog = ({
	open, onClose, poDetails, lineItems = [], onSubmit, uomOptions = [],
	mode = 'add', previewData = null, stagesPayload = null, atoken = null,
	customerid = null, userName = '', approvalPanel = null, headerActions = null,
	stagelist = null, currentStage = '',
}) => {
	const isPreview = mode === 'preview';
	const previewStage = currentStage || previewData?.header?.stage || previewData?.detail?.stage || '';
	const apiClient = useMemo(() => new ApiClient(api), []);

	const [selectedItems, setSelectedItems] = useState([]);
	const [invoiceNo, setInvoiceNo] = useState('');
	const [invoiceDate, setInvoiceDate] = useState(null);
	const [invoiceAmount, setInvoiceAmount] = useState('');
	const [invoiceAmountEdited, setInvoiceAmountEdited] = useState(false);
	const [supplierTaxId, setSupplierTaxId] = useState('');
	const [serviceDesc, setServiceDesc] = useState('');
	const [invoiceFileName, setInvoiceFileName] = useState('');
	const [invoiceFilePath, setInvoiceFilePath] = useState('');
	const [fileUploading, setFileUploading] = useState(false);
	const [aiAutofilling, setAiAutofilling] = useState(false);
	const [headerConditions, setHeaderConditions] = useState([]);
	const [itemData, setItemData] = useState({});
	const [itemConditionsOpen, setItemConditionsOpen] = useState({});
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [pushingToSap, setPushingToSap] = useState(false);

	const isPendingForPayment = String(previewStage).trim() === 'Pending for Payment';
	const invoice = previewData?.header ?? previewData?.detail ?? null;
	const hasExternalSourcePONumber = Boolean(String(poDetails?.externalSourcePONumber ?? '').trim());

	const getItemUnitPrice = (item) => Number(item?.materialPONetPrice ?? item?.unitPrice ?? item?.totalAmount ?? 0);
	const getOrderedQtyForItem = (item) => Number(item?.orderedQuantity ?? item?.quantity ?? 0);
	const getInvoicedQtyForItem = (item) => {
		if (item?.invoicedQty != null || item?.invoicedQuantity != null || item?.totalInvoiceQty != null) {
			return Number(item?.invoicedQty ?? item?.invoicedQuantity ?? item?.totalInvoiceQty ?? 0);
		}
		if (!isPreview && item?.orderedQuantity != null && item?.quantity != null) {
			return Math.max(getOrderedQtyForItem(item) - Number(item.quantity), 0);
		}
		return 0;
	};
	const getRemainingQtyForItem = (item) => Math.max(getOrderedQtyForItem(item) - getInvoicedQtyForItem(item), 0);
	const getMaxInvoiceQtyForItem = (item) => isPreview ? getOrderedQtyForItem(item) : getRemainingQtyForItem(item);

	const buildItemEntry = (item, overrides = {}) => {
		const poConds = getItemConditions(poDetails?.poItemConditions, item).map(mapPoConditionToInvoiceCondition);
		return { invoiceQty: '', uom: resolveUomString(item.uom) || '', itemAmount: '', conditions: poConds, backendTotal: null, ...overrides };
	};

	const calculateItemTotal = (itemId) => {
		const data = itemData[itemId];
		if (!data) return 0;
		if (data.backendTotal != null && !isNaN(Number(data.backendTotal))) return Number(data.backendTotal);
		const base = Number(data.invoiceQty || 0) * Number(data.itemAmount || 0);
		return applyConditions(base, data.conditions);
	};

	const calculateGrandTotal = () => {
		const lineSum = selectedItems.reduce((sum, item) => sum + calculateItemTotal(item.id), 0);
		return applyConditions(lineSum, headerConditions);
	};

	const grandTotal = calculateGrandTotal();

	useEffect(() => {
		if (!open || isPreview || invoiceAmountEdited) return;
		setInvoiceAmount(grandTotal ? Number(grandTotal).toFixed(2) : '');
	}, [grandTotal, open, isPreview, invoiceAmountEdited]);

	useEffect(() => {
		if (!open) return;
		if (isPreview && previewData) {
			const header = previewData.header ?? {};
			const detail = previewData.detail ?? {};
			const allDetails = Array.isArray(header.invoiceDetails) ? header.invoiceDetails : (detail && Object.keys(detail).length > 0 ? [detail] : []);
			const matchedPairs = allDetails.map(d => ({ detail: d, item: lineItems.find(it => String(it.id) === String(d?.creationDetailId)) })).filter(pair => pair.item);
			setSelectedItems(matchedPairs.map(p => p.item));
			const findConditions = Array.isArray(previewData.conditions) ? previewData.conditions : [];
			const previewHeaderConds = findConditions.filter(c => c?.isHeaderCondition === true).map(mapApiConditionToInvoiceCondition);
			const previewItemConds = findConditions.filter(c => c?.isHeaderCondition === false).map(mapApiConditionToInvoiceCondition);
			setHeaderConditions(previewHeaderConds);
			const initialItemData = {};
			matchedPairs.forEach(({ detail: d, item }) => {
				initialItemData[item.id] = { invoiceQty: d.quantity ?? item.quantity ?? '', uom: resolveUomString(d.uom ?? item.uom) || '', itemAmount: d.materialPONetPrice ?? d.invoiceAmount ?? getItemUnitPrice(item) ?? '', conditions: previewItemConds, backendTotal: d.invoiceAmount ?? d.totalAmount ?? null };
			});
			setItemData(initialItemData);
			const invDate = header.invoiceDate ?? detail.invoiceDate;
			setInvoiceNo(header.invoiceNo ?? detail.invoiceNo ?? '');
			setInvoiceDate(invDate ? String(invDate).slice(0, 10) : null);
			setInvoiceAmount(String(header.invoiceAmount ?? header.totaLInvoiceAmount ?? detail.invoiceAmount ?? ''));
			setInvoiceAmountEdited(false);
			setSupplierTaxId(header.supplierTaxId ?? detail.supplierTaxId ?? '');
			setServiceDesc(header.serviceDesc ?? detail.itemServiceName ?? '');
			setInvoiceFileName(header.invoiceFile ?? detail.invoiceFile ?? header.fileName ?? detail.fileName ?? '');
			setInvoiceFilePath(header.invoicePath ?? detail.invoicePath ?? header.filePath ?? detail.filePath ?? '');
			setErrors({});
			return;
		}
		if (lineItems.length > 0) {
			setSelectedItems(lineItems);
			const initialItemData = {};
			lineItems.forEach(item => { initialItemData[item.id] = buildItemEntry(item); });
			setItemData(initialItemData);
		} else {
			setSelectedItems([]);
			setItemData({});
		}
		setHeaderConditions((poDetails?.poConditions ?? []).map(mapPoConditionToInvoiceCondition));
		setInvoiceNo(''); setInvoiceDate(null); setInvoiceAmount(''); setInvoiceAmountEdited(false);
		setSupplierTaxId(''); setServiceDesc(''); setInvoiceFileName(''); setInvoiceFilePath('');
		setAiAutofilling(false); setItemConditionsOpen({}); setErrors({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, lineItems, isPreview, previewData, poDetails]);

	const handleHeaderConditionChange = (idx, field, value) => setHeaderConditions(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
	const handleAddHeaderCondition = () => setHeaderConditions(prev => [...prev, createEmptyCondition()]);
	const handleRemoveHeaderCondition = (idx) => setHeaderConditions(prev => prev.filter((_, i) => i !== idx));

	const handleItemConditionChange = (itemId, idx, field, value) => {
		setItemData(prev => {
			const entry = prev[itemId];
			if (!entry) return prev;
			return { ...prev, [itemId]: { ...entry, conditions: entry.conditions.map((c, i) => i === idx ? { ...c, [field]: value } : c), backendTotal: null } };
		});
	};
	const handleAddItemCondition = (itemId) => {
		setItemData(prev => {
			const entry = prev[itemId];
			if (!entry) return prev;
			return { ...prev, [itemId]: { ...entry, conditions: [...(entry.conditions ?? []), createEmptyCondition()], backendTotal: null } };
		});
	};
	const handleRemoveItemCondition = (itemId, idx) => {
		setItemData(prev => {
			const entry = prev[itemId];
			if (!entry) return prev;
			return { ...prev, [itemId]: { ...entry, conditions: entry.conditions.filter((_, i) => i !== idx), backendTotal: null } };
		});
	};

	const handleToggleItem = (item) => {
		if (isPreview) return;
		setSelectedItems(prev => {
			const isSel = prev.some(i => i.id === item.id);
			if (isSel) {
				const newData = { ...itemData }; delete newData[item.id];
				setItemData(newData);
				setItemConditionsOpen(o => { const n = { ...o }; delete n[item.id]; return n; });
				return prev.filter(i => i.id !== item.id);
			}
			setItemData(prevData => ({ ...prevData, [item.id]: buildItemEntry(item) }));
			return [...prev, item];
		});
	};

	const handleSelectAll = (e) => {
		if (isPreview) return;
		if (e.target.checked) {
			setSelectedItems(lineItems);
			const d = {}; lineItems.forEach(item => { d[item.id] = buildItemEntry(item); });
			setItemData(d);
		} else {
			setSelectedItems([]); setItemData({}); setItemConditionsOpen({});
		}
	};

	const applyAiAutofillResponse = (response) => {
		const data = response?.header ? response : (response?.data?.header ? response.data : response);
		if (!data) { toast.error('No data returned from Invoice AI.'); return; }
		const headerRaw = Array.isArray(data.header) ? data.header[0] : data.header;
		const headerDetails = Array.isArray(data.headerDetails) ? data.headerDetails : (Array.isArray(data.invoiceItem) ? data.invoiceItem : []);
		const aiHeaderConditions = Array.isArray(data.headerCondition) ? data.headerCondition.map(mapAiConditionToInvoiceCondition) : [];
		if (headerRaw) {
			if (headerRaw.invoiceNo != null && String(headerRaw.invoiceNo).trim() !== '') setInvoiceNo(String(headerRaw.invoiceNo).trim());
			const parsedDate = parseAiInvoiceDate(headerRaw.invoiceDate);
			if (parsedDate) setInvoiceDate(parsedDate);
			const amt = headerRaw.totalInvoiceAmount ?? headerRaw.totaLInvoiceAmount ?? headerRaw.invoiceAmount;
			if (amt != null && String(amt).trim() !== '') { setInvoiceAmount(String(amt)); setInvoiceAmountEdited(true); }
			const gstin = headerRaw.gstin ?? headerRaw.supplierTaxId ?? headerRaw.GSTIN;
			if (gstin != null && String(gstin).trim() !== '') setSupplierTaxId(String(gstin).trim());
		}
		if (aiHeaderConditions.length > 0) setHeaderConditions(aiHeaderConditions);
		const matchedItems = [], nextItemData = {}, nextOpen = {};
		headerDetails.forEach((detail) => {
			const matched = findLineItemForAiDetail(lineItems, detail);
			if (!matched) return;
			if (!matchedItems.some(i => String(i.id) === String(matched.id))) matchedItems.push(matched);
			const aiConds = Array.isArray(detail.itemCondition) ? detail.itemCondition.map(mapAiConditionToInvoiceCondition) : [];
			const base = buildItemEntry(matched);
			nextItemData[matched.id] = { ...base, invoiceQty: detail.quantity ?? base.invoiceQty, uom: resolveUomString(detail.uom) || base.uom, itemAmount: detail.materialPONetPrice ?? detail.itemAmount ?? base.itemAmount, conditions: aiConds.length > 0 ? aiConds : base.conditions, backendTotal: null };
			if ((nextItemData[matched.id].conditions ?? []).length > 0) nextOpen[matched.id] = true;
		});
		const firstServiceDesc = headerDetails.find(d => d?.itemServiceName)?.itemServiceName;
		if (firstServiceDesc) setServiceDesc(String(firstServiceDesc));
		if (matchedItems.length > 0) {
			setSelectedItems(matchedItems); setItemData(nextItemData); setItemConditionsOpen(nextOpen);
			toast.success('Invoice fields autofilled from AI. Please review before saving.');
		} else if (headerDetails.length > 0) {
			toast.warning('Header fields were autofilled, but AI line items did not match current PO items.');
		} else if (headerRaw) {
			toast.success('Invoice header autofilled from AI. Please review before saving.');
		} else {
			toast.warning('No usable invoice data was returned by AI.');
		}
		setErrors(prev => { const c = { ...prev }; delete c.invoiceNo; delete c.invoiceDate; delete c.invoiceAmount; delete c.submit; return c; });
	};

	const handleAutofillWithAI = async () => {
		if (isPreview) return;
		if (!(invoiceFilePath || '').trim() || !(invoiceFileName || '').trim()) { toast.error('Please upload the invoice attachment before using Autofill with AI.'); return; }
		const poId = poDetails?.id ?? poDetails?.poId ?? poDetails?.poCreationId;
		if (!poId) { toast.error('Purchase Order ID is missing.'); return; }
		if (!atoken) { toast.error('Authentication token is missing.'); return; }
		setAiAutofilling(true);
		try {
			const res = await apiClient.post('/api/poinvoice/InvoiceAI', { invoicePath: invoiceFilePath, invoiceFile: invoiceFileName, poId: Number(poId) }, atoken);
			if (res === false) return;
			applyAiAutofillResponse(res);
		} catch (error) {
			toast.error(getApiErrorMessage(error) || 'Failed to autofill invoice from AI.');
		} finally {
			setAiAutofilling(false);
		}
	};

	const QTY_EXCEEDS_REMAINING_MSG = 'Cannot exceed remaining quantity';

	const handleItemFieldChange = (itemId, field, value) => {
		if (field === 'invoiceQty') {
			const item = selectedItems.find(i => i.id === itemId);
			const maxQty = getMaxInvoiceQtyForItem(item);
			const exceedsMax = value !== '' && !isNaN(Number(value)) && maxQty > 0 && Number(value) > maxQty;
			const clampedValue = exceedsMax ? String(maxQty) : value;
			setItemData(prev => ({ ...prev, [itemId]: { ...prev[itemId], invoiceQty: clampedValue, backendTotal: null } }));
			setErrors(prev => {
				const key = `item_${itemId}_invoiceQty`;
				if (exceedsMax) return { ...prev, [key]: QTY_EXCEEDS_REMAINING_MSG };
				if (prev[key]) { const n = { ...prev }; delete n[key]; return n; }
				return prev;
			});
			return;
		}
		setItemData(prev => ({ ...prev, [itemId]: { ...prev[itemId], [field]: value, backendTotal: null } }));
		if (errors[`item_${itemId}_${field}`]) setErrors(prev => { const n = { ...prev }; delete n[`item_${itemId}_${field}`]; return n; });
	};

	const validateForm = () => {
		const newErrors = {};
		if (selectedItems.length === 0) newErrors.submit = 'Please select at least one line item';
		if (!invoiceNo || invoiceNo.trim() === '') newErrors.invoiceNo = 'Invoice Number is required';
		if (!invoiceDate) newErrors.invoiceDate = 'Invoice Date is required';
		if (!invoiceAmount || isNaN(Number(invoiceAmount)) || Number(invoiceAmount) < 0) newErrors.invoiceAmount = 'Valid invoice amount is required';
		if (!(invoiceFileName || '').trim() || !(invoiceFilePath || '').trim()) { newErrors.invoiceFile = 'Please upload the invoice attachment'; toast.error('Please upload the invoice attachment'); }
		selectedItems.forEach(item => {
			const data = itemData[item.id];
			if (!data) { newErrors[`item_${item.id}`] = 'Item data missing'; return; }
			const invoiceQty = Number(data.invoiceQty || 0);
			if (invoiceQty <= 0) newErrors[`item_${item.id}_invoiceQty`] = 'Required';
			else { const maxQty = getMaxInvoiceQtyForItem(item); if (maxQty > 0 && invoiceQty > maxQty) newErrors[`item_${item.id}_invoiceQty`] = QTY_EXCEEDS_REMAINING_MSG; }
			if (!resolveUomString(data.uom)) newErrors[`item_${item.id}_uom`] = 'Required';
			if (Number(data.itemAmount || 0) < 0) newErrors[`item_${item.id}_itemAmount`] = 'Must be >= 0';
		});
		if (Object.keys(newErrors).some(k => k.endsWith('_invoiceQty') && newErrors[k] === QTY_EXCEEDS_REMAINING_MSG)) newErrors.submit = QTY_EXCEEDS_REMAINING_MSG;
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (isPreview) return;
		if (!validateForm()) return;
		setSubmitting(true);
		try {
			const invoiceItem = selectedItems.map(item => {
				const data = itemData[item.id];
				return { invoiceNo: invoiceNo?.trim(), pOid: poDetails?.id ?? 0, poCreationId: item.id ?? item.poCreationDetailId ?? 0, shipHId: poDetails?.shipHId ?? 0, invoiceQuantity: Number(data.invoiceQty || 0), itemAmount: Number(data.itemAmount || 0), itemCode: item.itemCode || '', itemDesc: item.itemDesc || '', lineItemNo: item.itemNo || item.itemCode || '', uom: resolveUomString(data.uom), itemCondition: (data.conditions || []).map(toApiCondition) };
			});
			const resolvedStages = stagesPayload ?? { eventType: 'INV', currentStage: 'Under Approval', nextStage: '', orgId: 0, orgGroupId: 0 };
			const invoiceData = { invoiceNo: invoiceNo?.trim(), poId: poDetails?.id ?? 0, poCreationId: poDetails?.poCreationId ?? poDetails?.id ?? 0, shipHId: poDetails?.shipHId ?? 0, filePath: invoiceFilePath || '', fileName: invoiceFileName || '', invoiceDate: new Date(invoiceDate).toISOString(), totaLInvoiceAmount: Number(invoiceAmount) || calculateGrandTotal(), supplierTaxId: supplierTaxId || '', serviceDesc: serviceDesc || '', stages: resolvedStages, customerId: poDetails?.customerId ?? 0, headerCondition: headerConditions.map(toApiCondition), invoiceItem };
			const response = await onSubmit(invoiceData);
			if (response?.invoiceItem) {
				const updatedItemData = { ...itemData };
				response.invoiceItem.forEach(respItem => {
					const matched = selectedItems.find(it => String(it.itemNo || it.itemCode) === String(respItem.lineItemNo || respItem.itemCode));
					if (matched && updatedItemData[matched.id]) updatedItemData[matched.id] = { ...updatedItemData[matched.id], backendTotal: respItem.totalAmount ?? respItem.lineTotal ?? respItem.itemAmount };
				});
				setItemData(updatedItemData);
			}
			onClose();
		} catch (error) {
			setErrors({ submit: error.message || 'Failed to create Invoice' });
		} finally {
			setSubmitting(false);
		}
	};

	const handlePushToSap = async () => {
		const poId = poDetails?.id ?? poDetails?.poId ?? poDetails?.poCreationId;
		const invoiceId = previewData?.header?.id ?? previewData?.header?.invoiceHId ?? previewData?.header?.invoiceId;
		const cid = customerid ?? poDetails?.customerId;
		if (!hasExternalSourcePONumber) { toast.error('Push to SAP is available only for SAP purchase orders.'); return; }
		if (!poId || !invoiceId || !cid) { toast.error('Missing required information to push invoice to SAP.'); return; }
		if (!atoken) { toast.error('Authentication token is missing.'); return; }
		setPushingToSap(true);
		try {
			const queryParams = new URLSearchParams({ poid: String(poId), invoiceid: String(invoiceId), customerid: String(cid) }).toString();
			const res = await apiClient.post(`/api/poinvoice/sendinv?${queryParams}`, {}, atoken);
			if (res === false) return;
			toast.success('Invoice pushed to SAP successfully.');
		} catch (error) {
			toast.error(getApiErrorMessage(error) || 'Failed to push invoice to SAP.');
		} finally {
			setPushingToSap(false);
		}
	};

	const handleFileChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const poId = poDetails?.id ?? poDetails?.poId ?? poDetails?.poCreationId ?? 0;
		const cid = customerid ?? poDetails?.customerId ?? 0;
		if (!poId || !cid) { toast.error('Unable to upload invoice: missing PO ID or Customer ID.'); e.target.value = ''; return; }
		setInvoiceFileName(file.name); setInvoiceFilePath(''); setFileUploading(true);
		if (errors.invoiceFile) setErrors(prev => ({ ...prev, invoiceFile: undefined }));
		try {
			const safeFileName = replaceMultipleDotsExceptExtension(file.name);
			const queryParams = new URLSearchParams({ EventType: 'PO', EventId: String(poId), Description: 'POInvoice', CustomerId: String(cid) }).toString();
			const formData = new FormData();
			formData.append('file', file, safeFileName);
			const uploadUrl = `${process.env.REACT_APP_API_CALL}api/BlobStorage/Customer?${queryParams}`;
			const res = await axios.post(uploadUrl, formData, { headers: { accept: 'multipart/form-data', 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${atoken}` } });
			const returnedPath = res?.data?.result?.blobName || res?.data?.data?.blobName || res?.data?.blobName || res?.data?.result?.blobPath || res?.data?.data?.blobPath || '';
			const blobPath = String(returnedPath || '').replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/^\/+/, '');
			if (!blobPath) throw new Error('Upload succeeded but no file path was returned.');
			setInvoiceFilePath(blobPath);
			setInvoiceFileName(getFileName(blobPath) || safeFileName);
		} catch (error) {
			setInvoiceFilePath(''); setErrors(prev => ({ ...prev, invoiceFile: 'Failed to upload attachment. Please try again.' }));
		} finally {
			setFileUploading(false); e.target.value = '';
		}
	};

	const isSelected = (item) => selectedItems.some(i => i.id === item.id);
	const allSelected = lineItems.length > 0 && selectedItems.length === lineItems.length;
	const someSelected = selectedItems.length > 0 && !allSelected;
	const displayItems = isPreview ? selectedItems : lineItems;

	// Controlled expand keys for line items (for programmatic open from AI autofill)
	const expandedItemKeys = useMemo(
		() => new Set(Object.keys(itemConditionsOpen).filter(k => itemConditionsOpen[k])),
		[itemConditionsOpen]
	);

	// Line item columns
	const lineItemColumns = [
		...(!isPreview ? [{
			key: '__check__', label: '', width: 44,
			renderHeader: () => (
				<input type="checkbox" checked={allSelected} ref={el => { if (el) el.indeterminate = someSelected; }} onChange={handleSelectAll} />
			),
			renderCell: (_, row) => (
				<input type="checkbox" checked={isSelected(row._item)} onChange={() => handleToggleItem(row._item)} onClick={(e) => e.stopPropagation()} />
			),
		}] : []),
		// expand toggle column (controlled mode — we add it ourselves)
		{
			key: '__expand__', label: '', width: 44,
			renderCell: (_, row) => {
				const expanded = itemConditionsOpen[String(row._item.id)] ?? false;
				return (
					<button
						type="button"
						className="pe-icon-btn pe-icon-btn--expand"
						onClick={(e) => { e.stopPropagation(); setItemConditionsOpen(p => ({ ...p, [String(row._item.id)]: !p[String(row._item.id)] })); }}
					>
						<MdExpandMore style={{ fontSize: 18, transition: 'transform 0.3s', transform: expanded ? 'rotate(90deg)' : 'none' }} />
					</button>
				);
			},
		},
		{
			key: 'itemNo', label: 'Line Item',
			renderCell: (v) => <span style={{ fontWeight: 600, color: '#1976d2' }}>{v ?? ''}</span>,
		},
		{
			key: 'itemDesc', label: 'Material / Description',
			renderCell: (v, row) => (
				<div>
					<div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a1a' }}>{v ?? ''}</div>
					{row._item.materialCode && <div style={{ fontSize: 11, color: '#888' }}>MAT-{row._item.materialCode}</div>}
				</div>
			),
		},
		{ key: 'orderedQty', label: 'Ordered Qty' },
		...(!isPreview ? [{ key: 'remainingQty', label: 'Remaining Qty', width: 110 }] : []),
		{
			key: 'invoiceQty', label: 'Invoice Qty', width: 120,
			renderCell: (_, row) => {
				const data = itemData[row._item.id] || {};
				const showFields = isPreview || isSelected(row._item);
				if (!showFields) return <span style={{ color: '#999', fontSize: 12 }}>—</span>;
				if (isPreview) return <span style={{ fontSize: 12 }}>{data.invoiceQty ?? ''}</span>;
				const err = errors[`item_${row._item.id}_invoiceQty`];
				return (
					<div>
						<input type="number" className="pe-detail-form-input" value={data.invoiceQty ?? ''} min={0} max={getMaxInvoiceQtyForItem(row._item) || undefined} step={0.01} placeholder="Qty" onChange={(e) => { e.stopPropagation(); handleItemFieldChange(row._item.id, 'invoiceQty', e.target.value); }} onClick={(e) => e.stopPropagation()} />
						{err && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{err}</div>}
					</div>
				);
			},
		},
		{
			key: 'uom', label: 'UOM', width: 80,
			renderCell: (_, row) => {
				const data = itemData[row._item.id] || {};
				const showFields = isPreview || isSelected(row._item);
				if (!showFields) return <span style={{ color: '#999', fontSize: 12 }}>—</span>;
				const err = errors[`item_${row._item.id}_uom`];
				return <span style={{ fontSize: 12, color: err ? '#ef4444' : undefined }}>{resolveUomString(data.uom) || ''}</span>;
			},
		},
		{
			key: 'itemAmount', label: 'Item Amount', width: 120,
			renderCell: (_, row) => {
				const data = itemData[row._item.id] || {};
				const showFields = isPreview || isSelected(row._item);
				if (!showFields) return <span style={{ color: '#999', fontSize: 12 }}></span>;
				if (isPreview) return <span style={{ fontSize: 12 }}>{data.itemAmount ?? ''}</span>;
				return (
					<input type="number" className="pe-detail-form-input" value={data.itemAmount ?? ''} min={0} step={0.01} placeholder="Amount" onChange={(e) => { e.stopPropagation(); handleItemFieldChange(row._item.id, 'itemAmount', e.target.value); }} onClick={(e) => e.stopPropagation()} />
				);
			},
		},
		...(!isPreview ? [{
			key: '__total__', label: 'Total', width: 100,
			renderCell: (_, row) => {
				const showFields = isSelected(row._item);
				return <span style={{ fontWeight: 600, color: '#1976d2', fontSize: 12 }}>{showFields ? fmtCurrency(calculateItemTotal(row._item.id)) : ''}</span>;
			},
		}] : []),
	];

	const lineItemRows = displayItems.map((item) => ({
		_rowId: String(item.id),
		_item: item,
		itemNo: item.itemNo ?? '',
		itemDesc: item.itemDesc ?? '',
		orderedQty: fmtQty(getOrderedQtyForItem(item), item.uom),
		remainingQty: fmtQty(getRemainingQtyForItem(item), item.uom),
	}));

	const invoiceTitle = isPreview
		? `Preview Invoice${(previewData?.header?.invoiceNo || previewData?.detail?.invoiceNo) ? `
			: ${previewData?.header?.invoiceNo || previewData?.detail?.invoiceNo}` : ''}`
		: 'Add Invoice';

	return (
		<PEModal
			open={open}
			onClose={onClose}
			size="lg"
			title={invoiceTitle}
			dialogProps={{ PaperProps: { style: { minHeight: '75vh', maxHeight: '90vh' } } }}
			footer={
				<>
					<button type="button" className="pe-btn pe-btn--outline" onClick={onClose} disabled={submitting || pushingToSap}>
						{isPreview ? 'Close' : 'Cancel'}
					</button>
					{headerActions}
					{isPreview && isPendingForPayment && !invoice?.sapInvoiceNo && hasExternalSourcePONumber && (
						<button type="button" className="pe-btn pe-btn--primary" onClick={handlePushToSap} disabled={pushingToSap}>
							{pushingToSap ? <><span className="pe-btn-spinner" /> Pushing to SAP...</> : 'Push to SAP'}
						</button>
					)}
					{!isPreview && (
						<button type="button" className="pe-btn pe-btn--primary" onClick={handleSubmit} disabled={submitting || fileUploading || selectedItems.length === 0}>
							{submitting ? <><span className="pe-btn-spinner" /> Creating Invoice...</>
								: fileUploading ? <><span className="pe-btn-spinner" /> Uploading...</>
									: <> Create Invoice </>}
						</button>
					)}
				</>
			}
		>
			<div style={approvalPanel ? { display: 'flex', alignItems: 'stretch', gap: 0, margin: '-16px -20px', minHeight: 0, flex: 1 } : {}}>
				<div style={approvalPanel ? { flex: 1, minWidth: 0, overflowY: 'auto', padding: '16px 20px' } : {}}>
					{errors.submit && (
						<div style={{
							marginBottom: 12, padding: '8px 12px',
							background: '#fee2e2', border: '1px solid #fca5a5',
							borderRadius: 6, fontSize: 13, color: '#991b1b'
						}}>
							{errors.submit}
						</div>
					)}

					{/* Invoice Information */}
					{(isPreview || selectedItems.length > 0) && (
						<div className="pe-info-card" style={{ marginBottom: 16, height: 'auto' }}>
							<div className="pe-info-card-title">Invoice Information</div>
							<div className="pe-info-card-grid" style={{ marginBottom: 4 }}>
								<div>
									<label className="pe-field-label" htmlFor="field-invoiceNo">Invoice Number <span className="rfq-required-star">*</span> </label>
									<input id="field-invoiceNo" type="text" className="pe-detail-form-input"
										value={invoiceNo} placeholder="Enter Invoice Number" disabled={isPreview}
										onChange={(e) => { setInvoiceNo(e.target.value); if (errors.invoiceNo) setErrors(p => ({ ...p, invoiceNo: undefined })); }} />
									{errors.invoiceNo && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{errors.invoiceNo}</div>}
								</div>
								<div>
									<label className="pe-field-label" htmlFor="field-invoiceDate">Invoice Date <span className="rfq-required-star">*</span> </label>
									<input id="field-invoiceDate" type="date" className="pe-detail-form-input" value={invoiceDate ?? ''} disabled={isPreview} onChange={(e) => { setInvoiceDate(e.target.value); if (errors.invoiceDate) setErrors(p => ({ ...p, invoiceDate: undefined })); }} />
									{errors.invoiceDate && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{errors.invoiceDate}</div>}
								</div>
								<div>
									<label className="pe-field-label" htmlFor="field-invoiceAmount">Invoice Amount <span className="rfq-required-star">*</span> </label>
									<input id="field-invoiceAmount" type="number" className="pe-detail-form-input" value={invoiceAmount} disabled={isPreview} min={0} step={0.01} onChange={(e) => { setInvoiceAmount(e.target.value); setInvoiceAmountEdited(true); if (errors.invoiceAmount) setErrors(p => ({ ...p, invoiceAmount: undefined })); }} />
									{errors.invoiceAmount && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{errors.invoiceAmount}</div>}
									{!isPreview && !errors.invoiceAmount && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{invoiceAmountEdited ? 'Manually overridden' : 'Auto-calculated from line items'}</div>}
								</div>
								<div>
									<label className="pe-field-label" htmlFor="field-supplierTaxId">Supplier GSTIN</label>
									<input id="field-supplierTaxId" type="text" className="pe-detail-form-input"
										value={supplierTaxId} disabled={isPreview}
										onChange={(e) => setSupplierTaxId(e.target.value)} />
								</div>
								<div>
									<label className="pe-field-label" htmlFor="field-serviceDesc">Service / Item Description</label>
									<input id="field-serviceDesc" type="text"
										className="pe-detail-form-input" value={serviceDesc}
										disabled={isPreview}
										onChange={(e) => setServiceDesc(e.target.value)} />
								</div>
								<div>
									<label className="pe-field-label">Supplier Attachments {!isPreview && <span style={{ color: '#ef4444' }}>*</span>}</label>
									{isPreview ? (
										invoiceFileName || invoiceFilePath ? (
											<button type="button" className="pe-btn--link"
												style={{ fontSize: 13, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
												disabled={!invoiceFilePath || !atoken}
												onClick={() => {
													if (!invoiceFilePath) return;
													downloadFilesOnAzure(invoiceFilePath, getFileName(invoiceFileName) || invoiceFileName, atoken);
												}}>
												<HiOutlineLink /> {getFileName(invoiceFileName) || invoiceFileName}
											</button>
										) : (
											<span style={{ fontSize: 13, color: '#888' }}>No attachment</span>
										)
									) : (
										<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
											<label className="pe-btn pe-btn--outline" style={{ cursor: fileUploading || aiAutofilling ? 'not-allowed' : 'pointer', opacity: fileUploading || aiAutofilling ? 0.6 : 1, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
												<HiOutlineLink style={{ fontSize: 13 }} />
												{fileUploading ? 'Uploading...' : (invoiceFileName || 'Attach Invoice Copy')}
												<input type="file" hidden onChange={handleFileChange} disabled={fileUploading || aiAutofilling} />
											</label>
											<button type="button" className="pe-btn pe-btn--primary" onClick={handleAutofillWithAI} disabled={fileUploading || aiAutofilling || !(invoiceFilePath || '').trim() || !(invoiceFileName || '').trim()}>
												{aiAutofilling ? <><span className="pe-btn-spinner" /> Extracting...</> : 'Autofill with AI'}
											</button>
										</div>
									)}
									{errors.invoiceFile && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{errors.invoiceFile}</div>}
								</div>
							</div>

							{isPreview && <MatchingStatusCard detail={previewData?.detail} />}

							<EditableConditionsTable
								title="Header Level Conditions"
								conditions={headerConditions.map(cond => ({ ...cond, baseAmount: selectedItems.reduce((sum, item) => sum + calculateItemTotal(item.id), 0) }))}
								onChange={handleHeaderConditionChange}
								onAdd={handleAddHeaderCondition}
								onRemove={handleRemoveHeaderCondition}
								disabled={isPreview}
							/>
						</div>
					)}

					{/* Line Items */}
					<div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 3 }}>Line Items</div>

					{displayItems.length === 0 ? (
						<div style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#9ca3af' }}>No line items available for Invoice</div>
					) : (
						<PETableSimple
							columns={lineItemColumns}
							rows={lineItemRows}
							getRowKey={(row) => row._rowId}
							wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: 2 }}
							expandedKeys={expandedItemKeys}
							onExpandToggle={(key) => setItemConditionsOpen(p => ({ ...p, [key]: !p[key] }))}
							getExpandContent={(row) => {
								const data = itemData[row._item.id] || {};
								const itemConds = data.conditions ?? [];
								return (
									<div style={{ padding: '10px 16px 10px 20px', background: '#f9fafb', borderLeft: '3px solid #1976d2' }}>
										<EditableConditionsTable
											title=""
											conditions={itemConds.map(cond => ({ ...cond, baseAmount: Number(data.invoiceQty || 0) * Number(data.itemAmount || 0) }))}
											onChange={(idx, field, value) => handleItemConditionChange(row._item.id, idx, field, value)}
											onAdd={() => handleAddItemCondition(row._item.id)}
											onRemove={(idx) => handleRemoveItemCondition(row._item.id, idx)}
											disabled={isPreview}
										/>
									</div>
								);
							}}
						/>
					)}

					{!isPreview && selectedItems.length > 0 && (
						<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', background: '#f9fafb', borderRadius: 6, marginBottom: 4 }}>
							<span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
								Calculated Total: <span style={{ color: '#1976d2', marginLeft: 6 }}>{fmtCurrency(grandTotal)}</span>
							</span>
						</div>
					)}
				</div>

				{approvalPanel && (
					<div style={{ width: '30%', flexShrink: 0, borderLeft: '2px solid #e0e0e0', overflowY: 'auto', padding: 16, background: '#fafafa' }}>
						{approvalPanel}
					</div>
				)}
			</div>
		</PEModal>
	);
};

export default AddInvoiceDialog;
