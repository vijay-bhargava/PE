import { Alert } from '@mui/material';
import { PETable } from '../../components/RFQ/PETable';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { BackButton } from '../../utils/common/component';
import { actionTypes, useStateValue } from '../../store';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';
import { PETableToolbar } from '../../components/RFQ/PETableToolbar';
import { buildQueryParams, formatDateViaLocale } from '../../utils/common/utility';
import { ApiClient } from '../../Apiclient';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';

const FILTER_COLUMNS = [
  { field: 'eventType', label: 'Event Type' },
  { field: 'initiator', label: 'Initiator' },
  { field: 'queryText', label: 'Query Description' },
];
const EXPORT_COLS = [
  { field: 'eventId', label: 'ID', get: (r) => r.eventCode || r.eventId || '' },
  { field: 'queryText', label: 'Query Description', get: (r) => r.commDetails?.[0]?.queryText?.replace(/<\/?[^>]+(>|$)/g, '') || '' },
  { field: 'eventType', label: 'Event Type', get: (r) => r.eventType || '' },
  { field: 'userName', label: 'Initiator', get: (r) => r.commDetails?.[0]?.createdByName || '' },
  { field: 'initiationTime', label: 'Initiation Time', get: (r) => r.createdOn || '' },
];
const COL_DEFS = [
  { field: 'eventId', label: 'ID' },
  { field: 'queryText', label: 'Query Description' },
  { field: 'eventType', label: 'Event Type' },
  { field: 'userName', label: 'Initiator' },
  { field: 'initiationTime', label: 'Initiation Time' },
];
const DENSITY_OPTIONS = [
  { key: 'compact', label: 'Compact', height: 36 },
  { key: 'standard', label: 'Standard', height: 48 },
  { key: 'comfortable', label: 'Comfortable', height: 60 },
];

const QueryList = forwardRef(({ fromEventPage = false, EventId, EventType, permissionManager }, Queryref) => {
  const [{ atoken, customerid, userDetail, customersuffix, NotificationlistRaiseQuery }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const location = useLocation();
  const queryparams = new URLSearchParams(location.search);
  const navigate = useNavigate();

  // toolbar state
  const [searchText, setSearchText] = useState('');
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [columnVisibility, setColumnVisibility] = useState({ eventId: true, queryText: true, eventType: true, userName: true, initiationTime: true });
  const [density, setDensity] = useState('standard');

  const pullMessageList = async (eid = null, etype = null) => {
    const data = { CustomerId: customerid, SortingColumn: 'Id' };
    if (fromEventPage) { data.EventId = eid; data.EventType = etype; }
    const qp = buildQueryParams(data);
    const res = await apiClient.getres(`api/Communication/FindByCommId?${qp}`, atoken);
    if (res) dispatch({ type: actionTypes.SET_NotificationlistRaiseQuery, value: res?.data?.result });
  };

  useEffect(() => {
    if (fromEventPage) pullMessageList(EventId, EventType); else pullMessageList();
    return () => dispatch({ type: actionTypes.SET_NotificationlistRaiseQuery, value: [] });
  }, [EventType, EventId]);

  useImperativeHandle(Queryref, () => ({ handleDrawer: () => { } }));

  useEffect(() => {
    const data = queryparams.get('CommId')?.trim();
    if (data) dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
  }, [location.search]);

  const handleClick = (row) => {
    const CommId = row?.commDetails[0]?.commId;
    const qp = buildQueryParams({ CommId });
    const currentSearch = location.search.replace(/^\?/, '');
    dispatch({ type: actionTypes.SET_NotificationDrawer, value: false });
    dispatch({ type: actionTypes.SET_MessageSource, value: 'querylist' });
    if (currentSearch === qp) dispatch({ type: actionTypes.SET_Opendrawer, value: true });
    else navigate(`/${row.urllink}`);
  };

  // client-side filtering
  const matchesFilter = (row, f) => {
    let val = '';
    if (f.field === 'eventType') val = (row.eventType || '').toLowerCase();
    else if (f.field === 'initiator') val = (row.commDetails?.[0]?.createdByName || '').toLowerCase();
    else if (f.field === 'queryText') val = (row.commDetails?.[0]?.queryText?.replace(/<\/?[^>]+(>|$)/g, '') || '').toLowerCase();
    const fv = (f.value || '').toLowerCase();
    if (f.operator === 'contains') return val.includes(fv);
    if (f.operator === 'equals') return val === fv;
    if (f.operator === 'startsWith') return val.startsWith(fv);
    if (f.operator === 'endsWith') return val.endsWith(fv);
    if (f.operator === 'isEmpty') return !val;
    if (f.operator === 'isNotEmpty') return !!val;
    return true;
  };

  const seenCommIds = new Set();
  const deduped = (NotificationlistRaiseQuery || []).filter((row) => {
    const commId = row.commDetails?.[0]?.commId ?? row.id;
    if (commId == null || seenCommIds.has(commId)) return false;
    seenCommIds.add(commId);
    return true;
  });

  const filteredData = deduped.filter((row) => {
    const s = searchText.toLowerCase();
    const matchesSearch = !s || [
      row.eventCode, String(row.eventId), row.eventType,
      row.commDetails?.[0]?.createdByName,
      row.commDetails?.[0]?.queryText?.replace(/<\/?[^>]+(>|$)/g, ''),
    ].some(v => (v || '').toLowerCase().includes(s));
    const matchesAll = filterModel.items.every(f => matchesFilter(row, f));
    return matchesSearch && matchesAll;
  });

  const handleExport = () => {
    if (!filteredData.length) return;
    const visibleCols = EXPORT_COLS.filter(c => columnVisibility[c.field] !== false);
    const header = visibleCols.map(c => c.label).join(',');
    const rows = filteredData.map(r => visibleCols.map(c => `"${String(c.get(r)).replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'queries.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const rowHeight = DENSITY_OPTIONS.find(d => d.key === density)?.height ?? 48;
  const QUERY_FILTER_COLS = FILTER_COLUMNS;
  const QUERY_COLUMNS_DEF = COL_DEFS.map(c => ({ field: c.field, headerName: c.label }));

  const columns = [
    {
      field: 'eventId', headerName: 'ID', width: 100,
      renderCell: (params) => (
        <div onClick={() => handleClick(params.row)} className="custom-link textDefault text-dark-blue" style={{ cursor: 'pointer' }}>
          {params.row.eventCode || params.row.eventId}
        </div>
      ),
    },
    {
      field: 'queryText', headerName: 'Query Description', flex: 1, minWidth: 300,
      renderCell: (params) => {
        const full = params.row.commDetails?.[0]?.queryText?.replace(/<\/?[^>]+(>|$)/g, '') || '';
        const truncated = full.length > 50 ? full.slice(0, 50) + '...' : full;
        return (
          <div onClick={() => handleClick(params.row)} className="custom-link textDefault text-dark-blue" title={full} style={{ cursor: 'pointer' }}>
            {truncated}
          </div>
        );
      },
    },
    {
      field: 'eventType', headerName: 'Event Type', width: 150,
      renderCell: (params) => {
        const t = params.value?.toLowerCase();
        const display = t === 'vq' ? 'Supplier Qualification' : t === 'qr' ? 'Supplier Registration' : params.value;
        return <div onClick={() => handleClick(params.row)} className="custom-link textDefault text-dark-blue" style={{ cursor: 'pointer' }}>{display}</div>;
      },
    },
    {
      field: 'userName', headerName: 'Initiator', width: 160,
      renderCell: (params) => (
        <div onClick={() => handleClick(params.row)} className="custom-link textDefault text-dark-blue" style={{ cursor: 'pointer' }}>
          {params.row.commDetails?.[0]?.createdByName || 'Unknown'}
        </div>
      ),
    },
    {
      field: 'initiationTime', headerName: 'Initiation Time', width: 180,
      valueGetter: (params) => params.row.createdOn,
      renderCell: (params) => (
        <div onClick={() => handleClick(params.row)} className="custom-link textDefault text-dark-blue" style={{ cursor: 'pointer' }}>
          {params.formattedValue ? formatDateViaLocale(params.formattedValue, userDetail) : ''}
        </div>
      ),
    },
  ];

  return (
    <>
      {!fromEventPage && (
        <div className='d-flex justify-content-between minh50px align-items-center p-1 bg-grey'>
          <BackButton title="Help & Support" />
        </div>
      )}

      <div className="query-list-container">
        {(() => {
          const canRead = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ) ?? false;
          if (!canRead) {
            return (
              <div className="p-4">
                <Alert severity="error">
                  <div className="d-flex align-items-center">
                    <HiOutlineX className="me-2 f18" />
                    Access Denied: You don't have permission to view Queries.
                  </div>
                </Alert>
              </div>
            );
          }

          return (
            <>
              {/* ── Toolbar ── */}
              <PETableToolbar
                searchText={searchText}
                onSearchChange={setSearchText}
                searchPlaceholder="Search queries..."
                showFilter
                filterColumns={QUERY_FILTER_COLS}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                showColumns
                columns={QUERY_COLUMNS_DEF}
                columnVisibilityModel={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onColumnVisibilityReset={() => setColumnVisibility({ eventId: true, queryText: true, eventType: true, userName: true, initiationTime: true })}
                showDensity
                density={density}
                onDensityChange={setDensity}
                showExport
                onExport={handleExport}
              />

              {/* ── Table ── */}
              <div className="rfq-v2-table-wrapper">
                <PETable
                  rows={filteredData}
                  columns={columns}
                  getRowId={(row) => row.id ?? row.eventId}
                  rowHeight={rowHeight}
                  columnVisibilityModel={columnVisibility}
                  disableColumnResize
                />
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
});

export default QueryList;
