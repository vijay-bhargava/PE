import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { actionTypes, useStateValue } from "../../../store";
import { Autocomplete, Box, Button, Table, IconButton, Checkbox, Stack, TableHead, TableBody, TableRow, TableCell, Pagination, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Alert, Collapse, TableContainer, Paper } from '@mui/material';
import { checkUTC, buildQueryParams, VendorfilterOptions } from "../../../utils/common/utility";
import ERFQComparative from "../RequestForQuotation/ERFQComparative";
import { api, ApiClient } from '../../../Apiclient';
import { sumArray } from "../../../utils/common";
import Drawer from "@mui/material/Drawer";
import { HiOutlineX, HiPlusSm, HiOutlineUserAdd, HiPencilAlt, HiOutlineInformationCircle, HiTrash } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Badge } from "react-bootstrap";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
// Import sample data for testing
import { NFASobData } from './NFATempData';

const NFASOBItemWise = ({ props }) => {
    const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);

    // Extract permission props
    const { permissionManager } = props;

    // Permission checks for Event Details
    const eventDetailsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? false;
    const eventDetailsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? false;
    const eventDetailsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? false;
    const eventDetailsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? false;

    // State for items and expansion
    const [items, setItems] = useState([]);
    const [packageWiseData, setPackageWiseData] = useState([]);
    const [expandedItems, setExpandedItems] = useState({});
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Load data on component mount
    useEffect(() => {
        // Using sample data from NFATempData for now
        setItems(NFASobData.items);
        setPackageWiseData(NFASobData.packageWiseData);
    }, []);

    const handleDeleteItem = async (itemId, event) => {
        if (event) event.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        setDeleteLoading(true);
        try {
            const response = await apiClient.deleteres(
                `/api/NFAItemService/${itemId}/DeleteAll`,
                atoken
            );
            if (response?.status === 200 || response?.data?.success === true || response?.data?.isSuccess === true) {
                setItems(prevItems => prevItems.filter(item => item.id !== itemId));
                setPackageWiseData(prevData => prevData.filter(data => data.itemId !== itemId));
                setExpandedItems(prev => {
                    const newState = { ...prev };
                    delete newState[itemId];
                    return newState;
                });
                toast.success('Item deleted successfully');
            } else {
                toast.error(response?.data?.message || response?.data?.error || 'Failed to delete item');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || 'Error deleting item. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Toggle expansion for an item
    const handleToggleExpand = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Get vendor data for a specific item
    const getVendorDataForItem = (itemId) => {
        return packageWiseData.filter(data => data.itemId === itemId);
    };

    // Component for individual item row
    const ItemRow = ({ item }) => {
        const isExpanded = expandedItems[item.id];
        const vendorData = getVendorDataForItem(item.id);

        return (
            <>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => handleToggleExpand(item.id)}
                        >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {items.indexOf(item) + 1}
                    </TableCell>
                    <TableCell>{item.itemCode || '-'}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.quantity} ({item.uom})</TableCell>
                    <TableCell>{item.targetPrice}</TableCell>
                    <TableCell>{item.plant}</TableCell>
                    <TableCell>{item.itemDesc}</TableCell>
                    <TableCell align="center" sx={{ minWidth: '120px', padding: '8px', overflow: 'visible' }}>
                        <IconButton
                            size="small"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            disabled={deleteLoading}
                            sx={{
                                color: '#f44336',
                                padding: '8px',
                                display: 'inline-flex',
                                '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.15)', color: '#d32f2f' },
                            }}
                            title="Delete this item"
                        >
                            <HiTrash size={20} />
                        </IconButton>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Table size="small" aria-label="vendor-details">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Vendor Name</TableCell>
                                            <TableCell>Package Rank</TableCell>
                                            <TableCell>Initial Price</TableCell>
                                            <TableCell>Final Price</TableCell>
                                            <TableCell>Allocation</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {vendorData.map((vendor, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{vendor.companyName}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        bg={vendor.packageRank === 'L1' ? 'success' : 'secondary'} 
                                                        className="me-1"
                                                    >
                                                        {vendor.packageRank}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{vendor.initialPrice}</TableCell>
                                                <TableCell>{vendor.finalPrice}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        placeholder="Enter allocation"
                                                        sx={{ width: 120 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </>
        );
    };

    return (
        <div className="p-3 pe-2 ps-2 custom-fix">
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell />
                            <TableCell><strong>S.No</strong></TableCell>
                            <TableCell><strong>Item Code</strong></TableCell>
                            <TableCell><strong>Item Name</strong></TableCell>
                            <TableCell><strong>Quantity</strong></TableCell>
                            <TableCell><strong>Target Price</strong></TableCell>
                            <TableCell><strong>Plant</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <ItemRow key={item.id} item={item} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default NFASOBItemWise;
