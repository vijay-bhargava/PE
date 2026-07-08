import React, { useEffect, useState, useRef } from 'react';
import { IconButton, Tooltip, MenuItem, Menu, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { HiDotsHorizontal } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import {
  FilterListOutlined, ViewColumnOutlined, FileDownloadOutlined,
  SearchOutlined, KeyboardArrowDownOutlined, DensitySmallOutlined, ExpandMore,
} from '@mui/icons-material';
import { buildQueryParams } from '../../utils/purchaseRequest';
import { useParams } from 'react-router-dom';
import { ApiClient } from '../../Apiclient';
import { useStateValue } from '../../store';
import { formatDateViaLocale } from '../../utils/common/utility';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';

const FILTER_COLUMNS = [
  { field: 'supplierName', label: 'Supplier Name' },
  { field: 'status', label: 'Status' },
];
const FILTER_OPERATORS = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];
const DENSITY_OPTIONS = [
  { key: 'compact', label: 'Compact', height: 36 },
  { key: 'standard', label: 'Standard', height: 48 },
  { key: 'comfortable', label: 'Comfortable', height: 60 },
];
const emptyFilter = () => ({ id: Date.now(), field: 'supplierName', operator: 'contains', value: '' });

const EventSuppliers = ({
  selectedSupplier, stagearray, currentStage,
  handleSelectedSupplier, handleLoadingFactorClick, handleSupplierAction,
  clearSelectedSupplier, pageSS, pageCount, totalpageSS, handlePaginationSS,
  updatesupplieronloading, issupplierraccesslevel, CurrentVersion, versionhistory, permissionManager,
}) => {
  const [{ atoken, customersuffix, userDetail }, dispatch] = useStateValue();
  const { pageSlug } = useParams();
  const apiClient = new ApiClient(customersuffix);

  const [Version, setVersion] = useState(null);
  const [supplierVersionWise, setSupplierVersionWise] = useState([]);

  // version menu
  const [versionAnchor, setVersionAnchor] = useState(null);

  // row action menu
  const [rowMenuAnchor, setRowMenuAnchor] = useState(null); // { el, vendor }

  // toolbar state
  const [searchText, setSearchText] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [tempFilterItems, setTempFilterItems] = useState([emptyFilter()]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [colMenuAnchor, setColMenuAnchor] = useState(null);
  const [columnVisibility, setColumnVisibility] = useState({ supplierName: true, status: true, date: true, actions: true });
  const [densityAnchor, setDensityAnchor] = useState(null);
  const [density, setDensity] = useState('standard');

  const filterPopoverRef = useRef(null);
  const colPopoverRef = useRef(null);
  const densityPopoverRef = useRef(null);
  const versionPopoverRef = useRef(null);

  // close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target)) setFilterAnchor(null);
      if (colPopoverRef.current && !colPopoverRef.current.contains(e.target)) setColMenuAnchor(null);
      if (densityPopoverRef.current && !densityPopoverRef.current.contains(e.target)) setDensityAnchor(null);
      if (versionPopoverRef.current && !versionPopoverRef.current.contains(e.target)) setVersionAnchor(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setVersion(CurrentVersion); }, [CurrentVersion]);

  useEffect(() => {
    if (Version != null) getSupplierEventWise();
  }, [issupplierraccesslevel, Version]);

  useEffect(() => {
    if (updatesupplieronloading == 1 && Version != null) getSupplierEventWise();
  }, [updatesupplieronloading, Version]);

  const getSupplierEventWise = async () => {
    const queryParams = buildQueryParams({ RFQId: parseInt(pageSlug), Version });
    const res = await apiClient.getres(`/api/RFQVendorInvite/Find?${queryParams}`, atoken);
    if (res.status == 200) {
      setSupplierVersionWise(Array.isArray(res.data) ? res.data : []);
    }
  };

  const supplierstatus = (x) => {
    if (x.status === "Open" && x.isTermsAccepted && x.packagePrice) return "In Process";
    if (x.status === "Open" && x.isTermsAccepted && !x.packagePrice) return "Intent to Participate";
    if (x.status !== "Open") return x.status;
    return "Not Started";
  };

  const supplierdate = (x) => {
    if (x.status === "Open" && x.isTermsAccepted) return formatDateViaLocale(x.acceptanceDate, userDetail);
    if (x.status !== "Open") return formatDateViaLocale(x.responseDate, userDetail);
    return "";
  };

  // filtering
  const matchesFilter = (row, f) => {
    let val = '';
    if (f.field === 'supplierName') val = (`${row.contactPerson || ''} ${row.emailId || ''} ${row.companyName || ''}`).toLowerCase();
    else if (f.field === 'status') val = supplierstatus(row).toLowerCase();
    const fv = (f.value || '').toLowerCase();
    if (f.operator === 'contains') return val.includes(fv);
    if (f.operator === 'equals') return val === fv;
    if (f.operator === 'startsWith') return val.startsWith(fv);
    if (f.operator === 'endsWith') return val.endsWith(fv);
    if (f.operator === 'isEmpty') return !val;
    if (f.operator === 'isNotEmpty') return !!val;
    return true;
  };

  const filteredData = (Array.isArray(supplierVersionWise) ? supplierVersionWise : []).filter((row) => {
    const s = searchText.toLowerCase();
    const matchesSearch = !s || [row.contactPerson, row.emailId, row.companyName, supplierstatus(row)]
      .some(v => (v || '').toLowerCase().includes(s));
    return matchesSearch && activeFilters.every(f => matchesFilter(row, f));
  });

  const applyFilter = () => {
    setActiveFilters(tempFilterItems.filter(f => f.operator === 'isEmpty' || f.operator === 'isNotEmpty' || f.value.trim()));
    setFilterAnchor(null);
  };
  const resetFilter = () => { setTempFilterItems([emptyFilter()]); setActiveFilters([]); setFilterAnchor(null); };

  const handleExport = () => {
    if (!filteredData.length) return;
    const header = 'Supplier Name,Email,Company,Status,Date';
    const rows = filteredData.map(r =>
      [`"${r.contactPerson || ''}"`, `"${r.emailId || ''}"`, `"${r.companyName || ''}"`, `"${supplierstatus(r)}"`, `"${supplierdate(r)}"`].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'suppliers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const rowHeight = DENSITY_OPTIONS.find(d => d.key === density)?.height ?? 48;
  const activeFilterCount = activeFilters.filter(f => f.value.trim() || f.operator === 'isEmpty' || f.operator === 'isNotEmpty').length;
  const COL_DEFS = [
    { field: 'supplierName', label: 'Supplier Name' },
    { field: 'status', label: 'Status' },
    { field: 'date', label: 'Date' },
    { field: 'actions', label: 'Actions' },
  ];

  const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.EDIT) ?? false;
  const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;

  const columns = [
    {
      field: 'supplierName', headerName: 'Supplier Name', flex: 1, minWidth: 260,
      renderCell: (params) => (
        <span className="f12" style={{ color: '#000000', fontWeight: 500, cursor: 'default' }}>
          {params.row.contactPerson} | {params.row.emailId} | {params.row.companyName}
        </span>
      ),
    },
    {
      field: 'status', headerName: 'Status', width: 160,
      renderCell: (params) => <span className="f12">{supplierstatus(params.row)}</span>,
    },
    {
      field: 'date', headerName: 'Date', width: 170,
      renderCell: (params) => (
        <Tooltip title={params.row.status !== "Open" ? "Response Date" : "Acceptance Date"}>
          <span className="f12">{supplierdate(params.row)}</span>
        </Tooltip>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', width: 80, sortable: false, filterable: false,
      renderCell: (params) => {
        const x = params.row;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {currentStage !== "Awarded" && (
              <>
                <Tooltip title="Action">
                  <IconButton
                    size="small"
                    className="sup-action-btn"
                    disabled={!canEdit}
                    onClick={(e) => setRowMenuAnchor({ el: e.currentTarget, vendor: x })}
                  >
                    <HiDotsHorizontal style={{ fontSize: 16, color: '#374151' }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={rowMenuAnchor?.vendor?.vendorId === x.vendorId ? rowMenuAnchor?.el : null}
                  open={rowMenuAnchor?.vendor?.vendorId === x.vendorId && Boolean(rowMenuAnchor?.el)}
                  onClose={() => setRowMenuAnchor(null)}
                  sx={{ maxWidth: 500 }}
                >
                  {!stagearray.includes(currentStage) && x.status && x.status !== "Open" && x.status !== "Regretted" && canEdit && (
                    <MenuItem className="f12 fw500" onClick={() => { setRowMenuAnchor(null); handleSupplierAction(x, 'Reopen'); }}>Re-Open</MenuItem>
                  )}
                  {canEdit && x.status !== "Regretted" && (
                    <MenuItem className="f12 fw500" onClick={() => { setRowMenuAnchor(null); handleLoadingFactorClick(x, params.api.getRowIndexRelativeToVisibleRows(x.vendorId)); }}>Loading Factor</MenuItem>
                  )}
                  {x.status && x.status !== "Closed" && x.status !== "Regretted" && canEdit && (
                    <MenuItem className="f12 fw500" onClick={() => { setRowMenuAnchor(null); handleSupplierAction(x, 'Reminder'); }}>Send Reminder</MenuItem>
                  )}
                  {x.status && x.status !== "Closed" && x.status !== "Regretted" && canEdit && (
                    <MenuItem className="f12 fw500" onClick={() => { setRowMenuAnchor(null); handleSupplierAction(x, 'Surrogate'); }}>Surrogate Supplier</MenuItem>
                  )}
                </Menu>
              </>
            )}
            {stagearray.includes(currentStage) && canRemove && (
              <button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => clearSelectedSupplier(x?.email, false)}>
                <RiDeleteBin6Line />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const canRead = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;

  if (!canRead) {
    return (
      <div className="p-3">
        <Alert severity="warning">You don't have permission to view suppliers data.</Alert>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Toolbar ── */}
      <div className="rfq-v2-toolbar">
        {/* Search */}
        <div className="rfq-v2-search-wrapper">
          <input
            className="rfq-v2-search"
            placeholder="Search suppliers..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <SearchOutlined className="rfq-v2-search-icon" />
        </div>

        {/* Right buttons */}
        <div className="rfq-v2-toolbar-right">
          {/* Version selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="rfq-v2-tbtn rfq-v2-tbtn-export"
              onClick={(e) => setVersionAnchor(versionAnchor ? null : e.currentTarget)}
            >
              <span>Version {Version}</span>
              <span style={{ width: 1, alignSelf: 'stretch', background: '#e5e7eb', }} />
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExpandMore style={{ fontSize: 16 }} />
              </span>
            </button>
            {versionAnchor && (
              <div className="rfq-v2-col-popover" ref={versionPopoverRef} style={{ minWidth: 140, top: 'calc(100% + 4px)', right: 0, left: 'auto' }}>
                {(versionhistory || []).filter(x => !x?.includes?.("x")).map((x, i) => (
                  <label key={i} className="rfq-v2-col-item" style={{ cursor: 'pointer' }} onClick={() => { setVersion(x); setVersionAnchor(null); }}>
                    <span className="rfq-v2-col-label">{`Version ${x}`}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

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
                        <input type="text" className="rfq-v2-filter-value-input" placeholder="Filter value" value={item.value}
                          onChange={(e) => setTempFilterItems(prev => prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))} />
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
                  <button className="rfq-v2-col-reset" onClick={() => setColumnVisibility({ supplierName: true, status: true, date: true, actions: true })}>Reset</button>
                </div>
                {COL_DEFS.map(col => (
                  <label key={col.field} className="rfq-v2-col-item">
                    <input type="checkbox" className="rfq-v2-col-check" checked={!!columnVisibility[col.field]}
                      onChange={() => setColumnVisibility(prev => ({ ...prev, [col.field]: !prev[col.field] }))} />
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
                    <input type="radio" className="rfq-v2-col-check" checked={density === opt.key}
                      onChange={() => { setDensity(opt.key); setDensityAnchor(null); }} />
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
            <span style={{ width: 1, alignSelf: 'stretch', background: '#e5e7eb', }} />
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExpandMore style={{ fontSize: 16 }} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rfq-v2-table-wrapper" style={{ height: 'auto' }}>
        {filteredData.length === 0 ? (
          <div className="rfq-v2-empty">
            <p className="rfq-v2-empty-title">No suppliers found</p>
            <p className="rfq-v2-empty-sub">{searchText || activeFilterCount ? 'Try adjusting your search or filters.' : 'No suppliers have been invited yet.'}</p>
          </div>
        ) : (
          <DataGrid
            className="rfq-v2-datagrid"
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.vendorId || row.emailId}
            rowHeight={rowHeight}
            columnHeaderHeight={40}
            pagination
            disableRowSelectionOnClick
            columnVisibilityModel={columnVisibility}
            disableColumnResize
            hideFooterSelectedRowCount
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{
              border: 'none',
              flex: 1,
              minHeight: 0,
              height: '100%',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              '& .MuiDataGrid-columnHeaders': { background: '#f9fafb', borderBottom: '1px solid #e5e7eb', minHeight: '40px !important', maxHeight: '40px !important' },
              '& .MuiDataGrid-columnHeadersInner': { background: '#f9fafb' },
              '& .MuiDataGrid-columnHeader': { height: '40px !important', padding: '0 16px' },
              '& .MuiDataGrid-columnHeaderTitle': { fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'none', letterSpacing: 0 },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #f3f4f6', fontSize: 13, color: '#1f2937', padding: '0 16px', display: 'flex', alignItems: 'center' },
              '& .MuiDataGrid-cell--withRenderer': { display: 'flex', alignItems: 'center' },
              '& .MuiDataGrid-row:hover': { background: '#f8fafc' },
              '& .MuiDataGrid-columnSeparator': { visibility: 'hidden' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e5e7eb', minHeight: 44, padding: '0 8px', flexShrink: 0 },
              '& .MuiDataGrid-sortIcon': { color: '#9ca3af', opacity: 1 },
              '& .MuiDataGrid-menuIconButton': { color: '#9ca3af', opacity: 1 },
              '& .MuiTablePagination-root': { fontSize: 12, color: '#6b7280' },
              '& .MuiTablePagination-selectLabel': { fontSize: 12, color: '#6b7280', margin: 0 },
              '& .MuiTablePagination-displayedRows': { fontSize: 12, color: '#6b7280', margin: 0 },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EventSuppliers;
