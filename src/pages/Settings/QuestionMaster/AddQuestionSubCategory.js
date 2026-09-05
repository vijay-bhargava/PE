import React, { useState, useEffect, useCallback } from "react";
import { MenuItem, Select, TextField, InputAdornment, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useCookies } from "react-cookie";
import CryptoJS from "crypto-js";
import { useStateValue, actionTypes } from "../../../store";
import { ApiClient, api } from "../../../Apiclient";
import { toast } from "react-toastify";
import { isTokenExpired } from "../../../utils/common";
import { CategoryFindAll } from "../../../utils/questionlibrary";
import MasterFormPanel, { MfpEditBtn } from "../../../components/MasterFormPanel/MasterFormPanel";
import "../../../assets/css/base.css";
import "../../../assets/css/design-system.css";

const AddQuestionSubCategory = ({ selectedSubCat, catId }) => {
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const apiClient = new ApiClient(api);
	const [cookie, setCookie] = useCookies(["patkn", "prtkn"]);
	const [loading, setLoading] = useState(false);
	const [gridloading, setGridloading] = useState(true);
	const [SubCategoryList, setSubCategoryList] = useState([]);
	const [catAllList, setCatAllList] = useState([]);
	const [questioncategoryid, setQuestionCategoryId] = useState(0);
	const [questioncategory, Setquestioncategory] = useState("");
	const [questionsubcategory, setQuestionSubCategory] = useState("");
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

	const pullSubCategoryList = async () => {
		await updateToken();
		const res = await apiClient.get(`api/QSubCategory/Find?CustomerId=${customerid}&SortingColumn=Id`, atoken);
		if (res) setSubCategoryList(res?.result || []);
		setGridloading(false);
	};

	const PullCategoryFindAll = () => {
		CategoryFindAll({ CustomerId: customerid, IsActive: "true" }, atoken).then((res) => {
			setCatAllList(res || []);
		});
	};

	useEffect(() => {
		PullCategoryFindAll();
		pullSubCategoryList();
	}, []);

	const clearfilledDocument = () => {
		seteditRecordData(null);
		setQuestionCategoryId(0);
		Setquestioncategory("");
		setQuestionSubCategory("");
		setIsactive(true);
		formik.resetForm();
	};

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ?? 0,
			questioncategoryid: editRecordData?.questioncategoryid ?? 0,
			questionsubcategory: editRecordData?.questionsubcategory ?? "",
			isActive: editRecordData?.isActive ?? true,
		},
		validationSchema: yup.object({
			questioncategoryid: yup.mixed().test("not-zero", "Please select a Category", (v) => v && v !== 0),
			questionsubcategory: yup.string().required("Please enter Sub Category"),
		}),
		onSubmit: async () => {
			const data = {
				id: editRecordData?.id ?? 0,
				customerId: customerid,
				questioncategoryid,
				questioncategory,
				questionsubcategory,
				isActive,
			};
			setLoading(true);
			await updateToken();
			const endpoint = editRecordData?.id > 0 ? "api/QSubCategory/Update" : "api/QSubCategory/Add";
			const res = await apiClient.post(endpoint, data, atoken);
			if (res) {
				pullSubCategoryList();
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				clearfilledDocument();
				toast.success(editRecordData?.id > 0 ? "Sub Category updated successfully!" : "Sub Category added successfully!", { toastId: "subcat-save" });
				if (typeof selectedSubCat === "function") selectedSubCat(catId);
			}
			setLoading(false);
		},
	});

	const handleCategoryChange = (e) => {
		const id = e.target.value;
		const selected = catAllList.find((c) => c.id === id);
		setQuestionCategoryId(id);
		Setquestioncategory(selected?.questioncategory ?? "");
		formik.setFieldValue("questioncategoryid", id);
	};

	const callbackedit = useCallback((data) => {
		seteditRecordData(data);
		setQuestionCategoryId(data.questioncategoryid);
		Setquestioncategory(data.questioncategory);
		setQuestionSubCategory(data.questionsubcategory);
		setIsactive(data.isActive);
		formik.setFieldValue("questioncategoryid", data.questioncategoryid);
		formik.setFieldValue("questionsubcategory", data.questionsubcategory);
	}, []);

	const columns = [
		{ field: "questioncategory", headerName: "Category", flex: 1, minWidth: 130 },
		{ field: "questionsubcategory", headerName: "Sub Category", flex: 1, minWidth: 140 },
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
			title="Manage Sub Category"
			isModal
			onReset={clearfilledDocument}
			onSubmit={formik.handleSubmit}
			submitLabel={editRecordData?.id > 0 ? "Update" : "Submit"}
			loading={loading}
			columns={columns}
			rows={SubCategoryList}
			gridLoading={gridloading}
			getRowId={(row) => row.id}
		>
			<div className="mfp-field mfp-field--md">
				<label className="pe-field-label">Category <span className="rfq-required-star">*</span></label>
				<Select
					fullWidth
					variant="outlined"
					size="small"
					value={questioncategoryid}
					onChange={handleCategoryChange}
					onBlur={formik.handleBlur}
					name="questioncategoryid"
					className="f13"
				>
					{catAllList.map((option, i) => (
						<MenuItem key={i} value={option.id} className="f13">{option.questioncategory}</MenuItem>
					))}
				</Select>
				{formik.errors.questioncategoryid && formik.touched.questioncategoryid && (
					<div className="f11" style={{ color: "var(--pe-danger)" }}>{formik.errors.questioncategoryid}</div>
				)}
			</div>

			<div className="mfp-field mfp-field--md">
				<label className="pe-field-label">Sub Category <span className="rfq-required-star">*</span></label>
				<TextField
					fullWidth
					variant="outlined"
					size="small"
					id="questionsubcategory"
					name="questionsubcategory"
					className="f13"
					inputProps={{ maxLength: 50 }}
					value={questionsubcategory}
					onChange={(e) => { setQuestionSubCategory(e.target.value); formik.setFieldValue("questionsubcategory", e.target.value); }}
					InputProps={{
						endAdornment: questionsubcategory ? (
							<InputAdornment position="end">
								<Typography variant="caption" color="textSecondary">{questionsubcategory.length}/50</Typography>
							</InputAdornment>
						) : null,
					}}
				/>
				{formik.errors.questionsubcategory && formik.touched.questionsubcategory && (
					<div className="f11" style={{ color: "var(--pe-danger)" }}>{formik.errors.questionsubcategory}</div>
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

export default AddQuestionSubCategory;
