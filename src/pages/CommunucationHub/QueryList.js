import { ExpandMore } from '@mui/icons-material';
import { IconButton, InputAdornment, MenuItem, TextField, Tooltip ,Alert} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { BackButton } from '../../utils/common/component';
import { actionTypes, useStateValue } from '../../store';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiArrowRight, HiClock, HiFilter, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

import { buildQueryParams, formatDateViaLocale } from '../../utils/common/utility';
import { ApiClient } from '../../Apiclient';
import { CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';
// const QueryList = forwardRef(({props},Queryref) => {
const QueryList = forwardRef(({ fromEventPage = false, EventId, EventType,permissionManager }, Queryref) => {

  const [{ atoken, customerid, userDetail, customersuffix, NotificationlistRaiseQuery }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);


  const location = useLocation();
  const queryparams = new URLSearchParams(location.search);
  useEffect(() => {

    if (fromEventPage) {
      pullMessageList(EventId, EventType);
    } else {
      pullMessageList();
    }
  }, [EventType, EventId]);

  const pullMessageList = async (EventId = null, EventType = null) => {
    const data = {
      CustomerId: customerid,
      SortingColumn: "Id",
      //CommDetails_CommParticipantUser_UserId: userDetail?.id,
    };

    if (fromEventPage) {
      data.EventId = EventId;
      data.EventType = EventType;
    }
    const queryParams = buildQueryParams(data);
    const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken);
    if (res) {
      const data = res?.data?.result;
      dispatch({ type: actionTypes.SET_NotificationlistRaiseQuery, value: data });
    }
  };


  useImperativeHandle(Queryref, () => ({
    handleDrawer: () => {

    }
  }))

  useEffect(() => {

    const data = queryparams.get("CommId")?.trim();
    if (data) {
      dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
    }
  }, [location.search]);

  const navigate = useNavigate();

  const handleClick = (row) => {
    
    const CommId = row?.commDetails[0]?.commId;

    const data = {
      CommId: CommId
    }
    const queryParams = buildQueryParams(data)
    const targetPath = `/${row.urllink}`;
    const targetFullPath = `${targetPath}${queryParams ? `?${queryParams}` : ''}`;
    // Compare current location with target
    const currentPath = location.pathname;
    const currentSearch = location.search.replace(/^\?/, ''); // remove "?" for comparison
    dispatch({ type: actionTypes.SET_NotificationDrawer, value: false });
    
    // Set a flag to indicate source is from QueryList
    dispatch({ type: actionTypes.SET_MessageSource, value: 'querylist' });

    if (currentSearch == queryParams) {

      dispatch({ type: actionTypes.SET_Opendrawer, value: true });


    }
    else {

      if (queryParams)
        //navigate(`/${row.urllink}?${queryParams}`);

        navigate(`/${row.urllink}`);

      // Redirect to the URL
      else
        navigate(`/${row.urllink}`);
    }
  };
  // Define columns for the DataGrid
  const columns = [
  {
    field: 'eventId',
    headerName: 'ID',
    width: 100,
    renderCell: (params) => (
      <div
        onClick={() => handleClick(params.row)}
        className="custom-link textDefault text-dark-blue"
        style={{ cursor: 'pointer' }}
      >
        {params.row.eventCode || params.row.eventId}
      </div>
    ),
  },
  {
    field: 'queryText',
    headerName: 'Query Description',
    width: 400,
    renderCell: (params) => {
      const fullQueryText = params.row.commDetails[0]?.queryText?.replace(/<\/?[^>]+(>|$)/g, "") || '';
      const truncatedText = fullQueryText?.length > 50
        ? fullQueryText.slice(0, 50) + '...'
        : fullQueryText;

      return (
        <div
          onClick={() => handleClick(params.row)}
          className="custom-link textDefault text-dark-blue"
          title={fullQueryText}
          style={{ cursor: 'pointer' }}
        >
          {truncatedText}
        </div>
      );
    },
  },
  {
    field: 'eventType',
    headerName: 'Event Type',
    width: 150,
    renderCell: (params) => {
      const eventType = params.value?.toLowerCase();
      let displayValue = params.value;

      if (eventType === 'vq') {
        displayValue = 'Supplier Qualification';
      } else if (eventType === 'qr') {
        displayValue = 'Supplier Registration';
      }

      return (
        <div
          onClick={() => handleClick(params.row)}
          className="custom-link textDefault text-dark-blue"
          style={{ cursor: 'pointer' }}
        >
          {displayValue}
        </div>
      );
    },
  },
  {
    field: 'userName',
    headerName: 'Initiator',
    width: 150,
    renderCell: (params) => {
      const initiatorName = params.row.commDetails[0]?.createdByName || 'Unknown';
      return (
        <div
          onClick={() => handleClick(params.row)}
          className="custom-link textDefault text-dark-blue"
          style={{ cursor: 'pointer' }}
        >
          {initiatorName}
        </div>
      );
    },
  },
  {
    field: 'initiationTime',
    headerName: 'Initiation Time',
    width: 180,
    valueGetter: (params) => params.row.createdOn,
    renderCell: (params) => (
      <div
        onClick={() => handleClick(params.row)}
        className="custom-link textDefault text-dark-blue"
        style={{ cursor: 'pointer' }}
      >
        {params.formattedValue
          ? formatDateViaLocale(params.formattedValue, userDetail)
          : ""}
      </div>
    ),
  },
];



  return (
    <>

      {!fromEventPage && (
        <div className='d-flex justify-content-between minh50px align-items-center p-1 bg-grey'>
          <BackButton title="Help & Support" />
        </div>
      )}
      <div className="query-list-container">
        <div>
          <div>

            {(() => {
												const canRead = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ) ?? false;
												const canEdit = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.EDIT) ?? false;
												const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? false;
												const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.REMOVE) ?? false;

												// If no read permission, deny access completely
												if (!canRead) {
													return (
														<div className="p-4">
															<Alert severity="error">
																<div className="d-flex align-items-center">
																	<HiOutlineX className="me-2 f18" />
																	Access Denied: You don't have permission to view Queries.
																</div>
															</Alert>
														</div>
													);
												}

												return (
                          <div className='mt-2'>
                            {NotificationlistRaiseQuery && NotificationlistRaiseQuery?.length > 0 ? (
                              <DataGrid
                                rows={NotificationlistRaiseQuery}
                                columns={columns}
                                rowHeight={45}
                                columnHeaderHeight={40}
                                className="f13 bg-white data-grid-scrollable"
                                disableSelectionOnClick
                                slots={{ toolbar: GridToolbar }}
                                slotProps={{
                                  toolbar: {
                                    showQuickFilter: true,
                                  },
                                }}
                              />
                            ) : (
                              <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#555',
                                fontSize: '16px',
                                fontWeight: '500',
                                userSelect: 'none',
                              }}>
                              
                                <div>
                                  No queries found.<br />
                                  Feel free to <strong>raise a query</strong> to get started!
                                </div>
                              </div>

                            )}
                          </div>
												);
            })()}
          </div>
        </div>
      </div>
    </>
  );
});

export default QueryList;
