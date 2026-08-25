import React, { useCallback, useEffect, useState } from 'react';
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import {
  Autocomplete, FormControl, FormControlLabel,
  Radio, RadioGroup, TextField, Tooltip,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { HiTrash } from 'react-icons/hi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PEModal from '../../../components/PEModal';
import { PETable } from '../../../components/RFQ/PETable';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import { useCookies } from 'react-cookie';
import CommonTooltip from '../../../components/commonTooltip';
import { actionTypes, useStateValue } from '../../../store';
import { bidlist, formatDateViaLocale, getRFQManageFind, } from '../../../utils/common/utility';
import {
  AuctionModalFromRFQ, eventMultiCurrencyList,
  findObjListByValueFromArray, getPayloadWithStage,
  invitedSupplierForAuction, pullMessageCount,
  fetchAttachmentsFromPRItems, handlesaveAttachment,
  getApiErrorMessage,
} from '../../../utils/common';
import FilterRFQCell from './FilterRFQCell';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { ApiClient } from '../../../Apiclient';
import NotFoundPage from '../../../components/NotAllowed';
import { PETableToolbar } from '../../../components/RFQ/PETableToolbar';
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';
import StatusBadge from '../../../components/StatusBadge';

const RFQStatusBadge = ({ status }) => <StatusBadge status={status || '—'} />;

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
  const [rawRecordData, setRawRecordData] = useState([]);
  const [gridloading, setGridloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

  const applyRoleFilter = (result) => {
    if (accessLevel?.list?.created?.toLowerCase()?.trim() === 'none') {
      return result.filter((x) => x.stage && x.stage !== 'Draft');
    }
    return result;
  };

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
      const list = Array.isArray(res) ? res : (res?.result ?? []);
      if (list.length > 0) {
        const filtered = applyRoleFilter(list);
        setRawRecordData(filtered);
        setRecorddata(filtered);
      } else {
        setRawRecordData([]);
        setRecorddata([]);
      }
    }).catch((err) => {
      setGridloading(false);
      toast.error(getApiErrorMessage(err), { toastId: 'rfq_manage_find_error' });
    });
  };

  useEffect(() => { pullRFQManageFind(); }, [atoken, customerid]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

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

    // Text search (debounced)
    if (debouncedSearchText.trim()) {
      const q = debouncedSearchText.toLowerCase();
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
  }, [debouncedSearchText, recorddata.length]);

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

  const [filterValues, setFilterValues] = useState({});

  const handleFilterList = (res) => {
    const filtered = applyRoleFilter(Array.isArray(res) ? res : []);
    setRecorddata(filtered);
  };
  const clearFilterList = () => {
    if (rawRecordData.length > 0) {
      setRecorddata(rawRecordData);
    } else {
      pullRFQManageFind();
    }
    setFilterModel({ items: [] });
    setTempFilterItems([emptyFilterItem()]);
  };

  /* ── RFQ → Auction logic (unchanged from ManageRFQ) ── */
  const [selectedPRITemModal, setSelectedPRItemModal] = useState([]);
  const [selectedItemsActive, setSelectedItemsActive] = useState([]);
  const [firstRfq, setFirstRFQ] = useState(null);
  const [selectedBidType, setSelectedBidType] = useState(null);
  const [rfqprcartmodal, setRFQPRcartmodal] = useState(false);
  const [noQuotesMessage, setNoQuotesMessage] = useState('');
  const [rfqItemSet, setRFQItemSet] = useState([]);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [rfqVendorInvitedList, setRfqVendorInvitedList] = useState([]);
  const [rfqMultiCurrencyList, setrfqMultiCurrencyList] = useState([]);
  const [action, setAction] = useState(false);
  const [itemmodal, setItemModal] = useState(false);

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

        const isBoqRequired = selectedRfqId?.boqReq === true;

        if (isBoqRequired) {
          setSelectedPRItemModal([]);
          setNoQuotesMessage("Auctions cannot be created for RFQs containing BOQ items. Please select a different RFQ.");
        } else {
          // Only allow item selection if at least one vendor has submitted a quote
          const hasClosedVendor = invitedVendors.some(
            (vendor) => vendor?.status !== 'Open' && vendor?.isTermsAccepted === 'Y'
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
        }

        setFirstRFQ(hydratedRFQ);
      }
    }
  };

  const prepareItemsForBidType = (auctionType) => {
    setSelectedBidType(auctionType);
    setRFQItemSet((prev) => prev.map((item) => buildAuctionItemForBidType(item, auctionType)));
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
      valueGetter: (params) => {
        // Combine all searchable text for this column
        const subject = params?.row?.subject || '';
        const rfqSubject = params?.row?.rfqSubject || '';
        const id = params?.row?.id || '';
        const eventCode = params?.row?.eventCode || '';
        return `${rfqSubject} ${subject} ${id} ${eventCode}`.trim();
      },
      renderCell: (params) => (
        <div className="rfq-v2-cell" onClick={() => goToRFQ(params.row)}>
          <CommonTooltip title={params.row.subject || params.row.rfqSubject || ''} placement="bottom">
            <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {params.row.subject || params.row.rfqSubject}
            </span>
          </CommonTooltip>
          <span className="rfq-v2-cell-code">
            <span> RFQ ID: {params?.row.id}</span>  <span> | Event Code: {params?.row.eventCode}</span>
          </span>
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

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const payload = {
        RFQId: filterValues.RFQId || 0,
        eventCode: filterValues.eventCode || '',
        Subject: filterValues.Subject || debouncedSearchText || '',
        Status: filterValues.Stage || '',
        StartDate: filterValues.StartDate ?? null,
        EndDate: filterValues.EndDate ?? null,
        PurchOrgId: filterValues.PurchOrgId || 0,
        PurchGrpId: filterValues.PurchGrpId || 0,
      };
      const res = await apiClient.api.post('/api/RFQManage/ExportRFQExcel', payload, {
        headers: { Authorization: `Bearer ${atoken}` },
        responseType: 'blob',
      });
      if (res?.data) {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/octet-stream' }));
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = res.headers?.['content-disposition'];
        let fileName = `RFQ_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) fileName = match[1].replace(/['"]/g, '');
        }
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'rfq_export_error' });
    } finally {
      setIsExporting(false);
    }
  };


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
          <PETableToolbar
            searchText={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="Search RFQ..."
            showFilter
            filterColumns={FILTER_COLUMNS}
            filterModel={filterModel}
            onFilterModelChange={(m) => { setFilterModel(m); setActiveFilterCount(m.items.length); }}
            showColumns
            columns={[
              { field: 'rfqSubject', headerName: 'RFQ' },
              { field: 'stage', headerName: 'Status' },
              { field: 'startDate', headerName: 'Start Date' },
              { field: 'endDate', headerName: 'End Date' },
              { field: 'createdByName', headerName: 'Created by' },
              { field: 'Action', headerName: 'Action' },
            ]}
            hiddenAlways={[]}
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            onColumnVisibilityReset={() => setColumnVisibility({ rfqSubject: true, stage: true, startDate: true, endDate: true, createdByName: true, Action: true })}
            showAdvFilter
            advFilterOpen={advFilterOpen}
            onAdvFilterToggle={() => setAdvFilterOpen(v => !v)}
            advFilterCount={advFilterOpen ? 1 : 0}
            advFilterPanel={(
              <FilterRFQCell
                handleFilterList={handleFilterList}
                clearFilterList={clearFilterList}
                setFilterValues={setFilterValues}
              />
            )}
            showExport
            onExport={handleExportToExcel}
            exportLoading={isExporting}
          />

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
                  {debouncedSearchText ? 'Try adjusting your search.' : 'Create your first RFQ to get started.'}
                </p>
              </div>
            ) : (
              <PETable
                className="rfq-v2-datagrid"
                rows={filteredData}
                columns={columns}
                getRowId={(row) => row.id}
                pagination
                columnVisibilityModel={columnVisibility}
                disableColumnResize
                disableColumnMenu={false}
                pageSizeOptions={[10, 25, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Create RFQ modal ── */}
      <PEModal
        open={modal}
        onClose={() => setModal(false)}
        disableBackdropClose={true}
        size="sm"
        title="What would you like to do?"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setModal(false)}>Cancel</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={handleTemplateNavigation}>Continue</button>
          </>
        }
      >
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
      </PEModal>

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
            <PETable
              rows={selectedPRITemModal}
              columns={prrfqcolumn}
              pageSize={10}
              checkboxSelection
              onRowSelectionModelChange={(ids) => selectItemsById(ids)}
              rowSelectionModel={selectedItemsActive}
              rowHeight={36}
              columnHeaderHeight={36}
              className="rfq-v2-event-datagrid"
              isRowSelectable={(params) => {
                const row = params?.row;
                if (row?.eventType === 'PR') return true;
                return !row?.eventId;
              }}
              sx={{ '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-columnHeaderTitle': { fontSize: 12, fontWeight: 600 } }}
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
            <PETable
              getRowId={(row) => `${row.rfqId}-${row.id}`}
              rows={Array.from(rfqItemSet)}
              columns={prauctioncolumn}
              rowHeight={36}
              columnHeaderHeight={36}
              className="rfq-v2-event-datagrid"
              sx={{ '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-columnHeaderTitle': { fontSize: 12, fontWeight: 600 } }}
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
