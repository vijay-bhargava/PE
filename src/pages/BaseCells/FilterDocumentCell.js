import React from "react";
import { useFormik } from "formik";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";

const FilterDocumentCell = ({ handleFilterList, clearFilterList }) => {
	const formik = useFormik({
		initialValues: {
			attachmentdesc: "",
			eventtype: "",
			isactive: "",
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
			<div className="rfq-v2-filter-fields">

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-doc-desc">Attachment Description</label>
					<TextField
						id="filter-doc-desc"
						name="attachmentdesc"
						placeholder="Enter description"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.attachmentdesc}
						onChange={(e) => formik.setFieldValue("attachmentdesc", e.target.value)}
						inputProps={{ maxLength: 200 }}
					/>
				</div>

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-doc-event">Event Type</label>
					<TextField
						id="filter-doc-event"
						name="eventtype"
						placeholder="Enter event type"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.eventtype}
						onChange={(e) => formik.setFieldValue("eventtype", e.target.value)}
						inputProps={{ maxLength: 100 }}
					/>
				</div>

				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-doc-status">Status</label>
					<FormControl fullWidth size="small" variant="outlined" className="rfq-v2-filter-field">
						<Select
							id="filter-doc-status"
							value={formik.values.isactive}
							onChange={(e) => formik.setFieldValue("isactive", e.target.value)}
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

			<div className="rfq-v2-filter-footer">
				<button type="button" className="rfq-v2-filter-btn-reset" onClick={clear}>
					Reset
				</button>
				<button type="submit" className="pe-btn pe-btn--primary">
					Apply
				</button>
			</div>
		</form>
	);
};

export default FilterDocumentCell;
