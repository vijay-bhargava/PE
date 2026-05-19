import React from 'react'
import { useEffect, useState } from 'react';
import { Autocomplete, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatDateViaLocale, getBIDSummaryDetailedReport, getBIDSummaryReport, getReportColumns, getRFQSummaryReport } from '../../utils/common/utility';
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

const BIDSummaryDetailedReport = () => {

    const [{ atoken, rtoken, customerid, userDetail, eventId, eventType,customersuffix }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
    const LOCAL_STORAGE_KEY = 'BIDSummaryDetailedReportColumnVisibility';
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
    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
    const [divVisible, setDivVisible] = useState(true);
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
        
        // Reset pagination to first page
        setPage(1);
        
        // Reload original data from API without filters
        await pullBIDSummaryReport(1, pageSize, null);
    };
  const columns = tableColumnLabels?.map((item) => ({
     field: item?.columnName,
     headerName: item?.columnTitle,
     minWidth: item?.width || 180,
     flex: 1,
     editable: false,
 
     // hideable should NOT default to true always — so use ?? instead of ||
     hideable: item?.hideable ?? true,
 
     // Apply valueFormatter only for date fields
     valueFormatter:
         ["Start Date", "End Date", "Configure Date"].includes(item?.columnTitle)
             ? (params) =>
                   params.value
                       ? formatDateViaLocale(params.value, userDetail)
                       : ""
             : undefined,
 
     // Always return a valid element for renderCell
     renderCell: (params) => (
         <Box
             sx={{
                 width: '100%',
                 height: '100%',
                 display: 'flex',
                 alignItems: 'center',
                 cursor: 'pointer',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis',
                 whiteSpace: 'nowrap'
             }}
             title="Click to view details"
             onClick={() => {
                 navigate(`/configuration/manage-auction/${params?.row?.id}`);
             }}
         >
             {params?.formattedValue}
         </Box>
     ),
 }));

    const pullReportColumns = async () => {
        try {
            const data = { slug: 'BIDSummaryDetailedReport' ,customerId: customerid };
            const res = await getReportColumns(data, atoken);
            //console.log('response pullReportColumns', res);
            if (res?.result?.length > 0) {
                setTableColumnLabels(res.result);
                pullBIDSummaryReport();
            } else {
                //console.log('No columns returned');
                setLoading(false);
            }
        } catch (error) {
            //console.log('Error fetching report columns:', error);
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
const pullBIDSummaryReport = async (pageNumber = 1, pageSize = 10, filterData = null) => {
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

        // GET request with query string
        const res = await apiClient.get(
            `api/AuctionManage/SummaryDetailedReport?${queryParams}`,
            atoken
        );

        const totalRecords = res?.pageMetadata?.totalCount || 0;
        setRowCount(totalRecords);
        setTotalCount(totalRecords);

        if (res?.result && res.result.length > 0) {
            setTableRows(res.result);
            if (!filterData) setOriginalTableRows(res.result);
        } else {
            setTableRows([]);
            setOriginalTableRows([]);
            setRowCount(0);
            setTotalCount(0);
        }

    } catch (error) {
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
            BidId: '',
            Subject: '',
            Status: '',
            FromDate: null,
            ToDate: null,
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
            if (filterValues.BidId && filterValues.BidId.trim() !== '') activeCount++;
            if (filterValues.Subject && filterValues.Subject.trim() !== '') activeCount++;
            if (filterValues.Status && filterValues.Status.trim() !== '') activeCount++;
            if (filterValues.FromDate) activeCount++;
            if (filterValues.ToDate) activeCount++;
            
            setActiveFiltersCount(activeCount);
            
            // Prepare filter data object
            const filterData = {
                Status: filterValues.Status || null,
                FromDate: filterValues.FromDate ? new Date(filterValues.FromDate).toISOString() : null,
                ToDate: filterValues.ToDate ? new Date(filterValues.ToDate).toISOString() : null,
                Subject: filterValues.Subject || null,
                BidId: filterValues.BidId || null,
            };

            // Remove null/undefined/empty values
            Object.keys(filterData).forEach(key => {
                if (filterData[key] === null || filterData[key] === undefined || filterData[key] === '') {
                    delete filterData[key];
                }
            });

            // Call pullBIDSummaryReport with filters, resetting to page 1
            await pullBIDSummaryReport(1, pageSize, filterData);
            
            // Reset pagination to first page
            setPage(1);
            
            setRfqLoading(false);
            
            // Close the filter panel after applying filters
            
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
         // 🔴  hits when Export is clicked
        try {
            setLoading(true);

            const payload = {
                reportName: "BIDSummaryDetailedReport",
                customerId: customerid,
                area: "BIDManage"
            };

            console.log("📤 Calling export API with payload:", payload);

            const queryString = new URLSearchParams(payload).toString();
            const url = `/api/ReportConfig/DownloadReportExcel?${queryString}`;

            // Fetch with blob response
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${atoken}`,
                    'Content-Type': 'application/json'
                }
            });

            ; // 🔴  hits after API response

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Convert response to blob
            const blob = await response.blob();
            
            console.log("📥 Blob received, size:", blob.size);

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `BIDSummaryDetailedReport_${new Date().toISOString().split("T")[0]}.xlsx`;
            
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            console.log("✅ Report downloaded successfully");
        } catch (error) {
            console.error("❌ Export Error:", error);
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

    function CustomToolbar({ onFilterClick, activeFiltersCount, onExportClick }) {
        const handleCustomExportClick = () => {
            ; //   1: Check if export button click is intercepted
            console.log(' Custom Export button clicked in CustomToolbar');
            console.log(' About to call onExportClick (handleExportClick)');
            onExportClick(); // Use custom export function
            console.log(' onExportClick called');
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
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <div className="d-flex justify-content-between border-bottom align-items-center mb-3 mt-2">
        <div className="page-heading text-dark-blue textMedium">
          <BackButton title="BID Summary Detailed Report" />
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
          <Box sx={{ width: '100%', mt: 2 }}>
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
  rowCount={rowCount}
  paginationModel={{
    page: page - 1,
    pageSize: pageSize
  }}
  onPaginationModelChange={(model) => {
    if (model.page !== (page - 1)) {
      setPage(model.page + 1);
      pullBIDSummaryReport(model.page + 1, model.pageSize);
    }
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
      setPage(1);
      pullBIDSummaryReport(1, model.pageSize);
    }
  }}

  // ✅ Set fixed height instead of autoHeight
  style={{ height: 400, width: "100%" }}

  slots={{
    toolbar: () => <CustomToolbar onFilterClick={toggleDivVisibility} activeFiltersCount={activeFiltersCount} onExportClick={handleExportClick}/>,
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
                                            id="bidId"
                                            name="bidId"
                                            label="Bid ID"
                                            value={formik.values.BidId}
                                            onChange={(e) => formik.setFieldValue("BidId", e.target.value)}
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
                                            <InputLabel id="status">Status</InputLabel>
                                            <Select
                                                id="status"
                                                labelId="status"
                                                label="Status"
                                                variant="outlined"
                                                size="small"
                                                value={formik.values.Status}
                                                onChange={(e) => formik.setFieldValue("Status", e.target.value)}
                                            >
                                               {["Open", "Draft", "Under Pre Approval","Running", "Close"].map((s) => (
                                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>


                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <div className="col-12 mb-3">
                                            <MobileDateTimePicker
                                                label="From Date/Time"
                                                className="w-100 f14"
                                                value={formik.values.FromDate}
                                                onChange={(newValue) => formik.setFieldValue("FromDate", newValue)}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        size: "small",
                                                        error: !!formik.errors.FromDate,
                                                        helperText: formik.errors.FromDate,
                                                    },
                                                }}
                                            />
                                        </div>

                                        <div className="col-12 mb-3">
                                            <MobileDateTimePicker
                                                label="To Date/Time"
                                                className="w-100 f14"
                                                value={formik.values.ToDate}

                                                onChange={(newValue) => formik.setFieldValue("ToDate", newValue)}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        size: "small",
                                                        error: !!formik.errors.ToDate,
                                                        helperText: formik.errors.ToDate,
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

export default BIDSummaryDetailedReport