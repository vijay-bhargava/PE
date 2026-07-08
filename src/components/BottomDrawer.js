import React from 'react';

const CommonCommonCommonBottomDrawer = ({ open, onClose, title, actions, children, bodyStyle, titleId, backdropStyle, sectionStyle }) => {
  if (!open) return null;
  return (
    <div
      className="rfq-v2-event-drawer-backdrop"
      role="presentation"
      style={backdropStyle}
      onClick={onClose}
    >
      <section
        className="rfq-v2-event-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={sectionStyle}
        onClick={e => e.stopPropagation()}
      >
        <header className="rfq-v2-event-drawer-header">
          <h2 id={titleId} className="rfq-v2-event-drawer-title">{title}</h2>
          <div className="rfq-v2-event-drawer-actions">{actions}</div>
        </header>
        <div className="rfq-v2-event-drawer-body" style={bodyStyle}>
          {children}
        </div>
      </section>
    </div>
  );
};

export default CommonCommonCommonBottomDrawer;
