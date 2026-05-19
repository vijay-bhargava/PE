import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Checkbox, FormControlLabel, IconButton } from "@mui/material";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell";
import { LoadingButton } from "@mui/lab";
import { HiPencilAlt } from "react-icons/hi";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue } from "../../store";
import { toast } from "react-toastify";
import { ApiClient } from "../../Apiclient";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const AddEditItemType = ({ handleItemTypeList }) => {
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
		{ field: 'itemType', headerName: 'Item Type', width: 240 },
		{ field: 'isActive', headerName: 'Status', width: 140, renderCell: (params) => (params.value ? 'Active' : 'Inactive') },
		{ field: 'action', headerName: 'Action', width: 80, renderCell: (params) => (
				<IconButton size="small" onClick={() => callbackedit(params.row)}>
					<HiPencilAlt className="f17 text-primary" />
				</IconButton>
			)
		}
	];

	const getRowId = (row) => row.id || row.itemType;

	return (
		<>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="row mt-4">
					<div className="col-12 col-md-6 mb-3">
						<TextFieldCell
							id="itemType"
							name="itemType"
							label="Item Type *"
							value={formik.values.itemType}
							onChange={(e) => { setItemTypeValue(e.target.value); formik.setFieldValue('itemType', e.target.value); }}
							maxLength={200}
						/>
						{formik.errors.itemType && formik.touched.itemType && (
							<div className="error error-red" style={{ fontSize: '9px' }}>{formik.errors.itemType}</div>
						)}
					</div>

					<div className="col-12 col-md-6 mb-3">
						<FormControlLabel
							control={<Checkbox checked={formik.values.isActive} onChange={(e) => formik.setFieldValue('isActive', e.target.checked)} />}
							label="Active"
						/>
					</div>

					<div className="col-12 text-end">
						{!loading ? (
							<>
								<Button variant="contained" color="primary" onClick={clearForm} sx={{ mr: 2 }}>Reset</Button>
								<Button variant="outlined" color="primary" type="submit">Submit</Button>
							</>
						) : (
							<LoadingButton loading variant="contained">Submit ...</LoadingButton>
						)}
					</div>
				</div>
			</form>

			<div className="col-12 mt-3">
				<DataGrid
					getRowId={getRowId}
					rows={list}
					loading={gridloading}
					columns={columns}
					autoHeight
					rowHeight={40}
					columnHeaderHeight={40}
					disableDensitySelector
					slots={{ toolbar: GridToolbar }}
					sx={{ border: 'none' }}
				/>
			</div>
			{/* Using the global ToastContainer from App.js to avoid duplicate toasts */}
		</>
	);
};

export default AddEditItemType;
