// Backup copy created for reference
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box, Tab, Tabs, TextField,
  InputAdornment, Typography, MenuItem,
  Menu, Tooltip, IconButton, Alert,
  Card, CardHeader, CardContent,
} from '@mui/material';
import { MemoizedEventStageFlow } from '../../../utils/common/component';
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { OrgGroupMasterList, getPurchaseOrgList } from '../../../utils/commerciallibrary';
import {
  getPayloadWithStage, getApiErrorMessage,
  attachmentmodalforevent, eventattachmentmodal,
  filequeryparam, getPayloadWithFilePath
} from '../../../utils/common';
import { uploadFilesOnAzure } from '../../../utils/documentlibrary';
import { HiOutlineX, HiPencilAlt } from "react-icons/hi";
import { toast } from 'react-toastify';
import NFAGeneralPreview from './NFAGeneralPreview';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { ApiClient } from '../../../Apiclient';
// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import TextFieldCell from '../../BaseCells/TextFieldCell';
import NFAGeneralForm from './NFAGeneralForm';
import { findObjByValueFromArray, handlesaveAttachment } from '../../../utils/common';
import {
  extractTextFromHTML, getEventDetails,
  getCurrency, getNFAProjectList, getNFAConditionList,
  getLibraryOrgEntityFind, getNFAManageFindById, getNFASpendList
} from '../../../utils/common/utility';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HistoryCell from '../../BaseCells/HistoryCell';
import AttachmentWorkFlow from '../../BaseCells/attachmentworkflow';
import { StageFindAll } from "../../../utils/stagemaster";
import { actionTypes, useStateValue } from '../../../store';
import PEModal from '../../../components/PEModal';
import ApprovalConfirmDialog from '../../../components/RFQ/ApprovalConfirmDialog';
import AddEditCurrency from '../../../utils/common/AddEditCurrency';
import PurchaseOrgGrp from '../../../utils/common/PurchaseOrgGrp';
import PurchaseOrg from '../../../utils/common/PurchaseOrg';
import NFAQuestionScreen from "./NFAQuestionScreen";
import CommonBottomDrawer from '../../../components/CommonBottomDrawer';
import AddNFAQuestionFormCell from "./AddNFAQuestionFromCell";
import AddUpdateexception from './AddUpdateException';

import AddUpdateProject from './AddUpdateProject';
import QueryList from '../../CommunucationHub/QueryList';
import NFASOBEventBoxRFQ from './NFASOBEventBoxRFQ';
import AddUpdateSpend from './AddUpdateSpend';
import LoadingButton from '@mui/lab/LoadingButton';
import NFAReport from './NFAReport';
import NFAWorkflowPanel from './NFAWorkflowPanel';
import ERFQComparative from "../RequestForQuotation/ERFQComparative";
import AuctionControl from "../Auctions/AuctionControl";

const NoteForApproval = ({ claimType, breadcrumb }) => {
  const [{ atoken, customerid, eventId, customersuffix, userDetail, roleClaims }, dispatch] = useStateValue();

  if (window.CKEDITOR) {
    window.CKEDITOR.disableAutoInline = true;
    // window.CKEDITOR.config.notification = false;
    // window.CKEDITOR.config.removePlugins = 'notification';

    window.CKEDITOR.on('instanceReady', function (evt) {
      evt.editor.showNotification = function () { };
    });
  }

  const navigate = useNavigate();
  const [value, setValue] = useState(1); // Tab value state
  const [approvershow, setApproverShow] = useState(true);
  const [workflowPanelTab, setWorkflowPanelTabRaw] = useState('workflow');
  const setWorkflowPanelTab = useCallback((tab) => {
    setWorkflowPanelTabRaw(tab);
  }, []);
  const [anchorEl, setAnchorEl] = useState(null); // For handling menu anchor
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const handleStatusMenuOpen = (e) => setStatusAnchorEl(e.currentTarget);
  const handleStatusMenuClose = () => setStatusAnchorEl(null);
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
  const [currencyList, setCurrencyList] = useState([]);
  const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState("");
  // const [nfaCategory, setNfaCategory] = useState("");
  // const [nfaProject, setNfaProject] = useState([]);
  // const [eventDetailsList , setEventDetailsList] = useState([]);
  // const EventQuestionScreenRef = React.createRef();
  const NFAQuestionScreenRef = useRef(null);
  const NFASOBRFQRef = useRef(null);
  const [saving, setSaving] = useState(0);
  const [eventAppList, setEventAppList] = useState([]);
  const [accessLevel, setAccessLevel] = useState([]);
  const [wfupdate, setwfUpdate] = useState([false]);
  const [selectedQuesionArray, setSelectedQuesionArray] = useState([]);
  const [questionLibraryDll, setQuestionLibraryDll] = useState(null);
  const [tempDataEditData, setTempDataEditData] = useState(null);
  const [selectedQuesDll, setSelectedQuesDll] = useState();
  const [libraryId, setLibraryId] = useState();
  const [questionforedit, setQuestionForEdit] = useState(null);
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

  const [eventDetailsList, setEventDetailsList] = useState([])
  const [nfaProject, setNfaProject] = useState([])
  const [nfaSpendList, setNfaSpendList] = useState([]);
  const [exception, setException] = useState([])
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
      nfaSaving: 0,
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

  // Keep CKEditor synced with Formik after refresh or API load

  useEffect(() => {
    if (!editorReady || !dataLoaded) return;
    // Get CKEditor instance safely

    let editorInstance = editorRef.current?.editor;
    // Fallback: sometimes CKEditor doesnâ€™t bind to ref

    if (!editorInstance && window.CKEDITOR) {
      const ids = Object.keys(window.CKEDITOR.instances);
      if (ids.length > 0) {
        editorInstance = window.CKEDITOR.instances[ids[0]];
      }
    }
    if (!editorInstance) {
      return;
    }

    const newData = formik.values.nfaDescription || '';
    const currentData = editorInstance.getData();

    if (newData && newData !== currentData) {
      editorInstance.setData(newData, { noSnapshot: true });
    }

  }, [editorReady, dataLoaded, formik.values.nfaDescription]);

  useEffect(() => {
    if (!remarksEditorReady || !dataLoaded) return;
    // Get CKEditor instance safely
    let remarksEditorInstance = remarksEditorRef.current?.editor;
    // Fallback: sometimes CKEditor doesnâ€™t bind to ref
    if (!remarksEditorInstance && window.CKEDITOR) {
      const ids = Object.keys(window.CKEDITOR.instances);
      if (ids.length > 0) {
        // Pick the second editor instance if you have multiple
        remarksEditorInstance = window.CKEDITOR.instances[ids[1]];
      }
    }

    if (!remarksEditorInstance) {
      return;
    }

    const newRemarks = formik.values.remarks || '';
    const currentRemarks = remarksEditorInstance.getData();

    if (newRemarks !== currentRemarks) {
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
      if (res?.[0]?.nfaCurrency && res?.[0]?.nfaCurrency !== "") {
        formik.setFieldValue("nfaCurrency", res?.[0]?.nfaCurrency);
      }
      if (res?.[0]?.budgetStatus && res?.[0]?.budgetStatus !== "") {
        formik.setFieldValue("budgetStatus", res?.[0]?.budgetStatus);
      }
      if (res?.[0]?.nfaSaving && res?.[0]?.nfaSaving !== "") {
        formik.setFieldValue("nfaSaving", res?.[0]?.nfaSaving);
      }
      if (res?.[0]?.categoryId && res?.[0]?.categoryId !== "") {
        const matchedEvent = nfaCategoryList.find(
          (event) => event.id === res[0].categoryId
        );

        if (matchedEvent) {
          formik.setFieldValue("categoryId", matchedEvent); // Still setting the raw ID in Formik
        }

      }
      if (res?.[0]?.projectName && res?.[0]?.projectName !== "") {
        formik.setFieldValue("projectName", res?.[0]?.projectName);
      }
      if (res?.[0]?.projectId && res?.[0]?.projectId !== "") {
        setTempProjectId(res?.[0]?.projectId);
      }
      if (res?.[0]?.exceptionId && res?.[0]?.exceptionId !== "") {
        setTempExceptionId(res?.[0]?.exceptionId);
      }
      if (res?.[0]?.spendId && res?.[0]?.spendId !== "") {

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
    }).catch((error) => {
      toast.error(getApiErrorMessage(error), { toastId: "nfa_find_error" });
      setLoadingPermissions(false);
    });
    setTimeout(() => {
      setDataLoaded(true);
    }, 300); // small delay ensures CKEditor is ready
  };

  const handleattachmentforevent = useCallback((data) => {
    setAttachmentforEvent(data);
  }, []);

  const [stageValue, setStageValue] = useState('');
  // const [actionType, setActionType] = useState("");

  const getEventStages = async (urlparams) => {
    try {
      const queryParams = buildQueryParams(urlparams);
      const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
      if (res?.data?.result.length > 0) {
        const result = res?.data?.result?.filter((item) => item.stageSeq > 0);
        setStageList(result);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "stage_fetch_error" });
    }
  }

  useEffect(() => {

    const params = new URLSearchParams(searchParams);
    const actionType = params.get("ActionType");
    const ActivityId = params.get("ActivityId");
    const StageValue = params.get("Stage");
    setActionType(actionType);

    // if (actionType === "approval" ) {
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
    if (accessLevel?.find(x => x.claimType === "Work Flow")?.claimValue?.Read === "N") {
      setApproverShow(false);
    }
  }, [accessLevel]);

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
      (value === 1 || value === 3) &&
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
  //Access Level - handled by the useEffect above

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

  useEffect(() => {
    if (tempProjectId > 0 && nfaProject.length > 0) {
      const matchedEvent = nfaProject.find(
        (event) => event.id === tempProjectId
      );
      if (matchedEvent) {
        formik.setFieldValue("projectId", matchedEvent); // Still setting the raw ID in Formik
      }
    }
  }, [nfaProject, tempProjectId]);

  useEffect(() => {
    if (tempExceptionId > 0 && exception.length > 0) {
      const matchedEvent = exception.find(
        (event) => event.id === tempExceptionId
      );
      if (matchedEvent) {
        formik.setFieldValue("exceptionId", matchedEvent); // Still setting the raw ID in Formik
      }
    }
  }, [exception, tempExceptionId]);

  useEffect(() => {
    if (tempSpendId > 0 && nfaSpendList.length > 0) {
      const matchedEvent = nfaSpendList.find(
        (event) => event.id === tempSpendId
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
      if (res !== "" && res !== undefined) {
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
      if (res !== "" && res !== undefined) {
        setEventDetailsList(res);
      }
    })
  }, [customerid, atoken]);

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
              (x) => x.id === uniqueMappedRecords?.[0]
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

  const callbackQuesAddCustom = useCallback((quesData, questionforedit) => {
    if (!questionforedit) {
      setSelectedQuesionArray((prev) => [...prev, quesData]);
      setState({ ...state, qusDrawer: false });
    }
    else {
      const obj = selectedQuesionArray?.map((x) => {
        if (x.id === questionforedit.id) {
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
    if (formik.values.nfaEventType?.id && formik.values.nfaEventType?.id !== "0") {
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

  useEffect(() => {
    if (formik.values?.categoryId?.id === 2) {
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
    if (formik.values.nfaAmount === 0) {
      newBudgetStatus = "";
    }
    else {
      if (newSaving >= 0) {
        newBudgetStatus = "Within Budget";
      }
      else if (newSaving < 0 && formik.values.nfaBudget !== 0) {
        newBudgetStatus = "Outside Budget";
      }
      else if (formik.values.nfaBudget === 0) {
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

  const checkApprovers = () => {

    if (!stagelist || stagelist.length === 0) {
      toast.error("Error: No stages found in workflow.");
      return false;
    }

    const isStageRequired = stagelist.filter((x) => x.wfname);
    for (const stage of isStageRequired) {

      const matchingWorkflow = approverInWorkflow?.find(workflow => workflow.stage === stage.wfname);

      if (!matchingWorkflow) {
        toast.error(`No workflow found for stage "${stage.wfname}".`);
        return false;
      }

      if ((!matchingWorkflow.approvers || matchingWorkflow.approvers.length === 0) && stage.required) {
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
        nfaEventType: values.nfaEventType?.id !== "" ? values.nfaEventType?.id : 1,
        nfaEventId: values.nfaEventId?.id !== "" ? values.nfaEventId?.id : 1,
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
        categoryId: values.categoryId?.id !== "" ? values.categoryId?.id : 1,
        projectId: values.projectId?.id !== "" ? values.projectId?.id : 0,
        projectName: values.projectName,
        exceptionId: values.exceptionId?.id !== "" ? values.exceptionId?.id : 0,
        purchOrgId: values.purchOrgId?.id !== "" ? values.purchOrgId?.id : 0,
        purchGrpId: values.purchGrpId?.id !== "" ? values.purchGrpId?.id : 0,
        Version: values.Version,
        spendId: values.spendId?.id !== "" ? values.spendId?.id : 0,
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
          if (value === 2) setValue(3);
          else setValue(2);
        }
        setLoading(false)
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

  const handleSaveContinue = useCallback(async () => {

    if (value === 1) {
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
      // Tab advance happens inside handleWhatever callback after save completes
      formik.handleSubmit()
    }
    if (value === 2) {
      const res = await NFASOBRFQRef?.current?.saveSOBDetails();
      if (res === true) {
        formik.handleSubmit()
        setValue(3);
      }
    }
    if (value === 3) {
      const res = await NFAQuestionScreenRef?.current?.saveEventQuestion();
      if (res) {
        setSelectedMenuItem("Submit");
        setApproverShow(true);
        setValue(4);
      }
      //saveRFQQuestionLibAdd();
    }

  }, [value, formik]);

  const handleErrorNFASubmit = () => {
    return true;
  }

  const handleRFQSubmit = useCallback(async () => {
    setLoading(true);
    try {
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
        toast.success("NFA Published Successfully", { toastId: "submit_published" });
        navigate(`/configuration/manage-nfa`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "nfa_submit_error" });
    } finally {
      setLoading(false);
    }
  }, [activityId, idFromURL, customerid, formik, currentStage, stagelist, atoken, handleErrorNFASubmit, checkApprovers, navigate]);

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

  const handleCancel = useCallback(() => {
    handleModalToggle('cancel', true);
  }, [handleModalToggle]);

  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);
  const handleClickOpen = () => setOpen(true);
  const [TemplateTitle, setTemplateTitle] = useState("");

  const handleSaveTemplate = async () => {
    try {
      if (!TemplateTitle.trim()) {
        toast.error("please enter valid name");
        return;
      }
      if (!idFromURL) {
        toast.error("NFA ID must be there to create template");
        return;
      }
      const data = {
        templateTitle: TemplateTitle.trim(),
        subject: formik?.values?.nfaSubject?.trim(),
        eventType: "NFA",
        eventId: idFromURL,
        customerId: customerid
      };
      const res = await apiClient.postres("/api/EventTemplate/Add", data, atoken);
      if (res) {
        toast.success("Template saved successfully");
        setOpen(false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "save_template_error" });
    }
  };

  // handleButtonGroup defined after all dependent functions
  const handleButtonGroup = useCallback(() => {
    switch (selectedMenuItem) {
      case "Submit":
        return handleRFQSubmit()
      case "Save & Continue":
        return handleSaveContinue()
      case "Save as Templates":
        return handleClickOpen()
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
      //vendorId: tempDataEditData[0]?.approverCount === 1 ? "" : 0,
      remarks: "",
      activityId: parseInt(activityId),
      stageId: 0
    },
    validationSchema: validationSchemaApprover,
    onSubmit: async (values) => {

      setLoading(true)
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

    if (newValue === "4") {
      setSelectedMenuItem("Submit")
      setApproverShow(true);
    }
    else {
      setSelectedMenuItem("Save & Continue")
    }
  }, []);

  // â”€â”€ Right panel: History tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [historyGraph, setHistoryGraph] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPanelHistory = async () => {
    if (!idFromURL) return;
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ CustomerId: customerid, EventType: 'NFA', EventId: idFromURL }).toString();
      const res = await apiClient.getres(`api/ReportConfig/AuditReport?${params}`, atoken);
      if (res?.data) {
        setHistoryGraph(res.data?.stategraph || []);
      }
    } catch (_) { }
    setHistoryLoading(false);
  };

  // â”€â”€ Right panel: Attachments tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [panelSavedAttach, setPanelSavedAttach] = useState([]);
  const [panelAttachLoading, setPanelAttachLoading] = useState(false);
  const [panelAttachDesc, setPanelAttachDesc] = useState('');
  const [panelAttachFile, setPanelAttachFile] = useState(null);
  const [panelAttachError, setPanelAttachError] = useState('');
  const [panelAttachAdding, setPanelAttachAdding] = useState(false);
  const [panelHasCheckboxChanged, setPanelHasCheckboxChanged] = useState(false);
  const [panelIsUpdating, setPanelIsUpdating] = useState(false);
  const panelFileInputRef = useRef(null);

  const fetchPanelAttachments = async () => {
    setPanelAttachLoading(true);
    setPanelHasCheckboxChanged(false);
    try {
      if (idFromURL) {
        const params = buildQueryParams({ EventType: 'NFA', EventId: idFromURL, VendorId: 0 });
        const res = await apiClient.getres(`/api/eventattachment/Find?${params}`, atoken);
        const resData = res?.data?.result || [];
        if (resData.length > 0) {
          const mapped = attachmentmodalforevent(resData, idFromURL, 'NFA');
          setPanelSavedAttach(mapped);
          handleattachmentforevent(mapped);
        } else {
          setPanelSavedAttach([]);
          handleattachmentforevent([]);
        }
      } else {
        const payload = buildQueryParams({ CustomerId: customerid, eventtype: 'NFA', isactive: 'true' });
        const res = await apiClient.getres(`/api/Doclib/Find?${payload}`, atoken);
        const resData = res?.data?.result || [];
        if (resData.length > 0) {
          const mapped = eventattachmentmodal(resData, 0, 'NFA');
          setPanelSavedAttach(mapped);
          handleattachmentforevent(mapped);
        } else {
          setPanelSavedAttach([]);
          handleattachmentforevent([]);
        }
      }
    } catch (_) { }
    setPanelAttachLoading(false);
  };

  const addPanelAttachment = async () => {
    const descToUse = panelAttachDesc.trim();
    if (!descToUse) { setPanelAttachError('Please enter a description for the attachment.'); return; }
    if (!panelAttachFile?.file) { setPanelAttachError('Please choose a file to upload.'); return; }
    setPanelAttachError('');
    setPanelAttachAdding(true);
    try {
      const filedata = filequeryparam({ EventType: 'NFA', EventId: idFromURL, Description: 'General', CustomerId: customerid });
      const path = await uploadFilesOnAzure(filedata, panelAttachFile.file, atoken);
      if (!path) return;
      const payload = getPayloadWithFilePath('fileNamePath', path, {
        eventId: idFromURL, eventType: 'NFA',
        attachmentDescription: descToUse,
        attachment: panelAttachFile.file.name,
        docRefId: 0, createdById: userDetail?.id, createdByName: userDetail?.name,
      });
      const res = await apiClient.postres(`/api/eventattachment/${idFromURL}/AddMultiple`, { attachments: [payload] }, atoken);
      if (res) {
        setPanelAttachDesc('');
        setPanelAttachFile(null);
        if (panelFileInputRef.current) panelFileInputRef.current.value = '';
        fetchPanelAttachments();
      }
    } catch (_) {
      setPanelAttachError('Upload failed. Please try again.');
    } finally {
      setPanelAttachAdding(false);
    }
  };

  const deletePanelAttachment = async (index, id) => {
    try {
      const res = await apiClient.postres(`/api/eventattachment/${id}/Delete`, null, atoken);
      if (res) {
        const updated = panelSavedAttach.filter((_, i) => i !== index);
        setPanelSavedAttach(updated);
        handleattachmentforevent(updated);
      }
    } catch (_) { }
  };

  const updatePanelAttachments = async () => {
    if (!panelSavedAttach.length) return;
    setPanelIsUpdating(true);
    try {
      await apiClient.postres(`/api/eventattachment/${idFromURL}/UpdateMultiple`, { attachments: panelSavedAttach }, atoken);
      setPanelHasCheckboxChanged(false);
    } catch (_) { }
    setPanelIsUpdating(false);
  };

  const handleApprover = useCallback((booleanvalue) => {
    setApproverShow(booleanvalue);
    if (booleanvalue && workflowPanelTab === 'history') fetchPanelHistory();
    if (booleanvalue && workflowPanelTab === 'attachments') fetchPanelAttachments();
  }, [workflowPanelTab]);

  useEffect(() => {
    if (!approvershow || !idFromURL) return;
    if (workflowPanelTab === 'history') fetchPanelHistory();
    if (workflowPanelTab === 'attachments') fetchPanelAttachments();
  }, [workflowPanelTab, approvershow, idFromURL]);

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
    const res = await apiClient.postres(`api/NFAManage/CreatePOFromNFA?eventId=${idFromURL}`, null, atoken);
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
      <div className="mainContainer d-flex rfq-modern-shell">
        <div className={`leftContent ${approvershow ? "col-9" : "col-12"} d-flex flex-column`}>
          <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0 }}>
            {/* Page head: breadcrumb + actions + stage flow */}
            <div className="rfq-dv2-page-head border-bottom mb-3" style={{ flexShrink: 0 }}>
              <div className="rfq-dv2-head-top">
                {breadcrumb}
                <div className="rfq-dv2-actions">
                  {!loading ? (
                    actionType && activityId ? null : (
                      <>
                        <button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--ghost" onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
                          Cancel
                        </button>
                        {idFromURL && currentStage === 'Draft' && (
                          <button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('Save as Templates')}>
                            Save as Templates
                          </button>
                        )}
                        {idFromURL && currentStage !== 'Draft' && currentStage !== 'Approved' && (
                          <button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleRecall()}>
                            Recall NFA
                          </button>
                        )}
                        {idFromURL && currentStage === 'Approved' && (
                          <button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleCreatePO()}>
                            Create PO
                          </button>
                        )}
                        {value === 3 && currentStage === 'Draft' ? (
                          <button type="button" className="pe-btn pe-btn--primary" onClick={handleButtonGroup} disabled={!stagearray.includes(currentStage)}>
                            Submit
                          </button>
                        ) : currentStage === 'Draft' ? (
                          <button type="button" className="pe-btn pe-btn--primary" onClick={handleButtonGroup} disabled={!stagearray.includes(currentStage)}>
                            Save &amp; Continue
                          </button>
                        ) : null}
                      </>
                    )
                  ) : (
                    <button type="button" className="pe-btn pe-btn--primary" disabled>
                      {value === 3 ? 'Submitting...' : 'Saving...'}
                    </button>
                  )}
                </div>
              </div>
              <div className="rfq-dv2-stage-flow-wrap">
                <MemoizedEventStageFlow stagelist={stagelist} currentStage={currentStage} />
              </div>

              {/* â”€â”€ Row 2: meta info â”€â”€ */}
              <div className="rfq-dv2-head-bottom">
                <div className="rfq-dv2-meta-row">
                  <span className="rfq-dv2-meta-item">
                    <span className="rfq-dv2-meta-label">Status</span>
                    <button
                      type="button"
                      className={`rfq-dv2-status-pill ${currentStage?.toLowerCase() === "draft" ? "is-draft" : ""}`}
                      onClick={handleStatusMenuOpen}
                    >
                      <span className="rfq-dv2-status-dot" />
                      {currentStage || "Draft"}
                    </button>
                  </span>
                  {formik?.values?.endDate && (
                    <span className="rfq-dv2-meta-item">
                      <span className="rfq-dv2-meta-label">End Date/Time:</span>{" "}
                      <span className="rfq-dv2-meta-value">{formik?.values?.endDate}</span>
                    </span>
                  )}
                  {formik?.values?.requisitioner && (
                    <span className="rfq-dv2-meta-item">
                      <span className="rfq-dv2-meta-label">Requisitioner:</span>{" "}
                      <span className="rfq-dv2-meta-value">{formik?.values?.requisitioner}</span>
                    </span>
                  )}
                </div>
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={handleStatusMenuClose}
                  classes={{ paper: "rfq-dv2-status-menu-paper" }}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  PaperProps={{ style: { width: 280, minWidth: 280, maxWidth: 280, overflow: "hidden" } }}
                >
                  <div className="rfq-dv2-status-menu">
                    <div className="rfq-dv2-status-menu-title">NFA Status</div>
                    <div className="rfq-dv2-status-menu-list">
                      {(stagelist || [{ stageName: currentStage }]).map((stage, index) => {
                        const stageNames = (stagelist || []).map(s => s.stageName);
                        const currentIdx = stageNames.indexOf(currentStage);
                        const stepClass = index < currentIdx ? "" : index === currentIdx ? "is-current" : "is-future";
                        return (
                          <div key={stage.stageName || index} className={`rfq-dv2-status-step ${stepClass}`}>
                            <span className="rfq-dv2-status-step-icon" />
                            <span>{stage.stageName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Menu>
              </div>
            </div>

            {/* Tab Navigation and Icons Header */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3" style={{ flexShrink: 0 }}>
              <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
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
                  {idFromURL && currentStage.trim() === "Draft" && (
                    <Tab value={4} label={<span className="section-heading" style={{ color: '#1a2742' }}>Preview</span>} disabled={!idFromURL} />
                  )}
                  {idFromURL && currentStage.trim() !== "Draft" && (
                    <Tab value={5} label={<span className="section-heading" style={{ color: '#1a2742' }}>NFA Report</span>} disabled={!idFromURL} />
                  )}
                  {idFromURL && nfaEventIdSelected && (nfaEventType === "RFQ" || nfaEventType === "Auction") && (
                    <Tab value={6} label={<span className="section-heading" style={{ color: '#1a2742' }}>{nfaEventType} Report</span>} disabled={!idFromURL} />
                  )}
                  {idFromURL && currentStage.trim() !== "Draft" && (
                    <Tab value={7} label={<span className="section-heading" style={{ color: '#1a2742' }}>Recent Queries</span>} disabled={!idFromURL} />
                  )}
                </Tabs>
              </Box>
              <div className="d-flex align-items-center gap-2 rfq-dv2-tab-actions">
                {idFromURL && (
                  <AttachmentWorkFlow
                    eventtype={`NFA`}
                    eventid={idFromURL}
                    action={stagearray.includes(currentStage)}
                    handleattachmentforevent={handleattachmentforevent}
                    permissionManager={permissionManager}
                  />)}
                {idFromURL && <HistoryCell eventtype={`NFA`} eventId={pageSlug} permissionManager={permissionManager} />}
                {idFromURL && (
                  <Tooltip title="Show/Hide Approvers">
                    <IconButton onClick={() => handleApprover(!approvershow)} size="small" edge="start" className="pointer">
                      <div className="approverCircle shadow-sm">
                        <PeopleAltIcon />
                      </div>
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow-1 p-1 hidden-scrollbar">
              {value === 1 && (() => {
                const canReadG = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? true;
                const canEditG = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? true;
                const canCreateG = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? true;
                if (!canReadG) return (
                  <div className="p-4">
                    <Alert severity="error">
                      <div className="d-flex align-items-center">
                        <HiOutlineX className="me-2 f18" />
                        Access Denied: You don't have permission to view General settings.
                      </div>
                    </Alert>
                  </div>
                );
                if (currentStage.trim() !== 'Draft') return (
                  <NFAGeneralPreview formik={formik} purchaseAllList={purchaseAllList} purchaseGroupAllList={purchaseGroupAllList} customClassName="none" />
                );
                return (
                  <NFAGeneralForm
                    formik={formik}
                    canEdit={canEditG}
                    canCreate={canCreateG}
                    eventTypes={eventTypes}
                    eventDetailsList={eventDetailsList}
                    purchaseAllList={purchaseAllList}
                    purchaseGroupAllList={purchaseGroupAllList}
                    nfaSpendList={nfaSpendList}
                    nfaCategoryList={nfaCategoryList}
                    nfaProject={nfaProject}
                    exception={exception}
                    handleModalToggle={handleModalToggle}
                    handleOpenSpendModal={handleOpenSpendModal}
                    handleOpenProjectModal={handleOpenProjectModal}
                    handleOpenExceptionModal={handleOpenExceptionModal}
                    setEventDetailsList={setEventDetailsList}
                    setTempnfaEventId={setTempnfaEventId}
                    setPurchaseGroupAllList={setPurchaseGroupAllList}
                  />
                );
              })()}
              {idFromURL && value === 2 && (() => {
                const canReadA = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? true;
                if (!canReadA) return (
                  <div className="p-4"><Alert severity="error"><div className="d-flex align-items-center"><HiOutlineX className="me-2 f18" />Access Denied: You don't have permission to view Event Details.</div></Alert></div>
                );
                return (
                  <div style={{ padding: '16px' }}>
                    <NFASOBEventBoxRFQ
                      props={{
                        eventId: idFromURL, eventtype: "NFA", nfaEventId: nfaEventIdSelected, nfaEventType: nfaEventType,
                        Version: formik?.values?.Version, nfaEventVersion: nfaEventVersion, currentStage: currentStage,
                        permissionManager: permissionManager, nfaAmount: formik?.values?.nfaAmount, nfaBudget: formik?.values?.nfaBudget,
                        nfaCurrency: formik?.values?.nfaCurrency, budgetStatus: budgetStatus, saving: saving,
                        canRead: canReadA, canEdit: permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? true,
                        canCreate: permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? true,
                        canRemove: permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? true,
                        updateAmount: updateAmount, updateBudget: updateBudget,
                      }}
                      ref={NFASOBRFQRef}
                    />
                  </div>
                );
              })()}
              {idFromURL && value === 3 ? (() => {
                const canReadQ = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? true;
                if (!canReadQ) return (
                  <div className="p-4"><Alert severity="error"><div className="d-flex align-items-center"><HiOutlineX className="me-2 f18" />Access Denied: You don't have permission to view Questions.</div></Alert></div>
                );
                return (
                  <div className="mb-5">
                    <NFAQuestionScreen
                      props={{
                        eventid: idFromURL, eventtype: "NFA", librarytype: "QuestionLibrary",
                        action: stagearray.includes(currentStage) && (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? true),
                        currentStage: currentStage, Version: formik?.values?.Version,
                        editquestion: isquestioneditDisabled || !(permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? true),
                        permissionManager: permissionManager,
                        canRead: canReadQ,
                        canEdit: permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? true,
                        canCreate: permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.CREATE) ?? true,
                        canRemove: permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? true,
                      }}
                      ref={NFAQuestionScreenRef}
                    />
                  </div>
                );
              })() : null}
              {idFromURL && value === 4 && (() => {
                const canReadP = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? true;
                const canEditP = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? true;
                const canReadQ = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? true;
                const canEditQ = permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? true;
                if (!canReadP) return (
                  <div className="p-4"><Alert severity="error"><div className="d-flex align-items-center"><HiOutlineX className="me-2 f18" />Access Denied: You don't have permission to view Preview.</div></Alert></div>
                );
                return (
                  <div className="rfq-preview-scroll-area">
                    {accessLevel?.find(x => x.claimType === "General")?.claimValue?.Read !== "N" && (
                      <div className="rfq-preview-section-card mb-3">
                        <div className="rfq-preview-card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3" id="generaldetails">
                            <div className="rfq-preview-section-title">
                              <ArticleOutlinedIcon className="rfq-preview-section-icon" />NFA General Details
                            </div>
                            {stagearray.includes(currentStage) && canEditP && (
                              <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => setValue(1)}>
                                <HiPencilAlt />
                              </button>
                            )}
                          </div>
                          <NFAGeneralPreview formik={formik} purchaseAllList={purchaseAllList} purchaseGroupAllList={purchaseGroupAllList} customClassName="none" />
                        </div>
                      </div>
                    )}
                    {accessLevel?.find(x => x.claimType === "Questions")?.claimValue?.Read !== "N" && canReadQ && (
                      <div className="rfq-preview-section-card mb-3">
                        <div className="rfq-preview-card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3" id="nfaquestions">
                            <div className="rfq-preview-section-title">
                              <HelpOutlineOutlinedIcon className="rfq-preview-section-icon" />NFA Questions
                            </div>
                            {stagearray.includes(currentStage) && canEditQ && (
                              <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => setValue(3)}>
                                <HiPencilAlt />
                              </button>
                            )}
                          </div>
                          <NFAQuestionScreen
                            props={{ eventid: idFromURL, eventtype: "NFA", librarytype: "QuestionLibrary", action: false, Version: formik?.values?.Version, editquestion: isquestioneditDisabled, permissionManager: permissionManager }}
                            ref={NFAQuestionScreenRef}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              {idFromURL && value === 5 && (
                <NFAReport props={{ eventId: idFromURL }} />
              )}
              {idFromURL && value === 6 && (
                <>
                  {nfaEventType === "RFQ" && <ERFQComparative key="ERFQComparative" actions={{ rfqid: nfaEventIdSelected, nfaEventVersion: nfaEventVersion, permissionManager: permissionManager, isNFA: true }} />}
                  {nfaEventType === "Auction" && <AuctionControl key="AuctionControl" isDifferentPage={false} auctionId={nfaEventIdSelected} />}
                </>
              )}
              {idFromURL && value === 7 && (() => {
                const canReadRQ = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ) ?? true;
                if (!canReadRQ) return (
                  <div className="p-4"><Alert severity="error"><div className="d-flex align-items-center"><HiOutlineX className="me-2 f18" />Access Denied: You don't have permission to view Recent Queries.</div></Alert></div>
                );
                return (
                  <QueryList pageSlug={pageSlug} key="QueryList" accessLevel={accessLevel} fromEventPage={true} EventId={pageSlug} EventType="NFA"
                    permissionManager={permissionManager}
                    canRead={canReadRQ}
                    canEdit={permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.EDIT) ?? true}
                    canCreate={permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? true}
                    canRemove={permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.REMOVE) ?? true}
                  />
                );
              })()}

            </div>
          </div>
        </div>
        {/* Right side - Workflow Panel */}
        <NFAWorkflowPanel
          approvershow={approvershow}
          workflowPanelTab={workflowPanelTab}
          setWorkflowPanelTab={setWorkflowPanelTab}
          actionType={actionType}
          currentStage={currentStage}
          normalizedCurrentStage={currentStage}
          stagearray={stagearray}
          formik_ApproveReject={formik_NFAApproveReject}
          toggleDrawer={toggleDrawer}
          requestCell={requestCell}
          handleEventAppList={handleEventAppList}
          wfupdate={wfupdate}
          stagelist={stagelist}
          accessLevel={accessLevel}
          permissionManager={permissionManager}
          effectivePermissionManager={permissionManager}
          tempDataEditData={tempDataEditData}
          formik={formik}
          userDetail={userDetail}
          atoken={atoken}
          historyLoading={historyLoading}
          historyGraph={historyGraph}
          panelAttachLoading={panelAttachLoading}
          panelAttachDesc={panelAttachDesc}
          setPanelAttachDesc={setPanelAttachDesc}
          panelAttachError={panelAttachError}
          setPanelAttachError={setPanelAttachError}
          panelAttachFile={panelAttachFile}
          setPanelAttachFile={setPanelAttachFile}
          panelSavedAttach={panelSavedAttach}
          setPanelSavedAttach={setPanelSavedAttach}
          panelHasCheckboxChanged={panelHasCheckboxChanged}
          setPanelHasCheckboxChanged={setPanelHasCheckboxChanged}
          panelIsUpdating={panelIsUpdating}
          panelAttachAdding={panelAttachAdding}
          panelFileInputRef={panelFileInputRef}
          addPanelAttachment={addPanelAttachment}
          deletePanelAttachment={deletePanelAttachment}
          updatePanelAttachments={updatePanelAttachments}
          handleattachmentforevent={handleattachmentforevent}
        />
      </div>

      {/* Purchase Org Modal */}
      <PEModal
        open={modals.purchaseOrg}
        onClose={closePurchaseOrgModal}
        size="lg"
        title="Add Purchase Organization"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
      >
        <PurchaseOrg isModal selectedPurOrg={PullPurchaseOrgAll} />
      </PEModal>

      {/* Purchase Group Modal */}
      <PEModal
        open={modals.purchaseOrgGrp}
        onClose={closePurchaseOrgGrpModal}
        size="lg"
        title="Add Purchase Group"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
      >
        <PurchaseOrgGrp isModal />
      </PEModal>

      <PEModal
        isModal
        open={modals.exception}
        onClose={closeExceptionModal}
        size="lg"
        title="Manage Exception"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
      >
        <AddUpdateexception isModal handleExceptionList={handleExceptionList} />
      </PEModal>

      <PEModal
        isModal
        open={modals.project}
        onClose={closeProjectModal}
        size="lg"
        title="Manage Project"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
      >
        <AddUpdateProject isModal handleProjectList={handleProjectList} />
      </PEModal>

      <PEModal
        isModal
        open={modals.spend}
        onClose={closeSpendModal}
        size="lg"
        title="Manage Spend"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
      >
        <AddUpdateSpend isModal handleSpendList={handleSpendList} />
      </PEModal>

      {/* Question Drawer */}
      <CommonBottomDrawer
        open={state["qusDrawer"]}
        onClose={toggleDrawer("qusDrawer", false)}
        title="Add Question"
        actions={
          <>
            <button
              type="button"
              className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
              onClick={toggleDrawer("qusDrawer", false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-question-form"
              className="rfq-v2-event-btn rfq-v2-event-btn-primary"
            >
              Add
            </button>
          </>
        }
        sectionStyle={{ display: "flex", flexDirection: "column" }}
        bodyStyle={{ padding: "16px", overflowY: "auto", flex: 1 }}
      >
        <AddNFAQuestionFormCell
          idFromURL={idFromURL}
          callbackQuesAddCustom={callbackQuesAddCustom}
          libraryId={libraryId}
          questionforedit={questionforedit}
        />
      </CommonBottomDrawer>

      {/* Approval Confirmation Modal */}
      <ApprovalConfirmDialog
        open={state["openInvoiceApproved"]}
        onClose={toggleDrawer("openInvoiceApproved", false, [])}
        onSubmit={formik_NFAApproveReject.handleSubmit}
        status={actionType === 'Forward' ? 'Forward' : formik_NFAApproveReject.values.IsApproved ? 'Approved' : 'Rejected'}
        stageName={currentStage}
        comment={formik_NFAApproveReject.values.remarks}
        onCommentChange={(val) => formik_NFAApproveReject.setFieldValue("remarks", val)}
        entityLabel="NFA"
      />

      {/* Currency Modal */}
      <PEModal
        open={OpenCurrencyModal}
        onClose={CloseCurrencyModal}
        size="lg"
        title="Manage Currency"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
      >
        <div className="p-3">
          <AddEditCurrency handleCurrencyList={handleCurrencyList} />
        </div>
      </PEModal>
      <PEModal
        open={open}
        onClose={handleClose}
        size="sm"
        title="Save As"
        bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
        bodyClassName="d-flex flex-column"
        footer={
          <>
            <button className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
            <button className="pe-btn pe-btn--primary" onClick={handleSaveTemplate} disabled={!idFromURL}>Save</button>
          </>
        }
      >
        <TextFieldCell
          id="password"
          name="password"
          label="NFA Template Title"
          placeholder=""
          value={TemplateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
          maxLength={100}
        />
      </PEModal>
    </>
  );
};

export default NoteForApproval;
