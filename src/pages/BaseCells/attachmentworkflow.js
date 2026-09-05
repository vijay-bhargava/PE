import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { HiUserGroup, HiOutlineX, HiX, HiPlusSm } from "react-icons/hi";
import {
	Badge,
	Box,
	Checkbox,
	Drawer,
	IconButton,
	Input,
	Radio,
	Tab,
	Tabs,
	Tooltip,
	Alert,
} from "@mui/material";
import { FaRegFloppyDisk, FaPaperclip } from "react-icons/fa6";
import FormControlLabel from "@mui/material/FormControlLabel";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { PersonOutlined } from '@mui/icons-material';

import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { Button, Form } from "react-bootstrap";
import { LoadingButton } from "@mui/lab";
import { uploadFilesOnAzure } from "../../utils/documentlibrary";
import { useStateValue } from "../../store";
import { toast } from "react-toastify";
import {
	AddMultiplePRAttachments,
	buildQueryParams,
	uploadFilesOnAzurePR,
} from "../../utils/purchaseRequest";
import {
	attachmentmodalforevent,
	downloadFilesOnAzure,
	eventattachmentmodal,
	filequeryparam,
	getExtension,
	getFileName,
	getPayloadWithFilePath,
	toastoption,
	validateFileSize,
} from "../../utils/common";
import { ApiClient, api } from "../../Apiclient";
import { useNavigate } from "react-router-dom";
import { Badge as BadgeStrap } from "react-bootstrap";
import { CLAIM_TYPES, ACTIONS } from "../../utils/permissionManager";

const AttachmentWorkFlow = forwardRef(({ eventtype, eventid, action, handleattachmentforevent, onCountChange, permissionManager }, attachmentdrawerref) => {

	const navigate = useNavigate();


	const [{ atoken, rtoken, customerid, customersuffix, userDetail }, dispatch] =
		useStateValue();

	const apiClient = new ApiClient(customersuffix);

	const [attachment, setAttachement] = useState(null);
	const [attachmentDesc, setattachmentDesc] = useState("");

	const fileInputRef = useRef(null);

	const [AttachFiles, setAttach] = useState([]);
	const [error, setError] = useState("");
	useEffect(() => {


		fetchAttachments();
	}, [eventid, eventtype]);

	const [savedAttachment, setSavedAttacchment] = useState([]);
	const [hasCheckboxChanged, setHasCheckboxChanged] = useState(false);

	const fetchAttachments = async () => {
		let res = [];
		const urlPath = window.location.pathname;
		const urlParams = new URLSearchParams(window.location.search);
		const idFromPath = urlPath.split('/').pop();
		const idFromQuery = urlParams.get('id') || urlParams.get('eventId') || urlParams.get('bidId');
		const effectiveEventId = eventid || idFromQuery || (isNaN(idFromPath) ? null : idFromPath);

		// Reset checkbox changed state when fetching attachments
		setHasCheckboxChanged(false);

		if (parseInt(effectiveEventId)) {
			const data = {
				EventType: eventtype,
				EventId: effectiveEventId,
				VendorId: 0,
				//isactive:"true"
			};
			const queryParams = buildQueryParams(data);
			res = await apiClient.getres(`/api/eventattachment/Find?${queryParams}`, atoken);
			const resData = res?.data?.result || []; // Default to an empty array if undefined
			if (resData?.length > 0) {
				const reseventData = resData?.length > 0 ? attachmentmodalforevent(resData, effectiveEventId, eventtype) : [];
				setSavedAttacchment(reseventData);
				handleattachmentforevent(reseventData);
				setAttach([]);
				onCountChange?.(reseventData.length);
			} else {
				// No attachments found, set empty arrays and update count to 0
				setSavedAttacchment([]);
				handleattachmentforevent([]);
				setAttach([]);
				onCountChange?.(0);
			}
		}
		else {
			//fetch attachment from event only
			const payload = {
				CustomerId: customerid,
				eventtype: eventtype,
				isactive: "true"
			};
			const queryParamsevent = buildQueryParams(payload);
			const resevent = await apiClient.getres(`/api/Doclib/Find?${queryParamsevent}`, atoken);
			const reseventData =
				resevent?.data?.result.length > 0
					? eventattachmentmodal(resevent?.data?.result, eventid, eventtype)
					: [];
			setAttach(reseventData);

			handleattachmentforevent(reseventData)
			onCountChange?.(reseventData.length);

		}
	};

	const [isAdding, setIsAdding] = useState(false);

	const addAttachment = async () => {
		setIsAdding(true);
		try {

			if (validateFields()) {
				if (!attachment || !attachment?.file) {
					toast.error("Please attach file to add", { toastId: "attachmentfile" });
					return;
				}
				if (!attachmentDesc || attachmentDesc.trim() === "") {
					toast.error("Please enter a description for the attachment", {
						toastId: "attachmentDesc",
					});
					return;
				}

				const Data = {
					eventId: eventid,
					eventType: eventtype,
					attachmentDescription: attachmentDesc,
					attachment: attachment?.file?.name,
					docRefId: 0,
					createdById: userDetail?.id,
					createdByName: userDetail?.name,
				};

				let path;
				let data;

				if (attachment) {

					const filedata = filequeryparam({
						EventType: eventtype,
						EventId: eventid,
						Description: "General",
						CustomerId: customerid
					});

					// Upload file to Azure
					path = await uploadFilesOnAzure(filedata, attachment?.file, atoken);

					if (!path) {
						return; // stop if file upload failed
					}

					// Build payload with uploaded file path
					data = getPayloadWithFilePath("fileNamePath", path, Data);

					// Update attachments state
					const updatedattach = [...AttachFiles, data];
					setAttach(updatedattach);

					// Save or hold attachment depending on eventid
					if (eventid) {
						handlesaveAttachment(updatedattach);
					} else {
						handleattachmentforevent(updatedattach);
					}

					// Update the count in parent component
					onCountChange?.(savedAttachment.length + updatedattach.length);

					// Clear input fields
					setattachmentDesc("");
					setAttachement(null);
					fileInputRef.current.value = null;
				}
				else {
					toast.error("Please attach file to add", { toastId: "attachmentfile" });
					return;
				}
			}
		}
		catch (error) {
			toast.error("Failed to add attachment. Please try again.");
		}
		finally {
			setIsAdding(false);
		}
	};

	// const addAttachment = async () => {

	// 	// Check if fields are valid (for attachment and description)
	// 	if (validateFields()) {
	// 		if (!attachment || !attachment?.file) {
	// 			// If no file is attached, show the error
	// 			toast.error("Please attach file to add", { toastId: "attachmentfile" });
	// 			return;
	// 		}

	// 		if (!attachmentDesc || attachmentDesc.trim() === "") {
	// 			// If description is empty, show an error
	// 			toast.error("Please enter a description for the attachment", { toastId: "attachmentDesc" });
	// 			return;
	// 		}

	// 		// Prepare the data payload to send to the server
	// 		const Data = {
	// 			eventId: eventid,
	// 			eventType: eventtype,
	// 			attachmentDescription: attachmentDesc,
	// 			attachment: attachment?.file?.name,
	// 			docRefId: 0,
	// 			createdById: userDetail?.id,
	//             createdByName: userDetail?.name
	// 		};

	// 		let path;
	// 		let data;

	// 		// If a file is selected
	// 		if (attachment) {
	// 			// Prepare file data
	// 			const filedata = filequeryparam({
	// 				EventType: eventtype,
	// 				EventId: eventid,
	// 				Description: attachmentDesc, // Use description here
	// 			});

	// 			// Upload file to Azure
	// 			path = await uploadFilesOnAzure(filedata, attachment?.file, atoken);

	// 			if (!path) {
	// 				// If the file upload failed, return early
	// 				return;
	// 			}



	// 			// Once the file is uploaded, prepare the data payload with file path
	// 			data = getPayloadWithFilePath("fileNamePath", path, Data);

	// 			// Add the new attachment to the list of attachments
	// 			const updatedattach = [...AttachFiles, data];
	// 			setAttach(updatedattach);

	// 			// Handle saving the attachment
	// 			if (eventid) {
	// 				handlesaveAttachment(updatedattach);
	// 			} else {
	// 				handleattachmentforevent(updatedattach);
	// 			}

	// 			// Clear attachment description and file input after success
	// 			setattachmentDesc("");  
	// 			setAttachement(null);
	// 			fileInputRef.current.value = null;
	// 		} else {
	// 			// If no file is attached, show error message
	// 			toast.error("Please attach file to add", { toastId: "attachmentfile" });
	// 			return;
	// 		}
	// 	}
	// };

	useImperativeHandle(attachmentdrawerref, () => ({
		handledrawer: () => {
			setState((prevState) => ({
				...prevState,
				["technicalApprovalDrawer"]: !prevState["technicalApprovalDrawer"],  // This toggles the state for the specific anchor
			}));
		}

	}));

	const handleAttachmentdescChange = (e) => {
		const input = e?.target?.value;
		// Remove single quote character from input
		const sanitizedInput = input.replace(/'/g, "");
		// Set the sanitized input
		setattachmentDesc(sanitizedInput);
	};

	const handleFileChange = (event) => {
		const selectedFile = event.target.files[0];
		if (!validateFileSize(event)) {
			event.target.value = null;
			setAttachement(null);

			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			return; // Stop further processing if file size is invalid
		}

		if (selectedFile.length > 50) {
			toast.error(
				"Attachment name must be 50 characters or fewer.",
				toastoption
			);
			event.target.value = null;
			return;
		}

		if (selectedFile) {
			setAttachement((prevFilters) => ({
				...prevFilters,

				file: selectedFile,
			}));
		}
	};

	const validateFields = () => {
		if (!attachmentDesc || !attachment) {

			setError("Please provide a description and select a file to upload.");
			return false;
		}
		setError("");
		return true;
	};

	const [isUpdating, setIsUpdating] = useState(false);

	const handleAttachmentUpdate = async () => {

		if (savedAttachment && savedAttachment.length > 0) {

			setIsUpdating(true);

			try {
				const files = savedAttachment.map(x => ({
					...x,
					eventId: eventid,
					createdById: userDetail?.id,
					createdByName: userDetail?.name
				}));

				// const data = { attachments: Files };


				const res = await apiClient.postres(
					`/api/eventattachment/UpdateAttachments`,
					files,
					atoken
				);

				if (res) {
					toast.success(`Attachments have been updated successfully.`, {
						toastId: "rfqmanage_update2",
					});
					// Reset checkbox changed state after successful update
					setHasCheckboxChanged(false);
				}
			}
			catch (error) {
				toast.error("Failed to update attachments. Please try again.");
			}
			finally {
				setIsUpdating(false);
			}
		}
	};

	// const handleAttachmentUpdate = async () => {
	// 	if (savedAttachment && savedAttachment.length > 0) {
	// 		const Files = savedAttachment.map((x) => {
	// 			x.eventId = eventid;
	// 			x.createdById = userDetail?.id;
	// 			x.createdByName = userDetail?.name;
	// 			return x;
	// 		});

	// 		const data = {
	// 			attachments: Files,
	// 		};
	// 		const res = await apiClient.postres(
	// 			`/api/eventattachment/${eventid}/UpdateAttachments`,
	// 			data,
	// 			atoken
	// 		);
	// 		if (res) {
	// 			//toast.success(`attachment is saved successfully`);

	// 		}
	// 		toast.success(`Attachments have been updated successfully.`, {
	// 			toastId: "rfqmanage_update2"
	// 		});
	// 	}


	// }

	const [state, setState] = useState({
		technicalApprovalDrawer: false,
	});
	const toggleDrawer = (anchor, open) => (event) => {
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};
	const CloseDrawerForAttachment = () => {
		setAttachement(null);
		setattachmentDesc("");
		setState({ ...state, ["technicalApprovalDrawer"]: false });
	};
	const handleRemoveAttachment = async (index, id) => {
		const updatedAttachments = [...savedAttachment];
		updatedAttachments[index].removed = true;
		const res = await apiClient.postres(
			`/api/eventattachment/${id}/Delete`,
			null,
			atoken
		);
		if (res) {
			toast.success(`item deleted successfully`);
			const renderedAttachments = updatedAttachments.filter(
				(attachment) => !attachment.removed
			);
			setSavedAttacchment(renderedAttachments);
			// Update parent component with the updated attachments array
			const allAttachments = [...renderedAttachments, ...AttachFiles];
			handleattachmentforevent(allAttachments);
			onCountChange?.(allAttachments.length);
		}
	};
	const handlesaveAttachment = async (AttachFiles) => {

		const data = {
			attachments: AttachFiles,
		};
		const res = await apiClient.postres(
			`/api/eventattachment/${eventid}/AddMultiple`,
			data,
			atoken
		);
		if (res) {
			toast.success(`file is saved successfully`);
			fetchAttachments();
		}
	};
	const uploadFileOnSelection = async (event, index) => {

		const file = event.target.files[0];
		if (!file) return;
		const currentItem = AttachFiles[index];

		// Prepare file data for the upload
		const filedata = filequeryparam({
			EventType: eventtype,
			EventId: eventid,
			Description: "General", // Use existing description
			CustomerId: customerid
		});
		// Upload the file to Azure
		const path = await uploadFilesOnAzure(filedata, file, atoken);
		if (!path) {
			// Handle upload failure
			toast.error("File upload failed. Please try again.", { toastId: "fileuploadfail" });
			return;
		}

		// Prepare updated attachment data, preserving the attachmentDescription
		const updatedAttachments = [...AttachFiles];
		updatedAttachments[index] = {
			...updatedAttachments[index],
			attachment: file.name, // Store the file name
			fileNamePath: path,    // Store the file path returned by Azure
			eventId: eventid,
			createdById: userDetail?.id,
			createdByName: userDetail?.name
		};

		// Update the state with the new file path and name, without modifying attachmentDescription
		setAttach(updatedAttachments);
		if (eventid) {
			handlesaveAttachment(updatedAttachments);
		} else {
			handleattachmentforevent(updatedAttachments);
		}
		// Update the count in parent component
		onCountChange?.(savedAttachment.length + updatedAttachments.length);
	};

	const handleRemoveAdd = (index) => {
		if (index >= 0 && index < AttachFiles.length) {
			AttachFiles.splice(index, 1);
			setAttach([...AttachFiles]);
			handleattachmentforevent(AttachFiles);
			// Update the count in parent component
			onCountChange?.(savedAttachment.length + AttachFiles.length);
		}
	}


	//##
	return (
		<>
			<Tooltip title="Attachments">
				<IconButton
					size="large"
					style={{ fontSize: "40px" }}
					className="border-primary  bg-white"
					onClick={toggleDrawer("technicalApprovalDrawer", true)}
				>
					<Badge
						style={{ padding: "0px 4px", fontSize: "10px" }}

						badgeContent={
							savedAttachment.length > 0
								? savedAttachment?.length
								: AttachFiles?.length
						}
						color={AttachFiles?.length > 0 ? "success" : "info"}
					>
						<FilePresentIcon className="f22" />
					</Badge>
				</IconButton>
			</Tooltip>
			<React.Fragment key="top">
				<Drawer
					anchor="right"
					open={state["technicalApprovalDrawer"]}
					onClose={toggleDrawer("technicalApprovalDrawer", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderNotificationCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Attachments</div>
									<div>
										<IconButton
											onClick={toggleDrawer("technicalApprovalDrawer", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>

							{/* Permission Status Display */}
							{(() => {
								const canRead = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.READ) ?? false;
								const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.EDIT) ?? false;
								const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.CREATE) ?? false;
								const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.REMOVE) ?? false;

								// Show permission status
								if (permissionManager) {
									return (
										<div className="p-3 pb-0">

										</div>
									);
								}
								return null;
							})()}

							{action && <div className="h50px"></div>}
							<Box sx={{ flexGrow: 1, p: 2 }}>
								{(() => {
									const canRead = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.READ) ?? false;

									if (!canRead) {
										return (
											<div className="p-3">
												<Alert severity="warning">
													You don't have permission to view document library.
												</Alert>
											</div>
										);
									}

									return (
										<>
											<div className="border-bottom mb-2 pt-1 pb-1">
												{action && (
													<div className="row">
														{/* Attachment Description Input */}
														<div className="col-md-4">
															{(() => {
																const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.CREATE) ?? false;
																return (
																	<Input
																		placeholder="Attachment Description"
																		id="attachmentDesc"
																		name="attachmentDesc"
																		fullWidth
																		variant="outlined"
																		className=""
																		value={attachmentDesc}
																		onChange={handleAttachmentdescChange}
																		disabled={!canCreate}
																	/>
																);
															})()}
														</div>
														{/* File Input */}
														<div className="col-md-4">
															{(() => {
																const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.CREATE) ?? false;
																return (
																	<Form.Group controlId="formFile" className="">
																		<Form.Control
																			// onChange={userAttachment}
																			onChange={handleFileChange}
																			ref={fileInputRef}
																			type="file"
																			size="sm"
																			accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
																			disabled={!canCreate}
																		// isInvalid={err}
																		/>

																		<div
																			className="col-12 col-md-8 mb-2"
																			style={{ color: "blue", fontStyle: "italic" }}
																		>
																			{/* {item?.attachment} */}
																		</div>
																	</Form.Group>
																);
															})()}
														</div>
														{/* Add Attachment Button */}
														<div className="col-md-2">
															{(() => {
																const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.CREATE) ?? false;
																return (
																	<LoadingButton
																		variant="text"
																		size="small"
																		startIcon={<HiPlusSm />}
																		className="me-2 rounded-pill text-capitalize blue-text font-normal"
																		onClick={addAttachment}
																		disabled={!canCreate}
																		loading={isAdding}
																	>
																		Add
																	</LoadingButton>
																	// <LoadingButton
																	// 	variant="text"
																	// 	size="small"
																	// 	className="me-2 rounded-pill"
																	// 	onClick={addAttachment}
																	// 	disabled={!canCreate}
																	// 	loading={isAdding}
																	// >
																	// 	<span className="text-capitalize">Add</span>
																	// </LoadingButton>
																);
															})()}
														</div>
														{eventtype !== "PR" &&
															<div className="col-md-2 ">
																<span className="text-capitalize">Terms & Conditions</span>
															</div>
														}
														{error && (
															<div style={{ color: "red", fontSize: "12px" }}>
																{error}
															</div>
														)}
													</div>
												)}
											</div>


											{AttachFiles &&
												AttachFiles.map((item, index) => {
													return (
														<div className="border-bottom mb-2 pt-1 pb-1" key={index}>
															<div className="row align-items-center">
																<div className="col-md-4">
																	<Input
																		placeholder="Attachment Description"
																		fullWidth
																		variant="outlined"
																		value={item?.attachmentDescription}
																		onChange={(e) => {
																			const updatedAttachments = [...AttachFiles];
																			updatedAttachments[index].attachmentDescription = e.target.value;
																			setAttach(updatedAttachments);
																		}}
																		readOnly
																	/>
																</div>

																<div className="col-md-4">
																	{item?.fileNamePath && item?.fileNamePath !== "" && item?.attachment && item?.attachment !== "" ? (
																		<Form.Group controlId="formFile" className="">
																			<div
																				className="col-12 mb-2"
																				style={{
																					color: "blue",
																					fontStyle: "italic",
																					cursor: "pointer",
																					wordBreak: "break-word"
																				}}
																				onClick={() =>
																					downloadFilesOnAzure(
																						item?.fileNamePath,
																						getFileName(item?.fileNamePath),
																						atoken
																					)
																				}
																			>
																				{getFileName(item?.fileNamePath)}
																			</div>
																		</Form.Group>
																	) : (

																		item?.attachmentDescription && (
																			<Form.Group controlId="formFile" className="">
																				<Form.Control
																					// onChange={handleFileChange} 
																					onChange={(e) => uploadFileOnSelection(e, index)} // This should handle the file change
																					ref={fileInputRef}
																					type="file"
																					size="sm"
																					accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
																				/>
																			</Form.Group>
																		)
																	)}
																</div>

																{action && !item?.required ? (
																	<div className="col-md-2 d-flex justify-content-end">
																		{(() => {
																			const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.REMOVE) ?? false;
																			return (
																				<button
																					type="button"
																					className="pe-icon-btn pe-icon-btn--delete"
																					onClick={() => handleRemoveAdd(index)}
																					disabled={!canRemove}
																				>
																					<HiX className="f17" />
																				</button>
																			);
																		})()}
																	</div>
																) : (<div className="col-md-2"></div>)}
																{/* Checkbox for Terms & Conditions */}
																{/* <div className="col-md-2">
													<Checkbox
														checked={item?.fileType == "TC"}
														onChange={(e) => {
															const updatedAttachments = [...AttachFiles];
															updatedAttachments[index].fileType = e.target.checked ? "TC" : "";
															setAttach(updatedAttachments);
															handleattachmentforevent(updatedAttachments);
														}}
													/>
												</div> */}
															</div>
														</div>
													);
												})}

											{savedAttachment &&
												savedAttachment?.map((item, index) => (
													<div className="border-bottom mb-2 pt-1 pb-1" key={index}>
														<div className="row align-items-center">
															<div className="col-md-4"
																style={{
																	fontStyle: "normal",
																}}
															>
																{item?.attachmentDescription}
															</div>
															<div className="col-md-4">
																<Form.Group controlId="formFile" className="">
																	<div
																		className="col-12 mb-2"
																		style={{
																			color: "blue",
																			fontStyle: "italic",
																			cursor: "pointer",
																			wordBreak: "break-word"
																		}}
																		onClick={() =>
																			downloadFilesOnAzure(
																				item?.fileNamePath,
																				getFileName(item?.fileNamePath),
																				atoken
																			)
																		}
																	>
																		{getFileName(item?.fileNamePath)}
																	</div>
																</Form.Group>
															</div>

															{action && !item?.required ? (<div className="col-md-2 d-flex justify-content-end">
																{(() => {
																	const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.REMOVE) ?? false;
																	return (
																		<button
																			type="button"
																			className="pe-icon-btn pe-icon-btn--delete"
																			onClick={() =>
																				handleRemoveAttachment(index, item?.id)
																			}
																			disabled={!canRemove}
																		>
																			<HiX className="f17" />
																		</button>
																	);
																})()}
															</div>) : (<div className="col-md-2"></div>)}

															{/* Checkbox for Terms & Conditions */}
															{action && eventtype !== "PR" && (
																<div className="col-md-2">
																	{(() => {
																		const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.EDIT) ?? false;
																		return (
																			<Checkbox
																				checked={item?.fileType === "TC"}
																				disabled={!canEdit}
																				onChange={(e) => {
																					const updatedAttachments = [...savedAttachment];
																					updatedAttachments[index].fileType = e.target.checked ? "TC" : "";
																					setSavedAttacchment(updatedAttachments);
																					// Set checkbox changed state to show Update button
																					setHasCheckboxChanged(true);
																					// Pass combined array to parent
																					const allAttachments = [...updatedAttachments, ...AttachFiles];
																					handleattachmentforevent(allAttachments);
																				}}
																			/>
																		);
																	})()}
																</div>
															)}

														</div>
													</div>
												))}
										</>
									);
								})()}
							</Box>
							{/* <div className="">
								<div className="">
									<div className="f12  text-center text-danger">*If you save any document with the name of Terms & Condition it will automatically take it as a default file.*</div>
								</div>
							</div> */}
							<div className="col-12 text-end mt-4">
								{/* <Button type="button" size="small" className="p-2 pt-1 pb-1 me-2" variant="contained" onClick={handleAttachmentSave}>
									<span className="text-capitalize">Update</span>
								</Button> */}
								{action && savedAttachment.length > 0 && (() => {
									const canRead = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.READ) ?? false;
									const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.EDIT) ?? false;

									// Only show Update button if user has both READ and edit permissions and checkbox has been changed
									if (!canRead || !canEdit) {
										return null;
									}

									return hasCheckboxChanged && (
										<LoadingButton
											variant="contained"
											color="primary"
											className="me-3 text-capitalize"
											size="medium"
											onClick={handleAttachmentUpdate}
											loading={isUpdating}
										>
											<span className="text-capitalize">Update</span>
										</LoadingButton>
									);
								})()}
							</div>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>
		</>

	);
});
export default AttachmentWorkFlow;
