import React from 'react';
import { Card, CardContent, Typography, Chip, Grid } from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  ChecklistRtl as ChecklistIcon,
} from '@mui/icons-material';
import { useStateValue } from '../../../store';
import { formatDateViaLocale } from '../../../utils/common/utility';
import InvitedParticipatedChart from './InvitedParticipatedChart';
import SavingsLineChart from './SavingsLineChart';
import HighestLowestPriceChart from './HighestLowestPriceChart';
import SupplierPriceChart from './SupplierPriceChart';
import styles from './ExecutiveSummary.module.css';

const ExecutiveSummary = ({ data }) => {
  const [{ userDetail }] = useStateValue();
  const rfqInfo = data?.rfqInfo || {};

  const renderMetaItem = (icon, label, value) => (
    <div className={styles.metaItem}>
      {icon}
      <span className={styles.metaLabel}>{label}:</span>
      <span className={styles.metaValue}>{value || 'N/A'}</span>
    </div>
  );

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={styles.executiveSummary}>
        <Card className={styles.headerSection}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" align="center">
              No RFQ summary data available
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.executiveSummary}>
      {/* Header Card */}
      <Card className={styles.headerSection}>
        <CardContent className={styles.headerContent}>
          {/* Row 1: RFQ code + subject (truncated) + status chip right */}
          <div className={styles.titleRow}>
            <div className={styles.titleLeft}>
              <Typography className={styles.rfqTitle}>
                {rfqInfo.rfqCode || 'N/A'}
              </Typography>
              <Typography className={styles.rfqSubtitle} noWrap title={rfqInfo.subject}>
                {rfqInfo.subject || ''}
              </Typography>
            </div>
          </div>

          {/* Row 2: meta items — fixed horizontal row */}
          <div className={styles.metaRow}>
            {renderMetaItem(
              <PersonIcon className={styles.metaIcon} />,
              'Requisitioner',
              rfqInfo.requisitioner
            )}
            <span className={styles.metaDivider} />
            {renderMetaItem(
              <CalendarIcon className={styles.metaIcon} />,
              'Start',
              formatDateViaLocale(rfqInfo.startDate, userDetail)
            )}
            <span className={styles.metaDivider} />
            {renderMetaItem(
              <CalendarIcon className={styles.metaIcon} />,
              'End',
              formatDateViaLocale(rfqInfo.endDate, userDetail)
            )}
            <span className={styles.metaDivider} />
            {renderMetaItem(
              <DescriptionIcon className={styles.metaIcon} />,
              'Versions',
              rfqInfo.version?.toString()
            )}
            <span className={styles.metaDivider} />
            {renderMetaItem(
              <ChecklistIcon className={styles.metaIcon} />,
              'Items',
              rfqInfo.items?.toString()
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts — 2×2 grid of white cards on grey background */}
      <div className={styles.chartsSection}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <InvitedParticipatedChart data={data} />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <SavingsLineChart data={data} />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <HighestLowestPriceChart data={data} />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card className={styles.chartCard}>
              <SupplierPriceChart data={data} />
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
