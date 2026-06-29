import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import IconButton from '@mui/material/IconButton';
import { HiOutlineX, HiPlusSm, HiOutlineDotsHorizontal, HiPencilAlt } from "react-icons/hi";
import { Autocomplete, Alert, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormHelperText, InputAdornment, Menu, MenuItem, TextField, Tooltip, Typography, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Card, CardContent, CardHeader, } from "@mui/material";
import TextFieldCell from '../../BaseCells/TextFieldCell';
import LoadingButton from '@mui/lab/LoadingButton';
import HistoryCell from '../../BaseCells/HistoryCell';
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { actionTypes, useStateValue } from '../../../store';
import { extractTextFromHTML, checkUTC } from '../../../utils/common/utility';
import AddProductsCell from './AddProductsCell';
import { OrgGroupMasterList, getPurchaseOrgList } from '../../../utils/commerciallibrary';
import { PRFinalSubmit, PRItemServiceDelete, PRManageAdd, PRManageUpdate, buildQueryParams, getPRItemServiceFind, getPRManageFind } from '../../../utils/purchaseRequest';
import { toast } from 'react-toastify';
import { findObjByValueFromArray, findObjListByValueFromArray, findStringByValueFromArray, handlesaveAttachment, downloadExcelTemplate } from '../../../utils/common';
import { BackButton, MemoizedEventStageFlow } from '../../../utils/common/component';
import { Dropdown, Modal } from 'react-bootstrap';
import AttachmentWorkFlow from '../../BaseCells/attachmentworkflow';
import EventApprovalBox from '../../BaseCells/eventapprovalbox';
import ProductitemCell from '../RequestForQuotation/ProductitemCell';
import ListSkeleton from '../../../components/Skeleton/listSkeleton';
import PurchaseOrgGrp from '../../../utils/common/PurchaseOrgGrp';
import PurchaseOrg from '../../../utils/common/PurchaseOrg';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import { api, ApiClient } from '../../../Apiclient';
import { ExpandMore } from '@mui/icons-material';
import { FastApiClient } from '../../../FastApiClient';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QueryList from '../../CommunucationHub/QueryList';
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import AddItemProductsCell from './AddItemProductsCell';
import BoqScreen from '../RequestForQuotation/BoqScreen';

const PurchaseRequest = ({ claimType }) => {
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
    setLoadingPermissions(false);
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
      toast.error('Failed to load user designations list');
    }
    finally {
      setLoadRequisitioner(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue == "3") {
      setSelectedMenuItem("Submit")
      if (newValue == "3" && stagelist?.some(item => item.currentStage == "Under Approval")) {
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
        purchOrgId: values.purchOrgId?.id != "" ? values.purchOrgId?.id : 0,
        purchGrpId: values.purchGrpId?.id != "" ? values.purchGrpId?.id : 0,
        boqReq: values.isBoq,  // Send API parameter name 'boqReq' instead of 'isBoq'
        stage: currentStage
      };
      setLoading(true)
      if (data?.id > 0) {
        try {
          PRManageUpdate(data, currentStage, stagelist, atoken).then((res) => {
            if (res.StatusCode == 500 && res.Message == 'Duplicate Record Found!') {
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
          toast.error("Error processing request");
          setLoading(false)
        }
      }
      else {
        PRManageAdd(data, currentStage, stagelist, atoken).then((res) => {

          if (res.StatusCode == 500 && res.Message == 'Duplicate Record Found!') {
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
              toast.error("Error while saving data", {
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
    if (idFromURL == null) {
      setApproverShow(false);
    }
    else if (value == 3) {
      if (stagelist?.some(item => item.currentStage == "Under Approval")) {
        setApproverShow(true);
      }
      // setApproverShow(true);
    }
  }, [value, idFromURL]);

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
      const stagesarray = result?.map((item) => item.currentStage);
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
      pullgetPRManageFind(idFromURL)
    }
  }, [idFromURL]);

  const handleSaveContinue = () => {
    if (value == 1) {
      if (formik?.values?.purchOrgId?.id > 0 && !formik?.values?.purchGrpId?.id) {
        toast.error("Please fill Purchase Group.", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 1000,
        });
        return;
      }
      formik.handleSubmit()
    }

    if (value == 2) {
      if (prItemsList?.length < 1) {
        toast.error("please add items to continue", {
          toastId: "PRadditem_error"
        });
        return;
      }
      setValue(3);
      setSelectedMenuItem("Submit")
    }

    if (value == 3) {
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
    if (value == 2) {

      pullPRtemServiceFind(idFromURL)
    }
    if (value == 3) {

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
      const bidStDate = checkUTC(tempDataEditData[0].bidStDate);
      const currentDate = new Date();
      const isCurrentAfterBid = currentDate > new Date(bidStDate);
      // if (isCurrentAfterBid && values?.IsApproved == true) {
      //     toast.info("Start date of auction is passsed.Please revert to send back to creator for edit pr.");
      //     setLoading(false);
      //     return;
      // }
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
        navigate(`/app`);
      }
      setLoading(false)
    },
  });

  const [preview, setPreview] = useState(true)
  //approval related
  const [eventAppList, setEventAppList] = useState([]);
  const [approverInWorkflow, setApproverInWorkflow] = useState([]);
  const [wfupdate, setwfUpdate] = useState([false]);
  const handleEventAppList = useCallback((arr, updatedvalue) => {
    setEventAppList(arr);
    setApproverInWorkflow(updatedvalue);
  }, []);

  const checkApprovers = () => {

    const isStageRequired = stagelist?.filter((x) => x.wfname)

    for (const stage of isStageRequired) {

      const matchingWorkflow = approverInWorkflow.find(workflow => workflow.stage === stage.wfname);

      if (matchingWorkflow && matchingWorkflow.approvers.length == 0) {
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

  useEffect(() => {
    PullPurchaseOrgAll();
  }, [atoken, customerid]);

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
      if (res != "" && res != undefined) {
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
    if (!idFromURL && purchaseAllList && purchaseAllList.length == 1) {
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
    if (!idFromURL && purchaseGroupAllList && purchaseGroupAllList.length == 1) {
      formik.setFieldValue("purchGrpId", purchaseGroupAllList[0])
    }

  }, [OrgGroupId, purchaseGroupAllList])

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
    if (value == "3") {
      setSelectedMenuItem("Submit")
    }
    else {
      setSelectedMenuItem("Save & Continue")

    }
  };
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (item) => {
    setSelectedMenuItem(item);
    setAnchorEl(null); // Close the menu after selection
    if (item === "Cancel") {
      handleCancel(); // <-- modal open
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
  const [isUploading, setIsUploading] = useState(false);
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
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
      console.error("Upload error", error);
      toast.error("An error occurred during file upload");
    }
    finally {

      setIsUploading(false); // Stop loader
    }
  }

  //##
  return (
    <>
      {/* Main content container with left/right layout like ManagePR */}
      <div className="mainContainer d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className={`leftContent ${approvershow ? "col-9" : "col-12"}`} style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="bg-white rounded-default shadow-sm p-3" style={{ height: 'calc(100vh - 90px)', margin: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header with BackButton, Stage Flow, and Action Buttons */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3" style={{ flexShrink: 0 }}>
              <div className="d-flex align-items-center">
                <BackButton
                  title={
                    tempDataEditData?.[0].eventCode
                      ? <span className="page-heading">{tempDataEditData[0].eventCode}</span>
                      : idFromURL
                        ? <span className="page-heading">Purchase Request (PR-{idFromURL})</span>
                        : <span className="page-heading">Purchase Request</span>
                  }
                  modal={currentStage === "Draft"}
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
                      Action
                    </Button>
                  ) : (
                    <ButtonGroup variant="contained">
                      <Button
                        variant="contained"
                        className="p-2 pt-1 pb-1"
                        onClick={handleButtonGroup}
                        sx={{ padding: '2px 8px', minHeight: '28px', lineHeight: '1' }}
                        disabled={
                          selectedMenuItem === "Save & Continue"
                            ? !["Draft", "Under Approval"].includes(currentStage)
                            : !stagearray.includes(currentStage)
                        }
                      >
                        <span className="text-capitalize">{selectedMenuItem}</span>
                      </Button>
                      <Button
                        variant="contained"
                        className={`button-text text-white ${!stagearray.includes(currentStage) ? 'dropBtn' : ''}`}
                        onClick={handleMenuOpen}
                        sx={{ padding: '2px 8px', minHeight: '28px', lineHeight: '1' }}
                      >
                        <ExpandMore />
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                      >
                        {value == "3" &&
                          <MenuItem
                            onClick={() => handleMenuClick('Save & Continue')}
                            disabled={!["Draft", "Under Approval"].includes(currentStage)}
                          >
                            <div>
                              <span className="text-capitalize">Save & Continue</span>
                            </div>
                          </MenuItem>
                        }
                        {value != "3" &&
                          <MenuItem onClick={() => handleMenuClick('Save & Continue')}>
                            <div>
                              <span className="text-capitalize">{value == 3 ? "Submit" : "Save & Continue"}</span>
                            </div>
                          </MenuItem>
                        }
                        {idFromURL &&
                          <MenuItem onClick={() => handleMenuClick('Save as Templates')}>
                            <div>
                              <span className="text-capitalize">Save as Templates</span>
                            </div>
                          </MenuItem>
                        }
                        <MenuItem onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
                          <div>
                            <span className="text-capitalize">Cancel</span>
                          </div>
                        </MenuItem>
                      </Menu>
                    </ButtonGroup>
                  )
                ) : (
                  <Button className="button-text text-white">
                    {value == 3 ? "Submit..." : "Save & Continue..."}
                  </Button>
                )}
              </div>
            </div>

            {/* Tab Navigation and Icons Header */}
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3" style={{ flexShrink: 0 }}>
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
                    !["Under Approval", "Draft"].includes(currentStage.trim()) && (
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
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
              {/* <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}> */}
              {loadingPermissions ? (
                <div className="p-3 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <GridSkeleton />
                </div>
              ) : value == 1 ? (
                <>
                  {(() => {
                    const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
                    const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false;
                    const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
                    const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? false;

                    if (!hasReadPermission) {
                      return (
                        <div className="p-3">
                          <Alert severity="warning">
                            You don't have permission to view General data.
                          </Alert>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className='p-3 pe-2 ps-2' style={{ overflow: 'visible' }}>
                          <form onSubmit={formik.handleSubmit} autoComplete="off">
                            <div className='row mt-2'>
                              <div className='col-12 col-md-6 col-lg-6 mb-3'>
                                <TextFieldCell
                                  id="prSubject"
                                  name="prSubject"
                                  label="PR Subject *"
                                  placeholder=''
                                  maxLength={100}
                                  disabled={!hasEditPermission}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Typography variant="body2" color="textSecondary">
                                          {formik?.values?.prSubject?.length}/100
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                  }}
                                  value={formik?.values?.prSubject}
                                  onChange={(e) => {
                                    formik.setFieldValue("prSubject", e.target?.value);
                                  }}
                                  error={formik.touched.prSubject && Boolean(formik.errors.prSubject)}
                                  helperText={formik.touched.prSubject && formik.errors.prSubject}
                                />
                              </div>

                              <div className='col-12 col-md-6 col-lg-6 mb-3'>
                                <TextFieldCell
                                  id="prNumber"
                                  name="prNumber"
                                  label="PR Number"
                                  className="content-text"
                                  placeholder=''
                                  maxLength={20}
                                  disabled={!hasEditPermission}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Typography variant="body2" color="textSecondary">
                                          {formik?.values?.prNumber?.length}/20
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                  }}
                                  value={formik.values?.prNumber}
                                  onChange={(e) => {
                                    formik.setFieldValue("prNumber", e.target?.value);
                                  }}
                                  error={formik.touched?.prNumber && Boolean(formik.errors?.prNumber)}
                                  helperText={formik.touched?.prNumber && formik.errors?.prNumber}
                                />
                              </div>

                              <div className='col-12 mb-3'>
                                <div className='content-text fw-medium mb-2'>PR Description *</div>
                                <ReactQuill
                                  theme="snow"
                                  preserveWhitespace
                                  className=""
                                  readOnly={!hasEditPermission}
                                  value={formik.values.prDescription}
                                  onChange={(value) => {
                                    const prDescription = extractTextFromHTML(value);
                                    const length = prDescription.length;
                                    if (length <= 2000) {
                                      formik.setFieldValue("prDescription", value);
                                    } else {
                                      formik.setFieldValue("prDescription", formik?.values?.prDescription);
                                      toast.error('Description greater than 2000 character is not allowed', {
                                        toastId: "descerr"
                                      });
                                    }
                                  }}
                                />
                                {formik.values.prDescription !== undefined && (
                                  <div
                                    style={{
                                      fontSize: "0.8em",
                                      color: "grey",
                                      textAlign: "end",
                                    }}
                                  >
                                    {`${extractTextFromHTML(formik.values.prDescription).length}/2000`}
                                  </div>
                                )}
                                {formik?.touched?.prDescription && Boolean(formik?.errors?.prDescription) && (
                                  <FormHelperText className="text-danger">
                                    {formik?.errors?.prDescription}
                                  </FormHelperText>
                                )}
                              </div>
                              <div className="col-12 col-md-6 col-lg-3">

                                <Autocomplete
                                  id="requisitioner"
                                  name="requisitioner"
                                  size="small"
                                  className="w-100 content-text"
                                  loading={loadRequisitioner}
                                  options={requisitionerList ? requisitionerList.map(item => item.name) : []}
                                  getOptionLabel={(option) => option}
                                  value={formik.values.requisitioner || ''}
                                  disabled={!hasEditPermission}
                                  onChange={(event, value) => handleRequisitionerChange(value)}
                                  onOpen={() => {
                                    PullUserDesignation();
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Requisitioner"
                                      variant="outlined"
                                      shrink={true}
                                      error={formik.touched.requisitioner && Boolean(formik.errors.requisitioner)}
                                      helperText={formik.touched.requisitioner && formik.errors.requisitioner}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                    />
                                  )}
                                />

                              </div>

                              {purchaseAllList && <div className="col-12 col-md-6 col-lg-3 mb-2">
                                <Autocomplete
                                  id="purchOrgId"
                                  name="purchOrgId"
                                  size="small"
                                  className="w-100 content-text"
                                  sx={{ width: "100%" }}
                                  options={(() => {
                                    if (userDetail?.roleId !== 1 && userDetail?.purchOrgId) {
                                      const userOrg = purchaseAllList.find(org => org.id === userDetail.purchOrgId);
                                      return userOrg ? [userOrg] : [];
                                    }
                                    return [{ id: "new", orgName: "Add New" }, ...purchaseAllList];
                                  })()}
                                  value={formik.values.purchOrgId}
                                  disabled={!hasEditPermission}
                                  getOptionLabel={(option) => option.orgName ?? ""}
                                  onChange={(e, value) => {

                                    if (value?.id === "new") {
                                      setPurchaseOrgModal(true);
                                      formik.setFieldValue("purchGrpId", null);
                                      return
                                    }
                                    if (value) {


                                      formik.setFieldValue(
                                        "purchOrgId",
                                        value
                                      );

                                      formik.setFieldValue("purchGrpId", null);
                                      setOrgGroupId(0);

                                    }
                                    else {
                                      formik.setFieldValue("purchOrgId", null);

                                      formik.setFieldValue("purchGrpId", null);
                                      setPurchaseGroupAllList([]);
                                      setOrgGroupId(0);
                                    }

                                  }}

                                  renderOption={(props, option) => (
                                    <Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
                                      {option.orgName}
                                    </Box>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      variant="outlined"
                                      {...params}
                                      label="Purchase Org"
                                      shrink={true}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                    />
                                  )}
                                />
                              </div>}


                              {purchaseGroupAllList && <div className="col-12 col-md-6 col-lg-3 mb-2">
                                <Autocomplete

                                  id="purchGrpId"
                                  name="purchGrpId"
                                  className="w-100 content-text"
                                  sx={{ width: "100%" }}
                                  options={[
                                    { id: "new", groupName: "Add New" },
                                    ...purchaseGroupAllList,
                                  ]}
                                  getOptionLabel={(option) => option?.groupName ?? ""}
                                  value={formik.values?.purchGrpId}
                                  disabled={!hasEditPermission}
                                  onChange={(e, value) => {

                                    if (value?.id === "new") {
                                      setPurchaseOrgGrpModal(true);
                                      return
                                    }
                                    formik.setFieldValue(
                                      "purchGrpId",
                                      value
                                    );
                                    setOrgGroupId(value?.id || 0);
                                  }}


                                  renderOption={(props, option) => (
                                    <Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
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
                                      shrink={true}
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                    />
                                  )}
                                />
                              </div>}

                              {/* <div className="col-12 col-md-6 col-lg-3 mb-2">
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={formik.values.isBoq === true}
                                      />
                                    }
                                    id="isBoq"
                                    label={<span className="f14 muted">BOQ</span>}
                                    labelPlacement={"end"}
                                    name="isBoq"
                                    disabled={!hasEditPermission}
                                    onChange={(e) => formik.setFieldValue("isBoq", e.target.checked)}
                                    sx={{ alignItems: 'center', height: '100%' }}
                                  />
                                </FormGroup>
                              </div> */}
                            </div>
                          </form>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : null}
              {loadingPermissions ? (
                <div className="p-3 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                  <GridSkeleton />
                </div>
              ) : value === 2 ? (
                <>
                  {(() => {
                    const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false;
                    const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.EDIT) ?? false;
                    const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.CREATE) ?? false;
                    const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.REMOVE) ?? false;

                    if (!hasReadPermission) {
                      return (
                        <div className="p-3">
                          <Alert severity="warning">
                            You don't have permission to view the Items/Services tab.
                          </Alert>
                        </div>
                      );
                    }

                    // If BOQ is enabled, show BOQ screen instead of normal items
                    if (formik.values.isBoq === true) {
                      return (
                        <BoqScreen
                          idFromURL={idFromURL}
                          readOnly={!hasEditPermission}
                          eventType="PR"
                          CurrentVersion={1}
                          stage={currentStage}
                          boqReq={formik.values.isBoq}
                          onUploadSuccess={() => {
                            pullPRtemServiceFind(idFromURL);
                          }}
                        />
                      );
                    }

                    return (
                      <>
                        <div className="p-3 pt-0">
                          {hasCreatePermission && accessLevel?.itemservice?.created !== "None" && (
                            <div className="text-end">
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<HiPlusSm />}
                                className="text-capitalize blue-text font-normal"
                                onClick={toggleDrawer("addProductDrawer", true)}
                                disabled={
                                  !(
                                    stagearray.includes(currentStage) ||
                                    currentStage === "Under Approval"
                                  ) || !hasEditPermission
                                }
                              >
                                Add Item
                              </Button>

                              {prItemsList.length > 0 && hasRemovePermission && (
                                <Tooltip title="Clear All">
                                  <span>
                                    <button
                                      type="button"
                                      className="pe-icon-btn pe-icon-btn--delete ms-2 me-3"
                                      //onClick={handleClearAllPrList}
                                      onClick={() => setConfirmClearAllItems(true)}
                                      disabled={
                                        !(
                                          stagearray.includes(currentStage) ||
                                          currentStage === "Under Approval"
                                        ) || !hasRemovePermission
                                      }
                                    >
                                      <HiOutlineX />
                                    </button>
                                  </span>
                                </Tooltip>
                              )}

                              <Dropdown align="end" className="d-inline-block">
                                <Dropdown.Toggle
                                  as="div"
                                  id="gt"
                                  className="round-edit remove-tringle"
                                  role="button"
                                >
                                  <IconButton
                                    size="medium"
                                    className="shadow-sm"
                                    disabled={!stagearray.includes(currentStage) || !hasEditPermission}
                                  >
                                    <HiOutlineDotsHorizontal className="text-dark-blue" />
                                  </IconButton>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="ddl-menu">
                                  <MenuItem
                                    className="content-text text-dark-blue"
                                    disabled={!stagearray.includes(currentStage) || !hasCreatePermission}
                                    onClick={() =>
                                      document.querySelector('input[type="file"]').click()
                                    }
                                  >
                                    Excel Upload
                                  </MenuItem>
                                  <Divider />
                                  <MenuItem
                                    className="content-text text-dark-blue"
                                    disabled={!stagearray.includes(currentStage) || !hasReadPermission}
                                    onClick={downloadPRExcel}
                                  >
                                    Excel Template
                                  </MenuItem>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          )}

                          <div>
                            <ProductitemCell
                              action={stagearray.includes(currentStage) && hasEditPermission}
                              itemsList={prItemsList}
                              handleEditItem={hasEditPermission ? handleEditItem : () => { }}
                              handleDeleteItem={hasRemovePermission ? handleDeleteItem : () => { }}
                              eventType="PR"
                              readOnly={!hasEditPermission}
                              showEditButton={hasEditPermission}
                              showDeleteButton={hasRemovePermission}
                            />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : null}

              {preview && value === 3 && (
                <>
                  {loading ? (
                    <ListSkeleton />
                  ) : (
                    <Box sx={{ p: 3 }}>
                      {/* PR General Details */}
                      <Card sx={{ mb: 3, boxShadow: 2 }}>
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
                              📝 PR General Details
                            </Typography>
                          }
                          action={
                            stagearray.includes(currentStage) && (
                              <button
                                type="button"
                                className="pe-icon-btn pe-icon-btn--edit"
                                onClick={() => handletabEdit(1)}
                              >
                                <HiPencilAlt className="f17 text-primary" />
                              </button>
                            )
                          }
                          sx={{ backgroundColor: "#fff", py: 1.5 }}
                        />
                        <CardContent>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <Typography variant="body2" color="textSecondary">
                                <strong>PR Subject:</strong>
                              </Typography>
                              <Typography variant="body1">{formik.values.prSubject || 'Not specified'}</Typography>
                            </div>

                            <div className="col-md-6 mb-3">
                              <Typography variant="body2" color="textSecondary">
                                <strong>PR Number:</strong>
                              </Typography>
                              <Typography variant="body1">{formik?.values?.prNumber || '-'}</Typography>
                            </div>

                            <div className="col-md-6 mb-3">
                              <Typography variant="body2" color="textSecondary">
                                <strong>Purchase Org:</strong>
                              </Typography>
                              <Typography variant="body1">
                                {findStringByValueFromArray(purchaseAllList, formik.values?.purchOrgId?.id, "id", "orgName") || '-'}
                              </Typography>
                            </div>

                            <div className="col-md-6 mb-3">
                              <Typography variant="body2" color="textSecondary">
                                <strong>Purchase Group:</strong>
                              </Typography>
                              <Typography variant="body1">
                                {findStringByValueFromArray(purchaseGroupAllList, formik.values?.purchGrpId?.id, "id", "groupName") || '-'}
                              </Typography>
                            </div>

                            <div className="col-md-6 mb-3">
                              <Typography variant="body2" color="textSecondary">
                                <strong>BOQ:</strong>
                              </Typography>
                              <Typography variant="body1">
                                {formik.values.isBoq ? 'Yes' : 'No'}
                              </Typography>
                            </div>

                            <div className="col-12">
                              <Typography variant="body2" color="textSecondary">
                                <strong>PR Description:</strong>
                              </Typography>
                              <Box
                                sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', p: 1, fontSize: '14px' }}
                                className="ql-editor"
                                dangerouslySetInnerHTML={{ __html: formik.values.prDescription || '<p>No description provided</p>' }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* PR Items Details */}
                      <Card sx={{ mb: 3, boxShadow: 2 }}>
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
                              📝 PR Items Details
                            </Typography>
                          }
                          action={
                            stagearray.includes(currentStage) && (
                              <button
                                type="button"
                                className="pe-icon-btn pe-icon-btn--edit"
                                onClick={() => handletabEdit(2)}
                              >
                                <HiPencilAlt className="f17 text-primary" />
                              </button>
                            )
                          }
                          sx={{ backgroundColor: "#fff", py: 1.5 }}
                        />
                        <CardContent sx={{ p: 0 }}>
                          {formik.values.isBoq === true ? (
                            <BoqScreen
                              idFromURL={idFromURL}
                              readOnly={true}
                              eventType="PR"
                              CurrentVersion={1}
                              onUploadSuccess={() => {
                                pullPRtemServiceFind(idFromURL);
                              }}
                            />
                          ) : (
                            <Box sx={{ p: 3 }}>
                              <ProductitemCell
                                action={false}
                                itemsList={prItemsList}
                                handleEditItem={handleEditItem}
                                handleDeleteItem={handleDeleteItem}
                                eventType="PR"
                                accessLevel={accessLevel}
                              />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                </>
              )}



              {value == 4 &&
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

        {/* Right content-Approval */}
        <div className={`rightContent ${approvershow ? "col-3" : "d-none"}`}>
          <div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3" style={{ border: "1px solid #ddd", borderTop: "none", height: 'calc(108vh - 120px)' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
              <div className="section-heading mb-0 pb-4">Approval Workflow</div>
              <button
                type="button"
                className="pe-icon-btn pe-icon-btn--close"
                onClick={() => handleApprover(false)}
              >
                <HiOutlineX className="f16" />
              </button>
            </div>
            <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
              {approvershow && (
                <EventApprovalBox
                  requestCell={requestCell}
                  handleEventAppList={handleEventAppList}
                  wfupdate={wfupdate}
                  action={stagearray.includes(currentStage)}
                  stagelist={stagelist}
                  //accessLevel={accessLevel}
                  permissionManager={permissionManager}
                  eventCode={tempDataEditData?.[0]?.eventCode}
                  eventSubject={tempDataEditData?.[0]?.prSubject}
                  startDate={null}
                  endDate={null}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <React.Fragment key='topaddProduct'  >
        <Drawer
          anchor='right'
          open={state['addProductDrawer']}
        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 1000 }, }} >
            <div className='flex flex-col'>
              <Box className='bgheaderCards'>
                <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                  <div className='ms-3 text-white'>
                    Add Product
                  </div>
                  <div>
                    <IconButton
                      onClick={toggleDrawer('addProductDrawer', false)}
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
              <Box sx={{ flexGrow: 1, p: 2, mt: 2 }} >
                <AddItemProductsCell
                  idFromURL={idFromURL}
                  callbackItemAdd={callbackItemAdd}
                  itemEditTempData={itemEditTempData}
                  action={stagearray.includes(currentStage) || currentStage === 'Under Approval'}
                />
              </Box>
            </div>
          </Box>
        </Drawer>
      </React.Fragment>
      <React.Fragment key='setSurrogate'  >
        <Drawer
          anchor='right'
          open={state['surrogateDrawer']}
        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 720 }, }} >
            <div className='flex flex-col'>

              <Box className='bgheaderCards'>
                <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                  <div className='ms-3 text-white'>
                    Configure Surrogate RFQ
                  </div>
                  <div>
                    <IconButton
                      onClick={toggleDrawer('surrogateDrawer', false)}
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
              <Box sx={{ flexGrow: 1, p: 2, mt: 2 }} >
                <div className='row mt-2'>
                  <div className='col-12 col-md-6 mb-4'>
                    <TextFieldCell
                      id="password"
                      name="password"
                      label="Name *"
                      placeholder=''
                      maxLength={100}
                    />
                  </div>
                  <div className='col-12 col-md-6 mb-4'>
                    <TextFieldCell
                      id="password"
                      name="password"
                      label="Email *"
                      placeholder=''
                      maxLength={100}
                    />
                  </div>
                  <div className='col-12 col-md-12 mb-4'>
                    <TextFieldCell
                      id="password"
                      name="password"
                      multiline={true}
                      rows={4}
                      label="Reason *"
                      placeholder=''
                      maxLength={100}
                    />
                  </div>
                </div>
                <hr className='mt-0' />

                <div className='text-end'>
                  <LoadingButton
                    variant='outlined'
                    color='primary'
                    className='me-3 text-capitalize'
                    size='small'
                  >
                    Reset
                  </LoadingButton>
                  <LoadingButton
                    variant='contained'
                    color='primary'
                    className='text-capitalize'
                    size='small'
                  >
                    Submit
                  </LoadingButton>
                </div>
              </Box>
            </div>
          </Box>
        </Drawer>
      </React.Fragment>
      <React.Fragment key="approvePR">
        <Drawer anchor="right" open={state["openInvoiceApproved"]}>
          <form onSubmit={formik_PRApproveReject.handleSubmit} autoComplete="off">
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
                            value={formik_PRApproveReject.values.IsApproved}
                            onChange={(e) =>
                              formik_PRApproveReject.setFieldValue(
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
                            value={formik_PRApproveReject?.values?.remarks}
                            error={formik_PRApproveReject.touched.remarks && Boolean(formik_PRApproveReject.errors.remarks)}
                            helperText={formik_PRApproveReject.touched.remarks && formik_PRApproveReject.errors.remarks}
                            onChange={(e) =>
                              formik_PRApproveReject.setFieldValue(
                                "remarks",
                                e.target.value
                              )
                            }
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
      </React.Fragment>
      <>
        <input
          className="d-none"
          type="file"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </>
      <Dialog
        open={confirmDelete}
        onClose={handleCloseDelete}
      >
        <DialogTitle id="">
          {"Are you sure?"}
        </DialogTitle>
        <DialogContent style={{ minWidth: '300px' }}>
          <DialogContentText id="">
            You want to delete.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>No</Button>
          <Button onClick={() => removeItemData(removeItem)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmClearAllItems} onClose={() => handleClearAllItems(false)}>
        <DialogTitle>{"Are you sure?"}</DialogTitle>
        <DialogContent style={{ minWidth: "300px" }}>
          <DialogContentText>
            Are you sure you want to delete all Items ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClearAllItems(false)}>No</Button>
          <Button onClick={() => handleClearAllItems(true)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={modalCancelOpen} onClose={() => handleCancelPRModal(false)}>
        <DialogTitle>{"Are you sure?"}</DialogTitle>
        <DialogContent style={{ minWidth: "300px" }}>
          <DialogContentText>
            Do you want to cancel this pr? Unsaved changes will be lost.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Enter reason *"
            type="text"
            fullWidth
            value={cancelReason}
            onChange={handleCancelInputChange}
            error={Boolean(prerror)} // Show error state
            helperText={prerror} // Display error message
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCancelPRModal(false)}>No</Button>
          <Button onClick={() => handleCancelPRModal(true)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Modal
        show={purchaseOrgModal}
        backdrop="static"
        keyboard={false}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        dialogClassName="modal-custom-mdlg"
        onHide={() => ClosePurcgaseOrgModal()}
      >
        <Modal.Body className="p-0 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
            <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Purchase Organization</span>
            <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => ClosePurcgaseOrgModal()}>
              <HiOutlineX className="f20" />
            </button>
          </div>
          <div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
            <PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={purchaseOrgGrpModal}
        backdrop="static"
        keyboard={false}
        dialogClassName="modal-custom-mdlg"
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={() => ClosePurcgaseOrgGrpModal()}
      >
        <Modal.Body className="p-0 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white flex-shrink-0">
            <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Purchase Group</span>
            <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => ClosePurcgaseOrgGrpModal()}>
              <HiOutlineX className="f20" />
            </button>
          </div>
          <div className="p-3 flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
            <PurchaseOrgGrp isModal />
          </div>
        </Modal.Body>
      </Modal>
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