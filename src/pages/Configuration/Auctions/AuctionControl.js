import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import {
	MenuItem, Menu, Tooltip, Switch, TextField,
	Button, Typography, Checkbox,
	InputAdornment, Autocomplete,
	CircularProgress, Box, Alert, Divider
} from "@mui/material";
import PEModal from "../../../components/PEModal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { ExpandLess, ExpandMore, UnfoldLess, UnfoldMore } from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import { ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import { HiDotsVertical, HiOutlineX, HiPencilAlt } from "react-icons/hi";
import * as signalR from "@microsoft/signalr";
import { checkUTC, formatbidtime, getDateFormatPatteronLocale, userampm } from "../../../utils/common/utility";
import AuctionCommunication from "./AuctionCommunication";
import StaggerAuction from "./StaggerAuction";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import { PermissionManager, CLAIM_TYPES, ACTIONS } from "../../../utils/permissionManager";
import GridSkeleton from '../../../components/Skeleton/gridSkeleton';
import BidGraphs from "./BidGraphs";
import { DecimalValueRegEx, getApiErrorMessage } from "../../../utils/common";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import NormalVendorTable from "./NormalVendorTable";
import AuctionDetailBox from "./AuctionDetailBox";
import { PETableSimple } from '../../../components/RFQ/PETable';
import { PEPagination } from '../../../components/RFQ/PEPagination';
import '../../../assets/css/manage-rfq-v2.css';

dayjs.extend(utc);
dayjs.extend(timezone);

const AuctionControl = ({ isDifferentPage = true, onBidStatusChange = () => { }, auctionId }) => {

	const navigate = useNavigate();
	const [{ atoken, customerid, userDetail, customersuffix }, dispatch, thousands_separators] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const [allVendorParticipationDetails, SetAllVendorParticipationDetails] = useState([])
	const [auctionManageData, SetAuctionManageData] = useState([])
	const [vendorListData, setVendorListData] = useState([])
	const [permissionManager, setPermissionManager] = useState(null);
	const [loadingPermissions, setLoadingPermissions] = useState(true);
	const { pageSlug } = useParams();
	const BidId = auctionId || parseInt(pageSlug);
	const location = useLocation();
	const [lineItemsPerPage, setLineItemsPerPage] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [reopenTrigger, setReopenTrigger] = useState(0);
	const pageNumberRef = useRef(pageNumber);
	useEffect(() => {
		pageNumberRef.current = pageNumber;
	}, [pageNumber]);
	const [totalCount, setTotalCount] = useState(0);
	const [runningSlotNumber, setRunningSlotNumber] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed'
	const [showRefreshDialog, setShowRefreshDialog] = useState(false);
	const reconnectAttemptsRef = useRef(0);
	const connectionTimeoutRef = useRef(null);
	const reconnectingTimeoutRef = useRef(null);
	const hasShownDialogRef = useRef(false);

	// Server time sync — poll every 5s to keep countdown accurate regardless of client clock skew
	const serverTimeRef = useRef(null);
	const performanceStartRef = useRef(null);

	useEffect(() => {
		const fetchServerTime = async () => {
			try {
				const response = await apiClient.postres('/api/AuctionParticipation/GetServerTime', null, atoken);
				serverTimeRef.current = new Date(response.data).getTime();
				performanceStartRef.current = performance.now();
			} catch (e) {
				console.error('fetchServerTime error:', e);
			}
		};
		fetchServerTime();
		const interval = setInterval(fetchServerTime, 5000);
		return () => clearInterval(interval);
	}, []);

	const getCurrentServerTime = () => {
		if (serverTimeRef.current == null || performanceStartRef.current == null) return null;
		return serverTimeRef.current + (performance.now() - performanceStartRef.current);
	};
	const [isFullScreen, setIsFullScreen] = useState(isDifferentPage);

	//signalR
	const [loading, setLoading] = useState(false);
	const [isCircleLoading, setIsCircleLoading] = useState(false);
	const [connection, setConnection] = useState(null);
	//console.log("state of connection::", connection?._connectionState)

	// Sticky header state
	const [isHeaderSticky, setIsHeaderSticky] = useState(false);
	const cardRef = useRef(null);

	useEffect(() => {
		if (!pageSlug || !atoken) return;

		// Don't create new connection if dialog is shown or if already connecting/connected
		if (hasShownDialogRef.current || showRefreshDialog) return;

		if (connection && (connection.state === signalR.HubConnectionState.Connected || connection.state === signalR.HubConnectionState.Connecting)) {
			return;
		}

		setConnectionStatus('connecting');

		// Set a timeout to show refresh dialog if connection is not established within 15 seconds
		connectionTimeoutRef.current = setTimeout(() => {
			if (!hasShownDialogRef.current) {
				console.error('Connection timeout: Unable to establish connection within 15 seconds.');
				setConnectionStatus('failed');
				setShowRefreshDialog(true);
				hasShownDialogRef.current = true;
			}
		}, 5000); // 5 seconds timeout
		const host = window.location.host;      // buyer.pe.com
		const cleanHost = host.split(":")[0];   // remove port
		const tenant = cleanHost.split(".")[0];
		const connect = new signalR.HubConnectionBuilder()
			.withUrl(
				`${process.env.REACT_APP_API_CALL}auctionHub?bidId=${parseInt(pageSlug)}`,
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
			.build();

		// Removed automatic reconnection - will be handled manually in onclose

		connect.onclose((error) => {
			console.error('SignalR closed. Error:', error?.message, error?.stack, error);

			// If dialog already shown, don't do anything
			if (hasShownDialogRef.current) {
				setConnection(null);
				return;
			}

			setConnection(null);

			// If connection closed with error, attempt one manual reconnection
			if (error) {
				setConnectionStatus('reconnecting');

				// Set timeout - if not reconnected in 3 seconds, show dialog
				if (!reconnectingTimeoutRef.current) {
					reconnectingTimeoutRef.current = setTimeout(() => {
						if (!hasShownDialogRef.current) {
							console.error('Failed to reconnect. Showing refresh dialog.');
							setConnectionStatus('failed');
							setShowRefreshDialog(true);
							hasShownDialogRef.current = true;
						}
					}, 3000); // 3 seconds timeout
				}

				// Attempt to reconnect once
				setTimeout(() => {
					if (!hasShownDialogRef.current && connect.state === signalR.HubConnectionState.Disconnected) {
						console.log('Attempting manual reconnection...');
						connect.start()
							.then(() => {
								console.log('Reconnected successfully');
								if (reconnectingTimeoutRef.current) {
									clearTimeout(reconnectingTimeoutRef.current);
									reconnectingTimeoutRef.current = null;
								}
								setConnection(connect);
								setConnectionStatus('connected');
								hasShownDialogRef.current = false;
								//toast.success('Connection restored successfully');
							})
							.catch((err) => {
								console.error('Reconnection failed:', err);
								// Let the timeout show the dialog
							});
					}
				}, 500); // Wait 500ms before attempting reconnection
			}
		});

		connect.start()
			.then(() => {
				console.log('SignalR Connected for id: ', pageSlug);

				// Clear all timeouts on successful connection
				if (connectionTimeoutRef.current) {
					clearTimeout(connectionTimeoutRef.current);
					connectionTimeoutRef.current = null;
				}
				if (reconnectingTimeoutRef.current) {
					clearTimeout(reconnectingTimeoutRef.current);
					reconnectingTimeoutRef.current = null;
				}

				setConnection(connect);
				setConnectionStatus('connected');
				reconnectAttemptsRef.current = 0;
				hasShownDialogRef.current = false;
			})
			.catch((err) => {
				console.error('Connection failed: ', err);
				// Initial connection failed, let the timeout show the dialog
				setConnectionStatus('reconnecting');
			});

		return () => {
			// Clear all timeouts and refs on cleanup
			if (connectionTimeoutRef.current) {
				clearTimeout(connectionTimeoutRef.current);
				connectionTimeoutRef.current = null;
			}
			if (reconnectingTimeoutRef.current) {
				clearTimeout(reconnectingTimeoutRef.current);
				reconnectingTimeoutRef.current = null;
			}
			hasShownDialogRef.current = false;

			if (connect) {
				connect.stop().then(() => console.log('SignalR connection stopped.'));
				setConnection(null);
			}
		};
	}, [pageSlug, atoken]);

	useEffect(() => {

		const queryParams = new URLSearchParams(location.search);

		const data = queryParams.get("CommId")?.trim();
		if (data) {
			dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
		}

		// const pullMessageList = async () => {

		//     var data = {
		//         CustomerId: customerid,
		//         SortingColumn: "Id",
		//         EventId: pageSlug,
		//         EventType: "Auction",
		//         CommDetails_CommParticipantUser_UserId: userDetail?.id
		//     };
		//     const queryParams = buildQueryParams(data)
		//     const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken)

		//     if (res) {
		//         const data = res?.data?.result ?? []

		//         dispatch({ type: actionTypes.SET_Notificationlist, value: data });
		//     }


		// }

		// // Only run the pullMessageList function if pageSlug is defined
		// if (pageSlug) {
		//     pullMessageList();
		// }
	}, [pageSlug, customerid, dispatch, atoken]);

	useEffect(() => {
		// Set up the connection and handle incoming updates
		if (connection) {
			connection.on("UpdateAllRanks", (data) => {
				if (data.length !== 0) {
					if (data?.vendors) {
						const vendorData = data?.vendors;
						if (pageSlug === vendorData[0]?.bidId) {

							//alert("UpdateAllRanks", data);
							if (vendorData[0]?.alertExtension === "Y") {
								setBidEndDate(vendorData[0]?.bidEndDate)
								getAuctionManageFind();
								fetchVendorParameterDetailsLineItems(pageNumberRef.current, rowsPerPage, true);
							}

							fetchVendorParameterDetails(pageNumberRef.current, rowsPerPage);
						}
					}
					else {
						if (pageSlug === data[0]?.bidId) {
							//alert("UpdateAllRanks", data);
							if (data[0]?.alertExtension === "Y") {
								setBidEndDate(data?.bidEndDate)
								getAuctionManageFind();
								fetchVendorParameterDetailsLineItems(pageNumberRef.current, rowsPerPage, true);
							}

							fetchVendorParameterDetails(pageNumberRef.current, rowsPerPage);
						}
					}
				}
				else {

					fetchVendorParameterDetails(pageNumberRef.current, rowsPerPage);
				}
			});
		}
	}, [connection, BidId, pageSlug, pageNumberRef.current]);


	useEffect(() => {
		if (connection) {
			const handleAuctionTimeUpdate = (timeUpdate) => {
				//alert("AuctionTimeUpdate", timeUpdate);
				//console.log("Data update received:", timeUpdate);

				const updatedTimeDetail = { ...auctionManageData };
				let isTimeUpdated = false;

				if (updatedTimeDetail[0].id === timeUpdate?.id) {
					const currentDateTime = new Date().toISOString()
					if (timeUpdate?.bidEndDate < currentDateTime) {
						setIsCircleLoading(true);
						setTimeout(() => {
							setIsCircleLoading(false);
							navigate(`/configuration/manage-auction`);
						}, 2000);
					} else {
						isTimeUpdated = true;
						updatedTimeDetail[0].bidStDate = timeUpdate?.bidStDate;
						updatedTimeDetail[0].bidEndDate = timeUpdate?.bidEndDate;
						updatedTimeDetail[0].bidDuration = timeUpdate?.bidDuration;
						updatedTimeDetail[0].actualDuration = timeUpdate?.actualDuration;
						updatedTimeDetail[0].extensions = timeUpdate?.extensions;
						updatedTimeDetail[0].extensionDuration = timeUpdate?.extensionDuration;
					}
				}
				if (isTimeUpdated) {
					SetAuctionManageData(updatedTimeDetail);
					setBidStDate(timeUpdate?.bidStDate);
					setBidEndDate(timeUpdate?.bidEndDate);
				}
			};

			connection.on("AuctionTimeUpdate", handleAuctionTimeUpdate);

			return () => {
				connection.off("AuctionTimeUpdate", handleAuctionTimeUpdate);
			}
		}
	}, [connection, auctionManageData, BidId]);

	useEffect(() => {

		fetchVendorParameterDetailsLineItems()
		//fetchVendorParameterDetails();
		getAuctionManageFind();
	}, [atoken, customerid]);

	// calling AllVendorParticipationDetails api here
	const fetchVendorParameterDetailsLineItems = async (pageNum = pageNumber, pageSize = rowsPerPage, skipFetchDetails = false) => {
		const eventData = {
			BidId: auctionId || parseInt(pageSlug),
			VendorId: 0,
			PageNumber: pageNum,
			PageSize: pageSize,
		};

		setPageNumber(pageNum);
		const queryParams = buildQueryParams(eventData);
		const res = await apiClient.getres(
			`/api/AuctionParticipation/Find?${queryParams}`,
			atoken
		);
		if (res?.data) {

			setLineItemsPerPage(res?.data?.vendorParameterDetails || []);

			if (!skipFetchDetails) {
				fetchVendorParameterDetails(pageNum, pageSize);
			}

			const meta = res.data?.pageMetaData?.[0];
			if (meta) {
				setTotalCount(meta.totalRecords);
				setPage(meta.currentPage - 1);
			}
		}
	};

	useEffect(() => {
		// Fetch role rights on mount so UI doesn't flash access-denied
		getUserRoleRights();
	}, [userDetail?.id]);

	const fetchVendorParameterDetails = async (pageNum = pageNumber, pageSize = rowsPerPage) => {

		const eventData = {
			BidId: auctionId || parseInt(pageSlug),
			PageNumber: pageNum,
			PageSize: pageSize,
		};

		const queryParams = buildQueryParams(eventData);
		const res = await apiClient.get(
			`api/AuctionParticipation/AllVendorParticipationDetails?${queryParams}`,
			//`api/AuctionParticipation/AllVendorParticipationDetails?BidId=${parseInt(pageSlug)}`,
			atoken
		);
		if (res) {

			SetAllVendorParticipationDetails(res?.allVendorParticipationDetail || []);
		}
	};

	const [bidStDateTime, setBidStDate] = useState();
	const [bidEndDateTime, setBidEndDate] = useState();
	const getAuctionManageFind = async () => {

		const res = await apiClient.get(
			`api/AuctionManage/Find?CustomerId=${customerid}&Id=${auctionId || pageSlug}`,
			atoken
		);
		if (res) {

			SetAuctionManageData(res?.result || []);
			setBidStDate(res?.result[0].bidStDate)
			setBidEndDate(res?.result[0].bidEndDate)
			setVendorListData(res?.result[0]?.bidVendorInvited || [])
		}

		if (res?.result[0]?.userAccess?.length > 0) {
			// Initialize Permission Manager with user access data
			const permManager = new PermissionManager(res?.result[0]?.userAccess);
			setPermissionManager(permManager);
		}
	};

	const getUserRoleRights = async () => {
		try {
			const obj = {
				FeatureName: "Auction",
				UserId: userDetail?.id,
				CreatedById: userDetail?.id,
			};
			const queryParams = buildQueryParams(obj);
			const res = await apiClient.getres(`/api/rolemanagement/GetUserRoleRights?${queryParams}`, atoken);
			if (res) {
				const access = res?.data || res?.result?.[0]?.userAccess || res?.result;
				const permManager = new PermissionManager(access);
				setPermissionManager(permManager);
			}
		} catch (err) {
			console.error("getUserRoleRights error", err);
		} finally {
			setLoadingPermissions(false);
		}
	};

	// Simple refresh function
	const refreshData = async () => {
		setIsCircleLoading(true);
		try {

			//getAuctionManageFind();
			if (checkedVendors.length > 0) {
				fetchVendorParameterDetails(pageNumberRef.current, rowsPerPage);
			}
			else {
				getAuctionManageFind();
			}
			setTimeout(() => setIsCircleLoading(false), 800);
		} catch (error) {
			console.error('Error refreshing:', error);
			setIsCircleLoading(false);
		}
	};

	//bid duration timer update manually starts here
	const [adjustValue, setAdjustValue] = useState(0); // The value inside the input field
	const [isValueChanged, setIsValueChanged] = useState(false); // Track if the value is changed by user

	useEffect(() => {
		if (auctionManageData)
			setAdjustValue(auctionManageData[0]?.actualDuration ?? auctionManageData[0]?.bidDuration)
	}, [auctionManageData])

	// Handle increase
	const handleIncrease = () => {
		setAdjustValue(prev => {
			if (prev >= 9999999) {
				return prev;
			}
			const newValue = prev + 1;
			setIsValueChanged(true);
			return newValue;
		});
	};

	// Handle decrease
	const handleDecrease = () => {
		if (adjustValue > 0) {
			setAdjustValue(prev => {
				const newValue = prev - 1;
				setIsValueChanged(true); // Mark as changed
				return newValue;
			});
		}
	};

	const handleBidDurationChange = (e) => {
		let newValue = e.target.value;
		newValue = newValue.replace(/[^\d]/g, '');
		if (newValue === '') {
			setAdjustValue('');
			setIsValueChanged(true);
		} else if (newValue.length <= 7) {
			setAdjustValue(Number(newValue));
			setIsValueChanged(true);
		}
	};

	const handleGoClick = async () => {

		if (adjustValue < 1 || adjustValue === '') {
			toast.error("Please enter bid duration.");
			return;
		}
		if (connection.state !== signalR.HubConnectionState.Connected) {
			console.log("Connection is not in the connected state. Trying to start the connection...");
			await connection.start();
			console.log("Connection started successfully!");
		}
		if (connection.state === signalR.HubConnectionState.Connected) {

			const res = await apiClient.postres(
				`/api/AuctionParticipation/AuctionTimeUpdate?BidId=${auctionId || parseInt(pageSlug)}&additionalMins=${adjustValue}&GroupId=${0}`,
				null,
				atoken
			);

			if (res) {
				//console.log("Bid duration updated successfully.")
				setIsValueChanged(false)
			}
		} else {
			console.error("Unable to connect to the server.");
		}
	};
	//bid duration timer update manually ends here

	const callbackOnpause = useCallback(
		(pass) => {
			getAuctionManageFind()
		},
		[auctionId, pageSlug]
	);

	//timer calculation before bid start here
	const [timeRemaining, setTimeRemaining] = useState("");
	const [bidStatus, setBidstatus] = useState(null);
	console.log("bidStatus:", bidStatus)
	console.log("bid stage:", auctionManageData[0]?.stage)
	const [reOpenSuccess, setReOpenSuccess] = useState(false);

	useEffect(() => {
		let transformedStatus = null;

		if (reOpenSuccess) {
			transformedStatus = 'Open';
		} else if (bidStatus === 'running') {
			transformedStatus = 'Running';
		} else if (bidStatus === null && timeRemaining === '00:00:00') {
			transformedStatus = 'Close';
		}

		if (transformedStatus) {
			onBidStatusChange(transformedStatus);
			if (reOpenSuccess) setReOpenSuccess(false);
		}
	}, [bidStatus, reOpenSuccess]);

	useEffect(() => {
		const calculateTimeRemaining = () => {
			const currentTime = getCurrentServerTime() ?? new Date().getTime();
			const bidStartDate = new Date(checkUTC(bidStDateTime)).getTime();
			const timeDiff = bidStartDate - currentTime;
			if (timeDiff > 0) {
				setTimeRemaining(formatbidtime(timeDiff));
				setBidstatus("not_started");
			} else {
				const bidEndDate = new Date(checkUTC(bidEndDateTime)).getTime();
				const endDiff = bidEndDate - currentTime;
				if (endDiff > 0) {
					setTimeRemaining(formatbidtime(endDiff));
					setBidstatus("running");
				} else {
					setTimeRemaining("00:00:00");
					clearInterval(timer);
					setBidstatus(null);
					refreshData();
				}
			}
		};
		let timer;
		const currentTime = getCurrentServerTime() ?? new Date().getTime();
		const flag = new Date(checkUTC(bidEndDateTime)).getTime() > currentTime;
		if (flag && bidStDateTime && bidEndDateTime) {
			timer = setInterval(calculateTimeRemaining, 1000);
			return () => clearInterval(timer);
		}
	}, [bidStDateTime, bidEndDateTime]);

	//timer calculation before bid start  ends here 

	// Sticky header scroll listener
	useEffect(() => {
		const handleScroll = () => {
			if (cardRef.current) {
				const cardTop = cardRef.current.getBoundingClientRect().top;
				const shouldStick = cardTop <= 70; // When card reaches the main header
				setIsHeaderSticky(shouldStick);
			}
		};

		const mainContent = document.getElementById('mainRightContant');
		if (mainContent) {
			mainContent.addEventListener('scroll', handleScroll);
			return () => mainContent.removeEventListener('scroll', handleScroll);
		}
	}, []);

	// Also listen to window scroll in case it's needed
	useEffect(() => {
		const handleWindowScroll = () => {
			if (cardRef.current) {
				const cardTop = cardRef.current.getBoundingClientRect().top;
				const shouldStick = cardTop <= 70;
				setIsHeaderSticky(shouldStick);
			}
		};

		window.addEventListener('scroll', handleWindowScroll);
		return () => window.removeEventListener('scroll', handleWindowScroll);
	}, []);

	//for the auctiion use
	const [open, setOpen] = useState(false);
	const [currentItemIndex, setCurrentItemIndex] = useState(null); // Store current item index or id
	const [fieldType, setFieldType] = useState('');
	const [startPrice, setStartPrice] = useState('');
	const [bidParamId, setBidParamId] = useState('');
	const [minimumDelta, setMinimumDelta] = useState('');
	const [maskL1Price, setMaskL1Price] = useState(null);
	const [hidePrice, setHidePrice] = useState(null);
	const [showStartPrice, setShowStartPrice] = useState(null);

	const CloseLoadingModal = () => {
		setOpen(false);
		setCurrentItemIndex(null);
	};

	const handleOpen = (type, index, id) => {
		setCurrentItemIndex(index);
		setFieldType(type);
		setBidParamId(id);
		const item = lineItemsPerPage.find(p => p.bidParameterId === id);
		if (type === 'startPrice') {
			setStartPrice(item?.startPrice || '');
		} else if (type === 'minimumDelta') {
			setMinimumDelta(item?.minimumDelta || '');
		}
		setOpen(true);
	};

	const handleSubmit = async (fieldType = "", fieldDecValue = null, fieldFlgBool = null, id) => {

		let finalFieldValue = fieldDecValue;

		if (fieldType === 'startPrice') {
			finalFieldValue = startPrice;
		} else if (fieldType === 'minimumDelta') {

			finalFieldValue = minimumDelta;

			// const matchedParameter = auctionManageData[0]?.bidParamater.find(param => param.id === bidParamId);
			const matchedParameter = lineItemsPerPage?.find(param => param.bidParameterId === bidParamId);
			if (matchedParameter?.decreamentOn === 'A' && parseFloat(finalFieldValue) === matchedParameter?.startPrice
				&& (auctionManageData[0]?.bidTypeID !== 1 && auctionManageData[0]?.bidTypeID !== 5)) {
				toast.error("Minimum decrement should not equal to Start Unit Price");
				return;
			}
			if (matchedParameter?.decreamentOn === 'P' && parseFloat(finalFieldValue) > 20
				&& (auctionManageData[0]?.bidTypeID !== 1 && auctionManageData[0]?.bidTypeID !== 5)) {
				toast.error("Minimum decrement should be less than 20%");
				return;
			}
			if (matchedParameter?.decreamentOn === 'P' && parseFloat(finalFieldValue) > 20
				&& (auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5)) {
				toast.error("Minimum increment should be less than 20%");
				return;
			}
		}

		const enterParamData = {
			BidId: auctionId || parseInt(pageSlug), //int
			ParameterId: fieldFlgBool === null ? bidParamId : id, //int
			FieldName: fieldType, //string
			FieldFlg: fieldFlgBool, //boolean (this can be passed for switches)
			FieldTxt: null, //string (optional if needed)
			FieldValue: parseFloat(finalFieldValue) ? parseFloat(finalFieldValue) : null, //decimal (if applicable)
			CreatedBy: userDetail.id, //int
		};

		try {

			if (connection.state === signalR.HubConnectionState.Connected) {
				const res = await apiClient.postres(
					`/api/AuctionParticipation/UpdateParameterValues`,
					enterParamData,
					atoken
				);
				if (res) {

					fetchVendorParameterDetailsLineItems(pageNumber, rowsPerPage, true);
					//getAuctionManageFind();
					console.log('Parameter updated successfully.');
				}
			} else {
				console.error("Unable to connect to the server.");
			}
		} catch (err) {
			console.error("Error submitting bid: ", err);
		}
		setOpen(false);
	};

	//remove quotes
	const [openRemoveQuote, setOpenRemoveQuote] = useState(false);
	const [vendorQuotedPrice, setVendorQuotedPrice] = useState(0);
	const [vendorParamId, setVendorParamId] = useState(0);
	const [removeRemark, setRemoveRemark] = useState('');
	const [remarkError, setRemarkError] = useState(false);

	const handleOpenModalRemoveQuote = (quotedPrice, id) => {
		setOpenRemoveQuote(true)
		setVendorQuotedPrice(quotedPrice)
		setVendorParamId(id)
	};

	const handleRemoveRestrictRemarks = async (id) => {
		try {
			const res = await apiClient.postres(`/api/AuctionParticipation/RemoveQuotes?HeaderId=${id}&quotedPrice=0&Remarks='remove'`, null, atoken);
			if (res) {
				toast.success('Restrict remark removed successfully.');
				fetchVendorParameterDetails(pageNumberRef.current, rowsPerPage);
			}
		} catch (err) {
			console.error('Error removing restrict remark: ', err);
			toast.error('An error occurred while removing the restrict remark.');
		}
	};

	const CloseRemoveQuoteModal = () => {
		setOpenRemoveQuote(false)
		setVendorQuotedPrice(0)
		setVendorParamId(0)
		setRemoveRemark('');
	};

	const handleRemoveQoutes = async () => {
		try {
			const res = await apiClient.postres(`/api/AuctionParticipation/RemoveQuotes?HeaderId=${vendorParamId}&quotedPrice=${parseFloat(vendorQuotedPrice)}&Remarks=${removeRemark}`, null, atoken)
			if (res) {
				toast.success('Quote Removed Successfully.');
				setOpenRemoveQuote(false)
				setRemoveRemark('');
			}
		} catch (err) {
			console.error("Error removing quotes: ", err);
		}
	};

	const getRankColor = (rankValue) => {
		if (rankValue === 'L1' || rankValue === 'H1') {
			return 'blue'; // L1 should be blue
		} else {
			return 'red';  // Any rank 2 and beyond should also be red
		}
	};

	const [editingVendorId, setEditingVendorId] = useState(null);
	const [editingParameterId, setEditingParameterId] = useState(null);
	const [prebidloading, setPreBidLoading] = useState(false);
	const [prebidValues, setPrebidValues] = useState([]);
	//console.log("prebidValues:", prebidValues)
	const handleBlur = () => {
		setEditingVendorId(null);
		setEditingParameterId(null);
		setRestrictVendorId(null);
		setRestrictParameterId(null);
	};

	const handleEditPrice = (vendorId, bidParameterId) => {
		setEditingVendorId(vendorId);
		setEditingParameterId(bidParameterId);
	};

	const handlePriceChange = (e, sq) => {
		const rawValue = e.target.value;
		const newPrice = parseFloat(rawValue);

		setPrebidValues(prev => {
			const updatedPrices = [...prev];
			const existingVendor = updatedPrices.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId);

			if (rawValue === '') {
				// Keep entry with empty value so TextField doesn't fall back to sq.quotedPrice
				if (existingVendor) {
					existingVendor.quotedPrice = '';
				} else {
					updatedPrices.push({
						id: sq?.id || 0,
						createdById: sq.vendorId,
						bidParameterId: sq.bidParameterId,
						quotedPrice: '',
						customerId: parseInt(customerid),
						bidId: auctionId || parseInt(pageSlug),
						isPrePrice: true,
						bidTypeID: auctionManageData[0]?.bidTypeID,
						bidSubTypeId: auctionManageData[0]?.bidSubTypeId
					});
				}
				return updatedPrices;
			}

			if (newPrice !== 0 && !isNaN(newPrice)) {
				const bidParameter = lineItemsPerPage?.find(param => param.bidParameterId === sq.bidParameterId);
				if ((auctionManageData[0]?.bidTypeID !== 1 && auctionManageData[0]?.bidTypeID !== 5) && bidParameter?.startPrice && Number(newPrice) > bidParameter.startPrice) {
					toast.error(`You cannot enter more than the start price (${bidParameter.startPrice}) for this bid.`);
					return prev;
				}
				if (existingVendor) {
					existingVendor.quotedPrice = newPrice;
				} else {
					updatedPrices.push({
						id: sq?.id || 0,
						createdById: sq.vendorId,
						bidParameterId: sq.bidParameterId,
						quotedPrice: newPrice ?? 0,
						customerId: parseInt(customerid),
						bidId: auctionId || parseInt(pageSlug),
						isPrePrice: true,
						bidTypeID: auctionManageData[0]?.bidTypeID,
						bidSubTypeId: auctionManageData[0]?.bidSubTypeId
					});
				}
			}
			return updatedPrices;
		});
	};


	//restrict vendor
	const [restrictVendorId, setRestrictVendorId] = useState(null);
	//console.log("restrictVendorId:", restrictVendorId)
	const [restrictParameterId, setRestrictParameterId] = useState(null);
	const handleCheckboxRestrict = (vendorId, bidParameterId) => {

		setRestrictVendorId(vendorId);
		setRestrictParameterId(bidParameterId);
	};

	const handleRestricttChange = (e, sq) => {
		const newQuote = e.target.value;
		setPrebidValues(prev => {
			const updatedPrices = [...prev];
			const existingVendor = updatedPrices.find(item => item.createdById === sq.vendorId && item.bidParameterId === sq.bidParameterId);
			if (existingVendor) {
				existingVendor.restrictRemarks = newQuote;
			} else {
				updatedPrices.push({
					id: sq?.id || 0,
					createdById: sq.vendorId,
					bidParameterId: sq.bidParameterId,
					restrictRemarks: newQuote ?? '',
					customerId: parseInt(customerid),
					bidId: auctionId || parseInt(pageSlug),
					isPrePrice: true,
					bidTypeID: auctionManageData[0]?.bidTypeID,
					bidSubTypeId: auctionManageData[0]?.bidSubTypeId
				});
			}
			return updatedPrices;
		});
	};

	const submitPrebid = async () => {
		//console.log("hii there", prebidValues)
		if (prebidValues.length > 0) {
			setPreBidLoading(true);
			for (let prebid of prebidValues) {
				// const bidParameter = auctionManageData[0]?.bidParamater.find((param) => param.id === prebid.bidParameterId);
				const bidParameter = lineItemsPerPage?.find((param) => param.bidParameterId === prebid.bidParameterId);
				if (bidParameter && (auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5)) {
					const newPrice = prebid.quotedPrice;
					if (bidParameter.startPrice && Number(newPrice) < bidParameter.startPrice) {
						toast.error(`Amount should not be less than Start Price (${bidParameter.startPrice}) for this bid.`);
						setPreBidLoading(false);
						return;
					}
				}
			}

			try {
				const res = await apiClient.postres(
					`/api/AuctionParticipation/SubmitPreBid`,
					prebidValues,
					atoken
				);
				if (res) {

					setPrebidValues([]);
					toast.success(`PreBid added successfully.`, {
						toastId: "prebid_added"
					});
					fetchVendorParameterDetails(pageNumberRef.current, rowsPerPage);
				}
				else {
					toast.error("Error fetching response");
				}
			} catch (err) {
				console.error("Error submitting bid: ", err);
				toast.error(getApiErrorMessage(err));
			}
		} else {
			toast.error(`Enter atleast one prebid.`, {
				toastId: "prebid_added",
				autoClose: 2000,
			});
		}
		setPreBidLoading(false);
	}
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const [normalPagination, setNormalPagination] = useState(0);
	const [normalRowsPerPage, setNormalRowsPerPage] = useState(10);

	const handleNormalChangePage = (event, newPage) => {
		setNormalPagination(newPage);
		//new add
		setPageNumber(newPage + 1);
		fetchVendorParameterDetailsLineItems(newPage + 1, rowsPerPage);
	};

	const handleNormalChangeRowsPerPage = (event) => {
		setNormalRowsPerPage(parseInt(event.target.value, 10));
		setNormalPagination(0);
		//new add
		setPageNumber(1); // reset to first page
		fetchVendorParameterDetailsLineItems(1, event.target.value);
	};

	// Main Items Table Component
	const [expandedItemIds, setExpandedItemIds] = useState([]);
	const [expandAll, setExpandAll] = useState(true);
	const [bidControlAnchor, setBidControlAnchor] = useState(null);

	const handleExpandToggle = (id, setExpandedItemIds) => {

		setExpandedItemIds(prevIds =>
			prevIds.includes(id)
				? prevIds.filter(itemId => itemId !== id)
				: [...prevIds, id]
		);
	};

	const handleExpandAll = (setExpandAll) => {
		setExpandAll(true);
	};

	const handleCollapseAll = (setExpandAll) => {
		setExpandAll(false);
	};

	const handleSwitchChange = (setter, handleSubmit, fieldType, id) => (e) => {

		const newValue = e.target.checked;
		setter(newValue);
		handleSubmit(fieldType, 0, newValue, id);
	};

	useEffect(() => {

		if (allVendorParticipationDetails.length > 0) {
			setExpandedItemIds(expandAll ? allVendorParticipationDetails.map(item => item.bidParameterId) : []);
		}
	}, [expandAll, allVendorParticipationDetails]);

	//for Bid details section - collapse by default when auction is running
	const [expanded, setExpanded] = useState(true);

	// Collapse header when bidStatus becomes "running"
	useEffect(() => {
		if (bidStatus === "running") {
			setExpanded(false);
		}
	}, [bidStatus]);
	const [bidOpen, setBidOpen] = useState(false);
	const [fieldBidType, setFieldBidType] = useState('');
	const [subject, setSubject] = useState('');
	const [description, setDescription] = useState('');
	const [showRankToVendor, setShowRankToVendor] = useState('');
	const [maximumExtension, setMaximumExtension] = useState('');

	const handleOpenModal = (type) => {
		setFieldBidType(type);
		// Populate the values based on the field type
		if (type === 'subject') {
			setSubject(auctionManageData[0]?.subject || '');
		} else if (type === 'description') {
			setDescription(auctionManageData[0]?.description?.replace(/<\/?[^>]+(>|$)/g, "") || '');
		} else if (type === 'showRankToVendor') {
			setShowRankToVendor(auctionManageData[0]?.showRankToVendor || '');
		} else if (type === 'maximumExtension') {
			setMaximumExtension(auctionManageData[0]?.maximumExtension || '');
		}
		setBidOpen(true);
	};

	const handleBidDetailsSubmit = async () => {

		let fieldTxt = null;
		let fieldValue = null;

		if (fieldBidType === 'subject') {
			fieldTxt = subject;
		} else if (fieldBidType === 'description') {
			fieldTxt = description;
		} else if (fieldBidType === 'showRankToVendor') {
			fieldTxt = showRankToVendor;
		} else if (fieldBidType === 'maximumExtension') {
			fieldValue = maximumExtension;
		}


		const bidData = {
			BidId: auctionId || parseInt(pageSlug),
			ParameterId: 0,   //0 for biddetails only
			FieldName: fieldBidType, //string
			FieldFlg: false, //boolean
			FieldTxt: fieldTxt ? fieldTxt : null, //string
			FieldValue: parseInt(fieldValue) ? parseInt(fieldValue) : 0,
			CreatedBy: userDetail.id, //int
		};

		try {
			const res = await apiClient.postres(
				`/api/AuctionParticipation/UpdateParameterValues`,
				bidData,
				atoken
			);
			if (res) {
				getAuctionManageFind();
				console.log('Details updated successfully.');
			}
		}
		catch (err) {
			console.error("Error updating bid-details: ", err);
		}
		setBidOpen(false);
	};
	const [approvershow, setApproverShow] = useState(false)
	const handleApprover = (booleanvalue) => {
		setApproverShow(booleanvalue)
	}

	// Check if any vendor has loading factor
	const hasLoadingFactor = React.useMemo(() => {
		return auctionManageData[0]?.bidVendorInvited?.some(
			vendor => vendor.bidLoadingFactor && vendor.bidLoadingFactor.length > 0
		) || false;
	}, [auctionManageData]);


	const CloseBidLoadingModal = () => {
		setBidOpen(false);
		setSubject("");
		setDescription("");
		setShowRankToVendor("");
		setMaximumExtension("");
	};

	//to handle add vendor modal
	const [addVendorModal, setAddVendorModal] = useState(false);
	const handleCloseAddVendorModal = () => {
		setAddVendorModal(false);
		setSelectedVendors([]);
		setCheckedVendors([]);
	}

	const handleShowAddVendorModal = () => {
		getTotalSupplier()
		setAddVendorModal(true);
	}

	const [totalSupplier, setTotalSupplier] = useState([]);
	const [selectedVendors, setSelectedVendors] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredVendors, setFilteredVendors] = useState([]);
	const [checkedVendors, setCheckedVendors] = useState([]);

	useEffect(() => {
		const results = totalSupplier.filter((vendor) =>
			(vendor.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(vendor.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(vendor.email || "").toLowerCase().includes(searchQuery.toLowerCase())
		);
		setFilteredVendors(results);
	}, [searchQuery, totalSupplier]);

	const getTotalSupplier = async () => {

		const obj = {
			CustomerId: customerid,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);
		try {
			if (res?.data) {

				setTotalSupplier(res?.data)
			}
		} catch (err) {
			console.error("Error submitting bid: ", err);
		}
	};

	const handleCheckboxChange = (vendorId, contactId, isChecked, vendor) => {

		const isDuplicateSupplier = selectedVendors.some(
			(selected) => selected.vendorId === vendorId && selected.contactId !== contactId
		);

		if (isDuplicateSupplier) {
			toast.info("User from this Supplier is already added", {
				toastId: "supplier_info",
			});
			return;
		}

		setSelectedVendors((prevSelected) =>
			isChecked
				? [...prevSelected, { vendorId, contactId }]
				: prevSelected.filter((vendor) => vendor.contactId !== contactId)
		);

		setCheckedVendors((prevChecked) =>
			isChecked
				? [
					...prevChecked,
					{
						bidId: auctionId || parseInt(pageSlug),
						emailId: vendor.email,
						vendorID: vendor.vendorId,
						contactId: vendor.contactId,
						customerId: customerid,
						vendorName: vendor.tradeName,
						contactPerson: vendor.contactPerson,
					},
				]
				: prevChecked.filter((item) => item.contactId !== contactId)
		);
	};

	const addVendors = async (event) => {
		if (checkedVendors.length === 0) {
			toast.error(`Please select at least one vendor to invite.`);
			return;
		}

		const vendorParams = checkedVendors.map((vendor) => ({
			bidId: auctionId || parseInt(pageSlug),
			customerId: vendor.customerId,
			emailId: vendor.emailId,
			vendorID: parseInt(vendor.vendorID),
			contactId: vendor.contactId,
			vendorName: vendor.vendorName,
			contactPerson: vendor.contactPerson,
			supplierActionType: "AddVendor",
			// Action: "AddVendor",
			createdById: userDetail?.id,
			createdByName: userDetail?.name
		}));
		//console.log("vendorParamsvendorParams::", vendorParams)
		try {
			const res = await apiClient.postres(
				`/api/AuctionInviteVendors/${auctionId || parseInt(pageSlug)}/Add`,
				vendorParams,
				atoken
			);
			if (res) {
				setAddVendorModal(false)
				toast.success(`vendor invited successfully`, {
					toastId: "addVendor"
				})
				setTimeout(() => {
					refreshData();
				}, 500);
			}
			else {
				return '';
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error));
		}
	};

	//bidgraph
	const [modal, setModal] = useState(false);
	const [selectedParameterData, setSelectedParameterData] = useState([]);
	const OpenModal = (data, index) => {

		const selectedItem = data[index];
		setModal(true);
		getLineWiseGraphData(selectedItem)
	}

	const CloseModal = () => {
		setModal(false);
		getLineWiseGraphData([])
	};

	const getLineWiseGraphData = async (selectedItem) => {
		const obj = {
			BidId: auctionId || pageSlug,
			ParameterId: selectedItem?.bidParameterId,
			BidTypeId: auctionManageData[0]?.bidTypeID
		};
		const queryParams = buildQueryParams(obj);
		const res = await apiClient.getres(
			`/api/AuctionParticipation/BIDQuotesTrendGraph?${queryParams}`,
			atoken
		);

		try {
			if (res?.data) {
				setSelectedParameterData(res?.data)
			}
		}
		catch (err) {
			console.error("Error submitting bid: ", err);
		}
	};

	//handle send reminder
	const [sendReminderModal, setSendReminderModal] = useState(false);
	const [selectedSRVendors, setSelectedSRVendors] = useState([]);
	//console.log("selectedSRVendors::", selectedSRVendors)
	const [vendorRemarks, setVendorRemarks] = useState({}); // State to hold remarks for each vendor
	const [searchQueryReminder, setSearchQueryReminder] = useState('');
	const [filteredVendorsReminder, setFilteredVendorsReminder] = useState([]);

	useEffect(() => {
		const results = vendorListData.filter((vendor) =>
			(vendor.vendorName || "").toLowerCase().includes(searchQueryReminder.toLowerCase()) ||
			(vendor.contactPerson || "").toLowerCase().includes(searchQueryReminder.toLowerCase()) ||
			(vendor.emailId || "").toLowerCase().includes(searchQueryReminder.toLowerCase())
		);
		setFilteredVendorsReminder(results);
	}, [searchQueryReminder, vendorListData]);

	const handleCloseSendReminderModal = () => {
		setSendReminderModal(false);
		setSelectedSRVendors([]);
		setVendorRemarks({});
		setSearchQueryReminder('');
	}
	const handleShowSendReminderModal = () => {
		setSendReminderModal(true);
	}

	const handleSelectAll = (isChecked) => {
		if (isChecked) {
			const allVendors = filteredVendorsReminder.map((vendor) => ({
				bidId: auctionId || parseInt(pageSlug),
				customerId: vendor.customerId,
				emailId: vendor.emailId,
				vendorID: parseInt(vendor.vendorID),
				contactId: vendor.contactId,
			}));
			setSelectedSRVendors(allVendors);
		} else {
			setSelectedSRVendors([]);
		}
	};

	const handleCheckboxSR = (vendor, isChecked) => {
		setSelectedSRVendors((prevSelected) => {
			if (isChecked) {
				// Add the selected vendor with all details if not already in the list
				return [
					...prevSelected,
					{
						bidId: auctionId || parseInt(pageSlug),
						customerId: vendor.customerId,
						emailId: vendor.emailId,
						vendorID: parseInt(vendor.vendorID),
						contactId: vendor.contactId,
					},
				];
			} else {
				// Remove the vendor based on vendorID
				return prevSelected.filter((item) => item.vendorID !== parseInt(vendor.vendorID));
			}
		});
	};

	const handleRemarkChange = (vendorID, remark) => {
		setVendorRemarks((prevRemarks) => ({
			...prevRemarks,
			[vendorID]: remark,
		}));
	};


	const handleSend = async (event) => {
		//event.preventDefault();
		if (selectedSRVendors.length === 0) {
			toast.error(`Please select at least one vendor and enter remarks.`);
			return;
		}

		const payload = {
			Email: selectedSRVendors.map((vendor) => vendor.emailId),
			EventId: auctionId || parseInt(pageSlug),
			EventType: "Auction",
			Stage: null,
			EventSubject: auctionManageData[0]?.subject || null,
			EventCode: auctionManageData[0]?.eventCode || null,
			StartDate: auctionManageData[0]?.bidStDate || null,
			EndDate: auctionManageData[0]?.bidEndDate || null,
			UserType: 'V',
			EventCreatedByName: userDetail?.name || null,
			EventDuration: auctionManageData[0]?.bidDuration || null
		};
		try {
			// const res = await apiClient.postres(`/api/AuctionManage/ BIDActions`, payload, atoken)
			const res = await apiClient.postres(`/api/eventapprover/SendReminder`, payload, atoken)
			if (res) {
				setSendReminderModal(false)
				setSelectedSRVendors([]);
				setVendorRemarks({});
				toast.success(`reminder send successfully`, {
					toastId: "remindertoast"
				})
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error));
			setSendReminderModal(false)
			setSelectedSRVendors([]);
			setVendorRemarks({});
		}
	};

	//handle reOpened
	const [reOpenAuctionModal, setReOpenAuctionModal] = useState(false);
	const [reOpenDate, setReOpenDate] = useState(null);
	const [bidDeadLine, setBidDeadLine] = useState(null);
	const [bidDuration, setBidDuration] = useState(0);
	const [extensions, setExtensions] = useState(0);

	const handleCloseReOpenModal = () => {
		setReOpenAuctionModal(false);
		setSelectedSRVendors([])
		setReOpenDate(null)
		setBidDeadLine(null)
		setBidDuration(0);
		setExtensions(0);
	}

	const handleShowReOpenModal = () => {
		const bidStDate = checkUTC(auctionManageData[0]?.bidStDate);
		setReOpenAuctionModal(true);

		if (bidStDate && !isNaN(new Date(bidStDate).getTime())) {
			const bidStDate2 = dayjs(bidStDate).tz(userDetail?.timeZone);
			setReOpenDate(bidStDate2);
		}
		const bidDuration = auctionManageData[0]?.bidDuration || 0;
		setBidDuration(bidDuration);
		setExtensions(auctionManageData[0]?.extensions || 0);
	};



	const updateBidEndDate = (startDate, duration) => {
		if (startDate && duration > 0) {
			const endDate = dayjs(startDate).tz(userDetail?.timeZone).add(duration, 'minute');
			// Using Day.js to add minutes
			setBidDeadLine(endDate);
			// Convert Day.js object back to native Date
		}
	};
	const updateBidDuration = (startDate, endDate) => {
		if (startDate && endDate) {
			const duration = dayjs(endDate).tz(userDetail?.timeZone).diff(dayjs(startDate).tz(userDetail?.timeZone), 'minute'); // Calculate duration in minutes
			if (duration >= 0 && duration !== bidDuration) { // Avoid overwriting valid durations
				setBidDuration(duration);
			}
		}
	};

	const handleReOpen = async () => {
		setLoading(true);

		if (!reOpenDate) {
			toast.error("Please select a ReOpen Date before proceeding.");
			setLoading(false);
			return;
		}

		if (reOpenDate.isBefore(dayjs().tz(userDetail?.timeZone))) {
			toast.error("ReOpen Date cannot be in the past.");
			setLoading(false);
			return;
		}

		if (bidDuration < 1 || bidDuration === '') {
			toast.error("Please enter bid duration.");
			setLoading(false);
			return;
		}

		const payloadReOpen = {
			bidVendorDetails: null,
			reOpenDate: reOpenDate?.toISOString() ?? new Date().toISOString(),
			bidDeadLine: bidDeadLine?.toISOString(),
			bidDuration,
			bidId: auctionId || parseInt(pageSlug),
			Action: "Reopen",
			extensions,
			stageDto: {
				"eventType": "Auction",
				"currentStage": "Draft",
				"nextStage": "",
				"orgId": 0,
				"orgGroupId": 0
			}
		};

		try {
			const res = await apiClient.postres(`/api/AuctionManage/BIDActions`, payloadReOpen, atoken);
			if (res) {
				setReopenTrigger(prev => prev + 1);
				setReOpenAuctionModal(false);
				setReOpenSuccess(true);

				toast.success("Auction Reopen Successfully.", {
					toastId: "reOpentoast"
				});
				getAuctionManageFind();
				if (auctionManageData[0]?.bidClosingType === "S") {
					fetchVendorParameterDetailsLineItems(pageNumber, rowsPerPage, true);
				}
			} else {
				toast.error("Failed to reopen auction. Please try again.");
			}

		} catch (error) {
			if (error?.response?.status === 404) {
				toast.error("Auction not found. Please contact administrator.");
			} else {
				toast.error(
					error?.message ||
					"Error occurs while reopening auction. Please contact administrator."
				);
			}
		} finally {
			setLoading(false);
		}
	};

	//handle surrogate
	const [actionmodal, setActionModal] = useState({
		surrogateSupplierModal: false,
	});

	const validationSchemaSurrogate = yup.object().shape({
		surrogatename: yup
			.string("Enter Surrogater Name")
			.max(200, "Max 40 character")
			.required("Surrogater name is required"),
		surrogateemail: yup
			.string('Enter email')
			.required('Please enter your email')
			.email('Enter a valid email'),
		supplier: yup
			.object()
			.test('at-least-one', 'At least one supplier is required', (value) => {
				return value && Object.keys(value).length > 0;
			}).required('Suppliers are required')
	});
	const formik_Surrogate = useFormik({
		enableReinitialize: true,
		initialValues: {
			supplier: null,
			surrogatename: "",
			surrogateemail: "",
			surrogateReason: ""
		},
		validationSchema: validationSchemaSurrogate,
		onSubmit: async (values) => {

			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				})
				return
			}

			const payload = {
				"name": values?.surrogatename,
				"vendorId": values?.supplier?.vendorID,
				"VendorDetailId": values?.supplier?.id,
				"email": values?.surrogateemail,
				"bidId": auctionId || parseInt(pageSlug),
				"reason": values?.surrogateReason,
				"stages": {
					"eventType": "Auction",
					"currentStage": "Surrogate",
					"nextStage": "Surrogate",
					"orgId": 0,
					"orgGroupId": 0
				}
			}

			const res = await apiClient.postres(`/api/AuctionManage/BIDSurrogate`, payload, atoken)
			if (res) {
				setActionModal({ ...actionmodal, ["surrogateSupplierModal"]: false })
				toast.success(`suppliers surrogated successfully`, {
					toastId: "surrogatetoast"
				})
				formik_Surrogate.resetForm();
			}
		},
	});

	//handle cancel auction
	const [modalcancelOpen, setModalCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [biderror, setBidError] = useState("");
	const [showTable, setShowTable] = useState(false);

	const handleCancel = () => {
		setModalCancelOpen(true);
	}

	const handleCancelAuctionModal = async (confirm) => {
		if (confirm) {
			if (!cancelReason.trim()) {
				setBidError("This field is required.");
				return;
			}
			else {
				const cancelbuttonvalue = {
					bidId: auctionId || parseInt(pageSlug),
					Status: "Cancel",
					Comment: cancelReason,
					EventType: "Auction",
					CurrentStage: auctionManageData[0]?.stage
				}
				const queryParams = buildQueryParams(cancelbuttonvalue)
				const res = await apiClient.postres(`/api/AuctionManage/BIDCancel?${queryParams}`, null, atoken);
				if (res) {
					toast.success(`BID Cancel successfully.`, {
						toastId: "Cancel_error"
					});
					navigate(`/configuration/manage-auction`);
				}
			}
		} else {
			setModalCancelOpen(false);
			setCancelReason("");
			setBidError("");
		}
	};

	const handleCancelInputChange = (e) => {
		const value = e.target.value;
		if (value.length <= 1000) {
			setCancelReason(value);
			if (value.trim()) {
				setBidError("");
			}
		}
	};

	const toggleFullScreen = () => {
		if (isFullScreen) {
			// Exit full screen - go to manage auction view
			navigate(`/configuration/manage-auction/${BidId}`);
		} else {
			// Enter full screen - go to auction control view
			navigate(`/configuration/auction-control/${BidId}`);
		}
		setIsFullScreen(!isFullScreen);
	};

	const fieldLabelMap = {
		subject: "Subject",
		showRankToVendor: "Show Rank To Vendor",
		maximumExtension: "Maximum Extension",
		description: "Description",
	};


	// Find running slot number for stagger auctions - runs continuously
	useEffect(() => {
		if (auctionManageData[0]?.bidClosingType !== 'S') {
			setRunningSlotNumber(null);
			return;
		}

		const checkRunningSlot = () => {
			if (!auctionManageData[0]?.bidParamater || auctionManageData[0].bidParamater.length === 0) {
				setRunningSlotNumber(null);
				return;
			}

			const currentTime = getCurrentServerTime() ?? new Date().getTime();

			// Get unique group numbers from auctionManageData[0].bidParamater
			const uniqueGroups = [...new Set(auctionManageData[0].bidParamater.map(item => item.groupNo))];

			// Find the currently running slot
			for (let groupNo of uniqueGroups) {
				const groupItems = auctionManageData[0].bidParamater.filter(item => item.groupNo === groupNo);
				if (groupItems.length > 0) {
					const firstItem = groupItems[0];
					const slotStartDate = new Date(checkUTC(firstItem.itemStDate)).getTime();
					const slotEndDate = new Date(checkUTC(firstItem.itemEndDate)).getTime();

					// Check if this slot is currently running
					if (currentTime >= slotStartDate && currentTime <= slotEndDate) {
						setRunningSlotNumber(groupNo);
						return;
					}
				}
			}

			// No running slot found
			setRunningSlotNumber(null);
		};

		// Check immediately
		checkRunningSlot();

		// Then check every second
		const timer = setInterval(checkRunningSlot, 1000);

		return () => clearInterval(timer);
	}, [auctionManageData[0]?.bidClosingType, auctionManageData[0]?.bidParamater]);

	// Handler to navigate to running slot
	const handleRunningSlotClick = () => {
		if (runningSlotNumber !== null) {
			fetchVendorParameterDetailsLineItems(runningSlotNumber, rowsPerPage);
		}
	};

	if (loadingPermissions) {
		return <GridSkeleton />;
	}

	return (
		<>
			{/* Connection Status Overlay - Only show during connecting/reconnecting */}
			{(connectionStatus === 'connecting' || connectionStatus === 'reconnecting') && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.7)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 9999,
					backdropFilter: 'blur(3px)'
				}}>
					<div style={{
						backgroundColor: 'white',
						borderRadius: '12px',
						padding: '40px',
						textAlign: 'center',
						maxWidth: '400px',
						boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
					}}>
						{connectionStatus === 'connecting' && (
							<>
								<div style={{
									width: '60px',
									height: '60px',
									border: '4px solid #f3f3f3',
									borderTop: '4px solid #3498db',
									borderRadius: '50%',
									animation: 'spin 1s linear infinite',
									margin: '0 auto 20px'
								}} />
								<h3 style={{ color: '#333', marginBottom: '10px', fontSize: '20px' }}>Connecting...</h3>
								<p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Establishing connection to auction server</p>
							</>
						)}
						{connectionStatus === 'reconnecting' && (
							<>
								<div style={{
									width: '60px',
									height: '60px',
									border: '4px solid #f3f3f3',
									borderTop: '4px solid #3498db',
									borderRadius: '50%',
									animation: 'spin 1s linear infinite',
									margin: '0 auto 20px'
								}} />
								<h3 style={{ color: '#333', marginBottom: '10px', fontSize: '20px' }}>Connecting...</h3>
								<p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Establishing connection to auction server</p>
							</>
						)}
					</div>
				</div>
			)}

			{/* Refresh Page Dialog - Only show when connection failed */}
			<PEModal
				open={showRefreshDialog}
				onClose={() => setShowRefreshDialog(false)}
				size="xs"
				title={<span style={{ color: '#f44336' }}>Connection Failed</span>}
				footer={
					<Button onClick={() => window.location.reload()} variant="contained" color="primary" autoFocus>
						Refresh Page
					</Button>
				}
			>
				<div style={{ minWidth: '280px' }}>
					Unable to establish connection to the auction server after multiple attempts.
					<br /><br />
					Please refresh the page to reconnect and continue participating in the bid.
				</div>
			</PEModal>

			{/* READ Permission Check */}
			{!(permissionManager?.hasPermission(CLAIM_TYPES.MANAGE_AUCTION, ACTIONS.READ) ?? false) ? (
				<div className="p-3">
					<Alert severity="warning">
						You don't have permission to view this auction control page.
					</Alert>
				</div>
			) : (
				<>
					<>
						<div className="rfq-v2-page" style={{ padding: '0px' }}>
							<div className="rfq-v2-card" style={{ borderRadius: 0 }}>
								<AuctionDetailBox
									auctionData={auctionManageData[0]}
									bidStatus={bidStatus}
									timeRemaining={timeRemaining}
									expanded={expanded}
									onExpandChange={() => setExpanded(!expanded)}
									isFullScreen={isFullScreen}
									onToggleFullScreen={toggleFullScreen}
									onToggleChat={() => handleApprover(!approvershow)}
									userDetail={userDetail}
									permissionManager={permissionManager}
									adjustValue={adjustValue}
									isValueChanged={isValueChanged}
									onDecrease={handleDecrease}
									onIncrease={handleIncrease}
									onDurationChange={handleBidDurationChange}
									onGoClick={handleGoClick}
									showCurrencyTable={showTable}
									onToggleCurrencyTable={() => setShowTable(!showTable)}
									runningSlotNumber={runningSlotNumber}
									onRunningSlotClick={handleRunningSlotClick}
									onEditField={handleOpenModal}
								/>
								{/* Scrollable item table area */}
								<div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
									{auctionManageData[0]?.bidClosingType === 'S' ? (
										<div className="p-2 flex-grow-1 auction-scrollable" style={{ overflowY: 'auto' }}>
											<StaggerAuction
												actions={{
													allVendorParticipationDetails: allVendorParticipationDetails,
													auctionManageData: auctionManageData,
													handleExpandToggle: handleExpandToggle,
													setExpandedItemIds: setExpandedItemIds,
													expandedItemIds: expandedItemIds,
													bidStatus: bidStatus,
													expandAll: expandAll,
													handleCollapseAll: handleCollapseAll,
													handleExpandAll: handleExpandAll,
													setExpandAll: setExpandAll,
													actionmodal: actionmodal,
													handleOpen: handleOpen,
													handleSubmit: handleSubmit,
													callbackOnpause: callbackOnpause,
													handleShowAddVendorModal: handleShowAddVendorModal,
													handleShowSendReminderModal: handleShowSendReminderModal,
													handleShowReOpenModal: handleShowReOpenModal,
													setActionModal: setActionModal,
													handleCancel: handleCancel,
													normalPagination: normalPagination,
													normalRowsPerPage: normalRowsPerPage,
													pageNumber: pageNumber,
													totalCount: totalCount,
													lineItemsPerPage: lineItemsPerPage,
													fetchVendorParameterDetailsLineItems: fetchVendorParameterDetailsLineItems,
													fetchVendorParameterDetails: fetchVendorParameterDetails,
													reopenTrigger: reopenTrigger,
													hasLoadingFactor: hasLoadingFactor,
													getCurrentServerTime: getCurrentServerTime
												}}
											/>
										</div>
									) : (() => {
										const hasEditPerm = permissionManager?.hasPermission(CLAIM_TYPES.MANAGE_AUCTION, ACTIONS.EDIT) ?? false;
										const isForwardType = auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5;
										const auctionTableColumns = [
											{
												key: 'sno', label: 'S.No', width: '52px',
												renderCell: (_, row, index) => normalPagination * normalRowsPerPage + index + 1,
											},
											{
												key: 'itemName', label: 'Item / Service',
												renderCell: (v, row, index) => (
													<Tooltip title={(auctionManageData[0]?.hideVendor === true && bidStatus === 'running') ? '' : 'Open Graph'}>
														<span
															style={{ cursor: (auctionManageData[0]?.hideVendor === true && bidStatus === 'running') ? 'default' : 'pointer', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', color: '#1976d2', fontWeight: 700 }}
															onClick={() => !(auctionManageData[0]?.hideVendor === true && bidStatus === 'running') && OpenModal(lineItemsPerPage, index)}
														>
															{v}
														</span>
													</Tooltip>
												),
											},
											...(expandedItemIds.length === 0 ? [{
												key: '__rank__',
												label: isForwardType ? 'H1 Rank' : 'L1 Rank',
												renderCell: (_, row) => {
													const linked = allVendorParticipationDetails.filter(v => v.bidParameterId === row.bidParameterId);
													const vendor = linked.find(v => v.rankValue === (isForwardType ? 'H1' : 'L1'));
													return vendor ? vendor.companyName : <span className="text-danger">N/A</span>;
												},
											}] : []),
											{
												key: 'quantity', label: 'Quantity',
												renderCell: (v, row) => <>{thousands_separators(v)}<span className='ms-1'>{row.uom}</span></>,
											},
											{
												key: 'targetPrice', label: 'Target Price',
												renderCell: (v) => thousands_separators(v),
											},
											{
												key: 'hidePrice', label: 'Show Target Price',
												renderCell: (v, row) => (
													<Switch checked={row?.hidePrice}
														onChange={handleSwitchChange(setHidePrice, handleSubmit, 'hidePrice', row?.bidParameterId)}
														disabled={bidStatus !== 'not_started' || ['Close', 'Paused', 'Allocation', 'Awarded'].includes(auctionManageData[0]?.stage) || !hasEditPerm}
													/>
												),
											},
											{
												key: 'maskL1Price', label: isForwardType ? 'Show H1 Price' : 'Show L1 Price',
												renderCell: (v, row) => (
													<Switch checked={row?.maskL1Price}
														onChange={handleSwitchChange(setMaskL1Price, handleSubmit, 'maskL1Price', row?.bidParameterId)}
														disabled={['Close', 'Paused', 'Allocation', 'Awarded'].includes(auctionManageData[0]?.stage) || bidStatus === null || !hasEditPerm}
													/>
												),
											},
											{
												key: 'showStartPrice', label: 'Show Start Price',
												renderCell: (v, row) => (
													<Switch checked={row?.showStartPrice}
														onChange={handleSwitchChange(setShowStartPrice, handleSubmit, 'showStartPrice', row?.bidParameterId)}
														disabled={['Close', 'Paused', 'Allocation', 'Awarded'].includes(auctionManageData[0]?.stage) || bidStatus === null || !hasEditPerm}
													/>
												),
											},
											{
												key: 'startPrice', label: 'Start Price',
												renderCell: (v, row, index) => (
													<>
														{thousands_separators(row?.startPrice)} {" "}
														{!['Close', 'Paused', 'Allocation', 'Awarded'].includes(auctionManageData[0]?.stage) && bidStatus != null && hasEditPerm && (
															<button className="pe-icon-btn pe-icon-btn--edit" onClick={() => handleOpen('startPrice', index, row?.bidParameterId)}><HiPencilAlt /></button>
														)}
													</>
												),
											},
											{
												key: 'minimumDelta', label: isForwardType ? 'Min. Increment' : 'Min. Decrement',
												renderCell: (v, row, index) => (
													<>
														{thousands_separators(row?.minimumDelta)} {" "}
														{!['Close', 'Paused', 'Allocation', 'Awarded'].includes(auctionManageData[0]?.stage) && bidStatus != null && hasEditPerm && (
															<button className="pe-icon-btn pe-icon-btn--edit" onClick={() => handleOpen('minimumDelta', index, row?.bidParameterId)}><HiPencilAlt /></button>
														)}
													</>
												),
											},
											{
												key: '__actions__', label: '', width: '80px',
												renderHeader: () => (
													<div className="d-flex justify-content-end align-items-center">
														<Tooltip title={expandAll ? 'Collapse All' : 'Expand All'}>
															<span
																onClick={expandAll ? () => handleCollapseAll(setExpandAll) : () => handleExpandAll(setExpandAll)}
																style={{ fontSize: '18px', cursor: 'pointer', color: '#6b7280', marginRight: '8px' }}
															>
																{expandAll ? <UnfoldLess /> : <UnfoldMore />}
															</span>
														</Tooltip>
														<div onClick={(e) => setBidControlAnchor(e.currentTarget)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
															<div className="pe-icon-btn pe-icon-btn--close"><HiDotsVertical /></div>
														</div>
														<Menu
															anchorEl={bidControlAnchor}
															open={Boolean(bidControlAnchor)}
															onClose={() => setBidControlAnchor(null)}
															anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
															transformOrigin={{ vertical: 'top', horizontal: 'right' }}
															PaperProps={{
																sx: {
																	width: '200px !important', minWidth: '200px !important', maxWidth: '200px !important', borderRadius: 1,
																	'& .MuiMenu-list': { paddingTop: 0, paddingBottom: 2, width: '100%', },
																	'& .MuiMenuItem-root': {
																		width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '7px 10px',
																		minHeight: 34, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
																	},
																},
															}}
														>
															<MenuItem sx={{ fontSize: 13 }}
																onClick={() => { setBidControlAnchor(null); hasEditPerm && handleShowAddVendorModal('AddSuppliers'); }}
																disabled={['Close', 'Paused', 'Awarded', 'Allocation'].includes(auctionManageData[0]?.stage) || bidStatus === null || !hasEditPerm}
															>Add Suppliers</MenuItem>
															<MenuItem sx={{ fontSize: 13 }}
																onClick={() => { setBidControlAnchor(null); hasEditPerm && handleShowSendReminderModal('Reminder'); }}
																disabled={['Close', 'Paused', 'Awarded', 'Allocation'].includes(auctionManageData[0]?.stage) || bidStatus === null || !hasEditPerm}
															>Send Reminder</MenuItem>
															<MenuItem sx={{ fontSize: 13 }}
																onClick={() => { setBidControlAnchor(null); hasEditPerm && handleShowReOpenModal('Reopened'); }}
																disabled={['Awarded', 'Paused'].includes(auctionManageData[0]?.stage) || bidStatus === 'running' || !hasEditPerm}
															>Auction Open</MenuItem>
															<MenuItem sx={{ fontSize: 13 }}
																onClick={() => { setBidControlAnchor(null); hasEditPerm && setActionModal({ ...actionmodal, surrogateSupplierModal: true }); }}
																disabled={['Close', 'Paused', 'Awarded', 'Allocation'].includes(auctionManageData[0]?.stage) || bidStatus === null || !hasEditPerm}
															>Surrogate Supplier</MenuItem>
															<Divider />
															<MenuItem sx={{ fontSize: 13, color: '#b8232f' }}
																onClick={() => { setBidControlAnchor(null); hasEditPerm && bidStatus !== 'running' && handleCancel(); }}
																disabled={['Allocation', 'Paused', 'Awarded'].includes(auctionManageData[0]?.stage) || bidStatus === 'running' || !hasEditPerm}
															>Cancel Auction</MenuItem>
															<MenuItem sx={{ fontSize: 13 }}
																onClick={() => { setBidControlAnchor(null); hasEditPerm && submitPrebid(); }}
																disabled={bidStatus === 'running' || (auctionManageData[0]?.stage && auctionManageData[0]?.stage !== 'Open') || !hasEditPerm}
															>Prebid / Restrict Suppliers</MenuItem>
														</Menu>
													</div>
												),
												renderCell: (_, row) => (
													<IconButton size="small" onClick={() => handleExpandToggle(row.bidParameterId, setExpandedItemIds)}>
														{expandedItemIds.includes(row.bidParameterId) ? <ExpandLess /> : <ExpandMore />}
													</IconButton>
												),
											},
										];
										return (
											<>
												<PETableSimple
													rows={lineItemsPerPage}
													columns={auctionTableColumns}
													getRowKey={(row) => row.bidParameterId}
													getExpandContent={(row) => (
														<NormalVendorTable
															auctionItem={{
																item: row,
																allVendorParticipationDetails,
																auctionManageData,
																page,
																rowsPerPage,
																getRankColor,
																bidStatus,
																handleCheckboxRestrict,
																restrictVendorId,
																prebidValues,
																handleRestricttChange,
																handleBlur,
																editingVendorId,
																handlePriceChange,
																handleOpenModalRemoveQuote,
																handleRemoveRestrictRemarks,
																thousands_separators,
																handleEditPrice,
																restrictParameterId,
																editingParameterId,
																hasLoadingFactor,
																permissionManager: permissionManager,
																hasRemovePermission: permissionManager?.hasPermission(CLAIM_TYPES.MANAGE_AUCTION, ACTIONS.REMOVE)
															}}
														/>
													)}
													expandedKeys={new Set(expandedItemIds)}
													onExpandToggle={(key) => handleExpandToggle(key, setExpandedItemIds)}
													wrapperStyle={{ borderRadius: 0, border: 'none', borderTop: '1px solid #e5e7eb' }}
												/>
												<PEPagination
													page={normalPagination + 1}
													pageSize={normalRowsPerPage}
													totalRows={totalCount}
													pageSizeOptions={[10, 20, 30]}
													onPageChange={(p) => handleNormalChangePage(null, p - 1)}
													onPageSizeChange={(n) => handleNormalChangeRowsPerPage({ target: { value: n } })}
												/>
											</>
										);
									})()}
								</div>
							</div>
						</div>

						{approvershow && (
							<div className="rfq-v2-filter-panel v2-notif-drawer-panel">
								<AuctionCommunication
									connection={connection}
									bidId={BidId}
									handleApprover={handleApprover}
									VendorsCommID={auctionManageData[0]?.bidVendorInvited}
									permissionManager={permissionManager}
								/>
							</div>
						)}
					</>
					<PEModal
						size="sm"
						open={open}
						onClose={() => CloseLoadingModal()}
						disableBackdropClose={true}
						title={
							<span style={{ fontSize: 14 }}>
								{fieldType === 'startPrice'
									? 'Start Price'
									: (auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5
										? 'Minimum Increment'
										: 'Minimum Decrement')}
							</span>
						}
					>
						<div className="row align-items-center">
							<div className="col-md-12 mb-2">
								{fieldType === 'startPrice' && (
									<>
										<label className="pe-field-label">Start Price</label>
										<TextField
											label=""
											value={startPrice}
											type="number"
											size="small"
											InputLabelProps={{ shrink: true }}
											onChange={(e) => {
												if (DecimalValueRegEx.test(e.target.value)) {
													setStartPrice(e.target.value)
												}
												else if (e.target.value === "") {
													setStartPrice('')
												}
											}}
											fullWidth
										/>
									</>
								)}
							</div>
							<div className="col-md-12 mb-2">
								{fieldType === 'minimumDelta' && (
									<>
										<label className="pe-field-label">{auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5 ? 'Minimum Increment' : 'Minimum Decrement'}</label>
										<TextField
											label=""
											value={minimumDelta}
											type="number"
											size="small"
											InputLabelProps={{ shrink: true }}
											onChange={(e) => {
												if (DecimalValueRegEx.test(e.target.value)) {
													setMinimumDelta(e.target.value)
												}
												else if (e.target.value === "") {
													setMinimumDelta('')
												}
											}}
											fullWidth
										/>
									</>
								)}
							</div>
							<div className="col-md-12 d-flex justify-content-end mt-2">
								<button type="button" className="pe-btn pe-btn--primary"
									onClick={() => handleSubmit(fieldType, fieldType === 'startPrice' ? startPrice : minimumDelta)}
								>
									Update
								</button>
							</div>
						</div>
					</PEModal>
					<PEModal
						size="sm"
						open={bidOpen}
						onClose={CloseBidLoadingModal}
						disableBackdropClose={true}
						title={<span style={{ fontSize: 14 }}>{fieldLabelMap[fieldBidType] || ""}</span>}
						footer={
							<>
								<button type="button" className="pe-btn pe-btn--ghost" onClick={CloseBidLoadingModal}>
									Cancel
								</button>
								<button type="button" className="pe-btn pe-btn--primary" onClick={handleBidDetailsSubmit}>
									Update
								</button>
							</>
						}
					>
						<div>
							{fieldBidType === 'subject' && (
								<div className="mb-3">
									<label className="pe-field-label">Bid Subject</label>
									<TextField
										value={subject}
										onChange={(e) => {
											if (e.target.value.length <= 200) setSubject(e.target.value);
										}}
										helperText={`${subject.length}/200`}
										size="small"
										fullWidth
										multiline
										minRows={2}
										maxRows={4}
									/>
								</div>
							)}
							{fieldBidType === 'description' && (
								<div className="mb-3">
									<label className="pe-field-label">Bid Description</label>
									<TextField
										value={description}
										onChange={(e) => {
											if (e.target.value.length <= 2000) setDescription(e.target.value);
										}}
										helperText={`${description.length}/2000`}
										size="small"
										fullWidth
										multiline
										minRows={5}
										maxRows={10}
									/>
								</div>
							)}
							{fieldBidType === 'showRankToVendor' && (
								<div className="mb-3">
									<label className="pe-field-label">Display Vendor Rank</label>
									<TextField
										select
										value={showRankToVendor}
										onChange={(e) => setShowRankToVendor(e.target.value)}
										size="small"
										fullWidth
									>
										<MenuItem value="Y">
											{auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5
												? 'As H1, H2, H3 etc.'
												: 'As L1, L2, L3 etc.'}
										</MenuItem>
										<MenuItem value="N">
											{auctionManageData[0]?.bidTypeID === 1 || auctionManageData[0]?.bidTypeID === 5
												? 'As H1 Or Not H1.'
												: 'As L1 Or Not L1.'}
										</MenuItem>
									</TextField>
								</div>
							)}
							{fieldBidType === 'maximumExtension' && (
								<div className="mb-3">
									<label className="pe-field-label">Max No. of Extensions</label>
									<TextField
										select
										value={maximumExtension}
										onChange={(e) => setMaximumExtension(e.target.value)}
										size="small"
										fullWidth
									>
										{[-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ext) => (
											<MenuItem
												key={ext}
												value={ext}
												disabled={auctionManageData[0]?.extensions > ext && ext !== -1 && ext !== 0}
											>
												{ext === -1 ? 'Unlimited' : ext}
											</MenuItem>
										))}
									</TextField>
								</div>
							)}
						</div>
					</PEModal>
					<PEModal
						open={openRemoveQuote}
						onClose={CloseRemoveQuoteModal}
						disableBackdropClose={true}
						title="Remove Quote"
						footer={
							<>
								<button type="button" className="pe-btn pe-btn--ghost me-2" onClick={CloseRemoveQuoteModal}>
									Cancel
								</button>
								<button
									type="button"
									className="pe-btn pe-btn--danger"
									onClick={() => {
										if (!removeRemark.trim()) { setRemarkError(true); return; }
										handleRemoveQoutes(removeRemark);
									}}
								>
									Remove
								</button>
							</>
						}
					>
						<div>
							<p className="f13 text-muted mb-3">
								You are about to remove this quote. Please provide a reason for removal.
							</p>
							<label className="pe-field-label">Remarks <span className="rfq-required-star">*</span></label>
							<TextField
								value={removeRemark}
								onChange={(e) => {
									if (e.target.value.length <= 200) {
										setRemoveRemark(e.target.value);
										if (e.target.value.trim()) setRemarkError(false);
									}
								}}
								fullWidth
								multiline
								rows={3}
								size="small"
								variant="outlined"
								error={remarkError}
								helperText={remarkError ? 'Remarks are required' : `${removeRemark.length}/200`}
								autoFocus
							/>
						</div>
					</PEModal>
					<PEModal
						size="lg"
						open={addVendorModal}
						onClose={() => handleCloseAddVendorModal()}
						disableBackdropClose={true}
						title="Add Suppliers"
						bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
						bodyClassName="d-flex flex-column"
						footer={
							<>
								<button type="button" className="pe-btn pe-btn--ghost me-2" onClick={() => handleCloseAddVendorModal()}>
									Cancel
								</button>
								<button type="button" className="pe-btn pe-btn--primary" onClick={addVendors}>
									Add
								</button>
							</>
						}
					>
						{/* Search bar */}
						<div className="pb-2 flex-shrink-0">
							<TextField
								placeholder="Search Suppliers"
								size="small"
								fullWidth
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								InputProps={{
									endAdornment: searchQuery ? (
										<IconButton size="small" onClick={() => setSearchQuery('')} style={{ padding: 2 }}>
											<HiOutlineX style={{ fontSize: 16, color: '#9ca3af' }} />
										</IconButton>
									) : (
										<SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
									),
								}}
							/>
						</div>

						{/* Supplier list */}
						<div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
							<PETableSimple
								rows={filteredVendors}
								getRowKey={(row) => row.contactId}
								columns={[
									{
										key: '__check__',
										label: '',
										width: 60,
										renderCell: (_, vendor) => {
											const isAlreadyInvited = vendorListData.some((c) => c.vendorID === vendor.vendorId);
											return (
												<Checkbox
													className="p-0"
													size="small"
													checked={selectedVendors.some((s) => s.contactId === vendor.contactId)}
													disabled={isAlreadyInvited}
													onChange={(e) => handleCheckboxChange(vendor.vendorId, vendor.contactId, e.target.checked, vendor)}
												/>
											);
										},
									},
									{
										key: 'companyName',
										label: 'Suppliers',
										renderCell: (_, vendor) => {
											const isAlreadyInvited = vendorListData.some((c) => c.vendorID === vendor.vendorId);
											return (
												<span style={{ color: isAlreadyInvited ? '#9ca3af' : 'inherit' }}>
													<span className="fw500">{vendor.companyName}</span>
													{vendor.contactPerson && <span className="text-muted"> | {vendor.contactPerson}</span>}
													{vendor.email && <span className="text-muted"> | {vendor.email}</span>}
												</span>
											);
										},
									},
								]}
							/>
						</div>
					</PEModal>
					<PEModal
						size="lg"
						open={sendReminderModal}
						onClose={() => handleCloseSendReminderModal()}
						disableBackdropClose={true}
						title="Send Reminder"
						bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
						bodyClassName="d-flex flex-column"
						footer={
							<>
								<button type="button" className="pe-btn pe-btn--ghost me-2" onClick={() => handleCloseSendReminderModal()}>
									Cancel
								</button>
								<button type="button" className="pe-btn pe-btn--primary" onClick={handleSend}>
									Send
								</button>
							</>
						}
					>
						{/* Search bar */}
						<div className="pb-2 flex-shrink-0">
							<TextField
								placeholder="Search Suppliers"
								size="small"
								fullWidth
								value={searchQueryReminder}
								onChange={(e) => setSearchQueryReminder(e.target.value)}
								InputProps={{
									endAdornment: searchQueryReminder ? (
										<IconButton size="small" onClick={() => setSearchQueryReminder('')} style={{ padding: 2 }}>
											<HiOutlineX style={{ fontSize: 16, color: '#9ca3af' }} />
										</IconButton>
									) : (
										<SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
									),
								}}
							/>
						</div>

						{/* Supplier list */}
						<div className="flex-grow-1 d-flex flex-column pb-2" style={{ minHeight: 0 }}>
							<PETableSimple
								rows={filteredVendorsReminder}
								getRowKey={(row) => row.id}
								columns={[
									{
										key: '__check__',
										label: '',
										width: 60,
										renderHeader: () => (
											<Checkbox
												className="p-0"
												size="small"
												checked={selectedSRVendors.length === filteredVendorsReminder.length && filteredVendorsReminder.length > 0}
												indeterminate={selectedSRVendors.length > 0 && selectedSRVendors.length < filteredVendorsReminder.length}
												onChange={(e) => handleSelectAll(e.target.checked)}
											/>
										),
										renderCell: (_, vendor) => (
											<Checkbox
												className="p-0"
												size="small"
												checked={selectedSRVendors.some((item) => item.vendorID === vendor.vendorID)}
												onChange={(e) => handleCheckboxSR(vendor, e.target.checked)}
											/>
										),
									},
									{
										key: 'vendorName',
										label: 'Suppliers',
										renderCell: (_, vendor) => (
											<span>
												<span className="fw500">{vendor.vendorName}</span>
												{vendor.contactPerson && <span className="text-muted"> | {vendor.contactPerson}</span>}
												{vendor.emailId && <span className="text-muted"> | {vendor.emailId}</span>}
											</span>
										),
									},
									{
										key: 'remarks',
										label: 'Remarks',
										width: 250,
										renderCell: (_, vendor) => (
											<textarea
												rows={2}
												placeholder="Remarks"
												value={vendorRemarks[vendor.vendorID] || ""}
												onChange={(e) => handleRemarkChange(vendor.vendorID, e.target.value)}
												style={{
													width: "100%", resize: "none",
													border: "1px solid #e5e7eb",
													borderRadius: 6, padding: "6px 10px",
													fontSize: 12, color: "#1f2937",
													fontFamily: "inherit", background: "#fff",
													outline: "none", lineHeight: 1.5
												}}
											/>
										),
									},
								]}
							/>
						</div>
					</PEModal>
					<PEModal
						size="md"
						open={reOpenAuctionModal}
						onClose={handleCloseReOpenModal}
						disableBackdropClose={true}
						title="Reopen Auction"
						footer={
							<>
								<button type="button" className="pe-btn pe-btn--ghost me-2" onClick={handleCloseReOpenModal}>
									Cancel
								</button>
								<button type="button" className="pe-btn pe-btn--primary" onClick={handleReOpen} disabled={loading}>
									{loading ? 'Reopening...' : 'Reopen Auction'}
								</button>
							</>
						}
					>
						<div>
							<p className="f13 text-muted mb-3">
								Configure the auction schedule to reopen bidding. Select the start date and duration for the auction.
							</p>

							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<div className="row g-3">
									<div className="col-12 col-md-4">
										<label className="pe-field-label">Reopen Date & Time <span className="rfq-required-star">*</span></label>
										<MobileDateTimePicker
											timezone={userDetail?.timeZone}
											minDateTime={dayjs().tz(userDetail?.timeZone)}
											value={reOpenDate ? dayjs(reOpenDate).tz(userDetail?.timeZone) : null}
											onChange={(newDate) => {
												const tzDate = newDate ? dayjs(newDate).tz(userDetail?.timeZone) : null;
												setReOpenDate(tzDate);
												if (bidDuration && auctionManageData[0]?.bidClosingType !== 'S') {
													updateBidEndDate(tzDate, bidDuration);
												}
											}}
											className="w-100"
											format={getDateFormatPatteronLocale(userDetail)}
											ampm={userampm(userDetail)}
											slotProps={{
												textField: { variant: 'outlined', size: 'small', fullWidth: true },
												actionBar: { actions: ['clear', 'cancel', 'accept'] }
											}}
										/>
									</div>

									<div className="col-12 col-md-4">
										<label className="pe-field-label">Bid Duration (Minutes)</label>
										<TextField
											value={bidDuration || ''}
											onChange={(e) => {
												const newDuration = e.target.value;
												if (newDuration === "") {
													setBidDuration("");
												} else if (/^\d*$/.test(newDuration)) {
													const numericValue = Number(newDuration);
													if (numericValue > 0 && auctionManageData[0]?.bidClosingType !== 'S') {
														setBidDuration(numericValue);
														updateBidEndDate(reOpenDate, numericValue);
													}
												}
											}}
											fullWidth
											variant="outlined"
											size="small"
											inputProps={{ inputMode: 'numeric', pattern: "[0-9]*" }}
											disabled={auctionManageData[0]?.bidClosingType === 'S'}
											helperText={auctionManageData[0]?.bidClosingType === 'S' ? "Not applicable for staggered auctions" : ""}
										/>
									</div>

									<div className="col-12 col-md-4">
										<label className="pe-field-label">End Date & Time</label>
										<MobileDateTimePicker
											timezone={userDetail?.timeZone}
											minDateTime={dayjs().tz(userDetail?.timeZone)}
											value={bidDeadLine ? dayjs(bidDeadLine).tz(userDetail?.timeZone) : null}
											onChange={(newDate) => {
												const tzDate = newDate ? dayjs(newDate).tz(userDetail?.timeZone) : null;
												if (reOpenDate && tzDate) updateBidDuration(reOpenDate, tzDate);
											}}
											className="w-100"
											format={getDateFormatPatteronLocale(userDetail)}
											ampm={userampm(userDetail)}
											disabled
											slotProps={{
												textField: {
													variant: 'outlined',
													size: 'small',
													fullWidth: true,
													helperText: "Auto-calculated based on duration"
												},
												actionBar: { actions: ['clear', 'cancel', 'accept'] }
											}}
										/>
									</div>
								</div>
							</LocalizationProvider>
						</div>
					</PEModal>
					<PEModal
						size="lg"
						open={modal}
						onClose={() => CloseModal()}
						disableBackdropClose={true}
						title={<span style={{ fontSize: 14 }}>Bidding Trend</span>}
						bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(90vh - 60px)', overflow: 'hidden' }}
					>
						<div className="p-3" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
							<BidGraphs
								selectedParameterData={selectedParameterData}
								auctionManageData={auctionManageData}
								bidStatus={bidStatus}
							/>
						</div>
					</PEModal>
					<PEModal
						size="md"
						open={actionmodal["surrogateSupplierModal"]}
						onClose={() => setActionModal({ ...actionmodal, surrogateSupplierModal: false })}
						disableBackdropClose={true}
						title="Surrogate Supplier"
					>
						<form onSubmit={formik_Surrogate.handleSubmit} autoComplete="off">
							<div className="mb-3">
								<label className="pe-field-label">Supplier <span className="rfq-required-star">*</span></label>
								<Autocomplete
									id="supplierforsurrogate"
									size="small"
									fullWidth
									disablePortal
									options={vendorListData || []}
									getOptionLabel={(option) => `${option.vendorName} - ${option.emailId}`}
									value={formik_Surrogate.values.supplier ?? null}
									onChange={(e, value) => formik_Surrogate.setFieldValue("supplier", value)}
									renderInput={(params) => (
										<TextField
											{...params}
											variant="outlined"
											error={formik_Surrogate.touched.supplier && Boolean(formik_Surrogate.errors.supplier)}
											helperText={formik_Surrogate.touched.supplier && formik_Surrogate.errors.supplier}
										/>
									)}
								/>
							</div>

							<div className="mb-3">
								<label className="pe-field-label">Surrogater Name <span className="rfq-required-star">*</span></label>
								<TextField
									id="surrogatename"
									name="surrogatename"
									size="small"
									fullWidth
									variant="outlined"
									inputProps={{ maxLength: 200 }}
									value={formik_Surrogate.values.surrogatename}
									onChange={formik_Surrogate.handleChange}
									error={formik_Surrogate.touched.surrogatename && Boolean(formik_Surrogate.errors.surrogatename)}
									helperText={formik_Surrogate.touched.surrogatename && formik_Surrogate.errors.surrogatename}
									InputProps={{
										endAdornment: formik_Surrogate.values.surrogatename && (
											<InputAdornment position="end">
												<Typography variant="caption" color="textSecondary">{formik_Surrogate.values.surrogatename.length}/200</Typography>
											</InputAdornment>
										),
									}}
								/>
							</div>

							<div className="mb-3">
								<label className="pe-field-label">Surrogater Email <span className="rfq-required-star">*</span></label>
								<TextField
									id="surrogateemail"
									name="surrogateemail"
									size="small"
									fullWidth
									variant="outlined"
									inputProps={{ maxLength: 200 }}
									value={formik_Surrogate.values.surrogateemail}
									onChange={formik_Surrogate.handleChange}
									error={formik_Surrogate.touched.surrogateemail && Boolean(formik_Surrogate.errors.surrogateemail)}
									helperText={formik_Surrogate.touched.surrogateemail && formik_Surrogate.errors.surrogateemail}
									InputProps={{
										endAdornment: formik_Surrogate.values.surrogateemail && (
											<InputAdornment position="end">
												<Typography variant="caption" color="textSecondary">{formik_Surrogate.values.surrogateemail.length}/200</Typography>
											</InputAdornment>
										),
									}}
								/>
							</div>

							<div className="mb-1">
								<label className="pe-field-label">Remark</label>
								<TextField
									id="surrogateReason"
									name="surrogateReason"
									size="small"
									fullWidth
									variant="outlined"
									inputProps={{ maxLength: 200 }}
									value={formik_Surrogate.values.surrogateReason}
									onChange={formik_Surrogate.handleChange}
									error={formik_Surrogate.touched.surrogateReason && Boolean(formik_Surrogate.errors.surrogateReason)}
									helperText={formik_Surrogate.touched.surrogateReason && formik_Surrogate.errors.surrogateReason}
									InputProps={{
										endAdornment: formik_Surrogate.values.surrogateReason && (
											<InputAdornment position="end">
												<Typography variant="caption" color="textSecondary">{formik_Surrogate.values.surrogateReason.length}/200</Typography>
											</InputAdornment>
										),
									}}
								/>
							</div>

							<div className="d-flex justify-content-end gap-2 mt-3">
								<button type="button" className="pe-btn pe-btn--ghost" onClick={() => setActionModal({ ...actionmodal, surrogateSupplierModal: false })}>
									Cancel
								</button>
								<button type="submit" className="pe-btn pe-btn--primary">
									Invite
								</button>
							</div>
						</form>
					</PEModal>
					<PEModal
						size="sm"
						open={modalcancelOpen}
						onClose={() => handleCancelAuctionModal(false)}
						disableBackdropClose={true}
						title="Cancel Auction"
						footer={
							<>
								<button type="button" className="pe-btn pe-btn--ghost me-2" onClick={() => handleCancelAuctionModal(false)}>
									Keep Auction
								</button>
								<button type="button" className="pe-btn pe-btn--danger" onClick={() => handleCancelAuctionModal(true)}>
									Cancel Auction
								</button>
							</>
						}
					>
						<div>
							<p className="f13 text-muted mb-3">
								You are about to cancel this auction. Please provide a reason for cancellation.
							</p>
							<label className="pe-field-label">Cancellation Reason <span className="rfq-required-star">*</span></label>
							<TextField
								autoFocus
								fullWidth
								multiline
								rows={3}
								value={cancelReason}
								onChange={handleCancelInputChange}
								error={Boolean(biderror)}
								helperText={biderror || `${cancelReason.length}/1000`}
								placeholder="Enter the reason for cancelling this auction..."
								variant="outlined"
								size="small"
								inputProps={{ maxLength: 1000 }}
							/>
						</div>
					</PEModal>
					<div>
						{isCircleLoading && (
							<div
								style={{
									position: 'fixed',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent overlay
									backdropFilter: 'blur(5px)',  // Blur the background
									zIndex: 9998,
								}}
							></div>
						)}
						{isCircleLoading && (
							<Box
								sx={{
									position: 'fixed',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%)',
									zIndex: 9999,  // Ensures spinner is on top of the blur
								}}
							>
								<CircularProgress />
							</Box>
						)}
					</div>
				</>
			)}
		</>

	);
};

export default AuctionControl;
