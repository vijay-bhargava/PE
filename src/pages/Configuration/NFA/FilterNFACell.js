import { Autocomplete, FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useStateValue } from "../../../store";
import { ApiClient } from "../../../Apiclient";
import { useFormik } from "formik";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { buildQueryParams } from "../../../utils/common/utility";
import { OrgGroupMasterList, getPurchaseOrgList } from "../../../utils/commerciallibrary";
import { getEventStage } from "../../../utils/common/utility";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../utils/common";

const FilterNFACell = ({ handleFilterList, clearFilterList, setFilterValues }) => {

	const [{ atoken, customerid, customersuffix }] = useStateValue();
	const [nfaLoading, setNfaLoading] = useState(false);

	const apiClient = new ApiClient(customersuffix);

	const formik = useFormik({
		initialValues: {
			CustomerId: customerid,
			Id: "",
			EventCode: "",
			Subject: "",
			stage: "",
			purchOrgId: null,
			purchGrpId: null
		},
		onSubmit: (values, { setSubmitting }) => {
			const { StartDate, EndDate, purchOrgId, purchGrpId, ...otherValues } = values;
			const hasDateRange = !!(StartDate || EndDate);
			const PurchOrgId = purchOrgId?.id || 0;
			const PurchGrpId = purchGrpId?.id || 0;
			const data = {
				CustomerId: customerid,
				Id: otherValues.Id,
				EventCode: otherValues.EventCode,
				NfaSubject: otherValues.Subject,
				Stage: otherValues.stage,
				PurchOrgId,
				PurchGrpId,
			};
			handleAdvancedSearch(data, values, hasDateRange);
			setFilterValues(data);
			setSubmitting(false);
		},
	});

	const handleAdvancedSearch = async (values, searchCriteria, hasDateRange = false) => {
		const filteredValues = Object.entries(values)
			.filter(([key, value]) => value !== null && value !== undefined && value !== "" && value !== 0)
			.reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {});

		let queryParams = buildQueryParams(filteredValues);
		const fetchSize = hasDateRange ? 10000 : 10;

		setNfaLoading(true);
		try {
			const res = await apiClient.get(
				`/api/NFAManage/Find?${queryParams}&pageNumber=1&pageSize=${fetchSize}`,
				atoken
			);
			if (res) {
				handleFilterList(res?.result, searchCriteria, res?.pageMetadata, queryParams);
			} else {
				handleFilterList([], searchCriteria, null, queryParams);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "advanced_search_error" });
			handleFilterList([], searchCriteria, null, queryParams);
		} finally {
			setNfaLoading(false);
		}
	};


	const clear = () => {
		formik.resetForm();
		clearFilterList();
		setFilterValues({});
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

	const PullPurchaseOrgAll = async () => {
		const data = { CustomerId: customerid, IsActive: "true" };
		try {
			const resp = await getPurchaseOrgList(data, atoken);
			if (resp) { setPurchaseAllList(resp); } else { setPurchaseAllList([]); }
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "purchase_org_error" });
			setPurchaseAllList([]);
		}
	};

	const PullPurchaseGroupAll = async (orgMstId) => {
		const data = { CustomerId: customerid, OrgMstId: orgMstId, IsActive: "true" };
		try {
			const res = await OrgGroupMasterList(data, atoken);
			if (res !== "" && res !== undefined) { setPurchaseGroupAllList(res); } else { setPurchaseGroupAllList([]); }
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "purchase_group_error" });
			setPurchaseGroupAllList([]);
		}
	};

	const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
		const data = { CustomerId: customerid, IsActive: true, EventType: EventTypeId };
		try {
			const res = await getEventStage(data, atoken);
			const filteredStages = (res || []).filter(
				stage => stage.stageSeq !== 0 || stage.stageName === "Cancel"
			);
			setList(filteredStages);
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "event_stage_error" });
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
											id="EventCode"
											name="EventCode"
											label="Event Code"
											value={formik.values.EventCode}
											onChange={(e) => formik.setFieldValue("EventCode", e.target.value)}
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

									{/* <LocalizationProvider dateAdapter={AdapterDateFns}>
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
									</LocalizationProvider> */}

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
