import React from 'react';
import { Checkbox } from '@mui/material';
import { IconButton } from '@mui/material';
import { HiDownload, HiOutlineX, HiPlusSm } from 'react-icons/hi';
import { PiWarningDiamondFill } from 'react-icons/pi';
import EventApprovalBox from '../../BaseCells/eventapprovalbox';
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { validateFileSize, downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { formatDateViaLocale } from '../../../utils/common/utility';

const AuctionWorkflowPanel = ({
  approvershow,
  handleApprover,
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
  userDetail,
  atoken,
  // fetch callbacks (called on tab switch)
  fetchPanelHistory,
  fetchPanelAttachments,
  // workflow empty state
  wfFetched,
  eventAppList,
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

        {/* Tab headers + close button */}
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
              onClick={() => { setWorkflowPanelTab('history'); fetchPanelHistory?.(); }}
            >
              View History
            </button>
            <button
              type="button"
              className={`rfq-dv2-workflow-tab ${workflowPanelTab === 'attachments' ? 'active' : ''}`}
              onClick={() => { setWorkflowPanelTab('attachments'); fetchPanelAttachments?.(); }}
            >
              Attachments
            </button>
          </div>
          <IconButton onClick={() => handleApprover(false)} size="small" className="text-muted">
            <HiOutlineX className="f16" />
          </IconButton>
        </div>

        {/* Approve / Reject / Forward action panel */}
        {workflowPanelTab === 'workflow' && (actionType === 'approval' || actionType === 'Forward') && (
          <div className="rfq-dv2-workflow-action-panel">
            <div className="rfq-dv2-workflow-alert">
              <PiWarningDiamondFill className="rfq-dv2-workflow-alert-icon" />
              <span>
                {actionType === 'Forward'
                  ? 'Forward for Approval required for You'
                  : `${normalizedCurrentStage} required for You`}
              </span>
            </div>
            <div className="rfq-dv2-workflow-actions">
              {actionType === 'approval' && (
                <>
                  <button
                    type="button"
                    className="rfq-dv2-workflow-btn rfq-dv2-workflow-approve"
                    onClick={(event) => {
                      formik_ApproveReject.setFieldValue('status', 'Approved');
                      toggleDrawer('openInvoiceApproved', true)(event);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rfq-dv2-workflow-btn rfq-dv2-workflow-reject"
                    onClick={(event) => {
                      formik_ApproveReject.setFieldValue('status', 'Rejected');
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
                    formik_ApproveReject.setFieldValue('status', 'Forward');
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
            <>
              <EventApprovalBox
                requestCell={requestCell}
                handleEventAppList={handleEventAppList}
                wfupdate={wfupdate}
                action={canAct}
                stagelist={stagelist}
                accessLevel={accessLevel}
                permissionManager={permissionManager}
                eventCode={tempDataEditData?.[0]?.eventCode}
                eventSubject={tempDataEditData?.[0]?.subject}
                startDate={tempDataEditData?.[0]?.bidStDate}
                endDate={tempDataEditData?.[0]?.bidEndDate}
                currentStage={currentStage}
              />
              {(requestCell?.EventId === 0 || (wfFetched && (!eventAppList || eventAppList.length === 0))) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C9.24 2 7 4.24 7 7v2H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V7c0-1.66 1.34-3 3-3zm0 9c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#9ca3af"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 6 }}>No Approvers Configured</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>No approval workflow has been set up for this event.</div>
                </div>
              )}
            </>
          )}

          {/* History tab */}
          {approvershow && workflowPanelTab === 'history' && (
            <div className="rfq-dv2-history-track">
              {historyLoading ? (
                <div className="rfq-dv2-panel-loading">Loading history…</div>
              ) : historyGraph.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3zm8 0v5h-5l1.85-1.85A7.003 7.003 0 0 0 13 5V3a9.003 9.003 0 0 1 5.65 2L21 3z" fill="#9ca3af"/>
                      <path d="M12 8v4l3 3-1.41 1.41L10 13V8h2z" fill="#9ca3af"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 6 }}>No History Available</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>No activity has been recorded for this event yet.</div>
                </div>
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

export default AuctionWorkflowPanel;
