import React, { useState, useEffect } from "react";
import { HiUserGroup, HiOutlineX } from "react-icons/hi";
import {
	Badge,
	Box,
	Checkbox,
	Drawer,
	IconButton,
	Tooltip,
} from "@mui/material";
import {
	getWorkFlowList,
	ActionWFAddApprover,
	getEventApprovers,
	getuserlist,
	buildQueryParams,
} from "../../utils/common/utility";
import { actionTypes, useStateValue } from "../../store";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { ApiClient, api } from "../../Apiclient";
import { WFAddApproverModal } from "../../utils/common";
import { Card } from "react-bootstrap";

const ApprovalWorkFlow = ({ requestCell, eventAppList, handleWorkFlowUpdate }) => {
	const apiClient = new ApiClient(customersuffix);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();

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

	const [value, setValue] = React.useState(0);

	const handleChange = async (e, id) => {
		 // Inspect e and id here

		if (e.target.checked) {
			const index = WorkFlowList.findIndex((approver) => approver.id === id);
			const list = [...WorkFlowList];
			list[index]["isSelected"] = e.target.checked;
			setWorkFlowApproverList(list);
			handleWFAddApprover(list[index]);
			handleWorkFlowUpdate();
		}
	};
    
	const handleWFAddApprover = async (data) => {
		const payload = WFAddApproverModal([data], requestCell);
		const res = await apiClient.postres(
			`/api/eventapprover/WFAddApprover`,
			payload,
			atoken
		);
		if (res) {
			toast.success(`Approver is added successfully`);
		}
	};

	const [approverList, setApproverList] = useState([]);

	const fetchEventApprovers = async (eventtype) => {
		const data = {
			eventtype: eventtype,
		};
		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(
			`/api/eventapprover/Find?${queryParams}`,
			atoken
		);
		if (res?.length) {
			setApproverList(res);
		}
	};

	useEffect(() => {
		fetchWorkFlowList(requestCell?.EventType);
	}, [requestCell, eventAppList]);

	const [WorkFlowList, setWorkFlowApproverList] = useState([]);
	const fetchWorkFlowList = async (eventtype) => {
		 // Inspect the fetched data here

		const dataRequest = {
			CustomerId: customerid,
			eventtype: eventtype,
		};
		const queryParams = buildQueryParams(dataRequest);
		const res = await apiClient.getres(
			`api/WorkFlow/Find?${queryParams}`,
			atoken
		);

		if (res?.data?.result) {
			setWorkFlowApproverList(res?.data?.result);
			const data = res?.data?.result;
			
			if (eventAppList.length > 0) {
				const wfidSet = new Set(eventAppList.filter(a => a.wfId).map(app => app.wfId));
				const updatedData = data.map(item => ({ ...item, isSelected: wfidSet.has(item.id) ? true : false }));
				setWorkFlowApproverList(updatedData);
			}
		}
	};

	const CloseDrawerForWF = () => {
		setState({ ...state, ["technicalApprovalDrawer"]: false });
	};

	const [wfInputDataList, setwfInputDataList] = useState([]);
	const WFinputDataList = (wfInputDataList) => {
		if (wfInputDataList?.length > 0) {
			ActionWFAddApprover(wfInputDataList, atoken).then((res) => {
				if (res?.id > 0) {
					toast.success("Approver Added..!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
						onClose: () => {
							CloseDrawerForWF();
						},
					});
					console.log("wfInputDataList ", res);
				}
			});
		}
	};

	const checkWfalreadyAdded = (wfId) => {
		const findValue = approverList.find((data) => data?.wfId === wfId);
		return findValue != null && findValue?.wfId > 0;
	};

	return (
		<>
			<Tooltip title="Workflows">
				<IconButton
					size="medium"
					className="border-primary me-0 pe-0 ps-0 bg-white"
					onClick={toggleDrawer("technicalApprovalDrawer", true)}
				>
					<Badge badgeContent={WorkFlowList?.length} color="success" style={{ padding: "0px 4px", fontSize: "10px" }}>
						<HiUserGroup className="f17" />
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
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Workflow</div>
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
							<div className="h50px"></div>
							{WorkFlowList?.map((selectedItem, index) => {
								return (
									<React.Fragment key={index}>
										<Box sx={{ flexGrow: 1, p: 2 }}>
											<div className="bg-white rounded p-2 shadow-sm border mb-3">
												<div className="d-flex align-items-center justify-content-between">
													<div className="p-1">
														<div>
															<span className="text-muted f12">
																{selectedItem?.wfname}
															</span>
														</div>
													</div>
													<div>
														<Checkbox
															size="small"
															checked={selectedItem?.isSelected}
															onChange={(event) => {
																handleChange(event, selectedItem?.id);
															}}
														/>
													</div>
												</div>
												<div>
												<div className="row">
  {selectedItem?.wfRuleCriteria?.map((ruleCriteria, ruleIndex) => {
    // Check if there are approvers to display
    const hasApprovers = ruleCriteria?.wfapproverusers?.length > 0;

    return hasApprovers ? (
      <div key={ruleIndex} className="mb-2 col-md-6">
        <Card>
          <Card.Header className="bg-white">
            <Card.Title className="bg-white mb-0">
              <div className="text-black f14">{ruleCriteria.ruleName}</div>
            </Card.Title>
          </Card.Header>
          <Card.Body className="ps-1 pt-1">
            {ruleCriteria.wfapproverusers.map((selectedApprover, approverIndex) => (
              <div
                key={approverIndex}
                className={`col-12 col-md-12 m-1`}
              >
                <div className="mb-2">
                  <div className="row align-items-center px-2">
                    <div className="col-md-1 f13">{selectedApprover.seqno}</div>
                    <div className="col-md-5 text-truncate f13" title={selectedApprover?.username}>{selectedApprover?.username}</div>
                    <div className="col-md-6 text-truncate f13" title={selectedApprover?.useremailid}>{selectedApprover?.useremailid || ""}</div>
                  </div> 
                  <div className="mt-1 f12 text-muted">
                    {/* Additional content if needed */}
                  </div>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </div>
    ) : null;
  })}
</div>

												</div>
											</div>
										</Box>
									</React.Fragment>
								);
							})}
						</div>
					</Box>
				</Drawer>
			</React.Fragment>
		</>
	);
};

export default ApprovalWorkFlow;
