import React from 'react';
import UnifiedComparisonTable from './UnifiedComparisonTable';
import styles from './ComparativeAnalysis.module.css';

const ComparativeAnalysis = ({ data,loadingFactor ,handleSupplierModalOpen}) => {
  return (
    <div className={styles.comparativeAnalysis}>
      {/* Unified Comparison Table combining Package and Item Details */}
      <UnifiedComparisonTable data={data} loadingFactor={loadingFactor} handleSupplierModalOpen={handleSupplierModalOpen} />
    </div>
  );
};

export default ComparativeAnalysis;