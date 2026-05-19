import React, { useState, useEffect } from "react";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { LoadingButton } from "@mui/lab";

import { actionTypes, useStateValue } from "../../../store";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as yup from "yup";
import { useFormik } from "formik";
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
import { getMenuMaster } from "../../../utils/common/utility";
import { AddStage, UpdateStage } from "../../../utils/stagemaster";
import { getEmailDetails } from "../../../utils/emailmaster";

const AddEditCell = ({ 
	callbackstagestep,
	editRecordData,
	seteditRecordData,
	handlestageList,
}) => {
	const [{ atoken, rtoken }, dispatch] = useStateValue();
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const [loading, setLoading] = useState(false);
	const [records, setRecords] = useState([]);

	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			console.log(res);
			setMenuMasterList(res);
		});
	};

	const [stageName, setstageName] = useState("");
	const [stageSeq, setstageSeq] = useState(0);
	const [eventType, seteventType] = useState("");

	const [parentId, setparentId] = useState(0);
	const [emailId, setemailId] = useState(0);
	const [isActive, setisActive] = useState(true);
	const [mandatory, setmandatory] = useState(false);

	useEffect(() => {
		if (editRecordData) {
			prefilledStage();
			//emailDataList();
		}
	}, []);

	useEffect(() => {
		pullMenuMaster();
	}, []);
	const validationSchema = yup.object({
		stageSeq: yup
			.string("Please Select an Event")
			.required("Sequence is required"),
		stageName: yup
			.string("Please Enter a Title")
			.required("Stage Name is required"),
		eventType: yup
			.string("Please Select an Event")
			.required("Event type is required"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
			customerid: 1,
			stageName: editRecordData?.stageName
				? editRecordData?.stageName
				: stageName,
			stageSeq: editRecordData?.stageSeq ? editRecordData?.stageSeq : stageSeq,

			eventType: editRecordData?.eventType
				? editRecordData?.eventType
				: eventType,
			parentId: editRecordData?.parentId ? editRecordData?.parentId : 0,
			emailId: editRecordData?.emailId ? editRecordData?.emailId : emailId,
			mandatory: editRecordData?.mandatory ? editRecordData?.mandatory : false,

			isActive: editRecordData?.isActive ? editRecordData?.isActive : true,
			createdby: 1,
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			setLoading(true);

			var data = {
				id: editRecordData?.id ? editRecordData?.id : 0,
				stageName: stageName,
				stageSeq: stageSeq,
				eventType: eventType,
				parentId: 0,
				emailId: emailId,
				mandatory: mandatory,
				isActive: isActive,
			};

			// api call to save data
			if (editRecordData?.id > 0) {
				UpdateStage(data, editRecordData?.id, atoken).then((res) => {
					//  setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					
					clearfilledstage();
					toast.success("Stage updated successfully!", {
						toastId: "Stagesuccess",
					});
					callbackstagestep("update");
					//return true;
				});
			} else {
				AddStage(values, atoken).then((res) => {
					
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					
					clearfilledstage();
					toast.success("Stage added successfully!", {
						toastId: "Stageaddedsuccess",
					});
					callbackstagestep("add"); 
					//return true;
				});
			}
		},
	});

	const onchangeEventType = (event) => {
		seteventType(event.target.value);
		emailDataList(event.target.value);
		formik?.setFieldValue("eventType", event.target.value);
	};

	const onchangeEmailType = (event) => {
		setemailId(event.target.value);
		formik?.setFieldValue("emailId", event.target.value);
	};

	const prefilledStage = () => {
		
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData.id);
			setstageName(editRecordData.stageName);
			setstageSeq(editRecordData.stageSeq);
			setparentId(editRecordData.parentId);
			setmandatory(editRecordData.mandatory);
			setemailId(editRecordData?.emailId);
			formik.setValues({
				...formik.values,
				emailevent:
					emaildata?.find((option) => option.id === editRecordData?.emailId)
						?.emailevent || "",
			});
			seteventType(editRecordData.eventType);
			setisActive(editRecordData.isActive);
			emailDataList(editRecordData.eventType);
		}
	};
	const clearfilledstage = () => {
		//seteditRecordData([]);
		formik.setFieldValue("id", 0);
		setstageName("");
		setstageSeq(0);
		seteventType("");
		setisActive(false);
		setmandatory(false);
		setemailId(0);
	};

	const handleChange = (e) => {
		const filteredValue = e.target.value.replace(/'/g, "");
		setstageName(filteredValue);
	};

	const handlestageSeqChange = (e) => {
		let inputValue = e.target.value;
		inputValue = inputValue.replace(/\D/g, "");
		inputValue = inputValue.slice(0, 2);
		setstageSeq(inputValue);
	};

	const [emaildata, setemaildata] = useState([]);
	const emailDataList = (EventType) => {
		var data = {
			EventType: EventType,
		};
		console.log("data", data);
		getEmailDetails(data, atoken).then((res) => {
			if (res?.length) {
				setemaildata(res);
			} else {
				setemaildata([]);
			}
		});
	};
	return (
		<>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="row">
					<div className="col-12 col-md-6 mb-2 mt-2">
						<FormControl fullWidth>
							<InputLabel id="eventType">Select Event Type *</InputLabel>
							<Select
								labelId="eventType"
								InputLabelProps={{
									shrink: true,
								}}
								variant="outlined"
								size="small"
								id="eventType"
								name="eventType"
								value={eventType}
								label="Select Event"
								onChange={(event, newvalue) => {
									onchangeEventType(event, newvalue);
								}}
								error={
									formik.touched.eventType && Boolean(formik.errors.eventType)
								}
								helperText={formik.touched.eventType && formik.errors.eventType}
							>
								{MenuMasterList?.map((option, i) => (
									<MenuItem key={i} value={option?.menuIdentity}>
										{option?.menuName}
									</MenuItem>
								))}
								<MenuItem
									value={"new"}
									className="bggray"
									style={{
										color: "blue",
										fontSize: "13PX",
										fontStyle: "italic",
										textDecoration: "underline",
										cursor: "pointer",
									}}
								></MenuItem>
							</Select>
							{formik.errors.eventType && formik.touched.eventType && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik.errors.eventType}
								</div>
							)}
						</FormControl>
					</div>
					<div className="col-12 col-md-6 mb-2 mt-2">
						<FormControl fullWidth>
							<InputLabel id="emailId">Select Email Template </InputLabel>
							<Select
								labelId="emailId"
								InputLabelProps={{
									shrink: true,
								}}
								variant="outlined"
								size="small"
								id="emailId"
								name="emailId"
								value={emailId}
								label="Select Email Event"
								onChange={(event, newvalue) => {
									onchangeEmailType(event, newvalue);
								}}
							>
								{emaildata?.map((option, i) => (
									<MenuItem key={i} value={option?.id}>
										{option?.emailevent}
									</MenuItem>
								))}
								{emaildata && emaildata.length === 0 && (
									<MenuItem disabled>
										No Email templates available for this Event
									</MenuItem>
								)}

								<MenuItem
									value={"new"}
									className="bggray"
									style={{
										color: "blue",
										fontSize: "13PX",
										fontStyle: "italic",
										textDecoration: "underline",
										cursor: "pointer",
									}}
								></MenuItem>
							</Select>
						</FormControl>
					</div>

					<div className="col-12 col-md-6 mb-3 mt-2">
						<TextFieldCell
							id="stageName"
							name="stageName"
							label="Stage Name *"
							value={stageName}
							onChange={handleChange}
						/>
						<div style={{ fontSize: "0.8em", color: "blue" }}>
							{stageName.length}/100
						</div>
						{formik.errors.stageName && formik.touched.stageName && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.stageName}
							</div>
						)}
					</div>
					<div className="col-12 col-md-6 mb-4 mt-2">
						<TextFieldCell
							id="stageSeq"
							name="stageSeq"
							label="Stage Sequence"
							placeholder=""
							value={stageSeq}
							onChange={handlestageSeqChange}
						/>

						{formik.errors.stageSeq && formik.touched.stageSeq && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.stageSeq}
							</div>
						)}
					</div>

					<div className="col-12 col-md-8 mb-3 d-flex align-items-center">
						<FormGroup className="mr-3 mb-0">
							<FormControlLabel
								control={
									<Checkbox
										name="mandatory"
										id="mandatory"
										checked={mandatory}
										onChange={(e) => {
											setmandatory(e?.target?.checked);
										}}
									/>
								}
								label={<span className="f14 text-muted">Required</span>}
							/>
						</FormGroup>
						<FormGroup className="mb-0">
							<FormControlLabel
								control={
									<Checkbox
										name="isActive"
										id="isActive"
										checked={isActive}
										onChange={(e) => {
											setisActive(e?.target?.checked);
										}}
									/>
								}
								label="Active"
							/>
						</FormGroup>
					</div>

					<div className="col-12 text-end mt-2">
						<LoadingButton
							variant="text"
							color="primary"
							className="me-3 text-capitalize"
							size="small"
							onClick={clearfilledstage}
						>
							Reset
						</LoadingButton>
						<LoadingButton
							type="submit"
							variant="outlined"
							color="primary"
							className="text-capitalize"
							size="small"
						>
							Submit
						</LoadingButton>
					</div>
				</div>
			</form>
		</>
	);
};

export default AddEditCell;
