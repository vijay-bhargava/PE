import React, { useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import { HiPencilAlt } from 'react-icons/hi';
import { findStringByValueFromArray } from '../../../utils/common';

const stripHtml = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || '';
};

const PRGeneralPreview = ({
  formik,
  purchaseAllList,
  purchaseGroupAllList,
  stagearray,
  currentStage,
  handletabEdit,
  prItemsList,
}) => {

  const plainDescription = useMemo(
    () => stripHtml(formik.values.prDescription),
    [formik.values.prDescription]
  );

  const canEdit =
    (stagearray?.includes(currentStage) || currentStage === 'Under Approval') &&
    typeof handletabEdit === 'function';

  const rows = [
    ['PR Subject:', formik.values.prSubject || '-'],
    ['PR Number:', formik.values.prNumber || '-'],
    [
      'Purchase Org:',
      findStringByValueFromArray(purchaseAllList, formik.values?.purchOrgId?.id, 'id', 'orgName') || '-',
    ],
    [
      'Purchase Group:',
      findStringByValueFromArray(purchaseGroupAllList, formik.values?.purchGrpId?.id, 'id', 'groupName') || '-',
    ],
    ['Requisitioner:', formik.values?.requisitioner || '-'],
    ['BOQ:', formik.values.isBoq ? 'Yes' : 'No'],
  ];

  return (
    <div className="rfq-dv2-overview">
      {canEdit && (
        <IconButton
          className="rfq-dv2-overview-edit"
          size="small"
          onClick={() => handletabEdit(1)}
        >
          <HiPencilAlt className="f17 text-primary" />
        </IconButton>
      )}

      {rows.map(([label, value]) => (
        <div className="rfq-dv2-detail-row" key={label}>
          <div className="rfq-dv2-detail-label">{label}</div>
          <div className="rfq-dv2-detail-value">{value}</div>
        </div>
      ))}

      <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
        <div className="rfq-dv2-detail-label">PR Description:</div>
        <div className="rfq-dv2-text-panel">{plainDescription || '-'}</div>
      </div>

      {/* Items summary */}
      {prItemsList && prItemsList.length > 0 && (
        <>
          <div className="rfq-dv2-detail-row" style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
            <div className="rfq-dv2-detail-label" style={{ fontWeight: 600 }}>Items/Services</div>
            <div className="rfq-dv2-detail-value" style={{ color: '#6b7280' }}>
              {prItemsList.length} item{prItemsList.length !== 1 ? 's' : ''}
            </div>
          </div>
          {prItemsList.map((item, i) => (
            <div className="rfq-dv2-detail-row" key={i}>
              <div className="rfq-dv2-detail-label" style={{ color: '#6b7280' }}>
                {i + 1}. {item.itemDescription || item.itemName || '-'}
              </div>
              <div className="rfq-dv2-detail-value">
                {item.quantity ? `Qty: ${item.quantity}` : ''}
                {item.uom ? ` ${item.uom}` : ''}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PRGeneralPreview;
