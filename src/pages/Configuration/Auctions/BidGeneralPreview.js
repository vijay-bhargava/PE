import React, { useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { HiPencilAlt } from 'react-icons/hi';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { formatDateViaLocale2 } from '../../../utils/common/utility';
import { useStateValue } from '../../../store';

const stripHtml = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || '';
};

const bidTypeMap = {
  1: 'Forward Auction',
  2: 'Reverse Auction',
  3: 'Freight Auction',
  4: 'Formula Based Auction',
  5: 'French Forward Auction',
  6: 'French Reverse Auction',
};
const bidSubTypeMap = { 81: 'English', 82: 'Dutch', 83: 'Japanese' };

/**
 * Read-only "General" tab preview shown once an auction leaves Draft.
 * Uses the same rfq-dv2-detail-row/label/value + rfq-dv2-text-panel
 * layout as RFQGeneralPreview.js for visual parity with the RFQ V2
 * detail page.
 */
const SUBJECT_LIMIT = 190;

const BidGeneralPreview = ({ formik, inputList, bidtype, stagearray, currentStage, handletabEdit }) => {
  const [{ userDetail }] = useStateValue();
  const [showTable, setShowTable] = useState(true);
  const [subjectExpanded, setSubjectExpanded] = useState(false);

  const plainDescription = useMemo(
    () => stripHtml(formik.values.description),
    [formik.values.description]
  );
  const plainTerms = useMemo(
    () => stripHtml(formik.values.tnC),
    [formik.values.tnC]
  );

  const canEditOverview =
    (stagearray?.includes(currentStage) || currentStage === 'Under Approval') &&
    typeof handletabEdit === 'function';

  const bidTypeDescription = bidTypeMap[bidtype?.id] || 'Unknown Auction';
  const bidSubTypeDescription = bidSubTypeMap[formik.values.bidSubTypeId] || 'Unknown SubType';
  const bidTypeText = `${bidTypeDescription} (${bidSubTypeDescription})`;

  const isForwardOrFrenchForward = bidtype?.id === 1 || bidtype?.id === 5;
  let rankDisplay = 'Unknown Ranking Format';
  if (formik?.values?.showRankToVendor === 'Y') {
    rankDisplay = isForwardOrFrenchForward ? 'As H1, H2, H3, etc.' : 'As L1, L2, L3, etc.';
  } else if (formik?.values?.showRankToVendor === 'N') {
    rankDisplay = isForwardOrFrenchForward ? 'As H1 Or Not H1' : 'As L1 Or Not L1';
  } else if (formik?.values?.showRankToVendor === 'T') {
    rankDisplay = 'Traffic Light';
  }

  const subject = formik.values.subject || '-';
  const subjectLong = subject.length > SUBJECT_LIMIT;
  const subjectDisplay = subjectLong && !subjectExpanded ? subject.slice(0, SUBJECT_LIMIT) + '…' : subject;

  const rows = [
    ['Subject:', subject],
    ['Auction ID:', formik.values.id || '-'],
    ['Start Time:', formatDateViaLocale2(formik?.values?.bidStDate, userDetail) || '-'],
    ['End Time:', formatDateViaLocale2(formik?.values?.bidEndDate, userDetail) || '-'],
    ['Bid Type:', bidTypeText],
    ['Display Vendors Rank:', rankDisplay],
    ['Maximum Extensions:', formik.values.maximumExtension === -1 ? 'Unlimited' : formik.values.maximumExtension],
    ['Mask Participants:', formik.values.hideVendor ? 'Yes' : 'No'],
    ['Mask Quote:', formik.values.hideQuote ? 'Yes' : 'No'],
  ];

  if (formik.values.prebid && formik.values.preBidStDate) {
    rows.push(['Pre Bid Start Date:', formatDateViaLocale2(formik?.values?.preBidStDate, userDetail) || '-']);
  }
  if (formik.values.prebid && formik.values.preBidEndDate) {
    rows.push(['Pre Bid End Date:', formatDateViaLocale2(formik?.values?.preBidEndDate, userDetail) || '-']);
  }

  return (
    <Box>
      <div className="rfq-dv2-overview">
        {canEditOverview && (
          <IconButton
            className="rfq-dv2-overview-edit"
            size="small"
            onClick={() => handletabEdit(1)}
          >
            <HiPencilAlt className="f17 text-primary" />
          </IconButton>
        )}

        {rows.map(([label, detail]) => (
          <div className="rfq-dv2-detail-row" key={label}>
            <div className="rfq-dv2-detail-label">{label}</div>
            {label === 'Subject:' ? (
              <div className="rfq-dv2-detail-value">
                {subjectDisplay}
                {subjectLong && (
                  <button
                    type="button"
                    onClick={() => setSubjectExpanded(v => !v)}
                    style={{ background: 'none', border: 'none', color: 'var(--pe-primary, #1976d2)', cursor: 'pointer', fontSize: '12px', padding: '0 4px' }}
                  >
                    {subjectExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            ) : (
              <div className="rfq-dv2-detail-value">{detail}</div>
            )}
          </div>
        ))}

        {formik.values.isMultiCurrency && (
          <div className="rfq-dv2-detail-row">
            <div className="rfq-dv2-detail-label">Currency Mode:</div>
            <div className="rfq-dv2-detail-value">
              Multi Currency
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
          </div>
        )}

        <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
          <div className="rfq-dv2-detail-label">Description:</div>
          <div className="rfq-dv2-text-panel">{plainDescription || '-'}</div>
        </div>

        <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
          <div className="rfq-dv2-detail-label">Terms & Conditions:</div>
          <div className="rfq-dv2-text-panel">{plainTerms || '-'}</div>
        </div>
      </div>
    </Box>
  );
};

export default BidGeneralPreview;
