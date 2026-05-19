import React, { useState, useEffect } from "react";
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	IconButton,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import { Cookies, useCookies } from "react-cookie";
import { HiPencilAlt } from "react-icons/hi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { useFormik } from "formik";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { actionTypes, useStateValue } from "../../../store";
import NoRecordCell from "../../../components/NoRecordCell";
import {
	AddCondition,
	GetNFACondition,
	UpdateCondition,
} from "../../../utils/common/utility.js";

const AddCondition1 = (props) => {
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [conditionSrNo, setConditionSr] = useState("");
	const [conditionName, setConditionName] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
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

	const showCon1 = () => {
		props.selectedCon1();
	};

	useEffect(() => {
		//
		if (editRecordData && editRecordData?.id > 0) {
			prefilledDocument();
		}
	}, []);

	useEffect(() => {
		pullConditionList();
	}, [page]);

	const initialValues = {
		id: editRecordData?.id ? `${editRecordData?.id}` : 0,
		customerId: 1,
		conditionName: editRecordData?.conditionName
			? `${editRecordData?.conditionName}`
			: conditionName,
		conditionSrNo: editRecordData?.conditionSrNo
			? editRecordData?.conditionSrNo
			: conditionSrNo,
		isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
		createdBy: 1,
		createdon: "2023-11-04T10:12:25.905Z",
		updatedBy: 1,
		updatedOn: "2023-11-04T10:12:25.905Z",
	};

	const onSubmit = (values) => {
		var data = {
			id: editRecordData?.id ? editRecordData?.id : 0,
			customerId: 1,
			conditionName: conditionName,
			conditionSrNo: conditionSrNo,
			isActive: isActive,
		};
		setLoading(true);

		// api call to save data
		if (editRecordData?.id > 0) {
			UpdateCondition(data, editRecordData?.id, atoken).then((res) => {
				setLoading(false);
				pullConditionList();
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				clearfilledDocument();
				toast.success("Condition updated successfully!", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				showCon1();
				return true;
			});
		} else {
			AddCondition(data, atoken).then((res) => {
				setLoading(false);
				pullConditionList();
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });

				console.log("save", res);
				clearfilledDocument();
				toast.success("Condition added successfully!", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				showCon1();
				return true;
			});
		}
	};

	const validationSchema = yup.object({
		conditionSrNo: yup.string().required("Please Add ConditionSrNo"),
		conditionName: yup.string().required("Please Add Condtion"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues,
		onSubmit,
		validationSchema,
	});

	const prefilledDocument = () => {
		formik.setFieldValue("id", editRecordData?.id);
		setConditionSr(editRecordData?.conditionSrNo);
		setConditionName(editRecordData?.conditionName);
		setIsActive(editRecordData?.isActive);
	};

	const clearfilledDocument = () => {
		formik.setFieldValue("id", 0);
		setConditionSr("");
		setConditionName("");
		setIsActive(true);
	};

	const [cond1List, setCond1List] = useState([]);
	const pullConditionList = () => {
		var data = {
			CustomerId: customerid,
		};

		setLoading(true);
		GetNFACondition(data, atoken).then((res) => {
			setGridloading(true);
			console.log(res);
			if (res != "" && res != undefined) {
				setCond1List(res);
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
		setConditionSr(data.conditionSrNo);
		setConditionName(data.conditionName);
		setIsActive(data.isActive);
		seteditRecordData(data);
		setState({ ...state, addnewfield: true });
	}, []);

	const [gridloading, setGridloading] = useState(true);
	const columns = [
		{
			field: "conditionSrNo",
			headerName: "Condtion Sr.",
			width: 100,
		},
		{
			field: "conditionName",
			headerName: "Condtion",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: 200,
		},

		{
			field: "isActive",
			headerName: "Status",
			width: 100,
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
							<FormControl fullWidth>
								<TextField
									id="conditionSrNo"
									name="conditionSrNo"
									label="conditionSrNo *"
									placeholder=""
									variant="outlined"
									size="small"
									value={conditionSrNo}
									onChange={(e) => {
										setConditionSr(e?.target?.value);
									}}
								/>
								{formik.errors.conditionSrNo &&
									formik.touched.conditionSrNo && (
										<div
											className="error error-red"
											style={{ fontSize: "9px" }}
										>
											{formik.errors.conditionSrNo}
										</div>
									)}
							</FormControl>
						</div>
						<div className="col-12 mb-4 focus">
							<FormControl fullWidth>
								<TextField
									id="conditionName"
									name="conditionName"
									label="Condition *"
									placeholder=""
									variant="outlined"
									size="small"
									value={conditionName}
									onChange={(e) => {
										setConditionName(e?.target?.value);
									}}
								/>
								{formik.errors.conditionName &&
									formik.touched.conditionName && (
										<div
											className="error error-red"
											style={{ fontSize: "9px" }}
										>
											{formik.errors.conditionName}
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
									//value={isActive}
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

						<div className="col-12 text-end">
							{!loading ? (
								<Button
									color="success"
									variant="outlined"
									size="small"
									type="submit"
								>
									Submit
								</Button>
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
											rows={cond1List}
											loading={gridloading}
											columns={columns}
											autoHeight
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
										<div className="d-flex align-items-center"></div>
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

export default AddCondition1;
