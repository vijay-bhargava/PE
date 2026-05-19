import React, { useEffect, useState,useImperativeHandle,forwardRef } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid,Stack ,Button,Pagination ,IconButton,Autocomplete,Checkbox} from '@mui/material';
import { HiOutlineX, HiPlusSm, HiOutlineUserAdd, HiPencilAlt, HiOutlineInformationCircle } from "react-icons/hi";
import Drawer from "@mui/material/Drawer";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Badge } from "react-bootstrap";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import { ApiClient } from '../../../Apiclient';
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { useStateValue } from '../../../store';
import { buildQueryParams, VendorfilterOptions } from '../../../utils/common/utility';




const SOB = forwardRef((props, ref) => {
      const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail }, dispatch] =  useStateValue();
      const apiClient = new ApiClient(customersuffix);
  const [basisOf, setBasisOf] = useState("vendor"); // Dropdown state for "Basis of"
  const [valueType, setValueType] = useState('absolute'); // State for value type dropdown
  const [vendorDetails, setVendorDetails] = useState([{ vendorName: '', quantity: '', price: '', allocation: '' }]);
  const [itemsList, setItemsList] = useState([
  { id: 1, itemCode: 'Item 1', price: 990, quantity: 50, vendorName: 'Supplier A' ,uom:'USD', itemName:'Item A'},
  { id: 2, itemCode: 'Item 2', price: 843, quantity: 100, vendorName: 'Supplier B' ,uom:'USD', itemName:'Item B'},
  { id: 3, itemCode: 'Item 3', price: 850, quantity: 50, vendorName: 'Supplier C' ,uom:'USD', itemName:'Item C'},
  { id: 4, itemCode: 'Item 4', price: 923, quantity: 15, vendorName: 'Supplier D' ,uom:'USD', itemName:'Item D'},
]);

const groupedItems = [
  {
    itemCode: 'Item 1',
    itemName: 'Item A',
    uom: 'USD',
    vendors: [
      { vendorName: 'Supplier A', price: 990, quantity: 50 },
    ]
  },
  {
    itemCode: 'Item 2',
    itemName: 'Item B',
    uom: 'USD',
    vendors: [
      { vendorName: 'Supplier C', price: 843, quantity: 100 },
      { vendorName: 'Supplier A', price: 990, quantity: 90 },
    ]
  },
  {
    itemCode: 'Item 3',
    itemName: 'Item C',
    uom: 'USD',
    vendors: [
      { vendorName: 'Supplier A', price: 850, quantity: 50 },
    ]
  },
  {
    itemCode: 'Item 4',
    itemName: 'Item D',
    uom: 'USD',
    vendors: [
      { vendorName: 'Supplier A', price: 923, quantity: 15 },
      { vendorName: 'Supplier C', price: 1060, quantity: 10 },
      { vendorName: 'Supplier B', price: 1090, quantity: 10 },
    ]
  },
  {
    itemCode: 'Item 5',
    itemName: 'Item E',
    uom: 'USD',
    vendors: [
      { vendorName: 'Supplier A', price: 500, quantity: 205 },
      { vendorName: 'Supplier C', price: 0, quantity: 0 },
      { vendorName: 'Supplier D', price: 0, quantity: 0 },
    ]
  }
];



  // const [itemsList, setItemsList] = useState([
  //   { id: 1, itemCode: 'A123', itemName: 'Item A', quantity: 100, price: 200, uom: 'kg', vendorName: 'Vendor A' },
  //   { id: 2, itemCode: 'B234', itemName: 'Item B', quantity: 150, price: 300, uom: 'pcs', vendorName: 'Vendor B' },
  //   // { id: 3, itemCode: 'C234', itemName: 'Item C', quantity: 100, price: 350, uom: 'kg', vendorName: 'Vendor C' }
  // ]);
     const [openDrawer, setOpenDrawer] = useState({
          addsupplier: false
          });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
      const [selectedCategory, setSelectedCategory] = useState(null);
      const [remainingSupplier, setRemainingSupplier] = useState([]);
      const [newSupplier, setNewSupplier] = useState([]);
      //pagination for total suppliers
          const [categoryList, setCategoryList] = useState([]);
      
      const [pageTS, setPageTS] = React.useState(1);
      const [totalpageTS, setTotalPageTS] = React.useState(3);
      const [pageCount, setPageCount] = React.useState(10);
      const [pageSS, setPageSS] = React.useState(1);
      const [totalpageSS, setTotalPageSS] = React.useState(
          Math.ceil(newSupplier / pageCount)
      );
      const [loading, setLoading] = useState(false)
          const { permissionManager, canRead, canEdit, canCreate, canRemove } = props;
          
          // Permission checks for Event Details
          const eventDetailsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? false;
          const eventDetailsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? false;
          const eventDetailsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? false;
          const eventDetailsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? false;
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const [value, setValue] = useState('0')
    const [eventHeaderDetails ,setEventHeaderDetails] = useState(null)
    const [approverShow ,setApproverShow] = useState(true)
    const [accessLevel, setAccessLevel] = useState([]);

    const [selectedSupplier, setSelectedSupplier] = useState([]);
    const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
    const [version, setVersion] = useState(props.nfaEventVersion)
    const [versionhistory, setVersionhistory] = useState(null)
    const [allocations, setAllocations] = useState({});
    const [vendorPackages, setVendorPackages] = useState(props.vendorPackages);
    const [allocationErrors, setAllocationErrors] = useState({});
    const [totalQuantity, setTotalQuantity] = useState(0);
  const handleBasisOfChange = (event) => {
    setBasisOf(event.target.value);
  };

  const handleValueTypeChange = (event) => {
    setValueType(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleVendorChange = (index, field, value) => {
    const updatedVendors = [...vendorDetails];
    updatedVendors[index][field] = value;
    setVendorDetails(updatedVendors);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...itemsList];
    updatedItems[index][field] = value;
    setItemsList(updatedItems);
  };   
   const toggleDrawer = (anchor, open) => {
		setOpenDrawer({ ...openDrawer, [anchor]: open });
	};
  
    const handlePaginationTS = (event, value) => {
        if (value) {
            setPageTS(value);
        }
    };
    const handlePaginationSS = (event, value) => {
        if (value) {
            setPageSS(value);
        }
    };

   const handleSupplierWithCategory = async (selectedCategory) => {
        const obj = {
            CustomerId: customerid,
            Advance: "Advance",
            CategoryId: selectedCategory?.id,
        };
        const queryParams = buildQueryParams(obj);

        const res = await apiClient.getres(
            `/api/managevendors/GetVendorUsers?${queryParams}`,
            atoken
        );
        if (res && res?.data?.result?.length > 0) {
            // Extract the emails from selectedSupplier
            const selectedSupplierEmails = selectedSupplier.map((item) => item.emailId);
            const newSupplierEmails = newSupplier.map((item) => item.email);
            // Filter the suppliers from the API response that are not in selectedSupplier
            const filteredSuppliers = res.data.result.filter((supplier) => {
                return !selectedSupplierEmails.includes(supplier.email) &&
                    !newSupplierEmails.includes(supplier.email);
            });
            setRemainingSupplier(filteredSuppliers);
        } else {
            // Reset totalSuppliers if no results are returned
            setRemainingSupplier([]);
        }
    };

    const getTotalSupplier = async () => {
        const obj = {
            CustomerId: customerid,
            //Advance: `Advance`,
        };
        const queryParams = buildQueryParams(obj);

        const res = await apiClient.getres(
            `/api/managevendors/GetVendorUsers?${queryParams}`,
            atoken
        );

        if (res) {
            // Extract the emails from selectedSupplier and newSupplier
            const selectedSupplierEmails = selectedSupplier.map((item) => item.emailId);
            const newSupplierEmails = newSupplier.map((item) => item.email);
            // Filter the suppliers from the API response that are not in selectedSupplier or newSupplier
            const filteredSuppliers = res.data.filter((supplier) => {
                return (
                    !selectedSupplierEmails.includes(supplier.email) &&
                    !newSupplierEmails.includes(supplier.email)
                );
            });
            setRemainingSupplier(filteredSuppliers);
        }
    };
    const handleCheckRemainingSupplier = (supplier) => {
        // Find the supplier index in remainingSupplier
        const supplierIndex = remainingSupplier.findIndex(
            (item) => item.contactId === supplier.contactId
        );

        // Check if supplier already exists in newSupplier
        const isAlreadyInNewSupplier = newSupplier.some(
            (item) => item.contactId === supplier.contactId
        );

        if (isAlreadyInNewSupplier) {
            toast.info("User from this Supplier is already added", {
                toastId: "supplier_info"
            });
            return;
        }

        // If supplier exists in remainingSupplier, remove and add it to newSupplier
        if (supplierIndex !== -1) {
            const updatedRemainingSupplier = [...remainingSupplier];
            const updatedNewSupplier = [...newSupplier];

            // Remove the supplier from remainingSupplier
            const [removedSupplier] = updatedRemainingSupplier.splice(supplierIndex, 1);

            // Add the removed supplier to newSupplier
            updatedNewSupplier.push(removedSupplier);

            // Update the state
            setRemainingSupplier(updatedRemainingSupplier);
            setNewSupplier(updatedNewSupplier);
        }

    };
    
    const handleInitialData =  () => {
        
        const updatedVendorPackages = vendorPackages.map(vendorPackage => {
        return {
            ...vendorPackage,
            priceReduction: vendorPackage.initialPrice && vendorPackage.finalPrice ? vendorPackage.initialPrice - vendorPackage.finalPrice : '',
        };
        });
        setVendorPackages(updatedVendorPackages);
    }

    const handleClearRemainingSupplier = (supplier) => {
        setSelectedCategory(null)
        // Find the supplier index in newSupplier
        const supplierIndex = newSupplier.findIndex(
            (item) => item.contactId === supplier.contactId
        );

        // If supplier exists in newSupplier, remove and add it back to remainingSupplier
        if (supplierIndex !== -1) {
            const updatedNewSupplier = [...newSupplier];
            const updatedRemainingSupplier = [...remainingSupplier];

            // Remove the supplier from newSupplier
            const [removedSupplier] = updatedNewSupplier.splice(supplierIndex, 1);

            // Add the removed supplier back to remainingSupplier
            updatedRemainingSupplier.push(removedSupplier);

            // Update the state
            setNewSupplier(updatedNewSupplier);
            setRemainingSupplier(updatedRemainingSupplier);
        }
    };
    //Handle update button of add new supplier
    const handleSaveNewSupplier = async () => {
        setLoading(true)
        const updated = newSupplier.map((vendor, index) => ({
            vendorId: vendor.vendorId,
            companyName: vendor.companyName,
            initialPrice: 0, // to be filled later
            finalPrice: '',
            priceReduction: '',
            packageRank: `NA`,
            allocation: 0,
            total: '',
            newVendor: true
        }));
        setVendorPackages(prev => [...prev, ...updated]);
        setLoading(false)
        toggleDrawer("addsupplier", false)
    };
    const allVendors = Array.from(
  new Set(groupedItems.flatMap(item => item.vendors.map(v => v.vendorName)))
);


  return (
    
    <div className="p-3 pe-2 ps-2 custom-fix">
      {/* <Grid container spacing={2}> */}
        {/* Basis of dropdown */}
        {/* <Grid item xs={12} md={6}>
          <Box mb={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="basis-of-label">Basis of</InputLabel>
              <Select
                labelId="basis-of-label"
                id="basis-of-select"
                value={basisOf}
                onChange={handleBasisOfChange}
                label="Basis of"
              >
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="item">Item</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid> */}
  {/* <Box display="flex" justifyContent="flex-end" mb={2}>
  <Button 
    variant="text"
    size="small"
    startIcon={<HiPlusSm />}
    className="text-capitalize blue-text font-normal"
    onClick={() => toggleDrawer("addsupplier", true)}
    // disabled={!eventDetailsCanCreate}
  >
    Add More Suppliers
  </Button>
</Box> */}
        {/* Value Type dropdown */}
        {/* <Grid item xs={12} md={6}>
            <Box mb={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="value-type-label">Value Type</InputLabel>
                <Select
                  labelId="value-type-label"
                  id="value-type-select"
                  value={valueType}
                  onChange={handleValueTypeChange}
                  label="Value Type"
                >
                  <MenuItem value="absolute">Absolute</MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid> */}
      {/* </Grid> */}
      <div>
<Grid container spacing={2} alignItems="center">
  {/* Basis of Dropdown */}
  <Grid item xs={12} md={4}>
    <FormControl fullWidth size="small">
      <InputLabel id="basis-of-label">Basis of</InputLabel>
      <Select
        labelId="basis-of-label"
        id="basis-of-select"
        value={basisOf}
        onChange={handleBasisOfChange}
        label="Basis of"
      >
        <MenuItem value="vendor">Vendor</MenuItem>
        <MenuItem value="item">Item</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* Value Type Dropdown */}
  <Grid item xs={12} md={4}>
    <FormControl fullWidth size="small">
      <InputLabel id="value-type-label">Value Type</InputLabel>
      <Select
        labelId="value-type-label"
        id="value-type-select"
        value={valueType}
        onChange={handleValueTypeChange}
        label="Value Type"
      >
        <MenuItem value="absolute">Absolute</MenuItem>
        <MenuItem value="percentage">Percentage</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* Add More Suppliers Button */}
  <Grid item xs={12} md={4}>
    <Box display="flex" justifyContent="flex-end">
      <Button
        variant="text"
        size="small"
        startIcon={<HiPlusSm />}
        className="text-capitalize blue-text font-normal"
        onClick={() => toggleDrawer("addsupplier", true)}
        // disabled={!eventDetailsCanCreate}
      >
        Add More Suppliers
      </Button>
    </Box>
  </Grid>
</Grid>
</div>
      <div className="table-responsive item-Table mt-4" style={{ overflowX: basisOf === 'item' ? 'auto' : 'hidden' }}>
        <Table className="itemstable stripped">
          <thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
            <tr>
              <th className="text-white fw500 f14">S.No</th>
              <th className="text-white fw500 f14">Item Code</th>
              <th className="text-white fw500 f14">Item / Service</th>
              <th className="text-white fw500 f14">UOM</th>
              <th className="text-white fw500 f14">Quantity</th>
              {basisOf === 'vendor' && <th className="text-white fw500 f14">Target Price</th>}
              {basisOf === 'vendor' && <th className="text-white fw500 f14">Allocation</th>}
              {basisOf === 'item' && allVendors.map((vendor, index) => (
                <th key={index} className="text-white fw500 f14" colSpan={2}>
                  {vendor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
              <tr className={index % 2 === 0 ? 'even' : 'odd'} key={`${item.itemCode}-${index}`}>
                <td className="f14" style={{ cursor: "pointer" }}>
                  {page * rowsPerPage + index + 1}
                </td>
                <td className="f14 productTd" style={{ cursor: "pointer" }}>
                  {item.itemCode}
                </td>
                <td className="f14 productTd" style={{ cursor: "pointer" }}>
                  {item.itemName}
                </td>
                <td className="f14 productTd" style={{ cursor: "pointer" }}>
                  {item.uom}
                </td>
                <td className="f14 productTd">
                  {/* Show total quantity from all vendors */}
                  {item.vendors.reduce((total, vendor) => total + vendor.quantity, 0)}
                </td>
                {basisOf === 'vendor' && (
                  <>
                    <td className="f14">
                      {/* Show lowest price among vendors */}
                      {Math.min(...item.vendors.map(v => v.price))}
                    </td>
                    <td className="f14">
                      <TextField
                        size="small"
                        value={vendorDetails[index]?.allocation || ''}
                        onChange={(e) => handleVendorChange(index, 'allocation', e.target.value)}
                      />
                    </td>
                  </>
                )}
                {basisOf === 'item' && (
                  <>
                    {allVendors.map((vendor, vendorIndex) => {
                      const vendorData = item.vendors.find(v => v.vendorName === vendor);
                      return (
                        <React.Fragment key={vendorIndex}>
                          <td className="f14" style={{ padding: '8px' }}>
                            <TextField
                              size="small"
                              label="Quantity"
                              value={vendorData ? vendorData.quantity : 0}
                              placeholder='Quantity'
                              onChange={(e) => handleItemChange(index, vendor, 'quantity', e.target.value)}
                              type="number"
                              sx={{ width: '80px' }}
                              variant="outlined"
                            />
                          </td>
                          <td className="f14" style={{ padding: '8px' }}>
                            <TextField
                              size="small"
                              label="Price"
                              value={vendorData ? vendorData.price : 0}
                              placeholder='Price'
                              onChange={(e) => handleItemChange(index, vendor, 'price', e.target.value)}
                              type="number"
                              sx={{ width: '80px' }}
                              variant="outlined"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={groupedItems.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />


        <React.Fragment key="top">
                  {/* Drawer for Add New Supplier */}
                  <Drawer
                      anchor="right" // Drawer position (right in this case)
                      open={openDrawer.addsupplier} // Open this drawer if state is true for 'addsupplier'
                      onClose={() => toggleDrawer("addsupplier", false)} // Close when clicked outside or on close button
                  >
                      <div style={{width: 600,display: "flex",flexDirection: "column",}}>
                          <Box className="bgheaderCards">
                              <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                                  <div className="ms-3 text-white">Add New Supplier</div>
                                  <IconButton
                                      onClick={() => toggleDrawer("addsupplier", false)}
                                      size="small"
                                      edge="start"
                                      sx={{ mr: 1 }}
                                  >
                                      <HiOutlineX className="f20 text-white" />
                                  </IconButton>
                              </div>
                          </Box>
                          <div className="row p-2">
                              <div className="col-12">
                                  <div className="">
                                      <div className="row align-items-center">
                                          <div className="col-12 col-md-12">
                                              <div className="row mt-2">
                                                  <div className="col-12 col-md-6 col-lg-6 mb-3">
                                                      <Autocomplete
                                                          disablePortal
                                                          id=""
                                                          size="small"
                                                          options={categoryList ?? []}
                                                          fullWidth
                                                          disabled={!eventDetailsCanEdit}
                                                          renderInput={(params) => (
                                                              <TextField
                                                                  {...params}
                                                                  InputLabelProps={{
                                                                      shrink: true,
                                                                  }}
                                                                  label="Category"
                                                              />
                                                          )}
                                                          getOptionLabel={(option) =>
                                                              option.categoryName ?? ""
                                                          }
                                                          value={selectedCategory}
                                                          onChange={(e, newvalue) => {
                                                              setSelectedCategory(newvalue);
                                                              handleSupplierWithCategory(newvalue);
                                                          }}
                                                      />
                                                  </div>
      
                                                  <div className="col-12 col-md-6 col-lg-6 mb-3">
                                                      <Autocomplete
                                                          id="searchvendorbyname"
                                                          options={
                                                              remainingSupplier ?? []
                                                          }
                                                          filterOptions={VendorfilterOptions}
                                                          getOptionLabel={(option) => ""}
                                                          disabled={!eventDetailsCanCreate}
                                                          renderOption={(
                                                              props,
                                                              option,
                                                              { selected }
                                                          ) => (
                                                              <li {...props}>
                                                                  {<Checkbox
                                                                      icon={icon}
                                                                      checkedIcon={checkedIcon}
                                                                      style={{ marginRight: 8 }}
                                                                  />}
                                                                  {`${option.contactPerson} | ${option.email} | ${option?.companyName}` ??
                                                                      ""}
                                                              </li>
                                                          )}
                                                          size="small"
                                                          fullWidth
                                                          renderInput={(params) => (
                                                              <TextField
                                                                  {...params}
                                                                  InputLabelProps={{
                                                                      shrink: true,
                                                                  }}
                                                                  label="Search User from Supplier by Name"
                                                              />
                                                          )}
                                                          onChange={(e, newvalue) => {
                                                              if (newvalue) {
      
                                                                  handleCheckRemainingSupplier(newvalue)
                                                              }
                                                          }}
                                                      />
                                                  </div>
                                              </div>
                                          </div>
      
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div className="row mt-3">
                              <div className="col-12 col-md-12 col-lg-6">
                                  <div className="bg-white rounded shadow-sm">
                                      <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                                          <div className="p-2">
                                              <div className="d-flex align-items-center">
                                                  Remaining Suppliers{" "}
                                                  <div className="supplierCount">
                                                      {
                                                          remainingSupplier
                                                              ?.length
                                                      }
                                                  </div>{" "}
                                                  {selectedCategory && (
                                                      <Badge pill bg="success" text="dark">
                                                          {selectedCategory?.categoryName}
                                                      </Badge>
                                                  )}
                                              </div>
      
                                          </div>
      
                                      </div>
                                      <hr className="m-0" />
                                      <div className="row">
                                          <div className="col-12">
                                              {remainingSupplier
      
                                                  ?.slice(
                                                      (pageTS - 1) * pageCount,
                                                      pageTS * pageCount
                                                  )
                                                  .map((x, i) => (
                                                      <div
                                                          className="d-flex border-bottom align-items-center m-0 p-1 pt-0 pb-0"
                                                          key={i}
                                                      >
      
                                                          <div className="flex-grow-1 ms-2 text-truncate">
      
                                                              <div className="text-truncate f12">
                                                                  <IconButton
                                                                      size="small"
                                                                      className="ms-2 me-3"
                                                                      color="primary"
                                                                      onClick={() => handleCheckRemainingSupplier(x)}
                                                                      disabled={!eventDetailsCanCreate}
                                                                  >
                                                                      <HiOutlineUserAdd />
                                                                  </IconButton>
      
                                                                  {`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}
      
                                                              </div>
                                                          </div>
      
      
                                                      </div>
                                                  ))}
                                          </div>
                                      </div>
                                  </div>
      
                                  <div className="pagination_wrapper mb-3 mt-3">
                                      <div className="d-flex align-items-center">
                                          <div className="flex-grow-1 d-none d-md-block">
                                          </div>
                                          <div className="">
                                              <Stack spacing={2}>
                                                  <Pagination
                                                      count={totalpageTS}
                                                      page={pageTS}
                                                      onChange={handlePaginationTS}
                                                  />
                                              </Stack>
                                          </div>
      
                                      </div>
                                  </div>
      
                              </div>
                              {newSupplier && newSupplier.length > 0 && <div className="col-12 col-md-12 col-lg-6 border-start">
                                  <div className="bg-white rounded shadow-sm">
                                      <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                                          <div className="p-2">
                                              <div className="d-flex align-items-center">
                                                  New Suppliers{" "}
                                                  <div className="supplierCount">
                                                      {newSupplier?.length}
                                                  </div>
                                              </div>
      
                                          </div>
                                          <div className="">
                                              <>
                                              </>
                                          </div>
                                      </div>
                                      <hr className="m-0" />
                                      <div className="row">
                                          <div className="col-12">
                                              {newSupplier
                                                  .slice(
                                                      (pageSS - 1) * pageCount,
                                                      pageSS * pageCount
                                                  )
                                                  .map((x, i) => (
                                                      <div
                                                          className="row border-bottom align-items-center m-0 p-1 pt-0 pb-0"
                                                          key={i}
                                                      >
                                                          <div className="col-md-10">
                                                              <div className="d-flex align-items-center ">
      
                                                                  <div className="text-truncate f12">
                                                                      <IconButton
                                                                          size="small"
                                                                          className="ms-2 me-3"
                                                                          color="error"
                                                                          onClick={() => handleClearRemainingSupplier(x)}
                                                                          disabled={!eventDetailsCanRemove}
                                                                      >
                                                                          <HiOutlineX />
                                                                      </IconButton>
                                                                      {`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                          <div className="col-md-2 justify-content-end d-flex align-items-center">
                                                              <div className="col-md-4  d-flex align-items-center justify-content-end">
      
      
                                                              </div>
      
      
                                                          </div>
                                                      </div>
                                                  ))}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="pagination_wrapper mb-3 mt-3">
                                      <div className="d-flex align-items-center">
                                          <div className="flex-grow-1 d-none d-md-block">
      
                                          </div>
                                          <div className="">
                                              <Stack spacing={2}>
                                                  <Pagination
                                                      count={totalpageSS}
                                                      page={pageSS}
                                                      onChange={handlePaginationSS}
                                                  />
                                              </Stack>
                                          </div>
                                      </div>
                                  </div>
                              </div>}
                              {newSupplier && newSupplier.length > 0 && <div className="row">
                                  <div className="col-md-12 text-end">
                                      <div className="buttonVendor">
                                          <LoadingButton 
                                              loading={loading} 
                                              variant="contained" 
                                              onClick={handleSaveNewSupplier}
                                              disabled={!eventDetailsCanEdit}
                                          >
                                              Update
                                          </LoadingButton>
                                      </div>
      
                                  </div>
                              </div>}
                          </div>
                      </div>
                  </Drawer>
              </React.Fragment>
    </div>
  );
});

export default SOB;
