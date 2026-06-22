import { Autocomplete, Box, Button, Checkbox, Chip, Drawer, FormControlLabel, IconButton, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlineChatAlt2, HiOutlineX, HiPaperClip, HiPaperAirplane } from "react-icons/hi";
import { HiHandRaised } from "react-icons/hi2";
import { Form, Modal, ModalHeader, Spinner } from "react-bootstrap";
import { LoadingButton } from "@mui/lab";
import { actionTypes, useStateValue } from "../../../store";
import * as yup from "yup";
import { FindUser } from "../../../utils/users";
import { FindUserList, FindvendorList, GetBIDVendorList, GetRFQVendorList, insertMessage } from "../../../utils/communication";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { uploadFilesOnAzure } from "../../../utils/documentlibrary";
import { AttachFile, Attachment, PersonAdd } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { getExtension, uploadFilesOnAzure2, validateFileSize } from "../../../utils/common";
import { useCalendarState } from "@mui/x-date-pickers/internals";



const RaiseQueryCell = ({ isCollapsed }) => {

	const [{ atoken, rtoken, customerid, userDetail, eventId, eventType, eventCode }, dispatch] = useStateValue();
	const [commFileName, setcommFileName] = useState(null);
	const [toUserId, setToUserId] = useState([]);
	const fileInputRef = useRef(null);
	const [postFileName, setPostFileName] = React.useState("");
	const [commFolderName, setcommFolderName] = useState("");
	const [isEmailActive, setisEmailActive] = useState(false);
	const [loading, setLoading] = useState(false);
	const [state, setState] = useState({
		sidebar: false,
	});
	const toggleDrawer = (anchor, open) => (event) => {
		if (open === false) {
			resetState();
		}
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};

	const resetState = () => {
		setqueryText("");
		setToUserId([]);
		setToGetVendorId([]);
		setcommAttachment([]);
		setCommParticipantUser([]);
		setSelectedUsers([]);
		setSelectedVendors([]);
		setcommFileName("");
		setcommFolderName("");
		setInputValue('');
		setInputValueVendor('');
		setFilteredUserList([]);
		setFilteredVendorList([]);
		setShowUserDropdown(false);
		setShowVendorDropdown(false);
		setFilesName([]);
		setFileList([]);
		setisEmailActive(false);

		// Reset formik values
		formik.resetForm();
		formik.setValues({
			id: 0,
			toVendorId: "",
			fromId: userDetail?.id,
			userName: userDetail?.name,
			userEmail: userDetail?.email,
			customerId: customerid,
			urllink: "",
			vurllink: "",
			queryText: "",
			isRead: false,
			eventId: 0,
			eventType: "",
			userType: "Buyer",
			isEmailActive: false,
			commParticipantUser: [],
			commAttachment: [],
		});

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};
	if (eventId) {

		console.log(`eventId: ${eventId} eventType: ${eventType}`)

	}
	const [show, setShow] = useState(false);
	useEffect(() => {
		if (show)
			pullUsersList();

	}, [show]);

	useEffect(() => {
		if (show)
			pullVendorList();
	}, [eventId, eventType, show]);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [showVendorDropdown, setShowVendorDropdown] = useState(false);

	// Handle click outside to close dropdowns
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
				setShowUserDropdown(false);
				setFilteredUserList([]);
			}
			if (vendorDropdownRef.current && !vendorDropdownRef.current.contains(event.target)) {
				setShowVendorDropdown(false);
				setFilteredVendorList([]);
			}
		};

		if (showUserDropdown || showVendorDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showUserDropdown, showVendorDropdown]);

	const [fileList, setFileList] = React.useState([]);
	const [queryText, setqueryText] = useState("");
	const [commParticipantUser, setCommParticipantUser] = useState([]);
	const [commDetails, setCommDetails] = useState([]);
	const [commAttachment, setcommAttachment] = useState([]);
	const [filesName, setFilesName] = useState([]);

	const [filteredVendorList, setFilteredVendorList] = useState([]);
	const [selectedVendors, setSelectedVendors] = useState([]);
	const [isSending, setIsSending] = useState(false);

	const userDropdownRef = useRef(null);
	const vendorDropdownRef = useRef(null);

	const validationSchema = yup.object({
		queryText: yup
			.string("Enter your Description")
			.required("Please ask your query"),
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
			urllink: "",
			vurllink: "",
			queryText: queryText,
			isRead: false,
			eventId: eventId,
			eventType: eventType,
			userType: "Buyer",

			isEmailActive: isEmailActive,
			commParticipantUser: commParticipantUser,
			commAttachment: commAttachment,
		},
		//validationSchema: validationSchema, // Uncomment if you have a validation schema
		onSubmit: (values) => {

			if (!values.queryText) {

				toast.error("Please ask your query", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				return;
			}
			if (!values.commParticipantUser || values.commParticipantUser.length === 0) {
				toast.error("Please ensure there is at least one participant", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				return;
			}
			setLoading(true);

			// Prepare commDetails based on Formik values
			const commDetails = [
				{
					id: values.id,
					userEmail: values?.userEmail,
					queryText: values?.queryText,
					//commId: values?.commId|| 0,
					eventCode: eventCode ?? "",
					eventId: eventId,
					eventType: eventType,
					userType: "Buyer",
					customerId: values?.customerId,
					createdById: values?.fromId,
					createdByName: values?.userName,
					createdOn: new Date(),
					commParticipantUser: commParticipantUser,
					commAttachment: commAttachment,
				},
			];


			const SaveCommHeader = {
				id: values?.commId ?? 0,
				eventId: values?.eventId,
				eventType: values?.eventType,
				eventCode: eventCode ?? "",
				urllink: values?.urllink,
				vurllink: values?.vurllink,
				isEmailActive: values?.isEmailActive,
				customerId: values?.customerId,
				createdById: values?.fromId,
				createdByName: values?.userName,
				createdOn: new Date(),
				commDetails: commDetails,
				commParticipantUser: values?.commParticipantUser?.map((user) => ({
					id: user?.id,
					userId: user?.userId,
					userName: user?.userName,
					userEmail: user?.userEmail,
					isRead: user?.isRead,
					// DCommId: user?.DCommId,
					// commId:user?.commId,
					// commId: values?.commId,
					isVendorYN: user?.isVendorYN,
					connectionId: user?.connectionId,
					customerId: user?.customerId,
				}))
			};

			// Call the function to submit the form values
			submitFormValues(SaveCommHeader);
		},
	});

	const submitFormValues = (SaveCommHeader) => {

		console.log("Submitted values:", SaveCommHeader);

		setLoading(true);

		// Assuming insertMessage is your API call function
		insertMessage(SaveCommHeader, atoken)
			.then((res) => {
				setLoading(false);
				toast.success("Your query has been successfully raised!", {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 1000,
				});
				resetState(); // Reset all states
				setShow(false); // Close the modal
				dispatch({ type: actionTypes.SET_EVENTID, value: 0 });
				dispatch({ type: actionTypes.SET_EVENTTYPE, value: "" });
			})
			.catch((error) => {
				setLoading(false);
				console.error("Error submitting message:", error);
				toast.error("Failed to send message. Please try again later.");
			});
	};


	//USER FETCH
	const [selectedDcommId, setSelectedDcommId] = useState(null);
	const [filteredUserList, setFilteredUserList] = useState([]);
	const [userList, setUserList] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [inputValue, setInputValue] = useState('');
	const [inputValueVendor, setInputValueVendor] = useState('');
	const pullUsersList = () => {
		const data = { CustomerId: customerid, IsActive: "true" };
		setLoading(true);
		FindUserList(data, atoken).then((res) => {
			if (res && res?.length > 0) {
				const filteredUsers = res.filter(user => user.email !== userDetail.email);

				setUserList(filteredUsers);
				setFilteredUserList(filteredUsers);
				// setUserList(res);
				// setFilteredUserList(res);
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

	//Vendor Fetch
	const [toGetVendorId, setToGetVendorId] = useState([]);
	const [vendorList, setVendorList] = useState([]);
	const pullVendorList = () => {

		const data = { eventId: eventId, eventType: eventType, };
		setLoading(true);
		if (eventId) {
			FindvendorList(data, atoken).then((res) => {
				if (res && res.length > 0) {
					setVendorList(res);
					setFilteredVendorList(res);
				}

			});

		}
		setLoading(false);
	};


	// const pullVendorList = () => {
	// 	
	// 	const data = {};

	// 	if (eventType === 'RFQ') {

	// 	  data.RFQId = eventId; 

	// 	  setLoading(true);
	// 	  GetRFQVendorList(data, atoken)
	// 		.then((res) => {
	// 		  if (res && res.length > 0) {
	// 			setVendorList(res);
	// 			setFilteredVendorList(res);
	// 		  }
	// 		  setLoading(false);
	// 		})
	// 		.catch((error) => {
	// 		  console.error("Error fetching RFQ vendor list:", error);
	// 		  setLoading(false);
	// 		});
	// 	} else if (eventType === 'BID') {
	// 	  data.BidId = eventId;  

	// 	  setLoading(true);
	// 	  GetBIDVendorList(data, atoken)
	// 		.then((res) => {
	// 		  if (res && res.length > 0) {
	// 			setVendorList(res);
	// 			setFilteredVendorList(res);
	// 		  }
	// 		  setLoading(false);
	// 		})
	// 		.catch((error) => {
	// 		  console.error("Error fetching BID vendor list:", error);
	// 		  setLoading(false);
	// 		});
	// 	} else {
	// 	  setLoading(false);  // If the eventType is neither RFQ nor BID, stop loading
	// 	}
	//   };


	const getVendorDefault = (arraylist) => {
		let arrayNew = [];
		if (arraylist?.length > 0) {
			vendorList?.map((data) => {
				arraylist?.map((array) => {
					if (data.id == array.userId) {
						arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};

	// const handleChangeVendor = (event, newValues) => {
	// 	
	// 	if (Array.isArray(newValues)) {
	// 	  // Map vendors to the required structure
	// 	  const updatedVendor = newValues.map((newValue) => ({
	// 		userId: newValue.id,
	// 		userName: newValue.contactPerson,
	// 		userEmail: newValue.email,
	// 		isRead: false,
	// 		commId: 0,
	// 		isVendorYN: "Y", // Set to "Y" for vendors
	// 		linkurl: "",
	// 		customerId: customerid,
	// 	  }));

	// 	  // Combine with existing users if needed (vendors should remain "Y", non-vendors "N")
	// 	  const updatedCommParticipantUser = [
	// 		...commParticipantUser.filter(user => user.isVendorYN === "N"), // Keep non-vendor users
	// 		...updatedVendor, // Add new vendors
	// 	  ];

	// 	  // Map updatedCommParticipantUser into commDetails
	// 	  const updatedCommDetails = commDetails.length > 0 ? commDetails.map(commDetail => ({
	// 		...commDetail,
	// 		commParticipantUser: updatedCommParticipantUser, // Add the updated vendors/users to commParticipantUser
	// 	  })) : [{
	// 		id: 0, // Set commDetails ID as needed
	// 		userEmail: userDetail?.email, 
	// 		queryText: queryText, 
	// 		isRead: false, 
	// 		commId: 0, 
	// 		eventId: eventId, 
	// 		eventType: eventType, 
	// 		userType: "User",
	// 		customerId: customerid, 
	// 		createdById: userDetail?.id,
	// 		createdByName:userDetail?.name, 
	// 		createdOn: new Date().toISOString(), 

	// 		commParticipantUser: updatedCommParticipantUser, // Add the updated commParticipantUser array
	// 		commAttachment: [], // Assuming no attachment for now, this can be modified later
	// 	  }];

	// 	  // Update state with the new commDetails
	// 	  setCommDetails(updatedCommDetails); // Update commDetails state
	// 	  setToGetVendorId(updatedVendor); // Update vendor-related state
	// 	  setCommParticipantUser(updatedCommParticipantUser); // Update commParticipantUser state with new vendors

	// 	} else {
	// 	  console.error("New value is not an array.");
	// 	}

	// 	//formik.validateForm();
	//   };


	const handleChangeVendor = (event, newValues) => {

		if (Array.isArray(newValues)) {
			const updatedVendor = newValues.map((newValue) => ({
				id: 0,
				userId: newValue.userId, // Set to vendorId
				userName: newValue.contactperson, // Set to contactPerson
				userEmail: newValue.emailId,
				isRead: false,
				//	dCommId: selectedDcommId || 0,
				isVendorYN: "Y", // Set to "Y" for vendors
				customerId: customerid,
				connectionId: newValue.connectionId || ""

			}));

			// Combine with existing users if needed
			const updatedCommParticipantUser = [
				...commParticipantUser.filter(user => user.isVendorYN === "N"), // Existing users
				...updatedVendor // New vendors
			];

			setToGetVendorId(updatedVendor);
			setCommParticipantUser(updatedCommParticipantUser);
		} else {
			console.error("New value is not an array.");
		}

		formik.validateForm();
	};
	// const handleChangeUser = (event, newValues) => {
	// 	
	// 	if (Array.isArray(newValues)) {
	// 	  // Map users to the required structure
	// 	  const updatedUser = newValues.map((newValue) => ({
	// 		userId: newValue.id,
	// 		userName: newValue.name || '',
	// 		userEmail: newValue.email || '',
	// 		isRead: false,
	// 		commId: 0,
	// 		isVendorYN: "N", // Default to "N" for users
	// 		linkurl: "",
	// 		customerId: customerid,
	// 	  }));

	// 	  // Combine with existing vendors if needed
	// 	  const updatedCommParticipantUser = [
	// 		...commParticipantUser.filter(user => user.isVendorYN === "Y"), // Keep existing vendors
	// 		...updatedUser, // Add new users
	// 	  ];

	// 	  // Map updatedCommParticipantUser into commDetails
	// 	  const updatedCommDetails = commDetails.length > 0 ? commDetails.map(commDetail => ({
	// 		...commDetail,
	// 		commParticipantUser: updatedCommParticipantUser, // Add the updated users to commParticipantUser
	// 	  })) : [{
	// 		id: 0, // Set commDetails ID as needed
	// 		userEmail: userDetail?.email, 
	// 		queryText: queryText, 
	// 		isRead: false, 
	// 		commId: 0, 
	// 		eventId: eventId, 
	// 		eventType: eventType, 
	// 		userType: "User",
	// 		customerId: customerid, 
	// 		createdById: userDetail?.id,
	// 		createdByName:userDetail?.name, 
	// 		createdOn: new Date().toISOString(), 
	// 		commParticipantUser: updatedCommParticipantUser, 
	// 		commAttachment: [],
	// 	  }];

	// 	  // Update state with the new commDetails
	// 	  setCommDetails(updatedCommDetails); // Update commDetails
	// 	  setToUserId(updatedUser); // Update toUserId state with new users
	// 	  setCommParticipantUser(updatedCommParticipantUser); // Update commParticipantUser state with new users

	// 	} else {
	// 	  console.error("New value is not an array.");
	// 	}

	// 	//formik.validateForm();
	//   };


	const handleChangeUser = (event, newValues) => {
		if (Array.isArray(newValues)) {
			const updatedUser = newValues.map((newValue) => ({
				id: 0,
				userId: newValue?.id,
				userName: newValue?.name || '',
				userEmail: newValue?.email || '',
				isRead: false,
				//dCommId: selectedDcommId || 0,
				isVendorYN: "N",
				customerId: customerid,
				connectionId: newValue?.connectionId || "",
			}));


			const updatedCommParticipantUser = [
				...commParticipantUser.filter(user => user.isVendorYN === "Y"), // Existing vendors
				...updatedUser // New users
			];

			setToUserId(updatedUser);
			setCommParticipantUser(updatedCommParticipantUser);
		} else {
			console.error("New value is not an array.");
		}

		formik.validateForm();
	};
	const handleQueryChange = (e) => {
		const input = e?.target?.value;
		const sanitizedInput = input.replace(/'/g, "");
		setqueryText(sanitizedInput);
	};





	async function handleFileChange(event) {

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
			const foldername = `${customerid}${eventType}${eventId}comm`;

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

				const newAttachment = {
					id: 0,
					dCommId: 0,
					commFolderName: foldername,
					commFileName: fileName,
					customerId: customerid,
				};

				updatedCommAttachment.push(newAttachment);
				updatedFilesName.push({ name: fileName });
				setcommFolderName(foldername);

				// Define the data object for upload
				const data = {
					RequestedBy: "customer",
					EventType: eventType,
					CustomerId: customerid,
					Description: "Comm",
				};

				// Upload the file to Azure and get the return path
				try {

					const filePath = await uploadFilesOnAzure(data, file, atoken);
					newAttachment.commFolderName = filePath; // Update with the returned path
				} catch (error) {
					toast.error(`Error uploading file ${fileName}: ${error.message}`);
					continue; // Move on to the next file
				}
			}

			setcommAttachment((prevAttachments) => [
				...prevAttachments,
				...updatedCommAttachment,
			]);

			setFilesName((prevFilesName) => [...prevFilesName, ...updatedFilesName]);
			setFileList(event.target.files); // Adjust as needed if you want to keep all files
			setFile(null); // Reset or set if needed
		}
	}


	const handleRemoveFile = (indexToRemove) => {
		const updatedFiles = filesName.filter((_, index) => index !== indexToRemove);
		setFilesName(updatedFiles);
		setcommFolderName("");
		setcommFileName("");

		// Check if fileInputRef.current is not null
		if (fileInputRef.current) {
			fileInputRef.current.value = ""; // This is safe now
		}
	};




	const handleClose = () => {
		resetState(); // Reset all states first
		setShow(false);
		dispatch({ type: actionTypes.SET_EVENTID, value: 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "" });
	};

	// const handleShow = () => setShow(true);
	const handleShow = useCallback(() => {

		// if (!show) {

		//   dispatch({
		// 	type: actionTypes.SET_EVENTID,
		// 	value: 0  
		//   });
		//   dispatch({
		// 	type: actionTypes.SET_EVENTTYPE,
		// 	value: ""  
		//   });
		// }

		setShow(!show);
	}, [show]);

	const [file, setFile] = useState(null);
	const fileInputQueryRef = useRef(null);

	const inputRef = useRef(null);

	const handleAttachmentClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		} else {
			console.error('File input reff is not  set');
		}
	};

	const handleFileQueryChange = (event) => {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			setFile(selectedFile);
		}
	};

	const handleFileRemove = () => {
		setFile(null);
		fileInputQueryRef.current.value = '';
	};


	const filterUsers = (value) => {
		if (value === '') {
			// When input is empty, show first 10 users if dropdown should be visible
			if (showUserDropdown && userList.length > 0) {
				setFilteredUserList(userList.slice(0, 10));
			} else {
				setFilteredUserList([]);
			}
		} else {
			const filtered = userList.filter(user =>
				user.email.toLowerCase().includes(value.toLowerCase()) ||
				user.name?.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredUserList(filtered);
		}
	};


	const handleInputChange = (event) => {
		const value = event.target.value;
		setInputValue(value);
		setShowUserDropdown(true);
		filterUsers(value);
	}; const handleUserSelect = (user) => {
		if (!selectedUsers.find(u => u.email === user.email)) {
			const newSelectedUsers = [...selectedUsers, user];
			setSelectedUsers(newSelectedUsers);
			handleChangeUser(null, newSelectedUsers);
		}
		setInputValue('');
		setShowUserDropdown(false);
		setFilteredUserList([]);
	};


	const handleUserRemove = (user) => {
		const newSelectedUsers = selectedUsers?.filter(u => u.email !== user?.email);
		setSelectedUsers(newSelectedUsers);
		handleChangeUser(null, newSelectedUsers);
	};

	const handleInputVendorChange = (event) => {
		const value = event.target.value;
		setInputValueVendor(value);
		setShowVendorDropdown(true);
		filterVendors(value);
	};

	const filterVendors = (value) => {
		if (value === '') {
			// When input is empty, show first 10 vendors if dropdown should be visible
			if (showVendorDropdown && vendorList.length > 0) {
				setFilteredVendorList(vendorList.slice(0, 10));
			} else {
				setFilteredVendorList([]);
			}
		} else {
			const filtered = vendorList.filter(vendor =>
				vendor.emailId?.toLowerCase().includes(value.toLowerCase()) ||
				vendor.contactperson?.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredVendorList(filtered);
		}
	};

	const handleVendorRemove = (vendor) => {
		const newSelectedVendors = selectedVendors.filter(v => v.emailId !== vendor.emailId);
		setSelectedVendors(newSelectedVendors);
		handleChangeVendor(null, newSelectedVendors);
	};

	const handleVendorSelect = (vendor) => {
		if (!selectedVendors.find(v => v.emailId === vendor.emailId)) {
			const newSelectedVendors = [...selectedVendors, vendor];
			setSelectedVendors(newSelectedVendors);
			handleChangeVendor(null, newSelectedVendors);
		}
		setInputValueVendor('');
		setShowVendorDropdown(false);
		setFilteredVendorList([]);
	};



	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			const vendor = vendorList?.find(v =>
				`${v.contactperson} - ${v.emailId}`.toLowerCase() === inputValueVendor.toLowerCase()
			);
			if (vendor && !selectedVendors.find(v => v.emailId === vendor.emailId)) {
				handleVendorSelect(vendor);
			}
		}
	};

	return (
		<>
			<div className="text-center mb-3 ms-1 mt-4">
				<IconButton
					onClick={handleShow}
					sx={{
						'&:hover': {
							backgroundColor: 'transparent'
						}
					}}
				>
					<HiHandRaised style={{ color: "#ffffff" }} className="f14pt" title="Raise Query" />
					{/* Conditionally render the text based on collapsed state */}
					{!isCollapsed && <span className="f14 text-black">Raise Query</span>}
				</IconButton>
			</div>

			<Modal
				size="lg"
				show={show}
				backdrop="static"
				keyboard={false}
				className='zindex10002'
				backdropClassName='zindex10002'
				centered
				contentClassName='border-0 rounded'
				style={{ fontFamily: '"Inter", "Roboto", "Segoe UI", system-ui, -apple-system, sans-serif' }}
				onHide={handleClose}
			>
				<Modal.Header className='py-3 px-4 border-bottom' style={{ backgroundColor: '#ffffff' }}>
					<Modal.Title style={{
						fontSize: '15px',
						fontWeight: 600,
						color: '#1f2937',
						display: 'flex',
						alignItems: 'center',
						gap: '8px'
					}}>
						<HiOutlineChatAlt2 style={{ fontSize: '16px', color: '#2a68d3' }} />
						Raise Query
					</Modal.Title>
					<IconButton
						onClick={handleClose}
						size="small"
						style={{
							color: '#374151',
							padding: '4px'
						}}>
						<HiOutlineX style={{ fontSize: '18px' }} />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					{/* Recipients Section */}
					<div className="px-3 py-2 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
						{/* To Field */}
						<div className="d-flex align-items-center mb-2" style={{ minHeight: '36px' }}>
							<div style={{
								width: '50px',
								fontSize: '14px',
								color: '#495057',
								fontWeight: '500'
							}}>
								User:
							</div>
							<div className="flex-fill" style={{ position: 'relative' }} ref={userDropdownRef}>
								<div style={{
									backgroundColor: '#ffffff',
									border: '1px solid #dee2e6',
									borderRadius: '6px',
									padding: '4px 8px',
									minHeight: '32px',
									display: 'flex',
									flexWrap: 'wrap',
									alignItems: 'center',
									gap: '4px'
								}}>
									{selectedUsers.map(user => (
										<span key={user.email} style={{
											backgroundColor: '#007aff',
											color: '#ffffff',
											borderRadius: '12px',
											padding: '2px 8px',
											fontSize: '12px',
											fontWeight: '500',
											display: 'inline-flex',
											alignItems: 'center',
											gap: '4px'
										}}>
											{user.name || user.email}
											<button
												onClick={() => handleUserRemove(user)}
												style={{
													background: 'none',
													border: 'none',
													color: '#ffffff',
													cursor: 'pointer',
													padding: '0',
													fontSize: '12px',
													marginLeft: '2px'
												}}
											>
												×
											</button>
										</span>
									))}
									<input
										type="text"
										value={inputValue}
										onChange={handleInputChange}
										onFocus={() => {
											setShowUserDropdown(true);
											if (!inputValue && userList.length > 0) {
												setFilteredUserList(userList.slice(0, 10));
											}
										}}
										onBlur={() => {
											// The click outside handler will take care of closing the dropdown
										}}
										placeholder={selectedUsers.length === 0 ? "Type to search users or click to see all..." : ""}
										style={{
											border: 'none',
											outline: 'none',
											backgroundColor: 'transparent',
											fontSize: '14px',
											flex: 1,
											minWidth: '150px',
											color: '#495057'
										}}
									/>
								</div>

								{/* User Dropdown */}
								{showUserDropdown && filteredUserList.length > 0 && (
									<div style={{
										position: 'absolute',
										top: '100%',
										left: '0',
										right: '0',
										zIndex: 1000,
										maxHeight: '200px',
										overflowY: 'auto',
										backgroundColor: '#ffffff',
										border: '1px solid #dee2e6',
										borderRadius: '6px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										marginTop: '2px'
									}}>
										{filteredUserList.map(user => {
											const isSelected = selectedUsers.find(u => u.email === user.email);
											return (
												<div
													key={user.email}
													onClick={(e) => {
														e.stopPropagation();
														handleUserSelect(user);
													}}
													style={{
														cursor: isSelected ? 'not-allowed' : 'pointer',
														padding: '10px 12px',
														borderBottom: '1px solid #f8f9fa',
														fontSize: '14px',
														display: 'flex',
														alignItems: 'center',
														gap: '8px',
														backgroundColor: isSelected ? '#f8f9fa' : '#ffffff',
														opacity: isSelected ? 0.6 : 1
													}}
													onMouseEnter={(e) => {
														if (!isSelected) {
															e.target.style.backgroundColor = '#f8f9fa';
														}
													}}
													onMouseLeave={(e) => {
														if (!isSelected) {
															e.target.style.backgroundColor = '#ffffff';
														}
													}}
												>
													<div style={{
														width: '28px',
														height: '28px',
														borderRadius: '50%',
														backgroundColor: '#007aff',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														color: '#ffffff',
														fontSize: '12px',
														fontWeight: '600'
													}}>
														{user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
													</div>
													<div style={{ flex: 1 }}>
														<div style={{ fontWeight: '500', color: '#212529' }}>
															{user.name || 'No Name'}
														</div>
														<div style={{ fontSize: '12px', color: '#6c757d' }}>
															{user.email}
														</div>
													</div>
													{isSelected && (
														<div style={{ color: '#28a745', fontSize: '12px' }}>
															✓ Selected
														</div>
													)}
												</div>
											);
										})}
										{userList.length > filteredUserList.length && !inputValue && (
											<div style={{
												padding: '8px 12px',
												textAlign: 'center',
												fontSize: '12px',
												color: '#6c757d',
												fontStyle: 'italic'
											}}>
												Type to search more users...
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* CC Field (Vendors) */}
						{(eventType !== 'PR' && eventType !== 'NFA') && (
							// {(eventType !== 'PR' && eventType !== 'QR' && eventType !== 'NFA' && eventType !== 'VI') && (

							<div className="d-flex align-items-center" style={{ minHeight: '36px' }}>
								<div style={{
									width: '50px',
									fontSize: '14px',
									color: '#495057',
									fontWeight: '500'
								}}>
									Vendor:
								</div>
								<div className="flex-fill" style={{ position: 'relative' }} ref={vendorDropdownRef}>
									<div style={{
										backgroundColor: '#ffffff',
										border: '1px solid #dee2e6',
										borderRadius: '6px',
										padding: '4px 8px',
										minHeight: '32px',
										display: 'flex',
										flexWrap: 'wrap',
										alignItems: 'center',
										gap: '4px'
									}}>
										{selectedVendors?.map(vendor => (
											<span key={vendor.emailId} style={{
												backgroundColor: '#28a745',
												color: '#ffffff',
												borderRadius: '12px',
												padding: '2px 8px',
												fontSize: '12px',
												fontWeight: '500',
												display: 'inline-flex',
												alignItems: 'center',
												gap: '4px'
											}}>
												{vendor.contactperson || vendor.emailId}
												<button
													onClick={() => handleVendorRemove(vendor)}
													style={{
														background: 'none',
														border: 'none',
														color: '#ffffff',
														cursor: 'pointer',
														padding: '0',
														fontSize: '12px',
														marginLeft: '2px'
													}}
												>
													×
												</button>
											</span>
										))}
										<input
											type="text"
											value={inputValueVendor}
											onChange={handleInputVendorChange}
											onKeyDown={handleKeyDown}
											onFocus={() => {
												setShowVendorDropdown(true);
												if (!inputValueVendor && vendorList.length > 0) {
													setFilteredVendorList(vendorList.slice(0, 10));
												}
											}}
											onBlur={() => {
												// The click outside handler will take care of closing the dropdown
											}}
											placeholder={selectedVendors?.length === 0 ? "Type to search vendors or click to see all..." : ""}
											style={{
												border: 'none',
												outline: 'none',
												backgroundColor: 'transparent',
												fontSize: '14px',
												flex: 1,
												minWidth: '150px',
												color: '#495057'
											}}
										/>
									</div>

									{/* Vendor Dropdown */}
									{showVendorDropdown && filteredVendorList?.length > 0 && (
										<div style={{
											position: 'absolute',
											top: '100%',
											left: '0',
											right: '0',
											zIndex: 1000,
											maxHeight: '200px',
											overflowY: 'auto',
											backgroundColor: '#ffffff',
											border: '1px solid #dee2e6',
											borderRadius: '6px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
											marginTop: '2px'
										}}>
											{filteredVendorList.map(vendor => {
												const isSelected = selectedVendors?.find(v => v.emailId === vendor.emailId);
												return (
													<div
														key={vendor.emailId}
														onClick={(e) => {
															e.stopPropagation();
															handleVendorSelect(vendor);
														}}
														style={{
															cursor: isSelected ? 'not-allowed' : 'pointer',
															padding: '10px 12px',
															borderBottom: '1px solid #f8f9fa',
															fontSize: '14px',
															display: 'flex',
															alignItems: 'center',
															gap: '8px',
															backgroundColor: isSelected ? '#f8f9fa' : '#ffffff',
															opacity: isSelected ? 0.6 : 1
														}}
														onMouseEnter={(e) => {
															if (!isSelected) {
																e.target.style.backgroundColor = '#f8f9fa';
															}
														}}
														onMouseLeave={(e) => {
															if (!isSelected) {
																e.target.style.backgroundColor = '#ffffff';
															}
														}}
													>
														<div style={{
															width: '28px',
															height: '28px',
															borderRadius: '50%',
															backgroundColor: '#28a745',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															color: '#ffffff',
															fontSize: '12px',
															fontWeight: '600'
														}}>
															{vendor.contactperson?.charAt(0)?.toUpperCase() || vendor.emailId?.charAt(0)?.toUpperCase()}
														</div>
														<div style={{ flex: 1 }}>
															<div style={{ fontWeight: '500', color: '#212529' }}>
																{vendor.contactperson || 'No Contact Person'}
															</div>
															<div style={{ fontSize: '12px', color: '#6c757d' }}>
																{vendor.emailId}
															</div>
														</div>
														{isSelected && (
															<div style={{ color: '#28a745', fontSize: '12px' }}>
																✓ Selected
															</div>
														)}
													</div>
												);
											})}
											{vendorList.length > filteredVendorList.length && !inputValueVendor && (
												<div style={{
													padding: '8px 12px',
													textAlign: 'center',
													fontSize: '12px',
													color: '#6c757d',
													fontStyle: 'italic'
												}}>
													Type to search more vendors...
												</div>
											)}
										</div>
									)}

									{/* No vendors found message */}
									{showVendorDropdown && inputValueVendor && filteredVendorList?.length === 0 && (
										<div style={{
											position: 'absolute',
											top: '100%',
											left: '0',
											right: '0',
											zIndex: 1000,
											backgroundColor: '#ffffff',
											border: '1px solid #dee2e6',
											borderRadius: '6px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
											marginTop: '2px',
											padding: '16px',
											textAlign: 'center',
											color: '#6c757d',
											fontSize: '14px'
										}}>
											<div style={{ marginBottom: '4px' }}>No vendors found</div>
											<div style={{ fontSize: '12px', fontStyle: 'italic' }}>
												Try a different search term
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Message Section */}
					<div className="px-3 py-2">
						<div style={{ position: 'relative' }}>
							<textarea
								rows={6}
								className="w-100"
								placeholder="Type your message here..."
								value={queryText}
								onChange={handleQueryChange}
								maxLength={4000}
								style={{
									resize: 'none',
									border: '1px solid #dee2e6',
									borderRadius: '6px',
									fontSize: '14px',
									fontFamily: 'inherit',
									lineHeight: '1.5',
									backgroundColor: '#ffffff',
									padding: '12px',
									paddingBottom: filesName && filesName.length > 0 ? '80px' : '40px',
									outline: 'none'
								}}
								onFocus={(e) => e.target.style.borderColor = '#007aff'}
								onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
							/>

							{/* Attachments inside message box */}
							{filesName && filesName.length > 0 && (
								<div style={{
									position: 'absolute',
									bottom: '30px',
									left: '12px',
									right: '12px',
									display: 'flex',
									flexWrap: 'wrap',
									gap: '6px',
									maxHeight: '60px',
									overflowY: 'auto'
								}}>
									{filesName.map((file, indexfile) => (
										<div
											key={indexfile}
											style={{
												backgroundColor: '#e3f2fd',
												border: '1px solid #bbdefb',
												borderRadius: '16px',
												padding: '4px 8px',
												display: 'flex',
												alignItems: 'center',
												gap: '4px',
												fontSize: '11px',
												maxWidth: '120px'
											}}
										>
											<HiPaperClip style={{ fontSize: '10px', color: '#1976d2' }} />
											<span style={{
												color: '#1565c0',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												flex: 1
											}}>
												{file.name}
											</span>
											<button
												onClick={() => handleRemoveFile(indexfile)}
												style={{
													background: 'none',
													border: 'none',
													color: '#d32f2f',
													cursor: 'pointer',
													padding: '0',
													fontSize: '12px',
													display: 'flex',
													alignItems: 'center'
												}}
											>
												×
											</button>
										</div>
									))}
								</div>
							)}

							{/* Character counter */}
							<div style={{
								position: 'absolute',
								bottom: '8px',
								right: '12px',
								fontSize: '12px',
								color: '#6c757d'
							}}>
								{queryText?.length}/4000
							</div>
						</div>

						{/* Hidden file input */}
						<input
							type="file"
							ref={fileInputRef}
							className="file-input"
							onChange={handleFileChange}
							style={{ display: 'none' }}
							multiple
						/>
					</div>
				</Modal.Body>
				<Modal.Footer style={{
					backgroundColor: '#ffffff',
					border: 'none',
					borderTop: '1px solid #e5e7eb',
					padding: '12px 16px',
					display: 'flex',
					gap: '12px',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						{/* Attachment button in footer */}
						<button
							onClick={handleAttachmentClick}
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								width: '32px',
								height: '32px',
								backgroundColor: 'transparent',
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								color: '#6c757d',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.target.style.backgroundColor = '#e9ecef';
								e.target.style.color = '#007aff';
							}}
							onMouseLeave={(e) => {
								e.target.style.backgroundColor = 'transparent';
								e.target.style.color = '#6c757d';
							}}
						>
							<HiPaperClip style={{ fontSize: '16px' }} />
						</button>

						<FormControlLabel
							control={
								<Checkbox
									name="isEmailActive"
									id="isEmailActive"
									checked={isEmailActive}
									onChange={(e) => {
										setisEmailActive(e?.target?.checked);
									}}
									size="small"
									style={{ color: '#007aff' }}
								/>
							}
							label={
								<span style={{ fontSize: '13px', color: '#495057' }}>
									Enable Email
								</span>
							}
						/>
					</div>

					<div style={{ display: 'flex', gap: '8px' }}>
						<Button
							variant="outline-secondary"
							onClick={handleClose}
							style={{
								padding: '7px 18px',
								fontSize: '13px',
								fontWeight: '500',
								borderRadius: '8px',
								border: '1px solid #e5e7eb',
								backgroundColor: '#ffffff',
								color: '#374151',
								textTransform: 'none'
							}}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							onClick={formik.handleSubmit}
							disabled={!queryText.trim() || isSending}
							style={{
								padding: '7px 20px',
								fontSize: '13px',
								fontWeight: '500',
								borderRadius: '8px',
								backgroundColor: '#1976d2',
								color: '#ffffff',
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
								textTransform: 'none'
							}}
						>
							{isSending ? (
								<>
									<Spinner size="sm" animation="border" />
									Sending...
								</>
							) : (
								<>
									<HiPaperAirplane style={{ fontSize: '14px' }} />
									Send Query
								</>
							)}
						</Button>
					</div>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default RaiseQueryCell;
