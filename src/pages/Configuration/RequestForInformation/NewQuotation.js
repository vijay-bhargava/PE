import React, { useEffect, useState } from 'react';
import { Tooltip, IconButton, Card, CardContent, CardHeader, MenuItem, Collapse } from '@mui/material';
import FileCopyOutlined from '@mui/icons-material/FileCopyOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { DropdownButton } from 'react-bootstrap';
import { HiDotsVertical } from 'react-icons/hi';

// Sample Data
const generateVendors = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      srNo: i + 1,
      vendorName: `Vendor ${i + 1}`,
      targetPrice: `${500 + i * 10} INR`,
      quotePrice: `${5000 + i * 100} INR`,
      rank: `L${(i % 3) + 1}`,
      commercialTerms: { term: `${300 + i * 10} Rs`, description: `Description ${i + 1}` }
    }));
  };
  
  const itemsData = [
    {
      id: 1,
      srNo: 1,
      itemName: 'Item 1',
      itemCode: 'Cd26',
      quantity: 20,
      uom: 'Ton',
      targetPrice: '500 INR',
      lineWiseLowest: '300 INR',
      vendors: generateVendors(50) // Generate 50 vendors
    },
    {
      id: 2,
      srNo: 2,
      itemName: 'Item 2',
      itemCode: 'Cd27',
      quantity: 15,
      uom: 'Kg',
      targetPrice: '300 INR',
      lineWiseLowest: '200 INR',
      vendors: generateVendors(50) // Generate 50 vendors
    }
  ];

// Vendor Table Component
const VendorTable = ({ vendors }) => {
  const [expandedVendorIds, setExpandedVendorIds] = useState([]);

  const handleExpandToggle = (id) => {
    setExpandedVendorIds(prevIds =>
      prevIds.includes(id)
        ? prevIds.filter(vendorId => vendorId !== id)
        : [...prevIds, id]
    );
  };

  return (
    <table className="vendors-table">
      <thead>
        <tr>
          <th>SrNo</th>
          <th>Vendor Name</th>
          <th>Target Price</th>
          <th>Quote Price</th>
          <th>Rank</th>
          <th>Total Amount</th>
          <th>Commercial Terms</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {vendors.map((vendor) => (
          <React.Fragment key={vendor.id}>
            <tr>
              <td>{vendor.srNo}</td>
              <td><Tooltip title="Vendor Mobile Number">
              {vendor.vendorName} 
                      </Tooltip></td>
              <td>{vendor.targetPrice}</td>
              <td>{vendor.quotePrice}</td>
              <td>{vendor.rank}</td>
              <td>{vendor.quotePrice}</td>
              <td onClick={() => handleExpandToggle(vendor.id)} style={{cursor:"pointer", color:"#2A68D3"}}>{expandedVendorIds.includes(vendor.id) ? 'Hide Commercial Terms' : 'Show Commercial Terms'}</td>
              <td>
                <DropdownButton
                  as={'div'}
                  id={`vendor-menu-${vendor.id}`}
                  className='supplieraccmenu'
                  drop={'start'}
                  variant="outlined"
                  style={{ backgroundColor: "white", color: "#2182cde" }}
                  title={
                    <Tooltip title={"Version Control"}>
                      <div style={{ fontSize: "0.8125rem", color: "#2A68D3", fontWeight: "500" }}><HiDotsVertical /></div>
                    </Tooltip>
                  }
                >
                  <div className='shadow rounded min-width-200px'>
                    <MenuItem className="f12 fw500">Remove Vendor</MenuItem>
                    <MenuItem className="f12 fw500">Counter Offer</MenuItem>
                    <MenuItem className="f12 fw500">Re-Invite</MenuItem>
                    <MenuItem className="f12 fw500">Re-Open Quote</MenuItem>
                    <MenuItem className="f12 fw500">Surrogate</MenuItem>
                  </div>
                </DropdownButton>
              </td>
            </tr>
            <tr>
              <td colSpan="8">
                <Collapse in={expandedVendorIds.includes(vendor.id)}>
                  <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                    <h4 className='f14'>Commercial Terms</h4>
                    <div className='row'>
                      <div className='col-md-12 d-flex justify-content-between'>
                        <div>
                          <div className='f15'>Transport:</div>
                        </div>
                        <div>
                          <p>{vendor.commercialTerms.term}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Collapse>
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

// Main Items Table Component
const ItemsTable = () => {
    const [expandedItemIds, setExpandedItemIds] = useState([]);
    const [expandAll, setExpandAll] = useState(true);
  
    // Initialize with the first item expanded
    useEffect(() => {
      if (itemsData.length > 0) {
        setExpandedItemIds(expandAll ? itemsData.map(item => item.id) : []);
      }
    }, [expandAll]);
  
    const handleExpandToggle = (id) => {
      setExpandedItemIds(prevIds =>
        prevIds.includes(id)
          ? prevIds.filter(itemId => itemId !== id)
          : [...prevIds, id]
      );
    };
  
    const handleExpandAll = () => {
      setExpandAll(true);
    };
  
    const handleCollapseAll = () => {
      setExpandAll(false);
    };
  

  return (
    <Card className='shadow'>
      <CardHeader title={ <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className='f16 fw500'>Item Details</div>
          <div
            onClick={expandAll ? handleCollapseAll : handleExpandAll}
            style={{ fontSize:"16px",cursor: 'pointer', color: 'black', fontWeight: '400' }}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </div>
        </div>} >
      </CardHeader>
      <CardContent>
     
        <table className="items-table table-striped">
          <thead>
            <tr>
              <th>SrNo.</th>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Quantity</th>
              <th>UOM</th>
              <th>Target Price</th>
              <th>Line Wise Lowest Item</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itemsData.map(item => (
              <React.Fragment key={item.id}>
                <tr className='border-bottom'>
                  <td>{item.srNo}</td>
                  <td>
                    <div>
                      {item.itemName}
                      <Tooltip title="Description Of The Product">
                        <IconButton size="small" color="primary">
                          <InfoOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                  <td>{item.itemCode}</td>
                  <td>{item.quantity}</td>
                  <td>{item.uom}</td>
                  <td>{item.targetPrice}</td>
                  <td><Tooltip title="Vendor Name">{item.lineWiseLowest}</Tooltip></td>
                  <td>
                    <IconButton onClick={() => handleExpandToggle(item.id)}>
                      {expandedItemIds.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </td>
                </tr>
                {expandedItemIds.includes(item.id) && (
                  <tr className='border-none'>
                    <td colSpan="8">
                      <VendorTable vendors={item.vendors} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

// Main Component
const NewQuotation = () => {
  return (
    <div>
      <ItemsTable />
    </div>
  );
};

export default NewQuotation;
