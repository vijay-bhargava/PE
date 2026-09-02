import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { HiOutlineEye, HiPlusSm } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";

const PaymentsTab = ({
  isShippedHistoryCreateDisabled,
  canCreatePayment,
  setPaymentTargetItem,
  resetPaymentForm,
  poInvoiceList,
  pageSlug,
  poCustomerId,
  customerid,
  apiClient,
  atoken,
  setPoInvoiceList,
  setOpenAddPaymentDrawer,
  loadingPayments,
  paymentError,
  paymentLoadedRef,
  fetchPayments,
  poPaymentList,
  formatoption,
  setPaymentDetails,
  setState,
}) => {
  return (
    <div className="p-3">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Payments</Typography>
        {!isShippedHistoryCreateDisabled && canCreatePayment && (
          <Button
            size="small"
            variant="text"
            startIcon={<HiPlusSm />}
            sx={{ textTransform: 'none', fontSize: 12, color: '#1976d2' }}
            onClick={async () => {
              setPaymentTargetItem(null);
              resetPaymentForm();
              if ((!poInvoiceList || poInvoiceList.length === 0) && pageSlug) {
                try {
                  const cid = poCustomerId ?? customerid;
                  const res = await apiClient.get(
                    `/api/poinvoice/Find?poId=${pageSlug}&customerId=${cid}`,
                    atoken
                  );
                  if (Array.isArray(res)) setPoInvoiceList(res);
                } catch (e) {
                  console.error('Failed to fetch invoices for payment', e);
                }
              }
              setOpenAddPaymentDrawer(true);
            }}
          >
            Add Payment
          </Button>
        )}
      </Box>
      {loadingPayments ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress size={28} />
        </Box>
      ) : paymentError ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => { paymentLoadedRef.current = false; fetchPayments(); }}
            >
              Retry
            </Button>
          }
        >
          {paymentError}
        </Alert>
      ) : poPaymentList?.length > 0 ? (

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>SAP Doc Number</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Payment Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>UTR Number</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Bank Reference</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {poPaymentList.map((payment, idx) => (

                <TableRow key={payment.id || idx} hover>
                  <TableCell sx={{ fontSize: 12 }}>{payment.invoiceNo || ' '}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{payment.paymentDate ? formatDateViaTimeZone(payment.paymentDate, 'en-GB', formatoption) : ' '}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{payment.paymentMethod || ' '}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{payment.utrNumber || ' '}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{payment.bankReference || ' '}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{payment.paymentAmount ?? ' '}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>
                    <Chip
                      label={payment.paymentStatus || 'Pending'}
                      size="small"
                      sx={{
                        bgcolor: payment.paymentStatus?.toLowerCase() === 'completed' ? '#e8f5e9' : '#f5f5f5',
                        color: payment.paymentStatus?.toLowerCase() === 'completed' ? '#2e7d32' : '#666',
                        fontWeight: 600,
                        fontSize: 11
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        sx={{ color: '#1976d2' }}
                        onClick={() => {
                          setPaymentDetails({ ...payment, __source: 'paymentheader' });
                          setState(prevState => ({ ...prevState, openPaymentDetails: true }));
                        }}
                      >
                        <HiOutlineEye />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">No Payment records found for this PO.</Alert>
      )}
    </div>
  );
};

export default PaymentsTab;
