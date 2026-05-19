import React, { useState, useEffect, useCallback } from "react";
import { Button, Drawer, IconButton, Switch } from "@mui/material";
import { Modal } from "react-bootstrap";
import { HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddNewEmailTemplate from "./AddNewEmailTemplate";
import { useCookies } from "react-cookie";
import Box from '@mui/material/Box';
import { actionTypes, useStateValue } from "../../../store";
import {
	LocalFormatDate,
	formatDate,
	getEventStage,
	getMenuMaster,
} from "../../../utils/common/utility";
import {UpdateEmailDetails,getEmailDetails,saveEmailDetails,} from "../../../utils/emailmaster";
import AddEditCell from "../ManageStage/AddEditCellWithWorkFlow";
import { StageFindAll, stageMaster } from "../../../utils/stagemaster";
import { ArrayFromString } from "../../../utils/common";
import AddEditCellWithWorkFlow from "../ManageStage/AddEditCellWithWorkFlow";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
const ManageEmailTemplate = () => {
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [page, setPage] = useState(1);
	const handleChange = (event, value) => {
		setPage(value);
	};
	
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [StageId, setStageId] = useState("");
	const [emailId, setemailId] = useState("");
	const [recorddata, setRecorddata] = useState([]);
	const [emailbody1, setEmailBody1] = useState("");
	const [emailbody2, setEmailBody2] = useState("");
	const [emailsubject, setEmailSubject] = useState("");
	const [emailevent, setEmailEvent] = useState(0);
	const [required, setRequired] = useState("");
	const [eventType, setMailtype] = useState("");
	const [status, setStatus] = useState("");
	const [mailto, setMailTo] = useState("");
	const [mailcc, setMailCC] = useState("");
	const [isactive, setisactive] = useState("");
	const [Emailsig, setEmailSig] = useState("");
	const [footer, setfooter] = useState("");
	const [mailbcc, setMailBCC] = useState("");
	const [createdon, setCreatedon] = useState("");
	const [modalStageOpen, setmodalStageOpen] = useState(false);
	const closeStageModal = () => setmodalStageOpen(false);

	const openStageModal = () => {
		setmodalStageOpen(true);
	};
	const [modal, setModal] = useState(false);
	const [state, setState] = useState({
		opensidebar: false,
	});
	const OpenModal = (event) => {
		if (!state.opensidebar) {
			seteditRecordData(null);
		}

		if (
			event &&
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}

		setState({ ...state, opensidebar: true });
		setModal(true);
	};

	const toggleDrawer = (anchor, open) => (event) => {
		if (open == false) {
			seteditRecordData(null);
		}
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
		  return;
		}
		setState({ ...state, [anchor]: open });
	};
	const CloseModal = () => {
		//close
		setModal(false);
		setemailId(0)
		seteditRecordData(null);
	};

	const callbackstep = useCallback(
	
		(data) => {
			
			setModal(false);
			setState({ ...state, right: false });
			seteditRecordData(null);
			
			emailDataList();
		},
		[page]
	);

	const callbackstagestep = useCallback(
		(data) => {
			
			setmodalStageOpen(false);
			//setState({ ...state, right: false });
			//pullStageList();
			//seteditRecordData(null);
			//emailDataList();
		}
	);

	const callback = useCallback((data) => {
		console.log("callbackAddCus", data);
		emailDataList();
	}, []);

	const callbackedit = useCallback((data) => {
		
		console.log("data to edit", data);
		seteditRecordData(data);
		setModal({ OpenModal });
		const emailId = data ? data.id : null; 
		setemailId(emailId)
		
		
	}, []);

	const callbackEmaillist = useCallback((newValue) => {
		setEmailEvent(newValue.emailevent);
		setMailtype(newValue.eventType);
		setMailTo(newValue.mailto);
		setMailCC(newValue.mailcc);
		setMailBCC(newValue.mailbcc);
		setEmailSubject(newValue.emailsubject);
		setisactive(newValue.setisactive);
		setEmailSig(newValue.emailsig);
		setEmailBody1(newValue.emailbody1);
		setfooter(newValue.footer);
		setPage(newValue.pagenumber);

		emailDataList();
	}, []);
const getMenuItemName = (MenuItemCode) => {
		const MenuItem = MenuMasterList?.find(
			(data) => data?.menuIdentity === MenuItemCode
		);
		return MenuItem ? MenuItem.menuName : "";
	};

	const [MenuMasterList, setMenuMasterList] = useState([]);
		const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			console.log("MenuMasterList loaded:", res);
			setMenuMasterList(res);
		});
	};
	useEffect(() => {
		pullMenuMaster();
		pullStageList();
	}, [page]);

	// Call emailDataList after MenuMasterList is updated
	useEffect(() => {
		if (MenuMasterList?.length > 0) {
			emailDataList();
		}
	}, [MenuMasterList]);

	const emailDataList = () => {
		var data = {
			CustomerId: customerid,
			// emailevent:emailevent,
			// eventType:eventType,
			// StageId:StageId,
			//  isactive:true
		};
		//setLoading(true)
		console.log("data", data);
		getEmailDetails(data, atoken).then((res) => {
			setGridloading(true);
			if (res?.length) {
				// Sort the data alphabetically by event type (using the menu name)
				// This ensures events like 'Auction', 'Bid', etc. are grouped alphabetically
				// Events starting with 'A' appear first, then 'B', and so on
				// All emails related to the same event (e.g., 'Auction') will appear together
				// Rows with empty events should appear at the end
				const sortedRes = res.sort((a, b) => {
					const eventNameA = getMenuItemName(a.eventType) || '';
					const eventNameB = getMenuItemName(b.eventType) || '';
					
					// Debug logging to verify sorting is working
					console.log("Sorting:", eventNameA, "vs", eventNameB);
					
					// If one event is empty and the other is not, put empty at the end
					if (!eventNameA && eventNameB) return 1;
					if (eventNameA && !eventNameB) return -1;
					
					// If both are empty, maintain original order
					if (!eventNameA && !eventNameB) return 0;
					
					// Use localeCompare for proper alphabetical sorting
					// This handles case-insensitive sorting and ensures proper alphabetical order
					// All 'Auction' events will be grouped together, then 'Bid' events, etc.
					return eventNameA.localeCompare(eventNameB, undefined, {
						sensitivity: 'base', // Case-insensitive (treats 'Auction' and 'auction' the same)
						numeric: true, // Handle numbers properly within text
						ignorePunctuation: false // Consider punctuation for more precise sorting
					});
				});

				console.log("Sorted email data:", sortedRes);
				// console.log("data", data);
				setRecorddata(sortedRes);
				setTotalRecords(res[0]?.totalrecords);
				setGridloading(false);
				// setPageCount(Math.ceil(res[0]?.totalrecords / 15));
			} else {
				setRecorddata([]);
				setTotalRecords(0);
				setPageCount(1);
			}
			setGridloading(false);
		});
	};
	const UpdateStageStatus = (data, id, atoken) => {
		if (id > 0) {
			UpdateEmailDetails(data, id, atoken).then((res) => {
				emailDataList();
			});
		}
	};

	const handleStatus = (values, isactive) => {
		console.log(values);

		if (isactive) {
			isactive = false;
		} else {
			isactive = true;
		}
		var data = {
			id: values?.id,
			emailevent: values?.emailevent,
			emailsubject: values?.emailsubject,
			templateid: values?.templateid,
			mailto: values?.mailto ? ArrayFromString(values?.mailto) : [],
			mailcc: values?.mailbcc ? ArrayFromString(values?.mailbcc) : [],
			mailbcc: values?.mailbcc ? ArrayFromString(values?.mailbcc) : [],
			subvarid: 0,
			eventType: values?.eventType,
			stageId: values?.stageId,
			emailbody1: values?.emailbody1,
			footer: values?.footer,
			isactive: isactive,
		};

		UpdateStageStatus(data, values.id, atoken);
	};

	
	const [EventStage, setEventStage] = useState([]);
	const pullStageList = () => {
		var data = {
			CustomerId: customerid,
		};

		stageMaster(data, atoken).then((res) => {
			
			setEventStage(res);
		});
	};
	const getEventStageName = (StageId) => {
		const eventStageItem = EventStage?.find((data) => data?.id === StageId);
		return eventStageItem ? eventStageItem?.stageName : "";
	};

	

	const [gridloading, setGridloading] = useState(true);
	const columnWidths = useResponsiveColumns();
	const columns = [
		{
			field: "eventType",
			headerName: "Event Type",
			renderCell: (params) => (
				//  <div className="textLigblue">{
				//   params?.formattedValue }</div>

				<div>{getMenuItemName(params?.formattedValue)}</div>
			),
			 width: 100,
		},
		{
			field: "emailevent",
			headerName: "Email Event",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
		 width: 300,
		},

		{
			field: "stageId",
			headerName: "Stage Name",
			renderCell: (params) => (
				<div>{getEventStageName(params?.formattedValue)}</div>
			),
			 width: 200,
		},

		//  {
		//    field: "isactive",
		//    headerName: "Status",
		//    width: 200,
		//    renderCell: (params) => (
		//      params?.formattedValue ? "Active" : "InActive"
		//    )
		//  },
		{
			field: "isactive",
			headerName: "Status",
			 width: 200,
			renderCell: (params) => (
				<Switch
					checked={params.value}
					onChange={() => handleStatus(params.row, params.value)}
					inputProps={{ "aria-label": "controlled" }}
					classes={{
						thumb: "MuiSwitch-thumb",
						switchBase: "MuiSwitch-switchBase",
						checked: "Mui-checked",
					}}
				/>
			),
		},
		{
			field: "action",
			headerName: "Action",
			 width: 200,
			renderCell: (params) => (
				<IconButton
					size="small"
					className="bg-white"
					onClick={() => callbackedit(params?.row)}
				>
					<HiPencilAlt className="f17 text-primary" />
				</IconButton>
			),
		},
	];

	const getRowId = (row) => {
		return row.id;
	};

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-12 col-md-8 col-lg-12 p-0 ">
						<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
							{/* Header with BackButton and Action Buttons */}
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
								<div className="d-flex align-items-center">
									<BackButton title={<span className="page-heading">Email Master</span>} />
								</div>
								
								{/* Action Buttons */}
								<div className="d-flex align-items-center gap-2">
									<div className="actionpin-wrap">
										<Button
											variant="text"
											size="large"
											startIcon={<HiPlusSm />}
											className="text-capitalize blue-text font-normal"
											onClick={OpenModal}
										>
											Add New
										</Button>
									</div>
								</div>
							</div>

							{/* Main Content */}
							<div className="flex-grow-1 overflow-auto">
								<div className="p-3 pt-0">
									{gridloading ? (
										<GridSkeleton/>
									) : (
										<>
											<div style={{ height: '400px', width: '100%' }}>
												<DataGrid
													getRowId={getRowId}
													rows={recorddata}
													loading={gridloading}
													columns={columns}
													disableColumnMenu
													disableColumnSelector
													rowHeight={40}
													columnHeaderHeight={35}
													className="f13 bg-white data-grid-scrollable"
													disableRowSelectionOnClick
													getRowClassName={(params) =>
														params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
													}
													slots={{ toolbar: GridToolbar }}
													slotProps={{
														toolbar: {
															showQuickFilter: true,
														},
													}}
												/>
											</div>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				keyboard={false}
				//  className=""
				// backdropClassName=""
				centered
				contentClassName="border-0 rounded"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderNotificationCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">Email Template</div>
					</Modal.Title>

					<IconButton onClick={() => CloseModal()} size="small" edge="start">
						<HiOutlineX className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddNewEmailTemplate
							callbackstep={callbackstep}
							callbackStageOpen={openStageModal} 
							editRecordData={editRecordData}
							seteditRecordData={seteditRecordData}
							handleEmailModalClose={()=>{}}
							emailId={emailId}
							recorddata={recorddata}
						
						/>
						{/* <AddNewEmailTemplate callback={callback} /> */}
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				size="lg"
				show={modalStageOpen}
				className="zindex1280"
				backdropClassName="zindex1280"
				//backdrop="static"
				keyboard={false}
				centered
				onHide={closeStageModal}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14">Manage Stage</div>
					</Modal.Title>
					<IconButton onClick={closeStageModal} size="small" edge="start">
						<HiOutlineX className="" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddEditCellWithWorkFlow callbackstagestep={callbackstagestep} />
					</div>
				</Modal.Body>
			</Modal>
			{/* <React.Fragment key='top'  >
                <Drawer
                    anchor='right'
                    open={state['right']}
                    onClose={toggleDrawer('right', false)}>
                    <Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 980 }, }} >
                        <div className='flex flex-col'>
                            <Box className='bgheaderCards'>
                                <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                                    <div className='ms-3 text-white'>
										Add Stage
                                    </div>
                                    <div>
                                        <IconButton
                                            onClick={toggleDrawer('right', false)}
                                            size="small"
                                            edge="start"
                                            sx={{ mr: 1 }}
                                        >
                                            <HiOutlineX className='f20 text-white' />
                                        </IconButton>
                                    </div>
                                </div>
                            </Box>
                            <div className='h50px'></div>
                            <Box sx={{ flexGrow: 1, p: 2 }} >
								<AddEditCellWithWorkFlow 
									callbackstagestep={callbackstagestep}
									//editRecordData={editRecordData}
									//seteditRecordData={seteditRecordData}
									
									//handlestageList={handlestageList}
								/>
                            </Box>
                        </div>
                    </Box>
                </Drawer>
            </React.Fragment> */}
		</>
	);
};
export default ManageEmailTemplate;
