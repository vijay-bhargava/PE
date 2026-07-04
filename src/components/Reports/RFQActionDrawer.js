import React, { useEffect, useState } from "react";
import { Autocomplete, Avatar, Box, Button, Checkbox, DialogActions, DialogContent, DialogContentText, DialogTitle, Drawer, IconButton, InputAdornment, Menu, MenuItem, Pagination, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { CalendarToday as CalendarIcon } from "@mui/icons-material";
import { HiDotsVertical, HiOutlineChevronDown, HiOutlineUserAdd, HiOutlineX } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
	buildQueryParams,
	formatDateViaLocale,
	formatDateViaTime,
	formattimeoption, getDateFormatPatteronLocale, userampm, VendorfilterOptions
} from "../../utils/common/utility";
import { downloadZip } from "../../utils/common/index"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useLocation, useNavigate } from "react-router-dom";
import { api, ApiClient } from "../../Apiclient";
import { useStateValue } from "../../store";
import { Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import { InvitedSupplierModal } from "../../utils/common";
import { LoadingButton } from "@mui/lab";
import * as yup from "yup";
import { useFormik } from "formik";
import { Card, Table } from "react-bootstrap";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker, LocalizationProvider, MobileDateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { FastApiClient } from "../../FastApiClient";
import TextFieldCell from "../../pages/BaseCells/TextFieldCell";
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import LockLoader from "../Loader/LockLoader";
import { version } from "dompurify";
dayjs.extend(utc);
dayjs.extend(timezone);

const RFQActionDrawer = ({
	rfqid,
	enddate,
	activityId, handleDraftEvent, rfqtype, EventHeaderDetails, Version, currentStage, downloadExcel }) => {
	const fastApiClient = new FastApiClient()
	const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
	const checkedIcon = <CheckBoxIcon fontSize="small" />;
	const [locked, setLocked] = useState(false);
	const [actiontext, setActionText] = useState('')
	const [actionlocktype, setActionLockType] = useState(null)
	const [selectedSupplier, setSelectedSupplier] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [openDrawer, setOpenDrawer] = useState({
		addsupplier: false,
		loadingFactor: false,
		reInviteSupplier: false,
		reOpenSupplier: false,
		surrogateSupplier: false,
		NotifySupplier: false,
		ReinitiateEvent: false,
		extendEvent: false,
		openDate: false,
		HistoryEvent: false,
		OpenSealedBid: false
	}); // state to track which drawer is open
	const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
	// Function to toggle the drawer based on the selected type
	const toggleDrawer = (anchor, open) => {

		setOpenDrawer({ ...openDrawer, [anchor]: open });
	};
	const location = useLocation()

	const handleReinitiateUpdate = async () => {
		setLoading(true)
		const res = await handleDraftEvent()
		if (res) {

			setOpenDrawer(prevState => {
				// Create a new object where all values are set to false
				const updatedState = Object.keys(prevState).reduce((acc, key) => {
					acc[key] = false;  // Set each value to false
					return acc;
				}, {});

				return updatedState;  // Return the updated state
			});

		}

		setLoading(false)

	}

	const handleOpenSealedBid = async () => {
		setLoading(true)

		const data = {
			rfqId: rfqid,
			OpenQuoteYN: "Y",
			Comment: "OpenSealedBid"
		}
		const queryParams = buildQueryParams(data)
		const res = await apiClient.postres(`/api/RFQManage/RFQSealedBidOpen?${queryParams}`, null, atoken)
		if (res) {
			toast.success(`Sealed Bid opened successfully`, {
				toastid: "sealedbidcheck"
			})
			setActionLockType("sealedbid")
			setActionText(`✅ Sealed RFQ is open now`)
			setLocked(true)

		}

		setOpenDrawer(prevState => {
			// Create a new object where all values are set to false
			const updatedState = Object.keys(prevState).reduce((acc, key) => {
				acc[key] = false;  // Set each value to false
				return acc;
			}, {});

			return updatedState;  // Return the updated state
		});
		setLoading(false)

	}

	const navigate = useNavigate();
	const [{ atoken, rtoken, customerid, customersuffix, roleClaims, userDetail }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);


	const [selectedCategory, setSelectedCategory] = useState(null);





	useEffect(() => {
		if (openDrawer.addsupplier && customerid) {
			// getTotalSupplier();
			getSupplierEventWise();
		}
	}, [customerid, openDrawer])
	useEffect(() => {
		if (selectedSupplier.length > 0) {
			getTotalSupplier();
			getCategorylist();
		}
	}, [selectedSupplier])
	const getCategorylist = async () => {
		const obj = {
			CustomerId: customerid,
		}
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/ItemCategory/Find?${queryParams}`,
			atoken
		);

		if (res) {
			setCategoryList(res?.data?.result || []);
		}
	};


	const handleSupplierWithCategory = async (selectedCategory) => {
		const obj = {
			CustomerId: customerid,
			Advance: "Advance",
			CategoryId: selectedCategory?.id,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);

		if (res && res?.data?.length > 0) {
			// Extract the emails from selectedSupplier
			const filteredSuppliers = res.data.filter((supplier) => {
				return (
					!selectedSupplier.some((item) => item.vendorId === supplier.vendorId)
				);
			});

			setRemainingSupplier(filteredSuppliers);
		} else {
			// Reset totalSuppliers if no results are returned

			setRemainingSupplier([]);
		}
	};


	const getSupplierEventWise = async () => {
		const reqdata = {
			RFQId: rfqid,
			Version: Version,
			//  AccessLevel:issupplierraccesslevel
		};
		const queryParams = buildQueryParams(reqdata);
		const res = await apiClient.getres(
			`/api/RFQVendorInvite/Find?${queryParams}`,
			atoken
		);
		if (res.status == 200) {

			let vendorItemAnalysisdata = res.data?.result;

			setSelectedSupplier(vendorItemAnalysisdata);
		}
	};

	const [remainingSupplier, setRemainingSupplier] = useState([]);
	const [newSupplier, setNewSupplier] = useState([]);
	const getTotalSupplier = async () => {
		const obj = {
			CustomerId: customerid,
			//Advance: `Advance`,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);

		if (res) {
			// Extract the emails from selectedSupplier and newSupplier

			// Filter the suppliers from the API response that are not in selectedSupplier or newSupplier
			const filteredSuppliers = res.data.filter((supplier) => {
				return (
					!selectedSupplier.some((item) => item.vendorId === supplier.vendorId)
				);
			});

			setRemainingSupplier(filteredSuppliers);


		}


	};


	//pagination for total suppliers
	const [pageTS, setPageTS] = React.useState(1);
	const [totalpageTS, setTotalPageTS] = React.useState(3);
	const [pageCount, setPageCount] = React.useState(10);
	const [pageSS, setPageSS] = React.useState(1);
	const [totalpageSS, setTotalPageSS] = React.useState(
		Math.ceil(newSupplier / pageCount)
	);
	useEffect(() => {
		handlePaginationTS();
		setTotalPageTS(
			Math.ceil(remainingSupplier?.length / pageCount)
		);
	}, [pageTS, remainingSupplier]);


	useEffect(() => {
		handlePaginationSS();
		setTotalPageSS(Math.ceil(newSupplier?.length / pageCount));
	}, [pageSS, newSupplier]);

	const handlePaginationTS = (event, value) => {
		if (value) {
			setPageTS(value);
		}
	};
	const handlePaginationSS = (event, value) => {
		if (value) {
			setPageSS(value);
		}
	};



	const handleCheckRemainingSupplier = (supplier) => {
		// Find the supplier index in remainingSupplier
		const supplierIndex = remainingSupplier.findIndex(
			(item) => item.contactId === supplier.contactId
		);

		// Check if supplier already exists in newSupplier
		const isAlreadyInNewSupplier = newSupplier.some(
			(item) => item.contactId === supplier.contactId
		);

		if (isAlreadyInNewSupplier) {
			toast.info("User from this Supplier is already added", {
				toastId: "supplier_info"
			});
			return;
		}

		// If supplier exists in remainingSupplier, remove and add it to newSupplier
		if (supplierIndex !== -1) {
			const updatedRemainingSupplier = [...remainingSupplier];
			const updatedNewSupplier = [...newSupplier];

			// Remove the supplier from remainingSupplier
			const [removedSupplier] = updatedRemainingSupplier.splice(supplierIndex, 1);

			// Add the removed supplier to newSupplier
			updatedNewSupplier.push(removedSupplier);

			// Update the state
			setRemainingSupplier(updatedRemainingSupplier);
			setNewSupplier(updatedNewSupplier);
		}
	};

	const handleClearRemainingSupplier = (supplier) => {
		setSelectedCategory(null)
		// Find the supplier index in newSupplier
		const supplierIndex = newSupplier.findIndex(
			(item) => item.contactId === supplier.contactId
		);

		// If supplier exists in newSupplier, remove and add it back to remainingSupplier
		if (supplierIndex !== -1) {
			const updatedNewSupplier = [...newSupplier];
			const updatedRemainingSupplier = [...remainingSupplier];

			// Remove the supplier from newSupplier
			const [removedSupplier] = updatedNewSupplier.splice(supplierIndex, 1);

			// Add the removed supplier back to remainingSupplier
			updatedRemainingSupplier.push(removedSupplier);

			// Update the state
			setNewSupplier(updatedNewSupplier);
			setRemainingSupplier(updatedRemainingSupplier);
		}
	};



	const [loading, setLoading] = useState(false)

	const [loading2, setLoading2] = useState(false)
	const handleSaveNewSupplier = async () => {

		setLoading(true)
		const data = InvitedSupplierModal(
			newSupplier,
			parseInt(rfqid),
			enddate,
			parseInt(customerid),
			userDetail,
			Version
		);

		if (data.length === 0) {
			toast.error(`Please select a supplier before proceeding.`, {
				toastId: "supplierselection_error"
			});
			return;
		}
		const invitedSuppliers = {
			rfqVendorDetails: data,
			activityId: parseInt(activityId),
			supplierActionType: "AddVendor",
			RFQId: parseInt(rfqid)

		};

		const res = await apiClient.postres(
			`/api/RFQVendorInvite/${rfqid}/Add`,
			invitedSuppliers,
			atoken
		);

		if (res) {

			toggleDrawer("addsupplier", false)

		}

		setLoading(false)
	};



	// #re-invite supplier

	const [searchQuery, setSearchQuery] = useState('');
	const validationSchemaReinvite = yup.object().shape({
		deadlineDate: yup
			.date()
			// .default(new Date(maxNow))
			// .min(maxNow, `Date cannot be in the past`)
			.required(" Date/Time is required")
			.typeError(" Date/Time is required"),
	});
	// const formik_Reinvite = useFormik({
	// 	enableReinitialize: true,
	// 	initialValues: {

	// 		reopenDate: null,
	// 		deadlineDate: null,
	// 		bidOpeningDate: null
	// 	},
	// 	validationSchema: (openDrawer.reInviteSupplier || openDrawer.openDate || openDrawer.extendEvent) ? validationSchemaReinvite : null,
	// 	onSubmit: async (values) => {
	// 		setLoading(true)

	// 		let rfqVendorDetails;


	// 		rfqVendorDetails = supplierlist?.filter(v => v.reinvitechecked).map((v) => {

	// 			return {
	// 				"RFQId": rfqid,
	// 				"emailId": v?.emailId,
	// 				"remarks": v?.reinviteremark,
	// 				"vendorId": v?.vendorId,
	// 				"contactId": v?.contactId,
	// 				"customerId": customerid,
	// 				"version": v?.version
	// 			}

	// 		})
	// 		let payload;

	// 		if (openDrawer.reInviteSupplier) {
	// 			if (values?.reopenDate?.toISOString() > values?.deadlineDate?.toISOString()) {
	// 				formik_Reinvite.setFieldError("reopenDate", "Reopen Date should be less than End Date")
	// 				setLoading(false)
	// 				return
	// 			}

	// 			if (values?.bidOpeningDate && (values?.deadlineDate?.toISOString() > values?.bidOpeningDate?.toISOString())) {
	// 				formik_Reinvite.setFieldError("bidOpeningDate", "Bid Opening Date should be greater than  End date Date")
	// 				setLoading(false)
	// 				return
	// 			}

	// 			const supplierActionType = "ReInvite";
	// 			payload = {
	// 				"rfqVendorDetails": rfqVendorDetails,
	// 				"supplierActionType": supplierActionType,
	// 				"ReOpenDate": values?.reopenDate,
	// 				"RFQDeadLine": values?.deadlineDate?.toISOString(),
	// 				"BidOpeningDate": values?.bidOpeningDate?.toISOString()
	// 			}

	// 		}
	// 		else if (openDrawer.NotifySupplier) {
	// 			const supplierActionType = "Reminder";
	// 			payload = {
	// 				"rfqVendorDetails": rfqVendorDetails,
	// 				"supplierActionType": supplierActionType,

	// 			}
	// 		}
	// 		else if (openDrawer.extendEvent) {

	// 			const supplierActionType = "Extend Date";
	// 			payload = {
	// 				"rfqDeadLine": values?.deadlineDate?.toISOString(),
	// 				"supplierActionType": supplierActionType,

	// 			}

	// 		}

	// 		else if (openDrawer.openDate) {

	// 			const supplierActionType = "OpenDate";
	// 			payload = {
	// 				"rfqDeadLine": values?.deadlineDate?.toISOString(),
	// 				"supplierActionType": supplierActionType,

	// 			}

	// 		}

	// 		else if (openDrawer.reOpenSupplier) {
	// 			const supplierActionType = "ReOpen";
	// 			payload = {
	// 				"rfqVendorDetails": rfqVendorDetails,
	// 				"supplierActionType": supplierActionType,

	// 			}

	// 		}



	// 		else {
	// 			setLoading(false)
	// 			return
	// 		}


	// 		const res = await apiClient.postres(`/api/RFQManage/${rfqid}/RFQInvitationVersion`, payload, atoken)
	// 		if (res) {
	// 			clearReinviteAll();
	// 			setOpenDrawer(prevState => {
	// 				// Create a new object where all values are set to false
	// 				const updatedState = Object.keys(prevState).reduce((acc, key) => {
	// 					acc[key] = false;  // Set each value to false
	// 					return acc;
	// 				}, {});

	// 				return updatedState;  // Return the updated state
	// 			});



	// 			if (openDrawer.extendEvent) {
	// 				setActionLockType("updateenddate")
	// 				setActionText(`✅ RFQ End Date updated successfully`)
	// 				setLocked(true)
	// 			}
	// 			else {
	// 				toast.success(`Action Taken Successfully`, {
	// 					toastId: "reinvitetoast"
	// 				})
	// 			}

	// 		}

	// 		setLoading(false)
	// 	},
	// });

	const formik_Reinvite = useFormik({
		enableReinitialize: true,
		initialValues: {
			reopenDate: null,
			deadlineDate: null,
			bidOpeningDate: null
		},
		validationSchema: (openDrawer.reInviteSupplier || openDrawer.openDate || openDrawer.extendEvent)
			? validationSchemaReinvite
			: null,

		onSubmit: async (values) => {
			setLoading(true);

			let rfqVendorDetails = supplierlist
				?.filter(v => v.reinvitechecked)
				.map(v => ({
					RFQId: rfqid,
					emailId: v?.emailId,
					remarks: v?.reinviteremark,
					vendorId: v?.vendorId,
					contactId: v?.contactId,
					customerId: customerid
				}));

			let payload = {};

			if (openDrawer.reInviteSupplier) {
				if (values?.reopenDate?.toISOString() > values?.deadlineDate?.toISOString()) {
					formik_Reinvite.setFieldError("reopenDate", "Reopen Date should be less than End Date");
					setLoading(false);
					return;
				}

				if (
					values?.bidOpeningDate &&
					values?.deadlineDate?.toISOString() > values?.bidOpeningDate?.toISOString()
				) {
					formik_Reinvite.setFieldError("bidOpeningDate", "Bid Opening Date should be greater than End date Date");
					setLoading(false);
					return;
				}

				payload = {
					rfqVendorDetails: rfqVendorDetails,
					supplierActionType: "",
					currentStage: "Re Invite",
					ReOpenDate: values?.reopenDate,
					RFQDeadLine: values?.deadlineDate?.toISOString(),
					BidOpeningDate: values?.bidOpeningDate?.toISOString()
				};
			} else if (openDrawer.NotifySupplier) {
				payload = {
					rfqVendorDetails: rfqVendorDetails,
					supplierActionType: "",
					currentStage: "Send Reminder"
				};
			} else if (openDrawer.extendEvent) {
				payload = {
					rfqDeadLine: values?.deadlineDate?.toISOString(),
					supplierActionType: "",
					currentStage: "Date Extension"
				};
			} else if (openDrawer.openDate) {
				payload = {
					bidOpeningDate: values?.deadlineDate?.toISOString(),
					supplierActionType: "",
					currentStage: "Open Date"
				};
			} else if (openDrawer.reOpenSupplier) {
				payload = {
					rfqVendorDetails: rfqVendorDetails,
					supplierActionType: "",
					currentStage: "Re Open"
				};
			} else {
				setLoading(false);
				return;
			}
			const res = await apiClient.postres(
				`/api/RFQManage/${rfqid}/RFQInvitationVersion`,
				payload,
				atoken
			);

			if (res) {
				clearReinviteAll();

				setOpenDrawer(prevState => {
					const updatedState = Object.keys(prevState).reduce((acc, key) => {
						acc[key] = false;
						return acc;
					}, {});
					return updatedState;
				});

				if (openDrawer.extendEvent) {
					toast.success(`✅ RFQ End Date updated successfully`, {
						toastId: "updateenddate"
					});
					setTimeout(() => {
						window.location.reload();
					}, 2000);

					// setActionLockType("updateenddate");
					// setActionText(`✅ RFQ End Date updated successfully`);
					// setLocked(true);
				}
				else if (openDrawer.openDate) {
					toast.success(`✅ Bid Opening Date updated successfully`, {
						toastId: "updateopendate"
					});
					setTimeout(() => {
						window.location.reload();
					}, 2000);
				}
				else {
					toast.success(`Action Taken Successfully`, {
						toastId: "reinvitetoast"
					});
				}
			}

			setLoading(false);
		}
	});





	const getEventSupplier = async () => {
		const reqdata = {
			RFQId: parseInt(rfqid),
			Version: Version,
		};

		const queryParams = buildQueryParams(reqdata);
		const res = await apiClient.getres(
			`/api/RFQVendorInvite/Find?${queryParams}`,
			atoken
		);
		if (res) {

			const data = res.data?.result;
			setSupplierList(data)
		}

	}
	const [supplierlist, setSupplierList] = useState([])
	useEffect(() => {

		if ((openDrawer.reInviteSupplier || openDrawer.loadingFactor || openDrawer.reOpenSupplier
			|| openDrawer.NotifySupplier || openDrawer.surrogateSupplier) && rfqid && Version) {
			getEventSupplier();
		}
	}, [rfqid, openDrawer, Version])

	const handleReinviteCheck = (supplier, value) => {
		const list = supplierlist.map(s =>
			s.id === supplier.id   // 👈 compare by unique field
				? { ...s, reinvitechecked: value }
				: s
		);
		setSupplierList(list);
	};

	const handleReinviteAll = (value) => {
		const list = supplierlist?.map((component) => ({
			...component,
			reinvitechecked: value,
		}));
		setSupplierList(list);
	};
	const handleReminderAll = (value) => {
		setSupplierList(prev =>
			prev.map(supplier =>
				supplier.version === EventHeaderDetails.version &&
					supplier.status != "Closed" &&
					supplier.status != "Regretted"
					? { ...supplier, reinvitechecked: value } // update only filtered
					: supplier // keep others same
			)
		);
		console.log(supplierlist)
	};

	const handleReOpenAll = (value) => {
		setSupplierList(prev =>
			prev.map(supplier =>
				supplier.version === EventHeaderDetails.version &&
					supplier.status != "Open" &&
					supplier.status != "Regretted"
					? { ...supplier, reinvitechecked: value } // update only filtered
					: supplier // keep others same
			)
		);
		// console.log(supplierlist)
	}

	const clearReinviteAll = () => {
		const list = supplierlist?.map((component) => ({
			...component,
			reinvitechecked: false,
		}));
		setSupplierList(list);
	};


	//handle export
	// const handleExcelExport = async () => {
	// 	setLoading2(true)

	// 	var data = {
	// 		Id: rfqid
	// 	};

	// 	const queryParams = buildQueryParams(data);
	// 	const res_rfqheaderdetails = await apiClient.getres(
	// 		`/api/RFQManage/FindById?${queryParams}`,
	// 		atoken
	// 	);
	// 	if (!res_rfqheaderdetails) {
	// 		setLoading2(false)
	// 		return
	// 	}
	// 	const rfqheaderdetails = res_rfqheaderdetails?.data?.result
	// 	const reqdata = {
	// 		rfqId: parseInt(rfqid),
	// 		Version: 0,
	// 	};
	// 	const queryParamsvendorItemAnalysis = buildQueryParams(reqdata);
	// 	const resqueryParamsvendorItemAnalysis = await apiClient.getres(
	// 		`/api/RFQManage/RFQcomparativeReport?${queryParamsvendorItemAnalysis}`,
	// 		atoken
	// 	);
	// 	let vendorItemAnalysis;
	// 	if (resqueryParamsvendorItemAnalysis.status === 200) {
	// 		vendorItemAnalysis = resqueryParamsvendorItemAnalysis.data;
	// 	}
	// 	else {
	// 		setLoading2(false)
	// 		return
	// 	}

	// 	const datavendorItemAnalysis = {
	// 		vendor_details: vendorItemAnalysis,
	// 		rfq_details: rfqheaderdetails
	// 	}

	// 	const response = await fastApiClient.postresblob(`/rfq-comparative/generate-excel`, datavendorItemAnalysis)
	// 	if (response) {
	// 		// Create a blob URL for the response data
	// 		const blobUrl = URL.createObjectURL(new Blob([response.data]));

	// 		// Create a link element to download the file
	// 		const link = document.createElement("a");
	// 		link.href = blobUrl;
	// 		link.setAttribute("download", `RFQ_Report_${new Date()}.xlsx`); // Specify the file name

	// 		// Append the link to the body, click it and remove it
	// 		document.body.appendChild(link);
	// 		link.click();
	// 		document.body.removeChild(link);
	// 	}
	// 	setLoading2(false)

	// }
	// const handleExcelExportSummary = async () => {

	// 	setLoading(true)
	// 	var data_header = {
	// 		Id: rfqid
	// 	};

	// 	const queryParamsheaderdetails = buildQueryParams(data_header);
	// 	const res_rfqheaderdetails = await apiClient.getres(
	// 		`/api/RFQManage/FindById?${queryParamsheaderdetails}`,
	// 		atoken
	// 	);
	// 	if (!res_rfqheaderdetails) {
	// 		setLoading(false)
	// 		return
	// 	}
	// 	const rfqheaderdetails = res_rfqheaderdetails?.data?.result
	// 	const reqdata = {
	// 		rfqId: parseInt(rfqid),
	// 		Version: 0,
	// 	};
	// 	const queryParamsvendorItemAnalysis = buildQueryParams(reqdata);
	// 	const resqueryParamsvendorItemAnalysis = await apiClient.getres(
	// 		`/api/RFQManage/RFQcomparativeReport?${queryParamsvendorItemAnalysis}`,
	// 		atoken
	// 	);
	// 	let vendorItemAnalysis;
	// 	if (resqueryParamsvendorItemAnalysis.status === 200) {
	// 		vendorItemAnalysis = resqueryParamsvendorItemAnalysis.data;
	// 	}
	// 	else {
	// 		setLoading(false)
	// 		return
	// 	}

	// 	const payload = {
	// 		rfqId: rfqid,
	// 		Version: 0
	// 	}
	// 	const queryParams = buildQueryParams(payload)
	// 	const finalversionres = await apiClient.getres(`/api/RFQManage/RFQVendorComparativeReport?${queryParams}`, atoken)

	// 	if (!finalversionres) {
	// 		toast.error("some error occured")
	// 		setLoading(false)
	// 		return
	// 	}
	// 	const version_summary = finalversionres?.data;
	// 	const data = {
	// 		vendor_details: vendorItemAnalysis,
	// 		rfq_details: rfqheaderdetails,
	// 		version_summary: version_summary
	// 	}
	// 	const response = await fastApiClient.postresblob(`/summary-comparative/generate-excel`, data)
	// 	if (response) {
	// 		// Create a blob URL for the response data
	// 		const blobUrl = URL.createObjectURL(new Blob([response.data]));

	// 		// Create a link element to download the file
	// 		const link = document.createElement("a");
	// 		link.href = blobUrl;
	// 		link.setAttribute("download", `RFQ_Report_${new Date()}.xlsm`); // Specify the file name

	// 		// Append the link to the body, click it and remove it
	// 		document.body.appendChild(link);
	// 		link.click();
	// 		document.body.removeChild(link);
	// 	}
	// 	else {
	// 		setLoading(false)
	// 	}


	// }

	//formik surrogate 
	const validationSchemaSurrogate = yup.object().shape({

		surrogateemail: yup
			.string('Enter email')
			.required('Please enter your email')
			.email('Enter a valid email'),
		supplier: yup
			.object()
			.test('at-least-one', 'At least one supplier is required', (value) => {
				return value && Object.keys(value).length > 0; // Ensure at least one key exists in the object
			})
			.required('Suppliers are required')


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

			setLoading(true)
			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				})
				formik_Surrogate.setFieldError("supplier", "Atleast one Supplier is required")
				setLoading(false)
				return
			}

			const payload = {
				"name": values?.surrogatename,
				"vendorId": values?.supplier?.vendorId,
				"VendorDetailId": values?.supplier?.id,
				"email": values?.surrogateemail,
				"rfqId": rfqid,
				"reason": values?.surrogateReason,
				"stages": {
					"eventType": "RFQ",
					"currentStage": "Surrogate",
					"nextStage": "Surrogate",
					"orgId": 0,
					"orgGroupId": 0
				}
			}

			const res = await apiClient.postres(`/api/RFQManage/RFQSurrogate`, payload, atoken)
			if (res) {
				setOpenDrawer({ ...openDrawer, surrogateSupplier: false })
				toast.success(`suppliers surrogated successfully`, {
					toastId: "surrogatetoast"
				})
				formik_Surrogate.resetForm();

			}
			setLoading(false)

		},
	});


	const getInitials = (userName) => {
		if (!userName) return ''; // If no username, return an empty string

		const nameParts = userName.split(' '); // Split the name by space
		const initials = nameParts
			.map(part => part.charAt(0).toUpperCase()) // Get the first letter of each part and capitalize it
			.join(''); // Join the initials together

		return initials;
	};


	//#view history
	const [expanded, setExpanded] = React.useState('panel1');
	const [selectedItem, setSelectedItem] = useState(null);
	const handleAccordionChange = (id) => (event) => {
		// Only toggle if not clicking on the action name
		if (event.target && event.target.closest('.action-info') === null) {
			// Toggle the expanded state of the specific accordion (use the ID as the key)
			setExpanded((prevExpanded) => prevExpanded === id ? null : id);

			// Find the selected data based on the id
			const selectedData = Auditdata?.find(item => item.id.toString() === id.toString());

			// Set the selected item or null
			setSelectedItem(selectedData || null);
		}
	};

	const Accordion = styled((props) => (
		<MuiAccordion disableGutters elevation={0} square {...props} />
	))(({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}));

	const AccordionSummary = styled((props) => (
		<MuiAccordionSummary
			expandIcon={<HiOutlineChevronDown sx={{ fontSize: '0.9rem' }} />}
			{...props}
		/>
	))(({ theme }) => ({
		backgroundColor:
			theme.palette.mode === 'dark'
				? 'rgba(255, 255, 255, .05)'
				: 'rgba(0, 0, 0, .03)',
		flexDirection: 'row-reverse',
		'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
			transform: 'rotate(90deg)',
		},
		'& .MuiAccordionSummary-content': {
			marginLeft: theme.spacing(1),
		},
	}));

	const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
		padding: theme.spacing(2),
		borderTop: '1px solid rgba(0, 0, 0, .125)',
	}));
	const [Auditdata, setAuditdata] = useState([]);
	const pullAuditList = async () => {


		var data = {
			EventType: "RFQ",
			EntityId: rfqid,

		};
		const queryParams = buildQueryParams(data)
		const res = await apiClient.getres(`api/ReportConfig/AuditReport?${queryParams}`, atoken)
		if (res) {

			const data = res?.data?.result

			setAuditdata(data);


		}
	}

	useEffect(() => {
		if (openDrawer.HistoryEvent && rfqid) {
			pullAuditList();
		}
	}, [openDrawer.HistoryEvent, rfqid]);

	const handleInfoClick = (event, itemId) => {
		event.stopPropagation(); // Prevent the click event from propagating to the Accordion
		setExpanded(itemId.toString()); // Expand the accordion manually if desired
		const selectedData = Auditdata?.find(item => item.id.toString() === itemId.toString());
		if (selectedData) {
			setSelectedItem(selectedData); // Set the selected item based on the id
		}
	};

	const cleanAdditionalInfo = (additionalInfo) => {
		if (!additionalInfo) {
			return ''
		}
		// Step 1: Remove any HTML tags using a simple regex
		let cleanedInfo = additionalInfo?.replace(/<\/?[^>]+(>|$)/g, ""); // Removes all HTML tag

		return cleanedInfo?.trim(); // Remove leading/trailing spaces
	};
	const handleZipDownload = () => {

		let folderPath = `${customerid}/RFQ/${rfqid}`;
		downloadZip(folderPath);
	}

	return (

		<>
			{/* {locked && <LockLoader loaderCallback={() => {
				window.location.reload()
			}}
				actiontext={actiontext}
				actionlocktype={actionlocktype}
			/>} */}
			<div>
				<button type="button" className="rfq-v2-tbtn rfq-v2-tbtn-export"
					aria-controls={Boolean(actionsAnchorEl) ? "actions-menu" : undefined}
					aria-haspopup="true"
					onClick={(e) => setActionsAnchorEl(e.currentTarget)}
				>
					<span>Actions</span>
					<span style={{ width: 1, alignSelf: 'stretch', background: '#e5e7eb', }} />
					<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<HiOutlineChevronDown style={{ fontSize: 16 }} />
					</span>
				</button>
				<Menu
					id="actions-menu"
					anchorEl={actionsAnchorEl}
					open={Boolean(actionsAnchorEl)}
					onClose={() => setActionsAnchorEl(null)}
					sx={{ maxWidth: 800, padding: "30px" }}
				>
					{currentStage != "Awarded" && Version == Math.floor(Version) && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("addsupplier", true); }} sx={{ fontSize: "14px" }}>Add New Supplier</MenuItem>
					)}
					{currentStage && !['Draft', 'Under Pre Approval', 'Awarded'].includes(currentStage) && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("reInviteSupplier", true); }} sx={{ fontSize: "14px" }}>Reinvite Supplier</MenuItem>
					)}
					{currentStage != "Awarded" && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("reOpenSupplier", true); }} sx={{ fontSize: "14px" }}>Reopen Supplier</MenuItem>
					)}
					{currentStage != "Awarded" && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("surrogateSupplier", true); }} sx={{ fontSize: "14px" }}>Surrogate Supplier</MenuItem>
					)}
					{currentStage != "Awarded" && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("NotifySupplier", true); }} sx={{ fontSize: "14px" }}>Send Reminder</MenuItem>
					)}
					<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("ReinitiateEvent", true); }} sx={{ fontSize: "14px" }}>Reinitiate RFQ</MenuItem>
					{currentStage != "Awarded" && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("extendEvent", true); }} sx={{ fontSize: "14px" }}>Extend End Date</MenuItem>
					)}
					<MenuItem onClick={() => { setActionsAnchorEl(null); handleZipDownload(); }} sx={{ fontSize: "14px" }}>Download Zip</MenuItem>
					{currentStage != "Awarded" && rfqtype == "closed" && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("openDate", true); }} sx={{ fontSize: "14px" }}>Update Open Date</MenuItem>
					)}
					{currentStage != "Awarded" && rfqtype == "closed" && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("OpenSealedBid", true); }} sx={{ fontSize: "14px" }}>Open Sealed Bid</MenuItem>
					)}
					{downloadExcel && (
						<MenuItem onClick={() => { setActionsAnchorEl(null); downloadExcel(); }} sx={{ fontSize: "14px" }}>Download Comparative Excel</MenuItem>
					)}
					<MenuItem onClick={() => { setActionsAnchorEl(null); toggleDrawer("convertToAuction", true); }} sx={{ fontSize: "14px" }}>Convert to Auction</MenuItem>
				</Menu>

				{/* Drawer for Add New Supplier */}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.addsupplier} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("addsupplier", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 600,
							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Add New Supplier</div>
								<IconButton
									onClick={() => toggleDrawer("addsupplier", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<div className="row p-2">
							<div className="col-12">
								<div className="">
									<div className="row align-items-center">
										<div className="col-12 col-md-12">
											<div className="row mt-2">
												<div className="col-12 col-md-6 col-lg-6 mb-3">
													<Autocomplete
														disablePortal
														id=""
														size="small"
														options={categoryList}
														fullWidth
														renderInput={(params) => (
															<TextField
																{...params}
																InputLabelProps={{
																	shrink: true,
																}}
																label="Category"
															/>
														)}
														getOptionLabel={(option) =>
															option.itemCategory ?? ""
														}
														value={selectedCategory}
														onChange={(e, newvalue) => {
															setSelectedCategory(newvalue);
															handleSupplierWithCategory(newvalue);
														}}
													/>
												</div>

												<div className="col-12 col-md-6 col-lg-6 mb-3">
													<Autocomplete
														id="searchvendorbyname"
														options={
															remainingSupplier ?? []
														}
														filterOptions={VendorfilterOptions}
														getOptionLabel={(option) => ""}
														renderOption={(
															props,
															option,
															{ selected }
														) => (
															<li {...props}>
																{<Checkbox
																	icon={icon}
																	checkedIcon={checkedIcon}
																	style={{ marginRight: 8 }}
																/>}
																{`${option.contactPerson} | ${option.email} | ${option?.companyName}` ??
																	""}
															</li>
														)}
														size="small"
														fullWidth
														renderInput={(params) => (
															<TextField
																{...params}
																InputLabelProps={{
																	shrink: true,
																}}
																label="Search User from Supplier by Name"
															/>
														)}
														onChange={(e, newvalue) => {
															if (newvalue) {

																handleCheckRemainingSupplier(newvalue)
															}
														}}
													/>
												</div>



											</div>
										</div>

									</div>
								</div>
							</div>
						</div>

						<div className="row mt-3">
							<div className="col-12 col-md-12 col-lg-6">
								<div className="bg-white rounded shadow-sm">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="p-2">
											<div className="d-flex align-items-center">
												Remaining Suppliers{" "}
												<div className="supplierCount">
													{
														remainingSupplier
															?.length
													}
												</div>{" "}
												{selectedCategory && (
													<Badge pill bg="success" text="dark">
														{selectedCategory?.categoryName}
													</Badge>
												)}
											</div>

										</div>

									</div>
									<hr className="m-0" />
									<div className="row">
										<div className="col-12">
											{remainingSupplier

												?.slice(
													(pageTS - 1) * pageCount,
													pageTS * pageCount
												)
												.map((x, i) => (
													<div
														className="d-flex border-bottom align-items-center m-0 p-1 pt-0 pb-0"
														key={i}
													>

														<div className="flex-grow-1 ms-2 text-truncate">

															<div className="text-truncate f12">
																<button type="button" className="pe-icon-btn pe-icon-btn--add ms-2 me-3" onClick={() => handleCheckRemainingSupplier(x)}>
																	<HiOutlineUserAdd />
																</button>

																{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}

															</div>
														</div>


													</div>
												))}
										</div>
									</div>
								</div>

								<div className="pagination_wrapper mb-3 mt-3">
									<div className="d-flex align-items-center">
										<div className="flex-grow-1 d-none d-md-block">

										</div>
										<div className="">
											<Stack spacing={2}>
												<Pagination
													count={totalpageTS}
													page={pageTS}
													onChange={handlePaginationTS}
												/>
											</Stack>
										</div>

									</div>
								</div>

							</div>
							{newSupplier && newSupplier.length > 0 && <div className="col-12 col-md-12 col-lg-6 border-start">
								<div className="bg-white rounded shadow-sm">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="p-2">
											<div className="d-flex align-items-center">
												New Suppliers{" "}
												<div className="supplierCount">
													{newSupplier?.length}
												</div>
											</div>

										</div>
										<div className="">

											<>









											</>




										</div>
									</div>
									<hr className="m-0" />
									<div className="row">
										<div className="col-12">
											{newSupplier
												.slice(
													(pageSS - 1) * pageCount,
													pageSS * pageCount
												)
												.map((x, i) => (
													<div
														className="row border-bottom align-items-center m-0 p-1 pt-0 pb-0"
														key={i}
													>
														<div className="col-md-10">
															<div className="d-flex align-items-center ">

																<div className="text-truncate f12">
																	<button type="button" className="pe-icon-btn pe-icon-btn--delete ms-2 me-3" onClick={() => handleClearRemainingSupplier(x)}>
																		<HiOutlineX />
																	</button>
																	{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}
																</div>
															</div>
														</div>
														<div className="col-md-2 justify-content-end d-flex align-items-center">
															<div className="col-md-4  d-flex align-items-center justify-content-end">


															</div>


														</div>
													</div>
												))}
										</div>
									</div>
								</div>
								<div className="pagination_wrapper mb-3 mt-3">
									<div className="d-flex align-items-center">
										<div className="flex-grow-1 d-none d-md-block">

										</div>
										<div className="">
											<Stack spacing={2}>
												<Pagination
													count={totalpageSS}
													page={pageSS}
													onChange={handlePaginationSS}
												/>
											</Stack>
										</div>
									</div>
								</div>
							</div>}
							{newSupplier && newSupplier.length > 0 && <div className="row">
								<div className="col-md-12 text-end">
									<div className="buttonVendor">
										<LoadingButton loading={loading} variant="contained" onClick={handleSaveNewSupplier}>Update</LoadingButton>
									</div>

								</div>
							</div>}
						</div>

					</div>
				</Drawer>

				{/* Drawer for Re-invite*/}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.reInviteSupplier} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("reInviteSupplier", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 800,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Reinvite RFQ</div>
								<IconButton
									onClick={() => toggleDrawer("reInviteSupplier", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
							<div className="p-3">

								{openDrawer.reInviteSupplier && <div className="reTime">
									<div className="row">
										<div className="col-md-12 mt-3 mb-2">
											<div className="starttime"><span className="f12 fw500 text-danger d-flex  align-items-center mt-2 " ><LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<div className="col-12 col-md-6 col-lg-4  pe-3">
													<MobileDateTimePicker
														variant="outlined"
														label="ReOpen/Start Date "
														size="small"
														name="reopenDate"
														id="reopenDate"
														timezone={userDetail?.timeZone}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik_Reinvite.values.reopenDate || null}
														className="w-100 f14"
														slotProps={{
															textField: {
																variant: "outlined",
																size: "small",
																InputLabelProps: { shrink: true },
																error:
																	formik_Reinvite.touched.reopenDate &&
																	Boolean(formik_Reinvite.errors.reopenDate),
																helperText:
																	formik_Reinvite.touched.reopenDate &&
																	formik_Reinvite.errors.reopenDate,
															},
															actionBar: {
																actions: ["clear", "cancel", "accept"],
															},
														}}
														onChange={(newValue) => {
															formik_Reinvite.setFieldValue(
																"reopenDate",
																newValue
															);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>
												<div className="col-12 col-md-6 col-lg-4 ps-3">
													<MobileDateTimePicker
														variant="outlined"
														label="End Date*"
														size="small"
														name="deadlineDate"
														id="deadlineDate"
														timezone={userDetail?.timeZone}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik_Reinvite.values.deadlineDate || null}
														className="w-100 f14"
														slotProps={{
															textField: {
																variant: "outlined",
																size: "small",
																InputLabelProps: { shrink: true },
																error:
																	formik_Reinvite.touched.deadlineDate &&
																	Boolean(formik_Reinvite.errors.deadlineDate),
																helperText:
																	formik_Reinvite.touched.deadlineDate &&
																	formik_Reinvite.errors.deadlineDate,
															},
															actionBar: {
																actions: ["clear", "cancel", "accept"],
															},
														}}
														onChange={(newValue) => {
															formik_Reinvite.setFieldValue(
																"deadlineDate",
																newValue
															);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>
												{rfqtype == "closed" && <div className="col-12 col-md-6 col-lg-4 ps-3">
													<MobileDateTimePicker
														variant="outlined"
														label="Bid Open Date/Time"
														size="small"
														name="bidOpeningDate"
														id="bidOpeningDate"
														timezone={userDetail?.timeZone}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik_Reinvite.values.bidOpeningDate || null}
														className="w-100 f14"
														slotProps={{
															textField: {
																variant: "outlined",
																size: "small",
																InputLabelProps: { shrink: true },
																error:
																	formik_Reinvite.touched.deadlineDate &&
																	Boolean(formik_Reinvite.errors.deadlineDate),
																helperText:
																	formik_Reinvite.touched.deadlineDate &&
																	formik_Reinvite.errors.deadlineDate,
															},
															actionBar: {
																actions: ["clear", "cancel", "accept"],
															},
														}}
														onChange={(newValue) => {
															formik_Reinvite.setFieldValue(
																"bidOpeningDate",
																newValue
															);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>}
											</LocalizationProvider> </span></div>

										</div>
									</div>
								</div>}
								<div className="reTable">
									{<div className="row">
										<div className="col-md-12">
											<TextField
												id="standard-search"
												label="Search Vendors"
												type="search"
												className="w-100 m"
												size="small"
												variant="standard"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
											/>
										</div>
									</div>}
									{<div className="row">
										<div className="col-md-12 mt-2">
											<div className="reMainTable">
												<Table bordered hover >
													<thead className="rethead">
														<tr>
															<th style={
																{ width: "6%" }
															}><Checkbox className="p-0" size="medium" onChange={(e) => {


																handleReinviteAll(e.target.checked)
															}}



																/></th>
															<th>Supplier</th>
															{/* <th style={{width:"4%"}}>Status</th> */}
															<th style={{ width: "15%" }}>Current Version</th>
															<th style={{ width: "40%" }}>Remarks</th>
														</tr>
													</thead>
													<tbody className="retr">

														{supplierlist?.filter((x) => {
															return x.version == EventHeaderDetails.version && x.status == "Closed"
														})
															?.filter((v) => {
																if (!searchQuery) {
																	return true; // If searchQuery is empty, return all items
																}
																return (
																	v?.companyName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.contactPerson?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.emailId?.toLowerCase()?.includes(searchQuery?.toLowerCase())
																);
															})
															.map((v, index) => {

																return (

																	<tr key={index}>
																		<td width={10}>
																			{v?.reinvitechecked == true ? <Checkbox className="p-0" checked={true} size="medium" onChange={(e) => {

																				handleReinviteCheck(v, e.target.checked)
																			}} /> : <Checkbox className="p-0" checked={false} size="medium" onChange={(e) => {

																				handleReinviteCheck(v, e.target.checked)
																			}} />}
																		</td>
																		<td width={40}>{`${v.companyName}|${v.contactPerson}|${v.emailId}`}</td>
																		{/* <td width={10}>                                                      
			{v?.status =="Closed" }
            </td> */}
																		<td width={10}>{v?.version}</td>
																		<td width={40}>
																			<TextField
																				variant="outlined"
																				multiline
																				minRows={2}
																				maxRows={4}
																				fullWidth
																				placeholder="Enter remarks here"
																				defaultValue={v.reinviteremark || ''}
																				onBlur={(e) => {
																					v.reinviteremark = e.target.value;
																				}}
																				sx={{
																					backgroundColor: '#fff',
																					borderRadius: 1,
																					mt: 1,
																					mb: 1,
																					'& .MuiOutlinedInput-root': {
																						padding: '8px',
																					},
																					'& .MuiInputLabel-root': {
																						fontSize: 14,
																					},
																				}}
																			/>
																		</td>
																	</tr>
																)


															})}
													</tbody>
												</Table>

											</div>
										</div>
									</div>}

									<div className="row mt-2">
										<div className="col-md-12 mb-3 d-flex justify-content-end">
											<LoadingButton
												loading={loading}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
												disabled={supplierlist && supplierlist?.filter(x => x?.reinvitechecked).length == 0}
											>
												<span>Reinvite Supplier</span>
											</LoadingButton>
										</div>
									</div>
								</div>
							</div>
						</form>


					</div>
				</Drawer>
				{/* Drawer for Re-open*/}
				<Drawer
					anchor="right"
					open={openDrawer.reOpenSupplier}
					onClose={() => toggleDrawer("reOpenSupplier", false)}
				>
					<div
						style={{
							width: 800,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Reopen Supplier Quote</div>
								<IconButton
									onClick={() => toggleDrawer("reOpenSupplier", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
							<div className="p-3">

								{openDrawer.reInviteSupplier && <div className="reTime">
									<div className="row">
										<div className="col-md-12 mt-3 mb-2">
											<div className="starttime"><span className="f12 fw500 text-danger d-flex justify-content-between align-items-center mt-2 " ><LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<div className="col-12 col-md-6 col-lg-4  pe-3">
													<MobileDateTimePicker
														variant="outlined"
														label="ReOpen Date "
														size="small"
														name="reopenDate"
														id="reopenDate"
														timezone={userDetail?.timeZone}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik_Reinvite.values.reopenDate || null}
														className="w-100 f14"
														slotProps={{
															textField: {
																variant: "outlined",
																size: "small",
																InputLabelProps: { shrink: true },
																error:
																	formik_Reinvite.touched.reopenDate &&
																	Boolean(formik_Reinvite.errors.reopenDate),
																helperText:
																	formik_Reinvite.touched.reopenDate &&
																	formik_Reinvite.errors.reopenDate,
															},
															actionBar: {
																actions: ["clear", "cancel", "accept"],
															},
														}}
														onChange={(newValue) => {
															formik_Reinvite.setFieldValue(
																"reopenDate",
																newValue
															);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>
												<div className="col-12 col-md-6 col-lg-4 ps-3">
													<MobileDateTimePicker
														variant="outlined"
														label="Deadline Date "
														size="small"
														name="deadlineDate"
														id="deadlineDate"
														timezone={userDetail?.timeZone}
														minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
														value={formik_Reinvite.values.deadlineDate || null}
														className="w-100 f14"
														slotProps={{
															textField: {
																variant: "outlined",
																size: "small",
																InputLabelProps: { shrink: true },
																error:
																	formik_Reinvite.touched.deadlineDate &&
																	Boolean(formik_Reinvite.errors.deadlineDate),
																helperText:
																	formik_Reinvite.touched.deadlineDate &&
																	formik_Reinvite.errors.deadlineDate,
															},
															actionBar: {
																actions: ["clear", "cancel", "accept"],
															},
														}}
														onChange={(newValue) => {
															formik_Reinvite.setFieldValue(
																"deadlineDate",
																newValue
															);
														}}
														format={getDateFormatPatteronLocale(userDetail)}
														ampm={userampm(userDetail)}
													/>
												</div>
											</LocalizationProvider> </span></div>

										</div>
									</div>
								</div>}
								<div className="reTable">
									<div className="row">
										<div className="col-md-12">
											<TextField
												id="standard-search"
												label="Search Vendors"
												type="search"
												className="w-100 m"
												size="small"
												variant="standard"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
											/>
										</div>
									</div>
									<div className="row">
										<div className="col-md-12 mt-2">
											<div className="reMainTable">
												{/* <Table striped bordered hover > */}
												<Table bordered hover >
													<thead className="rethead">
														<tr>
															<th style={
																{ width: "4%" }
															}><Checkbox className="p-0" size="medium" onChange={(e) => {


																handleReOpenAll(e.target.checked)
															}}


																/></th>
															<th>Supplier</th>
															<th style={{ width: "5%" }}>Status</th>
															<th style={{ width: "15%" }}>Current Version</th>
															<th style={{ width: "40%" }}>Remarks</th>
														</tr>
													</thead>
													<tbody className="retr">

														{supplierlist?.filter(x => x.version == EventHeaderDetails.version && x.status != "Open" && x.status != "Regretted")
															?.filter((v) => {
																if (!searchQuery) {
																	return true; // If searchQuery is empty, return all items
																}
																return (
																	v?.companyName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.contactPerson?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.emailId?.toLowerCase()?.includes(searchQuery?.toLowerCase())
																);
															})

															?.map((v, index) => {

																return (

																	<tr key={index}>
																		<td width={10}>
																			{v?.reinvitechecked == true ? <Checkbox className="p-0" checked={true} size="medium" onChange={(e) => {

																				handleReinviteCheck(v, e.target.checked)
																			}}



																			/> : <Checkbox className="p-0" checked={false} size="medium" onChange={(e) => {

																				handleReinviteCheck(v, e.target.checked)
																			}} />}
																		</td>
																		<td width={40}>{`${v.companyName}|${v.contactPerson}|${v.emailId}`}</td>
																		<td width={10}>
																			{v?.status != "Open" ? <Tooltip title={v?.submissionDate ? formatDateViaLocale(v?.submissionDate, "en-GB",
																				formattimeoption) : ""}><div className="restatus">Quoted</div></Tooltip> : v?.status == "Revert" ? <div className="restatus">
																					Reverted</div> : <div className="restatus">
																				Not Quoted </div>}
																		</td>
																		<td width="5%">{`${v.version}`}</td>
																		<td width={40}>
																			<TextField
																				variant="outlined"
																				multiline
																				minRows={2}
																				maxRows={4}
																				fullWidth
																				placeholder="Remarks"
																				onBlur={(e) => {

																					v.reinviteremark = e.target.value
																				}} />
																		</td>
																	</tr>
																)


															})}
													</tbody>
												</Table>

											</div>
										</div>
									</div>
									<div className="row mt-2">
										<div className="col-md-12 mb-3 d-flex justify-content-end">
											<LoadingButton
												loading={loading}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
												disabled={supplierlist && supplierlist?.filter(x => x?.reinvitechecked).length == 0}
											>
												<span>Reopen</span>
											</LoadingButton>
										</div>
									</div>
								</div>
							</div>
						</form>


					</div>
				</Drawer>

				{/* Drawer for Send Reminder*/}
				<Drawer
					anchor="right"
					open={openDrawer.NotifySupplier}
					onClose={() => toggleDrawer("NotifySupplier", false)}
				>
					<div
						style={{
							width: 800,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Notify Supplier</div>
								<IconButton
									onClick={() => {
										toggleDrawer("NotifySupplier", false)

									}
									}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
							<div className="p-3">
								<div className="reTable">
									<div className="row">
										<div className="col-md-12">
											<TextField
												id="standard-search"
												label="Search Vendors"
												type="search"
												className="w-100 m"
												size="small"
												variant="standard"
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
											/>
										</div>
									</div>
									<div className="row">
										<div className="col-md-12 mt-2">
											<div className="reMainTable">
												<Table bordered hover>
													<thead className="rethead">
														<tr>
															<th style={{ width: "4%" }}>
																<Checkbox
																	className="p-0"
																	size="medium"
																	onChange={(e) => handleReminderAll(e.target.checked)}
																/>
															</th>
															<th>Supplier</th>
															<th style={{ width: "4%" }}>Status</th>
															<th style={{ width: "20%" }}>Current Version</th>
															<th style={{ width: "40%" }}>Remarks</th>
														</tr>
													</thead>
													<tbody className="retr">
														{supplierlist
															?.filter((x) => {
																// if (openDrawer.NotifySupplier) {
																// 	return x
																// }
																return x.version == EventHeaderDetails.version && x.status != "Closed" && x.status != "Regretted"
															}

															)
															?.filter((v) => {
																if (!searchQuery) {
																	return true; // If searchQuery is empty, return all items
																}
																return (
																	v?.companyName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.contactPerson?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.emailId?.toLowerCase()?.includes(searchQuery?.toLowerCase())
																);
															})
															.map((v, index) => {
																return (
																	<tr key={index}>
																		<td width={10}>
																			{v?.reinvitechecked == true ? (
																				<Checkbox
																					className="p-0"
																					checked={true}
																					size="medium"
																					onChange={(e) => handleReinviteCheck(v, e.target.checked)}
																				/>
																			) : (
																				<Checkbox
																					className="p-0"
																					checked={false}
																					size="medium"
																					onChange={(e) => handleReinviteCheck(v, e.target.checked)}
																				/>
																			)}
																		</td>
																		<td width={40}>{`${v.companyName}|${v.contactPerson}|${v.emailId}`}</td>
																		<td width={10}>
																			{v?.status == "Closed" ? (
																				<Tooltip
																					title={
																						v?.submissionDate
																							? formatDateViaLocale(v?.submissionDate, "en-GB", formattimeoption)
																							: ""
																					}
																				>
																					<div className="restatus">Quoted</div>
																				</Tooltip>
																			) : v?.status == "Revert" ? (
																				<div className="restatus">Reverted</div>
																			) : (
																				<div className="restatus">Not Quoted</div>
																			)}
																		</td>
																		<td width={10}>{`${v.version}`}</td>
																		<td width={40}>
																			<TextField

																				variant="outlined"
																				multiline
																				minRows={2}
																				maxRows={4}
																				fullWidth
																				// className="formulaEditor w-100"
																				placeholder="Remarks"
																				onBlur={(e) => {
																					v.reinviteremark = e.target.value;
																				}}
																				sx={{
																					backgroundColor: '#fff',
																					borderRadius: 1,
																					mt: 1,
																					mb: 1,
																					'& .MuiOutlinedInput-root': {
																						padding: '8px',
																					},
																					'& .MuiInputLabel-root': {
																						fontSize: 14,
																					},
																				}}
																			/>
																		</td>
																	</tr>
																);
															})}

														{/* Show message if no suppliers match the query */}
														{supplierlist
															?.filter((x) => x.version == EventHeaderDetails.version && x.status == "Closed")
															?.filter((v) => {
																if (!searchQuery) {
																	return true;
																}
																return (
																	v?.companyName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.contactPerson?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
																	v?.emailId?.toLowerCase()?.includes(searchQuery?.toLowerCase())
																);
															}).length === 0 && !openDrawer.NotifySupplier && (
																<tr>
																	<td colSpan={5} style={{ textAlign: "center" }}>
																		<div>No suppliers found</div>
																	</td>
																</tr>
															)}
													</tbody>
												</Table>
											</div>
										</div>
									</div>
									<div className="row mt-2">
										<div className="col-md-12 mb-3 d-flex justify-content-end">
											<LoadingButton
												loading={loading}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
												disabled={supplierlist && supplierlist?.filter((x) => x?.reinvitechecked).length == 0}
											>
												{openDrawer.NotifySupplier && <span>Send Notification</span>}
												{!openDrawer.NotifySupplier && <span>Reopen</span>}
											</LoadingButton>
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</Drawer>


				{/* Drawer for Surrogate Supplier*/}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.surrogateSupplier} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("surrogateSupplier", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 600,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Surrogate Supplier </div>
								<IconButton
									onClick={() => {
										toggleDrawer("surrogateSupplier", false)

										formik_Surrogate.resetForm()
									}




									}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_Surrogate.handleSubmit} autoComplete="off">
							<DialogContent style={{ minWidth: "300px" }}>

								<div className="row mt-2 ">
									<div className="col-12 mb-4">
										<Autocomplete
											id="supplierforsurrogate"
											name="Supplier"
											size="small"
											className="w-100 f12"
											options={supplierlist
												?.filter((x) => x.version == EventHeaderDetails.version && x.status != "Closed" && x.status != "Regretted") || []}
											getOptionLabel={(option) =>

												`${option.contactPerson} - ${option.emailId} | ${option.companyName}`
											}
											value={formik_Surrogate.values.supplier ?? null}
											onChange={(event, value) => {

												formik_Surrogate.setFieldValue("supplier", value)
											}}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Supplier"
													variant="outlined"
													error={formik_Surrogate.touched.supplier && Boolean(formik_Surrogate.errors.supplier)}
													helperText={formik_Surrogate.touched.supplier && formik_Surrogate.errors.supplier}
												/>
											)}
										/>
									</div>

									<div className="col-12 mb-4">

										<TextFieldCell
											id="surrogatename"
											name="surrogatename"
											label="Surrogater Name*"
											placeholder=""
											maxLength={200}
											value={formik_Surrogate.values.surrogatename}
											onChange={formik_Surrogate.handleChange}
											error={
												formik_Surrogate.touched.surrogatename &&
												Boolean(formik_Surrogate.errors.surrogatename)
											}
											helperText={
												formik_Surrogate.touched.surrogatename &&
												formik_Surrogate.errors.surrogatename
											}
											InputProps={{
												endAdornment: formik_Surrogate.values.surrogatename && (
													<InputAdornment position="end">
														<Typography
															variant="body2"
															color="textSecondary"
														>
															{formik_Surrogate.values.surrogatename.length}/200
														</Typography>
													</InputAdornment>
												),
											}}
										/>
									</div>
									<div className="col-12 mb-4">

										<TextFieldCell
											id="surrogateemail"
											name="surrogateemail"
											label="Surrogater Email*"
											placeholder=""
											maxLength={200}
											value={formik_Surrogate.values.surrogateemail}
											onChange={formik_Surrogate.handleChange}
											error={
												formik_Surrogate.touched.surrogateemail &&
												Boolean(formik_Surrogate.errors.surrogateemail)
											}
											helperText={
												formik_Surrogate.touched.surrogateemail &&
												formik_Surrogate.errors.surrogateemail
											}
											InputProps={{
												endAdornment: formik_Surrogate.values.surrogateemail && (
													<InputAdornment position="end">
														<Typography
															variant="body2"
															color="textSecondary"
														>
															{formik_Surrogate.values.surrogateemail.length}/200
														</Typography>
													</InputAdornment>
												),
											}}
										/>
									</div>
									<div className="col-12 mb-4">

										<TextFieldCell
											id="surrogateReason"
											name="surrogateReason"
											label="Remark"
											placeholder=""
											maxLength={200}
											value={formik_Surrogate.values.surrogateReason}
											onChange={formik_Surrogate.handleChange}
											error={
												formik_Surrogate.touched.surrogateReason &&
												Boolean(formik_Surrogate.errors.surrogateReason)
											}
											helperText={
												formik_Surrogate.touched.surrogateReason &&
												formik_Surrogate.errors.surrogateReason
											}
											InputProps={{
												endAdornment: formik_Surrogate.values.surrogateReason && (
													<InputAdornment position="end">
														<Typography
															variant="body2"
															color="textSecondary"
														>
															{formik_Surrogate.values.surrogateReason.length}/200
														</Typography>
													</InputAdornment>
												),
											}}
										/>
									</div>
								</div>

							</DialogContent>
							<DialogActions>
								<LoadingButton color="btn"
									onClick={() => toggleDrawer("surrogateSupplier", false)}
								>Cancel</LoadingButton>
								<LoadingButton loading={loading} type="submit" variant="contained" autoFocus>
									Surrogate
								</LoadingButton>
							</DialogActions>
						</form>


					</div>
				</Drawer>

				{/* Drawer for Reinitiate Event*/}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.ReinitiateEvent} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("ReinitiateEvent", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 600,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Reinitiate/Update RFQ  </div>
								<IconButton
									onClick={() => toggleDrawer("ReinitiateEvent", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>

						<DialogTitle>{"Are you sure?"}</DialogTitle>
						<DialogContent style={{ minWidth: "300px" }}>

							<DialogContentText>
								Are you sure you want to update the event? This action may trigger a reinitiation of the RFQ process.
							</DialogContentText>

						</DialogContent>
						<DialogActions>
							<LoadingButton color="btn"
								onClick={() => toggleDrawer("ReinitiateEvent", false)}
							>Cancel</LoadingButton>
							<LoadingButton loading={loading} type="button" variant="contained" onClick={handleReinitiateUpdate} autoFocus>
								Reinitiate
							</LoadingButton>
						</DialogActions>



					</div>
				</Drawer>
				{/* Drawer for Open Sealed Bid*/}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.OpenSealedBid} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("OpenSealedBid", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 600,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Open Sealed Bid  </div>
								<IconButton
									onClick={() => toggleDrawer("OpenSealedBid", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>

						<DialogTitle>{"Are you sure?"}</DialogTitle>
						<DialogContent style={{ minWidth: "300px" }}>

							<DialogContentText>
								Are you sure you want to open Sealed Bid ?
							</DialogContentText>

						</DialogContent>
						<DialogActions>
							<LoadingButton color="btn"
								onClick={() => toggleDrawer("OpenSealedBid", false)}
							>Cancel</LoadingButton>
							<LoadingButton loading={loading} type="button" variant="contained" onClick={handleOpenSealedBid} autoFocus>
								Open Sealed Bid
							</LoadingButton>
						</DialogActions>



					</div>
				</Drawer>
				{/* Drawer for Extend  Event*/}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.extendEvent} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("extendEvent", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 600,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Extend RFQ  </div>
								<IconButton
									onClick={() => toggleDrawer("extendEvent", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">

							<DialogContent style={{ minWidth: "300px" }}>
								<DialogContentText>


									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<div className="row mt-2">
											<div className="col-12 col-md-12 col-lg-12 mb-3">
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
													<CalendarIcon sx={{ color: '#6c757d', fontSize: 20 }} />
													<Box>
														<Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 500, textTransform: 'uppercase', display: 'block', lineHeight: 1.2 }}>
															END DATE
														</Typography>
														<Typography variant="body2" sx={{ color: '#212529', fontWeight: 400, mt: 0.5 }}>
															{enddate ? formatDateViaLocale(enddate, userDetail) : 'N/A'}
														</Typography>
													</Box>
												</Box>
											</div>
											<div className="col-12 col-md-12 col-lg-12">
												<MobileDateTimePicker
													variant="outlined"
													label="Extend Date *"
													size="small"
													name="deadlineDate"
													id="deadlineDate"
													timezone={userDetail?.timeZone}
													minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
													value={formik_Reinvite.values.deadlineDate || null}
													className="w-100 f14"
													slotProps={{
														textField: {
															variant: "outlined",
															size: "small",
															InputLabelProps: { shrink: true },
															error:
																formik_Reinvite.touched.deadlineDate &&
																Boolean(formik_Reinvite.errors.deadlineDate),
															helperText:
																formik_Reinvite.touched.deadlineDate &&
																formik_Reinvite.errors.deadlineDate,
														},
														actionBar: {
															actions: ["clear", "cancel", "accept"],
														},
													}}
													onChange={(newValue) => {
														formik_Reinvite.setFieldValue(
															"deadlineDate",
															newValue
														);
													}}
													format={getDateFormatPatteronLocale(userDetail)}
													ampm={userampm(userDetail)}
												/>
											</div>
										</div>

									</LocalizationProvider>


								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<LoadingButton color="btn" onClick={() => toggleDrawer("extendEvent", false)}>Cancel</LoadingButton>
								<LoadingButton
									loading={loading}
									variant="contained"
									type="submit"
									autoFocus
								>
									Extend
								</LoadingButton>
							</DialogActions>
						</form>





					</div>
				</Drawer>
				{/* Drawer for Open Date*/}
				<Drawer
					anchor="right" // Drawer position (right in this case)
					open={openDrawer.openDate} // Open this drawer if state is true for 'addsupplier'
					onClose={() => toggleDrawer("openDate", false)} // Close when clicked outside or on close button
				>
					<div
						style={{
							width: 600,

							display: "flex",
							flexDirection: "column",

						}}
					>
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Update Open Date  </div>
								<IconButton
									onClick={() => toggleDrawer("openDate", false)}
									size="small"
									edge="start"
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20 text-white" />
								</IconButton>
							</div>
						</Box>
						<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">

							<DialogContent style={{ minWidth: "300px" }}>
								<DialogContentText>


									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<div className="row mt-2">
											<div className="col-12 col-md-12 col-lg-12">
												<MobileDateTimePicker
													variant="outlined"
													label="Open Date *"
													size="small"
													name="deadlineDate"
													id="deadlineDate"
													timezone={userDetail?.timeZone}
													minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
													value={formik_Reinvite.values.deadlineDate || null}
													className="w-100 f14"
													slotProps={{
														textField: {
															variant: "outlined",
															size: "small",
															InputLabelProps: { shrink: true },
															error:
																formik_Reinvite.touched.deadlineDate &&
																Boolean(formik_Reinvite.errors.deadlineDate),
															helperText:
																formik_Reinvite.touched.deadlineDate &&
																formik_Reinvite.errors.deadlineDate,
														},
														actionBar: {
															actions: ["clear", "cancel", "accept"],
														},
													}}
													onChange={(newValue) => {
														formik_Reinvite.setFieldValue(
															"deadlineDate",
															newValue
														);
													}}
													format={getDateFormatPatteronLocale(userDetail)}
													ampm={userampm(userDetail)}
												/>
											</div>
										</div>

									</LocalizationProvider>


								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<LoadingButton color="btn" onClick={() => toggleDrawer("openDate", false)}>Cancel</LoadingButton>
								<LoadingButton
									loading={loading}
									variant="contained"
									type="submit"
									autoFocus
								>
									Open Date
								</LoadingButton>
							</DialogActions>
						</form>





					</div>
				</Drawer>
				{/* Drawer for View  History*/}
				<Drawer
					anchor='right'
					open={openDrawer.HistoryEvent}
					onClose={() => toggleDrawer("HistoryEvent", false)}

				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 980 }, }} >
						<div className='flex flex-col'>
							<Box className='bgheaderCards'>
								<div className='d-flex align-items-center justify-content-between pt-2 pb-2'>
									<div className='ms-3 text-white'>
										History
									</div>
									<div>
										<IconButton
											onClick={() => toggleDrawer("HistoryEvent", false)}
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
								<div className='row'>
									<div className='col-12 col-md-5 border rounded'>
										{Auditdata?.length === 0 ? (
											<Typography>No audit data available.</Typography>
										) : (
											// Group actions by actionDate
											Auditdata && Auditdata.length > 0 && Object?.entries(
												Auditdata?.reduce((acc, item) => {
													const date = new Date(item.actionDate).toLocaleDateString(); // Format date
													if (!acc[date]) acc[date] = [];
													acc[date].push(item);
													return acc;
												}, {})
											).map(([date, actions]) => (
												<Accordion
													key={date}
													expanded={expanded === date}
													onChange={handleAccordionChange(date)}
													className="rounded custom-accordion"
													sx={{
														border: 'none', // Remove border

														boxShadow: 'none', // Remove box-shadow if any
													}}
												>
													<AccordionSummary
														expandIcon={<ExpandMoreIcon />}
														aria-controls={`${date}-content`}
														id={`${date}-header`}
														style={{ minHeight: '35px', padding: "0px", backgroundColor: "inherit", }}

														classes={{

															content: 'custom-summary-content', // Use a custom class for additional styling
														}}
													>
														<Typography>{date}</Typography>
													</AccordionSummary>
													<AccordionDetails className="p-0">
														{actions.map((item) => (
															<div key={item.id} className="d-flex  p-1">
																<div className='col-md-1' title={item?.userName}>
																	<Avatar sx={{ width: 34, height: 34 }}>{getInitials(item?.userName)}</Avatar>
																</div>
																<div className='col-md-11'>
																	<div className="row">
																		<div className="text-truncate ps-4" onClick={(event) => handleInfoClick(event, item.id)} style={{ cursor: "pointer" }}>
																			{cleanAdditionalInfo(item?.newValue)}
																		</div>
																		<div className="f11 text-end d-flex justify-content-between text-muted ps-4">
																			<div className='text-start'>
																				{item?.propertyName}
																			</div>
																			{new Date(item.actionDate).toLocaleTimeString()}
																		</div>
																	</div>
																</div>
															</div>
														))}
													</AccordionDetails>
												</Accordion>

											))
										)}
									</div>

									<div className='col-12 col-md-7 ps-1 ms-0'>
										{selectedItem && (
											<div className='border rounded p-2'>

												<div style={{ fontSize: '14px', fontWeight: 'normal', lineHeight: '1.6' }}>
													<div style={{ marginBottom: '8px' }} className='d-flex align-items-center'>
														<Avatar sx={{ width: 34, height: 34 }}>{getInitials(selectedItem.userName)}</Avatar>
														<div>
															<strong style={{ fontWeight: '500' }} className='ms-2'>Property Name:</strong> {selectedItem.propertyName}
															<strong style={{ fontWeight: '500' }} className='ms-2'>Action Date:</strong> {new Date(selectedItem.actionDate).toLocaleString()}

														</div>
													</div>
													<div style={{ marginBottom: '8px' }}>
														<strong style={{ fontWeight: '500' }}>Old Value:</strong>{' '}
														<span className='text-danger' dangerouslySetInnerHTML={{ __html: selectedItem.oldValue || 'N/A' }} />
													</div>
													<div style={{ marginBottom: '8px' }}>
														<strong style={{ fontWeight: '500' }}>New Value:</strong>{' '}
														<span className='text-success' dangerouslySetInnerHTML={{ __html: selectedItem.newValue || 'N/A' }} />
													</div>
													<div style={{ marginBottom: '8px' }}>
														<strong style={{ fontWeight: '500' }}>Additional Info:</strong>
														<div dangerouslySetInnerHTML={{ __html: selectedItem.additionalInfo }} />
													</div>
												</div>

											</div>
										)}
									</div>
								</div>
							</Box>
						</div>
					</Box>
				</Drawer>

			</div>

		</>

	);
};

export default RFQActionDrawer;
