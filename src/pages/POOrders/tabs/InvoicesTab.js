import React from "react";
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { HiOutlineEye } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";

const InvoicesTab = ({
  isShippedHistoryCreateDisabled,
  canCreateInvoice,
  renderAddFlowButton,
  canReadInvoice,
  poInvoiceList,
  formatoption,
  handlePreviewInvoice,
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
          Invoices
        </Typography>

        {!isShippedHistoryCreateDisabled && canCreateInvoice && (
          renderAddFlowButton("INVOICE", "Add Invoice")
        )}
      </Box>

      <Box>
        {canReadInvoice ? (
          poInvoiceList?.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice Number</TableCell>
                    <TableCell>Invoice Date</TableCell>
                    <TableCell>Invoice Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {poInvoiceList.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{row.invoiceNo ?? "—"}</TableCell>
                      <TableCell>
                        {row.invoiceDate
                          ? formatDateViaTimeZone(
                            row.invoiceDate,
                            "en-GB",
                            formatoption
                          )
                          : "—"}
                      </TableCell>
                      <TableCell>{row.invoiceAmount ?? "—"}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color: row.stage?.trim().toLowerCase() === "rejected" ? "red" : "inherit",
                          }}
                        >
                          {row.stage ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          sx={{ color: "#1976d2" }}
                          onClick={() => handlePreviewInvoice(row)}
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
            <Alert severity="info">No Invoice records found.</Alert>
          )
        ) : null}
      </Box>
    </div>
  );
};

export default InvoicesTab;
