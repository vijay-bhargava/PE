import React from 'react';
import { Dialog, TextField, Typography, InputAdornment } from '@mui/material';
import { HiOutlineX } from 'react-icons/hi';

/**
 * Common approval/rejection/forward confirmation dialog for RFQ workflows.
 *
 * Props:
 *   open          {boolean}   — controls visibility
 *   onClose       {function}  — called on cancel / backdrop click
 *   onSubmit      {function}  — called when form is submitted (e.target from <form>)
 *   status        {string}    — "Approved" | "Rejected" | "Forward"
 *   stageName     {string}    — e.g. "Technical Approval"
 *   comment       {string}    — controlled comment value
 *   onCommentChange {function} — (value: string) => void
 *   zIndex        {number}    — optional; use 1500 when inside a fullscreen Dialog
 */
const ApprovalConfirmDialog = ({
  open,
  onClose,
  onSubmit,
  status,
  stageName,
  comment,
  onCommentChange,
  zIndex,
}) => {
  const isReject = status === 'Rejected';
  const isForward = status === 'Forward';

  const title = isReject
    ? 'Reject this stage?'
    : isForward
    ? 'Forward for Approval'
    : 'Approve this stage?';

  const message = isReject ? (
    <>You're rejecting <strong>{stageName}</strong>. The RFQ will remain in this stage until the rejection is handled.</>
  ) : isForward ? (
    <>You're forwarding <strong>{stageName}</strong> for approval. The assigned approver will be notified.</>
  ) : (
    <>You're approving <strong>{stageName}</strong>. The RFQ will move to the next stage once all approvers in this stage approve.</>
  );

  const placeholder = isReject
    ? 'Add the reason for rejection.'
    : isForward
    ? 'Add a note for the forwarding.'
    : 'Add a note for the approval.';

  const submitLabel = isReject ? 'Submit rejection' : isForward ? 'Forward' : 'Submit approval';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{ className: 'rfq-dv2-approval-modal' }}
      BackdropProps={{ className: 'rfq-dv2-approval-backdrop' }}
      sx={zIndex ? { zIndex } : undefined}
    >
      <form onSubmit={onSubmit} autoComplete="off">
        <div className="rfq-dv2-approval-modal-head">
          <h3>{title}</h3>
          <button
            type="button"
            className="pe-icon-btn pe-icon-btn--close"
            aria-label="Close"
            onClick={onClose}
          >
            <HiOutlineX />
          </button>
        </div>

        <div className="rfq-dv2-approval-modal-body">
          <div className={`rfq-dv2-approval-message${isReject ? ' is-reject' : ''}`}>
            {message}
          </div>
          <div className="rfq-dv2-approval-field">
            <label htmlFor="approvalComment">Comment (optional)</label>
            <TextField
              id="approvalComment"
              multiline
              rows={1}
              name="approveComment"
              fullWidth
              variant="outlined"
              placeholder={placeholder}
              inputProps={{ maxLength: 200 }}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              InputProps={{
                endAdornment: comment ? (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                      {comment.length}/200
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
          </div>
        </div>

        <div className="rfq-dv2-approval-modal-actions">
          <button type="button" className="pe-btn pe-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={`pe-btn pe-btn--primary${isReject ? ' is-reject' : ''}`}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default ApprovalConfirmDialog;
