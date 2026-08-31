import {
	FormControl, MenuItem,
	Select, TextField,
} from "@mui/material";
import React from "react";
import { useFormik } from "formik";

const FilterCustomerCell = ({ handleFilterList, clearFilterList }) => {

	const formik = useFormik({
		initialValues: {
			customerName: "",
			customerEmail: "",
			contactPersonName: "",
			phoneNo: "",
			isActive: "",
		},
		onSubmit: (values) => {
			handleFilterList(values);
		},
	});

	const clear = () => {
		formik.resetForm();
		clearFilterList();
	};

	return (
		<form
			className="rfq-v2-filter-body"
			onSubmit={formik.handleSubmit}
			autoComplete="off"
		>
			{/* ── Scrollable fields ── */}
			<div className="rfq-v2-filter-fields">

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-cust-name"> Customer Name </label>
					<TextField
						id="filter-cust-name"
						name="customerName"
						placeholder="Enter customer name"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.customerName}
						onChange={(e) => formik.setFieldValue("customerName", e.target.value)}
						inputProps={{ maxLength: 200 }}
					/>
				</div>

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-cust-email">	Email	</label>
					<TextField
						id="filter-cust-email"
						name="customerEmail"
						placeholder="Enter email"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.customerEmail}
						onChange={(e) => formik.setFieldValue("customerEmail", e.target.value)}
						inputProps={{ maxLength: 200 }}
					/>
				</div>

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-cust-contact">	Contact Person </label>
					<TextField
						id="filter-cust-contact"
						name="contactPersonName"
						placeholder="Enter contact person name"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.contactPersonName}
						onChange={(e) => formik.setFieldValue("contactPersonName", e.target.value)}
						inputProps={{ maxLength: 200 }}
					/>
				</div>

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-cust-phone">	Phone	</label>
					<TextField
						id="filter-cust-phone"
						name="phoneNo"
						placeholder="Enter phone number"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.phoneNo}
						onChange={(e) => {
							const val = e.target.value.replace(/[^\d+\- ]/g, '');
							formik.setFieldValue("phoneNo", val);
						}}
						inputProps={{ maxLength: 20 }}
					/>
				</div>

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-cust-status"> Status	</label>
					<FormControl fullWidth size="small" variant="outlined" className="rfq-v2-filter-field">
						<Select
							id="filter-cust-status"
							value={formik.values.isActive}
							onChange={(e) => formik.setFieldValue("isActive", e.target.value)}
							displayEmpty
							renderValue={(selected) =>
								selected === ''
									? <span style={{ color: '#9ca3af' }}>Select status</span>
									: selected === 'true' ? 'Active' : 'Inactive'
							}
						>
							<MenuItem value="">All</MenuItem>
							<MenuItem value="true">Active</MenuItem>
							<MenuItem value="false">Inactive</MenuItem>
						</Select>
					</FormControl>
				</div>
			</div>

			{/* ── Sticky footer ── */}
			<div className="rfq-v2-filter-footer">
				<button
					type="button"
					className="rfq-v2-filter-btn-reset"
					onClick={clear}
				>
					Reset
				</button>
				<button
					type="submit"
					className="rfq-v2-filter-btn-apply"
				>
					Apply
				</button>
			</div>
		</form>
	);
};

export default FilterCustomerCell;
