import React from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { HiPencilAlt } from 'react-icons/hi';
import PRGeneralPreview from './PRGeneralPreview';
import PRBoqScreen from './PRBoqScreen';
import PRProductItemCell from './PRProductItemCell';

const PRPreviewTab = ({
  idFromURL,
  formik,
  purchaseAllList,
  purchaseGroupAllList,
  stagearray,
  currentStage,
  prItemsList,
  handletabEdit,
  handleEditItem,
  handleDeleteItem,
  pullPRtemServiceFind,
  accessLevel,
}) => {
  if (!idFromURL || idFromURL === 'add') return null;

  const canEdit = stagearray?.includes(currentStage) || currentStage === 'Under Approval';

  return (
    <div className="rfq-preview-scroll-area">

      {accessLevel?.find(x => x.claimType === 'General')?.claimValue?.Read !== 'N' && (
        <div className="rfq-preview-section-card mb-3">
          <div className="rfq-preview-card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="rfq-preview-section-title">
                <ArticleOutlinedIcon className="rfq-preview-section-icon" />PR General Details
              </div>
              {canEdit && (
                <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(1)}>
                  <HiPencilAlt />
                </button>
              )}
            </div>
            <PRGeneralPreview
              formik={formik}
              purchaseAllList={purchaseAllList}
              purchaseGroupAllList={purchaseGroupAllList}
              stagearray={stagearray}
              currentStage={currentStage}
              prItemsList={[]}
            />
          </div>
        </div>
      )}

      {accessLevel?.find(x => x.claimType === 'Item Service')?.claimValue?.Read !== 'N' && (
        <div className="rfq-preview-section-card mb-3">
          <div className="rfq-preview-card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="rfq-preview-section-title">
                <ListAltOutlinedIcon className="rfq-preview-section-icon" />PR Items / Services
              </div>
              {canEdit && (
                <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => handletabEdit(2)}>
                  <HiPencilAlt />
                </button>
              )}
            </div>
            {formik.values.isBoq ? (
              <PRBoqScreen
                idFromURL={idFromURL}
                readOnly={true}
                CurrentVersion={1}
                onUploadSuccess={() => pullPRtemServiceFind(idFromURL)}
              />
            ) : (
              <PRProductItemCell
                action={false}
                itemsList={prItemsList}
                handleEditItem={handleEditItem}
                handleDeleteItem={handleDeleteItem}
                eventType="PR"
                accessLevel={accessLevel}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PRPreviewTab;
