import { Autocomplete, FormControl, MenuItem, Select, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { useStateValue } from "../../../store";
import { ApiClient } from "../../../Apiclient";
import { useFormik } from "formik";
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
		<form
			className="rfq-v2-filter-body"
			onSubmit={formik.handleSubmit}
			autoComplete="off"
		>
			{/* ── Scrollable fields ── */}
			<div className="rfq-v2-filter-fields">

				{/* NFA ID */}
				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-nfa-id"> NFA ID	</label>
					<TextField
						id="filter-nfa-id"
						name="Id"
						placeholder="Enter NFA ID"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.Id}
						onChange={(e) => formik.setFieldValue("Id", e.target.value)}
					/>
				</div>

				{/* Event Code */}
				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-nfa-eventcode"> Event Code </label>
					<TextField
						id="filter-nfa-eventcode"
						name="EventCode"
						placeholder="Enter event code"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.EventCode}
						onChange={(e) => formik.setFieldValue("EventCode", e.target.value)}
					/>
				</div>

				{/* Subject */}
				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-nfa-subject"> Subject	</label>
					<TextField
						id="filter-nfa-subject"
						name="Subject"
						placeholder="Enter subject"
						size="small"
						fullWidth
						variant="outlined"
						className="rfq-v2-filter-field"
						value={formik.values.Subject}
						onChange={(e) => formik.setFieldValue("Subject", e.target.value)}
						inputProps={{ maxLength: 200 }}
					/>
				</div>

				{/* Status */}
				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-nfa-stage"> Status	</label>
					<FormControl fullWidth size="small" variant="outlined" className="rfq-v2-filter-field">
						<Select
							id="filter-nfa-stage"
							value={formik.values.stage}
							onChange={(e) => formik.setFieldValue("stage", e.target.value)}
							displayEmpty
							renderValue={(selected) =>
								selected ? selected : <span style={{ color: "#9ca3af" }}>Select status</span>
							}
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

				{/* Purchase Org */}
				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-nfa-purchOrgId">	Purchase Org</label>
					<Autocomplete
						id="filter-nfa-purchOrgId"
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
							<TextField
								{...params}
								placeholder="Select purchase org"
								variant="outlined"
								size="small"
								className="rfq-v2-filter-field"
							/>
						)}
					/>
				</div>

				{/* Purchase Group */}
				<div>
					<label className="rfq-v2-filter-label" htmlFor="filter-nfa-purchGrpId">	Purchase Group	</label>
					<Autocomplete
						id="filter-nfa-purchGrpId"
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
							<TextField
								{...params}
								placeholder="Select purchase group"
								variant="outlined"
								size="small"
								className="rfq-v2-filter-field"
								style={{ background: formik.values.purchOrgId ? "#fff" : "#f9fafb" }}
							/>
						)}
					/>
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
				<LoadingButton
					type="submit"
					loading={nfaLoading}
					className="rfq-v2-filter-btn-apply"
					disableElevation
				>
					Apply
				</LoadingButton>
			</div>
		</form>
	);
};

export default FilterNFACell;
