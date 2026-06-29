import React, { useState, useEffect, useCallback } from "react";
import {
	FormControl,
	MenuItem,
	Select,
	InputAdornment,
	TextField,
	Typography,
} from "@mui/material";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../../assets/css/base.css"
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FindItemCategory, ItemCategoryAdd, UpdateItemCategory } from "../purchaseRequest";
import { BackButton } from "./component";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";

const AddPrItemCategory = ({ handleCategoryList, isModal = false }) => {
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
		categoryDescription: yup.string().required("Please enter item category"),

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
		formik.setFieldValue("categoryDescription", "");
		setcategoryDescription("");
		setisActive(true);
	};

	const handleChangeCategory = (event) => {
		const { value } = event.target;
		setcategoryDescription(value);
		formik.setFieldValue("categoryDescription", value);
	};

	const [itemCatAllList, setItemCatAllList] = useState([]);
	const pullitemList = () => {
		var data = {
			CustomerId: customerid,
		};
		setLoading(true);
		FindItemCategory(data, atoken).then((res) => {
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
			flex: 2,
			minWidth: 160,
		},
		{
			field: "isActive",
			headerName: "Status",
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
					{params.value ? "Active" : "Inactive"}
				</span>
			),
		},
		{
			field: "action",
			headerName: "Action",
			width: 80,
			sortable: false,
			renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params?.row)} />
		}

	];
	const getRowId = (row) => {
		return row.id;
	}
	return (
		<div
			className={`bg-white rounded-default w-100 d-flex flex-column ${!isModal ? "p-3 shadow-sm" : "p-0"}`}
			style={!isModal ? { height: "90vh" } : { height: "100%" }}
		>
			{!isModal && (
				<div className="d-flex align-items-center border-bottom rounded-default mb-3 pb-2">
					<BackButton title={<span className="page-heading">Manage Category</span>} />
				</div>
			)}

			<div className="flex-grow-1" style={{ minHeight: 0 }}>
				<MasterFormPanel
					title="Item Category"
					isModal={true}
					onReset={clearfilleduom}
					onSubmit={formik.handleSubmit}
					loading={submitLoading}
					columns={columns}
					rows={itemCatAllList}
					gridLoading={gridloading}
					getRowId={getRowId}
				>
					<div className="mfp-field mfp-field--md">
						<label className="pe-field-label">
							Item Category <span className="rfq-required-star">*</span>
						</label>
						<TextField
							id="categoryDescription"
							name="categoryDescription"
							variant="outlined"
							size="small"
							fullWidth
							placeholder="Enter item category"
							label={null}
							value={categoryDescription}
							onChange={handleChangeCategory}
							inputProps={{ maxLength: 100 }}
							InputProps={{
								endAdornment: categoryDescription ? (
									<InputAdornment position="end">
										<Typography variant="caption" color="textSecondary">
											{categoryDescription?.length}/100
										</Typography>
									</InputAdornment>
								) : null,
							}}
						/>
						{formik.errors.categoryDescription && formik.touched.categoryDescription && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.categoryDescription}
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
								onChange={(e) => setisActive(e.target.value)}
							>
								<MenuItem value={true}>Active</MenuItem>
								<MenuItem value={false}>Inactive</MenuItem>
							</Select>
						</FormControl>
					</div>
				</MasterFormPanel>
			</div>
		</div>
	);
}
export default AddPrItemCategory;
