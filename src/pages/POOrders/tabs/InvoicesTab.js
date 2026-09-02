import React from "react";
import { HiOutlineEye } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";
import { PETableSimple } from "../../../components/RFQ/PETable";
import StatusBadge from "../../../components/StatusBadge";

const InvoicesTab = ({
  isShippedHistoryCreateDisabled,
  canCreateInvoice,
  renderAddFlowButton,
  canReadInvoice,
  poInvoiceList,
  formatoption,
  handlePreviewInvoice,
}) => {

  const columns = [
    {
      key: 'invoiceNo',
      label: 'Invoice Number',
      renderCell: (v) => <span style={{ fontWeight: 600 }}>{v ?? ''}</span>,
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      renderCell: (v) => v ? formatDateViaTimeZone(v, 'en-GB', formatoption) : '',
    },
    {
      key: 'invoiceAmount',
      label: 'Invoice Amount',
      renderCell: (v) => v ?? '',
    },
    {
      key: 'stage',
      label: 'Status',
      renderCell: (v) => <StatusBadge status={v} />,
    },
    {
      key: '__actions__',
      label: 'Actions',
      renderCell: (_, row) => (
        <button
          type="button"
          className="pe-icon-btn pe-icon-btn--view"
          onClick={() => handlePreviewInvoice(row)}
          title="View Invoice"
        >
          <HiOutlineEye />
        </button>
      ),
    },
  ];

  const rows = poInvoiceList ?? [];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>Invoices</div>
        {!isShippedHistoryCreateDisabled && canCreateInvoice && renderAddFlowButton('INVOICE', 'Add Invoice')}
      </div>

      {canReadInvoice && (
        <PETableSimple
          columns={columns}
          rows={rows}
          getRowKey={(row, idx) => row.id ?? row.invoiceNo ?? idx}
          wrapperStyle={{
            flex: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      )}
    </div>
  );
};

export default InvoicesTab;
