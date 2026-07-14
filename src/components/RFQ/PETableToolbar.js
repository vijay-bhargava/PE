import React from 'react';
import { Box } from '@mui/material';

/**
 * Layout shell for table toolbars. No built-in buttons — just positions slots.
 *
 * Props:
 *   left   — JSX for left side (search input, dropdowns, labels)
 *   right  — JSX for right side (filter, columns, export, Add button)
 *   above  — JSX rendered as a row above the left/right row (date pickers, secondary filters)
 *   sx     — optional sx override
 */
export function PETableToolbar({ left, right, above, sx }) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      px: 1.5,
      py: 1,
      borderBottom: '1px solid #f3f4f6',
      flexShrink: 0,
      // background: '#fff',
      background: 'lightgreen',
      ...sx,
    }}>
      {above && <Box>{above}</Box>}
      {(left || right) && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{left}</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{right}</Box>
        </Box>
      )}
    </Box>
  );
}
