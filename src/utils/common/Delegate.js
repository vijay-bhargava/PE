import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  Drawer,
  IconButton,
  Autocomplete,
  Chip,
  FormGroup,
  FormControlLabel,
  InputLabel
} from "@mui/material";
import * as yup from "yup";

import { DataGrid, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 
import { MobileDatePicker, MobileDateTimePicker } from "@mui/x-date-pickers";
import { HiPencilAlt, HiOutlineX } from "react-icons/hi"; 
import { BackButton } from "./component";
import { buildQueryParams, getDateFormatPatteronLocale, savedelegation } from "./utility";
import { Search, FilterList } from "@mui/icons-material";
import { api, ApiClient } from "../../Apiclient";
import { useStateValue } from "../../store";
import tr from "date-fns/esm/locale/tr/index.js";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const ManageDelegate = () => {

  const [{ atoken, rtoken, customerid,customersuffix, eventId }, dispatch] = useStateValue();
  const apiclient = new ApiClient(customersuffix);
  const [eventType, setEventType] = useState('');
  const [event, setEvent] = useState('');
  const [userType, setUserType] = useState('');
  const [newuserType, setNewUserType] = useState('');
  const [row, setRows] = useState([]);
  const [searchText, setSearchText] = useState('');  
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [delegateSearch, setDelegateSearch] = useState(''); 
  const [editingRow, setEditingRow] = useState(null); 
  const [AllApproverList, setAllApproverList] = useState([]);
  const [userList, setUserList] = useState([]);
  
  // Quick Filter States
  const [EventTypeQuickFilter, setEventTypeQuickFilter] = useState(null);
  const [StageQuickFilter, setStageQuickFilter] = useState(null);
  
  const [MenuMasterList, setMenuMasterList] = useState([]);
  const [eventstageList, setEventstageList] = useState([]);
  const [approverRef_id, setapproverRef_id] = useState();  
  const [approverId, setapproverId] = useState();
  const [approverSeq, setapproverSeq] = useState();
  const [approverType, setapproverType] = useState();
  const [loading, setLoading] = useState(false);
  const [gridloading, setGridloading] = useState(false);
  const [stageId, setStageId] = useState('');

  const [filteredRows, setFilteredRows] = useState([]);
  const [editRecordData, seteditRecordData] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);

  // Advanced Search/Filter States
  const [state, setState] = useState({
    opensidebar: false,
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    selectedUsers: [],
    selectedEventTypes: [],
    selectedEventIds: [],
    selectedStages: [],
    dateRange: {
      startDate: null,
      endDate: null
    }
  });
  const [availableEventTypes, setAvailableEventTypes] = useState([]);
  const [availableEventIds, setAvailableEventIds] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);
  const [tempFilters, setTempFilters] = useState({
    selectedUsers: [],
    selectedEventTypes: [],
    selectedEventIds: [],
    selectedStages: [],
    dateRange: {
      startDate: null,
      endDate: null
    }
  });

  // Toggle drawer function similar to ManageRFQ
  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  const handleEditRow = (rowId) => {
    setEditingRowId(rowId);
    const row = filteredRows.find((row) => row.id === rowId);
    if (row) {
      formik.setValues({

        approverRef_id: row.id || 0,
        preApproverId: row.approverId || 0,
        approverId: row.approverId || 0,
        approverSeq: row.approverSeq || 0,
        eventId: row.eventId || 0,
        eventType: row.eventType || '',
        approverType: row.approverType || '',
        wfStage: row.wfStage || '',
        wfId: row.wfId || 0,
        stageId: row.stageId || 0,
        fromDate: fromDate || '',
        toDate: toDate || '',
      });
    }
  };
  const handleSave = async (updatedData) => {

    const res = await apiclient.postres(`api/eventapprover/EventApproverDelegate`, updatedData, atoken)
    if (res) {
      toast.success("approvers delegated successfully", {
        toastId: "delegateshivi"
      })
    }

  };

  useEffect(() => {
    PullApproverAll();
    pullUsersList();
    pullMenuMaster();
  }, []);

  // Pulling User List Based on Customer
  const pullUsersList = async () => {
    var data = {
      CustomerId: customerid,
      SortingColumn: "Id",
      IsActive: true
    };

    setLoading(true);
    setGridloading(true);

    try {
      const queryParams = buildQueryParams(data);
      const res = await apiclient.getres(
        `api/User/Find?${queryParams}`,
        atoken
      );

      console.log('User List Response:', res);
      if (res && res.data?.result) {
        setUserList(res.data?.result);
        
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setGridloading(false);
    }
  };

  // Pulling Menu Master List (Event Types)
  const pullMenuMaster = async () => {
    var data = {
      MenuType: "Event",
    };

    try {
      const queryParams = buildQueryParams(data);
      const res = await apiclient.getres(
        `api/menumaster/Find?${queryParams}`,
        atoken
      );

      console.log('Menu Master Response:', res);
      if (res && res.data) {
        setMenuMasterList(res.data);
      }
    } catch (error) {
      console.error('Error fetching menu master:', error);
    }
  };

  // Pulling Event Stages Based on Event Type
  const pullgetEventStage = async (EventTypeId) => {
    var data = {
      CustomerId: customerid,
      IsActive: true,
      EventType: EventTypeId,
    };

    try {
      const queryParams = buildQueryParams(data);
      const res = await apiclient.getres(
        `api/eventstage/Find?${queryParams}`,
        atoken
      );

      console.log('Event Stage Response:', res);
      if (res && res.data) {
        setEventstageList(res.data);
      }
    } catch (error) {
      console.error('Error fetching event stages:', error);
    }
  };

  // Handle stage change
  const handleStageChange = (event) => {
    const selectedStageId = event.target.value;
    setStageId(selectedStageId);
    
    // Apply stage filter if needed
    if (selectedStageId) {
      const filtered = AllApproverList.filter(item => 
        item.stageId === selectedStageId || item.wfStage === selectedStageId
      );
      setFilteredRows(filtered);
    } else {
      setFilteredRows(AllApproverList);
    }
  };

  // Handle event type change
  const handleEventTypeChange = (selectedEventType) => {
    setEventType(selectedEventType);
    
    // Fetch stages for selected event type
    if (selectedEventType) {
      pullgetEventStage(selectedEventType);
    } else {
      setEventstageList([]);
      setStageId('');
    }
  };

  // Populate filter options from data
  useEffect(() => {
    if (AllApproverList.length > 0) {
      // Extract unique values for filter dropdowns
      const eventTypes = [...new Set(AllApproverList.map(item => item.eventType).filter(Boolean))];
      const eventIds = [...new Set(AllApproverList.map(item => item.eventId).filter(Boolean))];
      const stages = [...new Set(AllApproverList.map(item => item.wfStage).filter(Boolean))];
      
      setAvailableEventTypes(eventTypes);
      setAvailableEventIds(eventIds);
      setAvailableStages(stages);
    }
  }, [AllApproverList]);

  // Advanced filter functions
  const handleAdvancedFilterChange = (filterType, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDateRangeChange = (dateType, value) => {
    setTempFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [dateType]: value
      }
    }));
  };

  const applyAdvancedFilters = () => {
    setAdvancedFilters({ ...tempFilters });
    filterData({ ...tempFilters });
    setState({ ...state, opensidebar: false });
  };

  const clearAdvancedFilters = () => {
    const clearedFilters = {
      selectedUsers: [],
      selectedEventTypes: [],
      selectedEventIds: [],
      selectedStages: [],
      dateRange: {
        startDate: null,
        endDate: null
      }
    };
    setTempFilters(clearedFilters);
    setAdvancedFilters(clearedFilters);
    setFilteredRows(AllApproverList);
  };

  const filterData = (filters) => {
    let filtered = [...AllApproverList];

    // Apply user filter
    if (filters.selectedUsers.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedUsers.some(user => 
          item.approverName?.toLowerCase().includes(user.toLowerCase())
        )
      );
    }

    // Apply event type filter
    if (filters.selectedEventTypes.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedEventTypes.includes(item.eventType)
      );
    }

    // Apply event ID filter
    if (filters.selectedEventIds.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedEventIds.includes(item.eventId)
      );
    }

    // Apply stage filter
    if (filters.selectedStages.length > 0) {
      filtered = filtered.filter(item => 
        filters.selectedStages.includes(item.wfStage)
      );
    }

    // Apply date range filter
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdDate || item.updatedDate);
        const startDate = filters.dateRange.startDate ? new Date(filters.dateRange.startDate) : null;
        const endDate = filters.dateRange.endDate ? new Date(filters.dateRange.endDate) : null;
        
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        return true;
      });
    }

    setFilteredRows(filtered);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (advancedFilters.selectedUsers.length > 0) count++;
    if (advancedFilters.selectedEventTypes.length > 0) count++;
    if (advancedFilters.selectedEventIds.length > 0) count++;
    if (advancedFilters.selectedStages.length > 0) count++;
    if (advancedFilters.dateRange.startDate || advancedFilters.dateRange.endDate) count++;
    return count;
  };
  const [allChecked, setAllChecked] = useState(false);
  const PullApproverAll = async () => {
    var data = {
      CustomerId: customerid,
      Status: "Pending",
    };
    const queryParams = buildQueryParams(data);
    const res = await apiclient.getres(
      `api/eventapprover/Find?${queryParams}`,
      atoken
    );
    
    if (res) {
      console.log(res?.data?.result);
      setAllApproverList(res?.data);
      setFilteredRows(res?.data);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: 0,
      approverRef_id: 0,
      preApproverId: 0,
      approverId: 0,
      approverSeq: 0,
      eventId: 0,
      eventType: '',
      approverType: '',
      wfStage: '',
      wfId: 0,
      stageId: 0,
      fromDate: fromDate,
      toDate: toDate,
    },

    onSubmit: (values) => {

      const data = filteredRows
        .filter(row => row.delegateTo)  
        .map((row) => ({

          approverRef_id: row.id || 0,
          preApproverId: row?.approverId || 0,
          approverId: row.delegateTo.id || 0,
          approverSeq: row.approverSeq || 0,
          eventId: row.eventId || 0,
          eventType: row.eventType || '',
          approverType: row.approverType || '',
          wfStage: row.wfStage || '',
          wfId: row.wfId || 0,
          stageId: row.stageId || 0,
          fromDate: row.fromDate || null,
          toDate: row?.toDate || null,
        }));

      handleSave(data); 
    },
  });

  const handleDelegateSearchChange = (event) => {
    setDelegateSearch(event.target.value);
  };

  const handleDelegateChange = (selectedUserName, selectedUserId, rowId) => {

    const selectedUser = userList.find((user) => user.id === selectedUserId);

    if (selectedUser) {

      const approver = AllApproverList.find(
        (approver) => approver.approverId === selectedUser.id
      );

      if (approver) {
        formik.setFieldValue('approverId', selectedUser.id);
        formik.setFieldValue('approverSeq', approver.approverSeq); 
      }

      setFilteredRows((prevRows) =>
        prevRows.map((row) => {

          if (row.approverName === selectedUserName && row.checked) {
            return {
              ...row,
              delegateTo: selectedUserName, 
            };
          }
          return row;
        })
      );
    }
  };

  const handleCheckboxChange = (id, isChecked) => {
    const clickedRow = filteredRows.find((row) => row.id === id); 

    if (clickedRow) {
      if (isChecked) {

        const userName = clickedRow.approverName;  
        const delegateToValue = clickedRow.delegateTo;
        const fromDateValue = clickedRow.fromDate; 
        const toDateValue = clickedRow.toDate; 

        setFilteredRows((prevRows) =>
          prevRows.map((row) => {
            if (row.approverName === userName) {
              return {
                ...row,
                checked: true,
                delegateTo: delegateToValue || row.delegateTo, 
                fromDate: fromDateValue || row.fromDate, 
                toDate: toDateValue || row.toDate,
              };
            }
            return row; 
          })
        );
      } else {

        console.log('Unchecking row:', clickedRow);
        setFilteredRows((prevRows) =>
          prevRows.map((row) => {
            if (row.id === id) {

              return {
                ...row,
                checked: false,
                delegateTo: null, 
                fromDate: null, 
                toDate: null, 
              };
            }
            return row; 
          })
        );
      }
    }
  };

  const
    handleAllCheckboxChange = (event) => {
      const isAllEventsChecked = event.target.checked;
      setAllChecked(isAllEventsChecked);
      const updatedrow = filteredRows.map((row) => ({
        ...row,
        checked: isAllEventsChecked, 
        delegateTo: isAllEventsChecked ? filteredRows[0]?.delegateTo : null, 
      }))

      setFilteredRows(prevRows =>
        prevRows.map((row) => ({
          ...row,
          checked: isAllEventsChecked, 
          delegateTo: isAllEventsChecked ? filteredRows[0]?.delegateTo : null, 
        }))
      );
    };

  const isAllChecked = row.every((row) => row.checked);

  const columns = [
    {
      field: "foralllevents",
      headerName: "For All Events",
      width: 150,
      renderHeader: () => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {}
          For All Events
        </div>
      ),
      renderCell: (params) => (
        <Checkbox
          size="small"
          checked={params.row.checked}

          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked)} 
        />
      ),
    },
    {
      field: "approverName", headerName: "User", renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ), width: 150
    },
    {
      field: "eventType", headerName: "Event Type", renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ), width: 100
    },
    {
      field: "eventId", headerName: "Events", renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ), width: 100
    },
    {
      field: "wfStage", headerName: "Stage", renderCell: (params) => (
        <div>{params?.formattedValue}</div>
      ), width: 150
    },

    {
      field: "From", headerName: "From", width: 150, renderCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MobileDatePicker
            value={params?.row?.fromDate} 
            size="small"
            slotProps={{
              textField: {
                variant: "standard",
                size: "small",
                InputLabelProps: { shrink: true },
              },
            }}
            format={getDateFormatPatteronLocale("en-GB")}

            onChange={(date) => {
              const row = params?.row;

              row["fromDate"] = date;

              const updatedRows = filteredRows.map((x) => {
                if (x.checked) {
                  return { ...x, fromDate: date };  
                }
                return x;  
              });

              setFilteredRows(updatedRows);
              setFromDate(date); 

            }}

            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </LocalizationProvider>
      )
    },
    {
      field: "To", headerName: "To", width: 150, renderCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MobileDatePicker
            value={params?.row?.toDate} 
            size="small"
            slotProps={{
              textField: {
                variant: "standard",
                size: "small",
                InputLabelProps: { shrink: true },
              },
            }}
            format={getDateFormatPatteronLocale("en-GB")}

            onChange={(date) => {
              const row = params?.row;

              row["toDate"] = date;

              const updatedRows = filteredRows.map((x) => {
                if (x.checked) {
                  return { ...x, toDate: date };  
                }
                return x;  
              });

              setFilteredRows(updatedRows);

            }}

            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </LocalizationProvider>
      )
    },

    {
      field: "delegateTo",
      headerName: "Delegate To",
      width: 200,
      renderCell: (params) => {
        const isEditing = editingRow === params.row.id;
        return (
          <FormControl fullWidth>
            <Autocomplete
              freeSolo
              value={params?.row?.delegateTo || null}

              onChange={(e, value) => {
                const row = params?.row

                row["delegateTo"] = value

                const list =filteredRows.map((x)=>{
                  if(x.checked){
                      return {...x,delegateTo:value}
                  }
                  else{
                    return {...x}
                  }

                });

                setFilteredRows(list)

              }}

              options={(userList || []).map(user => ({
                label: user.name || user.userName, 
                id: user.id 
              })).filter(user => user.label && user.label.toLowerCase().includes(delegateSearch.toLowerCase()))}
              getOptionLabel={(option) => option.label} 
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  variant="standard"
                  onChange={handleDelegateSearchChange} 
                />
              )}
              sx={{ minWidth: 120 }}
            />
          </FormControl>
        );
      }
    },

  ];
  function CustomToolbar() {
    return (
      <GridToolbarContainer className="row">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="col-md-7 d-flex justify-content-start">
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarExport />
          </div>
          <div className="col-md-5 d-flex justify-content-end align-items-center gap-2">
            <GridToolbarQuickFilter />
            <IconButton
              className="filterIconCircle shadow-sm"
              onClick={toggleDrawer('opensidebar', true)}
              size="small"
              title="Advanced Filters"
            >
              <FilterList />
            </IconButton>
            {getActiveFilterCount() > 0 && (
              <Chip
                label={`${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={clearAdvancedFilters}
              />
            )}
          </div>
        </div>
      </GridToolbarContainer>
    );
  }

  const getRowId = (row) => {
    return row.id;
  }
  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchText(value);

    const filtered = AllApproverList?.filter(row => {
      const userName = row.approverName?.toLowerCase();
      const eventId = row.eventId ? row.eventId.toString() : '';
      const eventType = row.eventType?.toLowerCase();

      return userName.includes(value) || eventId.includes(value) || eventType.includes(value);
    });

    setFilteredRows(filtered);
    const isAllChecked = filtered.every(row => row.checked);
    setAllChecked(isAllChecked)
  };

 return (
  <>
    {/* Header Section */}
    <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
        <BackButton title={<span className="page-heading">Manage Delegation</span>} />
      </div>

      {/* Content Section */}
      <div className="container-fluid py-4 px-4">
        <form onSubmit={formik.handleSubmit}>
          {/* Search Bar + Save Button */}
          <div className="row mb-3 align-items-center">
            <div className="col-md-9 col-sm-12">
              <TextField
                variant="standard"
                size="small"
                fullWidth
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Search by User, Event"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-md-3 col-sm-12 text-end">
              <Button
                variant="contained"
                size="small"
                className="px-3 py-1"
                type="submit"
              >
                Save
              </Button>
            </div>
          </div>
        </form>

      
     

        {/* DataGrid Section */}
        <div className="row">
          <div className="col-12">
            <div className="bg-white rounded shadow-sm p-3">
              <DataGrid
                getRowId={getRowId}
                rows={filteredRows}
                columns={columns}
                onRowClick={(params) => handleEditRow(params.row.id)}
                loading={loading}
                style={{ height: "60vh", width: "100%" }}
                rowHeight={40}
                columnHeaderHeight={40}
                className="f13"
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                }
                disableRowSelectionOnClick
                slots={{ toolbar: CustomToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: false,
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Advanced Filter Sidebar */}
    <React.Fragment key='right'>
      <Drawer
        anchor='right'
        open={state['opensidebar']}
        onClose={toggleDrawer('opensidebar', false)}
      >
        <Box sx={{ width: { xs: 320, sm: 400, md: 480 } }}>
          <div className='flex flex-col h-100'>
            {/* Header */}
            <Box className='bgheaderCards'>
              <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                <div className='ms-3 text-white'>
                  <Typography variant="h6">Advanced Filters</Typography>
                </div>
                <div>
                  <IconButton
                    onClick={toggleDrawer('opensidebar', false)}
                    size="small"
                    edge="start"
                    sx={{ mr: 1 }}
                  >
                    <HiOutlineX className='f20 text-white' />
                  </IconButton>
                </div>
              </div>
            </Box>

            {/* Filter Content */}
            <Box sx={{ flexGrow: 1, p: 3 }}>
              <div className="mb-4">
                {/* User Filter */}
                <FormControl fullWidth className="mb-3">
                  <Autocomplete
                    multiple
                    options={(userList || []).map(user => user.name || user.userName).filter(Boolean)}
                    value={tempFilters.selectedUsers}
                    onChange={(event, newValue) => handleAdvancedFilterChange('selectedUsers', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Filter by Users"
                        placeholder="Select users"
                        size="small"
                      />
                    )}
                  />
                </FormControl>

                {/* Event Type Filter */}
                <FormControl fullWidth className="mb-3">
                  <Autocomplete
                    multiple={false}
                    options={
                      Array.isArray(MenuMasterList)
                        ? MenuMasterList.map(item => item.menuName || item.eventType).filter(Boolean)
                        : []
                    }
                    value={tempFilters.selectedEventTypes.length > 0 ? tempFilters.selectedEventTypes[0] : null}
                    onChange={(event, newValue) => {
                      const selectedArray = newValue ? [newValue] : [];
                      handleAdvancedFilterChange('selectedEventTypes', selectedArray);
                      // Fetch stages for selected event type
                      if (newValue) {
                        const selectedEvent = (MenuMasterList || []).find(item => 
                          (item.menuName || item.eventType) === newValue
                        );
                        if (selectedEvent) {
                          pullgetEventStage(selectedEvent.id || selectedEvent.eventType);
                        }
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Filter by Event Type"
                        placeholder="Select event type"
                        size="small"
                      />
                    )}
                  />
                </FormControl>

                {/* Event ID Filter */}
                <FormControl fullWidth className="mb-3">
                  <TextField
                    variant="outlined"
                    label="Filter by Event ID"
                    placeholder="Enter event ID (comma-separated for multiple IDs)"
                    size="small"
                    value={tempFilters.selectedEventIds.join(', ')}
                    onChange={(event) => {
                      const value = event.target.value;
                      // Split by comma and filter out empty values
                      const eventIds = value.split(',').map(id => id.trim()).filter(id => id !== '');
                      handleAdvancedFilterChange('selectedEventIds', eventIds);
                    }}
                  />
                </FormControl>

                {/* Stage Filter */}
                <FormControl fullWidth className="mb-3">
                  <Autocomplete
                    multiple
                    options={(eventstageList || []).map(stage => stage.stageName || stage.name).filter(Boolean)}
                    value={tempFilters.selectedStages}
                    onChange={(event, newValue) => handleAdvancedFilterChange('selectedStages', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Filter by Stage"
                        placeholder="Select stages"
                        size="small"
                        helperText={eventstageList.length === 0 ? "Select an event type first" : ""}
                      />
                    )}
                    disabled={eventstageList.length === 0}
                  />
                </FormControl>

                {/* Date Range Filter */}
                <div className="mb-3">
                  <Typography variant="subtitle2" className="mb-2">Filter by Date Range</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="row">
                      <div className="col-6">
                        <MobileDatePicker
                          label="Start Date"
                          value={tempFilters.dateRange.startDate}
                          onChange={(date) => handleDateRangeChange('startDate', date)}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              size: "small",
                              fullWidth: true
                            },
                          }}
                          format={getDateFormatPatteronLocale("en-GB")}
                        />
                      </div>
                      <div className="col-6">
                        <MobileDatePicker
                          label="End Date"
                          value={tempFilters.dateRange.endDate}
                          onChange={(date) => handleDateRangeChange('endDate', date)}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              size: "small",
                              fullWidth: true
                            },
                          }}
                          format={getDateFormatPatteronLocale("en-GB")}
                        />
                      </div>
                    </div>
                  </LocalizationProvider>
                </div>
              </div>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
              <div className="d-flex gap-2">
                <Button
                  variant="contained"
                  fullWidth
                  onClick={applyAdvancedFilters}
                  className="me-2"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearAdvancedFilters}
                >
                  Clear All
                </Button>
              </div>
              <div className="text-center mt-2">
                <small className="text-muted">
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                </small>
              </div>
            </Box>
          </div>
        </Box>
      </Drawer>
    </React.Fragment>
  </>
);

};

export default ManageDelegate;