import { LoadingButton } from "@mui/lab";
import {
	Badge,
	Box,
	Drawer,
	IconButton
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { HiOutlineBell, HiOutlineX } from "react-icons/hi";
import { useLocation, useNavigate } from "react-router-dom";
import {
	FindThreadChat,
	FindUserList,
	Findmessage,
	insertThread,
} from "../../../utils/communication";
import { actionTypes, useStateValue } from "../../../store";
import { useFormik } from "formik";
import { Button, Dropdown, Form } from "react-bootstrap";

import { toast } from "react-toastify";
import { uploadFilesOnAzure } from "../../../utils/documentlibrary";
import { downloadFilesOnAzure, getExtension, pullMessageCount, validateFileSize } from "../../../utils/common";
import { AccountBox, AttachFile, MoreVert, PersonAddAlt, PersonSearch, Search, SearchOff, Send } from "@mui/icons-material";
import { GridMenuIcon } from "@mui/x-data-grid";
import CommunicationHub from "../CommunicationHub";
import { api, ApiClient } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";

const MessageCell = () => {
	const [
		{ atoken, rtoken, customerid, userDetail, eventType, customersuffix, eventId, Notificationlist, CommId, opendrawer, messageCount, isNotificationOpen, messageSource },
		dispatch,
	] = useStateValue();
	const location = useLocation();

	const apiClient = new ApiClient(customersuffix);
	const navigate = useNavigate();
	const [state, setState] = useState({
		sidebar: false,
	});
	const toggleDrawer = (anchor, open) => (event) => {

		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		if (open) {
		}
		setState({ ...state, [anchor]: open });
		if (!open) {
			setIsOpen(false);
			dispatch({ type: actionTypes.SET_NotificationDrawer, value: false });
			dispatch({ type: actionTypes.SET_CommId, value: 0 });
			dispatch({ type: actionTypes.SET_Opendrawer, value: false });
			setSelectedNotification(null);
			setIsSidebarVisible(true);
			
			// Refresh the full message list when closing
			pullMessageList();
			pullContextAwareMessageCount();

			navigate(location.pathname)
		}
	};

	useEffect(() => {
		setIsOpen(isNotificationOpen); // Sync drawer state
	}, [isNotificationOpen]);

	useEffect(() => {
		if (!userDetail?.id || !atoken) return;

		const currentPath = location.pathname;
		const pathSegments = currentPath.split('/').filter(segment => segment);

		const isDashboard =
			currentPath === `/${customersuffix}` ||
			currentPath === `/${customersuffix}/` ||
			currentPath === '/dashboard' || currentPath === '/dashboard/' ||
			currentPath === '/app' || currentPath === '/app/' ||
			pathSegments.length === 0 ||
			(pathSegments.length === 1 && (pathSegments[0] === customersuffix || pathSegments[0] === 'app'));

		// Decide what to do based on route
		const timeoutId = setTimeout(() => {
			//console.log('MessageCell - Location changed:', location.pathname);

			if (isDashboard) {
				//console.log('→ Dashboard: Pulling count only');
				pullContextAwareMessageCount();
			} else {
				console.log('→ Non-dashboard: Pulling count only (or can also pull list if needed)');
				pullContextAwareMessageCount();
			}
		}, 100); // Moderate delay

		return () => clearTimeout(timeoutId);
	}, [location.pathname, userDetail?.id, atoken, customersuffix]);



	const queryparams = new URLSearchParams(location.search);
	const [userChatMobile, setUserChatMobile] = useState(false);
	const [jobId, setjobId] = useState(1);
	const [commHeader, setCommHeader] = useState(0);
	const [UnreadMessage, setUnreadMessage] = useState([]);
	const [loadingChat, setloadingChat] = useState(false);

	const [openChat, setOpenchat] = useState(false);
	const [chatData, setChatData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [fileList, setFileList] = React.useState([]);
	const [selectAll, setSelectAll] = useState(false);
	const [queryText, setqueryText] = useState("");
	const [commAttachment, setcommAttachment] = useState([]);
	const [toUserId, setToUserId] = useState([]);
	const [postFileName, setPostFileName] = React.useState("");
	const [commFolderName, setcommFolderName] = useState("");
	const [filesName, setFilesName] = useState([]);
	const fileInputRef = useRef(null);
	const [commFileName, setcommFileName] = useState(null);
	const [commParticipantUser, setCommParticipantUser] = useState([]);
	const [Messagedata, setMessagedata] = useState([]);
	const [selectedNotification, setSelectedNotification] = useState(null);
	const getMessageListParams = (specificCommId = null) => {
		
		const currentPath = location.pathname;
		const pathSegments = currentPath.split('/').filter(segment => segment);
		const lastSegment = pathSegments[pathSegments.length - 1];
		const isNumericId = lastSegment && /^\d+$/.test(lastSegment);
		console.log('MessageCell - getMessageListParams called for path:', currentPath);

		// If a specific CommId is provided, use FindByCommId endpoint
		if (specificCommId && specificCommId > 0) {
			return {
				params: {
					CommId: specificCommId,
					CustomerId: customerid,
				},
				endpoint: 'api/Communication/FindByCommId'
			};
		}

		// Base parameters
		let params = {
			CustomerId: customerid,
			SortingColumn: "Id",
			CommDetails_CommParticipantUser_UserId: userDetail?.id,
		};

		let endpoint = 'api/Communication/Find'; // default

		// Check if this is a dashboard route first
		const isDashboard =
			currentPath === `/${customersuffix}` ||
			currentPath === `/${customersuffix}/` ||
			currentPath === '/dashboard' ||
			currentPath === '/dashboard/' ||
			currentPath === '/app' ||
			currentPath === '/app/' ||
			pathSegments.length === 0 ||
			(pathSegments.length === 1 && (pathSegments[0] === customersuffix || pathSegments[0] === 'app'));

		if (isDashboard) {
			params.UserId = userDetail?.id;
			delete params.EventType;
			delete params.EventId;
			endpoint = 'api/Communication/Find';
			return { params, endpoint };
		}

		// Define route patterns with their corresponding EventTypes and endpoints
		const routePatterns = [
			{ pattern: /\/(configuration\/)?manage-rfq/i, eventType: 'RFQ', endpoint: 'api/Communication/FindByCommId' },
			{ pattern: /\/(configuration\/)?manage-pr/i, eventType: 'PR', endpoint: 'api/Communication/FindByCommId' },
			{ pattern: /\/(configuration\/)?manage-nfa/i, eventType: 'NFA', endpoint: 'api/Communication/Find' },
			{ pattern: /\/(configuration\/)?manage-rfi/i, eventType: 'RFI', endpoint: 'api/Communication/FindByCommId' },
			{ pattern: /\/(configuration\/)?manage-auction/i, eventType: 'Auction', endpoint: 'api/Communication/Find' },
			{ pattern: /\/(configuration\/)?manage-participants/i, eventType: 'QR', endpoint: 'api/Communication/FindByCommId' },
			{ pattern: /\/register-participants/i, eventType: 'QR', endpoint: 'api/Communication/FindByCommId' },
			{ pattern: /\/purchase-request/i, eventType: 'PR', endpoint: 'api/Communication/FindByCommId' },
			{ pattern: /\/note-for-approval/i, eventType: 'NFA', endpoint: 'api/Communication/FindByCommId' },
		];

		// Find matching route pattern
		const matchedRoute = routePatterns.find(route => route.pattern.test(currentPath));

		if (matchedRoute) {
			params.EventType = matchedRoute.eventType;
			endpoint = matchedRoute.endpoint;

			// If the last segment is a numeric ID, add EventId
			if (isNumericId) {
				params.EventId = eventId || lastSegment;
				// When we have an EventId, use FindByCommId endpoint
				endpoint = 'api/Communication/FindByCommId';
			}
		} else {
			// Fallback to Redux state if no pattern matches
			if (eventType) params.EventType = eventType;
			if (eventId) params.EventId = eventId;
			endpoint = 'api/Communication/FindByCommId';
		}

		// Clean up params based on endpoint
		if (endpoint === 'api/Communication/FindByCommId') {
			
			delete params.CommDetails_CommParticipantUser_UserId;
			//delete params.UserId;
		}

		return { params, endpoint };
	};

	const pullMessageList = async (source = 'notification', specificCommId = null) => {
		
		try {
			// Use the specificCommId if provided, otherwise fall back to CommId from state
			const commIdToUse = specificCommId || CommId;
			const { params, endpoint } = getMessageListParams(commIdToUse > 0 ? commIdToUse : null);
			
			const queryParams = buildQueryParams(params);
			let res = null;

			// Check if we need to fetch specific CommId chat thread
			// This applies when clicking from QueryList OR when a specific CommId is selected
			if (commIdToUse && commIdToUse > 0) {
				
				try {
					const data = {
						CommId: commIdToUse
					};

					const res = await FindThreadChat(data, atoken);
					

					const returnData = Array.isArray(res)
						? res
						: res?.data?.result || res?.data || [];

					if (returnData && returnData.length > 0) {

						const groupedData = {};

						returnData.forEach(item => {
							const commId = item.commId;

							if (!groupedData[commId]) {
								groupedData[commId] = {
									id: commId,
									eventId: item.eventId,
									eventType: item.eventType,
									urllink: null,
									vurllink: null,
									isEmailActive: false,
									customerId: item.customerId,
									createdById: item.createdById,
									createdByName: item.createdByName,
									createdOn: item.createdOn,
									eventCode: item.eventCode,
									userType: item.userType,
									userEmail: item.userEmail || null,
									messageType: null,
									commDetails: []
								};
							}

							// push each message into commDetails
							groupedData[commId].commDetails.push(item);
						});

						const finalData = Object.values(groupedData);

						setMessagedata(finalData);
						

						dispatch({
							type: actionTypes.SET_Notificationlist,
							value: finalData
						});
					}
				} catch (error) {
					console.error("Error fetching chat thread from QueryList:", error);
				}
			} else {
				// Call from notification icon or other sources
				
				res = await apiClient.getres(
					`${endpoint}?${queryParams}`,
					atoken
				);
				const data = Array.isArray(res) ? res : res?.data?.result || res?.data || [];

				setMessagedata(data);
				dispatch({
					type: actionTypes.SET_Notificationlist,
					value: data
				});
			}

		} catch (error) {
			console.error("MessageCell - Error pulling message list:", error);
			setMessagedata([]);
			dispatch({
				type: actionTypes.SET_Notificationlist,
				value: []
			});
		}
	};

	const getMessageCountParams = () => {
		const currentPath = location.pathname;
		const pathSegments = currentPath.split('/').filter(segment => segment);
		const lastSegment = pathSegments[pathSegments.length - 1];
		const isNumericId = lastSegment && /^\d+$/.test(lastSegment);

		let params = {
			UserId: userDetail?.id,
			IsVenderYN: "N"
		};

		// Check if this is a dashboard route first
		const isDashboard =
			currentPath === `/${customersuffix}` ||
			currentPath === `/${customersuffix}/` ||
			currentPath === '/dashboard' ||
			currentPath === '/dashboard/' ||
			currentPath === '/app' ||
			currentPath === '/app/' ||
			pathSegments.length === 0 ||
			(pathSegments.length === 1 && (pathSegments[0] === customersuffix || pathSegments[0] === 'app'));

		if (isDashboard) {
			return params; // Dashboard: no EventType or EventId
		}

		// Define route patterns with their corresponding EventTypes
		const routePatterns = [
			{ pattern: /\/(configuration\/)?manage-rfq/i, eventType: 'RFQ' },
			{ pattern: /\/(configuration\/)?manage-pr/i, eventType: 'PR' },
			{ pattern: /\/(configuration\/)?manage-nfa/i, eventType: 'NFA' },
			{ pattern: /\/(configuration\/)?manage-rfi/i, eventType: 'RFI' },
			{ pattern: /\/(configuration\/)?manage-auction/i, eventType: 'Auction' },
			{ pattern: /\/(configuration\/)?manage-participants/i, eventType: 'QR' },
			{ pattern: /\/register-participants/i, eventType: 'QR' },
			{ pattern: /\/purchase-request/i, eventType: 'PR' },
			{ pattern: /\/note-for-approval/i, eventType: 'NFA' },
			{ pattern: /\/purchase-order/i, eventType: 'PO' }, // Added PO path support
		];

		// Find matching route pattern
		const matchedRoute = routePatterns.find(route => route.pattern.test(currentPath));

		if (matchedRoute) {
			params.EventType = matchedRoute.eventType;

			// If the last segment is a numeric ID, add EventId
			if (isNumericId) {
				params.EventId = eventId || lastSegment;
			}
		} else {
			// Fallback to Redux state if no pattern matches
			if (eventType) params.EventType = eventType;
			if (eventId) params.EventId = eventId;
		}

		return params;
	};
	const pullContextAwareMessageCount = async () => {
		const params = getMessageCountParams();
		await pullMessageCount({
			...params,
			atoken,
			dispatch
		});
	};


	// TO SEND MESSAGE
	const validationSchema = yup.object({
		queryText: yup
			.string("Enter your Description")
			.required("Please ask your query"),
	});

	// FORMIK To Submit
	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: 0,
			fromId: userDetail?.id,
			userName: userDetail?.name,
			userEmail: userDetail?.email,
			toVendorId: "",
			queryText: queryText,
			parentQueryId: 0,
			isRead: true,
			commChannel: "C",
			commId: commHeader?.id,
			eventId: eventId,
			eventType: eventType,
			userType: "User",
			urllink: "",
			customerId: customerid,
			commAttachment: commAttachment,
			commParticipantUser: commParticipantUser,
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {
			setLoading(true);

			var filepathreturn = "";

			if (fileList) {
				var Data = {
					RequestedBy: "customer",
					EventType: eventType,
					CustomerId: customerid,
					Description: "Comm",
				};

				uploadFilesOnAzure(Data, fileList, atoken).then((resdata) => {
					filepathreturn = resdata;

					const updatedCommAttachment = values.commAttachment.map(
						(attachment) => ({
							...attachment,
							commFolderName: filepathreturn,
						})
					);
					values.commAttachment = updatedCommAttachment;
					submitFormValues(values);
				});
			} else {
				submitFormValues(values);
			}
		},
	});
	const submitFormValues = (values) => {

		console.log("Submitted values:", values);

		setLoading(true);
		insertThread(values, atoken)
			.then((res) => {
				setLoading(false);


				fetchChatThreadCall(commHeader?.id);
				resetState();
			})
			.catch((error) => {
				setLoading(false);
				console.error("Error submitting message:", error);
				toast.error("Failed to send message. Please try again later.");
			});
	};
	const resetState = () => {
		setqueryText("");
		setToUserId([]);

		setcommAttachment([]);
		setcommFileName("");
		setcommFolderName("");
		setFilesName([]);
		setFileList([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};
	const [isSidebarVisible, setIsSidebarVisible] = useState(true);
	const handleRedirect = (value) => {
		setChatData([]);
		setOpenchat(true);
		setUserChatMobile(true);
		setCommHeader(value);
		fetchChatThreadCall(value?.id);
	};

	const closeChat = (value) => {
		resetState();
		setOpenchat(false);
		setUserChatMobile(false);
		fetchUnreadMessagesApi();
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const [isOpen, setIsOpen] = useState(false);

	const handleSelectAll = (e) => {
		const checked = e.target.checked;
		setSelectAll(checked); // Update the selectAll state

		const updatedMessages = Messagedata.map(message => ({
			...message,
			isSelected: checked
		}));
		setMessagedata(updatedMessages);
	};

	const fetchChatThreadCall = async (commId) => {
		try {
			const data = {
				//	CustomerId: value?.customerId,
				CommId: commId,
				// userId: value?.commParticipantUser[0]?.userId,
				// userType: "User",
			};

			const response = await FindThreadChat(data, atoken);
			if (response && response.length > 0) {
				setChatData(response);
				//console.log("res" + JSON.stringify(response));
				return true;
			}
		} catch (error) {
			console.error("Error fetching chat thread:", error);
		}
	};

	const fetchUnreadMessagesApi = () => {
		var data = {
			EventId: "",
			EventType: "",
			UserType: "",
			CustomerID: "",
		};


	};
	useEffect(() => {
		fetchUnreadMessagesApi();
	}, []);
	//USER FETCH
	const [userList, setUserList] = useState([]);
	const pullUsersList = () => {
		var data = {
			CustomerId: customerid,
		};
		setLoading(true);
		FindUserList(data, atoken).then((res) => {
			if (res != "" && res != undefined) {
				setUserList(res);
			}
			setLoading(false);
		});
	};
	const getUserDefault = (arraylist) => {
		let arrayNew = [];
		if (arraylist?.length > 0) {
			userList?.map((data) => {
				arraylist?.map((array) => {
					if (data.id == array.userId) {
						arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};

	function handleFileChange(event) {
		if (event) {
			if (!validateFileSize(event)) {
				setPostFileName("");

				setcommFileName("");

				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
				return;
			}
			else {
				let file = event.target.files[0];
				const fileName = file.name;
				setPostFileName(fileName);
			}

			const selectedFiles = event.target.files;
			const updatedCommAttachment = [];
			const updatedFilesName = [];
			for (let i = 0; i < selectedFiles.length; i++) {
				const file = selectedFiles[i];
				const fileName = file.name;

				if (fileName.length > 50) {
					toast.error("Attachment name must be 50 characters or fewer.", {
						position: toast.POSITION.TOP_CENTER,
					});
					event.target.value = null;
					return;
				}

				const foldername = customerid + eventType + eventId + "comm";
				const newAttachment = {
					//id: 0,
					commId: commHeader?.id,
					commFolderName: foldername,
					commFileName: fileName,
					customerId: customerid,
				};

				updatedCommAttachment.push(newAttachment);
				updatedFilesName.push({ name: fileName });
				setcommFolderName(foldername);
			}
			setcommAttachment((prevAttachments) => [
				...prevAttachments,
				...updatedCommAttachment,
			]);
			setFilesName((prevFilesName) => [...prevFilesName, ...updatedFilesName]);
			setFileList(event.target.files[0]);
		}
	}


	const handleRemoveFile = (indexToRemove) => {
		const updatedFiles = filesName.filter(
			(file, index) => index !== indexToRemove
		);
		setFilesName(updatedFiles);
		setcommFolderName("");
		setcommFileName("");

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};
	//Query Text
	const handleQueryChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/'/g, "");
		setqueryText(sanitizedInput);
	};
	const handleChangeUser = (event, newValues) => {
		if (newValues) {
			//const prevcommId = newValues[0].id;
			const updatedUser = newValues.map((newValue) => ({
				userId: newValue.id,
				UserName: newValue.name,
				UserEmail: newValue.email,
				isRead: false,
				commId: commHeader?.id,
				isVendorYN: "N",
				linkurl: "",
				customerId: newValue.customerId,
			}));
			setToUserId(updatedUser);
			setCommParticipantUser(updatedUser);
		}
	};
	const handleDownload = (filepath, filename, atoken) => {
		if (filepath && filename && atoken) {
			downloadFilesOnAzure(filepath, filename, atoken);
		} else {
			console.error("Invalid parameters for file download.");
		}
	};

	const [anchorEl, setAnchorEl] = useState(null);

	const handleClick = (event) => {
		
		// Always refresh message list first, then count
		pullMessageList().then(() => {
			pullContextAwareMessageCount();
		}).catch((error) => {
			//console.error('MessageCell - Error in pullMessageList during bell click:', error);
			pullContextAwareMessageCount();
		});

		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	useEffect(() => {

		if (CommId || opendrawer) {
			// Call pullMessageList with the appropriate source flag and CommId
			const source = messageSource || 'querylist';
			// Pass CommId to pullMessageList to ensure it fetches messages for this specific conversation
			pullMessageList(source, CommId > 0 ? CommId : null);
			
			if (notificationRef.current) {
				notificationRef?.current.click()
				setState({
					sidebar: true,
				});
			}

		}
	}, [CommId, opendrawer])

	const [unreadMessages, setUnreadMessages] = useState([]);

	const handleMarkAllRead = () => {
		// Mark all messages as read
		setUnreadMessages([]);
	};

	const handleShowUnread = (event) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};
	const updateNotificationData = async (payload) => {

		const { UserId, CommId, IsVenderYN, dcommid } = payload;

		try {
			const url = `/api/Communication/UpdateNotificationCount?UserId=${UserId}&CommId=${CommId}&IsVenderYN=${IsVenderYN}&dCommId=${dcommid}`;
			const res = await apiClient.postres(url, null, atoken); // No payload in body
			if (res) {
				// Optional: handle success
			}
		} catch (error) {
			console.error("Error updating notification:", error);
		}
	};

	const handleSelectMessage = async (notification) => {
        
		// Get the last message (assuming this is the clicked one)
		const lastMessage = notification?.commDetails[notification.commDetails.length - 1];

		// Find the participant in the last message for the current user
		const participant = lastMessage.commParticipantUser?.find(
			(p) => p.userId === userDetail.id
		);

		const payload = {
			CommId: lastMessage.commId || notification.id,
			UserId: userDetail.id,
			IsVenderYN: "N",  // Or dynamically set if needed
			dcommid: lastMessage.id,  // Send last message's id as dcommid
		};

		await updateNotificationData(payload);
		await pullContextAwareMessageCount();
        
		setSelectedNotification(notification);

		const selectedCommId = lastMessage.commId || notification.id;

		dispatch({
			type: actionTypes.SET_CommId,
			value: selectedCommId,
		});

		// Call pullMessageList with 'notification' source flag and specific CommId
		await pullMessageList('notification', selectedCommId);

		setIsOpen(false);
		dispatch({ type: actionTypes.SET_NotificationDrawer, value: false });

		setIsSidebarVisible(true);
		setState({ ...state, sidebar: true });

		if (notification.urllink) {
			navigate(notification.urllink);
		}
	};

	const open = Boolean(anchorEl);

	const [backgroundColor, setBackgroundColor] = useState("#405189");

	// Function to generate a random hex color
	const getRandomColor = () => {
		const letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};
	const popperRef = useRef(null);
	const notificationRef = useRef(null);

	useEffect(() => {
		// Event listener for clicks outside of the Popper
		const handleClickOutside = (event) => {
			if (popperRef.current && !popperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		setIsOpen(open);
	}, [open]);
	const unreadCount = Notificationlist?.filter(notification => !notification.isRead).length;


	return (
		<>
			{/* <div className="text-center me-3" style={{ position: 'relative' }}> */}
			<div className="text-center d-flex align-items-center" style={{ position: 'relative' }}>

				<IconButton
				 onClick={handleClick}
				//  onClick={(e) => handleClick(e, true)}
				  ref={notificationRef}
				  >
					<Badge
						badgeContent={messageCount && messageCount > 0 ? messageCount : null}
						color="secondary"
					>
						<HiOutlineBell style={{ fontSize: '25px' }} />

					</Badge>
				</IconButton>






				<Drawer
					anchor="right"
					open={isOpen}
					variant="temporary"
					ModalProps={{
						keepMounted: true,
					}}
					PaperProps={{
						sx: {
							zIndex: 1400, // 🔺 Raise above most headers (default AppBar zIndex = 1100)
							width: { xs: 320, sm: 300, md: 350 },
						},
					}}
					sx={{ zIndex: 1400 }}
				>

					<Box sx={{ width: { xs: 320, sm: 300, md: 350 } }}>
						<Box className="bgheaderNotificationCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Notifications</div>
								<div>
									<IconButton
										onClick={() => {
											dispatch({ type: actionTypes.SET_NotificationDrawer, value: false });
											setIsOpen(false); // also update local state, if you're using it
										}}
										// onClick={() => setIsOpen(false)}

										size="small"
										edge="start"
										sx={{ mr: 1 }}
									>
										<HiOutlineX className="f20 text-white" />
									</IconButton>
								</div>
							</div>
						</Box>

						<div className="notification-container" style={{
							padding: '16px',
							backgroundColor: '#ffffff',
							height: 'calc(100vh - 120px)',
							overflowY: 'auto',
							scrollbarWidth: 'none', /* Firefox */
							msOverflowStyle: 'none'  /* Internet Explorer 10+ */
						}}>
							<style>
								{`
									.notification-container::-webkit-scrollbar {
										display: none; /* Safari and Chrome */
									}
								`}
							</style>
							{/* Header */}


							{Notificationlist && Notificationlist?.length > 0 ? (
								<div className="notification-list">
									{Notificationlist.slice(0, 10).map((item, i) => {
										const lastMessage = item.commDetails[item.commDetails.length - 1];
										const participants = lastMessage?.commParticipantUser || [];
										const isUnread = participants.some(
											(p) => p.userId === userDetail.id && p.isRead === false
										);

										const getInitials = (name) => {
											if (!name) return '?';
											return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
										};

										const getActionText = (eventType, eventId) => {
											switch (eventType) {
												case 'RFQ': return 'commented on RFQ';
												case 'QR': return 'updated profile';
												case 'PR': return 'requested approval';
												case 'NFA': return 'needs approval';
												case 'RFI': return 'shared information';
												default: return 'sent message';
											}
										};

										const getTimeAgo = (dateTime) => {
											if (!dateTime) return '';
											const now = new Date();
											const messageTime = new Date(dateTime);
											const diffMs = now - messageTime;
											const diffMins = Math.floor(diffMs / 60000);
											const diffHours = Math.floor(diffMs / 3600000);
											const diffDays = Math.floor(diffMs / 86400000);

											if (diffMins < 1) return 'now';
											if (diffMins < 60) return `${diffMins}m ago`;
											if (diffHours < 24) return `${diffHours}h ago`;
											return `${diffDays}d ago`;
										};

										return (
											<div
												key={i}
												role="button"
												className="notification-item"
												style={{
													display: 'flex',
													alignItems: 'flex-start',
													padding: '12px 0',
													borderBottom: i < Notificationlist.slice(0, 10).length - 1 ? '1px solid #f5f5f5' : 'none',
													transition: 'background-color 0.2s ease',
													cursor: 'pointer',
													backgroundColor: isUnread ? '#f8fffe' : 'transparent'
												}}
												onClick={() => handleSelectMessage(item)}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor = '#f8f9fa';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = isUnread ? '#f8fffe' : 'transparent';
												}}
											>
												<div style={{ flex: 1, minWidth: 0 }}>
													<div style={{
														fontSize: '12px',
														color: '#1a1a1a',
														lineHeight: '1.3',
														marginBottom: '6px',
														overflow: 'hidden',
														display: '-webkit-box',
														WebkitLineClamp: 2,
														WebkitBoxOrient: 'vertical',
														fontWeight: isUnread ? '500' : '400'
													}}>
														{lastMessage?.queryText?.replace(/<\/?[^>]+(>|$)/g, "") || 'No message content'}
													</div>

													<div style={{
														fontSize: '10px',
														lineHeight: '1.4',
														color: '#666',
														marginBottom: '4px'
													}}>
														{item.eventType && (
															<span style={{
																color: '#2196f3',
																fontWeight: '500'
															}}>
																{item.eventType}
																{item.eventId && ` - ${item.eventId}`}
															</span>
														)}
													</div>

													<div style={{
														display: 'flex',
														alignItems: 'center',
														fontSize: '12px',
														color: '#999'
													}}>
														<span>{getTimeAgo(item.datetime)}</span>

													</div>
												</div>

												{isUnread && (
													<div style={{
														width: '8px',
														height: '8px',
														borderRadius: '50%',
														backgroundColor: '#2196f3',
														marginLeft: '8px',
														flexShrink: 0,
														alignSelf: 'center'
													}} />
												)}
											</div>
										);
									})}
								</div>
							) : (
								<div style={{
									textAlign: 'center',
									padding: '40px 20px',
									color: '#999'
								}}>
									<div style={{ fontSize: '24px', marginBottom: '8px' }}>🔔</div>
									<div style={{ fontSize: '14px', fontWeight: '500' }}>No notifications</div>
									<div style={{ fontSize: '12px', marginTop: '4px' }}>You're all caught up!</div>
								</div>
							)}

							{Notificationlist && Notificationlist.length > 10 && (
								<div style={{
									borderTop: '1px solid #f0f0f0',
									paddingTop: '12px',
									marginTop: '12px',
									textAlign: 'center'
								}}>
									<Button
										variant="text"
										onClick={() => {
											setIsOpen(false);
											navigate("/query-list");
										}}
										style={{
											color: '#2196f3',
											fontSize: '13px',
											fontWeight: '500',
											textTransform: 'none',
											padding: '8px 16px'
										}}
									>
										View All Notifications
									</Button>
								</div>
							)}
						</div>

						{/* Removed commented duplicate notification list code for cleaner codebase */}
					</Box>
				</Drawer>


			</div>


			<React.Fragment key="visitsideTop">
				<Drawer
					anchor="right"
					open={state["sidebar"]}
					className=""
					style={{ zIndex: 9999 }}
				>
					<form onSubmit={formik.handleSubmit}>
						<Box
							sx={{ width: { xs: 320, sm: 600, md: 900 } }}
							className="overflow-hidden"
						>
							<div class="d-flex flex-column vh-100">
								<div
									class={`bgheaderNotificationCards ${userChatMobile ? "d-block" : ""
										} d-lg-block`}
								>
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">Messages</div>
										<div>
											<IconButton
												onClick={toggleDrawer("sidebar", false)}
												size="small"
												edge="start"
												sx={{ mr: 1 }}
											>
												<HiOutlineX className="f20 text-white" />
											</IconButton>
										</div>
									</div>
								</div>
								<CommunicationHub isSidebarVisible={isSidebarVisible} selectedNotification={selectedNotification} />

							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>
		</>
	);
};

export default MessageCell;
