import React from 'react';
import { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateViaLocaleonlydatenottime, getReportColumns } from '../../utils/common/utility';
import { actionTypes, useStateValue } from '../../store';
import { HiOutlineX } from "react-icons/hi";
import CryptoJS from "crypto-js";
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Box, IconButton, Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { BackButton } from '../../utils/common/component';
import { useFormik } from 'formik';
import TextFieldCell from '../BaseCells/TextFieldCell';
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { buildQueryParams } from '../../utils/purchaseRequest/index';
import { ApiClient } from '../../Apiclient';
import { isTokenExpired } from '../../utils/common';
import { useCookies } from "react-cookie";

const SESReport = () => {

    const [{ atoken, rtoken, customerid, userDetail, customersuffix }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const [cookie, setCookie] = useCookies(["patkn", "prtkn"]);
    const LOCAL_STORAGE_KEY = 'SESReportColumnVisibility';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sesLoading, setsesLoading] = useState(false);
    const [tableColumnLabels, setTableColumnLabels] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({ id: false });
    const [divVisible, setDivVisible] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [rowCount, setRowCount] = useState(0);
    const [TotalCount, setTotalCount] = useState(0);

    useEffect(() => {
        const storedVisibility = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedVisibility) {
            setColumnVisibilityModel(JSON.parse(storedVisibility));
        }
    }, []);

    const toggleDivVisibility = () => setDivVisible(!divVisible);
    const closeDivVisibility = () => setDivVisible(false);

    const clear = async () => {
        formik.resetForm();
        setActiveFiltersCount(0);
        setPage(1);
        setsesLoading(true);
        await pullSESReport(1, pageSize);
        setsesLoading(false);
    };

    const columns = tableColumnLabels?.map(item => ({
        field: item?.columnName,
        headerName: item?.columnTitle,
        minWidth: 100,
        flex: 1,
        editable: false,
        hideable: item?.hideable || true,
        valueFormatter: (item?.columnTitle?.includes("Date"))
            ? (params) => params.value ? formatDateViaLocaleonlydatenottime(params.value, userDetail) : ""
            : undefined,
        renderCell: (params) => (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {params?.formattedValue}
            </Box>
        ),
    }));

    const updateToken = async () => {
        const res = await isTokenExpired(atoken, rtoken, customerid);
        if (res) {
            if (res?.accessToken !== "") {
                dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
                setCookie("patkn", CryptoJS.AES.encrypt(`${res.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY)?.toString(), { path: "/", maxAge: 86400 });
            }
            if (res?.refreshToken !== "") {
                dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
                setCookie("prtkn", CryptoJS.AES.encrypt(`${res.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY)?.toString(), { path: "/", maxAge: 86400 });
            }
            return true;
        }
        return false;
    };

    const pullReportColumns = async () => {
        try {
            const data = { slug: 'SESReport', customerId: customerid };
            const res = await getReportColumns(data, atoken);
            if (res?.length > 0) {
                setTableColumnLabels(res);
                pullSESReport();
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const pullSESReport = async (pageNumber = 1, pageSz = 10, filterData = null) => {
        setLoading(true);
        try {
            await updateToken();
            let queryParams;
            if (filterData && Object.keys(filterData).length > 0) {
                queryParams = buildQueryParams({
                    CustomerId: customerid,
                    ...filterData
                });
            } else {
                queryParams = buildQueryParams({
                    CustomerId: customerid,
                    PageNumber: pageNumber,
                    PageSize: pageSz,
                });
            }
            const res = await apiClient.get(`/api/sesheader/SESReport?${queryParams}`, atoken);
            if (res && res.result && res.result.length > 0) {
                const totalRecords = res?.pageMetadata?.totalCount || res.result.length;
                setRowCount(totalRecords);
                setTotalCount(totalRecords);
                setTableRows(res.result);
            } else {
                setTableRows([]);
                setRowCount(0);
                setTotalCount(0);
            }
        } catch (error) {
            setTableRows([]);
            setRowCount(0);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const getRowId = (row) => row.sr || row.id || row.sesId || row.lineId || Math.random();

    const formik = useFormik({
        initialValues: { POId: '', VendorName: '', Status: '', FromDate: null, ToDate: null },
        onSubmit: (values) => handleFilterSubmit(values),
    });

    const handleFilterSubmit = async (filterValues) => {
        setsesLoading(true);
        try {
            let activeCount = 0;
            if (filterValues.POId?.trim()) activeCount++;
            if (filterValues.VendorName?.trim()) activeCount++;
            if (filterValues.Status?.trim()) activeCount++;
            if (filterValues.FromDate) activeCount++;
            if (filterValues.ToDate) activeCount++;
            setActiveFiltersCount(activeCount);

            const filterData = {
                POId: filterValues.POId || null,
                FromDate: filterValues.FromDate ? new Date(filterValues.FromDate).toISOString() : null,
                ToDate: filterValues.ToDate ? new Date(filterValues.ToDate).toISOString() : null,
                VendorName: filterValues.VendorName || null,
                Status: filterValues.Status || null,
            };
            Object.keys(filterData).forEach(key => { if (!filterData[key]) delete filterData[key]; });
            setPage(1);
            await pullSESReport(1, pageSize, filterData);
            setsesLoading(false);
        } catch (error) {
            setsesLoading(false);
        }
    };

    const handleColumnVisibilityChange = (newModel) => {
        setColumnVisibilityModel(newModel);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newModel));
    };

    const handleExportClick = async () => {
        try {
            setLoading(true);
            const filterData = activeFiltersCount > 0 ? {
                POId: formik.values.POId || null,
                FromDate: formik.values.FromDate ? new Date(formik.values.FromDate).toISOString() : null,
                ToDate: formik.values.ToDate ? new Date(formik.values.ToDate).toISOString() : null,
                VendorName: formik.values.VendorName || null,
                Status: formik.values.Status || null,
            } : {};
            Object.keys(filterData).forEach(key => { if (!filterData[key]) delete filterData[key]; });

            const payload = {
                reportName: "SESReport",
                customerId: customerid,
                area: "sesheader",
                timeZoneId: userDetail?.timeZone,
                ...filterData,
            };
            const queryString = new URLSearchParams(payload).toString();
            const response = await apiClient.api.get(`api/ReportConfig/DownloadReportExcel?${queryString}`, {
                headers: { Authorization: `Bearer ${atoken}` },
                responseType: 'blob',
            });
            const now = new Date();
            const formatted = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0");
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `SESReport_${formatted}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            alert("Failed to export report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (atoken && customerid) {
            pullReportColumns();
        }
    }, [atoken, customerid]);

    function NoRowsOverlay() {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                <Typography variant="h6" color="textSecondary">No Data Found</Typography>
            </Box>
        );
    }

    function CustomToolbar({ onFilterClick, activeFiltersCount, onExportClick }) {
        return (
            <GridToolbarContainer className="row">
                <div className="d-flex justify-content-between w-100 align-items-center">
                    <div className="d-flex gap-2">
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <Button size="small" startIcon={<FileDownloadIcon />} onClick={onExportClick} sx={{ textTransform: 'none', color: 'text.primary', '&:hover': { backgroundColor: 'action.hover' } }}>Export</Button>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <GridToolbarQuickFilter />
                        <div className="filterIconCircle shadow-sm position-relative" onClick={onFilterClick} title="Open Filters" style={{ cursor: 'pointer' }}>
                            <FilterListIcon />
                            {activeFiltersCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{ fontSize: '10px', padding: '2px 6px' }}>{activeFiltersCount}</span>
                            )}
                        </div>
                    </div>
                </div>
            </GridToolbarContainer>
        );
    }

    return (
        <div className="mainContainer d-flex">
            <div className={`leftContent ${divVisible ? "col-9" : "col-12"} d-flex flex-column`}>
                <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: '100%' }}>
                    <div className="d-flex justify-content-between border-bottom align-items-center mb-3 mt-2">
                        <div className="page-heading text-dark-blue textMedium">
                            <BackButton title="SES Summary Report" />
                        </div>
                    </div>
                    {activeFiltersCount > 0 && (
                        <div className="alert alert-info d-flex justify-content-between align-items-center mb-2" role="alert">
                            <span><strong>{activeFiltersCount}</strong> filter(s) applied. Showing <strong>{tableRows.length}</strong> records on this page of <strong>{rowCount}</strong> total filtered records.</span>
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={clear}>Clear Filters</button>
                        </div>
                    )}
                    <div className="row">
                        <div className="col-12">
                            <Box sx={{ width: '100%', height: 'calc(100vh - 150px)', mt: 2 }}>
                                <DataGrid
                                    rows={tableRows}
                                    getRowId={getRowId}
                                    columns={columns}
                                    loading={loading || sesLoading}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                    className="f13 border-0"
                                    disableRowSelectionOnClick
                                    pagination
                                    paginationMode="server"
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    rowCount={TotalCount}
                                    paginationModel={{ page: page - 1, pageSize }}
                                    onPaginationModelChange={(model) => {
                                        const currentFilters = activeFiltersCount > 0 ? { POId: formik.values.POId || null, FromDate: formik.values.FromDate ? new Date(formik.values.FromDate).toISOString() : null, ToDate: formik.values.ToDate ? new Date(formik.values.ToDate).toISOString() : null, VendorName: formik.values.VendorName || null, Status: formik.values.Status || null } : null;
                                        if (currentFilters) Object.keys(currentFilters).forEach(key => { if (!currentFilters[key]) delete currentFilters[key]; });
                                        if (model.page !== (page - 1)) { setPage(model.page + 1); pullSESReport(model.page + 1, model.pageSize, currentFilters); }
                                        if (model.pageSize !== pageSize) { setPageSize(model.pageSize); setPage(1); pullSESReport(1, model.pageSize, currentFilters); }
                                    }}
                                    sx={{ height: '100%', width: '100%', '& .MuiDataGrid-virtualScroller': { overflow: 'auto' }, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' } }}
                                    slots={{ toolbar: () => <CustomToolbar onFilterClick={toggleDivVisibility} activeFiltersCount={activeFiltersCount} onExportClick={handleExportClick} />, noRowsOverlay: NoRowsOverlay }}
                                    slotProps={{ toolbar: { showQuickFilter: true } }}
                                    getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 ? "even overFlow" : "odd overFlow"}
                                    columnVisibilityModel={columnVisibilityModel}
                                    onColumnVisibilityModelChange={handleColumnVisibilityChange}
                                />
                            </Box>
                        </div>
                    </div>
                </div>
            </div>

            {divVisible && (
                <div className={`rightContent ${divVisible ? "col-3" : "d-none"}`}>
                    <div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container">
                        <div className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
                            <div className="d-flex justify-content-between border-bottom align-items-center py-1">
                                <div className="page-heading text-dark-blue ms-2">Advance Search</div>
                                <IconButton onClick={closeDivVisibility} size="small" edge="start"><HiOutlineX className="f16" /></IconButton>
                            </div>
                            <div className="flex-grow-1 p-3">
                                <form onSubmit={formik.handleSubmit} autoComplete="off">
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <TextFieldCell id="POId" name="POId" label="PO ID" value={formik.values.POId} onChange={(e) => formik.setFieldValue("POId", e.target.value)} />
                                        </div>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <div className="col-12 mb-3">
                                                <MobileDateTimePicker label="From Date" className="w-100 f14" value={formik.values.FromDate} onChange={(v) => formik.setFieldValue("FromDate", v)} slotProps={{ textField: { variant: "outlined", size: "small" } }} />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <MobileDateTimePicker label="To Date" className="w-100 f14" value={formik.values.ToDate} onChange={(v) => formik.setFieldValue("ToDate", v)} slotProps={{ textField: { variant: "outlined", size: "small" } }} />
                                            </div>
                                        </LocalizationProvider>
                                        <div className="col-12 text-end">
                                            <LoadingButton variant="contained" color="primary" className="me-3 text-capitalize" onClick={clear}>Clear</LoadingButton>
                                            <LoadingButton loading={sesLoading} variant="outlined" color="primary" className="text-capitalize" onClick={(e) => { e.preventDefault(); formik.handleSubmit(); }}>Submit</LoadingButton>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SESReport;
