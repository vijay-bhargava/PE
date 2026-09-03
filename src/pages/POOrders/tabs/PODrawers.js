import React from "react";
import {
  Badge, Box, Button, IconButton, InputAdornment,
  Menu, MenuItem, TextField, Typography,
} from "@mui/material";
import { Form } from "react-bootstrap";
import { LocalizationProvider, DateField } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { HiOutlineX, HiOutlineCollection, HiOutlineLink } from "react-icons/hi";
import { MdReceipt } from "react-icons/md";
import { Link } from "react-router-dom";
import { downloadFilesOnAzure, getFileName, onlyNumbers, onlyNumberdec } from "../../../utils/common";
import { formatDateViaTimeZone, getOnlyDateFormatPatternLocale } from "../../../utils/common/utility";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import HistoryCell from "../../BaseCells/HistoryCell";
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
}) => {
  return (
    <>
      <PEModal
        open={!!state["openCreateSheet"]}
        onClose={(event) => {
          toggleDrawer("openCreateSheet", false, allPOShipHeader)(event);
          if (addFlowMode === 'ASN' || addFlowMode === 'INVOICE') {
            setAddFlowStep('select');
            setValue(1);
          }
        }}
        title={shipConfirmDetails?.shipmentDetails?.some(item => isServiceItem(item)) ? "Create Service Sheet" : "Shipment/Invoice"}
        size="lg"
        bodyStyle={{ padding: 0, overflow: 'hidden' }}
      >
        <div className="row g-0" style={{ overflow: 'hidden' }}>
          <div className={["Under Approval", "Pending for Payment", "Paid"].includes(currentInvStage) && (shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) ? "col-8" : "col-12"}>
            <Box sx={{ flexGrow: 1 }}>
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
                  <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2 flex-shrink-0 rfq-dv2-workflow-head">
                    <div className="rfq-dv2-workflow-tabs">
                      <button type="button" className={`rfq-dv2-workflow-tab ${tabShipsNotice === 0 ? 'active' : ''}`} onClick={() => handleTabShipsNotice(null, 0)}>
                        {shipConfirmDetails?.shipmentDetails?.some(item => isServiceItem(item)) ? "Service Sheet Header" : "Ship Notice Header"}
                      </button>
                      <button type="button" className={`rfq-dv2-workflow-tab ${tabShipsNotice === 1 ? 'active' : ''}`} onClick={() => handleTabShipsNotice(null, 1)}>
                        Order Items
                      </button>
                      <button type="button" className={`rfq-dv2-workflow-tab ${tabShipsNotice === 2 ? 'active' : ''}`} onClick={() => handleTabShipsNotice(null, 2)}>
                        Invoice Details
                      </button>
                    </div>
                    {tabShipsNotice === 2 && shipConfirmDetails?.invoiceId && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <HistoryCell eventtype="INV" eventId={shipConfirmDetails.invoiceId} permissionManager={invPermissionManager} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {tabShipsNotice === 0 ? (
                <div className="pt-3">
                  {isServiceItem(shipConfirmDetails?.shipmentDetails?.[0]) ? (
                    <div className="row">
                      <div className="col-12 col-md-6 mb-4">
                        <label className="pe-field-label">Service Sheet No  <span className="rfq-required-star">*</span></label>
                        <TextField
                          id="serviceSheetNo"
                          name="serviceSheetNo"
                          fullWidth
                          size="small"
                          variant="outlined"
                          value={shipConfirmDetails?.shipSlipId}
                        />
                      </div>
                      <div className="col-12 col-md-6 mb-4">
                        <label className="pe-field-label">Service Sheet Date  <span className="rfq-required-star">*</span></label>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
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
                    <div className="row">
                      <div className="col-12 col-md-8">
                        <div className="section-heading mb-3">Shipping</div>
                        <div className="row">
                          <div className="col-12 col-md-6 mb-4">
                            <label className="pe-field-label">Packing Slip ID  <span className="rfq-required-star">*</span></label>
                            <TextField
                              id="packingSlipId"
                              name="packingSlipId"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.shipSlipId}
                            />
                          </div>
                          <div className="col-12 col-md-6 mb-4">
                            <label className="pe-field-label">Ship Notice Type</label>
                            <TextField
                              id="status"
                              name="status"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.shipNoticeType}
                            />
                          </div>
                          <div className="col-12 col-md-6 mb-4">
                            <label className="pe-field-label">Shipping Date  <span className="rfq-required-star">*</span></label>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <MobileDatePicker
                                value={shipConfirmDetails?.shippingDate ? new Date(shipConfirmDetails.shippingDate) : null}
                                format="dd/MM/yyyy"
                                slotProps={{
                                  textField: { variant: "outlined", fullWidth: true, size: "small" },
                                  actionBar: { actions: ["clear", "cancel", "accept"] },
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                          <div className="col-12 col-md-6 mb-4">
                            <label className="pe-field-label">Delivery Date  <span className="rfq-required-star">*</span></label>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <MobileDatePicker
                                value={shipConfirmDetails?.deliveryDate ? new Date(shipConfirmDetails.deliveryDate) : null}
                                format="dd/MM/yyyy"
                                slotProps={{
                                  textField: { variant: "outlined", fullWidth: true, size: "small" },
                                  actionBar: { actions: ["clear", "cancel", "accept"] },
                                }}
                              />
                            </LocalizationProvider>
                          </div>
                          <div className="col-12 col-md-6 mb-4">
                            <label className="pe-field-label">Eway Bill No.  <span className="rfq-required-star">*</span></label>
                            <TextField
                              id="ewayBillNumber"
                              name="ewayBillNumber"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.ewayBillNumber}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4">
                        <div className="section-heading mb-3">Tracking</div>
                        <div className="row">
                          <div className="col-12 mb-4">
                            <label className="pe-field-label">Carrier Name</label>
                            <TextField
                              id="carrierName"
                              name="carrierName"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.carrierName}
                            />
                          </div>
                          <div className="col-12 mb-4">
                            <label className="pe-field-label">Service Level</label>
                            <TextField
                              id="serviceLevel"
                              name="serviceLevel"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.serviceLevel}
                            />
                          </div>
                          <div className="col-12 mb-4">
                            <label className="pe-field-label">AWB/LR/Shipping Bill Number  <span className="rfq-required-star">*</span></label>
                            <TextField
                              id="lrShipBillNumber"
                              name="lrShipBillNumber"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.lrShipBillNumber}
                            />
                          </div>
                          <div className="col-12 mb-4">
                            <label className="pe-field-label">Shipping Method</label>
                            <TextField
                              id="shipMethod"
                              name="shipMethod"
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={shipConfirmDetails?.shipMethod}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {tabShipsNotice === 1 ? (
                <form onSubmit={formik_POShipOrdrItem.handleSubmit} autoComplete="off" className="pt-2">
                  <div className="section-heading mb-3">Order Items</div>
                  {shipConfirmDetails?.shipmentDetails?.length > 0 ? (
                    Object.values(
                      shipConfirmDetails.shipmentDetails.reduce((acc, detail) => {
                        if (!acc[detail?.itemNo]) {
                          acc[detail?.itemNo] = { ...detail, batches: [] };
                        }
                        acc[detail?.itemNo].batches.push({ id: detail.id, batchId: detail.batchId, shipQty: detail.shipQty });
                        return acc;
                      }, {})
                    ).map((item, index) => (
                      <div key={index} className="rfq-v2-card mb-3">
                        {/* Item header row */}
                        <div className="d-flex align-items-center gap-3 px-3 py-2 border-bottom f13" style={{ flexWrap: 'wrap', gap: '16px' }}>
                          <span><span className="pe-field-label mb-0 me-1">Item No:</span><span className="fw500">{item?.itemNo}</span></span>
                          <span className=""><span className="pe-field-label mb-0 me-1">Description:</span>{item?.itemDesc}</span>
                          {isServiceItem(item) ? (
                            <>
                              <span><span className="pe-field-label mb-0 me-1">UOM:</span>{item?.uom}</span>
                              <span><span className="pe-field-label mb-0 me-1">Unit Price:</span>{item?.materialPOUnitPrice}</span>
                              <span><span className="pe-field-label mb-0 me-1">Delivery Date:</span>{item?.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                            </>
                          ) : (
                            <>
                              <span><span className="pe-field-label mb-0 me-1">Qty:</span><span className="fw500">{item?.quantity}</span></span>
                              <span><span className="pe-field-label mb-0 me-1">UOM:</span>{item?.uom}</span>
                              <span><span className="pe-field-label mb-0 me-1">Net Price:</span>{item?.materialPOUnitPrice}</span>
                            </>
                          )}
                        </div>
                        {/* Batch table */}
                        {isServiceItem(item) ? (
                          <div className="p-3">
                            <div className="f13 mb-2"><span className="pe-field-label mb-0 me-1">Total Due Qty:</span><span className="fw500">{item?.quantity}</span></div>
                            <table className="w-100 f13" style={{ borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                  <th className="px-2 py-2 text-muted fw-normal">Service Start Date</th>
                                  <th className="px-2 py-2 text-muted fw-normal">Service End Date</th>
                                  <th className="px-2 py-2 text-muted fw-normal">Attachment</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.batches.map((batch) => {
                                  const batchDetail = shipConfirmDetails?.shipmentDetails?.find(d => d.id === batch.id);
                                  return (
                                    <tr key={batch.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                      <td className="px-2 py-2">{batchDetail?.serviceStartDate ? formatDateViaTimeZone(batchDetail.serviceStartDate, "en-GB", formatoption) : '—'}</td>
                                      <td className="px-2 py-2">{batchDetail?.serviceEndDate ? formatDateViaTimeZone(batchDetail.serviceEndDate, "en-GB", formatoption) : '—'}</td>
                                      <td className="px-2 py-2">
                                        {batchDetail?.shipfile ? (
                                          <button type="button" className="pe-btn pe-btn--outline" style={{ padding: '2px 10px', fontSize: 12 }}
                                            onClick={() => { if (batchDetail?.shipfilePath) downloadFilesOnAzure(batchDetail.shipfilePath, getFileName(batchDetail.shipfile), atoken); }}>
                                            <HiOutlineLink className="me-1" /> View
                                          </button>
                                        ) : <span className="text-muted">—</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-3">
                            <table className="w-100 f13" style={{ borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                  <th className="px-2 py-2 text-muted fw-normal">Ship Qty</th>
                                  <th className="px-2 py-2 text-muted fw-normal">Supplier Batch Id</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.batches.map((batch) => (
                                  <tr key={batch.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td className="px-2 py-2 fw500">{batch.shipQty}</td>
                                    <td className="px-2 py-2">{batch.batchId || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rfq-v2-card mb-3">
                      <div className="d-flex align-items-center gap-3 px-3 py-2 border-bottom f13" style={{ flexWrap: 'wrap', gap: '16px' }}>
                        <span><span className="pe-field-label mb-0 me-1">Item No:</span><span className="fw500">{poOrderItems?.itemNo}</span></span>
                        <span className=""><span className="pe-field-label mb-0 me-1">Description:</span>{poOrderItems?.itemDesc}</span>
                        <span><span className="pe-field-label mb-0 me-1">Qty:</span><span className="fw500">{poOrderItems?.quantity}</span></span>
                        <span><span className="pe-field-label mb-0 me-1">UOM:</span>{poOrderItems?.uom}</span>
                        <span><span className="pe-field-label mb-0 me-1">Net Price:</span>{poOrderItems?.materialPOUnitPrice}</span>
                      </div>
                      <div className="p-3">
                        <table className="w-100 f13" style={{ borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f3f4f6' }}>
                              <th className="px-2 py-2 text-muted fw-normal">Ship Qty</th>
                              <th className="px-2 py-2 text-muted fw-normal">Supplier Batch Id</th>
                            </tr>
                          </thead>
                          <tbody>
                            {poOrderItems.shipmentDetails?.map((shipItem, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td className="px-2 py-2 fw500">{shipItem.shipQty}</td>
                                <td className="px-2 py-2">{shipItem.batchId || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </form>
              ) : null}

              {tabShipsNotice === 2 ? (
                <form onSubmit={formik_POShipInvoiceHeader.handleSubmit} autoComplete="off" className="pt-2">
                  <div className="section-heading mb-3">Invoice Details</div>
                  <div className="row">
                    <div className="col-12">
                      <div className="row">
                        <div className="col-12 col-md-4 mb-4">
                          <label className="pe-field-label">Purchase Order *</label>
                          <TextField id="poId" name="poId" fullWidth size="small" variant="outlined" value={poSpecificDetails?.poNumber} InputProps={{ readOnly: true }} />
                        </div>
                        <div className="col-12 col-md-4 mb-4">
                          <label className="pe-field-label">Invoice No *</label>
                          <TextField id="invoiceNo" name="invoiceNo" fullWidth size="small" variant="outlined" value={shipConfirmDetails?.invoiceNo} />
                        </div>
                        <div className="col-12 col-md-4 mb-4">
                          <label className="pe-field-label">Invoice Amount *</label>
                          <TextField id="invoiceAmount" name="invoiceAmount" fullWidth size="small" variant="outlined" value={shipConfirmDetails?.invoiceAmount} />
                        </div>
                        <div className="col-12 col-md-6 mb-4">
                          <label className="pe-field-label">Invoice Date</label>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <MobileDatePicker
                              value={shipConfirmDetails?.invoiceDate ? new Date(shipConfirmDetails.invoiceDate) : null}
                              format="dd/MM/yyyy"
                              slotProps={{
                                textField: { variant: "outlined", fullWidth: true, size: "small" },
                                actionBar: { actions: ["clear", "cancel", "accept"] },
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                        <div className="col-12 col-md-6 mb-4">
                          <label className="pe-field-label">Supplier Tax ID</label>
                          <TextField id="supplierTaxId" name="supplierTaxId" fullWidth size="small" variant="outlined" value={poSpecificDetails?.payTerms} />
                        </div>
                        <div className="col-12 mb-4">
                          <label className="pe-field-label">Service Description</label>
                          <TextField id="ServiceDesc" name="ServiceDesc" fullWidth size="small" variant="outlined" value={shipConfirmDetails?.serviceLevel} multiline rows={3} />
                        </div>
                        {shipConfirmDetails?.invoiceFile && (
                          <div className="col-12 mb-3">
                            <button
                              type="button"
                              className="pe-btn pe-btn--outline"
                              onClick={(e) => {
                                e.preventDefault();
                                downloadFilesOnAzure(shipConfirmDetails?.invoicePath, getFileName(shipConfirmDetails?.invoiceFile), atoken);
                              }}
                            >
                              <HiOutlineLink className="me-1" /> {getFileName(shipConfirmDetails?.invoiceFile)}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {shipConfirmDetails?.grnNumber != null && shipConfirmDetails?.grnNumber !== "" && (
                      <div className="col-12 col-md-6 mb-4">
                        <div className="rfq-v2-card p-3">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="section-heading mb-0">GRN Details</div>
                            <div>
                              <button type="button" className="pe-icon-btn" onClick={(e) => handleGrnMenuOpen(e, shipConfirmDetails)}>
                                <span style={{ fontSize: 18, lineHeight: 1 }}>⋮</span>
                              </button>
                              <Menu anchorEl={grnMenuAnchor} open={Boolean(grnMenuAnchor)} onClose={handleGrnMenuClose}>
                                <MenuItem onClick={handleViewGrnReport} disabled={loadingGrnReport}>View GRN Report</MenuItem>
                                <MenuItem onClick={handleDownloadGrnReport} disabled={loadingGrnReport}>Download GRN Report</MenuItem>
                              </Menu>
                            </div>
                          </div>
                          <div className="row f13">
                            <div className="col-6 mb-2">
                              <span className="pe-field-label mb-0">GRN</span>
                              <div className="fw500">{shipConfirmDetails?.grnNumber}</div>
                            </div>
                            <div className="col-6 mb-2">
                              <span className="pe-field-label mb-0">GRN Date</span>
                              <div>{formatDateViaTimeZone(shipConfirmDetails?.grnDate, "en-GB", formatoption)}</div>
                            </div>
                            <div className="col-6 mb-2">
                              <span className="pe-field-label mb-0">GRN Quantity</span>
                              <div className="fw500">{shipConfirmDetails?.grnQuantity}</div>
                            </div>
                            <div className="col-6 mb-2">
                              <span className="pe-field-label mb-0">GRN Amount</span>
                              <div>{shipConfirmDetails?.grnAmount}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {poSpecificDetails?.termsOfPayment && (
                      <div className="col-12 mb-3">
                        <div className="rfq-v2-card p-3">
                          <span className="pe-field-label mb-1 d-block">Terms & Conditions</span>
                          <span className="f13">{poSpecificDetails?.termsOfPayment}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              ) : null}

              {tabShipsNotice === 3 ? (
                <>
                  <div className="">
                    <div className="row bggray p-1 pt-1 mb-1">
                      <div className="col-12 col-md-3">File Type</div>
                      <div className="col-12 col-md-3">Description</div>
                      <div className="col-12 col-md-3">File Name</div>
                    </div>
                    {selectAttachedFile?.map((SingleRowComponent, index) => (
                      <>
                        {SingleRowComponent.poAttachment !== "" ? (
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
                                <div className="col-12 mb-4">
                                  <label className="pe-field-label">Invoice Status  <span className="rfq-required-star">*</span></label>
                                  <TextField
                                    id="status"
                                    name="status"
                                    select
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    value={formik_InvoiceAccepted.values.status}
                                    onChange={formik_InvoiceAccepted.handleChange}
                                  >
                                    <MenuItem value={true}>Approve</MenuItem>
                                    <MenuItem value={false}>Reject</MenuItem>
                                  </TextField>
                                  {formik_InvoiceAccepted.errors.status && (
                                    <div style={{ color: "red", fontSize: 12 }}>{formik_InvoiceAccepted.errors.status}</div>
                                  )}
                                </div>

                                <div className="col-12 mb-4">
                                  <label className="pe-field-label">Comment  <span className="rfq-required-star">*</span></label>
                                  <TextField
                                    id="approveComment"
                                    name="approveComment"
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    value={formik_InvoiceAccepted?.values?.approveComment}
                                    onChange={formik_InvoiceAccepted.handleChange}
                                  />
                                  {formik_InvoiceAccepted.errors.approveComment && (
                                    <div style={{ color: "red", fontSize: 12 }}>{formik_InvoiceAccepted.errors.approveComment}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-end mt-2">
                            <button type="submit" className="pe-btn pe-btn--primary" disabled={approveSaveDisable || loading}>
                              {loading ? "Saving…" : "Save"}
                            </button>
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
      </PEModal>

      <PEModal
        open={!!state["openOrderConfirm"]}
        onClose={toggleDrawer("openOrderConfirm", false, allPOShipHeader)}
        title="Confirm Entire Order"
        size="lg"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--outline" onClick={toggleDrawer("openOrderConfirm", false, allPOShipHeader)}>Cancel</button>
            <button type="submit" form="form-order-confirm" className="pe-btn pe-btn--primary">Save</button>
          </>
        }
      >
        <form id="form-order-confirm" onSubmit={formik_POConfirmOrder.handleSubmit} autoComplete="off">
          <div className="mb-3 textblue f14">Order Confirmation Header</div>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Associated Purchase Order  <span className="rfq-required-star">*</span></label>
              <TextField id="POId" name="POId" fullWidth size="small" variant="outlined" inputProps={{ readOnly: true }} value={poSpecificDetails?.id} />
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Customer</label>
              <TextField id="Company" name="Company" fullWidth size="small" variant="outlined" inputProps={{ readOnly: true }} value={poSpecificDetails?.company} />
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Confirmation  <span className="rfq-required-star">*</span></label>
              <TextField id="ConfirmationNo" name="ConfirmationNo" fullWidth size="small" variant="outlined" value={formik_POConfirmOrder.values?.ConfirmationNo} onChange={formik_POConfirmOrder.handleChange} />
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Supplier Reference</label>
              <TextField id="SupplierRef" name="SupplierRef" fullWidth size="small" variant="outlined" value={formik_POConfirmOrder.values?.SupplierRef} onChange={formik_POConfirmOrder.handleChange} />
            </div>
          </div>
          <hr className="mt-0" />
          <div className="mb-3 textblue f14">Shipping and Tax Information</div>
          <div className="row">
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Est. Shipping Date  <span className="rfq-required-star">*</span></label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateField fullWidth variant="outlined" size="small" InputLabelProps={{ shrink: true }} value={formik_POConfirmOrder.values?.ConfirmedShipDate} format={getOnlyDateFormatPatternLocale(userDetail)} />
              </LocalizationProvider>
              {formik_POConfirmOrder.touched.ConfirmedShipDate && formik_POConfirmOrder.errors.ConfirmedShipDate && <div style={{ color: "red", fontSize: 12 }}>{formik_POConfirmOrder.errors.ConfirmedShipDate}</div>}
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Est. Delivery Date  <span className="rfq-required-star">*</span></label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateField fullWidth variant="outlined" size="small" InputLabelProps={{ shrink: true }} value={formik_POConfirmOrder.values?.confirmedDelDate} format={getOnlyDateFormatPatternLocale(userDetail)} />
              </LocalizationProvider>
              {formik_POConfirmOrder.touched.ConfirmedDelDate && formik_POConfirmOrder.errors.ConfirmedDelDate && <div style={{ color: "red", fontSize: 12 }}>{formik_POConfirmOrder.errors.ConfirmedDelDate}</div>}
            </div>
            <div className="col-12 col-md-6 col-lg-3 mb-4">
              <label className="pe-field-label">Est. Shipping Cost</label>
              <TextField id="ShippingCost" name="ShippingCost" fullWidth size="small" variant="outlined" value={formik_POConfirmOrder.values?.ShippingCost} onChange={(e) => formik_POConfirmOrder?.setFieldValue("ShippingCost", e.target.value)} error={formik_POConfirmOrder.touched.ShippingCost && Boolean(formik_POConfirmOrder.errors.ShippingCost)} helperText={formik_POConfirmOrder.touched.ShippingCost && formik_POConfirmOrder.errors.ShippingCost} />
            </div>
            <div className="col-12 mb-4">
              <label className="pe-field-label">Comments</label>
              <TextField id="Remarks" name="Remarks" fullWidth multiline rows={2} size="small" variant="outlined" value={formik_POConfirmOrder.values?.Remarks} onChange={(e) => formik_POConfirmOrder.setFieldValue("Remarks", e.target.value)} />
            </div>
          </div>
          <hr className="mt-0" />
          <div className="mb-3 textblue f14">Attachments</div>
          {showAttach && (
            <div className="d-flex align-items-center border-bottom mb-2 pb-2">
              <a href={`${returnfileName}`} target="_blank" className="f12 me-auto">{attachmentfilters?.poAttachmentDescription}</a>
              <IconButton size="small"><HiOutlineX className="f17 text-danger" /></IconButton>
            </div>
          )}
          <div className="bggray p-2 pt-3 mb-3">
            <Form.Group controlId="formFile">
              <Form.Control name="poAttachment" type="file" size="md" accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleAttachfileChange("POAttachment")} isInvalid={"Unsupported Format"} />
              <Form.Text muted className="f10">(.docx|.doc|.jpg|.jpeg|.png|.pdf|.xlsx), Max Size: 10 mb</Form.Text>
            </Form.Group>
          </div>
        </form>
      </PEModal>

      <PEModal
        open={!!state["openOrderReject"]}
        onClose={toggleDrawer("openOrderReject", false, allPOShipHeader)}
        title="Reject Entire Order"
        size="sm"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--outline" onClick={toggleDrawer("openOrderReject", false, allPOShipHeader)}>Cancel</button>
            <button type="submit" form="form-order-reject" className="pe-btn pe-btn--primary">Save</button>
          </>
        }
      >
        <form id="form-order-reject" onSubmit={formik_PORejectOrder.handleSubmit} autoComplete="off">
          <div className="mb-4 textblue f14">Order Rejection Header</div>
          <div className="mb-4">
            <label className="pe-field-label">Reason</label>
            <TextField
              id="rejectionReason"
              name="rejectionReason"
              multiline
              rows={3}
              fullWidth
              size="small"
              variant="outlined"
              value={formik_PORejectOrder.values?.rejectionReason}
              onChange={(e) => formik_PORejectOrder?.setFieldValue("rejectionReason", e.target.value)}
            />
          </div>
        </form>
      </PEModal>

      <PEModal
        open={!!state["openOrderGRNSubmit"]}
        onClose={toggleDrawer("openOrderGRNSubmit", false, [])}
        title="GRN Submit"
        size="sm"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--outline" onClick={toggleDrawer("openOrderGRNSubmit", false, [])}>Cancel</button>
            <button type="submit" form="form-grn-submit" className="pe-btn pe-btn--primary" disabled={grnSaveDisable || isShippedHistoryEditDisabled}>Save</button>
          </>
        }
      >
        <form id="form-grn-submit" onSubmit={formik_GRNAccepted.handleSubmit} autoComplete="off">
          <div className="mb-4">
            <label className="pe-field-label">GRN No  <span className="rfq-required-star">*</span></label>
            <TextField
              id="grnNumber"
              name="grnNumber"
              fullWidth
              size="small"
              variant="outlined"
              value={formik_GRNAccepted?.values?.grnNumber}
              onChange={formik_GRNAccepted.handleChange}
              inputProps={{ maxLength: 25 }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik_GRNAccepted?.values?.grnNumber?.length}/25</Typography></InputAdornment> }}
              error={formik_GRNAccepted.touched.grnNumber && Boolean(formik_GRNAccepted.errors.grnNumber)}
              helperText={formik_GRNAccepted.touched.grnNumber && formik_GRNAccepted.errors.grnNumber}
            />
          </div>
          <div className="mb-4">
            <label className="pe-field-label">GRN Amount  <span className="rfq-required-star">*</span></label>
            <TextField
              id="grnAmount"
              name="grnAmount"
              fullWidth
              size="small"
              variant="outlined"
              value={formik_GRNAccepted?.values?.grnAmount}
              onChange={formik_GRNAccepted.handleChange}
              inputProps={{ maxLength: 25 }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik_GRNAccepted?.values?.grnAmount?.length}/25</Typography></InputAdornment> }}
              onInput={(e) => onlyNumberdec(e)}
              error={formik_GRNAccepted.touched.grnAmount && Boolean(formik_GRNAccepted.errors.grnAmount)}
              helperText={formik_GRNAccepted.touched.grnAmount && formik_GRNAccepted.errors.grnAmount}
            />
          </div>
          <div className="mb-4">
            <label className="pe-field-label">GRN Quantity  <span className="rfq-required-star">*</span></label>
            <TextField
              id="grnQuantity"
              name="grnQuantity"
              fullWidth
              size="small"
              variant="outlined"
              value={formik_GRNAccepted?.values?.grnQuantity}
              onChange={formik_GRNAccepted.handleChange}
              onInput={(e) => onlyNumbers(e)}
              inputProps={{ maxLength: 15 }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik_GRNAccepted?.values?.grnQuantity?.length}/15</Typography></InputAdornment> }}
              error={formik_GRNAccepted.touched.grnQuantity && Boolean(formik_GRNAccepted.errors.grnQuantity)}
              helperText={formik_GRNAccepted.touched.grnQuantity && formik_GRNAccepted.errors.grnQuantity}
            />
          </div>
          <div className="mb-4">
            <label className="pe-field-label">GRN Date</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                disablePast
                minDate={new Date()}
                value={formik_GRNAccepted.values?.grnDate}
                name="grnDate"
                slotProps={{
                  textField: { variant: "outlined", fullWidth: true, size: "small", InputLabelProps: { shrink: true } },
                  actionBar: { actions: ["clear", "cancel", "accept"] },
                }}
                onChange={(newValue) => formik_GRNAccepted.setFieldValue("grnDate", newValue)}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
            {formik_GRNAccepted.touched.grnDate && formik_GRNAccepted.errors.grnDate && (
              <div style={{ color: "red", fontSize: 12 }}>{formik_GRNAccepted.errors.grnDate}</div>
            )}
          </div>
        </form>
      </PEModal>

      <PEModal
        open={!!state["openInvoiceApproved"]}
        onClose={toggleDrawer("openInvoiceApproved", false, [])}
        title="Approval Action"
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="pe-btn pe-btn--outline"
              onClick={toggleDrawer("openInvoiceApproved", false, [])}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="form-invoice-approve"
              className="pe-btn pe-btn--primary"
              disabled={loading}
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <form id="form-invoice-approve" onSubmit={formik_POApproveReject.handleSubmit} autoComplete="off">
          <div className="mb-4">
            <label className="pe-field-label">Status</label>
            <TextField
              id="IsApproved"
              name="IsApproved"
              select
              fullWidth
              size="small"
              variant="outlined"
              value={formik_POApproveReject.values.IsApproved}
              onChange={(e) => formik_POApproveReject.setFieldValue("IsApproved", e.target.value)}
            >
              <MenuItem value={true}>Approve</MenuItem>
              <MenuItem value={false}>Reject</MenuItem>
            </TextField>
          </div>
          <div className="mb-4">
            <label className="pe-field-label">Comment</label>
            <TextField
              id="remarks"
              name="remarks"
              multiline
              rows={3}
              fullWidth
              size="small"
              variant="outlined"
              inputProps={{ maxLength: 200 }}
              value={formik_POApproveReject?.values?.remarks}
              error={formik_POApproveReject.touched.remarks && Boolean(formik_POApproveReject.errors.remarks)}
              helperText={formik_POApproveReject.touched.remarks && formik_POApproveReject.errors.remarks}
              onChange={(e) => formik_POApproveReject.setFieldValue("remarks", e.target.value)}
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
        </form>
      </PEModal>

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
    </>
  );
};

export default PODrawers;
