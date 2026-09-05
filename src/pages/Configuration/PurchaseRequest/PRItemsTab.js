import React from 'react';
import { Alert, Box } from '@mui/material';
import { HiPlusSm, HiOutlineX } from 'react-icons/hi';
import PRProductItemCell from './PRProductItemCell';
import PRBoqScreen from './PRBoqScreen';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';

const PRItemsTab = ({
  loadingPermissions,
  canRead,
  canEdit,
  canCreate,
  canRemove,
  stagearray,
  currentStage,
  prItemsList,
  isBoq,
  idFromURL,
  toggleDrawer,
  handleEditItem,
  handleDeleteItem,
  pullPRtemServiceFind,
  setConfirmClearAllItems,
  downloadPRExcel,
  handleItemsExcelUpload,
}) => {
  if (loadingPermissions) return <GridSkeleton />;

  if (!canRead) {
    return (
      <div className="p-4">
        <Alert severity="error">
          <div className="d-flex align-items-center">
            <HiOutlineX className="me-2 f18" />
            Access Denied: You don't have permission to view Items/Services.
          </div>
        </Alert>
      </div>
    );
  }

  const canAct = stagearray.includes(currentStage) || currentStage === 'Under Approval';

  if (isBoq) {
    return (
      <PRBoqScreen
        idFromURL={idFromURL}
        CurrentVersion={1}
        stage={currentStage}
        boqReq={isBoq}
        readOnly={!(canAct && canEdit)}
        onUploadSuccess={() => pullPRtemServiceFind(idFromURL)}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}>
      <div className="rfq-items-toolbar" style={{ flexShrink: 0 }}>
        <div className="rfq-items-toolbar-right">
          {prItemsList?.length > 0 && canRemove && (
            <>
              <button
                type="button"
                className="rfq-v2-event-btn rfq-v2-event-btn-ghost"
                onClick={() => setConfirmClearAllItems(true)}
                disabled={!canAct}
              >
                Clear
              </button>
              <span className="rfq-items-divider" />
            </>
          )}
          <button
            type="button"
            className="pe-btn pe-btn--secondary"
            disabled={!canAct || !canCreate}
            onClick={() => canCreate && handleItemsExcelUpload()}
          >
            Excel Upload
          </button>
          <button
            type="button"
            className="pe-btn pe-btn--secondary"
            disabled={!canRead}
            onClick={downloadPRExcel}
          >
            Excel Template
          </button>
          <span className="rfq-items-divider" />
          <button
            type="button"
            className="pe-btn pe-btn--primary"
            onClick={toggleDrawer('addProductDrawer', true)}
            disabled={!canAct || !canCreate}
          >
            <HiPlusSm /> Items/Services
          </button>
        </div>
      </div>
      <div className="rfq-v2-table-wrapper" style={{ flex: 1, minHeight: 0, height: 'auto' }}>
        <PRProductItemCell
          action={canAct && canEdit}
          itemsList={prItemsList}
          handleEditItem={canEdit ? handleEditItem : () => { }}
          handleDeleteItem={canRemove ? handleDeleteItem : () => { }}
          eventType="PR"
        />
      </div>
    </Box>
  );
};

export default PRItemsTab;
