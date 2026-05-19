import React, { useState, useCallback, useEffect } from "react";
import { Button, IconButton, Switch, MenuList, Tooltip } from "@mui/material";
import { Modal } from "react-bootstrap";
import { HiOutlineX, HiPlusSm, HiPencilAlt } from "react-icons/hi";
import Box from '@mui/material/Box';
import AddEditCell from "./AddEditCell";
import "../../../assets/css/base.css";
import { useStateValue } from "../../../store";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { StageFindAll, UpdateStage, stageMaster } from "../../../utils/stagemaster";
import { OrgGroupMasterList, getMenuMaster, getPurchaseOrgList } from "../../../utils/common/utility";
import { getEmailDetails } from "../../../utils/emailmaster";
import AddEditCellWithWorkFlow from "./AddEditCellWithWorkFlow";
import { BackButton } from "../../../utils/common/component";
import useResponsiveColumns from "../../../components/useResponsiveColumns";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import AddEditCellWithWorkFlow1 from "./AddEditCellWithWorkflow1";

const ManageStageList = () => {
	const [page, setPage] = useState(1);
	const [modalStageOpen, setmodalStageOpen] = useState(false);
	const CloseModal = () => {
		setmodalStageOpen(false);
		seteditRecordData(null);
	};
	const OpenModal = () => setmodalStageOpen(true);
	const [state, setState] = useState({
		right: false,
	});
	const [showFullScreenForm, setShowFullScreenForm] = useState(false);
	
	const toggleDrawer = (anchor, open) => (event) => {
		if (open == false) {
			seteditRecordData(null);
			setEditYN('true')
		}
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
		  return;
		}
		setState({ ...state, [anchor]: open });
	};

	const handleOpenFullScreen = () => {
		setShowFullScreenForm(true);
	};

	const handleCloseFullScreen = () => {
		setShowFullScreenForm(false);
		seteditRecordData(null);
		setEditYN('true');
	};

	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const [editRecordData, seteditRecordData] = useState(null);
	const [editYN, setEditYN] = useState(true);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [recorddata, setRecorddata] = useState([]);
	const [loading, setLoading] = useState(false);
	const [checked, setChecked] = useState(false);
	const [data, setData] = useState([]);

	const [recorddataWF, setRecorddataWF] = useState([]);

	useEffect(() => {
		pullMenuMaster();
		//pullStageList();
		
		emailDataList(); 
		PurchaseOrganisation();
		getPurchasegrplist();
	}, []);
	 
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};
        
		getMenuMaster(data, atoken).then((res) => {
			setMenuMasterList(res);
		});
	};
	useEffect(() => {
		// Call pullStageList after MenuMasterList is updated
		if (MenuMasterList?.length > 0) {
			pullStageList();
		}
	}, [MenuMasterList]);
	const getMenuItemName = (MenuItemCode) => {
		
		const MenuItem = MenuMasterList.find(
			(data) => data?.menuIdentity === MenuItemCode

		);
		return MenuItem ? MenuItem.menuName : "";
	
	};


	const callbackstagestep = useCallback(
		(data) => {
			//setModal({ ...modal, right: false });
			//setmodalStageOpen(false);
			setState({ ...state, right: false });
			setShowFullScreenForm(false);
			seteditRecordData(null);
			setRecorddataWF(null);
			pullStageList();
		},
		[MenuMasterList]
	);

	const callbackedit = useCallback((data) => {
		
		seteditRecordData(data); 
		//setmodalStageOpen({ ...modalStageOpen, right: false });
		setShowFullScreenForm(true);
		const editYNValue = data.editYN ?? true; 
		setEditYN(editYNValue); 
	}, []);

	const UpdateStageStatus = (data, id, atoken) => {
		if (id > 0) {
			UpdateStage(data, id, atoken).then((res) => {
				pullStageList();
			});
		}
	};
	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const PurchaseOrganisation = () => {
		
		var data = {
		  CustomerId : customerid
		};
		getPurchaseOrgList(data, atoken).then((resp) => { 
		  console.log("resp purchase", resp);
		  setPurchaseAllList(resp);
		});
	  };
	  const [purchasegrpList, setpurchasegrpList] = useState([]);
	  const getPurchasegrplist = (OrgMstId) => {
		
		var data = { 
			CustomerId: customerid
			
		 };
		if(OrgMstId>0)
		{
			
		 data = {
			OrgMstId: OrgMstId,
			CustomerId: customerid
			
		 };
		}
	  //  console.log("data",data);
		OrgGroupMasterList(data, atoken)
		  .then((res) => {
			
		  
			if (res && Array.isArray(res)) {
			  // if (res?.length > 0)
			  
			  //console.log("res",res);
			  setpurchasegrpList(res);
			  //console.log("purchasegrpList",purchasegrpList);
			}
		  })
		  .catch((error) => {
			//console.error("Error:", error);
		  });
	  };
	const handleStatus = (rowValue, isActive) => {
		console.log(rowValue);
	
		
		if (rowValue.editYN ==false && rowValue.editYN !=null) {
			console.log("Cannot update isActive because editYN is false.");
			return;
		}
	
		// Toggle isActive
		isActive = !isActive;
	
		rowValue.isActive = isActive;
	
		UpdateStageStatus(rowValue, rowValue.id, atoken);
	};
	

	// const handleStatus = (rowValue, isActive) => {
		
	// 	console.log(rowValue);

	// 	if (isActive) {
	// 		isActive = false;
	// 	} else {
	// 		isActive = true;
	// 	}

	// 	rowValue.isActive = isActive;

	// 	UpdateStageStatus(rowValue, rowValue.id, atoken);
	// };

	// const pullStageList = () => {
	// 	var data = {
	// 		CustomerId: customerid,
	// 	};

	// 	setLoading(true);

	// 	stageMaster(data, atoken).then((res) => {
	// 		setGridloading(true);
	// 		if (res?.length) {
	// 			setRecorddata(res);
	// 			setTotalRecords(res[0]?.totalrecords);
	// 			setGridloading(false);
	// 			setPageCount(Math.ceil(res[0]?.totalrecords / 10));
	// 		}
    //   setLoading(false);
	// 		setGridloading(false);
	// 	});
	// };
	
	  
	const handlestageList = (array) => {
		
		setRecorddata(array);
	};
	


	const getMenuItemEmail = (MenuItemCode) => {
		const MenuItem = emaildata.find((data) => data?.id === MenuItemCode);
		return MenuItem ? MenuItem.emailevent : "";
	};
	const pullStageList = () => {
		var data = {
		  CustomerId: customerid,
		  SortingColumn:'EventType'
		};
	  
		setLoading(true);
		
		stageMaster(data, atoken).then((res) => {
		  setGridloading(true);
		  
		  if (res?.length) {
			// Iterate through res to update eventName
			const updatedRes = res.map((item) => ({
			  ...item,
			  eventName: getMenuItemName(item?.eventType),
			}));

			// Sort the data alphabetically by eventName, then by stageSeq (sequence) in ascending order
			// Rows with empty events should appear at the end
			const sortedRes = updatedRes.sort((a, b) => {
				const eventNameA = a.eventName || '';
				const eventNameB = b.eventName || '';
				
				// If one event is empty and the other is not, put empty at the end
				if (!eventNameA && eventNameB) return 1;
				if (eventNameA && !eventNameB) return -1;
				
				// If both are empty, maintain original order
				if (!eventNameA && !eventNameB) return 0;
				
				// First sort by eventName alphabetically
				const eventCompare = eventNameA.localeCompare(eventNameB);
				if (eventCompare !== 0) {
					return eventCompare;
				}
				// If eventNames are the same, sort by stageSeq in ascending order
				return (a.stageSeq || 0) - (b.stageSeq || 0);
			});
	        
			setRecorddata(sortedRes);
			setTotalRecords(res[0]?.totalrecords);
			setPageCount(Math.ceil(res[0]?.totalrecords / 10));
		  }
		  setLoading(false);
		  setGridloading(false);
		});
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
	

	const [gridloading, setGridloading] = useState(true);
	const columnWidths = useResponsiveColumns();
	const columns = [
		// {
		// 	field: "eventType",
		// 	headerName: "Event ",
		// 	renderCell: (params) => (
		// 		<div>{getMenuItemName(params?.formattedValue)}</div>
		// 	),
		// 	width: 110,
		// },
		{
			field: "eventName",
			headerName: "Event ",
			renderCell: (params) => (
				<div>{params?.formattedValue}</div>
			),
			width: columnWidths.stages,

		},
		{
			field: "stageName",
			headerName: "Stage Name",
			width: columnWidths.stages
		},
		{
			field: "emailId",
			headerName: "Email Template",
			renderCell: (params) => (
				<div>{getMenuItemEmail(params?.formattedValue)}</div>
			),
			width: columnWidths.stages
		},

		{
			field: "stageSeq",
			headerName: "Sequence",
			width: columnWidths.stages
		},

		{
			field: "mandatory",
			headerName: "Mandatory",
			width:columnWidths.stages,
			renderCell: (params) => (params.formattedValue ? "Yes" : "No"),
		},
		// {
		// 	field: "isActive",
		// 	headerName: "Status",
		// 	width:110,
		// 	renderCell: (params) => (
		// 		<Switch
		// 			checked={params.value}
		// 			onChange={() => handleStatus(params.row, params.value)}
		// 			inputProps={{ "aria-label": "controlled" }}
		// 			classes={{
		// 				thumb: "MuiSwitch-thumb",
		// 				switchBase: "MuiSwitch-switchBase",
		// 				checked: "Mui-checked",
		// 			}}
		// 		/>
		// 	),
		// },
		{
            field: "isActive",
            headerName: "Status",
            width: 110,
            renderCell: (params) => (
                <Tooltip
                    title={params.row.editYN ==false && params.row.editYN !=null ? "Predefined stages are non-editable" : ""}
                    arrow
                >
                    <div className={!params.row.editYN ? 'non-editable' : ''}>
                        <Switch
                            checked={params.value}
                            onChange={() => handleStatus(params.row, params.value)}
                            inputProps={{ "aria-label": "controlled" }}
                            classes={{
                                thumb: "MuiSwitch-thumb",
                                switchBase: "MuiSwitch-switchBase",
                                checked: "Mui-checked",
                            }}
                            disabled={params.row.editYN ==false && params.row.editYN !=null} // Disable the switch if non-editable
                        />
                    </div>
                </Tooltip>
            ),
        },
		{
			field: "action",
			headerName: "Action",
			width: 110,
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
	// const getRowClassName = (params) => {
    //     return params.row.editYN === false ? 'grey-row' : '';
    // };
	const getRowId = (row) => {
		return row.id;
	};

	// Render full screen form if showFullScreenForm is true
	if (showFullScreenForm) {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-12 p-0">
						<div className="bg-white rounded-default shadow-sm p-3 w-100" style={{ minHeight: 'calc(100vh - 120px)' }}>
							<AddEditCellWithWorkFlow1 
								callbackstagestep={callbackstagestep}
								editRecordData={editRecordData}
								seteditRecordData={seteditRecordData}
								handlestageList={handlestageList}
								editYN={editYN}
								purchaseAllList={purchaseAllList}
								setPurchaseAllList={setPurchaseAllList}
								purchasegrpList={purchasegrpList}
								setpurchasegrpList={setpurchasegrpList}
								onCancel={handleCloseFullScreen}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-12 col-md-8 col-lg-12 p-0 ">
						<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
							{/* Header with BackButton and Action Buttons */}
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
								<div className="d-flex align-items-center">
									<BackButton title={<span className="page-heading">Stage Master</span>} />
								</div>
								
								{/* Action Buttons */}
								<div className="d-flex align-items-center gap-2">
									<div className="actionpin-wrap">
										<Button
											variant="text"
											size="large"
											startIcon={<HiPlusSm />}
											className="text-capitalize blue-text font-normal"
											onClick={handleOpenFullScreen}
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
													disableDensitySelector
													disableColumnMenu
													disableColumnSelector
													getRowClassName={(params) =>
														params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
													}
													rowHeight={35}
													//getRowClassName={getRowClassName} 
													columnHeaderHeight={35}
													className="f12 bg-white data-grid-scrollable"
													disableRowSelectionOnClick
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
				show={modalStageOpen}
				backdrop="static"
				keyboard={false}
				centered
				contentClassName="border-0 rounded custom-modal-content"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14">Add Stage</div>
					</Modal.Title>
					<IconButton onClick={() => CloseModal()} size="small" edge="start">
						<HiOutlineX className="" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddEditCell 
							callbackstagestep={callbackstagestep}
							editRecordData={editRecordData}
							seteditRecordData={seteditRecordData}
							handlestageList={handlestageList}
							purchaseAllList={purchaseAllList}
							setPurchaseAllList={setPurchaseAllList}
							purchasegrpList={purchasegrpList}
							setpurchasegrpList ={setpurchasegrpList}
						/>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};
export default ManageStageList;
