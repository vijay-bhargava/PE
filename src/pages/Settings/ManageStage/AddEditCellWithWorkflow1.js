import React, { useState, useEffect, useCallback, useRef } from "react";
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
    HiBriefcase,
    HiFilter,
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
    HiUsers,
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
import { DragIndicator, VisibilityOffOutlined, VisibilityOutlined, ArrowBack } from "@mui/icons-material";
import { api, ApiClient } from "../../../Apiclient";
import { FaPencilAlt } from "react-icons/fa";
import { BackButton } from "../../../utils/common/component";

// Custom Back Button for Stage List
const BackStageButton = ({ onClick, title }) => {
    return (
        <IconButton 
            onClick={onClick} 
            size="small" 
            className="me-2"
           
        >
            <ArrowBack style={{ fontSize: '20px', color: '#495057' }} />
        </IconButton>
    );
};

const AddEditCellWithWorkFlow1 = ({
    callbackstagestep,
    editRecordData,
    seteditRecordData,
    handlestageList,
    editYN,
    purchaseAllList,
    setPurchaseAllList,
    purchasegrpList,
    setpurchasegrpList,
    onCancel
}) => {
    const [{ atoken, rtoken,customersuffix, customerid ,userdetails}, dispatch] = useStateValue();
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
const userSelectRef = useRef(null);

const [inputListApproval, setInputListApproval] = useState([{ seqno: "", users: [], seqType: "" ,designation: ""},]);
const [TableItem, setTableItem] = useState([]);

    // Diagnostic logs to detect undefined components during render
    try {
        console.log('DEBUG typeof AddNewEmailTemplate =', typeof AddNewEmailTemplate);
        console.log('DEBUG typeof Modal =', typeof Modal);
        console.log('DEBUG typeof IconButton =', typeof IconButton);
        console.log('DEBUG typeof TextFieldCell =', typeof TextFieldCell);
    } catch (e) {
        console.error('DEBUG error checking component types', e);
    }

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
        // Immediately populate basic fields that don't depend on API data
        setStageId(editRecordData?.id);
        setstageName(editRecordData?.stageName);
        setstageSeq(editRecordData?.stageSeq);
        seteventType(editRecordData?.eventType);
        setparentId(editRecordData?.parentId);
        setmandatory(editRecordData?.mandatory);
        setisActive(editRecordData?.isActive);
        setemailId(editRecordData?.emailId);
        setrejectedEmailId(editRecordData?.rejectedEmailId);
        setWfid(editRecordData?.wfId);
        formik.setFieldValue("id", editRecordData?.id);
        formik.setFieldValue("wfId", editRecordData?.wfId);
        
        // Set action type based on emailId or wfId
        if (editRecordData?.emailId != null && editRecordData?.emailId > 0) {
            setActionType("email");
        } else if (editRecordData?.wfId > 0) {
            setActionType("workflow");
        } else {
            setActionType(null);
        }
        
        // Fetch dependent data
        pullworkflowNameList(editRecordData?.id);
        if (editRecordData?.eventType) {
            emailDataList(editRecordData?.eventType);
            pullgetrulescolumns(editRecordData?.eventType);
        }
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
                
            }
        }).catch(error => {
            console.error("Error fetching purchase orgs:", error);
        });
        
        // Purchase groups will be loaded when a Purchase Organization is selected
        // Initialize with empty array
        setpurchasegrpList([]);

        // Fetch NFA Project List
        const nfaProjectData = { CustomerId: customerid, IsActive: 'true' };
        getNFAProjectList(nfaProjectData, atoken)
            .then((res) => {
                if (Array.isArray(res)) {
                    setNfaProjectList(res);
                   
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
        if (!Array.isArray(rules) || rules.length === 0) {
            return [];
        }

        // Step 1: Identify common conditions across all rules
        const commonConditions = [];
        if (rules.length > 1 && rules[0].workFlowRules && rules[0].workFlowRules.length > 0) {
            // Get conditions from first rule
            const firstRuleConditions = rules[0].workFlowRules;
            
            // Check which conditions appear in ALL rules with same field and value
            firstRuleConditions.forEach(condition => {
                const isCommon = rules.every(rule => {
                    return rule.workFlowRules && rule.workFlowRules.some(c => 
                        c.tableColumnName === condition.tableColumnName && 
                        c.values === condition.values &&
                        c.characterEntity === condition.characterEntity
                    );
                });
                
                if (isCommon) {
                    // Check if not already added
                    const alreadyAdded = commonConditions.some(cc => 
                        cc.tableColumnName === condition.tableColumnName && 
                        cc.values === condition.values
                    );
                    if (!alreadyAdded) {
                        commonConditions.push({
                            tableColumnName: condition.tableColumnName,
                            values: condition.values,
                            characterEntity: condition.characterEntity,
                            textValue: condition.textValue
                        });
                    }
                }
            });
        }

        

        return rules.map((rule, index) => {
            const transformedRule = {
                ...rule,
                // Preserve original rule name if it exists, otherwise use default
                ruleName: rule.ruleName || `Rule ${index + 1}`,
                ruleNumber: index + 1
            };
            
            // Step 2: Deduplicate conditions within this rule first (using a Map for uniqueness)
            if (transformedRule.workFlowRules && transformedRule.workFlowRules.length > 0) {
                const uniqueConditionsMap = new Map();
                transformedRule.workFlowRules.forEach(condition => {
                    const key = `${condition.tableColumnName}_${condition.values}_${condition.characterEntity}`;
                    if (!uniqueConditionsMap.has(key)) {
                        uniqueConditionsMap.set(key, condition);
                    }
                });
                transformedRule.workFlowRules = Array.from(uniqueConditionsMap.values());
                
                // Step 3: Remove common conditions from individual rules
                if (commonConditions.length > 0) {
                    transformedRule.workFlowRules = transformedRule.workFlowRules.filter(condition => {
                        return !commonConditions.some(cc => 
                            cc.tableColumnName === condition.tableColumnName && 
                            cc.values === condition.values
                        );
                    });
                }
            }
            
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
                        // Determine if this is a user or designation based on userid first
                        // If userid is 0 or null/undefined AND designationId > 0, it's a Designation
                        // If userid > 0, it's a User (may have a designationId representing their role)
                        const userId = approver.userid || 0;
                        const designationId = approver.designationid || approver.designationId || approver.designationID || 0;
                        
                        if (userId === 0 && designationId > 0) {
                            // This is a designation approver (userid is 0, but designationId is set)
                            const designation = {
                                id: designationId,
                                name: approver.username,
                                designationName: approver.username,
                                type: 'Designation'
                            };
                            return designation;
                        } else {
                            // This is a user approver (userid > 0)
                            const user = {
                                id: userId,
                                name: approver.username,
                                email: approver.useremailid,
                                type: 'User',
                                designationId: designationId > 0 ? designationId : undefined
                            };
                            return user;
                        }
                    });
                    
                    // Determine the appropriate selectionType and sequenceType
                    let selectionType = 'Everyone'; // Default
                    if (approversInSequence.length > 1) {
                        // If multiple approvers in this sequence, check sequenceType
                        selectionType = firstApprover.sequenceType === 'Everyone' ? 'Everyone' : 'Anyone';
                    }
                    
                    // Create a single approver entry for this sequence
                    const hasDesignation = selectedUsers.some(user => user.type === 'Designation');
                    const allDesignations = selectedUsers.length > 0 && selectedUsers.every(user => user.type === 'Designation');
                    const finalType = allDesignations ? 'Designation' : 'User';
                    
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
                        designationId: hasDesignation ? 1 : 0,
                        // Set type based on whether ALL users are designations (for proper display)
                        type: finalType
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

    const [expanded, setExpanded] = useState(false);

    const handleChangeAccordion = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const [selectUserOption, setSelectUserOption] = useState("U");
    const [selectTypeOption, setSelectTypeOption] = useState("A");
    const [userOptions, setUserOptions] = useState([]);
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
    const [addHeaderModalOpen, setAddHeaderModalOpen] = useState(false);
    const [newHeaderData, setNewHeaderData] = useState({
        headerName: '',
        description: '',
        conditions: [
            { id: 1, field: 'purchorgid', operator: 'Equals', value: '' },
            { id: 2, field: 'purchgrpid', operator: 'Equals', value: '' }
        ]
    });
    
    // Cache for purchase groups by organization ID
    const [purchaseGroupsCache, setPurchaseGroupsCache] = useState({});

    // Manage Users state
    const [manageUsersModalOpen, setManageUsersModalOpen] = useState(false);
    const [manageUsersAction, setManageUsersAction] = useState('');
    const [userToReplace, setUserToReplace] = useState(null);
    const [newUserName, setNewUserName] = useState(null);
    const [existingApprovers, setExistingApprovers] = useState([]);

    // Header functions
    const handleAddHeader = () => {
        // Fetch rules columns for the current event type when opening modal
        if (eventType) {
            pullgetrulescolumns(eventType);
        }
       
        
        // Set default conditions based on event type
        if (eventType === 'NFA') {
            setNewHeaderData({
                headerName: '',
                description: '',
                conditions: [
                    { id: 1, field: 'nfaamount', operator: 'LessThanOrEqual', value: '1000000' },
                    { id: 2, field: 'nfaamount', operator: 'GreaterThanOrEqual', value: '1' }
                ]
            });
        } else {
            setNewHeaderData({
                headerName: '',
                description: '',
                conditions: [
                    { id: 1, field: 'purchorgid', operator: 'Equals', value: '' },
                    { id: 2, field: 'purchgrpid', operator: 'Equals', value: '' }
                ]
            });
        }
        
        setAddHeaderModalOpen(true);
    };

    const handleCloseHeaderModal = () => {
        setAddHeaderModalOpen(false);
        // Reset to default conditions based on event type
        if (eventType === 'NFA') {
            setNewHeaderData({
                headerName: '',
                description: '',
                conditions: [
                    { id: 1, field: 'nfaamount', operator: 'LessThanOrEqual', value: '1000000' },
                    { id: 2, field: 'nfaamount', operator: 'GreaterThanOrEqual', value: '1' }
                ]
            });
        } else {
            setNewHeaderData({
                headerName: '',
                description: '',
                conditions: [
                    { id: 1, field: 'purchorgid', operator: 'Equals', value: '' },
                    { id: 2, field: 'purchgrpid', operator: 'Equals', value: '' }
                ]
            });
        }
    };

    const handleHeaderDataChange = (field, value) => {
        setNewHeaderData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddHeaderCondition = () => {
        const newCondition = {
            id: Date.now(),
            field: '',
            operator: 'Equals',
            value: ''
        };
        setNewHeaderData(prev => ({
            ...prev,
            conditions: [...prev.conditions, newCondition]
        }));
    };

    const handleRemoveHeaderCondition = (conditionId) => {
        setNewHeaderData(prev => ({
            ...prev,
            conditions: prev.conditions.filter(c => c.id !== conditionId)
        }));
    };

    const handleHeaderConditionChange = (conditionId, field, value) => {
        setNewHeaderData(prev => {
            const updatedConditions = prev.conditions.map(c => 
                c.id === conditionId ? { ...c, [field]: value } : c
            );
            
            // If changing a value for Purchase Org field, fetch purchase groups
            if (field === 'value') {
                const condition = prev.conditions.find(c => c.id === conditionId);
                if (condition && 
                    (condition.field === 'purchorgid' || 
                     condition.field?.toLowerCase() === 'purchase org')) {
                    // Fetch purchase groups for the selected organization
                    if (value) {
                        getPurchasegrplist(parseInt(value));
                    } else {
                        // Clear groups if no org selected
                        setpurchasegrpList([]);
                    }
                }
            }
            
            return {
                ...prev,
                conditions: updatedConditions
            };
        });
    };

    const handleSaveNewHeader = () => {
        // Validate header name
        if (!newHeaderData.headerName.trim()) {
            toast.error("Header Name is required", { autoClose: 2000 });
            return;
        }

        // Validate that at least one condition has values
        const hasValidCondition = newHeaderData.conditions.some(
            c => c.field && c.value
        );

        if (!hasValidCondition) {
            toast.error("At least one condition with field and value is required", { autoClose: 2000 });
            return;
        }

        // Filter valid conditions
        const validConditions = newHeaderData.conditions.filter(c => c.field && c.value);

        // Create the first rule automatically with the header's conditions
        const firstRule = {
            id: Date.now(),
            name: `${newHeaderData.headerName} Rule 1`,
            conditions: validConditions.map(c => ({
                id: Date.now() + Math.random(), // Ensure unique IDs
                field: c.field,
                operator: c.operator,
                value: c.value
            })),
            approvers: [],
            expanded: true
        };

        // Create new header row with the data and the first rule
        const newHeaderRow = {
            id: Date.now(),
            headerName: newHeaderData.headerName,
            description: newHeaderData.description,
            conditions: validConditions,
            headerTitle: '',
            headerGroup: '',
            rules: [firstRule], // Initialize with the first rule containing the conditions
            approvers: [], // Initialize with empty approvers array for this header
            copyApproversToAllRules: false // Toggle for copying approvers to all rules under this header
        };

        setHeaderRows([...headerRows, newHeaderRow]);
        handleCloseHeaderModal();
        toast.success(`Header "${newHeaderData.headerName}" saved successfully with ${firstRule.name}`, { autoClose: 3000 });
    };

    const handleRemoveHeader = (id) => {
        setHeaderRows(headerRows.filter(row => row.id !== id));
    };

    const handleAddConditionToHeader = (headerId) => {
        const newCondition = {
            id: Date.now(),
            field: '',
            operator: 'Equals',
            value: ''
        };
        
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? { ...header, conditions: [...(header.conditions || []), newCondition] }
                : header
        ));
    };

    const handleRemoveConditionFromHeader = (headerId, conditionId) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? { ...header, conditions: header.conditions.filter(cond => cond.id !== conditionId) }
                : header
        ));
    };

    const handleUpdateHeaderCondition = (headerId, conditionId, field, value) => {
        setHeaderRows(headerRows.map(header => {
            if (header.id === headerId) {
                const updatedConditions = header.conditions.map(cond => {
                    if (cond.id === conditionId) {
                        // If changing a value for Purchase Org field, fetch purchase groups
                        if (field === 'value' && 
                            (cond.field === 'purchorgid' || 
                             cond.field?.toLowerCase() === 'purchase org')) {
                            if (value) {
                                getPurchasegrplist(parseInt(value));
                            } else {
                                setpurchasegrpList([]);
                            }
                        }
                        return { ...cond, [field]: value };
                    }
                    return cond;
                });
                return { ...header, conditions: updatedConditions };
            }
            return header;
        }));
    };

    const handleAddRuleToHeader = (headerId) => {
        const header = headerRows.find(h => h.id === headerId);
        const currentRuleCount = header?.rules?.length || 0;
        
        // Don't copy common conditions to rule - they should only be in the header
        // Rule-specific conditions will be added separately by the user
        
        // If copyApproversToAllRules is enabled and there are existing rules with approvers, copy them
        let initialApprovers = [];
        if (header?.copyApproversToAllRules && header?.rules && header.rules.length > 0) {
            // Find the first rule that has approvers
            const ruleWithApprovers = header.rules.find(rule => rule.approvers && rule.approvers.length > 0);
            if (ruleWithApprovers) {
                // Deep copy the approvers
                initialApprovers = JSON.parse(JSON.stringify(ruleWithApprovers.approvers));
            }
        }
        
        const newRule = {
            id: Date.now(),
            name: `${header?.headerName || 'Header'} Rule ${currentRuleCount + 1}`,
            conditions: header?.conditions ? [...header.conditions] : [], // Start with a copy of header's common conditions
            approvers: initialApprovers,
            expanded: false
        };
        
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? { ...header, rules: [...(header.rules || []), newRule] }
                : header
        ));
        
        if (initialApprovers.length > 0) {
            toast.success(`${newRule.name} added with copied approvers`, { autoClose: 2000 });
        } else {
            toast.success(`${newRule.name} added successfully`, { autoClose: 2000 });
        }
    };

    const handleRemoveRuleFromHeader = (headerId, ruleId) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? { ...header, rules: header.rules.filter(rule => rule.id !== ruleId) }
                : header
        ));
    };

    const handleToggleRule = (headerId, ruleId) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? { ...rule, expanded: !rule.expanded }
                            : rule
                    )
                }
                : header
        ));
    };

    const handleHideRule = (headerId, ruleId) => {
        // Implement hide functionality
        toast.info("Hide functionality to be implemented", { autoClose: 2000 });
    };

    const handleAddConditionToRule = (headerId, ruleId) => {
        const newCondition = {
            id: Date.now(),
            field: '',
            operator: 'Equals',
            value: ''
        };

        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? { ...rule, conditions: [...(rule.conditions || []), newCondition] }
                            : rule
                    )
                }
                : header
        ));
    };

    const handleRemoveConditionFromRule = (headerId, ruleId, conditionId) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? { ...rule, conditions: rule.conditions.filter(cond => cond.id !== conditionId) }
                            : rule
                    )
                }
                : header
        ));
    };

    const handleUpdateRuleCondition = (headerId, ruleId, conditionId, field, value) => {
        setHeaderRows(headerRows.map(header => {
            if (header.id === headerId) {
                const updatedRules = header.rules.map(rule => {
                    if (rule.id === ruleId) {
                        const updatedConditions = rule.conditions.map(cond => {
                            if (cond.id === conditionId) {
                                // If changing a value for Purchase Org field, fetch purchase groups
                                if (field === 'value' && 
                                    (cond.field === 'purchorgid' || 
                                     cond.field?.toLowerCase() === 'purchase org')) {
                                    if (value) {
                                        getPurchasegrplist(parseInt(value));
                                    } else {
                                        setpurchasegrpList([]);
                                    }
                                }
                                return { ...cond, [field]: value };
                            }
                            return cond;
                        });
                        return { ...rule, conditions: updatedConditions };
                    }
                    return rule;
                });
                return { ...header, rules: updatedRules };
            }
            return header;
        }));
    };

    const handleAddApproverToRule = (headerId, ruleId) => {
        // Set the state to show the new approver row for this specific rule
        setShowNewApproverRowForRule(`${headerId}-${ruleId}`);
        
        // Initialize the new approver state for this rule
        setNewApproverForRule({
            [`${headerId}-${ruleId}`]: {
                sequence: '',
                type: 'User',
                selectedUsers: [],
                selectionType: 'Anyone',
                sequenceType: 'Anyone'
            }
        });
    };

    const handleApproverFieldChangeInHeaderRule = (headerId, ruleId, approverIndex, field, value) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? {
                                ...rule,
                                approvers: rule.approvers.map((approver, idx) =>
                                    idx === approverIndex
                                        ? { ...approver, [field]: value }
                                        : approver
                                )
                            }
                            : rule
                    )
                }
                : header
        ));
    };

    const handleApproverTypeChangeInHeaderRule = (headerId, ruleId, approverIndex, newType) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? {
                                ...rule,
                                approvers: rule.approvers.map((approver, idx) =>
                                    idx === approverIndex
                                        ? {
                                            ...approver,
                                            designationId: newType === 'Designation' ? true : null,
                                            selectedUsers: [] // Clear selected users when type changes
                                        }
                                        : approver
                                )
                            }
                            : rule
                    )
                }
                : header
        ));
    };

    const handleRemoveApproverFromHeaderRule = (headerId, ruleId, approverIndex) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? {
                                ...rule,
                                approvers: rule.approvers.filter((_, idx) => idx !== approverIndex)
                            }
                            : rule
                    )
                }
                : header
        ));
        toast.success('Approver removed successfully');
    };

    const handleAddNewApproverToHeaderRule = (headerId, ruleId) => {
        const ruleKey = `${headerId}-${ruleId}`;
        const newApproverData = newApproverForRule[ruleKey];

     
        if (!newApproverData) {
            toast.error('No approver data found');
            return;
        }

        // Validate
        // if (!newApproverData.sequence) {
        //     toast.error('Please enter a sequence number');
        //     return;
        // }
if (!newApproverData.sequence) {
    toast.error('Please enter a sequence number');

    setTimeout(() => {
        sequenceInputRef.current?.focus();
    }, 100);

    return;
}

        if (!newApproverData.selectedUsers || newApproverData.selectedUsers.length === 0) {
    toast.error('Please select at least one user or designation');

    setTimeout(() => {
        userSelectRef.current?.focus();
    }, 100);

    return;
}

        // Determine type based on selectedUsers
        const isDesignation = newApproverData.type === 'Designation' || 
                             (newApproverData.selectedUsers && newApproverData.selectedUsers.some(u => u.type === 'Designation'));
        const finalType = isDesignation ? 'Designation' : 'User';
        


        // Create the new approver object
        const newApprover = {
            id: Date.now(),
            sequence: newApproverData.sequence,
            type: finalType, // ⭐ ADD THIS FIELD!
            designationId: isDesignation ? 1 : 0,
            selectedUsers: newApproverData.selectedUsers,
            selectionType: newApproverData.selectionType || 'Anyone',
            sequenceType: newApproverData.sequenceType || 'Anyone'
        };



        // Add to the specific rule
        const updatedHeaderRows = headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    rules: header.rules.map(rule =>
                        rule.id === ruleId
                            ? { ...rule, approvers: [...(rule.approvers || []), newApprover] }
                            : rule
                    )
                }
                : header
        );


        const updatedHeader = updatedHeaderRows.find(h => h.id === headerId);
        const updatedRule = updatedHeader?.rules.find(r => r.id === ruleId);

        
        setHeaderRows(updatedHeaderRows);

        // Clear the new approver row
        setShowNewApproverRowForRule(null);
        setNewApproverForRule(prev => {
            const updated = { ...prev };
            delete updated[ruleKey];
            return updated;
        });

        toast.success('Approver added successfully');
        
        // If copyApproversToAllRules is enabled, copy this approver to all other rules in the same header
        const header = updatedHeaderRows.find(h => h.id === headerId);
        if (header && header.copyApproversToAllRules) {
            setTimeout(() => {
                copyApproversToAllRulesInHeader(headerId, ruleId);
            }, 100);
        }
    };

    // Helper function to copy approvers from one rule to all other rules in the same header
    const copyApproversToAllRulesInHeader = (headerId, sourceRuleId) => {
        setHeaderRows(prevHeaderRows => {
            const header = prevHeaderRows.find(h => h.id === headerId);
            if (!header || !header.copyApproversToAllRules) return prevHeaderRows;
            
            const sourceRule = header.rules.find(r => r.id === sourceRuleId);
            if (!sourceRule || !sourceRule.approvers || sourceRule.approvers.length === 0) return prevHeaderRows;
            
            // Deep copy source rule's approvers
            const approversToCopy = JSON.parse(JSON.stringify(sourceRule.approvers));
            
            // Update all other rules with the copied approvers
            return prevHeaderRows.map(h => 
                h.id === headerId
                    ? {
                        ...h,
                        rules: h.rules.map(rule =>
                            rule.id !== sourceRuleId
                                ? { ...rule, approvers: JSON.parse(JSON.stringify(approversToCopy)) }
                                : rule
                        )
                    }
                    : h
            );
        });
        
        toast.success('Approvers copied to all rules under this header', { autoClose: 2000 });
    };

    const handleCancelNewApproverForHeaderRule = (headerId, ruleId) => {
        const ruleKey = `${headerId}-${ruleId}`;
        setShowNewApproverRowForRule(null);
        setNewApproverForRule(prev => {
            const updated = { ...prev };
            delete updated[ruleKey];
            return updated;
        });
    };

    // Helper to update NEW approver fields (not existing approvers) for header rules
    const handleNewApproverFieldChangeInHeaderRule = (headerId, ruleId, field, value) => {
        const ruleKey = `${headerId}-${ruleId}`;
        setNewApproverForRule(prev => ({
            ...prev,
            [ruleKey]: {
                ...(prev[ruleKey] || {}),
                [field]: value,
                // If changing type, also reset selectedUsers
                ...(field === 'type' ? { selectedUsers: [] } : {})
            }
        }));
    };

    // Handler functions for header-level approvers
    const handleAddApproverToHeader = (headerId) => {
        setShowNewApproverRowForHeader(headerId);
        setNewApproverForHeader({
            [headerId]: {
                sequence: '',
                type: 'User',
                selectedUsers: [],
                selectionType: 'Anyone',
                sequenceType: 'Anyone'
            }
        });
    };

    const handleApproverFieldChangeInHeader = (headerId, approverIndex, field, value) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    approvers: header.approvers.map((approver, idx) =>
                        idx === approverIndex
                            ? { ...approver, [field]: value }
                            : approver
                    )
                }
                : header
        ));
    };

    const handleApproverTypeChangeInHeader = (headerId, approverIndex, newType) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    approvers: header.approvers.map((approver, idx) =>
                        idx === approverIndex
                            ? {
                                ...approver,
                                designationId: newType === 'Designation' ? true : null,
                                selectedUsers: []
                            }
                            : approver
                    )
                }
                : header
        ));
    };

    const handleRemoveApproverFromHeader = (headerId, approverIndex) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? {
                    ...header,
                    approvers: header.approvers.filter((_, idx) => idx !== approverIndex)
                }
                : header
        ));
        toast.success('Approver removed successfully');
    };

    const handleAddNewApproverToHeader = (headerId) => {
        const newApproverData = newApproverForHeader[headerId];

        if (!newApproverData) {
            toast.error('No approver data found');
            return;
        }

        if (!newApproverData.sequence) {
            toast.error('Please enter a sequence number');
            return;
        }

        if (!newApproverData.selectedUsers || newApproverData.selectedUsers.length === 0) {
            toast.error('Please select at least one user or designation');
            return;
        }

        const newApprover = {
            id: Date.now(),
            sequence: newApproverData.sequence,
            designationId: newApproverData.type === 'Designation' ? true : null,
            selectedUsers: newApproverData.selectedUsers,
            selectionType: newApproverData.selectionType || 'Anyone',
            sequenceType: newApproverData.sequenceType || 'Anyone'
        };

        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? { ...header, approvers: [...(header.approvers || []), newApprover] }
                : header
        ));

        setShowNewApproverRowForHeader(null);
        setNewApproverForHeader(prev => {
            const updated = { ...prev };
            delete updated[headerId];
            return updated;
        });

        toast.success('Approver added successfully');
    };

    const handleCancelNewApproverForHeader = (headerId) => {
        setShowNewApproverRowForHeader(null);
        setNewApproverForHeader(prev => {
            const updated = { ...prev };
            delete updated[headerId];
            return updated;
        });
    };

    // Toggle handler for Copy Approvers to All Rules
    const handleToggleCopyApproversToAllRules = (headerId, isEnabled) => {
        setHeaderRows(headerRows.map(header => 
            header.id === headerId
                ? { ...header, copyApproversToAllRules: isEnabled }
                : header
        ));
        
        if (isEnabled) {
            // When toggled ON, immediately copy approvers from the first rule with approvers to all other rules
            const header = headerRows.find(h => h.id === headerId);
            if (header && header.rules && header.rules.length > 1) {
                const ruleWithApprovers = header.rules.find(rule => rule.approvers && rule.approvers.length > 0);
                if (ruleWithApprovers) {
                    setTimeout(() => {
                        copyApproversToAllRulesInHeader(headerId, ruleWithApprovers.id);
                    }, 100);
                }
            }
            toast.success('Copy Approvers to All Rules enabled', { autoClose: 2000 });
        } else {
            toast.info('Copy Approvers to All Rules disabled. Existing approvers will not be removed.', { autoClose: 3000 });
        }
    };

    // Helper function to get user display name (handles both data structures)
    const getUserDisplayName = (user) => {
        if (!user) return '';
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        if (user.name) {
            return user.name;
        }
        return '';
    };

    // Save workflow changes to database immediately
    const saveWorkflowChanges = async (updatedHeaderRows) => {
        try {
            // Transform headerRows to API format (same logic as onSubmit)
            const transformedFromHeaders = [];
            
            updatedHeaderRows.forEach((header, headerIndex) => {
                if (header.rules && header.rules.length > 0) {
                    // Get common conditions from header
                    const commonConditions = (header.conditions || []).map(condition => {
                        // Get display text for the value
                        let displayText = condition.value || "";
                        
                        // For dropdown fields, get the display name from the list
                        if (condition.field === 'purchorgid' || condition.field?.toLowerCase() === 'purchase org') {
                            const org = purchaseAllList?.find(o => o.id == condition.value);
                            displayText = org ? (org.orgName || org.name) : condition.value;
                        } else if (condition.field === 'purchgrpid' || condition.field === 'purchrgrpid' || condition.field?.toLowerCase() === 'purchase group') {
                            const grp = purchasegrpList?.find(g => g.id == condition.value);
                            displayText = grp ? (grp.groupName || grp.name) : condition.value;
                        } else if (condition.field === 'projectid') {
                            const project = nfaProjectList?.find(p => p.id == condition.value);
                            displayText = project ? (project.project || project.name) : condition.value;
                        } else if (condition.field === 'exceptionid') {
                            const exception = nfaConditionList?.find(e => e.id == condition.value);
                            displayText = exception ? (exception.exception || exception.name) : condition.value;
                        } else if (condition.field === 'spendid') {
                            const spend = nfaSpendList?.find(s => s.id == condition.value);
                            displayText = spend ? (spend.spend || spend.name) : condition.value;
                        }
                        
                        return {
                            textValue: String(displayText),
                            table_Schema: "",
                            table_Name: "",
                            tableColumnName: condition.field || "",
                            characterEntity: condition.operator === 'Equals' ? '0' : 
                                           condition.operator === 'NotEquals' ? '1' :
                                           condition.operator === 'LessThan' ? '2' :
                                           condition.operator === 'LessThanOrEqual' ? '3' :
                                           condition.operator === 'GreaterThan' ? '4' :
                                           condition.operator === 'GreaterThanOrEqual' ? '5' : '0',
                            values: parseInt(condition.value) || condition.value || "",
                            wfRuleId: 0,
                            wfid: recorddataWF[0]?.id || 0
                        };
                    });

                    header.rules.forEach((rule, ruleIndex) => {
                        const ruleOnlyConditions = rule.conditions || [];
                        
                        const ruleSpecificConditions = ruleOnlyConditions.map(condition => {
                            // Get display text for the value
                            let displayText = condition.value || "";
                            
                            // For dropdown fields, get the display name from the list
                            if (condition.field === 'purchorgid' || condition.field?.toLowerCase() === 'purchase org') {
                                const org = purchaseAllList?.find(o => o.id == condition.value);
                                displayText = org ? (org.orgName || org.name) : condition.value;
                            } else if (condition.field === 'purchgrpid' || condition.field === 'purchrgrpid' || condition.field?.toLowerCase() === 'purchase group') {
                                const grp = purchasegrpList?.find(g => g.id == condition.value);
                                displayText = grp ? (grp.groupName || grp.name) : condition.value;
                            } else if (condition.field === 'projectid') {
                                const project = nfaProjectList?.find(p => p.id == condition.value);
                                displayText = project ? (project.project || project.name) : condition.value;
                            } else if (condition.field === 'exceptionid') {
                                const exception = nfaConditionList?.find(e => e.id == condition.value);
                                displayText = exception ? (exception.exception || exception.name) : condition.value;
                            } else if (condition.field === 'spendid') {
                                const spend = nfaSpendList?.find(s => s.id == condition.value);
                                displayText = spend ? (spend.spend || spend.name) : condition.value;
                            }
                            
                            return {
                                textValue: String(displayText),
                                table_Schema: "",
                                table_Name: "",
                                tableColumnName: condition.field || "",
                                characterEntity: condition.operator === 'Equals' ? '0' : 
                                               condition.operator === 'NotEquals' ? '1' :
                                               condition.operator === 'LessThan' ? '2' :
                                               condition.operator === 'LessThanOrEqual' ? '3' :
                                               condition.operator === 'GreaterThan' ? '4' :
                                               condition.operator === 'GreaterThanOrEqual' ? '5' : '0',
                                values: parseInt(condition.value) || condition.value || "",
                                wfRuleId: 0,
                                wfid: recorddataWF[0]?.id || 0
                            };
                        });

                        const workFlowRules = [...commonConditions, ...ruleSpecificConditions];

                        const transformedApprovers = (rule.approvers || []).flatMap(approver => {
                            const baseApprover = {
                                wfRuleId: 0,
                                wfid: recorddataWF[0]?.id || 0,
                                customerId: parseInt(customerid) || 0,
                                budgetstatus: null,
                                seqno: parseInt(approver.sequence) || 1,
                                department: null,
                                departmentId: null,
                                sequenceType: approver.sequenceType || approver.selectionType || 'Anyone'
                            };

                            if (approver.selectedUsers && approver.selectedUsers.length > 0) {
                                return approver.selectedUsers.map(selectedItem => {
                                    console.log('🔍 [HEADER SAVE] selectedItem:', selectedItem);
                                    console.log('🔍 [HEADER SAVE] approver.type:', approver.type);
                                    console.log('🔍 [HEADER SAVE] approver.designationId:', approver.designationId);
                                    
                                    // Determine if this is a Designation based on approver.type or selectedItem.type
                                    const isDesignationType = approver.type === 'Designation' || selectedItem.type === 'Designation';
                                    const hasDesignationFlag = approver.designationId && approver.designationId > 0;
                                    
                                    // For Designation: userid=0, designationId=actual designation id
                                    if (isDesignationType || hasDesignationFlag) {
                                        const designationApprover = {
                                            ...baseApprover,
                                            userid: 0,
                                            username: selectedItem.name || selectedItem.designationName || null,
                                            useremailid: null,
                                            designationId: parseInt(selectedItem.id) || null
                                        };
                                        console.log('✅ [HEADER SAVE] DESIGNATION:', designationApprover);
                                        return designationApprover;
                                    } else {
                                        // For User: userid=actual user id, designationId must always be null
                                        const userId = parseInt(selectedItem.id || selectedItem.userid) || 0;
                                        
                                        const userApprover = {
                                            ...baseApprover,
                                            userid: userId,
                                            username: selectedItem.name || selectedItem.username,
                                            useremailid: selectedItem.email || selectedItem.useremailid || null,
                                            designationId: null
                                        };
                                        console.log('✅ [HEADER SAVE] USER:', userApprover);
                                        
                                        // ⚠️ VALIDATION: Warn if userid is 0 for user approvers
                                        if (userId === 0) {
                                            console.error('❌ [HEADER SAVE] ERROR: User has userid=0', selectedItem);
                                        }
                                        
                                        return userApprover;
                                    }
                                });
                            }
                            return [];
                        });

                        transformedFromHeaders.push({
                            ruleName: rule.name || `${header.headerName} - Rule ${ruleIndex + 1}`,
                            ruleNumber: transformedFromHeaders.length + 1,
                            approverOrder: "Sequential",
                            approverType: "U",
                            wfid: recorddataWF[0]?.id || 0,
                            workFlowRules: workFlowRules,
                            wfapproverusers: transformedApprovers
                        });
                    });
                }
            });

            const WFdata = {
                id: recorddataWF[0]?.id || 0,
                customerId: customerid,
                wfname: wfname,
                eventtype: eventType,
                stageId: StageId,
                orgId: 0,
                wfoverride: true,
                required: mandatory,
                isactive: isActive,
                purchorggroup: [],
                wfRuleCriteria: transformedFromHeaders
            };

            if (recorddataWF[0]?.id > 0) {
                await UpdateWorkflowStage(WFdata, recorddataWF[0]?.id, atoken);
            }
        } catch (error) {
            console.error('Error saving workflow changes:', error);
            toast.error('Failed to save changes to database', { autoClose: 3000 });
        }
    };

    // Manage Users handlers
    const handleOpenManageUsersModal = async () => {
        // Extract all unique users from workflow rules
        const allUsers = [];
        const userMap = new Map();
        
        headerRows.forEach(header => {
            header.rules?.forEach(rule => {
                rule.approvers?.forEach(approver => {
                    // Check if approver has selectedUsers array (from transformed structure)
                    if (approver.selectedUsers && Array.isArray(approver.selectedUsers)) {
                        approver.selectedUsers.forEach(user => {
                            // Only add users (not designations) to the replacement list
                            if (user.type === 'User' && !userMap.has(user.id)) {
                                userMap.set(user.id, user);
                                allUsers.push(user);
                            }
                        });
                    }
                });
            });
        });
        
       
        setExistingApprovers(allUsers);
        
        // Fetch all users for new user selection and wait for it to complete
        await userList(customerid);
        
        setManageUsersModalOpen(true);
    };

    const handleCloseManageUsersModal = () => {
        setManageUsersModalOpen(false);
        setManageUsersAction('');
        setUserToReplace(null);
        setNewUserName(null);
        setExistingApprovers([]);
    };

    const handleApplyUserChanges = async () => {
        if (!manageUsersAction) {
            toast.error('Please select an action', { autoClose: 3000 });
            return;
        }

        if (manageUsersAction === 'Replace User') {
            if (!userToReplace) {
                toast.error('Please select a user to replace', { autoClose: 3000 });
                return;
            }
            if (!newUserName) {
                toast.error('Please select a new user', { autoClose: 3000 });
                return;
            }

            // Replace user in all workflow rules across all headers
            const updatedHeaderRows = headerRows.map(header => ({
                ...header,
                rules: header.rules.map(rule => ({
                    ...rule,
                    approvers: rule.approvers.map(approver => {
                        if (approver.selectedUsers && Array.isArray(approver.selectedUsers)) {
                            const updatedUsers = approver.selectedUsers.map(user => {
                                // Only replace if this is a User type (not Designation) and IDs match
                                if (user.type === 'User' && user.id === userToReplace.id) {
                                    return newUserName;
                                }
                                return user;
                            });
                            return { ...approver, selectedUsers: updatedUsers };
                        }
                        return approver;
                    })
                }))
            }));

            setHeaderRows(updatedHeaderRows);
            
            // Save changes immediately to database
            await saveWorkflowChanges(updatedHeaderRows);
            
            // Reload workflow data to sync with database
            if (recorddataWF[0]?.id) {
                await pullWorkFlowDataList(recorddataWF[0].id);
            }
            
            toast.success(`User "${getUserDisplayName(userToReplace)}" replaced with "${getUserDisplayName(newUserName)}" in all workflow rules and saved`, { autoClose: 3000 });
        } else if (manageUsersAction === 'Add User to All') {
            if (!newUserName) {
                toast.error('Please select a user to add', { autoClose: 3000 });
                return;
            }

            // Add user to all workflow rules across all headers
            const updatedHeaderRows = headerRows.map(header => ({
                ...header,
                rules: header.rules.map(rule => {
                    // Check if user already exists in any approver
                    const userAlreadyExists = rule.approvers.some(approver => 
                        approver.selectedUsers && approver.selectedUsers.some(user => user.id === newUserName.id)
                    );

                    if (userAlreadyExists) {
                        // User already exists, no need to add
                        return rule;
                    }

                    // Find the first User-type approver with the highest sequence number
                    let maxSequence = 0;
                    let userApproverFound = false;
                    
                    const updatedApprovers = rule.approvers.map(approver => {
                        if (approver.sequence > maxSequence) {
                            maxSequence = approver.sequence;
                        }
                        
                        if (approver.type === 'User' && approver.selectedUsers) {
                            userApproverFound = true;
                            // Add user to the first User-type approver
                            return {
                                ...approver,
                                selectedUsers: [...approver.selectedUsers, newUserName]
                            };
                        }
                        return approver;
                    });

                    // If no User-type approver exists, create a new one
                    if (!userApproverFound) {
                        const newApprover = {
                            sequence: maxSequence + 1,
                            seqno: maxSequence + 1,
                            type: 'User',
                            selectedUsers: [newUserName],
                            selectionType: 'Anyone',
                            sequenceType: 'Anyone'
                        };
                        return {
                            ...rule,
                            approvers: [...updatedApprovers, newApprover]
                        };
                    }

                    return {
                        ...rule,
                        approvers: updatedApprovers
                    };
                })
            }));

            setHeaderRows(updatedHeaderRows);
            
            // Save changes immediately to database
            await saveWorkflowChanges(updatedHeaderRows);
            
            // Reload workflow data to sync with database
            if (recorddataWF[0]?.id) {
                await pullWorkFlowDataList(recorddataWF[0].id);
            }
            
            toast.success(`User "${getUserDisplayName(newUserName)}" added to all workflow rules and saved`, { autoClose: 3000 });
        } else if (manageUsersAction === 'Remove User') {
            if (!userToReplace) {
                toast.error('Please select a user to remove', { autoClose: 3000 });
                return;
            }

            // Remove user from all workflow rules across all headers
            const updatedHeaderRows = headerRows.map(header => ({
                ...header,
                rules: header.rules.map(rule => ({
                    ...rule,
                    approvers: rule.approvers.map(approver => {
                        if (approver.selectedUsers && Array.isArray(approver.selectedUsers)) {
                            // Only remove users (not designations) that match the ID
                            const updatedUsers = approver.selectedUsers.filter(user => 
                                !(user.type === 'User' && user.id === userToReplace.id)
                            );
                            return { ...approver, selectedUsers: updatedUsers };
                        }
                        return approver;
                    }).filter(approver => {
                        // Remove approver entry if no users left (all selectedUsers were removed)
                        return approver.selectedUsers && approver.selectedUsers.length > 0;
                    })
                }))
            }));

            setHeaderRows(updatedHeaderRows);
            
            // Save changes immediately to database
            await saveWorkflowChanges(updatedHeaderRows);
            
            // Reload workflow data to sync with database
            if (recorddataWF[0]?.id) {
                await pullWorkFlowDataList(recorddataWF[0].id);
            }
            
            toast.success(`User "${getUserDisplayName(userToReplace)}" removed from all workflow rules and saved`, { autoClose: 3000 });
        }

        handleCloseManageUsersModal();
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

    // Helper function to get purchase groups for a specific set of conditions
    const getPurchaseGroupsForConditions = (conditions) => {
        // Find the Purchase Org condition to get the org ID
        const purchOrgCondition = conditions?.find(c => 
            c.field === 'purchorgid' || 
            c.field?.toLowerCase() === 'purchase org' ||
            formatFieldDisplayName(c.field) === 'Purchase Org'
        );
        
        if (purchOrgCondition && purchOrgCondition.value) {
            const orgId = parseInt(purchOrgCondition.value);
            if (purchaseGroupsCache[orgId]) {
                return purchaseGroupsCache[orgId];
            }
            // If not in cache, return empty and trigger fetch
            getPurchasegrplist(orgId);
            return [];
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
                // Purchase groups will be loaded when a Purchase Organization is selected
                // For now, initialize with empty array or fetch if orgMstId is available
                if (orgMstId && orgMstId > 0) {
                    getPurchasegrplist(orgMstId);
                } else {
                    setpurchasegrpList([]);
                }
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

    // State for header rule approvers - keyed by "headerId-ruleId"
    const [showNewApproverRowForRule, setShowNewApproverRowForRule] = useState(null);
    const [newApproverForRule, setNewApproverForRule] = useState({});

    // State for header approvers - keyed by "headerId"
    const [showNewApproverRowForHeader, setShowNewApproverRowForHeader] = useState(null);
    const [newApproverForHeader, setNewApproverForHeader] = useState({});

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

    // Ref for sequence input field (for auto-focus on validation error)
    const sequenceInputRef = useRef(null);
    
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

    // Criteria list toggle, hide, and remove handlers
    const handleToggleCriteria = (ruleId) => {
        setinputCriteriaList(inputCriteriaList.map(rule =>
            rule.id === ruleId
                ? { ...rule, expanded: !rule.expanded }
                : rule
        ));
    };

    const handleHideCriteria = (ruleId) => {
        // Implement hide functionality for criteria
        toast.info("Hide functionality to be implemented", { autoClose: 2000 });
    };

    const handleRemoveCriteria = (ruleId) => {
        if (inputCriteriaList.length <= 1) {
            toast.warning("Cannot remove the last rule", { autoClose: 2000 });
            return;
        }
        setinputCriteriaList(inputCriteriaList.filter(rule => rule.id !== ruleId));
        // Adjust activeRuleIndex if needed
        if (activeRuleIndex >= inputCriteriaList.length - 1) {
            setActiveRuleIndex(Math.max(0, inputCriteriaList.length - 2));
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
            const currentRule = activeRule.workFlowRules[conditionId];
            
            // If changing a value for Purchase Org field, fetch purchase groups
            if (field === 'values' && 
                (currentRule.tableColumnName === 'purchorgid' || 
                 currentRule.tableColumnName?.toLowerCase() === 'purchase org')) {
                if (value) {
                    getPurchasegrplist(parseInt(value));
                } else {
                    setpurchasegrpList([]);
                }
            }
            
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

    // Helper function to normalize field names from display names to field IDs
    const normalizeFieldName = (fieldName) => {
        if (!fieldName) return '';
        
        const fieldLower = fieldName.toLowerCase().trim();
        
        // Map display names to actual field IDs
        switch (fieldLower) {
            case 'purchase org':
            case 'purchaseorg':
                return 'purchorgid';
            case 'purchase group':
            case 'purchasegroup':
                return 'purchgrpid';
            case 'project':
                return 'projectid';
            case 'exception':
                return 'exceptionid';
            case 'spend':
                return 'spendid';
            case 'nfa amount':
            case 'nfaamount':
                return 'nfaamount';
            case 'stage':
                return 'stage';
            default:
                // If it's already a field ID (contains 'id' or is lowercase without spaces), return as is
                return fieldName;
        }
    };

    // Helper function to format field names for display
    const formatFieldDisplayName = (columnName) => {
        if (!columnName) return '';
        
        const fieldLower = columnName.toLowerCase();
        
        // Map field IDs to user-friendly display names
        switch (fieldLower) {
            case 'purchorgid':
                return 'Purchase Org';
            case 'purchrgrpid':
            case 'purchgrpid':
                return 'Purchase Group';
            case 'projectid':
                return 'Project';
            case 'exceptionid':
                return 'Exception';
            case 'spendid':
                return 'Spend';
            case 'nfaamount':
                return 'NFA Amount';
            case 'refid':
                return 'Reference ID';
            case 'stage':
                return 'Stage';
            default:
                // Capitalize first letter and return
                return columnName.charAt(0).toUpperCase() + columnName.slice(1);
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
                       
                        updatedApprover.sequenceType = value;
                    }
                    
                    // If changing sequenceType, also update selectionType to match
                    if (field === 'sequenceType') {
                       
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
              
                updatedApprover.sequenceType = value;
            }
            
            // If changing sequenceType, also update selectionType to match
            if (field === 'sequenceType') {
                
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
            // Auto-focus the sequence input field
            if (sequenceInputRef.current) {
                sequenceInputRef.current.focus();
            }
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
            
           

            activeRule.wfapproverusers.push(newApproverData);
            
            // Sort approvers by sequence number
            activeRule.wfapproverusers.sort((a, b) => {
                const seqA = a.sequence || a.seqno || 0;
                const seqB = b.sequence || b.seqno || 0;
                return seqA - seqB;
            });

            setinputCriteriaList(updatedList);

            // Reset new approver form and hide the row - THIS IS CRITICAL
           
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
                    const entityName = item?.name || item?.legalEntityName;
                    if (!uniqueMap[entityName]) {
                        uniqueMap[entityName] = true;
                        return true;
                    }
                    return false;
                });
                
                setLegalEntityOptions(uniqueLegalEntities.map(entity => ({
                    id: entity.id || entity.legalEntityId,
                    name: entity.name || entity.legalEntityName
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
                } else if (currentApproverIndex === null && showNewApproverRowForRule) {
                    // Add to new approver row for header rule
                    const ruleKey = showNewApproverRowForRule;
                    setNewApproverForRule(prev => ({
                        ...prev,
                        [ruleKey]: {
                            ...(prev[ruleKey] || {}),
                            type: 'Designation',
                            selectedUsers: [designationToAdd]
                        }
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
            setCriteriaRuleShow(x[i].workFlowRules);
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

    
    
        if (approverSeqType === "Sequential") {
            // Make sure each approver has the sequenceType property
           
            
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
                expanded: false,
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
        userList(customerid);
        

        PullUserDepartment();
    }, []);
    
    
    
    
    useEffect(() => {
        
        if (editRecordData) {
         // Wait for purchase org list to be loaded before prefilling
         // Purchase groups will be loaded on-demand when needed
         purchaseAllList && purchaseAllList.length > 0 && prefilledStage();
        } else {
            setinputCriteriaList([]);
        }
    }, [PurchaseOrgGrp,MenuMasterList, purchaseAllList]);

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
            createdby: userdetails?.id || 0,
            wfRuleCriteria: inputCriteriaList,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
        
        //values.wfRuleCriteria[0].wfapproverusers = PostwfapproverData(TableItem,inputCriteriaList[0].ruleNumber,inputCriteriaList[0].wfid) 
            console.log("🚀🚀🚀 ========== SAVE BUTTON CLICKED ========== 🚀🚀🚀");
            console.log("📋 actionType:", actionType);
            console.log("📋 headerRows:", headerRows);
            console.log("📋 inputCriteriaList:", inputCriteriaList);
            console.log("=== SUBMITTING WORKFLOW ===");
            console.log("Full values.wfRuleCriteria:", JSON.stringify(values.wfRuleCriteria, null, 2));
            values.wfRuleCriteria.forEach((rule, ruleIdx) => {
                console.log(`=== Rule ${ruleIdx + 1} workFlowRules ===`);
                rule.workFlowRules.forEach((wfRule, wfIdx) => {
                    console.log(`  [${wfIdx}] ${wfRule.tableColumnName}: characterEntity="${wfRule.characterEntity}", value="${wfRule.values}"`);
                });
            });

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
                            // Just validate that values are provided and valid numbers
                            for (let condition of conditionList) {
                                if (!condition.value || isNaN(condition.value)) {
                                    toast.error(`Please provide a valid numeric value for "${conditionName}" in Rule ${ruleIndex + 1}`, { autoClose: 3000 });
                                    return false;
                                }
                            }
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
            };

        // Transform headerRows into wfRuleCriteria format
        let transformedFromHeaders = [];
        if (headerRows && headerRows.length > 0) {
            headerRows.forEach((header, headerIndex) => {
                // For each rule within the header
                if (header.rules && header.rules.length > 0) {
                    header.rules.forEach((rule, ruleIndex) => {
                        // Transform header's common conditions to workFlowRules format (these will be added to ALL rules)
                        const commonConditions = (header.conditions || []).map(condition => ({
                            textValue: condition.value || "",
                            table_Schema: "", // Will be populated by backend based on eventType
                            table_Name: "", // Will be populated by backend based on eventType
                            tableColumnName: condition.field || "",
                            characterEntity: condition.operator === 'Equals' ? '0' : 
                                           condition.operator === 'NotEquals' ? '1' :
                                           condition.operator === 'LessThan' ? '2' :
                                           condition.operator === 'LessThanOrEqual' ? '3' :
                                           condition.operator === 'GreaterThan' ? '4' :
                                           condition.operator === 'GreaterThanOrEqual' ? '5' : '0',
                            values: condition.value || "",
                            wfRuleId: 0,
                            wfid: recorddataWF[0]?.id || 0
                        }));

                        // Filter out common conditions from rule.conditions
                        // rule.conditions contains both common and rule-specific (merged for display)
                        // We need to exclude the common ones to avoid duplication
                        const ruleOnlyConditions = (rule.conditions || []).filter(ruleCondition => {
                            return !header.conditions.some(commonCondition => 
                                commonCondition.field === ruleCondition.field && 
                                String(commonCondition.value) === String(ruleCondition.value) &&
                                commonCondition.operator === ruleCondition.operator
                            );
                        });
                        
                        // Transform rule-specific conditions to workFlowRules format
                        const ruleSpecificConditions = ruleOnlyConditions.map(condition => ({
                            textValue: condition.value || "",
                            table_Schema: "", // Will be populated by backend based on eventType
                            table_Name: "", // Will be populated by backend based on eventType
                            tableColumnName: condition.field || "",
                            characterEntity: condition.operator === 'Equals' ? '0' : 
                                           condition.operator === 'NotEquals' ? '1' :
                                           condition.operator === 'LessThan' ? '2' :
                                           condition.operator === 'LessThanOrEqual' ? '3' :
                                           condition.operator === 'GreaterThan' ? '4' :
                                           condition.operator === 'GreaterThanOrEqual' ? '5' : '0',
                            values: condition.value || "",
                            wfRuleId: 0,
                            wfid: recorddataWF[0]?.id || 0
                        }));

                        // Merge common conditions with rule-specific conditions
                        const workFlowRules = [...commonConditions, ...ruleSpecificConditions];

                        // Transform approvers
                        const transformedApprovers = (rule.approvers || []).flatMap(approver => {
                            const baseApprover = {
                                wfRuleId: 0,
                                wfid: recorddataWF[0]?.id || 0,
                                customerId: customerid || 0,
                                budgetstatus: null,
                                seqno: approver.sequence || 1,
                                department: null,
                                departmentId: null,
                                sequenceType: approver.sequenceType || approver.selectionType || 'Anyone'
                            };

                            // Map selectedUsers to individual approver entries
                            if (approver.selectedUsers && approver.selectedUsers.length > 0) {
                                return approver.selectedUsers.map(selectedItem => {
                                    console.log('🔍 [SAVE HEADER APPROVER] selectedItem:', selectedItem);
                                    console.log('🔍 [SAVE HEADER APPROVER] type:', selectedItem.type, 'approver.designationId:', approver.designationId);
                                    if (selectedItem.type === 'Designation' || approver.designationId) {
                                        const designationApprover = {
                                            ...baseApprover,
                                            userid: 0,
                                            username: selectedItem.name || selectedItem.designationName || null,
                                            useremailid: null,
                                            designationId: parseInt(selectedItem.id) || null
                                        };
                                        console.log('✅ [SAVE HEADER APPROVER] Saving as DESIGNATION:', designationApprover);
                                        return designationApprover;
                                    } else {
                                        const userDesignationId = selectedItem.designationId || (selectedItem.designation && selectedItem.designation.id) || null;
                                        const userApprover = {
                                            ...baseApprover,
                                            userid: parseInt(selectedItem.id) || 0,
                                            username: selectedItem.name,
                                            useremailid: selectedItem.email || null,
                                            designationId: userDesignationId ? parseInt(userDesignationId) : null
                                        };
                                        console.log('✅ [SAVE HEADER APPROVER] Saving as USER:', userApprover);
                                        return userApprover;
                                    }
                                });
                            }
                            return [];
                        });

                        // Push the rule with merged conditions (common + rule-specific)
                        transformedFromHeaders.push({
                            ruleName: rule.name || `${header.headerName} - Rule ${ruleIndex + 1}`,
                            ruleNumber: transformedFromHeaders.length + 1,
                            approverOrder: "Sequential",
                            approverType: "U",
                            wfid: recorddataWF[0]?.id || 0,
                            workFlowRules: workFlowRules, // Now contains both common and rule-specific conditions
                            wfapproverusers: transformedApprovers
                        });
                    });
                }
            });
        }

        // If we have header-based rules, use only those. Otherwise, use inputCriteriaList
        // This ensures we don't duplicate rules when headers are present
        const allRules = transformedFromHeaders.length > 0 ? transformedFromHeaders : inputCriteriaList;

        console.log("Transformed header rows to rules:", transformedFromHeaders);
        console.log("All rules before final transformation:", allRules);

        // Transform approver data before submission and renumber all rules
        const transformedInputCriteriaList = allRules.map((rule, index) => {
            const transformedRule = { 
                ...rule,
                ruleNumber: index + 1 // Ensure sequential numbering
                // ruleName is preserved from the spread operator
            };
            
            console.log(`Saving rule ${index + 1}: Original ruleName="${rule.ruleName}", Preserved="${transformedRule.ruleName}"`);
            
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
                                    console.log('🔍 [RULE SAVE] selectedItem:', selectedItem);
                                    console.log('🔍 [RULE SAVE] selectedItem.type:', selectedItem.type);
                                    console.log('🔍 [RULE SAVE] approver.type:', approver.type);
                                    console.log('🔍 [RULE SAVE] approver.designationId:', approver.designationId);
                                    
                                    // Determine if this is a Designation based on approver.type or selectedItem.type
                                    const isDesignationType = approver.type === 'Designation' || selectedItem.type === 'Designation';
                                    const hasDesignationFlag = approver.designationId && approver.designationId > 0;
                                    
                                    // For Designation: userid=0, designationId=actual designation id
                                    if (isDesignationType || hasDesignationFlag) {
                                        const designationApprover = {
                                            ...baseApprover,
                                            userid: 0,
                                            username: selectedItem.name || selectedItem.designationName || null,
                                            useremailid: null,
                                            designationId: parseInt(selectedItem.id) || null
                                        };
                                        console.log('✅ [RULE SAVE] DESIGNATION:', designationApprover);
                                        return designationApprover;
                                    } else {
                                        // For User: userid=actual user id, designationId must always be null
                                        const userId = parseInt(selectedItem.id || selectedItem.userid) || 0;
                                        
                                        const userApprover = {
                                            ...baseApprover,
                                            userid: userId,
                                            username: selectedItem.name || selectedItem.username,
                                            useremailid: selectedItem.email || selectedItem.useremailid || null,
                                            designationId: null
                                        };
                                        console.log('✅ [RULE SAVE] USER:', userApprover);
                                        
                                        // ⚠️ VALIDATION: Warn if userid is 0 for user approvers
                                        if (userId === 0) {
                                            console.error('❌ [RULE SAVE] ERROR: User has userid=0', selectedItem);
                                        }
                                        
                                        return userApprover;
                                    }
                                });
                            } else {
                                // Fallback for old format or direct properties
                                const isDesignationType = approver.type === 'Designation';
                                const hasDesignationFlag = approver.designationId && approver.designationId > 0 && !approver.userid;
                                
                                if (isDesignationType || hasDesignationFlag) {
                                    // Designation approver
                                    return [{
                                        ...baseApprover,
                                        userid: 0,
                                        username: approver.username || approver.name,
                                        useremailid: null,
                                        designationId: parseInt(approver.designationId) || null
                                    }];
                                } else {
                                    // User approver - designationId must always be null
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

        // Final transformation: Convert textValue to display names and ensure proper types
        const finalTransformedRules = transformedInputCriteriaList.map(rule => ({
            ...rule,
            workFlowRules: (rule.workFlowRules || []).map(condition => {
                let displayName = condition.textValue;
                let valueData = condition.values;
                
                // Convert textValue from ID to display name based on field type
                // Keep values as the original ID/number
                if (condition.tableColumnName === 'purchorgid' && purchaseAllList && purchaseAllList.length > 0) {
                    const org = purchaseAllList.find(o => o.id === parseInt(condition.values || condition.textValue));
                    displayName = org ? String(org.orgName || org.name || condition.textValue) : String(condition.textValue);
                    valueData = parseInt(condition.values || condition.textValue) || condition.values;
                } else if ((condition.tableColumnName === 'purchgrpid' || condition.tableColumnName === 'purchrgrpid') && purchasegrpList && purchasegrpList.length > 0) {
                    const grp = purchasegrpList.find(g => g.id === parseInt(condition.values || condition.textValue));
                    displayName = grp ? String(grp.groupName || grp.name || condition.textValue) : String(condition.textValue);
                    valueData = parseInt(condition.values || condition.textValue) || condition.values;
                } else if (condition.tableColumnName === 'projectid' && nfaProjectList && nfaProjectList.length > 0) {
                    const project = nfaProjectList.find(p => p.id === parseInt(condition.values || condition.textValue));
                    displayName = project ? String(project.name || condition.textValue) : String(condition.textValue);
                    valueData = parseInt(condition.values || condition.textValue) || condition.values;
                } else if (condition.tableColumnName === 'exceptionid' && nfaConditionList && nfaConditionList.length > 0) {
                    const exception = nfaConditionList.find(e => e.id === parseInt(condition.values || condition.textValue));
                    displayName = exception ? String(exception.name || condition.textValue) : String(condition.textValue);
                    valueData = parseInt(condition.values || condition.textValue) || condition.values;
                } else if (condition.tableColumnName === 'spendid' && nfaSpendList && nfaSpendList.length > 0) {
                    const spend = nfaSpendList.find(s => s.id === parseInt(condition.values || condition.textValue));
                    displayName = spend ? String(spend.name || condition.textValue) : String(condition.textValue);
                    valueData = parseInt(condition.values || condition.textValue) || condition.values;
                } else if (condition.tableColumnName === 'stage') {
                    // For stage field, use textValue as display and values should be null/0 since it's a string value
                    displayName = String(condition.textValue || condition.values);
                    valueData = null; // Stage uses textValue, not numeric values
                } else {
                    // For other fields (like nfaamount), keep as number if possible
                    displayName = String(condition.textValue || condition.values);
                    valueData = !isNaN(condition.values) ? parseFloat(condition.values) : condition.values;
                }

                return {
                    ...condition,
                    textValue: displayName,
                    values: valueData,
                    entity: condition.entity || condition.tablE_SCHEMA || "dbo",
                    wfRuleId: parseInt(condition.wfRuleId) || 0,
                    wfid: parseInt(condition.wfid) || 0
                };
            }),
            wfapproverusers: (rule.wfapproverusers || []).map(approver => ({
                ...approver,
                seqno: parseInt(approver.seqno) || 1,
                customerId: parseInt(approver.customerId) || parseInt(customerid) || 0,
                wfRuleId: parseInt(approver.wfRuleId) || 0,
                wfid: parseInt(approver.wfid) || parseInt(recorddataWF[0]?.id) || 0
            }))
        }));

        console.log("Final transformed rules with display names:", JSON.stringify(finalTransformedRules, null, 2));

        var WFdata = {
                id: recorddataWF[0]?.id ? recorddataWF[0]?.id : 0,
                customerId: parseInt(customerid) || 0,
                wfname: wfname,
                eventtype: eventType,
                stageId: actionType === "email" ? 0 : StageId,
                orgId: 0,
                wfoverride: true,
                required: mandatory,
                isactive: isActive,
                entity: "",
                purchorggroup: [], // Send empty array as requested
                wfRuleCriteria: finalTransformedRules
            };

        console.log("Final WFdata structure:", JSON.stringify(WFdata, null, 2));



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
    
    // Function to populate headerRows from purchorggroup data and rules with GetRulesColumn
    const populateHeaderRowsFromPurchorggroup = (purchorggroupData, rulesData = []) => {
        console.log('=== populateHeaderRowsFromPurchorggroup DEBUG ===');
        console.log('purchorggroupData:', JSON.stringify(purchorggroupData, null, 2));
        console.log('rulesData:', JSON.stringify(rulesData, null, 2));
        
        // For each purchorggroup item, associate ALL rules (since they all belong to the same workflow)
        // The purchorggroup defines the header, and all rules apply to that header
        const headerRowsData = purchorggroupData.map((item, headerIndex) => {
            console.log(`Processing purchorggroup item ${headerIndex}:`, item);
            
            let headerTitle = '';
            let headerGroup = '';
            let headerName = item.orgGroupName || `Header ${headerIndex + 1}`;

            if (item.orgId && item.orgId > 0) {
                // This is a Purchase Org entry
                headerTitle = 'Purchase Org';
                headerGroup = item.orgId.toString();
            } else if (item.orgGroupId && item.orgGroupId > 0) {
                // This is a Purchase Group entry
                headerTitle = 'Purchase Group';
                headerGroup = item.orgGroupId.toString();
            }

            console.log(`Header ${headerIndex} - Title: ${headerTitle}, Group: ${headerGroup}, Name: ${headerName}`);

            // Extract common conditions from GetRulesColumn (use first rule if available)
            const commonConditions = [];
            if (rulesData.length > 0) {
                console.log(`Checking GetRulesColumn in first rule:`, rulesData[0].GetRulesColumn);
                
                if (rulesData[0].GetRulesColumn && rulesData[0].GetRulesColumn.length > 0) {
                    console.log(`Found ${rulesData[0].GetRulesColumn.length} GetRulesColumn entries`);
                    
                    rulesData[0].GetRulesColumn.forEach((colRule, idx) => {
                        console.log(`Processing GetRulesColumn ${idx}:`, colRule);
                        
                        // Map operator string to the expected format
                        let operatorValue = 'Equals';
                        if (colRule.operator) {
                            const opLower = colRule.operator.toLowerCase();
                            if (opLower.includes('equal') && !opLower.includes('not')) operatorValue = 'Equals';
                            else if (opLower.includes('notequal')) operatorValue = 'NotEquals';
                            else if (opLower.includes('lessthan') && !opLower.includes('equal')) operatorValue = 'LessThan';
                            else if (opLower.includes('lessthan') && opLower.includes('equal')) operatorValue = 'LessThanOrEqual';
                            else if (opLower.includes('greaterthan') && !opLower.includes('equal')) operatorValue = 'GreaterThan';
                            else if (opLower.includes('greaterthan') && opLower.includes('equal')) operatorValue = 'GreaterThanOrEqual';
                        }
                        
                        // Get the raw field name and normalize it to the proper field ID
                        const rawFieldName = colRule.columN_NAME || colRule.columnName || colRule.COLUMN_NAME || '';
                        const normalizedField = normalizeFieldName(rawFieldName);
                        
                        // Convert value to string for consistent type matching with dropdowns
                        let conditionValue = colRule.value || '';
                        if (conditionValue !== '' && conditionValue !== null && conditionValue !== undefined) {
                            conditionValue = String(conditionValue);
                        }
                        
                        console.log(`Condition ${idx} - Raw field: ${rawFieldName}, Normalized: ${normalizedField}, Operator: ${operatorValue}, Value: ${conditionValue}`);
                        
                        commonConditions.push({
                            id: Date.now() + Math.random() + idx,
                            field: normalizedField,
                            operator: operatorValue,
                            value: conditionValue
                        });
                    });
                } else {
                    console.log('No GetRulesColumn data found in first rule');
                }
            } else {
                console.log('No rules data available');
            }

            console.log(`Header ${headerIndex} - Total common conditions created:`, commonConditions.length, commonConditions);

            // Create rules array from ALL rules data
            const headerRulesArray = rulesData.map((rule, ruleIdx) => {
                console.log(`\nProcessing Rule ${ruleIdx + 1}:`, rule);
                const ruleConditions = [];
                
                // Add conditions from workFlowRules (these are rule-specific, NOT common)
                if (rule.workFlowRules && rule.workFlowRules.length > 0) {
                    console.log(`Rule ${ruleIdx + 1} has ${rule.workFlowRules.length} workFlowRules`);
                    
                    rule.workFlowRules.forEach((wfRule, condIdx) => {
                        console.log(`  WorkFlowRule ${condIdx}:`, wfRule);
                        console.log(`  Raw values - values: ${wfRule.values} (type: ${typeof wfRule.values}), textValue: ${wfRule.textValue}, tableColumnName: ${wfRule.tableColumnName}`);
                        
                        // Convert value to string for consistent type matching with dropdowns
                        // For fields that use IDs (purchorgid, purchgrpid, etc.), use 'values' (the ID)
                        // For other fields, prefer 'values' but fall back to 'textValue'
                        let conditionValue;
                        const fieldName = (wfRule.tableColumnName || '').toLowerCase();
                        const isIdField = fieldName.includes('id') || fieldName === 'purchorgid' || fieldName === 'purchgrpid' || fieldName === 'projectid' || fieldName === 'exceptionid' || fieldName === 'spendid';
                        
                        console.log(`  Field "${wfRule.tableColumnName}" - isIdField: ${isIdField}, fieldName: ${fieldName}`);
                        
                        if (isIdField && wfRule.values !== null && wfRule.values !== undefined && wfRule.values !== '') {
                            // For ID fields, always use the numeric ID value
                            conditionValue = String(wfRule.values);
                            console.log(`  Using values (ID) for ${wfRule.tableColumnName}: ${conditionValue}`);
                        } else {
                            // For other fields, use values or fall back to textValue
                            conditionValue = wfRule.values !== null && wfRule.values !== undefined && wfRule.values !== '' 
                                ? String(wfRule.values) 
                                : (wfRule.textValue || '');
                            console.log(`  Using fallback for ${wfRule.tableColumnName}: ${conditionValue}`);
                        }
                        
                        console.log(`  FINAL Converted value for ${wfRule.tableColumnName}: "${conditionValue}" (type: ${typeof conditionValue})`);
                        
                        ruleConditions.push({
                            id: Date.now() + Math.random() + condIdx,
                            field: wfRule.tableColumnName || '',
                            operator: wfRule.characterEntity === '0' ? 'Equals' :
                                     wfRule.characterEntity === '1' ? 'NotEquals' :
                                     wfRule.characterEntity === '2' ? 'LessThan' :
                                     wfRule.characterEntity === '3' ? 'LessThanOrEqual' :
                                     wfRule.characterEntity === '4' ? 'GreaterThan' :
                                     wfRule.characterEntity === '5' ? 'GreaterThanOrEqual' : 'Equals',
                            value: conditionValue
                        });
                    });
                } else {
                    console.log(`Rule ${ruleIdx + 1} has NO workFlowRules`);
                }

                console.log(`Rule ${ruleIdx + 1} - Rule-specific conditions:`, ruleConditions);
                console.log(`Rule ${ruleIdx + 1} - Common conditions to merge:`, commonConditions);

                // Merge common conditions with rule-specific conditions for display
                const allConditions = [...commonConditions, ...ruleConditions];

                console.log(`Rule ${ruleIdx + 1} - ALL conditions (common + specific):`, allConditions);

                const createdRule = {
                    id: Date.now() + Math.random() + ruleIdx,
                    name: rule.ruleName || `Rule ${ruleIdx + 1}`,
                    conditions: allConditions, // Include both common and rule-specific
                    approvers: rule.wfapproverusers || [],
                    expanded: true
                };
                
                console.log(`Rule ${ruleIdx + 1} - CREATED RULE OBJECT:`, JSON.stringify(createdRule, null, 2));

                return createdRule;
            });

            console.log(`Header ${headerIndex} - Created ${headerRulesArray.length} rules`);

            const headerObj = {
                id: Date.now() + Math.random(), // Generate unique ID
                headerTitle: headerTitle,
                headerGroup: headerGroup,
                headerName: headerName,
                conditions: commonConditions, // Populate from GetRulesColumn
                rules: headerRulesArray, // Populate with converted rules
                approvers: [] // Initialize empty approvers array for each header
            };
            
            console.log(`Header ${headerIndex} final object:`, headerObj);
            return headerObj;
        }).filter(item => {
            console.log('Filtering item:', item, 'headerTitle:', item.headerTitle);
            return item.headerTitle !== '';
        }); // Only include valid entries

        console.log('=== FINAL Generated headerRows ===');
        console.log(JSON.stringify(headerRowsData, null, 2));
        
        // Pre-fetch purchase groups for all unique organization IDs in the headers
        const orgIdsToFetch = new Set();
        headerRowsData.forEach(header => {
            // Check common conditions
            const purchOrgCondition = header.conditions?.find(c => 
                c.field === 'purchorgid' || 
                c.field?.toLowerCase() === 'purchase org' ||
                formatFieldDisplayName(c.field) === 'Purchase Org'
            );
            if (purchOrgCondition && purchOrgCondition.value) {
                orgIdsToFetch.add(parseInt(purchOrgCondition.value));
            }
            
            // Check rule conditions
            header.rules?.forEach(rule => {
                const rulePurchOrgCondition = rule.conditions?.find(c => 
                    c.field === 'purchorgid' || 
                    c.field?.toLowerCase() === 'purchase org' ||
                    formatFieldDisplayName(c.field) === 'Purchase Org'
                );
                if (rulePurchOrgCondition && rulePurchOrgCondition.value) {
                    orgIdsToFetch.add(parseInt(rulePurchOrgCondition.value));
                }
            });
        });
        
        // Fetch groups for all unique org IDs to populate cache
        console.log('Pre-fetching purchase groups for orgs:', Array.from(orgIdsToFetch));
        orgIdsToFetch.forEach(orgId => {
            if (orgId > 0) {
                getPurchasegrplist(orgId);
            }
        });
        
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
                    
                    // Load purchorggroup data and populate headerRows with GetRulesColumn data
                    if (res[0]?.purchorggroup && res[0].purchorggroup.length > 0) {
                        console.log('Loading purchorggroup data:', res[0].purchorggroup);
                        // Pass the normalized rules data with properly transformed approvers
                        populateHeaderRowsFromPurchorggroup(res[0].purchorggroup, normalizedRules);
                    } else if (resRule && resRule.length > 0) {
                        // If no purchorggroup but there are rules, create headers for each rule group
                        console.log('No purchorggroup, creating headers based on rule names');
                        console.log('Original rules data:', resRule);
                        
                        // Group rules by their name prefix (e.g., "IGESL Rule 1" -> "IGESL", "SCM Rule 1" -> "SCM")
                        const ruleGroups = new Map();
                        
                        resRule.forEach((rule, idx) => {
                            // Extract prefix from rule name (e.g., "IGESL Rule 1" -> "IGESL")
                            let groupKey = rule.ruleName || `Rule ${idx + 1}`;
                            
                            // Try to extract prefix before "Rule" keyword
                            const match = groupKey.match(/^(.*?)\s*Rule\s*\d+$/i);
                            if (match && match[1].trim()) {
                                groupKey = match[1].trim();
                            }
                            
                            if (!ruleGroups.has(groupKey)) {
                                ruleGroups.set(groupKey, []);
                            }
                            ruleGroups.get(groupKey).push({ originalRule: rule, index: idx });
                        });
                        
                        console.log('Rule groups created:', Array.from(ruleGroups.keys()));
                        
                        // Create a header for each rule group
                        const headers = [];
                        
                        ruleGroups.forEach((rulesInGroup, groupKey) => {
                            console.log(`\nProcessing group: ${groupKey} with ${rulesInGroup.length} rules`);
                            
                            // Find common conditions within this group
                            const commonConditionsMap = new Map();
                            
                            if (rulesInGroup.length === 1) {
                                // Single rule in group: ALL conditions become common conditions
                                const rule = rulesInGroup[0].originalRule;
                                console.log("=== Single rule conditions ===", rule.workFlowRules);
                                if (rule.workFlowRules && rule.workFlowRules.length > 0) {
                                    rule.workFlowRules.forEach((condition, idx) => {
                                        console.log(`Condition ${idx}: characterEntity="${condition.characterEntity}", tableColumnName="${condition.tableColumnName}", value="${condition.values}"`);
                                        const key = `${condition.tableColumnName}_${String(condition.values)}_${condition.characterEntity}`;
                                        if (!commonConditionsMap.has(key)) {
                                            const mappedOperator = condition.characterEntity === '0' ? 'Equals' :
                                                         condition.characterEntity === '1' ? 'NotEquals' :
                                                         condition.characterEntity === '2' ? 'LessThan' :
                                                         condition.characterEntity === '3' ? 'LessThanOrEqual' :
                                                         condition.characterEntity === '4' ? 'GreaterThan' :
                                                         condition.characterEntity === '5' ? 'GreaterThanOrEqual' : 'Equals';
                                            console.log(`  Mapped to operator: ${mappedOperator}`);
                                            // For select-based fields, use values (ID) instead of textValue (label)
                                            const shouldUseId = ['purchorgid', 'purchgrpid', 'purchrgrpid', 'projectid', 'exceptionid', 'spendid'].includes(condition.tableColumnName);
                                            commonConditionsMap.set(key, {
                                                id: Date.now() + Math.random() + idx,
                                                field: condition.tableColumnName,
                                                operator: mappedOperator,
                                                value: shouldUseId ? String(condition.values || '') : String(condition.textValue || condition.values || '')
                                            });
                                        }
                                    });
                                }
                            } else {
                                // Multiple rules in group: Find shared conditions
                                const firstRule = rulesInGroup[0].originalRule;
                                if (firstRule.workFlowRules && firstRule.workFlowRules.length > 0) {
                                    firstRule.workFlowRules.forEach(condition => {
                                        const isCommon = rulesInGroup.every(({ originalRule }) => {
                                            return originalRule.workFlowRules && originalRule.workFlowRules.some(c => 
                                                c.tableColumnName === condition.tableColumnName && 
                                                String(c.values) === String(condition.values) &&
                                                c.characterEntity === condition.characterEntity
                                            );
                                        });
                                        
                                        if (isCommon) {
                                            const key = `${condition.tableColumnName}_${String(condition.values)}_${condition.characterEntity}`;
                                            if (!commonConditionsMap.has(key)) {
                                                // For select-based fields, use values (ID) instead of textValue (label)
                                                const shouldUseId = ['purchorgid', 'purchgrpid', 'purchrgrpid', 'projectid', 'exceptionid', 'spendid'].includes(condition.tableColumnName);
                                                commonConditionsMap.set(key, {
                                                    id: Date.now() + Math.random(),
                                                    field: condition.tableColumnName,
                                                    operator: condition.characterEntity === '0' ? 'Equals' :
                                                             condition.characterEntity === '1' ? 'NotEquals' :
                                                             condition.characterEntity === '2' ? 'LessThan' :
                                                             condition.characterEntity === '3' ? 'LessThanOrEqual' :
                                                             condition.characterEntity === '4' ? 'GreaterThan' :
                                                             condition.characterEntity === '5' ? 'GreaterThanOrEqual' : 'Equals',
                                                    value: shouldUseId ? String(condition.values || '') : String(condition.textValue || condition.values || '')
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                            
                            const commonConditions = Array.from(commonConditionsMap.values());
                            console.log(`Group ${groupKey} - Common conditions:`, commonConditions);
                            
                            // Create rules for this group
                            const groupRules = rulesInGroup.map(({ originalRule, index }) => {
                                // Get the normalized rule for approver data (which has been properly transformed)
                                const normalizedRule = normalizedRules[index];
                                const ruleConditions = [];
                                
                                // Filter out common conditions from the original rule's workFlowRules
                                // to get only rule-specific conditions
                                if (originalRule.workFlowRules && originalRule.workFlowRules.length > 0) {
                                    originalRule.workFlowRules.forEach((wfRule, condIdx) => {
                                        // Check if this condition is NOT in the common conditions
                                        // For dropdown fields, compare using values (IDs), not textValue (labels)
                                        const shouldUseId = ['purchorgid', 'purchgrpid', 'purchrgrpid', 'projectid', 'exceptionid', 'spendid'].includes(wfRule.tableColumnName);
                                        const wfRuleValue = shouldUseId ? String(wfRule.values || '') : String(wfRule.textValue || wfRule.values || '');
                                        
                                        const isCommonCondition = Array.from(commonConditionsMap.values()).some(cc => 
                                            cc.field === wfRule.tableColumnName && 
                                            cc.value === wfRuleValue &&
                                            cc.operator === (wfRule.characterEntity === '0' ? 'Equals' :
                                                           wfRule.characterEntity === '1' ? 'NotEquals' :
                                                           wfRule.characterEntity === '2' ? 'LessThan' :
                                                           wfRule.characterEntity === '3' ? 'LessThanOrEqual' :
                                                           wfRule.characterEntity === '4' ? 'GreaterThan' :
                                                           wfRule.characterEntity === '5' ? 'GreaterThanOrEqual' : 'Equals')
                                        );
                                        
                                        if (!isCommonCondition) {
                                            // This is a rule-specific condition
                                            ruleConditions.push({
                                                id: Date.now() + Math.random() + condIdx,
                                                field: wfRule.tableColumnName || '',
                                                operator: wfRule.characterEntity === '0' ? 'Equals' :
                                                         wfRule.characterEntity === '1' ? 'NotEquals' :
                                                         wfRule.characterEntity === '2' ? 'LessThan' :
                                                         wfRule.characterEntity === '3' ? 'LessThanOrEqual' :
                                                         wfRule.characterEntity === '4' ? 'GreaterThan' :
                                                         wfRule.characterEntity === '5' ? 'GreaterThanOrEqual' : 'Equals',
                                                value: wfRuleValue
                                            });
                                        }
                                    });
                                }
                                
                                // Merge common and specific conditions for display
                                // Each rule shows ALL its conditions (common + specific) for clarity
                                // The backend will properly separate them when saving
                                const allConditions = [...commonConditions, ...ruleConditions];
                                
                                console.log(`Rule ${originalRule.ruleName} - Common: ${commonConditions.length}, Specific: ${ruleConditions.length}, Total: ${allConditions.length}`);
                                
                                return {
                                    id: Date.now() + Math.random() + index,
                                    name: originalRule.ruleName || `Rule ${index + 1}`,
                                    conditions: allConditions, // Show all conditions (common + rule-specific)
                                    approvers: normalizedRule.wfapproverusers || [], // Use transformed approvers from normalizedRule
                                    expanded: true
                                };
                            });
                            
                            console.log(`Group ${groupKey} - Created ${groupRules.length} rules`);
                            
                            // Create header for this group
                            headers.push({
                                id: Date.now() + Math.random(),
                                headerTitle: '',
                                headerGroup: '',
                                headerName: groupKey,
                                conditions: commonConditions,
                                rules: groupRules,
                                approvers: []
                            });
                        });
                        
                        console.log('Created headers:', headers);
                        setHeaderRows(headers);
                    }
                });
                
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
            createdby: userdetails?.id || 0,
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
        
        // Clear workflow data when switching to email (without confirmation)
        if (newValue === "email" && actionType === "workflow") {
            setRecorddataWF([]);
            setwfname('');
            setinputCriteriaList([]);
            setHeaderRows([]);
            setWfid(0);
            formik.setFieldValue("wfname", "");
            formik.setFieldValue("wfId", 0);
        } else if (newValue === "workflow" && actionType === "email") {
            // Clear email data when switching to workflow (without confirmation)
            setInputList([]);
            setemailId(null);
            setrejectedEmailId(null);
            formik.setFieldValue("emailId", null);
            formik.setFieldValue("rejectedEmailId", null);
        }
      };
      const handleConfirmDialogClose = (confirm) => {
        setConfirmChangeDialogOpen(false);
    
        if (confirm) {
            setActionType(nextActionType);
    
            if (nextActionType === "workflow") {
                setInputList([]); // Clears email-related data
                setemailId(null);
                setrejectedEmailId(null);
                formik.setFieldValue("emailId", null);
                formik.setFieldValue("rejectedEmailId", null);
            } else if (nextActionType === "email") {
                // Clear workflow-related data when switching to email
                setRecorddataWF([]);
                setwfname('');
                setinputCriteriaList([]);
                setHeaderRows([]);
                setWfid(0);
                formik.setFieldValue("wfname", "");
                formik.setFieldValue("wfId", 0);
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
    const userList = async (customerId) => {
        try {
            var data = {
                CustomerId: customerid,
            };
            const res = await getuserlist(data, atoken);
            if (res && Array.isArray(res) && res.length > 0) {
                console.log('Loaded user options:', res);
                setUserOptions(res);
                return res;
            } else {
                console.warn('No users returned from API');
                setUserOptions([]);
                return [];
            }
        } catch (error) {
            console.error('Error loading user list:', error);
            toast.error('Failed to load user list', { autoClose: 3000 });
            setUserOptions([]);
            return [];
        }
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
        
        console.log("=== handlecharacterChange called ===", {
            index,
            i,
            newValue: event.target.value,
            currentValue: inputCriteriaList[index]?.workFlowRules?.[i]?.characterEntity,
            tableColumnName: inputCriteriaList[index]?.workFlowRules?.[i]?.tableColumnName
        });
        
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
        
        console.log("=== Updated characterEntity ===", {
            newCharacterEntity: newCriteriaList[index].workFlowRules[i].characterEntity,
            fullRule: newCriteriaList[index].workFlowRules[i]
        });
        
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
            // If changing a value for Purchase Org field, fetch purchase groups
            if ((rule.tableColumnName === 'purchorgid' || 
                 rule.tableColumnName?.toLowerCase() === 'purchase org') && 
                event.target.value) {
                console.log("Fetching purchase groups for org in handleRuleValueChange:", event.target.value);
                getPurchasegrplist(parseInt(event.target.value));
            }
            
            if (rule.tableColumnName === "stage") {
                rule.textValue = event.target.value;
                rule.values = null; // Set to null instead of empty string for stage fields
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

     
      const getPurchasegrplist = (OrgMstId, cacheOnly = false) => {
        // Only fetch groups if OrgMstId is provided
        if (!OrgMstId || OrgMstId <= 0) {
            console.warn("OrgMstId is required to fetch purchase groups");
            setpurchasegrpList([]);
            return Promise.resolve([]);
        }
        
        // Check cache first
        if (purchaseGroupsCache[OrgMstId]) {
          
            setpurchasegrpList(purchaseGroupsCache[OrgMstId]);
            return Promise.resolve(purchaseGroupsCache[OrgMstId]);
        }
        
        if (cacheOnly) {
            return Promise.resolve([]);
        }
        
        const data = {
            OrgMstId: OrgMstId,
            CustomerId: customerid
         };
        
        console.log("Fetching purchase groups with data:", data);
        return OrgGroupMasterList(data, atoken)
          .then((res) => {
            if (res && Array.isArray(res)) {			 
              // Cache the results
              setPurchaseGroupsCache(prev => ({
                ...prev,
                [OrgMstId]: res
              }));
              setpurchasegrpList(res);
              console.log("Purchase Groups loaded and cached:", res);
              return res;
            } else {
              setpurchasegrpList([]);
              return [];
            }
          })
          .catch((error) => {
            console.error("Error fetching purchase groups:", error);
            setpurchasegrpList([]);
            return [];
          });
      };
    const onchangePurchOrg = (event, newValue) => {
        if (newValue) {
            setorgMstId(newValue.id);

            if (newValue.id === "new") {
                setPurchaseOrgModal(true);
            } else {
                console.log("Purchase Organization selected:", newValue);
                // Fetch purchase groups for the selected organization
                getPurchasegrplist(newValue.id);
            }
        } else {
            // Clear groups when no organization is selected
            setorgMstId(null);
            setpurchasegrpList([]);
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

            {/* Back Button Header */}
            {onCancel && (
                <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <BackStageButton onClick={onCancel} />
                    <Typography variant="h6" sx={{ fontWeight: 400, color: '#2c3e50' }}>
                        {editRecordData ? 'Edit Stage' : 'Add New Stage'}
                    </Typography>
                </div>
            )}

            <form onSubmit={formik.handleSubmit} autoComplete="off">
                {/* Basic Information Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="bg-white p-3 border rounded" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
                           <div className="row align-items-end">

  {/* Event Type */}
  <div className="col-12 col-md-3 col-lg-3 mb-3">
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
          fontSize: "13px",
          fontStyle: "italic",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        + Add New
      </MenuItem>
    </TextField>

    {formik.errors.eventType && formik.touched.eventType && (
      <div className="error error-red" style={{ fontSize: "9px" }}>
        {formik.errors.eventType}
      </div>
    )}
  </div>

  {/* Stage Name */}
  <div className="col-12 col-md-3 col-lg-3 mb-3">
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
              {stageName?.length || 0}/100
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

  {/* Stage Sequence */}
  <div className="col-12 col-md-1 col-lg-1 mb-3">
    <TextFieldCell
      id="stageSeq"
      name="stageSeq"
      label="Stage Seq*"
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

  {/* Required */}
  <div className="col-6 col-md-2 col-lg-2 mb-3 d-flex align-items-center">
    <span className="f12 me-2">Required</span>
    <Switch
      name="mandatory"
      id="mandatory"
      checked={mandatory}
      onChange={(e) => setmandatory(e.target.checked)}
      disabled={!editYN}
      size="small"
      color="primary"
    />
  </div>

  {/* Active */}
  <div className="col-6 col-md-2 col-lg-2 mb-3 d-flex align-items-center">
    <span className="f12 me-2">Active</span>
    <Switch
      name="isActive"
      id="isActive"
      checked={isActive}
      onChange={(e) => setisActive(e.target.checked)}
      disabled={!editYN}
      size="small"
      color="primary"
    />
  </div>

</div>

                        </div>
                    </div>
                </div>

            
            

                {/* Card 1: Workflow Configuration */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card shadow-sm border-1" style={{ borderRadius: '8px' }}>
                            <div className="card-body p-4">
                                {/* Card Header */}
                                

                                {/* Action Upon Stage - All in One Row */}
                                <div className="mb-4">
                                    <h6 className="mb-3" style={{ fontWeight: '600', color: '#2d3436' }}>
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






                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Action Upon Approval/Rejection */}
           {/* CARD 2: Action Upon Approval/Rejection */}
<div className="row mb-4">
    <div className="col-12">
        <div className="card border-0" style={{ borderRadius: "8px" }}>

            {/* Header Configuration - only show when workflow is selected */}
            {actionType === "workflow" && (
                <div
                    className="p-3 rounded mb-4"
                    style={{
                        backgroundColor: "white",
                        border: "1px solid #e9ecef",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                            <h6 className="preview-section-heading mb-0"></h6>
                        </div>

                        <div className="d-flex gap-2">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleOpenManageUsersModal}
                                startIcon={<GroupAddIcon />}
                                style={{
                                    borderRadius: "6px",
                                    textTransform: "none",
                                    fontWeight: "500",
                                    borderColor: "#d0d5dd",
                                    color: "#344054",
                                    backgroundColor: "#ffffff"
                                }}
                            >
                                Manage Users
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={handleAddHeader}
                                startIcon={<AddIcon />}
                                style={{
                                    borderRadius: "6px",
                                    textTransform: "none",
                                    fontWeight: "500",
                                    backgroundColor: "#2A68D3",
                                    boxShadow: "0 2px 8px rgba(108, 92, 231, 0.3)"
                                }}
                            >
                                Add Workflow
                            </Button>
                        </div>
                    </div>

                    {/* Header Accordions - Only show when there are rows */}
                    {headerRows.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {headerRows.map((row, index) => (
                                <Accordion
                                    key={row.id}
                                    defaultExpanded={false}
                                    sx={{
                                        border: "1px solid #e9ecef",
                                        borderRadius: "8px !important",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                        "&:before": { display: "none" },
                                        mb: 1
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            backgroundColor: "FFFFFF",
                                            borderRadius: "8px",
                                            minHeight: "56px",
                                            "&.Mui-expanded": { minHeight: "56px" }
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                width: "100%",
                                                paddingRight: "16px"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#e3f2fd",
                                                        color: "#2A68D3",
                                                        width: "32px",
                                                        height: "32px",
                                                        "&:hover": { backgroundColor: "#bbdefb" }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <HiOutlineFilter size={16} />
                                                </IconButton>

                                                <div>
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: "14px",
                                                            color: "#2c3e50"
                                                        }}
                                                    >
                                                        {row.headerName}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: "#636e72", fontSize: "11px" }}
                                                    >
                                                        {row.rules?.length || 0} Rules
                                                    </Typography>
                                                </div>
                                            </div>

                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveHeader(row.id);
                                                }}
                                                size="small"
                                                sx={{
                                                    color: "#e74c3c",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(231, 76, 60, 0.08)"
                                                    }
                                                }}
                                            >
                                                <HiOutlineTrash size={16} />
                                            </IconButton>
                                        </div>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ padding: 0 }}>

                                        {/* Common Conditions Section */}
                                        <div
                                            style={{
                                                padding: "16px",
                                                backgroundColor: "FFFFFF",
                                                borderBottom: "1px solid #e9ecef"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "12px"
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <HiOutlineFilter
                                                        size={14}
                                                        style={{ color: "#636e72" }}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: "#2c3e50",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        Common Conditions
                                                    </Typography>
                                                </div>

                                                <Button
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={() =>
                                                        handleAddConditionToHeader(row.id)
                                                    }
                                                    sx={{
                                                        textTransform: "none",
                                                        fontSize: "11px",
                                                        fontWeight: 500,
                                                        color: "#2A68D3",
                                                        padding: "4px 8px",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "rgba(42, 104, 211, 0.04)"
                                                        }
                                                    }}
                                                >
                                                    Add Condition
                                                </Button>
                                            </div>

                                            {/* Conditions List */}
                                            {row.conditions && row.conditions.length > 0 ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "10px"
                                                    }}
                                                >
                                                    {row.conditions.map(
                                                        (condition, idx) => (
                                                            <div
                                                                key={
                                                                    condition.id ||
                                                                    idx
                                                                }
                                                                style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns:
                                                                        "1fr 1fr 1fr 40px",
                                                                    gap: "8px",
                                                                    alignItems:
                                                                        "center",
                                                                    padding:
                                                                        "10px",
                                                                    backgroundColor:
                                                                        "#fff",
                                                                    border:
                                                                        "1px solid #e9ecef",
                                                                    borderRadius:
                                                                        "6px"
                                                                }}
                                                            >
                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    variant="outlined"
                                                                    value={
                                                                        condition.field
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateHeaderCondition(
                                                                            row.id,
                                                                            condition.id,
                                                                            "field",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder="Select field"
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root":
                                                                            {
                                                                                fontSize:
                                                                                    "12px",
                                                                                backgroundColor:
                                                                                    "#fff"
                                                                            }
                                                                    }}
                                                                >
                                                                    <MenuItem value="">Select...</MenuItem>
                                                                    {RulesList && RulesList.length > 0 ? (
                                                                        RulesList.map((rule) => (
                                                                            <MenuItem key={rule.columN_NAME} value={rule.columN_NAME}>
                                                                                {formatFieldDisplayName(rule.columN_NAME)}
                                                                            </MenuItem>
                                                                        ))
                                                                    ) : (
                                                                        <>
                                                                            <MenuItem value="OrgName">OrgName</MenuItem>
                                                                            <MenuItem value="amountFrom">amountFrom</MenuItem>
                                                                            <MenuItem value="amountTo">amountTo</MenuItem>
                                                                        </>
                                                                    )}
                                                                </TextField>

                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    variant="outlined"
                                                                    value={
                                                                        condition.operator
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateHeaderCondition(
                                                                            row.id,
                                                                            condition.id,
                                                                            "operator",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root":
                                                                            {
                                                                                fontSize:
                                                                                    "12px",
                                                                                backgroundColor:
                                                                                    "#fff"
                                                                            }
                                                                    }}
                                                                >
                                                                    <MenuItem value="Equals">Equals</MenuItem>
                                                                    <MenuItem value="NotEquals">Not Equals</MenuItem>
                                                                    <MenuItem value="LessThan">Less Than</MenuItem>
                                                                    <MenuItem value="LessThanOrEqual">Less Than or Equal</MenuItem>
                                                                    <MenuItem value="GreaterThan">Greater Than</MenuItem>
                                                                    <MenuItem value="GreaterThanOrEqual">Greater Than or Equal</MenuItem>
                                                                    <MenuItem value="Contains">Contains</MenuItem>
                                                                </TextField>

                                                                {/* Value Input - Conditional based on field type */}
                                                                {(condition.field === 'purchorgid' || condition.field?.toLowerCase() === 'purchase org' || formatFieldDisplayName(condition.field) === 'Purchase Org') ? (
                                                                    <TextField
                                                                        select
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={condition.value ? String(condition.value) : ''}
                                                                        onChange={(e) =>
                                                                            handleUpdateHeaderCondition(
                                                                                row.id,
                                                                                condition.id,
                                                                                "value",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Select Purchase Organization"
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                fontSize: "12px",
                                                                                backgroundColor: "#fff"
                                                                            }
                                                                        }}
                                                                    >
                                                                        <MenuItem value="">Select...</MenuItem>
                                                                        {purchaseAllList && purchaseAllList.length > 0 ? (
                                                                            purchaseAllList.map((org) => (
                                                                                <MenuItem key={org.id} value={String(org.id)}>
                                                                                    {org.orgName || org.name}
                                                                                </MenuItem>
                                                                            ))
                                                                        ) : (
                                                                            <MenuItem disabled>No Purchase Organizations available</MenuItem>
                                                                        )}
                                                                    </TextField>
                                                                ) : (condition.field === 'purchrgrpid' || condition.field === 'purchgrpid' || condition.field?.toLowerCase() === 'purchase group' || formatFieldDisplayName(condition.field) === 'Purchase Group') ? (
                                                                    <TextField
                                                                        select
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={condition.value ? String(condition.value) : ''}
                                                                        onChange={(e) =>
                                                                            handleUpdateHeaderCondition(
                                                                                row.id,
                                                                                condition.id,
                                                                                "value",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Select Purchase Group"
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                fontSize: "12px",
                                                                                backgroundColor: "#fff"
                                                                            }
                                                                        }}
                                                                    >
                                                                        <MenuItem value="">Select...</MenuItem>
                                                                        {(() => {
                                                                            const groupsForHeader = getPurchaseGroupsForConditions(row.conditions);
                                                                            return groupsForHeader && groupsForHeader.length > 0 ? (
                                                                                groupsForHeader.map((grp) => (
                                                                                    <MenuItem key={grp.id} value={String(grp.id)}>
                                                                                        {grp.groupName || grp.name}
                                                                                    </MenuItem>
                                                                                ))
                                                                            ) : (
                                                                                <MenuItem disabled>No Purchase Groups available</MenuItem>
                                                                            );
                                                                        })()}
                                                                    </TextField>
                                                                ) : condition.field === 'projectid' ? (
                                                                    <TextField
                                                                        select
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={condition.value}
                                                                        onChange={(e) =>
                                                                            handleUpdateHeaderCondition(
                                                                                row.id,
                                                                                condition.id,
                                                                                "value",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Select Project"
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                fontSize: "12px",
                                                                                backgroundColor: "#fff"
                                                                            }
                                                                        }}
                                                                    >
                                                                        <MenuItem value="">Select...</MenuItem>
                                                                        {nfaProjectList && nfaProjectList.length > 0 ? (
                                                                            nfaProjectList.map((project) => (
                                                                                <MenuItem key={project.id} value={project.id}>
                                                                                    {project.project || project.name}
                                                                                </MenuItem>
                                                                            ))
                                                                        ) : (
                                                                            <MenuItem disabled>No Projects available</MenuItem>
                                                                        )}
                                                                    </TextField>
                                                                ) : condition.field === 'exceptionid' ? (
                                                                    <TextField
                                                                        select
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={condition.value}
                                                                        onChange={(e) =>
                                                                            handleUpdateHeaderCondition(
                                                                                row.id,
                                                                                condition.id,
                                                                                "value",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Select Exception"
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                fontSize: "12px",
                                                                                backgroundColor: "#fff"
                                                                            }
                                                                        }}
                                                                    >
                                                                        <MenuItem value="">Select...</MenuItem>
                                                                        {nfaConditionList && nfaConditionList.length > 0 ? (
                                                                            nfaConditionList.map((exception) => (
                                                                                <MenuItem key={exception.id} value={exception.id}>
                                                                                    {exception.exception || exception.name}
                                                                                </MenuItem>
                                                                            ))
                                                                        ) : (
                                                                            <MenuItem disabled>No Exceptions available</MenuItem>
                                                                        )}
                                                                    </TextField>
                                                                ) : condition.field === 'spendid' ? (
                                                                    <TextField
                                                                        select
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={condition.value}
                                                                        onChange={(e) =>
                                                                            handleUpdateHeaderCondition(
                                                                                row.id,
                                                                                condition.id,
                                                                                "value",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Select Spend"
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                fontSize: "12px",
                                                                                backgroundColor: "#fff"
                                                                            }
                                                                        }}
                                                                    >
                                                                        <MenuItem value="">Select...</MenuItem>
                                                                        {nfaSpendList && nfaSpendList.length > 0 ? (
                                                                            nfaSpendList.map((spend) => (
                                                                                <MenuItem key={spend.id} value={spend.id}>
                                                                                    {spend.spend || spend.name}
                                                                                </MenuItem>
                                                                            ))
                                                                        ) : (
                                                                            <MenuItem disabled>No Spend options available</MenuItem>
                                                                        )}
                                                                    </TextField>
                                                                ) : (
                                                                    <TextField
                                                                        size="small"
                                                                        variant="outlined"
                                                                        value={condition.value}
                                                                        onChange={(e) =>
                                                                            handleUpdateHeaderCondition(
                                                                                row.id,
                                                                                condition.id,
                                                                                "value",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        placeholder="Enter value"
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                fontSize: "12px",
                                                                                backgroundColor: "#fff"
                                                                            }
                                                                        }}
                                                                    />
                                                                )}

                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() =>
                                                                        handleRemoveConditionFromHeader(
                                                                            row.id,
                                                                            condition.id
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        color:
                                                                            "#e74c3c",
                                                                        "&:hover":
                                                                            {
                                                                                backgroundColor:
                                                                                    "rgba(231, 76, 60, 0.08)"
                                                                            }
                                                                    }}
                                                                >
                                                                    <HiOutlineTrash
                                                                        size={14}
                                                                    />
                                                                </IconButton>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#636e72",
                                                        fontSize: "11px",
                                                        fontStyle: "italic",
                                                        display: "block",
                                                        textAlign: "center",
                                                        py: 1
                                                    }}
                                                >
                                                    No conditions added yet. Click
                                                    "Add Condition" to create one.
                                                </Typography>
                                            )}
                                        </div>

                                        {/* Workflow Rules Section */}
                                        <div
                                            style={{
                                                padding: "16px",
                                                backgroundColor: "#fff"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "12px"
                                                }}
                                            >
                                               

                                               
                                            </div>
    {/* Approver Table */}
                                         
                                            
                                         
                                            <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #e9ecef' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#2c3e50',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        Workflow Rules ({row.rules?.length || 0})
                                                    </Typography>
                                                    
                                                    <Button
                                                        size="small"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => handleAddRuleToHeader(row.id)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                            color: '#2A68D3',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(42, 104, 211, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        Add Rule
                                                    </Button>
                                                </div>
                                                
                                                {row.rules && row.rules.length > 0 ? (
                                                    row.rules.map((rule, ruleIdx) => (
                                                        <div
                                                            key={ruleIdx}
                                                            style={{
                                                                marginBottom: '16px',
                                                                backgroundColor: 'white',
                                                                border: '1px solid #e9ecef',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden'
                                                            }}
                                                        >
                                                          
                                                            <div 
                                                                style={{
                                                                    padding: '12px 16px',
                                                                    backgroundColor: '#FFFFFF',
                                                                    borderBottom: '1px solid #e9ecef',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => handleToggleRule(row.id, rule.id)}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{
                                                                            padding: '2px',
                                                                            transition: 'transform 0.2s',
                                                                            transform: rule.expanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                                                                        }}
                                                                    >
                                                                        <ExpandMoreIcon style={{ fontSize: '20px', color: '#636e72' }} />
                                                                    </IconButton>
                                                                    <HiFilter style={{ color: '#0969da', fontSize: '16px' }} />
                                                                    <Typography variant="subtitle2" style={{ fontWeight: '600', color: '#2d3436', fontSize: '13px' }}>
                                                                        {rule.name || rule.ruleName || `Rule ${ruleIdx + 1}`}
                                                                    </Typography>
                                                                    <Typography variant="caption" style={{ color: '#656d76', fontSize: '11px' }}>
                                                                        • {rule.conditions?.length || 0} Condition{(rule.conditions?.length || 0) !== 1 ? 's' : ''}
                                                                        {rule.approvers?.length > 0 && ` • ${rule.approvers.length} Approver${rule.approvers.length !== 1 ? 's' : ''}`}
                                                                    </Typography>
                                                                </div>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveRuleFromHeader(row.id, rule.id);
                                                                    }}
                                                                    sx={{
                                                                        color: '#e74c3c',
                                                                        '&:hover': {
                                                                            backgroundColor: 'rgba(231, 76, 60, 0.08)'
                                                                        }
                                                                    }}
                                                                    title="Remove Rule"
                                                                >
                                                                    <HiOutlineTrash size={14} />
                                                                </IconButton>
                                                            </div>
                                                            
                                                            {/* Conditionally render rule content based on expanded state */}
                                                            {rule.expanded && (
                                                            <>
                                                            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f3f5' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <Typography variant="caption" style={{ fontWeight: '600', color: '#495057', fontSize: '11px' }}>
                                                                        CONDITIONS
                                                                    </Typography>
                                                                    <Button
                                                                        size="small"
                                                                        startIcon={<AddIcon />}
                                                                        onClick={() => handleAddConditionToRule(row.id, rule.id)}
                                                                        sx={{
                                                                            textTransform: 'none',
                                                                            fontSize: '11px',
                                                                            fontWeight: 500,
                                                                            color: '#2A68D3',
                                                                            padding: '2px 8px',
                                                                            minWidth: 'auto',
                                                                            '&:hover': {
                                                                                backgroundColor: 'rgba(42, 104, 211, 0.04)'
                                                                            }
                                                                        }}
                                                                    >
                                                                        Add Condition
                                                                    </Button>
                                                                </div>
                                                                
                                                                {rule.conditions && rule.conditions.length > 0 ? (
                                                                    rule.conditions.map((condition, condIdx) => (
                                                                        <div key={condition.id} style={{
                                                                            display: 'flex',
                                                                            gap: '8px',
                                                                            marginBottom: '8px',
                                                                            alignItems: 'center'
                                                                        }}>
                                                                            <TextField
                                                                                select
                                                                                size="small"
                                                                                value={condition.field || ''}
                                                                                onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'field', e.target.value)}
                                                                                sx={{ minWidth: '180px', fontSize: '12px' }}
                                                                            >
                                                                                <MenuItem value="">Select Field</MenuItem>
                                                                                {RulesList && RulesList.length > 0 ? (
                                                                                    RulesList.map((rule) => (
                                                                                        <MenuItem key={rule.columN_NAME} value={rule.columN_NAME}>
                                                                                            {formatFieldDisplayName(rule.columN_NAME)}
                                                                                        </MenuItem>
                                                                                    ))
                                                                                ) : (
                                                                                    <>
                                                                                        <MenuItem value="purchrgrpid">Purchase Group</MenuItem>
                                                                                        <MenuItem value="purchorgid">Purchase Org</MenuItem>
                                                                                        <MenuItem value="nfaamount">NFA Amount</MenuItem>
                                                                                        <MenuItem value="projectid">Project</MenuItem>
                                                                                        <MenuItem value="exceptionid">Exception</MenuItem>
                                                                                        <MenuItem value="spendid">Spend</MenuItem>
                                                                                    </>
                                                                                )}
                                                                            </TextField>
                                                                            
                                                                            <TextField
                                                                                select
                                                                                size="small"
                                                                                value={condition.operator || 'Equals'}
                                                                                onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'operator', e.target.value)}
                                                                                sx={{ minWidth: '120px', fontSize: '12px' }}
                                                                            >
                                                                                <MenuItem value="Equals">Equals</MenuItem>
                                                                                <MenuItem value="NotEquals">Not Equals</MenuItem>
                                                                                <MenuItem value="LessThan">Less Than</MenuItem>
                                                                                <MenuItem value="LessThanOrEqual">Less Than or Equal</MenuItem>
                                                                                <MenuItem value="GreaterThan">Greater Than</MenuItem>
                                                                                <MenuItem value="GreaterThanOrEqual">Greater Than or Equal</MenuItem>
                                                                                <MenuItem value="Contains">Contains</MenuItem>
                                                                            </TextField>
                                                                            
                                                                            {/* Value Input - Conditional based on field type */}
                                                                            {(condition.field === 'purchorgid' || condition.field?.toLowerCase() === 'purchase org' || formatFieldDisplayName(condition.field) === 'Purchase Org') ? (
                                                                                <TextField
                                                                                    select
                                                                                    size="small"
                                                                                    value={(() => {
                                                                                        const val = condition.value ? String(condition.value) : '';
                                                                                        console.log('🔍 Purchase Org dropdown rendering:', {
                                                                                            'Full condition object': condition,
                                                                                            'condition.value': condition.value,
                                                                                            'typeof condition.value': typeof condition.value,
                                                                                            'convertedValue': val,
                                                                                            'purchaseAllList available': !!purchaseAllList,
                                                                                            'purchaseAllListLength': purchaseAllList?.length,
                                                                                            'availableIds': purchaseAllList?.map(o => ({ id: String(o.id), name: o.orgName })),
                                                                                            'Does value match any ID?': purchaseAllList?.some(o => String(o.id) === val)
                                                                                        });
                                                                                        return val;
                                                                                    })()}
                                                                                    onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'value', e.target.value)}
                                                                                    placeholder="Select Purchase Organization"
                                                                                    sx={{ flex: 1, fontSize: '12px' }}
                                                                                >
                                                                                    <MenuItem value="">Select...</MenuItem>
                                                                                    {purchaseAllList && purchaseAllList.length > 0 ? (
                                                                                        purchaseAllList.map((org) => (
                                                                                            <MenuItem key={org.id} value={String(org.id)}>
                                                                                                {org.orgName || org.name}
                                                                                            </MenuItem>
                                                                                        ))
                                                                                    ) : (
                                                                                        <MenuItem disabled>No Purchase Organizations available</MenuItem>
                                                                                    )}
                                                                                </TextField>
                                                                            ) : (condition.field === 'purchrgrpid' || condition.field === 'purchgrpid' || condition.field?.toLowerCase() === 'purchase group' || formatFieldDisplayName(condition.field) === 'Purchase Group') ? (
                                                                                <TextField
                                                                                    select
                                                                                    size="small"
                                                                                    value={condition.value ? String(condition.value) : ''}
                                                                                    onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'value', e.target.value)}
                                                                                    placeholder="Select Purchase Group"
                                                                                    sx={{ flex: 1, fontSize: '12px' }}
                                                                                >
                                                                                    <MenuItem value="">Select...</MenuItem>
                                                                                    {(() => {
                                                                                        const groupsForRule = getPurchaseGroupsForConditions(rule.conditions);
                                                                                        return groupsForRule && groupsForRule.length > 0 ? (
                                                                                            groupsForRule.map((grp) => (
                                                                                                <MenuItem key={grp.id} value={String(grp.id)}>
                                                                                                    {grp.groupName || grp.name}
                                                                                                </MenuItem>
                                                                                            ))
                                                                                        ) : (
                                                                                            <MenuItem disabled>No Purchase Groups available</MenuItem>
                                                                                        );
                                                                                    })()}
                                                                                </TextField>
                                                                            ) : condition.field === 'projectid' ? (
                                                                                <TextField
                                                                                    select
                                                                                    size="small"
                                                                                    value={condition.value || ''}
                                                                                    onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'value', e.target.value)}
                                                                                    placeholder="Select Project"
                                                                                    sx={{ flex: 1, fontSize: '12px' }}
                                                                                >
                                                                                    <MenuItem value="">Select...</MenuItem>
                                                                                    {nfaProjectList && nfaProjectList.length > 0 ? (
                                                                                        nfaProjectList.map((project) => (
                                                                                            <MenuItem key={project.id} value={project.id}>
                                                                                                {project.project || project.name}
                                                                                            </MenuItem>
                                                                                        ))
                                                                                    ) : (
                                                                                        <MenuItem disabled>No Projects available</MenuItem>
                                                                                    )}
                                                                                </TextField>
                                                                            ) : condition.field === 'exceptionid' ? (
                                                                                <TextField
                                                                                    select
                                                                                    size="small"
                                                                                    value={condition.value || ''}
                                                                                    onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'value', e.target.value)}
                                                                                    placeholder="Select Exception"
                                                                                    sx={{ flex: 1, fontSize: '12px' }}
                                                                                >
                                                                                    <MenuItem value="">Select...</MenuItem>
                                                                                    {nfaConditionList && nfaConditionList.length > 0 ? (
                                                                                        nfaConditionList.map((exception) => (
                                                                                            <MenuItem key={exception.id} value={exception.id}>
                                                                                                {exception.exception || exception.name}
                                                                                            </MenuItem>
                                                                                        ))
                                                                                    ) : (
                                                                                        <MenuItem disabled>No Exceptions available</MenuItem>
                                                                                    )}
                                                                                </TextField>
                                                                            ) : condition.field === 'spendid' ? (
                                                                                <TextField
                                                                                    select
                                                                                    size="small"
                                                                                    value={condition.value || ''}
                                                                                    onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'value', e.target.value)}
                                                                                    placeholder="Select Spend"
                                                                                    sx={{ flex: 1, fontSize: '12px' }}
                                                                                >
                                                                                    <MenuItem value="">Select...</MenuItem>
                                                                                    {nfaSpendList && nfaSpendList.length > 0 ? (
                                                                                        nfaSpendList.map((spend) => (
                                                                                            <MenuItem key={spend.id} value={spend.id}>
                                                                                                {spend.spend || spend.name}
                                                                                            </MenuItem>
                                                                                        ))
                                                                                    ) : (
                                                                                        <MenuItem disabled>No Spend options available</MenuItem>
                                                                                    )}
                                                                                </TextField>
                                                                            ) : (
                                                                                <TextField
                                                                                    size="small"
                                                                                    value={condition.value || ''}
                                                                                    onChange={(e) => handleUpdateRuleCondition(row.id, rule.id, condition.id, 'value', e.target.value)}
                                                                                    placeholder="Enter value"
                                                                                    sx={{ flex: 1, fontSize: '12px' }}
                                                                                />
                                                                            )}
                                                                            
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleRemoveConditionFromRule(row.id, rule.id, condition.id)}
                                                                                sx={{
                                                                                    color: '#e74c3c',
                                                                                    '&:hover': {
                                                                                        backgroundColor: 'rgba(231, 76, 60, 0.08)'
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <HiOutlineTrash size={14} />
                                                                            </IconButton>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="caption" sx={{ color: '#636e72', fontSize: '11px', fontStyle: 'italic', display: 'block', textAlign: 'center', py: 1 }}>
                                                                        No conditions added yet. Click "Add Condition" to create one.
                                                                    </Typography>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Rule Approvers */}
                                                            <div style={{ padding: '12px 16px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <Typography variant="caption" style={{ fontWeight: '600', color: '#495057', fontSize: '11px' }}>
                                                                        APPROVERS
                                                                    </Typography>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                        {ruleIdx === 0 && (
                                                                            <FormControlLabel
                                                                                control={
                                                                                    <Switch
                                                                                        checked={row.copyApproversToAllRules || false}
                                                                                        onChange={(e) => handleToggleCopyApproversToAllRules(row.id, e.target.checked)}
                                                                                        size="small"
                                                                                        sx={{
                                                                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                                                                color: '#2A68D3',
                                                                                            },
                                                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                                                backgroundColor: '#2A68D3',
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                }
                                                                                label={
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        sx={{
                                                                                            fontSize: '10px',
                                                                                            color: '#636e72',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '4px'
                                                                                        }}
                                                                                    >
                                                                                        Copy Approvers to All Rules
                                                                                        <Tooltip title="When enabled, approvers added to any rule will be automatically copied to all other rules under this workflow header">
                                                                                            <InfoIcon sx={{ fontSize: '12px', color: '#636e72' }} />
                                                                                        </Tooltip>
                                                                                    </Typography>
                                                                                }
                                                                                sx={{ margin: 0 }}
                                                                            />
                                                                        )}
                                                                        <Button
                                                                            size="small"
                                                                            startIcon={<AddIcon />}
                                                                            onClick={() => handleAddApproverToRule(row.id, rule.id)}
                                                                            sx={{
                                                                                textTransform: 'none',
                                                                                fontSize: '11px',
                                                                                fontWeight: 500,
                                                                                color: '#2A68D3',
                                                                                padding: '2px 8px',
                                                                                minWidth: 'auto',
                                                                                '&:hover': {
                                                                                    backgroundColor: 'rgba(42, 104, 211, 0.04)'
                                                                                }
                                                                            }}
                                                                        >
                                                                            Add Approver
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                
                                              <div style={{
                                                                                            backgroundColor: 'white',
                                                                                            borderRadius: '8px',
                                                                                            border: '1px solid #e9ecef',
                                                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                                                                                        }}>
                                                                                            <div className="table-responsive" style={{ position: 'relative' }}>
                                                                                                <table className="table mb-0">
                                                                                                    <thead style={{
                                                                                                        backgroundColor: '#FFFFFF',
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
                                                                                                    {/* Existing approvers for this rule */}
                                                                                                    {rule.approvers && rule.approvers.length > 0 && rule.approvers.map((approver, approverIdx) => (
                                                                                                        <tr key={approver.id || approverIdx} style={{ position: 'relative' }} className="approver-row">
                                                                                                            <td style={{ width: '80px', padding: '10px' }}>
                                                                                                                <span style={{ fontSize: '12px' }}>{approver.sequence}</span>
                                                                                                            </td>
                                                                                                            <td style={{ padding: '10px' }}>
                                                                                                                <span style={{ fontSize: '12px' }}>{approver.type || 'User'}</span>
                                                                                                            </td>
                                                                                                            <td style={{ padding: '10px' }}>
                                                                                                                <div style={{ fontSize: '12px' }}>
                                                                                                                    {approver.selectedUsers && approver.selectedUsers.length > 0 ? (
                                                                                                                        approver.selectedUsers.map(user => 
                                                                                                                            user.label || user.name || user.designationName || user.id
                                                                                                                        ).join(', ')
                                                                                                                    ) : '-'}
                                                                                                                </div>
                                                                                                            </td>
                                                                                                            <td style={{ width: '120px', textAlign: 'center', verticalAlign: 'middle', padding: '10px' }}>
                                                                                                                {approver.selectedUsers && approver.selectedUsers.length > 1 ? (
                                                                                                                    <span style={{ fontSize: '11px', color: '#0969da', fontWeight: '500' }}>
                                                                                                                        {approver.selectionType || 'Anyone'}
                                                                                                                    </span>
                                                                                                                ) : (
                                                                                                                    <span className="text-muted">-</span>
                                                                                                                )}
                                                                                                            </td>
                                                                                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                                                                                <IconButton 
                                                                                                                    size="small" 
                                                                                                                    color="error"
                                                                                                                    onClick={() => handleRemoveApproverFromHeaderRule(row.id, rule.id, approverIdx)}
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
                                                                                                    
                                                                                                    {/* New approver row - only show when showNewApproverRowForRule matches this rule */}
                                                                                                    {showNewApproverRowForRule === `${row.id}-${rule.id}` && (() => {
                                                                                                        const ruleKey = `${row.id}-${rule.id}`;
                                                                                                        const currentApprover = newApproverForRule[ruleKey] || {};
                                                                                                        return (
                                                                                                        <tr style={{ position: 'relative' }}>
                                                                                                            <td style={{ width: '80px' }}>
                                                                                                                <TextField
                                                                                                                    size="small"
                                                                                                                    type="number"
                                                                                                                    placeholder="Sequence"
                                                                                                                    value={currentApprover.sequence || ''}
                                                                                                                    onChange={(e) => handleNewApproverFieldChangeInHeaderRule(row.id, rule.id, 'sequence', e.target.value)}
                                                                                                                    variant="outlined"
                                                                                                                    className="w-100"
                                                                                                                    style={{ maxWidth: '70px' }}
                                                                                                                    inputRef={sequenceInputRef}
                                                                                                                />
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                <TextField
                                                                                                                    select
                                                                                                                    size="small"
                                                                                                                    value={currentApprover.type || 'User'}
                                                                                                                    onChange={(e) => handleNewApproverFieldChangeInHeaderRule(row.id, rule.id, 'type', e.target.value)}
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
                                                                                                                    options={currentApprover.type === 'Designation' ? 
                                                                                                                        [{ id: 'select-designation', name: 'Select Designation', isSpecial: true }, ...UserDesignation] : 
                                                                                                                        userOptions
                                                                                                                    }
                                                                                                                    getOptionLabel={(option) => {
                                                                                                                        if (typeof option === 'string') return option;
                                                                                                                        return option.label || option.name || option.designationName || String(option.id || 'Unknown');
                                                                                                                    }}
                                                                                                                    value={currentApprover.selectedUsers || []}
                                                                                                                    onChange={(event, newValue) => {
                                                                                                                        // Check if "Select Designation" was clicked
                                                                                                                        const selectDesignationClicked = newValue.find(item => item.id === 'select-designation');
                                                                                                                        if (selectDesignationClicked) {
                                                                                                                            // Remove the special option and open popup
                                                                                                                            const filteredValue = newValue.filter(item => item.id !== 'select-designation');
                                                                                                                            handleNewApproverFieldChangeInHeaderRule(row.id, rule.id, 'selectedUsers', filteredValue);
                                                                                                                            handleDesignationIconClick(null); // Pass null for new approver row
                                                                                                                        } else {
                                                                                                                            handleNewApproverFieldChangeInHeaderRule(row.id, rule.id, 'selectedUsers', newValue);
                                                                                                                        }
                                                                                                                    }}
                                                                                                                    renderInput={(params) => (
                                                                                                                        <TextField
                                                                                                                            {...params}
                                                                                                                            variant="outlined"
                                                                                                                            placeholder={currentApprover.type === 'Designation' ? "Select designations" : "Select users"}
                                                                                                                            inputRef={userSelectRef} 
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
                                                                                                                {currentApprover.selectedUsers && currentApprover.selectedUsers.length > 1 ? (
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
                                                                                                                            onClick={() => handleNewApproverFieldChangeInHeaderRule(row.id, rule.id, 'selectionType', 'Anyone')}
                                                                                                                            style={{
                                                                                                                                padding: '4px 8px',
                                                                                                                                backgroundColor: currentApprover.selectionType === 'Anyone' ? '#0969da' : 'transparent',
                                                                                                                                color: currentApprover.selectionType === 'Anyone' ? 'white' : '#656d76',
                                                                                                                                borderRight: '1px solid #d0d7de',
                                                                                                                                transition: 'all 0.15s ease'
                                                                                                                            }}
                                                                                                                        >
                                                                                                                            Anyone
                                                                                                                        </div>
                                                                                                                        <div
                                                                                                                            onClick={() => handleNewApproverFieldChangeInHeaderRule(row.id, rule.id, 'selectionType', 'Everyone')}
                                                                                                                            style={{
                                                                                                                                padding: '4px 8px',
                                                                                                                                backgroundColor: currentApprover.selectionType === 'Everyone' ? '#0969da' : 'transparent',
                                                                                                                                color: currentApprover.selectionType === 'Everyone' ? 'white' : '#656d76',
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
                                                                                                                        onClick={() => handleAddNewApproverToHeaderRule(row.id, rule.id)}
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
                                                                                                                        onClick={() => handleCancelNewApproverForHeaderRule(row.id, rule.id)}
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
                                                                                                        );
                                                                                                    })()}
                                                                                                    
                                                                                                    {/* Show message when no approvers and no new row */}
                                                                                                    {(!rule.approvers || rule.approvers.length === 0) && showNewApproverRowForRule !== `${row.id}-${rule.id}` && (
                                                                                                        <tr>
                                                                                                            <td colSpan="5" className="text-center py-3">
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
                                                            </>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="textSecondary" style={{ textAlign: 'center', padding: '20px', fontSize: '12px', fontStyle: 'italic' }}>
                                                        No rules created yet. Click "Add Rule" to create your first workflow rule.
                                                    </Typography>
                                                )}
                                            </div>
                                         
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </div>
                    )}
                </div>
            )} 
            {/* End Header Configuration conditional */}

        </div> {/* Close card */}
    </div> {/* Close col-12 */}
</div>

              




                    {/* Rule Section - only show when workflow is selected */}
                    {actionType === "workflow" && (
                        <> <div className="col-12 mb-3">
                        <div className="bg-white p-3 rounded shadow-sm" style={{
                            backgroundColor: "white", 
                            border: '1px solid #e9ecef', 
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          
                          
                            
                            {/* Rule Section Content */}
                 
                                    {actionType === "workflow" && (
                <div className="col-12 mb-3">
                    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <div className="mb-0" style={{ fontSize: '14px', fontWeight: '600', color: '#2d3436' }}>
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
                    {AddNewEmailTemplate ? (
                        <AddNewEmailTemplate
                            callbackstep={callbackstep}
                            callbackStageOpen={openStageModal}
                            editRecordData={editRecordData}
                            emailId={popUpEmailId}
                            preview={true}
                            handleEmailModalClose={handleEmailModalClose}
                        />
                    ) : (
                        <div>
                            <strong>Error:</strong> AddNewEmailTemplate is undefined. Check its export/import.
                        </div>
                    )}
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
                                                    backgroundColor: '#FFFFFF',
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
                                                    backgroundColor: '#FFFFFF',
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

        {/* Add New Header Modal */}
        <Dialog
            open={addHeaderModalOpen}
            onClose={handleCloseHeaderModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '12px',
                    maxWidth: '620px'
                }
            }}
        >
            <DialogTitle sx={{ 
                pb: 1,
                pt: 2.5,
                px: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
                <div>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px', color: '#2c3e50', mb: 0.5 }}>
                        Add New Header
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#636e72', fontSize: '13px' }}>
                        Create a new workflow header to group related rules together.
                    </Typography>
                </div>
                <IconButton 
                    onClick={handleCloseHeaderModal} 
                    size="small"
                    sx={{ color: '#636e72' }}
                >
                    <HiOutlineX size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 2 }}>
                {/* Header Name */}
                <div style={{ marginBottom: '20px', marginTop: '12px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: '13px' }}>
                        Header Name <span style={{ color: '#e74c3c' }}>*</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Enter header name"
                        value={newHeaderData.headerName}
                        onChange={(e) => handleHeaderDataChange('headerName', e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '14px'
                            }
                        }}
                    />
                </div>

            

                {/* Common Conditions */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px', mb: 0.3 }}>
                                Common Conditions
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#636e72', fontSize: '12px' }}>
                                These conditions will apply to all rules in this workflow
                            </Typography>
                        </div>
                        <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddHeaderCondition}
                            sx={{
                                textTransform: 'none',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#2A68D3',
                                '&:hover': {
                                    backgroundColor: 'rgba(42, 104, 211, 0.04)'
                                }
                            }}
                        >
                            Add Condition
                        </Button>
                    </div>

                    {/* Conditions Table Headers */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 40px',
                        gap: '8px',
                        marginBottom: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'FFFFFF',
                        borderRadius: '6px'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#636e72', fontSize: '11px' }}>
                            Field
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#636e72', fontSize: '11px' }}>
                            Operator
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#636e72', fontSize: '11px' }}>
                            Value
                        </Typography>
                        <div></div>
                    </div>

                    {/* Conditions List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {newHeaderData.conditions.map((condition) => (
                            <div
                                key={condition.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr 40px',
                                    gap: '8px',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '6px'
                                }}
                            >
                                {/* Field Dropdown */}
                                <TextField
                                    select
                                    size="small"
                                    variant="outlined"
                                    value={condition.field}
                                    onChange={(e) => handleHeaderConditionChange(condition.id, 'field', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: '13px'
                                        }
                                    }}
                                >
                                    <MenuItem value="">Select...</MenuItem>
                                    {RulesList && RulesList.length > 0 ? (
                                        RulesList.map((rule) => (
                                            <MenuItem key={rule.columN_NAME} value={rule.columN_NAME}>
                                                {formatFieldDisplayName(rule.columN_NAME)}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <>
                                            <MenuItem value="purchorgid">Purchase Org</MenuItem>
                                            <MenuItem value="purchgrpid">Purchase Group</MenuItem>
                                        </>
                                    )}
                                </TextField>

                                {/* Operator Dropdown */}
                                <TextField
                                    select
                                    size="small"
                                    variant="outlined"
                                    value={condition.operator}
                                    onChange={(e) => handleHeaderConditionChange(condition.id, 'operator', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: '13px'
                                        }
                                    }}
                                >
                                    <MenuItem value="Equals">Equals</MenuItem>
                                    <MenuItem value="NotEquals">Not Equals</MenuItem>
                                    <MenuItem value="LessThan">Less Than</MenuItem>
                                    <MenuItem value="LessThanOrEqual">Less Than or Equal</MenuItem>
                                    <MenuItem value="GreaterThan">Greater Than</MenuItem>
                                    <MenuItem value="GreaterThanOrEqual">Greater Than or Equal</MenuItem>
                                    <MenuItem value="Contains">Contains</MenuItem>
                                </TextField>

                                {/* Value Input - Conditional based on field type */}
                                {(condition.field === 'purchorgid' || condition.field?.toLowerCase() === 'purchase org' || formatFieldDisplayName(condition.field) === 'Purchase Org') ? (
                                    <TextField
                                        select
                                        size="small"
                                        variant="outlined"
                                        placeholder="Select Purchase Organization"
                                        value={condition.value ? String(condition.value) : ''}
                                        onChange={(e) => handleHeaderConditionChange(condition.id, 'value', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '13px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="">Select...</MenuItem>
                                        {purchaseAllList && purchaseAllList.length > 0 ? (
                                            purchaseAllList.map((org) => (
                                                <MenuItem key={org.id} value={String(org.id)}>
                                                    {org.orgName || org.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Purchase Organizations available</MenuItem>
                                        )}
                                    </TextField>
                                ) : (condition.field === 'purchrgrpid' || condition.field === 'purchgrpid' || condition.field?.toLowerCase() === 'purchase group' || formatFieldDisplayName(condition.field) === 'Purchase Group') ? (
                                    <TextField
                                        select
                                        size="small"
                                        variant="outlined"
                                        placeholder="Select Purchase Group"
                                        value={condition.value ? String(condition.value) : ''}
                                        onChange={(e) => handleHeaderConditionChange(condition.id, 'value', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '13px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="">Select...</MenuItem>
                                        {(() => {
                                            const groupsForCondition = getPurchaseGroupsForConditions(newHeaderData.conditions);
                                            return groupsForCondition && groupsForCondition.length > 0 ? (
                                                groupsForCondition.map((grp) => (
                                                    <MenuItem key={grp.id} value={String(grp.id)}>
                                                        {grp.groupName || grp.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No Purchase Groups available</MenuItem>
                                            );
                                        })()}
                                    </TextField>
                                ) : condition.field === 'projectid' ? (
                                    <TextField
                                        select
                                        size="small"
                                        variant="outlined"
                                        placeholder="Select Project"
                                        value={condition.value}
                                        onChange={(e) => handleHeaderConditionChange(condition.id, 'value', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '13px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="">Select...</MenuItem>
                                        {nfaProjectList && nfaProjectList.length > 0 ? (
                                            nfaProjectList.map((project) => (
                                                <MenuItem key={project.id} value={project.id}>
                                                    {project.project || project.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Projects available</MenuItem>
                                        )}
                                    </TextField>
                                ) : condition.field === 'exceptionid' ? (
                                    <TextField
                                        select
                                        size="small"
                                        variant="outlined"
                                        placeholder="Select Exception"
                                        value={condition.value}
                                        onChange={(e) => handleHeaderConditionChange(condition.id, 'value', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '13px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="">Select...</MenuItem>
                                        {nfaConditionList && nfaConditionList.length > 0 ? (
                                            nfaConditionList.map((exception) => (
                                                <MenuItem key={exception.id} value={exception.id}>
                                                    {exception.exception || exception.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Exceptions available</MenuItem>
                                        )}
                                    </TextField>
                                ) : condition.field === 'spendid' ? (
                                    <TextField
                                        select
                                        size="small"
                                        variant="outlined"
                                        placeholder="Select Spend"
                                        value={condition.value}
                                        onChange={(e) => handleHeaderConditionChange(condition.id, 'value', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '13px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="">Select...</MenuItem>
                                        {nfaSpendList && nfaSpendList.length > 0 ? (
                                            nfaSpendList.map((spend) => (
                                                <MenuItem key={spend.id} value={spend.id}>
                                                    {spend.spend || spend.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No Spend options available</MenuItem>
                                        )}
                                    </TextField>
                                ) : (
                                    <TextField
                                        size="small"
                                        variant="outlined"
                                        placeholder="Enter value"
                                        value={condition.value}
                                        onChange={(e) => handleHeaderConditionChange(condition.id, 'value', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                fontSize: '13px'
                                            }
                                        }}
                                    />
                                )}

                                {/* Remove Button */}
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveHeaderCondition(condition.id)}
                                    sx={{ 
                                        color: '#e74c3c',
                                        '&:hover': {
                                            backgroundColor: 'rgba(231, 76, 60, 0.04)'
                                        }
                                    }}
                                >
                                    <HiOutlineTrash size={16} />
                                </IconButton>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
                <Button
                    onClick={handleCloseHeaderModal}
                    variant="outlined"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: '8px',
                        fontSize: '13px',
                        px: 2.5,
                        borderColor: '#e9ecef',
                        color: '#636e72',
                        '&:hover': {
                            borderColor: '#cbd5e0',
                            backgroundColor: 'FFFFFF'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSaveNewHeader}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: '8px',
                        fontSize: '13px',
                        px: 2.5,
                        backgroundColor: '#2A68D3',
                        boxShadow: '0 2px 8px rgba(42, 104, 211, 0.3)',
                        '&:hover': {
                            backgroundColor: '#1e4fa3',
                            boxShadow: '0 4px 12px rgba(42, 104, 211, 0.4)'
                        }
                    }}
                >
                    Add Header
                </Button>
            </DialogActions>
        </Dialog>

        {/* Manage Users Globally Modal */}
        <Dialog
            open={manageUsersModalOpen}
            onClose={handleCloseManageUsersModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                style: {
                    borderRadius: '12px',
                    padding: '8px'
                }
            }}
        >
            <DialogTitle style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingBottom: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GroupAddIcon style={{ color: '#344054' }} />
                    <span style={{ fontWeight: 400, fontSize: '15px', color: '#101828' }}>Manage Users Globally</span>
                </div>
                <IconButton
                    onClick={handleCloseManageUsersModal}
                    size="small"
                    style={{ color: '#667085' }}
                >
                    <HiOutlineX size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <p style={{ color: '#667085', fontSize: '14px', marginTop: 0, marginBottom: '24px' }}>
                    Replace or remove a user from all workflow rules at once.
                </p>

                {/* Action Dropdown */}
                <FormControl fullWidth style={{ marginBottom: '20px' }}>
                    <Autocomplete
                        options={[
                            { value: 'Add User to All', label: 'Add User to All', icon: <GroupAddIcon style={{ fontSize: '18px', color: '#667085' }} /> },
                            { value: 'Replace User', label: 'Replace User', icon: <GroupAddIcon style={{ fontSize: '18px', color: '#667085' }} /> },
                            { value: 'Remove User', label: 'Remove User', icon: <PersonIcon style={{ fontSize: '18px', color: '#667085' }} /> }
                        ]}
                        getOptionLabel={(option) => option.label || ''}
                        value={manageUsersAction ? { value: manageUsersAction, label: manageUsersAction } : null}
                        onChange={(event, newValue) => {
                            setManageUsersAction(newValue?.value || '');
                            setUserToReplace(null);
                            setNewUserName(null);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Action"
                                placeholder="Select an action..."
                                style={{ borderRadius: '8px' }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '8px 16px' }}>
                                {option.icon}
                                {option.label}
                            </li>
                        )}
                    />
                </FormControl>

                {/* Select User to Replace/Remove - Only for Replace User and Remove User */}
                {(manageUsersAction === 'Replace User' || manageUsersAction === 'Remove User') && (
                    <FormControl fullWidth style={{ marginBottom: '20px' }}>
                        <Autocomplete
                            options={existingApprovers}
                            getOptionLabel={(option) => getUserDisplayName(option)}
                            value={userToReplace}
                            onChange={(event, newValue) => setUserToReplace(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={manageUsersAction === 'Replace User' ? 'Select User to Replace' : 'Select User to Remove'}
                                    placeholder="Choose a user..."
                                    style={{ borderRadius: '8px' }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                    {getUserDisplayName(option)}
                                </li>
                            )}
                        />
                    </FormControl>
                )}

                {/* New User Name - For Replace User and Add User to All */}
                {(manageUsersAction === 'Replace User' || manageUsersAction === 'Add User to All') && (
                    <FormControl fullWidth style={{ marginBottom: '20px' }}>
                        <Autocomplete
                            options={userOptions.filter(u => u.id !== userToReplace?.id)}
                            getOptionLabel={(option) => getUserDisplayName(option)}
                            value={newUserName}
                            onChange={(event, newValue) => setNewUserName(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={manageUsersAction === 'Add User to All' ? 'Select User to Add' : 'New User Name'}
                                    placeholder="Enter new user name"
                                    style={{ borderRadius: '8px' }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} style={{ fontSize: '14px', padding: '8px 16px' }}>
                                    {getUserDisplayName(option)}
                                </li>
                            )}
                        />
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px', gap: '12px' }}>
                <Button
                    onClick={handleCloseManageUsersModal}
                    style={{
                        textTransform: 'none',
                        color: '#344054',
                        fontWeight: 500,
                        borderRadius: '8px',
                        padding: '8px 16px'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleApplyUserChanges}
                    variant="contained"
                    style={{
                        textTransform: 'none',
                        backgroundColor: '#2A68D3',
                        fontWeight: 500,
                        borderRadius: '8px',
                        padding: '8px 16px',
                        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                    }}
                >
                    Apply Changes
                </Button>
            </DialogActions>
        </Dialog>

        </>
    );
};

export default AddEditCellWithWorkFlow1;
