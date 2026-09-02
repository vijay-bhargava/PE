import React, { useState, useEffect } from 'react';
import {
	Dialog, DialogTitle, DialogContent, DialogActions,
	Box, Typography, Button, Collapse,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Checkbox, Paper, TextField, Alert, IconButton, Chip
} from '@mui/material';
import { HiX, HiCheck, HiPlusSm, HiOutlineTrash, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../../utils/common';

// AddASNDialog reuses the same structure/patterns as AddGRNDialog/SESDialog,
// adapted for Advanced Shipping Notices (POST /api/shipment/Add) instead of GRN/SES.
// Only Material line items with open (unshipped) quantity are eligible — the
// caller (PurchaseOrder) is responsible for pre-filtering `lineItems` accordingly.
//
// Per-item layout (Delivery Date + "+ Add Batch" to split ship qty across
// multiple batches) mirrors the "Create Shipment/Invoice > Order Items" reference UI.

const fmtQty = (q, uom) => (q != null ? `${q} ${uom ?? ''}`.trim() : '—');

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

/** Compact expand/collapse toggle showing a line item's Item-Level Conditions. */
const ConditionsAccordion = ({ conditions = [] }) => {
	const [open, setOpen] = useState(false);
	if (!Array.isArray(conditions) || conditions.length === 0) return null;

	return (
		<Box sx={{ mt: 1 }}>
			<Button
				size="small"
				onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
				startIcon={open ? <HiOutlineChevronUp style={{ fontSize: 12 }} /> : <HiOutlineChevronDown style={{ fontSize: 12 }} />}
				sx={{
					textTransform: 'none', fontSize: 12, fontWeight: 600, color: '#1976d2',
					p: 0.5, minWidth: 'auto', '&:hover': { backgroundColor: 'transparent', color: '#0d47a1' },
				}}
			>
				{conditions.length} Condition{conditions.length > 1 ? 's' : ''}
			</Button>
			<Collapse in={open} timeout="auto" unmountOnExit>
				<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mt: 0.5 }}>
					<Table size="small">
						<TableHead>
							<TableRow>
								{/* <TH>Condition Type</TH> */}
								<TH>Category</TH>
								<TH>Rate</TH>
								<TH>Value</TH>
								<TH>Currency</TH>
								<TH>Calc. Type</TH>
							</TableRow>
						</TableHead>
						<TableBody>
							{conditions.map((c, i) => (
								<TableRow key={c.id ?? i} hover>
									{/* <TD>{c.conditionType ?? '—'}</TD> */}
									<TD>{c.conditionCategory ?? '—'}</TD>
									{/* <TD>{c.conditionRate ?? '—'}</TD> */}
									<TD>{fmtCurrency(c.conditionValue)}</TD>
									<TD>{c.currency ?? '—'}</TD>
									<TD>{c.calculationType ?? '—'}</TD>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Collapse>
		</Box>
	);
};

let batchUid = 0;
const nextBatchUid = () => `batch_${++batchUid}`;

const AddASNDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, mode = 'add', previewData = null }) => {
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
	const [deliveryDates, setDeliveryDates] = useState({}); // itemId -> delivery date (independently editable per item)
	const [batches, setBatches] = useState({}); // itemId -> [{ uid, batchId, shipQty }]
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	// Available quantity for ASN (ordered - already shipped)
	const getAvailableQty = (item) => {
		const ordered = Number(item?.quantity ?? 0);
		const shipped = Number(item?.totalShipQty ?? 0);
		return Math.max(ordered - shipped, 0);
	};

	const makeDefaultBatchRow = (item) => ([{ uid: nextBatchUid(), batchId: '', shipQty: getAvailableQty(item) }]);

	// Reset state when dialog opens/closes, pre-selecting items passed in
	// (either from the ASN tab's own selection or a single line item).
	useEffect(() => {
		if (!open) return;

		if (isPreview && previewData) {
			const details = previewData.shipmentDetails ?? [];
			const matchedItems = lineItems.filter(it =>
				details.some(d => String(d.poCreationDetailId ?? d.poItemId) === String(it.id))
			);
			const itemsToShow = matchedItems.length > 0 ? matchedItems : lineItems;

			setSelectedItems(itemsToShow);
			const initialBatches = {};
			const initialDeliveryDate = {};
			itemsToShow.forEach(item => {
				const itemDetails = details.filter(d => String(d.poCreationDetailId ?? d.poItemId) === String(item.id));
				initialBatches[item.id] = itemDetails.length > 0
					? itemDetails.map(d => ({
						uid: nextBatchUid(),
						batchId: d.batchId ?? '',
						shipQty: d.shipQty ?? '',
					}))
					: makeDefaultBatchRow(item);
				const rowDate = itemDetails[0]?.deliveryDate ?? previewData.deliveryDate;
				initialDeliveryDate[item.id] = rowDate ? String(rowDate).slice(0, 10) : '';
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
			setShippingDate(previewData.shippingDate ? String(previewData.shippingDate).slice(0, 10) : '');
			setErrors({});
			return;
		}

		if (open) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			const poDefaultDelivery =
				poDetails?.deliveryDate ||
				poDetails?.reqDeliveryDate ||
				poDetails?.confirmedDelDate ||
				null;
			const poDefaultDeliveryStr = poDefaultDelivery
				? String(poDefaultDelivery).slice(0, 10)
				: null;

			if (selectableItems.length > 0) {
				setSelectedItems(selectableItems);
				const initialBatches = {};
				const initialDeliveryDate = {};
				selectableItems.forEach(item => {
					initialBatches[item.id] = makeDefaultBatchRow(item);
					initialDeliveryDate[item.id] = item.poDeliveryDate
						? String(item.poDeliveryDate).slice(0, 10)
						: (poDefaultDeliveryStr || '');
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
	}, [open, lineItems, isPreview, previewData, poDetails]);

	// Handle item selection (checkbox) — adding an item seeds one default batch row;
	// removing an item (checkbox or the row's own X) clears its batches/delivery date.
	const handleToggleItem = (item) => {
		setSelectedItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				const newSelected = prev.filter(i => i.id !== item.id);
				setBatches(prevBatches => {
					const next = { ...prevBatches };
					delete next[item.id];
					return next;
				});
				setDeliveryDates(prevDates => {
					const next = { ...prevDates };
					delete next[item.id];
					return next;
				});
				return newSelected;
			} else {
				const poDefaultDelivery =
					poDetails?.deliveryDate ||
					poDetails?.reqDeliveryDate ||
					poDetails?.confirmedDelDate ||
					null;
				const poDefaultDeliveryStr = poDefaultDelivery
					? String(poDefaultDelivery).slice(0, 10)
					: '';
				setBatches(prevBatches => ({ ...prevBatches, [item.id]: makeDefaultBatchRow(item) }));
				setDeliveryDates(prevDates => ({
					...prevDates,
					[item.id]: item.poDeliveryDate
						? String(item.poDeliveryDate).slice(0, 10)
						: poDefaultDeliveryStr
				}));
				return [...prev, item];
			}
		});
	};

	const handleSelectAll = (event) => {
		if (event.target.checked) {
			const selectableItems = lineItems.filter(item => getAvailableQty(item) > 0);
			const poDefaultDelivery =
				poDetails?.deliveryDate ||
				poDetails?.reqDeliveryDate ||
				poDetails?.confirmedDelDate ||
				null;
			const poDefaultDeliveryStr = poDefaultDelivery
				? String(poDefaultDelivery).slice(0, 10)
				: '';
			setSelectedItems(selectableItems);
			const initialBatches = {};
			const initialDeliveryDate = {};
			selectableItems.forEach(item => {
				initialBatches[item.id] = makeDefaultBatchRow(item);
				initialDeliveryDate[item.id] = item.poDeliveryDate
					? String(item.poDeliveryDate).slice(0, 10)
					: poDefaultDeliveryStr;
			});
			setBatches(initialBatches);
			setDeliveryDates(initialDeliveryDate);
		} else {
			setSelectedItems([]);
			setBatches({});
			setDeliveryDates({});
		}
	};

	// Add another batch row for an item — this is how a single line item's ship
	// qty gets split across multiple batches/lots, each shippable independently.
	// A new batch can only be added while there is still Remaining Quantity
	// (Ordered/Available Qty minus what has already been allocated to batches).
	const handleAddBatch = (itemId) => {
		const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		const remaining = available - getItemTotalShipQty(itemId);

		if (remaining <= 0) {
			toast.warning('No remaining quantity available to add another batch.');
			return;
		}

		setBatches(prev => ({
			...prev,
			[itemId]: [...(prev[itemId] ?? []), { uid: nextBatchUid(), batchId: '', shipQty: '' }]
		}));
	};

	const handleRemoveBatch = (itemId, uid) => {
		setBatches(prev => {
			const rows = (prev[itemId] ?? []).filter(b => b.uid !== uid);
			// Always keep at least one batch row while the item is selected.
			return { ...prev, [itemId]: rows.length > 0 ? rows : [{ uid: nextBatchUid(), batchId: '', shipQty: '' }] };
		});
	};

	const handleBatchFieldChange = (itemId, uid, field, value) => {
		if (field === 'shipQty') {
			const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
			const available = item ? getAvailableQty(item) : Infinity;
			const otherBatchesTotal = (batches[itemId] ?? [])
				.filter(b => b.uid !== uid)
				.reduce((sum, b) => sum + Number(b.shipQty || 0), 0);
			const maxAllowed = Math.max(available - otherBatchesTotal, 0);

			if (value !== '' && Number(value) > maxAllowed) {
				toast.warning(`Batch quantity cannot exceed the remaining quantity (${maxAllowed}).`);
				value = maxAllowed;
			}
		}

		setBatches(prev => ({
			...prev,
			[itemId]: (prev[itemId] ?? []).map(b => (b.uid === uid ? { ...b, [field]: value } : b))
		}));
		if (errors[`qty_${itemId}`]) {
			setErrors(prevErrors => {
				const next = { ...prevErrors };
				delete next[`qty_${itemId}`];
				return next;
			});
		}
	};

	const handleDeliveryDateChange = (itemId, value) => {
		setDeliveryDates(prev => ({ ...prev, [itemId]: value }));
		if (errors[`delivery_${itemId}`]) {
			setErrors(prev => {
				const next = { ...prev };
				delete next[`delivery_${itemId}`];
				return next;
			});
		}
	};

	const getItemTotalShipQty = (itemId) => (batches[itemId] ?? []).reduce((sum, b) => sum + Number(b.shipQty || 0), 0);

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (selectedItems.length === 0) {
			newErrors.submit = 'Please select at least one line item';
		}

		if (!shipSlipId || shipSlipId.trim() === '') {
			newErrors.shipSlipId = 'Packing Slip / ASN No. is required';
		}

		if (!shippingDate) {
			newErrors.shippingDate = 'Shipping Date is required';
		}

		selectedItems.forEach(item => {
			const available = getAvailableQty(item);
			const totalQty = getItemTotalShipQty(item.id);

			if (!totalQty || totalQty <= 0) {
				newErrors[`qty_${item.id}`] = 'Enter at least one batch qty';
			} else if (totalQty > available) {
				newErrors[`qty_${item.id}`] = `Total exceeds ${available}`;
			}

			if (!deliveryDates[item.id]) {
				newErrors[`delivery_${item.id}`] = 'Required';
			}
		});

		setErrors(newErrors);
		return newErrors;
	};

	// Scroll/focus to the first invalid field so the user can immediately fix it.
	const focusFirstError = (newErrors) => {
		const keys = Object.keys(newErrors).filter(k => k !== 'submit');
		const key = keys[0] ?? Object.keys(newErrors)[0];
		if (!key) return;
		requestAnimationFrame(() => {
			let el = document.getElementById(`field-${key}`);
			if (!el && key.startsWith('qty_')) {
				el = document.getElementById(`item-${key.slice(4)}`);
			}
			if (!el && key.startsWith('delivery_')) {
				el = document.getElementById(`field-delivery_${key.slice(9)}`);
			}
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				if (typeof el.focus === 'function') el.focus();
			}
		});
	};

	// Handle Submit
	const handleSubmit = async () => {
		if (isPreview) return;
		const newErrors = validateForm();
		if (Object.keys(newErrors).length > 0) {
			toast.warning('Please fill all mandatory fields.');
			focusFirstError(newErrors);
			return;
		}

		setSubmitting(true);

		try {
			// Build the payload in the shape expected by POST /api/shipment/Add.
			// Each batch row for a selected item becomes its own shipmentDetails entry,
			// so a single line item can ship as multiple batches/lots with a shared
			// (but independently editable) delivery date.
			const asnData = {
				shipSlipId: shipSlipId.trim(),
				shipNoticeType,
				carrierName,
				lrShipBillNumber,
				ewayBillNumber,
				shipMethod,
				serviceLevel,
				remarks,

				shippingDate,
				deliveryDate: selectedItems.length > 0
					? (deliveryDates[selectedItems[0].id] || null)
					: null,

				poId: poDetails?.id,
				poNumber: poDetails?.poNumber,

				// ADD STAGES
				stages: {
					eventType: "INV",
					currentStage: "Invoice Raised",
					nextStage: "Under Approval",
					orgId: 0,
					orgGroupId: 0
				},

				shipmentDetails: selectedItems.flatMap(item =>
					(batches[item.id] ?? [])
						.filter(b => Number(b.shipQty) > 0)
						.map(b => ({
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
		}
		catch (error) {
				toast.error(getApiErrorMessage(error), {
					toastId: 'asn_create_error',
				});
			}  finally {
			setSubmitting(false);
		}
	};

	const isSelected = (item) => selectedItems.some(i => i.id === item.id);
	const allSelectableSelected = lineItems.filter(item => getAvailableQty(item) > 0).length > 0 &&
		selectedItems.length === lineItems.filter(item => getAvailableQty(item) > 0).length;
	const someSelected = selectedItems.length > 0 && !allSelectableSelected;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
			PaperProps={{
				sx: { minHeight: '80vh', maxHeight: '90vh' }
			}}
		>
			<DialogTitle sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
							{isPreview ? 'Preview ASN' : 'Add ASN'}
						</Typography>
						<Typography variant="caption" sx={{ color: '#666' }}>
							{isPreview
								? 'View ASN details in read-only mode'
								: 'Create an Advance Shipping Notice for one or multiple PO line items'}
						</Typography>
					</Box>
					<IconButton onClick={onClose} size="small" sx={{ color: '#999' }}>
						<HiX />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ p: 3 }}>
				{errors.submit && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{errors.submit}
					</Alert>
				)}

				{/* Common ASN Fields (Shipping / Tracking) - Only show when items are selected */}
				{selectedItems.length > 0 && (
					<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
						<Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>
							ASN Information
						</Typography>
						<Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
							<TextField
								id="field-shipSlipId"
								label="Packing Slip / ASN No."
								value={shipSlipId}
								onChange={(e) => {
									setShipSlipId(e.target.value);
									if (errors.shipSlipId) {
										setErrors(prev => ({ ...prev, shipSlipId: undefined }));
									}
								}}
								error={!!errors.shipSlipId}
								helperText={errors.shipSlipId}
								size="small"
								fullWidth
								required
								placeholder="Enter Packing Slip / ASN No."
								disabled={isPreview}
							/>
							<TextField
								label="Ship Notice Type"
								value={shipNoticeType}
								onChange={(e) => setShipNoticeType(e.target.value)}
								size="small"
								fullWidth
								placeholder="e.g. Full, Partial"
								disabled={isPreview}
							/>
						</Box>
						<Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
							<TextField
								id="field-shippingDate"
								label="Shipping Date"
								type="date"
								value={shippingDate ?? ''}
								onChange={(e) => {
									setShippingDate(e.target.value);
									if (errors.shippingDate) {
										setErrors(prev => ({ ...prev, shippingDate: undefined }));
									}
								}}
								error={!!errors.shippingDate}
								helperText={errors.shippingDate}
								size="small"
								fullWidth
								required
								InputLabelProps={{ shrink: true }}
								disabled={isPreview}
							/>
							<TextField
								label="Carrier Name"
								value={carrierName}
								onChange={(e) => setCarrierName(e.target.value)}
								size="small"
								fullWidth
								disabled={isPreview}
							/>
						</Box>
						<Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
							<TextField
								label="Service Level"
								value={serviceLevel}
								onChange={(e) => setServiceLevel(e.target.value)}
								size="small"
								fullWidth
								disabled={isPreview}
							/>
							<TextField
								label="Shipping Method"
								value={shipMethod}
								onChange={(e) => setShipMethod(e.target.value)}
								size="small"
								fullWidth
								disabled={isPreview}
							/>
						</Box>
						<Box sx={{ display: 'flex', gap: 3 }}>
							<TextField
								label="AWB / LR / Shipping Bill Number"
								value={lrShipBillNumber}
								onChange={(e) => setLrShipBillNumber(e.target.value)}
								size="small"
								fullWidth
								disabled={isPreview}
							/>
							<TextField
								label="Eway Bill Number"
								value={ewayBillNumber}
								onChange={(e) => setEwayBillNumber(e.target.value)}
								size="small"
								fullWidth
								disabled={isPreview}
							/>
						</Box>
						<TextField
							label="Remarks"
							value={remarks}
							onChange={(e) => setRemarks(e.target.value)}
							size="small"
							fullWidth
							multiline
							minRows={2}
							sx={{ mt: 2 }}
							disabled={isPreview}
						/>
						<Typography sx={{ fontSize: 11, color: '#666', mt: 1.5 }}>
							* Shipping/Tracking values apply to the whole ASN; Delivery Date and batches below are per line item
						</Typography>
					</Paper>
				)}

				{/* Line item picker */}
				{/* <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 260, mb: selectedItems.length > 0 ? 3 : 0 }}>
					<Table stickyHeader size="small">
						<TableHead>
							<TableRow>
								{!isPreview && (
									<TH sx={{ width: 48 }}>
										<Checkbox
											checked={allSelectableSelected}
											indeterminate={someSelected}
											onChange={handleSelectAll}
											size="small"
										/>
									</TH>
								)}
								<TH>Line Item</TH>
								<TH>Material / Description</TH>
								<TH>Ordered Qty</TH>
								<TH>Shipped Qty</TH>
								<TH>Open Qty</TH>
							</TableRow>
						</TableHead>
						<TableBody>
							{lineItems.length === 0 ? (
								<TableRow>
									<TD colSpan={6} align="center" sx={{ py: 4, color: '#999' }}>
										No line items available for ASN
									</TD>
								</TableRow>
							) : (
								lineItems.map((item) => {
									const available = getAvailableQty(item);
									const isItemSelected = isSelected(item);
									const isDisabled = available <= 0;

									return (
										<TableRow
											key={item.id}
											hover
											selected={isItemSelected}
											sx={{
												cursor: isDisabled || isPreview ? 'default' : 'pointer',
												opacity: isDisabled ? 0.5 : 1,
												bgcolor: isItemSelected ? '#f0f7ff' : 'transparent'
											}}
											onClick={() => !isDisabled && !isPreview && handleToggleItem(item)}
										>
											{!isPreview && (
												<TD>
													<Checkbox
														checked={isItemSelected}
														disabled={isDisabled}
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
														MAT-{item.materialCode} | {item.uom}
													</Typography>
												)}
												<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, item)} />
											</TD>
											<TD>{fmtQty(item.quantity, item.uom)}</TD>
											<TD>{fmtQty(item.totalShipQty ?? 0, item.uom)}</TD>
											<TD>
												<Chip
													label={fmtQty(available, item.uom)}
													size="small"
													sx={{
														bgcolor: available > 0 ? '#e3f2fd' : '#f5f5f5',
														color: available > 0 ? '#1976d2' : '#999',
														fontWeight: 600,
														fontSize: 11
													}}
												/>
											</TD>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</TableContainer> */}

				{/* Order Items — per selected item: Delivery Date + one or more Batches ("+ Add Batch") */}
				{selectedItems.map(item => {
					const available = getAvailableQty(item);
					const itemBatches = batches[item.id] ?? [];
					const itemTotalShipQty = getItemTotalShipQty(item.id);
					const remainingQty = Math.max(available - itemTotalShipQty, 0);
					const qtyError = errors[`qty_${item.id}`];
					const deliveryDateError = errors[`delivery_${item.id}`];

					return (
						<Paper key={item.id} id={`item-${item.id}`} variant="outlined" sx={{ p: 2.5, mb: 2 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
								<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
									<Box>
										<Typography sx={{ fontSize: 11, color: '#888' }}>Item No</Typography>
										<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1976d2' }}>{item.itemNo ?? '—'}</Typography>
									</Box>
									<Box>
										<Typography sx={{ fontSize: 11, color: '#888' }}>Description</Typography>
										<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.itemDesc ?? '—'}</Typography>
										<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, item)} />
									</Box>
									<Box>
										<Typography sx={{ fontSize: 11, color: '#888' }}>Qty / Unit</Typography>
										<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{fmtQty(item.quantity, item.uom)}</Typography>
									</Box>
									<Box>
										<Typography sx={{ fontSize: 11, color: '#888' }}>Open Qty</Typography>
										<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{fmtQty(available, item.uom)}</Typography>
									</Box>
									<Box>
										{!isPreview && (
    <Box>
        <Typography sx={{ fontSize: 11, color: '#888' }}>
            Remaining Qty
        </Typography>
        <Typography
            sx={{
                fontSize: 13,
                fontWeight: 600,
                color: remainingQty <= 0 ? '#d32f2f' : '#2e7d32'
            }}
        >
            {fmtQty(remainingQty, item.uom)}
        </Typography>
    </Box>
)}
										{/* <Typography sx={{ fontSize: 11, color: '#888' }}>Remaining Qty</Typography>
										<Typography sx={{ fontSize: 13, fontWeight: 600, color: remainingQty <= 0 ? '#d32f2f' : '#2e7d32' }}>
											{fmtQty(remainingQty, item.uom)}
										</Typography> */}
									</Box>
									<Box sx={{ minWidth: 160 }}>
										<TextField
											id={`field-delivery_${item.id}`}
											label="Delivery Date"
											type="date"
											value={deliveryDates[item.id] ?? ''}
											onChange={(e) => handleDeliveryDateChange(item.id, e.target.value)}
											error={!!deliveryDateError}
											helperText={deliveryDateError}
											size="small"
											fullWidth
											required
											InputLabelProps={{ shrink: true }}
											disabled={isPreview}
										/>
									</Box>
								</Box>
								{!isPreview && (
									<IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleToggleItem(item)}>
										<HiX />
									</IconButton>
								)}
							</Box>

							{qtyError && (
								<Alert severity="error" sx={{ mb: 1.5, fontSize: 12 }}>{qtyError}</Alert>
							)}

							{itemBatches.map((batch, bIdx) => {
								const otherBatchesTotal = itemBatches
									.filter(b => b.uid !== batch.uid)
									.reduce((sum, b) => sum + Number(b.shipQty || 0), 0);
								const batchMaxAllowed = Math.max(available - otherBatchesTotal, 0);

								return (
								<Box key={batch.uid} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
									<TextField
										label={bIdx === 0 ? 'Ship Qty *' : `Ship Qty (Batch ${bIdx + 1}) *`}
										type="number"
										value={batch.shipQty ?? ''}
										onChange={(e) => handleBatchFieldChange(item.id, batch.uid, 'shipQty', e.target.value)}
										size="small"
										sx={{ width: 180 }}
										inputProps={{ min: 0, max: batchMaxAllowed, step: 1 }}
										disabled={isPreview}
									/>
									<TextField
										label="Supplier Batch Id"
										value={batch.batchId ?? ''}
										onChange={(e) => handleBatchFieldChange(item.id, batch.uid, 'batchId', e.target.value)}
										size="small"
										sx={{ flex: 1 }}
										placeholder="Optional"
										disabled={isPreview}
									/>
									{!isPreview && itemBatches.length > 1 && (
										<IconButton size="small" onClick={() => handleRemoveBatch(item.id, batch.uid)} sx={{ color: '#999' }}>
											<HiOutlineTrash />
										</IconButton>
									)}
								</Box>
								);
							})}

							{!isPreview && (
								<Button
									size="small"
									variant="text"
									startIcon={<HiPlusSm />}
									sx={{ textTransform: 'none', fontSize: 12, color: '#1976d2', mt: 0.5 }}
									onClick={() => handleAddBatch(item.id)}
								>
									Add Batch
								</Button>
							)}
						</Paper>
					);
				})}
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
				<Button
					onClick={onClose}
					variant="outlined"
					disabled={submitting}
					sx={{ textTransform: 'none' }}
				>
					{isPreview ? 'Close' : 'Cancel'}
				</Button>

				<Box sx={{ flex: 1 }} />

				{!isPreview && (
					<Button
						onClick={handleSubmit}
						variant="contained"
						startIcon={<HiCheck />}
						disabled={submitting || selectedItems.length === 0}
						sx={{ textTransform: 'none' }}
					>
						{submitting ? 'Creating ASN...' : 'Create ASN'}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default AddASNDialog;
