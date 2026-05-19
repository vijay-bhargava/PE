import React, { useState, useMemo } from 'react';
import { formatDateViaLocale2, formatDateViaTimeZone, formattimeoption } from '../../../utils/common/utility';
import { useStateValue } from '../../../store';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const BidGeneralPreview = ({ formik, inputList, bidtype, stagearray, currentStage, handletabEdit }) => {
  const [{ userDetail }] = useStateValue();
  const [showTable, setShowTable] = useState(true);

  const bidTypeMap = {
    1: 'Forward Auction',
    2: 'Reverse Auction',
    3: 'Freight Auction',
    4: 'Formula Based Auction',
    5: 'French Forward Auction',
    6: 'French Reverse Auction',
  };
  const bidSubTypeMap = {
    81: 'English',
    82: 'Dutch',
    83: 'Japanese',
  };

  const bidTypeDescription = bidTypeMap[bidtype?.id] || 'Unknown Auction';
  const bidSubTypeDescription = bidSubTypeMap[formik.values.bidSubTypeId] || 'Unknown SubType';
  const result = `${bidTypeDescription} (${bidSubTypeDescription})`;

  const isForwardOrFrenchForward = bidtype?.id === 1 || bidtype?.id === 5;
  let rankDisplay = '';
  if (formik?.values?.showRankToVendor === 'Y') {
    rankDisplay = isForwardOrFrenchForward ? 'As H1, H2, H3, etc.' : 'As L1, L2, L3, etc.';
  } else if (formik?.values?.showRankToVendor === 'N') {
    rankDisplay = isForwardOrFrenchForward ? 'As H1 Or Not H1' : 'As L1 Or Not L1';
  } else if (formik?.values?.showRankToVendor === 'T') {
    rankDisplay = 'Traffic Light';
  } else {
    rankDisplay = 'Unknown Ranking Format';
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader
          title=""
          sx={{ backgroundColor: '#ffffff', py: 1.5 }}
          titleTypographyProps={{ fontSize: '14px', fontWeight: 400 }}
          action={
            (stagearray?.includes(currentStage) || currentStage === 'Under Approval') && (
              <IconButton size="small" onClick={() => handletabEdit(1)}>
                <span style={{ fontSize: '18px', color: '#1976d2' }}>✏️</span>
              </IconButton>
            )
          }
        />
        <CardContent>
          <div className="row">

            {/* Subject */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Subject</strong></Typography>
              <Typography variant="body1">{formik.values.subject || '—'}</Typography>
            </div>

            {/* Auction ID */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Auction ID</strong></Typography>
              <Typography variant="body1">{formik.values.id || '—'}</Typography>
            </div>

            {/* Start Time */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Start Time</strong></Typography>
              <Typography variant="body1">{formatDateViaLocale2(formik?.values?.bidStDate, userDetail) || '—'}</Typography>
            </div>

            {/* End Time */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>End Time</strong></Typography>
              <Typography variant="body1">{formatDateViaLocale2(formik?.values?.bidEndDate, userDetail) || '—'}</Typography>
            </div>

            {/* Bid Type */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Bid Type</strong></Typography>
              <Typography variant="body1">{result}</Typography>
            </div>

            {/* Display Rank */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Display Vendors Rank</strong></Typography>
              <Typography variant="body1">{rankDisplay}</Typography>
            </div>

            {/* Maximum Extensions */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Maximum Extensions</strong></Typography>
              <Typography variant="body1">
                {formik.values.maximumExtension === -1 ? 'Unlimited' : formik.values.maximumExtension}
              </Typography>
            </div>

            {/* Hide Vendor */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Mask Participants</strong></Typography>
              <Typography variant="body1">{formik.values.hideVendor ? 'Yes' : 'No'}</Typography>
            </div>

             <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Mask Quote</strong></Typography>
              <Typography variant="body1">{formik.values.hideQuote ? 'Yes' : 'No'}</Typography>
            </div>

            {/* Pre Bid Start Date */}
            {formik.values.prebid && formik.values.preBidStDate && (
              <div className="col-md-6 mb-3">
                <Typography variant="body2" color="textSecondary"><strong>Pre Bid Start Date</strong></Typography>
                <Typography variant="body1">{formatDateViaLocale2(formik?.values?.preBidStDate, userDetail) || '—'}</Typography>
              </div>
            )}

            {/* Pre Bid End Date */}
            {formik.values.prebid && formik.values.preBidEndDate && (
              <div className="col-md-6 mb-3">
                <Typography variant="body2" color="textSecondary"><strong>Pre Bid End Date</strong></Typography>
                <Typography variant="body1">{formatDateViaLocale2(formik?.values?.preBidEndDate, userDetail) || '—'}</Typography>
              </div>
            )}

            {/* Multi-Currency Table */}
            {formik.values.isMultiCurrency && (
              <div className="col-12 mb-3">
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}><strong>Currency Mode</strong></Typography>
                <Typography variant="body1" sx={{ display: 'inline', mr: 1 }}>Multi Currency</Typography>
                <IconButton onClick={() => setShowTable(!showTable)} size="small">
                  {showTable ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                {showTable && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Currency</TableCell>
                          <TableCell align="right">Conversion Factor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inputList.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.baseCurrency}</TableCell>
                            <TableCell align="right">{row.currencyConversion}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
            )}

            {/* Description */}
            <div className="col-12 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Description</strong></Typography>
              <Box
                sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', p: 1, fontSize: '14px' }}
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: formik.values.description || '—' }}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="col-12 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Terms & Conditions</strong></Typography>
              <Box
                sx={{ border: '1px solid #e0e0e0', borderRadius: '4px', p: 1, fontSize: '14px' }}
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: formik.values.tnC || '—' }}
              />
            </div>

          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BidGeneralPreview;
