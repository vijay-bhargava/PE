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
  if (!name || typeof name !== 'string') return '?';
  const names = name.trim().split(' ').filter(Boolean);
  if (!names.length) return '?';
  return names.length > 1 ? `${names[0][0]}${names[1][0] ?? ""}` : names[0][0];
};

const formatRfqSidebarDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'dd-MM-yyyy, hh:mm a');
};

const CustomTable = ({ data, onDelete, accessLevel, stagelist, eventCode, eventSubject, startDate, endDate, variant }) => {

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

  const isRfqSidebar = variant === 'rfq-sidebar';

  return (
    <Box sx={{ boxShadow: 'none' }}>
      <div className={`custom-table ${isRfqSidebar ? 'is-rfq-sidebar' : ''}`}>
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
                        {row.approvers.map((approver) => {
                          const approverDate =
                            approver.completionDt ||
                            approver.updatedDate ||
                            approver.createdDate ||
                            startDate ||
                            '';
                          const formattedApproverDate = approverDate
                            ? isRfqSidebar
                              ? formatRfqSidebarDate(approverDate)
                              : formatDateViaTime(approverDate, 'en-GB', formattimeoption)
                            : '';

                          if (isRfqSidebar) {
                            return (
                              <div
                                key={approver.uniqueId}
                                className={`rfq-sidebar-approver-card ${approver.status === 'Pending' ? 'is-pending' : ''}`}
                              >
                                <div className="rfq-sidebar-approver-body">
                                  <div className="rfq-sidebar-approver-top">
                                    <span className="rfq-sidebar-approver-name">{approver.approverName}</span>
                                    {approver.status && (
                                      <span className={`${approver.status} rfq-sidebar-status approverAction`}>
                                        {approver.status}
                                      </span>
                                    )}
                                  </div>
                                  <div className="rfq-sidebar-approver-role">
                                    {approver.designation || approver.roleName || '-'}
                                  </div>
                                  {formattedApproverDate && (
                                    <div className="rfq-sidebar-approver-date">
                                      {formattedApproverDate}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                  {!approver.status && onDelete && (
                                    <button
                                      type="button"
                                      className="pe-icon-btn pe-icon-btn--delete"
                                      onClick={() => handleDeleteApprover(approver)}
                                      aria-label="Remove approver"
                                    >
                                      <HiX />
                                    </button>
                                  )}
                                  {approver.status === 'Pending' && actionType !== 'approval' && (
                                    <Tooltip title="Send Reminder" placement="left">
                                      <button
                                        type="button"
                                        className="pe-icon-btn pe-icon-btn--reminder"
                                        onClick={() => handleSendReminder(approver)}
                                        aria-label="Send reminder"
                                      >
                                        <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M4.7965 12.8C4.4655 12.8 4.18333 12.6825 3.95 12.4475C3.71667 12.2125 3.6 11.93 3.6 11.6H6C6 11.9333 5.88217 12.2167 5.6465 12.45C5.41083 12.6833 5.1275 12.8 4.7965 12.8ZM0 10.8V9.6H0.8V5.6C0.8 4.63333 1.09722 3.78333 1.69167 3.05C2.28611 2.31667 3.05556 1.86111 4 1.68333V0.8C4 0.577778 4.07778 0.388889 4.23333 0.233333C4.38889 0.0777778 4.57778 0 4.8 0C5.02222 0 5.21111 0.0777778 5.36667 0.233333C5.52222 0.388889 5.6 0.577778 5.6 0.8V1.68333C5.95556 1.75 6.29167 1.86389 6.60833 2.025C6.925 2.18611 7.21111 2.37778 7.46667 2.6L6.6 3.45C6.35556 3.23889 6.08005 3.07778 5.7735 2.96667C5.46694 2.85556 5.14267 2.8 4.80067 2.8C4.02244 2.8 3.36111 3.07222 2.81667 3.61667C2.27222 4.16111 2 4.82222 2 5.6V9.6H9.6V10.8H0ZM8.05 7.1L7.2 6.25C7.32222 6.12778 7.41111 5.99444 7.46667 5.85C7.52222 5.70556 7.55 5.55556 7.55 5.4C7.55 5.24444 7.52222 5.09722 7.46667 4.95833C7.41111 4.81944 7.32222 4.68889 7.2 4.56667L8.05 3.71667C8.27222 3.93889 8.44444 4.19444 8.56667 4.48333C8.68889 4.77222 8.75 5.07778 8.75 5.4C8.75 5.72222 8.68889 6.03056 8.56667 6.325C8.44444 6.61944 8.27222 6.87778 8.05 7.1ZM8.9 7.95C9.24444 7.61667 9.50556 7.23028 9.68333 6.79083C9.86111 6.3515 9.95 5.89067 9.95 5.40833C9.95 4.926 9.86111 4.46517 9.68333 4.02583C9.50556 3.58639 9.24444 3.19444 8.9 2.85L9.75 2C10.2056 2.45556 10.5528 2.975 10.7917 3.55833C11.0306 4.14167 11.15 4.75278 11.15 5.39167C11.15 6.03056 11.0306 6.64444 10.7917 7.23333C10.5528 7.82222 10.2056 8.34444 9.75 8.8L8.9 7.95Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          return (
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
                                    <span className={`${approver.status} f12 fw500 approverAction`}>
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
                                    <Tooltip title="Send Reminder">
                                      <button
                                        type="button"
                                        className="pe-icon-btn pe-icon-btn--reminder"
                                        onClick={() => handleSendReminder(approver)}
                                        aria-label="Send reminder"
                                      >
                                        <NotificationsActiveIcon style={{ fontSize: 14 }} />
                                      </button>
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
                                  <Tooltip arrow title="Remove approver">
                                    <button
                                      type="button"
                                      className="pe-icon-btn pe-icon-btn--delete"
                                      onClick={() => handleDeleteApprover(approver)}
                                      aria-label="Remove approver"
                                    >
                                      <HiX />
                                    </button>
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                                  <Tooltip title="Send Reminder">
                                    <button
                                      type="button"
                                      className="pe-icon-btn pe-icon-btn--reminder"
                                      onClick={() => handleSendReminder(approver)}
                                      aria-label="Send reminder"
                                    >
                                      <NotificationsActiveIcon style={{ fontSize: 14 }} />
                                    </button>
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
