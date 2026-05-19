import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import styles from './PackageLevelSummary.module.css';

const PackageLevelSummary = ({ data }) => {
  const { vendors, packageLevel } = data;
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') {
      return '-';
    }
    return value;
  };

  const getRankingBadgeClass = (ranking) => {
    switch (ranking) {
      case 'L1': return styles.l1Badge;
      case 'L2': return styles.l2Badge; 
      case 'L3': return styles.l3Badge;
      default: return styles.l1Badge;
    }
  };

  // Get all unique field keys from packageLevel vendors to create dynamic rows
  const getPackageFields = () => {
    if (!packageLevel?.vendors || packageLevel.vendors.length === 0) {
      return [];
    }
    
    const firstVendor = packageLevel.vendors[0];
    const fields = Object.keys(firstVendor).filter(key => key !== 'name');
    
    // Create field mapping for display
    const fieldMapping = {
      packagePrice: 'Package Price',
      loadingFactor: 'Loading Factor',
      amount: 'Amount',
      commercialRanking: 'Commercial Ranking'
    };
    
    return fields.map(field => ({
      key: field,
      label: fieldMapping[field] || field.charAt(0).toUpperCase() + field.slice(1)
    }));
  };

  const packageFields = getPackageFields();

  return (
    <div className={styles.packageLevelSummary}>
      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: `${280 + ((packageLevel?.vendors?.length || 0) * 280) + 240}px` }}>
          {/* Table Header */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                <div 
                  className={styles.packageDetailsHeader}
                  onClick={handleToggleExpansion}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>PACKAGE DETAILS</span>
                  <IconButton size="small" style={{ color: 'inherit', padding: '2px' }}>
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </div>
              </TableCell>
              {packageLevel?.vendors?.map((packageVendor, index) => (
                <TableCell 
                  key={index} 
                  className={`${styles.headerCell} ${styles.vendorHeader}`}
                >
                  <div>
                    <Typography className={styles.vendorName}>
                      {packageVendor.name}
                    </Typography>
                    <Typography className={styles.vendorSubmission}>
                      {vendors[index]?.label || vendors[index]?.submissionTime || ''}
                    </Typography>
                  </div>
                </TableCell>
              ))}
              <TableCell className={`${styles.headerCell} ${styles.summaryHeader}`}>
                Lowest Price
              </TableCell>
              <TableCell className={`${styles.headerCell} ${styles.summaryHeader}`}>
                AVG
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {isExpanded && packageFields.map((field) => (
              <TableRow key={field.key} className={styles.packageRow}>
                <TableCell className={styles.firstColumn}>
                  <div className={styles.packageInfo}>
                    <Typography className={styles.packageLabel}>
                      {field.label}
                    </Typography>
                  </div>
                </TableCell>
                {packageLevel?.vendors?.map((packageVendorData, index) => {
                  const fieldValue = packageVendorData?.[field.key];
                  
                  return (
                    <TableCell key={index} className={styles.dataCell}>
                      <div className={styles.priceContainer}>
                        <Typography className={styles.price}>
                          {formatValue(fieldValue)}
                        </Typography>
                        {field.key === 'commercialRanking' && fieldValue && (
                          <Chip 
                            label={fieldValue} 
                            className={getRankingBadgeClass(fieldValue)}
                            size="small"
                          />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
                <TableCell className={styles.dataCell}>
                  <Typography className={styles.summaryPrice}>
                    -
                  </Typography>
                </TableCell>
                <TableCell className={styles.dataCell}>
                  <Typography className={styles.summaryPrice}>
                    -
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PackageLevelSummary;