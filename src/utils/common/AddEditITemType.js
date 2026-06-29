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
import { ApiClient } from "../../Apiclient";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";

const AddEditItemType = ({ handleItemTypeList, isModal = false }) => {
	const [{ atoken, customerid, customersuffix }] = useStateValue();
	const apiClient = new ApiClient(customersuffix);

	const [itemTypeValue, setItemTypeValue] = useState("");
	const [editRecordData, setEditRecordData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [gridloading, setGridloading] = useState(true);
	const [list, setList] = useState([]);

	useEffect(() => {
		pullItemTypeList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customerid]);

	const validationSchema = yup.object({
		itemType: yup.string().required("Please enter Item Type"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
			itemType: editRecordData?.itemType ? editRecordData?.itemType : itemTypeValue,
			isActive: editRecordData?.isActive !== undefined ? editRecordData?.isActive : true,
		},
		validationSchema,
		onSubmit: async (values) => {
			if (!values.itemType) {
				toast.error("Please enter Item Type");
				return;
			}
			setLoading(true);

			const payload = {
				id: editRecordData?.id ? editRecordData?.id : 0,
				itemType: values?.itemType,
				isActive: values?.isActive ?? true,
				customerId: parseInt(customerid) || 0,
			};

			try {
				if (editRecordData?.id > 0) {
					const res = await apiClient.postres('/api/ItemType/Update', payload, atoken);
					if (res) {
						toast.success('Item Type updated successfully!');
						clearForm();
						pullItemTypeList();
					}
				} else {
					const res = await apiClient.postres('/api/ItemType/Add', payload, atoken);
					if (res) {
						toast.success('Item Type added successfully!');
						clearForm();
						pullItemTypeList();
					}
				}
			} catch (err) {
				console.error('error', err);
				toast.error('Operation failed');
			} finally {
				setLoading(false);
			}
		},
	});

	const pullItemTypeList = async () => {
		if (!customerid) return;
		setGridloading(true);
		try {
			const res = await apiClient.get(`api/ItemType/Find?CustomerId=${customerid}`, atoken);
			// API may return array or { result: [] }
			if (Array.isArray(res)) {
				setList(res);
				if (handleItemTypeList) handleItemTypeList(res);
			} else if (res && res.result) {
				setList(res.result);
				if (handleItemTypeList) handleItemTypeList(res.result);
			} else {
				setList([]);
				if (handleItemTypeList) handleItemTypeList([]);
			}
		} catch (err) {
			console.error('pullItemTypeList error', err);
			setList([]);
		} finally {
			setGridloading(false);
		}
	};

	const callbackedit = useCallback((row) => {
		setEditRecordData(row);
		setItemTypeValue(row.itemType || '');
		formik.setFieldValue('itemType', row.itemType || '');
		formik.setFieldValue('id', row.id || 0);
		formik.setFieldValue('isActive', row.isActive !== undefined ? row.isActive : true);
	}, [formik]);

	const clearForm = () => {
		setEditRecordData(null);
		setItemTypeValue('');
		formik.resetForm();
	};

	const columns = [
		{ field: 'itemType', headerName: 'Item Type', flex: 2, minWidth: 160 },
		{
			field: 'isActive',
			headerName: 'Status',
			flex: 1,
			minWidth: 100,
			renderCell: (params) => (
				<span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
					{params.value ? 'Active' : 'Inactive'}
				</span>
			),
		},
		{
			field: 'action', headerName: 'Action', width: 80, renderCell: (params) => (
				<MfpEditBtn onClick={() => callbackedit(params.row)} />
			)
		}
	];

	const getRowId = (row) => row.id || row.itemType;

	return (
		<div
			className={`bg-white rounded-default w-100 d-flex flex-column ${!isModal ? "p-3 shadow-sm" : "p-0"}`}
			style={!isModal ? { height: "90vh" } : { height: "100%" }}
		>
			<div className="flex-grow-1" style={{ minHeight: 0 }}>
				<MasterFormPanel
					title="Item Type"
					isModal={true}
					onReset={clearForm}
					onSubmit={formik.handleSubmit}
					loading={loading}
					columns={columns}
					rows={list}
					gridLoading={gridloading}
					getRowId={getRowId}
				>
					<div className="mfp-field mfp-field--md">
						<label className="pe-field-label">
							Item Type <span className="rfq-required-star">*</span>
						</label>
						<TextField
							id="itemType"
							name="itemType"
							variant="outlined"
							size="small"
							fullWidth
							placeholder="Enter item type"
							label={null}
							value={formik.values.itemType}
							onChange={(e) => {
								setItemTypeValue(e.target.value);
								formik.setFieldValue('itemType', e.target.value);
							}}
							inputProps={{ maxLength: 200 }}
							InputProps={{
								endAdornment: formik.values.itemType ? (
									<InputAdornment position="end">
										<Typography variant="caption" color="textSecondary">
											{formik.values.itemType.length}/200
										</Typography>
									</InputAdornment>
								) : null,
							}}
						/>
						{formik.errors.itemType && formik.touched.itemType && (
							<div className="error error-red" style={{ fontSize: '9px' }}>{formik.errors.itemType}</div>
						)}
					</div>

					<div className="mfp-field mfp-field--sm">
						<label className="pe-field-label">Status</label>
						<FormControl fullWidth size="small">
							<Select
								variant="outlined"
								size="small"
								value={formik.values.isActive}
								onChange={(e) => formik.setFieldValue('isActive', e.target.value)}
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
};

export default AddEditItemType;
