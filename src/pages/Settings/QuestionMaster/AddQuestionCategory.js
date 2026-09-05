import React, { useState, useEffect, useCallback } from "react";
import { MenuItem, Select, InputAdornment, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useCookies } from "react-cookie";
import CryptoJS from "crypto-js";
import { HiPencilAlt } from "react-icons/hi";
import { useStateValue, actionTypes } from "../../../store";
import { ApiClient, api } from "../../../Apiclient";
import { toast } from "react-toastify";
import { isTokenExpired } from "../../../utils/common";
import MasterFormPanel, { MfpEditBtn } from "../../../components/MasterFormPanel/MasterFormPanel";
import "../../../assets/css/base.css";
import "../../../assets/css/design-system.css";

const AddQuestionCategory = ({ selectedCat, libraryid }) => {
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const apiClient = new ApiClient(api);
	const [cookie, setCookie] = useCookies(["patkn", "prtkn"]);
	const [loading, setLoading] = useState(false);
	const [gridloading, setGridloading] = useState(true);
	const [CategoryList, setCategoryList] = useState([]);
	const [questioncategory, setQuestionCategory] = useState("");
	const [isActive, setIsactive] = useState(true);
	const [editRecordData, seteditRecordData] = useState(null);

	const updateToken = async () => {
		const res = await isTokenExpired(atoken, rtoken, customerid);
		if (res) {
			if (res?.accessToken) {
				dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
				setCookie("patkn", CryptoJS.AES.encrypt(`${res.accessToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(), { path: "/", maxAge: 86400 });
			}
			if (res?.refreshToken) {
				dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
				setCookie("prtkn", CryptoJS.AES.encrypt(`${res.refreshToken}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(), { path: "/", maxAge: 86400 });
			}
			return true;
		}
		return false;
	};

	const pullCategoryList = async () => {
		await updateToken();
		const res = await apiClient.get(`api/QCategory/Find?CustomerId=${customerid}&SortingColumn=Id`, atoken);
		if (res) setCategoryList(res?.result || []);
		setGridloading(false);
	};

	useEffect(() => { pullCategoryList(); }, []);

	const clearfilledDocument = () => {
		seteditRecordData(null);
		setQuestionCategory("");
		setIsactive(true);
		formik.resetForm();
	};

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ?? 0,
			questioncategory: editRecordData?.questioncategory ?? "",
			isActive: editRecordData?.isActive ?? true,
		},
		validationSchema: yup.object({
			questioncategory: yup.string().required("Please enter Category"),
		}),
		onSubmit: async () => {
			const data = {
				id: editRecordData?.id ?? 0,
				customerId: customerid,
				questioncategory,
				libraryId: libraryid,
				isActive,
			};
			setLoading(true);
			await updateToken();
			const endpoint = editRecordData?.id > 0 ? "api/QCategory/Update" : "api/QCategory/Add";
			const res = await apiClient.post(endpoint, data, atoken);
			if (res) {
				pullCategoryList();
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				clearfilledDocument();
				toast.success(editRecordData?.id > 0 ? "Category updated successfully!" : "Category added successfully!", { toastId: "cat-save" });
				if (typeof selectedCat === "function") selectedCat();
			}
			setLoading(false);
		},
	});

	const callbackedit = useCallback((data) => {
		seteditRecordData(data);
		setQuestionCategory(data.questioncategory);
		setIsactive(data.isActive);
		formik.setFieldValue("questioncategory", data.questioncategory);
		formik.setFieldValue("isActive", data.isActive);
	}, []);

	const columns = [
		{ field: "questioncategory", headerName: "Category", flex: 1, minWidth: 140 },
		{
			field: "isActive", headerName: "Status", width: 100,
			renderCell: (params) => (
				<span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
					{params.value ? "Active" : "Inactive"}
				</span>
			),
		},
		{
			field: "action", headerName: "Action", width: 72, sortable: false,
			renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params.row)} />,
		},
	];

	return (
		<MasterFormPanel
			title="Manage Category"
			isModal
			onReset={clearfilledDocument}
			onSubmit={formik.handleSubmit}
			submitLabel={editRecordData?.id > 0 ? "Update" : "Submit"}
			loading={loading}
			columns={columns}
			rows={CategoryList}
			gridLoading={gridloading}
			getRowId={(row) => row.id}
		>
			<div className="mfp-field mfp-field--md">
				<label className="pe-field-label">Category <span className="rfq-required-star">*</span></label>
				<input
					className="f13"
					style={{ display: 'block', width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, outline: 'none' }}
					id="questioncategory"
					name="questioncategory"
					maxLength={50}
					value={questioncategory}
					onChange={(e) => { setQuestionCategory(e.target.value); formik.setFieldValue("questioncategory", e.target.value); }}
					placeholder="Enter category name"
				/>
				{formik.errors.questioncategory && formik.touched.questioncategory && (
					<div className="f11" style={{ color: "var(--pe-danger)" }}>{formik.errors.questioncategory}</div>
				)}
			</div>

			<div className="mfp-field mfp-field--sm">
				<label className="pe-field-label">Status</label>
				<Select fullWidth variant="outlined" size="small" value={isActive} onChange={(e) => setIsactive(e.target.value)}>
					<MenuItem value={true}>Active</MenuItem>
					<MenuItem value={false}>Inactive</MenuItem>
				</Select>
			</div>
		</MasterFormPanel>
	);
};

export default AddQuestionCategory;
