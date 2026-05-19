import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import styles from './ExecutiveSummary.module.css';

const SupplierPriceChart = ({ data }) => {
  // Extract unique versions for dropdown
  const availableVersions = useMemo(() => {
    if (!data?.priceSupplierData || !Array.isArray(data.priceSupplierData)) {
      return [];
    }
    
    const versions = [...new Set(data.priceSupplierData.map(item => item.version))];
    return versions.sort((a, b) => a - b);
  }, [data]);

  // Set default selected version to first available
  const [selectedVersion, setSelectedVersion] = useState(availableVersions[0] || 1);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Filter data for selected version
  const chartData = useMemo(() => {
    if (!data?.priceSupplierData || !Array.isArray(data.priceSupplierData)) {
      return [];
    }

    return data.priceSupplierData
      .filter(item => item.version === selectedVersion)
      .map(item => ({
        supplier: item.supplier || 'Unknown',
        price: item.price || 0
      }))
      .sort((a, b) => a.price - b.price); // Sort by price for better visualization
  }, [data, selectedVersion]);

  // Chart dimensions - matching other charts
  const chartHeight = 180;
  const chartWidth = Math.max(350, chartData.length * 120); // More space for supplier names
  const barWidth = 30;
  const barSpacing = 30;

  // Find max value for scaling
  const maxValue = Math.max(...chartData.map(item => item.price), 1);

  // Handle dropdown change
  const handleVersionChange = (event) => {
    setSelectedVersion(event.target.value);
  };

  // Handle mouse events
  const handleMouseEnter = (bar, event, barX) => {
    // Calculate tooltip position relative to the bar center
    const tooltipX = Math.min(Math.max(barX + barWidth / 2, 100), chartWidth - 100);
    const tooltipY = Math.max(50, chartHeight + 20 - ((bar.price / maxValue) * chartHeight) - 50);
    
    setTooltipPosition({ x: tooltipX, y: tooltipY });
    setHoveredBar(bar);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  // Update selected version when data changes
  React.useEffect(() => {
    if (availableVersions.length > 0 && !availableVersions.includes(selectedVersion)) {
      setSelectedVersion(availableVersions[0]);
    }
  }, [availableVersions, selectedVersion]);

  if (chartData.length === 0) {
    return (
      <Card className={styles.chartCard}>
        <CardContent sx={{ padding: '12px !important', paddingBottom: '12px !important' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" className={styles.chartTitle}>
              Supplier Prices
            </Typography>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={selectedVersion}
                onChange={handleVersionChange}
                displayEmpty
                sx={{ fontSize: '12px', height: '32px' }}
              >
                {availableVersions.map((version) => (
                  <MenuItem key={version} value={version} sx={{ fontSize: '12px' }}>
                    V{version}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              No supplier price data available for this version
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={styles.chartCard}>
      <CardContent sx={{ padding: '12px !important', paddingBottom: '12px !important' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" className={styles.chartTitle}>
            Supplier Prices by Version
          </Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={selectedVersion}
              onChange={handleVersionChange}
              displayEmpty
              sx={{ fontSize: '12px', height: '32px' }}
            >
              {availableVersions.map((version) => (
                <MenuItem key={version} value={version} sx={{ fontSize: '12px' }}>
                  V{version}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <div className={styles.chartContainer} style={{ overflowX: 'auto' }}>
          <svg width={chartWidth} height={300} style={{ minWidth: '300px' }}>
            {/* Y-axis */}
            <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e0e0e0" strokeWidth="1"/>
            
            {/* X-axis */}
            <line x1="40" y1={chartHeight + 20} x2={chartWidth - 20} y2={chartHeight + 20} stroke="#333" strokeWidth="1"/>
            
            {/* Horizontal grid lines */}
            {maxValue > 0 && (() => {
              const stepSize = maxValue <= 50000 ? Math.ceil(maxValue / 5 / 10000) * 10000 : Math.ceil(maxValue / 5);
              const gridLines = [];
              for (let i = stepSize; i <= maxValue; i += stepSize) {
                // const y = chartHeight + 20 - (i / maxValue) * chartHeight;
                const y = maxValue > 0
                    ? chartHeight + 20 - (i / maxValue) * chartHeight
                    : chartHeight + 20;
                gridLines.push(
                  <line key={`grid-${i}`} x1="40" y1={y} x2={chartWidth - 20} y2={y} stroke="#f5f5f5" strokeWidth="1"/>
                );
              }
              return gridLines;
            })()}
            
            {/* Y-axis labels */}
            {maxValue > 0 && (() => {
              const stepSize = maxValue <= 50000 ? Math.ceil(maxValue / 5 / 10000) * 10000 : Math.ceil(maxValue / 5);
              const yLabels = [];
              for (let i = 0; i <= maxValue; i += stepSize) {
                yLabels.push(i);
              }
              if (yLabels[yLabels.length - 1] !== maxValue) {
                yLabels.push(maxValue);
              }
              
              return yLabels.map((value, index) => {
                // const y = chartHeight + 20 - (value / maxValue) * chartHeight;
                const y = maxValue > 0
                  ? chartHeight + 20 - (value / maxValue) * chartHeight
                  : chartHeight + 20;
                return (
                  <g key={`y-label-${value}`}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="#e0e0e0" strokeWidth="1"/>
                    <text x="30" y={y + 3} textAnchor="end" fontSize="10" fill="#666">
                      {value === 0 ? '0' : `${(value / 1000).toFixed(0)}K`}
                    </text>
                  </g>
                );
              });
            })()}
            
            {/* Supplier bars and labels */}
            {chartData.map((item, index) => {
              const x = 70 + index * (barWidth + barSpacing);
              const centerX = x + barWidth / 2;
              
              // Calculate bar height
            const barHeight =
              maxValue > 0 && !isNaN(item.price)
                ? (item.price / maxValue) * chartHeight
                : 0;              
              // Format supplier name - split long names
              const supplierName = item.supplier;
              const maxCharsPerLine = 12;
              const words = supplierName.split(' ');
              const lines = [];
              let currentLine = '';
              
              words.forEach(word => {
                if ((currentLine + word).length <= maxCharsPerLine) {
                  currentLine += (currentLine ? ' ' : '') + word;
                } else {
                  if (currentLine) lines.push(currentLine);
                  currentLine = word;
                }
              });
              if (currentLine) lines.push(currentLine);
              
              // Limit to 2 lines max
              if (lines.length > 2) {
                lines[1] = lines[1].substring(0, 8) + '...';
                lines.splice(2);
              }
              
              return (
                <g key={index}>
                  {/* X-axis tick */}
                  <line x1={centerX} y1={chartHeight + 20} x2={centerX} y2={chartHeight + 25} stroke="#333" strokeWidth="1"/>
                  
                  {/* Price bar */}
                  <rect
                    x={x}
                    y={chartHeight + 20 - Math.max(0, barHeight)}
                    width={barWidth}
                    height={Math.max(0, barHeight)}
                    fill="#1976d2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => handleMouseEnter({ supplier: item.supplier, price: item.price }, e, x)}
                    onMouseLeave={handleMouseLeave}
                  />
                  
                  {/* Price label on top of bar */}
                  <text
                    x={centerX}
                    y={chartHeight + 20 - Math.max(0, barHeight) - 5}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#333"
                    fontWeight="500"
                  >
                    {(item.price / 1000).toFixed(0)}K
                  </text>
                  
                  {/* Supplier name label - multi-line without rotation */}
                  {lines.map((line, lineIndex) => {
                    // Only add hover for the last line if truncated
                    const isTruncated = lines.length > 1 && lineIndex === 1 && supplierName.length > (maxCharsPerLine + 8);
                    return (
                      <text
                        key={lineIndex}
                        x={centerX}
                        y={chartHeight + 45 + lineIndex * 12}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#333"
                        style={isTruncated ? { cursor: 'pointer' } : {}}
                        onMouseEnter={isTruncated ? (e) => {
                          // Show tooltip for truncated label
                          handleMouseEnter({ supplier: supplierName, price: item.price }, e, x);
                        } : undefined}
                        onMouseLeave={isTruncated ? handleMouseLeave : undefined}
                      >
                        {line}
                      </text>
                    );
                  })}
                </g>
              );
            })}



            {/* Tooltip */}
            {hoveredBar && (
              <g style={{ pointerEvents: 'none' }}>
                {/* Tooltip background */}
                <rect
                  x={tooltipPosition.x - Math.max(120, hoveredBar.supplier.length * 7 / 2)}
                  y={tooltipPosition.y - 40}
                  width={Math.max(240, hoveredBar.supplier.length * 7)}
                  height="35"
                  fill="rgba(0, 0, 0, 0.8)"
                  rx="4"
                  ry="4"
                />
                {/* Supplier name - always show full label in tooltip */}
                <text
                  x={tooltipPosition.x}
                  y={tooltipPosition.y - 25}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="500"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {hoveredBar.supplier}
                </text>
                {/* Price value */}
                <text
                  x={tooltipPosition.x}
                  y={tooltipPosition.y - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                >
                  {hoveredBar.price?.toLocaleString()}
                </text>
              </g>
            )}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierPriceChart;