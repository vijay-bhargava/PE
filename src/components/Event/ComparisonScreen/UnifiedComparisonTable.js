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
  Link,
  Tooltip
} from '@mui/material';
import WhiteTooltip from '../../whitetooltip';
import { BsInfoCircle } from "react-icons/bs";
import {
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import styles from './UnifiedComparisonTable.module.css';
import { formatDateViaLocale } from '../../../utils/common/utility';
import { actionTypes, useStateValue } from '../../../store';

const UnifiedComparisonTable = ({ data, loadingFactor, handleSupplierModalOpen }) => {
  const [state, { userDetail }] = useStateValue();
  // Transform tempData to match expected format
  const transformedData = React.useMemo(() => {
    if (!data || !data.suppliers || !data.items) {
      return { vendors: [], packageLevel: { vendors: [] }, items: [] };
    }

    // Filter active suppliers (those with status 'Closed' indicating they have submitted quotes)
    const activeSuppliers = data.suppliers.filter(supplier => supplier.status === 'Closed');

    // Sort suppliers by their actual ranking from tempData
    const sortedSuppliers = [...activeSuppliers].sort((a, b) => {
      return (a.ranking || 999) - (b.ranking || 999);
    });
    // Transform suppliers to vendors format using actual ranking
    const vendors = sortedSuppliers.map((supplier) => ({
      id: supplier.vendorId,
      name: supplier.companyName,
      // label: supplier.responseDate ? new Date(supplier.responseDate).toLocaleDateString('en-US', {
      //   year: 'numeric',
      //   month: 'short',
      //   day: 'numeric',
      //   hour: '2-digit',
      //   minute: '2-digit'
      // }) : '',
      label: formatDateViaLocale(supplier.responseDate, userDetail),
      color: '#2196f3',
      commercialRanking: supplier.ranking ? `L${supplier.ranking || 1}` : '', // Use actual ranking from tempData
      acceptedCurrency: supplier.acceptedCurrency || 'INR' // Add accepted currency to vendors array
    }));

    // Transform package level data using sorted suppliers
    const packageLevel = {
      vendors: sortedSuppliers.map(supplier => ({
        name: supplier.companyName,
        packagePrice: supplier.ranking && supplier.packagePrice && supplier.packagePrice > 0 ? Number(supplier.packagePrice).toFixed(2) : 'NA',
        loadingFactor: supplier.loadingAmount > 0 ? supplier.loadingAmount : 'N/A',
        amount: supplier.rfqVendorAmount && supplier.rfqVendorAmount > 0 ? Number(supplier.rfqVendorAmount).toFixed(2) : 'Not Quoted',
        vendorId: supplier.vendorId, // Add vendorId for reference
        ranking: supplier.ranking ? supplier.ranking : '' // Include ranking if needed
      })),
      packageCommercialTerms: (data.packageCommercialTerms || []).filter(term => term.name != term.grandTotalTermName)
    };

    // Debug packageCommercialTerms data availability
    console.log('Full data object keys:', Object.keys(data));
    console.log('packageCommercialTerms exists:', !!data.packageCommercialTerms);
    console.log('packageCommercialTerms length:', data.packageCommercialTerms?.length);
    console.log('packageCommercialTerms data:', data.packageCommercialTerms);

    // Transform items data
    const items = data.items.map(item => {
      const transformedItem = {
        id: `ITEM-${item.id}`,
        itemCode: item.itemCode || "",
        name: item.itemName,
        quantity: item.quantity,
        uom: item.uom,
        targetPrice: item.targetPrice || 0,
        unitRate: item.unitRate || 0,
        deliveryLocation: item.plant || "",
        vendorRemarks: item.vendorRemarks || "",
        poDetails: {
          poNumber: item.poNumber || "",
          poValue: item.poValue || 0,
          poDate: item.poDate || "",
          poVendorName: item.poVendorName || ""
        },
        vendors: {}
      };

      // Process vendor item details
      const vendorPrices = [];
      item.vendorItemDetails?.forEach(vendorDetail => {
        const vendor = sortedSuppliers.find(s => s.vendorId === vendorDetail.vendorId);
        if (vendor) {
          const commercialTerms = {};
          // Transform commercial terms and store value types
          vendorDetail.vendorItemCommercials?.forEach(commercial => {
            const termKey = commercial.name.toLowerCase().replace(/\s+/g, '');
            commercialTerms[termKey] = {
              value: commercial.calculateCommValue || commercial.enterCommValue, // Support both field names for backward compatibility
              valueType: commercial.valueType,
              name: commercial.name,
              grandTotalTermName: commercial.grandTotalTermName,
            };
          });

          transformedItem.vendors[vendorDetail.vendorId] = {
            price: vendorDetail.convertedItemPrice || vendorDetail.itemPrice || 0, // Prioritize convertedItemPrice
            isWinner: vendorDetail.itemRanking === 1,
            vendorRemarks: vendorDetail.vendorRemarks || "",
            commercialTerms,
            // Store original commercial data for reference
            vendorItemCommercials: vendorDetail.vendorItemCommercials
          };

          vendorPrices.push(vendorDetail.convertedItemPrice || vendorDetail.itemPrice || 0);
        }
      });
      const validPrices = vendorPrices.filter(price => price > 0);
      // Calculate min, max, avg
      if (validPrices.length > 0) {
        transformedItem.min = Math.min(...validPrices);
        transformedItem.max = Math.max(...validPrices);
        transformedItem.avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
      } else {
        transformedItem.min = 0;
        transformedItem.max = 0;
        transformedItem.avg = 0;
      }

      return transformedItem;
    });

    return { vendors, packageLevel, items };
  }, [data]);

  const { vendors, packageLevel, items } = transformedData;
  const [isPackageExpanded, setIsPackageExpanded] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [expandedPackageRows, setExpandedPackageRows] = useState(new Set());
  const [showTargetColumns, setShowTargetColumns] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const calculatePackageTagetPrice = () => {
    if (items && items.length > 0) {
      const totalTargetPrice = items.reduce((total, item) => total + ((item.targetPrice * item.quantity) || 0), 0);
      return totalTargetPrice;
    }
  }


  const handlePackageToggle = () => {
    setIsPackageExpanded(!isPackageExpanded);
  };

  const handleTargetColumnsToggle = () => {
    setShowTargetColumns(!showTargetColumns);
  };

  const toggleRowExpansion = (itemId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const togglePackageRowExpansion = (packageFieldKey) => {
    const newExpanded = new Set(expandedPackageRows);
    if (newExpanded.has(packageFieldKey)) {
      newExpanded.delete(packageFieldKey);
    } else {
      newExpanded.add(packageFieldKey);
    }
    setExpandedPackageRows(newExpanded);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') {
      return '-';
    }
    // Check if it's a price field and handle zero values, remove currency symbols
    if (typeof value === 'string' && (value.includes('INR') || value.includes('$') || value.includes('₹') || value.includes('USD') || value.includes('EURO'))) {
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
      if (numericValue === 0) {
        return 'Not Quoted';
      }
      // const value = thousands_separators(numericValue.toFixed(2));
      // Return only the numeric value without currency
      return numericValue.toLocaleString(state.culturecode ?? "en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    const newValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return newValue.toLocaleString(state.culturecode ?? "en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPrice = (price, culture = 'en-IN') => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Not Quoted';
    }

    let numericPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numericPrice) || numericPrice === 0) {
      return 'Not Quoted';
    }

    return numericPrice.toLocaleString(state.culturecode ?? "en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatTargetPrice = (price, currency = 'INR') => {
    if (price === null || price === undefined || isNaN(price)) {
      return '0.00';
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    // Return only numeric value without currency symbol
    return numericPrice.toLocaleString(state.culturecode ?? "en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPODate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const createPOTooltipContent = (poDetails) => {
    return (
      <div style={{ padding: '8px' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>PO Number:</strong> {poDetails.poNumber || '-'}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>PO Value:</strong> {poDetails.poValue ? formatTargetPrice(poDetails.poValue) : '-'}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>PO Date:</strong> {formatPODate(poDetails.poDate)}
        </div>
        <div>
          <strong>PO Supplier:</strong> {poDetails.poVendorName || '-'}
        </div>
      </div>
    );
  };

  const getCommercialTermsKeys = (item) => {
    const termKeys = new Set();

    vendors.forEach(vendor => {

      const vendorData = item.vendors[vendor.id];
      if (vendorData?.commercialTerms) {
        Object.keys(vendorData.commercialTerms).forEach(key => {
          // Exclude total fields (since they're redundant with the main price)

          if (vendorData.commercialTerms[key].name != vendorData.commercialTerms[key].grandTotalTermName) {

            termKeys.add(key);
          }
        });
      }
    });
    return Array.from(termKeys);
  };

  const getPackageCommercialTermsKeys = () => {
    if (!packageLevel?.packageCommercialTerms || packageLevel.packageCommercialTerms.length === 0) {
      return [];
    }

    return packageLevel.packageCommercialTerms
      .filter(term => {
        // Only include terms that have at least one vendor with data
        return term.vendorPackageCommercial && term.vendorPackageCommercial.length > 0;
      })
      .map(term => ({
        id: term.id,
        name: term.name,
        valueType: term.valueType,
        vendorData: term.vendorPackageCommercial
      }));
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
      // tempData specific terms
      price: 'Price',
      gst: 'GST',
      total: 'Total',
      logisticcharges: 'Logistic Charges',
      portcharges: 'Port Charges'
    };
    return labelMap[termKey] || termKey.charAt(0).toUpperCase() + termKey.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getCommercialTermColor = (termValue, basePrice) => {
    if (!termValue || termValue === 0) return '';
    return termValue > 0 ? styles.positiveAmount : styles.negativeAmount;
  };

  const getRankingBadgeClass = (ranking) => {
    switch (ranking) {
      case 'L1': return styles.l1Badge;
      case 'L2': return styles.l2Badge;
      case 'L3': return styles.l3Badge;
      default: return '';
    }
  };

  const calculateSavingsVsTarget = (item) => {
    const lowestPrice = item.min || 0;
    const targetPrice = item.targetPrice || 0;

    if (targetPrice === 0 || lowestPrice === 0) {
      return {
        savings: 0,
        percentage: 0,
        isPositive: true
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

  const calculateSavingsVsUnitRate = (item) => {
    const lowestPrice = item.min || 0;
    const unitRate = item.unitRate || 0;

    if (unitRate === 0 || lowestPrice === 0) {
      return {
        savings: 0,
        percentage: 0,
        isPositive: true
      };
    }

    const savings = unitRate - lowestPrice;
    const percentage = (savings / unitRate) * 100;

    return {
      savings: Math.abs(savings),
      percentage: Math.abs(percentage),
      isPositive: savings >= 0
    };
  };

  const calculatePackageSavingsVsTarget = (totalTargetPrice, lowestPackagePrice) => {

    if (totalTargetPrice === 0 || lowestPackagePrice === 0) {
      return {
        savings: 0,
        percentage: 0,
        isPositive: true
      }
    }
    const savings = totalTargetPrice - lowestPackagePrice;
    const percentage = totalTargetPrice > 0 ? (savings / totalTargetPrice) * 100 : 0;
    return {
      savings: Math.abs(savings),
      percentage: Math.abs(percentage),
      isPositive: savings >= 0
    }
  }

  // Helper function to get price color based on min/max values
  const getPriceColor = (currentValue, values) => {
    // Filter out null, undefined, non-numeric values, and zero values
    const numericValues = values
      .map(val => {
        if (val === null || val === undefined || val === '' || val === 'N/A' || val === '-') return null;
        if (typeof val === 'string') {
          // Remove currency symbols and convert to number
          const cleaned = val.replace(/[^\d.-]/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) || num <= 0 ? null : num; // Exclude zero and negative values
        }
        return typeof val === 'number' && val > 0 ? val : null; // Only include positive values
      })
      .filter(val => val !== null);

    if (numericValues.length === 0) return '';

    // Convert current value to numeric
    let currentNumeric = currentValue;
    if (typeof currentValue === 'string') {
      const cleaned = currentValue.replace(/[^\d.-]/g, '');
      currentNumeric = parseFloat(cleaned);
    }

    if (isNaN(currentNumeric) || currentNumeric <= 0) return ''; // No color for zero or negative values

    const minValue = Math.min(...numericValues);
    const maxValue = Math.max(...numericValues);

    // If all prices are the same, color them all green (lowest/best)
    if (minValue === maxValue) {
      return currentNumeric === minValue ? styles.lowestPrice : '';
    }

    // If current price equals the minimum (lowest), color it green
    if (currentNumeric === minValue) return styles.lowestPrice;

    // If current price equals the maximum (highest), color it red
    if (currentNumeric === maxValue) return styles.highestPrice;

    return '';
  };

  // Get package fields for dynamic rendering
  const getPackageFields = () => {
    if (!packageLevel?.vendors || packageLevel.vendors.length === 0) {
      return [];
    }

    const firstVendor = packageLevel.vendors[0];
    const fields = Object.keys(firstVendor).filter(
      key => key !== 'name' && key !== 'vendorId'
    );

    const fieldMapping = {
      packagePrice: 'Package Price',
      loadingFactor: 'Loading Factor',
      amount: 'Final Amount'
    };

    const desiredOrder = ['amount', 'loadingFactor', 'packagePrice'];

    return desiredOrder
      .filter(field => fields.includes(field))
      .map(field => ({
        key: field,
        label: fieldMapping[field]
      }));
  };

  const packageFields = getPackageFields();
  const paginatedItems = (items || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className={styles.unifiedComparisonTable}>
      <TableContainer className={styles.tableContainer} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: `${280 + ((packageLevel?.vendors?.length || vendors.length) * 280) + 240 + (showTargetColumns ? 372 : 0)}px` }}>
          {/* Shared Header */}
          <TableHead className={styles.tableHeader}>
            <TableRow className={styles.headerRow}>
              <TableCell className={styles.headerCellFirst}>
                {/* <div className={styles.comparisonDetailsWrapper}> */}
                <Typography className={styles.comparisonTitle}>
                  Comparison Details
                </Typography>

                <Typography className={styles.comparisonSubTitle}>
                  TOTAL VENDORS : {vendors.length}
                </Typography>
                {/* </div> */}
              </TableCell>

              {showTargetColumns && (
                <>
                  <TableCell className={styles.stickyTargetHeader}>Target Price</TableCell>
                  <TableCell className={styles.stickyQuantityHeader}>Quantity</TableCell>
                  <TableCell className={styles.stickyDeliveryLocationHeader}>Delivery</TableCell>
                  <TableCell className={styles.stickyUnitRateHeader}>Unit Rate</TableCell>
                </>
              )}

              {(packageLevel?.vendors || vendors)?.map((vendor, index) => {
                const vendorName = vendor.name;
                const vendorLabel =
                  vendors[index]?.label || vendor.label || vendor.submissionTime || "";
                const ranking = vendors[index]?.commercialRanking;
                const acceptedCurrency = vendors[index]?.acceptedCurrency || "INR";
                const vendorId = vendor.vendorId;

                return (
                  <TableCell key={index} className={styles.vendorHeaderCell}>
                    <div className={styles.vendorCard}>
                      {ranking && (
                        <div
                          className={`${styles.rankBadge} ${ranking === "L1"
                            ? styles.rankL1
                            : ranking === "L2"
                              ? styles.rankL2
                              : styles.rankL3
                            }`}
                        >
                          {ranking}
                        </div>
                      )}

                      <div className={styles.vendorLabel}>
                        VENDOR {index + 1}
                      </div>

                      <Typography
                        className={styles.vendorNameNew}
                        onClick={() =>
                          handleSupplierModalOpen(vendorId || vendor.id)
                        }
                      >
                        {vendorName?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                      </Typography>

                      <div className={styles.metaGrid}>
                        <div className={styles.metaBlock}>
                          <div className={styles.metaLabel}>Currency:</div>
                          <div className={styles.metaValue}>{acceptedCurrency}</div>
                        </div>

                        <div className={styles.metaBlock}>
                          <div className={styles.metaLabel}>Date:</div>
                          <div className={styles.metaValue}>{vendorLabel}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                );
              })}

              <TableCell className={styles.summaryHeaderNew}>
                Lowest Price
              </TableCell>

              <TableCell className={styles.summaryHeaderNew}>
                Savings
              </TableCell>

              <TableCell className={styles.summaryHeaderNew}>
                LPP
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Package Details Data Rows - Show directly under main header */}
            {isPackageExpanded && packageFields.map((field) => {
              // Get all values for this field to determine min/max for color coding
              const fieldValues = packageLevel?.vendors?.map(vendor => vendor?.[field.key]) || [];
              const packageCommercialTerms = getPackageCommercialTermsKeys();
              const hasCommercialTerms = field.key === 'packagePrice' && packageCommercialTerms.length > 0;
              const prices = packageLevel.vendors.map(vendor => parseFloat(vendor.packagePrice)).filter(price => !isNaN(price) && price > 0);
              const lowestPackagePrice = prices.length > 0 ? Math.min(...prices) : 0;
              const totalTargetPrice = items.reduce((total, item) => total + ((item.targetPrice * item.quantity) || 0), 0);
              const totalPOUnitRate = items.reduce((total, item) => total + ((item.unitRate * item.quantity) || 0), 0);

              if (field.key == 'ranking') {
                return null;
              }
              return (
                <Fragment key={`package-${field.key}`}>
                  <TableRow className={styles.packageRow}>
                    <TableCell className={styles.subRowCell}>
                      <div className={styles.packageInfoNew}>
                        {field.key === 'packagePrice' ? (
                          <IconButton
                            size="small"
                            onClick={hasCommercialTerms ? () => togglePackageRowExpansion(field.key) : undefined}
                            className={styles.expandBtnNew}
                            style={{
                              cursor: hasCommercialTerms ? 'pointer' : 'default',
                              opacity: hasCommercialTerms ? 1 : 0.3
                            }}
                          >
                            {hasCommercialTerms && expandedPackageRows.has(field.key) ? <ArrowDownIcon /> : <ArrowRightIcon />}
                          </IconButton>
                        ) : (
                          <div className={styles.packageSpacer}></div>
                        )}
                        <div>
                          <Typography className={styles.packageLabelNew}>
                            {field.label}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    {showTargetColumns && (
                      <>
                        <TableCell className={styles.stickyTargetCell}>
                          {field.key === 'packagePrice' ? (
                            <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                              {totalTargetPrice > 0 ? formatPrice(totalTargetPrice) : '-'}
                            </Typography>
                          ) : (
                            <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell className={styles.stickyQuantityCell}>
                          <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                            -
                          </Typography>
                        </TableCell>
                        <TableCell className={styles.stickyDeliveryLocationCell}>
                          <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                            -
                          </Typography>
                        </TableCell>
                        <TableCell className={styles.stickyUnitRateCell}>
                          <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                            {field.key === 'packagePrice' ? (
                              <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                                {totalPOUnitRate > 0 ? formatPrice(totalPOUnitRate) : '-'}
                              </Typography>
                            ) : (
                              <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                                -
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                      </>
                    )}
                    {packageLevel?.vendors?.map((packageVendorData, index) => {

                      const fieldValue = packageVendorData?.[field.key];
                      const priceColorClass = packageVendorData.ranking == 1 ? styles.lowestPrice : '';

                      // Get the corresponding vendor ID from the vendors array
                      const vendorId = vendors[index]?.id;

                      return (
                        <TableCell key={index} className={styles.dataCell}>
                          <div className={styles.priceContainer}>
                            {field.key === 'loadingFactor' ? (
                              <Link
                                component="button"
                                onClick={() => loadingFactor(vendorId)}
                                style={{
                                  textDecoration: 'underline',
                                  textAlign: 'left !important',
                                  color: '#292929',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  fontSize: '13px',
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  '&:hover': {
                                    textDecoration: 'underline',
                                    color: '#000000'
                                  }
                                }}
                              >
                                {fieldValue || 'N/A'}
                              </Link>
                            ) : (
                              <div className={styles.priceWithStatus}>
                                <Typography className={`${styles.priceNew} ${priceColorClass}`}>
                                  {formatValue(fieldValue)}
                                </Typography>

                                {priceColorClass === styles.lowestPrice && (
                                  <div className={`${styles.statusIcon} ${styles.successIcon}`}> ✓ </div>
                                )}

                                {priceColorClass === styles.highestPrice && (
                                  <div className={`${styles.statusIcon} ${styles.dangerIcon}`}> ! </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell
                      className={styles.dataCell}
                      style={{
                        width: '93px',
                        minWidth: '93px',
                        maxWidth: '93px',
                        padding: '8px 12px',
                        textAlign: 'center'
                      }}
                    >
                      {field.key === 'packagePrice' ? (
                        <Typography className={styles.summaryPrice}>
                          {lowestPackagePrice > 0 ? formatPrice(lowestPackagePrice) : '-'}
                        </Typography>
                      ) : (
                        <Typography className={styles.summaryPrice}>

                        </Typography>
                      )}

                    </TableCell>
                    <TableCell
                      className={styles.dataCell}
                      style={{
                        width: '93px',
                        minWidth: '93px',
                        maxWidth: '93px',
                        padding: '8px 12px',
                        textAlign: 'center'
                      }}
                    >
                      {field.key === 'packagePrice' ? (
                        (() => {
                          const savingsData = calculatePackageSavingsVsTarget(totalTargetPrice, lowestPackagePrice);
                          return (
                            <>
                              <Typography
                                className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                                style={{ fontSize: '13px', fontWeight: '500' }}
                              >
                                {savingsData.isPositive ? '+' : '-'}{formatTargetPrice(savingsData.savings)}
                              </Typography>
                              <Typography
                                className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                                style={{ fontSize: '11px', marginTop: '2px' }}
                              >
                                ({savingsData.percentage.toFixed(1)}%)
                              </Typography>
                            </>
                          );
                        })()
                      ) : (
                        <Typography className={styles.summaryPrice}>
                          -
                        </Typography>
                      )}



                    </TableCell>
                    <TableCell
                      className={styles.dataCell}
                      style={{
                        width: '93px',
                        minWidth: '93px',
                        maxWidth: '93px',
                        padding: '8px 12px',
                        textAlign: 'center'
                      }}
                    >
                      {field.key === 'packagePrice' ? (
                        (() => {
                          const savingsData = calculatePackageSavingsVsTarget(totalPOUnitRate, lowestPackagePrice);
                          return (
                            <>
                              <Typography
                                className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                                style={{ fontSize: '13px', fontWeight: '500' }}
                              >
                                {savingsData.isPositive ? '+' : '-'}{formatTargetPrice(savingsData.savings)}
                              </Typography>
                              <Typography
                                className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                                style={{ fontSize: '11px', marginTop: '2px' }}
                              >
                                ({savingsData.percentage.toFixed(1)}%)
                              </Typography>
                            </>
                          );
                        })()
                      ) : (
                        <Typography className={styles.summaryPrice}>
                          -
                        </Typography>
                      )}



                    </TableCell>
                  </TableRow>

                  {/* Package Commercial Terms - Show when expanded */}
                  {hasCommercialTerms && expandedPackageRows.has(field.key) && (
                    <>
                      {packageCommercialTerms.map((term) => (
                        <TableRow key={`package-term-${term.id}`} className={styles.expandedRow}>
                          <TableCell className={styles.subRowCell}>
                            <div className={styles.packageInfo}>
                              <div className={styles.termSpacer}></div>
                              <div>
                                <Typography className={styles.termName}>
                                  {term.name}
                                </Typography>
                              </div>
                            </div>
                          </TableCell>
                          {showTargetColumns && (
                            <>
                              <TableCell className={styles.stickyTargetCell}>-</TableCell>
                              <TableCell className={styles.stickyQuantityCell}>-</TableCell>
                              <TableCell className={styles.stickyDeliveryLocationCell}>-</TableCell>
                              <TableCell className={styles.stickyUnitRateCell}>-</TableCell>
                            </>
                          )}
                          {vendors.map((vendor) => {
                            // Find vendor data in packageCommercialTerms
                            const vendorTermData = term.vendorData.find(
                              vData => vData.vendorId === vendor.id
                            );
                            const termValue = vendorTermData?.enterCommValue;

                            // Get all values for this term to determine min/max for color coding
                            const termValues = term.vendorData
                              .map(vData => vData.enterCommValue)
                              .filter(val => val !== undefined && val !== null && val !== 0);

                            const priceColorClass = termValue !== undefined && termValue !== 0 ?
                              getPriceColor(termValue, termValues) : '';

                            // Format the term value based on its type
                            const formatPackageTermValue = (value, type) => {
                              if (value === undefined || value === null || value === 0) return 'Not Quoted';

                              if (type === 'Percentage') {
                                return `${value}%`;
                              } else {
                                return formatPrice(value);
                              }
                            };

                            return (
                              <TableCell key={vendor.id} className={styles.dataCell}>
                                <div className={styles.priceWithStatus}>
                                  <Typography className={`${styles.priceNew} ${priceColorClass}`}>
                                    {formatPackageTermValue(termValue, term.valueType)}
                                  </Typography>

                                  {priceColorClass === styles.lowestPrice && (
                                    <div className={`${styles.statusIcon} ${styles.successIcon}`}> ✓ </div>
                                  )}

                                  {priceColorClass === styles.highestPrice && (
                                    <div className={`${styles.statusIcon} ${styles.dangerIcon}`}> ! </div>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell
                            className={styles.dataCell}
                            style={{
                              width: '93px',
                              minWidth: '93px',
                              maxWidth: '93px',
                              padding: '8px 12px',
                              textAlign: 'center'
                            }}
                          >-</TableCell>
                          <TableCell
                            className={styles.dataCell}
                            style={{
                              width: '93px',
                              minWidth: '93px',
                              maxWidth: '93px',
                              padding: '8px 12px',
                              textAlign: 'center'
                            }}
                          >-</TableCell>
                          <TableCell
                            className={styles.dataCell}
                            style={{
                              width: '93px',
                              minWidth: '93px',
                              maxWidth: '93px',
                              padding: '8px 12px',
                              textAlign: 'center'
                            }}
                          >-</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </Fragment>
              );
            })}

            {/* Item Details Data Rows - Always visible */}
            {paginatedItems.map((item) => (
              <Fragment key={item.id}>
                <TableRow className={styles.itemRow}>
                  <TableCell className={styles.subRowCell}>
                    <div className={styles.itemCard}>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(item.id)}
                        className={styles.expandBtnNew}
                      >
                        {expandedRows.has(item.id) ? <ArrowDownIcon /> : <ArrowRightIcon />}
                      </IconButton>
                      <div>
                        <Typography className={styles.itemCodeNew}>
                          {item.itemCode}
                        </Typography>
                        <Typography className={styles.itemNameNew}>
                          {item.name}
                        </Typography>
                      </div>
                    </div>
                  </TableCell>
                  {showTargetColumns && (
                    <>
                      <TableCell className={styles.stickyTargetCell}>
                        <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                          {formatTargetPrice(item.targetPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell className={styles.stickyQuantityCell}>
                        <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                          {item.quantity} {item.uom}
                        </Typography>
                      </TableCell>
                      <TableCell className={styles.stickyDeliveryLocationCell}>
                        <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                          {item.deliveryLocation || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell className={styles.stickyUnitRateCell}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Typography style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                            {formatTargetPrice(item.unitRate)}
                          </Typography>
                          {(item.poDetails?.poNumber || item.poDetails?.poValue || item.poDetails?.poDate || item.poDetails?.poVendorName) && (
                            <Tooltip
                              title={createPOTooltipContent(item.poDetails)}
                              placement="top"
                              arrow
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: '#7e7d7dff',
                                    color: 'white',
                                    fontSize: '12px',
                                    maxWidth: '300px',
                                    '& .MuiTooltip-arrow': {
                                      color: '#333',
                                    },
                                  },
                                },
                              }}
                            >
                              <InfoIcon
                                style={{
                                  fontSize: '14px',
                                  color: '#1976d2',
                                  cursor: 'pointer',
                                  opacity: 0.7
                                }}
                              />
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </>
                  )}
                  {vendors.map((vendor) => {
                    const vendorData = item.vendors[vendor.id];
                    // Get all prices for this item to determine min/max for color coding
                    const itemPrices = vendors.map(v => item.vendors[v.id]?.price).filter(Boolean);
                    const priceColorClass = vendorData?.price ? getPriceColor(vendorData.price, itemPrices) : '';

                    return (
                      <TableCell key={vendor.id} className={styles.dataCell}>
                        <div className={styles.priceContainer}>
                          <div className={styles.priceWithStatus}>
                            <Typography className={`${styles.priceNew} ${priceColorClass}`}>
                              {vendorData ? formatPrice(vendorData.price) : "Not Quoted"}
                            </Typography>

                            {priceColorClass === styles.lowestPrice && (
                              <div className={`${styles.statusIcon} ${styles.successIcon}`}> ✓</div>
                            )}

                            {priceColorClass === styles.highestPrice && (
                              <div className={`${styles.statusIcon} ${styles.dangerIcon}`}> ! </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell
                    className={styles.dataCell}
                    style={{
                      width: '93px',
                      minWidth: '93px',
                      maxWidth: '93px',
                      padding: '8px 12px',
                      textAlign: 'center'
                    }}
                  >
                    <Typography className={styles.summaryPriceNew}>
                      {formatPrice(item.min)}
                    </Typography>
                  </TableCell>
                  <TableCell
                    className={styles.dataCell}
                    style={{
                      width: '93px',
                      minWidth: '93px',
                      maxWidth: '93px',
                      padding: '8px 12px',
                      textAlign: 'center'
                    }}
                  >
                    <div className={styles.savingsContainer}>
                      {(() => {
                        const savingsData = calculateSavingsVsTarget(item);
                        return (
                          <>
                            <Typography
                              className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                              style={{ fontSize: '13px', fontWeight: '500' }}
                            >
                              {savingsData.isPositive ? '+' : '-'}{formatTargetPrice(savingsData.savings)}
                            </Typography>
                            <Typography
                              className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                              style={{ fontSize: '11px', marginTop: '2px' }}
                            >
                              ({savingsData.percentage.toFixed(1)}%)
                            </Typography>
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell
                    className={styles.dataCell}
                    style={{
                      width: '93px',
                      minWidth: '93px',
                      maxWidth: '93px',
                      padding: '8px 12px',
                      textAlign: 'center'
                    }}
                  >
                    <div className={styles.savingsContainer}>
                      {(() => {
                        const savingsData = calculateSavingsVsUnitRate(item);
                        return (
                          <>
                            <Typography
                              className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
                              style={{ fontSize: '13px', fontWeight: '500' }}
                            >
                              {savingsData.isPositive ? '+' : '-'}{formatTargetPrice(savingsData.savings)}
                            </Typography>
                            <Typography
                              className={`${styles.summaryPrice} ${savingsData.isPositive ? styles.lowestPrice : styles.highestPrice}`}
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
                    {getCommercialTermsKeys(item).map((termKey, termIndex) => {
                      // Get the actual term name from the first vendor's commercialTerms
                      const firstVendorWithTerm = vendors.find(vendor => {
                        const vendorData = item.vendors[vendor.id];
                        return vendorData?.commercialTerms?.[termKey]?.name;
                      });
                      const termName = firstVendorWithTerm ?
                        item.vendors[firstVendorWithTerm.id]?.commercialTerms?.[termKey]?.name :
                        termKey;

                      return (
                        <TableRow key={`${item.id}-${termKey}`} className={styles.expandedRow}>
                          <TableCell className={styles.firstColumn}>
                            <div className={styles.termLabel}>
                              <Typography className={styles.termName}>
                                {termName}
                              </Typography>
                            </div>
                          </TableCell>
                          {showTargetColumns && (
                            <>
                              <TableCell className={styles.stickyTargetCell}>-</TableCell>
                              <TableCell className={styles.stickyQuantityCell}>-</TableCell>
                              <TableCell className={styles.stickyDeliveryLocationCell}>-</TableCell>
                              <TableCell className={styles.stickyUnitRateCell}>-</TableCell>
                            </>
                          )}
                          {vendors.map((vendor) => {
                            const vendorData = item.vendors[vendor.id];
                            const termData = vendorData?.commercialTerms?.[termKey];
                            const termValue = termData?.value;
                            const valueType = termData?.valueType;

                            // Get all values for this commercial term to determine min/max for color coding
                            const termValues = vendors
                              .map(v => item.vendors[v.id]?.commercialTerms?.[termKey]?.value)
                              .filter(val => val !== undefined && val !== null);

                            const priceColorClass = termValue !== undefined ? getPriceColor(termValue, termValues) : '';

                            // Format the term value based on its type
                            const formatTermValue = (value, type) => {
                              if (value === undefined || value === null) return 'Not Quoted';
                              if (value === 0) return 'Not Quoted';

                              if (type === 'Percentage') {
                                return `${value}%`;
                              } else {
                                return formatPrice(value);
                              }
                            };

                            return (
                              <TableCell key={vendor.id} className={styles.dataCell}>
                                <Typography
                                  className={`${styles.termValue} ${priceColorClass}`}
                                >
                                  {formatTermValue(termValue, valueType)}
                                </Typography>
                              </TableCell>
                            );
                          })}
                          <TableCell
                            className={styles.dataCell}
                            style={{
                              width: '93px',
                              minWidth: '93px',
                              maxWidth: '93px',
                              padding: '8px 12px',
                              textAlign: 'center'
                            }}
                          >-</TableCell>
                          <TableCell
                            className={styles.dataCell}
                            style={{
                              width: '93px',
                              minWidth: '93px',
                              maxWidth: '93px',
                              padding: '8px 12px',
                              textAlign: 'center'
                            }}
                          >-</TableCell>
                          <TableCell
                            className={styles.dataCell}
                            style={{
                              width: '93px',
                              minWidth: '93px',
                              maxWidth: '93px',
                              padding: '8px 12px',
                              textAlign: 'center'
                            }}
                          >-</TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination for Item Details - Always visible when items exist */}
      {items && items.length > 0 && (
        <TablePagination
          component="div"
          count={items.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 15, 20]}
          className={styles.pagination}
        />
      )}
    </div>
  );
};

export default UnifiedComparisonTable;