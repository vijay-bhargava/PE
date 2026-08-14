import { IconButton, Tooltip, Button, Avatar } from '@mui/material';
import * as React from 'react';
import { HiX, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { formatDateViaLocale } from '../../../utils/common/utility';
import { useStateValue } from '../../../store';
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { PETable } from "../../../components/RFQ/PETable";
import '../../../assets/css/manage-rfq-v2.css';
import CommonTooltip from '../../../components/commonTooltip';

const ProductitemCell = ({ itemsList, handleEditItem, handleDeleteItem, tempDataForItemService = [], action, eventType }) => {

	const [{ atoken, rtoken, customerid, roleClaims, userDetail }, dispatch, thousands_separators] =
		useStateValue();

	const hasErpId = Array.isArray(itemsList) && itemsList.some(item => item?.erpSourceId);
	const [expandedRows, setExpandedRows] = React.useState({});

	const handleRowExpand = (rowId) => {
		setExpandedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
	};

	const getExpandedRowId = (row) => row?.id;

	// Insert a detail row after each main row when it's expanded — same
	// colSpan-based technique as the RFQ ProductitemCell, adapted to RFI's
	// fields (Description, Attachment, Category, Image, Last PO reference).
	const createExpandedRows = () => {
		const expandedRowsList = [];

		itemsList?.forEach((item, index) => {
			const serialNo = index + 1;
			const rowId = item?.id || item?.itemId || index;

			expandedRowsList.push({
				...item,
				serialNo,
				isDetailRow: false,
				parentId: rowId,
				originalIndex: index,
			});

			if (expandedRows[rowId]) {
				expandedRowsList.push({
					id: `detail-${rowId}`,
					serialNo: '',
					isDetailRow: true,
					parentId: rowId,
					parentData: item,
					originalIndex: index,
				});
			}
		});

		return expandedRowsList;
	};

	const columns = [
		{
			field: "serialNo",
			headerName: "S.No",
			width: 70,
			colSpan: (params) => params?.row?.isDetailRow ? 20 : 1,
			renderCell: (params) => {
				if (params.row.isDetailRow) {
					const item = params.row.parentData;
					return (
						<div style={{
							display: 'flex', alignItems: 'center', justifyContent: 'space-between',
							width: '100%', backgroundColor: "#F9FAFB", flexWrap: 'wrap', gap: 16, padding: '10px 0',
						}}>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 160 }}>
								<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Description</span>
								<span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{item?.itemDesc || '-'}</span>
							</div>
							{item?.itemCategory && (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
									<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Category</span>
									<span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{item.itemCategory}</span>
								</div>
							)}
							<div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
								<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Attachment</span>
								{item?.itemFile ? (
									<Button variant="text" size="small"
										style={{ fontSize: '13px', fontWeight: 500, padding: 0, minWidth: 0, textAlign: 'left', textTransform: 'none' }}
										onClick={(e) => { e.stopPropagation(); downloadFilesOnAzure(item.itemFile, getFileName(item.itemFile), atoken); }}>
										{getFileName(item.itemFile)}
									</Button>
								) : (
									<span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>-</span>
								)}
							</div>
							{item?.itemImage && (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
									<span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Image</span>
									<Avatar
										alt="Item"
										src={item.itemImage}
										variant="rounded"
										sx={{ width: 40, height: 40 }}
									/>
								</div>
							)}

							<div style={{
								border: '1px solid #dde3ee', borderRadius: '8px',
								padding: '8px 16px', backgroundColor: '#fff',
								boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flexShrink: 0,
							}}>
								<div style={{ fontSize: '11px', fontWeight: 700, color: '#2A68D3', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
									🗒 LAST PO REFERENCE
								</div>
								<div style={{ display: 'flex', gap: '24px', marginBottom: '6px' }}>
									{[
										{ label: 'PO Number', value: item?.poNumber || 'NA' },
										{ label: 'Supplier', value: item?.poVendorName || '-' },
										{ label: 'PO Date', value: item?.poDate ? formatDateViaLocale(item.poDate, userDetail) : '-' },
									].map(({ label, value }) => (
										<div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
											<span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500 }}>{label}</span>
											<span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>{value}</span>
										</div>
									))}
								</div>
								<div style={{ display: 'flex', gap: '24px' }}>
									{[
										{ label: 'Unit Rate', value: item?.poUnitRate ?? 0 },
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
				const val = params?.formattedValue || '';
				return (
					<CommonTooltip title={val} placement="bottom">
						<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{val}
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
				const val = params?.formattedValue || '';
				return (
					<CommonTooltip title={val} placement="bottom">
						<div onClick={() => handleEditItem(params.row)} className="content-text clickable-cell"
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
						{thousands_separators(params?.formattedValue)} {params.row?.uom}
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
		...(eventType === 'Auction' ? [{
			field: "startPrice",
			headerName: "Start Price",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{thousands_separators(params?.formattedValue)}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' ? [{
			field: "minimumDelta",
			headerName: tempDataForItemService[0]?.bidTypeID === 1 || tempDataForItemService[0]?.bidTypeID === 5
				? 'Min Increment'
				: 'Min Decrement',
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{thousands_separators(params?.formattedValue)}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' ? [{
			field: "decreamentOn",
			headerName: tempDataForItemService[0]?.bidTypeID === 1 || tempDataForItemService[0]?.bidTypeID === 5
				? 'Increment On'
				: 'Decrement On',
			flex: 1,
			minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{params?.formattedValue === 'A' ? 'Amt' : '%age'}
					</div>
				);
			},
		}] : []),
		...(eventType === 'Auction' && tempDataForItemService[0]?.bidClosingType === 'S' ? [{
			field: "itemBidDuration",
			headerName: "Item Duration",
			flex: 1,
			minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{params?.formattedValue}
					</div>
				);
			},
		}] : []),
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
		...(hasErpId ? [{
			field: "erpSourceId",
			headerName: "External SourceId",
			flex: 1,
			minWidth: 150,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return <div className="content-text">{params?.formattedValue}</div>;
			},
		}] : []),
		{
			field: "actions",
			headerName: "",
			flex: 1,
			minWidth: 100,
			sortable: false,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="d-flex align-items-center gap-2">
						{action && (
							<Tooltip title="Delete Item">
								<IconButton
									size="small"
									onClick={() => handleDeleteItem(params.row.id)}
									className="text-danger"
									disabled={itemsList[0]?.bidId && tempDataForItemService[0]?.stage !== 'Draft'}
								>
									<HiX />
								</IconButton>
							</Tooltip>
						)}
						<Tooltip title={expandedRows[params.row?.id] ? "Collapse Details" : "Expand Details"}>
							<IconButton
								size="small"
								onClick={() => handleRowExpand(params.row?.id)}
								className="text-secondary"
							>
								{expandedRows[params.row?.id] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
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
			getRowHeight={(params) => params.model.isDetailRow ? 130 : 52}
			disableColumnMenu
			disableColumnSorting
			sortingOrder={[]}
			pageSizeOptions={[10, 25, 50]}
			pagination
			initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
			sx={{
				'& .MuiDataGrid-row': { cursor: 'pointer' },
				'& .MuiDataGrid-cell': { overflow: 'visible' },
				'& .MuiDataGrid-main': { overflow: 'auto' },
				'& .MuiDataGrid-virtualScroller': { overflowX: 'auto !important', scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f9fafb' },
				'& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { height: 8 },
				'& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': { background: '#f9fafb' },
				'& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': { background: '#d1d5db', borderRadius: 4 },
			}}
		/>
	);
};

export default ProductitemCell;
