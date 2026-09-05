import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateValue } from '../../../store';
import PurchaseRequest from './PurchaseRequest';
import '../../../assets/css/rfq-detail-v2.css';

const isDisplayableCode = (code) => typeof code === 'string' && !!code.trim();

const PurchaseRequestV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const { pageSlug } = useParams();
  const [{ eventCode }] = useStateValue();

  const isNew = !pageSlug || pageSlug === 'add';
  const fallbackCrumbLabel = isNew ? 'PR - New' : `PR - ${pageSlug}`;

  const [stableEventCode, setStableEventCode] = useState(() =>
    isDisplayableCode(eventCode) ? eventCode : ''
  );

  const crumbLabel = useMemo(() => {
    if (isNew) return 'Purchase Request';
    return stableEventCode || fallbackCrumbLabel;
  }, [fallbackCrumbLabel, isNew, stableEventCode]);

  useEffect(() => {
    if (isDisplayableCode(eventCode)) {
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
        onClick={() => navigate('/configuration/manage-PR')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/configuration/manage-PR')}
      >
        Purchase Request
      </span>
      <span className="rfq-dv2-sep">/</span>
      <span className="rfq-dv2-breadcrumb-current">{crumbLabel}</span>
    </nav>
  );

  return (
    <div className="rfq-detail-v2-shell">
      <PurchaseRequest claimType={claimType} breadcrumb={breadcrumb} />
    </div>
  );
};

export default PurchaseRequestV2;
