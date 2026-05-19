import React, { useState, Fragment } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Typography,
  Box,
  Chip,
  IconButton,
  Link
} from '@mui/material';
import {
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import styles from './ItemLevelDetails.module.css';

const ItemLevelDetails = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { vendors, items } = data;

  const toggleRowExpansion = (itemId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '$0.00';
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${numericPrice.toFixed(2)}`;
  };

  const getRankingBadgeClass = (ranking) => {
    switch (ranking) {
      case 'L1': return styles.l1Badge;
      case 'L2': return styles.l2Badge; 
      case 'L3': return styles.l3Badge;
      default: return styles.l1Badge;
    }
  };

  const getPriceChangeClass = (change) => {
    if (change > 0) return styles.priceIncrease;
    if (change < 0) return styles.priceDecrease;
    return styles.priceNoChange;
  };

  const getLowestPrice = (item) => {
    let lowest = Infinity;
    vendors.forEach(vendor => {
      const vendorData = item.vendors[vendor.id];
      if (vendorData && vendorData.price < lowest) {
        lowest = vendorData.price;
      }
    });
    return lowest === Infinity ? 0 : lowest;
  };

  const getAveragePrice = (item) => {
    let total = 0;
    let count = 0;
    vendors.forEach(vendor => {
      const vendorData = item.vendors[vendor.id];
      if (vendorData && vendorData.price) {
        total += vendorData.price;
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  };

  const calculateSavingsVsTarget = (item) => {
    const lowestPrice = getLowestPrice(item);
    const targetPrice = item.targetPrice || 0;
    
    if (targetPrice === 0 || lowestPrice === 0) {
      return {
        savings: 0,
        percentage: 0,
        isPositive: false
      };
    }
    
    const savings = targetPrice - lowestPrice;
    const percentage = (savings / targetPrice) * 100;
    
    return {
      savings: Math.abs(savings),
      percentage: Math.abs(percentage),
      isPositive: savings >= 0
    };
  };

  const getCommercialTermsPrice = (commercialTerms, basePrice) => {
    if (!commercialTerms || !basePrice) return basePrice || 0;
    
    let totalPrice = basePrice;
    
    // Add all commercial terms except totalLandedPrice
    Object.entries(commercialTerms).forEach(([key, value]) => {
      if (key !== 'totalLandedPrice' && !key.includes('Percentage') && typeof value === 'number') {
        totalPrice += value;
      }
    });
    
    return totalPrice;
  };

  const getCommercialTermColor = (termValue, basePrice) => {
    if (!termValue || termValue === 0) return '';
    return termValue > 0 ? styles.positiveAmount : styles.negativeAmount;
  };

  const getCommercialTermsKeys = (item) => {
    const termKeys = new Set();
    vendors.forEach(vendor => {
      const vendorData = item.vendors[vendor.id];
      if (vendorData?.commercialTerms) {
        Object.keys(vendorData.commercialTerms).forEach(key => {
          if (!key.includes('Percentage') && key !== 'totalLandedPrice') {
            termKeys.add(key);
          }
        });
      }
    });
    return Array.from(termKeys);
  };

  const formatTermLabel = (termKey) => {
    const labelMap = {
      basePrice: 'Base Price',
      taxes: 'Taxes',
      freight: 'Freight/Loading',
      discount: 'Discount',
      insurance: 'Insurance',
      handling: 'Handling Charges',
      shipping: 'Shipping',
      customs: 'Customs Duty',
    };
    return labelMap[termKey] || termKey.charAt(0).toUpperCase() + termKey.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const paginatedItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className={styles.itemLevelDetails}>
      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: `${280 + (vendors.length * 280) + 240}px` }}>
          {/* Table Header */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                ITEM DETAILS
              </TableCell>
              {vendors.map((vendor) => (
                <TableCell 
                  key={vendor.id} 
                  className={`${styles.headerCell} ${styles.vendorHeader}`}
                >
                  <div>
                    <Typography className={styles.vendorName}>
                      {vendor.name}
                    </Typography>
                    <Typography className={styles.vendorSubmission}>
                      {vendor.submissionTime}
                    </Typography>
                  </div>
                </TableCell>
              ))}
              <TableCell className={`${styles.headerCell} ${styles.summaryHeader}`}>
                Lowest Price
              </TableCell>
              <TableCell className={`${styles.headerCell} ${styles.summaryHeader}`}>
                Lowest Price Vs Target Price
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {paginatedItems.map((item) => (
              <Fragment key={item.id}>
                {/* Main Item Row */}
                <TableRow className={styles.dataRow}>
                  <TableCell className={styles.firstColumn}>
                    <div className={styles.itemInfo}>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(item.id)}
                        className={styles.expandButton}
                      >
                        {expandedRows.has(item.id) ? <ArrowDownIcon /> : <ArrowRightIcon />}
                      </IconButton>
                      <div>
                        <Typography className={styles.itemCode}>
                          {item.code}
                        </Typography>
                        <Typography className={styles.itemName}>
                          {item.name}
                        </Typography>
                        <Typography className={styles.itemQuantity}>
                          {item.quantity} Each
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  {vendors.map((vendor) => {
                    const vendorData = item.vendors[vendor.id];
                    return (
                      <TableCell key={vendor.id} className={styles.dataCell}>
                        <div className={styles.priceContainer}>
                          <Typography className={styles.price}>
                            {vendorData ? formatPrice(vendorData.price) : '-'}
                          </Typography>
                          {vendorData?.isWinner && (
                            <Chip 
                              label="Winner" 
                              className={styles.l1Badge}
                              size="small"
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className={styles.dataCell}>
                    <Typography className={styles.summaryPrice}>
                      {formatPrice(item.min)}
                    </Typography>
                  </TableCell>
                  <TableCell className={styles.dataCell}>
                    <div className={styles.savingsContainer}>
                      {(() => {
                        const savingsData = calculateSavingsVsTarget(item);
                        return (
                          <>
                            <Typography 
                              className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.negativeAmount : styles.positiveAmount}`}
                              style={{ fontSize: '13px', fontWeight: '500' }}
                            >
                              {savingsData.isPositive ? '+' : '-'}{formatPrice(savingsData.savings)}
                            </Typography>
                            <Typography 
                              className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.negativeAmount : styles.positiveAmount}`}
                              style={{ fontSize: '11px', marginTop: '2px' }}
                            >
                              ({savingsData.percentage.toFixed(1)}%)
                            </Typography>
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Commercial Terms */}
                {expandedRows.has(item.id) && (
                  <>
                    {getCommercialTermsKeys(item).map((termKey, termIndex) => (
                      <TableRow key={`${item.id}-${termKey}`} className={styles.expandedRow}>
                        <TableCell className={styles.firstColumn}>
                          <div className={styles.termLabel}>
                            <Typography className={styles.termName}>
                              {formatTermLabel(termKey)}
                            </Typography>
                          </div>
                        </TableCell>
                        {vendors.map((vendor) => {
                          const vendorData = item.vendors[vendor.id];
                          const termValue = vendorData?.commercialTerms?.[termKey];
                          return (
                            <TableCell key={vendor.id} className={styles.dataCell}>
                              <Typography 
                                className={`${styles.termValue} ${getCommercialTermColor(termValue, vendorData?.basePrice)}`}
                              >
                                {termValue !== undefined ? formatPrice(termValue) : '-'}
                              </Typography>
                            </TableCell>
                          );
                        })}
                        <TableCell className={styles.dataCell}>-</TableCell>
                        <TableCell className={styles.dataCell}>-</TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={items.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        className={styles.pagination}
      />
    </div>
  );
};

export default ItemLevelDetails;