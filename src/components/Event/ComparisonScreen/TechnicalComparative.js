import React, { useMemo, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
  Chip,
  TextField,
  Box,
  Button
} from '@mui/material';
import styles from './UnifiedComparisonTable.module.css';
import { HiDownload } from "react-icons/hi";
import { MdOutlineCheck, MdClose } from "react-icons/md";
import { FaRegCircleDot } from "react-icons/fa6";
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { useStateValue } from '../../../store';
import { formatDateViaLocale } from '../../../utils/common/utility';

const TechnicalComparative = ({ data, updateScore, handleApprovalActivity, actionType, activityId, handleSupplierModalOpen, isNFA, currentStage, onScoreDirtyChange, updateScoreRef, resetScoreRef }) => {
  const [{ atoken, userDetail }] = useStateValue();

  const [scoreUpdate, setScoreUpdate] = useState(false);
  const [technicalQuestionResponses, setTechnicalQuestionResponses] = useState([]);

  const transformedData = useMemo(() => {
    if (!data?.suppliers || !data?.questionDto) {
      return { vendors: [], technicalQuestions: [], approvers: [] };
    }

    const vendors = data.suppliers.map(supplier => ({
      id: supplier.vendorId,
      name: supplier.companyName,
      label: formatDateViaLocale(supplier.responseDate, userDetail),
      commercialRanking: `L${supplier.ranking || 1}`,
      acceptedCurrency: supplier.acceptedCurrency,
      techStatus: supplier.techStatus,
      totalScore: supplier.totalScore ?? supplier.score ?? null
    }));

    const technicalQuestions = data.questionDto.map(question => {
      const vendorsObj = {};
      question.vendorQuestionResponse?.forEach(response => {
        vendorsObj[response.vendorId] = {
          answer: response.answer || 'No Response',
          attachedFileName: response.ansAttachements || null,
          score: response.score || 0,
          updateScore: response.updateScore || false
        };
      });
      return {
        id: question.id,
        questionDescription: question.questionDescription,
        questionRequirement: question.questionRequirement || '',
        questionCategory: "Technical Evaluation",
        questionSubCategory: "General",
        optionType: question.optionType ? 1 : 0,
        weightage: question.weightage || 0,
        mandatory: question.mandatory ? 1 : 0,
        attachedFileName: question.attachedFileName || null,
        vendors: vendorsObj
      };
    });

    const approvers = data?.techApprovers || [];
    return { vendors, technicalQuestions, approvers };
  }, [data]);

  const { vendors, technicalQuestions, approvers } = transformedData;

  React.useEffect(() => {
    if (data?.questionDto && data?.suppliers && !scoreUpdate) {
      setTechnicalQuestionResponses(data.questionDto);
    }
  }, [data, scoreUpdate]);

  const getRankClass = (ranking) => {
    if (ranking === 'L1') return styles.rankL1;
    if (ranking === 'L2') return styles.rankL2;
    return styles.rankL3;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') return '-';
    return value;
  };

  const getVendorApprovalData = (approver, vendorId) => {
    return approver?.supplierTechAppData?.find(v => v.vendorId === vendorId);
  };

  const formatAnswer = (answer, attachedFileName) => {
    const truncatedAnswer = answer && answer.length > 80 ? `${answer.substring(0, 80)}...` : answer;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography className={styles.commercialValue}>{formatValue(truncatedAnswer)}</Typography>
        {attachedFileName && (
          <button
            type="button"
            title={getFileName(attachedFileName)}
            className="pe-icon-btn"
            onClick={() => downloadFilesOnAzure(attachedFileName, getFileName(attachedFileName), atoken)}
            style={{ flexShrink: 0 }}
          >
            <HiDownload style={{ fontSize: '14px' }} />
          </button>
        )}
      </div>
    );
  };

  const handleScoreChange = (vendorId, questionId, newScore) => {
    setScoreUpdate(true);
    setTechnicalQuestionResponses(prevQuestions =>
      prevQuestions.map(question =>
        question.id === questionId
          ? {
            ...question,
            vendorQuestionResponse: question.vendorQuestionResponse?.map(response =>
              response.vendorId === vendorId ? { ...response, score: newScore } : response
            )
          }
          : question
      )
    );
  };

  const handleScoreUpdate = useCallback(async () => {
    if (updateScore && technicalQuestionResponses) {
      const updatedQuestions = [];
      technicalQuestionResponses.forEach(question => {
        question.vendorQuestionResponse?.forEach(response => {
          updatedQuestions.push({
            id: response.id,
            questionId: question.id,
            questionDescription: question.questionDescription,
            questionRequirement: question.questionRequirement || "",
            attachement: question.attachedFileName ? 1 : 0,
            attachedFileName: question.attachedFileName || "",
            optionType: question.optionType ? 1 : 0,
            weightage: question.weightage || 0,
            mandatory: question.mandatory ? 1 : 0,
            libraryId: question.libraryId || 0,
            libraryEntity: question.libraryEntity || "",
            vendorDetailId: response.vendorDetailId || 0,
            questionCategory: question.questionCategory || "",
            questioncategoryId: question.questioncategoryId || 0,
            questionSubcategoryId: question.questionSubcategoryId || 0,
            questionSubCategory: question.questionSubCategory || "",
            questionOption: question.questionOption || [],
            vendorId: response.vendorId,
            version: question.version || 1,
            score: response.score || 0,
            answer: response.updateScore ? response.answer || "" : null,
            ansAttachements: response.ansAttachements || "",
            isMultiOption: question.isMultiOption || false
          });
        });
      });
      await updateScore(updatedQuestions);
    }
    setScoreUpdate(false);
  }, [updateScore, technicalQuestionResponses]);

  const handleResetScore = () => {
    setScoreUpdate(false);
    if (data?.questionDto) setTechnicalQuestionResponses(data.questionDto);
  };

  // Write latest handlers into parent-owned refs every render — no stale closures
  if (updateScoreRef) updateScoreRef.current = handleScoreUpdate;
  if (resetScoreRef) resetScoreRef.current = handleResetScore;

  React.useEffect(() => {
    onScoreDirtyChange?.(scoreUpdate);
  }, [scoreUpdate]);

  const PercentageRegex = /^[0-9]{1,3}$/;

  const canTakeApprovalAction = actionType === 'approval' && activityId && handleApprovalActivity && currentStage !== 'Commercial Approval';

  if (!vendors || !technicalQuestions || vendors.length === 0) {
    return <div>No technical comparative data available</div>;
  }

  return (
    <div className={styles.unifiedComparisonTable}>

      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: `${280 + vendors.length * 280}px` }}>

          {/* Header */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                <Typography className={styles.comparisonTitle}>Technical Evaluation</Typography>
                <Typography className={styles.comparisonSubTitle}>TOTAL VENDORS: {vendors.length}</Typography>
              </TableCell>

              {vendors.map((vendor, index) => (
                <TableCell key={vendor.id} className={styles.vendorHeaderCell}>
                  <div className={styles.vendorCard}>
                    {vendor.commercialRanking && (
                      <div className={`${styles.rankBadge} ${getRankClass(vendor.commercialRanking)}`}>
                        {vendor.commercialRanking}
                      </div>
                    )}
                    <div className={styles.vendorLabel}>VENDOR {String(index + 1).padStart(2, '0')}</div>
                    <Typography
                      className={styles.vendorNameNew}
                      onClick={() => handleSupplierModalOpen(vendor.id)}
                    >
                      {vendor.name?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                    </Typography>
                    <div className={styles.metaGrid} style={{ gridTemplateColumns: '1fr 1.8fr 1fr' }}>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Currency:</span>
                        <span className={styles.metaValue}>{vendor.acceptedCurrency || '—'}</span>
                      </div>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Date:</span>
                        <span className={styles.metaValue}>{vendor.label || '—'}</span>
                      </div>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Score:</span>
                        <span className={styles.metaValue}>{vendor.totalScore ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Question rows */}
          <TableBody>
            {technicalQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className={styles.subRowCell}>
                  <div className={styles.termInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography className={styles.termName}>
                        {question.questionDescription}
                        {question.mandatory === 1 && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                      </Typography>
                      {question.attachedFileName && (
                        <button
                          type="button"
                          title={getFileName(question.attachedFileName)}
                          className="pe-icon-btn"
                          onClick={() => downloadFilesOnAzure(question.attachedFileName, getFileName(question.attachedFileName), atoken)}
                          style={{ flexShrink: 0 }}
                        >
                          <HiDownload style={{ fontSize: '14px' }} />
                        </button>
                      )}
                    </div>
                    {question.questionRequirement && (
                      <Typography className={styles.termRemarks}>{question.questionRequirement}</Typography>
                    )}
                  </div>
                </TableCell>

                {vendors.map((vendor) => {
                  const vendorData = question.vendors[vendor.id];
                  const currentQuestion = technicalQuestionResponses.find(q => q.id === question.id);
                  const currentResponse = currentQuestion?.vendorQuestionResponse?.find(r => r.vendorId === vendor.id);
                  const currentScore = currentResponse?.score || 0;
                  const canUpdateScore = (vendorData?.updateScore || currentResponse?.updateScore || false) && !isNFA;

                  return (
                    <TableCell key={vendor.id} className={styles.dataCell}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {vendorData || currentResponse
                          ? formatAnswer(
                            vendorData?.answer || currentResponse?.answer || 'No Response',
                            vendorData?.attachedFileName || currentResponse?.ansAttachements
                          )
                          : <Typography className={styles.commercialValue}>No Response</Typography>
                        }
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Typography variant="caption" style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', flexShrink: 0 }}>
                            Score:
                          </Typography>
                          <TextField
                            size="small"
                            value={currentScore}
                            onChange={(e) => {
                              if (canUpdateScore) {
                                const val = e.target.value;
                                if (val !== "" && PercentageRegex.test(val)) {
                                  handleScoreChange(vendor.id, question.id, parseInt(val));
                                } else {
                                  handleScoreChange(vendor.id, question.id, 0);
                                }
                              }
                            }}
                            disabled={!canUpdateScore}
                            variant="outlined"
                            placeholder="0"
                            sx={{
                              width: '60px',
                              '& .MuiOutlinedInput-root': { height: '26px', fontSize: '12px', backgroundColor: !canUpdateScore ? '#f5f5f5' : 'inherit' },
                              '& .MuiOutlinedInput-input': { textAlign: 'center', padding: '3px 6px' }
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>

          {/* Approver Decisions section */}
          {approvers.length > 0 && (
            <TableBody>
              {/* Section label row */}
              <TableRow>
                <TableCell
                  className={styles.subRowCell}
                  sx={{ background: '#f8fafc', borderTop: '2px solid #e5e7eb', py: 1, px: 2 }}
                >
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                    Approver Decisions
                  </Typography>
                </TableCell>
                {vendors.map((vendor) => (
                  <TableCell key={vendor.id} sx={{ background: '#f8fafc', borderTop: '2px solid #e5e7eb' }} />
                ))}
              </TableRow>

              {approvers.map((approver) => (
                <TableRow key={approver.id} sx={{ backgroundColor: '#fff' }}>
                  <TableCell className={styles.subRowCell} sx={{ backgroundColor: '#fff' }}>
                    <Typography className={styles.termName}>
                      {approver.approverName}
                      {approver.approverName === userDetail?.name ? '(YOU)' : ''}</Typography>
                    <Typography className={styles.termRemarks}>
                      Level {approver.approverSeq} Approver
                    </Typography>
                  </TableCell>

                  {vendors.map((vendor) => {
                    const approvalData = getVendorApprovalData(approver, vendor.id);
                    const status = approvalData
                      ? (approvalData.approved === true ? 'Approved' : approvalData.approved === false ? 'Rejected' : 'Pending')
                      : null;
                    const isPending = status === 'Pending';

                    // No approvalData entry = vendor not yet acted on = effectively Pending
                    const effectivelyPending = !approvalData || isPending;

                    const isCurrentUser = approver.approverName === userDetail?.name;
                    const showActionButtons = effectivelyPending && canTakeApprovalAction && isCurrentUser;

                    return (
                      <TableCell key={vendor.id} className={styles.dataCell} sx={{ backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          {showActionButtons ? (
                            <Box sx={{ display: 'flex', justifyContent: "center", gap: 1, flexWrap: 'wrap', alignItems: 'center', margin: "auto" }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                sx={{ fontSize: '12px', py: 1, px: 4, minWidth: 0, textTransform: 'none', height: '28px', borderRadius: "8px" }}
                                onClick={() => {
                                  const supplierData = data?.suppliers?.find(s => s.vendorId === vendor.id);
                                  if (supplierData) handleApprovalActivity(supplierData, 'Approve');
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '12px', py: 1, px: 4, minWidth: 0, textTransform: 'none', height: '28px', borderRadius: "8px" }}
                                onClick={() => {
                                  const supplierData = data?.suppliers?.find(s => s.vendorId === vendor.id);
                                  if (supplierData) handleApprovalActivity(supplierData, 'Reject');
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          ) : approvalData || effectivelyPending ? (
                            <Chip
                              icon={
                                status === 'Approved' ? <MdOutlineCheck style={{ fontSize: '16px' }} /> :
                                status === 'Rejected' ? <MdClose style={{ fontSize: '16px' }} /> :
                                <FaRegCircleDot style={{ fontSize: '12px' }} />
                              }
                              label={status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Pending'}
                              size="small"
                              variant={effectivelyPending ? 'outlined' : 'filled'}
                              color={status === 'Rejected' ? 'error' : effectivelyPending ? 'default' : 'primary'}
                              sx={{ fontSize: '10px', height: '22px', width: 'fit-content', fontWeight: 700, padding: "10px", borderRadius:"6px" }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          )}

                          {approvalData?.remarks && (
                            <Typography className={styles.commercialValue} style={{ fontSize: '11px', color: '#6b7280' }}>
                              {approvalData.remarks}
                            </Typography>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          )}

        </Table>
      </TableContainer>
    </div>
  );
};

export default TechnicalComparative;
