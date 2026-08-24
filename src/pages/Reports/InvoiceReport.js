import React from 'react'
import { useEffect, useState } from 'react';
import { Autocomplete, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, } from "@mui/material";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { formatDateViaLocale, formatDateViaLocaleonlydatenottime, getEventStage, getReportColumns, getRFQSummaryReport } from '../../utils/common/utility';
import { actionTypes, useStateValue } from '../../store';
import { HiOutlineX} from "react-icons/hi";
import CryptoJS from "crypto-js";
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Box, IconButton, Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
 
import FilterRFQCell from '../Configuration/RequestForQuotation/FilterRFQCell';
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
 
const InvoiceReport = () => {
 
    const [{ atoken, rtoken, customerid, userDetail, eventId, eventType,customersuffix }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
    const LOCAL_STORAGE_KEY = 'InvoiceReportColumnVisibility';
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
            // setDivVisible(!divVisible);
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
        setRfqLoading(true);
        await pullInvoiceReport(1, pageSize);
        setRfqLoading(false);
       
        // Close the filter panel
        // closeDivVisibility();
    };
    const columns = tableColumnLabels?.map(item => ({
        field: item?.columnName,
       headerName: item?.columnTitle,
        width: item?.width || 180,
        editable: false,
        hideable: item?.hideable || true,
         
              valueFormatter: (item?.columnTitle === "Invoice createdOn" || item?.columnTitle === "End Date" || item?.columnTitle === "Configure Date")
                    ? (params) => {
                        return params.value ? formatDateViaLocaleonlydatenottime(params.value, userDetail) : "";
                    }
                    : undefined,
                renderCell: (params) => {
                    return (
        <div
                            title={`Click to view details`}
                            onClick={() => {
                                navigate(`/configuration/manage-rfq/${params?.row.id}`); // Navigate to the desired page
                            }}
                            className='pointer'>
                            {params?.formattedValue} {/* Display the value of the cell */}
        </div>
                    );
                },
    }));
 
    const pullReportColumns = async () => {
        try {
            const data = { slug: 'InvoiceDetailReport' ,customerId: customerid };
            const res = await getReportColumns(data, atoken);
            //console.log('response pullReportColumns', res);
            if (res?.length > 0) {
                setTableColumnLabels(res);
                pullInvoiceReport();
            } else {
                //console.log('No columns returned');
            }
        } catch (error) {
            //console.log('Error fetching report columns:', error);
        }
    };
      const [invoiceStatusLoaded, setInvoiceStatusLoaded] = useState(false);
        const [invoiceStatusList, setInvoiceStatusList] = useState([]);
      const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
        const data = { CustomerId: customerid, IsActive: true, EventType: EventTypeId };
        try {
          const res = await getEventStage(data, atoken);
          
          // const resultArray = Array.isArray(res?.data)
          //   ? res.data
          //   : Array.isArray(res?.data?.result)
          //   ? res.data.result
          //   : [];
          setList(res || []);
        } catch (err) {
          console.error("Error fetching event stage:", err);
          setList([]);
        } finally {
          setLoaded(true);
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
const pullInvoiceReport = async (pageNumber = 1, pageSize = 10, filterData = null) => {
    setLoading(true);
 
    try {
        await updateToken(); // Refresh token if needed
 
        // Build query parameters - exclude pagination when any filter is provided
        const baseParams = {
            CustomerId: customerid,
            ...(filterData || {}) // include any extra filters if passed
        };
        
        // Only add pagination if no filters are applied (advance search)
        if (!filterData || Object.keys(filterData).length === 0) {
            baseParams.PageNumber = pageNumber;
            baseParams.PageSize = pageSize;
        }
        
        const queryParams = buildQueryParams(baseParams);
 
        console.log('📤 GET Request URL:', `api/poinvoice/InvoiceDetailReport?${queryParams}`);
 
        // GET request with query string
        const res = await apiClient.get(
            `api/poinvoice/InvoiceDetailReport?${queryParams}`,
            atoken
        );
 
        console.log('📥 Response:', res);
 
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
        console.error("🔴 Error pulling invoice report:", error);
        setTableRows([]);
        setOriginalTableRows([]);
        setRowCount(0);
        setTotalCount(0);
    } finally {
        setLoading(false);
    }
};
 
 
 
  const getRowId = (row) => {
    // Use invoiceNo if unique, otherwise combine fields for uniqueness
    return row.invoiceNo || `${row.poNumber}_${row.itemCode}_${row.createdOn}`;
};
    const formik = useFormik({
        initialValues: {
            Id: '',
            Subject: '',
            stage: '',
            StartDate: null,
            EndDate: null,
            POId: '',
            invoiceNo: '',
            poNumber: '',
            itemCode: '',
            InvoiceStatus: '',
            createdOn: null,
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
            if (filterValues.POId && filterValues.POId.trim() !== '') activeCount++;
            if (filterValues.invoiceNo && filterValues.invoiceNo.trim() !== '') activeCount++;
            if (filterValues.poNumber && filterValues.poNumber.trim() !== '') activeCount++;
            if (filterValues.itemCode && filterValues.itemCode.trim() !== '') activeCount++;
            if (filterValues.InvoiceStatus && filterValues.InvoiceStatus.trim() !== '') activeCount++;
            if (filterValues.createdOn) activeCount++;
           
            setActiveFiltersCount(activeCount);
           
            // Prepare filter data for API call
            const filterData = {
                POId: filterValues.POId || null,
                InvoiceNo: filterValues.invoiceNo || null,
                PONumber: filterValues.poNumber || null,
                ItemCode: filterValues.itemCode || null,
                Status: filterValues.InvoiceStatus || null,
                CreatedOn: filterValues.createdOn ? new Date(filterValues.createdOn).toISOString() : null,
            };
 
            // Remove null/empty values
            Object.keys(filterData).forEach(key => {
                if (filterData[key] === null || filterData[key] === '') {
                    delete filterData[key];
                }
            });
 
            console.log('🔍 Applying filters:', filterData);
 
            // Reset to first page and call API with filters
            setPage(1);
            await pullInvoiceReport(1, pageSize, filterData);
           
            setRfqLoading(false);
           
            // Close the filter panel after applying filters
            // closeDivVisibility();
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
            reportName: "InvoiceDetailReport",
            customerId: customerid,
            area: "poinvoice",
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
    function CustomToolbar({ onFilterClick, activeFiltersCount, onExportClick }) {
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
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <div className="d-flex justify-content-between border-bottom align-items-center mb-3 mt-2">
        <div className="page-heading text-dark-blue textMedium">
          <BackButton title="Invoice Report" />
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
  rowCount={TotalCount}
  paginationModel={{
    page: page - 1,
    pageSize: pageSize
  }}
  onPaginationModelChange={(model) => {
    // Prepare current filter data if filters are active
    const currentFilters = activeFiltersCount > 0 ? {
      POId: formik.values.POId || null,
      InvoiceNo: formik.values.invoiceNo || null,
      PONumber: formik.values.poNumber || null,
      ItemCode: formik.values.itemCode || null,
      Status: formik.values.InvoiceStatus || null,
      CreatedOn: formik.values.createdOn ? new Date(formik.values.createdOn).toISOString() : null,
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
      pullInvoiceReport(model.page + 1, model.pageSize, currentFilters);
    }
   
    // Handle page size change
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
      setPage(1);
      pullInvoiceReport(1, model.pageSize, currentFilters);
    }
  }}
 
  // ✅ Set fixed height instead of autoHeight
  style={{ height: 400, width: "100%" }}
 
  slots={{
    toolbar: () => <CustomToolbar onFilterClick={toggleDivVisibility} activeFiltersCount={activeFiltersCount} onExportClick={handleExportClick} />,
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
                                            id="invoiceNo"
                                            name="invoiceNo"
                                            label="Invoice No"
                                            value={formik.values.invoiceNo}
                                            onChange={(e) => formik.setFieldValue("invoiceNo", e.target.value)}
                                        />
                                    </div>
   <div className="col-12 mb-3">
                                        <TextFieldCell
                                            id="poNumber"
                                            name="poNumber"
                                            label="PO Number"
                                            maxLength={200}
                                            value={formik.values.poNumber}
                                            onChange={(e) => formik.setFieldValue("poNumber", e.target.value)}
                                            InputProps={{
                                                endAdornment: formik.values.poNumber && (
                                                    <InputAdornment position="end">
                                                        <Typography variant="body2" color="textSecondary">
                                                            {formik.values.poNumber.length}/200
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
  <div className="col-12 mb-3">
                                        <TextFieldCell
                                            id="poNumber"
                                            name="poNumber"
                                            label="PO ID"
                                            maxLength={200}
                                            value={formik.values.POId}
                                            onChange={(e) => formik.setFieldValue("POId", e.target.value)}
                                            InputProps={{
                                                endAdornment: formik.values.POId && (
                                                    <InputAdornment position="end">
                                                        <Typography variant="body2" color="textSecondary">
                                                            {formik.values.POId.length}/200
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
                                    <div className="col-12 mb-3">
                                        <TextFieldCell
                                            id="itemCode"
                                            name="itemCode"
                                            label="Item Code"
                                            maxLength={200}
                                            value={formik.values.itemCode}
                                            onChange={(e) => formik.setFieldValue("itemCode", e.target.value)}
                                            InputProps={{
                                                endAdornment: formik.values.itemCode && (
                                                    <InputAdornment position="end">
                                                        <Typography variant="body2" color="textSecondary">
                                                            {formik.values.itemCode.length}/200
                                                        </Typography>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </div>
 
 
             <div className="col-12 mb-2">
               <TextField
                 id="InvoiceStatus"
                 name="InvoiceStatus"
                 select
                 fullWidth
                 size="small"
                 label="Invoice Status"
                 variant="outlined"
                 value={formik.values.InvoiceStatus}
                 onChange={formik.handleChange}
                 InputLabelProps={{ shrink: true }}
                 SelectProps={{
                   onOpen: () => {
                     
                     if (!invoiceStatusLoaded) pullGetEventStage("INV", setInvoiceStatusList, setInvoiceStatusLoaded);
                   }
                 }}
               >
                 {invoiceStatusList.length
                   ? invoiceStatusList.map(item => (
                       <MenuItem key={item.id} value={item.stageName}>
                         {item.stageName}
                       </MenuItem>
                     ))
                   : <MenuItem disabled>No options available</MenuItem>}
               </TextField>
             </div>
 
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <div className="col-12 mb-3">
                                            <MobileDateTimePicker
                                                label="Created Date"
                                                className="w-100 f14"
                                                value={formik.values.createdOn}
                                                onChange={(newValue) => formik.setFieldValue("createdOn", newValue)}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        size: "small",
                                                        error: !!formik.errors.createdOn,
                                                        helperText: formik.errors.createdOn,
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
                                          
                                              onClick={async (e) => {
                                                e.preventDefault();
                                                formik.handleSubmit();
                                            }}
                                        >
                                           Submit
                                        </LoadingButton>
                                        <LoadingButton
                                            loading={rfqLoading}
                                            variant="outlined"
                                            color="primary"
                                            className="text-capitalize"
                                            onClick={clear}
                                        >
                                         Clear
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
 
export default InvoiceReport;