import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import styles from './PriceTrendChart.module.css';

const PriceTrendChart = ({ data, title }) => {
  const prices = data.map(item => Number(item.price)).filter(p => !isNaN(p));
  // const maxPrice = Math.max(...data.map(item => item.price));
  // const minPrice = Math.min(...data.map(item => item.price));
  // const priceRange = maxPrice - minPrice;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const priceRange = maxPrice - minPrice;
  // const calculatePosition = (price) => {
  //   if (priceRange === 0) return 50;
  //   return ((maxPrice - price) / priceRange) * 60 + 20; // 20-80% range for better visual
  // };

  const calculatePosition = (price) => {
    const p = Number(price);

    if (isNaN(p) || priceRange === 0) {
      return 50; // middle fallback
    }

    return ((maxPrice - p) / priceRange) * 60 + 20;
  };

  const safePoints = data
    .map((point, index) => {
      const x = 60 + index * 140;
      const yVal = calculatePosition(point.price);

      if (isNaN(x) || isNaN(yVal)) return null;

      return {
        x,
        y: yVal * 1.2 + 20
      };
    })
    .filter(Boolean);
  return (
    <Card className={styles.chartCard}>
      <CardContent sx={{ padding: '12px !important', paddingBottom: '12px !important' }}>
        <Typography variant="h6" className={styles.chartTitle}>
          {title}
        </Typography>
        
        <div className={styles.chartContainer}>
          <svg className={styles.chartSvg} viewBox="0 0 400 140">
            {/* Background gradient area */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(33, 150, 243, 0.2)" />
                <stop offset="100%" stopColor="rgba(33, 150, 243, 0.03)" />
              </linearGradient>
            </defs>
            
            {/* Create path for the line and area */}
            {safePoints.length > 1 && (
              <>
                {/* Area under the curve */}  
                <path
                  d={`
                    M ${safePoints[0].x} ${safePoints[0].y}
                    ${safePoints.map(p => `L ${p.x} ${p.y}`).join(' ')}
                    L ${safePoints[safePoints.length - 1].x} 100
                    L ${safePoints[0].x} 100 Z
                  `}
                  fill="url(#areaGradient)"
                />
                {/* Main trend line */}
                <path
                  d={`
                    M ${safePoints[0].x} ${safePoints[0].y}
                    ${safePoints.map(p => `L ${p.x} ${p.y}`).join(' ')}
                  `}
                  stroke="#2196F3"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
            
            {/* Data points */}
            {safePoints.map((p, index) => (
                <g key={data[index].version}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill="#2196F3"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                  <text x={p.x} y={115} textAnchor="middle" className={styles.versionLabel}>
                    {data[index].version}
                  </text>
                  <text x={p.x} y={130} textAnchor="middle" className={styles.priceLabel}>
                    {data[index].label}
                  </text>
                </g>
              ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;