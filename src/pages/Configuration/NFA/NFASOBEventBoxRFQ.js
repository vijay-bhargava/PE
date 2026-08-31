import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useStateValue } from "../../../store";
import { Autocomplete, Box, Button, Table, IconButton, Checkbox, Stack, Pagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Alert, InputAdornment, Typography, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { UploadOutlined } from '@mui/icons-material';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { buildQueryParams, VendorfilterOptions, getCurrency } from "../../../utils/common/utility";
import { ApiClient } from '../../../Apiclient';
import Drawer from "@mui/material/Drawer";
import { DecimalValueRegEx, getApiErrorMessage } from '../../../utils/common';
import { HiOutlineX, HiPlusSm, HiOutlineUserAdd, HiPencilAlt, HiOutlineInformationCircle, HiOutlineTrash } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Badge, Modal } from "react-bootstrap";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
// Permission Management Imports
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { UOMMasterList } from '../../../utils/commerciallibrary';
import { FindItemCategory, FindItemType, FindPlantStorage } from '../../../utils/purchaseRequest';
import AddEditItemType from '../../../utils/common/AddEditITemType';
import AddEditCurrency from '../../../utils/common/AddEditCurrency';


const NFASOBEventBoxRFQ = forwardRef(({ props }, NFASOBRFQRef) => {
    const [{ atoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);

    // Extract permission props
    const { permissionManager, canRead, canEdit, canCreate, canRemove } = props;

    // Permission checks for Event Details
    const eventDetailsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? true;
    const eventDetailsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? true;
    const eventDetailsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? true;
    const eventDetailsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? true;

    // Check if current stage is Draft - only allow edits in Draft stage
    const isDraftStage = props.currentStage?.trim() === "Draft";

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const [basisOf, setBasisOf] = useState(""); // Dropdown state for "Basis of"
    const [valueType, setValueType] = useState(""); // State for value type dropdown
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [value, setValue] = useState('0')
    const [categoryList, setCategoryList] = useState([]);
    const [itemTypeList, setItemTypeList] = useState([]);
    const [ItemTypeModal, setItemTypeModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState([]);
    const [vendorPackages, setVendorPackages] = useState([]);
    // console.log('VP',vendorPackages);
    const [items, setItems] = useState([]);
    const [allocationErrors, setAllocationErrors] = useState({});
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [budgetStatus, setBudgetStatus] = useState("");
    const [saving, setSaving] = useState(0);
    const [openDrawer, setOpenDrawer] = useState({
        addsupplier: false,
        additem: false
    });
    const [newItemData, setNewItemData] = useState({
        itemName: '',
        itemCode: '',
        itemCategory: '',
        itemType: '',
        itemTypeId: '',
        itemDesc: '',
        uom: '',
        quantity: '',
        targetPrice: 0,
        plant: '',
        deliveryDate: '',
        remarks: '',
        itemImage: null,
        itemFile: null,
        version: props.nfaEventVersion || 0,
        nfaId: props.nfaEventId || 0
    });
    const [itemCategoryList, setItemCategoryList] = useState([]);
    const [uomList, setUomList] = useState([]);
    const [plantList, setPlantList] = useState([]);
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
    const [currencyList, setCurrencyList] = useState([]);
    const [budget, setBudget] = useState(props?.nfaBudget);
    const [totalAmount, setTotalAmount] = useState(props?.nfaAmount);
    const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);
    const [currency, setCurrency] = useState(props?.nfaCurrency);

    const CloseCurrencyModal = () => {
        setOpenCurrencyModal(false);
    };
    const handleCurrencyList = () => {
        pullgetCurrency();
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

    //in order to handle event from parent component
    useImperativeHandle(NFASOBRFQRef, () => ({
        saveSOBDetails: async () => {
            try {
                const validItemIds = new Set(items.map(i => i.parentId ?? i.id));
                const data = vendorPackages
                    .filter(vendor => basisOf !== "item" || validItemIds.has(vendor.itemId))
                    .map((vendor) => ({
                        id: 0,
                        vendorId: vendor.vendorId,
                        companyName: vendor.companyName,
                        initialPrice: vendor.initialPrice ?? 0,
                        finalPrice: vendor.finalPrice !== "" ? parseFloat(vendor.finalPrice) : 0,
                        nfaEventId: props.nfaEventId,
                        nfaEventType: props.nfaEventType,
                        packageRank: vendor.packageRank,
                        allocation: parseFloat(vendor.allocation || 0),
                        newVendor: vendor.newVendor || false,
                        nfaId: props.eventId,
                        itemId: basisOf === "item" ? (vendor.itemId || 0) : 0,
                        customerId: customerid,
                        version: props.Version,
                        allocationOn: basisOf,
                        valueType: valueType,
                        totalPrice: parseFloat(vendor.totalPrice || 0),
                        remarks: vendor.remarks || ""
                    }));

                if (basisOf === "item") {
                    const itemAllocationMap = {};
                    data.forEach((item) => {
                        if (!itemAllocationMap[item.itemId]) {
                            itemAllocationMap[item.itemId] = {
                                itemName: items.find(i => i.itemId === item.itemId)?.itemName || `Item ${item.itemId}`,
                                totalAllocation: 0
                            };
                        }
                        itemAllocationMap[item.itemId].totalAllocation += item.allocation;
                    });
                    const invalidItems = Object.values(itemAllocationMap)
                        .filter(item => item.totalAllocation <= 0)
                        .map(item => item.itemName);
                    if (invalidItems.length > 0) {
                        toast.error(`Please allocate at least one supplier for all the item(s)`, { toastId: "allocation_validation_error" });
                        return false;
                    }
                }

                const res = await apiClient.postres(`/api/NFASOBDetails/${props.eventId}/Add?EventType=NFA`, data, atoken);
                if (res) {
                    toast.success("Allocation Saved Successfully", { toastId: "QS" });
                    return true;
                }
                return false;
            } catch (error) {
                toast.error(getApiErrorMessage(error), { toastId: "sob_save_error" });
                return false;
            }
        }
    }));

    // Fetch existing SOB details if any
    const getSOBDetails = async (data) => {
        try {
            const params = {
                NFAId: props.eventId,
                EventId: props.nfaEventId,
                EventType: props.nfaEventType || '0',
                BasisOf: data ? data : "",
                Version: props.eventId != null && props.eventId != 0 ? props.Version : props.nfaEventVersion ?? 1,
            };
            const queryParams = buildQueryParams(params);
            const res = await apiClient.getres(`/api/NFAManage/GetItemWiseData?${queryParams}`, atoken);
            if (res) {
                setItems(res?.data?.items || []);
                setVendorPackages(res?.data?.packageWiseData || []);
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error), { toastId: "sob_fetch_error" });
        }
    };

    const pullgetCurrency = useCallback(() => {
        const data = {
            isActive: true,
        };
        getCurrency(data, atoken).then((res) => {
            setCurrencyList(res);
        });
    }, [atoken]);

    useEffect(() => {
        getTotalSupplier();
        getCategorylist();
    }, [])

    useEffect(() => {
        if (currencyList.length === 0) {
            pullgetCurrency();
        }
    }, [atoken, customerid]);

    useEffect(() => {
        getSOBDetails();
        if (props.nfaEventType && props.nfaEventId && props.nfaEventVersion) {
            setItems([]);
            setVendorPackages([]);
            setValue(props.nfaEventType);
            // pullRFQHeaderDetails();
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
            handleTotalAmount();
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
            const currentItem = items.find(item => item.id === itemId);
            const itemQuantity = currentItem?.quantity || 0;
            const finalPrice = parseFloat(vendorPackage?.finalPrice) * parseFloat(itemQuantity) || 0;
            // Get the item details to check quantity for absolute allocation
            // Update the specific vendor package for this item
            const updatedPackages = vendorPackages.map(pkg =>
                pkg.vendorId === vendorId && pkg.itemId === itemId
                    ? {
                        ...pkg,
                        allocation: value,
                        totalPrice: (valueType === 'percentage' ?
                            ((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) :
                            ((finalPrice / itemQuantity) * parseFloat(value || 0)).toFixed(4))
                    }
                    : pkg
            );



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

    const handleTotalAmount = () => {
        const total = vendorPackages.map(pkg => parseFloat(pkg.totalPrice) || 0).reduce((sum, val) => sum + val, 0);
        setTotalAmount(total);
        if (props?.amount != total) {
            props?.updateAmount(total);
        }
    }

    const handleNewSupplierPrice = (vendorId, value, itemId = null) => {
        if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
            const updatedPackages = vendorPackages.map(pkg => {
                const isMatched =
                    basisOf === 'item' && itemId !== null
                        ? (pkg.vendorId === vendorId && pkg.itemId === itemId)
                        : (pkg.vendorId === vendorId);

                if (!isMatched) return pkg;

                const currentItem = items.find(item => (item.parentId ?? item.id) === pkg.itemId);
                const itemQuantity = currentItem?.quantity || 0;
                const finalPrice = (parseFloat(value) || 0) * itemQuantity;
                const allocation = parseFloat(pkg.allocation) || 0;

                return {
                    ...pkg,
                    finalPrice: value,
                    totalPrice:
                        value === '' || allocation === 0
                            ? ''
                            : (
                                valueType === 'percentage'
                                    ? ((allocation / 100) * finalPrice)
                                    : ((finalPrice / itemQuantity) * allocation)
                            ).toFixed(4)
                };
            });
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
        else {
            setValueType('absolute');
        }
        await getSOBDetails(event.target.value);
    };

    const handleValueTypeChange = (event) => {
        setValueType(event.target.value);

        // Reset all allocations to 0 when value type changes
        setVendorPackages(prevPackages => {
            return prevPackages.map(vendor => ({
                ...vendor,
                valueType: event.target.value,
                allocation: 0,
                totalPrice: 0
            }));
        });

        // Clear any existing allocation errors
        setAllocationErrors({});
    };

    // Handle expand/collapse for items
    const handleItemExpand = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

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

    const PullItemType = () => {

        var data = {
            CustomerId: customerid,
            IsActive: true
        };
        FindItemType(data, atoken).then((resp) => {
            // Ensure we only keep active item types
            const list = Array.isArray(resp) ? resp.filter(r => r?.isActive) : [];
            setItemTypeList(list);
        });
    };
    
    const CloseItemTypeModal = () => setItemTypeModal(false);

     const handleItemTypeList = (array) => {
        // When receiving list updates (from modal), keep only active items
        const list = Array.isArray(array) ? array.filter(a => a?.isActive) : [];
        setItemTypeList(list);
    };

    const handleItemTypeChange = (event, value) => {
        if (value && value?.id === "new") {
            setItemTypeModal(true);
            return;
        }

        // value may already be the selected option object from options
        let selectedOption = null;
        if (value && value.id !== undefined) {
            selectedOption = value;
        } else if (value && value?.itemType) {
            selectedOption = itemTypeList?.find(option => option?.itemType === value?.itemType);
        }

        // update our local form data state with both fields
        setNewItemData(prev => ({
            ...prev,
            itemType: selectedOption?.itemType || "",
            itemTypeId: selectedOption?.id || "",
        }));
    };

    // Fetch item categories for dropdown
    const getItemCategoryList = async () => {
        var data = {
            CustomerId: customerid,
        };
        FindItemCategory(data, atoken).then((resp) => {

            setItemCategoryList(resp);
        });
    };

    // Fetch UOM list for dropdown
    const getUomList = async () => {
        var data = {
            CustomerId: customerid
        };
        UOMMasterList(data, atoken).then((res) => {


            setUomList(res);
        });
    };

    // Fetch Plant list for dropdown
    const getPlantList = async () => {
        var data = {
            CustomerId: customerid,
        };
        FindPlantStorage(data, atoken).then((resp) => {
            setPlantList(resp);
        });
    };

    const toggleDrawer = (anchor, open) => {
        setOpenDrawer({ ...openDrawer, [anchor]: open });

        // Fetch dropdown data when opening add item drawer
        if (anchor === 'additem' && open) {
            getItemCategoryList();
            getUomList();
            getPlantList();
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
        setNewSupplier([]);
        toggleDrawer("addsupplier", false)
    };

    const handleRemoveSupplier = (vendorId) => {
        const updatedPackages = vendorPackages.filter(pkg => pkg.vendorId !== vendorId);
        setVendorPackages(updatedPackages);
        setSelectedSupplier(prev => prev.filter(id => id !== vendorId));
    };

    // Handle add item form field changes
    const handleItemFieldChange = (field, value) => {
        setNewItemData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle file changes
    const handleItemFileChange = (field, file) => {
        setNewItemData(prev => ({
            ...prev,
            [field]: file
        }));
    };

    // Handle add item form reset
    const handleResetItemForm = () => {
        setNewItemData({
            itemName: '',
            itemCode: '',
            itemCategory: '',
            itemType: '',
            itemTypeId: '',
            itemDesc: '',
            uom: '',
            quantity: '',
            targetPrice: 0,
            plant: '',
            deliveryDate: '',
            remarks: '',
            itemImage: null,
            itemFile: null,
            version: 1
        });
    };

    // Handle save new item (Add or Update)
    const handleSaveNewItem = async () => {
        // Validation
        if (!newItemData.itemName || !newItemData.quantity || !newItemData.uom || !newItemData.plant || !newItemData.itemType) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {

            const payload = {
                id: newItemData.id || 0, // 0 for new items, actual id for updates
                nfaId: props.eventId,
                itemCode: newItemData.itemCode,
                itemName: newItemData.itemName,
                itemCategory: newItemData.itemCategory,
                itemType: newItemData.itemType,
                itemTypeId: newItemData.itemTypeId,
                itemDesc: newItemData.itemDesc,
                uom: newItemData.uom,
                quantity: parseFloat(newItemData.quantity),
                targetPrice: parseFloat(newItemData.targetPrice) || 0,
                version: newItemData.version || 1,
                plant: newItemData.plant,
                deliveryDate: newItemData.deliveryDate || null,
                remarks: newItemData.remarks,
                customerId: customerid,
                itemImage: newItemData.itemImage || '',
                itemFile: newItemData.itemFile || ''
            };

            // Determine if it's an update or add operation
            const isUpdate = newItemData.id && newItemData.id > 0;
            const endpoint = isUpdate
                ? `/api/NFAItemService/Update`
                : `/api/NFAItemService/${props.eventId}/AddItems`;

            // For AddItems, wrap payload in array; for Update, send single object
            const requestPayload = isUpdate ? payload : [payload];

            const response = await apiClient.postres(
                endpoint,
                requestPayload,
                atoken
            );

            if (response.status === 200 || response.status === 201) {
                toast.success(isUpdate ? 'Item updated successfully' : 'Item added successfully');
                // Refresh the SOB details to get updated items
                await getSOBDetails(basisOf);
                handleResetItemForm();
                toggleDrawer("additem", false);
            }
        } catch (error) {
            console.error('Error saving item:', error);
            toast.error(getApiErrorMessage(error), { toastId: "save_item_error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUpdateItem = async () => {
        if (!newItemData.itemName || !newItemData.quantity || !newItemData.uom || !newItemData.plant || !newItemData.itemType) {
            toast.error('Please fill all required fields');
            return;
        }
        if (!newItemData.id || newItemData.id === 0) {
            await handleSaveNewItem();
            return;
        }
        setLoading(true);
        try {
            const payload = {
                id: newItemData.id,
                nfaId: props.eventId || props.nfaEventId,
                itemCode: newItemData.itemCode,
                itemName: newItemData.itemName,
                itemCategory: newItemData.itemCategory,
                itemType: newItemData.itemType,
                itemTypeId: newItemData.itemTypeId,
                itemDesc: newItemData.itemDesc,
                uom: newItemData.uom,
                quantity: parseFloat(newItemData.quantity),
                targetPrice: parseFloat(newItemData.targetPrice) || 0,
                version: newItemData.version || 1,
                plant: newItemData.plant,
                deliveryDate: newItemData.deliveryDate || null,
                remarks: newItemData.remarks,
                customerId: customerid,
                itemImage: newItemData.itemImage || '',
                itemFile: newItemData.itemFile || ''
            };
            const response = await apiClient.postres(`/api/NFAItemService/Update`, payload, atoken);
            if (response.status === 200 || response.status === 201) {
                toast.success('Item updated successfully');
                const updatedVendorPackages = vendorPackages.map(pkg =>
                    pkg.itemId === newItemData.id
                        ? { ...pkg, allocation: 0, totalPrice: 0 }
                        : pkg
                );
                setVendorPackages(updatedVendorPackages);
                await getSOBDetails(basisOf);
                handleResetItemForm();
                toggleDrawer("additem", false);
            }
        } catch (error) {
            toast.error(getApiErrorMessage(error), { toastId: "update_item_error" });
        } finally {
            setLoading(false);
        }
    };

    // Handle edit item - open drawer with prefilled data
    const handleEditItem = (item) => {
        setNewItemData({
            id: item.id,
            itemName: item.itemName || '',
            itemCode: item.itemCode || '',
            itemCategory: item.itemCategory || '',
            itemType: item.itemType || '',
            itemTypeId: item.itemTypeId || '',
            itemDesc: item.itemDesc || '',
            uom: item.uom || '',
            quantity: item.quantity || '',
            targetPrice: item.targetPrice || 0,
            plant: item.plant || '',
            deliveryDate: item.deliveryDate || '',
            remarks: item.remarks || '',
            itemImage: null,
            itemFile: null,
            version: item.version || props.nfaEventVersion || 0,
            nfaId: item.nfaId || props.nfaEventId || 0
        });
        toggleDrawer("additem", true);
    };

    // Handle delete item
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.postres(
                `/api/NFAItemService/${itemId}/DeleteAll`,
                {},
                atoken
            );

            if (response) {
                toast.success('Item deleted successfully');
                setItems(prev => prev.filter(i => i.id !== itemId));
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        } finally {
            setLoading(false);
        }
    };

    // const tempItemData = [
    //     {
    //         "id": 1087,
    //         "itemCode": "",
    //         "itemName": "ITEM A",
    //         "quantity": 10,
    //         "targetPrice": 0,
    //         "uom": "Kg",
    //         "plant": "DELHI",
    //         "itemDesc": "ITEM A"
    //     },
    //     {
    //         "id": 1088,
    //         "itemCode": "",
    //         "itemName": "ITEM B",
    //         "quantity": 10,
    //         "targetPrice": 0,
    //         "uom": "Percentage",
    //         "plant": "DELHI",
    //         "itemDesc": "DESC"
    //     }
    // ];

    // const tempVendorPackagesData = [
    //     {
    //         "id": 195,
    //         "vendorId": 362,
    //         "companyName": "HCL TECHNOLOGIES LIMITED",
    //         "packageRank": "L1",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 499.95,
    //         "finalPrice": 499.95,
    //         "allocation": 0,
    //         "itemId": 1087,
    //         "newVendor": null,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 196,
    //         "vendorId": 362,
    //         "companyName": "HCL TECHNOLOGIES LIMITED",
    //         "packageRank": "L2",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 800.08,
    //         "finalPrice": 800.08,
    //         "allocation": 0,
    //         "itemId": 1088,
    //         "newVendor": null,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 197,
    //         "vendorId": 644,
    //         "companyName": "Comapny B",
    //         "packageRank": "L2",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 5002,
    //         "finalPrice": 5002,
    //         "allocation": 0,
    //         "itemId": 1087,
    //         "newVendor": null,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 198,
    //         "vendorId": 644,
    //         "companyName": "Comapny B",
    //         "packageRank": "L1",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 4,
    //         "finalPrice": 4,
    //         "allocation": 0,
    //         "itemId": 1088,
    //         "newVendor": null,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 199,
    //         "vendorId": 317,
    //         "companyName": "RAHUL KUMAR",
    //         "packageRank": "NA",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 0,
    //         "finalPrice": 0,
    //         "allocation": 0,
    //         "itemId": 1087,
    //         "newVendor": true,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 200,
    //         "vendorId": 528,
    //         "companyName": "Comapny B",
    //         "packageRank": "NA",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 0,
    //         "finalPrice": 0,
    //         "allocation": 0,
    //         "itemId": 1087,
    //         "newVendor": true,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 201,
    //         "vendorId": 317,
    //         "companyName": "RAHUL KUMAR",
    //         "packageRank": "NA",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 0,
    //         "finalPrice": 0,
    //         "allocation": 0,
    //         "itemId": 1088,
    //         "newVendor": true,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     },
    //     {
    //         "id": 202,
    //         "vendorId": 528,
    //         "companyName": "Comapny B",
    //         "packageRank": "NA",
    //         "nfaId": 115,
    //         "nfaEventType": "RFQ",
    //         "nfaEventId": 554,
    //         "initialPrice": 0,
    //         "finalPrice": 0,
    //         "allocation": 0,
    //         "itemId": 1088,
    //         "newVendor": true,
    //         "version": 1,
    //         "allocationOn": "item",
    //         "valueType": "absolute",
    //         "totalPrice": 0,
    //         "customerId": 1
    //     }
    // ];

    useEffect(() => {
        if (items.length > 0 && vendorPackages.length > 0) {
            console.log('item', items);
            console.log('vendor', vendorPackages);
        }
    }, [items, vendorPackages]);

    //For Budget Status Calculation
    useEffect(() => {
        let newBudgetStatus = "";
        let newSaving = parseFloat(props.nfaBudget || "0") - parseFloat(props.nfaAmount || "0");
        if (props.nfaAmount == 0) {
            newBudgetStatus = "";
        }
        else {
            if (newSaving >= 0) {
                newBudgetStatus = "Within Budget";
            }
            else if (newSaving < 0 && props.nfaBudget != 0) {
                newBudgetStatus = "Outside Budget";
            }
            else if (props.nfaBudget == 0) {
                newBudgetStatus = "Not Budgeted";
                newSaving = 0;
            }
            else {
                newBudgetStatus = "";
            }
        }
        setBudgetStatus(newBudgetStatus);
        // formik.setFieldValue("budgetStatus", newBudgetStatus);
        setSaving(newSaving);
        // formik.setFieldValue("nfaSaving", newSaving);

    }, [props.nfaAmount, props.nfaBudget])

    useEffect(() => {
        if (props?.nfaBudget != budget) {
            props?.updateBudget(budget);
        }
    }, [budget])

    useEffect(() => {
        if (props?.amount != totalAmount) {
            props?.updateAmount(totalAmount);
        }
    }, [totalAmount])

    useEffect(() => {
        if (currency && props?.nfaCurrency != currency) {
            props?.updateCurrency(currency);
        }
    }, [currency])

    // Function to handle Excel file upload
    const handleUploadExcel = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const workbook = new ExcelJS.Workbook();
            const arrayBuffer = await file.arrayBuffer();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet('SOB Data');
            if (!worksheet) {
                toast.error('Invalid Excel file. Sheet "SOB Data" not found.');
                return;
            }

            // Create a map to store updated values
            const updatedValues = {};
            const excelItemIds = new Set();
            const excelVendorIds = new Set();
            let excelValueType = '';

            // Read data from Excel (starting from row 2, skipping header)
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header row

                const itemId = row.getCell('A').value; // ItemId (hidden column)
                const vendorId = row.getCell('F').value; // VendorId (hidden column)
                const finalPrice = row.getCell('J').value; // FinalPrice
                const allocation = row.getCell('L').value; // Allocation
                const valueTypeFromExcel = row.getCell('M').value; // ValueType

                // Collect itemIds and vendorIds from Excel
                if (itemId) excelItemIds.add(itemId);
                if (vendorId) excelVendorIds.add(vendorId);

                // Get valueType from first data row
                if (rowNumber === 2 && valueTypeFromExcel) {
                    excelValueType = valueTypeFromExcel.toLowerCase();
                }

                if (itemId && vendorId) {
                    const key = `${itemId}_${vendorId}`;
                    updatedValues[key] = {
                        finalPrice: finalPrice !== null && finalPrice !== undefined ? parseFloat(finalPrice) : 0,
                        allocation: allocation !== null && allocation !== undefined ? parseFloat(allocation) : 0
                    };
                }
            });

            console.log('Updated values from Excel:', updatedValues);

            // Validation 1: Check if valueType in UI matches Excel
            if (excelValueType && excelValueType !== valueType.toLowerCase()) {
                toast.error(`Value Type mismatch! The Excel file has "${excelValueType}" but UI has "${valueType}". Please download the Excel again as the Value Type has been changed.`);
                event.target.value = '';
                return;
            }

            // Validation 2: Check if all itemIds in Excel match items in UI
            const uiItemIds = new Set(items.map(item => item.id));
            const missingItemsInUI = [...excelItemIds].filter(id => !uiItemIds.has(id));
            const missingItemsInExcel = [...uiItemIds].filter(id => !excelItemIds.has(id));

            if (missingItemsInUI.length > 0 || missingItemsInExcel.length > 0) {
                toast.error('Item mismatch detected! The items in the Excel file do not match the current items in the UI. Please download the Excel again.');
                event.target.value = '';
                return;
            }

            // Validation 3: Check if vendor count matches (detect if new vendors were added)
            const uiVendorItemCombinations = new Set(
                vendorPackages.map(vp => `${vp.itemId}_${vp.vendorId}`)
            );
            const excelVendorItemCombinations = new Set(Object.keys(updatedValues));

            // Check if counts match
            if (uiVendorItemCombinations.size !== excelVendorItemCombinations.size) {
                toast.error('Vendor count mismatch! New vendors have been added or removed in the UI. Please download the Excel again as the number of vendors has changed.');
                event.target.value = '';
                return;
            }

            // Check if all combinations in UI exist in Excel
            for (const combo of uiVendorItemCombinations) {
                if (!excelVendorItemCombinations.has(combo)) {
                    toast.error('Vendor mismatch detected! The vendors in the Excel file do not match the current vendors in the UI. Please download the Excel again.');
                    event.target.value = '';
                    return;
                }
            }

            // Validate allocations per item before updating
            const itemAllocationSums = {};
            const itemMap = {};

            // Build item map for quick lookup
            items.forEach(item => {
                itemMap[item.id] = item;
                itemAllocationSums[item.id] = 0;
            });

            // Calculate sum of allocations per item from Excel data
            Object.keys(updatedValues).forEach(key => {
                const [itemId, vendorId] = key.split('_').map(Number);
                const allocation = updatedValues[key].allocation;

                if (itemAllocationSums[itemId] !== undefined) {
                    itemAllocationSums[itemId] += allocation;
                }
            });

            // Validate based on valueType
            let validationFailed = false;
            let errorMessage = '';

            for (const [itemId, totalAllocation] of Object.entries(itemAllocationSums)) {
                const item = itemMap[itemId];
                if (!item) continue;

                if (valueType === 'percentage' && totalAllocation > 100) {
                    validationFailed = true;
                    errorMessage = `Allocation validation failed for item "${item.itemName}": Total allocation (${totalAllocation.toFixed(2)}%) exceeds 100%.`;
                    break;
                } else if (valueType === 'absolute' && totalAllocation > item.quantity) {
                    validationFailed = true;
                    errorMessage = `Allocation validation failed for item "${item.itemName}": Total allocation (${totalAllocation.toFixed(2)}) exceeds item quantity (${item.quantity}).`;
                    break;
                }
            }

            // If validation fails, show error and don't update
            if (validationFailed) {
                toast.error(errorMessage);
                event.target.value = ''; // Clear the file input
                return;
            }

            // Update vendorPackages state with new values
            setVendorPackages(prevPackages => {
                return prevPackages.map(vendor => {
                    const key = `${vendor.itemId}_${vendor.vendorId}`;
                    if (updatedValues[key]) {
                        const updated = {
                            ...vendor,
                            finalPrice: updatedValues[key].finalPrice,
                            allocation: updatedValues[key].allocation
                        };

                        // Recalculate price reduction and total price
                        const initialPrice = vendor.initialPrice || 0;
                        const finalPrice = updatedValues[key].finalPrice;
                        const allocation = updatedValues[key].allocation;

                        // Only calculate price reduction if initialPrice is not 0 (not 'Not Quoted')
                        updated.priceReduction = initialPrice !== 0 ? initialPrice - finalPrice : '';

                        // Get item quantity for absolute calculation
                        const currentItem = items.find(item => item.id === vendor.itemId);
                        const itemQuantity = currentItem?.quantity || 0;

                        // Calculate totalPrice based on valueType (same logic as handleAllocationChangeItem)
                        // For percentage: (allocation / 100) * finalPrice
                        // For absolute: (finalPrice / itemQuantity) * allocation
                        updated.totalPrice = valueType === 'percentage'
                            ? ((allocation / 100) * finalPrice).toFixed(4)
                            : ((finalPrice / itemQuantity) * allocation).toFixed(4);

                        return updated;
                    }
                    return vendor;
                });
            });

            toast.success('Excel data uploaded and applied successfully!');

            // Clear the file input
            event.target.value = '';
        } catch (error) {
            console.error('Error reading Excel file:', error);
            toast.error('Failed to read Excel file. Please check the file format.');
        }
    };

    // Function to download Excel with items and vendor packages data
    const handleDownloadExcel = async () => {
        try {
            console.log('Items:', items);
            console.log('VendorPackages:', vendorPackages);

            // Use actual data or fallback to temp data for testing
            // const itemsData = items.length > 0 ? items : tempItemData;
            // const vendorData = vendorPackages.length > 0 ? vendorPackages : tempVendorPackagesData;
            const itemsData = items;
            const vendorData = vendorPackages;

            // IMPORTANT: Sort vendorPackages first by itemId, then by vendorId
            const sortedVendorData = [...vendorData].sort((a, b) => {
                if (a.itemId !== b.itemId) {
                    return a.itemId - b.itemId; // Sort by itemId first
                }
                return a.vendorId - b.vendorId; // Then by vendorId
            });

            console.log('Sorted Vendor Data:', sortedVendorData);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('SOB Data');

            // Define columns (Total column removed, ValueType added)
            worksheet.columns = [
                { header: 'ItemId', key: 'itemId', width: 10 },
                { header: 'ItemCode', key: 'itemCode', width: 15 },
                { header: 'ItemName', key: 'itemName', width: 25 },
                { header: 'UOM', key: 'uom', width: 12 },
                { header: 'Quantity', key: 'quantity', width: 12 },
                { header: 'VendorId', key: 'vendorId', width: 10 },
                { header: 'VendorName', key: 'vendorName', width: 30 },
                { header: 'Rank', key: 'rank', width: 10 },
                { header: 'InitialPrice', key: 'initialPrice', width: 15 },
                { header: 'FinalPrice', key: 'finalPrice', width: 15 },
                { header: 'PriceReduction', key: 'priceReduction', width: 15 },
                { header: 'Allocation', key: 'allocation', width: 12 },
                { header: 'ValueType', key: 'valueType', width: 15 },
            ];

            // Hide ItemId (Column A) and VendorId (Column F) columns
            worksheet.getColumn('A').hidden = true; // ItemId
            worksheet.getColumn('F').hidden = true; // VendorId

            // Style the header row
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };

            // Prepare data rows - directly map from sorted vendor data
            const dataRows = [];

            // Create a map of items for quick lookup
            const itemMap = {};
            itemsData.forEach(item => {
                itemMap[item.id] = item;
            });

            // Track unique item-vendor combinations to avoid duplicates
            const seenCombinations = new Set();

            sortedVendorData.forEach((vendorPackage) => {
                const item = itemMap[vendorPackage.itemId];
                if (!item) {
                    console.log(`Item not found for vendorPackage with itemId: ${vendorPackage.itemId}`);
                    return;
                }

                // Create unique key for item-vendor combination
                const combinationKey = `${vendorPackage.itemId}_${vendorPackage.vendorId}`;

                // Skip if we've already added this combination
                if (seenCombinations.has(combinationKey)) {
                    console.log(`Skipping duplicate: Item ${vendorPackage.itemId}, Vendor ${vendorPackage.vendorId}`);
                    return;
                }

                seenCombinations.add(combinationKey);

                const allocation = vendorPackage.allocation || 0;
                const finalPrice = vendorPackage.finalPrice || 0;
                const initialPrice = vendorPackage.initialPrice || 0;
                const priceReduction = initialPrice !== 0 ? initialPrice - finalPrice : 0;

                dataRows.push({
                    itemId: item.id || '',
                    itemCode: item.itemCode || '',
                    itemName: item.itemName || '',
                    uom: item.uom || '',
                    quantity: item.quantity || 0,
                    vendorId: vendorPackage.vendorId || '',
                    vendorName: vendorPackage.companyName || '',
                    rank: vendorPackage.packageRank || 'NA',
                    initialPrice: initialPrice,
                    finalPrice: finalPrice,
                    priceReduction: priceReduction,
                    allocation: allocation,
                    valueType: valueType || vendorPackage.valueType || ''
                });
            });

            console.log('Total rows to export:', dataRows.length);
            console.log('Data rows:', dataRows);

            // Add rows to worksheet
            dataRows.forEach(row => {
                worksheet.addRow(row);
            });

            // Auto-fit columns and set alignment
            worksheet.columns.forEach(column => {
                if (column.header) {
                    column.alignment = { vertical: 'middle', horizontal: 'left' };
                }
            });

            // Lock header row (row 1)
            worksheet.getRow(1).eachCell((cell) => {
                cell.protection = { locked: true };
            });

            // Updated Column mapping (Total column removed, ValueType added, ItemId and VendorId hidden):
            // A=ItemId (Hidden), B=ItemCode, C=ItemName, D=UOM, E=Quantity, F=VendorId (Hidden), 
            // G=VendorName, H=Rank, I=InitialPrice, J=FinalPrice, K=PriceReduction, L=Allocation, M=ValueType

            // Loop through all data rows (starting from row 2)
            for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
                const row = worksheet.getRow(rowNum);

                // Lock columns A to I (ItemId to InitialPrice) - Always locked
                ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
                    const cell = row.getCell(col);
                    cell.protection = { locked: true };
                });

                // Column J (FinalPrice) - Unlock only if value is 0, otherwise lock
                const finalPriceCell = row.getCell('J');
                const finalPriceValue = finalPriceCell.value;
                if (finalPriceValue === 0 || finalPriceValue === '0') {
                    finalPriceCell.protection = { locked: false };
                } else {
                    finalPriceCell.protection = { locked: true };
                }

                // Column K (PriceReduction) - Always locked
                const priceReductionCell = row.getCell('K');
                priceReductionCell.protection = { locked: true };

                // Column L (Allocation) - Always unlocked (editable)
                const allocationCell = row.getCell('L');
                allocationCell.protection = { locked: false };

                // Column M (ValueType) - Always locked (read-only)
                const valueTypeCell = row.getCell('M');
                valueTypeCell.protection = { locked: true };
            }

            // Protect the worksheet with a password
            // Users can edit unlocked cells but cannot modify locked cells
            worksheet.protect('SOB2024', {
                selectLockedCells: true,
                selectUnlockedCells: true,
                formatCells: false,
                formatColumns: false,
                formatRows: false,
                insertRows: false,
                insertColumns: false,
                deleteRows: false,
                deleteColumns: false,
                sort: false,
                autoFilter: false,
                pivotTables: false
            });

            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Download file
            const fileName = `SOB_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
            saveAs(blob, fileName);

            toast.success('Excel file downloaded successfully!');
        } catch (error) {
            console.error('Error generating Excel:', error);
            toast.error('Failed to generate Excel file');
        }
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
            <div className='row mt-2'>
                {/* Amount */}
                <div className="col-12 col-md-3 col-lg-3 mb-3">
                    <TextField
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        variant="outlined"
                        size="small"
                        className='f14'
                        id="nfaAmount"
                        name="nfaAmount"
                        label="Amount *"
                        value={totalAmount}
                        disabled
                        InputProps={{
                            step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                            min: 0,
                            max: 100,
                        }}
                        type="number"
                    />
                </div>
                {/* Budget */}
                <div className="col-12 col-md-3 col-lg-2 mb-3">
                    <TextField
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        variant="outlined"
                        size="small"
                        className='f14'
                        id="nfaBudget"
                        name="nfaBudget"
                        label="Budget *"
                        value={props.nfaBudget}
                        disabled={!canEdit}
                        InputProps={{
                            step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                            min: 0,
                            max: 100,
                        }}
                        type="number"
                        onChange={(e) => {
                            if (DecimalValueRegEx.test(e.target.value)) {
                                setBudget(e.target.value);
                            }
                            else if (e.target.value === "") {
                                setBudget('');
                            }
                        }}
                    />
                </div>
                {/* Currency */}
                <div className="col-12 col-md-3 col-lg-1 mb-3">
                    <Autocomplete
                        id="nfaCurrency"
                        name="nfaCurrency"
                        options={[
                            ...(currencyList?.filter(cl => cl.currencyNm !== (userDetail?.defaultCurrency || "INR")) || []),
                            { currencyNm: "Add New", id: "new" }
                        ]}
                        getOptionLabel={(option) => option.currencyNm ?? (userDetail?.defaultCurrency || "INR")}
                        disabled={!canEdit}
                        onChange={(e, value) => {
                            if (value && value.id === "new") {
                                setOpenCurrencyModal(true);
                            } else {
                                // formik.setFieldValue(
                                // "nfaCurrency",
                                // value
                                // );
                            }
                        }}
                        value={props?.nfaCurrency || null}
                        isOptionEqualToValue={(option, value) => {
                            if (!value) return false;
                            if (option.id === "new") return false;
                            return option.currencyNm === value.currencyNm || option.id === value.id;
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                name="nfaCurrency"
                                label="Currency *"
                                variant="outlined"
                                size="small"
                                className="w-100 f14"
                            />
                        )}
                        renderOption={(props, option) => (
                            <Box
                                component="li"
                                {...props}
                                key={option.id || option.currencyNm}
                                style={
                                    option.id === "new"
                                        ? {
                                            fontStyle: "italic",
                                            color: "blue",
                                            cursor: "pointer",
                                            textDecoration: "underline",
                                        }
                                        : {}
                                }
                            >
                                {option.currencyNm}
                            </Box>
                        )}
                        noOptionsText="No options"
                        style={{ width: '100%' }}
                    />
                </div>
                {/* Budget Status */}
                <div className="col-12 col-md-3 col-lg-3 mb-3">
                    <TextField
                        InputLabelProps={{
                            shrink: true,
                            sx: {
                                color: 'black',
                                fontWeight: 'bold'
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        size="small"
                        className='f14'
                        id="budgetStatus"
                        name="budgetStatus"
                        label="Budget Status"
                        value={budgetStatus}
                        InputProps={{
                            step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                            min: 0,
                            max: 100,
                        }}
                        disabled
                    />
                </div>
                {/* Saving */}
                <div className="col-12 col-md-3 col-lg-3 mb-3">
                    <TextField
                        InputLabelProps={{
                            shrink: true,
                            sx: {
                                color: 'black',
                                fontWeight: 'bold'
                            }
                        }}
                        fullWidth
                        variant="outlined"
                        size="small"
                        className='f14'
                        id="nfaSaving"
                        name="nfaSaving"
                        label="Saving"
                        value={saving}
                        disabled
                    />
                </div>
            </div>
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
            <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
                {basisOf == 'item' && (
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            className="text-capitalize"
                            onClick={handleDownloadExcel}
                            disabled={items.length === 0 || vendorPackages.length === 0}
                        >
                            Download Excel
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            component="label"
                            className="text-capitalize"
                            disabled={!isDraftStage || !eventDetailsCanEdit || items.length === 0}
                        >
                            Upload Excel
                            <input
                                type="file"
                                hidden
                                accept=".xlsx, .xls"
                                onChange={handleUploadExcel}
                            />
                        </Button>
                    </>
                )}
                {basisOf == 'item' && props?.nfaEventType != 'RFQ' && props?.nfaEventType != 'Auction'
                    && props?.nfaEventType != 'PR' && (
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<HiPlusSm />}
                            className="text-capitalize blue-text font-normal"
                            onClick={() => toggleDrawer("additem", true)}
                            disabled={!isDraftStage || !eventDetailsCanCreate}
                        >
                            Add Items
                        </Button>
                    )}
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
                        style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '70vh' }}>
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
                                                <div className="d-flex align-items-center gap-2">
                                                    {props?.nfaEventType != 'RFQ' && props?.nfaEventType != 'Auction'
                                                        && props?.nfaEventType != 'PR' && isDraftStage && eventDetailsCanEdit && (
                                                            <Tooltip title="Edit Item">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditItem(item)}
                                                                    className="text-primary"
                                                                >
                                                                    <HiPencilAlt />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    {props?.nfaEventType != 'RFQ' && props?.nfaEventType != 'Auction'
                                                        && props?.nfaEventType != 'PR' && isDraftStage && eventDetailsCanRemove && (
                                                            <Tooltip title="Delete Item">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteItem(item.id)}
                                                                    className="text-danger"
                                                                >
                                                                    <HiOutlineTrash />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    <Tooltip title={expandedItems[item.id] ? "Collapse Details" : "Expand Details"}>
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
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>,
                                        expandedItems[item.id] && (
                                            <tr key={`${item.id}-expanded`}>
                                                <td colSpan="8" style={{ padding: '0', backgroundColor: '#f8f9fa' }}>
                                                    <Box sx={{ backgroundColor: '#f8f9fa' }}>


                                                        {/* Vendor details table with full functionality */}
                                                        <div className="table-responsive"
                                                            style={{ overflowX: 'hidden', maxHeight: '40vh' }}>
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
style={{ overflowX: 'hidden', overflowY: 'auto', maxHeight: '70vh' }}                >
                    <Table
                        className="stripped"
                        style={{
                            backgroundColor: 'white',
                            color: 'black',
                            borderCollapse: 'collapse',
                            width: '100%',
                            // tableLayout: 'fixed',
                            // minWidth: '1100px'
                        }}
                    >
                        <thead>
                            <tr style={{ color: 'black' }}>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '60px' }}>S.No</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '200px'}}>VENDOR DETAILS</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px' }}>Package Rank</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px' }}>Initial Price</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px' }}>Final Price</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '130px'}}>Price Reduction</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px' }}>Allocation</th>
                                <th style={{ borderBottom: '2px solid #dee2e6', padding: '8px', fontSize: '13px', fontWeight: 400, width: '120px'}}>Total</th>
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
                                        <td style={{ padding: '8px', borderTop: '1px solid #dee2e6', width: '200px', minWidth: '200px', wordWrap: 'break-word' }}>
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

                {/* Drawer for Add Item */}
                <Drawer
                    anchor="right"
                    open={openDrawer.additem}
                    onClose={() => toggleDrawer("additem", false)}
                >
                    <div style={{ width: 600, display: "flex", flexDirection: "column", height: '100%' }}>
                        <Box className="bgheaderCards">
                            <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                                <div className="ms-3 text-white">Add Product</div>
                                <IconButton
                                    onClick={() => toggleDrawer("additem", false)}
                                    size="small"
                                    className="me-3"
                                >
                                    <HiOutlineX color="white" />
                                </IconButton>
                            </div>
                        </Box>

                        <input
                            id="itemimagefile"
                            className="d-none"
                            type="file"
                            accept="image/jpeg,image/gif,image/png"
                            onChange={(e) => handleItemFileChange('itemImage', e.target.files[0])}
                        />
                        <input
                            id="itemattachmentfile"
                            className="d-none"
                            type="file"
                            onChange={(e) => handleItemFileChange('itemFile', e.target.files[0])}
                        />

                        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                            <div className='row mt-2'>
                                {/* Item/Service Name with character counter */}
                                <div className='col-12 col-md-6 mb-4'>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        className='f14'
                                        id="itemName"
                                        name="itemName"
                                        label="Item/Service Name *"
                                        inputProps={{ maxLength: 100 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography variant="body2" color="textSecondary">
                                                        {newItemData.itemName.length}/100
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={newItemData.itemName}
                                        onChange={(e) => handleItemFieldChange('itemName', e.target.value)}
                                    />
                                </div>

                                {/* Item Code with character counter */}
                                <div className='col-12 col-md-6 mb-4'>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        className='f14'
                                        id="itemCode"
                                        name="itemCode"
                                        label="Item Code"
                                        inputProps={{ maxLength: 100 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography variant="body2" color="textSecondary">
                                                        {newItemData.itemCode.length}/100
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={newItemData.itemCode}
                                        onChange={(e) => handleItemFieldChange('itemCode', e.target.value)}
                                    />
                                </div>

                                {/* Description with character counter */}
                                <div className='col-12 col-md-12 mb-4'>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        className='f14'
                                        multiline={true}
                                        rows={3}
                                        id="itemDesc"
                                        name="itemDesc"
                                        label="Description *"
                                        inputProps={{ maxLength: 2000 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography variant="body2" color="textSecondary">
                                                        {newItemData.itemDesc.length}/2000
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={newItemData.itemDesc}
                                        onChange={(e) => handleItemFieldChange('itemDesc', e.target.value)}
                                    />
                                </div>

                                {/* Remarks with character counter */}
                                <div className='col-12 col-md-12 mb-4'>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        className='f14'
                                        multiline={true}
                                        rows={3}
                                        id="remarks"
                                        name="remarks"
                                        label="Remarks"
                                        inputProps={{ maxLength: 2000 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography variant="body2" color="textSecondary">
                                                        {newItemData.remarks.length}/2000
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                        value={newItemData.remarks}
                                        onChange={(e) => handleItemFieldChange('remarks', e.target.value)}
                                    />
                                </div>

                                {/* Item Category Dropdown */}
                                <div className='col-12 col-md-4 mb-3'>
                                    <Autocomplete
                                        id="itemCategory"
                                        name="itemCategory"
                                        size="small"
                                        className='w-100 f14'
                                        options={[
                                            ...itemCategoryList,
                                            { itemCategory: "ADD NEW", id: "new" },
                                        ]}
                                        value={
                                            itemCategoryList.find(
                                                (option) => option.itemCategory === newItemData.itemCategory
                                            ) || { itemCategory: newItemData.itemCategory }
                                        }
                                        getOptionLabel={(option) => option.itemCategory ?? ""}
                                        onOpen={() => {
                                            if (itemCategoryList.length === 0) {
                                                getItemCategoryList();
                                            }
                                        }}
                                        onChange={(event, value) => {
                                            if (value?.id === "new") {
                                                // Handle ADD NEW - you can add modal logic here
                                                toast.info('Add New Item Category functionality');
                                            } else {
                                                handleItemFieldChange('itemCategory', value?.itemCategory || '');
                                            }
                                        }}
                                        renderOption={(props, option) => (
                                            <Box
                                                component="li"
                                                {...props}
                                                style={
                                                    option.id === "new"
                                                        ? {
                                                            fontStyle: "italic",
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            textDecoration: "underline",
                                                        }
                                                        : {}
                                                }
                                            >
                                                {option.itemCategory}
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                variant="outlined"
                                                {...params}
                                                label="Item Category *"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                    />
                                </div>

                                {/* added item type */}
                                <div className='col-12 col-md-6 col-lg-4 mb-3'>
                                    <Autocomplete
                                        id="itemType"
                                        name="itemType"
                                        size="small"
                                        className='w-100 f14'
                                        sx={{ width: "100%" }}
                                        options={[
                                            ...itemTypeList,
                                            { itemType: "ADD NEW", id: "new" },
                                        ]}
                                        value={
                                            itemTypeList.find(
                                                (option) => option.itemType === newItemData.itemType
                                            ) || { itemType: newItemData.itemType }
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                            (option?.id !== undefined && value?.id !== undefined)
                                                ? option.id === value.id
                                                : option.itemType === value?.itemType
                                        }
                                        getOptionLabel={(option) => option?.itemType ?? ""}
                                        onOpen={() => {
                                            if (itemTypeList.length === 0) {
                                                PullItemType();
                                            }
                                        }}
                                        onChange={handleItemTypeChange}
                                        renderOption={(props, option) => (
                                            <Box
                                                component="li"
                                                {...props}
                                                style={
                                                    option.id === "new"
                                                        ? {
                                                            fontStyle: "italic",
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            textDecoration: "underline",
                                                        }
                                                        : {}
                                                }
                                            >
                                                {option.itemType}
                                            </Box>
                                        )}
                                         renderInput={(params) => (
                                            <TextField
                                                variant="outlined"
                                                {...params}
                                                label="Item Type *"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Plant Dropdown */}
                                <div className='col-12 col-md-4 mb-3'>
                                    <Autocomplete
                                        id="plant"
                                        name="plant"
                                        size="small"
                                        className='w-100 f14'
                                        options={[
                                            ...plantList,
                                            { slDesc: "ADD NEW", slCode: "new" },
                                        ]}
                                        value={
                                            plantList.find(
                                                (option) => option.slDesc === newItemData.plant
                                            ) || { slDesc: newItemData.plant }
                                        }
                                        getOptionLabel={(option) =>
                                            option.slCode?.trim() ? `${option.slDesc} - ${option.slCode.trim()}` : option.slDesc
                                        }
                                        onOpen={() => {
                                            if (plantList.length === 0) {
                                                getPlantList();
                                            }
                                        }}
                                        onChange={(event, value) => {
                                            if (value?.slCode === "new") {
                                                // Handle ADD NEW - you can add modal logic here
                                                toast.info('Add New Plant functionality');
                                            } else {
                                                handleItemFieldChange('plant', value?.slDesc || '');
                                            }
                                        }}
                                        renderOption={(props, option) => (
                                            <Box
                                                component="li"
                                                {...props}
                                                style={
                                                    option.slCode === "new"
                                                        ? {
                                                            fontStyle: "italic",
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            textDecoration: "underline",
                                                        }
                                                        : {}
                                                }
                                            >
                                                {`${option.slDesc}  ${option.slCode?.trim() ?? ""}`}
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                variant="outlined"
                                                {...params}
                                                label="Plant *"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Delivery Date */}
                                <div className='col-12 col-md-4 mb-4'>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <MobileDatePicker
                                            variant="outlined"
                                            label="Delivery Date"
                                            size="small"
                                            name='deliveryDate'
                                            id='deliveryDate'
                                            value={newItemData.deliveryDate ? new Date(newItemData.deliveryDate) : null}
                                            className='w-100 f14'
                                            slotProps={{
                                                textField: {
                                                    variant: 'outlined',
                                                    size: 'small',
                                                    InputLabelProps: { shrink: true },
                                                }
                                            }}
                                            onChange={(newValue) => {
                                                const formattedDate = newValue ? newValue.toISOString().split('T')[0] : '';
                                                handleItemFieldChange('deliveryDate', formattedDate);
                                            }}
                                        />
                                    </LocalizationProvider>
                                </div>

                                {/* Quantity */}
                                <div className='col-12 col-md-4 mb-4'>
                                    <TextField
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        className='f14'
                                        id="quantity"
                                        name="quantity"
                                        label="Quantity *"
                                        value={newItemData.quantity}
                                        type="number"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || /^[0-9]{1,8}(\.[0-9]{0,4})?$/.test(value)) {
                                                handleItemFieldChange('quantity', value);
                                            }
                                        }}
                                    />
                                </div>

                                {/* UOM Dropdown */}
                                <div className='col-12 col-md-4 mb-3'>
                                    <Autocomplete
                                        id="uom"
                                        name="uom"
                                        size="small"
                                        className='w-100 f14'
                                        options={[
                                            ...uomList,
                                            { uom: "ADD NEW", id: "new" },
                                        ]}
                                        value={
                                            uomList.find(
                                                (option) => option.uom === newItemData.uom
                                            ) || { uom: newItemData.uom }
                                        }
                                        getOptionLabel={(option) => option.uom ?? ""}
                                        onOpen={() => {
                                            if (uomList.length === 0) {
                                                getUomList();
                                            }
                                        }}
                                        onChange={(event, value) => {
                                            if (value?.id === "new") {
                                                // Handle ADD NEW - you can add modal logic here
                                                toast.info('Add New UOM functionality');
                                            } else {
                                                handleItemFieldChange('uom', value?.uom || '');
                                            }
                                        }}
                                        renderOption={(props, option) => (
                                            <Box
                                                component="li"
                                                {...props}
                                                style={
                                                    option.id === "new"
                                                        ? {
                                                            fontStyle: "italic",
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            textDecoration: "underline",
                                                        }
                                                        : {}
                                                }
                                            >
                                                {option.uom}
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                variant="outlined"
                                                {...params}
                                                label="UOM *"
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Target/Budget Price */}
                                <div className='col-12 col-md-4 mb-4'>
                                    <TextField
                                        id="targetPrice"
                                        name="targetPrice"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        className='f14'
                                        label="Target/Budget Price"
                                        value={newItemData.targetPrice}
                                        type="number"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || /^\d{0,10}(\.\d{0,4})?$/.test(value)) {
                                                handleItemFieldChange('targetPrice', value);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Item Image Upload */}
                                <div className='col-6 col-md-6 col-lg-4 mb-3'>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        className='f14 pointer'
                                        id="itemImage"
                                        name="itemImage"
                                        label="Item Image"
                                        value={newItemData.itemImage ? newItemData.itemImage.name : ""}
                                        disabled={true}
                                        InputProps={{
                                            endAdornment: (
                                                <>
                                                    {!newItemData.itemImage ? (
                                                        <Tooltip title="Upload Image" className='pointer'>
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => document.getElementById('itemimagefile').click()}>
                                                                    <UploadOutlined />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Remove Image" className='pointer'>
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => handleItemFileChange('itemImage', null)}>
                                                                    <HiOutlineX />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            ),
                                        }}
                                    />
                                </div>

                                {/* Item Attachment Upload */}
                                <div className='col-6 col-md-6 col-lg-4 mb-3'>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        size="small"
                                        className='f14'
                                        id="itemAttachment"
                                        name="itemAttachment"
                                        label="Item Attachment"
                                        value={newItemData.itemFile ? newItemData.itemFile.name : ""}
                                        disabled={true}
                                        InputProps={{
                                            endAdornment: (
                                                <>
                                                    {!newItemData.itemFile ? (
                                                        <Tooltip title="Upload Attachment" className='pointer'>
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => document.getElementById('itemattachmentfile').click()}>
                                                                    <UploadOutlined />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Remove Attachment" className='pointer'>
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => handleItemFileChange('itemFile', null)}>
                                                                    <HiOutlineX />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            ),
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <Box sx={{
                            padding: '16px 20px',
                            borderTop: '1px solid #e0e0e0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2
                        }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    handleResetItemForm();
                                    toggleDrawer("additem", false);
                                }}
                            >
                                Reset
                            </Button>
                            <LoadingButton
                                loading={loading}
                                variant="contained"
                                onClick={handleSaveNewItem}
                                disabled={!isDraftStage || !eventDetailsCanCreate}
                            >
                                Add
                            </LoadingButton>
                        </Box>
                    </div>
                </Drawer>
            </React.Fragment>
            {/* modal for item type */}
            <Modal
                size="lg"
                show={ItemTypeModal}
                backdrop="static"
                keyboard={false}
                value={"Add NEW ITEM TYPE"}
                className="zindex1280"
                backdropClassName="zindex1280"
                centered
                contentClassName="border-0"
                onHide={() => CloseItemTypeModal()}
            >
                <Modal.Header className="pt-2 pb-2 bgheaderCards">
                    <Modal.Title><div className="d-flex align-items-center f14 text-white">
                        Manage Item Type
                    </div>

                    </Modal.Title>
                    <IconButton
                        onClick={() => CloseItemTypeModal()}
                        size="small"
                        edge="start"
                    >
                        <HiOutlineX className="f20 text-white" />
                    </IconButton>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3">
                        <AddEditItemType handleItemTypeList={handleItemTypeList} isModal={true} />
                    </div>
                </Modal.Body>
            </Modal>
            <Modal
                size="lg"
                show={OpenCurrencyModal}
                backdrop="static"
                keyboard={false}
                className="zindex1280"
                backdropClassName="zindex1280"
                centered
                contentClassName="border-0"
                onHide={() => CloseCurrencyModal()}
            >
                <Modal.Header className="pt-2 pb-2 bgheaderCards">
                    <Modal.Title id="modal-heading">
                        <div className="d-flex align-items-center f14 text-white">
                            Manage Currency
                        </div>
                    </Modal.Title>
                    <IconButton onClick={() => CloseCurrencyModal()} size="small" edge="start">
                        <HiOutlineX className="f20 text-white" />
                    </IconButton>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3">
                        <AddEditCurrency handleCurrencyList={handleCurrencyList} />
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
});

export default NFASOBEventBoxRFQ;
