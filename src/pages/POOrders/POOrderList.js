import { Chip, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react'
import { HiDownload, HiOutlineLink, HiOutlineX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { actionTypes, useStateValue } from "../../store";
import { GetPOHeaderList } from '../../utils/pOToAccept';
import { useCookies } from 'react-cookie';
import Drawer from '@mui/material/Drawer';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterCell from "./FilterCell";
import { formatDateToDDMMYYYY, downloadFilesOnAzure, getApiErrorMessage } from '../../utils/common';
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { BackButton } from '../../utils/common/component';
import GridSkeleton from '../../components/Skeleton/gridSkeleton';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ApiClient } from '../../Apiclient';

const getPoListSearchText = (row) => {
  if (!row) return '';
  return [
    row.poNumber,
    row.externalSourcePONumber,
    row.nfaCode,
    row.id,
    row.poAmount,
    row.paidAmount,
    row.stage,
    row.poType,
    row.createdByName,
    row.requestedBy,
    row.company,
    row.vendorName,
  ]
    .map((value) => (value == null ? '' : String(value)))
    .join(' ')
    .toLowerCase();
};

const getPoListQuickFilterFn = (value) => {
  if (value == null || String(value).trim() === '') {
    return null;
  }
  const search = String(value).trim().toLowerCase();
  return (cellParams, row) => getPoListSearchText(cellParams?.row || row).includes(search);
};

const CustomToolbar = ({ onFilterClick, onExportClick }) => (
  <GridToolbarContainer className="row">
    <div className="d-flex justify-content-between w-100 align-items-center">

      <div className="d-flex gap-2">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />

        {/* Custom Export */}
        {/* Custom Export */}
        <IconButton
          onClick={onExportClick}
          title="Export PO Download"
          size="small"
          sx={{
            color: "#000000",
            gap: "4px"
          }}
        >
          <HiDownload size={16} />
          <span style={{ fontSize: "13px", fontWeight: 400 }}>
            Export PO
          </span>
        </IconButton>

      </div>


      <div className="d-flex align-items-center gap-2">

        <GridToolbarQuickFilter
          debounceMs={400}
          quickFilterParser={(searchInput) =>
            [searchInput.trim()].filter(Boolean)
          }
        />

        <div
          className="filterIconCircle shadow-sm"
          onClick={onFilterClick}
          title="Open Filters"
        >
          <FilterListIcon />
        </div>

      </div>

    </div>
  </GridToolbarContainer>
);

const POOrderList = (props) => {

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [columnFilterMode, setColumnFilterMode] = useState(false);
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [cookies] = useCookies(["patkn", "prtkn"]);
  const [{ atoken, rtoken, customerid, userDetail, customersuffix }, dispatch] = useStateValue();
  const [exportFilters, setExportFilters] = useState({});
  const apiClient = new ApiClient(customersuffix);


  useEffect(() => {
    dispatch({ type: actionTypes.SET_EVENTID, value: 0 });
    dispatch({ type: actionTypes.SET_EVENTTYPE, value: "" });
  }, [dispatch]);

  const [gridloading, setGridloading] = useState(true);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  console.log("allPurchaseOrdersallPurchaseOrdersallPurchaseOrders::::", allPurchaseOrders);

  const handleFilterList = (res, filters = {}) => {
    setAllPurchaseOrders(res);
    setExportFilters(filters);
    setState({ ...state, right: false });
  };
  const handleExportPOExcel = async () => {

    try {

      const payload = {
        customerId: customerid || 0
      };


      if (exportFilters?.poId) {
        payload.poId = parseInt(exportFilters.poId);
      }

      if (exportFilters?.itemNo) {
        payload.itemNo = exportFilters.itemNo;
      }

      if (exportFilters?.itemName) {
        payload.itemName = exportFilters.itemName;
      }

      if (exportFilters?.itemType) {
        payload.itemType = exportFilters.itemType;
      }

      if (exportFilters?.poStage) {
        payload.poStage = exportFilters.poStage;
      }

      if (exportFilters?.invoiceNo) {
        payload.invoiceNo = exportFilters.invoiceNo;
      }

      if (exportFilters?.invoiceStage) {
        payload.invoiceStage = exportFilters.invoiceStage;
      }

      if (exportFilters?.createdDate) {
        payload.createdDate = exportFilters.createdDate;
      }


      console.log("Export Payload =>", payload);


      const res = await apiClient.api.post(
        "/api/poconfirm/ExportPOExcel",
        payload,
        {
          headers: {
            Authorization: `Bearer ${atoken}`
          },
          responseType: "blob"
        }
      );


      if (res?.data) {

        const blob = new Blob(
          [res.data],
          {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          }
        );


        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
          `PO_Export_${new Date().toISOString().split("T")[0]}.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);
      }


    }
    catch (error) {

      console.error("handleExportPOExcel failed:", error);

      toast.error(
        getApiErrorMessage(error),
        {
          toastId: "handleExportPOExcel_error"
        }
      );

    }

  };

  const clearFilterList = () => {
    fetchPOHeaderList(initialValues);
    setState({ ...state, right: false });
  };


  // Communication hub: Pull message count for PO list (like ManageRFQ)
  const eventType = 'PO';
  useEffect(() => {
    if (userDetail?.id) {
      if (typeof window.pullMessageCount === 'function') {
        window.pullMessageCount({
          UserId: userDetail.id,
          EventType: eventType,
          IsVenderYN: 'N',
          atoken,
          dispatch
        });
      }
    }
  }, [userDetail, atoken, dispatch]);


  const initialValues = {
    CustomerId: customerid,
    //PONumber: '',
    //FromDate: null,
    //ToDate: null,
    //filterPOAmountType: '',
    //FromAmount: '',
    //ToAmount: '',
    //POStatus: '', //Confirmed
    //POType: '',
    //Company: ''
  };



  useEffect(() => {
    fetchPOHeaderList(initialValues);
  }, []);

  const [state, setState] = useState({ right: false, });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  //pogrid

  const fetchPOHeaderList = useCallback(async (initialValues) => {
    setGridloading(true)
    try {
      const res = await GetPOHeaderList(initialValues, atoken);
      if (res) {

        setAllPurchaseOrders(res);
        setGridloading(false)
        //   setState({ ...state, 'rightFilter': false });
      }
    } catch (error) {
      // Handle error
      console.error('Error fetching PO header list:', error);
    }
  }, []);

  const columns = [

    {
      field: "poNumber",
      headerName: "PO Number",
      flex: 2,
      minWidth: 100,
      filterable: true,
      valueGetter: (params) => {
        const poNumber = params?.row?.poNumber || '';
        const externalPo = params?.row?.externalSourcePONumber || '';
        const nfaCode = params?.row?.nfaCode || '';
        const id = params?.row?.id || '';
        return `${poNumber} ${externalPo} ${nfaCode} ${id}`.trim();
      },
      getApplyQuickFilterFn: getPoListQuickFilterFn,
      renderCell: (params) => {
        const displayPONumber =
          params?.row?.externalSourcePONumber ||
          params?.row?.poNumber;

        const hasPONumber = !!displayPONumber;

        return (
          <div>
            <Link
              to={`/purchase-order/${params.row.id}`}
              state={params?.row}
              style={{ textDecoration: 'none' }}
            >
              {hasPONumber ? (
                <div className="content-text" style={{ color: '#1976d2' }}>
                  {displayPONumber}

                </div>
              ) : (
                <div className="content-text mt-1">
                  <span>PO Id: </span>
                  {params?.row?.id}
                </div>
              )}

            </Link>
            {params?.row.nfaCode && (
                  <>
                      <span>NFA: </span>
                      <span className="text-primary">
                          {params?.row.nfaCode}
                      </span>
                  </>
              )}
          </div>
        );
      }
    },
    {
      field: "createdOn",
      headerName: "PO Date",
      flex: 1,
      minWidth: 80,
      renderCell: (params) => (
        <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {params.formattedValue ? formatDateToDDMMYYYY(params.formattedValue) : ''}
          </div>
        </Link>
      )
    },
    {
      field: "poAmount",
      headerName: "PO Amount",
      flex: 1,
      minWidth: 80,
      renderCell: (params) => (
        <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {params?.row.poAmount}
          </div>
        </Link>
      )
    },
    {
      field: "paidAmount",
      headerName: "Paid Amount",
      flex: 1,
      minWidth: 90,
      renderCell: (params) => (
        <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {params?.row.paidAmount}
          </div>
        </Link>
      )
    },
    {
      field: "stage",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        const statusClass = params?.row?.stage === 'New' ? 'text-danger' : 'text-primary';
        return (
          <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
            <div className={`content-text ${statusClass}`}>
              {params?.row?.stage}
            </div>
          </Link>
        );
      }
    },
    {
      field: "poType",
      headerName: "PO Type",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {params?.row.poType}
          </div>
        </Link>
      )
    },

    {
      field: "createdByName",
      headerName: "Created By",
      flex: 2,
      minWidth: 150,
      renderCell: (params) => {
        const fullName = params?.row.createdByName || "";

        return (
          <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {fullName}
          </div>
        </Link>
        );
      }
    },
    {
      field: "requestedBy",
      headerName: "Requested By",
      flex: 2,
      minWidth: 150,
      renderCell: (params) => {
        const fullName = params?.row.requestedBy || "";

        return (
          <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {fullName}
          </div>
        </Link>
        );
      }
    },
    {
      field: "vendorName",
      headerName: "Supplier",
      flex: 2,
      minWidth: 150,
      valueGetter: (params) => {
        const company = params?.row?.company || '';
        const vendorName = params?.row?.vendorName || '';
        return `${company} ${vendorName}`.trim();
      },
      getApplyQuickFilterFn: getPoListQuickFilterFn,
      renderCell: (params) => {
        const fullName = params?.row.company || "";

        const truncated =
          fullName.length > 18
            ? fullName.substring(0, 18) + "..."
            : fullName;

        return (
          <Link
            to={`/purchase-order/${params.row.id}`}
            state={params?.row}
            style={{ textDecoration: "none" }}
          >
            <div className="content-text" title={fullName}>
              {truncated}
            </div>
          </Link>
        );
      }
    },
    {
      field: "poDocumentFileName",
      headerName: "PO Document",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => (
        params.formattedValue ?
          <Chip
            icon={<HiOutlineLink />}
            size='small'
            color="primary"
            className='ps-1'
            variant="outlined"
            label="Download"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              downloadFilesOnAzure(params.row.poDocumentFilePath, params.row.poDocumentFileName, atoken);
            }}
          /> :
          <div className="content-text">No attachments</div>
      )
    },
  ];
  const getRowId = (row) => {
    return row.id;
  }

  const onClickDownload = (rows) => {
    // Handle row clicks but prevent download action since download is handled in renderCell
    if (rows.field === 'poDocumentFileName' && rows.row.poDocumentFileName) {
      // Download is handled in the renderCell onClick
      return;
    }
  }


  const [divVisible, setDivVisible] = useState(false);

  const toggleDivVisibility = () => {
    setDivVisible(!divVisible);
  };

  const closeDivVisibility = () => {
    setDivVisible(false);
  };



  return (
    <>
      {/* FIXED: Changed 70px to 120px to properly account for the top navbar height */}
      <div className="mainContainer manage-po-layout d-flex align-items-stretch" style={{ height: 'calc(100vh - 120px)', minHeight: 0, overflow: 'hidden', gap: '4px' }}>

        {/* LEFT CONTENT */}
        <div className="leftContent manage-po-column d-flex flex-column" style={{ height: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden', flex: divVisible ? '1 1 0' : '1 1 100%' }}>
          <div className="bg-white rounded-default shadow-sm p-3 flex-grow-1 d-flex flex-column manage-po-card" style={{ margin: '10px', minHeight: 0, overflow: 'hidden' }}>
            <div className="d-flex justify-content-between border-bottom align-items-center mb-3">
              <div className="page-heading text-dark-blue textMedium">
                <BackButton title="Purchase Order" />
              </div>
              <div className="d-flex align-items-center gap-2">
                {/* Action buttons can be added here if needed */}
              </div>
            </div>

            <div className="row gx-0 flex-grow-1" style={{ minHeight: 0 }}>
              {/* FIXED: Removed the 'mb-3' class here. Combining height: 100% with a bottom margin forces the container to overflow its parent. */}
              <div className="col-12 d-flex flex-column" style={{ height: '100%', minHeight: 0 }}>
                {gridloading ? (
                  <GridSkeleton />
                ) : (
                  <div className="data-grid-wrapper flex-grow-1" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
                    <DataGrid
                      getRowId={getRowId}
                      rows={allPurchaseOrders}
                      columns={columns}
                      getRowClassName={(params) =>
                        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                      }
                      pagination
                      paginationMode="client"
                      filterMode="client"
                      pageSizeOptions={[10, 25, 50, 100]}
                      paginationModel={{ page, pageSize }}
                      onPaginationModelChange={(model) => {
                        if (model.page !== page) {
                          setPage(model.page);
                        }
                        if (model.pageSize !== pageSize) {
                          setPageSize(model.pageSize);
                          setPage(0);
                        }
                      }}
                      onFilterModelChange={(filterModel) => {
                        const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
                        if (nextQuickFilterValue !== quickFilterValue) {
                          setQuickFilterValue(nextQuickFilterValue);
                          setPage(0);
                        }
                        const hasActiveColumnFilter = filterModel?.items?.some(
                          (item) => item.value !== undefined && item.value !== '' && item.value !== null
                        );
                        if (hasActiveColumnFilter && !columnFilterMode) {
                          setColumnFilterMode(true);
                        } else if (!hasActiveColumnFilter && columnFilterMode) {
                          setColumnFilterMode(false);
                          setPage(0);
                        }
                      }}
                      rowHeight={40}
                      columnHeaderHeight={40}
                      className='content-text border-0 consistent-datagrid'
                      style={{ width: '100%', height: '100%', minHeight: 0, border: 'none' }}
                      disableRowSelectionOnClick
                      disableDensitySelector
                      disableColumnResize
                      disableColumnReorder
                      sx={{
                        '& .MuiDataGrid-main': {
                          overflow: 'hidden',
                          minHeight: 0
                        },
                        '& .MuiDataGrid-virtualScroller': {
                          overflowY: 'auto !important',
                          overflowX: 'hidden !important',
                          minHeight: 0
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          backgroundColor: '#fff'
                        },
                        '& .MuiDataGrid-footerContainer': {
                          position: 'sticky',
                          bottom: 0,
                          zIndex: 2,
                          backgroundColor: '#fff',
                          borderTop: '1px solid #e0e0e0'
                        }
                      }}
                      slots={{ toolbar: CustomToolbar }}
                      slotProps={{
                        toolbar: {
                          onFilterClick: toggleDivVisibility,
                          onExportClick: handleExportPOExcel
                        }
                      }}
                      onCellClick={onClickDownload}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT (Filter Panel) */}
        {divVisible && (
          <div
            className="rightContent manage-po-search-panel"
            style={{
              display: 'flex',
              flexDirection: 'column', /* ADDED: To enable flex-grow for the child */
              flex: '0 1 clamp(280px, 24vw, 320px)',
              maxWidth: 'clamp(280px, 24vw, 320px)',
              width: 'clamp(280px, 24vw, 320px)',
              height: '100%',
              minWidth: 0,
              overflow: 'hidden'
            }}
          >
            <div
              /* ADDED: flex-grow-1 to mirror the left panel's sizing behavior */
              className="bg-white shadow-sm rounded-default p-3 d-flex flex-column flex-grow-1 right-panel-container"
              /* REPLACED height: 100% WITH margin top/bottom 10px to perfectly align with the left panel */
              style={{ margin: '10px 10px 10px 0', minHeight: 0, overflow: 'hidden' }}
            >
              <form className="d-flex flex-column flex-grow-1 manage-po-search-form">
                <div className="d-flex flex-column flex-grow-1 manage-po-search-form" style={{ height: '100%' }}>
                  <div className="d-flex justify-content-between border-bottom align-items-center py-1">
                    <div className="page-heading text-dark-blue ms-2">
                      Advance Search
                    </div>
                    <IconButton onClick={closeDivVisibility} size="small" edge="start">
                      <HiOutlineX className="f16" />
                    </IconButton>
                  </div>
                  <div className="flex-grow-1 manage-po-search-fields">
                    <FilterCell
                      handleFilterList={handleFilterList}
                      clearFilterList={clearFilterList}
                      setExportFilters={setExportFilters}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <React.Fragment key="filtert">
        <Drawer
          anchor="right"
          open={state["rightFilter"]}
          onClose={toggleDrawer("rightFilter", false)}
        >
          {/* Filter content can be added here if needed */}
        </Drawer>
      </React.Fragment>
    </>
  );
};
export default POOrderList;
