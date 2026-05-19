import React, { useEffect, useState, useCallback, useRef } from "react";
import {
	Autocomplete,
	Box,
	Button,
	DialogContentText,
	Drawer,
	IconButton,
	InputAdornment,
	Skeleton,
	Switch,
	Tab,
	Tabs,
	TextField,
	Tooltip,
} from "@mui/material";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../../store";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { SiSubstack } from "react-icons/si";
import { RiMailSendFill } from "react-icons/ri";
import AddCustomer from "./AddCustomer";
import {
	SMTPDetail,
	Subscription,
	UpdateStatusCustomer,
	UpdateSMTP,
	getCustomerList,
	getSingleCustomer,
	UpdateSubscription,
} from "../../../utils/customerSetup";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import { LoadingButton } from "@mui/lab";
import { DateField, DateTimePicker, LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { toast } from "react-toastify";
import {
	formatDateViaTimeZone,
	formatoption,
	getMenuMaster,
} from "../../../utils/common/utility";
import validator from "validator";
import { BackButton } from "../../../utils/common/component";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import useResponsiveColumns from "../../../components/useResponsiveColumns";

const CustomerList = () => {

	//tab related code 
	const [tabvalue, setTabValue] = React.useState(1);
	const handleChangeTab = useCallback((event, newValue) => {

		setTabValue(newValue);

		if (event == 2) {
			pullCustomerList();
		}
	}, []);

	///conatins the filled data of tab 1 of addcustomer drawer
	//const [tab1value, setTab1Value] = useState(null);

	const handleTabs = useCallback(() => {
		setTabValue(1);
	}, []);


	const handleOpenTabs = useCallback(() => {

		setState({ ...state, opensidebar: true });
		//toggleDrawer{("opensidebar", true)}
		setTabValue(1);
		setSelectedCustomerId(0);
	}, []);

	const [page, setPage] = useState(1);

	const [state, setState] = useState({
		opensidebar: false,
	});

	const [stateSubs, setStateSubs] = useState({
		addSubsDrawer: false,
	});

	const [stateSMTP, setStateSMTP] = useState({
		addSMTPDrawer: false,
	});

	const callbackSubs = useCallback((data) => {
		//setStateSubs({ ...stateSubs, ["addSubsDrawer"]: true });
		seteditRecordData(data);
		setSelectedCustomerId(data?.id);
		setsubsdata(data?.subscriptions);
		setState({ ...state, opensidebar: true });
		setTabValue(2)
		clearSubscriptionList()
	}, []);
	
	// const callbackSubscription = useCallback((data) => {
	// 	
	// 	//setStateSubs({ ...stateSubs, ["addSubsDrawer"]: true });
	// 	seteditRecordData(data);
	// 	//setSelectedCustomerId(data?.id);
	// 	setsubsdata(data?.subscriptions);

		
		
	// }, []);
	// const callbackSubscription = useCallback((data) => {
	// 	
	
	// 	seteditRecordData(data);
	// 	setsubsdata(data?.subscriptions);
	
	// 	if (data?.id) {
	// 		prefilledSubscriptionInfo(data);
	// 	} else {
	// 		//setsubsdata(data?.id);
	// 	}
	// }, []);
	const callbackSubscription = useCallback((data) => {
		console.log('Callback Data:', data); // Debugging log
	     
		seteditRecordData(data);
		//setsubsdata(data?.subscriptions || []); // Default to an empty array if subscriptions is undefined
	
		if (data?.id) {
			prefilledSubscriptionInfo(data);
		} else {
			console.warn('No ID in data:', data); // Log a warning if ID is missing
		}
	}, []);
	
	const callbackSMTP = useCallback((data) => {

		setStateSMTP({ ...stateSMTP, ["addSMTPDrawer"]: true });
		seteditRecordData(data);
		if (data?.smtpDetail?.id) {
			prefilledSMTPInfo(data);
		} else {
			setSelectedSMTPId(data?.id);
		}
	}, []);

	const [openDialog, setOpenDialog] = useState(false);
	const [dialogAnchor, setDialogAnchor] = useState("");
	const handleCloseDialog = (proceed) => {
		if (proceed) {
		  setState({ ...state, [dialogAnchor]: false });
		  setStateSubs({ ...stateSubs, [dialogAnchor]: false });
		  setStateSMTP({ ...stateSMTP, [dialogAnchor]: false });
		  seteditRecordData(null);
		  prefilledSMTPInfo([]);
		}
		setOpenDialog(false);
	  };
	// const toggleDrawer = (anchor, open) => (event) => {
	// 	if (anchor === "opensidebar" && !open) {
	// 		if (!editRecordData?.subscriptions || editRecordData.subscriptions.length === 0) {
	// 			if(window.confirm('Please fill subscription details to complete registration process'))
	// 			{
	// 				setState({ ...state, [anchor]: open });
	// 				setStateSubs({ ...stateSubs, [anchor]: open });
	// 				setStateSMTP({ ...stateSMTP, [anchor]: open });
	// 			}	
				
	// 		}
	// 	}
	// 	else {
	// 			if (open == false) {
	// 				seteditRecordData(null);
	// 				prefilledSMTPInfo([]);
	// 			}
	// 			if (
	// 				event.type === "keydown" &&
	// 				(event.key === "Tab" || event.key === "Shift")
	// 			) {
	// 				return;
	// 			}
	// 			setState({ ...state, [anchor]: open });
	// 			setStateSubs({ ...stateSubs, [anchor]: open });
	// 			setStateSMTP({ ...stateSMTP, [anchor]: open });
	// 	}
	// };
	// const toggleDrawer = (anchor, open) => (event) => {
	// 	if (anchor === "opensidebar" && !open) {
	// 	  if (!editRecordData?.subscriptions || editRecordData?.subscriptions?.length === 0) {
	// 		setDialogAnchor(anchor);
	// 		setOpenDialog(true);
	// 		return;
	// 			// 		{
	//  			// 	setState({ ...state, [anchor]: open });
	//  			// 	setStateSubs({ ...stateSubs, [anchor]: open });
	// 			// setStateSMTP({ ...stateSMTP, [anchor]: open });
	//  			// }
	// 	  }
	// 	} else {
	// 	  if (open === false) {
	// 		seteditRecordData(null);
	//  		prefilledSMTPInfo([]);
	// 	  }
	// 	  if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
	// 		return;
	// 	  }
	// 	  setState({ ...state, [anchor]: open });
	// 	  setStateSubs({ ...stateSubs, [anchor]: open });
	// 	  setStateSMTP({ ...stateSMTP, [anchor]: open });
	// 	}
	//   };
	const toggleDrawer = (anchor, open) => (event) => {
	
		if (anchor === "opensidebar" && !open) {
		
		  if (!editRecordData?.subscriptions || editRecordData?.subscriptions?.length === 0) {
			setDialogAnchor(anchor);
			setOpenDialog(true);
			
		  }
		  else{
			setState({ ...state, [anchor]: open });
			setStateSubs({ ...stateSubs, [anchor]: open });
			setStateSMTP({ ...stateSMTP, [anchor]: open });
		  }
		              
		} 
		else {
						if (open == false) {
							seteditRecordData(null);
							prefilledSMTPInfo([]);
						}
						if (
							event.type === "keydown" &&
							(event.key === "Tab" || event.key === "Shift")
						) {
							return;
						}
						setState({ ...state, [anchor]: open });
						setStateSubs({ ...stateSubs, [anchor]: open });
						setStateSMTP({ ...stateSMTP, [anchor]: open });
				}
			};
	  
	
	//const inputDate = new Date();
	//let formattedDate = formatDate(inputDate);
	const [loading, setLoading] = useState(false);
	const [{ atoken, rtoken, customerid }, dispatch] = useStateValue();
	const [editRecordData, seteditRecordData] = useState(null);
	const handleEditrecorddata = useCallback((v) => seteditRecordData(v), []);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [recorddata, setRecorddata] = useState([]);
	const [togleeye, setTogleeye] = useState(true)

	//const [createdOn, setCreatedon] = useState(formattedDate);
	const callbackstep = useCallback(
   
		(data) => {
	
			setState({ ...state, opensidebar: false });
			seteditRecordData(null);
			pullCustomerList();

		},
		[page]
	);

	useEffect(() => {
		pullCustomerList();
	}, [page]);

	useEffect(() => {
		PullSubsModule();
	}, []);

	const callbackedit = useCallback((data) => {

		console.log("data to edit", data);
		seteditRecordData(data);
		setsubsdata(data?.subscriptions);
		setState({ ...state, opensidebar: true });
		setTabValue(1);
		setSelectedCustomerId(data?.id);
		//setSelectedCustomerId(0)
	}, []);

	const UpdateStageStatus = (data, id, atoken) => {
		if (id > 0) {
			console.log(data);
			UpdateStatusCustomer(data, id, atoken).then((res) => {
				pullCustomerList();
			});
		}
	};

	const handleStatus = (rowValue, isActive) => {
		console.log(rowValue);

		if (isActive) {
			isActive = false;
		} else {
			isActive = true;
		}

		rowValue.isActive = isActive;

		UpdateStageStatus(rowValue, rowValue.id, atoken);
	};
	const [subsdata, setsubsdata] = useState([]);

	const pullCustomerList = () => {

		let data = {
			CustomerId: customerid,
		};
		setLoading(true);
		getCustomerList(data, atoken).then((res) => {

			setGridloading(true);
			if (res != "" && res != undefined) {
				
				setRecorddata(res);
				setTotalRecords(res[0]?.totalrecords);
				//setGridloading(false);
				setPageCount(Math.ceil(res[0]?.totalrecords / 15));
			}
			setLoading(false);
			setGridloading(false);
		});
	};

	const [gridloading, setGridloading] = useState(true);
	const columnWidth = useResponsiveColumns();
	const columns = [
		{
			field: "customerName",
			headerName: "Customer Name",
			renderCell: (params) => <div>{params?.formattedValue}</div>,
			width: columnWidth.name,
		},
		{
			field: "customerEmail",
			headerName: "Email",
			width: columnWidth.isActive,
			renderCell: (params) => <div>{params?.formattedValue}</div>,
		},
		{
			field: "contactPersonName",
			headerName: "Person Name",
			width: columnWidth.isActive,
			renderCell: (params) => <div>{params?.formattedValue}</div>,
		},
		{
			field: "phoneNo",
			headerName: "Phone Number",
			width: columnWidth.isActive,
			renderCell: (params) => <div>{params.row.dialingCode} {params?.formattedValue}</div>,
		},
		{
			field: "isActive",
			headerName: "Status",
			width: columnWidth.organisation,
			renderCell: (params) => (
				<Switch
					checked={params.value}
					onChange={() => handleStatus(params.row, params.value)}
					inputProps={{ "aria-label": "controlled" }}
					classes={{
						thumb: "MuiSwitch-thumb",
						switchBase: "MuiSwitch-switchBase",
						checked: "Mui-checked",
					}}
				/>
			),
		},

		{
			field: "action",
			headerName: "Action",
			width: columnWidth.organisation,
			renderCell: (params) => (
				<IconButton
					size="small"
					className="bg-white"
					onClick={() => callbackedit(params?.row)}
				>
					<HiPencilAlt className="f17 text-primary" />
				</IconButton>
			),
		},
		{
			field: "subscribe",
			headerName: "Subscription",
			width: columnWidth.organisation,
			renderCell: (params) => {
				const hasSubscription = params?.row.subscriptions && params?.row.subscriptions.length > 0;
				return (
					<Tooltip title={!hasSubscription ? "Subscribe to register customer" : ""} arrow>
						<span className={hasSubscription ? "" : "row-no-subscription"}>
							<IconButton
								size="small"
								className="bg-white"
								onClick={() => callbackSubs(params?.row)}
							>
								<SiSubstack className="f17 text-primary" />
							</IconButton>
						</span>
					</Tooltip>
				);
			},
		},
	
		// {
		// 	field: "subscribe",
		// 	headerName: "Subscription",
		// 	width: columnWidth.organisation,
		// 	renderCell: (params) => (
		// 		<IconButton
		// 			size="small"
		// 			className="bg-white"
		// 			onClick={() => callbackSubs(params?.row)}
		// 		>
		// 			<SiSubstack className="f17 text-primary" />
		// 		</IconButton>
		// 	),
		// },
		{
			field: "SMTP",
			headerName: "SMTP Detail",
			width: columnWidth.organisation,
			renderCell: (params) => (
				<IconButton
					size="small"
					className="bg-white"
					onClick={() => callbackSMTP(params?.row)}
				>
					<RiMailSendFill className="f17 text-primary" />
				</IconButton>
			),
		},
	];
	const getRowClassName = (params) => {
		return params.row.subscriptions && params.row.subscriptions.length > 0
			? ""
			: "row-no-subscription";
	};
	const getRowId = (row) => {
		return row.id;
	};

	// Customer Subscription
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [noOFUsers, setnoOFUsers] = useState();
	const [noOFEvents, setnoOFEvents] = useState();
	const [value, setValue] = useState();
	const [noOfApprovers, setnoOfApprovers] = useState();
	const [isSubscriptionActive, setisSubscriptionActive] = useState(true);
	const [subscriptionModule, setSubscriptionModule] = useState([]);
	const [subModule, setSubModule] = useState([]);

	const [selectedCustomerId, setSelectedCustomerId] = useState(0);

	const handleCustomerId = (value) => {

		setSelectedCustomerId(value)
	}

	// const validationSchema = yup.object({
	// 	startDate: yup.string().required("Please Enter Start Date"),
	// 	endDate: yup.string().required("Please Enter End Date"),
	// 	noOFUsers: yup.string().required("Please Enter No of User"),
	// 	subscriptionModule: yup.array().min(1, "Please Select at least one module"),
	// });

	// const formikSubscription = useFormik({
	// 	enableReinitialize: true,
	// 	initialValues: {
	// 		startDate: startDate,
	// 		endDate: endDate,
	// 		noOFUsers: noOFUsers,
	// 		noOFEvents: noOFEvents,
	// 		noOfApprovers: noOfApprovers,
	// 		value: value,
	// 		subscriptionModule: subscriptionModule,
	// 		isSubscriptionActive: true,
	// 	},
	// 	validationSchema: validationSchema,
		
	// 	onSubmit: (values) => {
	// 		setLoading(true);
			
	// 		var data = {
	// 			startDate: startDate,
	// 			endDate: endDate,
	// 			noOFUsers: noOFUsers,
	// 			noOFEvents: noOFEvents ?noOFEvents : 0 ,
	// 			noOfApprovers: noOfApprovers ? noOfApprovers : 0,
	// 			value: value ? value : 0,
	// 			subscriptionModule: subscriptionModule,
	// 			isSubscriptionActive: isSubscriptionActive,
	// 		};

	// 		console.log("data", data);
	


	// 		Subscription(data, selectedCustomerId, atoken).then((res) => {

	// 			if (res) {
	// 				setLoading(false);
	// 				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
	// 				dispatch({
	// 					type: actionTypes.SET_MSGALERTDATA,
	// 					value: res?.data?.message,
	// 				});
	// 				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
	// 				callbackstep("add");

	// 				if (res) {
	// 					toast.success("Company registered successfully. Thank you!", {
	// 						 toastId: "Companyregistered"
	// 					});
	// 				} else {
	// 					toast.error("Some Error Occured. Please Contact Administrator", {
	// 						 toastId: "Administrator_Error"
	// 					});
	// 				}
					
	// 				clearSubscriptionList();
	// 				getSingleCustomer(selectedCustomerId, atoken).then((data) => {
	// 					setsubsdata(data?.subscriptions);
	// 				});
	// 				return true;
	// 			}
	// 		});
	// 		// }
	// 	},
	// });

	const validationSchema = yup.object({
		startDate: yup.string().required("Please Enter Start Date"),
		endDate: yup.string().required("Please Enter End Date"),
		noOFUsers: yup.string().required("Please Enter No of User"),
		subscriptionModule: yup.array().min(1, "Please Select at least one module"),
	});
	
	const formikSubscription = useFormik({
		enableReinitialize: true,
		initialValues: {
			id: editRecordData?.id || 0, // Add this line to capture the id
			startDate: startDate,
			endDate: endDate,
			noOFUsers: noOFUsers,
			noOFEvents: noOFEvents,
			noOfApprovers: noOfApprovers,
			value: value,
			subscriptionModule: subscriptionModule,
			isSubscriptionActive: true,
		},
		validationSchema: validationSchema,
		
		onSubmit: (values) => {
			setLoading(true);
	
			const data = {
				id: values.id, // Include the id in the data
				startDate: values.startDate,
				endDate: values.endDate,
				noOFUsers: values.noOFUsers,
				noOFEvents: values.noOFEvents || 0,
				noOfApprovers: values.noOfApprovers || 0,
				value: values.value || 0,
				subscriptionModule: values.subscriptionModule,
				isSubscriptionActive: values.isSubscriptionActive,
			};
	
			console.log("data", data);
	       
			if (subsdata && subsdata[0]?.id > 0) {
				// Update subscription
				const subscriptionid=subsdata[0]?.id
				UpdateSubscription(data,selectedCustomerId, subscriptionid, atoken).then((res) => {
					setLoading(false);
					if (res) {
						dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
						dispatch({
							type: actionTypes.SET_MSGALERTDATA,
							value: res?.data?.message,
						});
						dispatch({ type: actionTypes.SET_MSGALERT, value: true });
						callbackstep("update");
	
						toast.success("Subscription updated successfully!", {
							toastId: "Subscription_updated"
						});
	
						clearSubscriptionList();
						getSingleCustomer(selectedCustomerId, atoken).then((data) => {
							setsubsdata(data?.subscriptions);
						});
					} else {
						toast.error("Some Error Occurred. Please Contact Administrator", {
							toastId: "Administrator_Error"
						});
					}
				});
			} else {
				
				// Handle adding new subscription if needed
				Subscription(data, selectedCustomerId, atoken).then((res) => {
					setLoading(false);
					if (res) {
						dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
						dispatch({
							type: actionTypes.SET_MSGALERTDATA,
							value: res?.data?.message,
						});
						dispatch({ type: actionTypes.SET_MSGALERT, value: true });
						callbackstep("add");
	
						toast.success("Subscription added successfully!", {
							toastId: "Subscription_added"
						});
	
						clearSubscriptionList();
						getSingleCustomer(selectedCustomerId, atoken).then((data) => {
							setsubsdata(data?.subscriptions);
						});
					} else {
						toast.error("Some Error Occurred. Please Contact Administrator", {
							toastId: "Administrator_Error"
						});
					}
				});
			}
		},
	});
	
	const columnsSubscription = [
		{
			field: "startDate",
			headerName: "Subscription Start Date",
			flex: 2,
			renderCell: (params) => (
				<div className="textLigblue">
					{params?.formattedValue
						? formatDateViaTimeZone(
							params?.formattedValue,
							"en-GB",
							formatoption
						)
						: "NA"}
				</div>
			),
		},
		{
			field: "endDate",
			headerName: "Subscription End Date",
			flex: 2,
			renderCell: (params) => (
				<div className="textLigblue">
					{params?.formattedValue
						? formatDateViaTimeZone(
							params?.formattedValue,
							"en-GB",
							formatoption
						)
						: "NA"}
				</div>
			),
		},
		{ field: "noOFUsers", headerName: "license Users", flex: 2 },
		{
			field: "subscriptionModule",
			headerName: "Subscribed Module",
			flex: 3,
			renderCell: (params) => (
				<div className="textLigblue" title={params}>
					{params.value.map((module, index) => (
						<Tooltip title={module.moduleName}>
							<span key={index}>
								{index > 0 ? ", " : ""}
								{module.moduleName}
							</span>
						</Tooltip>
					))}
				</div>
			),
		},
		{
			field: "action",
			headerName: "Action",
			flex: 1,
			renderCell: (params) => (
				<IconButton
					size="small"
					className="bg-white"
					onClick={() => callbackSubscription(params?.row)}
				>
					<HiPencilAlt className="f17 text-primary" />
				</IconButton>
			),
		},
	];

	const getRowIdForSubs = (row) => {
		return row?.id;
	};
	const resetSD = useRef(null);

	const clearSubscriptionList = () => {
		setStartDate(null);
		setEndDate(null)
		setnoOFUsers("");
		setnoOfApprovers("");
		setValue("");
		setnoOFEvents("");
		setSubModule([]);
		setisSubscriptionActive(false);
	};

	const [subslist, setsubsList] = useState([]);

	const PullSubsModule = () => {
		var data = {
			MenuType: "Event",
		};

		getMenuMaster(data, atoken).then((res) => {
			setsubsList(res);
		});
	};

	const handleChangeSubscription = (event, newValues) => {
		
		if (newValues) {
			const updatedSubsModule = newValues?.map((newValue) => ({
				customerId: selectedCustomerId,
				moduleId: newValue.id,
				moduleName: newValue.menuName,
				
			}));
			setSubModule(updatedSubsModule);
			setSubscriptionModule(updatedSubsModule);
		} else {
			console.error("New value is undefined or null.");
		}
	};

	const getSubsModule = (arraylist) => {
		
		let arrayNew = [];
		if (arraylist?.length > 0) {
			subslist?.map((data) => {
				arraylist?.map((array) => {
					if (data.id == array.moduleId) {
						arrayNew.push(data);
					}
				});
			});
		}
		return arrayNew;
	};
	
	
	const handleValueForSubs = (e) => {
		let value = e.target.value;
		value = value.replace(/[^\d.]/g, "");
		const decimalCount = (value.match(/\./g) || [])?.length;
		if (decimalCount > 1) {
			value = value.slice(0, value.lastIndexOf("."));
		}
		if (/^0\d/.test(value)) {
			value = value.slice(1);
		}
		setValue(value);
	};

	const handleApproverForSubs = (e) => {
		let value = e.target.value;
		value = value.replace(/[^\d.]/g, "");
		const decimalCount = (value.match(/\./g) || []).length;
		if (decimalCount > 1) {
			value = value.slice(0, value.lastIndexOf("."));
		}
		if (/^0\d/.test(value)) {
			value = value.slice(1);
		}
		setnoOfApprovers(value);
	};

	const handleUserNumber = (e) => {
		let value = e.target.value;
		value = value.replace(/[^\d.]/g, "");
		const decimalCount = (value.match(/\./g) || []).length;
		if (decimalCount > 1) {
			value = value.slice(0, value.lastIndexOf("."));
		}
		if (/^0\d/.test(value)) {
			value = value.slice(1);
		}
		setnoOFUsers(value);
	};
	const handleEventNumber = (e) => {
		let value = e.target.value;
		value = value.replace(/[^\d.]/g, "");
		const decimalCount = (value.match(/\./g) || []).length;
		if (decimalCount > 1) {
			value = value.slice(0, value.lastIndexOf("."));
		}
		if (/^0\d/.test(value)) {
			value = value.slice(1);
		}
		setnoOFEvents(value);
	};
	// SMTP Details
	const [host, setHost] = useState("");
	const [port, setPort] = useState();
	const [fromEmail, setFromEmail] = useState("");
	const [password, setPassword] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [isValidUrl, setIsValidUrl] = useState(true);
	const [selectedSMTPId, setSelectedSMTPId] = useState(0);

	const validationSchemaSMTP = yup.object({
		host: yup.string().required("Please Enter HostName"),
		port: yup.string().required("Please Enter Port No."),
		fromEmail: yup.string().email().required("Please Enter Email"),
		password: yup.string().required("Please Enter Password"),
		displayName: yup.string().required("Please Enter DisplayName"),
	});

	const formikSMTPDetails = useFormik({
		enableReinitialize: true,
		initialValues: {
			host: editRecordData?.host ? editRecordData?.host : host,
			port: editRecordData?.port ? editRecordData?.port : port,
			fromEmail: editRecordData?.fromEmail
				? editRecordData?.fromEmail
				: fromEmail,
			password: editRecordData?.password ? editRecordData?.password : password,
			displayName: editRecordData?.displayName
				? editRecordData?.displayName
				: displayName,
		},
		validationSchema: validationSchemaSMTP,
		onSubmit: (values) => {
			setLoading(true);
			var data = {
				host: host,
				port: port,
				fromEmail: fromEmail,
				password: password,
				displayName: displayName,
			};

			console.log("data", data);
			if (editRecordData?.smtpDetail?.id > 0) {
				UpdateSMTP(data, editRecordData?.smtpDetail?.id, atoken).then((res) => {
					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					callbackstep("update");
					toast.success("SMTP Updated Successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
						onClose: () => {
							SMTPCloseDrawer();
						}
					});
					clearSMTPList();
					return true;
				});
			} else {
				SMTPDetail(data, selectedSMTPId, atoken).then((res) => {
					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					callbackstep("add");

					toast.success("SMTP Done Successfully!", {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 1000,
						onClose: () => {
							SMTPCloseDrawer();
						}
					});
					clearSMTPList();
					return true;
				});
			}
		},
	});

	// const columnsSMTP = [
	// 	{ field: "host", headerName: "Host", flex: 2 },
	// 	{ field: "port", headerName: "Port", flex: 2 },
	// 	{ field: "fromEmail", headerName: "Email", flex: 2 },
	// 	{ field: "password", headerName: "Password", flex: 2 },
	// 	{ field: "displayName", headerName: "Display Name", flex: 2 },
	// ];

	// const getRowIdForSMTP = (row) => {
	// 	return row?.id;
	// };

	const prefilledSMTPInfo = (data) => {
		if (data) {
			setHost(data?.smtpDetail?.host);
			setPort(data?.smtpDetail?.port);
			setFromEmail(data?.smtpDetail?.fromEmail);
			setPassword(data?.smtpDetail?.password);
			setDisplayName(data?.smtpDetail?.displayName);
		}
	};

	
	const prefilledSubscriptionInfo = (data) => {
		
		if (data) {
			setnoOFUsers(data?.noOFUsers);
			setnoOFEvents(data?.noOFEvents);
			setStartDate(data.startDate ? new Date(data.startDate) : null);
			setnoOfApprovers(data?.noOfApprovers)
			setValue(data?.value);
			setEndDate(data.endDate ? new Date(data.endDate) : null);
			
			const prefilledModules = data.subscriptionModule.map(module => ({
				customerId: selectedCustomerId,
				moduleId: module.moduleId,
				moduleName: module.moduleName
			}));
			console.log('Prefilled Modules:', prefilledModules);
	      
			setSubscriptionModule(prefilledModules);
		    setSubModule(prefilledModules)
			//setSubscriptionModule(data?.subscriptionModule || []); 
		}
	};

	const handlePort = (e) => {
		let value = e.target.value;
		value = value.replace(/[^\d.]/g, "");
		const decimalCount = (value.match(/\./g) || []).length;
		if (decimalCount > 1) {
			value = value.slice(0, value.lastIndexOf("."));
		}
		if (/^0\d/.test(value)) {
			value = value.slice(1);
		}
		setPort(value);
	};

	const handleHostName = (event) => {
		// const { value } = event.target;
		// setHost(value);
		// setIsValidUrl(validator.isURL(value));
		const value = event.target.value;
		setHost(value); // Always update the host state

		// Check if the input value is a valid email address
		//const isValidEmail = validateEmail(value);

		// Set error state based on email validation result
		setIsValidUrl(validator.isURL(value))
	};

	const clearSMTPList = () => {
		setHost("");
		setPort("");
		setFromEmail("");
		setPassword("");
		setDisplayName("");

	};


	const SMTPCloseDrawer = () => {
		seteditRecordData(null);
		setStateSMTP({ ...stateSMTP, ["addSMTPDrawer"]: false });
	};


	const [openDrawer, setOpenDrawer] = useState(false);
	const [confirmClose, setConfirmClose] = useState(false);

	const handleCloseDrawer = () => {
		if (confirmClose) {
			setOpenDrawer(false);
		} else {
			setConfirmClose(true);
		}
	};

	return (
		<>
			<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)' }}>
				{/* Header with BackButton and Action Buttons */}
				<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
					<div className="d-flex align-items-center">
						<BackButton title={<span className="page-heading">Organization Setup</span>} />
					</div>
					
					{/* Action Buttons */}
					<div className="d-flex align-items-center gap-2">
						<Button
							variant="text"
							size="small"
							startIcon={<HiPlusSm />}
							className="text-capitalize blue-text font-normal"
							onClick={handleOpenTabs}
						>
							Add New
						</Button>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-grow-1 overflow-auto">
					<div className="p-3 pt-0">
						{loading ? (
							<GridSkeleton />
						) : (
							<>
								<div style={{ height: '400px', width: '100%' }}>
									<DataGrid
										getRowId={getRowId}
										rows={recorddata}
										loading={loading}
										getRowClassName={getRowClassName}
										columns={columns}
										rowHeight={40}
										columnHeaderHeight={40}
										className="f13 bg-white data-grid-scrollable"
										disableDensitySelector
										disableColumnMenu
										disableColumnSelector
										disableRowSelectionOnClick
										slots={{ toolbar: GridToolbar }}
										slotProps={{
											toolbar: {
												showQuickFilter: true,
											},
										}}
									/>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			<React.Fragment key="top">
				<Drawer
					anchor="right"
					open={state["opensidebar"]}
					onClose={toggleDrawer("opensidebar", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1000 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Customer Setup</div>
									<div>
										<IconButton
											onClick={toggleDrawer("opensidebar", false)}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>
									</div>
								</div>
							</Box>
							<div className="h50px"></div>
							<Box sx={{ flexGrow: 1, p: 2 }}>
								<Box sx={{ width: '100%' }}>
									<Tabs
										value={tabvalue}
										onChange={editRecordData ? handleChangeTab : null}
										textColor="primary"
										className='tabstheme'
										indicatorColor="primary"
										variant="scrollable"
										allowScrollButtonsMobile
									>
										<Tab value={1} label="Customer Setup" />
										<Tab value={2} label="Subscription Setup" />

									</Tabs>
								</Box>
								<hr className="mt-0 mb-1" />
								{tabvalue == 1 ? <>
									<AddCustomer
										callbackstep={callbackstep}
										handleChangeTab={handleChangeTab}
										editRecordData={editRecordData}
										handleCustomerId={handleCustomerId}
										selectedCustomerId={selectedCustomerId}
										handleEditrecorddata={handleEditrecorddata}

									/>
								</> : <><form onSubmit={formikSubscription.handleSubmit} autoComplete="off">
									<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 950 } }}>
										<div className="flex flex-col">
											<div className="h50px"></div>
											<Box sx={{ flexGrow: 1, p: 2 }}>
												<div className="row mt-2">
													{/* <LocalizationProvider dateAdapter={AdapterDateFns}>
														<div className="col-12 col-md-6 mb-3">
															<DateField
																ref={resetSD}
																variant="outlined"
																label="Subscription Start Date *"
																size="small"
																name="startDate"
																id="startDate"
																minDate={new Date()}
																// minTime={new Date()}
																value={startDate}
																className="w-100 f14"
																slotProps={{
																	textField: {
																		variant: "outlined",
																		size: "small",
																		InputLabelProps: { shrink: true },

																		error:
																			formikSubscription.touched.startDate &&
																			Boolean(formikSubscription.errors.startDate),
																		helperText:
																			formikSubscription.touched.startDate &&
																			formikSubscription.errors.startDate,
																	},
																	actionBar: {
																		actions: ["clear", "cancel", "accept"],
																	},
																}}
																onChange={(e) => {
																	setStartDate(e);
																	//formikSubscription.setFieldValue("endDate", null);
																}}
															// disableTime
															// ampm={false}
															/>
														</div>

														<div className="col-12 col-md-6 mb-3">
															<DateTimePicker
																ref={resetSD}
																variant="outlined"
																label="Subscription End Date *"
																size="small"
																name="endDate"
																id="endDate"
																minDate={new Date()}
																// minTime={new Date()}
																value={endDate}
																className="w-100 f14 mb-4"
																slotProps={{
																	textField: {
																		variant: "outlined",
																		size: "small",
																		InputLabelProps: { shrink: true },
																		error:
																			formikSubscription.touched.endDate &&
																			Boolean(formikSubscription.errors.endDate),
																		helperText:
																			formikSubscription.touched.endDate &&
																			formikSubscription.errors.endDate,
																	},
																	actionBar: {
																		actions: ["clear", "cancel", "accept"],
																	},
																}}
																onChange={(e) => {
																	setEndDate(e);
																}}
															// disableTime
															// ampm={false}
															/>
														</div>
													</LocalizationProvider> */}
													<LocalizationProvider
														dateAdapter={AdapterDateFns}
													>
														<div className="col-12 col-md-6 mb-3">
															<MobileDatePicker
																label="Subscription Start Date *"
																ref={resetSD}
																value={startDate}
																onChange={(e) => {
																	setStartDate(e);
																	//formikSubscription.setFieldValue("endDate", null);
																}}
																name="startDate"
																slotProps={{
																	textField: {
																		variant: "outlined",
																		fullWidth: true,
																		size: "small",
																		InputLabelProps: { shrink: true },
																	},
																	actionBar: {
																		actions: ["clear", "cancel", "accept"],
																	},
																}}
																format="dd/MM/yyyy"
																minDate={new Date()}

																renderInput={(params) => (
																	<TextField variant="standard" {...params} />
																)}
															/>
														</div>
														<div className="col-12 col-md-6 mb-3">
															<MobileDatePicker
																label="Subscription End Date *"
																ref={resetSD}
																value={endDate}
																onChange={(e) => {
																	setEndDate(e);
																}}
																name="endDate"
																slotProps={{
																	textField: {
																		variant: "outlined",
																		fullWidth: true,
																		size: "small",
																		InputLabelProps: { shrink: true },
																	},
																	actionBar: {
																		actions: ["clear", "cancel", "accept"],
																	},
																}}
																format="dd/MM/yyyy"
																minDate={new Date()}

																renderInput={(params) => (
																	<TextField variant="standard" {...params} />
																)}
															/>
														</div>
													</LocalizationProvider>

													<div className="col-6 col-md-4 mb-3">
														<TextFieldCell
															id="noOFUsers"
															name="noOFUsers"
															label="license user *"
															placeholder=""
															maxLength={10}
															value={noOFUsers}
															onChange={handleUserNumber}
														// onChange={(e) => {
														// 	setnoOFUsers(e?.target?.value);
														// }}
														/>
														{formikSubscription.errors.noOFUsers &&
															formikSubscription.touched.noOFUsers && (
																<div
																	className="error error-red"
																	style={{ fontSize: "12px" }}
																>
																	{formikSubscription.errors.noOFUsers}
																</div>
															)}
													</div>

													<div className="col-6 col-md-4 mb-3">
														<TextFieldCell
															id="noOfApprovers"
															name="noOfApprovers"
															label="license Approvers"
															maxLength={10}
															value={noOfApprovers}
															onChange={handleApproverForSubs}
														/>
													</div>
													<div className="col-6 col-md-4 mb-3">
														<TextFieldCell
															id="noOFEvents"
															name="noOFEvents"
															label="No.of Events"
															placeholder=""
															maxLength={10}
															value={noOFEvents}
															onChange={handleEventNumber}
														// onChange={(e) => {
														// 	setnoOFUsers(e?.target?.value);
														// }}
														/>
														{/* {formikSubscription.errors.noOFEvents &&
															formikSubscription.touched.noOFEvents && (
																<div
																	className="error error-red"
																	style={{ fontSize: "12px" }}
																>
																	{formikSubscription.errors.noOFEvents}
																</div>
															)} */}
													</div>

													<div className="col-12 col-md-6 mt-3 mb-3">
														<TextFieldCell
															id="value"
															name="value"
															label="Value"
															maxLength={20}
															value={value}
															onChange={handleValueForSubs}
														/>
													</div>
													<div className="col-12 col-md-6 mt-3 mb-3">
														<Autocomplete
															multiple
															id="subscriptionModule"
															name="subscriptionModule"
															//className="f14"
															sx={{ width: "100%" }}
															options={subslist ?? []}
															getOptionLabel={(option) => option.menuName}
															value={getSubsModule(subModule)}
															onChange={handleChangeSubscription}
															filterSelectedOptions
															renderOption={(props, option) => (
																<Box component="li" {...props}>
																	{option.menuName}
																</Box>
															)}
															renderInput={(params, data) => (
																<TextField
																	{...params}
																	variant="outlined"
																	size="small"
																	placeholder=""
																	label="Subscription Module *"
																/>
															)}
														/>
														{formikSubscription.errors.subscriptionModule &&
															formikSubscription.touched.subscriptionModule && (
																<div
																	className="error error-red"
																	style={{ fontSize: "12px" }}
																>
																	{formikSubscription.errors.subscriptionModule}
																</div>
															)}
													</div>
													<div className="text-end mt-3">
														{!loading ? (
															<>
																{/* <Button
																	color="secondary"
																	variant="outlined"
																	size="small"
																	onClick={handleTabs}
																>
																	Back
																</Button> */}

																<span style={{ margin: "0 5px" }}></span>
																<Button
																	color="primary"
																	variant="outlined"
																	size="small"
																	onClick={clearSubscriptionList}
																>
																	Reset
																</Button>

																<span style={{ margin: "0 5px" }}></span>
																<Button
																	color="primary"
																	variant="contained"
																	size="small"
																	type="submit"
																>
																	{editRecordData?.id ? 'Subscribe' : 'Register'}
																</Button>
															</>
														) : (
															<LoadingButton className="" loading variant="contained">
																{editRecordData && editRecordData?.id ? 'Subscribing...' : 'Registering...'}
															</LoadingButton>
														)}
													</div>
												</div>
												<hr className="" />
												<div className="">
													<div className="row">
														<div className="col-12">
															<DataGrid
																getRowIdSubs={getRowIdForSubs}
																rows={subsdata}
																loading={gridloading}
																columns={columnsSubscription}
																autoHeight
																getRowClassName={(params) =>
																	params.indexRelativeToCurrentPage % 2 === 0
																		? "even"
																		: "odd"
																}
																rowHeight={40}
																columnHeaderHeight={40}
																className="f13 bg-white"
																disableRowSelectionOnClick
																slots={{ toolbar: GridToolbar }}
																slotProps={{
																	toolbar: {
																		showQuickFilter: true,
																	},
																}}
															/>
														</div>
													</div>
												</div>
											</Box>
										</div>
									</Box>
								</form></>}
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

			{/* <React.Fragment key="addsubs">
				<Drawer
					anchor="right"
					open={stateSubs["addSubsDrawer"]}
				// onClose={toggleDrawer('addProductDrawer', false)}
				>
					<form onSubmit={formikSubscription.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">Subscription</div>
										<div>
											<IconButton
												onClick={toggleDrawer("addSubsDrawer", false)}
												size="small"
												edge="start"
												sx={{ mr: 1 }}
											>
												<HiOutlineX className="f20 text-white" />
											</IconButton>
										</div>
									</div>
								</Box>
								<div className="h50px"></div>
								<Box sx={{ flexGrow: 1, p: 2 }}>
									<div className="row mt-2">
										<LocalizationProvider dateAdapter={AdapterDateFns}>
											<div className="col-12 col-md-6 mb-3">
												<DateTimePicker
													ref={resetSD}
													variant="outlined"
													label="Subscription Start Date *"
													size="small"
													name="startDate"
													id="startDate"
													minDate={new Date()}
													// minTime={new Date()}
													value={startDate}
													className="w-100 f14"
													slotProps={{
														textField: {
															variant: "outlined",
															size: "small",
															InputLabelProps: { shrink: true },

															error:
																formikSubscription.touched.startDate &&
																Boolean(formikSubscription.errors.startDate),
															helperText:
																formikSubscription.touched.startDate &&
																formikSubscription.errors.startDate,
														},
														actionBar: {
															actions: ["clear", "cancel", "accept"],
														},
													}}
													onChange={(e) => {
														setStartDate(e);
														formikSubscription.setFieldValue("endDate", null);
													}}
												/>
											</div>

											<div className="col-12 col-md-6 mb-3">
												<DateTimePicker
													variant="outlined"
													label="Subscription End Date *"
													size="small"
													name="endDate"
													id="endDate"
													minDate={new Date()}
													// minTime={new Date()}
													value={endDate}
													className="w-100 f14 mb-4"
													slotProps={{
														textField: {
															variant: "outlined",
															size: "small",
															InputLabelProps: { shrink: true },
															error:
																formikSubscription.touched.endDate &&
																Boolean(formikSubscription.errors.endDate),
															helperText:
																formikSubscription.touched.endDate &&
																formikSubscription.errors.endDate,
														},
														actionBar: {
															actions: ["clear", "cancel", "accept"],
														},
													}}
													onChange={(e) => {
														setEndDate(e);
													}}
												/>
											</div>
										</LocalizationProvider>
										<div className="col-12 col-md-6 mb-3">
											<TextFieldCell
												id="noOFUsers"
												name="noOFUsers"
												label="No.of Users *"
												placeholder=""
												maxLength={10}
												value={noOFUsers}
												onChange={handleUserNumber}
											// onChange={(e) => {
											// 	setnoOFUsers(e?.target?.value);
											// }}
											/>
											{formikSubscription.errors.noOFUsers &&
												formikSubscription.touched.noOFUsers && (
													<div
														className="error error-red"
														style={{ fontSize: "12px" }}
													>
														{formikSubscription.errors.noOFUsers}
													</div>
												)}
										</div>

										<div className="col-12 col-md-6 mb-3">
											<TextFieldCell
												id="noOfApprovers"
												name="noOfApprovers"
												label="No.Of Approvers"
												maxLength={10}
												value={noOfApprovers}
												onChange={handleApproverForSubs}
											/>
										</div>

										<div className="col-12 col-md-6 mt-3 mb-3">
											<TextFieldCell
												id="value"
												name="value"
												label="Value"
												maxLength={20}
												value={value}
												onChange={handleValueForSubs}
											/>
										</div>
										<div className="col-12 col-md-6 mt-3 mb-3">
											<Autocomplete
												multiple
												id="subscriptionModule"
												name="subscriptionModule"
												//className="f14"
												sx={{ width: "100%" }}
												options={subslist}
												getOptionLabel={(option) => option.menuName}
												
												onChange={handleChangeSubscription}
												filterSelectedOptions
												renderOption={(props, option) => (
													<Box component="li" {...props}>
														{option.menuName}
													</Box>
												)}
												renderInput={(params, data) => (
													<TextField
														{...params}
														variant="outlined"
														size="small"
														placeholder=""
														label="Subscription Module *"
													/>
												)}
											/>
											{formikSubscription.errors.subscriptionModule &&
												formikSubscription.touched.subscriptionModule && (
													<div
														className="error error-red"
														style={{ fontSize: "12px" }}
													>
														{formikSubscription.errors.subscriptionModule}
													</div>
												)}
										</div>
										<div className="text-end mt-3">
											{!loading ? (
												<>
													<Button
														color="primary"
														variant="outlined"
														size="small"
														onClick={clearSubscriptionList}
													>
														Reset
													</Button>

													<span style={{ margin: "0 5px" }}></span>
													<Button
														color="primary"
														variant="contained"
														size="small"
														type="submit"
													>
														Subscription
													</Button>
												</>
											) : (
												<LoadingButton className="" loading variant="contained">
													Subscribing ...
												</LoadingButton>
											)}
										</div>
									</div>
									<hr className="" />
									<div className="">
										<div className="row">
											<div className="col-12">
												<DataGrid
													getRowIdSubs={getRowIdForSubs}
													rows={subsdata}
													loading={gridloading}
													columns={columnsSubscription}
													autoHeight
													getRowClassName={(params) =>
														params.indexRelativeToCurrentPage % 2 === 0
															? "even"
															: "odd"
													}
													rowHeight={40}
													columnHeaderHeight={40}
													className="f13 border-0"
													disableRowSelectionOnClick
													slots={{ toolbar: GridToolbar }}
													slotProps={{
														toolbar: {
															showQuickFilter: true,
														},
													}}
												/>
											</div>
										</div>
									</div>
								</Box>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment> */}

			<React.Fragment key="addsmtp">
				<Drawer anchor="right" open={stateSMTP["addSMTPDrawer"]}>
					<form onSubmit={formikSMTPDetails.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">SMTP DETAILS</div>
										<div>
											<IconButton
												onClick={toggleDrawer("addSMTPDrawer", false)}
												size="small"
												edge="start"
												sx={{ mr: 1 }}
											>
												<HiOutlineX className="f20 text-white" />
											</IconButton>
										</div>
									</div>
								</Box>
								<div className="h50px"></div>
								<Box sx={{ flexGrow: 1, p: 2 }}>
									<div className="row mt-2">
										<div className="col-12 col-md-12 mb-4">
											<TextFieldCell
												id="host"
												name="host"
												label="Host Name *"
												placeholder=""
												value={host}
												maxLength={100}
												onChange={handleHostName}
											// onChange={(e) => {
											// 	setHost(e?.target?.value);
											// }}
											/>
											{!isValidUrl && (
												<p style={{ color: "red", fontSize: 12 }}>
													Please enter a valid URL.
												</p>
											)}
											{formikSMTPDetails.errors.host &&
												formikSMTPDetails.touched.host && (
													<div
														className="error error-red"
														style={{ fontSize: "9px" }}
													>
														{formikSMTPDetails.errors.host}
													</div>
												)}
										</div>
										<div className="col-12 col-md-12 mb-4">
											<TextFieldCell
												id="port"
												name="port"
												label="Port No.*"
												placeholder=""
												value={port}
												maxLength={10}
												// onChange={(e) => {
												// 	setPort(e?.target?.value);
												// }}
												onChange={handlePort}
											/>
											{formikSMTPDetails.errors.port &&
												formikSMTPDetails.touched.port && (
													<div
														className="error error-red"
														style={{ fontSize: "9px" }}
													>
														{formikSMTPDetails.errors.port}
													</div>
												)}
										</div>

										<div className="col-12 col-md-12 mb-4">
											<TextFieldCell
												id="fromEmail"
												name="fromEmail"
												label="From Email *"
												placeholder=""
												value={fromEmail}
												maxLength={100}
												onChange={(e) => {
													setFromEmail(e?.target?.value);
												}}
											/>
											{formikSMTPDetails.errors.fromEmail &&
												formikSMTPDetails.touched.fromEmail && (
													<div
														className="error error-red"
														style={{ fontSize: "9px" }}
													>
														{formikSMTPDetails.errors.fromEmail}
													</div>
												)}
										</div>
										
										<div className='col-12 col-md-12 mb-4'>
											<TextFieldCell
												id="password"
												name="password"
												label="Password *"
												InputLabelProps={{
													shrink: true,
												}}
												className='w-100 f14'
												size="small"
												type={password && togleeye ? 'password' : 'text'}
												value={password}
												onChange={(e) => {
													setPassword(e?.target?.value);
												}}
												error={formikSMTPDetails.touched.password && Boolean(formikSMTPDetails.errors.password)}
												helperText={formikSMTPDetails.touched.password && formikSMTPDetails.errors.password}
												InputProps={{
													endAdornment: <InputAdornment position="end">
														<IconButton
															size="small"
															onClick={() => setTogleeye(!togleeye)}>
															{togleeye ? <HiOutlineEye /> : <HiOutlineEyeOff />}
														</IconButton>
													</InputAdornment>,
												}}
												variant="outlined" />
										</div>

										<div className="col-12 col-md-12 mb-4">
											<TextFieldCell
												id="displayName"
												name="displayName"
												label="Display Name *"
												placeholder=""
												value={displayName}
												maxLength={100}
												onChange={(e) => {
													setDisplayName(e?.target?.value);
												}}
											/>
											{formikSMTPDetails.errors.displayName &&
												formikSMTPDetails.touched.displayName && (
													<div
														className="error error-red"
														style={{ fontSize: "9px" }}
													>
														{formikSMTPDetails.errors.displayName}
													</div>
												)}
										</div>
										<div className="text-end mt-3">
											{!loading ? (
												<>
													<Button
														color="primary"
														variant="outlined"
														size="small"
														onClick={clearSMTPList}
													>
														Reset
													</Button>

													<span style={{ margin: "0 5px" }}></span>
													<Button
														color="primary"
														variant="contained"
														size="small"
														type="submit"
													>
														ADD
													</Button>
												</>
											) : (
												<LoadingButton className="" loading variant="contained">
													Adding ...
												</LoadingButton>
											)}
										</div>
									</div>

									{/* <div className="">
										<div className="row">
											<div className="col-12">
												<DataGrid
													getRowIdSubs={getRowIdForSMTP}
													rows={SMTPList}
													loading={gridloading}
													columns={columnsSMTP}
													autoHeight
													getRowClassName={(params) =>
														params.indexRelativeToCurrentPage % 2 === 0
															? "even"
															: "odd"
													}
													rowHeight={40}
													columnHeaderHeight={40}
													className="f13 border-0"
													disableRowSelectionOnClick
													slots={{ toolbar: GridToolbar }}
													slotProps={{
														toolbar: {
															showQuickFilter: true,
														},
													}}
												/>
											</div>
										</div>
									</div> */}
								</Box>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>
			<Dialog open={openDialog} onClose={() => handleCloseDialog(false)}>
    <DialogTitle id="alert-dialog-title">
        {"Please fill subscription to complete registration"}
    </DialogTitle>
    <DialogContent style={{ minWidth: "300px" }}>
        <DialogContentText id="alert-dialog-description">
            You need to fill in subscription details to complete the registration process.
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => handleCloseDialog(false)} color="primary">
            Do it
        </Button>
        <Button onClick={() => handleCloseDialog(true)} color="secondary" autoFocus>
            Do it later
        </Button>
    </DialogActions>
</Dialog>

		</>
	);
};

export default CustomerList;
