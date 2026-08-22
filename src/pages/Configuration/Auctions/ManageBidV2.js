import React, { useCallback, useEffect, useState } from 'react';
import {
  Autocomplete, FormControl, FormControlLabel,
  Radio, RadioGroup, TextField, Tooltip,
} from '@mui/material';
import {
  AddOutlined, FileDownloadOutlined, FilterListOutlined,
  KeyboardArrowDownOutlined, SearchOutlined, TuneOutlined, ViewColumnOutlined,
} from '@mui/icons-material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { HiOutlineX, HiPencilAlt } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import PEModal from '../../../components/PEModal';
import { actionTypes, useStateValue } from '../../../store';
import { bidlist, checkUTC, formatDateViaLocale, getAuctionManageFind } from '../../../utils/common/utility';
import CryptoJS from 'crypto-js';
import { useCookies } from 'react-cookie';
import { pullMessageCount } from '../../../utils/common';
import { ApiClient } from '../../../Apiclient';
import { toast } from 'react-toastify';
import * as signalR from '@microsoft/signalr';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import FilterAuctionCell from '../../BaseCells/FilterAuctionCell';
import { PETable } from '../../../components/RFQ/PETable';
import CommonTooltip from '../../../components/commonTooltip';
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';

/* ── Auction status badge colour map ── */
const AUCTION_STATUS_CFG = {
  draft: { bg: '#eeeeee', color: '#374151', dot: '#9ca3af' },
  cancel: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  open: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  running: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  paused: { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
  close: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' },
  closed: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' },
  awarded: { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
  allocation: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
  published: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  'under pre approval': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
  'pre approval': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
};

const getAuctionStatusConfig = (status) => {
  const key = String(status || '').trim().toLowerCase();
  return AUCTION_STATUS_CFG[key] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
};

const AuctionStatusBadge = ({ status }) => {
  const c = getAuctionStatusConfig(status);
  return (
    <span className="rfq-v2-status-badge" style={{ background: c.bg, color: c.color }} title={status || ''}>
      <span className="rfq-v2-status-dot" style={{ background: c.dot }} />
      {status || '—'}
    </span>
  );
};

const bidTypeMap = {
  1: 'Forward Auction',
  2: 'Reverse Auction',
  3: 'Freight Auction',
  4: 'Formula Based Auction',
  5: 'French Forward Auction',
  6: 'French Reverse Auction',
};

const EXPORT_COLUMNS = [
  { field: 'id', label: 'Auction ID', getValue: (row) => row?.id ?? '' },
  { field: 'bidsubject', label: 'Subject', getValue: (row) => row?.bidsubject || row?.subject || '' },
  { field: 'bidTypeID', label: 'Type', getValue: (row) => bidTypeMap[row?.bidTypeID] || '' },
  { field: 'stage', label: 'Status', getValue: (row) => row?.stage || '' },
  { field: 'bidStDate', label: 'Start Date', getValue: (row, userDetail) => row?.bidStDate ? formatDateViaLocale(row.bidStDate, userDetail) : '' },
  { field: 'bidEndDate', label: 'End Date', getValue: (row, userDetail) => row?.bidEndDate ? formatDateViaLocale(row.bidEndDate, userDetail) : '' },
  { field: 'createdByName', label: 'Created by', getValue: (row) => row?.createdByName || '' },
];

const escapeCsvValue = (value) => {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/* ═══════════════════════════════════════════════════════════ */
const ManageBidV2 = () => {
  const navigate = useNavigate();
  const [{ atoken, customerid, customersuffix, userDetail, eventType }, dispatch] = useStateValue();
  const [cookies, setCookie] = useCookies(['patkn', 'prtkn', 'pcbt']);
  const apiClient = new ApiClient(customersuffix);

  /* ── SignalR ── */
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_Bidtype, value: null });
    setCookie('pcbt', '', { path: '/', maxAge: 0 });
  }, [userDetail, atoken]);

  useEffect(() => {
    if (userDetail?.id) {
      pullMessageCount({ UserId: userDetail.id, EventType: eventType, IsVenderYN: 'N', atoken, dispatch });
    }
  }, [userDetail, atoken, eventType, dispatch]);

  useEffect(() => {
    const host = window.location.host;
    const cleanHost = host.split(':')[0];
    const tenant = cleanHost.split('.')[0];

    const connect = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_API_CALL}StatusHub/?CustomerId=${customerid}`, {
        accessTokenFactory: () => atoken,
        headers: { 'X-Tenant': tenant },
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connect.start()
      .then(() => { setConnection(connect); })
      .catch((err) => { console.error('SignalR connection failed:', err); });

    return () => { connect.stop(); };
  }, []);

  useEffect(() => {
    if (!connection) return;
    connection.on('AuctionStarted', (data) => {
      setRecorddata((prev) =>
        prev.map((q) => (q.id === parseInt(data) ? { ...q, stage: 'Running' } : q))
      );
    });
  }, [connection]);

  useEffect(() => {
    if (!connection) return;
    connection.on('AuctionClosed', (data) => {
      setRecorddata((prev) =>
        prev.map((q) => {
          const bidEndDate = new Date(checkUTC(q.bidEndDate));
          if (q.id === parseInt(data) && new Date() > bidEndDate) {
            return { ...q, stage: 'Close' };
          }
          return q;
        })
      );
    });
  }, [connection]);

  /* ── Table data ── */
  const [recorddata, setRecorddata] = useState([]);
  const [gridloading, setGridloading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [debouncedQuickFilterValue, setDebouncedQuickFilterValue] = useState('');
  const [searchDataLoaded, setSearchDataLoaded] = useState(false);
  const [searchText, setSearchText] = useState('');

  const pullBidManageFind = (pageNumber = 1, pageSz = 10, isSearch = false) => {
    const data = { CustomerId: customerid, SortingColumn: 'Id' };
    setGridloading(!isSearch);
    if (!isSearch) setSearchDataLoaded(false);

    const effectivePageSize = isSearch ? 10000 : pageSz;
    const effectivePageNumber = isSearch ? 1 : pageNumber;

    getAuctionManageFind(data, atoken, effectivePageNumber, effectivePageSize).then((res) => {
      if (!isSearch) setGridloading(false);
      setTotalCount(res.pageMetadata?.totalCount || 0);
      if (isSearch) setSearchDataLoaded(true);
      if (res?.result?.length > 0) {
        setRecorddata(res.result.filter((item) => item.stage !== 'Cancel'));
      } else {
        setRecorddata([]);
        setTotalCount(0);
      }
    });
  };

  useEffect(() => { pullBidManageFind(); }, [atoken, customerid]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuickFilterValue(quickFilterValue), 400);
    return () => clearTimeout(t);
  }, [quickFilterValue]);

  useEffect(() => {
    const hasSearch = debouncedQuickFilterValue.trim() !== '';
    if (hasSearch) {
      if (!searchMode) { setSearchMode(true); setPage(0); }
      if (!searchDataLoaded) pullBidManageFind(1, pageSize, true);
      return;
    }
    if (searchMode) { setSearchMode(false); setPage(0); pullBidManageFind(1, pageSize, false); }
  }, [debouncedQuickFilterValue, searchMode, searchDataLoaded, pageSize]);

  /* ── Navigate to auction detail ── */
  const navigateToPage = (row) => {
    const BidType = bidTypeMap[row.bidTypeID];
    const selectedBid = Object.values(bidlist).find((item) => item.bidTypeName === BidType);
    if (selectedBid) {
      dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
      const enc = CryptoJS.AES.encrypt(JSON.stringify(selectedBid), process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
      setCookie('pcbt', enc, { path: '/', maxAge: 86400 });
      navigate(`/configuration/manage-auction/${row.id}`);
    } else {
      toast.error('Please contact Administrator.');
    }
  };

  /* ── Filter popover (column filters) ── */
  const [filterAnchor, setFilterAnchor] = useState(null);
  const filterPopoverRef = React.useRef(null);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const FILTER_COLUMNS = [
    { field: 'bidsubject', label: 'Subject' },
    { field: 'stage', label: 'Status' },
    { field: 'bidTypeID', label: 'Type' },
    { field: 'bidStDate', label: 'Start Date' },
    { field: 'bidEndDate', label: 'End Date' },
    { field: 'createdByName', label: 'Created By' },
  ];
  const FILTER_OPERATORS = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];

  const _filterIdRef = React.useRef(0);
  const emptyFilterItem = () => ({ id: ++_filterIdRef.current, field: 'bidsubject', operator: 'contains', value: '' });
  const [tempFilterItems, setTempFilterItems] = useState([emptyFilterItem()]);

  const applyFilter = () => {
    const validItems = tempFilterItems.filter(
      (f) => f.operator === 'isEmpty' || f.operator === 'isNotEmpty' || (f.value && f.value.trim())
    );
    setFilterModel({ items: validItems });
    setActiveFilterCount(validItems.length);
    setFilterAnchor(null);
  };

  const resetFilter = () => {
    setFilterModel({ items: [] });
    setActiveFilterCount(0);
    setTempFilterItems([emptyFilterItem()]);
    setFilterAnchor(null);
  };

  const getFieldValue = (row, field) => {
    switch (field) {
      case 'bidsubject': return (row?.bidsubject || row?.subject || '').toLowerCase();
      case 'stage': return (row?.stage || '').toLowerCase();
      case 'bidTypeID': return (bidTypeMap[row?.bidTypeID] || '').toLowerCase();
      case 'bidStDate': return row?.bidStDate ? formatDateViaLocale(row.bidStDate, userDetail).toLowerCase() : '';
      case 'bidEndDate': return row?.bidEndDate ? formatDateViaLocale(row.bidEndDate, userDetail).toLowerCase() : '';
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

  useEffect(() => {
    if (!filterAnchor) return;
    const handleClickOutside = (e) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target)) setFilterAnchor(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterAnchor]);

  /* ── Client-side search + column filter ── */
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

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      data = data.filter((row) =>
        (row?.bidsubject || '').toLowerCase().includes(q) ||
        (row?.subject || '').toLowerCase().includes(q) ||
        String(row?.id).includes(q) ||
        (bidTypeMap[row?.bidTypeID] || '').toLowerCase().includes(q)
      );
    }

    return data;
  })();

  /* ── Advance filter ── */
  const [advFilterOpen, setAdvFilterOpen] = useState(false);

  const handleFilterList = (res, searchCriteria) => {
    const shouldShowCancelled = searchCriteria?.stage === 'Cancel';
    if (!shouldShowCancelled) {
      setRecorddata((res || []).filter((item) => item.stage !== 'Cancel'));
    } else {
      setRecorddata(res || []);
    }
  };

  const clearFilterList = () => {
    pullBidManageFind();
    setFilterModel({ items: [] });
    setActiveFilterCount(0);
    setTempFilterItems([emptyFilterItem()]);
  };

  /* ── Column visibility ── */
  const [columnVisibility, setColumnVisibility] = useState({
    bidsubject: true, bidTypeID: true, stage: true,
    bidStDate: true, bidEndDate: true, action: true, createdBy: true
  });
  const [colMenuAnchor, setColMenuAnchor] = useState(null);
  const colPopoverRef = React.useRef(null);

  useEffect(() => {
    if (!colMenuAnchor) return;
    const handleClickOutside = (e) => {
      if (colPopoverRef.current && !colPopoverRef.current.contains(e.target)) setColMenuAnchor(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colMenuAnchor]);

  /* ── Export ── */
  const handleExport = useCallback(() => {
    if (!filteredData.length) { toast.info('No data to export.', { toastId: 'auction_export_empty' }); return; }
    const visibleCols = EXPORT_COLUMNS.filter((c) => columnVisibility[c.field] !== false);
    const csvRows = [
      visibleCols.map((c) => escapeCsvValue(c.label)).join(','),
      ...filteredData.map((row) => visibleCols.map((c) => escapeCsvValue(c.getValue(row, userDetail))).join(',')),
    ];
    const blob = new Blob([`﻿${csvRows.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `manage-auction-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [columnVisibility, filteredData, userDetail]);

  /* ── PETable columns ── */
  const columns = [
    columnVisibility.bidsubject && {
      field: 'bidsubject',
      headerName: 'Auction',
      flex: 2.2,
      minWidth: 180,
      sortable: true,
      valueGetter: (params) => {
        // Combine all searchable text for this column
        const subject = params?.row?.subject || '';
        const bidsubject = params?.row?.bidsubject || '';
        const id = params?.row?.id || '';
        const eventCode = params?.row?.eventCode || '';
        return `${bidsubject} ${subject} ${id} ${eventCode}`.trim();
      },
      renderCell: (params) => (
        <div className="rfq-v2-cell" onClick={() => navigateToPage(params.row)} style={{ cursor: 'pointer' }}>
          <CommonTooltip title={params.row.subject || params.row.rfqSubject || ''} placement="bottom">
            <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {params.row.subject || params.row.rfqSubject}
            </span>
          </CommonTooltip>
          <span className="rfq-v2-cell-code">
            <span> Bid ID: {params?.row.id}</span>  <span> | Event Code: {params?.row.eventCode}</span>
          </span>
        </div>
      ),
    },
    columnVisibility.bidTypeID && {
      field: 'bidTypeID',
      headerName: 'Type',
      flex: 1.2,
      minWidth: 140,
      sortable: true,
      valueGetter: (params) => bidTypeMap[params.value] || '',
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => navigateToPage(params.row)} style={{ cursor: 'pointer' }}>
          {params.value || '—'}
        </span>
      ),
    },
    columnVisibility.stage && {
      field: 'stage',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      sortable: true,
      renderCell: (params) => (
        <div onClick={() => navigateToPage(params.row)} style={{ cursor: 'pointer' }}>
          <AuctionStatusBadge status={params.row.stage} />
        </div>
      ),
    },
    columnVisibility.bidStDate && {
      field: 'bidStDate',
      headerName: 'Start Date',
      flex: 1,
      minWidth: 120,
      sortable: true,
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => navigateToPage(params.row)} style={{ cursor: 'pointer' }}>
          {params.row.bidStDate ? formatDateViaLocale(params.row.bidStDate, userDetail) : '—'}
        </span>
      ),
    },
    columnVisibility.bidEndDate && {
      field: 'bidEndDate',
      headerName: 'End Date',
      flex: 1,
      minWidth: 120,
      sortable: true,
      renderCell: (params) => (
        <span className="rfq-v2-text-cell" onClick={() => navigateToPage(params.row)} style={{ cursor: 'pointer' }}>
          {params.row.bidEndDate ? formatDateViaLocale(params.row.bidEndDate, userDetail) : '—'}
        </span>
      ),
    },
    columnVisibility.createdBy && {
      field: 'createdByName',
      headerName: 'Created By',
      flex: 1,
      minWidth: 120,
      sortable: true,
      valueGetter: (params) => params?.row?.createdByName || '',
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {params.row.createdByName || '—'}
        </span>
      ),
    },
    columnVisibility.action && {
      field: 'action',
      headerName: 'Action',
      flex: 0.8,
      minWidth: 90,
      sortable: false,
      renderCell: (params) => {
        const hideGavel = ['Draft', 'Cancel', 'Close', 'Awarded', 'Allocation', 'Open', 'Under Pre Approval'].includes(params?.row?.stage);
        const hideEdit = ['Running', 'Paused'].includes(params?.row?.stage);
        return (
          <div style={{ overflow: 'visible' }}>
            {!hideGavel && (
              <Tooltip title="Manage" arrow>
                <button
                  type="button"
                  className="pe-icon-btn pe-icon-btn--edit"
                  aria-label="Auction"
                  onClick={() => navigateToPage(params.row)}
                >
                  <GavelOutlinedIcon />
                </button>
              </Tooltip>
            )}
            {!hideEdit && hideGavel && (
              <Tooltip title={params?.row?.stage === 'Draft' ? 'Edit' : 'Manage'} arrow>
                <button
                  type="button"
                  className="pe-icon-btn pe-icon-btn--edit"
                  aria-label="Edit Auction"
                  onClick={() => navigateToPage(params.row)}
                >
                  <HiPencilAlt />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ].filter(Boolean);

  /* ── Create Auction modal ── */
  const [modal, setModal] = useState(false);
  const [radioValue, setRadioValue] = useState('new');
  const [BidType, setBidType] = useState('');
  const [BidTypeList, setBidTypeList] = useState([]);
  const [templatelist, setTemplateList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedBidTypeId, setSelectedBidTypeId] = useState(null);

  const pullBidTypeList = async () => {
    try {
      const response = await apiClient.get('/api/BidType/Find', atoken);
      if (response?.result && Array.isArray(response.result)) {
        setBidTypeList(response.result);
      }
    } catch (error) {
      console.error('Error fetching bid types:', error);
    }
  };

  const getTemplateList = async () => {
    const queryParams = buildQueryParams({ CustomerId: customerid, EventType: 'Auction' });
    const res = await apiClient.getres(`/api/EventTemplate/Find?${queryParams}`, atoken);
    if (res) setTemplateList(res?.data?.result || []);
  };

  const handleAuction = () => {
    const selectedBid = Object.values(bidlist).find((item) => item.bidTypeName === BidType);
    if (selectedBid) {
      dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
      const enc = CryptoJS.AES.encrypt(JSON.stringify(selectedBid), process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
      setCookie('pcbt', enc, { path: '/', maxAge: 86400 });
      navigate('/configuration/manage-auction/add');
    } else {
      toast.error('Please select an auction type before proceeding.');
    }
  };

  const handleTemplateNavigation = useCallback(async () => {
    if (radioValue !== 'new') {
      const queryParams = buildQueryParams({ EventId: selectedTemplate.eventId, EventType: selectedTemplate.eventType });
      const res = await apiClient.postres(`/api/AuctionManage/BIDTemplateClone?${queryParams}`, null, atoken);
      if (res) {
        const auctionId = res?.data[0]?.id;
        const BT = bidTypeMap[selectedBidTypeId];
        const selectedBid = Object.values(bidlist).find((item) => item.bidTypeName === BT);
        if (selectedBid) {
          dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
          const enc = CryptoJS.AES.encrypt(JSON.stringify(selectedBid), process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
          setCookie('pcbt', enc, { path: '/', maxAge: 86400 });
          navigate(`/configuration/manage-auction/${auctionId}`);
        } else {
          toast.error('Please contact Administrator.');
        }
      }
    } else {
      navigate('/configuration/manage-auction/add');
    }
  }, [selectedTemplate, selectedBidTypeId, radioValue]);

  return (
    <>
      <div className="rfq-v2-page">

        {/* ── Page header ── */}
        <div className="rfq-v2-page-header">
          <div className="rfq-v2-breadcrumb">
            <Link to="/app">Home</Link>
            <span className="rfq-v2-breadcrumb-sep">/</span>
            <span>Auctions</span>
          </div>
          <button className="rfq-v2-create-btn" onClick={() => setModal(true)}>
            <AddOutlined /> Create New Auction
          </button>
        </div>

        {/* ── Main card ── */}
        <div className="rfq-v2-card">

          {/* ── Toolbar ── */}
          <div className="rfq-v2-toolbar">
            <div className="rfq-v2-search-wrapper">
              <input
                className="rfq-v2-search"
                placeholder="Search auctions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <SearchOutlined className="rfq-v2-search-icon" />
            </div>

            <div className="rfq-v2-toolbar-right">
              {/* ── Filter popover ── */}
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
                    <div className="rfq-v2-col-popover-header">
                      <span className="rfq-v2-col-popover-title">
                        <FilterListOutlined className="rfq-v2-col-title-icon" />
                        Filters
                      </span>
                      <button className="rfq-v2-col-reset" onClick={resetFilter}>Reset</button>
                    </div>

                    <div className="rfq-v2-filter-rows">
                      {tempFilterItems.map((item, idx) => (
                        <div key={item.id} className="rfq-v2-filter-row-item">
                          <select
                            className="rfq-v2-filter-select"
                            value={item.field}
                            onChange={(e) => setTempFilterItems((prev) =>
                              prev.map((f, i) => i === idx ? { ...f, field: e.target.value } : f)
                            )}
                          >
                            {FILTER_COLUMNS.map((c) => (
                              <option key={c.field} value={c.field}>{c.label}</option>
                            ))}
                          </select>

                          <select
                            className="rfq-v2-filter-select"
                            value={item.operator}
                            onChange={(e) => setTempFilterItems((prev) =>
                              prev.map((f, i) => i === idx ? { ...f, operator: e.target.value } : f)
                            )}
                          >
                            {FILTER_OPERATORS.map((op) => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>

                          {item.operator !== 'isEmpty' && item.operator !== 'isNotEmpty' && (
                            <input
                              type="text"
                              className="rfq-v2-filter-value-input"
                              placeholder="Filter value"
                              value={item.value}
                              onChange={(e) => setTempFilterItems((prev) =>
                                prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f)
                              )}
                            />
                          )}

                          {tempFilterItems.length > 1 && (
                            <button
                              className="rfq-v2-filter-remove-btn"
                              onClick={() => setTempFilterItems((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rfq-v2-filter-popover-footer">
                      <button
                        className="rfq-v2-filter-add-btn"
                        onClick={() => setTempFilterItems((prev) => [...prev, emptyFilterItem()])}
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
                {advFilterOpen && <span className="rfq-v2-filter-count">1</span>}
              </button>

              <div style={{ position: 'relative' }}>
                <button className="rfq-v2-tbtn" onClick={(e) => setColMenuAnchor(colMenuAnchor ? null : e.currentTarget)}>
                  <ViewColumnOutlined />
                  Columns
                  {Object.values(columnVisibility).some((v) => !v) && (
                    <span className="rfq-v2-filter-count">{Object.values(columnVisibility).filter((v) => !v).length}</span>
                  )}
                </button>
                {colMenuAnchor && (
                  <div className="rfq-v2-col-popover" ref={colPopoverRef}>
                    <div className="rfq-v2-col-popover-header">
                      <span className="rfq-v2-col-popover-title">
                        <ViewColumnOutlined className="rfq-v2-col-title-icon" />
                        Manage Columns
                      </span>
                      <button
                        className="rfq-v2-col-reset"
                        onClick={() => setColumnVisibility({ bidsubject: true, bidTypeID: true, stage: true, bidStDate: true, bidEndDate: true, action: true })}
                      >
                        Reset
                      </button>
                    </div>
                    {[
                      { field: 'bidsubject', label: 'Auction' },
                      { field: 'bidTypeID', label: 'Type' },
                      { field: 'stage', label: 'Status' },
                      { field: 'bidStDate', label: 'Start Date' },
                      { field: 'bidEndDate', label: 'End Date' },
                      { field: 'action', label: 'Action' },
                    ].map((col) => (
                      <label key={col.field} className="rfq-v2-col-item">
                        <input
                          type="checkbox"
                          className="rfq-v2-col-check"
                          checked={!!columnVisibility[col.field]}
                          onChange={() => setColumnVisibility((prev) => ({ ...prev, [col.field]: !prev[col.field] }))}
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
                onClick={handleExport}
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
            ) : filteredData.length === 0 ? (
              <div className="rfq-v2-empty">
                <p className="rfq-v2-empty-title">No auctions found</p>
                <p className="rfq-v2-empty-sub">
                  {searchText ? 'Try adjusting your search.' : 'Create your first auction to get started.'}
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
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(model) => {
                  setPage(model.page);
                  setPageSize(model.pageSize);
                }}
                rowHeight={52}
                columnHeaderHeight={40}
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
            <FilterAuctionCell
              handleFilterList={handleFilterList}
              clearFilterList={clearFilterList}
            />
          </div>
        </div>
      )}

      {/* ── Create Auction modal ── */}
      <PEModal
        size="sm"
        open={modal}
        onClose={() => setModal(false)}
        disableBackdropClose={true}
        title={<span style={{ fontSize: 14 }}>What would you like to do?</span>}
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setModal(false)}>Cancel</button>
            <button
              type="button"
              className="pe-btn pe-btn--primary"
              onClick={radioValue !== 'template' ? handleAuction : handleTemplateNavigation}
            >
              Continue
            </button>
          </>
        }
      >
        <div>
          <FormControl>
            <RadioGroup
              defaultValue="new"
              name="new-auction"
              value={radioValue}
              onChange={(e) => setRadioValue(e.target.value)}
            >
              <FormControlLabel value="new" control={<Radio size="small" />} label="Create a New Auction" />
              <FormControlLabel value="template" control={<Radio size="small" />} label="Select From Template" />
            </RadioGroup>
          </FormControl>

          {radioValue === 'new' && (
            <div className="mt-3">
              <label className="pe-field-label">Auction Type *</label>
              <Autocomplete
                id="bidtype"
                size="small"
                fullWidth
                options={BidTypeList}
                getOptionLabel={(option) => option?.bidTypeName || ''}
                value={BidTypeList.find((o) => o?.bidTypeName === BidType) || null}
                onChange={(_, newValue) => setBidType(newValue?.bidTypeName || '')}
                onOpen={() => { if (!BidTypeList.length) pullBidTypeList(); }}
                renderInput={(params) => (
                  <TextField {...params} InputLabelProps={{ shrink: true }} placeholder="Select auction type" />
                )}
              />
            </div>
          )}

          {radioValue === 'template' && (
            <div className="mt-3">
              <label className="pe-field-label">Select Template</label>
              <Autocomplete
                size="small"
                fullWidth
                options={templatelist ?? []}
                getOptionLabel={(option) => {
                  const aType = bidTypeMap[option?.eventTypeId] || 'Unknown Type';
                  return `${option.templateTitle ?? ''} (${aType})`;
                }}
                renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} />}
                onChange={(_, v) => { setSelectedTemplate(v); setSelectedBidTypeId(v?.eventTypeId); }}
                onOpen={() => { if (!templatelist.length) getTemplateList(); }}
              />
            </div>
          )}
        </div>
      </PEModal>
    </>
  );
};

export default ManageBidV2;
