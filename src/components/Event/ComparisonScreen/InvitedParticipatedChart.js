import React, { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import styles from './ExecutiveSummary.module.css';

const InvitedParticipatedChart = ({ data }) => {
  const [hoveredBar, setHoveredBar] = useState(null);
  
  // Transform the data for chart
  const chartData = data?.invitedParticipated?.map(item => ({
    version: item.version,
    invited: item.invitedSuppliers,
    participated: item.participatedSuppliers
  })) || [];

  if (chartData.length === 0) {
    return (
      <Card className={styles.chartCard}>
        <CardContent>
          <Typography variant="h6" className={styles.chartTitle}>
            Invited vs Participated Suppliers
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...chartData.flatMap(item => [item.invited, item.participated]));
  const chartHeight = 180;
  const chartWidth = Math.max(350, chartData.length * 80); // Dynamic width based on data
  const barWidth = 20;
  const barSpacing = 5;
  const groupSpacing = 25;

  return (
    <Card className={styles.chartCard}>
      <CardContent sx={{ padding: '12px !important', paddingBottom: '12px !important' }}>
        <Typography variant="h6" className={styles.chartTitle}>
          Invited vs Participated Suppliers
        </Typography>
        
        <div className={styles.chartContainer} style={{ overflowX: 'auto' }}>
          <svg width={chartWidth} height={250} style={{ minWidth: '300px' }}>
            {/* Y-axis */}
            <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e0e0e0" strokeWidth="1"/>
            
            {/* X-axis */}
            <line x1="40" y1={chartHeight + 20} x2={chartWidth - 20} y2={chartHeight + 20} stroke="#333" strokeWidth="1"/>
            
            {/* Horizontal grid lines */}
            {(() => {
              const stepSize = maxValue <= 5 ? 1 : Math.ceil(maxValue / 5);
              const gridLines = [];
              for (let i = stepSize; i <= maxValue; i += stepSize) {
                const y = chartHeight + 20 - (i / maxValue) * chartHeight;
                gridLines.push(
                  <line key={`grid-${i}`} x1="40" y1={y} x2={chartWidth - 20} y2={y} stroke="#f5f5f5" strokeWidth="1"/>
                );
              }
              return gridLines;
            })()}
            
            {/* Y-axis labels */}
            {(() => {
              const stepSize = maxValue <= 5 ? 1 : Math.ceil(maxValue / 5);
              const yLabels = [];
              for (let i = 0; i <= maxValue; i += stepSize) {
                yLabels.push(i);
              }
              if (yLabels[yLabels.length - 1] !== maxValue) {
                yLabels.push(maxValue);
              }
              
              return yLabels.map((value, index) => {
                const y = chartHeight + 20 - (value / maxValue) * chartHeight;
                return (
                  <g key={`y-label-${value}`}>
                    <line x1="35" y1={y} x2="40" y2={y} stroke="#e0e0e0" strokeWidth="1"/>
                    <text x="30" y={y + 3} textAnchor="end" fontSize="10" fill="#666">{value}</text>
                  </g>
                );
              });
            })()}
            
            {/* X-axis tick marks */}
            {chartData.map((item, index) => {
              const x = 60 + index * (barWidth * 2 + barSpacing + groupSpacing);
              const centerX = x + barWidth + barSpacing/2 + barWidth/2;
              return (
                <line 
                  key={`tick-${index}`} 
                  x1={centerX} 
                  y1={chartHeight + 20} 
                  x2={centerX} 
                  y2={chartHeight + 25} 
                  stroke="#333" 
                  strokeWidth="1"
                />
              );
            })}

            {/* Bars and Labels - rendered first (background layer) */}
            {chartData.map((item, index) => {
              const x = 60 + index * (barWidth * 2 + barSpacing + groupSpacing);
              const invitedHeight = maxValue > 0 ? (item.invited / maxValue) * chartHeight : 0;
              const participatedHeight = maxValue > 0 ? (item.participated / maxValue) * chartHeight : 0;
              
              return (
                <g key={`bars-${index}`}>
                  {/* Invited bar */}
                  <rect
                    x={x}
                    y={chartHeight + 20 - invitedHeight}
                    width={barWidth}
                    height={invitedHeight}
                    fill="#2196F3"
                    rx="2"
                    onMouseEnter={() => setHoveredBar(`invited-${index}`)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Participated bar */}
                  <rect
                    x={x + barWidth + 5}
                    y={chartHeight + 20 - participatedHeight}
                    width={barWidth}
                    height={participatedHeight}
                    fill="#4CAF50"
                    rx="2"
                    onMouseEnter={() => setHoveredBar(`participated-${index}`)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  
                  {/* Version label - centered between the two bars */}
                  <text
                    x={x + barWidth + barSpacing/2 + barWidth/2}
                    y={chartHeight + 40}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#333"
                    fontWeight="500"
                  >
                    V{item.version}
                  </text>
                </g>
              );
            })}

            {/* Hover tooltips - rendered last (top layer) */}
            {chartData.map((item, index) => {
              const x = 60 + index * (barWidth * 2 + barSpacing + groupSpacing);
              const invitedHeight = maxValue > 0 ? (item.invited / maxValue) * chartHeight : 0;
              const participatedHeight = maxValue > 0 ? (item.participated / maxValue) * chartHeight : 0;
              
              return (
                <g key={`tooltips-${index}`}>
                  {/* Invited tooltip */}
                  {hoveredBar === `invited-${index}` && (
                    <g>
                      {(() => {
                        const tooltipWidth = 60;
                        const tooltipX = Math.max(5, Math.min(x - 5, chartWidth - tooltipWidth - 5));
                        const tooltipTextX = tooltipX + tooltipWidth / 2;
                        return (
                          <>
                            <rect 
                              x={tooltipX} 
                              y={Math.max(5, chartHeight + 20 - invitedHeight - 25)} 
                              width={tooltipWidth} 
                              height="20" 
                              fill="rgba(0,0,0,0.9)" 
                              rx="3"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="0.5"
                            />
                            <text 
                              x={tooltipTextX} 
                              y={Math.max(18, chartHeight + 20 - invitedHeight - 12)} 
                              textAnchor="middle" 
                              fontSize="10" 
                              fill="white"
                              fontWeight="500"
                            >
                              Invited: {item.invited}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                  
                  {/* Participated tooltip */}
                  {hoveredBar === `participated-${index}` && (
                    <g>
                      {(() => {
                        const tooltipWidth = 80;
                        const preferredX = x + barWidth;
                        const tooltipX = Math.max(5, Math.min(preferredX, chartWidth - tooltipWidth - 5));
                        const tooltipTextX = tooltipX + tooltipWidth / 2;
                        return (
                          <>
                            <rect 
                              x={tooltipX} 
                              y={Math.max(5, chartHeight + 20 - participatedHeight - 25)} 
                              width={tooltipWidth} 
                              height="20" 
                              fill="rgba(0,0,0,0.9)" 
                              rx="3"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="0.5"
                            />
                            <text 
                              x={tooltipTextX} 
                              y={Math.max(18, chartHeight + 20 - participatedHeight - 12)} 
                              textAnchor="middle" 
                              fontSize="10" 
                              fill="white"
                              fontWeight="500"
                            >
                              Participated: {item.participated}
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
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#2196F3', marginRight: '5px', borderRadius: '2px' }}></div>
              Invited
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#4CAF50', marginRight: '5px', borderRadius: '2px' }}></div>
              Participated
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitedParticipatedChart;