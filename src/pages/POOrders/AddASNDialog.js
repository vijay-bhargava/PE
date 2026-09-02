import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Collapse } from '@mui/material';
import { HiX, HiPlusSm, HiOutlineTrash, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../../utils/common';
import PEModal from '../../components/PEModal';
import { PETableSimple } from '../../components/RFQ/PETable';

const fmtQty = (q, uom) => (q != null ? `${q} ${uom ?? ''}`.trim() : '—');

const fmtCurrency = (amt) => {
	if (amt == null || amt === '') return '—';
	const num = Number(amt);
	if (isNaN(num)) return '—';
	return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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

const conditionColumns = [
	{ key: 'conditionCategory', label: 'Category', renderCell: (v) => v ?? '—' },
	{ key: 'conditionValue', label: 'Value', renderCell: (v) => fmtCurrency(v) },
	{ key: 'currency', label: 'Currency', renderCell: (v) => v ?? '—' },
	{ key: 'calculationType', label: 'Calc. Type', renderCell: (v) => v ?? '—' },
];

const ConditionsAccordion = ({ conditions = [] }) => {
	const [open, setOpen] = useState(false);
	if (!Array.isArray(conditions) || conditions.length === 0) return null;
	return (
		<Box sx={{ mt: 0.5 }}>
			<button
				type="button"
				className="pe-btn pe-btn--link"
				onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
			>
				{open ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
				{conditions.length} Condition{conditions.length > 1 ? 's' : ''}
			</button>
			<Collapse in={open} timeout="auto" unmountOnExit>
				<Box sx={{ mt: 1, maxWidth: 520 }}>
					<PETableSimple
						columns={conditionColumns}
						rows={conditions}
						getRowKey={(row, i) => row.id ?? i}
						wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}
					/>
				</Box>
			</Collapse>
		</Box>
	);
};

let batchUid = 0;
const nextBatchUid = () => `batch_${++batchUid}`;

const AddASNDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, mode = 'add', previewData = null, asnHeaders = [] }) => {
	const isPreview = mode === 'preview';
	const [selectedItems, setSelectedItems] = useState([]);
	const [shipSlipId, setShipSlipId] = useState('');
	const [shipNoticeType, setShipNoticeType] = useState('');
	const [carrierName, setCarrierName] = useState('');
	const [lrShipBillNumber, setLrShipBillNumber] = useState('');
	const [ewayBillNumber, setEwayBillNumber] = useState('');
	const [shipMethod, setShipMethod] = useState('');
	const [serviceLevel, setServiceLevel] = useState('');
	const [remarks, setRemarks] = useState('');
	const [shippingDate, setShippingDate] = useState(null);
	const [deliveryDates, setDeliveryDates] = useState({});
	const [batches, setBatches] = useState({});
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const toDateInputValue = (val) => {
		if (!val) return '';
		if (typeof val === 'string') {
			if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
			const m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
			if (m) {
				const [, dd, mm, yyyy] = m;
				return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
			}
		}
		const d = new Date(val);
		if (isNaN(d.getTime())) return '';
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	};

	const getPoDeliveryDateDefault = (item) => toDateInputValue(item?.poDeliveryDate ?? item?.deliveryDate);

	const toQtyNumber = (value) => { const num = Number(value); return Number.isFinite(num) ? num : 0; };

	const getAlreadyShippedQtyFromHeaders = (item) => {
		if (!Array.isArray(asnHeaders) || asnHeaders.length === 0) return 0;
		const itemId = item?.id ?? item?.poItemId ?? item?.poCreationDetailId;
		const itemCodes = [item?.itemCode, item?.itemNo, item?.lineItemNo].filter(c => c != null && c !== '').map(String);
		return asnHeaders.reduce((total, asn) => {
			const details = Array.isArray(asn?.shipmentDetails) ? asn.shipmentDetails : [];
			if (details.length > 0) {
				return total + details
					.filter(detail => {
						const detailId = detail?.poItemId ?? detail?.poCreationDetailId ?? detail?.itemId ?? detail?.poItemID ?? detail?.poDetailId;
						if (itemId != null && detailId != null && String(detailId) === String(itemId)) return true;
						const detailCodes = [detail?.itemCode, detail?.itemNo, detail?.lineItemNo].filter(c => c != null && c !== '').map(String);
						return detailCodes.some(code => itemCodes.includes(code));
					})
					.reduce((sum, d) => sum + toQtyNumber(d?.shipQty ?? d?.quantity), 0);
			}
			const headerId = asn?.poItemId ?? asn?.poCreationDetailId ?? asn?.itemId;
			if (itemId != null && headerId != null && String(headerId) === String(itemId)) {
				return total + toQtyNumber(asn?.quantity ?? asn?.shipQty);
			}
			return total;
		}, 0);
	};

	const getAlreadyShippedQty = (item) => {
		const fromHeaders = getAlreadyShippedQtyFromHeaders(item);
		const fromItem = toQtyNumber(item?.receivedQty ?? item?.totalShipQty ?? item?.shippedQuantity ?? item?.asnQuantity);
		return Math.max(fromHeaders, fromItem);
	};

	const getAvailableQty = (item) => Math.max(Number(item?.quantity ?? 0) - getAlreadyShippedQty(item), 0);
	const makeDefaultBatchRow = (item) => ([{ uid: nextBatchUid(), batchId: '', shipQty: getAvailableQty(item) }]);

	useEffect(() => {
		if (!open) return;
		if (isPreview && previewData) {
			const details = previewData.shipmentDetails ?? [];
			const matchedItems = lineItems.filter(it => details.some(d => String(d.poCreationDetailId ?? d.poItemId) === String(it.id)));
			const itemsToShow = matchedItems.length > 0 ? matchedItems : lineItems;
			setSelectedItems(itemsToShow);
			const initialBatches = {}, initialDeliveryDate = {};
			itemsToShow.forEach(item => {
				const itemDetails = details.filter(d => String(d.poCreationDetailId ?? d.poItemId) === String(item.id));
				initialBatches[item.id] = itemDetails.length > 0
					? itemDetails.map(d => ({ uid: nextBatchUid(), batchId: d.batchId ?? '', shipQty: d.shipQty ?? '' }))
					: makeDefaultBatchRow(item);
				const rowDate = itemDetails[0]?.deliveryDate ?? item.poDeliveryDate ?? item.deliveryDate;
				initialDeliveryDate[item.id] = toDateInputValue(rowDate);
			});
			setBatches(initialBatches);
			setDeliveryDates(initialDeliveryDate);
			setShipSlipId(previewData.shipSlipId ?? previewData.asnNumber ?? '');
			setShipNoticeType(previewData.shipNoticeType ?? '');
			setCarrierName(previewData.carrierName ?? '');
			setLrShipBillNumber(previewData.lrShipBillNumber ?? '');
			setEwayBillNumber(previewData.ewayBillNumber ?? '');
			setShipMethod(previewData.shipMethod ?? '');
			setServiceLevel(previewData.serviceLevel ?? '');
			setRemarks(previewData.remarks ?? '');
			setShippingDate(previewData.shippingDate ? toDateInputValue(previewData.shippingDate) : '');
			setErrors({});
			return;
		}
		if (open) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			if (selectableItems.length > 0) {
				setSelectedItems(selectableItems);
				const initialBatches = {}, initialDeliveryDate = {};
				selectableItems.forEach(item => {
					initialBatches[item.id] = makeDefaultBatchRow(item);
					initialDeliveryDate[item.id] = getPoDeliveryDateDefault(item);
				});
				setBatches(initialBatches);
				setDeliveryDates(initialDeliveryDate);
			} else {
				setSelectedItems([]);
				setBatches({});
				setDeliveryDates({});
			}
			setShipSlipId('');
			setShipNoticeType('');
			setCarrierName('');
			setLrShipBillNumber('');
			setEwayBillNumber('');
			setShipMethod('');
			setServiceLevel('');
			setRemarks('');
			setShippingDate(null);
			setErrors({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, lineItems, isPreview, previewData]);

	const handleToggleItem = (item) => {
		setSelectedItems(prev => {
			const alreadySelected = prev.some(i => i.id === item.id);
			if (alreadySelected) {
				setBatches(p => { const n = { ...p }; delete n[item.id]; return n; });
				setDeliveryDates(p => { const n = { ...p }; delete n[item.id]; return n; });
				return prev.filter(i => i.id !== item.id);
			} else {
				setBatches(p => ({ ...p, [item.id]: makeDefaultBatchRow(item) }));
				setDeliveryDates(p => ({ ...p, [item.id]: getPoDeliveryDateDefault(item) }));
				return [...prev, item];
			}
		});
	};

	const handleSelectAll = (checked) => {
		if (checked) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			setSelectedItems(selectableItems);
			const initialBatches = {}, initialDeliveryDate = {};
			selectableItems.forEach(item => {
				initialBatches[item.id] = makeDefaultBatchRow(item);
				initialDeliveryDate[item.id] = getPoDeliveryDateDefault(item);
			});
			setBatches(initialBatches);
			setDeliveryDates(initialDeliveryDate);
		} else {
			setSelectedItems([]);
			setBatches({});
			setDeliveryDates({});
		}
	};

	const handleAddBatch = (itemId) => {
		const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		const remaining = available - getItemTotalShipQty(itemId);
		if (remaining <= 0) {
			toast.error('No remaining quantity available to add another batch.');
			return;
		}
		setBatches(prev => ({ ...prev, [itemId]: [...(prev[itemId] ?? []), { uid: nextBatchUid(), batchId: '', shipQty: '' }] }));
	};

	const handleRemoveBatch = (itemId, uid) => {
		setBatches(prev => {
			const rows = (prev[itemId] ?? []).filter(b => b.uid !== uid);
			return { ...prev, [itemId]: rows.length > 0 ? rows : [{ uid: nextBatchUid(), batchId: '', shipQty: '' }] };
		});
	};

	const handleBatchFieldChange = (itemId, uid, field, value) => {
		let nextValue = value;
		if (field === 'shipQty' && value !== '') {
			const item = selectedItems.find(i => i.id === itemId);
			const available = item ? getAvailableQty(item) : Infinity;
			const otherBatchesQty = (batches[itemId] ?? []).filter(b => b.uid !== uid).reduce((sum, b) => sum + Number(b.shipQty || 0), 0);
			const maxForThisBatch = Math.max(available - otherBatchesQty, 0);
			const numeric = Number(value);
			if (!isNaN(numeric) && numeric > maxForThisBatch) {
				nextValue = String(maxForThisBatch);
				toast.error(`Batch quantity cannot exceed the remaining quantity (${maxForThisBatch}).`);
			}
		}
		setBatches(prev => ({ ...prev, [itemId]: (prev[itemId] ?? []).map(b => (b.uid === uid ? { ...b, [field]: nextValue } : b)) }));
		if (errors[`qty_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`qty_${itemId}`]; return n; });
	};

	const handleDeliveryDateChange = (itemId, value) => {
		setDeliveryDates(prev => ({ ...prev, [itemId]: value }));
		if (errors[`delivery_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`delivery_${itemId}`]; return n; });
	};

	const getItemTotalShipQty = (itemId) => (batches[itemId] ?? []).reduce((sum, b) => sum + Number(b.shipQty || 0), 0);

	const validateForm = () => {
		const newErrors = {};
		if (selectedItems.length === 0) newErrors.submit = 'Please select at least one line item';
		if (!shipSlipId || shipSlipId.trim() === '') newErrors.shipSlipId = 'Packing Slip / ASN No. is required';
		if (!shippingDate) newErrors.shippingDate = 'Shipping Date is required';
		selectedItems.forEach(item => {
			const available = getAvailableQty(item);
			const totalQty = getItemTotalShipQty(item.id);
			if (!totalQty || totalQty <= 0) newErrors[`qty_${item.id}`] = 'Enter at least one batch qty';
			else if (totalQty > available) newErrors[`qty_${item.id}`] = `Total exceeds ${available}`;
			if (!deliveryDates[item.id]) newErrors[`delivery_${item.id}`] = 'Required';
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (isPreview) return;
		if (!validateForm()) {
			toast.warning('Please fill all mandatory fields.');
			return;
		}
		setSubmitting(true);
		try {
			const asnData = {
				shipSlipId: shipSlipId.trim(),
				shipNoticeType, carrierName, lrShipBillNumber, ewayBillNumber,
				shipMethod, serviceLevel, remarks, shippingDate,
				poId: poDetails?.id,
				poNumber: poDetails?.poNumber,
				stages: { eventType: "INV", currentStage: "Invoice Raised", nextStage: "Under Approval", orgId: 0, orgGroupId: 0 },
				shipmentDetails: selectedItems.flatMap(item =>
					(batches[item.id] ?? []).filter(b => Number(b.shipQty) > 0).map(b => ({
						poCreationDetailId: item.id,
						itemNo: item.itemNo != null ? String(item.itemNo) : undefined,
						shipQty: Number(b.shipQty),
						batchId: b.batchId || undefined,
						deliveryDate: deliveryDates[item.id] || undefined,
					}))
				),
			};
			await onSubmit(asnData);
			onClose();
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: 'asn_create_error' });
			setErrors({ submit: getApiErrorMessage(error) });
		} finally {
			setSubmitting(false);
		}
	};

	const isItemSelected = (item) => selectedItems.some(i => i.id === item.id);
	const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
	const allSelectableSelected = selectableItems.length > 0 && selectedItems.length === selectableItems.length;

	// Column definitions for line item picker table
	const lineItemColumns = [
		...(!isPreview ? [{
			key: '__check__',
			label: '',
			width: 40,
			renderHeader: () => (
				<input type="checkbox" checked={allSelectableSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
			),
			renderCell: (_, row) => {
				const itemSelected = isItemSelected(row);
				const isDisabled = getAvailableQty(row) <= 0;
				return (
					<input
						type="checkbox"
						checked={itemSelected}
						disabled={isDisabled}
						onChange={() => handleToggleItem(row)}
						onClick={(e) => e.stopPropagation()}
					/>
				);
			},
		}] : []),
		{
			key: 'itemCode',
			label: 'Line Item',
			renderCell: (v, row) => (
				<span style={{ fontWeight: 600, color: '#1976d2' }}>{row.itemCode ?? row.itemNo ?? '—'}</span>
			),
		},
		{
			key: 'itemDesc',
			label: 'Material / Description',
			renderCell: (v, row) => (
				<>
					<div style={{ fontWeight: 500, color: '#1a1a1a' }}>{row.itemDesc ?? '—'}</div>
					{row.materialCode && <div style={{ fontSize: 11, color: '#888' }}>MAT-{row.materialCode} | {row.uom}</div>}
					<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, row)} />
				</>
			),
		},
		{ key: 'quantity', label: 'Ordered Qty', renderCell: (v, row) => fmtQty(v, row.uom) },
		{ key: 'totalShipQty', label: 'Shipped Qty', renderCell: (v, row) => fmtQty(v ?? 0, row.uom) },
		{
			key: '__open__',
			label: 'Open Qty',
			renderCell: (_, row) => {
				const available = getAvailableQty(row);
				return (
					<span style={{
						display: 'inline-block', padding: '2px 10px', borderRadius: 6,
						fontSize: 11, fontWeight: 600,
						background: available > 0 ? '#e3f2fd' : '#f5f5f5',
						color: available > 0 ? '#1976d2' : '#999',
					}}>
						{fmtQty(available, row.uom)}
					</span>
				);
			},
		},
	];

	return (
		<PEModal
			open={open}
			onClose={onClose}
			size="lg"
			title={isPreview ? 'Preview ASN' : 'Add ASN'}
			footer={
				<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
					<button type="button" className="pe-btn pe-btn--outline" disabled={submitting} onClick={onClose}>
						{isPreview ? 'Close' : 'Cancel'}
					</button>
					{!isPreview && (
						<button
							type="button"
							className="pe-btn pe-btn--primary"
							disabled={submitting || selectedItems.length === 0}
							onClick={handleSubmit}
						>
							{submitting && <span className="pe-btn-spinner" />}
							<span>{submitting ? 'Creating ASN...' : 'Create ASN'}</span>
						</button>
					)}
				</Box>
			}
		>
			{errors.submit && <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>}

			{/* ASN Info fields — only shown when items are selected */}
			{selectedItems.length > 0 && (
				<div className="pe-info-card" style={{ marginBottom: 20 }}>
					<div className="pe-info-card-title">ASN Information</div>
					<div className="pe-info-card-grid">
						<div>
							<label className="pe-field-label">Packing Slip / ASN No. <span className="rfq-required-star">*</span></label>
							<input
								type="text"
								className="pe-detail-form-input"
								value={shipSlipId}
								onChange={(e) => { setShipSlipId(e.target.value); if (errors.shipSlipId) setErrors(p => ({ ...p, shipSlipId: undefined })); }}
								placeholder="Enter Packing Slip / ASN No."
								disabled={isPreview}
								style={errors.shipSlipId ? { borderColor: '#d32f2f' } : undefined}
							/>
							{errors.shipSlipId && <div style={{ color: '#d32f2f', fontSize: 11, marginTop: 2 }}>{errors.shipSlipId}</div>}
						</div>
						<div>
							<label className="pe-field-label">Ship Notice Type</label>
							<input type="text" className="pe-detail-form-input" value={shipNoticeType} onChange={(e) => setShipNoticeType(e.target.value)} placeholder="e.g. Full, Partial" disabled={isPreview} />
						</div>
						<div>
							<label className="pe-field-label">Shipping Date <span className="rfq-required-star">*</span></label>
							<input
								type="date"
								className="pe-detail-form-input"
								value={shippingDate ?? ''}
								onChange={(e) => { setShippingDate(e.target.value); if (errors.shippingDate) setErrors(p => ({ ...p, shippingDate: undefined })); }}
								disabled={isPreview}
								style={errors.shippingDate ? { borderColor: '#d32f2f' } : undefined}
							/>
							{errors.shippingDate && <div style={{ color: '#d32f2f', fontSize: 11, marginTop: 2 }}>{errors.shippingDate}</div>}
						</div>
						<div>
							<label className="pe-field-label">Carrier Name</label>
							<input type="text" className="pe-detail-form-input" value={carrierName} onChange={(e) => setCarrierName(e.target.value)} disabled={isPreview} />
						</div>
						<div>
							<label className="pe-field-label">Service Level</label>
							<input type="text" className="pe-detail-form-input" value={serviceLevel} onChange={(e) => setServiceLevel(e.target.value)} disabled={isPreview} />
						</div>
						<div>
							<label className="pe-field-label">Shipping Method</label>
							<input type="text" className="pe-detail-form-input" value={shipMethod} onChange={(e) => setShipMethod(e.target.value)} disabled={isPreview} />
						</div>
						<div>
							<label className="pe-field-label">AWB / LR / Shipping Bill Number</label>
							<input type="text" className="pe-detail-form-input" value={lrShipBillNumber} onChange={(e) => setLrShipBillNumber(e.target.value)} disabled={isPreview} />
						</div>
						<div>
							<label className="pe-field-label">Eway Bill Number</label>
							<input type="text" className="pe-detail-form-input" value={ewayBillNumber} onChange={(e) => setEwayBillNumber(e.target.value)} disabled={isPreview} />
						</div>
					</div>
					<div className="pe-info-card-grid pe-info-card-grid--single" style={{ marginTop: 14 }}>
						<div>
							<label className="pe-field-label">Remarks</label>
							<textarea className="pe-detail-form-input" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isPreview} />
						</div>
					</div>
					<Typography sx={{ fontSize: 11, color: '#666', mt: 1.5 }}>
						* Shipping/Tracking values apply to the whole ASN; Delivery Date and batches below are per line item
					</Typography>
				</div>
			)}

			{/* Line item picker */}
			<div style={{ marginBottom: selectedItems.length > 0 ? 20 : 0 }}>
				<PETableSimple
					columns={lineItemColumns}
					rows={lineItems}
					getRowKey={(row) => row.id}
					wrapperStyle={{
						flex: 'none',
						maxHeight: 260,
						border: '1px solid #e5e7eb',
						borderRadius: '8px',
						overflow: 'hidden',
					}}
				/>
			</div>

			{/* Per-item: Delivery Date + batches */}
			{selectedItems.map(item => {
				const available = getAvailableQty(item);
				const itemBatches = batches[item.id] ?? [];
				const qtyError = errors[`qty_${item.id}`];
				const deliveryDateError = errors[`delivery_${item.id}`];

				const itemDetailColumns = [
					{ key: 'itemCode', label: 'Item No', renderCell: (v, row) => row.itemCode ?? row.itemNo ?? '—' },
					{
						key: 'itemDesc',
						label: 'Description',
						renderCell: (v, row) => (
							<>
								<div>{row.itemDesc ?? '—'}</div>
								<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, row)} />
							</>
						),
					},
					{ key: 'quantity', label: 'Qty / Unit', renderCell: (v, row) => fmtQty(v, row.uom) },
					{ key: '__open__', label: 'Open Qty', renderCell: () => fmtQty(available, item.uom) },
					{
						key: '__delivery__',
						label: 'Delivery Date *',
						width: 170,
						renderCell: () => (
							<>
								<input
									type="date"
									className="pe-detail-form-input"
									value={deliveryDates[item.id] ?? ''}
									onChange={(e) => handleDeliveryDateChange(item.id, e.target.value)}
									disabled={isPreview}
									style={deliveryDateError ? { borderColor: '#d32f2f' } : undefined}
								/>
								{deliveryDateError && <div style={{ color: '#d32f2f', fontSize: 11, marginTop: 2 }}>{deliveryDateError}</div>}
							</>
						),
					},
					...(!isPreview ? [{
						key: '__remove__',
						label: '',
						width: 48,
						renderCell: () => (
							<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => handleToggleItem(item)}>
								<HiX />
							</button>
						),
					}] : []),
				];

				return (
					<div key={item.id} className="pe-info-card" style={{ marginBottom: 16 }}>
						<PETableSimple
							columns={itemDetailColumns}
							rows={[item]}
							getRowKey={(row) => row.id}
							wrapperStyle={{
								flex: 'none',
								border: '1px solid #e5e7eb',
								borderRadius: '8px',
								overflow: 'hidden',
								marginBottom: 3,
							}}
						/>

						{qtyError && <Alert severity="error" sx={{ mb: 1.5, fontSize: 12 }}>{qtyError}</Alert>}

						{itemBatches.map((batch, bIdx) => (
							<Box key={batch.uid} sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 1, flexWrap: 'wrap' }}>
								<div style={{ width: 180 }}>
									<label className="pe-field-label">{bIdx === 0 ? 'Ship Qty' : `Ship Qty (Batch ${bIdx + 1})`}<span className="rfq-required-star">*</span></label>
									<input
										type="number"
										className="pe-detail-form-input"
										value={batch.shipQty ?? ''}
										onChange={(e) => handleBatchFieldChange(item.id, batch.uid, 'shipQty', e.target.value)}
										min={0}
										step={1}
										disabled={isPreview}
									/>
								</div>
								<div style={{ flex: 1, minWidth: 160 }}>
									<label className="pe-field-label">Supplier Batch Id</label>
									<input
										type="text"
										className="pe-detail-form-input"
										value={batch.batchId ?? ''}
										onChange={(e) => handleBatchFieldChange(item.id, batch.uid, 'batchId', e.target.value)}
										placeholder="Optional"
										disabled={isPreview}
									/>
								</div>
								{!isPreview && itemBatches.length > 1 && (
									<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => handleRemoveBatch(item.id, batch.uid)}>
										<HiOutlineTrash />
									</button>
								)}
							</Box>
						))}

						{!isPreview && (
							<button type="button" className="pe-btn pe-btn--link" style={{ marginTop: 4 }} onClick={() => handleAddBatch(item.id)}>
								<HiPlusSm /> Add Batch
							</button>
						)}
					</div>
				);
			})}
		</PEModal>
	);
};

export default AddASNDialog;
