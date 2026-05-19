import React, { useEffect, useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import * as Yup from 'yup';
import {  Box,Button,Drawer,FormControl,IconButton,InputLabel,MenuItem,Select,TextField,Tooltip,Typography,} from "@mui/material";
import { DataGrid, GridToolbar, GridToolbarContainer } from "@mui/x-data-grid";
import { ErrorMessage, useFormik } from "formik";
import { LoadingButton } from "@mui/lab";
import { Cookies, useCookies } from "react-cookie";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { VendorInvite, getInvitedvendor } from "../../../utils/manageParticipants";
import { Form } from "react-bootstrap";
import MemoizedUploadButton from "../../../utils/common/component";
import { getPayloadWithStage, handleFileUpload, validateEmails } from "../../../utils/common";
import { toast } from "react-toastify";
import { useStateValue } from "../../../store";
import { StageFindAll } from "../../../utils/stagemaster";
import ApprovalBox from '../../BaseCells/ApprovalBox';
import { buildQueryParams } from "../../../utils/common/utility";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import { PushPinOutlined } from "@mui/icons-material";

const InviteVendor = () => {
  const [cookies] = useCookies(["patkn", "prtkn"]);
  const [{ atoken, rtoken,customerid}, dispatch] = useStateValue();
  const [invitedVendorList,setInvitedVendorList]=useState([]);
  // const FetchInvitedSupplier=async ()=>{
  //   let res =await getInvitedvendor(atoken);
    
  //   if(res) setInvitedVendorList(res);
    
    
  // }
    const FetchInvitedSupplier = async () => {
      const obj = {
        CustomerId: customerid,
        //AccessLevel: accessLevel?.list?.readed,
      };
      const queryParams = buildQueryParams(obj);
  
      let res = await getInvitedvendor(queryParams, atoken);
      if (res) setInvitedVendorList(res);
      
    };
  const [stagelist, setStageList] = useState(null);
  useEffect(() => {
    StageFindAll({ "eventType": "QR", "CustomerId":customerid},atoken).then((res)=>{
        
       setStageList(res)
    })
   
  }, []);
  useEffect(() => {
    FetchInvitedSupplier();
  },[]);
  const [requestCell, setRequestCell] = useState({
    EventId: 0,
    EventType: "VI",
    CustomerId: customerid
  });

  const updateRequestCell = (newEventId) => {
    setRequestCell((prevState) => ({
      ...prevState,
      EventId: newEventId,
    }));
  };
    const requestApprover = { 
    EventId:26, 
    EventType:"QR"

  };
  const [currentStage, setCurrentStage] = useState(`Draft`);

    const [stagearray, setStagearray] = useState([`Draft`]);
    const [eventAppList, setEventAppList] = useState([]);
    const [approverInWorkflow, setApproverInWorkflow] = useState([]);
    const [wfupdate, setwfUpdate] = useState([false]);
    // const handleEventAppList = useCallback((arr, updatedvalue) => {
    //   setEventAppList(arr);
    //   setApproverInWorkflow(updatedvalue);
    // }, []);
  const [state, setState] = useState({
    opensidebar: false,
  });
  
  const toggleDrawer = (anchor, open, selectedRow) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  const [loading, setLoading] = useState(false);
  const columns = [
    
    { field: "email", headerName: "Supplier Email", width: 150},
    { field: "createdOn", headerName: "Invitation Date",  width: 150},
    {
      field: "hasRegistered",
      headerName: "Status",
      width: 80,
      renderCell: (params) => (params.formattedValue ? "Registered" : "Unregistered"),
    },
    {
      field: "registrationDate",
      headerName: "Reg. Date",
      width: 150,
      renderCell: (params) =>
        params.formattedValue ? <>{params.formattedValue}</> : "",
    },
    { field: "createdByName", headerName: "Invited By", width: 150 },
    { field: "status", headerName: "Approval status",  width: 150 },
    {
      field: "approvalDate",
      headerName: "Approval Date",
      width: 150
    },
    

  ];
  
  
  const getRowId = (row) => {
    return row.id;
  };



  const [emailList, setEmailList] = useState([])

  const handleAddMoreClick = (value) => {
    
    setEmailList((prevEmails) => [...prevEmails,value]);
  };
  const handleVendorInvite = () => {
    
    const sanitizedData = emailList.map((email) => ({
      email: email,
    }));

    setLoading(true);
     
    let data=sanitizedData.map(obj=> {
      return getPayloadWithStage('currentStage','Invited',stagelist,obj,'currentStage'); 
    });
    
    VendorInvite(data, cookies)
      .then((res) => {
        if (res) {
           setLoading(false);
           setInvitedVendor(res?.invitedVendors);
           setNotInvitedVendor(res?.notInvitedVendors);
           FetchInvitedSupplier();
           clearEmailList();
          
        }
       
       

      })
      .catch((error) => {
        console.error('Vendor invite failed:', error);
        // Handle the error as needed
      });
  };
  
  
  const validationSchema = Yup.object().shape({
    emailInput: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });
  const formik_email = useFormik({
    initialValues: {
      emailInput: '', 
    },
    validationSchema:validationSchema,
    onSubmit: (values) => {
      ;
      const { emailInput } = values;
      if (emailInput) {
        handleAddMoreClick(emailInput);

      } else {
        console.error("Email input is undefined or empty");
      }
    },
  
     
   });


  const handleRemoveClick = (indexToRemove) => {
    removeEmail(indexToRemove);
  }
  
  
  const clearEmailList = () => {
    setEmailList([]);
  };
  
  const removeEmail = (indexToRemove) => {
    const updatedEmailList = emailList.filter((_, index) => index !== indexToRemove);
    setEmailList(updatedEmailList);
  }

  //#1 vendor drawer data grid logics and functionality
  const [invitedVendor,setInvitedVendor]=useState([]);
  const columninvitedvendor=[
    { field: "vendorEmail", headerName: "Invited Supplier", width: 200,
    renderCell: (params) => (params?.row),
  },
  ]
  const [notinvitedVendor,setNotInvitedVendor]=useState([]);
  const columnnotinvitedvendor=[
    { field: "email", headerName: "Not Invited Supplier", width: 200,
    renderCell: (params) => (params?.formattedValue),
  },
  { field: "reason", headerName: "Reason", width: 200,
    renderCell: (params) => (params?.formattedValue),
  },
  ]

  const getInvitedRowId = (row) => {
    
    
    return row;
  }
  const getNotInvitedRowId = (row,index) => {
    
    
    return row?.email;
  }
  const handleInviteVendorUpload =async (file) => {
    // Handle file upload logic here
    
    
    let data = await  handleFileUpload(file);
    const arrayOfEmails = data.map(obj => obj.email);
    const isfileValid =validateEmails(arrayOfEmails);

    if(isfileValid===false){
      toast?.error("please upload file with valid email address", {
       toastId: "validemailPassword"
      });
      return;

    }
    setEmailList(arrayOfEmails);
  };


  const [approvershow, setApprovershow] = useState(true)
   const handleApprover = (booleanvalue) => {
    
     setApprovershow(booleanvalue)
   }
  const [selectedRows, setSelectedRows] = React.useState([]); 
  const [selectedInvoiceRows, setSelectedInvoiceRows] = React.useState([]);
  
  const formik_InvoiceAccepted = useFormik({
    initialValues: {
      emailInput: '', 
    },
    validationSchema:validationSchema,
    onSubmit: (values) => {
      
      const { emailInput } = values;
      if (emailInput) {
      //  handleAddMoreClick(emailInput);

      } else {
        console.error("Email input is undefined or empty");
      }
    },
  
     
   });

    

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-12 p-0 ">
            <div className="d-flex flex-column min-vh-100">
              <div className="d-flex justify-content-between minh50px align-items-center bg-white p-2 border-bottom">
                <div className="page-heading f16">Invite Supplier</div>
                  <div className="d-flex align-items-center">
   <Tooltip title="Show/Hide Approvers">
                        {/* <IconButton
                          onClick={() => handleApprover(!approvershow)}
                          size="small"
                          edge="start"
                          className="pointer"
                        >
                          <div className={` ${approvershow ? 'approver' : 'approverCollapsed'}`}>
                            {!approvershow ? <div className='sideSearch shadow-sm'> Approvers
                            </div> : <PushPinOutlined className='f15 text-primary' />}
  
                          </div>
                        </IconButton> */}
  <IconButton
  onClick={() => setApprovershow(prev => !prev)}
  size="small"
  edge="start"
  className="pointer"
>
  <div className={`${approvershow ? 'approver' : 'approverCollapsed'}`}>
    {!approvershow ? (
      <div className='sideSearch shadow-sm'> Approvers</div>
    ) : (
      <PushPinOutlined className='f15 text-primary' />
    )}
  </div>
</IconButton>

                      </Tooltip>
              
                  <div className="action-wrap">
                    <Button
                      variant="outlined"
                      size="small"
                      className="me-3 rounded-pill"
                      onClick={toggleDrawer("opensidebar", true, [])}
                    >
                      <span className="text-capitalize">Invite Supplier</span>
                    </Button>
                    </div>
                  </div>
                
              </div>
              <div className="flex-grow-1 m-2 bg-white rounded">
                <div className="p-3">
                  <div className="row">
                  <div className=''>
                      <div className='text-end'>
                         <Button
                          variant='text'
                          size='small'
                          // startIcon={<HiPlusSm />}
                          className='text-capitalize font-normal'
                          onClick={toggleDrawer('openInvoiceApproved', true)}
                        >Action</Button>
                         
                      </div>
                    </div>
                    <div className="col-9">
                      <DataGrid
                        getRowId={getRowId}
                        rows={invitedVendorList}
                        columns={columns}
                        autoHeight 
                        checkboxSelection
                        getRowClassName={(params) =>
                          params.indexRelativeToCurrentPage % 2 === 0
                            ? "even"
                            : "odd"
                        }
                        rowHeight={40}
                        columnHeaderHeight={40}
                        className="f13 border-0"
                        disableRowSelectionOnClick 
                        onRowSelectionModelChange={(ids) => {
                          //console.log('ids', ids)
                          const selectedIDs = new Set(ids);
                          //console.log('rows', allPOItems)
                          const selectedInvoiceRows = invitedVendorList?.filter((row) =>
                            selectedIDs.has(row.id),
                          );
                          setSelectedInvoiceRows(selectedInvoiceRows);
                        }}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                              toolbar: {
                                showQuickFilter: true,
                              },
                        }}
                      />
                    </div>
                   {/* {approvershow && (
                               <div className="col-12 col-md-5 col-lg-3 border-start p-0">
                                 <div className="d-flex flex-column min-vh-100">
                                   <div className="flex-grow-1">
                                     <div className="row">
                                       <div className="col-12"></div>
                                     </div>
                                     <div className="row">
                                       <div className="col-12 custom-fix">
                                         <EventApprovalBox
                                           requestCell={requestCell}
                                          // handleEventAppList={handleEventAppList}
                                           wfupdate={wfupdate}
                                           action={stagearray.includes(currentStage)}
                                           stagelist={stagelist}
                                         />
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             )} */}
                    <div className='col-3'>   
                        <ApprovalBox requestApprover={requestApprover} />
                  
                      </div>
                
                  </div>
                </div>
              </div>
            </div>
            </div> 
        </div>
        <></>
      </div>
      <React.Fragment key="top">
        <Drawer
          anchor="right"
          open={state["opensidebar"]}
          onClose={toggleDrawer("opensidebar", false, [])}
        >
                         <form
              onSubmit={formik_email.handleSubmit}
              //ref={formRef}
              autoComplete="off"
            >

          <Box sx={{ width: { xs: 280, sm: 480, md: 480 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Invite Supplier</div>
                  <div>
                    <IconButton
                      onClick={toggleDrawer("opensidebar", false,[])}
                      size="small"
                      edge="start"
                      sx={{ mr: 1 }}
                    >
                      <HiOutlineX className="f20 text-white" />
                    </IconButton>
                  </div>
                </div>
              </Box>
              <div className="h50px"></div>
              <Box sx={{ flexGrow: 1 }}>
                <div className="p-3">
                  <div className="row align-items-center">
                        <div className="col-12 col-md-9 col-lg-9"></div>
                         
                       
                        <div className="col-12 col-md-3 col-lg-3" >
                        <MemoizedUploadButton onUpload={handleInviteVendorUpload} />
                        </div>
                  </div></div></Box>
              <Box sx={{ flexGrow: 1 }}>
                <div className="p-3">
                  <div className="row align-items-center mt-2">
                 
                     
                    <div className="col-12 col-md-9 col-lg-9">
                  
                      <TextFieldCell
                        id="emailInput"
                        name="emailInput"
                        label="Email Id"
                        value={formik_email?.emailInput}
                        type="text" 
                        onChange={(e)=>formik_email.setFieldValue('emailInput',e.target.value)}
                      />
                      {formik_email?.touched?.emailInput &&
                          formik_email?.errors?.emailInput ? (
                            <div style={{ color: "red" }}>
                              {formik_email.errors.emailInput}
                            </div>
                          ) : null}
                    </div>
                    <div className="col-12 col-md-3 col-lg-3 text-end text-md-start">
                      <Button
                        variant="text"
                        size="medium"
                        color="primary"
                        className="text-capitalize mt-2 mt-md-0"
                       type='submit'
                      >
                        + Add More
                      </Button>
                    </div>
                  </div>
                  <hr className="" />
                  <div className="">
                    <div className="row">
                      <div className="col-12 mb-3 d-none d-lg-block">
                        <div className="row align-items-center p-2 rounded ms-0 me-0 mt-2 bggray">
                          <div className="col-12 col-md-11 f14">
                            <div className="">
                              <div className="row text-left">
                                <div className="col-3 col-md-2">
                                  <div className="text-muted lingh14">
                                    S No.
                                  </div>
                                </div>
                                <div className="col-9 col-md-10">
                                  <div className="text-muted lingh14">
                                    Email ID
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex col-12 col-md-1 align-items-center text-end">
                            <div className="f14">
                              <div className="text-muted f14 lingh14"></div>
                            </div>
                          </div>
                        </div>
                        <div>
                          {emailList?.map((email, index) => (
                            <div className="row align-items-center p-0 pb-1 f14 border-bottom ms-0 me-0 mt-2 bg-white">
                              <div className="col-10 col-md-11">
                                <div className="">
                                  <div className="row text-left">
                                    <div className="col-3 col-md-2">
                                      <div className="text-muted lingh14">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <div className="col-9 col-md-10">
                                      <div className="text-muted lingh14">
                                        {email}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex col-2 col-md-1 align-items-center justify-content-end text-end">
                                <IconButton size="medium" className="bg-white" onClick={() => handleRemoveClick(index)}>
                                  <HiOutlineX className="f16 text-danger" />
                                </IconButton>
                              </div>
                            </div>
                          ))}
                        </div>
                        <hr />
                        <div className="row">
                          <div className="col-12 text-end">
                          <Button
  color="primary"
  variant="contained"
  size="small"
  className="text-capitalize"
  onClick={() => {
    setLoading(true); // Set loading to true before initiating the action
    // Your logic for handling the invite vendor action, e.g., calling handleVendorInvite
    handleVendorInvite();
   // clearEmailList();
    // Optionally, you can set loading back to false after the action is complete
     setLoading(false);
  }}
>
  {!loading ? (
    <span>Send Invite</span>
  ) : (
    <span>Sending Invite...</span>
  )}
</Button>

                           {invitedVendor.length>0 &&
                               <div className="row align-items-center p-0 pb-1 f14 border-bottom ms-0 me-0 mt-2 bg-white">
                                  <DataGrid getRowId={getInvitedRowId} rows={invitedVendor} columns={columninvitedvendor} 
                                    
                                   className='f13 border-0' density="compact"
                               

                                   />
                              
                             </div>

                           }
                            {notinvitedVendor.length>0 &&
                               <div className="row align-items-center p-0 pb-1 f14 border-bottom ms-0 me-0 mt-2 bg-white">
                                  <DataGrid getRowId={getNotInvitedRowId} rows={notinvitedVendor} columns={columnnotinvitedvendor}
                                className='f13 border-0' density="compact"
                               
                                />
                              
                             </div>

                           }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
            </div>
          </Box></form>
        </Drawer>
      </React.Fragment>
    
    
      <React.Fragment key="top5">
        <Drawer
          anchor="right"
          open={state["openInvoiceApproved"]} 
        >
          <form
           onSubmit={formik_InvoiceAccepted.handleSubmit}
          autoComplete="off"
        >
          <Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Invited Supplier Approve</div>
                  <div>
                    <IconButton
                      onClick={toggleDrawer("openInvoiceApproved", false,[])}
                      size="small"
                      edge="start"
                      sx={{ mr: 1 }}
                    >
                      <HiOutlineX className="f20 text-white" />
                    </IconButton>
                  </div>
                </div>
              </Box>
              <div className="h50px"></div>
              <div className="p-3">
                <div className="row ">
                  <div className="col-12 col-md-12 col-lg-12">
                    <div className="mb-4 textblue f14">
                       
                    </div>                                  
                    <div className="row">
                      
                      <div className="col-12 col-md-4 col-lg-12 mb-4">
                      <TextField
                        id="status"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        name="status"
                        select
                        className='mb-2'
                        fullWidth
                        size="small"
                        label="Approver Status"
                        variant="outlined"
                        value={formik_InvoiceAccepted.values.status}
                        onChange={formik_InvoiceAccepted.handleChange}
                      >     
                          <MenuItem value='Approved'>Approve</MenuItem> 
                          <MenuItem value='Rejected'>Revert</MenuItem> 
                          
                      </TextField> 

                      </div> 
                      
                      <div className="col-12 col-md-4 col-lg-12 mb-4">

                          <TextField
                              id="approveComment"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              name="approveComment"
                              className="w-100 f14"
                              size="small"
                              label="Comment "
                              variant="outlined"
                              value={formik_InvoiceAccepted?.Values?.approveComment} 
                              onChange={formik_InvoiceAccepted.handleChange}
                            /> 
                          </div> 
                          
                    </div>
 
                    <hr className="mt-0" /> 
                  </div>
                </div>
                <div className="row">
                <div className="col-12 text-end">
                  <LoadingButton
                    // loading={loadingBids}
                    color="primary"
                    size="medium"
                    className="text-white text-capitalize mb-3 mr-3"
                    variant="contained"
                    type="submit"
                  >
                    <span>Save</span>
                  </LoadingButton>
                  {/* Add margin-bottom to create a gap */}
                  
                </div>
              </div>
              </div>
            </div>
          </Box>
          </form>
        </Drawer>
      </React.Fragment> 


    </>
  );
};

export default InviteVendor;
