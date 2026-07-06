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
import CommonTooltip from '../../commonTooltip';
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
    const displayValue = formatValue(answer);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        <CommonTooltip title={displayValue !== '-' ? displayValue : ''} placement="bottom">
          <Typography className={styles.commercialValue} noWrap style={{ textAlign: 'left', maxWidth: '100%', flex: 1 }}>
            {displayValue}
          </Typography>
        </CommonTooltip>
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

  const tableMinWidth = `${280 + vendors.length * 280}px`;

  return (
    <div className={styles.unifiedComparisonTable} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Top: Technical Evaluation — fills remaining space, internally scrollable */}
      <TableContainer sx={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'auto', background: '#fff', border: '1px solid #d8dde6', borderBottom: 'none', borderRadius: '6px 6px 0 0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Table size="small" sx={{ minWidth: tableMinWidth }}>

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
                    <div className={styles.vendorLabel}>VENDOR {String(index + 1).padStart(2, '0')}</div>
                    <CommonTooltip title={vendor.name?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || ''} placement="bottom">
                      <Typography
                        className={styles.vendorNameNew}
                        noWrap
                        onClick={() => handleSupplierModalOpen(vendor.id)}
                      >
                        {vendor.name?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                      </Typography>
                    </CommonTooltip>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <CommonTooltip title={question.questionDescription || ''} placement="bottom">
                        <Typography className={styles.termName} noWrap style={{ flex: 1 }}>
                          {question.questionDescription}
                          {question.mandatory === 1 && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                        </Typography>
                      </CommonTooltip>
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
                      <CommonTooltip title={question.questionRequirement} placement="bottom">
                        <Typography className={styles.termRemarks} noWrap>{question.questionRequirement}</Typography>
                      </CommonTooltip>
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

        </Table>
      </TableContainer>

      {/* Bottom: Approver Decisions — fixed height, stuck to bottom */}
      {approvers.length > 0 && (
        <TableContainer sx={{ flexShrink: 0, overflowX: 'auto', overflowY: 'auto', background: '#fff', border: '1px solid #d8dde6', borderTop: '2px solid #e5e7eb', borderRadius: '0 0 6px 6px' }}>
          <Table size="small" sx={{ minWidth: tableMinWidth }}>
            <TableBody>
              {/* Section label row */}
              <TableRow>
                <TableCell
                  className={styles.subRowCell}
                  sx={{ background: '#f3f4f6', py: 1, px: 2, borderRight: '1px solid #e5e7eb' }}
                >
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                    Approver Decisions
                  </Typography>
                </TableCell>
                {vendors.map((vendor) => (
                  <TableCell key={vendor.id} sx={{ background: '#f8fafc' }} />
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

                    const effectivelyPending = !approvalData || isPending;

                    const isCurrentUser = approver.approverName === userDetail?.name;
                    const showActionButtons = effectivelyPending && canTakeApprovalAction && isCurrentUser;

                    return (
                      <TableCell key={vendor.id} className={styles.dataCell} sx={{ backgroundColor: '#fff', }}>
                        {showActionButtons ? (
                          <Box sx={{ display: 'flex', justifyContent: "center", gap: 1, alignItems: 'center', }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              sx={{ fontSize: '12px', width: "100%", textTransform: 'none', height: '28px', borderRadius: "8px" }}
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
                              color="error"
                              sx={{ fontSize: '12px', width: "100%", textTransform: 'none', height: '28px', borderRadius: "8px" }}
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
                              status === "Approved" ? (<MdOutlineCheck style={{ fontSize: 16 }} />)
                                : status === "Rejected" ? (<MdClose style={{ fontSize: 16 }} />)
                                  : (<FaRegCircleDot style={{ fontSize: 12 }} />)
                            }
                            label={
                              status === "Approved"
                                ? "Approved"
                                : status === "Rejected"
                                  ? "Rejected"
                                  : "Pending"
                            }
                            size="small"
                            sx={{
                              height: "24px",
                              borderRadius: "8px",
                              px: "6px",
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              width: "fit-content",

                              ...(status === "Approved" && {
                                backgroundColor: "#D8ECDA",
                                color: "#2F562D",

                                "& .MuiChip-icon": {
                                  color: "#2F562D",
                                  marginLeft: "8px",
                                },
                              }),

                              ...(status === "Rejected" && {
                                backgroundColor: "#FDE5E6",
                                color: "#C61515",

                                "& .MuiChip-icon": {
                                  color: "#C61515",
                                  marginLeft: "8px",
                                },
                              }),

                              ...(effectivelyPending && {
                                backgroundColor: "#F9E692",
                                color: "#864721",

                                "& .MuiChip-icon": {
                                  color: "#864721",
                                  marginLeft: "8px",
                                },
                              }),
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}

                        {approvalData?.remarks && (
                          <Typography className={styles.commercialValue} style={{ fontSize: '11px', color: '#6b7280' }}>
                            {approvalData.remarks}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default TechnicalComparative;
