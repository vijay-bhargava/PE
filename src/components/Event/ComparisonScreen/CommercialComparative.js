import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
  Chip
} from '@mui/material';
import styles from './UnifiedComparisonTable.module.css';
import { formatDateViaLocale } from '../../../utils/common/utility';
import { useStateValue } from '../../../store';

const CommercialComparative = ({ data, handleSupplierModalOpen }) => {
  const [{ userDetail }] = useStateValue();

  const transformedData = useMemo(() => {
    if (!data?.suppliers || !data?.packageCommercialTerms) {
      return { vendors: [], commercialTerms: [] };
    }

    const vendors = data.suppliers.map(supplier => ({
      id: supplier.vendorId,
      name: supplier.companyName,
      label: formatDateViaLocale(supplier.responseDate, userDetail),
      commercialRanking: `L${supplier.ranking || 1}`,
      acceptedCurrency: supplier.acceptedCurrency
    }));

    const commercialTerms = data.packageCommercialTerms.map(term => {
      const vendorsObj = {};
      term.vendorPackageCommercial.forEach(vendorTerm => {
        let value = 'Not Specified';
        if (vendorTerm.calculateCommValue !== null && vendorTerm.calculateCommValue !== undefined && vendorTerm.calculateCommValue !== 0) {
          value = vendorTerm.calculateCommValue.toString();
        } else if (vendorTerm.remarks && vendorTerm.remarks.trim() !== '') {
          value = vendorTerm.remarks;
        }
        vendorsObj[vendorTerm.vendorId] = { value };
      });

      return {
        TermsId: term.termsId.toString(),
        Name: term.name,
        Remarks: term.requirement || '',
        vendors: vendorsObj
      };
    });

    return { vendors, commercialTerms };
  }, [data]);

  const { vendors, commercialTerms } = transformedData;

  const getRankClass = (ranking) => {
    if (ranking === 'L1') return styles.rankL1;
    if (ranking === 'L2') return styles.rankL2;
    return styles.rankL3;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') return '-';
    return value;
  };

  if (!vendors || !commercialTerms || vendors.length === 0) {
    return <div>No commercial comparative data available</div>;
  }

  return (
    <div className={styles.unifiedComparisonTable}>
      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: `${220 + vendors.length * 300}px` }}>

          {/* Header — same structure as UnifiedComparisonTable */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                <Typography className={styles.comparisonTitle}>Commercial Terms</Typography>
                <Typography className={styles.comparisonSubTitle}>
                  TOTAL VENDORS: {vendors.length}
                </Typography>
              </TableCell>

              {vendors.map((vendor, index) => (
                <TableCell key={vendor.id} className={styles.vendorHeaderCell}>
                  <div className={styles.vendorCard}>
                    <div className={styles.vendorLabel}>VENDOR {String(index + 1).padStart(2, '0')}</div>
                    <Typography
                      className={styles.vendorNameNew}
                      onClick={() => handleSupplierModalOpen(vendor.id)}
                    >
                      {vendor.name?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                    </Typography>
                    <div className={styles.metaGrid}>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Currency:</span>
                        <span className={styles.metaValue}>{vendor.acceptedCurrency || '—'}</span>
                      </div>
                      <div className={styles.metaBlock}>
                        <span className={styles.metaLabel}>Date:</span>
                        <span className={styles.metaValue}>{vendor.label || '—'}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {commercialTerms.map((term) => (
              <TableRow key={term.TermsId}>
                <TableCell className={styles.subRowCell}>
                  <div className={styles.termInfo}>
                    <Typography className={styles.termName}>{term.Name}</Typography>
                    {term.Remarks && (
                      <Typography className={styles.termRemarks}>{term.Remarks}</Typography>
                    )}
                  </div>
                </TableCell>
                {vendors.map((vendor) => {
                  const vendorData = term.vendors[vendor.id];
                  return (
                    <TableCell key={vendor.id} className={styles.dataCell}>
                      <div className={styles.commercialTermContainer}>
                        <Typography className={styles.commercialValue}>
                          {formatValue(vendorData?.value)}
                        </Typography>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CommercialComparative;
