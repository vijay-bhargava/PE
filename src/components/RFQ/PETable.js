import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ─── Shared design tokens ────────────────────────────────────────────────────
const T = {
  headerBg: '#f9fafb',
  headerBorder: '1px solid #e5e7eb',
  headerFontSize: 12,
  headerFontWeight: 600,
  headerColor: '#6b7280',
  cellBorder: '1px solid #f3f4f6',
  cellFontSize: 13,
  cellColor: '#1f2937',
  cellPadding: '8px 12px',
  rowHoverBg: '#f8fafc',
  rowSelectedBg: '#eff6ff',
  footerBorder: '1px solid #e5e7eb',
  outerBorder: '1px solid #e5e7eb',
  borderRadius: 8,
  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
};

// ─── Canonical DataGrid sx ───────────────────────────────────────────────────
const CANONICAL_SX = {
  border: 'none',
  flex: 1,
  minHeight: 0,
  height: '100%',
  fontFamily: T.fontFamily,
  '& .MuiDataGrid-columnHeaders': {
    // background: T.headerBg,
    backgound: "#e7dc7b",
    borderBottom: T.headerBorder,
    minHeight: '40px !important',
    maxHeight: '40px !important',
    lineHeight: '40px',
  },
  '& .MuiDataGrid-columnHeadersInner': { background: T.headerBg },
  '& .MuiDataGrid-columnHeader': { height: '40px !important', padding: '0 16px' },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontSize: T.headerFontSize,
    fontWeight: T.headerFontWeight,
    color: T.headerColor,
    textTransform: 'none',
    letterSpacing: 0,
  },
  '& .MuiDataGrid-cell': {
    borderBottom: T.cellBorder,
    fontSize: T.cellFontSize,
    color: T.cellColor,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiDataGrid-cell--withRenderer': { display: 'flex', alignItems: 'center' },
  '& .MuiDataGrid-row:hover': { background: T.rowHoverBg },
  '& .MuiDataGrid-row.Mui-selected': { background: T.rowSelectedBg },
  '& .MuiDataGrid-row.Mui-selected:hover': { background: T.rowSelectedBg },
  '& .MuiDataGrid-columnSeparator': { visibility: 'hidden' },
  '& .MuiDataGrid-footerContainer': {
    borderTop: T.footerBorder,
    minHeight: 44,
    padding: '0 8px',
    flexShrink: 0,
  },
  '& .MuiDataGrid-sortIcon': { color: '#9ca3af', opacity: 1 },
  '& .MuiDataGrid-menuIconButton': { color: '#9ca3af', opacity: 1 },
  '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
  '& .MuiDataGrid-main': { overflow: 'auto' },
  '& .MuiTablePagination-root': { fontSize: 12, color: T.headerColor },
  '& .MuiTablePagination-selectLabel': { fontSize: 12, color: T.headerColor, margin: 0, display: 'block !important' },
  '& .MuiTablePagination-displayedRows': { fontSize: 12, color: T.headerColor, margin: 0 },
  '& .MuiTablePagination-input': { display: 'inline-flex !important', alignItems: 'center' },
  '& .MuiSelect-select': { fontSize: 12, py: '0 !important' },
};

// ─── PETable (DataGrid wrapper) ──────────────────────────────────────────────
/**
 * Drop-in DataGrid wrapper with canonical RFQ styling pre-applied.
 *
 * Usage:
 *   <PETable rows={rows} columns={cols} toolbar={<PETableToolbar left={...} right={...} />} />
 *
 * Props:
 *   rows, columns   — required
 *   toolbar         — optional JSX injected as DataGrid slots.toolbar
 *   sx              — optional sx override (array-merged on top of canonical)
 *   ...rest         — all other DataGrid props forwarded as-is
 */
export function PETable({ rows, columns, toolbar, sx, slots, slotProps, rowHeight = 52, ...rest }) {
  const mergedSx = [CANONICAL_SX, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])];

  const mergedSlots = toolbar
    ? { toolbar: () => toolbar, ...(slots || {}) }
    : (slots || {});

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowHeight={rowHeight}
      columnHeaderHeight={40}
      sx={mergedSx}
      slots={mergedSlots}
      slotProps={slotProps}
      pageSizeOptions={[5, 10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      {...rest}
    />
  );
}


// ─── PETableSimple (MUI Table wrapper) ───────────────────────────────────────
/**
 * MUI Table wrapper for small drawer/inline tables with inline-editable cells.
 * Toolbar fixed at top, pagination fixed at bottom, table scrolls internally.
 *
 * Usage:
 *   <PETableSimple
 *     columns={[
 *       { key: 'name', label: 'Name' },
 *       { key: 'check', label: '', renderHeader: () => <Checkbox />, renderCell: (v, row) => <Checkbox /> },
 *     ]}
 *     rows={filteredList}
 *     page={page} pageSize={pageSize} totalRows={list.length}
 *     onPageChange={setPage} onPageSizeChange={setPageSize}
 *   />
 *
 * Columns shape:
 *   key            — maps to row[key] for default render
 *   label          — header text
 *   width?         — applied to <th> (e.g. '5%', 120)
 *   align?         — 'left' | 'center' | 'right' (default: 'left')
 *   whiteSpace?    — 'nowrap' | 'normal'
 *   renderHeader() — custom header cell content (e.g. select-all checkbox)
 *   renderCell(value, row) — custom cell content
 *
 * Pagination props (all optional — omit for tables with no pagination):
 *   page, pageSize, totalRows, onPageChange, onPageSizeChange, pageSizeOptions
 */
export function PETableSimple({
  columns,
  rows,
  getRowKey,
  wrapperStyle,
  getExpandContent,      // optional: (row) => JSX — enables expandable rows
  expandedKeys: controlledExpandedKeys,  // optional: controlled Set of expanded row keys
  onExpandToggle,        // optional: (key) => void — called when a row is toggled in controlled mode
}) {
  const [internalKeys, setInternalKeys] = useState(new Set());
  const isControlled = controlledExpandedKeys !== undefined;
  const expandedKeys = isControlled ? controlledExpandedKeys : internalKeys;

  const toggleExpand = (key) => {
    if (isControlled) {
      onExpandToggle?.(key);
    } else {
      setInternalKeys(prev => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
      });
    }
  };

  // In controlled mode the caller provides their own expand column; only add the auto column in uncontrolled mode.
  const allColumns = (getExpandContent && !isControlled)
    ? [{
      key: '__expand__', label: '', width: 48,
      renderCell: (_, row, index) => {
        const key = getRowKey ? getRowKey(row, index) : index;
        return (
          <IconButton size="small" onClick={() => toggleExpand(key)}
            sx={{ transition: 'transform 0.3s', transform: expandedKeys.has(key) ? 'rotate(90deg)' : 'none' }}
          >
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          </IconButton>
        );
      },
    }, ...columns]
    : columns;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      borderRadius: `${T.borderRadius}px`,
      border: T.outerBorder,
      overflow: 'hidden',
      ...wrapperStyle,
    }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
        <Table stickyHeader sx={{ borderCollapse: 'collapse', fontSize: T.cellFontSize, minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              {allColumns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    padding: T.cellPadding,
                    fontWeight: T.headerFontWeight,
                    fontSize: T.headerFontSize,
                    color: T.headerColor,
                    background: T.headerBg,
                    borderBottom: T.headerBorder,
                    width: col.width,
                    textAlign: col.align ?? 'left',
                    whiteSpace: col.whiteSpace ?? 'nowrap',
                    lineHeight: 1.4,
                  }}
                >
                  {col.renderHeader ? col.renderHeader() : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  sx={{ textAlign: 'center', py: 4, color: T.headerColor, fontSize: T.cellFontSize, border: 'none' }}
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : rows.map((row, index) => {
              const key = getRowKey ? getRowKey(row, index) : index;
              const isExpanded = expandedKeys.has(key);
              return (
                <React.Fragment key={key}>
                  <TableRow sx={{
                    '&:hover': { background: T.rowHoverBg },
                    background: isExpanded ? '#f0f6ff' : 'inherit',
                  }}>
                    {allColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          padding: T.cellPadding,
                          color: T.cellColor,
                          fontSize: T.cellFontSize,
                          textAlign: col.align ?? 'left',
                          border: 'none',
                          borderBottom: T.cellBorder,
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.renderCell ? col.renderCell(row[col.key], row, index) : (row[col.key] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && getExpandContent && (
                    <TableRow>
                      <TableCell colSpan={allColumns.length} sx={{ p: 0, border: 'none', borderBottom: T.headerBorder, background: '#f8fafc' }}>
                        {getExpandContent(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
