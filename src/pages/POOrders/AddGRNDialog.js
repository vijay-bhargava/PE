import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog, DialogTitle, DialogContent, DialogActions,
	Box, Typography, Button, Collapse,
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
	Checkbox, Paper, TextField, Alert, IconButton, Chip
} from '@mui/material';
import { HiX, HiCheck, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { formatDateViaTimeZone, formatoption } from '../../utils/common/utility';
import { getApiErrorMessage } from '../../utils/common';

const fmtDate = (d) => (d ? formatDateViaTimeZone(d, 'en-GB', formatoption) : '—');

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

const AddGRNDialog = ({ open, onClose, poDetails, lineItems = [], onSubmit, existingGrnNumbers = [] }) => {
	const [selectedItems, setSelectedItems] = useState([]);
	const [grnNumber, setGrnNumber] = useState('');
	const [grnDate, setGrnDate] = useState(null);
	const [invoiceNo, setInvoiceNo] = useState('');
	const [invoiceDate, setInvoiceDate] = useState(null);
	const [grnQuantities, setGrnQuantities] = useState({}); // itemId -> quantity
	const [rejectedQuantities, setRejectedQuantities] = useState({}); // itemId -> rejected quantity
	const [acceptedQuantities, setAcceptedQuantities] = useState({}); // itemId -> accepted quantity (editable per item)
	const [deliveryDates, setDeliveryDates] = useState({}); // itemId -> delivery date (editable per item)
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	// Normalized (trimmed, lowercased) set of GRN Numbers already used on this PO,
	// so we can block the user from entering a duplicate one.
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

	// Reset state when dialog opens/closes, but pre-select items if they were selected from GRN tab
	useEffect(() => {
		if (open) {
			// Check if lineItems are pre-filtered (already selected from GRN tab)
			// If yes, auto-select them all
			const selectableItems = lineItems.filter(item => {
				const ordered = Number(item.quantity ?? 0);
				const received = Number(item.totalShipQty ?? 0);
				const available = Math.max(ordered - received, 0);
				return available > 0;
			});

			if (selectableItems.length > 0) {
				// Pre-select all available items and initialize quantities
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
					// Default each row's delivery date to the line item's PO delivery date, if any —
					// still independently editable per selected item.
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


	// Handle item selection
	const handleToggleItem = (item) => {
		setSelectedItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				// Remove from selection and clear quantities
				const newSelected = prev.filter(i => i.id !== item.id);
				const newGrnQuantities = { ...grnQuantities };
				const newRejectedQuantities = { ...rejectedQuantities };
				const newAcceptedQuantities = { ...acceptedQuantities };
				const newDeliveryDates = { ...deliveryDates };
				delete newGrnQuantities[item.id];
				delete newRejectedQuantities[item.id];
				delete newAcceptedQuantities[item.id];
				delete newDeliveryDates[item.id];
				setGrnQuantities(newGrnQuantities);
				setRejectedQuantities(newRejectedQuantities);
				setAcceptedQuantities(newAcceptedQuantities);
				setDeliveryDates(newDeliveryDates);
				return newSelected;
			} else {
				// Add to selection and initialize quantities
				const available = getAvailableQty(item);
				setGrnQuantities(prev => ({
					...prev,
					[item.id]: available
				}));
				setRejectedQuantities(prev => ({
					...prev,
					[item.id]: 0
				}));
				setAcceptedQuantities(prev => ({
					...prev,
					[item.id]: available
				}));
				setDeliveryDates(prev => ({
					...prev,
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
			// Initialize quantities for all
			const initialGrnQty = {};
			const initialRejectedQty = {};
			const initialAcceptedQty = {};
			const initialDeliveryDate = {};
			selectableItems.forEach(item => {
				initialGrnQty[item.id] = getAvailableQty(item);
				initialRejectedQty[item.id] = 0;
				initialAcceptedQty[item.id] = getAvailableQty(item);
				initialDeliveryDate[item.id] = item.poDeliveryDate ? String(item.poDeliveryDate).slice(0, 10) : '';
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
	};

	// Calculate available quantity for GRN (ordered - already received)
	const getAvailableQty = (item) => {
		const ordered = Number(item.quantity ?? 0);
		const received = Number(item.totalShipQty ?? item.receivedQty ?? 0);
		return Math.max(Number((ordered - received).toFixed(8)), 0);
	};

	// Validate form
	const validateForm = () => {
		const newErrors = {};

		if (selectedItems.length === 0) {
			newErrors.submit = 'Please select at least one line item';
		}

		// if (!grnNumber || grnNumber.trim() === '') {
		// 	newErrors.grnNumber = 'GRN Number is required';
		// }

		// GRN Number, if provided, must not duplicate one already used on this PO.
		if (isDuplicateGrnNumber(grnNumber)) {
			newErrors.grnNumber = 'This GRN Number already exists. Please enter a different one.';
		}

		if (!grnDate) {
			newErrors.grnDate = 'GRN Date is required';
		}

		// Validate quantities for each selected item
		selectedItems.forEach(item => {
			const grnQty = grnQuantities[item.id];
			const rejectedQty = rejectedQuantities[item.id] || 0;
			const acceptedQty = acceptedQuantities[item.id];
			const deliveryDate = deliveryDates[item.id];
			const available = getAvailableQty(item);

			// Validate GRN Quantity
			if (!grnQty || grnQty === '' || Number(grnQty) < 0) {
				newErrors[`qty_${item.id}`] = 'Required';
			} else if (Number(grnQty) > available) {
				newErrors[`qty_${item.id}`] = `Max: ${available}`;
			}

			// Validate Rejected Quantity
			if (rejectedQty !== '' && Number(rejectedQty) < 0) {
				newErrors[`rejected_${item.id}`] = 'Must be >= 0';
			} else if (Number(rejectedQty) > Number(grnQty || 0)) {
				// Rejected Qty is a split of GRN Qty, not additional to it —
				// it can never be greater than the GRN Qty itself.
				newErrors[`rejected_${item.id}`] = `Max: ${grnQty || 0}`;
			}

			// Validate Accepted Quantity — each selected item carries its own
			// independently editable Accepted Quantity (defaults to GRN Qty).
			if (acceptedQty === '' || acceptedQty == null || Number(acceptedQty) < 0) {
				newErrors[`accepted_${item.id}`] = 'Required';
			} else if (Number(acceptedQty) > Number(grnQty || 0)) {
				newErrors[`accepted_${item.id}`] = `Max: ${grnQty || 0}`;
			}

			// Validate that Accepted + Rejected together don't exceed GRN Qty
			// (they represent a split of GRN Qty, not additive amounts on top of it).
			const splitTotal = Number(acceptedQty || 0) + Number(rejectedQty || 0);
			if (splitTotal > Number(grnQty || 0)) {
				newErrors[`rejected_${item.id}`] = `Accepted + Rejected exceeds GRN Qty (${grnQty || 0})`;
			}

			// Validate Delivery Date — each selected item carries its own
			// independently editable Delivery Date.
			if (!deliveryDate) {
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
			if (!el && (key.startsWith('qty_') || key.startsWith('rejected_') || key.startsWith('accepted_') || key.startsWith('delivery_'))) {
				const itemId = key.slice(key.indexOf('_') + 1);
				el = document.getElementById(`field-${key}`) || document.getElementById(`item-${itemId}`);
			}
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				if (typeof el.focus === 'function') el.focus();
			}
		});
	};

	// Handle Submit
	const handleSubmit = async () => {
		const newErrors = validateForm();

		if (Object.keys(newErrors).length > 0) {
			toast.warning('Please fill all mandatory fields.');
			focusFirstError(newErrors);
			return;
		}

		setSubmitting(true);

		try {
			// Build the payload in the shape expected by POST /api/grnheader/Add.
			// Only the selected line items are included in grnItem — matching the
			// task requirement that unselected PO line items are never sent.
			const grnData = {
				grnNumber: grnNumber.trim(),
				grnDate: grnDate,
				invoiceNo: invoiceNo.trim(),
				invoiceDate: invoiceDate,
				poId: poDetails?.id,
				poNumber: poDetails?.poNumber,
				grnItem: selectedItems.map(item => {
					const receivedQty = Number(grnQuantities[item.id] || 0);
					const rejectedQty = Number(rejectedQuantities[item.id] || 0);

					const acceptedQty =
						acceptedQuantities[item.id] !== '' &&
							acceptedQuantities[item.id] != null
							? Number(acceptedQuantities[item.id])
							: Math.max(receivedQty - rejectedQty, 0);

					return {
						poItemId: item.id,
						lineItemNo:
							item.itemNo != null
								? String(item.itemNo)
								: undefined,
						itemCode:
							item.materialCode ??
							item.itemCode ??
							undefined,
						receivedQty,
						rejectedQty,
						acceptedQty,
						// Each selected line item can carry its own delivery date.
						deliveryDate: deliveryDates[item.id] || undefined,
					};
				}),
			};

			await onSubmit(grnData);
			onClose();
		} catch (error) {


			toast.error(getApiErrorMessage(error), {
				toastId: 'grn_create_error'
			});
		} finally {
			setSubmitting(false);
		}
	};

	// Handle quantity change — GRN Quantity must never exceed the Ordered/Available
	// (ASN) quantity for this line item; clamp and warn if the user tries to exceed it.
	const handleQuantityChange = (itemId, value) => {
		const item = lineItems.find(i => i.id === itemId);
		const available = item ? getAvailableQty(item) : Infinity;

		if (value !== '' && Number(value) > available) {
			toast.warning(`GRN quantity cannot exceed the available quantity (${available}).`);
			value = available;
		}

		setGrnQuantities(prev => ({
			...prev,
			[itemId]: value
		}));
		// Clamp Accepted Qty down if it now exceeds the new GRN Qty.
		setAcceptedQuantities(prev => {
			const currentAccepted = prev[itemId];
			if (currentAccepted !== '' && currentAccepted != null && Number(currentAccepted) > Number(value || 0)) {
				return { ...prev, [itemId]: value };
			}
			return prev;
		});
		// Clear error for this field
		if (errors[`qty_${itemId}`]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[`qty_${itemId}`];
				return newErrors;
			});
		}
	};

	// Handle rejected quantity change — Rejected Qty must never push (GRN + Rejected)
	// above the available quantity.
	// Handle rejected quantity change
	// Rejected Qty cannot exceed GRN Qty.
	// Accepted Qty + Rejected Qty cannot exceed GRN Qty.
	const handleRejectedQuantityChange = (itemId, value) => {
		const grnQty = Number(grnQuantities[itemId] || 0);

		let rejectedQty = value;

		// Allow empty input while typing
		if (value !== '') {
			rejectedQty = Number(value);

			// Rejected Qty is a split of GRN Qty, so it can never exceed GRN Qty.
			if (rejectedQty > grnQty) {
				toast.warning(
					`Rejected quantity cannot exceed GRN quantity (${grnQty}).`
				);
				rejectedQty = grnQty;
			}

			// Negative value protection
			if (rejectedQty < 0) {
				rejectedQty = 0;
			}
		}

		setRejectedQuantities(prev => ({
			...prev,
			[itemId]: rejectedQty
		}));

		// Keep Accepted Qty in sync with the new Rejected Qty (Accepted = GRN − Rejected),
		// since editing Rejected Qty directly is also a valid entry path.
		setAcceptedQuantities(prev => {
			const acceptedQty = rejectedQty === '' ? prev[itemId] : Math.max(grnQty - Number(rejectedQty), 0);
			return { ...prev, [itemId]: acceptedQty };
		});

		// Clear rejected quantity error
		if (errors[`rejected_${itemId}`]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[`rejected_${itemId}`];
				return newErrors;
			});
		}

		// Clear related quantity error
		if (errors[`qty_${itemId}`]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[`qty_${itemId}`];
				return newErrors;
			});
		}
	};
	// Handle accepted quantity change
	// Accepted Qty + Rejected Qty cannot exceed GRN Qty.
	const handleAcceptedQuantityChange = (itemId, value) => {
		const grnQty = Number(grnQuantities[itemId] || 0);

		let acceptedQty = value;

		// Allow empty input while typing
		if (value !== '') {
			acceptedQty = Number(value);

			// Accepted Qty cannot exceed GRN Qty
			if (acceptedQty > grnQty) {
				toast.warning(
					`Accepted quantity cannot exceed GRN quantity (${grnQty}).`
				);
				acceptedQty = grnQty;
			}

			// Negative value protection
			if (acceptedQty < 0) {
				acceptedQty = 0;
			}
		}

		setAcceptedQuantities(prev => ({
			...prev,
			[itemId]: acceptedQty
		}));

		// Rejected Qty is NOT auto-calculated from Accepted Qty — it stays whatever
		// the user has explicitly entered (defaulting to 0) and is only ever changed
		// by editing the Rejected Qty field directly.

		if (errors[`accepted_${itemId}`]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[`accepted_${itemId}`];
				return newErrors;
			});
		}
	};
	// const handleRejectedQuantityChange = (itemId, value) => {
	// 	const item = lineItems.find(i => i.id === itemId);
	// 	const available = item ? getAvailableQty(item) : Infinity;
	// 	const grnQty = Number(grnQuantities[itemId] || 0);
	// 	const maxRejected = Math.max(available - grnQty, 0);

	// 	if (value !== '' && Number(value) > maxRejected) {
	// 		toast.warning(`Rejected quantity cannot exceed ${maxRejected}.`);
	// 		value = maxRejected;
	// 	}

	// 	setRejectedQuantities(prev => ({
	// 		...prev,
	// 		[itemId]: value
	// 	}));
	// 	// Clear error for this field
	// 	if (errors[`rejected_${itemId}`]) {
	// 		setErrors(prev => {
	// 			const newErrors = { ...prev };
	// 			delete newErrors[`rejected_${itemId}`];
	// 			return newErrors;
	// 		});
	// 	}
	// 	// Also clear qty error since total might now be valid
	// 	if (errors[`qty_${itemId}`]) {
	// 		setErrors(prev => {
	// 			const newErrors = { ...prev };
	// 			delete newErrors[`qty_${itemId}`];
	// 			return newErrors;
	// 		});
	// 	}
	// };

	// Handle accepted quantity change (independent per selected item) — Accepted Qty
	// must never exceed the corresponding (GRN) Total Quantity for that item.
	// const handleAcceptedQuantityChange = (itemId, value) => {
	// 	const grnQty = Number(grnQuantities[itemId] || 0);

	// 	if (value !== '' && Number(value) > grnQty) {
	// 		toast.warning(`Accepted quantity cannot exceed the GRN quantity (${grnQty}).`);
	// 		value = grnQty;
	// 	}

	// 	setAcceptedQuantities(prev => ({
	// 		...prev,
	// 		[itemId]: value
	// 	}));
	// 	if (errors[`accepted_${itemId}`]) {
	// 		setErrors(prev => {
	// 			const newErrors = { ...prev };
	// 			delete newErrors[`accepted_${itemId}`];
	// 			return newErrors;
	// 		});
	// 	}
	// };

	// Handle delivery date change (independent per selected item)
	const handleDeliveryDateChange = (itemId, value) => {
		setDeliveryDates(prev => ({
			...prev,
			[itemId]: value
		}));
		if (errors[`delivery_${itemId}`]) {
			setErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[`delivery_${itemId}`];
				return newErrors;
			});
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
							Add GRN
						</Typography>
						<Typography variant="caption" sx={{ color: '#666' }}>
							Create a GRN for one or multiple PO line items
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

				{/* Common GRN Fields - Only show when items are selected */}
				{selectedItems.length > 0 && (
					<Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
						<Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>
							GRN Information
						</Typography>
						<Box sx={{ display: 'flex', gap: 3 }}>
							<TextField
								id="field-grnNumber"
								label="GRN Number"
								value={grnNumber}
								onChange={(e) => {
									const value = e.target.value;
									setGrnNumber(value);
									setErrors(prev => ({
										...prev,
										grnNumber: isDuplicateGrnNumber(value)
											? 'This GRN Number already exists. Please enter a different one.'
											: undefined,
									}));
								}}
								error={!!errors.grnNumber}
								helperText={errors.grnNumber}
								size="small"
								fullWidth
								// required
								placeholder="Enter GRN Number"
							/>
							<TextField
								id="field-grnDate"
								label="GRN Date"
								type="date"
								value={grnDate ?? ''}
								onChange={(e) => {
									setGrnDate(e.target.value);
									if (errors.grnDate) {
										setErrors(prev => ({ ...prev, grnDate: undefined }));
									}
								}}
								error={!!errors.grnDate}
								helperText={errors.grnDate}
								size="small"
								fullWidth
								required
								InputLabelProps={{ shrink: true }}
							/>
						</Box>
						<Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
							<TextField
								id="field-invoiceNo"
								label="Invoice No."
								value={invoiceNo}
								onChange={(e) => {
									setInvoiceNo(e.target.value);
									if (errors.invoiceNo) {
										setErrors(prev => ({ ...prev, invoiceNo: undefined }));
									}
								}}
								error={!!errors.invoiceNo}
								helperText={errors.invoiceNo}
								size="small"
								fullWidth
								placeholder="Enter Invoice Number"
							/>
							<TextField
								id="field-invoiceDate"
								label="Invoice Date"
								type="date"
								value={invoiceDate ?? ''}
								onChange={(e) => {
									setInvoiceDate(e.target.value);
									if (errors.invoiceDate) {
										setErrors(prev => ({ ...prev, invoiceDate: undefined }));
									}
								}}
								error={!!errors.invoiceDate}
								helperText={errors.invoiceDate}
								size="small"
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>
						</Box>
						<Typography sx={{ fontSize: 11, color: '#666', mt: 1.5 }}>
							* These values will be applied to all selected line items
						</Typography>
					</Paper>
				)}

				<TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
					<Table stickyHeader size="small">
						<TableHead>
							<TableRow>
								<TH sx={{ width: 48 }}>
									<Checkbox
										checked={allSelectableSelected}
										indeterminate={someSelected}
										onChange={handleSelectAll}
										size="small"
									/>
								</TH>
								<TH>Line Item</TH>
								<TH>Material / Description</TH>
								<TH>Ordered Qty</TH>
								<TH>Received Qty</TH>
								<TH>Open Qty</TH>
								{/* <TH sx={{ minWidth: 100 }}>Total Qty</TH> */}
								<TH sx={{ minWidth: 120 }}>GRN Qty</TH>
								<TH sx={{ minWidth: 120 }}>Rejected Qty</TH>
								<TH sx={{ minWidth: 130 }}>Accepted Qty</TH>
								<TH sx={{ minWidth: 150 }}>Delivery Date</TH>
							</TableRow>
						</TableHead>
						<TableBody>
							{lineItems.length === 0 ? (
								<TableRow>
									<TD colSpan={10} align="center" sx={{ py: 4, color: '#999' }}>
										No line items available for GRN
									</TD>
								</TableRow>
							) : (
								lineItems.map((item) => {
									const available = getAvailableQty(item);
									const isItemSelected = isSelected(item);
									const isDisabled = available <= 0;
									const qtyError = errors[`qty_${item.id}`];
									const rejectedQtyError = errors[`rejected_${item.id}`];
									const acceptedQtyError = errors[`accepted_${item.id}`];
									const deliveryDateError = errors[`delivery_${item.id}`];

									return (
										<TableRow
											key={item.id}
											hover
											selected={isItemSelected}
											sx={{
												cursor: isDisabled ? 'not-allowed' : 'pointer',
												opacity: isDisabled ? 0.5 : 1,
												bgcolor: isItemSelected ? '#f0f7ff' : 'transparent'
											}}
											onClick={() => !isDisabled && handleToggleItem(item)}
										>
											<TD>
												<Checkbox
													checked={isItemSelected}
													disabled={isDisabled}
													size="small"
													onChange={() => handleToggleItem(item)}
													onClick={(e) => e.stopPropagation()}
												/>
											</TD>
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
											{/* <TD>

												<TextField
													type="number"
													value={item.quantity ?? ''}
													size="small"
													fullWidth
													disabled
													onClick={(e) => e.stopPropagation()}
												/>
											</TD> */}
											<TD>
												{isItemSelected ? (
													<TextField
														id={`field-qty_${item.id}`}
														type="number"
														value={grnQuantities[item.id] ?? ''}
														size="small"
														fullWidth
														disabled
														onClick={(e) => e.stopPropagation()}
														error={!!qtyError}
														helperText={qtyError}
													/>
												) : (
													<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
												)}
											</TD>
											<TD>
												{isItemSelected ? (
													<TextField
														id={`field-rejected_${item.id}`}
														type="number"
														value={rejectedQuantities[item.id] ?? ''}
														onChange={(e) => {
															e.stopPropagation();
															handleRejectedQuantityChange(item.id, e.target.value);
														}}
														onClick={(e) => e.stopPropagation()}
														onMouseDown={(e) => e.stopPropagation()}
														error={!!rejectedQtyError}
														helperText={rejectedQtyError}
														size="small"
														fullWidth
														inputProps={{
															min: 0,
															max: Math.max(
																Number(grnQuantities[item.id] || 0) -
																Number(acceptedQuantities[item.id] || 0),
																0
															),
															step: 1
														}}
														placeholder="Enter rejected qty"
													/>
												) : (
													<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
												)}
												{/* {isItemSelected ? (
													<TextField
														id={`field-rejected_${item.id}`}
														type="number"
														value={rejectedQuantities[item.id] ?? ''}
														onChange={(e) => {
															e.stopPropagation();
															handleRejectedQuantityChange(item.id, e.target.value);
														}}
														onClick={(e) => e.stopPropagation()}
														error={!!rejectedQtyError}
														helperText={rejectedQtyError}
														size="small"
														fullWidth
														inputProps={{
															min: 0,
															max: available,
															step: 1
														}}
														placeholder="Enter rejected qty"
													/>
												) : (
													<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
												)} */}
											</TD>
											<TD>
												{isItemSelected ? (
													<TextField
														id={`field-accepted_${item.id}`}
														type="number"
														value={acceptedQuantities[item.id] ?? ''}
														onChange={(e) => {
															e.stopPropagation();
															handleAcceptedQuantityChange(item.id, e.target.value);
														}}
														onClick={(e) => e.stopPropagation()}
														onMouseDown={(e) => e.stopPropagation()}
														error={!!acceptedQtyError}
														helperText={acceptedQtyError}
														size="small"
														fullWidth
														inputProps={{
															min: 0,
															max: Math.max(
																Number(grnQuantities[item.id] || 0) -
																Number(rejectedQuantities[item.id] || 0),
																0
															),
															step: 1
														}}
														placeholder="Enter accepted qty"
													/>
												) : (
													<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
												)}
												{/* {isItemSelected ? (
													<TextField
														id={`field-accepted_${item.id}`}
														type="number"
														value={acceptedQuantities[item.id] ?? ''}
														onChange={(e) => {
															e.stopPropagation();
															handleAcceptedQuantityChange(item.id, e.target.value);
														}}
														onClick={(e) => e.stopPropagation()}
														error={!!acceptedQtyError}
														helperText={acceptedQtyError}
														size="small"
														fullWidth
														inputProps={{ min: 0, max: Number(grnQuantities[item.id] || 0), step: 1 }}
														placeholder="Enter accepted qty"
													/>
												) : (
													<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
												)} */}
											</TD>
											<TD>
												{isItemSelected ? (
													<TextField
														id={`field-delivery_${item.id}`}
														type="date"
														value={deliveryDates[item.id] ?? ''}
														onChange={(e) => {
															e.stopPropagation();
															handleDeliveryDateChange(item.id, e.target.value);
														}}
														onClick={(e) => e.stopPropagation()}
														error={!!deliveryDateError}
														helperText={deliveryDateError}
														size="small"
														fullWidth
														InputLabelProps={{ shrink: true }}
													/>
												) : (
													<Typography sx={{ fontSize: 12, color: '#999' }}>—</Typography>
												)}
											</TD>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</DialogContent>

			<DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
				<Button
					onClick={onClose}
					variant="outlined"
					disabled={submitting}
					sx={{ textTransform: 'none' }}
				>
					Cancel
				</Button>

				<Box sx={{ flex: 1 }} />

				<Button
					onClick={handleSubmit}
					variant="contained"
					startIcon={<HiCheck />}
					disabled={submitting || selectedItems.length === 0}
					sx={{ textTransform: 'none' }}
				>
					{submitting ? 'Creating GRN...' : 'Create GRN'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AddGRNDialog;
