import React, { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import styles from './ExecutiveSummary.module.css';

const SavingsLineChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  // Transform the data for chart - calculate savings
  const chartData = data?.savingsData?.map(item => {
    // Determine comparison price: lastInvPrice if available, otherwise targetPrice
    const comparePrice = item.lastInvPrice && item.lastInvPrice > 0 ? item.lastInvPrice : item.targetPrice && item.targetPrice > 0 ? item.targetPrice : 0;
    const comparePriceLabel = item.lastInvPrice && item.lastInvPrice > 0 ? 'Last Inv Price' : item.targetPrice && item.targetPrice > 0 ? 'Target Price' : 'No Price Available';
    
    // Calculate savings (difference between compare price and lowest price)
    // const savings = comparePrice && item.lowestPrice ? comparePrice - item.lowestPrice : 0;
    const cp = Number(comparePrice);
    const lp = Number(item.lowestPrice.price);

    const savings = !isNaN(cp) && !isNaN(lp) ? cp - lp : 0;
    
    return {
      version: item.version,
      savings: savings,
      comparePrice: comparePrice,
      lowestPrice: item.lowestPrice.price,
      comparePriceLabel: comparePriceLabel
    };
  }) || [];

  if (chartData.length === 0 || chartData.every(item => item.comparePriceLabel === 'No Price Available')) {
    return (
      <Card className={styles.chartCard}>
        <CardContent>
          <Typography variant="h6" className={styles.chartTitle}>
            Savings Trend Analysis
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">No savings data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Find min and max values for scaling (only savings values)
  const savingsValues = chartData.map(item => item.savings);
  const maxValue = Math.max(...savingsValues, 0);
  const minValue = Math.min(...savingsValues, 0);
  const valueRange = maxValue - minValue || 1000; // Fallback if all values are the same
  const padding = valueRange * 0.1; // 10% padding
  const chartMin = Math.max(0, minValue - padding);
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;

  const chartHeight = 180;
  const chartWidth = Math.max(350, chartData.length * 80);
  const leftMargin = 60;
  const rightMargin = 20;
  const plotWidth = chartWidth - leftMargin - rightMargin;

  // Calculate point positions
  // const getYPosition = (value) => {
  //   return chartHeight + 20 - ((value - chartMin) / chartRange) * chartHeight;
  // };
  const getYPosition = (value) => {
    if (value == null || isNaN(value) || chartRange === 0) {
      return chartHeight + 20;
    }

    return chartHeight + 20 - ((value - chartMin) / chartRange) * chartHeight;
  };
  // const getXPosition = (index) => {
  //   return leftMargin + (index * plotWidth) / (chartData.length - 1);
  // };

  const getXPosition = (index) => {
    if (chartData.length <= 1) {
      return leftMargin + plotWidth / 2; // center point
    }

    return leftMargin + (index * plotWidth) / (chartData.length - 1);
  };
  // Generate Y-axis labels
  const generateYLabels = () => {
    const stepCount = 5;
    const step = chartRange / stepCount;
    const labels = [];
    for (let i = 0; i <= stepCount; i++) {
      const value = chartMin + (i * step);
      labels.push(Math.round(value));
    }
    return labels;
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Generate path for line
  const generateLinePath = (dataKey) => {
    const points = chartData.map((item, index) => {
      const x = getXPosition(index);
      const y = getYPosition(item[dataKey]);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    return points;
  };

  return (
    <Card className={styles.chartCard}>
      <CardContent sx={{ padding: '12px !important', paddingBottom: '12px !important' }}>
        <Typography variant="h6" className={styles.chartTitle}>
          Savings Trend Analysis
        </Typography>
        
        <div className={styles.chartContainer} style={{ overflowX: 'auto' }}>
          <svg width={chartWidth} height={270} style={{ minWidth: '350px' }}>
            {/* Y-axis */}
            <line x1={leftMargin} y1="20" x2={leftMargin} y2={chartHeight + 20} stroke="#e0e0e0" strokeWidth="1"/>
            
            {/* X-axis */}
            <line x1={leftMargin} y1={chartHeight + 20} x2={chartWidth - rightMargin} y2={chartHeight + 20} stroke="#333" strokeWidth="1"/>
            
            {/* Horizontal grid lines */}
            {generateYLabels().map((value, index) => {
              const y = getYPosition(value);
              return (
                <line key={`grid-${value}`} x1={leftMargin} y1={y} x2={chartWidth - rightMargin} y2={y} stroke="#f5f5f5" strokeWidth="1"/>
              );
            })}
            
            {/* Y-axis labels */}
            {generateYLabels().map((value, index) => {
              const y = getYPosition(value);
              return (
                <g key={`y-label-${value}`}>
                  <line x1={leftMargin - 5} y1={y} x2={leftMargin} y2={y} stroke="#e0e0e0" strokeWidth="1"/>
                  <text x={leftMargin - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#666">
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}

            {/* X-axis tick marks and labels */}
            {chartData.map((item, index) => {
              const x = getXPosition(index);
              return (
                <g key={`x-label-${index}`}>
                  <line x1={x} y1={chartHeight + 20} x2={x} y2={chartHeight + 25} stroke="#333" strokeWidth="1"/>
                  <text x={x} y={chartHeight + 40} textAnchor="middle" fontSize="12" fill="#333" fontWeight="500">
                    V{item.version}
                  </text>
                </g>
              );
            })}

            {/* Savings Line */}
            {chartData.length > 1 && (
              <path
                d={generateLinePath('savings')}
                fill="none"
                stroke="#FF9800"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}

            {/* Data points for savings */}
            {chartData.map((item, index) => {
              const x = getXPosition(index);
              const savingsY = getYPosition(item.savings);
              if (isNaN(x) || isNaN(savingsY)) return null;
              return (
                <g key={`savings-point-${index}`}>
                  {/* Savings Point */}
                  <circle
                    cx={x}
                    cy={savingsY}
                    r="5"
                    fill="#FF9800"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(`savings-${index}`)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* Tooltips - rendered last (top layer) */}
            {chartData.map((item, index) => {
              const x = getXPosition(index);
              const savingsY = getYPosition(item.savings);
              
              return (
                <g key={`tooltips-${index}`}>
                  {/* Savings Tooltip */}
                  {hoveredPoint === `savings-${index}` && (
                    <g pointerEvents="none">
                      {(() => {
                        const tooltipWidth = 140;
                        const tooltipX = Math.max(5, Math.min(x - tooltipWidth/2, chartWidth - tooltipWidth - 5));
                        const tooltipY = Math.max(5, savingsY - 45);
                        return (
                          <>
                            <rect 
                              x={tooltipX} 
                              y={tooltipY} 
                              width={tooltipWidth} 
                              height="40" 
                              fill="rgba(0,0,0,0.9)" 
                              rx="3"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="0.5"
                            />
                            <text 
                              x={tooltipX + tooltipWidth/2} 
                              y={tooltipY + 14} 
                              textAnchor="middle" 
                              fontSize="10" 
                              fill="white"
                              fontWeight="500"
                            >
                              V{item.version} Savings ( wrt {item.comparePriceLabel})
                            </text>
                            <text 
                              x={tooltipX + tooltipWidth/2} 
                              y={tooltipY + 28} 
                              textAnchor="middle" 
                              fontSize="11" 
                              fill="#FF9800"
                              fontWeight="600"
                            >
                              {formatCurrency(item.savings)}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '20px', height: '3px', backgroundColor: '#FF9800', marginRight: '5px', borderRadius: '2px' }}></div>
              Savings Amount
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsLineChart;