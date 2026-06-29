import React, { useState, useRef, useEffect, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { HiPencilAlt } from "react-icons/hi";
import { IconButton } from "@mui/material";
import ViewColumnOutlined from "@mui/icons-material/ViewColumnOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SearchOutlined from "@mui/icons-material/Search";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { toast } from "react-toastify";
import "../../assets/css/master-form-panel.css";

export const MfpEditBtn = ({ onClick }) => (
  <IconButton size="small" className="mfp-icon-btn" onClick={onClick}>
    <HiPencilAlt size={14} />
  </IconButton>
);

const FILTER_OPERATORS = ["contains", "equals", "startsWith", "endsWith", "isEmpty", "isNotEmpty"];

function emptyFilter() {
  return { id: Date.now(), field: "", operator: "contains", value: "" };
}

const MasterFormPanel = ({
  title,
  onReset,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  columns = [],
  rows = [],
  gridLoading = false,
  getRowId,
  children,
  isModal = false,
}) => {
  const filterableColumns = columns.filter((c) => c.field !== "action" && c.field !== "Action");

  const initialVisibility = columns.reduce((acc, c) => ({ ...acc, [c.field]: true }), {});
  const [columnVisibility, setColumnVisibility] = useState(initialVisibility);
  const [colOpen, setColOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState([emptyFilter()]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [searchText, setSearchText] = useState("");

  const colRef = useRef(null);
  const filterRef = useRef(null);

  const hiddenCount = Object.values(columnVisibility).filter((v) => !v).length;
  const activeFilterCount = filterModel.items.filter((f) => f.value || f.operator === "isEmpty" || f.operator === "isNotEmpty").length;

  useEffect(() => {
    const handler = (e) => {
      if (colRef.current && !colRef.current.contains(e.target)) setColOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyFilter = () => {
    const items = tempFilters
      .filter((f) => f.field && (f.value || f.operator === "isEmpty" || f.operator === "isNotEmpty"))
      .map((f) => ({ field: f.field, operator: f.operator, value: f.value, id: f.id }));
    setFilterModel({ items });
    setFilterOpen(false);
  };

  const resetFilter = () => {
    setTempFilters([emptyFilter()]);
    setFilterModel({ items: [] });
  };

  const resetColumns = useCallback(() => {
    setColumnVisibility(columns.reduce((acc, c) => ({ ...acc, [c.field]: true }), {}));
  }, [columns]);

  const handleExport = useCallback(() => {
    if (!rows.length) {
      toast.info("No data available to export.", { toastId: "mfp-export-empty" });
      return;
    }
    const exportCols = columns.filter(
      (c) => columnVisibility[c.field] !== false && c.field !== "action" && c.field !== "Action" && !c.renderCell
    );
    if (!exportCols.length) {
      toast.info("Please enable at least one column to export.", { toastId: "mfp-export-no-cols" });
      return;
    }
    const escape = (v) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csvRows = [
      exportCols.map((c) => escape(c.headerName)).join(","),
      ...rows.map((row) => exportCols.map((c) => escape(row[c.field])).join(",")),
    ];
    const blob = new Blob([`﻿${csvRows.join("\r\n")}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [rows, columns, columnVisibility, title]);

  /* quick search via filterModel quickFilterValues */
  const quickFilter = searchText
    ? { ...filterModel, quickFilterValues: [searchText] }
    : { ...filterModel, quickFilterValues: [] };

  return (
    <div className="mfp-shell">
      {!isModal && title && (
        <div className="mfp-page-header">
          <span className="mfp-page-title">{title}</span>
        </div>
      )}

      <div className="mfp-form-section">
        <form
          onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); onSubmit && onSubmit(e); }}
          autoComplete="off"
          className="mfp-form-inner"
        >
          <div className="mfp-fields-area">{children}</div>
          <div className="mfp-actions-row">
            <button type="button" className="pe-btn pe-btn--ghost" onClick={onReset} disabled={loading}>Reset</button>
            <button type="submit" className="pe-btn pe-btn--primary" disabled={loading}>
              {loading ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>

      <div className="mfp-table-section">
        {/* Toolbar */}
        <div className="rfq-v2-toolbar mfp-toolbar">
          <div className="rfq-v2-search-wrapper">
            <input
              className="rfq-v2-search"
              placeholder="Search…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <SearchOutlined className="rfq-v2-search-icon" />
          </div>

          <div className="rfq-v2-toolbar-right">
            {/* Filter button */}
            <div style={{ position: "relative" }} ref={filterRef}>
              <button className="rfq-v2-tbtn" onClick={() => setFilterOpen((v) => !v)}>
                <FilterListOutlined />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rfq-v2-filter-count">{activeFilterCount}</span>
                )}
              </button>
              {filterOpen && (
                <div className="rfq-v2-col-popover rfq-v2-filter-popover">
                  <div className="rfq-v2-col-popover-header">
                    <span className="rfq-v2-col-popover-title">
                      <FilterListOutlined className="rfq-v2-col-title-icon" />
                      Filters
                    </span>
                    <button className="rfq-v2-col-reset" onClick={resetFilter}>Reset</button>
                  </div>
                  <div className="rfq-v2-filter-rows">
                    {tempFilters.map((item, idx) => (
                      <div key={item.id} className="rfq-v2-filter-row-item">
                        <select
                          className="rfq-v2-filter-select"
                          value={item.field}
                          onChange={(e) => setTempFilters((prev) => prev.map((f, i) => i === idx ? { ...f, field: e.target.value } : f))}
                        >
                          <option value="">Column</option>
                          {filterableColumns.map((c) => (
                            <option key={c.field} value={c.field}>{c.headerName}</option>
                          ))}
                        </select>
                        <select
                          className="rfq-v2-filter-select"
                          value={item.operator}
                          onChange={(e) => setTempFilters((prev) => prev.map((f, i) => i === idx ? { ...f, operator: e.target.value } : f))}
                        >
                          {FILTER_OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
                        </select>
                        {item.operator !== "isEmpty" && item.operator !== "isNotEmpty" && (
                          <input
                            type="text"
                            className="rfq-v2-filter-value-input"
                            placeholder="Filter value"
                            value={item.value}
                            onChange={(e) => setTempFilters((prev) => prev.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))}
                          />
                        )}
                        {tempFilters.length > 1 && (
                          <button className="rfq-v2-filter-remove-btn" onClick={() => setTempFilters((prev) => prev.filter((_, i) => i !== idx))}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="rfq-v2-filter-popover-footer">
                    <button className="rfq-v2-filter-add-btn" onClick={() => setTempFilters((prev) => [...prev, emptyFilter()])}>+ Add filter</button>
                    <button className="rfq-v2-filter-apply-btn" onClick={applyFilter}>Apply</button>
                  </div>
                </div>
              )}
            </div>

            {/* Columns button */}
            <div style={{ position: "relative" }} ref={colRef}>
              <button className="rfq-v2-tbtn" onClick={() => setColOpen((v) => !v)}>
                <ViewColumnOutlined />
                Columns
                {hiddenCount > 0 && <span className="rfq-v2-filter-count">{hiddenCount}</span>}
              </button>
              {colOpen && (
                <div className="rfq-v2-col-popover" style={{ zIndex: 99999 }}>
                  <div className="rfq-v2-col-popover-header">
                    <span className="rfq-v2-col-popover-title">
                      <ViewColumnOutlined className="rfq-v2-col-title-icon" />
                      Manage Columns
                    </span>
                    <button className="rfq-v2-col-reset" onClick={resetColumns}>Reset</button>
                  </div>
                  <div className="rfq-v2-col-list">
                    {columns.map((col) => (
                      <label key={col.field} className="rfq-v2-col-item">
                        <input
                          type="checkbox"
                          className="rfq-v2-col-check"
                          checked={columnVisibility[col.field] !== false}
                          onChange={() => setColumnVisibility((prev) => ({ ...prev, [col.field]: !prev[col.field] }))}
                        />
                        <span className="rfq-v2-col-label">{col.headerName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export button */}
            <button
              type="button"
              className="rfq-v2-tbtn rfq-v2-tbtn-export"
              onClick={handleExport}
              disabled={!rows.length}
            >
              <FileDownloadOutlined />
              Export
              <KeyboardArrowDownOutlined className="export-chevron" />
            </button>
          </div>
        </div>

        <DataGrid
          getRowId={getRowId}
          rows={rows}
          loading={gridLoading}
          columns={columns}
          rowHeight={45}
          columnHeaderHeight={40}
          disableDensitySelector
          disableColumnMenu
          disableRowSelectionOnClick
          disableColumnResize
          disableColumnReorder
          className="f13 border-0 consistent-datagrid"
          style={{ width: "100%", flex: 1, border: "none" }}
          columnVisibilityModel={columnVisibility}
          filterModel={quickFilter}
          onFilterModelChange={(m) => setFilterModel(m)}
          sx={{
            "& .MuiDataGrid-main": { overflow: "hidden" },
            "& .MuiDataGrid-virtualScroller": { overflowX: "hidden !important" },
          }}
        />
      </div>
    </div>
  );
};

export default MasterFormPanel;
