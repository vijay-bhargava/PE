import React, { useState, useEffect } from 'react';
import {
	HiOutlineChevronUp, HiOutlineChevronDown, HiPlusSm,
	HiOutlineEye, HiDownload
} from 'react-icons/hi';
import { formatDateViaTimeZone, formatoption } from '../../utils/common/utility';
import StatusBadge from '../../components/StatusBadge';
import { PETableSimple } from '../../components/RFQ/PETable';
import '../../assets/css/manage-rfq-v2.css';
import '../../assets/css/design-system.css';
import { toast } from 'react-toastify';

const fmtDate = (d) => (d ? formatDateViaTimeZone(d, 'en-GB', formatoption) : '');

const toDateInputValue = (d) => {
	if (!d) return '';
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return '';
	const m = String(dt.getMonth() + 1).padStart(2, '0');
	const day = String(dt.getDate()).padStart(2, '0');
	return `${dt.getFullYear()}-${m}-${day}`;
};

const isServiceItem = (item) => {
	if (!item) return false;
	const raw = item.itemType ?? item.itemCategory ?? item.type ?? '';
	return String(raw).toLowerCase() === 'service';
};

const getGrnAcceptedQtyForItem = (itemGrns = []) =>
	(itemGrns ?? []).flatMap(hdr => {
		const grnItems = Array.isArray(hdr.grnItems)
			? hdr.grnItems
			: Array.isArray(hdr.grnItem)
				? hdr.grnItem
				: [];
		return grnItems;
	}).reduce((sum, gi) => sum + Number(gi?.acceptedQty ?? gi?.receivedQty ?? 0), 0);

const getAvailableGrnQty = (item, itemGrns = []) => {
	const ordered = Number(item?.orderedQuantity ?? item?.quantity ?? 0);
	const accepted = getGrnAcceptedQtyForItem(itemGrns);
	return Math.max(ordered - accepted, 0);
};

const fmtCurrency = (amt) => {
	if (amt == null || amt === '') return '';
	const num = Number(amt);
	if (isNaN(num)) return '';
	return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtQty = (q, uom) => {
	if (q == null || q === '') return '';
	const num = Number(q);
	const display = Number.isFinite(num) ? Number(num.toFixed(8)) : q;
	return `${display} ${uom ?? ''}`.trim();
};

const pct = (part, total) => (total > 0 ? Math.round((Number(part) / Number(total)) * 100) : 0);

/* ──── data helpers ────────────────────────────────────────────────────────────────── */

const getItemASNs = (shipments, item) =>
	(shipments ?? []).filter(s =>
		(s.shipmentDetails ?? []).some(d => {
			const matchByItemNo = d.itemNo != null && (String(d.itemNo) === String(item?.itemNo) || String(d.itemNo) === String(item?.itemCode));
			const matchByPoDetail = (d.poCreationDetailId != null || d.poItemId != null) && (
				String(d.poCreationDetailId ?? d.poItemId) === String(item?.id ?? item?.poCreationDetailId ?? item?.poItemId)
			);
			return matchByItemNo || matchByPoDetail;
		})
	);

const getItemGRNs = (shipments, item) =>
	(shipments ?? []).flatMap(s =>
		(s.shipmentDetails ?? []).filter(d => {
			const matchByItemNo = d.itemNo != null && (String(d.itemNo) === String(item?.itemNo) || String(d.itemNo) === String(item?.itemCode));
			const matchByPoDetail = (d.poCreationDetailId != null || d.poItemId != null) && (
				String(d.poCreationDetailId ?? d.poItemId) === String(item?.id ?? item?.poCreationDetailId ?? item?.poItemId)
			);
			return matchByItemNo || matchByPoDetail;
		}).map(d => ({ ...d, _asnId: s.id, _asnStatus: s.status, _shippingDate: s.shippingDate }))
	);

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

const normalizeGrnForItem = (headers, itemId) =>
	(Array.isArray(headers) ? headers : [])
		.map(h => {
			const grnItems = (Array.isArray(h.grnItem) ? h.grnItem : (Array.isArray(h.grnItems) ? h.grnItems : []))
				.filter(gi => String(gi.poItemId) === String(itemId));
			return grnItems.length > 0 ? { ...h, grnItem: grnItems } : null;
		})
		.filter(Boolean);

const normalizeInvoicesForItem = (headers, itemId) =>
	(Array.isArray(headers) ? headers : []).flatMap(hdr =>
		(hdr.invoiceDetails ?? [])
			.filter(d => String(d.creationDetailId) === String(itemId))
			.map(d => ({
				...d,
				_header: hdr,
				invoiceNo: d.invoiceNo ?? hdr.invoiceNo,
				invoiceDate: d.invoiceDate ?? hdr.invoiceDate,
				invoiceAmount: d.invoiceAmount ?? hdr.invoiceAmount,
				quantity: d.quantity ?? hdr.quantity,
				stage: d.stage || hdr.stage,
				invoicePath: d.invoicePath ?? hdr.invoicePath,
				invoiceFile: d.invoiceFile ?? hdr.invoiceFile,
			}))
	);

const normalizeSesForItem = (headers, itemId) =>
	(Array.isArray(headers) ? headers : []).flatMap(hdr =>
		(hdr.sesItem ?? [])
			.filter(si => String(si.poItemId) === String(itemId))
			.map(si => ({
				...hdr,
				...si,
				sesNumber: hdr.sesNumber,
				sesDate: hdr.sesDate,
				serviceQty: si.serviceQty,
				serviceAmount: si.serviceAmount,
				servicePeriodFrom: si.servicePeriodFrom,
				servicePeriodTo: si.servicePeriodTo,
				acceptanceStatus: si.acceptanceStatus,
			}))
	);

const normalizeAsnsForItem = (asns) => {
	if (Array.isArray(asns)) return asns;
	if (Array.isArray(asns?.result)) return asns.result;
	return [];
};

/* ──── Section Header ────────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, count, onAdd, addLabel, disabled, extra }) => (
	<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
		<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
			<span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>
				{title}{count > 0 ? ` (${count})` : ''}
			</span>
			{extra && extra}
		</div>
		{onAdd && (
			<button
				type="button"
				className="pe-btn--link"
				onClick={onAdd}
				disabled={disabled}
				style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
			>
				<HiPlusSm /> {addLabel}
			</button>
		)}
	</div>
);

/* ──── ConditionsAccordion ────────────────────────────────────────────────────────── */

const ConditionsAccordion = ({ conditions = [] }) => {
	const [expanded, setExpanded] = useState(false);
	if (!Array.isArray(conditions) || conditions.length === 0) return null;

	const condCols = [
		{ key: 'conditionCategory', label: 'Category' },
		{ key: 'conditionValue', label: 'Value' },
		{ key: 'currency', label: 'Currency' },
		{ key: 'calculationType', label: 'Calculation' },
	];

	return (
		<div style={{ marginBottom: 16 }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
				<button
					type="button"
					className="pe-icon-btn pe-icon-btn--expand"
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? <HiOutlineChevronUp style={{ fontSize: 14 }} /> : <HiOutlineChevronDown style={{ fontSize: 14 }} />}
				</button>
				<span style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>Conditions ({conditions.length})</span>
			</div>
			{expanded && (
				<div style={{ marginTop: 6 }}>
					<PETableSimple
						columns={condCols}
						rows={conditions.map((c, i) => ({ ...c, _key: i }))}
						getRowKey={(r) => r._key}
						wrapperStyle={{ background: '#fff' }}
					/>
				</div>
			)}
		</div>
	);
};

/* ──── ASNTable ────────────────────────────────────────────────────────────────── */

const ASNTable = ({ asns = [], asnStatus, onAdd, onViewASN, disabled }) => {
	if ((!Array.isArray(asns) || asns.length === 0) && !onAdd) return null;

	const rows = (asns ?? []).flatMap((asn, asnIndex) => {
		const details = Array.isArray(asn.shipmentDetails) ? asn.shipmentDetails : [];
		if (details.length === 0) return [{ asn, detail: null, key: String(asn.id ?? asnIndex) }];
		return details.map((detail, detailIndex) => ({
			asn, detail, key: `${asn.id ?? asnIndex}-${detail.id ?? detailIndex}`,
		}));
	});

	const cols = [
		{ key: 'asnNumber', label: 'ASN Number', renderCell: (_, row) => <span style={{ fontSize: 12 }}>{row.asn.shipSlipId ?? ''}</span> },
		{ key: 'asnDate', label: 'ASN Date', renderCell: (_, row) => fmtDate(row.asn.shippingDate) },
		{ key: 'expectedDelivery', label: 'Expected Delivery', renderCell: (_, row) => fmtDate(row.asn.deliveryDate) },
		{ key: 'shippedQty', label: 'Shipped Qty', renderCell: (_, row) => row.detail?.shipQty ?? '' },
		{ key: 'batch', label: 'Batch', renderCell: (_, row) => row.detail?.batchId ?? row.asn.batchId ?? '' },
		{
			key: '__actions__', label: 'Actions',
			renderCell: (_, row) => (
				<button type="button" className="pe-icon-btn pe-icon-btn--view" title="View" onClick={() => onViewASN?.(row.asn)}>
					<HiOutlineEye />
				</button>
			),
		},
	];

	return (
		<div style={{ marginBottom: 20 }}>
			<SectionHeader title="ASN Details" count={rows.length} onAdd={onAdd} addLabel="Add ASN" disabled={disabled}
				extra={asnStatus && <StatusBadge status={asnStatus} />} />
			{rows.length === 0 ? (
				<p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>No ASN records found for this line item.</p>
			) : (
				<PETableSimple columns={cols} rows={rows} getRowKey={(r) => r.key} wrapperStyle={{ background: '#fff' }} />
			)}
		</div>
	);
};

/* ──── GRNTable ────────────────────────────────────────────────────────────────── */

const GRNTable = ({ grns = [], asns = [], grnsesStatus, onAdd, disabled }) => {
	const rows = (grns ?? [])
		.filter(h => Boolean(h?.grnNumber))
		.map(h => {
			const grnItems = Array.isArray(h.grnItems) ? h.grnItems : Array.isArray(h.grnItem) ? h.grnItem : [];
			const receivedQty = grnItems.reduce((sum, gi) => sum + Number(gi?.receivedQty ?? 0), 0);
			const rejectedQty = grnItems.reduce((sum, gi) => sum + Number(gi?.rejectedQty ?? 0), 0);
			const acceptedQty = grnItems.reduce((sum, gi) => sum + Number(gi?.acceptedQty ?? 0), 0);
			return { ...h, _receivedQty: receivedQty, _rejectedQty: rejectedQty, _acceptedQty: acceptedQty };
		});

	const cols = [
		{ key: 'grnNumber', label: 'GRN Number', renderCell: (v) => <span style={{ fontSize: 12 }}>{v}</span> },
		{ key: 'grnDate', label: 'GRN Date', renderCell: (v) => fmtDate(v) },
		{ key: '_receivedQty', label: 'Total Qty' },
		{ key: '_rejectedQty', label: 'QC Failed Qty' },
		{ key: '_acceptedQty', label: 'Accepted Qty' },
		{ key: 'createdByName', label: 'Created By', renderCell: (v) => v ?? '' },
	];

	return (
		<div style={{ marginBottom: 20 }}>
			<SectionHeader title="GRN Details" count={rows.length} onAdd={onAdd} addLabel="Add GRN" disabled={disabled}
				extra={grnsesStatus && <StatusBadge status={grnsesStatus} />} />
			{rows.length === 0 ? (
				<p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>No GRN records found for this line item.</p>
			) : (
				<PETableSimple columns={cols} rows={rows} getRowKey={(r) => r.id ?? r.grnNumber} wrapperStyle={{ background: '#fff' }} />
			)}
		</div>
	);
};

/* ──── SESDetailsSection ────────────────────────────────────────────────────────── */
const SESDetailsSection = ({ sesDetails, grnsesStatus, onAdd, onPreview, disabled }) => {
	const cols = [
		{ key: 'sesNumber', label: 'SES Number', renderCell: (v) => <span style={{ fontSize: 12 }}>{v ?? ''}</span> },
		{ key: 'servicePeriodFrom', label: 'Service Start Date', renderCell: (v, row) => fmtDate(v ?? row.serviceStartDate ?? row.startDate) },
		{ key: 'servicePeriodTo', label: 'Service End Date', renderCell: (v, row) => fmtDate(v ?? row.serviceEndDate ?? row.endDate) },
		{ key: 'serviceQty', label: 'Quantity', renderCell: (v, row) => v ?? row.quantity ?? '' },
		{ key: 'serviceAmount', label: 'Service Amount', renderCell: (v, row) => fmtCurrency(v ?? row.amount) },
		{
			key: '__actions__', label: 'Actions',
			renderCell: (_, row) => (
				<button type="button" className="pe-icon-btn pe-icon-btn--view" title="Preview" onClick={() => onPreview?.(row)}>
					<HiOutlineEye />
				</button>
			),
		},
	];

	return (
		<div style={{ marginBottom: 20 }}>
			<SectionHeader title="SES Details" count={sesDetails.length} onAdd={onAdd} addLabel="Add SES" disabled={disabled}
				extra={grnsesStatus && <StatusBadge status={grnsesStatus} />} />
			{sesDetails.length === 0 ? (
				<p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>No SES records found for this line item.</p>
			) : (
				<PETableSimple columns={cols} rows={sesDetails} getRowKey={(r, i) => r.id ?? i} wrapperStyle={{ background: '#fff' }} />
			)}
		</div>
	);
};

/* ──── InvoiceTable ────────────────────────────────────────────────────────────── */
const InvoiceTable = ({ invoices, onAdd, onView, onDownload, disabled }) => {
	const cols = [
		{
			key: 'invoiceNo', label: 'Invoice Number',
			renderCell: (v, row) => <span style={{ fontSize: 12 }}>{v ?? row._header?.invoiceNo ?? ''}</span>,
		},
		{ key: 'invoiceDate', label: 'Invoice Date', renderCell: (v, row) => fmtDate(v ?? row._header?.invoiceDate) },
		{ key: 'quantity', label: 'Invoiced Qty', renderCell: (v, row) => v ?? row._header?.quantity ?? '' },
		{ key: 'invoiceAmount', label: 'Invoice Amount', renderCell: (v, row) => fmtCurrency(v ?? row._header?.invoiceAmount) },
		{
			key: 'stage', label: 'Status',
			renderCell: (v, row) => <StatusBadge status={v || row._header?.stage || row._header?.status || 'Not Available'} />,
		},
		{
			key: '__actions__', label: 'Actions',
			renderCell: (_, row) => {
				const header = row._header || row;
				const hasFile = header.invoiceFile || header.invoicePath;
				return (
					<div style={{ display: 'flex', gap: 4 }}>
						<button type="button" className="pe-icon-btn pe-icon-btn--view" title="View" onClick={() => onView?.(row)}>
							<HiOutlineEye />
						</button>
						{hasFile && onDownload && (
							<button type="button" className="pe-icon-btn pe-icon-btn--download" title="Download Invoice" onClick={() => onDownload(header)}>
								<HiDownload />
							</button>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div style={{ marginBottom: 20 }}>
			<SectionHeader title="Invoice Details" count={invoices.length} onAdd={onAdd} addLabel="Add Invoice" disabled={disabled} />
			{invoices.length === 0 ? (
				<p style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: '8px 0' }}>No Invoice records found for this line item.</p>
			) : (
				<PETableSimple columns={cols} rows={invoices} getRowKey={(r, i) => r.id ?? i} wrapperStyle={{ background: '#fff' }} />
			)}
		</div>
	);
};

/* ──── Main Component ────────────────────────────────────────────────────────────── */
const POItemList = ({
	items = [],
	shipments = [],
	currentStage = '',
	poId,
	customerId,
	apiClient,
	atoken,
	itemConditions = [],
	selectionMode = false,
	selectedItemIds = [],
	isItemSelectable = () => true,
	onToggleSelectItem,
	onToggleSelectAll,
	deliveryUpdates = {},
	onEditDeliveryDate,
	onAddASN,
	onAddGRN,
	onAddSES,
	onAddInvoice,
	isItemGrnAddAllowed = () => true,
	onAddAdvanceInvoice,
	onAddPayment,
	onViewASN,
	onViewInvoice,
	onViewPayment,
	onDownloadInvoice,
	onPreviewSES,
}) => {
	const isDraft = String(currentStage ?? '').toLowerCase().includes('draft');
	const [expandedId, setExpandedId] = useState(null);
	const [activeTabPerItem, setActiveTabPerItem] = useState({});
	const [itemDetailData, setItemDetailData] = useState({});

	const handleToggleItem = (item) => {
		setExpandedId(prev => prev === item.id ? null : item.id);
	};

	const handleExpandToggle = (key) => {
		setExpandedId(prev => prev === key ? null : key);
	};

	const expandedKeys = new Set(expandedId != null ? [expandedId] : []);

	useEffect(() => {
		if (!expandedId || !poId || !apiClient) return;
		const item = items.find(i => i.id === expandedId);
		if (!item) return;

		let cancelled = false;
		const itemId = item.id;
		const cid = customerId;

		const fetchItemDetails = async () => {
			setItemDetailData(prev => ({
				...prev,
				[expandedId]: { ...(prev[expandedId] ?? {}), loading: true, fetchedFor: expandedId },
			}));

			try {
				const isService = isServiceItem(item);
				const asnRequest = !isService
					? apiClient.get(`/api/shipment/Find?poId=${poId}&itemId=${itemId}`, atoken).catch(() => [])
					: Promise.resolve([]);
				const grnRequest = !isService
					? apiClient.get(`/api/grnheader/Find?poId=${poId}&itemId=${itemId}&customerId=${cid}`, atoken)
					: Promise.resolve([]);
				const invoiceRequest = !isDraft
					? apiClient.get(`/api/poinvoice/Find?poId=${poId}&itemId=${itemId}&customerId=${cid}`, atoken)
					: Promise.resolve([]);
				const sesRequest = isService && !isDraft
					? apiClient.get(`/api/sesheader/Find?poId=${poId}&itemId=${itemId}&customerId=${cid}`, atoken)
					: Promise.resolve([]);

				const [asnRes, grnRes, invRes, sesRes] = await Promise.all([asnRequest, grnRequest, invoiceRequest, sesRequest]);
				if (cancelled) return;

				setItemDetailData(prev => ({
					...prev,
					[expandedId]: {
						loading: false,
						fetchedFor: expandedId,
						asns: normalizeAsnsForItem(asnRes),
						grns: normalizeGrnForItem(grnRes, itemId),
						invoices: normalizeInvoicesForItem(invRes, itemId),
						sesDetails: normalizeSesForItem(sesRes, itemId),
					},
				}));
			} catch (err) {
				if (cancelled) return;
				setItemDetailData(prev => ({
					...prev,
					[expandedId]: { loading: false, fetchedFor: expandedId, asns: [], grns: [], invoices: [], sesDetails: [], error: true },
				}));
			}
		};

		fetchItemDetails();
		return () => { cancelled = true; };
	}, [expandedId, poId, customerId, atoken, apiClient, items, isDraft]);

	useEffect(() => {
		setItemDetailData({});
	}, [shipments]);

	if (!Array.isArray(items) || items.length === 0) {
		return (
			<div style={{ padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>
				No line items found.
			</div>
		);
	}

	const selectableItemIds = items.filter(item => isItemSelectable(item)).map(item => item.id);
	const selectedSelectableCount = selectedItemIds.filter(id => selectableItemIds.includes(id)).length;
	const allSelected = selectableItemIds.length > 0 && selectedSelectableCount === selectableItemIds.length;
	const someSelected = selectedSelectableCount > 0 && selectedSelectableCount < selectableItemIds.length;

	const columns = [
		...(selectionMode ? [{
			key: '__check__',
			label: (
				<input
					type="checkbox"
					checked={allSelected}
					ref={(el) => { if (el) el.indeterminate = someSelected; }}
					disabled={selectableItemIds.length === 0}
					onChange={(e) => onToggleSelectAll && onToggleSelectAll(e.target.checked)}
				/>
			),
			width: 44,
			renderCell: (_, row) => {
				const isRowSelected = selectedItemIds.includes(row.id);
				const isSelectable = isItemSelectable(row);
				return (
					<input
						type="checkbox"
						checked={isRowSelected}
						disabled={!isSelectable}
						onChange={(e) => { e.stopPropagation(); onToggleSelectItem && onToggleSelectItem(row, e.target.checked); }}
						onClick={(e) => e.stopPropagation()}
					/>
				);
			},
		}] : []),
		{
			key: '__expand__',
			label: '',
			width: 40,
			renderCell: (_, row) => {
				const isExpanded = expandedId === row.id;
				return (
					<button type="button" className="pe-icon-btn pe-icon-btn--expand" onClick={() => handleExpandToggle(row.id)}>
						{isExpanded ? <HiOutlineChevronUp style={{ fontSize: 14 }} /> : <HiOutlineChevronDown style={{ fontSize: 14 }} />}
					</button>
				);
			},
		},
		{
			key: 'itemCode', label: 'Item Code',
			renderCell: (v) => <span style={{ fontWeight: 600, color: '#1976d2', fontSize: 12 }}>{v ?? ''}</span>,
		},
		{
			key: 'lineItemNo', label: 'Item No',
			renderCell: (v) => <span style={{ fontWeight: 600, color: '#1976d2', fontSize: 12 }}>{v ?? ''}</span>,
		},
		{
			key: 'itemName', label: 'Item Name',
			renderCell: (v) => <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{v ?? ''}</span>,
		},
		{
			key: 'itemDesc', label: 'Description',
			renderCell: (v, row) => (
				<div>
					<div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{v ?? ''}</div>
					{row.materialCode && (
						<div style={{ fontSize: 11, color: '#888' }}>MAT-{row.materialCode} &nbsp;|&nbsp; {row.uom ?? ''}</div>
					)}
				</div>
			),
		},
		{
			key: 'orderedQuantity', label: 'Ordered Qty',
			renderCell: (v, row) => fmtQty(Number(v ?? row.quantity ?? 0), row.uom),
		},
		{
			key: 'receivedQty', label: 'Received Qty',
			renderCell: (v, row) => <span style={{ fontSize: 12 }}>{fmtQty(Number(v ?? 0), row.uom)}</span>,
		},
		{
			key: 'invoicedQty', label: 'Invoiced Qty',
			renderCell: (v, row) => <span style={{ fontSize: 12 }}>{fmtQty(Number(v ?? 0), row.uom)}</span>,
		},
		{
			key: '__remaining__', label: 'Remaining Qty',
			renderCell: (_, row) => {
				const oQty = Number(row.orderedQuantity ?? row.quantity ?? 0);
				const iQty = Number(row.invoicedQty ?? 0);
				const remaining = Math.max(Number((oQty - iQty).toFixed(8)), 0);
				return <span style={{ fontSize: 12 }}>{fmtQty(remaining, row.uom)}</span>;
			},
		},
		{
			key: 'poDeliveryDate', label: 'Delivery Date',
			renderCell: (v, row) => {
				const displayDeliveryDate = deliveryUpdates[row.id] ?? row.poDeliveryDate ?? row.deliveryDate;
				if (isDraft) {
					return (
						<input
							type="date"
							className="pe-detail-form-input"
							style={{ width: 130, height: 28, padding: '0 6px', fontSize: 12 }}
							value={toDateInputValue(displayDeliveryDate)}
							onChange={(e) => {
								const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
								onEditDeliveryDate && onEditDeliveryDate(row, newDate);
							}}
						/>
					);
				}
				return (
					<span title="Delivery date can be edited only in Draft stage" style={{ fontSize: 12, color: '#333' }}>
						{fmtDate(displayDeliveryDate)}
					</span>
				);
			},
		},
		{
			key: 'materialPOUnitPrice', label: 'Unit Price',
			renderCell: (v) => v != null ? v.toString().replace(/\.0+$/, '') : '',
		},
		{
			key: 'itemType', label: 'Item Type',
			renderCell: (v) => {
				const isService = String(v ?? '').toLowerCase() === 'service';
				return (
					<span style={{
						display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
						background: isService ? '#fff3e0' : '#f3f4f6',
						color: isService ? '#e65100' : '#6b7280',
						border: `1px solid ${isService ? '#ffcc80' : '#e5e7eb'}`,
					}}>
						{v ?? 'Material'}
					</span>
				);
			},
		},
		{
			key: 'totalAmount', label: 'Total Value',
			renderCell: (v) => fmtCurrency(v),
		},
	];

	const getExpandContent = (row) => {
		const detailCache = itemDetailData[row.id] ?? {};
		const itemAsns = detailCache.asns ?? [];
		const itemGrns = detailCache.grns ?? [];
		const itemInvoices = detailCache.invoices ?? [];
		const itemSesDetails = detailCache.sesDetails ?? [];

		return (
			<div style={{ padding: '16px 20px', background: '#f9fafb', borderLeft: '4px solid #1976d2', maxHeight: '55vh', overflowY: 'auto' }}>
				{/* Header info row */}
				<div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
					{row.materialCode && (
						<span style={{ fontSize: 11, color: '#777' }}>
							Material Code: <strong style={{ color: '#333' }}>{row.materialCode}</strong>
						</span>
					)}
					{row.uom && (
						<span style={{ fontSize: 11, color: '#777' }}>
							UOM: <strong style={{ color: '#333' }}>{row.uom}</strong>
						</span>
					)}
					{row.materialPOUnitPrice && (
						<span style={{ fontSize: 11, color: '#777' }}>
							Unit Price: <strong style={{ color: '#333' }}>{fmtCurrency(row.materialPOUnitPrice)}</strong>
						</span>
					)}
					{row.plantName && (
						<span style={{ fontSize: 11, color: '#777' }}>
							Plant: <strong style={{ color: '#333' }}>{row.plantName}</strong>
						</span>
					)}
				</div>

				{detailCache.loading && (
					<p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Loading details...</p>
				)}

				<ConditionsAccordion conditions={getItemConditions(itemConditions, row)} />

				{!isServiceItem(row) && (
					<>
						<ASNTable
							asns={itemAsns}
							asnStatus={row.asnStatus}
							onAdd={!isDraft && onAddASN ? () => onAddASN(row) : undefined}
							onViewASN={onViewASN}
							disabled={isDraft}
						/>
						{!isDraft && (
							<GRNTable
								grns={itemGrns}
								grnsesStatus={row.grnsesStatus}
								asns={getItemASNs(shipments, row)}
								onAdd={
									!isDraft && onAddGRN && itemAsns.length > 0
										? () => {
											if (getAvailableGrnQty(row, itemGrns) <= 0) {
												toast.warning('Cannot create GRN. Accepted quantity is equal to the ordered quantity.');
												return;
											}
											onAddGRN(row);
										}
										: undefined
								}
								disabled={isDraft || getAvailableGrnQty(row, itemGrns) === 0}
							/>
						)}
					</>
				)}

				{isServiceItem(row) && !isDraft && (
					<SESDetailsSection
						sesDetails={itemSesDetails}
						grnsesStatus={row.grnsesStatus}
						onAdd={!isDraft && onAddSES ? () => onAddSES(row) : undefined}
						onPreview={onPreviewSES}
						disabled={isDraft}
					/>
				)}

				{!isDraft && (
					<InvoiceTable
						invoices={itemInvoices}
						onAdd={!isDraft && onAddInvoice ? () => onAddInvoice(row) : undefined}
						onView={onViewInvoice}
						onDownload={onDownloadInvoice}
						disabled={isDraft}
					/>
				)}
			</div>
		);
	};

	return (
		<div>
			<PETableSimple
				columns={columns}
				rows={items}
				getRowKey={(item, idx) => item.id ?? idx}
				getExpandContent={getExpandContent}
				expandedKeys={expandedKeys}
				onExpandToggle={handleExpandToggle}
				wrapperStyle={{ overflowX: 'auto' }}
			/>
		</div>
	);
};

export default POItemList;
