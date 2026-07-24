import React from 'react';
import { Box, IconButton, MenuItem, Select, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const T = {
  headerColor: '#6b7280',
  cellColor: '#1f2937',
  footerBorder: '1px solid #e5e7eb',
};

/**
 * Standalone pagination bar — use anywhere you have a table without PETableSimple.
 *
 * Props:
 *   page             — current page (1-indexed)
 *   pageSize         — rows per page
 *   totalRows        — total row count
 *   onPageChange     — (newPage: number) => void
 *   onPageSizeChange — (newSize: number) => void
 *   pageSizeOptions  — default [10, 25, 50]
 *   sx               — optional Box sx override
 */
export function PEPagination({
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  sx,
  className,
}) {
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <Box className={className} sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 2,
      px: 1.5,
      py: 0.75,
      borderTop: T.footerBorder,
      flexShrink: 0,
      minHeight: 44,
      background: '#fff',
      ...sx,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: 12, color: T.headerColor }}>Rows per page:</Typography>
        <Select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          size="small"
          variant="standard"
          disableUnderline
          sx={{ fontSize: 12, color: T.cellColor, '& .MuiSelect-select': { py: 0 } }}
        >
          {pageSizeOptions.map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: 12 }}>{n}</MenuItem>
          ))}
        </Select>
      </Box>

      <Typography sx={{ fontSize: 12, color: T.headerColor }}>
        {from}–{to} of {totalRows}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size="small" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
