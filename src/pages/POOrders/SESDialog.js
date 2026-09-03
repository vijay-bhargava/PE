import React, { useState, useEffect } from 'react';
import {
	HiOutlineChevronDown, HiOutlineChevronUp,
	HiPlusSm, HiOutlineTrash, HiOutlineLink
} from 'react-icons/hi';
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

const toDateInputValue = (value) => {
	if (!value) return null;
	return String(value).slice(0, 10);
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

let lineUid = 0;
const nextLineUid = () => `svcline_${++lineUid}`;

const SESDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, mode = 'add', previewData = null }) => {
	const isPreview = mode === 'preview';
	const [selectedItems, setSelectedItems] = useState([]);
	const [sesNumber, setSesNumber] = useState('');
	const [sesDate, setSesDate] = useState(null);
	const [servicePeriodFrom, setServicePeriodFrom] = useState(null);
	const [servicePeriodTo, setServicePeriodTo] = useState(null);
	const [deliveryDates, setDeliveryDates] = useState({});
	const [serviceLines, setServiceLines] = useState({});
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const getAvailableQty = (item) => {
		const ordered = Number(item?.quantity ?? 0);
		const served = Number(item?.totalSesQty ?? 0);
		return Math.max(ordered - served, 0);
	};

	const makeDefaultLine = (item) => ([{
		uid: nextLineUid(),
		startDate: '',
		endDate: '',
		acceptedQty: getAvailableQty(item),
		attachmentName: '',
	}]);

	const getItemTotalAcceptedQty = (itemId) =>
		(serviceLines[itemId] ?? []).reduce((sum, l) => sum + Number(l.acceptedQty || 0), 0);

	useEffect(() => {
		if (!open) return;

		if (isPreview && previewData) {
			const firstItem =
				Array.isArray(previewData.sesItem) && previewData.sesItem.length > 0
					? previewData.sesItem[0]
					: previewData;

			const resolvedPoItemId = previewData.poItemId ?? firstItem.poItemId;
			const resolvedAcceptedQty = previewData.acceptedQty ?? firstItem.acceptedQty ?? firstItem.serviceQty ?? '';
			const headerServicePeriodFrom = previewData.servicePeriodFrom ?? firstItem.servicePeriodFrom ?? null;
			const headerServicePeriodTo = previewData.servicePeriodTo ?? firstItem.servicePeriodTo ?? null;

			const matchedItem = lineItems.find(it => String(it.id) === String(resolvedPoItemId));
			const itemsToShow = matchedItem ? [matchedItem] : lineItems;
			setSelectedItems(itemsToShow);

			const initialLines = {};
			const initialDeliveryDate = {};
			itemsToShow.forEach(item => {
				initialLines[item.id] = [{
					uid: nextLineUid(),
					startDate: toDateInputValue(headerServicePeriodFrom) ?? '',
					endDate: toDateInputValue(headerServicePeriodTo) ?? '',
					acceptedQty: resolvedAcceptedQty,
					attachmentName: '',
				}];
				initialDeliveryDate[item.id] = toDateInputValue(headerServicePeriodTo)
					?? (item.poDeliveryDate ? toDateInputValue(item.poDeliveryDate) : '');
			});
			setServiceLines(initialLines);
			setDeliveryDates(initialDeliveryDate);
			setSesNumber(previewData.sesNumber ?? '');
			setSesDate(toDateInputValue(previewData.sesDate));
			setServicePeriodFrom(toDateInputValue(headerServicePeriodFrom));
			setServicePeriodTo(toDateInputValue(headerServicePeriodTo));
			setErrors({});
			return;
		}

		if (open) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			if (selectableItems.length > 0) {
				setSelectedItems(selectableItems);
				const initialLines = {};
				const initialDeliveryDate = {};
				selectableItems.forEach(item => {
					initialLines[item.id] = makeDefaultLine(item);
					initialDeliveryDate[item.id] = item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : '';
				});
				setServiceLines(initialLines);
				setDeliveryDates(initialDeliveryDate);
			} else {
				setSelectedItems([]);
				setServiceLines({});
				setDeliveryDates({});
			}
			setSesNumber('');
			setSesDate(null);
			setServicePeriodFrom(null);
			setServicePeriodTo(null);
			setErrors({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, lineItems, isPreview, previewData]);

	const handleToggleItem = (item) => {
		setSelectedItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				const newSelected = prev.filter(i => i.id !== item.id);
				setServiceLines(prevLines => { const next = { ...prevLines }; delete next[item.id]; return next; });
				setDeliveryDates(prevDates => { const next = { ...prevDates }; delete next[item.id]; return next; });
				return newSelected;
			} else {
				setServiceLines(prevLines => ({ ...prevLines, [item.id]: makeDefaultLine(item) }));
				setDeliveryDates(prevDates => ({ ...prevDates, [item.id]: item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : '' }));
				return [...prev, item];
			}
		});
	};

	const handleSelectAll = (e) => {
		if (e.target.checked) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			setSelectedItems(selectableItems);
			const initialLines = {};
			const initialDeliveryDate = {};
			selectableItems.forEach(item => {
				initialLines[item.id] = makeDefaultLine(item);
				initialDeliveryDate[item.id] = item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : '';
			});
			setServiceLines(initialLines);
			setDeliveryDates(initialDeliveryDate);
		} else {
			setSelectedItems([]);
			setServiceLines({});
			setDeliveryDates({});
		}
	};

	const handleAddServiceLine = (itemId) => {
		const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		const remaining = available - getItemTotalAcceptedQty(itemId);
		if (remaining <= 0) { toast.warning('No remaining quantity available to add another service line.'); return; }
		setServiceLines(prev => ({
			...prev,
			[itemId]: [...(prev[itemId] ?? []),
			{ uid: nextLineUid(), startDate: '', endDate: '', acceptedQty: '', attachmentName: '' }]
		}));
	};

	const handleRemoveServiceLine = (itemId, uid) => {
		setServiceLines(prev => {
			const rows = (prev[itemId] ?? []).filter(l => l.uid !== uid);
			return {
				...prev,
				[itemId]: rows.length > 0 ? rows : [
					{ uid: nextLineUid(), startDate: '', endDate: '', acceptedQty: '', attachmentName: '' }
				]
			};
		});
	};

	const handleLineFieldChange = (itemId, uid, field, value) => {
		setServiceLines(prev => ({
			...prev,
			[itemId]: (prev[itemId] ?? []).map(l => (l.uid === uid ? { ...l, [field]: value } : l))
		}));
		if (errors[`qty_${itemId}`]) setErrors(prev => { const next = { ...prev }; delete next[`qty_${itemId}`]; return next; });
	};

	const handleLineAcceptedQtyChange = (itemId, uid, value) => {
		const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		const otherRowsTotal = (serviceLines[itemId] ?? []).filter(l => l.uid !== uid).reduce((sum, l) => sum + Number(l.acceptedQty || 0), 0);
		const maxAllowed = Math.max(available - otherRowsTotal, 0);
		if (value !== '' && Number(value) > maxAllowed) {
			toast.warning(`Accepted quantity cannot exceed the remaining quantity (${maxAllowed}).`);
			value = maxAllowed;
		}
		setServiceLines(prev => ({ ...prev, [itemId]: (prev[itemId] ?? []).map(l => (l.uid === uid ? { ...l, acceptedQty: value } : l)) }));
		if (errors[`qty_${itemId}`]) setErrors(prev => { const next = { ...prev }; delete next[`qty_${itemId}`]; return next; });
	};

	const handleDeliveryDateChange = (itemId, value) => {
		setDeliveryDates(prev => ({ ...prev, [itemId]: value }));
		if (errors[`delivery_${itemId}`]) setErrors(prev => { const next = { ...prev }; delete next[`delivery_${itemId}`]; return next; });
	};

	const validateForm = () => {
		const newErrors = {};
		if (selectedItems.length === 0) newErrors.submit = 'Please select at least one line item';
		if (!servicePeriodFrom) newErrors.servicePeriodFrom = 'Required';
		if (!servicePeriodTo) newErrors.servicePeriodTo = 'Required';
		if (servicePeriodFrom && servicePeriodTo && new Date(servicePeriodFrom) > new Date(servicePeriodTo))
			newErrors.servicePeriodTo = 'Service Period To cannot be before Service Period From';

		selectedItems.forEach(item => {
			const available = getAvailableQty(item);
			const totalAccepted = getItemTotalAcceptedQty(item.id);
			if (!totalAccepted || totalAccepted <= 0) newErrors[`qty_${item.id}`] = 'Enter Accepted Qty for at least one service line';
			else if (totalAccepted > available) newErrors[`qty_${item.id}`] = `Total Accepted Qty exceeds ${available}`;
			if (!deliveryDates[item.id]) newErrors[`delivery_${item.id}`] = 'Required';
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (isPreview) return;
		if (!validateForm()) return;
		setSubmitting(true);
		try {
			const sesData = {
				sesNumber: sesNumber.trim(),
				sesDate,
				servicePeriodFrom,
				servicePeriodTo,
				poId: poDetails?.id,
				poNumber: poDetails?.poNumber,
				sesItem: selectedItems.flatMap(item =>
					(serviceLines[item.id] ?? [])
						.filter(l => Number(l.acceptedQty) > 0)
						.map(l => ({
							poItemId: item.id,
							lineItemNo: item.itemNo != null ? String(item.itemNo) : undefined,
							itemCode: item.materialCode ?? item.itemCode ?? undefined,
							serviceQty: Number(l.acceptedQty),
							acceptedQty: Number(l.acceptedQty),
							serviceAmount: item.materialPOUnitPrice ? Number(l.acceptedQty) * Number(item.materialPOUnitPrice) : 0,
							serviceStartDate: l.startDate || undefined,
							serviceEndDate: l.endDate || undefined,
							attachmentName: l.attachmentName || undefined,
							deliveryDate: deliveryDates[item.id] || undefined,
						}))
				),
			};
			await onSubmit(sesData);
			onClose();
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: 'ses_create_error' });
		} finally {
			setSubmitting(false);
		}
	};

	const handleFileChange = (itemId, uid) => (e) => {
		const file = e.target.files?.[0];
		handleLineFieldChange(itemId, uid, 'attachmentName', file ? file.name : '');
	};

	const isSelected = (item) => selectedItems.some(i => i.id === item.id);
	const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
	const allSelectableSelected = selectableItems.length > 0 && selectedItems.length === selectableItems.length;
	const someSelected = selectedItems.length > 0 && !allSelectableSelected;

	// Top-level picker columns (same shape as ASN)
	const lineItemColumns = [
		...(!isPreview ? [{
			key: '__check__',
			label: (
				<input
					type="checkbox"
					checked={allSelectableSelected}
					ref={(el) => { if (el) el.indeterminate = someSelected; }}
					onChange={(e) => handleSelectAll(e)}
					style={{ width: 15, height: 15 }}
				/>
			),
			renderCell: (_, row) => {
				const available = getAvailableQty(row);
				const itemSelected = isSelected(row);
				const isDisabled = available === 0 && !itemSelected;
				return (
					<input
						type="checkbox"
						checked={itemSelected}
						disabled={isDisabled}
						onChange={() => handleToggleItem(row)}
						onClick={(e) => e.stopPropagation()}
						style={{ width: 15, height: 15 }}
					/>
				);
			},
		}] : []),
		{
			key: 'itemCode',
			label: 'Line Item',
			renderCell: (v, row) => (
				<span style={{ fontWeight: 600 }}>{row.itemCode ?? row.itemNo ?? ''}</span>
			),
		},
		{
			key: 'itemDesc',
			label: 'Material / Description',
			renderCell: (v, row) => (
				<>
					<div style={{ fontWeight: 500, color: '#1a1a1a' }}>{row.itemDesc ?? ''}</div>
					{row.materialCode && <div style={{ fontSize: 11, color: '#888' }}>MAT-{row.materialCode} | {row.uom}</div>}
					<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, row)} />
				</>
			),
		},
		{ key: 'quantity', label: 'Ordered Qty', renderCell: (v, row) => fmtQty(v, row.uom) },
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
			title={isPreview ? 'View SES' : 'Add SES'}
			footer={
				<>
					<button type="button" className="pe-btn pe-btn--outline" onClick={onClose} disabled={submitting}>
						{isPreview ? 'Close' : 'Cancel'}
					</button>
					{!isPreview && (
						<button
							type="button"
							className="pe-btn pe-btn--primary"
							onClick={handleSubmit}
							disabled={submitting || selectedItems.length === 0}
						>
							{submitting ? 'Creating SES...' : 'Create SES'}
						</button>
					)}
				</>
			}
		>
			{errors.submit && (
				<div style={{
					padding: '10px 14px', background: '#fee2e2', color: '#991b1b',
					borderRadius: 6, fontSize: 13, marginBottom: 16
				}}>
					{errors.submit}
				</div>
			)}

			{/* SES Header — shown once items are selected */}
			{selectedItems.length > 0 && (
				<div className="pe-info-card" style={{ marginBottom: 20 }}>
					<div className="pe-info-card-title">Service Sheet Header</div>
					<div className="pe-info-card-grid">
						<div>
							<label className="pe-field-label">Service Sheet No.</label>
							<input
								className="pe-detail-form-input"
								type="text"
								value={sesNumber}
								onChange={(e) => setSesNumber(e.target.value)}
								placeholder="Enter Service Sheet No."
								disabled={isPreview}
							/>
						</div>
						<div>
							<label className="pe-field-label">Service Sheet Date</label>
							<input
								className="pe-detail-form-input"
								type="date"
								value={sesDate ?? ''}
								onChange={(e) => setSesDate(e.target.value)}
								disabled={isPreview}
							/>
						</div>
						<div>
							<label className="pe-field-label">Service Period From <span className="rfq-required-star">*</span></label>
							<input
								className="pe-detail-form-input"
								type="date"
								value={servicePeriodFrom ?? ''}
								onChange={(e) => { setServicePeriodFrom(e.target.value); if (errors.servicePeriodFrom) setErrors(p => { const n = { ...p }; delete n.servicePeriodFrom; return n; }); }}
								style={errors.servicePeriodFrom ? { borderColor: '#dc2626' } : {}}
								disabled={isPreview}
							/>
							{errors.servicePeriodFrom && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.servicePeriodFrom}</div>}
						</div>
						<div>
							<label className="pe-field-label">Service Period To <span className="rfq-required-star">*</span></label>
							<input
								className="pe-detail-form-input"
								type="date"
								value={servicePeriodTo ?? ''}
								onChange={(e) => {
									setServicePeriodTo(e.target.value);
									if (errors.servicePeriodTo) setErrors(p => {
										const n = { ...p };
										delete n.servicePeriodTo; return n;
									});
								}}
								style={errors.servicePeriodTo ? { borderColor: '#dc2626' } : {}}
								disabled={isPreview}
							/>
							{errors.servicePeriodTo && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{errors.servicePeriodTo}</div>}
						</div>
					</div>
					<div style={{ fontSize: 11, color: '#6b7280', marginTop: 10 }}>
						* Delivery Date, Accepted Qty and Service Lines below are per line item
					</div>
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

			{/* Per-item: detail row + delivery date + service lines */}
			{selectedItems.map(item => {
				const available = getAvailableQty(item);
				const itemLines = serviceLines[item.id] ?? [];
				const itemTotalAccepted = getItemTotalAcceptedQty(item.id);
				const remainingQty = Math.max(available - itemTotalAccepted, 0);
				const qtyError = errors[`qty_${item.id}`];
				const deliveryDateError = errors[`delivery_${item.id}`];

				const itemDetailColumns = [
					{
						key: 'itemCode',
						label: 'Line Item',
						renderCell: (v, row) => <span style={{ fontWeight: 600 }}>{row.itemCode ?? row.itemNo ?? ''}</span>,
					},
					{
						key: 'itemDesc',
						label: 'Description',
						renderCell: (v, row) => (
							<>
								<div>{row.itemDesc ?? ''}</div>
								<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, row)} />
							</>
						),
					},
					{ key: 'quantity', label: 'Qty / Unit', renderCell: (v, row) => fmtQty(v, row.uom) },
					{ key: '__open__', label: 'Open Qty', renderCell: () => fmtQty(available, item.uom) },
					{
						key: '__remaining__',
						label: 'Remaining Qty',
						renderCell: () => (
							<span style={{ fontWeight: 600, color: remainingQty <= 0 ? '#dc2626' : '#16a34a' }}>
								{fmtQty(remainingQty, item.uom)}
							</span>
						),
					},
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
								✕
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

						{qtyError && (
							<div style={{
								padding: '8px 12px', background: '#fee2e2', color: '#991b1b',
								borderRadius: 6, fontSize: 12, marginBottom: 10
							}}>
								{qtyError}
							</div>
						)}

						{/* Service Lines */}
						{itemLines.map((line, lIdx) => {
							const otherRowsTotal = itemLines.filter(l => l.uid !== line.uid).reduce((sum, l) => sum + Number(l.acceptedQty || 0), 0);
							const rowMaxAllowed = Math.max(available - otherRowsTotal, 0);

							return (
								<div key={line.uid} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 10, flexWrap: 'wrap' }}>
									<div style={{ width: 180 }}>
										<label className="pe-field-label">
											{lIdx === 0 ? 'Accepted Qty' : `Accepted Qty (Line ${lIdx + 1})`}
											<span className="rfq-required-star">*</span>
										</label>
										<input
											className="pe-detail-form-input"
											type="number"
											min={0}
											max={rowMaxAllowed}
											step={1}
											value={line.acceptedQty ?? ''}
											onChange={(e) => handleLineAcceptedQtyChange(item.id, line.uid, e.target.value)}
											disabled={isPreview}
										/>
									</div>

									<div>
										<label className="pe-field-label">Service Attachment</label>
										<label
											style={{
												display: 'inline-flex', alignItems: 'center', gap: 6,
												padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6,
												fontSize: 12, cursor: isPreview ? 'default' : 'pointer',
												background: '#fff', color: '#374151', height: 34,
											}}
										>
											<HiOutlineLink style={{ fontSize: 14 }} />
											{line.attachmentName || 'Attach File'}
											{!isPreview && <input type="file" hidden onChange={handleFileChange(item.id, line.uid)} />}
										</label>
									</div>

									{!isPreview && itemLines.length > 1 && (
										<button
											type="button"
											className="pe-icon-btn pe-icon-btn--delete"
											onClick={() => handleRemoveServiceLine(item.id, line.uid)}
										>
											<HiOutlineTrash />
										</button>
									)}
								</div>
							);
						})}

						{!isPreview && (
							<button
								type="button"
								className="pe-btn pe-btn--link"
								style={{ marginTop: 4 }}
								onClick={() => handleAddServiceLine(item.id)}
							>
								<HiPlusSm /> Add Service Line
							</button>
						)}
					</div>
				);
			})}
		</PEModal>
	);
};

export default SESDialog;
