import { IconButton, Button, Chip, Tooltip } from '@mui/material';
import CommonTooltip from '../../components/commonTooltip';
import { Link } from 'react-router-dom';
import { HiPencilAlt, HiOutlineLink, HiOutlineChevronUp, HiOutlineChevronDown } from 'react-icons/hi';
import { MdReceipt } from 'react-icons/md';
import { isRejectedInvoiceRecord } from '../../utils/purchaseOrder/poHelpers';

export const renderMappingIcon = (value, reason = '') => {
	if (value === null || value === undefined) return null;

	const icon = value === true ? (
		<svg width="30" height="30" viewBox="0 0 40 40">
			<circle cx="20" cy="20" r="15" fill="#4caf50" />
			<path d="M14 20 L18 24 L26 16" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	) : (
		<svg width="30" height="30" viewBox="0 0 40 40">
			<circle cx="20" cy="20" r="15" fill="#f44336" />
			<path d="M15 15 L25 25 M25 15 L15 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
		</svg>
	);

	if (!reason) return icon;

	return (
		<Tooltip
			title={reason}
			arrow
			placement="top"
			sx={{
				'& .MuiTooltip-tooltip': {
					fontSize: '0.875rem',
					maxWidth: 300,
					backgroundColor: value ? '#4caf50' : '#f44336',
				},
				'& .MuiTooltip-arrow': {
					color: value ? '#4caf50' : '#f44336',
				}
			}}
		>
			<div style={{ display: 'inline-flex', cursor: 'help' }}>
				{icon}
			</div>
		</Tooltip>
	);
};

export const getLineItemColumns = ({
	handleRowClick,
	deliveryUpdates,
	setDeliveryDialogRow,
	setDeliveryDialogDate,
	setDeliveryDialogOpen,
	formatoption,
	formatDateViaTimeZone,
}) => [
		{
			field: "itemNo",
			headerName: "Item Number",
			width: 100,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={() => handleRowClick(params)} className="textLigblue">
					{params?.formattedValue}
				</div>
			)
		},
		{
			field: "itemType",
			headerName: "Item Type",
			width: 100,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "itemDesc",
			headerName: "Item Desc",
			width: 300,
			renderCell: (params) => (
				<CommonTooltip title={params?.formattedValue || ''} placement="bottom">
					<div style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => handleRowClick(params)}>
						{params?.formattedValue}
					</div>
				</CommonTooltip>
			),
		},
		{
			field: "poDeliveryDate",
			headerName: "PO Delivery Date",
			flex: 1.3,
			minWidth: 150,
			renderCell: (params) => {
				const formattedDate = params?.value
					? formatDateViaTimeZone(params.value, "en-GB", formatoption)
					: "Not Confirmed";
				const itemId = params.row?.id;
				const stagedDate = deliveryUpdates[itemId];
				const display = stagedDate ? formatDateViaTimeZone(stagedDate, "en-GB", formatoption) : formattedDate;
				return (
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-between' }}>
						<div style={{ cursor: 'pointer' }}>{display}</div>
						<IconButton size="small" onClick={(e) => {
							e.stopPropagation();
							setDeliveryDialogRow(params.row);
							setDeliveryDialogDate(params.value ? new Date(params.value) : null);
							setDeliveryDialogOpen(true);
						}}>
							<HiPencilAlt className="f17 text-primary" />
						</IconButton>
					</div>
				);
			}
		},
		{
			field: "quantity",
			headerName: "Quantity",
			width: 100,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "uom",
			headerName: "UOM",
			width: 100,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "materialPOUnitPrice",
			headerName: "PO Unit Price",
			width: 100,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "totalAmount",
			headerName: "Total Amount",
			width: 100,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue}
				</div>
			)
		},
		{
			field: "totalShipQty",
			headerName: "Total Ship Quantity",
			width: 150,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue ?? 0}
				</div>
			)
		},
		{
			field: "status",
			headerName: "Status",
			width: 150,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => handleRowClick(params)}>
					{params?.formattedValue ?? "Not Confirmed"}
				</div>
			)
		},
		{
			field: "plantName",
			headerName: "Plant",
			width: 250,
			renderCell: (params) => (
				<CommonTooltip title={params?.formattedValue || ''} placement="bottom">
					<div style={{ cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={() => handleRowClick(params)}>
						{params?.formattedValue}
					</div>
				</CommonTooltip>
			),
		},
	];

export const getInvoiceColumns = ({
	handleInvoiceRowClick,
	fetchPaymentDetails,
	loadingPayment,
	isShippedHistoryEditDisabled,
	openRows,
	setInvStatus,
	handleToggleRow,
	setSelectedInvoiceRows,
	setDisableGrnBtn,
	formatoption,
	formatDateViaTimeZone,
}) => [
		{
			field: "shippingDate",
			headerName: "Shipping Date",
			width: 150,
			renderCell: (params) => (
				<div className="textLigblue" style={{ cursor: 'pointer' }} onClick={(e) => {
					e.stopPropagation();
					handleInvoiceRowClick({ row: params.row, field: "shippingDate" });
				}}>
					{params?.formattedValue ? formatDateViaTimeZone(params?.formattedValue, "en-GB", formatoption) : "NA"}
				</div>
			),
		},
		{
			field: "deliveryDate",
			headerName: "Delivery Date",
			width: 150,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={(e) => {
					e.stopPropagation();
					handleInvoiceRowClick({ row: params.row, field: "deliveryDate" });
				}}>
					{params?.formattedValue ? formatDateViaTimeZone(params?.formattedValue, "en-GB", formatoption) : "NA"}
				</div>
			),
		},
		{
			field: "status",
			headerName: "Status",
			width: 150,
			renderCell: (params) => {
				const isRejected = isRejectedInvoiceRecord(params.row);
				return (
					<div style={{
						cursor: 'pointer',
						color: isRejected ? '#d32f2f' : 'inherit',
						fontWeight: isRejected ? 600 : 'normal',
						backgroundColor: isRejected ? '#ffebee' : 'transparent',
						padding: isRejected ? '2px 8px' : '0px',
						borderRadius: isRejected ? '4px' : '0px',
					}} onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "status" });
					}}>
						{params?.formattedValue}
					</div>
				);
			},
		},
		{
			field: "invoiceNo",
			headerName: "Invoice Number",
			width: 150,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={(e) => {
					e.stopPropagation();
					handleInvoiceRowClick({ row: params.row, field: "invoiceNo" });
				}}>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "invoiceAmount",
			headerName: "Invoice Amount",
			width: 150,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={(e) => {
					e.stopPropagation();
					handleInvoiceRowClick({ row: params.row, field: "invoiceAmount" });
				}}>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "invoiceDate",
			headerName: "Invoice Date",
			width: 150,
			renderCell: (params) => (
				<div style={{ cursor: 'pointer' }} onClick={(e) => {
					e.stopPropagation();
					handleInvoiceRowClick({ row: params.row, field: "invoiceDate" });
				}}>
					{params?.formattedValue ? formatDateViaTimeZone(params?.formattedValue, "en-GB", formatoption) : ""}
				</div>
			),
		},
		{
			field: "stage",
			headerName: "Invoice Status",
			width: 150,
			renderCell: (params) => {
				const isRejected = isRejectedInvoiceRecord(params.row);
				return (
					<div style={{
						cursor: 'pointer',
						color: isRejected ? '#d32f2f' : 'inherit',
						fontWeight: isRejected ? 600 : 'normal',
						backgroundColor: isRejected ? '#ffebee' : 'transparent',
						padding: isRejected ? '2px 8px' : '0px',
						borderRadius: isRejected ? '4px' : '0px',
					}} onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "stage" });
					}}>
						{params?.formattedValue}
					</div>
				);
			},
		},
		{
			field: "payment",
			headerName: "Payment",
			width: 100,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) => (
				params.row.stage === "Paid" && params.row.invoiceHId ? (
					<IconButton size="small" color="primary" onClick={(e) => {
						e.stopPropagation();
						fetchPaymentDetails(params.row.invoiceHId);
					}} disabled={loadingPayment}>
						<MdReceipt size={20} />
					</IconButton>
				) : null
			),
		},
		{
			field: "invoiceFile",
			headerName: "Invoice Attachment",
			width: 150,
			renderCell: (params) => (
				params.formattedValue
					? <Chip icon={<HiOutlineLink />} size="small" color="primary" className="ps-1" variant="outlined" label="Download" as={Link} />
					: <>No attachments</>
			),
		},
		{
			field: "manageGRN",
			headerName: "Manage GRN",
			width: 120,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) => (
				<Button
					variant="outlined"
					size="small"
					color="primary"
					disabled={isShippedHistoryEditDisabled}
					startIcon={openRows[params.row.uniqueRowId] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
					onClick={(e) => {
						e.stopPropagation();
						setInvStatus(params.row.status);
						handleToggleRow(params.row.uniqueRowId);
						setSelectedInvoiceRows([params.row]);
						setDisableGrnBtn(false);
					}}
				>
					{openRows[params.row.uniqueRowId] ? "" : ""}
				</Button>
			),
		},
	];
