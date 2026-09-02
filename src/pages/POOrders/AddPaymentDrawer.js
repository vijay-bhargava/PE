import React from "react";
import PEModal from "../../components/PEModal";

const AddPaymentDrawer = ({
  open,
  onClose,
  paymentTargetItem,
  paymentForm,
  handlePaymentFormChange,
  savingPayment,
  handleSubmitPayment,
  poInvoiceList,
  allPOShipHeader,
}) => {
  const invoiceOptions = poInvoiceList?.length > 0
    ? poInvoiceList
    : (allPOShipHeader ?? []).filter(s => s.invoiceNo && (s.invoiceHId || s.invoiceId));

  const toDateInputValue = (val) => {
    if (!val) return '';
    try {
      const d = val instanceof Date ? val : new Date(val);
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  return (
    <PEModal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <>
          Add Payment
          {paymentTargetItem && (
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 400, opacity: 0.7 }}>
              — Item {paymentTargetItem.itemNo || paymentTargetItem.id}
            </span>
          )}
        </>
      }
      footer={
        <>
          <button type="button" className="pe-btn pe-btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pe-btn pe-btn--primary"
            disabled={savingPayment}
            onClick={handleSubmitPayment}
          >
            {savingPayment && <span className="pe-btn-spinner" />}
            Save Payment
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>

        {/* Linked Invoice — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="pe-field-label">Linked Invoice</label>
          <select
            className="pe-detail-form-input"
            value={paymentForm.invoiceId}
            onChange={(e) => handlePaymentFormChange('invoiceId', e.target.value)}
          >
            <option value="">Select Invoice</option>
            {invoiceOptions.map((s, idx) => {
              const invId = s.id ?? s.invoiceHId ?? s.invoiceId;
              return (
                <option key={invId || idx} value={invId}>
                  {s.invoiceNo}{s.invoiceAmount || s.totaLInvoiceAmount ? ` (${s.invoiceAmount || s.totaLInvoiceAmount})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Payment Method | Payment Status */}
        <div>
          <label className="pe-field-label">Payment Method</label>
          <select
            className="pe-detail-form-input"
            value={paymentForm.paymentMethod}
            onChange={(e) => handlePaymentFormChange('paymentMethod', e.target.value)}
          >
            <option value="">Select Method</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="NEFT">NEFT</option>
            <option value="RTGS">RTGS</option>
            <option value="IMPS">IMPS</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="pe-field-label">Payment Status</label>
          <select
            className="pe-detail-form-input"
            value={paymentForm.paymentStatus}
            onChange={(e) => handlePaymentFormChange('paymentStatus', e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Category | UTR Number */}
        <div>
          <label className="pe-field-label">Payment Category</label>
          <input
            className="pe-detail-form-input"
            type="text"
            maxLength={100}
            value={paymentForm.paymentCategory}
            onChange={(e) => handlePaymentFormChange('paymentCategory', e.target.value)}
          />
        </div>

        <div>
          <label className="pe-field-label">UTR Number</label>
          <input
            className="pe-detail-form-input"
            type="text"
            maxLength={100}
            value={paymentForm.utrNumber}
            onChange={(e) => handlePaymentFormChange('utrNumber', e.target.value)}
          />
        </div>

        {/* Bank Reference | SAP Payment Doc */}
        <div>
          <label className="pe-field-label">Bank Reference</label>
          <input
            className="pe-detail-form-input"
            type="text"
            maxLength={100}
            value={paymentForm.bankReference}
            onChange={(e) => handlePaymentFormChange('bankReference', e.target.value)}
          />
        </div>

        <div>
          <label className="pe-field-label">SAP Payment Doc</label>
          <input
            className="pe-detail-form-input"
            type="text"
            maxLength={100}
            value={paymentForm.sapPaymentDoc}
            onChange={(e) => handlePaymentFormChange('sapPaymentDoc', e.target.value)}
          />
        </div>

        {/* Payment Amount | Retention Amount */}
        <div>
          <label className="pe-field-label">Payment Amount <span className="rfq-required-star">*</span></label>
          <input
            className="pe-detail-form-input"
            type="number"
            min={0}
            step="0.01"
            value={paymentForm.paymentAmount}
            onChange={(e) => handlePaymentFormChange('paymentAmount', e.target.value)}
          />
        </div>

        <div>
          <label className="pe-field-label">Retention Amount</label>
          <input
            className="pe-detail-form-input"
            type="number"
            min={0}
            step="0.01"
            value={paymentForm.retentionAmount}
            onChange={(e) => handlePaymentFormChange('retentionAmount', e.target.value)}
          />
        </div>

        {/* Payment Date */}
        <div>
          <label className="pe-field-label">Payment Date <span className="rfq-required-star">*</span></label>
          <input
            className="pe-detail-form-input"
            type="date"
            value={toDateInputValue(paymentForm.paymentDate)}
            onChange={(e) => handlePaymentFormChange('paymentDate', e.target.value ? new Date(e.target.value) : null)}
          />
        </div>

      </div>
    </PEModal>
  );
};

export default AddPaymentDrawer;
