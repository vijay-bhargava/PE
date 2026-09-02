import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog, DialogTitle, DialogContent, DialogActions,
	Box, Typography, Button, Collapse, CircularProgress,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Checkbox, Paper, TextField, Alert, IconButton, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { HiX, HiCheck, HiOutlineLink, HiOutlineChevronDown, HiOutlineChevronUp, HiPlusSm, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { downloadFilesOnAzure, getFileName, replaceMultipleDotsExceptExtension, getApiErrorMessage } from '../../utils/common';
import { MemoizedEventStageFlow } from '../../utils/common/component';
import { ApiClient, api } from '../../Apiclient';
import axios from 'axios';

/** UOM may arrive as a string or as an object e.g. { id, uom, isActive }. */
const resolveUomString = (val) => {
	if (val == null || val === '') return '';
	if (typeof val === 'string') return val;
	if (typeof val === 'object') return val.uom ?? val.code ?? val.name ?? val.UOM ?? '';
	return String(val);
};

const fmtQty = (q, uom) => (q != null ? `${q} ${resolveUomString(uom)}`.trim() : '—');

const fmtCurrency = (amt) => {
	if (amt == null || amt === '') return '—';
	const num = Number(amt);
	if (isNaN(num)) return '—';
	return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const TH = ({ children, sx = {} }) => (
	<TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', py: 1.5, px: 2, bgcolor: '#f8f8f8', ...sx }}>
		{children}
	</TableCell>
);

const TD = ({ children, sx = {} }) => (
	<TableCell sx={{ fontSize: 12, py: 1.5, px: 2, color: '#333', ...sx }}>
		{children}
	</TableCell>
);

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
	// Leave amount empty so the user enters it manually on Add Invoice
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

/** Maps InvoiceAI condition payloads (conditionAmount / conditionRate) into form conditions. */
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

/** Normalize InvoiceAI date strings (e.g. DD.MM.YYYY) to YYYY-MM-DD for date inputs. */
const parseAiInvoiceDate = (val) => {
	if (!val) return null;
	const s = String(val).trim();
	const dotted = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
	if (dotted) {
		return `${dotted[3]}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`;
	}
	const slashed = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (slashed) {
		return `${slashed[3]}-${slashed[2].padStart(2, '0')}-${slashed[1].padStart(2, '0')}`;
	}
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

/** Item-Level (isHeaderCondition === false) PO conditions belonging to a given line item. */
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
			const rate = Number(cond.conditionValue ?? 0);

			// GST always calculates on original item amount
			total += (originalAmount * rate) / 100;
		} else {
			total += Number(cond.conditionValue ?? 0);
		}
	});

	return total;
};

// const applyConditions = (baseAmount, conditions = []) => {
// 	let total = Number(baseAmount || 0);
// 	(conditions ?? []).forEach(cond => {
// 		if (normalizeCalculationType(cond.calculationType) === 'Percentage') {
// 			const rate = Number(cond.conditionValue ?? 0);
// 			total += (total * rate) / 100;
// 		} else {
// 			total += Number(cond.conditionValue ?? 0);
// 		}
// 	});
// 	return total;
// };

const toApiCondition = (cond) => ({

	conditionType: cond.conditionType || '',
	conditionValue: Number(cond.conditionValue || 0),
	currency: cond.currency || 'INR',
	calculationType: normalizeCalculationType(cond.calculationType),
	conditionRate: 0,
});

/** Editable conditions table with add/remove support. */
const EditableConditionsTable = ({
	conditions = [],
	onChange,
	onAdd,
	onRemove,
	disabled = false,
	title,
}) => {
	const showMatchingReason = disabled && hasKnownMatchStatus(conditions);

	return (
	<Box sx={{ mt: 1 }}>
		<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
			<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{title}</Typography>
		</Box>
		{conditions.length === 0 ? (
			<Typography sx={{ fontSize: 12, color: '#888', fontStyle: 'italic', mb: 1 }}>
				No conditions added.
			</Typography>
		) : (
			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TH>Condition Type</TH>
							<TH>Calculation Type</TH>
						<TH>Condition Amount</TH>
<TH>Currency</TH>
<TH>Total</TH>

							{showMatchingReason && <TH>Matching Reason</TH>}
							{!disabled && <TH sx={{ width: 48 }} />}
						</TableRow>
					</TableHead>
					<TableBody>
						{conditions.map((cond, idx) => (
							<TableRow key={cond._key ?? idx} hover>
								<TD>
									{disabled ? (cond.conditionType || '—') : (
										<TextField
											value={cond.conditionType ?? ''}
											onChange={(e) => onChange(idx, 'conditionType', e.target.value)}
											size="small"
											fullWidth
											placeholder="e.g. GST"
										/>
									)}
								</TD>
								<TD>
									{disabled ? (cond.calculationType || '—') : (
										<FormControl size="small" fullWidth>
											<Select
												value={normalizeCalculationType(cond.calculationType)}
												onChange={(e) => onChange(idx, 'calculationType', e.target.value)}
											>
												{CALC_TYPES.map(t => (
													<MenuItem key={t} value={t}>{t}</MenuItem>
												))}
											</Select>
										</FormControl>
									)}
								</TD>
								<TD>
									{disabled ? fmtCurrency(cond.conditionValue) : (
										<TextField
											type="number"
											value={cond.conditionValue ?? ''}
											onChange={(e) => onChange(idx, 'conditionValue', e.target.value)}
											size="small"
											fullWidth
											inputProps={{ step: '0.01' }}
										/>
									)}
								</TD>
								<TD>
									{disabled ? (cond.currency || 'INR') : (
										<TextField
											value={cond.currency ?? 'INR'}
											onChange={(e) => onChange(idx, 'currency', e.target.value)}
											size="small"
											fullWidth
										/>
									)}
								</TD>
			<TD sx={{ fontWeight: 600, color: '#1976d2' }}>
  {normalizeCalculationType(cond.calculationType) === 'Percentage'
    ? fmtCurrency(
        (Number(cond.baseAmount || 0) * Number(cond.conditionValue || 0)) / 100
      )
    : fmtCurrency(cond.conditionValue)}
</TD>


								{showMatchingReason && (
									<TD>
										{cond.isMatched === true || cond.isMatched === false ? (
											<Alert
												severity={cond.isMatched ? 'success' : 'error'}
												icon={cond.isMatched ? <HiCheck /> : <HiX />}
												sx={{
													py: 0,
													px: 1,
													fontSize: 11,
													alignItems: 'center',
													'& .MuiAlert-message': { py: 0.5 },
													'& .MuiAlert-icon': { py: 0.5, mr: 0.5, fontSize: 14 },
												}}
											>
												{cond.matchingReason || (cond.isMatched ? 'Matched' : 'Not matched')}
											</Alert>
										) : (
											<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
										)}
									</TD>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		)}
	</Box>
	);
};

/** Maps a tri-state match flag (true/false/null-unknown) to a small status chip. */
const MatchRow = ({ label, matched, reason }) => {
	const known = matched === true || matched === false;
	const color = matched === true ? '#2e7d32' : matched === false ? '#d32f2f' : '#9e6a00';
	const text = matched === true ? 'Matched' : matched === false ? 'Mismatch' : 'Not Available';
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
			{known ? (
				matched ? <HiCheck style={{ color, fontSize: 14 }} /> : <HiX style={{ color, fontSize: 14 }} />
			) : (
				<HiOutlineLink style={{ color, fontSize: 14, visibility: 'hidden' }} />
			)}
			<Typography sx={{ fontSize: 12, color: '#555' }}>
				{label}: <Box component="span" sx={{ fontWeight: 600, color }}>{text}</Box>
				{reason ? <Box component="span" sx={{ color: '#888', ml: 0.5 }}>({reason})</Box> : null}
			</Typography>
		</Box>
	);
};

/** Small light-orange Matching Status card shown only in Invoice Preview, using Invoice Find API data. */
const MatchingStatusCard = ({ detail }) => {
	if (!detail) return null;
	const hasAnyMatchInfo = ['isItemMapped', 'isQuantityMapped', 'isInvoiceAmountMapped']
		.some(k => detail[k] !== undefined && detail[k] !== null);
	if (!hasAnyMatchInfo) return null;

	return (
		<Box
			sx={{
				bgcolor: '#fff4e5',
				border: '1px solid #ffe0b2',
				borderRadius: 1,
				p: 1.5,
				mb: 2,
				maxWidth: 800,
			}}
		>
			<Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7a4a00', mb: 1 }}>
				Matching Summary
			</Typography>
			<MatchRow label="Invoice Match" matched={detail.isItemMapped} reason={detail.invItemMatchResion} />
			<MatchRow label="Quantity Match" matched={detail.isQuantityMapped} reason={detail.invQtyMatchResion} />
			<MatchRow label="Amount Match" matched={detail.isInvoiceAmountMapped} reason={detail.invAmountMatchResion} />
		</Box>
	);
};

const AddInvoiceDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, uomOptions = [], mode = 'add', previewData = null, stagesPayload = null, atoken = null, customerid = null, userName = '', approvalPanel = null, headerActions = null, stagelist = null, currentStage = '' }) => {
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

	/** The PO Ordered Quantity for this line.
	 *  In the Add-flow, items arrive with `quantity` already replaced by the
	 *  remaining (uninvoiced) amount and the true ordered amount preserved on
	 *  `orderedQuantity`; in Preview/other flows `quantity` IS the ordered qty. */
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

	/** Remaining Qty = Ordered Qty − Total Invoiced Qty (Add Invoice only). */
	const getRemainingQtyForItem = (item) =>
		Math.max(getOrderedQtyForItem(item) - getInvoicedQtyForItem(item), 0);

	/** Maximum invoice quantity allowed for this line (remaining uninvoiced qty in Add flow). */
	const getMaxInvoiceQtyForItem = (item) => {
		if (!isPreview) return getRemainingQtyForItem(item);
		return getOrderedQtyForItem(item);
	};

	const buildItemEntry = (item, overrides = {}) => {
		const poConds = getItemConditions(poDetails?.poItemConditions, item).map(mapPoConditionToInvoiceCondition);
		return {
			// Leave qty/amount empty on create so the user enters them manually
			invoiceQty: '',
			uom: resolveUomString(item.uom) || '',
			itemAmount: '',
			conditions: poConds,
			backendTotal: null,
			...overrides,
		};
	};

	const calculateItemTotal = (itemId) => {
		const data = itemData[itemId];
		if (!data) return 0;
		if (data.backendTotal != null && !isNaN(Number(data.backendTotal))) {
			return Number(data.backendTotal);
		}
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

			// The invoice header's own `invoiceDetails` array is the source of truth
			// for which — and how many — PO line items this invoice covers, including
			// an explicit empty array meaning zero items. Fall back to the single
			// `detail` only if the header didn't carry an `invoiceDetails` array at all.
			const allDetails = Array.isArray(header.invoiceDetails)
				? header.invoiceDetails
				: (detail && Object.keys(detail).length > 0 ? [detail] : []);

			// creationDetailId is the primary/correct key: a PO line item (by its
			// `id`) belongs in the preview only when some invoiceDetails row's
			// creationDetailId matches it. This guarantees an invoice with N
			// invoiceDetails shows exactly those N matched PO lines.
			const matchedPairs = allDetails
				.map(d => ({
					detail: d,
					item: lineItems.find(it => String(it.id) === String(d?.creationDetailId)),
				}))
				.filter(pair => pair.item);

			const itemsToShow = matchedPairs.map(p => p.item);
			setSelectedItems(itemsToShow);

			// Conditions in Preview mode come exclusively from the FindInvoiceCondition API
			// (passed in via previewData.conditions), never from the Invoice Find API response.
			const findConditions = Array.isArray(previewData.conditions) ? previewData.conditions : [];
			const previewHeaderConds = findConditions
				.filter(c => c?.isHeaderCondition === true)
				.map(mapApiConditionToInvoiceCondition);
			const previewItemConds = findConditions
				.filter(c => c?.isHeaderCondition === false)
				.map(mapApiConditionToInvoiceCondition);
			setHeaderConditions(previewHeaderConds);

			const initialItemData = {};
			// Each matched PO line uses ITS OWN invoiceDetails row for
			// quantity/UOM/amount — not the first detail on the invoice.
			matchedPairs.forEach(({ detail: d, item }) => {
				initialItemData[item.id] = {
					invoiceQty: d.quantity ?? item.quantity ?? '',
					uom: resolveUomString(d.uom ?? item.uom) || '',
					itemAmount: d.materialPONetPrice ?? d.invoiceAmount ?? getItemUnitPrice(item) ?? '',
					conditions: previewItemConds,
					backendTotal: d.invoiceAmount ?? d.totalAmount ?? null,
				};
			});
			setItemData(initialItemData);

			const invDate = header.invoiceDate ?? detail.invoiceDate;
			setInvoiceNo(header.invoiceNo ?? detail.invoiceNo ?? '');
			setInvoiceDate(invDate ? String(invDate).slice(0, 10) : null);
			// Invoice amount in Preview always reflects the Invoice Find API's invoiceAmount as-fetched.
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
			lineItems.forEach(item => {
				initialItemData[item.id] = buildItemEntry(item);
			});
			setItemData(initialItemData);
		} else {
			setSelectedItems([]);
			setItemData({});
		}

		const poHeaderConds = (poDetails?.poConditions ?? []).map(mapPoConditionToInvoiceCondition);
		setHeaderConditions(poHeaderConds);

		setInvoiceNo('');
		setInvoiceDate(null);
		setInvoiceAmount('');
		setInvoiceAmountEdited(false);
		setSupplierTaxId('');
		setServiceDesc('');
		setInvoiceFileName('');
		setInvoiceFilePath('');
		setAiAutofilling(false);
		setItemConditionsOpen({});
		setErrors({});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, lineItems, isPreview, previewData, poDetails]);

	const handleHeaderConditionChange = (idx, field, value) => {
		setHeaderConditions(prev => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
	};

	const handleAddHeaderCondition = () => {
		setHeaderConditions(prev => [...prev, createEmptyCondition()]);
	};

	const handleRemoveHeaderCondition = (idx) => {
		setHeaderConditions(prev => prev.filter((_, i) => i !== idx));
	};

	const handleItemConditionChange = (itemId, idx, field, value) => {
		setItemData(prev => {
			const entry = prev[itemId];
			if (!entry) return prev;
			const conditions = entry.conditions.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
			return { ...prev, [itemId]: { ...entry, conditions, backendTotal: null } };
		});
	};

	const handleAddItemCondition = (itemId) => {
		setItemData(prev => {
			const entry = prev[itemId];
			if (!entry) return prev;
			return {
				...prev,
				[itemId]: {
					...entry,
					conditions: [...(entry.conditions ?? []), createEmptyCondition()],
					backendTotal: null,
				},
			};
		});
	};

	const handleRemoveItemCondition = (itemId, idx) => {
		setItemData(prev => {
			const entry = prev[itemId];
			if (!entry) return prev;
			return {
				...prev,
				[itemId]: {
					...entry,
					conditions: entry.conditions.filter((_, i) => i !== idx),
					backendTotal: null,
				},
			};
		});
	};

	const handleToggleItem = (item) => {
		if (isPreview) return;
		setSelectedItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				const newSelected = prev.filter(i => i.id !== item.id);
				const newData = { ...itemData };
				delete newData[item.id];
				setItemData(newData);
				setItemConditionsOpen(o => {
					const next = { ...o };
					delete next[item.id];
					return next;
				});
				return newSelected;
			}
			setItemData(prevData => ({
				...prevData,
				[item.id]: buildItemEntry(item),
			}));
			return [...prev, item];
		});
	};

	const handleSelectAll = (event) => {
		if (isPreview) return;
		if (event.target.checked) {
			setSelectedItems(lineItems);
			const initialItemData = {};
			lineItems.forEach(item => {
				initialItemData[item.id] = buildItemEntry(item);
			});
			setItemData(initialItemData);
		} else {
			setSelectedItems([]);
			setItemData({});
			setItemConditionsOpen({});
		}
	};

	const applyAiAutofillResponse = (response) => {
		const data = response?.header ? response : (response?.data?.header ? response.data : response);
		if (!data) {
			toast.error('No data returned from Invoice AI.');
			return;
		}

		const headerRaw = Array.isArray(data.header) ? data.header[0] : data.header;
		const headerDetails = Array.isArray(data.headerDetails)
			? data.headerDetails
			: (Array.isArray(data.invoiceItem) ? data.invoiceItem : []);
		const aiHeaderConditions = Array.isArray(data.headerCondition)
			? data.headerCondition.map(mapAiConditionToInvoiceCondition)
			: [];

		if (headerRaw) {
			if (headerRaw.invoiceNo != null && String(headerRaw.invoiceNo).trim() !== '') {
				setInvoiceNo(String(headerRaw.invoiceNo).trim());
			}
			const parsedDate = parseAiInvoiceDate(headerRaw.invoiceDate);
			if (parsedDate) setInvoiceDate(parsedDate);

			const amt = headerRaw.totalInvoiceAmount ?? headerRaw.totaLInvoiceAmount ?? headerRaw.invoiceAmount;
			if (amt != null && String(amt).trim() !== '') {
				setInvoiceAmount(String(amt));
				setInvoiceAmountEdited(true);
			}

			const gstin = headerRaw.gstin ?? headerRaw.supplierTaxId ?? headerRaw.GSTIN;
			if (gstin != null && String(gstin).trim() !== '') {
				setSupplierTaxId(String(gstin).trim());
			}
		}

		if (aiHeaderConditions.length > 0) {
			setHeaderConditions(aiHeaderConditions);
		}

		const matchedItems = [];
		const nextItemData = {};
		const nextOpen = {};

		headerDetails.forEach((detail) => {
			const matched = findLineItemForAiDetail(lineItems, detail);
			if (!matched) return;
			if (!matchedItems.some(i => String(i.id) === String(matched.id))) {
				matchedItems.push(matched);
			}
			const aiConds = Array.isArray(detail.itemCondition)
				? detail.itemCondition.map(mapAiConditionToInvoiceCondition)
				: [];
			const base = buildItemEntry(matched);
			nextItemData[matched.id] = {
				...base,
				invoiceQty: detail.quantity ?? base.invoiceQty,
				uom: resolveUomString(detail.uom) || base.uom,
				itemAmount: detail.materialPONetPrice ?? detail.itemAmount ?? base.itemAmount,
				conditions: aiConds.length > 0 ? aiConds : base.conditions,
				backendTotal: null,
			};
			if ((nextItemData[matched.id].conditions ?? []).length > 0) {
				nextOpen[matched.id] = true;
			}
		});

		const firstServiceDesc = headerDetails.find(d => d?.itemServiceName)?.itemServiceName;
		if (firstServiceDesc) {
			setServiceDesc(String(firstServiceDesc));
		}

		if (matchedItems.length > 0) {
			setSelectedItems(matchedItems);
			setItemData(nextItemData);
			setItemConditionsOpen(nextOpen);
			toast.success('Invoice fields autofilled from AI. Please review before saving.');
		} else if (headerDetails.length > 0) {
			toast.warning('Header fields were autofilled, but AI line items did not match current PO items.');
		} else if (headerRaw) {
			toast.success('Invoice header autofilled from AI. Please review before saving.');
		} else {
			toast.warning('No usable invoice data was returned by AI.');
		}

		setErrors(prev => {
			const cleared = { ...prev };
			delete cleared.invoiceNo;
			delete cleared.invoiceDate;
			delete cleared.invoiceAmount;
			delete cleared.submit;
			return cleared;
		});
	};

	const handleAutofillWithAI = async () => {
		if (isPreview) return;
		if (!(invoiceFilePath || '').trim() || !(invoiceFileName || '').trim()) {
			toast.error('Please upload the invoice attachment before using Autofill with AI.');
			return;
		}
		const poId = poDetails?.id ?? poDetails?.poId ?? poDetails?.poCreationId;
		if (!poId) {
			toast.error('Purchase Order ID is missing.');
			return;
		}
		if (!atoken) {
			toast.error('Authentication token is missing.');
			return;
		}

		setAiAutofilling(true);
		try {
			const payload = {
				invoicePath: invoiceFilePath,
				invoiceFile: invoiceFileName,
				poId: Number(poId),
			};
			const res = await apiClient.post('/api/poinvoice/InvoiceAI', payload, atoken);
			if (res === false) return;
			applyAiAutofillResponse(res);
		} catch (error) {
			console.error('Invoice AI autofill failed', error);
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
			const numericValue = value === '' ? NaN : Number(value);
			const exceedsMax = !isNaN(numericValue) && maxQty > 0 && numericValue > maxQty;

			// Restrict the input itself: never let the stored quantity exceed the
			// remaining invoiceable quantity, so it's impossible to type/paste past the cap.
			const clampedValue = exceedsMax ? String(maxQty) : value;

			setItemData(prev => ({
				...prev,
				[itemId]: {
					...prev[itemId],
					invoiceQty: clampedValue,
					backendTotal: null,
				},
			}));

			setErrors(prev => {
				const key = `item_${itemId}_invoiceQty`;
				if (exceedsMax) {
					return { ...prev, [key]: QTY_EXCEEDS_REMAINING_MSG };
				}
				if (prev[key]) {
					const newErrors = { ...prev };
					delete newErrors[key];
					return newErrors;
				}
				return prev;
			});
			return;
		}

		setItemData(prev => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				[field]: value,
				backendTotal: null,
			},
		}));

		if (errors[`item_${itemId}_${field}`]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[`item_${itemId}_${field}`];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (selectedItems.length === 0) {
			newErrors.submit = 'Please select at least one line item';
		}

		if (!invoiceNo || invoiceNo.trim() === '') {
			newErrors.invoiceNo = 'Invoice Number is required';
		}

		if (!invoiceDate) {
			newErrors.invoiceDate = 'Invoice Date is required';
		}

		const amount = Number(invoiceAmount);
		if (!invoiceAmount || isNaN(amount) || amount < 0) {
			newErrors.invoiceAmount = 'Valid invoice amount is required';
		}

		if (!(invoiceFileName || '').trim() || !(invoiceFilePath || '').trim()) {
			newErrors.invoiceFile = 'Please upload the invoice attachment';
			toast.error('Please upload the invoice attachment');
		}

		selectedItems.forEach(item => {
			const data = itemData[item.id];
			if (!data) {
				newErrors[`item_${item.id}`] = 'Item data missing';
				return;
			}

			const invoiceQty = Number(data.invoiceQty || 0);
			if (invoiceQty <= 0) {
				newErrors[`item_${item.id}_invoiceQty`] = 'Required';
			} else {
				const maxQty = getMaxInvoiceQtyForItem(item);
				if (maxQty > 0 && invoiceQty > maxQty) {
					newErrors[`item_${item.id}_invoiceQty`] = QTY_EXCEEDS_REMAINING_MSG;
				}
			}

			if (!resolveUomString(data.uom)) {
				newErrors[`item_${item.id}_uom`] = 'Required';
			}

			if (Number(data.itemAmount || 0) < 0) {
				newErrors[`item_${item.id}_itemAmount`] = 'Must be >= 0';
			}
		});

		if (Object.keys(newErrors).some(k => k.endsWith('_invoiceQty') && newErrors[k] === QTY_EXCEEDS_REMAINING_MSG)) {
			newErrors.submit = QTY_EXCEEDS_REMAINING_MSG;
		}

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

				return {
					invoiceNo: invoiceNo?.trim(),
					pOid: poDetails?.id ?? 0,
					poCreationId: item.id ?? item.poCreationDetailId ?? 0,
					shipHId: poDetails?.shipHId ?? 0,
					invoiceQuantity: Number(data.invoiceQty || 0),
					itemAmount: Number(data.itemAmount || 0),
					itemCode: item.itemCode || '',
					itemDesc: item.itemDesc || '',
					lineItemNo: item.itemNo || item.itemCode || '',
					uom: resolveUomString(data.uom),
					itemCondition: (data.conditions || []).map(toApiCondition)
				};
			});


			const resolvedStages = stagesPayload ?? {
				eventType: "INV",
				currentStage: "Under Approval",
				nextStage: "",
				orgId: 0,
				orgGroupId: 0
			};


			const invoiceData = {
				invoiceNo: invoiceNo?.trim(),
				poId: poDetails?.id ?? 0,
				poCreationId: poDetails?.poCreationId ?? poDetails?.id ?? 0,
				shipHId: poDetails?.shipHId ?? 0,

				filePath: invoiceFilePath || "",
				fileName: invoiceFileName || "",

				invoiceDate: new Date(invoiceDate).toISOString(),

				totaLInvoiceAmount: Number(invoiceAmount) || calculateGrandTotal(),

				supplierTaxId: supplierTaxId || "",
				serviceDesc: serviceDesc || "",

				stages: resolvedStages,

				customerId: poDetails?.customerId ?? 0,

				headerCondition: headerConditions.map(toApiCondition),

				invoiceItem: invoiceItem
			};


			console.log(
				"FINAL SWAGGER PAYLOAD",
				JSON.stringify([invoiceData], null, 2)
			);


			const response = await onSubmit(invoiceData);


			if (response?.invoiceItem) {

				const updatedItemData = { ...itemData };

				response.invoiceItem.forEach(respItem => {

					const matched = selectedItems.find(it =>
						String(it.itemNo || it.itemCode) ===
						String(respItem.lineItemNo || respItem.itemCode)
					);


					if (matched && updatedItemData[matched.id]) {

						updatedItemData[matched.id] = {
							...updatedItemData[matched.id],
							backendTotal:
								respItem.totalAmount ??
								respItem.lineTotal ??
								respItem.itemAmount
						};
					}

				});

				setItemData(updatedItemData);
			}


			onClose();

		} catch(error) {

			console.error("Invoice submit error", error);

			setErrors({
				submit: error.message || "Failed to create Invoice"
			});

		} finally {

			setSubmitting(false);

		}
	};

	const handlePushToSap = async () => {
		const poId = poDetails?.id ?? poDetails?.poId ?? poDetails?.poCreationId;
		const invoiceId =
			previewData?.header?.id ??
			previewData?.header?.invoiceHId ??
			previewData?.header?.invoiceId;
		const cid = customerid ?? poDetails?.customerId;

		if (!hasExternalSourcePONumber) {
			toast.error('Push to SAP is available only for SAP purchase orders.');
			return;
		}
		if (!poId || !invoiceId || !cid) {
			toast.error('Missing required information to push invoice to SAP.');
			return;
		}
		if (!atoken) {
			toast.error('Authentication token is missing.');
			return;
		}

		setPushingToSap(true);
		try {
			const queryParams = new URLSearchParams({
				poid: String(poId),
				invoiceid: String(invoiceId),
				customerid: String(cid),
			}).toString();
			const res = await apiClient.post(`/api/poinvoice/sendinv?${queryParams}`, {}, atoken);
			if (res === false) return;
			toast.success('Invoice pushed to SAP successfully.');
		} catch (error) {
			console.error('Push to SAP failed', error);
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

	if (!poId || !cid) {
		toast.error('Unable to upload invoice: missing PO ID or Customer ID.');
		e.target.value = '';
		return;
	}

	setInvoiceFileName(file.name);
	setInvoiceFilePath('');
	setFileUploading(true);

	if (errors.invoiceFile) {
		setErrors(prev => ({ ...prev, invoiceFile: undefined }));
	}

	try {
		const safeFileName = replaceMultipleDotsExceptExtension(file.name);
		const queryParams = new URLSearchParams({
			EventType: 'PO',
			EventId: String(poId),
			Description: 'POInvoice',
			CustomerId: String(cid),
		}).toString();

		const formData = new FormData();
		formData.append('file', file, safeFileName);

		// POST /api/BlobStorage/Customer?EventType=PO&EventId=...&Description=POInvoice&CustomerId=...
		const uploadUrl = `${process.env.REACT_APP_API_CALL}api/BlobStorage/Customer?${queryParams}`;
		const res = await axios.post(uploadUrl, formData, {
			headers: {
				accept: 'multipart/form-data',
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${atoken}`,
			},
		});

		const returnedPath =
			res?.data?.result?.blobName ||
			res?.data?.data?.blobName ||
			res?.data?.blobName ||
			res?.data?.result?.blobPath ||
			res?.data?.data?.blobPath ||
			'';

		const blobPath = String(returnedPath || '')
			.replace(/\\/g, '/')
			.replace(/\/{2,}/g, '/')
			.replace(/^\/+/, '');

		if (!blobPath) {
			throw new Error('Upload succeeded but no file path was returned.');
		}

		setInvoiceFilePath(blobPath);
		setInvoiceFileName(getFileName(blobPath) || safeFileName);

		console.log('Invoice File Path:', blobPath);

	} catch (error) {
		console.error('Invoice attachment upload failed', error);
		setInvoiceFilePath('');
		setErrors(prev => ({
			...prev,
			invoiceFile: 'Failed to upload attachment. Please try again.'
		}));
	} finally {
		setFileUploading(false);
		e.target.value = '';
	}
};

	const isSelected = (item) => selectedItems.some(i => i.id === item.id);
	const allSelected = lineItems.length > 0 && selectedItems.length === lineItems.length;
	const someSelected = selectedItems.length > 0 && !allSelected;
	// const colCount = isPreview ? 7 : 8;
	const colCount = isPreview ? 6 : 9;

	// In Preview mode the table must render ONLY the invoice's own matched
	// line items (selectedItems, already narrowed to header.invoiceDetails[]
	// via creationDetailId) — not the full PO line-item pool passed in as
	// `lineItems`. In Add mode it still shows the full selectable pool.
	const displayItems = isPreview ? selectedItems : lineItems;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xl"
			fullWidth
			PaperProps={{ sx: { minHeight: '85vh', maxHeight: '95vh' } }}
		>
			<DialogTitle sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<Box sx={{ flexShrink: 0 }}>
						<Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
							{isPreview ? 'Preview Invoice' : 'Add Invoice'}
							{isPreview && (previewData?.header?.invoiceNo || previewData?.detail?.invoiceNo) && (
								<span style={{ color: '#1976d2' }}>
									{' : '}
									{previewData?.header?.invoiceNo || previewData?.detail?.invoiceNo}
								</span>
							)}
						</Typography>
						<Typography variant="caption" sx={{ color: '#666' }}>
							{isPreview
								? 'View invoice details in read-only mode'
								: 'Create an Invoice for one or multiple PO line items'}
						</Typography>
					</Box>
					{isPreview && Array.isArray(stagelist) && stagelist.length > 0 && (
						<Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', minWidth: 0, px: 1 }}>
							<MemoizedEventStageFlow
								stagelist={stagelist}
								currentStage={previewStage}
							/>
						</Box>
					)}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
						{headerActions}
						<IconButton onClick={onClose} size="small" sx={{ color: '#999' }}>
							<HiX />
						</IconButton>
					</Box>
				</Box>
			</DialogTitle>

			<DialogContent sx={approvalPanel
				? { p: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch' }
				: { p: 3, overflow: 'auto' }}
			>
				<Box sx={approvalPanel ? { flex: 1, minWidth: 0, overflowY: 'auto', p: 3 } : { display: 'contents' }}>
				<Box sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
					{errors.submit && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{errors.submit}
						</Alert>
					)}

					{(isPreview || selectedItems.length > 0) && (
						<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>
								Invoice Information
							</Typography>

							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
								<TextField
									label="Invoice Number"
									value={invoiceNo}
									onChange={(e) => {
										setInvoiceNo(e.target.value);
										if (errors.invoiceNo) setErrors(prev => ({ ...prev, invoiceNo: undefined }));
									}}
									error={!!errors.invoiceNo}
									helperText={errors.invoiceNo}
									size="small"
									fullWidth
									required
									placeholder="Enter Invoice Number"
									InputProps={{ readOnly: isPreview }}
									disabled={isPreview}
								/>
								<TextField
									label="Invoice Date"
									type="date"
									value={invoiceDate ?? ''}
									onChange={(e) => {
										setInvoiceDate(e.target.value);
										if (errors.invoiceDate) setErrors(prev => ({ ...prev, invoiceDate: undefined }));
									}}
									error={!!errors.invoiceDate}
									helperText={errors.invoiceDate}
									size="small"
									fullWidth
									required
									InputLabelProps={{ shrink: true }}
									InputProps={{ readOnly: isPreview }}
									disabled={isPreview}
								/>
								<TextField
									label="Invoice Amount"
									type="number"
									value={invoiceAmount}
									onChange={(e) => {
										setInvoiceAmount(e.target.value);
										setInvoiceAmountEdited(true);
										if (errors.invoiceAmount) setErrors(prev => ({ ...prev, invoiceAmount: undefined }));
									}}
									error={!!errors.invoiceAmount}
									helperText={errors.invoiceAmount || (isPreview ? 'From invoice data' : (invoiceAmountEdited ? 'Manually overridden' : 'Auto-calculated from line items'))}
									size="small"
									fullWidth
									required
									inputProps={{ min: 0, step: '0.01', readOnly: isPreview }}
									InputProps={{ readOnly: isPreview }}
									disabled={isPreview}
								/>
							</Box>

							<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
								<TextField
									label="Supplier GSTIN"
									value={supplierTaxId}
									onChange={(e) => setSupplierTaxId(e.target.value)}
									size="small"
									fullWidth
									InputProps={{ readOnly: isPreview }}
									disabled={isPreview}
								/>
								<TextField
									label="Service / Item Description"
									value={serviceDesc}
									onChange={(e) => setServiceDesc(e.target.value)}
									size="small"
									fullWidth
									InputProps={{ readOnly: isPreview }}
									disabled={isPreview}
								/>
							</Box>

							<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333', mb: 1 }}>
    Supplier Attachments <span style={{ color: 'red' }}>*</span>
</Typography>
							<Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
								{isPreview ? (
									invoiceFileName || invoiceFilePath ? (
										<Button
											variant="text"
											size="small"
											startIcon={<HiOutlineLink />}
											onClick={() => {
												if (!invoiceFilePath) return;
												downloadFilesOnAzure(
													invoiceFilePath,
													getFileName(invoiceFileName) || invoiceFileName,
													atoken
												);
											}}
											disabled={!invoiceFilePath || !atoken}
											sx={{
												textTransform: 'none',
												fontSize: 13,
												justifyContent: 'flex-start',
												px: 0,
												maxWidth: 360,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												color: '#007bff',
												'&:hover': {
													backgroundColor: 'transparent',
													textDecoration: 'underline',
												},
											}}
										>
											{getFileName(invoiceFileName) || invoiceFileName}
										</Button>
									) : (
										<Typography sx={{ fontSize: 13, color: '#888' }}>
											No attachment
										</Typography>
									)
								) : (
									<>
										<Box sx={{ maxWidth: 360, width: '100%', flex: '1 1 240px' }}>
											<Button
												component="label"
												variant="outlined"
												startIcon={<HiOutlineLink />}
												sx={{
													height: '40px',
													justifyContent: 'flex-start',
													textTransform: 'none',
													width: '100%',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{fileUploading ? 'Uploading...' : (invoiceFileName || 'Attach Invoice Copy')}
												<input type="file" hidden onChange={handleFileChange} disabled={fileUploading || aiAutofilling} />
											</Button>
											{errors.invoiceFile && (
												<Typography sx={{ fontSize: 11, color: '#d32f2f', mt: 0.5 }}>
													{errors.invoiceFile}
												</Typography>
											)}
										</Box>
										<Button
											variant="contained"
											onClick={handleAutofillWithAI}
											disabled={
												fileUploading ||
												aiAutofilling ||
												!(invoiceFilePath || '').trim() ||
												!(invoiceFileName || '').trim()
											}
											startIcon={aiAutofilling ? <CircularProgress size={14} color="inherit" /> : null}
											sx={{
												height: '40px',
												textTransform: 'none',
												whiteSpace: 'nowrap',
												flexShrink: 0,
											}}
										>
											{aiAutofilling ? 'Extracting...' : 'Autofill with AI'}
										</Button>
									</>
								)}
							</Box>

							{isPreview && <MatchingStatusCard detail={previewData?.detail} />}

	<EditableConditionsTable
    title="Header Level Conditions"
    conditions={headerConditions.map(cond => ({
        ...cond,
        baseAmount: selectedItems.reduce(
            (sum, item) => sum + calculateItemTotal(item.id),
            0
        ),
    }))}
    onChange={handleHeaderConditionChange}
    onAdd={handleAddHeaderCondition}
    onRemove={handleRemoveHeaderCondition}
    disabled={isPreview}
/>


						</Paper>
					)}

					<Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 1.5 }}>
						Line Items
					</Typography>

					<TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 450, overflowY: 'auto', mb: 2 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									{!isPreview && (
										<TH sx={{ width: 48 }}>
											<Checkbox
												checked={allSelected}
												indeterminate={someSelected}
												onChange={handleSelectAll}
												size="small"
											/>
										</TH>
									)}
									<TH>Line Item</TH>
									<TH>Material / Description</TH>
									<TH>Ordered Qty</TH>
									{!isPreview && <TH sx={{ minWidth: 90 }}>Remaining Qty</TH>}
									<TH sx={{ minWidth: 100 }}>Invoice Qty</TH>
									<TH sx={{ minWidth: 80 }}>UOM</TH>
									<TH sx={{ minWidth: 110 }}>Item Amount</TH>
									{!isPreview && <TH sx={{ minWidth: 100 }}>Total</TH>}

									{/* <TH sx={{ minWidth: 100 }}>Total</TH> */}
								</TableRow>
							</TableHead>
							<TableBody>
								{displayItems.length === 0 ? (
									<TableRow>
										<TD colSpan={colCount} align="center" sx={{ py: 4, color: '#999' }}>
											No line items available for Invoice
										</TD>
									</TableRow>
								) : (
									displayItems.map((item) => {
										const isItemSelected = isSelected(item);
										const showItemFields = isPreview || isItemSelected;
										const data = itemData[item.id] || {};
										const rowTotal = calculateItemTotal(item.id);
										const itemConds = data.conditions ?? [];
										const condsExpanded = itemConditionsOpen[item.id] ?? itemConds.length > 0;

										return (
											<React.Fragment key={item.id}>
												<TableRow
													hover
													selected={isItemSelected}
													sx={{
														cursor: isPreview ? 'default' : 'pointer',
														bgcolor: isItemSelected ? '#f0f7ff' : 'transparent',
													}}
													onClick={isPreview ? undefined : () => handleToggleItem(item)}
												>
													{!isPreview && (
														<TD>
															<Checkbox
																checked={isItemSelected}
																size="small"
																onChange={() => handleToggleItem(item)}
																onClick={(e) => e.stopPropagation()}
															/>
														</TD>
													)}
													<TD sx={{ fontWeight: 600, color: '#1976d2' }}>
														{item.itemNo ?? '—'}
													</TD>
													<TD>
														<Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
															{item.itemDesc ?? '—'}
														</Typography>
														{item.materialCode && (
															<Typography sx={{ fontSize: 11, color: '#888' }}>
																MAT-{item.materialCode}
															</Typography>
														)}
													</TD>
													<TD>{fmtQty(getOrderedQtyForItem(item), item.uom)}</TD>

													{!isPreview && (
														<TD>
															<Typography sx={{ fontSize: 12, fontWeight: 500 }}>
																{fmtQty(getRemainingQtyForItem(item), item.uom)}
															</Typography>
														</TD>
													)}

													<TD sx={{ verticalAlign: 'top' }}>
														{showItemFields ? (
															isPreview ? (
																<Typography sx={{ fontSize: 12 }}>{data.invoiceQty ?? '—'}</Typography>
															) : (
																<TextField
																	type="number"
																	value={data.invoiceQty ?? ''}
																	onChange={(e) => {
																		e.stopPropagation();
																		handleItemFieldChange(item.id, 'invoiceQty', e.target.value);
																	}}
																	onClick={(e) => e.stopPropagation()}
																	error={!!errors[`item_${item.id}_invoiceQty`]}
																	helperText={errors[`item_${item.id}_invoiceQty`] || ''}
																	size="small"
																	fullWidth
																	inputProps={{ min: 0, max: getMaxInvoiceQtyForItem(item) || undefined, step: 0.01 }}
																	placeholder="Qty"
																	sx={{ '& .MuiFormHelperText-root': { fontSize: 10, mx: 0, mt: 0.25, whiteSpace: 'nowrap' } }}
																/>
															)
														) : (
															<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
														)}
													</TD>

													<TD>
														{showItemFields ? (
															<Typography sx={{ fontSize: 12, color: errors[`item_${item.id}_uom`] ? '#d32f2f' : undefined }}>
																{resolveUomString(data.uom) || '—'}
															</Typography>
														) : (
															<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
														)}
													</TD>

													<TD>
														{showItemFields ? (
															isPreview ? (
																<Typography sx={{ fontSize: 12 }}>{data.itemAmount ?? '—'}</Typography>
															) : (
																<TextField
																	type="number"
																	value={data.itemAmount ?? ''}
																	onChange={(e) => {
																		e.stopPropagation();
																		handleItemFieldChange(item.id, 'itemAmount', e.target.value);
																	}}
																	onClick={(e) => e.stopPropagation()}
																	error={!!errors[`item_${item.id}_itemAmount`]}
																	size="small"
																	fullWidth
																	inputProps={{ min: 0, step: 0.01 }}
																	placeholder="Amount"
																/>
															)
														) : (
															<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
														)}
													</TD>

													{/* <TD sx={{ fontWeight: 600, color: '#1976d2' }}>
														{showItemFields ? fmtCurrency(rowTotal) : '—'}
													</TD> */}
													{!isPreview && (
    <TD sx={{ fontWeight: 600, color: '#1976d2' }}>
        {showItemFields ? fmtCurrency(rowTotal) : '—'}
    </TD>
)}

												</TableRow>

												{showItemFields && (
													<TableRow>
														<TableCell colSpan={colCount} sx={{ py: 0, px: 2, bgcolor: '#fafafa' }}>
															<Button
																size="small"
																onClick={(e) => {
																	e.stopPropagation();
																	setItemConditionsOpen(prev => ({ ...prev, [item.id]: !condsExpanded }));
																}}
																startIcon={condsExpanded ? <HiOutlineChevronUp style={{ fontSize: 12 }} /> : <HiOutlineChevronDown style={{ fontSize: 12 }} />}
																sx={{
																	textTransform: 'none', fontSize: 12, fontWeight: 600, color: '#1976d2',
																	p: 0.5, minWidth: 'auto', my: 0.5,
																	'&:hover': { backgroundColor: 'transparent', color: '#0d47a1' },
																}}
															>
																{itemConds.length} Item-Level Condition{itemConds.length !== 1 ? 's' : ''}
															</Button>
															<Collapse in={condsExpanded} timeout="auto" unmountOnExit>
																<EditableConditionsTable
    title=""
    conditions={itemConds.map(cond => ({
        ...cond,
        baseAmount:
            Number(data.invoiceQty || 0) *
            Number(data.itemAmount || 0),
    }))}
    onChange={(idx, field, value) =>
        handleItemConditionChange(item.id, idx, field, value)
    }
    onAdd={() => handleAddItemCondition(item.id)}
    onRemove={(idx) => handleRemoveItemCondition(item.id, idx)}
    disabled={isPreview}
/>

															</Collapse>
														</TableCell>
													</TableRow>
												)}
											</React.Fragment>
										);
									})
								)}
							</TableBody>
						</Table>
					</TableContainer>{!isPreview && selectedItems.length > 0 && (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
            bgcolor: '#f9fafb',
            borderRadius: 1,
        }}
    >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
            Calculated Total:
            <Box component="span" sx={{ color: '#1976d2', ml: 1 }}>
                {fmtCurrency(grandTotal)}
            </Box>
        </Typography>
    </Box>
)}

					{/* {selectedItems.length > 0 && (
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
							<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
								Calculated Total: <Box component="span" sx={{ color: '#1976d2', ml: 1 }}>{fmtCurrency(grandTotal)}</Box>
							</Typography>
						</Box>
					)} */}
				</Box>
				</Box>
				{approvalPanel && (
					<Box sx={{ width: '30%', flexShrink: 0, borderLeft: '2px solid #e0e0e0', overflowY: 'auto', p: 2, bgcolor: '#fafafa' }}>
						{approvalPanel}
					</Box>
				)}
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
				<Button onClick={onClose} variant="outlined" disabled={submitting || pushingToSap} sx={{ textTransform: 'none' }}>
					{isPreview ? 'Close' : 'Cancel'}
				</Button>
				<Box sx={{ flex: 1 }} />
				{isPreview && isPendingForPayment && !invoice?.sapInvoiceNo && hasExternalSourcePONumber && (
					<Button
						onClick={handlePushToSap}
						variant="contained"
						disabled={pushingToSap}
						sx={{ textTransform: 'none' }}
					>
						{pushingToSap ? 'Pushing to SAP...' : 'Push to SAP'}
					</Button>
				)}
				{!isPreview && (
					<Button
						onClick={handleSubmit}
						variant="contained"
						startIcon={<HiCheck />}
						disabled={submitting || fileUploading || selectedItems.length === 0}
						sx={{ textTransform: 'none' }}
					>
						{submitting ? 'Creating Invoice...' : (fileUploading ? 'Uploading attachment...' : 'Create Invoice')}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default AddInvoiceDialog;
