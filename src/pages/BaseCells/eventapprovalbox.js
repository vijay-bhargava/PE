import React, { useState, useEffect, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import { HiOutlineUserAdd, HiPlusSm } from "react-icons/hi";
import PEModal from "../../components/PEModal";
import TextFieldCell from "./TextFieldCell";
import {
	Accordion, AccordionDetails, AccordionSummary,
	Autocomplete, TextField, Tooltip, Alert,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { getEventApproversFind, getuserlist, } from "../../utils/common/utility";
import { useStateValue } from "../../store";
import { ApiClient } from "../../Apiclient";
import { ExpandMore } from "@mui/icons-material";
import { IntegerRegex, segregatedEventapprover } from "../../utils/common";
import EventApprovalWorkFlow from "../../components/approvalflow";
import { toast } from "react-toastify";
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
	const [expandedStages, setExpandedStages] = useState([]);

	const toggleStageExpanded = (i) => {
		setExpandedStages(prev => {
			const next = [...prev];
			next[i] = !next[i];
			return next;
		});
	};

	const fetchEventApprovers = (dataRequest, Version) => {

		dataRequest.Version = Version;
		getEventApproversFind(dataRequest, atoken).then((res) => {

			const stagelistworkflow = stagelist.filter(x => x.isActive).filter(x => x.wfname).map(x => x.wfname)
			const updatedvalue = segregatedEventapprover(res, stagelistworkflow);
			if (updatedvalue?.length) {
				setApproverList(updatedvalue);
				setIsAddVisible(new Array(updatedvalue?.length).fill(false));

				// Determine which stage is currently active and expand only that one.
				// Active = first stage with a Pending approver, or first stage not fully approved.
				const normalizedCS = `${currentStage || ""}`.trim().toLowerCase();
				const hasMatchingStage = updatedvalue.some(s => {
					const sn = `${s.stage || ""}`.trim().toLowerCase();
					const csn = `${stagelist.find(sl => sl.wfname === s.stage)?.currentStage || ""}`.trim().toLowerCase();
					return sn === normalizedCS || csn === normalizedCS;
				});
				const expanded = updatedvalue.map((s, i) => {
					const sn = `${s.stage || ""}`.trim().toLowerCase();
					const csn = `${stagelist.find(sl => sl.wfname === s.stage)?.currentStage || ""}`.trim().toLowerCase();
					const isActive = sn === normalizedCS || csn === normalizedCS || (i === 0 && !hasMatchingStage);
					return isActive;
				});
				setExpandedStages(expanded);
				handleEventAppList(res, updatedvalue)
			}
		});
	};

	const [userOptions, setUserOptions] = useState([]);

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

	const handleIconClick = (e, stage) => {

		e.stopPropagation();  // Prevent event bubbling
		const stageDetails = approverList.find(item => item?.stage === stage);

		if (stageDetails && stageDetails.approvers?.length > 0) {
			const selectedApprover = stageDetails.approvers[0];
			const stageId = selectedApprover?.stageId;
			const wfId = selectedApprover?.wfId || stageDetails?.wfId;
			setSelectedStageId(stageId);
			setSelectedWfId(wfId);
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
							const wfstage = stagelist.find(s => s.wfname === x.stage);
							const stagename = stagelist.find(s => s.wfname === x.stage)?.currentStage ?? "";
							const normalizedStage = `${x.stage || ""}`.trim().toLowerCase();
							const normalizedCurrentStage = `${currentStage || ""}`.trim().toLowerCase();
							const normalizedStageName = `${stagename || ""}`.trim().toLowerCase();
							const hasMatchingStage = approverList.some((stageItem) => {
								const stageName = `${stageItem?.stage || ""}`.trim().toLowerCase();
								const currentStageName =
									`${stagelist.find(s => s.wfname === stageItem?.stage)?.currentStage || ""}`
										.trim()
										.toLowerCase();
								return (
									stageName === normalizedCurrentStage ||
									currentStageName === normalizedCurrentStage
								);
							});
							const isActiveStage =
								normalizedStage === normalizedCurrentStage ||
								normalizedStageName === normalizedCurrentStage ||
								(i === 0 && !hasMatchingStage);
							const isFutureStage = !isActiveStage && i > 0;
							const approvedCount = x.approvers?.filter((approver) => approver.status === "Approved").length || 0;
							const pendingCount = x.approvers?.filter((approver) => approver.status === "Pending").length || 0;
							const totalCount = x.approvers?.length || 0;
							return (<Card className={`ms-2 mt-2 approvalCard ${isActiveStage ? "is-active-stage" : ""} ${isFutureStage ? "is-future-stage" : ""}`}>

								<Card.Body className="p-0 m-0">
									<div className="">

										<React.Fragment key="eventapprovalbox">
											<Accordion className="shadow-none mt-2 mb-2 approvalAcordion" key={`accordion-${i}`} expanded={!!expandedStages[i]} onChange={() => toggleStageExpanded(i)}>

												<AccordionSummary
													className="ps-2"
													style={{ minHeight: '35px' }}
													classes={{ content: 'MuiAccordionSummary-content custom-accordion-summary-content' }}
													expandIcon={<ExpandMore />}
												>
													<div className="col-md-10 wf-stage-col">
														<div className="rfq-dv2-stage-summary">
															<span className="approval-stage-title">{stagename || x.stage}</span>
														</div>
													</div>
													<Tooltip title={`Add approver to ${stagename || x.stage}`}>
														<span>
															<IconButton
																size="small"
																sx={{
																	width: "28px", height: "28px",
																	backgroundColor: "transparent",
																	padding: 0,
																	marginRight: "5px",
																	flexShrink: 0,
																	borderRadius: "8px",
																	border: "1px solid #c2d4f9",
																	color: "#6b7280",
																	cursor: "pointer",
																	"&:hover": {
																		backgroundColor: "#eaf0ff",
																		color: "#4b66a1",
																	}
																}}
																disabled={
																	!action ||
																	currentStage === "Awarded" ||
																	(x.approvers?.every(approver => approver.status && approver.status !== "Pending") && x.approvers?.length > 0) ||
																	!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)
																}
																onClick={(e) => {
																	e.stopPropagation();
																	handleIconClick(e);
																	toggleAdd(i);
																}}
															>
																<HiOutlineUserAdd />
															</IconButton>
														</span>
													</Tooltip>
												</AccordionSummary>
												<AccordionDetails className="approvalAcordionDetails">
													{isAddVisible[i] && (
														<div className="wf-add-approver-form">
															<div className="row g-2">
																<div className="col-6">
																	<label className="pe-field-label">Search Approver</label>
																	<Autocomplete
																		id="wf-approver-autocomplete"
																		size="small"
																		options={userOptions}
																		fullWidth
																		disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)}
																		value={addingApprover}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				size="small"
																				placeholder="Search approver"
																				label={null}
																				InputLabelProps={{ shrink: false }}
																			/>
																		)}
																		onChange={(event, newvalue) => {
																			setAddingApprovers(newvalue);
																		}}
																		onOpen={() => {
																			if (userOptions.length === 0) {
																				fetchUserList(customerid, requestCell);
																			}
																		}}
																	/>
																</div>
																<div className="col-4">
																	<label className="pe-field-label">Sequence No <span className="rfq-required-star">*</span></label>
																	<TextField
																		fullWidth
																		variant="outlined"
																		size="small"
																		className="f14"
																		id="addingapproversequence"
																		name="addingapproversequence"
																		label={null}
																		placeholder="No."
																		value={addingApproverSequence}
																		type="number"
																		disabled={addingApprover ? (!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)) : true}
																		onChange={(e) => {
																			const inputValue = e.target.value;
																			if (!IntegerRegex.test(inputValue)) {
																				setAddingApproversSequence("");
																				return;
																			}
																			const approversForStage = approverList.find(obj => obj.stage === x.stage)?.approvers || [];
																			const nextSeq = approversForStage.length + 1;
																			const intVal = parseInt(inputValue);
																			setAddingApproversSequence(intVal === nextSeq ? inputValue : "");
																		}}
																	/>
																</div>
																<div className="col-1 d-flex align-items-end pb-1">
																	<button
																		type="button"
																		className="pe-icon-btn pe-icon-btn--confirm"
																		disabled={
																			!addingApprover ||
																			!addingApproverSequence ||
																			!(permissionManager?.hasPermission(CLAIM_TYPES.WORK_FLOW, ACTIONS.CREATE) ?? false)
																		}
																		onClick={() => {
																			onChangeApprover(addingApproverSequence, addingApprover, x, wfstage);
																		}}
																		aria-label="Add approver"
																	>
																		<HiPlusSm />
																	</button>
																</div>
															</div>
														</div>
													)}
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
															variant="rfq-sidebar"
														/>
													</div>
												</AccordionDetails>
											</Accordion>
											<PEModal
												open={open}
												onClose={handleClose}
												size="sm"
												title="Save As"
												footer={<>
													<button className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
													<button className="pe-btn pe-btn--primary" onClick={handleSaveClick}>Save</button>
												</>}
											>
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
											</PEModal>
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
