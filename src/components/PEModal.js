import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { HiOutlineX } from "react-icons/hi";
import "../assets/css/design-system.css";

/**
 * Shared modal/popup shell — every dialog/popup in the app should render
 * through this component instead of hand-rolling its own MUI `<Dialog>` or
 * react-bootstrap `<Modal>` chrome. One component means one place to fix
 * spacing/z-index/scroll bugs instead of N places.
 *
 * Built on MUI `<Dialog>` (not react-bootstrap `<Modal>`) because:
 *   - `size` maps directly to MUI's `maxWidth` scale (xs/sm/md/lg/xl) —
 *     exactly the per-modal sizing this app actually needs.
 *   - MUI's Modal/Dialog stacking (z-index via the shared MUI theme) avoids
 *     the backdrop-z-index bugs repeatedly hand-patched on bootstrap Modals
 *     in this app (`zindex10002` class, ad-hoc `style={{zIndex:9999}}`).
 *
 * The dialog is bounded to `calc(100vh - 64px)` with a 32px top/bottom
 * margin (see .pe-modal-paper), and only the body scrolls — header and
 * footer stay fixed regardless of content length.
 *
 * Usage:
 *   <PEModal
 *     open={show}
 *     onClose={handleClose}
 *     size="md"                 // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *     title="Item Details"
 *     footer={<>
 *       <button className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
 *       <button className="pe-btn pe-btn--primary" onClick={handleSave}>Save</button>
 *     </>}
 *   >
 *     ...body content...
 *   </PEModal>
 *
 * Props:
 *   open, onClose         — required
 *   size                  — 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default 'md')
 *   title                 — header text/node (omit to render no header)
 *   subtitle              — small text next to the title (e.g. "Last Revised: ...")
 *   hideCloseButton       — omit the header's X button (default false)
 *   disableBackdropClose  — ignore backdrop-click/Escape dismiss (default false)
 *   footer                — footer content (omit to render no footer)
 *   bodyStyle             — extra style object merged onto the body
 *   bodyClassName         — extra className merged onto the body
 *   fullWidth             — MUI fullWidth (default true — fills up to `size`)
 *   dialogProps           — escape hatch for rarely-needed MUI Dialog props
 */
const PEModal = ({
  open,
  onClose,
  size = "md",
  title,
  subtitle,
  hideCloseButton = false,
  disableBackdropClose = false,
  footer,
  children,
  bodyStyle,
  bodyClassName = "",
  fullWidth = true,
  dialogProps = {},
}) => {
  // `dialogProps` is a spread escape hatch (e.g. a caller passing its own
  // `PaperProps.sx` for a custom min/max-height) — spreading it after a
  // plain `PaperProps={{ className: "pe-modal-paper" }}` would replace that
  // object wholesale and silently drop the class (and with it, every
  // pe-modal-* style including border-radius). Merge instead of overwrite.
  const { PaperProps: callerPaperProps, ...restDialogProps } = dialogProps;
  const mergedPaperProps = {
    ...callerPaperProps,
    className: ["pe-modal-paper", callerPaperProps?.className].filter(Boolean).join(" "),
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (disableBackdropClose && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose?.(event, reason);
      }}
      maxWidth={size}
      fullWidth={fullWidth}
      className="pe-modal"
      PaperProps={mergedPaperProps}
      {...restDialogProps}
    >
      {title && (
        <DialogTitle className="pe-modal-header">
          <div className="pe-modal-title">
            {title}
            {subtitle && <small className="pe-modal-subtitle">{subtitle}</small>}
          </div>
          {!hideCloseButton && (
            <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={onClose}>
              <HiOutlineX style={{ fontSize: 16 }} />
            </button>
          )}
        </DialogTitle>
      )}

      <DialogContent className={`pe-modal-body ${bodyClassName}`} style={bodyStyle}>
        {children}
      </DialogContent>

      {footer && <DialogActions className="pe-modal-footer">{footer}</DialogActions>}
    </Dialog>
  );
};

export default PEModal;
