import React, { useState } from "react";
import {
    Box,
    Tab,
    Tabs
} from "@mui/material";
import ExecutiveSummary from './ExecutiveSummary';
import ComparativeAnalysis from './ComparativeAnalysis';
import CommercialComparative from './CommercialComparative';
import TechnicalComparative from './TechnicalComparative';
import { executiveSummaryData, comparativeAnalysisData,commercialComparativeData ,technicalComparativeData} from './data/mockData';

const ComparisonScreen = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ExecutiveSummary data={executiveSummaryData} />;
            case 1:
                return <ComparativeAnalysis data={comparativeAnalysisData} />;
            case 2:
                return <CommercialComparative data={commercialComparativeData} />;
            case 3:
                return <TechnicalComparative data={technicalComparativeData} />;
            default:
                return <ExecutiveSummary data={executiveSummaryData} />;
        }
    };

    return (
        <Box >
            {/* Sticky Tab Navigation */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backgroundColor: '#ffffff',
                    borderBottom: 1,
                    borderColor: 'divider',
                    marginBottom: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{ minHeight: 32 }}
                >
                    <Tab
                        label="RFQ Summary"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 32,
                            fontSize: '13px',
                            padding: '6px 16px'
                        }}
                    />
                    <Tab
                        label="Financial Comparison"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 32,
                            fontSize: '13px',
                            padding: '6px 16px'
                        }}
                    />
                    <Tab
                        label="Commercial Comparison"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 32,
                            fontSize: '13px',
                            padding: '6px 16px'
                        }}
                    />
                    <Tab
                        label="Technical Comparison"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: 32,
                            fontSize: '13px',
                            padding: '6px 16px'
                        }}
                    />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
                {renderTabContent()}
            </Box>
        </Box>
    );
};

export default ComparisonScreen;
