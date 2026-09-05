import { Tooltip, Button } from '@mui/material';
import * as React from 'react';
import { HiPencilAlt, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useStateValue } from '../../../store';
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { PETable } from "../../../components/RFQ/PETable";
import '../../../assets/css/manage-rfq-v2.css';
import CommonTooltip from '../../../components/commonTooltip';

const PRProductItemCell = ({ itemsList, handleEditItem, handleDeleteItem, action, eventType = 'PR' }) => {
	const [{ atoken }, , thousands_separators] = useStateValue();

	const hasEventId = Array.isArray(itemsList) && itemsList.some(item => item?.eventId);
	const hasEventType = Array.isArray(itemsList) && itemsList.some(item => item?.eventType);
	const hasCloseDate = Array.isArray(itemsList) && itemsList.some(item => item?.closeDate);
	const [expandedRows, setExpandedRows] = React.useState({});

	const handleRowExpand = (rowId) => {
		setExpandedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
	};

	const createExpandedRows = () => {
		const list = [];
		itemsList?.forEach((item, index) => {
			const rowId = item?.id || item?.itemId;
			list.push({ ...item, serialNo: index + 1, isDetailRow: false, parentId: rowId, originalIndex: index });
			if (expandedRows[rowId]) {
				list.push({
					id: `detail-${rowId}`,
					serialNo: '',
					isDetailRow: true,
					parentId: rowId,
					parentData: item,
					originalIndex: index,
					itemCode: '',
					itemName: '',
				});
			}
		});
		return list;
	};

	const columns = [
		{
			field: 'serialNo',
			headerName: 'S.No',
			width: 70,
			colSpan: (params) => (params?.row?.isDetailRow ? 20 : 1),
			renderCell: (params) => {
				if (params.row.isDetailRow) {
					const item = params.row.parentData;
					const attachmentFile = item?.itemFile || item?.attachment || item?.attachmentFile;
					return (
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', backgroundColor: '#F9FAFB' }}>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
								<span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Item Type</span>
								<span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item?.itemType || '-'}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
								<span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Plant</span>
								<span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{item?.plant || '-'}</span>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
								<span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Attachment</span>
								{attachmentFile ? (
									<Button variant="text" size="small"
										style={{ fontSize: 13, fontWeight: 500, padding: 0, minWidth: 0, textAlign: 'left', textTransform: 'none' }}
										onClick={(e) => { e.stopPropagation(); downloadFilesOnAzure(attachmentFile, getFileName(attachmentFile), atoken); }}>
										{getFileName(attachmentFile)}
									</Button>
								) : (
									<span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>-</span>
								)}
							</div>
							<div style={{ border: '1px solid #dde3ee', borderRadius: 8, padding: '8px 16px', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flexShrink: 0 }}>
								<div style={{ fontSize: 11, fontWeight: 700, color: '#2A68D3', marginBottom: 8 }}>🗒 LAST PO REFERENCE</div>
								<div style={{ display: 'flex', gap: 24, marginBottom: 6 }}>
									{[
										{ label: 'PO Number', value: item?.poNumber || 'NA' },
										{ label: 'Supplier', value: item?.poVendorName || '-' },
										{ label: 'PO Date', value: item?.poDate ? new Date(item.poDate).toLocaleDateString() : '-' },
									].map(({ label, value }) => (
										<div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 70 }}>
											<span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
											<span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{value}</span>
										</div>
									))}
								</div>
								<div style={{ display: 'flex', gap: 24 }}>
									{[
										{ label: 'Unit Rate', value: item?.unitRate ?? 0 },
										{ label: 'PO Value', value: item?.poValue ?? 0 },
									].map(({ label, value }) => (
										<div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 70 }}>
											<span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
											<span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{value}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					);
				}
				return (
					<div className="content-text" onClick={() => handleEditItem(params.row)} style={{ cursor: 'pointer' }}>
						{params.row.serialNo}
					</div>
				);
			},
		},
		{
			field: 'itemCode', headerName: 'Item Code', flex: 1, minWidth: 120,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<CommonTooltip title={params?.formattedValue || ''} placement="bottom">
						<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{params?.formattedValue}
						</div>
					</CommonTooltip>
				);
			},
		},
		{
			field: 'itemName', headerName: 'Item / Service', flex: 2, minWidth: 200,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<CommonTooltip title={params?.formattedValue || ''} placement="bottom">
						<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}
							style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
							{params?.formattedValue}
						</div>
					</CommonTooltip>
				);
			},
		},
		{
			field: 'itemDesc', headerName: 'Description', flex: 2, minWidth: 180,
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
			field: 'itemCategory', headerName: 'Category', flex: 1, minWidth: 140,
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
			field: 'quantity', headerName: 'Quantity', flex: 1, minWidth: 140,
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
			field: 'targetPrice', headerName: 'Target Price', flex: 1, minWidth: 130,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return (
					<div className="content-text clickable-cell" onClick={() => handleEditItem(params.row)}>
						{thousands_separators(params?.formattedValue)}
					</div>
				);
			},
		},
		...(hasEventId ? [{
			field: 'eventId', headerName: 'Event ID', flex: 1, minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return <div className="content-text">{params?.formattedValue === 0 ? '' : params?.formattedValue}</div>;
			},
		}] : []),
		...(hasEventType ? [{
			field: 'eventType', headerName: 'Event Type', flex: 1, minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return <div className="content-text">{params?.formattedValue}</div>;
			},
		}] : []),
		...(hasCloseDate ? [{
			field: 'closeDate', headerName: 'Close Date', flex: 1, minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				return <div className="content-text">{params?.formattedValue === 0 ? '' : params?.formattedValue}</div>;
			},
		}] : []),
		...(hasCloseDate ? [{
			field: 'reason', headerName: 'Reason', flex: 1, minWidth: 100,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const val = params?.formattedValue === 0 ? '' : params?.formattedValue;
				return (
					<Tooltip title={val || ''} arrow placement="top-start">
						<div className="content-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
					</Tooltip>
				);
			},
		}] : []),
		{
			field: 'actions', headerName: 'Actions', flex: 1, minWidth: 130, sortable: false,
			renderCell: (params) => {
				if (params.row.isDetailRow) return null;
				const rowId = params.row?.id || params.row?.itemId;
				return (
					<div className="d-flex align-items-center gap-2">
						{action && (
							<Tooltip title="Edit Item">
								<button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handleEditItem(params.row)}>
									<HiPencilAlt />
								</button>
							</Tooltip>
						)}
						{action && (
							<Tooltip title="Delete Item">
								<button type="button" className="pe-icon-btn pe-icon-btn--delete text-danger"
									onClick={() => handleDeleteItem(params.row.id || params.row.itemId)}>
									<RiDeleteBin6Line />
								</button>
							</Tooltip>
						)}
						<Tooltip title={expandedRows[rowId] ? 'Collapse Details' : 'Expand Details'}>
							<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => handleRowExpand(rowId)}>
								{expandedRows[rowId] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
							</button>
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
			getRowId={(row) => row?.id || row?.itemId}
			getRowHeight={(params) => (params.model.isDetailRow ? 150 : 52)}
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

export default PRProductItemCell;
