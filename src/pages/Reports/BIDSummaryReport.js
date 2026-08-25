import React from 'react'
import '../../assets/css/manage-rfq-v2.css';
import StatusBadge from '../../components/StatusBadge';
import { useEffect, useState } from 'react';
import { FormControl, MenuItem, Select } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { formatDateViaLocaleonlydatenottime, getReportColumns } from '../../utils/common/utility';
import { actionTypes, useStateValue } from '../../store';
import CryptoJS from "crypto-js";
import { Box } from '@mui/material';
import { PETable } from '../../components/RFQ/PETable';
import { PETableToolbar } from '../../components/RFQ/PETableToolbar';
import { useFormik } from 'formik';
import TextFieldCell from '../BaseCells/TextFieldCell';
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { buildQueryParams } from '../../utils/purchaseRequest/index';
import { ApiClient } from '../../Apiclient';
import { isTokenExpired } from '../../utils/common';
import { useCookies } from "react-cookie";

const BIDSummaryReport = () => {

	const [{ atoken, rtoken, customerid, userDetail, customersuffix }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [cookie, setCookie] = useCookies(["patkn", "prtkn"]);
	const LOCAL_STORAGE_KEY = 'BIDSummaryReportColumnVisibility';

	useEffect(() => {
		const storedVisibility = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (storedVisibility) { setColumnVisibilityModel(JSON.parse(storedVisibility)); }
	}, []);

	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [rfqLoading, setRfqLoading] = useState(false);
	const [tableColumnLabels, setTableColumnLabels] = useState([]);
	const [tableRows, setTableRows] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [originalTableRows, setOriginalTableRows] = useState([]);
	const [density, setDensity] = useState('standard');
	const [filterModel, setFilterModel] = useState({ items: [] });
	const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
	const [divVisible, setDivVisible] = useState(false);
	const [activeFiltersCount, setActiveFiltersCount] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [page, setPage] = useState(1);
	const [rowCount, setRowCount] = useState(0);
	const [TotalCount, setTotalCount] = useState(0);

	const getStatusChip = (value) => <StatusBadge status={value} />;

	const columns = tableColumnLabels
		?.filter(item => item?.columnName !== 'eventCode' && item?.columnName !== 'id')
		?.map(item => {
			const isStatusCol = ['stage', 'status'].some(k => item?.columnName?.toLowerCase().includes(k));
			const isDateCol = ["Start Date", "End Date", "Configure Date"].includes(item?.columnTitle);
			return {
				field: item?.columnName,
				headerName: item?.columnTitle,
				width: item?.columnName === 'subject' ? 260 : isStatusCol ? 140 : 150,
				minWidth: item?.columnName === 'subject' ? 200 : isStatusCol ? 110 : isDateCol ? 130 : 90,
				maxWidth: item?.columnName === 'subject' ? 400 : isStatusCol ? 200 : isDateCol ? 220 : 250,
				editable: false,
				hideable: item?.hideable || true,
				valueFormatter: isDateCol
					? (params) => params.value ? formatDateViaLocaleonlydatenottime(params.value, userDetail) : ""
					: undefined,
				renderCell: (params) => {
					if (item?.columnName === 'subject') {
						return (
							<div className="rfq-v2-cell" onClick={() => navigate(`/configuration/manage-auction/${params?.row?.id}`)}>
								<span className="rfq-v2-cell-subject" title={params.value || ''}>{params.value || params?.formattedValue}</span>
								<span className="rfq-v2-cell-code">{params.row.eventCode || ''}</span>
							</div>
						);
					}
					if (isStatusCol) {
						return (
							<div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
								{getStatusChip(params?.formattedValue ?? params?.value)}
							</div>
						);
					}
					return (
						<Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
							onClick={() => navigate(`/configuration/manage-auction/${params?.row?.id}`)}>
							{params?.formattedValue}
						</Box>
					);
				},
			};
		});

	const filterColumns = (columns || []).map(c => ({ field: c.field, label: c.headerName }));

	const pullReportColumns = async () => {
		try {
			const data = { slug: 'BIDSummaryReport', customerId: customerid };
			const res = await getReportColumns(data, atoken);
			if (res?.length > 0) { setTableColumnLabels(res); pullBIDSummaryReport(); }
			else { setLoading(false); }
		} catch (error) { setLoading(false); }
	};

	const updateToken = async () => {
		const res = await isTokenExpired(atoken, rtoken, customerid);
		if (res) {
			if (res?.accessToken !== "") { dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken }); setCookie("patkn", CryptoJS.AES.encrypt(`${res.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY)?.toString(), { path: "/", maxAge: 86400 }); }
			if (res?.refreshToken !== "") { dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken }); setCookie("prtkn", CryptoJS.AES.encrypt(`${res.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY)?.toString(), { path: "/", maxAge: 86400 }); }
			return true;
		} else { return false; }
	};

	const pullBIDSummaryReport = async (pageNumber = 1, pageSize = 10, filterData = null) => {
		setLoading(true);
		try {
			await updateToken();
			const queryParams = buildQueryParams({ CustomerId: customerid, PageNumber: pageNumber, PageSize: pageSize, ...(filterData || {}) });
			const res = await apiClient.get(`api/AuctionManage/BIDSummaryReport?${queryParams}`, atoken);
			const totalRecords = res?.pageMetadata?.totalCount || 0;
			setRowCount(totalRecords); setTotalCount(totalRecords);
			if (res?.result && res.result.length > 0) { setTableRows(res.result); if (!filterData) setOriginalTableRows(res.result); }
			else { setTableRows([]); setOriginalTableRows([]); setRowCount(0); setTotalCount(0); }
		} catch (error) { setTableRows([]); setOriginalTableRows([]); setRowCount(0); setTotalCount(0); }
		finally { setLoading(false); }
	};

	const getRowId = (row) => row.id;

	const formik = useFormik({
		initialValues: { BidId: '', Subject: '', Status: '', FromDate: null, ToDate: null },
		onSubmit: (values) => { handleFilterSubmit(values); },
	});

	const handleFilterSubmit = async (filterValues) => {
		setRfqLoading(true);
		try {
			let activeCount = 0;
			if (filterValues.BidId && filterValues.BidId.trim() !== '') activeCount++;
			if (filterValues.Subject && filterValues.Subject.trim() !== '') activeCount++;
			if (filterValues.Status && filterValues.Status.trim() !== '') activeCount++;
			if (filterValues.FromDate) activeCount++;
			if (filterValues.ToDate) activeCount++;
			setActiveFiltersCount(activeCount);
			const filterData = {
				Status: filterValues.Status || null,
				FromDate: filterValues.FromDate ? new Date(filterValues.FromDate).toISOString() : null,
				ToDate: filterValues.ToDate ? new Date(filterValues.ToDate).toISOString() : null,
				Subject: filterValues.Subject || null,
				BidId: filterValues.BidId || null
			};
			Object.keys(filterData).forEach(key => { if (filterData[key] === null || filterData[key] === '') delete filterData[key]; });
			setPage(1);
			await pullBIDSummaryReport(1, pageSize, filterData);
			setRfqLoading(false);
		} catch (error) { setRfqLoading(false); }
	};

	const clear = async () => {
		formik.resetForm();
		setActiveFiltersCount(0);
		setPage(1);
		setRfqLoading(true);
		await pullBIDSummaryReport(1, pageSize);
		setRfqLoading(false);
	};

	const handleColumnVisibilityChange = (newModel) => {
		setColumnVisibilityModel(newModel);
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newModel));
	};
	const handleColumnVisibilityReset = () => {
		const d = {};
		setColumnVisibilityModel(d);
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(d));
	};

	const handleExportClick = async () => {
		try {
			setLoading(true);
			const payload = { reportName: "BIDSummaryReport", customerId: customerid, area: "AuctionManage", timeZoneId: userDetail?.timeZone };
			const response = await apiClient.api.get(`api/ReportConfig/DownloadReportExcel?${new URLSearchParams(payload).toString()}`,
				{
					headers: { Authorization: `Bearer ${atoken}` },
					responseType: 'blob'
				});
			const now = new Date();
			const formatted = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0");
			const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = `BIDSummaryReport_${formatted}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			if (error.response) { alert(`Export failed: ${error.response.status} - ${error.response.statusText || 'Server error'}`); }
			else { alert(`Export failed: ${error.message || 'Network error'}`); }
		} finally { setLoading(false); }
	};

	useEffect(() => { if (atoken && customerid) { pullReportColumns(); } }, [atoken, customerid]);

	const filteredRows = searchText.trim()
		? tableRows.filter(row => Object.values(row).some(v => String(v ?? '').toLowerCase().includes(searchText.toLowerCase())))
		: tableRows;

	return (
		<>
			<div className="rfq-v2-page">
				<div className="rfq-v2-page-header">
					<div className="rfq-v2-breadcrumb">
						<Link to="/app">Home</Link><span className="rfq-v2-breadcrumb-sep">/</span>
						<span>Reports</span><span className="rfq-v2-breadcrumb-sep">/</span>
						<span>BID Summary Report</span>
					</div>
				</div>
				<div className="rfq-v2-card">
					<PETableToolbar
						searchText={searchText}
						onSearchChange={setSearchText}
						searchPlaceholder="Search..."
						showFilter
						filterColumns={filterColumns}
						filterModel={filterModel}
						onFilterModelChange={setFilterModel}
						showColumns
						columns={columns || []}
						hiddenAlways={[]}
						columnVisibilityModel={columnVisibilityModel}
						onColumnVisibilityChange={handleColumnVisibilityChange}
						onColumnVisibilityReset={handleColumnVisibilityReset}
						showDensity
						density={density}
						onDensityChange={setDensity}
						showAdvFilter
						advFilterOpen={divVisible}
						onAdvFilterToggle={() => setDivVisible(v => !v)}
						advFilterCount={activeFiltersCount}
						advFilterPanel={(
							<form className="rfq-v2-filter-body"
								onSubmit={formik.handleSubmit}
								autoComplete="off">
								<div className="rfq-v2-filter-fields">
									<div>
										<label className="rfq-v2-filter-label">Bid ID</label>
										<TextFieldCell id="BidId" name="BidId" value={formik.values.BidId} onChange={(e) => formik.setFieldValue("BidId", e.target.value)} className="rfq-v2-filter-field" />
									</div>
									<div>
										<label className="rfq-v2-filter-label">Subject</label>
										<TextFieldCell id="subject" name="subject" maxLength={200} value={formik.values.Subject} onChange={(e) => formik.setFieldValue("Subject", e.target.value)} className="rfq-v2-filter-field" />
									</div>
									<div>
										<label className="rfq-v2-filter-label">Status</label>
										<FormControl fullWidth>
											<Select displayEmpty id="Status"
												variant="outlined"
												size="small"
												value={formik.values.Status}
												onChange={(e) => formik.setFieldValue("Status", e.target.value)}>
												{["Open", "Draft", "Under Pre Approval", "Running", "Close"].map((s) => (
													<MenuItem key={s} value={s}>{s}</MenuItem>
												))}
											</Select>
										</FormControl>
									</div>
									<LocalizationProvider dateAdapter={AdapterDateFns}>
										<div>
											<label className="rfq-v2-filter-label">From Date/Time</label>
											<MobileDateTimePicker className="w-100 f14" value={formik.values.FromDate}
												onChange={(v) => formik.setFieldValue("FromDate", v)}
												slotProps={{ textField: { variant: "outlined", size: "small" } }} />
										</div>
										<div>
											<label className="rfq-v2-filter-label">To Date/Time</label>
											<MobileDateTimePicker className="w-100 f14" value={formik.values.ToDate}
												onChange={(v) => formik.setFieldValue("ToDate", v)}
												slotProps={{ textField: { variant: "outlined", size: "small" } }} />
										</div>
									</LocalizationProvider>
								</div>
								<div className="rfq-v2-filter-footer">
									<button type="button" className="rfq-v2-filter-btn-reset" onClick={clear}>Reset</button>
									<LoadingButton type="submit" loading={rfqLoading}
										className="rfq-v2-filter-btn-apply" disableElevation
										onClick={async (e) => { e.preventDefault(); formik.handleSubmit(); }}
									>Apply
									</LoadingButton>
								</div>
							</form>
						)}
						showExport
						onExport={handleExportClick}
						exportLoading={loading}
					/>
					<div className="rfq-v2-table-wrapper">
						<PETable
							className="rfq-v2-datagrid"
							rows={filteredRows}
							getRowId={getRowId}
							columns={columns}
							loading={loading || rfqLoading}
							rowHeight={52}
							pagination
							paginationMode="server"
							pageSizeOptions={[10, 25, 50]}
							rowCount={TotalCount}
							paginationModel={{ page: page - 1, pageSize }}
							onPaginationModelChange={(model) => {
								const currentFilters = activeFiltersCount > 0 ? {
									Status: formik.values.Status || null,
									FromDate: formik.values.FromDate ? new Date(formik.values.FromDate).toISOString() : null,
									ToDate: formik.values.ToDate ? new Date(formik.values.ToDate).toISOString() : null,
									Subject: formik.values.Subject || null,
									BidId: formik.values.BidId || null
								} : null;
								if (currentFilters) Object.keys(currentFilters).forEach(key => {
									if (currentFilters[key] === null || currentFilters[key] === '') delete currentFilters[key];
								});
								if (model.page !== (page - 1)) {
									setPage(model.page + 1);
									pullBIDSummaryReport(model.page + 1, model.pageSize, currentFilters);
								}
								if (model.pageSize !== pageSize) {
									setPageSize(model.pageSize); setPage(1);
									pullBIDSummaryReport(1, model.pageSize, currentFilters);
								}
							}}
							columnVisibilityModel={columnVisibilityModel}
							onColumnVisibilityModelChange={handleColumnVisibilityChange}
							filterModel={filterModel}
							onFilterModelChange={setFilterModel}
							disableColumnResize
							density={density}
							getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 ? 'even overFlow' : 'odd overFlow'}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default BIDSummaryReport;
