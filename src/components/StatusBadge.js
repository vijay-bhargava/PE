import React from 'react';

const STATUS_MAP = {
	draft: { bg: '#eeeeee', color: '#374151', dot: '#9ca3af' },
	cancel: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	cancelled: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	rejected: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	open: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	running: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	active: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	published: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	approved: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	confirmed: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	completed: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	awarded: { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
	forwarded: { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
	paused: { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
	'forward for approval': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
	'pre approval': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
	'under pre approval': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
	'technical approval': { bg: '#dcfce7', color: '#065f46', dot: '#10b981' },
	'under technical approval': { bg: '#dcfce7', color: '#065f46', dot: '#10b981' },
	'commercial approval': { bg: '#dff2ff', color: '#075985', dot: '#0284c7' },
	'under commercial approval': { bg: '#dff2ff', color: '#075985', dot: '#0284c7' },
	allocation: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	allocated: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	closed: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' },
	close: { bg: '#e5e7eb', color: '#374151', dot: '#6b7280' },
	pending: { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	// PO statuses
	'po confirmed': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'under approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	'under po approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	'pending approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	'in process': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	'po sent to supplier': { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	'sent to supplier': { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	// ASN statuses
	created: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	shipped: { bg: '#dff2ff', color: '#075985', dot: '#0284c7' },
	'in transit': { bg: '#dff2ff', color: '#075985', dot: '#0284c7' },
	delivered: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'partially delivered': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
	// GRN statuses
	received: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'partially received': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
	'fully received': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'grn created': { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	'grn approved': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'grn rejected': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	'under grn approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	// Invoice statuses
	'partially invoiced': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
	'fully invoiced': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'not invoiced': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	invoiced: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'invoice raised': { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	'invoice approved': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'invoice rejected': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	'under invoice approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	// Payment statuses
	paid: { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'partially paid': { bg: '#ffedd5', color: '#9a3412', dot: '#f97316' },
	unpaid: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	'payment pending': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	'payment processed': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	// Service Entry statuses
	'se created': { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	'se approved': { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
	'se rejected': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	'under se approval': { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	// Generic
	new: { bg: '#e0e7ff', color: '#3730a3', dot: '#6366f1' },
	processing: { bg: '#fef3c7', color: '#92400e', dot: '#d97706' },
	failed: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	expired: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
	hold: { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
	'on hold': { bg: '#fff3cd', color: '#7a3f00', dot: '#b45309' },
};

const StatusBadge = ({ status }) => {
	if (!status) return null;
	const key = String(status).trim().toLowerCase();
	const c = STATUS_MAP[key] || { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
	return (
		<span className="rfq-v2-status-badge" style={{ background: c.bg, color: c.color }} title={status}>
			<span className="rfq-v2-status-dot" style={{ background: c.dot }} />
			{status}
		</span>
	);
};

export default StatusBadge;
