import React, { useEffect, useState, useCallback, useRef } from "react";
import { Switch, Tooltip } from "@mui/material";
import { useStateValue } from "../../../store";
import { HiPencilAlt, HiDownload } from "react-icons/hi";
import { AddOutlined } from "@mui/icons-material";
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import PEModal from "../../../components/PEModal";
import CommonTooltip from "../../../components/commonTooltip";
import FilterDocumentCell from "../../BaseCells/FilterDocumentCell";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { PETableToolbar } from "../../../components/RFQ/PETableToolbar";
import { PETable } from "../../../components/RFQ/PETable";
import AddDocumentCell from "./AddDocumentCell";
import { getDocumentList, updateDocumentLibrary } from "../../../utils/documentlibrary";
import { getMenuMaster } from "../../../utils/commerciallibrary";
import { downloadFilesOnAzure } from "../../../utils/common";
import { toast } from "react-toastify";
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';
import '../../../assets/css/rfq-detail-v2.css';

const FILTER_COLUMNS = [
	{ field: 'eventtype', label: 'Event' },
	{ field: 'attachmentdesc', label: 'Attachment Description' },
	{ field: 'isactive', label: 'Status' },
];

const DENSITY_OPTIONS = [
	{ key: 'compact', height: 36 },
	{ key: 'standard', height: 48 },
	{ key: 'comfortable', height: 60 },
];

const DocumentsLibraryList = () => {
	const [{ atoken, customerid }] = useStateValue();

	// data
	const [recorddata, setRecorddata] = useState([]);
	const [gridloading, setGridloading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [editRecordData, seteditRecordData] = useState(null);
	const [MenuMasterList, setMenuMasterList] = useState([]);

	// drawer
	const [drawerOpen, setDrawerOpen] = useState(false);
	const resetRef = useRef(null);

	// unsaved changes confirmation
	const [confirmClose, setConfirmClose] = useState(false);
	const [unsavedChanges, setUnsavedChanges] = useState(false);

	// toolbar
	const [searchText, setSearchText] = useState('');
	const [filterModel, setFilterModel] = useState({ items: [] });
	const [columnVisibility, setColumnVisibility] = useState({
		eventtype: true, attachmentdesc: true, filepath: true,
		required: true, isactive: true, action: true,
	});
	const [density, setDensity] = useState('standard');
	const rowHeight = DENSITY_OPTIONS.find(d => d.key === density)?.height ?? 48;

	const [advFilterOpen, setAdvFilterOpen] = useState(false);
	const [advFilterValues, setAdvFilterValues] = useState(null);
	const advFilterCount = advFilterValues
		? Object.values(advFilterValues).filter(v => v !== '' && v != null).length
		: 0;

	const handleFilterList = (values) => setAdvFilterValues(values);
	const clearFilterList = () => setAdvFilterValues(null);

	const getMenuItemName = (code) => {
		if (!code) return '';
		const codes = code.split(',');
		return codes.map(c => {
			const item = MenuMasterList.find(m => m.menuIdentity === c.trim());
			return item ? item.menuName : c.trim();
		}).join(', ');
	};

	const pullDocumentLibList = () => {
		const data = { CustomerId: customerid, SortingColumn: 'Id' };
		setGridloading(true);
		getDocumentList(data, atoken).then((res) => {
			if (res && res.length) setRecorddata(res);
			else setRecorddata([]);
			setGridloading(false);
		}).catch(() => {
			setGridloading(false);
			toast.error('Failed to load documents.', { toastId: 'doc_list_err' });
		});
	};

	const pullMenuMaster = () => {
		getMenuMaster({ MenuType: 'Event' }, atoken).then((res) => {
			setMenuMasterList(res || []);
		});
	};

	useEffect(() => {
		pullDocumentLibList();
		pullMenuMaster();
	}, []);

	const handleStatus = (row, currentActive) => {
		const newActive = !currentActive;
		setRecorddata(prev => prev.map(r => r.id === row.id ? { ...r, isactive: newActive } : r));
		const data = {
			id: row.id,
			customerid: row.customerId,
			eventtype: row.eventtype ? row.eventtype.split(',') : [],
			attachmentdesc: row.attachmentdesc,
			attachment: row.attachment,
			filepath: row.filepath,
			required: row.required,
			isactive: newActive,
		};
		if (row.id > 0) {
			updateDocumentLibrary(data, row.id, atoken).catch(() => {
				setRecorddata(prev => prev.map(r => r.id === row.id ? { ...r, isactive: currentActive } : r));
				toast.error('Failed to update status.');
			});
		}
	};

	const callbackedit = useCallback((data) => {
		seteditRecordData(data);
		setDrawerOpen(true);
	}, []);

	const handleOpenDrawer = () => {
		seteditRecordData(null);
		setUnsavedChanges(false);
		setDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		if (unsavedChanges) {
			setConfirmClose(true);
		} else {
			setDrawerOpen(false);
			seteditRecordData(null);
		}
	};

	const callbackstep = useCallback(() => {
		setDrawerOpen(false);
		seteditRecordData(null);
		setUnsavedChanges(false);
		pullDocumentLibList();
	}, []);

	// search + filter
	const matchesFilter = (row, f) => {
		let val = '';
		if (f.field === 'eventtype') val = getMenuItemName(row.eventtype || '').toLowerCase();
		else if (f.field === 'attachmentdesc') val = (row.attachmentdesc || '').toLowerCase();
		else if (f.field === 'isactive') val = row.isactive ? 'active' : 'inactive';
		const fv = (f.value || '').toLowerCase();
		if (f.operator === 'contains') return val.includes(fv);
		if (f.operator === 'equals') return val === fv;
		if (f.operator === 'startsWith') return val.startsWith(fv);
		if (f.operator === 'endsWith') return val.endsWith(fv);
		if (f.operator === 'isEmpty') return !val;
		if (f.operator === 'isNotEmpty') return !!val;
		return true;
	};

	const filteredData = (Array.isArray(recorddata) ? recorddata : []).filter((row) => {
		const s = searchText.toLowerCase();
		const matchesSearch = !s || [
			getMenuItemName(row.eventtype), row.attachmentdesc, row.attachment
		].some(v => (v || '').toLowerCase().includes(s));
		if (!matchesSearch) return false;
		if (!filterModel.items.every(f => matchesFilter(row, f))) return false;
		if (advFilterValues) {
			const { attachmentdesc, eventtype, isactive } = advFilterValues;
			if (attachmentdesc && !(row.attachmentdesc || '').toLowerCase().includes(attachmentdesc.toLowerCase())) return false;
			if (eventtype && !getMenuItemName(row.eventtype || '').toLowerCase().includes(eventtype.toLowerCase())) return false;
			if (isactive !== '' && isactive != null && row.isactive !== (isactive === 'true')) return false;
		}
		return true;
	});

	const handleExport = () => {
		if (!filteredData.length) return;
		const header = 'Event,Attachment Description,Attachment,Required,Status';
		const rows = filteredData.map(r => [
			`"${getMenuItemName(r.eventtype || '')}"`,
			`"${r.attachmentdesc || ''}"`,
			`"${r.attachment || ''}"`,
			`"${r.required ? 'Yes' : 'No'}"`,
			`"${r.isactive ? 'Active' : 'Inactive'}"`,
		].join(','));
		const csv = [header, ...rows].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = 'documents-library.csv'; a.click();
		URL.revokeObjectURL(url);
	};

	const columns = [
		{
			field: 'eventtype', headerName: 'Event', flex: 1, minWidth: 150,
			renderCell: (params) => (
				<span className="rfq-v2-cell-subject">{getMenuItemName(params.value)}</span>
			),
		},
		{
			field: 'attachmentdesc', headerName: 'Attachment Description', flex: 1.5, minWidth: 200,
			renderCell: (params) => (
				<CommonTooltip title={params.value || ''} placement="bottom">
					<span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
						{params.value}
					</span>
				</CommonTooltip>
			),
		},
		{
			field: 'filepath', headerName: 'Attachment', width: 130, sortable: false,
			renderCell: (params) => (
				params.value && params.value !== 'undefined' ? (
					<Tooltip title="Download" arrow>
						<button
							type="button"
							className="pe-icon-btn pe-icon-btn--download"
							onClick={() => downloadFilesOnAzure(params.value, params.row.attachment, atoken)}
						>
							<HiDownload style={{ fontSize: 11 }} />
						</button>
					</Tooltip>
				) : <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
			),
		},
		{
			field: 'required', headerName: 'Required', width: 100,
			renderCell: (params) => (
				<span className="rfq-v2-cell-subject">{params.value ? 'Yes' : 'No'}</span>
			),
		},
		{
			field: 'isactive', headerName: 'Status', width: 100, sortable: false,
			renderCell: (params) => (
				<Tooltip title={params.row.isactive ? 'Deactivate' : 'Activate'} arrow>
					<Switch
						size="small"
						checked={!!params.row.isactive}
						onChange={() => handleStatus(params.row, params.row.isactive)}
					/>
				</Tooltip>
			),
		},
		{
			field: 'action', headerName: 'Actions', width: 100, sortable: false,
			renderCell: (params) => (
				<Tooltip title="Edit" arrow>
					<button
						type="button"
						className="pe-icon-btn pe-icon-btn--edit"
						onClick={() => callbackedit(params.row)}
					>
						<HiPencilAlt style={{ fontSize: 11 }} />
					</button>
				</Tooltip>
			),
		},
	];

	const getRowId = (row) => row.id;

	return (
		<>
			<div className="rfq-v2-page">

				{/* ── Page header ── */}
				<div className="rfq-v2-page-header">
					<div className="rfq-v2-breadcrumb">
						<span>Settings</span>
						<span className="rfq-v2-breadcrumb-sep">/</span>
						<span>Documents Library</span>
					</div>
					<button className="rfq-v2-create-btn" onClick={handleOpenDrawer}>
						<AddOutlined /> Add Document
					</button>
				</div>

				{/* ── Main card ── */}
				<div className="rfq-v2-card">
					<PETableToolbar
						searchText={searchText}
						onSearchChange={setSearchText}
						searchPlaceholder="Search documents..."
						showFilter
						filterColumns={FILTER_COLUMNS}
						filterModel={filterModel}
						onFilterModelChange={setFilterModel}
						showColumns
						columns={[
							{ field: 'eventtype', headerName: 'Event' },
							{ field: 'attachmentdesc', headerName: 'Attachment Description' },
							{ field: 'filepath', headerName: 'Attachment' },
							{ field: 'required', headerName: 'Required' },
							{ field: 'isactive', headerName: 'Status' },
							{ field: 'action', headerName: 'Actions' },
						]}
						columnVisibilityModel={columnVisibility}
						onColumnVisibilityChange={setColumnVisibility}
						onColumnVisibilityReset={() => setColumnVisibility({
							eventtype: true, attachmentdesc: true, filepath: true,
							required: true, isactive: true, action: true,
						})}
						showDensity
						density={density}
						onDensityChange={setDensity}
						showAdvFilter
						advFilterOpen={advFilterOpen}
						onAdvFilterToggle={() => setAdvFilterOpen(v => !v)}
						advFilterCount={advFilterCount}
						advFilterTitle="Advance Search"
						advFilterPanel={
							<FilterDocumentCell
								handleFilterList={handleFilterList}
								clearFilterList={clearFilterList}
							/>
						}
						showExport
						onExport={handleExport}
					/>
					<div className="rfq-v2-table-wrapper">
						{gridloading ? (
							<GridSkeleton />
						) : (
							<PETable
								rows={filteredData}
								columns={columns}
								getRowId={getRowId}
								rowHeight={rowHeight}
								columnHeaderHeight={40}
								columnVisibilityModel={columnVisibility}
								pageSizeOptions={[25, 50, 100]}
								disableColumnResize
								pagination
							/>
						)}
					</div>
				</div>
			</div>

			{/* ── Add / Edit Drawer ── */}
			<CommonBottomDrawer
				open={drawerOpen}
				onClose={handleCloseDrawer}
				title={editRecordData?.id > 0 ? 'Edit Document' : 'Add Document'}
				actions={
					<>
						<button
							type="button"
							className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
							onClick={handleCloseDrawer}
						>
							Cancel
						</button>
						<button
							type="button"
							className="pe-btn pe-btn--secondary"
							onClick={() => resetRef.current?.()}
						>
							Reset
						</button>
						<button
							type="submit"
							form="add-document-form"
							className="pe-btn pe-btn--primary"
							disabled={loading}
						>
							{loading ? 'Saving...' : 'Save'}
						</button>
					</>
				}
				sectionStyle={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
				bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
			>
				<div style={{ padding: '16px 18px', overflowY: 'auto', flex: 1 }}>
					<AddDocumentCell
						callbackstep={callbackstep}
						editRecordData={editRecordData}
						seteditRecordData={seteditRecordData}
						setUnsavedChanges={setUnsavedChanges}
						resetRef={resetRef}
						setLoading={setLoading}
					/>
				</div>
			</CommonBottomDrawer>

			{/* ── Unsaved changes confirmation ── */}
			<PEModal
				open={confirmClose}
				onClose={() => setConfirmClose(false)}
				title="Unsaved Changes"
				size="xs"
				footer={
					<>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={() => setConfirmClose(false)}>
							No, Keep Editing
						</button>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-primary" onClick={() => {
							setConfirmClose(false);
							setDrawerOpen(false);
							seteditRecordData(null);
							setUnsavedChanges(false);
						}}>
							Yes, Discard
						</button>
					</>
				}
			>
				<p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
					Do you want to close this document? Unsaved changes will be lost.
				</p>
			</PEModal>
		</>
	);
};

export default DocumentsLibraryList;
