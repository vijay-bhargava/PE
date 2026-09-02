import React, { useState, useEffect } from 'react';
import {
	Box, Typography, Chip, Tab, Tabs, Table, TableBody, TableCell,
	TableContainer, TableHead, TableRow, IconButton, Button, Divider,
	Collapse, Tooltip, Paper, Checkbox, TextField, MenuItem
} from '@mui/material';
import {
	HiChevronDown, HiOutlineChevronUp, HiOutlineChevronDown, HiPlusSm,
	HiOutlineEye, HiPencilAlt, HiDownload
} from 'react-icons/hi';
import { formatDateViaTimeZone, formatoption } from '../../utils/common/utility';
import { toast } from 'react-toastify';


const fmtDate = (d) => (d ? formatDateViaTimeZone(d, 'en-GB', formatoption) : '');

/** Format a date for <input type="date"> (yyyy-mm-dd) using LOCAL date parts.
 *  Never use toISOString() here: for timezones ahead of UTC it shifts the
 *  day backwards (e.g. 22-07 local midnight becomes 21-07T18:30Z). */
const toDateInputValue = (d) => {
	if (!d) return '';
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return '';
	const m = String(dt.getMonth() + 1).padStart(2, '0');
	const day = String(dt.getDate()).padStart(2, '0');
	return `${dt.getFullYear()}-${m}-${day}`;
};

/** Case-insensitive check for Service item type.
 *  Handles 'Service', 'service', 'SERVICE', 'SRV', etc.
 *  Also checks itemCategory / type as fallback field names. */
const isServiceItem = (item) => {
	if (!item) return false;
	const raw = item.itemType ?? item.itemCategory ?? item.type ?? '';
	return String(raw).toLowerCase() === 'service';
};

const getGrnAcceptedQtyForItem = (itemGrns = []) => {
	return (itemGrns ?? []).flatMap(hdr => {
		const grnItems = Array.isArray(hdr.grnItems)
			? hdr.grnItems
			: Array.isArray(hdr.grnItem)
				? hdr.grnItem
				: [];
		return grnItems;
	})
	.reduce((sum, gi) => sum + Number(gi?.acceptedQty ?? gi?.receivedQty ?? 0), 0);
};

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

const STATUS_COLORS = {
	'fully invoiced':    { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' },
	'partially invoiced':{ bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
	'not invoiced':      { bg: '#fce4ec', color: '#c62828', border: '#ef9a9a' },
	'in transit':        { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
	delivered:           { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' },
	'partially received':{ bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
	paid:                { bg: '#e8f5e9', color: '#2e7d32', border: '#4caf50' },
	rejected:            { bg: '#ffebee', color: '#d32f2f', border: '#f44336' },
	draft:               { bg: '#f5f5f5', color: '#616161', border: '#bdbdbd' },
};

const StatusChip = ({ label }) => {
	const style = getStatusChipStyle(label);
	return (
		<Box component="span" sx={{
			px: 1, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 600,
			backgroundColor: style.backgroundColor, color: style.color,
			border: style.border, whiteSpace: 'nowrap',
		}}>
			{label ?? ''}
		</Box>
	);
};

/** Thin coloured progress bar */
const QtyBar = ({ value, color }) => (
	<Box sx={{ height: 4, borderRadius: 2, bgcolor: '#e0e0e0', mt: 0.5, overflow: 'hidden' }}>
		<Box sx={{ width: `${Math.min(value, 100)}%`, height: '100%', bgcolor: color, borderRadius: 2 }} />
	</Box>
);

const SectionHeader = ({ title, count, onAdd, addLabel, disabled, extra }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Typography sx={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
				{/* Per dashboard display rule: don't show "(0)"  only append the count once it's > 0 */}
				{title}{count > 0 ? ` (${count})` : ''}
			</Typography>
			{extra && extra}
		</Box>
		{onAdd && (
<Button
  variant="text"
  size="Medium"
  startIcon={<HiPlusSm />}
  onClick={onAdd}
  disabled={disabled}
  sx={{
    textTransform: 'capitalize',
    fontWeight: 400,
    color: '#1976d2 !important',
    fontSize: 12,
    padding: 0,
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#0d47a1 !important',
    },
  }}
>
  {addLabel}
</Button>
		)}
	</Box>
);

const EmptyRow = ({ colSpan, msg }) => (
	<TableRow>
		<TableCell colSpan={colSpan} align="center" sx={{ color: '#999', fontSize: 12, py: 2 }}>
			{msg}
		</TableCell>
	</TableRow>
);

const TH = ({ children, sx = {} }) => (
  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', py: 0.75, px: 1, bgcolor: '#f8f8f8', whiteSpace: 'nowrap', ...sx }}>
    {children}
  </TableCell>
);

const TD = ({ children, sx = {} }) => (
  <TableCell sx={{ fontSize: 11, py: 0.75, px: 1, color: '#333', ...sx }}>
    {children}
  </TableCell>
);

/* ──── data helpers ────────────────────────────────────────────────────────────────── */

/** All ASN/shipment rows that contain this item
 *  Match by shipmentDetails.itemNo/itemCode OR shipmentDetails.poCreationDetailId/poItemId
 *  to support ASNFind response shape (poCreationDetailId links to PO creation item id).
 */
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

/** GRN batch records for this item (nested inside shipments)
 *  Also match by poCreationDetailId / poItemId like ASN matching.
 */
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

/** Item Level (isHeaderCondition === false) PO conditions belonging to this line item.
 *  Matched primarily by poItemId against the PO creation detail id (item.id), with
 *  fallback field names in case the API/response shape varies, and a further
 *  fallback to itemNo/itemCode (mirroring getItemASNs/getItemGRNs above) so that
 *  conditions keep resolving even when the id shape differs across PO stages. */
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

/** Normalize grnheader/Find rows to only those with line items for this PO item. */
const normalizeGrnForItem = (headers, itemId) =>
	(Array.isArray(headers) ? headers : [])
		.map(h => {
			const grnItems = (Array.isArray(h.grnItem) ? h.grnItem : (Array.isArray(h.grnItems) ? h.grnItems : []))
				.filter(gi => String(gi.poItemId) === String(itemId));
			return grnItems.length > 0 ? { ...h, grnItem: grnItems } : null;
		})
		.filter(Boolean);

/** Flatten poinvoice/Find headers into per-line-item invoice rows. */
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

/** Flatten sesheader/Find headers into per-line-item SES rows. */
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

/* ──── Detail section renderers ──────────────────────────────────────────────────── */
const ASNTable = ({ asns = [], asnStatus, onAdd, onViewASN, disabled }) => {
  if ((!Array.isArray(asns) || asns.length === 0) && !onAdd) return null;

  const rows = (asns ?? []).flatMap((asn, asnIndex) => {
    const details = Array.isArray(asn.shipmentDetails) ? asn.shipmentDetails : [];
    if (details.length === 0) {
      return [{ asn, detail: null, key: asn.id ?? asnIndex }];
    }
    return details.map((detail, detailIndex) => ({
      asn,
      detail,
      key: `${asn.id ?? asnIndex}-${detail.id ?? detailIndex}`,
    }));
  });

  return (
    <Box mb={3}>
      <SectionHeader
        title="ASN Details"
        count={rows.length}
        onAdd={onAdd}
        addLabel="Add ASN"
        disabled={disabled}
        extra={asnStatus && <StatusChip label={asnStatus} />}
      />

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TH>ASN Number</TH>
              <TH>ASN Date</TH>
              <TH>Expected Delivery</TH>
              <TH>Shipped Qty</TH>
              <TH>Batch</TH>
              <TH align="center"></TH>
            </TableRow>
          </TableHead>

         <TableBody>
            {rows.length === 0 ? (
              <EmptyRow colSpan={6} msg="No ASN records found for this line item." />
            ) : (
              rows.map(({ asn, detail, key }) => (
                <TableRow key={key} hover>
                  <TD>
                    <Typography sx={{ color: '#1976d2', fontSize: 12 }}>
                      {asn.shipSlipId ?? ''}
                    </Typography>
                  </TD>

                  <TD>{fmtDate(asn.shippingDate)}</TD>
                  <TD>{fmtDate(asn.deliveryDate)}</TD>
                  <TD>{detail?.shipQty ?? ''}</TD>
                  <TD>{detail?.batchId ?? asn.batchId ?? ''}</TD>

                  <TD align="center">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        sx={{ color: '#1976d2' }}
                        onClick={() => onViewASN?.(asn)}
                      >
                        <HiOutlineEye />
                      </IconButton>
                    </Tooltip>
                  </TD>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const GRNTable = ({ grns = [], asns = [], grnsesStatus, onAdd, disabled }) => {
	const rows = (grns ?? [])
		.filter(h => Boolean(h?.grnNumber)) // skip any stray non-GRN objects
		.map(h => {
			const grnItems = Array.isArray(h.grnItems)
				? h.grnItems
				: Array.isArray(h.grnItem)
					? h.grnItem
					: [];
			const receivedQty = grnItems.reduce((sum, gi) => sum + Number(gi?.receivedQty ?? 0), 0);
			const rejectedQty = grnItems.reduce((sum, gi) => sum + Number(gi?.rejectedQty ?? 0), 0);
			const acceptedQty = grnItems.reduce((sum, gi) => sum + Number(gi?.acceptedQty ?? 0), 0);
			const linkedASN = (asns ?? []).find(a => a.id != null && String(a.id) === String(h.referenceASNId));
			const linkedASNLabel = linkedASN?.shipSlipId ?? linkedASN?.asnNumber
				?? (h.referenceASNId ? String(h.referenceASNId) : '');
			return { h, receivedQty, rejectedQty, acceptedQty, linkedASNLabel };
		});

	return (
		<Box mb={3}>
			<SectionHeader
				title="GRN Details"
				count={rows.length}
				onAdd={onAdd}
				addLabel="Add GRN"
				disabled={disabled}
				extra={grnsesStatus && <StatusChip label={grnsesStatus} />}
			/>
			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TH>GRN Number</TH>
							<TH>GRN Date</TH>
							{/* <TH>Linked ASN</TH> */}
							<TH>Total Qty</TH>
							<TH>QC Failed Qty</TH>
							<TH>Accepted Qty</TH>
							<TH>Created By</TH>
							<TH align="center"></TH>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.length === 0 ? (
							<EmptyRow colSpan={8} msg="No GRN records found for this line item." />
						) : (
							rows.map(({ h, receivedQty, rejectedQty, acceptedQty, linkedASNLabel }) => (
								<TableRow key={h.id} hover>
									<TD>
										<Typography sx={{ color: '#1976d2', fontSize: 12, cursor: 'pointer' }}>
											{h.grnNumber}
										</Typography>
									</TD>
									<TD>{fmtDate(h.grnDate)}</TD>
									{/* <TD>
										<Typography sx={{ color: '#1976d2', fontSize: 12 }}>
											{linkedASNLabel}
										</Typography>
									</TD> */}
									<TD>{receivedQty}</TD>
									<TD>{rejectedQty}</TD>
									<TD>{acceptedQty}</TD>
									<TD>{h.createdByName ?? ''}</TD>
									<TD align="center" />
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

const SESTable = ({ sesList, onAdd, disabled }) => (
	<Box mb={3}>
		<SectionHeader title="Service Entry Details" count={sesList.length} onAdd={onAdd} addLabel="Add SES" disabled={disabled} />
		<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TH>SES Number</TH>
						<TH>SES Date</TH>
						<TH>Service Qty</TH>
						<TH>Accepted Qty</TH>
						<TH>Status</TH>
						<TH align="center"></TH>
					</TableRow>
				</TableHead>
				<TableBody>
					{sesList.length === 0 ? (
						<EmptyRow colSpan={6} msg="No Service Entry found for this line item." />
					) : (
						sesList.map((s, i) => (
							<TableRow key={s.id ?? i} hover>
								<TD><Typography sx={{ color: '#1976d2', fontSize: 12, cursor: 'pointer' }}>{s.sesNumber ?? ''}</Typography></TD>
								<TD>{fmtDate(s.sesDate)}</TD>
								<TD>{s.serviceQty ?? ''}</TD>
								<TD>{s.acceptedQty ?? ''}</TD>
								<TD><StatusChip label={s.status} /></TD>
								<TD align="center">
									<Tooltip title="View"><IconButton size="small" sx={{ color: '#1976d2' }}><HiOutlineEye /></IconButton></Tooltip>
									<Tooltip title="Edit"><IconButton size="small" sx={{ color: '#777' }}><HiPencilAlt /></IconButton></Tooltip>
								</TD>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	</Box>
);

const SESDetailsSection = ({ sesDetails, grnsesStatus, onAdd, onPreview, disabled }) => (
	<Box mb={3}>
		<SectionHeader
			title="SES Details"
			count={sesDetails.length}
			onAdd={onAdd}
			addLabel="Add SES"
			disabled={disabled}
			extra={grnsesStatus && <StatusChip label={grnsesStatus} />}
		/>

		<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TH>SES Number</TH>
						<TH>Service Start Date</TH>
						<TH>Service End Date</TH>
						<TH>Quantity</TH>
						<TH>Service Amount</TH>
						<TH align="center"></TH>
					</TableRow>
				</TableHead>

				<TableBody>
					{sesDetails.length === 0 ? (
						<EmptyRow colSpan={7} msg="No SES records found for this line item." />
					) : (
						sesDetails.map((s, i) => (
							<TableRow key={s.id ?? i} hover>
								<TD>
									<Typography sx={{ color: '#1976d2', fontSize: 12, cursor: 'pointer' }}>
										{s.sesNumber ?? ''}
									</Typography>
								</TD>

								<TD>{fmtDate(s.servicePeriodFrom ?? s.serviceStartDate ?? s.startDate)}</TD>

								<TD>{fmtDate(s.servicePeriodTo ?? s.serviceEndDate ?? s.endDate)}</TD>

								<TD>{s.serviceQty ?? s.quantity ?? ''}</TD>

								<TD>{fmtCurrency(s.serviceAmount ?? s.amount)}</TD>

								<TD align="center">
									<Tooltip title="Preview">
										<IconButton
											size="small"
											sx={{ color: '#1976d2' }}
											onClick={() => onPreview && onPreview(s)}
										>
											<HiOutlineEye />
										</IconButton>
									</Tooltip>
								</TD>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	</Box>
);


const InvoiceTable = ({ invoices, onAdd, onView, onDownload, disabled }) => (
	<Box mb={3}>
		<SectionHeader
			title="Invoice Details"
			count={invoices.length}
			onAdd={onAdd}
			addLabel="Add Invoice"
			disabled={disabled}
		/>

		<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TH>Invoice Number</TH>
						<TH>Invoice Date</TH>
						<TH>Invoiced Qty</TH>
						<TH>Invoice Amount</TH>
						<TH>Status</TH>
						<TH align="center"></TH>
					</TableRow>
				</TableHead>

				<TableBody>
					{invoices.length === 0 ? (
						<EmptyRow colSpan={8} msg="No Invoice records found for this line item." />
					) : (
						invoices.map((inv, i) => {

							// ✅ HEADER LEVEL SAFE ACCESS
							const header = inv._header || inv;

							// ✅ download availability (file OR path)
							const hasFile =
								header.invoiceFile ||
								header.invoicePath;

							return (
								<TableRow key={inv.id ?? i} hover>

									{/* Invoice No */}
									<TD>
										<Typography sx={{ color: '#1976d2', fontSize: 12, cursor: 'pointer' }}>
											{inv.invoiceNo ?? header.invoiceNo ?? ''}
										</Typography>
									</TD>

									{/* Date */}
									<TD>{fmtDate(inv.invoiceDate ?? header.invoiceDate)}</TD>

									{/* Qty */}
									<TD>{inv.quantity ?? header.quantity ?? ''}</TD>

									{/* Amount */}
									<TD>{fmtCurrency(inv.invoiceAmount ?? header.invoiceAmount)}</TD>

									{/* STATUS (FIXED → HEADER stage first) */}
									<TD>
										<StatusChip
											label={inv.stage || header.stage || header.status || 'Not Available'}
										/>
									</TD>

									{/* ACTIONS */}
									<TD align="center">

										{/* VIEW */}
										<Tooltip title="View">
											<IconButton
												size="small"
												sx={{ color: '#1976d2' }}
												onClick={() => onView && onView(inv)}
											>
												<HiOutlineEye />
											</IconButton>
										</Tooltip>

										{/* DOWNLOAD (FIXED) */}
										{hasFile && onDownload && (
											<Tooltip title="Download Invoice">
												<IconButton
													size="small"
													sx={{
														color: '#2e7d32',
														'&:hover': { backgroundColor: '#e8f5e9' }
													}}
													onClick={() => onDownload(header)}
												>
													<HiDownload />
												</IconButton>
											</Tooltip>
										)}
									</TD>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</TableContainer>
	</Box>
  );


const ConditionsAccordion = ({ conditions = [] }) => {
    const [expanded, setExpanded] = useState(false);

    if (!Array.isArray(conditions) || conditions.length === 0) return null;

	return (
		<Box mb={3}>
			<Button
				fullWidth
				onClick={() => setExpanded(!expanded)}
				sx={{
					justifyContent: 'flex-start',
					textTransform: 'none',
					color: '#333',
					fontWeight: 600,
					fontSize: 13,
					py: 1,
					px: 1.5,
					bgcolor: '#f8f8f8',
					border: '1px solid #e0e0e0',
					borderRadius: 1,
					'&:hover': { bgcolor: '#f5f5f5' },
				}}
				startIcon={expanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
			>
				Conditions ({conditions.length})
			</Button>

			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mt: 1 }}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TH>Category</TH>
								<TH>Value</TH>
								<TH>Currency</TH>
								<TH>Calculation</TH>
							</TableRow>
						</TableHead>

						<TableBody>
							{conditions.map((cond, idx) => (
								<TableRow key={idx}>
									<TD>{cond.conditionCategory ?? ''}</TD>
									<TD>{cond.conditionValue ?? ''}</TD>
									<TD>{cond.currency ?? ''}</TD>
									<TD>{cond.calculationType ?? ''}</TD>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Collapse>
		</Box>
	);
};

const getStatusChipStyle = (status) => { const s = String(status ?? '').trim().toLowerCase(); if (s.includes('partial') || s.includes('partially')) { return { backgroundColor: '#fff8e1', color: '#f57c00', border: '1px solid #ffcc80', }; } return { backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', }; };
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
		setExpandedId(expandedId === item.id ? null : item.id);
	};

	// Fetch ASN / GRN / Invoice / SES details per line item when expanded (lazy, cached).
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
					? apiClient.get(`/api/shipment/Find?poId=${poId}&itemId=${itemId}`, atoken)
						.catch(err => {
							console.error('Failed to fetch ASN details', err);
							return [];
						})
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

				const [asnRes, grnRes, invRes, sesRes] = await Promise.all([
					asnRequest,
					grnRequest,
					invoiceRequest,
					sesRequest,
				]);
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
				console.error('Failed to fetch line item details', err);
				setItemDetailData(prev => ({
					...prev,
					[expandedId]: {
						loading: false,
						fetchedFor: expandedId,
						asns: [],
						grns: [],
						invoices: [],
						sesDetails: [],
						error: true,
					},
				}));
			}
		};

		fetchItemDetails();
		return () => { cancelled = true; };
	}, [expandedId, poId, customerId, atoken, apiClient, items, isDraft]);

	// Invalidate cached detail data when shipments refresh (e.g. after a new ASN).
	useEffect(() => {
		setItemDetailData({});
	}, [shipments]);

	const handleTabChange = (itemId, newTab) => {
		setActiveTabPerItem(prev => ({ ...prev, [itemId]: newTab }));
	};

	// Handle delivery date change - auto-save without manual button click
	const handleDeliveryDateChange = (item, newDate) => {
		if (onEditDeliveryDate) {
			onEditDeliveryDate(item, newDate);
		}
	};

	if (!Array.isArray(items) || items.length === 0) {
		return (
			<Box sx={{ p: 3 }}>
				<Typography sx={{ color: '#999', textAlign: 'center' }}>
					No line items found.
				</Typography>
			</Box>
		);
	}

	const selectableItemIds = items
		.filter(item => isItemSelectable(item))
		.map(item => item.id);
	const selectedSelectableCount = selectedItemIds.filter(id => selectableItemIds.includes(id)).length;

	return (
		<Box>
			{/* Main Table */}
			<Box sx={{ mb: 3 }}>
				{/* <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}> */}
					<TableContainer
  component={Paper}
  variant="outlined"
  sx={{
    borderRadius: 1,
    overflowX: "auto",
  }}
>
					<Table size="small">
						<TableHead>
  <TableRow>
    {selectionMode && (
      <TH sx={{ width: 40 }}>
        <Checkbox
          size="small"
          indeterminate={selectedSelectableCount > 0 && selectedSelectableCount < selectableItemIds.length}
          checked={selectableItemIds.length > 0 && selectedSelectableCount === selectableItemIds.length}
          disabled={selectableItemIds.length === 0}
          onChange={(e) => onToggleSelectAll && onToggleSelectAll(e.target.checked)}
        />
      </TH>
    )}
    <TH sx={{ width: 40 }}></TH>
    <TH sx={{ minWidth: 90 }}>Item Code</TH>
	<TH sx={{ minWidth: 70 }}>Item No</TH>
    <TH sx={{ minWidth: 100 }}>Item Name</TH>
    <TH sx={{ minWidth: 140 }}>Description</TH>
    <TH sx={{ minWidth: 65 }}>Ordered Qty</TH>
    <TH sx={{ minWidth: 65 }}>Received Qty</TH>
    <TH sx={{ minWidth: 65 }}>Invoiced Qty</TH>
    <TH sx={{ minWidth: 75 }}>Remaining Qty</TH>
    <TH sx={{ minWidth: 90, whiteSpace: 'nowrap' }}>Delivery Date</TH>
    <TH sx={{ minWidth: 75, whiteSpace: 'nowrap' }}>Unit Price</TH>
    <TH sx={{ minWidth: 70, whiteSpace: 'nowrap' }}>Item Type</TH>
    <TH sx={{ minWidth: 70, whiteSpace: 'nowrap' }}>Total Value</TH>
    {/* <TH sx={{ minWidth: 70, whiteSpace: 'nowrap' }}>Status</TH> */}
	{/* <TH sx={{ width: 120, minWidth: 120, whiteSpace: "nowrap" }}>Status</TH> */}
  </TableRow>
</TableHead>

						<TableBody>
							{items.map((item, idx) => {
								const oQty = Number(item.orderedQuantity ?? item.quantity ?? 0);
								const rQty = Number(item.receivedQty ?? 0);
								const iQty = Number(item.invoicedQty ?? 0);
								const rPct = pct(rQty, oQty);
								const iPct = pct(iQty, oQty);
								const remainingQty = Math.max(Number((oQty - iQty).toFixed(8)), 0);
								const isExpanded = expandedId === item.id;
								const activeTab = activeTabPerItem[item.id] ?? 0;
								const isRowSelected = selectionMode && selectedItemIds.includes(item.id);
								const isSelectable = !selectionMode || isItemSelectable(item);
								const displayDeliveryDate = deliveryUpdates[item.id] ?? item.poDeliveryDate ?? item.deliveryDate;
								const detailCache = itemDetailData[item.id] ?? {};
								const itemAsns = detailCache.asns ?? [];
								const itemGrns = detailCache.grns ?? [];
								const itemInvoices = detailCache.invoices ?? [];
								const itemSesDetails = detailCache.sesDetails ?? [];

								return (
									<React.Fragment key={item.id ?? idx}>
										<TableRow hover selected={isRowSelected}>
											{selectionMode && (
												<TD>
													<Checkbox
														size="small"
														checked={isRowSelected}
														disabled={!isSelectable}
														onChange={(e) => {
															e.stopPropagation();
															onToggleSelectItem && onToggleSelectItem(item, e.target.checked);
														}}
														onClick={(e) => e.stopPropagation()}
													/>
												</TD>
											)}
											<TD>
												<IconButton size="small" onClick={() => handleToggleItem(item)}>
													{isExpanded ? <HiOutlineChevronUp style={{ fontSize: 14 }} /> : <HiOutlineChevronDown style={{ fontSize: 14 }} />}
												</IconButton>
											</TD>
											<TD sx={{ fontWeight: 600, color: '#1976d2' }}>
												{item.itemCode ?? ''}
											</TD>
												<TD sx={{ fontWeight: 600, color: '#1976d2' }}>
  {item.lineItemNo ?? ''}
</TD>
											<TD>
												<Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
													{item.itemName ?? ''}
												</Typography>
											</TD>
											<TD>
												<Typography sx={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
													{item.itemDesc ?? ''}
												</Typography>
												{item.materialCode && (
													<Typography sx={{ fontSize: 11, color: '#888' }}>
														MAT-{item.materialCode} &nbsp;|&nbsp; {item.uom ?? ''}
													</Typography>
												)}
											</TD>
											<TD sx={{ whiteSpace: 'nowrap' }}>
												{fmtQty(oQty, item.uom)}
											</TD>
											<TD>
												<Typography sx={{ fontSize: 12 }}>
													{fmtQty(rQty, item.uom)}
												</Typography>
											</TD>
											<TD>
												<Typography sx={{ fontSize: 12 }}>
													{fmtQty(iQty || 0, item.uom)}
												</Typography>
											</TD>
											<TD>
												<Typography sx={{ fontSize: 12 }}>
													{fmtQty(remainingQty, item.uom)}
												</Typography>
											</TD>
											{/* Delivery Date Column - editable only in Draft stage (auto-saves on change) */}
											<TD sx={{ whiteSpace: 'nowrap', position: 'relative' }}>
												{isDraft ? (
													<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
														<TextField
															type="date"
															size="small"
															value={toDateInputValue(displayDeliveryDate)}
															onChange={(e) => {
																const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
																handleDeliveryDateChange(item, newDate);
															}}
															inputProps={{
																style: { fontSize: 12 },
																placeholder: 'dd-mm-yyyy'
															}}
															sx={{
																width: '130px',
																'& .MuiOutlinedInput-input': {
																	py: '6px',
																	px: '8px'
																}
															}}
														/>
													</Box>
												) : (
													<Tooltip title="Delivery date can be edited only in Draft stage">
														<Typography sx={{ fontSize: 12, color: '#333' }}>
															{fmtDate(displayDeliveryDate)}
														</Typography>
													</Tooltip>
												)}
											</TD>
			<TD sx={{ whiteSpace: 'nowrap' }}>
  {item.materialPOUnitPrice != null
    ? item.materialPOUnitPrice.toString().replace(/\.0+$/, '')
    : ''}
</TD>
											{/* Item Type Column - READ-ONLY DISPLAY ONLY */}
											<TD sx={{ whiteSpace: 'nowrap' }}>
												<Chip
													label={item.itemType ?? 'Material'}
													size="small"
													variant={item.itemType?.toLowerCase() === 'service' ? 'filled' : 'outlined'}
													color={item.itemType?.toLowerCase() === 'service' ? 'warning' : 'default'}
													sx={{ fontSize: 11, fontWeight: 500 }}
												/>
											</TD>

											<TD sx={{ whiteSpace: 'nowrap' }}>
												{fmtCurrency(item.totalAmount)}
											</TD>

											{/* <TD sx={{ width: 120, minWidth: 120 }}>
  <StatusChip label={item.status ?? 'Not Confirmed'} />
</TD> */}
										</TableRow>

										{/* Inline expand row for full detail */}
										<TableRow>
												<TableCell colSpan={selectionMode ? 15 : 14} sx={{ p: 0, borderBottom: 'none' }}>
												<Collapse in={isExpanded} timeout="auto" unmountOnExit>
													<Box sx={{ p: 3, maxHeight: '55vh', overflowY: 'auto', bgcolor: '#f9fafb', borderLeft: '4px solid #1976d2' }}>
														{/* Header info */}
														<Box sx={{ mb: 2 }}>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
																{item.materialCode && (
																	<Typography sx={{ fontSize: 11, color: '#777' }}>
																		Material Code: <Box component="span" sx={{ fontWeight: 500, color: '#333' }}>{item.materialCode}</Box>
																	</Typography>
																)}
																{item.uom && (
																	<Typography sx={{ fontSize: 11, color: '#777' }}>
																		UOM: <Box component="span" sx={{ fontWeight: 500, color: '#333' }}>{item.uom}</Box>
																	</Typography>
																)}
																{item.materialPOUnitPrice && (
																	<Typography sx={{ fontSize: 11, color: '#777' }}>
																		Unit Price: <Box component="span" sx={{ fontWeight: 500, color: '#333' }}>{fmtCurrency(item.materialPOUnitPrice)}</Box>
																	</Typography>
																)}
																{item.plantName && (
																	<Typography sx={{ fontSize: 11, color: '#777' }}>
																		Plant: <Box component="span" sx={{ fontWeight: 500, color: '#333' }}>{item.plantName}</Box>
																	</Typography>
																)}
															</Box>
														</Box>

														{/* Content */}
														<Box>
															{detailCache.loading && (
																<Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
																	Loading details...
																</Typography>
															)}
															{/* Item Level Conditions */}
															<ConditionsAccordion
																conditions={getItemConditions(itemConditions, item)}
															/>
															{/* Material Items: Show ASN and GRN. */}
															{!isServiceItem(item) && (
																<>
																	<ASNTable
																		asns={itemAsns}
																		asnStatus={item.asnStatus}
																		onAdd={!isDraft && onAddASN ? () => onAddASN(item) : undefined}
																		onViewASN={onViewASN}
																		disabled={isDraft}
																	/>
																	{!isDraft && (
																		<GRNTable
																			grns={itemGrns}
																			 grnsesStatus={item.grnsesStatus}
																			asns={getItemASNs(shipments, item)}
onAdd={
  !isDraft && onAddGRN && itemAsns.length > 0
    ? () => {
        if (getAvailableGrnQty(item, itemGrns) <= 0) {
          toast.warning(
            "Cannot create GRN. Accepted quantity is equal to the ordered quantity."
          );
          return;
        }

        onAddGRN(item);
      }
    : undefined
}																			disabled={isDraft || getAvailableGrnQty(item, itemGrns) === 0}
																		/>
																	)}
																</>
															)}
															{/* Service Items: Show SES Details */}
															{isServiceItem(item) && !isDraft && (
																<SESDetailsSection
																	sesDetails={itemSesDetails}
																	 grnsesStatus={item.grnsesStatus}
																	onAdd={!isDraft && onAddSES ? () => onAddSES(item) : undefined}
																	onPreview={onPreviewSES}
																	disabled={isDraft}
																/>
															)}
															{/* Invoices */}
															{!isDraft && (
																<InvoiceTable
																	invoices={itemInvoices}
																	onAdd={!isDraft && onAddInvoice ? () => onAddInvoice(item) : undefined}
																	onView={onViewInvoice}
																	onDownload={onDownloadInvoice}
																	disabled={isDraft}
																/>
															)}
														</Box>
													</Box>
												</Collapse>
											</TableCell>
										</TableRow>
									</React.Fragment>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	);
};

export default POItemList;
