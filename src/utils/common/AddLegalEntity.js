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
import { AddUom, LegalEntityAdd, LegalEntityUpdate, UpdateUom, getUomList, getUserDepartment } from "./utility";
import { FindItemCategory, getItemCategory, ItemCategoryAdd, UpdateItemCategory } from "../purchaseRequest";

const AddLegalEntity = ({handleLegalEntityList}) => {
const [{ atoken, rtoken, customerid, managerId }, dispatch] = useStateValue();
const [name, setname] = useState("");
const [description, setdescription] = useState("");
const [editRecordData, seteditRecordData] = useState(null);

const [loading, setLoading] = useState(false);
	const [isActive, setisActive] = useState(true);
  const [address, setAddress] = useState("");
const [pan, setPan] = useState("");
const [gst, setGst] = useState("");
  useEffect(() => {
    // When editRecordData is updated (e.g. user clicked edit), prefill the form
    if (editRecordData) {
      prefilledLegal();
    }
  }, [editRecordData]);

  useEffect(() => {
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
   const validationSchema = yup.object({
		name : yup.string().required("Please enter Legal Entity"),

	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
  customerId: customerid,
  id: editRecordData?.id ? `${editRecordData?.id}` : 0,
  name: editRecordData?.name || "",
  description: editRecordData?.description || "",
  address: editRecordData?.address || "",
  pan: editRecordData?.pan || "",
  gst: editRecordData?.gst || "",
  isActive: editRecordData?.isActive ?? true,
},
		 validationSchema: validationSchema,
		onSubmit: (values) => {
            setLoading(true);      
			var data = {
        customerId: customerid,
				id: editRecordData?.id ? editRecordData?.id : 0,
				name: values.name,
				description: values.description,
        address: values.address,
        pan: values.pan,
        gst: values.gst,
        isActive: values.isActive
			};

			if (editRecordData?.id > 0) {
				LegalEntityUpdate(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);
          PullLegalEntity();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduom();
					toast.success("Legal Entity updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});

       
					return true;
				});
			} else {
				LegalEntityAdd(values, atoken).then((res) => {
					setLoading(false);
          PullLegalEntity();
          
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduom();

					toast.success("Legal Entity added successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
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
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1000,
            });
          }
          
        });
       }
          }, 
        });
        const callbackedit = useCallback((data) => {
          setname(data?.name);
          setdescription(data?.description);
          setisActive(data?.isActive);
          seteditRecordData(data);
          setState({ ...state, addnewfield: true });
        }, []);
      
const prefilledLegal = () => {
  if (editRecordData) {
    formik.setFieldValue("id", editRecordData?.id);
    formik.setFieldValue("name", editRecordData?.name || "");
    formik.setFieldValue("description", editRecordData?.description || "");
    formik.setFieldValue("address", editRecordData?.address || "");
    formik.setFieldValue("pan", editRecordData?.pan || "");
    formik.setFieldValue("gst", editRecordData?.gst || "");
    formik.setFieldValue("isActive", editRecordData?.isActive ?? true);
    setname(editRecordData?.name);
    setdescription(editRecordData?.description);
    setAddress(editRecordData?.address);
    setPan(editRecordData?.pan);
    setGst(editRecordData?.gst);
    setisActive(editRecordData?.isActive);
  }
};

const clearfilleduom = () => {
  seteditRecordData([]);
  setname("");
  setdescription("");
  setAddress("");
  setPan("");
  setGst("");
  setisActive(true);
  formik.resetForm();
};
  
 const ResetLegal = () => {
  seteditRecordData([]);
  setname("");
  setdescription("");
  setAddress("");
  setPan("");
  setGst("");
  setisActive(true);
  formik.resetForm();
};
  const handledescChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/'/g, "");
		formik?.setFieldValue("description", sanitizedInput);
		setdescription(sanitizedInput);
	};

	const handleChangeCategory = (event) => {
		const { value } = event.target;
		setname(value);
		formik.setFieldValue("name", value);
	};
    const [legalEntityList, setlegalEntityList] = useState([]);
    const [UserDepartment, setUserDepartment] = useState([]);
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
          handleLegalEntityList(res);
       
        }
        setLoading(false);
        setGridloading(false);
      });
    };
   
//   const callbackedit = useCallback((data) => {
//     setcategoryDescription(data?.categoryDescription);
//     seteditRecordData(data);
//     setState({ ...state, addnewfield: true });
//   }, []);

  const [gridloading, setGridloading] = useState(true);
  const columns = [
    {
      field: "name",
      headerName: "Legal Entity",
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
            label="Legal Entity*"
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
            {/* Address */}
<div className="col-12 col-md-12 mb-3">
  <TextFieldCell
    id="address"
    name="address"
    label="Address"
    value={address}
    multiline
    rows={2}
    onChange={(e) => {
      setAddress(e.target.value);
      formik.setFieldValue("address", e.target.value);
    }}
  />
</div>

{/* PAN */}
<div className="col-12 col-md-6 mb-3">
  <TextFieldCell
    id="pan"
    name="pan"
    label="PAN"
    value={pan}
    maxLength={10}
    onChange={(e) => {
      const uppercaseValue = e.target.value.toUpperCase();
      setPan(uppercaseValue);
      formik.setFieldValue("pan", uppercaseValue);
    }}
  />
</div>

{/* GST */}
<div className="col-12 col-md-6 mb-3">
  <TextFieldCell
    id="gst"
    name="gst"
    label="GST"
    value={gst}
    maxLength={15}
    onChange={(e) => {
      const uppercaseValue = e.target.value.toUpperCase();
      setGst(uppercaseValue);
      formik.setFieldValue("gst", uppercaseValue);
    }}
  />
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
                    const checked = e?.target?.checked;
                    setisActive(checked);
                    formik.setFieldValue("isActive", checked);
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
                onClick={ResetLegal}
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
                  rows={legalEntityList}
                  loading={gridloading}
                  columns={columns}
                  autoHeight
                  rowHeight={35}
                  columnHeaderHeight={35}
                  style={{height:"auto"}}
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
export default AddLegalEntity;
