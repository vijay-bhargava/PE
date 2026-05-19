import React, { useState, useEffect, useCallback } from "react";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { LoadingButton } from "@mui/lab";
import Radio from "@mui/material/Radio";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import { actionTypes, useStateValue } from "../../../store";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	HiMinus,
	HiOutlineCog,
	HiOutlineDocumentText,
	HiOutlineExclamationCircle,
	HiOutlineFilter,
	HiOutlineMail,
	HiOutlinePlusSm,
	HiOutlineTrash,
	HiOutlineUserGroup,
	HiOutlineUsers,
	HiOutlineX,
	HiPencilAlt,
	HiPlus,
} from "react-icons/hi";
import { Modal } from "react-bootstrap";
import * as yup from "yup";
import { useFormik } from "formik";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
	Switch,
	TextField,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Tooltip,
	InputAdornment,
	Badge,
	DialogTitle,Dialog,DialogActions,
	DialogContent,DialogContentText,
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import {
	OrgGroupMasterList,
	buildQueryParams,
	getMenuMaster,
	getPurchaseOrgList,
	getUserDepartment,
	getUserDepartmentList,
	getUserDesignation,
	getBusinessUnitList,
	getuserlist,
	mapInputtopurchaseOrgGroupModal,
	purchaseOrgGroupModal,
	replaceOrgMstIds,
	getNFAProjectList,
	getNFAConditionList,
	getNFASpendList,
} from "../../../utils/common/utility";
import {
	AddOnlyWorkflow,
	AddStage,
	AddWorkflowStage,
	GetRulesColumn,
	PostwfapproverData,
	ReversePostwfapproverData,
	UpdateStage,
	UpdateWorkflowStage,
} from "../../../utils/stagemaster";
import EditIcon from '@mui/icons-material/Edit';
import { getEmailDetails } from "../../../utils/emailmaster";
import AddNewEmailTemplate from "../ManageEmailTemplate/AddNewEmailTemplate";
import {
	AddWFApprover,
	getwfapproverseqn,
	saveWorkflow,
	updatedworkflow,
} from "../../../utils/workflow";
import { getworkflowlist, getWFRuleCriteria } from "../../../utils/workflow/";
import { ar, id } from "date-fns/locale";
import Add from "@mui/icons-material/Add";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import { DragIndicator, VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { api, ApiClient } from "../../../Apiclient";
import { FaPencilAlt } from "react-icons/fa";

const AddEditCellWithWorkFlow = ({
	callbackstagestep,
	editRecordData,
	seteditRecordData,
	handlestageList,
	editYN,purchaseAllList,setPurchaseAllList,purchasegrpList,setpurchasegrpList
}) => {
	const [{ atoken, rtoken,customersuffix, customerid }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [MenuMasterList, setMenuMasterList] = useState([]);
	const [isWfEditing, setIsWfEditing] = useState(false); 
	const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [records, setRecords] = useState([]);
	const [modal, setModal] = useState(false);
	const [show, setShow] = useState(false);
	const [confirmChangeDialogOpen, setConfirmChangeDialogOpen] = useState(false);
	const [nextActionType, setNextActionType] = useState(null);
	const [approvershow, setApproverShow] = useState(false);
	const [inputOrgGrpList, setinputOrgGrpList] = useState([]);
	const [inputList, setInputList] = useState([]);

const [inputListApproval, setInputListApproval] = useState([{ seqno: "", users: [], seqType: "" ,designation: ""},]);
const [TableItem, setTableItem] = useState([]);

const handleInputApprovalChange = (e, index) => {
	
	const { name, value } = e.target;
	const list = [...inputListApproval];
	list[index][name] = value;
	setInputListApproval(list);
};

const handleSeqApprovalChange = (name, value, index) => {
    

    // Make a copy of the inputListApproval array
    const list = [...inputListApproval];
    
    // Ensure the index is within bounds
    if (index >= 0 && index < list.length) {
        // Update the specific property of the item at the given index
        list[index] = {
            ...list[index],
            [name]: value
        };

        // Update the state with the modified list
        setInputListApproval(list);
    } else {
        console.error('Index out of bounds');
    }
};





useEffect(() => {
	
    if (editRecordData?.id) {
		
        pullworkflowNameList(editRecordData?.id);
    }
}, [editRecordData])


const getInitials = (name) => {
    const names = name.split(' ');
    return names.map(n => n[0]).join('');
  };
const handleInputChangePurchase = (name, index, newValue) => {
    const list = [...inputList];
    list[index][name] = newValue;
  
    // Check if newValue is "Add New" for orgId
    if (newValue && newValue.id === "new") {
        if (name === "orgId") {
            setPurchaseOrgModal(true); 
            list[index][name] = null;
        }
        setInputList(list);
        return; 
    }
    if (newValue && newValue[0]?.id === "grpnew" && newValue[0]?.groupName === "Add New") {
        setPurchaseOrgGrpModal(true); 
        list[index][name] = []; 
        setInputList(list); 
        return; 
    }
  
    setInputList(list); 
};


	const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
	const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
	const ClosePurcgaseOrgGrpModal = () => setPurchaseOrgGrpModal(false);
	const [showRows, setShowRows] = useState(false);
	const [isEnabled, setIsEnabled] = useState(true); 
    const handleClose = () => {
		
		setpopUpEmailId(null);
		setShow(false);
		seteditRecordData(null)
	}
	const handleShow = (emailIdd) => {
		
		setpopUpEmailId(emailIdd);
		setShow(true);
	};
	// const handleShowRejected = (rejectedEmailId) => {
	// 	setShow(true);
	// };
	const handleApproverClose = () => setApproverShow(false);
	const pullMenuMaster = () => {
		var data = {
			MenuType: "Event",
			AccessLevel : "Setup"
		};
         
		getMenuMaster(data, atoken).then((res) => {
			//console.log(res);
			
			setMenuMasterList(res);
		});
	};
	const CloseModal = () => {
		setModal(false);
	};

	useEffect(() => {
		// Fetch purchase orgs for dropdown
		const orgData = { CustomerId: customerid };
		getPurchaseOrgList(orgData, atoken).then((resp) => {
			if (resp && Array.isArray(resp)) {
				setPurchaseAllList(resp);
				console.log("Purchase Orgs loaded:", resp);
			}
		}).catch(error => {
			console.error("Error fetching purchase orgs:", error);
		});
		
		// Fetch purchase groups for dropdown
		const grpData = { CustomerId: customerid };
		OrgGroupMasterList(grpData, atoken)
			.then((res) => {
				if (res && Array.isArray(res)) {
					setpurchasegrpList(res);
					console.log("Purchase Groups loaded:", res);
				}
			})
			.catch((error) => {
				console.error("Error fetching purchase groups:", error);
			});

		// Fetch NFA Project List
		const nfaProjectData = { CustomerId: customerid, IsActive: 'true' };
		getNFAProjectList(nfaProjectData, atoken)
			.then((res) => {
				if (Array.isArray(res)) {
					setNfaProjectList(res);
					console.log("NFA Projects loaded:", res);
				} else {
					setNfaProjectList([]);
				}
			})
			.catch((error) => {
				console.error("Error fetching NFA projects:", error);
				setNfaProjectList([]);
			});

		// Fetch NFA Condition List (Exception)
		const nfaConditionData = { CustomerId: customerid, IsActive: 'true' };
		getNFAConditionList(nfaConditionData, atoken)
			.then((res) => {
				if (Array.isArray(res)) {
					setNfaConditionList(res);
					console.log("NFA Conditions loaded:", res);
				} else {
					setNfaConditionList([]);
				}
			})
			.catch((error) => {
				console.error("Error fetching NFA conditions:", error);
				setNfaConditionList([]);
			});

		// Fetch NFA Spend List
		const nfaSpendData = { CustomerId: customerid, IsActive: 'true' };
		getNFASpendList(nfaSpendData, atoken)
			.then((res) => {
				if (Array.isArray(res)) {
					setNfaSpendList(res);
					console.log("NFA Spend loaded:", res);
				} else {
					setNfaSpendList([]);
				}
			})
			.catch((error) => {
				console.error("Error fetching NFA spend:", error);
				setNfaSpendList([]);
			});
	}, []);

	// Helper function to renumber all rules sequentially and transform approver data
	const renumberRules = (rules) => {
		return rules.map((rule, index) => {
			const transformedRule = {
				...rule,
				ruleName: `Rule ${index + 1}`,
				ruleNumber: index + 1
			};
			
			// Transform approver data when loading from server
			if (transformedRule.wfapproverusers && transformedRule.wfapproverusers.length > 0) {
				// Group approvers by sequence number
				const approversBySequence = {};
				
				transformedRule.wfapproverusers.forEach(approver => {
					const seqNo = approver.seqno || approver.sequence || 1;
					if (!approversBySequence[seqNo]) {
						approversBySequence[seqNo] = [];
					}
					approversBySequence[seqNo].push(approver);
				});
				
				// Transform grouped approvers into single entries per sequence
				transformedRule.wfapproverusers = Object.keys(approversBySequence).map(seqNo => {
					const approversInSequence = approversBySequence[seqNo];
					const firstApprover = approversInSequence[0];
					
					// Combine all users/designations in this sequence
					const selectedUsers = approversInSequence.map(approver => {
						// Determine if this is a user or designation based on useremailid
						if (approver.useremailid && approver.useremailid.trim() !== '') {
							// This is a user approver
							return {
								id: approver.userid,
								name: approver.username,
								email: approver.useremailid,
								type: 'User'
							};
						} else {
							// This is a designation approver (no email or empty email)
							return {
								id: approver.userid,
								name: approver.username,
								designationName: approver.username,
								type: 'Designation'
							};
						}
					});
					
					// Determine the appropriate selectionType and sequenceType
					let selectionType = 'Anyone'; // Default
					if (approversInSequence.length > 1) {
						// If multiple approvers in this sequence, check sequenceType
						selectionType = firstApprover.sequenceType === 'Everyone' ? 'Everyone' : 'Anyone';
					}
					
					// Create a single approver entry for this sequence
					const transformedApprover = {
						...firstApprover,
						selectedUsers: selectedUsers,
						sequence: parseInt(seqNo),
						seqno: parseInt(seqNo),
						// Set selectionType based on sequenceType from server or default to 'Anyone'
						selectionType: selectionType,
						// IMPORTANT: Always ensure sequenceType matches selectionType
						sequenceType: selectionType, // This ensures sequenceType is never null
						// Set designation flag for backward compatibility
						designationId: selectedUsers.some(user => user.type === 'Designation') ? 1 : 0
					};
					
					return transformedApprover;
				});
				
				// Sort by sequence number
				transformedRule.wfapproverusers.sort((a, b) => (a.sequence || a.seqno || 1) - (b.sequence || b.seqno || 1));
			}
			
			return transformedRule;
		});
	};

	const handleValueRemove = (indexToRemove) => {
		const updatedCriteriaList = inputCriteriaList.filter(
			(item, index) => index !== indexToRemove
		);
        
		// Renumber rules to ensure correct sequential numbering
		const renumberedList = renumberRules(updatedCriteriaList);
		setinputCriteriaList(renumberedList);
	};
	
	const [ruleCounter, setRuleCounter] = useState(1);
	const [StageId, setStageId] = useState(0);
	const [stageName, setstageName] = useState("");
	const [stageSeq, setstageSeq] = useState(0);
	const [eventType, seteventType] = useState("");
	const [actionType, setActionType] = useState("email"); // Default to email for new records

	const [expanded, setExpanded] = useState('panel1');

	const handleChangeAccordion = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};

	const [selectUserOption, setSelectUserOption] = useState("U");
	const [selectTypeOption, setSelectTypeOption] = useState("A");
	const [userOptions, setUserOptions] = useState([""]);
	const [typeOptions, settypeOptions] = useState([""]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [approverseq, setapproverseq] = useState([]);
	const [UserDepartment, setUserDepartment] = useState([]);
	const [UserDesignation, setUserDesignation] = useState([]);
	const [departmentId, SetDepartmentId] = useState(0);
	const [departmentName, setdepartmentName] = useState("");
	const [selectUserrole, setselectUserrole] = useState(0);
	const [budgetstatus, setbudgetstatus] = useState("");
	const [parentId, setparentId] = useState(0);
	const [designationId, setdesignationId] = useState(0);
	const [emailId, setemailId] = useState(null);
	const [popUpEmailId, setpopUpEmailId] = useState(null);
	const [rejectedEmailId, setrejectedEmailId] = useState(null);
	const [isActive, setisActive] = useState(false);
	const [mandatory, setmandatory] = useState(false);
	const [wfname, setwfname] = useState("");
	
	const [rows, setRows] = useState([]);
	const [approverSeqType, setapproverSeqType] = useState("Sequential");

	const [SequenceType, setSequenceType] = useState("A"); 
	const [approverType, setapproverType] = useState("U");
	const [CriteriaRuleShow, setCriteriaRuleShow] = useState([]);
	// const [isactive, setisactive] = useState(false);
	const [tableColumnName, settableColumnName] = useState("");

	const [rejectedEmailEvent, setrejectedEmailEvent] = useState("");
	const [approverusertype, setapproverusertype] = useState("");
	const [WfCriteria, setWfCriteria] = useState([]);
	const [recorddataWF, setRecorddataWF] = useState([]);
	const [inputCriteriaList, setinputCriteriaList] = useState([]);

	// Header state
	const [headerRows, setHeaderRows] = useState([]);

	// Header functions
	const handleAddHeader = () => {
		const newHeaderRow = {
			id: Date.now(),
			headerTitle: '',
			headerGroup: '',
			conditions: ''
		};
		setHeaderRows([...headerRows, newHeaderRow]);
	};

	const handleRemoveHeader = (id) => {
		setHeaderRows(headerRows.filter(row => row.id !== id));
	};

	const getHeaderGroupOptions = (headerTitle) => {
		if (headerTitle === 'Purchase Org') {
			// Ensure purchaseAllList is an array and has data
			return Array.isArray(purchaseAllList) && purchaseAllList.length > 0 
				? purchaseAllList.map(item => ({
					id: item.id,
					name: item.orgName || item.name || ''
				}))
				: [];
		} else if (headerTitle === 'Purchase Group') {
			// Ensure purchasegrpList is an array and has data  
			return Array.isArray(purchasegrpList) && purchasegrpList.length > 0
				? purchasegrpList.map(item => ({
					id: item.id,
					name: item.groupName || item.name || ''
				}))
				: [];
		}
		return [];
	};

	// Update header group data when header title changes
	const handleHeaderChange = (id, field, value) => {
		setHeaderRows(headerRows.map(row => 
			row.id === id ? { 
				...row, 
				[field]: value,
				// Clear header group when header title changes
				...(field === 'headerTitle' ? { headerGroup: '' } : {})
			} : row
		));
		
		// If changing header title, fetch appropriate group data
		if (field === 'headerTitle') {
			if (value === 'Purchase Org') {
				// Fetch purchase organizations
				var data = {
					CustomerId: customerid,
				};
				getPurchaseOrgList(data, atoken).then((resp) => {
					if (resp && Array.isArray(resp)) {
						setPurchaseAllList(resp);
					}
				}).catch(error => {
					console.error("Error fetching purchase orgs:", error);
				});
			} else if (value === 'Purchase Group') {
				// Fetch all purchase groups without specific org filter
				var data = { 
					CustomerId: customerid
				};
				OrgGroupMasterList(data, atoken)
					.then((res) => {
						if (res && Array.isArray(res)) {
							setpurchasegrpList(res);
						}
					})
					.catch((error) => {
						console.error("Error fetching purchase groups:", error);
					});
			}
		}
	};

	// Rule state - sync with inputCriteriaList
	const [activeRuleIndex, setActiveRuleIndex] = useState(0);
	const [copyApproversToAllRules, setCopyApproversToAllRules] = useState(false);
	const [showNewApproverRow, setShowNewApproverRow] = useState(false);
	const [newApprover, setNewApprover] = useState({
		sequence: '',
		type: 'User',
		selectedUsers: [],
		selectionType: 'Anyone'
	});

	// Confirmation dialog state
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [confirmDialogData, setConfirmDialogData] = useState({
		title: '',
		message: '',
		onConfirm: null
	});

	// Designation popup state
	const [designationPopupOpen, setDesignationPopupOpen] = useState(false);
	const [currentApproverIndex, setCurrentApproverIndex] = useState(null); // Track which approver triggered popup
	const [legalEntityOptions, setLegalEntityOptions] = useState([]);
	const [businessUnitOptions, setBusinessUnitOptions] = useState([]);
	const [departmentOptions, setDepartmentOptions] = useState([]);
	const [designationOptions, setDesignationOptions] = useState([]);
	
	// NFA Dropdown Options
	const [nfaProjectList, setNfaProjectList] = useState([]);
	const [nfaConditionList, setNfaConditionList] = useState([]);
	const [nfaSpendList, setNfaSpendList] = useState([]);
	const [selectedFilters, setSelectedFilters] = useState({
		legalEntity: '',
		businessUnit: '',
		department: '',
		designation: ''
	});

	// Get rules from inputCriteriaList for tab display
	const getRulesForTabs = () => {
		if (!inputCriteriaList || inputCriteriaList.length === 0) {
			return [];
		}
		return inputCriteriaList.map((criteria, index) => ({
			id: index,
			ruleName: criteria.ruleName || `Rule ${index + 1}`,
			index: index
		}));
	};

	// Rule functions
	const handleAddRule = () => {
		// Add new rule to inputCriteriaList using existing logic
		handleAddRow();
		// Set the new rule as active
		const newIndex = inputCriteriaList ? inputCriteriaList.length : 0;
		setActiveRuleIndex(newIndex);
		// Only reset new approver row when adding new rule if it's not currently being used
		if (!showNewApproverRow || !newApprover.sequence) {
			setShowNewApproverRow(false);
			setNewApprover({
				sequence: '',
				type: 'User',
				selectedUsers: [],
				selectionType: 'Anyone'
			});
		}
	};

	const handleRemoveRule = (ruleIndex) => {
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		// Remove the rule from inputCriteriaList
		const updatedList = inputCriteriaList.filter((_, index) => index !== ruleIndex);
		
		// Renumber all rules to ensure correct sequential numbering
		const renumberedList = renumberRules(updatedList);
		
		setinputCriteriaList(renumberedList);
		
		// Adjust active rule index
		if (activeRuleIndex >= ruleIndex && activeRuleIndex > 0) {
			setActiveRuleIndex(activeRuleIndex - 1);
		} else if (renumberedList.length === 0) {
			setActiveRuleIndex(0);
		}
	};

	// Initialize activeRuleIndex when inputCriteriaList is loaded
	useEffect(() => {
		if (inputCriteriaList && inputCriteriaList.length > 0 && activeRuleIndex >= inputCriteriaList.length) {
			setActiveRuleIndex(0);
		}
	}, [inputCriteriaList]);

	// Update approver display when active rule changes
	useEffect(() => {
		if (inputCriteriaList && inputCriteriaList.length > 0 && activeRuleIndex < inputCriteriaList.length) {
			const activeRule = inputCriteriaList[activeRuleIndex];
			if (activeRule && activeRule.wfapproverusers) {
				// Update approver sequence type and type based on active rule
				if (activeRule.approverSeqType) {
					setapproverSeqType(activeRule.approverSeqType);
				}
				if (activeRule.approverType) {
					setapproverType(activeRule.approverType);
				}
				if (activeRule.SequenceType) {
					setSequenceType(activeRule.SequenceType);
				}
			}
		}
	}, [activeRuleIndex, inputCriteriaList]);

	const handleRuleClick = (ruleIndex) => {
		// Only reset if we're actually switching to a different rule
		if (ruleIndex !== activeRuleIndex) {
			setActiveRuleIndex(ruleIndex);
			// Reset new approver row when switching rules
			setShowNewApproverRow(false);
			setNewApprover({
				sequence: '',
				type: 'User',
				selectedUsers: [],
				selectionType: 'Anyone'
			});
		}
	};

	// Condition functions for active rule
	const handleAddCondition = () => {
		if (!inputCriteriaList || inputCriteriaList.length === 0) {
			// If no rules exist, create the first rule and then add a condition to it
			const newRule = {
				id: 0,
				ruleName: "Rule 1",
				ruleNumber: 1,
				wfid: recorddataWF[0]?.id || 0,
				workFlowRules: [],
				approvers: []
			};
			setinputCriteriaList([newRule]);
			setActiveRuleIndex(0);
			
			// Add a condition after the state is updated
			setTimeout(() => {
				handleAddAnd([newRule], 0);
			}, 0);
		} else {
			// Add condition to the active rule
			handleAddAnd(inputCriteriaList, activeRuleIndex);
		}
	};

	const handleRemoveCondition = (conditionId) => {
		// This function is handled by the existing handleRemoveAnd logic
		// Remove specific condition from the active rule
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		if (activeRule && activeRule.workFlowRules) {
			activeRule.workFlowRules = activeRule.workFlowRules.filter((_, index) => index !== conditionId);
			setinputCriteriaList(updatedList);
		}
	};

	const handleConditionChange = (conditionId, field, value) => {
		// This function is handled by existing rule change handlers
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		if (activeRule && activeRule.workFlowRules && activeRule.workFlowRules[conditionId]) {
			activeRule.workFlowRules[conditionId][field] = value;
			setinputCriteriaList(updatedList);
		}
	};

	// Helper function to get dropdown options based on condition type
	const getDropdownOptions = (conditionType) => {
		
		let options = [];
		switch (conditionType) {
			case 'projectid':
				options = nfaProjectList;
				break;
			case 'exceptionid':
				options = nfaConditionList;
				break;
			case 'spendid':
				options = nfaSpendList;
				break;
			default:
				options = [];
		}
		console.log(`getDropdownOptions for ${conditionType}:`, options);
		return options;
	};

	// Helper function to get display text for dropdown options
	const getOptionLabel = (conditionType, option) => {
		if (!option) return '';
		let label = '';
		switch (conditionType) {
			case 'projectid':
				label = option.project || `Project ${option.id || ''}`;
				break;
			case 'exceptionid':
				label = option.exception  || `Exception ${option.id || ''}`;
				break;
			case 'spendid':
				label = option.spend  || `Spend ${option.id || ''}`;
				break;
			default:
				label = option.name || option.label || option.toString();
		}
		console.log(`getOptionLabel for ${conditionType}:`, option, 'returning:', label);
		return label;
	};

	// Helper function to get option value for dropdown
	const getOptionValue = (option) => {
		return option.id || option.value || option;
	};

	// Helper function to get user-friendly display name for condition fields
	const getConditionDisplayName = (columnName) => {
		if (!columnName) return '';
		
		switch (columnName.toLowerCase()) {
			case 'projectid':
				return 'Project';
			case 'exceptionid':
				return 'Exception';
			case 'spendid':
				return 'Spend';
			case 'nfaamount':
				return 'NFA Amount';
			case 'stage':
				return 'Stage';
			default:
				return columnName;
		}
	};

	// Helper function to check if field should use dropdown
	const shouldUseDropdown = (conditionType) => {
		return ['projectid', 'exceptionid', 'spendid'].includes(conditionType);
	};

	// Approver functions for active rule
	const handleAddApprover = () => {
		// Check if there are rules to add approvers to
		if (!inputCriteriaList || inputCriteriaList.length === 0) {
			toast.error("No rules available to add approver.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});
			return;
		}
		
		// If the new approver form is already showing but empty, just keep it open
		if (showNewApproverRow && 
			(!newApprover.selectedUsers || newApprover.selectedUsers.length === 0)) {
			// Form is already open and empty, just return
			return;
		}
		
		// If the form is already showing and has data, show an error
		if (showNewApproverRow && 
			(newApprover.sequence || (newApprover.selectedUsers && newApprover.selectedUsers.length > 0))) {
			toast.info("Please complete or cancel the current approver form before adding a new one.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});
			return;
		}
		
		// Calculate the next sequence number
		const activeRule = inputCriteriaList?.[activeRuleIndex];
		const existingApprovers = activeRule?.wfapproverusers || [];
		const maxSequence = existingApprovers.length > 0 
			? Math.max(...existingApprovers.map(a => parseInt(a.sequence) || parseInt(a.seqno) || 0))
			: 0;
		const nextSequence = maxSequence + 1;

		// Show the new approver form with the next sequence number
		setShowNewApproverRow(true);
		setNewApprover({
			sequence: nextSequence.toString(),
			type: 'User',
			selectedUsers: [],
			selectionType: 'Anyone'
		});
	};

	const handleRemoveApprover = (approverIdOrIndex) => {
		// Remove approver from the active rule
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		if (activeRule && activeRule.wfapproverusers) {
			// If approverIdOrIndex is a number and corresponds to an index
			if (typeof approverIdOrIndex === 'number' && approverIdOrIndex >= 0) {
				// Remove by index
				activeRule.wfapproverusers.splice(approverIdOrIndex, 1);
			} else {
				// Remove by ID
				activeRule.wfapproverusers = activeRule.wfapproverusers.filter(approver => approver.id !== approverIdOrIndex);
			}
			setinputCriteriaList(updatedList);
		}
	};

	const handleApproverChange = (approverId, field, value) => {
		// Update approver in the active rule
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		console.log(`Updating approver with id: ${approverId}, field: ${field} to value: ${value}`);
		
		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		if (activeRule && activeRule.wfapproverusers) {
			activeRule.wfapproverusers = activeRule.wfapproverusers.map(approver => {
				if (approver.id === approverId) {
					// Create updated approver object
					const updatedApprover = {
						...approver,
						[field]: value
					};
					
					// If changing selectionType, also update sequenceType to match
					if (field === 'selectionType') {
						console.log(`Updating both selectionType AND sequenceType to: ${value}`);
						updatedApprover.sequenceType = value;
					}
					
					// If changing sequenceType, also update selectionType to match
					if (field === 'sequenceType') {
						console.log(`Updating both sequenceType AND selectionType to: ${value}`);
						updatedApprover.selectionType = value;
					}
					
					return updatedApprover;
				}
				return approver;
			});
			
			setinputCriteriaList(updatedList);
		}
	};

	const getActiveRuleData = () => {
		if (!inputCriteriaList || inputCriteriaList.length === 0) return null;
		const activeRule = inputCriteriaList[activeRuleIndex];
		
		// Transform approvers to ensure selectedUsers array exists for backward compatibility
		const transformedApprovers = (activeRule?.wfapproverusers || []).map(approver => {
			let selectedUsers = approver.selectedUsers;
			
			// If selectedUsers doesn't exist or is invalid, create it based on approver data
			if (!selectedUsers || !Array.isArray(selectedUsers) || selectedUsers.length === 0) {
				if (approver.designationId && approver.designationId > 0) {
					// Designation approver
					selectedUsers = [{
						id: approver.userid || approver.id,
						name: approver.username,
						designationName: approver.username,
						type: 'Designation'
					}];
				} else {
					// User approver
					selectedUsers = [{
						id: approver.userid || approver.id,
						name: approver.username,
						email: approver.useremailid,
						type: 'User'
					}];
				}
			}
			
			return {
				...approver,
				selectedUsers: selectedUsers,
				sequence: approver.sequence || approver.seqno || 1
			};
		});
		
		return {
			ruleName: activeRule?.ruleName || `Rule ${activeRuleIndex + 1}`,
			approvers: transformedApprovers
		};
	};

	const handleApproverFieldChange = (index, field, value) => {
		// Update approver field in the active rule
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		console.log(`Updating approver field: ${field} to value: ${value} for index: ${index}`);
		
		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		if (activeRule && activeRule.wfapproverusers && activeRule.wfapproverusers[index]) {
			// Create a new updated approver object
			const updatedApprover = {
				...activeRule.wfapproverusers[index],
				[field]: value
			};
			
			// If changing selectionType, also update sequenceType to match
			if (field === 'selectionType') {
				console.log(`Updating both selectionType AND sequenceType to: ${value}`);
				updatedApprover.sequenceType = value;
			}
			
			// If changing sequenceType, also update selectionType to match
			if (field === 'sequenceType') {
				console.log(`Updating both sequenceType AND selectionType to: ${value}`);
				updatedApprover.selectionType = value;
			}
			
			// Update the approver in the list
			activeRule.wfapproverusers[index] = updatedApprover;
			setinputCriteriaList(updatedList);
		}
	};

	const handleApproverTypeChangeInline = (index, newType) => {
		// Update approver type (User/Designation) in the active rule
		if (!inputCriteriaList || inputCriteriaList.length === 0) return;
		
		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		if (activeRule && activeRule.wfapproverusers && activeRule.wfapproverusers[index]) {
			activeRule.wfapproverusers[index] = {
				...activeRule.wfapproverusers[index],
				designationId: newType === 'Designation' ? 1 : 0,
				userType: newType,
				selectedUsers: [] // Clear selected users when changing type
			};
			setinputCriteriaList(updatedList);
		}
	};

	const handleAddNewApprover = () => {
		console.log('handleAddNewApprover called - showNewApproverRow:', showNewApproverRow);
		console.log('newApprover data:', newApprover);
		
		// Add new approver to the active rule
		if (!inputCriteriaList || inputCriteriaList.length === 0) {
			toast.error("No rules available to add approver.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});
			// Reset the form on error
			setShowNewApproverRow(false);
			return;
		}

		// Validate required fields
		if (!newApprover.sequence || newApprover.sequence === '') {
			toast.error("Please enter a sequence number.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});
			// Don't reset the form for validation errors, let user fix it
			return;
		}

		if (!newApprover.selectedUsers || newApprover.selectedUsers.length === 0) {
			toast.error("Please select at least one user or designation.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});
			// Don't reset the form for validation errors, let user fix it
			return;
		}

		const updatedList = [...inputCriteriaList];
		const activeRule = updatedList[activeRuleIndex];
		
		if (activeRule) {
			if (!activeRule.wfapproverusers) {
				activeRule.wfapproverusers = [];
			}

			// Check if sequence number already exists
			const sequenceExists = activeRule.wfapproverusers.some(approver => 
				(approver.sequence || approver.seqno) == newApprover.sequence
			);

			if (sequenceExists) {
				toast.error(`Sequence number ${newApprover.sequence} already exists. Please choose a different sequence number.`, {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 3000
				});
				// Don't reset the form for validation errors, let user fix it
				return;
			}

			console.log("Adding new approver with selectionType:", newApprover.selectionType);
			
			const newApproverData = {
				id: Date.now() + Math.random(), // Ensure unique ID
				sequence: parseInt(newApprover.sequence),
				designationId: newApprover.type === 'Designation' ? 1 : 0,
				selectedUsers: [...newApprover.selectedUsers], // Create a copy of the array
				selectionType: newApprover.selectionType,
				// Important: sequenceType must match selectionType exactly
				sequenceType: newApprover.selectionType, // Setting sequenceType same as selectionType for server consistency
				seqno: parseInt(newApprover.sequence),
				userType: newApprover.type
			};
			
			console.log("New approver data:", newApproverData);

			activeRule.wfapproverusers.push(newApproverData);
			
			// Sort approvers by sequence number
			activeRule.wfapproverusers.sort((a, b) => {
				const seqA = a.sequence || a.seqno || 0;
				const seqB = b.sequence || b.seqno || 0;
				return seqA - seqB;
			});

			setinputCriteriaList(updatedList);

			// Reset new approver form and hide the row - THIS IS CRITICAL
			console.log('Resetting showNewApproverRow to false');
			setShowNewApproverRow(false);
			setNewApprover({
				sequence: '',
				type: 'User',
				selectedUsers: [],
				selectionType: 'Anyone'
			});

			// Show success message
			toast.success("Approver added successfully!", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});

			// Copy to all rules if toggle is enabled
			if (copyApproversToAllRules) {
				handleCopyApproversToAllRules(newApproverData);
			}
		}
	};

	const handleCancelNewApprover = () => {
		// Cancel adding new approver and hide the row
		setNewApprover({
			sequence: '',
			type: 'User',
			selectedUsers: [],
			selectionType: 'Anyone'
		});
		setShowNewApproverRow(false);
	};

	// Designation popup functions
	const handleDesignationIconClick = (approverIndex = null) => {
		setCurrentApproverIndex(approverIndex); // Track which approver triggered the popup
		setDesignationPopupOpen(true);
		// Fetch initial data for the dropdowns
		fetchLegalEntities();
	};

	const handleDesignationPopupClose = () => {
		setDesignationPopupOpen(false);
		setCurrentApproverIndex(null); // Reset the approver index
		setSelectedFilters({
			legalEntity: '',
			businessUnit: '',
			department: '',
			designation: ''
		});
	};

	const fetchLegalEntities = async () => {
		try {
			// Use existing getUserDepartment function to get legal entities
			const data = { CustomerId: customerid };
			const legalEntities = await getUserDepartment(data, atoken);
			if (legalEntities && Array.isArray(legalEntities)) {
				// Extract unique legal entities from the response
				const uniqueMap = {};
				const uniqueLegalEntities = legalEntities?.filter((item) => {
					if (!uniqueMap[item?.legalEntityName]) {
						uniqueMap[item?.legalEntityName] = true;
						return true;
					}
					return false;
				});
				
				setLegalEntityOptions(uniqueLegalEntities.map(entity => ({
					id: entity.legalEntityId || entity.id,
					name: entity.legalEntityName || entity.name
				})));
			}
		} catch (error) {
			console.error('Error fetching legal entities:', error);
		}
	};

	const fetchBusinessUnits = async (legalEntityId) => {
		try {
			// Use existing getBusinessUnitList function
			const data = {
				CustomerId: customerid,
				LegalEntityId: legalEntityId,
			};
			const businessUnits = await getBusinessUnitList(data, atoken);
			if (businessUnits && Array.isArray(businessUnits)) {
				setBusinessUnitOptions(businessUnits.map(unit => ({
					id: unit.id,
					name: unit.name || unit.businessUnitName
				})));
			}
		} catch (error) {
			console.error('Error fetching business units:', error);
		}
	};

	const fetchDepartments = async (businessUnitId) => {
		try {
			// Use existing getUserDepartmentList function
			const data = { 
				CustomerId: customerid,
				BusinessUnitId: businessUnitId
			};
			const departments = await getUserDepartmentList(data, atoken);
			if (departments && Array.isArray(departments)) {
				setDepartmentOptions(departments.map(dept => ({
					id: dept.id,
					name: dept.departmentName || dept.name
				})));
			}
		} catch (error) {
			console.error('Error fetching departments:', error);
		}
	};

	const fetchDesignations = async (departmentId) => {
		try {
			// Use existing getUserDesignation function if available
			const data = { DepartmentId: departmentId, CustomerId: customerid };
			const designations = await getUserDesignation(data, atoken);
			if (designations && Array.isArray(designations)) {
				setDesignationOptions(designations.map(designation => ({
					id: designation.id,
					name: designation.designationName || designation.name
				})));
			}
		} catch (error) {
			console.error('Error fetching designations:', error);
		}
	};

	const handleFilterChange = (field, value) => {
		setSelectedFilters(prev => ({
			...prev,
			[field]: value
		}));

		// Fetch dependent data based on selection
		if (field === 'legalEntity' && value) {
			fetchBusinessUnits(value.id);
			// Clear dependent fields
			setSelectedFilters(prev => ({
				...prev,
				businessUnit: '',
				department: '',
				designation: ''
			}));
			setBusinessUnitOptions([]);
			setDepartmentOptions([]);
			setDesignationOptions([]);
		} else if (field === 'businessUnit' && value) {
			fetchDepartments(value.id);
			// Clear dependent fields
			setSelectedFilters(prev => ({
				...prev,
				department: '',
				designation: ''
			}));
			setDepartmentOptions([]);
			setDesignationOptions([]);
		} else if (field === 'department' && value) {
			fetchDesignations(value.id);
			// Clear dependent fields
			setSelectedFilters(prev => ({
				...prev,
				designation: ''
			}));
			setDesignationOptions([]);
		}
	};

	const handleApplyDesignationFilter = async () => {
		// Add the selected designation directly to the approver table
		console.log('Adding designation:', selectedFilters);
		
		if (selectedFilters.designation) {
			try {
				// Create a designation object to add to the table
				const designationToAdd = {
					id: selectedFilters.designation.id,
					name: selectedFilters.designation.name,
					designationName: selectedFilters.designation.name,
					type: 'Designation',
					legalEntity: selectedFilters.legalEntity?.name || '',
					businessUnit: selectedFilters.businessUnit?.name || '',
					department: selectedFilters.department?.name || ''
				};

				// Check if we're adding to new approver row or existing approver
				if (currentApproverIndex === null && showNewApproverRow) {
					// Add to new approver row
					setNewApprover(prev => ({
						...prev,
						type: 'Designation',
						selectedUsers: [designationToAdd]
					}));
				} else if (currentApproverIndex !== null) {
					// Add to specific existing approver row
					const currentRule = inputCriteriaList[activeRuleIndex];
					if (currentRule && currentRule.wfapproverusers) {
						const updatedApprovers = [...currentRule.wfapproverusers];
						if (updatedApprovers[currentApproverIndex]) {
							// Set the approver type to Designation and add the selected designation
							updatedApprovers[currentApproverIndex] = {
								...updatedApprovers[currentApproverIndex],
								designationId: selectedFilters.designation.id,
								selectedUsers: [designationToAdd]
							};

							// Update the rule with the modified approvers
							const updatedRule = {
								...currentRule,
								wfapproverusers: updatedApprovers
							};

							// Update the inputCriteriaList
							const updatedCriteriaList = [...inputCriteriaList];
							updatedCriteriaList[activeRuleIndex] = updatedRule;
							setinputCriteriaList(updatedCriteriaList);
						}
					}
				}

				// Also update the UserDesignation list to include this designation if not already present
				setUserDesignation(prev => {
					const exists = prev.find(item => item.id === selectedFilters.designation.id);
					if (!exists) {
						return [...prev, designationToAdd];
					}
					return prev;
				});

				// Close the popup
				handleDesignationPopupClose();
				
				// Show success message
				toast.success(`Designation "${selectedFilters.designation.name}" added successfully!`, {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 2000
				});

			} catch (error) {
				console.error('Error adding designation:', error);
				toast.error('Error adding designation to table.', {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 2000
				});
			}
		} else {
			// Show error message if no designation selected
			toast.error("Please select a designation to add.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000
			});
		}
		
		// Close the popup
		handleDesignationPopupClose();
	};

	const handleCopyApproversToAllRules = (approverData) => {
		if (!inputCriteriaList || inputCriteriaList.length <= 1) return;

		// Get all approvers from the current rule
		const currentRule = inputCriteriaList[activeRuleIndex];
		const currentApprovers = currentRule?.wfapproverusers || [];

		const updatedList = [...inputCriteriaList];
		updatedList.forEach((rule, index) => {
			if (index !== activeRuleIndex) { // Don't copy to the current rule
				// Replace all approvers in other rules with approvers from current rule
				rule.wfapproverusers = currentApprovers.map((approver, approverIndex) => ({
					...approver,
					id: Date.now() + index + approverIndex + Math.random(), // Ensure unique ID for each rule
					seqno: approverIndex + 1 // Reset sequence numbers
				}));
			}
		});
		setinputCriteriaList(updatedList);
	};

	// Confirmation dialog helper functions
	const showConfirmationDialog = (title, message, onConfirm) => {
		setConfirmDialogData({ title, message, onConfirm });
		setConfirmDialogOpen(true);
	};

	const handleCopyConfirmDialogClose = () => {
		setConfirmDialogOpen(false);
		setConfirmDialogData({ title: '', message: '', onConfirm: null });
	};

	const handleCopyConfirmDialogConfirm = () => {
		if (confirmDialogData.onConfirm) {
			confirmDialogData.onConfirm();
		}
		handleCopyConfirmDialogClose();
	};

	

	const [IndexRow, setIndexRow] = useState(0);

	const handleApproverShow = (x, i) => {
		
		setIndexRow(i);
		setApproverShow(true);
		const selectedApprover = x[i] || {};
		//setSequenceType(selectedApprover.SequenceType || "");
		if (selectedApprover.wfapproverusers?.length > 0) {
			setSequenceType(selectedApprover?.wfapproverusers[0]?.sequenceType || null);
		} else {
			setapproverSeqType(null);
		}
		
		// Set approver type

		setapproverType(selectedApprover.approverType || "");

		if (x[i]) {
			console.log("sett", x[i]);
			setCriteriaRuleShow(x[i].workFlowRules);
			console.log("", CriteriaRuleShow);
		}

		if (x[i]?.sequenceType) {
			setSequenceType(x[i].SequenceType);
		}


		if (x[i]?.wfapproverusers?.length > 0) {
			setSequenceType(x[i].wfapproverusers[0]?.sequenceType);
		} else {
			setSequenceType(null); // Or handle the absence of users as needed
		}

		   // Use optional chaining and correct property name
		  
		if (x[i]?.approverSeqType) {
			setapproverSeqType(x[i].approverSeqType);
		}
		if (x[i]?.approverType) {
			setapproverType(x[i].approverType);
		}
		if (x[i]?.wfapproverusers.length>0) {
			setapproverseq(x[i].wfapproverusers);
		} else {
			setapproverseq([]);
		}
		
		// if (x[i]?.wfapproverusers.length>0) {
		// 	setTableItem(x[i].wfapproverusers);
		// } else {
		// 	setapproverseq([]);
		// }
		if (selectedApprover.wfapproverusers?.length > 0) {
			
			
			const obj=selectedApprover.wfapproverusers.filter(x=>!x.users);
            const obj2 =selectedApprover.wfapproverusers.filter(x=>x.users);
		
			// const reversedData = ReversePostwfapproverData(obj);
			// setTableItem([...reversedData,...obj2]);



			const reversedData = ReversePostwfapproverData(obj);
			console.log('Reversed Data:', reversedData);
			
			const modifiedReversedData = reversedData.map(item => ({
				...item,
				// Extract the name from the users array if it exists
				designation: item.users && item.users.length > 0 ? {
					name: item.users[0].name
				} : {}
			}));
			
			// Set the table items
			setTableItem([...modifiedReversedData, ...obj2]);
		    //setapproverseq(selectedApprover.wfapproverusers);
		} else {
			// Handle the absence of approver users
			setTableItem([]);
			setapproverseq([]);
		}
	};
	const handleApproverAdd = useCallback((x) => {

		console.log("x before update:", x);
		console.log("approverSeqType:", approverSeqType);
		console.log("IndexRow:", IndexRow);
		console.log("approverseq:", approverseq);
		console.log("inputListApproval:", inputListApproval);
		console.log("Current SequenceType:", SequenceType);
	
		if (approverSeqType === "Sequential") {
			// Make sure each approver has the sequenceType property
			console.log("Sequential approvers before update:", JSON.stringify(approverseq));
			
			// Check each approver's selectionType
			approverseq.forEach(approver => {
				console.log(`Approver sequence ${approver.sequence || approver.seqno}, selectionType: ${approver.selectionType}, sequenceType before: ${approver.sequenceType}`);
			});
			
			const updatedApprovers = approverseq.map(approver => {
				// Use the approver's own selectionType if available, otherwise use the global SequenceType
				const selectionTypeToUse = approver.selectionType || SequenceType;
				console.log(`Setting sequenceType for approver in sequence ${approver.sequence || approver.seqno} to: ${selectionTypeToUse}`);
				
				return {
					...approver,
					sequenceType: selectionTypeToUse // Use the approver's own selectionType if available
				};
			});
			
			x[IndexRow].wfapproverusers = updatedApprovers;
		} else if (approverSeqType === "Parallel") {
			// Get the processed data but make sure sequenceType is set
			const approvers = PostwfapproverData(TableItem, x[IndexRow].ruleNumber, x[IndexRow].wfid, approverType);
			console.log("Parallel approvers before update:", JSON.stringify(approvers));
			
			// Add sequenceType to each approver
			const updatedApprovers = approvers.map(approver => {
				// Use the approver's own selectionType if available, otherwise use the global SequenceType
				const selectionTypeToUse = approver.selectionType || SequenceType;
				console.log(`Setting sequenceType for parallel approver to: ${selectionTypeToUse}`);
				
				return {
					...approver,
					sequenceType: selectionTypeToUse
				};
			});
			
			x[IndexRow].wfapproverusers = updatedApprovers;
		}
		
		x[IndexRow].approverSeqType = approverSeqType;
		x[IndexRow].approverType = approverType;
		x[IndexRow].SequenceType = SequenceType;
		
		console.log("Updated wfapproverusers:", x[IndexRow].wfapproverusers);
	
		const updatedInputCriteriaList = [...x];
		setinputCriteriaList(updatedInputCriteriaList);
	
		setapproverseq([]);
		setSequenceType("");
		setapproverType("U");
		setapproverSeqType("Sequential");
		setApproverShow(false);
	
		console.log("inputCriteriaList after update:", updatedInputCriteriaList);
		//toast.success("Approver added successfully!", { autoClose: 2000 });
	},[inputCriteriaList, approverseq,approverSeqType,TableItem]);
	
	  const handleDeleteParallel = (index) => {
		const list = [...TableItem];
		list.splice(index, 1);
		setTableItem(list);
	};
	const handleDeleteDesignationParallel = (index) => {
		const list = [...TableItem];
		list.splice(index, 1);
		setTableItem(list);
	  };
	  

	const handleAddUser = () => {
		if (approverSeqType === "Parallel") {
		  if (inputListApproval?.length > 0) {
			const obj = [...inputListApproval];
			console.log("objjjj", obj);
			setTableItem((prev) => [...prev, ...obj]);
			
			setInputListApproval([{ seqno: "", users: [], seqType: "" ,designation: ""}]);
		  }
		} else if (approverSeqType === "Sequential") {
		  if (approverType === "R" || approverType === "U") {
			if (selectedUsers?.id > 0) {
			  const isFound = approverseq?.some((element) => 
				element.designationId === selectedUsers.id || 
				element.userid === selectedUsers.id
			  );
	  
			  if (isFound) {
				toast.error("The user has been added already", {
				  position: toast.POSITION.TOP_CENTER,
				  autoClose: 2000,
				});
			  } else {
				let maxSeqNo = 0;
	          
				approverseq?.forEach((element) => {
				  if (element.seqno > maxSeqNo) {
					maxSeqNo = element.seqno;
				  }
				});
	  
				const newSeqNo = maxSeqNo > 0 ? maxSeqNo + 1 : 1;
	  
				const newUser = selectUserOption === "R"
				  ? {
					  wfid: recorddataWF[0]?.id || 0,
					  customerId: customerid,
					  departmentId: departmentId,
					  username: selectedUsers?.name,
					  designationId: selectedUsers?.id,
					  department: departmentName,
					  useremailid: "",
					  seqno: newSeqNo,
					  budgetstatus: budgetstatus,
					  wfRuleId: 0,
					}
				  : {
					  wfid: recorddataWF[0]?.id || 0,
					  userid: selectedUsers.id,
					  username: selectedUsers.name,
					  useremailid: selectedUsers.email,
					  seqno: newSeqNo,
					  budgetstatus: budgetstatus,
					  wfRuleId: 0,
					};
	  
				setapproverseq((prev) => [...prev, newUser]);
				
			  }
			}
		  }
		}
	  };
	  
	const handleAddRow = () => {
		// Check if the new rule already exists
		const newRule = {
			tableColumnName: "",
			tablE_NAME:"",
			tablE_SCHEMA:"",
			characterEntity: "",
			values: 0,
		};

		const isDuplicate = inputCriteriaList?.some(item => {
			return item.workFlowRules?.some(rule => {
				return (
					rule.tableColumnName === newRule.tableColumnName &&
					rule.characterEntity === newRule.characterEntity &&
					rule.values === newRule.values
				);
			});
		});

		if (isDuplicate) {
			// Display toast alerting the user that the rule already exists
			toast.error("Please ensure that the rule criteria field is filled out accurately..", { autoClose: false });
			return;
		}
		
		// Add the new rule
		setinputCriteriaList(prevList => [
			...prevList,
			{
				ruleName: `Rule ${prevList.length + 1}`,
				ruleNumber: prevList.length + 1,
				approverSeqType: approverSeqType,
				SequenceType: SequenceType,
				approverType: approverType,
				wfid: 0,
				workFlowRules: [
					{
						eventType: "",
						wfid: recorddataWF[0]?.id || 0,
						tableColumnName: "stage",
						tablE_NAME:"",
						tablE_SCHEMA:"",
						characterEntity: "0",
						values: 0,
						textValue: stageName, 
						wfRuleId: 0,
					},
				],
				wfapproverusers: [],
			}
		]);
		setRuleCounter(prevCounter => prevCounter + 1); // Increment rule counter
	};


	const [addAndClicked, setAddAndClicked] = useState(false);

	const handleRemoveAnd = (x, i) => {
		const updatedRuleList = [...(x[i].workFlowRules || [])];
		if (updatedRuleList.length > 0) {
			updatedRuleList.pop(); // Remove the last rule
		}

		x[i].workFlowRules = updatedRuleList;
        
		const updatedInputCriteriaList = [...x];
		setinputCriteriaList(updatedInputCriteriaList);
	};

	



	
	
	
	const handleAddAnd = (x, i) => {
		// Check if there are existing rules and if they are all filled in
		if (x[i].workFlowRules?.length > 0 && 
			x[i].workFlowRules?.some((rule, index) => 
				!(rule.tableColumnName === "stage" && index === 0) && // Exclude only first stage condition from validation
				(!rule.tableColumnName || 
				!rule.characterEntity || 
				(rule.values === "" && rule.textValue === ""))
			)) {
			toast.error("Please fill all fields in the existing rule criteria before adding a new one.", {
				autoClose: 2000,
			});
			return;
		}

		// Initialize workFlowRules array if it doesn't exist
		if (!x[i].workFlowRules) {
			x[i].workFlowRules = [];
		}

		// If there are no rules at all, add stage condition as the first one
		if (x[i].workFlowRules.length === 0) {
			const stageRule = {
				eventType: eventType || "",
				wfid: recorddataWF[0]?.id || 0,
				tableColumnName: "stage",
				tablE_NAME: "",
				tablE_SCHEMA: "",
				characterEntity: "0", // Default to equals operator
				values: 0, 
				textValue: stageName || ""
			};
			x[i].workFlowRules.push(stageRule); // Add as first condition
		}

		// Create a new rule with default values
		const newRule = {
			eventType: eventType || "",
			wfid: recorddataWF[0]?.id || 0,
			tableColumnName: "",
			tablE_NAME: "",
			tablE_SCHEMA: "",
			characterEntity: "0", // Default to equals operator
			values: "", 
			textValue: ""
		};

		// Add the new rule to the active rule
		const updatedInputCriteriaList = [...x];
		
		// Add the new rule
		updatedInputCriteriaList[i].workFlowRules.push(newRule);
		
		// Update the state
		setinputCriteriaList(updatedInputCriteriaList);
	};
	
	
	
	
	
		useEffect(() => {
		
		pullMenuMaster();
		userList();
		

		PullUserDepartment();
	}, []);
	
	
	
	
	useEffect(() => {
		
		if (editRecordData) {
		 purchasegrpList && purchasegrpList.length>0 &&  prefilledStage();
		} else {
			setinputCriteriaList([]);
		}
	}, [PurchaseOrgGrp,MenuMasterList]);

	// Update stage conditions when stage name changes
	useEffect(() => {
		if (inputCriteriaList && inputCriteriaList.length > 0 && stageName) {
			const updatedList = inputCriteriaList.map(rule => ({
				...rule,
				workFlowRules: rule.workFlowRules?.map((workFlowRule, index) => 
					workFlowRule.tableColumnName === "stage" && index === 0
						? { ...workFlowRule, textValue: stageName }
						: workFlowRule
				) || []
			}));
			setinputCriteriaList(updatedList);
		}
	}, [stageName]);




	const validationSchema = yup.object({
	stageSeq: yup
		.number()
		.typeError("Stage Sequence must be a number")
		.min(0, "Stage Sequence cannot be negative")
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
			id: StageId,
			customerid: customerid,
			stageName: editRecordData?.stageName
				? editRecordData?.stageName
				: stageName,
			stageSeq: editRecordData?.stageSeq ? editRecordData?.stageSeq : stageSeq,

			eventType: editRecordData?.eventType
				? editRecordData?.eventType
				: eventType,
			parentId: editRecordData?.parentId ? editRecordData?.parentId : 0,
			wfId:editRecordData?.wfId ? editRecordData?.wfId : 0,
			emailId: editRecordData?.emailId ? editRecordData?.emailId : emailId,
			rejectedEmailId: editRecordData?.rejectedEmailId
				? editRecordData?.rejectedEmailId
				: rejectedEmailId,
			rejectedEmailEvent: editRecordData?.rejectedEmailEvent
				? editRecordData?.rejectedEmailEvent
				: rejectedEmailEvent,
			mandatory: editRecordData?.mandatory ? editRecordData?.mandatory : false,

		 isActive: editRecordData?.isActive ? editRecordData?.isActive : false,
			orgPurchGroup:inputList,
			wfname: editRecordData?.wfname ? `${editRecordData?.wfname}` : wfname,
			//wfapproverusers: approverseq,
			//workFlowRules: inputCriteriaList,w
			createdby: 1,
			wfRuleCriteria: inputCriteriaList,
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
		
		//values.wfRuleCriteria[0].wfapproverusers = PostwfapproverData(TableItem,inputCriteriaList[0].ruleNumber,inputCriteriaList[0].wfid) 
			console.log(actionType);

			// Validate range-based conditions and unique conditions
			const validateConditions = () => {
				const conditionRanges = new Map(); // Track condition ranges across all rules
				
				for (let ruleIndex = 0; ruleIndex < values.wfRuleCriteria.length; ruleIndex++) {
					const rule = values.wfRuleCriteria[ruleIndex];
					const ruleConditions = new Map(); // Use Map to track conditions and their operators
					
					for (let condIndex = 0; condIndex < rule.workFlowRules.length; condIndex++) {
						const condition = rule.workFlowRules[condIndex];
						
						// Skip validation for first stage condition
						if (condition.tableColumnName === "stage" && condIndex === 0) {
							continue;
						}
						
						// Track conditions and their operators within the same rule
						if (!ruleConditions.has(condition.tableColumnName)) {
							ruleConditions.set(condition.tableColumnName, []);
						}
						ruleConditions.get(condition.tableColumnName).push({
							operator: condition.characterEntity,
							value: parseFloat(condition.values || condition.textValue || 0)
						});
					}
					
					// Check each condition type in this rule
					for (let [conditionName, conditionList] of ruleConditions) {
						// Validate range completeness only for nfaamount conditions
						if (conditionName && conditionName === "nfaamount") {
							if (conditionList.length < 2) {
								toast.error(`Condition "${conditionName}" in Rule ${ruleIndex + 1} requires a complete range (e.g., ${conditionName} > 1000 AND ${conditionName} <= 2000)`, { autoClose: 4000 });
								return false;
							}
							
							// Check if we have the required operators for a complete range
							const greaterThanCondition = conditionList.find(c => c.operator === "4"); // >
							const lessEqualCondition = conditionList.find(c => c.operator === "3"); // <=
							
							if (!greaterThanCondition || !lessEqualCondition) {
								toast.error(`Condition "${conditionName}" in Rule ${ruleIndex + 1} must have both > (greater than) and <= (less than or equal) operators for a complete range`, { autoClose: 4000 });
								return false;
							}
							
							// Check if values are provided and valid
							if (isNaN(greaterThanCondition.value) || isNaN(lessEqualCondition.value)) {
								toast.error(`Please provide valid numeric values for both range conditions of "${conditionName}" in Rule ${ruleIndex + 1}`, { autoClose: 3000 });
								return false;
							}
							
							// Check if range is logical (> value should be less than <= value)
							if (greaterThanCondition.value >= lessEqualCondition.value) {
								toast.error(`In Rule ${ruleIndex + 1}, condition "${conditionName}": the lower bound (${greaterThanCondition.value}) must be less than the upper bound (${lessEqualCondition.value})`, { autoClose: 4000 });
								return false;
							}
							
							// Create range object for this condition
							const currentRange = {
								min: greaterThanCondition.value,
								max: lessEqualCondition.value,
								ruleIndex: ruleIndex + 1
							};
							
							// Check for overlapping ranges with other rules
							if (!conditionRanges.has(conditionName)) {
								conditionRanges.set(conditionName, []);
							}
							
							const existingRanges = conditionRanges.get(conditionName);
							for (let existingRange of existingRanges) {
								// Check if ranges overlap
								if (!(currentRange.max <= existingRange.min || currentRange.min >= existingRange.max)) {
									toast.error(`Condition "${conditionName}" has overlapping ranges: Rule ${existingRange.ruleIndex} (${existingRange.min} to ${existingRange.max}) overlaps with Rule ${currentRange.ruleIndex} (${currentRange.min} to ${currentRange.max}). Ranges must be unique and non-overlapping.`, { autoClose: 5000 });
									return false;
								}
							}
							
							// Add this range to the tracking
							existingRanges.push(currentRange);
						} else if (conditionName && conditionName !== "stage" && conditionName !== "nfaamount") {
							// For non-amount fields (projectid, exceptionid, spendid), validate they have values
							for (let condition of conditionList) {
								if (!condition.value || (typeof condition.value === 'string' && condition.value.trim() === "")) {
									toast.error(`Please provide a value for "${conditionName}" in Rule ${ruleIndex + 1}`, { autoClose: 3000 });
									return false;
								}
							}
						}
					}
				}
				return true;
			};
			
			// Run validation
			if (!validateConditions()) {
				return;
			}

		
		
		
			if (actionType === "workflow") {
					if (!values.wfname) {
					toast.error("Please enter a workflow title.", { autoClose: 2000 });
					return;
				}

				const hasWorkFlowRulesWithoutApprovers = values.wfRuleCriteria.some(rule =>
					rule.workFlowRules.length > 0 && rule.wfapproverusers.length === 0
				  );
			  
				  if (hasWorkFlowRulesWithoutApprovers) {
					toast.error("Please set approvers for rule.", {
					  position: toast.POSITION.TOP_CENTER,
					  autoClose: 2000,
					});
					return;
				  }
				
			}
		
		
			// if (actionType === "email") {
			// 	if (!values.emailId) {
			// 		toast.info("Please select Email Template.", { autoClose: 2000 });
			// 		return;
			// 	}
		
				
			// }
	        // defining const to handle recorddataWF
			let recorddataWF_Const=[...recorddataWF]
			if (actionType === "email" && recorddataWF_Const.length > 0) {
				setRecorddataWF([]);
				recorddataWF_Const=[]
				setwfname('');
				setinputCriteriaList([]);
				formik.setFieldValue("wfname", "");
			}
			setLoading(true);


			// Transform headerRows to purchorggroup format for Workflow
			const purchorggroupData = headerRows.map(headerRow => {
				let orgId = 0;
				let orgGroupId = 0;
				let orgGroupName = '';

				if (headerRow.headerTitle === 'Purchase Org' && headerRow.headerGroup) {
					// For Purchase Org, set orgId and find the org name
					const selectedOrg = purchaseAllList.find(org => org.id === parseInt(headerRow.headerGroup));
					orgId = parseInt(headerRow.headerGroup);
					orgGroupName = selectedOrg?.orgName || selectedOrg?.name || '';
				} else if (headerRow.headerTitle === 'Purchase Group' && headerRow.headerGroup) {
					// For Purchase Group, set orgGroupId and find the group name
					const selectedGroup = purchasegrpList.find(group => group.id === parseInt(headerRow.headerGroup));
					orgGroupId = parseInt(headerRow.headerGroup);
					orgGroupName = selectedGroup?.groupName || selectedGroup?.name || '';
				}

				return {
					id: 0, // Will be set by backend
					wfid: recorddataWF[0]?.id || 0,
					orgId: orgId,
					orgGroupId: orgGroupId,
					orgGroupName: orgGroupName
				};
			}).filter(item => item.orgId > 0 || item.orgGroupId > 0); // Only include valid entries

			// Transform headerRows to orgPurchGroup format for EventStage
			const eventStageOrgPurchGroup = headerRows.map(headerRow => {
				let orgId = 0;
				let orgGroupId = 0;
				let orgGroupName = '';
				let orgName = '';

				if (headerRow.headerTitle === 'Purchase Org' && headerRow.headerGroup) {
					// For Purchase Org, set orgId and find the org name
					const selectedOrg = purchaseAllList.find(org => org.id === parseInt(headerRow.headerGroup));
					orgId = parseInt(headerRow.headerGroup);
					orgName = selectedOrg?.orgName || selectedOrg?.name || '';
					orgGroupName = selectedOrg?.orgName || selectedOrg?.name || '';
				} else if (headerRow.headerTitle === 'Purchase Group' && headerRow.headerGroup) {
					// For Purchase Group, set orgGroupId and find the group name
					const selectedGroup = purchasegrpList.find(group => group.id === parseInt(headerRow.headerGroup));
					orgGroupId = parseInt(headerRow.headerGroup);
					orgGroupName = selectedGroup?.groupName || selectedGroup?.name || '';
					// For purchase groups, we need to find the org name from the parent org
					orgName = '';
				}

				return {
					id: 0,
					eventType: eventType,
					orgId: orgId,
					orgName: orgName,
					orgGroupId: orgGroupId,
					orgGroupName: orgGroupName,
					stageId: StageId || 0
				};
			}).filter(item => item.orgId > 0 || item.orgGroupId > 0); // Only include valid entries

			console.log("Header rows:", headerRows);
			console.log("Transformed purchorggroup for workflow:", purchorggroupData);
			console.log("Transformed orgPurchGroup for EventStage:", eventStageOrgPurchGroup);
          
            var data = {
                id: StageId,
                stageName: stageName,
                stageSeq: stageSeq,
                eventType: eventType,
                parentId: 0,
                wfId:recorddataWF[0]?.id||0,
                
                emailId: emailId,
                rejectedEmailId: rejectedEmailId,
                rejectedEmailEvent: rejectedEmailEvent,
                mandatory: mandatory,
                isActive: isActive,
                orgPurchGroup: eventStageOrgPurchGroup
            };		// Transform approver data before submission
		const transformedInputCriteriaList = inputCriteriaList.map(rule => {
			const transformedRule = { ...rule };
			
			// Remove approverSeqType from rule before submission
			delete transformedRule.approverSeqType;
			
			if (transformedRule.wfapproverusers && transformedRule.wfapproverusers.length > 0) {
				// Group approvers by sequence number
				const approversBySequence = {};
				
				transformedRule.wfapproverusers.forEach(approver => {
					const seqNo = approver.seqno || approver.sequence || 1;
					if (!approversBySequence[seqNo]) {
						approversBySequence[seqNo] = [];
					}
					approversBySequence[seqNo].push(approver);
				});
				
				// Transform grouped approvers
				transformedRule.wfapproverusers = Object.keys(approversBySequence).flatMap(seqNo => {
					const approversInSequence = approversBySequence[seqNo];
					
					return approversInSequence.flatMap(approver => {
						// For sequences with multiple approvers, we always need to set a sequenceType
						// If sequenceType is null or undefined, derive it from selectionType
						let sequenceTypeValue;
						
						console.log(`Processing approver in sequence ${approver.seqno || approver.sequence}:`);
						console.log(`- selectionType: ${approver.selectionType}`);
						console.log(`- sequenceType: ${approver.sequenceType}`);
						console.log(`- number of approvers in this sequence: ${approversInSequence.length}`);
						
						if (approversInSequence.length > 1) {
							// For multiple approvers in a sequence, preserve the existing sequenceType if present,
							// otherwise use selectionType, finally default to 'Anyone'
							if (approver.sequenceType) {
								sequenceTypeValue = approver.sequenceType;
								console.log(`- Using existing sequenceType: ${sequenceTypeValue}`);
							} else if (approver.selectionType) {
								sequenceTypeValue = approver.selectionType;
								console.log(`- Using selectionType: ${sequenceTypeValue}`);
							} else {
								sequenceTypeValue = 'Anyone'; // Default
								console.log(`- Using default 'Anyone'`);
							}
						} else {
							// For single approvers, default to null as per original behavior
							// But check if there's an explicit value set
							sequenceTypeValue = approver.sequenceType || null;
							console.log(`- Single approver, using: ${sequenceTypeValue || 'null'}`);
						}
						
						const baseApprover = {
							wfRuleId: approver.wfRuleId || 0,
							wfid: recorddataWF[0]?.id || 0,
							customerId: customerid || 0,
							budgetstatus: approver.budgetstatus || null,
							seqno: approver.seqno || approver.sequence || 1,
							department: null,
							departmentId: null,
							// Set sequenceType based on calculated value
							sequenceType: sequenceTypeValue
						};

						// Check if both user and designation are selected (selectedUsers contains both types)
						if (approver.selectedUsers && approver.selectedUsers.length > 0) {
							return approver.selectedUsers.map(selectedItem => {
							if (selectedItem.type === 'Designation') {
								// For designation: use the expected format
								return {
									...baseApprover,
									userid: selectedItem.id,
									username: selectedItem.name || selectedItem.designationName,
									useremailid: null,
									designationId: null
								};
							} else {
								// For user: use user format
								return {
									...baseApprover,
									userid: selectedItem.id,
									username: selectedItem.name,
									useremailid: selectedItem.email,
									designationId: null
								};
							}
						});
					} else {
						// Fallback for old format or direct properties
						if (approver.designationId && approver.designationId > 0) {
							// Designation approver
							return [{
								...baseApprover,
								userid: approver.designationId,
								username: approver.username || approver.name,
								useremailid: null,
								designationId: null
							}];
						} else {
							// User approver
							return [{
								...baseApprover,
								userid: approver.userid || approver.id,
								username: approver.username || approver.name,
								useremailid: approver.useremailid || approver.email,
								designationId: null
							}];
						}
					}
				}); // End of inner flatMap function
			}); // End of outer flatMap function for Object.keys
			}
			
			return transformedRule;
		});

		console.log("Header rows:", headerRows);
		console.log("Transformed purchorggroup:", purchorggroupData);

		var WFdata = {
				id: recorddataWF[0]?.id ? recorddataWF[0]?.id : 0,
                customerId: customerid,
				wfname: wfname,
				eventtype: eventType,
				stageId: actionType === "email" ? 0 : StageId,
				wfoverride: true,
				currencyType: "",
				wfRuleCriteria: transformedInputCriteriaList,
				purchorggroup: purchorggroupData,
				required: mandatory,
				isactive: isActive,
			};



			if (StageId > 0) {
				
				UpdateStage(data, StageId, atoken).then((res) => {
					
					if (recorddataWF[0]?.id > 0) {
						
						UpdateWorkflowStage(WFdata, recorddataWF[0]?.id, atoken).then(
							(res) => {}
						);
					}else { 
						
					
						if (actionType === "workflow") {
							WFdata.stageId = StageId;
							 AddOnlyWorkflow( WFdata, atoken);
						}
					}
					
					// Handle other actions after updating the stage
				
					
					//  setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });

					
					prefilledStage();

					toast.success("Stage updated successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 2000,
					});
					callbackstagestep("update");
					//return true;
				});
				
			} else {
				AddWorkflowStage(data, WFdata, atoken, actionType).then((res) => {

				// AddWorkflowStage(data, WFdata, atoken).then((res) => {
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });

					
					prefilledStage();
					toast.success("Stage  added successfully!",{position: toast.POSITION.TOP_CENTER,
						autoClose: 2000,});
					
					callbackstagestep("add");
					//return true;
				});
			}
		},
	});
	const hasWorkFlowRules = inputCriteriaList.some(item => item.workFlowRules.length > 0);
	
	const getCharacterEntitySymbol = (value) => {
		switch (value) {
			case "0":
				return "=";
			case "1":
				return "!=";
			case "2":
				return "<";
			case "3":
				return "<=";
			case "4":
				return ">";
			case "5":
				return ">=";
			default:
				return value;
		}
	};

   const [wfid,setWfid]=useState(0);

	const onchangeEventType = (event) => {
		
		const selectedEventType = event.target.value;
	
		seteventType(selectedEventType);
		emailDataList(selectedEventType); 
		pullgetrulescolumns(selectedEventType); 
		formik?.setFieldValue("eventType", selectedEventType); 
	
		
		//setIsEnabled(selectedEventType === 'NFA'); 
		setisActive(false);
		setmandatory(false);
		setemailId(null);
		setrejectedEmailId(null);
		setstageName("");
		setstageSeq(0);
		setwfname("");
		
		setinputCriteriaList([]);
	};
	
	function createTableData(name, operation, value) {
		return { name, operation, value };
	}

	const onchangeEmailType = (event) => {
		console.log("event.target.value", event.target.value);
		if (event.target.value == "new") {
		
			setModal(true);
		} else {
			setemailId(event.target.value);
			formik?.setFieldValue("emailId", event.target.value);
		}
	};
	const onchangeEmailRejectType = (event) => {
		console.log("event.target.value", event.target.value);
		if (event.target.value == "new") {
			setModal(true);
		} else {
			setrejectedEmailId(event.target.value);
			formik?.setFieldValue("rejectedEmailId", event.target.value);
		}
	};
	const callbackstep = useCallback((data) => {}, []);
	const openStageModal = () => {};

	const prefilledStage = () => {
	   
		 console.log('prefilled',editRecordData);
		if (editRecordData) {
			formik.setFieldValue("id", editRecordData?.id);
			setStageId(editRecordData?.id);
			setstageName(editRecordData?.stageName);
			setstageSeq(editRecordData?.stageSeq);
			setparentId(editRecordData?.parentId);
			setmandatory(editRecordData?.mandatory);
			setemailId(editRecordData?.emailId);
			setrejectedEmailId(editRecordData?.rejectedEmailId);
			formik.setValues({
				...formik.values,
				emailevent:
					emaildata?.find((option) => option.id === editRecordData?.emailId)
						?.emailevent || "",
			});
			formik.setValues({
				...formik.values,
				emailevent:
					emaildata?.find(
						(option) => option.id === editRecordData?.rejectedEmailId
					)?.emailevent || "",
			});
			
			seteventType(editRecordData?.eventType);
			setisActive(editRecordData?.isActive);
			emailDataList(editRecordData?.eventType);
			setinputOrgGrpList(editRecordData?.orgPurchGroup);
			
			pullgetrulescolumns(editRecordData?.eventType);
			
			const mappedlist=mapInputtopurchaseOrgGroupModal(editRecordData?.orgPurchGroup)
			
			const updatedlist = replaceOrgMstIds(mappedlist, purchasegrpList)
			 
            setInputList(updatedlist)

			if (editRecordData?.emailId != null && editRecordData?.emailId > 0) {
				
				setActionType("email");
			}
			else{
				setActionType(null);
			}
			
            formik.setFieldValue("wfId",editRecordData?.wfId)
			setWfid(editRecordData?.wfId)
			// pullWorkFlowDataList(editRecordData?.id);
			//  pullWorkFlowDataList(editRecordData?.wfId);
			 if (editRecordData?.wfId > 0) {
				pullWorkFlowDataList(editRecordData?.wfId);
			}

		}
	};
	
	// Function to populate headerRows from purchorggroup data
	const populateHeaderRowsFromPurchorggroup = (purchorggroupData) => {
		console.log('Populating headerRows from purchorggroup:', purchorggroupData);
		
		const headerRowsData = purchorggroupData.map(item => {
			let headerTitle = '';
			let headerGroup = '';

			if (item.orgId && item.orgId > 0) {
				// This is a Purchase Org entry
				headerTitle = 'Purchase Org';
				headerGroup = item.orgId.toString();
			} else if (item.orgGroupId && item.orgGroupId > 0) {
				// This is a Purchase Group entry
				headerTitle = 'Purchase Group';
				headerGroup = item.orgGroupId.toString();
			}

			return {
				id: Date.now() + Math.random(), // Generate unique ID
				headerTitle: headerTitle,
				headerGroup: headerGroup,
				conditions: '' // This field doesn't seem to be used in the current implementation
			};
		}).filter(item => item.headerTitle !== ''); // Only include valid entries

		console.log('Generated headerRows:', headerRowsData);
		setHeaderRows(headerRowsData);
	};
	

	const pullWorkFlowDataList =async (wfId) => {
		
		var wfdata = {
			//CustomerId: customerid,
			Id: wfId,
		};

        

		 getworkflowlist(wfdata, atoken).then((res) => {
			if (res?.length) {
				
				console.log(`getworkflowlist`,res)
				setRecorddataWF(res);
			    if(res[0]?.id != null && res[0]?.id > 0){
					setActionType("workflow");
					// formik.setFieldValue("wfId", res[0]?.id);
				}
				else{
					setActionType(null);
				}
				setwfname(res[0]?.wfname);
				// setActionType("workflow");

				var wfCriteriaData = {
					wfid: res[0]?.id,
				};

				getWFRuleCriteria(wfCriteriaData, atoken).then((resRule) => {
					console.log(`resRule from server:`, resRule);
					// Normalize rule names to ensure correct numbering (1, 2, 3, etc.)
					const normalizedRules = renumberRules(resRule);
					console.log(`normalizedRules after transformation:`, normalizedRules);
					setinputCriteriaList(normalizedRules);
					//add approver workflow related to rule
					
				});

				// Load purchorggroup data and populate headerRows
				if (res[0]?.purchorggroup && res[0].purchorggroup.length > 0) {
					console.log('Loading purchorggroup data:', res[0].purchorggroup);
					populateHeaderRowsFromPurchorggroup(res[0].purchorggroup);
				}
				
			} else {
				setRecorddataWF([]);
			}
		});
	};




	const pullWorkFlowDataListonChange  =async (wfId) => {
	     
		 setWfid(wfId)
		formik.setFieldValue("wfId",wfId)  
		var wfdata = {
			//CustomerId: customerid,
			Id: wfId,
		};
        const queryParams = buildQueryParams(wfdata)
        const res = await apiClient.getres(`/api/WorkFlow/Find?${queryParams}`,atoken)
		
       if(res?.data?.result.length){
		
	
		setRecorddataWF(res?.data?.result);
		
	
		setwfname(res?.data?.result[0]?.wfname);
		
		
		setActionType("workflow");
		

		let wfCriteriaData = {
			wfid: res?.data?.result[0]?.id,
		};
        const queryParams2=buildQueryParams(wfCriteriaData)
		
		const res2= await apiClient.getres(`api/WorkFlow/FindWFCriteria?${queryParams2}`,atoken)
		
	     
		   // Normalize rule names to ensure correct numbering (1, 2, 3, etc.)
		   const normalizedRules = renumberRules(res2?.data?.result || []);
		   setinputCriteriaList(normalizedRules);
		
			
			
	   }
	   else{
		
		setRecorddataWF([]);
	   }

		

		
	};

	
	
	const [WorkflowList, setWorkflowList] = useState([]);
	const pullworkflowNameList = async (stageId) => {
	var data = {
		
			StageId: stageId,

		};
		const queryParams=buildQueryParams(data)
		const res= await apiClient.getres(`api/WorkFlow/Find?${queryParams}`,atoken)
		if(res){
			
			const data =res?.data?.result
			
			setWorkflowList(data);
			

		}
	}

	const clearfilledstage = () => {
		formik.setFieldValue("id", 0);
		setstageName("");
		setstageSeq(0);
		setwfname("");
		seteventType("");
		setisActive(false);
		setmandatory(false);
		setemailId(null);
		setrejectedEmailId(null);
		setinputCriteriaList([]);
		setorgMstId(0);
		setinputOrgGrpList(null);
		setActionType(null);

	};

	const formikcat = useFormik({
		enableReinitialize: true,
		initialValues: {
			//custoemerid: itemin.custoemerid,
			token: atoken,
			// id:0,
			wfid: recorddataWF[0]?.id,
			type: recorddataWF[0]?.id,
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
				wfid: recorddataWF[0]?.id ? recorddataWF[0]?.id : 0,
				approverusertype: selectUserOption,
				designationId: selectUserrole,
				budgetstatus: budgetstatus,
				wfapproverusers: approverseq,
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
				pullWorkFlowDataList();
				return true;
			});
		},
	});
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

	// const handlesActionType = (e, newValue) => {
	// 	console.log("option", newValue);
	// 	if (newValue === "workflow" && !stageName) {
	// 		toast.error("Please fill Stage Name.", { autoClose: 2000 });
	// 		return;
	// 	}
	// 	setActionType(newValue);

	// };
	const handlesActionType = (e, newValue) => {
		
		if (newValue === "workflow" && !stageName) {
		  toast.error("Please fill Stage Name.", { autoClose: 2000 });
		  return;
		}
	  
		if (newValue !== actionType) {
		  if (actionType === "workflow" && newValue === "email") {
			// Check if there's data in workflow that might be lost
			if (recorddataWF.length > 0) {
			  setNextActionType(newValue);
			  setConfirmChangeDialogOpen(true);
			  
			  return;
			}
		  } else if (actionType === "email" && newValue === "workflow") {
			// Check if there's data in email that might be lost
			if (emailDataList.length > 0) {
			  setNextActionType(newValue);
			  setConfirmChangeDialogOpen(true);
			  return;
			}
		  }
		}
	  
		// If no dialog needed or no data to be lost, just set the action type
		setActionType(newValue);
	  };
	  const handleConfirmDialogClose = (confirm) => {
		setConfirmChangeDialogOpen(false);
	
		if (confirm) {
			setActionType(nextActionType);
	
			if (nextActionType === "workflow") {
				setInputList([]); // Clears email-related data
			} else if (nextActionType === "email") {
			
				// if (recorddataWF.length > 0) {
				// 	setRecorddataWF([]);
				// 	setwfname('');
				// 	setinputCriteriaList([]);
				// 	formik.setFieldValue("wfname", "");
				// }
			}
		}
	
		// Clear next action type
		setNextActionType(null);
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
	const getappseq = (wfid) => {
		var data = {
			id: 0,
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
	const handleRemove = () => {
		setemailId(0); // Email I
	};
	const handleRemoveReject = () => {
		setrejectedEmailId(0); // Email I
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
	const handleRemoveClick = (index) => {
		const list = [...approverseq];
		list.splice(index, 1);
		setapproverseq(list);
	};

	const handleRemoveorggrpClick = (index) => {
		//
		const list = [...inputList];
		list.splice(index, 1);
		setInputList(list);
	};

	// const handleapproverSeqType = (event) => {
	// 	setapproverSeqType(event.target.value);
	// };
// Initialize the state for the current approver sequence type
const [currentApproverSeqType, setCurrentApproverSeqType] = useState("");
const [dialogOpen, setDialogOpen] = useState(false);
const [pendingApproverSeqType, setPendingApproverSeqType] = useState("");
// const handleapproverSeqType = (event) => {
//     const newApproverSeqType = event.target.value;
//     if (newApproverSeqType !== currentApproverSeqType) {
//       setPendingApproverSeqType(newApproverSeqType);
//       setDialogOpen(true);
//     } else {
// 		setapproverSeqType(newApproverSeqType);
//     }
//   };
const handleapproverSeqType = (event) => {
	
    const newApproverSeqType = event.target.value;
	//setapproverSeq(newApproverSeqType);
    if (newApproverSeqType) {
        if (approverseq.length > 0 || TableItem.length > 0) {
            setPendingApproverSeqType(newApproverSeqType);
            setDialogOpen(true);
        } else {
            // Directly update if no unsaved data
            setapproverSeqType(newApproverSeqType);
            //setCurrentApproverSeqType(newApproverSeqType);
        }
    }
	
};
  const handleDialogClose = (confirmed) => {
	
    if (confirmed) {
		setapproverSeqType(pendingApproverSeqType);
      setCurrentApproverSeqType(pendingApproverSeqType);

      if (pendingApproverSeqType === "Sequential") {
        setapproverseq([]);
      } else if (pendingApproverSeqType === "Parallel") {
        setTableItem([]);
      }
    }
    setDialogOpen(false);
  };

	//For Department
	const PullUserDepartment = () => {
		var data={ 
			CustomerId:customerid,
			// BusinessUnitId:departmentId,
		   
		  }
		
		getUserDepartmentList(data, atoken).then((res) => {
			setUserDepartment(res);
		});
	};
	const handleDepartmentChange = (event, value) => {
		
		SetDepartmentId(value?.id);
		setdepartmentName(value?.name);
		PullUserDesignation(value?.id);
	};
	const handleDesinationChange = (event, value) => {
		console.log(value);
		setSelectedUsers(value);
	}
	const handleDepartmentApprovalChange = (event, value, index) => {
		const updatedList = inputListApproval.map((item, i) =>
		  i === index ? { ...item, department: value } : item
		);
		setInputListApproval(updatedList);
		PullUserDesignation(value?.id); // Assuming this updates user designations based on department
	  };
	//For Designation
	const PullUserDesignation = (departmentId) => {
		var dataRequest = {
			CustomerId: customerid,
			DepartmentId: departmentId,
		};
		getUserDesignation(dataRequest, atoken).then((res) => {
			setUserDesignation(res);
		});
	};
	// const handleDesinationChange = (event, value, index) => {
	// 	const updatedList = inputListApproval.map((item, i) =>
	// 	  i === index ? { ...item, designation: value } : item
	// 	);
	// 	setInputListApproval(updatedList);
	//   };
	  const handleDesinationapprovalChange = (name, value, index) => {
		
	
		// Make a copy of the inputListApproval array
		const list = [...inputListApproval];
		
		// Ensure the index is within bounds
		if (index >= 0 && index < list.length) {
			// Update the specific property of the item at the given index
			list[index] = {
				...list[index],
				[name]: value
			};
	
			// Update the state with the modified list
			setInputListApproval(list);
		} else {
			console.error('Index out of bounds');
		}
	};
	//for get rules Columns
	const [RulesList, setRulesList] = useState([]);
	const [SelectedRules, setSelectedRules] = useState([]);
	const pullgetrulescolumns = (EventType) => {
		
		var data = {
			EventType: EventType,
		};
		console.log(data);
		GetRulesColumn(data, atoken).then((res) => {
			setRulesList(res);
		});
	};

	const [selectedValue, setSelectedValue] = useState("");

	//prevcode

	const handleRulesChange = (index, i, newvalue) => {
		if (!newvalue) return;
		
		const newCriteriaList = [...inputCriteriaList];
		
		// Ensure the workFlowRules array and this specific rule exist
		if (!newCriteriaList[index].workFlowRules) {
			newCriteriaList[index].workFlowRules = [];
		}
		
		if (!newCriteriaList[index].workFlowRules[i]) {
			newCriteriaList[index].workFlowRules[i] = {
				eventType: eventType || "",
				wfid: recorddataWF[0]?.id || 0,
				characterEntity: "0", // Default to equals operator
				values: "",
				textValue: ""
			};
		}
		
		// Set the column values from the selected value
		newCriteriaList[index].workFlowRules[i].tableColumnName = newvalue.columN_NAME || "";
		newCriteriaList[index].workFlowRules[i].tablE_NAME = newvalue.tablE_NAME || "";
		newCriteriaList[index].workFlowRules[i].tablE_SCHEMA = newvalue.tablE_SCHEMA || "";
		
		// For non-stage conditions, handle operator logic based on condition type
		if (newvalue.columN_NAME && newvalue.columN_NAME !== "stage") {
			// Only nfaamount should have range (> and <=), others use equals operator
			if (newvalue.columN_NAME === "nfaamount") {
				// Set current condition to > operator for amount ranges
				newCriteriaList[index].workFlowRules[i].characterEntity = "4"; // >
				
				// Check if we need to add a second condition for the range
				const existingConditions = newCriteriaList[index].workFlowRules.filter(rule => 
					rule.tableColumnName === newvalue.columN_NAME
				);
				
				if (existingConditions.length === 1) {
					// Add the second condition for <= operator
					const secondCondition = {
						eventType: eventType || "",
						wfid: recorddataWF[0]?.id || 0,
						tableColumnName: newvalue.columN_NAME || "",
						tablE_NAME: newvalue.tablE_NAME || "",
						tablE_SCHEMA: newvalue.tablE_SCHEMA || "",
						characterEntity: "3", // <= operator
						values: "",
						textValue: ""
					};
					
					newCriteriaList[index].workFlowRules.push(secondCondition);
				}
			} else {
				// For projectid, exceptionid, spendid - use equals operator
				newCriteriaList[index].workFlowRules[i].characterEntity = "0"; // = operator
			}
		}
		
		setinputCriteriaList(newCriteriaList);
	};

	const handlecharacterChange = (index, i, event) => {
		if (!event || !event.target) return;
		
		const newCriteriaList = [...inputCriteriaList];
		
		// Ensure the workFlowRules array and this specific rule exist
		if (!newCriteriaList[index].workFlowRules) {
			newCriteriaList[index].workFlowRules = [];
		}
		
		if (!newCriteriaList[index].workFlowRules[i]) {
			newCriteriaList[index].workFlowRules[i] = {
				eventType: eventType || "",
				wfid: recorddataWF[0]?.id || 0,
				tableColumnName: "",
				tablE_NAME: "",
				tablE_SCHEMA: "",
				values: "",
				textValue: ""
			};
		}
		
		newCriteriaList[index].workFlowRules[i].characterEntity = String(event.target.value);
		
		setinputCriteriaList(newCriteriaList);
	};

	// const handleRuleValueChange = (index, i, event) => {
	// 	const newCriteriaList = [...inputCriteriaList];
	// 	newCriteriaList[index].workFlowRules[i].values = event.target.value;
	// 	setinputCriteriaList(newCriteriaList);
	// };

	const handleWorkflowChange = (event) => {
	
        const selectedId = event.target.value;  // Get selected id from the event
        const selectedWorkflow = WorkflowList.find((workflow) => workflow.id === selectedId);  // Find matching workflow by id
        
        if (selectedWorkflow) {
            // If a matching workflow is found, update wfname with the corresponding workflow name
            setwfname(selectedWorkflow.wfname);  
			
			formik.setFieldValue("wfname",selectedWorkflow.wfname)
        }
    };

	const handleRuleValueChange = (index, i, event) => {
		const newCriteriaList = [...inputCriteriaList];
		const rule = newCriteriaList[index].workFlowRules[i];
	
		if (rule && rule.tableColumnName) {
			if (rule.tableColumnName === "stage") {
				rule.textValue = event.target.value;
				rule.values = ''; 
			} else {
				rule.values = event.target.value;
				rule.textValue = ''; 
			}
		
			setinputCriteriaList(newCriteriaList);
		}
	};

	
	const [selectedRuleValue, setselectedRuleValue] = useState(0); // Initial selected value

	const handleInputChange = (e, index) => {
		const { name, value } = e.target;
		let setvalue = value;
		if (value != "" && value > 0) {
			setvalue = parseInt(value);
		}

		const list = approverseq;
		list[index][name] = setvalue;

		formikcat.setFieldValue(`seqno-${index}`, setvalue);
		setapproverseq(list);
	};

	const onlyNumbers = (e) => {
		e.target.value = e.target.value.replace(/[^0-9]/g, "");
	};
	const getOrganisationDefault = (arrayId) => {
		console.log("puchaseeeee", arrayId);
        
		let arrayNew = [];
		if (arrayId > 0) {
			purchaseAllList?.map((data) => {
				if (data.id == arrayId) {
					if (data) arrayNew.push(data);
				}
			});
		}

		return arrayNew[0];
	};
	const getPurchaseOrgGroup = (id) => {
		console.log(purchaseAllList);
		// Add implementation here if needed
	};
	
	
	
	const gettablecolumnDefault = (columNAME) => {
		
		if (columNAME !== "") {
		   const selectedColumn = RulesList?.find((data) => data?.columN_NAME === columNAME);
		  return selectedColumn || null;
		} else {
		 const selectedColumn = RulesList?.find((data) => data?.columN_NAME === "Stage");
		  return selectedColumn || null;
		}
	  };
	  
	
	const [orgMstId, setorgMstId] = useState();
	
	const PullPurchaseOrganisation = () => {
		var data = {
			CustomerId: customerid,
		};
		getPurchaseOrgList(data, atoken).then((resp) => {
			if (resp && Array.isArray(resp)) {
				setPurchaseAllList(resp);
				console.log("Purchase Orgs updated:", resp);
			}
		}).catch(error => {
			console.error("Error fetching purchase orgs:", error);
		});
	};

	 
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
	    console.log("purchaseeegrpdata",data);
		OrgGroupMasterList(data, atoken)
		  .then((res) => {
			
		      
			if (res && Array.isArray(res)) {			 
			   			 
			  setpurchasegrpList(res);			 
			}
		  })
		  .catch((error) => {
			//console.error("Error:", error);
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
	// const handleAddClick = () => {
		
	// 	//console.log("post", inputOrgGrpList);
	// 	setinputOrgGrpList([
	// 		...inputOrgGrpList,
	// 		{ id: 0, orgMstId: 0, groupName: "" },
	// 		// { id: 0, orgId: 0,orgGroupId: 0,eventType:"",stageId:0},
	// 	]);
	// };
	const handleAddorganisationClick = () => {
		
		setInputList([...inputList,
			{
			orgId:null,
			orgPurchGroup:[]}
			  
	]);
	}
	// const handleAddClick = () => {

	
	// 	const newOrgGroup = {
	// 		id: 0,
	// 		eventType: "",
	// 		orgId: 0,
	// 		orgName: "",
	// 		orgGroupId: 0,
	// 		orgGroupName: "",
	// 		stageId: 0
	// 	};
	
	
	// 	setinputOrgGrpList([
	// 		...inputOrgGrpList,
	// 		newOrgGroup
	// 	]);
	// };
	
	const handleAssign = (index, selectedValues) => {
		
		// Create a copy of the inputOrgGrpList
		const updatedList = [];
	     
		// Iterate over selectedValues (assuming selectedValues is an array of objects)
		selectedValues?.forEach((selectedValue, i) => { 			
			// Assuming index + i is within bounds of updatedList, update each item
			if (updatedList[index + i]) {
				updatedList[index + i]["orgId"] = selectedValue.orgMstId;
				updatedList[index + i]["eventType"] = eventType; // Assuming eventType is defined elsewhere
				updatedList[index + i]["stageId"] = StageId; // Assuming StageId is defined elsewhere
				updatedList[index + i]["orgGroupId"] = selectedValue.id;
				updatedList[index + i]["orgGroupName"] = selectedValue.groupName;
					
			}
			//index++;
		});

		const udpatefinalist = [
			...inputOrgGrpList,
			...updatedList
		];
		 

		
		setinputOrgGrpList(udpatefinalist);
		// Update state with the updated list
		
	
		// Example function call to get additional data based on selectedValue
		getPurchasegrplist(selectedValues[0]?.orgMstId); // You might need to adjust this based on your specific logic
		console.log("Updated inputOrgGrpList: ", updatedList);
	};
	
	const handleEmailModalClose = useCallback(() => {	
		
		setModal(false)
		setShow(false)
	},[])

	const [selectedSequenceType, setSelectedSequenceType] = useState(null);

	// Options for the autocomplete
	const options = ['Anyone', 'Everyone'];
  
	// Handler for when the selection changes
	const handleSequenceTypeChange = (event, newValue) => {
	  setSelectedSequenceType(newValue);
	};
	// const handleDeleteUser = (seqno) => {
	// 	setapproverseq((prevApprovers) =>
	// 	  prevApprovers.filter((user) => user.seqno !== seqno)
	// 	);
	//   };
	const handleDeleteUser = (seqno) => {
		setapproverseq((prevApprovers) => {
			// Remove the user
			const updatedApprovers = prevApprovers.filter((user) => user.seqno !== seqno);
			return updatedApprovers.map((user, index) => {
				user.seqno = index + 1; // Set the new sequence number
				return user;
			});
		});
	};
	
	  const [dialoguserdesignationOpen, setdialoguserdesignationOpen] = useState(false);
	  const [pendingChange, setPendingChange] = useState("");
	  
	 
	  const handleApproverTypeChange = (event) => {
		
		const newApproverType = event?.target?.value;
	
		if ((approverType === "U" && newApproverType === "R") || (approverType === "R" && newApproverType === "U")) {
		  setPendingChange(newApproverType); 
		  setdialoguserdesignationOpen(true);
		} else {
		  setapproverType(newApproverType);
		}
	  };
	  const processDialogDecision = (confirm) => {
		setdialoguserdesignationOpen(false);
		
		if (confirm) {
		  if (approverType === "U" && pendingChange === "R") {
		
			setapproverType("R");
			setTableItem([]); 
			
		  } else if (approverType === "R" && pendingChange === "U") {
			
			setapproverType("U");
			setapproverseq([]); 
		  }
		}
		
		setPendingChange("");
	  };

	  const handleDragStart = (e, index) => {
		e.dataTransfer.setData('draggedIndex', index);
	  };
	
	  const handleDragOver = (e) => {
		e.preventDefault(); // Allow drop
	  };
	
	  const handleDrop = (e, dropIndex) => {
		e.preventDefault();
		const draggedIndex = e.dataTransfer.getData('draggedIndex');
		const draggedItem = approverseq[draggedIndex];
		
		// Remove the dragged item from its original position
		const newItems = approverseq.filter((_, index) => index !== parseInt(draggedIndex, 10));
	
		// Insert the dragged item into the new position
		newItems.splice(dropIndex, 0, draggedItem);
	  
		// Update sequence numbers
		const updatedItems = newItems.map((item, index) => ({
		  ...item,
		  seqno: index + 1,
		}));
	
		// Update state
		setapproverseq(updatedItems);
	  };

	//   const processDialogDecision = (confirm) => {
	// 	setdialoguserdesignationOpen(false);
	// 	if (confirm) {
	// 	  if (approverType === "U" && pendingChange === "R") {
	// 		setapproverType("R");
	// 		setTableItem([]); 
			
	// 	  } else if (approverType === "R" && pendingChange === "U") {
	// 		setapproverType("U");
	// 		setapproverseq([]); 
	// 	  }
	// 	}
	// 	setPendingChange("");
	//   };
	 
	  

	return (
		<>
			<style>
				{`
					.approver-row .delete-btn {
						opacity: 1 !important;
					}
					.table-responsive {
						overflow-x: visible !important;
					}
				`}
			</style>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				{/* Basic Information Section */}
				<div className="row mb-4">
					<div className="col-12">
						<div className="bg-white p-3 border rounded" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
							<div className="row">
								<div className="col-12 col-md-5 col-lg-5 mb-3">
									<TextField
										id="eventType"
										className="w-100"
										InputLabelProps={{ shrink: true }}
										select
										label="Event Type *"
										name="eventType"
										variant="outlined"
										size="small"
										value={eventType}
										onChange={(event, newvalue) => {
											onchangeEventType(event, newvalue);
										}}
										disabled={!editYN} 
									>
										{MenuMasterList &&
											MenuMasterList?.map((option, i) => (
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
									</TextField>
									{formik.errors.eventType && formik.touched.eventType && (
										<div className="error error-red" style={{ fontSize: "9px" }}>
											{formik.errors.eventType}
										</div>
									)}
								</div>
								<div className="col-12 col-md-5 col-lg-5 mb-3">
									<TextFieldCell
										id="stageName"
										name="stageName"
										label="Stage Name *"
										value={stageName}
										inputProps={{ maxLength: 100 }}
										InputProps={{
										  endAdornment: (
											<InputAdornment position="end">
											  <Typography variant="body2" color="textSecondary">
												{stageName?.length}/100
											  </Typography>
											</InputAdornment>
										  ),
										}}
										onChange={handleChange}
										disabled={!editYN} 
									/>
									{formik.errors.stageName && formik.touched.stageName && (
										<div className="error error-red" style={{ fontSize: "9px" }}>
											{formik.errors.stageName}
										</div>
									)}
								</div>
								<div className="col-12 col-md-2 col-lg-2 mb-3">
									<TextFieldCell
										id="stageSeq"
										name="stageSeq"
										label="Stage Sequence*"
										placeholder=""
										value={stageSeq}
										onChange={handlestageSeqChange}
										disabled={!editYN} 
									/>
									{formik.errors.stageSeq && formik.touched.stageSeq && (
										<div className="error error-red" style={{ fontSize: "9px" }}>
											{formik.errors.stageSeq}
										</div>
									)}
								</div>

								{/* Required and Active Toggles */}
								<div className="col-12">
									<div className="d-flex align-items-center justify-content-start gap-4">
										<div className="d-flex align-items-center">
											<span className="f12  me-2" style={{ minWidth: '70px' }}>Required</span>
											<Switch
												name="mandatory"
												id="mandatory"
												checked={mandatory}
												onChange={(e) => {
													setmandatory(e?.target?.checked);
												}}
												disabled={!editYN}
												size="small"
												color="primary"
											/>
										</div>
										<div className="d-flex align-items-center">
											<span className="f12 me-2" style={{ minWidth: '50px' }}>Active</span>
											<Switch
												name="isActive"
												id="isActive"
												checked={isActive}
												onChange={(e) => {
													setisActive(e?.target?.checked);
												}}
												disabled={!editYN}
												size="small"
												color="primary"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			
			

				{/* Card 1: Workflow Configuration */}
				<div className="row mb-4">
					<div className="col-12">
						<div className="card shadow-sm border-0" style={{ borderRadius: '8px' }}>
							<div className="card-body p-4">
								{/* Card Header */}
								

								{/* Action Upon Stage - All in One Row */}
								<div className="mb-4">
									<h6 className="mb-3" style={{ fontWeight: '500', color: '#2d3436' }}>
										Action Upon Stage
									</h6>
									<div className="d-flex align-items-center gap-4 flex-wrap">
										{/* Radio Buttons */}
										<FormControl>
											<RadioGroup
												row
												name="actionType"
												value={actionType}
												onChange={(event, newValue) =>
													handlesActionType(event, newValue)
												}
											>
												<div className="d-flex align-items-center">
													<div className="me-2">
														<HiOutlineMail style={{ fontSize: "18px", color: "#2A68D3" }} />
													</div>
													<FormControlLabel
														value="email"
														control={<Radio size="small" />}
														label={<span className="f12">Email Template</span>}
													/>
												</div>
												<div className="d-flex align-items-center ms-3">
													<div className="me-2">
														<HiOutlineUserGroup style={{ fontSize: "18px", color: "#2A68D3" }} />
													</div>
													<FormControlLabel
														value="workflow"
														control={<Radio size="small" />}
														label={<span className="f12">Set Workflow</span>}
													/>
												</div>
											</RadioGroup>
										</FormControl>

										{/* Workflow Title and Select Workflow in same row */}
										{actionType === "workflow" && (
											<>
												{WorkflowList && WorkflowList.length > 1 ? (
													<div className="d-flex align-items-center gap-2">
														<TextField
															id="wfname"
															name="wfname"
															inputlabelprops={{ shrink: true }}
															select
															label="Select Workflow"
															variant="outlined"
															size="small"
															value={wfid}
															onChange={(event) => {
																pullWorkFlowDataListonChange(event.target.value)
															}}
															disabled={!editYN}
															sx={{ minWidth: 250 }}
														>
															{WorkflowList.map((option, i) => (
																<MenuItem key={i} value={option.id}>
																	{option.wfname} 
																</MenuItem>
															))}
														</TextField>
														{editYN && formik.values.wfId && (
															<IconButton
																color="primary"
																size="small"
																onClick={() => setIsWfEditing(!isWfEditing)}
															>
																<HiPencilAlt/>
															</IconButton>
														)}
													</div>
												) : (
													<TextField
														id="wfname"
														name="wfname"
														label="Workflow Title *"
														variant="outlined"
														size="small"
														value={wfname}
														onChange={(e) => {
															setwfname(e.target.value); 
														}}
														inputProps={{ maxLength: 100 }}
														InputProps={{
															endAdornment: wfname && (
																<InputAdornment position="end">
																	<Typography variant="body2" color="textSecondary">
																		{wfname.length}/100
																	</Typography>
																</InputAdornment>
															),
														}}
														inputlabelprops={{
															shrink: true,
														}}
														sx={{ minWidth: 250 }}
													/>
												)}
											</>
										)}

										{/* Email Template Selection in same row */}
										{actionType === "email" && (
											<div className="d-flex align-items-center gap-2">
												<TextField
													id="emailId"
													name="emailId"
													value={emailId || ""}
													sx={{ minWidth: 250 }}
													InputLabelProps={{ shrink: true }}
													select
													label="Select Email Template"
													variant="outlined"
													size="small"
													displayEmpty
													onChange={(event, newvalue) => {
														onchangeEmailType(event, newvalue);
													}}
													disabled={!editYN} 
												>
													{emaildata && emaildata.length > 0 ? (
														emaildata.map((option, i) => (
															<MenuItem key={i} value={option?.id}>
																{option?.emailevent}
															</MenuItem>
														))
													) : (
														<MenuItem disabled>
															No Email templates available for this Event
														</MenuItem>
													)}
												</TextField>
												{emailId && (
													<>
														<IconButton
															onClick={handleRemove}
															size="small"
															className="text-danger"
															title="Remove Email Template"
														>
															<HiOutlineX size={16} />
														</IconButton>
														<IconButton
															onClick={() => handleShow(emailId)}
															size="small"
															title="Preview Email Template"
															style={{ color: "#405189" }}
														>
															<VisibilityOutlined />
														</IconButton>
													</>
												)}
											</div>
										)}
									</div>
								</div>





								{/* Workflow Rules Section */}
							{/* {actionType === "workflow" && (
  <>
   
    <div className="ms-3" style={{ marginBottom: '12px' }}>
      <div className="d-flex justify-content-between align-items-center">
     
        {WorkflowList && WorkflowList.length > 1 ? (
          <div className="d-flex align-items-center">
            <TextField
              id="wfname"
              name="wfname"
              inputlabelprops={{ shrink: true }}
              select
              label="Select Workflow"
              variant="outlined"
              className="custom-field"
              size="small"
              value={wfid}
              onChange={(event) => {
                pullWorkFlowDataListonChange(event.target.value)
              }}
              disabled={!editYN}
              sx={{ minWidth: 200 }}
            >
              {WorkflowList.map((option, i) => (
                <MenuItem key={i} value={option.id}>
                  {option.wfname}
                </MenuItem>
              ))}
            </TextField>
            {editYN && formik.values.wfId && (
              <IconButton
                color="primary"
                size="small"
                onClick={() => setIsWfEditing(!isWfEditing)}
                sx={{ marginLeft: 1 }}
              >
                <HiPencilAlt />
              </IconButton>
            )}
          </div>
        ) : (
          <TextField
            id="wfname"
            name="wfname"
            label="Workflow Title *"
            variant="outlined"
            size="small"
            value={wfname}
            onChange={(e) => {
              setwfname(e.target.value);
            }}
            inputProps={{ maxLength: 100 }}
            InputProps={{
              endAdornment: wfname && (
                <InputAdornment position="end">
                  <Typography variant="body2" color="textSecondary">
                    {wfname.length}/100
                  </Typography>
                </InputAdornment>
              ),
            }}
            inputlabelprops={{
              shrink: true,
            }}
            sx={{ minWidth: 200 }}
          />
        )}

       
        {(!inputCriteriaList || inputCriteriaList.length === 0) && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddRule}
            startIcon={<AddIcon />}
            size="small"
            style={{
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: '500',
              backgroundColor: '#2A68D3',
              fontSize: '12px'
            }}
          >
            Add Rule
          </Button>
        )}
      </div>
    </div>
  </>
)} */}

							</div>
						</div>
					</div>
				</div>

				{/* CARD 2: Action Upon Approval/Rejection */}
				<div className="row mb-4">
					<div className="col-12">
						<div className="card border-0" style={{ borderRadius: '8px' }}>
							{/* <div className="card-body p-4"> */}
								{/* Card Header */}
							
						{/* Header Configuration - only show when workflow is selected */}
						{actionType === "workflow" && (
						<div className="p-3 rounded mb-4" style={{
							backgroundColor: "white", 
							border: '1px solid #e9ecef',
							borderRadius: '8px',
							boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
						}}>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div className="d-flex align-items-center">
								
									<h6 className="preview-section-heading mb-0">Header Configuration</h6>
								</div>
								<Button
									variant="contained"
									size="small"
									color="primary"
									onClick={handleAddHeader}
									startIcon={<AddIcon />}
									style={{
										borderRadius: '6px',
										textTransform: 'none',
										fontWeight: '500',
										backgroundColor: '#2A68D3',
										boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)'
									}}
								>
									Add Header
								</Button>
							</div>
							
							{/* Header Table - Only show when there are rows */}
							{headerRows.length > 0 && (
								<div className="table-responsive">
									<table className="table  bg-white rounded-default">
										<thead className="bg-grey">
											<tr>
												<th className="content-text text-muted">
													Header Title
												</th>
												<th className="content-text text-muted">
													Header Group
												</th>
												<th className="content-text text-muted">
													Actions
												</th>
											</tr>
										</thead>
										<tbody>
											{headerRows.map((row, index) => (
												<tr key={row.id} className={index % 2 === 0 ? "even" : "odd"}>
													<td>
														<TextField
															select
															size="small"
															variant="outlined"
															value={row.headerTitle}
															onChange={(e) => handleHeaderChange(row.id, 'headerTitle', e.target.value)}
															className="w-100"
														>
															<MenuItem value="">Select Header Title</MenuItem>
															<MenuItem value="Purchase Org">Purchase Org</MenuItem>
															<MenuItem value="Purchase Group">Purchase Group</MenuItem>
														</TextField>
													</td>
													<td>
														<TextField
															select
															size="small"
															variant="outlined"
															value={row.headerGroup}
															onChange={(e) => handleHeaderChange(row.id, 'headerGroup', e.target.value)}
															className="w-100"
															disabled={!row.headerTitle}
														>
															<MenuItem value="">Select Header Group</MenuItem>
															{getHeaderGroupOptions(row.headerTitle).map((option) => (
																<MenuItem key={option.id} value={option.id}>
																	{option.name}
																</MenuItem>
															))}
														</TextField>
													</td>
													<td className="text-center">
														<IconButton
															onClick={() => handleRemoveHeader(row.id)}
															size="small"
															className="text-danger"
														>
															<HiOutlineX size={16} />
														</IconButton>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
						)} {/* End Header Configuration conditional */}
					{/* </div> */}

					{/* Rule Section - only show when workflow is selected */}
					{actionType === "workflow" && (
						<> <div className="col-12 mb-3">
						<div className="bg-white p-3 rounded shadow-sm" style={{
							backgroundColor: "white", 
							border: '1px solid #e9ecef', 
							borderRadius: '8px',
							boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
						}}>
							{/* Header */}
							<div className="d-flex justify-content-between align-items-center mb-3">
								<div className="d-flex align-items-center">
								
									<div>
										<h6 className="preview-section-heading mb-0" style={{ fontSize: '14px' }}>
											Workflow Rules
										</h6>
										<div className="content-text" style={{ color: '#636e72', fontSize: '11px' }}>
											Define conditions and sequences for this stage
										</div>
									</div>
								</div>
								{(!inputCriteriaList || inputCriteriaList.length === 0) && (
									<Button
										variant="contained"
										color="primary"
										onClick={handleAddRule}
										startIcon={<AddIcon />}
										size="small"
										style={{
											borderRadius: '6px',
											textTransform: 'none',
											fontWeight: '500',
											backgroundColor: '#2A68D3',
											boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)',
											fontSize: '12px'
										}}
									>
										Add New Rule
									</Button>
								)}
							</div>
							
							{/* Rule Section Content */}
							{(!inputCriteriaList || inputCriteriaList.length === 0) ? (
								<div className="text-center py-3" style={{
									backgroundColor: '#f8f9fb',
									borderRadius: '6px',
									border: '1px dashed #a29bfe'
								}}>
									<div style={{
										width: '40px',
										height: '40px',
										backgroundColor: '#e17055',
										borderRadius: '50%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										margin: '0 auto 12px'
									}}>
										<HiOutlineDocumentText style={{ fontSize: '20px', color: 'white' }} />
									</div>
									<Typography 
										variant="h6" 
										className="mb-1"
										style={{ fontWeight: '500', color: '#2d3436', fontSize: '14px' }}
									>
										No Rules Defined
									</Typography>
									<Typography variant="body2" className="mb-2" style={{ maxWidth: '300px', margin: '0 auto 16px', color: '#636e72', fontSize: '12px' }}>
										Create your first rule to get started with workflow automation.
									</Typography>
								</div>
							) : (
								<>

									{/* Rule Tabs */}
									<div style={{ marginBottom: '12px' }}>
										<div 
											className="d-flex align-items-center" 
											style={{
												borderBottom: '1px solid #e9ecef', 
												paddingBottom: '8px',
												backgroundColor: 'white',
												borderRadius: '6px',
												padding: '8px 12px'
											}}
										>
											{getRulesForTabs().map((rule, index) => (
												<div key={rule.id} className="d-flex align-items-center me-2">
													<div
														className={`cursor-pointer position-relative`}
														style={{
															border: activeRuleIndex === rule.index ? '1px solid #2A68D3' : '1px solid #e9ecef',
															borderRadius: '6px',
															cursor: 'pointer',
															minWidth: '70px',
															textAlign: 'center',
															fontSize: '11px',
															fontWeight: activeRuleIndex === rule.index ? '600' : '500',
															backgroundColor: activeRuleIndex === rule.index ? '#f0f8ff' : '#f8f9fb',
															color: activeRuleIndex === rule.index ? '#2A68D3' : '#636e72',
															transition: 'all 0.2s ease',
															padding: '6px 12px',
															boxShadow: activeRuleIndex === rule.index ? '0 1px 3px rgba(42, 104, 211, 0.2)' : 'none'
														}}
														onClick={() => handleRuleClick(rule.index)}
													>
														<div className="d-flex align-items-center justify-content-center">
															<HiOutlineDocumentText 
																style={{ 
																	fontSize: '10px', 
																	marginRight: '3px',
																	color: activeRuleIndex === rule.index ? '#2A68D3' : '#6c757d'
																}} 
															/>
															{rule.ruleName}
														</div>
														<IconButton 
															size="small" 
															color="error"
															onClick={(e) => {
																e.stopPropagation();
																handleRemoveRule(rule.index);
															}}
															sx={{ 
																position: 'absolute',
																top: '-6px',
																right: '-6px',
																width: '14px',
																height: '14px',
																backgroundColor: '#dc3545',
																color: 'white',
																border: '1px solid white',
																'&:hover': {
																	backgroundColor: '#c82333'
																},
																fontSize: '8px'
															}}
														>
															<HiOutlineX style={{ fontSize: '6px' }} />
														</IconButton>
													</div>
												</div>
											))}
											<div className="d-flex align-items-center ms-2">
											<IconButton
  size="small"
  style={{
    border: '1px dashed #1976d2',
    borderRadius: '6px',
    width: '28px',
    height: '28px',
    backgroundColor: 'white',
    color: '#1976d2',
    transition: 'all 0.2s ease'
  }}
  onClick={handleAddRule}
  onMouseEnter={(e) => {
    const target = e.currentTarget;
    target.style.backgroundColor = '#e3f2fd';
    target.style.transform = 'scale(1.05)';
  }}
  onMouseLeave={(e) => {
    const target = e.currentTarget;
    target.style.backgroundColor = 'white';
    target.style.transform = 'scale(1)';
  }}
  title="Add New Rule"
>
  <HiPlus style={{ fontSize: '16px' }} />
</IconButton>

											</div>
										</div>
								</div>

									{/* Conditions Section */}
									{inputCriteriaList && inputCriteriaList.length > 0 && (
										<div className="mb-2">
											{/* Conditions Header */}
											<div style={{
												backgroundColor: 'white',
												borderRadius: '6px',
												padding: '10px',
												border: '1px solid #e9ecef',
												marginBottom: '10px',
												boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
											}}>
												<div className="d-flex justify-content-between align-items-center">
													<div className="d-flex align-items-center">
													
														<div>
															<h6 className="mb-0" style={{ 
																fontWeight: "500", 
																color: "#2d3436",
																fontSize: '13px'
															}}>
																Workflow Conditions
															</h6>
															<Typography variant="caption" style={{ color: '#636e72', fontSize: '10px' }}>
																Define when this rule should be applied
															</Typography>
														</div>
													</div>
													<Button
														variant="outlined"
														size="small"
														onClick={handleAddCondition}
														startIcon={<AddIcon />}
														style={{
															borderRadius: '4px',
															textTransform: 'none',
															fontWeight: '500',
															fontSize: '11px',
															padding: '4px 8px'
														}}
													>
														Add Condition
													</Button>
												</div>
											</div>
											
											{/* Enhanced Conditions Display */}
											{inputCriteriaList && inputCriteriaList.length > 0 ? (
												<div style={{
													backgroundColor: 'white',
													padding: '15px',
													border: '1px solid #e0e7ff',
													borderRadius: '8px',
													boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
												}}>
													{/* Show conditions for the active rule only */}
													{(() => {
														const x = inputCriteriaList[activeRuleIndex];
														
														if (!x) return (
															<div className="text-center py-3" style={{
																backgroundColor: '#f8fafc',
																borderRadius: '6px',
																border: '2px dashed #cbd5e1'
															}}>
																<HiOutlineExclamationCircle style={{ fontSize: '36px', color: '#94a3b8', marginBottom: '8px' }} />
																<Typography variant="body2" color="textSecondary" style={{ fontWeight: '500', fontSize: '12px' }}>
																	No conditions defined for this rule yet.
																</Typography>
																<Typography variant="caption" color="textSecondary" style={{ fontSize: '10px' }}>
																	Click "Add Condition" to get started.
																</Typography>
															</div>
														);

														return (
															<div>
																{x.workFlowRules && x.workFlowRules.length > 0 && (
																	<div className="d-flex align-items-start">
																		<div className="table-responsive" style={{ width: '100%' }}>
																			<table className="table table-sm " style={{
																				backgroundColor: 'white',
																				borderRadius: '8px',
																				overflow: 'hidden',
																				boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
																				fontSize: '12px'
																			}}>
																				<thead style={{
																					background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
																					borderBottom: '2px solid #e2e8f0'
																				}}>
																					<tr>
																						<th style={{ 
  width: '30%',
  fontWeight: '400',
  fontSize: '12px',
  padding: '10px'
}}>
  Field
</th>

																					<th style={{ 
  width: '25%',
  fontWeight: '400',
  fontSize: '12px',
  padding: '10px'
}}>
  Operator
</th>

																					<th style={{ 
  width: '35%',
  fontWeight: '400',
  fontSize: '12px',
  padding: '10px'
}}>
  Value
</th>

																						<th style={{ 
																							width: '10%',
																							textAlign: 'center',
																							padding: '12px'
																						}}>
																							<HiOutlineTrash style={{ fontSize: '14px', color: '#94a3b8' }} />
																						</th>
																					</tr>
																				</thead>
																				<tbody>
																				{x.workFlowRules.map((rule, i) => (
																					<tr key={i} style={{
																						backgroundColor: i % 2 === 0 ? '#fafbfc' : 'white',
																						borderBottom: '1px solid #e2e8f0',
																						transition: 'all 0.2s ease'
																					}}
																					onMouseEnter={(e) => {
																						e.currentTarget.style.backgroundColor = '#f0f8ff';
																					}}
																					onMouseLeave={(e) => {
																						e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#fafbfc' : 'white';
																					}}>
																						<td style={{ padding: '10px', verticalAlign: 'middle', position: 'relative' }}>
  <div style={{ position: 'relative' }}>
    <Autocomplete
      id={`tableColumnName-${activeRuleIndex}-${i}`}
      value={gettablecolumnDefault(rule.tableColumnName)}
      options={i === 0 ? RulesList : RulesList.filter(option => option.columN_NAME !== "stage")}
      getOptionLabel={(option) => getConditionDisplayName(option?.columN_NAME) || ''}
      isOptionEqualToValue={(option, value) => option?.columN_NAME === value?.columN_NAME}
      onChange={(event, newvalue) => handleRulesChange(activeRuleIndex, i, newvalue)}
      disabled={i === 0}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          placeholder={i === 0 ? "Stage (Fixed)" : "Select field"}
          style={{
            width: '100%',
            height: '36px',
            backgroundColor: i === 0 ? '#f1f5f9' : 'white',
            borderRadius: '4px',
            fontSize: '12px',
          }}
          InputProps={{
            ...params.InputProps,
            style: { 
              backgroundColor: i === 0 ? '#f1f5f9' : 'white',
              borderRadius: '4px',
              border: i === 0 ? '1px solid #cbd5e1' : '1px solid #d1d5db',
              fontSize: '12px',
              height: '36px',
              padding: '0 8px'
            }
          }}
        />
      )}
    />
    {i === 0 && (
      <Typography 
        variant="caption" 
        style={{ 
          color: '#64748b', 
          fontSize: '9px',
          position: 'absolute',
          top: '90%',
          left: 0,
          marginTop: '2px'
        }}
      >
        Auto-set
      </Typography>
    )}
  </div>
</td>

																						{/* <td style={{ padding: '12px', verticalAlign: 'middle' }}>
																							<Autocomplete
																								id={`tableColumnName-${activeRuleIndex}-${i}`}
																								value={gettablecolumnDefault(rule.tableColumnName)}
																								options={i === 0 ? RulesList : RulesList.filter(option => option.columN_NAME !== "stage")}
																								getOptionLabel={(option) => getConditionDisplayName(option?.columN_NAME) || ''}
																								isOptionEqualToValue={(option, value) => option?.columN_NAME === value?.columN_NAME}
																								onChange={(event, newvalue) => handleRulesChange(activeRuleIndex, i, newvalue)}
																								disabled={i === 0}
																								renderInput={(params) => (
																									<TextField
																										{...params}
																										variant="outlined"
																										size="small"
																										placeholder={i === 0 ? "Stage (Fixed)" : "Select field"}
																										style={{
																											width: '100%',
																											height: '40px',
																											backgroundColor: i === 0 ? '#f1f5f9' : 'white',
																											borderRadius: '6px'
																										}}
																										InputProps={{
																											...params.InputProps,
																											style: { 
																												backgroundColor: i === 0 ? '#f1f5f9' : 'white',
																												borderRadius: '6px',
																												border: i === 0 ? '1px solid #cbd5e1' : '1px solid #d1d5db',
																												fontSize: '12px',
																												height: '40px',
																												padding: '0 12px'
																											}
																										}}
																									/>
																								)}
																							/>
																							{i === 0 && (
																								<Typography variant="caption" style={{ 
																									color: '#64748b', 
																									fontSize: '9px',
																									marginTop: '2px',
																									display: 'block'
																								}}>
																									Auto-set
																								</Typography>
																							)}
																						</td> */}
																						<td style={{ padding: '12px', verticalAlign: 'middle' }}>
																					<TextField
  select
  size="small"
  variant="outlined"
  value={rule.characterEntity || ''}
  onChange={(event) => handlecharacterChange(activeRuleIndex, i, event)}
  className="w-100"
  disabled={i === 0}
  style={{
    height: '36px',
    backgroundColor: i === 0 ? '#f1f5f9' : 'white',
    borderRadius: '4px',
    fontSize: '12px'
  }}
  InputProps={{
    style: {
      backgroundColor: i === 0 ? '#f1f5f9' : 'white',
      borderRadius: '4px',
      border: i === 0 ? '1px solid #cbd5e1' : '1px solid #d1d5db',
      fontSize: '12px',
      height: '36px',
      padding: '6px 8px'
    }
  }}
>
																								<MenuItem value="0">
																									<div className="d-flex align-items-center">
																										<span style={{ fontWeight: '600', marginRight: '8px' }}>=</span>
																										<span style={{ fontSize: '12px', color: '#64748b' }}>Equals</span>
																									</div>
																								</MenuItem>
																								<MenuItem value="1">
																									<div className="d-flex align-items-center">
																										<span style={{ fontWeight: '600', marginRight: '8px' }}>≠</span>
																										<span style={{ fontSize: '12px', color: '#64748b' }}>Not equals</span>
																									</div>
																								</MenuItem>
																								<MenuItem value="2">
																									<div className="d-flex align-items-center">
																										<span style={{ fontWeight: '600', marginRight: '8px' }}>&lt;</span>
																										<span style={{ fontSize: '12px', color: '#64748b' }}>Less than</span>
																									</div>
																								</MenuItem>
																								<MenuItem value="3">
																									<div className="d-flex align-items-center">
																										<span style={{ fontWeight: '600', marginRight: '8px' }}>≤</span>
																										<span style={{ fontSize: '12px', color: '#64748b' }}>Less than or equal</span>
																									</div>
																								</MenuItem>
																								<MenuItem value="4">
																									<div className="d-flex align-items-center">
																										<span style={{ fontWeight: '600', marginRight: '8px' }}>&gt;</span>
																										<span style={{ fontSize: '12px', color: '#64748b' }}>Greater than</span>
																									</div>
																								</MenuItem>
																								<MenuItem value="5">
																									<div className="d-flex align-items-center">
																										<span style={{ fontWeight: '600', marginRight: '8px' }}>≥</span>
																										<span style={{ fontSize: '12px', color: '#64748b' }}>Greater than or equal</span>
																									</div>
																								</MenuItem>
																							</TextField>
																						</td>
																						<td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
																							{shouldUseDropdown(rule.tableColumnName) ? (
																								<TextField
																									select
																									size="small"
																									variant="outlined"
																									value={rule.values || ''}
																									onChange={(event) => handleRuleValueChange(activeRuleIndex, i, event)}
																									className="w-100"
																									placeholder={`Select ${getConditionDisplayName(rule.tableColumnName)}`}
																									style={{
																										backgroundColor: 'white',
																										borderRadius: '4px'
																									}}
																									InputProps={{
																										style: { 
																											backgroundColor: 'white',
																											borderRadius: '4px',
																											border: '1px solid #d1d5db',
																											fontSize: '12px',
																											padding: '6px 8px'
																										}
																									}}
																								>
																									<MenuItem value="">
																										<em>Select {getConditionDisplayName(rule.tableColumnName)}</em>
																									</MenuItem>
																									{getDropdownOptions(rule.tableColumnName).map((option) => (
																										<MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
																											{getOptionLabel(rule.tableColumnName, option)}
																										</MenuItem>
																									))}
																								</TextField>
																							) : (
																								<TextField
																									size="small"
																									variant="outlined"
																									value={
																										rule.tableColumnName === "stage" && i === 0 
																											? stageName || rule.textValue || '' 
																											: rule.tableColumnName === "stage" 
																												? rule.textValue || rule.values || ''
																												: rule.values || ''
																									}
																									onChange={(event) => handleRuleValueChange(activeRuleIndex, i, event)}
																									style={{
																										width: '100%',
																										height: '40px',
																										backgroundColor: (rule.tableColumnName === "stage" && i === 0) ? '#f1f5f9' : 'white',
																										borderRadius: '6px'
																									}}
																									placeholder={rule.tableColumnName === "stage" ? "Stage name" : "Enter value"}
																									disabled={rule.tableColumnName === "stage" && i === 0}
																									InputProps={{
																										style: { 
																											backgroundColor: (rule.tableColumnName === "stage" && i === 0) ? '#f1f5f9' : 'white',
																											borderRadius: '6px',
																											border: (rule.tableColumnName === "stage" && i === 0) ? '1px solid #cbd5e1' : '1px solid #d1d5db',
																											fontSize: '12px',
																											height: '40px',
																											padding: '0 12px'
																										}
																									}}
																								/>
																							)}
																						</td>
																						<td style={{ padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle' }}>
																							<IconButton 
																								size="small" 
																								onClick={() => {
																									// Prevent deletion of first stage condition only
																									if (rule.tableColumnName === "stage" && i === 0) {
																										toast.warning("First stage condition cannot be deleted.", {
																											autoClose: 2000,
																										});
																										return;
																									}
																									const updatedList = [...inputCriteriaList];
																									updatedList[activeRuleIndex].workFlowRules.splice(i, 1);
																									setinputCriteriaList(updatedList);
																								}}
																								style={{ 
																									opacity: (rule.tableColumnName === "stage" && i === 0) ? 0.3 : 1,
																									backgroundColor: (rule.tableColumnName === "stage" && i === 0) ? '#f8fafc' : '#fee2e2',
																									border: (rule.tableColumnName === "stage" && i === 0) ? '1px solid #e2e8f0' : '1px solid #fecaca',
																									zIndex: 1,
																									width: '28px',
																									height: '28px',
																									color: (rule.tableColumnName === "stage" && i === 0) ? '#94a3b8' : '#dc2626',
																									cursor: (rule.tableColumnName === "stage" && i === 0) ? 'not-allowed' : 'pointer',
																									borderRadius: '6px',
																									transition: 'all 0.2s ease'
																								}}
																								title={(rule.tableColumnName === "stage" && i === 0) ? "First stage condition cannot be deleted" : "Remove condition"}
																								disabled={rule.tableColumnName === "stage" && i === 0}
																								onMouseEnter={(e) => {
																									if (!(rule.tableColumnName === "stage" && i === 0)) {
																										e.target.style.backgroundColor = '#dc2626';
																										e.target.style.color = 'white';
																										e.target.style.transform = 'scale(1.1)';
																									}
																								}}
																								onMouseLeave={(e) => {
																									if (!(rule.tableColumnName === "stage" && i === 0)) {
																										e.target.style.backgroundColor = '#fee2e2';
																										e.target.style.color = '#dc2626';
																										e.target.style.transform = 'scale(1)';
																									}
																								}}
																							>
																								<HiOutlineX size={14} />
																							</IconButton>
																						</td>
																					</tr>
																				))}
																			</tbody>
																		</table>
																	</div>
																</div>
															)}

															</div>
														);
													})()}
												</div>
											) : (
												<div className="text-center py-4" style={{
													backgroundColor: '#f8fafc',
													borderRadius: '8px',
													border: '2px dashed #cbd5e1'
												}}>
													<HiOutlineExclamationCircle style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '12px' }} />
													<Typography variant="body2" color="textSecondary" style={{ fontWeight: '500' }}>
														No conditions added yet.
													</Typography>
													<Typography variant="caption" color="textSecondary">
														Click "Add Condition" to start defining rules.
													</Typography>
												</div>
											)}
										</div>
									)}

									{/* Approver Section */}
									{inputCriteriaList && inputCriteriaList.length > 0 && (
										<div className="mb-3">
											{/* Approver Header */}
											<div style={{
												backgroundColor: 'white',
												borderRadius: '8px',
												padding: '12px',
												border: '1px solid #e9ecef',
												marginBottom: '12px',
												boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
											}}>
												<div className="d-flex justify-content-between align-items-center">
													<div className="d-flex align-items-center">
													
														<div>
															<h6 className="mb-0" style={{ 
																fontWeight: "500", 
																color: "#2d3436",
																fontSize: '14px'
															}}>
																Approval Workflow
															</h6>
															<Typography variant="caption" style={{ color: '#636e72', fontSize: '11px' }}>
																Configure who needs to approve requests
															</Typography>
														</div>
													</div>
													<div className="d-flex align-items-center gap-3">
														<FormControlLabel
															control={
																<Switch 
																	size="small" 
																	color="success" 
																	checked={copyApproversToAllRules} 
																	onChange={(e) => {
																		if (e.target.checked) {
																			// Check if current rule has approvers
																			const currentRule = inputCriteriaList[activeRuleIndex];
																			const hasExistingApprovers = currentRule?.wfapproverusers?.length > 0;
																			const otherRulesCount = inputCriteriaList.length - 1;
																			
																			let message = "This will enable automatic copying of approvers to all rules.\n\n";
																			
																			if (hasExistingApprovers) {
																				message += `• Immediately copy ${currentRule.wfapproverusers.length} existing approver(s) from the current rule to ${otherRulesCount} other rule(s)\n\n`;
																			}
																			
																			message += "• Any new approvers you add to this rule will automatically be copied to all other rules";
																			
																			const onConfirm = () => {
																				setCopyApproversToAllRules(true);
																				
																				// If there are existing approvers, copy them immediately
																				if (hasExistingApprovers) {
																					currentRule.wfapproverusers.forEach(approver => {
																						handleCopyApproversToAllRules(approver);
																					});
																				}
																			};
																			
																			showConfirmationDialog(
																				"Copy Approvers to All Rules",
																				message,
																				onConfirm
																			);
																		} else {
																			// Allow disabling without confirmation
																			setCopyApproversToAllRules(false);
																		}
																	}} 
																/>
															}
															label={
																<span style={{ fontSize: '12px', fontWeight: '500', color: '#495057' }}>
																	Sync to All Rules
																</span>
															}
														/>
														<Button
															variant="outlined"
															size="small"
															onClick={handleAddApprover}
															startIcon={<AddIcon />}
															style={{
																borderRadius: '4px',
																textTransform: 'none',
																fontWeight: '500'
															}}
														>
															Add Approver
														</Button>
													</div>
												</div>
											</div>
											
											{/* Approver Table */}
											<div style={{
												backgroundColor: 'white',
												borderRadius: '8px',
												border: '1px solid #e9ecef',
												boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
											}}>
												<div className="table-responsive" style={{ position: 'relative' }}>
													<table className="table mb-0">
														<thead style={{
															backgroundColor: '#f8f9fb',
															borderBottom: '2px solid #e2e8f0'
														}}>
															<tr>
																<th style={{ 
																	width: '80px',
																	fontWeight: '400', 
																	
																	fontSize: '12px',
																	padding: '10px'
																}}>
																	Sequence
																</th>
																<th style={{ 
																	width: '140px',
																	fontWeight: '400', 
																	
																	fontSize: '12px',
																	padding: '10px'
																}}>
																	<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
																		<HiOutlineUserGroup style={{ fontSize: '14px' }} />
																		Type
																	</div>
																</th>
																<th style={{ 
																	fontWeight: '400', 
																	
																	fontSize: '12px',
																	padding: '10px'
																}}>
																	Approver Details
																</th>
																<th style={{ 
																	width: '130px', 
																	textAlign: 'center',
																	fontWeight: '400', 
																	
																	fontSize: '12px',
																	padding: '10px'
																}}>
																	Selection Mode
																</th>
																<th style={{ 
																	width: '50px',
																	textAlign: 'center',
																	padding: '10px 8px'
																}}>
																	<HiOutlineTrash style={{ fontSize: '14px', color: '#6c757d' }} />
																</th>
															</tr>
														</thead>
														<tbody>
														{/* Existing approvers */}
														{getActiveRuleData()?.approvers?.map((approver, index) => (
															<tr key={approver.id || index} style={{ position: 'relative' }} className="approver-row">
																<td style={{ width: '80px', padding: '10px' }}>
																	<TextField
																		size="small"
																		type="number"
																		value={approver.sequence || index + 1}
																		onChange={(e) => handleApproverFieldChange(index, 'sequence', e.target.value)}
																		variant="outlined"
																		style={{ maxWidth: '70px' }}
																	/>
																</td>
																<td style={{ padding: '10px' }}>
																	<TextField
																		select
																		size="small"
																		value={approver.designationId ? 'Designation' : 'User'}
																		onChange={(e) => handleApproverTypeChangeInline(index, e.target.value)}
																		variant="outlined"
																		className="w-100"
																	>
																		<MenuItem value="User">User</MenuItem>
																		<MenuItem value="Designation">Designation</MenuItem>
																	</TextField>
																</td>
																<td>
																	<Autocomplete
																		multiple
																		size="small"
																		options={approver.designationId ? 
																			[{ id: 'select-designation', name: 'Select Designation', isSpecial: true }, ...UserDesignation] : 
																			userOptions
																		}
																		getOptionLabel={(option) => {
																			if (typeof option === 'string') return option;
																			return option.label || option.name || option.designationName || String(option.id || 'Unknown');
																		}}
																		value={approver.selectedUsers || []}
																		onChange={(event, newValue) => {
																			// Check if "Select Designation" was clicked
																			const selectDesignationClicked = newValue.find(item => item.id === 'select-designation');
																			if (selectDesignationClicked) {
																				// Remove the special option and open popup
																				const filteredValue = newValue.filter(item => item.id !== 'select-designation');
																				handleApproverFieldChange(index, 'selectedUsers', filteredValue);
																				handleDesignationIconClick(index); // Pass the approver index
																			} else {
																				handleApproverFieldChange(index, 'selectedUsers', newValue);
																			}
																		}}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				placeholder={approver.designationId ? "Select designations" : "Select users"}
																			/>
																		)}
																		renderOption={(props, option) => (
																			<li {...props} style={{
																				backgroundColor: option.isSpecial ? '#e3f2fd' : 'inherit',
																				fontStyle: option.isSpecial ? 'italic' : 'normal',
																				color: option.isSpecial ? '#1976d2' : 'inherit',
																				borderBottom: option.isSpecial ? '1px solid #e0e0e0' : 'none',
																				fontWeight: option.isSpecial ? '500' : 'normal'
																			}}>
																				{option.isSpecial && <InfoIcon fontSize="small" style={{ marginRight: '8px', color: '#1976d2' }} />}
																				{option.label || option.name || option.designationName || String(option.id || 'Unknown')}
																			</li>
																		)}
																		className="w-100"
																	/>
																</td>
																<td style={{ width: '120px', textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
																	{approver.selectedUsers && approver.selectedUsers.length > 1 ? (
																		<div
																			style={{
																				display: 'inline-flex',
																				border: '1px solid #d0d7de',
																				borderRadius: '6px',
																				overflow: 'hidden',
																				fontSize: '11px',
																				fontWeight: '500',
																				cursor: 'pointer',
																				backgroundColor: '#f6f8fa'
																			}}
																		>
																			<div
																				onClick={() => handleApproverFieldChange(index, 'selectionType', 'Anyone')}
																				style={{
																					padding: '4px 8px',
																					backgroundColor: approver.selectionType === 'Anyone' ? '#0969da' : 'transparent',
																					color: approver.selectionType === 'Anyone' ? 'white' : '#656d76',
																					borderRight: '1px solid #d0d7de',
																					transition: 'all 0.15s ease'
																				}}
																			>
																				Anyone
																			</div>
																			<div
																				onClick={() => handleApproverFieldChange(index, 'selectionType', 'Everyone')}
																				style={{
																					padding: '4px 8px',
																					backgroundColor: approver.selectionType === 'Everyone' ? '#0969da' : 'transparent',
																					color: approver.selectionType === 'Everyone' ? 'white' : '#656d76',
																					transition: 'all 0.15s ease'
																				}}
																			>
																				Everyone
																			</div>
																		</div>
																	) : (
																		<span className="text-muted">-</span>
																	)}
																</td>
																<td style={{ padding: '12px 8px', textAlign: 'center' }}>
																	<IconButton 
																		size="small" 
																		color="error"
																		onClick={() => handleRemoveApprover(approver.id || index)}
																		style={{ 
																			backgroundColor: '#fee2e2',
																			color: '#dc2626',
																			borderRadius: '6px',
																			width: '28px',
																			height: '28px',
																			transition: 'all 0.2s ease'
																		}}
																		onMouseEnter={(e) => {
																			e.currentTarget.style.backgroundColor = '#dc2626';
																			e.currentTarget.style.color = 'white';
																			e.currentTarget.style.transform = 'scale(1.1)';
																		}}
																		onMouseLeave={(e) => {
																			e.currentTarget.style.backgroundColor = '#fee2e2';
																			e.currentTarget.style.color = '#dc2626';
																			e.currentTarget.style.transform = 'scale(1)';
																		}}
																	>
																		<HiOutlineX size={14} />
																	</IconButton>
																</td>
															</tr>
														))}
														
														{/* New approver row - only show when showNewApproverRow is true */}
														{showNewApproverRow && (
															<tr style={{ position: 'relative' }}>
																<td style={{ width: '80px' }}>
																	<TextField
																		size="small"
																		type="number"
																		placeholder="Sequence"
																		value={newApprover.sequence || ''}
																		onChange={(e) => setNewApprover({...newApprover, sequence: e.target.value})}
																		variant="outlined"
																		className="w-100"
																		style={{ maxWidth: '70px' }}
																	/>
																</td>
																<td>
																	<TextField
																		select
																		size="small"
																		value={newApprover.type || 'User'}
																		onChange={(e) => setNewApprover({...newApprover, type: e.target.value, selectedUsers: []})}
																		variant="outlined"
																		className="w-100"
																	>
																		<MenuItem value="User">User</MenuItem>
																		<MenuItem value="Designation">Designation</MenuItem>
																	</TextField>
																</td>
																<td>
																	<Autocomplete
																		multiple
																		size="small"
																		options={newApprover.type === 'Designation' ? 
																			[{ id: 'select-designation', name: 'Select Designation', isSpecial: true }, ...UserDesignation] : 
																			userOptions
																		}
																		getOptionLabel={(option) => {
																			if (typeof option === 'string') return option;
																			return option.label || option.name || option.designationName || String(option.id || 'Unknown');
																		}}
																		value={newApprover.selectedUsers || []}
																		onChange={(event, newValue) => {
																			// Check if "Select Designation" was clicked
																			const selectDesignationClicked = newValue.find(item => item.id === 'select-designation');
																			if (selectDesignationClicked) {
																				// Remove the special option and open popup
																				const filteredValue = newValue.filter(item => item.id !== 'select-designation');
																				setNewApprover({...newApprover, selectedUsers: filteredValue});
																				handleDesignationIconClick(null); // Pass null for new approver row
																			} else {
																				setNewApprover({...newApprover, selectedUsers: newValue});
																			}
																		}}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				placeholder={newApprover.type === 'Designation' ? "Select designations" : "Select users"}
																			/>
																		)}
																		renderOption={(props, option) => (
																			<li {...props} style={{
																				backgroundColor: option.isSpecial ? '#e3f2fd' : 'inherit',
																				fontStyle: option.isSpecial ? 'italic' : 'normal',
																				color: option.isSpecial ? '#1976d2' : 'inherit',
																				borderBottom: option.isSpecial ? '1px solid #e0e0e0' : 'none',
																				fontWeight: option.isSpecial ? '500' : 'normal'
																			}}>
																				{option.isSpecial && <InfoIcon fontSize="small" style={{ marginRight: '8px', color: '#1976d2' }} />}
																				{option.label || option.name || option.designationName || String(option.id || 'Unknown')}
																			</li>
																		)}
																		className="w-100"
																	/>
																</td>
																<td style={{ width: '120px', textAlign: 'center', verticalAlign: 'middle' }}>
																	{newApprover.selectedUsers && newApprover.selectedUsers.length > 1 ? (
																		<div
																			style={{
																				display: 'inline-flex',
																				border: '1px solid #d0d7de',
																				borderRadius: '6px',
																				overflow: 'hidden',
																				fontSize: '11px',
																				fontWeight: '500',
																				cursor: 'pointer',
																				backgroundColor: '#f6f8fa'
																			}}
																		>
																			<div
																				onClick={() => setNewApprover({
																					...newApprover, 
																					selectionType: 'Anyone',
																					sequenceType: 'Anyone' // Also update sequenceType
																				})}
																				style={{
																					padding: '4px 8px',
																					backgroundColor: newApprover.selectionType === 'Anyone' ? '#0969da' : 'transparent',
																					color: newApprover.selectionType === 'Anyone' ? 'white' : '#656d76',
																					borderRight: '1px solid #d0d7de',
																					transition: 'all 0.15s ease'
																				}}
																			>
																				Anyone
																			</div>
																			<div
																				onClick={() => {
																					console.log("Clicked Everyone - setting selectionType and sequenceType to Everyone");
																					setNewApprover({
																						...newApprover, 
																						selectionType: 'Everyone',
																						sequenceType: 'Everyone' // Also update sequenceType
																					});
																				}}
																				style={{
																					padding: '4px 8px',
																					backgroundColor: newApprover.selectionType === 'Everyone' ? '#0969da' : 'transparent',
																					color: newApprover.selectionType === 'Everyone' ? 'white' : '#656d76',
																					transition: 'all 0.15s ease'
																				}}
																			>
																				Everyone
																			</div>
																		</div>
																	) : (
																		<span className="text-muted">-</span>
																	)}
																</td>
																<td style={{ padding: '12px 8px', textAlign: 'center' }}>
																	<div style={{ display: 'flex', gap: '8px' }}>
																		{/* Save button */}
																		<IconButton 
																			size="small" 
																			color="primary"
																			onClick={handleAddNewApprover}
																			style={{ 
																				backgroundColor: '#e3f2fd',
																				color: '#0969da',
																				borderRadius: '6px',
																				width: '28px',
																				height: '28px',
																				transition: 'all 0.2s ease'
																			}}
																			onMouseEnter={(e) => {
																				e.currentTarget.style.backgroundColor = '#0969da';
																				e.currentTarget.style.color = 'white';
																				e.currentTarget.style.transform = 'scale(1.1)';
																			}}
																			onMouseLeave={(e) => {
																				e.currentTarget.style.backgroundColor = '#e3f2fd';
																				e.currentTarget.style.color = '#0969da';
																				e.currentTarget.style.transform = 'scale(1)';
																			}}
																			title="Save approver"
																		>
																			<CheckIcon size={14} />
																		</IconButton>
																		
																		{/* Cancel button */}
																		<IconButton 
																			size="small" 
																			color="error"
																			onClick={handleCancelNewApprover}
																			style={{ 
																				backgroundColor: '#fee2e2',
																				color: '#dc2626',
																				borderRadius: '6px',
																				width: '28px',
																				height: '28px',
																				transition: 'all 0.2s ease'
																			}}
																			onMouseEnter={(e) => {
																				e.currentTarget.style.backgroundColor = '#dc2626';
																				e.currentTarget.style.color = 'white';
																				e.currentTarget.style.transform = 'scale(1.1)';
																			}}
																			onMouseLeave={(e) => {
																				e.currentTarget.style.backgroundColor = '#fee2e2';
																				e.currentTarget.style.color = '#dc2626';
																				e.currentTarget.style.transform = 'scale(1)';
																			}}
																			title="Cancel"
																		>
																			<HiOutlineX size={14} />
																		</IconButton>
																	</div>
																</td>
															</tr>
														)}
														
														{/* Show message when no approvers and no new row */}
														{(!getActiveRuleData()?.approvers || getActiveRuleData()?.approvers.length === 0) && !showNewApproverRow && (
															<tr>
																<td colSpan="4" className="text-center py-3">
																	<Typography variant="body2" color="textSecondary">
																		No approvers added yet. Click "Add Approver" to start.
																	</Typography>
																</td>
															</tr>
														)}
													</tbody>
												</table>
											</div>
										</div>
									</div>
									)}
									
								</>
								
							)}
									{actionType === "workflow" && (
				<div className="col-12 mb-3">
					<div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <div className="mb-0" style={{ fontSize: '14px', fontWeight: '500', color: '#2d3436' }}>
            Action Upon Approval/Rejection
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="col-12 mb-3">
     
         
          <div className="row g-4">
            {/* Email on Approval */}
            <div className="col-md-6">
              <div className="p-3 border">
                <div className="mb-3 fw-medium">Email on Approval</div>
                <div className="d-flex align-items-center">
                  <TextField
                    id="emailApprovalId"
                    name="emailApprovalId"
                    value={emailId || ''}
                    sx={{ flexGrow: 1 }}
                    InputLabelProps={{ shrink: true }}
                    select
                    label="Email Template"
                    variant="outlined"
                    size="small"
                    onChange={onchangeEmailType}
                    disabled={!editYN}
                  >
                    <MenuItem value="">Select Email Template</MenuItem>
                    {emaildata?.length > 0 ? (
                      emaildata.map((option, i) => (
                        <MenuItem key={i} value={option?.id}>
                          {option?.emailevent}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No Email templates available for this Event
                      </MenuItem>
                    )}
                    <MenuItem
                      value="new"
                      className="bggray"
                      style={{
                        color: "blue",
                        fontSize: "13px",
                        fontStyle: "italic",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Add New
                    </MenuItem>
                  </TextField>

                  {emailId && (
                    <>
                      <IconButton onClick={handleRemove} size="small" className="ms-2">
                        <HiOutlineX className="f14 text-danger" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleShow(emailId)}
                        size="small"
                        className="ms-1"
                        style={{ color: "#405189" }}
                      >
                        <VisibilityOutlined />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Email on Rejection */}
            <div className="col-md-6">
              <div className="p-3 border">
                <div className="mb-3 fw-medium">Email on Rejection</div>
                <div className="d-flex align-items-center">
                  <TextField
                    id="rejectedEmailTemplateId"
                    name="rejectedEmailTemplateId"
                    value={rejectedEmailId || ''}
                    sx={{ flexGrow: 1 }}
                    InputLabelProps={{ shrink: true }}
                    select
                    label="Email Template"
                    variant="outlined"
                    size="small"
                    onChange={onchangeEmailRejectType}
                    disabled={!editYN}
                  >
                    <MenuItem value="">Select Email Template</MenuItem>
                    {emaildata?.length > 0 ? (
                      emaildata.map((option, i) => (
                        <MenuItem key={i} value={option?.id}>
                          {option?.emailevent}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        No Email templates available for this Event
                      </MenuItem>
                    )}
                    <MenuItem
                      value="new"
                      className="bggray"
                      style={{
                        color: "blue",
                        fontSize: "13px",
                        fontStyle: "italic",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Add New
                    </MenuItem>
                  </TextField>

                  {rejectedEmailId && (
                    <>
                      <IconButton
                        onClick={handleRemoveReject}
                        size="small"
                        className="ms-2"
                      >
                        <HiOutlineX className="f16 text-danger" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleShow(rejectedEmailId)}
                        size="small"
                        className="ms-1"
                        style={{ color: "#405189" }}
                      >
                        <VisibilityOutlined />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
       
      </div>
    </div>
  </div>
)}
							
						</div>
					</div>


				</>
			)}





					{/* End Rule Section conditional */}
				</div> {/* Close Main Form Card */}
			</div>

				{/* Form Actions */}
				{/* <div className="bg-white rounded-default shadow-sm p-3"> */}
					<div className="col-12 text-end">
						<LoadingButton
							variant="text"
							color="primary"
							className="me-3 text-capitalize"
							size="small"
							onClick={clearfilledstage}
							style={{
								border: 'none',
								backgroundColor: 'transparent'
							}}
						>
							Reset
						</LoadingButton>
						<LoadingButton
							type="submit"
							variant="contained"
							color="primary"
							className="text-capitalize"
							size="small"
							style={{
								border: 'none'
							}}
						>
							Submit
						</LoadingButton>
					</div>
				</div> {/* Close Form Actions */}
			</form>
			
			
			<Modal
				size="lg"
				show={modal}
				backdrop="static"
				centered
				contentClassName="border-0 rounded"
				className="zindex1280"
				backdropClassName="zindex1280"
				onHide={() => CloseModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
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
							handleEmailModalClose={handleEmailModalClose}
						/>
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				size="lg"
				show={show}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => handleClose()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title>
						<div className="d-flex align-items-center f14 text-white">
							Email Template 
						</div>
					</Modal.Title>
					<IconButton onClick={() => handleClose()} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body>
					<AddNewEmailTemplate
						callbackstep={callbackstep}
						callbackStageOpen={openStageModal}
						editRecordData={editRecordData}
						seteditRecordData={seteditRecordData}
						emailId={popUpEmailId}
						preview={true}
						
			handleEmailModalClose={handleEmailModalClose}
					/>
				</Modal.Body>
			</Modal>
			<Modal
				size="lg"
				show={approvershow}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => handleApproverClose()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title>
						<div className="d-flex align-items-center f14 text-white">
							Who Should Approve
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => handleApproverClose()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body>
					<div className="p-3">
						<div className="row mb-3">
							<div className="col-md-6">
								<FormControl component="fieldset">
									<FormLabel component="legend" className="f14 fw-bold">Sequence Type</FormLabel>
									<RadioGroup
										value={approverSeqType}
										onChange={handleapproverSeqType}
										row
									>
										<FormControlLabel value="Sequential" control={<Radio />} label="Sequential" />
										<FormControlLabel value="Parallel" control={<Radio />} label="Parallel" />
									</RadioGroup>
								</FormControl>
							</div>
							<div className="col-md-6">
								<FormControl component="fieldset">
									<FormLabel component="legend" className="f14 fw-bold">Approver Type</FormLabel>
									<RadioGroup
										value={approverType}
										onChange={(e) => setapproverType(e.target.value)}
										row
									>
										<FormControlLabel value="U" control={<Radio />} label="User" />
										<FormControlLabel value="R" control={<Radio />} label="Role" />
									</RadioGroup>
								</FormControl>
							</div>
						</div>

						{approverSeqType === "Sequential" && (
							<div>
								<div className="row mb-3">
									<div className="col-md-4">
										<Autocomplete
											options={UserDepartment}
											getOptionLabel={(option) => option?.name || ""}
											onChange={handleDepartmentChange}
											renderInput={(params) => (
												<TextField {...params} label="Department" variant="outlined" size="small" />
											)}
										/>
									</div>
									<div className="col-md-4">
										<Autocomplete
											options={approverType === "U" ? userOptions : UserDesignation}
											getOptionLabel={(option) => option?.name || ""}
											onChange={(event, value) => {
												setSelectedUsers(value);
											}}
											renderInput={(params) => (
												<TextField {...params} label={approverType === "U" ? "User" : "Designation"} variant="outlined" size="small" />
											)}
										/>
									</div>
									<div className="col-md-4">
										<Button 
											variant="contained" 
											onClick={handleAddUser} 
											size="small"
											style={{
												borderRadius: '6px',
												textTransform: 'none',
												fontWeight: '500',
												backgroundColor: '#2A68D3',
												boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)'
											}}
										>
											Add User
										</Button>
									</div>
								</div>

								{/* Sequential Approvers List */}
								{approverseq.length > 0 && (
									<div className="d-flex align-items-start">
										<div className="table-responsive" style={{ width: 'calc(100% - 50px)' }}>
											<table className="table table-sm table-bordered">
												<thead style={{
													backgroundColor: '#f8f9fb',
													borderBottom: '2px solid #ddd6fe'
												}}>
													<tr>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Sequence</th>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Name</th>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Type</th>
													</tr>
												</thead>
												<tbody>
													{approverseq.map((approver, index) => (
														<tr key={index}>
															<td>
																<TextField
																	size="small"
																	type="number"
																	value={approver.seqno}
																	onChange={(e) => handleInputChange(e, index)}
																	name="seqno"
																	variant="outlined"
																/>
															</td>
															<td>{approver.username}</td>
															<td>{approver.designationId ? 'Role' : 'User'}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
										<div className="d-flex flex-column gap-0" style={{ marginLeft: '10px', marginTop: '48px' }}>
											{approverseq.map((approver, index) => (
												<div key={index} style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
													<IconButton 
														size="small" 
														color="error"
														onClick={() => handleRemoveClick(index)}
														style={{ 
															opacity: 1,
															backgroundColor: 'rgba(255, 255, 255, 0.9)',
															border: '1px solid #dee2e6',
															zIndex: 1,
															width: '28px',
															height: '28px'
														}}
														title="Remove approver"
													>
														<HiOutlineX size={14} />
													</IconButton>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{approverSeqType === "Parallel" && (
							<div>
								{inputListApproval.map((item, index) => (
									<div key={index} className="row mb-3">
										<div className="col-md-2">
											<TextField
												size="small"
												label="Sequence"
												value={item.seqno}
												onChange={(e) => handleSeqApprovalChange("seqno", e.target.value, index)}
												variant="outlined"
											/>
										</div>
										<div className="col-md-3">
											<Autocomplete
												options={UserDepartment}
												getOptionLabel={(option) => option?.name || ""}
												onChange={(event, value) => handleDepartmentApprovalChange(event, value, index)}
												renderInput={(params) => (
													<TextField {...params} label="Department" variant="outlined" size="small" />
												)}
											/>
										</div>
										<div className="col-md-3">
											<Autocomplete
												options={approverType === "U" ? userOptions : UserDesignation}
												getOptionLabel={(option) => option?.name || ""}
												value={item.designation}
												onChange={(event, value) => handleDesinationapprovalChange("designation", value, index)}
												renderInput={(params) => (
													<TextField {...params} label={approverType === "U" ? "User" : "Designation"} variant="outlined" size="small" />
												)}
											/>
										</div>
										<div className="col-md-2">
											<TextField
												select
												size="small"
												label="Type"
												value={item.seqType}
												onChange={(e) => handleSeqApprovalChange("seqType", e.target.value, index)}
												variant="outlined"
												fullWidth
											>
												<MenuItem value="Anyone">Anyone</MenuItem>
												<MenuItem value="Everyone">Everyone</MenuItem>
											</TextField>
										</div>
										<div className="col-md-2">
											<IconButton size="small" color="error" onClick={() => handleDeleteParallel(index)}>
												<HiOutlineX />
											</IconButton>
										</div>
									</div>
								))}
								
								<Button 
									variant="contained" 
									onClick={handleAddUser} 
									size="small" 
									className="mb-3"
									style={{
										borderRadius: '6px',
										textTransform: 'none',
										fontWeight: '500',
										backgroundColor: '#2A68D3',
										boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)'
									}}
								>
									Add User
								</Button>

								{/* Parallel Approvers List */}
								{TableItem.length > 0 && (
									<div className="d-flex align-items-start">
										<div className="table-responsive" style={{ width: 'calc(100% - 50px)' }}>
											<table className="table table-sm table-bordered">
												<thead style={{
													backgroundColor: '#f8f9fb',
													borderBottom: '2px solid #ddd6fe'
												}}>
													<tr>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Sequence</th>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Name</th>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Type</th>
														<th style={{ 
															fontWeight: '600', 
															color: '#2d3436',
															fontSize: '13px',
															padding: '12px'
														}}>Selection</th>
													</tr>
												</thead>
												<tbody>
													{TableItem.map((approver, index) => (
														<tr key={index}>
															<td>{approver.seqno}</td>
															<td>{approver.designation?.name || approver.username || '-'}</td>
															<td>{approver.designationId ? 'Role' : 'User'}</td>
															<td>{approver.seqType || '-'}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
										<div className="d-flex flex-column gap-0" style={{ marginLeft: '10px', marginTop: '48px' }}>
											{TableItem.map((approver, index) => (
												<div key={index} style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
													<IconButton 
														size="small" 
														color="error"
														onClick={() => handleDeleteParallel(index)}
														style={{ 
															opacity: 1,
															backgroundColor: 'rgba(255, 255, 255, 0.9)',
															border: '1px solid #dee2e6',
															zIndex: 1,
															width: '28px',
															height: '28px'
														}}
														title="Remove approver"
													>
														<HiOutlineX size={14} />
													</IconButton>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						<div className="d-flex justify-content-end mt-3">
							<Button variant="outlined" onClick={handleApproverClose} className="me-2">
								Cancel
							</Button>
							<Button 
								variant="contained" 
								onClick={() => handleApproverAdd(inputCriteriaList)}
								disabled={approverSeqType === "Sequential" ? approverseq.length === 0 : TableItem.length === 0}
							>
								Save Approvers
							</Button>
						</div>
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
						<PurchaseOrg selectedPurOrg={PullPurchaseOrganisation} />
					</div>
				</Modal.Body>
			</Modal>
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
				<Dialog
       open={dialogOpen}
	  onClose={() => handleDialogClose(false)}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">Confirm Change</DialogTitle>
      <DialogContent>
        Are you sure you want to change the approver sequence type? You may lose unsaved data.
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleDialogClose(false)}  color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleDialogClose(true)}color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
	<Dialog
  open={dialoguserdesignationOpen}
  onClose={() => processDialogDecision(false)}
  aria-labelledby="confirmation-dialog-title"
  aria-describedby="confirmation-dialog-description"
>
  <DialogTitle id="confirmation-dialog-title">Confirm Change</DialogTitle>
  <DialogContent>
    Are you sure you want to change ? You may lose unsaved data.
  </DialogContent>
  <DialogActions>
    <Button onClick={() => processDialogDecision(false)} color="primary">
      Cancel
    </Button>
    <Button onClick={() => processDialogDecision(true)} color="primary">
      Confirm
    </Button>
  </DialogActions>
</Dialog>
<Dialog
      open={confirmChangeDialogOpen}
      onClose={() => handleConfirmDialogClose(false)}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">Confirm Change</DialogTitle>
      <DialogContent>
        Are you sure you want to change the action? You may lose unsaved data.
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleConfirmDialogClose(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleConfirmDialogClose(true)} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>

		{/* Designation Filter Popup */}
		<Dialog
			open={designationPopupOpen}
			onClose={handleDesignationPopupClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<InfoIcon color="primary" />
					Add Designation to Approver
				</div>
			</DialogTitle>
			<DialogContent>
				<Typography variant="body2" color="textSecondary" style={{ marginBottom: '16px' }}>
					Select the organizational hierarchy to add a specific designation as an approver.
				</Typography>
				<div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
					{/* Legal Entity Dropdown */}
					<Autocomplete
						size="small"
						options={legalEntityOptions}
						getOptionLabel={(option) => option.name || ''}
						value={selectedFilters.legalEntity}
						onChange={(event, newValue) => handleFilterChange('legalEntity', newValue)}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Legal Entity"
								variant="outlined"
								fullWidth
							/>
						)}
					/>

					{/* Business Unit Dropdown */}
					<Autocomplete
						size="small"
						options={businessUnitOptions}
						getOptionLabel={(option) => option.name || ''}
						value={selectedFilters.businessUnit}
						onChange={(event, newValue) => handleFilterChange('businessUnit', newValue)}
						disabled={!selectedFilters.legalEntity}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Business Unit"
								variant="outlined"
								fullWidth
							/>
						)}
					/>

					{/* Department Dropdown */}
					<Autocomplete
						size="small"
						options={departmentOptions}
						getOptionLabel={(option) => option.name || ''}
						value={selectedFilters.department}
						onChange={(event, newValue) => handleFilterChange('department', newValue)}
						disabled={!selectedFilters.businessUnit}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Department"
								variant="outlined"
								fullWidth
							/>
						)}
					/>

					{/* Designation Dropdown */}
					<Autocomplete
						size="small"
						options={designationOptions}
						getOptionLabel={(option) => option.name || ''}
						value={selectedFilters.designation}
						onChange={(event, newValue) => handleFilterChange('designation', newValue)}
						disabled={!selectedFilters.department}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Designation"
								variant="outlined"
								fullWidth
							/>
						)}
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleDesignationPopupClose} color="secondary">
					Cancel
				</Button>
				<Button 
					onClick={handleApplyDesignationFilter} 
					color="primary" 
					variant="contained"
					disabled={!selectedFilters.designation}
				>
					Add Designation
				</Button>
			</DialogActions>
		</Dialog>

		{/* Confirmation Dialog */}
		<Dialog
			open={confirmDialogOpen}
			onClose={handleCopyConfirmDialogClose}
			aria-labelledby="confirmation-dialog-title"
			aria-describedby="confirmation-dialog-description"
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle id="confirmation-dialog-title" sx={{ 
				pb: 1, 
				fontWeight: 600,
				color: '#1976d2'
			}}>
				{confirmDialogData.title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="confirmation-dialog-description" sx={{ 
					whiteSpace: 'pre-line',
					fontSize: '14px',
					lineHeight: 1.6
				}}>
					{confirmDialogData.message}
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button 
					onClick={handleCopyConfirmDialogClose} 
					variant="outlined"
					color="secondary"
					style={{
						borderRadius: '6px',
						textTransform: 'none',
						fontWeight: '500',
						borderColor: '#e9ecef',
						color: '#636e72'
					}}
				>
					Cancel
				</Button>
				<Button 
					onClick={handleCopyConfirmDialogConfirm} 
					variant="contained"
					color="primary"
					autoFocus
					style={{
						borderRadius: '6px',
						textTransform: 'none',
						fontWeight: '500',
						backgroundColor: '#2A68D3',
						boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)'
					}}
				>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>

		</>
	);
};

export default AddEditCellWithWorkFlow;
