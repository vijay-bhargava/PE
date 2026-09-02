import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineEye } from "react-icons/hi";
import DownloadIcon from "@mui/icons-material/Download";
import { formatDateViaTimeZone } from "../../../utils/common/utility";

const ServiceEntryTab = ({
  allPOItems,
  isShippedHistoryCreateDisabled,
  canCreateSes,
  renderAddFlowButton,
  poSesList,
  pageSlug,
  loadingGrnReport,
  handleDownloadSesReport,
  expandedSesHeaderIds,
  toggleSesHeaderExpand,
  formatoption,
  setSesDialogMode,
  setSesPreviewData,
  setSelectedSesItems,
  setAddSesDialogOpen,
}) => {
  return (
    <div className="p-3">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>SES Details</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isShippedHistoryCreateDisabled && canCreateSes && (
            renderAddFlowButton('SES', 'Add SES')
          )}
          {poSesList?.length > 0 && (
            <Tooltip title="Download SES Report">
              <IconButton
                onClick={() => handleDownloadSesReport(pageSlug)}
                disabled={loadingGrnReport}
              >
                <DownloadIcon sx={{ color: '#000' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      {poSesList?.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>SES Number</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Service Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Service End Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Service Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8', textAlign: 'center' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {poSesList.flatMap((s, i) => {
                const items = Array.isArray(s.sesItem)
                  ? s.sesItem
                  : (Array.isArray(s.sesItems) ? s.sesItems : []);
                const headerKey = s.id ?? s.sesNumber ?? i;

                if (items.length === 0) {
                  return [
                    <TableRow key={`${headerKey}-empty`} hover>
                      <TableCell />
                      <TableCell sx={{ fontSize: 12 }}>
                        <Typography sx={{ color: '#1976d2', fontSize: 12 }}>{s.sesNumber ?? '—'}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{s.servicePeriodFrom ? formatDateViaTimeZone(s.servicePeriodFrom, 'en-GB', formatoption) : '—'}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{s.servicePeriodTo ? formatDateViaTimeZone(s.servicePeriodTo, 'en-GB', formatoption) : '—'}</TableCell>
                      <TableCell colSpan={4} align="center" sx={{ color: '#999', fontSize: 12 }}>
                        No line items found for this SES
                      </TableCell>
                    </TableRow>
                  ];
                }

                return items.map((si, idx) => {
                  const rowKey = `${headerKey}-${si.id ?? idx}`;
                  const isExpanded = expandedSesHeaderIds.has(rowKey);
                  const poItem = allPOItems.find(p => p.id === si.poItemId) || {};
                  const uom = si.uom ?? poItem.uom ?? '—';
                  const orderedQtyRaw = si.orderedQty ?? poItem.orderedQuantity ?? poItem.quantity;
                  const orderedQty = orderedQtyRaw != null ? Number(orderedQtyRaw) : null;
                  const receivedQty = poItem.receivedQty != null
                    ? Number(poItem.receivedQty)
                    : null;
                  const acceptedQty = si.acceptedQty != null ? Number(si.acceptedQty) : null;
                  const remainingQty = orderedQty != null ? Math.max(orderedQty - (acceptedQty ?? 0), 0) : null;

                  return (
                    <React.Fragment key={rowKey}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleSesHeaderExpand(rowKey)}
                          >
                            {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          <Typography sx={{ color: '#1976d2', fontSize: 12 }}>{s.sesNumber ?? '—'}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{s.servicePeriodFrom ? formatDateViaTimeZone(s.servicePeriodFrom, 'en-GB', formatoption) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{s.servicePeriodTo ? formatDateViaTimeZone(s.servicePeriodTo, 'en-GB', formatoption) : '—'}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{si.serviceAmount != null ? Number(si.serviceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Button
                            size="small"
                            sx={{ textTransform: 'none', fontSize: 11, py: 0.25, px: 1 }}
                            onClick={() => {
                              const sesPayload = { ...si, ...s };
                              const matchedItem = allPOItems.find(p => p.id === si.poItemId);
                              setSesDialogMode('preview');
                              setSesPreviewData(sesPayload);
                              setSelectedSesItems(matchedItem ? [matchedItem] : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service'));
                              setAddSesDialogOpen(true);
                            }}
                          >
                            <HiOutlineEye
                              size={14}
                              style={{ color: '#1976d2' }}
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 1, ml: 5 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item No</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Ordered Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Received Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Accepted Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Remaining Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>UOM</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Status</TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  <TableRow hover>
                                    <TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
                                      {poItem.itemCode ?? '—'}
                                    </TableCell>

                                    <TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
                                      {si.lineItemNo ?? si.itemNo ?? poItem.itemNo ?? '—'}
                                    </TableCell>

                                    <TableCell>
                                      {si.itemName ?? poItem.itemName ?? '—'}
                                    </TableCell>

                                    <TableCell>
                                      {si.itemDescription ?? poItem.itemDesc ?? poItem.materialDescription ?? '—'}
                                    </TableCell>

                                    <TableCell>
                                      {orderedQty != null ? orderedQty : '—'}
                                    </TableCell>

                                    <TableCell>
                                      {receivedQty != null ? receivedQty : '—'}
                                    </TableCell>

                                    <TableCell>
                                      {acceptedQty != null ? acceptedQty : '—'}
                                    </TableCell>

                                    <TableCell>
                                      {remainingQty != null ? remainingQty : '—'}
                                    </TableCell>

                                    <TableCell>
                                      {uom}
                                    </TableCell>

                                    <TableCell>
                                      <Chip
                                        label={si.acceptanceStatus ?? s.approvalStatus ?? '—'}
                                        size="small"
                                        sx={{
                                          fontSize: 11,
                                          fontWeight: 600,
                                          bgcolor:
                                            String(si.acceptanceStatus ?? '').toLowerCase() === 'accepted'
                                              ? '#e8f5e9'
                                              : '#f5f5f5',
                                          color:
                                            String(si.acceptanceStatus ?? '').toLowerCase() === 'accepted'
                                              ? '#2e7d32'
                                              : '#616161',
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                });
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No SES records found for this PO.</Alert>
      )}
    </div>
  );
};

export default ServiceEntryTab;
