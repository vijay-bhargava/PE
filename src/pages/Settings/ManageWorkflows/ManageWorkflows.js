import React, { useEffect, useState, useCallback } from "react";
import {
	Autocomplete,
	Box,
	FormGroup,
	Button,
	Checkbox,
	Drawer,
	FormControl,
	FormControlLabel,
	FormLabel,
	IconButton,
	Input,
	InputLabel,
	Avatar,
	Chip,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Tooltip,
	Switch,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
	HiOutlineX,
	HiPencilAlt,
	HiPlusSm,
	HiOutlineTrash,
} from "react-icons/hi";
import { LoadingButton } from "@mui/lab";
import { Modal } from "react-bootstrap";
import AddWorkflowCell from "./AddWorkflowCell";
import {
	getuserlist,
	getwfapproverseqn,
	getworkflowlist,
	updatedworkflow,
} from "../../../utils/workflow";
import { Cookies, useCookies } from "react-cookie";
import { useFormik } from "formik";
import {
	OrgGroupMasterList,
	formatDate,
	getMenuMaster,
	getPurchaseOrgList,
	getUserDepartment,
	getUserDesignation,
} from "../../../utils/common/utility";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import { saveWorkflow, AddWFApprover } from "../../../utils/workflow";
import NoRecordCell from "../../../components/NoRecordCell";
import { toast } from "react-toastify";
import { StageFindAll, stageMaster } from "../../../utils/stagemaster";
import { id } from "date-fns/locale";

const ManageWorkflows = (props) => {
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const [page, setPage] = useState(1);
	const handleChange = (event, value) => {
		setPage(value);
	};

	const [state, setState] = useState({
		opensidebar: false,
	});

	const toggleDrawer = (anchor, open) => (event) => {
		if (open == false) {
			seteditRecordData(null);
		}
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};
	const inputDate = new Date();
	let formattedDate = formatDate(inputDate);
	const [editRecordData, seteditRecordData] = useState(null);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [recorddata, setRecorddata] = useState([]);
	const [userOptions, setUserOptions] = useState([""]);
	const [wfName, setWfName] = useState("");
	const [eventType, SetEventType] = useState("");
	const [required, setRequired] = useState(false);
	const [status, setStatus] = useState(true);
	const [createdon, setCreatedon] = useState(formattedDate);

	const callbackstep = useCallback(
		(data) => {
			setState({ ...state, right: false });
			seteditRecordData(null);
			pullWorkFlowDataList();
		},
		[page, recorddata, totalRecords, pageCount]
	);

	const callback = useCallback((pass) => {
		//console.log("callbackAddCus", pass);
		// setcusupdata(pass);
		// setModalUploadShow(true)
	}, []);

	const callbackedit = useCallback((data) => {
		seteditRecordData(data);
		setState({ ...state, opensidebar: true });
	}, []);
	const UpdateStageStatus = (data, id, atoken) => {
	
		if (id > 0) {
			updatedworkflow(data, id, atoken).then((res) => { 
	       

				pullWorkFlowDataList();
		  
		  });
		}
	  }
	
	
	  const handleStatus = (rowValue, isactive) => {
		console.log(rowValue);
	
	
		if(isactive)
		{
			isactive = false;
		}
		else
		{
			isactive = true;
		}
		
		rowValue.isactive= isactive;
	
		UpdateStageStatus(rowValue, rowValue.id,atoken);
	  };

	const callbackwflist = useCallback((newValue) => {
		setWfName(newValue.wfName);
		SetEventType(newValue.eventType);
		setRequired(newValue.required);
		setStatus(newValue.status);
		setCreatedon(newValue.createdon);
		setPage(newValue.pagenumber);
		pullWorkFlowDataListNew(newValue);
	}, []);

	useEffect(() => {
		PullUserDesignation({
			CustomerId:customerid
		});
		PullUserDepartment({CustomerId:customerid})
		pullWorkFlowDataList();
		pullMenuMaster();
		pullStageList();
		PurchaseOrganisation();
		getPurchasegrplist();
	}, [page]);

	const userList = (customerId) => {
		var data = {
			customerId: customerid,
		};
		getuserlist(data, atoken).then((res) => {
			if (res && Array.isArray(res)) {
				setUserOptions(res);
			} else {
				return userOptions;
			}
		});
	};
	const [designation, setdesignation] = useState("");
	const [designationId, setdesignationId] = useState(0);
	const [departmentId, SetDepartmentId] = useState(0);
	const [UserDepartmentAll, setUserDepartmentAll] = useState([]);
	const [UserDepartment, setUserDepartment] = useState([]);
	const [UserDesignation, setUserDesignation] = useState([]);
	const [departmentName, setdepartmentName] = useState("");
	// const PullUserDesignation = (dataRequest) => {
	// 	getUserDesignation(dataRequest, atoken).then((res) => {
	// 		setUserDepartmentAll(res);
	// 		const filteredDepartment = res?.filter((rowData) => {
	// 			return rowData.editYN == "Y";
	// 		});

	// 		const uniqueMap = {};
	// 		const uniqueArray = filteredDepartment?.filter((item) => {
	// 			if (!uniqueMap[item?.departmentName]) {
	// 				uniqueMap[item?.departmentName] = true;
	// 				return true;
	// 			}
	// 			return false;
	// 		});

	// 		setUserDepartment(uniqueArray);
	// 		setUserDesignation(res);
	// 	});
	// }; const [UserDepartment, setUserDepartment] = useState([]);
  const PullUserDepartment = (dataRequest) => {

	getUserDepartment(dataRequest, atoken).then((res) => { 
	
	 setUserDepartment(res);
	
   });
 };
	
	const PullUserDesignation = (departmentId) => {
		var dataRequest ={
			CustomerId: customerid,
			DepartmentId:departmentId
		}

	   getUserDesignation(dataRequest, atoken).then((res) => {
  
	   setUserDesignation(res);
	  });
	};
	const [wfid, setWfid] = useState(0);
	const [eventtype, setEventtype] = useState(0);
	const [selectUserrole, setselectUserrole] = useState(0);
	const [selectUserOption, setSelectUserOption] = useState("U");
	const [modal, setModal] = useState(false);
	const [budgetstatus, setbudgetstatus] = useState("");
	const [approverseq, setapproverseq] = useState([]);

	const OpenModal = (item) => {
		setModal(true);
		setselectUserrole(0);
		userList(item.customerId);
		setSelectUserOption(item.approverusertype);
		setWfid(item?.id);
		setEventtype(item.eventtype);
		getappseq(item.id);
	};

	const getappseq = (wfid) => {
		var data = {
			id: 2,
			wfid: wfid,
		};

		getwfapproverseqn(data, atoken).then((res) => {
			if (res && Array.isArray(res)) {
			
				if (res[0]?.designationId > 0) {
					setselectUserrole(res[0]?.designationId);
				}
				setbudgetstatus(res[0]?.budgetstatus);
				setapproverseq(res);
			} else {
				return;
			}
		});
	};


	
	const pullWorkFlowDataList = () => {
		
		var data = {
			CustomerId: customerid,
		
		};

		getworkflowlist(data, atoken).then((res) => {
			setGridloading(true);

			if (res?.length) {
				setRecorddata(res);
				setGridloading(false);
			} else {
				setRecorddata([]);
				setTotalRecords(0);
				setPageCount(1);
			}
		});
	};

	const pullWorkFlowDataListNew = (newvalue) => {
		var data = {
			customerid: newvalue.customerid,

			wfName: newvalue.wfName,
			eventType: newvalue.eventType,
			required: newvalue.required,
			status: newvalue.status,
			userid: 1,
			createdon: newvalue.createdon,
			pagenumber: newvalue.page,
		};
		getworkflowlist(data, atoken).then((res) => {
			if (res?.length) {
				setRecorddata(res);
			} else {
				setRecorddata([]);
				setTotalRecords(0);
				setPageCount(1);
			}
		});
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
	  const getOrganizationName = (id) => {
		
		const eventStageItem= purchaseAllList.find(
			(data) => data?.id === id
		);
		return eventStageItem ? eventStageItem.orgName : "";
	};

	
	const [gridloading, setGridloading] = useState(true);
	const columns = [
		{
			field: "eventtype",
			headerName: "Event",
			renderCell: (params) => (
				<div>{getMenuItemName(params?.formattedValue)}</div>
			),
			width: 200,
		},
		{
			field: "wfname",
			headerName: "Workflow",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: 200,
		},
	

	
		{
			field: "stageId",
			headerName: "Stage Name",
			renderCell: (params) => (
				<div>{getEventStageName(params?.formattedValue)}</div>
				
			),
			width: 200,
		},
	
		{
			field: "approverusertype",
			headerName: "Users/Designation",
			width: 200,
			renderCell: (params) => (
				<div className="text-muted f12 d-inline-block p-2 pt-1 pb-1">
					<Chip
						avatar={<Avatar>{params.row.approverusertype}</Avatar>}
						size="small"
						label={
							params.row.approverusertype === "U"
								? "Users"
								: params.row.approverusertype === "R"
								? "Designation"
								: "Set Approver"
						}
						color="primary"
						variant="outlined"
					/>
					{params.row.users > 0 ? `(${params.row.users})` : ""}
				</div>
			),
		},

		// {
		// 	field: "isactive",
		// 	headerName: "Status",
		// 	width: 250,
		// 	renderCell: (params) => (params?.formattedValue ? "Active" : "InActive"),
		// },

		{
			field: "required",
			headerName: "Mandatory",
			width:200,
			renderCell: (params) => (params.formattedValue ? "Yes" : "No"),
		},
		{
			field: 'isactive', 
			headerName: 'Status', 
			width: 200,
			renderCell: (params) => (
			  <Switch
				checked={params.value}
				onChange={() => handleStatus(params.row, params.value)}
				inputProps={{ 'aria-label': 'controlled' }}
				classes={{
				  thumb: "MuiSwitch-thumb",
				  switchBase: "MuiSwitch-switchBase",
				  checked: "Mui-checked",
				}}
			  />
			)
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
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			// console.log(res);
			setMenuMasterList(res);
		});
	};

	const getMenuItemName = (MenuItemCode) => {
		const MenuItem = MenuMasterList.find(
			(data) => data?.menuIdentity === MenuItemCode
		);
		return MenuItem ? MenuItem.menuName : "";
	};
	const [EventStage, setEventStage] = useState([]);
	const pullStageList = () => {
		var data = {
		  CustomerId:customerid
		};
	 
		stageMaster(data, atoken).then((res) => {
			setEventStage(res);
	 	
		});
	  };
	const getEventStageName = (StageId) => {
		
		const eventStageItem= EventStage.find(
			(data) => data?.id === StageId
		);
		return eventStageItem ? eventStageItem.stageName : "";
	};

	const [rowCell, setRowCell] = useState(null);
	const handleRowClick = (params) => {};

	const handleCellClick = (params) => {
		if (params.field == "approverusertype") {
			//console.log(params.row);
			OpenModal(params.row);
			setRowCell(params.row);
		}
	};

	const CloseModal = () => {
		setModal(false);
		setWfid(0);
		setEventtype("");
		setSelectUserOption("U");
	};

	const [inputList, setInputList] = useState();
	const handleInputChange = (e, index) => {
	
	const { name, value } = e.target;
		let setvalue = value;
		if(value!="" && value>0)
	  	 setvalue = parseInt(value);

		const list = approverseq;
		list[index][name] = setvalue;
		
		formikcat.setFieldValue(`seqno-${index}`, setvalue);
		setapproverseq(list);
		
	};
	

	const onlyNumbers = (e) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
	};
	const handleUserChange = (event, value) => {
		// 
		setSelectedUsers(value);
	};

	const handleDesinationChange = (event, value) => {
		console.log(value);
		setSelectedUsers(value);

	};
	// const handleDesinationChange = (e) => {
	// 	const selectedId = e.target.value;
	// 	const selecteddesignation = UserDesignation.find(cat => cat.id === selectedId);
	// 	setdesignationId(selectedId); 
	// 	setdesignation(selecteddesignation.name);
	// 	setSelectedUsers(value);
	//   };

	const handleDepartmentChange = (event, value) => {
	
		SetDepartmentId(value?.id)
		setdepartmentName(value?.departmentName);
		PullUserDesignation(value?.id);
	};

	const [selectedUsers, setSelectedUsers] = useState([]);



	const handleSubmitClick = () => {
		
		const approverseqCheck = approverseq?.filter((rowData) => {
			return isNaN(rowData.seqno) || rowData.seqno === '' || rowData.seqno === 0;
		});
	
		if (approverseqCheck.length > 0) {
			// Show toast notification
			toast.error("Please fill the sequence number!", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 1000,
			});
			return;
		}
	
	
		formikcat.setFieldValue("customerid", 1);
		formikcat.setFieldValue("usertype", selectUserOption);
		formikcat.setFieldValue("wfid", wfid);
		formikcat.handleSubmit();
	};


	const formikcat = useFormik({
		enableReinitialize: true,
		initialValues: {
			//custoemerid: itemin.custoemerid,
			token: atoken,
			// id:0,
			wfid: rowCell?.id,
			type: rowCell?.id,
			seqno: 0,
			userid: 0,
			username: "",
			useremailid: "",
			budgetstatus: "",
			designationId: 0,
			createdby: 1,
		},
		//validationSchema: validationSchema,
		onSubmit: (values) => {
			var datapost = {
				wfid: rowCell?.id ? rowCell?.id : 0,
				approverusertype: selectUserOption,
				designationId: selectUserrole,
				budgetstatus: budgetstatus,
				approverlist: approverseq,
				

			};
			//console.log(datapost)

			AddWFApprover(datapost, atoken).then((res) => {
				setLoading(false);
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				//callbackstep('update');
				SetDepartmentId(0)
				setdepartmentName('')
				setselectUserrole(0);
				setModal(false);
				pullWorkFlowDataList();
				return true;
			});
		},
	});

	const handleRemoveClick = (index) => {
		const list = [...approverseq];
		list.splice(index, 1);
		setapproverseq(list);
	};

	// const handleAddUser = () => {
	
	// 	if (selectUserOption == "R") {
	// 		const isFound = approverseq.some((element) => {
	// 			return element.id === selectedUsers.id;
	// 		});

	// 		if (isFound) {
	// 			toast.error('The user has been added already', {
	// 				position: toast.POSITION.TOP_CENTER,
	// 				autoClose: 1000,
	// 			});
	// 		} else {
				
	// 			setapproverseq((approverseq) => [
	// 				...approverseq,
	// 				{
	// 					wfid: rowCell.id, 
	// 					departmentId: departmentId,
	// 					username: selectedUsers?.name,
	// 					designationId: selectedUsers?.id,
	// 					department: departmentName,  
	// 					useremailid: "",
	// 					seqno:0,
	// 					budgetstatus: budgetstatus,
	// 				},
	// 			]);
	// 		}
	// 	} else {
	// 		if (selectedUsers?.id > 0) {
			
	// 			const isFound = approverseq.some((element) => {
	// 				return element.id === selectedUsers.id;
	// 			});

	// 			if (isFound) {
	// 				//console.log("array contains object with id = " + selectedUsers.id);
	// 			} else {
	// 				setapproverseq((approverseq) => [
	// 					...approverseq,
	// 					{
	// 						wfid: rowCell.id,
	// 						userid: selectedUsers.id,
	// 						username: selectedUsers.name,
	// 						useremailid: selectedUsers.email,
	// 						budgetstatus: budgetstatus,
	// 					},
	// 				]);
	// 			}
	// 		}
	// 	}
	// };
	const handleAddUser = () => {
		if (selectUserOption === "R") {
			if (selectedUsers?.id > 0) {
				const isFound = approverseq.some((element) => {
					return element.designationId === selectedUsers.id;
				});
	
				if (!isFound) {
					const maxSeqNo = Math.max(...approverseq.map(user => user.seqno), 0);
	
					setapproverseq((approverseq) => [
						...approverseq,
						{
							wfid: rowCell.id,
							departmentId: departmentId,
							username: selectedUsers?.name,
							designationId: selectedUsers?.id,
							department: departmentName,
							useremailid: "",
							seqno: maxSeqNo + 1,
							budgetstatus: budgetstatus,
						},
					]);
				} else {
					toast.error('The user has been added already', {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
				}
			}
		} else {
			if (selectedUsers?.id > 0) {
				const isFound = approverseq.some((element) => {
					return element.userid === selectedUsers.id;
				});
	
				if (!isFound) {
					const maxSeqNo = Math.max(...approverseq.map(user => user.seqno), 0);
					const newSeqNo = maxSeqNo === 0 ? 1 : maxSeqNo + 1;
					setapproverseq((approverseq) => [
						...approverseq,
						{
							wfid: rowCell.id,
							userid: selectedUsers.id,
							username: selectedUsers.name,
							useremailid: selectedUsers.email,
							seqno: newSeqNo,
							budgetstatus: budgetstatus,
						},
					]);
				} else {
					toast.error('The user has been added already', {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
				}
			}
		}
	};
	
	

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-12 col-md-8 col-lg-12 p-0 ">
						<div className="d-flex flex-column min-vh-100">
							<div className="d-flex justify-content-between minh50px align-items-center bg-white p-2 border-bottom">
								<div className="page-heading f16">Manage Workflows</div>
								<div>
									<div className="action-wrap">
										<Button
											variant="text"
											size="small"
											startIcon={<HiPlusSm />}
											className="text-capitalize font-normal"
											onClick={toggleDrawer("opensidebar", true)}
										>
											Add New
										</Button>
									</div>
								</div>
							</div>
							<div className="flex-grow-1 m-2 bg-white rounded">
								<div className="p-3">
									<div className="row">
										<div className="col-12 mb-3">
											<DataGrid
												//onRowClick={handleRowClick}
												getRowId={getRowId}
												rows={recorddata}
												//loading={gridloading}
												loading={recorddata.length === 0 ? false : gridloading}
												columns={columns}
												autoHeight
												// getRowClassName={(params) =>
												//   //params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
												//   setSelectedRow(params.row)
												// }
												rowHeight={40}
												columnHeaderHeight={40}
												className="f13 border-0"
												disableRowSelectionOnClick
												slots={{ toolbar: GridToolbar }}
												slotProps={{
													toolbar: {
														showQuickFilter: true,
													},
												}}
												onCellClick={handleCellClick}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* <FilterCell callbackwflist={callbackwflist} /> */}
				</div>
			</div>
			<React.Fragment key="top">
				<Drawer
					anchor="right"
					open={state["opensidebar"]}
					onClose={toggleDrawer("opensidebar", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 ,lg: 1000} }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Add Workflow</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensidebar", false)}
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
							<Box sx={{ flexGrow: 1, p: 2 }}>
								<AddWorkflowCell
									callbackstep={callbackstep}
									editRecordData={editRecordData}
									purchaseAllList={purchaseAllList}
									setPurchaseAllList={setPurchaseAllList}
									purchasegrpList={purchasegrpList}
									setpurchasegrpList ={setpurchasegrpList}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				keyboard={false}
				centered
				contentClassName="border-0 rounded"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14">
							<div className="col-12 text-white">Workflow Approval</div>
						</div>
					</Modal.Title>
					<IconButton onClick={() => CloseModal()} size="small" edge="end">
						<HiOutlineX className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="pl-2 pr-2">
					<form autoComplete="off">
						<div className="row">
							<div className="col-10 col-md-4 col-sm-3 mt-3">
								<FormControl className="mb-2 w-100">
									<RadioGroup
										row
										aria-labelledby="usertype"
										name="usertype"
										value={selectUserOption}
										onChange={(event) => {
											setSelectUserOption(event.target.value);
										}}
									>
										<FormControlLabel
											value="U"
											control={<Radio size="small" />}
											label="Users"
										/>

										<FormControlLabel
											value="R"
											control={<Radio size="small" />}
											label="Designation"
										/>
									</RadioGroup>
								</FormControl>
							</div>
						</div>
						<div className="row">
							<div className="col-12 col-md-6 mt-1">
								<FormControl fullWidth>
									{selectUserOption === "U" ? (
										<Autocomplete
											multiple={false}
											id="UserBindId"
											name="UserBindId"
											className="mb-4 mt-0"
											sx={{ width: "100%" }}
											size="small"
											options={userOptions}
											getOptionLabel={
												(option) => `${option.name} - ${option.email}` // Display name and email
											}
											onChange={handleUserChange}
											filterSelectedOptions
											renderInput={(params) => (
												<TextField
													{...params}
													variant="outlined"
													placeholder=""
													label="Select Users*"
													value={formikcat?.values?.userOptions}
													error={
														formikcat.touched.userOptions &&
														Boolean(formikcat.errors.userOptions)
													}
													helperText={
														formikcat.touched.userOptions &&
														formikcat.errors.userOptions
													}
												/>
											)}
										/>
									) : selectUserOption === "R" ? (
										<>
											<div
												className="col-12 col-md-12 mt-1"
												style={{ display: "flex", gap: "20px" }}
											>
												<Autocomplete
													multiple={false}
													id="DepartmentBind"
													name="DepartmentBind"
													className="mb-8 mt-0"
													sx={{ width: "100%" }}
													size="small"
													options={UserDepartment}
													getOptionLabel={(option) =>
														`${option.departmentName}`
													} // Display departmentName and designation
													onChange={handleDepartmentChange}
													filterSelectedOptions
													renderInput={(params) => (
														<TextField
															{...params}
															variant="outlined"
															placeholder=""
															label="Select Department*"
															value={formikcat?.values?.DepartmentBind}
															error={
																formikcat.touched.DepartmentBind &&
																Boolean(formikcat.errors.DepartmentBind)
															}
															helperText={
																formikcat.touched.DepartmentBind &&
																formikcat.errors.DepartmentBind
															}
														/>
													)}
												/>
												<Autocomplete
													multiple={false}
													id="DesignationBindId"
													name="DesignationBindId"
													className="mb-4 mt-0"
													sx={{ width: "100%" }}
													size="small"
													options={UserDesignation}
													getOptionLabel={(option) => `${option.name}`} // Display departmentName and designation
													onChange={handleDesinationChange}
													filterSelectedOptions
													renderInput={(params) => (
														<TextField
															{...params}
															variant="outlined"
															placeholder=""
															label="Select Designation*"
															value={designationId}
															error={
																formikcat.touched.DesignationBindId &&
																Boolean(formikcat.errors.DesignationBindId)
															}
															helperText={
																formikcat.touched.DesignationBindId &&
																formikcat.errors.DesignationBindId
															}
														/>
													)}
												/>
											</div>
										</>
									) : (
										<></>
									)}
								</FormControl>
							</div>
							<div className="col-8 col-md-4 mt-1">
								<FormControl fullWidth>
									<InputLabel id="DesignationId">
										{" "}
										{eventtype === "NFA" ? "Budget Status " : ""}{" "}
									</InputLabel>
									<Select
										labelId="Designation"
										InputLabelProps={{
											shrink: true,
										}}
										variant="outlined"
										size="small"
										id="budgetstatus"
										name="budgetstatus"
										value={budgetstatus}
										label="Budget Status"
										onChange={(e) => {
											setbudgetstatus(e?.target?.value);
										}}
										hidden={eventtype === "NFA" ? false : true}
									>
										<MenuItem value="NB">Not Budgeted</MenuItem>
										<MenuItem value="WB">Within Budget</MenuItem>
										<MenuItem value="OB">Outside Budget</MenuItem>
									</Select>
								</FormControl>
							</div>

							<div className="col-3 col-md-2 mt-1 text-end">
								<Button
									variant="outlined"
									size="small"
									color="primary"
									className=""
									onClick={handleAddUser}
									// disabled={selectUserOption === "R" ? true : false}
								>
									+ Add
								</Button>
							</div>
						</div>
					</form>
					<div className="">
						<div className="row">
							<div className="col-12 mb-3 d-none d-lg-block">
								<div
									className="row align-items-center p-2 rounded ms-0 me-0 mt-2 bggray"
									// hidden=
								>
									<div className="col-12 col-md-11">
										<div className="ps-2 pe-2">
											<div className="row text-left">
												<div className="col-lg col-md-5 col-12">
													<div className="text-muted f14 lingh14">
														{selectUserOption === "R"
															? "Designation"
															: "User Name"}
													</div>
												</div>
												<div className="col-lg col-md-6 col-6">
													<div className="f14">
														<div className="text-muted f14 lingh14">
															{selectUserOption === "R" ? "" : "Email Id"}
														</div>
													</div>
												</div>
												<div className="col-md col-md-1 col-3">
													<div className="f14">
														<div className="text-muted f14 lingh14">
															Sequence
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="d-flex col-2 col-md-1 align-items-center justify-content-end text-end">
										<div className="f14">
											<div className="text-muted f14 lingh14"></div>
										</div>
									</div>
								</div>
								<form onSubmit={formikcat.handleSubmit} autoComplete="off">
									{/* selectUserrole  0 && */}
									{approverseq.length > 0 &&
										approverseq.map((item, index) => (
											// {records.map((item, index) => (
											<div key={index}>
												{/* {[...Array(3)].map((_, index) => (
                  <div key={item}> */}
												<div className="row align-items-center p-0 pb-1 border-bottom ms-0 me-0 mt-2">
													<div className="col-10 col-md-11">
														<div className="ps-2 pe-2">
															<div className="row text-left">
																<div className="col-lg col-md-5 col-12">
																	<div className="text-muted f14 lingh14">
																		{item?.username}
																	</div>
																</div>
																<div className="col-lg col-md-6 col-12">
																	<div className="f14">
																		<div className="text-muted f14 lingh14">
																			{item?.useremailid}
																			<br />
																		</div>
																	</div>
																</div>
																<div className="col-sm col-sm-1 col-1">
																	<div className="f14">
																		<TextField
																			variant="standard"
																			className="w-30"
																			required
																			//id={item.seqno}
																			id={`seqno-${index}`}
																			name="seqno"
																			value={item.seqno}
																			maxLength={2}
																			size="small"
																			//placeholder="Option Value"
																			onChange={(e) =>
																				handleInputChange(e, index)
																			}
																			onInput={(e) => onlyNumbers(e)}
																		/>
																		{formikcat.errors.seqno &&
																			formikcat.touched.seqno && (
																				<div
																					className="error error-red"
																					style={{ fontSize: "9px" }}
																				>
																					{formikcat.errors.seqno}
																				</div>
																			)}
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div className="d-flex col-2 col-md-1 align-items-center justify-content-end text-end">
														<IconButton
															size="medium"
															className="bg-white"
															onClick={() => handleRemoveClick(index)}
														>
															<HiOutlineX className="f16 text-danger" />
														</IconButton>
													</div>
												</div>
											</div>
										))}
								</form>
							</div>
						</div>
						<div className="col-12 text-end">
							<LoadingButton
								// loading
								variant="outlined"
								type="submit"
								onClick={() => handleSubmitClick()}
								color="primary"
								className="text-capitalize"
								size="small"
							>
								Submit
							</LoadingButton>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};
export default ManageWorkflows;
