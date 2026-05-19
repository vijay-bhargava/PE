import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  ChecklistRtl as ChecklistIcon,
  Groups as GroupsIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useStateValue } from '../../../store';
import { formatDateViaLocale } from '../../../utils/common/utility';
import PriceTrendChart from './PriceTrendChart';
import InvitedParticipatedChart from './InvitedParticipatedChart';
import SavingsLineChart from './SavingsLineChart';
import HighestLowestPriceChart from './HighestLowestPriceChart';
import SupplierPriceChart from './SupplierPriceChart';
import styles from './ExecutiveSummary.module.css';

const ExecutiveSummary = ({ data }) => {
  const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail, eventType, eventId, eventCode }, dispatch] =
      useStateValue();
  // Updated to use rfqSummaryData structure instead of executiveSummaryData
  // Currently only displaying rfqInfo section as requested
  const rfqInfo = data?.rfqInfo || {};
  

  const renderInfoItem = (icon, label, value) => (
    <div className={styles.infoItem}>
      {icon}
      <div className={styles.infoContent}>
        <Typography className={styles.infoLabel}>{label}</Typography>
        <Typography className={styles.infoValue}>{value}</Typography>
      </div>
    </div>
  );



  // Handle case when no data is provided
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
      {/* Header Section - Using rfqSummaryData structure */}
      <Card className={styles.headerSection}>
        <CardContent>
          <div className={styles.rfqHeader}>
            <div>
              <Typography className={styles.rfqTitle}>
                {rfqInfo.rfqCode || 'N/A'}
              </Typography>
              <Typography className={styles.rfqSubtitle}>
                {rfqInfo.subject || 'N/A'}
              </Typography>
            </div>
            <Chip 
              label={rfqInfo.stage || 'N/A'} 
              className={styles.statusBadge}
            />
          </div>
          
          <div className={styles.headerInfo}>
            {renderInfoItem(
              <PersonIcon className={styles.infoIcon} />,
              'Requisitioner',
              rfqInfo.requisitioner || 'N/A'
            )}
            {renderInfoItem(
              <CalendarIcon className={styles.infoIcon} />,
              'Start Date',
              formatDateViaLocale(rfqInfo.startDate, userDetail) || 'N/A'
            )}
            {renderInfoItem(
              <CalendarIcon className={styles.infoIcon} />,
              'End Date',  
              formatDateViaLocale(rfqInfo.endDate, userDetail) || 'N/A'
            )}
            {renderInfoItem(
              <DescriptionIcon className={styles.infoIcon} />,
              'Versions',
              rfqInfo.version?.toString() || 'N/A'
            )}
            {renderInfoItem(
              <ChecklistIcon className={styles.infoIcon} />,
              'Items',
              rfqInfo.items?.toString() || 'N/A'
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mini Charts Section - 2x2 Grid Layout */}
      <div className={styles.chartsSection}>
        <Grid container spacing={2}>
          {/* First Row */}
          <Grid item xs={12} md={6}>
            <InvitedParticipatedChart data={data} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SavingsLineChart data={data} />
          </Grid>
          
          {/* Second Row */}
          <Grid item xs={12} md={6}>
            <HighestLowestPriceChart data={data} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SupplierPriceChart data={data} />
          </Grid>
        </Grid>
      </div>

    </div>
  );
};

export default ExecutiveSummary;