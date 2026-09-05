import React from 'react';
import { Alert, Box } from '@mui/material';
import { HiPlusSm, HiOutlineX } from 'react-icons/hi';
import { KeyboardArrowDownOutlined } from '@mui/icons-material';
import ProductitemCell from './ProductitemCell';
import BoqScreen from './BoqScreen';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';

const RFQItemsTab = ({
  loadingPermissions,
  canRead,
  canEdit,
  canCreate,
  canRemove,
  stagearray,
  currentStage,
  rfqItemsList,
  boqReq,
  idFromURL,
  rfqVersion,
  downloadItemsExcel,
  downloadEventItemsExcel,
  setConfirmClearAllItems,
  toggleDrawer,
  handleEditItem,
  handleDeleteItem,
  pullRFQItemServiceFind,
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

  const canAct = stagearray.includes(currentStage);

  if (boqReq === true) {
    return (
      <BoqScreen
        idFromURL={idFromURL}
        eventType="RFQ"
        CurrentVersion={rfqVersion}
        stage={currentStage}
        boqReq={boqReq}
        readOnly={!(canAct && canEdit)}
        onUploadSuccess={() => pullRFQItemServiceFind(idFromURL)}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}>
      <div className="rfq-items-toolbar" style={{ flexShrink: 0 }}>
        <div className="rfq-items-toolbar-right">
          {rfqItemsList?.length > 0 && canRemove && (
            <>
              <button
                type="button"
                className="pe-btn pe-btn--ghost"
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
          >
            Pull PR Data
          </button>
          <span className="rfq-items-divider" />
          <button
            type="button"
            className="pe-btn pe-btn--secondary"
            disabled={!canAct || !canCreate}
            onClick={() => canCreate && document.getElementById('itemuploadid').click()}
          >
            <span>Excel Upload</span>
            <span className="rfq-question-action-chevron">
              <KeyboardArrowDownOutlined style={{ fontSize: 16 }} />
            </span>
          </button>
          <button
            type="button"
            className="pe-btn pe-btn--secondary"
            disabled={!canRead}
            onClick={downloadItemsExcel}
          >
            Excel Template
          </button>
          {idFromURL && rfqItemsList?.length > 0 && (
            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              disabled={!canRead}
              onClick={downloadEventItemsExcel}
            >
              Export Line Items
            </button>
          )}
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
        <ProductitemCell
          action={canAct && canEdit}
          itemsList={rfqItemsList}
          handleEditItem={canEdit ? handleEditItem : () => { }}
          handleDeleteItem={canRemove ? handleDeleteItem : () => { }}
          eventType="RFQ"
          CurrentVersion={rfqVersion}
          readOnly={!canEdit}
          showEditButton={canEdit}
          showDeleteButton={canRemove}
        />
      </div>
    </Box>
  );
};

export default RFQItemsTab;
