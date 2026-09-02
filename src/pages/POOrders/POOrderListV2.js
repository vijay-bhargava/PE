import React, { useCallback, useEffect, useState } from 'react';
import { Tooltip } from '@mui/material';
import { HiDownload } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { actionTypes, useStateValue } from "../../store";
import { GetPOHeaderList } from '../../utils/pOToAccept';
import { useCookies } from 'react-cookie';
import FilterCell from "./FilterCell";
import { formatDateToDDMMYYYY, downloadFilesOnAzure, getApiErrorMessage } from '../../utils/common';
import GridSkeleton from '../../components/Skeleton/gridSkeleton';
import { toast } from 'react-toastify';
import { ApiClient } from '../../Apiclient';
import { PETable } from '../../components/RFQ/PETable';
import { PETableToolbar } from '../../components/RFQ/PETableToolbar';
import StatusBadge from '../../components/StatusBadge';
import '../../assets/css/manage-rfq-v2.css';
import '../../assets/css/design-system.css';

/* ── Quick-filter helper (unchanged from original) ── */
const getPoListSearchText = (row) => {
  if (!row) return '';
  return [
    row.poNumber, row.externalSourcePONumber, row.nfaCode, row.id,
    row.poAmount, row.paidAmount, row.stage, row.poType,
    row.createdByName, row.requestedBy, row.company, row.vendorName,
  ]
    .map((v) => (v == null ? '' : String(v)))
    .join(' ')
    .toLowerCase();
};

const DENSITY_OPTIONS = [
  { key: 'compact', height: 36 },
  { key: 'standard', height: 48 },
  { key: 'comfortable', height: 60 },
];

const DEFAULT_VISIBILITY = {
  poNumber: true,
  createdOn: true,
  poAmount: true,
  paidAmount: true,
  stage: true,
  poType: true,
  createdByName: true,
  requestedBy: true,
  vendorName: true,
  poDocumentFileName: true,
};

const FILTER_COLUMNS = [
  { field: 'poNumber', label: 'PO Number' },
  { field: 'stage', label: 'Status' },
  { field: 'poType', label: 'PO Type' },
  { field: 'vendorName', label: 'Supplier' },
  { field: 'createdByName', label: 'Created By' },
];

/* ═══════════════════════════════════════════════════════════ */
const POOrderListV2 = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies(['patkn', 'prtkn']);
  const [{ atoken, customerid, userDetail, customersuffix }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);

  /* ── Data ── */
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  const [gridloading, setGridloading] = useState(true);
  const [exportFilters, setExportFilters] = useState({});

  /* ── Table UI state ── */
  const [searchText, setSearchText] = useState('');
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [columnVisibility, setColumnVisibility] = useState(DEFAULT_VISIBILITY);
  const [density, setDensity] = useState('standard');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

  /* ── Advance filter panel ── */
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  const [advFilterCount, setAdvFilterCount] = useState(0);

  const rowHeight = DENSITY_OPTIONS.find((d) => d.key === density)?.height ?? 48;

  /* ── Reset event context on mount ── */
  useEffect(() => {
    dispatch({ type: actionTypes.SET_EVENTID, value: 0 });
    dispatch({ type: actionTypes.SET_EVENTTYPE, value: '' });
  }, [dispatch]);

  /* ── Message count (Communication Hub) ── */
  useEffect(() => {
    if (userDetail?.id) {
      if (typeof window.pullMessageCount === 'function') {
        window.pullMessageCount({
          UserId: userDetail.id,
          EventType: 'PO',
          IsVenderYN: 'N',
          atoken,
          dispatch,
        });
      }
    }
  }, [userDetail, atoken, dispatch]);

  /* ── Fetch list ── */
  const initialValues = { CustomerId: customerid };

  const fetchPOHeaderList = useCallback(async (params) => {
    setGridloading(true);
    try {
      const res = await GetPOHeaderList(params, atoken);
      if (res) setAllPurchaseOrders(res);
    } catch (error) {
      console.error('Error fetching PO header list:', error);
    } finally {
      setGridloading(false);
    }
  }, [atoken]);

  useEffect(() => {
    fetchPOHeaderList(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Advance filter callbacks ── */
  const handleFilterList = (res, filters = {}) => {
    setAllPurchaseOrders(res);
    setExportFilters(filters);
    const count = Object.values(filters).filter(v => v !== '' && v != null).length;
    setAdvFilterCount(count);
    setAdvFilterOpen(false);
  };

  const clearFilterList = () => {
    fetchPOHeaderList(initialValues);
    setAdvFilterCount(0);
    setAdvFilterOpen(false);
  };

  /* ── Client-side search filter ── */
  const filteredData = searchText.trim()
    ? allPurchaseOrders.filter((row) =>
      getPoListSearchText(row).includes(searchText.trim().toLowerCase())
    )
    : allPurchaseOrders;

  /* ── Export PO Excel (logic unchanged from original) ── */
  const handleExportPOExcel = async () => {
    try {
      const payload = { customerId: customerid || 0 };
      if (exportFilters?.poId) payload.poId = parseInt(exportFilters.poId);
      if (exportFilters?.itemNo) payload.itemNo = exportFilters.itemNo;
      if (exportFilters?.itemName) payload.itemName = exportFilters.itemName;
      if (exportFilters?.itemType) payload.itemType = exportFilters.itemType;
      if (exportFilters?.poStage) payload.poStage = exportFilters.poStage;
      if (exportFilters?.invoiceNo) payload.invoiceNo = exportFilters.invoiceNo;
      if (exportFilters?.invoiceStage) payload.invoiceStage = exportFilters.invoiceStage;
      if (exportFilters?.createdDate) payload.createdDate = exportFilters.createdDate;

      const res = await apiClient.api.post('/api/poconfirm/ExportPOExcel', payload, {
        headers: { Authorization: `Bearer ${atoken}` },
        responseType: 'blob',
      });

      if (res?.data) {
        const blob = new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `PO_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('handleExportPOExcel failed:', error);
      toast.error(getApiErrorMessage(error), { toastId: 'handleExportPOExcel_error' });
    }
  };

  /* ── Columns ── */
  const columns = [
    {
      field: 'poNumber',
      headerName: 'PO Number',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => {
        const displayPONumber = params?.row?.externalSourcePONumber || params?.row?.poNumber;
        return (
          <div className="rfq-v2-cell">
            <span className="rfq-v2-cell-subject">
              {displayPONumber || `PO Id: ${params.row.id}`}
            </span>
            {params.row.nfaCode && (
              <span className="rfq-v2-cell-code">NFA: {params.row.nfaCode}</span>
            )}
          </div>
        );
      },
    },
    {
      field: 'createdOn',
      headerName: 'PO Date',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject">
          {params.value ? formatDateToDDMMYYYY(params.value) : ''}
        </span>
      ),
    },
    {
      field: 'poAmount',
      headerName: 'PO Amount',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject">{params.row.poAmount ?? ''}</span>
      ),
    },
    {
      field: 'paidAmount',
      headerName: 'Paid Amount',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject">{params.row.paidAmount ?? ''}</span>
      ),
    },
    {
      field: 'stage',
      headerName: 'Status',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => <StatusBadge status={params.row.stage || ''} />,
    },
    {
      field: 'poType',
      headerName: 'PO Type',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject">{params.row.poType || ''}</span>
      ),
    },
    {
      field: 'createdByName',
      headerName: 'Created By',
      flex: 1.5,
      minWidth: 130,
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject">{params.row.createdByName || ''}</span>
      ),
    },
    {
      field: 'requestedBy',
      headerName: 'Requested By',
      flex: 1.5,
      minWidth: 130,
      renderCell: (params) => (
        <span className="rfq-v2-cell-subject">{params.row.requestedBy || ''}</span>
      ),
    },
    {
      field: 'vendorName',
      headerName: 'Supplier',
      flex: 1.5,
      minWidth: 140,
      renderCell: (params) => {
        const name = params.row.company || params.row.vendorName || '';
        return (
          <Tooltip title={name} arrow>
            <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: 'poDocumentFileName',
      headerName: 'PO Document',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) =>
        params.row.poDocumentFileName ? (
          <Tooltip title="Download PO Document" arrow>
            <button
              type="button"
              className="pe-icon-btn pe-icon-btn--download"
              onClick={(e) => {
                e.stopPropagation();
                downloadFilesOnAzure(
                  params.row.poDocumentFilePath,
                  params.row.poDocumentFileName,
                  atoken
                );
              }}
            >
              <HiDownload style={{ fontSize: 11 }} />
            </button>
          </Tooltip>
        ) : (" "),
    },
  ];

  /* ── Row click — navigate to detail ── */
  const handleRowClick = (params, event) => {
    if (event.target.closest('button') || event.target.closest('a')) return;
    navigate(`/purchase-order/${params.row.id}`, { state: params.row });
  };

  return (
    <div className="rfq-v2-page">

      {/* ── Page header ── */}
      <div className="rfq-v2-page-header">
        <div className="rfq-v2-breadcrumb">
          <span>Home</span>
          <span className="rfq-v2-breadcrumb-sep">/</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>
            Purchase Orders
          </span>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="rfq-v2-card">
        <PETableToolbar
          searchText={searchText}
          onSearchChange={(val) => {
            setSearchText(val);
            setPaginationModel((p) => ({ ...p, page: 0 }));
          }}
          searchPlaceholder="Search PO number, supplier, status..."
          showFilter
          filterColumns={FILTER_COLUMNS}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          showColumns
          columns={columns}
          hiddenAlways={[]}
          columnVisibilityModel={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          onColumnVisibilityReset={() => setColumnVisibility(DEFAULT_VISIBILITY)}
          showDensity
          density={density}
          onDensityChange={setDensity}
          showExport
          onExport={handleExportPOExcel}
          exportLabel="Export PO"
          showAdvFilter
          advFilterOpen={advFilterOpen}
          onAdvFilterToggle={() => setAdvFilterOpen((v) => !v)}
          advFilterCount={advFilterCount}
          advFilterTitle="Advance Filter"
          advFilterPanel={
            <FilterCell
              handleFilterList={handleFilterList}
              clearFilterList={clearFilterList}
              setExportFilters={setExportFilters}
            />
          }
        />

        <div className="rfq-v2-table-wrapper">
          {gridloading ? (
            <GridSkeleton />
          ) : (
            <PETable
              rows={filteredData}
              columns={columns}
              getRowId={(row) => row.id}
              rowHeight={rowHeight}
              columnHeaderHeight={40}
              columnVisibilityModel={columnVisibility}
              filterModel={filterModel}
              onFilterModelChange={setFilterModel}
              pageSizeOptions={[10, 25, 50, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              onRowClick={handleRowClick}
              disableColumnResize
              pagination
              sx={{ cursor: 'pointer' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default POOrderListV2;
