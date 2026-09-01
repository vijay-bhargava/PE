import React from 'react';
import { Checkbox } from '@mui/material';
import { HiDownload, HiOutlineX, HiPlusSm } from 'react-icons/hi';
import { PiWarningDiamondFill } from 'react-icons/pi';
import EventApprovalBox from '../../BaseCells/eventapprovalbox';
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { validateFileSize, downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { formatDateViaLocale } from '../../../utils/common/utility';

const NFAWorkflowPanel = ({
  approvershow,
  workflowPanelTab,
  setWorkflowPanelTab,
  actionType,
  currentStage,
  normalizedCurrentStage,
  stagearray,
  formik_ApproveReject,
  toggleDrawer,
  requestCell,
  handleEventAppList,
  wfupdate,
  stagelist,
  accessLevel,
  permissionManager,
  effectivePermissionManager,
  tempDataEditData,
  formik,
  userDetail,
  atoken,
  // history
  historyLoading,
  historyGraph,
  // attachments
  panelAttachLoading,
  panelAttachDesc,
  setPanelAttachDesc,
  panelAttachError,
  setPanelAttachError,
  panelAttachFile,
  setPanelAttachFile,
  panelSavedAttach,
  setPanelSavedAttach,
  panelHasCheckboxChanged,
  setPanelHasCheckboxChanged,
  panelIsUpdating,
  panelAttachAdding,
  panelFileInputRef,
  addPanelAttachment,
  deletePanelAttachment,
  updatePanelAttachments,
  handleattachmentforevent,
}) => {
  const canAttachCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.CREATE) ?? false;
  const canAttachEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.EDIT) ?? false;
  const canAttachRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.READ) ?? false;
  const canAttachRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.REMOVE) ?? false;
  const canAct = stagearray.includes(currentStage);

  return (
    <div className={`rightContent ${approvershow ? '' : 'd-none'}`}>
      <div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column approver-panel" style={{ overflow: 'hidden' }}>
        {/* Tab headers */}
        <div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2 flex-shrink-0 rfq-dv2-workflow-head">
          <div className="rfq-dv2-workflow-tabs">
            <button
              type="button"
              className={`rfq-dv2-workflow-tab ${workflowPanelTab === 'workflow' ? 'active' : ''}`}
              onClick={() => setWorkflowPanelTab('workflow')}
            >
              Approval Workflow
            </button>
            <button
              type="button"
              className={`rfq-dv2-workflow-tab ${workflowPanelTab === 'history' ? 'active' : ''}`}
              onClick={() => setWorkflowPanelTab('history')}
            >
              View History
            </button>
            <button
              type="button"
              className={`rfq-dv2-workflow-tab ${workflowPanelTab === 'attachments' ? 'active' : ''}`}
              onClick={() => setWorkflowPanelTab('attachments')}
            >
              Attachments
            </button>
          </div>
        </div>

        {/* Approve/Reject/Forward action panel */}
        {workflowPanelTab === 'workflow' && (actionType === 'approval' || actionType === 'Forward') && (
          <div className="rfq-dv2-workflow-action-panel">
            <div className="rfq-dv2-workflow-alert">
              <PiWarningDiamondFill className="rfq-dv2-workflow-alert-icon" />
              <span>
                {actionType === 'Forward'
                  ? 'Forward for Approval required for You'
                  : `${normalizedCurrentStage || currentStage} required for You`}
              </span>
            </div>
            <div className="rfq-dv2-workflow-actions">
              {actionType === 'approval' && (
                <>
                  <button
                    type="button"
                    className="rfq-dv2-workflow-btn rfq-dv2-workflow-approve"
                    onClick={(event) => {
                      formik_ApproveReject.setFieldValue('IsApproved', true);
                      toggleDrawer('openInvoiceApproved', true)(event);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rfq-dv2-workflow-btn rfq-dv2-workflow-reject"
                    onClick={(event) => {
                      formik_ApproveReject.setFieldValue('IsApproved', false);
                      toggleDrawer('openInvoiceApproved', true)(event);
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
              {actionType === 'Forward' && (
                <button
                  type="button"
                  className="rfq-dv2-workflow-btn rfq-dv2-workflow-approve"
                  onClick={(event) => {
                    toggleDrawer('openInvoiceApproved', true)(event);
                  }}
                >
                  Forward
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
          {/* Workflow tab */}
          {approvershow && workflowPanelTab === 'workflow' && (
            <EventApprovalBox
              requestCell={requestCell}
              handleEventAppList={handleEventAppList}
              wfupdate={wfupdate}
              action={true}
              stagelist={stagelist}
              accessLevel={accessLevel}
              Version={parseInt(formik?.values?.Version)}
              permissionManager={permissionManager}
              eventCode={tempDataEditData?.[0]?.eventCode}
              eventSubject={tempDataEditData?.[0]?.subject}
              startDate={tempDataEditData?.[0]?.startDate}
              endDate={tempDataEditData?.[0]?.endDate}
              currentStage={currentStage}
            />
          )}

          {/* History tab */}
          {approvershow && workflowPanelTab === 'history' && (
            <div className="rfq-dv2-history-track">
              {historyLoading ? (
                <div className="rfq-dv2-panel-loading">Loading history…</div>
              ) : historyGraph.length === 0 ? (
                <div className="rfq-dv2-panel-empty">No history found.</div>
              ) : (
                <div className="rfq-dv2-stage-graph">
                  {historyGraph.map((stage, i) => {
                    const name = stage.approverName ?? stage.modifiedByName ?? 'Unknown';
                    const date = stage.stageDone
                      ? formatDateViaLocale(stage.stageDone, userDetail)
                      : formatDateViaLocale(stage.modifiedOn, userDetail);
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && (
                          <div className="rfq-dv2-stage-graph-arrow">
                            <span className="rfq-dv2-stage-arrow-icon">→</span>
                          </div>
                        )}
                        <div className="rfq-dv2-stage-graph-node">
                          <span className="rfq-dv2-stage-graph-badge">
                            <span className="rfq-dv2-stage-check">✓</span>
                            {stage.currentStage?.toUpperCase()}
                          </span>
                          <span className="rfq-dv2-stage-graph-user">{name}</span>
                          <span className="rfq-dv2-stage-graph-date">{date}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Attachments tab */}
          {approvershow && workflowPanelTab === 'attachments' && (
            <div className="rfq-dv2-attachments-panel">
              {panelAttachLoading ? (
                <div className="rfq-dv2-panel-loading">Loading attachments…</div>
              ) : (
                <>
                  {canAct && canAttachCreate && (
                    <div className="rfq-dv2-attach-add-section">
                      <textarea
                        className="rfq-dv2-attach-desc-input"
                        placeholder="Attachment Description"
                        rows={4}
                        value={panelAttachDesc}
                        onChange={e => {
                          setPanelAttachDesc(e.target.value.replace(/'/g, ''));
                          if (panelAttachError) setPanelAttachError('');
                        }}
                      />
                      <label className="rfq-dv2-file-zone">
                        <input
                          type="file"
                          ref={panelFileInputRef}
                          style={{ display: 'none' }}
                          accept=".docx,.doc,.jpeg,.jpg,.gif,.png,.pdf,.xlsx"
                          onChange={e => {
                            if (validateFileSize(e)) {
                              setPanelAttachFile({ file: e.target.files[0] });
                              if (panelAttachError) setPanelAttachError('');
                            } else {
                              setPanelAttachFile(null);
                            }
                          }}
                        />
                        {panelAttachFile ? (
                          <div className="rfq-dv2-file-chip">
                            <HiDownload className="rfq-dv2-file-chip-icon" />
                            <span className="rfq-dv2-file-chip-name">{panelAttachFile.file.name}</span>
                            <button
                              type="button"
                              className="rfq-dv2-file-chip-clear"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPanelAttachFile(null);
                                if (panelFileInputRef.current) panelFileInputRef.current.value = '';
                              }}
                            >
                              <HiOutlineX />
                            </button>
                          </div>
                        ) : (
                          <div className="rfq-dv2-file-zone-empty">
                            <HiPlusSm className="rfq-dv2-file-zone-icon" />
                            <span>Click to choose file</span>
                            <span className="rfq-dv2-file-zone-hint">pdf, doc, xlsx, png…</span>
                          </div>
                        )}
                      </label>
                      {panelAttachError && (
                        <div className="rfq-dv2-attach-error">{panelAttachError}</div>
                      )}
                      <button
                        type="button"
                        className="rfq-dv2-add-file-btn"
                        onClick={addPanelAttachment}
                        disabled={panelAttachAdding}
                      >
                        <HiPlusSm />
                        {panelAttachAdding ? 'Adding…' : 'Add new file'}
                      </button>
                    </div>
                  )}
                  {panelSavedAttach.length === 0 ? (
                    <div className="rfq-dv2-panel-empty">No attachments yet.</div>
                  ) : (
                    <div className="rfq-dv2-attach-list">
                      {panelSavedAttach.map((item, i) => (
                        <div key={i} className="rfq-dv2-file-row">
                          <Checkbox
                            size="small"
                            className="rfq-dv2-file-tc"
                            checked={item.fileType === 'TC'}
                            disabled={!canAct || !canAttachEdit}
                            onChange={e => {
                              const updated = panelSavedAttach.map((a, idx) =>
                                idx === i ? { ...a, fileType: e.target.checked ? 'TC' : '' } : a
                              );
                              setPanelSavedAttach(updated);
                              handleattachmentforevent(updated);
                              setPanelHasCheckboxChanged(true);
                            }}
                          />
                          <div className="rfq-dv2-file-meta">
                            <span className="rfq-dv2-file-desc-text" title={item.attachmentDescription}>
                              {item.attachmentDescription || '—'}
                            </span>
                            <span className="rfq-dv2-file-name-text" title={getFileName(item.fileNamePath)}>
                              {getFileName(item.fileNamePath)}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="pe-icon-btn pe-icon-btn--download"
                            aria-label="Download"
                            onClick={() => downloadFilesOnAzure(item.fileNamePath, getFileName(item.fileNamePath), atoken)}
                          >
                            <HiDownload />
                          </button>
                          {canAct && !item.required && canAttachRemove && (
                            <button
                              type="button"
                              className="pe-icon-btn pe-icon-btn--delete"
                              aria-label="Delete"
                              onClick={() => deletePanelAttachment(i, item.id)}
                            >
                              <HiOutlineX />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {canAct && panelHasCheckboxChanged && panelSavedAttach.length > 0 && canAttachRead && canAttachEdit && (
                    <div className="rfq-dv2-attach-update-row">
                      <button
                        type="button"
                        className="rfq-dv2-attach-update-btn"
                        onClick={updatePanelAttachments}
                        disabled={panelIsUpdating}
                      >
                        {panelIsUpdating ? 'Updating…' : 'Update'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFAWorkflowPanel;
