
import { LoadingButton } from '@mui/lab';
import { Chip, IconButton, MenuItem, TextField, Box, FormControl, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useCallback, useEffect, useState } from 'react'
import { HiOutlineFilter, HiOutlineLink, HiOutlineX, HiX } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { actionTypes, useStateValue } from "../../store";
import { GetPOHeaderList } from '../../utils/pOToAccept';
import * as Yup from "yup";
import { useFormik } from 'formik';
import { useCookies } from 'react-cookie';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import FilterCell from "./FilterCell";
import POOrderDataList from "./POOrderDataList";
import { useRef } from "react";
import ButtonGroup from '@mui/material/ButtonGroup';
import { formatDateToDDMMYYYY, DownloadFile, downloadFilesOnAzure } from '../../utils/common';
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { BackButton } from '../../utils/common/component';
import GridSkeleton from '../../components/Skeleton/gridSkeleton';

const POOrderList = (props) => {

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cookies] = useCookies(["patkn", "prtkn"]);
  const [{ atoken, rtoken, customerid, userDetail }, dispatch] = useStateValue();

  const [gridloading, setGridloading] = useState(true);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  console.log("allPurchaseOrdersallPurchaseOrdersallPurchaseOrders::::", allPurchaseOrders);
  
  const handleFilterList = (res) => {
    setAllPurchaseOrders(res);
    setState({ ...state, right: false });
  };
  
  const clearFilterList = () => {
    fetchPOHeaderList(initialValues);
    setState({ ...state, right: false });
  };
  const callback = useCallback((pass) => {
    console.log("callbackAddCus", pass);
    // setcusupdata(pass);
    // setModalUploadShow(true)
  }, []);

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

  const callbackedit = useCallback((data) => {

    console.log('data to edit', data)
    //seteditRecordData(data);
    //setState({ ...state, opensidebar: true });
  }, []);




  const formRef = useRef();

  //   const formik = useFormik({
  //     initialValues: {
  //       customerid: 1,
  //       wfName: "",
  //       eventType: "",
  //       required: true,
  //       status: true,
  //       userid: 0,
  //       createdon:'',
  //     }, 
  //     onSubmit: (values) => { 
  //       console.log(values);

  //       //  fetchPOHeaderList(values); 
  //   }}) 
  //   const fetchPOHeaderList = async (filters) => {
  //     try {
  //       const res = await GetPOHeaderList(filters);
  //       if (res) {
  //         setAllPurchaseOrders(res);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching PO header list:', error);
  //     }
  //   };


  const callbackPOlist = useCallback((newValue) => {
    setState({ ...state, right: false });
    setAllPurchaseOrders([]);
    // fetchPOHeaderList(newValue);
  }, []);

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



  //   const fetchPOHeaderList = useCallback(async (initialValues) => {
  //     setGridloading(true)
  //     try {
  //       const res = await GetPOHeaderList(initialValues, cookies);
  //       if (res) {
  //        console.log("allPurchaseOrders "+ res)
  //         setAllPurchaseOrders(res);
  //         setGridloading(false)
  //      //   setState({ ...state, 'rightFilter': false });
  //       }
  //     } catch (error) {
  //       // Handle error
  //     }
  //   }, []);


  const [filterPOAmountType, setFilterPOAmountType] = useState(1);
  const [filterSaleFrom, setFilterSaleFrom] = useState(null);
  const [filterSaleTo, setFilterSaleTo] = useState(null);

  const setFilter = (e) => {
    //setPage(1); 
    setState({ ...state, 'right': false });
  };

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
      field: "id",
      headerName: "PO Number",
      flex: 2,
      minWidth: 130,
      renderCell: (params) => (
        <div>
          <Link to={`/purchase-order/${params.formattedValue}`} state={params?.row} style={{ textDecoration: 'none' }}>
            <div className="content-text" style={{ color: '#1976d2' }}>
              {params?.row.poNumber}
            </div>
            <div className="content-text mt-1">
              <span>PO Id: </span>
              {params?.row.id}
            </div>
          </Link>
        </div>
      )
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
      field: "vendorName",
      headerName: "Supplier",
      flex: 2,
      minWidth: 150,
      renderCell: (params) => (
        <Link to={`/purchase-order/${params.row.id}`} state={params?.row} style={{ textDecoration: 'none' }}>
          <div className="content-text">
            {params?.row.vendorName}
          </div>
        </Link>
      )
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


    function CustomToolbar({ onFilterClick }) {
        return (
            <GridToolbarContainer className="row">
                <div className="d-flex justify-content-between w-100 align-items-center">
                    {/* Left side buttons */}
                    <div className="d-flex gap-2">
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <GridToolbarExport />
                    </div>

                    {/* Right side: Quick Filter + Custom Filter Icon */}
                    <div className="d-flex align-items-center gap-2">
                        <GridToolbarQuickFilter />
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
    }
  return (
    <>
      <div className="mainContainer d-flex">
        {/* LEFT CONTENT */}
          <div className={`leftContent ${divVisible ? "col-9" : "col-12"} d-flex flex-column`}>
          <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="d-flex justify-content-between border-bottom align-items-center mb-3">
              <div className="page-heading text-dark-blue textMedium">
                <BackButton title="Purchase Order" />
              </div>
              <div className="d-flex align-items-center gap-2">
                {/* Action buttons can be added here if needed */}
              </div>
            </div>

            <div className="row gx-0 flex-grow-1">
              <div className="col-12 mb-3 d-flex flex-column" style={{ height: '100%' }}>
                    {gridloading ? (
                      <GridSkeleton />
                    ) : (
                      <div className="data-grid-wrapper flex-grow-1" style={{ overflow: 'hidden' }}>
                        <DataGrid
                          getRowId={getRowId}
                          rows={allPurchaseOrders}
                          columns={columns}
                          getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                          }
                          rowHeight={40}
                          columnHeaderHeight={40}
                          className='content-text border-0 consistent-datagrid'
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          disableRowSelectionOnClick
                          disableDensitySelector
                          disableColumnResize
                          disableColumnReorder
                          sx={{
                            '& .MuiDataGrid-main': {
                              overflow: 'hidden'
                            },
                            '& .MuiDataGrid-virtualScroller': {
                              overflowX: 'hidden !important'
                            }
                          }}
                         slots={{
                                                toolbar: () => <CustomToolbar onFilterClick={toggleDivVisibility} />,
                                            }}
                          slotProps={{
                            toolbar: {
                              showQuickFilter: true,
                            },
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
            <div className="rightContent col-3">
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
                      <FilterCell
                        handleFilterList={handleFilterList}
                        clearFilterList={clearFilterList}
                        
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
