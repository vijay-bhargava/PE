import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Autocomplete, FormControl, FormControlLabel,
  Radio, RadioGroup, TextField, Tooltip,
} from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import { useCookies } from 'react-cookie';

import { actionTypes, useStateValue } from '../../../store';
import { ApiClient } from '../../../Apiclient';
import { getPRManageFind } from '../../../utils/purchaseRequest';
import {
  bidlist, buildQueryParams,
  formatDateViaLocale, getEventApproversFind,
} from '../../../utils/common/utility';
import {
  AuctionModalFromPR, RFQModalFromPR, getPayloadWithStage,
  handlesaveAttachment, fetchAttachmentsFromPRItems, getApiErrorMessage,
} from '../../../utils/common';

import { PETable } from '../../../components/RFQ/PETable';
import { PETableToolbar } from '../../../components/RFQ/PETableToolbar';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import StatusBadge from '../../../components/StatusBadge';
import PEModal from '../../../components/PEModal';
import CommonBottomDrawer from '../../../components/CommonBottomDrawer';
import CommonTooltip from '../../../components/commonTooltip';
import FilterPRCell from './FilterPRCell';
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';

/* ── Pending approver tooltip (lazy-loaded on hover) ── */
const PendingApproverTooltip = ({ getApprovers, children }) => {
  const [approvers, setApprovers] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = async () => {
    if (approvers !== null || loading) return;
    setLoading(true);
    try {
      const list = await getApprovers();
      setApprovers(list);
    } catch {
      setApprovers([]);
    } finally {
      setLoading(false);
    }
  };

  const tooltipTitle = loading
    ? 'Loading approvers...'
    : approvers?.length
      ? `Pending: ${approvers.map((a) => a.approverName || a.name || '').join(', ')}`
      : 'Under Approval';
  return (
    <Tooltip title={tooltipTitle} arrow placement="top" onOpen={handleOpen}>
      <span style={{ display: 'contents' }}>{children}</span>
    </Tooltip>
  );
};

const PRStatusBadge = ({ status }) => <StatusBadge status={status || '—'} />;

const AUCTION_TYPES = [
  { label: 'Forward Auction', bidTypeId: 1 },
  { label: 'Reverse Auction', bidTypeId: 2 },
  { label: 'Freight Auction', bidTypeId: 3 },
  { label: 'Formula Based Auction', bidTypeId: 4 },
  { label: 'French Forward Auction', bidTypeId: 5 },
  { label: 'French Reverse Auction', bidTypeId: 6 },
];

const ManagePRV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const [{ atoken, customerid, userDetail, customersuffix }, dispatch] = useStateValue();
  const [, setCookie] = useCookies(['patkn', 'prtkn', 'pcbt']);
  const apiClient = new ApiClient(customersuffix);

  /* ── Table data ── */
  const [recorddata, setRecorddata] = useState([]);
  const [rawRecordData, setRawRecordData] = useState([]);
  const [gridloading, setGridloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const pullPRManageFind = () => {
    const data = { CustomerId: customerid, SortingColumn: 'Id', PageNumber: 1, PageSize: 1000 };
    setGridloading(true);
    getPRManageFind(data, atoken, 1, 1000)
      .then((res) => {
        setGridloading(false);
        const list = res?.result ?? [];
        setRawRecordData(list);
        setRecorddata(list);
      })
      .catch((err) => {
        setGridloading(false);
        toast.error(getApiErrorMessage(err), { toastId: 'pr_manage_find_error' });
      });
  };

  useEffect(() => {
    dispatch({ type: actionTypes.SET_EVENTID, value: 0 });
    dispatch({ type: actionTypes.SET_EVENTTYPE, value: '' });
    dispatch({ type: actionTypes.SET_Bidtype, value: null });
    setCookie('pcbt', '', { path: '/', maxAge: 0 });
  }, [userDetail, atoken]);

  useEffect(() => { pullPRManageFind(); }, [atoken, customerid]);

  /* ── Debounced search ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  /* ── Column filter model ── */
  const [filterModel, setFilterModel] = useState({ items: [] });

  const getFieldValue = (row, field) => {
    switch (field) {
      case 'prSubject': return (row?.prSubject || '').toLowerCase();
      case 'stage': return (row?.stage || '').toLowerCase();
      case 'createdByName': return (row?.createdByName || '').toLowerCase();
      case 'prNumber': return (row?.prNumber || '').toLowerCase();
      default: return String(row?.[field] ?? '').toLowerCase();
    }
  };

  const matchesOperator = (cellVal, operator, filterVal) => {
    const v = (filterVal || '').toLowerCase().trim();
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

  /* ── Filtered data (client-side) ── */
  const filteredData = (() => {
    let data = recorddata;
    if (filterModel.items.length > 0) {
      data = data.filter((row) =>
        filterModel.items.every((item) => {
          const cellVal = getFieldValue(row, item.field);
          const needsValue = item.operator !== 'isEmpty' && item.operator !== 'isNotEmpty';
          if (needsValue && !item.value?.trim()) return true;
          return matchesOperator(cellVal, item.operator, item.value || '');
        })
      );
    }
    if (debouncedSearchText.trim()) {
      const q = debouncedSearchText.toLowerCase();
      data = data.filter(
        (row) =>
          (row?.prSubject || '').toLowerCase().includes(q) ||
          (row?.prNumber || '').toLowerCase().includes(q) ||
          String(row?.id).includes(q)
      );
    }
    return data;
  })();

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearchText, recorddata.length]);

  /* ── Column visibility + density ── */
  const defaultVisibility = {
    prSubject: true, stage: true, createdOn: true, createdByName: true, requisitioner: true, Action: true,
  };
  const [columnVisibility, setColumnVisibility] = useState(defaultVisibility);
  const [density, setDensity] = useState('standard');
  const DENSITY_OPTIONS = [
    { key: 'compact', height: 36 },
    { key: 'standard', height: 48 },
    { key: 'comfortable', height: 60 },
  ];
  const rowHeight = DENSITY_OPTIONS.find((d) => d.key === density)?.height ?? 48;

  /* ── Advance filter ── */
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  const [filterActive, setFilterActive] = useState(false);

  const handleFilterList = (list) => {
    const safeList = Array.isArray(list) ? list : [];
    setRecorddata(safeList);
    setFilterActive(true);
    // clear client-side filters so server results are not masked
    setFilterModel({ items: [] });
    setSearchText('');
    setDebouncedSearchText('');
  };

  const clearFilterList = () => {
    setRecorddata(rawRecordData);
    setFilterActive(false);
    setFilterModel({ items: [] });
  };

  /* ── Export ── */
  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.api.post('/api/PRManage/ExportPRExcel',
        { prId: 0, subject: '', status: '', purchOrgId: 0, purchGrpId: 0 },
        { headers: { Authorization: `Bearer ${atoken}` }, responseType: 'blob' }
      );

      if (res?.data) {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/octet-stream' }));
        const link = document.createElement('a');
        link.href = url;
        const cd = res.headers?.['content-disposition'];
        let fileName = `PR_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
        if (cd) {
          const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match?.[1]) fileName = match[1].replace(/['"]/g, '');
        }
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'pr_export_error' });
    } finally {
      setIsExporting(false);
    }
  };

  /* ── Approver cache ── */
  const approverCacheRef = React.useRef(new Map());
  const getApproversForPR = useCallback(
    async (prId) => {
      try {
        if (approverCacheRef.current.has(prId)) return approverCacheRef.current.get(prId);
        const data = { EventId: prId, EventType: 'PR', CustomerId: customerid, Version: 1 };
        const res = await getEventApproversFind(data, atoken);
        const pending = Array.isArray(res) ? res.filter((a) => !a.status || a.status === 'Pending') : [];
        approverCacheRef.current.set(prId, pending);
        return pending;
      } catch { return []; }
    },
    [atoken, customerid]
  );

  /* ── Navigate to PR detail ── */
  const goToPR = (row) => navigate(`/configuration/manage-pr/${row.id}`);

  /* ── Main columns ── */
  const columns = [
    {
      field: 'prSubject',
      headerName: 'PR Subject',
      flex: 2.2,
      minWidth: 200,
      sortable: true,
      valueGetter: (params) =>
        `${params?.row?.prSubject || ''} ${params?.row?.id || ''} ${params?.row?.prNumber || ''}`.trim(),
      renderCell: (params) => (
        <div className="rfq-v2-cell" onClick={() => goToPR(params.row)} style={{ cursor: 'pointer' }}>
          <CommonTooltip title={params.row.prSubject || ''} placement="bottom">
            <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {params.row.prSubject}
            </span>
          </CommonTooltip>
          <span className="rfq-v2-cell-code">
            <span>PR ID: {params.row.id}</span>&nbsp;|&nbsp;
            <span>PR No: {params.row.prNumber}</span>
          </span>
        </div>
      ),
    },
    {
      field: 'stage',
      headerName: 'Status',
      flex: 1.1,
      minWidth: 150,
      sortable: true,
      valueGetter: (params) => params?.row?.stage || '',
      renderCell: (params) => {
        const badge = (
          <div onClick={() => goToPR(params.row)} style={{ cursor: 'pointer' }}>
            <PRStatusBadge status={params.row.stage} />
          </div>
        );
        if (params.row.stage === 'Under Approval') {
          return (
            <PendingApproverTooltip getApprovers={() => getApproversForPR(params.row.id)}>
              {badge}
            </PendingApproverTooltip>
          );
        }
        return badge;
      },
    },
    {
      field: 'createdOn',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 130,
      sortable: true,
      valueGetter: (params) =>
        params?.row?.createdOn ? formatDateViaLocale(params.row.createdOn, userDetail) : '',
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => goToPR(params.row)} style={{ cursor: 'pointer' }}>
          {params.row.createdOn ? formatDateViaLocale(params.row.createdOn, userDetail) : '—'}
        </span>
      ),
    },
    {
      field: 'createdByName',
      headerName: 'Created By',
      flex: 1,
      minWidth: 130,
      sortable: true,
      valueGetter: (params) => params?.row?.createdByName || '',
      renderCell: (params) => (
        <CommonTooltip title={params.row.createdByName || ''} placement="bottom">
          <span
            className="rfq-v2-text-cell"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
            onClick={() => goToPR(params.row)}
          >
            {params.row.createdByName || '—'}
          </span>
        </CommonTooltip>
      ),
    },
    {
      field: 'requisitioner',
      headerName: 'Requested By',
      flex: 1,
      minWidth: 130,
      sortable: true,
      valueGetter: (params) => params?.row?.requisitioner || '',
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => goToPR(params.row)} style={{ cursor: 'pointer' }}>
          {params.row.requisitioner || '—'}
        </span>
      ),
    },
    {
      field: 'Action',
      headerName: 'Action',
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        const { stage, boqReq } = params.row;
        const isNonSelectable = stage === 'Draft' || stage === 'Cancel' || stage === 'Under Approval';
        if (isNonSelectable) return null;
        return (
          <button
            className="rfq-v2-action-link"
            disabled={!!boqReq}
            onClick={() => openItemsDrawer(params.row)}
          >
            <AddOutlined style={{ fontSize: 14 }} />
            {stage === 'Close' || stage === 'Consumed' ? 'View Items' : 'Select Items'}
          </button>
        );
      },
    },
  ];

  /* ── Items drawer ── */
  const [itemModal, setItemModal] = useState(false);
  const [firstpr, setFirstPR] = useState(null);
  const [selectedPRITemModal, setSelectedPRItemModal] = useState([]);
  const [rfqItemSet, setRfqItemSet] = useState([]);
  const [selectedItemsActive, setSelectedItemsActive] = useState([]);
  const [selectedBidType, setSelectedBidType] = useState(null);
  const [prloader, setPRLoader] = useState(false);

  const openItemsDrawer = (row) => {
    const items = (row.prItems || []).map((item) => ({
      ...item,
      prNo: row.prNumber,
      prId: row.id,
      prSubject: row.prSubject,
      prDescription: row.prDescription,
      requisitioner: row.requisitioner,
      purchOrgId: row.purchOrgId,
      purchGrpId: row.purchGrpId,
    }));
    setSelectedPRItemModal(items);
    setFirstPR(row);
    setSelectedItemsActive(rfqItemSet.filter((i) => i.prId === row.id).map((i) => i.id));
    setItemModal(true);
  };

  const handleRFQItemSet = (selItems, unselItems) => {
    setRfqItemSet((prev) => {
      let next = [...prev];
      selItems.forEach((ni) => { if (!next.find((i) => i.id === ni.id)) next.push(ni); });
      return next.filter((i) => !unselItems.some((u) => u.id === i.id));
    });
  };

  const selectItemsById = (ids) => {
    const sel = selectedPRITemModal.filter((o) => ids.includes(o.id));
    const unsel = selectedPRITemModal.filter((o) => !ids.includes(o.id));
    setSelectedItemsActive(ids);
    handleRFQItemSet(sel, unsel);
  };

  const handleDeleteItemSet = (itemId) =>
    setRfqItemSet((prev) => prev.filter((i) => i.id !== itemId));

  /* Item selection columns */
  const prrfqcolumn = [
    {
      field: 'itemName', headerName: 'Item / Service', flex: 1.5, minWidth: 160,
      renderCell: (p) => (
        <CommonTooltip title={p.formattedValue || ''} placement="bottom">
          <span className="rfq-v2-text-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.formattedValue}</span>
        </CommonTooltip>
      ),
    },
    {
      field: 'itemCode', headerName: 'Item Code', flex: 1, minWidth: 120,
      renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span>,
    },
    {
      field: 'quantity', headerName: 'Qty / UOM', flex: 1, minWidth: 110,
      renderCell: (p) => <span className="rfq-v2-text-cell">{`${p.formattedValue || ''} (${p.row?.uom || ''})`}</span>,
    },
    {
      field: 'targetPrice', headerName: 'Target Budget Price', flex: 1, minWidth: 130,
      renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span>,
    },
    {
      field: 'deliveryDate', headerName: 'Delivery Date', flex: 1, minWidth: 120,
      renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue ? formatDateViaLocale(p.formattedValue, userDetail) : '—'}</span>,
    },
  ];

  /* Cart review columns */
  const prauctioncolumn = [
    {
      field: 'prNo', headerName: 'PR No', flex: 1, minWidth: 100,
      renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span>,
    },
    {
      field: 'itemName', headerName: 'Item / Service', flex: 1.5, minWidth: 160,
      renderCell: (p) => (
        <CommonTooltip title={p.formattedValue || ''} placement="bottom">
          <span className="rfq-v2-text-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.formattedValue}</span>
        </CommonTooltip>
      ),
    },
    {
      field: 'quantity', headerName: 'Qty / UOM', flex: 1, minWidth: 110,
      renderCell: (p) => <span className="rfq-v2-text-cell">{`${p.formattedValue || ''} (${p.row?.uom || ''})`}</span>,
    },
    {
      field: 'targetPrice', headerName: 'Target Budget Price', flex: 1, minWidth: 130,
      renderCell: (p) => <span className="rfq-v2-text-cell">{p.formattedValue}</span>,
    },
    {
      field: 'Action', headerName: 'Actions', width: 48, sortable: false,
      renderCell: (p) => (
        <Tooltip title="Remove" arrow>
          <button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => handleDeleteItemSet(p.id)}>✕</button>
        </Tooltip>
      ),
    },
  ];

  /* ── Create RFQ from PR ── */
  const createRFQfromPR = async () => {
    if (rfqItemSet.length === 0) { toast.error('Please select at least one line item.'); return; }
    setPRLoader(true);
    try {
      const firstItem = rfqItemSet[0];
      const activePR = recorddata?.find((x) => x.id === firstItem.prId) || firstpr;
      const data = {
        subject: activePR?.prSubject, description: activePR?.prDescription,
        requisitioner: activePR?.requisitioner, stage: 'Draft', startDate: null,
        endDate: new Date(), baseCurrency: userDetail?.defaultCurrency || 'INR',
        termandCondition: 'terms and condition', purchGrpId: activePR?.purchGrpId,
        purchOrgId: activePR?.purchOrgId, boqReq: activePR?.isBoq || activePR?.boqReq || false,
        Version: 1, createdById: userDetail?.id, createdByName: userDetail?.name,
        customerId: userDetail?.customerId, rfqParameters: RFQModalFromPR(rfqItemSet, userDetail),
        RFQVersionHistory: [{ version: 1, bidOpeningDate: null, autoOpenEnabled: false }],
      };
      const statedata = { EventType: 'RFQ', CustomerId: customerid, EventId: 0, OrgId: activePR?.purchOrgId, OrgGroupId: activePR?.purchGrpId };
      const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${buildQueryParams(statedata)}`, atoken);
      const payload = getPayloadWithStage('currentStage', 'Draft', stagelist?.data?.result, data, 'currentStage', firstpr?.purchOrgId, firstpr?.purchGrpId);
      const res = await apiClient.postres('/api/RFQManage/Add', payload, atoken);
      if (res) {
        const id = res.data;
        try {
          const atts = await fetchAttachmentsFromPRItems(rfqItemSet, 'RFQ', atoken, customerid);
          if (atts?.length > 0) {
            await handlesaveAttachment(atts.map((a) => ({ ...a, eventId: id, createdById: userDetail?.id, createdByName: userDetail?.name })), id, atoken);
          }
        } catch { }
        toast.success('RFQ created successfully.');
        navigate(`/configuration/manage-rfq/${id}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err), { toastId: 'create_rfq_error' });
    } finally {
      setPRLoader(false);
    }
  };

  /* ── Create Auction from PR ── */
  const createAuctionFromPR = async () => {
    if (rfqItemSet.length === 0) { toast.error('Please select at least one line item.'); return; }
    if (!selectedBidType?.bidTypeId) { toast.info('Please select an auction type.'); return; }
    setPRLoader(true);
    try {
      const firstItem = rfqItemSet[0];
      const activePR = recorddata?.find((x) => x.id === firstItem.prId) || firstpr;
      const data = {
        subject: activePR?.prSubject, description: activePR?.prDescription,
        bidSubTypeId: 81, bidClosingType: 'A', showRankToVendor: 'Y', maximumExtension: -1,
        extensionDuration: 2, hideVendor: false, hidePrice: false,
        baseCurrency: userDetail?.defaultCurrency || 'INR', bidTypeID: selectedBidType?.bidTypeId,
        tnC: 'terms and condition', stage: 'Draft', bidStDate: new Date(), bidEndDate: new Date(),
        bidDuration: 0, configureDate: new Date(), prebid: false, quotesinWords: false,
        rankToVendorPost: false, noOfStaggerItems: 0,
        boqReq: activePR?.isBoq || activePR?.boqReq || false,
        createdById: userDetail?.id, createdByName: userDetail?.name,
        customerId: userDetail?.customerId, bidParamater: AuctionModalFromPR(rfqItemSet, userDetail),
      };
      const statedata = { EventType: 'Auction', CustomerId: customerid, EventId: 0, OrgId: activePR?.purchOrgId, OrgGroupId: activePR?.purchGrpId };
      const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${buildQueryParams(statedata)}`, atoken);
      const payload = getPayloadWithStage('currentStage', 'Draft', stagelist?.data?.result, data, 'currentStage', firstpr?.purchOrgId, firstpr?.purchGrpId);
      const res = await apiClient.postres('/api/AuctionManage/Add', payload, atoken);
      if (res) {
        const id = res.data;
        try {
          const atts = await fetchAttachmentsFromPRItems(rfqItemSet, 'Auction', atoken, customerid);
          if (atts?.length > 0) {
            await handlesaveAttachment(atts.map((a) => ({ ...a, eventId: id, createdById: userDetail?.id, createdByName: userDetail?.name })), id, atoken);
          }
        } catch { }
        const bidTypeMap = { 1: 'Forward Auction', 2: 'Reverse Auction', 3: 'Freight Auction', 4: 'Formula Based Auction', 5: 'French Forward Auction', 6: 'French Reverse Auction' };
        const selectedBid = Object.values(bidlist).find((i) => i.bidTypeName === bidTypeMap[selectedBidType?.bidTypeId]);
        if (selectedBid) {
          dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
          setCookie('pcbt', CryptoJS.AES.encrypt(JSON.stringify(selectedBid), process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString(), { path: '/', maxAge: 86400 });
          toast.success('Auction created successfully.');
          navigate(`/configuration/manage-auction/${id}`);
        } else {
          toast.error('Please contact Administrator.');
        }
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err), { toastId: 'create_auction_error' });
    } finally {
      setPRLoader(false);
    }
  };

  const handleItemDrawerSubmit = () => {
    setItemModal(false);
    const isAuction = selectedBidType && AUCTION_TYPES.some((t) => t.bidTypeId === selectedBidType?.bidTypeId);
    if (isAuction) createAuctionFromPR();
    else createRFQfromPR();
  };

  /* ── Close PR modal ── */
  const [closePRModal, setClosePRModal] = useState(false);
  const [closePRFormData, setClosePRFormData] = useState({
    poNumber: '', vendorName: '', poValue: '', unitRate: '', poDate: '', closeDate: '', reason: '',
  });
  const [closePRLoading, setClosePRLoading] = useState(false);

  const closeClosePRModal = () => {
    setClosePRModal(false);
    setClosePRFormData({ poNumber: '', vendorName: '', poValue: '', unitRate: '', poDate: '', closeDate: '', reason: '' });
  };

  const handleClosePRSubmit = async () => {
    if (!closePRFormData.closeDate || !closePRFormData.reason.trim()) {
      toast.error('Please fill Close Date and Reason.');
      return;
    }
    const poFields = [closePRFormData.poNumber, closePRFormData.vendorName, closePRFormData.poValue, closePRFormData.unitRate, closePRFormData.poDate];
    const anyPOFilled = poFields.some((f) => f !== '');
    if (anyPOFilled && poFields.some((f) => f === '')) {
      toast.error('If any PO field is filled, all PO fields are required.');
      return;
    }
    setClosePRLoading(true);
    try {
      const selectedItems = selectedPRITemModal.filter((item) => selectedItemsActive.includes(item.id));
      const payload = {
        PrId: firstpr?.id ?? '',
        CustomerId: parseInt(customerid),
        PRLineItems: selectedItems.map((item) => ({ Id: item.id, ItemCode: item.itemCode ?? '' })),
        CloseDate: closePRFormData.closeDate,
        Reason: closePRFormData.reason,
        PONumber: closePRFormData.poNumber,
        VendorName: closePRFormData.vendorName,
        POValue: closePRFormData.poValue !== '' ? Number(closePRFormData.poValue) : 0,
        UnitRate: closePRFormData.unitRate !== '' ? Number(closePRFormData.unitRate) : 0,
        PODate: closePRFormData.poDate,
      };
      const res = await apiClient.postres('/api/PRItemService/closePRItems', payload, atoken);
      if (res && (res.status === 200 || res.status === 201)) {
        toast.success('PR items closed successfully.');
        closeClosePRModal();
        setItemModal(false);
        setRfqItemSet([]);
        pullPRManageFind();
      } else {
        toast.error('Failed to close PR items.');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setClosePRLoading(false);
    }
  };

  /* ── Create PR modal ── */
  const [modal, setModal] = useState(false);
  const [modalValue, setModalValue] = useState('new');
  const [templatelist, setTemplateList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const CloseModal = () => { setModal(false); setSelectedTemplate(null); setModalValue('new'); };

  const getTemplateList = async () => {
    try {
      const res = await apiClient.getres(`/api/EventTemplate/Find?${buildQueryParams({ CustomerId: customerid, EventType: 'PR' })}`, atoken);
      if (res) setTemplateList(res?.data?.result || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'getTemplateList_error' });
    }
  };

  const handleTemplateNavigation = async () => {
    try {
      if (modalValue !== 'new') {
        if (!selectedTemplate) { toast.error('Please select a template'); return; }
        const res = await apiClient.postres(
          `/api/PRManage/PRTemplateClone?${buildQueryParams({ EventId: selectedTemplate.eventId, EventType: selectedTemplate.eventType })}`,
          null, atoken
        );
        if (res) {
          const newPRId = res?.data?.[0]?.id;
          if (newPRId) { CloseModal(); navigate(`/configuration/manage-pr/${newPRId}`); }
          else toast.error('Failed to clone template.', { toastId: 'template_clone_failed' });
        }
      } else {
        CloseModal();
        navigate('/configuration/manage-pr/add');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: 'handleTemplateNavigation_error' });
    }
  };

  /* ── Discard confirm + cart drawer ── */
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [rfqprcartmodal, setRFQPRcartmodal] = useState(false);

  return (
    <>
      <div className="rfq-v2-page">

        {/* ── Page header ── */}
        <div className="rfq-v2-page-header">
          <div className="rfq-v2-breadcrumb">
            <Link to="/app">Home</Link>
            <span className="rfq-v2-breadcrumb-sep">/</span>
            <span>Purchase Requests</span>
          </div>
          <button className="rfq-v2-create-btn" onClick={() => { setModal(true); getTemplateList(); }}>
            <AddOutlined /> Create new PR
          </button>
        </div>

        {/* ── Main card ── */}
        <div className="rfq-v2-card">

          {/* ── Toolbar ── */}
          <PETableToolbar
            searchText={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="Search PR..."
            showFilter
            filterColumns={[
              { field: 'prSubject', label: 'PR Subject' },
              { field: 'stage', label: 'Status' },
              { field: 'createdByName', label: 'Created By' },
              { field: 'prNumber', label: 'PR Number' },
            ]}
            filterModel={filterModel}
            onFilterModelChange={(m) => setFilterModel(m)}
            showColumns
            columns={[
              { field: 'prSubject', headerName: 'Purchase Request' },
              { field: 'stage', headerName: 'Status' },
              { field: 'createdOn', headerName: 'Created Date' },
              { field: 'createdByName', headerName: 'Created By' },
              { field: 'requisitioner', headerName: 'Requested By' },
              { field: 'Action', headerName: 'Action' },
            ]}
            hiddenAlways={[]}
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            onColumnVisibilityReset={() => setColumnVisibility(defaultVisibility)}
            showDensity
            density={density}
            onDensityChange={setDensity}
            showAdvFilter
            advFilterOpen={advFilterOpen}
            onAdvFilterToggle={() => setAdvFilterOpen((v) => !v)}
            advFilterCount={filterActive ? 1 : 0}
            advFilterTitle="Advance Search"
            advFilterPanel={
              <FilterPRCell
                handleFilterList={handleFilterList}
                clearFilterList={clearFilterList}
              />
            }
            showExport
            onExport={handleExportToExcel}
            exportLoading={isExporting}
          />

          {/* ── Table ── */}
          <div className="rfq-v2-table-wrapper">
            {gridloading ? (
              <div style={{ padding: 20 }}><GridSkeleton /></div>
            ) : filteredData.length === 0 ? (
              <div className="rfq-v2-empty">
                <p className="rfq-v2-empty-title">No Purchase Requests found</p>
                <p className="rfq-v2-empty-sub">
                  {debouncedSearchText ? 'Try adjusting your search.' : 'Create your first PR to get started.'}
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
                pageSizeOptions={[10, 25, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowHeight={rowHeight}
                columnHeaderHeight={40}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Create PR modal ── */}
      <PEModal
        open={modal}
        onClose={CloseModal}
        disableBackdropClose
        size="sm"
        title="What would you like to do?"
        footer={
          <>
            <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={CloseModal}>Cancel</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={handleTemplateNavigation}>Continue</button>
          </>
        }
      >
        <FormControl>
          <RadioGroup value={modalValue} onChange={(e) => setModalValue(e.target.value)}>
            <FormControlLabel value="new" control={<Radio size="small" />} label="Create a New PR" />
            {templatelist?.length > 0 && (
              <FormControlLabel value="template" control={<Radio size="small" />} label="Select From Template" />
            )}
          </RadioGroup>
        </FormControl>
        {modalValue === 'template' && (
          <div className="mt-3">
            <label className="pe-field-label">Select Template</label>
            <Autocomplete
              disablePortal
              size="small"
              fullWidth
              options={templatelist ?? []}
              getOptionLabel={(o) => o.templateTitle ?? ''}
              renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} />}
              onChange={(_, v) => setSelectedTemplate(v)}
            />
          </div>
        )}
      </PEModal>

      {/* ── Select Items drawer (Create Event) ── */}
      <CommonBottomDrawer
        open={itemModal}
        titleId="pr-v2-event-drawer-title"
        title="Select Items"
        actions={
          <>
            <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={() => setItemModal(false)}>Cancel</button>
            <button
              type="button"
              className="pe-btn pe-btn--primary"
              onClick={handleItemDrawerSubmit}
              disabled={prloader || rfqItemSet.length === 0}
            >
              {prloader ? 'Processing...' : `Submit (${rfqItemSet.length})`}
            </button>
          </>
        }
      >
        {/* ── Event type + count row ── */}
        <div className="rfq-v2-event-form-row">
          <label className="rfq-v2-event-field">
            <span className="rfq-v2-event-label">Select Event type</span>
            <select
              className="rfq-v2-event-select"
              value={selectedBidType?.bidTypeId || 'rfq'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'rfq') setSelectedBidType(null);
                else {
                  const t = AUCTION_TYPES.find((o) => o.bidTypeId === Number(val));
                  if (t) setSelectedBidType(t);
                }
              }}
            >
              <option value="rfq">Create RFQ</option>
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

        {/* ── Section label + PR meta ── */}
        <div className="rfq-v2-event-selection-head">
          <span className="rfq-v2-event-section-label">Select Items</span>
          <span className="rfq-v2-event-rfq-meta">
            {firstpr?.prNumber || `PR-${firstpr?.id || ''}`}
            {firstpr?.prSubject ? ` — ${firstpr.prSubject}` : ''}
          </span>
        </div>

        {/* ── Items table ── */}
        <div className="rfq-v2-event-table">
          {selectedPRITemModal.length > 0 ? (
            <PETable
              rows={selectedPRITemModal}
              columns={prrfqcolumn}
              checkboxSelection
              onRowSelectionModelChange={(ids) => selectItemsById(ids)}
              rowSelectionModel={selectedItemsActive}
              rowHeight={36}
              columnHeaderHeight={36}
              className="rfq-v2-event-datagrid"
              sx={{ '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-columnHeaderTitle': { fontSize: 12, fontWeight: 600 } }}
            />
          ) : (
            <div className="rfq-v2-event-empty">No items available for this PR.</div>
          )}
        </div>

        {/* ── Close PR ── */}
        {selectedItemsActive.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid #e5e7eb' }}>
            <button type="button" className="pe-btn pe-btn--danger" onClick={() => setClosePRModal(true)}>
              Close Selected Items ({selectedItemsActive.length})
            </button>
          </div>
        )}
      </CommonBottomDrawer>

      {/* ── Cart review drawer ── */}
      <CommonBottomDrawer
        open={rfqprcartmodal}
        titleId="pr-v2-cart-drawer-title"
        title={selectedBidType?.label ? `Create ${selectedBidType.label} From PR` : 'Create RFQ From PR'}
        actions={
          <>
            <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted" onClick={() => setRFQPRcartmodal(false)}>Cancel</button>
            <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-primary" onClick={() => setDiscardConfirmOpen(true)}>Discard All</button>
          </>
        }
      >
        <div className="rfq-v2-event-form-row">
          <div className="rfq-v2-event-total">
            <span className="rfq-v2-event-label">Event type</span>
            <span className="rfq-v2-event-count">{selectedBidType?.label || 'RFQ'}</span>
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
              rows={rfqItemSet}
              columns={prauctioncolumn}
              getRowId={(r) => r.id}
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

      {/* ── Discard confirm ── */}
      <PEModal
        open={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        size="xs"
        title="Discard all selected items?"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setDiscardConfirmOpen(false)}>Cancel</button>
            <button
              type="button"
              className="pe-btn pe-btn--danger"
              onClick={() => { setRfqItemSet([]); setDiscardConfirmOpen(false); setRFQPRcartmodal(false); setSelectedBidType(null); }}
            >
              Discard
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: '#374151' }}>
          You have <strong>{rfqItemSet.length}</strong> item(s) selected. This will clear your entire selection.
        </p>
      </PEModal>

      {/* ── Close PR modal ── */}
      <PEModal
        open={closePRModal}
        onClose={closeClosePRModal}
        size="md"
        title="Close PR Items"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--ghost" onClick={closeClosePRModal}>Cancel</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={handleClosePRSubmit} disabled={closePRLoading}>
              {closePRLoading ? 'Closing...' : 'Close Items'}
            </button>
          </>
        }
      >
        <div className="row mt-2">
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Close Date *</label>
            <input type="date" className="form-control form-control-sm" value={closePRFormData.closeDate}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, closeDate: e.target.value }))} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Reason *</label>
            <input className="form-control form-control-sm" placeholder="Enter reason" value={closePRFormData.reason}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, reason: e.target.value }))} />
          </div>
          <div className="col-12 mb-2">
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>PO details (fill all or none)</p>
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">PO Number</label>
            <input className="form-control form-control-sm" placeholder="Enter PO number" value={closePRFormData.poNumber}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, poNumber: e.target.value }))} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Vendor Name</label>
            <input className="form-control form-control-sm" placeholder="Enter vendor name" value={closePRFormData.vendorName}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, vendorName: e.target.value }))} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">PO Value</label>
            <input type="number" className="form-control form-control-sm" placeholder="0" value={closePRFormData.poValue}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, poValue: e.target.value }))} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Unit Rate</label>
            <input type="number" className="form-control form-control-sm" placeholder="0" value={closePRFormData.unitRate}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, unitRate: e.target.value }))} />
          </div>
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">PO Date</label>
            <input type="date" className="form-control form-control-sm" value={closePRFormData.poDate}
              onChange={(e) => setClosePRFormData((p) => ({ ...p, poDate: e.target.value }))} />
          </div>
        </div>
      </PEModal>

      {/* ── Floating cart summary ── */}
      {rfqItemSet.length > 0 && (
        <div className="rfq-v2-float-box">
          <div className="rfq-v2-float-info">
            <div className="rfq-v2-float-field">
              <span className="rfq-v2-float-label">Event type</span>
              <span className="rfq-v2-float-value">{selectedBidType?.label || 'RFQ'}</span>
            </div>
            <div className="rfq-v2-float-divider" />
            <div className="rfq-v2-float-field">
              <span className="rfq-v2-float-label">Total Items</span>
              <span className="rfq-v2-float-count-badge">{rfqItemSet.length}</span>
            </div>
          </div>
          <div className="rfq-v2-float-actions">
            <button className="rfq-v2-float-view-btn" onClick={() => setRFQPRcartmodal(true)}>
              View Cart ({rfqItemSet.length})
            </button>
            <button className="rfq-v2-float-discard-btn" onClick={() => setDiscardConfirmOpen(true)}>
              Discard
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagePRV2;
