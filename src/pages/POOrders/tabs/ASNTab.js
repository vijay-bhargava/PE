import React from "react";
import {
  Alert, Box, IconButton, Paper, Table,
  TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from "@mui/material";
import { HiOutlineEye } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";

const ASNTab = ({
  poCustomerId,
  customerid,
  allPOItems,
  isShippedHistoryCreateDisabled,
  canCreateAsn,
  renderAddFlowButton,
  poAsnList,
  allPOShipHeader,
  formatoption,
  handlePreviewAsn,
}) => {
  return (
    <div className="p-3">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>ASN (Advanced Shipping Notice)</Typography>
          {!isShippedHistoryCreateDisabled && canCreateAsn && (
            renderAddFlowButton('ASN', 'Add ASN')
          )}
        </Box>
        <Box>
          {(poAsnList ?? allPOShipHeader)?.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ASN Number</TableCell>
                    <TableCell>Shipping Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(poAsnList ?? allPOShipHeader).map((row, idx) => (
                    <TableRow key={row.id ?? idx} hover>
                      <TableCell>{row.shipSlipId ?? row.asnNumber ?? row.id ?? '—'}</TableCell>
                      <TableCell>{row.shippingDate ? formatDateViaTimeZone(row.shippingDate, 'en-GB', formatoption) : '—'}</TableCell>
                      <TableCell>{row.status ?? '—'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          sx={{ color: '#1976d2' }}
                          onClick={() => handlePreviewAsn(row)}
                        >
                          <HiOutlineEye />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No ASN records found.</Alert>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default ASNTab;
