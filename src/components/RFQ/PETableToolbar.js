import React, { useState, useRef, useEffect } from 'react';
import {
  FilterListOutlined, ViewColumnOutlined, DensityMediumOutlined,
  TuneOutlined, FileDownloadOutlined, SearchOutlined,
  DensitySmallOutlined, DensityLargeOutlined,
} from '@mui/icons-material';
import { HiOutlineX } from 'react-icons/hi';

const DENSITY_OPTIONS = [
  { key: 'compact', label: 'Compact', Icon: DensitySmallOutlined },
  { key: 'standard', label: 'Standard', Icon: DensityMediumOutlined },
  { key: 'comfortable', label: 'Comfortable', Icon: DensityLargeOutlined },
];
const DEFAULT_OPERATORS = ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];

/**
 * Reusable toolbar for list pages (RFQ, Reports, Auction, etc.)
 * All UI state (popover open/close, tempFilterItems) is internal.
 * Only committed values are pushed to the page via callbacks.
 *
 * Props:
 *  Search:
 *    searchText, onSearchChange, searchPlaceholder
 *
 *  Feature flags (all false by default):
 *    showFilter, showColumns, showDensity, showAdvFilter, showExport
 *
 *  Filter popover (needs showFilter=true):
 *    filterColumns   — [{ field, label }]  columns shown in the Column dropdown
 *    filterModel     — { items: [] }       current committed filter (from page state)
 *    onFilterModelChange — (model) => void
 *
 *  Columns popover (needs showColumns=true):
 *    columns              — [{ field, headerName }]  full columns list
 *    hiddenAlways         — string[]  fields never shown in list or count (e.g. ['id','eventCode'])
 *    columnVisibilityModel — { field: bool }
 *    onColumnVisibilityChange — (newModel) => void
 *    onColumnVisibilityReset  — () => void
 *
 *  Advance Filter (needs showAdvFilter=true):
 *    advFilterOpen      — bool (controlled by page)
 *    onAdvFilterToggle  — () => void
 *    advFilterCount     — number (badge, 0 = no badge)
 *    advFilterTitle     — string (panel header, default 'Advance Search')
 *    advFilterPanel     — JSX  (form content rendered inside the slide-in panel body)
 *
 *  Density (needs showDensity=true):
 *    density, onDensityChange
 *
 *  Export (needs showExport=true):
 *    onExport, exportLoading, exportLabel
 */
export function PETableToolbar({
  // Search
  searchText = '',
  onSearchChange,
  searchPlaceholder = 'Search...',

  // Feature flags
  showFilter = false,
  showColumns = false,
  showDensity = false,
  showAdvFilter = false,
  showExport = false,

  // Filter popover
  filterColumns = [],
  filterModel = { items: [] },
  onFilterModelChange,

  // Columns popover
  columns = [],
  hiddenAlways = [],
  columnVisibilityModel = {},
  onColumnVisibilityChange,
  onColumnVisibilityReset,

  // Density
  density = 'standard',
  onDensityChange,

  // Advance filter
  advFilterOpen = false,
  onAdvFilterToggle,
  advFilterCount = 0,
  advFilterTitle = 'Advance Search',
  advFilterPanel,

  // Export
  onExport,
  exportLoading = false,
  exportLabel = 'Export',

  // Extra buttons rendered before the standard right-side buttons
  rightContent,
}) {
  // Internal popover open state
  const [filterAnchor, setFilterAnchor] = useState(false);
  const [colAnchor, setColAnchor] = useState(false);
  const [densityAnchor, setDensityAnchor] = useState(false);

  const filterRef = useRef(null);
  const colRef = useRef(null);
  const densityRef = useRef(null);

  const _idRef = useRef(0);
  const emptyItem = () => ({
    id: ++_idRef.current,
    field: filterColumns[0]?.field || '',
    operator: 'contains',
    value: '',
  });

  const [tempItems, setTempItems] = useState(() => [emptyItem()]);

  // Sync tempItems from committed filterModel when popover opens
  useEffect(() => {
    if (!filterAnchor) return;
    if (filterModel.items.length > 0) {
      setTempItems(filterModel.items.map(f => ({ ...f })));
    } else {
      setTempItems([emptyItem()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAnchor]);

  // Outside-click: filter popover
  useEffect(() => {
    if (!filterAnchor) return;
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterAnchor(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [filterAnchor]);

  // Outside-click: columns popover
  useEffect(() => {
    if (!colAnchor) return;
    const h = (e) => {
      if (colRef.current && !colRef.current.contains(e.target)) setColAnchor(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [colAnchor]);

  // Outside-click: density popover
  useEffect(() => {
    if (!densityAnchor) return;
    const h = (e) => {
      if (densityRef.current && !densityRef.current.contains(e.target)) setDensityAnchor(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [densityAnchor]);

  const applyFilter = () => {
    const valid = tempItems.filter(
      f => f.operator === 'isEmpty' || f.operator === 'isNotEmpty' || (f.value && f.value.trim())
    );
    onFilterModelChange?.({ items: valid });
    setFilterAnchor(false);
  };

  const resetFilter = () => {
    onFilterModelChange?.({ items: [] });
    setTempItems([emptyItem()]);
    setFilterAnchor(false);
  };

  const activeFilterCount = filterModel.items.length;

  const hiddenColCount = Object.entries(columnVisibilityModel)
    .filter(([f, v]) => !hiddenAlways.includes(f) && v === false).length;

  const visibleColumns = columns.filter(c => !hiddenAlways.includes(c.field));

  return (
    <>
      {/* ── Toolbar row ── */}
      <div className="rfq-v2-toolbar">
        {/* Search */}
        <div className="rfq-v2-search-wrapper">
          <input
            className="rfq-v2-search"
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <SearchOutlined className="rfq-v2-search-icon" />
        </div>

        {/* Right side buttons */}
        <div className="rfq-v2-toolbar-right">
          {rightContent}

          {/* ── Filter popover ── */}
          {showFilter && (
            <div style={{ position: 'relative' }}>
              <button
                className={activeFilterCount > 0 ? 'rfq-v2-tbtn active' : 'rfq-v2-tbtn'}
                onClick={() => setFilterAnchor(v => !v)}
              >
                <FilterListOutlined />
                Filter
                {activeFilterCount > 0 && (
                  <span className="rfq-v2-filter-count">{activeFilterCount}</span>
                )}
              </button>

              {filterAnchor && (
                <div className="rfq-v2-col-popover rfq-v2-filter-popover" ref={filterRef}>
                  <div className="rfq-v2-col-popover-header">
                    <span className="rfq-v2-col-popover-title">
                      <FilterListOutlined className="rfq-v2-col-title-icon" />
                      Filters
                    </span>
                    <button className="rfq-v2-col-reset" onClick={resetFilter}>Reset</button>
                  </div>

                  <div className="rfq-v2-filter-rows">
                    {tempItems.map((item, idx) => (
                      <div key={item.id} className="rfq-v2-filter-row-item">
                        <select
                          className="rfq-v2-filter-select"
                          value={item.field}
                          onChange={e => setTempItems(prev =>
                            prev.map((f, i) => i === idx ? { ...f, field: e.target.value } : f)
                          )}
                        >
                          {filterColumns.map(c => (
                            <option key={c.field} value={c.field}>{c.label}</option>
                          ))}
                        </select>

                        <select
                          className="rfq-v2-filter-select"
                          value={item.operator}
                          onChange={e => setTempItems(prev =>
                            prev.map((f, i) => i === idx ? { ...f, operator: e.target.value } : f)
                          )}
                        >
                          {DEFAULT_OPERATORS.map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>

                        {item.operator !== 'isEmpty' && item.operator !== 'isNotEmpty' && (
                          <input
                            type="text"
                            className="rfq-v2-filter-value-input"
                            placeholder="Filter value"
                            value={item.value}
                            onChange={e => setTempItems(prev =>
                              prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f)
                            )}
                          />
                        )}

                        {tempItems.length > 1 && (
                          <button
                            className="rfq-v2-filter-remove-btn"
                            onClick={() => setTempItems(prev => prev.filter((_, i) => i !== idx))}
                          >×</button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rfq-v2-filter-popover-footer">
                    <button
                      className="rfq-v2-filter-add-btn"
                      onClick={() => setTempItems(prev => [...prev, emptyItem()])}
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
          )}

          {/* ── Columns popover ── */}
          {showColumns && (
            <div style={{ position: 'relative' }}>
              <button className="rfq-v2-tbtn" onClick={() => setColAnchor(v => !v)}>
                <ViewColumnOutlined />
                Columns
                {hiddenColCount > 0 && (
                  <span className="rfq-v2-filter-count">{hiddenColCount}</span>
                )}
              </button>

              {colAnchor && (
                <div className="rfq-v2-col-popover" ref={colRef}>
                  <div className="rfq-v2-col-popover-header">
                    <span className="rfq-v2-col-popover-title">
                      <ViewColumnOutlined className="rfq-v2-col-title-icon" />
                      Manage Columns
                    </span>
                    <button className="rfq-v2-col-reset" onClick={() => onColumnVisibilityReset?.()}>
                      Reset
                    </button>
                  </div>

                  {visibleColumns.map(col => (
                    <label key={col.field} className="rfq-v2-col-item">
                      <input
                        type="checkbox"
                        className="rfq-v2-col-check"
                        checked={columnVisibilityModel[col.field] !== false}
                        onChange={() => {
                          const next = {
                            ...columnVisibilityModel,
                            [col.field]: columnVisibilityModel[col.field] === false ? true : false,
                          };
                          onColumnVisibilityChange?.(next);
                        }}
                      />
                      <span className="rfq-v2-col-label">{col.headerName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Advance Filter button ── */}
          {showAdvFilter && (
            <button
              className={advFilterCount > 0 ? 'rfq-v2-tbtn active' : 'rfq-v2-tbtn'}
              onClick={onAdvFilterToggle}
            >
              <TuneOutlined />
              Advance Filter
              {advFilterCount > 0 && (
                <span className="rfq-v2-filter-count">{advFilterCount}</span>
              )}
            </button>
          )}

          {/* ── Density popover ── */}
          {showDensity && (
            <div style={{ position: 'relative' }}>
              <button className="rfq-v2-tbtn" onClick={() => setDensityAnchor(v => !v)}>
                <DensityMediumOutlined />
                Density
              </button>

              {densityAnchor && (
                <div className="rfq-v2-col-popover" ref={densityRef} style={{ minWidth: 170, right: 0, left: 'auto' }}>
                  {DENSITY_OPTIONS.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      onClick={() => { onDensityChange?.(key); setDensityAnchor(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '8px 14px', textAlign: 'left', border: 'none', cursor: 'pointer',
                        fontSize: 13,
                        background: density === key ? '#eff6ff' : 'transparent',
                        color: density === key ? '#1976d2' : '#374151',
                        fontWeight: density === key ? 600 : 400,
                      }}
                    >
                      <Icon style={{ fontSize: 14, opacity: 0.75 }} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Export button ── */}
          {showExport && (
            <button
              type="button"
              className="rfq-v2-tbtn rfq-v2-tbtn-export"
              onClick={onExport}
              disabled={exportLoading}
            >
              <FileDownloadOutlined />
              {exportLoading ? 'Exporting...' : exportLabel}
            </button>
          )}
        </div>
      </div>

      {/* ── Advance Filter slide-in panel ── */}
      {showAdvFilter && advFilterOpen && (
        <div className="rfq-v2-filter-panel">
          <div className="rfq-v2-filter-panel-header">
            <h3 className="rfq-v2-filter-panel-title">{advFilterTitle}</h3>
            <button
              className="pe-icon-btn pe-icon-btn--close"
              onClick={onAdvFilterToggle}
              aria-label="Close"
            >
              <HiOutlineX size={16} />
            </button>
          </div>
          <div className="rfq-v2-filter-panel-body">
            {advFilterPanel}
          </div>
        </div>
      )}
    </>
  );
}
