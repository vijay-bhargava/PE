import React from "react";
import { HiOutlineEye } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";
import { PETableSimple } from "../../../components/RFQ/PETable";
import StatusBadge from "../../../components/StatusBadge";

const ASNTab = ({
  isShippedHistoryCreateDisabled,
  canCreateAsn,
  renderAddFlowButton,
  poAsnList,
  allPOShipHeader,
  formatoption,
  handlePreviewAsn,
}) => {
  const rows = poAsnList ?? allPOShipHeader ?? [];

  const columns = [
    {
      key: 'shipSlipId',
      label: 'ASN Number',
      renderCell: (v, row) => (
        <span style={{ fontWeight: 500 }}>
          {row.shipSlipId ?? row.asnNumber ?? row.id ?? '—'}
        </span>
      ),
    },
    {
      key: 'shippingDate',
      label: 'ASN Date',
      renderCell: (v) =>
        v ? formatDateViaTimeZone(v, 'en-GB', formatoption) : '—',
    },
    {
      key: 'status',
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
          onClick={() => handlePreviewAsn(row)}
        >
          <HiOutlineEye />
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>ASN (Advanced Shipping Notice)</div>
        {!isShippedHistoryCreateDisabled && canCreateAsn && renderAddFlowButton('ASN', 'Add ASN')}
      </div>

      <PETableSimple
        columns={columns}
        rows={rows}
        getRowKey={(row, idx) => row.id ?? idx}
        wrapperStyle={{
          flex: 'none',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

export default ASNTab;
