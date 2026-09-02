import React from "react";
import { CircularProgress } from "@mui/material";
import { HiOutlineEye, HiPlusSm } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";
import { PETableSimple } from "../../../components/RFQ/PETable";
import StatusBadge from "../../../components/StatusBadge";

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
  const columns = [
    {
      key: 'invoiceNo',
      label: 'SAP Doc Number',
      renderCell: (v) => <span style={{ fontWeight: 600 }}>{v || ''}</span>,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      renderCell: (v) => v ? formatDateViaTimeZone(v, 'en-GB', formatoption) : '',
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      renderCell: (v) => v || '',
    },
    {
      key: 'utrNumber',
      label: 'UTR Number',
      renderCell: (v) => v || '',
    },
    {
      key: 'bankReference',
      label: 'Bank Reference',
      renderCell: (v) => v || '',
    },
    {
      key: 'paymentAmount',
      label: 'Amount',
      renderCell: (v) => v ?? '',
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      renderCell: (v) => <StatusBadge status={v || 'Pending'} />,
    },
    {
      key: '__actions__',
      label: 'Actions',
      renderCell: (_, row) => (
        <button
          type="button"
          className="pe-icon-btn pe-icon-btn--view"
          title="View Payment"
          onClick={() => {
            setPaymentDetails({ ...row, __source: 'paymentheader' });
            setState(prevState => ({ ...prevState, openPaymentDetails: true }));
          }}
        >
          <HiOutlineEye />
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Payments</div>
        {!isShippedHistoryCreateDisabled && canCreatePayment && (
          <button
            type="button"
            className="pe-btn pe-btn--link"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
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
            <HiPlusSm style={{ fontSize: 16 }} /> Add Payment
          </button>
        )}
      </div>

      {loadingPayments ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <CircularProgress size={28} />
        </div>
      ) : paymentError ? (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{paymentError}</span>
          <button
            type="button"
            className="pe-btn pe-btn--outline"
            style={{ fontSize: 12, padding: '3px 10px' }}
            onClick={() => { paymentLoadedRef.current = false; fetchPayments(); }}
          >
            Retry
          </button>
        </div>
      ) : (poPaymentList?.length > 0) ? (
        <PETableSimple
          columns={columns}
          rows={poPaymentList}
          getRowKey={(row, idx) => row.id ?? idx}
          wrapperStyle={{
            flex: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      ) : (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280', fontSize: 13, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          No Payment records found for this PO.
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;
