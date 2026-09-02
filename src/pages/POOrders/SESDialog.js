import React, { useState, useEffect } from 'react';
import {
	Dialog, DialogTitle, DialogContent, DialogActions,
	Box, Typography, Button, Collapse,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Checkbox, Paper, TextField, Alert, IconButton, Chip
} from '@mui/material';
import { HiX, HiCheck, HiPlusSm, HiOutlineTrash, HiOutlineLink, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '../../utils/common';

// SESDialog reuses the same structure/patterns as AddGRNDialog/AddASNDialog, adapted
// for Service Entry Sheets (POST /api/sesheader/Add) instead of GRN/ASN.
//
// Per-item layout: a single read-only "Service Qty" (the remaining/serviceable
// quantity for this line item) is shown at the top, and one or more service rows
// ("+ Add Service Line") each carry their own Accepted Qty + Service Start/End
// Date + Attachment — mirroring AddASNDialog's batch rows, where each row's
// Accepted Qty is capped by the quantity remaining after other rows' entries,
// and Remaining Qty is recalculated live as rows are added/edited.

// Converts an ISO datetime string like "2026-08-20T00:00:00" (or a Date) into
// the "yyyy-MM-dd" shape required by <TextField type="date">. Returns null for
// empty/invalid input so callers can fall back to '' at the point of use.
const toDateInputValue = (value) => {
	if (!value) return null;
	const str = String(value);
	return str.slice(0, 10);
};

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
								<TH>Condition Type</TH>
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
									<TD>{c.conditionType ?? '—'}</TD>
									<TD>{c.conditionCategory ?? '—'}</TD>
									<TD>{c.conditionRate ?? '—'}</TD>
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

let lineUid = 0;
const nextLineUid = () => `svcline_${++lineUid}`;

const SESDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, mode = 'add', previewData = null }) => {
	const isPreview = mode === 'preview';
	const [selectedItems, setSelectedItems] = useState([]);
	const [sesNumber, setSesNumber] = useState('');
	const [sesDate, setSesDate] = useState(null);
	const [servicePeriodFrom, setServicePeriodFrom] = useState(null);
	const [servicePeriodTo, setServicePeriodTo] = useState(null);
	const [deliveryDates, setDeliveryDates] = useState({}); // itemId -> delivery date (editable per item)
	const [serviceLines, setServiceLines] = useState({}); // itemId -> [{ uid, startDate, endDate, acceptedQty, attachmentName }]
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

	// Total Accepted Qty entered so far across all service rows for an item —
	// this is what Remaining Qty is computed against (mirrors AddASNDialog's
	// getItemTotalShipQty for batch rows).
	const getItemTotalAcceptedQty = (itemId) =>
		(serviceLines[itemId] ?? []).reduce((sum, l) => sum + Number(l.acceptedQty || 0), 0);

	// Reset state when dialog opens/closes, pre-selecting items passed in
	// (either from the SES tab's own selection or a single line item).
	useEffect(() => {
		if (!open) return;

		if (isPreview && previewData) {
			// previewData is expected to be the COMPLETE SES header object returned
			// by GET /api/sesheader/Find (i.e. previewData = ses, not ses.sesItem[0]).
			// Service Period From/To live ONLY on the header — sesItem[].servicePeriodFrom/To
			// are null in the API response — so they must always be read from the
			// header object itself, never from sesItem.
			//
			// poItemId / acceptedQty / serviceQty, on the other hand, are item-level
			// fields that only exist on sesItem[0]. We derive those from
			// previewData.sesItem[0] here (falling back to previewData directly, in
			// case a caller ever passes an item-shaped object), so the header's
			// service period is never displaced by item-level nulls.
			const firstItem =
				Array.isArray(previewData.sesItem) && previewData.sesItem.length > 0
					? previewData.sesItem[0]
					: previewData;

			const resolvedPoItemId = previewData.poItemId ?? firstItem.poItemId;
			const resolvedAcceptedQty = previewData.acceptedQty ?? firstItem.acceptedQty ?? firstItem.serviceQty ?? '';

			// Primary source is ALWAYS the header. Only if the header itself has no
			// value do we fall back to the item, purely as a defensive measure.
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

	// Handle item selection
	const handleToggleItem = (item) => {
		setSelectedItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				const newSelected = prev.filter(i => i.id !== item.id);
				setServiceLines(prevLines => {
					const next = { ...prevLines };
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
				setServiceLines(prevLines => ({ ...prevLines, [item.id]: makeDefaultLine(item) }));
				setDeliveryDates(prevDates => ({
					...prevDates,
					[item.id]: item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : ''
				}));
				return [...prev, item];
			}
		});
	};

	const handleSelectAll = (event) => {
		if (event.target.checked) {
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

	// Add another service line for an item — this is how one PO service line item
	// gets documented as multiple service periods (each with its own dates/attachment).
	// A new row can only be added while there is still Remaining Quantity (Service
	// Qty minus what's already been allocated as Accepted Qty across existing rows),
	// mirroring AddASNDialog's handleAddBatch.
	const handleAddServiceLine = (itemId) => {
		const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		const remaining = available - getItemTotalAcceptedQty(itemId);

		if (remaining <= 0) {
			toast.warning('No remaining quantity available to add another service line.');
			return;
		}

		setServiceLines(prev => ({
			...prev,
			[itemId]: [...(prev[itemId] ?? []), { uid: nextLineUid(), startDate: '', endDate: '', acceptedQty: '', attachmentName: '' }]
		}));
	};

	const handleRemoveServiceLine = (itemId, uid) => {
		setServiceLines(prev => {
			const rows = (prev[itemId] ?? []).filter(l => l.uid !== uid);
			return { ...prev, [itemId]: rows.length > 0 ? rows : [{ uid: nextLineUid(), startDate: '', endDate: '', acceptedQty: '', attachmentName: '' }] };
		});
	};

	const handleLineFieldChange = (itemId, uid, field, value) => {
		setServiceLines(prev => ({
			...prev,
			[itemId]: (prev[itemId] ?? []).map(l => (l.uid === uid ? { ...l, [field]: value } : l))
		}));
		if (errors[`qty_${itemId}`]) {
			setErrors(prevErrors => {
				const next = { ...prevErrors };
				delete next[`qty_${itemId}`];
				return next;
			});
		}
	};

	// Accepted Qty for a service row — clamped so the sum across all rows for this
	// item never exceeds the item's Service Qty (mirrors AddASNDialog's
	// handleBatchFieldChange, which applies the same rule to batch Ship Qty).
	const handleLineAcceptedQtyChange = (itemId, uid, value) => {
		const item = selectedItems.find(i => i.id === itemId) ?? lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;
		const otherRowsTotal = (serviceLines[itemId] ?? [])
			.filter(l => l.uid !== uid)
			.reduce((sum, l) => sum + Number(l.acceptedQty || 0), 0);
		const maxAllowed = Math.max(available - otherRowsTotal, 0);

		if (value !== '' && Number(value) > maxAllowed) {
			toast.warning(`Accepted quantity cannot exceed the remaining quantity (${maxAllowed}).`);
			value = maxAllowed;
		}

		setServiceLines(prev => ({
			...prev,
			[itemId]: (prev[itemId] ?? []).map(l => (l.uid === uid ? { ...l, acceptedQty: value } : l))
		}));
		if (errors[`qty_${itemId}`]) {
			setErrors(prevErrors => {
				const next = { ...prevErrors };
				delete next[`qty_${itemId}`];
				return next;
			});
		}
	};

	const handleServicePeriodFromChange = (value) => {
		setServicePeriodFrom(value);
		if (errors.servicePeriodFrom || errors.servicePeriodTo) {
			setErrors(prev => {
				const next = { ...prev };
				delete next.servicePeriodFrom;
				delete next.servicePeriodTo;
				return next;
			});
		}
	};

	const handleServicePeriodToChange = (value) => {
		setServicePeriodTo(value);
		if (errors.servicePeriodTo || errors.servicePeriodFrom) {
			setErrors(prev => {
				const next = { ...prev };
				delete next.servicePeriodFrom;
				delete next.servicePeriodTo;
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

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (selectedItems.length === 0) {
			newErrors.submit = 'Please select at least one line item';
		}

		if (!servicePeriodFrom) {
			newErrors.servicePeriodFrom = 'Required';
		}

		if (!servicePeriodTo) {
			newErrors.servicePeriodTo = 'Required';
		}

		if (servicePeriodFrom && servicePeriodTo && new Date(servicePeriodFrom) > new Date(servicePeriodTo)) {
			newErrors.servicePeriodTo = 'Service Period To cannot be before Service Period From';
		}

		selectedItems.forEach(item => {
			const available = getAvailableQty(item);
			const totalAccepted = getItemTotalAcceptedQty(item.id);
			const deliveryDate = deliveryDates[item.id];

			// Total Accepted Quantity across all service rows must never exceed the
			// original Service Quantity (available) for this line item.
			if (!totalAccepted || totalAccepted <= 0) {
				newErrors[`qty_${item.id}`] = 'Enter Accepted Qty for at least one service line';
			} else if (totalAccepted > available) {
				newErrors[`qty_${item.id}`] = `Total Accepted Qty exceeds ${available}`;
			}

			if (!deliveryDate) {
				newErrors[`delivery_${item.id}`] = 'Required';
			}

			// (serviceLines[item.id] ?? []).forEach(line => {
			// 	if (!line.startDate) newErrors[`start_${item.id}_${line.uid}`] = 'Required';
			// 	if (!line.endDate) newErrors[`end_${item.id}_${line.uid}`] = 'Required';
			// });
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};
// Handle Submit
const handleSubmit = async () => {
	if (isPreview) return;
	if (!validateForm()) {
		return;
	}

	setSubmitting(true);

	try {
		// Build the payload in the shape expected by POST /api/sesheader/Add.
		// Each service line for a selected item becomes its own sesItem entry —
		// a single PO line item can therefore be reported as multiple service
		// periods, each with its own Start/End Date and attachment.
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
						lineItemNo:
							item.itemNo != null
								? String(item.itemNo)
								: undefined,
						itemCode:
							item.materialCode ??
							item.itemCode ??
							undefined,
						serviceQty: Number(l.acceptedQty),
						acceptedQty: Number(l.acceptedQty),
						serviceAmount: item.materialPOUnitPrice
							? Number(l.acceptedQty) *
							  Number(item.materialPOUnitPrice)
							: 0,
						serviceStartDate: l.startDate || undefined,
						serviceEndDate: l.endDate || undefined,
						attachmentName: l.attachmentName || undefined,
						deliveryDate:
							deliveryDates[item.id] || undefined,
					}))
			),
		};

		await onSubmit(sesData);
		onClose();
	} 
	catch (error) {
		toast.error(getApiErrorMessage(error), {
			toastId: 'ses_create_error',
		});

	}
	 finally {
		setSubmitting(false);
	}
};

	const handleFileChange = (itemId, uid) => (e) => {
		const file = e.target.files?.[0];
		handleLineFieldChange(itemId, uid, 'attachmentName', file ? file.name : '');
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
							{isPreview ? 'Preview SES' : 'Add SES'}
						</Typography>
						<Typography variant="caption" sx={{ color: '#666' }}>
							{isPreview
								? 'View service entry details in read-only mode'
								: 'Create a Service Entry Sheet for one or multiple PO line items'}
						</Typography>
					</Box>
					<IconButton onClick={onClose} size="small" sx={{ color: '#999' }}>
						<HiX />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent sx={{ p: 3 }}>
				<Box component="fieldset" disabled={isPreview} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
				{errors.submit && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{errors.submit}
					</Alert>
				)}

				{/* Common SES Header Fields - Only show when items are selected */}
				{selectedItems.length > 0 && (
					<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
						<Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>
							Service Sheet Header
						</Typography>
						<Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
							<TextField
								label="Service Sheet No."
								value={sesNumber}
								onChange={(e) => setSesNumber(e.target.value)}
								size="small"
								fullWidth
								placeholder="Enter Service Sheet No."
							/>
							<TextField
								label="Service Sheet Date"
								type="date"
								value={sesDate ?? ''}
								onChange={(e) => setSesDate(e.target.value)}
								size="small"
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Box>
						<Box sx={{ display: 'flex', gap: 3 }}>
							<TextField
								label="Service Period From *"
								type="date"
								value={servicePeriodFrom ?? ''}
								onChange={(e) => handleServicePeriodFromChange(e.target.value)}
								error={!!errors.servicePeriodFrom}
								helperText={errors.servicePeriodFrom}
								size="small"
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								label="Service Period To *"
								type="date"
								value={servicePeriodTo ?? ''}
								onChange={(e) => handleServicePeriodToChange(e.target.value)}
								error={!!errors.servicePeriodTo}
								helperText={errors.servicePeriodTo}
								size="small"
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Box>
						<Typography sx={{ fontSize: 11, color: '#666', mt: 1.5 }}>
							* Delivery Date, Accepted Qty and Service Lines below are per line item
						</Typography>
					</Paper>
				)}

				{/* Line item picker */}
			

				{/* Order Items — per selected item: Delivery Date + Accepted Qty + one or more Service Lines ("+ Add Service Line") */}
				{/* {selectedItems.map(item => { */}
				{lineItems.map(item => {
					const available = getAvailableQty(item);
					const itemLines = serviceLines[item.id] ?? [];
					const itemTotalAccepted = getItemTotalAcceptedQty(item.id);
					const remainingQty = Math.max(available - itemTotalAccepted, 0);
					const qtyError = errors[`qty_${item.id}`];
					const deliveryDateError = errors[`delivery_${item.id}`];

					return (
					<Paper key={item.id} variant="outlined" sx={{ p: 2.5, mb: 2 }}>

	<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>

		<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>

			{/* Checkbox */}
			<Checkbox
				checked={isSelected(item)}
				onChange={() => handleToggleItem(item)}
				size="small"
				sx={{ mt: 1 }}
			/>

			{/* Item No */}
			<Box>
				<Typography sx={{ fontSize: 11, color: '#888' }}>
					Item No
				</Typography>
				<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1976d2' }}>
					{item.itemNo ?? '—'}
				</Typography>
			</Box>


			{/* Description */}
			<Box sx={{ minWidth: 260 }}>
				<Typography sx={{ fontSize: 11, color: '#888' }}>
					Description
				</Typography>
				<Typography sx={{ fontSize: 13, fontWeight: 600 }}>
					{item.itemDesc ?? '—'}
				</Typography>
				<ConditionsAccordion conditions={getItemConditions(poDetails?.poItemConditions, item)} />
			</Box>


			{/* Qty */}
			<Box>
				<Typography sx={{ fontSize: 11, color: '#888' }}>
					Qty / Unit
				</Typography>
				<Typography sx={{ fontSize: 13, fontWeight: 600 }}>
					{fmtQty(item.quantity, item.uom)}
				</Typography>
			</Box>


			{/* Service Qty — read-only/non-editable, shown at the top. This is the
				fixed total (remaining) quantity for this line item that the service
				rows below are entered against. */}
			<Box>
				<Typography sx={{ fontSize: 11, color: '#888' }}>
					Service Qty
				</Typography>
				<Typography sx={{ fontSize: 13, fontWeight: 600 }}>
					{fmtQty(available, item.uom)}
				</Typography>
			</Box>


			{/* Remaining Qty — recalculated live as Accepted Qty is entered/changed
				across the service rows below (Service Qty minus Accepted Qty entered
				so far), mirroring the ASN dialog's Remaining Qty. */}
			<Box>
				<Typography sx={{ fontSize: 11, color: '#888' }}>
					Remaining Qty
				</Typography>
				<Typography sx={{ fontSize: 13, fontWeight: 600, color: remainingQty <= 0 ? '#d32f2f' : '#2e7d32' }}>
					{fmtQty(remainingQty, item.uom)}
				</Typography>
			</Box>


			{/* Delivery Date */}
			<Box sx={{ width:160 }}>
				<TextField
					label="Delivery Date"
					type="date"
					value={deliveryDates[item.id] ?? ''}
					onChange={(e)=>handleDeliveryDateChange(item.id,e.target.value)}
					error={!!deliveryDateError}
					helperText={deliveryDateError}
					size="small"
					fullWidth
					InputLabelProps={{ shrink:true }}
				/>
			</Box>

		</Box>


		{/* Remove */}
		<IconButton
			size="small"
			sx={{color:'#d32f2f'}}
			onClick={()=>handleToggleItem(item)}
		>
			<HiX/>
		</IconButton>

	</Box>


	{qtyError && (
		<Alert severity="error" sx={{mb:1.5,fontSize:12}}>
			{qtyError}
		</Alert>
	)}



	{/* Service Lines */}
	{itemLines.map((line,lIdx)=>{

		const startError = errors[`start_${item.id}_${line.uid}`];
		const endError = errors[`end_${item.id}_${line.uid}`];
		// Cap this row's Accepted Qty by what's left after other rows' entries,
		// so the total across all rows can never exceed the item's Service Qty
		// (mirrors AddASNDialog's per-batch shipQty cap).
		const otherRowsTotal = itemLines
			.filter(l => l.uid !== line.uid)
			.reduce((sum, l) => sum + Number(l.acceptedQty || 0), 0);
		const rowMaxAllowed = Math.max(available - otherRowsTotal, 0);


		return (

			<Box
				key={line.uid}
				sx={{
					display:'flex',
					gap:2,
					alignItems:'flex-start',
					mb:1.5,
					flexWrap:'wrap'
				}}
			>

				<TextField
					label="Accepted Qty *"
					type="number"
					value={line.acceptedQty ?? ''}
					onChange={(e)=>handleLineAcceptedQtyChange(item.id,line.uid,e.target.value)}
					size="small"
					sx={{width:150}}
					inputProps={{ min:0, max: rowMaxAllowed, step:1 }}
				/>


				{/* <TextField
					label="Service Start Date *"
					type="date"
					value={line.startDate ?? ''}
					onChange={(e)=>handleLineFieldChange(item.id,line.uid,'startDate',e.target.value)}
					error={!!startError}
					helperText={startError}
					size="small"
					sx={{width:170}}
					InputLabelProps={{shrink:true}}
				/> */}


				{/* <TextField
					label="Service End Date *"
					type="date"
					value={line.endDate ?? ''}
					onChange={(e)=>handleLineFieldChange(item.id,line.uid,'endDate',e.target.value)}
					error={!!endError}
					helperText={endError}
					size="small"
					sx={{width:170}}
					InputLabelProps={{shrink:true}}
				/> */}


				<Button
					component="label"
					variant="outlined"
					size="small"
					startIcon={<HiOutlineLink/>}
					sx={{height:40,textTransform:'none'}}
				>
					{line.attachmentName || 'Service Attachment'}
					<input
						type="file"
						hidden
						onChange={handleFileChange(item.id,line.uid)}
					/>
				</Button>


				{itemLines.length>1 && (
					<IconButton
						size="small"
						onClick={()=>handleRemoveServiceLine(item.id,line.uid)}
					>
						<HiOutlineTrash/>
					</IconButton>
				)}

			</Box>

		)

	})}


	<Button
		size="small"
		variant="text"
		startIcon={<HiPlusSm/>}
		onClick={()=>handleAddServiceLine(item.id)}
		sx={{
			textTransform:'none',
			fontSize:12,
			color:'#1976d2'
		}}
	>
		Add Service Line
	</Button>


</Paper>
					);
				})}
				</Box>
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
						{submitting ? 'Creating SES...' : 'Create SES'}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default SESDialog;