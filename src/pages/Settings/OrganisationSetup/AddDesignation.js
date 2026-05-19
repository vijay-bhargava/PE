import React, { useState, useEffect } from "react";
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	IconButton,
	FormControlLabel,
	Checkbox,
	FormHelperText,
	InputAdornment,
	Typography,Autocomplete,Box,
	OutlinedInput
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
	getUserDesignation,
} from "../../../utils/common/utility.js";

import TextFieldCell from "../../BaseCells/TextFieldCell.js";
import {
	AddDepartmentList,
	AddDesignationList,
	UpdateDepartment,
	UpdateDesignation,
} from "../../../utils/users/index.js";
import { removeSpecialCharactersAndNumbers } from "../../../utils/common/index.js";

const AddDesignation = ({handleDesignationList}) => {
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid, managerId }, dispatch] = useStateValue();
	const [name, setname] = useState("");
	const [editRecordData, seteditRecordData] = useState(null);
	const [description, setdescription] = useState("");
	const [businessUnitName, setbusinessUnitName] = useState("");
	const [businessUnitId, setbusinessUnitId] = useState(0);
	const [departmentId, setdepartmentId] = useState(0);
	const [departmentName, setdepartmentName] = useState("");

	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilleduser();
		}
	}, []);

	useEffect(() => {
		PullUserDesignation();
		//PullUserDepartment();
		PullLegalEntity();
		//PullBusinessUnit();
	}, []);

	const [state, setState] = useState({
		opensidebar: false,
	});

	// const showRole = () => {
	//   props.selectedRolelist();
	// };

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
	const [departmentMapBussUnit, setdepartmentMapBussUnit] = useState([]);
	const [UserDepartment, setUserDepartment] = useState([]);
	const PullUserDepartment = (businessUnitId) => {
		
		var dataRequest ={
			CustomerId: customerid,
			BusinessUnitId:businessUnitId
		}
	
		getUserDepartmentList(dataRequest, atoken).then((res) => {
			setUserDepartment(res);
		});
	};
	const [legalEntityName, setlegalEntityName] = useState("");
	const [legalEntityId, setlegalEntityId] = useState(0);
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
	const onchangePurchOrg = (e, newValue) => {
		
		const selectedorgid= e?.target?.value;
	setlegalEntityId(selectedorgid)

	// Ensure newValue is not null before accessing its properties
	if (newValue) {
	  
		setlegalEntityId(newValue.id);
		setlegalEntityName(newValue.name); 
		PullBusinessUnit(newValue.id);
	}
	  };
	  const [businessId, setbusinessId] = useState([]); 
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
	const validationSchema = yup.object({
		name: yup.string().required("Please Enter Designation"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,

			description: editRecordData?.description
				? editRecordData?.description
				: description,
			name: editRecordData?.name ? editRecordData?.name : name,

			departmentId: editRecordData?.departmentId
			? editRecordData?.departmentId
			: departmentId,
          

			departmentName:editRecordData?.departmentName
			? editRecordData?.departmentName
			: departmentName,
			businessUnitId: editRecordData?.businessUnitId
			? editRecordData?.businessUnitId
			: businessUnitId,
			businessUnitName:  editRecordData?.businessUnitName
			? editRecordData?.businessUnitName
			: businessUnitName,
			legalEntityId: editRecordData?.legalEntityId
			? editRecordData?.legalEntityId
			: legalEntityId,
			legalEntityName:  editRecordData?.legalEntityName
			? editRecordData?.legalEntityName
			: legalEntityName,
			isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {

			setLoading(true);
			if (!values.businessUnitId) {
				setLoading(false);
				toast.error("Please select Business Unit.",{ toastId: "BusinessUnit" });
				return;
			  }
			  if (!values.legalEntityId) {
				setLoading(false);
				toast.error("Please select Legal Entity.",{ toastId: "Entityselect" });
				return;
			  }
			if (!values?.departmentId) {
				setLoading(false);
				toast.error("Please select  department.",{toastId: "Designationselected"});
				return; 
			  }

			var data = {
				id: editRecordData?.id ? editRecordData?.id : 0,
                customerId: customerid,
				name: name,
				description: description,
				departmentId: departmentId,
				departmentName:departmentName,
				businessUnitId:businessUnitId,
				businessUnitName:businessUnitName,
				legalEntityId:legalEntityId,
				legalEntityName:legalEntityName,
				isActive: isActive,
			};

			if (editRecordData?.id > 0) {
				UpdateDesignation(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
					PullUserDesignation();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduser();
					toast.success("Designation updated successfully!", {
						toastId: "Designationupdated"
					});

					return true;
				});
			} else {
				AddDesignationList(values, atoken).then((res) => {
					setLoading(false);
					PullUserDesignation();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					
					clearfilleduser();

					toast.success("Designation added successfully!", {
						toastId: "Designationadded"
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
			PullUserDepartment(editRecordData?.departmentName);
			setisActive(editRecordData?.isActive);
		}
	};

	const clearfilleduser = () => {
		
		seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setname("");
		setdescription("");
		setisActive(true);
		setdepartmentId(0);
		setbusinessUnitId(0);
		setbusinessUnitName("");
		setlegalEntityId(0);
		setlegalEntityName("");
	};

	
	const ResetDesignation = () => {
		
		seteditRecordData([]);
		//formik.setFieldValue("id", 0);
		setname("");
		setdescription("");
		setisActive(true);
		setdepartmentId(0);
		setbusinessUnitId(0);
		setbusinessUnitName("");
		setlegalEntityId(0);
		setlegalEntityName("");
	};

	const [UserDesignation, setUserDesignation] = useState([]);
	const PullUserDesignation = () => {
		var data = {
			CustomerId: customerid,
		};
		setLoading(true);
		getUserDesignation(data, atoken).then((res) => {
			console.log(res);
			setGridloading(true);
			if (res != "" && res != undefined) {
				setUserDesignation(res);
				setGridloading(false);
				handleDesignationList(res);
			}
			setLoading(false);
			setGridloading(false);
		});
	};


	const callbackedit = useCallback((data) => {
		
		setname(data?.name);
    setdescription(data?.description);
		setisActive(data?.isActive);
		setdepartmentId(data?.departmentId);
		setdepartmentName(data?.departmentName);
		PullUserDepartment(data?.businessUnitId)
		//PullLegalEntity(data?.businessUnitId);
		setbusinessUnitId(data?.businessUnitId);
		setlegalEntityId(data?.legalEntityId);
		  setlegalEntityName(data?.legalEntityName);
		setbusinessUnitName(data?.businessUnitName);
	//PullBusinessUnit(data?.legalEntityId);
	 
	 
	PullLegalEntity(data?.businessUnitId);
	
	PullBusinessUnit(data?.legalEntityId);
		seteditRecordData(data);
		setState({ ...state, addnewfield: true });
	}, []);
// 	const handleDepartmentChange = (e) => {
// ;
// 		const selectedId = e.target.value;
		
// 		const selecteddesignation = UserDepartment.find(cat => cat.id === selectedId);
// 		setdepartmentId(selectedId); 
// 		setdepartmentName(departmentName);
// 		//setdepartmentName(selecteddesignation.name);
		
// 	  };
	  const handleDepartmentChange = (e) => {
		const selectedId = e.target.value;
		const selectedDepartment = UserDepartment.find(cat => cat.id === selectedId);
		setdepartmentId(selectedId); 
		setdepartmentName(selectedDepartment?.name); 
	  };
	  
	const [gridloading, setGridloading] = useState(true);
	const columns = [
		{
			field: "name",
			headerName: "Designation ",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: 120,
		},
		{
			field: "departmentName",
			headerName: "Department ",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: 120,
		},
		{
			field: "businessUnitName",
			headerName: "Business Unit",
			renderCell: (params) => (
			  <div>{params?.formattedValue}</div>
			),
			width:120,
			
			},
			{
			  field: "legalEntityName",
			  headerName: "Legal Entity ",
			  renderCell: (params) => (
				<div>{params?.formattedValue}</div>
			  ),
			  width:150,
			
			}, 
		
		{
			field: "isActive",
			headerName: "Status",
			width: 80,
			renderCell: (params) => (params.formattedValue ? "Active" : "InActive"),
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
			),
		},
	];
	const getRowId = (row) => {
		return row.id;
	};
	const removespecialcharacter = (value) => {
		// This regular expression allows only letters (a-z, A-Z), numbers (0-9), and spaces
		return value.replace(/[^a-zA-Z0-9 ]/g, '');
	  };
	const handleNameChange = (event) => {
		const { value } = event.target;
		//const cleanedValue = removespecialcharacter(value);
		setname(value);
	};
	const handledescChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/'/g, "");
		formik?.setFieldValue("description", sanitizedInput);
		setdescription(sanitizedInput);
	};


	const onchangeBusinessType = (event) => {
		const selectedIds = event.target.value;
		
		//setbusinessUnitId(selectedIds);
	  
		// Map selected IDs to their names
		const selectedNames = BusinessList
		  ?.filter((item) => selectedIds.includes(item.id))
		  .map((item) => item.name) || [];
	  
		setbusinessUnitName(selectedNames);
		//PullUserDepartment(selectedIds);
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
	return (
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
   
  )} */}
<div className="col-12 mb-4 mt-4 focus">   
  <FormControl fullWidth error={formik.touched.businessUnitName && Boolean(formik.errors.businessUnitName)}>
    <InputLabel id="busUnitId">Business Unit</InputLabel>
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


<div className="col-12 col-md-12 mb-3">
  <FormControl fullWidth error={formik.touched.designationId && Boolean(formik.errors.designationId)}>
    <InputLabel id="departmentId">Department *</InputLabel>
    <Select
      labelId="departmentId"
      InputLabelProps={{
        shrink: true,
      }}
      label="Department *"
      id="departmentId"
      name="departmentId"
      variant="outlined"
      value={departmentId}
      size="small"
     
      onChange={handleDepartmentChange}

      onBlur={formik.handleBlur}
    >
      {UserDepartment?.map((option, i) => (
        <MenuItem key={i} value={option?.id}>
          {option?.name}
        </MenuItem>
      ))}
       
    </Select>
    {formik.touched.designationId && formik.errors.designationId && (
      <FormHelperText className="error error-red small-font">
        {formik.errors.departmentId}
      </FormHelperText>
    )}
  </FormControl>
</div>
						<div className="col-12 col-md-12 mb-3">
							<TextFieldCell
								id="name"
								name="name"
								label="Designation*"
								placeholder=""
								value={name}
								maxLength={100}
								onChange={handleNameChange}
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
								{name.length}/100
							</div> */}
							{formik?.errors?.name && formik?.touched?.name && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik?.errors?.name}
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
										//variant="outlined"
										size="small"
										onClick={ResetDesignation}
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
				<div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
					<div className="d-flex flex-column min-vh-50">
						<div className="flex-grow-1 p-2 pt-0">
							<div className="container-fluid">
								<div className="row">
									<div className="col-12">
										<DataGrid
											getRowId={getRowId}
											rows={UserDesignation}
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
};

export default AddDesignation;
