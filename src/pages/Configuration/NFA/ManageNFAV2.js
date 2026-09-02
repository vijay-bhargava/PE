import React, { useEffect, useState, useCallback } from "react";
import dayjs from 'dayjs';
import {
  Autocomplete, FormControl, FormControlLabel,
  Radio, RadioGroup, TextField,
} from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { actionTypes, useStateValue } from "../../../store";
import { getNFAManageFind } from "../../../utils/common/utility";
import { PETableToolbar } from "../../../components/RFQ/PETableToolbar";
import { PETable } from "../../../components/RFQ/PETable";
import PEModal from "../../../components/PEModal";
import StatusBadge from "../../../components/StatusBadge";
import FilterNFACell from './FilterNFACell';
import CommonTooltip from '../../../components/commonTooltip';
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { buildQueryParams, formatDateViaLocale } from "../../../utils/common/utility";
import { findObjListByValueFromArray, getApiErrorMessage, } from "../../../utils/common";
import { ApiClient } from "../../../Apiclient";
import { getPurchaseOrgList, OrgGroupMasterList } from "../../../utils/commerciallibrary";
import { toast } from "react-toastify";
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';

const FILTER_COLUMNS = [
  { field: 'nfaSubject', label: 'NFA Subject' },
  { field: 'nfaNumber', label: 'NFA Number' },
  { field: 'createdByName', label: 'Created By' },
  { field: 'stage', label: 'Status' },
];

const DENSITY_OPTIONS = [
  { key: 'compact', height: 36 },
  { key: 'standard', height: 48 },
  { key: 'comfortable', height: 60 },
];

const ManageNFAV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const [
    { atoken, customerid, userDetail, customersuffix, roleClaims },
    dispatch,
  ] = useStateValue();
  const apiClient = new ApiClient(customersuffix);

  // Reset event context on mount
  useEffect(() => {
    dispatch({ type: actionTypes.SET_EVENTID, value: 0 });
    dispatch({ type: actionTypes.SET_EVENTTYPE, value: "" });
  }, [dispatch]);

  // ── Permission states ──
  const [iscreateDisabled, setIsCreateDisabled] = useState(true);
  const [isreadDisabled, setIsReadDisabled] = useState(true);
  const [iseditDisabled, setIsEditDisabled] = useState(true);
  const [listaccessLevel, setListAccessLevel] = useState('');

  useEffect(() => {
    if (userDetail && atoken && userDetail?.roleId) {
      getRoles();
    }
  }, [userDetail, atoken]);

  const getRoles = async () => {
    const dataR = {
      roleId: parseInt(userDetail?.roleId),
      featureName: "Note For Approval",
      claimType: "List",
    };
    const queryParams = buildQueryParams(dataR);
    try {
      const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken);
      if (res?.data) {
        const data = res.data;
        if (data.length === 0) setIsReadDisabled(false);
        dispatch({ type: actionTypes.SET_RoleClaims, value: data });
        data.forEach(item => {
          if (item.claimType === 'List' && item.claimValue === 'Read') {
            setListAccessLevel(item.accessLevel);
          }
          if (item.claimType === 'List' && item.claimValue === 'Create' && item.accessLevel === 'None') {
            setIsCreateDisabled(false);
          }
          if (item.claimType === 'List' && item.claimValue === 'Read' && item.accessLevel === 'None') {
            setIsReadDisabled(false);
          }
          if (item.claimType === 'List' && item.claimValue === 'Edit' && item.accessLevel === 'None') {
            setIsEditDisabled(false);
          }
        });
      } else {
        dispatch({ type: actionTypes.SET_RoleClaims, value: [] });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "get_roles_error" });
    }
  };

  const [accessLevel, setAccessLevel] = useState("");
  useEffect(() => {
    if (roleClaims && claimType && roleClaims.length > 0) {
      const obj = findObjListByValueFromArray(roleClaims, claimType, `claimType`, `Note For Approval`);
      obj ? setAccessLevel(obj) : setAccessLevel("");
    }
  }, [roleClaims, claimType]);

  // ── Purchase Org / Group lists (needed for name resolution) ──
  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);

  useEffect(() => {
    PullPurchaseOrgAll();
  }, [atoken, customerid]);

  useEffect(() => {
    if (purchaseAllList.length > 0) {
      PullPurchaseGroupAll(purchaseAllList[0].id);
    }
  }, [purchaseAllList]);

  const PullPurchaseOrgAll = async () => {
    const data = { CustomerId: customerid, IsActive: "true" };
    try {
      const resp = await getPurchaseOrgList(data, atoken);
      if (resp) setPurchaseAllList(resp);
      else setPurchaseAllList([]);
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "purchase_org_error" });
    }
  };

  const PullPurchaseGroupAll = async (orgMstId) => {
    const data = { CustomerId: customerid, OrgMstId: orgMstId, IsActive: "true" };
    try {
      const res = await OrgGroupMasterList(data, atoken);
      if (res) setPurchaseGroupAllList(res);
      else setPurchaseGroupAllList([]);
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "purchase_group_error" });
    }
  };

  // ── Data states ──
  const [recorddata, setRecorddata] = useState([]);
  const [gridloading, setGridloading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filterMode, setFilterMode] = useState(false);
  const [filterQueryParams, setFilterQueryParams] = useState(null);
  const [filterSearchCriteria, setFilterSearchCriteria] = useState(null);
  const [filterFromDayjs, setFilterFromDayjs] = useState(null);
  const [filterToDayjs, setFilterToDayjs] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  // ── Trigger pullNFAManageFind only when org+group lists are ready ──
  useEffect(() => {
    if (atoken && customerid && accessLevel && purchaseAllList.length > 0 && purchaseGroupAllList.length > 0) {
      pullNFAManageFind();
    }
  }, [atoken, customerid, accessLevel, purchaseAllList, purchaseGroupAllList]);

  const pullNFAManageFind = async (pageNumber = 1, pageSizeVal = 10) => {
    const data = {
      CustomerId: customerid,
      AccessLevel: listaccessLevel,
      SortingColumn: "Id",
    };
    try {
      setGridloading(true);
      const res = await getNFAManageFind(data, atoken, pageNumber, pageSizeVal);
      // getNFAManageFind returns the result array directly
      const rawList = Array.isArray(res) ? res : (res?.result || []);
      setTotalCount(res?.pageMetadata?.totalCount || rawList.length);
      if (rawList.length > 0) {
        const enriched = rawList
          .filter(item => item.stage !== "Cancel")
          .map(item => {
            const org = purchaseAllList.find(x => x.id === item.purchOrgId);
            const grp = purchaseGroupAllList.find(x => x.id === item.purchGrpId);
            return {
              ...item,
              purchOrg: org?.orgName || "",
              purchGrp: grp?.groupName || "",
            };
          });
        setRecorddata(enriched);
      } else {
        setRecorddata([]);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "nfa_manage_find_error" });
      setRecorddata([]);
    } finally {
      setGridloading(false);
    }
  };

  // ── Filter handlers ──
  const applyDateRangeFilter = (result, fromDj, toDj) => {
    if (!fromDj && !toDj) return result;
    return result.filter((item) => {
      if (!item.createdOn) return false;
      const dateStr = item.createdOn.endsWith('Z') ? item.createdOn : item.createdOn + 'Z';
      if (fromDj && dayjs(dateStr).isBefore(fromDj)) return false;
      if (toDj && dayjs(dateStr).isAfter(toDj)) return false;
      return true;
    });
  };

  const handleFilterList = (res, searchCriteria, pageMetadata, queryParams) => {
    const fromDj = searchCriteria?.StartDate ? dayjs(searchCriteria.StartDate) : null;
    const toDj = searchCriteria?.EndDate ? dayjs(searchCriteria.EndDate) : null;
    const hasDateRange = !!(fromDj || toDj);
    let filteredData = res || [];
    if (hasDateRange) filteredData = applyDateRangeFilter(filteredData, fromDj, toDj);
    // Enrich with org/group names (same as pullNFAManageFind)
    filteredData = filteredData.map(item => {
      const org = purchaseAllList.find(x => x.id === item.purchOrgId);
      const grp = purchaseGroupAllList.find(x => x.id === item.purchGrpId);
      return { ...item, purchOrg: org?.orgName || item.purchOrg || "", purchGrp: grp?.groupName || item.purchGrp || "" };
    });
    setRecorddata(filteredData);
    setTotalCount(hasDateRange ? filteredData.length : (pageMetadata?.totalCount || filteredData.length));
    setFilterMode(true);
    setFilterQueryParams(queryParams);
    setFilterSearchCriteria(searchCriteria);
    setFilterFromDayjs(fromDj);
    setFilterToDayjs(toDj);
    setAdvFilterOpen(false);
  };

  const clearFilterList = () => {
    setFilterMode(false);
    setFilterQueryParams(null);
    setFilterSearchCriteria(null);
    setFilterFromDayjs(null);
    setFilterToDayjs(null);
    setFilterValues({});
    pullNFAManageFind();
  };

  // ── Export (blob) ──
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const payload = {
        NFAId: filterValues.Id || 0,
        EventCode: filterValues.EventCode || "",
        Subject: filterValues.NfaSubject || "",
        Status: filterValues.Stage || "",
        PurchOrgId: filterValues.PurchOrgId || 0,
        PurchGrpId: filterValues.PurchGrpId || 0,
      };
      const res = await apiClient.api.post(`/api/NFAManage/ExportNFAExcel`, payload, {
        headers: { Authorization: `Bearer ${atoken}` },
        responseType: 'blob',
      });
      if (res?.data) {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/octet-stream' }));
        const link = document.createElement('a');
        link.href = url;
        const contentDisposition = res.headers?.['content-disposition'];
        let fileName = `NFA_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      toast.error(getApiErrorMessage(error), { toastId: "export_nfa_error" });
    } finally {
      setIsExporting(false);
    }
  };

  // ── Add New Modal ──
  const [addModal, setAddModal] = useState(false);
  const [value, setValue] = useState("new");
  const handleChange = (event) => setValue(event.target.value);
  const [templatelist, setTemplateList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const getTemplateList = async () => {
    const data = { CustomerId: customerid, EventType: "NFA" };
    const queryParams = buildQueryParams(data);
    try {
      const res = await apiClient.getres(`/api/EventTemplate/Find?${queryParams}`, atoken);
      if (res?.data?.result) setTemplateList(res.data.result);
      else setTemplateList([]);
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "template_list_error" });
    }
  };

  const handleTemplateNavigation = useCallback(async () => {
    try {
      if (value !== "new") {
        const data = { EventId: selectedTemplate?.eventId, EventType: selectedTemplate?.eventType };
        const queryParams = buildQueryParams(data);
        const res = await apiClient.postres(`/api/NFAManage/NFATemplateClone?${queryParams}`, null, atoken);
        if (res?.data?.length > 0) {
          navigate(`/configuration/manage-nfa/${res.data[0].id}`);
        }
      } else {
        navigate(`/configuration/manage-nfa/add`);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "template_nav_error" });
    }
  }, [selectedTemplate, value]);

  // ── Toolbar state ──
  const [searchText, setSearchText] = useState('');
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [columnVisibility, setColumnVisibility] = useState({
    nfaSubject: true, nfaNumber: true, createdOn: true,
    createdByName: true, stage: true, purchOrg: true, purchGrp: true, action: true,
  });
  const [density, setDensity] = useState('standard');
  const rowHeight = DENSITY_OPTIONS.find(d => d.key === density)?.height ?? 48;
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  // Exclude CustomerId (always set) from the badge count
  const advFilterCount = filterValues
    ? Object.entries(filterValues).filter(([k, v]) => k !== 'CustomerId' && v !== '' && v != null && v !== 0).length
    : 0;

  // ── Client-side matchesFilter for toolbar Filter popover ──
  const matchesFilterItem = (row, f) => {
    let val = '';
    if (f.field === 'nfaSubject') val = (row.nfaSubject || '').toLowerCase();
    else if (f.field === 'nfaNumber') val = (row.nfaNumber || '').toLowerCase();
    else if (f.field === 'createdByName') val = (row.createdByName || '').toLowerCase();
    else if (f.field === 'stage') val = (row.stage || '').toLowerCase();
    const fv = (f.value || '').toLowerCase();
    if (f.operator === 'contains') return val.includes(fv);
    if (f.operator === 'equals') return val === fv;
    if (f.operator === 'startsWith') return val.startsWith(fv);
    if (f.operator === 'endsWith') return val.endsWith(fv);
    if (f.operator === 'isEmpty') return !val;
    if (f.operator === 'isNotEmpty') return !!val;
    return true;
  };

  // ── Client-side search + filter ──
  const filteredData = (Array.isArray(recorddata) ? recorddata : []).filter((row) => {
    // Quick search
    if (searchText) {
      const s = searchText.toLowerCase();
      const matchesSearch = [row.nfaSubject, row.nfaNumber, row.createdByName, row.stage, row.purchOrg, row.purchGrp, String(row.id || ''), row.eventCode]
        .some(v => (v || '').toLowerCase().includes(s));
      if (!matchesSearch) return false;
    }
    // Toolbar Filter popover
    if (filterModel.items.length > 0) {
      if (!filterModel.items.every(f => matchesFilterItem(row, f))) return false;
    }
    return true;
  });

  const getRowId = (row) => row?.id;

  // ── Columns ──
  const columns = [
    {
      field: "nfaSubject",
      headerName: "NFA Subject",
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => `${params?.row?.nfaSubject || ""} ${params?.row?.id || ""} ${params?.row?.nfaNumber || ""}`,
      renderCell: (params) => (
        <div className="rfq-v2-cell" onClick={() => iseditDisabled && navigate(`/configuration/manage-nfa/${params?.row.id}`)}>
          <CommonTooltip title={params?.row?.nfaSubject || ''} placement="bottom">
            <span className="rfq-v2-cell-subject" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {params?.row?.nfaSubject}
            </span>
          </CommonTooltip>
          <span className="rfq-v2-cell-code">
            <span>Event Code: {params?.row?.eventCode || '-'}</span>
          </span>
        </div>
      ),
    },
    {
      field: "createdOn",
      headerName: "Created Date",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className="f12" style={{ cursor: iseditDisabled ? 'pointer' : 'not-allowed' }}
          onClick={() => iseditDisabled && navigate(`/configuration/manage-nfa/${params?.row.id}`)}>
          {params?.formattedValue ? formatDateViaLocale(params?.formattedValue, userDetail) : ""}
        </span>
      ),
    },
    {
      field: "createdByName",
      headerName: "Created By",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className="f12" style={{ cursor: iseditDisabled ? 'pointer' : 'not-allowed' }}
          onClick={() => iseditDisabled && navigate(`/configuration/manage-nfa/${params?.row.id}`)}>
          {params?.formattedValue}
        </span>
      ),
    },
    {
      field: "stage",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => <StatusBadge status={params.row.stage} />,
    },
    {
      field: "purchOrg",
      headerName: "Purchase Org",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => <span className="f12">{params.row.purchOrg}</span>,
    },
    {
      field: "purchGrp",
      headerName: "Purchase Group",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => <span className="f12">{params.row.purchGrp}</span>,
    },
  ];

  return (
    <>
      <div className="rfq-v2-page">

        {/* ── Page header ── */}
        <div className="rfq-v2-page-header">
          <div className="rfq-v2-breadcrumb">
            <span>Home</span>
            <span className="rfq-v2-breadcrumb-sep">/</span>
            <span>Note for Approval</span>
          </div>
          {accessLevel?.list?.created !== "None" && (
            <button className="pe-btn pe-btn--primary" onClick={() => setAddModal(true)}>
              <AddOutlined /> Add New NFA
            </button>
          )}
        </div>

        {/* ── Main card ── */}
        <div className="rfq-v2-card">

          {/* ── Toolbar ── */}
          <PETableToolbar
            searchText={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="Search NFA..."
            showFilter
            filterColumns={FILTER_COLUMNS}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            showColumns
            columns={[
              { field: 'nfaSubject', headerName: 'NFA Subject' },
              { field: 'createdOn', headerName: 'Created Date' },
              { field: 'createdByName', headerName: 'Created By' },
              { field: 'stage', headerName: 'Status' },
              { field: 'purchOrg', headerName: 'Purchase Org' },
              { field: 'purchGrp', headerName: 'Purchase Group' },
              { field: 'action', headerName: 'Action' },
            ]}
            columnVisibilityModel={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            onColumnVisibilityReset={() => setColumnVisibility({
              nfaSubject: true, nfaNumber: true, createdOn: true,
              createdByName: true, stage: true, purchOrg: true, purchGrp: true, action: true,
            })}
            showDensity
            density={density}
            onDensityChange={setDensity}
            showAdvFilter
            advFilterOpen={advFilterOpen}
            onAdvFilterToggle={() => setAdvFilterOpen(v => !v)}
            advFilterCount={advFilterCount}
            advFilterTitle="Advance Search"
            advFilterPanel={
              <FilterNFACell
                handleFilterList={handleFilterList}
                clearFilterList={clearFilterList}
                setFilterValues={setFilterValues}
              />
            }
            showExport
            onExport={handleExportToExcel}
            exportLabel={isExporting ? "Exporting..." : "Export NFA"}
          />

          {/* ── Table ── */}
          <div className="rfq-v2-table-wrapper">
            {gridloading ? (
              <div style={{ padding: 20 }}><GridSkeleton /></div>
            ) : filteredData.length === 0 ? (
              <div className="rfq-v2-empty">
                <p className="rfq-v2-empty-title">No NFA found</p>
                <p className="rfq-v2-empty-sub">
                  {searchText || filterMode
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first NFA to get started.'}
                </p>
              </div>
            ) : (
              <PETable
                className="rfq-v2-datagrid"
                rows={filteredData}
                columns={columns}
                getRowId={getRowId}
                rowHeight={rowHeight}
                pagination
                columnVisibilityModel={columnVisibility}
                disableColumnResize
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Add New NFA Modal ── */}
      <PEModal
        open={addModal}
        onClose={() => setAddModal(false)}
        size="sm"
        title="What would you like to do?"
        footer={
          <>
            <button type="button"
              className="pe-btn pe-btn--ghost"
              onClick={() => setAddModal(false)}>
              Cancel
            </button>
            <button type="button" className="pe-btn pe-btn--primary"
              onClick={handleTemplateNavigation}>
              Continue
            </button>
          </>
        }
      >
        <div style={{ padding: '4px 0' }}>
          <FormControl>
            <RadioGroup name="new-nfa" value={value} onChange={handleChange}>
              <FormControlLabel value="new" control={<Radio size="small" />} label="Create a New NFA" />
              <FormControlLabel value="template" control={<Radio size="small" />} label="Select From Template" />
            </RadioGroup>
          </FormControl>
          {value === 'template' && (
            <div style={{ marginTop: 12 }}>
              <Autocomplete
                disablePortal
                size="small"
                options={templatelist ?? []}
                getOptionLabel={(option) => option.templateTitle ?? ""}
                fullWidth
                renderInput={(params) => (
                  <TextField {...params} InputLabelProps={{ shrink: true }} label="Select Template" />
                )}
                onChange={(e, v) => setSelectedTemplate(v)}
                onOpen={() => { if (templatelist.length === 0) getTemplateList(); }}
              />
            </div>
          )}
        </div>
      </PEModal>
    </>
  );
};

export default ManageNFAV2;
