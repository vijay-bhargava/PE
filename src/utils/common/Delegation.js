import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Checkbox,
    Typography,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Card,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    TextField,
    FormControl,
    InputLabel,
    IconButton,
    InputAdornment,
    Drawer
} from "@mui/material";
import { ExpandMore, Close, Search, FilterList } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { BackButton } from "./component";
import { buildQueryParams } from "./utility";
import { ApiClient } from "../../Apiclient";
import { useStateValue } from "../../store";
import { toast } from "react-toastify";

const Delegation = () => {

    const [{ atoken, customerid, customersuffix }] = useStateValue();
    const apiclient = new ApiClient(customersuffix);

    // Helper function to safely format dates
    const formatDate = (date) => {
        if (!date) return null;
        try {
            // Handle both Date objects and strings
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return 'Invalid Date';
            return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY format
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    // Event types that will become accordions
    const eventTypes = ['RFQ', 'Auction', 'NFA', 'VI', 'QR', 'PR', 'INV', 'VQ'];

    // State for each event type's data and loading status
    const [eventData, setEventData] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [expandedAccordions, setExpandedAccordions] = useState(new Set());
    const [selectedItems, setSelectedItems] = useState({});

    // Delegation Modal State
    const [delegateModal, setDelegateModal] = useState(false);
    const [selectedApprover, setSelectedApprover] = useState(null);
    const [delegateLoading, setDelegateLoading] = useState(false);
    const [approverList, setApproverList] = useState([]);
    const [approverListLoading, setApproverListLoading] = useState(false);
    const [approverListLoaded, setApproverListLoaded] = useState(false);

    // Future Delegation Modal State
    const [futureDelegateModal, setFutureDelegateModal] = useState(false);
    const [selectedFutureApprover, setSelectedFutureApprover] = useState(null);
    const [futureDelegateLoading, setFutureDelegateLoading] = useState(false);
    
    // Enhanced Future Delegation Fields
    const [futureDelegateFrom, setFutureDelegateFrom] = useState(null); // Who is delegating
    const [futureDelegateTo, setFutureDelegateTo] = useState(null); // Who receives delegation
    const [futureEventTypes, setFutureEventTypes] = useState([]); // Selected event types
    const [futureStages, setFutureStages] = useState([]); // Selected stages
    const [futureDateRange, setFutureDateRange] = useState({ fromDate: null, toDate: null }); // Delegation period
    const [futureCombinedStages, setFutureCombinedStages] = useState([]); // Combined stages for future delegation

    // Search and Filter State
    const [searchText, setSearchText] = useState('');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [filteredEventData, setFilteredEventData] = useState({});
    const [userList, setUserList] = useState([]);
    const [selectedUserFilters, setSelectedUserFilters] = useState([]); // Changed to array for multiple selection
    const [userListLoading, setUserListLoading] = useState(false);
    const [userListLoaded, setUserListLoaded] = useState(false);
    const [selectedEventTypeFilters, setSelectedEventTypeFilters] = useState([]); // Event type filter state
    const [selectedStageFilters, setSelectedStageFilters] = useState([]); // Stage filter state
    const [combinedStagesList, setCombinedStagesList] = useState([]); // Combined stages from selected event types
    const [stageLoadingStates, setStageLoadingStates] = useState({}); // Loading states for stages
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null }); // Date range filter state

    const [eventstageList, setEventstageList] = useState([]);

    // Function to load approvers (lazy loading)
    const loadApprovers = async () => {
        if (approverListLoaded || approverListLoading) {
            return; // Don't fetch if already loaded or currently loading
        }

        setApproverListLoading(true);
        try {
            var data = {
                CustomerId: customerid,
                SortingColumn: "Id",
                IsActive: true
            };
            const queryParams = buildQueryParams(data);
            const res = await apiclient.getres(
                `api/User/Find?${queryParams}`,
                atoken
            );

            if (res && res.data?.result) {
                // Handle different response structures
                let responseData = res.data.result;
                if (res.data.result && Array.isArray(res.data.result)) {
                    responseData = res.data.result;
                } else if (Array.isArray(res.data)) {
                    responseData = res.data;
                } else {
                    responseData = [];
                }

                setApproverList(responseData);
                setApproverListLoaded(true);
                console.log('Approvers loaded:', responseData);
            }
        } catch (error) {
            console.error('Error loading approvers:', error);
            toast.error('Failed to load approvers list');
        } finally {
            setApproverListLoading(false);
        }
    };

    // Function to load users for filter (only once)
    const pullUsersList = async () => {
        if (userListLoaded || userListLoading) {
            return; // Don't fetch if already loaded or currently loading
        }

        setUserListLoading(true);
        var data = {
            CustomerId: customerid,
            SortingColumn: "Id",
            IsActive: true
        };
        try {
            const queryParams = buildQueryParams(data);
            const res = await apiclient.getres(
                `api/User/Find?${queryParams}`,
                atoken
            );

            if (res && res.data) {
                // Handle different response structures
                let responseData = res.data;
                if (res.data.result && Array.isArray(res.data.result)) {
                    responseData = res.data.result;
                } else if (Array.isArray(res.data?.result)) {
                    responseData = res.data?.result;
                } else {
                    responseData = [];
                }

                setUserList(responseData);
                setUserListLoaded(true);
                console.log('Users loaded for filter:', responseData);
                console.log('First user structure:', responseData[0]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users list');
        } finally {
            setUserListLoading(false);
        }
    };

    // Pulling Event Stages Based on Event Type
    const pullgetEventStage = async (EventTypeId) => {
        
        if (stageLoadingStates[EventTypeId]) {
            return; // Don't fetch if already loading
        }
        
        setStageLoadingStates(prev => ({ ...prev, [EventTypeId]: true }));
        
        var data = {
            CustomerId: customerid,
            EventType: EventTypeId,
        };

        try {
            const queryParams = buildQueryParams(data);
            const res = await apiclient.getres(
                `api/eventstage/Find?${queryParams}`,
                atoken
            );

            console.log('Event Stage Response for', EventTypeId, ':', res);
            if (res && res.data) {
                // Handle different response structures
                let responseData = res.data;
                if (res.data.result && Array.isArray(res.data.result)) {
                    responseData = res.data.result;
                } else if (Array.isArray(res.data)) {
                    responseData = res.data;
                } else {
                    responseData = [];
                }
                
                // Filter stages where wfid > 0
                const filteredStages = responseData.filter(stage => {
                    const wfId = stage.wfId || 0;
                    console.log(`Stage ${stage.stageName || stage.name}: wfId = ${wfId}, filtering = ${wfId > 0}`);
                    return wfId > 0;
                });
                
                console.log('Original stages for', EventTypeId, ':', responseData);
                console.log('Filtered stages for', EventTypeId, ':', filteredStages);
                
                // Store stages per event type
                setEventstageList(prev => {
                    const updated = {
                        ...prev,
                        [EventTypeId]: filteredStages
                    };
                    console.log('Updated eventstageList:', updated);
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error fetching event stages:', error);
        } finally {
            setStageLoadingStates(prev => ({ ...prev, [EventTypeId]: false }));
        }
    };
    
    // Load stages for selected event types and combine them
    const loadStagesForSelectedEventTypes = async (eventTypes) => {
        if (!eventTypes || eventTypes.length === 0) {
            setCombinedStagesList([]);
            return;
        }
        
        console.log('Loading stages for event types:', eventTypes);
        
        // Load stages for each selected event type
        for (const eventType of eventTypes) {
            await pullgetEventStage(eventType);
        }
    };
    
    // Search functionality
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchText(value);
        filterData(value, selectedUserFilters, selectedEventTypeFilters, selectedStageFilters, dateRange);
    };

    // Filter data based on search text and user filters
    const filterData = (searchValue, userFilters = selectedUserFilters, eventTypeFilters = selectedEventTypeFilters, stageFilters = selectedStageFilters, dateRangeFilter = dateRange) => {
        let filtered = {};

        Object.keys(eventData).forEach(eventType => {
            const eventTypeData = eventData[eventType] || [];
            let filteredData = eventTypeData;

            // Apply search filter
            if (searchValue && searchValue.trim()) {
                const searchLower = searchValue.toLowerCase();
                filteredData = filteredData.filter(item => {
                    return (
                        (item.approverName && item.approverName.toLowerCase().includes(searchLower)) ||
                        (item.eventId && item.eventId.toString().toLowerCase().includes(searchLower)) ||
                        (item.wfStage && item.wfStage.toLowerCase().includes(searchLower)) ||
                        (item.approverEmaiId && item.approverEmaiId.toLowerCase().includes(searchLower))
                    );
                });
            }

            // Apply user filters (multiple users)
            if (userFilters && userFilters.length > 0) {
                filteredData = filteredData.filter(item => {
                    return userFilters.some(userFilter => {
                        return (
                            (item.approverId && item.approverId === userFilter.id) ||
                            (item.approverId && item.approverId === userFilter.userId) ||
                            (item.approverName && item.approverName.toLowerCase() === (userFilter.fullName || userFilter.userName || userFilter.name || '').toLowerCase()) ||
                            (item.approverEmaiId && item.approverEmaiId.toLowerCase() === (userFilter.email || '').toLowerCase())
                        );
                    });
                });
            }

            // Apply stage filters (multiple stages from multiple event types)
            if (stageFilters && stageFilters.length > 0) {
                filteredData = filteredData.filter(item => {
                    return stageFilters.some(stageFilter => {
                        // Match by event type and stage
                        const eventTypeMatch = stageFilter.eventType === eventType;
                        const stageMatch = (
                            (item.wfStage && item.wfStage.toLowerCase() === (stageFilter.stageName || stageFilter.name || '').toLowerCase()) ||
                            (item.stageId && item.stageId === stageFilter.id) ||
                            (item.wfId && item.wfId === stageFilter.wfId)
                        );
                        return eventTypeMatch && stageMatch;
                    });
                });
            }

            // Apply date range filter
            if (dateRangeFilter && (dateRangeFilter.startDate || dateRangeFilter.endDate)) {
                console.log('Applying date range filter:', dateRangeFilter);
                console.log('StartDate type:', typeof dateRangeFilter.startDate, dateRangeFilter.startDate);
                console.log('EndDate type:', typeof dateRangeFilter.endDate, dateRangeFilter.endDate);
                
                filteredData = filteredData.filter(item => {
                    if (!item.createdOn) {
                        console.log('Item without createdOn:', item.eventId);
                        return true; // Include items without date
                    }
                    
                    const itemDate = new Date(item.createdOn);
                    if (isNaN(itemDate.getTime())) {
                        console.log('Invalid item date:', item.createdOn, 'for item:', item.eventId);
                        return true; // Include items with invalid dates
                    }
                    
                    let includeItem = true;
                    
                    if (dateRangeFilter.startDate) {
                        const startDate = dateRangeFilter.startDate instanceof Date 
                            ? new Date(dateRangeFilter.startDate) 
                            : new Date(dateRangeFilter.startDate);
                        
                        if (!isNaN(startDate.getTime())) {
                            startDate.setHours(0, 0, 0, 0);
                            includeItem = includeItem && itemDate >= startDate;
                            console.log(`Item ${item.eventId}: ${itemDate.toLocaleDateString()} >= ${startDate.toLocaleDateString()}? ${itemDate >= startDate}`);
                        }
                    }
                    
                    if (dateRangeFilter.endDate) {
                        const endDate = dateRangeFilter.endDate instanceof Date 
                            ? new Date(dateRangeFilter.endDate) 
                            : new Date(dateRangeFilter.endDate);
                        
                        if (!isNaN(endDate.getTime())) {
                            endDate.setHours(23, 59, 59, 999);
                            includeItem = includeItem && itemDate <= endDate;
                            console.log(`Item ${item.eventId}: ${itemDate.toLocaleDateString()} <= ${endDate.toLocaleDateString()}? ${itemDate <= endDate}`);
                        }
                    }
                    
                    console.log(`Item ${item.eventId} included:`, includeItem);
                    return includeItem;
                });
                console.log('Filtered data count after date filter:', filteredData.length);
            }

            // Apply event type filter - only show accordions for selected event types
            // This will be handled at the accordion level by getFilteredEventTypes()
            filtered[eventType] = filteredData;
        });

        setFilteredEventData(filtered);
    };

    // Toggle filter drawer
    const toggleFilterDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setFilterDrawerOpen(open);
    };

    // Get current data to display (filtered or original)
    const getCurrentEventData = (eventType) => {
        if (searchText.trim() || 
            selectedUserFilters.length > 0 || 
            selectedEventTypeFilters.length > 0 || 
            selectedStageFilters.length > 0 || 
            dateRange.startDate || 
            dateRange.endDate) {
            return filteredEventData[eventType] || [];
        }
        return eventData[eventType] || [];
    };

    // Handle user filter change (multiple selection)
    const handleUserFilterChange = (event, newValue) => {
        console.log('User filter changed:', newValue);
        setSelectedUserFilters(newValue || []);
        filterData(searchText, newValue || [], selectedEventTypeFilters, selectedStageFilters, dateRange);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchText('');
        setSelectedUserFilters([]);
        setSelectedEventTypeFilters([]);
        setSelectedStageFilters([]);
        setCombinedStagesList([]);
        setDateRange({ startDate: null, endDate: null });
        setFilteredEventData(eventData);
        toast.info('All filters cleared');
    };

    // Handle event type filter change
    const handleEventTypeFilterChange = (event, newValue) => {
        console.log('Event type filter changed:', newValue);
        setSelectedEventTypeFilters(newValue || []);
        // Clear stage filters when event types change
        setSelectedStageFilters([]);
        // Load stages for newly selected event types
        loadStagesForSelectedEventTypes(newValue || []);
    };
    
    // Handle stage filter change
    const handleStageFilterChange = (event, newValue) => {
        console.log('Stage filter changed:', newValue);
        setSelectedStageFilters(newValue || []);
    };

    // Handle date range filter change
    const handleDateRangeChange = (field, date) => {
        console.log(`Date range ${field} changed:`, date);
        console.log('Date type:', typeof date, 'Is valid date:', date instanceof Date && !isNaN(date));
        
        setDateRange(prev => {
            const newRange = {
                ...prev,
                [field]: date
            };
            console.log('New date range:', newRange);
            
            // Trigger filtering after state update
            setTimeout(() => {
                filterData(searchText, selectedUserFilters, selectedEventTypeFilters, selectedStageFilters, newRange);
            }, 0);
            return newRange;
        });
    };

    // Get filtered event types to display
    const getFilteredEventTypes = () => {
        if (selectedEventTypeFilters.length > 0) {
            return eventTypes.filter(eventType =>
                selectedEventTypeFilters.includes(eventType)
            );
        }
        return eventTypes;
    };

    // Update filtered data when eventData changes
    useEffect(() => {
        if (searchText.trim() || selectedUserFilters.length > 0 || selectedEventTypeFilters.length > 0 || selectedStageFilters.length > 0 || dateRange.startDate || dateRange.endDate) {
            filterData(searchText, selectedUserFilters, selectedEventTypeFilters, selectedStageFilters, dateRange);
        } else {
            setFilteredEventData(eventData);
        }
    }, [eventData, searchText, selectedUserFilters, selectedEventTypeFilters, selectedStageFilters, dateRange]);

    // useEffect to combine stages when eventstageList or selectedEventTypeFilters change
    useEffect(() => {
        if (selectedEventTypeFilters.length === 0) {
            setCombinedStagesList([]);
            return;
        }
        
        // Combine stages from all selected event types
        const combinedStages = [];
        selectedEventTypeFilters.forEach(eventType => {
            const stages = eventstageList[eventType] || [];
            console.log(`Combining stages for ${eventType}:`, stages);
            stages.forEach(stage => {
                combinedStages.push({
                    ...stage,
                    eventType: eventType,
                    displayLabel: `${eventType} - ${stage.stageName || stage.name || 'Unknown Stage'}`,
                    uniqueId: `${eventType}_${stage.id || stage.stageId || stage.wfId}`
                });
            });
        });
        
        console.log('Final combined stages:', combinedStages);
        setCombinedStagesList(combinedStages);
    }, [eventstageList, selectedEventTypeFilters]);

    // useEffect to combine stages for future delegation
    useEffect(() => {
        if (futureEventTypes.length === 0) {
            setFutureCombinedStages([]);
            return;
        }
        
        // Combine stages from all selected future event types
        const combinedStages = [];
        futureEventTypes.forEach(eventType => {
            const stages = eventstageList[eventType] || [];
            console.log(`Combining future delegation stages for ${eventType}:`, stages);
            stages.forEach(stage => {
                combinedStages.push({
                    ...stage,
                    eventType: eventType,
                    displayLabel: `${eventType} - ${stage.stageName || stage.name || 'Unknown Stage'}`,
                    uniqueId: `${eventType}_${stage.id || stage.stageId || stage.wfId}`
                });
            });
        });
        
        console.log('Final combined future delegation stages:', combinedStages);
        setFutureCombinedStages(combinedStages);
    }, [eventstageList, futureEventTypes]);

    // Fetch data for a specific event type
    const fetchEventTypeData = async (eventType) => {
        setLoadingStates(prev => ({ ...prev, [eventType]: true }));

        try {
            var data = {
                CustomerId: customerid,
                Status: "Pending",
                EventType: eventType
            };
            const queryParams = buildQueryParams(data);
            const res = await apiclient.getres(
                `api/eventapprover/Find?${queryParams}`,
                atoken
            );

            if (res && res.data) {
                // Handle different response structures
                let responseData = res.data;

                // If data is wrapped in a result property
                if (res.data.result && Array.isArray(res.data.result)) {
                    responseData = res.data.result;
                }
                // If data is directly an array
                else if (Array.isArray(res.data)) {
                    responseData = res.data;
                }
                // If data is an object with items property
                else if (res.data.items && Array.isArray(res.data.items)) {
                    responseData = res.data.items;
                }
                else {
                    responseData = [];
                }

                setEventData(prev => ({
                    ...prev,
                    [eventType]: responseData
                }));

                console.log(`${eventType} data:`, responseData);
            }
        } catch (error) {
            console.error(`Error fetching data for ${eventType}:`, error);
            toast.error(`Failed to load ${eventType} data`);
            // Set empty array on error
            setEventData(prev => ({
                ...prev,
                [eventType]: []
            }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [eventType]: false }));
        }
    };

    // Handle accordion expand/collapse
    const handleAccordionChange = (eventType) => (event, isExpanded) => {
        setExpandedAccordions(prev => {
            const newSet = new Set(prev);
            if (isExpanded) {
                newSet.add(eventType);
                // Fetch data only when accordion is expanded for the first time
                if (!eventData[eventType]) {
                    fetchEventTypeData(eventType);
                }
            } else {
                newSet.delete(eventType);
            }
            return newSet;
        });
    };

    // Handle individual row checkbox
    const handleRowCheckbox = (eventType, itemId, checked) => {
        setSelectedItems(prev => ({
            ...prev,
            [eventType]: {
                ...prev[eventType],
                [itemId]: checked
            }
        }));
    };

    // Handle select all checkbox for an event type
    const handleSelectAll = async (eventType, checked) => {
        // If data is not loaded yet and checkbox is being checked, fetch data first
        if (checked && !eventData[eventType]) {
            setLoadingStates(prev => ({ ...prev, [eventType]: true }));

            try {
                var data = {
                    CustomerId: customerid,
                    Status: "Pending",
                    EventType: eventType
                };
                const queryParams = buildQueryParams(data);
                const res = await apiclient.getres(
                    `api/eventapprover/Find?${queryParams}`,
                    atoken
                );

                if (res && res.data) {
                    // Handle different response structures
                    let responseData = res.data;

                    // If data is wrapped in a result property
                    if (res.data.result && Array.isArray(res.data.result)) {
                        responseData = res.data.result;
                    }
                    // If data is directly an array
                    else if (Array.isArray(res.data)) {
                        responseData = res.data;
                    }
                    // If data is an object with items property
                    else if (res.data.items && Array.isArray(res.data.items)) {
                        responseData = res.data.items;
                    }
                    else {
                        responseData = [];
                    }

                    setEventData(prev => ({
                        ...prev,
                        [eventType]: responseData
                    }));

                    console.log(`${eventType} data loaded and will be selected:`, responseData);

                    // Now select all the fetched items
                    const newSelections = {};
                    responseData.forEach(item => {
                        const itemId = item.id || item.eventId;
                        newSelections[itemId] = true; // Always true since we're selecting all
                    });

                    setSelectedItems(prev => ({
                        ...prev,
                        [eventType]: newSelections
                    }));

                    // Auto-expand the accordion to show the selected items
                    setExpandedAccordions(prev => {
                        const newSet = new Set(prev);
                        newSet.add(eventType);
                        return newSet;
                    });

                    toast.success(`${eventType} data loaded and ${responseData.length} items selected`);
                } else {
                    toast.warning(`No data found for ${eventType}`);
                }
            } catch (error) {
                console.error(`Error fetching data for ${eventType}:`, error);
                toast.error(`Failed to load ${eventType} data`);
            } finally {
                setLoadingStates(prev => ({ ...prev, [eventType]: false }));
            }
        } else {
            // Data already exists, proceed with normal select/deselect
            const eventTypeData = eventData[eventType] || [];
            const newSelections = {};

            eventTypeData.forEach(item => {
                // Use id as primary identifier, fallback to eventId
                const itemId = item.id || item.eventId;
                newSelections[itemId] = checked;
            });

            setSelectedItems(prev => ({
                ...prev,
                [eventType]: newSelections
            }));
        }
    };

    // Delegation Modal Functions
    const openDelegateModal = () => {
        // Get all selected items across all event types
        const allSelectedItems = Object.entries(selectedItems).reduce((acc, [eventType, items]) => {
            const selectedIds = Object.entries(items)
                .filter(([id, selected]) => selected)
                .map(([id]) => id);
            if (selectedIds.length > 0) {
                acc[eventType] = selectedIds;
            }
            return acc;
        }, {});

        if (Object.keys(allSelectedItems).length === 0) {
            toast.error("Please select at least one item to delegate", {
                toastId: "no-selection"
            });
            return;
        }

        setDelegateModal(true);
    };

    const closeDelegateModal = () => {
        setDelegateModal(false);
        setSelectedApprover(null);
    };

    const handleDelegateSubmit = async () => {
        if (!selectedApprover) {
            toast.error("Please select an approver", {
                toastId: "no-approver"
            });
            return;
        }

        setDelegateLoading(true);
        try {
            // Get all selected items with their full data
            const delegationData = [];

            Object.entries(selectedItems).forEach(([eventType, items]) => {
                const eventTypeData = eventData[eventType] || [];
                Object.entries(items).forEach(([itemId, isSelected]) => {
                    if (isSelected) {
                        const item = eventTypeData.find(data =>
                            (data.id && data.id.toString() === itemId) ||
                            (data.eventId && data.eventId.toString() === itemId)
                        );

                        if (item) {
                            delegationData.push({
                                approverRef_id: item.id || 0,
                                preApproverId: item.approverId || 0,
                                approverId: selectedApprover.id || selectedApprover.userId,
                                approverName: selectedApprover.name,
                                approverEmailId: selectedApprover.email,
                                approverSeq: item.approverSeq || 0,
                                eventId: item.eventId || 0,
                                eventType: item.eventType || eventType,
                                approverType: item.approverType || '',
                                wfStage: item.wfStage || '',
                                wfId: item.wfId || 0,
                                stageId: item.stageId || 0,
                                fromDate: null,
                                toDate: null,
                            });
                        }
                    }
                });
            });

            const res = await apiclient.postres(`api/eventapprover/EventApproverDelegate`, delegationData, atoken);

            if (res) {
                toast.success("Delegation completed successfully", {
                    toastId: "delegate-success"
                });
                closeDelegateModal();

                // Clear selections and refresh data
                setSelectedItems({});

                // Refresh data for loaded event types
                Object.keys(eventData).forEach(eventType => {
                    if (eventData[eventType] && eventData[eventType].length > 0) {
                        fetchEventTypeData(eventType);
                    }
                });
            }
        } catch (error) {
            console.error('Delegation error:', error);
            toast.error("Failed to delegate approvals", {
                toastId: "delegate-error"
            });
        } finally {
            setDelegateLoading(false);
        }
    };

    // Future Delegation Modal Functions
    const openFutureDelegateModal = () => {
        // Future delegation doesn't require item selection
        // It's for setting up future delegation rules
        setFutureDelegateModal(true);
    };

    const closeFutureDelegateModal = () => {
        setFutureDelegateModal(false);
        // Reset all future delegation fields
        setSelectedFutureApprover(null);
        setFutureDelegateFrom(null);
        setFutureDelegateTo(null);
        setFutureEventTypes([]);
        setFutureStages([]);
        setFutureDateRange({ fromDate: null, toDate: null });
        setFutureCombinedStages([]);
    };

    // Handle future delegation event type change
    const handleFutureEventTypeChange = (event, newValue) => {
        console.log('Future delegation event type changed:', newValue);
        setFutureEventTypes(newValue || []);
        // Clear stage filters when event types change
        setFutureStages([]);
        // Load stages for newly selected event types
        loadStagesForFutureDelegation(newValue || []);
    };

    // Load stages for future delegation event types
    const loadStagesForFutureDelegation = async (eventTypes) => {
        if (!eventTypes || eventTypes.length === 0) {
            setFutureCombinedStages([]);
            return;
        }
        
        console.log('Loading stages for future delegation event types:', eventTypes);
        
        // Load stages for each selected event type
        for (const eventType of eventTypes) {
            await pullgetEventStage(eventType);
        }
    };

    // Handle future delegation stage change
    const handleFutureStageChange = (event, newValue) => {
        console.log('Future delegation stage changed:', newValue);
        setFutureStages(newValue || []);
    };

    // Handle future delegation date range change
    const handleFutureDateRangeChange = (field, date) => {
        console.log(`Future delegation ${field} changed:`, date);
        
        setFutureDateRange(prev => ({
            ...prev,
            [field]: date
        }));
    };

    // Validate future delegation form
    const validateFutureDelegationForm = () => {
        const errors = [];

        // Check if delegate from and to are selected
        if (!futureDelegateFrom) {
            errors.push("Please select who is delegating (Delegate From)");
        }
        if (!futureDelegateTo) {
            errors.push("Please select who will receive the delegation (Delegate To)");
        }

        // Check if delegate from and to are different
        if (futureDelegateFrom && futureDelegateTo) {
            const fromId = futureDelegateFrom.id || futureDelegateFrom.userId;
            const toId = futureDelegateTo.id || futureDelegateTo.userId;
            if (fromId === toId) {
                errors.push("Delegate From and Delegate To cannot be the same person");
            }
        }

        // Check event types
        if (!futureEventTypes || futureEventTypes.length === 0) {
            errors.push("Please select at least one event type");
        }

        // Check stages - now mandatory
        if (!futureStages || futureStages.length === 0) {
            errors.push("Please select at least one stage");
        }

        // Check dates
        if (!futureDateRange.fromDate) {
            errors.push("Please select delegation start date");
        }
        if (!futureDateRange.toDate) {
            errors.push("Please select delegation end date");
        }

        if (futureDateRange.fromDate && futureDateRange.toDate) {
            const fromDate = new Date(futureDateRange.fromDate);
            const toDate = new Date(futureDateRange.toDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if dates are in the future
            if (fromDate < today) {
                errors.push("Delegation start date must be today or a future date");
            }
            if (toDate < today) {
                errors.push("Delegation end date must be today or a future date");
            }

            // Check if to date is not less than from date
            if (toDate < fromDate) {
                errors.push("Delegation end date cannot be earlier than start date");
            }
        }

        return errors;
    };

    const handleFutureDelegateSubmit = async () => {
        // Validate the form
        const validationErrors = validateFutureDelegationForm();
        if (validationErrors.length > 0) {
            validationErrors.forEach(error => {
                toast.error(error, {
                    toastId: error.substring(0, 20) // Use first 20 chars as unique ID
                });
            });
            return;
        }

        setFutureDelegateLoading(true);
        try {
            // Create individual delegation objects for each selected stage
            const futureDelegationData = [];
            
            // Loop through each selected stage and create a separate delegation rule
            futureStages.forEach(stage => {
                const delegationRule = {
                    preApproverId: futureDelegateFrom.id || futureDelegateFrom.userId,
                    approverId: futureDelegateTo.id || futureDelegateTo.userId,
                    eventType: stage.eventType, // Individual event type for this stage
                    wfStage: stage.stageName || stage.name, // Stage name
                    wfId: stage.wfId, // Workflow ID
                    stageId: stage.id || stage.stageId, // Stage ID
                    fromDate: futureDateRange.fromDate.toISOString(),
                    toDate: futureDateRange.toDate.toISOString(),
                    customerId: customerid,
                };
                futureDelegationData.push(delegationRule);
            });
            
            console.log('Future delegation data to submit (array of objects):', futureDelegationData);
            console.log(`Creating ${futureDelegationData.length} delegation rules for selected stages`);

            // TODO: Replace with actual future delegation API endpoint
            const res = await apiclient.postres(`api/eventapprover/FutureApproverDelegate`, futureDelegationData, atoken);

            if (res) {
                toast.success(`Future delegation rules created successfully (${futureDelegationData.length} rules)`, {
                    toastId: "future-delegate-success"
                });
                closeFutureDelegateModal();
            }
        } catch (error) {
            console.error('Future delegation error:', error);
            toast.error("Failed to create future delegation rule", {
                toastId: "future-delegate-error"
            });
        } finally {
            setFutureDelegateLoading(false);
        }
    };

    // Check if all items in event type are selected
    const isAllSelected = (eventType) => {
        const eventTypeData = eventData[eventType] || [];
        const selections = selectedItems[eventType] || {};

        return eventTypeData.length > 0 &&
            eventTypeData.every(item => {
                const itemId = item.id || item.eventId;
                return selections[itemId] === true;
            });
    };

    // Check if some items in event type are selected
    const isSomeSelected = (eventType) => {
        const selections = selectedItems[eventType] || {};
        return Object.values(selections).some(selected => selected === true);
    };

    // Get count of selected items for display
    const getSelectedCount = (eventType) => {
        const selections = selectedItems[eventType] || {};
        return Object.values(selections).filter(selected => selected === true).length;
    };

    // Render table for event type data
    const renderEventTypeTable = (eventType, data) => {
        if (!data || data.length === 0) {
            return (
                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                    No pending approvals found for {eventType}
                </Typography>
            );
        }

        return (
            <TableContainer component={Paper} sx={{ maxHeight: 400, border: 'none', boxShadow: 'none' }}>
                <Table stickyHeader size="small" className="table table-hover">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableCell padding="checkbox" sx={{ width: 50, fontWeight: 'bold' }}>
                                {/* <Checkbox
                                    checked={isAllSelected(eventType)}
                                    indeterminate={!isAllSelected(eventType) && isSomeSelected(eventType)}
                                    onChange={(e) => handleSelectAll(eventType, e.target.checked)}
                                    size="small"
                                /> */}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Event ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Approver</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Stage</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Sequence</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Created Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item, index) => {
                            const itemId = item.id || item.eventId || index;
                            return (
                                <TableRow
                                    key={itemId}
                                    hover
                                    sx={{
                                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                        '&:hover': { backgroundColor: '#e3f2fd' }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedItems[eventType]?.[itemId] || false}
                                            onChange={(e) => handleRowCheckbox(eventType, itemId, e.target.checked)}
                                            size="small"
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem' }}>{item.eventId || '-'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <strong>{item.approverName || '-'}</strong>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                {item.approverEmaiId || '-'}
                                            </div>
                                            {item.createdByName && (
                                                <div style={{ fontSize: '0.65rem', color: '#999', fontStyle: 'italic' }}>
                                                    Created by: {item.createdByName}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem' }}>
                                        <div>
                                            <strong>{item.wfStage || '-'}</strong>
                                            {item.stageId && (
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                    Stage ID: {item.stageId}
                                                </div>
                                            )}
                                            {item.version && (
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                    v{item.version}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem' }}>
                                        <Chip
                                            label={item.approverSeq || 0}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem' }}>
                                        {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Chip
                                                label={item.status || 'Pending'}
                                                size="small"
                                                color={item.status === 'Pending' ? 'warning' :
                                                    item.status === 'Approved' ? 'success' :
                                                        item.status === 'Rejected' ? 'error' : 'default'}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                            {item.remarks && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        color: '#666',
                                                        fontStyle: 'italic',
                                                        maxWidth: 150,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    title={item.remarks}
                                                >
                                                    {item.remarks}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <>
            {/* Header Section */}
            <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                    <BackButton title={<span className="page-heading">Manage Delegation</span>} />
                </div>

                {/* Content Section */}
                <div className="flex-grow-1 overflow-auto p-3">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">
                            Event Types Delegation
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {/* Search Bar */}
                            <TextField
                                size="small"
                                placeholder="Search by approver, event ID, stage..."
                                value={searchText}
                                onChange={handleSearchChange}
                                sx={{ width: 300 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: 'action.active' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Advanced Filter Button */}
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={toggleFilterDrawer(true)}
                                sx={{
                                    minWidth: 'auto',
                                    px: 2
                                }}
                            >
                                Filters
                            </Button>

                            {/* Stats Chips */}
                            <Chip
                                label={`${eventTypes.length} Event Types`}
                                size="small"
                                color="info"
                                variant="outlined"
                            />
                            <Chip
                                label={`${Object.keys(eventData).length} Loaded`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>

                    {/* Event Type Accordions */}
                    <Box sx={{ width: '100%' }}>
                        {getFilteredEventTypes().map((eventType) => {
                            const data = getCurrentEventData(eventType);
                            const originalData = eventData[eventType] || [];
                            const isLoading = loadingStates[eventType];
                            const isExpanded = expandedAccordions.has(eventType);
                            const selectedCount = getSelectedCount(eventType);

                            return (
                                <Card key={eventType} sx={{ mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: 2 }}>
                                    <Accordion
                                        expanded={isExpanded}
                                        onChange={handleAccordionChange(eventType)}
                                        sx={{
                                            boxShadow: 'none',
                                            '&:before': { display: 'none' },
                                            borderRadius: 2
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls={`${eventType}-content`}
                                            id={`${eventType}-header`}
                                            sx={{
                                                backgroundColor: isExpanded ? '#e3f2fd' : '#f5f5f5',
                                                minHeight: 56,
                                                borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                                                '&:hover': {
                                                    backgroundColor: '#e1f5fe'
                                                },
                                                '& .MuiAccordionSummary-content': {
                                                    alignItems: 'center'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Tooltip
                                                    title={
                                                        !data.length && !isLoading ?
                                                            `Check this box to load and select all ${eventType} approvals` :
                                                            data.length > 0 ?
                                                                `Select/deselect all ${data.length} ${eventType} approvals` :
                                                                `Loading ${eventType} data...`
                                                    }
                                                    placement="top"
                                                >
                                                    <Checkbox
                                                        checked={isAllSelected(eventType)}
                                                        indeterminate={!isAllSelected(eventType) && isSomeSelected(eventType)}
                                                        onChange={async (e) => {
                                                            e.stopPropagation();
                                                            await handleSelectAll(eventType, e.target.checked);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        sx={{ mr: 2 }}
                                                        color="primary"
                                                        disabled={loadingStates[eventType]}
                                                    />
                                                </Tooltip>
                                                <Typography variant="h6" sx={{ fontWeight: 'medium', flexGrow: 1, color: '#1976d2' }}>
                                                    {eventType}
                                                </Typography>
                                                {isExpanded && data.length > 0 && (
                                                    <Chip
                                                        label={searchText.trim() ?
                                                            `${selectedCount}/${data.length} selected (${originalData.length} total)` :
                                                            `${selectedCount}/${data.length} selected`
                                                        }
                                                        size="small"
                                                        color={selectedCount > 0 ? "primary" : "default"}
                                                        sx={{ mr: 2, fontWeight: 'bold' }}
                                                    />
                                                )}
                                                {!isExpanded && data.length > 0 && (
                                                    <Chip
                                                        label={searchText.trim() ?
                                                            `${data.length} of ${originalData.length} items` :
                                                            `${data.length} items`
                                                        }
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                        sx={{ mr: 2 }}
                                                    />
                                                )}
                                                {!isExpanded && !data.length && !isLoading && originalData.length === 0 && (
                                                    <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                                                        Check to load & select all
                                                    </Typography>
                                                )}
                                                {!isExpanded && !data.length && !isLoading && originalData.length > 0 && searchText.trim() && (
                                                    <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                                                        No matches found
                                                    </Typography>
                                                )}
                                                {isLoading && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                                        <Typography variant="caption" color="textSecondary">
                                                            Loading...
                                                        </Typography>
                                                    </Box>
                                                )}

                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            {isLoading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                    <CircularProgress size={24} />
                                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                                        Loading {eventType} data...
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                renderEventTypeTable(eventType, data)
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                </Card>
                            );
                        })}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            {Object.values(selectedItems).reduce((total, eventTypeSelections) => {
                                return total + Object.values(eventTypeSelections).filter(selected => selected).length;
                            }, 0)} items selected across all event types
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setSelectedItems({});
                                    toast.info('All selections cleared');
                                }}
                                disabled={Object.keys(selectedItems).length === 0}
                            >
                                Clear Selections
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={clearAllFilters}
                                disabled={!searchText.trim() && selectedUserFilters.length === 0 && selectedEventTypeFilters.length === 0 && !dateRange.startDate && !dateRange.endDate}
                                color="secondary"
                            >
                                Clear Filters
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setExpandedAccordions(new Set());
                                    setEventData({});
                                    setSelectedItems({});
                                    toast.info('All data cleared');
                                }}
                            >
                                Reset All
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={openDelegateModal}
                                disabled={Object.values(selectedItems).every(eventTypeSelections =>
                                    Object.values(eventTypeSelections).every(selected => !selected)
                                )}
                            >
                                Delegate Selected
                            </Button>

                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={openFutureDelegateModal}
                            >
                                Future Delegate
                            </Button>
                        </Box>
                    </Box>
                </div>
            </div>

            {/* Advanced Filter Drawer */}
            <Drawer
                anchor="right"
                open={filterDrawerOpen}
                onClose={toggleFilterDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 400,
                        padding: 0
                    }
                }}
            >
                <Box sx={{ width: 400 }}>
                    {/* Drawer Header */}
                    <Box sx={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6">
                            Advanced Filters
                        </Typography>
                        <IconButton
                            onClick={toggleFilterDrawer(false)}
                            sx={{ color: 'white' }}
                            size="small"
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Drawer Content */}
                    <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Apply advanced filters to refine your delegation data.
                        </Typography>

                        {/* User/Approver Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                Filter by Approver(s)
                            </Typography>
                            <Autocomplete
                                multiple
                                options={userList}
                                loading={userListLoading}
                                getOptionLabel={(option) =>
                                    option.fullName || option.userName || option.name || ''
                                }
                                value={selectedUserFilters}
                                onChange={handleUserFilterChange}
                                onOpen={() => {
                                    // Call pullUsersList when dropdown opens
                                    pullUsersList();
                                }}
                                disableCloseOnSelect
                                filterSelectedOptions
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select User(s)/Approver(s)"
                                        variant="outlined"
                                        placeholder="Search and select multiple approvers..."
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {userListLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <div style={{ width: '100%' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {option.fullName || option.userName || option.name}
                                            </Typography>
                                            {option.email && (
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                    {option.email}
                                                </Typography>
                                            )}
                                            {option.designation && (
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                    {option.designation}
                                                </Typography>
                                            )}
                                        </div>
                                    </Box>
                                )}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            label={option.fullName || option.userName || option.name}
                                            {...getTagProps({ index })}
                                            key={option.id || option.userId || index}
                                            size="small"
                                            color="primary"
                                            variant="filled"
                                        />
                                    ))
                                }
                                isOptionEqualToValue={(option, value) => {
                                    // More robust comparison for multiple selection
                                    if (!option || !value) return false;
                                    return (option.id && value.id && option.id === value.id) ||
                                        (option.userId && value.userId && option.userId === value.userId) ||
                                        (option.id && value.userId && option.id === value.userId) ||
                                        (option.userId && value.id && option.userId === value.id);
                                }}
                                clearText="Clear all filters"
                                noOptionsText={userListLoading ? "Loading users..." : "No users found"}
                                loadingText="Loading users..."
                                limitTags={3}
                                getLimitTagsText={(more) => `+${more} more`}
                            />
                            {selectedUserFilters.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                                        Filtering by {selectedUserFilters.length} user(s):
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedUserFilters.map((user, index) => (
                                            <Chip
                                                key={user.id || user.userId || index}
                                                label={user.fullName || user.userName || user.name}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                                onDelete={() => {
                                                    const newFilters = selectedUserFilters.filter((_, i) => i !== index);
                                                    handleUserFilterChange(null, newFilters);
                                                }}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Event Type Filter Section */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                Filter by Event Type(s)
                            </Typography>
                            <Autocomplete
                                multiple
                                options={eventTypes}
                                getOptionLabel={(option) => option}
                                value={selectedEventTypeFilters}
                                onChange={handleEventTypeFilterChange}
                                disableCloseOnSelect
                                filterSelectedOptions
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Event Type(s)"
                                        variant="outlined"
                                        placeholder="Search and select event types..."
                                        size="small"
                                        fullWidth
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {option}
                                        </Typography>
                                    </Box>
                                )}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                            key={option}
                                            size="small"
                                            color="info"
                                            variant="filled"
                                        />
                                    ))
                                }
                                clearText="Clear all event type filters"
                                noOptionsText="No event types found"
                                limitTags={3}
                                getLimitTagsText={(more) => `+${more} more`}
                            />
                            {selectedEventTypeFilters.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                                        Showing {selectedEventTypeFilters.length} of {eventTypes.length} event type(s):
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selectedEventTypeFilters.map((eventType, index) => (
                                            <Chip
                                                key={eventType}
                                                label={eventType}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                                onDelete={() => {
                                                    const newFilters = selectedEventTypeFilters.filter(type => type !== eventType);
                                                    handleEventTypeFilterChange(null, newFilters);
                                                }}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                        
                        {/* Stage Filter Section - Conditional on Event Type Selection */}
                        {selectedEventTypeFilters.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                    Filter by Stage(s)
                                </Typography>
                                <Autocomplete
                                    multiple
                                    options={combinedStagesList}
                                    getOptionLabel={(option) => option.displayLabel || `${option.eventType} - ${option.stageName || option.name || 'Unknown Stage'}`}
                                    value={selectedStageFilters}
                                    onChange={handleStageFilterChange}
                                    loading={Object.values(stageLoadingStates).some(loading => loading)}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Stage(s) from Event Types"
                                            variant="outlined"
                                            placeholder="Search and select stages..."
                                            size="small"
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {Object.values(stageLoadingStates).some(loading => loading) ? 
                                                            <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <div style={{ width: '100%' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {option.displayLabel}
                                                </Typography>
                                                {option.description && (
                                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                        {option.description}
                                                    </Typography>
                                                )}
                                            </div>
                                        </Box>
                                    )}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => (
                                            <Chip
                                                label={option.displayLabel}
                                                {...getTagProps({ index })}
                                                key={option.uniqueId}
                                                size="small"
                                                color="success"
                                                variant="filled"
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        ))
                                    }
                                    isOptionEqualToValue={(option, value) => 
                                        option.uniqueId === value.uniqueId
                                    }
                                    clearText="Clear all stage filters"
                                    noOptionsText={combinedStagesList.length === 0 ? "Select event types first" : "No stages found"}
                                    loadingText="Loading stages..."
                                    limitTags={2}
                                    getLimitTagsText={(more) => `+${more} more`}
                                />
                                {selectedStageFilters.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                                            Filtering by {selectedStageFilters.length} stage(s):
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selectedStageFilters.map((stage, index) => (
                                                <Chip 
                                                    key={stage.uniqueId}
                                                    label={stage.displayLabel}
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    onDelete={() => {
                                                        const newFilters = selectedStageFilters.filter(s => s.uniqueId !== stage.uniqueId);
                                                        handleStageFilterChange(null, newFilters);
                                                    }}
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Date Range Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                Filter by Date Range
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <MobileDatePicker
                                            label="Start Date"
                                            value={dateRange.startDate}
                                            onChange={(date) => handleDateRangeChange('startDate', date)}
                                            slotProps={{
                                                textField: {
                                                    variant: "outlined",
                                                    size: "small",
                                                    fullWidth: true
                                                },
                                            }}
                                            format="dd/MM/yyyy"
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <MobileDatePicker
                                            label="End Date"
                                            value={dateRange.endDate}
                                            onChange={(date) => handleDateRangeChange('endDate', date)}
                                            slotProps={{
                                                textField: {
                                                    variant: "outlined",
                                                    size: "small",
                                                    fullWidth: true
                                                },
                                            }}
                                            format="dd/MM/yyyy"
                                        />
                                    </Box>
                                </Box>
                            </LocalizationProvider>
                            {(dateRange.startDate || dateRange.endDate) && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                                        Active Date Range:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {dateRange.startDate && (
                                            <Chip 
                                                label={`From: ${formatDate(dateRange.startDate)}`}
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                                onDelete={() => handleDateRangeChange('startDate', null)}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        )}
                                        {dateRange.endDate && (
                                            <Chip 
                                                label={`To: ${formatDate(dateRange.endDate)}`}
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                                onDelete={() => handleDateRangeChange('endDate', null)}
                                                sx={{ fontSize: '0.75rem' }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Current Search Info */}
                        {searchText.trim() && (
                            <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                                    Current Search:
                                </Typography>
                                <Chip
                                    label={`"${searchText}"`}
                                    size="small"
                                    color="primary"
                                    onDelete={() => {
                                        setSearchText('');
                                        filterData('', selectedUserFilters, selectedEventTypeFilters, selectedStageFilters, dateRange);
                                    }}
                                    sx={{ mb: 1 }}
                                />
                                <Typography variant="caption" display="block" color="textSecondary">
                                    Searching in: Approver names, Event IDs, Stages, Emails
                                </Typography>
                            </Box>
                        )}

                        {/* Filter Summary */}
                        {(searchText.trim() || selectedUserFilters.length > 0 || selectedEventTypeFilters.length > 0 || selectedStageFilters.length > 0 || dateRange.startDate || dateRange.endDate) && (
                            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Active Filters:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {searchText.trim() && (
                                        <Chip
                                            label={`Search: "${searchText}"`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    )}
                                    {selectedUserFilters.length > 0 && (
                                        <Chip
                                            label={`Users: ${selectedUserFilters.length} selected`}
                                            size="small"
                                            variant="outlined"
                                            color="secondary"
                                        />
                                    )}
                                    {selectedEventTypeFilters.length > 0 && (
                                        <Chip
                                            label={`Event Types: ${selectedEventTypeFilters.length} selected`}
                                            size="small"
                                            variant="outlined"
                                            color="info"
                                        />
                                    )}
                                    {selectedStageFilters.length > 0 && (
                                        <Chip
                                            label={`Stages: ${selectedStageFilters.length} from ${new Set(selectedStageFilters.map(s => s.eventType)).size} event type(s)`}
                                            size="small"
                                            variant="outlined"
                                            color="success"
                                        />
                                    )}
                                    {(dateRange.startDate || dateRange.endDate) && (
                                        <Chip
                                            label={`Date Range: ${formatDate(dateRange.startDate) || '...'} - ${formatDate(dateRange.endDate) || '...'}`}
                                            size="small"
                                            variant="outlined"
                                            color="warning"
                                        />
                                    )}
                                </Box>
                                {selectedUserFilters.length > 0 && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                        {selectedUserFilters.map(user => user.fullName || user.userName || user.name).join(', ')}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Drawer Footer */}
                    <Box sx={{
                        p: 2,
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: '#f5f5f5'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={clearAllFilters}
                                disabled={!searchText.trim() && selectedUserFilters.length === 0 && selectedEventTypeFilters.length === 0 && selectedStageFilters.length === 0 && !dateRange.startDate && !dateRange.endDate}
                            >
                                Clear All
                            </Button>
                            <Button
                                variant="contained"
                                onClick={toggleFilterDrawer(false)}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Delegation Modal */}
            <Dialog
                open={delegateModal}
                onClose={closeDelegateModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2
                }}>
                    <Typography variant="h6" component="div">
                        Delegate Approvals
                    </Typography>
                    <IconButton
                        onClick={closeDelegateModal}
                        size="small"
                        sx={{ color: 'white' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Selected {Object.values(selectedItems).reduce((total, eventTypeSelections) => {
                                return total + Object.values(eventTypeSelections).filter(selected => selected).length;
                            }, 0)} item(s) for delegation. Please select an approver below.
                        </Typography>

                        {/* Show selected items summary */}
                        <Box sx={{ mb: 3 }}>
                            {Object.entries(selectedItems).map(([eventType, items]) => {
                                const selectedCount = Object.values(items).filter(selected => selected).length;
                                if (selectedCount === 0) return null;

                                return (
                                    <Chip
                                        key={eventType}
                                        label={`${eventType}: ${selectedCount} items`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>

                    <FormControl fullWidth>
                        <Autocomplete
                            options={approverList}
                            loading={approverListLoading}
                            getOptionLabel={(option) =>
                                option.fullName || option.userName || option.name || ''
                            }
                            value={selectedApprover}
                            onChange={(event, newValue) => {
                                setSelectedApprover(newValue);
                            }}
                            onOpen={() => {
                                // Call loadApprovers when dropdown opens
                                loadApprovers();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Approver"
                                    variant="outlined"
                                    placeholder="Search and select approver..."
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {approverListLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <div>
                                        <Typography variant="body2">
                                            {option.fullName || option.userName || option.name}
                                        </Typography>
                                        {option.email && (
                                            <Typography variant="caption" color="textSecondary">
                                                {option.email}
                                            </Typography>
                                        )}
                                        {option.designation && (
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                {option.designation}
                                            </Typography>
                                        )}
                                    </div>
                                </Box>
                            )}
                            isOptionEqualToValue={(option, value) =>
                                (option.id === value.id) || (option.userId === value.userId)
                            }
                            noOptionsText={approverListLoading ? "Loading approvers..." : "No approvers found"}
                            loadingText="Loading approvers..."
                        />
                    </FormControl>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={closeDelegateModal}
                        variant="outlined"
                        disabled={delegateLoading}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        onClick={handleDelegateSubmit}
                        variant="contained"
                        loading={delegateLoading}
                        disabled={!selectedApprover}
                        loadingPosition="start"
                    >
                        Submit Delegation
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Future Delegation Modal */}
            <Dialog
                open={futureDelegateModal}
                onClose={closeFutureDelegateModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    backgroundColor: '#9c27b0',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2
                }}>
                    <Typography variant="h6" component="div">
                        Create Future Delegation Rule
                    </Typography>
                    <IconButton
                        onClick={closeFutureDelegateModal}
                        size="small"
                        sx={{ color: 'white' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Create a detailed delegation rule that will automatically delegate future approval requests based on specified criteria.
                        </Typography>

                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                                Future Delegation Features:
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                • Configure who delegates to whom<br/>
                                • Select specific event types and stages<br/>
                                • Set time period for delegation<br/>
                                • Automatic delegation for matching requests
                            </Typography>
                        </Box>
                    </Box>

                    {/* Delegate From */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Delegate From <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Autocomplete
                            options={approverList}
                            loading={approverListLoading}
                            getOptionLabel={(option) =>
                                option.fullName || option.userName || option.name || ''
                            }
                            value={futureDelegateFrom}
                            onChange={(event, newValue) => {
                                setFutureDelegateFrom(newValue);
                            }}
                            onOpen={() => {
                                loadApprovers();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Who is delegating their approvals?"
                                    variant="outlined"
                                    placeholder="Search and select the person delegating..."
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {approverListLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <div>
                                        <Typography variant="body2">
                                            {option.fullName || option.userName || option.name}
                                        </Typography>
                                        {option.email && (
                                            <Typography variant="caption" color="textSecondary">
                                                {option.email}
                                            </Typography>
                                        )}
                                        {option.designation && (
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                {option.designation}
                                            </Typography>
                                        )}
                                    </div>
                                </Box>
                            )}
                            isOptionEqualToValue={(option, value) =>
                                (option.id === value.id) || (option.userId === value.userId)
                            }
                            noOptionsText={approverListLoading ? "Loading approvers..." : "No approvers found"}
                            loadingText="Loading approvers..."
                        />
                    </FormControl>

                    {/* Delegate To */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Delegate To <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Autocomplete
                            options={approverList}
                            loading={approverListLoading}
                            getOptionLabel={(option) =>
                                option.fullName || option.userName || option.name || ''
                            }
                            value={futureDelegateTo}
                            onChange={(event, newValue) => {
                                setFutureDelegateTo(newValue);
                            }}
                            onOpen={() => {
                                loadApprovers();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Who will receive the delegated approvals?"
                                    variant="outlined"
                                    placeholder="Search and select the delegate..."
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {approverListLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <div>
                                        <Typography variant="body2">
                                            {option.fullName || option.userName || option.name}
                                        </Typography>
                                        {option.email && (
                                            <Typography variant="caption" color="textSecondary">
                                                {option.email}
                                            </Typography>
                                        )}
                                        {option.designation && (
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                                {option.designation}
                                            </Typography>
                                        )}
                                    </div>
                                </Box>
                            )}
                            isOptionEqualToValue={(option, value) =>
                                (option.id === value.id) || (option.userId === value.userId)
                            }
                            noOptionsText={approverListLoading ? "Loading approvers..." : "No approvers found"}
                            loadingText="Loading approvers..."
                        />
                    </FormControl>

                    {/* Event Types */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Event Types <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Autocomplete
                            multiple
                            options={eventTypes}
                            getOptionLabel={(option) => option}
                            value={futureEventTypes}
                            onChange={handleFutureEventTypeChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Event Types"
                                    variant="outlined"
                                    placeholder="Choose applicable event types..."
                                    size="small"
                                />
                            )}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => (
                                    <Chip
                                        label={option}
                                        {...getTagProps({ index })}
                                        key={option}
                                        size="small"
                                        color="primary"
                                        variant="filled"
                                    />
                                ))
                            }
                        />
                    </FormControl>

                    {/* Stages */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Stages <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <Autocomplete
                            multiple
                            options={futureCombinedStages}
                            getOptionLabel={(option) => option.displayLabel || ''}
                            value={futureStages}
                            onChange={handleFutureStageChange}
                            disabled={futureEventTypes.length === 0}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Stages"
                                    variant="outlined"
                                    placeholder={futureEventTypes.length === 0 ? "First select event types..." : "Choose specific stages..."}
                                    size="small"
                                    required
                                />
                            )}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => (
                                    <Chip
                                        label={option.displayLabel}
                                        {...getTagProps({ index })}
                                        key={option.uniqueId}
                                        size="small"
                                        color="secondary"
                                        variant="filled"
                                    />
                                ))
                            }
                            isOptionEqualToValue={(option, value) =>
                                option.uniqueId === value.uniqueId
                            }
                            noOptionsText={futureEventTypes.length === 0 ? "Select event types first" : "No stages found"}
                        />
                    </FormControl>

                    {/* Date Range */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <FormControl fullWidth>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                                From Date <span style={{ color: 'red' }}>*</span>
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <MobileDatePicker
                                    value={futureDateRange.fromDate}
                                    onChange={(date) => handleFutureDateRangeChange('fromDate', date)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            variant="outlined"
                                            placeholder="Select start date"
                                        />
                                    )}
                                    minDate={new Date()}
                                />
                            </LocalizationProvider>
                        </FormControl>

                        <FormControl fullWidth>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                                To Date <span style={{ color: 'red' }}>*</span>
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <MobileDatePicker
                                    value={futureDateRange.toDate}
                                    onChange={(date) => handleFutureDateRangeChange('toDate', date)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            variant="outlined"
                                            placeholder="Select end date"
                                        />
                                    )}
                                    minDate={futureDateRange.fromDate || new Date()}
                                />
                            </LocalizationProvider>
                        </FormControl>
                    </Box>

                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                            <strong>Note:</strong> This rule will automatically delegate future approval requests that match the specified criteria during the selected date range. Ensure all details are correct before creating the rule.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={closeFutureDelegateModal}
                        variant="outlined"
                        disabled={futureDelegateLoading}
                    >
                        Cancel
                    </Button>
                    <LoadingButton
                        onClick={handleFutureDelegateSubmit}
                        variant="contained"
                        color="secondary"
                        loading={futureDelegateLoading}
                        loadingPosition="start"
                    >
                        Create Delegation Rule
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );

};

export default Delegation;