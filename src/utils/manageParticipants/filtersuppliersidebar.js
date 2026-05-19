import {
	Autocomplete,
	TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { HiOutlineX, HiPlusSm } from "react-icons/hi";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell";
import { ApiClient, api } from "../../Apiclient";
import { useFormik } from "formik";
import { buildQueryParams } from "../common/utility";
import { useStateValue } from "../../store";
import { fetchMasters } from "../common";
import { Button } from "bootstrap";

const Filtersuppliersidebar = ({ handleParticipantList, handleParticipantsReset }) => {
	const [{ atoken, rtoken, customerid,customersuffix}, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	

	const [category_list, setCategoryList] = useState([]);
	const [category, setCategory] = useState([]);
	const [loading, setLoading] = useState(false);


	useEffect(() => {
		fetchMasters(atoken, customerid).then((res) => {
			if (res) {
				setCategoryList(res.categoryList);
			}
		}, []);
	}, []);

	
	const formik = useFormik({
		initialValues: {
			CustomerId: "",
			Email: "",
			ContactPerson: "",
			VendorMasters_TaxId: "",
			CreatedByName: "",
			VendorMasters_VendorCode: "",
			CategoryId: null
		},
		onSubmit: (values) => {
			const data = {
				CustomerId: values?.CustomerId,
				Email: values?.Email,
				ContactPerson: values?.ContactPerson,
				TaxId: values?.VendorMasters_TaxId,
				//VendorMasters_TaxId: values?.VendorMasters_TaxId,
				CreatedByName: values?.CreatedByName,
				//VendorMasters_VendorCode: values?.VendorMasters_VendorCode,
				VendorCode: values?.VendorMasters_VendorCode,
				CategoryId: values?.CategoryId?.id ?? 0
			}
			handleAdvanchsearch(data);
		},
	});

	const handleAdvanchsearch = async (values) => {
		setLoading(true)
		let hasValue = false;
		values.CustomerId = "";

		for (let key in values) {
			if (values[key] && key !== "Email" && key !== "TaxId") {
				hasValue = true;
				break; // Exit the loop once a non-empty field other than ContactPerson is found
			}
		}

		if (hasValue) {
			values.CustomerId = customerid;
		} else {
			values.CustomerId = "";
		}

		let queryParams = buildQueryParams(values);
		if (!queryParams) {
			queryParams = `CustomerId=${customerid}`;
		}

		const res = await apiClient.get(
			`api/managevendors/GetVendors?${queryParams}`,
			atoken
		);

		if (res) {
			handleParticipantList(res.result);
			//handleParticipantList(res)
		} else {
			handleParticipantList([]);
		}
		setLoading(false)
	};

	const handleClear = () => {
		//ParticipantList
		formik.resetForm();
		handleParticipantsReset();

	};

	return (
		<>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="d-flex flex-column min-vh-100">
					<div className="flex-grow-1">
						<div className="p-3 ps-2 pe-2">
							<div className="row">
								<div className="col-12 mb-4">
									<TextFieldCell
										id="Email"
										name="Email"
										label="Email ID"
										placeholder=""
										value={formik?.values?.Email}
										onChange={(e) => {
											formik?.setFieldValue("Email", e.target?.value);
										}}
									/>
								</div>
								<div className="col-12 mb-4">
									<TextFieldCell
										id="taxId"
										name="taxId"
										label="Tax Id"
										placeholder=""
										value={formik?.values?.VendorMasters_TaxId}
										onChange={(e) => {
											formik?.setFieldValue("VendorMasters_TaxId", e.target?.value);
										}}
									/>
								</div>
								<div className="col-12 mb-4">
									<TextFieldCell
										id="ContactPerson"
										name="ContactPerson"
										label="Contact Person"
										placeholder=""
										value={formik?.values?.ContactPerson}
										onChange={(e) => {
											formik?.setFieldValue("ContactPerson", e.target?.value);
										}}
									/>
								</div>
								<div className="col-12 mb-4">
									<TextFieldCell
										id="CreatedByName"
										name="CreatedByName"
										label="Created By"
										placeholder=""
										value={formik?.values?.CreatedByName}
										onChange={(e) => {
											formik?.setFieldValue("CreatedByName", e.target?.value);
										}}
									/>
								</div>
								<div className="col-12 mb-4">
									<TextFieldCell
										id="vendorCode"
										name="vendorCode"
										label="Supplier Code"
										placeholder=""
										value={formik?.values?.VendorMasters_VendorCode}
										onChange={(e) => {
											formik?.setFieldValue("VendorMasters_VendorCode", e.target?.value);
										}}
									/>
								</div>

								<div className="col-12 mb-4">
									{category_list && category_list.length > 0 ? (
										<Autocomplete
											id="CategoryId"
											name="CategoryId"
											size="small"
											options={category_list ?? []}
											fullWidth
											renderInput={(params) => (
												<TextField
													{...params}
													InputLabelProps={{
														shrink: true,
													}}
													label="Category "
												/>
											)}
											getOptionLabel={(option) => option?.categoryDescription ?? ""}
											value={formik?.values?.CategoryId}
											onChange={(e, newValue) => {
												formik?.setFieldValue("CategoryId", newValue);
											}}
										/>
									) : (
										<></>
									)}
								</div>



								<div className="col-12 text-end">
									<LoadingButton
										variant="text"
										color="primary"
										className="me-3 text-capitalize"
										size="small"
										onClick={handleClear}
									>
										Clear
									</LoadingButton>
									<LoadingButton
										// loading
										variant="outlined"
										loading={loading}
										// onClick={() => router.push(`/sdsdsd/${actibeModuleID}`)}
										color="primary"
										className="text-capitalize"
										size="small"
										type="submit"
									>
										Submit
									</LoadingButton>
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</>
	);
};

export default Filtersuppliersidebar;
