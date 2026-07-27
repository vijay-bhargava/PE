import React from 'react';
import { Tooltip } from '@mui/material';
import { HiPlusSm } from 'react-icons/hi';
import { Alert, Box } from '@mui/material';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import ProductitemCell from '../RequestForQuotation/ProductitemCell';

/**
 * Items/Services tab for the Auction detail page.
 * Extracted from Auctions.js to keep parity with BidGeneralPreview.js pattern.
 * Uses the same rfq-items-toolbar / pe-btn layout as the RFQ detail page.
 */
const BidItemsTab = ({
  /* permissions */
  loadingPermissions,
  hasReadPermission,
  hasEditPermission,
  hasCreatePermission,
  hasRemovePermission,
  /* data */
  bidItemsList,
  tempDataForItemService,
  bidtype,
  stagearray,
  currentStage,
  /* handlers */
  toggleDrawer,
  setConfirmClearAllItems,
  handleShowReOpenModal,
  handleShowPRModal,
  downloadItemsExcel,
  handleEditItem,
  handleDeleteItem,
  callbackItemAdd,
}) => {
  if (loadingPermissions) return <GridSkeleton />;

  if (!hasReadPermission) {
    return (
      <div className="p-3">
        <Alert severity="warning">
          You don't have permission to view the Items/Services tab.
        </Alert>
      </div>
    );
  }

  const canAct = stagearray.includes(currentStage);
  const isDutch = tempDataForItemService[0]?.bidSubTypeId == 82;
  const isFrench = bidtype?.id == 5 || bidtype?.id == 6;
  const addDisabled =
    (isFrench && bidItemsList?.length > 0) ||
    (isDutch && bidItemsList?.length > 0) ||
    !canAct ||
    !hasCreatePermission;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', p: 2, px: 3 }}>
      {/* ── Toolbar ── */}
      <div className="rfq-items-toolbar" style={{ flexShrink: 0 }}>
        <div className="rfq-items-toolbar-right">
            {hasRemovePermission && bidItemsList?.length > 0 && (
              <>
                <button
                  type="button"
                  className="pe-btn pe-btn--ghost"
                  onClick={() => setConfirmClearAllItems(true)}
                  disabled={!canAct}
                >
                  Clear All
                </button>
                <span className="rfq-items-divider" />
              </>
            )}

            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              disabled={!canAct || !hasCreatePermission}
              onClick={() => handleShowReOpenModal('PullRFQ')}
            >
              Pull RFQ
            </button>

            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              disabled={!canAct || !hasCreatePermission}
              onClick={() => handleShowPRModal('PullPR')}
            >
              Pull PR Data
            </button>

            <span className="rfq-items-divider" />

            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              disabled={!canAct || !hasCreatePermission}
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              Excel Upload
            </button>

            <button
              type="button"
              className="pe-btn pe-btn--secondary"
              disabled={!hasReadPermission}
              onClick={downloadItemsExcel}
            >
              Excel Template
            </button>

            <span className="rfq-items-divider" />

            <Tooltip title={isDutch && bidItemsList?.length > 0 ? 'In Dutch auction you can add only one line item' : ''}>
              <span>
                <button
                  type="button"
                  className="pe-btn pe-btn--primary"
                  onClick={() => toggleDrawer('addProductDrawer', true)()}
                  disabled={addDisabled}
                >
                  <HiPlusSm /> Items/Services
                </button>
              </span>
            </Tooltip>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rfq-v2-table-wrapper" style={{ flex: 1, minHeight: 0 }}>
        <ProductitemCell
          action={canAct && hasEditPermission}
          itemsList={bidItemsList}
          handleEditItem={hasEditPermission ? handleEditItem : () => { }}
          handleDeleteItem={hasRemovePermission ? handleDeleteItem : () => { }}
          callbackItemAdd={callbackItemAdd}
          tempDataForItemService={tempDataForItemService}
          eventType="Auction"
          readOnly={!hasEditPermission}
          showEditButton={hasEditPermission}
          showDeleteButton={hasRemovePermission}
        />
      </div>
    </Box>
  );
};

export default BidItemsTab;
