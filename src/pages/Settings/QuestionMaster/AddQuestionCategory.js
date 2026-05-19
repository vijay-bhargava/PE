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
} from "@mui/material";
import { useCallback } from "react";
import { HiPencilAlt } from "react-icons/hi";
import { LoadingButton } from "@mui/lab";
import { useCookies } from "react-cookie";
import CryptoJS from 'crypto-js';
import TextFieldCell from "../../BaseCells/TextFieldCell";
import * as yup from "yup";
import { useFormik } from "formik";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ApiClient,api } from "../../../Apiclient";
import { actionTypes, useStateValue } from "../../../store";
import {
	AddCategory,
	UpdateCategory,
	CategoryFindAll,
} from "../../../utils/questionlibrary";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMenuMaster } from "../../../utils/common/utility";
import { isTokenExpired } from "../../../utils/common";

const AddQuestionCategory = (props) => {
	
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
 
  const apiClient = new ApiClient(api);
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
	const [questioncategory, setQuestionCategory] = useState("");
	const [isActive, setIsactive] = useState(true);
	const [applyeventtype, setapplyeventtype] = useState("");
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [page, setPage] = useState(1);
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const handleChange = (event, value) => {
		setPage(value);
	};

	const [state, setState] = useState({
		right: false,
		viewTicketSidebar: false,
		rightLog: false,
	});

	useEffect(() => {
		//
		if (editRecordData && editRecordData?.id > 0) {
			prefilledDocument();
		}
	}, []);

	useEffect(() => {
		pullCategoryList();
	}, [page]);
	const showCat = () => {
		props.selectedCat();
	};

	const initialValues = {
		id: editRecordData?.id ? `${editRecordData?.id}` : 0,
		customerId: customerid,
		questioncategory: editRecordData?.questioncategory
			? `${editRecordData?.questioncategory}`
			: questioncategory,
		isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		//libraryId: props.libraryid || libraryid,
	};

	// const onSubmit = (values) => {
	// 	var data = {
	// 		id: editRecordData?.id ? editRecordData?.id : 0,
	// 		customerId: customerid,
	// 		questioncategory: questioncategory,
	// 		libraryId: props.libraryid ,
	// 		isActive: isActive,
	// 	};
	// 	setLoading(true);

	// 	console.log("values", values);
	// 	if (editRecordData?.id > 0) {
	// 		// Update operation
	// 		const isTokenExpired = await updateToken(); // Token check if needed
	// 		const res = await apiClient.put(`api/QCategory/Update`, data, atoken); // Use API endpoint for update
	// 		if (res) {
	// 		  pullCategoryList(); // Refresh category list after update
	// 		  dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
	// 		  dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
	// 		  dispatch({ type: actionTypes.SET_MSGALERT, value: true });
	// 		  toast.success("Category updated successfully!", { toastId: "UserCategory" });
	// 		  showCat(); // Handle UI change or redirection if needed
	// 		}
	// 	  } else {
	// 		// Add operation
	// 		const isTokenExpired = await updateToken(); // Token check if needed
	// 		const res = await apiClient.post(`api/QCategory/Add`, data, atoken); // Use API endpoint for add
	// 		if (res) {
	// 		  pullCategoryList(); // Refresh category list after adding
	// 		  dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
	// 		  dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
	// 		  dispatch({ type: actionTypes.SET_MSGALERT, value: true });
	// 		  toast.success("Category added successfully!", { toastId: "UserCategoryadded" });
	// 		  showCat(); // Handle UI change or redirection if needed
	// 		}
	// 	  }
	  
	// 	  setLoading(false); // Stop loading state after operation
	// 	},
	//   });
		// api call to save data
	// 	if (editRecordData?.id > 0) {
	// 		UpdateCategory(data, editRecordData?.id, atoken).then((res) => {
	// 			setLoading(false);
	// 			pullCategoryList();
	// 			dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
	// 			dispatch({
	// 				type: actionTypes.SET_MSGALERTDATA,
	// 				value: res?.data?.message,
	// 			});
	// 			dispatch({ type: actionTypes.SET_MSGALERT, value: true });
	// 			clearfilledDocument();
	// 			toast.success("Category updated successfully!", {
	// 				 toastId: "UserCategory"
	// 			});
	// 			showCat();
	// 			return true;
	// 		});
	// 	} else {
	// 		AddCategory(data, atoken).then((res) => {
	// 			setLoading(false);
	// 			pullCategoryList();
	// 			dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
	// 			dispatch({
	// 				type: actionTypes.SET_MSGALERTDATA,
	// 				value: res?.data?.message,
	// 			});
	// 			dispatch({ type: actionTypes.SET_MSGALERT, value: true });
	// 			console.log("save", res);
	// 			clearfilledDocument();
	// 			toast.success("Category added successfully!", {
	// 				 toastId: "UserCategoryadded"
	// 			});
	// 			showCat();
	// 			return true;
	// 		});
	// 	}
	// };
	const onSubmit = async (values) => {
		var data = {
		  id: editRecordData?.id ? editRecordData?.id : 0,
		  customerId: customerid,
		  questioncategory: questioncategory,
		  libraryId: props.libraryid,
		  isActive: isActive,
		};
	  
		setLoading(true);
		console.log("values", values);
	  
		if (editRecordData?.id > 0) {
		  // Update operation
		  const isTokenExpired = await updateToken(); // Token check if needed
		  const res = await apiClient.post(`api/QCategory/Update`, data, atoken); // Use API endpoint for update
		  if (res) {
			pullCategoryList(); // Refresh category list after update 
			dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
			dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
			dispatch({ type: actionTypes.SET_MSGALERT, value: true });
			clearfilledDocument();
			toast.success("Category updated successfully!", { toastId: "UserCategory" });
			showCat(); // Handle UI change or redirection if needed
		  }
		} else {
		  // Add operation
		  const isTokenExpired = await updateToken(); // Token check if needed
		  const res = await apiClient.post(`api/QCategory/Add`, data, atoken); // Use API endpoint for add
		  if (res) {
			pullCategoryList(); // Refresh category list after adding
			dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
			dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
			dispatch({ type: actionTypes.SET_MSGALERT, value: true });
			clearfilledDocument();
			toast.success("Category added successfully!", { toastId: "UserCategoryadded" });
			showCat(); // Handle UI change or redirection if needed
		  }
		}
	  
		setLoading(false); // Stop loading state after operation
	  };
	  
	const validationSchema = yup.object({
		questioncategory: yup.string().required("Please Enter  Category"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues,
		onSubmit,
		validationSchema,
	});

	console.log("form values: ", formik.errors);

	const prefilledDocument = () => {
		formik.setFieldValue("id", editRecordData?.id);
		setQuestionCategory(editRecordData?.questioncategory);
		setapplyeventtype(editRecordData?.applyeventtype);
		setIsactive(editRecordData?.isActive);
	};

	const clearfilledDocument = () => {
		seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setQuestionCategory("");
		setapplyeventtype("");
	};

	const [CategoryList, setCategoryList] = useState([]);
	// const pullCategoryList = () => {
	// 	var data = {
	// 		CustomerId: customerid,
	// 		SortingColumn: "Id",
	// 	};

	// 	setLoading(true);
	// 	CategoryFindAll(data, atoken).then((res) => {
	// 		setGridloading(true);
	// 		if (res != "" && res != undefined) {
	// 			setCategoryList(res);
	// 			setTotalRecords(res[0]?.totalrecords);
	// 			setPageCount(Math.ceil(res[0]?.totalrecords / 10));
	// 		}
	// 		setLoading(false);
	// 		setGridloading(false);
	// 	});
	// };
	// const pullCategoryList = async () => {
	// 	;
	// 	const isTokenExpired = await updateToken();
	// 	const SortingColumn = "Id";
	// 	const res = await apiClient.get(
	// 		`/api/QCategory/Find/${customerid}/?SortingColumn=${SortingColumn}`,
	// 		atoken
	// 	);
	// 	if (res) {
	// 		setCategoryList(res);
	// setTotalRecords(res[0]?.totalrecords);
	// 			setPageCount(Math.ceil(res[0]?.totalrecords / 10));
	// 	}
	// 	setGridloading(false);
	// };

	const pullCategoryList = async () => {
		;
		const isTokenExpired = await updateToken();
		const SortingColumn = "Id";
		
	
		;
		// Correctly passing the token in the headers
		const res = await apiClient.get(
			`api/QCategory/Find?CustomerId=${customerid}&SortingColumn=${SortingColumn}`,
			atoken
		);
		
		if (res) {
			setCategoryList(res?.result);
			setTotalRecords(res[0]?.totalrecords);
			setPageCount(Math.ceil(res[0]?.totalrecords / 10));
		}
		
		setGridloading(false);
	};
	

	const callbackedit = useCallback((data) => {
		setQuestionCategory(data.questioncategory);
		setIsactive(data.isActive);
		seteditRecordData(data);
		setState({ ...state, addnewfield: true });
	}, []);

	useEffect(() => {
		pullMenuMaster();
	}, []);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			console.log(res);
			setMenuMasterList(res);
		});
	};

	const onchangeEventType = (event) => {
		setapplyeventtype(event.target.value);
	};
	const getMenuItemName = (MenuItemCode) => {
		const MenuItem = MenuMasterList.find(
			(data) => data?.menuIdentity === MenuItemCode
		);
		return MenuItem ? MenuItem.menuName : "";
	};
	const [gridloading, setGridloading] = useState(true);
	const columns = [
		{
			field: "questioncategory",
			headerName: "Category Name ",
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
									id="questioncategory"
									name="questioncategory"
									label="Category "
									placeholder=""
									value={questioncategory}
									onChange={(e) => {
										setQuestionCategory(e?.target?.value);
									}}
									maxLength={50}
									InputProps={{
										endAdornment: questioncategory && (
										  <InputAdornment position="end">
											<Typography variant="body2" color="textSecondary">
											  {questioncategory.length}/50
											</Typography>
										  </InputAdornment>
										),
									  }}
								/>
								{formik.errors.questioncategory &&
									formik.touched.questioncategory && (
										<div
											className="error error-red"
											style={{ fontSize: "9px" }}
										>
											{formik.errors.questioncategory}
										</div>
									)}
							</FormControl>
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
										variant="contained"
											
										size="medium"
									
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
				</form>

				<div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
					<div className="d-flex flex-column min-vh-50">
						<div className="flex-grow-1 p-2">
							<div className="container-fluid">
								<div className="row">
									<div className="col-12 mb-3">
										<DataGrid
											getRowId={getRowId}
											rows={CategoryList}
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

export default AddQuestionCategory;
