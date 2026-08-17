import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStateValue } from '../../../store';
import Auctions from './Auctions';
import '../../../assets/css/rfq-detail-v2.css';

const isDisplayableAuctionCode = (code) => typeof code === 'string' && !!code.trim();
const normalizeAuctionCode = (code) => code.replace(/\//g, '-');

/**
 * Thin V2 wrapper around the existing Auctions component.
 * Adds the same Figma detail-page shell RFQ V2 uses, while preserving
 * all existing Auctions logic untouched. Auctions itself decides (via
 * currentStage) whether to render the new closed-state chrome or the
 * existing Draft/Open/Running experience unchanged.
 */
const AuctionsV2 = ({ claimType, bidtype }) => {
  const navigate = useNavigate();
  const { pageSlug } = useParams();
  const [{ eventCode }] = useStateValue();

  const isNew = !pageSlug || pageSlug === 'add';
  const fallbackCrumbLabel = isNew ? 'Auction' : (isDisplayableAuctionCode(eventCode) ? `Auction-${normalizeAuctionCode(eventCode)}` : 'Auction');

  const [stableEventCode, setStableEventCode] = useState(() =>
    isDisplayableAuctionCode(eventCode) ? normalizeAuctionCode(eventCode) : ''
  );

  const crumbLabel = useMemo(() => {
    if (isNew) return 'Auction';
    return stableEventCode || fallbackCrumbLabel;
  }, [fallbackCrumbLabel, isNew, stableEventCode]);

  useEffect(() => {
    if (isDisplayableAuctionCode(eventCode)) {
      setStableEventCode(normalizeAuctionCode(eventCode));
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
        onClick={() => navigate('/configuration/manage-auction')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/configuration/manage-auction')}
      >
        Auctions
      </span>
      <span className="rfq-dv2-sep">/</span>
      <span className="rfq-dv2-breadcrumb-current">{crumbLabel}</span>
    </nav>
  );

  return (
    <div className="rfq-detail-v2-shell">
      <Auctions claimType={claimType} bidtype={bidtype} breadcrumb={breadcrumb} />
    </div>
  );
};

export default AuctionsV2;
