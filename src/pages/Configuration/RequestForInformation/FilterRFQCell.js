import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Drawer,
	FormControl,
	FormControlLabel,
	FormGroup,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import React, { useState,useEffect } from "react";
import { HiOutlineX, HiPlusSm } from "react-icons/hi";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import { DateTimePicker, DesktopDatePicker, LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useStateValue } from "../../../store";
import { ApiClient, api } from "../../../Apiclient";
import { useFormik } from "formik";
import * as yup from "yup";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import { OrgGroupMasterList } from "../../../utils/commerciallibrary";
import { getPurchaseOrgList } from "../../../utils/common/utility";

const FilterRFQCell = ({ handleFilterList, clearFilterList }) => {
	const [{ atoken, rtoken, customerid,customersuffix}, dispatch] = useStateValue();
	const [rfqLoading, setRfqLoading] = useState(false);
	useEffect(() => {
		
		PullPurchaseOrgAll();
		PullPurchaseGroupAll()
	}, [atoken, customerid]);
	const apiClient = new ApiClient(customersuffix);
	const formik = useFormik({
		initialValues: {
			CustomerId: customerid,
			Id: "",
			Subject: "",
			status: "",
			StartDate: null,
			EndDate: null,
			purchOrgId:null,
			
			purchGrpId:null
		},
	
		
		validationSchema :yup.object({
			StartDate: yup.date().nullable(),
		  
			EndDate: yup
			  .date()
			  .nullable()
			  .typeError("End Date must be a valid date") // Only type error if a date is provided
			  .test("enddate-after-startdate", "End Date cannot be before the Start Date.", function (value) {
				const { StartDate } = this.parent;  // Access StartDate from parent fields
		  
				// If StartDate exists and EndDate is provided, compare the two
				if (StartDate && value && value < StartDate) {
				  return this.createError({
					path: "EndDate",
					message: " End Date cannot be before the Start Date.",
				  });
				}
				return true;  // If no validation errors, return true
			  }),
		  }),
		  

		onSubmit: (values) => {
	

const PurchOrgId = values.purchOrgId?.id || 0;
const PurchGrpId = values.purchGrpId?.id || 0;
			const data = {
				CustomerId: customerid,


				Id: values.Id,
				Subject: values.Subject,
				Status: values.status,
			
				StartDate: values.StartDate ? values.StartDate.toISOString() : null,
				EndDate: values.EndDate ? values.EndDate.toISOString() : null,
				PurchOrgId,
				PurchGrpId


			}
			handleAdvanchsearch(data);
		},
	});
	const handleAdvanchsearch = async (values) => {
	  
		// Filter out null, undefined, empty string, and zero values from the values object
		const filteredValues = Object.entries(values)
		  .filter(([key, value]) => value !== null && value !== undefined && value !== '' && value !== 0)?.reduce((acc, [key, value]) => {
			acc[key] = value;  // Rebuild the object with valid properties
			return acc;
		  }, {});
	  
		// Build query parameters from the filtered values
		let queryParams = buildQueryParams(filteredValues);
		
		setRfqLoading(true);
	  
		try {
		  const res = await apiClient.get(
			`/api/RFQManage/Find?${queryParams}`,
			atoken
		  );
	  
		  if (res) {
			handleFilterList(res?.result);
		  } else {
			handleFilterList([]);
		  }
		} catch (error) {
		  console.error(error);
		  handleFilterList([]);  // Handle error by clearing the filter list
		}
	  
		setRfqLoading(false);
	  };
	  
	// const handleAdvanchsearch = async (values) => {
	// 	
	// 	let queryParams = buildQueryParams(values);
	// 	setRfqLoading(true)
	// 	const res = await apiClient.get(
	// 		`/api/RFQManage/Find?${queryParams}`,
	// 		atoken
	// 	);

	// 	if (res) {
	// 		handleFilterList(res?.result);
	// 	} else {
	// 		handleFilterList([]);
	// 	}
	// 	setRfqLoading(false)
	// };
	const clear = () => {
		formik.resetForm();
		clearFilterList();
	};
	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
	const PullPurchaseOrgAll = () => {
	  var data = {
		CustomerId: customerid,
		IsActive: 'true'
	  };
	  getPurchaseOrgList(data, atoken).then((resp) => {
		if (resp) {
		  setPurchaseAllList(resp);
  
		}
	  });
	};
  
	const PullPurchaseGroupAll = (orgMstId) => {
	  var data = {
		CustomerId: customerid,
		OrgMstId: orgMstId,
		IsActive: 'true'
	  };
	  OrgGroupMasterList(data, atoken).then((res) => {
		if (res != "" && res != undefined) {
		  setPurchaseGroupAllList(res);
		}
	  });
	};
	return (
		<>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="d-flex flex-column min-vh-100">

					<div className="flex-grow-1">
						<div className="p-3 ps-2 pe-2">
							<div className="row">
								<div className="col-12 mb-3">
									<TextFieldCell
										id="id"
										name="id"
										label="RFQ ID"
										placeholder=""
										value={formik?.values?.Id}
										onChange={(e) => {
											formik?.setFieldValue("Id", e.target?.value);
										}}
									/>
								</div>
								<div className="col-12 mb-3">
									<TextFieldCell
										id="subject"
										name="subject"
										label="Subject"
										placeholder=""
										value={formik?.values?.Subject}
										onChange={(e) => {
											formik?.setFieldValue("Subject", e.target?.value);
										}}
									/>
								</div>
								{/* <div className="col-12 mb-4">
									<TextFieldCell
										id="status"
										name="status"
										label="status"
										placeholder=""
										value={formik?.values?.Status}
										onChange={(e) => {
											formik?.setFieldValue("Status", e.target?.value);
										}}
									/>
									<Select
															labelId="stage"
															InputLabelProps={{
																shrink: true,
															}}
															variant="outlined"
															size="small"
															id="stage"
															name="stage"
															value={formik?.values?.stage}
															label="stage"
															onChange={(e) => {
																formik?.setFieldValue("stage", e.target?.value);
															}}
														>
															<MenuItem value="Open">Open</MenuItem>
															<MenuItem value="Draft">Draft</MenuItem>
															<MenuItem value="Under Approval">
																Under Approval
															</MenuItem>
															<MenuItem value="Cancel">Cancel</MenuItem>
														</Select>
								</div> */}
									<div className="col-12 mb-3">
													<FormControl fullWidth>
														<InputLabel id="status">Status</InputLabel>
														<Select
															labelId="status"
															InputLabelProps={{
																shrink: true,
															}}
															variant="outlined"
															size="small"
															id="status"
															name="status"
															value={formik?.values?.status}
															label="stage"
															onChange={(e) => {
																formik?.setFieldValue("status", e.target?.value);
															}}
														>
															<MenuItem value="Open">Open</MenuItem>
															<MenuItem value="Draft">Draft</MenuItem>
															<MenuItem value="Under Pre Approval">
															Under Pre Approval
															</MenuItem>
															<MenuItem value="Technical Approval">
															Technical Approval
															</MenuItem>
															<MenuItem value="Commercial Approval">
															Commercial Approval
															</MenuItem>
															<MenuItem value="Awarded">
															Awarded
															</MenuItem>
															<MenuItem value="Forwarded">
															Forwarded
															</MenuItem>
															<MenuItem value="Cancel">Cancel</MenuItem>
														</Select>
													</FormControl>
												</div>
								{/* <LocalizationProvider
									dateAdapter={AdapterDateFns}
								>
									<div className="col-12 mb-3">
										<MobileDateTimePicker
											variant="outlined"
											label="Start Date/Time"
											size="small"
											name="startDate"
											id="startDate"

											value={formik.values.StartDate}
											className="w-100 f14"
											slotProps={{
												textField: {
													variant: "outlined",
													size: "small",
													InputLabelProps: { shrink: true },
													error:
														formik.touched.StartDate &&
														Boolean(formik.errors.StartDate),
													helperText:
														formik.touched.StartDate &&
														formik.errors.StartDate,
												},
												actionBar: {
													actions: ["clear", "cancel", "accept"],
												},
											}}
											onChange={(newValue) => {
												formik.setFieldValue(
													"StartDate",
													newValue
												);

											}}
									
										/>

									</div>
									<div className="col-12 mb-3">
										<MobileDateTimePicker
											variant="outlined"
											label="End Date/Time"
											size="small"
											name="endDate"
											id="endDate"

										
											value={formik.values.EndDate}
											className="w-100 f14"
											slotProps={{
												textField: {
													variant: "outlined",
													size: "small",
													InputLabelProps: { shrink: true },
													error:
														formik.touched.EndDate &&
														Boolean(formik.errors.EndDate),
													helperText:
														formik.touched.EndDate &&
														formik.errors.EndDate,
												},
												actionBar: {
													actions: ["clear", "cancel", "accept"],
												},
											}}
											onChange={(newValue) => {
												formik.setFieldValue(
													"EndDate",
													newValue
												);

											}}
										
										/>

									</div>
								</LocalizationProvider> */}
								<LocalizationProvider dateAdapter={AdapterDateFns}>
  <div className="col-12 mb-3">
    <MobileDateTimePicker
      variant="outlined"
      label="Start Date/Time"
      size="small"
      name="startDate"
      id="startDate"
      value={formik.values.StartDate}
      className="w-100 f14"
      slotProps={{
        textField: {
          variant: "outlined",
          size: "small",
          InputLabelProps: { shrink: true },
          error: formik.touched.StartDate && Boolean(formik.errors.StartDate),
          helperText: formik.touched.StartDate && formik.errors.StartDate,
        },
        actionBar: {
          actions: ["clear", "cancel", "accept"],
        },
      }}
      onChange={(newValue) => {
        formik.setFieldValue("StartDate", newValue);
        
        // Clear any error on EndDate when StartDate is changed
        if (newValue && formik.values.EndDate && newValue > formik.values.EndDate) {
          formik.setFieldError("EndDate", "End Date cannot be earlier than Start Date");
        } else {
          formik.setFieldError("EndDate", undefined); // Clear any error if valid
        }
      }}
    />
  </div>

  <div className="col-12 mb-3">
    <MobileDateTimePicker
      variant="outlined"
      label="End Date/Time"
      size="small"
      name="endDate"
      id="endDate"
      value={formik.values.EndDate}
      className="w-100 f14"
      slotProps={{
        textField: {
          variant: "outlined",
          size: "small",
          InputLabelProps: { shrink: true },
          error: formik.touched.EndDate && Boolean(formik.errors.EndDate),
          helperText: formik.touched.EndDate && formik.errors.EndDate,
        },
        actionBar: {
          actions: ["clear", "cancel", "accept"],
        },
      }}
      onChange={(newValue) => {
        formik.setFieldValue("EndDate", newValue);

        // Validate EndDate if it's earlier than StartDate
        if (newValue && formik.values.StartDate && newValue < formik.values.StartDate) {
          formik.setFieldError("EndDate", "End Date cannot be earlier than Start Date");
        } else {
          formik.setFieldError("EndDate", undefined); // Clear any error if valid
        }
      }}
    />
  </div>
</LocalizationProvider>

								<div className="col-12 mb-3">
  <Autocomplete
    id="purchOrgId"
    name="purchOrgId"
    size="small"
    className="w-100 f14"
    sx={{ width: "100%" }}
    options={purchaseAllList} // Just pass the original list without the "Add New" option
    value={formik?.values?.purchOrgId}
    getOptionLabel={(option) => option?.orgName ?? ""}
    onChange={(e, value) => {
      // No need to handle the "Add New" case as it's removed
 
	  formik.setFieldValue("purchOrgId", value);
      formik.setFieldValue("purchGrpId", null);
    }}
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        {option?.orgName}
      </Box>
    )}
    renderInput={(params) => (
      <TextField
        variant="outlined"
        {...params}
        label="Purchase Org"
        shrink={true}
      />
    )}
  />
</div>

<div className="col-12 mb-3">
  <Autocomplete
    id="purchGrpId"
    name="purchGrpId"
    className="w-100 f14"
    sx={{ width: "50%" }}
    options={purchaseGroupAllList} // Just pass the original list without the "Add New" option
    getOptionLabel={(option) => option?.groupName ?? ""}
    value={formik?.values?.purchGrpId}
    onChange={(e, value) => {
      // No need to handle the "Add New" case as it's removed
      formik.setFieldValue("purchGrpId", value);
    }}
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        {option?.groupName}
      </Box>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        variant="outlined"
        size="small"
        placeholder=""
        label="Purchase Group"
        shrink={true}
      />
    )}
  />
</div>

								<div className="col-12 text-end">
									<LoadingButton
										variant="text"
										color="primary"
										className="me-3 text-capitalize"
										size="small"
										onClick={clear}
									>
										Clear
									</LoadingButton>
									<LoadingButton
										loading={rfqLoading}
										variant="outlined"
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

export default FilterRFQCell;
