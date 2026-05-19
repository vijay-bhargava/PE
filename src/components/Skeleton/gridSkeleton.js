import React, { useEffect, useState, useCallback, useRef } from "react";
import {
	Autocomplete,
	Box,
	Button,
	Drawer,
	IconButton,
	Skeleton,
	Switch,
	Tab,
	Tabs,
	TextField,
	Tooltip,
} from "@mui/material";

const GridSkeleton = () => {
        return(
          <>
         <Box sx={{ height: 400, width: '100%' }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, padding: 1 }}>
            <Skeleton variant="text" width="30%" height={40} />
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="text" width="50%" height={40} />
          </Box>
        </Box>
          </>
        );
};

export default GridSkeleton;