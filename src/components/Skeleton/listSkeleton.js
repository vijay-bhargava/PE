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

const ListSkeleton = () => {
  return (
    <div className="scroll-container">
      <div className={`itemwp mb-1 hover-div`}>
        <div className='d-flex mb-2 list'>
          <div className='flex-grow-1 p-2'>
            <Skeleton variant="rectangular" height={80} />
            <Skeleton width="60%" height={20} style={{ marginTop: '10px' }} />
            <Skeleton width="40%" height={20} style={{ marginTop: '5px' }} />
            <div className='d-flex mt-2'>
              <Skeleton width="30%" height={20} style={{ marginRight: '10px' }} />
              <Skeleton width="30%" height={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ListSkeleton;