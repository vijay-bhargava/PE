import React from 'react';
import { usePermissions, CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';
import { Button, Alert } from '@mui/material';

/**
 * Example: Commercial Terms Component with Permission Control
 */
const CommercialTermsComponent = ({ permissionManager, ...props }) => {
    const {
        canRead,
        canCreate,
        canEdit,
        canRemove,
        hasAnyPermission
    } = usePermissions(permissionManager, CLAIM_TYPES.COMMERCIAL_TERMS);

    // If no permission to even view, show access denied
    if (!hasAnyPermission) {
        return (
            <Alert severity="warning">
                You don't have permission to access Commercial Terms.
            </Alert>
        );
    }

    // If can't read, show limited access message
    if (!canRead) {
        return (
            <Alert severity="info">
                Limited access to Commercial Terms. Contact administrator for more permissions.
            </Alert>
        );
    }

    return (
        <div className="commercial-terms-section">
            <div className="section-header d-flex justify-content-between align-items-center">
                <h5>Commercial Terms</h5>
                <div className="action-buttons">
                    {canCreate && (
                        <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => console.log('Create new term')}
                        >
                            Add Term
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="commercial-terms-content">
                {/* Your commercial terms content here */}
                <div className="terms-list">
                    {/* Example term item */}
                    <div className="term-item d-flex justify-content-between align-items-center p-2 border-bottom">
                        <span>Sample Term</span>
                        <div className="term-actions">
                            {canEdit && (
                                <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => console.log('Edit term')}
                                >
                                    Edit
                                </Button>
                            )}
                            {canRemove && (
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error"
                                    className="ms-2"
                                    onClick={() => console.log('Remove term')}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Example: Document Library Component with Permission Control
 */
const DocumentLibraryComponent = ({ permissionManager, ...props }) => {
    const {
        canRead,
        canCreate,
        canEdit,
        canRemove,
        hasAnyPermission
    } = usePermissions(permissionManager, CLAIM_TYPES.DOCUMENT_LIBRARY);

    if (!hasAnyPermission) {
        return (
            <Alert severity="warning">
                You don't have permission to access Document Library.
            </Alert>
        );
    }

    if (!canRead) {
        return (
            <Alert severity="info">
                Limited access to Document Library.
            </Alert>
        );
    }

    return (
        <div className="document-library-section">
            <div className="section-header d-flex justify-content-between align-items-center">
                <h5>Document Library</h5>
                <div className="action-buttons">
                    {canCreate && (
                        <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => console.log('Upload document')}
                        >
                            Upload Document
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="document-library-content">
                {/* Your document library content here */}
                <div className="documents-list">
                    {/* Example document item */}
                    <div className="document-item d-flex justify-content-between align-items-center p-2 border-bottom">
                        <span>Sample Document.pdf</span>
                        <div className="document-actions">
                            {canEdit && (
                                <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => console.log('Edit document')}
                                >
                                    Edit
                                </Button>
                            )}
                            {canRemove && (
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error"
                                    className="ms-2"
                                    onClick={() => console.log('Remove document')}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Example: Suppliers Component with Permission Control
 */
const SuppliersComponent = ({ permissionManager, ...props }) => {
    const {
        canRead,
        canCreate,
        canEdit,
        canRemove,
        hasAnyPermission
    } = usePermissions(permissionManager, CLAIM_TYPES.SUPPLIERS);

    if (!hasAnyPermission) {
        return (
            <Alert severity="warning">
                You don't have permission to access Suppliers.
            </Alert>
        );
    }

    if (!canRead) {
        return (
            <Alert severity="info">
                Limited access to Suppliers.
            </Alert>
        );
    }

    return (
        <div className="suppliers-section">
            <div className="section-header d-flex justify-content-between align-items-center">
                <h5>Suppliers</h5>
                <div className="action-buttons">
                    {canCreate && (
                        <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => console.log('Add supplier')}
                        >
                            Add Supplier
                        </Button>
                    )}
                </div>
            </div>
            
            <div className="suppliers-content">
                {/* Your suppliers content here */}
                <div className="suppliers-list">
                    {/* Example supplier item */}
                    <div className="supplier-item d-flex justify-content-between align-items-center p-2 border-bottom">
                        <span>Sample Supplier Inc.</span>
                        <div className="supplier-actions">
                            {canEdit && (
                                <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => console.log('Edit supplier')}
                                >
                                    Edit
                                </Button>
                            )}
                            {canRemove && (
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error"
                                    className="ms-2"
                                    onClick={() => console.log('Remove supplier')}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { CommercialTermsComponent, DocumentLibraryComponent, SuppliersComponent };
