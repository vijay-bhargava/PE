import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
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
	{ key: 'conditionType', label: 'Condition Type' },
	{ key: 'conditionCategory', label: 'Category' },
	{ key: 'conditionRate', label: 'Rate' },
	{ key: 'conditionValue', label: 'Value', renderCell: (v) => fmtCurrency(v) },
	{ key: 'currency', label: 'Currency' },
	{ key: 'calculationType', label: 'Calc. Type' },
];

const ConditionsAccordion = ({ conditions = [] }) => {
	const [open, setOpen] = useState(false);
	if (!Array.isArray(conditions) || conditions.length === 0) return null;

	return (
		<div style={{ marginTop: 6 }}>
			<button
				type="button"
				className="pe-btn--link"
				onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
				style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3 }}
			>
				{open ? <HiOutlineChevronUp style={{ fontSize: 10 }} /> : <HiOutlineChevronDown style={{ fontSize: 10 }} />}
				{conditions.length} Condition{conditions.length > 1 ? 's' : ''}
			</button>
			{open && (
				<div style={{ marginTop: 6 }}>
					<PETableSimple
						columns={conditionColumns}
						rows={conditions.map((c, i) => ({ ...c, _rowId: c.id ?? i }))}
						getRowKey={(r) => r._rowId}
						wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}
					/>
				</div>
			)}
		</div>
	);
};

const AddGRNDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, existingGrnNumbers = [] }) => {
	const [selectedItems, setSelectedItems] = useState([]);
	const [grnNumber, setGrnNumber] = useState('');
	const [grnDate, setGrnDate] = useState(null);
	const [invoiceNo, setInvoiceNo] = useState('');
	const [invoiceDate, setInvoiceDate] = useState(null);
	const [grnQuantities, setGrnQuantities] = useState({});
	const [rejectedQuantities, setRejectedQuantities] = useState({});
	const [acceptedQuantities, setAcceptedQuantities] = useState({});
	const [deliveryDates, setDeliveryDates] = useState({});
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const existingGrnNumberSet = useMemo(() => {
		return new Set(
			(existingGrnNumbers ?? [])
				.map(g => (typeof g === 'string' ? g : g?.grnNumber))
				.filter(Boolean)
				.map(g => g.trim().toLowerCase())
		);
	}, [existingGrnNumbers]);

	const isDuplicateGrnNumber = (value) => {
		const normalized = (value ?? '').trim().toLowerCase();
		return normalized !== '' && existingGrnNumberSet.has(normalized);
	};

	useEffect(() => {
		if (open) {
			const selectableItems = lineItems.filter(item => {
				const ordered = Number(item.quantity ?? 0);
				const received = Number(item.totalShipQty ?? 0);
				return Math.max(ordered - received, 0) > 0;
			});

			if (selectableItems.length > 0) {
				setSelectedItems(selectableItems);
				const initialGrnQty = {};
				const initialRejectedQty = {};
				const initialAcceptedQty = {};
				const initialDeliveryDate = {};
				selectableItems.forEach(item => {
					const ordered = Number(item.quantity ?? 0);
					const received = Number(item.totalShipQty ?? 0);
					const available = Math.max(ordered - received, 0);
					initialGrnQty[item.id] = available;
					initialRejectedQty[item.id] = 0;
					initialAcceptedQty[item.id] = available;
					initialDeliveryDate[item.id] = item.poDeliveryDate
						? String(item.poDeliveryDate).slice(0, 10)
						: '';
				});
				setGrnQuantities(initialGrnQty);
				setRejectedQuantities(initialRejectedQty);
				setAcceptedQuantities(initialAcceptedQty);
				setDeliveryDates(initialDeliveryDate);
			} else {
				setSelectedItems([]);
				setGrnQuantities({});
				setRejectedQuantities({});
				setAcceptedQuantities({});
				setDeliveryDates({});
			}

			setGrnNumber('');
			setGrnDate(null);
			setInvoiceNo('');
			setInvoiceDate(null);
			setErrors({});
		}
	}, [open, lineItems]);

	const getAvailableQty = (item) => {
		const ordered = Number(item.quantity ?? 0);
		const received = Number(item.totalShipQty ?? item.receivedQty ?? 0);
		return Math.max(Number((ordered - received).toFixed(8)), 0);
	};

	const handleToggleItem = (item) => {
		setSelectedItems(prev => {
			const isItemSel = prev.some(i => i.id === item.id);
			if (isItemSel) {
				const newGrnQ = { ...grnQuantities };
				const newRejQ = { ...rejectedQuantities };
				const newAccQ = { ...acceptedQuantities };
				const newDelD = { ...deliveryDates };
				delete newGrnQ[item.id];
				delete newRejQ[item.id];
				delete newAccQ[item.id];
				delete newDelD[item.id];
				setGrnQuantities(newGrnQ);
				setRejectedQuantities(newRejQ);
				setAcceptedQuantities(newAccQ);
				setDeliveryDates(newDelD);
				return prev.filter(i => i.id !== item.id);
			} else {
				const available = getAvailableQty(item);
				setGrnQuantities(p => ({ ...p, [item.id]: available }));
				setRejectedQuantities(p => ({ ...p, [item.id]: 0 }));
				setAcceptedQuantities(p => ({ ...p, [item.id]: available }));
				setDeliveryDates(p => ({ ...p, [item.id]: item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : '' }));
				return [...prev, item];
			}
		});
	};

	const handleSelectAll = (e) => {
		if (e.target.checked) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			setSelectedItems(selectableItems);
			const iG = {}, iR = {}, iA = {}, iD = {};
			selectableItems.forEach(item => {
				const avail = getAvailableQty(item);
				iG[item.id] = avail;
				iR[item.id] = 0;
				iA[item.id] = avail;
				iD[item.id] = item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : '';
			});
			setGrnQuantities(iG);
			setRejectedQuantities(iR);
			setAcceptedQuantities(iA);
			setDeliveryDates(iD);
		} else {
			setSelectedItems([]);
			setGrnQuantities({});
			setRejectedQuantities({});
			setAcceptedQuantities({});
			setDeliveryDates({});
		}
	};

	const handleQuantityChange = (itemId, value) => {
		const item = lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		if (value !== '' && Number(value) > available) {
			toast.warning(`GRN quantity cannot exceed the available quantity (${available}).`);
			value = available;
		}
		setGrnQuantities(p => ({ ...p, [itemId]: value }));
		setAcceptedQuantities(p => {
			const cur = p[itemId];
			if (cur !== '' && cur != null && Number(cur) > Number(value || 0)) return { ...p, [itemId]: value };
			return p;
		});
		if (errors[`qty_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`qty_${itemId}`]; return n; });
	};

	const handleRejectedQuantityChange = (itemId, value) => {
		const grnQty = Number(grnQuantities[itemId] || 0);
		let rejectedQty = value;
		if (value !== '') {
			rejectedQty = Number(value);
			if (rejectedQty > grnQty) { toast.warning(`Rejected quantity cannot exceed GRN quantity (${grnQty}).`); rejectedQty = grnQty; }
			if (rejectedQty < 0) rejectedQty = 0;
		}
		setRejectedQuantities(p => ({ ...p, [itemId]: rejectedQty }));
		setAcceptedQuantities(p => {
			const acc = rejectedQty === '' ? p[itemId] : Math.max(grnQty - Number(rejectedQty), 0);
			return { ...p, [itemId]: acc };
		});
		if (errors[`rejected_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`rejected_${itemId}`]; return n; });
		if (errors[`qty_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`qty_${itemId}`]; return n; });
	};

	const handleAcceptedQuantityChange = (itemId, value) => {
		const grnQty = Number(grnQuantities[itemId] || 0);
		let acceptedQty = value;
		if (value !== '') {
			acceptedQty = Number(value);
			if (acceptedQty > grnQty) { toast.warning(`Accepted quantity cannot exceed GRN quantity (${grnQty}).`); acceptedQty = grnQty; }
			if (acceptedQty < 0) acceptedQty = 0;
		}
		setAcceptedQuantities(p => ({ ...p, [itemId]: acceptedQty }));
		if (errors[`accepted_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`accepted_${itemId}`]; return n; });
	};

	const handleDeliveryDateChange = (itemId, value) => {
		setDeliveryDates(p => ({ ...p, [itemId]: value }));
		if (errors[`delivery_${itemId}`]) setErrors(p => { const n = { ...p }; delete n[`delivery_${itemId}`]; return n; });
	};

	const validateForm = () => {
		const newErrors = {};
		if (selectedItems.length === 0) newErrors.submit = 'Please select at least one line item';
		if (isDuplicateGrnNumber(grnNumber)) newErrors.grnNumber = 'This GRN Number already exists.';
		if (!grnDate) newErrors.grnDate = 'GRN Date is required';
		selectedItems.forEach(item => {
			const grnQty = grnQuantities[item.id];
			const rejectedQty = rejectedQuantities[item.id] || 0;
			const acceptedQty = acceptedQuantities[item.id];
			const deliveryDate = deliveryDates[item.id];
			const available = getAvailableQty(item);
			if (!grnQty || grnQty === '' || Number(grnQty) < 0) newErrors[`qty_${item.id}`] = 'Required';
			else if (Number(grnQty) > available) newErrors[`qty_${item.id}`] = `Max: ${available}`;
			if (rejectedQty !== '' && Number(rejectedQty) < 0) newErrors[`rejected_${item.id}`] = 'Must be >= 0';
			else if (Number(rejectedQty) > Number(grnQty || 0)) newErrors[`rejected_${item.id}`] = `Max: ${grnQty || 0}`;
			if (acceptedQty === '' || acceptedQty == null || Number(acceptedQty) < 0) newErrors[`accepted_${item.id}`] = 'Required';
			else if (Number(acceptedQty) > Number(grnQty || 0)) newErrors[`accepted_${item.id}`] = `Max: ${grnQty || 0}`;
			if (Number(acceptedQty || 0) + Number(rejectedQty || 0) > Number(grnQty || 0)) newErrors[`rejected_${item.id}`] = `Accepted + Rejected exceeds GRN Qty (${grnQty || 0})`;
			if (!deliveryDate) newErrors[`delivery_${item.id}`] = 'Required';
		});
		setErrors(newErrors);
		return newErrors;
	};

	const focusFirstError = (newErrors) => {
		const key = Object.keys(newErrors).find(k => k !== 'submit') ?? Object.keys(newErrors)[0];
		if (!key) return;
		requestAnimationFrame(() => {
			const el = document.getElementById(`field-${key}`);
			if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (typeof el.focus === 'function') el.focus(); }
		});
	};

	const handleSubmit = async () => {
		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) { toast.warning('Please fill all mandatory fields.'); focusFirstError(newErrors); return; }
		setSubmitting(true);
		try {
			const grnData = {
				grnNumber: grnNumber.trim(),
				grnDate,
				invoiceNo: invoiceNo.trim(),
				invoiceDate,
				poId: poDetails?.id,
				poNumber: poDetails?.poNumber,
				grnItem: selectedItems.map(item => {
					const receivedQty = Number(grnQuantities[item.id] || 0);
					const rejectedQty = Number(rejectedQuantities[item.id] || 0);
					const acceptedQty = acceptedQuantities[item.id] !== '' && acceptedQuantities[item.id] != null
						? Number(acceptedQuantities[item.id])
						: Math.max(receivedQty - rejectedQty, 0);
					return {
						poItemId: item.id,
						lineItemNo: item.itemNo != null ? String(item.itemNo) : undefined,
						itemCode: item.materialCode ?? item.itemCode ?? undefined,
						receivedQty, rejectedQty, acceptedQty,
						deliveryDate: deliveryDates[item.id] || undefined,
					};
				}),
			};
			await onSubmit(grnData);
			onClose();
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: 'grn_create_error' });
		} finally {
			setSubmitting(false);
		}
	};

	const isItemSelected = (item) => selectedItems.some(i => i.id === item.id);
	const selectableCount = lineItems.filter(item => getAvailableQty(item) > 0).length;
	const allSelectableSelected = selectableCount > 0 && selectedItems.length === selectableCount;
	const someSelected = selectedItems.length > 0 && !allSelectableSelected;

	// Build line item picker columns
	const pickerColumns = [
		{
			key: '__check__',
			label: '',
			width: 44,
			renderHeader: () => (
				<input
					type="checkbox"
					checked={allSelectableSelected}
					ref={el => { if (el) el.indeterminate = someSelected; }}
					onChange={handleSelectAll}
				/>
			),
			renderCell: (_, row) => {
				const sel = isItemSelected(row._item);
				const disabled = row._disabled;
				return (
					<input
						type="checkbox"
						checked={sel}
						disabled={disabled}
						onChange={() => !disabled && handleToggleItem(row._item)}
						onClick={(e) => e.stopPropagation()}
					/>
				);
			},
		},
		{
			key: 'itemNo',
			label: 'Line Item',
			renderCell: (v) => <span style={{ fontWeight: 600, color: '#1976d2' }}>{v ?? '—'}</span>,
		},
		{
			key: 'itemDesc',
			label: 'Material / Description',
			renderCell: (v, row) => (
				<div>
					<div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a1a' }}>{v ?? ''}</div>
					{row._item.materialCode && (
						<div style={{ fontSize: 11, color: '#888' }}>MAT-{row._item.materialCode} | {row._item.uom}</div>
					)}
					<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, row._item)} />
				</div>
			),
		},
		{ key: 'orderedQty', label: 'Ordered Qty' },
		{ key: 'receivedQty', label: 'Received Qty' },
		{
			key: 'openQty',
			label: 'Open Qty',
			renderCell: (v, row) => (
				<span style={{
					display: 'inline-block', padding: '2px 10px', borderRadius: 12,
					fontSize: 11, fontWeight: 600,
					background: row._available > 0 ? '#e3f2fd' : '#f5f5f5',
					color: row._available > 0 ? '#1976d2' : '#999',
				}}>
					{fmtQty(row._available, row._item.uom)}
				</span>
			),
		},
		{
			key: 'grnQty',
			label: 'GRN Qty',
			width: 120,
			renderCell: (_, row) => {
				if (!row._sel) return <span style={{ fontSize: 12, color: '#999' }}>—</span>;
				const err = errors[`qty_${row._item.id}`];
				return (
					<div>
						<input
							id={`field-qty_${row._item.id}`}
							type="number"
							className={`pe-detail-form-input${err ? ' is-invalid' : ''}`}
							value={grnQuantities[row._item.id] ?? ''}
							disabled
							onClick={(e) => e.stopPropagation()}
						/>
						{err && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{err}</div>}
					</div>
				);
			},
		},
		{
			key: 'rejectedQty',
			label: 'Rejected Qty',
			width: 130,
			renderCell: (_, row) => {
				if (!row._sel) return <span style={{ fontSize: 12, color: '#999' }}>—</span>;
				const err = errors[`rejected_${row._item.id}`];
				return (
					<div>
						<input
							id={`field-rejected_${row._item.id}`}
							type="number"
							className="pe-detail-form-input"
							value={rejectedQuantities[row._item.id] ?? ''}
							min={0}
							max={Math.max(Number(grnQuantities[row._item.id] || 0) - Number(acceptedQuantities[row._item.id] || 0), 0)}
							step={1}
							placeholder="Rejected qty"
							onChange={(e) => { e.stopPropagation(); handleRejectedQuantityChange(row._item.id, e.target.value); }}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={(e) => e.stopPropagation()}
						/>
						{err && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{err}</div>}
					</div>
				);
			},
		},
		{
			key: 'acceptedQty',
			label: 'Accepted Qty',
			width: 130,
			renderCell: (_, row) => {
				if (!row._sel) return <span style={{ fontSize: 12, color: '#999' }}>—</span>;
				const err = errors[`accepted_${row._item.id}`];
				return (
					<div>
						<input
							id={`field-accepted_${row._item.id}`}
							type="number"
							className="pe-detail-form-input"
							value={acceptedQuantities[row._item.id] ?? ''}
							min={0}
							max={Math.max(Number(grnQuantities[row._item.id] || 0) - Number(rejectedQuantities[row._item.id] || 0), 0)}
							step={1}
							placeholder="Accepted qty"
							onChange={(e) => { e.stopPropagation(); handleAcceptedQuantityChange(row._item.id, e.target.value); }}
							onClick={(e) => e.stopPropagation()}
							onMouseDown={(e) => e.stopPropagation()}
						/>
						{err && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{err}</div>}
					</div>
				);
			},
		},
		{
			key: 'deliveryDate',
			label: 'Delivery Date',
			width: 155,
			renderCell: (_, row) => {
				if (!row._sel) return <span style={{ fontSize: 12, color: '#999' }}>—</span>;
				const err = errors[`delivery_${row._item.id}`];
				return (
					<div>
						<input
							id={`field-delivery_${row._item.id}`}
							type="date"
							className="pe-detail-form-input"
							value={deliveryDates[row._item.id] ?? ''}
							onChange={(e) => { e.stopPropagation(); handleDeliveryDateChange(row._item.id, e.target.value); }}
							onClick={(e) => e.stopPropagation()}
						/>
						{err && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{err}</div>}
					</div>
				);
			},
		},
	];

	const pickerRows = lineItems.length === 0
		? []
		: lineItems.map((item) => {
			const available = getAvailableQty(item);
			const sel = isItemSelected(item);
			const disabled = available <= 0;
			return {
				_rowId: item.id,
				_item: item,
				_available: available,
				_sel: sel,
				_disabled: disabled,
				itemNo: item.itemNo ?? '—',
				itemDesc: item.itemDesc ?? '—',
				orderedQty: fmtQty(item.quantity, item.uom),
				receivedQty: fmtQty(item.totalShipQty ?? 0, item.uom),
				openQty: null,
				grnQty: null,
				rejectedQty: null,
				acceptedQty: null,
				deliveryDate: null,
			};
		});

	return (
		<PEModal
			open={open}
			onClose={onClose}
			size="lg"
			title="Add GRN"
			footer={
				<>
					<button type="button" className="pe-btn pe-btn--outline" onClick={onClose} disabled={submitting}>
						Cancel
					</button>
					<button
						type="button"
						className="pe-btn pe-btn--primary"
						onClick={handleSubmit}
						disabled={submitting || selectedItems.length === 0}
					>
						{submitting ? (
							<><span className="pe-btn-spinner" /> Creating GRN...</>
						) : (
							<>Create GRN</>
						)}
					</button>
				</>
			}
		>
			{errors.submit && (
				<div style={{ marginBottom: 12, padding: '8px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 6, fontSize: 13, color: '#991b1b' }}>
					{errors.submit}
				</div>
			)}

			{selectedItems.length > 0 && (
				<div className="pe-info-card" style={{ marginBottom: 16 }}>
					<div className="pe-info-card-title">GRN Information</div>
					<div className="pe-info-card-grid" style={{ marginBottom: 12 }}>
						<div>
							<label className="pe-field-label" htmlFor="field-grnNumber">GRN Number</label>
							<input
								id="field-grnNumber"
								type="text"
								className="pe-detail-form-input"
								value={grnNumber}
								placeholder="Enter GRN Number"
								onChange={(e) => {
									const value = e.target.value;
									setGrnNumber(value);
									setErrors(prev => ({
										...prev,
										grnNumber: isDuplicateGrnNumber(value)
											? 'This GRN Number already exists.'
											: undefined,
									}));
								}}
							/>
							{errors.grnNumber && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{errors.grnNumber}</div>}
						</div>
						<div>
							<label className="pe-field-label" htmlFor="field-grnDate">GRN Date <span className="rfq-required-star">*</span> </label>
							<input
								id="field-grnDate"
								type="date"
								className="pe-detail-form-input"
								value={grnDate ?? ''}
								onChange={(e) => {
									setGrnDate(e.target.value);
									if (errors.grnDate) setErrors(p => ({ ...p, grnDate: undefined }));
								}}
							/>
							{errors.grnDate && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{errors.grnDate}</div>}
						</div>
						<div>
							<label className="pe-field-label" htmlFor="field-invoiceNo">Invoice No.</label>
							<input
								id="field-invoiceNo"
								type="text"
								className="pe-detail-form-input"
								value={invoiceNo}
								placeholder="Enter Invoice Number"
								onChange={(e) => {
									setInvoiceNo(e.target.value);
									if (errors.invoiceNo) setErrors(p => ({ ...p, invoiceNo: undefined }));
								}}
							/>
						</div>
						<div>
							<label className="pe-field-label" htmlFor="field-invoiceDate">Invoice Date</label>
							<input
								id="field-invoiceDate"
								type="date"
								className="pe-detail-form-input"
								value={invoiceDate ?? ''}
								onChange={(e) => {
									setInvoiceDate(e.target.value);
									if (errors.invoiceDate) setErrors(p => ({ ...p, invoiceDate: undefined }));
								}}
							/>
						</div>
					</div>
					<div style={{ fontSize: 11, color: '#6b7280' }}>* These values will be applied to all selected line items</div>
				</div>
			)}

			{lineItems.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '32px 0', fontSize: 13, color: '#9ca3af' }}>
					No line items available for GRN
				</div>
			) : (
				<PETableSimple
					columns={pickerColumns}
					rows={pickerRows}
					getRowKey={(row) => row._rowId}
					wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}
				/>
			)}
		</PEModal>
	);
};

export default AddGRNDialog;
