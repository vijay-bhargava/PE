import React, { useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Menu, MenuItem } from '@mui/material';
import { PETableSimple } from '../../../components/RFQ/PETable';
import { PEPagination } from '../../../components/RFQ/PEPagination';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ListOutlined } from '@mui/icons-material';
import { formatDateViaLocale } from '../../../utils/common/utility';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useStateValue } from '../../../store';
// Function to transform data for chart - each vendor gets their own data points
const groupByVendor = (selectedParameterData, userDetail) => {
  // Sort by submission time to maintain chronological order
  const sortedData = selectedParameterData?.sort((a, b) =>
    new Date(a.submissionTime) - new Date(b.submissionTime)
  );

  // Create a map to track the latest price for each vendor at each point in time
  const vendorPriceMap = {};
  const allTimePoints = [];

  sortedData.forEach(item => {
    // Extract only time (HH:MM:SS) from submission time
    const fullDateTime = formatDateViaLocale(item.submissionTime, userDetail, true);
    const timeWithSeconds = fullDateTime?.split('  ')[1] || fullDateTime; // Get only time part after double space
    const vendorName = item.vendorName;

    // Initialize vendor if not exists
    if (!vendorPriceMap[vendorName]) {
      vendorPriceMap[vendorName] = null;
    }

    // Update vendor's current price
    vendorPriceMap[vendorName] = item.quotedPrice;

    // Create a data point for this specific submission
    const dataPoint = {
      name: timeWithSeconds,
      timestamp: new Date(item?.submissionTime).getTime(),
      submittedBy: vendorName // Track which vendor submitted at this time
    };

    // Add all vendors' current prices (null for those who haven't submitted yet)
    Object.keys(vendorPriceMap).forEach(vendor => {
      dataPoint[vendor] = vendorPriceMap[vendor];
    });

    allTimePoints?.push(dataPoint);
  });

  return allTimePoints;
};


const BidGraphs = ({ selectedParameterData, auctionManageData, bidStatus }) => {
  const [{ userDetail }] = useStateValue();
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const chartRef = useRef(null); // Reference for the chart component
  const [isFullScreen, setIsFullScreen] = useState(false); // State for full screen

  const [anchorEl, setAnchorEl] = useState(null);

  // Helper function to get vendor display name
  const getVendorDisplayName = (vendorName) => {
    return (auctionManageData[0]?.hideVendor === true && bidStatus === 'running') ? 'Anonymous Vendor' : vendorName;
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to toggle full screen
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const sortedData = selectedParameterData?.slice().sort((a, b) => b.id - a.id);
  const paginatedItems = sortedData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Function to download as PNG
  const downloadImage = () => {
    // Create a container div that includes both chart and table
    const container = document.createElement('div');
    container.style.cssText = `
      background-color: white;
      padding: 30px;
      font-family: 'Arial', sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 12px;
      border: 2px solid #e8f4fd;
    `;

    // Add title with better styling
    const title = document.createElement('div');
    title.innerHTML = `
      <h2 style="
        text-align: center; 
        margin-bottom: 25px; 
        color: #1a365d;
        font-size: 28px;
        font-weight: 700;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-bottom: 3px solid #0d6efd;
        padding-bottom: 15px;
        letter-spacing: 0.5px;
      ">📊 Bidding Trend Analysis</h2>
    `;
    container.appendChild(title);

    // Add auction info with enhanced styling
    const auctionInfo = document.createElement('div');
    auctionInfo.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 25px;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
      ">
        <div style="
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        ">
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 12px 18px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
          ">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">🚀 Bid Start</div>
            <div style="font-size: 16px; font-weight: 600;">${formatDateViaLocale(auctionManageData[0]?.bidStDate, userDetail)}</div>
          </div>
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 12px 18px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
          ">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">🏁 Bid End</div>
            <div style="font-size: 16px; font-weight: 600;">${formatDateViaLocale(auctionManageData[0]?.bidEndDate, userDetail)}</div>
          </div>
          <div style="
            background: rgba(255,255,255,0.2);
            padding: 12px 18px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
          ">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">🆔 Auction ID</div>
            <div style="font-size: 16px; font-weight: 600;">${auctionManageData[0]?.id || 'N/A'}</div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(auctionInfo);

    // Create chart container with better styling and centering
    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = `
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 25px;
      margin: 0 auto 30px auto;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 500px;
      max-width: 1000px;
      width: 100%;
    `;

    // Create a dedicated wrapper for the chart to ensure perfect centering
    const chartWrapper = document.createElement('div');
    chartWrapper.style.cssText = `
      width: 100%;
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fafafa;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    `;

    // Clone and style the chart
    if (chartRef.current) {
      const chartClone = chartRef.current.cloneNode(true);
      chartClone.style.cssText = `
        width: 95% !important;
        height: 95% !important;
        display: block;
        border-radius: 8px;
        margin: auto;
      `;

      // Find and style the SVG within the chart
      const svgElement = chartClone.querySelector('svg');
      if (svgElement) {
        svgElement.style.cssText = `
          width: 100% !important;
          height: 100% !important;
          border-radius: 8px;
          background: transparent;
          display: block;
          margin: 0 auto;
        `;
      }

      chartWrapper.appendChild(chartClone);
    }

    chartContainer.appendChild(chartWrapper);
    container.appendChild(chartContainer);

    // Create enhanced table with better styling
    const tableContainer = document.createElement('div');
    const allTableData = sortedData.filter((item) => item.quotedPrice);

    const tableHTML = `
      <div style="margin-top: 25px;">
        <h3 style="
          text-align: center;
          margin-bottom: 20px;
          color: #ffffffff;
          font-size: 22px;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        ">📋 Supplier Auction Details</h3>
        <div style="
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        ">
          <table style="
            width: 100%; 
            border-collapse: collapse; 
            font-size: 14px;
            margin: 0;
          ">
            <thead>
              <tr style="
                background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
                color: white;
              ">
                <th style="
                  padding: 15px 12px; 
                  text-align: center;
                  font-weight: 600;
                  font-size: 15px;
                  border-right: 1px solid rgba(255,255,255,0.2);
                  width: 8%;
                ">S.No</th>
                <th style="
                  padding: 15px 12px; 
                  text-align: left;
                  font-weight: 600;
                  font-size: 15px;
                  border-right: 1px solid rgba(255,255,255,0.2);
                  width: 35%;
                ">Supplier Name</th>
                <th style="
                  padding: 15px 12px; 
                  text-align: right;
                  font-weight: 600;
                  font-size: 15px;
                  border-right: 1px solid rgba(255,255,255,0.2);
                  width: 20%;
                ">Quoted Price</th>
                <th style="
                  padding: 15px 12px; 
                  text-align: center;
                  font-weight: 600;
                  font-size: 15px;
                  width: 37%;
                ">Submission Time</th>
              </tr>
            </thead>
            <tbody>
              ${allTableData.map((item, index) => `
                <tr style="
                  background-color: ${index % 2 === 0 ? '#f8fafc' : 'white'};
                  border-bottom: 1px solid #e2e8f0;
                  transition: all 0.2s ease;
                ">
                  <td style="
                    padding: 12px;
                    text-align: center;
                    font-weight: 600;
                    color: #4a5568;
                    border-right: 1px solid #e2e8f0;
                  ">${index + 1}</td>
                  <td style="
                    padding: 12px;
                    font-weight: 500;
                    color: #2d3748;
                    border-right: 1px solid #e2e8f0;
                    max-width: 250px;
                    word-wrap: break-word;
                  ">${getVendorDisplayName(item.vendorName)}</td>
                  <td style="
                    padding: 12px;
                    text-align: right;
                    font-weight: 700;
                    color: #38a169;
                    font-family: 'Courier New', monospace;
                    font-size: 15px;
                    border-right: 1px solid #e2e8f0;
                  ">${item.quotedPrice?.toLocaleString('en-IN')}</td>
                  <td style="
                    padding: 12px;
                    text-align: center;
                    color: #4a5568;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                  ">${formatDateViaLocale(item.submissionTime, userDetail, true)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    tableContainer.innerHTML = tableHTML;
    container.appendChild(tableContainer);

    // Add footer with generation info
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="
        text-align: center;
        margin-top: 25px;
        padding: 15px;
        background: #f7fafc;
        border-radius: 8px;
        color: #718096;
        font-size: 12px;
        border: 1px solid #e2e8f0;
      ">
        <div style="font-weight: 600; margin-bottom: 5px;">📊 Report Generated</div>
        <div>${new Date().toLocaleString('en-IN')}</div>
      </div>
    `;
    container.appendChild(footer);

    // Temporarily add to document body
    document.body.appendChild(container);

    // Wait a moment for rendering then capture with html2canvas
    setTimeout(() => {
      html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure all styles are properly applied in cloned document
          const clonedContainer = clonedDoc.querySelector('div');
          if (clonedContainer) {
            clonedContainer.style.fontFamily = 'Arial, sans-serif';
            clonedContainer.style.backgroundColor = 'white';
          }
        }
      }).then((canvas) => {
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `Auction-${auctionManageData[0]?.id}-bidding-trend-report.png`;
          link.click();

          // Clean up
          document.body.removeChild(container);
          URL.revokeObjectURL(link.href);
        }, 'image/png', 0.95);
      }).catch((error) => {
        console.error("Error capturing image:", error);
        document.body.removeChild(container);
      });
    }, 100);
  };

  // Function to download as PDF - Optimized with both chart and table
  const downloadPDF = () => {
    // Create a container with both chart and table, but optimize for smaller size
    const container = document.createElement('div');
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.maxWidth = '900px'; // Increased width for better spacing
    container.style.margin = '0 auto';

    // Add title
    const title = document.createElement('div');
    title.innerHTML = '<h3 style="text-align: center; margin-bottom: 20px; color: #333; font-size: 20px; font-weight: bold;">Bidding Trend Report</h3>';
    container.appendChild(title);

    // Add bid dates - more compact
    const dateInfo = document.createElement('div');
    dateInfo.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: 600; font-size: 14px; background: #f8f9fa; padding: 12px; border-radius: 6px;">
        <div style="color: #28a745;"><strong>Bid Start:</strong> ${formatDateViaLocale(auctionManageData[0]?.bidStDate, userDetail)}</div>
        <div style="color: #dc3545;"><strong>Bid End:</strong> ${formatDateViaLocale(auctionManageData[0]?.bidEndDate, userDetail)}</div>
      </div>
    `;
    container.appendChild(dateInfo);

    // Clone the chart with better dimensions
    if (chartRef.current) {
      const chartClone = chartRef.current.cloneNode(true);
      chartClone.style.marginBottom = '25px';
      chartClone.style.height = '350px'; // Increased chart height for better clarity
      chartClone.style.width = '100%';
      chartClone.style.border = '1px solid #e0e0e0';
      chartClone.style.borderRadius = '8px';
      chartClone.style.backgroundColor = '#ffffff';
      container.appendChild(chartClone);
    }

    // Create a properly spaced table
    const tableContainer = document.createElement('div');
    const allTableData = sortedData?.filter((item) => item?.quotedPrice) || [];

    const tableHTML = `
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 15px; color: #333; font-size: 16px; font-weight: bold;">Supplier Auction Details</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #0d6efd; color: white;">
              <th style="padding: 12px 8px; border: 1px solid #dee2e6; text-align: center; width: 8%; font-weight: bold;">S.No</th>
              <th style="padding: 12px 8px; border: 1px solid #dee2e6; text-align: left; width: 35%; font-weight: bold;">Supplier Name</th>
              <th style="padding: 12px 8px; border: 1px solid #dee2e6; text-align: right; width: 18%; font-weight: bold;">Quoted Price</th>
              <th style="padding: 12px 8px; border: 1px solid #dee2e6; text-align: center; width: 39%; font-weight: bold;">Submission Time</th>
            </tr>
          </thead>
          <tbody>
            ${allTableData?.map((item, index) => {
      // Truncate supplier name if too long to prevent overlap
      const displayName = getVendorDisplayName(item?.vendorName);
      const supplierName = displayName?.length > 28
        ? displayName.substring(0, 28) + '...'
        : displayName || '';

      // Format submission time to be more compact but readable
      const submissionTime = formatDateViaLocale(item?.submissionTime, userDetail) || '';

      return `
                <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'}; border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 8px; border: 1px solid #dee2e6; text-align: center; font-weight: 600; color: #495057;">${index + 1}</td>
                  <td style="padding: 10px 8px; border: 1px solid #dee2e6; font-weight: 500; color: #212529; word-wrap: break-word; max-width: 200px;">${supplierName}</td>
                  <td style="padding: 10px 8px; border: 1px solid #dee2e6; text-align: right; font-weight: 700; color: #28a745; font-family: monospace;">${item?.quotedPrice?.toLocaleString('en-IN') || ''}</td>
                  <td style="padding: 10px 8px; border: 1px solid #dee2e6; text-align: center; font-family: monospace; color: #6c757d; font-size: 11px; word-wrap: break-word;">${submissionTime}</td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;

    tableContainer.innerHTML = tableHTML;
    container.appendChild(tableContainer);

    // Temporarily add to document body
    document.body.appendChild(container);

    // Capture with enhanced settings for better clarity
    html2canvas(container, {
      scale: 1.2, // Slightly increased for better clarity
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      logging: false,
      removeContainer: true,
      width: container.offsetWidth,
      height: container.offsetHeight,
      onclone: (clonedDoc) => {
        // Ensure proper styling in cloned document
        const clonedContainer = clonedDoc.querySelector('div');
        if (clonedContainer) {
          clonedContainer.style.fontFamily = 'Arial, sans-serif';
          clonedContainer.style.backgroundColor = 'white';
        }
      }
    }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Use JPEG with higher quality for better clarity
      const imgData = canvas.toDataURL('image/jpeg', 0.9); // Increased to 90% quality

      // Calculate dimensions to fit PDF page
      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 280; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed (for very long tables)
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Auction-${auctionManageData[0]?.id}-bidding-trend-with-data.pdf`);

      // Clean up
      document.body.removeChild(container);
    }).catch((error) => {
      console.error("Error generating PDF:", error);
      document.body.removeChild(container);
    });
  };

  const downloadCSV = () => {
    // Get all vendor data for the CSV
    const allTableData = sortedData.filter((item) => item.quotedPrice);

    // Create CSV header (without S.No as Excel provides automatic numbering)
    const csvHeaders = ['Supplier Name', 'Quoted Price', 'Submission Time'];

    // Create CSV content
    let csvContent = '';

    // Add headers only
    csvContent += csvHeaders.join(',') + '\n';

    // Add data rows (without serial number)
    allTableData.forEach((item) => {
      const row = [
        `"${getVendorDisplayName(item.vendorName)}"`, // Wrap in quotes to handle commas in names
        item.quotedPrice,
        `"${formatDateViaLocale(item.submissionTime, userDetail, true)}"` // Wrap in quotes for proper formatting with seconds
      ];
      csvContent += row.join(',') + '\n';
    });

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Auction-${auctionManageData[0]?.id}-bidding-trend-supplier-data.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // const downloadSVG = () => {
  //   const svgElement = chartRef.current.querySelector('svg');
  //   if (svgElement) {
  //     const svgData = new XMLSerializer().serializeToString(svgElement);
  //     const blob = new Blob([svgData], { type: 'image/svg+xml' });
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob);
  //     link.download = 'chart.svg';
  //     link.click();
  //   } else {
  //     console.error("SVG element not found inside chartRef.");
  //   }
  // };

  const groupedData = groupByVendor(selectedParameterData, userDetail);
  const uniquesupplierlist = Array.from(new Set(selectedParameterData.map(item => item.vendorName)));

  // Create vendor name mapping for anonymous display
  const vendorNameMap = {};
  uniquesupplierlist.forEach((vendor, index) => {
    vendorNameMap[vendor] = (auctionManageData[0]?.hideVendor === true && bidStatus === 'running') ? `Anonymous Vendor ${index + 1}` : vendor;
  });

  groupedData.forEach(dataPoint => {
    uniquesupplierlist.forEach(vendor => {
      if (!(vendor in dataPoint)) {
        dataPoint[vendor] = null;
      }
    });
    const hasValidData = Object.entries(dataPoint).some(([key, value]) => key !== "name" && value !== 0 && value !== null);
    if (!hasValidData) {
      dataPoint.isValid = false;
    }
  });
  const filteredData = groupedData.filter(dataPoint => dataPoint.isValid !== false);
  console.log("filteredData::", filteredData)

  const prices = selectedParameterData
    .map(d => d.quotedPrice)
    .filter(p => p !== null && p !== undefined);

  const maxPrice = Math.max(...prices);

  // Calculate industry-standard nice intervals
  const getNiceNumber = (value, round) => {
    const exponent = Math.floor(Math.log10(value));
    const fraction = value / Math.pow(10, exponent);
    let niceFraction;

    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
  };

  // ALWAYS start from 0 as per requirement
  const finalYMin = 0;

  // Add 15% buffer to max price for better visualization
  const yMax = maxPrice * 1.15;

  // Calculate nice interval
  const targetTicks = 5;
  const range = yMax - finalYMin;
  const roughInterval = range / (targetTicks - 1);
  const niceInterval = getNiceNumber(roughInterval, true);

  // Calculate final max based on nice intervals
  const adjustedYMax = Math.ceil(yMax / niceInterval) * niceInterval;
  const numberOfTicks = Math.round(adjustedYMax / niceInterval) + 1;

  let minX = "";
  let maxX = "";
  // Calculate min and max prices for X-axis
  if (selectedParameterData && selectedParameterData.length !== 0) {

    // Transform submissionTime to Date objects, ignoring null/undefined
    const transformedData = selectedParameterData
      .map(d => {
        if (d.submissionTime) {
          return new Date(d.submissionTime + "Z");
        }
        return undefined;
      })
      .filter(d => d !== undefined);
    if (transformedData && transformedData.length !== 0) {
      // Get min and max time as Date objects
      const mintime = new Date(Math.min(...transformedData));
      const maxtime = new Date(Math.max(...transformedData));

      // Subtract 5 minutes from each
      mintime.setMinutes(mintime.getMinutes() - 5);
      maxtime.setMinutes(maxtime.getMinutes() - 5);

      // Format min and max times
      minX = formatDateViaLocale(mintime.toISOString(), userDetail);
      maxX = formatDateViaLocale(maxtime.toISOString(), userDetail);;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
      {/* Full Screen Modal */}
      {isFullScreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
          }}
        >
          {/* Full Screen Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #1D6FC3',
            paddingBottom: '10px'
          }}>
            <h2 style={{ margin: 0, color: '#1D6FC3', fontSize: '20px', fontWeight: 'bold' }}>
              Bidding Trend - Full Screen
            </h2>
            <button
              onClick={toggleFullScreen}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                minWidth: 'auto',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#c82333';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>✕</span> Exit
            </button>
          </div>

          {/* Bid Dates Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px',
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <div style={{ color: '#28a745' }}>
              <strong>Auction Start:</strong> {formatDateViaLocale(auctionManageData[0]?.bidStDate, userDetail)}
            </div>
            <div style={{ color: '#dc3545' }}>
              <strong>Auction End:</strong> {formatDateViaLocale(auctionManageData[0]?.bidEndDate, userDetail)}
            </div>
          </div>

          {/* Full Screen Chart */}
          <div style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e8e9ea',
            padding: '20px'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 70, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8e9ea"
                  opacity={0.7}
                />
                <XAxis
                  dataKey="name"
                  domain={[minX, maxX]}
                  ticks={[...filteredData.map(d => d.name)]}
                  tick={{
                    fontSize: 12,
                    fill: '#6c757d',
                    fontFamily: 'Arial, sans-serif'
                  }}
                  axisLine={{ stroke: '#dee2e6', strokeWidth: 1 }}
                  tickLine={{ stroke: '#dee2e6' }}
                  label={{
                    value: 'Submission Time',
                    position: 'insideBottom',
                    offset: -10,
                    style: {
                      fontSize: 14,
                      fontWeight: '600',
                      fill: '#495057',
                      fontFamily: 'Arial, sans-serif'
                    }
                  }}
                />
                <YAxis
                  axisLine={{ stroke: '#dee2e6', strokeWidth: 1 }}
                  tickLine={{ stroke: '#dee2e6' }}
                  domain={[finalYMin, adjustedYMax]}
                  tickCount={numberOfTicks}
                  tickFormatter={(value) => {
                    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
                    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
                    if (value >= 20000) return `${(value / 1000).toFixed(0)}K`;
                    return `${value.toLocaleString('en-IN')}`;
                  }}
                  tick={{
                    fontSize: 12,
                    fill: '#6c757d',
                    fontFamily: 'Arial, sans-serif'
                  }}
                  label={{
                    value: 'Quoted Price',
                    position: 'insideLeft',
                    angle: -90,
                    offset: -60,
                    style: {
                      fontSize: 14,
                      fontWeight: '600',
                      fill: '#495057',
                      fontFamily: 'Arial, sans-serif',
                      textAnchor: 'middle'
                    }
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Find the vendor who submitted at this exact time
                      const dataPoint = filteredData.find(d => d.name === label);
                      const submittingVendor = dataPoint?.submittedBy;

                      // Only show the vendor who actually submitted
                      const relevantData = payload.find(p => p.dataKey === submittingVendor);

                      if (relevantData) {
                        return (
                          <div style={{
                            backgroundColor: '#fff',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            fontSize: '14px',
                            fontFamily: 'Arial, sans-serif',
                            padding: '10px'
                          }}>
                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#495057' }}>
                              Time: {label}
                            </p>
                            <p style={{ margin: 0, color: relevantData.color, fontWeight: '600' }}>
                              {vendorNameMap[relevantData.dataKey] || relevantData.dataKey}: ₹{relevantData.value?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        );
                      }
                    }
                    return null;
                  }}
                  cursor={{
                    stroke: '#6c757d',
                    strokeWidth: 1,
                    strokeDasharray: '5 5'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    paddingTop: '20px'
                  }}
                  iconType="line"
                  formatter={(value) => vendorNameMap[value] || value}
                />
                {uniquesupplierlist?.map((vendorName, index) => {
                  const colors = [
                    '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
                    '#db2777', '#0891b2', '#65a30d', '#dc2626', '#9333ea',
                    '#0369a1', '#be123c', '#047857', '#a16207', '#6d28d9'
                  ];

                  return (
                    <Line
                      key={vendorName}
                      dataKey={vendorName}
                      stroke={colors[index % colors.length]}
                      strokeWidth={4}
                      connectNulls={true}
                      dot={{
                        fill: colors[index % colors.length],
                        strokeWidth: 2,
                        stroke: '#fff',
                        r: 6
                      }}
                      activeDot={{
                        r: 8,
                        stroke: colors[index % colors.length],
                        strokeWidth: 3,
                        fill: '#fff'
                      }}
                      strokeDasharray={index === 0 ? "0" : index % 2 === 0 ? "0" : "5 5"}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Normal View */}
      {!sortedData.some(item => item.quotedPrice && item.quotedPrice > 0) ? (
        <div className="text-center mt-4">
          <h5>No supplier has quoted yet.</h5>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Info bar — pinned top */}
          <div className="d-flex align-items-center justify-content-between px-1 mb-2" style={{ flexShrink: 0 }}>
            <span style={{ fontSize: '12px', color: '#495057' }}>
              Auction Start: <span style={{ fontWeight: 600, color: '#28a745' }}>{formatDateViaLocale(auctionManageData[0]?.bidStDate, userDetail)}</span>
            </span>
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '12px', color: '#495057' }}>
                Auction End: <span style={{ fontWeight: 600, color: '#dc3545' }}>{formatDateViaLocale(auctionManageData[0]?.bidEndDate, userDetail)}</span>
              </span>
              <button type="button" className="pe-btn pe-btn--secondary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={handleClick}>
                <ListOutlined style={{ fontSize: 14, marginRight: 2, verticalAlign: 'middle' }} />Export
              </button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{ style: { borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }}
              >
                <MenuItem onClick={() => { toggleFullScreen(); handleClose(); }} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  {isFullScreen ? '🗗 Exit Full Screen' : '🗖 Full Screen'}
                </MenuItem>
                <MenuItem onClick={() => { downloadImage(); handleClose(); }} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  📊 Image
                </MenuItem>
                <MenuItem onClick={() => { downloadPDF(); handleClose(); }} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <PictureAsPdfIcon fontSize="small" style={{ marginRight: '4px' }} />PDF
                </MenuItem>
                <MenuItem onClick={() => { downloadCSV(); handleClose(); }} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  <TextSnippetIcon fontSize="small" style={{ marginRight: '4px' }} />CSV
                </MenuItem>
              </Menu>
            </div>
          </div>

          {/* Scrollable: chart + table */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div style={{ border: '1px solid #e8e9ea', borderRadius: '8px', marginBottom: '12px', background: '#fff' }}>
              <ResponsiveContainer ref={chartRef} width="100%" height={340}>
                <LineChart
                  data={filteredData}
                  margin={{ top: 15, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e9ea" opacity={0.7} />
                  <XAxis
                    dataKey="name"
                    domain={[minX, maxX]}
                    ticks={[...filteredData.map(d => d.name)]}
                    tick={{ fontSize: 11, fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6', strokeWidth: 1 }}
                    tickLine={{ stroke: '#dee2e6' }}
                    label={{ value: 'Submission Time', position: 'insideBottom', offset: -5, style: { fontSize: 12, fontWeight: 600, fill: '#495057' } }}
                  />
                  <YAxis
                    axisLine={{ stroke: '#dee2e6', strokeWidth: 1 }}
                    tickLine={{ stroke: '#dee2e6' }}
                    domain={[finalYMin, adjustedYMax]}
                    tickCount={numberOfTicks}
                    tickFormatter={(value) => {
                      if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
                      if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
                      if (value >= 20000) return `${(value / 1000).toFixed(0)}K`;
                      return `${value.toLocaleString('en-IN')}`;
                    }}
                    tick={{ fontSize: 11, fill: '#6c757d' }}
                    label={{ value: 'Quoted Price', position: 'insideLeft', angle: -90, offset: 10, style: { fontSize: 12, fontWeight: 600, fill: '#495057', textAnchor: 'middle' } }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataPoint = filteredData.find(d => d.name === label);
                        const submittingVendor = dataPoint?.submittedBy;
                        const relevantData = payload.find(p => p.dataKey === submittingVendor);
                        if (relevantData) {
                          return (
                            <div style={{ backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '12px', padding: '8px' }}>
                              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#495057' }}>Time: {label}</p>
                              <p style={{ margin: 0, color: relevantData.color, fontWeight: 600 }}>
                                {vendorNameMap[relevantData.dataKey] || relevantData.dataKey}: ₹{relevantData.value?.toLocaleString('en-IN')}
                              </p>
                            </div>
                          );
                        }
                      }
                      return null;
                    }}
                    cursor={{ stroke: '#6c757d', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} iconType="line" formatter={(value) => vendorNameMap[value] || value} />
                  {uniquesupplierlist?.map((vendorName, index) => {
                    const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#9333ea', '#0369a1'];
                    return (
                      <Line
                        key={vendorName}
                        dataKey={vendorName}
                        stroke={colors[index % colors.length]}
                        strokeWidth={3}
                        connectNulls={true}
                        dot={{ fill: colors[index % colors.length], strokeWidth: 2, stroke: '#fff', r: 5 }}
                        activeDot={{ r: 7, stroke: colors[index % colors.length], strokeWidth: 2, fill: '#fff' }}
                        strokeDasharray={index % 2 === 0 ? "0" : "5 5"}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <PETableSimple
              columns={[
                { key: 'sno', label: 'S.No', width: 60, renderCell: (_, row, idx) => page * rowsPerPage + idx + 1 },
                { key: 'vendorName', label: 'Supplier Name', renderCell: (v) => getVendorDisplayName(v) },
                { key: 'quotedPrice', label: 'Quoted Price', renderCell: (v) => <span style={{ color: '#28a745', fontWeight: 700 }}>{v?.toLocaleString('en-IN')}</span> },
                { key: 'submissionTime', label: 'Submission Time', renderCell: (v) => formatDateViaLocale(v, userDetail, true) },
              ]}
              rows={paginatedItems.filter(item => item.quotedPrice)}
              getRowKey={(_, idx) => idx}
              wrapperStyle={{ borderRadius: 0, border: '1px solid #e5e7eb' }}
            />
          </div>

          {/* Pagination — pinned bottom */}
          <PEPagination
            page={page + 1}
            pageSize={rowsPerPage}
            totalRows={sortedData.filter(item => item.quotedPrice).length}
            pageSizeOptions={[10, 20, 30]}
            onPageChange={(p) => setPage(p - 1)}
            onPageSizeChange={(n) => { setRowsPerPage(n); setPage(0); }}
          />
        </div>
      )}
    </div>
  );
};
export default React.memo(BidGraphs);