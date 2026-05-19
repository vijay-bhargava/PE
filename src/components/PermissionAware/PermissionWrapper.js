import React from 'react';
import { Alert } from '@mui/material';
import { HiOutlineX } from 'react-icons/hi';
import { PersonOutlined } from '@mui/icons-material';

/**
 * Permission-aware wrapper component that handles access control for tabs/sections
 */
const PermissionWrapper = ({ 
    permissionManager, 
    claimType, 
    requiredAction = 'read', 
    children, 
    readOnlyComponent = null,
    noAccessMessage = null 
}) => {
    if (!permissionManager) {
        // If permission manager is not available, show content (fallback)
        return children;
    }

    const canRead = permissionManager.hasPermission(claimType, 'read');
    const canPerformAction = permissionManager.hasPermission(claimType, requiredAction);
    const hasAnyPermission = permissionManager.hasAnyPermission(claimType);

    // No permission at all
    if (!hasAnyPermission) {
        return (
            <div className="p-4">
                <Alert severity="warning">
                    <div className="d-flex align-items-center">
                        <HiOutlineX className="me-2 f18" />
                        {noAccessMessage || `You don't have permission to access ${claimType}.`}
                    </div>
                </Alert>
            </div>
        );
    }

    // Can read but not perform the required action
    if (canRead && !canPerformAction && requiredAction !== 'read') {
        if (readOnlyComponent) {
            return (
                <div className="p-4">
                    <Alert severity="info" className="mb-3">
                        <div className="d-flex align-items-center">
                            <PersonOutlined className="me-2" />
                            You have read-only access to {claimType}.
                        </div>
                    </Alert>
                    {readOnlyComponent}
                </div>
            );
        }
        
        return (
            <div className="p-4">
                <Alert severity="info">
                    <div className="d-flex align-items-center">
                        <PersonOutlined className="me-2" />
                        You have limited access to {claimType}. You can view but cannot {requiredAction}.
                    </div>
                </Alert>
            </div>
        );
    }

    // Full access - render children
    return children;
};

/**
 * Helper hook to get permission status for a claim type
 */
export const usePermissionStatus = (permissionManager, claimType) => {
    if (!permissionManager) {
        return {
            canRead: true,
            canEdit: true,
            canCreate: true,
            canRemove: true,
            canShare: false,
            canAssign: false,
            hasAnyPermission: true,
            hasFullAccess: true
        };
    }

    const canRead = permissionManager.hasPermission(claimType, 'read');
    const canEdit = permissionManager.hasPermission(claimType, 'edit');
    const canCreate = permissionManager.hasPermission(claimType, 'create');
    const canRemove = permissionManager.hasPermission(claimType, 'remove');
    const canShare = permissionManager.hasPermission(claimType, 'share');
    const canAssign = permissionManager.hasPermission(claimType, 'assign');
    const hasAnyPermission = permissionManager.hasAnyPermission(claimType);

    return {
        canRead,
        canEdit,
        canCreate,
        canRemove,
        canShare,
        canAssign,
        hasAnyPermission,
        hasFullAccess: canRead && canEdit && canCreate && canRemove
    };
};

/**
 * Component that conditionally renders based on a specific permission
 */
export const ConditionalRender = ({ 
    permissionManager, 
    claimType, 
    action, 
    children, 
    fallback = null 
}) => {
    if (!permissionManager) {
        return children; // Fallback to showing content if no permission manager
    }

    const hasPermission = permissionManager.hasPermission(claimType, action);
    
    return hasPermission ? children : fallback;
};

export default PermissionWrapper;
