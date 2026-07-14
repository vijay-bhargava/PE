import { IconButton, Tooltip, Button } from '@mui/material';
import * as React from 'react';
import { HiPencilAlt, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useStateValue } from '../../../store';
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { PETable } from "../../../components/RFQ/PETable";
import '../../../assets/css/manage-rfq-v2.css';
import CommonTooltip from '../../../components/commonTooltip';

const ProductitemCell = ({ itemsList, handleEditItem, handleDeleteItem, tempDataForItemService, action, eventType, CurrentVersion }) => {

	const [{ atoken, rtoken, customerid, roleClaims, userDetail }, dispatch, thousands_separators] =
		useStateValue();

	const hasErpId = Array.isArray(itemsList) && itemsList.some(item => item?.erpSourceId);
	const hasEventId = Array.isArray(itemsList) && itemsList.some(item => item?.eventId);
	const hasEventType = Array.isArray(itemsList) && itemsList.some(item => item?.eventType);
	const eventTypeFromItems = (Array.isArray(itemsList) && itemsList.find(item => item?.eventType)?.eventType) || "";
	const hasCloseDate = Array.isArray(itemsList) && itemsList.some(item => item?.closeDate);
	const [expandedRows, setExpandedRows] = React.useState({});

	const handleRowExpand = (rowId) => {
		console.log('Expanding row:', rowId);
		console.log('Current expanded rows:', expandedRows);
		setExpandedRows(prev => {
			const newState = {
				...prev,
				[rowId]: !prev[rowId]
			};
			console.log('New expanded rows state:', newState);
			return newState;
		});
	};

	const getRowId = (row) => {
		return row?.id || row?.itemId || Math.random();
	};

	// Create expanded rows by inserting detail rows after each main row
	const createExpandedRows = () => {
		const expandedRowsList = [];

		console.log('Creating expanded rows. Current expandedRows state:', expandedRows);

		itemsList?.forEach((item, index) => {
			const serialNo = index + 1;
			const rowId = item?.id || item?.itemId;

			// Add the main row
			expandedRowsList.push({
				...item,
				serialNo: serialNo,
				isDetailRow: false,
				detailType: null,
				parentId: rowId,
				originalIndex: index
			});

			// Add separate detail rows for each section if expanded
			if (expandedRows[rowId]) {
				console.log(`Adding detail row for item ${rowId}`);

				// Single detail row with all information
				expandedRowsList.push({
					id: `detail-${rowId}`,
					serialNo: '',
					isDetailRow: true,
					detailType: 'combined',
					parentId: rowId,
					parentData: item,
					originalIndex: index,
					itemCode: '',
					itemName: ''
				});
			} else {
				console.log(`NOT adding detail rows for item ${rowId} - not expanded`);
			}
		});

		console.log('Final expanded rows list:', expandedRowsList);
		return expandedRowsList;
	};

	const getExpandedRowId = (row) => {
		return row?.id;
	};

	// Define columns for DataGrid based on eventType and data properties
	const columns = [
		// S.No column — spans all columns for detail rows
		{
			field: "serialNo",
			headerName: "S.No",
			width: 70,
			colSpan: (params) => params?.row?.isDetailRow ? 20 : 1,
			renderCell: (params) => {
				if (params.row.isDetailRow) {
					const item = params.row.parentData;
					const attachmentFile = item?.itemFile || item?.attachment || item?.attachmentFile;
					return (
						<div style={{
							display: 'flex', alignItems: 'center', justifyContent: 'space-between',
							width: '100%', backgroundColor: "#F9FAFB"
						}}>
							{/* Item Type, Plant, Attachment */}
							<div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
								<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Item Type</span>
								<span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{item?.itemType || '-'}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
								<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Plant</span>
								<span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{item?.plant || '-'}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
								<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Attachment</span>
								{attachmentFile ? (
									<Button variant="text" size="small"
										style={{ fontSize: '13px', fontWeight: 500, padding: 0, minWidth: 0, textAlign: 'left', textTransform: 'none' }}
										onClick={(e) => { e.stopPropagation(); downloadFilesOnAzure(attachmentFile, getFileName(attachmentFile), atoken); }}>
										{getFileName(attachmentFile)}
									</Button>
								) : (
									<span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>-</span>
								)}
							</div>

							{/* LAST PO REFERENCE card */}
							<div style={{
								border: '1px solid #dde3ee', borderRadius: '8px',
								padding: '8px 16px', backgroundColor: '#fff',
								boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flexShrink: 0
							}}>
								<div style={{ fontSize: '11px', fontWeight: 700, color: '#2A68D3', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
									🗒 LAST PO REFERENCE
								</div>
								<div style={{ display: 'flex', gap: '24px', marginBottom: '6px' }}>
									{[
										{ label: 'PO Number', value: item?.poNumber || 'NA' },
										{ label: 'Supplier', value: item?.poVendorName || '-' },
										{ label: 'PO Date', value: item?.poDate ? new Date(item.poDate).toLocaleDateString() : '-' },
									].map(({ label, value }) => (
										<div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
											<span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500 }}>{label}</span>
											<span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>{value}</span>
										</div>
									))}
								</div>
								<div style={{ display: 'flex', gap: '24px' }}>
									{[
										{ label: 'Unit Rate', value: item?.unitRate ?? 0 },
										{ label: 'PO Value', value: item?.poValue ?? 0 },
									].map(({ label, value }) => (
										<div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
											<span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500 }}>{label}</span>
											<span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>{value}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					);
				}
				return (
					<div className="content-text detail-row-bold" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{params.row.serialNo}
					</div>
				);
			},
		},
		{
			field: "itemCode",
			headerName: "Item Code",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const itemCodeValue = params?.formattedValue || '';
				return (
					<CommonTooltip title={itemCodeValue} placement="bottom">
						<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{itemCodeValue}
						</div>
					</CommonTooltip>
				);
			},
		},
		{
			field: "itemName",
			headerName: "Item / Service",
			flex: 2,
			minWidth: 200,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const itemNameValue = params?.formattedValue || '';
				return (
					<CommonTooltip title={itemNameValue} placement="bottom">
						<div onClick={() => handleEditItem(params.row)} className="content-text clickable-cell"
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{itemNameValue}
						</div>
					</CommonTooltip>
				);
			},
		},
		{
			field: "itemDesc",
			headerName: "Description",
			flex: 2,
			minWidth: 180,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const val = params?.formattedValue || '-';
				return (
					<CommonTooltip title={val !== '-' ? val : ''} placement="bottom">
						<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{val}
						</div>
					</CommonTooltip>
				);
			},
		},
		{
			field: "itemCategory",
			headerName: "Category",
			flex: 1,
			minWidth: 140,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const val = params?.formattedValue || '-';
				return (
					<CommonTooltip title={val !== '-' ? val : ''} placement="bottom">
						<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{val}
						</div>
					</CommonTooltip>
				);
			},
		},
		{
			field: "quantity",
			headerName: "Quantity",
			flex: 1,
			minWidth: 140,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}>
						{thousands_separators(params?.formattedValue)} ({params.row?.uom})
					</div>
				);
			},
		},
		{
			field: "targetPrice",
			headerName: "Target Price",
			flex: 1,
			minWidth: 130,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}>
						{thousands_separators(params?.formattedValue)}
					</div>
				);
			},
		},
		// Conditional columns based on eventType
		...(eventType === 'RFQ' ? [{
			field: "plant",
			headerName: "Delivery Location",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' ? [{
			field: "startPrice",
			headerName: "Start Price",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;

				return (
					<div
						className="content-text"
						onClick={() => handleEditItem(params.row)}
						style={{ cursor: 'pointer' }}
					>
						{thousands_separators(params?.formattedValue)}
					</div>
				);
			},
		}] : []),
		// ...(eventType === 'Auction' ? [{
		//     field: "minimumDelta",
		//     headerName: tempDataForItemService[0]?.bidTypeID === 1 ||
		//         tempDataForItemService[0]?.bidTypeID === 5
		//         ? 'Min Increment'
		//         : 'Min Decrement',
		//     flex: 1,
		//     minWidth: 120,
		//     renderCell: (params) => {
		//         if (params.row.isDetailRow) return null;

		//         return (
		//             <div
		//                 className="content-text"
		//                 onClick={() => handleEditItem(params.row)}
		//                 style={{ cursor: 'pointer' }}
		//             >
		//                 {thousands_separators(params?.formattedValue)}
		//             </div>
		//         );
		//     },
		// }] : []),
		...(eventType === 'Auction' ? [{
			field: tempDataForItemService[0]?.bidSubTypeId == 82 ? "priceDecAmount" : "minimumDelta",
			headerName:
				tempDataForItemService[0]?.bidSubTypeId == 82
					? (
						tempDataForItemService[0]?.bidTypeID === 1 || tempDataForItemService[0]?.bidTypeID === 5
							? "Price Dec Amt"
							: "Price Inc Amt"
					)
					: (
						tempDataForItemService[0]?.bidTypeID === 1 || tempDataForItemService[0]?.bidTypeID === 5
							? "Min Increment"
							: "Min Decrement"
					),
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;

				return (
					<div
						className="content-text"
						onClick={() => handleEditItem(params.row)}
						style={{ cursor: "pointer" }}
					>
						{thousands_separators(params?.row[
							tempDataForItemService[0]?.bidSubTypeId == 82 ? "priceDecAmount" : "minimumDelta"
						])}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' && tempDataForItemService[0]?.bidSubTypeId !== 82 ? [{
			field: "decreamentOn",
			headerName: tempDataForItemService[0]?.bidTypeID === 1 ||
				tempDataForItemService[0]?.bidTypeID === 5
				? 'Inc On'
				: 'Dec On',
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;

				return (
					<div
						className="content-text"
						onClick={() => handleEditItem(params.row)}
						style={{ cursor: 'pointer' }}
					>
						{params?.formattedValue == 'A' ? 'Amt' : '%age'}
					</div>
				);
			},
		}] : []),
		// ...(eventType === 'Auction' && tempDataForItemService[0]?.bidClosingType === 'S' ? [{
		...(eventType === 'Auction' && (tempDataForItemService[0]?.bidClosingType === 'S' || tempDataForItemService[0]?.bidSubTypeId == 82) ? [{
			field: "itemBidDuration",
			headerName: "Item Duration",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;

				return (
					<div
						className="content-text"
						onClick={() => handleEditItem(params.row)}
						style={{ cursor: 'pointer' }}
					>
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
		// Conditional columns based on the three cases:
		// Case 1 (PR → Auction): PR shows eventId & eventType; Auction shows ONLY erpSourceId
		// Case 2 (PR → RFQ): PR shows eventId & eventType; RFQ shows ONLY erpSourceId
		// Case 3 (PR → RFQ → Auction): PR shows eventId & eventType; RFQ shows all three; Auction shows eventId & eventType

		// For PR screen: Always show eventId and eventType (never erpSourceId)
		...(eventType === 'PR' && hasEventId ? [{
			field: "eventId",
			headerName: "Event ID",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue === 0 ? '' : params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'PR' && hasEventType ? [{
			field: "eventType",
			headerName: "Event Type",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'PR' && hasCloseDate ? [{
			field: "closeDate",
			headerName: "Close Date",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue === 0 ? '' : params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'PR' && hasCloseDate ? [{
			field: "reason",
			headerName: "Reason",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const reasonText = params?.formattedValue === 0 ? '' : params?.formattedValue;
				return (
					<Tooltip title={reasonText || ''} arrow placement="top-start">
						<div className="content-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{reasonText}
						</div>
					</Tooltip>
				);
			},
		}] : []),
		// For RFQ screen: Always show erpSourceId
		...(eventType === 'RFQ' && hasErpId ? [{
			field: "erpSourceId",
			headerName: "External SourceId",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
		// For RFQ screen: If items have eventType='Auction' (Case 3), also show eventId & eventType
		...(eventType === 'RFQ' && hasEventId && hasEventType && eventTypeFromItems === 'Auction' ? [{
			field: "eventId",
			headerName: "Event ID",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue === 0 ? '' : params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'RFQ' && hasEventId && hasEventType && eventTypeFromItems === 'Auction' ? [{
			field: "eventType",
			headerName: "Event Type",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),

		// For Auction screen:
		// - If items have eventType='RFQ' (Case 3): show eventId & eventType
		// - If items have eventType='PR' (Case 1): show only erpSourceId
		...(eventType === 'Auction' && hasEventId && hasEventType && eventTypeFromItems === 'RFQ' ? [{
			field: "eventId",
			headerName: "Event ID",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue === 0 ? '' : params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' && hasEventId && hasEventType && eventTypeFromItems === 'RFQ' ? [{
			field: "eventType",
			headerName: "Event Type",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' && hasErpId && eventTypeFromItems !== 'RFQ' ? [{
			field: "erpSourceId",
			headerName: "External SourceId",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text">
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
		// Actions column
		{
			field: "actions",
			headerName: "",
			flex: 1,
			minWidth: 120,
			sortable: false,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;

				return (
					<div className="d-flex align-items-center gap-2">
						{action && (
							<Tooltip title="Edit Item">
								<IconButton
									size="small"
									onClick={() => handleEditItem(params.row)}
									className="text-primary"
								>
									<HiPencilAlt />
								</IconButton>
							</Tooltip>
						)}
						{action && (
							<Tooltip title="Delete Item">
								<IconButton
									size="small"
									onClick={() => handleDeleteItem(params.row.id || params.row.itemId)}
									className="text-danger"
									disabled={
										itemsList[0]?.bidId && tempDataForItemService[0]?.stage !== 'Draft'
									}
								>
									<RiDeleteBin6Line />
								</IconButton>
							</Tooltip>
						)}
						{/* Accordion button */}
						<Tooltip title={expandedRows[params.row?.id || params.row?.itemId] ? "Collapse Details" : "Expand Details"}>
							<IconButton
								size="small"
								onClick={() => handleRowExpand(params.row?.id || params.row?.itemId)}
								className="text-secondary"
							>
								{expandedRows[params.row?.id || params.row?.itemId] ?
									<HiOutlineChevronUp /> : <HiOutlineChevronDown />
								}
							</IconButton>
						</Tooltip>
					</div>
				);
			},
		},
	];

	return (
		<PETable
			className="rfq-v2-datagrid"
			rows={createExpandedRows()}
			columns={columns}
			getRowId={getExpandedRowId}
			getRowHeight={(params) => params.model.isDetailRow ? 150 : 52}
			disableColumnMenu
			disableColumnSorting
			sortingOrder={[]}
			pageSizeOptions={[10, 25, 50]}
			pagination
			initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
			sx={{
				'& .MuiDataGrid-row': { cursor: 'pointer' },
				'& .MuiDataGrid-cell': { overflow: 'visible' },
				'& .MuiDataGrid-virtualScroller': { scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f9fafb' },
				'& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { height: 8 },
				'& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': { background: '#f9fafb' },
				'& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: 4 },
			}}
		/>
	);
};

export default ProductitemCell;
