/**
 * Permission Manager - Centralized access control utility
 */

export class PermissionManager {
    constructor(userAccess = []) {
        this.userAccess = userAccess;
        this.permissions = this.parsePermissions(userAccess);
    }

    /**
     * Parse user access data into a structured format
     */
    parsePermissions(userAccess) {
        const permissions = {};
        
        userAccess.forEach(access => {
            const claimType = access.claimType;
            const claimValue = JSON.parse(access.claimValue);
            
            permissions[claimType] = {
                assign: claimValue.Assign === "Y",
                read: claimValue.Read === "Y", 
                create: claimValue.Create === "Y",
                remove: claimValue.Remove === "Y",
                share: claimValue.Share === "Y",
                edit: claimValue.Edit === "Y"
            };
        });
        
        return permissions;
    }

    /**
     * Check if user has specific permission for a claim type
     */
    hasPermission(claimType, action) {
        const permission = this.permissions[claimType];
        if (!permission) {
            console.warn(`No permissions found for claim type: ${claimType}`);
            return false;
        }
        
        return permission[action] || false;
    }

    /**
     * Check multiple permissions at once
     */
    hasPermissions(claimType, actions = []) {
        return actions.every(action => this.hasPermission(claimType, action));
    }

    /**
     * Get all permissions for a specific claim type
     */
    getPermissions(claimType) {
        return this.permissions[claimType] || {
            assign: false,
            read: false,
            create: false,
            remove: false,
            share: false,
            edit: false
        };
    }

    /**
     * Check if user can perform any action on a claim type
     */
    hasAnyPermission(claimType) {
        const permissions = this.getPermissions(claimType);
        return Object.values(permissions).some(permission => permission === true);
    }

    /**
     * Get readable permission summary
     */
    getPermissionSummary(claimType) {
        const permissions = this.getPermissions(claimType);
        const allowed = Object.entries(permissions)
            .filter(([action, allowed]) => allowed)
            .map(([action]) => action);
        
        return {
            claimType,
            allowedActions: allowed,
            permissions
        };
    }
}

/**
 * Permission constants for better maintainability
 */
export const CLAIM_TYPES = {
    AUDIT_HISTORY: "Audit History",
    COMMERCIAL_TERMS: "Commercial Terms", 
    DOCUMENT_LIBRARY: "Document Library",
    EVENT_DETAILS: "Event Details",
    GENERAL: "General",
    ITEM_SERVICE: "Item Service",
    LIST: "List",
    MANAGE_AUCTION: "Manage Auction",
    QUERIES: "Queries",
    QUESTIONS: "Questions",
    RFQ_SUMMARY: "RFQ Summary",
    SUPPLIER_DETAILS: "Supplier Details",
    SUPPLIER_QUALIFICATION: "Supplier Qualification", 
    SUPPLIER_USERS: "Supplier Users",
    SUPPLIERS: "Suppliers",
    WORK_FLOW: "Work Flow",
    FINANCIAL_RESPONSES: "Financial Responses",
    COMMERCIAL_RESPONSES: "Commercial Responses",
    TECHNICAL_RESPONSES: "Technical Responses"
};

export const ACTIONS = {
    ASSIGN: "assign",
    READ: "read",
    CREATE: "create", 
    REMOVE: "remove",
    SHARE: "share",
    EDIT: "edit"
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermissions = (WrappedComponent, claimType, requiredActions = []) => {
    return function PermissionWrapper(props) {
        const { permissionManager, ...otherProps } = props;
        
        if (!permissionManager) {
            console.warn("PermissionManager not provided to component");
            return null;
        }

        const hasRequiredPermissions = requiredActions.length === 0 
            ? permissionManager.hasAnyPermission(claimType)
            : permissionManager.hasPermissions(claimType, requiredActions);

        if (!hasRequiredPermissions) {
            return (
                <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    You don't have permission to access this feature.
                </div>
            );
        }

        return <WrappedComponent {...otherProps} permissionManager={permissionManager} />;
    };
};

/**
 * React hook for using permissions
 */
export const usePermissions = (permissionManager, claimType) => {
    if (!permissionManager) {
        console.warn("PermissionManager not provided");
        return {
            canRead: false,
            canCreate: false,
            canEdit: false,
            canRemove: false,
            canAssign: false,
            canShare: false,
            hasAnyPermission: false,
            getPermissions: () => ({})
        };
    }

    return {
        canRead: permissionManager.hasPermission(claimType, ACTIONS.READ),
        canCreate: permissionManager.hasPermission(claimType, ACTIONS.CREATE),
        canEdit: permissionManager.hasPermission(claimType, ACTIONS.EDIT), 
        canRemove: permissionManager.hasPermission(claimType, ACTIONS.REMOVE),
        canAssign: permissionManager.hasPermission(claimType, ACTIONS.ASSIGN),
        canShare: permissionManager.hasPermission(claimType, ACTIONS.SHARE),
        hasAnyPermission: permissionManager.hasAnyPermission(claimType),
        getPermissions: () => permissionManager.getPermissions(claimType)
    };
};

export default PermissionManager;
