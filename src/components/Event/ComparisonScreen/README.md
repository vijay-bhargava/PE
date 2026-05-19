# Comparison Screen Components

A comprehensive React component suite for displaying RFQ (Request for Quotation) comparison data with executive summary and comparative analysis views.

## Components Structure

```
ComparisonScreen/
├── DEMO.js                     # Main component with tab navigation
├── ExecutiveSummary.js         # Executive summary view
├── ComparativeAnalysis.js      # Comparative analysis view (placeholder)
├── PriceTrendChart.js          # Interactive price trend chart
├── ExecutiveSummary.module.css # Styles for executive summary
├── PriceTrendChart.module.css  # Styles for price chart
├── data/
│   └── mockData.js            # Mock data structure
└── index.js                   # Main exports

```

## Features

### Executive Summary Tab
- **RFQ Header**: Displays RFQ number, title, buyer info, date, versions, and items
- **Key Metrics Cards**:
  - Vendor Participation (with participation rate)
  - Total Savings (with cost reduction percentage)
  - Quote Versions (negotiation rounds)
  - Best Final Price (lowest current quote)
- **Price Trend Chart**: Interactive SVG chart showing price progression across versions

### Comparative Analysis Tab
- Placeholder component ready for implementation
- Structured data format available for vendor comparisons

## Data Structure

### Executive Summary Data
```javascript
{
  rfqInfo: {
    rfqNumber: "RFQ-2024-001",
    title: "Office Supplies & Equipment Procurement",
    buyer: { name: "Sarah Johnson" },
    date: "2024-01-15",
    versions: { count: 3 },
    items: { count: 3 },
    status: "Active"
  },
  metrics: {
    vendorParticipation: {
      current: 3, total: 4, percentage: 75,
      subtitle: "75% participation rate"
    },
    totalSavings: {
      amount: 47, percentage: 10,
      subtitle: "10% cost reduction"
    },
    // ... more metrics
  },
  priceChart: {
    title: "Average Quoted Price Trend",
    data: [
      { version: "V1", price: 473, label: "$473" },
      { version: "V2", price: 445, label: "$445" },
      { version: "V3", price: 426, label: "$426" }
    ]
  }
}
```

## Usage

### Basic Implementation
```jsx
import { ComparisonScreen } from './components/Event/ComparisonScreen';

function App() {
  return <ComparisonScreen />;
}
```

### Individual Components
```jsx
import { ExecutiveSummary, executiveSummaryData } from './components/Event/ComparisonScreen';

function MyComponent() {
  return <ExecutiveSummary data={executiveSummaryData} />;
}
```

## Styling

The components use CSS modules for styling with the following key features:
- Responsive design (mobile-first approach)
- Material-UI integration
- Custom color schemes for different metric types
- Hover effects and smooth transitions
- Professional card-based layout

## Dependencies

- React 18+
- Material-UI (@mui/material)
- Material-UI Icons (@mui/icons-material)

## Customization

### Colors
Modify the CSS module files to change color schemes:
- `.greenMetric`: Success/positive metrics
- `.blueMetric`: Information metrics  
- `.orangeMetric`: Warning/attention metrics

### Data Format
The mock data structure can be easily replaced with API data by maintaining the same object structure.

### Chart Styling
The `PriceTrendChart` component uses SVG for maximum customization and smooth animations.

## Future Enhancements

1. **Comparative Analysis Implementation**: Add vendor comparison tables and charts
2. **Interactive Filters**: Add filtering and sorting capabilities
3. **Export Functionality**: PDF/Excel export options
4. **Real-time Updates**: WebSocket integration for live data
5. **Advanced Charts**: More chart types for deeper analysis

## Performance

- Optimized with React best practices
- CSS modules for scoped styling
- SVG charts for scalability
- Responsive images and layouts
- Minimal re-renders with proper state management