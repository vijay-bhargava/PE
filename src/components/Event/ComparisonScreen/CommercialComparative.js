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
import { formatDateViaLocale, formatDateViaLocale2, formatDateViaLocalet, formatDateViaTime, formatDateViaTimeZone, formattimeoption, renderHtmlAsText } from '../../../utils/common/utility';
import { actionTypes, useStateValue } from '../../../store';
const CommercialComparative = ({ data, handleSupplierModalOpen }) => {
  const [{ atoken, rtoken, customerid, customersuffix, roleClaims, userDetail }] = useStateValue();
  // Transform tempCommercialData to match the component's expected structure
  const transformedData = useMemo(() => {
    if (!data?.suppliers || !data?.packageCommercialTerms) {
      return { vendors: [], commercialTerms: [] };
    }

    // Transform suppliers to vendors format
    const vendors = data.suppliers.map(supplier => ({
      id: supplier.vendorId,
      name: supplier.companyName,
      // label: new Date(supplier.responseDate).toLocaleDateString('en-US', {
      //   year: 'numeric',
      //   month: 'short',
      //   day: 'numeric',
      //   hour: '2-digit',
      //   minute: '2-digit'
      // }),
      label: formatDateViaLocale(supplier.responseDate, userDetail),
      commercialRanking: `L${supplier.ranking || 1}`,
      acceptedCurrency: supplier.acceptedCurrency
    }));

    // Transform packageCommercialTerms to commercialTerms format
    const commercialTerms = data.packageCommercialTerms.map(term => {
      const vendorsObj = {};
      
      // Map each vendor's data for this term
      term.vendorPackageCommercial.forEach(vendorTerm => {
        // Try to get value from calculateCommValue, then remarks, then fallback
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
        FieldName: term.name.toLowerCase().replace(/\s+/g, '_'),
        Formulavalue: "0",
        CommValue: "0.0000",
        EnterCommValue: "0.00",
        Valuetype: term.valueType || "",
        IsNetPrice: "N",
        vendors: vendorsObj
      };
    });

    return { vendors, commercialTerms };
  }, [data]);

  const { vendors, commercialTerms } = transformedData;

  const getRankingBadgeClass = (ranking) => {
    switch (ranking) {
      case 'L1': return styles.l1Badge;
      case 'L2': return styles.l2Badge;
      case 'L3': return styles.l3Badge;
      default: return styles.l1Badge;
    }
  };



  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') {
      return '-';
    }
    return value;
  };

  if (!vendors || !commercialTerms || vendors.length === 0) {
    return <div>No commercial comparative data available</div>;
  }

  return (
    <div className={styles.unifiedComparisonTable}>
      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: `${280 + (vendors.length * 280)}px` }}>
          {/* Header */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                COMMERCIAL TERMS
              </TableCell>
              {vendors.map((vendor, index) => (
                <TableCell 
                  key={vendor.id} 
                  className={`${styles.headerCell} ${styles.vendorHeader}`}
                  style={{ position: 'relative' }}
                >
                  {/* {vendor.commercialRanking && (
                    <Chip 
                      label={vendor.commercialRanking} 
                      className={getRankingBadgeClass(vendor.commercialRanking)}
                      size="small"
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        zIndex: 1,
                        minWidth: '32px',
                        height: '20px',
                        fontSize: '10px'
                      }}
                    />
                  )} */}
                  <div>
                    <div className={styles.vendorNameContainer} style={{ paddingTop: vendor.commercialRanking ? '8px' : '0' }}>
                      <Typography 
                        className={styles.vendorName}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSupplierModalOpen(vendor.id)}
                      >
                        {vendor.name}
                      </Typography>
                    </div>
                    <Typography className={styles.vendorSubmission}>
                      {vendor.acceptedCurrency && (
                        <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                          {vendor.acceptedCurrency}
                        </span>
                      )}
                      {vendor.acceptedCurrency && ' • '}{vendor.label}
                    </Typography>
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {commercialTerms.map((term) => (
              <TableRow key={term.TermsId} className={styles.dataRow}>
                <TableCell className={styles.subRowCell}>
                  <div className={styles.termInfo}>
                    <Typography className={styles.termName}>
                      {term.Name}
                    </Typography>
                    <Typography className={styles.termRemarks}>
                      {term.Remarks}
                    </Typography>
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