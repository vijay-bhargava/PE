import React from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { HiPencilAlt } from 'react-icons/hi';
import RFQGeneralPreview from './RFQGeneralPreview';
import BoqScreen from './BoqScreen';
import ProductitemCell from './ProductitemCell';
import SelectedSupplierCell from './SelectedSupplierCell';
import EventCommercialScreen from '../../../components/Event/EventCommercialScreen';
import EventQuestionScreen from '../../../components/Event/EventQuestionScreen';

const RFQPreviewTab = ({
  rfqpreview,
  showGeneralAccessDenied,
  idFromURL,
  formik,
  inputList,
  purchaseAllList,
  purchaseGroupAllList,
  stagearray,
  currentStage,
  accessLevel,
  rfqItemsList,
  currencyList,
  supplierid,
  stagelist,
  permissionManager,
  requestCell,
  selectedSupplier,
  handletabEdit,
  EventCommercialScreenRef,
  EventQuestionScreenRef,
  isquestioneditDisabled,
  effectivePermissionManager,
  handleEditItem,
  handleDeleteItem,
}) => {
  if (!rfqpreview || showGeneralAccessDenied || !idFromURL || idFromURL === 'add') return null;

  return (
    <div className="rfq-preview-scroll-area">
      {accessLevel?.find(x => x.claimType == 'General')?.claimValue?.Read != 'N' && (
        <>
          <div className="rfq-preview-section-card mb-3">
            <div className="rfq-preview-card-body">
              <div className="d-flex justify-content-between align-items-center mb-3" id="generaldetails">
                <div className="rfq-preview-section-title">
                  <ArticleOutlinedIcon className="rfq-preview-section-icon" />RFQ General Details
                </div>
                {stagearray.includes(currentStage) && (
                  <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(1)}>
                    <HiPencilAlt />
                  </button>
                )}
              </div>
              <RFQGeneralPreview
                formik={formik}
                inputList={inputList}
                purchaseAllList={purchaseAllList}
                purchaseGroupAllList={purchaseGroupAllList}
                customClassName="none"
              />
            </div>
          </div>
        </>
      )}

      {accessLevel?.find(x => x.claimType == 'Item Service')?.claimValue?.Read !== 'N' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3" id="rfqitemsdetails">
            <div className="rfq-preview-section-title">
              <ListAltOutlinedIcon className="rfq-preview-section-icon" />RFQ Items Details
            </div>
            {stagearray.includes(currentStage) && (
              <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(2)}>
                <HiPencilAlt />
              </button>
            )}
          </div>
          <div className="rfq-preview-section-card mb-3">
            <div className="rfq-preview-card-body">
              {formik.values.boqReq === true ? (
                <BoqScreen
                  idFromURL={idFromURL}
                  eventType="RFQ"
                  CurrentVersion={formik?.values?.Version}
                  stage={currentStage}
                  boqReq={formik.values.boqReq}
                  readOnly={true}
                />
              ) : (
                <ProductitemCell
                  action={false}
                  itemsList={rfqItemsList}
                  handleEditItem={handleEditItem}
                  handleDeleteItem={handleDeleteItem}
                />
              )}
            </div>
          </div>
        </>
      )}

      {accessLevel?.find(x => x.claimType == 'Commercial Terms')?.claimValue?.Read !== 'N' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3" id="rfqcommercialdetails">
            <div className="rfq-preview-section-title">
              <ReceiptLongOutlinedIcon className="rfq-preview-section-icon" />RFQ Commercial Details
            </div>
            {stagearray.includes(currentStage) && (
              <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(3)}>
                <HiPencilAlt />
              </button>
            )}
          </div>
          <div className="rfq-preview-section-card mb-3">
            <div className="rfq-preview-card-body">
              <EventCommercialScreen
                EventType="RFQ"
                EventId={idFromURL}
                LibraryType="CommercialLibrary"
                Version={formik?.values?.Version}
                EventGeneralDetails={formik?.values}
                Action={false}
                currencyList={currencyList}
                ref={EventCommercialScreenRef}
                permissionManager={effectivePermissionManager}
              />
            </div>
          </div>
        </>
      )}

      {accessLevel?.find(x => x.claimType == 'Questions')?.claimValue?.Read !== 'N' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3" id="rfqquestions">
            <div className="rfq-preview-section-title">
              <HelpOutlineOutlinedIcon className="rfq-preview-section-icon" />RFQ Questions
            </div>
            {stagearray.includes(currentStage) && (
              <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(4)}>
                <HiPencilAlt />
              </button>
            )}
          </div>
          <div className="rfq-preview-section-card mb-3">
            <div className="rfq-preview-card-body">
              <EventQuestionScreen
                props={{
                  eventid: idFromURL,
                  eventtype: 'RFQ',
                  librarytype: 'QuestionLibrary',
                  action: false,
                  supplierid: supplierid,
                  Version: formik?.values?.Version,
                  editquestion: isquestioneditDisabled,
                  stagelist: stagelist,
                  permissionManager: permissionManager,
                  requestCell: requestCell,
                }}
                ref={EventQuestionScreenRef}
              />
            </div>
          </div>
        </>
      )}

      {accessLevel?.find(x => x.claimType == 'Invite Vendor')?.claimValue?.Read !== 'N' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3" id="invitedsuppliers">
            <div className="rfq-preview-section-title">
              <GroupOutlinedIcon className="rfq-preview-section-icon" />Invited Suppliers
            </div>
            {stagearray.includes(currentStage) && (
              <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(5)}>
                <HiPencilAlt />
              </button>
            )}
          </div>
          <div className="rfq-preview-section-card mb-3">
            <div className="rfq-preview-card-body">
              <div className="row">
                <div className="col-12">
                  <SelectedSupplierCell selectedsupplier={selectedSupplier} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RFQPreviewTab;
