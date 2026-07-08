import React, { useCallback, useEffect, useState } from 'react';
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  AddOutlined,
  FilterListOutlined,
  FileDownloadOutlined,
  KeyboardArrowDownOutlined,
  SearchOutlined,
  TuneOutlined,
  ViewColumnOutlined,
} from '@mui/icons-material';
import { HiOutlineX, HiTrash } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Modal } from 'react-bootstrap';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import { useCookies } from 'react-cookie';
import CommonTooltip from '../../../components/commonTooltip';
import { actionTypes, useStateValue } from '../../../store';
import {
  bidlist,
  formatDateViaLocale,
  getRFQManageFind,
} from '../../../utils/common/utility';
import {
  AuctionModalFromRFQ,
  eventMultiCurrencyList,
  findObjListByValueFromArray,
  getPayloadWithStage,
  invitedSupplierForAuction,
  pullMessageCount,
  fetchAttachmentsFromPRItems,
  handlesaveAttachment,
} from '../../../utils/common';
import FilterRFQCell from './FilterRFQCell';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { ApiClient } from '../../../Apiclient';
import NotFoundPage from '../../../components/NotAllowed';
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';

/* ── Status badge colour map ── */
const STATUS_CFG = {
  Draft: { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' },
  Cancel: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  'Pre Approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
  'Under Pre Approval': { bg: '#fef9c3', color: '#713f12', dot: '#ca8a04' },
  'Technical Approval': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  'Under Technical Approval': { bg: '#ecfdf5', color: '#065f46', dot: '#34d399' },
  'Commercial Approval': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  'Under Commercial Approval': { bg: '#ede9fe', color: '#4c1d95', dot: '#7c3aed' },
  Published: { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  Closed: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' },
};

const STATUS_CFG_NORMALIZED = {
  draft: { bg: '#eeeeee', color: '#374151', dot: '#9ca3af' },
  cancel: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  open: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'pre approval': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
  'under pre approval': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
  'forward for approval': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
  'technical approval': { bg: '#dcfce7', color: '#065f46', dot: '#10b981' },
  'under technical approval': { bg: '#dcfce7', color: '#065f46', dot: '#10b981' },
  'commercial approval': { bg: '#dff2ff', color: '#075985', dot: '#0284c7' },
  'under commercial approval': { bg: '#dff2ff', color: '#075985', dot: '#0284c7' },
  allocation: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
  allocated: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
  awarded: { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
  published: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  closed: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' },
  rejected: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  approved: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
};

const getStatusConfig = (status) => {
  const key = String(status || '').trim().toLowerCase();
  return STATUS_CFG_NORMALIZED[key] || STATUS_CFG[status] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
};

const RFQStatusBadge = ({ status }) => {
  const c = getStatusConfig(status);
  return (
    <span className="rfq-v2-status-badge" style={{ background: c.bg, color: c.color }} title={status || ''}>
      <span className="rfq-v2-status-dot" style={{ background: c.dot }} />
      {status || '—'}
    </span>
  );
};

/* ── Stages where "Create Event" action is available ── */
const CAN_CREATE_EVENT = (stage) =>
  !['Draft', 'Under Pre Approval', 'Cancel', null, undefined].includes(stage);

const AUCTION_TYPES = [
  { label: 'Forward Auction', bidTypeId: 1 },
  { label: 'Reverse Auction', bidTypeId: 2 },
  { label: 'Freight Auction', bidTypeId: 3 },
  { label: 'Formula Based Auction', bidTypeId: 4 },
  { label: 'French Forward Auction', bidTypeId: 5 },
  { label: 'French Reverse Auction', bidTypeId: 6 },
];

const EXPORT_COLUMNS = [
  { field: 'id', label: 'RFQ ID', getValue: (row) => row?.id ?? '' },
  { field: 'eventCode', label: 'RFQ Code', getValue: (row) => row?.eventCode || '' },
  { field: 'rfqSubject', label: 'RFQ Subject', getValue: (row) => row?.subject || row?.rfqSubject || '' },
  { field: 'stage', label: 'Status', getValue: (row) => row?.stage || '' },
  { field: 'startDate', label: 'Start Date', getValue: (row, userDetail) => row?.startDate ? formatDateViaLocale(row.startDate, userDetail) : '' },
  { field: 'endDate', label: 'End Date', getValue: (row, userDetail) => row?.endDate ? formatDateViaLocale(row.endDate, userDetail) : '' },
  { field: 'createdByName', label: 'Created by', getValue: (row) => row?.createdByName || '' },
];

const escapeCsvValue = (value) => {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const normalizeRFQDetailResult = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.result)) return result.result;
  return result ? [result] : [];
};

/* ═══════════════════════════════════════════════════════════ */
const ManageRFQV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const broadcastChannel = new BroadcastChannel('auth_logout');

  const [
    { atoken, customerid, userDetail, customersuffix, eventType, roleClaims },
    dispatch,
  ] = useStateValue();
  const [cookies, setCookie] = useCookies(['patkn', 'prtkn', 'pcbt']);
  const apiClient = new ApiClient(customersuffix);

  /* ── Permissions ── */
  const [isreadDisabled, setIsReadDisabled] = useState(true);
  const [iscreateDisabled, setIsCreateDisabled] = useState(true);
  const [iseditDisabled, setIsEditDisabled] = useState(true);
  const [accessLevel, setAccessLevel] = useState('');

  useEffect(() => {
    dispatch({ type: actionTypes.SET_Bidtype, value: null });
    setCookie('pcbt', '', { path: '/', maxAge: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetail, atoken]);

  useEffect(() => {
    if (roleClaims?.length > 0) {
      const obj = findObjListByValueFromArray(roleClaims, claimType, 'claimType', 'RFQ');
      obj ? setAccessLevel(obj) : setAccessLevel('');
    }
  }, [roleClaims]);

  /* ── Table data ── */
  const [recorddata, setRecorddata] = useState([]);
  const [gridloading, setGridloading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

  const pullRFQManageFind = () => {
    if (!isreadDisabled) { setRecorddata([]); return; }
    const data = {
      CustomerId: customerid,
      SortingColumn: 'Id',
      PageNumber: 1,
      PageSize: 1000,
    };
    setGridloading(true);
    getRFQManageFind(data, atoken).then((res) => {
      setGridloading(false);
      if (res?.length > 0) {
        if (accessLevel?.list?.created?.toLowerCase().trim() === 'none') {
          setRecorddata(res.filter((x) => x.status && x.status !== 'Draft'));
        } else {
          setRecorddata(res);
        }
      }
    });
  };

  useEffect(() => { pullRFQManageFind(); }, [atoken, customerid]);

  /* ── Filter popover state — MUST be declared before filteredData ── */
  const [filterAnchor, setFilterAnchor] = useState(null);
  const filterPopoverRef = React.useRef(null);

  // MUI DataGrid filterModel — drives the DataGrid's built-in column filtering
  const [filterModel, setFilterModel] = useState({ items: [] });

  // Temp state inside the popover (before Apply)
  const FILTER_COLUMNS = [
    { field: 'rfqSubject', label: 'RFQ Subject' },
    { field: 'stage', label: 'Status' },
    { field: 'startDate', label: 'Start Date' },
    { field: 'endDate', label: 'End Date' },
    { field: 'createdByName', label: 'Created By' },
  ];
  const FILTER_OPERATORS = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];

  const _filterIdRef = React.useRef(0);
  const emptyFilterItem = () => ({ id: ++_filterIdRef.current, field: 'rfqSubject', operator: 'contains', value: '' });
  const [tempFilterItems, setTempFilterItems] = useState([emptyFilterItem()]);

  const applyFilter = () => {
    const validItems = tempFilterItems.filter(
      (f) => f.operator === 'isEmpty' || f.operator === 'isNotEmpty' || (f.value && f.value.trim())
    );
    setFilterModel({ items: validItems });
    setFilterAnchor(null);
  };

  const resetFilter = () => {
    setFilterModel({ items: [] });
    setTempFilterItems([emptyFilterItem()]);
    setFilterAnchor(null);
  };

  /* ── Client-side filter helper ── */
  const getFieldValue = (row, field) => {
    switch (field) {
      case 'rfqSubject': return (row?.subject || row?.rfqSubject || '').toLowerCase();
      case 'stage': return (row?.stage || row?.status || '').toLowerCase();
      case 'createdByName': return (row?.createdByName || '').toLowerCase();
      case 'startDate': return row?.startDate ? formatDateViaLocale(row.startDate, userDetail).toLowerCase() : '';
      case 'endDate': return row?.endDate ? formatDateViaLocale(row.endDate, userDetail).toLowerCase() : '';
      default: return String(row?.[field] ?? '').toLowerCase();
    }
  };

  const matchesOperator = (cellVal, operator, filterVal) => {
    const v = filterVal.toLowerCase().trim();
    switch (operator) {
      case 'contains': return cellVal.includes(v);
      case 'equals': return cellVal === v;
      case 'startsWith': return cellVal.startsWith(v);
      case 'endsWith': return cellVal.endsWith(v);
      case 'isEmpty': return !cellVal;
      case 'isNotEmpty': return !!cellVal;
      default: return cellVal.includes(v);
    }
  };

  /* Filter active records — search text + applied filterModel items */
  const filteredData = (() => {
    let data = recorddata;

    // Applied column filters
    if (filterModel.items.length > 0) {
      data = data.filter((row) =>
        filterModel.items.every((item) => {
          const cellVal = getFieldValue(row, item.field);
          const needsValue = item.operator !== 'isEmpty' && item.operator !== 'isNotEmpty';
          if (needsValue && !item.value?.trim()) return true; // skip empty filter rows
          return matchesOperator(cellVal, item.operator, item.value || '');
        })
      );
    }

    // Text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      data = data.filter((row) =>
        (row?.subject || row?.rfqSubject || '').toLowerCase().includes(q) ||
        (row?.eventCode || '').toLowerCase().includes(q) ||
        String(row?.id).includes(q)
      );
    }

    return data;
  })();

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchText, recorddata.length]);

  /* ── Advance filter panel ── */
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  const [colMenuAnchor, setColMenuAnchor] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState({
    rfqSubject: true, stage: true, startDate: true,
    endDate: true, createdByName: true, Action: true,
  });
  const colPopoverRef = React.useRef(null);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Keep activeFilterCount in sync with filterModel
  useEffect(() => {
    setActiveFilterCount(filterModel.items.length);
  }, [filterModel]);

  const handleFilterList = (res) => {
    if (accessLevel?.list?.created?.toLowerCase().trim() === 'none') {
      setRecorddata(res.filter((x) => x.status && x.status !== 'Draft'));
    } else {
      setRecorddata(res);
    }
  };
  const clearFilterList = () => {
    pullRFQManageFind();
    setFilterModel({ items: [] });
    setTempFilterItems([emptyFilterItem()]);
  };

  /* ── RFQ → Auction logic (unchanged from ManageRFQ) ── */
  const [selectedPRITemModal, setSelectedPRItemModal] = useState([]);
  const [selectedItemsActive, setSelectedItemsActive] = useState([]);
  const [firstRfq, setFirstRFQ] = useState(null);
  const [showAuctionDropdown, setShowAuctionDropdown] = useState(false);
  const [selectedBidType, setSelectedBidType] = useState(null);
  const [rfqprcartmodal, setRFQPRcartmodal] = useState(false);
  const [noQuotesMessage, setNoQuotesMessage] = useState('');
  const [rfqItemSet, setRFQItemSet] = useState([]);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [rfqVendorInvitedList, setRfqVendorInvitedList] = useState([]);
  const [rfqMultiCurrencyList, setrfqMultiCurrencyList] = useState([]);
  const [action, setAction] = useState(false);
  const [itemmodal, setItemModal] = useState(false);

  const rfqPrCartOpenModal = () => { setAction(true); setRFQPRcartmodal(true); };
  const rfqPrCartCloseModal = () => { setAction(false); setRFQPRcartmodal(false); };

  const handleDeleteItemSet = (itemId) =>
    setRFQItemSet((prev) => prev.filter((item) => item.id !== itemId));

  const buildAuctionItemForBidType = (item, auctionType) => {
    if (!auctionType?.bidTypeId) return item;

    const isForward = auctionType.bidTypeId === 1 || auctionType.bidTypeId === 5;
    const priceBase = isForward ? item.maxPrice : item.minPrice;

    return {
      ...item,
      bidStartprice: priceBase,
      minimumdecreament: priceBase ? parseFloat((priceBase * 0.01).toFixed(3)) : 0,
    };
  };

  const handleRFQItemSet = (selectedItems, unselectedItems) => {
    setRFQItemSet((prev) => {
      let next = [...prev];
      selectedItems.forEach((ni) => {
        if (!next.find((i) => i.id === ni.id && i.rfqId === ni.rfqId)) {
          next.push(buildAuctionItemForBidType(ni, selectedBidType));
        }
      });
      return next.filter((i) => !unselectedItems.some((u) => u.id === i.id && u.rfqId === i.rfqId));
    });
  };

  const selectItemsById = (ids) => {
    const selectedIds = Array.isArray(ids) ? ids : Array.from(ids || []);
    const sel = selectedPRITemModal.filter((o) => selectedIds.includes(o.id));
    const unsel = selectedPRITemModal.filter((o) => !selectedIds.includes(o.id));
    setSelectedItemsActive(selectedIds);
    handleRFQItemSet(sel, unsel);
  };

  const pullLineItemList = async (id, rowFallback = null) => {
    const fallbackRFQ = rowFallback || recorddata?.find((x) => Number(x?.id) === Number(id)) || null;
    if (fallbackRFQ) {
      setFirstRFQ(fallbackRFQ);
    }
    const queryParams = buildQueryParams({ Id: id });
    const res = await apiClient.getres(`api/RFQManage/FindById?${queryParams}`, atoken);
    if (res) {
      const data = normalizeRFQDetailResult(res?.data);
      const selectedRfqId = data.find((x) => Number(x?.id) === Number(id)) ?? data[0] ?? null;
      const invitedVendors = Array.isArray(selectedRfqId?.rfqVendorInvited)
        ? selectedRfqId.rfqVendorInvited
        : [];
      const rfqParameters = Array.isArray(selectedRfqId?.rfqParameters)
        ? selectedRfqId.rfqParameters
        : [];

      setRfqVendorInvitedList(invitedVendors);
      setrfqMultiCurrencyList(selectedRfqId?.multicurrencytList || []);

      if (selectedRfqId) {
        const hydratedRFQ = {
          ...fallbackRFQ,
          ...selectedRfqId,
          eventCode: selectedRfqId.eventCode || fallbackRFQ?.eventCode,
          subject: selectedRfqId.subject || fallbackRFQ?.subject || fallbackRFQ?.rfqSubject,
        };
        const selectedItems = rfqParameters.map((item) => ({
          ...item,
          rfqId: hydratedRFQ.id ?? id ?? 0,
          rfqSubject: hydratedRFQ.subject,
          rfqDescription: hydratedRFQ.description,
          rfqTermandCondition: hydratedRFQ.termandCondition,
          rfqPurchOrgId: hydratedRFQ.purchOrgId,
          rfqPurchGrpId: hydratedRFQ.purchGrpId,
          rfqIsMultiCurrency: hydratedRFQ.isMultiCurrency,
        }));

        // Only allow item selection if at least one vendor has submitted a quote
        const hasClosedVendor = invitedVendors.some(
          (vendor) => vendor?.status !== 'Open' && vendor?.isTermsAccepted == 'Y'
        );

        if (hasClosedVendor) {
          setSelectedPRItemModal(selectedItems);
          setSelectedItemsActive(
            selectedItems
              .filter((item) => rfqItemSet.some((existing) => existing.id === item.id && existing.rfqId === item.rfqId))
              .map((item) => item.id)
          );
          setNoQuotesMessage(selectedItems.length ? '' : 'No line items available for this RFQ.');
        } else {
          setSelectedPRItemModal([]);
          setNoQuotesMessage('None of the vendors have quoted. Cannot proceed.');
        }

        setFirstRFQ(hydratedRFQ);
      }
    }
  };

  const prepareItemsForBidType = (auctionType) => {
    setSelectedBidType(auctionType);
    setRFQItemSet((prev) => prev.map((item) => buildAuctionItemForBidType(item, auctionType)));
  };

  const handleAuctionTypeSelection = (auctionType) => {
    prepareItemsForBidType(auctionType);
    rfqPrCartOpenModal();
  };

  const createAuctionFromPR = async () => {
    const rfqItem = Array.from(rfqItemSet);
    if (rfqItem.length === 0) {
      toast.info('Please select at least one line item to create auction.', { position: 'top-center', autoClose: 2000 });
      return;
    }
    const firstItem = rfqItem[0];
    const activeRFQ = recorddata?.find((x) => x.id === firstItem.rfqId) || firstRfq;
    const data = {
      subject: activeRFQ?.subject, description: activeRFQ?.description,
      bidSubTypeId: 81, bidClosingType: 'A', showRankToVendor: 'Y',
      maximumExtension: -1, extensionDuration: 2, hideVendor: false, hidePrice: false,
      baseCurrency: userDetail?.defaultCurrency || 'INR',
      tnC: activeRFQ?.termandCondition, bidTypeID: selectedBidType?.bidTypeId,
      stage: 'Draft', bidStDate: new Date(), bidEndDate: new Date(), bidDuration: 0,
      configureDate: new Date(), prebid: false, quotesinWords: false, rankToVendorPost: false,
      noOfStaggerItems: 0,
      multicurrencytList: eventMultiCurrencyList(rfqMultiCurrencyList) || [],
      isMultiCurrency: activeRFQ?.isMultiCurrency || false,
      createdById: userDetail?.id, createdByName: userDetail?.name,
      customerId: userDetail?.customerId,
      bidParamater: AuctionModalFromRFQ(rfqItem, userDetail),
      bidVendorInvited: invitedSupplierForAuction(rfqVendorInvitedList),
    };
    const statedata = { EventType: 'Auction', CustomerId: customerid, EventId: 0, OrgId: activeRFQ?.purchOrgId, OrgGroupId: activeRFQ?.purchGrpId };
    const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${buildQueryParams(statedata)}`, atoken);
    const payload = getPayloadWithStage('currentStage', 'Draft', stagelist?.data?.result, data, 'currentStage', firstRfq?.purchOrgId, firstRfq?.purchGrpId);
    const res = await apiClient.postres('/api/AuctionManage/Add', payload, atoken);
    if (res) {
      const id = res.data;
      try {
        const atts = await fetchAttachmentsFromPRItems(rfqItem, 'Auction', atoken, customerid);
        if (atts?.length > 0) {
          await handlesaveAttachment(atts.map((a) => ({ ...a, eventId: id, createdById: userDetail?.id, createdByName: userDetail?.name })), id, atoken);
        }
      } catch { }
      const bidTypeMap = { 1: 'Forward Auction', 2: 'Reverse Auction', 3: 'Freight Auction', 4: 'Formula Based Auction', 5: 'French Forward Auction', 6: 'French Reverse Auction' };
      const selectedBid = Object.values(bidlist).find((i) => i.bidTypeName === bidTypeMap[selectedBidType?.bidTypeId]);
      if (selectedBid) {
        dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
        setCookie('pcbt', CryptoJS.AES.encrypt(JSON.stringify(selectedBid), process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(), { path: '/', maxAge: 86400 });
        navigate(`/configuration/manage-auction/${id}`);
      } else { toast.error('Please contact Administrator.'); }
      toast.success('Auction created successfully.');
    }
  };

  const handleEventDrawerSubmit = () => {
    if (!selectedBidType?.bidTypeId) {
      toast.info('Please select event type.', { position: 'top-center', autoClose: 2000 });
      return;
    }
    setItemModal(false);
    createAuctionFromPR();
  };

  /* ── Communication hub ── */
  useEffect(() => {
    const data = new URLSearchParams(location.search).get('CommId')?.trim();
    if (data) dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
  }, []);

  useEffect(() => {
    if (userDetail?.id) {
      pullMessageCount({ UserId: userDetail.id, EventType: eventType, IsVenderYN: 'N', atoken, dispatch });
    }
  }, [userDetail, atoken, eventType, dispatch]);

  /* ── Create RFQ modal ── */
  const [modal, setModal] = useState(false);
  const [value, setValue] = useState('new');
  const [templatelist, setTemplateList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const getTemplateList = async () => {
    const res = await apiClient.getres(`/api/EventTemplate/Find?${buildQueryParams({ CustomerId: customerid, EventType: 'RFQ' })}`, atoken);
    if (res) setTemplateList(res?.data?.result);
  };

  const handleTemplateNavigation = useCallback(async () => {
    if (value !== 'new') {
      const res = await apiClient.postres(`/api/RFQManage/RFQTemplateClone?${buildQueryParams({ EventId: selectedTemplate?.eventId, EventType: selectedTemplate?.eventType })}`, null, atoken);
      if (res) navigate(`/configuration/manage-rfq/${res?.data[0]?.id}`);
    } else {
      navigate('/configuration/manage-rfq/add');
    }
  }, [selectedTemplate, value]);

  /* ── Row navigate helper ── */
  const goToRFQ = (row) => {
    if (!iseditDisabled) return;
    navigate(
      row.activityId
        ? `/configuration/manage-rfq/${row.id}?ActivityId=${row.activityId}`
        : `/configuration/manage-rfq/${row.id}`
    );
  };

  /* ── DataGrid columns ── */
  const columns = [
    {
      field: 'rfqSubject',
      headerName: 'RFQ',
      flex: 2.2,
      minWidth: 180,
      sortable: true,
      valueGetter: (params) =>
        `${params?.row?.rfqSubject || ''} ${params?.row?.subject || ''} ${params?.row?.id || ''} ${params?.row?.eventCode || ''}`.trim(),
      renderCell: (params) => (
        <div className="rfq-v2-cell" onClick={() => goToRFQ(params.row)}>
          <span className="rfq-v2-cell-code">
            {params.row.eventCode ? params.row.eventCode : `RFQ ID: ${params.row.id}`}
          </span>
          <CommonTooltip title={params.row.subject || params.row.rfqSubject || ''} placement="bottom">
            <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {params.row.subject || params.row.rfqSubject}
            </span>
          </CommonTooltip>
        </div>
      ),
    },
    {
      field: 'stage',
      headerName: 'Status',
      flex: 1.1,
      minWidth: 140,
      sortable: true,
      valueGetter: (params) => params?.row?.stage || '',
      renderCell: (params) => (
        <div onClick={() => goToRFQ(params.row)} style={{ cursor: 'pointer' }}>
          <RFQStatusBadge status={params.row.stage} />
        </div>
      ),
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 1,
      minWidth: 120,
      sortable: true,
      valueGetter: (params) => params?.row?.startDate ? formatDateViaLocale(params.row.startDate, userDetail) : '',
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => goToRFQ(params.row)}>
          {params.row.startDate ? formatDateViaLocale(params.row.startDate, userDetail) : '—'}
        </span>
      ),
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 1,
      minWidth: 120,
      sortable: true,
      valueGetter: (params) => params?.row?.endDate ? formatDateViaLocale(params.row.endDate, userDetail) : '',
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => goToRFQ(params.row)}>
          {params.row.endDate ? formatDateViaLocale(params.row.endDate, userDetail) : '—'}
        </span>
      ),
    },
    {
      field: 'createdByName',
      headerName: 'Created by',
      flex: 1,
      minWidth: 130,
      sortable: true,
      valueGetter: (params) => params?.row?.createdByName || '',
      renderCell: (params) => (
        <CommonTooltip title={params.row.createdByName || ''} placement="bottom">
          <span className="rfq-v2-text-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} onClick={() => goToRFQ(params.row)}>
            {params.row.createdByName || '—'}
          </span>
        </CommonTooltip>
      ),
    },
    {
      field: 'Action',
      headerName: 'Action',
      flex: 0.9,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => {
        if (!CAN_CREATE_EVENT(params.row.stage)) return null;
        const itemsFromThisRFQ = rfqItemSet.filter((x) => x.rfqId === params.row.id);
        const anyItemsSelected = rfqItemSet.length > 0;

        if (!anyItemsSelected) {
          return (
            <button
              className="rfq-v2-action-link"
              onClick={() => { setItemModal(true); pullLineItemList(params.row.id, params.row); }}
            >
              <AddOutlined /> Create Event
            </button>
          );
        }

        // Some items are already selected — all eligible rows show "Add Item"
        return (
          <button
            className="rfq-v2-action-link"
            onClick={() => { setItemModal(true); pullLineItemList(params.row.id, params.row); }}
          >
            <AddOutlined />
            {itemsFromThisRFQ.length > 0
              ? `Add Items (${itemsFromThisRFQ.length})`
              : 'Add Items'}
          </button>
        );
      },
    },
  ];

  /* columns for items modal */
  const prrfqcolumn = [
    { field: 'itemCode', headerName: 'Item Code', flex: 1, minWidth: 120, renderCell: (p) => <CommonTooltip title={p.formattedValue} placement="bottom"><span className="rfq-v2-text-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.formattedValue}</span></CommonTooltip> },
    { field: 'itemName', headerName: 'Item / Service', flex: 1, minWidth: 180, renderCell: (p) => <CommonTooltip title={p.formattedValue} placement="bottom"><span className="rfq-v2-text-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.formattedValue}</span></CommonTooltip> },
    { field: 'quantity', headerName: 'Qty / UOM', flex: 1, minWidth: 120, renderCell: (p) => <span className="rfq-v2-text-cell">{`${p.formattedValue} (${p.row?.uom || ''})`}</span> },
    { field: 'targetPrice', headerName: 'Target Price', flex: 1, minWidth: 100, renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span> },
    { field: 'plant', headerName: 'Delivery Location', flex: 1, minWidth: 180, renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span> },
  ];

  const prauctioncolumn = [
    { field: 'rfqId', headerName: 'RFQ Id', flex: 1, minWidth: 120, renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span> },
    { field: 'itemName', headerName: 'Item / Service', flex: 1, minWidth: 180, renderCell: (p) => <CommonTooltip title={p.formattedValue} placement="bottom"><span className="rfq-v2-text-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.formattedValue}</span></CommonTooltip> },
    { field: 'quantity', headerName: 'Quantity', flex: 1, minWidth: 120, renderCell: (p) => <span className="rfq-v2-text-cell">{`${p.formattedValue} (${p.row?.uom || ''})`}</span> },
    {
      field: 'minimumdecreament',
      headerName: (selectedBidType?.bidTypeId === 1 || selectedBidType?.bidTypeId === 5) ? 'Min Increment' : 'Min Decrement',
      flex: 1, minWidth: 130, renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span>,
    },
    { field: 'bidStartprice', headerName: 'Start Unit Price', flex: 1, minWidth: 120, renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span> },
    { field: 'targetPrice', headerName: 'Target Price', flex: 1, minWidth: 100, renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span> },
    action && {
      field: 'Action', headerName: 'Action', flex: 0.6, minWidth: 70,
      renderCell: (p) => (
        <Tooltip title="Remove Item">
          <HiTrash className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteItemSet(p.id)} />
        </Tooltip>
      ),
    },
  ].filter(Boolean);

  const handleExportRFQs = useCallback(() => {
    if (!filteredData.length) {
      toast.info('No RFQ data available to export.', { toastId: 'rfq_export_empty' });
      return;
    }

    const exportColumns = EXPORT_COLUMNS.filter((column) => columnVisibility[column.field] !== false);
    if (!exportColumns.length) {
      toast.info('Please enable at least one column to export.', { toastId: 'rfq_export_no_columns' });
      return;
    }

    const csvRows = [
      exportColumns.map((column) => escapeCsvValue(column.label)).join(','),
      ...filteredData.map((row) =>
        exportColumns
          .map((column) => escapeCsvValue(column.getValue(row, userDetail)))
          .join(',')
      ),
    ];

    const csvContent = `\uFEFF${csvRows.join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `manage-rfq-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [columnVisibility, filteredData, userDetail]);

  useEffect(() => {
    if (!colMenuAnchor) return;
    const handleClickOutside = (e) => {
      if (colPopoverRef.current && !colPopoverRef.current.contains(e.target)) {
        setColMenuAnchor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colMenuAnchor]);

  // Click-outside for filter popover
  useEffect(() => {
    if (!filterAnchor) return;
    const handleClickOutside = (e) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target)) {
        setFilterAnchor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterAnchor]);

  /* ── Guard: not authorised ── */
  if (!isreadDisabled) {
    return (
      <NotFoundPage
        heading="You Are Not Authorized To View List"
        body1="Contact your Administrator for view rights"
      />
    );
  }

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <>
      <div className="rfq-v2-page">

        {/* ── Page header ── */}
        <div className="rfq-v2-page-header">
          <div className="rfq-v2-breadcrumb">
            <Link to="/app">Home</Link>
            <span className="rfq-v2-breadcrumb-sep">/</span>
            <span>Request for Quotation</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="rfq-v2-create-btn"
              onClick={() => setModal(true)}
              disabled={!iscreateDisabled}
            >
              <AddOutlined /> Create new RFQ
            </button>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="rfq-v2-card">

          {/* ── Toolbar ── */}
          <div className="rfq-v2-toolbar">
            {/* Search */}
            <div className="rfq-v2-search-wrapper">
              <input
                className="rfq-v2-search"
                placeholder="Search RFQ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <SearchOutlined className="rfq-v2-search-icon" />
            </div>

            {/* Right buttons */}
            <div className="rfq-v2-toolbar-right">
              {/* ── Filter popover (status checkboxes) ── */}
              <div style={{ position: 'relative' }}>
                <button
                  className="rfq-v2-tbtn"
                  onClick={(e) => setFilterAnchor(filterAnchor ? null : e.currentTarget)}
                >
                  <FilterListOutlined />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="rfq-v2-filter-count">{activeFilterCount}</span>
                  )}
                </button>

                {filterAnchor && (
                  <div className="rfq-v2-col-popover rfq-v2-filter-popover" ref={filterPopoverRef}>
                    {/* Header */}
                    <div className="rfq-v2-col-popover-header">
                      <span className="rfq-v2-col-popover-title">
                        <FilterListOutlined className="rfq-v2-col-title-icon" />
                        Filters
                      </span>
                      <button className="rfq-v2-col-reset" onClick={resetFilter}>Reset</button>
                    </div>

                    {/* Filter rows */}
                    <div className="rfq-v2-filter-rows">
                      {tempFilterItems.map((item, idx) => (
                        <div key={item.id} className="rfq-v2-filter-row-item">
                          {/* Column */}
                          <select
                            className="rfq-v2-filter-select"
                            value={item.field}
                            onChange={(e) => setTempFilterItems(prev =>
                              prev.map((f, i) => i === idx ? { ...f, field: e.target.value } : f)
                            )}
                          >
                            {FILTER_COLUMNS.map((c) => (
                              <option key={c.field} value={c.field}>{c.label}</option>
                            ))}
                          </select>

                          {/* Operator */}
                          <select
                            className="rfq-v2-filter-select"
                            value={item.operator}
                            onChange={(e) => setTempFilterItems(prev =>
                              prev.map((f, i) => i === idx ? { ...f, operator: e.target.value } : f)
                            )}
                          >
                            {FILTER_OPERATORS.map((op) => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>

                          {/* Value — hidden for isEmpty/isNotEmpty */}
                          {item.operator !== 'isEmpty' && item.operator !== 'isNotEmpty' && (
                            <input
                              type="text"
                              className="rfq-v2-filter-value-input"
                              placeholder="Filter value"
                              value={item.value}
                              onChange={(e) => setTempFilterItems(prev =>
                                prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f)
                              )}
                            />
                          )}

                          {/* Remove row */}
                          {tempFilterItems.length > 1 && (
                            <button
                              className="rfq-v2-filter-remove-btn"
                              onClick={() => setTempFilterItems(prev => prev.filter((_, i) => i !== idx))}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add filter row + Apply */}
                    <div className="rfq-v2-filter-popover-footer">
                      <button
                        className="rfq-v2-filter-add-btn"
                        onClick={() => setTempFilterItems(prev => [...prev, emptyFilterItem()])}
                      >
                        + Add filter
                      </button>
                      <button className="rfq-v2-filter-apply-btn" onClick={applyFilter}>
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="rfq-v2-tbtn"
                onClick={() => setAdvFilterOpen((v) => !v)}
              >
                <TuneOutlined />
                Advance Filter
                {advFilterOpen && (
                  <span className="rfq-v2-filter-count">1</span>
                )}
              </button>

              <div style={{ position: 'relative' }}>
                <button className="rfq-v2-tbtn" onClick={(e) => setColMenuAnchor(colMenuAnchor ? null : e.currentTarget)}>
                  <ViewColumnOutlined />
                  Columns
                  {Object.values(columnVisibility).some(v => !v) && (
                    <span className="rfq-v2-filter-count">{Object.values(columnVisibility).filter(v => !v).length}</span>
                  )}
                </button>
                {colMenuAnchor && (
                  <div className="rfq-v2-col-popover" ref={colPopoverRef}>
                    <div className="rfq-v2-col-popover-header">
                      <span className="rfq-v2-col-popover-title">
                        <ViewColumnOutlined className="rfq-v2-col-title-icon" />
                        Manage Columns
                      </span>
                      <button className="rfq-v2-col-reset" onClick={() => setColumnVisibility({ rfqSubject: true, stage: true, startDate: true, endDate: true, createdByName: true, Action: true })}>Reset</button>
                    </div>
                    {[
                      { field: 'rfqSubject', label: 'RFQ' },
                      { field: 'stage', label: 'Status' },
                      { field: 'startDate', label: 'Start Date' },
                      { field: 'endDate', label: 'End Date' },
                      { field: 'createdByName', label: 'Created by' },
                      { field: 'Action', label: 'Action' },
                    ].map(col => (
                      <label key={col.field} className="rfq-v2-col-item">
                        <input
                          type="checkbox"
                          className="rfq-v2-col-check"
                          checked={!!columnVisibility[col.field]}
                          onChange={() => setColumnVisibility(prev => ({ ...prev, [col.field]: !prev[col.field] }))}
                        />
                        <span className="rfq-v2-col-label">{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="rfq-v2-tbtn rfq-v2-tbtn-export"
                onClick={handleExportRFQs}
                disabled={!filteredData.length}
              >
                <FileDownloadOutlined />
                Export
                <KeyboardArrowDownOutlined className="export-chevron" />
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="rfq-v2-table-wrapper">
            {gridloading ? (
              <div style={{ padding: 20 }}>
                <GridSkeleton />
              </div>
            ) : filteredData.length === 0 && !gridloading ? (
              <div className="rfq-v2-empty">
                <p className="rfq-v2-empty-title">No RFQs found</p>
                <p className="rfq-v2-empty-sub">
                  {searchText ? 'Try adjusting your search.' : 'Create your first RFQ to get started.'}
                </p>
              </div>
            ) : (
              <DataGrid
                className="rfq-v2-datagrid"
                rows={filteredData}
                columns={columns}
                getRowId={(row) => row.id}
                rowHeight={52}
                columnHeaderHeight={40}
                pagination
                disableRowSelectionOnClick
                columnVisibilityModel={columnVisibility}
                disableColumnResize
                disableColumnMenu={false}
                hideFooterSelectedRowCount
                pageSizeOptions={[10, 25, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                /* filterModel removed — all filtering done client-side in filteredData */
                sx={{
                  border: 'none',
                  flex: 1,
                  minHeight: 0,
                  height: '100%',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  '& .MuiDataGrid-columnHeaders': {
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    minHeight: '40px !important',
                    maxHeight: '40px !important',
                    lineHeight: '40px',
                  },
                  '& .MuiDataGrid-columnHeadersInner': {
                    background: '#f9fafb',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    height: '40px !important',
                    padding: '0 16px',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6b7280',
                    textTransform: 'none',
                    letterSpacing: 0,
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: 13,
                    color: '#1f2937',
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& .MuiDataGrid-cell--withRenderer': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& .MuiDataGrid-row:hover': { background: '#f8fafc' },
                  '& .MuiDataGrid-row.Mui-selected': { background: '#eff6ff' },
                  '& .MuiDataGrid-row.Mui-selected:hover': { background: '#eff6ff' },
                  '& .MuiDataGrid-columnSeparator': { visibility: 'hidden' },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #e5e7eb',
                    minHeight: 44,
                    padding: '0 8px',
                    flexShrink: 0,
                  },
                  '& .MuiDataGrid-sortIcon': { color: '#9ca3af', opacity: 1 },
                  '& .MuiDataGrid-menuIconButton': { color: '#9ca3af', opacity: 1 },
                  '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
                  '& .MuiTablePagination-root': { fontSize: 12, color: '#6b7280' },
                  '& .MuiTablePagination-selectLabel': { fontSize: 12, color: '#6b7280', margin: 0 },
                  '& .MuiTablePagination-displayedRows': { fontSize: 12, color: '#6b7280', margin: 0 },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Advance Filter slide-in panel ── */}
      {advFilterOpen && (
        <div className="rfq-v2-filter-panel">
          <div className="rfq-v2-filter-panel-header">
            <h3 className="rfq-v2-filter-panel-title">Advance Search</h3>
            <button
              className="rfq-v2-filter-panel-close"
              onClick={() => setAdvFilterOpen(false)}
              aria-label="Close"
            >
              <HiOutlineX size={16} />
            </button>
          </div>
          <div className="rfq-v2-filter-panel-body">
            <FilterRFQCell
              handleFilterList={handleFilterList}
              clearFilterList={clearFilterList}
            />
          </div>
        </div>
      )}

      {/* ── Create RFQ modal ── */}
      <Modal
        show={modal}
        backdrop="static"
        keyboard={false}
        className="zindex10002 rfq-create-modal"
        backdropClassName="zindex10002"
        centered
        contentClassName="border-0 rounded-default"
        onHide={() => setModal(false)}
      >
        <Modal.Header className="pt-2 pb-2">
          <Modal.Title>
            <span style={{ fontSize: 14 }}>What would you like to do?</span>
          </Modal.Title>
          <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => setModal(false)}>
            <HiOutlineX style={{ fontSize: 16 }} />
          </button>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <FormControl>
              <RadioGroup
                defaultValue="new"
                name="new-rfq"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                <FormControlLabel value="new" control={<Radio size="small" />} label="Create a New RFQ" />
                <FormControlLabel value="template" control={<Radio size="small" />} label="Select From Template" />
              </RadioGroup>
            </FormControl>

            {value === 'template' && (
              <div className="mt-3">
                <label className="pe-field-label">Select Template</label>
                <Autocomplete
                  disablePortal
                  size="small"
                  fullWidth
                  className="w-100 f14"
                  options={templatelist ?? []}
                  getOptionLabel={(o) => o.templateTitle ?? ''}
                  renderInput={(params) => (
                    <TextField {...params} InputLabelProps={{ shrink: true }} />
                  )}
                  onChange={(_, v) => setSelectedTemplate(v)}
                  onOpen={() => { if (!templatelist.length) getTemplateList(); }}
                />
              </div>
            )}

            <div className="col-12 mt-4 d-flex justify-content-end gap-2">
              <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setModal(false)}>Cancel</button>
              <button type="button" className="pe-btn pe-btn--primary" onClick={handleTemplateNavigation}>Continue</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Select items modal (RFQ → Event) ── */}
      <CommonBottomDrawer
        open={itemmodal}
        titleId="rfq-v2-event-drawer-title"
        title="Create Event"
        actions={<>
          <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setItemModal(false)}>Cancel</button>
          <button type="button" className="pe-btn pe-btn--secondary" onClick={() => setItemModal(false)}>
            <AddOutlined style={{ fontSize: 16 }} />
            Add more items
          </button>
          <button type="button" className="pe-btn pe-btn--primary" onClick={handleEventDrawerSubmit}>
            Submit ({rfqItemSet.length})
          </button>
        </>}
      >
        <div className="rfq-v2-event-form-row">
          <label className="rfq-v2-event-field">
            <span className="rfq-v2-event-label">Select Event type</span>
            <select
              className="rfq-v2-event-select"
              value={selectedBidType?.bidTypeId || ''}
              onChange={(e) => {
                const auctionType = AUCTION_TYPES.find((o) => o.bidTypeId === Number(e.target.value));
                if (auctionType) prepareItemsForBidType(auctionType);
              }}
            >
              <option value="">Select event type</option>
              {AUCTION_TYPES.map((o) => (
                <option key={o.bidTypeId} value={o.bidTypeId}>{o.label}</option>
              ))}
            </select>
          </label>

          <div className="rfq-v2-event-total">
            <span className="rfq-v2-event-label">Total Items added</span>
            <span className="rfq-v2-event-count">{rfqItemSet.length}</span>
          </div>
        </div>

        <div className="rfq-v2-event-selection-head">
          <span className="rfq-v2-event-section-label">Select Items</span>
          <span className="rfq-v2-event-rfq-meta">
            {firstRfq?.eventCode || (firstRfq?.id ? `RFQ-${firstRfq.id}` : 'RFQ-')}
            {firstRfq?.subject || firstRfq?.rfqSubject ? ` ${firstRfq?.subject || firstRfq?.rfqSubject}` : ''}
          </span>
        </div>

        <div className="rfq-v2-event-table">
          {selectedPRITemModal.length > 0 ? (
            <DataGrid
              rows={selectedPRITemModal}
              columns={prrfqcolumn}
              pageSize={10}
              checkboxSelection
              onRowSelectionModelChange={(ids) => selectItemsById(ids)}
              rowSelectionModel={selectedItemsActive}
              rowHeight={36}
              columnHeaderHeight={36}
              className="rfq-v2-event-datagrid"
              disableRowSelectionOnClick
              isRowSelectable={(params) => {
                const row = params?.row;
                if (row?.eventType === 'PR') return true;
                return !row?.eventId;
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { fontSize: 12 },
                '& .MuiDataGrid-columnHeaderTitle': { fontSize: 12, fontWeight: 600 },
              }}
            />
          ) : (
            <div className="rfq-v2-event-empty">
              {noQuotesMessage || 'No quotes available. You cannot select any line items.'}
            </div>
          )}
        </div>
      </CommonBottomDrawer>

      {/* ── Floating selection summary box ── */}
      {rfqItemSet.length > 0 && (
        <div className="rfq-v2-float-box">
          <div className="rfq-v2-float-info">
            <div className="rfq-v2-float-field">
              <span className="rfq-v2-float-label">Event type</span>
              <span className="rfq-v2-float-value">
                {selectedBidType?.label || <span className="rfq-v2-float-placeholder">Not selected</span>}
              </span>
            </div>
            <div className="rfq-v2-float-divider" />
            <div className="rfq-v2-float-field">
              <span className="rfq-v2-float-label">Total Items</span>
              <span className="rfq-v2-float-count-badge">{rfqItemSet.length}</span>
            </div>
          </div>
          <div className="rfq-v2-float-actions">
            <button
              className="rfq-v2-float-view-btn"
              onClick={() => setRFQPRcartmodal(true)}
            >
              View Event ({rfqItemSet.length})
            </button>
            <button
              className="rfq-v2-float-discard-btn"
              onClick={() => setDiscardConfirmOpen(true)}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Discard confirmation dialog ── */}
      {discardConfirmOpen && (
        <div className="rfq-v2-discard-backdrop">
          <div className="rfq-v2-discard-dialog">
            <div className="rfq-v2-discard-header">
              <span className="rfq-v2-discard-title">Discard Items?</span>
              <button type="button" className="rfq-v2-discard-close" onClick={() => setDiscardConfirmOpen(false)}>×</button>
            </div>
            <div className="rfq-v2-discard-body">
              <div className="rfq-v2-discard-info">
                <p>
                  You have <strong>{rfqItemSet.length} item{rfqItemSet.length !== 1 ? 's' : ''}</strong> selected for <strong>{selectedBidType?.label || 'event'}</strong>. Discarding will clear your entire selection.
                </p>
              </div>
              <div className="rfq-v2-discard-field">
                <label className="rfq-v2-discard-label">
                  Comment <span className="rfq-v2-discard-label-opt">(Optional)</span>
                </label>
                <textarea className="rfq-v2-discard-textarea" rows={4} placeholder="Add a reason for discarding..." />
                <p className="rfq-v2-discard-hint">This comment is for your reference only.</p>
              </div>
            </div>
            <div className="rfq-v2-discard-footer">
              <button type="button" className="rfq-v2-discard-btn-cancel" onClick={() => setDiscardConfirmOpen(false)}>Cancel</button>
              <button type="button" className="rfq-v2-discard-btn-confirm" onClick={() => { setRFQItemSet([]); setDiscardConfirmOpen(false); }}>Yes, Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auction cart drawer (bottom, same style as create-event drawer) ── */}
      <CommonBottomDrawer
        open={rfqprcartmodal}
        titleId="rfq-v2-cart-drawer-title"
        title={selectedBidType?.label ? `Create ${selectedBidType.label} From RFQ` : 'Create Event From RFQ'}
        actions={<>
          <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted" onClick={rfqPrCartCloseModal}>Cancel</button>
          <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-primary" onClick={createAuctionFromPR}>Submit ({rfqItemSet.length})</button>
        </>}
      >
        <div className="rfq-v2-event-form-row">
          <div className="rfq-v2-event-total">
            <span className="rfq-v2-event-label">Event type</span>
            <span className="rfq-v2-event-count">
              {selectedBidType?.label || '—'}
            </span>
          </div>
          <div className="rfq-v2-event-total">
            <span className="rfq-v2-event-label">Total Items selected</span>
            <span className="rfq-v2-event-count">{rfqItemSet.length}</span>
          </div>
        </div>

        <div className="rfq-v2-event-selection-head">
          <span className="rfq-v2-event-section-label">Selected Items</span>
        </div>

        <div className="rfq-v2-event-table">
          {rfqItemSet.length > 0 ? (
            <DataGrid
              getRowId={(row) => `${row.rfqId}-${row.id}`}
              rows={Array.from(rfqItemSet)}
              columns={prauctioncolumn}
              rowHeight={36}
              columnHeaderHeight={36}
              className="rfq-v2-event-datagrid"
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { fontSize: 12 },
                '& .MuiDataGrid-columnHeaderTitle': { fontSize: 12, fontWeight: 600 },
              }}
            />
          ) : (
            <div className="rfq-v2-event-empty">No items selected yet.</div>
          )}
        </div>
      </CommonBottomDrawer>
    </>
  );
};

export default ManageRFQV2;
