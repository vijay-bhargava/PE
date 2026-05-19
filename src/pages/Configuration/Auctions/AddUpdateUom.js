import React, { useState, useEffect, useCallback } from "react";
import {Box,Button,Checkbox,Drawer,FormControl,FormControlLabel,FormGroup,IconButton,InputLabel,FormHelperText,MenuItem,Select,TextFieAutocomplete,
} from "@mui/material";
import { Modal } from "react-bootstrap";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { Form } from "react-bootstrap";
import { LoadingButton } from "@mui/lab";
import "../../../assets/css/base.css";
import { ApiClient, api } from "../../../Apiclient";
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

import {

	removeSpecialCharactersAndNumbers,
} from "../../../utils/common";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { AddUom, UpdateUom, getUomList } from "../../../utils/common/utility";


const AddUpdateUom = ({handleUomList}) => {
	
	const [{ atoken, rtoken, customerid,customersuffix, managerId }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
const [uom, setuom] = useState("");
const [editRecordData, seteditRecordData] = useState(null);


    const [loading, setLoading] = useState(false);
	
	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilleduom();
		}
	}, []);

  useEffect(() => {
    pullUomList();
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
		uom : yup.string().required("Please Enter Uom"),

	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
     
			uom: editRecordData?.uom ? editRecordData?.uom : uom,
		

			isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
            
			setLoading(true);

			var data = {
				id: editRecordData?.id ? editRecordData?.id : 0,
				uom: uom,
				isActive: isActive,
			};

			if (editRecordData?.id > 0) {
				UpdateUom(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
                    pullUomList();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					//callbackstep("update");
					clearfilleduom();
					toast.success("Uom updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});

       
					return true;
				});
			} else {
        let data = {
          customerId: values?.customerid,
          id: 0,
          uom: values?.uom,
          isActive: values?.isActive,
        };
        const res = await apiClient.postres("/api/UOM/Add",data,atoken)
        
        if(res){
          setLoading(false);
                    pullUomList();
          
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduom();

					toast.success("Uom added successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
			
         // handleRoleList();
					return true;
        }
				// AddUom(values, atoken).then((res) => {

					
				// })
        // .catch((error) => {
        //   setLoading(false);
          
        //   if (error.message === "Role already exists") {
        //     toast.error("User already exists!", {
        //       position: toast.POSITION.TOP_CENTER,
        //       autoClose: 1000,
        //     });
        //   } else {
        //     toast.error("Role already exists.", {
        //       position: toast.POSITION.TOP_CENTER,
        //       autoClose: 1000,
        //     });
        //   }
        //   // Handle other errors if necessary
        // });
      
              
            }
          }, 
        });

	const prefilleduom = () => {
		 ;
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData.id);
			setuom(editRecordData.uom);
			setisActive(editRecordData.isActive);
		}
	};

	const clearfilleduom = () => {
    seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setuom("");
	
		setisActive(0);
	
	};

	const handleChangeuom = (event) => {
		const { value } = event.target;
		const cleanedValue = removeSpecialCharactersAndNumbers(value);
		setuom(cleanedValue);
	};

  const [userList, setUserList] = useState([]);
  const pullUomList = () => {
    var data = {
      CustomerId: customerid ,
   
    };
    setLoading(true);
    getUomList(data,atoken).then((res) => {
      
      setGridloading(true);
      if (res != "" && res != undefined) {
          setUserList(res);
        setGridloading(false); 
        if (typeof handleUomList === 'function') handleUomList(res);
      }
      setLoading(false);
      setGridloading(false);
    });
  }; 
 
  const callbackedit = useCallback((data) => {
    setuom(data.uom);
   
    setisActive(data.isActive);
    seteditRecordData(data);
    setState({ ...state, addnewfield: true });
  }, []);

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "uom",
      headerName: "UOM",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:200,
    
    }, 

    {
      field: "isActive",
      headerName: "Status",
      width: 200,
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
    return row.id;
  }
	return(
  <>
  <div className="d-flex flex-row">
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="row mt-4">
        <div className="col-12 col-md-12 mb-3">
          <TextFieldCell
            id="uom"
            name="uom"
            label="UOM*"
            placeholder=""
            value={uom}
            maxLength={100}
           onChange={handleChangeuom}
          />
          <div style={{ fontSize: "0.8em", color: "blue" }}>
            {uom.length}/100
          </div>
          {formik.errors.uom && formik.touched.uom && (
            <div className="error error-red" style={{ fontSize: "9px" }}>
              {formik.errors.uom}
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
                onClick={clearfilleduom}
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
        <div className="flex-grow-1 p-2">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 mb-3" style={{ height: '55vh' }}>
                <DataGrid
                  getRowId={getRowId}
                  rows={userList}
                  loading={gridloading}
                  columns={columns}
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
export default AddUpdateUom;
