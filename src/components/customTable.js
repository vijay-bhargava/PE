import React, { useState, useMemo, useCallback, } from 'react';
import { Box, Tooltip, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { HiX } from 'react-icons/hi';
import { format } from 'date-fns';
import { formatDateViaTime, formattimeoption } from '../utils/common/utility';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { getStageInfo } from '../utils/common/index'
import { ApiClient, api } from "../Apiclient";
import { actionTypes, useStateValue } from "../store";
import { toast } from "react-toastify";
import { useSearchParams } from 'react-router-dom';

// Helper function to get initials from a name
const getInitials = (name) => {

  const names = name.split(' ');

  return names.length > 1 ? `${names[0][0]} ${names[1][0] ?? ""}` : names[0][0];
};

const CustomTable = ({ data, onDelete, accessLevel, stagelist, eventCode, eventSubject, startDate, endDate }) => {

  const [openDialog, setOpenDialog] = useState(false);
  const [approverToDelete, setApproverToDelete] = useState(null);
  const [{ atoken, rtoken, customersuffix }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [searchParams, setSearchParams] = useSearchParams(window.location.search);
  const params = new URLSearchParams(searchParams);
  const actionType = params.get("ActionType");
  const groupedData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.approverSeq]) {
        acc[item.approverSeq] = [];
      }
      acc[item.approverSeq].push(item);
      return acc;
    }, {});

    return Object.values(grouped).map((group) => ({
      ...group[0],
      count: group.length - 1,
      approvers: group
    }));
  }, [data]);

  const handleDeleteApprover = useCallback((approverToDelete) => {
    setApproverToDelete(approverToDelete);
    setOpenDialog(true);
  }, []);

  const handleSendReminder = async (approver) => {

    const stageInfo = getStageInfo(approver.stage, stagelist);
    const data = {
      "email": [approver.approverEmaiId],
      "eventId": approver.eventId,
      "eventType": approver.eventType,
      "stage": "Approval Reminder",
      "eventCode": eventCode,
      "eventSubject": eventSubject,
      "startDate": startDate,
      "endDate": endDate,
      "userType": "A"
    };
    const res = await apiClient.postres(`/api/eventapprover/SendReminder`, data, atoken)
    if (res) {
      // fetchEventApprovers(requestCell)
      toast.success("Reminder send successfully", {
        toastId: "SendReminderApprover"
      });
    }
  }



  const confirmDelete = () => {
    if (approverToDelete && onDelete) {
      // Handle the delete action here
      onDelete(approverToDelete);
    }
    setOpenDialog(false);
  };

  const cancelDelete = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ boxShadow: 'none' }}>
      <div className="custom-table">
        <div className="table-body">
          {groupedData.map((row, index) => {
            const completionDt =
              row.actionType === 'Approved'
                ? row.completionDt
                : row.actionType === 'Pending'
                  ? row.completionDt
                  : null;
            
            const formattedDate = completionDt
              ? formatDateViaTime(completionDt, 'en-GB', formattimeoption)
              : '';
              
            const newFormattedDate = row.completionDt ? formatDateViaTime(row.completionDt, 'en-GB', formattimeoption) : '';
            const uniqueKey = row.uniqueId || index;

            return (
              <div key={`row-${uniqueKey}`} className={`row table-row mx-0`}>
                {/* <div className="col-1 serial-count-container">
                  <span className={`serial-count `}>{row.approverSeq}</span>
                </div> */}
                <div className="col-12 cell-content ps-0">
                  <div className="row justify-content-between approver-name mx-0">
 <div className="col-12 px-0">
  <div>
    {row.approvers.map((approver) => (
      <div
        key={approver.uniqueId}
        className="d-flex align-items-start mb-2"
        style={{ gap: '8px' }}
      >
        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>

          {/* Approver Name + Status on same line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              fontWeight: 500,
              marginBottom: '4px',
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>{row.approverSeq}. {approver.approverName}</span>
            
            {/* Status badge right next to name */}
          {approver.status && (
  <span
    className={`${approver.status} f12 fw500 approverAction`}
    style={{
      color:
        approver.status === 'Approved'
          ? '#fff'
          : approver.status === 'Rejected'
          ? '#fff'
          : undefined,
      backgroundColor:
        approver.status === 'Approved'
          ? 'green'
          : approver.status === 'Rejected'
          ? 'red'
          : undefined,
      padding: '2px 6px',
      borderRadius: '4px',
      lineHeight: 1.2,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}
  >
    {approver.status}
  </span>
)}

          </div>

          {/* Designation + Reminder */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#999',
              marginTop: '2px',
            }}
          >
            <span>Designation: {approver.designation}</span>

            {approver.status === "Pending" && actionType !== 'approval' && (
              <Tooltip
                title="Send Reminder"
                slotProps={{
                  popper: {
                    sx: {
                      '& .MuiTooltip-tooltip': {
                        fontSize: '10px',
                        fontWeight: 600,
                      },
                    },
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleSendReminder(approver)}
                  sx={{
                    padding: '2px',
                    backgroundColor: '#F7F1FC',
                    color: 'green',
                    '&:hover, &:focus, &:active': {
                      backgroundColor: '#F7F1FC',
                    },
                  }}
                >
                  <NotificationsActiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>

          {/* Remarks row */}
          {approver.remarks && (
            <div
              className="cell-text f12"
              style={{ color: '#999', marginTop: '2px' }}
              title={approver.remarks}
            >
              <strong>Remarks:</strong>
              <span className="ms-1 text-truncate">{approver.remarks}</span>
            </div>
          )}

          {/* Last Update */}
          {approver.completionDt && (
            <div className="cell-text f12" style={{ color: '#999', marginTop: '2px' }}>
              Last Update: {approver.completionDt ? formatDateViaTime(approver.completionDt, 'en-GB', formattimeoption) : ''}
            </div>
          )}

        </div>

        {/* Delete button */}
        {!approver.status && onDelete && (
          <div style={{ flexShrink: 0 }}>
            <Tooltip arrow>
              <IconButton
                className="delete-button"
                color="error"
                size="small"
                onClick={() => handleDeleteApprover(approver)}
              >
                <HiX className="delete-icon" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    ))}
  </div>
</div>






                    {/* <div className="col-12 px-0">
                      <div>
                        {row.approvers.map((approver) => (
                          <div
                            key={approver.uniqueId}
                            className="d-flex align-items-start mb-2"
                            style={{ gap: '8px' }}
                          >
                          
                            <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
        
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    fontWeight: 500,
    width: '100%',
  }}
>
  <span>{row.approverSeq}. {approver.approverName}</span>
</div>








                           
                              <div className={`cell-text f12`} style={{ color: '#999' }}>
                                Designation: {approver.designation}
                              </div>
                              {newFormattedDate && (
                                <div className="cell-text f12" style={{ color: '#999' }}>
                                  Last Update: {newFormattedDate}
                                </div>
                              )}
                              {approver.remarks && (
                                <div
                                  className={`cell-text f12 d-flex`}
                                  title={approver.remarks}
                                >
                                  Remarks: <div className="text-truncate ms-1">{approver.remarks}</div>
                                </div>
                              )}
                              <div className="d-flex align-items-center gap-2 mt-2">
                                {approver.status && (
                                  <span
                                    className={`${approver.status} f12 fw500 approverAction flex-shrink-0`}
                                  >
                                    {approver.status}
                                  </span>
                                )}
                                {approver.status === "Pending" && actionType !== 'approval' && (
                                  <Tooltip
                                    title="Send Reminder"
                                    slotProps={{
                                      popper: {
                                        sx: {
                                          '& .MuiTooltip-tooltip': {
                                            fontSize: '10px',
                                            fontWeight: 600,
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => handleSendReminder(approver)}
                                      sx={{
                                        backgroundColor: '#F7F1FC',
                                        color: 'green',
                                        '&:hover': {
                                          backgroundColor: '#F7F1FC',
                                        },
                                        '&:focus': {
                                          backgroundColor: '#F7F1FC',
                                        },
                                        '&:active': {
                                          backgroundColor: '#F7F1FC',
                                        },
                                      }}
                                    >
                                      <NotificationsActiveIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                            {!approver.status && (
                              <div style={{ flexShrink: 0 }}>
                                {onDelete && (
                                  <Tooltip arrow>
                                    <IconButton
                                      className="delete-button"
                                      color="error"
                                      size="small"
                                      onClick={() => handleDeleteApprover(approver)}
                                    >
                                      <HiX className="delete-icon" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialog for confirmation */}
      <Dialog
        open={openDialog}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to remove this approver?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomTable;
