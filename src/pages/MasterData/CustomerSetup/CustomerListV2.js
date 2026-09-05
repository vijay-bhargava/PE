import React, { useEffect, useState, useCallback, useRef } from "react";
import { Switch, Tooltip } from "@mui/material";
import PEModal from '../../../components/PEModal';
import { useStateValue } from "../../../store";
import { HiPencilAlt } from "react-icons/hi";
import { SiSubstack } from "react-icons/si";
import { RiMailSendFill } from "react-icons/ri";
import AddCustomer from "./AddCustomer";
import CommonBottomDrawer from '../../../components/CommonBottomDrawer';
import SMTPDrawer from './SMTPDrawer';
import SubscriptionSetup from './SubscriptionSetup';
import { UpdateStatusCustomer, getCustomerList } from "../../../utils/customerSetup";
import { getApiErrorMessage } from "../../../utils/common";
import { toast } from "react-toastify";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { PETableToolbar } from "../../../components/RFQ/PETableToolbar";
import { PETable } from "../../../components/RFQ/PETable";
import FilterCustomerCell from "../../BaseCells/FilterCustomerCell";
import { AddOutlined } from "@mui/icons-material";
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';
import '../../../assets/css/rfq-detail-v2.css';

const FILTER_COLUMNS = [
	{ field: 'customerName', label: 'Customer Name' },
	{ field: 'customerEmail', label: 'Email' },
	{ field: 'contactPersonName', label: 'Contact Person' },
	{ field: 'isActive', label: 'Status' },
];

const DENSITY_OPTIONS = [
	{ key: 'compact', height: 36 },
	{ key: 'standard', height: 48 },
	{ key: 'comfortable', height: 60 },
];

const CustomerListV2 = () => {

	const [tabvalue, setTabValue] = useState(1);
	const handleChangeTab = useCallback((_event, newValue) => {
		setTabValue(newValue);
	}, []);

	const handleOpenTabs = useCallback(() => {
		setState(s => ({ ...s, opensidebar: true }));
		setTabValue(1);
		setSelectedCustomerId(0);
		seteditRecordData(null);
	}, []);

	const [state, setState] = useState({ opensidebar: false });
	const [stateSMTP, setStateSMTP] = useState({ addSMTPDrawer: false });

	const callbackSubs = useCallback((data) => {
		seteditRecordData(data);
		setSelectedCustomerId(data?.id);
		setState(s => ({ ...s, opensidebar: true }));
		setTabValue(2);
	}, []);

	const callbackSMTP = useCallback((data) => {
		setStateSMTP(s => ({ ...s, addSMTPDrawer: true }));
		seteditRecordData(data);
	}, []);

	const [openDialog, setOpenDialog] = useState(false);
	const [dialogAnchor, setDialogAnchor] = useState("");

	const handleCloseDialog = (proceed) => {
		if (proceed) {
			setState(s => ({ ...s, [dialogAnchor]: false }));
			setStateSMTP(s => ({ ...s, [dialogAnchor]: false }));
			seteditRecordData(null);
		}
		setOpenDialog(false);
	};

	const toggleDrawer = (anchor, open) => (event) => {
		if (anchor === "opensidebar" && !open) {
			if (!editRecordData?.subscriptions || editRecordData?.subscriptions?.length === 0) {
				setDialogAnchor(anchor);
				setOpenDialog(true);
				return;
			}
		}
		if (open === false) {
			seteditRecordData(null);
		}
		if (event?.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
			return;
		}
		setState(s => ({ ...s, [anchor]: open }));
		setStateSMTP(s => ({ ...s, [anchor]: open }));
	};

	const addCustomerResetRef = useRef(null);
	const subscriptionResetRef = useRef(null);

	const [loading, setLoading] = useState(false);
	const [{ atoken, customerid }] = useStateValue();
	const [editRecordData, seteditRecordData] = useState(null);
	const handleEditrecorddata = useCallback((v) => seteditRecordData(v), []);
	const [recorddata, setRecorddata] = useState([]);
	const [selectedCustomerId, setSelectedCustomerId] = useState(0);
	const handleCustomerId = (val) => { setSelectedCustomerId(val); };

	const callbackstep = useCallback(() => {
		setState(s => ({ ...s, opensidebar: false }));
		seteditRecordData(null);
		pullCustomerList();
	}, []);

	const callbackedit = useCallback((data) => {
		seteditRecordData(data);
		setState(s => ({ ...s, opensidebar: true }));
		setTabValue(1);
		setSelectedCustomerId(data?.id);
	}, []);

	const UpdateStageStatus = (data, id, token) => {
		if (id > 0) {
			UpdateStatusCustomer(data, id, token).then(() => { pullCustomerList(); });
		}
	};

	const handleStatus = (rowValue, isActive) => {
		rowValue.isActive = !isActive;
		UpdateStageStatus(rowValue, rowValue.id, atoken);
	};

	const pullCustomerList = async () => {
		const data = { CustomerId: customerid };
		setLoading(true);
		setGridloading(true);
		try {
			const res = await getCustomerList(data, atoken);
			if (res && res.length) {
				setRecorddata(res);
			} else {
				setRecorddata([]);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error) || "Failed to load customers.", { toastId: "customer_list_error" });
		} finally {
			setLoading(false);
			setGridloading(false);
		}
	};

	useEffect(() => { pullCustomerList(); }, []);

	const [gridloading, setGridloading] = useState(true);

	// toolbar state
	const [searchText, setSearchText] = useState('');
	const [filterModel, setFilterModel] = useState({ items: [] });
	const [columnVisibility, setColumnVisibility] = useState({
		customerName: true, customerEmail: true, contactPersonName: true,
		phoneNo: true, action: true, subscription: true, smtpDetail: true, isActive: true,
	});
	const [density, setDensity] = useState('standard');
	const rowHeight = DENSITY_OPTIONS.find(d => d.key === density)?.height ?? 48;

	const [advFilterOpen, setAdvFilterOpen] = useState(false);
	const [advFilterValues, setAdvFilterValues] = useState(null);

	const advFilterCount = advFilterValues
		? Object.values(advFilterValues).filter(v => v !== '' && v != null).length
		: 0;

	const handleFilterList = (values) => {
		setAdvFilterValues(values);
		setAdvFilterOpen(false);
	};

	const clearFilterList = () => {
		setAdvFilterValues(null);
		setFilterModel({ items: [] });
	};

	const matchesFilter = (row, f) => {
		let val = '';
		if (f.field === 'customerName') val = (row.customerName || '').toLowerCase();
		else if (f.field === 'customerEmail') val = (row.customerEmail || '').toLowerCase();
		else if (f.field === 'contactPersonName') val = (row.contactPersonName || '').toLowerCase();
		else if (f.field === 'isActive') val = row.isActive ? 'active' : 'inactive';
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
		const matchesSearch = !s || [row.customerName, row.customerEmail, row.contactPersonName, row.phoneNo]
			.some(v => (v || '').toLowerCase().includes(s));
		if (!matchesSearch) return false;
		if (!filterModel.items.every(f => matchesFilter(row, f))) return false;
		if (advFilterValues) {
			for (const [key, val] of Object.entries(advFilterValues)) {
				if (!val || val === '') continue;
				if (key === 'isActive') {
					if (row.isActive !== (val === 'true')) return false;
				} else {
					if (!(row[key] || '').toLowerCase().includes(val.toLowerCase())) return false;
				}
			}
		}
		return true;
	});

	const handleExport = () => {
		if (!filteredData.length) return;
		const header = 'Customer Name,Email,Contact Person,Phone,Status';
		const rows = filteredData.map(r =>
			[`"${r.customerName || ''}"`, `"${r.customerEmail || ''}"`, `"${r.contactPersonName || ''}"`,
			`"${r.dialingCode || ''} ${r.phoneNo || ''}"`, `"${r.isActive ? 'Active' : 'Inactive'}"`].join(',')
		);
		const csv = [header, ...rows].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
		URL.revokeObjectURL(url);
	};

	const getRowId = (row) => row.id;

	const columns = [
		{
			field: "customerName", headerName: "Customer Name", flex: 1, minWidth: 160,
			renderCell: (params) => <span className="f12 fw500">{params.value}</span>,
		},
		{
			field: "customerEmail", headerName: "Email", flex: 1, minWidth: 160,
			renderCell: (params) => <span className="f12">{params.value}</span>,
		},
		{
			field: "contactPersonName", headerName: "Contact Person", width: 160,
			renderCell: (params) => <span className="f12">{params.value}</span>,
		},
		{
			field: "phoneNo", headerName: "Phone", width: 150,
			renderCell: (params) => <span className="f12">{params.row.dialingCode} {params.value}</span>,
		},
		{
			field: "isActive", headerName: "Status", width: 80, sortable: false,
			renderCell: (params) => (
				<Tooltip title={params.row.isActive ? 'Deactivate' : 'Activate'}>
					<Switch size="small" checked={params.row.isActive}
						onChange={() => handleStatus(params.row, params.row.isActive)} />
				</Tooltip>
			),
		},
		{
			field: "action", headerName: "Action", width: 100, sortable: false,
			renderCell: (params) => (
				<Tooltip title="Edit">
					<button className="pe-icon-btn pe-icon-btn--edit" onClick={() => callbackedit(params.row)}>
						<HiPencilAlt style={{ fontSize: 11 }} />
					</button>
				</Tooltip>
			),
		},
		{
			field: "subscription", headerName: "Subscription", width: 110, sortable: false,
			renderCell: (params) => {
				const hasSubscription = params.row.subscriptions?.length > 0;
				return (
					<Tooltip title={hasSubscription ? "Subscription" : "Add Subscription"} arrow>
						<button
							className={`pe-icon-btn ${hasSubscription ? "pe-icon-btn--subscribed" : "pe-icon-btn--subscribe"}`}
							onClick={() => callbackSubs(params.row)}
						>
							<SiSubstack style={{ fontSize: 11 }} />
						</button>
					</Tooltip>
				);
			},
		},
		{
			field: "smtpDetail", headerName: "SMTP Detail", width: 100, sortable: false,
			renderCell: (params) => (
				<Tooltip title="SMTP Detail">
					<button className="pe-icon-btn" onClick={() => callbackSMTP(params.row)}>
						<RiMailSendFill style={{ fontSize: 11 }} />
					</button>
				</Tooltip>
			),
		},
	];

	const SMTPCloseDrawer = () => {
		seteditRecordData(null);
		setStateSMTP(s => ({ ...s, addSMTPDrawer: false }));
	};

	return (
		<>
			<div className="rfq-v2-page">

				{/* ── Page header ── */}
				<div className="rfq-v2-page-header">
					<div className="rfq-v2-breadcrumb">
						<span>Home</span>
						<span className="rfq-v2-breadcrumb-sep">/</span>
						<span>Customer Setup</span>
					</div>
					<button className="rfq-v2-create-btn" onClick={handleOpenTabs}>
						<AddOutlined /> Add Customer
					</button>
				</div>

				{/* ── Main card ── */}
				<div className="rfq-v2-card">

					{/* ── Toolbar ── */}
					<PETableToolbar
						searchText={searchText}
						onSearchChange={setSearchText}
						searchPlaceholder="Search customers..."
						showFilter
						filterColumns={FILTER_COLUMNS}
						filterModel={filterModel}
						onFilterModelChange={setFilterModel}
						showColumns
						columns={[
							{ field: 'customerName', headerName: 'Customer Name' },
							{ field: 'customerEmail', headerName: 'Email' },
							{ field: 'contactPersonName', headerName: 'Contact Person' },
							{ field: 'phoneNo', headerName: 'Phone' },
							{ field: 'action', headerName: 'Action' },
							{ field: 'subscription', headerName: 'Subscription' },
							{ field: 'smtpDetail', headerName: 'SMTP Detail' },
							{ field: 'isActive', headerName: 'Status' },
						]}
						columnVisibilityModel={columnVisibility}
						onColumnVisibilityChange={setColumnVisibility}
						onColumnVisibilityReset={() => setColumnVisibility({
							customerName: true, customerEmail: true, contactPersonName: true,
							phoneNo: true, action: true, subscription: true, smtpDetail: true, isActive: true,
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
							<FilterCustomerCell
								handleFilterList={handleFilterList}
								clearFilterList={clearFilterList}
							/>
						}
						showExport
						onExport={handleExport}
					/>

					{/* ── Table ── */}
					<div className="rfq-v2-table-wrapper">
						{gridloading ? (
							<div style={{ padding: 20 }}><GridSkeleton /></div>
						) : filteredData.length === 0 ? (
							<div className="rfq-v2-empty">
								<p className="rfq-v2-empty-title">No customers found</p>
								<p className="rfq-v2-empty-sub">
									{searchText || filterModel.items.length > 0 || advFilterCount > 0
										? 'Try adjusting your search or filters.'
										: 'Add your first customer to get started.'}
								</p>
							</div>
						) : (
							<PETable
								className="rfq-v2-datagrid"
								rows={filteredData}
								columns={columns}
								getRowId={getRowId}
								rowHeight={rowHeight}
								pagination
								columnVisibilityModel={columnVisibility}
								disableColumnResize
								pageSizeOptions={[10, 25, 50, 100]}
								initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
							/>
						)}
					</div>
				</div>
			</div>

			{/* ── Customer Setup + Subscription Drawer ── */}
			<CommonBottomDrawer
				open={state["opensidebar"]}
				onClose={toggleDrawer("opensidebar", false)}
				title="Customer Setup"
				actions={
					<>
						{tabvalue === 1 && (
							<>
								<button className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
									onClick={toggleDrawer("opensidebar", false)}>
									Cancel
								</button>
								<button type="button" className="pe-btn pe-btn--secondary"
									onClick={() => addCustomerResetRef.current?.()}>
									Reset
								</button>
								<button type="submit" form="customer-setup-form"
									className="pe-btn pe-btn--primary" disabled={loading}>
									{editRecordData?.id ? 'Update' : 'Save & Continue'}
								</button>
							</>
						)}
						{tabvalue === 2 && (
							<>
								<button className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
									onClick={toggleDrawer("opensidebar", false)}>
									Cancel
								</button>
								<button type="button" className="pe-btn pe-btn--secondary"
									onClick={() => subscriptionResetRef.current?.()}>
									Reset
								</button>
								<button type="submit" form="subscription-form"
									className="pe-btn pe-btn--primary" disabled={loading}>
									{loading ? 'Saving...' : (editRecordData?.id ? 'Subscribe' : 'Register')}
								</button>
							</>
						)}
					</>
				}
				sectionStyle={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
				bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
			>
				{/* Tab bar */}
				<div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 16px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
					<div className="rfq-dv2-workflow-tabs" style={{ width: 'fit-content' }}>
						<button type="button"
							className={`rfq-dv2-workflow-tab ${tabvalue === 1 ? 'active' : ''}`}
							style={{ flex: 'none', padding: '0 20px' }}
							onClick={() => handleChangeTab(null, 1)}>
							Customer Setup
						</button>
						<button type="button"
							className={`rfq-dv2-workflow-tab ${tabvalue === 2 ? 'active' : ''}`}
							style={{ flex: 'none', padding: '0 20px', cursor: editRecordData ? 'pointer' : 'not-allowed', opacity: editRecordData ? 1 : 0.5 }}
							onClick={() => editRecordData ? handleChangeTab(null, 2) : null}>
							Subscription Setup
						</button>
					</div>
				</div>
				<div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
					{tabvalue === 1 ? (
						<AddCustomer
							callbackstep={callbackstep}
							handleChangeTab={handleChangeTab}
							editRecordData={editRecordData}
							handleCustomerId={handleCustomerId}
							selectedCustomerId={selectedCustomerId}
							handleEditrecorddata={handleEditrecorddata}
							resetRef={addCustomerResetRef}
						/>
					) : (
						<SubscriptionSetup
							editRecordData={editRecordData}
							selectedCustomerId={selectedCustomerId}
							callbackstep={callbackstep}
							resetRef={subscriptionResetRef}
							onLoadingChange={setLoading}
						/>
					)}
				</div>
			</CommonBottomDrawer>

			{/* ── SMTP Drawer ── */}
			<SMTPDrawer
				open={stateSMTP["addSMTPDrawer"]}
				onClose={SMTPCloseDrawer}
				editRecordData={editRecordData}
				callbackstep={callbackstep}
			/>

			{/* ── Subscription warning dialog ── */}
			<PEModal
				open={openDialog}
				onClose={() => handleCloseDialog(true)}
				size="xs"
				title="Complete Registration"
				hideCloseButton
				footer={
					<>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted"
							onClick={() => handleCloseDialog(true)}>
							Do It Later
						</button>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-primary"
							onClick={() => handleCloseDialog(false)}>
							Do It Now
						</button>
					</>
				}
			>
				<p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
					Please fill in the subscription details to complete the customer registration process.
				</p>
			</PEModal>
		</>
	);
};

export default CustomerListV2;
