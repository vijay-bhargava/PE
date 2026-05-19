import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	FormGroup,
	IconButton,
	InputLabel,
	FormHelperText,
	MenuItem,
	Select,
	Autocomplete, 
	InputAdornment, 
	Typography,
} from "@mui/material";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
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
import { FindItemCategory, getItemCategory, ItemCategoryAdd, UpdateItemCategory } from "../purchaseRequest";
import { BackButton } from "./component";

const AddPrItemCategory = ({handleCategoryList, isModal = false}) => {
const [{ atoken, rtoken, customerid, managerId }, dispatch] = useStateValue();
const [categoryDescription, setcategoryDescription] = useState("");
const [editRecordData, seteditRecordData] = useState(null);

const [loading, setLoading] = useState(false);
const [submitLoading, setSubmitLoading] = useState(false);
	const [isActive, setisActive] = useState(true);
	useEffect(() => {
		if (editRecordData) {
			prefilleduom();
		}
	}, []);

  useEffect(() => {
    pullitemList();
  }, []);

	const [state, setState] = useState({
		// Removed drawer state since we're using the new layout
	});

   const validationSchema = yup.object({
		categoryDescription : yup.string().required("Please enter item category"),

	});
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
      customerId: customerid,
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
     	categoryDescription: editRecordData?.categoryDescription ? editRecordData?.categoryDescription : categoryDescription,
		
		},
		 validationSchema: validationSchema,
		onSubmit: (values) => {
            
			setSubmitLoading(true);
			var data = {
				customerId: customerid,
				id: editRecordData?.id ? editRecordData?.id : 0,
				categoryDescription: categoryDescription,
				itemCategory: categoryDescription,
			};

			if (editRecordData?.id > 0) {
				// For update, ensure itemCategory is sent
				UpdateItemCategory(data, editRecordData?.id, atoken).then((res) => {
					setSubmitLoading(false);
                    pullitemList();
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduom();
					toast.success("Item Category updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});

       
					return true;
				}).catch((error) => {
					setSubmitLoading(false);
					console.error("Error updating item category:", error);
				});
			} else {
				// For add, ensure itemCategory is sent
				const addData = { ...values, itemCategory: values.categoryDescription };
				ItemCategoryAdd(addData, atoken).then((res) => {
					setSubmitLoading(false);
                    pullitemList();
          
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilleduom();

					toast.success("item Category added successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
			
         // handleRoleList();
					return true;
				})
        .catch((error) => {
          setSubmitLoading(false);
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
          
        });
       }
          }, 
        });

	const prefilleduom = () => {
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData?.id);
			setcategoryDescription(editRecordData?.categoryDescription);
			setisActive(editRecordData?.isActive);
		}
	};

	const clearfilleduom = () => {
		seteditRecordData(null);
		formik.setFieldValue("id", 0);
		setcategoryDescription("");
		setisActive(0);
	};

	const handleChangeCategory = (event) => {
		const { value } = event.target;
		setcategoryDescription(value);
	};

    const [itemCatAllList, setItemCatAllList] = useState([]);
  const pullitemList = () => {
    var data = {
        CustomerId: customerid,
    };
    setLoading(true);
    FindItemCategory(data,atoken).then((res) => {
      setGridloading(true);
      if (res != "" && res != undefined) {
        setItemCatAllList(res);
        setGridloading(false); 
       if (typeof handleCategoryList === 'function') handleCategoryList(res);
      }
      setLoading(false);
      setGridloading(false);
    }).catch((error) => {
      console.error("Error fetching item categories:", error);
      setLoading(false);
      setGridloading(false);
    });
  }; 
 
  const callbackedit = useCallback((data) => {
    setcategoryDescription(data?.categoryDescription);
    seteditRecordData(data);
  }, []);

  const [gridloading, setGridloading] = useState(false);
  const columns = [
    {
      field: "categoryDescription",
      headerName: "Item Category",
      minWidth: 200,
      renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ),
    }, 
    {
      field: "action",
      headerName: "Action",
      minWidth: 100,
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
	return (
		<>
			<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
				{/* Header with BackButton - only show when not in modal */}
				{!isModal && (
					<div className="d-flex justify-content-between align-items-center  mb-3">
						<div className="d-flex align-items-center">
							<BackButton title={<span className="page-heading">Manage Category</span>} />
						</div>
					</div>
				)}

				{/* Main Content */}
				<div className="flex-grow-1 overflow-auto">
					<div className="p-3 pt-0">
						<form onSubmit={formik.handleSubmit} autoComplete="off">
							<div className="row panelbox mt-2">						
								<div className="col-12 col-md-4 me-0 focus">
									<TextFieldCell
										id="categoryDescription"
										name="categoryDescription"
										label="Item Category*"
										placeholder=""
										value={categoryDescription}
										maxLength={100}
										onChange={handleChangeCategory}
										InputProps={{
											endAdornment: categoryDescription && (
												<InputAdornment position="end">
													<Typography variant="body2" color="textSecondary">
														{categoryDescription?.length}/100
													</Typography>
												</InputAdornment>
											),
										}}
									/>
									{formik.errors.categoryDescription && formik.touched.categoryDescription && (
										<div className="error error-red" style={{ fontSize: "9px" }}>
											{formik.errors.categoryDescription}
										</div>
									)}
								</div>

								<div className="col-12 col-md-4 d-flex align-items-end gap-2">
									{!submitLoading ? (
										<>
											<Button
												color="primary"
												variant="contained"
												size="medium"
												onClick={clearfilleduom}
											>
												Reset
											</Button>
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
					
						<div style={{ height: '300px', width: '100%' }}>
							<DataGrid
								getRowId={getRowId}
								rows={itemCatAllList}
								loading={gridloading}
								columns={columns}
								disableDensitySelector
								disableColumnMenu
								disableColumnSelector
								rowHeight={35}
								getRowClassName={(params) =>
									params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
								}											
								autosizeOptions={{
									columns: ['Item Category', 'Action'],
									includeOutliers: true,
									includeHeaders: true,
								}}
								columnHeaderHeight={35}
								className="f13 bg-white data-grid-scrollable"
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
                }
export default AddPrItemCategory;
