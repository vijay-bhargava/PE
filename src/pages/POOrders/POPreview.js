import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { getEventApproversFind } from '../../utils/common/utility';
import { segregatedEventapprover } from '../../utils/common';
import { getCustomerAssets } from '../../utils/apiConstants';

const POPreview = ({ poDetails, poItems, atoken, requestCell, stagelist, customerid, customersuffix }) => {

    const [approverList, setApproverList] = useState([]);
    const [assetData, setAssetData] = useState(null);

    // Fetch customer assets (logo)
    useEffect(() => {
        if (customersuffix) {
            const data = {
                suffix: customersuffix === 'undefined' ? '' : customersuffix,
            };
            getCustomerAssets(data).then((res) => {
                if (res && res !== 0) {
                    setAssetData(res);
                }
            });
        }
    }, [customersuffix]);

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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: 'none' }}>
                        {/* Customer Logo */}
                        <Box sx={{ flex: 1 }}>
                            {assetData?.imgLogo ? (
                                <img src={assetData.imgLogo} alt="Company Logo" style={{ height: '60px', maxWidth: '150px', objectFit: 'contain' }} />
                            ) : (
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                                    {poDetails?.legalEntity || ''}
                                </Typography>
                            )}
                        </Box>

                        {/* Purchase Order Title */}
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#000' }}>
                                PURCHASE ORDER
                            </Typography>
                        </Box>

                        {/* Spacer */}
                        <Box sx={{ flex: 1 }}></Box>
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
                                        {(poDetails?.billToPAN || poDetails?.billToGST) && (
                                            <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                                {poDetails?.billToPAN && <><strong>PAN:</strong> {poDetails.billToPAN}<br /></>}
                                                {poDetails?.billToGST && <><strong>GST:</strong> {poDetails.billToGST}</>}
                                            </Typography>
                                        )}
                                        {/* <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                        <strong>Email ID:</strong><br />
                        Contact No.: {poDetails?.billToPhone}
                    </Typography> */}

                                        {/* Our Contact Details moved here */}
                                        <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                            Contact Person: {poDetails?.createdByName || '-'}<br />
                                            Email: {poDetails?.createdByEmail || '-'}<br />
                                            {/* Tel: {poDetails?.shipToPhone || '-'}<br />
                        Fax: - */}
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
                                        {(poDetails?.shipToPAN || poDetails?.shipToGST) && (
                                            <Typography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                                {poDetails?.shipToPAN && <><strong>PAN:</strong> {poDetails.shipToPAN}<br /></>}
                                                {poDetails?.shipToGST && <><strong>GST:</strong> {poDetails.shipToGST}</>}
                                            </Typography>
                                        )}

                                        {/* Our Supplier Details + PR Requester */}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mt: 1, mb: 0.5 }}>
                                            PO Details:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                            PR Requester: {poDetails?.createdByName || '-'}<br />
                                            PO No: {poDetails?.externalSourcePONumber || poDetails?.poNumber || '-'}<br />
                                            PO Date: {formatDate(poDetails?.pO_Date || poDetails?.createdOn)}<br />
                                            {/* Payment Terms: {poDetails?.payTerms || '-'}<br /> */}
                                            {/* INCO Terms: {poDetails?.incoTerms || '-'}<br /> */}
                                            Currency: {poDetails?.currency || ''}<br />
                                            {/* Supplier Quote Ref: {poDetails?.supplierRef || '0'}<br /> */}
                                            Expiry Date: {formatDate(poDetails?.expiryDate)}

                                        </Typography>
                                    </TableCell>

                                    {/* PO Details / Supplier */}
                                    {/* PO Details / Supplier */}
                                    <TableCell
                                        sx={{
                                            width: '34%',
                                            verticalAlign: 'top',
                                            p: 1.5,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                mb: 0.5
                                            }}
                                        >
                                            Supplier Local Details:
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: '0.75rem',
                                                mb: 1
                                            }}
                                        >
                                            Company Name: {poDetails?.company || '-'}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: '0.75rem',
                                                mb: 0.5
                                            }}
                                        >
                                            Supplier Contact Name: {poDetails?.vendorName || '-'}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: '0.7rem',
                                                lineHeight: 1.4
                                            }}
                                        >
                                            <strong>GST No:</strong> {poDetails?.supplierGST || '-'}
                                            <br />

                                            <strong>PAN No:</strong> {poDetails?.panNumber || '-'}
                                            <br />

                                            <strong>Supplier Code:</strong> {poDetails?.partnerNumber || '-'}
                                            {poDetails?.supplierAddress && (
                                                <>
                                                    <br />

                                                    {(() => {
                                                        const address = poDetails.supplierAddress.trim();
                                                        const commaIndex = address.indexOf(',');

                                                        const firstLine =
                                                            commaIndex !== -1
                                                                ? address.substring(0, commaIndex + 1).trim()
                                                                : address;

                                                        const secondLine =
                                                            commaIndex !== -1
                                                                ? address.substring(commaIndex + 1).trim()
                                                                : '';

                                                        return (
                                                            <Box
                                                                sx={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: 'auto 5px 1fr',
                                                                    fontSize: '0.7rem',
                                                                    lineHeight: 1.4
                                                                }}
                                                            >
                                                                <strong>Supplier Address :</strong>
                                                                <span></span>

                                                                <span>
                                                                    {firstLine}
                                                                    {secondLine && (
                                                                        <>
                                                                            <br />
                                                                            {secondLine}
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </Box>
                                                        );
                                                    })()}
                                                </>
                                            )}




                                        </Typography>
                                    </TableCell>





                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* PO Approval Workflow Table */}
                    {approverList && approverList.length > 0 && (
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>PO Requested</TableCell>
                                        {approverList.slice(0, 4).map((_, idx) => (
                                            <TableCell key={idx} sx={{ fontWeight: 700, fontSize: '0.75rem', border: '1px solid #ddd', p: 0.5 }}>PO Approved</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/* Name Row */}
                                    <TableRow>
                                        {/* <TableCell rowSpan={2} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5, verticalAlign: 'middle' }}>
                                            {poDetails?.createdByName || '-'}
                                        </TableCell> */}
                                        <TableCell
                                            rowSpan={2}
                                            sx={{
                                                fontSize: '0.7rem',
                                                border: '1px solid #ddd',
                                                p: 0.5,
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            <Typography sx={{ fontSize: '0.7rem' }}>
                                                {poDetails?.createdByName || '-'}
                                            </Typography>

                                            <Typography sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                                {formatDate(poDetails?.createdOn)}
                                            </Typography>
                                        </TableCell>
                                        {approverList.slice(0, 4).map((approver, idx) => (
                                            <TableCell key={idx} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                                {approver.approverName || approver.ApproverName || '-'}<br />
                                                {approver.designation && (
                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666', fontStyle: 'italic' }}>
                                                        Designation: {approver.designation}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {/* Date Row */}
                                    <TableRow>
                                        {approverList.slice(0, 4).map((approver, idx) => (
                                            <TableCell key={idx} sx={{ fontSize: '0.7rem', border: '1px solid #ddd', p: 0.5 }}>
                                                {(approver.status === 'Approved' || approver.status === 'Complete' || approver.approvalStatus === 'Approved') ? formatDate(approver.completionDt) : '-'}
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
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Item Code</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Item No.</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', p: 1 }}>Item Name</TableCell>
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
                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {index + 1}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.itemCode || '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.lineItemNo ?? '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.itemName || '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.itemDesc || '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.itemType || '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.purchaseRequisition || '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {formatDate(item.poDeliveryDate)}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1, textAlign: 'right' }}>
                                                {formatNumber(item.quantity)}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1 }}>
                                                {item.uom || '-'}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1, textAlign: 'right' }}>
                                                {formatNumber(item.materialPOUnitPrice)}
                                            </TableCell>

                                            <TableCell sx={{ fontSize: '0.7rem', p: 1, textAlign: 'right' }}>
                                                {formatNumber(item.totalAmount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={12} align="center" sx={{ fontSize: '0.75rem', p: 2 }}>
                                            No items available
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* Total Row */}
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell
                                        colSpan={11}
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            p: 1,
                                            textAlign: 'right'
                                        }}
                                    >
                                        {numberToWords(Math.floor(totalAmount))}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            p: 1,
                                            textAlign: 'right'
                                        }}
                                    >
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

                    {/* PO Conditions */}
                    {poDetails?.poConditions && poDetails.poConditions.length > 0 && (
                        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1, color: '#d32f2f' }}>
                                PO Conditions:
                            </Typography>
                            <Box sx={{ fontSize: '0.7rem', color: '#d32f2f' }}>
                                {poDetails.poConditions.map((condition, index) => (
                                    <Typography key={index} variant="body2" sx={{ fontSize: '0.7rem', mb: 0.5 }}>
                                        <strong>{index + 1}. {condition.conditionCategory || 'Condition'} =</strong>{' '}
                                        {condition.conditionText && condition.conditionText.trim()
                                            ? condition.conditionText
                                            : (condition.conditionValue !== null && condition.conditionValue !== undefined && condition.conditionValue !== ''
                                                ? `${condition.conditionValue}`
                                                : '-')}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
                    {!poDetails?.externalSourcePONumber && (

                        <>
                            {/* Annexure - A: General Terms and Conditions */}
                            <Box sx={{ mt: 3, pageBreakBefore: 'always' }}>
                                <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', mb: 2, textDecoration: 'underline' }}>
                                    ANNEXURE - A -<br />
                                    GENERAL TERMS AND CONDITIONS OF PURCHASE ORDERS
                                </Typography>

                                <Box sx={{ fontSize: '0.7rem', lineHeight: 1.6 }}>
                                    {/* Section 1: Scope and Acceptance */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        1. Scope and Acceptance
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> This document "General terms and Conditions of Purchase (GTC)" apply to all written and oral purchase orders and amendments thereto (collectively referred to as "Order" issued ) to the extent no other definitive agreements have been explicitly made. GTC is binding on the Supplier along-with the definitive agreement. In the event of a conflict between the definitive agreement and GTC then the terms and conditions of the definitive agreement shall prevail over GTC to the extent of repugnancy only.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> All goods and services (whether or not ancillary to a sale of goods) to be provided under an Order are included in the term "Goods".
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> Supplier/Vendor has read and understands this Order and agrees that Supplier's written acceptance or commencement of any work or service under this Order shall constitute Supplier's acceptance of these terms and conditions only.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>d.</strong> The Supplier's general terms and conditions shall not be applicable unless POSCO has explicitly approved in writing.
                                        </Typography>
                                    </Box>

                                    {/* Section 2: Delivery of Goods and Services */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        2. Delivery of Goods and Services
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> The Supplier shall, at its own expense, pack, load, and deliver goods to the delivery point as specified by POSCO and in accordance with the invoicing, delivery terms, shipping, packing, and other instructions printed on the face of the Order or otherwise provided to the Supplier by POSCO in writing.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> No charges will be allowed for freight, transportation, insurance, shipping, storage, handling, demurrage, cartage, packaging or similar charges unless provided for in the applicable Order or otherwise agreed to in writing by POSCO.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> Supplier shall mark each package with proper label/tagging with all other requirements outlined in Supplier quality manual or in accordance with the instructions of POSCO.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>d.</strong> All shipments must also have a packing slip showing the Order number and exact quantity and description of Goods shipped. Supplier shall forward the original bill of lading or other shipping receipt including proper classifications for identification of the material for each shipment in accordance with the instructions of POSCO.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>e.</strong> Supplier shall ensure that regarding import goods the shipping documents shall record whether the goods are duty-paid or duty-unpaid.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>f.</strong> Time is of the essence with respect to delivery of the goods and performance of the services. Goods shall be delivered and Services to be performed as per the delivery schedule. The Supplier must immediately notify POSCO if Supplier is likely to be unable to meet the delivery schedule.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>g.</strong> At any time prior to the actual delivery, POSCO may, upon notice to the Supplier, cancel or change the Order, or any portion thereof, for any reason, including, without limitation, for the convenience of POSCO or due to the failure of the Supplier to comply with the Order, unless otherwise noted. If the Supplier fails to deliver the goods or perform the services on time or within a reasonable grace period set by POSCO at its sole discretion, POSCO shall be entitled to refuse acceptance, rescind the Order and/or demand compensation. However, the Supplier agrees that any extension of time granted shall not prejudice the rights of POSCO under this Order or as per the law in force.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>h.</strong> When the Supplier is delivering goods or providing services on POSCO's premises the Supplier shall obey POSCO's policies concerning security, environmental, code of conduct and fire protection etc.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>i.</strong> Any defect in deliveries should be replaced immediately by new deliveries that are free from defect, and faulty services must be rectified faultlessly.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>j.</strong> The Services in accordance with this Purchase Order shall at all times be performed to the highest level of care and skill always to the satisfaction of the Company and does not harm the company property while doing work. Supplier/Service Provider should provide the Services (Works) on its own, using its own means and materials. If the Supplier/Service Provider uses any means or equipment of the Company for the performance of their Services, the Parties shall execute a detailed list of the means or equipment transferred by the Company to the Contractor, which shall be returned by the Contractor to the Company in the quantity and in the condition as they have been received, taking into account normal wear and tear.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>k.</strong> Supplier has to take back waste material/excess material with him after work completion.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>l.</strong> Supplier has to submit MSDS (Material Safety Data Sheet) certificate for chemicals and Hazardous material.
                                        </Typography>
                                    </Box>

                                    {/* Section 3: Risk of Loss and Title to Goods */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        3. Risk of Loss and Title to Goods
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> The Supplier shall, without prejudice to the rights of POSCO to take any other action under the Purchase Order, indemnify and keep indemnified POSCO from and covenants to pay such sum of monies equivalent to any losses, costs, charges, expenses, claims or demands suffered or incurred or that may be suffered or incurred by POSCO by reason of, or arising out of or related to the Goods not performing in accordance with the standards specified in the quotation given by the Supplier or in accordance with the Purchase Order, or the good not performing without defect or to the full and complete satisfaction of POSCO.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> The ownership and legal title to the goods shall transfer to POSCO when the goods are properly delivered by the Supplier at the place of its delivery and in conformity to the specification as stipulated in the Order. Until then, the goods shall be at the risk of Supplier irrespective of whether the Supplier has received the consideration and in the event of delivery with installation or assembly the risk passes to POSCO upon successful completion of the acceptance by POSCO. Commissioning or use shall not replace the declaration of acceptance by POSCO.
                                        </Typography>
                                    </Box>

                                    {/* Section 4: Inspection, Acceptance and Rejection */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        4. Inspection, Acceptance and Rejection
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> All shipments of goods and performance of services shall be subject to POSCO's inspections and upon such acceptance POSCO shall either accept or reject the goods that are delivered in excess of the quantity or are damaged or defective.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> Processing of payment for the goods prior to inspection does not constitute an acceptance thereof. Acceptance shall not release Supplier's responsibility for latent defects or nonconformities nor for warranty claims.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> If POSCO rejects any goods or portion of any goods, POSCO has the right to:
                                            <br />(a) rescind the Purchase Order in its entirety;
                                            <br />(b) accept the goods at a reasonably reduced price; or
                                            <br />(c) reject the Goods and require replacement of the rejected goods.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>d.</strong> If POSCO requires replacement of the goods, Supplier shall, at its own expense, promptly replace the nonconforming goods and pay for all related expenses, including, but not limited to, transportation charges for return of the defective goods and the delivery of replacement goods.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>e.</strong> If Supplier fails to timely deliver replacement of defective goods, POSCO may replace them on its own with the support from outside source and recover the said cost from the Supplier and may reserve right to terminate this Purchase Order for such failure.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>f.</strong> The Supplier shall not deliver Goods that were previously rejected on grounds of non-compliance with Purchase Order, unless delivery of such Goods is approved in advance by POSCO, and is accompanied by a written disclosure of POSCO's prior rejection(s). If the Supplier fails to pick up/correct/dispose rejected material within specified period, then the Goods will be lying at the risk and loss of the Supplier and inventory carrying charges will be applicable beyond the specified period and the same will be debited from the Supplier's Invoices and it shall be treated as debt owed to POSCO. POSCO reserves the right to dispose-of the rejected material as scrap, if the Supplier fails to pick up/correct/dispose of rejected material within specified time by POSCO in writing.
                                        </Typography>
                                    </Box>

                                    {/* Section 5: Product Warranties */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        5. Product Warranties
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            The Supplier warrants to POSCO that all goods provided shall be:
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem', pl: 2 }}>
                                            <strong>a.</strong> of merchantable quality;<br />
                                            <strong>b.</strong> fit for the purposes intended;<br />
                                            <strong>c.</strong> unless otherwise agreed to by POSCO Goods shall be new<br />
                                            <strong>d.</strong> free from defects in design, material and bad workmanship;<br />
                                            <strong>e.</strong> in strict compliance with the Specifications and performance test parameters, if no standard of goods or workmanship shall be so described, such goods and workmanship shall be in accordance with the best standards of the industry, in compliance with the statutory requirements and satisfactory to POSCO;<br />
                                            <strong>f.</strong> free from any liens or encumbrances on title whatsoever;<br />
                                            <strong>g.</strong> in conformance with any samples provided to POSCO;<br />
                                            <strong>h.</strong> compliant with all applicable federal, provincial, and municipal laws, regulations, standards and codes as published by Bureau of Indian Standards;<br />
                                            <strong>i.</strong> in accordance with all Specifications and all POSCO's policies, guidelines, by-laws and codes of conduct which are published on its website or notified in writing to the Supplier.
                                        </Typography>
                                    </Box>

                                    {/* Section 6: Service Warranties */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        6. Service Warranties
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            The Supplier warrants to POSCO that Supplier shall perform all Services:
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> exercising that degree of professionalism, skill, diligence, care, prudence, judgment, and integrity which would reasonably be expected from a skilled and experienced service provider providing services under the same or similar circumstances as the Services under this Agreement;
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> in accordance with all Specifications and all POSCO's policies, guidelines, by-laws and codes of conduct which are published on its website or notified in writing to the Supplier; and
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> using only personnel with the skills, training, expertise, and qualifications necessary to carry out the Services. POSCO may object to any of the Supplier's personnel engaged in the performance of Services who, in the reasonable opinion of POSCO, are lacking in appropriate skills or qualifications, engage in misconduct, constitute a safety risk or hazard or are incompetent or negligent, and the Supplier shall promptly remove such personnel from the performance of any Services upon receipt of such notice, and shall not re-employ the removed person in connection with the Services without the prior written consent of POSCO.
                                        </Typography>
                                    </Box>

                                    {/* Section 7: Confidentiality */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        7. Confidentiality
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> The Supplier shall, at all the time during the term of the Purchase Order and after its expiry or early termination as the case may be, ensure that complete confidentiality is maintained by it and all its employees with regard to all information, whether marked as confidential or not, if disclose to any third party may seriously prejudice to POSCO and its business interest, such information may include information relating to its Premises, business, assets, affairs, trade secrets, clients, business model, employees and any other such information as the Supplier/his employees may come across while performing the services under the Purchase Order.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> The Supplier affirms and undertakes that neither it nor any of its officers, employees or workmen shall at any time divulge or make known to any third parties any POSCO's information.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> This clause shall not, however, apply to any information, which is or becomes public knowledge through no fault of the Supplier and its employees/workmen.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>d.</strong> The obligation under this clause shall survive the expiry or earlier termination of the relationship between the parties. In case of breach of such obligation at any time by the Supplier or its officers, employees or workmen, the POSCO shall have right, in addition, to get damages to form the Supplier, and to take suitable legal action as may be advised by POSCO's legal advisors including injunctive relief. The obligations under this clause shall perpetually bind the Supplier as long as it holds the information of POSCO
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>e.</strong> The Supplier shall not disclose such Information(s) to any potential Sub-contractor, if any, until such time and in such manner as agreed by POSCO in writing. The decision of the POSCO will be final and binding on the Service Provider in this regard. The Supplier shall use best endeavours to prevent the authorized disclosure of all information hereunder.
                                        </Typography>

                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>f.</strong> The Supplier covenants to sign a definitive confidential agreement with POSCO at any time and in the format provided by POSCO.
                                        </Typography>
                                    </Box>

                                    {/* Section 8: Price / Payment terms and Taxes */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        8. Price / Payment terms and Taxes
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> Prices for the Goods and/or Services will be set out in the applicable Purchase Order or Contract as the case may be. Any escalation or variation in the price shall not be effective unless agreed to in advance in writing by POSCO. The Supplier will issue all invoices on a timely basis. POSCO shall have the right to withhold payment of any invoiced amounts that are disputed in good faith until the parties reach an agreement with respect to such disputed amounts and such withholding of disputed amounts shall not be deemed a breach of the contract nor shall any interest be charged on such amounts. Notwithstanding the foregoing, POSCO agrees to pay at its discretion the balance of the undisputed amounts on any invoice that is the subject of any dispute within the time periods specified herein.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> The Supplier shall submit bellow mentioned invoices / documents to our authorized representatives for further process: -<br />
                                            i. Tax Invoice [Original for Recipient / POSCO's copy and Duplicate for Supplier copy], three copies of delivery challan, if any, along with the consignment. Set of documents should also contain MTCs & Inspection reports, quality test certificate as applicable along with copy of way bill / e-way bill needs to be submitted after dispatch of goods<br />
                                            ii. Tax Invoice shall be prepared and issued by you strictly in terms of the GST Act and shall accompany the services rendered.<br />
                                            iii. The supplier shall promptly issue and submit tax invoice towards the supply of goods/ not later than 5 working days from the date of issuing the invoice. In case of any delay beyond the prescribed period, the credit period, if any, shall be suitably extended to that extent
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> Taxes paid to the Supplier shall be liable to be recovered along with interest @ 24% and penalty, if any, imposed on the POSCO by approaching to the appropriate court/forum, if required, in case the supplier fails to pay the same / to report / incorrectly reports the said supply/payment details in the monthly/ quarterly/ annual returns as may be required to be filed under the CGST Act, 2017/ IGST Act, 2017 / UGST Act and State GST Act applicable in the State of the supplier. Notwithstanding the above provision, the supplier shall, sue moto or upon POSCO's advice promptly report/ pay the taxes / make a requisite correction in the return to be filed by the supplier for the month immediately following the month in which such details were originally reported / or required to be reported. It will be the sole responsibility of the supplier to follow the process as recommended for the filing of GST return accurately and within due date.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>d.</strong> POSCO shall deduct TDS as applicable under the GST Act or Income Tax Act, 1961, as the case may be, from the payments made under this Purchase Order and requisite certificate would be provided to the Supplier evidencing such deduction of tax and deposit the tax so deducted with the concerned authority.
                                        </Typography>
                                    </Box>

                                    {/* Section 9: Insurance */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        9. Insurance
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            The Supplier shall take out and maintain at its own cost such comprehensive insurance policy as are instructed by POSCO to cover all risks and liability of the Supplier till the risk and property in the goods passes to POSCO. The Supplier shall submit to POSCO the documentary evidence that the insurances under this clause are properly maintained within seven days of request. In the event the Supplier makes default under this clause or in continuing or in causing to insure as instructed or required by POSCO under in this clause, POSCO may itself insure on behalf of the Supplier against any risk with respect to which the default shall have occurred and shall deduct a sum or sums equivalent to the amount paid or payable in respect of premium from any monies due or to become due to the Supplier or such amount shall be recoverable from the Supplier by POSCO as a debt. Unless the context otherwise requires, for the purpose of this clause insurance also includes ESI, workmen compensation or any insurance to cover risk against the personal injury, accident etc.
                                        </Typography>
                                    </Box>

                                    {/* Section 10: Termination */}
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        10. TERMINATION FOR CONVENIENCE AND CHANGES:
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            POSCO shall have a right to cancel or terminate this Purchase Order at its convenience or more particularly in the following situations:
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> If the Supplier defaults in the due performance or observance of any of the obligations, covenants, conditions, warranties or provisions contained herein including but not limited to failure to supply and/or commission the above-said goods/services conforming to POSCO's specifications, within the agreed delivery schedule.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> If any representation, warranty, information or statement made or deemed to be made by the Supplier, whether explicitly or not, proves to be untrue, incorrect or misleading in any material respect or if any event occurs as a result of which, if any of the aforesaid representations, warranties or statements were repeated immediately thereafter with reference to the facts subsisting at the time of such repetition, the same would be untrue, incorrect or misleading in any material respect;
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> If there shall have occurred dissolution or liquidation or any order is made or resolution, law or regulation passed or other action taken against the Supplier for dissolution or liquidation or the Supplier shall otherwise enter into liquidation;
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>d.</strong> If the Supplier applies for or agree to an arrangement with their creditors or any proceeding or arrangement by which a substantial part of the Supplier's assets is subject to adverse impact with respect to its dealing;
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>e.</strong> If the Supplier become or are declared by any Government Authority or any other competent authority to be insolvent or are unable or admit in writing inability to pay your debts as they fall due or become subject to or apply for any suspension of payment, bankruptcy, insolvency or reorganization proceedings if such cessation in POSCO's opinion has a material adverse effect on the Supplier;
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>f.</strong> If the consent of any Government Authority, required for the validity, enforceability or legality of the terms hereof ceases to be or is not for any reason in full force and effect or such performance becomes unlawful;
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>g.</strong> If extraordinary circumstances have occurred which in the sole opinion of POSCO, make it improbable for the Supplier to fulfil its obligations.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>h.</strong> In case of cancellation or termination of this Purchase Order, all the payments made to the Supplier pursuant to the terms hereof shall become immediately due and payable to POSCO, along with liquidated and other damages, Any cancellation or termination of this order shall not constitute a waiver by POSCO of any obligation that by its terms shall survive such cancellation or termination or a waiver of any claim which POSCO may have for actual damages caused by reason of, or relieve the Supplier from liability for, any breach of the terms and conditions of this order prior to such termination or cancellation
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>i.</strong> the Supplier will be subject to any restrictions, constraints, sanctions imposed by any national or international government, regulatory body, judicial, quasi-judicial, tribunal.
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        11. Severability: -
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            If any provision is determined to be unenforceable or invalid for any reason whatsoever, in whole or in part, such invalidity or unenforceability shall attach only to such provision or part thereof and the remaining part thereof and all other provisions shall continue in full force and effect
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        12. Assignment: -
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            The Supplier shall not assign or subcontract its obligations, rights, interest or title in whole or in part, without POSCO's prior written consent. The Supplier's permitted assignment or subcontracting or any part thereof will not release the Supplier of its obligations, and it will remain the sole responsibility of the Supplier. The acts of omissions of any subcontractors of the Supplier will be deemed to be the acts and omissions of Supplier.
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        13. Governing Law: -
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            This shall be governed by the laws of India. The courts at Pune shall have an exclusive jurisdiction to entertain any matter arising out of or in connection with the Order.
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        14. Dispute Resolution: -
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            In case of any dispute or differences shall at any time arise between POSCO and the Supplier as to the meaning or effect of contract including the Order or any clause or thing contained herein or as to the rights, duties, and liabilities of the Parties hereto under the contract including the Order then POSCO and the Supplier shall endeavour to settle such disputes amicably, failing which the dispute shall, in accordance with and subject to the provisions of the Arbitration and Conciliation Act, 1996 and Rules thereunder, or any statutory modification or re-enactment thereof for the time being in force, be referred ( unless the parties concur in the appointment of a single arbitrator) to two arbitrators (one to be appointed by each party to the dispute or difference) who shall appoint a presiding arbitrator or an umpire immediately after they are themselves appointed. The Parties shall be deemed to have failed to concur in appointing a single arbitrator if such an arbitrator has not been appointed within 30 calendar days after the service by either Party on the other of a notice requesting the other to concur in the appointment of such an arbitrator. The seat of the arbitration shall be Pune and conducted in the English language. The Parties shall bear their own cost for Arbitration including the fees paid to Attorneys and shall bear equally the charges to be paid to the Arbitration Panel. The provisions of this Article shall survive the termination of this Agreement
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        15. Legal Compliances
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> The Supplier shall at all times comply with all applicable statutory, federal, provincial, and municipal laws, regulations, standards, and code of conducts, Ethics including but not limited to such laws and regulations relating to all labour laws
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> With respect to deliveries and the performance of services, the Supplier alone shall be responsible for compliance with regulations for the prevention of accidents.
                                        </Typography>
                                    </Box>

                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem', mt: 2, mb: 1 }}>
                                        16. Force Majeure: -
                                    </Typography>
                                    <Box sx={{ pl: 2, fontSize: '0.7rem' }}>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>a.</strong> Force Majeure includes events or circumstances of the kind illustrated below:
                                            <br />i. war, hostilities (whether war be declared or not), invasion, act of foreign enemies,
                                            <br />ii. rebellion, terrorism, revolution, insurrection, military or usurped power, or civil war,
                                            <br />iii. riot, commotion, disorder, strike or lockout by persons other than Seller's personnel,
                                            <br />iv. Natural catastrophes such as earthquake, disaster, epidemic, lockouts, fire, accident, flood or any act of God,
                                            <br />v. Munitions of war, explosive materials, ionizing radiation or contamination of such munitions, explosives, radiation or radio-activity,
                                            <br />vi. Governmental acts or actions
                                            <br />vii. Any change in law
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>b.</strong> If either Party is prevented from performing any of its obligations under this Contract by such cases of Force Majeure, it shall give written notice to the other Party within fourteen (14) days of such occurrence, describing the event and its effects supported by authentic evidences that are verifiable. The affected Party shall, having given notice, be wholly or partially excused performance of such obligation for so long as such Force Majeure condition prevails. No party shall have any claim/compensation for the loss incurred due to the Force Majeure.
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.7rem' }}>
                                            <strong>c.</strong> The affected Party shall use all reasonable efforts to minimize any delay in its performance of the Contract as a result of Force Majeure
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default POPreview;
