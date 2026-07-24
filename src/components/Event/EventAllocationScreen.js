import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { actionTypes, useStateValue } from "../../store";
import { Autocomplete, Box, Button, Table, IconButton, Checkbox, Stack, TableHead, TableBody, TableRow, TableCell, Pagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Alert } from '@mui/material';
import { PEPagination } from '../RFQ/PEPagination';
import { PETableSimple } from '../RFQ/PETable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { checkUTC, buildQueryParams, VendorfilterOptions } from "../../utils/common/utility";
import { api, ApiClient } from '../../Apiclient';
import CommonBottomDrawer from "../CommonBottomDrawer";
import { HiOutlineX, HiPlusSm, HiOutlineUserAdd, HiPencilAlt, HiOutlineInformationCircle } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
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

    const eventDetailsCanRead = true;
    const eventDetailsCanEdit = true;
    const eventDetailsCanCreate = true;
    const eventDetailsCanRemove = true;


    // Check if current stage is Draft - only allow edits in Draft stage
    const isDraftStage = props.currentStage?.trim() == "Allocation";

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const [basisOf, setBasisOf] = useState("package"); // Dropdown state for "Basis of"
    const [valueType, setValueType] = useState("percentage"); // State for value type dropdown
    const [page, setPage] = useState(1);
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
    const [supplierSearchText, setSupplierSearchText] = useState('')

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

    ;

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
            const updated = newSupplier.map((vendor) => ({
                vendorId: vendor.vendorId ?? vendor.contactId,
                companyName: vendor.companyName,
                initialPrice: 0,
                finalPrice: '',
                priceReduction: '',
                packageRank: 'NA',
                allocation: '',
                totalPrice: '',
                newVendor: true
            }));
            setVendorPackages(prev => [...prev, ...updated]);
        } else {
            const updated = [];
            items.forEach(item => {
                newSupplier.forEach(vendor => {
                    updated.push({
                        vendorId: vendor.vendorId ?? vendor.contactId,
                        companyName: vendor.companyName,
                        initialPrice: 0,
                        finalPrice: '',
                        priceReduction: '',
                        packageRank: 'NA',
                        allocation: '',
                        totalPrice: '',
                        newVendor: true,
                        itemId: item.id
                    });
                });
            });
            setVendorPackages(prev => [...prev, ...updated]);
        }

        setNewSupplier([]);
        setSupplierSearchText('');
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

    const TH = { borderBottom: '1px solid #e5e7eb', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#6b7280', background: '#f9fafb', whiteSpace: 'nowrap' };
    const TD = { padding: '8px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 13, color: '#1f2937' };
    const totalRows = basisOf === 'item' ? items.length : vendorPackages.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 20px' }}>
            {/* ── Controls row ── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexShrink: 0, marginBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Basis of</label>
                    <Select
                        autoWidth
                        value={basisOf}
                        onChange={handleBasisOfChange}
                        size="small"
                        displayEmpty
                        disabled={!isDraftStage}
                        sx={{ width: 220, fontSize: 13 }}
                        MenuProps={{ PaperProps: { sx: { width: '220px !important', minWidth: '220px !important' } } }}
                    >
                        <MenuItem value="package">Package</MenuItem>
                        <MenuItem value="item">Item</MenuItem>
                    </Select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>Value Type</label>
                    <Select
                        value={valueType}
                        onChange={handleValueTypeChange}
                        size="small"
                        displayEmpty
                        disabled={!isDraftStage || !eventDetailsCanEdit || basisOf === 'package'}
                        sx={{ width: 220, fontSize: 13 }}
                        MenuProps={{ PaperProps: { sx: { width: '220px !important', minWidth: '220px !important' } } }}                    >
                        <MenuItem value="absolute">Absolute</MenuItem>
                        <MenuItem value="percentage">Percentage</MenuItem>
                    </Select>
                </div>

                <div style={{ flex: 1 }} />

                <button
                    className="pe-btn pe-btn--secondary"
                    onClick={() => toggleDrawer("addsupplier", true)}
                    disabled={!isDraftStage || !eventDetailsCanCreate}
                >
                    <HiPlusSm style={{ marginRight: 4, fontSize: 15 }} />
                    Add More Suppliers
                </button>
            </div>
            {/* ── Table area (fixed height, internal scroll) ── */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                {!basisOf && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 13 }}>
                        Select a "Basis of" option to view allocation data
                    </div>
                )}

                {basisOf === 'item' && (
                    <PETableSimple
                        rows={items.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
                        getRowKey={(row) => row.id}
                        wrapperStyle={{ border: 'none', borderRadius: 0 }}
                        columns={[
                            { key: 'sno', label: 'S.No', width: 52, renderCell: (_, row, i) => (page - 1) * rowsPerPage + i + 1 },
                            { key: 'itemCode', label: 'Item Code', renderCell: (v) => v || '-' },
                            { key: 'itemName', label: 'Item / Service' },
                            { key: 'quantity', label: 'Quantity', renderCell: (v, row) => `${v}${row.uom ? ` (${row.uom})` : ''}` },
                            { key: 'targetPrice', label: 'Target Price', renderCell: (v) => v || 0 },
                            { key: 'uom', label: 'UOM' },
                            { key: 'plant', label: 'Plant' },
                        ]}
                        getExpandContent={(item) => (
                            <PETableSimple
                                rows={vendorPackages.filter(vp => vp.itemId === item.id)}
                                getRowKey={(row) => row.vendorId}
                                wrapperStyle={{ border: 'none', borderRadius: 0 }}
                                columns={[
                                    { key: 'sno', label: '#', width: 48, renderCell: (_, row, i) => i + 1 },
                                    { key: 'companyName', label: 'Vendor Details', whiteSpace: 'normal' },
                                    { key: 'packageRank', label: 'Item Rank', width: 110 },
                                    { key: 'initialPrice', label: 'Initial Price', width: 120, renderCell: (v) => v !== 0 ? v : 'Not Quoted' },
                                    {
                                        key: 'finalPrice', label: 'Final Price', width: 130,
                                        renderCell: (v, row) => !row.newVendor ? (v !== 0 ? v : 'Not Quoted') : (
                                            <TextField size="small" variant="outlined" fullWidth type="number"
                                                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
                                                value={v ?? ''} onChange={(e) => handleNewSupplierPrice(row.vendorId, e.target.value, item.id)}
                                                disabled={!isDraftStage || !eventDetailsCanEdit} />
                                        ),
                                    },
                                    { key: 'priceReduction', label: 'Price Reduction', width: 120 },
                                    {
                                        key: 'allocation', label: 'Allocation', width: 130,
                                        renderCell: (v, row) => (
                                            <TextField size="small" variant="outlined" fullWidth type="number"
                                                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
                                                value={v ?? ''} onChange={(e) => handleAllocationChangeItem(item.id, row.vendorId, e.target.value)}
                                                error={Boolean(allocationErrors[`${row.vendorId}-${item.id}`])}
                                                helperText={allocationErrors[`${row.vendorId}-${item.id}`]}
                                                disabled={!isDraftStage || !eventDetailsCanEdit} />
                                        ),
                                    },
                                    { key: 'totalPrice', label: 'Total', width: 110 },
                                ]}
                            />
                        )}
                    />
                )}

                {basisOf === 'package' && (
                    <PETableSimple
                        rows={vendorPackages.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
                        getRowKey={(row) => row.vendorId}
                        wrapperStyle={{ border: 'none', borderRadius: 0 }}
                        columns={[
                            { key: 'sno', label: 'S.No', width: 52, renderCell: (_, row, i) => (page - 1) * rowsPerPage + i + 1 },
                            { key: 'companyName', label: 'Vendor Details', whiteSpace: 'normal' },
                            { key: 'packageRank', label: 'Package Rank', width: 110 },
                            { key: 'initialPrice', label: 'Initial Price', width: 120, renderCell: (v) => v !== 0 ? v : 'Not Quoted' },
                            {
                                key: 'finalPrice', label: 'Final Price', width: 130,
                                renderCell: (v, row) => !row.newVendor ? (v !== 0 ? v : 'Not Quoted') : (
                                    <TextField size="small" variant="outlined" fullWidth type="number"
                                        inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
                                        value={v ?? ''} onChange={(e) => handleNewSupplierPrice(row.vendorId, e.target.value)}
                                        disabled={!isDraftStage || !eventDetailsCanEdit} />
                                ),
                            },
                            { key: 'priceReduction', label: 'Price Reduction', width: 120 },
                            {
                                key: 'allocation', label: 'Allocation', width: 130,
                                renderCell: (v, row) => (
                                    <TextField size="small" variant="outlined" fullWidth type="number"
                                        inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
                                        value={v ?? ''} onChange={(e) => handleAllocationChangePackage(row.vendorId, e.target.value)}
                                        error={Boolean(allocationErrors[row.vendorId])}
                                        helperText={allocationErrors[row.vendorId]}
                                        disabled={!isDraftStage || !eventDetailsCanEdit} />
                                ),
                            },
                            { key: 'totalPrice', label: 'Total', width: 110 },
                        ]}
                    />
                )}

                {/* ── Pagination fixed at bottom ── */}
                {basisOf && (
                    <PEPagination
                        page={page}
                        pageSize={rowsPerPage}
                        totalRows={totalRows}
                        onPageChange={setPage}
                        onPageSizeChange={(n) => { setRowsPerPage(n); setPage(1); }}
                    />
                )}
            </div>

            <React.Fragment key="top">
                {/* Drawer for Add New Supplier */}
                <CommonBottomDrawer
                    open={openDrawer.addsupplier}
                    onClose={() => { toggleDrawer("addsupplier", false); setSupplierSearchText(''); }}
                    title="Add New Supplier"
                    bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px', gap: '12px' }}
                    actions={<>
                        <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted" onClick={() => { toggleDrawer("addsupplier", false); setSupplierSearchText(''); }}>Close</button>
                        <button type="button" className="pe-btn pe-btn--primary" onClick={handleSaveNewSupplier}>Update</button>
                    </>}
                >
                    {/* Filters row */}
                    <div className="rfq-v2-drawer-form" style={{ flexShrink: 0 }}>
                        <div className="rfq-v2-drawer-grid">
                            <div className="rfq-v2-drawer-field">
                                <span className="rfq-v2-drawer-label">Category</span>
                                <Autocomplete
                                    size="small"
                                    options={categoryList ?? []}
                                    fullWidth
                                    renderInput={(params) => (
                                        <TextField {...params} placeholder="Select category" />
                                    )}
                                    getOptionLabel={(option) => option.itemCategory ?? ""}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    value={selectedCategory}
                                    onChange={(e, newvalue) => {
                                        setSelectedCategory(newvalue);
                                        setSupplierSearchText('');
                                        handleSupplierWithCategory(newvalue);
                                    }}
                                />
                            </div>
                            <div className="rfq-v2-drawer-field">
                                <span className="rfq-v2-drawer-label">Search Supplier</span>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Search by name or email..."
                                    value={supplierSearchText}
                                    onChange={(e) => { setSupplierSearchText(e.target.value); setPageTS(1); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Two-column supplier lists */}
                    {(() => {
                        const filteredRemaining = (remainingSupplier ?? []).filter(x => {
                            if (!supplierSearchText) return true;
                            const q = supplierSearchText.toLowerCase();
                            return (
                                (x?.contactPerson ?? '').toLowerCase().includes(q) ||
                                (x?.email ?? '').toLowerCase().includes(q) ||
                                (x?.companyName ?? '').toLowerCase().includes(q)
                            );
                        });
                        const pagedRemaining = filteredRemaining.slice((pageTS - 1) * pageCount, pageTS * pageCount);
                        const pagedNew = (newSupplier ?? []).slice((pageSS - 1) * pageCount, pageSS * pageCount);

                        return (
                            <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
                                {/* Remaining Suppliers */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Remaining Suppliers</span>
                                        <span style={{ background: '#2A68D3', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{filteredRemaining.length}</span>
                                        {selectedCategory && (
                                            <span style={{ background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '11px', fontWeight: 600, padding: '1px 8px' }}>{selectedCategory?.itemCategory}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                                        {pagedRemaining.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No suppliers found</div>
                                        ) : pagedRemaining.map((x, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
                                                <button type="button" className="pe-icon-btn pe-icon-btn--add" style={{ flexShrink: 0 }} onClick={() => handleCheckRemainingSupplier(x)} disabled={!isDraftStage || !eventDetailsCanCreate}>
                                                    <HiOutlineUserAdd />
                                                </button>
                                                <div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    <span style={{ fontWeight: 500 }}>{x?.contactPerson}</span>
                                                    {' | '}{x?.email}
                                                    {' | '}<span style={{ color: '#6b7280' }}>{x?.companyName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <PEPagination page={pageTS} pageSize={pageCount} totalRows={filteredRemaining.length} onPageChange={setPageTS} onPageSizeChange={(n) => { setPageCount(n); setPageTS(1); }} />
                                </div>

                                {/* New Suppliers */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>New Suppliers</span>
                                        <span style={{ background: '#2A68D3', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{newSupplier?.length ?? 0}</span>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                                        {pagedNew.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No suppliers added yet</div>
                                        ) : pagedNew.map((x, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
                                                <button type="button" className="pe-icon-btn pe-icon-btn--delete" style={{ flexShrink: 0 }} onClick={() => handleClearRemainingSupplier(x)} disabled={!isDraftStage || !eventDetailsCanRemove}>
                                                    <HiOutlineX />
                                                </button>
                                                <div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    <span style={{ fontWeight: 500 }}>{x?.contactPerson}</span>
                                                    {' | '}{x?.email}
                                                    {' | '}<span style={{ color: '#6b7280' }}>{x?.companyName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <PEPagination page={pageSS} pageSize={pageCount} totalRows={newSupplier?.length ?? 0} onPageChange={setPageSS} onPageSizeChange={(n) => { setPageCount(n); setPageSS(1); }} />
                                </div>
                            </div>
                        );
                    })()}
                </CommonBottomDrawer>
            </React.Fragment>
        </div>
    );
});

export default EventAllocationScreen;

