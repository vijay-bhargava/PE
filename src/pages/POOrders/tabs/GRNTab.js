import React, { useState } from "react";
import { HiOutlineDownload, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { CircularProgress } from "@mui/material";
import { formatDateViaTimeZone } from "../../../utils/common/utility";
import { PETableSimple } from "../../../components/RFQ/PETable";
import StatusBadge from "../../../components/StatusBadge";

const detailColumns = [
  {
    key: 'itemCode',
    label: 'Item Code',
    renderCell: (v) => <span style={{ fontWeight: 600 }}>{v ?? ''}</span>
  },
  {
    key: 'lineItemNo',
    label: 'Item No',
    renderCell: (v) => <span style={{ fontWeight: 600 }}>{v ?? ''}</span>
  },
  { key: 'itemName', label: 'Item Name', renderCell: (v) => v ?? '' },
  { key: 'itemDescription', label: 'Description', renderCell: (v) => v ?? '' },
  { key: 'orderedQty', label: 'Ordered Qty' },
  { key: 'receivedQty', label: 'Received Qty' },
  { key: 'acceptedQty', label: 'Accepted Qty' },
  { key: 'rejectedQty', label: 'Rejected Qty' },
  {
    key: 'remainingQty',
    label: 'Remaining Qty',
    renderCell: (v, row) => (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: 6,
        fontSize: 11, fontWeight: 600,
        background: Number(row._remainingRaw) > 0 ? '#e3f2fd' : '#f5f5f5',
        color: Number(row._remainingRaw) > 0 ? '#1976d2' : '#999',
      }}>
        {v}
      </span>
    ),
  },
  { key: 'uom', label: 'UOM', renderCell: (v) => v || '' },
];

const GRNTab = ({
  allPOItems,
  isShippedHistoryCreateDisabled,
  canCreateGrn,
  renderAddFlowButton,
  poGrnList,
  formatoption,
  handleDownloadIndividualGrnReport,
  downloadingGrnId,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  const rows = (poGrnList ?? []).map((hdr, hIdx) => {
    const items = Array.isArray(hdr.grnItem)
      ? hdr.grnItem
      : (Array.isArray(hdr.grnItems) ? hdr.grnItems : []);
    return {
      _id: hdr.id ?? hdr.grnNumber ?? hIdx,
      grnNumber: hdr.grnNumber ?? '',
      grnDate: hdr.grnDate ? formatDateViaTimeZone(hdr.grnDate, 'en-GB', formatoption) : '',
      invoiceNo: hdr.invoiceNo ?? '',
      invoiceDate: hdr.invoiceDate ? formatDateViaTimeZone(hdr.invoiceDate, 'en-GB', formatoption) : '',
      grnStatus: hdr.grnStatus ?? '',
      _hdr: hdr,
      _items: items,
    };
  });

  const handleExpandToggle = (key) => {
    setExpandedId(prev => prev === key ? null : key);
  };

  const expandedKeys = new Set(expandedId != null ? [expandedId] : []);

  const columns = [
    {
      key: '__expand__',
      label: '',
      width: 44,
      renderCell: (_, row) => {
        const isExpanded = expandedId === row._id;
        return (
          <button
            type="button"
            className="pe-icon-btn pe-icon-btn--expand"
            onClick={() => handleExpandToggle(row._id)}
          >
            {isExpanded
              ? <HiOutlineChevronUp style={{ fontSize: 14 }} />
              : <HiOutlineChevronDown style={{ fontSize: 14 }} />}
          </button>
        );
      },
    },
    {
      key: 'grnNumber',
      label: 'GRN Number',
      renderCell: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    { key: 'grnDate', label: 'GRN Date' },
    { key: 'invoiceNo', label: 'Invoice No.', renderCell: (v) => v || '' },
    { key: 'invoiceDate', label: 'Invoice Date' },
    {
      key: 'grnStatus',
      label: 'GRN Status',
      renderCell: (v) => <StatusBadge status={v === '' ? null : v} />,
    },
    {
      key: '__download__',
      label: 'Actions',
      renderCell: (_, row) => {
        const grnId = row._hdr?.id ?? row._hdr?.grnId ?? row._hdr?.grnHId;
        const isLoading = downloadingGrnId === grnId;
        return (
          <button
            type="button"
            className="pe-icon-btn pe-icon-btn--download"
            disabled={isLoading}
            onClick={(e) => { e.stopPropagation(); handleDownloadIndividualGrnReport(row._hdr); }}
            title="Download GRN Report"
          >
            {isLoading ? <CircularProgress size={14} /> : <HiOutlineDownload />}
          </button>
        );
      },
    },
  ];

  const getExpandContent = (row) => {
    if (row._items.length === 0) {
      return (
        <div style={{ padding: '12px 20px', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          No line items found for this GRN
        </div>
      );
    }
    const detailRows = row._items.map((gi, idx) => {
      const poItem = (allPOItems ?? []).find(p => p.id === gi.poItemId) ?? {};
      const orderedQty = Number(gi.orderedQty ?? poItem.quantity ?? 0);
      const receivedQty = Number(gi.receivedQty ?? poItem.receivedQty ?? 0);
      const acceptedQty = Number(gi.acceptedQty ?? 0);
      const rejectedQty = Number(gi.rejectedQty ?? 0);
      const remainingQty = Math.max(receivedQty - acceptedQty, 0);
      const uom = gi.uom ?? poItem.uom ?? 'NOS';
      const fmtQ = (q) => `${q} ${uom}`.trim();
      return {
        _rowId: gi.id ?? idx,
        itemCode: gi.itemCode ?? poItem.itemCode ?? '',
        lineItemNo: gi.lineItemNo ?? '',
        itemName: gi.itemName ?? poItem.itemName ?? '',
        itemDescription: gi.itemDescription ?? poItem.itemDesc ?? '',
        orderedQty: fmtQ(orderedQty),
        receivedQty: fmtQ(receivedQty),
        acceptedQty: fmtQ(acceptedQty),
        rejectedQty: fmtQ(rejectedQty),
        remainingQty: fmtQ(remainingQty),
        _remainingRaw: remainingQty,
        uom,
      };
    });
    return (
      <div style={{ borderLeft: '4px solid #1976d2', background: '#f9fafb', padding: '12px 16px 12px 20px' }}>
        <PETableSimple
          columns={detailColumns}
          rows={detailRows}
          getRowKey={(r) => r._rowId}
          wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>GRN (Goods Receipt Note)</div>
        {!isShippedHistoryCreateDisabled && canCreateGrn && renderAddFlowButton('GRN', 'Add GRN')}
      </div>

      <PETableSimple
        columns={columns}
        rows={rows}
        getRowKey={(row) => row._id}
        wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}
        getExpandContent={getExpandContent}
        expandedKeys={expandedKeys}
        onExpandToggle={handleExpandToggle}
      />
    </div>
  );
};

export default GRNTab;
