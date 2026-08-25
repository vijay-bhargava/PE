import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { HiOutlineDotsVertical, HiOutlineSearch } from 'react-icons/hi';
import { InputAdornment, TextField, Button, Alert } from '@mui/material';
import { ChevronLeft, GraphicEqOutlined } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useStateValue } from '../../../store';
import { ApiClient } from '../../../Apiclient';
import { buildMultiParamQueryParams, buildQueryParams } from '../../../utils/purchaseRequest';
import { formatDateViaLocale } from '../../../utils/common/utility';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { HiOutlineX } from 'react-icons/hi';
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';

// Define the Message component (Sender - Right side - Blue bubble)
const Message = ({ time, body, attachment }) => {
	return (
		<div style={{
			display: 'flex',
			justifyContent: 'flex-end',
			marginBottom: '12px',
			paddingRight: '10px',
			paddingLeft: '50px'
		}}>
			<div style={{
				backgroundColor: '#0B93F6',
				color: '#fff',
				padding: '10px 14px',
				borderRadius: '18px',
				borderBottomRightRadius: '4px',
				maxWidth: '70%',
				wordWrap: 'break-word',
				boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
			}}>
				<div style={{ marginBottom: '4px', lineHeight: '1.4' }}>
					{body.replace(/<\/?[^>]+(>|$)/g, "")}
				</div>
				<div style={{
					fontSize: '11px',
					color: '#E3F2FD',
					textAlign: 'right',
					marginTop: '4px'
				}}>
					{time}
				</div>
				{attachment && (
					<div style={{ marginTop: '8px' }}>
						<div className="attachFile">{attachment}</div>
					</div>
				)}
			</div>
		</div>
	);
};

const MessageMirrored = ({ time, body, attachment }) => {
	return (
		<div style={{
			display: 'flex',
			justifyContent: 'flex-start',
			marginBottom: '12px',
			paddingLeft: '10px',
			paddingRight: '50px'
		}}>
			<div style={{
				backgroundColor: '#E5E5EA',
				color: '#000',
				padding: '10px 14px',
				borderRadius: '18px',
				borderBottomLeftRadius: '4px',
				maxWidth: '70%',
				wordWrap: 'break-word',
				boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
			}}>
				<div style={{ marginBottom: '4px', lineHeight: '1.4' }}>
					{body.replace(/<\/?[^>]+(>|$)/g, "")}
				</div>
				<div style={{
					fontSize: '11px',
					color: '#666',
					textAlign: 'right',
					marginTop: '4px'
				}}>
					{time}
				</div>
				{attachment && (
					<div style={{ marginTop: '8px' }}>
						<div className="attachFile">{attachment}</div>
					</div>
				)}
			</div>
		</div>
	);
};


// Define the CommunicationHub component
const AuctionCommunication = ({ bidId, connection, handleApprover, VendorsCommID, permissionManager }) => {
	const [{ atoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
	const apiClient = useMemo(() => new ApiClient(customersuffix), [customersuffix]);
	const [selectedVendorName, setSelectedVendorName] = useState(null);
	const [selectedVendorId, setSelectedVendorId] = useState(null);
	const selectedVendorIdRef = useRef(null);
	const [queryText, setqueryText] = useState("");
	const [broadcastQueryText, setBroadcastQueryText] = useState("");
	const [loading, setLoading] = useState(false);
	const [commParticipantUser, setCommParticipantUser] = useState([]);
	// console.log("commParticipantUser::", commParticipantUser)
	const [selectedCommId, setSelectedCommId] = useState(null);
	const messagesContainerRef = useRef(null);

	// Function to scroll only the messages container to bottom
	const scrollMessagesToBottom = () => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
		}
	};

	useEffect(() => {
		//pullUsersList();
		fetchInvitedVendorDetails();
	}, []);

	// TO SHOW INVITED VENDOR LIST
	const [InvitedVendors, setInvitedVendors] = useState([]);
	const InvitedVendorsRef = useRef([]);
	const [MessageType, setMessageType] = useState('');
	//console.log("InvitedVendors::", InvitedVendors)

	const fetchInvitedVendorDetails = async () => {
		const res = await apiClient.get(
			`api/AuctionParticipation/InvitedVendors?BidId=${bidId}`,
			atoken
		);
		if (res) {
			setInvitedVendors(res);
			InvitedVendorsRef.current = res;
		}
	};


	useEffect(() => {
		if (!connection || connection._connectionState !== "Connected") return;

		const handleVendorConnectionStatus = (connectedUsers) => {
			console.log("objChatVL::", connectedUsers);
			// eslint-disable-next-line eqeqeq
			if (bidId != connectedUsers.bidId) return;

			let isUpdated = false;
			const updatedVendorDetail = InvitedVendorsRef.current.map(q => {
				// eslint-disable-next-line eqeqeq
				if (q.contactId == connectedUsers?.createdById) {
					// Only update isSupplierOnline for the vendor currently open in chat
					if (q.vendorId === selectedVendorIdRef.current) {
						setIsSupplierOnline(connectedUsers?.connected);
					}
					isUpdated = true;
					return {
						...q,
						contactId: connectedUsers?.createdById,
						status: connectedUsers?.connected,
						connectionId: connectedUsers?.connectionId
					};
				}
				return q;
			});

			if (isUpdated) {
				InvitedVendorsRef.current = updatedVendorDetail;
				setInvitedVendors(updatedVendorDetail);

				setCommParticipantUser((prev) =>
					prev.map((user) =>
						// eslint-disable-next-line eqeqeq
						user.userId == connectedUsers.createdById
							? { ...user, connectionId: connectedUsers.connectionId }
							: user
					)
				);
			}
		};

		connection.on("VendorConnectionStatus", handleVendorConnectionStatus);

		return () => {
			connection.off("VendorConnectionStatus", handleVendorConnectionStatus);
		};
	}, [connection, bidId]);

	const handleChangeVendor = useCallback((event, newValues) => {

		if (Array.isArray(newValues)) {
			const updatedVendor = newValues.map((newValue) => ({
				// userId: newValue.vendorId,
				userId: newValue.contactId,
				userName: newValue.contactPerson,
				userEmail: newValue.emailId,
				isRead: false,
				// DCommId: selectedCommId || 0,
				DCommId: 0,
				isVendorYN: "Y", // Set to "Y" for vendors
				linkurl: "",
				customerId: customerid,
				connectionId: newValue.connectionId ?? ''
			}));

			const updatedCommParticipantUser = [
				...commParticipantUser.filter(user => user.isVendorYN === "N"), // Existing users
				...updatedVendor // New vendors
			];

			//setToGetVendorId(updatedVendor);
			setCommParticipantUser(updatedCommParticipantUser);
		} else {
			console.error("New value is not an array.");
		}

		// formik.validateForm(); // Removed to avoid circular dependency
	}, [customerid, commParticipantUser]);

	const getInitials = (name) => {

		if (typeof name !== 'string' || name.trim() === '') {
			return 'NN';
		}

		const parts = name.trim().split(' ');
		if (parts.length === 1) {
			return parts[0][0].toUpperCase();
		}
		return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
	};

	const validationSchema = yup.object({
		queryText: yup
			.string("Enter your Description")
			.required("Please enter your query"),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: 0,
			toVendorId: "",
			fromId: userDetail?.id,
			userName: userDetail?.name,
			userEmail: userDetail?.email,
			customerId: customerid,
			queryText: MessageType === 'B' ? broadcastQueryText : queryText,
			commId: selectedCommId || 0,
			isRead: selectedCommId > 0 ? true : false,
			eventId: bidId,
			eventType: "Auction",
			userType: "User",
			urllink: "",
			commParticipantUser: commParticipantUser
		},
		validationSchema: validationSchema,
		onSubmit: (values) => {

			setLoading(true);

			// For broadcast, create separate CommDetails for each vendor with their own commId
			let commDetails;
			if (MessageType === 'B') {
				commDetails = values?.commParticipantUser?.map((user) => ({
					id: 0,
					userEmail: values?.userEmail,
					queryText: values?.queryText,
					isRead: user?.isRead,
					commId: user?.commId,  // Use the vendor's specific commId
					eventId: values?.eventId,
					eventType: values?.eventType,
					userType: values?.userType,
					vURLLINK: values?.urllink,
					customerId: values?.customerId,
					createdById: values?.fromId,
					createdByName: values?.userName,
					createdOn: new Date().toISOString(),
					commParticipantUser: [{
						userId: user?.userId,
						userName: user?.userName,
						userEmail: user?.userEmail,
						isRead: user?.isRead,
						DCommId: user?.DCommId,
						commId: user?.commId,
						isVendorYN: user?.isVendorYN,
						connectionId: user?.connectionId,
						customerId: user?.customerId,
					}]
				})) || [];
			} else {
				// For individual vendor messages
				commDetails = [
					{
						id: values.id,
						userEmail: values?.userEmail,
						queryText: values?.queryText,
						isRead: values?.isRead,
						commId: values?.commId,
						eventId: values?.eventId,
						eventType: values?.eventType,
						userType: values?.userType,
						vURLLINK: values?.urllink,
						customerId: values?.customerId,
						createdById: values?.fromId,
						createdByName: values?.userName,
						createdOn: new Date().toISOString(),
						commParticipantUser: values?.commParticipantUser?.map((user) => ({
							userId: user?.userId,
							userName: user?.userName,
							userEmail: user?.userEmail,
							isRead: user?.isRead,
							DCommId: user?.DCommId,
							commId: values?.commId,
							isVendorYN: user?.isVendorYN,
							connectionId: user?.connectionId,
							customerId: user?.customerId,
						}))
					},
				];
			}

			// Map to CommHeaderDto
			const commHeaderDto = {
				id: values?.commId ?? 0,
				userEmail: values?.userEmail,
				isRead: values?.isRead,
				eventId: values?.eventId,
				eventType: values?.eventType,
				userType: values?.userType,
				urllink: values?.urllink,
				vURLLINK: "",
				isEmailActive: false,
				customerId: values?.customerId,
				createdById: values?.fromId,
				createdByName: values?.userName,
				createdOn: new Date().toISOString(),
				MessageType: MessageType,
				commDetails: commDetails
			};
			console.log("commHeaderDtoFinalData::", commHeaderDto)

			SendMessage(commHeaderDto)
				.then((response) => {
					console.log("Message sent successfully:", response);
					setLoading(false);

					if (MessageType === 'B') {
						// For broadcast, just clear the text - don't store in message list
						setBroadcastQueryText("");
						toast.success("Broadcast message sent to all suppliers successfully!");
					} else {
						// For individual vendor messages
						setMessagedata((prevMessages) => {
							const updated = [
								...prevMessages,
								...commHeaderDto?.commDetails,
							];
							setTimeout(() => scrollMessagesToBottom(), 100);
							return updated;
						});
						setqueryText("");
					}
				})
				.catch((error) => {
					console.error("Error sending message:", error);
					setLoading(false);
				});
		},
	});

	const SendMessage = async (commHeaderDto) => {
		try {

			const response = await connection.invoke("SendMessage", JSON.stringify(commHeaderDto));
			return response;
		} catch (err) {
			console.error("Error invoking SendMessage:", err);
			throw err;
		}
	};

	const resetState = () => {
		setqueryText("");
		setBroadcastQueryText("");
		setCommParticipantUser([]);
	};

	const handleTextareaChange = (e) => {
		const { value } = e.target;
		if (MessageType === 'B') {
			setBroadcastQueryText(value);
		} else {
			setqueryText(value);
		}
		formik.setFieldValue('queryText', value);
	};

	const [Messagedata, setMessagedata] = useState([]);
	//const [BroadCastMessagedata, setBroadCastMessagedata] = useState([]);
	//console.log("BroadCastMessagedata::", BroadCastMessagedata)

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (Messagedata.length > 0) {
			setTimeout(() => scrollMessagesToBottom(), 100);
		}
	}, [Messagedata]);
	const pullMessageList = useCallback(async (commId) => {

		var data = {
			Id: commId
		};

		const queryParams = buildMultiParamQueryParams(data);
		// const res = await apiClient.getres(`api/Communication/Find?${queryParams}`, atoken);
		const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken);

		if (res?.data?.result && res.data.result.length > 0) {

			const data = res?.data?.result;
			setMessagedata(data[0]?.commDetails);
			setSelectedCommId(data[0]?.commDetails[0]?.commId);
			// Scroll to bottom after loading messages
			setTimeout(() => scrollMessagesToBottom(), 100);
		}
	}, [apiClient, atoken]);

	const BroadCastMessageList = async () => {

		var data = {
			CustomerId: customerid,
			SortingColumn: "Id",
			EventId: bidId,
			EventType: "Auction"
		};

		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken);
		if (res) {

			const data = res?.data?.result;
			//setBroadCastMessagedata(data);

			// Populate vendors with their respective commIds from the broadcast data
			if (data && data.length > 0) {
				const allVendorsWithCommId = InvitedVendors.map((vendor) => {
					// Find the commHeader for this vendor
					const vendorCommHeader = data.find((commHeader) =>
						commHeader.commDetails?.some(detail =>
							detail.commParticipantUser?.some(user => user.userId === vendor.contactId)
						)
					);

					return {
						userId: vendor.contactId,
						userName: vendor.contactPerson,
						userEmail: vendor.emailId,
						isRead: false,
						DCommId: 0,
						isVendorYN: "Y",
						linkurl: "",
						customerId: customerid,
						connectionId: vendor.connectionId ?? '',
						commId: vendorCommHeader?.id || 0  // Use the commHeader's id as commId
					};
				});

				setCommParticipantUser(allVendorsWithCommId);
			}
		}
	};

	const [isOverlay, setIsOverlay] = useState(false);
	console.log("isOverlay::", isOverlay)
	// const [MessageType, setMessageType] = useState('');
	const [isSupplierOnline, setIsSupplierOnline] = useState(false);
	const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' or 'broadcast'
	const [vendorSearchQuery, setVendorSearchQuery] = useState('');
	//console.log("isSupplierOnline::", isSupplierOnline)
	const handleBroadCastMessage = () => {
		setIsOverlay(true);
		setMessageType('B');

		BroadCastMessageList().then(() => {
			// After fetching broadcast message list, we'll populate vendors in useEffect
		});
	};

	// Filter vendors based on search query
	const filteredInvitedVendors = InvitedVendors.filter((vendor) => {
		if (!vendorSearchQuery) return true;
		const searchLower = vendorSearchQuery.toLowerCase();
		return (
			vendor.contactPerson?.toLowerCase().includes(searchLower) ||
			vendor.companyName?.toLowerCase().includes(searchLower) ||
			vendor.emailId?.toLowerCase().includes(searchLower)
		);
	});

	const handleSidebarItemClick = useCallback((vendor) => {

		setSelectedVendorName(vendor?.contactPerson)
		setSelectedVendorId(vendor?.vendorId)
		selectedVendorIdRef.current = vendor?.vendorId;
		setIsOverlay(true);
		setMessageType('V');
		setIsSupplierOnline(vendor?.status ?? false);
		setMessagedata([]);

		const matchedVendors = InvitedVendors.filter(
			(invitedVendor) => invitedVendor.vendorId === vendor.vendorId
		);
		handleChangeVendor(null, matchedVendors);
		const matchedCommVendor = VendorsCommID.find(
			(v) => v.contactId === vendor.contactId
		);
		if (matchedCommVendor) {

			pullMessageList(vendor?.commId);
		} else {
			console.warn("No matching vendor found in VendorsCommID for contactId:", vendor.contactId);
		}
	}, [InvitedVendors, VendorsCommID, pullMessageList, handleChangeVendor]);

	useEffect(() => {
		if (!connection || connection._connectionState !== "Connected") return;

		const messageHandler = (objcommHeaderDto) => {

			let parsedData;
			try {
				parsedData = typeof objcommHeaderDto == "string"
					? JSON.parse(objcommHeaderDto)
					: objcommHeaderDto;
			} catch {
				console.error("Invalid message format", objcommHeaderDto);
				return;
			}

			if (bidId !== parsedData?.eventId) return;

			// Always show toast notification for any incoming message
			const createdByName = parsedData?.createdByName || "Unknown";
			const queryText = parsedData?.commDetails?.[0]?.queryText || "New message received";

			// Find the vendor who sent this message
			const senderVendor = InvitedVendors.find(vendor => vendor.contactPerson === createdByName);

			toast.info(`${createdByName}: ${queryText}`, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				onClick: () => {
					// If vendor found, open their chat
					if (senderVendor) {
						handleSidebarItemClick(senderVendor);
					} else {
						// Fallback to just opening the communication panel
						handleApprover(true);
					}
				},
			});

			// Only update message list if the incoming message is from the currently selected vendor
			// Check if the message sender matches the currently selected vendor
			if (selectedVendorName && createdByName === selectedVendorName) {
				setMessagedata((prev) => {
					const updated = [...prev, ...parsedData.commDetails];
					// Scroll to bottom after adding new message
					setTimeout(() => scrollMessagesToBottom(), 100);
					return updated;
				});
			}
		};

		connection.on("ReceiveMessage", messageHandler);
		return () => connection.off("ReceiveMessage", messageHandler);

	}, [connection, bidId, selectedVendorName, handleApprover, InvitedVendors, handleSidebarItemClick]);


	const handleBackClick = () => {
		setIsOverlay(false);
		setIsSupplierOnline(false);
		//setCommParticipantUser([]);
		setSelectedVendorName('')
		setMessageType('');
		setActiveTab('suppliers'); // Reset to suppliers tab when going back
		setVendorSearchQuery(''); // Clear search when going back
		resetState();
	};

	return (
		<>
			{!(permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ) ?? false) ? (
				<div className="p-3">
					<Alert severity="warning">
						You don't have permission to view this communication page.
					</Alert>
				</div>
			) : (
				<div className="v2-notif-panel" style={{ height: '100%' }}>
					{!isOverlay && <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
						{/* Header */}
						<div className="v2-notif-header">
							<span className="v2-notif-title">Chats</span>
							<div className="v2-notif-header-actions">
								<button type="button" className="pe-icon-btn pe-icon-btn--close v2-notif-close-btn" onClick={() => handleApprover(false)}>
									<HiOutlineX className="v2-notif-close-icon" />
								</button>
							</div>
						</div>
						{/* Search bar */}
						<div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
							<TextField
								size='small'
								className='w-100'
								placeholder="Search..."
								value={vendorSearchQuery}
								onChange={(e) => setVendorSearchQuery(e.target.value)}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<HiOutlineSearch style={{ color: '#9ca3af', fontSize: 16 }} />
											</InputAdornment>
										),
									},
								}}
								variant="outlined"
							/>
						</div>

						{/* Tab Headers */}
						<div className="d-flex w-100" style={{ borderBottom: '2px solid #e0e0e0' }}>
							<div
								className="col-6 text-center py-2"
								onClick={() => setActiveTab('suppliers')}
								style={{
									cursor: 'pointer',
									borderBottom: activeTab === 'suppliers' ? '3px solid #0B93F6' : 'none',
									backgroundColor: activeTab === 'suppliers' ? '#f0f8ff' : 'transparent',
									fontWeight: activeTab === 'suppliers' ? '600' : '400',
									color: activeTab === 'suppliers' ? '#0B93F6' : '#666',
									transition: 'all 0.3s ease'
								}}
							>
								Suppliers
							</div>
							<div
								className="col-6 text-center py-2"
								onClick={() => {
									setActiveTab('broadcast');
									const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? false;
									if (hasCreatePermission) {
										handleBroadCastMessage();
									}
								}}
								style={{
									cursor: 'pointer',
									borderBottom: activeTab === 'broadcast' ? '3px solid #0B93F6' : 'none',
									backgroundColor: activeTab === 'broadcast' ? '#f0f8ff' : 'transparent',
									fontWeight: activeTab === 'broadcast' ? '600' : '400',
									color: activeTab === 'broadcast' ? '#0B93F6' : '#666',
									transition: 'all 0.3s ease'
								}}
							>
								Broadcast Message
							</div>
						</div>

						{/* Tab Content */}
						{activeTab === 'suppliers' && (
							<div>
								{filteredInvitedVendors.length > 0 ? (
									filteredInvitedVendors.map((vendor) => {
										const avatarClass = vendor.status ? "avatar green" : "avatar red";
										const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.READ) ?? false;
										return (
											<div
												key={vendor.vendorId}
												className={`auction-query-item ${!hasReadPermission ? 'disabled-item' : ''}`}
												onClick={hasReadPermission ? () => handleSidebarItemClick(vendor) : undefined}
												style={{
													cursor: hasReadPermission ? 'pointer' : 'not-allowed',
													opacity: hasReadPermission ? 1 : 0.6
												}}
											>
												<div className={avatarClass}>{getInitials(vendor.contactPerson)}</div>
												<div className="query-info">
													<div className='d-flex'>
														<div className='col-md-12'>
															<div className="query-author">
																{vendor.contactPerson}
																{!hasReadPermission && <span className="text-muted"> (No Permission)</span>}
															</div>
															<div className="query-company">
																{vendor.companyName}
															</div>
														</div>
													</div>
												</div>
												<hr className='mt-2 p-0' />
											</div>
										);
									})
								) : (
									<div className="text-center p-4">
										<p className="text-muted">No suppliers found</p>
									</div>
								)}
							</div>
						)}

						{activeTab === 'broadcast' && (
							<div className="">
								<div className='sidebar-broadcast-search '>
									{(() => {
										const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? false;
										return (
											<div
												className={`auction-broadcast-item ${!hasCreatePermission ? 'disabled-item' : ''}`}
												style={{
													cursor: hasCreatePermission ? 'pointer' : 'not-allowed',
													opacity: hasCreatePermission ? 1 : 0.6,
													padding: '15px'
												}}
											>
												<div className='avatar'><GraphicEqOutlined /></div>
												<div className="query-info">
													<div className='d-flex'>
														<div className='col-md-12'>
															<div className="query-author">
																BroadCast Message
																{!hasCreatePermission && <span className="text-muted"> (No Permission)</span>}
															</div>
															<div className="text-muted" style={{ fontSize: '12px' }}>
																Send message to all suppliers
															</div>
														</div>
													</div>
												</div>
												<hr className='mt-2 p-0' />
											</div>
										);
									})()}
								</div>
							</div>
						)}
					</div>}

					{isOverlay && <div className="auction-main-content ps-0 pb-0 pt-0 pe-0 overlay" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
						{(
							<div className='d-flex align-items-center border-bottom justify-content-between pt-3 pb-3' style={{ flexShrink: 0 }}>
								<div className='col-md-2'>
									<div className="back-button">
										<Button variant='standard' className='custom-buttom text-primary p-0 shadow-none' onClick={handleBackClick}><ChevronLeft /></Button>
									</div>
								</div>
								<div className='col-md-10'>
									<div className="main-header p-0">
										<div>
											<div className="main-title ">{selectedVendorName ? selectedVendorName : 'BroadCast Message'}</div>
										</div>
										<div className='text-end'>
											<DropdownButton className='sidebaraccmenu  text-start ps-0 custom-dropdown-button ' id='communication-hub' title={<HiOutlineDotsVertical className="f20  text-end " style={{ color: "#0d6efd" }} />}>
												<Dropdown.Item className='f12 fw500'>
													Download
												</Dropdown.Item>
												<Dropdown.Item className='f12 fw500'>
													Mute Mail Notification
												</Dropdown.Item>

											</DropdownButton>
										</div>
									</div>

								</div>
							</div>
						)}
						<div className="messages-new scrollbar-container" ref={messagesContainerRef} style={{
							padding: '16px 8px',
							flex: 1,
							overflowY: 'auto',
							minHeight: 0
						}}>
							{MessageType === 'B' ? (
								// Broadcast mode - don't show any messages, just allow sending
								<div className="text-center text-muted mt-5">
									<p>Compose and send a message to all suppliers</p>
								</div>
							) : (
								// Display individual vendor messages
								(Array.isArray(Messagedata) && Messagedata.length > 0) ? (
									Messagedata.map((message) => {
										const isIncoming = message?.userType === 'Vendor';
										const formattedTime = formatDateViaLocale(
											message?.createdOn,
											"",
											{ hour: "2-digit", minute: "2-digit", hour12: false }
										);
										const MessageComponent = isIncoming ? MessageMirrored : Message;

										return (
											<MessageComponent
												key={message?.id}
												time={formattedTime}
												body={message?.queryText}
											/>
										);
									})
								) : (
									<div className="text-center text-muted mt-5">
										<p>No messages yet</p>
									</div>
								)
							)}
						</div>
						<div className="message-input" style={{
							backgroundColor: '#fff',
							borderTop: '1px solid #e0e0e0',
							padding: '10px 16px',
							flexShrink: 0
						}}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
								<div style={{ flex: 1, maxWidth: 'calc(100% - 50px)' }}>
									{(() => {
										const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? false;
										return (
											<textarea
												rows={1}
												style={{
													width: '100%',
													border: '1px solid #E8E8E8',
													borderRadius: '25px',
													padding: '14px 16px',
													fontSize: '12px',
													resize: 'none',
													outline: 'none',
													fontFamily: 'inherit',
													maxHeight: '100px',
													overflowY: 'auto',
													lineHeight: '1.4',
													backgroundColor: '#FFF',
													color: '#333',
													boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
												}}
												placeholder={hasCreatePermission ? (MessageType === 'B' ? 'Broadcast message to all vendors...' : 'Ask Your Query...') : 'You do not have permission to send messages'}
												value={MessageType === 'B' ? broadcastQueryText : queryText}
												onChange={handleTextareaChange}
												disabled={(MessageType !== 'B' && !isSupplierOnline) || !hasCreatePermission}
												readOnly={!hasCreatePermission}
												onKeyDown={(e) => {
													if (e.key === 'Enter' && !e.shiftKey) {
														e.preventDefault();
														formik.handleSubmit();
													}
												}}
											/>
										);
									})()}
									{formik.touched.queryText && formik.errors.queryText && (
										<div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', marginLeft: '16px' }}>
											{formik.errors.queryText}
										</div>
									)}
								</div>
								<div>
									{(() => {
										const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.QUERIES, ACTIONS.CREATE) ?? false;
										return (
											<LoadingButton
												loading={loading}
												size='small'
												color='primary'
												variant='contained'
												style={{
													minWidth: '36px',
													height: '36px',
													borderRadius: '50%',
													padding: '0',
													backgroundColor: '#2082DB',
													boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
												}}
												onClick={formik.handleSubmit}
												disabled={(MessageType !== 'B' && !isSupplierOnline) || !hasCreatePermission}
											>
												<FaPaperPlane style={{ fontSize: '14px', color: '#FFF' }} />
											</LoadingButton>
										);
									})()}
								</div>
							</div>
						</div>
					</div>}
				</div>
			)}
		</>
	);
};

export default AuctionCommunication;
