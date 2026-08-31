import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { actionTypes, useStateValue } from "../../../store";
import { Autocomplete, Box, Button, Table, IconButton, Checkbox, Stack, TableHead, TableBody, TableRow, TableCell, Pagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Alert } from '@mui/material';
import { checkUTC, buildQueryParams, VendorfilterOptions, getAuctionManageFind } from "../../../utils/common/utility";
import ERFQComparative from "../RequestForQuotation/ERFQComparative";
import { api, ApiClient } from '../../../Apiclient';
import { sumArray } from "../../../utils/common";
import Drawer from "@mui/material/Drawer";
import { HiOutlineX, HiPlusSm, HiOutlineUserAdd, HiPencilAlt, HiOutlineInformationCircle } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Badge } from "react-bootstrap";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import NFASOBItemWise from './NFASOBItemWise';

// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';

const NFASOBEventBoxAuction = forwardRef(({ props }, NFASOBAuctionRef) => {
    const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);

    // All React hooks must be called before any early returns
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const [basisOf, setBasisOf] = useState("package"); // Dropdown state for "Basis of"
    const [valueType, setValueType] = useState('percentage'); // State for value type dropdown
    const [vendorDetails, setVendorDetails] = useState([]);
    const [vendorList, setVendorList] = useState([]);
    const [vendorDetailsInitial, setVendorDetailsInitial] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [value, setValue] = useState('0')
    const [eventHeaderDetails, setEventHeaderDetails] = useState(null)
    const [approverShow, setApproverShow] = useState(true)
    const [accessLevel, setAccessLevel] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState([]);
    const [version, setVersion] = useState(props.Version)
    const [allocations, setAllocations] = useState({});
    const [vendorPackages, setVendorPackages] = useState([]);
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
        if (Array.isArray(vendorPackages) && vendorPackages.length > 0) {
            setBasisOf(vendorPackages[0]?.allocationOn ?? 'package');
            setValueType(vendorPackages[0]?.valueType ?? 'percentage');
        }
    }, [vendorPackages])

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

    useEffect(() => {
        if (Array.isArray(selectedSupplier) && selectedSupplier.length > 0) {
            const formatted = formatVendorData(selectedSupplier);
            setVendorList(formatted);
        }
    }, [selectedSupplier]);

    useEffect(() => {
        if (Array.isArray(vendorDetails) && vendorDetails.length > 0 &&
            Array.isArray(vendorList) && vendorList.length > 0) {

            const formatted = updateSupplierPackagePrices(vendorList, vendorDetails);
            setVendorPackages(formatted);
        }
    }, [vendorDetails, vendorList])

    const getSOBDetails = async () => {
        const params = {
            CustomerId: customerid,
            NFAId: props.eventId,
            Version: props.Version,
            NfaEventType: props.nfaEventType,
            NfaEventId: props.nfaEventId
        };
        const queryParams = buildQueryParams(params);
        const res = await apiClient.getres(`/api/NFASOBDetails/Find?${queryParams}`, atoken);
        if (res) {
            const result = res?.data?.result;
            // setLibrarylist(result);
            setVendorPackages(result);
            if (!Array.isArray(result) || result.length == 0) {
                pullAuctionParticipationDetails();
            }
        }
        else {
            return null;
        }
    };

    useEffect(() => {
        if (props.nfaEventType && props.nfaEventId) {
            getSOBDetails();
            setValue(props.nfaEventType);
            pullAuctionDetails();
            getCategorylist();
        }
    }, [props.nfaEventType, props.nfaEventId,])

    useEffect(() => {
        if (Array.isArray(selectedSupplier) && selectedSupplier.length > 0) {
            handleInitialData();
        }
        getTotalSupplier()
    }, [selectedSupplier])
    

    //Submit
    useImperativeHandle(NFASOBAuctionRef, () => ({
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
                allocation: parseFloat(vendor.allocation),
                newVendor: vendor.newVendor,
                nfaId: props.eventId,
                itemId: 0,
                customerId: customerid,
                version: props.Version,
                allocationOn: basisOf,
                valueType: valueType,
                totalPrice: parseFloat(vendor.totalPrice || 0),
                remarks: vendor.remarks || ''
            }));
            const res = await apiClient.postres(`/api/NFASOBDetails/${props.eventId}/Add`, data, atoken);
            if (res) {
                toast.success("Allocation Saved Successfully", {
                    toastId: "QS"
                })
                return true
            }
            else {
                return false
            }
        }
    }));

    // Extract permission props
    const { permissionManager, canRead, canEdit, canCreate, canRemove } = props;

    // Permission checks for Event Details
    const eventDetailsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? false;
    const eventDetailsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? false;
    const eventDetailsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? false;
    const eventDetailsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? false;

    



    // Format and rank data
    const formatVendorData = (data) => {
        if (!data || !Array.isArray(data)) return [];

        return data?.map((vendor, index) => ({
            vendorId: vendor.vendorID,
            companyName: vendor.vendorName || '',
            initialPrice: '',           // not present in data
            finalPrice: '',             // not present in data
            priceReduction: '',                // not present in data
            packageRank: '',             // ranking just based on order for now
            allocation: 0,
            totalPrice: '',
            newVendor: false
        }));
    };

    const updateSupplierPackagePrices = (vendorList, quoteData) => {
        
        if (!Array.isArray(vendorList) || !Array.isArray(quoteData)) return vendorList;

        // Step 1: Sum initial & quoted prices for each vendor
        const priceMap = {};

        quoteData.forEach(item => {
            const { vendorId, initialPrice = 0, quotedPrice = 0 } = item;

            if (!priceMap[vendorId]) {
                priceMap[vendorId] = {
                    initialSum: 0,
                    quotedSum: 0
                };
            }

            priceMap[vendorId].initialSum += initialPrice || 0;
            priceMap[vendorId].quotedSum += quotedPrice || 0;
        });

        // Step 2: Update vendors with summed prices, only if newVendor is false
        const updatedVendors = vendorList.map(pkg => {
            if (pkg.newVendor === true) {
                // Skip updating this vendor
                return pkg;
            }

            const prices = priceMap[pkg.vendorId];
            const initial = prices ? prices.initialSum : 0;
            const final = prices ? prices.quotedSum : 0;
            const priceReduction = initial && final ? initial - final : '';

            return {
                ...pkg,
                initialPrice: initial,
                finalPrice: final,
                packageRank: final > 0 ? '' : 'NA', // temporary empty rank, will assign below
                priceReduction: priceReduction
            };
        });

        // Step 3: Sort vendors with valid quoted prices and assign ranks (excluding newVendor: true)
        const vendorsWithQuotes = updatedVendors
            .filter(v => v.finalPrice > 0 && v.newVendor !== true)
            .sort((a, b) => a.finalPrice - b.finalPrice);

        vendorsWithQuotes.forEach((v, index) => {
            v.packageRank = `L${index + 1}`;
        });

        // Step 4: Return the full updated list with proper rank
        // return updatedVendors;
        // Step 4: Merge sorted vendorsWithQuotes with remaining vendors
        const rankedVendorIds = new Set(vendorsWithQuotes.map(v => v.vendorId));

        const remainingVendors = updatedVendors.filter(v => !rankedVendorIds.has(v.vendorId));

        return [...vendorsWithQuotes, ...remainingVendors];
    };

    // useEffect(() => {
    //     if (Array.isArray(vendorDetails) && vendorDetails.length > 0 && 
    //         Array.isArray(vendorPackages) && vendorPackages.length > 0) 
    //     {
    //         const formatted = updateSupplierPackagePrices(vendorPackages, vendorDetails);
    //         setVendorPackages(formatted);
    //     }
    // },[vendorDetails,vendorPackages])

    const handleAllocationChange = (vendorId, value) => {
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

    const handleNewSupplierPrice = (vendorId, value) => {
        // Allow only numbers and up to 4 decimal places
        if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
            const updatedPackages = vendorPackages?.map(pkg =>
                pkg.vendorId === vendorId
                    ? { ...pkg, finalPrice: value } // keep as string
                    : pkg
            );

            // Set the updated allocations
            setVendorPackages(updatedPackages);
        }
    }

    const handleRemarksChange = (vendorId, value) => {
        const updatedPackages = vendorPackages?.map(pkg =>
            pkg.vendorId === vendorId ? { ...pkg, remarks: value } : pkg
        );
        setVendorPackages(updatedPackages);
    }

    const handleBasisOfChange = (event) => {
        setBasisOf(event.target.value);
        if (event.target.value == 'package') {
            setValueType('percentage');
        }
        else{
            // Item wise 
        }
    };

    const handleValueTypeChange = (event) => {
        setValueType(event.target.value);
    };


    const pullAuctionDetails = async () => {
        var data = {
            Id: props.nfaEventId
        };
        getAuctionManageFind(data, atoken).then((res) => {
            if (res && res?.length > 0) {

                setEventHeaderDetails(res)
                setSelectedSupplier(res[0]?.bidVendorInvited);
                setItemsList(res[0]?.bidParamater);

                const total = res[0]?.bidParamater.reduce((sum, param) => {
                    return sum + (Number(param.quantity) || 0);
                }, 0);
                setTotalQuantity(total);
            }
        });

    };

    const pullAuctionParticipationDetails = async () => {

        const obj = {
            BidId: props.nfaEventId,
            PageNumber: 1,
            PageSize: 10
        };
        const queryParams = buildQueryParams(obj);

        const res = await apiClient.get(
            `api/AuctionParticipation/AllVendorParticipationDetails?${queryParams}`,
            atoken
        );
        if (res) {
            setVendorDetails(res.allVendorParticipationDetail);
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
        const res = await apiClient.getres(
            `/api/managevendors/${customerid}/categories`,
            atoken
        );
        if (res) {
            setCategoryList(res?.data);
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
            const selectedSupplierEmails = selectedSupplier?.map((item) => item.emailId);
            const newSupplierEmails = newSupplier?.map((item) => item.email);
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
            const selectedSupplierEmails = selectedSupplier?.map((item) => item.emailId);
            const newSupplierEmails = newSupplier?.map((item) => item.email);
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
        const updated = newSupplier?.map((vendor, index) => ({
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

    const handleInitialData = () => {
        const updatedVendorPackages = vendorPackages.map(vendorPackage => {
            return {
                ...vendorPackage,
                priceReduction: vendorPackage.initialPrice && vendorPackage.finalPrice ? vendorPackage.initialPrice - vendorPackage.finalPrice : '',
            };
        });
        setVendorPackages(updatedVendorPackages);
    }

    // Early return if no read permissions
    if (!eventDetailsCanRead) {
        return (
            <div className="p-3">
                <Alert severity="warning" icon={<HiOutlineInformationCircle />}>
                    You don't have permission to view Event Details.
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
                                disabled={!eventDetailsCanEdit}
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
                                disabled={!eventDetailsCanEdit || basisOf == 'package' ? true : false}
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
                    disabled={!eventDetailsCanCreate}
                >
                    Add More Suppliers
                </Button>
            </Box>
            {basisOf == 'item' ? (
                <NFASOBItemWise props={{
                    permissionManager: permissionManager,
                    vendorPackages: vendorPackages,
                }} />
            ) : (
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
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400 }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendorPackages.map((item, index) => (
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
                                                disabled={!eventDetailsCanEdit}
                                            />
                                        )}
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
                                            error={Boolean(allocationErrors[item.vendorId])}
                                            helperText={allocationErrors[item.vendorId]}
                                            disabled={!eventDetailsCanEdit}
                                        />
                                    </td>
                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6' }}>{item.totalPrice}</td>
                                    <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '120px', minWidth: '120px' }}>
                                        <TextField
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            className="f14"
                                            id={`remarks-${item.vendorId}`}
                                            name="remarks"
                                            multiline
                                            rows={3}
                                            value={
                                                item.remarks !== undefined && item.remarks !== null
                                                    ? item.remarks
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                handleRemarksChange(item.vendorId, e.target.value)
                                            }
                                            disabled={!eventDetailsCanEdit}
                                        />
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
                        <Box className="bgheaderNotificationCards">
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
                                                        disabled={!eventDetailsCanEdit}
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
                                                        disabled={!eventDetailsCanCreate}
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
                                                ?.slice((pageTS - 1) * pageCount, pageTS * pageCount)
                                                ?.map((x, i) => (
                                                    <div
                                                        className="d-flex border-bottom align-items-center py-2 px-2"
                                                        key={i}
                                                    >
                                                        {/* Add Supplier Button */}
                                                        <IconButton
                                                            size="small"
                                                            className="me-3"
                                                            color="primary"
                                                            onClick={() => handleCheckRemainingSupplier(x)}
                                                            disabled={!eventDetailsCanCreate}
                                                        >
                                                            <HiOutlineUserAdd />
                                                        </IconButton>

                                                        {/* Supplier Info */}
                                                        <div className="flex-grow-1 text-truncate">
                                                            <div className="content-text f12 text-dark-blue text-truncate">
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
                            {newSupplier && newSupplier.length > 0 && (
                                <div className="col-12 col-md-12 col-lg-6 border-start">
                                    <div className="bg-white rounded shadow-sm">
                                        {/* Header */}
                                        <div className="d-flex align-items-center justify-content-between pt-2 pb-2 px-2">
                                            <div className="d-flex align-items-center">
                                                <span className="content-text f12 me-2">
                                                    New Suppliers
                                                </span>
                                                <div className="supplierCount">{newSupplier?.length}</div>
                                            </div>
                                            <div></div>
                                        </div>
                                        <hr className="m-0" />

                                        {/* Supplier List */}
                                        <div className="row m-0">
                                            <div className="col-12">
                                                {newSupplier
                                                    .slice((pageSS - 1) * pageCount, pageSS * pageCount)
                                                    ?.map((x, i) => (
                                                        <div
                                                            className="d-flex border-bottom align-items-center py-2 px-2"
                                                            key={i}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                className="me-3"
                                                                color="error"
                                                                onClick={() => handleClearRemainingSupplier(x)}
                                                                disabled={!eventDetailsCanRemove}
                                                            >
                                                                <HiOutlineX />
                                                            </IconButton>

                                                            <div className="flex-grow-1 text-truncate">
                                                                <div className="content-text f12 text-dark-blue text-truncate">
                                                                    {`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    <div className="pagination_wrapper mb-3 mt-3">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 d-none d-md-block"></div>
                                            <div>
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
                                </div>
                            )}


                        </div>

                        {/* Update Button */}
                        {newSupplier && newSupplier.length > 0 && (
                            <div className="row mt-3 mb-3">
                                <div className="col-12">
                                    <div className="d-flex justify-content-center">
                                        <LoadingButton
                                            variant="contained"
                                            onClick={handleSaveNewSupplier}
                                            loading={loading}
                                            disabled={!eventDetailsCanCreate}
                                            className="px-4"
                                        >
                                            Update Suppliers
                                        </LoadingButton>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Drawer>
            </React.Fragment>
        </div>
    );
});

export default NFASOBEventBoxAuction;
