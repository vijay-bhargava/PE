import React, { useState, useEffect } from "react";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    IconButton,
    Select,
    InputAdornment,
    Typography,
    TextField,
    Box,
    Autocomplete,
} from "@mui/material";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import { useCookies } from "react-cookie";
import CryptoJS from 'crypto-js';
import * as yup from "yup";
import { useFormik } from "formik";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { actionTypes, useStateValue } from "../../../store";
import { HiOutlineX, HiPencilAlt} from "react-icons/hi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { findObjByValueFromArray, isTokenExpired, getApiErrorMessage } from "../../../utils/common";
import { ApiClient } from "../../../Apiclient";
import TextFieldCell from "../../BaseCells/TextFieldCell";
// import { getPurchaseOrgList, OrgGroupMasterList } from "../../../utils/common/utility";
import { Modal } from "react-bootstrap";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import { getPurchaseOrgList, OrgGroupMasterList } from "../../../utils/commerciallibrary";

const AddUpdateSpend = (props) => {
    
    const [loading, setLoading] = useState(false);
    const [{ atoken, rtoken, customerid ,customersuffix}, dispatch] = useStateValue();
    const [pendingEditData, setPendingEditData] = useState(null);
  const apiClient = new ApiClient(customersuffix);
    const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
  
   const updateToken = async () => {    
        
      const res= await isTokenExpired(atoken,rtoken,customerid);      
      if (res) {
        if (res?.accessToken != '') {
                        dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
                        var userAccessToken = CryptoJS.AES.encrypt(`${res.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        setCookie("patkn", userAccessToken, { path: '/', maxAge: 86400 });
                    }
                    if (res?.refreshToken != '') {
                        dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
                        var userRefreshToken = CryptoJS.AES.encrypt(`${res.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                        setCookie("prtkn", userRefreshToken, { path: '/', maxAge: 86400 });
        }
       return true
    }   
      else {
        return false;
    }
    }
    const [spend, setspend] = useState("");
    const [isActive, setIsactive] = useState(true);
const [purchOrgId, setPurchOrgId] = useState(0);

const [purchGrpId, setpurchGrpId] = useState(0);
    const [purchaseAllList, setPurchaseAllList] = useState([]);
    const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
    const [editRecordData, seteditRecordData] = useState(null);

 
    const [state, setState] = useState({
        right: false,
        viewTicketSidebar: false,
        rightLog: false,
    });


     useEffect(() => {
            if (editRecordData && editRecordData?.id > 0) {
                prefilledDocument();
                if (editRecordData.purchOrgId) {
                    setOrgId(editRecordData.purchOrgId);
                }
                if (editRecordData.purchGrpId) {
                    setOrgGroupId(editRecordData.purchGrpId);
                }
            }
        }, [editRecordData]);
    const [OrgId, setOrgId] = useState(0);
    const [OrgGroupId, setOrgGroupId] = useState(0);

    useEffect(() => {
        pullNFAspend();
        PullPurchaseOrgAll();
        //PullPurchaseGroupAll();
    }, []);
  
   const initialValues = {
        id: editRecordData?.id ? Number(editRecordData.id) : 0,
        customerId: customerid,
        spend: editRecordData?.spend ? String(editRecordData.spend) : "",
        purchGrpId: null,
        purchOrgId: null,
        isActive: Boolean(editRecordData?.isActive ?? true)
    };

    const onSubmit = async (values) => {
  try {
      // Validate spend value
      const trimmedSpend = spend?.trim();
      if (!trimmedSpend) {
        toast.error("Spend value is required");
        setLoading(false);
        return;
      }

      var data = {
        id: editRecordData?.id ? editRecordData?.id : 0,
        customerId: customerid,
        spend: trimmedSpend,
        purchOrgId: values.purchOrgId?.id || 0,
        purchGrpId: values.purchGrpId?.id || 0,
        isActive: isActive,
      };    setLoading(true);

    if (!data.spend) {
      toast.error("Spend value is required");
      setLoading(false);
      return;
    }

    // Check for token expiry
    await updateToken();

    // Call appropriate API endpoint
    const endpoint = editRecordData?.id > 0 ? '/api/NFASpend/Update' : '/api/NFASpend/Add';
    const res = await apiClient.post(endpoint, data, atoken);

    if (res) {
      // Refresh data
      await pullNFAspend();
      
      // Clear form and show success message
      clearfilledDocument();
      toast.success(
        editRecordData?.id > 0 
          ? "Spend updated successfully!" 
          : "Spend added successfully!",
        { toastId: editRecordData?.id > 0 ? "SpendUpdate" : "SpendAdd" }
      );
    }
  } catch (error) {
    console.error('Error submitting spend:', error);
    toast.error(error.message || 'Error saving spend');
  } finally {
    setLoading(false);
  }
};
   const validationSchema = yup.object({
        spend: yup.string().required("Please Enter  spend"),
    });
       const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        onSubmit,
        validationSchema,
    });

    useEffect(() => {
  // Run only when editing AND purchase org list has loaded
  if (editRecordData && purchaseAllList.length > 0) {
    const record = Array.isArray(editRecordData)
      ? editRecordData[0]
      : editRecordData;

    // Find the matching org from the list
    const selectedOrg = purchaseAllList.find(
      (item) => item.id === record.purchOrgId
    );

    if (selectedOrg) {
      formik.setFieldValue("purchOrgId", selectedOrg);
      setOrgId(selectedOrg.id);

      // Load purchase groups for this org
      PullPurchaseGroupAll(selectedOrg.id);
    }

    setspend(record?.spend || "");
    setIsactive(record?.isActive ?? true);
  }
}, [editRecordData, purchaseAllList]);

    useEffect(() => {
  if (pendingEditData && purchaseAllList.length > 0) {
    const record = Array.isArray(pendingEditData) ? pendingEditData[0] : pendingEditData;
    const selectedOrg = purchaseAllList.find(item => item.id === record.purchOrgId);
    formik.setFieldValue("purchOrgId", selectedOrg || null);
    setspend(record?.spend);
    setIsactive(record?.isActive);

    if (record.purchOrgId > 0) {
      setOrgId(record.purchOrgId);
      // Load purchase groups for this org
      PullPurchaseGroupAll(record.purchOrgId);
    }

    seteditRecordData(pendingEditData);
    setPendingEditData(null);
  }
}, [pendingEditData, purchaseAllList]);

    useEffect(() => {
        // Handle purchase group selection when groups are loaded
        if (purchaseGroupAllList.length > 0 && editRecordData) {
            const record = Array.isArray(editRecordData) ? editRecordData[0] : editRecordData;
            if (record?.purchGrpId > 0) {
                const selectedGrp = purchaseGroupAllList.find(item => item.id === record.purchGrpId);
                if (selectedGrp) {
                    formik.setFieldValue("purchGrpId", selectedGrp);
                }
            }
        }
    }, [editRecordData, purchaseGroupAllList]);

    //to update purchGrpId

const handleEdit = useCallback((data) => {
  clearfilledDocument(); // Clear form before setting new data
  const record = Array.isArray(data) ? data[0] : data;
  
  setspend(record?.spend);
  setIsactive(record?.isActive);
  
  // Find the selected Purchase Org
  const selectedOrg = purchaseAllList.find(item => item.id === record.purchOrgId);
  if (selectedOrg) {
    formik.setFieldValue("purchOrgId", selectedOrg);
    // Load Purchase Groups for this org
    PullPurchaseGroupAll(selectedOrg.id);
  }
  
  setPendingEditData(record);
  setState({ ...state, addnewfield: true });
}, [purchaseAllList]);
    const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
    const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
    const ClosePurcgaseOrgGrpModal = () => setPurchaseOrgGrpModal(false);
    const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);

    useEffect(() => {

        if (purchaseGroupAllList && purchaseGroupAllList.length > 0 && OrgGroupId) {
            const updatedvalue = findObjByValueFromArray(purchaseGroupAllList, OrgGroupId, 'id')
            //console.log(purchaseGroupAllList,OrgGroupId,updatedvalue)
            formik.setFieldValue("purchGrpId", updatedvalue);
        }
      

    }, [OrgGroupId, purchaseGroupAllList])
    const PullPurchaseOrgAll = () => {
        var data = {
            CustomerId: customerid,
            IsActive: "true"
        };
        getPurchaseOrgList(data, atoken).then((resp) => {

            setPurchaseAllList(resp ?? []);
        });
    };
    const PullPurchaseGroupAll = (orgMstId) => {
    // Ensure we have a valid orgMstId
    if (!orgMstId) return;
    
    // Convert orgMstId to number and validate
    const numericOrgMstId = Number(orgMstId);
    if (isNaN(numericOrgMstId)) return;
    
    const data = {
        CustomerId: customerid,
        OrgMstId: numericOrgMstId // Use the numeric value
    };
    
    OrgGroupMasterList(data, atoken).then((res) => {
        
        if (res && res!== "") {
            setPurchaseGroupAllList(res);
        }
    });
};


        const handlepurchaseorgList = (array) => {
		setPurchaseAllList(array);
	};
 
      useEffect(() => {
  if (OrgGroupId && purchaseGroupAllList.length > 0) {
    const selectedGrp = purchaseGroupAllList.find(item => item.id === OrgGroupId);
    formik.setFieldValue("purchGrpId", selectedGrp || null);
  }
}, [OrgGroupId, purchaseGroupAllList]);


 

 

    console.log("form values: ", formik.errors);

    const prefilledDocument = () => {
        formik.setFieldValue("id", editRecordData?.id);
        setspend(editRecordData?.spend);
        setIsactive(editRecordData?.isActive);
    };

    const clearfilledDocument = () => {
        // Reset form state
        formik.resetForm();
        
        // Reset all state variables
        setspend("");
        setPurchOrgId(0);
        setpurchGrpId(0);
        setOrgId(0);
        setOrgGroupId(0);
        setPurchaseGroupAllList([]);
        seteditRecordData(null);
        
        // Reset form values
        formik.setValues({
            id: 0,
            customerId: customerid,
            spend: "",
            purchGrpId: null,
            purchOrgId: null,
            isActive: true
        });
    };

    const [spendList, setspendList] = useState([]);
   
    const pullNFAspend = async () => {
        try {
            const isTokenExpired = await updateToken();
            const res = await apiClient.get(
                `/api/NFASpend/Find?CustomerId=${customerid}`,
                atoken
            );
            if (res) {
                const spendData = res?.result;
                setspendList(spendData);
                if (props.handleSpendList) {
                    props.handleSpendList(spendData);
                }
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error), { toastId: "spend_fetch_error" });
        } finally {
            setGridloading(false);
        }
    };
    


    const callbackedit = useCallback((data) => {
        ;
        const record = Array.isArray(data) ? data[0] : data;
        
        // First, set the edit record data
        seteditRecordData(record);
        
        // Set basic fields
        setspend(record?.spend);
        setIsactive(record?.isActive);
        
        // Set IDs for organization and group
        if (record?.purchOrgId > 0) {
            const selectedOrg = purchaseAllList.find(item => item.id === record.purchOrgId);
            if (selectedOrg) {
                // Set organization
                formik.setFieldValue("purchOrgId", selectedOrg);
                // Load purchase groups for this org
                PullPurchaseGroupAll(record.purchOrgId);
                
                // Set the IDs for reference
                setOrgId(record.purchOrgId);
                if (record.purchGrpId > 0) {
                    setOrgGroupId(record.purchGrpId);
                }
            }
        }

        setState({ ...state, addnewfield: true });
    }, [formik, purchaseAllList, PullPurchaseGroupAll]);

 
   

  
    const [gridloading, setGridloading] = useState(true);
    const columns = [
        {
            field: "spend",
            headerName: "Spend",
            width: 150,
        },

        {
            field: "isActive",
            headerName: "Status",
            width: 150,
            renderCell: (params) => (params.formattedValue ? "Active" : "InActive"),
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
            ),
        },
    ];
    const getRowId = (row) => {
        return row.id;
    };

    return (
        <>
            <div className="d-flex flex-row">
                <form
                    onSubmit={formik.handleSubmit}
                    autoComplete="off"
                    className="col-12 col-md-8 col-lg-4 p-0"
                >
                    <div className="d-flex flex-column min-vh-50">
                        <div className="col-12 mb-4 focus">
                            <FormControl fullWidth className="form-control">
                                <TextFieldCell
                                    id="spend"
                                    name="spend"
                                    label="Spend *"
                                    placeholder="Enter spend name"
                                    value={spend}
                                    onChange={(e) => {
                                        const value = e?.target?.value;
                                        setspend(value);
                                        formik.setFieldValue('spend', value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    maxLength={50}
                                    error={formik.touched.spend && Boolean(formik.errors.spend)}
                                    helperText={formik.touched.spend && formik.errors.spend}
                                    InputProps={{
                                        endAdornment: spend && (
                                          <InputAdornment position="end">
                                            <Typography variant="body2" color="textSecondary">
                                              {spend?.length}/50
                                            </Typography>
                                          </InputAdornment>
                                        ),
                                      }}
                                />
                                {formik.errors.spend &&
                                    formik.touched.spend && (
                                        <div
                                            className="error error-red"
                                            style={{ fontSize: "9px" }}
                                        >
                                            {formik.errors.spend}
                                        </div>
                                    )}
                            </FormControl>
                        </div>

                                                                                               <div className="col-12 col-md-12 col-lg-12 mb-4">
                                                                                                {/* <Autocomplete
                                                                                                    id="purchOrgId"
                                                                                                    name="purchOrgId"
                                                                                                    size="small"
                                                                                                    className="w-100 f14"
                                                                                                    sx={{ width: "100%" }}
                                                                                                    options={[
                                                                                                        ...purchaseAllList,
                                                                                                        { id: "new", orgName: "Add New" },
                                                                                                    ]}
                                                                                                    value={formik.values.purchOrgId}
                                                                                                    getOptionLabel={(option) => option.orgName ?? ""}
                                                                                                    // onChange={(e, value) => {
                                                                                                    //     PullPurchaseGroupAll(formik.values.purchOrgId)
                                                                                                    //     if (value?.id === "new") {
                                                                                                    //        // setPurchaseOrgModal(true);
                                                                                                           
                                                                                                         
                                                                                                    //         formik.setFieldValue("purchGrpId", null);
                                                                                                    //         return
                                                                                                    //     }
                                                                                                    //     formik.setFieldValue(
                                                                                                    //         "purchOrgId",
                                                                                                    //         value
                                                                                                    //     );
                                                                                                    
                                                                                                    //     formik.setFieldValue("purchGrpId", null);
                                                                                                    //     setPurchaseGroupAllList([]);
                                                                                                    // }}
                                                                                                onChange={(e, value) => {
  if (value?.id === "new") {
    setPurchaseOrgModal(true);
    return;
  }

  formik.setFieldValue("purchOrgId", value);
  formik.setFieldValue("purchGrpId", null);

  if (value?.id) {
    console.log('Loading purchase groups for org:', value.id); // Debug log
    PullPurchaseGroupAll(value.id);
  } else {
    console.log('Clearing purchase groups list'); // Debug log
    setPurchaseGroupAllList([]);
  }
}}

                                                                                                    renderOption={(props, option) => (
                                                                                                        <Box
                                                                                                            component="li"
                                                                                                            {...props}
                                                                                                            style={
                                                                                                                option.id === "new"
                                                                                                                    ? {
                                                                                                                        fontStyle: "italic",
                                                                                                                        color: "blue",
                                                                                                                        cursor: "pointer",
                                                                                                                        textDecoration: "underline",
                                                                                                                    }
                                                                                                                    : {}
                                                                                                            }
                                                                                                        >
                                                                                                            {option.orgName}
                                                                                                        </Box>
                                                                                                    )}
                                                                                                    renderInput={(params) => (
                                                                                                        <TextField
                                                                                                            variant="outlined"
                                                                                                            {...params}
                                                                                                            label="Purchase Org"
                                                                                                            shrink={true}
                                                                                                            InputLabelProps={{
                                                                                                                shrink: true,
                                                                                                            }}
                                                                                                        />
                                                                                                    )}
                                                                                                /> */}
                                                                                                <Autocomplete
  id="purchOrgId"
  name="purchOrgId"
  size="small"
  className="w-100 f14"
  sx={{ width: "100%" }}
  options={[
    ...purchaseAllList,
    { id: "new", orgName: "Add New" },
  ]}
  value={formik.values.purchOrgId || null}
  isOptionEqualToValue={(option, value) => option?.id === value?.id}
  getOptionLabel={(option) => option.orgName ?? ""}
  onChange={(e, value) => {
    if (value?.id === "new") {
      setPurchaseOrgModal(true);
      return;
    }

    formik.setFieldValue("purchOrgId", value);
    formik.setFieldValue("purchGrpId", null);

    if (value?.id) {
      PullPurchaseGroupAll(value.id);
    } else {
      setPurchaseGroupAllList([]);
    }
  }}
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? {
              fontStyle: "italic",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
            }
          : {}
      }
    >
      {option.orgName}
    </Box>
  )}
  renderInput={(params) => (
    <TextField
      {...params}
      variant="outlined"
      label="Purchase Org"
      size="small"
      InputLabelProps={{ shrink: true }}
    />
  )}
/>

                                                                                            </div>
                                                                                            {/* <div className="col-12 col-md-12 col-lg-12 mb-4">
                                                                                                <Autocomplete
                        
                                                                                                    id="purchGrpId"
                                                                                                    name="purchGrpId"
                                                                                                    className="w-100 f14"
                                                                                                    sx={{ width: "50%" }}
                                                                                                    options={[
                                                                                                        ...purchaseGroupAllList,
                                                                                                        { id: "new", groupName: "Add New" },
                                                                                                    ]}
                                                                                                    getOptionLabel={(option) => option?.groupName ?? ""}
                                                                                                    value={formik.values?.purchGrpId}
                                                                                                    onChange={(e, value) => {
                        
                                                                                                        if (value?.id === "new") {
                                                                                                          
                                                                                                            return
                                                                                                        }
                                                                                                        formik.setFieldValue(
                                                                                                            "purchGrpId",
                                                                                                            value
                                                                                                        );
                                                                                                    }}
                                
                        
                                                                                                    renderOption={(props, option) => (
                                                                                                        <Box
                                                                                                            component="li"
                                                                                                            {...props}
                                                                                                            style={
                                                                                                                option.id === "new"
                                                                                                                    ? {
                                                                                                                        fontStyle: "italic",
                                                                                                                        color: "blue",
                                                                                                                        cursor: "pointer",
                                                                                                                        textDecoration: "underline",
                                                                                                                    }
                                                                                                                    : {}
                                                                                                            }
                                                                                                        >
                                                                                                            {option.groupName}
                                                                                                        </Box>
                                                                                                    )}
                                                                                                    renderInput={(params, data) => (
                                                                                                        <TextField
                                                                                                            {...params}
                                                                                                            variant="outlined"
                                                                                                            size="small"
                                                                                                            placeholder=""
                                                                                                            label="Purchase Group"
                                                                                                            shrink={true}
                                                                                                            InputLabelProps={{
                                                                                                                shrink: true,
                                                                                                            }}
                                                                                                        />
                                                                                                    )}
                                                                                                />
                                                                                            </div> */}
                                                                                            <div className="col-12 col-md-12 col-lg-12 mb-4">
  <Autocomplete
    id="purchGrpId"
    name="purchGrpId"
    className="w-100 f14"
    sx={{ width: "50%" }}
    options={purchaseGroupAllList.length > 0 ? [
      ...purchaseGroupAllList,
      { id: "new", groupName: "Add New" },
    ] : []}
    getOptionLabel={(option) => {
        if (!option) return "";
        return option.groupName || "";
    }}
    value={formik.values?.purchGrpId}
    isOptionEqualToValue={(option, value) => option?.id === value?.id}
    onChange={(e, value) => {
      if (value?.id === "new") {
        // Optional: open modal to add new group
        return;
      }
      formik.setFieldValue("purchGrpId", value);
    }}
    renderOption={(props, option) => (
      <Box
        component="li"
        {...props}
        style={
          option.id === "new"
            ? {
                fontStyle: "italic",
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
              }
            : {}
        }
      >
        {option.groupName}
      </Box>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        size="small"
        label="Purchase Group"
        InputLabelProps={{
          shrink: true,
        }}
      />
    )}
  />
</div>

                        <div className="col-12 mb-4">
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
                                    onChange={(e) => {
                                        setIsactive(e?.target?.value);
                                    }}
                                >
                                    <MenuItem value={true}>Active</MenuItem>
                                    <MenuItem value={false}>InActive</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="col-12 text-end">
                            {!loading ? (
                                <>
                                    <Button
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        onClick={clearfilledDocument}
                                    >
                                        Reset
                                    </Button>
                                    <span style={{ margin: "0 5px" }}></span>
                                    <Button
                                        color="success"
                                        variant="outlined"
                                        size="small"
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                </>
                            ) : (
                                <LoadingButton className="" loading variant="contained">
                                    Submit ...
                                </LoadingButton>
                            )}
                        </div>
                    </div>
                        <Modal
                                            size="lg"
                                            show={purchaseOrgModal}
                                            backdrop="static"
                                            keyboard={false}
                                            value={"Add NEW CATEGORY"}
                                            className="zindex1280"
                                            backdropClassName="zindex1280"
                                            centered
                                            contentClassName="border-0"
                                            onHide={() => ClosePurcgaseOrgModal()}
                                        >
                                            <Modal.Header className="pt-2 pb-2 bgheaderCards">
                                                <Modal.Title id="modal-heading">
                                                    <div className="d-flex align-items-center f14 text-white">
                                                        ADD Purchase Organization
                                                    </div>
                                                </Modal.Title>
                                                <IconButton
                                                    onClick={() => ClosePurcgaseOrgModal()}
                                                    size="small"
                                                    edge="start"
                                                >
                                                    <HiOutlineX className="f20 text-white" />
                                                </IconButton>
                                            </Modal.Header>
                                            <Modal.Body className="p-0">
                                                <div className="p-3">
                                                    <PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
                                                </div>
                                            </Modal.Body>
                                        </Modal>
                    
                                        <Modal
                                            size="lg"
                                            show={purchaseOrgGrpModal}
                                            backdrop="static"
                                            keyboard={false}
                                            value={"Add NEW CATEGORY"}
                                            className="zindex1280"
                                            backdropClassName="zindex1280"
                                            centered
                                            contentClassName="border-0"
                                            onHide={() => ClosePurcgaseOrgGrpModal()}
                                        >
                                            <Modal.Header className="pt-2 pb-2 bgheaderCards">
                                                <Modal.Title id="modal-heading">
                                                    <div className="d-flex align-items-center f14 text-white">
                                                        ADD Purchase Group
                                                    </div>
                                                </Modal.Title>
                                                <IconButton
                                                    onClick={() => ClosePurcgaseOrgGrpModal()}
                                                    size="small"
                                                    edge="start"
                                                >
                                                    <HiOutlineX className="f20 text-white" />
                                                </IconButton>
                                            </Modal.Header>
                                            <Modal.Body className="p-0">
                                                <div className="p-3">
                                                    <PurchaseOrgGrp />
                                                </div>
                                            </Modal.Body>
                                        </Modal>
                </form>

                <div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
                    <div className="d-flex flex-column min-vh-50">
                        <div className="flex-grow-1 p-2">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <DataGrid
                                            getRowId={getRowId}
                                            rows={spendList}
                                            loading={gridloading}
                                            columns={columns}
                                            style={{height:"500px"}}
                                            rowHeight={40}
                                            columnHeaderHeight={40}
                                            className="f13 border-0"
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddUpdateSpend;
