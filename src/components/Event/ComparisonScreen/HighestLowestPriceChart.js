import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

const HighestLowestPriceChart = ({ data }) => {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Extract and process savings data for highest/lowest prices
  const chartData = useMemo(() => {
    if (!data?.savingsData || !Array.isArray(data.savingsData)) {
      return [];
    }

    // return data.savingsData
    //   .filter(item => item.highestPrice !== undefined && item.lowestPrice !== undefined)
    //   .map(item => ({
    //     version: item.version?.toString() || 'N/A',
    //     highest: item.highestPrice || 0,
    //     lowest: item.lowestPrice || 0
    //   }));
    return data.savingsData
      .map(item => {
        const highest = Number(item.highestPrice.price);
        const lowest = Number(item.lowestPrice.price);

        if (isNaN(highest) || isNaN(lowest)) return null;

        return {
          version: item.version?.toString() || 'N/A',
          highest,
          lowest,
          highSupplier: item.highestPrice.supplier,
          lowSupplier: item.lowestPrice.supplier
        };
      })
      .filter(Boolean);
  }, [data]);

  // Chart dimensions and styling - matching Chart 1
  const chartHeight = 180;
  const chartWidth = Math.max(350, chartData.length * 80); // Dynamic width like Chart 1
  const barWidth = 20;
  const barSpacing = 5;
  const groupSpacing = 25;

  // Find max value for scaling - matching Chart 1 approach
  // const maxValue = Math.max(...chartData.flatMap(d => [d.highest, d.lowest]));
  const maxValue = chartData.length > 0 ? Math.max(...chartData.flatMap(d => [d.highest, d.lowest])) : 0;

  // Handle mouse events
  const handleMouseEnter = (bar, event, type, version) => {
    debugger
    const rect = event.currentTarget.getBoundingClientRect();
    const svgRect = event.currentTarget.closest('svg').getBoundingClientRect();

    const tooltipX = Math.min(Math.max(event.clientX - svgRect.left, 80), chartWidth - 100);
    const tooltipY = event.clientY - svgRect.top - 40;

    setTooltipPosition({ x: tooltipX, y: tooltipY });
    setHoveredBar({ ...bar, type, version });
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };
  useEffect(() => {
    if (hoveredBar) {
      debugger
      console.log('Hovered Bar:', hoveredBar);
    }
  }, [hoveredBar])

  const getBarHeight = (value) => {
    if (!maxValue || isNaN(value)) return 0;
    return (value / maxValue) * chartHeight;
  };

  if (chartData.length === 0) {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
          Highest vs Lowest Price
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No price data available</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 1, flexShrink: 0 }}>
        Highest vs Lowest Price
      </Typography>
      <Box sx={{ flex: 1, overflowX: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} 230`} preserveAspectRatio="xMidYMid meet" style={{ minWidth: '280px', display: 'block', flex: 1 }}>
          {/* Y-axis */}
          <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e0e0e0" strokeWidth="1" />

          {/* X-axis */}
          <line x1="40" y1={chartHeight + 20} x2={chartWidth - 20} y2={chartHeight + 20} stroke="#333" strokeWidth="1" />

          {/* Horizontal grid lines */}
          {(() => {
            const stepSize = maxValue <= 50000 ? Math.ceil(maxValue / 5 / 10000) * 10000 : Math.ceil(maxValue / 5);
            const gridLines = [];
            for (let i = stepSize; i <= maxValue; i += stepSize) {
              const y = chartHeight + 20 - (i / maxValue) * chartHeight;
              gridLines.push(
                <line key={`grid-${i}`} x1="40" y1={y} x2={chartWidth - 20} y2={y} stroke="#f5f5f5" strokeWidth="1" />
              );
            }
            return gridLines;
          })()}
          {maxValue > 0 &&
            (() => {
              const stepSize =
                maxValue <= 50000
                  ? Math.ceil(maxValue / 5 / 10000) * 10000
                  : Math.ceil(maxValue / 5);

              const gridLines = [];
              for (let i = stepSize; i <= maxValue; i += stepSize) {
                const y = chartHeight + 20 - getBarHeight(i);
                gridLines.push(
                  <line
                    key={`grid-${i}`}
                    x1="40"
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="#f5f5f5"
                    strokeWidth="1"
                  />
                );
              }
              return gridLines;
            })()}
          {/* Y-axis labels */}
          {(() => {
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
              const y = maxValue > 0 ? chartHeight + 20 - (value / maxValue) * chartHeight : chartHeight + 20;
              return (
                <g key={`y-label-${value}`}>
                  <line x1="35" y1={y} x2="40" y2={y} stroke="#e0e0e0" strokeWidth="1" />
                  <text x="30" y={y + 3} textAnchor="end" fontSize="10" fill="#666">
                    {value === 0 ? '0' : `${(value / 1000).toFixed(0)}K`}
                  </text>
                </g>
              );
            });
          })()}
          {maxValue > 0 &&
            (() => {
              const stepSize =
                maxValue <= 50000
                  ? Math.ceil(maxValue / 5 / 10000) * 10000
                  : Math.ceil(maxValue / 5);

              const yLabels = [];
              for (let i = 0; i <= maxValue; i += stepSize) {
                yLabels.push(i);
              }

              return yLabels.map((value) => {
                const y = maxValue > 0 ? chartHeight + 20 - (value / maxValue) * chartHeight : chartHeight + 20;
                // const y = chartHeight + 20 - (value / maxValue) * chartHeight;
                return (
                  <g key={`y-label-${value}`}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="#e0e0e0" />
                    <text x="30" y={y + 3} textAnchor="end" fontSize="10">
                      {value === 0 ? '0' : `${(value / 1000).toFixed(0)}K`}
                    </text>
                  </g>
                );
              });
            })()}
          {/* X-axis tick marks and bars */}
          {chartData.map((item, index) => {
            const x = 60 + index * (barWidth * 2 + barSpacing + groupSpacing);
            const centerX = x + barWidth + barSpacing / 2 + barWidth / 2;

            // Calculate bar heights
            // const highestHeight = (item.highest / maxValue) * chartHeight;
            // const lowestHeight = (item.lowest / maxValue) * chartHeight;
            const highestHeight = maxValue > 0 ? (item.highest / maxValue) * chartHeight : 0;
            const lowestHeight = maxValue > 0 ? (item.lowest / maxValue) * chartHeight : 0;

            return (
              <g key={index}>
                {/* X-axis tick */}
                <line x1={centerX} y1={chartHeight + 20} x2={centerX} y2={chartHeight + 25} stroke="#333" strokeWidth="1" />

                {/* Highest price bar */}
                <rect
                  x={x}
                  y={chartHeight + 20 - Math.max(0, highestHeight)}
                  width={barWidth}
                  height={Math.max(0, highestHeight)}
                  fill="#f44336"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handleMouseEnter({ value: item.highest, label: 'Highest Price', supplier: item.highSupplier }, e, 'highest', item.version)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Lowest price bar */}
                <rect
                  x={x + barWidth + barSpacing}
                  y={chartHeight + 20 - Math.max(0, lowestHeight)}
                  width={barWidth}
                  height={Math.max(0, lowestHeight)}
                  fill="#4caf50"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handleMouseEnter({ value: item.lowest, label: 'Lowest Price', supplier: item.lowSupplier }, e, 'lowest', item.version)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Version label */}
                <text
                  x={centerX}
                  y={chartHeight + 40}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#333"
                >
                  V{item.version}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredBar && (
            <g style={{ pointerEvents: 'none' }}>
              <rect
                x={tooltipPosition.x}
                y={tooltipPosition.y - 40}
                width="260"
                height="70"
                fill="rgba(50, 50, 50, 0.9)"
                rx="4"
              />
              <text
                x={tooltipPosition.x + 10}
                y={tooltipPosition.y - 20}
                fontSize="10"
                fill="white"
              >
                V{hoveredBar.version} - {hoveredBar.label}
              </text>

              <text
                x={tooltipPosition.x + 10}
                y={tooltipPosition.y - 5}
                fontSize="10"
                fill="white"
              >
                Price: {hoveredBar.value?.toLocaleString()}
              </text>

              <text
                x={tooltipPosition.x + 10}
                y={tooltipPosition.y + 10}
                fontSize="10"
                fill="white"
              >
                Supplier: {hoveredBar?.supplier}
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '4px', fontSize: '11px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#f44336', borderRadius: '2px' }} />
            Highest Price
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '2px' }} />
            Lowest Price
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default HighestLowestPriceChart;