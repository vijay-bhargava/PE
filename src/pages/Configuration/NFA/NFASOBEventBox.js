import React, { useEffect, useState } from 'react';
import { actionTypes, useStateValue } from "../../../store";
import { Box, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';
import {checkUTC,buildQueryParams} from "../../../utils/common/utility";
import ERFQComparative from "../RequestForQuotation/ERFQComparative";
import { api, ApiClient } from '../../../Apiclient';
import {sumArray} from "../../../utils/common";

const NFASOBEventBox = ({eventType, eventId,Version, purchaseAllList,purchaseGroupAllList}) => {
  const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail }, dispatch] =  useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [basisOf, setBasisOf] = useState("vendor"); // Dropdown state for "Basis of"
  const [valueType, setValueType] = useState('absolute'); // State for value type dropdown
  const [vendorDetails, setVendorDetails] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [value, setValue] = useState('0')
  const [eventHeaderDetails ,setEventHeaderDetails] = useState(null)
  const [approverShow ,setApproverShow] = useState(true)
  const [accessLevel, setAccessLevel] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
  const [version, setVersion] = useState(Version)
  const [versionhistory, setVersionhistory] = useState(null)
  const [allocations, setAllocations] = useState({}); 
  const [vendorPackages, setVendorPackages] = useState([]); 

    const handleAllocationChange = (supplierId, value) => {
        const allocation = parseFloat(value) || 0;
        setAllocations(prev => ({
            ...prev,
            [supplierId]: {
                allocation
            }
        }));
    };

  const handleBasisOfChange = (event) => {
    setBasisOf(event.target.value);
  };

  const handleValueTypeChange = (event) => {
    setValueType(event.target.value);
  };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const handleVendorChange = (index, field, value) => {
//     const updatedVendors = [...vendorDetails];
//     updatedVendors[index][field] = value;
//     setVendorDetails(updatedVendors);
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...itemsList];
//     updatedItems[index][field] = value;
//     setItemsList(updatedItems);
//   };


    const pullRFQHeaderDetails = async () => {
        // let VersionParam;
        // if (version?.includes("x")) {
        //     VersionParam = version.split(".")[0];
        // }
        // else {
        //     VersionParam = version
        // }
        var data = {
            Id: eventId,
            Version: parseInt(version),
        };
        const queryParams = buildQueryParams(data);
        const res = await apiClient.getres(
            `/api/RFQManage/FindById?${queryParams}`,
            atoken
        );
        if (res) {
            
            //setCurrentVersion(res?.data?.result[0]?.version)
            const result = res?.data;
            setEventHeaderDetails(result)
            if (result[0]?.versionhistory?.length != versionhistory?.length) {
                setVersionhistory(result[0]?.versionhistory)
            }
            setrfqOthersCommercialList(
                result[0]?.rfqPackageCommercial
            )
            setSelectedSupplier(result[0]?.rfqVendorInvited);
            setItemsList(result[0]?.rfqParameters);
        }
    };

    const pullRFQInvitedVendor = async () => {
        const reqdata = {
            RFQId: eventId,
            Version: version,
        };
        const queryParams = buildQueryParams(reqdata);
        const res = await apiClient.getres(
            `/api/RFQVendorInvite/Find?${queryParams}`,
            atoken
        );
        if(res){
            const result = res?.data;
            setVendorDetails(result);
        }
    }

    const handleApprover = (booleanvalue) => {
        setApproverShow(booleanvalue)
    }
    const handleDraftEvent = () => {
        return false;
    }
    const handleTab = (booleanvalue) => {
		// setTabShow(booleanvalue)
		// if (booleanvalue) {
		// 	setValue(1)
		// }
	}
        
     const getCategorylist = async () => {
      const obj = {
        CustomerId: customerid,
      }
      const queryParams = buildQueryParams(obj);
   
      const res = await apiClient.getres(
        `/api/ItemCategory/Find?${queryParams}`,
        atoken
      );
      
      if (res) {
        setCategoryList(res?.data?.result || []);
      }
    };

  useEffect(() => {
    setValue(eventType);
    pullRFQHeaderDetails();
    getCategorylist();
    pullRFQInvitedVendor();
  },[eventType,eventId])

  useEffect(() => {
    console.log('RFQ Details', eventHeaderDetails);
    console.log('Category List', categoryList);
    console.log('supplier list', selectedSupplier);
    console.log('Supplier Details', vendorDetails)
  },[categoryList,eventHeaderDetails])

  return (
    <div className="p-3 pe-2 ps-2 custom-fix">
        <Grid container spacing={2}>
            {/* Basis of dropdown */}
            <Grid item xs={12} md={6}>
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
                    <MenuItem value="vendor">Package</MenuItem>
                    <MenuItem value="item">Item</MenuItem>
                    </Select>
                </FormControl>
                </Box>
            </Grid>

            {/* Value Type dropdown */}
            <Grid item xs={12} md={6}>
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
            </Grid>
        </Grid>
        <div>
         
        </div>
           <div
               className="table-responsive item-Table"
               style={{ overflowX: basisOf === 'item' ? 'auto' : 'hidden' }}
             >
               <Table
                 className="stripped"
                 style={{
                   backgroundColor: 'white',
                   color: 'black',
                   borderCollapse: 'collapse',
                   width: '100%',
                 }}
               >
                 <thead>
                   <tr style={{ color: 'black' }}>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>S.No</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>VENDOR DETAILS</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Package Rank</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Initial Price</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Final Price</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Price Reduction</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Allocation</th>
                     <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Total</th>
                   </tr>
                 </thead>
                 <tbody>
                   {/* {vendorPackages.map((item, index) => (
                     <tr
                       key={item.vendorId}
                       style={{
                        
                         color: 'black',
                       }}
                     >
                       <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>{index + 1}</td>
                       <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>{item.companyName}</td>
                       <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>{item.packageRank}</td>
                       <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                         {item.initialPrice !== 0 ? item.initialPrice : 'Not Quoted'}
                       </td>
                       <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                         {!item.newVendor
                           ? item.finalPrice !== 0
                             ? item.finalPrice
                             : 'Not Quoted'
                           : 'New Vendor Input'}
                       </td>
                       <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>{item.priceReduction}</td>
                <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                           <TextField
                             InputLabelProps={{ shrink: true }}
                             fullWidth
                             variant="outlined"
                             size="small"
                             className="f14"
                             id={`allocation-${item.vendorId}`}
                             name="allocation"
                             type="number"
                             inputProps={{
                               inputMode: 'decimal',
                               pattern: '[0-9]*[.]?[0-9]*',
                             }}
                             value={
                               item.allocation !== undefined && item.allocation !== null
                                 ? item.allocation
                                 : ''
                             }
                             onChange={(e) =>
                               handleAllocationChange(item.vendorId, e.target.value)
                             }
                             error={Boolean(allocations[item.vendorId])}
                             helperText={allocations[item.vendorId]}
                           />
                         </td>
                      <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>{item.total}</td>
                     </tr>
                   ))} */}
                 </tbody>
               </Table>
             </div>
    </div>
  );
};

export default NFASOBEventBox;
