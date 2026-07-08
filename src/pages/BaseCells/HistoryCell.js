import React, { useEffect, useMemo, useState } from 'react';
import CommonCommonBottomDrawer from "../../components/CommonCommonBottomDrawer";
import ReactDOM from 'react-dom';
import { MdManageHistory } from "react-icons/md";
import { HiOutlineX } from "react-icons/hi";
import {
  Avatar, Box, IconButton, Tooltip, Typography,
  ListItem, ListItemText, ListItemButton, Alert
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useStateValue } from '../../store';
import { ApiClient } from '../../Apiclient';
import { formatDateViaLocale } from '../../utils/common/utility';
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { CLAIM_TYPES, ACTIONS } from "../../utils/permissionManager";
import '../../assets/css/manage-rfq-v2.css';
const HistoryCell = ({ eventtype, eventId: propEventId, permissionManager }) => {


  const [state, setState] = useState({ technicalApprovalDrawer: false });
  // const [{ atoken, customerid, eventType, eventId, customersuffix }] = useStateValue();
  const [{ atoken, customerid, customersuffix, userDetail }] = useStateValue();

  const apiClient = new ApiClient(customersuffix);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [Auditdata, setAuditdata] = useState([]);
  const [AuditGraphdata, setAuditGraphdata] = useState([]);

  useEffect(() => {
    if (state.technicalApprovalDrawer && propEventId) {
      pullAuditList();
    }
  }, [propEventId, state]);

  const pullAuditList = async () => {

    const data = {
      CustomerId: customerid,
      EventType: eventtype,
      EventId: propEventId
    };

    const queryParams = new URLSearchParams(data).toString();
    const res = await apiClient.getres(`api/ReportConfig/AuditReport?${queryParams}`, atoken);
    if (res) {
      const data = res?.data;
      setAuditdata(data?.changeAudit);
      setAuditGraphdata(data?.stategraph);
    }
  };

  const getInitials = (userName) => {
    if (!userName) return '';
    return userName.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  };


  const getDisplayName = (stage) => {
    // Use approverName if available, otherwise use modifiedByName
    return stage.approverName ?? stage.modifiedByName ?? "Unknown";
  };


  const getDisplayDate = (stage) => {
    // Use stageDone if available, otherwise use modifiedOn
    if (stage.stageDone) {
      return formatDateViaLocale(stage.stageDone, userDetail);
    }
    return formatDateViaLocale(stage.modifiedOn, userDetail);
  };

  const getColorForName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 60%)`;
  };

  const avatarColors = useMemo(() => {
    const colors = {};
    AuditGraphdata.forEach((stage) => {
      const name = getDisplayName(stage);
      if (!colors[name]) {
        colors[name] = getColorForName(name);
      }
    });
    return colors;
  }, [AuditGraphdata]);

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setState({ ...state, [anchor]: open });
  };

  // const calculateArrowWidth = (displayName) => {
  //   const length = displayName.length;
  //   const baseWidth = 10;
  //   const extraWidthPerChar = 10;
  //   return baseWidth + length * extraWidthPerChar;
  // };

  useEffect(() => {
    if (Auditdata.length > 0) {
      const latestItem = [...Auditdata].sort((a, b) => new Date(b.actionDate) - new Date(a.actionDate))[0];
      setSelectedItem(latestItem);
    }
  }, [Auditdata]);

  return (

    <>
      <Tooltip title="View History">
        <IconButton className="sup-action-btn" size='small' onClick={toggleDrawer('technicalApprovalDrawer', true)}>
          <MdManageHistory style={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      {state.technicalApprovalDrawer && ReactDOM.createPortal(
        (() => {
          const canRead = permissionManager?.hasPermission(CLAIM_TYPES.AUDIT_HISTORY, ACTIONS.READ) ?? false;
          return (
            <CommonCommonBottomDrawer
              open={state.technicalApprovalDrawer}
              onClose={() => setState(s => ({ ...s, technicalApprovalDrawer: false }))}
              title="Audit History"
              backdropStyle={{ zIndex: 1500 }}
              sectionStyle={{ zIndex: 1501 }}
              bodyStyle={canRead ? { overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0, padding: 0 } : { padding: 16 }}
              actions={canRead
                ? <button type="button" className="pe-btn pe-btn--ghost" onClick={() => setState(s => ({ ...s, technicalApprovalDrawer: false }))}>Close</button>
                : <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted" onClick={() => setState(s => ({ ...s, technicalApprovalDrawer: false }))}>Close</button>
              }
            >
              {!canRead ? (
                <Alert severity="error">
                  <div className="d-flex align-items-center">
                    <HiOutlineX className="me-2 f18" />
                    Access Denied: You don't have permission to view Audit History.
                  </div>
                </Alert>
              ) : (<>
                {AuditGraphdata.length > 0 &&
                  <Box px={3} pt={2} pb={1} sx={{ borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, fontSize: 14 }}>
                      State Graph
                    </Typography>

                    <Box sx={{ overflowX: 'auto', pb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-end', minWidth: 'fit-content', gap: 0, px: 2, pt: 5 }}>
                        {AuditGraphdata.map((stage, index) => {
                          const displayName = getDisplayName(stage);
                          const avatarColor = avatarColors[displayName];
                          const prevStage = index > 0 ? AuditGraphdata[index - 1]?.currentStage : null;

                          // Transition text logic
                          const transitionText = index === 0
                            ? `${stage.currentStage} reported`
                            : index === 1
                              ? `Moved to state ${stage.currentStage}`
                              : `Moved out of state ${prevStage}`;

                          return (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-end', position: 'relative', flex: '0 0 auto' }}>
                              {/* Arrow and Avatar column */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1 }}>
                                {/* Arrow to this stage with transition label above */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flex: '0 1 auto',
                                    position: 'relative',
                                    mb: 2
                                  }}
                                >
                                  {/* Transition label above arrow */}
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      position: 'absolute',
                                      top: '-40px', // adjust for long text
                                      maxWidth: '120px',
                                      textAlign: 'center',
                                      fontSize: '10px',
                                      lineHeight: '1.3',
                                      color: '#666',
                                    }}
                                  >
                                    {transitionText}
                                  </Typography>

                                  {/* Arrow line */}
                                  <Box
                                    sx={{
                                      width: '100px',
                                      height: '3px',
                                      backgroundColor: '#1976d2',
                                      position: 'relative',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        right: '-12px',
                                        width: 0,
                                        height: 0,
                                        borderTop: '6px solid transparent',
                                        borderBottom: '6px solid transparent',
                                        borderLeft: '12px solid #1976d2',
                                      }}
                                    />
                                  </Box>
                                </Box>

                                {/* Avatar and details - inline layout */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                                  <Avatar sx={{ bgcolor: avatarColor, width: 25, height: 25, fontSize: '13px', fontWeight: 'bold', flexShrink: 0, mt: 0.3 }}>
                                    {getInitials(displayName)}
                                  </Avatar>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px', lineHeight: '1.2' }}>
                                      {displayName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999', fontSize: '10px' }}>
                                      {getDisplayDate(stage) || 'No date'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>

                              {/* Stage column */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: '120px' }}>
                                {/* Stage box */}
                                <Box
                                  sx={{
                                    backgroundColor: '#e3f2fd',
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: '6px',
                                    // border: '2px solid #90caf9',
                                    textAlign: 'center',
                                    minWidth: '130px',
                                    mb: 3
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2', fontSize: '13px', letterSpacing: '0.3px' }}>
                                    {stage.currentStage}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                }
                {/* Row: fixed-width Change History card + right detail panel */}
                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: 2, px: 3, pb: 2, marginTop: 2, overflow: 'hidden' }}>
                  {/* Left: Change History card — fixed width, stays constant on collapse/expand */}
                  <Box sx={{
                    width: "50%", flexShrink: 0,
                    border: '1px solid #eef2f6', borderRadius: 2,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    alignSelf: 'flex-start',
                  }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1.2}>
                      <Typography sx={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>Change History</Typography>
                      <button type="button" className="pe-icon-btn pe-icon-btn--expand" onClick={() => { setExpanded(!expanded); if (expanded) setSelectedItem(null); }}>
                        <ExpandMoreIcon style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </button>
                    </Box>
                    {expanded && (
                      <Box sx={{ maxHeight: 380, overflowY: 'auto', borderTop: '1px solid #f0f0f0' }}>
                        {Auditdata.length > 0 ? (
                          Array.from(new Map(Auditdata.map(item => [`${item.changeText}_${item.actionDate}`, item])).values()).map((item) => (
                            <ListItemButton
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              selected={selectedItem?.id === item.id}
                              sx={{ px: 2, py: 1, borderBottom: '1px solid #f9fafb', '&.Mui-selected': { backgroundColor: '#fff' }, '&:hover': { backgroundColor: '#f9fafb' } }}
                            >
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#0369a1', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                {getInitials(item.userName)}
                              </Avatar>
                              <ListItemText
                                primary={<Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{item.changeText?.replace('$', '') || item.changeText}</Typography>}
                                secondary={<Typography variant="caption" sx={{ color: '#6b7280' }}>{formatDateViaLocale(item.actionDate, userDetail)}</Typography>}
                                sx={{ ml: 1.5 }}
                              />
                            </ListItemButton>
                          ))
                        ) : (
                          <Box sx={{ p: 2, textAlign: 'center', color: '#6b7280' }}>
                            <Typography variant="body2">No history found.</Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Right: Selected item detail — internally scrollable */}
                  {expanded && selectedItem && (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #eef2f6', borderRadius: 2, alignSelf: 'flex-start', maxHeight: 420 }}>
                      <Box display="flex" alignItems="center" px={2} py={1.2} sx={{ borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 700 }}>
                          {getInitials(selectedItem.userName)}
                        </Avatar>
                        <Box ml={1.5}>
                          <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: 13, lineHeight: 1.3 }}>
                            {selectedItem.userName || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {formatDateViaLocale(selectedItem.actionDate, userDetail)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
                        {Auditdata.filter(item => item.changeText === selectedItem.changeText && item.actionDate === selectedItem.actionDate).map((change, index) => (
                          <Box key={index} mb={1} sx={{ p: 1.2, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #eef2f6' }}>
                            <Typography variant="body2" sx={{ color: '#111827' }}>
                              <strong>{change.propertyName}:</strong>{' '}
                              {change.oldValue ? (
                                <><span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{change.oldValue}</span>{' → '}<span style={{ fontWeight: 600 }}>{change.newValue ?? 'N/A'}</span></>
                              ) : (
                                <span style={{ fontWeight: 600 }}>{change.newValue ?? 'N/A'}</span>
                              )}
                              <span className="text-muted"> ({formatDateViaLocale(change.actionDate, userDetail)})</span>
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </>)}
            </CommonCommonBottomDrawer>
          );
        })(),
        document.body
      )}
    </>
  );
};

export default HistoryCell;
