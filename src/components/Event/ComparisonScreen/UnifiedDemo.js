import React from 'react';
import UnifiedComparisonTable from './UnifiedComparisonTable';
import { comparativeAnalysisData } from './data/mockData';

const UnifiedDemo = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Unified Comparison Table Demo</h2>
      <UnifiedComparisonTable data={comparativeAnalysisData} />
    </div>
  );
};

export default UnifiedDemo;