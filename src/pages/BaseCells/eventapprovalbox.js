import React, { useState, useEffect, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import { HiOutlineTrash, HiOutlineUserAdd, HiPlusSm, HiX } from "react-icons/hi";
import { FaRegFloppyDisk, FaPaperclip } from "react-icons/fa6";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextFieldCell from "./TextFieldCell";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Autocomplete,
	Button,
	Icon,
	InputAdornment,
	TextField,
	Tooltip,
	Alert,
} from "@mui/material";
import { useCookies } from "react-cookie";
import {
	AddEventApprovers,
	DeleteEventApprover,
	getEventApprovers,
	getEventApproverslist,
	getEventApproversFind,
	getuserlist,
} from "../../utils/common/utility";
import { actionTypes, useStateValue } from "../../store";
import { MdCheck, MdPending } from "react-icons/md";
import { buildQueryParams } from "../../utils/purchaseRequest";
import { ApiClient, api } from "../../Apiclient";
import { Expand, ExpandMore, PersonOutlined } from "@mui/icons-material";
import { IntegerRegex, segregatedEventapprover } from "../../utils/common";
import EventApprovalWorkFlow from "../../components/approvalflow";
import { toast } from "react-toastify";
import { LoadingButton } from "@mui/lab";
import { Card } from "react-bootstrap";
import { CLAIM_TYPES, ACTIONS } from "../../utils/permissionManager";

const EventApprovalBox = ({ requestCell, handleEventAppList, wfupdate, action, stagelist, accessLevel, Version = 1, permissionManager, eventCode, eventSubject, startDate, endDate, currentStage }) => {
	
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [{ atoken, rtoken, customersuffix, customerid }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);

	const [isAddVisible, setIsAddVisible] = useState();
	const toggleAdd = (i) => {


		const newIsAddVisible = [...isAddVisible];
		newIsAddVisible[i] = !newIsAddVisible[i];
		setIsAddVisible(newIsAddVisible);
	};

	const [open, setOpen] = React.useState(false);
	const [removeOpen, setRemoveOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setRemoveOpen(false);
	};

	useEffect(() => {

		if (requestCell?.EventId > 0 && stagelist && Version) {
			fetchEventApprovers(requestCell, Version);
			//fetchUserList(1, requestCell);
		} else {
			setApproverList([]);
		}
	}, [requestCell, wfupdate, stagelist]);

	const [approverList, setApproverList] = useState([]);
	const fetchEventApprovers = (dataRequest, Version) => {

		dataRequest.Version = Version;
		getEventApproversFind(dataRequest, atoken).then((res) => {

			const stagelistworkflow = stagelist.filter(x => x.isActive).filter(x => x.wfname).map(x => x.wfname)
			const updatedvalue = segregatedEventapprover(res, stagelistworkflow);
			if (updatedvalue?.length) {
				setApproverList(updatedvalue);
				setIsAddVisible(new Array(updatedvalue?.length).fill(false))
				handleEventAppList(res, updatedvalue)
			}

		});
	};


	const [userOptions, setUserOptions] = useState([]);
	const [userarray, setuserarray] = useState([]);

	const fetchUserList = (customerid, reqApprover) => {

		var data = {
			CustomerId: customerid,
			IsActive: true
		};
		getuserlist(data, atoken).then((res) => {
			let arrayNew = [];

			if (res && Array.isArray(res)) {
				var approveseq = approverList[approverList.length - 1]?.ApproverSeq;
				res?.map((datares) => {
					approveseq++;
					arrayNew.push({
						label: datares?.name,
						approverId: datares?.id,
						eventId: reqApprover?.requestApprover?.EventId,
						eventType: reqApprover?.requestApprover?.EventType,
						approverName: datares?.name,
						approverEmaiId: datares?.email,
						approverSeq: approveseq,
						approverType: "Pending",
						amendmentNo: 0,
					});
					// approveseq =approveseq;
				});

				setUserOptions(arrayNew);
				//console.log("users ", userOptions);
			}
		});
	};

	//for handling add of approver in different list
	const onChangeApprover = (approverseq, newValue, x, wfstage) => {


		if (newValue != null) {

			newValue.wfStage = x.stage;
			newValue.wfId = wfstage?.wfId;
			newValue.stageId = wfstage?.stageId;
			newValue.eventId = requestCell?.EventId;
			newValue.eventType = requestCell?.EventType;
			newValue.approverSeq = approverseq;
			newValue.Version = parseInt(Version);
			pushEventApprovers(newValue, atoken);
		}
	};

	const pushEventApprovers = async (data, atoken) => {

		const res = await apiClient.postres(`/api/eventapprover/Add`, data, atoken)

		if (res) {
			fetchEventApprovers(requestCell);
			setAddingApprovers(null)
			setAddingApproversSequence(null)
		}
	};

	const [deletedId, setDeletedId] = useState(0);
	const handleClickRemove = (selectedItem) => {

		if (selectedItem?.approverType == "Pending") {
			setRemoveOpen(true);
			setDeletedId(selectedItem.id);
		} else {
			setRemoveOpen(false);
			setDeletedId(0);
		}
	};
	const pushDeleteEventApprover = useCallback((objtoremove) => {

		deleteApproverformEvent(objtoremove)

	}, [requestCell, approverList]);

	const deleteApproverformEvent = async (objtoremove) => {

		try {
			console.log(`deleteApproverformEvent`);

			const res = await apiClient.postres(`/api/eventapprover/Delete`, objtoremove, atoken);
			if (!res) {
				toast.error('Some error occurred while deleting');
				return;
			}
			const flatApprovers = [].concat(...approverList.map(item => item.approvers))
				.filter(x => x.id !== objtoremove.id);
			console.log(`flatApprovers`, flatApprovers)

			const otherStageApprovers = flatApprovers.filter(x => x.wfStage !== objtoremove.wfStage);
			const sameStageApprovers = flatApprovers.filter(x => x.wfStage === objtoremove.wfStage);
			const sequenceGroups = sameStageApprovers.reduce((acc, approver) => {
				if (!acc[approver.approverSeq]) {
					acc[approver.approverSeq] = [];
				}
				acc[approver.approverSeq].push(approver);
				return acc;
			}, {});

			const sortedSequenceKeys = Object.keys(sequenceGroups).sort((a, b) => a - b);

			let newSequence = 1;
			const result = [];

			sortedSequenceKeys.forEach(seq => {
				const group = sequenceGroups[seq];
				group.forEach(approver => {
					approver.approverSeq = newSequence;
					result.push(approver);
				});
				newSequence++;
			});
			const updatedData = [...result, ...otherStageApprovers]
			// Perform the update operation
			const res2 = await apiClient.postres(`/api/eventapprover/UpdateRange`, updatedData, atoken);
			if (res2) {
				fetchEventApprovers(requestCell);
			}

		} catch (error) {
			console.error('Error in deleteApproverformEvent:', error);
			toast.error('An error occurred. Please try again.');
		}
	};

	const dragUpdateApprover = useCallback((payload) => {
		console.log(`deleteApproverformEvent`);
		updateApproverformEvent(payload)

	}, [requestCell, approverList]);

	const updateApproverformEvent = async (data) => {

		const flatApprovers = [].concat(...data.map(item => item.approvers));
		const otherStageApprovers = flatApprovers.filter(x => x.wfStage !== data[0]?.wfStage);
		const payload = [...otherStageApprovers, ...data];

		const res = await apiClient.postres(`/api/eventapprover/UpdateRange`, payload, atoken)
		if (res) {
			fetchEventApprovers(requestCell)
		}
	}

	const handleClickToRemoved = (Id) => {

		var data = {
			Id: deletedId,
		};
		pushDeleteEventApprover(data, atoken);
	};

	const defaultSApprovqn = (newValue) => {
		return newValue;
	};




	const onChangeApproveSeqn = (event, newValue) => {

		console.log(newValue);
		newValue.approverSeq = event.target.value;
		updateApproveSeqn(newValue);
	};

	const updateApproveSeqn = async (datapayload) => {

		const res = await apiClient.postres(
			`/api/eventapprover/Update`,
			datapayload,
			atoken
		);

	}


	const handleIconClick = (e, stage) => {

		e.stopPropagation();  // Prevent event bubbling
		const stageDetails = approverList.find(item => item?.stage === stage);

		if (stageDetails && stageDetails.approvers?.length > 0) {
			const selectedApprover = stageDetails.approvers[0];
			const stageId = selectedApprover?.stageId;
			const wfId = selectedApprover?.wfId || stageDetails?.wfId;

			setSelectedStageId(stageId);
			setSelectedWfId(wfId);

			console.log(`Selected Stage ID: ${stageId}, Workflow ID: ${wfId}`);
		} else {
			console.warn(`No approvers found for stage: ${stage}`);
		}
	};



	const [addingApprover, setAddingApprovers] = useState(null)
	const [addingApproverSequence, setAddingApproversSequence] = useState(null)


	const [SelectedWfId, setSelectedWfId] = useState(null);
	const [selectedStageId, setSelectedStageId] = useState(null);

	const [workFlowName, setworkFlowName] = useState('');

	const handleSave = async () => {
		const data = {
			wfId: SelectedWfId,
			eventtype: requestCell?.EventType,
			eventId: requestCell?.EventId,
			workFlowName: workFlowName,
			stageId: selectedStageId
		};

		try {

			const res = await apiClient.postres("/api/WorkFlow/WorkFlowSaveTemplate", data, atoken);


			if (res && res.status === 200) {

				console.log('Workflow saved successfully:', res.data);

			} else {

				console.error('Error saving workflow:', res?.message || 'Unknown error');
			}
		} catch (error) {

			console.error('API request failed:', error);
		}
	};
	const handleSaveClick = () => {


		handleSave();
		handleClose();
	};
	//##
	return (
		<>
			{/* Permission Status Display */}
			{(() => {
				const canRead = permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.READ) ?? false;
				const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.EDIT) ?? false;
				const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false;
				const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.REMOVE) ?? false;

				// Show permission status
				if (permissionManager) {
					return (
						<div className="pb-0">
							{/* <div severity="info" className="mb-3">
								<PersonOutlined className="me-2" />
								{canRead && <span className="badge bg-success ms-1">Read</span>}
								{canEdit && <span className="badge bg-warning ms-1">Edit</span>}
								{canCreate && <span className="badge bg-primary ms-1">Create</span>}
								{canRemove && <span className="badge bg-danger ms-1">Remove</span>}
							</div> */}
						</div>
					);
				}
				return null;
			})()}

			{(() => {
				const canRead = permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.READ) ?? false;

				if (!canRead) {
					return (
						<div className="p-3">
							<Alert severity="warning">
								You don't have permission to view work flow data.
							</Alert>
						</div>
					);
				}

				return (
					<>
						{approverList && approverList.length > 0 && approverList.map((x, i) => {
							const wfstage = stagelist.find(s => s.wfname == x.stage);
							const stagename = stagelist.find(s => s.wfname == x.stage)?.currentStage ?? ""
							return (<Card className="ms-2 mt-2 approvalCard">

								<Card.Body className="p-0 m-0">
									<div className="">

										<React.Fragment key="eventapprovalbox">
											<Accordion className="shadow-none mt-2 mb-2 approvalAcordion" key="eventapprovalbox" defaultExpanded >

												<AccordionSummary
													className="ps-2"
													style={{ minHeight: '35px' }}
													classes={{ content: 'MuiAccordionSummary-content custom-accordion-summary-content' }}
													expandIcon={<ExpandMore />}
												>
													<div className="row justify-content-between w-100">
														<div className="col-md-10">

															<div className="f13 fw600 m-0 p-0 d-flex align-items-baseline">{x.stage}</div>
															{stagename && (
																<div className="f11 text-muted ms-1" style={{ marginTop: '-4px' }}>({stagename})</div>
															)}




														</div>
														<div className="col-md-2 d-flex align-items-baseline justify-content-end ps-3 me-0 pe-0">
															<div className="d-flex align-items-baseline justify-content-end">
																{action && (
																	<div className="text-end mb-2 ps-5 pe-1">
																		<div>
																			<span className="d-flex align-items-baseline">
																				{/* <IconButton
																					size="small"
																					onClick={(e) => {
																						handleIconClick(e, x.stage);


																						handleClickOpen();
																					}}
																				>
																					<FaRegFloppyDisk className="f17 text-success" />
																				</IconButton> */}
																				{currentStage != "Awarded" && 
																				 (!(x.approvers?.every(approver => approver.status && approver.status !== "Pending")) ||  x.approvers?.length == 0) &&
																				 <IconButton
																					size="small"
																					disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)}
																					onClick={(e) => {
																						handleIconClick(e);
																						toggleAdd(i);
																					}}
																				>
																					
																					<HiOutlineUserAdd className="f17 text-primary" />
																				</IconButton>}
																			</span>
																		</div>
																	</div>
																)}
															</div>
														</div>
													</div>
												</AccordionSummary>
												<AccordionDetails className="approvalAcordionDetails">

													<div className=" rounded  mb-2">
														<div className="row">
															<div className="col-md-12">
																{isAddVisible[i] ? (
																	<div className="row">
																		<div className="col-md-7">
																			<div className="">
																				<Autocomplete
																					disablePortal
																					id="combo-box-demo"
																					className="pt-1 pb-1"
																					size="small"
																					options={userOptions}
																					fullWidth
																					disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)}
																					value={addingApprover}
																					renderInput={(params) => (
																						<TextField
																							{...params}
																							InputLabelProps={{
																								shrink: true,
																							}}
																							label="Search Approver"
																						/>
																					)}
																					onChange={(event, newvalue) => {
																						setAddingApprovers(newvalue)
																						//onChangeApprover(event, newvalue,x);
																					}}
																					onOpen={() => {
																						if (userOptions.length === 0) {
																							fetchUserList(customerid, requestCell);
																						}
																					}}
																				/>
																			</div>
																		</div>
																		<div className="col-md-4">
																			<div className="">
																				<TextField
																					InputLabelProps={{
																						shrink: true,
																					}}
																					fullWidth
																					variant="outlined"
																					size="small"
																					className="f14 pt-1 pb-1"
																					id="addingapproversequence"
																					name="addingapproversequence"
																					label="Sequence No*"
																					value={addingApproverSequence}
																					InputProps={{
																						step: 1,
																						min: 0,
																						max: 100,
																					}}
																					type="number"
																					disabled={addingApprover ? (!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)) : true}
																					// onChange={(e) => {

																					// 	const inputValue = e.target.value;

																					// 	// Prevent non-numeric characters and negative values using regex

																					// 	if (IntegerRegex.test(inputValue)) {
																					// 		// Check if input value is greater than allowed sequence length

																					// 		const length = parseInt(approverList.filter(obj => obj.stage === x.stage)[0].approvers?.length) + 1;
																					// 		if (inputValue == 0) {
																					// 			return;
																					// 		}
																					// 		if (inputValue > length) {

																					// 			return;
																					// 		}

																					// 		setAddingApproversSequence(inputValue); // Update value if valid
																					// 	} else {
																					// 		// Optionally: you could show an error message for invalid input
																					// 		// toast.error('Only positive numbers allowed');
																					// 		setAddingApproversSequence("");
																					// 	}
																					// }}

																					//#Anurag_Dev change to handle unwanted number
																					onChange={(e) => {

																						const inputValue = e.target.value;

																						if (!IntegerRegex.test(inputValue)) {
																							setAddingApproversSequence(""); // Clear invalid input
																							return;
																						}

																						const approversForStage =
																							approverList.find(obj => obj.stage === x.stage)?.approvers || [];

																						const length = approversForStage.length + 1;

																						// If no approvers, allow only "1"
																						if (approversForStage.length === 0) {

																							if (inputValue === "1") {
																								setAddingApproversSequence(inputValue);
																							} else {
																								setAddingApproversSequence(""); // Disallow anything other than 1
																							}
																						} else {
																							const intVal = parseInt(inputValue);
																							if (intVal > 0 && intVal <= length) {
																								setAddingApproversSequence(inputValue);
																							} else {
																								setAddingApproversSequence(""); // Disallow out-of-range values
																							}
																						}
																					}}
																				/>
																			</div>

																		</div>
																		<div className="col-md-1 ms-0 ps-0 mt-2">
																			<div className="text-start">
																				<LoadingButton

																					variant='standard'
																					type="submit"
																					style={{ minWidth: "35px" }}
																					color='primary'
																					className='text-capitalize ms-0 ps-0 pe-0 me-0 customButton'
																					size='small'
																					disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)}
																					onClick={(event) => {
																						onChangeApprover(addingApproverSequence, addingApprover, x, wfstage);
																					}}

																				>
																					<HiPlusSm className="f17" />
																				</LoadingButton>
																			</div>
																		</div>




																	</div>
																) : (
																	<></>
																)}
															</div>
														</div>
													</div>
													<div className="row">
														<EventApprovalWorkFlow
															key={`approvalworkflow`}
															approverlist={x.approvers}
															pushDeleteEventApprover={pushDeleteEventApprover}
															stagelist={stagelist}
															action={action}
															accessLevel={accessLevel}
															permissionManager={permissionManager}
															eventCode={eventCode}
															eventSubject={eventSubject}
															startDate={startDate}
															endDate={endDate}
														/>
													</div>

												</AccordionDetails>
											</Accordion>
											<Dialog open={open} onClose={handleClose}>
												<DialogTitle className="pb-0">Save As</DialogTitle>
												<DialogContent>
													<DialogContentText style={{ width: "320px" }}>
														&nbsp;
													</DialogContentText>
													<TextFieldCell
														id="workFlowName"
														name="workFlowName"
														label="Workflow Title"
														value={workFlowName}
														onChange={(e) => {
															setworkFlowName(e?.target?.value);
														}}
														placeholder=""
														maxLength={100}
													/>
												</DialogContent>
												<DialogActions>
													<Button
														onClick={handleClose}
														className="text-muted text-capitalize f16"
													>
														Cancel
													</Button>
													<Button onClick={handleSaveClick} className="text-capitalize f16">
														Save
													</Button>
												</DialogActions>
											</Dialog>
										</React.Fragment>
									</div>
								</Card.Body>
							</Card>)

						}

						)}
					</>
				);
			})()}
		</>
	)


};

export default EventApprovalBox;




