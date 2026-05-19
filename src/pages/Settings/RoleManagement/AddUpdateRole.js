import React, { useState, useEffect, useCallback } from "react";
import {Box,Button,Checkbox,Drawer,FormControl,FormControlLabel,FormGroup,IconButton,InputLabel,FormHelperText,MenuItem,Select,TextFieAutocomplete, InputAdornment, Typography,
} from "@mui/material";
import { Modal } from "react-bootstrap";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Form } from "react-bootstrap";
import { LoadingButton } from "@mui/lab";
import "../../../assets/css/base.css";
import {
	HiOutlinePencilAlt,   
	HiOutlineTrash,
	HiOutlineX,
	HiPencilAlt,
} from "react-icons/hi";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AddRole, UpdateRole, UpdateUser, getUserRoles } from "../../../utils/users";
import {

	removeSpecialCharactersAndNumbers,
} from "../../../utils/common";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { TroubleshootTwoTone } from "@mui/icons-material";

const AddUpdateRole = ({handleRoleList}) => {
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid, managerId }, dispatch] = useStateValue();
const [name, setname] = useState("");
const [editRecordData, seteditRecordData] = useState(null);
	const [designation, setdesignation] = useState("");
	const [designationId, setdesignationId] = useState(0);
	const [email, setemail] = useState("");
	const [phoneNumber, setphoneNumber] = useState("");
	
	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilleduser();
		}
	}, []);

  useEffect(() => {
    pullRolesList();
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


	const validationSchema = yup.object({
		name: yup.string().required("Please Enter Role"),

	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,

			name: editRecordData?.name ? editRecordData?.name : name,
			designationId: editRecordData?.designationId
				? editRecordData?.designationId
				: designationId,

			designation: editRecordData?.designation
				? editRecordData?.designation
				: designation,

			email: editRecordData?.email ? editRecordData?.email : email,
			managerId: editRecordData?.managerId
				? editRecordData?.managerId
				: managerId,
			phoneNumber: editRecordData?.phoneNumber
				? editRecordData?.phoneNumber
				: phoneNumber,

			isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
			createdby: 1,
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			setLoading(true);

			var data = {
				id: editRecordData?.id ? editRecordData?.id : 0,
				name: name,
				isActive: isActive,
			};

			if (editRecordData?.id > 0) {
				UpdateRole(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
          pullRolesList();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					//callbackstep("update");
					clearfilleduser();
					toast.success("Role updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});

       
					return true;
				});
			} else {
				AddRole(values, atoken).then((res) => {
					setLoading(false);
          pullRolesList();
          
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduser();

					toast.success("Role added successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
			
         // handleRoleList();
					return true;
				})
        .catch((error) => {
          setLoading(false);
          
          if (error.message === "Role already exists") {
            toast.error("User already exists!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1000,
            });
          } else {
            toast.error("Role already exists.", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1000,
            });
          }
          // Handle other errors if necessary
        });
      
              
            }
          }, 
        });

	const prefilleduser = () => {
		 
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData.id);
			setname(editRecordData.name);
			setisActive(editRecordData.isActive);
		}
	};

	const clearfilleduser = () => {
    seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setname("");
	
		setisActive(true);
	
	};
  
  const ResetRole = () => {
    seteditRecordData([]);
		setname("");
	
		setisActive(true);
	
	};
	const handleNameChange = (event) => {
		const { value } = event.target;
		//const cleanedValue = removeSpecialCharactersAndNumbers(value);
    const cleanedValue = value;

		setname(cleanedValue);
	};

  const [userList, setUserList] = useState([]);
  const pullRolesList = () => {
    var data = {
      CustomerId: customerid ,
   
    };
    setLoading(true);
    getUserRoles(data,atoken).then((res) => {
      
      setGridloading(true);
      if (res != "" && res != undefined) {
          setUserList(res);
        setGridloading(false); 
        handleRoleList(res);
      }
      setLoading(false);
      setGridloading(false);
    });
  }; 
 
  const callbackedit = useCallback((data) => {
    setname(data.name);
   
    setisActive(data.isActive);
    seteditRecordData(data);
    setState({ ...state, addnewfield: true });
  }, []);

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "name",
      headerName: "Role",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:200,
    
    }, 

    {
      field: "isActive",
      headerName: "Status",
      width: 180,
      renderCell: (params) => (
        params.formattedValue ? "Active" : "InActive"       
      )
    },
    {
      field: "action",
      headerName: "Action",
      width: 70,
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
	return(
  <>
  <div className="d-flex flex-row">
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="row mt-4">
        <div className="col-12 col-md-12 mb-3">
          <TextFieldCell
            id="name"
            name="name"
            label="Role*"
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
          {formik.errors.name && formik.touched.name && (
            <div className="error error-red" style={{ fontSize: "9px" }}>
              {formik.errors.name}
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
                variant="outlined"
                size="small"
                onClick={ResetRole}
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
    </form>
    <div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
      <div className="d-flex flex-column min-vh-50">
        <div className="flex-grow-1">
          <div >
            <div className="row m-2">
              <div className="col-12">
                <DataGrid
                  getRowId={getRowId}
                  rows={userList}
                  loading={gridloading}
                  columns={columns}
                  rowHeight={35}
                  columnHeaderHeight={35}
                  className="f13 bg-white"
                  disableRowSelectionOnClick
                  slots={{ toolbar: GridToolbar }}
                  style={{height:"auto"}}
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
export default AddUpdateRole;
