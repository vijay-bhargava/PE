import React from "react";
import {
  Alert,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";
import { downloadFilesOnAzure, getFileName } from "../../../utils/common";
import POItemList from '../POItemList';

const LineItemsTab = ({
  isItemServicesReadDisabled,
  addFlowMode,
  ADD_FLOW_LABEL,
  addFlowSelectedItems,
  cancelAddFlow,
  handleAddFlowNext,
  displayPOItems,
  allPOShipHeader,
  currentStage,
  pageSlug,
  poCustomerId,
  customerid,
  apiClient,
  atoken,
  poSpecificDetails,
  handleAddFlowToggleItem,
  handleAddFlowToggleAll,
  isItemEligibleForAddMode,
  deliveryUpdates,
  setDeliveryDialogRow,
  setDeliveryDialogDate,
  setDeliveryDialogOpen,
  canCreateAsn,
  isUnderApprovalStage,
  handleOpenAddAsnDrawer,
  canCreateGrn,
  getEligibleItemsForAddMode,
  NO_REMAINING_ITEM_MSG_GRN,
  setPOOrderItems,
  SetRef_ItemId,
  setSelectedGrnItems,
  setAddGrnDialogOpen,
  canCreateInvoice,
  handleOpenAddInvoiceDrawer,
  canCreateSes,
  NO_REMAINING_ITEM_MSG_SES,
  setSelectedSesItems,
  setAddSesDialogOpen,
  allPOItems,
  setSesDialogMode,
  setSesPreviewData,
  toggleDrawer,
  setValue,
  canCreatePayment,
  setPaymentTargetItem,
  resetPaymentForm,
  setOpenAddPaymentDrawer,
  handlePreviewInvoice,
  handlePreviewAsn,
  fetchPaymentDetails,
}) => {
  return (
    !isItemServicesReadDisabled ? (
      <div className="p-3">
        {addFlowMode && (
          <Box sx={{
            mb: 2, p: 1.5, borderRadius: 1,
            bgcolor: '#eef4ff', border: '1px solid #c7dcfb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 1
          }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1976d2' }}>
              Select line items for {ADD_FLOW_LABEL[addFlowMode]}
              {addFlowSelectedItems.length > 0 ? ` — ${addFlowSelectedItems.length} selected` : ''}
            </Typography>
            {addFlowSelectedItems.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={cancelAddFlow}
                  sx={{ textTransform: 'none' }}
                >
                  Back
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleAddFlowNext}
                  sx={{ textTransform: 'none' }}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
        )}
        <POItemList
          items={displayPOItems}
          shipments={allPOShipHeader}
          currentStage={currentStage}
          poId={pageSlug}
          customerId={poCustomerId ?? customerid}
          apiClient={apiClient}
          atoken={atoken}
          itemConditions={poSpecificDetails?.poItemConditions ?? []}
          selectionMode={!!addFlowMode}
          selectedItemIds={addFlowSelectedItems.map(i => i.id)}
          onToggleSelectItem={handleAddFlowToggleItem}
          onToggleSelectAll={handleAddFlowToggleAll}
          isItemSelectable={(item) => !addFlowMode || isItemEligibleForAddMode(addFlowMode, item)}
          isItemGrnAddAllowed={(item) => isItemEligibleForAddMode('GRN', item)}
          deliveryUpdates={deliveryUpdates}
          onEditDeliveryDate={(item, newDate) => {
            setDeliveryDialogRow(item);
            setDeliveryDialogDate(
              newDate
                ? new Date(newDate)
                : (deliveryUpdates[item.id] ?? (item.poDeliveryDate ? new Date(item.poDeliveryDate) : null))
            );
            setDeliveryDialogOpen(true);
          }}
          onAddASN={(canCreateAsn && !isUnderApprovalStage) ? ((item) => {
            handleOpenAddAsnDrawer([item]);
          }) : undefined}
          onAddGRN={(canCreateGrn && !isUnderApprovalStage) ? ((item) => {
            const eligibleItems = getEligibleItemsForAddMode('GRN', [item]);
            if (eligibleItems.length === 0) {
              toast.warning(NO_REMAINING_ITEM_MSG_GRN);
              return;
            }
            setPOOrderItems(item);
            SetRef_ItemId(item.id);
            setSelectedGrnItems(eligibleItems);
            setAddGrnDialogOpen(true);
          }) : undefined}
          onAddInvoice={
            (canCreateInvoice && !isUnderApprovalStage)
              ? (item) => {
                handleOpenAddInvoiceDrawer([item]);
              }
              : undefined
          }
          onAddSES={(canCreateSes && !isUnderApprovalStage) ? ((item) => {
            const eligibleItems = getEligibleItemsForAddMode('SES', [item]);
            if (eligibleItems.length === 0) {
              toast.warning(NO_REMAINING_ITEM_MSG_SES);
              return;
            }
            setPOOrderItems(item);
            SetRef_ItemId(item.id);
            setSelectedSesItems(eligibleItems);
            setAddSesDialogOpen(true);
          }) : undefined}
          onPreviewSES={(ses) => {
            const matchedItem = allPOItems.find(it => String(it.id) === String(ses.poItemId));
            setSesDialogMode('preview');
            setSesPreviewData(ses);
            setSelectedSesItems(matchedItem ? [matchedItem] : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service'));
            setAddSesDialogOpen(true);
          }}
          onAddAdvanceInvoice={(item) => {
            setPOOrderItems(item);
            SetRef_ItemId(item.id);
            toggleDrawer("openCreateSheet", true, item)();
          }}
          onAddPayment={canCreatePayment ? ((item) => {
            setPOOrderItems(item);
            SetRef_ItemId(item.id);
            setPaymentTargetItem(item);
            resetPaymentForm();
            setOpenAddPaymentDrawer(true);
          }) : undefined}
          onViewInvoice={(invoice) => {
            handlePreviewInvoice(invoice);
          }}
          onViewASN={(asn) => {
            handlePreviewAsn(asn);
          }}
          onViewPayment={(payment) => {
            if (payment.invoiceHId || payment.invoiceHid) {
              fetchPaymentDetails(payment.invoiceHId || payment.invoiceHid);
            } else {
              toast.warning('No invoice associated with this payment.');
            }
          }}
          onDownloadInvoice={(invoice) => {
            if (invoice.invoicePath && invoice.invoiceFile) {
              downloadFilesOnAzure(
                invoice.invoicePath,
                getFileName(invoice.invoiceFile),
                atoken
              );
            } else {
              toast.warning('Invoice document not available for download.');
            }
          }}
        />
      </div>
    ) : (
      <div className="p-4">
        <Alert severity="error">
          <div className="d-flex align-items-center">
            <HiOutlineX className="me-2 f18" />
            Access Denied: You don't have permission to view Line Items.
          </div>
        </Alert>
      </div>
    )
  );
};

export default LineItemsTab;
