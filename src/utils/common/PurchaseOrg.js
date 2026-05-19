import React, { useState, useEffect } from "react";
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	IconButton,
	Typography,
	InputAdornment,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import * as yup from "yup";
import { useFormik } from "formik";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { ApiClient, api } from "../../Apiclient";
import { HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { AddPurcOrg, getPurchaseOrgList, UpdatePuchaseOrg } from "./utility";
import { actionTypes, useStateValue } from "../../store";
import { BackButton } from "./component";


const PurchaseOrg = (props) => {
	const [{ atoken, rtoken, customerid,customersuffix }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [orgGroupMsts, setorgGroupMsts] = useState([]);
	const [orgName, setorgName] = useState("");
	const [externalSourceCode, setexternalSourceCode] = useState("");
	const [address, setAddress] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [loading, setLoading] = useState(false);
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [page, setPage] = useState(1);
	const handleChange = (event, value) => {
		setPage(value);
	};

	const [state, setState] = useState({
		right: false,
		viewTicketSidebar: false,
		rightLog: false,
	});

	const showOPurOrg = () => {
		if (props.selectedPurOrg && typeof props.selectedPurOrg === 'function') {
			props.selectedPurOrg();
		}
	};

	useEffect(() => {
		if (editRecordData && editRecordData?.id > 0) {
			prefilledDocument();
		}
	}, []);

	useEffect(() => {
		pullOrgList();
	}, [page]);

	const initialValues = {
		id: editRecordData?.id ? `${editRecordData?.id}` : 0,
		customerid: customerid,
		orgName: editRecordData?.orgName ? `${editRecordData?.orgName}` : orgName,
		externalSourceCode: editRecordData?.externalSourceCode
			? editRecordData?.externalSourceCode
			: "",
		isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		orgGroupMsts: editRecordData?.orgGroupMsts
			? `${editRecordData?.orgGroupMsts}`
			: orgGroupMsts,
		address: editRecordData?.address ? editRecordData?.address : address,
	};

	const onSubmit = async (values) => {
		var data = {
			id: editRecordData?.id ? editRecordData?.id : 0,
			customerid: customerid,
			orgName: orgName,
			externalSourceCode: externalSourceCode,
			isActive: isActive,
			orgGroupMsts: orgGroupMsts,
			address: address,
		};
		setLoading(true);

		// api call to save data
		if (editRecordData?.id > 0) {
			UpdatePuchaseOrg(data, editRecordData?.id, atoken).then((res) => {
				setLoading(false);
				pullOrgList();
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				clearfilledDocument();
				toast.success("Organization  updated successfully!", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				showOPurOrg();
				return true;
			});
		} else {
			let data = {
				id: 0,
				customerId: values?.customerid,
				orgGroupMsts: values?.orgGroupMsts,
				orgName: orgName,
				externalSourceCode: externalSourceCode,
				isActive: isActive,
				address: address,
			};
			const res = await apiClient.postres("api/OrgMaster/Add",data,atoken)
			if(res){
				pullOrgList();
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });

				console.log("save", res);
				clearfilledDocument();
								toast.success("Organization added successfully!", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				return true;
			}
			setLoading(false);
		}
    
        };

	const validationSchema = yup.object({
		orgName: yup.string().required("Please enter Organization Name"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues,
		onSubmit,
		validationSchema,
	});

	const prefilledDocument = () => {
		formik.setFieldValue("id", editRecordData?.id);
		setorgName(editRecordData?.orgName);
		setexternalSourceCode(editRecordData?.externalSourceCode);
		setIsActive(editRecordData?.isActive);
		setAddress(editRecordData?.address ? editRecordData?.address : "");
	};

	const clearfilledDocument = () => {
		seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setorgName("");
		setexternalSourceCode("");
		setIsActive(true);
		setAddress("");
	};
	const resetDocument = () => {
		//;
		seteditRecordData([]);
		setorgName("");
		setexternalSourceCode("");
		setIsActive(true);
		setAddress("");
	  };
	const [orgList, setOrgList] = useState([]);
	const pullOrgList = () => {
		var data = {
			CustomerId: customerid,
			SortingColumn: "Id"
		};

		setLoading(true);
		getPurchaseOrgList(data, atoken).then((res) => {
			setGridloading(true);
			console.log(res);
			if (res != "" && res != undefined) {
				setOrgList(res);
				let records =
					res[0]?.totalrecords != undefined ? res[0]?.totalrecords : 10;
				setTotalRecords(records);
				setPageCount(Math.ceil(records / 10));
			}
			setLoading(false);
			setGridloading(false);
		});
	};

	const callbackedit = useCallback((data) => {
		setorgName(data?.orgName);
		setIsActive(data?.isActive);
		setAddress(data?.address || "");
		seteditRecordData(data);
		setState({ ...state, addnewfield: true });
	}, [state]);
	const [gridloading, setGridloading] = useState(true);
	const columns = [
		{
			field: "orgName",
			headerName: "Organization Name ",
			minWidth: 200,
		},

		{
			field: "isActive",
			headerName: "Status",
			minWidth: 100,
			renderCell: (params) => (params.formattedValue ? "Active" : "InActive"),
		},
		{
			field: "action",
			headerName: "Action",
			// width: 80,
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
			<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
				{/* Header with BackButton */}
				{!props.isModal && (
					<div className="d-flex justify-content-between align-items-center  mb-3">
						<div className="d-flex align-items-center">
							<BackButton title={<span className="page-heading">Purchase Organization</span>} />
						</div>
					</div>
				)}

				{/* Main Content */}
				<div className="flex-grow-1 overflow-auto">
					<div className="p-3 pt-0">
						<form onSubmit={formik.handleSubmit} autoComplete="off">
							<div className="row panelbox mt-2">						
						<div className="col-12 col-md-4 me-0 focus">
							<FormControl fullWidth>
								<TextField
									id="orgName"
									name="orgName"
									label="Organization Name *"
									placeholder=""
									variant="outlined"
									size="small"
									value={orgName}
									onChange={(e) => {
										setorgName(e?.target?.value);
									}}
									// className="me-2"
									inputProps={{ maxLength: 100 }}
									className="me-0"
									InputProps={{
										endAdornment: orgName && (
											<InputAdornment position="end">
												<Typography
													variant="body2"
													color="textSecondary"
												>
													{
														orgName?.length
													}
													/100
												</Typography>
											</InputAdornment>
										),
									}}

								/>
								{formik.errors.orgName && formik.touched.orgName && (
									<div className="error error-red" style={{ fontSize: "9px" }}>
										{formik.errors.orgName}
									</div>
								)}
							</FormControl>
						</div>
					<div className="col-12 col-md-3 mb-3">
							<FormControl fullWidth>
								<TextField
									id="address"
									name="address"
									label="Address"
									placeholder=""
									variant="outlined"
									size="small"
									value={address}
									onChange={(e) => setAddress(e?.target?.value)}
									inputProps={{ maxLength: 200 }}
									className="me-0"
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
							</FormControl>
						</div>
						<div className="col-12 col-md-2 me-0">
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
										//
										setIsActive(e?.target?.value);
									}}
								>
									<MenuItem value={true}>Active</MenuItem>
									<MenuItem value={false}>InActive</MenuItem>
								</Select>
							</FormControl>
						</div>
					<div className="col-12 col-md-3 text-start">
  {!loading ? (
    <div className="d-flex align-items-center gap-2 flex-nowrap">
      <Button
        color="primary"
        variant="contained"
        size="medium"
        onClick={resetDocument}
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
    </div>
  ) : (
    <LoadingButton loading variant="contained">
      Submit ...
    </LoadingButton>
  )}
</div>


						{/* <div className="col-12 col-md-2 text-start">
							{!loading ? (
								<>
									<Button
										color="primary"
										variant="contained"
										size="medium"
										onClick={resetDocument}
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
						</div> */}
					</div>
				</form>
					
				{/* <div className="section-heading mb-3 mt-4">Organization List</div> */}
				<div style={{ height: '300px', width: '100%' }}>
					<DataGrid
						getRowId={getRowId}
						rows={orgList}
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
							columns: ['Organization Name', 'status', 'Action'],
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
};

export default PurchaseOrg;
