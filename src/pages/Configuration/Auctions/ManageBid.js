import React, { useCallback, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, Drawer, FormControl, FormControlLabel, IconButton, Radio, RadioGroup, TextField, Tooltip } from '@mui/material';
import { HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { actionTypes, useStateValue } from '../../../store';
import { bidlist, checkUTC, formatDateViaLocale, getAuctionManageFind } from '../../../utils/common/utility';
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import CryptoJS from "crypto-js";
import { useCookies } from "react-cookie";
import { isTokenExpired, pullMessageCount } from "../../../utils/common";
import { BackButton } from '../../../utils/common/component';
import { ApiClient, api } from "../../../Apiclient";
import { toast } from 'react-toastify';
import FilterListIcon from '@mui/icons-material/FilterList';

import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import FilterAuctionCell from '../../BaseCells/FilterAuctionCell';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import * as signalR from "@microsoft/signalr";
import { buildQueryParams } from '../../../utils/purchaseRequest';

const ManageBid = () => {
    const navigate = useNavigate();
    const [{ atoken, rtoken, customerid, customersuffix, userDetail, eventType }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);

    const [state, setState] = useState({
        opensidebar: false,
    });
    useEffect(() => {
        dispatch({ type: actionTypes.SET_Bidtype, value: null });
        setCookie("pcbt", "", { path: "/", maxAge: 0 });
    }, [userDetail, atoken])

    const [cookies, setCookie] = useCookies(["patkn", "prtkn"]);

    const [connection, setConnection] = useState(null);
    useEffect(() => {
        if (userDetail?.id) {
            pullMessageCount({
                UserId: userDetail.id,
                EventType: eventType,
                IsVenderYN: "N",
                atoken,
                dispatch
            });
        }
    }, [userDetail, atoken, eventType, dispatch]);

    useEffect(() => {
        const host = window.location.host;      // buyer.pe.com
        const cleanHost = host.split(":")[0];   // remove port
        const tenant = cleanHost.split(".")[0];

        const connect = new signalR.HubConnectionBuilder()
            .withUrl(
                `${process.env.REACT_APP_API_CALL}StatusHub/?CustomerId=${customerid}`,
                {
                accessTokenFactory: () => atoken,
                headers: {
                    "X-Tenant": tenant
                },
                transport:
                    signalR.HttpTransportType.WebSockets |
                    signalR.HttpTransportType.ServerSentEvents |
                    signalR.HttpTransportType.LongPolling,
                }
            )
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .build();

        // Start the connection
        connect
            .start()
            .then(() => {
                console.log('SignalR Connected for statusHub');
                setConnection(connect);

                // Handle the reconnecting event
                connect.onreconnecting((error) => {
                    console.warn('SignalR is attempting to reconnect. Error: ', error);
                    // You can show a notification or indicator to the user
                });

                // Handle the reconnection event
                connect.onreconnected((connectionId) => {
                    console.log('SignalR reconnected successfully. Connection ID: ', connectionId);
                });

                // Handle the onclose event
                connect.onclose((error) => {
                    if (error) {
                        console.error('SignalR connection closed with error: ', error);
                    } else {
                        console.log('SignalR connection closed.');
                    }
                });
            })
            .catch(err => {

                console.error("Connection failed: ", err)
            });

        // Cleanup on unmount
        return () => {
            if (connect) {
                connect.stop().then(() => console.log('SignalR connection stopped.'));
            }
        };
    }, []);

    useEffect(() => {
        if (connection) {

            connection.on("AuctionStarted", (data) => {

                //alert("AuctionStarted", data)
                let isUpdated = false;
                //console.log("AuctionStarted Data::", data)
                const updatedStage = recorddata.map(q => {

                    if (q.id === parseInt(data)) {

                        isUpdated = true;
                        return {
                            ...q,
                            stage: 'Running',
                        };
                    }
                    return q;
                });

                if (isUpdated) {
                    setRecorddata(updatedStage);
                }
            });
        }

    }, [connection]);

    useEffect(() => {
        if (connection) {

            connection.on("AuctionClosed", (data) => {

                //alert("AuctionClosed", data)
                let isUpdated = false;
                //console.log("AuctionClosed Data::", data)

                const updatedStage = recorddata.map(q => {

                    //const bidEndDate = checkUTC(q.bidEndDate);
                    const bidEndDate = new Date(checkUTC(q.bidEndDate)); // Ensure bidEndDate is a Date object
                    const currentDate = new Date();
                    if (q.id === parseInt(data) && currentDate > bidEndDate) {
                        // if (q.id === parseInt(data)) {

                        isUpdated = true;
                        return {
                            ...q,
                            stage: 'Close',
                        };
                    }
                    return q;
                });

                if (isUpdated) {
                    setRecorddata(updatedStage);
                }
            });
        }

    }, [connection]);

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };
    const [modal, setModal] = useState(false);
    const CloseModal = () => setModal(false);
    const OpenModal = () => setModal(true);
    const [value, setValue] = React.useState('new');
    const handleChange = (event) => {
        setValue(event.target.value);
    };
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchMode, setSearchMode] = useState(false); // Track if we're in search mode
    const [quickFilterValue, setQuickFilterValue] = useState(''); // Track search query
    const [debouncedQuickFilterValue, setDebouncedQuickFilterValue] = useState('');
    const [searchDataLoaded, setSearchDataLoaded] = useState(false);
    console.log("totalCount::", totalCount)
    const [recorddata, setRecorddata] = useState([]);
    const [BidType, setBidType] = useState("");
    //console.log("BidTypeBidTypeBidType::", BidType)
    const [BidTypeList, setBidTypeList] = useState([]);
    //console.log("BidTypeList::", BidTypeList)
    const bidTypeMap = {
        1: 'Forward Auction',
        2: 'Reverse Auction',
        3: 'Freight Auction',
        4: 'Formula Based Auction',
        5: 'French Forward Auction',
        6: 'French Reverse Auction'
    };

    const pullBidTypeList = async () => {
        try {
            const response = await apiClient.get('/api/BidType/Find', atoken);

            if (response?.result && Array.isArray(response.result)) {
                setBidTypeList(response.result);
            } else {
                console.error('Unexpected response format or empty result');
            }
        } catch (error) {
            console.error('Error fetching bid types:', error);
        }
        setGridloading(false);
    };

    const handleBidtypeChange = (event, newValue) => {

        if (newValue) {
            setBidType(newValue?.bidTypeName);
        } else {
            setBidType('');
        }
    };

    // Helper function to handle navigation based on bidTypeID
    const navigateToPage = (params) => {

        const { id, bidTypeID, stage } = params?.row;
        // if (!iseditDisabled === false) {
        // if (stage == "Running") {
        //     // if (stage !== "Draft" && stage !== "Under Pre Approval") {
        //     navigate(`/configuration/auction-control/${id}`);
        //     return;
        // }
        // }

        const BidType = bidTypeMap[bidTypeID];
        const selectedBid = Object.values(bidlist).find(
            (item) => item.bidTypeName === BidType
        );

        if (selectedBid) {
            dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
            var jsonStringTemp = JSON.stringify(selectedBid);
            var selectedBidCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
            setCookie("pcbt", selectedBidCookie, { path: '/', maxAge: 86400 });
            navigate(`/configuration/manage-auction/${id}`);

        } else {
            toast.error("Please contact to Administrator.");
        }
        // }
    };

    const columns = [
        {
            field: 'bidsubject',
            headerName: 'Subject',
            flex: 2,
            minWidth: 120,
            valueGetter: (params) => `${params?.row?.bidsubject || ""} ${params?.row?.id || ""} ${params?.row?.subject || ""}`,
            renderCell: (params) => (
                <div
                    onClick={() => navigateToPage(params)}
                    style={{ cursor: "pointer" }}
                >
                    <div className='content-text'>
						{params?.row?.bidsubject}
                    </div>
                    <div className='content-text mt-1'>
                        <span>{params?.row.subject}</span>
                    </div>
                    <span className='content-text mt-1'>Id: </span>
                    <span className='text-primary content-text'>{params?.row.id}</span>
                </div>
            )
        },
        {
            field: 'bidStDate',
            headerName: 'Start Date',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                return (
                    <div
                        className="content-text"
                        onClick={() => navigateToPage(params)}
                        style={{ cursor: "pointer" }}
                    >
                        {params.formattedValue
                            ? formatDateViaLocale(params.formattedValue, userDetail)
                            : ""}
                    </div>
                );
            }
        },

        {
            field: 'bidEndDate',
            headerName: 'End Date',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                return (
                    <div
                        className="content-text"
                        onClick={() => navigateToPage(params)}
                        style={{ cursor: "pointer" }}
                    >
                        {params.formattedValue
                            ? formatDateViaLocale(params.formattedValue, userDetail)
                            : ""}
                    </div>
                );
            }
        },
        {
            field: 'bidTypeID',
            headerName: 'Type',
            flex: 1,
            minWidth: 120,
            valueGetter: (params) => bidTypeMap[params.value] || 'Unknown Bid Type',
            renderCell: (params) => {
                return (
                    <div onClick={() => navigateToPage(params)} style={{ cursor: "pointer" }}>
                        <div className='content-text'>
                            {params.value}
                        </div>
                    </div>
                );
            }
        },
        {
            field: "stage",
            headerName: "Status",
            flex: 1,
            minWidth: 80,
            renderCell: (params) => {
                const statusClass = (params?.row?.stage === 'Draft' || params?.row?.stage === 'Cancel')
                    ? 'text-danger'
                    : 'text-primary';
                return (
                    <div
                        className={`content-text ${statusClass}`}
                        onClick={() => navigateToPage(params)}
                        style={{ cursor: "pointer" }}
                    >
                        {params?.formattedValue == 'Close' ? 'Close' : params?.formattedValue}
                    </div>
                );
            },
        },
        {
            field: 'childId',
            headerName: 'Action',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                const hideGavelIcon = ["Draft", "Cancel", "Close", "Awarded", "Allocation", "Open", "Under Pre Approval"].includes(params?.row?.stage);
                const hideEditIcon = ["Running", "Paused"].includes(params?.row?.stage);
                return (
                    <div className="" style={{ overflow: "visible" }}>
                        {!hideGavelIcon && (
                            <Tooltip title="Manage" arrow>
                                <IconButton
                                    className="bgLightYellow"
                                    color="primary"
                                    size="small"
                                    onClick={() => navigateToPage(params)}
                                    // onClick={() => {
                                    //     navigate(`/configuration/auction-control/${params?.row.id}`);
                                    // }}
                                >
                                    <GavelOutlinedIcon className="f22" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {!hideEditIcon && hideGavelIcon && (
                            <Tooltip
                                title={params?.row?.stage == 'Draft' ? 'Edit' : 'Manage'}
                                arrow
                            >
                                <IconButton
                                    className="bgLightYellow"
                                    color="primary"
                                    size="small"
                                    onClick={() => navigateToPage(params)}
                                >
                                    <HiPencilAlt className="f22" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                );
            }
        }
    ];

    const getRowId = (row) => {
        return row?.id;
    }

    const [gridloading, setGridloading] = useState(false);

    const pullBidManageFind = (pageNumber = 1, pageSize = 10, isSearch = false) => {
        var data = {
            CustomerId: customerid,
            SortingColumn: "Id",
            // pageNumber: pageNumber,
            // pageSize: pageSize
        };
        setGridloading(!isSearch);
        if (!isSearch) {
            setSearchDataLoaded(false);
        }
        
        // If in search mode, fetch all records with a large page size
        const effectivePageSize = isSearch ? 10000 : pageSize;
        const effectivePageNumber = isSearch ? 1 : pageNumber;
        
        getAuctionManageFind(data, atoken, effectivePageNumber, effectivePageSize).then((res) => {
            if (!isSearch) {
                setGridloading(false);
            }
            setTotalCount(res.pageMetadata?.totalCount || 0);
            if (isSearch) {
                setSearchDataLoaded(true);
            }
            if (res?.result && res?.result?.length > 0) {
                // Filter out items with stage "Cancel" by default
                const filteredData = res?.result?.filter((item) => item.stage != 'Cancel');
                setRecorddata(filteredData);
            } else {
                setRecorddata([]);
                setTotalCount(0);

            }
        });
    };

    useEffect(() => {
        pullBidManageFind();
    }, [atoken, customerid]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setDebouncedQuickFilterValue(quickFilterValue);
        }, 400);

        return () => clearTimeout(debounceTimer);
    }, [quickFilterValue]);

    useEffect(() => {
        const hasSearchText = debouncedQuickFilterValue.trim() !== '';

        if (hasSearchText) {
            if (!searchMode) {
                setSearchMode(true);
                setPage(0);
            }
            if (!searchDataLoaded) {
                pullBidManageFind(1, pageSize, true);
            }
            return;
        }

        if (searchMode) {
            setSearchMode(false);
            setPage(0);
            pullBidManageFind(1, pageSize, false);
        }
    }, [debouncedQuickFilterValue, searchMode, searchDataLoaded, pageSize]);

    const handleAuction = () => {


        const selectedBid = Object.values(bidlist).find(
            (item) => item.bidTypeName === BidType
        );

        if (selectedBid) {
            dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
            var jsonStringTemp = JSON.stringify(selectedBid);
            var selectedBidCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
            setCookie("pcbt", selectedBidCookie, { path: '/', maxAge: 86400 });
            navigate("/configuration/manage-auction/add");

        } else {
            toast.error("Please select an auction type before proceeding.");
        }
    };

    const handleFilterList = (res, searchCriteria) => {
        debugger
        // Check if the user is searching for items with the stage "Cancel"
        const shouldShowClosed = searchCriteria?.stage == 'Cancel';

        if (!shouldShowClosed) {
            // Filter out items with the stage "Cancel" by default
            setRecorddata(res?.filter((item) => item.stage != 'Cancel'));
        } else {
            // Show all items as per the search criteria
            setRecorddata(res);
        }
    };

    const clearFilterList = () => {
        pullBidManageFind()
    }

    const [divVisible, setDivVisible] = useState(false);

    const toggleDivVisibility = () => {
        setDivVisible(!divVisible);
    };

    //to set auctiontemplate list
    const [templatelist, setTemplateList] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [selectedBidTypeId, setSelectedBidTypeId] = useState(null)
    //console.log("selectedBidTypeId:", selectedBidTypeId)
    //get template list of particular event
    const getTemplateList = async () => {
        var data = {
            CustomerId: customerid,
            EventType: "Auction",
            //AccessLevel: listreadaccessLevel
        };
        const queryParams = buildQueryParams(data)
        const res = await apiClient.getres(`/api/EventTemplate/Find?${queryParams}`, atoken)
        if (res) {

            setTemplateList(res?.data?.result)
        }
    }

    const handleTemplateNavigation = useCallback(async () => {

        if (value != "new") {
            const data = {
                EventId: selectedTemplate.eventId,
                EventType: selectedTemplate.eventType
            };
            const queryParams = buildQueryParams(data)

            const res = await apiClient.postres(`/api/AuctionManage/BIDTemplateClone?${queryParams}`, null, atoken)
            if (res) {
                // if (res) {
                const auctionId = res?.data[0]?.id;
                const BidType = bidTypeMap[selectedBidTypeId];
                const selectedBid = Object.values(bidlist).find(
                    (item) => item.bidTypeName === BidType
                );

                if (selectedBid) {
                    dispatch({ type: actionTypes.SET_Bidtype, value: selectedBid });
                    var jsonStringTemp = JSON.stringify(selectedBid);
                    var selectedBidCookie = CryptoJS.AES.encrypt(`${jsonStringTemp}`, process.env.REACT_APP_TOKEN_INCRYPT_KEY).toString();
                    setCookie("pcbt", selectedBidCookie, { path: '/', maxAge: 86400 });
                    navigate(`/configuration/manage-auction/${auctionId}`);

                } else {
                    toast.error("Please contact to Administrator.");
                }
            }
        }
        else {
            navigate(`/configuration/manage-auction/add`)
        }
    }, [selectedTemplate, selectedBidTypeId])


    const CustomToolbar = useCallback(({ onFilterClick }) => {

        return (
            <GridToolbarContainer className="row">
                <div className="d-flex justify-content-between">
                    <div>
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <GridToolbarExport />


                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <GridToolbarQuickFilter />
                        <div
                            className="filterIconCircle shadow-sm"
                            onClick={onFilterClick}
                            title="Open Filters"
                        >
                            <FilterListIcon />
                        </div>
                    </div>
                    {/* <div>
                        <GridToolbarQuickFilter />
                    </div> */}
                </div>
            </GridToolbarContainer>
        );
    }, []);

    return (
        <>
            <div className="mainContainer d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
                {/* LEFT CONTENT */}
                <div className={`leftContent ${divVisible ? "col-9" : "col-12"}`} style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div className="bg-white rounded-default shadow-sm p-3" style={{ height: 'calc(100vh - 90px)', margin: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="d-flex justify-content-between border-bottom align-items-center pb-2 mb-2" style={{ flexShrink: 0 }}>
                            <div className="page-heading text-dark-blue textMedium">
                                <BackButton title="Manage Auctions" />
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    variant="text"
                                    size="large"
                                    startIcon={<HiPlusSm />}
                                    className="text-capitalize blue-text font-normal me-3"
                                    onClick={() => OpenModal()}
                                >
                                    Add New
                                </Button>
                            </div>
                        </div>

                        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            {gridloading && !searchMode ? (
                                <GridSkeleton />
                            ) : recorddata.length === 0 ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                    <h5 className="text-muted">No auction found</h5>
                                </div>
                            ) : (
                                <DataGrid
                                    getRowId={getRowId}
                                    rows={recorddata}
                                    loading={gridloading && !searchMode}
                                    columns={columns}
                                    pagination
                                    paginationMode={searchMode ? "client" : "server"}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    rowCount={searchMode ? recorddata.length : totalCount}
                                    paginationModel={{
                                        page: page,
                                        pageSize: pageSize
                                    }}
                                    onPaginationModelChange={(model) => {
                                        if (model.page !== page) {
                                            setPage(model.page);
                                            if (!searchMode) {
                                                pullBidManageFind(model.page + 1, model.pageSize, false);
                                            }
                                        }
                                        if (model.pageSize !== pageSize) {
                                            setPageSize(model.pageSize);
                                            setPage(0);
                                            if (!searchMode) {
                                                pullBidManageFind(1, model.pageSize, false);
                                            }
                                        }
                                    }}
                                    onFilterModelChange={(filterModel) => {
                                        const nextQuickFilterValue = filterModel?.quickFilterValues?.[0] || '';
                                        setQuickFilterValue((prevQuickFilterValue) =>
                                            prevQuickFilterValue === nextQuickFilterValue ? prevQuickFilterValue : nextQuickFilterValue
                                        );
                                    }}
                                    getRowClassName={(params) =>
                                        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                                    }
                                    rowHeight={45}
                                    columnHeaderHeight={40}
                                    className="f13 border-0"
                                    disableDensitySelector
                                    disableRowSelectionOnClick
                                    disableColumnResize
                                    disableColumnReorder
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        border: 'none',
                                        '& .MuiDataGrid-main': {
                                            overflow: 'hidden',
                                        },
                                        '& .MuiDataGrid-virtualScroller': {
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            '&::-webkit-scrollbar': {
                                                width: '8px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: '#f1f1f1',
                                                borderRadius: '10px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: '#888',
                                                borderRadius: '10px',
                                                '&:hover': {
                                                    background: '#555',
                                                },
                                            },
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            minHeight: '52px',
                                            maxHeight: '52px',
                                            borderTop: '1px solid #e0e0e0',
                                            backgroundColor: '#fff',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#fafafa',
                                            borderBottom: '2px solid #e0e0e0',
                                        }
                                    }}
                                    slots={{
                                        toolbar: CustomToolbar,
                                    }}
                                    slotProps={{
                                        toolbar: {
                                            onFilterClick: toggleDivVisibility,
                                            showQuickFilter: true,
                                            quickFilterProps: {
                                                debounceMs: 400,
                                            },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT (Filter Panel) */}
                {divVisible && (
                    <div className={`rightContent ${divVisible ? " col-3" : "d-none"}`}>
                        <div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container">
                            <form className="d-flex flex-column flex-grow-1">
                                <div className="d-flex flex-column flex-grow-1" style={{ height: '100%' }}>
                                    <div className="d-flex justify-content-between border-bottom align-items-center py-1">
                                        <div className="page-heading text-dark-blue ms-2">
                                            Advance Search
                                        </div>
                                        <IconButton onClick={toggleDivVisibility} size="small" edge="start">
                                            <HiOutlineX className="f16" />
                                        </IconButton>
                                    </div>
                                    <div className="flex-grow-1">
                                        <FilterAuctionCell
                                            handleFilterList={handleFilterList}
                                            clearFilterList={clearFilterList}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <React.Fragment key='top'  >
                <Drawer
                    anchor='right'
                    open={state['opensidebar']}
                    onClose={toggleDrawer('opensidebar', false)}>
                    <Box sx={{ width: { xs: 280, sm: 480, md: 720 }, }} >
                        <div className='flex flex-col'>
                            <Box className='bgheaderCards'>
                                <div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
                                    <div className='ms-3 text-white'>
                                        Add Workflow
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
                            <div className='h50px'></div>
                            <Box sx={{ flexGrow: 1, p: 2 }} >
                                d
                            </Box>
                        </div>
                    </Box>
                </Drawer>
            </React.Fragment>

            <Modal
                size="lg"
                show={modal}
                backdrop="static"
                keyboard={false}
                className='zindex10002'
                backdropClassName='zindex10002'
                centered
                contentClassName='border-0 rounded'
                onHide={() => CloseModal()}
            >
                <Modal.Header className='pt-2 pb-2'>
                    <Modal.Title id="modal-heading">
                        <div className='d-flex align-items-center f14'>What would you like to do?</div>
                    </Modal.Title>
                    <IconButton
                        onClick={() => CloseModal()}
                        size="small"
                        edge="start">
                        <HiOutlineX className='' />
                    </IconButton>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className='p-3'>
                        <div className='row p-2'>
                            <FormControl>
                                <RadioGroup
                                    aria-labelledby=""
                                    defaultValue="new"
                                    name="new"
                                    value={value}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="new" control={<Radio />} label="Create a New Auction" />
                                    {value === 'new' && (

                                        <div className=" col-12 mt-2 mb-4 focus">
                                            <Autocomplete
                                                disablePortal
                                                id="bidtype"
                                                size='small'
                                                options={BidTypeList}
                                                getOptionLabel={(option) => option?.bidTypeName || ''}
                                                value={BidTypeList.find((option) => option?.bidTypeName === BidType) || null}
                                                onChange={(event, newValue) => handleBidtypeChange(event, newValue)}
                                                onOpen={() => {
                                                    if (BidTypeList.length === 0)
                                                        pullBidTypeList();
                                                }}
                                                fullWidth
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        InputLabelProps={{ shrink: true }}
                                                        label="Auction Type *"
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}
                                    <FormControlLabel value="template" control={<Radio />} label="Select From Template" />
                                </RadioGroup>
                            </FormControl>
                            {value == 'template' ? <>
                                <div className='col-12 mt-2'>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        size='small'
                                        options={templatelist ?? []}
                                        getOptionLabel={(option) => {
                                            const auctionType = option?.eventTypeId == 1
                                                ? "Forward Auction"
                                                : option?.eventTypeId == 2
                                                    ? "Reverse Auction"
                                                    : option?.eventTypeId == 3
                                                        ? "Freight Auction"
                                                        : option?.eventTypeId == 4
                                                            ? "Formula Based Auction"
                                                            : option?.eventTypeId == 5
                                                                ? "French Forward Auction"
                                                                : option?.eventTypeId == 6
                                                                    ? "French Reverse Auction"
                                                                    : "Unknown Type";
                                            return `${option.templateTitle ?? ""} (${auctionType})`;
                                        }}
                                        fullWidth
                                        renderInput={(params) => <TextField {...params} InputLabelProps={{
                                            shrink: true,
                                        }} label="Select Template" />}
                                        onChange={(e, v) => {
                                            setSelectedTemplate(v)
                                            setSelectedBidTypeId(v?.eventTypeId)
                                        }}
                                        onOpen={() => {
                                            if (templatelist.length === 0)
                                                getTemplateList();
                                        }}
                                    />
                                </div>
                            </> : <></>}

                            <div className='col-12 mt-4 text-end'>
                                <LoadingButton
                                    variant='outlined'
                                    onClick={value !== 'template' ? handleAuction : handleTemplateNavigation}
                                    color='primary'
                                    className='text-capitalize'
                                    size='small'
                                >
                                    Continue
                                </LoadingButton>
                            </div>
                        </div>


                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ManageBid