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
