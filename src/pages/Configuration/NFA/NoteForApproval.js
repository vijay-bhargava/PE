// Backup copy created for reference
import React, { useCallback, useEffect, useRef, useState, forwardRef, useMemo } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box, Button, ButtonGroup, Tab, Tabs, TextField, InputAdornment, Typography, Autocomplete, FormHelperText, MenuItem, Menu, Grid, Badge, Tooltip, IconButton, Select, InputLabel, FormControl, Accordion, AccordionSummary, AccordionDetails, TableContainer, Table, TableHead, TableRow, FormControlLabel, RadioGroup, TableCell, Radio, TableBody, Alert, Card,
  CardHeader,
  CardContent
} from '@mui/material';
import { Expand, ExpandMore, PushPinOutlined } from '@mui/icons-material';
import { BackButton, MemoizedEventStageFlow } from '../../../utils/common/component';
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { OrgGroupMasterList, UOMMasterList, getPurchaseOrgList } from '../../../utils/commerciallibrary';
import { DecimalValueRegEx, getFileName, uploadFilesOnAzure2, getPayloadWithStage } from '../../../utils/common';
import { HiOutlineX, HiPlusSm, HiDotsVertical, HiPencilAlt, HiOutlineInformationCircle } from "react-icons/hi";
import { toast } from 'react-toastify';
import NFAGeneralPreview from './NFAGeneralPreview';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { api, ApiClient } from '../../../Apiclient';
// Permission Management Imports
import { CKEditor } from 'ckeditor4-react';
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import SOB from './SOB';
import TextFieldCell from '../../BaseCells/TextFieldCell';
// import ReactQuill from 'react-quill';
import { checkFields, downloadFilesOnAzure, findObjByValueFromArray, findObjListByValueFromArray, findStringByValueFromArray, handleFileUpload, handlesaveAttachment } from '../../../utils/common';
import { downloadSample, formatDateViaTimeZone, renderHtmlAsText, extractTextFromHTML, checkUTC, getEventDetails, getCurrency, getNFAProjectList, getNFAConditionList, getLibraryOrgEntityFind, getNFAManageFindById, getNFASpendList } from '../../../utils/common/utility';
import NFADetail from './NFADetail';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HistoryCell from '../../BaseCells/HistoryCell';
import AttachmentWorkFlow from '../../BaseCells/attachmentworkflow';
import { StageFindAll } from "../../../utils/stagemaster";
import { actionTypes, useStateValue } from '../../../store';
import NotFoundPage from '../../../components/NotAllowed';
import { DropdownButton, Modal } from 'react-bootstrap';
import AddEditCurrency from '../../../utils/common/AddEditCurrency';
import PurchaseOrgGrp from '../../../utils/common/PurchaseOrgGrp';
import PurchaseOrg from '../../../utils/common/PurchaseOrg';
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import NFAQuestionScreen from "./NFAQuestionScreen";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import Drawer from "@mui/material/Drawer";
import AddNFAQuestionFormCell from "./AddNFAQuestionFromCell";
import AddUpdateexception from './AddUpdateException';

import AddUpdateProject from './AddUpdateProject';
import QueryList from '../../CommunucationHub/QueryList';
import NFASOBEventBoxRFQ from './NFASOBEventBoxRFQ';
import NFASOBEventBoxAuction from './NFASOBEventBoxAuction';
import NFASOBEventBoxPR from './NFASOBEventBoxPR';
import AddUpdateSpend from './AddUpdateSpend';
import LoadingButton from '@mui/lab/LoadingButton';
import NFAReport from './NFAReport';
import { current } from '@reduxjs/toolkit';
import ERFQComparative from "../RequestForQuotation/ERFQComparative";
import AuctionControl from "../Auctions/AuctionControl";


const NoteForApproval = () => {
  const [{ atoken, customerid, eventId, customersuffix, userDetail, roleClaims }, dispatch] = useStateValue();

  // CKEditor 4 configuration to match the required interface

  const editorConfig = {

    // height: '200px',

    height: 'auto',

    // Disable version check warning

    versionCheck: false,

    // Configure notifications

    notification: false,

    // Configure toolbar to match the image exactly

    toolbar: [

      ['Source', 'Bold', 'Italic', 'Strike',

        'NumberedList', 'BulletedList',

        'JustifyLeft', 'JustifyRight',

        'Link', 'Unlink',

        'Maximize'],

    ],

    // Remove toolbar group spacing

    toolbarGroups: [

      { name: 'document', groups: ['mode'] },

      { name: 'basicstyles', groups: ['basicstyles'] },

      { name: 'paragraph', groups: ['list', 'align'] },

      { name: 'links' },

      { name: 'tools' }

    ],

    // Customize toolbar appearance

    toolbarLocation: 'top',

    toolbar_Basic: [['Bold', 'Italic']],

    skin: 'moono-lisa',

    // Remove bottom bar

    // removePlugins: 'elementspath,resize',

    // Essential settings for proper functionality

    removePlugins: 'resize,elementspath',

    extraPlugins: 'maximize,toolbar,wysiwygarea,basicstyles',

    // Enhanced UI settings

    removeDialogTabs: 'link:advanced',

    width: 'auto',

    maximize: {

      enabled: true,



    },

    // Ensure proper z-index for toolbar

    baseFloatZIndex: 10000,

    // Global UI enhancements

    uiColor: '#fafafa',

    // Content handling settings

    allowedContent: true,

    fullPage: false,

    // Disable all entity conversion

    entities: false,

    basicEntities: false,

    entities_latin: false,

    entities_greek: false,

    htmlEncodeOutput: false,

    // HTML processing settings

    forceSimpleAmpersand: true,

    // For proper content loading

    startupMode: 'wysiwyg',

    // Fixed toolbar position

    floatSpaceDockedOffsetY: 0,

    startupFocus: false,

    // For smoother UI

    disableObjectResizing: false,

    disableNativeSpellChecker: false,

    // Data handling

    autoParagraph: false,

    fillEmptyBlocks: false,

  };

  // Global CKEditor configuration

  if (window.CKEDITOR) {

    window.CKEDITOR.disableAutoInline = true;

    // window.CKEDITOR.config.notification = false;

    // window.CKEDITOR.config.removePlugins = 'notification';

    window.CKEDITOR.on('instanceReady', function (evt) {

      evt.editor.showNotification = function () { };

    });

  }



  // // CKEditor 4 configuration with minimal setup for debugging

  // const editorConfig = {

  //     // Basic toolbar configuration for testing

  //     toolbar: [

  //         ['Source', '-', 'Bold', 'Italic', 'Underline'],

  //         ['NumberedList', 'BulletedList'],

  //         ['Link', 'Unlink', 'Image'],

  //         ['Maximize']

  //     ],

  //     height: '300px',

  //     width: 'auto',

  //     // Essential settings for proper functionality

  //     allowedContent: true,

  //     entities: false,

  //     // Ensure proper z-index for toolbar

  //     baseFloatZIndex: 10000,

  //     // Remove any dialog tabs that might cause issues

  //     removeDialogTabs: '',

  //     // Basic plugins only

  //     extraPlugins: '',

  //     // Ensure proper focus handling

  //     startupFocus: true

  // };


  // console.log("User Details",userDetail);
  const navigate = useNavigate();
  const [value, setValue] = useState(1); // Tab value state
  const [approvershow, setApproverShow] = useState(false); // To toggle approver visibility
  const [anchorEl, setAnchorEl] = useState(null); // For handling menu anchor
  const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue"); // Placeholder for menu item selection
  const [currentStage, setCurrentStage] = useState(`Draft`);
  const [stagearray, setStagearray] = useState([`Draft`]);
  const [stagelist, setStageList] = useState(null);
  const [idFromURL, setIdFromURL] = useState(null);
  const [activityId, setActvityId] = useState(0);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [preview, setPreview] = useState(true)
  const [state, setState] = useState({
    addProductDrawer: false,
    qusDrawer: false,
    surrogateDrawer: false,
    openInvoiceApproved: false
  });
  const [itemEditTempData, setItemEditTempData] = useState([])
  const [approverInWorkflow, setApproverInWorkflow] = useState([]);
  // Consolidated modal states for better performance
  const [modals, setModals] = useState({
    cancel: false,
    purchaseOrg: false,
    purchaseOrgGrp: false,
    exception: false,
    project: false,
    spend: false
  });
  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
  const [isquestioneditDisabled, setIsQuestionEditDisabled] = useState(true);
  const [OrgGroupId, setOrgGroupId] = useState(0);
  const [OrgId, setOrgId] = useState(0);
  const { pageSlug } = useParams();
  // Memoized API client to prevent unnecessary re-initialization
  const apiClient = useMemo(() => new ApiClient(customersuffix), [customersuffix]);

  // Permission loading state: fetch role rights for both existing and new NFA
  const getUserRoleRights = async () => {
    try {
      const obj = {
        FeatureName: "Note For Approval",
        UserId: userDetail?.id,
        CreatedById: userDetail?.id,
      };
      const qp = buildQueryParams(obj);
      const res = await apiClient.getres(`/api/rolemanagement/GetUserRoleRights?${qp}`, atoken);
      if (res) {
        // Some endpoints return array; PermissionManager accepts either format
        const permManager = new PermissionManager(res?.data || res?.[0]?.userAccess || res);
        setPermissionManager(permManager);
      }
    } catch (err) {
      console.error("Failed fetching role rights", err);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const editorRef = useRef(null);

  const remarksEditorRef = useRef(null);

  const [remarksEditorReady, setRemarksEditorReady] = useState(false);

  const [editorReady, setEditorReady] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);



  const [nfaSubject, setNfaSubject] = useState("");
  const [nfaDescription, setNfaDescription] = useState("");
  const [nfaEventType, setNfaEventType] = useState("");
  const [nfaEventDetails, setNfaEventDetails] = useState("");
  const [nfaEventIdSelected, setNfaEventIdSelected] = useState();
  const [nfaEventVersion, setNfaEventVersion] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyList, setCurrencyList] = useState([]);
  const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState("");
  // const [nfaCategory, setNfaCategory] = useState("");
  // const [nfaProject, setNfaProject] = useState([]);
  // const [eventDetailsList , setEventDetailsList] = useState([]);
  // const EventQuestionScreenRef = React.createRef();
  const NFAQuestionScreenRef = React.createRef();
  const NFASOBRFQRef = React.createRef();
  const NFASOBPRRef = React.createRef();
  const NFASOBAuctionRef = React.createRef();
  const [saving, setSaving] = useState(0);
  const [showInputFieldText, setShowInputFieldText] = useState(true);
  const [eventAppList, setEventAppList] = useState([]);
  const [accessLevel, setAccessLevel] = useState([]);
  const [wfupdate, setwfUpdate] = useState([false]);
  const [selectedQuesionArray, setSelectedQuesionArray] = useState([]);
  const [questionLibraryDll, setQuestionLibraryDll] = useState(null);
  const [tempDataEditData, setTempDataEditData] = useState(null);
  const [selectedQuesDll, setSelectedQuesDll] = useState();
  const [libraryId, setLibraryId] = useState();
  const [questionforedit, setQuestionForEdit] = useState(null);
  const [EventHeaderDetails, setEventHeaderDetails] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabshow, setTabShow] = useState(true)
  // const [nfapreview, setNFAPreview] = useState(true);
  const [tempnfaEventId, setTempnfaEventId] = useState(0);
  const [tempProjectId, setTempProjectId] = useState(0);
  const [tempExceptionId, setTempExceptionId] = useState(0);
  const [tempSpendId, setTempSpendId] = useState(0);
  const [permissionManager, setPermissionManager] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  // Currency Modal Handlers
  const CloseCurrencyModal = () => setOpenCurrencyModal(false);
  
  const handleCurrencyList = (list) => {
    setCurrencyList(list);
  };

  // Auto-select an accessible tab after permissions load
  useEffect(() => {
    if (!loadingPermissions && permissionManager) {
      const hasGeneral = permissionManager.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ);
      const hasAlloc = permissionManager.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ);
      const hasQuestions = permissionManager.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ);
      const hasQueries = permissionManager.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ);

      if (value === 1 && !hasGeneral) {
        if (hasAlloc) setValue(2);
        else if (hasQuestions) setValue(3);
        else if (hasQueries) setValue(7);
      } else if (value === 2 && !hasAlloc) {
        if (hasGeneral) setValue(1);
        else if (hasQuestions) setValue(3);
        else if (hasQueries) setValue(7);
      } else if (value === 3 && !hasQuestions) {
        if (hasGeneral) setValue(1);
        else if (hasAlloc) setValue(2);
        else if (hasQueries) setValue(7);
      } else if (value === 7 && !hasQueries) {
        if (hasGeneral) setValue(1);
        else if (hasAlloc) setValue(2);
        else if (hasQuestions) setValue(3);
      }
    }
  }, [loadingPermissions, permissionManager, value]);


  // Memoized permission checks for better performance
  const hasWorkFlowReadPermission = useMemo(() =>
    accessLevel?.find(x => x.claimType == "Work Flow")?.claimValue?.Read !== "N",
    [accessLevel]
  );

  const canShowApprover = useMemo(() =>
    hasWorkFlowReadPermission && approvershow,
    [hasWorkFlowReadPermission, approvershow]
  );

  const [eventDetailsList, setEventDetailsList] = useState([])
  // const [eventDetailsList , setEventDetailsList] = useState([
  //   { id: 1, eventSub: "Event A" },
  //   { id: 2, eventSub: "Event B" },
  //   { id: 3, eventSub: "Event C" },
  //   { id: 4, eventSub: "Event D" },
  //   { id: 5, eventSub: "Event E" },
  //   // { id: "new", groupName: "Add New Event" },  // Option to add a new event
  // ])
  const [nfaProject, setNfaProject] = useState([])
  // const [nfaProject, setNfaProject] = useState([
  //   {id: 1, projectName: "Project 1"},
  //   {id: 2, projectName: "Project 2"},
  //   {id: 3, projectName: "Project 3"},
  //   {id: 4, projectName: "Project 4"},
  //   {id: 5, projectName: "Project 5"}
  // ])
  // Removed: nfaCategoryList is now memoized above
  const [nfaSpendList, setNfaSpendList] = useState([]);
  const [exception, setException] = useState([])
  // const [exception, setException] = useState([
  //   {id: 1 , exceptionName: "Exception 1"},
  //   {id: 2 , exceptionName: "Exception 2"},
  //   {id: 3 , exceptionName: "Exception 3"},
  //   {id: 4 , exceptionName: "Exception 4"},
  //   {id: 5 , exceptionName: "Exception 5"}
  // ])

  // Memoized static data to prevent unnecessary re-renders
  const eventTypes = useMemo(() => [
    { id: "0", eventType: "General" },
    { id: "PR", eventType: "Purchase Requisition" },
    { id: "RFQ", eventType: "Request for Quotation" },
    { id: "Auction", eventType: "Auction" }
  ], []);

  const handleSpendList = useCallback((spendData) => {

    setNfaSpendList(spendData);

  }, []);



  const handleExceptionList = useCallback((exceptionData) => {

    setException(exceptionData);

  }, []);



  const handleProjectList = useCallback((projectData) => {

    setNfaProject(projectData);

  }, []);

  // Memoized category list
  const nfaCategoryList = useMemo(() => [
    { id: 1, categoryName: "Project" },
    { id: 2, categoryName: "Others" }
  ], []);


  const [activityType, setActivityType] = useState(
    queryParams.get("ActionType")?.trim()
  );
  // const eventDetailsList = ;

  useEffect(() => {
    const data = queryParams.get("CommId")?.trim();
    if (data) {
      dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
    }
  }, [])



  useEffect(() => {
    const pullMessageList = async () => {
      var data = {
        CustomerId: customerid,
        // EventType: "RFQ",
        //EventId: 0,
        SortingColumn: "Id",
        UserId: userDetail?.id

      };
      const queryParams = buildQueryParams(data)
      const res = await apiClient.getres(`api/Communication/Find?${queryParams}`, atoken)
      if (res) {

        const data = res?.data ?? []

        dispatch({ type: actionTypes.SET_Notificationlist, value: data });
      }


    }
    pullMessageList()
  }, []);
  const validationSchema = yup.object().shape({
    nfaSubject: yup
      .string('Enter NFA Subject')
      .max(100, 'Max 100 character')
      .required('NFA Subject is required'),
    nfaDescription: yup
      .string('Enter NFA Description')
      .required('NFA Description is required'),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: 0,
      nfaSubject: nfaSubject,
      nfaDescription: nfaDescription,
      nfaEventType: "",
      nfaEventId: nfaEventDetails,
      nfaAmount: 0,
      nfaBudget: 0,
      nfaCurrency: userDetail && userDetail?.defaultCurrency ? userDetail?.defaultCurrency : "INR",
      budgetStatus: "",
      nfaSaving: 0 ,
      categoryId: nfaCategoryList[0],
      projectName: "",
      projectId: "",
      exceptionId: "",
      remarks: "",
      purchOrgId: "",
      purchGrpId: "",
      Version: 1,
      spendId: ""
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {

      let id = await handleWhatever(values)
      setNfaEventType(formik?.values?.nfaEventType?.id);
      setNfaEventIdSelected(formik?.values?.nfaEventId?.id);
      setNfaEventVersion(formik?.values?.nfaEventId?.version);
    }
  });


  // 🔁 Keep CKEditor synced with Formik after refresh or API load

  useEffect(() => {

    

    if (!editorReady || !dataLoaded) return;



    // Get CKEditor instance safely

    let editorInstance = editorRef.current?.editor;



    // Fallback: sometimes CKEditor doesn’t bind to ref

    if (!editorInstance && window.CKEDITOR) {

      const ids = Object.keys(window.CKEDITOR.instances);

      if (ids.length > 0) {

        editorInstance = window.CKEDITOR.instances[ids[0]];

        console.log("💡 Using fallback editor instance");

      }
    }
    if (!editorInstance) {

      console.warn("⚠️ Editor instance not found yet");

      return;

    }



    const newData = formik.values.nfaDescription || '';

    const currentData = editorInstance.getData();



    if (newData && newData !== currentData) {

      console.log("💾 Syncing CKEditor data:", newData);

      editorInstance.setData(newData, { noSnapshot: true });

    }

  }, [editorReady, dataLoaded, formik.values.nfaDescription]);

  // 🔁 Keep Remarks CKEditor synced with Formik after refresh or API load

  useEffect(() => {

    ;

    if (!remarksEditorReady || !dataLoaded) return;



    // Get CKEditor instance safely

    let remarksEditorInstance = remarksEditorRef.current?.editor;



    // Fallback: sometimes CKEditor doesn’t bind to ref

    if (!remarksEditorInstance && window.CKEDITOR) {

      const ids = Object.keys(window.CKEDITOR.instances);

      if (ids.length > 0) {

        // Pick the second editor instance if you have multiple

        remarksEditorInstance = window.CKEDITOR.instances[ids[1]];

        console.log("💡 Using fallback remarks editor instance");

      }

    }



    if (!remarksEditorInstance) {

      console.warn("⚠️ Remarks editor instance not found yet");

      return;

    }



    const newRemarks = formik.values.remarks || '';

    const currentRemarks = remarksEditorInstance.getData();



    if (newRemarks !== currentRemarks) {

      console.log("💾 Syncing Remarks CKEditor data:", newRemarks);

      remarksEditorInstance.setData(newRemarks, { noSnapshot: true });

    }

  }, [remarksEditorReady, dataLoaded, formik.values.remarks]);





  // to save attachment as rfq created related to attachment workflow
  const [attachmentforevent, setAttachmentforEvent] = useState(null);

  const pullgetCurrency = useCallback(() => {
    const data = {
      isActive: true,
    };
    getCurrency(data, atoken).then((res) => {
      setCurrencyList(res);
    });
  }, [atoken]);     //Look here second
  const pullgetNFAManageFind = (Id) => {

    var data = {
      Id: Id,
    };
    getNFAManageFindById(data, atoken).then((res) => {
      setTempDataEditData(res);
      if (res?.[0]?.id && res?.[0]?.id > 0) {
        formik.setFieldValue("id", res?.[0]?.id);
      }
      if (res?.[0]?.Version && res?.[0]?.versiVersionon > 0) {
        formik.setFieldValue("Version", res?.[0]?.Version);
      }
      if (res?.[0]?.nfaSubject
      ) {
        formik.setFieldValue("nfaSubject", res?.[0]?.nfaSubject);
      }
      if (res?.[0]?.nfaDescription) {

        formik.setFieldTouched("nfaDescription", true);
        formik.setFieldValue("nfaDescription", res?.[0]?.nfaDescription);
      }
      if (res?.[0]?.nfaEventType) {
        // formik.setFieldValue("nfaEventType", res?.[0]?.nfaEventType);
        const matchedEvent = eventTypes.find(
          (event) => event.id === res[0].nfaEventType
        );

        if (matchedEvent) {
          formik.setFieldValue("nfaEventType", matchedEvent); // Still setting the raw ID in Formik
        }
      }
      if (res?.[0]?.nfaEventId) {
        setTempnfaEventId(res?.[0]?.nfaEventId);
      }
      if (res?.[0]?.nfaAmount) {
        formik.setFieldValue("nfaAmount", res?.[0]?.nfaAmount);
      }
      if (res?.[0]?.nfaBudget) {
        formik.setFieldValue("nfaBudget", res?.[0]?.nfaBudget);
      }
      if (res?.[0]?.purchOrgId && res?.[0]?.purchOrgId > 0) {
        setOrgId(res?.[0]?.purchOrgId)
      }
      if (res?.[0]?.purchGrpId && res?.[0]?.purchGrpId > 0) {
        setOrgGroupId(res?.[0]?.purchGrpId)
      }
      if (res?.[0]?.nfaCurrency && res?.[0]?.nfaCurrency != "") {
        formik.setFieldValue("nfaCurrency", res?.[0]?.nfaCurrency);
      }
      if (res?.[0]?.budgetStatus && res?.[0]?.budgetStatus != "") {
        formik.setFieldValue("budgetStatus", res?.[0]?.budgetStatus);
      }
      if (res?.[0]?.nfaSaving && res?.[0]?.nfaSaving != "") {
        formik.setFieldValue("nfaSaving", res?.[0]?.nfaSaving);
      }
      if (res?.[0]?.categoryId && res?.[0]?.categoryId != "") {
        const matchedEvent = nfaCategoryList.find(
          (event) => event.id === res[0].categoryId
        );

        if (matchedEvent) {
          formik.setFieldValue("categoryId", matchedEvent); // Still setting the raw ID in Formik
        }

      }
      if (res?.[0]?.projectName && res?.[0]?.projectName != "") {
        formik.setFieldValue("projectName", res?.[0]?.projectName);
      }
      if (res?.[0]?.projectId && res?.[0]?.projectId != "") {
        setTempProjectId(res?.[0]?.projectId);
      }
      if (res?.[0]?.exceptionId && res?.[0]?.exceptionId != "") {
        setTempExceptionId(res?.[0]?.exceptionId);
      }
      if (res?.[0]?.spendId && res?.[0]?.spendId != "") {

        setTempSpendId(res?.[0]?.spendId);
      }
      if (res?.[0]?.remarks) {
        formik.setFieldValue("remarks", res?.[0]?.remarks);
      }
      if (res?.[0]?.stage) {
        setCurrentStage(res[0]?.stage);
      }

      if (res?.[0]?.userAccess && res?.[0]?.userAccess.length > 0) {
        // Initialize Permission Manager with user access data
        const permManager = new PermissionManager(res?.[0]?.userAccess);
        setPermissionManager(permManager);
      }
      // Permissions finished loading
      setLoadingPermissions(false);
    })
    setTimeout(() => {

      console.log("✅ Data fully loaded for CKEditor");

      setDataLoaded(true);

    }, 300); // small delay ensures CKEditor is ready


  };

  const handleattachmentforevent = useCallback((data) => {

    setAttachmentforEvent(data);
  }, []);

  const handleSelectedEditQuestion = useCallback((question) => {
    setQuestionForEdit(question)
    setState(prev => ({ ...prev, qusDrawer: true }))
  }, []);

  const [stageValue, setStageValue] = useState('');
  // const [actionType, setActionType] = useState("");

  const getEventStages = async (urlparams) => {
    const queryParams = buildQueryParams(urlparams)
    const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
    if (res?.data?.result.length > 0) {
      const result = res?.data?.result?.filter((item) => item.stageSeq > 0)
      setStageList(result);
      const stagesarray = result?.map((item) => item.currentStage);
    }
  }

  useEffect(() => {

    const params = new URLSearchParams(searchParams);
    const actionType = params.get("ActionType");
    const ActivityId = params.get("ActivityId");
    const StageValue = params.get("Stage");
    setActionType(actionType);

    // if (actionType == "approval" ) {
    // 	tabReport()
    // }
    setActvityId(ActivityId ?? 0);
    setStageValue(StageValue ?? '');
    const newIdFromURL = pageSlug;
    //#eventid and eventtype
    dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
    dispatch({ type: actionTypes.SET_EVENTTYPE, value: "NFA" });

    setIdFromURL(newIdFromURL);
    // setcommcurrencyList([
    //   {
    //     id: "0",
    //     baseCurrency: "",
    //     currencyConversion: "",
    //     rfqId: newIdFromURL,
    //   },
    // ]);

    updateRequestCell(newIdFromURL);
  }, [searchParams]);

  //Look here first
  useEffect(() => {
    if (idFromURL && idFromURL > 0) {
      pullgetNFAManageFind(idFromURL);
      // handleLibraryList(idFromURL);
    }
  }, [idFromURL]);

  // Fetch role rights on mount (handles Add New where idFromURL is not present)
  useEffect(() => {
    getUserRoleRights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    StageFindAll(
      {
        EventType: "NFA",
        CustomerId: customerid,
        EventId: idFromURL ?? 0,
        OrgId: formik.values.purchOrgId?.id ?? 0,
        OrgGroupId: formik.values.purchGrpId?.id ?? 0,
      },
      atoken
    ).then((res) => {

      setStageList(res);

    });

  }, [formik.values.purchOrgId, formik.values.purchGrpId, idFromURL]);

  // Effect to handle synchronization between editor and form data

  useEffect(() => {

    if (editorReady && dataLoaded && editorRef.current?.editor) {

      const editor = editorRef.current.editor;

      const currentData = editor.getData();

      const newData = formik.values.nfaDescription || '';



      // Only update if data is different to avoid cursor position issues

      if (currentData !== newData) {

        editor.setData(newData, {

          callback: function () {

            const range = editor.createRange();

            range.moveToPosition(range.root, window.CKEDITOR.POSITION_BEFORE_END);

            editor.getSelection().selectRanges([range]);

          }

        });

      }

    }

  }, [editorReady, dataLoaded, formik.values.nfaDescription]);

  useEffect(() => {
    if (value == "1" && idFromURL == null) {
      setApproverShow(false);
    }
    // else if (value !== "1" && value !== 6) {
    //   setApproverShow(true);
    // }
  }, [value, idFromURL]);



  useEffect(() => {
    PullPurchaseOrgAll();
    pullgetCurrency();
    PullNfaProjectAll();
    PullNfaConditionAll();
    PullNfaSpendAll();
    //PullUserDesignation();

  }, [atoken, customerid]);

  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [isCallbackSubmit, setIsCallbackSubmit] = useState(false); // Flag to track callback submission

  useEffect(() => {
    if (shouldSubmit) {
      formik.handleSubmit();
      setShouldSubmit(false); // Reset the flag
      setIsCallbackSubmit(false); // Reset the callback submission flag
    }
  }, [shouldSubmit, formik]);


  useEffect(() => {
    if (
      (value == 1 || value == 3) &&
      idFromURL &&
      tempDataEditData &&
      tempDataEditData?.length > 0
    ) {
      // pullRFQItemServiceFind(idFromURL);
      // pullLibraryOrgEntityFind();
      pullLibraryOrgEntityFindQues();
      // getTotalSupplier();
    }
  }, [idFromURL, tempDataEditData, value]);
  //Access Level
  useEffect(() => {
    if (accessLevel?.find(x => x.claimType == "Work Flow")?.claimValue?.Read == "N") {
      setApproverShow(false)
    }
  }, [])

  //stage handling
  useEffect(() => {
    let urlparams = {};
    if (idFromURL) {
      urlparams = {
        EventType: "NFA",
        CustomerId: customerid,
        EventId: idFromURL,
        OrgId: formik.values.purchOrgId?.id,
        OrgGroupId: formik.values.purchGrpId?.id,
        Version: parseInt(formik?.values?.Version)
      }
      getEventStages(urlparams);
    }
    else {
      urlparams = {
        EventType: "NFA",
        CustomerId: customerid,
        EventId: 0,
        OrgId: 0,
        OrgGroupId: 0,
      }
      getEventStages(urlparams);
    }
  }, [formik.values.purchOrgId, formik.values.purchGrpId, idFromURL, formik?.values?.Version]);

  // Memoized base request cell structure
  const baseRequestCell = useMemo(() => ({
    EventType: "NFA",
    SortingColumn: "ApproverSeq",
    CustomerId: customerid
  }), [customerid]);

  const [requestCell, setRequestCell] = useState({
    EventId: 0,
    ...baseRequestCell
  });

  const updateRequestCell = useCallback((newEventId) => {
    setRequestCell((prevState) => ({
      ...prevState,
      EventId: newEventId,
    }));
  }, []);
  // Category and Project (Dynamic Handling)

  const handleTab = (booleanvalue) => {
    setTabShow(booleanvalue)
    if (booleanvalue) {
      setValue(1)
    }
  }

  const PullPurchaseOrgAll = useCallback(() => {
    const data = {
      CustomerId: customerid,
      IsActive: 'true'
    };
    getPurchaseOrgList(data, atoken).then((resp) => {
      if (resp) {
        setPurchaseAllList(resp);
      }
    });
  }, [customerid, atoken]);

  // useEffect(() => {
  //   if(formik?.values?.purchGrpId?.id  > 0  && formik?.values?.purchOrgId?.id  > 0)
  //   {
  //     

  //   }
  // },[formik.values.purchOrgId,formik.values.purchGrpId])

  // This effect runs when eventDetailsList is updated and does the matching

  useEffect(() => {
    if (tempProjectId > 0 && nfaProject.length > 0) {
      const matchedEvent = nfaProject.find(
        (event) => event.id == tempProjectId
      );
      if (matchedEvent) {
        formik.setFieldValue("projectId", matchedEvent); // Still setting the raw ID in Formik
      }
    }
  }, [nfaProject, tempProjectId]);

  useEffect(() => {
    if (tempExceptionId > 0 && exception.length > 0) {
      const matchedEvent = exception.find(
        (event) => event.id == tempExceptionId
      );
      if (matchedEvent) {
        formik.setFieldValue("exceptionId", matchedEvent); // Still setting the raw ID in Formik
      }
    }
  }, [exception, tempExceptionId]);

  useEffect(() => {
    if (tempSpendId > 0 && nfaSpendList.length > 0) {
      const matchedEvent = nfaSpendList.find(
        (event) => event.id == tempSpendId
      );
      if (matchedEvent) {
        formik.setFieldValue("spendId", matchedEvent); // Still setting the raw ID in Formik
      }
    }
  }, [nfaSpendList, tempSpendId]);


  const PullNfaProjectAll = useCallback((purchOrgId = null) => {
    const data = {
      CustomerId: customerid,
      IsActive: 'true'
    };
    if (purchOrgId && purchOrgId > 0) {
      data.PurchOrgId = purchOrgId;
    }
    getNFAProjectList(data, atoken).then((res) => {
      if (Array.isArray(res)) {
        // If res is an array (including empty array), set it
        setNfaProject(res);
      } else {
        // If res is invalid (null, undefined, string, etc), set to empty array
        setNfaProject([]);
      }
      return true;
    }).catch((err) => {
      console.error("Error fetching NFA project list:", err);
      setNfaProject([]); // fallback on error
    });
  }, [customerid, atoken]);

  const PullNfaConditionAll = useCallback((purchOrgId = null) => {
    const data = {
      CustomerId: customerid,
      IsActive: 'true'
    };
    if (purchOrgId && purchOrgId > 0) {
      data.PurchOrgId = purchOrgId;
    }
    getNFAConditionList(data, atoken).then((res) => {
      if (Array.isArray(res)) {
        setException(res);
      } else {
        setException([]);
      }
    }).catch((err) => {
      console.error("Error fetching NFA Conditions list:", err);
      setException([]); // fallback on error
    });
  }, [customerid, atoken]);

  const PullNfaSpendAll = useCallback((purchOrgId = null) => {
    const data = {
      CustomerId: customerid,
      IsActive: 'true'
    };
    if (purchOrgId && purchOrgId > 0) {
      data.PurchOrgId = purchOrgId;
    }
    getNFASpendList(data, atoken).then((res) => {
      if (Array.isArray(res)) {
        setNfaSpendList(res);
      } else {
        setNfaSpendList([]);
      }
    }).catch((err) => {
      console.error("Error fetching NFA Conditions list:", err);
      setNfaSpendList([]); // fallback on error
    });
  }, [customerid, atoken]);
  const PullPurchaseGroupAll = useCallback((orgMstId) => {
    const data = {
      CustomerId: customerid,
      OrgMstId: orgMstId,
      IsActive: 'true'
    };
    OrgGroupMasterList(data, atoken).then((res) => {
      if (res != "" && res != undefined) {
        setPurchaseGroupAllList(res);
      }
    });
  }, [customerid, atoken]);

  const PullEventDetails = useCallback((eventTypeId) => {
    const data = {
      CustomerId: customerid,
      EventType: eventTypeId
    };
    getEventDetails(data, atoken).then((res) => {
      if (res != "" && res != undefined) {
        setEventDetailsList(res);
      }
    })
  }, [customerid, atoken]);
  // const PullEventDetails = async (eventTypeId) => {
  //   try {
  //     const data = {
  //       CustomerId: customerid,
  //       EventType: eventTypeId,
  //     };
  //     const res = await getEventDetails(data, atoken);
  //     if (res && res !== "") {
  //       setEventDetailsList(res);
  //     } else {
  //       setEventDetailsList([]); // fallback in case of empty/invalid response
  //     }
  //     return true;
  //   } catch (error) {
  //     console.error("Error fetching event details:", error);
  //     setEventDetailsList([]); // fallback on error
  //     return false;
  //   }
  // };


  const pullLibraryOrgEntityFindQues = () => {
    var data = {
      CustomerId: customerid,
      LibraryType: "QuestionLibrary",
      EventType: "NFA",
      IsActive: true
    };

    getLibraryOrgEntityFind(data, atoken).then((res) => {

      if (res && res?.length > 0) {
        setQuestionLibraryDll(res);

        // set old  rfqQuestionMaster
        if (
          tempDataEditData?.[0] &&
          tempDataEditData?.[0]?.nfaQuestionMaster &&
          tempDataEditData?.[0]?.nfaQuestionMaster?.length
        ) {

          const mappedRecordsDll =
            tempDataEditData?.[0]?.nfaQuestionMaster?.map((item) => {
              const record = res?.find(
                (record) => record.id === item?.libraryId
              );
              //console.log("recorddd" + JSON.stringify(record));
              return record?.id;
            });
          const uniqueMappedRecords = Array.from(new Set(mappedRecordsDll));
          //console.log("uniqueMappedRecords", uniqueMappedRecords?.[0]);

          if (uniqueMappedRecords && uniqueMappedRecords?.length) {
            const updatedrecord = res?.filter(
              (x) => x.id == uniqueMappedRecords?.[0]
            );


            if (updatedrecord?.length > 0) {

              setSelectedQuesDll(updatedrecord[0]);
              const { id } = updatedrecord[0]

              setLibraryId(id)
            }
          }

          setSelectedQuesionArray(tempDataEditData?.[0]?.nfaQuestionMaster);
        }
      }
    });
  };
  // const pullLibraryOrgEntityFind = () => {
  //   var data = {
  //     CustomerId: customerid,
  //     LibraryType: "CommercialLibrary",
  //     EventType: "RFQ",
  //     IsActive: true
  //   };
  //   //console.log("request id getLibraryOrgEntityFind", data);
  //   getLibraryOrgEntityFind(data, atoken).then((res) => {

  //     //console.log("response getLibraryOrgEntityFind", res);
  //     if (res && res?.length > 0) {
  //       setGeneraltermsDDl(res);
  //       console.log(
  //         "tempDataEditData?-----0--0-0-0-",
  //         tempDataEditData?.[0]?.rfqTermsCondition
  //       );
  //       if (
  //         tempDataEditData?.[0] &&
  //         tempDataEditData?.[0]?.rfqTermsCondition &&
  //         tempDataEditData?.[0]?.rfqTermsCondition?.length &&
  //         res?.length
  //       ) {
  //         const mappedRecords = tempDataEditData?.[0]?.rfqTermsCondition?.map(
  //           (item) => {
  //             const record = res?.find(
  //               (record) => record.id === item?.libraryId
  //             );
  //             return record;
  //           }
  //         );

  //         const uniqueMappedRecords = Array.from(new Set(mappedRecords));
  //         if (uniqueMappedRecords && uniqueMappedRecords?.length) {
  //           setSelectedCommercalDll(uniqueMappedRecords[0]);
  //           pullCommercialLibFind(uniqueMappedRecords[0]);
  //         }
  //       }
  //     }
  //   });
  // };

  const callbackQuesAddCustom = useCallback((quesData, questionforedit) => {
    if (!questionforedit) {
      setSelectedQuesionArray((prev) => [...prev, quesData]);
      setState({ ...state, qusDrawer: false });
    }
    else {
      const obj = selectedQuesionArray?.map((x) => {
        if (x.id == questionforedit.id) {
          return quesData
        }
        else return x
      });

      setSelectedQuesionArray(obj)
      setState({ ...state, qusDrawer: false });
      //setQuestionForEdit(null)
    }

  },
    [selectedQuesionArray]
  );

  useEffect(() => {
    if (purchaseAllList && purchaseAllList.length > 0 && OrgId) {

      const updatedvalue = findObjByValueFromArray(purchaseAllList, OrgId, 'id')
      formik.setFieldValue("purchOrgId", updatedvalue);
    }

  }, [OrgId, purchaseAllList])
  // Removed: Modal states are now consolidated in 'modals' object above
  useEffect(() => {
    if (purchaseGroupAllList && purchaseGroupAllList.length > 0 && OrgGroupId) {
      const updatedvalue = findObjByValueFromArray(purchaseGroupAllList, OrgGroupId, 'id')
      //console.log(purchaseGroupAllList,OrgGroupId,updatedvalue)
      formik.setFieldValue("purchGrpId", updatedvalue);
    }

  }, [OrgGroupId, purchaseGroupAllList])

  useEffect(() => {
    if (formik.values.purchOrgId?.id) {
      const orgId = formik.values.purchOrgId?.id;
      PullPurchaseGroupAll(orgId);
      // Fetch Spend Type, Exception, and Project based on Purchase Organization
      PullNfaSpendAll(orgId);
      PullNfaConditionAll(orgId);
      PullNfaProjectAll(orgId);
    }
  }, [formik.values.purchOrgId, PullPurchaseGroupAll, PullNfaSpendAll, PullNfaConditionAll, PullNfaProjectAll]);

  // This effect runs when nfaEventType changes and triggers the fetch
  useEffect(() => {
    if (formik.values.nfaEventType?.id && formik.values.nfaEventType?.id != "0") {
      PullEventDetails(formik.values.nfaEventType.id);
      setNfaEventType(formik.values.nfaEventType?.id);
    }

  }, [formik.values.nfaEventType]);

  // This effect runs when eventDetailsList is updated and does the matching
  useEffect(() => {
    if (tempnfaEventId > 0 && eventDetailsList.length > 0) {
      const matchedEvent = eventDetailsList.find(
        (event) => event.id === tempnfaEventId
      );
      if (matchedEvent) {

        formik.setFieldValue("nfaEventId", matchedEvent);
        setNfaEventIdSelected(matchedEvent.id);
        setNfaEventVersion(matchedEvent.version);
      }
    }
  }, [eventDetailsList, tempnfaEventId]);

  // useEffect(() => {
  //   if(nfaEventIdSelected > 0){
  //     setNfaEventVersion(formik?.values?.nfaEventDetails?.version)
  //   }
  // },[nfaEventIdSelected])

  useEffect(() => {
    if (formik.values?.categoryId?.id == 2) {
      //others
      formik.setFieldValue("projectId", 0);
    }
    else {
      //project
      formik.setFieldValue("projectName", "");
    }
  }, [formik.values?.categoryId])

  //For Budget Status Calculation
  useEffect(() => {
    let newBudgetStatus = "";
    // let newSaving = parseFloat(formik.values.nfaBudget) - parseFloat(formik.values.nfaAmount);
    let newSaving = parseFloat(formik.values.nfaBudget || "0") - parseFloat(formik.values.nfaAmount || "0");
    if (formik.values.nfaAmount == 0) {
      newBudgetStatus = "";
    }
    else {
      if (newSaving >= 0) {
        newBudgetStatus = "Within Budget";
      }
      else if (newSaving < 0 && formik.values.nfaBudget != 0) {
        newBudgetStatus = "Outside Budget";
      }
      else if (formik.values.nfaBudget == 0) {
        newBudgetStatus = "Not Budgeted";
        newSaving = 0;
      }
      else {
        newBudgetStatus = "";
      }
    }
    setBudgetStatus(newBudgetStatus);
    formik.setFieldValue("budgetStatus", newBudgetStatus);
    setSaving(newSaving);
    formik.setFieldValue("nfaSaving", newSaving);

  }, [formik.values.nfaAmount, formik.values.nfaBudget])



  // handleButtonGroup moved to after dependent functions are defined
  // const checkApprovers = () => {
  //   const isStageRequired = stagelist?.filter((x) => x.required && x.wfname)
  //   for (const stage of isStageRequired) {
  //     const matchingWorkflow = approverInWorkflow.find(workflow => workflow.stage === stage.wfname);
  //     if (matchingWorkflow && matchingWorkflow.approvers.length == 0) {
  //       toast.error(`Error: The Required stage workflow "${stage.wfname}" has no approvers.`);
  //       return false
  //     }
  //   }
  //   return true
  // };

  const checkApprovers = () => {
    
    if (!stagelist || stagelist.length === 0) {
      toast.error("Error: No stages found in workflow.");
      return false;
    }

    const isStageRequired = stagelist.filter((x) => x.wfname);
    for (const stage of isStageRequired) {

      const matchingWorkflow = approverInWorkflow?.find(workflow => workflow.stage == stage.wfname);

      if (!matchingWorkflow) {
        toast.error(`No workflow found for stage "${stage.wfname}".`);
        return false;
      }

      if ((!matchingWorkflow.approvers || matchingWorkflow.approvers.length == 0) && stage.required) {
        toast.error(`The Mandatory  Workflow "${stage.wfname}" has no approvers.`);
        return false;
      }
    }
    return true;
  };

  // Optimized modal handlers with useCallback
  const handleModalToggle = useCallback((modalName, isOpen) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  }, []);

  const closePurchaseOrgModal = useCallback(() => handleModalToggle('purchaseOrg', false), [handleModalToggle]);
  const closePurchaseOrgGrpModal = useCallback(() => handleModalToggle('purchaseOrgGrp', false), [handleModalToggle]);
  const handleOpenExceptionModal = useCallback(() => handleModalToggle('exception', true), [handleModalToggle]);
  const handleOpenProjectModal = useCallback(() => handleModalToggle('project', true), [handleModalToggle]);
  const handleOpenSpendModal = useCallback(() => handleModalToggle('spend', true), [handleModalToggle]);
  const closeExceptionModal = useCallback(() => handleModalToggle('exception', false), [handleModalToggle]);
  const closeProjectModal = useCallback(() => handleModalToggle('project', false), [handleModalToggle]);
  const closeSpendModal = useCallback(() => handleModalToggle('spend', false), [handleModalToggle]);


  const handleWhatever = async (values) => {
    try {
      const nfaDescription = extractTextFromHTML(values.nfaDescription);
      if (nfaDescription?.trim().length < 1) {
        formik.setFieldError('nfaDescription', 'Description is mandatory');
        return;
      }
      var data = {
        id: values?.id,
        customerId: customerid,
        nfaSubject: values.nfaSubject,
        nfaDescription: values.nfaDescription,
        nfaEventType: values.nfaEventType?.id != "" ? values.nfaEventType?.id : 1,
        nfaEventId: values.nfaEventId?.id != "" ? values.nfaEventId?.id : 1,
        nfaAmount: values.nfaAmount,
        nfaBudget: values.nfaBudget,
        nfaCurrency: values.nfaCurrency,
        budgetStatus: budgetStatus,
        nfaSaving: values.nfaSaving,
        remarks: values.remarks,
        configureDate: new Date(),
        createdById: userDetail?.id,
        createdByName: userDetail?.name,
        createdOn: new Date(),
        categoryId: values.categoryId?.id != "" ? values.categoryId?.id : 1,
        projectId: values.projectId?.id != "" ? values.projectId?.id : 0,
        projectName: values.projectName,
        exceptionId: values.exceptionId?.id != "" ? values.exceptionId?.id : 0,
        purchOrgId: values.purchOrgId?.id != "" ? values.purchOrgId?.id : 0,
        purchGrpId: values.purchGrpId?.id != "" ? values.purchGrpId?.id : 0,
        Version: values.Version,
        spendId: values.spendId?.id != "" ? values.spendId?.id : 0,
      };
      setLoading(true)
      const orgId = formik.values.purchOrgId?.id || 0;
      const orgGroupId = formik.values.purchGrpId?.id || 0;

      const datapayload = getPayloadWithStage(
        "currentStage",
        currentStage,
        stagelist,
        data,
        "currentStage",
        orgId,
        orgGroupId
      );

      if (data?.id > 0) {
        const res = await apiClient.postres(
          `/api/NFAManage/Update`,
          datapayload,
          atoken
        );
        if (res) {
          if (!isCallbackSubmit) {
            // toast.success(`Bid Details updated successfully.`);
          }

          setIdFromURL(data?.id)
          updateRequestCell(data?.id);
          // pullgetAuctionManageFind(idFromURL)
        }
        setLoading(false)
        //setValue(2);
        return data?.id;
      } else {

        const res = await apiClient.postres(
          `/api/NFAManage/Add`,
          datapayload,
          atoken
        );
        if (res) {

          setIdFromURL(res.data);

          navigate(`/configuration/manage-nfa/${res.data}?tab=event`)
          updateRequestCell(res.data);
          const AttachFiles = attachmentforevent?.map((x) => {
            x.eventId = res.data;
            x.createdById = userDetail?.id;
            x.createdByName = userDetail?.name;
            return x;
          });
          handlesaveAttachment(AttachFiles, res.data, atoken);
          //setValue(2);
          // toast.success(`Bid details added successfully.`);
          // pullgetNFAManageFind(res.data);
          setLoading(false);

        }
        else {
          toast.error("Error while saving data");
          setLoading(false)
        }
        return res.data;
      }

    } catch (error) {
      console.error("Error during form submission:", error);
    }
  }

  const handleSaveContinue = async () => {

    if (value == 1) {
      // Validate the form before proceeding
      const errors = await formik.validateForm();
      
      // Check for mandatory field validation errors
      if (errors.nfaSubject || errors.nfaDescription) {
        // Mark fields as touched so error messages display
        formik.setFieldTouched('nfaSubject', true);
        formik.setFieldTouched('nfaDescription', true);
        
        // Show appropriate error messages
        if (errors.nfaSubject) {
          toast.error(errors.nfaSubject, {
            toastId: "nfa_subject_error"
          });
        }
        if (errors.nfaDescription) {
          toast.error(errors.nfaDescription, {
            toastId: "nfa_description_error"
          });
        }
        return;
      }
      
      if (formik.values.purchOrgId?.id > 0 && !formik.values.purchGrpId) {
        toast.error("Please fill Purchase Group.", {
          toastId: "nfa_purchOrgId_error"
        });
        return;
      }
      
      // All validations passed, proceed with save and continue
      formik.handleSubmit()
      setValue(2);
    }
     if (value == 2) {
      const res = await NFASOBRFQRef?.current?.saveSOBDetails();
      formik.handleSubmit()
      setValue(3);
    }
    if (value == 3) {
      const res = await NFAQuestionScreenRef?.current?.saveEventQuestion();
      if (res) {
        setSelectedMenuItem("Submit");
        setApproverShow(true);
        setValue(4);
      }
      //saveRFQQuestionLibAdd();
    }


  };

  const handleErrorNFASubmit = () => {
    return true;
  }

  const handleRFQSubmit = async () => {
    setLoading(true)
    const isSubmit = handleErrorNFASubmit();
    if (!isSubmit) {
      setLoading(false);
      return;
    }
    const isApprovers = checkApprovers();
    if (!isApprovers) {
      setLoading(false);
      return;
    }
    const data = {
      activityId: activityId,
      NFAId: parseInt(idFromURL),
      CustomerId: customerid,
      Version: formik?.values?.Version
    };
    const orgId = formik.values.purchOrgId?.id || 0;
    const orgGroupId = formik.values.purchGrpId?.id || 0;
    const datapayload = getPayloadWithStage(
      "currentStage",
      currentStage,
      stagelist,
      data,
      "currentStage",
      orgId,
      orgGroupId
    );

    const res = await apiClient.postres(`/api/NFAManage/NFASubmit`, datapayload, atoken);

    if (res) {
      toast.success("NFA Published Successfully", {
        toastId: "submit_published"
      });
      navigate(`/configuration/manage-nfa`);
    }
    setLoading(false);
  };

  //to handle param url query params based tab selection on initial loading
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      handleTabQueries(tab)
    }

  }, [])
  const handleTabQueries = (tabValue) => {

    switch (tabValue) {
      case 'event':
        return setValue(2);

      default:
        return '';
    }
  };

  // const handletabEdit = useCallback((value) => {
  //   setNFAPreview(true);
  //   setValue(value);
  // }, []);
  const handleCancel = useCallback(() => {
    handleModalToggle('cancel', true);
  }, [handleModalToggle]);

  // handleButtonGroup defined after all dependent functions
  const handleButtonGroup = useCallback(() => {
    switch (selectedMenuItem) {
      case "Submit":
        return handleRFQSubmit()
      case "Save & Continue":
        return handleSaveContinue()
      case "Cancel":
        return handleCancel()
      default:
        return ""
    }
  }, [selectedMenuItem, handleRFQSubmit, handleSaveContinue, handleCancel]);

  const toggleDrawer = useCallback((anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState(prev => ({ ...prev, [anchor]: open }));
    setItemEditTempData([])
  }, []);

  const getStageInfo = (currentStage, stageList) => {
    if (!stageList || stageList.length === 0) return null;

    const currentStageObj = stageList.find(stage => stage.stageName === currentStage);
    if (!currentStageObj) return null; // If current stage is not found

    const nextStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq + 1);
    const prevStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq - 1);

    return {
      prevStage: prevStageObj ? prevStageObj.stageName : null,
      prevStageId: prevStageObj ? prevStageObj.stageId : null,
      currentStage: currentStageObj.stageName,
      currentStageId: currentStageObj.stageId,
      nextStage: nextStageObj ? nextStageObj.stageName : null,
      nextStageId: nextStageObj ? nextStageObj.stageId : null
    };
  };

  // Memoized stage info computation for better performance
  const stageInfo = useMemo(() => getStageInfo(currentStage, stagelist), [currentStage, stagelist]);
  console.log("Stage Info:", stageInfo);

  // Memoized array checks for better performance
  const isStageInArray = useMemo(() =>
    stagearray.includes(currentStage),
    [stagearray, currentStage]
  );

  const canShowRecentQueries = useMemo(() =>
    idFromURL && currentStage.trim() !== "Under Approval" && currentStage.trim() !== "Draft",
    [idFromURL, currentStage]
  );

  const validationSchemaApprover = yup.object().shape({
    remarks: yup.string().when('IsApproved', {
      is: false,
      then: (schema) => schema.required("Reason is required for rejection"),
      otherwise: (schema) => schema.notRequired()
    })
  });
  const formik_NFAApproveReject = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: parseInt(customerid),
      eventId: parseInt(idFromURL),
      eventType: "NFA",
      IsApproved: true,
      //vendorId: tempDataEditData[0]?.approverCount == 1 ? "" : 0,
      remarks: "",
      activityId: parseInt(activityId),
      stageId: 0
    },
    validationSchema: validationSchemaApprover,
    onSubmit: async (values) => {

      setLoading(true)
      // const bidStDate = checkUTC(tempDataEditData[0].bidStDate);
      // const currentDate = new Date();
      // const isCurrentAfterBid = currentDate > new Date(bidStDate);
      // if (isCurrentAfterBid && values?.IsApproved == true) {
      //     toast.info("Start date of auction is passsed.Please revert to send back to creator for edit pr.");
      //     setLoading(false);
      //     return;
      // }
      const actionData = {
        customerId: parseInt(customerid),
        eventId: parseInt(idFromURL),
        eventType: "NFA",
        stageId: stageInfo?.currentStageId,
        IsApproved: values?.IsApproved,
        activityId: parseInt(activityId),
        remarks: values?.remarks,
        //vendorId: values?.vendorId,
        eventSubject: tempDataEditData[0]?.nfaSubject,
        RecordCreatorId: tempDataEditData[0]?.createdById
      }

      const res = await apiClient.postres(
        `/api/ApprovalAction/ApprovalAction`,
        actionData,
        atoken
      );
      if (res) {
        toast.success(`Action Taken Successfully.`);
        navigate(`/App`);
      }
      setLoading(false)
    },
  });
  const handleChange = useCallback((event, newValue) => {
    setValue(newValue);
    // getRoles(newValue);
    // if (!approvershow)
    //   setApproverShow(true)
    
    if (newValue == "4") {
      setSelectedMenuItem("Submit")
      setApproverShow(true);
    }
    else {
      setSelectedMenuItem("Save & Continue")
    }
  }, []);

  const handleApprover = useCallback((booleanvalue) => {
    setApproverShow(booleanvalue)
  }, []);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMenuClick = useCallback((action) => {
    setSelectedMenuItem(action);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleEventAppList = useCallback((arr, updatedvalue) => {
    setEventAppList(arr);
    setApproverInWorkflow(updatedvalue)
  }, []);

  const handleCreatePO = async () => {

    // To be implemented
    var data = {
      eventId: idFromURL
    };
    const queryParams = buildQueryParams(data)
    const res = await apiClient.postres(`api/NFAManage/CreatePOFromNFA?eventId=${idFromURL}`,null,atoken);
    if (res) {
        toast.success("PO initiated Successfully. Please check the PO list.", {
        toastId: "nfa_create_po"
      });
    }

  }



  const handleRecall = async () => {
    var data = {
      eventId: idFromURL,
      eventType: 'NFA'
    };
    const queryParams = buildQueryParams(data)
    const res = await apiClient.getres(`api/ApprovalAction/Recall?${queryParams}`, atoken)
    if (res) {
        toast.success("NFA Recalled Successfully", {
        toastId: "nfa_recall"
      });
      window.location.reload();
    }
  }

  const updateAmount = useCallback(async (amount) => {
      formik.setFieldValue("nfaAmount", amount);
    }, []);

  const updateBudget = useCallback(async (amount) => {
      formik.setFieldValue("nfaBudget", amount);
  }, []);

  if (loadingPermissions) {
    return <GridSkeleton />;
  }

  return (
    <>
      {/* Main content container with left/right layout */}
      <div className="mainContainer d-flex" style={{ gap: '1rem' }}>
        <div className={`leftContent ${approvershow ? "col-9" : "col-12"} d-flex flex-column`}>
          <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column main-scroll-container" style={{
            height: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}>
            {/* Header with BackButton, Stage Flow, and Action Buttons */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
              <div className="d-flex align-items-center">
                {/* <BackButton 
                  title={
                    activityType 
                      ? <span className="page-heading">Note For Approval (NFA-{idFromURL})</span>
                      : <span className="page-heading">Note For Approval (NFA)</span>
                  } 
                  modal={true}
                /> */}
                <BackButton
                  title={
                    tempDataEditData?.[0].eventCode
                      ? <span className="page-heading">{tempDataEditData[0].eventCode}</span>
                      : idFromURL
                        ? <span className="page-heading">NFA ({idFromURL})</span>
                        : <span className="page-heading">Note For Approval</span>
                  }
                  modal={true}
                />
              </div>

              {/* Stage Flow - centered between title and buttons */}
              <div className="d-flex justify-content-center flex-grow-1">
                <MemoizedEventStageFlow
                  stagelist={stagelist}
                  currentStage={currentStage}
                />
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2">
                {!loading ? (
                  actionType && activityId ? (
                    <Button
                      type="button"
                      size="small"
                      className="button-text text-white"
                      variant="contained"
                      onClick={toggleDrawer("openInvoiceApproved", true)}
                    >
                      <span className="text-capitalize">Action</span>
                    </Button>
                  ) : (
                    <>
                      <ButtonGroup variant="contained">
                        <Button
                          variant="contained"
                          className="p-2 pt-1 pb-1"
                          onClick={handleButtonGroup}
                          disabled={currentStage != "Draft"}
                        // disabled={(!isitemeditDisabled && value === 2) || (!isgrnreadDisabled && value===1) || (!iscreatedisable && value===1)|| (!isgeneditdisable && value ===1) || (!isitemreadDisabled && value===2)||
                        // disabled={(!isitemeditDisabled && value === 2) || (!isgrnreadDisabled && value===1) || (!iscreatedisable && value===1)|| (!isgeneditdisable && value ===1) || (!isitemreadDisabled && value===2)||
                        //   (!isitemeditDisabled && value === 2) ||(!isitemcreateDisabled && value ===2)  || (!isquestionreadDisabled && value === 3) || (!isquestioneditDisabled && value === 3)||  (!stagearray.includes(currentStage)) && (selectedMenuItem != "Cancel" && selectedMenuItem != "Save as Templates")}
                        >
                          <span className="text-capitalize">{selectedMenuItem}</span>
                        </Button>
                        <Button
                          // disabled={(!isitemeditDisabled && value === 2) || (!isgrnreadDisabled && value===1) || (!iscreatedisable && value===1) || (!isgeneditdisable && value ===1)||(!isitemreadDisabled && value===2)
                          //   || (!isitemeditDisabled && value === 2) ||(!isitemcreateDisabled && value ===2)|| (!isquestionreadDisabled && value === 3)|| (!isquestioneditDisabled && value === 3)
                          // }
                          variant="contained"
                          className={`button-text text-white ${!stagearray.includes(currentStage) ? 'dropBtn' : ''}`}
                          onClick={handleMenuOpen}
                        >
                          <ExpandMore />
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          {value == "3" && currentStage == 'Draft' && <MenuItem onClick={() => handleMenuClick('Submit')}>
                            <div>
                              <span className="text-capitalize" disabled={!stagearray.includes(currentStage)}>Submit</span>
                            </div>
                          </MenuItem>}
                          {value != "3" && currentStage == 'Draft' && <MenuItem onClick={() => handleMenuClick('Save & Continue')}>
                            <div>
                              <span className="text-capitalize" disabled={!stagearray.includes(currentStage)}>{value == 3 ? "Submit" : "Save & Continue"}</span>
                            </div>
                          </MenuItem>}
                          {idFromURL && <MenuItem onClick={() => handleMenuClick('Save as Templates')}>
                            <div>
                              <span className="text-capitalize">Save as Templates</span>
                            </div>
                          </MenuItem>}
                          <MenuItem onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
                            <div>
                              <span className="text-capitalize">Cancel</span>
                            </div>
                          </MenuItem>
                        </Menu>
                      </ButtonGroup>
                    </>
                  )
                ) : (
                  <Button className="button-text text-white">
                    {value == 3 ? "Submit..." : "Save & Continue..."}
                  </Button>
                )}
              </div>
            </div>

            {/* Tab Navigation and Icons Header */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3">
              {/* Tab Navigation */}
              <Box sx={{
                flexGrow: 1,
                maxWidth: { xs: 280, sm: 480, md: '100%' },
              }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="primary"
                  className='tabstheme'
                  indicatorColor="primary"
                  variant="scrollable"
                  allowScrollButtonsMobile
                >
                  <Tab value={1} label={<span className="section-heading" style={{ color: '#1a2742' }}>General</span>} />
                  <Tab value={2} label={<span className="section-heading" style={{ color: '#1a2742' }}>Allocations</span>} disabled={!idFromURL} />
                  <Tab value={3} label={<span className="section-heading" style={{ color: '#1a2742' }}>Questions</span>} disabled={!idFromURL} />
                  {idFromURL && currentStage.trim() == "Draft" && (
                    <Tab value={4} label={<span className="section-heading" style={{ color: '#1a2742' }}>Preview</span>} disabled={!idFromURL} />
                  )}
                  {idFromURL && currentStage.trim() !== "Draft" && (
                    <Tab value={5} label={<span className="section-heading" style={{ color: '#1a2742' }}>NFA Report</span>} disabled={!idFromURL} />
                  )}
                  {idFromURL && nfaEventIdSelected && (nfaEventType == "RFQ" || nfaEventType == "Auction") && (
                    <Tab value={6} label={<span className="section-heading" style={{ color: '#1a2742' }}>{nfaEventType} Report</span>} disabled={!idFromURL} />
                  )}
                  {idFromURL && currentStage.trim() != "Draft" && (
                    <Tab value={7} label={<span className="section-heading" style={{ color: '#1a2742' }}>Recent Queries</span>} disabled={!idFromURL} />
                  )}

                  {/* {idFromURL && currentStage.trim() == "Draft" && <Tab value={3} label="Preview" disabled={!preview} />} */}
                </Tabs>
              </Box>

              {/* Top-right icons: History, Attachment, and Approval */}
              <div className="d-flex align-items-center gap-2">

                <DropdownButton
                  as={"div"}
                  key={"actionafterdraft"}
                  id={`actionafterdraft`}
                  className='border-primary bg-white'
                  // className="supplieraccmenu"
                  drop={"start"}
                  variant="outlined"
                  style={{
                    // backgroundColor: "white",
                    color: "#2182cde",
                  }}
                  title={
                    <Tooltip title={"Action"}>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "#2A68D3",
                          fontWeight: "500",
                        }}
                      >
                        <HiDotsVertical />{" "}
                      </div>
                    </Tooltip>
                  }
                >
                  <div className="shadow rounded min-width-200px">
                    {/* Menu item to open the Add New Supplier drawer */}
                    {
                      currentStage != "Approved" &&
                      <MenuItem
                      >
                        <LoadingButton size={"small"} onClick={() => handleRecall()} color="btn" variant="text" className="f12 capitalize">Recall NFA</LoadingButton>
                      </MenuItem>
                    }
                    {
                      currentStage == "Approved" &&
                      <MenuItem
                      >
                        <LoadingButton size={"small"} onClick={() => handleCreatePO()} color="btn" variant="text" className="f12 capitalize">Create PO</LoadingButton>
                      </MenuItem>
                      
                    }
                  </div>
                </DropdownButton>

                {idFromURL && (<AttachmentWorkFlow
                  eventtype={`NFA`}
                  eventid={idFromURL}
                  action={stagearray.includes(currentStage)}
                  handleattachmentforevent={handleattachmentforevent}
                  permissionManager={permissionManager}
                />)}
                {idFromURL &&  <HistoryCell eventtype={`NFA`} eventId={pageSlug}  permissionManager={permissionManager} />}

                {idFromURL && (
                  <Tooltip title="Show/Hide Approvers">
                    <IconButton
                      onClick={() => handleApprover(!approvershow)}
                      size="small"
                      edge="start"
                      className="pointer"
                    >
                      <div className="approverCircle shadow-sm">
                        <PeopleAltIcon />
                      </div>
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow-1" style={{
              flex: 1,
              position: 'relative',
              paddingBottom: '24px'
            }}>
              <style jsx global>{`
                .main-scroll-container {
                  scrollbar-width: thin;
                  
                }
                .main-scroll-container::-webkit-scrollbar {
                  width: 8px;
                  display: block;
                }
                .main-scroll-container::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 4px;
                }
                .main-scroll-container::-webkit-scrollbar-thumb {
                  background: #a5aaaeff;
                  border-radius: 4px;
                  min-height: 40px;
                }
                .main-scroll-container::-webkit-scrollbar-thumb:hover {
                  background: #c4c8cbff;
                }
              `}</style>
              {value == 1 && (
                <>
                  {/* Permission Control for General Tab */}
                  {(() => {
                    const canRead = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? true;
                    const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? true;
                    const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? true;
                    const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? true;

                    // If no read permission, deny access completely
                    if (!canRead) {
                      return (
                        <div className="p-4">
                          <Alert severity="error">
                            <div className="d-flex align-items-center">
                              <HiOutlineX className="me-2 f18" />
                              Access Denied: You don't have permission to view General settings.
                            </div>
                          </Alert>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Permission Status Alert */}
                      
                        {currentStage.trim() == "Draft" ? (
                          <div className='custom-fix p-3 pe-2 ps-2' style={{ paddingBottom: '24px' }}>
                            <form onSubmit={formik.handleSubmit} autoComplete="off">
                              <div className='row mt-2'>
                                {/* Event Type & Details */}
                                <div className='col-12 col-md-6 col-lg-6 mb-3'>
                                  <Autocomplete
                                    id="nfaEventType"
                                    name="nfaEventType"
                                    size="small"
                                    className="w-100 f14"
                                    sx={{ width: "100%" }}
                                    options={[
                                      ...eventTypes,
                                      // { id: "new", orgName: "Add New" },
                                    ]}
                                    value={formik?.values?.nfaEventType}
                                    getOptionLabel={(option) => option?.eventType ?? ""}
                                    disabled={!canEdit}
                                    onChange={(e, value) => {
                                      formik.setFieldValue(
                                        "nfaEventType",
                                        value
                                      );
                                      formik.setFieldValue("nfaEventId", null);
                                      setEventDetailsList([])
                                      setTempnfaEventId(0)
                                    }}
                                    renderOption={(props, option) => (
                                      <Box
                                        component="li"
                                        {...props}
                                      >
                                        {option?.eventType}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                        variant="outlined"
                                        {...params}
                                        label="Event Type"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                <div className='col-12 col-md-6 col-lg-6 mb-3'>
                                  <Autocomplete
                                    id="nfaEventId"
                                    name="nfaEventId"
                                    size="small"
                                    className="w-100 f14"
                                    sx={{ width: "100%" }}
                                    options={[
                                      ...eventDetailsList,
                                    ]}
                                    value={formik?.values?.nfaEventId}
                                    getOptionLabel={(option) => option?.subject ?? ""}
                                    disabled={!canEdit}
                                    onChange={(e, value) => {
                                      formik.setFieldValue(
                                        "nfaEventId",
                                        value
                                      );
                                    }}
                                    renderOption={(props, option) => (
                                      <Box
                                        component="li"
                                        {...props}

                                      >
                                        {option?.subject}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                        variant="outlined"
                                        {...params}
                                        label="Event Details"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                {/* Subject */}
                                <div className='col-12 mb-3'>
                                  <TextFieldCell
                                    id="nfaSubject"
                                    name="nfaSubject"
                                    label="NFA Subject *"
                                    placeholder=''
                                    maxLength={100}
                                    disabled={!canEdit}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography variant="body2" color="textSecondary">
                                            {formik?.values?.nfaSubject?.length}/100
                                          </Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                    value={formik?.values?.nfaSubject}
                                    onChange={(e) => {
                                      formik.setFieldValue("nfaSubject", e.target?.value);
                                    }}
                                    error={formik.touched.nfaSubject && Boolean(formik.errors.nfaSubject)}
                                    helperText={formik.touched.nfaSubject && formik.errors.nfaSubject}
                                  />
                                </div>
                                {/* Description */}
                                {/* --- Description Field --- */}
                                <div className="col-12 mb-3">

                                  <div className="profile-field-label mb-1">NFA Description *</div>



                                  <div

                                    className="nfa-description-editor"

                                    style={{

                                      position: 'relative',

                                      zIndex: 1,

                                      border:

                                        formik.touched.nfaDescription && formik.errors.nfaDescription

                                          ? '1px solid #d32f2f'

                                          : '1px solid #d3d3d3',

                                      borderRadius: '4px',

                                      overflow: 'visible',

                                    }}

                                  >

                                    <CKEditor

                                      ref={editorRef}

                                      config={{

                                        ...editorConfig,

                                        height: '150px',

                                        toolbar: [

                                          [

                                            'Source',

                                            'Bold',

                                            'Italic',

                                            'Strike',

                                            'NumberedList',

                                            'BulletedList',

                                            'JustifyLeft',

                                            'JustifyRight',

                                            'Link',

                                            'Unlink',

                                            'Maximize',

                                          ],

                                        ],

                                        removePlugins: 'elementspath,resize',

                                        notification: false,

                                        startupFocus: false,

                                        entities: false,

                                        basicEntities: false,

                                        entities_latin: false,

                                        entities_greek: false,

                                        htmlEncodeOutput: false,

                                        fillEmptyBlocks: false,

                                        autoParagraph: false,

                                      }}

                                      data={formik.values.nfaDescription || ''}

                                      readOnly={!canEdit}

                                      onInstanceReady={(evt) => {

                                        const editor = evt.editor;

                                        editorRef.current = { editor };

                                        setEditorReady(true);



                                        if (editor.container) {

                                          editor.container.setStyles({

                                            'border-radius': '4px',

                                            'border-color': '#d3d3d3',

                                          });

                                        }



                                        // Disable all notifications

                                        editor.showNotification = function () { };

                                        if (window.CKEDITOR) {

                                          window.CKEDITOR.config.notification = false;

                                          window.CKEDITOR.on('instanceReady', function (e) {

                                            e.editor.showNotification = function () { };

                                          });

                                        }



                                        // Optional: immediate initial set

                                        if (formik.values.nfaDescription) {

                                          editor.setData(formik.values.nfaDescription, { noSnapshot: true });

                                        }

                                      }}

                                      onChange={(evt) => {

                                        const editor = evt.editor;

                                        const data = editor.getData();

                                        const plainText = data.replace(/<[^>]*>/g, '').trim();



                                        if (plainText.length <= 2000) {

                                          if (data !== formik.values.nfaDescription) {

                                            formik.setFieldValue('nfaDescription', data);

                                          }

                                        } else {

                                          const previousData = formik.values.nfaDescription || '';

                                          editor.setData(previousData, {

                                            noSnapshot: true,

                                            callback: function () {

                                              const range = editor.createRange();

                                              range.moveToPosition(

                                                range.root,

                                                window.CKEDITOR.POSITION_BEFORE_END

                                              );

                                              editor.getSelection().selectRanges([range]);

                                              editor.focus();

                                              toast.error('Description cannot exceed 2000 characters', {

                                                toastId: 'descerr',

                                              });

                                            },

                                          });

                                        }

                                      }}

                                    />





                                    <div

                                      className="content-text"

                                      style={{

                                        textAlign: 'end',

                                        color:

                                          formik.touched.nfaDescription && formik.errors.nfaDescription

                                            ? '#d32f2f'

                                            : 'inherit',

                                      }}

                                    >

                                      {(formik.values.nfaDescription || '')

                                        .replace(/<[^>]*>/g, '')

                                        .trim().length}

                                      /2000

                                    </div>





                                    {formik.touched.nfaDescription && formik.errors.nfaDescription && (

                                      <FormHelperText className="text-danger">

                                        {formik.errors.nfaDescription}

                                      </FormHelperText>

                                    )}

                                  </div>

                                </div>
                                {/* Amount, Budget, Currency, Budget Status, Savings */}
                                {/* <div className="col-12 col-md-3 col-lg-3 mb-3">
                                  <TextField
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className='f14'
                                    id="nfaAmount"
                                    name="nfaAmount"
                                    label="Amount *"
                                    value={formik.values.nfaAmount}
                                    disabled={!canEdit}
                                    InputProps={{
                                      step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                                      min: 0,
                                      max: 100,
                                    }}
                                    type="number"
                                    onChange={(e) => {
                                      if (DecimalValueRegEx.test(e.target.value)) {
                                        formik.setFieldValue("nfaAmount", e.target.value);
                                      }
                                      else if (e.target.value === "") {
                                        formik.setFieldValue("nfaAmount", '');
                                      }
                                    }}
                                  // error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                  // helperText={formik.touched.quantity && formik.errors.quantity}
                                  />
                                </div>
                                <div className="col-12 col-md-3 col-lg-2 mb-3">
                                  <TextField
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className='f14'
                                    id="nfaBudget"
                                    name="nfaBudget"
                                    label="Budget *"
                                    value={formik.values.nfaBudget}
                                    disabled={!canEdit}
                                    InputProps={{
                                      step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                                      min: 0,
                                      max: 100,
                                    }}
                                    type="number"
                                    onChange={(e) => {
                                      if (DecimalValueRegEx.test(e.target.value)) {
                                        formik.setFieldValue("nfaBudget", e.target.value);
                                      }
                                      else if (e.target.value === "") {
                                        formik.setFieldValue("nfaBudget", '');
                                      }
                                    }}
                                  // error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                  // helperText={formik.touched.quantity && formik.errors.quantity}
                                  />
                                </div>
                                <div className="col-12 col-md-3 col-lg-1 mb-3">
                                  <Autocomplete
                                    id="nfaCurrency"
                                    name="nfaCurrency"
                                    options={[
                                      ...(currencyList?.filter(cl => cl.currencyNm !== (userDetail?.defaultCurrency || "INR")) || []),
                                      { currencyNm: "Add New", id: "new" }
                                    ]}
                                    getOptionLabel={(option) => option.currencyNm ?? (userDetail?.defaultCurrency || "INR")}
                                    disabled={!canEdit}
                                    onChange={(e, value) => {
                                      if (value && value.id === "new") {
                                        setOpenCurrencyModal(true);
                                      } else {
                                        formik.setFieldValue(
                                          "nfaCurrency",
                                          value
                                        );
                                      }
                                    }}
                                    value={formik?.values?.nfaCurrency}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        InputLabelProps={{
                                          shrink: true,
                                        }}
                                        name="nfaCurrency"
                                        label="Currency *"
                                        variant="outlined"
                                        size="small"
                                        className="w-100 f14"
                                      />
                                    )}
                                    renderOption={(props, option) => (
                                      <Box
                                        component="li"
                                        {...props}
                                        key={option.id || option.currencyNm}
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
                                        {option?.currencyNm}
                                      </Box>
                                    )}
                                    noOptionsText="No options"
                                    style={{ width: '100%' }}
                                  />
                                </div>
                                <div className="col-12 col-md-3 col-lg-3 mb-3">
                                  <TextField
                                    InputLabelProps={{
                                      shrink: true,
                                      sx: {
                                        color: 'black',
                                        fontWeight: 'bold'
                                      }
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className='f14'
                                    id="budgetStatus"
                                    name="budgetStatus"
                                    label="Budget Status"
                                    value={budgetStatus}
                                    InputProps={{
                                      step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                                      min: 0,
                                      max: 100,
                                    }}
                                    disabled
                                  // type="number"
                                  // onChange={(e) => {
                                  //     if (DecimalValueRegEx.test(e.target.value)) {
                                  //         formik.setFieldValue("amount", e.target.value);
                                  //     }
                                  //     else if (e.target.value === "") {
                                  //         formik.setFieldValue("amount", '');
                                  //     }
                                  // }}
                                  // error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                                  // helperText={formik.touched.quantity && formik.errors.quantity}
                                  />
                                </div>
                                <div className="col-12 col-md-3 col-lg-3 mb-3">
                                  <TextField
                                    InputLabelProps={{
                                      shrink: true,
                                      sx: {
                                        color: 'black',
                                        fontWeight: 'bold'
                                      }
                                    }}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    className='f14'
                                    id="nfaSaving"
                                    name="nfaSaving"
                                    label="Saving"
                                    value={saving}
                                    disabled
                                  />
                                </div> */}
                                {/* Purchse Org, Group & type of spend */}
                                <div className="col-12 col-md-6 col-lg-4 mb-3">
                                  <Autocomplete
                                    id="purchOrgId"
                                    name="purchOrgId"
                                    size="small"
                                    className="w-100 f14"
                                    sx={{ width: "100%" }}
                                    options={[
                                      ...purchaseAllList,
                                      { id: "new", orgName: "Add New" },
                                    ]}
                                    value={formik?.values?.purchOrgId}
                                    getOptionLabel={(option) => option?.orgName ?? ""}
                                    disabled={!canEdit}
                                    onChange={(e, value) => {
                                      if (value?.id === "new") {
                                        if (!canCreate) {
                                          toast.error("You don't have permission to create new purchase organizations");
                                          return;
                                        }
                                        handleModalToggle('purchaseOrg', true);
                                        formik.setFieldValue("purchGrpId", null);
                                        return
                                      }
                                      formik.setFieldValue(
                                        "purchOrgId",
                                        value
                                      );
                                      formik.setFieldValue("purchGrpId", null);
                                      // formik.setFieldValue("projectId",null);
                                      // formik.setFieldValue("exceptionId",null);
                                      setPurchaseGroupAllList([]);
                                      // setNfaProject([]);
                                      // setException([]);
                                      // setTempProjectId(0);
                                      // setTempExceptionId(0);
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
                                        {option?.orgName}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                        variant="outlined"
                                        {...params}
                                        label="Purchase Org"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                <div className="col-12 col-md-6 col-lg-4 mb-3">
                                  <Autocomplete
                                    id="purchGrpId"
                                    name="purchGrpId"
                                    className="w-100 f14"
                                    sx={{ width: "50%" }}
                                    options={[
                                      ...purchaseGroupAllList,
                                      { id: "new", groupName: "Add New" },
                                    ]}
                                    getOptionLabel={(option) => option?.groupName ?? ""}
                                    value={formik?.values?.purchGrpId}
                                    disabled={!canEdit}
                                    onChange={(e, value) => {
                                      if (value?.id === "new") {
                                        if (!canCreate) {
                                          toast.error("You don't have permission to create new purchase groups");
                                          return;
                                        }
                                        handleModalToggle('purchaseOrgGrp', true);
                                        return
                                      }
                                      formik.setFieldValue(
                                        "purchGrpId",
                                        value
                                      );
                                      // formik.setFieldValue("projectId",null);
                                      // formik.setFieldValue("exceptionId",null);
                                      // setNfaProject([]);
                                      // setException([]);
                                      // setTempProjectId(0);
                                      // setTempExceptionId(0);
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
                                        {option?.groupName}
                                      </Box>
                                    )}
                                    renderInput={(params, data) => (
                                      <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        placeholder=""
                                        label="Purchase Group"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                <div className='col-12 col-md-6 col-lg-4 mb-3'>
                                  <Autocomplete
                                    id="spendId"
                                    name="spendId"
                                    size="small"
                                    className="w-100 f14"
                                    sx={{ width: "100%" }}
                                    options={[
                                      ...nfaSpendList, { id: "new", spend: "Add New" }
                                    ]}
                                    value={formik?.values?.spendId}
                                    getOptionLabel={(option) => option?.spend ?? ""}
                                    disabled={!canEdit}
                                    // onChange={(e, value) => {
                                    //   formik.setFieldValue(
                                    //     "spendId",
                                    //     value
                                    //   );
                                    onChange={(e, newValue) => {
                                      if (newValue?.id === "new") {
                                        if (!canCreate) {
                                          toast.error("You don't have permission to create new spend types");
                                          return;
                                        }
                                        handleOpenSpendModal(); // Open modal to add new project
                                      } else {
                                        formik.setFieldValue("spendId", newValue);
                                      }
                                    }}
                                    // formik.setFieldValue("nfaCategoryList", null);
                                    // setPurchaseGroupAllList([])
                                    // }}
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
                                        {option?.spend}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                        variant="outlined"
                                        {...params}
                                        label="Type of Spend"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                {/* NFA Category , Project & Exceptions */}
                                <div className='col-12 col-md-6 col-lg-4 mb-3'>
                                  <Autocomplete
                                    id="categoryId"
                                    name="categoryId"
                                    size="small"
                                    className="w-100 f14"
                                    sx={{ width: "100%" }}
                                    options={[
                                      ...nfaCategoryList,
                                    ]}
                                    value={formik?.values?.categoryId}
                                    getOptionLabel={(option) => option?.categoryName ?? ""}
                                    disabled={!canEdit}
                                    onChange={(e, value) => {
                                      formik.setFieldValue(
                                        "categoryId",
                                        value
                                      );
                                      // formik.setFieldValue("nfaCategoryList", null);
                                      // setPurchaseGroupAllList([])
                                    }}
                                    renderOption={(props, option) => (
                                      <Box
                                        component="li"
                                        {...props}
                                      >
                                        {option?.categoryName}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                        variant="outlined"
                                        {...params}
                                        label="Category"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                {formik?.values?.categoryId?.id == 2 && (
                                  <div className='col-12 col-md-6 col-lg-4 mb-3'>
                                    <TextFieldCell
                                      id="projectName"
                                      name="projectName"
                                      label="Project Name"
                                      placeholder=''
                                      maxLength={100}
                                      disabled={!canEdit}
                                      // className={`w-100 f14 ${showInputFieldText ? '' : 'd-none'}`}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <Typography variant="body2" color="textSecondary">
                                              {formik?.values?.projectName?.length}/100
                                            </Typography>
                                          </InputAdornment>
                                        ),
                                      }}
                                      value={formik?.values?.projectName}
                                      onChange={(e) => {
                                        formik.setFieldValue("projectName", e.target?.value);
                                      }}
                                    // error={formik.touched.nfaSubject && Boolean(formik.errors.nfaSubject)}
                                    // helperText={formik.touched.nfaSubject && formik.errors.nfaSubject}
                                    />
                                  </div>
                                )}
                                {formik?.values?.categoryId?.id === 1 && (
                                  <div className='col-12 col-md-6 col-lg-4 mb-3'>
                                    <Autocomplete
                                      id="projectId"
                                      name="projectId"
                                      size="small"
                                      sx={{ width: "100%" }}
                                      options={[...nfaProject, { id: "new", project: "Add New" }]}
                                      value={formik?.values?.projectId}
                                      getOptionLabel={(option) => option?.project ?? ""}
                                      disabled={!canEdit}
                                      onChange={(e, newValue) => {
                                        if (newValue?.id === "new") {
                                          if (!canCreate) {
                                            toast.error("You don't have permission to create new projects");
                                            return;
                                          }
                                          handleOpenProjectModal(); // Open modal to add new project
                                        } else {
                                          formik.setFieldValue("projectId", newValue);
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
                                          {option?.project}
                                        </Box>
                                      )}
                                      renderInput={(params) => (
                                        <TextField
                                          variant="outlined"
                                          {...params}
                                          label="Project Name"
                                          InputLabelProps={{ shrink: true }}
                                        />
                                      )}
                                    />
                                  </div>
                                )}
                                <div className='col-12 col-md-6 col-lg-4 mb-3'>
                                  <Autocomplete
                                    id="exceptionId"
                                    name="exceptionId"
                                    size="small"
                                    className="w-100 f14"
                                    sx={{ width: "100%" }}
                                    options={[
                                      ...exception, { id: "new", exception: "Add New" }
                                    ]}
                                    value={formik?.values?.exceptionId}
                                    getOptionLabel={(option) => option?.exception ?? ""}
                                    disabled={!canEdit}
                                    onChange={(e, newValue) => {
                                      if (newValue?.id === "new") {
                                        if (!canCreate) {
                                          toast.error("You don't have permission to create new exceptions");
                                          return;
                                        }
                                        handleOpenExceptionModal(); // Open the modal to add new exception
                                      } else {
                                        formik.setFieldValue("exceptionId", newValue);
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
                                        {option?.exception}
                                      </Box>
                                    )}
                                    renderInput={(params) => (
                                      <TextField
                                        variant="outlined"
                                        {...params}
                                        label="Exception"
                                        shrink={true}
                                      />
                                    )}
                                  />
                                </div>
                                {/* Remarks */}

                                <div className='col-12 mb-3'>

                                  <div className='f14 text-muted mb-1'>Remarks</div>

                                  <div

                                    className="nfa-remarks-editor"

                                    style={{

                                      position: 'relative',

                                      zIndex: 1,

                                      border: formik.touched.remarks && formik.errors.remarks ? '1px solid #d32f2f' : '1px solid #d3d3d3',

                                      borderRadius: '4px',

                                      overflow: 'visible',

                                    }}

                                  >

                                    <style jsx global>{`
                                      .cke_button__image_icon {
                                        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMTQgMkg2YTEgMSAwIDAgMC0xIDF2MUgzYTEgMSAwIDAgMC0xIDF2MTBhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTF2LTFoMmExIDEgMCAwIDAgMS0xVjNhMSAxIDAgMCAwLTEtMXptLTMgMTFIM1Y1aDh2OHptMi0ySDEyVjRhMSAxIDAgMCAwLTEtMUg2VjNoOHY4ek05IDlsLTEuNSAyTDYgOS41IDQgMTJoNmwtMS0zeiIvPjwvc3ZnPg==') !important;
                                        background-position: center !important;
                                        background-repeat: no-repeat !important;
                                        filter: brightness(0) !important;
                                      }
                                      .cke_button__image_icon::before {
                                        content: '' !important;
                                        display: none !important;
                                      }
                                    `}</style>
                                    <CKEditor

                                      ref={remarksEditorRef}

                                      config={{

                                        ...editorConfig,

                                        height: '150px',

                                        toolbar: [

                                          ['Source', 'Bold', 'Italic', 'Strike',

                                            'NumberedList', 'BulletedList',

                                            'JustifyLeft', 'JustifyRight',

                                            'Link', 'Unlink',

                                            'Image',

                                            'Maximize']

                                        ],

                                        extraPlugins: 'clipboard,wysiwygarea,basicstyles',

                                        removePlugins: 'elementspath,resize,image2,uploadimage,filebrowser,uploadwidget,filetools,easyimage',

                                        notification: false,

                                        startupShowVersionWarning: false,

                                        startupFocus: false,

                                        entities: false,

                                        basicEntities: false,

                                        entities_latin: false,

                                        entities_greek: false,

                                        htmlEncodeOutput: false,

                                        fillEmptyBlocks: false,

                                        autoParagraph: false,

                                        on: {

                                          pluginsLoaded: (evt) => { evt.editor.showNotification = () => { }; },

                                          instanceReady: (evt) => { evt.editor.showNotification = () => { }; },

                                        }

                                      }}

                                      readOnly={!canEdit}

                                      data={formik.values.remarks || ''}

                                      onInstanceReady={(evt) => {

                                        const editor = evt.editor;

                                        remarksEditorRef.current = { editor };

                                        setRemarksEditorReady(true);



                                        if (window.CKEDITOR && !window.CKEDITOR._imagePluginDebug) {

                                          window.CKEDITOR._imagePluginDebug = true;

                                          console.log('[CKEditor] Registered plugins:', Object.keys(window.CKEDITOR.plugins.registered));

                                        }



                                        if (editor.container) {

                                          editor.container.setStyles({

                                            'border-radius': '4px',

                                            'border-color': '#d3d3d3',

                                          });

                                        }



                                        editor.showNotification = function () { };

                                        if (window.CKEDITOR) {

                                          window.CKEDITOR.config.notification = false;

                                          window.CKEDITOR.on('instanceReady', function (e) {

                                            e.editor.showNotification = function () { };

                                          });

                                        }



                                        const extractFiles = (dataTransfer) => {

                                          if (!dataTransfer) return [];

                                          try {

                                            if (typeof dataTransfer.getFiles === 'function') {

                                              const files = dataTransfer.getFiles();

                                              if (files && files.length > 0) return Array.from(files);

                                            }

                                          } catch (e) { }

                                          try {

                                            if (dataTransfer.$ && dataTransfer.$.files && dataTransfer.$.files.length > 0) {

                                              return Array.from(dataTransfer.$.files);

                                            }

                                          } catch (e) { }

                                          try {

                                            if (dataTransfer.files && dataTransfer.files.length > 0) {

                                              return Array.from(dataTransfer.files);

                                            }

                                          } catch (e) { }

                                          try {

                                            if (dataTransfer.items && dataTransfer.items.length > 0) {

                                              return Array.from(dataTransfer.items)

                                                .filter(item => item.kind === 'file')

                                                .map(item => item.getAsFile())

                                                .filter(Boolean);

                                            }

                                          } catch (e) { }

                                          return [];

                                        };



                                        const insertImageAsBase64 = (file) => {

                                          if (!file || !file.type?.startsWith('image/')) {

                                            toast.error('Only image files are allowed', { toastId: 'imageTypeErr' });

                                            return;

                                          }

                                          const maxSize = 2 * 1024 * 1024;

                                          if (file.size > maxSize) {

                                            toast.error('Image must be under 2MB', { toastId: 'imageSizeErr' });

                                            return;

                                          }

                                          const reader = new FileReader();

                                          reader.onload = (e) => {

                                            const base64 = e.target?.result;

                                            if (base64) {

                                              editor.insertHtml(`<img src="${base64}" alt="${file.name || 'image'}" style="max-width:140px;height:auto;border-radius:6px;display:block;margin:4px 0;" />`);

                                              editor.fire('change');

                                            }

                                          };

                                          reader.readAsDataURL(file);

                                        };



                                        if (canEdit) {

                                          editor.addCommand('image', {

                                            exec: function (editor) {

                                              const input = document.createElement('input');

                                              input.type = 'file';

                                              input.accept = 'image/*';

                                              input.onchange = (e) => {

                                                const file = e.target.files?.[0];

                                                if (file) insertImageAsBase64(file);

                                              };

                                              input.click();

                                            }

                                          });



                                          editor.ui.addButton('Image', {

                                            label: 'Insert Image',

                                            command: 'image',

                                            toolbar: 'insert',

                                            icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBmaWxsPSIjMDAwIiBkPSJNMTQgMkg2YTEgMSAwIDAgMC0xIDF2MUgzYTEgMSAwIDAgMC0xIDF2MTBhMSAxIDAgMCAwIDEgMWg4YTEgMSAwIDAgMCAxLTF2LTFoMmExIDEgMCAwIDAgMS0xVjNhMSAxIDAgMCAwLTEtMXptLTMgMTFIM1Y1aDh2OHptMi0ySDEyVjRhMSAxIDAgMCAwLTEtMUg2VjNoOHY4ek05IDlsLTEuNSAyTDYgOS41IDQgMTJoNmwtMS0zeiIvPjwvc3ZnPg=='

                                          });



                                          editor.on('paste', (evt) => {

                                            try {

                                              const files = extractFiles(evt.data?.dataTransfer);

                                              const imageFiles = files.filter(f => f && f.type?.startsWith('image/'));

                                              if (imageFiles.length > 0) {

                                                evt.cancel();

                                                imageFiles.forEach(insertImageAsBase64);

                                              }

                                            } catch (err) {

                                              console.warn('[CKEditor] Paste error:', err);

                                            }

                                          });



                                          editor.on('drop', (evt) => {

                                            try {

                                              const files = extractFiles(evt.data?.dataTransfer);

                                              const imageFiles = files.filter(f => f && f.type?.startsWith('image/'));

                                              if (imageFiles.length > 0) {

                                                evt.cancel();

                                                imageFiles.forEach(insertImageAsBase64);

                                              }

                                            } catch (err) {

                                              console.warn('[CKEditor] Drop error:', err);

                                            }

                                          });

                                        }



                                        if (formik.values.remarks) {

                                          editor.setData(formik.values.remarks, { noSnapshot: true });

                                        }

                                      }}





                                      onChange={({ editor }) => {

                                        const data = editor.getData();

                                        const plainText = data.replace(/<[^>]*>/g, '').trim();



                                        if (plainText.length <= 2000) {

                                          if (data !== formik.values.remarks) {

                                            formik.setFieldValue('remarks', data);

                                          }

                                        } else {

                                          const previousData = formik.values.remarks || '';

                                          editor.setData(previousData, {

                                            noSnapshot: true,

                                            callback: () => {

                                              const range = editor.createRange();

                                              range.moveToPosition(range.root, window.CKEDITOR.POSITION_BEFORE_END);

                                              editor.getSelection().selectRanges([range]);

                                              editor.focus();



                                              toast.error('Remarks cannot exceed 2000 characters', { toastId: 'remarksErr' });

                                            }

                                          });

                                        }

                                      }}

                                    />



                                    {/* Character count */}

                                    {formik.values.remarks !== undefined && (

                                      <div style={{ fontSize: '0.8em', color: 'grey', textAlign: 'end' }}>

                                        {`${(formik.values.remarks || '').replace(/<[^>]*>/g, '').length}/2000`}

                                      </div>

                                    )}



                                    {/* Validation error */}

                                    {formik.touched.remarks && formik.errors.remarks && (

                                      <FormHelperText className="text-danger">

                                        {formik.errors.remarks}

                                      </FormHelperText>

                                    )}

                                  </div>

                                </div>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <NFAGeneralPreview formik={formik}
                            purchaseAllList={purchaseAllList}
                            purchaseGroupAllList={purchaseGroupAllList}
                            customClassName="none"
                          />
                        )}

                      </>
                    );
                  })()}
                </>
              )}

              {idFromURL && value === 2 && (
                <>
                  {/* Permission Control for Event Details Tab */}
                  {(() => {
                    const canRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? true;
                    const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? true;
                    const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? true;
                    const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? true;

                    // If no read permission, deny access completely
                    if (!canRead) {
                      return (
                        <div className="p-4">
                          <Alert severity="error">
                            <div className="d-flex align-items-center">
                              <HiOutlineX className="me-2 f18" />
                              Access Denied: You don't have permission to view Event Details.
                            </div>
                          </Alert>
                        </div>
                      );
                    }

                    return (
                      <>
                       
                     

                        <div style={{ padding: '1rem', boxSizing: 'border-box', overflow: 'visible' }}>
                          {/* <SOB/> */}
                          {<NFASOBEventBoxRFQ
                            props={{
                              eventId: idFromURL,
                              eventtype: "NFA",
                              nfaEventId: nfaEventIdSelected,
                              nfaEventType: nfaEventType,
                              Version: formik?.values?.Version,
                              nfaEventVersion: nfaEventVersion,
                              currentStage: currentStage,
                              permissionManager: permissionManager,
                              nfaAmount: formik?.values?.nfaAmount,
                              nfaBudget: formik?.values?.nfaBudget,
                              nfaCurrency: formik?.values?.nfaCurrency,
                              budgetStatus: budgetStatus,
                              saving: saving,
                              canRead: canRead,
                              canEdit: canEdit,
                              canCreate: canCreate,
                              canRemove: canRemove,
                              updateAmount: updateAmount,
                              updateBudget: updateBudget
                            }}
                            ref={NFASOBRFQRef}
                          />}
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
              {idFromURL &&  value == 3 ? (
                <>
                  {/* Permission Control for Questions Tab */}
                  {(() => {
                    const canRead = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? true;
                    const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? true;
                    const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.CREATE) ?? true;
                    const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? true;

                    // If no read permission, deny access completely
                    if (!canRead) {
                      return (
                        <div className="p-4">
                          <Alert severity="error">
                            <div className="d-flex align-items-center">
                              <HiOutlineX className="me-2 f18" />
                              Access Denied: You don't have permission to view Questions.
                            </div>
                          </Alert>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Permission Status Alert */}
                   

                        <div className="mb-5">
                          <NFAQuestionScreen
                            props={{
                              eventid: idFromURL,
                              eventtype: "NFA",
                              librarytype: "QuestionLibrary",
                              action: stagearray.includes(currentStage) && canEdit,
                              currentStage: currentStage,
                              Version: formik?.values?.Version,
                              editquestion: isquestioneditDisabled || !canEdit,
                              permissionManager: permissionManager,
                              canRead: canRead,
                              canEdit: canEdit,
                              canCreate: canCreate,
                              canRemove: canRemove
                            }}
                            ref={NFAQuestionScreenRef}
                          />
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : null}
              {idFromURL && value == 4 && (
                <>
                  {/* Permission Control for Preview Tab */}
                  {(() => {
                    const canRead = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? true;
                    const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? true;
                    const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? true;
                    const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? true;

                    // If no read permission, deny access completely
                    if (!canRead) {
                      return (
                        <div className="p-4">
                          <Alert severity="error">
                            <div className="d-flex align-items-center">
                              <HiOutlineX className="me-2 f18" />
                              Access Denied: You don't have permission to view Preview.
                            </div>
                          </Alert>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Permission Status Alert */}
                       

                        <div className="custom-fix">
                          {(accessLevel?.find(x => x.claimType == "General")?.claimValue?.Read != "N" && canRead) &&
                            <>
                              <Box
                                id="generaldetails"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mb: 2,
                                  pl: 2
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#1976d2",
                                    fontWeight: 400,
                                    fontSize: "14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                  }}
                                >
                                  📝 NFA General Details
                                </Typography>

                                {stagearray.includes(currentStage) && canEdit && (
                                  <IconButton
                                    size="small"
                                    sx={{
                                      backgroundColor: "#fff",
                                      "&:hover": { backgroundColor: "#f0f0f0" }
                                    }}
                                  >
                                    <HiPencilAlt className="f17 text-primary" />
                                  </IconButton>
                                )}
                              </Box>

                              <NFAGeneralPreview formik={formik}
                                purchaseAllList={purchaseAllList}
                                purchaseGroupAllList={purchaseGroupAllList}
                                customClassName="none"
                              />
                            </>
                          }
                          {(
                            accessLevel?.find(x => x.claimType === "Questions")?.claimValue?.Read !== "N" &&
                            (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) || true)
                          ) && (
                              <Card
                                variant="outlined"
                                sx={{
                                  borderRadius: 2,
                                  mb: 3,
                                  boxShadow: 1,
                                }}
                              >
                                <CardHeader
                                  title={
                                    <Typography
                                      sx={{
                                        color: "#1976d2",
                                        fontWeight: 400,
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                      }}
                                    >
                                      ❓ NFA Questions
                                    </Typography>
                                  }
                                  action={
                                    stagearray.includes(currentStage) &&
                                      (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) || true) ? (
                                      <IconButton
                                        size="small"
                                        sx={{
                                          backgroundColor: "#fff",
                                          "&:hover": { backgroundColor: "#f5f5f5" },
                                        }}
                                      >
                                        <HiPencilAlt className="f17 text-primary" />
                                      </IconButton>
                                    ) : null
                                  }
                                  sx={{ pb: 0 }} // Remove extra padding if needed
                                />

                                <CardContent>
                                  <NFAQuestionScreen
                                    props={{
                                      eventid: idFromURL,
                                      eventtype: "NFA",
                                      librarytype: "QuestionLibrary",
                                      action: false,
                                      Version: formik?.values?.Version,
                                      editquestion: isquestioneditDisabled,
                                      permissionManager: permissionManager
                                    }}
                                    ref={NFAQuestionScreenRef}
                                  />
                                </CardContent>
                              </Card>
                            )}

                        </div>
                      </>
                    );
                  })()}
                </>
              )}
              {idFromURL &&  value == 5 && (
                <NFAReport
                  props={{
                    eventId: idFromURL,
                  }}
                />
              )}
              {idFromURL &&  value == 6 && nfaEventType == "RFQ" && (
                <ERFQComparative key={"ERFQComparative"}
                  actions={{
                    rfqid: nfaEventIdSelected,
                    nfaEventVersion: nfaEventVersion,
                    permissionManager: permissionManager,
                    isNFA: true
                  }}
                />
              )}
              {idFromURL &&  value == 6 && nfaEventType == "Auction" && (
                <>
                  <AuctionControl
                    key={"AuctionControl"}
                    isDifferentPage={false}
                    auctionId={nfaEventIdSelected}
                  />
                </>
              )}
              {idFromURL &&  value == 7 &&
                <>
                  {/* Permission Control for Recent Queries Tab */}
                  {(() => {
                    const canRead = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ) ?? true;
                    const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.EDIT) ?? true;
                    const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? true;
                    const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.REMOVE) ?? true;

                    // If no read permission, deny access completely
                    if (!canRead) {
                      return (
                        <div className="p-4">
                          <Alert severity="error">
                            <div className="d-flex align-items-center">
                              <HiOutlineX className="me-2 f18" />
                              Access Denied: You don't have permission to view Recent Queries.
                            </div>
                          </Alert>
                        </div>
                      );
                    }

                    return (
                      <>
                        {/* Permission Status Alert */}
                     

                        <QueryList
                          pageSlug={pageSlug}
                          key={"QueryList"}
                          accessLevel={accessLevel}
                          fromEventPage={true}
                          EventId={pageSlug}
                          EventType={"NFA"}
                          permissionManager={permissionManager}
                          canRead={canRead}
                          canEdit={canEdit}
                          canCreate={canCreate}
                          canRemove={canRemove}
                        />
                      </>
                    );
                  })()}
                </>
              }

            </div>
          </div>
        </div>
        {/* Right side - Approval Section */}

        <div className={`rightContent ${approvershow ? "col-3" : "d-none"}`}>
          <div className="bg-white rounded-default shadow-sm p-3 w-100" style={{
            height: 'calc(100vh - 120px)',
            overflow: 'auto',
            /* Hide scrollbar for Chrome, Safari and Opera */
            scrollbarWidth: 'none', /* Firefox*/
            msOverflowStyle: 'none' /* IE and Edge */
          }}>
            <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
              <div className="section-heading mb-0 pb-4">Approval Workflow</div>
              <IconButton
                onClick={() => handleApprover(false)}
                size="small"
                className="text-muted"
              >
                <HiOutlineX className="f16" />
              </IconButton>
            </div>
            <div className="flex-grow-1">
              {approvershow ? (
                <EventApprovalBox
                  requestCell={requestCell}
                  handleEventAppList={handleEventAppList}
                  wfupdate={wfupdate}
                  action={stagearray.includes(currentStage)}
                  stagelist={stagelist}
                  accessLevel={accessLevel}
                  Version={parseInt(formik?.values?.Version)}
                  permissionManager={permissionManager}
                />
              ) : (
                <NotFoundPage body1={`No Approver workflow rights`} />
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Purchase Org Modal */}
      <Modal
        size="lg"
        show={modals.purchaseOrg}
        backdrop="static"
        keyboard={false}
        value={"Add NEW CATEGORY"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={closePurchaseOrgModal}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">

            </div>
          </Modal.Title>
          <IconButton
            onClick={closePurchaseOrgModal}
            size="small"
            edge="start"
          >
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <PurchaseOrg selectedPurOrg={PullPurchaseOrgAll} />
          </div>
        </Modal.Body>
      </Modal>

      {/* Purchase Group Modal */}
      <Modal
        size="lg"
        show={modals.purchaseOrgGrp}
        backdrop="static"
        keyboard={false}
        value={"Add NEW CATEGORY"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={closePurchaseOrgGrpModal}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">

            </div>
          </Modal.Title>
          <IconButton
            onClick={closePurchaseOrgGrpModal}
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
      <Modal
        size="lg"
        show={modals.exception}
        backdrop="static"
        keyboard={false}
        value={"Add NEW CATEGORY"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={closeExceptionModal}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">
              Exception
            </div>
          </Modal.Title>
          <IconButton
            onClick={closeExceptionModal}
            size="small"
            edge="start"
          >
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <AddUpdateexception handleExceptionList={handleExceptionList} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        show={modals.project}
        backdrop="static"
        keyboard={false}
        value={"Add NEW CATEGORY"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={closeProjectModal}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">
              Project
            </div>
          </Modal.Title>
          <IconButton
            onClick={closeProjectModal}
            size="small"
            edge="start"
          >
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <AddUpdateProject handleProjectList={handleProjectList} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        show={modals.spend}
        backdrop="static"
        keyboard={false}
        value={"Add NEW CATEGORY"}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={closeSpendModal}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">
              Spend
            </div>
          </Modal.Title>
          <IconButton
            onClick={closeSpendModal}
            size="small"
            edge="start"
          >
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <AddUpdateSpend handleSpendList={handleSpendList} />
          </div>
        </Modal.Body>
      </Modal>
      {/* Quesiton Drawer */}
      <React.Fragment key="qusDrawertr">
        <Drawer
          anchor="right"
          open={state["qusDrawer"]}

        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Add Question</div>
                  <div>
                    <IconButton
                      onClick={toggleDrawer("qusDrawer", false)}
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
              <Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>
                <AddNFAQuestionFormCell
                  idFromURL={idFromURL}
                  callbackQuesAddCustom={callbackQuesAddCustom}
                  libraryId={libraryId}
                  questionforedit={questionforedit}
                />
              </Box>
            </div>
          </Box>
        </Drawer>
      </React.Fragment>
      {/* Approver Drawer */}
      <React.Fragment key="approveNFA">
        <Drawer anchor="right" open={state["openInvoiceApproved"]}>
          <form onSubmit={formik_NFAApproveReject.handleSubmit} autoComplete="off">
            <Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
              <div className="flex flex-col">
                <Box className="bgheaderCards">
                  <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                    <div className="ms-3 text-white">
                      Approval Action
                    </div>
                    <div>
                      <IconButton
                        onClick={toggleDrawer("openInvoiceApproved", false, [])}
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
                <div className="p-3">
                  <div className="row ">
                    <div className="col-12 col-md-12 col-lg-12">
                      <div className="mb-4 textblue f14"></div>
                      <div className="row">
                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="IsApproved"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            name="IsApproved"
                            select
                            className="mb-2"
                            fullWidth
                            size="small"
                            label="Status"
                            variant="outlined"
                            value={formik_NFAApproveReject.values.IsApproved}
                            onChange={(e) =>
                              formik_NFAApproveReject.setFieldValue(
                                "IsApproved",
                                e.target.value
                              )
                            }
                          >
                            <MenuItem value={true}>Approve</MenuItem>
                            <MenuItem value={false}>Reject</MenuItem>
                          </TextField>
                        </div>

                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="remarks"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            multiline
                            rows={3}
                            name="remarks"
                            className="w-100 f14"
                            size="small"
                            label="Comment "
                            variant="outlined"
                            inputProps={{ maxLength: 200 }}
                            value={formik_NFAApproveReject?.values?.remarks}
                            error={formik_NFAApproveReject.touched.remarks && Boolean(formik_NFAApproveReject.errors.remarks)}
                            helperText={formik_NFAApproveReject.touched.remarks && formik_NFAApproveReject.errors.remarks}
                            onChange={(e) =>
                              formik_NFAApproveReject.setFieldValue(
                                "remarks",
                                e.target.value
                              )
                            }
                            InputProps={{
                              endAdornment: formik_NFAApproveReject?.values?.remarks && (
                                <InputAdornment position="end">
                                  <Typography variant="body2" color="textSecondary">
                                    {formik_NFAApproveReject?.values?.remarks?.length}/200
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </div>
                      </div>


                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 text-end">
                      <LoadingButton
                        loading={loading}
                        color="primary"
                        size="medium"
                        className="text-white text-capitalize mb-3 mr-3"
                        variant="contained"
                        type="submit"
                      >
                        <span>Save</span>
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </form>
        </Drawer>

        {/* Currency Modal */}
        <Modal
          size="lg"
          show={OpenCurrencyModal}
          backdrop="static"
          keyboard={false}
          className="zindex1280"
          backdropClassName="zindex1280"
          centered
          contentClassName="border-0"
          onHide={() => CloseCurrencyModal()}
        >
          <Modal.Header className="pt-2 pb-2 bgheaderCards">
            <Modal.Title id="modal-heading">
              <div className="d-flex align-items-center f14 text-white">
                Manage Currency
              </div>
            </Modal.Title>
            <IconButton onClick={() => CloseCurrencyModal()} size="small" edge="start">
              <HiOutlineX className="f20 text-white" />
            </IconButton>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="p-3">
              <AddEditCurrency handleCurrencyList={handleCurrencyList} />
            </div>
          </Modal.Body>
        </Modal>
      </React.Fragment>
    </>
  );
};

export default NoteForApproval;
