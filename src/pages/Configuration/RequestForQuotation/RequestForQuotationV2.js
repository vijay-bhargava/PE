import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateValue } from '../../../store';
import RequestForQuotation from './RequestForQuotation';
import '../../../assets/css/rfq-detail-v2.css';

/**
 * Thin V2 wrapper around the existing RequestForQuotation component.
 * Adds the Figma detail-page shell while preserving the existing RFQ logic.
 */
const RequestForQuotationV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const { pageSlug } = useParams();
  const [{ eventCode }] = useStateValue();

  const isNew = pageSlug === 'add';
  const crumbLabel = isNew ? 'New RFQ' : eventCode || `RFQ-${pageSlug}`;

  return (
    <div className="rfq-detail-v2-shell">
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
        <span className="rfq-dv2-sep">{'>'}</span>
        <span
          className="rfq-dv2-breadcrumb-link"
          onClick={() => navigate('/configuration/manage-rfq')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/configuration/manage-rfq')}
        >
          Manage RFQ
        </span>
        <span className="rfq-dv2-sep">{'>'}</span>
        <span className="rfq-dv2-breadcrumb-current">{crumbLabel}</span>
      </nav>

      <RequestForQuotation claimType={claimType} />
    </div>
  );
};

export default RequestForQuotationV2;
