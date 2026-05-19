import React, { useState, useEffect, useCallback } from "react";
import {Box,Button,Checkbox,Drawer,FormControl,FormControlLabel,FormGroup,IconButton,InputLabel,FormHelperText,MenuItem,Select,TextFieAutocomplete, InputAdornment, Typography,
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
import { AddUom, UpdateUom, getUomList } from "./utility";
import { FindItemCategory, FindPlantStorage, getItemCategory, ItemCategoryAdd, PlantAdd, UpdateItemCategory, UpdatePlant } from "../purchaseRequest";
import { api, ApiClient } from "../../Apiclient";

const AddPrPlant = ({handlePlantList}) => {
	  
	const [{ atoken, rtoken, customerid,customersuffix, managerId }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
const [slDesc, setslDesc] = useState("");
const [slCode, setslCode] = useState("");
const [address, setAddress] = useState("");
const [editRecordData, seteditRecordData] = useState(null);


    const [loading, setLoading] = useState(false);
	
	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilledplant();
		}
	}, []);

  useEffect(() => {
    pullPlantList();
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
		slDesc : yup.string().required("Please Enter Plant"),
    // slCode: yup.string().required("Please Enter Code"),
	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
            customerId: customerid,
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
     
			slDesc: editRecordData?.slDesc ? editRecordData?.slDesc : slDesc,
		slCode:editRecordData?.slCode ? editRecordData?.slCode : slCode,
		address: editRecordData?.address ? editRecordData?.address : address,

			// isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		
		},
		validationSchema: validationSchema,
		onSubmit:async (values) => {
            
			setLoading(true);
           
			var data = {
        customerId: customerid,
				id: editRecordData?.id ? editRecordData?.id : 0,
				slDesc: slDesc,
        slCode:slCode,
        address: address
				// isActive: isActive,
			};

			if (editRecordData?.id > 0) {
        const res = await apiClient.postres(`/api/StorageLocation/Update`,data,atoken);
        if(res){
          
          pullPlantList();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					//callbackstep("update");
					clearfilleduom();
					toast.success("Plant updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});

       
				

        }
        setLoading(false);
				
			} else {
        
        
        const res = await apiClient.postres(`api/StorageLocation/Add`,values,atoken);
				if(res){

        
                    pullPlantList();
          
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduom();

					toast.success("Plant added successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
			
         

        }
        setLoading(false);
      
              
            }
          }, 
        });

	const prefilledplant = () => {
		 
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData?.id);
			setslDesc(editRecordData?.slDesc);
			setisActive(editRecordData?.isActive);
      	setslCode(editRecordData?.slCode);
      	setAddress(editRecordData?.address || "");
      
		}
	};

	const clearfilleduom = () => {
    seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setslDesc("");
	setslCode("");
	setAddress("");
		setisActive(0);
	
	};

	const handleChangeCategory = (event) => {
		const { value } = event.target;
		//const cleanedValue = removeSpecialCharactersAndNumbers(value);
		setslDesc(value);
	};

  	const handleChangeslcode = (event) => {
		const { value } = event.target;
		//const cleanedValue = removeSpecialCharactersAndNumbers(value);
		setslCode(value);
	};

    const [PlantList, setPlantList] = useState([]);
  const pullPlantList = () => {
    var data = {
        CustomerId: customerid,
    };
    setLoading(true);
    FindPlantStorage(data,atoken).then((res) => {
      
      setGridloading(true);
      if (res != "" && res != undefined) {
        setPlantList(res);
        setGridloading(false); 
        if (typeof handlePlantList === 'function') handlePlantList(res);
      }
      setLoading(false);
      setGridloading(false);
    });
  }; 
 
  const callbackedit = useCallback((data) => {
    setslDesc(data?.slDesc);
   setslCode(data?.slCode);
    setAddress(data?.address || "");
    //setisActive(data?.isActive);
    seteditRecordData(data);
    setState({ ...state, addnewfield: true });
  }, []);

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "slDesc",
      headerName: "Plant Name",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:200,
    
    }, 
   {
      field: "slCode",
      headerName: "Plant code",
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
      width:150,
    
    }, 
    // {
    //   field: "isActive",
    //   headerName: "Status",
    //   width: 200,
    //   renderCell: (params) => (
    //     params.formattedValue ? "Active" : "InActive"       
    //   )
    // },
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
            id="slDesc"
            name="slDesc"
            label="Plant Name*"
            placeholder=""
            value={slDesc}
            maxLength={100}
           onChange={handleChangeCategory}
           InputProps={{
            endAdornment: slDesc && (
              <InputAdornment position="end">
                <Typography variant="body2" color="textSecondary">
                  {slDesc?.length}/100
                </Typography>
              </InputAdornment>
            ),
          }}
          />
          {/* <div style={{ fontSize: "0.8em", color: "blue" }}>
            {uom.length}/100
          </div> */}
          {formik.errors.slDesc && formik.touched.slDesc && (
            <div className="error error-red" style={{ fontSize: "9px" }}>
              {formik.errors.slDesc}
            </div>
          )}
        </div>
 <div className="col-12 col-md-12 mb-3">
          <TextFieldCell
            id="slCode"
            name="slCode"
            label="Plant Code"
            placeholder=""
            value={slCode}
            maxLength={100}
           onChange={handleChangeslcode}
           InputProps={{
            endAdornment: slCode && (
              <InputAdornment position="end">
                <Typography variant="body2" color="textSecondary">
                  {slCode?.length}/100
                </Typography>
              </InputAdornment>
            ),
          }}
          />
          {/* <div style={{ fontSize: "0.8em", color: "blue" }}>
            {uom.length}/100
          </div> */}
          {formik.errors.slCode && formik.touched.slCode && (
            <div className="error error-red" style={{ fontSize: "9px" }}>
              {formik.errors.slCode}
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
            onChange={(e) => setAddress(e?.target?.value)}
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
        </div>
        {/* <div className="row">
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
        </div> */}

      <div className="col-12 text-end">
          {!loading ? (
            <>
              <Button
                color="primary"
                variant="contained"
                size="medium"
                onClick={clearfilleduom}
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
                  rows={PlantList}
                  loading={gridloading}
                  columns={columns}
                  style={{height:"auto"}}
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
export default AddPrPlant;
