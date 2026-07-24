import React, { useEffect, useState } from "react";
import CommonBottomDrawer from "../CommonBottomDrawer";
import { PEPagination } from '../RFQ/PEPagination';
import { Autocomplete, Avatar, Box, Checkbox, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, Menu, MenuItem, Pagination, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { CalendarToday as CalendarIcon, SearchOutlined } from "@mui/icons-material";
import { HiOutlineChevronDown, HiOutlineUserAdd, HiOutlineX } from "react-icons/hi";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
	buildQueryParams,
	formatDateViaLocale,
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
import { PETableSimple } from "../RFQ/PETable";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
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
import "../../assets/css/manage-rfq-v2.css";
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
	const [supplierSearchText, setSupplierSearchText] = useState('');

	useEffect(() => {
		if (openDrawer.addsupplier && customerid) {
			getTotalSupplier();
			getSupplierEventWise();
			getCategorylist();
		}
	}, [customerid, openDrawer])

	useEffect(() => {
		if (selectedSupplier.length > 0) {
			getTotalSupplier();
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

			let vendorItemAnalysisdata = res.data;
			setSelectedSupplier(vendorItemAnalysisdata ?? []);
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
			const filteredSuppliers = (res.data ?? []).filter((supplier) => {
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
		const normalizedSuppliers = newSupplier.map(s => ({
			...s,
			id: s.id ?? s.vendorId,
			rfqLoadingFactor: s.rfqLoadingFactor ?? []
		}));
		const safeEndDate = enddate && new Date(enddate) > new Date()
			? enddate
			: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
		const data = InvitedSupplierModal(
			normalizedSuppliers,
			parseInt(rfqid),
			safeEndDate,
			parseInt(customerid),
			userDetail,
			Version
		);

		if (!data || data.length === 0) {
			toast.error(`Please select a supplier before proceeding.`, {
				toastId: "supplierselection_error"
			});
			return;
		}

		setLoading(true);
		try {
			const invitedSuppliers = {
				rfqVendorDetails: data,
				activityId: parseInt(activityId) || 0,
				RFQId: parseInt(rfqid),
				CurrentStage: currentStage
			};

			let res;
			try {
				res = await apiClient.api.post(
					`/api/RFQVendorInvite/${rfqid}/Add`,
					invitedSuppliers,
					{ headers: { Authorization: `Bearer ${atoken}`, accept: 'application/json' } }
				);
			} catch (axiosErr) {
				const msg = axiosErr?.response?.data?.Message || axiosErr?.response?.data?.message || axiosErr?.message || 'Failed to add suppliers.';
				toast.error(msg, { toastId: 'addsupplier_error' });
				return;
			}

			if (res?.status === 200 || res?.status === 201) {
				toast.success("Suppliers added successfully.", { toastId: "addsupplier_success" });
				toggleDrawer("addsupplier", false);
			}
		} finally {
			setLoading(false);
		}
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
			const data = res.data;
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
				supplier.status != "Closed" && supplier.status != "Regretted"
					? { ...supplier, reinvitechecked: value } // update only filtered
					: supplier // keep others same
			)
		);
	};

	const handleReOpenAll = (value) => {
		setSupplierList(prev =>
			prev.map(supplier =>
				supplier.status != "Open" && supplier.status != "Regretted"
					? { ...supplier, reinvitechecked: value } // update only filtered
					: supplier // keep others same
			)
		);
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
				<CommonBottomDrawer
					open={openDrawer.addsupplier}
					onClose={() => toggleDrawer("addsupplier", false)}
					title="Add New Supplier"
					bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px', gap: '12px' }}
					actions={<>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted" onClick={() => toggleDrawer("addsupplier", false)}>Close</button>
						<button type="button" className="pe-btn pe-btn--primary" onClick={handleSaveNewSupplier}>Update</button>
					</>}
				>
					{/* Filters row */}
					<div className="rfq-v2-drawer-form" style={{ flexShrink: 0 }}>
						<div className="rfq-v2-drawer-grid">
							<div className="rfq-v2-drawer-field">
								<span className="rfq-v2-drawer-label">Category</span>
								<Autocomplete
									size="small"
									options={categoryList}
									fullWidth
									renderInput={(params) => (
										<TextField {...params} placeholder="Select category" />
									)}
									getOptionLabel={(option) => option.itemCategory ?? ""}
									isOptionEqualToValue={(option, value) => option.id === value?.id}
									value={selectedCategory}
									onChange={(e, newvalue) => {
										setSelectedCategory(newvalue);
										setSupplierSearchText('');
										handleSupplierWithCategory(newvalue);
									}}
								/>
							</div>
							<div className="rfq-v2-drawer-field">
								<span className="rfq-v2-drawer-label">Search Supplier</span>
								<TextField
									size="small"
									fullWidth
									placeholder="Search by name or email..."
									value={supplierSearchText}
									onChange={(e) => { setSupplierSearchText(e.target.value); setPageTS(1); }}
								/>
							</div>
						</div>
					</div>

					{/* Two-column supplier lists */}
					{(() => {
						const filteredRemaining = (remainingSupplier ?? []).filter(x => {
							if (!supplierSearchText) return true;
							const q = supplierSearchText.toLowerCase();
							return (
								(x?.contactPerson ?? '').toLowerCase().includes(q) ||
								(x?.email ?? '').toLowerCase().includes(q) ||
								(x?.companyName ?? '').toLowerCase().includes(q)
							);
						});
						const totalTSPages = Math.ceil(filteredRemaining.length / pageCount) || 1;
						const pagedRemaining = filteredRemaining.slice((pageTS - 1) * pageCount, pageTS * pageCount);
						const totalSSPages = Math.ceil((newSupplier?.length ?? 0) / pageCount) || 1;
						const pagedNew = (newSupplier ?? []).slice((pageSS - 1) * pageCount, pageSS * pageCount);
						const pageSizeOptions = [10, 25, 50];


						return (
							<div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
								{/* Remaining Suppliers */}
								<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
										<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Remaining Suppliers</span>
										<span style={{ background: '#2A68D3', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{filteredRemaining.length}</span>
										{selectedCategory && (
											<span style={{ background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '11px', fontWeight: 600, padding: '1px 8px' }}>{selectedCategory?.itemCategory}</span>
										)}
									</div>
									<div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
										{pagedRemaining.length === 0 ? (
											<div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No suppliers found</div>
										) : pagedRemaining.map((x, i) => (
											<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
												<button type="button" className="pe-icon-btn pe-icon-btn--add" style={{ flexShrink: 0 }} onClick={() => handleCheckRemainingSupplier(x)}>
													<HiOutlineUserAdd />
												</button>
												<div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
													<span style={{ fontWeight: 500 }}>{x?.contactPerson}</span>
													{' | '}{x?.email}
													{' | '}<span style={{ color: '#6b7280' }}>{x?.companyName}</span>
												</div>
											</div>
										))}
									</div>
									<PEPagination page={pageTS} pageSize={pageCount} totalRows={filteredRemaining.length} onPageChange={setPageTS} onPageSizeChange={(n) => { setPageCount(n); setPageTS(1); }} />
								</div>

								{/* New Suppliers */}
								<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
										<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>New Suppliers</span>
										<span style={{ background: '#2A68D3', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{newSupplier?.length ?? 0}</span>
									</div>
									<div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
										{pagedNew.length === 0 ? (
											<div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No suppliers added yet</div>
										) : pagedNew.map((x, i) => (
											<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
												<button type="button" className="pe-icon-btn pe-icon-btn--delete" style={{ flexShrink: 0 }} onClick={() => handleClearRemainingSupplier(x)}>
													<HiOutlineX />
												</button>
												<div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
													<span style={{ fontWeight: 500 }}>{x?.contactPerson}</span>
													{' | '}{x?.email}
													{' | '}<span style={{ color: '#6b7280' }}>{x?.companyName}</span>
												</div>
											</div>
										))}
									</div>
									<PEPagination page={pageSS} pageSize={pageCount} totalRows={newSupplier?.length ?? 0} onPageChange={setPageSS} onPageSizeChange={(n) => { setPageCount(n); setPageSS(1); }} />
								</div>
							</div>
						);
					})()}
				</CommonBottomDrawer>

				{/* Drawer for Re-invite*/}
				<CommonBottomDrawer
					open={openDrawer.reInviteSupplier}
					onClose={() => toggleDrawer("reInviteSupplier", false)}
					title="Reinvite RFQ"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("reInviteSupplier", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" disabled={!supplierlist?.filter(x => x?.reinvitechecked).length} onClick={() => formik_Reinvite.handleSubmit()}>Reinvite Supplier</LoadingButton>
					</>}
				>
					<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
						<div className="p-3">
							{openDrawer.reInviteSupplier && (
								<div className="rfq-v2-drawer-form" style={{ marginBottom: '16px' }}>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<div className="rfq-v2-drawer-grid">
											<div className="rfq-v2-drawer-field">
												<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Reopen / Start Date</span>
												<MobileDateTimePicker
													variant="outlined"
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
											<div className="rfq-v2-drawer-field">
												<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">End Date</span>
												<MobileDateTimePicker
													variant="outlined"
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
											{rfqtype == "closed" && (
												<div className="rfq-v2-drawer-field">
													<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Bid Open Date/Time</span>
													<MobileDateTimePicker
														variant="outlined"
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
												</div>
											)}
										</div>
									</LocalizationProvider>
								</div>
							)}
							<div className="reTable">
								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label">Search Vendor</span>
									<div className="rfq-v2-search-wrapper">
										<input
											className="rfq-v2-search"
											placeholder="Search vendor..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
										<SearchOutlined className="rfq-v2-search-icon" />
									</div>
								</div>
								<PETableSimple
									wrapperStyle={{ marginTop: 2 }}
									columns={[
										{
											key: '_check', label: '',
											width: '5%',
											renderHeader: () => <Checkbox className="p-0" size="small" onChange={(e) => handleReinviteAll(e.target.checked)} />,
											renderCell: (_, row) => <Checkbox className="p-0" size="small" checked={row.reinvitechecked === true} onChange={(e) => handleReinviteCheck(row, e.target.checked)} />,
										},
										{
											key: 'companyName', label: 'Supplier',
											renderCell: (_, row) => <>
												<div style={{ fontWeight: 500, color: '#111827', fontSize: 13 }}>{row.companyName}</div>
												<div style={{ fontSize: 12, color: '#6b7280' }}>{row.contactPerson} · {row.emailId}</div>
											</>,
										},
										{ key: 'version', label: 'Version', width: '12%', whiteSpace: 'nowrap' },
										{
											key: '_remarks', label: 'Remarks', width: '35%',
											renderCell: (_, row) => <TextField variant="outlined" multiline minRows={1} maxRows={3} fullWidth placeholder="Enter remarks here" defaultValue={row.reinviteremark || ''} onBlur={(e) => { row.reinviteremark = e.target.value; }} size="small" />,
										},
									]}
									rows={supplierlist?.filter(x => x.status == "Closed")
										?.filter(v => !searchQuery || v?.companyName?.toLowerCase()?.includes(searchQuery.toLowerCase()) || v?.contactPerson?.toLowerCase()?.includes(searchQuery.toLowerCase()) || v?.emailId?.toLowerCase()?.includes(searchQuery.toLowerCase())) ?? []}
									getRowKey={(row, i) => `${row.vendorId ?? i}`}
								/>
							</div>
						</div>
					</form>
				</CommonBottomDrawer>

				{/* Drawer for Re-open*/}
				<CommonBottomDrawer
					open={openDrawer.reOpenSupplier}
					onClose={() => toggleDrawer("reOpenSupplier", false)}
					title="Reopen Supplier Quote"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("reOpenSupplier", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" disabled={!supplierlist?.filter(x => x?.reinvitechecked).length} onClick={() => formik_Reinvite.handleSubmit()}>Reopen</LoadingButton>
					</>}
				>
					<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
						<div className="p-3">
							{openDrawer.reInviteSupplier && (
								<div className="rfq-v2-drawer-form" style={{ marginBottom: '16px' }}>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<div className="rfq-v2-drawer-grid">
											<div className="rfq-v2-drawer-field">
												<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Reopen Date</span>
												<MobileDateTimePicker
													variant="outlined"
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
											<div className="rfq-v2-drawer-field">
												<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Deadline Date</span>
												<MobileDateTimePicker
													variant="outlined"
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
								</div>
							)}
							<div className="reTable">
								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label">Search Vendor</span>
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
								<PETableSimple
									wrapperStyle={{ marginTop: 2 }}
									columns={[
										{
											key: '_check', label: '',
											width: '5%',
											renderHeader: () => <Checkbox className="p-0" size="small" onChange={(e) => handleReOpenAll(e.target.checked)} />,
											renderCell: (_, row) => <Checkbox className="p-0" size="small" checked={row.reinvitechecked === true} onChange={(e) => handleReinviteCheck(row, e.target.checked)} />,
										},
										{
											key: 'companyName', label: 'Supplier',
											renderCell: (_, row) => <>
												<div style={{ fontWeight: 500, color: '#111827', fontSize: 13 }}>{row.companyName}</div>
												<div style={{ fontSize: 12, color: '#6b7280' }}>{row.contactPerson} · {row.emailId}</div>
											</>,
										},
										{
											key: 'status', label: 'Status', width: '10%', whiteSpace: 'nowrap',
											renderCell: (_, row) => row?.status != "Open"
												? <Tooltip title={row?.submissionDate ? formatDateViaLocale(row?.submissionDate, "en-GB", formattimeoption) : ""}><div className="restatus">Quoted</div></Tooltip>
												: row?.status == "Revert" ? <div className="restatus">Reverted</div>
													: <div className="restatus">Not Quoted</div>,
										},
										{ key: 'version', label: 'Version', width: '10%', whiteSpace: 'nowrap' },
										{
											key: '_remarks', label: 'Remarks', width: '35%',
											renderCell: (_, row) => <TextField variant="outlined" multiline minRows={1} maxRows={3} fullWidth placeholder="Remarks" onBlur={(e) => { row.reinviteremark = e.target.value; }} size="small" />,
										},
									]}
									rows={supplierlist?.filter(x => x.status != "Open" && x.status != "Regretted")
										?.filter(v => !searchQuery || v?.companyName?.toLowerCase()?.includes(searchQuery.toLowerCase()) || v?.contactPerson?.toLowerCase()?.includes(searchQuery.toLowerCase()) || v?.emailId?.toLowerCase()?.includes(searchQuery.toLowerCase())) ?? []}
									getRowKey={(row, i) => `${row.vendorId ?? i}`}
								/>
							</div>
						</div>
					</form>
				</CommonBottomDrawer>

				{/* Drawer for Send Reminder*/}
				<CommonBottomDrawer
					open={openDrawer.NotifySupplier}
					onClose={() => toggleDrawer("NotifySupplier", false)}
					title="Notify Supplier"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("NotifySupplier", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" disabled={!supplierlist?.filter(x => x?.reinvitechecked).length} onClick={() => formik_Reinvite.handleSubmit()}>Send Notification</LoadingButton>
					</>}
				>
					<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
						<div className="rfq-v2-drawer-form" style={{ marginBottom: '16px' }}>
							<div className="rfq-v2-drawer-field">
								<span className="rfq-v2-drawer-label">Search Vendor</span>
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
						<PETableSimple
							wrapperStyle={{ marginTop: 12 }}
							columns={[
								{
									key: '_check', label: '',
									width: '5%',
									renderHeader: () => <Checkbox className="p-0" size="small" onChange={(e) => handleReminderAll(e.target.checked)} />,
									renderCell: (_, row) => <Checkbox className="p-0" size="small" checked={row.reinvitechecked === true} onChange={(e) => handleReinviteCheck(row, e.target.checked)} />,
								},
								{
									key: 'companyName', label: 'Supplier',
									renderCell: (_, row) => <>
										<div style={{ fontWeight: 500, color: '#111827', fontSize: 13 }}>{row.companyName}</div>
										<div style={{ fontSize: 12, color: '#6b7280' }}>{row.contactPerson} · {row.emailId}</div>
									</>,
								},
								{
									key: 'status', label: 'Status', width: '10%', whiteSpace: 'nowrap',
									renderCell: (_, row) => row?.status == "Closed"
										? <Tooltip title={row?.submissionDate ? formatDateViaLocale(row?.submissionDate, "en-GB", formattimeoption) : ""}><div className="restatus">Quoted</div></Tooltip>
										: row?.status == "Revert" ? <div className="restatus">Reverted</div>
											: <div className="restatus">Not Quoted</div>,
								},
								{ key: 'version', label: 'Version', width: '10%', whiteSpace: 'nowrap' },
								{
									key: '_remarks', label: 'Remarks', width: '35%',
									renderCell: (_, row) => <TextField variant="outlined" multiline minRows={1} maxRows={3} fullWidth placeholder="Remarks" onBlur={(e) => { row.reinviteremark = e.target.value; }} size="small" />,
								},
							]}
							rows={supplierlist?.filter(x => x.status != "Closed" && x.status != "Regretted")
								?.filter(v => !searchQuery || v?.companyName?.toLowerCase()?.includes(searchQuery.toLowerCase()) || v?.contactPerson?.toLowerCase()?.includes(searchQuery.toLowerCase()) || v?.emailId?.toLowerCase()?.includes(searchQuery.toLowerCase())) ?? []}
							getRowKey={(row, i) => `${row.vendorId ?? i}`}
						/>
					</form>
				</CommonBottomDrawer>

				{/* Drawer for Surrogate Supplier*/}
				<CommonBottomDrawer
					open={openDrawer.surrogateSupplier}
					onClose={() => toggleDrawer("surrogateSupplier", false)}
					title="Surrogate Supplier"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("surrogateSupplier", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" onClick={() => formik_Surrogate.handleSubmit()}>Surrogate</LoadingButton>
					</>}
				>
					<form onSubmit={formik_Surrogate.handleSubmit} autoComplete="off">
						<div className="rfq-v2-drawer-form">
							<div className="rfq-v2-drawer-grid">
								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Supplier</span>
									<Autocomplete
										id="supplierforsurrogate"
										name="Supplier"
										size="small"
										className="w-100 f12"
										options={supplierlist
											?.filter((x) => x.status != "Closed" && x.status != "Regretted") || []}
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
								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Surrogater Name</span>
									<TextFieldCell
										id="surrogatename"
										name="surrogatename"
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
							</div>

							<div className="rfq-v2-drawer-grid">
								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Surrogater Email</span>
									<TextFieldCell
										id="surrogateemail"
										name="surrogateemail"
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

								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label">Remark</span>
									<TextFieldCell
										id="surrogateReason"
										name="surrogateReason"
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
						</div>
					</form>
				</CommonBottomDrawer>

				{/* Drawer for Reinitiate Event*/}
				<CommonBottomDrawer
					open={openDrawer.ReinitiateEvent}
					onClose={() => toggleDrawer("ReinitiateEvent", false)}
					title="Reinitiate/Update RFQ"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("ReinitiateEvent", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" onClick={handleReinitiateUpdate}>Reinitiate</LoadingButton>
					</>}
				>
					<div className="rfq-v2-drawer-confirm">
						<p className="rfq-v2-drawer-confirm-title">Are you sure?</p>
						<p>Are you sure you want to update the event? This action may trigger a reinitiation of the RFQ process.</p>
					</div>
				</CommonBottomDrawer>

				{/* Drawer for Open Sealed Bid*/}
				<CommonBottomDrawer
					open={openDrawer.OpenSealedBid}
					onClose={() => toggleDrawer("OpenSealedBid", false)}
					title="Open Sealed Bid"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("OpenSealedBid", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" onClick={handleOpenSealedBid}>Open Sealed Bid</LoadingButton>
					</>}
				>
					<div className="rfq-v2-drawer-confirm">
						<p className="rfq-v2-drawer-confirm-title">Are you sure?</p>
						<p>Are you sure you want to open Sealed Bid?</p>
					</div>
				</CommonBottomDrawer>

				{/* Drawer for Extend  Event*/}
				<CommonBottomDrawer
					open={openDrawer.extendEvent}
					onClose={() => toggleDrawer("extendEvent", false)}
					title="Extend RFQ"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("extendEvent", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" onClick={() => formik_Reinvite.handleSubmit()}>Extend</LoadingButton>
					</>}
				>
					<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
						<div className="rfq-v2-drawer-form">
							<div className="rfq-v2-drawer-grid">
								<div className="rfq-v2-drawer-info-box">
									<CalendarIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
									<div className="rfq-v2-drawer-info-inner">
										<span className="rfq-v2-drawer-info-label">Current End Date</span>
										<span className="rfq-v2-drawer-info-value">{enddate ? formatDateViaLocale(enddate, userDetail) : 'N/A'}</span>
									</div>
								</div>
								<div className="rfq-v2-drawer-field">
									<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">New End Date</span>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<div>
											<MobileDateTimePicker
												variant="outlined"
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
									</LocalizationProvider>
								</div>
							</div>
						</div>
					</form>
				</CommonBottomDrawer>

				{/* Drawer for Open Date*/}
				<CommonBottomDrawer
					open={openDrawer.openDate}
					onClose={() => toggleDrawer("openDate", false)}
					title="Update Open Date"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => toggleDrawer("openDate", false)}>Close</button>
						<LoadingButton loading={loading} size="small" variant="contained" onClick={() => formik_Reinvite.handleSubmit()}>Open Date</LoadingButton>
					</>}
				>
					<form onSubmit={formik_Reinvite.handleSubmit} autoComplete="off">
						<div className="rfq-v2-drawer-form">
							<div className="rfq-v2-drawer-field">
								<span className="rfq-v2-drawer-label rfq-v2-drawer-label--required">Open Date</span>
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<div>
										<MobileDateTimePicker
											variant="outlined"
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
								</LocalizationProvider>
							</div>
						</div>
					</form>
				</CommonBottomDrawer>

				{/* Drawer for View  History*/}
				<CommonBottomDrawer
					open={openDrawer.HistoryEvent}
					onClose={() => toggleDrawer("HistoryEvent", false)}
					title="History"
					bodyStyle={{ overflowY: 'auto', flex: 1, padding: '16px' }}
					actions={<>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-muted" onClick={() => toggleDrawer("HistoryEvent", false)}>Close</button>
					</>}
				>
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
				</CommonBottomDrawer>
			</div>
		</>
	);
};

export default RFQActionDrawer;
