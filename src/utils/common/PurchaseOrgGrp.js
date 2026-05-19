import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Autocomplete, IconButton,
  InputAdornment,
  Typography
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import { Cookies, useCookies } from "react-cookie";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as yup from "yup";
import { useFormik } from "formik";
import { HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { actionTypes, useStateValue } from "../../store";
import NoRecordCell from "../../components/NoRecordCell";
import {
  AddPurcOrgGrp,

  OrgGroupMasterList,
  UpdatePurchOrgGrp,
  getPurchaseOrgList,
} from "./utility";
import PurchaseOrgGrpResultCell from "../../pages/Settings/ManageWorkflows/PurchaseOrgGrpResultCell";
import { getPurchaseOrg } from "../workflow";
import { editingStateInitializer } from "@mui/x-data-grid/internals";
import { BackButton } from "./component";
import { toast } from "react-toastify";

const PurchaseOrgGrp = (props) => {
  const { isModal, selectedOrgMstId, selectedPurOrggrp } = props;
  const [cookies] = useCookies(["patkn", "prtkn"]);
  const [groupName, setgroupName] = useState("");
  const [externalSourceCode, setexternalSourceCode] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
  const [editRecordData, seteditRecordData] = useState(null);
  // const [orgMstId,setorgMstId] = useState(0);
  const [orgMstId, setorgMstId] = useState();
  // const [orgMstId, setorgMstId] = useState(
  //   editRecordData?.orgMstId ? editRecordData?.orgMstId : 0
  // );
  const [totalRecords, setTotalRecords] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);

  const handleChange = (event, value) => {
    ;
    setPage(value);
  };

  useEffect(() => {
    if (selectedOrgMstId) {
      // Call the function to get groups based on the selected organization ID
      selectedPurOrggrp(selectedOrgMstId);  // This triggers the data fetch for the selected orgMstId
    }
  }, [selectedOrgMstId, selectedPurOrggrp]);
  const [purchname, setPurchName] = useState();
  const onchangePurchOrg = (e, newValue) => {

    const selectedorgid = e?.target?.value;
    setorgMstId(selectedorgid)
    // Ensure newValue is not null before accessing its properties
    if (newValue) {
      console.log('newValue:', newValue);
      setorgMstId(newValue.id);
      console.log('orgMstId:', orgMstId);
      setOrgName(newValue.orgName);
      // Assuming you have access to the purchaseAllList array containing org data

    }
  };

  const [state, setState] = useState({
    right: false,
    viewTicketSidebar: false,
    rightLog: false,
  });

  useEffect(() => {
    // ;
    if (editRecordData && editRecordData?.id > 0) {
      prefilledDocument();
    }
  }, [editRecordData, purchaseAllList]);

  useEffect(() => {
    PullPurchaseOrgAll();
    pullOrgGrpList();
  }, [page]);
  const [previousIsActive, setPreviousIsActive] = useState(isActive);

  const initialValues = {
    id: editRecordData?.id ? `${editRecordData?.id}` : 0,
    // customerid: customerid,
    orgMstId: editRecordData?.orgMstId
      ? `${editRecordData?.orgMstId}`
      : orgMstId,
    groupName: editRecordData?.groupName
      ? `${editRecordData?.groupName}`
      : groupName,
    externalSourceCode: editRecordData?.externalSourceCode ? editRecordData?.externalSourceCode : "",
    isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
    address: editRecordData?.address ? editRecordData?.address : address,

  };

  const onSubmit = (values) => {
    if (!values.orgMstId) {
      toast.error(`Please select an organization`, {
        position: toast.POSITION.TOP_CENTER,
      });

      setLoading(false);
      return false;
    }
    var data = {
      id: editRecordData?.id ? editRecordData?.id : 0,
      // CustomerId:customerid,
      orgMstId: orgMstId,
      orgName: orgName,
      groupName: groupName,
      externalSourceCode: externalSourceCode,
      isActive: isActive,
      address: address,

    };
    setLoading(true);

    // api call to save data
    if (editRecordData?.id > 0) {
      UpdatePurchOrgGrp(data, atoken, editRecordData?.id).then((res) => {

        setLoading(false);
        pullOrgGrpList();
        if (props.selectedPurOrggrp) {
          props.selectedPurOrggrp(orgMstId); // Pass orgMstId to refresh parent list
        }
        dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
        dispatch({
          type: actionTypes.SET_MSGALERTDATA,
          value: res?.data?.message,
        });
        dispatch({ type: actionTypes.SET_MSGALERT, value: true });
        clearfilledDocument();
        toast.success("Group updated successfully.", {
          toastId: "GroupUpdateSuccess",
        });

        return true;
      });
    } else {

      AddPurcOrgGrp(data, atoken).then((res) => {

        setLoading(false);
      

        pullOrgGrpList();
   // Now call handleAddNewGroup prop to update the group list in the parent
  
  if (props.selectedPurOrggrp) {
    props.selectedPurOrggrp(orgMstId); // Pass orgMstId to refresh parent list
  }
        dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
        dispatch({
          type: actionTypes.SET_MSGALERTDATA,
          value: res?.data?.message,
        });
        dispatch({ type: actionTypes.SET_MSGALERT, value: true });

        console.log("save", res);
        clearfilledDocument();
        toast.success("Group added successfully.", {
          toastId: "GroupAddSuccess",

        });
        return true;
      });
    }
  };

  const validationSchema = yup.object({
    orgMstId: yup.string().required("Please Select organization "),
    groupName: yup.string().required("Please Enter Group Name"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validationSchema,
  });
  const resetDocument = () => {
    //;
    seteditRecordData([]);
    setorgMstId(0);
    setgroupName("");
    setexternalSourceCode("");
    setIsActive(true);
    setAddress("");
  };

  const clearfilledDocument = () => {
    seteditRecordData([]);
    formik.setFieldValue("id", 0);
    setorgMstId(0);
    setgroupName("");
    setexternalSourceCode("");
    setIsActive(true);
    setAddress("");
  };

  const [orgGrpList, setOrgGrpList] = useState([]);
  const pullOrgGrpList = (orgMstId) => {
    var data = {
      CustomerId: customerid,
      SortingColumn: "Id",
      orgMstId: orgMstId

    };
    setLoading(true);
    OrgGroupMasterList(data, atoken).then((res) => {
      setGridloading(true)
      console.log(res);
      if (res != "" && res != undefined) {
        setOrgGrpList(res);
        let records =
          res[0]?.totalrecords != undefined ? res[0]?.totalrecords : 10;
        setTotalRecords(records);
        setPageCount(Math.ceil(records / 10));
      }
      setLoading(false);
      setGridloading(false)
    });
  };

  const callbackedit = useCallback((data) => {

    setorgMstId(data?.orgMstId);
    setgroupName(data?.groupName);
    setIsActive(data?.isActive);
    setAddress(data?.address || "");
    seteditRecordData(data);
    
    // Set organization name from the row data or find it in purchaseAllList
    if (data?.orgName) {
      setOrgName(data.orgName);
    } else if (purchaseAllList.length > 0 && data?.orgMstId) {
      const selectedOrg = purchaseAllList.find(option => option.id === data?.orgMstId);
      if (selectedOrg) {
        setOrgName(selectedOrg.orgName);
      }
    }
    
    setState({ ...state, addnewfield: true });
  }, [purchaseAllList]);

  const PullPurchaseOrgAll = (orgMstId) => {
    var data = {
      CustomerId: customerid,
      orgMstId: orgMstId,
      IsActive: 'true'
    };
    getPurchaseOrgList(data, atoken).then((resp) => {
      console.log(resp);

      setPurchaseAllList(resp);
    });
  };
  const prefilledDocument = () => {
    formik.setFieldValue("id", editRecordData?.id);
    setorgMstId(editRecordData?.orgMstId);
    setgroupName(editRecordData?.groupName);
    setexternalSourceCode(editRecordData?.externalSourceCode);
    setIsActive(editRecordData?.isActive);
    setAddress(editRecordData?.address ? editRecordData?.address : "");
    
    // Set organization name if purchaseAllList is loaded
    if (purchaseAllList.length > 0 && editRecordData?.orgMstId) {
      const selectedOrg = purchaseAllList.find(option => option.id === editRecordData?.orgMstId);
      if (selectedOrg) {
        setOrgName(selectedOrg.orgName);
      }
    } else if (editRecordData?.orgName) {
      // Fallback to the orgName from editRecordData if available
      setOrgName(editRecordData.orgName);
    }
  };

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "orgName",
      headerName: "Organization ",
      width: 280,
    },
    {
      field: "groupName",
      headerName: "Group Name ",
      width: 280,
    },

    {
      field: "isActive",
      headerName: "Status",
      width: 280,
      renderCell: (params) => (
        params.formattedValue ? "Active" : "InActive"

      )
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          className="bg-white"
          onClick={() => callbackedit(params?.row)}
        >
          <HiPencilAlt className="f17 text-primary" />
        </IconButton>

      )
    }

  ];
  const getRowId = (row) => {
    //console.log('getrowid', row.id)
    return row.id;
  }

  const getOrganisationDefault = (orgMstId) => {
    if (orgMstId && orgMstId > 0 && purchaseAllList.length > 0) {
      const selectedOrganization = purchaseAllList.find((data) => data.id === orgMstId);
      return selectedOrganization || null;
    }
    return null;
  };
  const handleStatusChange = (e) => {
    
    const newIsActive = e?.target?.value;
  
    if (previousIsActive === true && newIsActive === false) {
      // Show a toast message when switching from Active to Inactive
      toast.warning(
        "Please note: Deactivating this Purchase Group may impact its associated Purchase Organization, which could currently be active or in use. Kindly verify dependencies before proceeding.",
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000, 
        }
      );
    }
  
    // Update the state with the new value
    setIsActive(newIsActive);
    setPreviousIsActive(newIsActive); // Update the previous state value
  };
  
  return (
    <>
      <div className={`bg-white rounded-default shadow-sm w-100 d-flex flex-column ${!props.isModal ? 'p-3 vh-calc-120' : 'p-0'}`} style={!props.isModal ? { height: 'calc(100vh - 120px)' } : {}}>
        {/* Header with BackButton */}
        {!props.isModal && (
          <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
            <div className="d-flex align-items-center">
              <BackButton title={<span className="page-heading">Purchase Group</span>} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={props.isModal ? '' : 'flex-grow-1 overflow-auto'}>
          <div className={`${props.isModal ? 'p-0' : 'p-3 pt-0'}`}>
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              formik.handleSubmit(e);
            }} autoComplete="off" className="p-0">
              <div className="row panelbox align-items-center">
              <div className="col-12 col-md-4 mt-0">
               
                <Autocomplete
                  id="orgMstId"
                  name="orgMstId"
                  className="f14"
                  sx={{ width: "100%" }}
                  options={purchaseAllList}

                  value={getOrganisationDefault(orgMstId)}
                  onChange={(event, newvalue) => { onchangePurchOrg(event, newvalue) }}
                  getOptionLabel={(option) => option.orgName}

                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      {option.orgName}
                    </Box>
                  )}
                  renderInput={(params, data) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size='small'
                      placeholder=""
                      label="Organization name *"

                    />
                  )}
                />
                {formik.errors.orgMstId && formik.touched.orgMstId && (
                  <div className="error error-red" style={{ fontSize: '9px' }}>{formik.errors.orgMstId}</div>
                )}


              </div>

              <div className="col-12  col-md-3 focus">
                <FormControl fullWidth>
                  <TextField
                    id="groupName"
                    name="groupName"
                    label="Organization Group Name *"
                    placeholder=""
                    variant="outlined"
                    size="small"
                    value={groupName}
                    onChange={(e) => {
                      setgroupName(e?.target?.value);
                    }}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      endAdornment: groupName && (
                        <InputAdornment position="end">
                          <Typography
                            variant="body2"
                            color="textSecondary"
                          >
                            {
                              groupName?.length
                            }
                            /100
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {formik.errors.groupName && formik.touched.groupName && (
                    <div className="error error-red" style={{ fontSize: '9px' }}>{formik.errors.groupName}</div>
                  )}
                </FormControl>
              </div>
              <div className="col-12 col-md-4 mt-0">
                <FormControl fullWidth>
                  <TextField
                    id="groupAddress"
                    name="groupAddress"
                    label="Address"
                    placeholder=""
                    variant="outlined"
                    size="small"
                    value={address}
                    onChange={(e) => setAddress(e?.target?.value)}
                    inputProps={{ maxLength: 200 }}
                    InputProps={{
                      endAdornment: address && (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="textSecondary">
                            {address?.length}/200
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
              </div>
              <div className="col-12 col-md-2 mt-3">
              <FormControl className="form-control" fullWidth>
  <InputLabel id="Status">Status</InputLabel>
  <Select
    labelId="Status"
    InputLabelProps={{
      shrink: true,
    }}
    variant="outlined"
    size="small"
    id="isActive"
    name="isActive"
    value={isActive}
    defaultValue={isActive}
    label="Status"
    onChange={handleStatusChange} // Use the updated handler
  >
    <MenuItem value={true}>Active</MenuItem>
    <MenuItem value={false}>InActive</MenuItem>
  </Select>
</FormControl>

                {/* <FormControl className="form-control" fullWidth>
                  <InputLabel id="Status">Status</InputLabel>
                  <Select
                    labelId="Status"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    size="small"
                    id="isActive"
                    name="isActive"
                    value={isActive}
                    defaultValue={isActive}
                    label="Status"
                    onChange={(e) => {
                      //;
                      setIsActive(e?.target?.value);
                    }}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>InActive</MenuItem>
                  </Select>
                </FormControl> */}
              </div>
<div className="col-12 col-md-3 d-flex align-items-center justify-content-start gap-2 mt-3">
  {!loading ? (
    <>
      <Button
        color="primary"
        variant="contained"
        size="medium"
        onClick={(e) => {
          e.stopPropagation();
          resetDocument();
        }}
      >
        Reset
      </Button>

      <Button
        color="primary"
        variant="outlined"
        size="medium"
        type="submit"
        onClick={(e) => e.stopPropagation()}
      >
        Submit
      </Button>
    </>
  ) : (
    <LoadingButton loading variant="contained">
      Submit ...
    </LoadingButton>
  )}
</div>

             
            </div>
            
            </form>

            {/* <div className="section-heading mb-3 mt-4">Purchase Group List</div> */}
            <div style={{ height: props.isModal ? '350px' : '300px', width: '100%', marginTop: props.isModal ? '20px' : '0' }}>
              <DataGrid
                getRowId={getRowId}
                rows={orgGrpList}
                loading={gridloading}
                columns={columns}
                disableDensitySelector
                disableColumnMenu
                disableColumnSelector
                rowHeight={35}
                columnHeaderHeight={35}
                className='f13 bg-white data-grid-scrollable'
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                }
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseOrgGrp;
