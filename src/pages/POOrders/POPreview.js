import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { getEventApproversFind } from '../../utils/common/utility';
import { segregatedEventapprover } from '../../utils/common';

const POPreview = ({ poDetails, poItems, atoken, requestCell, stagelist, customerid }) => {
    const [approverList, setApproverList] = useState([]);
    const [nfaApproverList, setNfaApproverList] = useState([]);

    // Fetch NFA approval workflow data if nfaId exists
    useEffect(() => {
        if (poDetails?.nfaId && atoken && customerid) {
            const nfaRequestCell = {
                EventId: poDetails.nfaId,
                EventType: "NFA",
                SortingColumn: "ApproverSeq",
                CustomerId: customerid,
                Version: 1
            };
            getEventApproversFind(nfaRequestCell, atoken).then((res) => {
                if (res && res.length > 0) {
                    setNfaApproverList(res);
                }
            });
        }
    }, [poDetails?.nfaId, atoken, customerid]);

    // Fetch PO approval workflow data
    useEffect(() => {
        if (requestCell?.EventId > 0 && stagelist && atoken) {
            const dataRequest = { ...requestCell, Version: 1 };
            getEventApproversFind(dataRequest, atoken).then((res) => {
                if (res && stagelist) {
                    const stagelistworkflow = stagelist.filter(x => x.isActive).filter(x => x.wfname).map(x => x.wfname);
                    const updatedvalue = segregatedEventapprover(res, stagelistworkflow);
                    if (updatedvalue?.length) {
                        setApproverList(res || []);
                    }
                }
            });
        }
    }, [requestCell, stagelist, atoken]);
    // Calculate total
    const totalAmount = poItems?.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0) || 0;
    const itemCount = poItems?.length || 0;

    // Format date helper - without timezone conversion to prevent date shifting
    const formatDate = (date) => {
        if (!date) return '-';
        try {
            // Parse the date without timezone conversion
            const dateObj = new Date(date);
            // Use toLocaleDateString to format without timezone shifting
            // This ensures the displayed date matches what was entered
            return dateObj.toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    // Format number with commas
    const formatNumber = (num) => {
        if (!num && num !== 0) return '-';
        return parseFloat(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Convert number to words (for Indian numbering system)
    const numberToWords = (num) => {
        if (!num) return '';
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        
        const convertLessThanThousand = (n) => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;

        let result = '';
        if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
        if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
        if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
        if (remainder > 0) result += convertLessThanThousand(remainder);

        return result.trim();
    };

    return (
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Card sx={{ maxWidth: 1200, margin: '0 auto', boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Header with Logo and Title */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, pb: 2, borderBottom: 'none' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                {poDetails?.legalEntity || ''}
                            </Typography>
                         
                        </Box>
                        {/* <Box sx={{ textAlign: 'center', border: '1px solid #000', p: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>PURCHASE ORDER</Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                PR Requester: {poDetails?.createdByName || '-'}
                            </Typography>
                        </Box> */}
                    </Box>

                    {/* Main Details Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
    <Table size="small">
        <TableBody>
            <TableRow>
                {/* Supplier/Bill To */}
                <TableCell sx={{ width: '33%', verticalAlign: 'top', p: 1.5, fontSize: '0.75rem' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>
                        Bill To:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        {poDetails?.billToAddress}<br />
                        {poDetails?.billToCity}
                        {poDetails?.billToState ? `, ${poDetails.billToState}` : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                        <strong>Email ID:</strong><br />
                        Contact No.: {poDetails?.billToPhone}
                    </Typography>

                    {/* Our Contact Details moved here */}
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                        Contact Person: {poDetails?.createdByName || '-'}<br />
                        Email: {poDetails?.createdByEmail || '-'}<br />
                        Tel: {poDetails?.shipToPhone || '-'}<br />
                        Fax: -
                    </Typography>

                </TableCell>

                {/* Ship To */}
                <TableCell sx={{ width: '33%', verticalAlign: 'top', p: 1.5, fontSize: '0.75rem' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>
                        Ship To:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        {poDetails?.shipToAddress}<br />
                        {poDetails?.shipToCity}
                        {poDetails?.shipToState ? `, ${poDetails.shipToState}` : ''}
                    </Typography>

                    {/* Our Local Details + PR Requester */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mt: 1, mb: 0.5 }}>
                        Our Local Details:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        GST NO. : -<br />
                        PAN NO. : -<br />
                        PR Requester: {poDetails?.createdByName || '-'}
                    </Typography>
                </TableCell>

                {/* PO Details / Supplier */}
                <TableCell sx={{ width: '34%', verticalAlign: 'top', p: 1.5, fontSize: '0.75rem' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>
                        Supplier Local Details:
                    </Typography>

                    {/* Supplier Name */}
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                        Supplier: {poDetails?.vendorName || '-'}
                    </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
        Company Name: {poDetails?.company || '-'}
    </Typography>

                    {/* PO Details */}
                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        <strong>PO No:</strong> {poDetails?.poNumber || '-'}<br />
                        PO Date: {formatDate(poDetails?.pO_Date || poDetails?.createdOn)}<br />
                        Payment Terms: {poDetails?.payTerms || '-'}<br />
                        INCO Terms: {poDetails?.incoTerms || '-'}<br />
                        Currency: {poDetails?.currency || 'INR'}<br />
                        Supplier Quote Ref: {poDetails?.supplierRef || '0'}<br />
                        Expiry Date: {formatDate(poDetails?.confirmedDelDate)}
                    </Typography>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</TableContainer>

                    {/* NFA Approval Workflow Table */}
                    {nfaApproverList && nfaApproverList.length > 0 && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>Requested</TableCell>
                                        {nfaApproverList.slice(0, 4).map((_, idx) => (
                                            <TableCell key={idx} sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>Approved</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* Name Row */}
                                    <TableRow>
                                        <TableCell rowSpan={2} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5, verticalAlign: 'middle' }}>
                                            {poDetails?.createdByName || '-'}
                                        </TableCell>
                                        {nfaApproverList.slice(0, 4).map((approver, idx) => (
                                            <TableCell key={idx} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                                {approver.approverName || approver.ApproverName || '-'}<br />
                                                {approver.designation && (
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666', fontStyle: 'italic' }}>
                                                        Designation: {approver.designation}
                                                    </Typography>
                                                )}
                                                {approver.remarks && (
                                                    <>
                                                        <br />
                                                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666' }}>
                                                            <strong>Remarks:</strong> {approver.remarks}
                                                        </Typography>
                                                    </>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {/* Date Row */}
                                    <TableRow>
                                        {nfaApproverList.slice(0, 4).map((approver, idx) => (
                                            <TableCell key={idx} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                                {approver.completionDt && formatDate(approver.completionDt)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* PO Approval Workflow Table */}
                    {approverList && approverList.length > 0 && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>Requested</TableCell>
                                        {approverList.slice(0, 4).map((_, idx) => (
                                            <TableCell key={idx} sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>Approved</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                            {requestCell?.EventType || 'PO'}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                            {poDetails?.createdByName || '-'}<br />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666' }}>
                                                {formatDate(poDetails?.createdOn)}
                                            </Typography>
                                        </TableCell>
                                        {approverList.slice(0, 4).map((approver, idx) => (
                                            <TableCell key={idx} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                                {approver.ApproverName || '-'}<br />
                                                {approver.ApprovedOn && (
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666' }}>
                                                        {formatDate(approver.ApprovedOn)}
                                                    </Typography>
                                                )}
                                                {approver.SignatureImagePath && (
                                                    <Box component="img" src={approver.SignatureImagePath} alt="Signature" sx={{ maxHeight: 30, mt: 0.5 }} />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Item Count */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>
                        Total No of items: {itemCount}
                    </Typography>

                    {/* Items Table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Sr</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Item Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Item Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>PR No.</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>PO Delivery Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1, textAlign: 'right' }}>Quantity</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>UOM</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1, textAlign: 'right' }}>Unit Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1, textAlign: 'right' }}>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {poItems && poItems.length > 0 ? (
                                    poItems.map((item, index) => (
                                        <TableRow key={item.id || index}>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{index + 1}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{item.itemCode || '-'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{item.itemDesc || '-'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{item.itemType || '-'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{item.purchaseRequisition || '-'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{formatDate(item.poDeliveryDate)}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1, textAlign: 'right' }}>{formatNumber(item.quantity)}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>{item.uom || '-'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1, textAlign: 'right' }}>{formatNumber(item.materialPONetPrice)}</TableCell>
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1, textAlign: 'right' }}>{formatNumber(item.totalAmount)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ fontSize: '0.75rem', p: 2 }}>
                                            No items available
                                        </TableCell>
                                    </TableRow>
                                )}
                                {/* Total Row */}
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell colSpan={9} sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1, textAlign: 'right' }}>
                                        {numberToWords(Math.floor(totalAmount))}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1, textAlign: 'right' }}>
                                        Total: {formatNumber(totalAmount)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Terms and Conditions */}
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1, color: '#d32f2f' }}>
                            Terms:
                        </Typography>
                        <Box sx={{ fontSize: '0.7rem', color: '#d32f2f' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                <strong>1. Payment Terms =</strong> {poDetails?.termsOfPayment || '-'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default POPreview;
