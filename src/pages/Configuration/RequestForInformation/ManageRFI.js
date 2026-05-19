import React, { useCallback, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, Chip, Drawer, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Tooltip } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { HiChevronLeft, HiChevronRight, HiOutlineX, HiPencilAlt, HiPlusSm, HiTrash } from "react-icons/hi";
import TextFieldCell from '../../BaseCells/TextFieldCell';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Dropdown, FormLabel, Modal } from 'react-bootstrap';
import { actionTypes, useStateValue } from '../../../store';
import { formatDateViaLocale, formatDateViaTime, formattimeoption, getRFQManageFind } from '../../../utils/common/utility';
import { DataGrid, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { AuctionModalFromRFQ, convertISOToFormattedDate, findObjListByValueFromArray, formatDateToDDMMYYYY, formatToDDMMYYYY, getPayloadWithStage, invitedSupplierForAuction } from '../../../utils/common';
import Moment from 'react-moment';
import FilterRFQCell from './FilterRFQCell';
import { BackButton } from '../../../utils/common/component';
import { Fullscreen, PushPinOutlined, SearchOutlined } from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import { TbReportAnalytics } from "react-icons/tb";
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { ApiClient, api } from '../../../Apiclient';
import NotFoundPage from '../../../components/NotAllowed';
import { toast } from 'react-toastify';
// import ResultListCell from './ResultListCell';
const ManageRFI = ({ claimType }) => {
    const navigate = useNavigate();
    
    const [{ atoken, rtoken, customerid, userDetail,customersuffix, eventId, eventType, roleClaims }, dispatch] = useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const [state, setState] = useState({
        opensidebar: false,
    });
    //role management
    const [accessLevel, setAccessLevel] = useState("");
    useEffect(() => {

        if (roleClaims && roleClaims.length > 0) {
            const obj = findObjListByValueFromArray(
                roleClaims,
                claimType,
                `claimType`,
                `RFQ`
            );

            obj ? setAccessLevel(obj) : setAccessLevel("");
        }

    }, [roleClaims]);
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

    const [recorddata, setRecorddata] = useState([]);
    const getRowId = (row) => {
        return row?.id;
    }
    const columns = [
        {
            field: 'rfqSubject',
            headerName: 'Subject',
            width: 290,
			minWidth: 135,
            renderCell: (params) => (
                <div title={params?.formattedValue} onClick={!params?.row.activityId ? () => navigate(`/configuration/manage-rfi/${params?.row.id}`) : () => navigate(`/configuration/manage-rfi/${params?.row.id}?ActivityId=${params?.row.activityId}`)} className='pointer'>
                    <div className='f14' title={params?.formattedValue}>
                        {params?.formattedValue}
                    </div>
                    <div className='f09pt text-muted mt-1'>
                        <div className='f09pt text-muted mt-1' title={params?.row.subject}>
                            <span>{params?.row.subject}</span>
                        </div> <span>RFQ Id: </span>{params?.row.id}
                        {/* <span>RFQ Id: </span><span className={params?.row.status?'text-primary':'text-danger'}>{params?.row.id}</span> |<span className={params?.row.status?'text-primary ms-1':'text-danger ms-1'}>{params?.row.status ?? 'Draft'}</span> */}
                    </div>
                </div>
            )
        },
        // {
        //     field: 'startDate',
        //     headerName: 'Start Date',

        //      flex:1,
        //     renderCell: (params) => (

        //         params.formattedValue ? <Moment format="DD MMM YYYY hh:mm a">{params.formattedValue}</Moment> : ''
        //     )
        // },
        {
            field: 'startDate',
            headerName: 'Start Date',
            width: 290,
			minWidth: 135,
           
            renderCell: (params) => (
                <div
                    onClick={() => navigate(`/configuration/manage-rfi/${params?.row.id}`)} // Adjust this URL if needed
                    className='pointer'
                >
                    {params.formattedValue ? formatDateViaLocale(
                        params.formattedValue,
                        userDetail
                    ) : ""}
                </div>
            )
        },
        {
            field: 'endDate',
            headerName: 'End Date',
        
            width: 290,
			minWidth: 135,
            renderCell: (params) => (
                <div
                    onClick={() => navigate(`/configuration/manage-rfi/${params?.row.id}`)} // Adjust this URL if needed
                    className='pointer'
                >
                    {params.formattedValue ? formatDateViaLocale(
                        params.formattedValue,
                        userDetail
                    ) : ""}
                </div>
            )
        },
        {
            field: 'stage',
            headerName: 'Stage',
            width: 290,
            minWidth: 135,
            renderCell: (params) => {
                const status = params?.row?.stage || 'Draft';
                const statusClass =
                    status == 'Cancel' || status == 'Draft'
                        ? 'text-danger'
                        : 'text-primary';

                return (
                    <div onClick={() => navigate(`/configuration/manage-rfi/${params?.row.id}`)} className='pointer'>
                        <span className={`${statusClass} ms-1`}>{status}</span>
                    </div>
                );
            }
        },
        // {
        //     field: "Action",
        //     headerName: "Action",
        //     flex: 1,
        //     minWidth: 80,
        //     renderCell: (params) => (
        //         <Chip
        //             size="small"
        //             color="primary"
        //             className="ps-1 me-3 align-center"
        //             variant="outlined"
        //             label="Select Items"
        //             onClick={() => {
        //                 ItemOpenModal();
        //                 handleADDtoRFQ(params?.row.id);
        //             }}
        //             disabled={["Draft", "Under Pre Approval", "Cancel", null].includes(params.row.stage)}
        //         ></Chip>
        //     ),
        // },
        // {
        //     field: 'childId',
        //     headerName: '',
        //     cellClassName: 'overflow-visible justify-content-end',
        //     type: 'actions',
        //     width: 80,
        //     renderCell: (params) => (
        //         <div className='d-flex' style={{ overflow: 'visible' }}>
        //             <div className='me-2'>
        //                 <Tooltip title="report" arrow>
        //                     <IconButton className='bgLightYellow' color='primary' size='small'
        //                         onClick={() => navigate(`/configuration/manage-rfq/comparative-rfq/${params?.row.id}`)}
        //                     >
        //                         <TbReportAnalytics className='f22' />
        //                     </IconButton>
        //                 </Tooltip>
        //                 <Tooltip title="Edit" arrow>
        //                     <IconButton className='bgLightYellow' color='primary' size='small'
        //                         onClick={!params?.row.activityId ? () => navigate(`/configuration/manage-rfq/${params?.row.id}`) : () => navigate(`/configuration/manage-rfq/${params?.row.id}?ActivityId=${params?.row.activityId}`)}
        //                     >
        //                         <HiPencilAlt className='f22' />
        //                     </IconButton>
        //                 </Tooltip>
        //             </div>
        //         </div>
        //     )
        // },
    ];


    //rfq tO auction data starts
    const [itemmodal, setItemModal] = useState(false);
    const ItemCloseModal = () => setItemModal(false);
    const ItemOpenModal = () => setItemModal(true);
    const [selectedPRITemModal, setSelectedPRItemModal] = useState([]);
    console.log("selectedPRITemModal:", selectedPRITemModal)
    const [selectedItemsActive, setSelectedItemsActive] = useState([])
    const [firstRfq, setFirstRFQ] = useState(null);
    console.log("firstRfq>", firstRfq)
    const [showAuctionDropdown, setShowAuctionDropdown] = useState(false);
    const [selectedBidType, setSelectedBidType] = useState(null);
    const [rfqprcartmodal, setRFQPRcartmodal] = useState(false);
    const [noQuotesMessage, setNoQuotesMessage] = useState("");

    const rfqPrCartOpenModal = () => {
        setAction(true);
        setRFQPRcartmodal(true);
    };

    const rfqPrCartCloseModal = () => {
        setAction(false);
        setRFQPRcartmodal(false);
    };

    const [rfqItemSet, setRFQItemSet] = useState(new Set());
    const [rfqVendorInvitedList, setRfqVendorInvitedList] = useState([]);
    console.log("setRFQItemSet:", rfqItemSet)
    console.log("rfqVendorInvitedList:", rfqVendorInvitedList)
    const [action, setAction] = useState(false);

    const prrfqcolumn = [
        {
            field: "itemName",
            headerName: "Item / Service",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "quantity",
            headerName: "Quantity / uom",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <div className="f14">
                    {`${params?.formattedValue} (${params?.row?.uom || ''})`}
                </div>
            ),
        },
        {
            field: "minimumdecreamentOn",
            headerName: "Minimum Decrement",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "bidStartprice",
            headerName: "Start Unit Price",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "targetPrice",
            headerName: "Target Price",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        action && {
            field: "Action",
            headerName: "Action",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Tooltip title={"Remove Item"}>

                    <HiTrash
                        className="text-danger text-center ms-2"
                        onClick={() => handleDeleteItemSet(params.id)}
                    />

                </Tooltip>
            ),
        },
    ];

    const prauctioncolumn = [
        {
            field: "rfqId",
            headerName: "RFQ Id",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "itemName",
            headerName: "Item / Service",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "quantity",
            headerName: "Quantity",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <div className="f14">
                    {`${params?.formattedValue} (${params?.row?.uom || ''})`}
                </div>
            ),
        },
        {
            field: "minimumdecreamentOn",
            headerName: "Minimum Decrement",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "bidStartprice",
            headerName: "Start Unit Price",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        {
            field: "targetPrice",
            headerName: "Target Price",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <div className="f14">{params?.formattedValue}</div>
            ),
        },
        action && {
            field: "Action",
            headerName: "Action",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Tooltip title={"Remove Item"}>

                    <HiTrash
                        className="text-danger text-center ms-2"
                        onClick={() => handleDeleteItemSet(params.id)}
                    />

                </Tooltip>
            ),
        },
    ];

    const getBRRowId = (row) => {
        return row?.id;
    };

    const handleDeleteItemSet = (itemId) => {
        setRFQItemSet((prevSet) => {
            const newSet = new Set(prevSet);
            for (let item of newSet) {
                if (item.id === itemId) {
                    newSet.delete(item);
                    break;
                }
            }
            return newSet;
        });
    };

    const findSelectedItemsActive = () => {
        const commonObjects = [...rfqItemSet].filter(item => selectedPRITemModal.some(modalItem => item.state === modalItem.state));
        const commonObjectsId = commonObjects.map(x => x.id)
        setSelectedItemsActive(commonObjectsId);
    };
    const selectItemsById = (ids) => {

        const selecteditems = selectedPRITemModal.filter((object) =>
            ids.includes(object.id)
        );
        const unselectedItems = selectedPRITemModal.filter((object) =>
            !ids.includes(object.id)
        );
        setSelectedItemsActive(ids)
        handleRFQItemSet(selecteditems, unselectedItems);
    };

    const handleRFQItemSet = (selectedItems, unselectedItems) => {
        setRFQItemSet((prevSet) => {
            const newSet = new Set(prevSet);

            // Add selected items to the set
            selectedItems.forEach((newItem) => {
                // Check if the set already has an item with the same ID
                const existingItem = Array.from(newSet).find(item => item.id === newItem.id);
                if (!existingItem) {
                    newSet.add(newItem);
                }
            });

            // Remove unselected items from the set
            unselectedItems.forEach((itemToRemove) => {
                newSet.forEach((item) => {
                    if (item.id === itemToRemove.id) {
                        newSet.delete(item);
                    }
                });
            });
            return newSet;
        });
    };

    const handleADDtoRFQ = (id) => {

        pullLineItemList(id)
    };

    // const pullLineItemList = async (id) => {

    //     var data = {
    //         Id: id
    //     };
    //     const queryParams = buildQueryParams(data)
    //     const res = await apiClient.getres(`api/RFQManage/FindById?${queryParams}`, atoken)

    //     if (res) {
    //         
    //         const data = res?.data?.result ?? []
    //         //filter
    //         
    //         const selectedRfqId = data?.find((x) => x.id === id) ?? null;
    //         if (selectedRfqId) {
    //             const selectedItems = selectedRfqId?.rfqParameters.map(item => ({
    //                 ...item,
    //                 rfqId: selectedRfqId.id ?? 0
    //             }));
    //             setSelectedPRItemModal(selectedItems);
    //         } else {
    //             setSelectedPRItemModal([]);
    //         }
    //         
    //         findSelectedItemsActive();
    //         setFirstRFQ(selectedRfqId);
    //     }

    // }

    const pullLineItemList = async (id) => {
        var data = {
            Id: id
        };
        const queryParams = buildQueryParams(data);
        const res = await apiClient.getres(`api/RFQManage/FindById?${queryParams}`, atoken);

        if (res) {
            const data = res?.data?.result ?? [];

            const selectedRfqId = data?.find((x) => x.id == id) ?? null;
            setRfqVendorInvitedList(selectedRfqId?.rfqVendorInvited)
            if (selectedRfqId) {

                const hasClosedVendor = selectedRfqId.rfqVendorInvited.some((vendor) => vendor.status == "Closed");

                if (hasClosedVendor) {
                    const selectedItems = selectedRfqId.rfqParameters.map(item => ({
                        ...item,
                        rfqId: selectedRfqId.id ?? 0
                    }));
                    setSelectedPRItemModal(selectedItems);
                    setNoQuotesMessage("");
                } else {
                    setSelectedPRItemModal([]);
                    setNoQuotesMessage("None of the vendors have quoted. You are not able to select any line items.");
                }

                findSelectedItemsActive();
                setFirstRFQ(selectedRfqId);
            }
        }
    }

    const handleCreateAuction = () => {

        setShowAuctionDropdown(true);
    };

    const handleAuctionTypeSelection = (auctionType) => {

        setSelectedBidType(auctionType);
        rfqPrCartOpenModal();
    };


    //pr to auction
    const createAuctionFromPR = async () => {
        //setPRLoader(true)

        const rfqItem = Array.from(rfqItemSet);
        const data = {
            subject: firstRfq?.subject,
            description: firstRfq?.description,
            bidSubTypeId: 81,
            bidClosingType: 'A',
            showRankToVendor: 'Y',
            maximumExtension: -1,
            extensionDuration: 2,
            hideVendor: false,
            hidePrice: false,
            baseCurrency: 'INR',
            tnC: firstRfq?.termandCondition,
            bidTypeID: selectedBidType?.bidTypeId,
            stage: "Draft",
            bidStDate: new Date(),
            bidEndDate: new Date(),
            bidDuration: 0,
            configureDate: new Date(),
            prebid: false,
            quotesinWords: false,
            rankToVendorPost: false,
            noOfStaggerItems: 0,
            bidParamater: AuctionModalFromRFQ(rfqItem),
            bidVendorInvited: invitedSupplierForAuction(rfqVendorInvitedList)
        };
        const statedata = {
            EventType: "Auction",
            CustomerId: customerid,
            EventId: 0,
            OrgId: firstRfq?.purchOrgId,
            OrgGroupId: firstRfq?.purchGrpId,
        }
        const queryParams = buildQueryParams(statedata)
        const stagelist = await apiClient.getres(`/api/EventStage/EventStageFind?${queryParams}`, atoken)

        const auctiondatapayload = getPayloadWithStage(
            "currentStage",
            "Draft",
            stagelist?.data?.result,
            data,
            "currentStage",
            firstRfq?.purchOrgId,
            firstRfq?.purchGrpId
        );

        console.log("auctiondatapayload::", auctiondatapayload)
        const res = await apiClient.postres(`/api/AuctionManage/Add`, auctiondatapayload, atoken);
        if (res) {
            const id = res.data;
            toast.success(`BID Created successfully.`);
            switch (selectedBidType?.bidTypeId) {
                case 1:
                    navigate(`/configuration/manage-foa/${id}`);
                    break;
                case 2:
                    navigate(`/configuration/manage-ra/${id}`);
                    break;
                case 3:
                    navigate(`/configuration/manage-fa/${id}`);
                    break;
                case 4:
                    navigate(`/configuration/manage-ca/${id}`);
                    break;
                case 5:
                    navigate(`/configuration/manage-ffa/${id}`);
                    break;
                case 6:
                    navigate(`/configuration/manage-fra/${id}`);
                    break;
                default:
                    toast.error(`Unhandled bidTypeID: ${id}`);
                    break;
            }
            //navigate(`/configuration/manage-ra/${id}`);
        }
        //setPRLoader(false)
    };

    //rfq tO auction data ends

    //for communicatio n hub
    useEffect(() => {

        const data = queryParams.get("CommId")?.trim();
        if (data) {
            dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
        }
    }, [])

    const [gridloading, setGridloading] = useState(false);
    const pullRFQManageFind = () => {

        if (accessLevel?.list?.readed?.toLowerCase().trim() == "none") {
            setRecorddata([]);
            return;

        }
        var data = {
            CustomerId: customerid,
            SortingColumn: "Id",
          //  AccessLevel: accessLevel?.list?.readed
        };
        setGridloading(true)
        console.log('request id pullRFQManageFind', data);
        getRFQManageFind(data, atoken).then((res) => {
            setGridloading(false)
            console.log('response pullRFQManageFind', res);
            if (res && res?.length > 0) {

                 
                 const result=res.filter((x)=>x.rfqType=="RFI")
                //Role handling for preventing user who dont have create rights to see draft event
                if (accessLevel?.list?.created.toLowerCase().trim() == "none") {
                    setRecorddata(result?.filter((x) => x.status && x.status != "Draft"))
                }
                else {
                    setRecorddata(result)
                }


            }
        });
    };
    useEffect(() => {
        pullRFQManageFind();
    }, [atoken, customerid, accessLevel]);


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    useEffect(() => {
        // const pullMessageList = async () => {
        //     var data = {
        //         CustomerId: customerid,
        //         EventType: "RFQ",
        //         //EventId: 0,

        //     };
        //     const queryParams = buildQueryParams(data)
        //     const res = await apiClient.getres(`api/Communication/Find?${queryParams}`, atoken)
        //     if (res) {

        //         const data = res?.data?.result ?? []

        //         dispatch({ type: actionTypes.SET_Notificationlist, value: data });
        //     }


        // }
        // pullMessageList() // Removed automatic call - now triggered only on bell icon click

    }, []);

    const handleFilterList = (res) => {
        //Role handling for preventing user who dont have create rights to see draft event
        if (accessLevel?.list?.created.toLowerCase().trim() == "none") {
            setRecorddata(res?.filter((x) => x.status && x.status != "Draft"))
        }
        else {
            setRecorddata(res)
        }

    }
    const clearFilterList = () => {

        pullRFQManageFind()
    }
    const [divVisible, setDivVisible] = useState(false);

    const toggleDivVisibility = () => {
        setDivVisible(!divVisible);
    };
    //to set rfqtemplate list
    const [templatelist, setTemplateList] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    //get template list of particular event
    const getTemplateList = async () => {

        var data = {
            CustomerId: customerid,
            EventType: "RFQ",
        };
        const queryParams = buildQueryParams(data)
        const res = await apiClient.getres(`/api/EventTemplate/Find?${queryParams}`, atoken)
        if (res) {
            setTemplateList(res?.data?.result)
        }
    }
    useEffect(() => {
        getTemplateList()
    }, [])

    const handleTemplateNavigation = useCallback(async () => {

        if (value != "new") {
            const data = {
                EventId: selectedTemplate.eventId,
                EventType: selectedTemplate.eventType
            };
            const queryParams = buildQueryParams(data)

            const res = await apiClient.postres(`/api/RFQManage/RFQTemplateClone?${queryParams}`, null, atoken)
            if (res) {
                navigate(`/configuration/manage-rfi/${res?.data[0]?.id}`)
            }

        }
        else {

            navigate(`/configuration/manage-rfi/add`)
        }


    }, [selectedTemplate])


    function CustomToolbar({ onFilterClick }) {
        return (
            <GridToolbarContainer className="row">
                <div className="d-flex justify-content-between">
                    <div>
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <GridToolbarExport />
                        <Button
                            variant="text"
                            size="small"
                            startIcon={<FilterListIcon />}
                            onClick={onFilterClick}
                            className="text-capitalize"
                        >
                            Advance Search
                        </Button>
                    </div>
                    <div>
                        <GridToolbarQuickFilter />
                    </div>
                </div>
            </GridToolbarContainer>
        );
    }


    if (accessLevel?.list?.readed?.toLowerCase().trim() == "none") {
        return <>
            <NotFoundPage
                heading={`You Are Not Authorized To View these page`}
                body1={`contact your Administrator for view rights`}
            />
        </>
    }

    //##
    return (
        <>
            <div className="mainContainer d-flex">
                {/* LEFT CONTENT */}
                <div className={`leftContent ${divVisible ? "col-9" : "col-12"} d-flex flex-column`}>
                    <div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
                        <div className="d-flex justify-content-between border-bottom align-items-center mb-3">
                            <div className="page-heading text-dark-blue textMedium">
                                <BackButton title="Manage RFI" />
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                {accessLevel?.list?.created.toLowerCase().trim() !== "none" && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<HiPlusSm />}
                                        className="text-capitalize blue-text font-normal me-3"
                                        onClick={() => OpenModal()}
                                    >
                                        Add New
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="row gx-0">
                            <div className="col-12 mb-3">
                                {gridloading ? (
                                    <GridSkeleton />
                                ) : (
                                    <div className="data-grid-wrapper">
                                        <DataGrid
                                            getRowId={getRowId}
                                            rows={recorddata}
                                            loading={gridloading}
                                            columns={columns}
                                            getRowClassName={(params) =>
                                                params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
                                            }
                                            rowHeight={45}
                                            columnHeaderHeight={40}
                                            className="f13 border-0"
                                            disableDensitySelector
                                            disableRowSelectionOnClick
                                            slots={{
                                                toolbar: () => <CustomToolbar onFilterClick={toggleDivVisibility} />,
                                            }}
                                            slotProps={{
                                                toolbar: {
                                                    showQuickFilter: true,
                                                },
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
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
                                        <FilterRFQCell
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
                        <div className='row'>
                            <div className='col-12'>
                                <FormControl>
                                    <RadioGroup
                                        aria-labelledby=""
                                        defaultValue="new"
                                        name="new-rfq"
                                        value={value}
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel value="new" control={<Radio />} label="Create a New Event" />
                                        <FormControlLabel value="template" control={<Radio />} label="Select From Template" />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            {value == 'template' ? <>
                                <div className='col-12 mt-2'>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        size='small'
                                        options={templatelist ?? []}
                                        getOptionLabel={(option) => option.templateTitle ?? ""}
                                        fullWidth
                                        renderInput={(params) => <TextField {...params} InputLabelProps={{
                                            shrink: true,
                                        }} label="Select Template" />}
                                        onChange={(e, v) => {
                                            setSelectedTemplate(v)
                                        }}
                                    />
                                </div>
                            </> : <></>}

                            <div className='col-12 mt-4 text-end'>
                                <LoadingButton
                                    // loading
                                    variant='outlined'
                                    onClick={handleTemplateNavigation}

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
            <Modal
                size="xl"
                show={itemmodal}
                backdrop="static"
                centered
                contentClassName="border-0 rounded"
                className="zindex1280"
                backdropClassName="zindex1280"
                onHide={() => ItemCloseModal()}
            >
                <Modal.Header className="pt-2 pb-2 bgheaderCards">
                    <Modal.Title id="modal-heading">
                        <div className="d-flex align-items-center f14 text-white">
                            RFQ Id : {firstRfq?.id}
                        </div>
                    </Modal.Title>

                    <IconButton
                        onClick={() => ItemCloseModal()}
                        size="small"
                        edge="start"
                    >
                        <HiOutlineX className="f20 text-white" />
                    </IconButton>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3">
                        <div className="row">
                            <div style={{ height: '400px', width: '100%' }}>
                                {selectedPRITemModal.length > 0 ? (
                                    <DataGrid
                                        rows={selectedPRITemModal}
                                        columns={prrfqcolumn}
                                        pageSize={10}
                                        checkboxSelection
                                        onRowSelectionModelChange={(ids) => selectItemsById(ids)}
                                        rowSelectionModel={selectedItemsActive}
                                        rowHeight={40}
                                        columnHeaderHeight={40}
                                        className="f13 border-0"
                                        disableRowSelectionOnClick
                                        isRowSelectable={(params) => {
                                            return !params?.row?.eventId;
                                        }}
                                    />
                                ) : (
                                    <div className="text-center text-danger">
                                        {noQuotesMessage ?? "No quotes available. You cannot select any line items."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>


            <Modal
                size="xl"
                show={rfqprcartmodal}
                backdrop="static"
                centered
                contentClassName="border-0 rounded"
                className="zindex1280"
                backdropClassName="zindex1280"
                onHide={() => rfqPrCartCloseModal()}
            >
                <Modal.Header className="pt-2 pb-2 bgheaderCards">
                    <Modal.Title id="modal-heading">
                        <div className="d-flex align-items-center f14 text-white">
                            {selectedBidType?.bidTypeId == 1
                                ? "Create Forward Auction From PR"
                                : selectedBidType?.bidTypeId == 2
                                    ? "Create Reverse Auction From PR"
                                    : selectedBidType?.bidTypeId == 3
                                        ? "Create Freight Auction From PR"
                                        : selectedBidType?.bidTypeId == 4
                                            ? "Create Formula Based Auction From PR"
                                            : selectedBidType?.bidTypeId == 5
                                                ? "Create French Forward Auction From PR"
                                                : selectedBidType?.bidTypeId == 6
                                                    ? "Create French Reverse Auction From PR"
                                                    : "Create Auction From PR"}
                        </div>
                    </Modal.Title>
                    <div className="action-wrap">
                        <IconButton
                            onClick={() => rfqPrCartCloseModal()}
                            size="small"
                            edge="start"
                        >
                            <HiOutlineX className="f20 text-white" />
                        </IconButton>
                    </div>
                </Modal.Header>

                <Modal.Body className="p-0">
                    <div className="p-3">
                        <div className="row">
                            <div style={{ height: '400px', width: '100%' }}>
                                <DataGrid
                                    getRowId={getBRRowId}
                                    rows={Array.from(rfqItemSet)}
                                    columns={prauctioncolumn}
                                    pageSize={10}
                                    onSelectionModelChange={(ids) => selectItemsById(ids)}
                                    selectionModel={selectedItemsActive}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                    className="f13 border-0"
                                    disableSelectionOnClick
                                />
                            </div>
                        </div>
                        <div className="row justify-content-end">
                            <div className="col-md-12 text-end">
                                <LoadingButton
                                    //loading={prloader}
                                    variant="outlined"
                                    size="medium"
                                    className=" rounded-pill me-2"
                                    onClick={() => createAuctionFromPR()}
                                >
                                    <span className="text-capitalize">Submit</span>
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
const top100Films = [
    { label: "Singin' in the Rain", year: 1952 },
    { label: 'Toy Story', year: 1995 },
    { label: 'Bicycle Thieves', year: 1948 },
    { label: 'The Kid', year: 1921 },
    { label: 'Inglourious Basterds', year: 2009 },
    { label: 'Snatch', year: 2000 },
    { label: '3 Idiots', year: 2009 },
    { label: 'Monty Python and the Holy Grail', year: 1975 },
];
export default ManageRFI