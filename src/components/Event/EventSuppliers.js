import React, { useEffect, useState, useRef } from 'react';
import { IconButton, Tooltip, MenuItem, Menu, Alert } from '@mui/material';
import { PETable } from '../../components/RFQ/PETable';
import { HiDotsHorizontal } from 'react-icons/hi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { ExpandMore } from '@mui/icons-material';
import { PETableToolbar } from '../../components/RFQ/PETableToolbar';
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
const DENSITY_OPTIONS = [
  { key: 'compact', label: 'Compact', height: 36 },
  { key: 'standard', label: 'Standard', height: 48 },
  { key: 'comfortable', label: 'Comfortable', height: 60 },
];

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
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [columnVisibility, setColumnVisibility] = useState({ supplierName: true, status: true, date: true, actions: true });
  const [density, setDensity] = useState('standard');

  const versionPopoverRef = useRef(null);

  // close version popover on outside click
  useEffect(() => {
    const handler = (e) => {
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
    return matchesSearch && filterModel.items.every(f => matchesFilter(row, f));
  });

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
      <PETableToolbar
        searchText={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Search suppliers..."
        showFilter
        filterColumns={FILTER_COLUMNS}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        showColumns
        columns={COL_DEFS.map(c => ({ field: c.field, headerName: c.label }))}
        columnVisibilityModel={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onColumnVisibilityReset={() => setColumnVisibility({ supplierName: true, status: true, date: true, actions: true })}
        showDensity
        density={density}
        onDensityChange={setDensity}
        showExport
        onExport={handleExport}
        rightContent={
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="rfq-v2-tbtn rfq-v2-tbtn-export"
              onClick={(e) => setVersionAnchor(versionAnchor ? null : e.currentTarget)}
            >
              <span>Version {Version}</span>
              <span style={{ width: 1, alignSelf: 'stretch', background: '#e5e7eb' }} />
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
        }
      />

      {/* ── Table ── */}
      <div className="rfq-v2-table-wrapper">
        {filteredData.length === 0 ? (
          <div className="rfq-v2-empty">
            <p className="rfq-v2-empty-title">No suppliers found</p>
            <p className="rfq-v2-empty-sub">{searchText || filterModel.items.length > 0 ? 'Try adjusting your search or filters.' : 'No suppliers have been invited yet.'}</p>
          </div>
        ) : (
          <PETable
            className="rfq-v2-datagrid"
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.vendorId || row.emailId}
            rowHeight={rowHeight}
            pagination
            columnVisibilityModel={columnVisibility}
            disableColumnResize
            pageSizeOptions={[25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        )}
      </div>
    </div>
  );
};

export default EventSuppliers;
