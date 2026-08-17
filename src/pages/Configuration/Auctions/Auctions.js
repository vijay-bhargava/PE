import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import { HiOutlineX } from "react-icons/hi";
import {
	Button, Dialog, DialogActions, DialogContent,
	DialogContentText, DialogTitle, InputAdornment, MenuItem,
	TextField, Tooltip, Typography, createFilterOptions
} from "@mui/material";
import { Modal } from "react-bootstrap";
import Drawer from "@mui/material/Drawer";
import Tabs from "@mui/material/Tabs";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import LoadingButton from "@mui/lab/LoadingButton";
import HistoryCell from "../../BaseCells/HistoryCell";
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import "react-quill/dist/quill.snow.css";
import '../../../assets/css/rfq-detail-v2.css';
import '../../../assets/css/design-system.css';
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	AuctionCTAddModal, IntegerRegex, InvitedSupplierForBidModal,
	findObjListByValueFromArray, getPayloadWithStage, getStageInfo,
	handlesaveAttachment, pullMessageCount, downloadExcelTemplate
} from "../../../utils/common";
import { actionTypes, useStateValue } from "../../../store";
import {
	checkUTC, cleanAndConvertToArray, extractTextFromHTML,
	getAuctionItemServiceFind, getAuctionManageFind, getCurrency,
	getLibraryOrgEntityFind, scrollToTargetC
} from "../../../utils/common/utility";
import { toast } from "react-toastify";
import AddEditCurrency from "../../../utils/common/AddEditCurrency";
import { ApiClient, api } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import AttachmentWorkFlow from "../../BaseCells/attachmentworkflow";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import AddQuestionFormCell from "../RequestForQuotation/AddQuestionFormCell";
import AddProductsCell from "./AddProductsCell";
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import { sanitizeInput } from "../../../utils/common/santize";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { FastApiClient } from "../../../FastApiClient";
import AuctionPreviewTab from "./AuctionPreviewTab";
import AuctionCommercialTab from "./AuctionCommercialTab";
import AuctionGeneralTab from './AuctionGeneralTab';
import BidItemsTab from "./BidItemsTab";
import BidInviteSupplierTab from "./BidInviteSupplierTab";
import BidLoadingFactor from "./BidLoadingFactor";
import AuctionControl from "./AuctionControl";
import QueryList from "../../CommunucationHub/QueryList"
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { PETable } from "../../../components/RFQ/PETable";
import EventAllocationScreen from "../../../components/Event/EventAllocationScreen";
import EventCommercialDrawer from "../../../components/Event/EventCommercialDrawer";
dayjs.extend(utc);
dayjs.extend(timezone);

const Auctions = ({ claimType, breadcrumb }) => {
	const fileInputRef = useRef(null);
	const navigate = useNavigate();
	const apiClient = new ApiClient(api);

	const [{ atoken, customerid, roleClaims, userDetail, bidtype, eventType, eventId }, dispatch] = useStateValue();
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
		if (newValue === "5") {
			setSelectedMenuItem("Submit")
			if (stagelist?.some(item => item.currentStage === "Under Pre Approval")) {
				setApproverShow(true)
			}
		} else {
			setSelectedMenuItem("Save & Continue")
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
		if (value === 8 || value === "8") {
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
		if (idFromURL === null) {
			setApproverShow(false);
		}
	}, [value, idFromURL]);

	useEffect(() => {
		if (currentStage !== "Draft" && ["Open", "Running"].includes(tempDataEditData[0]?.stage) && value === 1 && !isUserInitiatedTabChange) {
			setValue(6)
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
			event &&
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
			showRankToVendor: bidtype?.id === 4 ? "N" : "Y",
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
				if (formik.values.extensionDuration < 1 && formik.values.extensionDuration === '') {
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
					multicurrencytList: inputList?.[0]?.baseCurrency === "" ? [] : inputList,
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
		if (fieldname === "currencyConversion") {
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
				if (res?.result?.[0]?.eventCode) {
					dispatch({ type: actionTypes.SET_EVENTCODE, value: res.result[0].eventCode });
				}
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

				if (res?.result?.[0]?.bidEndDate && res?.result?.[0]?.bidDuration === 0) {
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
				if (res?.result?.[0]?.baseCurrency && res?.result?.[0]?.baseCurrency !== "") {
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
			if (tempDataEditData.length > 0 && tempDataEditData[0].bidClosingType === "S") {
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

			if (tempDataEditData.length > 0 && tempDataEditData[0].bidSubTypeId === 82) {

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
			if (x.termsId === selectedcommercialterm?.termsId) {
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
			if (dutchBidDuration !== null) {
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

			const obj = generaltermsDDl.find(x => x.id === libraryId);
			setSelectedCommercialLibrary({
				...obj,
				grandTotalTermName: LibraryTermsList[0].grandTotalTermName
			})

		}
	}, [LibraryTermsList, generaltermsDDl, SelectedCommercialLibrary]);

	const saveBidCommLibraryAdd = async () => {

		if (isCommLibrarySaved && tempDataEditData[0]?.auctionCT.length > 0 && value === 5) {
			return true; // Skip execution if already saved
		}

		const selectedCommTerms = commercialLibFind?.filter(
			(s) => s.isSelected === true
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
					if (notIncluded.length === 1) {
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
		if (value === 1) {

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
		if (value === 2) {

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
		if (value === 3) {
			saveBidCommLibraryAdd();
		}
		if (value === 4) {
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
			if (matchingWorkflow && matchingWorkflow.approvers.length === 0) {
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

		if (formik.values.bidClosingType === 'S') {
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
		if (missingFieldsItems.length > 0 && tempDataEditData[0]?.bidSubTypeId !== 82) {
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
		if (bidtype?.id === 3 || bidtype?.id === 4) {

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
		// if (tempDataEditData[0]?.bidParamater[0]?.eventId && tempDataEditData[0]?.bidParamater[0]?.eventType === 'RFQ') {
		if (rfqParam?.eventId && rfqParam?.eventType === 'RFQ') {
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
		// if (value === 1 && idFromURL && idFromURL > 0) {    
		//     pullgetAuctionManageFind(idFromURL);
		// }
		if (value === 2 && idFromURL && bidItemsList.length !== 0) {
			pullAuctionItemServiceFind(idFromURL);
		}
		if (value === 3) {
			pullLibraryOrgEntityFind();
		}
		if (value === 4 || value === 5) {
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

		const selectedList = list?.filter((s) => s.isSelected === true);
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
			(vendor) => vendor?.vendorID === x?.vendorId
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
		const selectedList = list?.filter((s) => s.isSelected === true);

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
	const [factorDesc, setFactorDesc] = useState('');
	const [loadingOn, setLoadingOn] = useState('');
	const [factorType, setFactorType] = useState('');
	const [factorPerc, setFactorPerc] = useState(0);
	const [loadingAmount, setLoadingAmount] = useState(0); // Add this to your state
	const [filteredLoadingFactors, setFilteredLoadingFactors] = useState([]);
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
			IsApproved: tempDataEditData[0]?.approverCount === 1 ? "" : true,
			vendorId: tempDataEditData[0]?.approverCount === 1 ? "" : 0,
			remarks: "",
			activityId: parseInt(activityId),
			stageId: 0
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {
			setLoading(true)
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
		// if (value === 5 && eventType === "RFQ") {
		if (value === 5 && hasEventType) {

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

	// to save attachment as rfq created related to attachment workflow
	const [attachmentforevent, setAttachmentforEvent] = useState(null);
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
		if ((bidtype?.id === 1 || bidtype?.id === 5) && formik.values.bidClosingType === "S") {
			templateId = 8;
		}
		else if ((bidtype?.id === 1 || bidtype?.id === 5) && formik.values.bidClosingType !== "S") {
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

	const [open, setOpen] = React.useState(false);
	const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleMenuClick = (item) => {
		if (item !== "Save as Templates") {
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
			case "Save as Draft":
				return handleSaveContinue()
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
			toast.error("Please enter a valid template name")
			return;
		}
		if (TemplateTitle.trim().length > 150) {
			toast.error("Template title must be 150 characters or less")
			return;
		}
		if (!idFromURL) {
			toast.error("Please save the auction first before creating a template")
			return;
		}

		try {
			const subject = (formik?.values?.subject?.trim() || TemplateTitle.trim()).substring(0, 100);
			const data = {
				"templateTitle": TemplateTitle.trim(),
				"subject": subject,
				"eventType": "Auction",
				"eventId": idFromURL,
				"customerId": customerid
			}
			const res = await apiClient.postres("/api/EventTemplate/Add", data, atoken)
			if (res) {
				toast.success("Template saved successfully")
				setOpen(false)
			} else {
				toast.error("Failed to save template. Please try again.")
			}
		} catch (err) {
			toast.error("An error occurred while saving the template.")
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
		validationSchema: selectedAction === "Surrogate BID" ? validationSchemaSurrogate : "",
		onSubmit: async (values) => {

			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				})
				return
			}

			if (selectedAction === "Surrogate BID") {
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
			else if (selectedAction === "Send Reminder") {

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

	return (
		<>
			<div className="mainContainer d-flex rfq-modern-shell">
				<div className={`leftContent ${approvershow ? "col-9" : "col-12"} d-flex flex-column`}>
					<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0 }}>
						<div className="rfq-dv2-page-head border-bottom mb-3" style={{ flexShrink: 0 }}>
							<div className="rfq-dv2-head-top">
								{breadcrumb}
								<div className="rfq-dv2-actions">
									{!loading ? (
										<>
											{/* Cancel — always first */}
											<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--ghost" onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
												Cancel
											</button>
											{/* Secondary actions */}
											{stagearray.includes(currentStage) && (
												<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('Save as Draft')}>
													Save as Draft
												</button>
											)}
											{idFromURL && currentStage && currentStage === 'Draft' && (
												<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('Save as Templates')}>
													Save as Templates
												</button>
											)}
											{currentStage === 'Allocation' && value === "8" && (
												<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('Save & Close')}>
													Save &amp; Close
												</button>
											)}
											{currentStage === 'Awarded' && (
												<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('Send Mail to suppliers')}>
													Send Mail to suppliers
												</button>
											)}
											{currentStage === 'Awarded' && (
												<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('Create NFA')}>
													Create NFA
												</button>
											)}
											{currentStage === 'Close' && (
												<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleMenuClick('ForwardForAllocation')}>
													Forward For Allocation
												</button>
											)}
											{/* Primary actions */}
											{actionType && activityId ? (
												<button type="button" className="pe-btn pe-btn--primary" onClick={() => setState({ ...state, openInvoiceApproved: true })}>
													Action
												</button>
											) : (
												<>
													{value === "5" && (
														<button type="button" className="pe-btn pe-btn--primary" onClick={() => handleMenuClick('Submit')}>
															Submit
														</button>
													)}
													{currentStage === 'Draft' && value !== "5" && (
														<button
															type="button"
															className="pe-btn pe-btn--primary"
															onClick={handleButtonGroup}
															disabled={!stagearray.includes(currentStage)}
														>
															{value === 4 ? "Save Suppliers" : "Save & Continue"}
														</button>
													)}
													{currentStage === 'Allocation' && value === "8" && (
														<button type="button" className="pe-btn pe-btn--primary" onClick={() => handleMenuClick('Save')}>
															Save
														</button>
													)}
												</>
											)}
										</>
									) : (
										<button type="button" className="pe-btn pe-btn--primary" disabled>
											{value === 5 ? "Publishing..." : "Saving..."}
										</button>
									)}
								</div>
							</div>
						</div>

						{/* Tab Navigation and Icons Header */}
						<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
							<Box sx={{
								flexGrow: 1,
								minWidth: 0,
								overflow: 'hidden',
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
									{idFromURL && currentStage.trim() === "Draft" && (
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
									{idFromURL && (currentStage.trim() === "Allocation" || currentStage.trim() === "Awarded") && stagelist?.some(item => item.currentStage === "Allocation") && (
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

							{value === 1 && (
								<AuctionGeneralTab
									loadingPermissions={loadingPermissions}
									permissionManager={permissionManager}
									stagearray={stagearray}
									currentStage={currentStage}
									formik={formik}
									bidtype={bidtype}
									idFromURL={idFromURL}
									userDetail={userDetail}
									inputList={inputList}
									handleInputChange={handleInputChange}
									handleAddClick={handleAddClick}
									handleRemoveClick={handleRemoveClick}
									currencyList={currencyList}
									pullgetCurrency={pullgetCurrency}
									openCurrencyModal={OpenCurrencyModal}
									setOpenCurrencyModal={setOpenCurrencyModal}
									handleBaseCurrency={handleBaseCurrency}
									attachmentdrawerref={attachmentdrawerref}
									attachmentforevent={attachmentforevent}
									updateBidEndDate={updateBidEndDate}
									updateBidDuration={updateBidDuration}
									handletabEdit={handletabEdit}
									showGeneralAccessDenied={showGeneralAccessDenied}
								/>
							)}
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
							{(value === 3) && (
								<AuctionCommercialTab
									generaltermsDDl={generaltermsDDl}
									selectedCommercalDll={selectedCommercalDll}
									setSelectedCommercalDll={setSelectedCommercalDll}
									getLibraryTermsList={getLibraryTermsList}
									setSelectedCommercialLibrary={setSelectedCommercialLibrary}
									stagearray={stagearray}
									currentStage={currentStage}
									commercialLibFind={commercialLibFind}
									LibraryTermsList={LibraryTermsList}
									handleComItemAllCheck={handleComItemAllCheck}
									handleComItemCheck={handleComItemCheck}
									handleChangeCom={handleChangeCom}
									formik={formik}
								/>
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
								<AuctionPreviewTab
									formik={formik}
									inputList={inputList}
									purchaseAllList={purchaseAllList}
									bidtype={bidtype}
									stagearray={stagearray}
									currentStage={currentStage}
									handletabEdit={handletabEdit}
									bidItemsList={bidItemsList}
									handleEditItem={handleEditItem}
									handleDeleteItem={handleDeleteItem}
									tempDataForItemService={tempDataForItemService}
									commercialLibFind={commercialLibFind}
									selectedSupplier={selectedSupplier}
								/>
							)}

							{value === 6 && (loadingPermissions ? <GridSkeleton /> :
								<AuctionControl
									key={"AuctionControl"}
									action={!actionType}
									accessLevel={accessLevel}
									isDifferentPage={false}
									onBidStatusChange={handleBidStatusChange}
								/>
							)}

							{value === 7 && (loadingPermissions ? <GridSkeleton /> :
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

							{value === 8 && (loadingPermissions ? <GridSkeleton /> :
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
				<div className={`rightContent ${approvershow ? "col-3" : "d-none"}`}>
					<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column approver-panel" style={{ overflow: 'hidden' }}>

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
						<div className="flex-grow-1">
							{workflowPanelTab === "workflow" && (
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
							{workflowPanelTab === "history" && (
								<div className="p-2">
									<HistoryCell eventtype="Auction" eventId={idFromURL} permissionManager={permissionManager} />
								</div>
							)}
							{workflowPanelTab === "attachments" && (
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

			<CommonBottomDrawer
				open={state["addProductDrawer"]}
				onClose={toggleDrawer("addProductDrawer", false)}
				title={itemEditTempData?.id > 0 ? "Edit Product / Service" : "Add Product / Service"}
				bodyStyle={{ overflowY: "auto" }}
				actions={
					<>
						<button type="button" className="pe-btn pe-btn--ghost" onClick={toggleDrawer("addProductDrawer", false)}>Cancel</button>
						{stagearray.includes(currentStage) && (
							<>
								<button type="reset" form="add-product-form" className="pe-btn pe-btn--secondary">Reset</button>
								<button type="submit" form="add-product-form" className="pe-btn pe-btn--primary">
									{itemEditTempData?.id > 0 ? "Update" : "Add"}
								</button>
							</>
						)}
					</>
				}
			>
				<AddProductsCell
					idFromURL={idFromURL}
					UOMMaster={UOMMaster}
					callbackItemAdd={callbackItemAdd}
					itemEditTempData={itemEditTempData}
					tempDataForItemService={tempDataForItemService}
					action={stagearray.includes(currentStage)}
				/>
			</CommonBottomDrawer>
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
										{selectedAction === "Surrogate BID" &&
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
													{tempDataEditData[0]?.approverCount === 1 ? (
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
				className="rfq-create-modal"
				contentClassName="border-0 rounded-default"
				onHide={() => handleCloseModal1()}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title><span style={{ fontSize: 14 }}>Select Currency Mode</span></Modal.Title>
					<button type="button" className="rfq-modal-close-btn" onClick={() => handleCloseModal1()}>
						<HiOutlineX style={{ fontSize: 16 }} />
					</button>
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
				className="rfq-create-modal"
				contentClassName="border-0 rounded-default"
				onHide={() => handleCloseBaseCurr()}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title><span style={{ fontSize: 14 }}>Select Base Currency</span></Modal.Title>
					<button type="button" className="rfq-modal-close-btn" onClick={() => handleCloseBaseCurr()}>
						<HiOutlineX style={{ fontSize: 16 }} />
					</button>
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
																<label className="pe-field-label">Select Currency <span className="rfq-required-star">*</span></label>
																<TextField
																	id={"basecurrencymodal"}
																	name="baseCurrency"
																	select
																	className="w-100 f14"
																	size="small"
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
			<Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: '12px', minWidth: 380, p: 1 } }}>
				<DialogTitle sx={{ fontWeight: 600, fontSize: '1rem', pb: 0.5 }}>Save As Template</DialogTitle>
				<DialogContent>
					<label className="pe-field-label">Auction Template Title <span className="rfq-required-star">*</span></label>
					<TextField
						autoFocus
						variant="outlined"
						size="small"
						fullWidth
						placeholder="Enter template title"
						value={TemplateTitle}
						onChange={(e) => setTemplateTitle(e.target.value)}
						inputProps={{ maxLength: 150 }}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<button type="button" className="pe-btn pe-btn--secondary" onClick={handleClose}>Cancel</button>
					<button type="button" className="pe-btn pe-btn--primary" onClick={handleSaveTemplate} disabled={!idFromURL}>Save</button>
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
			<Dialog open={modalcancelOpen} onClose={() => handleCancelRFQModal(false)} PaperProps={{ sx: { borderRadius: '12px', minWidth: 380, p: 1 } }}>
				<DialogTitle sx={{ fontWeight: 600, fontSize: '1rem', pb: 0.5 }}>Are you sure?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.875rem', mb: 2, color: 'text.secondary' }}>
						Do you want to cancel this bid? Unsaved changes will be lost.
					</DialogContentText>
					<label className="pe-field-label">Enter Reason <span className="rfq-required-star">*</span></label>
					<TextField
						autoFocus
						variant="outlined"
						size="small"
						type="text"
						fullWidth
						placeholder="Enter reason for cancellation"
						value={cancelReason}
						onChange={handleCancelInputChange}
						error={Boolean(biderror)}
						helperText={biderror}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<button type="button" className="pe-btn pe-btn--secondary" onClick={() => handleCancelRFQModal(false)}>No</button>
					<button type="button" className="pe-btn pe-btn--primary" onClick={() => handleCancelRFQModal(true)} autoFocus>Yes</button>
				</DialogActions>
			</Dialog>
			<Modal
				size="md"
				show={reOpenAuctionModal}
				backdrop="static"
				keyboard={false}
				centered
				className="zindex1400"
				backdropClassName="zindex1400"
				contentClassName="border-0"
				onHide={handleCloseReOpenModal}
			>
				<Modal.Body className="p-0">
					<div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
						<span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Pull Data From RFQ</span>
						<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={handleCloseReOpenModal}>
							<HiOutlineX className="f20" />
						</button>
					</div>
					<div className="p-3">
						<div className="row mb-2 align-items-center">
							<div className="col-md-3 me-0 pe-0">
								<div className="text-muted f15 fw500">Select RFQ :</div>
							</div>
							<div className="col-md-9 ms-0 ps-0">
								<input
									type="text"
									placeholder="Subject..."
									className={`form-control ${inputError ? 'is-invalid' : ''}`}
								/>
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
				className="zindex1400"
				backdropClassName="zindex1400"
				contentClassName="border-0"
				onHide={handleClosePRModal}
			>
				<Modal.Body className="p-0 d-flex flex-column" style={{ height: '78vh', overflow: 'hidden' }}>
					<div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
						<span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Pull Data From PR</span>
						<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={handleClosePRModal}>
							<HiOutlineX className="f20" />
						</button>
					</div>
					<div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'auto' }}>
						<div className="row mb-2 align-items-center">
							<div className="col-md-2 me-0 pe-0">
								<div className="text-muted f15 fw500">Select PR :</div>
							</div>
							<div className="col-md-10 ms-0 ps-0">
								<div className="d-flex">
									<div className="flex-grow-1 me-4">
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
						<div style={{ height: 400 }} className="mt-3 flex-shrink-0">
							<PETable
								rows={selectedPRItemModal}
								columns={prAuctioncolumn}
								checkboxSelection
								onRowSelectionModelChange={(ids) => setSelectedItemsActive(ids)}
								rowSelectionModel={selectedItemsActive}
								rowHeight={40}
								disableRowSelectionOnClick
								isRowSelectable={(params) => !params.row.eventId}
								pageSizeOptions={[10, 25, 50]}
								initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
							/>
						</div>
					</div>
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
					className="rfq-create-modal"
					contentClassName="border-0 rounded-default"
					onHide={() => handleCloseModal01()}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title><span style={{ fontSize: 14 }}>Select Currency Mode</span></Modal.Title>
						<button type="button" className="rfq-modal-close-btn" onClick={() => handleCloseModal01()}>
							<HiOutlineX style={{ fontSize: 16 }} />
						</button>
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
					className="rfq-create-modal zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0 rounded-default"
					onHide={() => CloseCurrencyModal()}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title><span style={{ fontSize: 14 }}>Manage Currency</span></Modal.Title>
						<button type="button" className="rfq-modal-close-btn" onClick={() => CloseCurrencyModal()}>
							<HiOutlineX style={{ fontSize: 16 }} />
						</button>
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
