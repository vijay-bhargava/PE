import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import IconButton from '@mui/material/IconButton';
import { HiOutlineX, HiPlusSm, HiDownload } from "react-icons/hi";
import {
  InputAdornment, Menu, MenuItem,
  TextField, Tooltip, Typography
} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextFieldCell from '../../BaseCells/TextFieldCell';
import HistoryCell from '../../BaseCells/HistoryCell';
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { actionTypes, useStateValue } from '../../../store';
import { extractTextFromHTML, formatDateViaLocale } from '../../../utils/common/utility';
import { OrgGroupMasterList, getPurchaseOrgList } from '../../../utils/commerciallibrary';
import {
  PRFinalSubmit, PRItemServiceDelete, PRManageAdd,
  PRManageUpdate, buildQueryParams, getPRItemServiceFind,
  getPRManageFind, PRAttachementAdd, uploadFilesOnAzurePR
} from '../../../utils/purchaseRequest';
import { toast } from 'react-toastify';
import {
  findObjByValueFromArray, findObjListByValueFromArray,
  handlesaveAttachment, downloadExcelTemplate, getApiErrorMessage,
  validateFileSize, downloadFilesOnAzure, getFileName,
  attachmentmodalforevent, filequeryparam
} from '../../../utils/common';
import { MemoizedEventStageFlow } from '../../../utils/common/component';
import AttachmentWorkFlow from '../../BaseCells/attachmentworkflow';
import EventApprovalBox from '../../BaseCells/eventapprovalbox';
import ListSkeleton from '../../../components/Skeleton/listSkeleton';
import PEModal from '../../../components/PEModal';
import CommonBottomDrawer from '../../../components/CommonBottomDrawer';
import PRGeneralTab from './PRGeneralTab';
import PRPreviewTab from './PRPreviewTab';
import PRItemsTab from './PRItemsTab';
import PurchaseOrgGrp from '../../../utils/common/PurchaseOrgGrp';
import PurchaseOrg from '../../../utils/common/PurchaseOrg';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import { api, ApiClient } from '../../../Apiclient';
import { FastApiClient } from '../../../FastApiClient';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QueryList from '../../CommunucationHub/QueryList';
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import AddItemProductsCell from './AddItemProductsCell';

const PurchaseRequest = ({ claimType, breadcrumb }) => {
  const apiClient = new ApiClient(api);
  const [{ atoken, customerid, userDetail, roleClaims }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [currentStage, setCurrentStage] = useState(`Draft`);
  const [accessLevel, setAccessLevel] = useState("");
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    const obj = findObjListByValueFromArray(roleClaims, claimType, `claimType`, `PR`);
    obj ? setAccessLevel(obj) : setAccessLevel("");
  }, []);

  useEffect(() => {
    const data = queryParams.get("CommId")?.trim();
    if (data) {
      dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
    }
  }, []);

  useEffect(() => {
    if (atoken, customerid) {
    }
  }, [atoken, customerid]);
  const [attachmentCount, setAttachmentCount] = useState(0);

  const handleAttachmentCount = (count) => {
    setAttachmentCount(count);
  };

  const attachmentdrawerref = useRef();

  // Right workflow panel tabs
  const [workflowPanelTab, setWorkflowPanelTab] = useState('workflow');
  // History tab state
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyGraph, setHistoryGraph] = useState([]);
  const [historyAudit, setHistoryAudit] = useState([]);
  // Panel attachment state
  const [panelAttachLoading, setPanelAttachLoading] = useState(false);
  const [panelSavedAttach, setPanelSavedAttach] = useState([]);
  const [panelAttachDesc, setPanelAttachDesc] = useState('');
  const [panelAttachFile, setPanelAttachFile] = useState(null);
  const [panelAttachError, setPanelAttachError] = useState('');
  const [panelHasCheckboxChanged, setPanelHasCheckboxChanged] = useState(false);
  const [panelAttachAdding, setPanelAttachAdding] = useState(false);
  const panelFileInputRef = useRef();

  const [searchParams, setSearchParams] = useSearchParams()
  const [prItemsList, setprItemsList] = useState([]);
  const [idFromURL, setIdFromURL] = useState(null)
  const [prSubject, setPrSubject] = useState("");
  const [prDescription, setPrDescription] = useState("");
  const [prNumber, setPrNumber] = useState(null);
  const [OrgId, setOrgId] = useState(0);
  const [OrgGroupId, setOrgGroupId] = useState(0);
  const [requisitionerList, setRequisitionerList] = useState([]);
  const [loadRequisitioner, setLoadRequisitioner] = useState(false);
  const [requisitionerListLoaded, setRequisitionerListLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const [stagelist, setStageList] = useState(null);
  const [stagearray, setStagearray] = useState([`Draft`]);
  // Permission Management State
  const [permissionManager, setPermissionManager] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [value, setValue] = React.useState(1);

  useEffect(() => {
    getUserRoleRights();
  }, []);

  // Set default accessible tab after permissions are loaded
  useEffect(() => {
    if (!loadingPermissions && permissionManager) {
      const hasGeneralAccess = permissionManager.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ);
      const hasItemServiceAccess = permissionManager.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ);

      // If current tab is General (1) but no access, switch to accessible tab
      if (value === 1 && !hasGeneralAccess && hasItemServiceAccess && idFromURL) {
        setValue(2);
      }
      // If current tab is Items/Services (2) but no access, switch to General if accessible
      else if (value === 2 && !hasItemServiceAccess && hasGeneralAccess) {
        setValue(1);
      }
    }
  }, [loadingPermissions, permissionManager, value, idFromURL]);

  const getUserRoleRights = async () => {
    try {
      const obj = {
        FeatureName: "Purchase Requisition",
        UserId: userDetail?.id,
        CreatedById: userDetail?.id
      }
      const queryParams = buildQueryParams(obj);

      const res = await apiClient.getres(
        `/api/rolemanagement/GetUserRoleRights?${queryParams}`,
        atoken
      );

      if (res) {
        const permManager = new PermissionManager(res?.data);
        setPermissionManager(permManager);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'getUserRoleRights_error' });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const PullUserDesignation = async () => {
    if (requisitionerListLoaded || loadRequisitioner) {
      return; // Don't fetch if already loaded or currently loading
    }
    setLoadRequisitioner(true);
    try {
      const url = `/api/User/Find?CustomerId=${customerid}`;
      const res = await apiClient.getres(url, atoken);
      const userDesignations = res?.data?.result ?? [];  // Use the data as it is, no filtering
      // Add "None" option to the list
      setRequisitionerList(['None', ...userDesignations]);
      setRequisitionerListLoaded(true);
    } catch (error) {
      console.error('Error fetching user designations:', error);
      toast.error(getApiErrorMessage(error));
    }
    finally {
      setLoadRequisitioner(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === "3") {
      setSelectedMenuItem("Submit")
      if (newValue === "3" && stagelist?.some(item => item.currentStage === "Under Approval")) {
        setApproverShow(true)
      }
    }
    else {
      setSelectedMenuItem("Save & Continue")
      setApproverShow(false)
    }
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
      case 'item':
        return setValue(2);
      default:
        return '';
    }
  };

  const [state, setState] = useState({
    addProductDrawer: false,
    qusDrawer: false,
    surrogateDrawer: false,
    openInvoiceApproved: false
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
    setItemEditTempData([])
  };

  const [requestCell, setRequestCell] = useState({
    EventId: 0,
    EventType: "PR",
    CustomerId: customerid
  });

  const updateRequestCell = (newEventId) => {
    setRequestCell((prevState) => ({
      ...prevState,
      EventId: newEventId,
    }));
  };

  const validationSchema = yup.object().shape({
    prSubject: yup
      .string('Enter PR Subject')
      .max(100, 'Max 100 character')
      .required('PR Subject is required'),
    prDescription: yup
      .string('Enter PR Description')
      .required('PR Description is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: 0,
      prSubject: prSubject,
      prDescription: prDescription,
      requisitioner: userDetail.name ? userDetail.name : "",
      prNumber: prNumber,
      purchOrgId: "",
      purchGrpId: "",
      isBoq: false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const prDescription = extractTextFromHTML(values.prDescription);
      if (prDescription?.trim().length < 1) {
        formik.setFieldError('prDescription', 'Description is mandatory');
        return;
      }
      var data = {
        id: values?.id,
        customerId: customerid,
        prSubject: values.prSubject,
        prDescription: values.prDescription,
        requisitioner: values.requisitioner,
        prNumber: values.prNumber,
        purchOrgId: values.purchOrgId?.id !== "" ? values.purchOrgId?.id : 0,
        purchGrpId: values.purchGrpId?.id !== "" ? values.purchGrpId?.id : 0,
        boqReq: values.isBoq,  // Send API parameter name 'boqReq' instead of 'isBoq'
        stage: currentStage
      };
      setLoading(true)
      if (data?.id > 0) {
        try {
          PRManageUpdate(data, currentStage, stagelist, atoken).then((res) => {
            if (res.StatusCode === 500 && res.Message === 'Duplicate Record Found!') {
              toast.error(`PR number ${data?.prNumber} already exists. Please use a unique PR Number.`, {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000,
              });
              setLoading(false)
            } else {
              if (res && res > 0) {
                toast.success("PR details updated successfully.", {
                  position: toast.POSITION.TOP_CENTER,
                  autoClose: 1000,
                });
                setLoading(false)
                setValue(2)
              }
            }
          });
        } catch (error) {
          console.error("API Error:", error.response ? error.response.data : error.message);
          toast.error(getApiErrorMessage(error));
          setLoading(false)
        }
      }
      else {
        PRManageAdd(data, currentStage, stagelist, atoken).then((res) => {

          if (res.StatusCode === 500 && res.Message === 'Duplicate Record Found!') {
            toast.error(`PR number ${data?.prNumber} already exists. Please use a unique PR Number.`, {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000,
            });
            setLoading(false)
          }
          else {
            if (res) {
              setIdFromURL(res);
              navigate(`/configuration/manage-pr/${res}?tab=item`)
                ;
              updateRequestCell(res);
              const AttachFiles = attachmentforevent?.map((x) => {
                x.eventId = res;
                x.createdById = userDetail?.id;
                x.createdByName = userDetail?.name;
                return x;
              });
              handlesaveAttachment(AttachFiles, res, atoken);
              toast.success(`PR details added successfully.`, {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1000,
              });
              setValue(2);
              setLoading(false)
            }
            else {
              setLoading(false)
              toast.error('Error while saving data', {
                toastId: "prmanage_error"
              });
            }
          }
        });
      }
    }
  });

  const [tempDataEditData, setTempDataEditData] = useState(null);
  const [listOfAttachment, setlistOfAttachment] = useState([]);

  const pullgetPRManageFind = (Id) => {
    var data = {
      Id: Id,
    };

    getPRManageFind(data, atoken).then((res) => {
      const result = res?.result;
      if (result && result?.length > 0) {
        setTempDataEditData(result)
        setlistOfAttachment(result?.[0]?.prAttachment)
        setCurrentStage(result?.[0]?.stage);
        if (result?.[0]?.id && result?.[0]?.id > 0) {
          formik.setFieldValue("id", result?.[0]?.id);
        }
        if (result?.[0]?.prSubject) {
          formik.setFieldValue("prSubject", result?.[0]?.prSubject);
        }
        if (result?.[0]?.prDescription) {
          formik.setFieldValue("prDescription", result?.[0]?.prDescription);
        }
        if (result?.[0]?.requisitioner) {
          formik.setFieldValue("requisitioner", result?.[0]?.requisitioner);
        }
        if (result?.[0]?.prNumber) {
          formik.setFieldValue("prNumber", result?.[0]?.prNumber);
        }

        // Set isBoq from API response boqReq field
        if (result?.[0]?.boqReq !== null && result?.[0]?.boqReq !== undefined) {
          formik.setFieldValue("isBoq", result?.[0]?.boqReq);
        }

        if (result?.[0]?.purchOrgId && result?.[0]?.purchOrgId > 0) {
          setOrgId(result?.[0]?.purchOrgId)
        }
        if (result?.[0]?.purchGrpId && result?.[0]?.purchGrpId > 0) {
          setOrgGroupId(result?.[0]?.purchGrpId)
        }

        if (result?.[0]?.activityId && result?.[0]?.activityId > 0) {
          setActvityId(result?.[0]?.activityId)
        }
        //permission here
        if (result?.[0]?.userAccess.length > 0) {
          const userAccess = result?.[0]?.userAccess.map(x => {
            return ({ ...x, claimValue: JSON.parse(x.claimValue) })
          })
          setAccessLevel(userAccess)
          // Initialize Permission Manager with user access data
          const permManager = new PermissionManager(result?.[0]?.userAccess);
          setPermissionManager(permManager);
        }
      }
    });
  };

  const [activityId, setActvityId] = useState(0);
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const actionType = params.get("ActionType");
    const ActivityId = params.get("ActivityId");
    setActionType(actionType);
    setActvityId(ActivityId ?? 0);
    const newIdFromURL = pageSlug;
    dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
    dispatch({ type: actionTypes.SET_EVENTTYPE, value: "PR" });
    setIdFromURL(newIdFromURL);
    updateRequestCell(newIdFromURL);
  }, [searchParams]);

  useEffect(() => {
    setApproverShow(true);
  }, [value, idFromURL, currentStage, stagelist, breadcrumb]);

  useEffect(() => {
    const urlparams = {
      EventType: "PR",
      CustomerId: customerid,
      EventId: idFromURL || 0,
      OrgId: idFromURL ? (formik.values.purchOrgId?.id || 0) : 0,
      OrgGroupId: idFromURL ? (formik.values.purchGrpId?.id || 0) : 0,
    };

    if (idFromURL) {
      getEventStages(urlparams);
    }
  }, [idFromURL]);

  useEffect(() => {
    if (stagelist && stagelist.length > 0) {
      return;
    }
    const urlparams = {
      EventType: "PR",
      CustomerId: customerid,
      EventId: 0,
      OrgId: 0,
      OrgGroupId: 0,
    }
    getEventStages(urlparams);
  }, [])

  const getEventStages = async (urlparams) => {
    const queryParams = buildQueryParams(urlparams)
    const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
    if (res?.data?.result.length > 0) {
      const result = res?.data?.result?.filter((item) => item.stageSeq > 0)
      setStageList(result);
    }
  }

  const pullPRtemServiceFind = (prid) => {

    var data = {
      PRId: prid,
    };
    if (prid) getPRItemServiceFind(data, atoken).then((res) => {
      if (res) {
        setprItemsList(res)
      }
    });
  };

  const handleRequisitionerChange = (value) => {
    if (value === null) {
      formik.setFieldValue('requisitioner', '');
      formik.setFieldValue('purchOrgId', null);
      formik.setFieldValue('purchGrpId', null);
      return;
    }

    const selectedRequisitioner = requisitionerList?.find(item => item.name === value);
    if (selectedRequisitioner) {
      formik.setFieldValue('requisitioner', selectedRequisitioner.name);

      const foundOrg = purchaseAllList?.find(org => org.id === selectedRequisitioner.orgId);
      formik.setFieldValue('purchOrgId', foundOrg ?? null);

      const userOrgGroup = selectedRequisitioner.userOrgGroup;
      if (userOrgGroup?.length > 0) {
        const foundGroup = purchaseGroupAllList?.find(grp => grp.id === userOrgGroup[0].orgGroupId);
        formik.setFieldValue('purchGrpId', foundGroup ?? null);
      } else {
        formik.setFieldValue('purchGrpId', null);
      }
    }
  };

  const handleClearAllItems = (value) => {
    if (value) {
      //handleClearAll()
      handleClearAllPrList()
    } else {
      setConfirmClearAllItems(false);
    }
  };

  const handleClearAllPrList = async () => {

    if (prItemsList.length > 0) {
      const res = await apiClient.postres(
        `/api/PRItemService/${idFromURL}/DeleteAll`,
        null,
        atoken
      );
      if (res) {
        toast.success(`Items Deleted Successfully`);
        setprItemsList([]);
        setConfirmClearAllItems(false);
      }
    }
    else {
      toast.info(`No Pr Line Items Exist.`);
    }
  };

  const [itemEditTempData, setItemEditTempData] = useState([])

  const handleEditItem = useCallback((dataItem) => {
    setItemEditTempData(dataItem)
    setState({ ...state, 'addProductDrawer': true });
  }, []);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClearAllItems, setConfirmClearAllItems] = useState(false)
  const [removeItem, setRemoveItem] = useState(null);

  const handleCloseDelete = () => {
    setRemoveItem(null)
    setConfirmDelete(false);
  };
  const handleDeleteItem = useCallback((id) => {

    setRemoveItem(id)
    setConfirmDelete(true)
  }, []);

  const callbackItemAdd = useCallback((pass) => {
    setState({ ...state, 'addProductDrawer': false });
    setItemEditTempData([])
    pullPRtemServiceFind(idFromURL);
  }, [idFromURL]);

  const removeItemData = (value) => {
    var data = {
      id: Number(value),
    };
    PRItemServiceDelete(data, atoken).then((res) => {
      if (res) {
        pullPRtemServiceFind(idFromURL);
        setRemoveItem(null);
        setConfirmDelete(false);
      }
    });
  }

  const { pageSlug } = useParams();

  useEffect(() => {
    if (idFromURL && idFromURL > 0) {
      pullgetPRManageFind(idFromURL);
      pullPRtemServiceFind(idFromURL);
    }
  }, [idFromURL]);

  const handleSaveContinue = () => {
    if (value === 1) {
      if (formik?.values?.purchOrgId?.id > 0 && !formik?.values?.purchGrpId?.id) {
        toast.error("Please fill Purchase Group.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1000,
        });
        return;
      }
      formik.handleSubmit()
    }

    if (value === 2) {
      if (prItemsList?.length < 1) {
        toast.error("please add items to continue", {
          toastId: "PRadditem_error"
        });
        return;
      }
      setValue(3);
      setSelectedMenuItem("Submit")
    }

    if (value === 3) {
      setLoading(true);
      const isApprovers = checkApprovers();
      if (!isApprovers) {
        setLoading(false);
        return;
      }
      if (prItemsList?.length < 1) {
        toast.error("Atleast one line item is required to create a pr.", {
          toastId: "PRadditem_error"
        });

        setSelectedMenuItem("Save & Continue");
        setLoading(false);
        setApproverShow(false)
        setValue(2)
        return;
      }
      var data = {
        id: tempDataEditData[0]?.id,
        customerId: customerid,
        prSubject: tempDataEditData[0]?.prSubject,
        prDescription: tempDataEditData[0]?.prDescription,
        requisitioner: tempDataEditData[0]?.requisitioner,
        prNumber: tempDataEditData[0]?.prNumber,
        activityId: parseInt(activityId) ?? 0
      };

      if (data?.id > 0) {
        PRFinalSubmit(data, currentStage, stagelist, atoken).then((res) => {
          if (res && res > 0) {
            toast.success("Purchase Request Submitted Successfully!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 1000,
            });
            setLoading(false)
            navigate("/configuration/manage-PR");
          }
        });
      }
      setLoading(false);
    }
  }

  //pr cancel start
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [prerror, setPrError] = useState("");

  const handleCancel = () => {
    setModalCancelOpen(true);
  }

  const handleCancelPRModal = async (confirm) => {
    if (confirm) {
      if (!cancelReason.trim()) {
        setPrError("This field is required.");
        return;
      }
      else {
        const cancelbuttonvalue = {
          prId: parseInt(pageSlug),
          Status: "Cancel",
          Comment: cancelReason,
        }
        const queryParams = buildQueryParams(cancelbuttonvalue)
        const res = await apiClient.postres(`/api/PRManage/PRCancel?${queryParams}`, null, atoken);
        if (res) {
          toast.success(`PR Cancel successfully.`);
          navigate("/configuration/manage-PR");
        }
      }
    } else {
      setModalCancelOpen(false);
      setCancelReason("");
      setPrError("");
    }
  };

  const handleCancelInputChange = (e) => {
    setCancelReason(e.target.value);
    if (e.target.value.trim()) {
      setPrError("");
    }
  };

  //pr cancel end
  useEffect(() => {
    if (value === 2) {
      pullPRtemServiceFind(idFromURL)
    }
    if (value === 3) {
      pullPRtemServiceFind(idFromURL)
      pullgetPRManageFind(idFromURL);
    }
  }, [idFromURL, value]);


  const navigate = useNavigate();

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

  // Example usage
  const stageInfo = getStageInfo(currentStage, stagelist);

  const validationSchemaApprover = yup.object().shape({
    remarks: yup.string().when('IsApproved', {
      is: false,
      then: (schema) => schema.required("Reason is required for rejection"),
      otherwise: (schema) => schema.notRequired()
    })
  });

  const formik_PRApproveReject = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerId: parseInt(customerid),
      eventId: parseInt(idFromURL),
      eventType: "PR",
      IsApproved: true,
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
        eventType: "PR",
        stageId: stageInfo?.currentStageId,
        IsApproved: values?.IsApproved,
        activityId: parseInt(activityId),
        remarks: values?.remarks,
        eventSubject: tempDataEditData[0]?.prSubject,
        RecordCreatorId: tempDataEditData[0]?.createdById
      }

      const res = await apiClient.postres(
        `/api/ApprovalAction/ApprovalAction`, actionData, atoken
      );
      if (res) {
        toast.success(`Action Taken Successfully.`);
        setApproveRejectModal(false);
        navigate(`/app`);
      }
      setLoading(false)
    },
  });

  const [preview, setPreview] = useState(true)
  //approval related
  const [eventAppList, setEventAppList] = useState([]);
  const hasAnyApproval = eventAppList?.some(x => x.approved === true);
  const [approverInWorkflow, setApproverInWorkflow] = useState([]);
  const [wfupdate, setwfUpdate] = useState([false]);
  const [wfFetched, setWfFetched] = useState(false);
  const handleEventAppList = useCallback((arr, updatedvalue) => {
    setEventAppList(arr);
    setApproverInWorkflow(updatedvalue);
    setWfFetched(true);
  }, []);

  const checkApprovers = () => {
    const isStageRequired = stagelist?.filter((x) => x.wfname)
    for (const stage of isStageRequired) {
      const matchingWorkflow = approverInWorkflow.find(workflow => workflow.stage === stage.wfname);
      if (matchingWorkflow && matchingWorkflow.approvers.length === 0) {
        toast.error(`Error: The mandatory  workflow "${stage.wfname}" has no approvers.`);
        return false;
      }
    }
    return true
  };

  // to save attachment as rfq created related to attachment workflow
  const [attachmentforevent, setAttachmentforEvent] = useState(null);

  const handleattachmentforevent = useCallback((data) => {
    setAttachmentforEvent(data);
  }, []);

  const fetchPanelHistory = async (id) => {
    if (!id) return;
    setHistoryLoading(true);
    try {
      const params = buildQueryParams({ CustomerId: customerid, EventType: 'PR', EventId: id });
      const res = await apiClient.getres(`api/ReportConfig/AuditReport?${params}`, atoken);
      if (res?.data) {
        const audit = res.data?.changeAudit || [];
        const graph = res.data?.stategraph || [];
        setHistoryAudit(audit);
        setHistoryGraph(graph);
      }
    } catch (e) {
      // leave arrays empty so empty state renders
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPanelAttachments = async (id) => {
    if (!id) return;
    setPanelAttachLoading(true);
    setPanelHasCheckboxChanged(false);
    const params = buildQueryParams({ EventType: 'PR', EventId: id, VendorId: 0 });
    const res = await apiClient.getres(`/api/eventattachment/Find?${params}`, atoken);
    const resData = res?.data?.result || [];
    if (resData.length > 0) {
      const mapped = attachmentmodalforevent(resData, id, 'PR');
      setPanelSavedAttach(mapped);
    } else {
      setPanelSavedAttach([]);
    }
    setPanelAttachLoading(false);
  };

  const addPanelAttachment = async () => {
    const descToUse = panelAttachDesc.trim();
    if (!descToUse) { setPanelAttachError('Please enter a description for the attachment.'); return; }
    if (!panelAttachFile?.file) { setPanelAttachError('Please choose a file to upload.'); return; }
    setPanelAttachError('');
    setPanelAttachAdding(true);
    try {
      const filedata = filequeryparam({ EventType: 'PR', EventId: idFromURL, Description: 'General', CustomerId: customerid });
      const path = await uploadFilesOnAzurePR(filedata, panelAttachFile.file, atoken);
      if (!path) { setPanelAttachAdding(false); return; }
      await PRAttachementAdd({
        prId: idFromURL,
        fileNamePath: path,
        attachmentDescription: descToUse,
        createdById: userDetail?.id,
      }, atoken);
      setPanelAttachDesc('');
      setPanelAttachFile(null);
      if (panelFileInputRef.current) panelFileInputRef.current.value = '';
      fetchPanelAttachments(idFromURL);
    } catch (e) { setPanelAttachError('Upload failed. Please try again.'); }
    setPanelAttachAdding(false);
  };

  const deletePanelAttachment = async (idx, id) => {
    await apiClient.postres(`/api/eventattachment/${id}/Delete`, null, atoken);
    fetchPanelAttachments(idFromURL);
  };

  useEffect(() => {
    PullPurchaseOrgAll();
  }, [atoken, customerid]);

  useEffect(() => {
    if (!idFromURL) return;
    if (workflowPanelTab === 'history') fetchPanelHistory(idFromURL);
    if (workflowPanelTab === 'attachments') fetchPanelAttachments(idFromURL);
  }, [workflowPanelTab, idFromURL]);

  useEffect(() => {
    if (formik.values.purchOrgId?.id) {
      PullPurchaseGroupAll(formik.values.purchOrgId?.id);
    }
  }, [formik.values.purchOrgId]);

  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
  const PullPurchaseOrgAll = () => {
    var data = {
      CustomerId: customerid,
      IsActive: 'true'
    };

    getPurchaseOrgList(data, atoken).then((resp) => {
      if (resp) {
        setPurchaseAllList(resp);
      }
    });
  };

  useEffect(() => {
    if (
      formik.values.requisitioner &&
      requisitionerList &&
      purchaseGroupAllList &&
      purchaseGroupAllList.length > 0
    ) {
      const selectedRequisitioner = requisitionerList.find(
        (item) => item.name === formik.values.requisitioner
      );

      const userOrgGroup = selectedRequisitioner?.userOrgGroup;
      if (userOrgGroup?.length > 0) {
        const foundGroup = purchaseGroupAllList.find(
          (grp) => grp.id === userOrgGroup[0].orgGroupId
        );
        formik.setFieldValue("purchGrpId", foundGroup ?? null);
      }
    }
  }, [purchaseGroupAllList, formik.values.requisitioner]);

  const handlepurchaseorgList = (array) => {
    setPurchaseAllList(array);
  };
  const PullPurchaseGroupAll = (orgMstId) => {
    var data = {
      CustomerId: customerid,
      OrgMstId: orgMstId,
      IsActive: 'true'
    };
    OrgGroupMasterList(data, atoken).then((res) => {
      if (res !== "" && res !== undefined) {
        setPurchaseGroupAllList(res);
        // Auto-select purchase group if only one group is available
        if (res.length === 1) {
          formik.setFieldValue("purchGrpId", res[0]);
          setOrgGroupId(res[0].id);
        }
      } else {
        setPurchaseGroupAllList([]);
      }
    });
  };

  //to update purchOrgId
  useEffect(() => {
    if (purchaseAllList && purchaseAllList.length > 0 && OrgId) {
      const updatedvalue = findObjByValueFromArray(purchaseAllList, OrgId, 'id')
      formik.setFieldValue("purchOrgId", updatedvalue);
    }
    //to set default purchase group when purchase group length is 1 
    if (!idFromURL && purchaseAllList && purchaseAllList.length === 1) {
      formik.setFieldValue("purchOrgId", purchaseAllList[0])
    }

  }, [OrgId, purchaseAllList])

  //to update purchGrpId
  useEffect(() => {

    if (purchaseGroupAllList && purchaseGroupAllList.length > 0 && OrgGroupId) {
      const updatedvalue = findObjByValueFromArray(purchaseGroupAllList, OrgGroupId, 'id')
      formik.setFieldValue("purchGrpId", updatedvalue);
    }
    // Clear purchGrpId when OrgGroupId is reset to 0
    else if (OrgGroupId === 0 && purchaseGroupAllList && purchaseGroupAllList.length > 0) {
      formik.setFieldValue("purchGrpId", null);
    }
    //to set default purchase group when purchase group length is 1 
    if (!idFromURL && purchaseGroupAllList && purchaseGroupAllList.length === 1) {
      formik.setFieldValue("purchGrpId", purchaseGroupAllList[0])
    }

  }, [OrgGroupId, purchaseGroupAllList])

  const [approveRejectModal, setApproveRejectModal] = useState(false);

  //to update purchGrpId
  const [approvershow, setApproverShow] = useState(true)
  const handleApprover = (booleanvalue) => {
    setApproverShow(booleanvalue)
  }
  useEffect(() => {
    if (purchaseGroupAllList && purchaseGroupAllList.length > 0 && OrgGroupId) {
      const updatedvalue = findObjByValueFromArray(purchaseGroupAllList, OrgGroupId, 'id')
      formik.setFieldValue("purchGrpId", updatedvalue);
    }
  }, [OrgGroupId, purchaseGroupAllList])

  //to handle edit from preview page
  const handletabEdit = (value) => {
    setPreview(true);
    setValue(value);
    if (value === "3") { setSelectedMenuItem("Submit") }
    else { setSelectedMenuItem("Save & Continue") }
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = React.useState(null);
  const handleStatusMenuOpen = (e) => setStatusAnchorEl(e.currentTarget);
  const handleStatusMenuClose = () => setStatusAnchorEl(null);
  const [recallConfirmOpen, setRecallConfirmOpen] = useState(false);
  const [excelMenuAnchor, setExcelMenuAnchor] = useState(null);
  const [downloadingPRReport, setDownloadingPRReport] = useState(false);
  const [downloadingPRPDF, setDownloadingPRPDF] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const handleRecall = async () => {
    setRecallConfirmOpen(false);
    try {
      const data = { eventId: idFromURL, eventType: 'PR' };
      const qp = buildQueryParams(data);
      const res = await apiClient.getres(`api/ApprovalAction/Recall?${qp}`, atoken);
      if (res) {
        toast.success('PR Recalled Successfully', { toastId: 'pr_recall' });
        window.location.reload();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'handleRecall_error' });
    }
  };

  const [TemplateTitle, setTemplateTitle] = useState('');

  const handleSaveTemplate = async () => {
    if (!TemplateTitle.trim()) {
      toast.error('Please enter a valid template name');
      return;
    }
    if (!idFromURL) {
      toast.error('PR ID must be there to create template');
      return;
    }
    try {
      const data = {
        templateTitle: TemplateTitle.trim(),
        subject: formik?.values?.prSubject?.trim(),
        eventType: 'PR',
        eventId: idFromURL,
        customerId: customerid,
        eventTypeId: 0,
      };
      const res = await apiClient.postres('/api/EventTemplate/Add', data, atoken);
      if (res) {
        toast.success('Template saved successfully');
        setTemplateDialogOpen(false);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'handleSaveTemplate_error' });
    }
  };

  const handleDownloadClosedPRExcel = async () => {
    setExcelMenuAnchor(null);
    setDownloadingPRReport(true);
    try {
      const res = await apiClient.api.get(`/api/PRManage/ManagePRReportExcel/${idFromURL}`, {
        headers: { Authorization: `Bearer ${atoken}` },
        responseType: 'blob',
      });
      if (res?.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `PR_Report_${idFromURL}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDownloadingPRReport(false);
    }
  };

  const handleDownloadClosedPRPDF = async () => {
    setExcelMenuAnchor(null);
    setDownloadingPRPDF(true);
    try {
      const res = await apiClient.api.get(`/api/PRManage/ManagePRReportPDF/${idFromURL}`, {
        headers: { Authorization: `Bearer ${atoken}` },
        responseType: 'blob',
      });
      if (res?.data) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `PR_Report_${idFromURL}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDownloadingPRPDF(false);
    }
  };

  const handleMenuClick = (item) => {
    setAnchorEl(null);
    if (item === "Cancel") {
      handleCancel();
    } else if (item === "Save as Templates") {
      setTemplateTitle(formik?.values?.prSubject || '');
      setTemplateDialogOpen(true);
    } else if (item === "Recall PR") {
      setRecallConfirmOpen(true);
    } else {
      setSelectedMenuItem(item);
    }
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
  const [isUploading, setIsUploading] = useState(false);

  const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
  const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
  const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
  const ClosePurcgaseOrgGrpModal = () => setPurchaseOrgGrpModal(false);
  if (pageSlug && !tempDataEditData) {
    return (
      <GridSkeleton />
    )
  }
  // Dependency on preview, so it runs when preview changes
  const handleButtonGroup = () => {
    switch (selectedMenuItem) {
      case "Submit":
        return handleSaveContinue()
      case "Save & Continue":
        return handleSaveContinue()
      case "Cancel":
        return handleCancel()
      default:
        return ""
    }
  };

  //for uplaod and download start
  const downloadPRExcel = async () => {
    await downloadExcelTemplate({
      customerId: customerid,
      templateId: 1,
      fileName: `PR_SampleFile_${new Date().getTime()}.xlsx`,
      eventType: "PR"
    });
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleItemsUpload(file); // Pass the file to the import function
  };

  //integrating excel uplaod
  const fastApiClient = new FastApiClient()
  const handleItemsUpload = async (file) => {
    const data = {
      templateId: 1,
      customerId: parseInt(customerid),
      flagName: "PRId",
      flagId: idFromURL,
      file: file,
      createdById: userDetail?.id,
      createdByName: userDetail?.name
    }
    setIsUploading(true); // Start loader
    try {
      const host = window.location.host;      // buyer.pe.com
      const cleanHost = host.split(":")[0];   // remove port
      const tenant = cleanHost.split(".")[0];
      const response = await fastApiClient.postresmultipart(`bulk-upload/excel-upload`, data, tenant)
      if (response) {
        const errorDetails = response.data?.error_details;
        if (Array.isArray(errorDetails) && errorDetails.length > 0) {
          const fieldToRowsMap = errorDetails.reduce((acc, err) => {
            const field = err.field;
            if (!acc[field]) acc[field] = new Set();
            acc[field].add(err.row);
            return acc;
          }, {});

          const formattedErrorElement = (
            <div style={{ maxWidth: '90vw', wordWrap: 'break-word' }}>
              {Object.entries(fieldToRowsMap).map(([field, rows], index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <strong>{field}</strong> is missing in rows: {Array.from(rows).sort((a, b) => a - b).join(', ')}
                </div>
              ))}
            </div>
          );

          toast.error(formattedErrorElement, {
            autoClose: false,
            style: {
              maxHeight: '300px',
              overflowY: 'auto',
              maxWidth: '90vw',
              width: 'auto',
              whiteSpace: 'normal',
              lineHeight: '1.5',
            },
          });
        }
        else {
          pullPRtemServiceFind(idFromURL)
          toast.success("File uploaded successfully.");
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
    catch (error) {
      toast.error(getApiErrorMessage(error));
    }
    finally {
      setIsUploading(false); // Stop loader
    }
  }

  // Status popover steps
  const prStatusSteps = Array.isArray(stagelist) && stagelist.length > 0
    ? stagelist.map(s => s.stageName || s.currentStage).filter(Boolean)
    : ['Draft'];
  const normalizedCurrentStage = (currentStage || 'Draft').trim();
  const currentStatusIndex = Math.max(0, prStatusSteps.findIndex(
    s => s.toLowerCase() === normalizedCurrentStage.toLowerCase()
  ));

  return (
    <>
      {/* Main content container */}
      <div className="mainContainer d-flex rfq-modern-shell">
        <div className="leftContent d-flex flex-column">
          <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0 }}>

            {/* ── Page head ── */}
            <div className="rfq-dv2-page-head border-bottom mb-3" style={{ flexShrink: 0 }}>

              {/* Row 1: breadcrumb + action buttons */}
              <div className="rfq-dv2-head-top">
                {breadcrumb}

                {/* Action buttons */}
                <div className="rfq-dv2-actions">
                  {!loading ? (
                    actionType && activityId ? null : (
                      <>
                        <button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--ghost" onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
                          Cancel
                        </button>
                        {idFromURL && (
                          <button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--secondary" onClick={() => handleMenuClick('Save as Templates')}>
                            Save as Template
                          </button>
                        )}
                        {idFromURL && currentStage === 'Under Approval' && !hasAnyApproval && (
                          <button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--secondary" onClick={() => handleMenuClick('Recall PR')}>
                            Recall PR
                          </button>
                        )}
                        {idFromURL && (currentStage === 'Close' || currentStage === 'Consumed') && (
                          <button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--secondary" onClick={(e) => setExcelMenuAnchor(e.currentTarget)}>
                            Download Report
                          </button>
                        )}
                        <button
                          type="button"
                          className="rfq-dv2-action-btn rfq-dv2-action-btn--primary"
                          onClick={handleButtonGroup}
                          disabled={
                            selectedMenuItem === "Save & Continue"
                              ? !["Draft", "Under Approval"].includes(currentStage)
                              : !stagearray.includes(currentStage)
                          }
                        >
                          {selectedMenuItem}
                        </button>
                      </>
                    )
                  ) : (
                    <button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--primary" disabled>
                      Saving...
                    </button>
                  )}
                </div>
              </div>

              {/* Stage flow — hidden via CSS in v2 shell */}
              <div className="rfq-dv2-stage-flow-wrap">
                <MemoizedEventStageFlow stagelist={stagelist} currentStage={currentStage} />
              </div>

              {/* Row 2: meta info */}
              <div className="rfq-dv2-head-bottom">
                <div className="rfq-dv2-meta-row">
                  <span className="rfq-dv2-meta-item">
                    <span className="rfq-dv2-meta-label">Status</span>
                    <button
                      type="button"
                      className={`rfq-dv2-status-pill${normalizedCurrentStage.toLowerCase() === 'draft' ? ' is-draft' : ''}`}
                      onClick={handleStatusMenuOpen}
                    >
                      <span className="rfq-dv2-status-dot" />
                      {normalizedCurrentStage}
                    </button>
                  </span>
                  {tempDataEditData?.[0]?.prNumber && (
                    <span className="rfq-dv2-meta-item">
                      <span className="rfq-dv2-meta-label">PR Number:</span>{' '}
                      <span className="rfq-dv2-meta-value">{tempDataEditData[0].prNumber}</span>
                    </span>
                  )}
                </div>
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={handleStatusMenuClose}
                  classes={{ paper: 'rfq-dv2-status-menu-paper' }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{ style: { width: 280, minWidth: 280, maxWidth: 280, overflow: 'hidden' } }}
                >
                  <div className="rfq-dv2-status-menu">
                    <div className="rfq-dv2-status-menu-title">PR Status</div>
                    <div className="rfq-dv2-status-menu-list">
                      {prStatusSteps.map((step, index) => {
                        const stepClass = index < currentStatusIndex ? '' : index === currentStatusIndex ? 'is-current' : 'is-future';
                        return (
                          <div key={step} className={`rfq-dv2-status-step ${stepClass}`}>
                            <span className="rfq-dv2-status-step-icon" />
                            <span>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Menu>
              </div>
            </div>

            {/* Tab Navigation and Icons Header */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3 bg-grey" style={{ flexShrink: 0 }}>
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
                  {/* Always show General tab (content will show access message if unauthorized) */}
                  <Tab value={1} label={<span className="section-heading">General</span>} />
                  {/* Always show Items/Services tab (disabled until idFromURL); content will show access message if unauthorized) */}
                  <Tab
                    value={2}
                    label={<span className="section-heading">Items/Services</span>}
                    disabled={!idFromURL}
                  />
                  {idFromURL && ["Draft", "Under Approval"].includes(currentStage.trim()) && (
                    <Tab
                      value={3}
                      label={<span className="section-heading">Preview</span>}
                      disabled={!preview}
                    />
                  )}
                  {idFromURL &&
                    !["Draft"].includes(currentStage.trim()) && (
                      <Tab
                        value={4}
                        label={<span className="section-heading">Recent Queries</span>}
                        disabled={!idFromURL}
                      />
                    )}
                </Tabs>
              </Box>

              {/* Top-right icons: History, Attachment, and Approval */}
              <div className="d-flex align-items-center gap-2">
                <AttachmentWorkFlow
                  eventtype={`PR`}
                  eventid={idFromURL}
                  action={stagearray.includes(currentStage)}
                  handleattachmentforevent={handleattachmentforevent}
                  ref={attachmentdrawerref}
                  onCountChange={handleAttachmentCount}
                  permissionManager={permissionManager}
                />
                <HistoryCell eventtype={`PR`} eventId={pageSlug} permissionManager={permissionManager} />
                {idFromURL && (<Tooltip title="Show/Hide Approvers">
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
            <div className="flex-grow-1 hidden-scrollbar" style={{ padding: "20px" }} >
              {loadingPermissions ? (
                <div className="p-3 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <GridSkeleton />
                </div>
              ) : value === 1 ? (
                <PRGeneralTab
                  canRead={permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false}
                  canEdit={permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false}
                  formik={formik}
                  loadRequisitioner={loadRequisitioner}
                  requisitionerList={requisitionerList}
                  purchaseAllList={purchaseAllList}
                  purchaseGroupAllList={purchaseGroupAllList}
                  setPurchaseGroupAllList={setPurchaseGroupAllList}
                  userDetail={userDetail}
                  handleRequisitionerChange={handleRequisitionerChange}
                  PullUserDesignation={PullUserDesignation}
                  setPurchaseOrgModal={setPurchaseOrgModal}
                  setPurchaseOrgGrpModal={setPurchaseOrgGrpModal}
                  setOrgGroupId={setOrgGroupId}
                />
              ) : null}
              {loadingPermissions ? (
                <div className="p-3 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <GridSkeleton />
                </div>
              ) : value === 2 ? (
                <PRItemsTab
                  loadingPermissions={loadingPermissions}
                  canRead={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false}
                  canEdit={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.EDIT) ?? false}
                  canCreate={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.CREATE) ?? false}
                  canRemove={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.REMOVE) ?? false}
                  stagearray={stagearray}
                  currentStage={currentStage}
                  prItemsList={prItemsList}
                  isBoq={formik.values.isBoq}
                  idFromURL={idFromURL}
                  toggleDrawer={toggleDrawer}
                  handleEditItem={handleEditItem}
                  handleDeleteItem={handleDeleteItem}
                  pullPRtemServiceFind={pullPRtemServiceFind}
                  setConfirmClearAllItems={setConfirmClearAllItems}
                  downloadPRExcel={downloadPRExcel}
                  handleItemsExcelUpload={() => fileInputRef.current?.click()}
                />
              ) : null}

              {preview && value === 3 && (
                loading ? <ListSkeleton /> : (
                  <PRPreviewTab
                    idFromURL={idFromURL}
                    formik={formik}
                    purchaseAllList={purchaseAllList}
                    purchaseGroupAllList={purchaseGroupAllList}
                    stagearray={stagearray}
                    currentStage={currentStage}
                    prItemsList={prItemsList}
                    handletabEdit={handletabEdit}
                    handleEditItem={handleEditItem}
                    handleDeleteItem={handleDeleteItem}
                    pullPRtemServiceFind={pullPRtemServiceFind}
                    accessLevel={accessLevel}
                  />
                )
              )}

              {value === 4 &&
                <QueryList
                  pageSlug={pageSlug}
                  key={"QueryList"}
                  accessLevel={accessLevel}
                  fromEventPage={true}
                  EventId={pageSlug}
                  EventType={"PR"}
                  permissionManager={permissionManager}
                />
              }
            </div>
          </div>
        </div>

        {/* Right panel — Workflow / History / Attachments */}
        <div className={`rightContent${approvershow ? '' : ' d-none'}`}>
          <div className="bg-white approver-panel d-flex flex-column">
            <div className="rfq-dv2-workflow-head">
              <div className="rfq-dv2-workflow-tabs">
                <button type="button" className={`rfq-dv2-workflow-tab${workflowPanelTab === 'workflow' ? ' active' : ''}`} onClick={() => setWorkflowPanelTab('workflow')}>
                  Approval Workflow
                </button>
                <button type="button" className={`rfq-dv2-workflow-tab${workflowPanelTab === 'history' ? ' active' : ''}`} onClick={() => setWorkflowPanelTab('history')}>
                  View History
                </button>
                <button type="button" className={`rfq-dv2-workflow-tab${workflowPanelTab === 'attachments' ? ' active' : ''}`} onClick={() => setWorkflowPanelTab('attachments')}>
                  Attachments
                </button>
              </div>
            </div>
            {/* Approve / Reject action panel */}
            {workflowPanelTab === 'workflow' && actionType === 'approval' && activityId && (
              <div className="rfq-dv2-workflow-action-panel">
                <div className="rfq-dv2-workflow-alert">
                  <span>{normalizedCurrentStage || currentStage} required for You</span>
                </div>
                <div className="rfq-dv2-workflow-actions">
                  <button
                    type="button"
                    className="rfq-dv2-workflow-btn rfq-dv2-workflow-approve"
                    onClick={() => {
                      formik_PRApproveReject.setFieldValue('IsApproved', true);
                      setApproveRejectModal(true);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rfq-dv2-workflow-btn rfq-dv2-workflow-reject"
                    onClick={() => {
                      formik_PRApproveReject.setFieldValue('IsApproved', false);
                      setApproveRejectModal(true);
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
              {/* Workflow tab */}
              {approvershow && workflowPanelTab === 'workflow' && (
                <>
                  <EventApprovalBox
                    requestCell={requestCell}
                    handleEventAppList={handleEventAppList}
                    wfupdate={wfupdate}
                    action={stagearray.includes(currentStage)}
                    stagelist={stagelist}
                    permissionManager={permissionManager}
                    eventCode={tempDataEditData?.[0]?.eventCode}
                    eventSubject={tempDataEditData?.[0]?.prSubject}
                    startDate={null}
                    endDate={null}
                  />
                  {(requestCell?.EventId === 0 || (wfFetched && eventAppList.length === 0)) && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C9.24 2 7 4.24 7 7v2H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V7c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#9ca3af" />
                        </svg>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 6 }}>No Approvers Configured</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>No approval workflow has been set up for this event.</div>
                    </div>
                  )}
                </>
              )}

              {/* History tab */}
              {workflowPanelTab === 'history' && (
                <div className="rfq-dv2-history-track">
                  {historyLoading ? (
                    <div className="rfq-dv2-panel-loading">Loading history…</div>
                  ) : historyGraph.length === 0 && historyAudit.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm8 0v5h-5l1.85-1.85A7.003 7.003 0 0 0 13 5V3a9.003 9.003 0 0 1 5.65 2L21 3z" fill="#9ca3af" />
                          <path d="M12 8v4l3 3-1.41 1.41L10 13V8h2z" fill="#9ca3af" />
                        </svg>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 6 }}>No History Available</div>
                      <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>No activity has been recorded for this purchase request yet.</div>
                    </div>
                  ) : (
                    historyGraph.length > 0 && (
                      <div className="rfq-dv2-stage-graph">
                        {historyGraph.map((stage, i) => {
                          const name = stage.approverName ?? stage.modifiedByName ?? 'Unknown';
                          const date = stage.stageDone
                            ? formatDateViaLocale(stage.stageDone, userDetail)
                            : formatDateViaLocale(stage.modifiedOn, userDetail);
                          return (
                            <React.Fragment key={i}>
                              {i > 0 && (
                                <div className="rfq-dv2-stage-graph-arrow">
                                  <span className="rfq-dv2-stage-arrow-icon">→</span>
                                </div>
                              )}
                              <div className="rfq-dv2-stage-graph-node">
                                <span className="rfq-dv2-stage-graph-badge">
                                  <span className="rfq-dv2-stage-check">✓</span>
                                  {stage.currentStage?.toUpperCase()}
                                </span>
                                <span className="rfq-dv2-stage-graph-user">{name}</span>
                                <span className="rfq-dv2-stage-graph-date">{date}</span>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Attachments tab */}
              {workflowPanelTab === 'attachments' && (
                <div className="rfq-dv2-attachments-panel">
                  {panelAttachLoading ? (
                    <div className="rfq-dv2-panel-loading">Loading attachments…</div>
                  ) : (
                    <>
                      {stagearray.includes(currentStage) && (
                        <div className="rfq-dv2-attach-add-section">
                          <textarea
                            className="rfq-dv2-attach-desc-input"
                            placeholder="Attachment Description"
                            rows={4}
                            value={panelAttachDesc}
                            onChange={e => {
                              setPanelAttachDesc(e.target.value.replace(/'/g, ''));
                              if (panelAttachError) setPanelAttachError('');
                            }}
                          />
                          <label className="rfq-dv2-file-zone">
                            <input
                              type="file"
                              ref={panelFileInputRef}
                              style={{ display: 'none' }}
                              accept=".docx,.doc,.jpeg,.jpg,.gif,.png,.pdf,.xlsx"
                              onChange={e => {
                                if (validateFileSize(e)) {
                                  setPanelAttachFile({ file: e.target.files[0] });
                                  if (panelAttachError) setPanelAttachError('');
                                } else {
                                  setPanelAttachFile(null);
                                }
                              }}
                            />
                            {panelAttachFile ? (
                              <div className="rfq-dv2-file-chip">
                                <HiDownload className="rfq-dv2-file-chip-icon" />
                                <span className="rfq-dv2-file-chip-name">{panelAttachFile.file.name}</span>
                                <button
                                  type="button"
                                  className="rfq-dv2-file-chip-clear"
                                  onClick={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPanelAttachFile(null);
                                    if (panelFileInputRef.current) panelFileInputRef.current.value = '';
                                  }}
                                >
                                  <HiOutlineX />
                                </button>
                              </div>
                            ) : (
                              <div className="rfq-dv2-file-zone-empty">
                                <HiPlusSm className="rfq-dv2-file-zone-icon" />
                                <span>Click to choose file</span>
                                <span className="rfq-dv2-file-zone-hint">pdf, doc, xlsx, png…</span>
                              </div>
                            )}
                          </label>
                          {panelAttachError && (
                            <div className="rfq-dv2-attach-error">{panelAttachError}</div>
                          )}
                          <button
                            type="button"
                            className="rfq-dv2-add-file-btn"
                            onClick={addPanelAttachment}
                            disabled={panelAttachAdding}
                          >
                            <HiPlusSm />
                            {panelAttachAdding ? 'Adding…' : 'Add new file'}
                          </button>
                        </div>
                      )}
                      {panelSavedAttach.length === 0 ? (
                        <div className="rfq-dv2-panel-empty">No attachments yet.</div>
                      ) : (
                        <div className="rfq-dv2-attach-list">
                          {panelSavedAttach.map((item, i) => (
                            <div key={i} className="rfq-dv2-file-row">
                              <span />
                              <div className="rfq-dv2-file-meta">
                                <span className="rfq-dv2-file-desc-text" title={item.attachmentDescription}>
                                  {item.attachmentDescription || '—'}
                                </span>
                                <span className="rfq-dv2-file-name-text" title={getFileName(item.fileNamePath)}>
                                  {getFileName(item.fileNamePath)}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="pe-icon-btn pe-icon-btn--download"
                                aria-label="Download"
                                onClick={() => downloadFilesOnAzure(item.fileNamePath, getFileName(item.fileNamePath), atoken)}
                              >
                                <HiDownload />
                              </button>
                              {stagearray.includes(currentStage) ? (
                                <button
                                  type="button"
                                  className="pe-icon-btn pe-icon-btn--delete"
                                  aria-label="Delete"
                                  onClick={() => deletePanelAttachment(i, item.id)}
                                >
                                  <HiOutlineX />
                                </button>
                              ) : <span />}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CommonBottomDrawer
        open={state['addProductDrawer']}
        onClose={toggleDrawer('addProductDrawer', false)}
        title={itemEditTempData?.id > 0 ? 'Edit Product / Service' : 'Add Product / Service'}
        bodyStyle={{ overflowY: 'auto' }}
        actions={
          <>
            <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={toggleDrawer('addProductDrawer', false)}>Cancel</button>
            {(stagearray.includes(currentStage) || currentStage === 'Under Approval') && (
              <>
                <button type="reset" form="add-pr-product-form" className="pe-btn pe-btn--secondary">Reset</button>
                <button type="submit" form="add-pr-product-form" className="pe-btn pe-btn--primary">
                  {itemEditTempData?.id > 0 ? 'Update' : 'Add'}
                </button>
              </>
            )}
          </>
        }
      >
        <AddItemProductsCell
          idFromURL={idFromURL}
          callbackItemAdd={callbackItemAdd}
          itemEditTempData={itemEditTempData}
          action={stagearray.includes(currentStage) || currentStage === 'Under Approval'}
        />
      </CommonBottomDrawer>

      {/* Surrogate RFQ Drawer */}
      <CommonBottomDrawer
        open={state['surrogateDrawer']}
        onClose={toggleDrawer('surrogateDrawer', false)}
        title="Configure Surrogate RFQ"
        actions={
          <>
            <button type="reset" form="surrogate-form" className="pe-btn pe-btn--secondary">Reset</button>
            <button type="submit" form="surrogate-form" className="pe-btn pe-btn--primary">Submit</button>
          </>
        }
      >
        <form id="surrogate-form" autoComplete="off">
          <div className='row mt-2'>
            <div className='col-12 col-md-6 mb-4'>
              <label className="pe-field-label">Name <span className="rfq-required-star">*</span></label>
              <TextFieldCell id="surrogate-name" name="surrogate-name" placeholder='' maxLength={100} />
            </div>
            <div className='col-12 col-md-6 mb-4'>
              <label className="pe-field-label">Email <span className="rfq-required-star">*</span></label>
              <TextFieldCell id="surrogate-email" name="surrogate-email" placeholder='' maxLength={100} />
            </div>
            <div className='col-12 mb-4'>
              <label className="pe-field-label">Reason <span className="rfq-required-star">*</span></label>
              <TextFieldCell id="surrogate-reason" name="surrogate-reason" multiline={true} rows={4} placeholder='' maxLength={100} />
            </div>
          </div>
        </form>
      </CommonBottomDrawer>

      {/* Approve / Reject confirmation modal */}
      <PEModal
        open={approveRejectModal}
        onClose={() => !loading && setApproveRejectModal(false)}
        size="xs"
        title={formik_PRApproveReject.values.IsApproved ? 'Approve PR' : 'Reject PR'}
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={() => setApproveRejectModal(false)} disabled={loading}>Cancel</button>
            <button type="submit" form="pr-approve-form" className="pe-btn pe-btn--primary" disabled={loading}>
              {loading ? 'Saving...' : (formik_PRApproveReject.values.IsApproved ? 'Approve' : 'Reject')}
            </button>
          </>
        }
      >
        <form id="pr-approve-form" onSubmit={formik_PRApproveReject.handleSubmit} autoComplete="off">
          <p className="f14 mb-3" style={{ color: 'var(--pe-text)' }}>
            {formik_PRApproveReject.values.IsApproved
              ? 'Are you sure you want to approve this PR?'
              : 'Are you sure you want to reject this PR?'}
          </p>
          <label className="pe-field-label">Comment</label>
          <TextField
            id="remarks" name="remarks" multiline rows={3} fullWidth size="small" variant="outlined"
            className="f14" inputProps={{ maxLength: 200 }}
            value={formik_PRApproveReject?.values?.remarks}
            error={formik_PRApproveReject.touched.remarks && Boolean(formik_PRApproveReject.errors.remarks)}
            helperText={formik_PRApproveReject.touched.remarks && formik_PRApproveReject.errors.remarks}
            onChange={(e) => formik_PRApproveReject.setFieldValue("remarks", e.target.value)}
            InputProps={{
              endAdornment: formik_PRApproveReject?.values?.remarks && (
                <InputAdornment position="end">
                  <Typography variant="body2" color="textSecondary">
                    {formik_PRApproveReject?.values?.remarks?.length}/200
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </PEModal>
      <>
        <input
          className="d-none"
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </>
      {/* Delete Item confirmation */}
      <PEModal
        open={confirmDelete}
        onClose={handleCloseDelete}
        size="xs"
        title="Delete Item"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={handleCloseDelete}>No</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={() => removeItemData(removeItem)}>Yes, Delete</button>
          </>
        }
      >
        <p className="f14 mb-0" style={{ color: 'var(--pe-text)' }}>Are you sure you want to delete this item?</p>
      </PEModal>

      {/* Clear All Items confirmation */}
      <PEModal
        open={confirmClearAllItems}
        onClose={() => handleClearAllItems(false)}
        size="xs"
        title="Delete All Items"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleClearAllItems(false)}>No</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={() => handleClearAllItems(true)}>Yes, Delete All</button>
          </>
        }
      >
        <p className="f14 mb-0" style={{ color: 'var(--pe-text)' }}>Are you sure you want to delete all items?</p>
      </PEModal>

      {/* Cancel PR confirmation */}
      <PEModal
        open={modalCancelOpen}
        onClose={() => handleCancelPRModal(false)}
        size="xs"
        title="Cancel PR"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleCancelPRModal(false)}>No</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={() => handleCancelPRModal(true)}>Yes, Cancel</button>
          </>
        }
      >
        <p className="f14 mb-2" style={{ color: 'var(--pe-text)' }}>Do you want to cancel this PR? Unsaved changes will be lost.</p>
        <label className="pe-field-label">Reason <span className="rfq-required-star">*</span></label>
        <TextField
          autoFocus fullWidth size="small" variant="outlined" type="text"
          value={cancelReason} onChange={handleCancelInputChange}
          error={Boolean(prerror)} helperText={prerror}
        />
      </PEModal>

      {/* Recall PR confirmation */}
      <PEModal
        open={recallConfirmOpen}
        onClose={() => setRecallConfirmOpen(false)}
        size="xs"
        title="Recall PR"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={() => setRecallConfirmOpen(false)}>No</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={handleRecall}>Yes, Recall</button>
          </>
        }
      >
        <p className="f14 mb-0" style={{ color: 'var(--pe-text)' }}>Are you sure you want to recall this PR from approval?</p>
      </PEModal>

      {/* Save as Template dialog */}
      <PEModal
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        size="xs"
        title="Save as Template"
        bodyStyle={{ padding: '16px 20px' }}
        footer={
          <>
            <button className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={() => setTemplateDialogOpen(false)}>Cancel</button>
            <button className="pe-btn pe-btn--primary" onClick={handleSaveTemplate} disabled={!idFromURL}>Save</button>
          </>
        }
      >
        <label className="pe-field-label">Template Name <span className="rfq-required-star">*</span></label>
        <TextFieldCell
          id="pr-template-title"
          name="pr-template-title"
          placeholder="Enter template name"
          value={TemplateTitle}
          onChange={(e) => setTemplateTitle(e.target.value)}
          maxLength={100}
        />
      </PEModal>

      {/* Download Report submenu */}
      <Menu anchorEl={excelMenuAnchor} open={Boolean(excelMenuAnchor)} onClose={() => setExcelMenuAnchor(null)}>
        <MenuItem onClick={handleDownloadClosedPRExcel} disabled={downloadingPRReport}>
          <span>Download Excel</span>
        </MenuItem>
        <MenuItem onClick={handleDownloadClosedPRPDF} disabled={downloadingPRPDF}>
          <span>Download PDF</span>
        </MenuItem>
      </Menu>

      {/* Purchase Organisation Modal */}
      <PEModal
        open={purchaseOrgModal}
        onClose={ClosePurcgaseOrgModal}
        size="lg"
        title="Purchase Organization"
        footer={
          <button type="button" className="pe-btn pe-btn--secondary" onClick={ClosePurcgaseOrgModal}>Close</button>
        }
      >
        <PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
      </PEModal>

      {/* Purchase Group Modal */}
      <PEModal
        open={purchaseOrgGrpModal}
        onClose={ClosePurcgaseOrgGrpModal}
        size="lg"
        title="Purchase Group"
        footer={
          <button type="button" className="pe-btn pe-btn--secondary" onClick={ClosePurcgaseOrgGrpModal}>Close</button>
        }
      >
        <PurchaseOrgGrp isModal />
      </PEModal>
      {isUploading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border text-primary mb-2" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>Please Wait While Uploading...</div>
          </div>
        </div>
      )}
    </>
  )
}


export default PurchaseRequest