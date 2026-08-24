import React from 'react'
import { useEffect, useState } from 'react';
import { Autocomplete, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatDateViaLocale, formatDateViaLocaleonlydatenottime, getReportColumns, getRFQSummaryReport } from '../../utils/common/utility';
import { actionTypes, useStateValue } from '../../store';
import { HiOutlineX} from "react-icons/hi";
import CryptoJS from "crypto-js";
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Box ,IconButton,Button} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import FilterRFQCell from '../Configuration/RequestForQuotation/FilterRFQCell';
import { BackButton } from '../../utils/common/component';
import { useFormik } from 'formik';
import TextFieldCell from '../BaseCells/TextFieldCell';
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { buildQueryParams } from '../../utils/purchaseRequest';
import { ApiClient } from '../../Apiclient';
import { isTokenExpired } from '../../utils/common';
import { useCookies } from "react-cookie";

const RFQSavingSummaryReport = () => {
 
    const [{ atoken, rtoken, customerid, userDetail, eventId, eventType,customersuffix }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
    const LOCAL_STORAGE_KEY = 'RFQSavingSummaryReportColumnVisibility';
    useEffect(() => {
        const storedVisibility = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedVisibility) {
            setColumnVisibilityModel(JSON.parse(storedVisibility));
        }
    }, []);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [rfqLoading, setRfqLoading] = useState(false);
    const [tableColumnLabels, setTableColumnLabels] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [originalTableRows, setOriginalTableRows] = useState([]); // Store original data
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({
        id: false,
    });
    const [divVisible, setDivVisible] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
        const [pageCount, setPageCount] = useState(0);
        const [pageSize, setPageSize] = useState(10);
        const [page, setPage] = useState(1);
    // Pagination state

    const [rowCount, setRowCount] = useState(0);
    
        const toggleDivVisibility = () => {
            setDivVisible(!divVisible);
        };
    
        const closeDivVisibility = () => {
            setDivVisible(false);
        };
    const clear = async () => {
        // Reset formik values
        formik.resetForm();
        
        // Reset active filters count
        setActiveFiltersCount(0);
        
        // Reload original data from API without filters
        await pullRFQSummaryReport(1, pageSize, null);
        
        // Close the filter panel
        closeDivVisibility();
    };
    const columns = tableColumnLabels?.map(item => ({
        field: item?.columnName,
        headerName: item?.columnTitle,
        minWidth: item?.columnName == "subject" ? 180 : 100,
        flex: 1,
        editable: false,
        hideable: item?.hideable || true,
        valueFormatter: (item?.columnTitle === "Start Date" || item?.columnTitle === "End Date" || item?.columnTitle === "Configure Date")
            ? (params) => {
                return params.value ? formatDateViaLocaleonlydatenottime(params.value, userDetail) : "";
            }
            : undefined,
        renderCell: (params) => {
            const isSubject = (item?.columnName == "subject" || item?.columnName == "stage"); // 👈 key check
            return (
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: isSubject ? 'flex-start' : 'center',
                        cursor: 'pointer',
                        whiteSpace: isSubject ? 'normal' : 'nowrap',
                        wordBreak: isSubject ? 'break-word' : 'normal',
                        overflow: 'hidden',
                        textOverflow: isSubject ? 'unset' : 'ellipsis',
                        py: isSubject ? 0.5 : 0
                    }}
                    title={`Click to view details`}
                    onClick={() => {
                        navigate(`/configuration/manage-rfq/${params?.row.id}`);
                    }}
                >
                    {params?.formattedValue}
                </Box>
            );
        },
    }));

    const pullReportColumns = async () => {
        try {
            const data = { slug: 'RFQSavingSummaryReport' ,customerId: customerid };
            console.log('🔍 Fetching report columns with:', data);
            const res = await getReportColumns(data, atoken);
            console.log('📥 Columns response:', res);
            if (res?.length > 0) {
                setTableColumnLabels(res);
                console.log('✅ Columns loaded, now fetching data...');
                pullRFQSummaryReport();
            } else {
                console.warn('⚠️ No columns returned from API');
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Error fetching report columns:', error);
            setLoading(false);
        }
    };
    const location = useLocation();
        const queryParams = new URLSearchParams(location.search);
        const updateToken = async () => {
            const res = await isTokenExpired(atoken, rtoken, customerid);
            if (res) {
                if (res?.accessToken != "") {
                    dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
                    var userAccessToken = CryptoJS.AES.encrypt(
                        `${res.accessToken}`,
                        process.env.REACT_APP_TOKEN_INCRYPT_KEY
                    )?.toString();
                    setCookie("patkn", userAccessToken, { path: "/", maxAge: 86400 });
                }
                if (res?.refreshToken != "") {
                    dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
                    var userRefreshToken = CryptoJS.AES.encrypt(
                        `${res.refreshToken}`,
                        process.env.REACT_APP_TOKEN_INCRYPT_KEY
                    )?.toString();
                    setCookie("prtkn", userRefreshToken, { path: "/", maxAge: 86400 });
                }
                return true;
            } else {
                return false;
            }
        };
const pullRFQSummaryReport = async (pageNumber = 1, pageSize = 10, filterData = null) => {
    setLoading(true);

    try {
        await updateToken(); // Refresh token if needed

        // Build query parameters
        const queryParams = buildQueryParams({
            CustomerId: customerid,
            PageNumber: pageNumber,
            PageSize: pageSize,
            ...filterData // include any extra filters if passed
        });

        console.log('🔍 Fetching RFQ Saving Summary Report with params:', {
            CustomerId: customerid,
            PageNumber: pageNumber,
            PageSize: pageSize,
            filterData
        });

        // GET request with query string
        const res = await apiClient.get(
            `api/RFQManage/RFQSavingSummaryReport?${queryParams}`,
            atoken
        );

        console.log('📥 API Response:', res);

        const totalRecords = res?.pageMetadata?.totalCount || 0;
        setRowCount(totalRecords);
            setTotalCount(totalRecords);

        if (res?.result && res.result.length > 0) {
            console.log('✅ Data loaded successfully:', res.result.length, 'records');
            setTableRows(res.result);
            if (!filterData) setOriginalTableRows(res.result);
        } else {
            console.warn('⚠️ No data returned from API');
            setTableRows([]);
            setOriginalTableRows([]);
            setRowCount(0);
            setTotalCount(0);
        }

    } catch (error) {
        console.error('❌ Error fetching RFQ Saving Summary Report:', error);
        console.error('❌ Error details:', error.response || error.message);
        setTableRows([]);
        setOriginalTableRows([]);
        setRowCount(0);
        setTotalCount(0);
    } finally {
        setLoading(false);
    }
};



    // const pullRFQSummaryReport = async (pageNumber = 1, pageSize = 10, filterData = null) => {
    //     try {
    //         const data = filterData || { 
    //             CustomerId: customerid,
    //             pageNumber: pageNumber,
    //             pageSize: pageSize
    //         };
            
    //         setLoading(true);
    //         const res = await getRFQSummaryReport(data, atoken);
    //         setLoading(false);
            
    //         console.log('response getRFQSummaryReport', res);
            
    //         // Handle paginated response
    //         if (res?.result && Array.isArray(res.result)) {
    //             setTableRows(res.result);
    //             setRowCount(res.pageMetadata?.totalCount || 0);
                
    //             // Store original data for reference
    //             if (!filterData) {
    //                 setOriginalTableRows(res.result);
    //             }
    //         } else if (Array.isArray(res)) {
    //             // Handle non-paginated response (backward compatibility)
    //             setTableRows(res);
    //             setRowCount(res.length);
    //             setOriginalTableRows(res);
    //         } else {
    //             setTableRows([]);
    //             setRowCount(0);
    //             setOriginalTableRows([]);
    //         }
    //     } catch (error) {
    //         setLoading(false);
    //         console.error('Error fetching RFQ summary report:', error);
    //     }
    // };

    const getRowId = (row) => {
        return row.id;
    }
    const formik = useFormik({
        initialValues: {
            Id: '',
            Subject: '',
            stage: '',
            StartDate: null,
            EndDate: null,
        },
        onSubmit: (values) => {
            handleFilterSubmit(values);
        },
    });
    const [TotalCount, setTotalCount] = useState(0);

    const handleFilterSubmit = async (filterValues) => {
        setRfqLoading(true);
        
        try {
            // Count active filters
            let activeCount = 0;
            if (filterValues.Id && filterValues.Id.trim() !== '') activeCount++;
            if (filterValues.Subject && filterValues.Subject.trim() !== '') activeCount++;
            if (filterValues.stage && filterValues.stage.trim() !== '') activeCount++;
            if (filterValues.StartDate) activeCount++;
            if (filterValues.EndDate) activeCount++;
            
            setActiveFiltersCount(activeCount);
            
            // Prepare filter data object (remove null/empty values)
            const filterData = {
                Status: filterValues.stage || null,
                FromDate: filterValues.StartDate ? new Date(filterValues.StartDate).toISOString() : null,
                ToDate: filterValues.EndDate ? new Date(filterValues.EndDate).toISOString() : null,
                RFQSubject: filterValues.Subject || null,
                RFQId: filterValues.Id || null,
                ConfiguredBy: null,
            };

            // Remove null/undefined/empty values
            Object.keys(filterData).forEach(key => {
                if (filterData[key] === null || filterData[key] === undefined || filterData[key] === '') {
                    delete filterData[key];
                }
            });

            // Call pullRFQSummaryReport with filters, resetting to page 1
            await pullRFQSummaryReport(1, pageSize, filterData);
            
            setRfqLoading(false);
            
            // Close the filter panel after applying filters
            closeDivVisibility();
        } catch (error) {
            console.error('Error filtering data:', error);
            setRfqLoading(false);
        }
    };

    const handleColumnVisibilityChange = (newModel) => {
        console.log('newModel', newModel)
        setColumnVisibilityModel(newModel);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newModel));
    };

   const handleExportClick = async () => {
    try {
        setLoading(true);

        const payload = {
            reportName: "RFQSavingSummaryReport",
            customerId: customerid,
            area: "RFQManage",
            timeZoneId: userDetail?.timeZone
        };

        console.log("📤 Calling export API with payload:", payload);
        console.log("📤 Base URL:", process.env.REACT_APP_API_CALL);
        console.log("📤 Token:", atoken ? "Present" : "Missing");

        const queryString = new URLSearchParams(payload).toString();
        const fullUrl = `api/ReportConfig/DownloadReportExcel?${queryString}`;
        
        console.log("📤 Full URL:", fullUrl);

        // Use direct axios call with blob response type
        const response = await apiClient.api.get(fullUrl, {
            headers: {
                Authorization: `Bearer ${atoken}`,
            },
            responseType: 'blob',
        });

        console.log("📥 Response received:", response);
        console.log("📥 Blob size:", response.data.size);

        // Generate timestamp-based filename with .xlsx extension
        const now = new Date();
        const formatted =
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            String(now.getHours()).padStart(2, "0") +
            String(now.getMinutes()).padStart(2, "0") +
            String(now.getSeconds()).padStart(2, "0");

        const fileName = `RFQSummaryReport_${formatted}.xlsx`;

        // Create blob with proper MIME type
        const blob = new Blob([response.data], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        console.log("✅ Report downloaded successfully");
    } catch (error) {
        console.error("❌ Export Error:", error);
        console.error("❌ Error details:", error.response || error.message);
        
        // Show more detailed error message
        if (error.response) {
            alert(`Export failed: ${error.response.status} - ${error.response.statusText || 'Server error'}`);
        } else {
            alert(`Export failed: ${error.message || 'Network error'}`);
        }
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
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                }}
            >
                <Typography variant="h6" color="textSecondary">
                    No Data Found
                </Typography>
            </Box>
        );
    }

    function CustomToolbar({ onFilterClick, activeFiltersCount ,onExportClick }) {
           const handleCustomExportClick = () => {
             // 🔴  1: Check if export button click is intercepted
            console.log('🔵 Custom Export button clicked in CustomToolbar');
            console.log('🔵 About to call onExportClick (handleExportClick)');
            onExportClick(); // Use custom export function
            console.log('🔵 onExportClick called');
        };
        return (
            <GridToolbarContainer className="row">
                <div className="d-flex justify-content-between w-100 align-items-center">
                    {/* Left side buttons */}
                    <div className="d-flex gap-2">
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        {/* <GridToolbarExport /> */}
                           {/* Custom Export Button */}
                                                <Button
                                                    size="small"
                                                    startIcon={<FileDownloadIcon />}
                                                    onClick={handleCustomExportClick}
                                                    sx={{ 
                                                        textTransform: 'none',
                                                        color: 'text.primary',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    Export
                                                </Button>
                    </div>

                    {/* Right side: Quick Filter + Custom Filter Icon */}
                    <div className="d-flex align-items-center gap-2">
                        <GridToolbarQuickFilter />
                        <div
                            className="filterIconCircle shadow-sm position-relative"
                            onClick={onFilterClick}
                            title="Open Filters"
                            style={{ cursor: 'pointer' }}
                        >
                            <FilterListIcon />
                            {activeFiltersCount > 0 && (
                                <span 
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                                    style={{ fontSize: '10px', padding: '2px 6px' }}
                                >
                                    {activeFiltersCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </GridToolbarContainer>
        );
    }

    return (
            <div className="mainContainer d-flex">
  {/* LEFT CONTENT */}
  <div className={`leftContent ${divVisible ? "col-9" : "col-12"} d-flex flex-column`}>
    <div
      className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column"
      style={{ height: '100%' }}
    >
      <div className="d-flex justify-content-between border-bottom align-items-center mb-3 mt-2">
        <div className="page-heading text-dark-blue textMedium">
          <BackButton title="RFQ Saving Summary Report" />
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-2" role="alert">
          <span>
            <strong>{activeFiltersCount}</strong> filter(s) applied. Showing <strong>{tableRows.length}</strong> records on this page of <strong>{rowCount}</strong> total filtered records.
          </span>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-primary"
            onClick={clear}
          >
            Clear Filters
          </button>
        </div>
      )}
      <div className="row">
        <div className="col-12 col-md-12 col-lg-12">
          <Box sx={{ width: '100%',height: 'calc(100vh - 150px)', mt: 2 }}>
         <DataGrid
  rows={tableRows}
  getRowId={getRowId}
  columns={columns}
  loading={loading || rfqLoading}
  rowHeight={40}
  columnHeaderHeight={40}
  className="f13 border-0"
  disableRowSelectionOnClick

  // ✅ Pagination
  pagination
  paginationMode="server"
  pageSizeOptions={[10, 25, 50]}
  rowCount={TotalCount}
  paginationModel={{
    page: page - 1,
    pageSize: pageSize
  }}
  onPaginationModelChange={(model) => {
    // Prepare current filter data if filters are active
    const currentFilters = activeFiltersCount > 0 ? {
      Status: formik.values.stage || null,
      FromDate: formik.values.StartDate ? new Date(formik.values.StartDate).toISOString() : null,
      ToDate: formik.values.EndDate ? new Date(formik.values.EndDate).toISOString() : null,
      RFQSubject: formik.values.Subject || null,
      RFQId: formik.values.Id || null,
      ConfiguredBy: null,
    } : null;
 
    // Remove null values from filters
    if (currentFilters) {
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key] === null || currentFilters[key] === '') {
          delete currentFilters[key];
        }
      });
    }
 
    // Handle page change
    if (model.page !== (page - 1)) {
      setPage(model.page + 1);
      pullRFQSummaryReport(model.page + 1, model.pageSize, currentFilters);
    }
   
    // Handle page size change
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
      setPage(1);
      pullRFQSummaryReport(1, model.pageSize, currentFilters);
    }
  }}

  // ✅ Set fixed height instead of autoHeight
  sx={{
    height: '100%',
    width: '100%',
    '& .MuiDataGrid-virtualScroller': {
      overflow: 'auto'
    },
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center'
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        whiteSpace: 'normal',     // ✅ allow wrapping
        lineHeight: '1.2',
        textAlign: 'center'
    },
    '& .MuiDataGrid-columnHeader': {
        height: 'auto !important',  // ✅ allow header to grow
    },
    '& .MuiDataGrid-columnHeaders': {
        maxHeight: 'none !important'
    }
  }}

  slots={{
    toolbar: () =><CustomToolbar onFilterClick={toggleDivVisibility} activeFiltersCount={activeFiltersCount} onExportClick={handleExportClick} />,
    noRowsOverlay: NoRowsOverlay,
  }}
  slotProps={{
    toolbar: { showQuickFilter: true },
  }}
  getRowClassName={(params) =>
    params.indexRelativeToCurrentPage % 2 === 0 ? "even overFlow" : "odd overFlow"
  }
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={handleColumnVisibilityChange}
/>

          </Box>
        </div>
      </div>
    </div>
  </div>

  {/* RIGHT CONTENT */}
   {/* RIGHT CONTENT (Filter Panel) */}
                 {divVisible && (
                     <div className={`rightContent ${divVisible ? " col-3" : "d-none"}`}>
                         <div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container">
                             <form className="d-flex flex-column flex-grow-1">
                                 <div className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
                                     <div className="d-flex justify-content-between border-bottom align-items-center py-1">
                                         <div className="page-heading text-dark-blue ms-2">
                                             Advance Search
                                         </div>
                                         <IconButton onClick={closeDivVisibility} size="small" edge="start">
                                             <HiOutlineX className="f16" />
                                         </IconButton>
                                     </div>
                                     <div className="flex-grow-1">
                                       <div className="rightContent">
            <div className="bg-white p-3" style={{ border: "none" }}>
                <form onSubmit={formik.handleSubmit} autoComplete="off">
                    <div className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
                        <div className="flex-grow-1">
                            <div className="p-3 ps-2 pe-2">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <TextFieldCell
                                            id="id"
                                            name="id"
                                            label="RFQ ID"
                                            value={formik.values.Id}
                                            onChange={(e) => formik.setFieldValue("Id", e.target.value)}
                                        />
                                    </div>


                                    <div className="col-12 mb-3">
                                        <TextFieldCell
                                            id="subject"
                                            name="subject"
                                            label="Subject"
                                            maxLength={200}
                                            value={formik.values.Subject}
                                            onChange={(e) => formik.setFieldValue("Subject", e.target.value)}
                                            InputProps={{
                                                endAdornment: formik.values.Subject && (
                                                    <InputAdornment position="end">
                                                        <Typography variant="body2" color="textSecondary">
                                                            {formik.values.Subject.length}/200
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>


                                    <div className="col-12 mb-3">
                                        <FormControl fullWidth>
                                            <InputLabel id="stage">Status</InputLabel>
                                            <Select
                                                id="stage"
                                                labelId="stage"
                                                label="Status"
                                                variant="outlined"
                                                size="small"
                                                value={formik.values.stage}
                                                onChange={(e) => formik.setFieldValue("stage", e.target.value)}
                                            >
                                                {["Open", "Draft", "Under Pre Approval", "Technical Approval", "Commercial Approval", "Awarded", "Forwarded", "Cancel"].map((s) => (
                                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>


                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <div className="col-12 mb-3">
                                            <MobileDateTimePicker
                                                label="Start Date/Time"
                                                className="w-100 f14"
                                                value={formik.values.StartDate}
                                                onChange={(newValue) => formik.setFieldValue("StartDate", newValue)}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        size: "small",
                                                        error: !!formik.errors.StartDate,
                                                        helperText: formik.errors.StartDate,
                                                    },
                                                }}
                                            />
                                        </div>

                                        <div className="col-12 mb-3">
                                            <MobileDateTimePicker
                                                label="End Date/Time"
                                                className="w-100 f14"
                                                value={formik.values.EndDate}

                                                onChange={(newValue) => formik.setFieldValue("EndDate", newValue)}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        size: "small",
                                                        error: !!formik.errors.EndDate,
                                                        helperText: formik.errors.EndDate,
                                                    },
                                                }}
                                            />
                                        </div>
                                    </LocalizationProvider>

                        

                                    

                                    {/* Buttons */}
                                    <div className="col-12 text-end">
                                        <LoadingButton
                                            variant="contained"
                                            color="primary"
                                            className="me-3 text-capitalize"
                                            onClick={clear}
                                        >
                                            Clear
                                        </LoadingButton>
                                        <LoadingButton
                                            loading={rfqLoading}
                                            variant="outlined"
                                            color="primary"
                                            className="text-capitalize"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                formik.handleSubmit();
                                            }}
                                        >
                                            Submit
                                        </LoadingButton>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>

        </div>
                                     </div>
                                 </div>
                             </form>
                         </div>
                     </div>
                 )}
</div>

    )
}

export default RFQSavingSummaryReport