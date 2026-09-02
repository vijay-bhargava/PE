import React from "react";
import {
  Alert, Box, Chip, CircularProgress, Collapse,
  IconButton, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi";
import DownloadIcon from "@mui/icons-material/Download";
import { formatDateViaTimeZone } from "../../../utils/common/utility";

const GRNTab = ({
  allPOItems,
  isShippedHistoryCreateDisabled,
  canCreateGrn,
  renderAddFlowButton,
  poGrnList,
  expandedGrnHeaderIds,
  toggleGrnHeaderExpand,
  formatoption,
  handleDownloadIndividualGrnReport,
  downloadingGrnId,
}) => {
  return (
    <div className="p-3">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          GRN (Goods Receipt Note)
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {!isShippedHistoryCreateDisabled && canCreateGrn && (
            renderAddFlowButton("GRN", "Add GRN")
          )}

          <Tooltip title="Download GRN Report">
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Box>
          {poGrnList?.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 40 }} />
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>GRN Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>GRN Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Invoice No.</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Invoice Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>GRN Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 80 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {poGrnList.flatMap((hdr, hIdx) => {
                    const items = Array.isArray(hdr.grnItem)
                      ? hdr.grnItem
                      : (Array.isArray(hdr.grnItems) ? hdr.grnItems : []);

                    const headerKey = hdr.id ?? hdr.grnNumber ?? hIdx;

                    if (items.length === 0) {
                      return [
                        <TableRow key={`${headerKey}-empty`} hover>
                          <TableCell />
                          <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
                            {hdr.grnNumber ?? '—'}
                          </TableCell>
                          <TableCell>
                            {hdr.grnDate ? formatDateViaTimeZone(hdr.grnDate, 'en-GB', formatoption) : '—'}
                          </TableCell>
                          <TableCell>{hdr.invoiceNo ?? '—'}</TableCell>
                          <TableCell>
                            {hdr.invoiceDate ? formatDateViaTimeZone(hdr.invoiceDate, 'en-GB', formatoption) : '—'}
                          </TableCell>
                          <TableCell colSpan={2} align="center" sx={{ color: '#999', fontSize: 12 }}>
                            No line items found for this GRN
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Download GRN Report">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadIndividualGrnReport(hdr)}
                                disabled={downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId)}
                              >
                                {downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId) ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <DownloadIcon sx={{ color: '#000' }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ];
                    }

                    const rowKey = `${headerKey}`;
                    const isExpanded = expandedGrnHeaderIds.has(rowKey);

                    const receivedQty = items.reduce(
                      (sum, x) => sum + Number(x.receivedQty ?? 0),
                      0
                    );

                    const acceptedQty = items.reduce(
                      (sum, x) => sum + Number(x.acceptedQty ?? 0),
                      0
                    );

                    const rejectedQty = items.reduce(
                      (sum, x) => sum + Number(x.rejectedQty ?? 0),
                      0
                    );

                    return [
                      <React.Fragment key={rowKey}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleGrnHeaderExpand(rowKey)}
                            >
                              {isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                            </IconButton>
                          </TableCell>

                          <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
                            {hdr.grnNumber ?? '—'}
                          </TableCell>

                          <TableCell>
                            {hdr.grnDate
                              ? formatDateViaTimeZone(hdr.grnDate, 'en-GB', formatoption)
                              : '—'}
                          </TableCell>

                          <TableCell>{hdr.invoiceNo ?? '—'}</TableCell>
                          <TableCell>
                            {hdr.invoiceDate
                              ? formatDateViaTimeZone(hdr.invoiceDate, 'en-GB', formatoption)
                              : '—'}
                          </TableCell>

                          <TableCell>{hdr.grnStatus ?? '—'}</TableCell>
                          <TableCell>
                            <Tooltip title="Download GRN Report">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadIndividualGrnReport(hdr)}
                                disabled={downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId)}
                              >
                                {downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId) ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <DownloadIcon sx={{ color: '#000' }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={7}
                          >
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
                                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Rejected Qty</TableCell>
                                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Remaining Qty</TableCell>
                                      <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>UOM</TableCell>
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {items.map((gi, idx) => {
                                      const poItem =
                                        allPOItems.find(p => p.id === gi.poItemId) || {};

                                      const orderedQty = Number(
                                        gi.orderedQty ?? poItem.quantity ?? 0
                                      );

                                      const receivedItemQty = poItem.receivedQty ?? 0;
                                      const acceptedItemQty = Number(gi.acceptedQty ?? 0);
                                      const rejectedItemQty = Number(gi.rejectedQty ?? 0);
                                      const remainingQty = Math.max(
                                        receivedItemQty - acceptedItemQty,
                                        0
                                      );

                                      const uom = gi.uom ?? poItem.uom ?? 'NOS';

                                      return (
                                        <TableRow key={gi.id ?? idx} hover>

                                          <TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
                                            {gi.itemCode ?? poItem.itemCode ?? '—'}
                                          </TableCell>

                                          <TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
                                            {gi.lineItemNo ?? '—'}
                                          </TableCell>

                                          <TableCell>
                                            {gi.itemName ?? poItem.itemName ?? '—'}
                                          </TableCell>

                                          <TableCell>
                                            {gi.itemDescription ?? poItem.itemDesc ?? '—'}
                                          </TableCell>

                                          <TableCell>
                                            {orderedQty} {uom}
                                          </TableCell>

                                          <TableCell>
                                            {receivedItemQty} {uom}
                                          </TableCell>

                                          <TableCell>
                                            {acceptedItemQty} {uom}
                                          </TableCell>

                                          <TableCell>
                                            {rejectedItemQty} {uom}
                                          </TableCell>

                                          <TableCell>
                                            <Chip
                                              label={`${remainingQty} ${uom}`}
                                              size="small"
                                              sx={{
                                                bgcolor: remainingQty > 0 ? '#e3f2fd' : '#f5f5f5',
                                                color: remainingQty > 0 ? '#1976d2' : '#999',
                                                fontWeight: 600,
                                                fontSize: 11,
                                              }}
                                            />
                                          </TableCell>

                                          <TableCell>
                                            {uom}
                                          </TableCell>

                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ];
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No GRN records found for this PO.</Alert>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default GRNTab;
