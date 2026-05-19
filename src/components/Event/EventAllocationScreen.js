import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { actionTypes, useStateValue } from "../../store";
import { Autocomplete, Box, Button, Table, IconButton, Checkbox, Stack, TableHead, TableBody, TableRow, TableCell, Pagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { checkUTC, buildQueryParams, VendorfilterOptions } from "../../utils/common/utility";
import { api, ApiClient } from '../../Apiclient';
import Drawer from "@mui/material/Drawer";
import { HiOutlineX, HiPlusSm, HiOutlineUserAdd, HiPencilAlt, HiOutlineInformationCircle } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Badge } from "react-bootstrap";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';

const EventAllocationScreen = forwardRef(({ props }, NFASOBRFQRef) => {
    const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);

    // Extract permission props
    const { permissionManager, canRead, canEdit, canCreate, canRemove } = props;

    // Permission checks for Event Details
    
    // const eventDetailsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? true;
    // const eventDetailsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? true;
    // const eventDetailsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? true;
    // const eventDetailsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? true;
    
    const eventDetailsCanRead =  true;
    const eventDetailsCanEdit =  true;
    const eventDetailsCanCreate =  true;
    const eventDetailsCanRemove =  true;

    
    // Check if current stage is Draft - only allow edits in Draft stage
    const isDraftStage = props.currentStage?.trim() == "Allocation";

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const [basisOf, setBasisOf] = useState(""); // Dropdown state for "Basis of"
    const [valueType, setValueType] = useState(""); // State for value type dropdown
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [value, setValue] = useState('0')
    const [eventHeaderDetails, setEventHeaderDetails] = useState(null)
    const [approverShow, setApproverShow] = useState(true)
    const [accessLevel, setAccessLevel] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState([]);
    const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
    const [versionhistory, setVersionhistory] = useState(null)
    const [allocations, setAllocations] = useState({});
    const [vendorPackages, setVendorPackages] = useState([]);
    const [items, setItems] = useState([]);
    const [allocationErrors, setAllocationErrors] = useState({});
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [priceValue, setPriceValue] = useState('');
    const [openDrawer, setOpenDrawer] = useState({
        addsupplier: false
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [remainingSupplier, setRemainingSupplier] = useState([]);
    const [newSupplier, setNewSupplier] = useState([]);
    //pagination for total suppliers
    const [pageTS, setPageTS] = React.useState(1);
    const [totalpageTS, setTotalPageTS] = React.useState(3);
    const [pageCount, setPageCount] = React.useState(10);
    const [pageSS, setPageSS] = React.useState(1);
    const [totalpageSS, setTotalPageSS] = React.useState(
        Math.ceil(newSupplier / pageCount)
    );
    const [loading, setLoading] = useState(false)
    const [expandedItems, setExpandedItems] = useState({}); // Track expanded items

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


    useEffect(() => {
        handlePaginationTS();
        setTotalPageTS(
            Math.ceil(remainingSupplier?.length / pageCount)
        );
    }, [pageTS, remainingSupplier]);

    useEffect(() => {
        handlePaginationSS();
        setTotalPageSS(Math.ceil(newSupplier?.length / pageCount));
    }, [pageSS, newSupplier]);

    // Function to save SOB details
    useImperativeHandle(NFASOBRFQRef, () => ({
        saveSOBDetails: async () => {
                const data = vendorPackages.map((vendor, index) => ({
                    id: 0,
                    vendorId: vendor.vendorId,
                    companyName: vendor.companyName,
                    initialPrice: vendor.initialPrice ?? 0, // to be filled later
                    finalPrice: vendor.finalPrice != '' ? parseFloat(vendor.finalPrice) : 0,
                    nfaEventId: props.nfaEventId,
                    nfaEventType: props.nfaEventType,
                    packageRank: vendor.packageRank,
                    allocation: parseFloat(vendor.allocation || 0),
                    newVendor: vendor.newVendor,
                    nfaId: props.eventId,
                    // For item-wise view, use the actual itemId; for package-wise, use 0
                    itemId: basisOf === 'item' ? (vendor.itemId || 0) : 0,
                    customerId: customerid,
                    version: props.Version,
                    allocationOn: basisOf,
                    valueType: valueType,
                    totalPrice: parseFloat(vendor.totalPrice || 0)
                }));
                const res = await apiClient.postres(`/api/NFASOBDetails/${props.nfaEventId}/Add?EventType=${props.nfaEventType}`, data, atoken);
                if (res) {
                    toast.success("Allocation Saved Successfully", {
                        toastId: "QS"
                    })
                    return true
                }
                else {
                    return false
                }
        },
        isAllocationSubmitted: () => {
            if (Array.isArray(vendorPackages) && vendorPackages.length > 0) {
                return vendorPackages.some(pkg => parseFloat(pkg.allocation) > 0);
            }
            return false;
        }
    }));

    // Function to save SOB details
    // const saveSOBDetails = async () => {
    //     const data = vendorPackages.map((vendor, index) => ({
    //         id: 0,
    //         vendorId: vendor.vendorId,
    //         companyName: vendor.companyName,
    //         initialPrice: vendor.initialPrice ?? 0, // to be filled later
    //         finalPrice: vendor.finalPrice != '' ? parseFloat(vendor.finalPrice) : 0,
    //         nfaEventId: props.nfaEventId,
    //         nfaEventType: props.nfaEventType,
    //         packageRank: vendor.packageRank,
    //         allocation: parseFloat(vendor.allocation || 0),
    //         newVendor: vendor.newVendor,
    //         nfaId: props.eventId,
    //         // For item-wise view, use the actual itemId; for package-wise, use 0
    //         itemId: basisOf === 'item' ? (vendor.itemId || 0) : 0,
    //         customerId: customerid,
    //         version: props.Version,
    //         allocationOn: basisOf,
    //         valueType: valueType,
    //         totalPrice: parseFloat(vendor.totalPrice || 0)
    //     }));
    //     const res = await apiClient.postres(`/api/NFASOBDetails/${props.eventId}/Add`, data, atoken);
    //     if (res) {
    //         toast.success("Allocation Saved Successfully", {
    //             toastId: "QS"
    //         })
    //         return true
    //     }
    //     else {
    //         return false
    //     }
    // }
    // Fetch existing SOB details if any
    const getSOBDetails = async (data) => {
        const params = {
            NFAId: props.eventId,
            EventId: props.nfaEventId,
            EventType: props.nfaEventType,
            BasisOf: data ? data : "",
            Version: props.Version ?? 1,
        };
        const queryParams = buildQueryParams(params);
        const res = await apiClient.getres(`/api/NFAManage/GetItemWiseData?${queryParams}`, atoken);
        if (res) {
            setItems(res?.data?.items || []);
            // console.log(vendorPackages);
            setVendorPackages(res?.data?.packageWiseData || []);

        }
    };

    useEffect(() => {
        if (props.nfaEventType && props.nfaEventId && props.nfaEventVersion) {
            setItems([]);
            setVendorPackages([]);
            getSOBDetails();
            setValue(props.nfaEventType);
            // pullRFQHeaderDetails();
            getTotalSupplier();
            getCategorylist();
        }
    }, [props.nfaEventType, props.nfaEventId, props.nfaEventVersion])

    useEffect(() => {
        if (Array.isArray(vendorPackages) && vendorPackages.length > 0) {
            
            if (vendorPackages[0]?.allocationOn) {
                setBasisOf(vendorPackages[0]?.allocationOn);
            }
            if (vendorPackages[0]?.valueType) {
                setValueType(vendorPackages[0]?.valueType);
            }
        }
    }, [vendorPackages])

    // Handle allocation change
    const handleAllocationChangePackage = (vendorId, value) => {
        // Allow only numbers and up to 4 decimal places
        if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
            const finalPrice = parseFloat(vendorPackages.find(pkg => pkg.vendorId === vendorId)?.finalPrice) || 0;
            const updatedPackages = vendorPackages.map(pkg =>
                pkg.vendorId === vendorId
                    ? {
                        ...pkg, allocation: value,
                        totalPrice: (valueType === 'percentage' ? ((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) : (parseFloat(value || 0)).toFixed(4))
                    } // keep as string
                    : pkg
            );

            // Calculate new total based on updated values
            const newTotal = updatedPackages.reduce((sum, v) => {
                const val = parseFloat(v.allocation);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);

            // Error checking based on valueType
            let errorMsg = '';
            if (valueType === 'percentage' && newTotal > 100) {
                errorMsg = 'Total allocation cannot exceed 100%';
            } else if (valueType === 'absolute' && newTotal > totalQuantity && totalQuantity != 0) {
                errorMsg = `Total allocation cannot exceed ${totalQuantity}`;
            }

            // Set error message for this vendor
            setAllocationErrors(errors => ({
                ...errors,
                [vendorId]: errorMsg
            }));

            // Prevent state update if error exists
            if (errorMsg) return;

            // Update totals for each vendor
            if (valueType == 'percentage') {

            }
            else {

            }
            // Set the updated allocations
            setVendorPackages(updatedPackages);
        }
    };
    const handleAllocationChangeItem = (itemId, vendorId, value) => {
        // Allow only numbers and up to 4 decimal places
        if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
            // Find the vendor package for this specific item and vendor
            const vendorPackage = vendorPackages.find(pkg => pkg.vendorId === vendorId && pkg.itemId === itemId);
            const finalPrice = parseFloat(vendorPackage?.finalPrice) || 0;

            // Update the specific vendor package for this item
            const updatedPackages = vendorPackages.map(pkg =>
                pkg.vendorId === vendorId && pkg.itemId === itemId
                    ? {
                        ...pkg,
                        allocation: value,
                        totalPrice: (valueType === 'percentage' ?
                            ((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) :
                            (parseFloat(value || 0)).toFixed(4))
                    }
                    : pkg
            );

            // Get the item details to check quantity for absolute allocation
            const currentItem = items.find(item => item.id === itemId);
            const itemQuantity = currentItem?.quantity || 0;

            // Calculate total allocation for this specific item across all vendors
            const itemVendorPackages = updatedPackages.filter(pkg => pkg.itemId === itemId);
            const newTotal = itemVendorPackages.reduce((sum, v) => {
                const val = parseFloat(v.allocation);
                return sum + (isNaN(val) ? 0 : val);
            }, 0);

            // Error checking based on valueType for this specific item
            let errorMsg = '';
            if (valueType === 'percentage' && newTotal > 100) {
                errorMsg = 'Total allocation for this item cannot exceed 100%';
            } else if (valueType === 'absolute' && newTotal > itemQuantity && itemQuantity != 0) {
                errorMsg = `Total allocation for this item cannot exceed ${itemQuantity}`;
            }

            // Set error message for this vendor (using a composite key for item-specific errors)
            const errorKey = `${vendorId}-${itemId}`;
            setAllocationErrors(errors => ({
                ...errors,
                [errorKey]: errorMsg
            }));

            // Prevent state update if error exists
            if (errorMsg) return;

            // Clear any existing error for this vendor-item combination
            setAllocationErrors(errors => {
                const newErrors = { ...errors };
                delete newErrors[errorKey];
                return newErrors;
            });

            // Update the vendor packages state
            setVendorPackages(updatedPackages);
        }
    }


    const handleNewSupplierPrice = (vendorId, value, itemId = null) => {
        // Allow only numbers and up to 4 decimal places
        if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
            const updatedPackages = vendorPackages.map(pkg => {
                // For item-wise view, match both vendorId and itemId
                if (basisOf === 'item' && itemId !== null) {
                    return (pkg.vendorId === vendorId && pkg.itemId === itemId)
                        ? { ...pkg, finalPrice: value } // keep as string
                        : pkg;
                }
                // For package-wise view, match only vendorId
                else {
                    return pkg.vendorId === vendorId
                        ? { ...pkg, finalPrice: value } // keep as string
                        : pkg;
                }
            });

            // Set the updated allocations
            setVendorPackages(updatedPackages);
        }
    }

    const handleBasisOfChange = async (event) => {
        
        setBasisOf(event.target.value);
        setVendorPackages([]); // reset old data
        setItems([]);
        if (event.target.value == 'package') {
            setValueType('percentage');
        }
        await getSOBDetails(event.target.value);
    };

    const handleValueTypeChange = (event) => {
        setValueType(event.target.value);
    };

    // Handle expand/collapse for items
    const handleItemExpand = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

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

    const toggleDrawer = (anchor, open) => {
        setOpenDrawer({ ...openDrawer, [anchor]: open });
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
        if (res && res?.data?.length > 0) {
            // Extract the emails from selectedSupplier
            const selectedSupplierEmails = selectedSupplier.map((item) => item.emailId);
            const newSupplierEmails = newSupplier.map((item) => item.email);
            // Filter the suppliers from the API response that are not in selectedSupplier
            const filteredSuppliers = res.data.filter((supplier) => {
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

        if (basisOf === 'package') {
            // For package-wise, add suppliers as before
            const updated = newSupplier.map((vendor, index) => ({
                vendorId: vendor.vendorId,
                companyName: vendor.companyName,
                initialPrice: 0, // to be filled later
                finalPrice: '',
                priceReduction: '',
                packageRank: `NA`,
                allocation: '',
                total: '',
                newVendor: true
            }));
            setVendorPackages(prev => [...prev, ...updated]);
        } else {
            // For item-wise, add suppliers to ALL items
            const updated = [];
            items.forEach(item => {
                newSupplier.forEach(vendor => {
                    updated.push({
                        vendorId: vendor.vendorId,
                        companyName: vendor.companyName,
                        initialPrice: 0, // to be filled later
                        finalPrice: '',
                        priceReduction: '',
                        packageRank: `NA`,
                        allocation: '',
                        totalPrice: '',
                        newVendor: true,
                        itemId: item.id // Associate with specific item
                    });
                });
            });
            setVendorPackages(prev => [...prev, ...updated]);
        }

        setLoading(false)
        toggleDrawer("addsupplier", false)
    };

    // Show permission denied if no read access (after all hooks)
    if (!eventDetailsCanRead) {
        return (
            <div className="p-3">
                <Alert severity="warning" icon={<HiOutlineInformationCircle />}>
                    You do not have permission to view Event Details. Required permission: Event Details - Read
                </Alert>
            </div>
        );
    }

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
                                disabled={!isDraftStage}
                            >
                                <MenuItem value="package">Package</MenuItem>
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
                                disabled={!isDraftStage || !eventDetailsCanEdit || basisOf == 'package' ? true : false}
                            >
                                <MenuItem value="absolute">Absolute</MenuItem>
                                <MenuItem value="percentage">Percentage</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="text"
                    size="small"
                    startIcon={<HiPlusSm />}
                    className="text-capitalize blue-text font-normal"
                    onClick={() => toggleDrawer("addsupplier", true)}
                    disabled={!isDraftStage || !eventDetailsCanCreate}
                >
                    Add More Suppliers
                </Button>
            </Box>
            {basisOf == 'item' &&

                (
                    <div className="table-responsive item-Table"
                        style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
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
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Item Code</th>
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Item / Service</th>
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Quantity</th>
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Target Price</th>
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>UOM</th>
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Plant</th>
                                    <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items && items.length > 0 ? items
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((item, index) => [
                                        <tr
                                            key={item.id}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                color: 'black',
                                            }}
                                        >
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {page * rowsPerPage + index + 1}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {item.itemCode || '-'}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {item.itemName}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {item.quantity} {item.uom && `(${item.uom})`}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {item.targetPrice || 0}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {item.uom}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                {item.plant}
                                            </td>
                                            <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleItemExpand(item.id)}
                                                    disabled={!eventDetailsCanRead}
                                                    style={{
                                                        transform: expandedItems[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s ease'
                                                    }}
                                                >
                                                    <ExpandMoreIcon />
                                                </IconButton>
                                            </td>
                                        </tr>,
                                        expandedItems[item.id] && (
                                            <tr key={`${item.id}-expanded`}>
                                                <td colSpan="8" style={{ padding: '0', backgroundColor: '#f8f9fa' }}>
                                                    <Box sx={{ backgroundColor: '#f8f9fa' }}>


                                                        {/* Vendor details table with full functionality */}
                                                        <div className="table-responsive"
                                                            style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '40vh' }}>
                                                            <Table
                                                                className="stripped"
                                                                style={{
                                                                    backgroundColor: '#f8f9fa',
                                                                    color: 'black',
                                                                    borderCollapse: 'collapse',
                                                                    width: '100%',
                                                                    tableLayout: 'fixed',
                                                                    minWidth: '1100px'
                                                                }}
                                                            >
                                                                <thead>
                                                                    <tr style={{ color: 'black' }}>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '60px', minWidth: '60px' }}></th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '250px', minWidth: '250px' }}>VENDOR DETAILS</th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Item Rank</th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Initial Price</th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Final Price</th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '130px', minWidth: '130px' }}>Price Reduction</th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Allocation</th>
                                                                        <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {vendorPackages && vendorPackages.filter(vp => vp.itemId === item.id).length > 0 ? (
                                                                        vendorPackages
                                                                            .filter(vp => vp.itemId === item.id)
                                                                            .map((vendorItem, vendorIndex) => (
                                                                                <tr
                                                                                    key={vendorItem.vendorId}
                                                                                    style={{
                                                                                        backgroundColor: '#f8f9fa',
                                                                                        color: 'black',
                                                                                    }}
                                                                                >
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '60px', minWidth: '60px' }}>
                                                                                        {vendorIndex + 1}
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '250px', minWidth: '250px', wordWrap: 'break-word' }}>
                                                                                        {vendorItem.companyName}
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                                                                        {vendorItem.packageRank}
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                                                                        {vendorItem.initialPrice !== 0 ? vendorItem.initialPrice : 'Not Quoted'}
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                                                                        {!vendorItem.newVendor ? (
                                                                                            vendorItem.finalPrice !== 0 ? (
                                                                                                vendorItem.finalPrice
                                                                                            ) : (
                                                                                                'Not Quoted'
                                                                                            )
                                                                                        ) : (
                                                                                            <TextField
                                                                                                InputLabelProps={{ shrink: true }}
                                                                                                fullWidth
                                                                                                variant="outlined"
                                                                                                size="small"
                                                                                                className="f14"
                                                                                                id={`finalPrice-${vendorItem.vendorId}-${item.id}`}
                                                                                                name="finalPrice"
                                                                                                type="number"
                                                                                                inputProps={{
                                                                                                    inputMode: 'decimal',
                                                                                                    pattern: '[0-9]*[.]?[0-9]*',
                                                                                                }}
                                                                                                value={
                                                                                                    vendorItem.finalPrice !== undefined && vendorItem.finalPrice !== null
                                                                                                        ? vendorItem.finalPrice
                                                                                                        : ''
                                                                                                }
                                                                                                onChange={(e) =>
                                                                                                    handleNewSupplierPrice(vendorItem.vendorId, e.target.value, item.id)
                                                                                                }
                                                                                                disabled={!isDraftStage || !eventDetailsCanEdit}
                                                                                            />
                                                                                        )}
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '130px', minWidth: '130px' }}>
                                                                                        {vendorItem.priceReduction || ''}
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                                                                        <TextField
                                                                                            InputLabelProps={{ shrink: true }}
                                                                                            fullWidth
                                                                                            variant="outlined"
                                                                                            size="small"
                                                                                            className="f14"
                                                                                            id={`allocation-${vendorItem.vendorId}-${item.id}`}
                                                                                            name="allocation"
                                                                                            type="number"
                                                                                            inputProps={{
                                                                                                inputMode: 'decimal',
                                                                                                pattern: '[0-9]*[.]?[0-9]*',
                                                                                            }}
                                                                                            value={
                                                                                                vendorItem.allocation !== undefined && vendorItem.allocation !== null
                                                                                                    ? vendorItem.allocation
                                                                                                    : ''
                                                                                            }
                                                                                            onChange={(e) =>
                                                                                                handleAllocationChangeItem(item.id, vendorItem.vendorId, e.target.value)
                                                                                            }
                                                                                            error={Boolean(allocationErrors[`${vendorItem.vendorId}-${item.id}`])}
                                                                                            helperText={allocationErrors[`${vendorItem.vendorId}-${item.id}`]}
                                                                                            disabled={!isDraftStage || !eventDetailsCanEdit}
                                                                                        />
                                                                                    </td>
                                                                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px', wordWrap: 'break-word' }}>
                                                                                        {vendorItem.totalPrice || ''}
                                                                                    </td>
                                                                                </tr>
                                                                            ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                                No vendor quotes available for this item
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </div>

                                                    </Box>
                                                </td>
                                            </tr>
                                        )
                                    ]).flat() : (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                            No items available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}
            {basisOf == 'package' && (
                <div
                    className="table-responsive item-Table"
                    style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}
                >
                    <Table
                        className="stripped"
                        style={{
                            backgroundColor: 'white',
                            color: 'black',
                            borderCollapse: 'collapse',
                            width: '100%',
                            tableLayout: 'fixed',
                            minWidth: '1100px'
                        }}
                    >
                        <thead>
                            <tr style={{ color: 'black' }}>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '60px', minWidth: '60px' }}>S.No</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '250px', minWidth: '250px' }}>VENDOR DETAILS</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Package Rank</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Initial Price</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Final Price</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '130px', minWidth: '130px' }}>Price Reduction</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Allocation</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px', minWidth: '120px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendorPackages
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((item, index) => (
                                    <tr
                                        key={item.vendorId}
                                        style={{
                                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#ffffff',
                                            color: 'black',
                                        }}
                                    >
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '60px', minWidth: '60px' }}>
                                            {page * rowsPerPage + index + 1}
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '250px', minWidth: '250px', wordWrap: 'break-word' }}>
                                            {item.companyName}
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                            {item.packageRank}
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                            {item.initialPrice !== 0 ? item.initialPrice : 'Not Quoted'}
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                            {!item.newVendor ? (
                                                item.finalPrice !== 0 ? (
                                                    item.finalPrice
                                                ) : (
                                                    'Not Quoted'
                                                )
                                            ) : (
                                                <TextField
                                                    InputLabelProps={{ shrink: true }}
                                                    fullWidth
                                                    variant="outlined"
                                                    size="small"
                                                    className="f14"
                                                    id={`finalPrice-${item.vendorId}`}
                                                    name="finalPrice"
                                                    type="number"
                                                    inputProps={{
                                                        inputMode: 'decimal',
                                                        pattern: '[0-9]*[.]?[0-9]*',
                                                    }}
                                                    value={
                                                        item.finalPrice !== undefined && item.finalPrice !== null
                                                            ? item.finalPrice
                                                            : ''
                                                    }
                                                    onChange={(e) =>
                                                        handleNewSupplierPrice(item.vendorId, e.target.value)
                                                    }
                                                    disabled={!isDraftStage || !eventDetailsCanEdit}
                                                />
                                            )}
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '130px', minWidth: '130px' }}>
                                            {item.priceReduction}
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
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
                                                    handleAllocationChangePackage(item.vendorId, e.target.value)
                                                }
                                                error={Boolean(allocationErrors[item.vendorId])}
                                                helperText={allocationErrors[item.vendorId]}
                                                disabled={!isDraftStage || !eventDetailsCanEdit}
                                            />
                                        </td>
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px', wordWrap: 'break-word' }}>
                                            {item.totalPrice}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </div>
            )}



            <React.Fragment key="top">
                {/* Drawer for Add New Supplier */}
                <Drawer
                    anchor="right" // Drawer position (right in this case)
                    open={openDrawer.addsupplier} // Open this drawer if state is true for 'addsupplier'
                    onClose={() => toggleDrawer("addsupplier", false)} // Close when clicked outside or on close button
                >
                    <div style={{ width: 600, display: "flex", flexDirection: "column", }}>
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
                                                        disabled={!isDraftStage || !eventDetailsCanEdit}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                InputLabelProps={{
                                                                    shrink: true,
                                                                }}
                                                                label="Category"
                                                            />
                                                        )}
                                                       	onOpen={() => {
																						// Call API when dropdown opens
																						if (categoryList.length === 0) {
																							getCategorylist();
																						}
																					}}
																		getOptionLabel={(option) =>
																						option.itemCategory ?? ""
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
                                                        disabled={!isDraftStage || !eventDetailsCanCreate}
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
                                                                    disabled={!isDraftStage || !eventDetailsCanCreate}
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
                                                                        disabled={!isDraftStage || !eventDetailsCanRemove}
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
                                            disabled={!isDraftStage || !eventDetailsCanEdit}
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

export default EventAllocationScreen;

