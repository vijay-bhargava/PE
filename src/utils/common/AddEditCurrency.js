import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Typography,
} from "@mui/material";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell";
import { LoadingButton } from "@mui/lab";
import { HiPencilAlt } from "react-icons/hi";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue } from "../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiClient } from "../../Apiclient";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import "../../assets/css/base.css";

const AddEditCurrency = ({ handleCurrencyList }) => {
	const [{ atoken, customerid, customersuffix }] = useStateValue();
	const apiClient = new ApiClient(customersuffix);

	const [currencyNm, setCurrencyNm] = useState("");
	const [editRecordData, setEditRecordData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [gridloading, setGridloading] = useState(true);
	const [isActive, setIsActive] = useState(true);
	const [currencyList, setCurrencyList] = useState([]);

	useEffect(() => {
		pullCurrencyList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const validationSchema = yup.object({
		currencyNm: yup.string().required("Please Enter Currency"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
			currencyNm: editRecordData?.currencyNm ? editRecordData?.currencyNm : currencyNm,
			isActive: editRecordData?.isActive !== undefined ? editRecordData?.isActive : true,
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			if (!values.currencyNm) {
				toast.error("Please enter Currency.", { toastId: "currencyerr" });
				return;
			}

			setLoading(true);

			const data = {
				id: editRecordData?.id ? editRecordData?.id : 0,
				currencyNm: values?.currencyNm,
				isActive: isActive,
				customerId: parseInt(customerid) || 0,
			};

			try {
				if (editRecordData?.id > 0) {
					const res = await apiClient.postres("/api/Currency/Update", data, atoken);
					if (res) {
						toast.success("Currency updated successfully!", {
							position: toast.POSITION.TOP_CENTER,
							autoClose: 1000,
						});
						clearForm();
						pullCurrencyList();
					}
				} else {
					const res = await apiClient.postres("/api/Currency/Add", data, atoken);
					if (res) {
						toast.success("Currency added successfully!", {
							position: toast.POSITION.TOP_CENTER,
							autoClose: 1000,
						});
						clearForm();
						pullCurrencyList();
					}
				}
			} catch (error) {
				console.error("Currency operation error:", error);
				toast.error("Operation failed. Please try again.", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
			} finally {
				setLoading(false);
			}
		},
	});

	const pullCurrencyList = async () => {
		setGridloading(true);
		try {
			const res = await apiClient.get(`/api/Currency/Find?IsActive=true`, atoken);
			
			if (res && res.result) {
				setCurrencyList(res.result);
				if (typeof handleCurrencyList === "function") {
					handleCurrencyList(res.result);
				}
			} else if (Array.isArray(res)) {
				setCurrencyList(res);
				if (typeof handleCurrencyList === "function") {
					handleCurrencyList(res);
				}
			}
		} catch (error) {
			console.error("Error fetching currency list:", error);
		} finally {
			setGridloading(false);
		}
	};

	const handleChangeCurrency = (event) => {
		const { value } = event.target;
		const sanitizedValue = value
			.replace(/<script.*?>.*?<\/script>/gi, "")
			.replace(/<.*?>/g, "");
		setCurrencyNm(sanitizedValue);
		formik.setFieldValue("currencyNm", sanitizedValue);
	};

	const callbackedit = useCallback((data) => {
		setCurrencyNm(data.currencyNm);
		setIsActive(data.isActive);
		setEditRecordData(data);
	}, []);

	const clearForm = () => {
		setEditRecordData(null);
		setCurrencyNm("");
		setIsActive(true);
		formik.resetForm();
	};

	const ResetForm = () => {
		setCurrencyNm("");
		setIsActive(true);
	};

	const columns = [
		{
			field: "currencyNm",
			headerName: "Currency",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: 200,
		},
		{
			field: "isActive",
			headerName: "Status",
			width: 180,
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

	return (
		<>
			<div className="d-flex flex-row">
				<form onSubmit={formik.handleSubmit} autoComplete="off">
					<div className="row mt-4">
						<div className="col-12 col-md-12 mb-3">
							<TextFieldCell
								id="currencyNm"
								name="currencyNm"
								label="Currency *"
								placeholder=""
								value={currencyNm}
								maxLength={100}
								onChange={handleChangeCurrency}
								InputProps={{
									endAdornment: currencyNm && (
										<InputAdornment position="end">
											<Typography variant="body2" color="textSecondary">
												{currencyNm.length}/100
											</Typography>
										</InputAdornment>
									),
								}}
							/>
							{formik.errors.currencyNm && formik.touched.currencyNm && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik.errors.currencyNm}
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
												setIsActive(e?.target?.checked);
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
										onClick={ResetForm}
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
									<div className="col-12 mb-3" style={{ height: "55vh" }}>
										<DataGrid
											getRowId={getRowId}
											rows={currencyList}
											loading={gridloading}
											columns={columns}
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
									<div className="pagination_wrapper mb-2 mt-2">
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

export default AddEditCurrency;
