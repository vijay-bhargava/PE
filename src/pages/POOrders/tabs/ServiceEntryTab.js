import React from "react";
import { HiOutlineEye, HiDownload } from "react-icons/hi";
import { formatDateViaTimeZone } from "../../../utils/common/utility";
import { PETableSimple } from "../../../components/RFQ/PETable";
import StatusBadge from "../../../components/StatusBadge";

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

  const columns = [
    {
      key: 'sesNumber',
      label: 'SES Number',
      renderCell: (v) => <span style={{ fontWeight: 600 }}>{v || ''}</span>,
    },
    {
      key: 'servicePeriodFrom',
      label: 'Service Start Date',
      renderCell: (v) => v ? formatDateViaTimeZone(v, 'en-GB', formatoption) : '',
    },
    {
      key: 'servicePeriodTo',
      label: 'Service End Date',
      renderCell: (v) => v ? formatDateViaTimeZone(v, 'en-GB', formatoption) : '',
    },
    {
      key: '__serviceAmount__',
      label: 'Service Amount',
      renderCell: (_, row) => {
        const items = Array.isArray(row.sesItem) ? row.sesItem : (Array.isArray(row.sesItems) ? row.sesItems : []);
        const total = items.reduce((sum, si) => sum + (Number(si.serviceAmount) || 0), 0);
        return total > 0 ? total.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '';
      },
    },
    {
      key: '__status__',
      label: 'Status',
      renderCell: (_, row) => <StatusBadge status={row.approvalStatus || row.status || ''} />,
    },
    {
      key: '__actions__',
      label: 'Actions',
      renderCell: (_, row, idx) => (
        <button
          type="button"
          className="pe-icon-btn pe-icon-btn--view"
          title="View SES"
          onClick={() => {
            const items = Array.isArray(row.sesItem) ? row.sesItem : (Array.isArray(row.sesItems) ? row.sesItems : []);
            const firstItem = items[0] ?? {};
            const sesPayload = { ...firstItem, ...row };
            const matchedItem = allPOItems.find(p => p.id === firstItem.poItemId);
            setSesDialogMode('preview');
            setSesPreviewData(sesPayload);
            setSelectedSesItems(matchedItem ? [matchedItem] : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service'));
            setAddSesDialogOpen(true);
          }}
        >
          <HiOutlineEye />
        </button>
      ),
    },
  ];

  const getExpandContent = (row) => {
    const items = Array.isArray(row.sesItem) ? row.sesItem : (Array.isArray(row.sesItems) ? row.sesItems : []);
    if (items.length === 0) {
      return (
        <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>
          No line items found for this SES.
        </div>
      );
    }

    const subColumns = [
      {
        key: '__itemCode__',
        label: 'Item Code',
        renderCell: (_, si) => {
          const p = allPOItems.find(p => p.id === si.poItemId);
          return <span style={{ color: '#1976d2', fontWeight: 600 }}>{si.itemCode ?? p?.itemCode ?? ''}</span>;
        }
      },
      {
        key: '__itemNo__',
        label: 'Item No',
        renderCell: (_, si) => {
          const p = allPOItems.find(p => p.id === si.poItemId);
          return si.lineItemNo ?? si.itemNo ?? p?.itemNo ?? '';
        }
      },
      {
        key: '__itemName__',
        label: 'Item Name',
        renderCell: (_, si) => {
          const p = allPOItems.find(p => p.id === si.poItemId);
          return si.itemName ?? p?.itemName ?? '';
        }
      },
      {
        key: '__itemDesc__',
        label: 'Description',
        renderCell: (_, si) => {
          const p = allPOItems.find(p => p.id === si.poItemId);
          return si.itemDescription ?? p?.itemDesc ?? p?.materialDescription ?? '';
        }
      },
      {
        key: '__orderedQty__',
        label: 'Ordered Qty',
        renderCell: (_, si) => {
          const p = allPOItems.find(x => x.id === si.poItemId);
          const v = si.orderedQty ?? p?.orderedQuantity ?? p?.quantity;
          return v != null ? Number(v) : '';
        }
      },
      {
        key: '__receivedQty__', label: 'Received Qty', renderCell: (_, si) => {
          const p = allPOItems.find(x => x.id === si.poItemId);
          return p?.receivedQty != null ? Number(p.receivedQty) : '';
        }
      },
      { key: 'acceptedQty', label: 'Accepted Qty', renderCell: (v) => v != null ? Number(v) : '' },
      {
        key: '__remainingQty__', label: 'Remaining Qty', renderCell: (_, si) => {
          const p = allPOItems.find(x => x.id === si.poItemId);
          const ordered = Number(si.orderedQty ?? p?.orderedQuantity ?? p?.quantity ?? 0);
          const accepted = Number(si.acceptedQty ?? 0);
          return Math.max(ordered - accepted, 0);
        }
      },
      {
        key: '__uom__',
        label: 'UOM',
        renderCell: (_, si) => {
          const p = allPOItems.find(x => x.id === si.poItemId);
          return si.uom ?? p?.uom ?? '';
        }
      },
      {
        key: '__status__',
        label: 'Status',
        renderCell: (_, si) => <StatusBadge status={si.acceptanceStatus ?? row.approvalStatus ?? '-'} />
      },
    ];

    return (
      <div style={{ padding: '12px 16px', background: '#f9fafb' }}>
        <PETableSimple
          columns={subColumns}
          rows={items.map((si, idx) => ({ ...si, _key: si.id ?? idx }))}
          getRowKey={(r) => r._key}
          wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', background: '#fff', overflow: 'hidden' }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>SES Details</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isShippedHistoryCreateDisabled && canCreateSes && renderAddFlowButton('SES', 'Add SES')}
          {poSesList?.length > 0 && (
            <button
              type="button"
              className="pe-icon-btn pe-icon-btn--download"
              title="Download SES Report"
              disabled={loadingGrnReport}
              onClick={() => handleDownloadSesReport(pageSlug)}
            >
              <HiDownload />
            </button>
          )}
        </div>
      </div>

      {poSesList?.length > 0 ? (
        <PETableSimple
          columns={columns}
          rows={poSesList.map((s, idx) => ({ ...s, _key: s.id ?? idx }))}
          getRowKey={(r) => r._key}
          wrapperStyle={{ flex: 'none', border: '1px solid #e5e7eb', background: '#fff', overflow: 'hidden' }}
          getExpandContent={getExpandContent}
        />
      ) : (
        <div style={{
          padding: '32px 16px', textAlign: 'center', color: '#6b7280',
          fontSize: 13, background: '#f9fafb', border: '1px solid #e5e7eb'
        }}>
          No SES records found for this PO.
        </div>
      )}
    </div>
  );
};

export default ServiceEntryTab;
