import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  Box,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Modal } from 'react-bootstrap';
import { HiOutlineX } from 'react-icons/hi';
import CommonBottomDrawer from '../../../components/CommonBottomDrawer';
import ApprovalConfirmDialog from '../../../components/RFQ/ApprovalConfirmDialog';
import AddProductsCell from './AddProductsCell';
import AddQuestionFormCell from './AddQuestionFormCell';
import LoadingFactor from './LoadingFactor';
import PurchaseOrg from '../../../utils/common/PurchaseOrg';
import PurchaseOrgGrp from '../../../utils/common/PurchaseOrgGrp';
import AddEditCurrency from '../../../utils/common/AddEditCurrency';

const RFQDrawers = ({
  // shared
  state,
  toggleDrawer,
  stagearray,
  currentStage,
  formik,
  idFromURL,
  // addProductDrawer
  itemEditTempData,
  UOMMaster,
  callbackItemAdd,
  handleUomList,
  accessLevel,
  // qusDrawer
  callbackQuesAddCustom,
  libraryId,
  questionforedit,
  // surrogateDrawer
  selectedAction,
  formik_Action,
  // approval dialog
  formik_ApproveReject,
  normalizedCurrentStage,
  // delete dialog
  confirmDelete,
  handleCloseDelete,
  removeItem,
  removeItemData,
  // cancel dialog
  modalcancelOpen,
  handleCancelRFQModal,
  cancelReason,
  handleCancelInputChange,
  rfqerror,
  // purchaseOrgModal
  purchaseOrgModal,
  ClosePurcgaseOrgModal,
  handlepurchaseorgList,
  // loadingModal
  loadingModal,
  CloseLoadingModal,
  storeVId,
  filteredLoadingFactors,
  setupdatesupplieronloading,
  setIsUpdated,
  // purchaseOrgGrpModal
  purchaseOrgGrpModal,
  ClosePurcgaseOrgGrpModal,
  // save as template modal
  open,
  handleClose,
  TemplateTitle,
  setTemplateTitle,
  handleSaveTemplate,
  // confirmEventUpdate dialog
  confirmEventUpdate,
  handleCloseEventUpdate,
  loading,
  handleDraftEvent,
  // file input
  fileInputRef,
  handleFileChange,
  // confirmClearAllItems dialog
  confirmClearAllItems,
  handleClearAllItems,
  // base currency modal
  modal1,
  handleCloseModal1,
  currencyList,
  loadCurrency,
  pullgetCurrency,
  setOpenCurrencyModal,
  // uploading overlay
  isUploading,
  // currency modal
  OpenCurrencyModal,
  CloseCurrencyModal,
  handleCurrencyList,
}) => {
  return (
    <>
      {/* Add Product / Service Drawer */}
      <CommonBottomDrawer
        open={state['addProductDrawer']}
        onClose={toggleDrawer('addProductDrawer', false)}
        title={itemEditTempData?.id > 0 ? 'Edit Product / Service' : 'Add Product / Service'}
        bodyStyle={{ overflowY: 'auto' }}
        actions={
          <>
            <button type="button" className="pe-btn pe-btn--ghost" onClick={toggleDrawer('addProductDrawer', false)}>Cancel</button>
            {stagearray.includes(currentStage) && (
              <>
                <button type="reset" form="add-product-form" className="pe-btn pe-btn--secondary">Reset</button>
                <button type="submit" form="add-product-form" className="pe-btn pe-btn--primary">
                  {itemEditTempData?.id > 0 ? 'Update' : 'Add'}
                </button>
              </>
            )}
          </>
        }
      >
        <AddProductsCell
          idFromURL={idFromURL}
          UOMMaster={UOMMaster}
          callbackItemAdd={callbackItemAdd}
          itemEditTempData={itemEditTempData}
          handleUomList={handleUomList}
          action={stagearray.includes(currentStage)}
          accesslevel={accessLevel?.itemservice?.created}
          Version={formik?.values?.Version}
        />
      </CommonBottomDrawer>

      {/* Add Question Drawer */}
      <React.Fragment key="qusDrawertr">
        <Drawer anchor="right" open={state['qusDrawer']}>
          <Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
            <div className="flex flex-col">
              <Box className="bgheaderCards">
                <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                  <div className="ms-3 text-white">Add Question</div>
                  <div>
                    <IconButton onClick={toggleDrawer('qusDrawer', false)} size="small" edge="start" sx={{ mr: 1 }}>
                      <HiOutlineX className="f20 text-white" />
                    </IconButton>
                  </div>
                </div>
              </Box>
              <div className="h50px"></div>
              <Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>
                <AddQuestionFormCell
                  idFromURL={idFromURL}
                  callbackQuesAddCustom={callbackQuesAddCustom}
                  libraryId={libraryId}
                  questionforedit={questionforedit}
                />
              </Box>
            </div>
          </Box>
        </Drawer>
      </React.Fragment>

      {/* Surrogate / Reminder / Reopen Drawer */}
      <CommonBottomDrawer
        open={state['surrogateDrawer']}
        onClose={toggleDrawer('surrogateDrawer', false)}
        title={selectedAction}
        actions={
          <>
            <button type="button" className="pe-btn pe-btn--ghost" onClick={toggleDrawer('surrogateDrawer', false)}>Cancel</button>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={() => formik_Action.resetForm()}>Reset</button>
            <button type="submit" form="surrogate-action-form" className="pe-btn pe-btn--primary">Submit</button>
          </>
        }
      >
        <form id="surrogate-action-form" onSubmit={formik_Action.handleSubmit} autoComplete="off">
          <div className="row">
            <div className="col-12 mb-4">
              <label className="pe-field-label">Supplier <span className="rfq-required-star">*</span></label>
              <TextField
                fullWidth size="small" variant="outlined" id="supplierselected" name="supplierselected"
                value={`${formik_Action.values.supplier?.contactPerson} | ${formik_Action.values.supplier?.emailId} | ${formik_Action.values.supplier?.companyName}`}
                disabled className="f14" autoComplete="off"
              />
            </div>
            {selectedAction === 'Surrogate RFQ' && (
              <>
                <div className="col-12 col-md-6 mb-4">
                  <label className="pe-field-label">Surrogator Name</label>
                  <TextField
                    fullWidth size="small" variant="outlined"
                    id="name" name="name" className="f14" autoComplete="off"
                    inputProps={{ maxLength: 100 }}
                    value={formik_Action.values.name}
                    onChange={(e) => formik_Action.setFieldValue('name', e.target?.value)}
                    error={formik_Action.touched.name && Boolean(formik_Action.errors.name)}
                    helperText={formik_Action.touched.name && formik_Action.errors.name}
                  />
                </div>
                <div className="col-12 col-md-6 mb-4">
                  <label className="pe-field-label">Surrogator Email <span className="rfq-required-star">*</span></label>
                  <TextField
                    fullWidth size="small" variant="outlined"
                    id="email" name="email" className="f14" autoComplete="off"
                    inputProps={{ maxLength: 100 }}
                    value={formik_Action.values.email}
                    onChange={(e) => formik_Action.setFieldValue('email', e.target?.value)}
                    error={formik_Action.touched.email && Boolean(formik_Action.errors.email)}
                    helperText={formik_Action.touched.email && formik_Action.errors.email}
                  />
                </div>
              </>
            )}
            <div className="col-12 mb-4">
              <label className="pe-field-label">Remark</label>
              <TextField
                fullWidth size="small" variant="outlined" multiline rows={4}
                id="Reason" name="Reason" className="f14" autoComplete="off"
                inputProps={{ maxLength: 200 }}
                value={formik_Action.values.Reason}
                onChange={(e) => formik_Action.setFieldValue('Reason', e.target?.value)}
                error={formik_Action.touched.Reason && Boolean(formik_Action.errors.Reason)}
                helperText={formik_Action.touched.Reason && formik_Action.errors.Reason}
              />
            </div>
          </div>
        </form>
      </CommonBottomDrawer>

      {/* Approval Confirm Dialog */}
      <React.Fragment key="key4">
        <ApprovalConfirmDialog
          open={state['openInvoiceApproved']}
          onClose={toggleDrawer('openInvoiceApproved', false, [])}
          onSubmit={formik_ApproveReject.handleSubmit}
          status={formik_ApproveReject.values?.status}
          stageName={normalizedCurrentStage}
          comment={formik_ApproveReject.values?.approveComment}
          onCommentChange={(val) => formik_ApproveReject.setFieldValue('approveComment', val)}
        />
      </React.Fragment>

      {/* Delete Item Confirm Dialog */}
      <Dialog open={confirmDelete} onClose={handleCloseDelete}>
        <DialogTitle>{"Are you sure?"}</DialogTitle>
        <DialogContent style={{ minWidth: '300px' }}>
          <DialogContentText>You want to delete.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>No</Button>
          <Button onClick={() => removeItemData(removeItem)} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel RFQ Dialog */}
      <Dialog open={modalcancelOpen} onClose={() => handleCancelRFQModal(false)}>
        <DialogTitle>{"Are you sure?"}</DialogTitle>
        <DialogContent style={{ minWidth: '300px' }}>
          <DialogContentText>Do you want to cancel this rfq? Unsaved changes will be lost.</DialogContentText>
          <label className="pe-field-label">Enter reason <span className="rfq-required-star">*</span></label>
          <TextField
            autoFocus margin="dense" type="text" fullWidth
            value={cancelReason}
            onChange={handleCancelInputChange}
            error={Boolean(rfqerror)}
            helperText={rfqerror}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCancelRFQModal(false)}>No</Button>
          <Button onClick={() => handleCancelRFQModal(true)} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Purchase Organization Modal */}
      <Modal
        show={purchaseOrgModal}
        dialogClassName="modal-custom-mdlg"
        className="zindex1280"
        backdropClassName="zindex1280"
        backdrop="static"
        keyboard={false}
        centered
        onHide={ClosePurcgaseOrgModal}
      >
        <Modal.Body className="p-0 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
            <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Purchase Organization</span>
            <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => ClosePurcgaseOrgModal()}>
              <HiOutlineX />
            </button>
          </div>
          <div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
            <PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
          </div>
        </Modal.Body>
      </Modal>

      {/* Loading Factor Modal */}
      <Modal
        show={loadingModal}
        dialogClassName="modal-custom-mdlg"
        className="zindex1280"
        backdropClassName="zindex1280"
        backdrop="static"
        keyboard={false}
        centered
        onHide={CloseLoadingModal}
      >
        <Modal.Body className="p-0 d-flex flex-column">
          <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
            <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Loading Factor</span>
            <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={CloseLoadingModal}>
              <HiOutlineX />
            </button>
          </div>
          <div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
            <LoadingFactor
              isModal={true}
              rfqId={idFromURL}
              version={formik?.values?.Version}
              vendorId={storeVId}
              initialFactors={filteredLoadingFactors}
              baseCurrency={formik?.values?.baseCurrency}
              onSubmitSuccess={() => { setupdatesupplieronloading(1); setIsUpdated(true); }}
            />
          </div>
        </Modal.Body>
      </Modal>

      {/* Purchase Group Modal */}
      <Modal
        show={purchaseOrgGrpModal}
        dialogClassName="modal-custom-mdlg"
        backdrop="static"
        keyboard={false}
        centered
        contentClassName="border-0"
        onHide={ClosePurcgaseOrgGrpModal}
      >
        <Modal.Body className="p-0 d-flex flex-column" style={{ height: '78vh', overflow: 'hidden' }}>
          <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
            <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Purchase Group</span>
            <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => ClosePurcgaseOrgGrpModal()}>
              <HiOutlineX />
            </button>
          </div>
          <div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
            <PurchaseOrgGrp isModal />
          </div>
        </Modal.Body>
      </Modal>

      {/* Save as Template Modal */}
      <Modal
        show={open}
        backdrop="static"
        keyboard={false}
        className="zindex10002 rfq-create-modal"
        backdropClassName="zindex10002"
        centered
        contentClassName="border-0 rounded-default"
        onHide={handleClose}
      >
        <Modal.Header className="pt-2 pb-2">
          <Modal.Title>
            <span style={{ fontSize: 14 }}>Save as Template</span>
          </Modal.Title>
          <button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={handleClose}>
            <HiOutlineX style={{ fontSize: 16 }} />
          </button>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <label className="pe-field-label" htmlFor="rfqTemplateTitle">RFQ Template Title</label>
            <TextField
              id="rfqTemplateTitle"
              fullWidth size="small" variant="outlined" autoComplete="off"
              inputProps={{ maxLength: 100 }}
              value={TemplateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
            />
            <div className="col-12 mt-4 d-flex justify-content-end gap-2">
              <button type="button" className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
              <button type="button" className="pe-btn pe-btn--primary" onClick={handleSaveTemplate} disabled={!idFromURL}>Save</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Confirm Event Update Dialog */}
      {confirmEventUpdate && (
        <Dialog open={confirmEventUpdate} onClose={() => handleCloseEventUpdate(false)}>
          <DialogTitle>{"Are you sure?"}</DialogTitle>
          <DialogContent style={{ minWidth: '300px' }}>
            <DialogContentText>
              Are you sure you want to update the event? This action may trigger a reinitiation of the RFQ process.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleCloseEventUpdate(false)}>Cancel</Button>
            <LoadingButton loading={loading} onClick={handleDraftEvent} autoFocus>Yes</LoadingButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Hidden file input for item Excel upload */}
      <input className="d-none" id="itemuploadid" ref={fileInputRef} type="file" onChange={handleFileChange} />

      {/* Clear All Items Confirm Dialog */}
      <Dialog open={confirmClearAllItems} onClose={() => handleClearAllItems(false)}>
        <DialogTitle>{"Are you sure?"}</DialogTitle>
        <DialogContent style={{ minWidth: '300px' }}>
          <DialogContentText>Are you sure you want to delete all Items ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClearAllItems(false)}>No</Button>
          <Button onClick={() => handleClearAllItems(true)} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Base Currency Modal */}
      <Modal
        size="sm"
        show={modal1}
        backdrop="static"
        keyboard={false}
        centered
        className="zindex1270 rfq-create-modal"
        backdropClassName="zindex1270"
        contentClassName="border-0 rounded-default"
        onHide={() => handleCloseModal1()}
      >
        <Modal.Header className="pt-2 pb-2">
          <Modal.Title>
            <span style={{ fontSize: 14 }}>Select Base Currency</span>
          </Modal.Title>
          <button type="button" className="rfq-modal-close-btn" onClick={() => handleCloseModal1()}>
            <HiOutlineX style={{ fontSize: 16 }} />
          </button>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <label className="pe-field-label">Select Currency <span className="rfq-required-star">*</span></label>
            <TextField
              id="basecurrencymodal"
              name="baseCurrency"
              select
              className="w-100 f14"
              size="small"
              variant="outlined"
              SelectProps={{
                onOpen: () => {
                  if (currencyList.length === 0 && !loadCurrency) {
                    pullgetCurrency();
                  }
                },
              }}
              value={formik?.values?.baseCurrency}
              onChange={(e) => {
                const newValue = e.target?.value;
                if (newValue === 'new') {
                  handleCloseModal1();
                  setTimeout(() => { setOpenCurrencyModal(true); }, 100);
                  return;
                }
                formik.setFieldValue('baseCurrency', newValue);
                handleCloseModal1();
              }}
            >
              {loadCurrency ? (
                <MenuItem>Loading...</MenuItem>
              ) : [
                ...(currencyList || []).map((option) => (
                  <MenuItem key={option.id} value={option?.currencyNm}>
                    {option?.currencyNm}
                  </MenuItem>
                )),
                <MenuItem key="new" value="new" className="dropdown-add-new">Add New</MenuItem>,
              ]}
            </TextField>
          </div>
        </Modal.Body>
      </Modal>

      {/* Uploading Overlay */}
      {isUploading && (
        <div style={{
          position: 'fixed', top: 0, left: 0,
          height: '100vh', width: '100vw',
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner-border text-primary mb-2" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>Please Wait While Uploading...</div>
          </div>
        </div>
      )}

      {/* Manage Currency Modal */}
      <Modal
        size="md"
        show={OpenCurrencyModal}
        backdrop="static"
        keyboard={false}
        className="zindex1280"
        backdropClassName="zindex1280"
        centered
        contentClassName="border-0"
        onHide={() => CloseCurrencyModal()}
      >
        <Modal.Header className="pt-2 pb-2 bgheaderCards">
          <Modal.Title id="modal-heading">
            <div className="d-flex align-items-center f14 text-white">Manage Currency</div>
          </Modal.Title>
          <IconButton onClick={() => CloseCurrencyModal()} size="small" edge="start">
            <HiOutlineX className="f20 text-white" />
          </IconButton>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3">
            <AddEditCurrency handleCurrencyList={handleCurrencyList} />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RFQDrawers;
