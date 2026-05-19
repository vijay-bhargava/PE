import React, { useState, useEffect, useCallback } from "react";
import {Box,Button,Checkbox,Drawer,FormControl,FormControlLabel,FormGroup,IconButton,InputLabel,FormHelperText,MenuItem,Select,TextFieAutocomplete, InputAdornment, Typography, Autocomplete, TextField,
} from "@mui/material";
import { Modal } from "react-bootstrap";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Form } from "react-bootstrap";
import { LoadingButton } from "@mui/lab";
import "../../assets/css/base.css"
import {
	HiOutlinePencilAlt,
	HiOutlineTrash,
	HiOutlineX,
	HiPencilAlt,
} from "react-icons/hi";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {

	removeSpecialCharactersAndNumbers,
} from ".";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AddUom, BusinessUnitAdd, BusinessUnitUpdate, LegalEntityAdd, LegalEntityUpdate, UpdateUom, getBusinessUnit, getBusinessUnitList, getUomList, getUserDepartment } from "./utility";
import { FindItemCategory, getItemCategory, ItemCategoryAdd, UpdateItemCategory } from "../purchaseRequest";

const AddBusinessUnit = ({handleBusinessUnitList}) => {
const [{ atoken, rtoken, customerid, managerId }, dispatch] = useStateValue();
const [name, setname] = useState("");
const [description, setdescription] = useState("");
const [address, setAddress] = useState("");
const [editRecordData, seteditRecordData] = useState(null);
const [legalId, setlegalId] = useState(0);
const [legalEntityId, setlegalEntityId] = useState(0);
const [legalEntityName, setlegalEntityName] = useState("");
const [loading, setLoading] = useState(false);
	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilledLegal();
		}
	}, []);

  useEffect(() => {
    PullBusinessUnit();
    PullLegalEntity();
    
  }, []);

	const [state, setState] = useState({
		opensidebar: false,
	});


	const toggleDrawer = (anchor, open) => (event) => {
		//
		if (open == false) {
			editRecordData(null);
		}
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};


    const PullBusinessUnit = () => {
        var data = {
          CustomerId: customerid,
         
        };
    
    getBusinessUnitList(data, atoken).then((res) => { 
          setGridloading(true);
          if (res != "" && res != undefined) {
              // Ensure each business unit has a legalEntityName for the grid
              const mapped = res.map((item) => {
                const copy = { ...item };
                if (!copy.legalEntityName && copy.legalEntityId) {
                  const le = legalEntityList.find((l) => l.id === copy.legalEntityId);
                  copy.legalEntityName = le ? le.name : "";
                }
                return copy;
              });
              setBusinessList(mapped);
            setGridloading(false); 
            handleBusinessUnitList(res);
          }
          setLoading(false);
          setGridloading(false);
        });
      };
   const validationSchema = yup.object({
		name : yup.string().required("Please enter Business Unit"),

	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
      customerId: customerid,
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
      name: editRecordData?.name ? editRecordData?.name : name,
      description: editRecordData?.description
				? editRecordData?.description
				: description,
      address: editRecordData?.address ? editRecordData?.address : address,
        isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
        legalEntityId: editRecordData?.legalEntityId ? editRecordData?.legalEntityId : legalEntityId,
        legalEntityName: editRecordData?.legalEntityName? editRecordData?.legalEntityName : legalEntityName,
		},
		 validationSchema: validationSchema,
		onSubmit: (values) => {
            
			setLoading(true);
            if (!values.legalEntityId) {
                setLoading(false);
                toast.error("Please select Legal Entity.",{ toastId: "UseEntity" });
                return;
              }
			var data = {
        customerId: customerid,
				id: editRecordData?.id ? editRecordData?.id : 0,
				name: name,
				description:description,
                isActive: isActive,
                legalEntityId: legalEntityId,
                legalEntityName:legalEntityName,
      address: address,
        
			};

			if (editRecordData?.id > 0) {
        
				BusinessUnitUpdate(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
                    PullBusinessUnit();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilledBusiness();
					toast.success("Business unit  updated successfully!", {
            toastId: "UseBusiness" 
					});

       
					return true;
				});
			} else {
				BusinessUnitAdd(values, atoken).then((res) => {
					setLoading(false);
                    PullBusinessUnit();
          
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilledBusiness();

					toast.success("Legal Entity added successfully!", {
					  toastId: "UseBusiness" 
					});
			
         // handleRoleList();
					return true;
				})
        .catch((error) => {
          setLoading(false);
          if (error.message === "Legal Entity already exists") {
            toast.error("User already exists!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1000,
            });
          } else {
            toast.error("Role already exists.", {
              toastId: "UseBusRole" 
            });
          }
          
        });
       }
          }, 
        });
        const callbackedit = useCallback((data) => {
            ;
        setlegalEntityId(data?.legalEntityId);
          setname(data?.name);
          setdescription(data?.description);
                setAddress(data?.address);
          setisActive(data?.isActive);
          setlegalEntityName(data?.legalEntityName);
          seteditRecordData(data);
          setState({ ...state, addnewfield: true });
        }, []);
      
	const prefilledLegal= () => {
        ;
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData?.id);
			setname(editRecordData?.name);
      setdescription(editRecordData?.description);
      setlegalEntityId(editRecordData?.legalEntityId);
			setisActive(editRecordData?.isActive);
            formik.setFieldValue("address", editRecordData?.address ? editRecordData?.address : "");
            setAddress(editRecordData?.address ? editRecordData?.address : "");
		}
	};

	const clearfilledBusiness = () => {
    seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setname("");
		setdescription("");
        setAddress("");
        formik.setFieldValue("address", "");
        setlegalEntityId(0);
		setisActive(0);
	
	};
  const handledescChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/'/g, "");
		formik?.setFieldValue("description", sanitizedInput);
		setdescription(sanitizedInput);
	};

  const handleAddressChange = (e) => {
    const input = e?.target?.value;
    const sanitizedInput = input.replace(/'/g, "");
    formik?.setFieldValue("address", sanitizedInput);
    setAddress(sanitizedInput);
  };

	const handleChangeCategory = (event) => {
		const { value } = event.target;
		setname(value);
	};
    const [BusinessList, setBusinessList] = useState([]);
    const [legalEntityList, setlegalEntityList] = useState([]);
    const [UserDepartment, setUserDepartment] = useState([]);
    const PullLegalEntity = () => {
      var data = {
        CustomerId: customerid,
       
      };
  
       getUserDepartment(data, atoken).then((res) => { 
        setGridloading(true);
        if (res != "" && res != undefined) {
        
            setlegalEntityList(res);
          setGridloading(false); 
       
        }
        setLoading(false);
        setGridloading(false);
      });
    };
    const handleLegalChange = (event, selectedOption) => {
        console.log('Selected option:', selectedOption);
        if (selectedOption) {
          setlegalEntityId(selectedOption.id); 
        }
      };
      
      const onchangePurchOrg = (e, newValue) => {
        const selectedorgid= e?.target?.value;
    setlegalEntityId(selectedorgid)
    // Ensure newValue is not null before accessing its properties
    if (newValue) {
      
        setlegalEntityId(newValue.id);
        setlegalEntityName(newValue.name);
        // keep formik in sync so values passed to BusinessUnitAdd include legalEntityName
        formik.setFieldValue("legalEntityId", newValue.id);
        formik.setFieldValue("legalEntityName", newValue.name);
 
      // Assuming you have access to the purchaseAllList array containing org data
   
    }
      };

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "name",
      headerName: "Business Unit ",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:200,
    
    }, 
    {
      field: "legalEntityName",
      headerName: "Legal Entity ",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:200,
    
    }, 
   
    {
      field: "isActive",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        params.formattedValue ? "Active" : "InActive"       
      )
    },
    {
      field: "action",
      headerName: "Action",
      width: 140,
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
    return row.id;
  }
  const getlegalDefault = (legalEntityId) => {
    ;
    if (legalEntityId && legalEntityId > 0) {
      const selectedOrganization = legalEntityList.find((data) => data.id === legalEntityId);
      return selectedOrganization || null;
    }
    return null;
  };
	return(
  <>
  <div className="d-flex flex-row">
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="row mt-4">
      <Autocomplete
                        id="legalId"
                        name="legalId"
                        className=" f14"
                        sx={{ width: "100%" }}
                        options={legalEntityList} 
                      
                       value={getlegalDefault(legalEntityId)}
                        onChange={(event, newvalue) => {onchangePurchOrg(event, newvalue)}} 
                        getOptionLabel={(option) => option.name}
                        
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            {option.name}
                          </Box>
                        )}
                        renderInput={(params, data) => (
                          <TextField
                          {...params}
                          variant="outlined"
                          size='small'
                          placeholder=""
                          label="Legal Entity *"
                           
                        />
                        )}
                      />
        <div className="col-12 col-md-12 mb-3 mt-4">
          <TextFieldCell
            id="name"
            name="name"
            label="Business Unit*"
            placeholder=""
            value={name}
            maxLength={100}
           onChange={handleChangeCategory}
           InputProps={{
            endAdornment: name && (
              <InputAdornment position="end">
                <Typography variant="body2" color="textSecondary">
                  {name?.length}/100
                </Typography>
              </InputAdornment>
            ),
          }}
          />
          {/* <div style={{ fontSize: "0.8em", color: "blue" }}>
            {uom.length}/100
          </div> */}
          {formik.errors.name && formik.touched.name && (
            <div className="error error-red" style={{ fontSize: "9px" }}>
              {formik.errors.name}
            </div>
          )}
        </div>
        <div className="col-12 col-md-12 mb-3">
							<TextFieldCell
								id="description"
								name="description"
								label="Description"
								placeholder=""
								value={description}
								maxLength={100}
								onChange={handledescChange}
								InputProps={{
									endAdornment: description && (  
									  <InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
										  {description?.length}/100
										</Typography>
									  </InputAdornment>
									),
								  }}
							/>
							{/* <div style={{ fontSize: "0.8em", color: "blue" }}>
								{description.length}/100
							</div> */}
							{formik?.errors?.description && formik?.touched?.description && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik?.errors?.description}
								</div>
							)}
						</div>
                <div className="col-12 col-md-12 mb-3">
                  <TextFieldCell
                    id="address"
                    name="address"
                    label="Address"
                    placeholder=""
                    value={address}
                    maxLength={200}
                    onChange={handleAddressChange}
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
                  {formik?.errors?.address && formik?.touched?.address && (
                    <div className="error error-red" style={{ fontSize: "9px" }}>
                      {formik?.errors?.address}
                    </div>
                  )}
                </div>
                       
	{/* <Autocomplete
  multiple={false}
  id="legalId"
  name="legalId"
  className="mb-4 mt-0"
  sx={{ width: "100%" }}
  size="small"
  options={legalEntityList}
  value={legalEntityId}
  getOptionLabel={(option) => option.name}
  onChange={handleLegalChange} // Updated here
  filterSelectedOptions
  renderInput={(params) => (
    <TextField
      {...params}
      variant="outlined"
      placeholder=""
      label="Select Legal Entity*"
     
    />
  )}
/> */}

        <div className="row">
          <div className="col-12 col-md-6 mb-3">
            <FormControlLabel
              control={
                <Checkbox
                  name="isActive"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => {
                    setisActive(e?.target?.checked);
                  }}
                />
              }
              label="Active "
            />
          </div>
        </div>

        <div className="col-12 text-end">
          {!loading ? (
            <>
              <Button
                color="primary"
                variant="contained"
                size="medium"
                onClick={clearfilledBusiness}
              >
                Reset
              </Button>

              <span style={{ margin: "0 5px" }}></span>
              <Button
                color="primary"
                variant="outlined"
                size="medium"
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
    </form>
    <div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
      <div className="d-flex flex-column min-vh-50">
        <div className="flex-grow-1 p-2">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 mb-3">
                <DataGrid
                  getRowId={getRowId}
                  rows={BusinessList}
                  loading={gridloading}
                  columns={columns}
                  autoHeight
                  rowHeight={35}
                  columnHeaderHeight={35}
                  className="f13 bg-white"
                  disableDensitySelector
                  disableRowSelectionOnClick
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                    },
                  }}
                />
              </div>
              <div className="pagination_wrapper mb-3 mt-3">
                <div className="d-flex align-items-center">
                
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
  );
                }
export default AddBusinessUnit;
