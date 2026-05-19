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
import { downloadFilesOnAzure ,getFileName} from '../../../utils/common';
import { useStateValue } from '../../../store';
import { formatDateViaLocale, formatDateViaLocale2, formatDateViaLocalet, formatDateViaTime, formatDateViaTimeZone, formattimeoption, renderHtmlAsText } from '../../../utils/common/utility';

const TechnicalComparative = ({ data, updateScore, handleApprovalActivity ,actionType, activityId, handleSupplierModalOpen ,isNFA,currentStage}) => {
  const [{ atoken, rtoken, customerid, usertimezone, customersuffix, userdialingcode, roleClaims, userDetail }, dispatch] = useStateValue();
  // State for managing score updates
  const [scoreUpdate, setScoreUpdate] = useState(false);
  const [technicalQuestionResponses, setTechnicalQuestionResponses] = useState([]);

  // Transform tempTechnicalData to match the component's expected structure
  const transformedData = useMemo(() => {
    if (!data?.suppliers || !data?.questionDto) {
      return { vendors: [], technicalQuestions: [] };
    }

    // Transform suppliers to vendors format
    const vendors = data.suppliers.map(supplier => ({
      id: supplier.vendorId,
      name: supplier.companyName,
      // label: new Date(supplier.responseDate).toLocaleDateString('en-US', {
      //   year: 'numeric',
      //   month: 'short',
      //   day: 'numeric',
      //   hour: '2-digit',
      //   minute: '2-digit'
      // }),
      label: formatDateViaLocale(supplier.responseDate, userDetail),
      commercialRanking: `L${supplier.ranking || 1}`,
      acceptedCurrency: supplier.acceptedCurrency,
      techStatus: supplier.techStatus
    }));

    // Transform questionDto to technicalQuestions format
    const technicalQuestions = data.questionDto.map(question => {
      const vendorsObj = {};
      
      // Map each vendor's response for this question
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
  // Initialize local state when data changes
  React.useEffect(() => {
    if (data?.questionDto && data?.suppliers && !scoreUpdate) {
      setTechnicalQuestionResponses(data.questionDto);
    }
  }, [data, scoreUpdate]);

  const getRankingBadgeClass = (ranking) => {
    switch (ranking) {
      case 'L1': return styles.l1Badge;
      case 'L2': return styles.l2Badge;
      case 'L3': return styles.l3Badge;
      default: return styles.l1Badge;
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') {
      return '-';
    }
    return value;
  };

  const getVendorApprovalData = (approver, vendorId) => {
    return approver?.supplierTechAppData?.find(v => v.vendorId === vendorId);
  };

  const formatAnswer = (answer, attachedFileName) => {
    const truncatedAnswer = answer && answer.length > 80 
      ? `${answer.substring(0, 80)}...` 
      : answer;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography className={styles.commercialValue}>
          {formatValue(truncatedAnswer)}
        </Typography>
        {attachedFileName && (
          <div 
            title={getFileName(attachedFileName)}
            style={{ 
              cursor: 'pointer', 
              fontSize: '14px', 
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <HiDownload
              onClick={() => downloadFilesOnAzure(attachedFileName,getFileName(attachedFileName),atoken)} 
              style={{ cursor: "pointer" }}
            />
          </div>
        )}
      </div>
    );
  };

  const handleScoreChange = (vendorId, questionId, newScore) => {
    setScoreUpdate(true);
    
    // Update the local state with the new score
    setTechnicalQuestionResponses(prevQuestions =>
      prevQuestions.map(question =>
        question.id === questionId
          ? {
              ...question,
              vendorQuestionResponse: question.vendorQuestionResponse?.map(response =>
                response.vendorId === vendorId
                  ? { ...response, score: newScore }
                  : response
              )
            }
          : question
      )
    );
  };

  const handleScoreUpdate = useCallback(async () => {
    if (updateScore && technicalQuestionResponses) {
      // Create the updated questions array for the API
      const updatedQuestions = [];
      
      technicalQuestionResponses.forEach(question => {
        question.vendorQuestionResponse?.forEach(response => {
          const updatedQuestion = {
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
          };
          updatedQuestions.push(updatedQuestion);
        });
      });

      // Call the updateScore function
      await updateScore(updatedQuestions);
    }
    setScoreUpdate(false);
  }, [updateScore, technicalQuestionResponses]);

  const handleResetScore = () => {
    setScoreUpdate(false);
    // Reset to original data
    if (data?.questionDto) {
      setTechnicalQuestionResponses(data.questionDto);
    }
  };

  const PercentageRegex = /^[0-9]{1,3}$/;

  if (!vendors || !technicalQuestions || vendors.length === 0) {
    return <div>No technical comparative data available</div>;
  }

  return (
    <div className={styles.unifiedComparisonTable}>
      {/* Update/Reset Buttons */}
      {scoreUpdate && !isNFA && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'flex-end' }}>
          <Button 
            className='f10' 
            variant='text' 
            color="primary" 
            size='small' 
            onClick={handleResetScore}
          >
            Reset Score
          </Button>
          <Button 
            className='f10' 
            variant='outlined' 
            size='small' 
            type='button' 
            onClick={handleScoreUpdate}
            disabled={!scoreUpdate}
          >
            Update Score
          </Button>
        </Box>
      )}
      
      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: `${280 + (vendors.length * 280)}px` }}>
          {/* Header */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                TECHNICAL EVALUATION
              </TableCell>
              {vendors.map((vendor, index) => (
                <TableCell 
                  key={vendor.id} 
                  className={`${styles.headerCell} ${styles.vendorHeader}`}
                  style={{ position: 'relative' }}
                >
                  {/* {vendor.commercialRanking && (
                    <Chip 
                      label={vendor.commercialRanking} 
                      className={getRankingBadgeClass(vendor.commercialRanking)}
                      size="small"
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        zIndex: 1,
                        minWidth: '32px',
                        height: '20px',
                        fontSize: '10px'
                      }}
                    />
                  )} */}
                  
                  {/* Take Action Button - Top Right */}
                  {vendor.techStatus == 'Pending' && actionType === 'approval' && activityId && handleApprovalActivity && 
                  currentStage != 'Commercial Approval' &&
                  (
                    <Typography
                      variant="contained"
                      size="large"
                      onClick={() => {
                        // Find the original supplier data from the data prop
                        const supplierData = data?.suppliers?.find(s => s.vendorId === vendor.id);
                        if (supplierData) {
                          handleApprovalActivity(supplierData);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 4,
                        right: 4,
                        zIndex: 1,
                        color: 'red',
                        fontSize: '10px',
                        padding: '4px 8px',
                        minWidth: 'auto',
                        textTransform: 'capitalize'
                      }}
                    >
                      Pending
                    </Typography>
                  )}
                  
                  <div>
                    <div className={styles.vendorNameContainer} style={{ paddingTop: vendor.commercialRanking ? '8px' : '0' }}>
                      <Typography 
                        className={styles.vendorName}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSupplierModalOpen(vendor.id)}
                      >
                        {vendor.name}
                      </Typography>
                    </div>
                    <Typography className={styles.vendorSubmission}>
                      {vendor.acceptedCurrency && (
                        <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {vendor.acceptedCurrency}
                        </span>
                      )}
                      {vendor.acceptedCurrency && ' • '}{vendor.label}
                    </Typography>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {technicalQuestions.map((question) => (
              <TableRow key={question.id} className={styles.dataRow}>
                <TableCell className={styles.subRowCell}>
                  <div className={styles.termInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography className={styles.termName}>
                        {question.questionDescription}
                        {question.mandatory === 1 && (
                          <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>
                        )}
                      </Typography>
                      {question.attachedFileName && (
                        <div 
                          title={getFileName(question.attachedFileName)}
                          style={{ 
                            cursor: 'pointer', 
                            fontSize: '14px', 
                            color: '#1976d2',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                        <HiDownload
                          onClick={() => downloadFilesOnAzure(question.attachedFileName,getFileName(question.attachedFileName), atoken)}
                          style={{ cursor: "pointer" }}
                        />
                        </div>
                      )}
                    </div>
                    <Typography className={styles.termRemarks}>
                      {question.questionRequirement}
                    </Typography>
                  </div>
                </TableCell>
                {vendors.map((vendor) => {
                  const vendorData = question.vendors[vendor.id];
                  // Get the current score from local state
                  const currentQuestion = technicalQuestionResponses.find(q => q.id === question.id);
                  const currentResponse = currentQuestion?.vendorQuestionResponse?.find(r => r.vendorId === vendor.id);
                  const currentScore = currentResponse?.score || 0;
                  // Check if score update is allowed for this vendor response
                  const canUpdateScore = (vendorData?.updateScore || currentResponse?.updateScore || false) && !isNFA;
                  
                  return (
                    <TableCell key={vendor.id} className={styles.dataCell}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* Answer Content */}
                        <div style={{ flex: 1 }}>
                          {vendorData || currentResponse ? (
                            formatAnswer(
                              vendorData?.answer || currentResponse?.answer || 'No Response',
                              vendorData?.attachedFileName || currentResponse?.ansAttachements
                            )
                          ) : (
                            <Typography className={styles.commercialValue}>
                              No Response
                            </Typography>
                          )}
                        </div>
                        
                        {/* Score Input Field on the right */}
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          minWidth: '80px'
                        }}>
                          <Typography 
                            variant="caption" 
                            style={{ 
                              fontSize: '11px', 
                              fontWeight: 'bold', 
                              marginBottom: '4px',
                              color: '#666'
                            }}
                          >
                            Score:
                          </Typography>
                          <TextField
                            size="small"
                            value={currentScore}
                            onChange={(e) => {
                              if (canUpdateScore) {
                                const newScore = e.target.value;
                                if (newScore !== "" && PercentageRegex.test(newScore)) {
                                  handleScoreChange(vendor.id, question.id, parseInt(newScore));
                                } else {
                                  handleScoreChange(vendor.id, question.id, 0);
                                }
                              }
                            }}
                            disabled={!canUpdateScore}
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            placeholder="0"
                            style={{ 
                              width: '70px',
                              '& .MuiOutlinedInput-root': {
                                height: '32px'
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '32px',
                                fontSize: '13px',
                                backgroundColor: !canUpdateScore ? '#f5f5f5' : 'inherit'
                              },
                              '& .MuiOutlinedInput-input': {
                                textAlign: 'center',
                                padding: '6px 8px'
                              }
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
          {/* Footer - Technical Approvals */}
          {approvers.length > 0 && (
            <TableBody>
              {approvers.map((approver) => (
                <TableRow key={approver.id} className={styles.dataRow}>
                  
                  {/* Approver Name Column */}
                  <TableCell className={styles.subRowCell}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      {approver.approverName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Approver (Level {approver.approverSeq})
                    </Typography>
                  </TableCell>

                  {/* Vendor-wise Approval Data */}
                  {vendors.map((vendor) => {
                    const approvalData = getVendorApprovalData(approver, vendor.id);
                    return (
                      <TableCell key={vendor.id} className={styles.dataCell}>
                        {approvalData ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {/* Remarks */}
                            <div style={{ flex: 1 }}>
                              {/* <Typography variant="caption"> */}
                                {approvalData && approvalData.remarks ? formatAnswer(approvalData.remarks) : '-'}
                              {/* </Typography> */}
                            </div>
                            {/* Status */}
                            <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          minWidth: '80px'
                        }}>
                            <Chip
                              label={approvalData.approved == true ? 'Approved' : approvalData.approved == false ? 'Rejected' : 'Pending'}
                              size="small"
                              color={approvalData.approved == true ? 'success' : approvalData.approved == false ? 'error' : 'default'}
                              style={{ width: 'fit-content' }}
                            />
                        </div>
                          </div>
                        ) : (
                          <Typography variant="caption">-</Typography>
                        )}
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