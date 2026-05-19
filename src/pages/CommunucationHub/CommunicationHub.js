import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaUserFriends, FaPaperclip, FaPaperPlane, FaPlus } from 'react-icons/fa';
import { HiOutlineCog, HiOutlineDotsVertical, HiOutlineDownload, HiOutlinePaperAirplane, HiOutlineSearch, HiOutlineX, HiPaperClip, HiUserAdd } from 'react-icons/hi';
import { InputAdornment, TextField, Menu, MenuItem, ListItemIcon, Tooltip, IconButton, Button, Badge, Typography } from '@mui/material';
import { ExpandLess, ExpandMore, Send } from '@mui/icons-material';
import { useStateValue } from '../../store';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { FindThreadChat, FindUserList, insertThread } from '../../utils/communication';
import { toast } from 'react-toastify';
import RaiseQueryCell from './Cells/RaiseQueryCell';
import { uploadFilesOnAzure } from '../../utils/documentlibrary';
import { getExtension, handleDownloadFile, validateFileSize } from '../../utils/common';
import { Dropdown, DropdownButton, ToggleButton } from 'react-bootstrap';
import { formatDateViaTime, formattimeoption } from '../../utils/common/utility';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';


// Define the Message component
const Message = ({ avatar, from, to, time, body, attachment, onDownload }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className='messages'>
            <div className={`message ${expanded ? 'expanded' : 'collapsed'}`}>
                <div className="avatar">
                    {avatar}
                </div>
                <div className="message-content">
                    {expanded ? (
                        <>
                            <div className="message-header">
                                <div className="d-flex">
                                    <span className="col-md-6">From: {from}</span>
                                    <span className="col-md-6 text-end">
                                        {time}
                                        <span className="expand-collapse-icon" onClick={() => setExpanded(!expanded)}>
                                            <ExpandLess />
                                        </span>
                                    </span>
                                </div>
                                {to && to.length > 0 && <div>To: {to}</div>}

                            </div>
                            <div className="message-body">
                                {body}
                            </div>
                            {attachment && (
                                <div className="">
                                    <div className="col-md-11">
                                        <div className="attachFile">{attachment}</div>
                                    </div>

                                </div>
                            )}
                        </>
                    ) : (
                        <div className="message-body-collapsed">
                            {body.substring(0, 50)}{body.length > 50 && '...'}
                            <span className="expand-collapse-icon" onClick={() => setExpanded(!expanded)}>
                                <ExpandMore />
                            </span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

const MessageMirrored = ({ avatar, from, to, time, body, attachment, onDownload }) => {
    const [expanded, setExpanded] = useState(false);
    const [bgColor, setBgColor] = useState('');
    const getRandomDarkColor = () => {
        const r = Math.floor(Math.random() * 100); // Red channel (low range for dark colors)
        const g = Math.floor(Math.random() * 100); // Green channel (low range for dark colors)
        const b = Math.floor(Math.random() * 100); // Blue channel (low range for dark colors)
        return `rgb(${r}, ${g}, ${b})`; // Returning the color in RGB format
    };

    // Set random dark color on component mount
    useEffect(() => {
        setBgColor(getRandomDarkColor());
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <div className={`message-mirrored ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="avatar-mirrored" style={{ backgroundColor: bgColor }}>
                {avatar}
            </div>
            <div className="message-content">
                {expanded ? (
                    <>
                        <div className="message-header">
                            <div className="d-flex">
                                <span className="col-md-6">From: {from}</span>
                                <span className="col-md-6 text-end">
                                    {time}
                                    <span className="expand-collapse-icon " onClick={() => setExpanded(false)}>
                                        <ExpandLess />
                                    </span>
                                </span>
                            </div>
                            {/* <div>To: {to}</div> */}
                            {to && to.length > 0 && <div>To: {to}</div>} {/* Conditionally render the To: field */}
                        </div>
                        <div className="message-bodyChat">
                            {body}
                        </div>
                        {attachment && (
                            <div className="">
                                <div className="col-md-11">
                                    <div className="attachFile">{attachment}</div>
                                </div>

                            </div>
                        )}
                    </>
                ) : (
                    // <div className="message-body-collapsed">
                    //     {body.substring(0, 50)}{body.length > 50 && '...'}
                    //     <span className="expand-collapse-icon" onClick={() => setExpanded(true)}>
                    //         <ExpandMore />
                    //     </span>
                    // </div>
                    <div className="message-body-collapsed">
                        {(body || '').substring(0, 50)}{(body || '').length > 50 && '...'}
                        <span className="expand-collapse-icon" onClick={() => setExpanded(true)}>
                            <ExpandMore />
                        </span>
                    </div>

                )}
            </div>
        </div>
    );
};


// Define the CommunicationHub componentnp
const CommunicationHub = ({ isSidebarVisible, selectedNotification }) => {

    const [{ atoken, rtoken, customerid, userDetail, CommId, eventType, eventId, Notificationlist }, dispatch] = useStateValue();
    
    useEffect(() => {
        console.log('CommId from Redux:', CommId)
    }, [CommId])

    useEffect(() => {
        if (selectedNotification) {
            
            console.log('Setting from selectedNotification:', selectedNotification.id);
            setSelectedMessageId(selectedNotification.id);
            setChatData(selectedNotification.commDetails);
            setSelectedCommId(selectedNotification.id);
        }
    }, [selectedNotification]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [text, setText] = useState('');
    const [userList, setUserList] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [queryText, setqueryText] = useState("");
    const [commHeader, setCommHeader] = useState(0);
    const [commAttachment, setcommAttachment] = useState([]);
    const [toUserId, setToUserId] = useState([]);
    const [postFileName, setPostFileName] = React.useState("");
    const [commFolderName, setcommFolderName] = useState("");
    const [filesName, setFilesName] = useState([]);
    const [fileList, setFileList] = React.useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [commFileName, setcommFileName] = useState(null);
    const [chatData, setChatData] = useState([]);
    const [commParticipantUser, setCommParticipantUser] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [inputValueVendor, setInputValueVendor] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedCommId, setSelectedCommId] = useState(null);
    const [filteredUserList, setFilteredUserList] = useState([]);
    const fileInputQueryRef = useRef(null);
    const [userCount, setUserCount] = useState(0);
    const selectedMessage = Notificationlist?.find(message => message.id === selectedMessageId);
    useEffect(() => {
        if (selectedMessage) {
            
            setSelectedEventCode(selectedMessage?.commDetails[0].eventCode);
            pullUsersList();
        }
    }, [selectedMessage]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [messageSearchInput, setMessageSearchInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);


    const [isRaiseQueryVisible, setRaiseQueryVisible] = useState(false);

    const handleEditClick = () => {

        setRaiseQueryVisible(true);
    };

    const pullUsersList = () => {
        const data = { CustomerId: customerid, IsActive: "true" };
        setLoading(true);
        FindUserList(data, atoken).then((res) => {
            if (res && res.length > 0) {
                setUserList(res);
                setFilteredUserList(res);
                setShowUserList(false);
            }
            setLoading(false);
        });
    };
    useEffect(() => {
        const lowerCaseInput = searchInput.toLowerCase();
        const filteredUsers = userList.filter(user =>
            user.name.toLowerCase().includes(lowerCaseInput) ||
            user.email.toLowerCase().includes(lowerCaseInput)
        );
        setFilteredUserList(filteredUsers);
    }, [searchInput, userList]);

    // Handle keyboard shortcuts for search
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ctrl/Cmd + F to focus search
            if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
                event.preventDefault();
                const searchInput = document.getElementById('message-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            // Escape to clear search
            if (event.key === 'Escape' && messageSearchInput) {
                setMessageSearchInput('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [messageSearchInput]);

    // Filter messages based on search input with debounce
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedEventCode, setSelectedEventCode] = useState(0);


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(messageSearchInput);
            setIsSearching(false);
        }, 150); // Reduced from 300ms to 150ms for more responsive search

        if (messageSearchInput !== debouncedSearchTerm) {
            setIsSearching(true);
        }

        return () => clearTimeout(timer);
    }, [messageSearchInput, debouncedSearchTerm]);

    const filteredMessages = Notificationlist?.filter(message => {
        // Use immediate search input for real-time filtering, fallback to debounced for highlighting
        const searchTerm = messageSearchInput.trim() || debouncedSearchTerm.trim();
        if (!searchTerm) return true;

        const lowerSearchTerm = searchTerm.toLowerCase();
        const commDetail = message.commDetails[0];
        const userName = String(commDetail?.createdByName || '');
        const queryText = String(commDetail?.queryText?.replace(/<\/?[^>]+(>|$)/g, "") || '');
        const eventType = String(message.eventType || '');
        const eventId = String(message.eventId || '');
        const eventCode = String(message.eventCode || '');

        return (
            userName.toLowerCase().includes(lowerSearchTerm) ||
            queryText.toLowerCase().includes(lowerSearchTerm) ||
            eventType.toLowerCase().includes(lowerSearchTerm) ||
            eventId.toLowerCase().includes(lowerSearchTerm) ||
            eventCode.toLowerCase().includes(lowerSearchTerm)
        );
    }) || [];

    // Function to highlight search terms
    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm || !text || typeof text !== 'string') return text || '';

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ?
                <span key={index} style={{ backgroundColor: '#fff3cd', fontWeight: '600' }}>{part}</span> :
                part
        );
    };

    const toggleUserList = () => {
        setShowUserList((prev) => !prev);
    };


    const handleUserSelect = (user) => {
        setSelectedUsers(prevSelectedUsers => {
            const isUserSelected = prevSelectedUsers.some(selectedUser => selectedUser.id === user.id);
            let updatedSelectedUsers;

            if (isUserSelected) {
                updatedSelectedUsers = prevSelectedUsers.filter(selectedUser => selectedUser.id !== user.id);
                setUserCount(prevCount => prevCount - 1);
            } else {
                updatedSelectedUsers = [...prevSelectedUsers, user];
                setUserCount(prevCount => prevCount + 1);
            }

            handleChangeUser(null, updatedSelectedUsers);

            return updatedSelectedUsers;
        });
    };

    const removeSelectedUser = (userId) => {
        setSelectedUsers(prevSelectedUsers =>
            prevSelectedUsers.filter(user => user.id !== userId)
        );
    };


    const [isMuted, setIsMuted] = useState(false);

    const handleMuteClick = () => {
        setIsMuted(prev => {
            const newState = !prev;

            toast.info(
                newState
                    ? 'Mute Mail notification '
                    : 'Unmute  Mail notification'
            );

            return newState;
        });
    };
    const handleAttachmentClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            console.error('File input ref is not set');
        }
    };

    const getCommIdFromMessageId = (messageId) => {

        const message = Notificationlist.find(msg => msg.id === messageId);
        return message ? message.commId : null;
    };

    const handleMessageClick = (id) => {
        console.log('User clicked message with id:', id);
        setSelectedMessageId(id);
        setSelectedCommId(id);
        fetchChatThreadCall(id);
    };


    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };



    const handleVendorSelect = (vendor) => {
        setSelectedVendors([...selectedVendors, vendor]);
        setInputValueVendor('');
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setShowUserList(e.target.value.includes('@'));
    };

    const handleInputVendorChange = (e) => {
        setInputValueVendor(e.target.value);
    };

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

    const fetchChatThreadCall = async (selectedCommId) => {

        try {
            const data = {
                CommId: selectedCommId,
            };

            const response = await FindThreadChat(data, atoken);
            if (response && response.length > 0) {
                ;
                setChatData(response);
                console.log("res" + JSON.stringify(response));
                return true;
            }
        } catch (error) {
            console.error("Error fetching chat thread:", error);
        }
    };

    const validationSchema = yup.object({
        queryText: yup
            .string("Enter your Description")
            .required("Please ask your query"),
    });
    const MessageeventType = selectedMessage ? selectedMessage.eventType : '';
    const MessageeventId = selectedMessage ? selectedMessage.eventId : '';

    const currentNotification = Notificationlist.find(
        (item) => item.id === selectedCommId
    );



    // const originalParticipants =
    //     currentNotification?.commDetails?.[0]?.commParticipantUser || [];

    // const initiator = originalParticipants.find(
    //     (p) => p.userId === currentNotification?.createdById
    // );

    // const filteredRecipients = originalParticipants.filter(
    //     (participant) =>
    //         participant.userId !== userDetail?.id ||
    //         participant.userId === currentNotification?.createdById
    // );


    // const participantMap = new Map();

    // if (initiator) {
    //     const key = `${initiator.userId}-${initiator.isVendorYN || "N"}`;
    //     participantMap.set(key, {
    //         id: 0,
    //         userId: initiator.userId,
    //         userName: initiator.userName,
    //         userEmail: initiator.userEmail || "",
    //         isRead: false,
    //         commId: selectedCommId,
    //         isVendorYN: initiator.isVendorYN || "N",
    //         connectionId: "",
    //         customerId: customerid,
    //     });
    // }


    // filteredRecipients.forEach((p) => {
    //     const key = `${p.userId}-${p.isVendorYN || "N"}`;
    //     if (!participantMap.has(key)) {
    //         participantMap.set(key, {
    //             id: 0,
    //             userId: p.userId,
    //             userName: p.userName,
    //             userEmail: p.userEmail,
    //             isRead: false,
    //             commId: selectedCommId,
    //             isVendorYN: p.isVendorYN || "N",
    //             connectionId: "",
    //             customerId: customerid,
    //         });
    //     }
    // });

    // const finalCommParticipantUser = Array.from(participantMap.values());
    const originalParticipants =
        currentNotification?.commDetails?.[0]?.commParticipantUser || [];

    const filteredRecipients = originalParticipants.filter(
        (participant) =>
            participant.userId !== userDetail?.id
    );

    const participantMap = new Map();

    // ✅ Always add the initiator (createdById / createdByName) manually
    if (currentNotification?.createdById && currentNotification?.createdByName) {
        const key = `${currentNotification.createdById}-N`;
        participantMap.set(key, {
            id: 0,
            userId: currentNotification.createdById,
            userName: currentNotification.createdByName,
            userEmail: "", // Optionally fill if available elsewhere
            isRead: false,
            commId: selectedCommId,
            isVendorYN: "N",
            connectionId: "",
            customerId: customerid,
        });
    }

    // ✅ Add other recipients except current user
    filteredRecipients.forEach((p) => {
        const key = `${p.userId}-${p.isVendorYN || "N"}`;
        if (!participantMap.has(key)) {
            participantMap.set(key, {
                id: 0,
                userId: p.userId,
                userName: p.userName,
                userEmail: p.userEmail,
                isRead: false,
                commId: selectedCommId,
                isVendorYN: p.isVendorYN || "N",
                connectionId: "",
                customerId: customerid,
            });
        }
    });

    const finalCommParticipantUser = Array.from(participantMap.values());


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
            commId: selectedCommId || 0,
            eventId: MessageeventId,
            eventType: MessageeventType,
            userType: "Buyer",
            urllink: "",
            customerId: customerid,
            commAttachment: commAttachment,


            commParticipantUser: finalCommParticipantUser,
        },

        validationSchema: validationSchema,

        onSubmit: (values) => {
            ;
            setLoading(true);
            submitFormValues(values);
        },
    });

    const submitFormValues = (values) => {

        console.log("Submitted values:", values);

        setLoading(true);
        insertThread(values, atoken)
            .then((res) => {
                setLoading(false);
                fetchChatThreadCall(selectedCommId);
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
        setUserCount(0);
        setCommParticipantUser([]);
        setSelectedUsers([]);
        setcommAttachment([]);
        setcommFileName("");
        setcommFolderName("");
        setFilesName([]);
        setFileList([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };



    // const rfqTitle = selectedMessage 
    //     ? `Query Regarding ${selectedMessage.eventType}: ${selectedMessage.eventId}` 
    //     : '';

    const rfqTitle = selectedMessage
        ? (selectedMessage.eventCode && selectedMessage.eventCode !== 'null' && selectedMessage.eventId && selectedMessage.eventId !== 0)
            ? selectedMessage.eventCode
            : (selectedMessage.eventType && selectedMessage.eventType !== 'null' && selectedMessage.eventId && selectedMessage.eventId !== 0)
                ? `${selectedMessage.eventType}: ${selectedMessage.eventId}`
                : 'Personal Chat'
        : '';

    // Determine if sidebar should be shown - hide for personal chats
    const shouldShowSidebar = isSidebarVisible && rfqTitle !== 'Personal Chat';

    const handleTextareaChange = (e) => {
        const { value } = e.target;
        setqueryText(value);
        formik.setFieldValue('queryText', value);
    };

    const handleFileChange = async (event) => {
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
            const eventType = selectedMessage ? selectedMessage.eventType : '';
            const eventId = selectedMessage ? selectedMessage.eventId : '';
            const foldername = `${customerid}${eventType}${eventId}comm`;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const fileName = file.name;

                if (fileName.length > 50) {
                    toast.error("Attachment name must be 50 characters or fewer.", {
                        toastId: "Attachmentallextension",
                    });
                    event.target.value = null;
                    return;
                }

                const newAttachment = {
                    id: 0,
                    commId: selectedCommId,
                    commFolderName: foldername,
                    commFileName: fileName,
                    customerId: customerid,
                };

                updatedCommAttachment.push(newAttachment);
                updatedFilesName.push({ name: fileName });
                setcommFolderName(foldername);


                const data = {
                    RequestedBy: "customer",
                    EventType: eventType,
                    CustomerId: customerid,
                    Description: "Comm",
                };

                try {
                    const filePath = await uploadFilesOnAzure(data, file, atoken);
                    newAttachment.commFolderName = filePath;
                } catch (error) {
                    toast.error(`Error uploading file ${fileName}: ${error.message}`);
                    continue;
                }
            }

            setcommAttachment((prevAttachments) => [
                ...prevAttachments,
                ...updatedCommAttachment,
            ]);
            setFilesName((prevFilesName) => [...prevFilesName, ...updatedFilesName]);
            setFileList(selectedFiles);
            setFile(null);
        }
    };

    const carouselRef = useRef();

    const handleKeyDown = (event) => {
        if (carouselRef.current) {
            if (event.key === 'ArrowRight') {
                carouselRef.current.scrollBy({ left: 100, behavior: 'smooth' });
            } else if (event.key === 'ArrowLeft') {
                carouselRef.current.scrollBy({ left: -100, behavior: 'smooth' });
            }
        }
    };
    const handleRemovedFile = (indexToRemove) => {
        const updatedFiles = filesName.filter((_, index) => index !== indexToRemove);
        setFilesName(updatedFiles);
        setcommFolderName("");
        setcommFileName("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileRemoved = (index) => {

        const updatedFilesName = filesName.filter((_, i) => i !== index);
        setFilesName(updatedFilesName);
    };
    const handleChangeUser = (event, newValues) => {
        if (Array.isArray(newValues)) {
            const updatedUser = newValues.map((newValue) => ({
                id: 0,
                userId: newValue.id,
                userName: newValue.name || '',
                userEmail: newValue.email || '',
                isRead: false,
                commId: selectedCommId,
                isVendorYN: "N",
                linkurl: "",
                customerId: customerid,
            }));

            const newParticipantMap = new Map();

            // ✅ Add original participants first (vendors, creator, etc.)
            finalCommParticipantUser.forEach(user => {
                const key = `${user.userId}-${user.isVendorYN || 'N'}`;
                newParticipantMap.set(key, user);
            });

            // ✅ Add new selections, overriding only if necessary
            updatedUser.forEach(user => {
                const key = `${user.userId}-${user.isVendorYN}`;
                newParticipantMap.set(key, user);
            });

            const mergedCommParticipantUser = Array.from(newParticipantMap.values());

            setToUserId(updatedUser);
            setCommParticipantUser(mergedCommParticipantUser);

            // ✅ Update Formik field with both original and new users
            formik.setFieldValue("commParticipantUser", mergedCommParticipantUser);
        } else {
            console.error("New value is not an array.");
        }

        formik.validateForm();
    };


    //   const handleChangeUser = (event, newValues) => {
    //     if (Array.isArray(newValues)) {
    //         const updatedUser = newValues.map((newValue) => ({
    //             userId: newValue.id,
    //             userName: newValue.name || '',
    //             userEmail: newValue.email || '',
    //             isRead: false,
    //             commId: selectedCommId,
    //             isVendorYN: "N",
    //             linkurl: "",
    //             customerId: customerid,
    //         }));

    //         const updatedCommParticipantUser = [
    //             ...commParticipantUser.filter(user => user.isVendorYN === "Y"),
    //             ...updatedUser.filter(user => user.userId !== userDetail?.id)
    //         ];

    //         setToUserId(updatedUser);
    //         setCommParticipantUser(updatedCommParticipantUser);
    //     } else {
    //         console.error("New value is not an array.");
    //     }

    //     formik.validateForm();
    // };

    const handleUserRemove = (user) => {
        setSelectedUsers(prevSelectedUsers => {
            const updatedSelectedUsers = prevSelectedUsers.filter(u => u.email !== user?.email);
            setUserCount(updatedSelectedUsers.length);
            return updatedSelectedUsers;
        });
    };

    const userListRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userListRef.current && !userListRef.current.contains(event.target)) {
                setShowUserList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <div className="app-container">

            {shouldShowSidebar && (
                <div className="sidebar" style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e9ecef' }}>
                    {/* Header Section */}
                    <div className="sidebar-header" style={{
                        // padding: '16px 20px 12px',
                        padding: '5px 20px 12px',
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#ffffff'
                    }}>
                        <div className="d-flex align-items-center justify-content-between mb-2">


                        </div>



                        {/* Search Bar */}
                        <div className="search-container" style={{ position: 'relative' }}>
                            {/* Alternative plain input for testing */}
                            <div style={{
                                position: 'relative',
                                backgroundColor: '#f2f2f7',
                                borderRadius: '10px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '12px',
                                paddingRight: '12px',
                                border: '1px solid #d1d1d6'
                            }}>
                                <HiOutlineSearch className="f16" style={{ color: '#8e8e93', marginRight: '8px' }} />
                                <input
                                    id="message-search-input-alt"
                                    type="text"
                                    placeholder="Search"
                                    value={messageSearchInput}
                                    onChange={(e) => {
                                        console.log('Plain input changed:', e.target.value);
                                        setMessageSearchInput(e.target.value);
                                    }}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                        fontSize: '16px',
                                        fontWeight: 400,
                                        color: '#000000',
                                        flex: 1,
                                        padding: '0'
                                    }}
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                                {messageSearchInput && (
                                    <IconButton
                                        onClick={() => setMessageSearchInput('')}
                                        size="small"
                                        style={{ color: '#8e8e93', padding: '2px' }}
                                    >
                                        <HiOutlineX className="f14" />
                                    </IconButton>
                                )}
                            </div>

                            {/* Original Material-UI TextField (hidden for testing) */}
                            <div style={{ display: 'none' }}>
                                <TextField
                                    id="message-search-input"
                                    placeholder="Search"
                                    size='small'
                                    className='w-100'
                                    value={messageSearchInput}
                                    onChange={(e) => {
                                        console.log('Search input changed:', e.target.value);
                                        setMessageSearchInput(e.target.value);
                                    }}
                                    autoComplete="off"
                                    spellCheck="false"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <HiOutlineSearch className="f16" style={{ color: '#8e8e93' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: messageSearchInput && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setMessageSearchInput('')}
                                                        size="small"
                                                        edge="end"
                                                        style={{ color: '#8e8e93' }}
                                                    >
                                                        <HiOutlineX className="f14" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            fontSize: '16px',
                                            fontWeight: 400,
                                            borderRadius: '10px',
                                            backgroundColor: '#f2f2f7',
                                            border: 'none',
                                            height: '36px',
                                            '& fieldset': {
                                                border: 'none',
                                            },
                                            '&:hover fieldset': {
                                                border: 'none',
                                            },
                                            '&.Mui-focused fieldset': {
                                                border: 'none',
                                                backgroundColor: '#e5e5ea',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            display: 'none'
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            padding: '8px 12px 8px 0',
                                            color: '#000000',
                                            backgroundColor: 'transparent',
                                            '&::placeholder': {
                                                color: '#8e8e93',
                                                opacity: 1
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="sidebar-content" style={{
                        height: 'calc(100vh - 120px)',
                        overflowY: 'auto',
                        paddingBottom: '16px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        <style>
                            {`.sidebar-content::-webkit-scrollbar { display: none; }`}
                        </style>
                        {filteredMessages?.length > 0 ? (
                            filteredMessages.map((message) => {
                                
                                console.log('Rendering message with id:', message.id, 'commId:', message.commDetails[0]?.commId);
                                const commDetail = message.commDetails[0];

                                const userName = commDetail?.createdByName || 'Unknown';
                                const queryText = (commDetail?.queryText?.replace(/<\/?[^>]+(>|$)/g, "") || '').substring(0, 60);

                                const eventType = message.eventType || '';
                                const eventId = message.eventId ? String(message.eventId) : '';
                                const eventCode = message.eventCode || '';
                                const createdOn = new Date(message.createdOn);

                                const hours = createdOn.getHours().toString().padStart(2, '0');
                                const minutes = createdOn.getMinutes().toString().padStart(2, '0');
                                const timeString = `${hours}:${minutes}`;

                                const formattedTime = formatDateViaTime(message.createdOn, "en-GB", formattimeoption);

                                return (
                                    <div
                                        key={message.id}
                                        className="message-item"
                                        onClick={() => handleMessageClick(message.id)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #e0e0e0',
                                            transition: 'background-color 0.2s ease',
                                            backgroundColor: selectedMessageId === message.id ? '#e3f2fd' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedMessageId !== message.id) {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedMessageId !== message.id) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="message-avatar me-2"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#1976d2',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#ffffff',
                                                        fontSize: '12px',
                                                        fontWeight: '400',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {getInitials(userName)}
                                                </div>

                                                <div className="message-title" style={{
                                                    fontSize: '12px',
                                                    fontWeight: '400',
                                                    color: '#000000',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {(messageSearchInput.trim() || debouncedSearchTerm) ?
                                                        highlightSearchTerm(userName, messageSearchInput.trim() || debouncedSearchTerm) :
                                                        userName}
                                                </div>
                                            </div>

                                            <div className="message-time" style={{
                                                fontSize: '12px',
                                                color: '#8e8e93',
                                                flexShrink: 0
                                            }}>
                                                {timeString}
                                            </div>
                                        </div>

                                        <div className="message-preview" style={{
                                            fontSize: '11px',
                                            color: '#8e8e93',
                                            lineHeight: '1.3',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            marginLeft: '48px',
                                            marginBottom: '4px'
                                        }}>
                                            {(messageSearchInput.trim() || debouncedSearchTerm) ?
                                                highlightSearchTerm(queryText, messageSearchInput.trim() || debouncedSearchTerm) :
                                                queryText}
                                        </div>

                                        <div className="message-event" style={{
                                            fontSize: '12px',
                                            color: '#007aff',
                                            marginLeft: '48px' 
                                        }}>
                                           
                                            {selectedEventCode ? (
                                                <span>
                                                    <span className='f11' style={{ color: "gray", fontWeight: "700" }}>Event Code:</span>
                                                    {(messageSearchInput.trim() || debouncedSearchTerm) ?
                                                        highlightSearchTerm(selectedEventCode, messageSearchInput.trim() || debouncedSearchTerm) :
                                                        selectedEventCode}
                                                </span>
                                            ) : (
                                                <span>
                                                    {(messageSearchInput.trim() || debouncedSearchTerm) ?
                                                        highlightSearchTerm(eventType, messageSearchInput.trim() || debouncedSearchTerm) :
                                                        eventType}
                                                    {eventId && (
                                                        <span className='ms-1'>
                                                            | {(messageSearchInput.trim() || debouncedSearchTerm) ?
                                                                highlightSearchTerm(eventId, messageSearchInput.trim() || debouncedSearchTerm) :
                                                                eventId}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="d-flex align-items-center justify-content-center" style={{
                                height: '300px',
                                padding: '20px'
                            }}>
                                <div className="text-center">
                                    <div style={{
                                        fontSize: '48px',
                                        color: '#e0e0e0',
                                        marginBottom: '16px'
                                    }}>
                                        �
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: '#9e9e9e',
                                        marginBottom: '8px'
                                    }}>
                                        {(messageSearchInput.trim() || debouncedSearchTerm.trim()) ? 'No messages found' : 'No conversations yet'}
                                    </div>
                                    {(messageSearchInput.trim() || debouncedSearchTerm.trim()) ? (
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#bdbdbd'
                                        }}>
                                            Try different keywords
                                        </div>
                                    ) : (
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#bdbdbd'
                                        }}>
                                            Start a conversation to see messages here
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                    </div>

                </div>
            )}

            <div className={shouldShowSidebar ? "main-content" : "main-content-change"}>
                <div className="main-header" style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div className="d-flex align-items-center">
                        {shouldShowSidebar && selectedMessage && (
                            <div>
                                <div className="conversation-title" style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: '#212529',
                                    lineHeight: '1.2'
                                }}>
                                    {rfqTitle}
                                </div>
                                {/* <div className="conversation-subtitle" style={{ 
                                    fontSize: '12px',
                                    color: '#6c757d',
                                    lineHeight: '1.2'
                                }}>
                                    {selectedMessage?.commParticipantUser?.length || 0} participants
                                </div> */}
                            </div>
                        )}
                        {!isSidebarVisible && (
                            <div className="page-heading" style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#212529'
                            }}>
                                Messages
                            </div>
                        )}
                    </div>

                    {/* <div className="header-actions d-flex align-items-center">
                        <Tooltip
                            title={isMuted ? 'Mail notification deactivated' : 'Mail notification activated'}
                            arrow
                        >
                            <IconButton
                                onClick={handleMuteClick}
                                style={{
                                    color: '#6c757d',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '6px',
                                    padding: '6px'
                                }}
                                size="small"
                            >
                                {isMuted ? (
                                    <NotificationsActiveIcon className="f14" />
                                ) : (
                                    <NotificationsOffIcon className="f14" />
                                )}
                            </IconButton>
                        </Tooltip>
                    </div> */}
                </div>
                <div className='messages-new' style={{
                    padding: '16px 20px',
                    overflowY: 'auto',
                    height: 'calc(100vh - 200px)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    <style>
                        {`.messages-new::-webkit-scrollbar { display: none; }`}
                    </style>

                    {selectedMessage ? (
                        Notificationlist?.filter(message => message.id === selectedMessageId).map((message) => {
                            const isIncoming = message.userEmail === userDetail.email;

                            const attachments = message.commAttachment;

                            const renderAttachments = () => {
                                if (attachments && attachments.length > 0) {
                                    return (
                                        <div className='row'>
                                            {attachments.map((attachment) => (
                                                <div className='col-md-4 mb-1'>
                                                    <div className="message-attachment d-flex" key={attachment.id}>
                                                        <div className="col-md-10">
                                                            <div className="attachFile text-truncate">{attachment.commFileName}</div>
                                                        </div>
                                                        <div className="col-md-2 d-flex justify-content-end">
                                                            <HiOutlineDownload
                                                                onClick={() => handleDownloadFile(
                                                                    attachment.commFolderName,
                                                                    attachment.commFileName,
                                                                    atoken
                                                                )}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    );
                                } else {
                                    return <div></div>;
                                }
                            };
                            const formattedTime = formatDateViaTime(message.createdOn, "en-GB", formattimeoption);

                        })
                    ) : (
                        <div className="no-chat-message center-message">
                            Hey, select a chat to start messaging!
                        </div>
                    )}



                    {chatData && chatData?.length > 0 && chatData?.map((message) => {
                        // Fix: Current user's messages should be on the RIGHT (outgoing), others on LEFT (incoming)
                        const isCurrentUser = message?.createdByName === userDetail?.name || message.userEmail === userDetail?.email;
                        const formattedTime = formatDateViaTime(message.createdOn, "en-GB", formattimeoption);
                        const attachments = message.commAttachment;

                        const renderAttachments = () => {
                            if (attachments && attachments.length > 0) {
                                return (
                                    <div style={{ marginTop: '10px' }}>
                                        {attachments.map((attachment) => (
                                            <div key={attachment.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: '#e8f5e8',
                                                borderRadius: '10px',
                                                padding: '8px 10px',
                                                marginBottom: '6px',
                                                border: '1px solid #c8e6c9',
                                                boxShadow: '0 1px 3px rgba(76, 175, 80, 0.1)',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#4caf50',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '10px',
                                                    flexShrink: 0,
                                                    boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)'
                                                }}>
                                                    <HiPaperClip style={{
                                                        fontSize: '14px',
                                                        color: '#ffffff'
                                                    }} />
                                                </div>
                                                <div style={{
                                                    flex: 1,
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    color: '#2e7d32',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {attachment.commFileName}
                                                </div>
                                                <div
                                                    onClick={() => handleDownloadFile(
                                                        attachment.commFolderName,
                                                        attachment.commFileName,
                                                        atoken
                                                    )}
                                                    style={{
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        color: '#4caf50',
                                                        marginLeft: '10px',
                                                        flexShrink: 0,
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                                                        e.target.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = 'transparent';
                                                        e.target.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    <HiOutlineDownload />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            } else {
                                return null;
                            }
                        };
                        const fromUser = message?.createdByName;
                        const toUsers = message.commParticipantUser
                            ?.filter(user => user?.userName?.toLowerCase() !== fromUser?.toLowerCase())
                            .map(user => user.userName)
                            .join(', ') || "";

                        // Calculate dynamic width based on message length
                        const messageLength = message.queryText?.replace(/<\/?[^>]+(>|$)/g, "")?.length || 0;
                        const hasAttachments = attachments && attachments.length > 0;

                        // Dynamic width: longer messages get wider containers
                        const getMessageWidth = () => {
                            if (messageLength > 200 || hasAttachments) return '85%';
                            if (messageLength > 100) return '78%';
                            if (messageLength > 50) return '70%';
                            return '60%';
                        };

                        // Telegram-style layout: Current user RIGHT (blue), Others LEFT (grey)
                        return isCurrentUser ? (
                            // Current user's message - RIGHT side with BLUE background
                            <div key={message.id} style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginBottom: '16px',
                                paddingLeft: messageLength > 100 ? '60px' : '100px'
                            }}>
                                <div style={{
                                    maxWidth: getMessageWidth(),
                                    backgroundColor: '#007aff',
                                    color: '#ffffff',
                                    borderRadius: '16px 16px 4px 16px',
                                    padding: '14px 16px',
                                    boxShadow: '0 2px 8px rgba(0,122,255,0.25)',
                                    position: 'relative',
                                    minHeight: 'fit-content',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.4'
                                }}>
                                    {/* Sender info for outgoing messages */}
                                    <div style={{
                                        fontSize: '11px',
                                        opacity: 0.8,
                                        marginBottom: '8px',
                                        fontWeight: '500'
                                    }}>
                                        To: {toUsers || 'All'}
                                    </div>

                                    {/* Message content */}
                                    <div style={{
                                        fontSize: '15px',
                                        lineHeight: '1.5',
                                        marginBottom: attachments?.length > 0 ? '4px' : '10px',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {message.queryText?.replace(/<\/?[^>]+(>|$)/g, "")}
                                    </div>

                                    {/* Attachments */}
                                    {renderAttachments()}

                                    {/* Timestamp */}
                                    <div style={{
                                        fontSize: '10px',
                                        opacity: 0.7,
                                        marginTop: '10px',
                                        textAlign: 'right',
                                        fontWeight: '400'
                                    }}>
                                        {formattedTime}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Other user's message - LEFT side with GREY background
                            <div key={message.id} style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                marginBottom: '16px',
                                paddingRight: messageLength > 100 ? '60px' : '100px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: getMessageWidth() }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: '#1976d2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}>
                                        {getInitials(fromUser)}
                                    </div>

                                    {/* Message bubble */}
                                    <div style={{ flex: 1 }}>
                                        {/* Sender name */}
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#1976d2',
                                            marginBottom: '4px',
                                            fontWeight: '600'
                                        }}>
                                            {fromUser}
                                        </div>

                                        {/* Message container */}
                                        <div style={{
                                            backgroundColor: '#f5f5f5',
                                            color: '#333333',
                                            borderRadius: '4px 16px 16px 16px',
                                            padding: '14px 16px',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                                            position: 'relative',
                                            border: '1px solid #e8e8e8',
                                            wordBreak: 'break-word',
                                            lineHeight: '1.4'
                                        }}>
                                            {/* Recipient info for incoming messages */}
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#666666',
                                                marginBottom: '8px',
                                                fontWeight: '500'
                                            }}>
                                                To: {toUsers || 'All'}
                                            </div>

                                            {/* Message content */}
                                            <div style={{
                                                fontSize: '15px',
                                                lineHeight: '1.5',
                                                marginBottom: attachments?.length > 0 ? '4px' : '10px',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {message.queryText?.replace(/<\/?[^>]+(>|$)/g, "")}
                                            </div>

                                            {/* Attachments */}
                                            {renderAttachments()}

                                            {/* Timestamp */}
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#888888',
                                                marginTop: '10px',
                                                textAlign: 'left',
                                                fontWeight: '400'
                                            }}>
                                                {formattedTime}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>




                <div className="message-input" style={{ position: 'relative' }}>
                    {selectedMessage ? (
                        <div>
                            <div>
                                <div style={{ position: 'relative' }}>
                                    {showUserList && (
                                        <div className="user-list" style={{
                                            position: 'absolute',
                                            bottom: '100%',
                                            left: '0',
                                            right: '0',
                                            zIndex: 1000,
                                            marginBottom: '8px'
                                        }}>
                                            {loading ? (
                                                <div style={{
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '12px',
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}>
                                                    <div style={{ fontSize: '14px', color: '#666666' }}>Loading...</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {showUserList && (
                                                        <div className='users-list-group' ref={userListRef} style={{
                                                            maxHeight: '280px',
                                                            overflowY: 'auto',
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '12px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            scrollbarWidth: 'thin',
                                                            scrollbarColor: '#e0e0e0 transparent'
                                                        }}>
                                                            <div style={{
                                                                padding: '16px 16px 12px',
                                                                borderBottom: '1px solid #f0f0f0',
                                                                backgroundColor: '#fafafa'
                                                            }}>
                                                                <div style={{
                                                                    position: 'relative',
                                                                    backgroundColor: '#f8f9fa',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e9ecef'
                                                                }}>
                                                                    <HiOutlineSearch
                                                                        className="f14"
                                                                        style={{
                                                                            position: 'absolute',
                                                                            left: '12px',
                                                                            top: '50%',
                                                                            transform: 'translateY(-50%)',
                                                                            color: '#6c757d'
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search users..."
                                                                        value={searchInput}
                                                                        onChange={(e) => setSearchInput(e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            border: 'none',
                                                                            outline: 'none',
                                                                            backgroundColor: 'transparent',
                                                                            padding: '10px 12px 10px 36px',
                                                                            fontSize: '14px',
                                                                            fontWeight: 400,
                                                                            color: '#333333'
                                                                        }}
                                                                        autoComplete="off"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div style={{ padding: '8px 0' }}>
                                                                {filteredUserList?.length > 0 ? (
                                                                    filteredUserList.map((user) => (
                                                                        <div
                                                                            key={user.id}
                                                                            onClick={() => handleUserSelect(user)}
                                                                            className="d-flex align-items-center"
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                                padding: '12px 16px',
                                                                                margin: '0 8px',
                                                                                borderRadius: '8px',
                                                                                marginBottom: '2px',
                                                                                fontSize: '14px',
                                                                                fontWeight: 400,
                                                                                transition: 'background-color 0.2s ease',
                                                                                backgroundColor: 'transparent'
                                                                            }}
                                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                                        >
                                                                            <div
                                                                                className="user-circle me-3"
                                                                                style={{
                                                                                    width: '32px',
                                                                                    height: '32px',
                                                                                    borderRadius: '50%',
                                                                                    backgroundColor: '#007aff',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: '600',
                                                                                    color: '#ffffff',
                                                                                    flexShrink: 0
                                                                                }}
                                                                            >
                                                                                {getInitials(user?.name)}
                                                                            </div>
                                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                                <div style={{
                                                                                    fontSize: '14px',
                                                                                    fontWeight: '500',
                                                                                    color: '#333333',
                                                                                    marginBottom: '2px',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {user.name || user.email}
                                                                                </div>
                                                                                {user.name && (
                                                                                    <div style={{
                                                                                        fontSize: '12px',
                                                                                        color: '#666666',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }}>
                                                                                        {user.email}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div style={{
                                                                        fontSize: '14px',
                                                                        color: '#999999',
                                                                        textAlign: 'center',
                                                                        padding: '20px',
                                                                        fontStyle: 'italic'
                                                                    }}>
                                                                        No users found
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                            <div
                                className='message-set'
                                tabIndex={0}
                                onKeyDown={handleKeyDown}
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#fafafa',
                                    borderTop: '1px solid #e0e0e0',
                                    display: 'none' // Hide this section as we show users in input area now
                                }}
                            >
                                {selectedUsers.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            color: '#666666',
                                            marginBottom: '8px'
                                        }}>
                                            Recipients ({selectedUsers.length})
                                        </div>
                                        <div className='message-set-new' ref={carouselRef} style={{
                                            overflowX: 'auto',
                                            whiteSpace: 'nowrap',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}>
                                            <style>
                                                {`.message-set-new::-webkit-scrollbar { display: none; }`}
                                            </style>
                                            <div className='tags-new-container' style={{
                                                display: 'flex',
                                                flexWrap: 'nowrap',
                                                gap: '8px',
                                                paddingBottom: '4px'
                                            }}>
                                                {selectedUsers.map(user => (
                                                    <div key={user.email} className="userRowNew d-flex align-items-center" style={{
                                                        borderRadius: '18px',
                                                        padding: '6px 12px',
                                                        backgroundColor: '#007aff',
                                                        border: 'none',
                                                        minWidth: 'fit-content',
                                                        whiteSpace: 'nowrap',
                                                        boxShadow: '0 2px 4px rgba(0,122,255,0.2)'
                                                    }}>
                                                        <div className="userNameNew d-flex align-items-center">
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                color: '#ffffff',
                                                                marginRight: '6px'
                                                            }}>
                                                                {user.name || user.email}
                                                            </div>
                                                            <IconButton
                                                                className="m-0 p-0"
                                                                size="small"
                                                                edge="end"
                                                                onClick={() => handleUserRemove(user)}
                                                                style={{
                                                                    color: '#ffffff',
                                                                    padding: '2px',
                                                                    minWidth: '16px',
                                                                    width: '16px',
                                                                    height: '16px'
                                                                }}
                                                            >
                                                                <HiOutlineX style={{ fontSize: '12px' }} />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='col-md-12' style={{
                                borderTop: '1px solid #e0e0e0',
                                padding: '12px 16px',
                                backgroundColor: '#ffffff'
                            }}>
                                <div className='row align-items-center g-2'>
                                    {/* Action Icons - Moved to left */}
                                    <div className='col-auto d-flex flex-column align-items-center gap-2' style={{ paddingRight: '8px' }}>
                                        <IconButton
                                            onClick={toggleUserList}
                                            size="small"
                                            style={{
                                                color: showUserList ? '#007aff' : '#6c757d',
                                                backgroundColor: showUserList ? 'rgba(0,122,255,0.1)' : 'transparent',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <HiUserAdd style={{ fontSize: '18px' }} />
                                        </IconButton>

                                        <IconButton
                                            onClick={handleAttachmentClick}
                                            size="small"
                                            style={{
                                                color: '#6c757d',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            <HiPaperClip style={{ fontSize: '18px' }} />
                                        </IconButton>
                                    </div>

                                    {/* Message Input - Centered */}
                                    <div className='col d-flex justify-content-center'>
                                        <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                                            {/* Selected Users/Attachments Preview Above Input */}
                                            {(selectedUsers.length > 0 || (filesName && filesName.length > 0)) && (
                                                <div style={{
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #e9ecef',
                                                    borderBottom: 'none',
                                                    borderRadius: '12px 12px 0 0',
                                                    padding: '8px 12px',
                                                    fontSize: '13px',
                                                    color: '#495057',
                                                    lineHeight: '1.4',
                                                    position: 'relative'
                                                }}>
                                                    {/* Clear All Button */}
                                                    <IconButton
                                                        onClick={() => {
                                                            setSelectedUsers([]);
                                                            setFilesName([]);
                                                            setcommFolderName("");
                                                            setcommFileName("");
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = "";
                                                            }
                                                        }}
                                                        size="small"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            padding: '2px',
                                                            color: '#6c757d'
                                                        }}
                                                    >
                                                        <HiOutlineX style={{ fontSize: '14px' }} />
                                                    </IconButton>

                                                    {selectedUsers.length > 0 && (
                                                        <div style={{ marginBottom: filesName?.length > 0 ? '4px' : '0' }}>
                                                            <span style={{ fontWeight: '500', color: '#007aff' }}>To: </span>
                                                            {selectedUsers.map((user, index) => (
                                                                <span key={user.email}>
                                                                    <span style={{
                                                                        backgroundColor: '#007aff',
                                                                        color: '#ffffff',
                                                                        padding: '2px 6px 2px 8px',
                                                                        borderRadius: '10px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '500',
                                                                        marginRight: '4px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        {user.name?.split(' ')[0].toLowerCase() || user.email.split('')[0]}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const updatedUsers = selectedUsers.filter(u => u.email !== user.email);
                                                                                setSelectedUsers(updatedUsers);
                                                                            }}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: '#ffffff',
                                                                                cursor: 'pointer',
                                                                                padding: '0',
                                                                                margin: '0',
                                                                                fontSize: '10px',
                                                                                lineHeight: '1',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: '12px',
                                                                                height: '12px',
                                                                                borderRadius: '50%',
                                                                                backgroundColor: 'rgba(255,255,255,0.2)'
                                                                            }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                    {index < selectedUsers.length - 1 && ' '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {filesName && filesName.length > 0 && (
                                                        <div>
                                                            <span style={{ fontWeight: '500', color: '#34c759' }}>📎 </span>
                                                            {filesName.map((file, index) => (
                                                                <span key={index}>
                                                                    <span style={{
                                                                        backgroundColor: '#34c759',
                                                                        color: '#ffffff',
                                                                        padding: '2px 6px 2px 8px',
                                                                        borderRadius: '10px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '500',
                                                                        marginRight: '4px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const updatedFiles = filesName.filter((_, i) => i !== index);
                                                                                setFilesName(updatedFiles);
                                                                                if (updatedFiles.length === 0) {
                                                                                    setcommFolderName("");
                                                                                    setcommFileName("");
                                                                                    if (fileInputRef.current) {
                                                                                        fileInputRef.current.value = "";
                                                                                    }
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: '#ffffff',
                                                                                cursor: 'pointer',
                                                                                padding: '0',
                                                                                margin: '0',
                                                                                fontSize: '10px',
                                                                                lineHeight: '1',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: '12px',
                                                                                height: '12px',
                                                                                borderRadius: '50%',
                                                                                backgroundColor: 'rgba(255,255,255,0.2)'
                                                                            }}
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </span>
                                                                    {index < filesName.length - 1 && ' '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <textarea
                                                rows={1}
                                                className='w-100'
                                                // placeholder={
                                                //     selectedUsers.length > 0 
                                                //         ? `Message to ${selectedUsers.map(u => u.name?.split(' ')[0] || u.email.split('@')[0]).join(', ')}...`
                                                //         : 'Type your message...'
                                                // }
                                                placeholder="Type your message..."
                                                value={queryText}
                                                onChange={handleTextareaChange}
                                                maxLength={4000}
                                                style={{
                                                    border: '1px solid #d1d1d6',
                                                    borderRadius: (selectedUsers.length > 0 || (filesName && filesName.length > 0)) ? '0 0 20px 20px' : '20px',
                                                    borderTop: (selectedUsers.length > 0 || (filesName && filesName.length > 0)) ? 'none' : '1px solid #d1d1d6',
                                                    padding: '12px 50px 12px 16px',
                                                    fontSize: '16px',
                                                    fontWeight: 400,
                                                    resize: 'none',
                                                    outline: 'none',
                                                    fontFamily: 'inherit',
                                                    backgroundColor: '#ffffff',
                                                    minHeight: '44px',
                                                    maxHeight: '120px',
                                                    lineHeight: '20px',
                                                    transition: 'border-color 0.2s ease',
                                                    textAlign: 'left',
                                                    verticalAlign: 'middle'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#007aff';
                                                    if (selectedUsers.length > 0 || (filesName && filesName.length > 0)) {
                                                        e.target.previousElementSibling.style.borderColor = '#007aff';
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#d1d1d6';
                                                    if (selectedUsers.length > 0 || (filesName && filesName.length > 0)) {
                                                        e.target.previousElementSibling.style.borderColor = '#e9ecef';
                                                    }
                                                }}
                                            />

                                            {/* Send Button */}
                                            <IconButton
                                                onClick={formik.handleSubmit}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: '32px',
                                                    height: '32px',
                                                    backgroundColor: '#007aff',
                                                    color: '#ffffff',
                                                    borderRadius: '50%',
                                                    padding: '0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                size="small"
                                            >
                                                <FaPaperPlane style={{ fontSize: '12px' }} />
                                            </IconButton>

                                            {/* Character Count */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-20px',
                                                right: '8px',
                                                fontSize: '11px',
                                                color: '#8e8e93'
                                            }}>
                                                {queryText?.length}/4000
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="file-input"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    multiple
                                />
                            </div>

                            {filesName && filesName.length > 0 && (
                                <div className="message-set" style={{
                                    marginTop: '8px',
                                    padding: '8px 16px',
                                    display: 'none' // Hide this as we show files in input preview now
                                }}>
                                    <div className="message-set-new" style={{
                                        overflowX: 'auto',
                                        whiteSpace: 'nowrap',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none'
                                    }}>
                                        <style>
                                            {`.message-set-new::-webkit-scrollbar { display: none; }`}
                                        </style>
                                        <div className="tags-new-container" ref={carouselRef} style={{ display: 'flex', flexWrap: 'nowrap', gap: '6px' }}>
                                            {filesName.map((file, index) => (
                                                <div className="userRowNew border d-flex align-items-center" key={index} style={{
                                                    borderRadius: '16px',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#34c759',
                                                    border: 'none',
                                                    minWidth: 'fit-content',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <div className="userNameNew fw500 f12" style={{ color: '#ffffff' }}>{file.name}</div>
                                                    <IconButton
                                                        className="m-0 p-0 ms-1"
                                                        onClick={() => handleRemovedFile(index)}
                                                        size="small"
                                                        edge="start"
                                                        style={{ color: '#ffffff', padding: '1px' }}
                                                    >
                                                        <HiOutlineX className="f10" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                            <div className="text-center">
                                <div className="f24 text-muted mb-2">💬</div>
                                <div className="f14 fw500 text-muted">Select a conversation to start messaging</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunicationHub;
