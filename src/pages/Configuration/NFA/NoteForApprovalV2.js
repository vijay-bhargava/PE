import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { actionTypes, useStateValue } from '../../../store';
import NoteForApproval from './NoteForApproval';
import '../../../assets/css/rfq-detail-v2.css';

const isDisplayableCode = (code) => typeof code === 'string' && !!code.trim();
const normalizeCode = (code) => code.replace(/\//g, '-');

/**
 * Thin V2 wrapper around the existing NoteForApproval component.
 * Adds the same Figma detail-page shell that RFQ V2 and Auctions V2 use,
 * while preserving all existing NFA logic untouched.
 */
const NoteForApprovalV2 = ({ claimType }) => {
  const navigate = useNavigate();
  const { pageSlug } = useParams();
  const [{ eventCode }, dispatch] = useStateValue();

  const isNew = !pageSlug || pageSlug === 'add';
  const [stableEventCode, setStableEventCode] = useState('');

  const crumbLabel = useMemo(() => {
    if (isNew) return 'New NFA';
    if (stableEventCode) return stableEventCode;
    return pageSlug ? `NFA-${pageSlug}` : 'NFA';
  }, [isNew, stableEventCode, pageSlug]);

  useEffect(() => {
    setStableEventCode('');
    dispatch({ type: actionTypes.SET_EVENTCODE, value: null });
  }, [pageSlug]);

  useEffect(() => {
    if (isDisplayableCode(eventCode)) {
      setStableEventCode(normalizeCode(eventCode));
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
        onClick={() => navigate('/configuration/manage-nfa')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/configuration/manage-nfa')}
      >
        Note for Approval
      </span>
      <span className="rfq-dv2-sep">/</span>
      <span className="rfq-dv2-breadcrumb-current">{crumbLabel}</span>
    </nav>
  );

  return (
    <div className="rfq-detail-v2-shell">
      <NoteForApproval claimType={claimType} breadcrumb={breadcrumb} />
    </div>
  );
};

export default NoteForApprovalV2;
