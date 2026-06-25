import { Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { BackButton } from '../../utils/common/component';
import { actionTypes, useStateValue } from '../../store';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';
import {
  FilterListOutlined, ViewColumnOutlined, FileDownloadOutlined,
  SearchOutlined, KeyboardArrowDownOutlined, DensitySmallOutlined,
} from '@mui/icons-material';
import { buildQueryParams, formatDateViaLocale } from '../../utils/common/utility';
import { ApiClient } from '../../Apiclient';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';

const FILTER_COLUMNS = [
  { field: 'eventType', label: 'Event Type' },
  { field: 'initiator', label: 'Initiator' },
  { field: 'queryText', label: 'Query Description' },
];
const FILTER_OPERATORS = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];
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
const emptyFilter = () => ({ id: Date.now(), field: 'eventType', operator: 'contains', value: '' });

const QueryList = forwardRef(({ fromEventPage = false, EventId, EventType, permissionManager }, Queryref) => {
  const [{ atoken, customerid, userDetail, customersuffix, NotificationlistRaiseQuery }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const location = useLocation();
  const queryparams = new URLSearchParams(location.search);
  const navigate = useNavigate();

  // toolbar state
  const [searchText, setSearchText] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [tempFilterItems, setTempFilterItems] = useState([emptyFilter()]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [colMenuAnchor, setColMenuAnchor] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState({ eventId: true, queryText: true, eventType: true, userName: true, initiationTime: true });
  const [densityAnchor, setDensityAnchor] = useState(null);
  const [density, setDensity] = useState('standard');
  const filterPopoverRef = useRef(null);
  const colPopoverRef = useRef(null);
  const densityPopoverRef = useRef(null);

  // close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target)) setFilterAnchor(null);
      if (colPopoverRef.current && !colPopoverRef.current.contains(e.target)) setColMenuAnchor(null);
      if (densityPopoverRef.current && !densityPopoverRef.current.contains(e.target)) setDensityAnchor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pullMessageList = async (eid = null, etype = null) => {
    const data = { CustomerId: customerid, SortingColumn: 'Id' };
    if (fromEventPage) { data.EventId = eid; data.EventType = etype; }
    const qp = buildQueryParams(data);
    const res = await apiClient.getres(`api/Communication/FindByCommId?${qp}`, atoken);
    if (res) dispatch({ type: actionTypes.SET_NotificationlistRaiseQuery, value: res?.data?.result });
  };

  useEffect(() => { if (fromEventPage) pullMessageList(EventId, EventType); else pullMessageList(); }, [EventType, EventId]);

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

  const filteredData = (NotificationlistRaiseQuery || []).filter((row) => {
    const s = searchText.toLowerCase();
    const matchesSearch = !s || [
      row.eventCode, String(row.eventId), row.eventType,
      row.commDetails?.[0]?.createdByName,
      row.commDetails?.[0]?.queryText?.replace(/<\/?[^>]+(>|$)/g, ''),
    ].some(v => (v || '').toLowerCase().includes(s));
    const matchesAll = activeFilters.every(f => matchesFilter(row, f));
    return matchesSearch && matchesAll;
  });

  const applyFilter = () => {
    setActiveFilters(tempFilterItems.filter(f => f.operator === 'isEmpty' || f.operator === 'isNotEmpty' || f.value.trim()));
    setFilterAnchor(null);
  };
  const resetFilter = () => { setTempFilterItems([emptyFilter()]); setActiveFilters([]); setFilterAnchor(null); };

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
  const activeFilterCount = activeFilters.filter(f => f.value.trim() || f.operator === 'isEmpty' || f.operator === 'isNotEmpty').length;

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
              <div className="rfq-v2-toolbar">
                {/* Search */}
                <div className="rfq-v2-search-wrapper">
                  <input
                    className="rfq-v2-search"
                    placeholder="Search queries..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <SearchOutlined className="rfq-v2-search-icon" />
                </div>

                {/* Right buttons */}
                <div className="rfq-v2-toolbar-right">
                  {/* Filter */}
                  <div style={{ position: 'relative' }}>
                    <button className="rfq-v2-tbtn" onClick={(e) => setFilterAnchor(filterAnchor ? null : e.currentTarget)}>
                      <FilterListOutlined />
                      Filters
                      {activeFilterCount > 0 && <span className="rfq-v2-filter-count">{activeFilterCount}</span>}
                    </button>
                    {filterAnchor && (
                      <div className="rfq-v2-col-popover rfq-v2-filter-popover" ref={filterPopoverRef}>
                        <div className="rfq-v2-col-popover-header">
                          <span className="rfq-v2-col-popover-title"><FilterListOutlined className="rfq-v2-col-title-icon" />Filters</span>
                          <button className="rfq-v2-col-reset" onClick={resetFilter}>Reset</button>
                        </div>
                        <div className="rfq-v2-filter-rows">
                          {tempFilterItems.map((item, idx) => (
                            <div key={item.id} className="rfq-v2-filter-row-item">
                              <select className="rfq-v2-filter-select" value={item.field} onChange={(e) => setTempFilterItems(prev => prev.map((f, i) => i === idx ? { ...f, field: e.target.value } : f))}>
                                {FILTER_COLUMNS.map(c => <option key={c.field} value={c.field}>{c.label}</option>)}
                              </select>
                              <select className="rfq-v2-filter-select" value={item.operator} onChange={(e) => setTempFilterItems(prev => prev.map((f, i) => i === idx ? { ...f, operator: e.target.value } : f))}>
                                {FILTER_OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                              </select>
                              {item.operator !== 'isEmpty' && item.operator !== 'isNotEmpty' && (
                                <input type="text" className="rfq-v2-filter-value-input" placeholder="Filter value" value={item.value} onChange={(e) => setTempFilterItems(prev => prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))} />
                              )}
                              {tempFilterItems.length > 1 && (
                                <button className="rfq-v2-filter-remove-btn" onClick={() => setTempFilterItems(prev => prev.filter((_, i) => i !== idx))}>×</button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="rfq-v2-filter-popover-footer">
                          <button className="rfq-v2-filter-add-btn" onClick={() => setTempFilterItems(prev => [...prev, emptyFilter()])}>+ Add filter</button>
                          <button className="rfq-v2-filter-apply-btn" onClick={applyFilter}>Apply</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columns */}
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
                          <span className="rfq-v2-col-popover-title"><ViewColumnOutlined className="rfq-v2-col-title-icon" />Manage Columns</span>
                          <button className="rfq-v2-col-reset" onClick={() => setColumnVisibility({ eventId: true, queryText: true, eventType: true, userName: true, initiationTime: true })}>Reset</button>
                        </div>
                        {COL_DEFS.map(col => (
                          <label key={col.field} className="rfq-v2-col-item">
                            <input type="checkbox" className="rfq-v2-col-check" checked={!!columnVisibility[col.field]} onChange={() => setColumnVisibility(prev => ({ ...prev, [col.field]: !prev[col.field] }))} />
                            <span className="rfq-v2-col-label">{col.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Density */}
                  <div style={{ position: 'relative' }}>
                    <button className="rfq-v2-tbtn" onClick={(e) => setDensityAnchor(densityAnchor ? null : e.currentTarget)}>
                      <DensitySmallOutlined />
                      Density
                    </button>
                    {densityAnchor && (
                      <div className="rfq-v2-col-popover" ref={densityPopoverRef} style={{ minWidth: 140 }}>
                        <div className="rfq-v2-col-popover-header">
                          <span className="rfq-v2-col-popover-title"><DensitySmallOutlined className="rfq-v2-col-title-icon" />Row density</span>
                        </div>
                        {DENSITY_OPTIONS.map(opt => (
                          <label key={opt.key} className="rfq-v2-col-item">
                            <input type="radio" className="rfq-v2-col-check" checked={density === opt.key} onChange={() => { setDensity(opt.key); setDensityAnchor(null); }} />
                            <span className="rfq-v2-col-label">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Export */}
                  <button className="rfq-v2-tbtn rfq-v2-tbtn-export" onClick={handleExport} disabled={!filteredData.length}>
                    <FileDownloadOutlined />
                    Export
                    <KeyboardArrowDownOutlined className="export-chevron" />
                  </button>
                </div>
              </div>

              {/* ── Table ── */}
              <div className="rfq-v2-table-wrapper">
                {filteredData.length === 0 ? (
                  <div className="rfq-v2-empty">
                    <p className="rfq-v2-empty-title">No queries found</p>
                    <p className="rfq-v2-empty-sub">{searchText || activeFilterCount ? 'Try adjusting your search or filters.' : 'Raise a query to get started.'}</p>
                  </div>
                ) : (
                  <DataGrid
                    className="rfq-v2-datagrid"
                    rows={filteredData}
                    columns={columns}
                    getRowId={(row) => row.id ?? row.eventId}
                    rowHeight={rowHeight}
                    columnHeaderHeight={40}
                    pagination
                    disableRowSelectionOnClick
                    columnVisibilityModel={columnVisibility}
                    disableColumnResize
                    hideFooterSelectedRowCount
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                  />
                )}
              </div>
            </>
          );
        })()}
      </div>
    </>
  );
});

export default QueryList;
