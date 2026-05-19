import React, { useCallback, useState, useEffect, useRef } from "react";
import { LoadingButton } from "@mui/lab";
import {Autocomplete,	Box,FormGroup,	Button,	Checkbox,	Drawer,	FormControl,	FormControlLabel,	FormLabel,	IconButton,	Input,	InputLabel,	MenuItem,	Radio,	RadioGroup,	Select,	TextField,	Tooltip, InputAdornment,
} from "@mui/material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HiOutlineTrash, HiOutlineX, HiPlusSm, HiX } from "react-icons/hi";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { Modal } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { actionTypes, useStateValue } from "../../../store";
import {GetNFACondition, OrgGroupMasterList, formatDate, getEventStage,	getPurchaseOrgList,	getMenuMaster,	getCurrency,getUserDepartment,	getUserDesignation, getuserlist,} from "../../../utils/common/utility";
import { useFormik } from "formik";
import * as yup from "yup";
import {getEmailEvent,	AddWFApprover, getOrgGroup, saveWorkflow, updatedworkflow,} from "../../../utils/workflow";
import {getworkflowlist, getPurchaseGrp, getPurchaseOrg, } from "../../../utils/workflow";
import { ToastContainer, toast } from "react-toastify";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import "react-toastify/dist/ReactToastify.css";
import AddNewEmailTemplate from "../ManageEmailTemplate/AddNewEmailTemplate";


import AddEditCell from "../ManageStage/AddEditCell";
import AddCondition1 from "./AddCondition1";
import { GetRulesColumn } from "../../../utils/stagemaster";  
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";

const AddWorkflowCell = ({
	callbackstep,
	editRecordData,
	purchaseAllList,
	setPurchaseAllList,
	purchasegrpList,
	setpurchasegrpList,
}) => {
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [loading, setLoading] = useState(false);
	const [inputOrgGrpList, setinputOrgGrpList] = useState([]);
	const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
	const [purchaseorggrp, setpurchaseorggrp] = useState([]);

	const [eventtype, seteventtype] = useState("");
	const [cond1, setcond1] = useState("");
	const [cond2, setcond2] = useState("");
	const [wfname, setwfname] = useState("");
	const [amountto, setamountto] = useState(0);
	const [amountfrom, setamountfrom] = useState(0);
	const [optiontype, setoptiontype] = useState(false);
	const [approverusertype, setapproverusertype] = useState("");
	const [required, setrequired] = useState(false);
	const [isactive, setisactive] = useState(true);
	const [emailevent, setemailevent] = useState(false);
	const [deviationprc, setdeviationprc] = useState(0);
	const [records, setRecords] = useState([]);

	const [modal, setModal] = useState(false);

	const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
	const [condition1Modal, setCondition1Modal] = useState(false);
	const [condition2Modal, setCondition2Modal] = useState(false);
	const [modalStageOpen, setmodalStageOpen] = useState(false);
	const [purchaseOrgList, setpurchaseOrgList] = useState([]);
	const [emailEventList, setemailEventList] = useState([
		{
			id: 10000,
			emailevent: "Add New",
			emailsubject: "",
			mailto: "",
			mailcc: "",
			mailbcc: null,
			emailbody1: "",
			emailbody2: "",
			emailsig: "",
			mailtype: "E",
			footer: "",
			isactive: true,
			createdon: "2023-09-19T11:27:16.365",
			createdby: 1,
			modifiedby: null,
			totalrecords: 45,
		},
	]);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const CloseModal = () => setModal(false);
	const OpenModal = () => setModal(true);
	const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
	const ClosePurcgaseOrgGrpModal = () => setPurchaseOrgGrpModal(false);
	const CloseCondition1Modal = () => setCondition1Modal(false);
	const CloseCondition2Modal = () => setCondition2Modal(false);
	const closeStageModal = () => setmodalStageOpen(false);

	
	const [selectUserOption, setSelectUserOption] = useState("U");
	const [selectedValue, setSelectedValue] = useState(""); // Initial selected value
	const [userOptions, setUserOptions] = useState([""]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [approverseq, setapproverseq] = useState([]);
	const [UserDepartment, setUserDepartment] = useState([]);
	const [UserDesignation, setUserDesignation] = useState([]);
	const [departmentId, SetDepartmentId] = useState(0);
	const [departmentName, setdepartmentName] = useState("");
	const [selectUserrole, setselectUserrole] = useState(0);
	const [budgetstatus, setbudgetstatus] = useState(""); 
	const [designationId, setdesignationId] = useState(0);
	
	const [inputCriteriaList, setinputCriteriaList] = useState([
		{eventType: "", wfid: 0, tableColumnName: "", characterEntity: "", values:0 },
	]);
  
	const openStageModal = () => {
		setmodalStageOpen(true);
	};

	const openCondition1Modal = () => {
		setCondition1Modal(true);
	};
	const openCondition2Modal = () => {
		setCondition2Modal(true);
	};

	const callbackhidemodal = () => {
		Emaileventfind(eventtype);
		setModal(false);
	};
	// useEffect(() => {
	// 	// ;
	// 	PurchaseOrganisation();
	// 	pullgetCurrency();
	// 	if (editRecordData && editRecordData?.id > 0) {
			
	// 		pullgetrulescolumns(editRecordData?.eventtype);
			
	// 		seteventtype(editRecordData?.eventtype);
	// 		//formik.setFieldValue("id", editRecordData?.id);
	// 		prefilledworkflow();
	// 		//UpdateAddWorkFlowDataList();
	// 	}
	// 	// else {
	// 	//   clearfilledworkflow();
	// 	Emaileventfind(eventtype);
	
	// }, [eventtype]);


useEffect(() => {
    PurchaseOrganisation();
    pullgetCurrency();
    if (editRecordData && editRecordData?.id > 0) {
        pullgetrulescolumns(editRecordData?.eventtype);
        seteventtype(editRecordData?.eventtype);
        prefilledworkflow();
    }
    Emaileventfind(eventtype);
}, [eventtype]);





	useEffect(() => {
		pullMenuMaster();
		userList();
		PullUserDesignation({
			CustomerId: customerid,
		});
	
		PullUserDepartment({ CustomerId: customerid });
		PullNFAConditionAll();
		PullNFACondition2All();
		if (editRecordData?.id > 0) {
			getPurchasegrplist(0);
		}
	}, []);

	//const[emailevent,setemailevent]=useState([]);
	const Emaileventfind = (eventtype) => {
		getEmailEvent(eventtype).then((res) => {
			//;
			//if (res?.length)
			if (res && Array.isArray(res)) {
				// console.log("data", res);

				setemailEventList(res);
				//setemailEventList({id:1000, emailevent:"Add New"})
			} else {
				return;
			}
		});
	};

	const handleAddClick = () => {
		//console.log("post", inputOrgGrpList);
		setinputOrgGrpList([
			...inputOrgGrpList,
			{ id: 0, orgMstId: 0, groupName: "" },
		]);
	};

	//  const handleAddClick = () => {
	//    ;
	//    console.log("post", inputOrgGrpList);
	//    setinputOrgGrpList([
	//      ...inputOrgGrpList,
	//      { purchOrgId: 0, purchasegrpId: [] },
	//    ]);
	//  };

	const handleAssign = (index, selectedValue) => { 
		const listgrp = [...inputOrgGrpList];
		setpurchasegrpList(listgrp);
		const list = listgrp;
		list[index]["orgId"] = selectedValue[0]?.orgMstId;
		list[index]["wfid"] = editRecordData?.id ? editRecordData?.id : 0;
		list[index]["orgGroupId"] = selectedValue[0]?.id;
		list[index]["orgGroupName"] = selectedValue[0]?.groupName;

		setinputOrgGrpList(list);
		
		getPurchasegrplist(selectedValue[0]?.orgMstId);

		console.log("listtttttttttttt ", list);
	};

	// const handleAssign = (event, newValues) => {
	
	//   if (newValues) {
	//     const list = newValues?.map((newValue) => ({
	//       orgId: newValue.orgMstId,
	//       wfid: editRecordData?.id ? editRecordData?.id : 0,
	//       orgGroupId: newValue.id,
	//       orgGroupName: newValue.groupName
	//     }));

	//     setinputOrgGrpList(list);
	//     getPurchasegrplist(newValues[0]?.orgMstId);
	//     // Check if "Add New" option is selected
	//     if (newValues.some((option) => option.id === "new")) {
	//       setPurchaseOrgGrpModal(true); // Open modal for adding new group
	//     }
	//   } else {
	//     console.error("New value is undefined or null.");
	//   }
	// };

	const handleFollowupType = (e, index) => {
		if (e === "new") {
			setPurchaseOrgModal(true);
		} else {
			const list = [...inputOrgGrpList];
			list[index]["purorgid"] = e;
			getPurchasegrplist(e);
			setinputOrgGrpList(list);
		}
	};

	const handleRemoveClick = (index) => {
		//
		const list = [...inputOrgGrpList];
		list.splice(index, 1);
		setinputOrgGrpList(list);
	};

	const callbackremoveitem = useCallback(
		(value) => {
			const list = [...records];
			var index = list.findIndex(function (o) {
				return o.id === value;
			});
			if (index !== -1) {
				list.splice(index, 1);
				setRecords(list);
			}
		},
		[records]
	);

	const [selectedPurchaseGrp, setSelectedPurchaseGrp] = useState([]);

	const getGroupDefault = (arraylist) => {
		console.log("getGroupDefault", arraylist);
		  
		let arrayNew = [];
		if (arraylist) { 
			// array.map((index) => {
			purchasegrpList.map((data) => { 
				arraylist.map((array) => {
					if (data.id == array.orgGroupId) {
						arrayNew.push(data);
					}
				});
			});
			// }
		}
		return arrayNew;
	};

	// const getOrganisationDefault = (array) => {
	//   if (array > 0) {
	//     const defaultOrg = purchaseAllList.find(data => data.id === array);
	//     if (defaultOrg) {
	//       getPurchasegrplist(array);
	//       return [defaultOrg];
	//     }
	//   }
	//   return [];
	// };

	const getOrganisationDefault = (arrayId) => {
		console.log("puchaseeeee", arrayId);
 
		let arrayNew = [];
		if (arrayId > 0) {
			purchaseAllList.map((data) => {
				if (data.id == arrayId) {
					if (data) arrayNew.push(data);
				}
			});
		}

		return arrayNew[0];
	};

	const getPurchOrgGrpDefault = (array) => {
		//;
		let arrayNew = [];
		//console.log("array", array);
		if (array != null && array != "" && array != undefined) {
			//;
			var arraydata = JSON.parse(array);
			arrayNew = arraydata;
			setinputOrgGrpList(arrayNew);
		}
		return arrayNew;
	};

	const onchangePurchaseGrp = (value) => {
		//;
		formik.setFieldValue("purchorggroup[0].purgrpid", parseInt(value[0]?.id));
		setSelectedPurchaseGrp(value);
	};
	//const [purchasegrpList, setpurchasegrpList] = useState([]);
	const getPurchasegrplist = (OrgMstId) => {
		var data = {
			CustomerId: customerid,
		}
		if(OrgMstId>0)
		{
			data = {
				OrgMstId: OrgMstId,
				CustomerId: customerid,
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

	const pullgetOrggrp = (wfid) => {
		getOrgGroup(wfid, atoken).then((res) => {
			if (res?.length > 0) {
				let orgGroup = JSON.parse(res[0]?.orgGroup);
				console.log("getOrgGroup ", orgGroup);
				setinputOrgGrpList(orgGroup);

				let purchorggroups = [];
				// Iterate over the purchorggroup array
				res.forEach((group) => {
					let orgGrouparray = JSON.parse(group.orgGroup);
					//  purchorggroups.push(orgGrouparray);
					orgGrouparray.forEach((subgroup) => {
						purchorggroups.push({
							wfid: wfid, // Assuming Data.id is the correct property
							orgId: subgroup.orgId,
							orgGroupName: subgroup.orgGroupName,
							orgGroupId: subgroup.orgGroupId,
						});
					});
				});
				setinputOrgGrpList(purchorggroups);
			}
		});
	};

	// const [eventtype, setEventType] = useState("");
	const [stageId, setStageId] = useState("");
	const [eventstageList, setEventstageList] = useState([]);
	const pullgetEventStage = (EventTypeId) => {
		var data = {
			EventType: EventTypeId,
			IsActive: true,
			CustomerId: customerid,
		};
		// console.log(data);
		getEventStage(data, atoken).then((res) => {
			setEventstageList(res);
		});
	};

	const onchangeEventType = (event, newValue) => {
		// if (newValue) {
		seteventtype(event.target.value);

		// if (newValue.id === "new") {
		//   setPurchaseOrgModal(true);
		// }
		// else{
		//  console.log("newValue:", newValue);
		pullgetEventStage(event.target.value);
		formik?.setFieldValue("eventtype", event.target.value); 
		pullgetrulescolumns(event.target.value); 

		// }
		//  }
	};
	const [RulesList, setRulesList] = useState([]);
	const [SelectedRules, setSelectedRules] = useState([]);
	const pullgetrulescolumns = (EventType) => {
		
		var data = {
			EventType: EventType,
		};
		GetRulesColumn(data, atoken).then((res) => {
			
			setRulesList(res);
		});
	};
	// To Purchase org list

	//const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [orgMstId, setorgMstId] = useState();
	const PurchaseOrganisation = () => {
		var data = {
			CustomerId: customerid,
		};
		getPurchaseOrgList(data, atoken).then((resp) => {
			console.log("resp purchaseeeeee", resp);
			setPurchaseAllList(resp);
		});
	};

	const onchangePurchOrg = (event, newValue) => {
		if (newValue) {
			setorgMstId(newValue.id);

			if (newValue.id === "new") {
				setPurchaseOrgModal(true);
			} else {
				//  console.log("newValue:", newValue);
				getPurchasegrplist(newValue.id);
			}
		}
	};

	const getEmailEventDefault = (array) => {
		let arrayNew = [];
		//console.log("array", array);
		if (array != null && array != "") {
			var arraydata = JSON.parse(array);
			arrayNew = arraydata;
			setSelectedEmail(arrayNew);
		}
		//console.log(arrayNew);
		//setpurchaseorggrp(arrayNew);
		return arrayNew;
	};

	const [currencyList, setCurrencyList] = useState([]);
	const [currencyType, setCurrencyType] = useState("INR");
	const pullgetCurrency = (EventTypeId) => {
		var data = {
			isActive: true,
		};

		getCurrency(data, cookies).then((res) => {
			//console.log(res);
			setCurrencyList(res);
		});
	};

	const inputDate = new Date(); // Replace with your date input
	let formattedDate = formatDate(inputDate);

	const [selectedEmail, setSelectedEmail] = useState([]);
	//const [selectedpur, setselectedpur] = useState([]);
	const onchangeEmailEvent = (e, value) => {
		var dataadded = {
			id: 0,
			wfid: 0,
			emaileventid: value[0]?.id,
		};
		setSelectedEmail([dataadded]);
	};

	const formRef = useRef(null);

	const validationSchema = yup.object({
		//console.log(yup)
		wfname: yup
			.string("Please Select an Event")
			.required("Please fill Workflow"),
		eventtype: yup
			.string("Please Select an Event")
			.required("Event type is required"),
		stageId: yup.string("Please Select an Event").required("Stage is required"),
	});

	//new format
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id ? `${editRecordData?.id}` : 0,
			customerid: 1,

			// ... other fields

			// Ensure that stageName is pre-filled based on stageId
			//stageName: eventstageList?.find(option => option.id === editRecordData?.setStageId)?.stageName || '',

			wfname: editRecordData?.wfname ? `${editRecordData?.wfname}` : wfname,
			approverusertype: approverusertype,
			eventtype: editRecordData?.eventtype
				? editRecordData?.eventtype
				: eventtype,
			amountfrom: editRecordData?.amountfrom
				? editRecordData?.amountfrom
				: amountfrom,
			amountto: editRecordData?.amountto ? editRecordData?.amountto : amountto,

			deviationprc: 0,
			cond1: editRecordData?.cond1 ? editRecordData?.cond1 : cond1,
			cond2: editRecordData?.cond2 ? editRecordData?.cond2 : cond2,
			stageId: editRecordData?.stageId ? editRecordData.stageId : stageId,
			//currency: currency,
			currencyType: editRecordData?.currencyType
				? editRecordData?.currencyType
				: currencyType,
			wfoverride: true,

			required: editRecordData?.required ? editRecordData?.required : false,
			isactive: editRecordData?.isactive ? editRecordData?.isactive : isactive,
			createdby: 1,
			modifiedby: 1,
			emailevent: selectedEmail,
			budgetstatus: "string",
			purchOrgId: 0,
			// purchorggroup: inputOrgGrpList,
			purchorggroup: inputOrgGrpList,
			wfapproverusers: approverseq,
			workFlowRules:inputCriteriaList,
		},

		validationSchema: validationSchema,
		onSubmit: (values) => {
			
			let formattedDate = "";
			
			if (values?.createdon) {
				formattedDate = formatDate(values?.createdon);
			} else {
				let getdate = new Date();
				formattedDate = formatDate(getdate.toLocaleDateString() + "");
			}
			
			if (values?.workFlowRules && Array.isArray(values?.workFlowRules) && values?.workFlowRules.length > 0) {
				
				for (let rule of values?.workFlowRules) {
					
					if ((rule.tableColumnName && !rule.characterEntity && !rule.values) ||
						(!rule.tableColumnName && rule.characterEntity && !rule.values) ||
						(!rule.tableColumnName && !rule.characterEntity && rule.values)) {
						toast.info("Please fill all fields in the rule criteria.", { autoClose: 1000 });
						return;
					}
				}
			}

			if (!values?.wfapproverusers.length) { 
				toast.info("Please select users or designation for workflow.", { autoClose: 1000 });
				return;
			}
			var data = {
				id: editRecordData?.id ? `${editRecordData?.id}` : 0,
				//customerid: 1,
				wfname: wfname,
				stageId: stageId,
				eventtype: eventtype,
				required: required,
				isactive: isactive,
				userid: 0,
				deviationprc: deviationprc,
				currencyType: currencyType || "INR",
				amountto: amountto,
				amountfrom: amountfrom,
				createdon: formattedDate,
				cond1: cond1?.toString(),
				cond2: cond2?.toString(),
				createdbyId: 1,
				modifiedby: 1,
				purchOrgId: 0,
				approverusertype: approverusertype, 
				purchorggroup: inputOrgGrpList, //[0],
				wfapproverusers: approverseq,
			    workFlowRules:inputCriteriaList,
				emailevent: [],
			};

			console.log("data", data);
			setLoading(true);
			if (editRecordData?.id > 0) {
				updatedworkflow(data, editRecordData?.id, atoken).then((res) => {
					console.log("update::", data);
					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilledworkflow();
					callbackstep("update");
					toast.success("Data updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});

					return true;
				});
			} else {
				saveWorkflow(data, atoken).then((res) => {
					//console.log("data::", data);

					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearfilledworkflow();
					toast.success("Data added successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
					callbackstep("add");

					return true;
				});
			}
		}, // Make sure the onSubmit function is properly closed.
	});
	const prefilledworkflow = () => {
		
		console.log("editRecordData ",editRecordData);

		pullgetrulescolumns(editRecordData?.eventtype);

		setinputCriteriaList(editRecordData?.workFlowRules)	
		setapproverseq(editRecordData?.wfapproverusers)	

		formik.setFieldValue("id", editRecordData?.id);
		setwfname(editRecordData?.wfname);
		seteventtype(editRecordData?.eventtype);
		setapproverusertype(editRecordData.approverusertype);
		setcond1(editRecordData?.cond1);
		setcond2(editRecordData?.cond2);
		setStageId(editRecordData?.stageId);
		setdeviationprc(editRecordData?.deviationprc);
		setisactive(editRecordData?.isactive);
		setCurrencyType(editRecordData?.currencyType);
		setrequired(editRecordData?.required);
		setamountfrom(editRecordData?.amountfrom);
		setamountto(editRecordData?.amountto);
		pullgetEventStage(editRecordData?.eventtype); 
		setinputOrgGrpList(editRecordData?.purchorggroup);
		
		setinputCriteriaList(editRecordData?.workFlowRules)	
 
		// const userOrgGroupValue = editRecordData?.purchorggroup
		// ? (editRecordData?.purchorggroup)
		// : [];

		// setinputOrgGrpList(userOrgGroupValue);

		//pullgetOrggrp(editRecordData?.id);

		formik.setValues({
			...formik.values,
			stageName:
				eventstageList?.find((option) => option.id === editRecordData?.stageId)
					?.stageName || "",
		});

		formik.setValues({
			...formik.values,
			currencyType:
				currencyList?.find(
					(option) => option.currencyType === editRecordData?.currencyType
				)?.currencyType || "",
		});

		// if (editRecordData?.purchaseorggrp != "") {
		//   getPurchOrgGrpDefault(editRecordData?.purchaseorggrp);
		// }

		// if (editRecordData?.emailevent != "") {
		//   getEmailEventDefault(editRecordData?.emailevent);
		// }
	};

	

	const clearfilledworkflow = () => {
		formik.setFieldValue("id", 0);
		setwfname("");
		seteventtype("");
		setcond1("");
		setcond2("");
		setCurrencyType("");
		setdeviationprc(0);
		setStageId("");
		setisactive(false);
		setinputOrgGrpList([]);
		setrequired(false);
		setamountfrom("");
		setamountto("");
		setemailevent("");
	};
	const onlyNumbers = (e) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
	};

	const [nfaCondtion1List, setNfaCondition1List] = useState([]);
	const PullNFAConditionAll = () => {
		var data = {
			// customerId: 1,
			// conditionName: "",
			// conditionSr: "",
			// isActive: true,
			// pagenumber: 0,
		};
		GetNFACondition(data, atoken).then((res) => {
			setNfaCondition1List(res);
		});
	};

	//second Condition
	const [nfaCondtion2List, setNfaCondition2List] = useState([]);
	const PullNFACondition2All = () => {
		var data = {
			customerId: 1,
			conditionName: "",
			conditionSr: "",
			isActive: true,
			pagenumber: 0,
		};
		GetNFACondition(data, cookies).then((res) => {
			setNfaCondition2List(res);
		});
	};

	const [MenuMasterList, setMenuMasterList] = useState([]);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			setMenuMasterList(res);
		});
	};
	const handleStageChange = (e) => {
		const value = e.target.value;

		if (value === "new") {
			openStageModal();
		} else {
			setStageId(value);
		}
	};
	// #ui

	const [expanded, setExpanded] = useState(false);
	const handleChangeAccordion = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};
	const handleAddRow = (index) => {
       
		console.log(inputCriteriaList);

		const newRow = {
			
			eventType: "", 
			wfid: editRecordData[0]?.id || 0,
			tableColumnName: "",
			characterEntity: "",
            values: 0,
		};

		// Add the new row to inputCriteriaList state
        
		setinputCriteriaList([...inputCriteriaList, newRow]);
 
	};

	
	//for get rules Columns
	

// 	const gettablecolumnDefault = (columNAME) => {
		
// 	if (columNAME!="") {
// 	  const selectedcolumn = RulesList.find(data => data.columN_NAME === columNAME);
// 	  return selectedcolumn || null;
// 	}
// 	return null;
//   };

  const gettablecolumnDefault = (columNAME) => {
	
    console.log("columNAME: ", columNAME);
    if (columNAME) {
        const selectedColumn = RulesList.find(data => {
            console.log("Data columN_NAME: ", data.columN_NAME);
            return data.columN_NAME === columNAME;
        });
        return selectedColumn || null;
    }
    return null;
};


	const handleRulesChange = (index, value) => {
		
		setSelectedRules(value ? value.columN_NAME : "");
	
		const list = [...inputCriteriaList];
		if (value && value.columN_NAME) {
			list[index]["tableColumnName"] = value.columN_NAME;
		}
	
		setinputCriteriaList(list);
	};

	
	


	  const handlecharacterChange = (index, event) => {
      
        const list = [...inputCriteriaList];
       // list[index]["characterEntity"] = event.target.value;
        list[index]["characterEntity"] = String(event.target.value); // Convert to string
        setSelectedValue(event.target.value);
        setinputCriteriaList(list);

    };

	// const handleRuleValueChange = (index, event) => {
     
    //     const list = [...inputCriteriaList];
    //     list[index]["values"] = event.target.value;
    //     setinputCriteriaList(list);
    // };

	const handleRuleValueChange = (index, event) => {
		const inputValue = event.target.value;
		const regex = /^\d*\.?\d*$/;
	
		if (regex.test(inputValue) || inputValue === "") {
			const list = [...inputCriteriaList];
			list[index]["values"] = inputValue;
			setinputCriteriaList(list);
		}
	};

	const handleValueRemove = (indexToRemove) => {
 
        const updatedCriteriaList = inputCriteriaList.filter((item, index) => index !== indexToRemove);
        
      
        setinputCriteriaList(updatedCriteriaList);
    };
	 

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
	const handleUserChange = (event, value) => {
		//
		setSelectedUsers(value);
	};
	const formikcat = useFormik({
		enableReinitialize: true,
		initialValues: {
			//custoemerid: itemin.custoemerid,
			token: atoken,
			// id:0,
			wfid: editRecordData?.id || 0,
			type: '',
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
				wfid: editRecordData?.id || 0,
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
				SetDepartmentId(0);
				setdepartmentName("");
				setselectUserrole(0);
				setModal(false);
				//pullWorkFlowDataList();
				return true;
			});
		},
	});

	
	const handleAddUser = () => {
		console.log(approverseq);
	
		if (selectUserOption === "R" || selectUserOption === "U") {
			if (selectedUsers?.id > 0) {
				const isFound = approverseq.some((element) => {
					return element.designationId === selectedUsers.id || element.userid === selectedUsers.id;
				});
	
				if (isFound) {
					toast.error('The user has been added already', {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
					});
				} else {
					let maxSeqNo = 0;
					// Find the maximum sequence number
					approverseq.forEach((element) => {
						if (element.seqno > maxSeqNo) {
							maxSeqNo = element.seqno;
						}
					});
					// If there are existing items, increment the sequence number by 1
					const newSeqNo = maxSeqNo > 0 ? maxSeqNo + 1 : 1;
	
					const newUser = selectUserOption === "R" ? {
						wfid: editRecordData?.id || 0,
						customerId: customerid,
						departmentId: departmentId,
						username: selectedUsers?.name,
						designationId: selectedUsers?.id,
						department: departmentName,
						useremailid: "",
						seqno: newSeqNo, // Assign the new sequence number
						budgetstatus: budgetstatus,
					} : {
						wfid: editRecordData?.id || 0,
						userid: selectedUsers.id,
						username: selectedUsers.name,
						useremailid: selectedUsers.email,
						seqno: newSeqNo, // Assign the new sequence number
						budgetstatus: budgetstatus,
					};
	
					setapproverseq((approverseq) => [...approverseq, newUser]);
				}
			}
		}
	}; 
       
	// 	console.log(approverseq);
	// 	if (selectUserOption == "R") {
	// 		const isFound = approverseq.some((element) => {
	// 			return element.id === selectedUsers.id;
	// 		});

	// 		if (isFound) {
				
	// 			toast.error('User is already added.', { position: toast.POSITION.TOP_CENTER });
	// 		} else {
	// 			setapproverseq((approverseq) => [
	// 				...approverseq,
	// 				{
	// 					wfid: editRecordData?.id || 0,
	// 					customerId:customerid,
	// 					departmentId: departmentId,
	// 					username: selectedUsers?.name,
	// 					designationId: selectedUsers?.id,
	// 					department: departmentName,
	// 					useremailid: "",
	// 					seqno: 0,
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
	// 						wfid: editRecordData?.id,
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
	// const handleAddUser = () => {
	// 	console.log(approverseq);
	
	// 	if (selectUserOption === "R" || selectUserOption === "U") {
	// 		if (selectedUsers?.id > 0) {
	// 			const isFound = approverseq.some((element) => {
	// 				return element.designationId === selectedUsers.id || element.userid === selectedUsers.id;
	// 			});
	
	// 			if (isFound) {
	// 				toast.error('The user has been added already', { position: toast.POSITION.TOP_CENTER,
	// 					autoClose: 1000, });
	// 			} else {
	// 				const newUser = selectUserOption === "R" ? {
	// 					wfid: editRecordData?.id || 0,
	// 					customerId: customerid,
	// 					departmentId: departmentId,
	// 					username: selectedUsers?.name,
	// 					designationId: selectedUsers?.id,
	// 					department: departmentName,
	// 					useremailid: "",
	// 					seqno: 0,
	// 					budgetstatus: budgetstatus,
	// 				} : {
	// 					wfid: editRecordData?.id || 0,
	// 					userid: selectedUsers.id,
	// 					username: selectedUsers.name,
	// 					useremailid: selectedUsers.email,
	// 					budgetstatus: budgetstatus,
	// 				};
	
	// 				setapproverseq((approverseq) => [...approverseq, newUser]);
	// 			}
	// 		}
	// 	}
	// };
	//For Department
	const PullUserDepartment = (dataRequest) => {
		getUserDepartment(dataRequest, atoken).then((res) => {
			setUserDepartment(res);
		});
	};
	const handleDepartmentChange = (event, value) => {
		SetDepartmentId(value?.id);
		setdepartmentName(value?.departmentName);
		PullUserDesignation(value?.id);
	};
	//For Designation
	const PullUserDesignation = (departmentId) => {
		var dataRequest ={
			CustomerId: customerid,
			DepartmentId:departmentId
		}
		getUserDesignation(dataRequest, atoken).then((res) => {
			setUserDesignation(res);
		});
	};
	const handleDesinationChange = (event, value) => {
		console.log(value);
		setSelectedUsers(value);
	};
	
	
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
		const handleApproverRemoveClick = (index) => {
			const list = [...approverseq];
			list.splice(index, 1);
			setapproverseq(list);
		};
	 
	return (
		<>
			<form ref={formRef} onSubmit={formik.handleSubmit} autoComplete="off">
				<div className="row">
					<div className="col-12 col-md-12 mb-3 ">
						<FormControl fullWidth>
							<TextField
								id="wfname"
								name="wfname"
								label="Workflow Title *"
								placeholder=""
								variant="outlined"
								size="small"
								value={wfname}
								//maxLength={100}
								onChange={(e) => {
									setwfname(e?.target?.value);
								}}
								//required
								inputProps={{ maxLength: 100 }}
								InputProps={{
								  endAdornment: (
									<InputAdornment  position="end">
									  <Typography variant="body2" color="textSecondary">
										{wfname.length}/100
									  </Typography>
									</InputAdornment>
								  ),
								}}
							/>
						</FormControl>
					
					</div>

					<div className="col-12 col-md-6 mb-3">
						
						<FormControl fullWidth>
							<InputLabel id="eventtype">Select Event Type*</InputLabel>
							<Select
								labelId="event"
								InputLabelProps={{
									shrink: true,
								}}
								variant="outlined"
								size="small"
								id="eventtype"
								name="eventtype"
								value={eventtype}
								label="Select Event"
								onChange={(event, newvalue) => {
									onchangeEventType(event, newvalue);
								}}
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
							{formik.errors.eventtype && formik.touched.eventtype && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik.errors.eventtype}
								</div>
							)}
						</FormControl>
					</div>

					<div className="col-12 col-md-6 mb-3">
						<FormControl fullWidth>
							<InputLabel id="stageId">Select Stage *</InputLabel>
							<Select
								labelId="event"
								InputLabelProps={{
									shrink: true,
								}}
								variant="outlined"
								size="small"
								id="stageId"
								name="stageId"
								value={stageId}
								label="Select Stage 1"
								onChange={handleStageChange}
								error={formik.touched.stageId && Boolean(formik.errors.stageId)}
								helperText={formik.touched.stageId && formik.errors.stageId}
							>
								{eventstageList?.map((option, i) => (
									<MenuItem key={i} value={option?.id}>
										{option?.stageName}
									</MenuItem>
								))}

								{eventtype && (
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
								)}
							</Select>
							{formik.errors.stageId && formik.touched.stageId && (
								<div className="error error-red" style={{ fontSize: "9px" }}>
									{formik.errors.stageId}
								</div>
							)}
						</FormControl>
					</div>

					<div className="col-12">
									<Accordion
										expanded={expanded === "panel1"}
										onChange={handleChangeAccordion("panel1")}
									>
										<AccordionSummary
											expandIcon={<ExpandMoreIcon />}
											aria-controls="panel1bh-content"
											id="panel1bh-header"
										>
											<Typography sx={{ width: "33%", flexShrink: 0 }}>
												1. Rule Criteria
											</Typography>
											<Typography
												sx={{ color: "text.secondary", fontSize: "12px" }}
											>
												Please configure the criteria
											</Typography>
										</AccordionSummary>
										<AccordionDetails>
											{inputCriteriaList?.map((item, index) => (
												<div className="row">
													<div className="d-flex">
														<div className="flex-grow-1">
															<div className="row">
																 
																<div className="col-12 col-md-3">
																<Autocomplete
																	multiple={false}
																	id="roleType"
																	name="roleType"
																	className="w-100 mb-3"
																	sx={{ width: "100%" }}
																	size="small"
																	options={RulesList}
																	getOptionLabel={(option) => `${option.columN_NAME}`}
																	onChange={(event, newvalue) => {
																	handleRulesChange(index, newvalue);
																	}}
																	defaultValue={gettablecolumnDefault(item?.tableColumnName)}
																	//defaultValue={RulesList.find(option => option.columN_NAME === editRecordData?.tableColumnName) || null}
																	filterSelectedOptions
																	renderInput={(params) => (
																	<TextField
																		{...params}
																		variant="outlined"
																		placeholder=""
																	
																	/>
																	)}
																/> 
																</div>
																<div className="col-12 col-md-3">
																	<TextField
																		id="roleMehtod"
																		select
																		className="w-100 mb-3"
																		size="small"
																		label=""
																		value={item?.characterEntity}
																		onChange={(e) =>
																			handlecharacterChange(index, e)
																		}
																	>
																		<MenuItem value={"0"}>=</MenuItem>
																		<MenuItem value={"1"}>!=</MenuItem>
																		<MenuItem value={"2"}>&lt;</MenuItem>
																		<MenuItem value={"3"}>&lt;=</MenuItem>
																		<MenuItem value={"4"}>&gt;</MenuItem>
																		<MenuItem value={"5"}>&gt;=</MenuItem>
																	</TextField>
																</div>
																<div className="col-12 col-md-6">
																	<TextField
																		id="roleValue"
																		name="roleValue"
																		label=""
																		placeholder=""
																		variant="outlined"
																		size="small"
																		className="w-100 mb-3"
                                                                        value={item?.values}
																		onChange={(e) =>
																			handleRuleValueChange(index, e)
																		}
																		inputProps={{
																			style: { fontSize: "14px" }, // Additional styling
																		}}
																		InputLabelProps={{
																			shrink: true,
																		}}
																	/>
																</div>
															</div>
														</div>
														{/* <IconButton
															size="small"
															edge="start"
															onClick={() => handleValueRemove(index)}
														>
															<HiOutlineX className="f20 text-danger" />
														</IconButton> */}

                                                        <IconButton
																				size="medium"
                                                                                
																				className="bg-white"
																				onClick={() => handleValueRemove(index)}
																			>
																				<HiOutlineX className="f16 text-danger" />
																			</IconButton>


                                                                            
													</div>
												</div>
											))}

											<div className="row">
												<div className="d-flex justify-content-end">
													{/* <IconButton size="small"  variant="outlined" onClick={() => handleAddRow()}>
            <HiOutlinePlusSm className='f20 text-primary' />
        </IconButton> */}

													<Button
														variant="outlined"
														size="medium"
														color="primary"
														className="m-1"
														onClick={() => handleAddRow()}
													>
														+ Add
													</Button>
												</div>
											</div>
										</AccordionDetails>
									</Accordion>
									<Accordion
										expanded={expanded === "panel2"}
										onChange={handleChangeAccordion("panel2")}
									>
										<AccordionSummary
											expandIcon={<ExpandMoreIcon />}
											aria-controls="panel2bh-content"
											id="panel2bh-header"
										>
											<Typography sx={{ width: "33%", flexShrink: 0 }}>
												2. Who should approve
											</Typography>
											<Typography
												sx={{ color: "text.secondary", fontSize: "12px" }}
											>
												Choose the approver and set the order in which their
												approval is given.
											</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<div className="row">
												<div className="col-12">
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
																		// error={
																		//     formikcat.touched.userOptions &&
																		//     Boolean(formikcat.errors.userOptions)
																		// }
																		// helperText={
																		//     formikcat.touched.userOptions &&
																		//     formikcat.errors.userOptions
																		// }
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
																		}
																		onChange={handleDepartmentChange}
																		filterSelectedOptions
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				placeholder=""
																				label="Select Department*"
																				value={
																					formikcat?.values?.DepartmentBind
																				}
																				// error={
																				//     formikcat.touched.DepartmentBind &&
																				//     Boolean(formikcat.errors.DepartmentBind)
																				// }
																				// helperText={
																				//     formikcat.touched.DepartmentBind &&
																				//     formikcat.errors.DepartmentBind
																				// }
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
																		getOptionLabel={(option) =>
																			`${option.name}`
																		}
																		onChange={handleDesinationChange}
																		filterSelectedOptions
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				placeholder=""
																				label="Select Designation*"
																				value={designationId}
																				// error={
																				//     formikcat.touched.DesignationBindId &&
																				//     Boolean(formikcat.errors.DesignationBindId)
																				// }
																				// helperText={
																				//     formikcat.touched.DesignationBindId &&
																				//     formikcat.errors.DesignationBindId
																				// }
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
												<div className="col-8 col-md-4 mt-2">
													{selectUserOption == "R" ? (
														<>
															<FormControl fullWidth>
																<InputLabel id="DesignationId">
																	{" "}
																	{/* {eventtype === "NFA" ? "Budget Status " : ""}{" "} */}
																</InputLabel>
																{/* <Select
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
																	// hidden={eventtype === "NFA" ? false : true}
																>
																	<MenuItem value="NB">Not Budgeted</MenuItem>
																	<MenuItem value="WB">Within Budget</MenuItem>
																	<MenuItem value="OB">Outside Budget</MenuItem>
																</Select> */}
															</FormControl>
														</>
													) : (
														<></>
													)}
												</div>
												<div className="col-3 col-md-2 mt-1 text-end">
													<Button
														variant="outlined"
														size="medium"
														color="primary"
														className="m-1"
														onClick={handleAddUser}
													>
														+ Add
													</Button>
												</div>
											</div>
											<div className="row">
												<div className="col-12 mb-3 d-none d-lg-block">
													<div
														className="row align-items-center p-2 rounded ms-0 me-0 mt-2 bggray"
														
													>
														<div className="col-12 col-md-11">
															<div className="ps-2 pe-2">
																<div className="row text-left">
																	<div className="col-lg col-md-5 col-12">
																		<div className="text-muted f14 lingh14">
																			{selectUserOption === "R"
																				? "Department/Designation"
																				: "User Name"}
																		</div>
																	</div>
																	<div className="col-lg col-md-6 col-6">
																		<div className="f14">
																			<div className="text-muted f14 lingh14">
																				{selectUserOption === "R"
																					? ""
																					: "Email Id"}
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
													<form
														onSubmit={formikcat.handleSubmit}
														autoComplete="off"
													>
														{approverseq?.length > 0 &&
															approverseq?.map((item, index) => (
																<div key={index}>
																	<div className="row align-items-center p-0 pb-1 border-bottom ms-0 me-0 mt-2">
																		<div className="col-10 col-md-11">
																			<div className="ps-2 pe-2">
																				<div className="row text-left">
																					<div className="col-lg col-md-5 col-12">
																						<div className="text-muted f14 lingh14">
																							{item?.department
																								? `${item?.department}-`
																								: ""}{" "}
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
																								 id={`seqno-${index}`}
																								name="seqno"
																								 value={item.seqno}
																								maxLength={2}
																								size="small"
																								 onChange={(e) =>
																								    handleInputChange(e, index)
																								 }
																								 onInput={(e) => onlyNumbers(e)}
																							/>
																						</div>
																					</div>
																				</div>
																			</div>
																		</div>
																		<div className="d-flex col-2 col-md-1 align-items-center justify-content-end text-end">
																			<IconButton
																				size="medium"
																				className="bg-white"
																				onClick={() => handleApproverRemoveClick(index)}
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
										</AccordionDetails>
									</Accordion>
								</div>
								
					{/* <div className="col-12 col-md-6 mb-3 ">
						<FormControl fullWidth>
							<TextField
								id="amountfrom"
								name="amountfrom"
								label="Amount From"
								variant="outlined"
								size="small"
								placeholder=""
								value={amountfrom}
								onChange={(e) => {
									setamountfrom(
										e?.target?.value ? parseInt(e.target.value) : ""
									);
								}}
							/>
						</FormControl>
					</div> */}
					{/* <div className="col-12 col-md-6 mb-3 ">
						<FormControl fullWidth>
							<TextField
								id="amountto"
								name="amountto"
								label="Amount To"
								variant="outlined"
								size="small"
								placeholder=""
								value={amountto}
								onChange={(e) => {
									//;
									setamountto(e?.target?.value ? parseInt(e.target.value) : "");
								}}
								required={amountfrom > 0 ? true : false}
							/>
						</FormControl>
					</div> */}

					{/* <div className="col-12 col-md-6 mb-3 ">
						<FormControl fullWidth>
							<TextField
								id="deviationprc"
								name="deviationprc"
								label="Deviation(%)"
								variant="outlined"
								size="small"
								placeholder=""
								type="text"
								maxLength={3}
								inputProps={{ maxLength: 10 }}
								onInput={(e) => onlyNumbers(e)}
								value={deviationprc}
								//onChange={formik.handleChange}
								onChange={(e) => {
									//;
									setdeviationprc(e?.target?.value);
								}}
								error={
									formik.touched.deviationprc &&
									Boolean(formik.errors.deviationprc)
								}
								helperText={
									formik.touched.deviationprc && formik.errors.deviationprc
								}
							/>
						</FormControl>
					</div> */}

					{/* <div className="col-12 col-md-6 mb-3">
						<FormControl fullWidth>
							<InputLabel id="currencyType">Select Currency </InputLabel>
							<Select
								labelId="currencyType"
								InputLabelProps={{
									shrink: true,
								}}
								variant="outlined"
								size="small"
								id="currencyType"
								name="currencyType"
								value={currencyType}
								label="Select Currency"
								onChange={(e) => {
									setCurrencyType(e?.target?.value);
								}}
								error={
									formik.touched.currencyType &&
									Boolean(formik.errors.currencyType)
								}
								helperText={
									formik.touched.currencyType && formik.errors.currencyType
								}
							>
								{currencyList?.map((option, i) => (
									<MenuItem key={i} value={option?.currencyNm}>
										{option?.currencyNm}
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
						</FormControl>
					</div> */}

				


					<div style={{ background: "#FFFFFF" }} className="pt-2 pb-2">
						{/*dataticketCreate?.custdata?.userId > 0 ? <></>:<> */}
						<div className="d-flex justify-content-between">
							<div className="flex-grow-1" style={{ fontWeight: "bold" }}>
								Organization & Purchase Group
							</div>
							<div className="">
								<Button
									variant="outlined"
									// disabled={x.assignedTo}
									size="small"
									color="primary"
									className=""
									onClick={handleAddClick}
								>
									+ Add Org
								</Button>
							</div>
						</div>
						{/*</>}*/}
						{/* {inputOrgGrpList?.map((x, i) => { 
           return (
            <div className="d-flex  align-items-center mb-3" key={i}> 
            <div className="d-flex  align-items-center mb-3">
              <div className="flex-grow-1">
                <div className="row">
                  <div className="col-lg-12">
                    <Autocomplete
                      id="purorgid"
                      required
                      className="mt-3 mb-6 f14"
                      sx={{ width: "100%" }}
                      options={[
                        ...purchaseAllList,
                        { id: "new", orgName: "Add New" },
                      ]}
                   
                      onChange={(event, newvalue) => {
                        onchangePurchOrg(event, newvalue);
                      }}
                      getOptionLabel={(option) => option.orgName}
                  
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          style={
                            option.id === "new"
                              ? {
                                  fontStyle: "italic",
                                  color: "blue",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }
                              : {}
                          }
                        >
                          {option.orgName}
                        </Box>
                      )}
                      renderInput={(params, data) => (
                        <TextField
                          {...params}
                          required
                          variant="outlined"
                          size="small"
                          placeholder=""
                          label="Purchase Organization"
                        />
                      )}
                    />
                  </div>
                  <div className="col-lg-12">
                   
                      <Autocomplete
                        key={i}
                        multiple
                        id="purgrpid"
                        className="mt-3 mb-6 f14"
                        sx={{ width: "100%" }}
                        options={[
                          ...purchasegrpList,
                          { id: "new", groupName: "Add New" },
                        ]}
                        defaultValue={getGroupDefault(x.groupName)}
                       
                        getOptionLabel={(option) => option.groupName}
                        onChange={(e, newValue) => {
                          const selectedOption = newValue[newValue.length - 1];
                          if (selectedOption && selectedOption.id === "new") {
                            setPurchaseOrgGrpModal(true);
                          } else {
                            handleAssign(i,
                              newValue 
                            );
                          }
                        }}
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            {...props}
                            style={
                              option.id === "new"
                                ? {
                                    fontStyle: "italic",
                                    color: "blue",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }
                                : {}
                            }
                          >
                            {option.groupName}
                          </Box>
                        )}
                        renderInput={(params, data) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            placeholder=""
                            label="Purchase Group"
                          />
                        )}
                      />
                   
                  </div>
                  
                  </div>
              </div>
           
            <div className="d-flex">
                    <Button
                      color="error"
                      size="small"
                      className="mt-3 ms-2"
                      onClick={() => handleRemoveClick(i)}
                    >
                      <HiOutlineX className="f16 text-danger" />
                    </Button>
                  </div>
            </div> 
               </div> 
          );
        }
          )} */}
						{inputOrgGrpList?.map((x, i) => (
							<div className="d-flex align-items-center mb-3" key={i}>
								<div className="flex-grow-1">
									<Autocomplete
										id="purorgid"
										required
										className="mt-3 mb-6 f10"
										// sx={{ width: "100%" }}
										sx={{ width: "100%", marginRight: "20px" }}
										options={[
											...purchaseAllList,
											{ id: "new", orgName: "Add New" },
										]}
										onChange={(event, newvalue) => {
											onchangePurchOrg(event, newvalue);
										}}
										defaultValue={getOrganisationDefault(x?.orgId)}
										getOptionLabel={(option) => option.orgName}
										renderOption={(props, option) => (
											<Box
												component="li"
												{...props}
												style={
													option.id === "new"
														? {
																fontStyle: "italic",
																color: "blue",
																cursor: "pointer",
																textDecoration: "underline",
														  }
														: {}
												}
											>
												{option.orgName}
											</Box>
										)}
										renderInput={(params, data) => (
											<TextField
												{...params}
												required
												variant="outlined"
												size="small"
												placeholder=""
												label="Purchase Organization"
											/>
										)}
									/>
								</div>

								<div className="flex-grow-1">
									<Autocomplete
										key={i}
										multiple
										id="purgrpid"
										sx={{ width: "100%", marginLeft: "25px" }}
										className="mt-3 mb-6 f14"
										// sx={{ width: "100%" }}
										options={[
											...purchasegrpList,
											{ id: "new", groupName: "Add New" },
										]}
										defaultValue={getGroupDefault([x])}
										getOptionLabel={(option) => option.groupName}
										onChange={(e, newValue) => {
											const selectedOption = newValue[newValue?.length - 1];
											if (selectedOption && selectedOption.id === "new") {
												setPurchaseOrgGrpModal(true);
											} else {
												handleAssign(i, newValue);
											}
										}}
										//onChange={handleAssign}
										renderOption={(props, option) => (
											<Box
												component="li"
												{...props}
												style={
													option.id === "new"
														? {
																fontStyle: "italic",
																color: "blue",
																cursor: "pointer",
																textDecoration: "underline",
														  }
														: {}
												}
											>
												{option.groupName}
											</Box>
										)}
										renderInput={(params, data) => (
											<TextField
												{...params}
												variant="outlined"
												size="small"
												placeholder=""
												label="Purchase Group"
											/>
										)}
									/>
								</div>

								<div className="d-flex">
									<Button
										color="error"
										size="small"
										className="mt-3 ms-2"
										onClick={() => handleRemoveClick(i)}
									>
										<HiOutlineX className="f16 text-danger" />
									</Button>
								</div>
							</div>
						))}
					</div>
					<div className="col-12">
						<div className="row">
							{records &&
								records?.length > 0 &&
								records?.map((item, i) => (
									<div key={i} className="col-12">
										<div className="border-bottom p-2">
											<div className="d-flex justify-content-between">
												<div className="flex-grow-1 f12">
													{item?.name}{" "}
													<span className="f12"> - {item?.email}</span>
												</div>
												<div className="d-flex align-items-center">
													<div className="me-2">
														<Input
															placeholder=""
															size="small"
															style={{ width: "70px" }}
															variant=""
															value=""
															className="border"
														/>
													</div>
													<Tooltip title="Delete" arrow>
														<IconButton
															className="ms-2"
															color="error"
															size="small"
															onClick={() => {
																callbackremoveitem(item?.id);
															}}
														>
															<HiX className="f16" />
														</IconButton>
													</Tooltip>
												</div>
											</div>
										</div>
									</div>
								))}
						</div>
					</div>

					

					<div className="col-12 mb-4">
						<FormControlLabel
							control={
								<Checkbox
									name="isactive"
									id="isactive"
									checked={isactive} 
									onChange={(e) => {
										setisactive(e?.target?.checked);
									}}
									
								/>
							}
							label="Active "
						/>

						<FormControlLabel
							control={
								<Checkbox
									name="required"
									id="required"
									checked={required} 
									onChange={(e) => {
										setrequired(e?.target?.checked);
									}}
								
								/>
							}
							label="Mandatory "
						/>
					</div>

					<div className="col-12 text-end">
						{!loading ? (
							<Button
								color="success"
								variant="outlined"
								size="small"
								type="submit"
							>
								Submit
							</Button>
						) : (
							<LoadingButton className="" loading variant="contained">
								Submit ...
							</LoadingButton>
						)}
					</div>
				</div>
				<Modal
					size="lg"
					show={modal}
					backdrop="static"
					keyboard={false}
					value={"Add New"}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0 rounded"
					onHide={() => CloseModal()}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14">
								Email Template
							</div>
						</Modal.Title>
						<IconButton onClick={() => CloseModal()} size="small" edge="start">
							<HiOutlineX className="" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddNewEmailTemplate
								callbackhidemodal={callbackhidemodal}
								callbackstep={callbackstep}
							/>
						</div>
					</Modal.Body>
				</Modal>

				<Modal
					size="lg"
					show={purchaseOrgModal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW CATEGORY"}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => ClosePurcgaseOrgModal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								Manage Purchase Organization
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => ClosePurcgaseOrgModal()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<PurchaseOrg selectedPurOrg={PurchaseOrganisation} />
						</div>
					</Modal.Body>
				</Modal>
				{/* Anurag purchaseOrgGrp modal added*/}
				<Modal
					size="lg"
					show={purchaseOrgGrpModal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW CATEGORY"}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => ClosePurcgaseOrgGrpModal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								Manage Purchase Group
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => ClosePurcgaseOrgGrpModal()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<PurchaseOrgGrp />
						</div>
					</Modal.Body>
				</Modal>
				{/* Anurag conditions modal added*/}
				<Modal
					size="lg"
					show={condition1Modal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW CATEGORY"}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => CloseCondition1Modal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								ADD Condition 1
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => CloseCondition1Modal()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddCondition1 selectedCon1={PullNFAConditionAll} />
						</div>
					</Modal.Body>
				</Modal>

				<Modal
					size="lg"
					show={condition2Modal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW CATEGORY"}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => CloseCondition2Modal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								ADD Condition 2
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => CloseCondition2Modal()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddCondition1 selectedCon1={PullNFAConditionAll} />
							{/* <AddCondition2 selectedCon2={PullNFACondition2All} /> */}
						</div>
					</Modal.Body>
				</Modal>
				<Modal
					size="lg"
					show={modalStageOpen}
					className="zindex1280"
					backdropClassName="zindex1280"
					backdrop="static"
					keyboard={false}
					centered
					onHide={closeStageModal}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14">Add Stage</div>
						</Modal.Title>
						<IconButton onClick={closeStageModal} size="small" edge="start">
							<HiOutlineX className="" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
						
							<AddEditCell stageId={stageId} callbackstep={callbackstep} />
						</div>
					</Modal.Body>
				</Modal>
			</form>
		</>
	);
};
export default AddWorkflowCell;
