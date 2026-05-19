import { Chip, IconButton, MenuItem, TextField, Box, FormControl, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import React, { useState, useCallback, useEffect } from "react"; 
  
import { HiOutlineFilter, HiOutlineLink,HiPlusSm, HiOutlineX, HiX } from 'react-icons/hi';
  import LoadingButton from "@mui/lab/LoadingButton";
  import { HiOutlineTrash, HiPencilAlt } from "react-icons/hi";
  import { Modal } from "react-bootstrap"; 
import { formatDateToDDMMYYYY,DownloadFile } from '../../utils/common'; 
import { Link } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

  import { useFormik } from "formik";
  import * as yup from "yup";
import FilterCell from "./FilterCell";

import { useCookies } from 'react-cookie';
import { actionTypes, useStateValue } from "../../store";
import { GetPOHeaderList } from '../../utils/pOToAccept';

  const POOrderDataList = (props) => {

    
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [gridloading, setGridloading] = useState(true);
    const [{ atoken, rtoken ,customerid}, dispatch] = useStateValue();
  const [cookies] = useCookies(["patkn", "prtkn"]);
    const [records, setRecords] = useState([]);
    const [wfid, setWfid] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectUserOption, setSelectUserOption] = useState("U");
  
    const [selectUserrole, setselectUserrole] = useState(0);
  
    const [eventtype, setEventtype] = useState(0);
  
    const [budgetstatus, setbudgetstatus] = useState("");
    const [open, setOpen] = React.useState(false);
    //to set id for edit and delete
    //const [isAdd,setIsAdd]=useState(true);
    const [itemid, setItemId] = useState(0);
    const [approverseq, setapproverseq] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [page, setPage] = useState(1);
    //Addworkflowcellopens
    const [state, setState] = useState({
      opensidebar: false,
    });
    const handleUserChange = (event, value) => {
       
      setSelectedUsers(value);
    };
  
    const handleAddUser = () => {
     
    //   if (selectedUsers?.id > 0) {
    //     const isFound = approverseq.some((element) => {
    //       return element.id === selectedUsers.id;
    //     });
  
    //     if (isFound) {
    //       console.log("array contains object with id = " + selectedUsers.id);
    //     } else {
    //       setapproverseq((approverseq) => [
    //         ...approverseq,
    //         {
    //           wfid: item.id,
    //           userid: selectedUsers.id,
    //           username: selectedUsers.name,
    //           useremailid: selectedUsers.email,
    //           budgetstatus: budgetstatus,
    //         },
    //       ]);
    //     }
    //   }
      //});
      //console.log(approverseq);
      // Clear the selectedUsers array after adding users to the list
      setSelectedUsers([]);
  
      // You can also add additional logic here if needed
   
    };
  
    const handleSubmitClick = () => {
      console.log("inputListdata", inputList);
     
    //   formikcat.setFieldValue("customerid", 1);
    //   formikcat.setFieldValue("usertype", selectUserOption);
    //   formikcat.setFieldValue("wfid", wfid);
    //   // formikcat.setFieldValue("users", inputList);
    //   formikcat.handleSubmit();
    };
   
    // AddWFApprover(datapost).then((res) => {
    //       setLoading(false);
    //       dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
    //       dispatch({
    //         type: actionTypes.SET_MSGALERTDATA,
    //         value: res?.data?.message,
    //       });
    //       dispatch({ type: actionTypes.SET_MSGALERT, value: true });
    //       //callbackstep('update');
  
    //       setselectUserrole(0);
    //       setModal(false);
    //       return true;
    //     });
    //   },
    // });
  
    const handleRemoveClick = (index) => {
      const list = [...approverseq];
      list.splice(index, 1);
      setapproverseq(list);
    };
   
    // const userList = (customerId) => {
    //   var data = {
    //     customerId: customerId,
    //   };
    //   getuserlist(data).then((res) => {
    //     console.log(res);
    //     if (res && Array.isArray(res)) {
    //       // Check if res is a valid array
    //       setUserOptions(res);
    //     } else {
    //       return userOptions;
    //     }
    //   });
    // };
    // const getappseq = (wfid) => {
    //   var data = {
    //     id: 2,
    //     wfid: wfid,
    //   };
    //   // console.log("data", data);
    //   getwfapproverseqn(data).then((res) => {
    //      
    //     //  console.log(res);
    //     if (res && Array.isArray(res)) {
    //       // Check if res is a valid array
    //       if (res[0]?.roleid > 0) {
    //         setselectUserrole(res[0]?.roleid);
    //       }
    //       setbudgetstatus(res[0]?.budgetstatus);
    //       setapproverseq(res);
    //     } else {
    //       return;
    //     }
    //   });
    // };
  
    const [modal, setModal] = useState(false);
    const OpenModal = (item) => {
       
  
    //   setModal(true);
  
    //   setselectUserrole(0);
    //   //userList(1);
    //   // console.log("res" + userOptions);
  
    //   setSelectUserOption(item.approverusertype);
    //   // console.log("res" + approverseq);
    //   setWfid(item?.id);
  
    //   setEventtype(item.eventtype);
  
      //getappseq(item.id);
    };
  
    const CloseModal = () => {
      setModal(false);
      setWfid(0);
      setEventtype("");
      setSelectUserOption("U");
    };
  
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
  
    const [inputList, setInputList] = useState();
    const handleInputChange = (e, index) => {
      // console.log(e);
      const { name, value } = e.target;
      const list = approverseq;
      list[index][name] = parseInt(value);
      setapproverseq(list);
      console.log(approverseq);
    };
  
    const onlyNumbers = (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    };
  

    
  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  
  
  const initialValues = {
    customerid : customerid,
    PONumber: '',
    FromDate: null,
    ToDate: null,
    filterPOAmountType: '',
    FromAmount: '',
    ToAmount: '',
    POStatus: '', //Confirmed
    POType: '',
    Company: ''
  };


  
  useEffect(() => {
     fetchPOHeaderList(initialValues);
   }, []);

   
  const fetchPOHeaderList = useCallback(async (initialValues) => {
    setGridloading(true)
    try {
      const res = await GetPOHeaderList(initialValues, cookies);
      if (res) {
       console.log("allPurchaseOrders "+ res)
       setAllPurchaseOrders(res);
        setGridloading(false)
     //   setState({ ...state, 'rightFilter': false });
      }
    } catch (error) {
      // Handle error
    }
  }, []);

  const columns = [
    {
      field: "id",
      headerName: "PO Number",
      renderCell: (params) => (
        // console.log('params--0', params)
        <Link to={`/purchase-order/${params.formattedValue}`} state={params?.row} className='textLigblue'>
          {params?.row.poNumber}
        </Link>
      )
      
    },
    {
      field: "createdOn",
      headerName: "PO Date",
      width: 100,
      renderCell: (params) => (
        params.formattedValue ? formatDateToDDMMYYYY(params.formattedValue) : ''
      )
    },
    {
      field: "poAmount",
      headerName: "PO Amount",
      width: 100,  
      
    },
    {
      field: "paidAmount",
      headerName: "Paid Amount",
      width: 100,
    },
    {
      field: "stage",
      headerName: "Stage",
      width: 150,
    },
    {
      field: "poType",
      headerName: "PO Type",
      width: 100,
    },
    {
      field: "vendorName",
      headerName: "Supplier",
      width: 200,
    },
    {
      field: "poDocumentFileName",
      headerName: "PO Document",
      width: 150,
      renderCell: (params) => ( 
         
         <Chip icon={<HiOutlineLink />}   size='small' color="primary" className='ps-1' variant="outlined" label="Download">
        </Chip>
      
        
      ) 
    },
    
  ];
  const getRowId = (row) => {
    return row.id;
  }

  const onClickDownload = (rows) => { 
   if(rows.field=='poDocumentFileName') {
      DownloadFile(rows.row.poDocumentFilePath, rows.row.poDocumentFileName)
   }
  }

  
  const callbackPOlist = useCallback((newValue) => { 
    setState({ ...state, right: false });
    setAllPurchaseOrders([]);
   // fetchPOHeaderList(newValue);
  }, []);


    return (
      <>
        {/* <div className="row align-items-center p-0 pb-1 border-bottom ms-0 me-0 pt-1 pb-1"> 
        <div className="col-12 col-md-10">*/}
          {/* <div className="row text-left f12 lingh14 text-muted"> */}
          <div className="col-12 mb-3 ">
              <DataGrid
                
                getRowId={getRowId}
                rows={allPurchaseOrders}
                // loading={gridloading}
                columns={columns}
                autoHeight
                getRowClassName={(params) =>
                 
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                }
               
                rowHeight={40}
                columnHeaderHeight={40}
                className='f13 border-0'
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }} 
                slotProps={{
                    toolbar: {
                    showQuickFilter: true,
                    
                    },
                }}
                onCellClick={onClickDownload}
    
                />  

            </div>
          {/* </div>
   
        </div> */}
       
        
      </>
    );
  };
  
  export default POOrderDataList;
  