import React, { PureComponent, useCallback, useState, useEffect, useRef } from 'react';
import { Autocomplete, Avatar, Badge as Badgemui, Button, ButtonGroup, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, InputAdornment, Menu, MenuItem, Select, Skeleton, TextField, Card, CardContent, Typography, Box, Paper, Chip, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Grid, Stack, Tooltip as MuiTooltip } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import { HiDotsVertical, HiFilter, HiOutlineArrowSmRight, HiOutlineFilter, HiOutlineSearch, HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { FiAward, FiActivity, FiUsers, FiDollarSign, FiCalendar, FiClock, FiCheckSquare } from 'react-icons/fi';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PieChart, Pie, Sector, BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, Cell } from 'recharts';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import { onlyNumbers, convertISOToFormattedDate, fndecrypt, handleUploadFiles, uploadFilesOnAzure, formatToDDMMYYYY, formatDateToDDMMYYYY, DownloadFile, getFirstNCharacters } from "../../utils/common";

import { actionTypes, useStateValue } from "../../../src/store";
import { GetActivities, GetDashboardActivities } from '../../utils/activities';
import CustomerLogo from '../../components/customerlogo';
import MessageCell from '../CommunucationHub/Cells/MessageCell';
import ListSkeleton from '../../components/Skeleton/listSkeleton';
import { formatDateViaLocale, formatDateViaTime, formatDateViaTimeZone, formatoption, formattimeoption } from '../../utils/common/utility';
import { ApiClient, api } from '../../Apiclient';
import { useCookies } from 'react-cookie';
import { BackButton } from '../../utils/common/component';
import CustomCard from '../../global/components/Card'
import { Heading3, Heading4, Text, TextSmall } from '../../global/components/Text';

const Dashboard = (props) => {
  
  const navigate = useNavigate();
  const [{ atoken, rtoken, customerid, userDetail, customersuffix, dashboardFilter }, dispatch] = useStateValue();
  const apiclient = new ApiClient(customersuffix);
  
  // Add CSS for blinking animation
  useEffect(() => {
    const styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
    styleElement.sheet.insertRule(`
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.2; }
        100% { opacity: 1; }
      }
    `);
    
    styleElement.sheet.insertRule(`
      @keyframes live-pulse {
        0% { 
          opacity: 1; 
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
        }
        50% { 
          opacity: 0.8; 
          box-shadow: 0 0 0 4px rgba(76, 175, 80, 0);
        }
        100% { 
          opacity: 1; 
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
        }
      }
    `);
    
    styleElement.sheet.insertRule(`
      .live-badge-blink {
        animation: blink 1s infinite !important;
      }
    `);
    
    styleElement.sheet.insertRule(`
      .live-circle-indicator {
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background-color: #4caf50 !important;
        display: inline-block !important;
        margin-right: 8px !important;
        animation: live-pulse 1.5s ease-in-out infinite !important;
        flex-shrink: 0 !important;
      }
    `);
    styleElement.sheet.insertRule(`
  .not-live-circle-indicator {
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background-color: #9e9e9e !important; /* grey for not live */
    display: inline-block !important;
    margin-right: 8px !important;
    flex-shrink: 0 !important;
  }
`);
    
    styleElement.sheet.insertRule(`
      .dashboard-live-badge {
        display: inline-flex !important;
        align-items: center !important;
      }
    `);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [activityRecordData, setActivityRecorddata] = useState([]);
  const [activityRecordDataType, setActivityRecorddataType] = useState([]);
  const [todayScheduleData, setTodayScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gridloading, setGridloading] = useState(true);
  const [cookies, setCookie] = useCookies(["patkn", "prtkn"]);
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [kpiFilters, setKpiFilters] = useState({
    0: dashboardFilter || 'Last 7 days',
    1: dashboardFilter || 'Last 7 days', 
    2: dashboardFilter || 'Last 7 days',
    3: dashboardFilter || 'Last 7 days'
  });

  // Activity filter states
  const [activityFilters, setActivityFilters] = useState({
    eventTypes: [],
    stages: [],
    timeRanges: []
  });
  // Temporary filter states for "Apply Filter" functionality
  const [tempActivityFilters, setTempActivityFilters] = useState({
    eventTypes: [],
    stages: [],
    timeRanges: []
  });
  const [tempCustomDateRange, setTempCustomDateRange] = useState({
    startDate: null,
    endDate: null
  });

  // Events date dropdown states
  const [selectedEventsDate, setSelectedEventsDate] = useState(() => {
    const initialDate = new Date();
    console.log('🔄 Initial selectedEventsDate set to:', initialDate);
    console.log('🔄 Initial date string:', initialDate.toDateString());
    return initialDate;
  });
  const [eventsDateDropdownOpen, setEventsDateDropdownOpen] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [showModalFilters, setShowModalFilters] = useState(false);
  const [modalSearchText, setModalSearchText] = useState('');

  // Dashboard data state - moved before useEffect to avoid initialization errors
  const [DashboardEventList, setDashboardEventList] = useState([]);
  const [eventCntData, setEventCntData] = useState([]);
  const [supplierCntData, setSupplierCntData] = useState([]);
  const [totalSavingData, setTotalSavingData] = useState([]);
  const [totalSuppliersData, setTotalSuppliersData] = useState([]);
  const [openRFQStageCount, setOpenRFQStageCount] = useState(null);
  const [OpenBIDStageCount, setOpenBIDStageCount] = useState(null);
  const [OpenPOStageCount, setOpenPOStageCount] = useState(null);
  const [rfqData, setRfqData] = useState([]);
  const [data4, setData4] = useState([]);
  const [showTotalSupplierBreakdown, setShowTotalSupplierBreakdown] = useState(false);
  const [showSavingsBreakdown, setShowSavingsBreakdown] = useState(false);

  
  const filterOptions = ['Today', 'Last 7 days', 'Last 30 days', 'All time'];

  const handleKpiFilterChange = (cardIndex, value) => {
    // Update global state when filter changes
    dispatch({ type: actionTypes.SET_DASHBOARD_FILTER, value });
    setKpiFilters(prev => {
      const newFilters = {
        ...prev,
        [cardIndex]: value
      };
      return newFilters;
    });
  };

  // Dynamic filter options from API data
  const getEventTypeOptions = () => {
    const uniqueEventTypes = [...new Set(activityRecordData.map(item => item.eventType).filter(Boolean))];
    return uniqueEventTypes.length > 0 ? uniqueEventTypes : ['RFQ', 'Auction', 'NFA', 'PR', 'PO', 'Bid', 'Contract'];
  };

  const getStageOptions = () => {
    const uniqueStages = [...new Set(activityRecordData.map(item => item.stage || item.status).filter(Boolean))];
    return uniqueStages.length > 0 ? uniqueStages : ['Draft', 'Published', 'Bidding', 'Evaluation', 'Award', 'Closed', 'Cancelled'];
  };

  const timeRangeOptions = ['Today', 'This Week', 'This Month', 'Last 30 Days', 'All Time', 'Custom Range'];
  
  // Custom date range state
  const [customDateRange, setCustomDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Handle activity filter changes (for temporary state)
  const handleActivityFilterChange = (filterType, value, isChecked) => {
    setTempActivityFilters(prev => {
      const currentValues = prev[filterType];
      let newValues;
      
      if (isChecked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter(item => item !== value);
      }

      // Handle custom range selection
      if (filterType === 'timeRanges' && value === 'Custom Range') {
        if (isChecked) {
          setShowCustomDatePicker(true);
        } else {
          setShowCustomDatePicker(false);
          setTempCustomDateRange({ startDate: null, endDate: null });
        }
      }
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
  };

  // Apply temporary filters to actual filters
  const applyFilters = () => {
    setActivityFilters(tempActivityFilters);
    setCustomDateRange(tempCustomDateRange);
    setAnchorEl(null); // Close filter menu
  };

  // Clear all activity filters
  const clearActivityFilters = () => {
    const emptyFilters = {
      eventTypes: [],
      stages: [],
      timeRanges: []
    };
    const emptyDateRange = { startDate: null, endDate: null };
    
    setActivityFilters(emptyFilters);
    setTempActivityFilters(emptyFilters);
    setCustomDateRange(emptyDateRange);
    setTempCustomDateRange(emptyDateRange);
    setShowCustomDatePicker(false);
  };

  // Filter activities based on selected filters and search text
  const getFilteredActivities = () => {
    let filtered = [...activityRecordData];
    
    // Filter by search text (for modal)
    if (modalSearchText.trim()) {
      const searchLower = modalSearchText.toLowerCase().trim();
      filtered = filtered.filter(activity => 
        activity.activityDescription?.toLowerCase().includes(searchLower) ||
        activity.eventType?.toLowerCase().includes(searchLower) ||
        activity.stageName?.toLowerCase().includes(searchLower) ||
        activity.stage?.toLowerCase().includes(searchLower) ||
        activity.status?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by event types
    if (activityFilters.eventTypes.length > 0) {
      filtered = filtered.filter(activity => 
        activityFilters.eventTypes.includes(activity.eventType)
      );
    }
    
    // Filter by stages
    if (activityFilters.stages.length > 0) {
      filtered = filtered.filter(activity => 
        activityFilters.stages.includes(activity.stage || activity.status)
      );
    }
    
    // Filter by time ranges
    if (activityFilters.timeRanges.length > 0) {
      const now = new Date();
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.endDate || activity.createdOn);
        
        return activityFilters.timeRanges.some(range => {
          switch (range) {
            case 'Today':
              return activityDate.toDateString() === now.toDateString();
            case 'This Week':
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              return activityDate >= weekStart;
            case 'This Month':
              return activityDate.getMonth() === now.getMonth() && 
                     activityDate.getFullYear() === now.getFullYear();
            case 'Last 30 Days':
              const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
              return activityDate >= thirtyDaysAgo;
            case 'All Time':
              return true;
            case 'Custom Range':
              if (customDateRange.startDate && customDateRange.endDate) {
                const startDate = new Date(customDateRange.startDate);
                const endDate = new Date(customDateRange.endDate);
                return activityDate >= startDate && activityDate <= endDate;
              }
              return true;
            default:
              return true;
          }
        });
      });
    }
    
    return filtered;
  };

  // Update filtered activities when filters change
  useEffect(() => {
    const filtered = getFilteredActivities();
    setFilteredActivities(filtered);
    setActivityRecorddataType(filtered);
  }, [activityFilters, activityRecordData, modalSearchText]);

  // Get active filter count
  const getActiveFilterCount = () => {
    return activityFilters.eventTypes.length + activityFilters.stages.length + activityFilters.timeRanges.length;
  };

  // Handle view all activities
  const handleViewAllActivities = () => {
    setShowActivitiesModal(true);
    setShowModalFilters(false); // Hide filters by default when modal opens
    // Initialize temporary filters with current filter values when opening modal
    setTempActivityFilters(activityFilters);
    setTempCustomDateRange(customDateRange);
  };


  const spanRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    pullGetActivities();
    if (spanRef.current) {

      spanRef.current.click();
    }

  }, []);

  useEffect(() => {
    pullDashboardData();
    dispatch({ type: actionTypes.SET_Bidtype, value: null });
    setCookie("pcbt", "", { path: "/", maxAge: 0 });
    setIsInitialLoad(false); // Mark initial load complete
  }, []);

  // Update dashboard data when any KPI filters change (but skip initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      pullDashboardData();
    }
  }, [kpiFilters]); // Watch all KPI filters

  // Watch for changes to global dashboardFilter from Header
  useEffect(() => {
    if (dashboardFilter && !isInitialLoad) {
      console.log('🔄 Dashboard filter changed from Header:', dashboardFilter);
      // Update all KPI filters to match the global filter
      setKpiFilters({
        0: dashboardFilter,
        1: dashboardFilter,
        2: dashboardFilter,
        3: dashboardFilter
      });
    }
  }, [dashboardFilter]); // Watch global dashboardFilter from Header

  // Update supplier participation when KPI filter changes
  useEffect(() => {
    // Force re-render when supplier participation filter changes
    // This ensures both the chart and KPI value update
    // The component will re-render automatically due to state changes
  }, [kpiFilters[0], supplierCntData]); // Use index 0 instead of 3

  // Add state to force re-render of KPI cards
  const [kpiUpdateTrigger, setKpiUpdateTrigger] = useState(0);

  // Update KPI cards when filters change
  useEffect(() => {
    setKpiUpdateTrigger(prev => prev + 1);
  }, [kpiFilters, supplierCntData, eventCntData, openRFQStageCount, OpenBIDStageCount, OpenPOStageCount]);

  const dataNew = [
    {
      name: 'Jan',
      EI: 4000,
      PA: 2400,
      AW: 2400,
      amt: 2400,
    },
    {
      name: 'Feb',
      EI: 3000,
      PA: 2400,
      AW: 1400,
      amt: 2210,
    },
    {
      name: 'Mar',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2290,
    },
    {
      name: 'Apr',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2000,
    },
    {
      name: 'May',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2181,
    },
    {
      name: 'Jun',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2500,
    },
    {
      name: 'Jul',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2100,
    },
    {
      name: 'Aug',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2100,
    },
    {
      name: 'Sep',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2100,
    },
    {
      name: 'Oct',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2100,
    },
    {
      name: 'Nov',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2100,
    },
    {
      name: 'Dec',
      EI: 2400,
      PA: 1400,
      AW: 2400,
      amt: 2100,
    }
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState({
    rfq: false,
    reverseAuction: false,
    forwardAuction: false,
    coalAuction: false,
    auction5: false,
    auction6: false,
    auction7: false,
    auction8: false,
    auction9: false,
    auction10: false,
    auction11: false,
    auction12: false,
    auction13: false,
    auction14: false,
    auction15: false
  });
  const items = [
    { label: 'RFQ', value: 'rfq' },
    { label: 'Reverse Auction', value: 'reverseAuction' },
    { label: 'Forward Auction', value: 'forwardAuction' },
    { label: 'Formula Based Auction', value: 'formulaBasedAuction' },
    { label: 'Auction 5', value: 'auction5' },
    { label: 'Auction 6', value: 'auction6' },
    { label: 'Auction 7', value: 'auction7' },
    { label: 'Auction 8', value: 'auction8' },
    { label: 'Auction 9', value: 'auction9' },
    { label: 'Auction 10', value: 'auction10' },
    { label: 'Auction 11', value: 'auction11' },
    { label: 'Auction 12', value: 'auction12' },
    { label: 'Auction 13', value: 'auction13' },
    { label: 'Auction 14', value: 'auction14' },
    { label: 'Auction 15', value: 'auction15' }
  ];

  const handleActivityButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
    setAnchorEl(document.getElementById('AllClick'));  // Open Menu next to the button
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectAll = () => {
    setSelectedItems({
      rfq: true,
      reverseAuction: true,
      forwardAuction: true,
      coalAuction: true,
      auction5: true,
      auction6: true,
      auction7: true,
      auction8: true,
      auction9: true,
      auction10: true,
      auction11: true,
      auction12: true,
      auction13: true,
      auction14: true,
      auction15: true
    });
  };

  const handleClearAll = () => {
    setSelectedItems({
      rfq: false,
      reverseAuction: false,
      forwardAuction: false,
      coalAuction: false,
      auction5: false,
      auction6: false,
      auction7: false,
      auction8: false,
      auction9: false,
      auction10: false,
      auction11: false,
      auction12: false,
      auction13: false,
      auction14: false,
      auction15: false
    });
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [item]: !prevState[item]
    }));
  };

  const pullGetActivities = () => {
    setLoading(true);

    GetDashboardActivities(atoken).then((res) => {
     
      setGridloading(true)
      if (res) {
        // Handle response as object with activityDetails and todayScheduleDashboardDetailDto
        if (res.activityDetails || res.todayScheduleDashboardDetailDto) {
          // Map activityDetails to Pending Activities
          const pendingActivities = res.activityDetails || [];
          setActivityRecorddata(pendingActivities);
          setActivityRecorddataType(pendingActivities);
          getactivityDetails('N', pendingActivities)

          // Map todayScheduleDashboardDetailDto to Events Calendar
          const eventsSchedule = res.todayScheduleDashboardDetailDto || [];
          setTodayScheduleData(eventsSchedule);
          
        } else if (res?.length) {
          // Fallback to array-based response structure
          if (Array.isArray(res) && res.length >= 2) {
            const pendingActivities = res[0] || [];
            setActivityRecorddata(pendingActivities);
            setActivityRecorddataType(pendingActivities);
            getactivityDetails('N', pendingActivities)

            const eventsSchedule = res[1] || [];
            setTodayScheduleData(eventsSchedule);
          } else {
            // Fallback to single array response
            setActivityRecorddata(res);
            setActivityRecorddataType(res);
            getactivityDetails('N', res)
            setTodayScheduleData([]);
          }
        } else {
          setActivityRecorddata([]);
          setActivityRecorddataType([]);
          setTodayScheduleData([]);
        }
      }
      else {
        setActivityRecorddata([]);
        setActivityRecorddataType([]);
        setTodayScheduleData([]);
      }
      setLoading(false);
      setGridloading(false)
    });
  };

  const activityAccessURL = (actionUrl) => {
    
    navigate('/' + actionUrl);
  };

  const getactivityDetails = (actionType, activityRecordData) => {
    let filteredData = [];

    if (actionType === 'N') {
      filteredData = activityRecordData?.filter(rowData => rowData.status === 'N');
      setBorderClass('border-yellow');
      setTextClass('text-yellow');
    } else if (actionType === 'Y') {
      filteredData = activityRecordData?.filter(rowData => rowData.status === 'Y');
      setBorderClass('border-green');
      setTextClass('text-green');
    } else if (actionType === 'Over') {
      const yesterdayDay = new Date();
      yesterdayDay.setDate(yesterdayDay.getDate() - 1);

      filteredData = activityRecordData?.filter(rowData => {
        const itemDate = new Date(rowData?.receiptDt);
        return rowData.status === 'N' && itemDate < yesterdayDay;
      });

      setBorderClass('border-red');
      setTextClass('text-red');
    } else {
      filteredData = activityRecordData;
      setBorderClass(''); // Default border class if actionType doesn't match
    }

    setActivityRecorddataType(filteredData);
  };

const pullDashboardData = async () => {
  try {
    // Step 1: Map KPI filter (index 3) to API values
    const timeRangeMap = {
      'Today': 'TODAY',
      'Last 7 days': 'LAST7',
      'Last 30 days': 'LASTMONTH',
      'All time': 'ALL',
    };

    // Step 2: Get user-selected filter from KPI filters or fallback to 'Last 7 days'
    const selectedTimeRange = kpiFilters[0] || 'Last 7 days'; // Use first filter (shown in UI)
    
    // Step 3: Map to filterType (API value)
    const filterType = timeRangeMap[selectedTimeRange] || 'LAST7';

    // Step 4: Build GET URL with query parameters
    const customerId = customerid || "Customerid";
    const url = `/api/activitydetail/GetDashboardEventCnt?customerId=${customerId}&filterType=${filterType}`;

    // Step 5: Make GET request
    const res = await apiclient.get(url, atoken);

    // ---- Response Handling ----

    // Handle direct response structure (new)
    if (res && (res.eventCnt || res.supplierCnt || res.totalSaving || res.totalSuppliers)) {
      if (res.eventCnt) {
        setEventCntData(res.eventCnt);

        const rfqOpenStage = res.eventCnt.find(
          (event) => event.eventType === 'RFQ' && event.stage === 'Open'
        );
        if (rfqOpenStage) setOpenRFQStageCount(rfqOpenStage.stageCount);

        const bidOpenStage = res.eventCnt.find(
          (event) => event.eventType === 'Auction'
        );
        if (bidOpenStage) setOpenBIDStageCount(bidOpenStage.stageCount);
        else setOpenBIDStageCount(0);

        const poOpenStage = res.eventCnt.find(
          (event) => event.eventType === 'PO' && event.stage === 'New'
        );
        if (poOpenStage) setOpenPOStageCount(poOpenStage.stageCount);
        else setOpenPOStageCount(0);
      }

      if (res.supplierCnt) {
        console.log('📊 Raw supplier data from API:', res.supplierCnt);
        setSupplierCntData(res.supplierCnt);
      } else {
        console.log('❌ No supplierCnt data in direct response');
      }

      if (res.totalSaving) {
        setTotalSavingData(res.totalSaving);
      } else {
        console.log('❌ No totalSaving data in direct response');
      }

      if (res.totalSuppliers) {
        console.log('📊 Raw totalSuppliers data from API:', res.totalSuppliers);
        setTotalSuppliersData(res.totalSuppliers);
      } else {
        console.log('❌ No totalSuppliers data in direct response');
      }
    }

    // Handle nested response structure (old)
    else if (res && res?.result) {
      if (res?.result?.eventCnt) {
        setEventCntData(res.result.eventCnt);

        const rfqOpenStage = res.result.eventCnt.find(
          (event) => event.eventType === 'RFQ' && event.stage === 'Open'
        );
        if (rfqOpenStage) setOpenRFQStageCount(rfqOpenStage.stageCount);

        const bidOpenStage = res.result.eventCnt.find(
          (event) => event.eventType === 'Auction'
        );
        if (bidOpenStage) setOpenBIDStageCount(bidOpenStage.stageCount);
        else setOpenBIDStageCount(0);

        const poOpenStage = res.result.eventCnt.find(
          (event) => event.eventType === 'PO' && event.stage === 'New'
        );
        if (poOpenStage) setOpenPOStageCount(poOpenStage.stageCount);
        else setOpenPOStageCount(0);
      }

      if (res?.result?.supplierCnt) {
        setSupplierCntData(res.result.supplierCnt);
      } else {
        console.log('❌ No supplierCnt data in nested response');
      }

      if (res?.result?.totalSaving) {
        setTotalSavingData(res.result.totalSaving);
      } else {
        console.log('❌ No totalSaving data in nested response');
      }

      if (res?.result?.totalSuppliers) {
        console.log('📊 Raw totalSuppliers data from API (nested):', res.result.totalSuppliers);
        setTotalSuppliersData(res.result.totalSuppliers);
      } else {
        console.log('❌ No totalSuppliers data in nested response');
      }

      if (res?.result?.eventAct) {
        setDashboardEventList(res.result.eventAct);
      }
    }

    // Handle eventMonthAct (if available)
    if ((res && res?.eventMonthAct) || (res && res?.result?.eventMonthAct)) {
      const eventMonthData = res?.eventMonthAct || res?.result?.eventMonthAct;
      const rfqData = eventMonthData.filter(event => event.eventType === 'RFQ');
      setRfqData(rfqData);

      const uniqueMonths = [...new Set(rfqData.map(event => event.monthNam))];
      const monthOrder = uniqueMonths.sort((a, b) => {
        const aMonthIndex = new Date(`${a} 1, 2025`).getMonth();
        const bMonthIndex = new Date(`${b} 1, 2025`).getMonth();
        return aMonthIndex - bMonthIndex;
      });

      const formattedData = rfqData.map((event) => ({
        name: event.monthNam,
        EI: event.countInvitedVendor,
        PA: event.countParticipatedVendor,
        AW: event.countAwardedVendor,
      }));

      const sortedData = formattedData.sort((a, b) => {
        return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
      });

      setData4(sortedData);
    }

  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
  }
};






  const [borderClass, setBorderClass] = useState(''); // State to store border class
  const [textClass, setTextClass] = useState(''); // State to store border class



  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Initialize temporary filters with current filter values when opening menu
    setTempActivityFilters(activityFilters);
    setTempCustomDateRange(customDateRange);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const data = [
    { name: "Orders Accepted", value: 400, fill: '#83a6ed' },
    { name: "Invoice Raised", value: 300 }
  ];

  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (status) => {
    setSelectedButton(status);
    getactivityDetails(status, activityRecordData); // Call the function as before
  };
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text className='f10' x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          fill="none"
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill="#333"
          className='f12'
        >{`PV ${value}`}</text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill="#999"
          className='f10'
        >
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const [activeIndex, setActiveIndex] = useState(0);
  // Removed old onPieEnter callback - now handled by hover state

  // box 3

  const data3 = [
    {
      name: 'A',
      uv: 3000,
      pv: 1398,
      amt: 2400,
    },
    {
      name: 'B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];



  const data1 = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];
  const [skelloading, setSkelLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      try {
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSkelLoading(false); // Set loading to false once data is loaded
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  // Format activity description and show tooltip if truncated
  const formatActivityDescription = (description, maxLength = 40) => {
    if (!description) return '';
    const isTruncated = description.length > maxLength;
    const shortText = isTruncated ? description.slice(0, maxLength) + '…' : description;
    return (
      <MuiTooltip
        title={isTruncated ? description : ''}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: '#fff',
              color: '#616161',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }
          },
          arrow: {
            sx: {
              color: '#fff',
            }
          }
        }}
      >
        <span style={{ cursor: isTruncated ? 'pointer' : 'default' }}>

          {shortText}
        </span>
      </MuiTooltip>
    );
  };

 

  // New donut chart data for event types with hover state
  const [activePieIndex, setActivePieIndex] = useState(-1);
  
  // Handle pie chart click
  const onPieClick = (_, index) => {
    setSelectedIndex(index);
    setShowTotalSupplierBreakdown(false); // Reset supplier breakdown when selecting event type
    // Set the selected event type for supplier chart interaction
    const eventStatusData = getEventStatusData();
    if (eventStatusData[index]) {
      setSelectedEventType(eventStatusData[index].name);
    }
  };
  
  const resetSelection = () => {
    setSelectedIndex(-1);
    setSelectedEventType(null);
    setShowTotalSupplierBreakdown(false); // Also reset supplier breakdown
  };
  
  // Process eventCnt data for donut chart - group by eventType and sum stageCounts
  const getEventStatusData = () => {

    
    if (!eventCntData || eventCntData.length === 0) {
      
      // Fallback data
      const fallbackData = [
        { name: "RFQ", value: openRFQStageCount || 0, fill: '#6366f1' },
        { name: "Auction", value: OpenBIDStageCount || 0, fill: '#f59e0b' },
        { name: "NFA", value: 0, fill: '#10b981' },
        { name: "PR", value: OpenPOStageCount || 0, fill: '#8b5cf6' }
      ];
      

      return fallbackData;
    }

    
    // Group by eventType and sum stageCounts
    const eventTypeMap = {};
    eventCntData.forEach((event, index) => {
      
      if (eventTypeMap[event.eventType]) {
        eventTypeMap[event.eventType] += event.stageCount || 0;
      } else {
        eventTypeMap[event.eventType] = event.stageCount || 0;
      }
      
    });


    // Color mapping for different event types
    const colorMap = {
      'RFQ': '#6366f1',
      'Auction': '#f59e0b', 
      'NFA': '#10b981',
      'PR': '#8b5cf6',
      'PO': '#ef4444',
      'Bid': '#f97316',
      'Contract': '#84cc16'
    };


    // Convert to chart data format
    const chartData = Object.entries(eventTypeMap).map(([eventType, totalCount]) => {
      const color = colorMap[eventType] || '#6b7280';
      
      return {
        name: eventType,
        value: totalCount,
        fill: color
      };
    });


    // Calculate percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    const finalData = chartData.map(item => {
      const percent = total > 0 ? `${Math.round((item.value / total) * 100)}%` : '0%';
      
      return {
        ...item,
        percent: percent
      };
    });

    
    
    // Sort by value (highest to lowest)
    return finalData.sort((a, b) => b.value - a.value);
  };

  // Process supplierCnt data for supplier participation chart based on selected time range
const getSupplierParticipationData = () => {
  // If showing total supplier breakdown (when Supplier Status card is clicked)
  if (showTotalSupplierBreakdown && totalSuppliersData && totalSuppliersData.length > 0) {
    const totalSupplierInfo = totalSuppliersData[0];
    return [
      {
        name: 'Total Suppliers',
        totalSuppliers: totalSupplierInfo.totalSupplier || 0,
        activeSuppliers: 0, // Don't show active suppliers bar for total suppliers row
        count: totalSupplierInfo.totalSupplier || 0
      },
      {
        name: 'Active Suppliers', 
        totalSuppliers: 0, // Don't show total suppliers bar for active suppliers row
        activeSuppliers: totalSupplierInfo.activeSupplier || 0,
        count: totalSupplierInfo.activeSupplier || 0
      }
    ];
  }

  // If a specific event type is selected in donut chart, show stages for that event type
  if (selectedEventType && eventCntData && eventCntData.length > 0) {
    // const filteredStages = eventCntData.filter(item => item.eventType === selectedEventType);
        const filteredStages = eventCntData
      .filter(item => item.eventType === selectedEventType)
      .sort((a, b) => (a.stageSeq || 0) - (b.stageSeq || 0));
    const stageData = filteredStages.map(stage => ({
      name: stage.stageName || stage.stage || 'Unknown Stage',
      count: stage.stageCount || 0
    }));
    return stageData;
  }

  // Default behavior - show supplier participation by event type
  if (!supplierCntData || supplierCntData.length === 0) {
    // Return empty array if no data available
    return [];
  }

  // ✅ supplierCntData is already filtered by pullDashboardData (based on filterType)

  const eventTypeMap = {};
  supplierCntData.forEach(item => {
    if (eventTypeMap[item.eventType]) {
      eventTypeMap[item.eventType].invited += item.invitedSuppliers || 0;
      eventTypeMap[item.eventType].participated += item.participatedSuppliers || 0;
    } else {
      eventTypeMap[item.eventType] = {
        invited: item.invitedSuppliers || 0,
        participated: item.participatedSuppliers || 0
      };
    }
  });

  const chartData = Object.entries(eventTypeMap).map(([eventType, data]) => ({
    name: eventType,
    invited: data.invited,
    participated: data.participated
  }));

  // Debug logging
  console.log('📊 Supplier Participation Data:', chartData);
  
  return chartData;
};


  // Event status data - Updated to use processed data
  const eventStatusData = getEventStatusData();

  // Remove drill-down functionality - keeping it simple
  const totalEvents = eventStatusData.reduce((sum, item) => sum + item.value, 0);

  // Format date for display
  const getCurrentDate = () => {
    const date = new Date();
    const locale = userDetail?.dateLocale || 'en-US';
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(locale, options);
  };

  // Events dropdown helper functions
  const getEventsNext7Days = () => {
    const days = [];
    const today = new Date();
    
    // Debug: Log what "today" actually is
    console.log('🗓️ Today calculated as:', today);
    console.log('🗓️ Today date string:', today.toDateString());
    console.log('🗓️ Today ISO string:', today.toISOString());
    
    // Show next 7 days including today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label;
      if (i === 0) {
        label = 'Today';
        console.log('🎯 "Today" option date object:', date);
      } else if (i === 1) {
        label = 'Tomorrow';
      } else {
        const day = date.getDate();
        // Force English locale for consistent month display
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        label = `${day} ${month} ${year}`;
      }
      
      days.push({
        value: date.toDateString(),
        label: label,
        date: date
      });
    }
    
    return days;
  };

  const getEventsSelectedDateLabel = () => {
    const today = new Date();
    const selectedDateOnly = new Date(selectedEventsDate.getFullYear(), selectedEventsDate.getMonth(), selectedEventsDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = selectedDateOnly.getTime() - todayOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      const day = selectedEventsDate.getDate();
      // Force English locale for consistent month display to match dropdown options
      const month = selectedEventsDate.toLocaleDateString('en-US', { month: 'short' });
      const year = selectedEventsDate.getFullYear();
      return `${day} ${month} ${year}`;
    }
  };

  const handleEventsDateSelect = (dateOption) => {
    setSelectedEventsDate(dateOption.date);
    setEventsDateDropdownOpen(false);
  };

  const getEventsForSelectedDate = () => {
    if (!todayScheduleData || todayScheduleData.length === 0) return [];
    if (!selectedEventsDate) return [];

    // Normalize selected date to start of day (remove time component)
    const selectedDateOnly = new Date(selectedEventsDate.getFullYear(), selectedEventsDate.getMonth(), selectedEventsDate.getDate());
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = selectedDateOnly.getTime() === todayOnly.getTime();
    
    console.log('🎯 Filtering events for selected date:', selectedDateOnly.toDateString());
    console.log('📅 Is Today selected:', isToday);
    console.log('📅 Total events to filter:', todayScheduleData.length);
    
    const filtered = todayScheduleData.filter(event => {
      // For today's filter, we need to check if the event is active/scheduled for today
      if (isToday) {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        
        // Skip events with invalid start dates (year < 1900)
        if (eventStartDate.getFullYear() < 1900) return false;
        if (!event.endDate || eventEndDate.getFullYear() < 1900) return false;
        
        // For today's events, show events that:
        // 1. Started today OR before today AND end today OR after today
        // 2. This means events that are active/ongoing on today's date
        const startDateOnly = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const endDateOnly = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        
        const isActiveToday = startDateOnly.getTime() <= todayOnly.getTime() && endDateOnly.getTime() >= todayOnly.getTime();
        
        console.log(`🔍 Today Event Check:`);
        console.log(`   Subject: ${event.subject || 'Unknown'}`);
        console.log(`   Start Date: ${event.startDate} -> ${startDateOnly.toDateString()}`);
        console.log(`   End Date: ${event.endDate} -> ${endDateOnly.toDateString()}`);
        console.log(`   Today: ${todayOnly.toDateString()}`);
        console.log(`   Is Active Today: ${isActiveToday}`);
        console.log(`   ---`);
        
        return isActiveToday;
      } else {
        // For other dates, check if event is scheduled for that specific date
        // We'll check both start and end dates to see if the event spans the selected date
        if (!event.endDate) return false;
        
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        
        // Skip events with invalid dates
        if (eventStartDate.getFullYear() < 1900 || eventEndDate.getFullYear() < 1900) return false;
        
        const startDateOnly = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
        const endDateOnly = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());
        
        // Event is relevant for selected date if it spans that date
        const isActiveOnSelectedDate = startDateOnly.getTime() <= selectedDateOnly.getTime() && endDateOnly.getTime() >= selectedDateOnly.getTime();
        
        console.log(`🔍 Other Date Event Check:`);
        console.log(`   Subject: ${event.subject || 'Unknown'}`);
        console.log(`   Start: ${startDateOnly.toDateString()}`);
        console.log(`   End: ${endDateOnly.toDateString()}`);
        console.log(`   Selected: ${selectedDateOnly.toDateString()}`);
        console.log(`   Is Active: ${isActiveOnSelectedDate}`);
        console.log(`   ---`);
        
        return isActiveOnSelectedDate;
      }
    });
    
    console.log('✅ Filtered events count:', filtered.length);
    console.log('✅ Filtered events:', filtered);
    return filtered;
  };

  // Check if event is currently live
  const isEventLive = (event) => {
    if (!event.endDate || !event.startDate) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateOnly = new Date(selectedEventsDate.getFullYear(), selectedEventsDate.getMonth(), selectedEventsDate.getDate());
    
    // Only show "Live" badge if the selected date is TODAY
    if (selectedDateOnly.getTime() !== today.getTime()) {
      return false;
    }

    try {
      const startTime = new Date(event.startDate);
      const endTime = new Date(event.endDate);
      
      // Skip events with invalid dates
      if (startTime.getFullYear() < 1900 || endTime.getFullYear() < 1900) {
        return false;
      }
      
      // Check if current time is between start and end time
      const isLive = now >= startTime && now <= endTime;
      
      // Debug log for live events
      if (isLive) {
        console.log('🔴 LIVE Event:', {
          subject: event.subject,
          eventCode: event.eventCode,
          startTime: formatDateViaLocale(startTime.toISOString(), userDetail),
          endTime: formatDateViaLocale(endTime.toISOString(), userDetail),
          currentTime: formatDateViaLocale(now.toISOString(), userDetail),
          isLive: isLive
        });
      }
      
      return isLive;
    } catch (error) {
      console.error('Error in isEventLive:', error);
      return false;
    }
  };

  // Supplier participation data - Updated to use processed data
  const supplierParticipationData = getSupplierParticipationData();

  // Calculate supplier participation percentage for KPI card - always use supplier data, not stage data
  const getSupplierParticipationPercentage = () => {
    try {
      // Only use API data from supplierCnt, no fallback data
      if (!supplierCntData || supplierCntData.length === 0) {
        return '0%'; // Return 0% if no data available
      }

      // Calculate totals directly from supplierCnt data (no time range filtering needed since API already filters)
      const totalInvited = supplierCntData.reduce((sum, item) => sum + (item.invitedSuppliers || 0), 0);
      const totalParticipated = supplierCntData.reduce((sum, item) => sum + (item.participatedSuppliers || 0), 0);

      if (totalInvited === 0) return '0%';
      const percentage = Math.round((totalParticipated / totalInvited) * 100);
      return `${percentage}%`;
    } catch (error) {
      console.error('Error calculating supplier participation:', error);
      return '0%'; // Return 0% in case of any error
    }
  };

  // Calculate total savings from API data
  const getTotalSavings = () => {
  try {
    if (!totalSavingData || totalSavingData.length === 0) {
      return '0K'; // Return 0K if no data available
    }

    // Sum up all net savings from different event types
    const totalSavings = totalSavingData.reduce((sum, item) => sum + (item.netSavings || 0), 0);

    // If total savings is negative, show 0 instead
    if (totalSavings < 0) {
      return '0';
    }

    // Format the savings value (without currency)
    if (totalSavings >= 1000000) {
      return `${(totalSavings / 1000000).toFixed(1)}M`;
    } else if (totalSavings >= 1000) {
      return `${Math.round(totalSavings / 1000)}K`;
    } else {
      return `${totalSavings}`;
    }
  } catch (error) {
    console.error('Error calculating total savings:', error);
    return '0K';
  }
};

  // Get base currency from total savings data
  const getBaseCurrency = () => {
    try {
      if (!totalSavingData || totalSavingData.length === 0) {
        return '';
      }
      return totalSavingData[0]?.baseCurrency || '';
    } catch (error) {
      console.error('Error getting base currency:', error);
      return '';
    }
  };

  // Get total supplier count from API data
  const getTotalSupplierCount = () => {
    try {
      if (!totalSuppliersData || totalSuppliersData.length === 0) {
        return '0';
      }
      const totalSupplier = totalSuppliersData[0]?.totalSupplier || 0;
      return totalSupplier.toString();
    } catch (error) {
      console.error('Error getting total supplier count:', error);
      return '0';
    }
  };

  // Handle Supplier Status card click
  const handleSupplierStatusClick = () => {
    setShowTotalSupplierBreakdown(true);
    setSelectedIndex(-1); // Reset donut chart selection
    setSelectedEventType(null); // Reset event type selection
    setShowSavingsBreakdown(false); // Reset savings breakdown
  };

  // Handle Total Savings card click
  const handleTotalSavingsClick = () => {
    console.log('Total Savings clicked - show savings breakdown');
    setShowSavingsBreakdown(true);
    // Reset other chart views when showing savings
    setShowTotalSupplierBreakdown(false);
    setSelectedEventType(null);
    setSelectedIndex(-1);
  };

  // Handle Supplier Participation card click
  const handleSupplierParticipationClick = () => {
    console.log('Supplier Participation clicked - show participation chart');
    setShowSavingsBreakdown(false); // Reset savings breakdown
    setShowTotalSupplierBreakdown(false); // Reset supplier breakdown
    setSelectedEventType(null); // Reset selected event type to show participation by event type
    setSelectedIndex(-1); // Reset selection
  };

  // Handle Total Auctions This Month card click
  const handleTotalAuctionsClick = () => {
    console.log('Total Auctions This Month clicked');
    setShowSavingsBreakdown(false); // Reset savings breakdown
    setShowTotalSupplierBreakdown(false); // Reset supplier breakdown
    setSelectedEventType('AUCTION'); // Filter to show auction-related data
    setSelectedIndex(-1); // Reset selection
  };

  // Get savings breakdown data for chart
  const getSavingsBreakdownData = () => {
    if (!totalSavingData || totalSavingData.length === 0) {
      return [];
    }

    return totalSavingData.map(item => ({
      name: item.eventType,
      savings: Math.abs(item.netSavings), // Use absolute value for chart display
      actualSavings: item.netSavings, // Keep actual value for tooltip
      fill: item.eventType === 'RFQ' ? '#10b981' : item.eventType === 'AUCTION' ? '#f59e0b' : '#6366f1'
    }));
  };

  // Get dynamic chart title
  const getSupplierChartTitle = () => {
    if (showSavingsBreakdown) {
      return 'Total Savings Breakdown by Event Type';
    } else if (showTotalSupplierBreakdown) {
      return 'Total vs Active Suppliers';
    } else if (selectedEventType) {
      return `${selectedEventType} Stages`;
    } else {
      return 'Supplier Participation by Event Type';
    }
  };
  // const getTotalSavings = () => {
  //   try {
  //     if (!totalSavingData || totalSavingData.length === 0) {
  //       return '0K'; // Return $0K if no data available
  //     }

  //     // Sum up all net savings from different event types
  //     const totalSavings = totalSavingData.reduce((sum, item) => sum + (item.netSavings || 0), 0);
      
  //     // Format the savings value
  //     if (totalSavings >= 1000000) {
  //       return `$${(totalSavings / 1000000).toFixed(1)}M`;
  //     } else if (totalSavings >= 1000) {
  //       return `$${Math.round(totalSavings / 1000)}K`;
  //     } else if (totalSavings < 0) {
  //       return `-$${Math.abs(Math.round(totalSavings / 1000))}K`;
  //     } else {
  //       return `$${totalSavings}`;
  //     }
  //   } catch (error) {
  //     console.error('Error calculating total savings:', error);
  //     return '$0K';
  //   }
  // };

  // KPI card data - Make it reactive to filter changes
  const getKpiCards = () => [
 
    { 
      title: 'Total Auctions This Month', 
      value: OpenBIDStageCount || '0', 
      color: '#f59e0b', 
      bgColor: '#FFF8E1', 
      iconBg: '#FFE0B2', 
      icon: '🏷️'
    },
       { 
      title: 'Total Savings', 
      value: getTotalSavings(), 
      color: '#6366f1', 
      bgColor: '#F0F0FF', 
      iconBg: '#E0E0FF', 
      icon: '💰'
    },
    { 
      title: 'Supplier Status', 
      value: getTotalSupplierCount(), 
      color: '#10b981', 
      bgColor: '#F0FDF4', 
      iconBg: '#D1FAE5', 
      icon: '📋',
      onClick: handleSupplierStatusClick
    },
    { 
      title: 'Supplier Participation', 
      value: getSupplierParticipationPercentage(), 
      color: '#8b5cf6', 
      bgColor: '#F5F3FF', 
      iconBg: '#E9E5FF', 
      icon: '👥'
    }
  ];

  // Get current KPI cards data - Make it reactive by calling function directly
  // const kpiCards = getKpiCards(); // Remove this line

  // Schedule items
  const scheduleItems = [
    { time: '09:00 AM', title: 'RFQ Review Meeting', color: '#f44336', icon: '📋' },
    { time: '11:00 AM', title: 'Supplier Auction - Office Supplies', color: '#4caf50', icon: '🏷️' },
    { time: '02:00 PM', title: 'Tech bid review - IT Equipment', color: '#2196f3', icon: '💻' },
    { time: '04:00 PM', title: 'Vendor call - ABC Corp', color: '#ff9800', icon: '📞' },
    { time: '05:30 PM', title: 'Award Recommendation Review', color: '#9c27b0', icon: '🏆' },
    { time: '06:30 PM', title: 'Weekly Status Meeting', color: '#00bcd4', icon: '📊' }
  ];

  // Helper functions for Today's Schedule styling
  const getScheduleItemColor = (type) => {
    const colorMap = {
      'Review': '#9c27b0',
      'Auction': '#ff9800',
      'Call': '#4caf50',
      'Award': '#f44336',
      'Meeting': '#00bcd4',
      'RFQ': '#3f51b5',
      'PR': '#795548',
      'NFA': '#607d8b',
      'PO': '#4caf50',
      'Bid': '#ff5722',
      'Evaluation': '#673ab7',
      'Contract': '#795548'
    };
    return colorMap[type] || '#2196f3';
  };

  const getScheduleItemIcon = (type) => {
    const iconMap = {
      'Review': '👁️',
      'Auction': '🏷️',
      'Call': '📞',
      'Award': '🏆',
      'Meeting': '📊',
      // 'RFQ': '📄',
       
      'PR': '📋',
      'NFA': '📢',
      'PO': '🛒',
      'Bid': '💰',
      'Evaluation': '⚖️',
      'Contract': '📋'
    };
    return iconMap[type] || '';
  };

  return (
    <div className="dashboard-container">
      <Box className="dashboard-main-container">
        <Stack gap={1.5}>
          {/* Top Statistics Cards */}
          <Grid container spacing={1.5}>
            {getKpiCards().map((card, index) => (
              <Grid item xs={3}>
              <CustomCard
                key={index}
                onClick={() => {
                  if (card.title === "Supplier Participation") {
                    handleSupplierParticipationClick();
                  } else if (card.title === "Supplier Status") {
                    handleSupplierStatusClick();
                  } else if (card.title === "Total Savings") {
                    handleTotalSavingsClick();
                  } else if (card.title === "Total Auctions This Month") {
                    handleTotalAuctionsClick();
                  }
                }}
                sx={{ 
                  cursor: (card.title === "Supplier Participation" || card.title === "Supplier Status" || card.title === "Total Savings" || card.title === "Total Auctions This Month") ? 'pointer' : 'default',
                  '&:hover': (card.title === "Supplier Status" || card.title === "Supplier Participation" || card.title === "Total Savings" || card.title === "Total Auctions This Month") ? { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease'
                  } : {}
                }}
              >
                <CustomCard.CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.6 }}
                  >
                    <Text color="muted">{card.title}</Text>

                    {/* Click indicator for Supplier Status */}
                   

                    {/* Percentage badge on the right */}
                    {card.title === "Total Savings" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.3,
                          backgroundColor: "#e8f5e8",
                          borderRadius: 1,
                          px: 0.6,
                          py: 0.2,
                        }}
                      >
                   
                      </Box>
                    )}
                  </Box>
     <Box>
  {card.title === "Total Savings" ? (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.8
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleTotalSavingsClick();
      }}
      title="Click to see savings breakdown by event type"
    >
      <Heading4 
        sx={{ 
          mb: 0,
          cursor: "pointer",
          fontSize: "25px",
          "&:hover": {
            color: "#6366f1"
          }
        }}
      >
        {card.value}
      </Heading4>
      {getBaseCurrency() && (
        <Box
          sx={{
            marginLeft: 1,
            backgroundColor: "#e8f5e8",
            borderRadius: 1,
            px: 0.6,
            py: 0.2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#4caf50",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: 1,
            }}
          >
            {getBaseCurrency()}
          </Typography>
        </Box>
      )}
    </Box>
  ) : card.title === "Supplier Status" ? (
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.8
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSupplierStatusClick();
      }}
      title="Total Suppliers"
    >
      <Heading4 
        sx={{
          cursor: "pointer",
          fontSize: "25px",
          "&:hover": {
            color: "#10b981"
          }
        }}
      >
         {card.value}
      </Heading4>
    </Box>
  ) : card.title === "Supplier Participation" ? (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.8
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleSupplierParticipationClick();
      }}
      title="Click to view supplier participation details by event type"
    >
      <Heading4 
        sx={{
          cursor: "pointer",
          fontSize: "25px",
          "&:hover": {
            color: "#8b5cf6"
          }
        }}
      >
         {card.value}
      </Heading4>
    </Box>
  ) : card.title === "Total Auctions This Month" ? (
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center",
        cursor: "pointer",
        "&:hover": {
          opacity: 0.8
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleTotalAuctionsClick();
      }}
      title="Click to view auction details and stages"
    >
      <Heading4 
        sx={{
          cursor: "pointer",
          fontSize: "25px",
          "&:hover": {
            color: "#f59e0b"
          }
        }}
      >
         {card.value}
      </Heading4>
    </Box>
  ) : (
    <Heading4 sx={{ fontSize: "25px" }}>{card.value}</Heading4>
  )}
</Box>


                </CustomCard.CardContent>
              </CustomCard>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1.5}>
            <Grid item xs={9}>
              <Stack gap={1.5}>
                <Stack direction="row" gap={1.5}>
                  <CustomCard>
                    <CustomCard.CardContent className="d-flex flex-column gap-3">
                      <Text>
                        Event Status
                      </Text>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          height: "100%",
                        }}
                      >
                        {/* Donut Chart - Increased size */}
                        <Box
                          sx={{
                            flex: "0 0 65%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ position: "relative", width: 150, height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={eventStatusData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={52}
                                  outerRadius={70}
                                  paddingAngle={2}
                                  dataKey="value"
                                  startAngle={90}
                                  endAngle={450}
                                  onClick={onPieClick}
                                >
                                  {eventStatusData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.fill}
                                      stroke={
                                        selectedIndex === index ? entry.fill : "none"
                                      }
                                      strokeWidth={selectedIndex === index ? 3 : 0}
                                      style={{
                                        filter:
                                          selectedIndex === index
                                            ? "brightness(1.15) saturate(1.1)"
                                            : "none",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        transformOrigin: "center",
                                      }}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </Box>
                        </Box>
                        {/* Legend - Enhanced with hover effects and dynamic sizing */}
                        <Box
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent:
                              eventStatusData.length <= 4 ? "center" : "flex-start",
                            gap: eventStatusData.length <= 4 ? 1.2 : 0.6,
                            maxHeight: "150px",
                            overflow: "auto",
                            pr: 0.5,
                            "&::-webkit-scrollbar": {
                              width: "3px",
                            },
                            "&::-webkit-scrollbar-track": {
                              background: "#f1f1f1",
                              borderRadius: "10px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              background: "#c1c1c1",
                              borderRadius: "10px",
                              "&:hover": {
                                background: "#a8a8a8",
                              },
                            },
                          }}
                        >
                          {eventStatusData.map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: eventStatusData.length <= 4 ? 0.8 : 0.5,
                                borderRadius: 1.5,
                                backgroundColor:
                                  selectedIndex === index
                                    ? `${item.fill}15`
                                    : "transparent",
                                border:
                                  selectedIndex === index
                                    ? `1px solid ${item.fill}30`
                                    : "1px solid transparent",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                transform:
                                  selectedIndex === index
                                    ? "translateX(2px)"
                                    : "translateX(0)",
                                minHeight:
                                  eventStatusData.length <= 4 ? "auto" : "28px",
                                flexShrink: 0,
                              }}
                              onClick={() => {
                                if (selectedIndex === index) {
                                  // If clicking the same item, deselect it
                                  resetSelection();
                                } else {
                                  // Select this item
                                  setSelectedIndex(index);
                                  setSelectedEventType(item.name);
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: eventStatusData.length <= 4 ? 1 : 0.7,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: eventStatusData.length <= 4 ? 10 : 8,
                                    height: eventStatusData.length <= 4 ? 10 : 8,
                                    borderRadius: "50%",
                                    backgroundColor: item.fill,
                                    boxShadow:
                                      selectedIndex === index
                                        ? `0 0 12px ${item.fill}60`
                                        : `0 0 4px ${item.fill}20`,
                                    transition: "all 0.3s ease",
                                    transform:
                                      selectedIndex === index
                                        ? "scale(1.2)"
                                        : "scale(1)",
                                    flexShrink: 0,
                                  }}
                                ></Box>
                                <Typography
                                  className={`dashboard-pie-chart-label ${
                                    selectedIndex === index ? "selected" : ""
                                  } ${eventStatusData.length > 4 ? "small" : ""}`}
                                  style={{
                                    color:
                                      selectedIndex === index ? item.fill : "#555",
                                  }}
                                >
                                  {item.name}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.4,
                                  flexShrink: 0,
                                }}
                              >
                                <Typography
                                  className={`dashboard-pie-chart-value ${
                                    eventStatusData.length > 4 ? "small" : ""
                                  }`}
                                  style={{
                                    color:
                                      selectedIndex === index ? item.fill : "#333",
                                  }}
                                >
                                  {item.value}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#666",
                                    fontSize:
                                      eventStatusData.length <= 4 ? "12px" : "13px",
                                    fontFamily:
                                      '"Roboto", "Helvetica", "Arial", sans-serif',
                                  }}
                                >
                                  {item.percent}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </CustomCard.CardContent>
                  </CustomCard>
                  <CustomCard>
                    <CustomCard.CardContent style={{height: 250}}>
                        <CardContent sx={{ p: 0, paddingBottom: '0 !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Text>
                            {getSupplierChartTitle()}
                          </Text>
                
                          {/* Chart */}
                          <Box sx={{ flexGrow: 1, mt: 0.6, minHeight: '180px' }}>
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart 
                                data={showSavingsBreakdown ? getSavingsBreakdownData() : supplierParticipationData} 
                                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                              >
                                <XAxis
                                  dataKey="name"
                                  axisLine={false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: '#666', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}
                                />
                                <YAxis
                                  axisLine={showSavingsBreakdown ? { stroke: '#e0e0e0', strokeWidth: 1 } : false}
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: '#666', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}
                                  domain={[0, 'dataMax']}
                                  tickCount={5}
                                  allowDecimals={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                                  }}
                                  formatter={(value, name, props) => {
                                    if (showSavingsBreakdown && props.payload) {
                                      const actualSavings = props.payload.actualSavings;
                                      const currency = getBaseCurrency() || 'INR';
                                      const isNegative = actualSavings < 0;
                                      const formattedValue = Math.abs(actualSavings) >= 1000000 
                                        ? `${(Math.abs(actualSavings) / 1000000).toFixed(1)}M` 
                                        : Math.abs(actualSavings) >= 1000 
                                        ? `${Math.round(Math.abs(actualSavings) / 1000)}K`
                                        : Math.abs(actualSavings).toString();
                                      
                                      return [
                                        `${isNegative ? '-' : '+'}${formattedValue} ${currency}`,
                                        isNegative ? 'Loss' : 'Savings'
                                      ];
                                    }
                                    return [value, name];
                                  }}
                                />
                                <Legend
                                  wrapperStyle={{ fontSize: '12px', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}
                                />
                                {showSavingsBreakdown ? (
                                  // Show savings breakdown by event type
                                  <Bar
                                    dataKey="savings"
                                    fill="#6366f1"
                                    name="Savings Amount"
                                    radius={[2, 2, 0, 0]}
                                  />
                                ) : showTotalSupplierBreakdown ? (
                                  // Show total suppliers vs active suppliers
                                  <>
                                    <Bar
                                      dataKey="totalSuppliers"
                                      fill="#93c5fd"
                                      name="Total Suppliers"
                                      radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                      dataKey="activeSuppliers"
                                      fill="#10b981"
                                      name="Active Suppliers"
                                      radius={[2, 2, 0, 0]}
                                    />
                                  </>
                                ) : selectedEventType ? (
                                  // Show stages for selected event type
                                  <Bar
                                    dataKey="count"
                                    fill="#6366f1"
                                    name="Count"
                                    radius={[2, 2, 0, 0]}
                                  />
                                ) : (
                                  // Show supplier participation by event type
                                  <>
                                    <Bar
                                      dataKey="invited"
                                      fill="#93c5fd"
                                      name="Invited"
                                      radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                      dataKey="participated"
                                      fill="#6366f1"
                                      name="Participated"
                                      radius={[2, 2, 0, 0]}
                                    />
                                  </>
                                )}
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                    </CustomCard.CardContent>
                  </CustomCard>
                </Stack>
                <CustomCard>
                  <CustomCard.CardContent>
                  <Box sx={{ minHeight: 0, height: 280, overflow: 'auto' }}>
                    {/* Header */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "space-between",
                        py: 1,
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#fff'
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.9 }}
                      >
                        <Text>
                          Pending Activities
                        </Text>
                        {getActiveFilterCount() > 0 && (
                          <Chip
                            label={`${getActiveFilterCount()} filter${
                              getActiveFilterCount() > 1 ? "s" : ""
                            } active`}
                            size="small"
                            sx={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              fontWeight: 500,
                              fontSize: "0.7rem",
                            }}
                          />
                        )}
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.1 }}
                      >
                        <Menu
                          anchorEl={anchorEl}
                          open={open}
                          onClose={handleClose}
                          PaperProps={{
                            style: {
                              maxHeight: 500,
                              width: "380px",
                              padding: "0px",
                              borderRadius: "12px",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 2,
                              }}
                            >
                              <Typography className="dashboard-header">
                                🔍 Filter Activities
                              </Typography>
                              <Button
                                variant="outlined"
                                onClick={clearActivityFilters}
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 1.5,
                                  fontSize: "0.7rem",
                                  px: 1.5,
                                  py: 0.5,
                                }}
                              >
                                Clear All
                              </Button>
                            </Box>
                            {/* Event Types Filter */}
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1,
                                  fontWeight: 500,
                                  color: "#555",
                                  fontSize: "0.85rem",
                                }}
                              >
                                📊 Event Types
                              </Typography>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: 0.5,
                                  p: 1,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: 1.5,
                                  border: "1px solid #e9ecef",
                                }}
                              >
                                {getEventTypeOptions().map((eventType) => (
                                  <FormControlLabel
                                    key={eventType}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={tempActivityFilters.eventTypes.includes(
                                          eventType
                                        )}
                                        onChange={(e) =>
                                          handleActivityFilterChange(
                                            "eventTypes",
                                            eventType,
                                            e.target.checked
                                          )
                                        }
                                        sx={{
                                          "&.Mui-checked": { color: "#2196f3" },
                                          padding: "2px",
                                        }}
                                      />
                                    }
                                    label={eventType}
                                    sx={{
                                      "& .MuiFormControlLabel-label": {
                                        fontSize: "0.7rem",
                                        fontWeight: 500,
                                        color: "#555",
                                      },
                                      margin: 0,
                                      padding: "2px 4px",
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                            {/* Stages Filter */}
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1,
                                  fontWeight: 500,
                                  color: "#555",
                                  fontSize: "0.85rem",
                                }}
                              >
                                ⚡ Stages
                              </Typography>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(3, 1fr)",
                                  gap: 0.5,
                                  p: 1,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: 1.5,
                                  border: "1px solid #e9ecef",
                                }}
                              >
                                {getStageOptions().map((stage) => (
                                  <FormControlLabel
                                    key={stage}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={tempActivityFilters.stages.includes(
                                          stage
                                        )}
                                        onChange={(e) =>
                                          handleActivityFilterChange(
                                            "stages",
                                            stage,
                                            e.target.checked
                                          )
                                        }
                                        sx={{
                                          "&.Mui-checked": { color: "#ff9800" },
                                          padding: "2px",
                                        }}
                                      />
                                    }
                                    label={stage}
                                    sx={{
                                      "& .MuiFormControlLabel-label": {
                                        fontSize: "0.7rem",
                                        fontWeight: 500,
                                        color: "#555",
                                      },
                                      margin: 0,
                                      padding: "2px 4px",
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                            {/* Time Range Filter */}
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1,
                                  fontWeight: 500,
                                  color: "#555",
                                  fontSize: "11px",
                                }}
                              >
                                📅 Time Range
                              </Typography>
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, 1fr)",
                                  gap: 0.5,
                                  p: 1,
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: 1.5,
                                  border: "1px solid #e9ecef",
                                }}
                              >
                                {timeRangeOptions.map((timeRange) => (
                                  <FormControlLabel
                                    key={timeRange}
                                    control={
                                      <Checkbox
                                        size="small"
                                        checked={tempActivityFilters.timeRanges.includes(
                                          timeRange
                                        )}
                                        onChange={(e) =>
                                          handleActivityFilterChange(
                                            "timeRanges",
                                            timeRange,
                                            e.target.checked
                                          )
                                        }
                                        sx={{
                                          "&.Mui-checked": { color: "#4caf50" },
                                          padding: "2px",
                                        }}
                                      />
                                    }
                                    label={timeRange}
                                    sx={{
                                      "& .MuiFormControlLabel-label": {
                                        fontSize: "11px",
                                        fontWeight: 500,
                                        color: "#555",
                                      },
                                      margin: 0,
                                      padding: "2px 4px",
                                    }}
                                  />
                                ))}
                              </Box>
                              {/* Custom Date Range Picker */}
                              {showCustomDatePicker && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1.5,
                                    backgroundColor: "#fff3e0",
                                    borderRadius: 1.5,
                                    border: "1px solid #ffcc02",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      mb: 1,
                                      fontWeight: 500,
                                      color: "#e65100",
                                      fontSize: "10px",
                                    }}
                                  >
                                    📆 Select Custom Date Range
                                  </Typography>
                                  <LocalizationProvider
                                    dateAdapter={AdapterDateFns}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      <DatePicker
                                        label="Start Date"
                                        value={tempCustomDateRange.startDate}
                                        onChange={(newValue) =>
                                          setTempCustomDateRange((prev) => ({
                                            ...prev,
                                            startDate: newValue,
                                          }))
                                        }
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            size="small"
                                            sx={{
                                              minWidth: 140,
                                              fontSize: "12px",
                                            }}
                                          />
                                        )}
                                      />
                                      <DatePicker
                                        label="End Date"
                                        value={tempCustomDateRange.endDate}
                                        onChange={(newValue) =>
                                          setTempCustomDateRange((prev) => ({
                                            ...prev,
                                            endDate: newValue,
                                          }))
                                        }
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            size="small"
                                            sx={{
                                              minWidth: 140,
                                              fontSize: "12px",
                                            }}
                                          />
                                        )}
                                      />
                                    </Box>
                                  </LocalizationProvider>
                                </Box>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                mt: 2,
                                pt: 1.5,
                                borderTop: "1px solid #e9ecef",
                              }}
                            >
                              <Button
                                variant="contained"
                                onClick={applyFilters}
                                size="small"
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 1.5,
                                  px: 2.5,
                                  py: 0.7,
                                  backgroundColor: "#1565c0",
                                  "&:hover": {
                                    backgroundColor: "#0d47a1",
                                  },
                                }}
                              >
                                Apply Filters
                              </Button>
                            </Box>
                          </Box>
                        </Menu>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<HiOutlineFilter size={14} />}
                          onClick={handleClick}
                          sx={{
                            textTransform: "none",
                            borderColor:
                              getActiveFilterCount() > 0 ? "#2196f3" : "#e0e0e0",
                            color:
                              getActiveFilterCount() > 0 ? "#2196f3" : "#666",
                            backgroundColor:
                              getActiveFilterCount() > 0
                                ? "#e3f2fd"
                                : "transparent",
                            fontSize: "0.75rem",
                            height: 32,
                            fontWeight: getActiveFilterCount() > 0 ? 600 : 400,
                            "&:hover": {
                              backgroundColor:
                                getActiveFilterCount() > 0
                                  ? "#bbdefb"
                                  : "#f5f5f5",
                              borderColor:
                                getActiveFilterCount() > 0
                                  ? "#1976d2"
                                  : "#d0d0d0",
                            },
                          }}
                        >
                          Filter{" "}
                          {getActiveFilterCount() > 0 &&
                            `(${getActiveFilterCount()})`}
                        </Button>
                        <TextField
                          size="small"
                          placeholder="Search activities..."
                          value={searchText}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchText(value);
                            if (value.trim() === "") {
                              setActivityRecorddataType(getFilteredActivities());
                            } else {
                              const filteredData = getFilteredActivities().filter(
                                (item) =>
                                  item.activityDescription
                                    .toLowerCase()
                                    .includes(value.toLowerCase())
                              );
                              setActivityRecorddataType(filteredData);
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <HiOutlineSearch size={14} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 200 }}
                        />
                      </Box>
                    </Box>
                    {/* Activities List as Rows */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                        overflow: "auto",
                        pr: 0.9,
                      }}
                    >
                      {loading ? (
                        <ListSkeleton />
                      ) : (
                        activityRecordDataType?.map((activityParam, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.6,
                              p: 1.2,
                              minHeight: 48,
                              backgroundColor: "white",
                              borderRadius: 1,
                              border: "1px solid #f0f0f0",
                              "&:hover": {
                                backgroundColor: "#f8f9fa",
                                cursor: "pointer",
                                borderColor: "#e0e0e0",
                              },
                              transition: "all 0.2s",
                            }}
                            onClick={() =>
                              activityAccessURL(activityParam?.linkURL)
                            }
                          >
                            {/* Activity Title */}
                            <Box sx={{ flex: 1 }}>
                              <Typography className="dashboard-activity-title">
                                {formatActivityDescription(activityParam?.activityDescription, 50)}
                              </Typography>
                              {/* Stage Name and Received On */}
                              {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" sx={{
                                  color: '#666',
                                  fontSize: '0.8rem',
                                  fontWeight: 400
                                }}>
                                  Stage: {activityParam?.stageName || 'Not Available'}
                                </Typography>
                                <Typography variant="caption" sx={{
                                  color: '#ccc',
                                  fontSize: '0.8rem',
                                  fontWeight: 400,
                                  mx: 0.3
                                }}>
                                  |
                                </Typography>
                                <Typography variant="caption" sx={{
                                  color: '#888',
                                  fontSize: '0.8rem',
                                  fontWeight: 400
                                }}>
                                  Received On: {activityParam?.receiptDt ?
                                    formatDateViaLocale(activityParam?.receiptDt, userDetail) :
                                    'Not Available'
                                  }
                                </Typography>
                              </Box> */}
                            </Box>
                            {/* Event Type Chip */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "11px",
                              }}
                            >
                              <MuiTooltip
                                title={activityParam?.eventCode && activityParam.eventCode.length > 10 ? activityParam.eventCode : ''}
                                arrow
                                placement="top"
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      backgroundColor: '#616161',
                                      color: '#fff',
                                      fontSize: '12px',
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }
                                  },
                                  arrow: {
                                    sx: {
                                      color: '#616161',
                                    }
                                  }
                                }}
                              >
                                <Box
                                  sx={{
                                    px: 1.1,
                                    py: 0.45,
                                    borderRadius: 1,
                                    backgroundColor:
                                      activityParam?.eventType === "RFQ" ? "#e3f2fd" : "#fff3e0",
                                    color:
                                      activityParam?.eventType === "RFQ" ? "#1976d2" : "#f57c00",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    minWidth: 44,
                                    textAlign: "center",
                                    cursor: activityParam?.eventCode && activityParam.eventCode.length > 10 ? 'help' : 'default'
                                  }}
                                >
                                  {getFirstNCharacters(activityParam?.eventCode, 10) || activityParam?.eventType}
                                </Box>
                              </MuiTooltip>

                              {/* <Box
                                sx={{
                                  px: 1.1,
                                  py: 0.45,
                                  borderRadius: 1,
                                  backgroundColor:
                                    activityParam?.eventType === "RFQ"
                                      ? "#e3f2fd"
                                      : "#fff3e0",
                                  color:
                                    activityParam?.eventType === "RFQ"
                                      ? "#1976d2"
                                      : "#f57c00",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  minWidth: 44,
                                  textAlign: "center",
                                }}
                              >
                                {activityParam?.eventCode || activityParam?.eventType}
                              </Box> */}
                              <Box
                                sx={{
                                  px: 1.1,
                                  py: 0.45,
                                  borderRadius: 1,
                                  backgroundColor: "#f8f9fa",
                                  color: "#1976d2",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  minWidth: 44,
                                  textAlign: "center",
                                  border: "1px solid #e0e0e0",
                                }}
                              >
                                {activityParam?.stageName ||
                                  activityParam?.stage ||
                                  "Stage"}
                              </Box>
                            </Box>
                            {/* User Name */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                                minWidth: 80,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#666", fontSize: "12px" }}
                              >
                                👤
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                {activityParam?.createdByName || "User"}
                              </Typography>
                            </Box>
                            {/* End Date */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                                minWidth: 90,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#666", fontSize: "12px" }}
                              >
                                📅
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                {activityParam?.receiptDt
                                  ? formatDateViaLocale(activityParam?.receiptDt, userDetail)
                                  : "Not Available"}
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      )}
                    </Box>
                    {/* <Box className="dashboard-footer"> */}
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2, position: 'sticky', bottom: 0, backgroundColor: '#fff', py: 1 }}
                    >
                      <Typography
                        sx={{
                          color: "#1565c0",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                        onClick={handleViewAllActivities}
                      >
                        View All Activities ({activityRecordDataType?.length || 0}
                        )
                      </Typography>
                    </Box>
                  </Box>
                  </CustomCard.CardContent>
                </CustomCard>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <CustomCard style={{height: '100%', maxHeight: '600px', display: 'flex', flexDirection: 'column'}}>
                <CustomCard.CardContent style={{height: '100%', display: 'flex', flexDirection: 'column', padding: 0}}>
                <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1.3,
                      px: 1.1,
                      pt: 1.1,
                      pr: 1.1, // Consistent padding
                      flexShrink: 0
                    }}
                  >
                    
                    <Typography className="dashboard-live-title">
                      Events
                    </Typography>
                    
                    {/* Date Selection Dropdown */}
                    <FormControl size="small" sx={{ minWidth: 120, maxWidth: 140 }}>
                        <Select
                          value={selectedEventsDate.toDateString()}
                          onChange={() => {}} // Handle through onClick
                          onClick={() => setEventsDateDropdownOpen(!eventsDateDropdownOpen)}
                          displayEmpty
                          sx={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: 1.5,
                            fontSize: '13px',
                            fontWeight: 500,
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #e0e0e0'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1976d2'
                            },
                            '& .MuiSelect-select': {
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }
                          }}
                          renderValue={() => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <span>🗓️</span>
                              <span>{getEventsSelectedDateLabel()}</span>
                            </Box>
                          )}
                        >
                          {getEventsNext7Days().map((dateOption, index) => (
                            <MenuItem
                              key={index}
                              value={dateOption.value}
                              onClick={() => handleEventsDateSelect(dateOption)}
                              sx={{
                                fontSize: '13px',
                                fontWeight: 500,
                                '&:hover': {
                                  backgroundColor: '#e3f2fd'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: '#1976d2',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#1565c0'
                                  }
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span>📅</span>
                                <span>{dateOption.label}</span>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                  </Box>

                  <Box
                     sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.4,
                      flex: 1,
                      overflow: "auto",
                      px: 1.1,
                      pb: 1.1,
                      maxHeight: 'calc(100% - 80px)', // Reserve space for header
                      minHeight: 0, // Allow shrinking
                      scrollBehavior: "smooth",
                      '&::-webkit-scrollbar': {
                        width: '3px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '10px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '10px',
                        '&:hover': {
                          background: '#a8a8a8',
                        },
                      },
                    }}
                  >
                    {(() => {
                      const eventsForSelectedDate = getEventsForSelectedDate();
                      
                      return eventsForSelectedDate.length > 0 ? (
                        eventsForSelectedDate
                          // .sort((a, b) => {
                          //   const dateA = new Date(a.endDate || a.startDate || 0);
                          //   const dateB = new Date(b.endDate || b.startDate || 0);
                          //   return dateA - dateB;
                          // })
                          .sort((a, b) => {
  const today = new Date();
  const isTodaySelected =
    selectedEventsDate.getDate() === today.getDate() &&
    selectedEventsDate.getMonth() === today.getMonth() &&
    selectedEventsDate.getFullYear() === today.getFullYear();

  if (isTodaySelected) {
    const aLive = isEventLive(a);
    const bLive = isEventLive(b);

    if (aLive && !bLive) return -1; 
    if (!aLive && bLive) return 1;  
  }

  const dateA = new Date(a.endDate || a.startDate || 0);
  const dateB = new Date(b.endDate || b.startDate || 0);
  return dateA - dateB;
})
                          // .slice(0, 5) // Limit to only 5 events
                          
                          .map((item, index) => (
                          <Box
  key={index}
  onClick={() => item.linkURL && navigate(`/${item.linkURL}`)}
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 2.2,
    p: 0.9,
    "&:hover": {
      backgroundColor: "#f5f5f5",
      cursor: "pointer",
      borderRadius: "4px",
    },
    transition: "all 0.2s",
  }}
>
{/* 
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  backgroundColor: `${getScheduleItemColor(
                                    item.eventType || item.type
                                  )}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                }}
                              >
                                {getScheduleItemIcon(item.eventType || item.type)}
                              </Box> */}
                              {/* Live Circle Indicator for ongoing events */}
                              {isEventLive(item) ? (
                                <Box 
                                  component="span" 
                                  className="live-circle-indicator"
                                  sx={{ 
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: "#4caf50",
                                    display: 'inline-block',
                                    ml: 0.5
                                  }}
                                ></Box>
                              ) : (
                                <Box 
                                  component="span" 
                                className="not-live-circle-indicator"
                                  sx={{ 
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: "#9e9e9e",
                                    display: 'inline-block',
                                    ml: 0.5
                                  }}
                                ></Box>
                              )}
                              <Box sx={{ flexGrow: 1 }}>
                                <MuiTooltip 
                                  title={item.subject || item.title || item.name || 'Event'} 
                                  arrow
                                  placement="top"
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#fff',
                                        color: '#616161',
                                        fontSize: '12px',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                      }
                                    },
                                    arrow: {
                                      sx: {
                                        color: '#fff',
                                      }
                                    }
                                  }}
                                >
                                  <Typography className="dashboard-activity-title">
                                    {getFirstNCharacters(item.subject || item.title || item.name || 'Event', 30)}
                                  </Typography>
                                </MuiTooltip>
      


                                <Typography variant="caption" sx={{ 
                                  color: '#666', 
                                  fontSize: '11px',
                                  display: 'block'
                                }}>
                                  {item.stage || 'No stage info'}
                                </Typography>
                                     <MuiTooltip 
                                       title={item.eventCode || item.eventType || 'No Event Code'} 
                                       arrow
                                       placement="top"
                                       componentsProps={{
                                         tooltip: {
                                           sx: {
                                             backgroundColor: '#fff',
                                             color: '#616161',
                                             fontSize: '12px',
                                             padding: '6px 12px',
                                             borderRadius: '4px',
                                             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                           }
                                         },
                                         arrow: {
                                           sx: {
                                             color: '#fff',
                                           }
                                         }
                                       }}
                                     >
                                       <Typography
  variant="caption"
  sx={{
    color: '#f57c00',
    backgroundColor: '#fff3e0',
    fontSize: '12px',
    fontWeight: 400,
    display: 'inline-block',
    px: 0.8,
    py: 0.3,
    borderRadius: '4px',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }}
>
  {item.eventCode || item.eventType || 'No Event Code'}
</Typography>
                                     </MuiTooltip>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 0.3,
                                  minWidth: 80,
                                  flexShrink: 0,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#333",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    textAlign: "right",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 0.3,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "3px",
                                      backgroundColor: "#f3e5f5",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      marginRight: "2px",
                                    }}
                                  >
                                    📅
                                  </Box>
                                                         {item.endDate
  ? formatDateViaLocale(item.endDate, userDetail)
  : item.startDate
  ? formatDateViaLocale(item.startDate, userDetail)
  : "No date"}
                                  {/* {(() => {
                                    const today = new Date();
                                    const selectedDateOnly = new Date(selectedEventsDate.getFullYear(), selectedEventsDate.getMonth(), selectedEventsDate.getDate());
                                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                    const isTodaySelected = selectedDateOnly.getTime() === todayOnly.getTime();
                                    
                                    const dateToShow = item.endDate || item.startDate;
                                    if (!dateToShow) return "No date";
                                    
                                    if (isTodaySelected) {
                                      // Show only time when "Today" is selected
                                      return formatDateViaTime(dateToShow, userDetail?.timeLocale || 'en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: userDetail?.timePattern ? JSON.parse(userDetail.timePattern).hour12 : true,
                                        timeZone: userDetail?.timeZone || 'Asia/Kolkata'
                                      });
                                    } else {
                                      // Show full date and time for other days
                                      return formatDateViaLocale(dateToShow, userDetail);
                                    }
                                  })()} */}

                                </Typography>
                              </Box>
                            </Box>
                          ))
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          py: 4,
                          gap: 2
                        }}>
                          <Box sx={{ 
                            width: 60, 
                            height: 60, 
                            borderRadius: '50%', 
                            backgroundColor: '#f5f5f5',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            📅
                          </Box>
                          <Typography variant="body2" sx={{ 
                            color: '#666', 
                            textAlign: 'center',
                            fontSize: '14px'
                          }}>
                            No events scheduled for {getEventsSelectedDateLabel().toLowerCase()}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#999', 
                            textAlign: 'center',
                            fontSize: '12px'
                          }}>
                            Select a different date to view events
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Box>
                </CustomCard.CardContent>
              </CustomCard>
            </Grid>
          </Grid>
        </Stack>
      </Box>

      {/* Activities Modal */}
      <Dialog
        open={showActivitiesModal}
        onClose={() => setShowActivitiesModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "95vh",
            height: "85vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #f0f0f0",
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* First Row: Title and Close Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography className="dashboard-live-title">
              All Activities ({getFilteredActivities().length})
            </Typography>
            <IconButton
              onClick={() => setShowActivitiesModal(false)}
              size="small"
              sx={{
                color: "#666",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              ✕
            </IconButton>
          </Box>

          {/* Second Row: Search and Filter Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Left Side: Search */}
            <TextField
              size="small"
              placeholder="Search activities..."
              value={modalSearchText}
              onChange={(e) => setModalSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HiOutlineSearch size={16} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />

            {/* Right Side: Filter Controls */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowModalFilters(!showModalFilters)}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                }}
              >
                🔽 Advanced Filters
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={applyFilters}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                  backgroundColor: "#1565c0",
                  "&:hover": {
                    backgroundColor: "#0d47a1",
                  },
                }}
              >
                Apply Filter
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={clearActivityFilters}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                  color: "#d32f2f",
                  borderColor: "#d32f2f",
                  "&:hover": {
                    backgroundColor: "#ffebee",
                    borderColor: "#c62828",
                  },
                }}
              >
                Clear All Filter
              </Button>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Collapsible Filter Section */}
          {showModalFilters && (
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "#fafafa",
              }}
            >
              <Typography className="dashboard-header">
                🔍 Advanced Filters
              </Typography>

              <Grid container spacing={2}>
                {/* Event Types Filter */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "white",
                      borderRadius: 1.5,
                      border: "1px solid #e9ecef",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: "#555",
                        fontSize: "0.85rem",
                      }}
                    >
                      📊 Event Types
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 0.3,
                      }}
                    >
                      {getEventTypeOptions().map((eventType) => (
                        <FormControlLabel
                          key={eventType}
                          control={
                            <Checkbox
                              size="small"
                              checked={tempActivityFilters.eventTypes.includes(
                                eventType
                              )}
                              onChange={(e) =>
                                handleActivityFilterChange(
                                  "eventTypes",
                                  eventType,
                                  e.target.checked
                                )
                              }
                              sx={{
                                "&.Mui-checked": { color: "#2196f3" },
                                padding: "2px",
                              }}
                            />
                          }
                          label={eventType}
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              color: "#555",
                            },
                            margin: 0,
                            padding: "2px",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Stages Filter */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "white",
                      borderRadius: 1.5,
                      border: "1px solid #e9ecef",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: "#555",
                        fontSize: "0.85rem",
                      }}
                    >
                      ⚡ Stages
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 0.3,
                      }}
                    >
                      {getStageOptions().map((stage) => (
                        <FormControlLabel
                          key={stage}
                          control={
                            <Checkbox
                              size="small"
                              checked={tempActivityFilters.stages.includes(
                                stage
                              )}
                              onChange={(e) =>
                                handleActivityFilterChange(
                                  "stages",
                                  stage,
                                  e.target.checked
                                )
                              }
                              sx={{
                                "&.Mui-checked": { color: "#ff9800" },
                                padding: "2px",
                              }}
                            />
                          }
                          label={stage}
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              color: "#555",
                            },
                            margin: 0,
                            padding: "2px",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Time Range Filter */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "white",
                      borderRadius: 1.5,
                      border: "1px solid #e9ecef",
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: "#555",
                        fontSize: "0.85rem",
                      }}
                    >
                      📅 Time Range
                    </Typography>
                    <Stack spacing={0.3}>
                      {timeRangeOptions.map((timeRange) => (
                        <FormControlLabel
                          key={timeRange}
                          control={
                            <Checkbox
                              size="small"
                              checked={tempActivityFilters.timeRanges.includes(
                                timeRange
                              )}
                              onChange={(e) =>
                                handleActivityFilterChange(
                                  "timeRanges",
                                  timeRange,
                                  e.target.checked
                                )
                              }
                              sx={{
                                "&.Mui-checked": { color: "#4caf50" },
                                padding: "2px",
                              }}
                            />
                          }
                          label={timeRange}
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              color: "#555",
                            },
                            margin: 0,
                            padding: "2px",
                          }}
                        />
                      ))}
                    </Stack>

                   
                    {showCustomDatePicker && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor: "#fff3e0",
                          borderRadius: 1,
                          border: "1px solid #ffcc02",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            fontWeight: 500,
                            color: "#e65100",
                            fontSize: "0.75rem",
                          }}
                        >
                          📆 Custom Range
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <Stack spacing={1.5}>
                            <DatePicker
                              label="Start Date"
                              value={tempCustomDateRange.startDate}
                              onChange={(newValue) =>
                                setTempCustomDateRange((prev) => ({
                                  ...prev,
                                  startDate: newValue,
                                }))
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  fullWidth
                                  sx={{ fontSize: "0.75rem" }}
                                />
                              )}
                            />
                            <DatePicker
                              label="End Date"
                              value={tempCustomDateRange.endDate}
                              onChange={(newValue) =>
                                setTempCustomDateRange((prev) => ({
                                  ...prev,
                                  endDate: newValue,
                                }))
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  fullWidth
                                  sx={{ fontSize: "0.75rem" }}
                                />
                              )}
                            />
                          </Stack>
                        </LocalizationProvider>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                  pt: 1,
                  borderTop: "1px solid #e9ecef",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#666", fontSize: "0.8rem" }}
                >
                  {getFilteredActivities().length} activities match your filters
                </Typography>
                <Button
                  variant="outlined"
                  onClick={clearActivityFilters}
                  size="small"
                  sx={{
                    textTransform: "none",
                    borderRadius: 1.5,
                    fontSize: "0.75rem",
                  }}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Box>
          )}

          {/* Activities Table */}
          <TableContainer
            sx={{ maxHeight: showModalFilters ? "50vh" : "70vh" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 500, backgroundColor: "#f8f9fa" }}
                  >
                    Activity
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 500, backgroundColor: "#f8f9fa" }}
                  >
                    Event Type
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 500, backgroundColor: "#f8f9fa" }}
                  >
                    Stage
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 500, backgroundColor: "#f8f9fa" }}
                  >
                    Received On
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 500, backgroundColor: "#f8f9fa" }}
                  >
                    End Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 500, backgroundColor: "#f8f9fa" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredActivities().map((activity, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "#f8f9fa" },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      activityAccessURL(activity?.linkURL);
                      setShowActivitiesModal(false);
                    }}
                  >
                    <TableCell>
                     
                                   <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                     {formatActivityDescription(activity?.activityDescription, 100)}
                                   </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
  label={
    activity?.eventCode
    
      ? activity.eventCode.length > 10
        ? activity.eventCode.substring(0, 10) + ".."
        : activity.eventCode
      : activity?.eventType
  }
  size="small"
  sx={{
    backgroundColor:
      activity?.eventType === "RFQ" ? "#e3f2fd" : "#fff3e0",
    color: activity?.eventType === "RFQ" ? "#1976d2" : "#f57c00",
    fontWeight: 500,
  }}
/>

                      {/* <Chip
                        label={activity?.eventCode || activity?.eventType}
                        size="small"
                        sx={{
                          backgroundColor:
                            activity?.eventType === "RFQ"
                              ? "#e3f2fd"
                              : "#fff3e0",
                          color:
                            activity?.eventType === "RFQ"
                              ? "#1976d2"
                              : "#f57c00",
                          fontWeight: 500,
                        }}
                      /> */}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity?.stageName ||
                          activity?.stage ||
                          activity?.status ||
                          "Open"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {activity?.receiptDt
                          ? formatDateViaLocale(activity?.receiptDt, userDetail)
                          : "Not Available"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        {activity?.endDate
                          ? formatDateViaLocale(activity?.endDate, userDetail)
                          : formatDateViaLocale(activity?.createdOn, userDetail)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          activityAccessURL(activity?.linkURL);
                          setShowActivitiesModal(false);
                        }}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard

