import React, { useState, useEffect, useCallback } from "react";
import {
	FormControl,
	InputAdornment,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue } from "../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiClient } from "../../Apiclient";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";
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
	}, []);

	const validationSchema = yup.object({
		currencyNm: yup.string().required("Please Enter Currency"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ?? 0,
			currencyNm: editRecordData?.currencyNm ?? currencyNm,
			isActive: editRecordData?.isActive !== undefined ? editRecordData.isActive : true,
		},
		validationSchema,
		onSubmit: async (values) => {
			if (!values.currencyNm) {
				toast.error("Please enter Currency.", { toastId: "currencyerr" });
				return;
			}
			setLoading(true);
			const data = {
				id: editRecordData?.id ?? 0,
				currencyNm: values.currencyNm,
				isActive,
				customerId: parseInt(customerid) || 0,
			};
			try {
				if (editRecordData?.id > 0) {
					const res = await apiClient.postres("/api/Currency/Update", data, atoken);
					if (res) {
						toast.success("Currency updated successfully!");
						clearForm();
						pullCurrencyList();
					}
				} else {
					const res = await apiClient.postres("/api/Currency/Add", data, atoken);
					if (res) {
						toast.success("Currency added successfully!");
						clearForm();
						pullCurrencyList();
					}
				}
			} catch (error) {
				console.error("Currency operation error:", error);
				toast.error("Operation failed. Please try again.");
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
				if (typeof handleCurrencyList === "function") handleCurrencyList(res.result);
			} else if (Array.isArray(res)) {
				setCurrencyList(res);
				if (typeof handleCurrencyList === "function") handleCurrencyList(res);
			}
		} catch (error) {
			console.error("Error fetching currency list:", error);
		} finally {
			setGridloading(false);
		}
	};

	const handleChangeCurrency = (event) => {
		const value = event.target.value
			.replace(/<script.*?>.*?<\/script>/gi, "")
			.replace(/<.*?>/g, "");
		setCurrencyNm(value);
		formik.setFieldValue("currencyNm", value);
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

	const getRowId = (row) => row.id;

	const columns = [
		{
			field: "currencyNm",
			headerName: "Currency",
			flex: 1,
			renderCell: (params) => <div>{params.formattedValue}</div>,
		},
		{
			field: "isActive",
			headerName: "Status",
			width: 250,
			renderCell: (params) => (
				<span style={{
					color: params.value ? "var(--pe-success, #49a052)" : "var(--pe-danger, #b8232f)",
					fontWeight: 500,
					fontSize: 12,
				}}>
					{params.value ? "Active" : "Inactive"}
				</span>
			),
		},
		{
			field: "action",
			headerName: "Actions",
			width: 200,
			sortable: false,
			renderCell: (params) => (
				<MfpEditBtn onClick={() => callbackedit(params.row)} />
			),
		},
	];

	return (
		<div className="flex-grow-1" style={{ minHeight: 0 }}>
			<MasterFormPanel
				title="Currency"
				isModal={true}
				onReset={clearForm}
				onSubmit={formik.handleSubmit}
				loading={loading}
				columns={columns}
				rows={currencyList}
				gridLoading={gridloading}
				getRowId={getRowId}
			>
				<div className="mfp-field mfp-field--md">
					<label className="pe-field-label">
						Currency <span className="rfq-required-star">*</span>
					</label>
					<TextField
						id="currencyNm"
						name="currencyNm"
						variant="outlined"
						size="small"
						fullWidth
						placeholder="Enter Currency"
						value={currencyNm}
						onChange={handleChangeCurrency}
						inputProps={{ maxLength: 100 }}
						InputProps={{
							endAdornment: currencyNm ? (
								<InputAdornment position="end">
									<Typography variant="caption" color="textSecondary">
										{currencyNm.length}/100
									</Typography>
								</InputAdornment>
							) : null,
						}}
					/>
					{formik.errors.currencyNm && formik.touched.currencyNm && (
						<div className="error error-red" style={{ fontSize: "9px" }}>
							{formik.errors.currencyNm}
						</div>
					)}
				</div>

				<div className="mfp-field mfp-field--sm">
					<label className="pe-field-label">Status</label>
					<FormControl fullWidth size="small">
						<Select
							variant="outlined"
							size="small"
							value={isActive}
							onChange={(e) => setIsActive(e.target.value)}
						>
							<MenuItem value={true}>Active</MenuItem>
							<MenuItem value={false}>Inactive</MenuItem>
						</Select>
					</FormControl>
				</div>
			</MasterFormPanel>
		</div>
	);
};

export default AddEditCurrency;
