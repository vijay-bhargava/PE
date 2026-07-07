import React from 'react';
import { Dialog, Box, Tabs, Tab, Button } from '@mui/material';
import { HiOutlineX } from 'react-icons/hi';
import { MdCloseFullscreen } from 'react-icons/md';

/**
 * Full-screen maximize overlay for the RFQ comparison sub-tabs.
 *
 * Props:
 *   open            {boolean}   — controls visibility
 *   onClose         {function}  — called to exit fullscreen
 *   rfqCode         {string}    — e.g. "RFQ-755"
 *   activeTab       {number}    — currently selected sub-tab index
 *   onTabChange     {function}  — (event, newValue) => void
 *   actions         {object}    — actions object from ERFQComparative (actionType, currentStage, isNFA, EventHeaderDetails)
 *   techScoreDirty  {boolean}   — whether score has unsaved edits
 *   techResetRef    {ref}       — ref to TechnicalComparative's reset handler
 *   techUpdateRef   {ref}       — ref to TechnicalComparative's update handler
 *   renderTabContent {function} — () => JSX — renders current tab body
 */
const TechnicalComparisonMaximizeView = ({
  open,
  onClose,
  rfqCode,
  activeTab,
  onTabChange,
  actions,
  techScoreDirty,
  techResetRef,
  techUpdateRef,
  renderTabContent,
}) => {
  const showFinancialTab =
    actions.actionType === 'approval' &&
    (actions.currentStage === 'Open' || actions.currentStage === 'Technical Approval')
      ? actions.EventHeaderDetails?.showPriceTech
      : true;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1400 }}
    >
      <Box
        className="rfq-detail-v2-shell"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh !important',
          width: '100% !important',
          padding: '0 !important',
          margin: '0 !important',
          background: '#f5f5f5',
          fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Top bar */}
        <div
          className="rfq-dv2-head-top"
          style={{
            padding: '8px 16px',
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0,
          }}
        >
          <span className="rfq-dv2-breadcrumb-current">{rfqCode}</span>
          <div className="rfq-dv2-actions">
            <button
              type="button"
              className="pe-icon-btn pe-icon-btn--close"
              onClick={onClose}
            >
              <HiOutlineX className="f16" />
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 1,
            backgroundColor: 'var(--vz-body-bg)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={onTabChange}
            textColor="primary"
            indicatorColor="primary"
            className="tabstheme"
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ flex: 1 }}
          >
            <Tab value={0} label={<span className="section-heading">RFQ Summary</span>} />
            {showFinancialTab && (
              <Tab value={1} label={<span className="section-heading">Financial Comparison</span>} />
            )}
            <Tab value={2} label={<span className="section-heading">Commercial Comparison</span>} />
            <Tab value={3} label={<span className="section-heading">Technical Comparison</span>} />
          </Tabs>

          {activeTab === 3 && !actions.isNFA && (
            <Box sx={{ display: 'flex', gap: 1, px: 1, alignItems: 'center', flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                disabled={!techScoreDirty}
                onClick={() => techResetRef.current?.()}
                sx={{ fontSize: '12px', textTransform: 'none', height: '30px' }}
              >
                Reset Score
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={!techScoreDirty}
                onClick={() => techUpdateRef.current?.()}
                sx={{ fontSize: '12px', textTransform: 'none', height: '30px' }}
              >
                Update Score
              </Button>
            </Box>
          )}

          <button
            type="button"
            className="pe-icon-btn"
            title="Exit fullscreen"
            onClick={onClose}
            style={{ marginLeft: '4px', marginRight: '4px', flexShrink: 0 }}
          >
            <MdCloseFullscreen style={{ fontSize: '14px' }} />
          </button>
        </Box>

        {/* Tab content */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: '#F5F5F5',
          }}
        >
          {renderTabContent()}
        </Box>
      </Box>
    </Dialog>
  );
};

export default TechnicalComparisonMaximizeView;
