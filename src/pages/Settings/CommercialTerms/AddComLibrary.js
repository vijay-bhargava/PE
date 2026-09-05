import React, { useState, useEffect, useCallback } from "react";
import {
	TextField,
	Box,
	Autocomplete,
	MenuItem,
	Select,
	Checkbox,
	ListItemText,
	InputAdornment,
	Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue, actionTypes } from "../../../store";
import { toast } from "react-toastify";
import {
	AddLibraryEntity,
	LibraryFindAll,
	UpdateLibrary,
} from "../../../utils/questionlibrary";
import {
	OrgGroupMasterList,
	getPurchaseOrgList,
} from "../../../utils/commerciallibrary";
import { getMenuMaster } from "../../../utils/common/utility";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import PEModal from "../../../components/PEModal";
import MasterFormPanel, { MfpEditBtn } from "../../../components/MasterFormPanel/MasterFormPanel";
import "../../../assets/css/base.css";
import "../../../assets/css/design-system.css";

const AddComLibrary = ({ selectedLib, libraryType: libraryTypeProp }) => {
	const [{ atoken, customerid }, dispatch] = useStateValue();
	const [loading, setLoading] = useState(false);
	const [gridloading, setGridloading] = useState(true);
	const [LibraryList, setLibraryList] = useState([]);
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);

	const [editRecordData, seteditRecordData] = useState(null);
	const [isEditMode, setIsEditMode] = useState(false);

	// form state
	const [libraryentity, setlibraryentity] = useState("");
	const [libraryType] = useState(libraryTypeProp);
	const [eventType, seteventType] = useState([]);
	const [isactive, setIsactive] = useState(true);
	const [PurchOrgId, setPurchOrgId] = useState(0);
	const [organisationname, setorganisationname] = useState("");
	const [orgGroups, setorggroups] = useState([]);
	const [usergrpId, setusergrpId] = useState([]);

	// nested modals
	const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
	const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);

	useEffect(() => {
		pullLibraryList();
		pullMenuMaster();
		PullPurchaseOrgAll();
	}, []);

	const pullMenuMaster = () => {
		getMenuMaster({ MenuType: "Event" }, atoken).then((res) => setMenuMasterList(res || []));
	};

	const pullLibraryList = () => {
		LibraryFindAll({ CustomerId: customerid, LibraryType: libraryType, SortingColumn: "Id" }, atoken).then((res) => {
			setLibraryList(res && res !== "" ? res : []);
			setGridloading(false);
		});
	};

	const PullPurchaseOrgAll = () => {
		getPurchaseOrgList({ CustomerId: customerid, IsActive: "true" }, atoken).then((res) => setPurchaseAllList(res || []));
	};

	const PullPurchaseGroupAll = (orgMstId) => {
		OrgGroupMasterList({ CustomerId: customerid, OrgMstId: orgMstId, IsActive: "true" }, atoken).then((res) => {
			setPurchaseGroupAllList(res && res !== "" ? res : []);
		});
	};

	const clearfilledDocument = () => {
		seteditRecordData(null);
		setIsEditMode(false);
		setlibraryentity("");
		seteventType([]);
		setIsactive(true);
		setPurchOrgId(0);
		setorganisationname("");
		setorggroups([]);
		setusergrpId([]);
		setPurchaseGroupAllList([]);
		formik.resetForm();
	};

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ?? 0,
			libraryentity: editRecordData?.libraryEntity ?? "",
			eventType: editRecordData?.eventType ? editRecordData.eventType.split(",") : [],
		},
		validationSchema: yup.object({
			libraryentity: yup.string().required("Please enter Library Name"),
			eventType: yup.array().min(1, "Please select at least one Event Type"),
		}),
		onSubmit: () => {
			const data = {
				id: editRecordData?.id ?? 0,
				customerid: customerid,
				organisationid: PurchOrgId,
				eventType,
				libraryType,
				libraryentity,
				organisationname,
				orgGroups,
				isactive,
				createdby: 1,
			};
			setLoading(true);
			const action = editRecordData?.id > 0
				? UpdateLibrary(data, editRecordData.id, atoken)
				: AddLibraryEntity(data, atoken);
			action.then((res) => {
				setLoading(false);
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				pullLibraryList();
				if (typeof selectedLib === "function") selectedLib();
				clearfilledDocument();
				toast.success(editRecordData?.id > 0 ? "Library updated successfully!" : "Library added successfully!", { toastId: "lib-save" });
			});
		},
	});

	const callbackedit = useCallback((data) => {
		seteditRecordData(data);
		setIsEditMode(true);
		setlibraryentity(data.libraryEntity);
		seteventType(data.eventType ? data.eventType.split(",") : []);
		setIsactive(data.isActive);
		setPurchOrgId(data.organisationId);
		setorganisationname(data.organisationName || "");
		setusergrpId(data.orgGroups || []);
		PullPurchaseGroupAll(data.organisationId);
		formik.setFieldValue("libraryentity", data.libraryEntity);
		formik.setFieldValue("eventType", data.eventType ? data.eventType.split(",") : []);
	}, []);

	const getOrganisationDefault = (orgId) =>
		orgId > 0 ? purchaseAllList.find((d) => d.id === orgId) || null : null;

	const getGroupDefault = (arraylist) => {
		if (!arraylist?.length) return [];
		return purchaseGroupAllList.filter((d) => arraylist.some((a) => a.orgGroupId === d.id));
	};

	const onchangePurchOrg = (event, newvalue) => {
		if (newvalue) {
			setPurchOrgId(newvalue.id);
			setorganisationname(newvalue.orgName || "");
			PullPurchaseGroupAll(newvalue.id);
		} else {
			setPurchOrgId(0);
			setorganisationname("");
			setorggroups([]);
			setPurchaseGroupAllList([]);
		}
	};

	const handleChangegroup = (event, newValues) => {
		if (!newValues) return;
		if (newValues.some((o) => o.id === "new")) {
			setPurchaseOrgGrpModal(true);
			return;
		}
		const updated = newValues.map((v) => ({ id: 0, orgLibraryId: editRecordData?.id ?? 0, orgGroupId: v.id, orgGroupName: v.groupName }));
		setorggroups(updated);
		setusergrpId(updated);
	};

	const columns = [
		{ field: "libraryEntity", headerName: "Library", flex: 1, minWidth: 130 },
		{ field: "eventType", headerName: "Event", width: 90 },
		{ field: "organisationName", headerName: "Organization", flex: 1, minWidth: 110 },
		{
			field: "isActive", headerName: "Status", width: 90,
			renderCell: (params) => (
				<span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
					{params.value ? "Active" : "Inactive"}
				</span>
			),
		},
		{
			field: "action", headerName: "Action", width: 72, sortable: false,
			renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params.row)} />,
		},
	];

	return (
		<>
			<MasterFormPanel
				title="Manage Library"
				isModal
				onReset={clearfilledDocument}
				onSubmit={formik.handleSubmit}
				submitLabel={editRecordData?.id > 0 ? "Update" : "Submit"}
				loading={loading}
				columns={columns}
				rows={LibraryList}
				gridLoading={gridloading}
				getRowId={(row) => row.id}
			>
				{/* Library Name */}
				<div className="mfp-field mfp-field--md">
					<label className="pe-field-label">Library Name <span className="rfq-required-star">*</span></label>
					<TextField
						fullWidth
						variant="outlined"
						size="small"
						id="libraryentity"
						name="libraryentity"
						className="f13"
						inputProps={{ maxLength: 100 }}
						value={libraryentity}
						onChange={(e) => { setlibraryentity(e.target.value); formik.setFieldValue("libraryentity", e.target.value); }}
						InputProps={{
							endAdornment: libraryentity ? (
								<InputAdornment position="end">
									<Typography variant="caption" color="textSecondary">{libraryentity.length}/100</Typography>
								</InputAdornment>
							) : null,
						}}
					/>
					{formik.errors.libraryentity && formik.touched.libraryentity && (
						<div className="f11" style={{ color: "var(--pe-danger)" }}>{formik.errors.libraryentity}</div>
					)}
				</div>

				{/* Event Type */}
				<div className="mfp-field mfp-field--md">
					<label className="pe-field-label">Event Type <span className="rfq-required-star">*</span></label>
					<Select
						fullWidth
						variant="outlined"
						size="small"
						multiple={!isEditMode}
						value={eventType}
						onChange={(e) => {
							const val = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
							seteventType(val);
							formik.setFieldValue("eventType", val);
						}}
						renderValue={(selected) => selected.length === 0 ? "Select event…" : selected.join(", ")}
						className="f13"
					>
						{MenuMasterList.map((option, i) => (
							<MenuItem key={i} value={option.menuIdentity} className="f13">
								<Checkbox size="small" checked={eventType.indexOf(option.menuIdentity) > -1} />
								<ListItemText primary={option.menuName} />
							</MenuItem>
						))}
					</Select>
					{formik.errors.eventType && formik.touched.eventType && (
						<div className="f11" style={{ color: "var(--pe-danger)" }}>{formik.errors.eventType}</div>
					)}
				</div>

				{/* Organization */}
				<div className="mfp-field mfp-field--md">
					<label className="pe-field-label">Organization</label>
					<Autocomplete
						size="small"
						options={[...purchaseAllList, { id: "new", orgName: "+ Add New" }]}
						value={getOrganisationDefault(PurchOrgId)}
						getOptionLabel={(o) => o.orgName}
						onChange={(e, v) => v?.id === "new" ? setPurchaseOrgModal(true) : onchangePurchOrg(e, v)}
						renderOption={(props, option) => (
							<Box component="li" {...props} className={`f13 ${option.id === "new" ? "dropdown-add-new" : ""}`}>
								{option.orgName}
							</Box>
						)}
						renderInput={(params) => <TextField {...params} variant="outlined" size="small" className="f13" />}
					/>
				</div>

				{/* Group */}
				<div className="mfp-field mfp-field--md">
					<label className="pe-field-label">Group Name</label>
					<Autocomplete
						multiple
						size="small"
						options={[...purchaseGroupAllList, { id: "new", groupName: "+ Add New" }]}
						getOptionLabel={(o) => o.groupName}
						value={getGroupDefault(usergrpId)}
						onChange={handleChangegroup}
						filterSelectedOptions
						renderOption={(props, option) => (
							<Box component="li" {...props} className={`f13 ${option.id === "new" ? "dropdown-add-new" : ""}`}>
								{option.groupName}
							</Box>
						)}
						renderInput={(params) => <TextField {...params} variant="outlined" size="small" className="f13" />}
					/>
				</div>

				{/* Status */}
				<div className="mfp-field mfp-field--sm">
					<label className="pe-field-label">Status</label>
					<Select fullWidth variant="outlined" size="small" value={isactive} onChange={(e) => setIsactive(e.target.value)}>
						<MenuItem value={true}>Active</MenuItem>
						<MenuItem value={false}>Inactive</MenuItem>
					</Select>
				</div>
			</MasterFormPanel>

			{/* Add Purchase Org Modal */}
			<PEModal open={purchaseOrgModal} onClose={() => setPurchaseOrgModal(false)} title="Add Purchase Organization" size="lg">
				<PurchaseOrg isModal handlepurchaseorgList={(list) => setPurchaseAllList(list)} />
			</PEModal>

			{/* Add Purchase Org Group Modal */}
			<PEModal open={purchaseOrgGrpModal} onClose={() => setPurchaseOrgGrpModal(false)} title="Add Purchase Group" size="lg">
				<PurchaseOrgGrp />
			</PEModal>
		</>
	);
};

export default AddComLibrary;
