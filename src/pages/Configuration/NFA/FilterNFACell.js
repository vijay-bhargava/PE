import { Autocomplete, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useStateValue } from "../../../store";
import { ApiClient } from "../../../Apiclient";
import { useFormik } from "formik";
import * as yup from "yup";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { buildQueryParams } from "../../../utils/common/utility";
import { OrgGroupMasterList, getPurchaseOrgList } from "../../../utils/commerciallibrary";
import { getEventStage } from "../../../utils/common/utility";

const FilterNFACell = ({ handleFilterList, clearFilterList }) => {

	const [{ atoken, customerid, customersuffix, userDetail }] = useStateValue();
	const [nfaLoading, setNfaLoading] = useState(false);

	const apiClient = new ApiClient(customersuffix);

	const formik = useFormik({
		initialValues: {
			CustomerId: customerid,
			Id: "",
			Subject: "",
			stage: "",
			StartDate: null,
			EndDate: null,
			purchOrgId: null,
			purchGrpId: null
		},
		validationSchema: yup.object({
			StartDate: yup.date().nullable(),
			EndDate: yup
				.date()
				.nullable()
				.typeError("End Date must be a valid date")
				.test("enddate-after-startdate", "End Date cannot be before the Start Date.", function (value) {
					const { StartDate } = this.parent;
					if (StartDate && value && value < StartDate) {
						return this.createError({
							path: "EndDate",
							message: " End Date cannot be before the Start Date.",
						});
					}
					return true;
				}),
		}),

		onSubmit: (values) => {
            debugger
			const PurchOrgId = values.purchOrgId?.id || 0;
			const PurchGrpId = values.purchGrpId?.id || 0;
			const data = {
				CustomerId: customerid,
				Id: values.Id,
				Subject: values.Subject,
				Stage: values.stage,
				StartDate: values.StartDate ? values.StartDate.toISOString() : null,
				EndDate: values.EndDate ? values.EndDate.toISOString() : null,
				PurchOrgId,
				PurchGrpId,
			}
			handleAdvancedSearch(data);
		},
	});

	const handleAdvancedSearch = async (values) => {
		const filteredValues = Object.entries(values)
			.filter(([key, value]) => value !== null && value !== undefined && value !== '' && value !== 0)
			.reduce((acc, [key, value]) => {
				acc[key] = value;
				return acc;
			}, {});

		let queryParams = buildQueryParams(filteredValues);

		setNfaLoading(true);

		try {
			const res = await apiClient.get(
				`/api/NFAManage/FindAdvnceSearch?${queryParams}`,
				atoken
			);

			if (res) {
				handleFilterList(res?.result);
			} else {
				handleFilterList([]);
			}
		} catch (error) {
			console.error(error);
			handleFilterList([]);
		}

		setNfaLoading(false);
	};


	const clear = () => {
		formik.resetForm();
		clearFilterList();
	};

	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
	const [nfaStatusLoaded, setNfaStatusLoaded] = useState(false);
	const [nfaStatusList, setNfaStatusList] = useState([]);

	useEffect(() => {
		if (!nfaStatusLoaded) {
			pullGetEventStage("NFA", setNfaStatusList, setNfaStatusLoaded);
		}
	}, [nfaStatusLoaded]);

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

	const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
		const data = { CustomerId: customerid, IsActive: true, EventType: EventTypeId };
		try {
			const res = await getEventStage(data, atoken);
			setList(res || []);
		} catch (err) {
			console.error("Error fetching event stage:", err);
			setList([]);
		} finally {
			setLoaded(true);
		}
	};

	return (
		<div className="rightContent">
			<div className="bg-white p-3" style={{ border: "none" }}>
				<form onSubmit={formik.handleSubmit} autoComplete="off">
					<div className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
						<div className="flex-grow-1">
							<div className="p-3 ps-2 pe-2">
								<div className="row">
									<div className="col-12 mb-3">
										<TextFieldCell
											id="Id"
											name="Id"
											label="NFA ID"
											value={formik.values.Id}
											onChange={(e) => formik.setFieldValue("Id", e.target.value)}
										/>
									</div>

									<div className="col-12 mb-3">
										<TextFieldCell
											id="Subject"
											name="Subject"
											label="Subject"
											maxLength={200}
											value={formik.values.Subject}
											onChange={(e) => formik.setFieldValue("Subject", e.target.value)}
											InputProps={{
												endAdornment: formik.values.Subject && (
													<InputAdornment position="end">
														<Typography variant="body2" color="textSecondary">
															{formik.values.Subject.length}/200
														</Typography>
													</InputAdornment>
												),
											}}
										/>
									</div>

									<div className="col-12 mb-3">
										<FormControl fullWidth>
											<InputLabel id="stage">Status</InputLabel>
											<Select
												id="stage"
												labelId="stage"
												label="Status"
												variant="outlined"
												size="small"
												value={formik.values.stage}
												onChange={(e) => formik.setFieldValue("stage", e.target.value)}
												onOpen={() => {
													if (!nfaStatusLoaded) pullGetEventStage("NFA", setNfaStatusList, setNfaStatusLoaded);
												}}
											>
												{nfaStatusList.length
													? nfaStatusList.map(item => (
														<MenuItem key={item.id} value={item.stageName}>
															{item.stageName}
														</MenuItem>
													))
													: <MenuItem disabled>No options available</MenuItem>}
											</Select>
										</FormControl>
									</div>

									<LocalizationProvider dateAdapter={AdapterDateFns}>
										<div className="col-12 mb-3">
											<MobileDateTimePicker
												label="Start Date/Time"
												className="w-100 f14"
												value={formik.values.StartDate}
												onChange={(newValue) => formik.setFieldValue("StartDate", newValue)}
												slotProps={{
													textField: {
														variant: "outlined",
														size: "small",
														error: !!formik.errors.StartDate,
														helperText: formik.errors.StartDate,
													},
												}}
											/>
										</div>

										<div className="col-12 mb-3">
											<MobileDateTimePicker
												label="End Date/Time"
												className="w-100 f14"
												value={formik.values.EndDate}
												onChange={(newValue) => formik.setFieldValue("EndDate", newValue)}
												slotProps={{
													textField: {
														variant: "outlined",
														size: "small",
														error: !!formik.errors.EndDate,
														helperText: formik.errors.EndDate,
													},
												}}
											/>
										</div>
									</LocalizationProvider>

									{/* Purchase Org */}
									<div className="col-12 mb-3">
										<Autocomplete
											id="purchOrgId"
											options={purchaseAllList}
											getOptionLabel={(option) => option?.orgName ?? ""}
											value={formik.values.purchOrgId}
											onChange={(e, value) => {
												formik.setFieldValue("purchOrgId", value);
												formik.setFieldValue("purchGrpId", null);
											}}
											onOpen={() => {
												if (!purchaseAllList || purchaseAllList.length === 0) {
													PullPurchaseOrgAll();
												}
											}}
											renderInput={(params) => (
												<TextField {...params} label="Purchase Org" variant="outlined" size="small" />
											)}
										/>
									</div>

									{/* Purchase Group */}
									<div className="col-12 mb-3">
										<Autocomplete
											id="purchGrpId"
											options={purchaseGroupAllList}
											getOptionLabel={(option) => option?.groupName ?? ""}
											value={formik.values.purchGrpId}
											onChange={(e, value) => formik.setFieldValue("purchGrpId", value)}
											onOpen={() => {
												if (
													formik?.values?.purchOrgId?.id &&
													(!purchaseGroupAllList || purchaseGroupAllList.length === 0)
												) {
													PullPurchaseGroupAll(formik.values.purchOrgId.id);
												}
											}}
											renderInput={(params) => (
												<TextField {...params} label="Purchase Group" variant="outlined" size="small" />
											)}
										/>
									</div>

									{/* Buttons */}
									<div className="col-12 text-end">
										<LoadingButton
											variant="contained"
											color="primary"
											className="me-3 text-capitalize"
											onClick={clear}
										>
											Clear
										</LoadingButton>
										<LoadingButton
											loading={nfaLoading}
											variant="outlined"
											color="primary"
											className="text-capitalize"
											onClick={async (e) => {
												e.preventDefault();
												formik.handleSubmit();
											}}
										>
											Submit
										</LoadingButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default FilterNFACell;
