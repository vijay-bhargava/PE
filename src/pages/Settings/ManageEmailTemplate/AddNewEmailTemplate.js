import React, { useState, useEffect } from "react";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { Editor } from "react-draft-wysiwyg";
import "../../../assets/css/base.css";
import { EditorState, ContentState, convertToRaw, convertFromHTML, convertFromRaw, Modifier, } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { LoadingButton } from "@mui/lab";
import { useFormik } from "formik";
import { Autocomplete, Button, Checkbox, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, } from "@mui/material";
import * as yup from "yup";
import { getEmailDetails, saveEmailDetails, UpdateEmailDetails, getEmailEvent, getEmailVariable, } from "../../../utils/emailmaster";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { actionTypes, useStateValue } from "../../../store";
import { getEventStage, formatDate, getMenuMaster, } from "../../../utils/common/utility";
import { useCookies } from "react-cookie";
import draftToHtml from "draftjs-to-html";
import { ArrayFromString, mapEmail } from "../../../utils/common";
import { stateToHTML } from "draft-js-export-html";
import { id } from "date-fns/locale";

  

const AddNewEmailTemplate = ({callbackstep,callbackStageOpen,editRecordData,seteditRecordData,emailId,preview,handleEmailModalClose,recorddata}) => {
	console.log("AddNewEmailTemplate"+ JSON.stringify(recorddata));
	const [mapEmaillist, setMapEmailList] = useState([]);
	// const isPreviewMode = preview;
	const [EmailList, setEmailList] = useState([]);
	

	const [localEditRecordData, setLocalEditRecordData] = useState(null);

	const fetchEmailDetails = (emailId) => {

		var dataRequest = {
			Id: emailId,
		};

		getEmailDetails(dataRequest, atoken)
			.then((res) => {
				if (res && res?.length > 0) { // Check if response contains valid data
					const data = res[0];
					console.log('fetchEmailDetails -> fetched data', data);
					// In preview mode, avoid mutating parent editRecordData. Use local state instead.
					if (preview) {
						setLocalEditRecordData(data);
					} else if (typeof seteditRecordData === "function") {
						seteditRecordData(data);
					}
				}
			})
			.catch((error) => {
				console.error("Error fetching email details:", error);
			});
	};
	

	
	const handleChange = (fieldName, newValue) => {
		switch (fieldName) {
			case "mailto":
				//setmailto(newValue);
				setmailto(newValue || []);
				break;
			case "mailcc":
				setmailcc(newValue || []);
				break;
			case "mailbcc":
				setmailbcc(newValue || []);
				break;
			default:
				break;
		}
	};

	const [cookies] = useCookies(["patkn", "prtkn"]);

	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();

	const [Modal, setModal] = useState(false);
	const CloseModal = () => setModal(false);
	const [modalStageOpen, setmodalStageOpen] = useState(false);
	const OpenModal = () => setModal(true);
	const closeStageModal = () => setmodalStageOpen(false);

	const openStageModal = () => {
		setmodalStageOpen(true);
	};

	

	const [mailto, setmailto] = useState([]);
	const [templateid, settemplateid] = useState(0);
	const [mailbcc, setmailbcc] = useState([]);
	const [isactive, setisactive] = useState(true);
	const [mailcc, setmailcc] = useState([]);
	const [EventType, setEventType] = useState("");
	const [emailbody1, setemailbody1] = useState("");
	const [emailsubject, setemailsubject] = useState("");
	
	const [emailsig, setemailsig] = useState("");
	const [footer, setfooter] = useState("");
	const [emailevent, setemailevent] = useState("");

	const initialContent = "<p></p>";
	const blocksFromHTML = convertFromHTML(initialContent);
	const initialContentState = ContentState.createFromBlockArray(
		blocksFromHTML.contentBlocks,
		blocksFromHTML.entityMap
	);
	const [editorState, setEditorState] = useState(EditorState.createEmpty());

	const [editorState2, setEditorState2] = useState(EditorState.createEmpty());

	const handleEditorState2Change = (newEditorState) => {
		setEditorState2(newEditorState);

		// Convert the current content to a string and set it in the formik field
		const contentState = newEditorState.getCurrentContent();
		const plaintext = contentState.getPlainText();
		const html = stateToHTML(contentState);
		if (plaintext != "") {
			formik.setFieldValue("footer", html);
		} else {
			formik.setFieldValue("footer", "");
		}
	};

	const [editorState3, setEditorState3] = useState(EditorState.createEmpty());

	const [stageId, setStageId] = useState("");
	
	const [eventstageList, setEventstageList] = useState([]);

	const pullgetEventStage = (EventTypeId) => {
		var data = {
			CustomerId: customerid,
			IsActive: true,
			EventType: EventTypeId,
		};
		console.log(data);
		getEventStage(data, atoken).then((res) => {
			setEventstageList(res);
		});
	};

	const onchangeEventType = (event, newValue) => {
		
		setEventType(event?.target?.value);
		if (editRecordData && event?.target?.value !== editRecordData?.eventType) {
			setStageId(0);
		}
		pullgetEventStage(event?.target?.value);
		pullEmailVariable(event?.target?.value);
		formik?.setFieldValue("EventType", event?.target?.value);
	};

	const handleEditorStateChange = (newEditorState) => {
		
		setemailevent(formik.values.emailevent);
		setEditorState(newEditorState);
		


		const contentState = newEditorState.getCurrentContent();
        
		const plaintext = contentState.getPlainText();
		const html = stateToHTML(contentState);
		if (plaintext !== "") {
			setemailbody1(html);
			formik.setFieldValue('emailbody1', html);  // Update emailbody1 value in Formik state
		  } else {
			formik.setFieldValue('emailbody1', "");  // Clear emailbody1 if no content
		  }
		// if (plaintext != "") {
		// 	setemailbody1(html);
		// 	setemailevent(emailevent);
		
		// } else {
		// 	setemailbody1("");
		
		// }
	};

	const [emailEventList, setemailEventList] = useState([]);
	const handleEventChange = (e) => {
		formik.setFieldValue("emailevent[0].emaileventid", e.target.value);
	};



	
	

	
	
	
	const Emaileventfind = () => {
		getEmailEvent().then((res) => {
			//if (res?.length)
			if (res && Array.isArray(res)) {
				console.log("data", res);
				setemailEventList(res);
			} else {
				return;
			}
		});
	};
	const validationSchema = yup.object({
		EventType: yup
			.string("Please Select an Event")
			.required("Event type is required"),

		emailevent: yup
			.string("Please Select an Event")
			.required("Email Event is required"),
		emailsubject: yup
			.string("please Enter subject")
			.required("Email Subject is required"),
		emailbody1: yup.string()
			.test('is-string', 'Email Subject is required', value => {
				
			 
			  return typeof value === 'string';  // Check if value is a string
			})
			.test('is-required', 'Email Body is required', value => {
				
			  console.log('Testing required validation:', value);
			  return value && value.trim() !== '';  // Check if value is not empty or whitespace
			}),
		stageId: yup.string("Please Select an Event").required("Stage is required"),
	});

	const formik = useFormik({
		enableReinitialize:true,
		initialValues: {
			id: editRecordData?.id ? editRecordData.id : 0,
			emailevent: editRecordData?.emailevent ? editRecordData.emailevent : emailevent,
			emailsubject: editRecordData?.emailsubject
				? editRecordData.emailsubject
				: emailsubject,
			templateid: editRecordData?.templateid ? editRecordData.templateid : 0,
			// mailto: editRecordData?.mailto ? editRecordData.mailto : "",
			// mailcc: editRecordData?.mailcc ? editRecordData.mailcc : "",
			// mailbcc: editRecordData?.mailbcc ? editRecordData.mailbcc : mailbcc,
			subvarid: editRecordData?.subvarid ? editRecordData.subvarid : 0,
			EventType: editRecordData?.EventType
				? editRecordData.EventType
				: EventType,
			stageId: editRecordData?.setStageId ? editRecordData.setStageId : stageId,
			emailbody1:emailbody1,
			footer: "",
			isactive: editRecordData?.isactive ? editRecordData.isactive : true,
			createdon: editRecordData?.createdon ? editRecordData.createdon : "",
			createdby: editRecordData?.createdby ? editRecordData.createdby : 1,
			modifiedby: editRecordData?.modifiedby ? editRecordData.modifiedby : 0,
		},

		validationSchema: validationSchema,
		onSubmit: (values) => {
			console.log("values", values);
             
			let createdDate = values.createdon;
			if (values.id == 0) {
				createdDate = new Date().toISOString();
			}

			var data = {
				id: values.id,
				emailevent: values.emailevent,
				emailsubject: values.emailsubject,
				templateid: templateid,
				mailto: mailto,
				mailcc: mailcc,
				mailbcc: mailbcc,
				subvarid: 0,
				eventType: EventType,
				stageId: stageId,
				emailbody1: values.emailbody1,
				footer: values.footer,
				isactive: isactive,
				createdon: createdDate,
				createdby: 1,
				modifiedby: 0,
			};
			console.log("data -- final", data);
			setLoading(true);
			if (editRecordData && editRecordData.id > 0) {
				UpdateEmailDetails(data, editRecordData?.id, atoken).then((res) => {
					setLoading(false);

					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilledEmail();
					toast.success("Email updated successfully!", {
					  toastId: "EmailService"
					});
					callbackstep("update");
					return true;
				});
			} else {
				saveEmailDetails(data, atoken).then((res) => {
					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilledEmail();
					toast.success("Email added successfully!", {
					  toastId: "Emailadded"
					});
					callbackstep("add");
					return true;
				});
			}
			//to handle Close of email template modal
			handleEmailModalClose()
		},
	});

	const prefilledemailFromData = async (data) => {
		if (!data) return;
		console.log('prefilledemailFromData -> incoming data', data);
		// Normalize emailevent into a displayable string.
		let emaileventValue = "";
		if (data?.emailevent != null) {
			if (typeof data.emailevent === "string") {
				emaileventValue = data.emailevent;
			} else if (Array.isArray(data.emailevent) && data.emailevent.length > 0) {
				emaileventValue = data.emailevent[0]?.emaileventname || data.emailevent[0]?.emaileventid || "";
			} else if (typeof data.emailevent === "object") {
				emaileventValue = data.emailevent?.emaileventname || data.emailevent?.emaileventid || "";
			} else {
				emaileventValue = String(data.emailevent);
			}
		}
		const emailsubjectValue = data?.emailsubject || "";
		
		// Prepare normalized eventType and stageId as strings
		const eventTypeValue = data?.eventType != null ? String(data?.eventType) : "";
		const stageIdValue = data?.stageId != null ? String(data?.stageId) : "";
		
		// Update local state variables so they're in sync with formik
		setemailevent(emaileventValue);
		setemailsubject(emailsubjectValue);
		setEventType(eventTypeValue);
		setStageId(stageIdValue);
		setmailbcc(data?.mailbcc ? ArrayFromString(data?.mailbcc) : []);
		setmailto(data?.mailto ? ArrayFromString(data?.mailto) : []);
		setmailcc(data?.mailcc ? ArrayFromString(data?.mailcc) : []);
		setisactive(data?.isactive);
		setemailsig(data?.emailsig);

		// Apply core form values in one set to avoid intermediate empty renders
		const newValues = {
			...formik.values,
			id: data?.id || 0,
			emailevent: emaileventValue,
			emailsubject: emailsubjectValue,
			EventType: eventTypeValue,
			stageId: stageIdValue,
			pagenumber: data?.pagenumber,
		};
		formik.setValues(newValues);
		console.log('prefilledemailFromData applied values to formik', { 
			emailevent: emaileventValue, 
			emailsubject: emailsubjectValue, 
			EventType: eventTypeValue, 
			stageId: stageIdValue 
		});

		pullgetEventStage(data?.eventType);
		pullEmailVariable(data?.eventType);

		if (data?.emailbody1 && data?.emailbody1 !== "") {
			const contentBlock = convertFromHTML(data?.emailbody1);
			if (contentBlock) {
				const contentState = ContentState.createFromBlockArray(
					contentBlock.contentBlocks
				);
				const initialEditorState = EditorState.createWithContent(contentState);

				const contentStatetemp = initialEditorState.getCurrentContent();
				const plaintext = contentStatetemp.getPlainText();
				const html = stateToHTML(contentStatetemp);

				if (plaintext !== "") {
					setemailbody1(html);
				} else {
					setemailbody1("");
				}
				handleEditorStateChange(initialEditorState);
			}
		}
		// If in preview mode, ensure event stage list is fetched so the stage label can be shown
		if (preview) {
			try {
				const stageReq = { CustomerId: customerid, IsActive: true, EventType: data?.eventType };
				const stages = await getEventStage(stageReq, atoken);
				setEventstageList(stages);
				console.log('Fetched stages for preview', stages);
				// update stageName once stages are available - PRESERVE existing form values
				const foundStage = stages?.find((option) => String(option?.id) === String(data?.stageId));
				const stageNameValue = foundStage?.stageName || "";
				// Use setFieldValue to update stageName without overwriting other fields
				formik.setFieldValue("stageName", stageNameValue);
				// Re-apply critical fields to ensure they're not lost
				formik.setFieldValue("emailevent", emaileventValue);
				formik.setFieldValue("emailsubject", emailsubjectValue);
				formik.setFieldValue("stageId", stageIdValue);
				console.log('Preview mode: reapplied values after stage fetch', {
					emailevent: emaileventValue,
					emailsubject: emailsubjectValue,
					stageName: stageNameValue,
					stageId: stageIdValue
				});
			} catch (err) {
				console.error('Error fetching stages for preview prefill', err);
			}
		}
	};

	// Keep compatibility: wrapper that uses editRecordData when invoked elsewhere
	const prefilledemail = async () => {
		await prefilledemailFromData(editRecordData);
	};

	

	const clearfilledEmail = () => {
		// reset local preview state as well
		setLocalEditRecordData(null);
		formik.setFieldValue("id", 0);
		formik.setFieldValue("emailsubject", "");
		setmailbcc("");
		setmailto("");
		setmailcc("");
		setEventType("");
		setisactive(false);
		setemailsig("");
		setfooter("");
	};

	const [EmailVariable, setEmailVariable] = useState([]);
	const pullEmailVariable = (EventType) => {
		var data = {
			EventType: EventType,
		};
		getEmailVariable(data, atoken).then((res) => {
			setEmailVariable(res);
		});
	};
	

	const [MenuMasterList, setMenuMasterList] = useState([]);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
			AccessLevel : "Setup"
		};

		getMenuMaster(data, atoken).then((res) => {
			setMenuMasterList(res);
		});
	};


	const checkExistingRecord = (eventType, stageId) => {
		
		const existingRecord = recorddata.find(record => 
			record.eventType === eventType && record.stageId === stageId
		);
	
		return Promise.resolve(existingRecord);
	};
	
	// const handleStageChange = (e) => {
	// 	const value = e.target.value;

	// 	if (value === "new") {
	// 		callbackStageOpen();
	// 	} else {
	// 		setStageId(value);
	// 	}
	// 	formik && formik.setFieldValue("stageId", value);
	// };
	const handleStageChange = async (e) => {
		
		const newStageId = e.target.value;
		const currentEventType = formik.values.EventType;
	
		if (newStageId !== "new") {
			const existingRecord = await checkExistingRecord(currentEventType, newStageId);
			// if (existingRecord) {
			// 	toast.error("A record with the same eventType and stageId already exists.", {
			// 	  toastId: "Emailaddedrecord"
			// 	});
			// 	return; 
			// }
		}
	
	
		setStageId(newStageId);
		formik.setFieldValue("stageId", newStageId);
	
		if (newStageId === "new") {
			callbackStageOpen();
		}
	};
	
	const insertvar = (varValue) => {
		
		console.log("hi", varValue);

		const selection = editorState.getSelection();
		const contentState = editorState.getCurrentContent();
		const contentStateWithEntity = contentState.createEntity(
			"VARIABLE",
			"IMMUTABLE",
			{ value: varValue }
		);
		const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

		const newContentState = Modifier.replaceText(
			contentStateWithEntity,
			selection,
			`{@${varValue}}`,
			null,
			entityKey
		);

		const newEditorState = EditorState.push(
			editorState,
			newContentState,
			"insert-characters"
		);
		handleEditorStateChange(newEditorState);
	};

	//##useeffect
	useEffect(() => {
		mapEmail(customerid, atoken)?.then((res) => {
			
			setMapEmailList(res);
		});
	}, [emailId]);

	// Ensure Event Type options are loaded on mount so preview can display selected label
	useEffect(() => {
		pullMenuMaster();
	}, []);

	useEffect(() => {
		console.log('DEBUG MenuMasterList length', MenuMasterList?.length);
		console.log('DEBUG eventstageList length', eventstageList?.length);
	}, [MenuMasterList, eventstageList]);

	

	useEffect(() => {
		
		if (emailId) {
           
			fetchEmailDetails(emailId);
			
		}
	}, [emailId]);
	useEffect(() => {
		// When parent editRecordData changes and we are NOT in preview mode,
		// populate the form from the parent data.
		if (editRecordData && !preview) {
			prefilledemailFromData(editRecordData);
		}
	}, [editRecordData, preview]);

	useEffect(() => {
		// When in preview mode and localEditRecordData is fetched, populate preview-only form fields
		if (localEditRecordData && preview) {
			console.log('localEditRecordData changed in preview', localEditRecordData);
			prefilledemailFromData(localEditRecordData);
		}
	}, [localEditRecordData, preview]);


	const submitemailformik=()=>{

		
		formik.submitForm()
	}

	//##
	const handleChangeSubject = (event) => {
		
		// Using Formik's setFieldValue to update the value of emailsubject
		formik.setFieldValue("emailsubject", event.target.value);
		setemailsubject(event.target.value);
	  };
	  const handleChangeevent = (event) => {
		
		// Using Formik's setFieldValue to update the value of emailsubject
		formik.setFieldValue("emailevent", event.target.value);
		setemailevent(event.target.value);
	  };
	  
	return (
		<>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="row">
					
					<div className="col-6 col-md-6 mb-3">
						<FormControl fullWidth>
							<TextField
								id="EventType"
								inputlabelprops={{ shrink: true }}
								name="EventType"
								select
								className="w-100 f14"
								size="small"
								label="Event Type"
								variant="outlined"
								value={formik.values.EventType || EventType}
								onChange={(event, newvalue) => {
									onchangeEventType(event, newvalue);
								}}
								InputProps={{ readOnly: preview }}
							>
								{MenuMasterList?.map((option, i) => (
									<MenuItem key={i} value={String(option?.menuIdentity)}>
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
							</TextField>
						</FormControl>

						{formik.errors.EventType && formik.touched.EventType && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.EventType}
							</div>
						)}
					</div>
					<div className="col-6 col-md-6 mb-3">
						<FormControl fullWidth>
							<InputLabel id="stageId">Select Event Stage</InputLabel>
							<Select
								labelId="event"
								inputlabelprops={{
									shrink: true,
								}}
								variant="outlined"
								size="small"
								id="stageId"
								name="stageId"
								value={formik.values.stageId || stageId}
								label="Select Stage 1"
								
								onChange={handleStageChange}
								readOnly={preview} 
								
							>
								{eventstageList?.map((option, i) => (
									<MenuItem key={i} value={String(option?.id)}>
										{option?.stageName}
									</MenuItem>
								))}
								{/* {EventType && (
									<MenuItem
										value={"new"}
										className="bggray"
										style={{
											color: "blue",
											fontSize: "13px",
											fontStyle: "italic",
											textDecoration: "underline",
											cursor: "pointer",
										}}
									>
										<ins>ADD NEW</ins>
									</MenuItem>
								)} */}
							</Select>
							{formik.errors.stageId && formik.touched.stageId && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik.errors.stageId}
								</div>
							)}
						</FormControl>
					</div>

					<div className="col-12 col-md-12 mb-3">
    <TextFieldCell
        id="emailevent"
        name="emailevent"
        label="Email Event Name *"
		
        placeholder=""
        value={formik.values.emailevent}
        onChange={handleChangeevent}
        maxLength={100}
        InputProps={{
           // readOnly: preview,
            endAdornment: formik.values.emailevent && (  
                <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                        {formik.values.emailevent?.length}/100
                    </Typography>
                </InputAdornment>
            )
        }}
    />
    {/* Error message display */}
    {formik.errors.emailevent && formik.touched.emailevent && (
        <div className="error error-red" style={{ fontSize: "9px" }}>
            {formik.errors.emailevent}
        </div>
    )}
</div>

					<div className="col-12 col-md-6 mb-3">
						<Autocomplete
							id="mailto"
							name="mailto"
							placeholder=""
							disablePortal
							multiple
							size="small"
							
							options={[...mapEmaillist]}
							fullWidth
							renderInput={(params) => (
								<TextField
									{...params}
									inputlabelprops={{
										shrink: true,
									}}
									label="Email To"
									
								/>
							)}
							getOptionLabel={(option) => option}
							
							value={mailto || []}
							
							onChange={(event, newValue) => handleChange("mailto", newValue)}
							
						/>
					</div>
					<div className="col-12 col-md-6 mb-3">
						<Autocomplete
							id="mailcc"
							name="mailcc"
							placeholder=""
							disablePortal
							multiple
							size="small"
							
							options={mapEmaillist ?? []}
							fullWidth
							renderInput={(params) => (
								<TextField
									{...params}
									inputlabelprops={{
										shrink: true,
									}}
									label="Email CC"
								/>
							)}
							getOptionLabel={(option) => option}
							value={mailcc || []}
							onChange={(event, newValue) => handleChange("mailcc", newValue)}
							readOnly={preview} 
						/>
					</div>
					{/* <div className="col-12 col-md-6 mb-3">
						<Autocomplete
							id="mailbcc"
							name="mailbcc"
							placeholder=""
							disablePortal
							multiple
							size="small"
							
							options={[...mapEmaillist]}
							fullWidth
							renderInput={(params) => (
								<TextField
									{...params}
									inputlabelprops={{
										shrink: true,
									}}
									label="Email BCC"
								/>
							)}
							getOptionLabel={(option) => option}
							value={mailbcc || []}
							onChange={(event, newValue) => handleChange("mailbcc", newValue)}
							
						/>
					</div> */}
					<div className="col-12 col-md-6 mb-3">
						<TextFieldCell
							id="emailsubject"
							name="emailsubject"
							label="Email Subject*"
							placeholder=""
							value={formik.values.emailsubject}
							//onChange={formik.handleChange}
							onChange={handleChangeSubject}
							maxLength={100}
							InputProps={{
								
								endAdornment: formik.values.emailsubject && (  
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.emailsubject?.length}/100
										</Typography>
									</InputAdornment>
								)
							}}
						/>
						{formik.errors.emailsubject && formik.touched.emailsubject && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.emailsubject}
							</div>
						)}
						
					</div>

					

					
					<div className="col-12 col-md-6 mb-3">
							<TextField
								style={{ width: "100%" }}
								inputlabelprops={{
									shrink: true,
								}}
								variant="outlined"
								select
								id="dynamicfield"
								name="dynamicfield"
								label="Dynamic Field"
								size="small"
								onChange={(event) => {
									insertvar(event.target.value);
								}}
							
							>
								{EmailVariable?.map((option, i) => (
									<MenuItem key={i} value={option?.variableName}>
										{option?.variableName}
									</MenuItem>
								))}
							</TextField>
						</div>
						<div className="col-12 mb-3">
						<div className="f12 text-muted mb-1">Email Body*</div>
						
						<Editor
							editorState={editorState}
							wrapperClassName="wrapperClassName"
							editorClassName="border"
							editorStyle={{ minHeight: 150 }}
							onEditorStateChange={handleEditorStateChange}
							toolbar={{
								inline: { inDropdown: true },
								list: { inDropdown: true },
								textAlign: { inDropdown: true },
								link: { inDropdown: true },
								history: { inDropdown: false },
							}}
							
						/>
						{formik.errors.emailbody1 && formik.touched.emailbody1 && (
							<div className="error error-red" style={{ fontSize: "9px" }}>
								{formik.errors.emailbody1}
							</div>
						)}
					</div>
					<div className="row">
						
						<div className="col-12 col-md-8 mb-3 ml-3">
							<FormControlLabel
								control={
									<Checkbox
										name="isactive"
										id="isactive"
										checked={isactive}
										onChange={(e) => {
											setisactive(e?.target?.checked);
										}}
										disabled={preview} 
									/>
								}
								label="Active"
							/>
						</div>
					</div>
					

					<div className="col-12 text-end">
						{!loading ? (
							
							<>
								 <Button
									color="success"
									variant="outlined"
									size="small"
									type="button"
									disabled={!stageId}
									onClick={submitemailformik}
									
								>
									Submit
								</Button>
							</>
						) : (
							<LoadingButton className="" loading variant="contained">
								Submit ...
							</LoadingButton>
						)}
					</div>
				</div>
				<>
					
				</>
			</form>
		</>
	);
};

export default AddNewEmailTemplate;
