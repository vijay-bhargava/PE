import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateValue } from '../../../store';
import RequestForQuotation from './RequestForQuotation';
import '../../../assets/css/rfq-detail-v2.css';

const isDisplayableRfqCode = (code) => {
  return typeof code === 'string' && code.trim() && !code.includes('/');
};

/**
 * Thin V2 wrapper around the existing RequestForQuotation component.
 * Adds the Figma detail-page shell while preserving the existing RFQ logic.
 */
const RequestForQuotationV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const { pageSlug } = useParams();
  const [{ eventCode }] = useStateValue();

  const isNew = !pageSlug || pageSlug === 'add';
  const fallbackCrumbLabel = isNew ? 'RFQ' : `RFQ-${pageSlug}`;

  const [stableEventCode, setStableEventCode] = useState(() =>
    isDisplayableRfqCode(eventCode) ? eventCode : ''
  );

  const crumbLabel = useMemo(() => {
    if (isNew) return 'RFQ';
    return stableEventCode || fallbackCrumbLabel;
  }, [fallbackCrumbLabel, isNew, stableEventCode]);

  useEffect(() => {
    if (isDisplayableRfqCode(eventCode)) {
      setStableEventCode(eventCode);
    }
  }, [eventCode]);

  const breadcrumb = (
    <nav className="rfq-dv2-breadcrumb" aria-label="breadcrumb">
      <span
        className="rfq-dv2-breadcrumb-link"
        onClick={() => navigate('/app')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/app')}
      >
        Home
      </span>
      <span className="rfq-dv2-sep">/</span>
      <span
        className="rfq-dv2-breadcrumb-link"
        onClick={() => navigate('/configuration/manage-rfq')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/configuration/manage-rfq')}
      >
        Request for Quotation
      </span>
      <span className="rfq-dv2-sep">/</span>
      <span className="rfq-dv2-breadcrumb-current">{crumbLabel}</span>
    </nav>
  );

  return (
    <div className="rfq-detail-v2-shell">
      <RequestForQuotation claimType={claimType} breadcrumb={breadcrumb} />
    </div>
  );
};

export default RequestForQuotationV2;
