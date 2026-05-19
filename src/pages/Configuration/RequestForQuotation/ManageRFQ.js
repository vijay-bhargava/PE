import React, { useCallback, useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, Box, Button, Chip, Drawer, FormControl, FormControlLabel, IconButton, Radio, RadioGroup, TextField, Tooltip } from '@mui/material';
import { HiOutlineX, HiPlusSm, HiTrash } from "react-icons/hi";
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge, Dropdown, Modal } from 'react-bootstrap';
import { actionTypes, useStateValue } from '../../../store';
import { bidlist, formatDateViaLocale, getRFQManageFind } from '../../../utils/common/utility';
import { DataGrid, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { AuctionModalFromRFQ, eventMultiCurrencyList, findObjListByValueFromArray, getPayloadWithStage, invitedSupplierForAuction, pullMessageCount, supplierLoadingFactor, fetchAttachmentsFromPRItems, handlesaveAttachment } from '../../../utils/common';
import FilterRFQCell from './FilterRFQCell';
import { BackButton } from '../../../utils/common/component';
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { ApiClient, api } from '../../../Apiclient';
import NotFoundPage from '../../../components/NotAllowed';
import FilterListIcon from '@mui/icons-material/FilterList';
import { toast } from 'react-toastify';
import CryptoJS from "crypto-js";
import { useCookies } from "react-cookie";

const ManageRFQ = ({ claimType }) => {

    const navigate = useNavigate();

    const [{ atoken, rtoken, customerid, userDetail, customersuffix, eventId, eventType, roleClaims }, dispatch] = useStateValue();
    const [cookies, setCookie] = useCookies(["patkn", "prtkn"]);
    const apiClient = new ApiClient(customersuffix);
    const [state, setState] = useState({
        opensidebar: false,
    });

    const [listreadaccessLevel, setListReadAccessLevel] = useState('');
    const [isreadDisabled, setIsReadDisabled] = useState(true);
    const [iscreateDisabled, setIsCreateDisabled] = useState(true);
    const [iseditDisabled, setIsEditDisabled] = useState(true);
    useEffect(() => {
        dispatch({ type: actionTypes.SET_Bidtype, value: null });
        setCookie("pcbt", "", { path: "/", maxAge: 0 });
        // if (userDetail && atoken)
        //     if (userDetail?.roleId) {
        //         getRoles()
        //     }
    }, [userDetail, atoken])


    // const getRoles = async () => {
    //     const dataR = {
    //         roleId: parseInt(userDetail?.roleId),
    //         featureName: "Request for Quotation",
    //         claimType: "List",
    //     }

    //     const queryParams = buildQueryParams(dataR)
    //     const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken)
    //     if (res) {
    //         const data = res?.data
    //         console.log("My Roles & My Right")
    //         console.table(res?.data)
    //         if (data.length === 0) {
    //             setIsReadDisabled(false);
    //         }
    //         dispatch({ type: actionTypes.SET_RoleClaims, value: data });
    //         const accessLevels = res?.data.map(item => {
    //             if ((item.claimType === 'List') && (item.claimValue === 'Read')) {
    //                 setListReadAccessLevel(item.accessLevel)
    //             }
    //             if ((item.claimType === 'List') && (item.claimValue === 'Create') && (item.accessLevel === 'None')) {
    //                 setIsCreateDisabled(false);
    //             }
    //             if ((item.claimType === 'List') && (item.claimValue === 'Read') && (item.accessLevel === 'None')) {
    //                 setIsReadDisabled(false);
    //             }

    //             if ((item.claimType === 'List') && (item.claimValue === 'Edit') && (item.accessLevel === 'None')) {
    //                 setIsEditDisabled(false);
    //             }

    //         }).filter(item => item !== null);
    //         accessLevels.forEach(level => {
    //         });

    //     }

    // }


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
            headerName: 'RFQ Subject',
            flex: 2,
            minWidth: 120,
            valueGetter: (params) => {
                // Combine all searchable text for this column
                const subject = params?.row?.subject || '';
                const rfqSubject = params?.row?.rfqSubject || '';
                const id = params?.row?.id || '';
                const eventCode = params?.row?.eventCode || '';
                return `${rfqSubject} ${subject} ${id} ${eventCode}`.trim();
            },
            renderCell: (params) => (
                <div
                    title={params?.formattedValue}
                    onClick={() => {
                        if (iseditDisabled) {
                            navigate(
                                !params?.row.activityId
                                    ? `/configuration/manage-rfq/${params?.row.id}`
                                    : `/configuration/manage-rfq/${params?.row.id}?ActivityId=${params?.row.activityId}`
                            );
                        }
                    }}
                    className='pointer'
                >
                    <div className='content-text' title={params?.row?.rfqSubject}>
                        {params?.row?.rfqSubject}
                    </div>
                    <div className='content-text mt-1'>
                        <div className='content-text mt-1' title={params?.row.subject}>
                            <span>{params?.row.subject}</span>
                        </div>
                        {!params?.row.eventCode && <>
                            <span className='content-text'>RFQ ID: </span><span className='content-text'>{params?.row.id}</span>
                        </>}
                        {params?.row.eventCode && <>
                            <span className='content-text'> {params?.row.eventCode}</span>
                        </>}
                    </div>
                </div>
            )
        },


        {
            field: "startDate",
            headerName: "Start Date",
            flex: 1,
            minWidth: 80,
            valueGetter: (params) => {
                return params?.row?.startDate ? formatDateViaLocale(params?.row?.startDate, userDetail) : '';
            },
            renderCell: (params) => (
                <div
                    className={`content-text ${iseditDisabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                    onClick={() => {
                        if (iseditDisabled) {
                            navigate(
                                !params?.row.activityId
                                    ? `/configuration/manage-rfq/${params?.row.id}`
                                    : `/configuration/manage-rfq/${params?.row.id}?ActivityId=${params?.row.activityId}`
                            );
                        }
                    }}
                >
                    {params?.row?.startDate
                        ? formatDateViaLocale(params?.row?.startDate, userDetail)
                        : ""}
                </div>
            ),
        },

        {
            field: "endDate",
            headerName: "End Date",
            flex: 1,
            minWidth: 80,
            valueGetter: (params) => {
                return params?.row?.endDate ? formatDateViaLocale(params?.row?.endDate, userDetail) : '';
            },
            renderCell: (params) => (
                <div
                    className={`content-text ${iseditDisabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                    onClick={() => {
                        if (iseditDisabled) {
                            navigate(
                                !params?.row.activityId
                                    ? `/configuration/manage-rfq/${params?.row.id}`
                                    : `/configuration/manage-rfq/${params?.row.id}?ActivityId=${params?.row.activityId}`
                            );
                        }
                    }}
                >
                    {params?.row?.endDate
                        ? formatDateViaLocale(params?.row?.endDate, userDetail)
                        : ""}
                </div>
            ),
        },
        {
            field: 'stage',
            headerName: 'Status',
            flex: 1,
            minWidth: 80,
            valueGetter: (params) => {
                return params?.row?.stage || '';
            },
            renderCell: (params) => {
                const statusClass =
                    params?.row?.stage === "Draft" || params?.row?.stage === "Cancel"
                        ? "text-danger"
                        : "text-primary";

                return (
                    <div
                        className={`content-text ${statusClass} ${iseditDisabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                        onClick={() => {
                            if (iseditDisabled) {
                                navigate(
                                    !params?.row.activityId
                                        ? `/configuration/manage-rfq/${params?.row.id}`
                                        : `/configuration/manage-rfq/${params?.row.id}?ActivityId=${params?.row.activityId}`
                                );
                            }
                        }}
                    >
                        {params?.row?.stage}
                    </div>
                );
            }
        },
        {
    field: "createdByName",
    headerName: "Created By",
    flex: 1,
    minWidth: 120,
    valueGetter: (params) => {
        return params?.row?.createdByName || "";
    },
    renderCell: (params) => (
        <div
            className={`content-text ${iseditDisabled ? "cursor-pointer" : "cursor-not-allowed"}`}
            onClick={() => {
                if (iseditDisabled) {
                    navigate(
                        !params?.row.activityId
                            ? `/configuration/manage-rfq/${params?.row.id}`
                            : `/configuration/manage-rfq/${params?.row.id}?ActivityId=${params?.row.activityId}`
                    );
                }
            }}
            title={params?.row?.createdByName}
        >
            {params?.row?.createdByName}
        </div>
    ),
},

        {
            field: "Action",
            headerName: "Action",
            flex: 1,
            minWidth: 80,
            renderCell: (params) => (
                <Chip
                    size="small"
                    color="primary"
                    tabIndex={-1}
                    className="ps-1 me-3 align-center"
                    variant="outlined"
                    label="Select Items"
                    onClick={() => {
                        if (iseditDisabled) {
                            ItemOpenModal();
                            handleADDtoRFQ(params?.row.id);
                        }
                    }}
                    disabled={["Draft", "Under Pre Approval", "Cancel", null].includes(params.row.stage)}
                />
            ),
        },
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

    //const [rfqItemSet, setRFQItemSet] = useState(new Set());
    const [rfqItemSet, setRFQItemSet] = useState([]);
    const [rfqVendorInvitedList, setRfqVendorInvitedList] = useState([]);
    const [rfqMultiCurrencyList, setrfqMultiCurrencyList] = useState([]);
    console.log("setRFQItemSet:", rfqItemSet)
    console.log("rfqVendorInvitedList:", rfqVendorInvitedList)
    console.log("rfqMultiCurrencyList:", rfqMultiCurrencyList)
    const [action, setAction] = useState(false);

    const prrfqcolumn = [
        {
            field: "itemCode",
            headerName: "Item Code",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <div className="content-text">
                    {params?.formattedValue}
                </div>
            ),
        },
        {
            field: "itemName",
            headerName: "Item / Service",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        {
            field: "quantity",
            headerName: "Quantity / uom",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <div className="content-text">
                    {`${params?.formattedValue} (${params?.row?.uom || ''})`}
                </div>
            ),
        },
        {
            field: "targetPrice",
            headerName: "Target Price",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        {
            field: "plant",
            headerName: "Delivery Location",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        // action && {
        //     field: "Action",
        //     headerName: "Action",
        //     flex: 1,
        //     minWidth: 120,
        //     renderCell: (params) => (
        //         <Tooltip title={"Remove Item"}>

        //             <HiTrash
        //                 className="text-danger text-center ms-2"
        //                 onClick={() => handleDeleteItemSet(params.id)}
        //             />

        //         </Tooltip>
        //     ),
        // },
    ];

    const prauctioncolumn = [
        {
            field: "rfqId",
            headerName: "RFQ Id",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        {
            field: "itemName",
            headerName: "Item / Service",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        {
            field: "quantity",
            headerName: "Quantity",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <div className="content-text">
                    {`${params?.formattedValue} (${params?.row?.uom || ''})`}
                </div>
            ),
        },
        {
            field: "minimumdecreament",
            // headerName: "Minimum Decrement",
            headerName:
                selectedBidType?.bidTypeId === 1 || selectedBidType?.bidTypeId === 5
                    ? "Minimum Increment"
                    : "Minimum Decrement",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        {
            field: "bidStartprice",
            headerName: "Start Unit Price",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
            ),
        },
        {
            field: "targetPrice",
            headerName: "Target Price",
            flex: 1,
            minWidth: 100,
            renderCell: (params) => (
                <div className="content-text">{params?.formattedValue}</div>
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

    // const handleDeleteItemSet = (itemId) => {
    //     setRFQItemSet((prevSet) => {
    //         const newSet = new Set(prevSet);
    //         for (let item of newSet) {
    //             if (item.id === itemId) {
    //                 newSet.delete(item);
    //                 break;
    //             }
    //         }
    //         return newSet;
    //     });
    // };
    const handleDeleteItemSet = (itemId) => {
        setRFQItemSet((prev) => prev.filter(item => item.id !== itemId));
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

    // const handleRFQItemSet = (selectedItems, unselectedItems) => {
    //     setRFQItemSet((prevSet) => {
    //         const newSet = new Set(prevSet);

    //         // Add selected items to the set
    //         selectedItems.forEach((newItem) => {
    //             // Check if the set already has an item with the same ID
    //             const existingItem = Array.from(newSet).find(item => item.id === newItem.id);
    //             if (!existingItem) {
    //                 newSet.add(newItem);
    //             }
    //         });

    //         // Remove unselected items from the set
    //         unselectedItems.forEach((itemToRemove) => {
    //             newSet.forEach((item) => {
    //                 if (item.id === itemToRemove.id) {
    //                     newSet.delete(item);
    //                 }
    //             });
    //         });
    //         return newSet;
    //     });
    // };
    const handleRFQItemSet = (selectedItems, unselectedItems) => {
        setRFQItemSet((prev) => {
            let newItems = [...prev];

            // add unique selected items
            selectedItems.forEach(newItem => {
                if (!newItems.find(item => item.id === newItem.id)) {
                    newItems.push(newItem);
                }
            });

            // remove unselected items
            newItems = newItems.filter(item =>
                !unselectedItems.some(u => u.id === item.id)
            );

            return newItems;
        });
    };

    const handleADDtoRFQ = (id) => {

        pullLineItemList(id)
    };


    const pullLineItemList = async (id) => {
        var data = {
            Id: id
        };
        const queryParams = buildQueryParams(data);
        // const res = await apiClient.getres(`api/RFQManage/FindByIdForPR?${queryParams}`, atoken);
        const res = await apiClient.getres(`api/RFQManage/FindById?${queryParams}`, atoken);
        if (res) {

            const data = res?.data?.result ?? [];

            const selectedRfqId = data?.find((x) => x.id == id) ?? null;

            setRfqVendorInvitedList(selectedRfqId?.rfqVendorInvited)
            setrfqMultiCurrencyList(selectedRfqId?.multicurrencytList || [])
            if (selectedRfqId) {

                // const hasClosedVendor = selectedRfqId.rfqVendorInvited.some((vendor) => vendor.status !== "Open");
                const hasClosedVendor = selectedRfqId?.rfqVendorInvited.some(
                    (vendor) => vendor?.status !== "Open" && vendor?.isTermsAccepted == "Y"
                );

                if (hasClosedVendor) {
                    const selectedItems = selectedRfqId?.rfqParameters.map(item => ({
                        ...item,
                        rfqId: selectedRfqId.id ?? 0,
                        rfqSubject: selectedRfqId.subject,
                        rfqDescription: selectedRfqId.description,
                        rfqTermandCondition: selectedRfqId.termandCondition,
                        rfqPurchOrgId: selectedRfqId.purchOrgId,
                        rfqPurchGrpId: selectedRfqId.purchGrpId,
                        rfqIsMultiCurrency: selectedRfqId.isMultiCurrency
                    }));
                    setSelectedPRItemModal(selectedItems);
                    setNoQuotesMessage("");
                } else {
                    setSelectedPRItemModal([]);
                    setNoQuotesMessage("None of the vendors have quoted. Cannot proceed.");
                }

                findSelectedItemsActive();
                setFirstRFQ(selectedRfqId);
            }
        }
    }

    const handleCreateAuction = () => {

        setShowAuctionDropdown(true);
    };

    const roundTo3 = (num) => {
        if (!num) return 0;
        return parseFloat(num.toFixed(3));
    };
    const handleAuctionTypeSelection = (auctionType) => {

        setSelectedBidType(auctionType);

        setRFQItemSet((prev) =>
            prev.map(item => {
                let bidStartprice =
                    auctionType.bidTypeId === 1 || auctionType.bidTypeId === 5
                        ? item.maxPrice
                        : item.minPrice;

                let decrementBase =
                    auctionType.bidTypeId === 1 || auctionType.bidTypeId === 5
                        ? item.maxPrice
                        : item.minPrice;

                return {
                    ...item,
                    bidStartprice,
                    minimumdecreament: roundTo3(decrementBase ? decrementBase * 0.01 : 0)
                };
            })
        );

        rfqPrCartOpenModal();
    };



    //pr to auction
    const createAuctionFromPR = async () => {
        //setPRLoader(true)
        const rfqItem = Array.from(rfqItemSet);
        if (rfqItem.length == 0) {
            toast.info("Please select atleast one line item to create auction.", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000,
            });
        }
        else {
            // Get RFQ info from the first selected item instead of stale firstRfq state
            const firstItem = rfqItem[0];
            const activeRFQ = recorddata?.find((x) => x.id === firstItem.rfqId) || firstRfq;

            const data = {
                subject: activeRFQ?.subject,
                description: activeRFQ?.description,
                bidSubTypeId: 81,
                bidClosingType: 'A',
                showRankToVendor: 'Y',
                maximumExtension: -1,
                extensionDuration: 2,
                hideVendor: false,
                hidePrice: false,
                baseCurrency:
                    userDetail && userDetail?.defaultCurrency
                        ? userDetail?.defaultCurrency
                        : "INR",
                tnC: activeRFQ?.termandCondition,
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
                multicurrencytList: eventMultiCurrencyList(rfqMultiCurrencyList) || [],
                isMultiCurrency: activeRFQ?.isMultiCurrency || false,
                createdById: userDetail?.id,
                createdByName: userDetail?.name,
                customerId: userDetail?.customerId,
                bidParamater: AuctionModalFromRFQ(rfqItem, userDetail),
                bidVendorInvited: invitedSupplierForAuction(rfqVendorInvitedList)
            };

            const statedata = {
                EventType: "Auction",
                CustomerId: customerid,
                EventId: 0,
                OrgId: activeRFQ?.purchOrgId,
                OrgGroupId: activeRFQ?.purchGrpId,
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
                
                // Fetch and save RFQ attachments to the new Auction
                try {
                    const rfqAttachments = await fetchAttachmentsFromPRItems(rfqItem, 'Auction', atoken, customerid);
                    if (rfqAttachments && rfqAttachments.length > 0) {
                        const attachmentsToSave = rfqAttachments.map(att => ({
                            ...att,
                            eventId: id,
                            createdById: userDetail?.id,
                            createdByName: userDetail?.name
                        }));
                        await handlesaveAttachment(attachmentsToSave, id, atoken);
                        console.log(`Saved ${attachmentsToSave.length} attachments from RFQ to Auction`);
                    }
                } catch (error) {
                    console.error('Error saving RFQ attachments to Auction:', error);
                    // Don't block auction creation if attachment save fails
                }
                
                const bidTypeMap = {
                    1: 'Forward Auction',
                    2: 'Reverse Auction',
                    3: 'Freight Auction',
                    4: 'Formula Based Auction',
                    5: 'French Forward Auction',
                    6: 'French Reverse Auction'
                };
                const BidType = bidTypeMap[selectedBidType?.bidTypeId];
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
                toast.success(`Auction Created successfully.`);
            }
        }
    };
    //rfq tO auction data ends

    //for communication hub
    useEffect(() => {

        const data = queryParams.get("CommId")?.trim();
        if (data) {
            dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
        }
    }, [])

    const [gridloading, setGridloading] = useState(false);
    const pullRFQManageFind = () => {

        if (!isreadDisabled) {
            setRecorddata([]);
            return;

        }
        var data = {
            CustomerId: customerid,
            SortingColumn: "Id",
            // AccessLevel: listreadaccessLevel
        };
        setGridloading(true)
        console.log('request id pullRFQManageFind', data);
        getRFQManageFind(data, atoken).then((res) => {
            setGridloading(false)
            console.log('response pullRFQManageFind', res);
            if (res && res?.length > 0) {

                //Role handling for preventing user who dont have create rights to see draft event
                if (accessLevel?.list?.created.toLowerCase().trim() == "none") {
                    setRecorddata(res?.filter((x) => x.status && x.status != "Draft"))
                }
                else {
                    setRecorddata(res)
                }


            }
        });
    };
    useEffect(() => {
        pullRFQManageFind();
    }, [atoken, customerid]);


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

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
        // const pullMessageList = async () => {
        //     var data = {
        //         CustomerId: customerid,
        //         EventType: "RFQ",
        //         //EventId: 0,
        //         SortingColumn: "Id",
        //         UserId: userDetail?.id

        //     };
        //     const queryParams = buildQueryParams(data)
        //     const res = await apiClient.getres(`api/Communication/Find?${queryParams}`, atoken)
        //     if (res) {

        //         const data = res?.data ?? []

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

    const closeDivVisibility = () => {
        setDivVisible(false);
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

    const handleTemplateNavigation = useCallback(async () => {

        if (value != "new") {
            const data = {
                EventId: selectedTemplate?.eventId,
                EventType: selectedTemplate?.eventType
            };
            const queryParams = buildQueryParams(data)

            const res = await apiClient.postres(`/api/RFQManage/RFQTemplateClone?${queryParams}`, null, atoken)
            if (res) {
                navigate(`/configuration/manage-rfq/${res?.data[0]?.id}`)
            }

        }
        else {

            navigate(`/configuration/manage-rfq/add`)
        }


    }, [selectedTemplate])


    function CustomToolbar({ onFilterClick }) {
        return (
            <GridToolbarContainer className="row">
                <div className="d-flex justify-content-between w-100 align-items-center">
                    {/* Left side buttons */}
                    <div className="d-flex gap-2">
                        <GridToolbarColumnsButton />
                        <GridToolbarFilterButton />
                        <GridToolbarDensitySelector />
                        <GridToolbarExport />
                    </div>

                    {/* Right side: Quick Filter + Custom Filter Icon */}
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
                </div>
            </GridToolbarContainer>
        );
    }
    // function CustomToolbar() {
    //     return (
    //         <GridToolbarContainer className="row">
    //             <div className="d-flex justify-content-between">
    //                 <div>
    //                     <GridToolbarColumnsButton />
    //                     <GridToolbarFilterButton />
    //                     <GridToolbarDensitySelector />
    //                     <GridToolbarExport />


    //                 </div>
    //                 <div>
    //                     <GridToolbarQuickFilter />
    //                 </div>
    //             </div>
    //         </GridToolbarContainer>
    //     );
    // }


    if (!isreadDisabled) {
        return <>
            <NotFoundPage
                heading={`You Are Not Authorized To View List`}
                body1={`Contact your Administrator for view rights`}
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
                                <BackButton title="Manage RFQ" />
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <Button
                                    variant="text"
                                    size="large"
                                    color="primary"
                                    startIcon={<HiPlusSm />}
                                    className="text-capitalize blue-text font-normal me-3"
                                    onClick={OpenModal}
                                    disabled={!iscreateDisabled}
                                >
                                    Add New
                                </Button>

                                {/* {rfqItemSet && rfqItemSet.size > 0 && ( */}
                                {rfqItemSet && rfqItemSet.length > 0 && (
                                    <div className="actionpin-wrap d-flex align-items-center">
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant="text"
                                                size="small"
                                                className="text-capitalize font-normal"
                                            >
                                                <span className="text-primary fw500 font-small">
                                                    Create Event
                                                </span>
                                                <Badge className="ml-3rem" color="primary" pill>
                                                    {/* {rfqItemSet.size} */}
                                                    {rfqItemSet.length}
                                                </Badge>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => handleCreateAuction("Auction")}>
                                                    <span className="f11 fw500">Create Auction</span>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        {showAuctionDropdown && (
                                            <Dropdown className="ms-3">
                                                <Dropdown.Toggle
                                                    variant="outlined"
                                                    size="small"
                                                    className="text-capitalize font-normal"
                                                >
                                                    <span className="text-primary fw500 font-small">
                                                        Select Auction Type
                                                    </span>
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu>
                                                    {[
                                                        { label: "Forward Auction", bidTypeId: 1 },
                                                        { label: "Reverse Auction", bidTypeId: 2 },
                                                        { label: "Freight Auction", bidTypeId: 3 },
                                                        { label: "Formula Based Auction", bidTypeId: 4 },
                                                        { label: "French Forward Auction", bidTypeId: 5 },
                                                        { label: "French Reverse Auction", bidTypeId: 6 },
                                                    ].map((option) => (
                                                        <Dropdown.Item
                                                            key={option.bidTypeId}
                                                            onClick={() => handleAuctionTypeSelection(option)}
                                                        >
                                                            <span className="f11 fw500">{option.label}</span>
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="row gx-0 flex-grow-1">
                            <div className="col-12 mb-3 d-flex flex-column" style={{ height: '100%' }}>
                                {gridloading ? (
                                    <GridSkeleton />
                                ) : recorddata.length === 0 ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                        <h5 className="text-muted">No RFQ found</h5>
                                    </div>
                                ) : (
                                    <div className="data-grid-wrapper flex-grow-1" style={{ overflow: 'hidden' }}>
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
                                            className="f13 border-0 consistent-datagrid"
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            disableDensitySelector
                                            disableRowSelectionOnClick
                                            disableColumnResize
                                            disableColumnReorder
                                            sx={{
                                                '& .MuiDataGrid-main': {
                                                    overflow: 'hidden'
                                                },
                                                '& .MuiDataGrid-virtualScroller': {
                                                    overflowX: 'hidden !important'
                                                }
                                            }}
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
                                        <IconButton onClick={closeDivVisibility} size="small" edge="start">
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
                contentClassName='border-0 rounded-default'
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
                                        <FormControlLabel value="new" control={<Radio />} label="Create a New RFQ" />
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
                                        onOpen={() => {
                                            if (templatelist.length === 0)
                                                getTemplateList();
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
                size="lg"
                show={itemmodal}
                backdrop="static"
                centered
                className="zindex1280"
                backdropClassName="zindex1280"
                onHide={ItemCloseModal}
            >
                <Modal.Header className="pt-2 pb-2 modal-custom-header">
                    <Modal.Title id="modal-heading">
                        <div className="d-flex align-items-center f14 text-white">
                            RFQ Id : {firstRfq?.id}
                        </div>
                    </Modal.Title>

                    <IconButton onClick={ItemCloseModal} size="small" edge="start">
                        <HiOutlineX className="f20 text-white" />
                    </IconButton>
                </Modal.Header>


                <Modal.Body className="p-0">
                    <div className="bg-white p-3">
                        <div className="row">

                            <div className="modal-content-height">
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
                                        className="f13 bg-white"
                                        disableRowSelectionOnClick
                                        isRowSelectable={(params) => {
                                            const row = params?.row;
                                            if (row?.eventType === "PR") return true;
                                            return !row?.eventId;
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
                                ? "Create Forward Auction From RFQ"
                                : selectedBidType?.bidTypeId == 2
                                    ? "Create Reverse Auction From RFQ"
                                    : selectedBidType?.bidTypeId == 3
                                        ? "Create Freight Auction From RFQ"
                                        : selectedBidType?.bidTypeId == 4
                                            ? "Create Formula Based Auction From RFQ"
                                            : selectedBidType?.bidTypeId == 5
                                                ? "Create French Forward Auction From RFQ"
                                                : selectedBidType?.bidTypeId == 6
                                                    ? "Create French Reverse Auction From RFQ"
                                                    : "Create Auction From RFQ"}
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
                            <div className="modal-content-height">
                                <DataGrid
                                    getRowId={getBRRowId}
                                    rows={Array.from(rfqItemSet)}
                                    columns={prauctioncolumn}
                                    pageSize={10}
                                    onSelectionModelChange={(ids) => selectItemsById(ids)}
                                    selectionModel={selectedItemsActive}
                                    disableDensitySelector

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

export default ManageRFQ