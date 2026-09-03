import React from "react";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Modal } from "react-bootstrap";
import { LocalizationProvider, DateField } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LoadingButton } from "@mui/lab";
import {
  HiOutlineX,
  HiOutlineCollection,
  HiOutlineLink,
} from "react-icons/hi";
import { MdReceipt } from "react-icons/md";
import { Link } from "react-router-dom";
import { downloadFilesOnAzure, getFileName, onlyNumbers, onlyNumberdec } from "../../../utils/common";
import { formatDateViaTimeZone, getOnlyDateFormatPatternLocale } from "../../../utils/common/utility";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import HistoryCell from "../../BaseCells/HistoryCell";
import AddGRNDialog from '../AddGRNDialog';
import SESDialog from '../SESDialog';
import AddASNDialog from '../AddASNDialog';
import AddInvoiceDialog from '../AddInvoiceDialog';
import AddUpdatePaymentterms from '../AddUpdatePaymentterms';
import AddPaymentDrawer from '../AddPaymentDrawer';
import PEModal from '../../../components/PEModal';
import { MemoizedEventStageFlow } from "../../../utils/common/component";

const PODrawers = ({
  // Drawer state
  state,
  setState,
  toggleDrawer,

  // top2 drawer (openCreateSheet - Shipment/Invoice)
  shipConfirmDetails,
  addFlowMode,
  setAddFlowStep,
  setValue,
  tabShipsNotice,
  handleTabShipsNotice,
  currentInvStage,
  invStagelist,
  isServiceItem,
  formik_POShipOrdrItem,
  formik_POShipInvoiceHeader,
  formik_InvoiceAccepted,
  allPOShipHeader,
  atoken,
  formatoption,
  poSpecificDetails,
  currentStage,
  poOrderItems,
  handleGrnMenuOpen,
  handleGrnMenuClose,
  grnMenuAnchor,
  handleViewGrnReport,
  handleDownloadGrnReport,
  loadingGrnReport,
  requestCellINV,
  handleEventAppList,
  wfupdate,
  stagearray,
  invPermissionManager,
  activityId,
  selectedInvoiceId,
  poId,
  selectAttachedFile,
  approveSaveDisable,
  loading,

  // top drawer (openOrderConfirm)
  formik_POConfirmOrder,
  userDetail,
  showAttach,
  returnfileName,
  attachmentfilters,
  handleAttachfileChange,

  // top3 drawer (openOrderReject)
  formik_PORejectOrder,

  // top4 drawer (openOrderGRNSubmit)
  formik_GRNAccepted,
  grnSaveDisable,
  isShippedHistoryEditDisabled,

  // approvePR drawer (openInvoiceApproved)
  formik_POApproveReject,

  // Payment Details Drawer
  loadingPayment,
  paymentDetails,
  setPaymentDetails,

  // Add Payment Drawer
  openAddPaymentDrawer,
  setOpenAddPaymentDrawer,
  resetPaymentForm,
  paymentTargetItem,
  paymentForm,
  handlePaymentFormChange,
  poInvoiceList,
  savingPayment,
  handleSubmitPayment,

  // Payment Terms Modal
  paymentTermModal,
  setPaymentTermModal,
  setPaymentTermsOptions,

  // GRN Report Dialog
  grnReportModal,
  setGrnReportModal,
  loadingGrnReport: loadingGrnReportProp,
  grnReportData,

  // AddGRNDialog
  addGrnDialogOpen,
  handleCloseAddGrnDialog,
  selectedGrnItems,
  allPOItems,
  handleSubmitGrn,
  poGrnList,

  // SESDialog
  addSesDialogOpen,
  handleCloseAddSesDialog,
  selectedSesItems,
  handleSubmitSes,
  sesDialogMode,
  sesPreviewData,

  // AddASNDialog
  addAsnDialogOpen,
  handleCloseAddAsnDialog,
  selectedAsnItems,
  handleSubmitAsn,
  asnDialogMode,
  asnPreviewData,

  // AddInvoiceDialog
  addInvoiceDialogOpen,
  handleCloseAddInvoiceDialog,
  selectedInvoiceItems,
  handleSubmitInvoice,
  UOMMaster,
  invoiceDialogMode,
  invoicePreviewData,
  buildInvoiceStagesPayload,
  customerid,
  poCustomerId,
  invoiceApprovalPanel,
  invoiceApprovalHeaderActions,

  // Delivery Dialog
  deliveryDialogOpen,
  setDeliveryDialogOpen,
  deliveryDialogRow,
  setDeliveryDialogRow,
  deliveryDialogDate,
  setDeliveryDialogDate,
  setDeliveryUpdates,

  // Workflow panel (approvershow)
  approvershow,
  handleApprover,
  requestCell,
  stagelist,
  poPermissionManager,
}) => {
  return (
    <>
      {/* ── Right workflow panel ── */}
      {approvershow && (
        <div style={{ flex: '0 0 300px', width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="bg-white rounded-default shadow-sm" style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2" style={{ flexShrink: 0 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Approval Workflow</span>
              <IconButton onClick={() => handleApprover(false)} size="small">
                <HiOutlineX className="f16" />
              </IconButton>
            </div>
            <div className="flex-grow-1" style={{ overflowY: 'auto', padding: '12px' }}>
              <EventApprovalBox
                requestCell={requestCell}
                handleEventAppList={handleEventAppList}
                wfupdate={wfupdate}
                action={stagearray.includes(currentStage)}
                stagelist={stagelist}
                Version={1}
                permissionManager={poPermissionManager}
                eventCode={poSpecificDetails?.poNumber}
                eventSubject={poSpecificDetails?.headerText}
                startDate={poSpecificDetails?.createdOn}
                endDate={poSpecificDetails?.deliveryDate}
                currentStage={currentStage}
              />
            </div>
          </div>
        </div>
      )}

      <React.Fragment key="top2">
        <Drawer
          anchor="right"
          open={state["openCreateSheet"]}
        >
          <Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1080 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">
                    {shipConfirmDetails?.shipmentDetails?.some(item => isServiceItem(item))
                      ? "Create Service Sheet"
                      : "Shipment/Invoice"}
                  </div>
                  <div>
                    <IconButton
                      onClick={(event) => {
                        toggleDrawer("openCreateSheet", false, allPOShipHeader)(event);
                        if (addFlowMode === 'ASN' || addFlowMode === 'INVOICE') {
                          setAddFlowStep('select');
                          setValue(1);
                        }
                      }}
                      size="small"
                      edge="start"
                      sx={{ mr: 1 }}
                    >
                      <HiOutlineX className="f20 text-white" />
                    </IconButton>
                  </div>
                </div>
              </Box>
              <div className="h50px"></div>
              <div className="row g-0" style={{ overflow: 'hidden' }}>
                <div className={["Under Approval", "Pending for Payment", "Paid"].includes(currentInvStage) && (shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) ? "col-8" : "col-12"}>
                  <Box sx={{ flexGrow: 1, p: 2 }}>
                    <div className="mb-3">
                      <div className="row">
                        {(shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) && (
                          <div className="col-md-12">
                            <MemoizedEventStageFlow
                              stagelist={invStagelist}
                              currentStage={currentInvStage}
                            />
                          </div>
                        )}
                        <div className="col-12">
                          <Box sx={{ width: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Tabs
                              onChange={handleTabShipsNotice}
                              value={tabShipsNotice}
                              aria-label="Tabs where selection follows focus"
                              selectionFollowsFocus
                            >
                              <Tab
                                className="text-capitalize"
                                label={shipConfirmDetails?.shipmentDetails?.some(item => isServiceItem(item))
                                  ? "Service Sheet Header"
                                  : "Ship Notice Header"}
                              />
                              <Tab
                                className="text-capitalize"
                                label="Order Items"
                              />
                              <Tab
                                className="text-capitalize"
                                label="Invoice Details"
                              />
                            </Tabs>
                            {tabShipsNotice === 2 && shipConfirmDetails?.invoiceId && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <HistoryCell eventtype="INV" eventId={shipConfirmDetails.invoiceId} permissionManager={invPermissionManager} />
                              </Box>
                            )}
                          </Box>
                        </div>
                      </div>
                    </div>
                    <hr />
                    {tabShipsNotice == 0 ? (
                      <>
                        {isServiceItem(shipConfirmDetails?.shipmentDetails?.[0]) ? (
                          <div className="row">
                            <div className="col-12 col-md-6 col-lg-6 mb-4">
                              <TextField
                                id="serviceSheetNo"
                                InputLabelProps={{ shrink: true }}
                                name="serviceSheetNo"
                                className="w-100 f14"
                                size="small"
                                label="Service Sheet No *"
                                variant="outlined"
                                value={shipConfirmDetails?.shipSlipId}
                                InputProps={{ readOnly: true }}
                              />
                            </div>
                            <div className="col-12 col-md-6 col-lg-6 mb-4">
                              <TextField
                                label="Service Sheet Date *"
                                variant="outlined"
                                size="small"
                                className="w-100 f14"
                                InputLabelProps={{ shrink: true }}
                                value={
                                  shipConfirmDetails?.serviceSheetDate
                                    ? formatDateViaTimeZone(shipConfirmDetails.serviceSheetDate, "en-GB", formatoption)
                                    : shipConfirmDetails?.shippingDate
                                      ? formatDateViaTimeZone(shipConfirmDetails.shippingDate, "en-GB", formatoption)
                                      : ''
                                }
                                inputProps={{ readOnly: true }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="row ">
                              <div className="col-12 col-md-8 col-lg-8">
                                <div className="mb-4 textblue f14">Shipping</div>

                                <div className="row">
                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="packingSlipId"
                                      InputLabelProps={{ shrink: true }}
                                      name="packingSlipId"
                                      className="w-100 f14"
                                      size="small"
                                      label="Packing Slip ID *"
                                      variant="outlined"
                                      value={shipConfirmDetails?.shipSlipId}
                                    />
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="status"
                                      InputLabelProps={{ shrink: true }}
                                      name="status"
                                      className="w-100 f14"
                                      size="small"
                                      label="Ship Notice Type"
                                      variant="outlined"
                                      value={shipConfirmDetails?.shipNoticeType}
                                    ></TextField>
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-6 mb-4">
                                    <TextField
                                      label="Shipping Date *"
                                      variant="outlined"
                                      size="small"
                                      className="w-100 f14"
                                      InputLabelProps={{ shrink: true }}
                                      value={
                                        shipConfirmDetails?.shippingDate
                                          ? formatDateViaTimeZone(shipConfirmDetails.shippingDate, "en-GB", formatoption)
                                          : ''
                                      }
                                      inputProps={{ readOnly: true }}
                                    />
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-6 mb-4">
                                    <TextField
                                      label="Delivery Date *"
                                      variant="outlined"
                                      size="small"
                                      className="w-100 f14"
                                      InputLabelProps={{ shrink: true }}
                                      value={
                                        shipConfirmDetails?.deliveryDate
                                          ? formatDateViaTimeZone(shipConfirmDetails.deliveryDate, "en-GB", formatoption)
                                          : ''
                                      }
                                      inputProps={{ readOnly: true }}
                                    />
                                  </div>

                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="ewayBillNumber"
                                      InputLabelProps={{ shrink: true }}
                                      name="ewayBillNumber"
                                      className="w-100 f14"
                                      size="small"
                                      label="Eway Bill No. *"
                                      variant="outlined"
                                      value={shipConfirmDetails?.ewayBillNumber}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-12 col-md-8 col-lg-4">
                                <div className="mb-4 textblue f14">Tracking</div>
                                <div className="row">
                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="carrierName"
                                      InputLabelProps={{ shrink: true }}
                                      name="carrierName"
                                      className="w-100 f14"
                                      size="small"
                                      label="Carrier Name"
                                      variant="outlined"
                                      value={shipConfirmDetails?.carrierName}
                                    ></TextField>
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="serviceLevel"
                                      InputLabelProps={{ shrink: true }}
                                      name="serviceLevel"
                                      className="w-100 f14"
                                      size="small"
                                      label="Service Level"
                                      variant="outlined"
                                      value={shipConfirmDetails?.serviceLevel}
                                    />
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="lrShipBillNumber"
                                      InputLabelProps={{ shrink: true }}
                                      name="lrShipBillNumber"
                                      className="w-100 f14"
                                      size="small"
                                      label="AWB/LR/Shipping Bill Number *"
                                      variant="outlined"
                                      value={shipConfirmDetails?.lrShipBillNumber}
                                    />
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-4">
                                    <TextField
                                      id="shipMethod"
                                      InputLabelProps={{ shrink: true }}
                                      name="shipMethod"
                                      className="w-100 f14"
                                      size="small"
                                      label="Shipping Method"
                                      variant="outlined"
                                      value={shipConfirmDetails?.shipMethod}
                                    ></TextField>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <></>
                    )}

                    {tabShipsNotice == 1 ? (
                      <>
                        <form
                          onSubmit={formik_POShipOrdrItem.handleSubmit}
                          autoComplete="off"
                        >
                          <div className="row">
                            <div className="col-12 mb-3 ">
                              {shipConfirmDetails &&
                                shipConfirmDetails?.shipmentDetails?.length > 0 ? (
                                <>
                                  {shipConfirmDetails &&
                                    shipConfirmDetails?.shipmentDetails?.length > 0 ? (
                                    <>
                                      {Object.values(
                                        shipConfirmDetails?.shipmentDetails.reduce((acc, detail) => {
                                          if (!acc[detail?.itemNo]) {
                                            acc[detail?.itemNo] = {
                                              ...detail,
                                              batches: [],
                                            };
                                          }
                                          acc[detail?.itemNo].batches.push({
                                            id: detail.id,
                                            batchId: detail.batchId,
                                            shipQty: detail.shipQty,
                                          });
                                          return acc;
                                        }, {})
                                      ).map((item, index) => (
                                        <div key={index}>
                                          <div className="row border-bottom f12 mb-2 pt-0 pb-3">
                                            <div className="col-12">
                                              <div className="row">
                                                <div className="col-12 col-md-2">
                                                  <div>
                                                    <span className="text-muted">Item No:</span>
                                                    <br />
                                                    {item?.itemNo}
                                                  </div>
                                                </div>
                                                <div className="col-12 col-md-4">
                                                  <div>
                                                    <span className="text-muted">Description:</span>
                                                    <br />
                                                    {item?.itemDesc}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="col-12 mt-1">
                                              <div className="row">
                                                {isServiceItem(item) ? (
                                                  <>
                                                    <div className="col-12 col-md-2">
                                                      <div>
                                                        <span className="text-muted">UOM:</span>
                                                        <br />
                                                        {item?.uom}
                                                      </div>
                                                    </div>
                                                    <div className="col-12 col-md-2">
                                                      <div>
                                                        <span className="text-muted">Unit Price:</span>
                                                        <br />
                                                        {item?.materialPOUnitPrice}
                                                      </div>
                                                    </div>
                                                    <div className="col-12 col-md-3">
                                                      <div>
                                                        <span className="text-muted">Delivery Date:</span>
                                                        <br />
                                                        {item?.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'N/A'}
                                                      </div>
                                                    </div>
                                                  </>
                                                ) : (
                                                  <>
                                                    <div className="col-12 col-md-2">
                                                      <div>
                                                        <span className="text-muted">Qty:</span>
                                                        <br />
                                                        <span className="fw600">{item?.quantity}</span>
                                                      </div>
                                                    </div>
                                                    <div className="col-12 col-md-2">
                                                      <div>
                                                        <span className="text-muted">Unit:</span>
                                                        <br />
                                                        {item?.uom}
                                                      </div>
                                                    </div>
                                                    <div className="col-12 col-md-2">
                                                      <div>
                                                        <span className="text-muted">Net Price :</span>
                                                        <br />
                                                        {item?.materialPOUnitPrice}
                                                      </div>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </div>

                                            {/* Batch rows */}
                                            <div className="col-12 mt-1 bggray pt-2 pb-2">
                                              <div className="row">
                                                <div className="col-12 mt-4">
                                                  {isServiceItem(item) ? (
                                                    <div className="row mb-3">
                                                      <div className="col-12 col-md-2">
                                                        <div>
                                                          <span className="text-muted">Total Item Due Qty:</span>
                                                          <br />
                                                          <span className="fw600">{item?.quantity}</span>
                                                        </div>
                                                      </div>
                                                      {item.batches.map((batch, i) => {
                                                        const batchDetail = shipConfirmDetails?.shipmentDetails?.find(d => d.id === batch.id);
                                                        return (
                                                          <React.Fragment key={batch.id}>
                                                            <div className="col-12 col-md-3">
                                                              <TextField
                                                                label="Service Start Date"
                                                                variant="outlined"
                                                                size="small"
                                                                className="w-100 f14"
                                                                InputLabelProps={{ shrink: true }}
                                                                value={batchDetail?.serviceStartDate ? formatDateViaTimeZone(batchDetail.serviceStartDate, "en-GB", formatoption) : ''}
                                                                inputProps={{ readOnly: true }}
                                                              />
                                                            </div>
                                                            <div className="col-12 col-md-3">
                                                              <TextField
                                                                label="Service End Date"
                                                                variant="outlined"
                                                                size="small"
                                                                className="w-100 f14"
                                                                InputLabelProps={{ shrink: true }}
                                                                value={batchDetail?.serviceEndDate ? formatDateViaTimeZone(batchDetail.serviceEndDate, "en-GB", formatoption) : ''}
                                                                inputProps={{ readOnly: true }}
                                                              />
                                                            </div>
                                                            <div className="col-12 col-md-4">
                                                              {batchDetail?.shipfile ? (
                                                                <Button
                                                                  variant="outlined"
                                                                  size="small"
                                                                  startIcon={<HiOutlineLink />}
                                                                  onClick={() => {
                                                                    if (batchDetail?.shipfilePath) {
                                                                      downloadFilesOnAzure(batchDetail.shipfilePath, getFileName(batchDetail.shipfile), atoken);
                                                                    }
                                                                  }}
                                                                  className="f14"
                                                                >
                                                                  Service Attachment
                                                                </Button>
                                                              ) : (
                                                                <span className="text-muted f14">No attachment</span>
                                                              )}
                                                            </div>
                                                          </React.Fragment>
                                                        );
                                                      })}
                                                    </div>
                                                  ) : (
                                                    item.batches.map((batch, i) => (
                                                      <div
                                                        className="row d-flex align-items-center w-100 mb-3"
                                                        key={batch.id}
                                                      >
                                                        <div className="col-12 col-md-2 col-lg-3">
                                                          <TextField
                                                            id={batch.batchId}
                                                            InputLabelProps={{ shrink: true }}
                                                            name="shipQty"
                                                            className="w-100 f14"
                                                            size="small"
                                                            label="Ship Qty *"
                                                            variant="outlined"
                                                            value={batch.shipQty}
                                                            InputProps={{ readOnly: true }}
                                                          />
                                                        </div>
                                                        <div className="col-12 col-md-2 col-lg-3">
                                                          <TextField
                                                            id={batch.batchId}
                                                            InputLabelProps={{ shrink: true }}
                                                            name="packingSlipId"
                                                            className="w-100 f14"
                                                            size="small"
                                                            label="Supplier Batch Id"
                                                            variant="outlined"
                                                            value={batch.batchId}
                                                            InputProps={{ readOnly: true }}
                                                          />
                                                        </div>
                                                        <div className="col-12 col-md-2 col-lg-2"></div>
                                                      </div>
                                                    ))
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </>
                                  ) : null}

                                </>
                              ) : (
                                <>
                                  <div key={1}>
                                    <div className="row border-bottom f12 mb-2 pt-0 pb-3">
                                      <div className="col-12">
                                        <div className="row">
                                          <div className="col-12 col-md-2">
                                            <div>
                                              <span className="text-muted">
                                                Item No:
                                              </span>
                                              <br />
                                              {poOrderItems?.itemNo}
                                            </div>
                                          </div>
                                          <div className="col-12 col-md-4">
                                            <div>
                                              <span className="text-muted">
                                                Description:
                                              </span>
                                              <br />
                                              {poOrderItems?.itemDesc}
                                            </div>
                                          </div>

                                          <div className="col-12 col-md-2">
                                            <div>
                                              <span className="text-muted"></span>
                                            </div>
                                          </div>

                                          <div className="col-12 col-md-2">

                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-12 mt-1">
                                        <div className="row">
                                          <div className="col-12 col-md-2">
                                            <div>
                                              <span className="text-muted">
                                                Qty:
                                              </span>
                                              <br />
                                              <span className="fw600">
                                                {poOrderItems?.quantity}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="col-12 col-md-2">
                                            <div>
                                              <span className="text-muted">
                                                Unit:
                                              </span>
                                              <br />
                                              {poOrderItems?.uom}
                                            </div>
                                          </div>
                                          <div className="col-12 col-md-2">
                                            <div>
                                              <span className="text-muted">
                                                Net Price :
                                              </span>
                                              <br />
                                              {poOrderItems?.materialPOUnitPrice}
                                            </div>
                                          </div>

                                        </div>
                                      </div>
                                      <div className="col-12 mt-1 bggray pt-2 pb-2">
                                        <div className="row">
                                          <div className="col-12 mt-4">
                                            {poOrderItems.shipmentDetails?.map(
                                              (shipItem, i) => {
                                                return (
                                                  <div
                                                    className="row  d-flex align-items-center w-100 mb-3"
                                                    key={i}
                                                  >
                                                    <div className="col-12 col-md-2 col-lg-3">
                                                      <TextField
                                                        id={shipItem.batchId}
                                                        InputLabelProps={{
                                                          shrink: true,
                                                        }}
                                                        name="shipQty"
                                                        className="w-100 f14"
                                                        size="small"
                                                        label="Ship Qty *"
                                                        variant="outlined"
                                                        value={shipItem.shipQty}
                                                      />
                                                    </div>
                                                    <div className="col-12 col-md-2 col-lg-3">
                                                      <TextField
                                                        id={shipItem.batchId}
                                                        InputLabelProps={{
                                                          shrink: true,
                                                        }}
                                                        name="packingSlipId"
                                                        className="w-100 f14"
                                                        size="small"
                                                        label="Supplier Batch Id"
                                                        variant="outlined"
                                                        value={shipItem.batchId}
                                                      />
                                                    </div>

                                                    <div className="col-12 col-md-2 col-lg-2">
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </form>
                      </>
                    ) : (
                      <></>
                    )}

                    {tabShipsNotice == 2 ? (
                      <>
                        <form
                          onSubmit={formik_POShipInvoiceHeader.handleSubmit}
                          autoComplete="off"
                        >
                          <div className="row ">
                            <div className="col-12 col-md-12 col-lg-12">
                              <div className="mb-4 textblue f14">
                                Invoice Details
                              </div>
                              <div className="row">
                                <div className="col-12 col-md-12 col-lg-12">
                                  <div className="row">
                                    <div className="col-12 col-md-12 col-lg-4 mb-4">
                                      <TextField
                                        id="poId"
                                        InputLabelProps={{ shrink: true }}
                                        name="poId"
                                        className="w-100 f14"
                                        size="small"
                                        label="Purchase Order *"
                                        variant="outlined"
                                        value={poSpecificDetails?.poNumber}
                                      />
                                    </div>
                                    <div className="col-12 col-md-12 col-lg-4 mb-4">
                                      <TextField
                                        id="invoiceNo"
                                        InputLabelProps={{ shrink: true }}
                                        name="invoiceNo"
                                        className="w-100 f14"
                                        size="small"
                                        label="Invoice No *"
                                        variant="outlined"
                                        value={shipConfirmDetails?.invoiceNo}
                                      />
                                    </div>
                                    <div className="col-12 col-md-12 col-lg-4 mb-4">
                                      <TextField
                                        id="invoiceAmount"
                                        InputLabelProps={{ shrink: true }}
                                        name="invoiceAmount"
                                        className="w-100 f14"
                                        size="small"
                                        label="Invoice Amount *"
                                        variant="outlined"
                                        value={shipConfirmDetails?.invoiceAmount}
                                        readOnly={true}
                                      />
                                    </div>
                                    <div className="col-12 col-md-12 col-lg-6 mb-4">
                                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DateField
                                          label="Invoice Date"
                                          variant="outlined"
                                          size="small"
                                          className="w-100 f14"
                                          InputLabelProps={{ shrink: true }}
                                          value={
                                            shipConfirmDetails &&
                                              shipConfirmDetails?.invoiceDate
                                              ? new Date(shipConfirmDetails?.invoiceDate)
                                              : null
                                          }
                                          format="dd/MM/yyyy"
                                        />
                                      </LocalizationProvider>
                                    </div>
                                    <div className="col-12 col-md-12 col-lg-6 ">
                                      <TextField
                                        id="supplierTaxId"
                                        InputLabelProps={{ shrink: true }}
                                        name="supplierTaxId"
                                        className="w-100 f14"
                                        size="small"
                                        label="Supplier Tax ID"
                                        variant="outlined"
                                        value={poSpecificDetails?.payTerms}
                                      />
                                    </div>
                                    <div className="col-12 col-md-12 col-lg-12 mb-4">
                                      <TextField
                                        id="ServiceDesc"
                                        InputLabelProps={{ shrink: true }}
                                        name="ServiceDesc"
                                        className="w-100 f14"
                                        size="small"
                                        label="Service Description"
                                        variant="outlined"
                                        value={shipConfirmDetails?.serviceLevel}
                                        multiline
                                        rows={3}
                                      />
                                    </div>

                                    <div className="col-12 col-md-12 col-lg-12 mb-2 f12">
                                      <br />
                                      <Button
                                        variant="text"
                                        size="small"
                                        className="text-capitalize font-normal"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          downloadFilesOnAzure(
                                            shipConfirmDetails?.invoicePath,
                                            getFileName(shipConfirmDetails?.invoiceFile),
                                            atoken
                                          );
                                        }}
                                      >
                                        {getFileName(shipConfirmDetails?.invoiceFile)}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {shipConfirmDetails?.grnNumber != "" &&
                              shipConfirmDetails?.grnNumber != null ? (
                              <div className="col-12 col-md-8 col-lg-4">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                  <div className="mb-4 textblue f14">GRN Details</div>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleGrnMenuOpen(e, shipConfirmDetails)}
                                    sx={{ color: '#1976d2', mt: '-16px' }}
                                  >
                                    {/* MoreVertIcon */}
                                  </IconButton>
                                  <Menu
                                    anchorEl={grnMenuAnchor}
                                    open={Boolean(grnMenuAnchor)}
                                    onClose={handleGrnMenuClose}
                                  >
                                    <MenuItem onClick={handleViewGrnReport} disabled={loadingGrnReport}>
                                      View GRN Report
                                    </MenuItem>
                                    <MenuItem onClick={handleDownloadGrnReport} disabled={loadingGrnReport}>
                                      Download GRN Report
                                    </MenuItem>
                                  </Menu>
                                </Box>
                                <div className="row f12">
                                  <div className="col-12 col-md-12 col-lg-12 mb-2">
                                    <div>
                                      <span className="fw600">GRN:</span>
                                    </div>
                                    <div>{shipConfirmDetails?.grnNumber}</div>
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-2">
                                    <div>
                                      <span className="fw600">GRN Date:</span>
                                    </div>
                                    <div>
                                      {formatDateViaTimeZone(
                                        shipConfirmDetails?.grnDate,
                                        "en-GB",
                                        formatoption
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-2">
                                    <div>
                                      <span className="fw600">GRN Quantity:</span>
                                    </div>
                                    <div>{shipConfirmDetails?.grnQuantity}</div>
                                  </div>
                                  <div className="col-12 col-md-12 col-lg-12 mb-2">
                                    <div>
                                      <span className="fw600">GRN Amount:</span>
                                    </div>
                                    <div>
                                      <span className="text-muted">
                                        <div>{shipConfirmDetails?.grnAmount}</div>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            <div className="col-12 col-md-8 col-lg-4">
                              <div className="row">
                                <div className="col-12 col-md-12 col-lg-12 mb-2 f12 border-bottom">
                                  <br />
                                  <span class="fw600">Terms & Condition :</span>
                                  <span>{poSpecificDetails?.termsOfPayment}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      </>
                    ) : (
                      <></>
                    )}

                    {tabShipsNotice == 3 ? (
                      <>
                        <div className="">
                          <div className="row bggray p-1 pt-1 mb-1">
                            <div className="col-12 col-md-3">File Type</div>
                            <div className="col-12 col-md-3">Description</div>
                            <div className="col-12 col-md-3">File Name</div>
                          </div>
                          {selectAttachedFile?.map((SingleRowComponent, index) => (
                            <>
                              {SingleRowComponent.poAttachment != "" ? (
                                <div
                                  className="row  p-1 pt-1 mb-1 border-bottom"
                                  key={index}
                                >
                                  <div className="col-12 col-md-3">
                                    {SingleRowComponent?.fileType}
                                  </div>
                                  <div className="col-12 col-md-3">
                                    {SingleRowComponent?.poAttachmentDescription}
                                  </div>
                                  <div className="col-12 col-md-3">
                                    <Button
                                      variant="text"
                                      size="small"
                                      className="text-capitalize font-normal"
                                      as={Link}
                                      onClick={() =>
                                        downloadFilesOnAzure(
                                          SingleRowComponent?.filePath +
                                          "/" +
                                          SingleRowComponent?.poAttachment,
                                          SingleRowComponent?.poAttachment,
                                          atoken
                                        )
                                      }
                                    >
                                      {SingleRowComponent?.poAttachment}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                            </>
                          ))}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </Box>
                </div>
                {["Under Approval", "Pending for Payment", "Paid"].includes(currentInvStage) && (shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) && (
                  <div className="col-4" style={{ overflowX: 'hidden', borderLeft: '2px solid #e0e0e0' }}>
                    {!activityId ? (
                      <div className="p-0">
                        <div className="d-flex flex-column min-vh-100">
                          <div className="flex-grow-1">
                            <div className="row">
                              <div className="col-12">
                                <div className="section-heading mb-3 pb-2 border-bottom mt-2 ps-2">Approval Workflow</div>
                                <EventApprovalBox
                                  requestCell={requestCellINV}
                                  handleEventAppList={handleEventAppList}
                                  wfupdate={wfupdate}
                                  action={stagearray.includes(currentInvStage)}
                                  stagelist={invStagelist}
                                  Version={1}
                                  permissionManager={invPermissionManager}
                                  eventCode={shipConfirmDetails?.invoiceNo || poSpecificDetails?.poNumber}
                                  eventSubject={poSpecificDetails?.headerText || ''}
                                  startDate={poSpecificDetails?.createdOn}
                                  endDate={poSpecificDetails?.deliveryDate}
                                  currentStage={currentInvStage}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-12 mb-2">
                              <div className="d-flex bg-white rounded p-2 shadow-sm align-items-center ">
                                <div className="me-2 ">
                                  <HiOutlineCollection className="f14" />
                                </div>
                                <div className="flex-grow-1">Invoices</div>
                                <Badge pill bg="warning" text="dark">
                                  {allPOShipHeader?.length ?? 0}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      selectedInvoiceId?.toString() === poId?.toString() && (
                        <form
                          onSubmit={formik_InvoiceAccepted.handleSubmit}
                          autoComplete="off"
                        >
                          <Box sx={{ width: '100%', maxWidth: '100%' }}>
                            <div className="flex flex-col">
                              <Box>
                                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                                  <div className="ms-3 w-100 f14">Approval Action</div>
                                </div>
                              </Box>
                              <div className="h50px"></div>
                              <div className="p-1">
                                <div className="">
                                  <div className="col-12 col-md-12 col-lg-12">
                                    <div className="mb-4 textblue f14"></div>
                                    <div className="row">
                                      <div className="col-12 col-md-4 col-lg-12 mb-4">
                                        <TextField
                                          id="status"
                                          InputLabelProps={{ shrink: true }}
                                          name="status"
                                          select
                                          className="mb-2"
                                          fullWidth
                                          size="small"
                                          label="Invoice Status *"
                                          variant="outlined"
                                          value={formik_InvoiceAccepted.values.status}
                                          onChange={formik_InvoiceAccepted.handleChange}
                                        >
                                          <MenuItem value={true}>Approve</MenuItem>
                                          <MenuItem value={false}>Reject</MenuItem>
                                        </TextField>
                                        {
                                          formik_InvoiceAccepted.errors.status ? (
                                            <div style={{ color: "red" }}>
                                              {formik_InvoiceAccepted.errors.status}
                                            </div>
                                          ) : null}
                                      </div>

                                      <div className="col-12 col-md-4 col-lg-12 mb-4">
                                        <TextField
                                          id="approveComment"
                                          InputLabelProps={{ shrink: true }}
                                          name="approveComment"
                                          className="w-100 f14"
                                          size="small"
                                          label="Comment *"
                                          variant="outlined"
                                          value={formik_InvoiceAccepted?.values?.approveComment}
                                          onChange={formik_InvoiceAccepted.handleChange}
                                        />
                                        {
                                          formik_InvoiceAccepted.errors.approveComment ? (
                                            <div style={{ color: "red" }}>
                                              {formik_InvoiceAccepted.errors.approveComment}
                                            </div>
                                          ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-12 text-end">
                                    <LoadingButton
                                      color="primary"
                                      size="medium"
                                      className="text-white text-capitalize mb-3 mr-3"
                                      variant="contained"
                                      type="submit"
                                      disabled={approveSaveDisable}
                                      loading={loading}
                                    >
                                      <span>Save</span>
                                    </LoadingButton>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Box>
                        </form>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </Box>
        </Drawer>
      </React.Fragment>

      <React.Fragment key="top">
        <Drawer
          anchor="right"
          open={state["openOrderConfirm"]}
        >
          <form
            onSubmit={formik_POConfirmOrder.handleSubmit}
            autoComplete="off"
          >
            <Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1080 } }}>
              <div className="flex flex-col">
                <Box className="bgheaderCards">
                  <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                    <div className="ms-3 text-white">Confirm Entire Order</div>
                    <div>
                      <IconButton
                        onClick={toggleDrawer("openOrderConfirm", false, allPOShipHeader)}
                        size="small"
                        edge="start"
                        sx={{ mr: 1 }}
                      >
                        <HiOutlineX className="f20 text-white" />
                      </IconButton>
                    </div>
                  </div>
                </Box>
                <div className="h50px"></div>
                <div className="p-3">
                  <div className="row ">
                    <div className="col-12 col-md-12 col-lg-12">
                      <div className="mb-4 textblue f14">
                        Order Confirmation Header
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <TextField
                            id="POId"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ readOnly: true, title: "This field is not editable" }}
                            name="POId"
                            className="w-100 f14"
                            size="small"
                            label="Associated Purchase Order*"
                            variant="outlined"
                            value={poSpecificDetails?.id}
                          />
                        </div>

                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <TextField
                            id="Company"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ readOnly: true, title: "This field is not editable" }}
                            name="Company"
                            className="w-100 f14"
                            size="small"
                            label="Customer"
                            variant="outlined"
                            value={poSpecificDetails?.company}
                          />
                        </div>
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <TextField
                            id="ConfirmationNo"
                            InputLabelProps={{ shrink: true }}
                            name="ConfirmationNo"
                            className="w-100 f14"
                            size="small"
                            label="Confirmation *"
                            variant="outlined"
                            value={formik_POConfirmOrder.values?.ConfirmationNo}
                            onChange={formik_POConfirmOrder.handleChange}
                          />
                        </div>
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <TextField
                            id="SupplierRef"
                            InputLabelProps={{ shrink: true }}
                            name="SupplierRef"
                            className="w-100 f14"
                            size="small"
                            label="Supplier Reference"
                            variant="outlined"
                            value={formik_POConfirmOrder.values?.SupplierRef}
                            onChange={formik_POConfirmOrder.handleChange}
                          />
                        </div>
                      </div>
                      <hr className="mt-0" />
                      <div className="mb-4 textblue f14">
                        Shipping and Tax Information
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateField
                              label="Est. Shipping Date *"
                              variant="outlined"
                              size="small"
                              className="w-100 f14"
                              InputLabelProps={{ shrink: true }}
                              value={formik_POConfirmOrder.values?.ConfirmedShipDate}
                              format={getOnlyDateFormatPatternLocale(userDetail)}
                            />
                          </LocalizationProvider>
                          {formik_POConfirmOrder.touched.ConfirmedShipDate &&
                            formik_POConfirmOrder.errors.ConfirmedShipDate ? (
                            <div style={{ color: "red" }}>
                              {formik_POConfirmOrder.errors.ConfirmedShipDate}
                            </div>
                          ) : null}
                        </div>
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateField
                              label="Est. Delivery Date *"
                              variant="outlined"
                              size="small"
                              className="w-100 f14"
                              InputLabelProps={{ shrink: true }}
                              value={formik_POConfirmOrder.values?.confirmedDelDate}
                              format={getOnlyDateFormatPatternLocale(userDetail)}
                            />
                          </LocalizationProvider>
                          {formik_POConfirmOrder.touched.ConfirmedDelDate &&
                            formik_POConfirmOrder.errors.ConfirmedDelDate ? (
                            <div style={{ color: "red" }}>
                              {formik_POConfirmOrder.errors.ConfirmedDelDate}
                            </div>
                          ) : null}
                        </div>
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                          <TextField
                            id="ShippingCost"
                            InputLabelProps={{ shrink: true }}
                            name="ShippingCost"
                            className="w-100 f14"
                            size="small"
                            label="Est. Shipping Cost"
                            variant="outlined"
                            value={formik_POConfirmOrder.values?.ShippingCost}
                            onChange={(e) => {
                              formik_POConfirmOrder?.setFieldValue("ShippingCost", e.target.value);
                            }}
                          />
                          {formik_POConfirmOrder.touched.ShippingCost &&
                            formik_POConfirmOrder.errors.ShippingCost ? (
                            <div style={{ color: "red" }}>
                              {formik_POConfirmOrder.errors.ShippingCost}
                            </div>
                          ) : null}
                        </div>
                        <div className="col-12 col-md-4 col-lg-3 mb-4"></div>
                        <div className="col-12 mb-4">
                          <TextField
                            id="Remarks"
                            InputLabelProps={{ shrink: true }}
                            rows={2}
                            multiline
                            name="Remarks"
                            className="w-100 f14"
                            size="small"
                            label="Comments"
                            variant="outlined"
                            value={formik_POConfirmOrder.values?.Remarks}
                            onChange={(e) => {
                              formik_POConfirmOrder.setFieldValue("Remarks", e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <hr className="mt-0" />
                      <div className="mb-4 textblue f14">Attachments</div>

                      {showAttach && (
                        <div className="row align-items-center p-0 pb-1 border-bottom ms-0 me-0 pt-1 pb-1">
                          <div className="col-12 col-md-10">
                            <div className="row text-left f12 lingh14 text-muted">
                              <div className="col-lg-4 col-md-2 col-12">
                                <div>
                                  <a href={`${returnfileName}`} target="_blank">
                                    {attachmentfilters?.poAttachmentDescription}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex col-12 col-md-2 align-items-center justify-content-end">
                            <IconButton size="small" className="bg-white ms-2">
                              <HiOutlineX className="f17 text-danger" />
                            </IconButton>
                          </div>
                        </div>
                      )}

                      <div className="row bggray p-2 pt-3 mb-3">
                        <div className="col-12 col-md-5">
                          <Form.Group controlId="formFile" className="">
                            <Form.Control
                              name="poAttachment"
                              type="file"
                              size="md"
                              accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              onChange={handleAttachfileChange("POAttachment")}
                              isInvalid={"Unsupported Format"}
                            />
                            <Form.Text id="filiploadtext" muted className="f10">
                              (\.docx|\.doc|\.jpg|\.jpeg|\.png|\.pdf|\.xlsx),
                              Max Size: 10 mb
                            </Form.Text>
                          </Form.Group>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </form>
        </Drawer>
      </React.Fragment>

      <React.Fragment key="top3">
        <Drawer
          anchor="right"
          open={state["openOrderReject"]}
        >
          <form onSubmit={formik_PORejectOrder.handleSubmit} autoComplete="off">
            <Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1080 } }}>
              <div className="flex flex-col">
                <Box className="bgheaderCards">
                  <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                    <div className="ms-3 text-white">Reject Entire Order</div>
                    <div>
                      <IconButton
                        onClick={toggleDrawer("openOrderReject", false, allPOShipHeader)}
                        size="small"
                        edge="start"
                        sx={{ mr: 1 }}
                      >
                        <HiOutlineX className="f20 text-white" />
                      </IconButton>
                    </div>
                  </div>
                </Box>
                <div className="h50px"></div>
                <div className="p-3">
                  <div className="row ">
                    <div className="col-12 col-md-12 col-lg-12">
                      <div className="mb-4 textblue f14">
                        Order Rejection Header
                      </div>
                      <div className="row">
                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="rejectionReason"
                            InputLabelProps={{ shrink: true }}
                            multiline
                            rows={3}
                            name="rejectionReason"
                            className="w-100 f14"
                            size="small"
                            label="Reason"
                            variant="outlined"
                            value={formik_PORejectOrder.values?.rejectionReason}
                            onChange={(e) => {
                              formik_PORejectOrder?.setFieldValue("rejectionReason", e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <hr className="mt-0" />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 text-end">
                      <LoadingButton
                        color="primary"
                        size="medium"
                        className="text-white text-capitalize mb-3 mr-3"
                        variant="contained"
                        type="submit"
                      >
                        <span>Save</span>
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </form>
        </Drawer>
      </React.Fragment>

      <React.Fragment key="top4">
        <Drawer
          anchor="right"
          open={state["openOrderGRNSubmit"]}
        >
          <form onSubmit={formik_GRNAccepted.handleSubmit} autoComplete="off">
            <Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
              <div className="flex flex-col">
                <Box className="bgheaderCards">
                  <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                    <div className="ms-3 text-white">GRN Submit</div>
                    <div>
                      <IconButton
                        onClick={toggleDrawer("openOrderGRNSubmit", false, [])}
                        size="small"
                        edge="start"
                        sx={{ mr: 1 }}
                      >
                        <HiOutlineX className="f20 text-white" />
                      </IconButton>
                    </div>
                  </div>
                </Box>
                <div className="h50px"></div>
                <div className="p-3">
                  <div className="row ">
                    <div className="col-12 col-md-12 col-lg-12">
                      <div className="mb-4 textblue f14"></div>
                      <div className="row">
                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="grnNumber"
                            InputLabelProps={{ shrink: true }}
                            name="grnNumber"
                            className="w-100 f14"
                            size="small"
                            label="GRN No *"
                            variant="outlined"
                            value={formik_GRNAccepted?.values?.grnNumber}
                            onChange={formik_GRNAccepted.handleChange}
                            inputProps={{ maxLength: 25 }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="body2" color="textSecondary">
                                    {formik_GRNAccepted?.values?.grnNumber?.length}/25
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {formik_GRNAccepted.touched.grnNumber &&
                            formik_GRNAccepted.errors.grnNumber ? (
                            <div style={{ color: "red" }}>
                              {formik_GRNAccepted.errors.grnNumber}
                            </div>
                          ) : null}
                        </div>

                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="grnAmount"
                            InputLabelProps={{ shrink: true }}
                            name="grnAmount"
                            className="w-100 f14"
                            size="small"
                            label="GRN Amount *"
                            variant="outlined"
                            value={formik_GRNAccepted?.values?.grnAmount}
                            onChange={formik_GRNAccepted.handleChange}
                            inputProps={{ maxLength: 25 }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="body2" color="textSecondary">
                                    {formik_GRNAccepted?.values?.grnAmount?.length}/25
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                            onInput={(e) => onlyNumberdec(e)}
                          />
                          {formik_GRNAccepted.touched.grnAmount &&
                            formik_GRNAccepted.errors.grnAmount ? (
                            <div style={{ color: "red" }}>
                              {formik_GRNAccepted.errors.grnAmount}
                            </div>
                          ) : null}
                        </div>
                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="grnQuantity"
                            InputLabelProps={{ shrink: true }}
                            name="grnQuantity"
                            className="w-100 f14"
                            size="small"
                            label="GRN Quantity *"
                            variant="outlined"
                            value={formik_GRNAccepted?.values?.grnQuantity}
                            onChange={formik_GRNAccepted.handleChange}
                            onInput={(e) => onlyNumbers(e)}
                            inputProps={{ maxLength: 15 }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="body2" color="textSecondary">
                                    {formik_GRNAccepted?.values?.grnQuantity?.length}/15
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {formik_GRNAccepted.touched.grnQuantity &&
                            formik_GRNAccepted.errors.grnQuantity ? (
                            <div style={{ color: "red" }}>
                              {formik_GRNAccepted.errors.grnQuantity}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="col-12 col-md-4 col-lg-12 mb-4">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <MobileDatePicker
                            label="GRN Date"
                            disablePast
                            minDate={new Date()}
                            value={formik_GRNAccepted.values?.grnDate}
                            name="grnDate"
                            slotProps={{
                              textField: {
                                variant: "outlined",
                                fullWidth: true,
                                size: "small",
                                InputLabelProps: { shrink: true },
                              },
                              actionBar: {
                                actions: ["clear", "cancel", "accept"],
                              },
                            }}
                            onChange={(newValue) => {
                              formik_GRNAccepted.setFieldValue("grnDate", newValue);
                            }}
                            format="dd/MM/yyyy"
                            renderInput={(params) => (
                              <TextField variant="standard" {...params} />
                            )}
                          />
                        </LocalizationProvider>

                        {formik_GRNAccepted.touched.grnDate &&
                          formik_GRNAccepted.errors.grnDate ? (
                          <div style={{ color: "red" }}>
                            {formik_GRNAccepted.errors.grnDate}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 text-end">
                      <LoadingButton
                        color="primary"
                        size="medium"
                        className="text-white text-capitalize mb-3 mr-3"
                        variant="contained"
                        type="submit"
                        disabled={grnSaveDisable || isShippedHistoryEditDisabled}
                      >
                        <span>Save</span>
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </form>
        </Drawer>
      </React.Fragment>

      <React.Fragment key="approvePR">
        <Drawer anchor="right" open={state["openInvoiceApproved"]}>
          <form onSubmit={formik_POApproveReject.handleSubmit} autoComplete="off">
            <Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
              <div className="flex flex-col">
                <Box className="bgheaderCards">
                  <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                    <div className="ms-3 text-white">
                      Approval Action
                    </div>
                    <div>
                      <IconButton
                        onClick={toggleDrawer("openInvoiceApproved", false, [])}
                        size="small"
                        edge="start"
                        sx={{ mr: 1 }}
                      >
                        <HiOutlineX className="f20 text-white" />
                      </IconButton>
                    </div>
                  </div>
                </Box>
                <div className="h50px"></div>
                <div className="p-3">
                  <div className="row ">
                    <div className="col-12 col-md-12 col-lg-12">
                      <div className="mb-4 textblue f14"></div>
                      <div className="row">
                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="IsApproved"
                            InputLabelProps={{ shrink: true }}
                            name="IsApproved"
                            select
                            className="mb-2"
                            fullWidth
                            size="small"
                            label="Status"
                            variant="outlined"
                            value={formik_POApproveReject.values.IsApproved}
                            onChange={(e) =>
                              formik_POApproveReject.setFieldValue("IsApproved", e.target.value)
                            }
                          >
                            <MenuItem value={true}>Approve</MenuItem>
                            <MenuItem value={false}>Reject</MenuItem>
                          </TextField>
                        </div>

                        <div className="col-12 col-md-4 col-lg-12 mb-4">
                          <TextField
                            id="remarks"
                            InputLabelProps={{ shrink: true }}
                            multiline
                            rows={3}
                            name="remarks"
                            className="w-100 f14"
                            size="small"
                            label="Comment "
                            variant="outlined"
                            inputProps={{ maxLength: 200 }}
                            value={formik_POApproveReject?.values?.remarks}
                            error={formik_POApproveReject.touched.remarks && Boolean(formik_POApproveReject.errors.remarks)}
                            helperText={formik_POApproveReject.touched.remarks && formik_POApproveReject.errors.remarks}
                            onChange={(e) =>
                              formik_POApproveReject.setFieldValue("remarks", e.target.value)
                            }
                            InputProps={{
                              endAdornment: formik_POApproveReject?.values?.remarks && (
                                <InputAdornment position="end">
                                  <Typography variant="body2" color="textSecondary">
                                    {formik_POApproveReject?.values?.remarks?.length}/200
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 text-end">
                      <LoadingButton
                        loading={loading}
                        color="primary"
                        size="medium"
                        className="text-white text-capitalize mb-3 mr-3"
                        variant="contained"
                        type="submit"
                      >
                        <span>Save</span>
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </form>
        </Drawer>
      </React.Fragment>

      {/* Payment Details Modal */}
      <PEModal
        open={state.openPaymentDetails}
        onClose={() => { setState(prevState => ({ ...prevState, openPaymentDetails: false })); setPaymentDetails(null); }}
        title="Payment Details"
        size="lg"
        footer={
          <button
            type="button"
            className="pe-btn pe-btn--outline"
            onClick={() => { setState(prevState => ({ ...prevState, openPaymentDetails: false })); setPaymentDetails(null); }}
          >
            Close
          </button>
        }
      >
        {loadingPayment ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            <div className="spinner-border text-primary" role="status" />
            <div style={{ marginTop: 8, fontSize: 13 }}>Loading payment details...</div>
          </div>
        ) : paymentDetails ? (
          <div className="pe-info-card" style={{ height: 'auto', marginBottom: 0 }}>
            <div className="pe-info-card-title" style={{ marginBottom: 16 }}>
              <MdReceipt style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Payment Information
            </div>
            {paymentDetails.__source === 'paymentheader' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                <div>
                  <label className="pe-field-label">SAP Doc Number</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.invoiceNo || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Payment Method</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.paymentMethod || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">UTR Number</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.utrNumber || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Bank Reference</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.bankReference || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Payment Category</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.paymentCategory || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Amount</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.paymentAmount ?? ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Status</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.paymentStatus || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Payment Date</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.paymentDate ? formatDateViaTimeZone(paymentDetails.paymentDate, 'en-GB', formatoption) : ''}</div>
                </div>
                {paymentDetails.sapPaymentDoc && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="pe-field-label">SAP Payment Doc</label>
                    <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.sapPaymentDoc}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
                <div>
                  <label className="pe-field-label">Bank Name</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.bankName || paymentDetails.BankName || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Transaction ID</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.transactionID || paymentDetails.TransactionID || paymentDetails.transactionId || paymentDetails.TransactionId || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Amount</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{paymentDetails.amount || paymentDetails.Amount || ''}</div>
                </div>
                <div>
                  <label className="pe-field-label">Payment Date</label>
                  <div className="pe-detail-form-input" style={{ background: '#f8fafc', cursor: 'default' }}>{(paymentDetails.paymentDate || paymentDetails.PaymentDate) ? formatDateViaTimeZone(paymentDetails.paymentDate || paymentDetails.PaymentDate, 'en-GB', formatoption) : ''}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280', fontSize: 13 }}>
            No payment details available
          </div>
        )}
      </PEModal>

      {/* Add Payment Drawer */}
      <AddPaymentDrawer
        open={openAddPaymentDrawer}
        onClose={() => { setOpenAddPaymentDrawer(false); resetPaymentForm(); }}
        paymentTargetItem={paymentTargetItem}
        paymentForm={paymentForm}
        handlePaymentFormChange={handlePaymentFormChange}
        savingPayment={savingPayment}
        handleSubmitPayment={handleSubmitPayment}
        poInvoiceList={poInvoiceList}
        allPOShipHeader={allPOShipHeader}
      />

      {/* Payment Terms - Add New Modal */}
      <Modal
        size="xl"
        show={paymentTermModal}
        backdrop="static"
        keyboard={false}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={() => setPaymentTermModal(false)}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">
              Manage Payment Terms
            </div>
          </Modal.Title>
          <IconButton
            onClick={() => setPaymentTermModal(false)}
            size="small"
            edge="start"
          >
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <AddUpdatePaymentterms
              handlePaymentTermsList={(list) => {
                setPaymentTermsOptions(list);
              }}
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* GRN Report Dialog */}
      <Dialog
        open={grnReportModal}
        onClose={() => setGrnReportModal(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ padding: 0 }}>
          <IconButton
            aria-label="close"
            onClick={() => setGrnReportModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
              zIndex: 1,
            }}
          >
            <HiOutlineX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ padding: 0 }}>
          {loadingGrnReport ? (
            <div className="text-center py-4">
              <CircularProgress />
            </div>
          ) : grnReportData.length > 0 ? (
            <div style={{ padding: '40px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ border: '2px solid #000', padding: '20px' }}>
                <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                  POSCO - India Pune Processing Center Pvt. Ltd.
                </div>
                <div style={{ borderBottom: '2px solid #000', padding: '8px 0', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  Goods Receipt Note
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '12px', padding: '10px 0' }}>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 'bold' }}>Supplier Name : </span><span>{grnReportData[0]?.vendorCompany || ''}</span></div>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 'bold' }}>Supplier Code : </span><span>{grnReportData[0]?.vendorCode || ''}</span></div>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 'bold' }}>GRN Date : </span><span>{grnReportData[0]?.grnDate ? (() => { try { const d = new Date(grnReportData[0].grnDate); return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : ''; } catch (e) { return grnReportData[0].grnDate; } })() : ''}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '12px', padding: '5px 0' }}>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 'bold' }}>Invoice NO : </span><span>{grnReportData[0]?.invoiceNo || ''}</span></div>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 'bold' }}>GRN No : </span><span>{grnReportData[0]?.grnNumber || ''}</span></div>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 'bold' }}>Invoice Date : </span><span>{grnReportData[0]?.invoiceDate ? (() => { try { const d = new Date(grnReportData[0].invoiceDate); return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : ''; } catch (e) { return grnReportData[0].invoiceDate; } })() : ''}</span></div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', border: '1px solid #000' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Sr</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>PO NO LN</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>PO NUMBER</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>ITEM CODE</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>GRN NO</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>BATCH NUMBER</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>ITEM DESCRIPTION</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>UOM</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>REC QTY</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>APP QTY</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>REJ QTY</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>WHLO C</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>COST CENTER</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>GL ACCOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grnReportData.map((item, index) => (
                        <tr key={index}>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.sr || index + 1}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.poLn || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.poNo || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.itemCode || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.grnNumber || grnReportData[0]?.grnNumber || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.batchNumber || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.itemDescription || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.uom || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.recQty ?? '0.00'}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.appQty ?? '0.00'}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.rejQty ?? '0.00'}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.whLoc || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.costCenter || ''}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.glAccount || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: '11px', marginBottom: '30px' }}>
                  <div style={{ marginBottom: '8px' }}><span style={{ fontWeight: 'bold' }}>INSPECTION REMARKS:</span></div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>INSPECTION NUMBER:</span>
                    <span style={{ marginLeft: '150px' }}>{grnReportData[0]?.inspectionNumber || ''}</span>
                    <span style={{ marginLeft: '10px' }}>{grnReportData[0]?.inspectionDate || ''}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '10px' }}>
                  <div></div>
                  <div style={{ textAlign: 'right' }}>
                    <div><span style={{ fontWeight: 'bold' }}>DATE:</span> {grnReportData[0]?.date ? (() => { try { const d = new Date(grnReportData[0].date); return !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB') : ''; } catch (e) { return grnReportData[0].date; } })() : ''}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Prepared By :</span> {grnReportData[0]?.createdByName || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '40px', paddingTop: '20px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ marginBottom: '40px' }}></div>
                    <div style={{ paddingTop: '5px' }}>
                      <div style={{ fontWeight: 'bold' }}>Approved By</div>
                      <div>(Store/QC)</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ marginBottom: '40px' }}></div>
                    <div style={{ paddingTop: '5px' }}>
                      <div style={{ fontWeight: 'bold' }}>Approved By</div>
                      <div>(TL)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>No GRN report data available</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              const printContent = document.querySelector('[style*="padding: 40px"]');
              if (printContent) {
                const printWindow = window.open('', '', 'height=800,width=1200');
                printWindow.document.write('<html><head><title>GRN Report</title>');
                printWindow.document.write('<style>@media print { @page { margin: 0.5in; } body { margin: 0; } }</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
              }
            }}
            variant="outlined"
          >
            Print
          </Button>
          <Button onClick={() => setGrnReportModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add GRN Dialog */}
      <AddGRNDialog
        open={addGrnDialogOpen}
        onClose={handleCloseAddGrnDialog}
        poDetails={poSpecificDetails}
        lineItems={selectedGrnItems.length > 0 ? selectedGrnItems : allPOItems}
        onSubmit={handleSubmitGrn}
        existingGrnNumbers={poGrnList}
      />

      {/* Add SES Dialog */}
      <SESDialog
        open={addSesDialogOpen}
        onClose={handleCloseAddSesDialog}
        poDetails={poSpecificDetails}
        lineItems={selectedSesItems.length > 0 ? selectedSesItems : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service')}
        onSubmit={handleSubmitSes}
        mode={sesDialogMode}
        previewData={sesPreviewData}
      />

      {/* Add ASN Dialog */}
      <AddASNDialog
        open={addAsnDialogOpen}
        onClose={handleCloseAddAsnDialog}
        poDetails={poSpecificDetails}
        lineItems={selectedAsnItems.length > 0 ? selectedAsnItems : allPOItems.filter(item => item.itemType?.toLowerCase() !== 'service')}
        asnHeaders={allPOShipHeader}
        onSubmit={handleSubmitAsn}
        mode={asnDialogMode}
        previewData={asnPreviewData}
      />

      {/* Add Invoice Dialog */}
      <AddInvoiceDialog
        open={addInvoiceDialogOpen}
        onClose={handleCloseAddInvoiceDialog}
        poDetails={poSpecificDetails}
        lineItems={selectedInvoiceItems.length > 0 ? selectedInvoiceItems : allPOItems}
        initialSelectedItems={selectedInvoiceItems}
        onSubmit={handleSubmitInvoice}
        uomOptions={UOMMaster}
        mode={invoiceDialogMode}
        previewData={invoicePreviewData}
        stagesPayload={buildInvoiceStagesPayload()}
        atoken={atoken}
        customerid={poCustomerId ?? customerid}
        userName={userDetail?.name ?? ''}
        approvalPanel={invoiceApprovalPanel}
        headerActions={invoiceApprovalHeaderActions}
        stagelist={invStagelist}
        currentStage={invoicePreviewData?.header?.stage ?? currentInvStage}
      />

      <Dialog
        open={deliveryDialogOpen}
        onClose={() => {
          setDeliveryDialogOpen(false);
          setDeliveryDialogRow(null);
          setDeliveryDialogDate(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Delivery Date</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                label="Delivery Date"
                value={deliveryDialogDate}
                onChange={(newValue) => setDeliveryDialogDate(newValue)}
                slotProps={{
                  textField: {
                    variant: "outlined",
                    fullWidth: true,
                    size: "small",
                    InputLabelProps: { shrink: true },
                  },
                  actionBar: {
                    actions: ["clear", "cancel", "accept"],
                  },
                }}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeliveryDialogOpen(false);
              setDeliveryDialogRow(null);
              setDeliveryDialogDate(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!deliveryDialogRow || !deliveryDialogDate}
            onClick={() => {
              if (deliveryDialogRow) {
                setDeliveryUpdates((prev) => ({
                  ...prev,
                  [deliveryDialogRow.id]: deliveryDialogDate,
                }));
              }
              setDeliveryDialogOpen(false);
              setDeliveryDialogRow(null);
              setDeliveryDialogDate(null);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PODrawers;
