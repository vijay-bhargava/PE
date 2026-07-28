import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import { HiOutlineX, HiX, HiPlusSm, HiOutlineDotsHorizontal, HiPlus, HiOutlinePencil, HiPencilAlt, HiDotsVertical, HiCalculator, HiRefresh } from "react-icons/hi";
import {
	Autocomplete, Alert, Button, ButtonGroup,
	Checkbox, Dialog, DialogActions,
	DialogContent, DialogContentText, DialogTitle, Divider,
	FormControl, FormControlLabel, FormHelperText, FormLabel,
	InputAdornment, InputLabel, Menu, MenuItem, Radio, RadioGroup,
	Select, Stack, TextField, Tooltip, Typography, Badge,
	createFilterOptions, Card, CardHeader, CardContent,
} from "@mui/material";
import { Close, ExpandMore } from "@mui/icons-material";
import { Dropdown, DropdownButton, Modal } from "react-bootstrap";
import Drawer from "@mui/material/Drawer";
import Tabs from "@mui/material/Tabs";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Tab from "@mui/material/Tab";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import LoadingButton from "@mui/lab/LoadingButton";
import HistoryCell from "../../BaseCells/HistoryCell";
import ReactQuill from "react-quill";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuctionCTAddModal, IntegerRegex, InvitedSupplierForBidModal, findObjListByValueFromArray, getPayloadWithStage, getStageInfo, handlesaveAttachment, pullMessageCount, downloadExcelTemplate } from "../../../utils/common";
import { actionTypes, useStateValue } from "../../../store";
import { checkUTC, cleanAndConvertToArray, extractTextFromHTML, formatDateViaLocale2, getAuctionItemServiceFind, getAuctionManageFind, getCurrency, getDateFormatPatteronLocale, getLibraryOrgEntityFind, getPurchaseOrgList, scrollToTargetC, userampm } from "../../../utils/common/utility";
import { toast } from "react-toastify";
import AddEditCurrency from "../../../utils/common/AddEditCurrency";
import { BackButton, MemoizedEventStageFlow } from "../../../utils/common/component";
import { ApiClient, api } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import AttachmentWorkFlow from "../../BaseCells/attachmentworkflow";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ProductitemCell from "../RequestForQuotation/ProductitemCell";
import AddQuestionFormCell from "../RequestForQuotation/AddQuestionFormCell";
import AddProductsCell from "./AddProductsCell";
import { sanitizeInput } from "../../../utils/common/santize";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import SelectedSupplierCell from "../RequestForQuotation/SelectedSupplierCell";
import { FastApiClient } from "../../../FastApiClient";
import BidGeneralPreview from "./BidGeneralPreview";
import BidItemsTab from "./BidItemsTab";
import BidInviteSupplierTab from "./BidInviteSupplierTab";
import BidLoadingFactor from "./BidLoadingFactor";
import AuctionControl from "./AuctionControl";
import QueryList from "../../CommunucationHub/QueryList"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DataGrid } from "@mui/x-data-grid";
import EventAllocationScreen from "../../../components/Event/EventAllocationScreen";
import EventCommercialDrawer from "../../../components/Event/EventCommercialDrawer";
dayjs.extend(utc);
dayjs.extend(timezone);

const Auctions = ({ claimType, breadcrumb }) => {
	const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
	const checkedIcon = <CheckBoxIcon fontSize="small" />;
	const fileInputRef = useRef(null);
	const navigate = useNavigate();
	const apiClient = new ApiClient(api);

	const [{ atoken, customerid, roleClaims, userDetail, bidtype, eventType, eventId }, dispatch] =
		useStateValue();
	//console.log("userDetailuserDetail:", userDetail)
	const [loading, setLoading] = useState(false);
	const [modal1, setModal1] = useState(false);
	const [modalBaseCurr, setModalBaseCurr] = useState(false);
	const handleCloseModal1 = () => setModal1(false);
	const handleCloseBaseCurr = () => setModalBaseCurr(false);
	const [currencyList, setCurrencyList] = useState([]);
	const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);
	const CloseCurrencyModal = () => {
		console.log("CloseCurrencyModal called");
		setOpenCurrencyModal(false);
	};
	const handleCurrencyList = (list) => {
		console.log("handleCurrencyList called with:", list);
		setCurrencyList(list);
	};
	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [searchParams, setSearchParams] = useSearchParams();
	const [UOMMaster, setUOMMaster] = useState([]);
	const [bidItemsList, setbidItemsList] = useState([]);
	const [generaltermsDDl, setGeneraltermsDDl] = useState([]);
	const [commercialLibFind, setCommercialLibFind] = useState([]);
	const [idFromURL, setIdFromURL] = useState(null);

	const [value, setValue] = React.useState(1);
	const [isUserInitiatedTabChange, setIsUserInitiatedTabChange] = useState(false);
	const [stagelist, setStageList] = useState(null);
	const [stagearray, setStagearray] = useState([`Draft`]);
	const [currentStage, setCurrentStage] = useState(`Draft`);
	const [tempDataEditData, setTempDataEditData] = useState([]);
	const [tempDataForItemService, setTempDataForItemService] = useState([]);
	const [bidpreview, setBidPreview] = useState(true);
	const [modalcancelOpen, setModalCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [biderror, setBidError] = useState("");
	const location = useLocation();
	const [permissionManager, setPermissionManager] = useState(null);
	const [loadingPermissions, setLoadingPermissions] = useState(true);
	const [tabloading, setTabLoading] = useState(false)

	// Effective permission manager prefers event-level userAccess when present
	const effectivePermissionManager = React.useMemo(() => {
		try {
			if (tempDataEditData && tempDataEditData[0] && Array.isArray(tempDataEditData[0].userAccess) && tempDataEditData[0].userAccess.length > 0) {
				return new PermissionManager(tempDataEditData[0].userAccess);
			}
		} catch (err) {
			// ignore and fallback
		}
		return permissionManager;
	}, [tempDataEditData, permissionManager]);

	const canReadSuppliers = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;

	// Determine whether to show Access Denied for General tab content
	const canReadGeneralEarly = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
	const canCreateGeneralEarly = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
	const canEditGeneralEarly = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false;
	const showGeneralAccessDenied = !loadingPermissions && !canReadGeneralEarly && !canCreateGeneralEarly && !canEditGeneralEarly;

	const NFASOBRFQRef = React.createRef();
	const [modalAllocationOpen, setModalAllocationOpen] = useState(false);
	const [version, setVersion] = useState();

	// Example usage
	const stageInfo = getStageInfo(currentStage, stagelist);

	const handleChange = (event, newValue) => {
		setIsUserInitiatedTabChange(true);
		setValue(newValue);
		if (newValue == "5") {

			setSelectedMenuItem("Submit")
			if (newValue == "5" && stagelist?.some(item => item.currentStage == "Under Pre Approval")) {
				setApproverShow(true)
			}
		}
		else {
			setSelectedMenuItem("Save & Continue")
			setApproverShow(false)
		}
	};

	// Debug: Track modal state changes
	useEffect(() => {
		console.log("OpenCurrencyModal state changed to:", OpenCurrencyModal);
	}, [OpenCurrencyModal]);

	useEffect(() => {
		console.log("modalBaseCurr state changed to:", modalBaseCurr);
	}, [modalBaseCurr]);

	useEffect(() => {
		pullgetCurrency();
	}, [atoken]);

	useEffect(() => {
		if (value == 8 || value == "8") {
			// Check allocation status from EventAllocationScreen via ref
			if (NFASOBRFQRef.current && typeof NFASOBRFQRef.current.isAllocationSubmitted === 'function') {
				const submitted = NFASOBRFQRef.current.isAllocationSubmitted();
				if (submitted) {
					setSelectedMenuItem("Save & Close");
				} else {
					setSelectedMenuItem("Save");
				}
			} else {
				setSelectedMenuItem("Save");
			}
		}
		if (idFromURL == null) {
			setApproverShow(false);
		}
		else if (value == 5) {
			if (stagelist?.some(item => item.currentStage == "Under Pre Approval")) {
				setApproverShow(true);
			}
		}
	}, [value, idFromURL]);

	useEffect(() => {
		if (currentStage !== "Draft" && ["Open", "Running"].includes(tempDataEditData[0]?.stage) && value === 1 && !isUserInitiatedTabChange) {
			setValue(6)
			setApproverShow(false)
		}
	}, [tempDataEditData, currentStage, value, isUserInitiatedTabChange]);

	useEffect(() => {
		const urlparams = {
			EventType: "Auction",
			CustomerId: customerid,
			EventId: idFromURL || 0,
			OrgId: idFromURL ? (formik.values.purchOrgId?.id || 0) : 0,
			OrgGroupId: idFromURL ? (formik.values.purchGrpId?.id || 0) : 0,
			Version: version || 1
		};

		if (idFromURL) {
			getEventStages(urlparams);
		}
	}, [idFromURL]);

	// After permissions load, ensure current tab is accessible — if not, auto-select first accessible tab
	useEffect(() => {
		if (loadingPermissions) return;

		// Prefer event-level permissions (from tempDataEditData[0].userAccess) when available
		const getEffectivePermissionManager = () => {
			try {
				if (tempDataEditData && tempDataEditData[0] && Array.isArray(tempDataEditData[0].userAccess) && tempDataEditData[0].userAccess.length > 0) {
					return new PermissionManager(tempDataEditData[0].userAccess);
				}
			} catch (err) {
				// fallback to feature-level permissionManager
			}
			return permissionManager;
		};

		const canView = (tab) => {
			const pm = getEffectivePermissionManager();
			if (tab === 1) return (pm?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false) || (pm?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false) || (pm?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false);
			if (tab === 2) return (pm?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false) && idFromURL;
			if (tab === 3) return (pm?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.READ) ?? false) && idFromURL;
			if (tab === 4) return (pm?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false) && idFromURL;
			return true;
		};

		if (!canView(value)) {
			const order = [1, 2, 3, 4, 5, 6, 7, 8];
			const first = order.find(t => canView(t));
			if (first) setValue(first);
		}
	}, [loadingPermissions, permissionManager, idFromURL, value]);

	useEffect(() => {
		if (stagelist && stagelist.length > 0) {
			return;
		}
		const urlparams = {
			EventType: "Auction",
			CustomerId: customerid,
			EventId: 0,
			OrgId: 0,
			OrgGroupId: 0,
			Version: version || 1
		}
		getEventStages(urlparams);
	}, [])

	const getEventStages = async (urlparams) => {
		const queryParams = buildQueryParams(urlparams)
		const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
		if (res?.data?.result.length > 0) {
			const result = res?.data?.result?.filter((item) => item.stageSeq > 0)
			setStageList(result);
			const stagesarray = result?.map((item) => item.currentStage);
		}
	}

	//to handle param url query params based tab selection on initial loading
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tab = params.get("tab");
		if (tab) {
			handleTabQueries(tab)
		}
	}, [])

	const handleTabQueries = (tabValue) => {
		switch (tabValue) {
			case 'item':
				return setValue(2);
			// case 'report':
			// 	return tabReport();
			default:
				return '';
		}
	};

	const [state, setState] = useState({
		addProductDrawer: false,
		qusDrawer: false,
		surrogateDrawer: false,
		openInvoiceApproved: false,
	});

	const toggleDrawer = (anchor, open) => (event) => {
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		setState({ ...state, [anchor]: open });
		setItemEditTempData([]);
	};

	const [requestCell, setRequestCell] = useState({
		EventId: 0,
		EventType: "Auction",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
	});

	const updateRequestCell = (newEventId) => {
		setRequestCell((prevState) => ({
			...prevState,
			EventId: newEventId,
		}));
	};

	const [accessLevel, setAccessLevel] = useState("");

	useEffect(() => {
		const obj = findObjListByValueFromArray(
			roleClaims,
			claimType,
			`claimType`,
			`BID`
		);
		obj ? setAccessLevel(obj) : setAccessLevel("");
	}, []);

	// this role rights will be used in general tab only 
	useEffect(() => {
		getUserRoleRights();
	}, []);

	const getUserRoleRights = async () => {
		setLoadingPermissions(true);
		try {
			const obj = {
				FeatureName: "Auction",
				UserId: userDetail?.id,
				CreatedById: userDetail?.id
			}
			const queryParams = buildQueryParams(obj);
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);
			if (res) {
				const permManager = new PermissionManager(res?.data);
				setPermissionManager(permManager);
			}
		} catch (err) {
			console.error('getUserRoleRights error', err);
		} finally {
			setLoadingPermissions(false);
		}
	};

	// Note: avoid early returns here to keep hooks order stable; render skeleton inside JSX instead.


	const updateBidEndDate = (bidStDate, bidDuration) => {
		if (bidStDate && bidDuration > 0) {
			const newBidEndDate = dayjs(bidStDate).add(bidDuration, 'minute');  // Using Day.js to add minutes
			formik.setFieldValue('bidEndDate', newBidEndDate);  // Convert Day.js object back to native Date
		}
	};

	const updateBidDuration = (bidStDate, bidEndDate) => {
		if (bidStDate && bidEndDate) {
			const duration = dayjs(bidEndDate).diff(dayjs(bidStDate), 'minute');  // Get the difference in minutes using Day.js
			formik.setFieldValue('bidDuration', duration >= 0 ? duration : 0);
		}
	};

	const maxNow = new Date();

	const validationSchema = yup.object().shape({
		subject: yup
			.string("Enter Subject")
			.max(200, "Max 200 character")
			.required("Subject is required"),
		description: yup.string().test("valid-desc", function (description) {

			const descriptionobj = extractTextFromHTML(description);
			if (!description) {
				return this.createError({
					path: "description",
					message: "Description is required", // Custom error message
				});
			}
			if (descriptionobj.trim().length < 1) {
				// If the termandcondition is undefined, null, or empty, scroll to target and return an error
				scrollToTargetC("description");  // Scroll to the target element
				return this.createError({
					path: "description",
					message: "Description is required", // Custom error message
				});
			}
			return true; // Validation passes if termandcondition has content
		}),

		bidStDate: yup
			.date()
			.default(new Date(maxNow))
			.min(maxNow, `The date cannot be earlier than the current date`)
			.required("Bid Start Date/Time is required")
			.typeError("Bid Start Date/Time is required"),
		tnC: yup.string().test("valid-tc", function (tnC) {
			const termandconditionobj = extractTextFromHTML(tnC);
			if (!tnC) {
				return this.createError({
					path: "tnC",
					message: "Terms & Condition is required",
				});
			}
			if (termandconditionobj.trim().length < 1) {
				scrollToTargetC("tnC");
				return this.createError({
					path: "tnC",
					message: "Terms & Condition is required",
				});
			}
			return true;
		}),
	});

	const formik = useFormik({
		//enableReinitialize: true,
		initialValues: {
			id: 0,
			subject: "",
			description: "",
			baseCurrency:
				userDetail && userDetail?.defaultCurrency
					? userDetail?.defaultCurrency
					: "INR",
			bidStDate: null,
			bidEndDate: null,
			bidDuration: 0,
			tnC: "",
			bidClosingType: "A",
			bidSubTypeId: 81,
			showRankToVendor: bidtype?.id == 4 ? "N" : "Y",
			maximumExtension: -1,
			extensionDuration: 2,
			hideVendor: false,
			hidePrice: false,
			prebid: false,
			preBidStDate: null,
			preBidEndDate: null,
			quotesinWords: false,
			rankToVendorPost: false,
			noOfStaggerItems: 0,
			multicurrencytList: [],
			isMultiCurrency: false,
			hideQuote: false,
		},
		validationSchema: validationSchema,
		onSubmit: async (values) => {
			try {

				if (formik.values.bidDuration < 1 && formik.values.bidClosingType !== 'S' && formik.values.bidSubTypeId !== 82) {
					formik.setFieldError('bidDuration', 'Bid duration is required');
					return;
				}
				if (formik.values.extensionDuration < 1 && formik.values.extensionDuration == '') {
					formik.setFieldError('extensionDuration', 'Extension duration is required');
					return;
				}
				if (formik.values.isMultiCurrency) {
					const invalidCurrencyItem = inputList.some(item => !item.baseCurrency);
					if (invalidCurrencyItem) {
						toast.error("Please select a currency for each entry before proceeding.");
						return;
					}
					const invalidConversionFactor = inputList.some(item => item.currencyConversion <= 0);
					if (invalidConversionFactor) {
						toast.error("Currency conversion factor must be greater than 0.");
						return;
					}
				}

				if (attachmentforevent && attachmentforevent.length > 0) {
					const missingRequiredAttachment = attachmentforevent?.some((file) => file.required && !file.fileNamePath);

					if (missingRequiredAttachment) {
						toast.info("If a document is required, you will need to upload the attachment. However, if it is not necessary, please delete the attachment", {
							toastid: "abhierror"
						});
						return;
					}
				}

				if (formik.values.isMultiCurrency) {
					const invalidCurrencyItem = inputList.some(item => !item.baseCurrency);
					if (invalidCurrencyItem) {
						toast.error("Please select a currency for each entry before proceeding.");
						return;
					}
					const invalidConversionFactor = inputList.some(item => item.currencyConversion <= 0);
					if (invalidConversionFactor) {
						toast.error("Currency conversion factor must be greater than 0.");
						return;
					}
				}

				var data = {
					id: values?.id,
					customerId: parseInt(customerid),
					subject: sanitizeInput(values.subject),
					description: sanitizeInput(values.description),
					bidStDate: values.bidStDate,
					bidEndDate: values.bidEndDate,
					bidDuration: parseInt(values.bidDuration),
					baseCurrency: values.baseCurrency,
					tnC: sanitizeInput(values.tnC),
					bidClosingType: values.bidClosingType,
					bidTypeID: bidtype?.id,
					bidSubTypeId: values.bidSubTypeId,
					showRankToVendor: values.showRankToVendor,
					maximumExtension: parseInt(values.maximumExtension),
					extensionDuration: parseInt(values.extensionDuration),
					hideVendor: values.hideVendor,
					hidePrice: values.hidePrice,
					prebid: values.prebid,
					preBidStDate: values.preBidStDate,
					preBidEndDate: values.preBidEndDate,
					quotesinWords: values.quotesinWords,
					rankToVendorPost: values.rankToVendorPost,
					noOfStaggerItems: parseInt(values?.noOfStaggerItems),
					multicurrencytList: inputList?.[0]?.baseCurrency == "" ? [] : inputList,
					stage: currentStage,
					configureDate: maxNow,
					isMultiCurrency: values.isMultiCurrency,
					createdById: tempDataEditData[0]?.createdById ?? 0,
					hideQuote: values.hideQuote
				};
				setLoading(true)
				const orgId = formik.values.purchOrgId?.id || 0;
				const orgGroupId = formik.values.purchGrpId?.id || 0;
				const datapayload = getPayloadWithStage(
					"currentStage",
					currentStage,
					stagelist,
					data,
					"currentStage",
					orgId,
					orgGroupId
				);
				if (data?.id > 0) {

					const previousType = tempDataEditData?.[0]?.bidClosingType;
					const newType = values?.bidClosingType;
					const previousSubType = tempDataEditData?.[0]?.bidSubTypeId;
					const newSubType = values?.bidSubTypeId;
					const hasItems = tempDataEditData?.[0]?.bidParamater?.length > 0;

					if (hasItems && ((previousType === "A" && newType === "S") || (previousType === "S" && newType === "A"))) {
						handleClearAll('bidClosingTypeChange');
					}

					if (hasItems && previousSubType && newSubType && previousSubType !== newSubType) {
						handleClearAll("bidSubTypeChange");
					}

					if (
						tempDataEditData?.[0]?.bidParamater?.[0]?.eventId &&
						tempDataEditData?.[0]?.bidParamater?.[0]?.eventType === "RFQ" &&
						!tempDataEditData?.[0]?.bidVendorInvited?.some(
							v => v?.bidLoadingFactor && v.bidLoadingFactor.length > 0
						)
					) {

						const hasData = await pullRfqLoadingFactor(
							tempDataEditData?.[0]?.bidParamater?.[0]?.eventId
						);

						if (hasData && hasData.length > 0) {

							await callLoadingFactorAPI(hasData);
						}
					}

					const res = await apiClient.postres(
						`/api/AuctionManage/Update`,
						datapayload,
						atoken
					);
					if (res) {
						if (!isCallbackSubmit) {
							toast.success(`Bid Details updated successfully.`);
						}
						setValue(2);
						setIdFromURL(data?.id)
						pullgetAuctionManageFind(idFromURL)
					}
					setLoading(false)
				} else {
					const res = await apiClient.postres(
						`/api/AuctionManage/Add`,
						datapayload,
						atoken
					);
					if (res) {
						setIdFromURL(res.data);
						navigate(`/configuration/manage-auction/${res.data}?tab=item`)
						setcommcurrencyList([
							{
								id: 0,
								baseCurrency: "",
								currencyConversion: 0,
								bidId: parseInt(res.data),
							},
						]);
						updateRequestCell(res.data);
						const AttachFiles = attachmentforevent?.map((x) => {
							x.eventId = res.data;
							x.createdById = userDetail?.id;
							x.createdByName = userDetail?.name;
							return x;
						});
						if (AttachFiles && AttachFiles.length > 0) {
							handlesaveAttachment(AttachFiles, res.data, atoken);
						}
						toast.success(`Bid details added successfully.`);
						setValue(2);
						setLoading(false)
						pullgetAuctionManageFind(res.data);
					}
					else {
						toast.error("Error while saving data");
						setLoading(false)
					}
				}
			} catch (error) {
				console.error("Error during form submission:", error);
			}
		},
	});

	// Auto-scroll to first error field when validation fails
	useEffect(() => {
		if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
			const firstErrorField = Object.keys(formik.errors)[0];
			const errorElement = document.getElementById(firstErrorField) ||
				document.querySelector(`[name="${firstErrorField}"]`) ||
				document.getElementById(`${firstErrorField}quill`);

			const scrollContainer = document.querySelector('.custom-fix');

			if (errorElement && scrollContainer) {
				const elementTop = errorElement.offsetTop;
				scrollContainer.scrollTo({
					top: elementTop - 100,
					behavior: 'smooth'
				});

				// Focus the element if it's focusable
				setTimeout(() => {
					if (errorElement.focus) {
						errorElement.focus();
					} else if (errorElement.querySelector('[contenteditable]')) {
						errorElement.querySelector('[contenteditable]').focus();
					}
				}, 300);
			}
		}
	}, [formik.submitCount, formik.errors]);

	const [rfqloadingfactor, setRfqloadingfactor] = useState([]);
	//console.log("rfqloadingfactor::", rfqloadingfactor)
	const pullRfqLoadingFactor = async (rfqId) => {

		let data = {
			rfqid: rfqId
		};
		const queryParams = buildQueryParams(data)
		const res = await apiClient.getres(`api/AuctionManage/RFQLoadingFactorPull?${queryParams}`, atoken);

		if (res?.data) {

			const data = res?.data;
			setRfqloadingfactor(data);
			return data;
		}
		return [];
	}

	const prepareLoadingFactorPayload = (tempDataEditData, rfqloadingfactor) => {

		const event = tempDataEditData[0]; // since you shared only one
		const { id: bidId, customerId } = event;

		// loop through vendors and match factors
		const payload = event.bidVendorInvited.flatMap(vendor => {
			const matchedFactor = rfqloadingfactor.find(f => f.vendorId === vendor.vendorID);
			if (matchedFactor) {
				return {
					bidId: bidId,
					version: 1,
					customerId: customerId,
					vendorId: vendor.vendorID,
					factorDesc: matchedFactor.factorDesc,
					factorType: matchedFactor.factorType,
					loadingAmount: matchedFactor.loadingAmount,
					loadingOn: "BID",
					createdById: matchedFactor.createdById,
					createdByName: matchedFactor.createdByName,
					id: 0
				};
			}
			return [];
		});

		return payload;
	};

	const callLoadingFactorAPI = async (hasData) => {

		const payload = prepareLoadingFactorPayload(tempDataEditData, hasData);

		if (payload.length === 0) {
			console.warn("No matching vendor factors found");
			return;
		}

		try {

			const res = await apiClient.postres(
				`/api/AuctionManage/AuctionLoadingFactor`,
				payload,
				atoken
			);

			if (res) {

				console.log("Loading Factor added successfully");
			}
		} catch (err) {
			console.error("Loading Factor API error:", err);
		}
	};



	const [shouldSubmit, setShouldSubmit] = useState(false);
	const [isCallbackSubmit, setIsCallbackSubmit] = useState(false); // Flag to track callback submission

	useEffect(() => {
		if (shouldSubmit) {
			formik.handleSubmit();
			setShouldSubmit(false); // Reset the flag
			setIsCallbackSubmit(false); // Reset the callback submission flag
		}
	}, [shouldSubmit, formik]);

	const [inputList, setInputList] = useState([
		{ id: 0, baseCurrency: "", currencyConversion: "" },
	]);

	const [commcurrencyList, setcommcurrencyList] = useState([
		{ id: 0, baseCurrency: formik.values.baseCurrency, currencyConversion: 1, bidId: parseInt(idFromURL) },
	]);

	const handleInputChange = (e, index, fieldname) => {
		let { name, value } = e.target;
		if (fieldname == "currencyConversion") {
			if (!IntegerRegex.test(value)) {
				const list = [...inputList];
				list[index][name] = "";
				setInputList(list);
				return
			}
			// to handle leading zero
			if (value <= 0) {
				value = "";
			}
		}
		const list = [...inputList];
		list[index][name] = value;
		setInputList(list);
	};

	const handleCurrencyInputChange = (e, index) => {
		const { name, value } = e.target;
		const list = [...commcurrencyList];
		list[index][name] = value;
		setcommcurrencyList(list);
	};
	const [attachmentCount, setAttachmentCount] = useState(0);
	//console.log("attachmentCount::", attachmentCount)
	const attachmentdrawerref = useRef()

	const handleAttachmentCount = (count) => {
		setAttachmentCount(count);
	};

	const handleRemoveClick = (index) => {
		const list = [...inputList];
		list.splice(index, 1);
		setInputList(list);
	};

	const handleAddClick = () => {
		setInputList([
			...inputList,
			{
				id: 0,
				baseCurrency: "",
				currencyConversion: "",
				bidId: formik?.values?.id,
			},
		]);
	};

	const pullgetCurrency = () => {
		var data = {
			isActive: true,
		};
		getCurrency(data, atoken).then((res) => {
			setCurrencyList(res);
		});
	};

	const pullgetAuctionManageFind = (Id) => {

		var data = {
			Id: Id,
		};
		getAuctionManageFind(data, atoken).then((res) => {
			// if (res && res?.length > 0) {
			if (res?.result && res?.result?.length > 0) {
				console.debug("pullgetAuctionManageFind: result summary", {
					resultLength: res?.result?.length,
					bidParamaterLength: res?.result?.[0]?.bidParamater?.length ?? 0,
					bidVendorInvitedLength: res?.result?.[0]?.bidVendorInvited?.length ?? 0,
					sample: res?.result?.[0]
				});
				if (
					res?.result?.[0]?.bidParamater &&
					res?.result?.[0]?.bidParamater?.length
				) {
					setbidItemsList(res?.result?.[0]?.bidParamater);
				}

				if (res?.result?.[0]?.userAccess?.length > 0) {
					const userAccess = res?.result?.[0]?.userAccess.map(x => {
						return ({ ...x, claimValue: JSON.parse(x.claimValue) })
					})

					setAccessLevel(userAccess)
					// Initialize Permission Manager with user access data
					const permManager = new PermissionManager(res?.result?.[0]?.userAccess);
					setPermissionManager(permManager);
				}

				setTempDataEditData(res?.result);
				// Removing 'bidParamater' from each object in the array for use on tab 2
				const filteredData = res?.result?.map((item) => {
					const { bidParamater, ...rest } = item;
					return rest;
				});
				//
				setTempDataForItemService(filteredData);
				// Handle bidClosingType="S" and sum itemBidDuration
				if (res?.result?.[0]?.bidClosingType === "S") {
					const totalBidDuration = res?.result?.[0]?.bidParamater.reduce(
						(sum, item) => sum + (item.itemBidDuration || 0),
						0
					);
					formik.setFieldValue("bidDuration", totalBidDuration > 0 ? totalBidDuration : "");
				}
				if (res?.result?.[0]?.version) {
					setVersion(res?.result?.[0]?.version);
				}
				if (res?.result?.[0]?.id && res?.result?.[0]?.id > 0) {
					formik.setFieldValue("id", res?.result?.[0]?.id);
				}
				if (res?.result?.[0]?.subject) {
					formik.setFieldValue("subject", res?.result?.[0]?.subject);
				}
				if (res?.result?.[0]?.description) {
					formik.setFieldValue("description", res?.result?.[0]?.description);
				}
				if (res?.result?.[0]?.bidStDate) {
					const bidStDate = checkUTC(res?.result?.[0]?.bidStDate)
					formik.setFieldValue("bidStDate", dayjs(bidStDate).tz(userDetail?.timeZone));
				}

				if (res?.result?.[0]?.bidEndDate && res?.result?.[0]?.bidDuration == 0) {
					formik.setFieldValue("bidEndDate", null);
				} else {
					const bidEndDate = checkUTC(res?.result?.[0]?.bidEndDate)
					formik.setFieldValue("bidEndDate", dayjs(bidEndDate).tz(userDetail?.timeZone));
				}


				//if (res?.[0]?.bidDuration) {
				formik.setFieldValue("bidDuration", (res?.result?.[0]?.bidDuration ?? 0));
				//}
				if (res?.result?.[0]?.bidSubTypeId) {
					formik.setFieldValue("bidSubTypeId", (res?.result?.[0]?.bidSubTypeId));
				}
				if (res?.result?.[0]?.bidClosingType) {
					formik.setFieldValue("bidClosingType", (res?.result?.[0]?.bidClosingType));
				}
				if (res?.result?.[0]?.noOfStaggerItems) {
					formik.setFieldValue("noOfStaggerItems", (res?.result?.[0]?.noOfStaggerItems));
				}
				if (res?.result?.[0]?.showRankToVendor) {
					formik.setFieldValue("showRankToVendor", (res?.result?.[0]?.showRankToVendor));
				}
				// if (res?.[0]?.maximumExtension) {
				formik.setFieldValue("maximumExtension", (res?.result?.[0]?.maximumExtension));
				// }
				// if (res?.[0]?.extensionDuration) {
				formik.setFieldValue("extensionDuration", (res?.result?.[0]?.extensionDuration));
				// }
				if (res?.result?.[0]?.hideVendor) {
					formik.setFieldValue("hideVendor", (res?.result?.[0]?.hideVendor));
				}
				if (res?.result?.[0]?.tnC) {
					formik.setFieldValue("tnC", res?.result?.[0]?.tnC);
				}
				if (res?.result?.[0]?.baseCurrency && res?.result?.[0]?.baseCurrency != "") {
					formik.setFieldValue("baseCurrency", res?.result?.[0]?.baseCurrency);
				}
				formik.setFieldValue("isMultiCurrency", res?.result?.[0]?.isMultiCurrency ?? false);
				if (
					res?.result?.[0]?.multicurrencytList &&
					res?.result?.[0]?.multicurrencytList?.length && res?.result?.[0]?.isMultiCurrency
				) {
					setInputList(res?.result?.[0]?.multicurrencytList);
				}
				if (res?.result?.[0]?.prebid) {
					formik.setFieldValue("prebid", (res?.result?.[0]?.prebid));
				}
				if (res?.result?.[0]?.bidStDate) {
					const preBidStDate = checkUTC(res?.result?.[0]?.preBidStDate)
					formik.setFieldValue("preBidStDate", dayjs(preBidStDate));
				}

				if (res?.result?.[0]?.preBidEndDate) {
					const preBidEndDate = checkUTC(res?.result?.[0]?.preBidEndDate)
					formik.setFieldValue("preBidEndDate", dayjs(preBidEndDate));
				}

				if (res?.result?.[0]?.quotesinWords) {
					formik.setFieldValue("quotesinWords", (res?.result?.[0]?.quotesinWords));
				}
				if (res?.result?.[0]?.rankToVendorPost) {
					formik.setFieldValue("rankToVendorPost", (res?.result?.[0]?.rankToVendorPost));
				}
				if (res?.result?.[0]?.stage) {
					setCurrentStage(res?.result?.[0]?.stage);
				}
				if (res?.result?.[0]?.hideQuote) {
					formik.setFieldValue("hideQuote", (res?.result?.[0]?.hideQuote));
				}
			}
		});
	};

	const handleBidStatusChange = (status) => {
		setCurrentStage(status);
		//console.log("Bid Status received from child:", status);
	};

	//handle pull from rfq
	const [reOpenAuctionModal, setReOpenAuctionModal] = useState(false);
	const handleCloseReOpenModal = () => {
		setReOpenAuctionModal(false);
	}

	const handleShowReOpenModal = () => {
		setReOpenAuctionModal(true);
	}

	//handle pull from pr
	const [prAuctionModal, setPrAuctionModal] = useState(false);
	const handleClosePRModal = () => {
		setPrAuctionModal(false);
		setInputValue('');
		setSelectedPRItemModal([]);
		setSelectedItemsActive([]);
		setInputError("");
	}

	const handleShowPRModal = () => {
		setPrAuctionModal(true);
	}

	const prAuctioncolumn = [
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
			field: "itemCategory",
			headerName: "Item Category",
			flex: 1,
			minWidth: 180,
			renderCell: (params) => (
				<div className="f14">{params?.formattedValue}</div>
			),
		},
		{
			field: "plant",
			headerName: "Plant",
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
	];

	const [inputValue, setInputValue] = useState('');
	const [inputError, setInputError] = useState('');
	const [selectedPRItemModal, setSelectedPRItemModal] = useState([]);
	//console.log("selectedPRItemModal:", selectedPRItemModal)
	const [selectedItemsActive, setSelectedItemsActive] = useState([]);
	//console.log("selectedItemsActive:", selectedItemsActive)

	const handleFetchPRData = async () => {

		try {
			var data = { prNumber: inputValue };
			if (data.prNumber.length === 0) {
				setInputError("Please enter PR number.");
				return;
			}
			setInputError(""); // clear previous error
			const queryParams = buildQueryParams(data)
			const res = await apiClient.getres(`/api/PRManage/FindItemsByPRNumber?${queryParams}`, atoken)
			if (res) {

				const data = res?.data ?? []
				setSelectedPRItemModal(data);
			} else {
				setInputError("No items found for the provided PR number.");
				setSelectedPRItemModal([]); // clear existing data if any
				return;
			}
		} catch (error) {
			toast.error("Something went wrong please contact administrator.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000,
			});
			setSelectedPRItemModal([]); // clear existing data if any
			return;
		}
	}

	const pullAuctionItemServiceFind = (bidid) => {
		var data = {
			BidId: bidid
		};
		getAuctionItemServiceFind(data, atoken).then((res) => {
			if (res) {
				setbidItemsList(res);
			}
		});
	};

	const pullAuctionItemServiceFindCallBack = useCallback(async (bidid, shouldTriggerSubmit = true) => {
		var data = {
			BidId: bidid
		};
		const queryParams = buildQueryParams(data)
		const res = await apiClient.getres(`api/AuctionParameters/Find?${queryParams}`, atoken)
		if (res?.data?.result) {
			const data = res?.data?.result;
			console.debug("pullAuctionItemServiceFindCallBack: fetched items count", data?.length, data?.slice?.(0, 3));
			setbidItemsList(data);
			if (tempDataEditData.length > 0 && tempDataEditData[0].bidClosingType == "S") {
				const totalBidDuration = data.reduce(
					(sum, item) => sum + (item.itemBidDuration || 0),
					0
				);
				formik.setFieldValue("bidDuration", totalBidDuration > 0 ? totalBidDuration : 0);
				updateBidEndDate(checkUTC(tempDataEditData[0]?.bidStDate), totalBidDuration)
				if (shouldTriggerSubmit) {
					setShouldSubmit(true); // Trigger Submit in useEffect
					setIsCallbackSubmit(true);
				}
			}

			if (tempDataEditData.length > 0 && tempDataEditData[0].bidSubTypeId == 82) {

				//const DutchitemBidDuration = (data[0]?.startPrice - data[0]?.ceilingPrice) / data[0]?.priceDecAmount * data[0]?.priceDecFrq + data[0]?.priceDecFrq;
				const DutchitemBidDuration = data.reduce(
					(sum, item) => sum + (item.itemBidDuration || 0),
					0
				);
				//const totalBidDuration = Math.round(DutchitemBidDuration);
				formik.setFieldValue("bidDuration", DutchitemBidDuration > 0 ? DutchitemBidDuration : 0);
				updateBidEndDate(checkUTC(tempDataEditData[0]?.bidStDate), DutchitemBidDuration)
				if (shouldTriggerSubmit) {
					setShouldSubmit(true); // Trigger Submit in useEffect
					setIsCallbackSubmit(true);
				}
			}
		}

	}, [formik, tempDataEditData])

	const [selectedCommercalDll, setSelectedCommercalDll] = useState([]);
	const pullLibraryOrgEntityFind = () => {
		var data = {
			CustomerId: customerid,
			LibraryType: "CommercialLibrary",
			EventType: "Auction",
			IsActive: true
		};
		getLibraryOrgEntityFind(data, atoken).then((res) => {
			if (res && res?.length > 0) {

				setGeneraltermsDDl(res);
				if (
					tempDataEditData?.[0] &&
					tempDataEditData?.[0]?.auctionCT &&
					tempDataEditData?.[0]?.auctionCT?.length &&
					res?.length
				) {
					const mappedRecords = tempDataEditData?.[0]?.auctionCT?.map(
						(item) => {
							const record = res?.find(
								(record) => record.id === item?.libraryId
							);
							return record;
						}
					);
					const uniqueMappedRecords = Array.from(new Set(mappedRecords));
					if (uniqueMappedRecords && uniqueMappedRecords?.length) {

						setSelectedCommercalDll(uniqueMappedRecords[0]);
						pullCommercialLibFind(uniqueMappedRecords[0]);
					}
				}
			}
		});
	};

	const [selectedQuesionArray, setSelectedQuesionArray] = useState([]);

	const pullCommercialLibFind = async (selectedItems) => {

		var data = {
			CustomerId: customerid,
			LibraryId: selectedItems.id, // change when multiselect complated
		};
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const res = await apiClient.getres(
			`/api/CommercialLib/Find?${queryParams}`,
			atoken
		);

		let response;
		if (res?.status === 200) {
			response = res?.data?.result;
		}
		if (response && response?.length > 0) {

			// setCommercialLibFind(res)
			const modifiedRes = response?.map((item) => ({
				...item,
				id: 0,
				isSelected: false, // for my internal use
				bidId: idFromURL,
				termsId: item?.id
			}));

			setCommercialLibFind(modifiedRes);
			//here we update old selected commerical terms value
			// condition check here
			if (
				tempDataEditData?.[0] &&
				tempDataEditData?.[0]?.auctionCT &&
				tempDataEditData?.[0]?.auctionCT?.length &&
				modifiedRes?.length
			) {
				const updatedArray = modifiedRes?.map((item) => {
					const matchingItem = tempDataEditData?.[0]?.auctionCT?.find(
						(updatedItem) => updatedItem.termsId === item.termsId
					);

					if (matchingItem) {
						return {
							...item,
							isSelected: matchingItem?.isSelected
								? matchingItem?.isSelected
								: true,
							level: matchingItem?.level,
							requirement: matchingItem?.requirement,
							bidTermCurrency: matchingItem?.bidTermCurrency,
							grandTotalTermName: matchingItem?.grandTotalTermName
						};
					}
					return item;
				});

				setCommercialLibFind(updatedArray);
				setLibraryTermsList(updatedArray)
			}
		}
	};

	const callbackQuesAddCustom = useCallback(
		(quesData) => {
			setSelectedQuesionArray((prev) => [...prev, quesData]);
			setState({ ...state, qusDrawer: false });
		},
		[selectedQuesionArray]
	);

	const [selectedcommercialterm, setSelectedCommercialTerm] = useState(null);

	const handleChangeCom = (index, value, x) => {
		const item = commercialLibFind[index];
		if (item.valuetype === "Currency") {
			setSelectedCommercialTerm(x);
			if (x?.bidTermCurrency && x?.bidTermCurrency.length > 0) {
				setcommcurrencyList(x?.bidTermCurrency);
			} else {
				//setcommcurrencyList([]);
				setcommcurrencyList([{
					id: 0,
					baseCurrency: formik?.values?.baseCurrency,
					currencyConversion: "1",
					bidId: parseInt(idFromURL),
				}]);
			}
			setModal1(true);
		} else {
			setSelectedCommercialTerm(x);
			setModal1(false);
		}
	};

	const handlecurrencytermmodal = () => {
		const updatedlist = commercialLibFind.map((x, i) => {
			if (x.termsId == selectedcommercialterm?.termsId) {
				x.bidTermCurrency = commcurrencyList;
			}
			return x;
		});
		setCommercialLibFind(updatedlist);
		setModal1(false);
		setSelectedCommercialTerm(null);
		setcommcurrencyList([
			{ id: 0, baseCurrency: "", currencyConversion: "" },
		]);
	};

	const handleComItemCheck = (index, value) => {
		const list = [...commercialLibFind];
		list[index]["isSelected"] = value;
		setCommercialLibFind(list);
		setLibraryTermsList(list)
	};

	const handleComItemAllCheck = (value) => {

		const list = commercialLibFind?.map((component) => ({
			...component,
			isSelected: value,
		}));
		setCommercialLibFind(list);
		setLibraryTermsList(list)
	};

	const [itemEditTempData, setItemEditTempData] = useState([]);

	const handleEditItem = useCallback((dataItem) => {
		setItemEditTempData(dataItem);
		setState({ ...state, addProductDrawer: true });
	}, []);

	const [confirmDelete, setConfirmDelete] = useState(false);
	const [removeItem, setRemoveItem] = useState(null);

	const handleCloseDelete = () => {
		setRemoveItem(null);
		setConfirmDelete(false);
	};

	const handleDeleteItem = useCallback(
		(id) => {

			setRemoveItem(id);
			setConfirmDelete(true);
			//pullAuctionItemServiceFind(idFromURL);
		},
		[idFromURL]
	);

	const callbackItemAdd = useCallback(
		(pass, dutchBidDuration) => {
			if (dutchBidDuration != null) {
				formik.setFieldValue('bidDuration', dutchBidDuration);
			}
			pullAuctionItemServiceFindCallBack(idFromURL).then(() => {
				setState((prev) => ({ ...prev, addProductDrawer: false }));
				setItemEditTempData([]); // Clear after the service call
			});
		},
		[idFromURL, pullAuctionItemServiceFindCallBack]
	);

	const removeItemData = async (value) => {

		const res = await apiClient.postres(
			`/api/AuctionParameters/Delete?Id=${value}`,
			null,
			atoken
		);
		if (res) {
			pullAuctionItemServiceFindCallBack(idFromURL);
			setRemoveItem(null);
			setConfirmDelete(false);
		}
	};

	const getLibraryTermsList = async (SelectedCommercialLibrary) => {

		if (!SelectedCommercialLibrary) {
			setLibraryTermsList([]);
			return;
		}
		const data = { CustomerId: customerid, LibraryId: SelectedCommercialLibrary?.id };
		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(`/api/CommercialLib/Find?${queryParams}`, atoken);

		if (res && res?.data?.result.length > 0) {
			const CommercialTermModal = res?.data?.result.map(item => ({
				...item,
				id: 0,
				isSelected: true,
				bidId: pageSlug,
				termsId: item.id,
				//Version: 1,
				level: item.level || (["Currency", "Percentage"].includes(item.valuetype) ? "item" : "auction"),
			}));

			setLibraryTermsList(CommercialTermModal)
			setCommercialLibFind(CommercialTermModal)

		}
	};

	const [isCommLibrarySaved, setIsCommLibrarySaved] = useState(false);
	const [LibraryTermsList, setLibraryTermsList] = useState([]);
	// console.log("LibraryTermsList::", LibraryTermsList)
	const [SelectedCommercialLibrary, setSelectedCommercialLibrary] = useState(null);
	useEffect(() => {

		if (!SelectedCommercialLibrary && generaltermsDDl.length > 0 && LibraryTermsList.length > 0) {
			const libraryId = LibraryTermsList[0]?.libraryId;

			const obj = generaltermsDDl.find(x => x.id == libraryId);
			setSelectedCommercialLibrary({
				...obj,
				grandTotalTermName: LibraryTermsList[0].grandTotalTermName
			})

		}
	}, [LibraryTermsList, generaltermsDDl, SelectedCommercialLibrary]);

	const saveBidCommLibraryAdd = async () => {

		if (isCommLibrarySaved && tempDataEditData[0]?.auctionCT.length > 0 && value == 5) {
			return true; // Skip execution if already saved
		}

		const selectedCommTerms = commercialLibFind?.filter(
			(s) => s.isSelected == true
		);
		//console.log("selectedCommTerms:::", selectedCommTerms)
		if (
			(!selectedCommTerms || selectedCommTerms.length === 0) &&
			(bidtype?.id === 3 || bidtype?.id === 4)
		) {
			toast.error("Please select commercial terms before proceeding...", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 1000,
			});
			setValue(3)
			setSelectedMenuItem("Save & Continue")
			setLoading(false);
			return false; // Return false when validation fails
		}

		if (selectedCommTerms && selectedCommTerms?.length) {
			const data = AuctionCTAddModal(
				selectedCommTerms,
				parseInt(idFromURL),
				selectedCommercalDll,
				formik.values.baseCurrency
			);

			if (data.length === 0) {
				toast.error(`Please select atleast one ct before proceeding.`);
				return false; // Return false when no data
			}

			const commercialfieldlist = selectedCommTerms.map(x => x.fieldName);
			const isValid = selectedCommTerms.some(x => {
				if (x?.formulavalue) {
					const fieldNameGroup = Array.from(x.fieldNameGroup.split(","));
					let notIncluded = [...new Set(fieldNameGroup.filter(element => !commercialfieldlist.includes(element)))];
					if (notIncluded.length == 1) {
						if (notIncluded[0]?.trim() === "") {
							notIncluded = [];
						}
					}
					if (notIncluded.length > 0) {
						toast.error(
							<>
								<strong>The following required formula fields are missing:</strong>
								<ul>
									{notIncluded.map((field, index) => (
										<li key={index}>{field}</li>
									))}
								</ul>
								<p>Please ensure all the required fields are included in the formula for <strong>{x.name?.replace(/_/g, " ")}</strong> at the same level .</p>
							</>,
							{
								toastId: "commercialtermerror",
								hideProgressBar: true,
								autoClose: false
							}
						);
						return true;
					}
				}
				return false;
			});

			if (isValid) {
				return false; // Return false when validation fails
			}

			if (
				!SelectedCommercialLibrary?.grandTotalTermName ||
				!selectedCommTerms?.some(term => term.name === SelectedCommercialLibrary.grandTotalTermName)
			) {
				toast.error("Please ensure that a Net Price term is selected at item level", {
					toastId: "grandtotalterm-required"
				});
				return false; // Return false when validation fails
			}

			try {
				const res = await apiClient.postres(
					`/api/AuctionCT/${idFromURL}/Add`,
					data,  // sending the data directly
					atoken
				);

				if (res) {
					toast.success(`Commercial Terms Saved Successfully.`);
					//pullgetAuctionManageFind(idFromURL);
					setValue(4)
					setIsCommLibrarySaved(true);
					return true; // Return success
				}
				return false; // Return false if res is falsy
			} catch (error) {
				toast.error(`Error while saving data. Please try again.`);
				return false; // Return false on error
			}
		} else {
			setValue(4);
			setIsCommLibrarySaved(true);
			return true; // Return true when no terms to save
		}
	};

	const { pageSlug } = useParams();
	const [activityId, setActvityId] = useState(0);
	const [actionType, setActionType] = useState("");
	// console.log("activityId::", activityId)
	useEffect(() => {
		const params = new URLSearchParams(searchParams);

		const actionType = params.get("ActionType");
		const ActivityId = params.get("ActivityId");
		setActionType(actionType);
		setActvityId(ActivityId ?? 0);

		const newIdFromURL = pageSlug;
		//#eventid and eventtype
		dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "Auction" });

		setIdFromURL(newIdFromURL);
		setcommcurrencyList([
			{
				id: 0,
				baseCurrency: "",
				currencyConversion: 0,
				bidId: parseInt(newIdFromURL),
			},
		]);
		updateRequestCell(newIdFromURL);
	}, [searchParams]);

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
		//         CommDetails_CommParticipantUser_UserId: userDetail?.id,
		//     };
		//     const queryParams = buildQueryParams(data)
		//     const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken)

		//     if (res) {
		//         const data = res?.data?.result ?? []

		//         dispatch({ type: actionTypes.SET_Notificationlist, value: data });
		//     }


		// }

		// if (pageSlug) {
		//     pullMessageList();
		// }
	}, [pageSlug, customerid, dispatch, atoken]); // Dependencies for the effect

	useEffect(() => {
		if (userDetail?.id && eventType && eventId) {
			pullMessageCount({
				UserId: userDetail.id,
				EventType: eventType,
				EventId: eventId,
				IsVenderYN: "N",
				atoken,
				dispatch
			});
		}
	}, [userDetail, eventType, eventId]);

	const handleSaveContinue = () => {
		if (value == 1) {

			if (formik.values.bidStDate && (!formik.values.bidEndDate || isNaN(dayjs(formik.values.bidEndDate)))) {
				// Calculate bidEndDate using bidStDate and bidDuration
				const calculatedBidEndDate = dayjs(formik.values.bidStDate).add(formik.values.bidDuration || 0, 'minute');

				formik.setFieldValue('bidEndDate', calculatedBidEndDate);
			}

			if (formik.values.bidStDate && formik.values.bidEndDate) {
				const bidStartDate = dayjs(formik.values.bidStDate);  // Parse the start date using dayjs
				const bidEndDate = dayjs(formik.values.bidEndDate);    // Parse the end date using dayjs

				// Calculate the duration in minutes using dayjs.diff
				const calculatedDuration = bidEndDate.diff(bidStartDate, 'minute');  // Calculate the difference in minutes

				if (calculatedDuration >= 0) {
					formik.setFieldValue('bidDuration', calculatedDuration);  // Set the calculated duration in formik
				} else {
					toast.error("End date cannot be before the Start Date.");
					return;
				}
			}

			if (formik.values.prebid) {

				if (!formik.values.preBidStDate || !dayjs(formik.values.preBidStDate).isValid() ||
					!formik.values.preBidEndDate || !dayjs(formik.values.preBidEndDate).isValid()) {
					toast.error("Both Pre-Bid Start Date and End Date are required.");
					return;
				}
				if (dayjs(formik.values.preBidStDate) < dayjs()) {
					toast.error("Pre-Bid Start Date cannot be in the past. Please configure a valid time.");
					return;
				}
				if (dayjs(formik.values.preBidEndDate) <= dayjs(formik.values.preBidStDate)) {
					toast.error("Pre-Bid End Date must be after the Pre-Bid Start Date.");
					return;
				}
				if (formik.values.bidStDate && dayjs(formik.values.bidStDate).isValid()) {
					if (dayjs(formik.values.preBidStDate) > dayjs(formik.values.bidStDate) || dayjs(formik.values.preBidEndDate) > dayjs(formik.values.bidStDate)) {
						toast.error("Pre-Bid dates must be scheduled before the Bid Start Date.");
						return;
					}
				}
			}
			if (formik.values.isMultiCurrency) {
				if (inputList?.length === 0) {
					toast.error("Please add multi-currency details.", {
						toastId: "multicurrency_error"
					});
					return;
				}
			}
			formik.handleSubmit();
		}
		if (value == 2) {

			if (bidItemsList?.length < 1) {
				toast.info("please add items to continue");
				return;
			}

			if (tempDataEditData?.[0]?.bidClosingType === 'S') {
				const requiredStaggerItems = tempDataEditData?.[0]?.noOfStaggerItems;
				if (bidItemsList?.length < requiredStaggerItems) {
					toast.info(`Stagger requires at least same as Items to run simultaneously number to continue.`);
					return;
				}
			}
			if (bidtype && ![1, 2, 5, 6].includes(bidtype.id)) {
				setValue(3);
			} else {
				setValue(4);
			}
		}
		if (value == 3) {
			saveBidCommLibraryAdd();
		}
		if (value == 4) {
			saveSelectedSuppliers();
		}
	};

	const [approverInWorkflow, setApproverInWorkflow] = useState([])
	const [isSuppSave, setIsSuppSave] = useState(false);
	const handleEventAppList = useCallback((arr, updatedvalue) => {
		setEventAppList(arr);
		setApproverInWorkflow(updatedvalue)
	}, []);

	const checkApprovers = () => {
		const isStageRequired = stagelist?.filter((x) => x.wfname)
		for (const stage of isStageRequired) {
			const matchingWorkflow = approverInWorkflow.find(workflow => workflow.stage === stage.wfname);
			if (matchingWorkflow && matchingWorkflow.approvers.length == 0) {
				toast.error(`Error: The mandatory  workflow "${stage.wfname}" has no approvers.`);
				return false;
			}
		}
		return true
	};

	const handleErrorBIDSubmit = () => {
		const currentDate = new Date();
		if (formik.values.bidStDate < currentDate) {
			setValue(1)
			setSelectedMenuItem("Save & Continue")
			setApproverShow(false)
			formik.handleSubmit()
			return false;
		}

		if (formik.values.bidStDate > formik.values.bidEndDate) {
			toast.error("Start date cannot be after end date.", {
				toastId: "bidStDate"
			});
			setValue(1)
			setSelectedMenuItem("Save & Continue")
			setApproverShow(false)
			return false;
		}

		if (formik.values.bidClosingType == 'S') {
			const invalidItems = bidItemsList.map((item, index) => (
				{ ...item, serial: index + 1 })).filter(item => item.itemBidDuration <= 0);
			if (invalidItems.length > 0) {
				const lineItemNos = invalidItems.map(item => item.serial).join(", ");
				toast.error(`Given serial no. don't have itemBidDuration: ${lineItemNos}`, {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 3000,
				});
				setValue(2);
				setSelectedMenuItem("Save & Continue");
				setApproverShow(false);
				return false;
			}
		}

		if (bidItemsList?.length < 1) {

			toast.error(`add atleast one item`, {
				toastId: "itemsList_fail"
			})
			setValue(2)
			setSelectedMenuItem("Save & Continue");
			setApproverShow(false)
			return false;
		}

		const missingFieldsItems = bidItemsList.map((item, index) => (
			{ ...item, serial: index + 1 })).filter(item => item.minimumDelta <= 0 || item.startPrice <= 0);
		// if (missingFieldsItems.length > 0) {
		if (missingFieldsItems.length > 0 && tempDataEditData[0]?.bidSubTypeId != 82) {
			const serialNumbers = missingFieldsItems.map(item => item.serial).join(", ");
			toast.error(`Give serial no. are missing some fields: ${serialNumbers}`, {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 3000,
			});
			setValue(2);
			setSelectedMenuItem("Save & Continue");
			setApproverShow(false);
			return false;
		}

		if (selectedSupplier?.length < 2) {

			toast.error(`select atleast two supplier`, {
				toastId: "supp_fail"
			})
			setValue(4)
			setSelectedMenuItem("Save & Continue")
			setApproverShow(false)
			return false;
		}

		return true;
	}

	const handleBidSubmit = async () => {

		setLoading(true)
		if (bidtype?.id == 3 || bidtype?.id == 4) {

			const isSaveSuccessful = await saveBidCommLibraryAdd();

			if (!isSaveSuccessful) {
				setLoading(false);
				return;
			}
		}

		const isSubmit = handleErrorBIDSubmit();
		const isApprovers = checkApprovers();
		if (!isSubmit || !isApprovers) {
			setLoading(false);
			return;
		}

		const rfqParam = tempDataEditData?.[0]?.bidParamater?.find(
			p => p?.eventType === "RFQ" && p?.eventId
		);
		// if (tempDataEditData[0]?.bidParamater[0]?.eventId && tempDataEditData[0]?.bidParamater[0]?.eventType == 'RFQ') {
		if (rfqParam?.eventId && rfqParam?.eventType == 'RFQ') {
			//submitPrebid();

			try {
				const prebidSuccess = await submitPrebid();
				if (!prebidSuccess) {
					toast.error("Error while submitting pre-bid. Please try again.");
					return;
				}
			} catch (err) {
				toast.error("Error while submitting pre-bid. Please try again.");
				return;
			}
		}

		const data = {
			customerId: parseInt(customerid),
			bidId: parseInt(idFromURL),
			activityId: activityId,
		};

		const orgId = formik.values.purchOrgId?.id || 0;
		const orgGroupId = formik.values.purchOrgId?.id || 0;

		const datapayload = getPayloadWithStage(
			"currentStage",
			currentStage,
			stagelist,
			data,
			"currentStage",
			orgId,
			orgGroupId
		);

		if (!isSuppSave) {
			const selectedsupp = InvitedSupplierForBidModal(
				selectedSupplier,
				parseInt(idFromURL),
				parseInt(customerid),
				parseInt(activityId),
				userDetail?.id,
				userDetail?.name
			);

			const ressupp = await apiClient.postres(
				`/api/AuctionInviteVendors/${idFromURL}/Add`,
				selectedsupp,
				atoken
			);

			if (!ressupp) {
				toast.error(" suppliers not added successfully")
				setLoading(false);
				return;
			}
		}

		const res = await apiClient.postres(
			`/api/AuctionManage/BidSubmit`,
			datapayload,
			atoken
		);

		if (res) {
			toast.success("Auction created successfully!");
			navigate(`/configuration/manage-auction`);
		}
		else {
			setLoading(false)
			toast.error(`Error while saving data. Please try again.`);
		}
		setLoading(false)
	};

	useEffect(() => {
		if (idFromURL && idFromURL > 0) {
			pullgetAuctionManageFind(idFromURL);
		}
	}, [idFromURL]);

	// Ensure preview has items and suppliers loaded even if user hasn't visited those tabs
	// Wait for `tempDataEditData` to be populated because supplier selection and some bid params
	// are derived from that payload.
	useEffect(() => {
		if (
			idFromURL &&
			idFromURL > 0 &&
			bidpreview &&
			Array.isArray(tempDataEditData) &&
			tempDataEditData.length > 0
		) {
			// load auction items (detailed) and supplier list for preview
			try {
				// Pass false so loading items for preview does NOT trigger a form re-submit
				// (avoids an infinite loop for Dutch auction and Stagger closing types).
				pullAuctionItemServiceFindCallBack(idFromURL, false);
			} catch (err) {
				// ignore
			}
			try {
				getTotalSupplier();
			} catch (err) {
				// ignore
			}
		}
	}, [idFromURL, bidpreview, tempDataEditData]);

	useEffect(() => {
		// if (value == 1 && idFromURL && idFromURL > 0) {    
		//     pullgetAuctionManageFind(idFromURL);
		// }
		if (value == 2 && idFromURL && bidItemsList.length !== 0) {
			pullAuctionItemServiceFind(idFromURL);
		}
		if (value == 3) {
			pullLibraryOrgEntityFind();
		}
		if (value == 4 || value == 5) {
			getTotalSupplier();
			getCategorylist();
		}
	}, [idFromURL, value]);

	const [selectedCategory, setSelectedCategory] = useState(null);
	const [categoryList, setCategoryList] = useState([]);

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
			Advance: `Advance`,
			CategoryId: selectedCategory?.id,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);

		if (res.data?.length > 0) {
			const data = res.data;
			const emails = data?.map((item) => item.email);
			const resetSuppliers = totalSupplier?.map((supplier) => {
				return { ...supplier, isShow: false };

				return supplier;
			});

			const updatedSuppliers = resetSuppliers?.map((supplier) => {
				if (emails.includes(supplier.email)) {
					return { ...supplier, isShow: true };
				}
				return supplier;
			});
			setTotalSupplier(updatedSuppliers);
		} else {
			const resetSuppliers = totalSupplier?.map((supplier) => {
				return { ...supplier, isShow: false };

				return supplier;
			});
			setTotalSupplier(resetSuppliers);
		}
	};

	//add new terms starts here
	const [openDrawer, setOpenDrawer] = useState({ AddNewTerm: false });
	const toggleOpenDrawer = (anchor, open) => {
		setOpenDrawer({ ...openDrawer, [anchor]: open });
	};
	const [modal01, setModal01] = useState(false);
	const [modalCurrencyindex, setModalCurrencyIndex] = useState(null)
	const [editRecordData, setEditRecordData] = useState(null)
	const [modalCurrency, setModalCurrency] = useState({
		id: "0",
		baseCurrency: formik?.values?.baseCurrency,
		currencyConversion: "1",
		bidId: parseInt(idFromURL)
	})

	const handleCloseModal01 = () => {
		setModalCurrencyIndex(null)
		setModal01(false);
		setModalCurrency({
			id: "0",
			baseCurrency: formik?.values?.baseCurrency,
			currencyConversion: "1",
			bidId: parseInt(idFromURL),
		})
	}

	const handleCommercialCurrencyCheck = useCallback(() => {

		const list = [...LibraryTermsList];

		list[modalCurrencyindex]["AcceptedCurrency"] = modalCurrency.baseCurrency;
		list[modalCurrencyindex]["currencyConversion"] = modalCurrency.currencyConversion;

		setLibraryTermsList(list);
		setModal01(false);
	}, [modalCurrency, modalCurrencyindex]);

	const CommercialTermModal = (data) => {

		return {
			"id": 0,
			"customerId": customerid,
			"libraryName": null,
			"libraryId": SelectedCommercialLibrary?.id,
			"libraryEntity": SelectedCommercialLibrary?.libraryEntity,
			"name": data?.name,
			"fieldName": data?.fieldName,
			"eventtype": "Auction",
			"level": ((["Currency", "Percentage"].includes(data.valuetype) || (data?.commValue > 0)) ? "item" : "auction"),
			"valuetype": data?.valuetype,
			"currencyType": "",
			"commValue": data?.commValue,
			"formulavalue": data?.formulavalue,
			"fieldNameGroup": cleanAndConvertToArray(data?.formulavalue),
			"isdefault": true,
			"orderseq": 0,
			"isActive": true,
			"requirement": null,
			"isSelected": true,
			"bidId": parseInt(idFromURL),
			"termsId": 0,
			"Version": 1.00
		}
	}


	const DefaultCommercialTermModal = (editrecorddata, data) => {
		return {
			...editrecorddata,
			"name": data?.name,
			"fieldName": data?.fieldName,
			"valuetype": data?.valuetype,
			"commValue": data?.commValue,
			"formulavalue": data?.formulavalue,
			"fieldNameGroup": cleanAndConvertToArray(data?.formulavalue),

		}
	}

	//add new terms ends here

	const [totalSupplier, setTotalSupplier] = useState([]);
	const getTotalSupplier = async () => {
		setTabLoading(true)
		const obj = {
			CustomerId: customerid,
			//Advance: `Advance`,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);

		console.debug("getTotalSupplier: fetched suppliers", res?.data?.length ?? 0, Array.isArray(res?.data) ? res.data.slice(0, 3) : res?.data);

		if (Array.isArray(tempDataEditData) && tempDataEditData.length > 0 && Array.isArray(tempDataEditData[0]?.bidVendorInvited) && tempDataEditData[0]?.bidVendorInvited.length > 0) {

			const ids = tempDataEditData[0].bidVendorInvited.map((item) => item.vendorID);
			const contactids = tempDataEditData[0].bidVendorInvited.map((item) => item.contactId);

			setttingSelectedSupplier(ids, true, res?.data, tempDataEditData[0].bidVendorInvited, contactids);
		} else {
			const showTotalsupplier = res?.data?.map((supplier) => {
				return { ...supplier, isShow: true };
			});
			setTotalSupplier(showTotalsupplier);
		}
		setTabLoading(false)
	};

	const setttingSelectedSupplier = (ids, value, totalSupplier, selectedVendors, contactids) => {

		const resetSuppliers = totalSupplier?.map((supplier) => {
			return { ...supplier, isShow: true };
		});
		const updatedSuppliers = resetSuppliers?.map((supplier) => {
			// Match by both vendorId and contactId to avoid duplicate contactId issues
			const matchIndex = ids?.findIndex((vendorId, idx) =>
				supplier.vendorId === vendorId && supplier.contactId === contactids[idx]
			);

			if (matchIndex !== -1) {
				const selectedVendor = selectedVendors?.find(v =>
					v.vendorID === supplier.vendorId && v.contactId === supplier.contactId
				);
				return { ...supplier, isSelected: value, bidLoadingFactor: selectedVendor?.bidLoadingFactor };
			}
			return supplier;
		});

		setTotalSupplier(updatedSuppliers);

		// Preserve the invitation order by sorting based on the ids array order
		const selectedList = ids?.map((vendorId, idx) => {
			return updatedSuppliers?.find(
				(supplier) => supplier.vendorId === vendorId && supplier.contactId === contactids[idx] && supplier.isSelected
			);
		}).filter(Boolean); // Remove any undefined entries


		setSelectedSupplier(selectedList);
	};

	const [selectedSupplier, setSelectedSupplier] = useState([]);
	//console.log("selectedSupplier::", selectedSupplier)
	const handleSelectedSupplier = (row, value) => {
		const { id, contactId } = row
		const index = totalSupplier.findIndex((supplier) => supplier.contactId === contactId);
		const list = [...totalSupplier];
		// Check if email id is already present in selected list
		const isSelectedEmailAlreadyPresent = selectedSupplier.some(
			(supplier) => supplier.id === list[index].id
		);
		if (isSelectedEmailAlreadyPresent && value) {
			// Don't allow to add if company is already present
			toast.info(`User from this Supplier is already added`, {
				toastId: "supplier_info"
			});
			return;
		}
		list[index]["isSelected"] = value;
		list[index]["subject"] = tempDataEditData?.[0]?.subject;
		//list[index]["companyName"] = userDetail.customerName;

		const selectedList = list?.filter((s) => s.isSelected == true);
		if (selectedList?.length > 75) {
			toast.info(`You can select only 75 suppliers`, {
				toastId: "suppliermax_info"
			});
			return;
		}
		setTotalSupplier(list);

		setSelectedSupplier(selectedList);
	};

	const clearSelectedSupplier = async (x, value) => {

		const matchedVendor = tempDataEditData[0]?.bidVendorInvited.find(
			(vendor) => vendor?.vendorID == x?.vendorId
		);
		if (matchedVendor) {
			try {
				const res = await apiClient.put(
					`/api/AuctionInviteVendors/${matchedVendor?.id}/Delete`,
					null,
					atoken
				);
				if (res) {
					toast.error("Supplier removed successfully", {
						toastId: "suppdel"
					});
				}
			} catch (error) {
				console.error("Error deleting supplier:", error);
			}
		} else {
			console.warn("No matching vendor found in bidVendorInvited");
		}

		const email = x?.email;
		const index = totalSupplier.findIndex(
			(supplier) => supplier.email === email
		);
		const list = [...totalSupplier];
		list[index]["isSelected"] = value;
		setTotalSupplier(list);
		const selectedList = list?.filter((s) => s.isSelected == true);

		setSelectedSupplier(selectedList);
	};

	const clearALLSelectedSupplier = async () => {
		try {
			const res = await apiClient.put(`/api/AuctionInviteVendors/${pageSlug}/DeleteAll`, null, atoken)
			if (res) {
				toast.error("All suppliers removed successfully from event", {
					toastId: "allsuppdel"
				})
			}
		} catch (error) {
			console.error("Error deleting supplier:", error);
		}

		const list = totalSupplier?.map((item) => ({ ...item, isSelected: false }));
		setTotalSupplier(list);

		setSelectedSupplier([]);
	};

	const saveSelectedSuppliers = async () => {
		try {
			const data = InvitedSupplierForBidModal(
				selectedSupplier,
				parseInt(idFromURL),
				parseInt(customerid),
				parseInt(activityId),
				userDetail?.id,
				userDetail?.name
			);

			if (data.length === 0 || selectedSupplier.length < 2) {
				toast.error(`Please select at least two suppliers before proceeding.`);
				return;
			}

			const res = await apiClient.postres(
				`/api/AuctionInviteVendors/${idFromURL}/Add`,
				data,
				atoken
			);

			if (res) {
				//pullgetAuctionManageFind(idFromURL)
				setBidPreview(true)
				setValue(5)
				setSelectedMenuItem("Submit")
				setIsSuppSave(true)
				toast.success(`Suppliers saved successfully`, {
					toastId: "supplierinvitation_succ"
				});
			}
			else {
				return '';
			}
		} catch (error) {
			toast.error(`Error inviting suppliers: ${error.message}`);
		}
	};


	//loading factor code start
	const [storeVId, setStoreVId] = useState('');
	//console.log("storeVId::", storeVId)
	const [factorDesc, setFactorDesc] = useState('');
	const [loadingOn, setLoadingOn] = useState('');
	const [factorType, setFactorType] = useState('');
	const [factorPerc, setFactorPerc] = useState(0);
	const [loadingAmount, setLoadingAmount] = useState(0); // Add this to your state
	const [loadingFactors, setLoadingFactors] = useState([]);
	const [editIndex, setEditIndex] = useState(null);
	const [filteredLoadingFactors, setFilteredLoadingFactors] = useState([]);
	//console.log("filteredLoadingFactors::", filteredLoadingFactors)
	const [errors, setErrors] = useState({});

	const validationSchemaloading = yup.object({
		factorDesc: yup.string()
			.required('Reason of Loading Factor is required'),
		factorType: yup.string()
			.required('Loading Type is required'),
		factorPerc: yup.number()
			.transform((value, originalValue) => originalValue === '' ? undefined : value)
			.when('factorType', {
				is: 'P',
				then: (schema) => schema
					.required('Loading Factor is required')
					.positive('Loading Factor must be greater than 0')
					.max(100, 'Loading Factor cannot exceed 100%'),
				otherwise: (schema) => schema.notRequired()
			}),
		loadingAmount: yup.number()
			.transform((value, originalValue) => originalValue === '' ? undefined : value)
			.when('factorType', {
				is: 'A',
				then: (schema) => schema
					.required('Loading Amount is required')
					.positive('Loading Amount must be greater than 0'),
				otherwise: (schema) => schema.notRequired()
			})
	});


	const handleLoadingFactorClick = (vendor, index) => {

		const vendorId = vendor?.id;
		setStoreVId(vendorId);
		//setupdatesupplieronloading(0)
		const vendorDataArray = selectedSupplier?.filter(v => v.vendorId === vendorId);
		let vendorLoadingFactors = vendorDataArray?.flatMap(vendorData => vendorData.bidLoadingFactor) || [];
		if (!vendorLoadingFactors[0]) {
			vendorLoadingFactors = []
		}

		setFilteredLoadingFactors(vendorLoadingFactors);
		setFactorDesc('');
		setFactorType('');
		setLoadingOn('');
		setFactorPerc(0);
		setLoadingAmount(0);
		setErrors({});
		setLoadingModal(true);
	};

	const validateForm = (values) => {
		try {
			validationSchemaloading.validateSync(values, { abortEarly: false });
			return null;
		} catch (err) {
			const errors = err.inner.reduce((acc, error) => {
				acc[error.path] = error.message;
				return acc;
			}, {});
			return errors;
		}
	};

	const handleAddLoadingFactor = () => {
		setLoadingUpdateBtn(true)
		const formValues = {
			factorDesc,
			factorType,
			...(factorType === 'A' ? { loadingAmount } : { factorPerc }),
			loadingOn
		};
		const validationErrors = validateForm(formValues);
		if (validationErrors) {
			setErrors(validationErrors);
			setLoadingUpdateBtn(false)
			return;
		}

		const newLoadingFactor = {
			bidId: parseInt(idFromURL),
			version: 1,
			customerId: parseInt(customerid),
			vendorId: storeVId,
			factorDesc: factorDesc,
			factorType: factorType,
			...(factorType === 'A' ? { loadingAmount: parseFloat(loadingAmount) } : { factorPerc: parseFloat(factorPerc) }),
			loadingOn: "BID",
			createdById: userDetail?.id,
			createdByName: userDetail?.name
		};

		let updatedLoadingFactors;

		if (editIndex !== null) {
			updatedLoadingFactors = [...filteredLoadingFactors];
			updatedLoadingFactors[editIndex] = newLoadingFactor;
			setEditIndex(null);
		} else {
			updatedLoadingFactors = [...filteredLoadingFactors, newLoadingFactor];
		}


		setLoadingFactors(updatedLoadingFactors);
		const vendorLoadingFactors = updatedLoadingFactors.filter(factor => factor.vendorId === storeVId);
		setFilteredLoadingFactors(vendorLoadingFactors);

		const updatedSuppliers = selectedSupplier.map((supplier) => {
			if (supplier.id === storeVId) {
				const existingFactors = supplier.bidLoadingFactor || [];
				if (editIndex !== null) {
					existingFactors[editIndex] = newLoadingFactor;
				} else {
					existingFactors.push(newLoadingFactor);
				}
				return { ...supplier, bidLoadingFactor: existingFactors };
			}
			return supplier;
		});

		setSelectedSupplier(updatedSuppliers);

		setFactorDesc('');
		setFactorType('');
		setFactorPerc(0);
		setLoadingOn('');
		setLoadingAmount('');
		setErrors({});
		setLoadingUpdateBtn(true);
	};

	const handleDeleteLoadingFactor = (index) => {

		setLoadingUpdateBtn(true);
		const updatedLoadingFactors = filteredLoadingFactors.filter((_, i) => i !== index);
		setLoadingFactors(updatedLoadingFactors);

		const vendorLoadingFactors = updatedLoadingFactors.filter(factor => factor.vendorId === storeVId);
		setFilteredLoadingFactors(vendorLoadingFactors);

		const updatedSuppliers = selectedSupplier.map((supplier) => {
			if (supplier.id === storeVId) {
				const existingFactors = supplier.bidLoadingFactor || [];
				const updatedFactors = existingFactors.filter((_, i) => i !== index);
				return { ...supplier, bidLoadingFactor: updatedFactors };
			}
			return supplier;
		});

		setSelectedSupplier(updatedSuppliers);
	};

	const [loadingupdatebtn, setLoadingUpdateBtn] = useState(false)

	const handleEditLoadingFactor = (index) => {
		setLoadingUpdateBtn(true)
		if (filteredLoadingFactors && filteredLoadingFactors.length > index) {
			const factor = filteredLoadingFactors[index];
			setFactorDesc(factor.factorDesc || '');
			setFactorType(factor.factorType || '');
			if (factor.factorType === 'A') {
				setLoadingAmount(factor.loadingAmount || 0);
			} else {
				setFactorPerc(factor.factorPerc || 0);
			}
			setLoadingOn(factor.loadingOn || '');
			setEditIndex(index);
			setStoreVId(factor.vendorId)
		} else if (tempDataEditData && tempDataEditData[0]?.bidVendorInvited) {
			const vendorData = tempDataEditData[0].bidVendorInvited.find(v => v.vendorID === storeVId);
			if (vendorData && vendorData.bidLoadingFactor && vendorData.bidLoadingFactor.length > index) {
				const factor = vendorData.bidLoadingFactor[index];
				setFactorDesc(factor.factorDesc || '');
				setFactorType(factor.factorType || '');
				setFactorPerc(factor.factorPerc || 0);
				setLoadingOn(factor.loadingOn || '');
				setEditIndex(index);
			} else {
				console.error('Loading factor data not found or index out of bounds');
			}
		} else {
			console.error('Loading factors or temp data is not properly defined');
		}
	};

	// const validationSchemaApprover = yup.object().shape({
	//     // approveComment: yup.string().required("reason is required"),
	//     remarks: yup.string().required("reason is required")
	// });
	const validationSchemaApprover = yup.object().shape({
		remarks: yup.string().when('IsApproved', {
			is: false,
			then: (schema) => schema.required("Reason is required for rejection"),
			otherwise: (schema) => schema.notRequired()
		})
	});

	const formik_ApproveReject = useFormik({
		enableReinitialize: true,
		initialValues: {
			customerId: parseInt(customerid),
			eventId: parseInt(idFromURL),
			eventType: "Auction",
			IsApproved: tempDataEditData[0]?.approverCount == 1 ? "" : true,
			vendorId: tempDataEditData[0]?.approverCount == 1 ? "" : 0,
			remarks: "",
			activityId: parseInt(activityId),
			stageId: 0
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {

			setLoading(true)
			const bidStDate = checkUTC(tempDataEditData[0].bidStDate);
			const currentDate = new Date();
			const isCurrentAfterBid = currentDate > new Date(bidStDate);
			// if (isCurrentAfterBid && values?.actionType == "Approved" && !values?.vendorId) {
			//     toast.info("Start date of auction is passsed.Please revert to send back to creator for edit auction.");
			//     setLoading(false);
			//     return;
			// }
			const actionData = {
				customerId: parseInt(customerid),
				eventId: parseInt(idFromURL),
				eventType: "Auction",
				stageId: stageInfo?.currentStageId,
				IsApproved: values?.IsApproved,
				activityId: parseInt(activityId),
				remarks: values?.remarks,
				vendorId: values?.vendorId,
				eventSubject: tempDataEditData[0]?.subject,
				RecordCreatorId: tempDataEditData[0]?.createdById,
				bidStDate: tempDataEditData[0]?.bidStDate,
				bidDuration: tempDataEditData[0]?.bidDuration
			}

			if (values?.vendorId && values?.vendorId > 0) {
				const res = await apiClient.postres(
					`/api/ApprovalAction/ApprovalAction`,
					actionData,
					atoken
				);
				if (res) {
					toast.success(`Final Action Taken Successfully.`);
					navigate(`/app`);
				}
			} else {
				const res = await apiClient.postres(
					`/api/ApprovalAction/ApprovalAction`,
					actionData,
					atoken
				);
				if (res) {
					toast.success(`Action Taken Successfully.`);
					navigate(`/app`);
				}
			}
			setLoading(false)
		},
	});

	const [eventAppList, setEventAppList] = useState([]);
	const [wfupdate, setwfUpdate] = useState([false]);

	const VendorfilterOptions = createFilterOptions({
		matchFrom: "any",
		stringify: (option) => `${option.contactPerson} ${option.email} `,
	});

	const [pageCount, setPageCount] = React.useState(10);

	//pagination for total suppliers
	const [pageTS, setPageTS] = React.useState(1);
	const [totalpageTS, setTotalPageTS] = React.useState(3);
	useEffect(() => {
		handlePaginationTS();
		setTotalPageTS(
			Math.ceil(totalSupplier?.filter((x) => x.isShow)?.length / pageCount)
		);
	}, [pageTS, totalSupplier]);

	const handlePaginationTS = (event, value) => {
		if (value) {
			setPageTS(value);
		}
	};

	//pagination for selected suppliers
	const [pageSS, setPageSS] = React.useState(1);
	const [totalpageSS, setTotalPageSS] = React.useState(
		Math.ceil(selectedSupplier / pageCount)
	);

	useEffect(() => {
		handlePaginationSS();
		setTotalPageSS(Math.ceil(selectedSupplier.length / pageCount));
	}, [pageSS, selectedSupplier]);


	const [manageRfqData, setManageRfqData] = useState([]);
	//console.log("manageRfqData::", manageRfqData)

	useEffect(() => {
		//const eventType = tempDataEditData?.[0]?.bidParamater?.[0]?.eventType;
		const hasEventType = tempDataEditData?.[0]?.bidParamater?.some(p => p?.eventType === "RFQ");
		// if (value == 5 && eventType === "RFQ") {
		if (value == 5 && hasEventType) {

			FetchPreBidPrice();
		}
	}, [idFromURL, tempDataEditData, value]);

	const handlePaginationSS = (event, value) => {
		if (value) {
			setPageSS(value);
		}
	};

	const [confirmClearAllItems, setConfirmClearAllItems] = useState(false);



	const handleClearAll = async (changeSource) => {

		setConfirmClearAllItems(false);

		const res = await apiClient.postres(
			`/api/AuctionParameters/${idFromURL}/DeleteAll`,
			null,
			atoken
		);

		if (res) {
			if (changeSource !== "bidClosingTypeChange" && changeSource !== "bidSubTypeChange") {
				toast.success(`Bid items deleted successfully`, {
					toastId: "itemdelete_success"
				});
			}

			pullAuctionItemServiceFindCallBack(idFromURL);
		}
	};


	const handleButtonGroup = () => {

		switch (selectedMenuItem) {
			case "Submit":
				return handleBidSubmit()
			case "Save & Continue":
				return handleSaveContinue()
			case "Save as Templates":
				return handleClickOpen()
			case "Cancel":
				return handleCancel()
			case "Save":
				return handleSaveAllocation()
			case "Save & Close":
				return handleSaveAndClose()
			case "ForwardForAllocation":
				return handleAllocation()
			default:
				return ""
		}

	}

	const handleClearAllItems = (value) => {

		if (value) {
			handleClearAll()
		} else {
			setConfirmClearAllItems(false);
		}
	};

	const updateSupplierLoadingFactor = async () => {

		filteredLoadingFactors.forEach(x => {
			x.id = 0
		});
		try {
			const res = await apiClient.postres(`/api/AuctionManage/${parseInt(idFromURL)}/${storeVId}/AuctionLoadingFactor`, filteredLoadingFactors, atoken);
			if (res) {

				toast.success("Loading Factor updated successfully", {
					toastId: "loading_factor_update"
				});
				setLoadingUpdateBtn(false);
				setLoadingModal(false);
			}
		} catch (error) {

			console.error("Error updating loading factor:", error);
			toast.error("Failed to update loading factor");
		}
	};

	// to save attachment as rfq created related to attachment workflow
	const [attachmentforevent, setAttachmentforEvent] = useState(null);
	//console.log("attachmentforevent::", attachmentforevent)
	const [isUploading, setIsUploading] = useState(false);
	const handleattachmentforevent = useCallback((data) => {
		setAttachmentforEvent(data);
	}, []);

	const handleFileChange = (event) => {

		const file = event.target.files[0];
		handleExcelImport(file);
		event.target.value = "";
	};

	//integrating excel uplaod
	const fastApiClient = new FastApiClient()

	const handleExcelImport = async (file) => {
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}

		if (!file) {
			toast.error("Please select a file to upload");
			return;
		}

		let templateId;
		if ((bidtype?.id === 1 || bidtype?.id === 5) && formik.values.bidClosingType === "S") {
			templateId = 8;
		} else if ((bidtype?.id === 1 || bidtype?.id === 5) && formik.values.bidClosingType !== "S") {
			templateId = 7;
		} else if (bidtype?.id !== 1 && bidtype?.id !== 5 && formik.values.bidClosingType === "S") {
			templateId = 6;
		} else {
			templateId = 4;
		}

		const data = {
			templateId,
			customerId: parseInt(customerid),
			flagName: "BidId",
			flagId: parseInt(idFromURL),
			file,
			createdById: userDetail?.id,
			createdByName: userDetail?.name
		};

		setIsUploading(true); // Start loader

		try {
			const host = window.location.host;      // buyer.pe.com
			const cleanHost = host.split(":")[0];   // remove port
			const tenant = cleanHost.split(".")[0];
			const response = await fastApiClient.postresmultipart(`bulk-upload/excel-upload`, data, tenant);

			if (response) {
				const errorDetails = response.data?.error_details;
				// callbackItemAdd(response); // Keep this if needed in your logic

				if (Array.isArray(errorDetails) && errorDetails.length > 0) {
					const fieldToRowsMap = errorDetails.reduce((acc, err) => {
						const field = err.field;
						if (!acc[field]) acc[field] = new Set();
						acc[field].add(err.row);
						return acc;
					}, {});

					const formattedErrorElement = (
						<div style={{ maxWidth: '90vw', wordWrap: 'break-word' }}>
							{Object.entries(fieldToRowsMap).map(([field, rows], index) => (
								<div key={index} style={{ marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									<strong>{field}</strong> is missing in rows: {Array.from(rows).sort((a, b) => a - b).join(', ')}
								</div>
							))}
						</div>
					);

					toast.error(formattedErrorElement, {
						autoClose: false,
						style: {
							maxHeight: '300px',
							overflowY: 'auto',
							maxWidth: '90vw',
							width: 'auto',
							whiteSpace: 'normal',
							lineHeight: '1.5',
						},
					});
				} else {
					callbackItemAdd(response); // Keep this if needed in your logic
					toast.success("File uploaded successfully.");
				}
			}
			else {
				toast.error("Error uploading file");
			}
		}
		catch (error) {
			console.error("Upload error", error);
			toast.error("An error occurred during file upload");
		}
		finally {

			setIsUploading(false); // Stop loader
		}
	};

	const downloadItemsExcel = async () => {
		let templateId;
		if ((bidtype?.id == 1 || bidtype?.id == 5) && formik.values.bidClosingType === "S") {
			templateId = 8;
		}
		else if ((bidtype?.id == 1 || bidtype?.id == 5) && formik.values.bidClosingType !== "S") {
			templateId = 7;
		}
		else if (bidtype?.id !== 1 && bidtype?.id !== 5 && formik.values.bidClosingType === "S") {
			templateId = 6;
		}
		else if (bidtype?.id !== 1 && bidtype?.id !== 5 && formik.values.bidClosingType !== "S") {
			templateId = 4;
		}

		await downloadExcelTemplate({
			customerId: customerid,
			templateId: templateId,
			fileName: `Auction_template_${new Date().getTime()}.xlsx`,
			eventType: "Auction"
		});
	}

	//to handle edit from preview page
	const handletabEdit = (value) => {
		setBidPreview(true);
		setValue(value);
		setSelectedMenuItem("Save & Continue")
	};



	const [approvershow, setApproverShow] = useState(true)
	const handleApprover = (booleanvalue) => {

		setApproverShow(booleanvalue)
	}

	// V2 closed-state page shell (RFQ-detail-v2 visual parity) — only active
	// once the auction has actually closed; Draft/Open/Running keep today's
	// rendering untouched.
	const isClosedView = currentStage === 'Close' || currentStage === 'Awarded';
	const [workflowPanelTab, setWorkflowPanelTab] = useState('workflow');

	// Status pill dropdown — same dynamic stagelist the old horizontal
	// stepper (MemoizedEventStageFlow) used, just shown as a dropdown now.
	const [statusAnchorEl, setStatusAnchorEl] = useState(null);

	const handleStatusMenuOpen = (event) => setStatusAnchorEl(event.currentTarget);
	const handleStatusMenuClose = () => setStatusAnchorEl(null);

	const auctionStatusSteps = Array.isArray(stagelist) && stagelist.length > 0
		? stagelist.map(s => s.stageName || s.currentStage).filter(Boolean)
		: [currentStage || 'Draft'];
	const currentStatusIndex = Math.max(
		0,
		auctionStatusSteps.findIndex(
			(step) => step.toLowerCase() === (currentStage || '').trim().toLowerCase()
		)
	);

	const [open, setOpen] = React.useState(false);
	const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleMenuClick = (item) => {

		if (item != "Save as Templates") {
			setSelectedMenuItem(item);
		}
		setAnchorEl(null);

		// Special handling for ForwardForAllocation
		if (item === "ForwardForAllocation") {
			setModalAllocationOpen(true);
		}
		handleSelectButtonGroup(item)
	};

	const handleSelectButtonGroup = (selectedMenuItem) => {

		switch (selectedMenuItem) {

			case "Save as Templates":
				return handleClickOpen()
			case "Cancel":
				return handleCancel()
			case "Save":
				return handleSaveAllocation()
			case "Save & Close":
				return handleSaveAndClose()
			case "Create NFA":
				return handleCreateNFA()
			case "Send Mail to suppliers":
				return handleSendMailtoSuppliers()
			default:
				return ""
		}

	}

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleClose = () => {
		setOpen(false);
		setTemplateTitle(""); // Clear on close
	};
	const handleClickOpen = () => {
		setTemplateTitle(formik?.values?.subject || ""); // Prefill with subject
		setOpen(true);
	};


	// RFQ Template Title
	const [TemplateTitle, setTemplateTitle] = useState("")

	const handleSaveTemplate = async () => {

		if (!TemplateTitle.trim()) {
			toast.error("please enter valid name")
			return "";
		}
		if (!idFromURL) {
			toast.error("BID ID must be there to create template")
			return "";
		}

		const data = {
			"templateTitle": TemplateTitle.trim(),
			"subject": formik?.values?.subject.trim(),
			"eventType": "Auction",
			"eventId": idFromURL,
			"customerId": customerid,
			"eventTypeId": bidtype?.id
		}
		const res = await apiClient.postres("/api/EventTemplate/Add", data, atoken)
		if (res) {
			toast.success("Template saved successfully")
			setOpen(false)
		}
	}

	const [selectedAction, setSelectedAction] = useState("")
	const validationSchemaSurrogate = yup.object().shape({

		email: yup
			.string('Enter email')
			.required('Please enter your email')
			.email('Enter a valid email'),
	});
	const formik_Action = useFormik({
		enableReinitialize: true,
		initialValues: {
			supplier: null,
			name: "",
			email: "",
			Reason: ""
		},
		validationSchema: selectedAction == "Surrogate BID" ? validationSchemaSurrogate : "",
		onSubmit: async (values) => {

			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				})
				return
			}

			if (selectedAction == "Surrogate BID") {
				const payload = {
					"name": values?.name,
					"vendorId": values?.supplier?.vendorId,
					"VendorDetailId": values?.supplier?.id,
					"email": values?.email,
					"bidId": pageSlug,
					"reason": values?.Reason,
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
					setState({ ...state, ["surrogateDrawer"]: false })
					toast.success(`suppliers surrogated successfully`, {
						toastId: "surrogatetoast"
					})
					formik_Action.resetForm();
					return;

				}

			}
			else if (selectedAction == "Send Reminder") {

				const v = values?.supplier;
				const bidVendorDetails = {
					"bidId": pageSlug,
					"emailId": v?.email,
					"remarks": values?.Reason,
					"vendorId": v?.vendorId,
					"contactId": v?.contactId,
					"customerId": customerid
				}

				const payload = {
					"bidVendorDetails": [bidVendorDetails],
					"supplierActionType": "Reminder",
				}
				const res = await apiClient.postres(`/api/AuctionManage/${pageSlug}/BIDInvitation`, payload, atoken)
				if (res) {
					setState({ ...state, ["surrogateDrawer"]: false })
					toast.success(`Reminder sent successfully`, {
						toastId: "surrogatetoast"
					})
					formik_Action.resetForm();
					return;
				}
			}
		},
	});
	const [loadingModal, setLoadingModal] = useState(false);
	const CloseLoadingModal = () => {
		setLoadingModal(false);
		//setDeletedLoadingFactors([]);
		setFilteredLoadingFactors([]);
		//setIsDeleteOperation(false);
	};
	if (pageSlug && !tempDataEditData) {
		return (
			<GridSkeleton />
		)
	}

	const handleBaseCurrency = () => {
		console.log("handleBaseCurrency called, loading currencies...");
		if (currencyList.length === 0) {
			pullgetCurrency();
		}
		setModalBaseCurr(true);
	}

	const getBidTypeTitle = (bidType) => {
		const bidTypeID = tempDataEditData?.[0]?.bidTypeID;

		if (bidType?.bidTypeName) {
			switch (bidType.bidTypeName) {
				case "Reverse Auction": return "Reverse Auction";
				case "Forward Auction": return "Forward Auction";
				case "Formula Based Auction": return "Formula Based Auction";
				case "Freight Auction": return "Freight Auction";
				case "French Forward Auction": return "French Forward";
				case "French Reverse Auction": return "French Reverse";
				default: return "Unknown Auction";
			}
		}

		switch (bidTypeID) {
			case 1: return "Forward Auction";
			case 2: return "Reverse Auction";
			case 3: return "Freight Auction";
			case 4: return "Formula Based Auction";
			case 5: return "French Forward";
			case 6: return "French Reverse";
			default: return "Unknown Auction";
		}
	};

	//allocation modal
	const handleAllocation = () => {
		setModalAllocationOpen(true);
	}

	const handleAllocationModal = async (confirm) => {

		if (confirm) {
			const values = {
				bidId: parseInt(idFromURL),
				CustomerId: customerid,
				status: "Allocation",
				activityId: parseInt(activityId)
			}
			const datapayload = getPayloadWithStage(
				"currentStage",
				currentStage,
				stagelist,
				values,
				"currentStage"
			);
			const res = await apiClient.postres(
				`/api/AuctionManage/FwrdToAllocationAndAwarded`,
				datapayload,
				atoken
			);

			if (res) {
				toast.success(`Auction Allocation Successfully.`, {
					toastId: "Auction_Allocation"
				});
				navigate(`/configuration/manage-auction`);
			}
		} else {
			setModalAllocationOpen(false);
			setSelectedMenuItem("Save & Continue")
		}
	};

	const handleSaveAllocation = async () => {
		//logic for save allocation
		const res = await NFASOBRFQRef?.current?.saveSOBDetails();
		// After saving, check if allocation exists and update button
		if (res && NFASOBRFQRef.current && typeof NFASOBRFQRef.current.isAllocationSubmitted === 'function') {
			const submitted = NFASOBRFQRef.current.isAllocationSubmitted();
			if (submitted) {
				setSelectedMenuItem("Save & Close");
			}
		}
	}

	const handleSendAllocationEmail = async () => {

		const data = {
			eventId: idFromURL,
			eventType: "Auction",
		}
		const queryParams = buildQueryParams(data)

		const res = await apiClient.postres(
			`/api/NFAManage/SendSOBEmail`,
			queryParams,
			atoken
		);
		//console.log("SendSOBEmail res::", res)
	}

	const handleSaveAndClose = async () => {

		//logic for save and close
		const res1 = await NFASOBRFQRef?.current?.saveSOBDetails();
		if (res1) {
			handleSendAllocationEmail();
			handleAwarded();
		}
	}

	const handleAwarded = async () => {

		const values = {
			bidId: parseInt(idFromURL),
			CustomerId: customerid,
			status: "Awarded",
			activityId: parseInt(activityId)
		}
		const datapayload = getPayloadWithStage(
			"currentStage",
			currentStage,
			stagelist,
			values,
			"currentStage"
		);
		const res = await apiClient.postres(
			`/api/AuctionManage/FwrdToAllocationAndAwarded`,
			datapayload,
			atoken
		);

		if (res) {
			toast.success(`Auction Awarded Successfully.`, {
				toastId: "Auction_Awarded"
			});
			navigate(`/configuration/manage-auction`);
		}
	};

	const handleCreateNFA = () => {
		//logic for create nfa
	}
	const handleSendMailtoSuppliers = async () => {

		const res = await apiClient.getres(
			`/api/AuctionManage/AuctionCloseEmail?bidid=${idFromURL}&stage=Auction Close Email`,
			atoken
		);
		if (res) {
			toast.success(`Email sent successfully`, {
				toastId: "emailsent_successfully"
			});
		}
	}

	//cancel bid
	const handleCancel = () => {
		setModalCancelOpen(true);
	}

	const handleCancelRFQModal = async (confirm) => {
		if (confirm) {
			if (!cancelReason.trim()) {
				setBidError("This field is required.");
				return;
			}
			else {
				const cancelbuttonvalue = {
					bidId: parseInt(pageSlug),
					Status: "Cancel",
					Comment: cancelReason,
					EventType: "Auction",
					CurrentStage: tempDataEditData[0]?.stage
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
		setCancelReason(e.target.value);
		if (e.target.value.trim()) {
			setBidError("");
		}
	};


	const handleSupplierSurrogate = (v, action) => {

		setState({ ...state, surrogateDrawer: true });
		if (action == "Surrogate") {
			setSelectedAction("Surrogate BID")
		}
		else if (action == "Reminder") {
			setSelectedAction("Send Reminder")
		}

		formik_Action.setFieldValue("supplier", v)
	}

	const handleSupplierAction = (v, action) => {

		switch (action) {
			case "Surrogate":
				return handleSupplierSurrogate(v, action)
			case "Reminder":
				return handleSupplierSurrogate(v, action)
			default:
				return null;
		}
	};

	//calling api for mapping data when coming from rfq
	const FetchPreBidPrice = async () => {
		try {

			const rfqParam = tempDataEditData?.[0]?.bidParamater?.find(
				p => p?.eventType === "RFQ"
			);

			var data = {
				// rfqid: tempDataEditData[0]?.bidParamater[0]?.eventId ? tempDataEditData[0]?.bidParamater[0]?.eventId : 0,
				rfqid: rfqParam?.eventId ?? 0,
				auctionId: pageSlug ? parseInt(pageSlug) : 0
			};

			if (data.length === 0) {
				return;
			}
			const queryParams = buildQueryParams(data)
			const res = await apiClient.getres(`/api/AuctionManage/AuctionPreBidPrice?${queryParams}`, atoken)
			if (res) {

				const data = res?.data ?? []
				setManageRfqData(data);
			} else {
				toast.error("No data found.")
				setManageRfqData([]);
				return;
			}
		} catch (error) {
			toast.error("Something went wrong please contact administrator.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: 2000,
			});
			setManageRfqData([]);
			return;
		}
	}

	// Step 1: Map manageRfqData with tempDataEditData
	const mapPrebidValues = () => {

		if (!manageRfqData || !tempDataEditData?.[0]?.bidParamater) return [];

		const customerId = tempDataEditData[0]?.customerId;
		const bidId = tempDataEditData[0]?.id;
		const bidTypeID = tempDataEditData[0]?.bidTypeID;
		const bidSubTypeId = tempDataEditData[0]?.bidSubTypeId;

		// Merge on bidParamId === id
		return manageRfqData
			.filter((sq) => sq.itemPrice !== null && sq.itemPrice !== undefined)
			.map((sq) => {
				const matchedParam = tempDataEditData[0].bidParamater.find(
					(param) => param.id === sq.bidParamId
				);

				if (matchedParam) {
					return {
						id: 0,
						createdById: sq.vendorId,
						bidParameterId: sq.bidParamId,
						quotedPrice: sq.itemPrice ?? 0,
						//rank: sq.rank ?? 0,
						customerId: parseInt(customerId),
						bidId: parseInt(bidId),
						isPrePrice: true,
						bidTypeID,
						bidSubTypeId,
					};
				}
				return null;
			})
			.filter(Boolean);
	};

	const submitPrebid = async () => {

		const prebidValues = mapPrebidValues();

		if (prebidValues.length > 0) {
			try {
				const res = await apiClient.postres(
					`/api/AuctionParticipation/SubmitPreBid`,
					prebidValues,
					atoken
				);

				if (res) {
					//console.log("PreBid prices added successfully.");
					return true;
				} else {
					toast.error("Error fetching response");
					return false;
				}
			} catch (err) {
				console.error("Error submitting bid: ", err);
				toast.error("An error occurred while submitting the bid.");
				return false;
			}
		} else {
			toast.error(`Enter at least one prebid.`, {
				toastId: "prebid_added",
				autoClose: 2000,
			});
			return false;
		}
	};
	console.log("formik----", formik.values)
	return (
		<>
			<div className="mainContainer d-flex rfq-modern-shell">
				<div className={`leftContent ${isClosedView || approvershow ? "col-9" : "col-12"} d-flex flex-column`}>
					<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0 }}>
						{isClosedView ? (
							<div className="rfq-dv2-page-head border-bottom mb-3" style={{ flexShrink: 0 }}>
								<div className="rfq-dv2-head-top">
									{breadcrumb}
									<div className="rfq-dv2-actions">
										<button
											type="button"
											className="rfq-dv2-action-btn rfq-dv2-action-btn--ghost"
											onClick={() => handleMenuClick('Cancel')}
											disabled={!pageSlug}
										>
											Cancel
										</button>
										{currentStage === 'Awarded' && (
											<>
												<button
													type="button"
													className="rfq-dv2-action-btn pe-btn--secondary"
													onClick={() => handleMenuClick('Send Mail to suppliers')}
												>
													Send Mail to suppliers
												</button>
												<button
													type="button"
													className="rfq-dv2-action-btn rfq-dv2-action-btn--primary"
													onClick={() => handleMenuClick('Create NFA')}
												>
													Create NFA
												</button>
											</>
										)}
										{currentStage === 'Close' && (
											<button
												type="button"
												className="rfq-dv2-action-btn rfq-dv2-action-btn--primary"
												onClick={() => handleMenuClick('ForwardForAllocation')}
											>
												Forward For Allocation
											</button>
										)}
									</div>
								</div>
								<div className="rfq-dv2-head-bottom">
									<span className="rfq-dv2-meta-item">
										<span className="rfq-dv2-meta-label">Status</span>
										<button
											type="button"
											className={`rfq-dv2-status-pill`}
											onClick={handleStatusMenuOpen}
										>
											<span className="rfq-dv2-status-dot" />
											{currentStage}
										</button>
									</span>
									{formik?.values?.bidStDate && (
										<span className="rfq-dv2-meta-item">
											<span className="rfq-dv2-meta-label">Start Date/Time:</span>{" "}
											<span className="rfq-dv2-meta-value">
												{formatDateViaLocale2(formik?.values?.bidStDate, userDetail)}
											</span>
										</span>
									)}
									{formik?.values?.bidEndDate && (
										<span className="rfq-dv2-meta-item">
											<span className="rfq-dv2-meta-label">End Date/Time:</span>{" "}
											<span className="rfq-dv2-meta-value">
												{formatDateViaLocale2(formik?.values?.bidEndDate, userDetail)}
											</span>
										</span>
									)}
									<Menu
										anchorEl={statusAnchorEl}
										open={Boolean(statusAnchorEl)}
										onClose={handleStatusMenuClose}
										classes={{ paper: "rfq-dv2-status-menu-paper" }}
										anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
										transformOrigin={{ vertical: "top", horizontal: "left" }}
										PaperProps={{
											style: {
												width: 280,
												minWidth: 280,
												maxWidth: 280,
												overflow: "hidden",
											}
										}}
									>
										<div className="rfq-dv2-status-menu">
											<div className="rfq-dv2-status-menu-title">Auction Status</div>
											<div className="rfq-dv2-status-menu-list">
												{auctionStatusSteps.map((step, index) => {
													const stepClass =
														index < currentStatusIndex
															? ""
															: index === currentStatusIndex
																? "is-current"
																: "is-future";
													return (
														<div key={step} className={`rfq-dv2-status-step ${stepClass}`}>
															<span className="rfq-dv2-status-step-icon" />
															<span>{step}</span>
														</div>
													);
												})}
											</div>
										</div>
									</Menu>
								</div>
							</div>
						) : (
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3 bg-grey">
								<div className="d-flex align-items-center">
									<BackButton
										title={
											tempDataEditData[0]?.eventCode
												? `${getBidTypeTitle(bidtype)} | ${tempDataEditData[0]?.eventCode}`
												: idFromURL
													? `${getBidTypeTitle(bidtype)} | ${idFromURL}`
													: getBidTypeTitle(bidtype)
										}
										modal={true}
									/>
								</div>
								{/* Stage Flow - centered between title and buttons */}
								<div className="d-flex justify-content-center flex-grow-1">
									<MemoizedEventStageFlow
										stagelist={stagelist}
										currentStage={currentStage}
									/>
								</div>
								{/* Action Buttons */}
								<div className="d-flex align-items-center gap-2">
									{!loading ? (
										actionType && activityId ? (
											<Button
												type="button"
												size="small"
												className="button-text text-white"
												variant="contained"
												onClick={() =>
													setState({
														...state,
														openInvoiceApproved: true,
													})
												}
											>
												Action
											</Button>
										) : (
											<ButtonGroup variant="contained">
												<Button
													variant="contained"
													className="p-2 pt-1 pb-1"
													onClick={handleButtonGroup}
													sx={{ padding: '2px 8px', minHeight: '28px', lineHeight: '1' }}
													disabled={value == 8 ? currentStage != 'Allocation' : !stagearray.includes(currentStage)}
												>
													<span className="text-capitalize">{selectedMenuItem}</span>
												</Button>

												<Button
													variant="contained"
													className="button-text text-white"
													onClick={handleMenuOpen}
													sx={{ padding: '2px 8px', minHeight: '28px', lineHeight: '1' }}
												>
													<ExpandMore />
												</Button>

												<Menu
													anchorEl={anchorEl}
													open={Boolean(anchorEl)}
													onClose={handleMenuClose}
												>
													{value === "5" && (
														<MenuItem onClick={() => handleMenuClick('Submit')}>
															<div>
																<span className="text-capitalize">
																	Submit
																</span>
															</div>
														</MenuItem>
													)}

													{currentStage == 'Draft' && value !== "5" && (
														<MenuItem onClick={() => handleMenuClick('Save & Continue')}>
															<div>
																<span className="text-capitalize">
																	{value === 4 ? "Save Suppliers" : "Save & Continue"}
																</span>
															</div>
														</MenuItem>
													)}
													{currentStage == 'Allocation' && value == "8" && (
														<MenuItem onClick={() => handleMenuClick('Save')}>
															<div>
																<span className="text-capitalize"> Save </span>
															</div>
														</MenuItem>
													)}
													{currentStage == 'Allocation' && value == "8" && (
														<MenuItem onClick={() => handleMenuClick('Save & Close')}>
															<div>
																<span className="text-capitalize"> Save & Close </span>
															</div>
														</MenuItem>
													)}
													{currentStage == 'Close' && (
														<MenuItem onClick={() => handleMenuClick('ForwardForAllocation')}>
															<div>
																<span className="text-capitalize"> Forward For Allocation</span>
															</div>
														</MenuItem>
													)}

													{currentStage == 'Awarded' && (
														<MenuItem onClick={() => handleMenuClick('Send Mail to suppliers')}>
															<div>
																<span className="text-capitalize"> Send Mail to suppliers </span>
															</div>
														</MenuItem>
													)}
													{currentStage == 'Awarded' && (
														<MenuItem onClick={() => handleMenuClick('Create NFA')}>
															<div>
																<span className="text-capitalize"> Create NFA </span>
															</div>
														</MenuItem>
													)}

													{stagearray.includes(currentStage) && (
														<MenuItem onClick={() => handleMenuClick('Save as Draft')}>
															<div>
																<span className="text-capitalize">Save as Draft</span>
															</div>
														</MenuItem>
													)}

													{idFromURL && currentStage && currentStage == 'Draft' && (
														<MenuItem onClick={() => handleMenuClick('Save as Templates')}>
															<div>
																<span className="text-capitalize">Save as Templates</span>
															</div>
														</MenuItem>
													)}
													<MenuItem onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
														<div>
															<span className="text-capitalize">Cancel</span>
														</div>
													</MenuItem>
												</Menu>
											</ButtonGroup>
										)
									) : (
										<Button className="button-text text-white">
											{value == 5 ? "Publishing..." : "Submit..."}
										</Button>
									)}
								</div>
							</div>
						)}

						{/* Tab Navigation and Icons Header */}
						<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
							<Box sx={{
								flexGrow: 1,
								maxWidth: { xs: 280, sm: 480, md: '100%' },
							}}>
								<Tabs
									value={value}
									onChange={handleChange}
									textColor="primary"
									className='tabstheme'
									indicatorColor="primary"
									variant="scrollable"
									allowScrollButtonsMobile
								>
									<Tab
										value={1}
										label={<span className="section-heading" style={{ color: '#1a2742' }}>General</span>}
									/>

									<Tab
										value={2}
										label={<span className="section-heading" style={{ color: '#1a2742' }}>Items/Services</span>}
										disabled={!idFromURL}
									/>

									{bidtype && ![1, 2, 5, 6].includes(bidtype.id) && (
										<Tab
											value={3}
											label={<span className="section-heading" style={{ color: '#1a2742' }}>Commercial Terms</span>}
											disabled={!idFromURL}
										/>
									)}

									<Tab
										value={4}
										label={<span className="section-heading" style={{ color: '#1a2742' }}>Invite Supplier</span>}
										disabled={!idFromURL}
									/>
									{idFromURL && currentStage.trim() == "Draft" && (
										<Tab
											value={5}
											label={<span className="section-heading" style={{ color: '#1a2742' }}>Preview</span>}
											disabled={!bidpreview}
										/>
									)}
									{bidtype && idFromURL && ["close", "running", "awarded", "paused", "open", "allocation"].includes(tempDataEditData[0]?.stage?.trim().toLowerCase()) && (
										<Tab
											value={6}
											label={<span className="section-heading" style={{ color: '#1a2742' }}>Manage Auction</span>}
										/>
									)}
									{bidtype && idFromURL && ["close", "awarded", "paused", "open", "allocation"].includes(tempDataEditData[0]?.stage?.trim().toLowerCase()) && (
										<Tab
											value={7}
											label={<span className="section-heading" style={{ color: '#1a2742' }}>Recent Queries</span>}
										/>
									)}
									{idFromURL && (currentStage.trim() == "Allocation" || currentStage.trim() == "Awarded") && stagelist?.some(item => item.currentStage == "Allocation") && (
										<Tab
											value={8}
											label={<span className="section-heading" style={{ color: '#1a2742' }}>Allocation</span>}
											disabled={!idFromURL}
										/>
									)}
								</Tabs>
							</Box>

							<div className="d-flex align-items-center gap-2 rfq-dv2-tab-actions" aria-hidden="true">
								<AttachmentWorkFlow
									eventtype={`Auction`}
									eventid={idFromURL}
									action={stagearray.includes(currentStage)}
									handleattachmentforevent={handleattachmentforevent}
									permissionManager={permissionManager}
									onCountChange={handleAttachmentCount}
									ref={attachmentdrawerref}
								/>

								{idFromURL && (<HistoryCell eventtype={`Auction`} eventId={idFromURL}
									permissionManager={permissionManager}
								/>)}

								{idFromURL && (<Tooltip title="Show/Hide Approvers">
									<IconButton
										onClick={() => handleApprover(!approvershow)}
										size="small"
										edge="start"
										className="pointer"
									>
										<div className="approverCircle shadow-sm">
											<PeopleAltIcon />
										</div>
									</IconButton>
								</Tooltip>
								)}
							</div>
						</div>
						<div className="flex-grow-1 p-1 hidden-scrollbar">

							{value == 1 && (() => {
								if (loadingPermissions) return <GridSkeleton />;
								const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
								const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false;
								const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
								const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? false;
								if (!hasReadPermission) {
									return (
										<div className="p-4">
											<Alert severity="error">
												<div className="d-flex align-items-center">
													<HiOutlineX className="me-2 f18" />
													Access Denied: You don't have permission to view General settings.
												</div>
											</Alert>
										</div>
									);
								}
								return (
									<>
										{stagearray.includes(currentStage) && (
											<div className='custom-fix p-3 pe-2 ps-2'>
												<form onSubmit={formik.handleSubmit} autoComplete="off">
													<div className="row mt-2">
														<div className="col-12 mb-4">
															<TextFieldCell
																id="subject"
																name="subject"
																label="Subject *"
																placeholder=""
																maxLength={200}
																disabled={!hasEditPermission}
																value={formik.values.subject}
																onChange={formik.handleChange}
																error={formik.touched.subject && Boolean(formik.errors.subject)}
																helperText={formik.touched.subject && formik.errors.subject}
																InputProps={{
																	endAdornment: formik.values.subject && (
																		<InputAdornment position="end">
																			<Typography
																				variant="body2"
																				color="textSecondary"
																			>
																				{formik.values.subject.length}/200
																			</Typography>
																		</InputAdornment>
																	),
																}}
															/>
															{formik.values.subject && (
																<div
																	style={{
																		fontSize: "0.8em",
																		color: "blue",
																		textAlign: "end",
																	}}
																>
																</div>
															)}
														</div>
														<div className="col-12 mb-3">
															<div className="f12 text-muted mb-1">
																Description *
															</div>
															<ReactQuill
																id="descriptionquill"
																theme="snow"
																preserveWhitespace
																className=""
																readOnly={!hasEditPermission}
																value={formik.values.description}
																onChange={(value) => {

																	const description = extractTextFromHTML(value);

																	const length = description.length;
																	if (length <= 2000) {
																		formik.setFieldValue(
																			"description",
																			value
																		);
																	} else {

																		formik.setFieldValue(
																			"description",
																			formik.values.description
																		);
																		toast.error('Description greater than 2000 character is not allowed', {
																			toastId: "descerr"
																		});

																	}
																}}
															/>
															{formik.values.description !== undefined && (
																<div
																	style={{
																		fontSize: "0.8em",
																		color: "grey",
																		textAlign: "end",
																	}}
																>
																	{`${extractTextFromHTML(formik.values.description).length}/2000`}{" "}
																</div>
															)}
															{formik.touched.description &&
																Boolean(formik.errors.description) ? (
																<>
																	<FormHelperText className="text-danger">
																		{formik.errors.description}
																	</FormHelperText>
																</>
															) : (
																<></>
															)}
														</div>
														<LocalizationProvider dateAdapter={AdapterDayjs}>
															<div className="col-12 col-md-3 col-lg-3 mb-4">
																<MobileDateTimePicker
																	variant="outlined"
																	label="Start Date *"
																	size="small"
																	name="bidStDate"
																	id="bidStDate"
																	timezone={userDetail?.timeZone}
																	disabled={!hasEditPermission}
																	minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)} // Set min date/time to current
																	value={formik.values.bidStDate}
																	className="w-100 f14"
																	slotProps={{
																		textField: {
																			variant: 'outlined',
																			size: 'small',
																			InputLabelProps: { shrink: true },
																			error: formik.touched.bidStDate && Boolean(formik.errors.bidStDate),
																			helperText: formik.touched.bidStDate && formik.errors.bidStDate
																		},
																		actionBar: { actions: ["clear", "cancel", "accept"] }
																	}}
																	onChange={(newValue) => {

																		formik.setFieldValue('bidStDate', newValue);
																		updateBidEndDate(newValue, formik.values.bidDuration);
																		updateBidDuration(newValue, formik.values.bidEndDate);
																	}}
																	format={getDateFormatPatteronLocale(userDetail)}
																	ampm={userampm(userDetail)}
																/>
															</div>
															<div className="col-12 col-md-3 col-lg-3 mb-4">
																<MobileDateTimePicker
																	variant="outlined"
																	label="End Date"
																	size="small"
																	name="bidEndDate"
																	id="bidEndDate"
																	timezone={userDetail?.timeZone}
																	minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																	value={formik.values.bidEndDate}
																	className="w-100 f14"
																	slotProps={{
																		textField: {
																			variant: 'outlined',
																			size: 'small',
																			InputLabelProps: { shrink: true },
																		},
																		actionBar: { actions: ["clear", "cancel", "accept"] }
																	}}
																	onChange={(newValue) => {

																		formik.setFieldValue('bidEndDate', newValue);
																		updateBidDuration(formik.values.bidStDate, newValue);
																	}}
																	disabled={formik.values.bidClosingType == 'S' || formik.values.bidSubTypeId == 82 || !hasEditPermission}
																	format={getDateFormatPatteronLocale(userDetail)}
																	ampm={userampm(userDetail)}
																/>
															</div>
															<div className="col-12 col-md-3 col-lg-3 mb-4">
																<TextField
																	name="bidDuration"
																	id="bidDuration"
																	className="w-100 f14"
																	value={formik.values.bidDuration || ''}
																	size="small"
																	label={`Duration (mins)${formik.values.bidClosingType !== 'S' ? ' *' : ''}`}
																	variant="outlined"
																	inputProps={{
																		maxLength: 7,
																		inputMode: 'numeric',
																		pattern: "[0-9]*"
																	}}
																	onKeyDown={(e) => {
																		if (
																			!/[0-9]/.test(e.key) &&
																			e.key !== 'Backspace' &&
																			e.key !== 'ArrowLeft' &&
																			e.key !== 'ArrowRight' &&
																			e.key !== 'Tab'
																		) {
																			e.preventDefault();
																		}
																	}}
																	onChange={(e) => {
																		const newDuration = e.target.value ? e.target.value : 0;
																		formik.setFieldValue('bidDuration', newDuration);
																		updateBidEndDate(formik.values.bidStDate, newDuration);
																	}}
																	disabled={formik.values.bidClosingType == 'S' || formik.values.bidSubTypeId == 82 || !hasEditPermission}
																/>
																{formik.errors.bidDuration && formik.touched.bidDuration && (
																	<div className="error error-red" style={{ fontSize: '12px' }}>
																		{formik.errors.bidDuration}
																	</div>
																)}
															</div>
															<div className="col-12 col-md-3 col-lg-3 mb-4">
																{bidtype?.id == 1 || bidtype?.id == 5 ? (
																	<TextField
																		id="showRankToVendor"
																		name="showRankToVendor"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Display Vendors Rank*"
																		variant="outlined"
																		value={formik.values.showRankToVendor}
																		disabled={!hasEditPermission}
																		onChange={formik.handleChange}
																	>
																		<MenuItem value="Y">As H1, H2, H3 etc.</MenuItem>
																		<MenuItem value="N">As H1 Or Not H1.</MenuItem>
																		{/* <MenuItem value="T">Traffic Light.</MenuItem> */}
																	</TextField>
																) : (
																	<TextField
																		id="showRankToVendor"
																		name="showRankToVendor"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Display Vendors Rank*"
																		variant="outlined"
																		value={formik.values.showRankToVendor}
																		disabled={!hasEditPermission || formik.values.bidSubTypeId == 82}
																		onChange={formik.handleChange}
																	>
																		<MenuItem value="Y">As L1, L2, L3 etc.</MenuItem>
																		<MenuItem value="N">As L1 Or Not L1.</MenuItem>
																		{/* <MenuItem value="T">Traffic Light.</MenuItem> */}
																	</TextField>
																)}
															</div>
														</LocalizationProvider>
														<div className="col-12">
															<div className="row">
																<div className="col-12 col-md-3 col-lg-3 mb-4">

																	<TextField
																		id="bidClosingType"
																		name="bidClosingType"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Closing Type *"
																		variant="outlined"
																		value={formik.values.bidClosingType}
																		disabled={formik.values.bidSubTypeId == 82 || bidtype?.id == 4 || bidtype?.id == 5 || bidtype?.id == 6 || !hasEditPermission}
																		onChange={(event) => {

																			const selectedValue = event.target.value;
																			formik.setFieldValue("bidClosingType", selectedValue);

																			if (selectedValue === 'S') {
																				formik.setFieldValue("noOfStaggerItems", 1);
																				formik.setFieldValue("bidEndDate", null);
																				formik.setFieldValue("bidDuration", 0);
																			} else {
																				formik.setFieldValue("noOfStaggerItems", 0);
																				formik.setFieldValue("bidEndDate", null);
																				formik.setFieldValue("bidDuration", 0);
																			}
																		}}
																	>
																		<MenuItem value='A'>
																			All Items In One go
																		</MenuItem>
																		<MenuItem value='S'>
																			Stagger At Item Level
																		</MenuItem>

																	</TextField>
																</div>
																{formik.values.bidClosingType === 'S' && (
																	<div className="col-12 col-md-3 col-lg-3 mb-4">
																		<div className="">
																			<TextField
																				id="noOfStaggerItems"
																				name="noOfStaggerItems"
																				className="w-100 f14"
																				size="small"
																				label="Items to run simultaneously *"
																				variant="outlined"
																				value={formik.values.noOfStaggerItems}
																				disabled={!hasEditPermission}
																				onChange={formik.handleChange}
																			/>
																		</div>
																	</div>
																)}
																<div className="col-12 col-md-3 col-lg-3 mb-4">
																	<TextField
																		name="bidSubTypeId"
																		id="bidSubTypeId"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Auction Type *"
																		variant="outlined"
																		value={formik.values.bidSubTypeId}
																		disabled={bidtype?.id == 4 || !hasEditPermission}
																		//onChange={formik.handleChange}
																		onChange={(e) => {
																			const value = e.target.value;
																			formik.setFieldValue("bidSubTypeId", value);
																			if (value === 82) {
																				formik.setFieldValue("showRankToVendor", "N");
																				formik.setFieldValue("bidEndDate", null);
																				formik.setFieldValue("bidDuration", 0);
																				formik.setFieldValue("bidClosingType", 'A');
																			} else {
																				formik.setFieldValue("showRankToVendor", "Y");
																				formik.setFieldValue("bidEndDate", null);
																				formik.setFieldValue("bidDuration", 0);
																				formik.setFieldValue("bidClosingType", 'A');
																			}
																		}}
																	>
																		<MenuItem value={81}>
																			English
																		</MenuItem>
																		<MenuItem value={83}>
																			Japanese
																		</MenuItem>
																		<MenuItem value={82}>
																			Dutch
																		</MenuItem>

																	</TextField>
																</div>
																<div className="col-12 col-md-3 col-lg-3 mb-4">
																	<TextField
																		id="maximumExtension"
																		name="maximumExtension"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Maximum No. of Bid Extensions"
																		variant="outlined"
																		value={formik.values.maximumExtension}
																		onChange={(e) => {
																			const value = parseInt(e.target.value, 10);
																			formik.setFieldValue("maximumExtension", value);
																			if (value === 0) {
																				formik.setFieldValue("extensionDuration", 0);
																			} else {
																				formik.setFieldValue("extensionDuration", 2);
																			}
																		}}
																	>
																		<MenuItem value={-1}>
																			Unlimited
																		</MenuItem>
																		<MenuItem value={0}>
																			0
																		</MenuItem>
																		<MenuItem value={1}>
																			1
																		</MenuItem>
																		<MenuItem value={2}>
																			2
																		</MenuItem>
																		<MenuItem value={3}>
																			3
																		</MenuItem>
																		<MenuItem value={4}>
																			4
																		</MenuItem>
																		<MenuItem value={5}>
																			5
																		</MenuItem>
																		<MenuItem value={6}>
																			6
																		</MenuItem>
																		<MenuItem value={7}>
																			7
																		</MenuItem>
																		<MenuItem value={18}>
																			8
																		</MenuItem>
																		<MenuItem value={9}>
																			9
																		</MenuItem>
																		<MenuItem value={10}>
																			10
																		</MenuItem>
																	</TextField>
																</div>
																{formik.values.bidClosingType !== 'S' && (
																	<div className="col-12 col-md-3 col-lg-3 mb-4">
																		<TextField
																			id="extensionDuration"
																			name="extensionDuration"
																			className="w-100 f14"
																			size="small"
																			label="Extension Duration (mins)"
																			variant="outlined"
																			InputProps={{
																				inputProps: {
																					min: 0,
																					max: 10,
																					step: 1,
																				},
																			}}
																			value={formik.values.extensionDuration}
																			onChange={(e) => {
																				const value = e.target.value;
																				if (value === "" || parseInt(value, 10) <= 10) {
																					formik.setFieldValue(
																						"extensionDuration",
																						value === "" ? "" : parseInt(value, 10)
																					);
																				}
																			}}
																			disabled={formik.values.maximumExtension === 0 || !hasEditPermission}
																		/>
																		{formik.errors.extensionDuration && formik.touched.extensionDuration && (
																			<div className="error error-red" style={{ fontSize: "12px" }}>
																				{formik.errors.extensionDuration}
																			</div>
																		)}
																	</div>
																)}
															</div>
														</div>
														<div className="col-12 ">
															<div className="row">
																{formik.values.bidClosingType == 'S' && (
																	<div className="col-12 col-md-3 col-lg-3 mb-4">
																		<TextField
																			id="extensionDuration"
																			name="extensionDuration"
																			className="w-100 f14"
																			size="small"
																			label="Extension Duration (In Minutes)"
																			variant="outlined"
																			InputProps={{
																				inputProps: {
																					min: 0,
																					max: 10,
																					step: 1,
																				},
																			}}
																			value={formik.values.extensionDuration}
																			onChange={(e) => {
																				const value = e.target.value;
																				if (value === "" || parseInt(value, 10) <= 10) {
																					formik.setFieldValue(
																						"extensionDuration",
																						value === "" ? "" : parseInt(value, 10)
																					);
																				}
																			}}
																			disabled={formik.values.maximumExtension === 0 || !hasEditPermission}
																		/>
																		{formik.errors.extensionDuration && formik.touched.extensionDuration && (
																			<div className="error error-red" style={{ fontSize: "12px" }}>
																				{formik.errors.extensionDuration}
																			</div>
																		)}
																	</div>
																)}
																<div className="col-12 col-md-3 col-lg-3 mb-4">
																	<TextField
																		id="hideVendor"
																		name="hideVendor"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Mask Participants during Bidding *"
																		variant="outlined"
																		value={formik.values.hideVendor}
																		disabled={!hasEditPermission}
																		onChange={(event) => {
																			formik.setFieldValue('hideVendor', event.target.value === 'true');
																		}}
																	>
																		<MenuItem value='false'>
																			No
																		</MenuItem>
																		<MenuItem value='true'>
																			Yes
																		</MenuItem>
																	</TextField>
																</div>
																<div className="col-12 col-md-3 col-lg-3 mb-4">
																	<TextField
																		id="hideQuote"
																		name="hideQuote"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Mask Quotes during Bidding *"
																		variant="outlined"
																		value={formik.values.hideQuote}
																		disabled={!hasEditPermission}
																		onChange={(event) => {
																			formik.setFieldValue('hideQuote', event.target.value === 'true');
																		}}
																	>
																		<MenuItem value='false'>
																			No
																		</MenuItem>
																		<MenuItem value='true'>
																			Yes
																		</MenuItem>
																	</TextField>
																</div>
															</div>
														</div>
														<div className="col-12 mb-1">
															<FormControl className="w-100">
																<FormLabel id="baseCurrency">
																	<span className="f13">
																		Select Currency Mode
																	</span>
																</FormLabel>
																<RadioGroup
																	row
																	aria-labelledby="baseCurrency"
																	name="baseCurrency"
																	value={formik.values.isMultiCurrency}
																	onChange={(e) => {
																		formik.setFieldValue(
																			"isMultiCurrency",
																			e.target.value == "true" ? true : false
																		);
																		formik.setFieldValue(
																			"baseCurrency",
																			userDetail?.defaultCurrency
																		);
																	}}
																>
																	<FormControlLabel
																		value={false}
																		control={<Radio />}
																		disabled={!hasEditPermission}
																		label={
																			<span >
																				Base Currency{" "}
																				{userDetail &&
																					userDetail?.defaultCurrency ? (
																					<span className="f12 text-primary pointer" onClick={handleBaseCurrency}>
																						({`${formik?.values?.baseCurrency || userDetail?.defaultCurrency}`})
																					</span>
																				) : (
																					<span className="f12 pointer" onClick={handleBaseCurrency}>(INR)</span>
																				)}
																			</span>
																		}
																	/>
																	<FormControlLabel
																		value={true}
																		control={<Radio />}
																		disabled={!hasEditPermission}
																		label="Multiple Currency"
																	/>
																</RadioGroup>
															</FormControl>
															{
																formik.values.isMultiCurrency ? (
																	<>
																		<div className="row">
																			<div className="col-12">
																				<div className="row">
																					<div className="col-12 col-lg-12 mt-3">
																						{inputList?.map((x, i) => {
																							return (
																								<div
																									className="row  d-flex align-items-center w-100 mb-3"
																									key={i}
																								>
																									<div className="col-lg-4 col-12">
																										<Autocomplete
																											id={"baseCurrency" + i}
																											name="baseCurrency"
																											options={[
																												...(currencyList?.filter(cl => cl.currencyNm !== (userDetail?.defaultCurrency || "INR")) || []),
																												{ currencyNm: "Add New", id: "new" }
																											]}
																											getOptionLabel={(option) => option.currencyNm ?? ''}
																											disabled={!hasEditPermission}
																											onChange={(event, value) => {
																												if (value?.id === "new") {
																													setOpenCurrencyModal(true);
																												} else {
																													handleInputChange({ target: { value: value?.currencyNm, name: "baseCurrency" } }, i);
																												}
																											}}
																											onOpen={() => {
																												if (currencyList.length === 0)
																													pullgetCurrency();
																											}}
																											value={
																												currencyList.find(
																													(option) => option.currencyNm === x.baseCurrency
																												) || (x.baseCurrency ? { currencyNm: x.baseCurrency } : null)
																											}
																											isOptionEqualToValue={(option, value) => {
																												if (!value) return false;
																												if (option.id === "new") return false;
																												return option.currencyNm === value.currencyNm;
																											}}
																											renderInput={(params) => (
																												<TextField
																													{...params}
																													InputLabelProps={{
																														shrink: true,
																													}}
																													name="baseCurrency"
																													label="Select Currency *"
																													variant="outlined"
																													size="small"
																													className="w-100 f14"
																												/>
																											)}
																											renderOption={(props, option) => (
																												<Box
																													component="li"
																													{...props}
																													key={option.id || option.currencyNm}
																													style={
																														option.id === "new"
																															? {
																																fontStyle: "italic",
																																color: "blue",
																																cursor: "pointer",
																																textDecoration: "underline",
																															}
																															: {}
																													}
																												>
																													{option.currencyNm}
																												</Box>
																											)}
																											noOptionsText="No options"
																											style={{ width: '100%' }}
																										/>
																									</div>
																									<div className="col-lg-4 col-12">
																										<TextField
																											variant="outlined"
																											InputLabelProps={{
																												shrink: true,
																											}}
																											className={`w-100 ${x.baseCurrency && x.currencyConversion <= 0 ? 'invalid-input' : ''}`}
																											required
																											disabled={!hasEditPermission}
																											id={`currency-conversion-${i}`}
																											label="Enter currency conversion factor"
																											value={x.currencyConversion}
																											size="small"
																											name="currencyConversion"
																											placeholder=""
																											onChange={(e) => handleInputChange(e, i, "currencyConversion")}
																										/>
																									</div>
																									{x.id > 0 ? (
																										<>
																											<div className="col-lg-1 col-6 ms-0 ps-0 ">
																												<Button
																													disabled={
																														inputList?.length ==
																														1 || !hasRemovePermission
																													}
																													variant="standard"
																													color="error"
																													size="medium"
																													onClick={() =>
																														handleRemoveClick(i)
																													}
																												>
																													<HiOutlineX className="text-danger" />
																												</Button>
																											</div>
																										</>
																									) : (
																										<>
																											{inputList.length !==
																												1 && (
																													<div className="col-lg-1 col-6 ms-0 ps-0 ">
																														<Button
																															variant="standard"
																															color="error"
																															size="medium"
																															disabled={!hasRemovePermission}
																															onClick={() =>
																																handleRemoveClick(
																																	i
																																)
																															}
																														>
																															<HiOutlineX className="text-danger" style={{ fontSize: "0.975rem" }} />
																														</Button>
																													</div>
																												)}
																										</>
																									)}
																									{inputList?.length ? (
																										<>
																											{inputList.length - 1 ===
																												i && (
																													<div className="col-lg-2 col-6 pe-0 ms-0 ps-0 currencyButton" >
																														<Button
																															variant="outlined"
																															disabled={
																																x.currencyConversion ==
																																"" ||
																																x.baseCurrency ==
																																"" || !hasCreatePermission
																															}
																															size="small"
																															color="primary"
																															className="f11"
																															onClick={
																																handleAddClick
																															}
																														>
																															+ Add More
																														</Button>
																													</div>
																												)}
																										</>
																									) : null}

																								</div>
																							);
																						})}
																					</div>
																				</div>
																			</div>
																		</div>
																	</>
																) : (
																	<></>
																)}
														</div>

														<div className="col-12 mb-1">
															<div className="f12 text-muted mb-1">
																<span>Terms & Conditions *</span>
																{idFromURL && (
																	<span>
																		<Tooltip title="Attachments">
																			<IconButton
																				size="small"
																				className="border-primary  bg-white"
																				onClick={() => {
																					if (attachmentdrawerref.current) {
																						attachmentdrawerref?.current?.handledrawer()
																					}
																				}}
																			>
																				<Badge
																					style={{ padding: "0px 4px", fontSize: "10px" }}
																					// badgeContent={attachmentCount}
																					// color={attachmentCount > 0 ? "success" : "info"}
																					badgeContent={attachmentforevent?.filter(a => a.fileType === "TC").length || 0}
																					color={attachmentforevent?.some(a => a.fileType === "TC") ? "success" : "info"}
																				>
																					<FilePresentIcon className="f17" />
																				</Badge>
																			</IconButton>
																		</Tooltip>
																	</span>
																)}
															</div>

															<ReactQuill
																id="tnC"
																theme="snow"
																preserveWhitespace
																className=""
																readOnly={!hasEditPermission}
																value={formik.values.tnC}
																onChange={(value) => {
																	const termandcondition = extractTextFromHTML(value);
																	const length = termandcondition.length;
																	if (length <= 2000) {
																		formik.setFieldValue(
																			"tnC",
																			value
																		);
																	} else {
																		formik.setFieldValue(
																			"tnC",
																			formik.values.tnC
																		);
																		toast.error('Term and Condition greater than 2000 character is not allowed', {
																			toastId: "t&cerr"
																		});
																	}
																}}
															/>
															{formik.values.tnC && extractTextFromHTML(formik.values.tnC)?.length && <div
																style={{
																	fontSize: "0.8em",
																	color: "grey",
																	textAlign: "end",
																}}
															>
																{`${extractTextFromHTML(formik.values.tnC)?.length ?? 0
																	}/2000`}{" "}
															</div>}
															{formik.touched.tnC &&
																Boolean(formik.errors.tnC) ? (
																<>
																	<FormHelperText className="text-danger">
																		{formik.errors.tnC}
																	</FormHelperText>
																</>
															) : (
																<></>
															)}
														</div>

														<div className="col-12 mt-4">
															<div className="row">
																<div className="col-md-12 col-lg-12 d-flex  mb-4">
																	<div className="col-12 col-md-3 col-lg-3 mb-4">
																		<FormControlLabel
																			control={
																				<Checkbox
																					checked={formik.values.quotesinWords}
																				/>
																			}
																			id="quotesinWords"
																			label={
																				<span className="f12 muted">
																					Quotes in Word
																				</span>
																			}
																			name="quotesinWords"
																			value={formik.values.quotesinWords}
																			disabled={!hasEditPermission}
																			onChange={formik.handleChange}
																		/>

																	</div>

																	<div className="col-12 col-md-3 col-lg-3 mb-4">

																		<FormControlLabel
																			control={
																				<Checkbox
																					checked={formik.values.rankToVendorPost}
																				/>
																			}
																			id="rankToVendorPost"
																			label={
																				<span className="f12 muted">
																					Rank Post Participation
																				</span>
																			}
																			name="rankToVendorPost"
																			className="me-0 pe-0"
																			value={formik.values.rankToVendorPost}
																			disabled={!hasEditPermission}
																			onChange={formik.handleChange}
																		/>
																	</div>
																	<div className="col-12 col-md-6 col-lg-6 mb-4 d-flex">
																		<FormControlLabel
																			className=" me-0 pe-0"
																			style={{ width: "31%" }}
																			control={
																				<Checkbox
																					checked={formik.values.prebid}
																				/>
																			}
																			id="prebid"
																			label={
																				<span className="f12 muted">
																					Pre Bid
																				</span>
																			}
																			name="prebid"
																			value={formik.values.prebid}
																			disabled={!hasEditPermission}
																			onChange={formik.handleChange}
																		/>
																		<div>
																			{formik.values.prebid && (
																				<div className="date-time-picker">
																					<LocalizationProvider dateAdapter={AdapterDayjs}>
																						<div className="date-time-picker d-flex justify-content-end">
																							<div className="me-2">
																								<MobileDateTimePicker
																									variant="outlined"
																									label="Start Date *"
																									size="small"
																									name='preBidStDate'
																									id='preBidStDate'
																									timezone={userDetail?.timeZone}
																									disabled={!hasEditPermission}
																									minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																									value={formik.values.preBidStDate}
																									className='w-100 f14 pt-1 pb-1 me-1'
																									slotProps={{
																										textField: {
																											variant: 'outlined', size: 'small',
																											InputLabelProps: { shrink: true },
																										},
																										actionBar: { actions: ["clear", "cancel", "accept"] }
																									}}
																									onChange={newValue => {
																										formik.setFieldValue('preBidStDate', newValue);
																									}}
																									format={getDateFormatPatteronLocale(userDetail)}
																									ampm={userampm(userDetail)}
																								/>
																							</div>
																							<div>
																								<MobileDateTimePicker
																									variant="outlined"
																									label="End Date *"
																									size="small"
																									name='preBidEndDate'
																									id='preBidEndDate'
																									timezone={userDetail?.timeZone}
																									disabled={!hasEditPermission}
																									minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																									value={formik.values.preBidEndDate}
																									className='w-100 f14  pt-1 pb-1'
																									slotProps={{
																										textField: {
																											variant: 'outlined', size: 'small',
																											InputLabelProps: { shrink: true },
																										},
																										actionBar: { actions: ["clear", "cancel", "accept"] }
																									}}
																									onChange={newValue => {
																										formik.setFieldValue('preBidEndDate', newValue);
																									}}
																									format={getDateFormatPatteronLocale(userDetail)}
																									ampm={userampm(userDetail)}
																								/>
																							</div>
																						</div>
																					</LocalizationProvider>

																				</div>
																			)}
																		</div>
																	</div>
																</div>
																<div className="row justify-content-end align-items-end">
																	<div className="col-md-12">
																	</div>
																</div>
															</div>
														</div>
													</div>
												</form>
											</div>
										)}
										{!stagearray.includes(currentStage) && !showGeneralAccessDenied && idFromURL && idFromURL !== 'add' && (
											<>
												<BidGeneralPreview
													formik={formik}
													inputList={inputList}
													bidtype={bidtype}
													stagearray={stagearray}
													currentStage={currentStage}
													handletabEdit={handletabEdit}
												//purchaseAllList={purchaseAllList}
												/>
											</>
										)}
									</>
								);
							})()}
							{value === 2 && (
								<BidItemsTab
									loadingPermissions={loadingPermissions}
									hasReadPermission={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false}
									hasEditPermission={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.EDIT) ?? false}
									hasCreatePermission={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.CREATE) ?? false}
									hasRemovePermission={permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.REMOVE) ?? false}
									bidItemsList={bidItemsList}
									tempDataForItemService={tempDataForItemService}
									bidtype={bidtype}
									stagearray={stagearray}
									currentStage={currentStage}
									toggleDrawer={toggleDrawer}
									setConfirmClearAllItems={setConfirmClearAllItems}
									handleShowReOpenModal={handleShowReOpenModal}
									handleShowPRModal={handleShowPRModal}
									downloadItemsExcel={downloadItemsExcel}
									handleEditItem={handleEditItem}
									handleDeleteItem={handleDeleteItem}
									callbackItemAdd={callbackItemAdd}
								/>
							)}
							{((value == 3) &&
								// (!iscomercialseadDisabled === false)) ? (
								<div className="mb-5 custom-fix">
									<div className="p-3 pt-0 ps-2 pe-2">
										<div className="d-flex justify-content-between align-items-center">
											<div className="flex-grow-1">
												<div className="row mt-2">
													<div className="col-12 col-md-10 col-lg-6">
														<Autocomplete
															disablePortal
															id="combo-box-demo"
															size="small"
															options={
																!generaltermsDDl
																	? [{ label: "Loading...", id: 0 }]
																	: generaltermsDDl
															}
															getOptionLabel={(option) =>
																option?.libraryEntity ?? ""
															}
															className="w-100"
															fullWidth
															value={selectedCommercalDll}
															renderOption={(props, option, { selected }) => (
																<div {...props} className="d-block">
																	<div className="p-1">
																		<div className="ms-2">
																			{option?.libraryEntity
																				? option.libraryEntity
																				: "No selection"}
																		</div>

																	</div>
																</div>

															)}

															onChange={(e, values) => {
																setSelectedCommercalDll(values);
																getLibraryTermsList(values)
																setSelectedCommercialLibrary(values);
															}}
															renderInput={(params) => (
																<TextField
																	{...params}
																	InputLabelProps={{
																		shrink: true,
																	}}
																	label="Select Commercial Terms"
																/>
															)}
															disabled={!stagearray.includes(currentStage)}
														/>
													</div>
												</div>
											</div>
											<div className="text-end">
												{/* <Button
                                                    variant="text"
                                                    size="large"
                                                    startIcon={<HiPlusSm />}
                                                    className="text-capitalize blue-text font-normal me-3"
                                                    onClick={() => toggleOpenDrawer("AddNewTerm", true)}
                                                    disabled={!SelectedCommercialLibrary || !permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.CREATE)}
                                                >
                                                    Add More
                                                </Button> */}
											</div>
										</div>
										<div className="row mt-2"
											style={{
												pointerEvents: !stagearray.includes(currentStage) ? "none" : "auto",
												opacity: !stagearray.includes(currentStage) ? 0.6 : 1,
												backgroundColor: !stagearray.includes(currentStage) ? "#f5f5f5" : "transparent"
											}}
										>
											<div className="col-12 col-md-12">
												<div className="">

													<div className="row">
														<div className="col-12 zebracolor">
															{commercialLibFind &&
																commercialLibFind?.length > 0 ? (
																<>
																	<div className="table-responsive">
																		<table
																			className={`itemstable`}
																		>
																			<thead>
																				<tr>
																					<th className='text-white fw500 f14'>
																						<Checkbox
																							checked={LibraryTermsList?.every(term => term?.isSelected === true)}
																							className="text-white"
																							size="medium"
																							onChange={(e) =>
																								handleComItemAllCheck(
																									e.target.checked
																								)
																							}
																						/>
																					</th>
																					<th className='text-white fw500 f14'>
																						Name
																					</th>
																					<th className='text-white fw500 f14'>
																						UOM
																					</th>
																					{commercialLibFind.some(item => item.commValue) && (
																						<th className='text-white fw500 f14' >
																							Fixed Value
																						</th>
																					)}
																					{commercialLibFind.some(item => item.formulavalue) && (
																						<th className='text-white fw500 f14' style={{ width: "100px" }} >
																							Formula value
																						</th>
																					)}
																					<th className="text-white fw500 f14" style={{ width: "100px" }} >


																					</th>
																				</tr>
																			</thead>
																			<tbody >
																				{commercialLibFind?.map((item, index) => (
																					<tr className={`${index % 2 == 0 ? "even" : "odd"
																						}`}
																						key={index}>
																						<td className='f14'>
																							<Checkbox
																								size="medium"
																								checked={item?.isSelected}
																								onChange={(e) =>
																									handleComItemCheck(
																										index,
																										e.target.checked
																									)
																								}
																							/>
																						</td>
																						<td className="f14">
																							{item?.name}
																							<div className="text-muted f12">

																								{item?.libraryEntity}
																							</div>
																						</td>
																						<td className="f14">
																							<div className="d-flex">
																								<div>
																									{item?.valuetype === "Currency" ? (
																										<div className="d-flex">
																											<span className="col-md-10" style={{
																												cursor: "pointer",
																												position: 'relative',
																												left: "-20px",
																												color: "#007bff",
																												textDecoration: "underline",
																											}}
																												onClick={(e) =>
																													handleChangeCom(index, e.target.value, item)
																												}
																											>
																												{item?.valuetype}
																												<span className="f12 fw600">
																													{item?.bidTermCurrency?.length
																														? `(${item?.bidTermCurrency[0]?.baseCurrency ?? ''}/${item?.bidTermCurrency[0]?.currencyConversion ?? ''})`
																														: `(${formik?.values?.baseCurrency}/${item?.currencyConversion || "1"})`}
																												</span>
																											</span>
																										</div>
																									) : (
																										<div>{item?.valuetype}</div>
																									)}
																								</div>
																							</div>
																						</td>

																						{
																							commercialLibFind.some(item => item.commValue) && (
																								<td className="f14">
																									{item.commValue || ""}
																								</td>
																							)
																						}

																						{
																							commercialLibFind.some(item => item.formulavalue) && (
																								<td className="f14">
																									{item.formulavalue || ""}
																								</td>
																							)
																						}
																						< td className="f14 d-flex" >

																						</td>
																					</tr>
																				))}
																			</tbody>
																		</table>
																	</div>
																</>
															) : (
																<></>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
							{value === 4 && (
								<BidInviteSupplierTab
									loadingPermissions={loadingPermissions}
									canReadSuppliers={canReadSuppliers}
									canEditSuppliers={permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.EDIT) ?? false}
									canCreateSuppliers={permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false}
									canRemoveSuppliers={permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false}
									tabloading={tabloading}
									categoryList={categoryList}
									selectedCategory={selectedCategory}
									totalSupplier={totalSupplier}
									selectedSupplier={selectedSupplier}
									stagearray={stagearray}
									currentStage={currentStage}
									pageTS={pageTS}
									pageCount={pageCount}
									totalpageTS={totalpageTS}
									pageSS={pageSS}
									totalpageSS={totalpageSS}
									setSelectedCategory={setSelectedCategory}
									handleSupplierWithCategory={handleSupplierWithCategory}
									handleSelectedSupplier={handleSelectedSupplier}
									setPageTS={setPageTS}
									setPageSS={setPageSS}
									setPageCount={setPageCount}
									clearALLSelectedSupplier={clearALLSelectedSupplier}
									clearSelectedSupplier={clearSelectedSupplier}
									handleLoadingFactorClick={handleLoadingFactorClick}
									getCategorylist={getCategorylist}
								/>
							)}
							{value === 5 && bidpreview && (

								<div className="custom-fix">

									{/* Bid General Details */}
									<Card sx={{ mb: 3, boxShadow: 2 }}>
										<CardHeader
											title={
												<Typography sx={{ color: "#1976d2", fontWeight: 400, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
													📝 Bid General Details
												</Typography>
											}
											action={
												stagearray.includes(currentStage) && (
													<IconButton size="small" sx={{ bgcolor: "#fff" }} onClick={() => handletabEdit(1)}>
														<HiPencilAlt className="f17 text-primary" />
													</IconButton>
												)
											}
											sx={{ backgroundColor: "#fff", py: 1.5 }}
										/>
										<CardContent>
											<BidGeneralPreview formik={formik} inputList={inputList} purchaseAllList={purchaseAllList} bidtype={bidtype} />
										</CardContent>
									</Card>

									{/* Item Details */}
									<>
										{/* === Heading like RFQ Items === */}
										<div className="d-flex justify-content-between align-items-center mb-3" id="auctionitemsdetails">
											<Typography
												sx={{
													mb: 3,
													color: "#1976d2",
													fontWeight: 400,
													fontSize: "14px"
												}}
											>
												📝 Item Details
											</Typography>

											{stagearray.includes(currentStage) && (
												<IconButton
													size="small"
													className="bg-light"
													onClick={() => handletabEdit(2)}
												>
													<HiPencilAlt className="f17 text-primary" />
												</IconButton>
											)}
										</div>

										{/* === Card without header, with scroll === */}
										<Card sx={{ mb: 3, boxShadow: 2, borderRadius: "8px" }}>
											<CardContent sx={{ p: 2 }}>

												<ProductitemCell
													action={false}
													itemsList={bidItemsList}
													handleEditItem={handleEditItem}
													handleDeleteItem={handleDeleteItem}
													tempDataForItemService={tempDataForItemService}
													eventType="Auction"
												/>

											</CardContent>
										</Card>
									</>

									{/* Commercial Details (conditionally) */}
									{bidtype && ![1, 2, 5, 6].includes(bidtype.id) && (
										<Card sx={{ mb: 3, boxShadow: 2 }}>
											<CardHeader
												title={
													<Typography sx={{ color: "#1976d2", fontWeight: 400, fontSize: "14px" }}>
														📝 BID Commercial Details
													</Typography>
												}
												action={
													stagearray.includes(currentStage) && (
														<IconButton size="small" sx={{ bgcolor: "#fff" }} onClick={() => handletabEdit(3)}>
															<HiPencilAlt className="f17 text-primary" />
														</IconButton>
													)
												}
												sx={{ backgroundColor: "#fff", py: 1.5 }}
											/>
											<CardContent>
												{commercialLibFind?.filter(s => s.isSelected)?.length > 0 ? (
													<div>
														{/* Table Header */}
														<div className="d-flex mb-2">
															<div className="col-3 f14 fw500">Name</div>
															<div className="col-3 f14 fw500">UOM</div>
															<div className="col-3 f14 fw500">Fixed Value</div>
															<div className="col-3 f14 fw500">Formula Value</div>
														</div>
														{/* Data Rows */}
														{commercialLibFind.filter(x => x.isSelected).map((item, index) => (
															<div className={`d-flex border-bottom py-1 ${index % 2 === 0 ? "even" : "odd"}`} key={index}>
																<div className="col-3">
																	<div>{item.name}</div>
																	<div className="text-muted f10">{item.libraryEntity}</div>
																</div>
																<div className="col-3">{item.valuetype}</div>
																<div className="col-3">{item.commValue}</div>
																<div className="col-3">{item.formulavalue}</div>
															</div>
														))}
													</div>
												) : (
													<div>No commercial details selected.</div>
												)}
											</CardContent>
										</Card>
									)}

									{/* Invited Suppliers */}
									<Card sx={{ mb: 3, boxShadow: 2 }}>
										<CardHeader
											title={
												<Typography sx={{ color: "#1976d2", fontWeight: 400, fontSize: "14px" }}>
													📝 Invited Suppliers
												</Typography>
											}
											action={
												stagearray.includes(currentStage) && (
													<IconButton size="small" sx={{ bgcolor: "#fff" }} onClick={() => handletabEdit(4)}>
														<HiPencilAlt className="f17 text-primary" />
													</IconButton>
												)
											}
											sx={{ backgroundColor: "#fff", py: 1.5 }}
										/>
										<CardContent>
											<SelectedSupplierCell selectedsupplier={selectedSupplier} />
										</CardContent>
									</Card>

								</div>
							)}


							{value == 6 && (loadingPermissions ? <GridSkeleton /> :
								<AuctionControl
									key={"AuctionControl"}
									action={!actionType}
									accessLevel={accessLevel}
									isDifferentPage={false}
									onBidStatusChange={handleBidStatusChange}
								/>
							)}

							{value == 7 && (loadingPermissions ? <GridSkeleton /> :
								<QueryList
									pageSlug={pageSlug}
									key={"QueryList"}
									accessLevel={accessLevel}
									fromEventPage={true}
									EventId={pageSlug}
									EventType={"Auction"}
									permissionManager={permissionManager}
								/>
							)}

							{value == 8 && (loadingPermissions ? <GridSkeleton /> :
								<EventAllocationScreen
									props={{
										eventId: 0,
										nfaEventId: idFromURL,
										nfaEventType: 'Auction',
										Version: formik?.values?.Version ?? 1,
										nfaEventVersion: formik?.values?.Version ?? 1,
										currentStage: "Allocation",
										permissionManager: permissionManager
									}}
									ref={NFASOBRFQRef}
								/>
							)}
						</div>
					</div>
				</div>

				{/* Right content - Approval Section */}
				<div className={`rightContent ${isClosedView || approvershow ? "col-3" : "d-none"}`}>
					<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column approver-panel" style={{ overflow: 'hidden' }}>

						{isClosedView ? (
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2 rfq-dv2-workflow-head">
								<div className="rfq-dv2-workflow-tabs">
									<button
										type="button"
										className={`rfq-dv2-workflow-tab ${workflowPanelTab === "workflow" ? "active" : ""}`}
										onClick={() => setWorkflowPanelTab("workflow")}
									>
										Approval Workflow
									</button>
									<button
										type="button"
										className={`rfq-dv2-workflow-tab ${workflowPanelTab === "history" ? "active" : ""}`}
										onClick={() => setWorkflowPanelTab("history")}
									>
										View History
									</button>
									<button
										type="button"
										className={`rfq-dv2-workflow-tab ${workflowPanelTab === "attachments" ? "active" : ""}`}
										onClick={() => setWorkflowPanelTab("attachments")}
									>
										Attachments
									</button>
								</div>
								<IconButton
									onClick={() => handleApprover(false)}
									size="small"
									className="text-muted"
								>
									<HiOutlineX className="f16" />
								</IconButton>
							</div>
						) : (
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2">
								<div className="section-heading mb-0 pb-4">Approval Workflow</div>
								<IconButton
									onClick={() => handleApprover(false)}
									size="small"
									className="text-muted"
								>
									<HiOutlineX className="f16" />
								</IconButton>
							</div>
						)}
						<div className="flex-grow-1">
							{(isClosedView || approvershow) && (!isClosedView || workflowPanelTab === "workflow") && (
								<EventApprovalBox
									requestCell={requestCell}
									handleEventAppList={handleEventAppList}
									wfupdate={wfupdate}
									action={stagearray.includes(currentStage)}
									stagelist={stagelist}
									permissionManager={permissionManager}
									eventCode={tempDataEditData?.[0]?.eventCode}
									eventSubject={tempDataEditData?.[0]?.subject}
									startDate={tempDataEditData?.[0]?.bidStDate}
									endDate={tempDataEditData?.[0]?.bidEndDate}
									currentStage={currentStage}
								/>
							)}
							{isClosedView && workflowPanelTab === "history" && (
								<div className="p-2">
									<HistoryCell eventtype="Auction" eventId={idFromURL} permissionManager={permissionManager} />
								</div>
							)}
							{isClosedView && workflowPanelTab === "attachments" && (
								<div className="p-2">
									<AttachmentWorkFlow
										eventtype="Auction"
										eventid={idFromURL}
										action={stagearray.includes(currentStage)}
										handleattachmentforevent={handleattachmentforevent}
										permissionManager={permissionManager}
										onCountChange={handleAttachmentCount}
										ref={attachmentdrawerref}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<React.Fragment key="topaddProduct">
				<Drawer
					anchor="right"
					open={state["addProductDrawer"]}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderNotificationCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Add Product</div>
									<div>
										<IconButton
											onClick={toggleDrawer("addProductDrawer", false)}
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
							<Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>
								<AddProductsCell
									idFromURL={idFromURL}
									UOMMaster={UOMMaster}
									callbackItemAdd={callbackItemAdd}
									itemEditTempData={itemEditTempData}
									tempDataForItemService={tempDataForItemService}
									//handleUomList={handleUomList}
									action={stagearray.includes(currentStage)}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>
			<React.Fragment key="qusDrawertr">
				<Drawer
					anchor="right"
					open={state["qusDrawer"]}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Add Question</div>
									<div>
										<IconButton
											onClick={toggleDrawer("qusDrawer", false)}
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
							<Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>
								<AddQuestionFormCell
									idFromURL={idFromURL}
									callbackQuesAddCustom={callbackQuesAddCustom}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>
			<React.Fragment key="setSurrogate">
				<Drawer
					anchor="right"
					open={state["surrogateDrawer"]}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">{selectedAction}</div>
									<div>
										<IconButton
											onClick={toggleDrawer("surrogateDrawer", false)}
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

							<Box sx={{ flexGrow: 1, p: 2, mt: 2 }}>
								<form onSubmit={formik_Action.handleSubmit} autoComplete="off">
									<div className="row mt-2">
										<div className="col-12 col-md-12 mb-4">
											<TextFieldCell
												id="supplierselected"
												name="supplierselected"
												label="Supplier *"
												placeholder=""
												maxLength={100}
												value={`${formik_Action.values.supplier?.contactPerson} | ${formik_Action.values.supplier?.email} | ${formik_Action.values.supplier?.companyName}`}

												disabled
											/>
										</div>
										{selectedAction == "Surrogate BID" &&
											<>
												<div className="col-12 col-md-6 mb-4">
													<TextFieldCell
														id="name"
														name="name"
														label="Surrogator Name"
														placeholder=""
														maxLength={100}
														value={formik_Action.values.name}
														onChange={(e) => {

															formik_Action.setFieldValue("name", e.target?.value)
														}}
														error={
															formik_Action.touched.name &&
															Boolean(formik_Action.errors.name)
														}
														helperText={
															formik_Action.touched.name &&
															formik_Action.errors.name
														}
														InputProps={{
															endAdornment: formik_Action.values.name && (
																<InputAdornment position="end">
																	<Typography
																		variant="body2"
																		color="textSecondary"
																	>
																		{formik_Action.values?.name?.length}/200
																	</Typography>
																</InputAdornment>
															),
														}}

													/>
												</div>
												<div className="col-12 col-md-6 mb-4">
													<TextFieldCell
														id="email"
														name="email"
														label="Surrogator Email *"
														placeholder=""
														maxLength={100}
														value={formik_Action.values.email}
														onChange={(e) => {

															formik_Action.setFieldValue("email", e.target?.value)
														}}
														error={
															formik_Action.touched.email &&
															Boolean(formik_Action.errors.email)
														}
														helperText={
															formik_Action.touched.email &&
															formik_Action.errors.email
														}
														InputProps={{
															endAdornment: formik_Action.values.email && (
																<InputAdornment position="end">
																	<Typography
																		variant="body2"
																		color="textSecondary"
																	>
																		{formik_Action.values?.email?.length}/200
																	</Typography>
																</InputAdornment>
															),
														}}

													/>
												</div>
											</>
										}
										<div className="col-12 col-md-12 mb-4">
											<TextFieldCell
												multiline
												rows={3}
												id="Reason"
												name="Reason"
												label="Remark"
												placeholder=""
												maxLength={200}
												value={formik_Action.values.Reason}
												onChange={(e) => {

													formik_Action.setFieldValue("Reason", e.target?.value)
												}}
												error={
													formik_Action.touched.Reason &&
													Boolean(formik_Action.errors.Reason)
												}
												helperText={
													formik_Action.touched.Reason &&
													formik_Action.errors.Reason
												}
												InputProps={{
													endAdornment: formik_Action.values.Reason && (
														<InputAdornment position="end">
															<Typography
																variant="body2"
																color="textSecondary"
															>
																{formik_Action.values?.Reason?.length}/200
															</Typography>
														</InputAdornment>
													),
												}}
											/>
										</div>
									</div>
									<hr className="mt-0" />

									<div className="text-end">
										<LoadingButton

											variant="outlined"

											color="primary"
											className="me-3 text-capitalize"
											size="small"
										>
											Reset
										</LoadingButton>
										<LoadingButton

											variant="contained"
											type="Submit"
											color="primary"
											className="text-capitalize"
											size="small"
										>
											Submit
										</LoadingButton>
									</div>
								</form>
							</Box>

						</div>
					</Box>
				</Drawer>
			</React.Fragment>
			<React.Fragment key="key4">
				<Drawer anchor="right" open={state["openInvoiceApproved"]}>
					<form onSubmit={formik_ApproveReject.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">{tempDataEditData[0]?.stage !== 'Close' ? 'Approval Action' : 'Final Approval Action'}</div>
										<div>
											<IconButton
												onClick={toggleDrawer("openInvoiceApproved", false, [])}
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
								<div className="p-3">
									<div className="row ">
										<div className="col-12 col-md-12 col-lg-12">
											<div className="mb-4 textblue f14"></div>
											<div className="row">
												<div className="col-12 col-md-4 col-lg-12 mb-4">
													{tempDataEditData[0]?.approverCount == 1 ? (
														<TextField
															id="vendorId"
															InputLabelProps={{
																shrink: true,
															}}
															name="vendorId"
															select
															className="mb-2"
															fullWidth
															size="small"
															label="Select supplier"
															variant="outlined"
															value={formik_ApproveReject.values?.vendorId || ""}
															onChange={(e) =>
																formik_ApproveReject.setFieldValue("vendorId", e.target.value)
															}
														>
															<MenuItem value="">Only for auto PO confirmation</MenuItem>
															{tempDataEditData[0]?.bidVendorInvited.map((vendor) => (
																<MenuItem key={vendor.id} value={vendor.vendorID}>
																	{vendor.vendorName}
																</MenuItem>
															))}
														</TextField>
													) : (
														<TextField
															id="IsApproved"
															InputLabelProps={{
																shrink: true,
															}}
															name="IsApproved"
															select
															className="mb-2"
															fullWidth
															size="small"
															label="Status"
															variant="outlined"
															value={formik_ApproveReject.values?.IsApproved}
															onChange={(e) =>
																formik_ApproveReject.setFieldValue("IsApproved", e.target.value)
															}
														>
															<MenuItem value={true}>Approve</MenuItem>
															<MenuItem value={false}>Reject</MenuItem>
														</TextField>
													)}
												</div>

												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="remarks"
														InputLabelProps={{
															shrink: true,
														}}
														multiline
														rows={3}
														name="remarks"
														className="w-100 f14"
														size="small"
														label="Comment "
														variant="outlined"
														inputProps={{ maxLength: 200 }}
														value={formik_ApproveReject?.values?.remarks}
														error={formik_ApproveReject.touched.remarks && Boolean(formik_ApproveReject.errors.remarks)}
														helperText={formik_ApproveReject.touched.remarks && formik_ApproveReject.errors.remarks}
														onChange={(e) =>
															formik_ApproveReject.setFieldValue(
																"remarks",
																e.target.value
															)
														}
														InputProps={{
															endAdornment: formik_ApproveReject?.values?.remarks && (
																<InputAdornment position="end">
																	<Typography variant="body2" color="textSecondary">
																		{formik_ApproveReject?.values?.remarks?.length}/200
																	</Typography>
																</InputAdornment>
															),
														}}
													/>
												</div>
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-12 text-end">
											<LoadingButton
												color="primary"
												loading={loading}
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="Submit"
											>
												<span>Save</span>
											</LoadingButton>
										</div>
									</div>
								</div>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>
			<Modal
				size="md"
				show={modal1}
				backdrop="static"
				keyboard={false}
				centered
				contentClassName="border-0 "
				onHide={() => handleCloseModal1()}
				style={{ borderRadius: "5px" }}
			>
				<Modal.Header className="bgheaderCards p-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14  text-white">
							Select Currency Mode
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => handleCloseModal1()}
						size="small"
						edge="start"
						color="white"
					>
						<Close className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-2">
						<div className="row">
							<div className="col-12 col-lg-12 mt-2 ">
								<form>
									<div className="row">
										<div className="col-12">
											<div className="row">
												<div className="col-12 col-lg-12 mt-3">
													{commcurrencyList?.map((x, i) => (
														<div
															className="row d-flex align-items-center w-100 mb-3"
															key={i}
														>
															<div className="col-lg-4 col-12">
																<TextField
																	id={x.baseCurrency}
																	InputLabelProps={{
																		shrink: true,
																	}}
																	name="baseCurrency"
																	select
																	className="w-100 f14"
																	size="small"
																	label="Select Currency *"
																	variant="outlined"
																	value={x.baseCurrency}
																	onChange={(e) => {
																		if (e.target.value === "new") {
																			setOpenCurrencyModal(true);
																			return;
																		}
																		handleCurrencyInputChange(e, i);
																	}}
																>
																	<MenuItem value="new" style={{ fontStyle: 'italic', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>
																		Add New
																	</MenuItem>
																	{currencyList &&
																		currencyList.map((option) => (
																			<MenuItem
																				key={option.id}
																				disabled={inputList?.some(
																					(item) =>
																						item.baseCurrency ===
																						option.currencyNm
																				)}
																				value={option?.currencyNm}
																			>
																				{option?.currencyNm}
																			</MenuItem>
																		))}
																</TextField>
															</div>
															<div className="col-lg-4 col-12">
																<TextField
																	variant="outlined"
																	InputLabelProps={{
																		shrink: true,
																	}}
																	className="w-100"
																	required
																	type="number"
																	id={x.currencyConversion}
																	label="Enter currency conversion factor"
																	value={x.currencyConversion}
																	size="small"
																	name="currencyConversion"
																	placeholder=""
																	onChange={(e) =>
																		handleCurrencyInputChange(e, i)
																	}
																/>
															</div>
															<div className="col-lg-4 d-flex justify-content-end">
																<Button
																	color="primary"
																	variant="text"


																	size="small"
																	onClick={handlecurrencytermmodal}
																>
																	Submit
																</Button>
																<Button
																	color="error"
																	variant="text"
																	onClick={() => handleCloseModal1()}

																	size="small"
																>
																	Cancel
																</Button>
															</div>

														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				size="sm"
				show={modalBaseCurr}
				backdrop="static"
				keyboard={false}
				centered
				onHide={() => handleCloseBaseCurr()}
				style={{ borderRadius: "5px" }}
			>
				<Modal.Header className="bgheaderCards p-2">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14  text-white">
							Select Base Currency
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => handleCloseBaseCurr()}
						size="small"
						edge="start"
						color="white"
					>
						<Close className="text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-2">
						<div className="row">
							<div className="col-12 col-lg-12 col-md-12 mt-2 ">
								<form>
									<div className="row">
										<div className="col-12 col-lg-12 col-md-12">
											<div className="row">
												<div className="col-12 col-lg-12 mt-3">
													{
														<div
															className="row d-flex align-items-center w-100 mb-3"
														>
															<div className="col-lg-12 col-12">
																<TextField
																	id={"basecurrencymodal"}
																	InputLabelProps={{
																		shrink: true,
																	}}
																	name="baseCurrency"
																	select
																	className="w-100 f14"
																	size="small"
																	label="Select Currency *"
																	variant="outlined"
																	value={formik?.values?.baseCurrency}
																	SelectProps={{
																		onOpen: () => {
																			console.log("Select opened, currencyList length:", currencyList.length);
																			if (currencyList.length === 0) {
																				pullgetCurrency();
																			}
																		}
																	}}
																	onChange={(e) => {
																		const newValue = e.target?.value;
																		console.log("Base Currency onChange triggered, newValue:", newValue);
																		if (newValue === "new") {
																			console.log("Opening currency modal and closing base currency modal...");
																			handleCloseBaseCurr();
																			setTimeout(() => {
																				setOpenCurrencyModal(true);
																			}, 100);
																			return;
																		}
																		console.log("Setting base currency to:", newValue);
																		formik.setFieldValue("baseCurrency", newValue);
																		handleCloseBaseCurr();
																	}}
																>
																	{(currencyList || []).map((option) => (
																		<MenuItem
																			key={option.id}
																			value={option?.currencyNm}
																		>
																			{option?.currencyNm}
																		</MenuItem>
																	))}
																	<MenuItem value="new" style={{ fontStyle: 'italic', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>
																		Add New
																	</MenuItem>
																</TextField>
															</div>
														</div>
													}
												</div>
											</div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</Modal.Body>
			</Modal>
			<>
				<input
					className="d-none"
					type="file"
					accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
					onChange={handleFileChange}
					ref={fileInputRef}
				/>
			</>
			<Dialog open={confirmDelete} onClose={handleCloseDelete}>
				<DialogTitle id="">{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText id="">You want to delete.</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDelete}>No</Button>
					<Button onClick={() => removeItemData(removeItem)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
			<Modal
				show={loadingModal}
				dialogClassName="modal-custom-mdlg"
				className="zindex1280"
				backdropClassName="zindex1280"
				backdrop="static"
				keyboard={false}
				centered
				contentClassName="border-0"
				onHide={CloseLoadingModal}
			>
				<Modal.Body className="p-0 d-flex flex-column">
					<div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
						<span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Loading Factor</span>
						<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={CloseLoadingModal}>
							<HiOutlineX />
						</button>
					</div>
					<div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
						<BidLoadingFactor
							isModal={true}
							bidId={idFromURL}
							vendorId={storeVId}
							initialFactors={filteredLoadingFactors}
							baseCurrency={formik.values.baseCurrency}
							onUpdate={(factors) => {
								setFilteredLoadingFactors(factors);
								setSelectedSupplier(prev =>
									prev.map(s => s.id === storeVId ? { ...s, bidLoadingFactor: factors } : s)
								);
							}}
						/>
					</div>
				</Modal.Body>
			</Modal>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle className="pb-0 f14">Save As</DialogTitle>
				<DialogContent className="pb-0">
					<DialogContentText style={{ width: "320px" }}>
						&nbsp;
					</DialogContentText>
					<TextFieldCell
						id="password"
						name="password"
						label="Auction Template Title"
						placeholder=""
						value={TemplateTitle}
						onChange={(e) => {
							setTemplateTitle(e.target.value)
						}}
						maxLength={100}
					/>
				</DialogContent>
				<DialogActions className="pt-0">
					<Button
						onClick={handleClose}
						className="text-muted text-capitalize"
						style={{ fontSize: "0.75rem" }}
					>
						Cancel
					</Button>
					<Button onClick={handleSaveTemplate} className="text-capitalize " style={{ fontSize: "0.75rem" }} disabled={!idFromURL}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={confirmClearAllItems} onClose={() => handleClearAllItems(false)}>
				<DialogTitle>{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText>
						Are you sure you want to delete all Items ?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleClearAllItems(false)}>No</Button>
					<Button onClick={() => handleClearAllItems(true)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={modalcancelOpen} onClose={() => handleCancelRFQModal(false)}>
				<DialogTitle>{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText>
						Do you want to cancel this bid? Unsaved changes will be lost.
					</DialogContentText>
					<TextField
						autoFocus
						margin="dense"
						label="Enter reason *"
						type="text"
						fullWidth
						value={cancelReason}
						onChange={handleCancelInputChange}
						error={Boolean(biderror)}
						helperText={biderror}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleCancelRFQModal(false)}>No</Button>
					<Button onClick={() => handleCancelRFQModal(true)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
			<Modal
				size="lg"
				show={reOpenAuctionModal}
				backdrop="static"
				keyboard={false}
				centered
				onHide={handleCloseReOpenModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title className="text-white f14 fw500">Pull Data From RFQ</Modal.Title>
					<IconButton onClick={handleCloseReOpenModal} size="small">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>

				<Modal.Body className="p-3">
					<div className="row mb-2 align-items-center">
						<div className="col-md-2 me-0 pe-0">
							<div className="text-muted f15 fw500">Select RFQ : </div>
						</div>
						<div className="col-md-10 ms-0 ps-0">
							<div className="input-container ">
								<div className="tags-container ">
									<input
										type="text"
										placeholder="Subject..."
										className={`form-control ${inputError ? 'is-invalid' : ''}`}
									/>
								</div>
							</div>
						</div>
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				size="lg"
				show={prAuctionModal}
				backdrop="static"
				keyboard={false}
				centered
				onHide={handleClosePRModal}
			>
				<Modal.Header className="pt-1 pb-1 bgheaderCards">
					<Modal.Title className="text-white f14 fw500">Pull Data From PR</Modal.Title>
					<IconButton onClick={handleClosePRModal} size="small">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-3">
					<div className="row mb-2 align-items-center">
						<div className="col-md-2 me-0 pe-0">
							<div className="text-muted f15 fw500">Select PR : </div>
						</div>
						<div className="col-md-6 ms-0 ps-0">
							<div className="input-container d-flex">
								<div className="flex-grow-1 me-2">
									<input
										type="text"
										placeholder="Enter PR Number..."

										className={`form-control ${inputError ? 'is-invalid' : ''}`}
										value={inputValue}
										onChange={(e) => {
											setInputValue(e.target.value);
											setInputError('');
										}}
									/>
									{inputError && (
										<div className="invalid-feedback f12 text-danger position-absolute">
											{inputError}
										</div>
									)}
								</div>
								<button
									className="btn btn-primary"
									type="button"
									onClick={handleFetchPRData}
								>
									Fetch Data
								</button>
							</div>
						</div>
					</div>
					{selectedPRItemModal.length > 0 && (
						<div style={{ height: 500 }} className="mt-4">
							<DataGrid
								rows={selectedPRItemModal}
								columns={prAuctioncolumn}
								// pageSize={10}
								checkboxSelection
								onRowSelectionModelChange={(ids) => setSelectedItemsActive(ids)}
								rowSelectionModel={selectedItemsActive}
								rowHeight={40}
								columnHeaderHeight={40}
								className="f13 bg-white"
								disableRowSelectionOnClick
								isRowSelectable={(params) => !params.row.eventId}
								sx={{
									'& .MuiDataGrid-columnHeaders': {
										backgroundColor: '#e8f0fe',
										color: '#1a237e',
										fontWeight: 'bold',
										fontSize: '14px'
									}
								}}
								pagination
								pageSizeOptions={[10, 25, 50]}
								initialState={{
									pagination: { paginationModel: { pageSize: 10, page: 0 } },
								}}
							/>
						</div>
					)}
				</Modal.Body>
			</Modal>
			{isUploading && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					height: '100vh',
					width: '100vw',
					backgroundColor: 'rgba(255,255,255,0.6)',
					backdropFilter: 'blur(3px)',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 9999
				}}>
					<div style={{ textAlign: 'center' }}>
						<div className="spinner-border text-primary mb-2" role="status" style={{ width: '3rem', height: '3rem' }}></div>
						<div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#333' }}>Please Wait While Uploading...</div>
					</div>
				</div>
			)}
			<Dialog open={modalAllocationOpen} onClose={() => handleAllocationModal(false)}>
				<DialogTitle>{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText>
						Do you want to allocate this bid? Unsaved changes will be lost.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleAllocationModal(false)}>No</Button>
					<Button onClick={() => handleAllocationModal(true)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
			<React.Fragment key="top">
				<Drawer
					anchor="right"
					open={openDrawer.AddNewTerm}
					onClose={() => toggleOpenDrawer("AddNewTerm", false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">Manage Terms</div>
									<div>
										<IconButton
											onClick={() => toggleOpenDrawer("AddNewTerm", false)}
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
								<EventCommercialDrawer
									callbackstep={(data) => {

										if (!editRecordData) {
											let libraryterm = CommercialTermModal(data)
											setLibraryTermsList((prev) => [...prev, libraryterm]);
											setCommercialLibFind((prev) => [...prev, libraryterm]);

											toggleOpenDrawer("AddNewTerm", false);
											setEditRecordData(null);
										}
										else {
											let libraryterm = DefaultCommercialTermModal(editRecordData, data)
											setLibraryTermsList((prev) => {

												const updatedList = [...prev];
												const index = updatedList.findIndex(item => item.fieldName === editRecordData.fieldName);
												if (index !== -1) {
													updatedList[index] = { ...libraryterm };
												}
												return updatedList;
											});

											setCommercialLibFind((prev) => {
												const updatedList = [...prev];
												const index = updatedList.findIndex(item => item.fieldName === editRecordData.fieldName);
												if (index !== -1) {
													updatedList[index] = { ...libraryterm };
												}
												return updatedList;
											});

											toggleOpenDrawer("AddNewTerm", false);
											setEditRecordData(null);
										}


									}}
									editRecordData={tempDataEditData[0]}
									LibraryTermsList={LibraryTermsList}

								/>
							</Box>
						</div>
					</Box>
				</Drawer>

				<Modal
					size="md"
					show={modal01}
					backdrop="static"
					keyboard={false}
					centered
					contentClassName="border-0 "
					onHide={() => handleCloseModal01()}
					style={{ borderRadius: "5px" }}
				>
					<Modal.Header className="bgheaderCards p-2">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14  text-white">
								Select Currency Mode
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => handleCloseModal01()}
							size="small"
							edge="start"
							color="white"
						>
							<Close className="text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-2">
							<div className="row">
								<div className="col-12 col-lg-12 mt-2 ">
									<form>
										<div className="row">
											<div className="col-12">
												<div className="row">
													<div className="col-12 col-lg-12 mt-3">
														{
															<div className="row d-flex align-items-center w-100 mb-3">
																<div className="col-lg-4 col-12">
																	<TextField
																		id={"basecurrencymodal"}
																		InputLabelProps={{
																			shrink: true,
																		}}
																		name="baseCurrency"
																		select
																		className="w-100 f14"
																		size="small"
																		label="Select Currency *"
																		variant="outlined"
																		value={modalCurrency.baseCurrency}
																		onChange={(e) => {
																			const newValue = e.target?.value;
																			setModalCurrency((prev) => {
																				const updated = {
																					...prev,
																					baseCurrency: newValue
																				};

																				// Set conversion to 1 if base currency matches event base currency
																				if (newValue === formik?.values?.baseCurrency) {
																					updated.currencyConversion = "1";
																				}

																				return updated;
																			});
																		}}
																	>
																		{currencyList &&
																			currencyList.map((option) => (
																				<MenuItem
																					key={option.id}
																					value={option?.currencyNm}
																				>
																					{option?.currencyNm}
																				</MenuItem>
																			))}
																	</TextField>

																</div>
																<div className="col-lg-4 col-12">
																	<TextField
																		variant="outlined"
																		InputLabelProps={{
																			shrink: true,
																		}}
																		className="w-100"
																		required
																		type="number"
																		id={"modalcurrencyConversion"}
																		label="Enter currency conversion factor"
																		value={modalCurrency.currencyConversion}
																		size="small"
																		name="currencyConversion"
																		placeholder=""
																		onChange={(e) => {
																			const newValue = e.target.value;

																			// Allow only up to 4 decimal places
																			const regex = /^\d*\.?\d{0,4}$/;

																			if (newValue === '' || regex.test(newValue)) {
																				setModalCurrency((prev) => ({
																					...prev,
																					currencyConversion: newValue,
																				}));
																			}
																		}}
																		disabled={modalCurrency.baseCurrency === formik?.values?.baseCurrency}
																	/>
																</div>

																<div className="col-lg-4 d-flex justify-content-end">
																	<Button
																		color="primary"
																		variant="text"
																		size="small"
																		onClick={handleCommercialCurrencyCheck}
																	>
																		Submit
																	</Button>
																	<Button
																		color="error"
																		variant="text"
																		onClick={() => handleCloseModal01()}
																		size="small"
																	>
																		Cancel
																	</Button>
																</div>
															</div>
														}
													</div>
												</div>
											</div>
										</div>
									</form>
								</div>
							</div>
						</div>
					</Modal.Body>
				</Modal>

				{/* Currency Modal */}
				<Modal
					size="lg"
					show={OpenCurrencyModal}
					backdrop="static"
					keyboard={false}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => CloseCurrencyModal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								Manage Currency
							</div>
						</Modal.Title>
						<IconButton onClick={() => CloseCurrencyModal()} size="small" edge="start">
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddEditCurrency handleCurrencyList={handleCurrencyList} />
						</div>
					</Modal.Body>
				</Modal>
			</React.Fragment>
		</>
	)
}

export default Auctions;