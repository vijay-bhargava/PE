import { IconButton, Tooltip, Button } from '@mui/material';
import * as React from 'react';
import { HiPencilAlt, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useStateValue } from '../../../store';
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { DataGrid } from "@mui/x-data-grid";
import '../../../assets/css/manage-rfq-v2.css';

const ProductitemCell = ({ itemsList, handleEditItem, handleDeleteItem, tempDataForItemService, action, eventType, CurrentVersion }) => {

	const [{ atoken, rtoken, customerid, roleClaims, userDetail }, dispatch, thousands_separators] =
		useStateValue();

	const hasErpId = Array.isArray(itemsList) && itemsList.some(item => item?.erpSourceId);
	const hasEventId = Array.isArray(itemsList) && itemsList.some(item => item?.eventId);
	const hasEventType = Array.isArray(itemsList) && itemsList.some(item => item?.eventType);
	const eventTypeFromItems = (Array.isArray(itemsList) && itemsList.find(item => item?.eventType)?.eventType) || "";
	const hasCloseDate = Array.isArray(itemsList) && itemsList.some(item => item?.closeDate);
	const [expandedRows, setExpandedRows] = React.useState({});
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
		// S.No column
		{
			field: "serialNo",
			headerName: "S.No",
			width: 150,
			renderCell: (params) => {
				const description =
					params.row.parentData?.itemDesc || "No description available";

				return (
					<div
						className={`content-text detail-row-content ${params.row.isDetailRow
							? "detail-row-normal"
							: "detail-row-bold"
							}`}
						onClick={() => handleEditItem(params.row.isDetailRow ? params.row.parentData : params.row)}
						style={{ cursor: "pointer" }}
					>
						{params.row.isDetailRow ? (
							<>
								<span className="detail-row-label">Description:</span>{" "}
								<Tooltip
									title={description} arrow placement="top-start"
									componentsProps={{
										tooltip: {
											sx: {
												fontSize: "1rem",
												maxWidth: description.length > 500 ? 1000 : 'auto',
												whiteSpace: "normal",
											},
										},
									}}
								>
									<span>
										{description.length > 8
											? description.slice(0, 8) + "..."
											: description}
									</span>
								</Tooltip>
							</>
						) : (
							params.row.serialNo
						)}
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
				// For detail rows, show empty since Description is now in S.No column
				if (params.row.isDetailRow) {
					return null;
				}

				return (
					<div
						className="content-text clickable-cell"
						onClick={() => handleEditItem(params.row)}
					>
						{params?.formattedValue}
					</div>
				);
			},
		},
		{
			field: "itemName",
			headerName: "Item / Service",
			flex: 2,
			minWidth: 200,
			renderCell: (params) => {
				// Handle detail row - show Category below Item Name
				if (params.row.isDetailRow) {
					const item = params.row.parentData;
					return (
						<div
							className="content-text detail-row-content"
							onClick={() => handleEditItem(item)}
							style={{ cursor: 'pointer' }}
						>
							<span className="detail-row-label">Category:</span>{' '}
							<span className="detail-row-value">
								{item?.itemCategory || item?.category || 'No category specified'}
							</span>
						</div>
					);
				}

				// Normal row content
				return (
					<div
						onClick={() => handleEditItem(params.row)}
						className="clickable-cell"
					>
						<div className="content-text">
							{params?.formattedValue}
						</div>
						{/* {params.row?.itemCategory && (
                            <div className="content-text mt-1">
                                <span>Category: </span>
                                {params.row.itemCategory}
                            </div>
                        )} */}
					</div>
				);
			},
		},
		{
			field: "quantity",
			headerName: "Quantity",
			flex: 1,
			minWidth: 180,
			renderCell: (params) => {
				// Show Attachment for detail rows - below Quantity
				if (params.row.isDetailRow) {
					const item = params.row.parentData;
					return (
						<div
							className="content-text detail-row-content"
							onClick={() => handleEditItem(item)}
							style={{ cursor: 'pointer' }}
						>
							<span className="detail-row-label">Attachment:</span>{' '}
							{(item?.itemFile || item?.attachment || item?.attachmentFile) ? (
								<Button
									variant="text"
									size="small"
									className="attached-file-name pointer text-truncate p-0 content-text attachment-file-button"
									onClick={(e) => {
										e.stopPropagation();
										downloadFilesOnAzure(
											item?.itemFile || item?.attachment || item?.attachmentFile,
											getFileName(item?.itemFile || item?.attachment || item?.attachmentFile),
											atoken
										);
									}}
								>
									{getFileName(item?.itemFile || item?.attachment || item?.attachmentFile)}
								</Button>
							) : (
								<span className="content-text no-attachment-text">
									N/A
								</span>
							)}
						</div>
					);
				}

				return (
					<div
						className="content-text clickable-cell"
						onClick={() => handleEditItem(params.row)}
					>
						{thousands_separators(params?.formattedValue)} ({params.row?.uom})
					</div>
				);
			},
		},
		{
			field: "targetPrice",
			headerName: "Target Price",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				// Empty for detail rows since Attachment moved to Quantity column
				if (params.row.isDetailRow) {
					return null;
				}

				return (
					<div
						className="content-text clickable-cell"
						onClick={() => handleEditItem(params.row)}
					>
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
									<HiOutlineTrash />
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
		<div className="rfq-v2-table-wrapper">
			<DataGrid
				className="rfq-v2-datagrid"
				rows={createExpandedRows()}
				columns={columns}
				getRowId={getExpandedRowId}
				getRowHeight={(params) => params.model.isDetailRow ? 45 : 52}
				columnHeaderHeight={40}
				disableRowSelectionOnClick
				disableColumnMenu
				disableColumnSorting
				sortingOrder={[]}
				pageSizeOptions={[10, 25, 50]}
				initialState={{
					pagination: {
						paginationModel: { page: 0, pageSize: 10 },
					},
				}}
				autoHeight
				hideFooterSelectedRowCount
				sx={{
					'& .MuiDataGrid-row': { cursor: 'pointer' },
					// allow horizontal scroll for wide tables (items has more cols than manage-rfq)
					'& .MuiDataGrid-virtualScroller': {
						overflowX: 'auto !important',
						scrollbarWidth: 'thin',
						scrollbarColor: '#d1d5db #f9fafb',
					},
					'& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { height: 8 },
					'& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': { background: '#f9fafb' },
					'& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: 4 },
				}}
			/>
		</div>
	);
};

export default ProductitemCell;
