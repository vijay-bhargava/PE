import React, { createContext, useContext, useState, useEffect } from 'react';
import PermissionManager from '../utils/permissionManager';

const PermissionContext = createContext(null);

export const PermissionProvider = ({ children, userAccess = [] }) => {
    const [permissionManager, setPermissionManager] = useState(null);

    useEffect(() => {
        if (userAccess && userAccess.length > 0) {
            const manager = new PermissionManager(userAccess);
            setPermissionManager(manager);
        }
    }, [userAccess]);

    return (
        <PermissionContext.Provider value={permissionManager}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissionContext = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        console.warn('usePermissionContext must be used within a PermissionProvider');
    }
    return context;
};

export default PermissionContext;
