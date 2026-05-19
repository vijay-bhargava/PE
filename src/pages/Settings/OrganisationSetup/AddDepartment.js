import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,IconButton, FormControlLabel, Checkbox,
  InputAdornment,
  Typography,
  Autocomplete,
  Box,
  OutlinedInput,
  FormHelperText
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import { Cookies, useCookies } from "react-cookie";
import { HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { useFormik } from "formik";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { actionTypes, useStateValue } from "../../../store";
import NoRecordCell from "../../../components/NoRecordCell";
import {

  getBusinessUnitList,
  getUserDepartment,
  getUserDepartmentList,
} from "../../../utils/common/utility.js";

import TextFieldCell from "../../BaseCells/TextFieldCell.js";
import { AddDepartmentList, UpdateDepartment } from "../../../utils/users/index.js";
import { removeSpecialCharactersAndNumbers } from "../../../utils/common/index.js";

const AddDepartment = ({handleDepartmentList}) => {
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid, managerId }, dispatch] = useStateValue();
const [name, setname] = useState("");
const [editRecordData, seteditRecordData] = useState(null);
	const [description, setdescription] = useState("");
  const [departmentMapBussUnit, setdepartmentMapBussUnit] = useState([]);
	const [businessUnitName, setbusinessUnitName] = useState("");
  const [businessUnitId, setbusinessUnitId] = useState([]);
  const [businessId, setbusinessId] = useState([]); 
	const [email, setemail] = useState("");
	const [departmentName, setdepartmentName] = useState("");
  const [legalEntityId, setlegalEntityId] = useState(0);
  const [legalEntityName, setlegalEntityName] = useState("");
  
	
	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilleduser();
		}
	}, []);

  useEffect(() => {
    PullUserDepartment();
   // PullBusinessUnit();
    PullLegalEntity();
  }, []);

	const [state, setState] = useState({
		opensidebar: false,
	});
  const [BusinessList, setBusinessList] = useState([]);
  const PullBusinessUnit = (legalEntityId) => {
    
    var data = {
      CustomerId: customerid,
      LegalEntityId: legalEntityId,
     
    };

getBusinessUnitList(data, atoken).then((res) => { 
      setGridloading(true);
      if (res != "" && res != undefined) {
        setBusinessList(res);
        setGridloading(false); 
     
      }
      setLoading(false);
      setGridloading(false);
    });
  };
  // const showRole = () => {
  //   props.selectedRolelist();
  // };
  const [legalEntityList, setlegalEntityList] = useState([]);
  const PullLegalEntity = () => {
    var data = {
      CustomerId: customerid,
     
    };
;
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
  const getlegalDefault = (legalEntityId) => {
    ;
    if (legalEntityId && legalEntityId > 0) {
      const selectedOrganization = legalEntityList.find((data) => data.id === legalEntityId);
      return selectedOrganization || null;
    }
    return null;
  };
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


	const validationSchema = yup.object({
		name: yup.string().required("Please Enter Department"),

	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,

			businessUnitName: editRecordData?.businessUnitName ? editRecordData?.businessUnitName : businessUnitName,
			name: editRecordData?.name
				? editRecordData?.name
				: name,

				description: editRecordData?.description
				? editRecordData?.description
				: description,

        businessUnitId:editRecordData?.businessUnitId
				? editRecordData?.businessUnitId
				: businessUnitId,
        departmentMapBussUnit:departmentMapBussUnit,
        legalEntityId: editRecordData?.legalEntityId
				? editRecordData?.legalEntityId
				: legalEntityId,
        legalEntityName: editRecordData?.legalEntityName
				? editRecordData?.legalEntityName
				: legalEntityName,
       
			isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			setLoading(true);
      if (!values.businessUnitId) {
        setLoading(false);
        toast.error("Please select Business Unit.",{ toastId: "business" });
        return;
      }
      if (!values.legalEntityId) {
        setLoading(false);
        toast.error("Please select Legal Entity.",{ toastId: "LegalEntityy" });
        return;
      }
      
			var data = {
				id: editRecordData?.id ? editRecordData?.id : 0,
        legalEntityId:legalEntityId,
        legalEntityName:legalEntityName,
				customerId: customerid,
				name: name,
				description: description,
				businessUnitId: businessUnitId,
        businessUnitName: businessUnitName,
       //departmentMapBussUnit: departmentMapBussUnit,
      
				isActive: isActive
			};

			if (editRecordData?.id > 0) {
				UpdateDepartment(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
					PullUserDepartment();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					//callbackstep("update");
					clearfilleduser();
					toast.success("Department updated successfully!", {
					toastId: "Department"
					});
        
					return true;
				});
			} else {
				AddDepartmentList(values, atoken).then((res) => {
					setLoading(false);
					PullUserDepartment();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					//callbackstep("add");
					clearfilleduser();

					toast.success("Department added successfully!", {
            toastId: "Department_added_success",
					});
			
          
					return true;
				});
			}
		}, 
	});

	const prefilleduser = () => {
		 
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData.id);
			setname(editRecordData?.name);
      setdescription(editRecordData?.description);
      

			//setbusinessUnitId(Array.from(editRecordData?.businessUnitId));
      setlegalEntityId(editRecordData?.legalEntityId);
     setlegalEntityName(editRecordData?.legalEntityName);
      // setbusinessUnitId(
      //   editRecordData?.businessUnitId ? editRecordData?.businessUnitId.split(",") : []
      // );
      // const userBusinessValue = editRecordData?.departmentMapBussUnit || []; 
    
      // setbusinessId(userBusinessValue);

      //setuserDepartments(userBusinessValue);

      setdepartmentMapBussUnit(editRecordData?.departmentMapBussUnit)
			setisActive(editRecordData?.isActive);
		}
	};

	const clearfilleduser = () => {
    seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setname("");
	  setdescription("");
    setbusinessUnitId();
    setbusinessUnitName("");
    setlegalEntityId(0);
    setlegalEntityName("");
    setbusinessId(0);
    setdepartmentMapBussUnit([]);
		setisActive(true);
	
	};

  const removedepartment = () => {
    setname("");
	  setdescription("");
    setbusinessUnitId();
    setbusinessUnitName("");
    setlegalEntityId(0);
    setlegalEntityName("");
    setbusinessId(0);
    setdepartmentMapBussUnit([]);
		setisActive(true);
	
	};

	const [UserDepartment, setUserDepartment] = useState([]);
  const PullUserDepartment = () => {
    var data = {
      CustomerId: customerid ,
   
    };
    setLoading(true);
    getUserDepartmentList(data,atoken).then((res) => {
      console.log(res); 
      setGridloading(true);
      if (res != "" && res != undefined) {
		setUserDepartment(res);
    
    handleDepartmentList(res);
        setGridloading(false); 
      }
      setLoading(false);
      setGridloading(false);
    });
  }; 
  // const callbackstep = useCallback(
  //   (data) => {

  //     setState({ ...state, right: false });
  //     seteditRecordData(null);
  //     pullRolesList();
  //   },
  //   [page]
  // );
 
 

  const [gridloading, setGridloading] = useState(true);
  const columns = [
 
    {
		field: "name",
		headerName: "Department",
		renderCell: (params) => (
		  <div>{params?.formattedValue}</div>
		),
		width:150,
	  
	  }, 
    {
      field: "businessUnitName",
      headerName: "Business Unit",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:150,
      
      },
      {
        field: "legalEntityName",
        headerName: "Legal Entity ",
        renderCell: (params) => (
          <div>{params?.formattedValue}</div>
        ),
        width:180,
      
      }, 
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        params.formattedValue ? "Active" : "InActive"       
      )
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
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

 const handledepartChange=(event) =>{
	const { value } = event.target;
	const cleanedValue = removeSpecialCharactersAndNumbers(value);
	setdepartmentName(cleanedValue);
 }
//  const removespecialcharacter = (value) => {
//   // This regular expression allows only letters (a-z, A-Z), numbers (0-9), and spaces
//   return value.replace(/[^a-zA-Z0-9 ]/g, '');
// };


 const handleNameChange = (event) => {
	const { value } = event.target;
	//const cleanedValue = removespecialcharacter(value);
	setname(value);
};
const handleBusinessChange=(event)=>{
	const { value } = event.target;
	const cleanedValue = removeSpecialCharactersAndNumbers(value);
	setbusinessUnitName(cleanedValue);
}
const handledescChange = (e) => {
    const input = e?.target?.value;
    // Remove single quote character from input
    const sanitizedInput = input.replace(/'/g, "");
    // Set the sanitized input
    
    formik?.setFieldValue(
      "description",
      sanitizedInput
    );
    setdescription(sanitizedInput);
  };
 
  const handleChangeBusinessDepartment = (event, newValues) => {

    if (!newValues) return;
    const updatedDepartment = newValues.map((newValue) => ({
        id: editRecordData?.id||0,
        departmentName: name,
        businessUnitId: newValue?.id, 
        businessUnitName: newValue?.name,
    }));
    const customerId = customerid || 0; 
    const updatedAssignDepartment = newValues.map((newValue) => ({
        departmentId:   editRecordData?.id||0,
        departmentName: name,
        businessUnitId: newValue.id, 
        businessUnitName: newValue.name,
        customerId: customerId
    }));

    // Update state
   
    setdepartmentMapBussUnit(updatedAssignDepartment);
    setbusinessId(updatedAssignDepartment);
   // setuserDepartments(updatedDepartment);
}

  // const getBusinessDefault = (businessUnitId) => {
  //   ;
  //   if (businessUnitId && businessUnitId > 0) {
  //     const selectedOrganization = BusinessList?.find((data) => data.id === businessUnitId);
  //     return selectedOrganization || null;
  //   }
  //   // return null;
  // };
  
	const getBusinessDefault = (arraylist) => {
	
		let arrayNew = [];
		if (arraylist?.length > 0) {
			BusinessList?.map((data) => {
				arraylist?.map((array) => {
					if (data.id == array.businessUnitId) {
						arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};
  const onchangePurchOrg = (e, newValue) => {
    
    const selectedorgid= e?.target?.value;
setlegalEntityId(selectedorgid)
// Ensure newValue is not null before accessing its properties
if (newValue) {
  
    setlegalEntityId(newValue.id);
    setlegalEntityName(newValue.name); 

    PullBusinessUnit(newValue.id);
  // Assuming you have access to the purchaseAllList array containing org data

}
  };
  const callbackedit = useCallback((data) => {
    
  setname(data?.name);
   setdescription(data?.description);
   //setbusinessUnitId(Array.from(data?.businessUnitId));
   PullLegalEntity(data?.businessUnitId);
   setbusinessUnitId(data?.businessUnitId);
    setlegalEntityId(data?.legalEntityId);
    PullBusinessUnit(data?.legalEntityId);
     setlegalEntityName(data?.legalEntityName);
   setbusinessUnitName(data?.businessUnitName);
  //  const businessUnitIdArray = Array.isArray(data?.businessUnitId) 
  //  ? data?.businessUnitId 
  //  : [data?.businessUnitId].filter(Boolean);

 //setbusinessUnitId(businessUnitIdArray);
 //PullLegalEntity(businessUnitIdArray);
  //  const userBusinessValue = data?.departmentMapBussUnit ? data?.departmentMapBussUnit: []; 
    
  //  setbusinessId(userBusinessValue);
// setdepartmentMapBussUnit(data?.departmentMapBussUnit);
    setisActive(data?.isActive);
    seteditRecordData(data);
    setState({ ...state, addnewfield: true });
  }, []);
  // const onchangeBusinessType = (event) => {
	// 	const selectedValues = Array.isArray(event.target.value)
	// 		? event.target.value
	// 		: [event.target.value];
	// 	// console.log(selectedValues);
	// 	setbusinessUnitId(selectedValues);
	// };

//   const onchangeBusinessType = (event) => {
//     
//     setbusinessUnitId(event.target.value);

// };
const onchangeBusinessType = (event) => {
  const selectedIds = event.target.value;

  setbusinessUnitId(selectedIds);

  // Map selected IDs to their names
  const selectedNames = BusinessList
    ?.filter((item) => selectedIds.includes(item.id))
    .map((item) => item.name) || [];

  setbusinessUnitName(selectedNames);
};
const handlebusinesschange = (e) => {

  const selectedValue = e?.target?.value;


  const selectedBusinessUnit = BusinessList?.find(option => option?.id === selectedValue);

  if (selectedBusinessUnit) {
    setbusinessUnitId(selectedBusinessUnit.id);
    setbusinessUnitName(selectedBusinessUnit.name);
    PullUserDepartment(selectedBusinessUnit.id);
  }
};

	return(
  <>
  <div className="d-flex flex-row">
    <div className="col-12 col-md-4 col-lg-4">
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
                                
{/* <Autocomplete
  multiple  

  id="businessUnitId"
  name="businessUnitId"
  className="f14 w-100"
  options={BusinessList}
  
  getOptionLabel={(option) => option.name}
  value={getBusinessDefault(businessId)}
  onChange={handleChangeBusinessDepartment}
  filterSelectedOptions
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
      {option.name}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      id="department"
      name="businessUnitId"
      label="Business Unit*"
      error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
      helperText={formik.touched.departmentId && formik.errors.departmentId}
     
    />
   
  )}
/> */}
<div className="col-12 mb-4 mt-4 focus">   
  <FormControl fullWidth error={formik.touched.businessUnitName && Boolean(formik.errors.businessUnitName)}>
    <InputLabel id="busUnitId">Business Unit *</InputLabel>
    <Select
      labelId="busUnitId"
      InputLabelProps={{ shrink: true }}
      label="Business Unit"
      id="busUnitId"
      name="businessUnitName"
      variant="outlined"
      value={businessUnitId}
      size="small"
      onChange={handlebusinesschange}
      onBlur={formik.handleBlur}
    >
      {BusinessList?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
        </MenuItem>
      ))}
      
    </Select>
    {formik.touched.businessUnitName && formik.errors.businessUnitName && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.businessUnitName}
      </FormHelperText>
    )}
  </FormControl>
</div>

		<div className="col-12 col-md-12 mb-3 ">
          <TextFieldCell
            id="name"
            name="Name"
            label="Department*"
            placeholder=""
            value={name}
            maxLength={100}
            onChange={handleNameChange}
            inputProps={{ maxLength: 100 }}
            InputProps={{
              endAdornment: name && (
              <InputAdornment position="end">
                <Typography variant="body2" color="textSecondary">
                {name.length}/100
                </Typography>
              </InputAdornment>
              ),
            }}
          />
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
            inputProps={{ maxLength: 100 }}
            InputProps={{
              endAdornment: description && (
              <InputAdornment position="end">
                <Typography variant="body2" color="textSecondary">
                {description.length}/100
                </Typography>
              </InputAdornment>
              ),
            }}
          />
        
          {formik.errors.description && formik.touched.description && (
            <div className="error error-red" style={{ fontSize: "9px" }}>
              {formik.errors.description}
            </div>
          )}
        </div>
        {/* <Autocomplete
                        id="businessUnitId"
                        name="businessUnitId"
                        className=" f14"
                        sx={{ width: "100%" }}
                        options={BusinessList} 
                      
                       value={getBusinessDefault(businessUnitId)}
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
                          label="Business Unit*"
                           
                        />
                        )}
                      /> */}
                      {/* <div className="col-6 w-100 mb-4 focus">
<Autocomplete
  multiple  

  id="businessUnitId"
  name="businessUnitId"
  className="f14 w-100"
  options={BusinessList}
  
  getOptionLabel={(option) => option.name}
  value={getBusinessDefault(businessId)}
  onChange={handleChangeBusinessDepartment}
  filterSelectedOptions
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
      {option.name}
    </Box>
  )}
  renderInput={(params, data) => (
    <TextField
      {...params}
      variant="outlined"
      size="small"
      placeholder=""
      id="department"
      name="businessUnitId"
      label="Business Unit*"
      error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
      helperText={formik.touched.departmentId && formik.errors.departmentId}
     
    />
   
  )}
/>
</div> */}
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
              
                 // variant="outlined"
                size="small"
                onClick={removedepartment}
              >
                Reset
              </Button>

              <span style={{ margin: "0 5px" }}></span>
              <Button
                 color="primary"
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
    </form>

    </div>
    <div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
      <div className="d-flex flex-column min-vh-50">
        <div className="flex-grow-1 p-2 pt-0">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 mb-3">
                <DataGrid
                  getRowId={getRowId}
                  rows={UserDepartment}
                  loading={gridloading}
                  columns={columns}
                 style={{height:"auto"}}
                  rowHeight={35}
                  columnHeaderHeight={35}
                  className="f13 bg-white"
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
                }

export default AddDepartment;
