import React, { useCallback, useEffect, useState, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import {
	HiOutlineX,
	HiPlusSm,
	HiChevronDown,
	HiOutlineDotsHorizontal,
	HiPencilAlt,
	HiDownload,
} from "react-icons/hi";
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import {
	Card,
	CardContent,
	CardHeader,

} from "@mui/material";
import {
	Autocomplete,
	Button,
	Checkbox,
	Button as Buttonmui,
	Divider,
	FormControlLabel,
	FormGroup,
	ButtonGroup,
	InputAdornment,
	MenuItem,
	Menu,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Tooltip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
	CircularProgress,
	Select,
	InputLabel,
	Alert,

} from "@mui/material";
import Drawer from "@mui/material/Drawer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import LoadingButton from "@mui/lab/LoadingButton";
import HistoryCell from "../../BaseCells/HistoryCell";
import { Badge, Dropdown, Form, FormControl, Modal } from "react-bootstrap";
import * as yup from "yup";
import { FieldArray, Formik, FormikContext, useFormik } from "formik";
import "react-quill/dist/quill.snow.css";
import ParticipantsCompanyDetails from "./ParticipantsCompanyDetails";
import AddEditCurrency from "../../../utils/common/AddEditCurrency";
import {
	BankDetailsAdd,
	BankDetailsUpdate,
	FinanceDetailsAdd,
	FinancialDetailsUpdate,
	FindBankDetailsAll,
	FindFinancialDetailsAll,
	FindParticipantAll,
	VendorApproveReject,
	editcontact,
	getvendor,
	register,
	registervendor,
	removebank,
	removefinance,
	updatevendor,
	uploadFilesOnAzure,
	uploadFilesOnAzureURL,
} from "../../../utils/manageParticipants";
import { LibraryFindAll } from "../../../utils/questionlibrary";
import { actionTypes, useStateValue } from "../../../store";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useCookies } from "react-cookie";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	CategoryMasterModal,
	CategoryRegisterMasterModal,
	CategorySqeMasterModal,
	SQEAddModal,
	downloadFilesOnAzure,
	fetchCities,
	fetchMasters,
	fetchStates,
	fetchSupplierByID,
	fetchSupplierByMail,
	fetchTax,
	findObjByValueFromArray,
	findObjListByValueFromArray,
	getFileName,
	getPayloadWithStage,
	getSQEData,
	getvendorPrimaryContactModal,
	handleDownloadFile,
	isTokenExpired,
	mapQuestionsToSubcategories,
	pullMessageCount,
	taxVerification,
	toastoption,
	validateEmail,
	vendorPrimaryContactModal,
} from "../../../utils/common";
import { useRef } from "react";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

import SelectApprovalsCell from "../../BaseCells/SelectApprovalsCell";
import { StageFindAll } from "../../../utils/stagemaster";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
	MemoizedActionCellBank,
	MemoizedActionCellFinance,
} from "../../../utils/manageParticipants/component";
import SupplierQuestionVQ from "./SupplierQuestionVQ";
import { MdDomainVerification } from "react-icons/md";
import { ApiClient, api } from "../../../Apiclient";
import CryptoJS from "crypto-js";
import {
	checkUTC,
	emailadditionalModal,
	extractPAN_Number,
	filteroptionDialingCode,
	formatDateViaTime,
	formatDateViaTimeZone,
	formattimeoption,
	getDateFormatPatteronLocale,
	getemailadditionalModal,
	phoneRegExp,
	userampm,
} from "../../../utils/common/utility";
import {
	BackButton,
	MemoizedEventStageFlow,
} from "../../../utils/common/component";
import NotFoundPage from "../../../components/NotAllowed";
import { DateTimePicker, LocalizationProvider, MobileDatePicker, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import EventQuestionCell from "../../BaseCells/EventQuestionCell";
import AddQuestionFormCell from "../../Configuration/RequestForQuotation/AddQuestionFormCell";
import { buildQueryParams, FindItemCategory } from "../../../utils/purchaseRequest";
import { RiBankLine } from "react-icons/ri";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import QuestionTabCell from "../../BaseCells/QuestionTabCell";
import { KeyboardBackspaceOutlined, PushPinOutlined, MailOutline } from "@mui/icons-material";
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import QueryList from "../../CommunucationHub/QueryList";
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import AddPrItemCategory from "../../../utils/common/AddPrItemCategory";
import { FaChalkboardUser } from "react-icons/fa6";

dayjs.extend(utc);
dayjs.extend(timezone);


// TabPanel component for tab content
function TabPanel(props) {
	const { children, value, index, noPadding, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			style={{
				padding: noPadding ? '0' : '24px',
				display: value === index ? 'block' : 'none'
			}}
			{...other}
		>
			{children}
		</div>
	);
}

const RegisterSuppliers = ({ claimType }) => {
	// Add CSS animation for pulse effect
	React.useEffect(() => {
		const style = document.createElement('style');
		style.textContent = `
			@keyframes pulse {
				0% { opacity: 1; transform: scale(1); }
				50% { opacity: 0.7; transform: scale(1.05); }
				100% { opacity: 1; transform: scale(1); }
			}
		`;
		document.head.appendChild(style);
		return () => document.head.removeChild(style);
	}, []);

	const [searchParams, setSearchParams] = useSearchParams();
	//#apiinterceptor to handle token expiry
	const EventQuestionScreenRef = React.createRef();
	const navigate = useNavigate();
	const [
		{
			atoken,
			rtoken,
			customerid,
			customersuffix,
			usertimezone,
			userdialingcode,
			roleClaims,
			userDetail,
		},
		dispatch,
	] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	const formikPrimaryContactRef = useRef();
	const [cookie, setCookie, removeCookie] = useCookies(["patkn", "prtkn"]);
	const location = useLocation();


	const { hash, pathname, search } = location;





	const { pageSlug, supplierid } = useParams();


	const [showVerifyButton, setShowVerifyButton] = useState(false);




	const [accessLevel, setAccessLevel] = useState("");
	const [pageslug, setpageslug] = useState(0)
	//to handle for add question
	const [libraryId, setLibraryId] = useState()
	// Tab state for Supplier Qualification
	const [tabValue, setTabValue] = useState(0);
	// State for submit dropdown menu in Preview tab
	const [submitMenuAnchor, setSubmitMenuAnchor] = useState(null);

	// Handler for tab changes
	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const updateEventLibraryId = (v) => {

		const { id } = v
		setLibraryId(id)
	}
	useEffect(() => {

		setpageslug(pageSlug)
	}, [pageSlug])
	useEffect(() => {

		const obj = findObjListByValueFromArray(
			roleClaims,
			claimType,
			`claimType`,
			`QR`
		);

		obj ? setAccessLevel(obj) : setAccessLevel("");
	}, [roleClaims]);



	useEffect(() => {

		const data = queryParams.get("CommId")?.trim();
		if (data) {
			dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
		}
	}, [])
	//for updating notification list for global variable
	
	const [requestCell, setRequestCell] = useState({
		EventId: 0,
		EventType: "QR",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
		//IsAscending:"True"
	});

	const [requestVICell, setRequestVICell] = useState({
		EventId: 0,
		EventType: "VI",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid,
	});

	const [requestVQCell, setRequestVQCell] = useState({
		EventId: 0,
		EventType: "VQ",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
		//IsAscending:"True"
	});
	useEffect(() => {
		const newIdFromURL = pageslug;

		// Get tab-wise event info like HistoryCell
		const { eventtype, eventId } = getTabwiseEventInfo();

		// Update Redux with the correct eventType and eventId
		dispatch({ type: actionTypes.SET_EVENTID, value: eventId ?? 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: eventtype });

		// Keep local reference for URL ID
		setIdFromURL(newIdFromURL);
	}, [searchParams, pathname, pageslug, requestVICell?.EventId, requestCell?.EventId]);





	const [categoryforapprove, setCategoryforapprove] = useState([]);
	const updateToken = async () => {
		const res = await isTokenExpired(atoken, rtoken, customerid);
		if (res) {
			if (res?.accessToken != "") {
				dispatch({ type: actionTypes.SET_ATOKEN, value: res.accessToken });
				var userAccessToken = CryptoJS.AES.encrypt(
					`${res.accessToken}`,
					process.env.REACT_APP_TOKEN_INCRYPT_KEY
				).toString();
				setCookie("patkn", userAccessToken, { path: "/", maxAge: 86400 });
			}
			if (res?.refreshToken != "") {
				dispatch({ type: actionTypes.SET_RTOKEN, value: res.refreshToken });
				var userRefreshToken = CryptoJS.AES.encrypt(
					`${res.refreshToken}`,
					process.env.REACT_APP_TOKEN_INCRYPT_KEY
				).toString();
				setCookie("prtkn", userRefreshToken, { path: "/", maxAge: 86400 });
			}
			return true;
		} else {
			return false;
		}
	};

	//#apicalls on this page

	// Reinvite supplier function
	const handleReinviteSupplier = async () => {
		try {
			// Use parentId instead of pageslug for reinvite
			const eventId = suppliercompleteDetails?.parentId || pageslug;
			const res = await apiClient.putres(
				`/api/managevendors/${eventId}/ReInvite`,
				{},
				atoken
			);

			if (res) {
				toast.success("Supplier reinvited successfully!", {
					position: toast.POSITION.TOP_CENTER,
				});
				// Optionally refresh supplier details to update status
				fetchSupplierDetails();
			}
		} catch (error) {
			toast.error("Failed to reinvite supplier. Please try again.", {
				position: toast.POSITION.TOP_CENTER,
			});
		}
	};






	//try
	const handleExtendSupplier = async () => {
		setProgress(true);

		// Check if categories are selected
		const hasCategories =
			(Array.isArray(supplierUserCategories) && supplierUserCategories.length > 0) ||
			(Array.isArray(category) && category.length > 0);

		if (!hasCategories) {
			toast.error("Add Item/Service category!", { toastId: "Service" });
			setValue(1); // Navigate to supplier users tab
			setLoading(false);
			setProgress(false);
			return;
		}

		// Get current contacts safely
		const contacts = !formikPrimaryContactRef
			? formikPrimaryContactRef?.current?.values?.vendorPrimaryContact || []
			: suppliersContact?.vendorPrimaryContact || [];

		// Check if at least one contact is primary BEFORE forcing isPrimary = true
		const hasPrimary = contacts.some(c => c.isPrimary);

		if (!hasPrimary) {
			toast.error("Please select admin", { toastId: "adminRequired" });
			setProgress(false);
			return; // Stop API call
		}

		// Check multiple primary contacts
		const primaryContacts = contacts.filter(c => c.isPrimary);

		if (primaryContacts.length > 1) {
			toast.error("More than one primary contact found.", { toastId: "primarycontacterror" });
			setProgress(false);
			return;
		}

		// Include vendor categories in payload
		const vendorCategories = supplierUserCategories || [];
		const stageData = getStageInfo(currentStage, stagelist);

		// If extend mode, set all contacts as primary (UI + payload)
		let updatedContacts = contacts;
		if (isExtend === "Y" && Array.isArray(contacts)) {
			updatedContacts = contacts.map(contact => ({ ...contact, isPrimary: true }));

			// Update Formik or local state
			if (formikPrimaryContactRef?.current) {
				formikPrimaryContactRef.current.setFieldValue('vendorPrimaryContact', updatedContacts);
			} else {
				setSupplierContact(prev => ({
					...prev,
					vendorPrimaryContact: updatedContacts
				}));
			}
		}

		// Prepare payload
		const payload = {
			vendorPrimaryContact: vendorPrimaryContactModal(updatedContacts, vendorCategories),
			stages: {
				eventType: "QR",
				currentStage: currentStage || stageData.currentStage,
				nextStage: stageData.nextStage || "",
				orgId: 0,
				orgGroupId: 0
			}
		};

		try {
			const res = await apiClient.post(
				`/api/managevendors/${customerid}/${pageslug}/mapsupplierCatUser`,
				payload,
				atoken
			);

			if (res) {
				toast.success("Supplier details saved successfully!", { toastId: "Supplier" });
				setIsExtendModeActive(false);
				navigate("/manage/manage-participants");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to save supplier details!");
		} finally {
			setProgress(false);
		}
	};










	const [vendorSpecificData, setVendorSpecificData] = useState(null);
	const handleVendorSpecificData = useCallback((x) => {
		setVendorSpecificData(x);
	}, []);

	const toggleDrawerCallback = useCallback((anchor, open) => {
		setState({ ...state, [anchor]: open });
	}, []);
	const [idFromURL, setIdFromURL] = useState(null);
	// useEffect(() => {
	// 	const params = new URLSearchParams(searchParams);

	// 	const newIdFromURL = pageslug;
	// 	//#eventid and eventtype
	// 	dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
	// 	dispatch({ type: actionTypes.SET_EVENTTYPE, value: "QR" });

	// 	setIdFromURL(newIdFromURL);

	// }, [searchParams]);
	useEffect(() => {

		const params = new URLSearchParams(searchParams);

		const newIdFromURL = pageslug;

		dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "QR" });

		setIdFromURL(newIdFromURL);
		// ✅ Set requestCell so QR case works
		setRequestCell(prev => ({
			...prev,
			EventId: newIdFromURL ?? 0
		}));
	}, [searchParams]);

	const queryParams = new URLSearchParams(location.search);
	const [emailParams, setEmailParams] = useState(
		queryParams.get("email")?.trim()
	);
	const [isExtend, setIsExtend] = useState(queryParams.get("isExtend"));

	const [activityType, setActivityType] = useState(
		queryParams.get("ActionType")?.trim()
	);

	const [activityId, setActivityId] = useState(
		queryParams.get("ActivityId")?.trim()
	);
	const [stagearray, setStagearray] = useState([`Draft`]);
	const [cookies] = useCookies(["patkn", "prtkn"]);
	const [ContactPerson, setContactPerson] = useState("");
	const [Email, setEmail] = useState("");
	const [frequency, setfrequency] = useState(0);
	const [DialingCode, setDialingCode] = useState(null);
	const [category, setCategory] = useState([]);
	const [Itemcategory, setItemcategory] = useState([]);
	const [PhoneNumber, setPhoneNumber] = useState("");
	const [TimeZone, setTimeZone] = useState(null);
	const [isActive, setIsactive] = useState(true);
	const [loading, setLoading] = useState(false);
	const [contactID, setContactID] = useState(0);
	const [uploadedFileName, setUploadedFileName] = useState("");
	const [questerms, setQuestTerm] = useState([]);
	const [totalRecords, setTotalRecords] = useState("");
	const [pageCount, setPageCount] = useState(1);
	const [requestApprover, setRequestApprover] = useState(null);
	const [isEmailDisabled, setIsEmailDisabled] = useState(false);




	const [eventAppList, setEventAppList] = useState([]);
	//to get approvers in each workflow to handle required/not required state handling
	const [approverInWorkflow, setApproverInWorkflow] = useState([])
	const handleEventAppList = useCallback((arr, updatedvalue) => {
		setEventAppList(arr);
		setApproverInWorkflow(updatedvalue)
	}, []);
	const [wfupdate, setwfUpdate] = useState([false]);

	const updateRequestCell = (newEventId) => {
		setRequestCell((prevState) => ({
			...prevState,
			EventId: newEventId,
		}));
	};

	//
	const [currentStage, setCurrentStage] = useState(`Draft`);

	const [SearchName] = useState("");
	const [SearchEmail] = useState("");
	const [SearchTax] = useState("");
	const [OrderBy] = useState("");
	const [Fields] = useState("");
	const [ParticipantList, setParticipantList] = useState([]);
	const [country_list, setCountryList] = useState([]);
	const [category_list, setCategoryList] = useState([]);
	const [timezone_list, setTimezoneList] = useState([]);
	const [currency_list, setCurrencyList] = useState([]);
	const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);
	const [state_list, setStateList] = useState([]);
	const [city_list, setCityList] = useState([]);
	const [tax_list, setTaxList] = useState(null);
	const [stagelist, setStageList] = useState(null);

	//Supplier Details formik2 start here
	const [editRecordData, seteditRecordData] = useState(null);
	const [editRecordDataBank, seteditRecordDataBank] = useState(null);
	const [editRecordDataFinance, seteditRecordDataFinance] = useState(null);
	const [companyName, setCompanyName] = useState("");
	const [tradeName, setTradeName] = useState("");
	const [address, setAddress] = useState("");
	const [country, setCountry] = useState(null);
	const [Cstate, setCState] = useState(null);
	const [city, setCity] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [taxId, setTaxId] = useState("");
	const [taxIdType, setTaxIdType] = useState(null);
	const [taxId2, setTaxId2] = useState("");
	const [taxId2Type, setTaxId2Type] = useState(null);
	const [gstnStatus, setGstnStatus] = useState("");
	const [eInvoiceStatus, seteInvoiceStatus] = useState("");
	const [taxpayerType, setTaxpayerType] = useState("");
	const [dialingCode, setdialingCode] = useState("");
	const [phoneNumber, setphoneNumber] = useState("");
	//for checking extendvendor
	const [isSupplierExist, setIsSupplierExist] = useState(false);

	const [stageVIlist, setStageVIList] = useState(null);
	const [permissionManager, setPermissionManager] = useState(null);
	const [loadingPermissions, setLoadingPermissions] = useState(true);

	//usestate for vq
	const [vqSubject, setvqSubject] = useState("");
	const [vqDescription, setvqDescription] = useState("");
	const [vqEndDate, setvqEndDate] = useState(null);
	const [sqe, setSqe] = useState("");
	const [sqeHeaderId, setSqeHeaderId] = useState("");
	const [sqeServiceCategory, setSqeServiceCategory] = useState([]);
	useEffect(() => {
		fetchMasters(atoken, customerid).then((res) => {
			if (res) {
				setCountryList(res.countryList);
				setTimezoneList(res.timezoneList);
				setCurrencyList(res.currencyList);

				// ✅ Fix: use itemCategoryList, not categoryList
				setCategoryList(
					res.categoryList?.map(x => ({
						id: x.id,
						itemCategory: x.itemCategory,
					})) || []
				);

			}
		});
	}, []);
const handleCategoryList = (array) => {
  setItemcategory(array);
  setCategoryList(array); // this is key
};

	const [isIN3, setIN3] = useState(false);






	const getStageInfo = (currentStage, stageList) => {



		if (!stageList || stageList.length === 0) return null;

		const currentStageObj = stageList.find(stage => stage.stageName === currentStage);
		if (!currentStageObj) return null; // If current stage is not found

		const nextStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq + 1);
		const prevStageObj = stageList.find(stage => stage.stageSeq === currentStageObj.stageSeq - 1);

		return {
			prevStage: prevStageObj ? prevStageObj.stageName : null,
			prevStageId: prevStageObj ? prevStageObj.stageId : null,
			currentStage: currentStageObj.stageName,
			currentStageId: currentStageObj.stageId,
			nextStage: nextStageObj ? nextStageObj.stageName : null,
			nextStageId: nextStageObj ? nextStageObj.stageId : null
		};
	};

	// Example usage
	const stageInfo = getStageInfo(currentStage, stagelist);
	useEffect(() => {


		if (pageslug) {
			PullLibraryAll();
			// PullSQEList();

		}

	}, [pageslug]);

	// Initialize original tax ID tracking when form values are loaded


	useEffect(() => {
		if (
			country_list &&
			country_list.length > 0 &&
			timezone_list &&
			timezone_list.length > 0
		) {
			fetchSupplierDetails();
		}

		// Reset isSupplierSaved for new supplier creation
		if (!pageslug && !pathname.includes("invited-participants")) {
			setIsSupplierSaved(false);
		}

	}, [country_list, timezone_list, pageslug]);
	const [initialEventType, setInitialEventType] = useState("");
	const [suppliercompleteDetails, setSupplierCompleteDetails] = useState(null)
	const [createdInfo, setCreatedInfo] = useState({
		createdById: null,
		initialEventType: 'QR'
	});

	// Add missing state variables to fix linting errors
	const [progress, setProgress] = useState(false);
	const [approvershow, setApproverShow] = useState(false);

	const [isSaveVisible, setIsSaveVisible] = useState(true);

	const [vendorIdForForm, setVendorIdForForm] = useState(0);

	// Currency Modal Handlers
	const CloseCurrencyModal = () => setOpenCurrencyModal(false);
	
	const handleCurrencyList = (list) => {
		setCurrencyList(list);
	};

	const [isExtendModeActive, setIsExtendModeActive] = useState(false);
	
 	useEffect(() => {
		getUserRoleRights();
	}, []);
const getUserRoleRights = async () => {
		const obj = {
			FeatureName: "Supplier Registration",
			UserId: userDetail?.id,
			CreatedById: userDetail?.id
		}
		const queryParams = buildQueryParams(obj);
		try {
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);

			if (res) {
				const permManager = new PermissionManager(res?.data);
				setPermissionManager(permManager);
			}
		} catch (err) {
			// swallow -- permission loading failure should not crash the page
			console.error("Failed to load permissions", err);
		} finally {
			setLoadingPermissions(false);
		}
	};

	const fetchSupplierDetails = () => {

		// Check if isExtend=Y in URL
		const urlParams = new URLSearchParams(location.search);
		const isExtendParam = urlParams.get("isExtend");

		if (pathname.includes("invited-participants")) {
			const idToFetch = supplierid || pageSlug;
			fetchSupplierByID(idToFetch, atoken)
				.then((res) => {
					if (!res || res === "") {
						setLoading(false);
						return;
					}
					setSupplierCompleteDetails(res);
					setVendorIdForForm(res?.id ?? 0); // <-- Yeh line add karo

					setParentIdForVI(res?.parentId ?? 0);

					setRequestVICell({
						EventId: res?.parentId,
						EventType: 'VI',
						SortingColumn: "ApproverSeq",
						CustomerId: customerid,
					});

					prefilledSupplierData(res);
					setInitialEventType('VI');

					// Set supplier as saved when editing existing invited participant with Tax ID
					if (res?.taxId && res.taxId.trim() !== '') {
						setIsSupplierSaved(true);
					}

					setCreatedInfo({
						createdById: res?.createdById || null,
						initialEventType: 'VI',
					});

					setCategoryforapprove(res?.categories ?? []);
					if (res.stage) {
						setCurrentStage(res.stage);
					}

					// If isExtend=Y, use EventType=QR and EventId=0
					const stageParams = isExtendParam === "Y"
						? { EventType: 'QR', CustomerId: customerid, EventId: 0 }
						: { EventType: 'VI', CustomerId: customerid, EventId: res.id };

					StageFindAll(stageParams, atoken).then((stageRes) => {
						setStageVIList(stageRes);
						setStageList(stageRes);
					});

					setRequestCell({
						EventId: res?.id,
						EventType: 'VI',
						SortingColumn: "ApproverSeq",
						CustomerId: customerid,
					});

					if (res?.userAccess?.length > 0) {
						// Initialize Permission Manager with user access data
						const permManager = new PermissionManager(res?.userAccess);
						setPermissionManager(permManager);
					}

					setLoading(false);
				})
				.catch((error) => {
					console.error("Error fetching invited participant:", error);


					// ✅ Show modal only for 404
					if (error?.response?.status === 404) {
						// setsupplierShow(true);
					}

					setLoading(false);
				}); // <-- End of fetchSupplierByID().catch()




		}



		else if (pageslug) {
			fetchSupplierByID(pageslug, atoken).then((res) => {
				if (res) {
					setSupplierCompleteDetails(res);
					const eventType = res?.parentId && res.parentId > 0 ? 'VI' : 'QR';
					const eventId = res?.parentId && res.parentId > 0 ? res.parentId : res.id;
					prefilledSupplierData(res);
					//const eventType = res?.initialEventType || 'QR';
					setInitialEventType(eventType);

					// ✅ Also set here based on actual data
					setCreatedInfo({
						createdById: res?.createdById || null,
						initialEventType: eventType,
					});

					// Set supplier as saved when editing existing supplier with Tax ID
					if (res?.taxId && res.taxId.trim() !== '') {
						setIsSupplierSaved(true);
					}

					setCategoryforapprove(res?.categories ?? []);
					if (res.stage) {
						setCurrentStage(res.stage);
					}

					// If isExtend=Y, use EventType=QR and EventId=0
					const stageParams = isExtendParam === "Y"
						? { EventType: 'QR', CustomerId: customerid, EventId: 0 }
						: { EventType: eventType, CustomerId: customerid, EventId: res.id };

					StageFindAll(stageParams, atoken).then((res) => {
						setStageList(res);
					});

					updateRequestCell(res?.id);
					setRequestCell({
						EventId: eventId,
						EventType: eventType,
						SortingColumn: "ApproverSeq",
						CustomerId: customerid,
					});
					setLoading(false);
				}
				if (res?.userAccess?.length > 0) {
					// Initialize Permission Manager with user access data
					const permManager = new PermissionManager(res?.userAccess);
					setPermissionManager(permManager);
				}
			});
		} else {
			// If isExtend=Y, use EventType=QR and EventId=0 (which is already the default case)
			StageFindAll(
				{ EventType: "QR", CustomerId: customerid, EventId: 0 },
				atoken
			).then((res) => {
				setStageList(res);
			});
		}
	};








	const [extendSupplierId, setExtendSupplierIdentity] = useState(null)


	// Update extend mode state when supplier details change
	useEffect(() => {
		if (isExtend && suppliercompleteDetails && !suppliercompleteDetails?.isMapped) {
			setIsExtendModeActive(true);
		} else {
			setIsExtendModeActive(false);
		}
	}, [isExtend, suppliercompleteDetails]);
	const handleSupplierExist = async (taxid) => {

		if (taxid) {
			const isTokenExpired = await updateToken();
			const res = await apiClient.get(
				`/api/managevendors/${taxid}/getvendorbyemail`,
				atoken
			);

			if (res) {
				if (res.customerId != customerid) {
					setIsExternal(true);
					setIsSupplierExist(false);
					handleClickOpenModal();
					setExtendSupplierIdentity(res?.id)
				} else {
					setIsExternal(false);
					setIsExternalID(res.id);
					setIsSupplierExist(false);
					handleClickOpenModal();
					setExtendSupplierIdentity(null)
				}
			} else {
				setIsSupplierExist(true);
			}
		} else {
			setIsSupplierExist(false);
		}
	};

	const [SqeList, setSqeList] = useState([])
	const PullSQEList = async () => {
		try {
			const res = await apiClient.getres(`/api/SQE/${pageslug}/Find`, atoken);

			// Handle different response structures
			let sqeData = [];
			if (res && res.data) {
				// Check if response.data is an array directly
				if (Array.isArray(res.data)) {
					sqeData = res.data;
				}
				// Check if response.data has a result property
				else if (res.data.result && Array.isArray(res.data.result)) {
					sqeData = res.data.result;
				}
				// Check if response.data is just the data object
				else if (typeof res.data === 'object' && res.data.id) {
					sqeData = [res.data]; // Single object, wrap in array
				}
			}

			if (sqeData.length > 0) {
				// Validate data structure
				const validData = sqeData.filter(item => item && item.id);

				if (validData.length > 0) {
					setSqeList(validData);

					// Set the first VQ as the current eventId for stage flow
					const eventId = validData[0].id;
					setRequestVQCell(prev => ({
						...prev,
						EventId: eventId
					}));

					dispatch({ type: actionTypes.SET_EVENTID, value: eventId });
					dispatch({ type: actionTypes.SET_EVENTTYPE, value: "VQ" });

					// 🔄 Load questions from the first VQ that has questions (for normal navigation)
					const vqWithQuestions = validData.find(vq => vq.sqeHeaderDetails && vq.sqeHeaderDetails.length > 0);
					if (vqWithQuestions) {
						// Transform and display questions like in loadExistingVQData
						const transformedQuestions = vqWithQuestions.sqeHeaderDetails.map((question) => ({
							// Basic question info
							id: question.questionId,
							questionId: question.questionId,
							questionDescription: question.questionDescription,
							questionCategory: question.questionCategory,
							questionSubCategory: question.questionSubCategory,
							categoryId: question.categoryId,
							categorySubId: question.categorySubId,
							libraryId: question.libraryId,

							// Question properties
							optionType: question.optionType,
							weightage: question.weightage,
							mandatory: question.mandatory,
							attachement: question.attachement,
							attachedFileName: question.attachedFileName,
							questionRequirement: question.questionRequirement,

							// VQ specific fields
							vqHeaderId: question.vqHeaderId,
							vendorId: question.vendorId,
							customerId: question.customerId,

							// Answer and scoring
							answer: question.answer,
							score: question.score,
							ansAttachements: question.ansAttachements,

							// Multiple choice settings
							isMultipleChoice: question.isMultipleChoice,
							isMultiOption: question.isMultiOption,
							autoCalculated: question.autoCalculated,

							// Question options
							questionOption: question.questionOption || [],

							// Metadata
							stages: question.stages,

							// Flag to indicate this is preselected
							isPreselected: true
						}));

						setQuestionList(transformedQuestions);
						setSelectedQuesionArray(transformedQuestions);

						// Also populate the VQ form with the first VQ's details
						const firstVQ = validData[0];

						setvqSubject(firstVQ.vqSubject || "");
						setvqDescription(firstVQ.vqDescription || "");
						setfrequency(firstVQ.frequency || 0);
						setSqeServiceCategory(firstVQ.sqeServiceCategory || []);

						// Set formik values
						if (typeof formik_SQE !== 'undefined' && formik_SQE.setFieldValue) {
							formik_SQE.setFieldValue("vqSubject", firstVQ.vqSubject || "");
							formik_SQE.setFieldValue("vqDescription", firstVQ.vqDescription || "");
							formik_SQE.setFieldValue("frequency", firstVQ.frequency || 0);
							formik_SQE.setFieldValue("sqeServiceCategory", firstVQ.sqeServiceCategory || []);

							if (firstVQ.vqEndDate) {
								try {
									const endDate = checkUTC(firstVQ.vqEndDate);
									const parsedEndDate = dayjs(endDate).tz(userDetail?.timeZone);
									setvqEndDate(parsedEndDate);
									formik_SQE.setFieldValue("vqEndDate", parsedEndDate);
								} catch (error) {
									console.error("Error parsing VQ end date:", error);
								}
							}
						}
					} else {
						setQuestionList([]);
						setSelectedQuesionArray([]);
					}
				} else {
					console.warn("No valid VQ data found (missing IDs)");
					setSqeList([]);
					setQuestionList([]);
					setSelectedQuesionArray([]);
				}
			} else {
				setSqeList([]);
				setQuestionList([]);
				setSelectedQuesionArray([]);
			}
		} catch (error) {
			console.error("Failed to fetch SQE List:", error);
			setSqeList([]);
			toast.error("Failed to load VQ records. Please try again.");
		}
	};




	const PullParticipantList = () => {
		var data = {
			SearchName: SearchName,
			SearchEmail: SearchEmail,
			SearchTax: SearchTax,

			OrderBy: OrderBy,
			Fields: Fields,
		};

		FindParticipantAll(data, atoken).then((res) => {
			if (res != "" && res != undefined) {
				setParticipantList(res);
			} else {
				setParticipantList([]);
			}
			// setLoading(false);
		});
	};



	const initialValues_tab1 = {
		ContactPerson: ContactPerson,
		Email: Email,
		DialingCode: DialingCode,
		PhoneNumber: PhoneNumber,
		TimeZone: TimeZone,
		isActive: true,
		additionalContactDetails: vendorSpecificData?.additionalContactDetails || [
			{ email: "", contactPerson: "", PhoneNumber: "" },
		],
	};

	const initialValues_register = {
		ContactPerson: ContactPerson,
		Email: Email,
		DialingCode: DialingCode,
		PhoneNumber: PhoneNumber,
		TimeZone: TimeZone,
		isActive: isActive,
		additionalContactDetails: [{ email: "", contactPerson: "", PhoneNumber: "" }],
		//companyrelated details
		companyName: companyName,
		tradeName: tradeName,
		address: address,
		country: country,
		state: Cstate,
		city: city,
		zipCode: zipCode,
		taxId: taxId,
		taxIdType: taxIdType,
		taxId2: taxId2,
		taxId2Type: taxId2Type,
		gstnStatus: gstnStatus,
		eInvoiceStatus: eInvoiceStatus,
		taxpayerType: taxpayerType,
		dialingCode: dialingCode,
		phoneNumber: phoneNumber,
		vendorCategoryMappings: category,
	};
	// 🔥 Helper function to convert categories to vendorCategoryMappings
	const convertCategoriesToMappings = (categories) => {
		if (!categories || !Array.isArray(categories)) return [];

		return categories.map(category => ({
			id: 0, // Set to 0 for new mappings, backend will assign proper ID
			categoryId: category.id,
			vendorId: 0, // Will be set by backend
			contactId: 0, // Will be set by backend
			customerId: customerid || 0
		}));
	};

	const register_supplier = (values) => {
		// 🔥 Check categories from contact data instead of old category variable
		const contactCategories = suppliersContact?.vendorPrimaryContact?.[0]?.categories || [];

		if (contactCategories.length === 0) {
			toast.error(`Please select atleast one category to proceed`, {
				position: toast.POSITION.TOP_CENTER,
			});
			setLoading(false);
			return false;
		}

		// 🔥 Convert categories to vendorCategoryMappings format for backend
		const vendorCategoryMappings = convertCategoriesToMappings(contactCategories);

		// 🔥 Create updated initialValues with proper vendorCategoryMappings
		const updatedVendorMasters = {
			...initialValues_register,
			vendorCategoryMappings: vendorCategoryMappings
		};

		var data = {
			ContactPerson: ContactPerson,
			Email: Email,
			DialingCode: DialingCode,
			PhoneNumber: PhoneNumber,
			TimeZone: TimeZone,
			isActive: true,
			additionalContactDetails: inputList[0].emailadditional
				? emailadditionalModal(inputList)
				: [],
			vendorMasters: updatedVendorMasters,
		};

		setLoading(true);

		// api call to save data

		register(data, stagelist, currentStage, atoken).then((res) => {
			setLoading(false);

			if (res) {
				setContactID(res?.id);
				updateRequestCell(res?.id);
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });
				setValue(2);
				companyCloseDrawer();
				navigate("/manage/manage-participants");
				return true;
			}
		});
	};

	const registerParticipant_tab1 = (values) => {
		// Check permissions first for editing supplier users
		if (vendorSpecificData && vendorSpecificData?.id > 0) {
			if (!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.EDIT) ?? false)) {
				toast.error("You don't have permission to edit supplier users.", {
					toastid: "permission_error"
				});
				return;
			}
		} else {
			if (!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.CREATE) ?? false)) {
				toast.error("You don't have permission to create supplier users.", {
					toastid: "permission_error"
				});
				return;
			}
		}

		const additionalcontact = inputList.filter((x) => !x.id);
		var data = {
			ContactPerson: ContactPerson,
			Email: Email,
			DialingCode: DialingCode,
			PhoneNumber: PhoneNumber,
			TimeZone: TimeZone,
			isActive: true,
			additionalContactDetails: additionalcontact[0].emailadditional
				? emailadditionalModal(additionalcontact)
				: [],
		};

		setLoading(true);

		// api call to save data
		if (vendorSpecificData && vendorSpecificData?.id > 0) {
			editcontact(data, contactID, cookies).then((res) => {
				setLoading(false);
				fetchSupplierDetails();
			});
		} else {
			register(data, stagelist, atoken).then((res) => {
				setLoading(false);
				if (res) {
					setContactID(res?.id);

					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					setValue(2);
					// clearfilledDocument_tab1();
					return true;
				}
			});
		}
	};

	const validationSchema_tab1 = yup.object({
		// ContactPerson: yup.string().required("Please Enter Name"),
		/// Email: yup.string().email().required("Please Enter Email"),
		// DialingCode: yup.string().required("Please Select DialCode"),
		// PhoneNumber: yup.number().required("Please Enter Number"),
		// TimeZone: yup.string().required("Please Select TimeZone"),
	});
	const [value, setValue] = React.useState(() => {
		// Parse URL to detect VQ events
		const searchParams = new URLSearchParams(location.search);
		const sqId = searchParams.get('sqId');
		const actionType = searchParams.get('ActionType');

		// Start with VQ tab (2) if this is a VQ approval event
		if (pathname.includes("register-participants") && sqId && actionType === "approval") {
			return 2;
		}

		// Default to first tab (0) for other cases
		return 0;
	});

	// After permissions load, ensure we land on an accessible tab
	useEffect(() => {
		if (!loadingPermissions && permissionManager) {
			const hasDetails = permissionManager.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ);
			const hasUsers = permissionManager.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.READ);
			const hasQualification = permissionManager.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.READ);
			const hasQueries = hasDetails; // reuse details permission for queries

			// If current tab is not accessible, switch to the first accessible tab
			if (value === 0 && !hasDetails) {
				if (hasUsers) setValue(1);
				else if (hasQualification) setValue(2);
				else if (hasQueries) setValue(3);
			} else if (value === 1 && !hasUsers) {
				if (hasDetails) setValue(0);
				else if (hasQualification) setValue(2);
				else if (hasQueries) setValue(3);
			} else if (value === 2 && !hasQualification) {
				if (hasDetails) setValue(0);
				else if (hasUsers) setValue(1);
				else if (hasQueries) setValue(3);
			} else if (value === 3 && !hasQueries) {
				if (hasDetails) setValue(0);
				else if (hasUsers) setValue(1);
				else if (hasQualification) setValue(2);
			}
		}
	}, [loadingPermissions, permissionManager, value]);
	const [showOnlyVQActions, setShowOnlyVQActions] = useState(false);
	const [hasInitialRedirect, setHasInitialRedirect] = useState(false); // Track if we've done initial redirect

	// Accordion state management
	const [isFormAccordionExpanded, setIsFormAccordionExpanded] = useState(true);

	// Handler for Add Question from Library action
	const handleAddQuestionFromLibrary = () => {
		// Close the accordion when Add Question is clicked
		setIsFormAccordionExpanded(false);
		// Add slight delay for smooth transition and scroll to questions
		setTimeout(() => {
			const questionSection = document.querySelector('[data-testid="question-section"]');
			if (questionSection) {
				questionSection.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
					inline: 'nearest'
				});
			}
		}, 300);
	};

	// VQ Event Detection useEffect
	// 	useEffect(() => {
	// 	const rawSearch = location.search; // raw query string
	// 	console.log("VQ Detection - Raw search:", rawSearch);
	// 	console.log("VQ Detection - Pathname:", location.pathname);

	// 	// Handle malformed URL with double question marks like: ?ActionType=approval?sqId=140
	// 	// Replace all '?' with '&' first, then split by '&' and filter empty strings
	// 	let cleanSearch = rawSearch;
	// 	if (rawSearch.includes('?')) {
	// 		// Replace first ? with nothing, then replace all remaining ? with &
	// 		cleanSearch = rawSearch.substring(1).replace(/\?/g, '&');
	// 	}

	// 	console.log("VQ Detection - Clean search:", cleanSearch);

	// 	const queryParamsArray = cleanSearch.split('&').filter(param => param.length > 0);

	// 	let sqId = null;
	// 	let actionType = null;
	// 	let activityId = null;

	// 	queryParamsArray.forEach(param => {
	// 		const [key, value] = param.split('=');
	// 		if (key === 'sqId') sqId = decodeURIComponent(value || '');
	// 		if (key === 'ActionType') actionType = decodeURIComponent(value || '');
	// 		if (key === 'ActivityId') activityId = decodeURIComponent(value || '');
	// 	});

	// 	console.log("VQ Detection - Parsed params:", { sqId, actionType, activityId });

	// 	// Check if on a VQ event route (register-participants) AND sqId exists
	// 	const isVQRoute = location.pathname.includes("register-participants");
	// 	const hasVQParameters = sqId && actionType === "approval";

	// 	console.log("VQ Detection - isVQRoute:", isVQRoute, "hasVQParameters:", hasVQParameters, "sqId exists:", !!sqId);

	// 	if (isVQRoute && hasVQParameters) {
	// 		console.log("✅ VQ SQID Event detected - showing only VQ actions");
	// 		setShowOnlyVQActions(true);
	// 		setSqeHeaderId(sqId);
	// 		if (activityId) setActivityId(activityId);
	// 		if (actionType) setActivityType(actionType);

	// 		// Only redirect to VQ tab on initial load, not on every tab change
	// 		if (!hasInitialRedirect) {
	// 			console.log("🔄 First time VQ detection - redirecting to VQ tab (2), current tab:", value);
	// 			setTimeout(() => {
	// 				// setValue(2);
	// 				setIsEditing(true); 
	// 				setHasInitialRedirect(true); // Mark that we've done the initial redirect
	// 			}, 100);
	// 		} else {
	// 			console.log("🚫 VQ SQID detected but initial redirect already done, staying on current tab:", value);
	// 		}
	// 	} else {
	// 		console.log("❌ Not a VQ SQID event - showing default actions");
	// 		setShowOnlyVQActions(false);
	// 	}
	// }, [location.search, location.pathname, value]);
	useEffect(() => {
		const rawSearch = location.search; // raw query string


		// Fix malformed URL
		let cleanSearch = rawSearch;
		if (rawSearch.includes('?')) {
			cleanSearch = rawSearch.substring(1).replace(/\?/g, '&');
		}


		const queryParamsArray = cleanSearch.split('&').filter(param => param.length > 0);

		let sqId = null;
		let actionType = null;
		let activityId = null;

		queryParamsArray.forEach(param => {
			const [key, value] = param.split('=');
			if (key === 'sqId') sqId = decodeURIComponent(value || '');
			if (key === 'ActionType') actionType = decodeURIComponent(value || '');
			if (key === 'ActivityId') activityId = decodeURIComponent(value || '');
		});



		const isVQRoute = location.pathname.includes("register-participants");
		const hasVQParameters = sqId && actionType === "approval";



		if (isVQRoute && hasVQParameters) {
			setShowOnlyVQActions(true);
			setSqeHeaderId(sqId);
			if (activityId) setActivityId(activityId);
			if (actionType) setActivityType(actionType);

			if (!hasInitialRedirect) {
				const pathSegments = location.pathname.split('/');
				const participantId = pathSegments[pathSegments.length - 1]; // preserve participantId from path

				setTimeout(() => {
					navigate(`/manage/manage-participants/register-participants/${participantId}?ActionType=approval&sqId=${sqId}&ActivityId=${activityId || ''}`, { replace: true });
					setIsEditing(true);
					setHasInitialRedirect(true);
				}, 100);
			}
		} else {
			setShowOnlyVQActions(false);
		}
	}, [location.search, location.pathname, value, hasInitialRedirect, navigate]);




	// useEffect(() => {
	// 	if (value === 2) {
	// 		if (!pathname.includes("invited-participants")) {
	// 			dispatch({ type: actionTypes.SET_EVENTTYPE, value: "VQ" });
	// 		}
	// 	} else {
	// 		if (!pathname.includes("invited-participants")) {
	// 			dispatch({ type: actionTypes.SET_EVENTTYPE, value: "QR" });
	// 		}
	// 	}
	// }, [value, pathname]);
	useEffect(() => {
		if (pathname.includes("invited-participants")) {
			// VI case: invited-participants URL
			dispatch({ type: actionTypes.SET_EVENTTYPE, value: "VI" });
		} else if (value === 2) {
			// VQ case: tab index 2
			dispatch({ type: actionTypes.SET_EVENTTYPE, value: "VQ" });
		} else {
			// QR case: default
			dispatch({ type: actionTypes.SET_EVENTTYPE, value: "QR" });
		}
	}, [value, pathname]);

	// Set sqeHeaderId and activityId when sqId is present in URL
	useEffect(() => {
		// Parse malformed URL manually
		const rawSearch = location.search;
		const queryParamsArray = rawSearch.replace('?', '').split('&');

		let sqId = null;
		let activityIdFromUrl = null;
		let actionTypeFromUrl = null;
		let isExtendFromUrl = null;

		queryParamsArray.forEach(param => {
			const [key, value] = param.split('=');
			if (key === 'sqId') sqId = value;
			if (key === 'ActivityId') activityIdFromUrl = value;
			if (key === 'ActionType') actionTypeFromUrl = value;
			if (key === 'isExtend') isExtendFromUrl = value;
		});



		// Only handle VQ SQID events on register-participants route
		const isVQSQIDEvent = pathname.includes("register-participants") && sqId && actionTypeFromUrl === "approval";

		if (isVQSQIDEvent) {

			setSqeHeaderId(sqId); // Set the specific VQ ID

			// Set ActivityId for action button display
			if (activityIdFromUrl && !activityId) {

				setActivityId(activityIdFromUrl);
			}

			// Set activityType
			if (actionTypeFromUrl) {

				setActivityType(actionTypeFromUrl);
			}

			// Ensure we're on the VQ tab - but only if initial redirect hasn't been done
			if (!hasInitialRedirect) {
				setTimeout(() => {

					setValue(2);
					setHasInitialRedirect(true);
				}, 100);
			}
		}
	}, [location.search, activityId, pathname, hasInitialRedirect]);


	// Effect to detect "Add Question" button clicks in EventQuestionScreen
	useEffect(() => {
		const handleAddQuestionClick = () => {
			// This will be triggered when "Add Question" is clicked
			handleAddQuestionFromLibrary();
		};

		// Listen for clicks on elements with "Add Question" text
		const handleDocumentClick = (event) => {
			const target = event.target;
			const text = target.textContent || target.innerText || '';

			// Check if the clicked element or its parent contains "Add Question" text
			if (text.includes('Add Question') || text.includes('+ Add Question')) {
				// Add slight delay to ensure the click is processed
				setTimeout(handleAddQuestionClick, 100);
			}
		};

		document.addEventListener('click', handleDocumentClick);

		return () => {
			document.removeEventListener('click', handleDocumentClick);
		};
	}, []);

	const validationSchema_register = yup.object({
		ContactPerson: yup.string().required("Please Enter Person name"),
		Email: yup.string().required("Please Enter Email "),
		PhoneNumber: yup
			.string()
			.matches(phoneRegExp, "Phone number must contain only digits")
			.required("Please Enter Number")
			.min(7, "Please Check Mobile Number cannot be less than 7 digits"),
		//companyName: yup.string().required('please enter supplier name')
	});

	const handleChange = (event, newValue) => {
		// Check if GST verification is required before allowing tab change
		if (value === 0 && (newValue === 1 || newValue === 2)) {
			if (!validateGSTBeforeNavigation(newValue)) {
				return; // Prevent tab change if GST verification is required
			}
		}

		// ✅ Only call PullSQEList when switching to Supplier Qualification AND not loading a specific VQ
		if (newValue === 2 && !sqeHeaderId) {

			PullSQEList();
		} else if (newValue === 2 && sqeHeaderId) {
			console.log("📋 Tab change to VQ - skipping PullSQEList (specific VQ ID exists:", sqeHeaderId, ")");
		}

		setApproverShow(false);
		setValue(newValue);
		if (newValue == "2") {
			if (approvershow)
				setApproverShow(false)
		} else if (newValue == "1") {
			if (approvershow)
				setApproverShow(false)
		} else if (newValue == "0") {
			if (approvershow)
				setApproverShow(false)
		}
		else {
			if (!approvershow)
				setApproverShow(true)
		}
	};
	const handletab = () => {
		if (value === 1 && formik.isValid === false) {
			return;
		}

		const newValue = value + 1; // ✅ Define it properly

		setValue(newValue);

		if (newValue === 2 && !contactID) {
			setState({ ...state, ["addProductDrawer"]: true });
		}

		// ✅ Use newValue to conditionally call PullSQEList
		if (newValue === 2) {
			PullSQEList();
		}

		const countryobj = findObjByValueFromArray(
			country_list,
			userdialingcode,
			"dialingCode"
		);

		if (countryobj) {
			handlefieldonCountryKey(countryobj?.id);
			setCountry(countryobj);
			handleTax(countryobj?.id, null);
			handleStates(countryobj?.id, null);
		}
	};

	// const handletab = () => {
	// 	if (value == 1) {
	// 		if (formik.isValid == false) {
	// 			return;
	// 		}
	// 	}
	// 	setValue(value + 1);
	// 	if (value + 1 == 2 && !contactID) {
	// 		setState({ ...state, ["addProductDrawer"]: true });
	// 	}
	// if (newValue === 2) {
	// 	PullSQEList();
	// }
	// 	const countryobj = findObjByValueFromArray(
	// 		country_list,
	// 		userdialingcode,
	// 		"dialingCode"
	// 	);

	// 	if (countryobj) {
	// 		handlefieldonCountryKey(countryobj?.id);

	// 		setCountry(countryobj);
	// 		handleTax(countryobj?.id, null);
	// 		//handleStates(newvalue?.countryKey, null);
	// 		handleStates(countryobj?.id, null);
	// 	}
	// };

	const initialValues_tab2 = {
		companyName: companyName,
		tradeName: tradeName,
		address: address,
		//country: editRecordData?.country ?  findObjByValueFromArray(country_list,editRecordData?.country, "countryName") : country,
		country: country,
		//state: editRecordData?.Cstate ? findObjByValueFromArray(state_list,editRecordData?.Cstate, "stateName") : Cstate,
		state: Cstate,
		city: city,
		zipCode: zipCode,
		taxId: taxId,
		taxIdType: taxIdType,
		taxId2: taxId2,
		taxId2Type: taxId2Type,
		gstnStatus: gstnStatus,
		eInvoiceStatus: eInvoiceStatus,
		taxpayerType: taxpayerType,
		dialingCode: dialingCode,
		phoneNumber: phoneNumber,
	};

	const registerParticipant_tab2 = (values) => {
		// Permission validation for supplier qualification
		if (!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.CREATE) ?? false ) && !(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.EDIT) ?? false)) {
			toast.error("You don't have permission to perform this action", {
				toastId: "supplierQualificationPermission"
			});
			setLoading(false);
			return false;
		}

		if (category.length < 1) {
			toast.error(`Please select atleast one category to proceed`, {
				toastId: "atleastupplier"
			});
			setLoading(false);
			return false;
		}
		var data = {
			companyName: companyName,
			tradeName: tradeName,
			address: address,
			country: country,
			state: Cstate,
			city: city,
			zipCode: zipCode,
			taxId: taxId,
			taxIdType: taxIdType,
			taxId2: taxId2,
			taxId2Type: taxId2Type,
			gstnStatus: gstnStatus,
			eInvoiceStatus: eInvoiceStatus,
			taxpayerType: taxpayerType,
			dialingCode: dialingCode,
			phoneNumber: phoneNumber,
			vendorCategoryMappings: category,
			defaultCurrency: defaultCurrency,
		};
		setLoading(true);

		//api call to save data

		if (editRecordData?.id > 0) {
			updatevendor(data, editRecordData?.id, cookies).then(async (res) => {
				if (res) {
					const resp = await apiClient.post(
						`/api/managevendors/${editRecordData?.id}/updatevendorcategory`,
						CategoryMasterModal(category),
						atoken
					);
					PullCompanyDetailList();
					setLoading(false);
					dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
					dispatch({
						type: actionTypes.SET_MSGALERTDATA,
						value: res?.data?.message,
					});
					dispatch({ type: actionTypes.SET_MSGALERT, value: true });
					clearCompanyDetails();
					toast.success("Data updated successfully!", {
						toastId: "atleastupdated",
					});

					companyCloseDrawer();
					return true;
				} else {
					setLoading(false);
				}
			});
		} else {
			registervendor(data, contactID, stagelist, cookies).then((res) => {
				setSelectedCompanyId(res?.id);
				setLoading(false);
				dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
				dispatch({
					type: actionTypes.SET_MSGALERTDATA,
					value: res?.data?.message,
				});
				dispatch({ type: actionTypes.SET_MSGALERT, value: true });

				PullCompanyDetailList();
				clearCompanyDetails();
				toast.success("Data added successfully!", {
					toastId: "atleastsuccessfully",
				});
				companyCloseDrawer();
				//navigate('/manage/manage-participants');
				return true;
			});
		}
	};

	const validationSchema_tab2 = yup.object({
		tradeName: yup.string().required("Please enter trade name"),
		companyName: yup.string().required("Please Enter supplier Name"),
		country: yup.object().required("Country is required"),
		state: yup.object().nullable(),
		taxId: yup.string().when("taxIdType", {
			is: (taxIdType) => taxIdType != null && taxIdType.taxType != "UNRG",
			then: (schema) => schema.required("TaxId is required"),
			otherwise: (schema) => schema.notRequired(),
		}),
		DialingCode: yup.object().nullable().required("Dialing Code is required"),
		phoneNumber: yup
			.string()
			.required("Company Phone is required")
			.matches(/^\d+$/, "Company Phone must contain only numbers")
			.test(
				"phone-length",
				"Invalid phone number length for selected country",
				function (value) {
					const { DialingCode } = this.parent;
					if (!value) return true; // skip empty
					if (!DialingCode) return value.length >= 7 && value.length <= 15; // fallback
					const code = DialingCode.dialingCode;
					switch (code) {
						case "+91": return value.length === 10;
						case "+1": return value.length === 10;
						default: return value.length >= 7 && value.length <= 15;
					}
				}
			)

	});


	//for listing down the compmany details in second page end
	//#formik
	const formik = useFormik({
		validateOnChange: true,
		validateOnBlur: true,
		enableReinitialize: true,
		initialValues:
			// value == 1
			// 	? !contactID
			// 		? initialValues_register
			// 		: initialValues_tab1
			// 	: value == 2
			// 		? !contactID
			// 			? initialValues_register
			// 			: initialValues_tab2
			// 		: {},
			value == 1
				? !contactID
					? initialValues_register
					: initialValues_tab1
				: value == 2
					? !contactID
						? initialValues_register
						: initialValues_tab2
					: initialValues_tab2,
		validationSchema:
			value == 1
				? !contactID
					? validationSchema_register
					: validationSchema_tab1
				: value == 2
					? validationSchema_tab2
					: validationSchema_tab1,
		onSubmit: (values) => {
			// Prevent form submission when user is on Add Questions sub-tab (tabValue === 1)
			if (value === 2 && tabValue === 1) {

				return;
			}

			// Only allow SQE form submission from VQ Details sub-tab (tabValue === 0)
			if (value === 2 && tabValue !== 0) {

				return;
			}



			if (!contactID) {
				value != 2 ? handletab() : register_supplier(values);
			} else {
				if (value == 1) {
					registerParticipant_tab1(values);
				} else if (value == 2) {
					registerParticipant_tab2(values);
				} else if (value == 3) {
					saveRFQQuestionLibAdd(values);
				}
			}
		},
	});

	//#2 drawer related logics and state
	const [selectedcompanyId, setSelectedCompanyId] = useState(0);
	const [state, setState] = useState({
		addProductDrawer: false,
		addBankDrawer: false,
		addSapDrawer: false,
		openInvoiceApproved: false,
		qusDrawer: false,
	});
	const [stateFinancial, setStateFinancial] = useState({
		addProductDrawer: false,
		addFinanceDrawer: false,
		addSapDrawer: false,
	});
	const [loadingTax, setLoadingTax] = useState(false);
	const [istaxVerified, setIstaxVerified] = useState(false);
	const [isSupplierSaved, setIsSupplierSaved] = useState(false);
	const [originalTaxId, setOriginalTaxId] = useState(""); // Track original tax ID for comparison
	const [taxIdChanged, setTaxIdChanged] = useState(false); // Track if tax ID has been modified
	const [navigationWithoutVerification, setNavigationWithoutVerification] = useState(false); // Track navigation attempts
	const [wasSavedInDraftWithUnverifiedGST, setWasSavedInDraftWithUnverifiedGST] = useState(false); // Track if supplier was saved in Draft with unverified GST
	const handletaxVerification = async () => {
		setLoadingTax(true);

		if (!formik_companysetup.values.taxIdType) {
			toast.error("Please select taxid for verification");
			setLoadingTax(false);
			return;
		}

		// Check if Tax ID is provided
		if (!formik_companysetup.values.taxId || formik_companysetup.values.taxId.trim() === "") {
			toast.error("Please enter Tax ID before verification");
			setLoadingTax(false);
			return;
		}

		setIstaxVerified(false);
		// ✅ Also clear Formik taxVerified
		formik_companysetup.setFieldValue("taxVerified", false);

		// Ensure taxId is defined or handle it appropriately
		if (formik_companysetup.values.taxId) {
			try {
				const res = await taxVerification(formik_companysetup.values.taxId, cookies);

				if (res) {
					// ✅ CRITICAL: Set BOTH component state AND Formik value
					// This ensures verification persists across roles and reloads
					setIstaxVerified(true);
					formik_companysetup.setFieldValue("taxVerified", true);

					setTaxIdChanged(false); // Reset change tracking after successful verification
					setOriginalTaxId(formik_companysetup.values.taxId); // Update original tax ID
					setWasSavedInDraftWithUnverifiedGST(false); // Clear Draft-unverified flag after successful verification
					settaxParameter(res);
					toast.success("GST Number verified successfully");
				}

			} catch (error) {
				setLoadingTax(false);
				toast.error("GST verification failed. Please check the number and try again.");
			} finally {
				setLoadingTax(false);

			}
		} else {

			setLoadingTax(false);

		}
	};

	const cleartaxVerification = () => {
		setLoadingTax(true);
		// ✅ CRITICAL: Clear BOTH component state AND Formik value
		setIstaxVerified(false);
		formik_companysetup.setFieldValue("taxVerified", false);

		setTaxIdChanged(false);
		cleartaxParameter();
		setLoadingTax(false);
	};
	const [openModal, setOpenModal] = React.useState(false);
	const resetTaxRelatedFields = () => {
		// Clear formik values
		formik_companysetup.setFieldValue("taxId", "");
		formik_companysetup.setFieldValue("taxIdType", null);

		// Clear local states
		setIstaxVerified(false);
		setShowVerifyButton(false);
		setTaxId("");
		setOriginalTaxId("");
		setTaxIdChanged(false);
		cleartaxParameter();
	};
	const handleDuplicateDialogClose = () => {
		setOpenModal(false);

		// 🔥 THIS is the key
		resetTaxRelatedFields();
	};
	useEffect(() => {

		if (openModal === true) {
			resetTaxRelatedFields();
		}
	}, [openModal]);


	// Function to prevent navigation if GST verification is pending
	const validateGSTBeforeNavigation = (targetTab) => {
		// For suppliers saved in Draft with unverified GST, require re-verification when GST is updated
		if (wasSavedInDraftWithUnverifiedGST && taxIdChanged && !istaxVerified) {
			toast.warning("GST number has been updated. Please re-verify the GST number before proceeding to the next step.");
			setNavigationWithoutVerification(true);
			return false;
		}

		// Allow navigation in Draft mode without GST verification (for new suppliers or if GST hasn't changed)
		if (currentStage?.trim() === "Draft" && !wasSavedInDraftWithUnverifiedGST) {
			return true;
		}

		// if (isGSTVerificationRequired()) {
		// 	toast.warning("Please verify the GST number before proceeding to the next step.");
		// 	setNavigationWithoutVerification(true);
		// 	return false;
		// }
		return true;
	};
	const settaxParameter = (data) => {

		const tradeaddress = `${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress
			.buildingName ?? ""
			} ${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress
				.buildingNumber ?? ""
			} ${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress
				.streetName ?? ""
			} ${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress
				.location
			} ${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress
				.districtName
			} `;
		const zipCode = `${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress?.pincode}`;

		const stateName = `${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress?.stateName?.trim()}`;

		const stateobj = findObjByValueFromArray(
			state_list,
			stateName,
			"stateName"
		);

		const districtName = `${data.principalPlaceOfBusinessFields?.principalPlaceOfBusinessAddress?.districtName}`;

		formik_companysetup.setFieldValue(`gstnStatus`, `${data?.gstnStatus}`);
		formik_companysetup.setFieldValue(
			`eInvoiceStatus`,
			`${data?.eInvoiceStatus}`
		);
		formik_companysetup.setFieldValue(`taxpayerType`, `${data?.taxpayerType}`);
		formik_companysetup.setFieldValue(`tradeName`, `${data?.tradeName}`);
		formik_companysetup.setFieldValue(`companyName`, `${data?.tradeName}`);
		formik_companysetup.setFieldValue(`address`, `${tradeaddress}`);
		formik_companysetup.setFieldValue(`zipCode`, `${zipCode}`);
		formik_companysetup.setFieldValue(
			`taxId2`,
			extractPAN_Number(formik_companysetup.values.taxId)
		);
		formik_companysetup.setFieldValue(`state`, stateobj);

		setCState(stateobj);

		if (districtName) handlecitytaxparameter(stateobj?.id, districtName);
		else handlecitytaxparameter(stateobj?.id, null);
	};
	const cleartaxParameter = () => {
		formik_companysetup.setFieldValue(`gstnStatus`, ``);
		formik_companysetup.setFieldValue(`eInvoiceStatus`, ``);
		formik_companysetup.setFieldValue(`taxpayerType`, ``);
		formik_companysetup.setFieldValue(`taxId`, ``);
		formik_companysetup.setFieldValue(`taxId2`, ``);
		formik_companysetup.setFieldValue(`address`, ``);
		formik_companysetup.setFieldValue(`zipCode`, ``);
	};

	//to remove bank
	// const handleremovebank = (bankid) => {
	// 	removebank(selectedcompanyId, bankid, atoken);
	// };

	//to remove finance
	const handleremovefinance = (financeid) => {
		removefinance(selectedcompanyId, financeid, atoken);
	};

	const toggleDrawer = (anchor, open) => (event) => {
		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
	
		setState({ ...state, [anchor]: open });
		setStateFinancial({ ...stateFinancial, [anchor]: open });

		// ✅ CRITICAL FIX: Only clear company details when CLOSING modals in ADD mode (not EDIT mode)
		// In edit mode (contactID or supplierid exists), form data including verification status should persist
		// clearCompanyDetails() is only needed when creating new suppliers, not when editing existing ones
		if (!open && !contactID && !supplierid) {
			
			clearCompanyDetails();
		}
	};

	const callbackBank = useCallback((data) => {
		setaccountHolderName(data.accounHolderName);
		setbankName(data.bankName);
		setbankRoutingNumber(data.bankRoutingNumber);
		setbankAccountNumber(data.bankAccountNumber);
		setUploadedFileName(data.cancelledCheckFile);
		//seteditRecordData(data);
		seteditRecordDataBank(data);
		setState({ ...state, ["addBankDrawer"]: true });
		// setcusupdata(pass);
		// setModalUploadShow(true)
	}, []);

	const callbackCloseDrawer = () => {



		setState({ ...state, ["addBankDrawer"]: false });

		// ✅ CRITICAL: Restore Tax ID and verification state after modal closes
		// Check if data exists in suppliercompleteDetails (source of truth)
		if (suppliercompleteDetails?.taxId) {
		
			setTaxId(suppliercompleteDetails.taxId);
			formik_companysetup.setFieldValue("taxId", suppliercompleteDetails.taxId);
		}

		if (suppliercompleteDetails?.gstnStatus && suppliercompleteDetails.gstnStatus.trim() !== '') {
			
			setIstaxVerified(true);
			formik_companysetup.setFieldValue("taxVerified", true);
			setGstnStatus(suppliercompleteDetails.gstnStatus);
			formik_companysetup.setFieldValue("gstnStatus", suppliercompleteDetails.gstnStatus);
		} else {
			
		}

		

	};

	const companyCloseDrawer = () => {
	

		seteditRecordData(null);
		setState({ ...state, ["addProductDrawer"]: false });

		// ✅ CRITICAL FIX: Restore Tax ID and verification state after modal closes
		// Check if data exists in suppliercompleteDetails (source of truth)
		if (suppliercompleteDetails?.taxId) {
			
			setTaxId(suppliercompleteDetails.taxId);
			formik_companysetup.setFieldValue("taxId", suppliercompleteDetails.taxId);
		}

		if (suppliercompleteDetails?.gstnStatus && suppliercompleteDetails.gstnStatus.trim() !== '') {
		
			setIstaxVerified(true);
			formik_companysetup.setFieldValue("taxVerified", true);
			setGstnStatus(suppliercompleteDetails.gstnStatus);
			formik_companysetup.setFieldValue("gstnStatus", suppliercompleteDetails.gstnStatus);
		} else {
			console.log("⚠️ No GST verification to restore");
		}

		
	};

	const callbackBankopen = useCallback((vendormaster) => {
		setState({ ...state, ["addBankDrawer"]: true });
		PullBankList(vendormaster?.id);

		if (selectedcompanyId == 0) {
			setSelectedCompanyId(vendormaster?.id);
		}
		// Prefill account holder name with company name
		const currentCompanyName = suppliercompleteDetails?.companyName || formik_companysetup?.values?.companyName || companyName;
		setaccountHolderName(currentCompanyName || "");
		formikBank.resetForm();
	}, []);

	const callbackfinancial = useCallback((vendormaster) => {
		setStateFinancial({ ...stateFinancial, ["addFinanceDrawer"]: true });
		PullFinanceList(vendormaster?.id);

		if (selectedcompanyId == 0) {
			setSelectedCompanyId(vendormaster?.id);
		}
		formikFinance.resetForm();
	}, []);

	const callbackFincloseDrawer = () => {



		setStateFinancial({ ...stateFinancial, ["addFinanceDrawer"]: false });

		// ✅ CRITICAL: Restore verification state after modal closes
		// Check if gstnStatus exists in suppliercompleteDetails (source of truth)
		if (suppliercompleteDetails?.gstnStatus && suppliercompleteDetails.gstnStatus.trim() !== '') {
			setIstaxVerified(true);
			formik_companysetup.setFieldValue("taxVerified", true);

		} else {

		}


	};
	const callbackfinancialdetails = useCallback(async (data) => {
  let currencyobj;

  if (currency_list && currency_list?.length < 1) {
    const res = await apiClient.get(`/api/Currency/Find`, atoken, {
      params: {
        IsActive: true,
      },
    });

    currencyobj = findObjByValueFromArray(
      res?.result,
      data?.currency,
      "currencyNm"
    );
  } else {
    currencyobj = findObjByValueFromArray(
      currency_list,
      data?.currency,
      "currencyNm"
    );
  }

  setfinancialYear(data.financialYear);
  setturnover(data.turnover);

  setDefaultCurrency(currencyobj);
  setUploadedFileName(data.attachmentName);
  seteditRecordDataFinance(data);

  setStateFinancial({ ...stateFinancial, ["addFinanceDrawer"]: true });
}, []);

	// options
	const [inputList, setInputList] = useState([
		{ emailadditional: "", contactPerson: "", phoneNumber: "" },
	]);
	const handleInputChange = (e, index) => {
		const { name, value } = e.target;
		const list = [...inputList];
		list[index][name] = value;
		setInputList(list);
	};
	const handleInputDelete = (e, index) => {
		const { name, checked } = e.target;
		const list = [...inputList];
		list[index][name] = checked;
		setInputList(list);
	};
	const handleRemoveClick = (index) => {
		const list = [...inputList];
		list.splice(index, 1);
		setInputList(list);
	};
	const handleAddClick = () => {
		setInputList([
			...inputList,
			{ emailadditional: "", contactPerson: "", phoneNumber: "" },
		]);
	};

	const [vendorId, setvendorId] = useState(0);
	const [financialYear, setfinancialYear] = useState("");
	const [turnover, setturnover] = useState();
	const [defaultCurrency, setDefaultCurrency] = useState(null);
	const [attachmentName, setattachmentName] = useState("");
	//const [BvendorId, setBvendorId] = useState(0);
	const [bankName, setbankName] = useState("");
	const [bankRoutingNumber, setbankRoutingNumber] = useState("");
	const [bankAccountNumber, setbankAccountNumber] = useState("");
	const [bankCountryKey, setbankCountryKey] = useState("");
	const [cancelledCheckFile, setcancelledCheckFile] = useState("");
	const [currency, setcurrency] = useState("");
	const [accounHolderName, setaccountHolderName] = useState("");
	const [CompanyList, setCompanyList] = useState([]);

	const PullCompanyDetailList = async () => {
		var data = {
			contactID: contactID,
			AccessLevel: accessLevel?.list?.readed,
		};
		try {
			const res = await getvendor(data, contactID, cookies);

			if (res != "" && res != undefined) {
				const updatedState = {
					...vendorSpecificData,
					VendorMasters: res, // Change this to the new value
				};

				//setVendorSpecificData(updatedState);
				handleVendorSpecificData(updatedState);
			}
		} catch (e) {
			console.error("Error fetching data:", e);
		}
	};
	// Bank Code here

	const [bankfile, setBankFile] = useState({
		file: null,
	});

	const [financefile, setFinanceFile] = useState({
		file: null,
	});

	const handleBankfile = (event) => {
		const selectedFile = event.target.files[0];

		if (selectedFile) {
			setBankFile((prevFilters) => ({
				...prevFilters,

				file: selectedFile,
			}));
		}
	};

	const handleFinancefile = (event) => {
		const selectedFile = event.target.files[0];

		if (selectedFile) {
			setFinanceFile((prevFilters) => ({
				...prevFilters,

				file: selectedFile,
			}));
		}
	};

	const constructFilePath = (bankName, bankRoutingNumber, fileName) => {
		// Customize the construction logic based on your needs
		return `${bankName}_${bankRoutingNumber}/${fileName}`;
	};
	const downloadFileOnUpdate = (data, cookies) => {
		const { bankName, bankRoutingNumber /* other relevant data */ } = data;
		const filepath = constructFilePath(
			bankName,
			bankRoutingNumber,
			bankAccountNumber,
			cancelledCheckFile
		);
		const filename = "downloaded_file"; // Customize the downloaded file name

		// Call the download function
		downloadFilesOnAzure(filepath, filename, atoken);
	};
	const validationSchema_bank = yup.object({
		bankName: yup.string().required("please enter bank name"),
		bankRoutingNumber: yup
			.string()
			.matches(/^[A-Za-z0-9]{11}$/, "IFSC Code must be 11 characters and alphanumeric")
			.required("Please Enter IFSC Code"),
		bankAccountNumber: yup
			.string()
			.matches(/^\d{11,15}$/, "Bank account number must be between 11 and 15 digits")
			.required("Please Fill Account Number"),
		accounHolderName: yup
			.string()
			.required("Please Enter Holder name")
			.test(
				'company-name-match',
				"account holder name doesn't match company name",
				function (value) {

					const apiCompanyName =
						suppliercompleteDetails?.companyName ||
						formik_companysetup?.values?.companyName ||
						companyName;

					if (!value || !apiCompanyName) return true; // Skip if either is empty

					// Normalize both strings: trim and convert to lowercase
					const holderNameNormalized = value.trim().toLowerCase();
					const companyNameNormalized = apiCompanyName.trim().toLowerCase();

					// Check for exact match
					return holderNameNormalized === companyNameNormalized;
				}
			),

	});



	const formikBank = useFormik({
		validateOnChange: true,
		validateOnBlur: true,
		enableReinitialize: true,
		initialValues: {
			bankName: bankName,
			bankRoutingNumber: bankRoutingNumber,
			bankAccountNumber: bankAccountNumber,
			bankCountryKey: bankCountryKey,
			currency: currency,
			accounHolderName: accounHolderName,
		},
		validationSchema: validationSchema_bank,
		onSubmit: async (values) => {


			// Check if the file is attached or it's an update scenario
			if (!bankfile.file && !editRecordDataBank?.id) {
				toast.error("Please attach cancelled cheque", {
					toastId: "fileerror",
				});
				return; // Stop form submission if no file is attached
			}

			const data = {
				bankName: bankName,
				bankRoutingNumber: bankRoutingNumber,
				bankAccountNumber: bankAccountNumber,
				bankCountryKey: bankCountryKey,
				currency: currency,
				accounHolderName: accounHolderName,
			};

			setLoading(true);

			if (editRecordDataBank && editRecordDataBank?.id > 0) {
				// Update case, if there's an existing bank record
				BankDetailsUpdate(
					data,
					pageslug,
					bankfile.file,
					editRecordDataBank?.id,
					uploadedFileName,
					atoken
				).then((res) => {
					PullBankList(pageslug);
					clearbankdetails();
					setLoading(false);

					toast.success("Data updated successfully!", {
						toastId: "banksuccessfully",
					});
					seteditRecordDataBank(null);
				});
			} else {
				// Add case, if no existing record
				BankDetailsAdd(data, pageslug, bankfile.file, atoken).then((response) => {
					setLoading(false);

					if (response?.status === 200) {
						let data = {
							EventType: `bankdetails`,
							EventId: pageslug,
							CustomerId: "",
						};

						// Assuming attachmentfilters?.file is defined
						uploadFilesOnAzure(data, cookies)
							.then((uploadResponse) => {
								// Handle the response from uploadFilesOnAzure as needed
								downloadFileOnUpdate(data, cookies);
							})
							.catch((uploadError) => {
								console.error("File upload error:", uploadError);
							});
					}

					// Handle successful API response from BankDetailsAdd
					PullBankList(pageslug);
					clearbankdetails();
					seteditRecordDataBank(null);
					toast.success("Data added successfully!", {
						toastId: "recordsuccessfully",
					});
				});
			}
		},
	});
	const handleremovebank = async (bankingId) => {
		const reqdata = {
			vendorId: pageslug,
			bankingId,
		};

		try {
			const res = await removebank(reqdata.vendorId, reqdata.bankingId, atoken);

			if (res) {
				PullBankList(pageslug);
				toast.success("Bank removed successfully");
			}
		} catch (err) {
	
			toast.error("Failed to remove bank");
		}
	};
	const mapCustomer = async (row) => {
		// row = selected bank row from DataGrid

		if (!customerid) {
			toast.error("Please select a customer", {
				toastId: "SelectCustomer",
			});
			return;
		}

		if (!row?.id) {
			toast.error("Invalid bank record", {
				toastId: "InvalidBank",
			});
			return;
		}

		const data = {
			vendorBankingId: row.id,        // bank id
			vendorId: pageslug,             // supplier/vendor id
			CustomerId: customerid,         // selected customer
			isActive: true
		};

		try {
			const res = await apiClient.post(
				`/api/managevendors/mapbank`,
				data,
				atoken
			);

			if (res) {
				toast.success("Customer mapped successfully!", {
					toastId: "CustomerMapped",
				});

				// Refresh bank list so UI updates immediately
				PullBankList(pageslug);

				// Reset customer selection

			}
		} catch (error) {
			console.error("Map customer failed:", error);
			toast.error("Failed to map customer");
		}
	};


	const handleBankChange = (e) => {
		let inputValue = e.target.value;
		inputValue = inputValue.replace(/[^A-Za-z0-9]/g, "");  // Removes non-alphanumeric characters
		if (inputValue.length > 11) {
			inputValue = inputValue.slice(0, 11);  // Restrict to 11 characters
		}
		setbankRoutingNumber(inputValue);
	};

	const handleAccountChange = (e) => {
		let inputValue = e.target.value;
		inputValue = inputValue.replace(/\D/g, "");
		if (inputValue.length > 15) {
			inputValue = inputValue.slice(0, 15);  // Max length is 15
		}
		setbankAccountNumber(inputValue);
	};

	const handleBankNameChange = (e) => {
		let inputValue = e.target.value;

		// Remove any non-alphabetic characters or spaces
		inputValue = inputValue.replace(/[^A-Za-z\s]/g, "");


		// Update state with the cleaned value
		setbankName(inputValue);
	};

	const handleHolderNameChange = (e) => {
		// Get the input value from the event
		const inputValue = e.target.value;
		const validInput = inputValue.replace(/[^A-Za-z\s]/g, "").slice(0, 100); // only allow letters and spaces, max 100 characters
		setaccountHolderName(validInput);
	};

	const clearbankdetails = () => {
		// Restore company name to account holder name instead of clearing it
		const currentCompanyName = suppliercompleteDetails?.companyName || formik_companysetup?.values?.companyName || companyName;
		setaccountHolderName(currentCompanyName || "");
		setbankName("");
		setcancelledCheckFile("");
		setbankRoutingNumber("");
		setbankAccountNumber("");
		setBankFile({ file: null });
		setUploadedFileName(null);
		fileInputRef.current.value = "";
	};

	const prefilledDocument = () => {
		//formik.setFieldValue("id", vendorSpecificData?.id);
		setContactPerson(vendorSpecificData?.contactPerson);
		setEmail(vendorSpecificData?.email);
		setIsEmailDisabled(!!vendorSpecificData?.email); // Disable email field if vendorSpecificData?.email is present
		setDialingCode(
			vendorSpecificData?.dialingCode
				? findObjByValueFromArray(
					country_list,
					vendorSpecificData?.dialingCode,
					"dialingCode"
				)
				: findObjByValueFromArray(country_list, userdialingcode, "dialingCode")
		);

		setPhoneNumber(vendorSpecificData?.phoneNumber);
		vendorSpecificData?.timeZone
			? setTimeZone(
				findObjByValueFromArray(
					timezone_list,
					vendorSpecificData?.timeZone,
					"localeName"
				)
			)
			: setTimeZone(
				findObjByValueFromArray(timezone_list, usertimezone, "localeName")
			);

		setIsactive(true);

		if (vendorSpecificData?.additionalContactDetails.length > 0) {
			setInputList(
				getemailadditionalModal(vendorSpecificData?.additionalContactDetails)
			);
		} else {
			setInputList([{ emailadditional: "", contactPerson: "", phoneNumber: "" }]);
		}
	};

	const formikFinance = useFormik({
		initialValues: {
			financialYear: editRecordData?.financialYear
				? `${editRecordData?.financialYear}`
				: financialYear,
			turnover: editRecordData?.turnover
				? `${editRecordData?.turnover}`
				: turnover,
			currency: editRecordData?.currency
				? `${editRecordData?.currency}`
				: currency,
			attachmentName: editRecordData?.attachmentName
				? `${editRecordData?.attachmentName}`
				: attachmentName,
		},
		// validationSchema: yup.object({
		//   financialYear: yup.string().required('Required'),
		//   turnover: yup.string().required('Required'),
		// }),

		onSubmit: (values) => {

			if (!financialYear) {
				toast.error("Please enter Financial Year", {
					toastId: "handleExtendSupplier_error_financialYear", // Custom toastId
					position: toast.POSITION.TOP_CENTER,
				});
				return; // Stop submission if validation fails
			}
			if (!turnover) {
				toast.error("Please enter Turnover", {
					toastId: "handleExtendSupplier_error_turnover", // Custom toastId
					position: toast.POSITION.TOP_CENTER,
				});
				return;
			}
			if (!defaultCurrency || !defaultCurrency.currencyNm) {
				toast.error("Please select the currency", {
					toastId: "currency_error",

				});
				return; // Stop submission if currency is not selected
			}
			if (!financefile?.file) {
				toast.error("Please attach a file", {
					toastId: "fileerror",
				});
				return; // Stop form submission if no file is attached
			}
			var data = {
				financialYear: financialYear,
				turnover: turnover,
				currency: defaultCurrency.currencyNm,
				attachmentName: attachmentName,
			};
			setLoading(true);
			if (editRecordDataFinance && editRecordDataFinance?.id > 0) {
				FinancialDetailsUpdate(
					data,
					pageslug,
					financefile.file,
					editRecordDataFinance?.id,
					uploadedFileName,
					atoken
				).then((res) => {
					PullFinanceList(pageslug);
					clearfinancedetails();
					setLoading(false);
					toast.success("Data updated successfully!", {
						toastId: "clearsuccessfully",
					});
					seteditRecordDataFinance(null);
					// callbackFincloseDrawer();
				});
			} else {
				FinanceDetailsAdd(
					data,
					pageslug,
					financefile.file,
					atoken
				).then((response) => {
					setLoading(false);
					// Handle successful API response
					PullFinanceList(pageslug);

					clearfinancedetails();
					toast.success("Data added successfully!", {
						toastId: "clearsuccess",
					});
					//callbackFincloseDrawer();
					return true;
				});
			}
			// Handle form submission here
		},
	});
	const handleTurnoverChange = (e) => {
		const inputValue = e.target.value
			.replace(/[^\d.]/g, "") // Remove non-numeric and non-decimal point characters
			.replace(/^(\d*\.\d*).*$/g, "$1") // Allow only one decimal point
			.slice(0, 100); // Limit input to 100 characters
		// Allow only numeric characters and limit to 100 characters
		setturnover(inputValue);
	};
	const clearfinancedetails = () => {
		setfinancialYear("");
		setturnover(0);
		setDefaultCurrency(null);
		setattachmentName("");
		setUploadedFileName(null);

		fileInputRef.current.value = "";
	};

	const [BankList, setBankList] = useState([]);
	const PullBankList = (id) => {

		FindBankDetailsAll(id, cookies).then((res) => {
			if (res != "" && res != undefined) {
				setBankList(res);
				setTotalRecords(res[0]?.totalrecords);
				setPageCount(Math.ceil(res[0]?.totalrecords / 10));
			} else {
				setBankList([]);
				setTotalRecords(0);
				setPageCount(1);
			}
			// setLoading(false);
		});
	};

	const [FinanceList, setFinanceList] = useState([]);
	const PullFinanceList = (id) => {
		FindFinancialDetailsAll(id, atoken).then((res) => {
			if (res != "" && res != undefined) {
				// ;
				setFinanceList(res);
				setTotalRecords(res[0]?.totalrecords);
				setPageCount(Math.ceil(res[0]?.totalrecords / 10));
			} else {
				setFinanceList([]);
				setTotalRecords(0);
				setPageCount(1);
			}
			// setLoading(false);
		});
	};

	//for clearing the form
	const clearfilledDocument_tab1 = () => {
		setEmail("");
		setContactPerson("");
		setTimeZone(null);
		setDialingCode(null);
		setPhoneNumber("");
		setIsactive(false);
	};

	const clearCompanyDetails = () => {
		// ✅ This function is for COMPLETE reset (after save/creating new supplier)
		// Clear ALL fields including company details and verification status
		setIstaxVerified(false);
		setCompanyName("");
		setTradeName("");
		setAddress("");
		const countryobj = findObjByValueFromArray(
			country_list,
			userdialingcode,
			"dialingCode"
		);

		if (countryobj) {
			handlefieldonCountryKey(countryobj?.id);

			setCountry(countryobj);
			handleTax(countryobj?.id, null);
			//handleStates(newvalue?.countryKey, null);
			handleStates(countryobj?.id, null);
		}
		setCState(null);
		setCity(null);
		setZipCode("");
		setTaxId("");
		setTaxIdType(null);
		setTaxId2("");
		setTaxId2Type("");
		setGstnStatus("");
		seteInvoiceStatus("");
		setTaxpayerType("");
		setDialingCode(countryobj);
		setphoneNumber("");
		setCategory([]);
		setOriginalTaxId("");
		setTaxIdChanged(false);

		setUploadedFiletax1("");
		setUploadedFiletax2("");
	};

	const clearCompanyDetailsForCountry = () => {

		const isEditMode = contactID > 0 || supplierid || pageslug;

		if (!isEditMode) {
			// In ADD mode: Clear everything
			setIstaxVerified(false);
			formik_companysetup.setFieldValue("companyName", "")
			formik_companysetup.setFieldValue("tradeName", "")
			formik_companysetup.setFieldValue("address", "")
			formik_companysetup.setFieldValue("phoneNumber", "");
			formik_companysetup.setFieldValue("vendorCategoryMappings", null);
		} else {
			// In EDIT mode: Only clear verification if GST was previously verified
			// (User is changing country, so previous country's GST verification is no longer valid)
			if (istaxVerified) {

				setIstaxVerified(false);
				toast.info("GST verification cleared due to country change. Please verify again.", {
					toastId: "gstClearedOnCountryChange"
				});
			}
			// Keep company name, trade name, address, phone, categories intact
		}

		// Always clear country-dependent fields (for both ADD and EDIT modes)
		formik_companysetup.setFieldValue("state", null)
		formik_companysetup.setFieldValue("city", null)
		formik_companysetup.setFieldValue("zipCode", '')
		formik_companysetup.setFieldValue("taxId", '')
		formik_companysetup.setFieldValue("taxIdType", null)
		formik_companysetup.setFieldValue("taxId2", '')
		formik_companysetup.setFieldValue("taxId2Type", null)
		formik_companysetup.setFieldValue("gstnStatus", "")
		formik_companysetup.setFieldValue("eInvoiceStatus", "")
		formik_companysetup.setFieldValue("taxpayerType", "")

		// Clear state variables for country-dependent fields
		setCState(null);
		setCity(null);
		setZipCode("");
		setTaxId("");
		setTaxIdType(null);
		setTaxId2("");
		setTaxId2Type(null);
		setGstnStatus("");
		seteInvoiceStatus("");
		setTaxpayerType("");
		setOriginalTaxId("");
		setTaxIdChanged(false);
	};


	const handlefieldonCountryKey = (countryKey) => {

		if (countryKey == "111") {
			setIN3(true);
		} else {
			setIN3(false);
		}
	};
	const [isExtendCom, setExtendCom] = useState(false);
	//callback edit work
	const callbackeditCom = async (data) => {
		console.log("🔵 callbackeditCom - Opening Company Modal with data:", {
			taxId: data?.taxId,
			gstnStatus: data?.gstnStatus,
			taxIdType: data?.taxIdType,
			countryKey: data?.countryKey
		});
		let taxres = [];
		let statesres = [];
		let cityres = [];
		if (data?.countryKey) {
			let taxlist = await handleTax(data?.countryKey, data);
			data?.countryKey == "111"
				? (taxres = [
					...taxlist,
					{
						id: 0,
						taxType: "UNRG",
						description: "Unregistered",
						taxType2: "PAN",
						description2: "Permanent Account Number(Unregistered)",
						countryCode: "IN",
						countryId: 111,
					},
				])
				: (taxres = taxlist);
			statesres = await handleStates(data?.countryKey, data);
		}
		if (data?.countryKey) {
			cityres = await handleCity(data?.regionKey, data);
		}

		prefilledEditCompany(data, taxres, statesres, cityres);
		setExtendCom(false);
	};

	//callbackextend
	const callbackExtendCom = async (data) => {
		let taxres = [];
		let statesres = [];
		let cityres = [];
		if (category_list.length < 1) {
			toast.error("please add category in category master");
			setLoading(false);
			return;
		}
		if (data?.countryKey) {
			let taxlist = await handleTax(data?.countryKey, data);
			data?.countryKey == "111"
				? (taxres = [
					...taxlist,
					{
						id: 0,
						taxType: "UNRG",
						description: "Unregistered",
						taxType2: "PAN",
						description2: "Permanent Account Number(Unregistered)",
						countryCode: "IN",
						countryId: 111,
					},
				])
				: (taxres = taxlist);
			statesres = await handleStates(data?.countryKey, data);
		}
		if (data?.countryKey) {
			cityres = await handleCity(data?.regionKey, data);
		}

		prefilledEditCompany(data, taxres, statesres, cityres);
		setExtendCom(true);
	};
	const [uploadedFiletax1, setUploadedFiletax1] = useState("");
	const [uploadedFiletax2, setUploadedFiletax2] = useState("");
	const prefilledEditCompany = (data, tax_list, state_list, city_list) => {
	
		data?.taxIdFile
			? setUploadedFiletax1(data?.taxIdFile)
			: setUploadedFiletax1("");
		data?.taxId2File
			? setUploadedFiletax2(data?.taxId2File)
			: setUploadedFiletax2("");
		formik_companysetup.setFieldValue('taxIdFile', data?.taxIdFile || null);
		formik_companysetup.setFieldValue('taxId2File', data?.taxId2File || null);
		setCompanyName(data.companyName);
		setTradeName(data.tradeName);
		setAddress(data.address);
		setZipCode(data.zipCode);
		setTaxId(data.taxId);
		
		setTaxId2(data.taxId2);
		//setTaxId2Type(data.taxId2Type);
		setGstnStatus(data.gstnStatus);
		data.gstnStatus ? setIstaxVerified(true) : setIstaxVerified(false);
		
		seteInvoiceStatus(data.eInvoiceStatus);
		setTaxpayerType(data.taxpayerType);
		setphoneNumber(data.phoneNumber);

		// MSME prefill logic
		if (data.msme === 'Y') {
			formik_companysetup.setFieldValue('msme', 'Y');
			formik_companysetup.setFieldValue('cinNo', data.cinNo || "");
			formik_companysetup.setFieldValue('msmeNo', data.msmeNo || "");
			formik_companysetup.setFieldValue('msmeType', data.msmeType || "");
			formik_companysetup.setFieldValue('msmeFile', data.msmeFile || null);
		} else {
			formik_companysetup.setFieldValue('msme', 'N');
			formik_companysetup.setFieldValue('cinNo', "");
			formik_companysetup.setFieldValue('msmeNo', "");
			formik_companysetup.setFieldValue('msmeType', "");
			formik_companysetup.setFieldValue('msmeFile', null);
		}

		// Set supplier as saved if we're loading existing data (has an ID)
		if (data.id || pageslug) {
			setIsSupplierSaved(true);

			// Check if this supplier was previously saved in Draft with unverified GST
			if (data.currentStage?.trim() === "Draft" &&
				data.taxIdType === 'IN3' &&
				data.taxId &&
				!data.gstnStatus) {
				setWasSavedInDraftWithUnverifiedGST(true);
			}
		}

		setCategory(data?.categories ?? []);

		handlefieldonCountryKey(data?.countryKey);

		const countryobj = findObjByValueFromArray(
			country_list,
			data?.country,
			"countryName"
		);
		setCountry(countryobj || null);

		const stateobj = findObjByValueFromArray(
			state_list,
			data?.state,
			"stateName"
		);
		setCState(stateobj || null);
		const cityobj = findObjByValueFromArray(city_list, data?.city, "cityName");
		setCity(cityobj || null);


		const taxIdTypeobj = findObjByValueFromArray(
			tax_list,
			data?.taxIdType,
			"taxType"
		);



		setTaxIdType(taxIdTypeobj || null);
		const taxIdType2obj = findObjByValueFromArray(
			tax_list,
			data?.taxIdType,
			"taxType"
		);
		setTaxId2Type(taxIdType2obj || null);
		setState({ ...state, addProductDrawer: true });
		seteditRecordData(data);
	};
	//# categorychange
	const CloseCategoryModal = () => setCategoryModal(false);
	const handleOpenCateogyModal = () => {
		setCategoryModal(true);
	};
	


	const handleChangeCategory = (event, newValue) => {
		const hasAddNew = newValue.some((option) => option.id === "new");

		if (hasAddNew) {
			// Remove the "Add New" option from the selected values
			const filteredValue = newValue.filter((option) => option.id !== "new");
			setSupplierUserCategories(filteredValue);
			setCategory(filteredValue); // keep in sync
			// Open the category modal
			handleOpenCateogyModal();
		} else {
			setSupplierUserCategories(newValue);
			setCategory(newValue); // keep in sync
		}
	};

	// const handleChangeCategory = (event, newValue) => {
	// 	const hasAddNew = newValue.some((option) => option.id === "new");

	// 	if (hasAddNew) {
	// 		// Remove the "Add New" option from the selected values
	// 		const filteredValue = newValue.filter((option) => option.id !== "new");
	// 		setSupplierUserCategories(filteredValue);
	// 		// Open the category modal
	// 		handleOpenCateogyModal();
	// 	} else {
	// 		setSupplierUserCategories(newValue);
	// 	}
	// };

	// Handler for individual contact category changes
	const handleContactCategoryChange = (event, newValue, contactIndex, setFieldValue) => {
		// Define filteredValue here so it's available for handleChangeCategory
		let filteredValue = newValue;

		const hasAddNew = newValue.some((option) => option.id === "new");

		if (hasAddNew) {
			// Remove the "Add New" option from the selected values
			filteredValue = newValue.filter((option) => option.id !== "new");
			handleOpenCateogyModal(); // Open modal for new category
		}

		// Update Formik field for this contact
		setFieldValue(`vendorPrimaryContact[${contactIndex}].categories`, filteredValue);

		// Update suppliersContact state for this contact
		setSupplierContact(prevState => ({
			...prevState,
			vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, i) =>
				i === contactIndex ? { ...contact, categories: filteredValue } : contact
			)
		}));

		// Update global categories so supplierUserCategories stays in sync
		handleChangeCategory(event, filteredValue);
	};

	// const handleContactCategoryChange = (event, newValue, contactIndex, setFieldValue) => {
	// 	const hasAddNew = newValue.some((option) => option.id === "new");

	// 	if (hasAddNew) {
	// 		// Remove the "Add New" option from the selected values
	// 		const filteredValue = newValue.filter((option) => option.id !== "new");
	// 		setFieldValue(`vendorPrimaryContact[${contactIndex}].categories`, filteredValue);

	// 		// Also update suppliersContact state
	// 		setSupplierContact(prevState => ({
	// 			...prevState,
	// 			vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, i) =>
	// 				i === contactIndex
	// 					? { ...contact, categories: filteredValue }
	// 					: contact
	// 			)
	// 		}));

	// 		// Open the category modal
	// 		handleOpenCateogyModal();
	// 	} else {
	// 		setFieldValue(`vendorPrimaryContact[${contactIndex}].categories`, newValue);

	// 		// Also update suppliersContact state
	// 		setSupplierContact(prevState => ({
	// 			...prevState,
	// 			vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, i) =>
	// 				i === contactIndex
	// 					? { ...contact, categories: newValue }
	// 					: contact
	// 			)
	// 		}));
	// 	}

	// };

	const handleChangeItemCategory = (event, newValue) => {

		// Check if 'Add New' option is selected
		if (newValue.some((option) => option.id === "new")) {
			handleOpenCateogyModal(true); // Call function to open modal
		}
		formik_SQE.setFieldValue("sqeServiceCategory", newValue);
		//setCategory(newValue);
	};
	const getTabwiseEventInfo = () => {

		if (initialEventType === "VI" || pathname.includes("invited-participants")) {
			return {
				eventtype: "VI",
				// ✅ use whichever cell actually has the value (both cases handled)
				eventId: requestVICell?.EventId || requestCell?.EventId
			};
		}

		if (value === 2) {
			return { eventtype: "VQ", eventId: requestVQCell?.EventId };
		}

		return { eventtype: "QR", eventId: requestCell?.EventId };
	};



	const { eventtype, eventId: historyEventId } = getTabwiseEventInfo();


	//#3 bank data grid - Note: columnsBank moved after formik_companysetup initialization to avoid "before initialization" error

	const getRowIdBank = (row) => {
		return row?.id;
	};
	//#3 finance data grid
	const columnsFinance = [
		{ field: "financialYear", headerName: "Financial Year", flex: 2 },
		{ field: "turnover", headerName: "Turn Over", flex: 2 },
		{ field: "currency", headerName: "Currency", flex: 2 },

		{
			field: "attachmentName",
			headerName: "Attachment",
			width: "auto",
			flex: 3,
			renderCell: (params) => {
				return (
					<Tooltip title={`${getFileName(params?.formattedValue)}`}>
						<Button
							variant="text"
							size="small"
							className="text-capitalize font-normal"
							onClick={() =>
								downloadFilesOnAzure(
									params?.formattedValue,
									getFileName(params?.formattedValue),
									atoken
								)
							}
						>
							{getFileName(params?.formattedValue)}
						</Button>
					</Tooltip>
				);
			},
		},

		{
			field: "childId",
			type: "actions",
			flex: 2,
			renderCell: (params) => {
				return (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false) ? (
					<div className="d-flex justify-content-between align-items-center">

						<MemoizedActionCellFinance
							params={params}
							callbacks={{
								callbackeditfinance: callbackfinancialdetails,
							}}
						/>
					</div>
				) : (
					<></>
				);
			},
		},
	].filter(Boolean); // Filter out any null/undefined columns

	const getRowIdFinance = (row) => {
		return row?.id;
	};

	//file attachment
	const fileInputRef = useRef(null);

	//handling masters
	const handleStates = async (countryKey, company) => {
		if (countryKey) {
			let res = await fetchStates(countryKey, atoken);

			if (res) {
				setStateList(res);
			}
			return res;
		}

	};
	const handleCity = async (stateId, company) => {
		if (stateId) {
			let res = await fetchCities(stateId, atoken);
			if (res) {
				setCityList(res);
			}

			return res;
		}
	};

	//handling city for tax parameter
	const handlecitytaxparameter = (stateId, district) => {
		fetchCities(stateId, atoken).then((res) => {
			setCityList(res);
			const cityobj = findObjByValueFromArray(
				res,
				district,
				"cityName"
			);
			formik_companysetup.setFieldValue(`city`, cityobj);
			//setCity(cityobj);
		});
	};

	const handleTax = async (countryKey, data) => {
		if (countryKey) {
			let res = await fetchTax(countryKey, atoken);
		
			
			if (res) {
				// For India: Always add Unregistered option
				if (countryKey == "111") {
					const taxListWithUnreg = [
						...res,
						{
							id: 0,
							taxType: "UNRG",
							description: "Unregistered",
							taxType2: "PAN",
							description2: "Permanent Account Number(Unregistered)",
							countryCode: "IN",
							countryId: 111,
						},
					];
					setTaxList(taxListWithUnreg);
					
					return taxListWithUnreg;
				} else {
					// For non-India countries: Always add Unregistered option along with API results
					const taxListWithUnreg = [
						...res,
						{
							id: 0,
							taxType: "UNRG",
							description: "Unregistered",
							taxType2: "",
							description2: "",
							countryCode: "",
							countryId: countryKey,
						},
					];
					setTaxList(taxListWithUnreg);
					console.log("✅ Non-India - Added Unregistered option with API results", { 
						apiResultsCount: res.length, 
						totalOptions: taxListWithUnreg.length 
					});
					return taxListWithUnreg;
				}
			}
		}
		return [];
	};


	const [suppliersContact, setSupplierContact] = useState({
		vendorPrimaryContact: [
			{
				Email: "",
				ContactPerson: "",
				TimeZone: null,
				DialingCode: null,
				PhoneNumber: "",
				isActive: true,
				isPrimary: false,
				categories: [],
			},
		],
	});

	// Initialize default timezone and dialing code from userDetail when available
	useEffect(() => {
		if (userDetail && suppliersContact.vendorPrimaryContact.length === 1 &&
			!suppliersContact.vendorPrimaryContact[0].TimeZone &&
			!suppliersContact.vendorPrimaryContact[0].DialingCode) {



			const defaultDialingCode = userDetail?.dialingCode || userDetail?.DialingCode || "+91";
			const defaultTimezone = userDetail?.timezone || userDetail?.timeZone || userDetail?.TimeZone || "Asia/Calcutta";

			const dialingCodeObj = findObjByValueFromArray(country_list, defaultDialingCode, "dialingCode");
			const timezoneObj = findObjByValueFromArray(timezone_list, defaultTimezone, "localeName");



			setSupplierContact(prevState => ({
				...prevState,
				vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, index) => {
					if (index === 0 && !contact.TimeZone && !contact.DialingCode) {
						return {
							...contact,
							TimeZone: timezoneObj || { localeName: defaultTimezone, timeZoneName: "Unknown" },
							DialingCode: dialingCodeObj || { dialingCode: defaultDialingCode, countryName: "Unknown" }
						};
					}
					return contact;
				})
			}));
		}
	}, [userDetail, country_list, timezone_list]);

	// State for managing Item/Service Categories in supplier users
	const [supplierUserCategories, setSupplierUserCategories] = useState([]);

	useEffect(() => {
		if (!pageslug && timezone_list && country_list)
			setSupplierContact({
				vendorPrimaryContact: [
					{
						Email: "",
						ContactPerson: "",
						TimeZone: findObjByValueFromArray(timezone_list, usertimezone, "localeName"),
						DialingCode: findObjByValueFromArray(country_list, userdialingcode, "dialingCode"),
						PhoneNumber: "",
						isActive: true,
						isPrimary: true,
						categories: [],
					},
				],
			})
	}, [timezone_list, country_list, userdialingcode])
	const [parentIdForVI, setParentIdForVI] = useState(0);
	const derivedEventId =
		createdInfo.initialEventType === "VI"
			? parentIdForVI
			: parseInt(pageslug);

	const derivedVendorId =
		createdInfo.initialEventType === "QR"
			? 0
			: parseInt(pageslug);

	const getEventSubject = (type) => {
		switch (type) {
			case "QR":
				return "Supplier Registration";
			case "VI":
				return "Supplier Invitation";
			case "VQ":
				return "Supplier Qualification";
			default:
				return "";
		}
	};

	const validationSchemaApprover = yup.object().shape({
		//reason: yup.string().required("reason is required"),
	});

	const [loadingprogress, setLoadingProgress] = useState(false)
	// 	const formik_ApproveReject = useFormik({
	//   enableReinitialize: true,

	//   initialValues: {
	//     customerId: parseInt(customerid),
	//     eventId: derivedEventId,
	//     eventType: createdInfo.initialEventType,
	//     stageId: stageInfo?.currentStageId,
	//     isApproved: value?.isApproved,
	//     remarks: value?.remarks,
	//     activityId: activityId,
	// //    vendorId: createdInfo.initialEventType === "QR" ? 0 : vendorIdForForm,
	//      vendorId:  0 ,
	//     recordCreatorId: createdInfo.createdById,

	// 	 eventSubject: getEventSubject(createdInfo.initialEventType),
	//   },

	//   validationSchema: validationSchemaApprover,

	//   onSubmit: async (values) => {
	//     setLoadingProgress(true);


	//     const vendorData = {
	//       customerId: parseInt(customerid),
	//       eventId: derivedEventId,
	//       eventType: createdInfo.initialEventType,
	//       stageId: stageInfo?.currentStageId,
	//       isApproved: values?.isApproved.toString() === "true",
	//       remarks: values.remarks,
	//       activityId: activityId,
	//     //   vendorId: createdInfo.initialEventType === "QR" ? 0 : vendorIdForForm,
	// 	  vendorId: 0,
	//       recordCreatorId: createdInfo.createdById,
	//        eventSubject: getEventSubject(createdInfo.initialEventType),
	//     };

	//     // SQE-specific condition
	//     if (sqe) {
	//       const stageInfo = getStageInfo(currentVQStage, vqStagelist);

	//       const data = {
	//         customerId: parseInt(customerid),
	//         eventId: parseInt(sqe),
	//         eventType: "VQ",
	//         stageId: stageInfo?.currentStageId,
	//         IsApproved: values?.isApproved.toString() === "true",
	//         activityId: parseInt(activityId),
	//         remarks: values?.remarks,
	//         vendorId:  0,
	//         eventSubject: formik_SQE?.values?.vqSubject ?? "",
	//         RecordCreatorId: suppliercompleteDetails?.createdById,
	//       };

	//       try {
	//         const res = await apiClient.postres(`/api/ApprovalAction/ApprovalAction`, data, atoken);
	//         if (res) {
	//           toast.success(`Action taken Successfully`, { toastId: "primaryinfo" });
	//           setLoadingProgress(false);
	//           navigate("/manage/manage-participants");
	//         }
	//       } catch (error) {
	//         console.error("API Error:", error.response ? error.response.data : error.message);
	//         toast.error("Error processing request");
	//       }

	//       setLoadingProgress(false);
	//       return;
	//     }

	//     // Normal flow
	//     const handleSuccess = (toastId) => {
	//       setState({ ...state, openInvoiceApproved: false });
	//       setLoadingProgress(false);
	//       fetchSupplierDetails();
	//       toast.info("Action Taken Successfully", { toastid: toastId });
	//       navigate("/manage/manage-participants");
	//     };

	//     if (pathname.includes("invited-participants")) {
	//       VendorApproveReject(vendorData, atoken).then(() => handleSuccess("primaryinfo"));
	//     } else {
	//       VendorApproveReject(vendorData, atoken).then(() => handleSuccess("primaryinvitation"));
	//     }
	//   },
	// });
	const formik_ApproveReject = useFormik({
		enableReinitialize: true,

		initialValues: {
			customerId: parseInt(customerid),
			eventId: derivedEventId,
			eventType: createdInfo.initialEventType,
			stageId: stageInfo?.currentStageId,
			isApproved: value?.isApproved,
			remarks: value?.remarks,
			activityId: activityId,
			vendorId: 0,
			recordCreatorId: createdInfo.createdById,
			eventSubject: getEventSubject(createdInfo.initialEventType),
		},

		validationSchema: validationSchemaApprover,

		onSubmit: async (values, { setSubmitting }) => {
			setLoadingProgress(true);
			setSubmitting(true);

			try {
				const vendorData = {
					customerId: parseInt(customerid),
					eventId: derivedEventId,
					eventType: createdInfo.initialEventType,
					stageId: stageInfo?.currentStageId,
					isApproved: values?.isApproved.toString() === "true",
					remarks: values.remarks,
					activityId: activityId,
					vendorId: 0,
					recordCreatorId: createdInfo.createdById,
					eventSubject: getEventSubject(createdInfo.initialEventType),
				};

				// 🔹 SQE flow
				if (sqe) {
					const stageInfo = getStageInfo(currentVQStage, vqStagelist);

					const data = {
						customerId: parseInt(customerid),
						eventId: parseInt(sqe),
						eventType: "VQ",
						stageId: stageInfo?.currentStageId,
						IsApproved: values?.isApproved.toString() === "true",
						activityId: parseInt(activityId),
						remarks: values?.remarks,
						vendorId: 0,
						eventSubject: formik_SQE?.values?.vqSubject ?? "",
						RecordCreatorId: suppliercompleteDetails?.createdById,
					};

					const res = await apiClient.postres(
						`/api/ApprovalAction/ApprovalAction`,
						data,
						atoken
					);

					if (res) {
						toast.success("Action taken Successfully", { toastId: "primaryinfo" });
						navigate("/manage/manage-participants");
					}

					return;
				}

				// 🔹 Normal flow
				if (pathname.includes("invited-participants")) {
					await VendorApproveReject(vendorData, atoken);
				} else {
					await VendorApproveReject(vendorData, atoken);
				}

				setState({ ...state, openInvoiceApproved: false });
				fetchSupplierDetails();
				toast.info("Action Taken Successfully");
				navigate("/manage/manage-participants");

			} catch (error) {
				console.error("API Error:", error.response ? error.response.data : error.message);
				toast.error("Error processing request");
			} finally {
				// ✅ MOST IMPORTANT
				setLoadingProgress(false);
				setSubmitting(false);
			}
		},
	});

	// JSX ke render function / component ke andar



	// const formik_ApproveReject = useFormik({
	// 	enableReinitialize: true,
	// 	initialValues:
	// 	{
	// 		customerId: parseInt(customerid),
	// 		//eventId: parseInt(pageslug),
	// 		eventId: createdInfo.initialEventType === "VI" ? parentIdForVI : parseInt(pageslug),
	// 		eventType: createdInfo.initialEventType,
	// 		stageId: stageInfo?.currentStageId,
	// 		isApproved: value?.isApproved,
	// 		remarks: value?.remarks,
	// 		activityId: activityId,
	// 		vendorId: createdInfo.initialEventType === "QR" ? 0 : pageslug,

	// 		recordCreatorId: createdInfo.createdById,
	// 		eventSubject: "",
	// 	},

	// 	validationSchema: validationSchemaApprover,

	// 	onSubmit: async (values) => {

	// 		setLoadingProgress(true);

	// 		;
	// 		const vendorData = {
	// 			customerId: parseInt(customerid),
	// 			//eventId: parseInt(pageslug),
	// 			eventId: createdInfo.initialEventType === "VI" ? parentIdForVI : parseInt(pageslug),
	// 			eventType: createdInfo.initialEventType,
	// 			stageId: stageInfo?.currentStageId,
	// 			isApproved: values?.isApproved.toString() == "true" ? true : false,
	// 			remarks: values.remarks, // Use values from Formik
	// 			activityId: activityId,
	// 			vendorId: createdInfo.initialEventType === "QR" ? 0 : pageSlug ?? 0,
	// 			// vendorId: pageslug,
	// 			recordCreatorId: createdInfo.createdById,
	// 			eventSubject: "",
	// 		};
	// 		if (sqe) {
	// 			const stageInfo = getStageInfo(currentVQStage, vqStagelist);

	// 			const data = {
	// 				customerId: parseInt(customerid),
	// 				eventId: parseInt(sqe),
	// 				eventType: "VQ",
	// 				stageId: stageInfo?.currentStageId,
	// 				IsApproved: values?.isApproved.toString() == "true" ? true : false,
	// 				activityId: parseInt(activityId),
	// 				remarks: values?.remarks,
	// 				vendorId: pageSlug ?? 0,
	// 				eventSubject: formik_SQE?.values?.vqSubject ?? "",
	// 				RecordCreatorId: suppliercompleteDetails?.createdById,

	// 			}
	// 			try {

	// 				const res = await apiClient.postres(
	// 					`/api/ApprovalAction/ApprovalAction`,
	// 					data,
	// 					atoken
	// 				);
	// 				if (res) {
	// 					toast.success(`Action taken Successfully`, {
	// 						toastId: "primaryinfo",
	// 					});
	// 					setLoadingProgress(false);
	// 					navigate("/manage/manage-participants");
	// 				}
	// 			} catch (error) {
	// 				console.error(
	// 					"API Error:",
	// 					error.response ? error.response.data : error.message

	// 				);
	// 				toast.error("Error processing request");
	// 			}
	// 			setLoadingProgress(false);
	// 			return;
	// 		}

	// 		if (pathname.includes("invited-participants")) {
	// 			VendorApproveReject(vendorData, atoken).then(
	// 				(res) => {
	// 					setState({ ...state, openInvoiceApproved: false });
	// 					setLoadingProgress(false);
	// 					fetchSupplierDetails();
	// 					toast.info("Action Taken Successfully", { toastid: "primaryinfo" })
	// 					navigate("/manage/manage-participants");
	// 				}
	// 			);
	// 		} else {
	// 			VendorApproveReject(vendorData, atoken).then(
	// 				(res) => {
	// 					setState({ ...state, openInvoiceApproved: false });
	// 					setLoadingProgress(false);
	// 					fetchSupplierDetails();
	// 					toast.info("Action Taken Successfully", { toastid: "primaryinvitation" })
	// 					navigate("/manage/manage-participants");
	// 				}
	// 			);
	// 		}
	// 	},
	// });

	//## company setup handling
	// ✅ CORRECTED: Yup validation now only handles field-level requirements
	// GST verification logic moved to API level (registerSupplier function)
	const validationSchemaCompanySetup = yup.object().shape({
		country: yup.object().nullable().required("Country is required"),
		state: yup.object().nullable(),
		companyName: yup.string().required("Company Name is required"),
		// tradeName: yup.string().required("Trade Name is required"),
		// address: yup.string().required("Address is required"),
		zipCode: yup.string().nullable(),
		// taxIdType: yup
		// .object()
		// .nullable()
		// .required("Tax Type is required"),
		taxIdType: yup
			.mixed()
			.nullable()
			.transform((value) => {

				if (typeof value === "string") return null;
				return value;
			})
			.required("Tax Type is required"),


		// ✅ Make DialingCode and phoneNumber non-mandatory in Approval Pending stage
		// DialingCode: currentStage === "Approval Pending" 
		// 	? yup.object().nullable()
		// 	: yup.object().nullable().required("Dialing Code is required"),
		// phoneNumber: currentStage === "Approval Pending"
		// 	? yup.string()
		// 	: yup.string()
		// 		.required("Company Phone is required")
		// 		.matches(/^\d+$/, "Company Phone must contain only numbers")
		// 		.min(7, "Company Phone must be at least 7 digits")
		// 		.max(15, "Company Phone cannot exceed 15 digits"),

		// ✅ Tax ID validation: Only checks if field is required, NOT verification status
		// This allows form to submit - GST verification is checked in registerSupplier()
		taxId: yup.string().when(["taxIdType", "country"], {
			is: (taxIdType, country) => {
				// Only mandatory for GST (IN3) in India
				const isIndia = country?.countryKey === 'IN';
				const isGST = taxIdType != null && taxIdType.taxType === "IN3";
				return isIndia && isGST;
			},
			then: (schema) => schema.required("Tax ID is required"),
			otherwise: (schema) => schema.notRequired(),
		}),
		// ❌ REMOVED: .test() for GST verification - this was blocking resubmission
		// GST verification is now handled in registerSupplier() function only

		// ✅ MSME fields validation - Allow null/empty in Approval Pending stage
		// msme: currentStage === "Approval Pending"
		// 	? yup.string().nullable().notRequired()
		// 	: yup.string().oneOf(['Y', 'N'], 'MSME must be Y or N').nullable().notRequired(),

		// cinNo: yup.string().when('msme', {
		// 	is: (msme) => msme === 'Y' && currentStage !== "Approval Pending",
		// 	then: (schema) => schema.required('CIN Number is required for MSME'),
		// 	otherwise: (schema) => schema.notRequired()
		// }),

		// msmeNo: yup.string().when('msme', {
		// 	is: (msme) => msme === 'Y' && currentStage !== "Approval Pending",
		// 	then: (schema) => schema.required('Udyam (MSME) Number is required'),
		// 	otherwise: (schema) => schema.notRequired()
		// }),

		// msmeType: yup.string().when('msme', {
		// 	is: (msme) => msme === 'Y' && currentStage !== "Approval Pending",
		// 	then: (schema) => schema.required('MSME Class is required'),
		// 	otherwise: (schema) => schema.notRequired()
		// }),

		// msmeFile: yup.mixed().when('msme', {
		// 	is: (msme) => msme === 'Y' && currentStage !== "Approval Pending",
		// 	then: (schema) => schema.required('MSME Attachment is required'),
		// 	otherwise: (schema) => schema.notRequired()
		// }),
	});


	const initialValuesCompanySetup = {
		country: null,
		taxIdType: null,
		taxId: "",
		taxId2Type: null,
		taxId2: "",
		gstnStatus: "",
		// ✅ CRITICAL: Add taxVerified to Formik values to persist verification status across roles/reloads
		// This boolean tracks whether the taxId has been verified via GST API
		// - Persists in Formik form state (not lost on role switch or page reload with enableReinitialize)
		// - Synced with component state istaxVerified for UI logic
		// - Initialized from gstnStatus in prefilledSupplierData function
		taxVerified: false,
		eInvoiceStatus: "",
		taxpayerType: "",
		companyName: "",
		tradeName: "",
		state: null,
		city: null,
		address: "",
		zipCode: "",
		DialingCode: null,
		phoneNumber: "",
		vendorCategoryMappings: null,
		timezoneId: null,
		// MSME-related fields
		msme: "N", // Default to 'N' (No)
		cinNo: "",
		msmeNo: "",
		msmeType: "", // MSME class
		msmeFile: null, // MSME attachment (file object or URL)
		taxIdFile: null, // Tax ID 1 attachment (file object or URL)
		taxId2File: null, // Tax ID 2 attachment (file object or URL)
		// Email: '',
		// ContactPerson: '',
		// TimeZone: null,
		// primaryDialingCode:'',
		// primaryPhoneNumber:'',
		// isActive: isActive
	};
	const formik_companysetup = useFormik({
		enableReinitialize: true,
		initialValues: initialValuesCompanySetup,

		// ✅ Always use validation schema for all stages including Draft
		validationSchema: validationSchemaCompanySetup,

		onSubmit: (values) => {
			// ✅ Always call registerSupplier, GST verification handled inside
			registerSupplier();
		},
	});

	// const formik_companysetup = useFormik({
	// 	enableReinitialize: true,
	// 	initialValues: initialValuesCompanySetup,
	// 	 validationSchema: validationSchemaCompanySetup,
	// 	onSubmit: (values) => {
	// 		

	// 		registerSupplier()

	// 	},
	// });

	// 🔍 DEBUG: Track when Formik reinitializes
	useEffect(() => {

		
	}, [formik_companysetup.values]);

	// Memoized columnsBank - depends on country selection from formik_companysetup
	const columnsBank = useMemo(() => [
		{ field: "bankName", headerName: "Bank Name", flex: 2 },
		{ field: "bankAccountNumber", headerName: "Account Number", flex: 2 },
		{
			field: "bankRoutingNumber",
			headerName: (formik_companysetup?.values?.country?.countryKey === 'IN' ? 'IFSC Code' : 'SWIFT Code'),
			width: "auto",
			flex: 2,
		},
		{
			field: "cancelledCheckFile",
			headerName: "Attachment",
			width: "auto",
			flex: 3,
			renderCell: (params) => {
				return (
					<Tooltip title={`${getFileName(params?.formattedValue)}`}>
						<Button
							variant="text"
							size="small"
							className="text-capitalize font-normal"
							onClick={() =>
								downloadFilesOnAzure(
									params?.formattedValue,
									getFileName(params?.formattedValue),
									atoken
								)
							}
						>
							{getFileName(params?.formattedValue)}
						</Button>
					</Tooltip>
				);
			},
		},

		{
			field: "actions",
			headerName: "Actions",
			type: "actions",
			flex: 2,
			renderCell: (params) => {
				return (
					<div className="d-flex gap-2">
						{/* {!params.row?.isMapped && (
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => mapCustomer(params.row)}
          >
            Map Customer
          </Button>
        )} */}

						<IconButton
							size="medium"
							className="bg-white"
							title="Map Customer"
							onClick={() => mapCustomer(params.row)}
						>
							<FaChalkboardUser className="f16 text-primary" />
						</IconButton>


						{params.row?.isMapped && (
							<IconButton
								size="medium"
								className="bg-white"
								onClick={() => handleremovebank(params.row.id)}
							>
								<HiOutlineX className="f16 text-danger" />
							</IconButton>
						)}
					</div>
				);
			},
		},

		// {
		// 	field: "childId",
		// 	headerName: "",
		// 	type: "actions",
		// 	flex: 1,
		// 	renderCell: (params) => {
		// 		return params.row?.isMapped ? (
		// 			<IconButton
		// 				size="medium"
		// 				className="bg-white ml-2"
		// 				onClick={() => handleremovebank(params.row.id)}
		// 			>
		// 				<HiOutlineX className="f16 text-danger" />
		// 			</IconButton>
		// 		) : (
		// 			<></>
		// 		);
		// 	},
		// },

	].filter(Boolean), [formik_companysetup?.values?.country?.countryKey]); // Recompute when country changes

	useEffect(() => {
		if (formik_companysetup.values.taxId && !originalTaxId) {
			setOriginalTaxId(formik_companysetup.values.taxId);
			setTaxIdChanged(false);
		}
	}, [formik_companysetup.values.taxId, originalTaxId]);

	// ✅ CRITICAL: Sync component state istaxVerified from Formik values on initialization
	// This ensures verification status persists across role switches and page reloads
	// When prefilledSupplierData sets formik taxVerified, this syncs it to component state
	useEffect(() => {


		if (formik_companysetup.values.taxVerified !== undefined) {
			setIstaxVerified(formik_companysetup.values.taxVerified);

		}
	}, [formik_companysetup.values.taxVerified]);


	useEffect(() => {

		const gstnStatus = formik_companysetup.values.gstnStatus;

		console.log("🔍 useEffect - gstnStatus changed:", {
			gstnStatus: gstnStatus,
			willSetVerified: !!(gstnStatus && gstnStatus.trim() !== '')
		});

		if (gstnStatus && gstnStatus.trim() !== '') {
			
			setIstaxVerified(true);
			formik_companysetup.setFieldValue("taxVerified", true);
		} else {
			console.log("⚠️ gstnStatus is empty, not setting verified to true");
		}
	}, [formik_companysetup.values.gstnStatus]);

	// 🔍 DEBUG: Track taxId changes
	useEffect(() => {
		console.log("🔍 useEffect - formik taxId changed:", {
			formikTaxId: formik_companysetup.values.taxId,
			stateTaxId: taxId,
			istaxVerified: istaxVerified,
			gstnStatus: formik_companysetup.values.gstnStatus
		});
	}, [formik_companysetup.values.taxId]);

	useEffect(() => {
		const currentTaxType = formik_companysetup.values.taxIdType?.taxType || formik_companysetup.values.taxIdType;

		// Set isIN3 local state for consistency
		setIN3(currentTaxType === 'IN3');

		// Show verify button if tax type is IN3 and country is India
		const country = formik_companysetup.values.country;
		const isIndia = country?.countryKey === 'IN';

		setShowVerifyButton(currentTaxType === 'IN3' && isIndia);
	}, [formik_companysetup.values.taxIdType, formik_companysetup.values.country]);
	const handleTaxIdTypeChange = (newValue) => {
		const nextResolved = typeof newValue === 'string' ? newValue : newValue?.taxType;

		// Auto-update verify button
		const country = formik_companysetup.values.country;
		const isIndia = country?.countryKey === 'IN';
		setShowVerifyButton(nextResolved === 'IN3' && isIndia);
		setIN3(nextResolved === 'IN3');

		formik_companysetup.setFieldValue('taxIdType', newValue);
	};






	// Maintain verification status during tab navigation
	// 🚀 Helper function to resolve tax type from both string and object formats
	const resolveTaxType = (taxIdTypeValue) => {
		return typeof taxIdTypeValue === 'string' ? taxIdTypeValue : taxIdTypeValue?.taxType;
	};

	// FIXED: Function to check if GST verification is required - handles both string and object formats
	const isGSTVerificationRequired = () => {

		const taxIdTypeValue = formik_companysetup.values.taxIdType;
		const resolvedTaxType = typeof taxIdTypeValue === 'string' ? taxIdTypeValue : taxIdTypeValue?.taxType;
		const taxId = formik_companysetup.values.taxId;
		// ✅ CRITICAL: Check BOTH istaxVerified state AND gstnStatus from Formik
		// If gstnStatus has a value, it means GST was already verified
		const gstnStatus = formik_companysetup.values.gstnStatus;
		const isVerifiedFromStatus = gstnStatus && gstnStatus.trim() !== '';

		const isIN3 = resolvedTaxType === 'IN3';
		const hasTaxId = taxId && taxId.trim() !== '';
		const needsVerification = !istaxVerified && !isVerifiedFromStatus;
		const result = isIN3 && hasTaxId && needsVerification;



		return result;
	};

	// ✅ CRITICAL FIX: Check if GST is actually verified (checks BOTH state AND gstnStatus)
	// This prevents false "unverified" display during re-renders when istaxVerified is temporarily false
	const isGSTActuallyVerified = () => {
		const gstnStatus = formik_companysetup.values.gstnStatus;
		const hasGstnStatus = gstnStatus && gstnStatus.trim() !== '';
		const result = istaxVerified || hasGstnStatus;



		return result;
	};

	// ✅ REFACTORED: Tax ID error logic - only show red error after user interaction, never if already verified
	const taxIdError = (() => {
		const { taxIdType, taxId } = formik_companysetup.values;
		const isIN3 = taxIdType?.taxType === 'IN3';

		// ✅ PRIORITY CHECK: Never show error if already verified
		if (istaxVerified) {
			return false;
		}

		// Show error if field touched AND has Formik validation error
		if (formik_companysetup.touched.taxId && formik_companysetup.errors.taxId) {
			return true;
		}

		// Show error if GST verification required, not verified, user ACTUALLY interacted (not prefill), and stage is not Draft/Registered
		if (
			isIN3 &&
			taxId &&
			isGSTVerificationRequired() &&
			!istaxVerified &&
			formik_companysetup.touched.taxId && // Must be touched by user, not just prefilled
			!["Draft", "Registered"].includes(currentStage?.trim())
		) {
			return true;
		}

		return false;
	})();

	// ✅ REFACTORED: Tax ID helper text - always show verified status first, warnings only after user interaction
	const taxIdHelperText = (() => {
		const { taxIdType, taxId, taxVerified } = formik_companysetup.values;
		const isIN3 = taxIdType?.taxType === 'IN3';

		

		// ✅ HIGHEST PRIORITY: Show success if verified (check BOTH component state AND Formik field)
		// This ensures the message shows even if component state hasn't synced yet
		if ((istaxVerified || taxVerified) && isIN3 && taxId) {
		
			return "✅ GST number verified successfully";
		}

		// Priority 2: Show Formik validation error if field touched
		if (formik_companysetup.touched.taxId && formik_companysetup.errors.taxId) {
			
			return formik_companysetup.errors.taxId;
		}

		// Priority 3: Show warning only if NOT verified, user has touched field, and not in Draft/Registered
		if (isIN3 && taxId && !istaxVerified) {
			// Only show warning if user has interacted (touched) and not in safe stages
			if (
				formik_companysetup.touched.taxId &&
				isGSTVerificationRequired() &&
				!["Draft", "Registered"].includes(currentStage?.trim())
			) {
				
				return "⚠️ GST number verification is required before proceeding";
			}
		}

		
		return ""; // No helper text
	})();

	useEffect(() => {
		// If we have a GST status from formik and it indicates verification, maintain the status
		if (formik_companysetup.values.gstnStatus &&
			formik_companysetup.values.gstnStatus.trim() !== '' &&
			formik_companysetup.values.taxIdType?.taxType === 'IN3') {
			setIstaxVerified(true);
		}
	}, [formik_companysetup.values.gstnStatus, formik_companysetup.values.taxIdType]);
	//formik for primary contact
	const initalvaluepriarycontact = {
		vendorPrimaryContact: suppliersContact?.vendorPrimaryContact || [
			{
				Email: "",
				ContactPerson: "",
				TimeZone: "",
				DialingCode: null,
				PhoneNumber: "",
				isActive: true,
				isPrimary: false,
				categories: [],
			},
		],
	};
	const validationSchemaprimarycontact = yup.object({
		vendorPrimaryContact: yup.array().of(
			yup.object({
				Email: yup
					.string()
					.required("Email is required")
					.matches(
						/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
						"Enter a valid email"
					),

				//   ContactPerson: yup
				//     .string()
				//     .required("Contact Person is required"),

				//   DialingCode: yup
				//     .object()
				//     .nullable()
				//     .required("Dialing Code is required"),

				TimeZone: yup
					.object()
					.nullable()
					.required("Time Zone is required"),

				//   PhoneNumber: yup
				//     .string()
				//     .required("Contact Number is required")
				//     .matches(/^\d+$/, "Contact Number must contain only numbers")
				//     .test(
				//       "phone-length-by-dialing-code",
				//       function (value) {
				//          // 👈  will hit here

				//         const { DialingCode } = this.parent;
				//         if (!value || !DialingCode?.dialingCode) return true;

				//         const length = value.length;
				//         const code = DialingCode.dialingCode;

				//         if (code === "+91" && length !== 10) {
				//           return this.createError({
				//             message: "Indian mobile number must be exactly 10 digits",
				//           });
				//         }

				//         if (code === "+1" && length !== 10) {
				//           return this.createError({
				//             message: "US/Canada number must be exactly 10 digits",
				//           });
				//         }

				//         if (length < 7 || length > 15) {
				//           return this.createError({
				//             message: "Contact Number must be between 7 and 15 digits",
				//           });
				//         }

				//         return true;
				//       }
				//     ),

				categories: yup
					.array()
					.min(1, "Please select at least one Item/Service Category")
					.required("Item/Service Category is required"),
			})
		),
	});


	const handleInputChangePrimary = (e, index, setFieldValue) => {
		const { name, value } = e.target;

		// Update Formik values
		setFieldValue(`vendorPrimaryContact.${index}.${name}`, value);

		// Also update the suppliersContact state to keep UI in sync
		setSupplierContact(prevState => ({
			...prevState,
			vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, i) =>
				i === index
					? { ...contact, [name]: value }
					: contact
			)
		}));


	};


	// Custom function to handle Autocomplete changes
	const handleAutocompleteChange = (value, field, index, setFieldValue) => {


		// Update Formik values with the object (for form display)
		const fieldPath = `vendorPrimaryContact.${index}.${field}`;
		setFieldValue(fieldPath, value || null);

		// Also update the suppliersContact state to keep UI in sync
		// Keep object values in state for proper form display
		setSupplierContact(prevState => {
			const updatedState = {
				...prevState,
				vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, i) =>
					i === index
						? { ...contact, [field]: value || null }
						: contact
				)
			};


			return updatedState;
		});

		// CRITICAL: Also update the formikPrimaryContactRef to ensure the form has the latest values
		setTimeout(() => {
			if (formikPrimaryContactRef.current) {
				// Get current form values
				const currentValues = formikPrimaryContactRef.current.values;


				// Update the specific field
				formikPrimaryContactRef.current.setFieldValue(fieldPath, value || null);
				formikPrimaryContactRef.current.setFieldTouched(fieldPath, true);

				// Log the updated values
				setTimeout(() => {
					const updatedValues = formikPrimaryContactRef.current.values;

				}, 100);
			}
		}, 100);
	};

	// Helper function to add new contact that updates both Formik and suppliersContact state
	const handleAddContact = (push) => {


		// Use userDetail timezone and dialing code as defaults
		const defaultDialingCode = userDetail?.dialingCode || userDetail?.DialingCode || "+91";
		const defaultTimezone = userDetail?.timezone || userDetail?.timeZone || userDetail?.TimeZone || "Asia/Calcutta";



		const dialingCodeObj = findObjByValueFromArray(country_list, defaultDialingCode, "dialingCode");
		const timezoneObj = findObjByValueFromArray(timezone_list, defaultTimezone, "localeName");



		const newContact = {
			Email: "",
			ContactPerson: "",
			DialingCode: dialingCodeObj || { dialingCode: defaultDialingCode, countryName: "Unknown" },
			phoneNumber: "",
			TimeZone: timezoneObj || { localeName: defaultTimezone, timeZoneName: "Unknown" },
			isActive: true,
			isPrimary: false,
			categories: [],
		};

		// Contact for suppliersContact state (with string values for API)
		const newContactForState = {
			Email: "",
			ContactPerson: "",
			DialingCode: dialingCodeObj?.dialingCode || defaultDialingCode,
			phoneNumber: "",
			TimeZone: timezoneObj?.localeName || defaultTimezone,
			isActive: true,
			isPrimary: false,
			categories: [],
		};



		// Add to Formik
		push(newContact);

		// Also add to suppliersContact state with string values
		setSupplierContact(prevState => ({
			...prevState,
			vendorPrimaryContact: [...prevState.vendorPrimaryContact, newContactForState]
		}));
	};

	// Helper function to remove contact that updates both Formik and suppliersContact state
	const handleRemoveContact = (remove, index) => {
		// Remove from Formik
		remove(index);

		// Also remove from suppliersContact state
		setSupplierContact(prevState => ({
			...prevState,
			vendorPrimaryContact: prevState.vendorPrimaryContact.filter((_, i) => i !== index)
		}));
	};

	//company setup api function

	const checkApprovers = () => {

		//to check if workflow is required for particular stage

		const isStageRequired = stagelist?.filter((x) => x.required && x.wfname)

		for (const stage of isStageRequired) {

			const matchingWorkflow = approverInWorkflow.find(workflow => workflow.stage === stage.wfname);
			if (matchingWorkflow && matchingWorkflow.approvers.length == 0) {
				toast.error(`Error: The Required stage workflow "${stage.wfname}" has no approvers.`);
				return false
			}

		}

		return true
	};
	const registerSupplier = async () => {
		setProgress(true);

		// Check if GST is actually verified by checking BOTH state and formik gstnStatus
		const hasGSTVerification = istaxVerified || (formik_companysetup.values.gstnStatus && formik_companysetup.values.gstnStatus.trim() !== '');

		console.log("🔍 registerSupplier - Checking GST verification:", {
			currentStage: currentStage?.trim(),
			taxIdType: formik_companysetup.values.taxIdType?.taxType,
			taxId: formik_companysetup.values.taxId,
			istaxVerified: istaxVerified,
			gstnStatus: formik_companysetup.values.gstnStatus,
			hasGSTVerification: hasGSTVerification,
			taxIdState: taxId
		});

		// Relaxed GST check: only block if stage is NOT Draft, Under Approval, or Registered
		// Check BOTH istaxVerified state AND gstnStatus in formik
		if (
			!["Draft", "Approval Pending"].includes(currentStage?.trim()) &&
			formik_companysetup.values.taxIdType?.taxType === 'IN3' &&
			formik_companysetup.values.taxId &&
			!hasGSTVerification
		) {
			
			toast.error("Please verify the GST number before saving the supplier.");
			setProgress(false);
			return;
		}

		// Validate Tax Id Attachment is mandatory when tax type is selected and not Unregistered
		const resolvedTaxTypeForValidation = typeof formik_companysetup.values.taxIdType === 'string'
			? formik_companysetup.values.taxIdType
			: formik_companysetup.values.taxIdType?.taxType;
		if (
			resolvedTaxTypeForValidation !== "UNRG" &&
			formik_companysetup.values.taxIdType?.taxType &&
			!formik_companysetup.values.taxIdFile
		) {
			toast.error("Tax Id Attachment is required. Please upload the Tax Id file.");
			setProgress(false);
			return;
		}
		

	// Handle Tax ID 1 file upload if it's a file object
	let taxIdFileUrl = formik_companysetup.values?.taxIdFile;
	if (taxIdFileUrl && typeof taxIdFileUrl === 'object' && taxIdFileUrl.name) {
		const fileData = {
			RequestedBy: "Customer",
			EventType: "taxIdFile",
			CustomerId: customerid,
			Description: "Tax ID File",
		};
		const uploadedFileUrl = await uploadFilesOnAzure(fileData, taxIdFileUrl, atoken);
		if (uploadedFileUrl) {
			taxIdFileUrl = uploadedFileUrl;
		} else {
			taxIdFileUrl = null;
		}
	}

	// Handle Tax ID 2 file upload if it's a file object
	let taxId2FileUrl = formik_companysetup.values?.taxId2File;
	if (taxId2FileUrl && typeof taxId2FileUrl === 'object' && taxId2FileUrl.name) {
		const fileData = {
			RequestedBy: "Customer",
			EventType: "taxId2File",
			CustomerId: customerid,
			Description: "Tax ID 2 File",
		};
		const uploadedFileUrl = await uploadFilesOnAzure(fileData, taxId2FileUrl, atoken);
		if (uploadedFileUrl) {
			taxId2FileUrl = uploadedFileUrl;
		} else {
			taxId2FileUrl = null;
		}
	}

	// Handle MSME file upload if it's a file object
	let msmeFileUrl = formik_companysetup.values?.msmeFile;
	if (msmeFileUrl && typeof msmeFileUrl === 'object' && msmeFileUrl.name) {
		// It's a file object, upload it to Azure
		const fileData = {
			RequestedBy: "Customer",
			EventType: "msmeFile",
			CustomerId: customerid,
			Description: "MSME File",
		};
		const uploadedFileUrl = await uploadFilesOnAzure(fileData, msmeFileUrl, atoken);
		if (uploadedFileUrl) {
			msmeFileUrl = uploadedFileUrl;
		} else {
			msmeFileUrl = null;
		}
	}

	const data = {
		customerId: customerid,
		companyName: formik_companysetup?.values.companyName ?? formik_companysetup?.values?.tradeName,
		tradeName: formik_companysetup?.values.tradeName,
		address: formik_companysetup?.values?.address,
		country: formik_companysetup?.values?.country?.countryName,
		countryKey: formik_companysetup?.values?.country?.id?.toString(),
		state: formik_companysetup.values?.state?.stateName,
		regionKey: formik_companysetup?.values?.state?.regionKey?.toString() ?? "",
		city: formik_companysetup.values?.city?.cityName ?? "",
		zipCode: formik_companysetup.values.zipCode,
		dialingCode: formik_companysetup.values?.DialingCode?.dialingCode,
		phoneNumber: formik_companysetup.values.phoneNumber,
		taxId: formik_companysetup.values.taxId,
		taxIdType: formik_companysetup.values?.taxIdType?.taxType,
		taxIdFile: taxIdFileUrl,
		taxId2: formik_companysetup.values.taxId2,
		taxId2Type: formik_companysetup.values?.taxId2Type?.taxType ?? "",
		taxId2File: taxId2FileUrl,
		gstnStatus: formik_companysetup.values?.gstnStatus ?? "",
		eInvoiceStatus: formik_companysetup.values?.eInvoiceStatus ?? "",
		taxpayerType: formik_companysetup.values?.taxpayerType ?? "",
		msme: formik_companysetup.values?.msme ?? "N",
		cinNo: formik_companysetup.values?.cinNo ?? "",
		msmeNo: formik_companysetup.values?.msmeNo ?? "",
		msmeType: formik_companysetup.values?.msmeType ?? "",
		msmeFile: msmeFileUrl,
		isActive: true,
		vendorCategoryMappings: formik_companysetup.values?.vendorCategoryMappings ? CategoryRegisterMasterModal(formik_companysetup.values.vendorCategoryMappings) : [],
	};

	const updateddata = {
		customerId: customerid,
		companyName: formik_companysetup.values?.companyName ?? formik_companysetup?.values?.tradeName,
		tradeName: formik_companysetup.values?.tradeName,
		address: formik_companysetup?.values?.address,
		country: formik_companysetup?.values?.country?.countryName,
		countryKey: formik_companysetup?.values?.country?.id?.toString(),
		state: formik_companysetup.values?.state?.stateName,
		regionKey: formik_companysetup?.values?.state?.regionKey?.toString() ?? "",
		city: formik_companysetup.values?.city?.cityName ?? "",
		zipCode: formik_companysetup.values.zipCode,
		dialingCode: formik_companysetup.values?.DialingCode?.dialingCode,
		phoneNumber: formik_companysetup.values.phoneNumber,
		taxId: formik_companysetup.values.taxId,
		taxIdType: formik_companysetup.values?.taxIdType?.taxType,
		taxIdFile: taxIdFileUrl,
		taxId2: formik_companysetup.values.taxId2,
		taxId2Type: formik_companysetup.values?.taxId2Type?.taxType ?? "",
		taxId2File: taxId2FileUrl,
		gstnStatus: formik_companysetup.values?.gstnStatus ?? "",
		eInvoiceStatus: formik_companysetup.values?.eInvoiceStatus ?? "",
		taxpayerType: formik_companysetup.values?.taxpayerType ?? "",
		msme: formik_companysetup.values?.msme ?? "N",
		cinNo: formik_companysetup.values?.cinNo ?? "",
		msmeNo: formik_companysetup.values?.msmeNo ?? "",
		msmeType: formik_companysetup.values?.msmeType ?? "",
		msmeFile: msmeFileUrl,
		isActive: true,
		vendorCategoryMappings: formik_companysetup.values?.vendorCategoryMappings ? CategoryMasterModal(formik_companysetup.values.vendorCategoryMappings.filter(x => x.createdById)) : [],
	};


	//including stage
	const payload = getPayloadWithStage(
		"currentStage",
		currentStage,
		stagelist,
		data,
		"currentStage"
	);

	if (!pageslug) {
		const res = await apiClient.post(
			`/api/managevendors/registerSupplier`,
			payload,
			atoken
		);

		if (res) {
			toast.success(`Supplier details added successfully`, { toastid: "supplieradded" });
			setValue(1);
			setpageslug(res?.id);
			setIsSupplierSaved(true); // Set supplier as saved to disable Tax ID 

			// Track if supplier was saved in Draft mode
			if (currentStage?.trim() === "Draft" &&
				formik_companysetup.values?.taxIdType?.taxType === 'IN3' &&
				formik_companysetup.values.taxId &&
				!istaxVerified) {
				setWasSavedInDraftWithUnverifiedGST(true);
			}

			fetchSupplierDetails();
		}


	} else {
		let payloadupdate
		payloadupdate = updateddata

		const res = await apiClient.putres(
			`/api/managevendors/${pageslug}/updatevendor`,
			payloadupdate,
			atoken
		);

		if (res) {
			toast.success(`Supplier details updated successfully`, { toastid: "supplierdetailsss" });
			setValue(1);
			setIsSupplierSaved(true); // Set supplier as saved to disable Tax ID editing

			// Track if supplier was saved in Draft mode with unverified GST
			if (currentStage?.trim() === "Draft" &&
				formik_companysetup.values?.taxIdType?.taxType === 'IN3' &&
				formik_companysetup.values.taxId &&
				!istaxVerified) {
				setWasSavedInDraftWithUnverifiedGST(true);
			}
		}
		fetchSupplierDetails();
	}
	setProgress(false);
};

	const registerSupplierUsers = async (values) => {
		// Check permissions first
		if (!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.CREATE) ?? false)) {
			toast.error("You don't have permission to save supplier users.", {
				toastid: "permission_error"
			});
			return;
		}

		setProgress(true)
		const primaryContacts = formikPrimaryContactRef?.current.values?.vendorPrimaryContact.filter(contact => contact.isPrimary);
		if (primaryContacts.length > 1) {
			toast.error("Error: More than one primary contact found.", {
				toastid: "primarycontecterror"
			})
			setProgress(false)
			return "Error: More than one primary contact found.";
		}

		const isApprovers = checkApprovers();
		if (!isApprovers) {
			setProgress(false)
			return;
		}

		// Include vendor categories in the vendorPrimaryContact payload
		// Note: Each contact now has its own categories, so we don't need global categories



		const transformedContacts = vendorPrimaryContactModal(values.vendorPrimaryContact);


		const data = {
			vendorPrimaryContact: transformedContacts,
			stages: {
				eventType: "string",
				currentStage: currentStage || "string",
				nextStage: "string",
				orgId: 0,
				orgGroupId: 0
			}
		}



		let payload;
		// if(currentStage=="Draft"){
		payload = getPayloadWithStage(
			"currentStage",
			currentStage,
			stagelist,
			data,
			"currentStage"
		);

		// }
		//  else{
		//payload =data
		//  }


		const res = await apiClient.postres(`/api/managevendors/${pageslug}/register`, payload, atoken)
		if (res) {
			toast.success("Users Detail saved successfully", {
				toastid: "primarycontecterror"
			})
			fetchSupplierDetails();
			navigate('/manage/manage-participants')
		}
		setProgress(false)
	}

	//modal handling
	const [CategoryModal, setCategoryModal] = useState(false);

	const [isExternal, setIsExternal] = React.useState(false);
	const [isExternalID, setIsExternalID] = React.useState(null);

	const handleClickOpenModal = () => {
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setIsExternalID(null);
	};
	// const [questionmodal, setQuestionModal] = useState(false);

	// const CloseQuestionModal = () => setQuestionModal(false);
	// const OpenQuestionModal = () => setQuestionModal(true);

	//vq started here
	const [currentVQStage, setCurrentVQStage] = useState(`Draft`);
	const [vqStagelist, setVQStageList] = useState(null);
	const [selectedVendors, setSelectedVendors] = useState([]); // State to store selected items
	const [dataSQE, setDataSQE] = useState([]); // State to store data
	const [expanded, setExpanded] = useState(false);
	const [subcategoryexpanded, setSubcategoryExpand] = useState(false);
	const currentTaxType = formik_companysetup.values.taxIdType?.taxType || formik_companysetup.values.taxIdType; const isIN3TaxType = currentTaxType === 'IN3';
	useEffect(() => {

		setShowVerifyButton(currentTaxType === 'IN3');
	},
		[currentTaxType, formik_companysetup.values.country]);
	//stage for vq
	useEffect(() => {

		if (value == "2")
			StageFindAll(
				{
					EventType: "VQ",
					CustomerId: customerid,
					EventId: sqe ?? 0,
					OrgId: 0,
					OrgGroupId: 0,
				},
				atoken
			).then((res) => {
				setVQStageList(res);
			});
	}, [value, sqe]);

	const [isCallbackTriggered, setIsCallbackTriggered] = useState(false);
	const handleSQEDatashow = (data, sqeid, sqeparam) => {


		if (sqeparam) {
			setSelectedRow(sqeparam);
			setSqe(sqeparam);
			setIsEditing(true);
		}

		if (data?.sqeHeaderDetails?.length > 0) {
			// Set core SQE details
			setCurrentVQStage(data?.stage);
			setScores(data?.scores ?? 0);
			setSqeHeaderId(data?.id); // This is likely the VQ Header ID

			// Extract libraryId from first question (assumed same for all)
			const libid = data?.sqeHeaderDetails[0]?.libraryId;
			const libObj = findObjByValueFromArray(AllLibraryList, libid, "id");



			// Transform and set selected questions properly
			if (data.sqeHeaderDetails && Array.isArray(data.sqeHeaderDetails)) {


				const transformedQuestions = data.sqeHeaderDetails.map((question) => ({
					// Basic question info
					id: question.questionId,
					questionId: question.questionId,
					questionDescription: question.questionDescription,
					questionCategory: question.questionCategory,
					questionSubCategory: question.questionSubCategory,
					categoryId: question.categoryId,
					categorySubId: question.categorySubId,
					libraryId: question.libraryId,

					// Question properties
					optionType: question.optionType,
					weightage: question.weightage,
					mandatory: question.mandatory,
					attachement: question.attachement,
					attachedFileName: question.attachedFileName,
					questionRequirement: question.questionRequirement,

					// VQ specific fields
					vqHeaderId: question.vqHeaderId,
					vendorId: question.vendorId,
					customerId: question.customerId,

					// Answer and scoring
					answer: question.answer,
					score: question.score,
					ansAttachements: question.ansAttachements,

					// Multiple choice settings
					isMultipleChoice: question.isMultipleChoice,
					isMultiOption: question.isMultiOption,
					autoCalculated: question.autoCalculated,

					// Question options
					questionOption: question.questionOption || [],

					// Metadata
					stages: question.stages,

					// Flag to indicate this is preselected
					isPreselected: true
				}));


				setQuestionList(transformedQuestions);
				setSelectedQuesionArray(transformedQuestions);
			} else {

				setQuestionList([]);
				setSelectedQuesionArray([]);
			}

			setChooseLibList(libObj);
			pullCategoryList(libid);

			// Move to SQE tab
			setValue(2);

			// Store full data for later use
			setDataSQE(data);

			// Disable callback triggers
			setIsCallbackTriggered(true);



			setvqSubject(data?.vqSubject);
			setvqDescription(data?.vqDescription);
			setfrequency(data?.frequency);
			formik_SQE.setFieldValue("frequency", data?.frequency);
			formik_SQE.setFieldValue("vqSubject", data?.vqSubject);
			formik_SQE.setFieldValue("vqDescription", data?.vqDescription);
			formik_SQE.setFieldValue("sqeServiceCategory", data?.sqeServiceCategory);

			// Handle End Date
			const sqeEndDate = data?.vqEndDate;
			if (sqeEndDate) {
				try {
					const endDate = checkUTC(sqeEndDate);
					const parsedEndDate = dayjs(endDate).tz(userDetail?.timeZone);
					setvqEndDate(parsedEndDate);
					formik_SQE.setFieldValue("vqEndDate", parsedEndDate);
				} catch (error) {
					console.error("Error parsing date:", error);
				}
			} else {
				console.warn("No end date provided");
			}
		} else {
			// Fallback if no sqeHeaderDetails (maybe it's a draft)
			callbackSQEData(data);
			movetoSQE();
			setIsCallbackTriggered(false);
		}
	};

	// Load specific VQ data when sqeHeaderId is set (for direct navigation to VQ)
	const loadSpecificVQ = async (vendorId, vqId) => {

		try {
			const res = await apiClient.getres(`/api/SQE/${vendorId}/Find`, atoken);


			if (Array.isArray(res.data)) {
				const vqData = res.data.find(item => item.id === parseInt(vqId));

				if (vqData) {

					handleSQEDatashow(vqData, vqData.id, vqId);

					if (vqData.sqeHeaderDetails?.length > 0) {
						setQuestionList(vqData.sqeHeaderDetails);
					}
				} else {
					console.warn(`VQ with ID ${vqId} not found.`);
				}
			}
		} catch (error) {
			console.error("Error loading VQs:", error);
			toast.error("Failed to load VQ details.");
		}
	};


	// useEffect to load VQ data when sqeHeaderId changes (for direct navigation)
	useEffect(() => {
		if (pageslug && sqeHeaderId && !isCallbackTriggered) {
			loadSpecificVQ(pageslug, sqeHeaderId); // vendorId, vqId
		}
	}, [pageslug, sqeHeaderId, isCallbackTriggered]);


	const callbackSQEData = useCallback((data) => {


		//const ids = data?.map((item) => item.id);
		const ids = [data?.id]
		setSelectedVendors(ids);

		setDataSQE(data);


	}, []);



	const removeCompany = (id) => {
		if (selectedVendors.length === 1) {
			toast.error("You cannot proceed without at least one company in SQE.");
			setLoading(false);
			return;
		}
		setSelectedVendors((prevItems) => prevItems.filter((item) => item !== id));
	};

	// const removeCompany = (id) => {
	//
	// 	setSelectedVendors((prevItems) => prevItems.filter((item) => item !== id));
	// };

	// useEffect(() => {
	// 	// Expand the accordion if there is more than one selected item
	// 	setExpanded(selectedVendors.length > 0);
	// }, [selectedVendors]);

	const [selectedQuesionArray, setSelectedQuesionArray] = useState([]);
	const [allDataList, setAllDataList] = useState([]);

	const callbackQuesAddCustom = useCallback(
		(quesData, questionforedit) => {

			if (!questionforedit) {
				setSelectedQuesionArray((prev) => [...prev, quesData]);
				setState({ ...state, qusDrawer: false });
			}
			else {

				const obj = selectedQuesionArray.map((x) => {

					if (x.id == questionforedit.id) {
						return quesData
					}
					else return x
				});

				setSelectedQuesionArray(obj)
				setState({ ...state, qusDrawer: false });
				//setQuestionForEdit(null)
			}

		},
		[selectedQuesionArray]
	);
	const callbackDeleteQuesFromList = useCallback(
		(datatodelete, index) => {
			const listQuestion = [...allDataList];
			listQuestion.splice(index, 1);
			setAllDataList(listQuestion);
		},
		[allDataList]
	);

	const [isAskQuestionClicked, setIsAskQuestionClicked] = useState(false);

	const movetoSQE = () => {
		setIsAskQuestionClicked(true);
	
		setValue(2);
		setCurrentVQStage("Draft");
	};

	const movetoSQEClick = useCallback((data) => {
		const ids = data.map((item) => item.id);
		setSelectedVendors(ids);

		setDataSQE(data);



		setValue(2);
		setCurrentVQStage("Draft");
	}, []);

	//LIBRARY LIST
	const [AllLibraryList, setLibraryList] = useState([]);
	const [chooseLibList, setChooseLibList] = useState(null);
	const PullLibraryAll = async () => {
		var data = {
			CustomerId: customerid,
			LibraryType: "QuestionLibrary",
			IsActive: true,
		};
		// LibraryFindAll(data, atoken).then((res) => {

		// 	setLibraryList(res);
		// });
		const queryParams = buildQueryParams(data);
		const res = await apiclient.getres(
			`/api/LibraryOrgEntity/Find?${queryParams}`,
			atoken
		);

		if (res) {

			setLibraryList(res?.data?.result);
		}
	};
	//to handle sqe case
	useEffect(() => {

		const params = new URLSearchParams(searchParams);
		const sqeparam = params.get("sqId");
		if ((sqe || sqeparam) && suppliercompleteDetails) {
			handleSQEDatashow(suppliercompleteDetails, sqe, sqeparam);
		}
	}, [suppliercompleteDetails, AllLibraryList, sqe]);
	useEffect(() => {
		setRequestVQCell({
			EventId: sqe,
			EventType: "VQ",
			SortingColumn: "ApproverSeq",
			CustomerId: customerid
		});

	}, [sqe])

	const callbackSQEDatashow = useCallback(
		(data) => {

			const libid = data[0]?.sqeHeader[0]?.sqeHeaderDetails[0]?.libraryId;
			const obj = findObjByValueFromArray(AllLibraryList, libid, "id");
			const updatedquestion = [...data[0]?.sqeHeader];

			setSelectedQuesionArray(updatedquestion);

			setChooseLibList(obj);

			pullCategoryList(libid);
			setValue(2);
			const ids = data.map((item) => item?.id);
			setSelectedVendors(ids);

			setDataSQE(data);

			setCurrentVQStage(data[0]?.sqeHeader[0]?.stage);
			// Disable the button
			setvqSubject(data[0]?.sqeHeader[0]?.vqSubject);
			setvqDescription(data[0]?.sqeHeader[0]?.vqDescription);
			setfrequency(data[0]?.sqeHeader[0]?.frequency);
			const sqeEndDate = data[0]?.sqeHeader[0]?.vqEndDate;
			if (sqeEndDate) {
				try {
					const endDate = checkUTC(sqeEndDate);
					const parsedEndDate = dayjs(endDate).tz(userDetail?.timeZone);
					setvqEndDate(parsedEndDate);
				} catch (error) {
					console.error("Error parsing date:", error);
				}
			} else {
				console.error("No end date provided");
			}
		},
		[AllLibraryList, sqe]
	);
	const handleLibraryChange = (value) => {

		setChooseLibList(value);
		setVQCategoryList([]);
	};

	//fetching category
	const [VQCategoryList, setVQCategoryList] = useState([]);
	const [uncategorizedQuestions, setUncategorizedQuestions] = useState([]);
	const [drawerOpen, setDrawerOpen] = useState(false);
	//const [saveCategoryList, setsaveCategoryList] = useState(null);
	const pullCategoryList = async (value) => {
		var data = {
			CustomerId: customerid,
			LibraryId: value?.id ? value?.id : value,
		};
		setLoading(true);
		const queryParams = Object.entries(data)
			.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const res = await apiclient.getres(
			`/api/QCategory/Find?${queryParams}`,
			atoken
		);
		const res2 = await apiclient.getres(
			`/api/QuestionsLib/Find?${queryParams}`,
			atoken
		);
		const categories = res?.data?.result;
		const questions = res2?.data?.result;
		setAllDataList(questions);
		const result = mapQuestionsToSubcategories(categories, questions);

		if (res != "" && res != undefined) {
			setVQCategoryList(result);
		}

		// Filter out uncategorized questions and set state
		const uncategorizedQuestions = questions.filter(
			(question) => !question.questionCategory
		);
		setUncategorizedQuestions(uncategorizedQuestions);
		setLoading(false);
	};

	const apiclient = new ApiClient();
	const saveRFQQuestionLibAdd = async (values) => {

		var statusresponse = 0;
		for (const vendorelement of selectedVendors) {
			const sqeHeaderDetails = SQEAddModal(vendorelement, selectedQuesionArray);


			if (selectedQuesionArray.length > 0) {
				const data = {
					id: 0,
					vqSubject: values?.vqSubject,
					vqDescription: values?.vqDescription,
					vqEndDate: values?.vqEndDate,
					frequency: values?.frequency,
					vendorId: vendorelement,
					//sqeServiceCategory : Itemcategory,

					// 🔥 SOLUTION: Don't filter by createdById for new category selections
					sqeServiceCategory: CategorySqeMasterModal(formik_SQE.values?.sqeServiceCategory ?? [], pageslug),
					customerId: customerid,

					contactId: pageslug,
					sqeHeaderDetails: sqeHeaderDetails,
				};
				setLoading(true);

				let Data = getPayloadWithStage(
					"currentStage",
					currentVQStage,
					vqStagelist,
					data,
					"currentStage"
				);
				try {
					const res = await apiclient.postres(`/api/SQE/Add`, Data, atoken);
					const vqHeaderId = res;
					statusresponse = res.status;
					setLoading(false);
				} catch (error) {
					
					toast.error(`Error saving data: ${error.message}`);
				}
			} else {
				toast.error(`Please select library to save the data.`);
			}
		}
		if (statusresponse === 200) {
			//	toast.success(`Data Saved Successfully`);
			setValue(2);
		}
	};

	//for handling alert on back button
	const [confirmSQEDelete, setConfirmSQEDelete] = useState(false);
	const handleCloseSQEDelete = (value) => {
		if (value) {
			setConfirmSQEDelete(false);
			navigate(`/manage/manage-participants/register-participants/${pageslug}`);
		} else {
			setConfirmSQEDelete(false);
		}
	};

	const [selectedRow, setSelectedRow] = useState(null); // State to hold the selected row data

	// Static data for the DataGrid

	const [isEditing, setIsEditing] = useState(false);
	const columns = [
		{
			field: 'vqSubject',
			headerName: 'Subject',
			width: 200,
			headerClassName: 'content-text text-dark-blue',
			renderCell: (params) => (
				<div
					//onClick={() => handleRowClick(params.row)}
					title={params.value}
					className="custom-link content-text text-dark-blue pointer"
				>
					{params.value}
				</div>
			),
		},
		{
			field: 'vqDescription',
			headerName: 'Description',
			width: 400,
			headerClassName: 'content-text text-dark-blue',
			renderCell: (params) => (
				<div
					title={params.value}
					//onClick={() => handleRowClick(params.row)}
					className="custom-link content-text text-dark-blue pointer"
				>
					{params.value}
				</div>
			),
		},
		{
			field: 'vqEndDate',
			headerName: 'End Date',
			width: 150,
			headerClassName: 'content-text text-dark-blue',
			renderCell: (params) => (
				<div
					title={params.value}
					// onClick={() => handleRowClick(
					// 	params.formattedValue ? formatDateViaTime(
					// 		params.formattedValue,
					// 		"en-GB",
					// 		formattimeoption
					// 	) : ""
					// )}
					className="custom-link content-text text-dark-blue pointer"
				>
					{formatDateViaTime(
						params.value,
						"en-GB",
						formattimeoption
					)}
				</div>
			),
		},
		{
			field: 'scores',
			headerName: 'Score',
			width: 100,
			headerClassName: 'content-text text-dark-blue',
			renderCell: (params) => (
				<div
					//onClick={() => handleRowClick(params.row)}
					title={params.value}
					className="custom-link content-text text-dark-blue pointer"
				>
					<div className="text-primary content-text">{params.value}</div>
				</div>
			),
		},
		{
			field: 'sqeHeaderDetails',
			headerName: 'Category Type',
			width: 200,
			headerClassName: 'content-text text-dark-blue',
			renderCell: (params) => {
				// Add defensive check for sqeHeaderDetails
				const headerDetails = params.row.sqeHeaderDetails || [];
				const categories = Array.from(new Set(
					headerDetails
						.filter(detail => detail && detail.questionCategory) // Filter out null/undefined
						.map(detail => detail.questionCategory)
				));

				return (
					<div
						//onClick={() => handleRowClick(params.row)}
						className="custom-link d-flex justify-content-between content-text text-dark-blue pointer"
						title={categories.join(', ')}
					>
						{categories.length > 0 ? (
							<div className="content-text text-dark-blue">{categories.join(', ')}</div>
						) : (
							<div className="content-text text-dark-blue">No Categories</div>
						)}
					</div>
				);
			},
		},
		// 		{
		// 			field: 'actions',
		// 			headerName: 'Action',
		// 			width: 120,
		// 			headerClassName: 'content-text text-dark-blue',
		// 			sortable: false,
		// 			filterable: false,
		// 		renderCell: (params) => {
		// 	const isVQEvent = showOnlyVQActions;
		// 	const isCorrectTab = value === 2;
		// 	const isMatchingRow = params.row?.id === parseInt(sqeHeaderId) || params.row?.id === parseInt(activityId);

		// 	const shouldShowActionButton =
		// 		(!isVQEvent) || // Non-VQ events: always show
		// 		(isVQEvent && isCorrectTab && isMatchingRow); // VQ SQID: only show on tab 2 and correct row

		// 	if (!shouldShowActionButton) {
		// 		return null;
		// 	}

		// 	return (
		// 		<div className="d-flex gap-1">
		// 			<Button
		// 				variant="contained"
		// 				size="small"
		// 				className="text-capitalize"
		// 				style={{
		// 					backgroundColor: 'var(--vz-primary-color)',
		// 					color: '#fff',
		// 					fontSize: '12px',
		// 					padding: '4px 8px'
		// 				}}
		// 				onClick={(e) => {
		// 					e.stopPropagation();
		// 					handleRowClick(params);
		// 				}}
		// 			>
		// 				Action
		// 			</Button>
		// 		</div>
		// 	);
		// }

		// 		},

		// Remove dataSQE as it's not a valid column definition
	].filter(Boolean); // Filter out any null/undefined columns
	const [scores, setScores] = useState(0);
	const handleRowClick = (params) => {


		// ✅ Permission validation
		if (!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.EDIT) ?? false)) {
			toast.error("You don't have permission to edit supplier qualification", {
				toastId: "supplierQualificationEditPermission"
			});
			return;
		}

		const rowData = params.row;

		// Ensure we have valid row data
		if (!rowData || !rowData.id) {
			
			toast.error("Invalid VQ data. Please refresh and try again.");
			return;
		}

		// ✅ Set core state - IMPORTANT: Use ID only, not the full object
		const vqId = Number(rowData.id);


		setSelectedRow(rowData);
		setSqe(vqId); // ❌ FIXED: Use ID only, not full object
		setSqeHeaderId(vqId);
		setIsEditing(true);

		// Update redux with proper eventId
		dispatch({ type: actionTypes.SET_EVENTID, value: vqId });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "VQ" });

		// ✅ Load VQ stage information
		loadVQStageInfo(vqId);

		// ✅ Load full SQE data
		loadExistingVQData(rowData);
	};

	// Function to load existing VQ data into the form for editing
	const loadExistingVQData = (vqData) => {
	

		try {
			// Validate input data
			if (!vqData || typeof vqData !== 'object') {
				
				toast.error("Invalid VQ data. Cannot load VQ details.");
				return;
			}

			// Load basic VQ info into formik
			formik_SQE.setFieldValue("vqSubject", vqData.vqSubject || "");
			formik_SQE.setFieldValue("vqDescription", vqData.vqDescription || "");
			formik_SQE.setFieldValue("frequency", vqData.frequency || 0);

			// Handle date parsing
			if (vqData.vqEndDate) {
				try {
					const endDate = checkUTC(vqData.vqEndDate);
					const parsedEndDate = dayjs(endDate).tz(userDetail?.timeZone);
					formik_SQE.setFieldValue("vqEndDate", parsedEndDate);
				} catch (dateError) {
					console.warn("Invalid date format:", vqData.vqEndDate, dateError);
				}
			}

			// Load service categories if available
			if (vqData.sqeServiceCategory && Array.isArray(vqData.sqeServiceCategory)) {
				setSqeServiceCategory(vqData.sqeServiceCategory);
				formik_SQE.setFieldValue("sqeServiceCategory", vqData.sqeServiceCategory);
			}

			// Load question data if available
			if (vqData.sqeHeaderDetails && Array.isArray(vqData.sqeHeaderDetails)) {


				// Transform sqeHeaderDetails to the format expected by EventQuestionScreen
				const transformedQuestions = vqData.sqeHeaderDetails.map((question) => {


					return {
						// Basic question info
						id: question.questionId, // Use questionId as the main identifier
						questionId: question.questionId,
						questionDescription: question.questionDescription,
						questionCategory: question.questionCategory,
						questionSubCategory: question.questionSubCategory,
						categoryId: question.categoryId,
						categorySubId: question.categorySubId,
						libraryId: question.libraryId,

						// Question properties
						optionType: question.optionType,
						weightage: question.weightage,
						mandatory: question.mandatory,
						attachement: question.attachement,
						attachedFileName: question.attachedFileName,
						questionRequirement: question.questionRequirement,

						// VQ specific fields
						vqHeaderId: question.vqHeaderId,
						vendorId: question.vendorId,
						customerId: question.customerId,

						// Answer and scoring
						answer: question.answer,
						score: question.score,
						ansAttachements: question.ansAttachements,

						// Multiple choice settings
						isMultipleChoice: question.isMultipleChoice,
						isMultiOption: question.isMultiOption,
						autoCalculated: question.autoCalculated,

						// Question options
						questionOption: question.questionOption || [],

						// Metadata
						stages: question.stages,

						// Flag to indicate this is preselected
						isPreselected: true
					};
				});



				setQuestionList(transformedQuestions);
				setSelectedQuesionArray(transformedQuestions);
			} else {

				setQuestionList([]);
				setSelectedQuesionArray([]);
			}

			// Set current stage and scores
			if (vqData.stage) {
				setCurrentVQStage(vqData.stage);
			}

			if (vqData.scores !== undefined && vqData.scores !== null) {
				setScores(vqData.scores);
			}

			// Update edit permissions based on stage
			const isReadOnly = vqData.stage === "Under Approval" || vqData.stage === "Qualified";
			setIsSaveVisible(!isReadOnly);



		} catch (error) {
			console.error("Error loading VQ data:", error);
			toast.error("Error loading VQ data");
		}
	};


	// Function to load VQ stage information
	const loadVQStageInfo = async (vqId) => {


		try {
			if (!vqId || vqId === 0) {
				console.warn("Invalid VQ ID for stage loading:", vqId);
				return;
			}

			// Load VQ stage information
			const stageResponse = await StageFindAll({
				EventType: "VQ",
				CustomerId: customerid,
				EventId: Number(vqId),
			}, atoken);

			if (stageResponse) {

				setVQStageList(stageResponse);
			}
		} catch (error) {
			console.error("Failed to load VQ stage info:", error);
			// Don't show error toast as this is not critical for basic VQ viewing
		}
	};



	const handleAddClickSupplier = () => {



		// Permission validation for creating new supplier qualification
		if (!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.CREATE) ?? false)) {
			toast.error("You don't have permission to create new supplier qualification", {
				toastId: "supplierQualificationCreatePermission"
			});
			return;
		}


		setSelectedRow(0);
		setIsEditing(true);
		setSqe(0);
		setSqeHeaderId(null);
		setCurrentVQStage("Draft");
		setScores(0);
		setTabValue(0);

		// Clear all VQ form state variables that feed into VQInitialValues_tab3
		setvqSubject("");
		setvqDescription("");
		setvqEndDate(null);
		setfrequency(0);
		setCategory([]); // Clear service categories

		// Clear question-related data
		setSelectedQuesionArray([]);
		setQuestionList([]);
		setDataSQE(null);
		setChooseLibList(null);

		// // Clear temporary storage for new VQ
		// setTempUnsavedVQData({});

		// Reset formik after clearing state variables
		setTimeout(() => {

			formik_SQE.resetForm();

			// Explicitly set all form fields to empty values
			formik_SQE.setFieldValue("vqSubject", "");
			formik_SQE.setFieldValue("vqDescription", "");
			formik_SQE.setFieldValue("vqEndDate", null);
			formik_SQE.setFieldValue("frequency", 0);
			formik_SQE.setFieldValue("sqeServiceCategory", []);
		}, 50); // Small delay to ensure state updates first

		setIsCallbackTriggered(false);
		setIsSaveVisible(true);


	}

	const handleBackButtonClick = () => {
		// Clear editing-related state
		setIsEditing(false); // Switch back to the DataGrid
		setSqeHeaderId(''); // Clear selected qualification to hide stages
		setScores(0);
		setSqe(0);
		// setSelectedQuesionArray([]); // Uncomment if needed

		// Clean up the URL by removing query params (like ActionType, sqId, etc.)
		const pathSegments = location.pathname.split('/');
		const participantId = pathSegments[pathSegments.length - 1];

		// Navigate to the same route but without any query parameters
		navigate(`/manage/manage-participants/register-participants/${participantId}`, { replace: true });
	};


	// const handleBackButtonClick = () => {

	// 	setIsEditing(false); // Switch back to the DataGrid
	// 	setSqeHeaderId(''); // Clear selected qualification to hide stages
	// 	setScores(0)
	// 	setSqe(0)
	// 	//setSelectedQuesionArray([]); 
	// };
	//to set question for edit
	const [questionforedit, setQuestionForEdit] = useState(null);
	const handleSelectedEditQuestion = (question) => {

		setQuestionForEdit(question)
		setState({ ...state, qusDrawer: true })
	}
	const handleSelectedQArray = (value) => {
		setSelectedQuesionArray(value);
	};

	//##
	const handleSubmit = async (values) => {
		// Check GST verification for any form submission
		if (isGSTVerificationRequired()) {
			toast.error("Please verify the GST number before proceeding.");
			return;
		}

		if (value == 0) {
			if (isExtend) {
				handleExtendSupplier();
				return;
			}

			formik_companysetup.submitForm();
		} else if (value == 1) {
			// if(isExtend){
			//     handleExtendSupplier()
			// 	return
			// }

			if (formikPrimaryContactRef.current) {
				// Validate the form first before submitting
				formikPrimaryContactRef.current.submitForm();
			}

		}
		else if (value == 2) {
			// VQ Tab: Check which sub-tab is active
			if (tabValue === 0) {
				// Sub-tab 0: VQ Details - call add/sqe function

				formik_SQE.submitForm();
			} else if (tabValue === 1) {
				// Sub-tab 1: Add Questions - call addQuestion function


				// Check if there are questions to save
				if (questionlist && questionlist.length > 0) {
					// Only save new questions that haven't been saved yet
					const newQuestions = questionlist.filter(q => !q.sqeHeaderDetailId);

					if (newQuestions.length > 0) {
						try {
							await addQuestionsToVQ(sqeHeaderId, newQuestions);
							toast.success(`${newQuestions.length} question(s) saved successfully!`);

							// Refresh the VQ list to show updated data
							PullSQEList();
						} catch (error) {
							console.error("❌ Error saving questions:", error);
							toast.error(`Failed to save questions: ${error.message}`);
						}
					} else {
						toast.info("All questions are already saved.");
					}
				} else {
					toast.error("No questions to save. Please add at least one question.");
				}
			} else {
				// Fallback for any other sub-tab
				formik_SQE.submitForm();
			}
		}
	};


	const prefilledSupplierData = async (res) => {
		try {
			const countryObj = await findObjByValueFromArray(
				country_list,
				res?.country,
				"countryName"
			);

			const tax_list = await handleTax(countryObj?.id, null);
			const state_list = await handleStates(countryObj?.id, null);

			formik_companysetup.setFieldValue("country", countryObj);



			let taxtypeObj = null;
			if (res?.taxIdType) {
				// First try to find exact match in tax_list
				taxtypeObj = tax_list?.find(
					(item) => item.taxType === res?.taxIdType
				);



				// If no exact match found but API indicates registered type, create normalized object
				if (!taxtypeObj && res?.taxIdType !== "UNRG") {

					taxtypeObj = {
						id: 999, // Use high ID to avoid conflicts
						taxType: res?.taxIdType,
						description: res?.taxIdType === "IN3"
							? "India: GST Identification Number(GSTIN)"
							: `Registered (${res?.taxIdType})`,
						taxType2: res?.taxIdType === "IN3" ? "PAN" : "",
						description2: res?.taxIdType === "IN3" ? "Permanent Account Number" : "",
						countryCode: "IN",
						countryId: countryObj?.id || 111,
					};

				}
			}



			const taxId2Typeobj = findObjByValueFromArray(
				tax_list,
				res?.taxIdType,
				"taxType"
			);

			// Set general company values
			formik_companysetup.setFieldValue("taxId", res?.taxId);
			formik_companysetup.setFieldValue("taxId2", res?.taxId2);
			formik_companysetup.setFieldValue("companyName", res?.companyName);

			// ✅ FIX: Default msme to "N" if null/undefined to prevent validation errors
			const msmeValue = res?.msme || "N";
			formik_companysetup.setFieldValue("msme", msmeValue);

			formik_companysetup.setFieldValue("cinNo", res?.cinNo);
			formik_companysetup.setFieldValue("msmeNo", res?.msmeNo);
			formik_companysetup.setFieldValue("msmeType", res?.msmeType);
			formik_companysetup.setFieldValue("msmeFile", res?.msmeFile);
			formik_companysetup.setFieldValue("taxIdFile", res?.taxIdFile || null);
			formik_companysetup.setFieldValue("taxId2File", res?.taxId2File || null);
			formik_companysetup.setFieldValue("tradeName", res?.tradeName);
			formik_companysetup.setFieldValue("address", res?.address);
			formik_companysetup.setFieldValue("zipCode", res?.zipCode);

			const dialingcodeobj = findObjByValueFromArray(
				country_list,
				res?.dialingCode ?? userdialingcode,
				"dialingCode"
			);
			formik_companysetup.setFieldValue("DialingCode", dialingcodeobj);
			formik_companysetup.setFieldValue("phoneNumber", res?.phoneNumber);

			const stateobj = findObjByValueFromArray(state_list, res?.state, "stateName");
			formik_companysetup.setFieldValue("state", stateobj);

			const city_list = await handleCity(stateobj?.id, null);
			const cityobj = findObjByValueFromArray(city_list, res?.city, "cityName");
			formik_companysetup.setFieldValue("city", cityobj);

			//  SOLUTION: Process categories from API response for display in UI
			if (res?.categories?.length > 0) {


				// Convert API response categories to UI format
				const supplierCategories = res.categories.map(cat => ({
					id: cat.categoryId || cat.id,
					categoryId: cat.categoryId || cat.id,
					itemCategory: cat.categoryName, // Map categoryName to itemCategory for UI
					categoryName: cat.categoryName
				}));



				// Set the categories in the form for display
				formik_companysetup.setFieldValue("vendorCategoryMappings", supplierCategories);

				// Also set in legacy category state for backward compatibility
				setCategory(supplierCategories);
			}

			// 🎯 SOLUTION: Set normalized taxIdType and properly manage verify button state
			if (taxtypeObj) {

				// formik_companysetup.setFieldValue("taxIdType", taxtypeObj);
				formik_companysetup.setFieldValue("taxIdType", taxtypeObj, false);


				// Properly set verify button state based on tax type
				const isRegisteredType = taxtypeObj.taxType && taxtypeObj.taxType !== "UNRG";

				setShowVerifyButton(isRegisteredType);

				// Also set local state for consistency
				setTaxIdType(taxtypeObj);
			} else {
				const fallbackTax = countryObj?.id === 111 ? {
					id: 0,
					taxType: "UNRG",
					description: "Unregistered",
					taxType2: "PAN",
					description2: "Permanent Account Number(Unregistered)",
					countryCode: "IN",
					countryId: 111,
				} : {
					id: 0,
					taxType: "UNRG",
					description: "Unregistered",
					taxType2: "",
					description2: "",
					countryCode: "",
					countryId: countryObj?.id,
				};

				if (res?.taxIdType && res?.taxIdType !== "UNRG") {
					const emergencyTaxObj = {
						id: 999,
						taxType: res?.taxIdType,
						description: res?.taxIdType === "IN3" ? "India: GST Identification Number(GSTIN)" : `Registered (${res?.taxIdType})`,
						taxType2: "PAN",
						description2: "Permanent Account Number",
						countryCode: "IN",
						countryId: countryObj?.id || 111,

					};
					// formik_companysetup.setFieldValue("taxIdType", emergencyTaxObj);
					formik_companysetup.setFieldValue("taxIdType", emergencyTaxObj, false);

					setTaxIdType(emergencyTaxObj);
					setShowVerifyButton(true);
				} else {
					// formik_companysetup.setFieldValue("taxIdType", fallbackTax);
					formik_companysetup.setFieldValue("taxIdType", fallbackTax, false);

				}
			}

			if (taxId2Typeobj) {
				formik_companysetup.setFieldValue("taxId2Type", taxId2Typeobj);
			} else {
				const fallbackTax2 = countryObj?.id === 111 ? {
					id: 0,
					taxType: "UNRG",
					description: "Unregistered",
					taxType2: "PAN",
					description2: "Permanent Account Number(Unregistered)",
					countryCode: "IN",
					countryId: 111,
				} : {
					id: 0,
					taxType: "UNRG",
					description: "Unregistered",
					taxType2: "",
					description2: "",
					countryCode: "",
					countryId: countryObj?.id,
				};
				formik_companysetup.setFieldValue("taxId2Type", fallbackTax2);
			}

			// Vendor Primary Contact Processing
			if (res?.vendorPrimaryContact?.length > 0) {
				const processedContacts = {
					vendorPrimaryContact: res.vendorPrimaryContact.map((contact) => {
						const timezoneObj = findObjByValueFromArray(timezone_list, contact.timeZone, "localeName");
						const dialingCodeObj = findObjByValueFromArray(country_list, contact.dialingCode, "dialingCode");

						const contactCategories = contact.categories
							? contact.categories.map(cat => ({
								id: cat.categoryId || cat.id,
								categoryId: cat.categoryId || cat.id,
								categoryName: cat.categoryName,
								itemCategory: cat.categoryName // Add itemCategory for UI compatibility
							})) : [];

						return {
							id: contact.id || 0,
							Email: contact.email || "",
							ContactPerson: contact.contactPerson || "",
							TimeZone: timezoneObj || null,
							DialingCode: dialingCodeObj || null,
							PhoneNumber: contact.phoneNumber || "",
							isActive: contact.isActive || false,
							isPrimary: contact.isPrimary || false,
							categories: contactCategories,
						};
					})
				};

				setSupplierContact(processedContacts);

				if (formikPrimaryContactRef?.current) {
					formikPrimaryContactRef.current.setFieldValue("vendorPrimaryContact", processedContacts.vendorPrimaryContact);
				}


				if (res.vendorPrimaryContact[0]?.categories?.length > 0) {
					const contactCategories = res.vendorPrimaryContact[0].categories.map(cat => ({
						id: cat.categoryId || cat.id,
						categoryId: cat.categoryId || cat.id,
						categoryName: cat.categoryName,
						itemCategory: cat.categoryName
					}));
					setSupplierUserCategories(contactCategories);
				}
			}

			// ✅ CRITICAL FIX: Set ALL state variables that initialValues depends on
			// This ensures Formik's enableReinitialize uses correct values
			setCompanyName(res?.companyName || "");
			setTradeName(res?.tradeName || "");
			setAddress(res?.address || "");
			setCity(res?.city || "");
			setZipCode(res?.zipCode || "");
			setTaxId(res?.taxId || "");
			setTaxId2(res?.taxId2 || "");
			setGstnStatus(res?.gstnStatus || "");
			seteInvoiceStatus(res?.eInvoiceStatus || "");
			setTaxpayerType(res?.taxpayerType || "");
			setdialingCode(res?.dialingCode || "");
			setphoneNumber(res?.phoneNumber || "");

			// ✅ SOLUTION STEP 1: Track original taxId for comparison (prevents unnecessary verification clearing)
			if (res?.taxId) {
				setOriginalTaxId(res.taxId);
				setTaxIdChanged(false);

			}

			// ✅ SOLUTION STEP 2: GST Verification Status - Sync from gstnStatus field (source of truth)
			// gstnStatus values: "Active", "Suspended", "Cancelled" etc. indicate verified GST
			if (res?.gstnStatus && res.gstnStatus.trim() !== '') {
				setIstaxVerified(true);
				// ✅ CRITICAL: Also set taxVerified in Formik values for persistence across role switches
				formik_companysetup.setFieldValue("taxVerified", true);

			} else {
				setIstaxVerified(false);
				formik_companysetup.setFieldValue("taxVerified", false);

			}

			formik_companysetup.setFieldValue("gstnStatus", res?.gstnStatus || "");
			formik_companysetup.setFieldValue("eInvoiceStatus", res?.eInvoiceStatus || "");
			formik_companysetup.setFieldValue("taxpayerType", res?.taxpayerType || "");
			formik_companysetup.setFieldTouched("taxIdType", false, false);


		} catch (error) {
			console.error("Error in prefilledSupplierData:", error);
		}
	};


	// UseEffect to ensure primary contact form values are set after Formik component mounts
	useEffect(() => {
		if (formikPrimaryContactRef?.current && suppliersContact?.vendorPrimaryContact?.length > 0) {



			// Add a small delay to ensure the form is fully mounted
			setTimeout(() => {
				if (formikPrimaryContactRef?.current) {
					formikPrimaryContactRef.current.setFieldValue("vendorPrimaryContact", suppliersContact.vendorPrimaryContact);

				}
			}, 100);
		}
	}, [suppliersContact]);



	// ✅ CRITICAL FIX: Sync suppliercompleteDetails to Formik whenever it changes
	// This ensures all form values including taxVerified are properly initialized
	// when switching roles or reopening modals
	useEffect(() => {
		if (suppliercompleteDetails && formik_companysetup) {


			// Sync all form values from suppliercompleteDetails
			if (suppliercompleteDetails.taxId) {
				formik_companysetup.setFieldValue("taxId", suppliercompleteDetails.taxId);
			}
			if (suppliercompleteDetails.taxIdType) {
				formik_companysetup.setFieldValue("taxIdType", suppliercompleteDetails.taxIdType);
			}
			if (suppliercompleteDetails.companyName) {
				formik_companysetup.setFieldValue("companyName", suppliercompleteDetails.companyName);
			}
			if (suppliercompleteDetails.tradeName) {
				formik_companysetup.setFieldValue("tradeName", suppliercompleteDetails.tradeName);
			}
			if (suppliercompleteDetails.gstnStatus) {
				formik_companysetup.setFieldValue("gstnStatus", suppliercompleteDetails.gstnStatus);
			}
			if (suppliercompleteDetails.eInvoiceStatus) {
				formik_companysetup.setFieldValue("eInvoiceStatus", suppliercompleteDetails.eInvoiceStatus);
			}
			if (suppliercompleteDetails.taxpayerType) {
				formik_companysetup.setFieldValue("taxpayerType", suppliercompleteDetails.taxpayerType);
			}

			// ✅ CRITICAL: Sync taxVerified based on gstnStatus
			const hasValidGstnStatus = suppliercompleteDetails.gstnStatus &&
				suppliercompleteDetails.gstnStatus.trim() !== '';
			formik_companysetup.setFieldValue("taxVerified", hasValidGstnStatus);
			setIstaxVerified(hasValidGstnStatus);


		}
	}, [suppliercompleteDetails]);



	//

	//fILTER cATEGORY fOR vQ
	// 🔥 SOLUTION: For VQ filtering, only use contact-level categories (not top-level categories)
	const getContactCategoryNames = () => {
		const categoryNames = new Set(); // Use Set to avoid duplicates

		// Only get categories from contact level (for VQ filtering)
		const contactCategories = formik_companysetup.values?.vendorPrimaryContact?.[0]?.categories ||
			suppliersContact?.vendorPrimaryContact?.[0]?.categories || [];

		contactCategories.forEach(cat => {
			if (cat.categoryName) categoryNames.add(cat.categoryName);
			if (cat.itemCategory) categoryNames.add(cat.itemCategory);
		});



		return Array.from(categoryNames);
	};

	const selectedCategoryNames = getContactCategoryNames();

	// 🔥 Filter category_list to show only selected categories
	const filteredOptions = category_list.filter(option =>
		selectedCategoryNames.includes(option.categoryName) || selectedCategoryNames.includes(option.itemCategory)
	);



	const openBankModal = () => {

setState({ ...state, addBankDrawer: true });
		PullBankList(pageslug);

		// CRITICAL FIX: Sync ALL state variables with suppliercompleteDetails before modal opens
		// This ensures Formik reinitializes with correct values (enableReinitialize uses initialValues which depend on state)
		if (suppliercompleteDetails) {
			// Sync company details state
			if (suppliercompleteDetails.companyName) setCompanyName(suppliercompleteDetails.companyName);
			if (suppliercompleteDetails.tradeName) setTradeName(suppliercompleteDetails.tradeName);
			if (suppliercompleteDetails.address) setAddress(suppliercompleteDetails.address);
			if (suppliercompleteDetails.city) setCity(suppliercompleteDetails.city);
			if (suppliercompleteDetails.zipCode) setZipCode(suppliercompleteDetails.zipCode);

			
			if (suppliercompleteDetails.taxId) {
				setTaxId(suppliercompleteDetails.taxId);
				setOriginalTaxId(suppliercompleteDetails.taxId);
				setTaxIdChanged(false);

				// ✅ CRITICAL: Preserve GST verification status in BOTH state AND Formik
				// Only update if gstnStatus has a definitive value - preserve current state if undefined
				if (suppliercompleteDetails.gstnStatus !== undefined && suppliercompleteDetails.gstnStatus !== null) {
					if (suppliercompleteDetails.gstnStatus.trim() !== '') {
						
						setIstaxVerified(true);
						formik_companysetup.setFieldValue("taxVerified", true);
						setGstnStatus(suppliercompleteDetails.gstnStatus);
					} else {
					
						setIstaxVerified(false);
						formik_companysetup.setFieldValue("taxVerified", false);
					}
				} else {
					console.log("  ⚠️ suppliercompleteDetails.gstnStatus is undefined/null - PRESERVING current formik value:", formik_companysetup.values.taxVerified);
				}
				// If gstnStatus is undefined/null, preserve current verification state from formik
			}

			if (suppliercompleteDetails.taxId2) setTaxId2(suppliercompleteDetails.taxId2);
			if (suppliercompleteDetails.eInvoiceStatus) seteInvoiceStatus(suppliercompleteDetails.eInvoiceStatus);
			if (suppliercompleteDetails.taxpayerType) setTaxpayerType(suppliercompleteDetails.taxpayerType);
			if (suppliercompleteDetails.dialingCode) setdialingCode(suppliercompleteDetails.dialingCode);
			if (suppliercompleteDetails.phoneNumber) setphoneNumber(suppliercompleteDetails.phoneNumber);
		}

		// Prefill account holder name
		const currentCompanyName =
			suppliercompleteDetails?.companyName ||
			formik_companysetup?.values?.companyName ||
			companyName;
		setaccountHolderName(currentCompanyName || "");

		formikBank.resetForm();
	};


	const openFinanceModal = () => {



		setStateFinancial({ ...stateFinancial, ["addFinanceDrawer"]: true });
		PullFinanceList(pageslug);
		formikFinance.resetForm();

		// ✅ CRITICAL FIX: Sync ALL state variables with suppliercompleteDetails before modal opens
		if (suppliercompleteDetails) {
			// Sync company details state
			if (suppliercompleteDetails.companyName) setCompanyName(suppliercompleteDetails.companyName);
			if (suppliercompleteDetails.tradeName) setTradeName(suppliercompleteDetails.tradeName);
			if (suppliercompleteDetails.address) setAddress(suppliercompleteDetails.address);
			if (suppliercompleteDetails.city) setCity(suppliercompleteDetails.city);
			if (suppliercompleteDetails.zipCode) setZipCode(suppliercompleteDetails.zipCode);

			// ✅ CRITICAL: Sync Tax ID state - this is the key to showing verified button
			if (suppliercompleteDetails.taxId) {
				setTaxId(suppliercompleteDetails.taxId);
				setOriginalTaxId(suppliercompleteDetails.taxId);
				setTaxIdChanged(false);

				// ✅ CRITICAL: Preserve GST verification status in BOTH state AND Formik
				// Only update if gstnStatus has a definitive value - preserve current state if undefined
				if (suppliercompleteDetails.gstnStatus !== undefined && suppliercompleteDetails.gstnStatus !== null) {
					if (suppliercompleteDetails.gstnStatus.trim() !== '') {
						setIstaxVerified(true);
						formik_companysetup.setFieldValue("taxVerified", true);
						setGstnStatus(suppliercompleteDetails.gstnStatus);
					} else {
						setIstaxVerified(false);
						formik_companysetup.setFieldValue("taxVerified", false);
					}
				}
				// If gstnStatus is undefined/null, preserve current verification state from formik
			}

			if (suppliercompleteDetails.taxId2) setTaxId2(suppliercompleteDetails.taxId2);
			if (suppliercompleteDetails.eInvoiceStatus) seteInvoiceStatus(suppliercompleteDetails.eInvoiceStatus);
			if (suppliercompleteDetails.taxpayerType) setTaxpayerType(suppliercompleteDetails.taxpayerType);
			if (suppliercompleteDetails.dialingCode) setdialingCode(suppliercompleteDetails.dialingCode);
			if (suppliercompleteDetails.phoneNumber) setphoneNumber(suppliercompleteDetails.phoneNumber);
		}

		// ✅ Preserve GST verification status when modal opens (legacy code for backward compatibility)
		if (suppliercompleteDetails?.taxId) {
			formik_companysetup.setFieldValue('taxId', suppliercompleteDetails.taxId);
			formik_companysetup.setFieldTouched('taxId', false);

			// Maintain verification status from API data
			if (suppliercompleteDetails?.gstnStatus && suppliercompleteDetails.gstnStatus.trim() !== '') {
				setIstaxVerified(true);
			}

			// Set original tax ID to prevent false "changed" detection
			if (!originalTaxId) {
				setOriginalTaxId(suppliercompleteDetails.taxId);
				setTaxIdChanged(false);
			}
		}
	}

	const openSapDrawer = () => {
		setStateFinancial({ ...stateFinancial, ["addSapDrawer"]: true });
		clearSapDetails();
	}

	const closeSapDrawer = () => {
		setStateFinancial({ ...stateFinancial, ["addSapDrawer"]: false });
	}

	const VQInitialValues_tab3 = {
		vqSubject: vqSubject || '',
		vqDescription: vqDescription || '',
		vqEndDate: vqEndDate || null,
		sqeServiceCategory: sqeServiceCategory || [],
		frequency: frequency || 0,
	};

	const validationSchema_tab3 = yup.object({
		vqSubject: yup.string().required("please enter vq subject"),
		vqDescription: yup.string().required("Please enter vq description"),
		vqEndDate: yup.string().required("Please enter  End date"),
		sqeServiceCategory: yup.array(),
		frequency: yup.number(),
	});

	const formik_SQE = useFormik({
		enableReinitialize: true,
		initialValues: VQInitialValues_tab3,
		validationSchema: validationSchema_tab3,
		onSubmit: (values) => {



			// Validate date
			const currentDate = dayjs();
			const endDate = dayjs(values.vqEndDate);

			if (endDate.isBefore(currentDate)) {
				toast.error("End Date cannot be in the past.", { toastid: "Servicepast" });
				return;
			}

			// Validate all VQ requirements
			const validationErrors = validateVQSubmission(values);
			if (validationErrors.length > 0) {
				toast.error(`Please fix the following errors: ${validationErrors.join(', ')}`);
				return;
			}

			// All validations passed, proceed with submission
			saveSQQuestionForSupplier(values)
		},
	});
	//For getting questions from eventquestionscreen
	const [questionlist, setQuestionList] = useState(null);
	// Temporary storage for unsaved VQ data (survives navigation back to grid)
	const [tempUnsavedVQData, setTempUnsavedVQData] = useState({});

	const CallbackSelectedQuestionList = async (questionlist) => {


		// Remove duplicates based on questionId before setting state
		const uniqueQuestions = questionlist.filter((question, index, self) =>
			index === self.findIndex(q => q.questionId === question.questionId)
		);



		// Update local state - DO NOT auto-save, let user control via Submit button
		setQuestionList(uniqueQuestions);

	}

	// Handler for EventQuestionScreen to add individual questions
	const handleAddQuestionToVQ = async (question) => {


		if (!sqeHeaderId) {
			toast.error("Please save VQ details first before adding questions");
			return;
		}

		try {
			// Use the same logic as addQuestionsToVQ but for a single question
			await addQuestionsToVQ(sqeHeaderId, [question]);
			toast.success("Question added successfully!");

			// Refresh the question list
			PullSQEList();
		} catch (error) {
			console.error("Error adding question:", error);
			toast.error(`Failed to add question: ${error.message}`);
		}
	};
	// Step 1: Create VQ Header (Main Supplier Qualification Event)
	const createVQHeader = async (values) => {

		const vqHeaderPayload = {
			id: sqeHeaderId || 0, // Use existing sqeHeaderId when updating, 0 for new records
			customerId: customerid,
			vendorId: pageslug, // The vendor who is initiating the VQ
			toUserId: 0, // User assigned (optional or system-assigned)
			vqSubject: values?.vqSubject,
			vqDescription: values?.vqDescription,
			vqEndDate: values?.vqEndDate?.toISOString(),
			responseDate: values?.vqEndDate?.toISOString(), // Using same date as end date
			stage: "Draft", // Current stage starts as "Draft"
			isApproved: true,
			frequency: values?.frequency || 0,
			scores: 0,
			activityId: 0,
			stages: {
				eventType: "VQ",
				currentStage: "Draft",
				nextStage: "Initiated",
				orgId: 0,
				orgGroupId: 0
			},
			grade: "",
			// 🔥 SOLUTION: Don't filter by createdById for new category selections
			sqeServiceCategory: (formik_SQE.values?.sqeServiceCategory ?? []).map(category => ({
				id: 0,
				categoryId: category.categoryId || category.id || 0,
				categoryName: category.categoryName || category.itemCategory || "",
				vqHeaderId: sqeHeaderId || 0, // Use existing sqeHeaderId when updating
				vendorId: parseInt(pageslug) || 0,
				customerId: parseInt(customerid) || 0
			})),
			inviteVendors: [
				{
					vendorId: parseInt(pageslug) // ID of the supplier being qualified
				}
			]
		};


		return vqHeaderPayload;
	};

	// Step 2: Add Questions to VQ using single Update API call
	const addQuestionsToVQ = async (vqHeaderId, questions) => {


		if (!vqHeaderId) {
			throw new Error("VQ Header ID is required to add questions");
		}

		if (!questions || questions.length === 0) {
			console.warn("No questions to add");
			return [];
		}

		const sqeHeaderDetails = questions.map((question, index) => {


			const questionId = parseInt(question.questionId || question.id) || 0;
			const customerId = parseInt(customerid) || 1;
			const vendorId = parseInt(pageslug) || 0;
			const vqHeaderIdNum = parseInt(vqHeaderId) || 0;

			// More specific validation - questionId can be 0, but should exist
			if ((question.questionId === undefined && question.id === undefined) || !vendorId || !vqHeaderIdNum) {
				console.error(`❌ Missing critical data at index ${index}:`, {
					questionId: question.questionId,
					id: question.id,
					vendorId: vendorId,
					vqHeaderIdNum: vqHeaderIdNum,
					availableKeys: Object.keys(question),
					question: question
				});
				throw new Error(`Missing critical ID at index ${index}. Question has keys: ${Object.keys(question).join(', ')}. questionId: ${question.questionId}, id: ${question.id}`);
			}

			const questionOptions = (question.questionOption || question.options || []).map((option, optIndex) => ({
				id: 0,
				customerId: customerId,
				questionOption: String(option.optionText || option.questionOption || `Option ${optIndex + 1}`),
				weightage: parseInt(option.weightage) || 0,
				selectYN: String(option.selectYN || ""),
				isAttachment: Boolean(option.isAttachment),
				headerDetailId: 0,
				questionId: questionId
			}));

			return {
				id: 0,
				customerId: customerId,
				questionId: questionId,
				questionDescription: String(question.questionDescription || question.description || ""),
				attachement: Boolean(question.attachement || question.attachment || false),
				attachedFileName: String(question.attachedFileName || ""),
				optionType: Boolean(question.optionType || questionOptions.length > 0),
				weightage: parseInt(question.weightage) || 0,
				mandatory: Boolean(question.mandatory || false),
				questionRequirement: String(question.questionRequirement || ""),
				vendorId: vendorId,
				vqHeaderId: vqHeaderIdNum,
				libraryId: parseInt(question.libraryId || question.library?.id) || 0,
				categoryId: parseInt(question.categoryId || question.category?.id) || 0,
				questionCategory: String(question.questionCategory || question.category?.categoryName || ""),
				categorySubId: parseInt(question.categorySubId) || 0,
				questionSubCategory: String(question.questionSubCategory || ""),
				answer: String(question.answer || ""),
				score: parseInt(question.score) || 0,
				ansAttachements: String(question.ansAttachements || ""),
				autoCalculated: Boolean(question.autoCalculated || false),
				isMultiOption: Boolean(question.isMultiOption || false),
				isMultipleChoice: Boolean(question.isMultipleChoice || false),
				stages: {
					eventType: "VQ",
					currentStage: "Draft",
					nextStage: "Initiated",
					orgId: 0,
					orgGroupId: 0
				},
				questionOption: questionOptions
			};
		});

		const uniqueQuestions = sqeHeaderDetails.filter(
			(q, index, self) => index === self.findIndex(x => x.questionId === q.questionId)
		);



		try {
			const response = await apiClient.postres(`/api/SQE/AddQuestion`, uniqueQuestions, atoken);

			handleBackButtonClick();
			return [{ success: true, response }];
		} catch (error) {
			console.error("❌ Failed to add questions:", error.response?.data || error.message);
			return [{ success: false, error }];
		}
	};

	// const addQuestionsToVQ = async (vqHeaderId, questions) => {
	// 	console.log("=== ADDING QUESTIONS TO VQ ===");
	// 	console.log("VQ Header ID:", vqHeaderId);
	// 	console.log("Questions to add:", questions);

	// 	if (!vqHeaderId) {
	// 		throw new Error("VQ Header ID is required to add questions");
	// 	}

	// 	if (!questions || questions.length === 0) {
	// 		console.warn("No questions to add");
	// 		return [];
	// 	}

	// 	// Prepare all questions as sqeHeaderDetails array
	// 	const sqeHeaderDetails = questions.map((question, index) => {
	// 		console.log(`🔧 Processing question ${index + 1}:`, question);

	// 		// Validate required fields
	// 		if (!question.questionId && !question.id) {
	// 			console.error("❌ Question missing ID:", question);
	// 			throw new Error(`Question ${index + 1} is missing required ID`);
	// 		}

	// 		// Extract and validate key fields
	// 		const questionId = parseInt(question.questionId || question.id) || 0;
	// 		const customerId = parseInt(customerid) || 1;
	// 		const vendorId = parseInt(pageslug) || 0;
	// 		const vqHeaderIdNum = parseInt(vqHeaderId) || 0;

	// 		// Validate critical IDs
	// 		if (questionId === 0) {
	// 			throw new Error(`Question ${index + 1}: questionId cannot be 0`);
	// 		}
	// 		if (vendorId === 0) {
	// 			throw new Error(`Question ${index + 1}: vendorId cannot be 0`);
	// 		}
	// 		if (vqHeaderIdNum === 0) {
	// 			throw new Error(`Question ${index + 1}: vqHeaderId cannot be 0`);
	// 		}

	// 		// Map question options to the expected structure
	// 		const questionOptions = (question.questionOption || question.options || []).map((option, optIndex) => {
	// 			return {
	// 				id: 0,
	// 				customerId: customerId,
	// 				questionOption: String(option.optionText || option.questionOption || `Option ${optIndex + 1}`),
	// 				weightage: parseInt(option.weightage) || 0,
	// 				selectYN: String(option.selectYN || ""),
	// 				isAttachment: Boolean(option.isAttachment),
	// 				headerDetailId: 0,
	// 				questionId: questionId
	// 			};
	// 		});

	// 		const questionPayload = {
	// 			id: 0,
	// 			customerId: customerId,
	// 			questionId: questionId,
	// 			questionDescription: String(question.questionDescription || question.description || ""),
	// 			attachement: Boolean(question.attachement || question.attachment || false),
	// 			attachedFileName: String(question.attachedFileName || ""),
	// 			optionType: Boolean(question.optionType || (questionOptions.length > 0)),
	// 			weightage: parseInt(question.weightage) || 0,
	// 			mandatory: Boolean(question.mandatory || false),
	// 			questionRequirement: String(question.questionRequirement || ""),
	// 			vendorId: vendorId,
	// 			vqHeaderId: vqHeaderIdNum,
	// 			libraryId: parseInt(question.libraryId || question.library?.id) || 0,
	// 			categoryId: parseInt(question.categoryId || question.category?.id) || 0,
	// 			questionCategory: String(question.questionCategory || question.category?.categoryName || ""),
	// 			categorySubId: parseInt(question.categorySubId) || 0,
	// 			questionSubCategory: String(question.questionSubCategory || ""),
	// 			answer: String(question.answer || ""),
	// 			score: parseInt(question.score) || 0,
	// 			ansAttachements: String(question.ansAttachements || ""),
	// 			autoCalculated: Boolean(question.autoCalculated || false),
	// 			isMultiOption: Boolean(question.isMultiOption || false),
	// 			isMultipleChoice: Boolean(question.isMultipleChoice || false),
	// 			stages: question.stages || {
	// 				eventType: "VQ",
	// 				currentStage: "Initiated", 
	// 				nextStage: "Under Approval",
	// 				orgId: 0,
	// 				orgGroupId: 0
	// 			},
	// 			questionOption: questionOptions
	// 		};

	// 		console.log(`🔧 Processed question payload:`, questionPayload);
	// 		return questionPayload;
	// 	});

	// 	// Remove duplicates based on questionId to avoid duplicate API calls
	// 	const uniqueQuestions = sqeHeaderDetails.filter((question, index, self) => 
	// 		index === self.findIndex(q => q.questionId === question.questionId)
	// 	);

	// 	console.log(`Step 2 - Removed duplicates: ${sqeHeaderDetails.length} -> ${uniqueQuestions.length} unique questions`);
	// 	console.log(`Step 2 - Preparing ${uniqueQuestions.length} questions for individual AddQuestion API calls:`, uniqueQuestions);

	// 	try {
	// 		// Since /api/SQE/AddQuestion only accepts individual question objects, 
	// 		// we need to make separate API calls for each question
	// 		const questionResults = [];

	// 		console.log(`🚀 Making ${uniqueQuestions.length} individual API calls to AddQuestion endpoint...`);

	// 		for (let i = 0; i < uniqueQuestions.length; i++) {
	// 			const question = uniqueQuestions[i];

	// 			try {
	// 				console.log(`📤 API Call ${i + 1}/${uniqueQuestions.length} - Adding question:`, question.questionDescription);
	// 				console.log(`📤 Full payload for question ${i + 1}:`, JSON.stringify(question, null, 2));

	// 				const response = await apiClient.postres(`/api/SQE/AddQuestion`, question, atoken);
	// 				questionResults.push(response);
	// 				console.log(`✅ Question ${i + 1} added successfully:`, response);
	// 			} catch (questionError) {
	// 				console.error(`❌ Failed to add question ${i + 1}:`, question.questionDescription);
	// 				console.error(`❌ Question payload that failed:`, JSON.stringify(question, null, 2));
	// 				console.error(`❌ API Error details:`, questionError);

	// 				// Check if it's a 400 Bad Request
	// 				if (questionError.response?.status === 400) {
	// 					console.error(`❌ Bad Request (400) for question ${i + 1}:`);
	// 					console.error(`❌ Error response data:`, questionError.response?.data);
	// 					console.error(`❌ Validation issues detected in payload`);
	// 				}

	// 				// Continue with other questions but log the failure
	// 				questionResults.push({
	// 					success: false,
	// 					error: questionError,
	// 					questionId: question.questionId,
	// 					questionDescription: question.questionDescription
	// 				});
	// 			}
	// 		}

	// 		const successCount = questionResults.filter(r => r.success !== false).length;
	// 		const failCount = questionResults.filter(r => r.success === false).length;

	// 		console.log(`🏁 Results: ${successCount} successful, ${failCount} failed out of ${uniqueQuestions.length} questions`);

	// 		if (failCount > 0) {
	// 			console.warn(`⚠️ Some questions failed to add. Check the logs above for details.`);
	// 		}

	// 		return questionResults;
	// 	} catch (error) {
	// 		console.error(`💥 Critical error in addQuestionsToVQ:`, error);
	// 		throw error;
	// 	}
	// };

	const saveSQQuestionForSupplier = async (values) => {


		// DEBUG: Print detailed question structure
		if (questionlist && questionlist.length > 0) {

			questionlist.forEach((q, i) => {
				console.log(`Question ${i}:`, {
					questionId: q?.questionId,
					id: q?.id,
					questionDescription: q?.questionDescription,
					hasQuestionId: q?.questionId !== undefined,
					hasId: q?.id !== undefined,
					allKeys: Object.keys(q || {})
				});
			});
		}

		// if (!questionlist?.length || questionlist.length === 0) {
		// 	toast.error(`No questions selected. Please add at least one question before submitting.`);
		// 	return;
		// }

		setLoading(true);
		toast.info("Creating Supplier Qualification Event...", { toastId: "vq-progress" });

		try {

			const vqHeaderPayload = await createVQHeader(values);

			let headerWithStage = getPayloadWithStage(
				"currentStage",
				currentVQStage,
				vqStagelist,
				vqHeaderPayload,
				"currentStage"
			);


			const headerResponse = await apiClient.postres(`/api/SQE/Add`, headerWithStage, atoken);




			const vqHeaderId = parseInt(headerResponse?.data);



			const questionResults = await addQuestionsToVQ(vqHeaderId, questionlist);



			setLoading(false);


			// Update VQ state with new header ID
			setSqe(vqHeaderId);
			setSqeHeaderId(vqHeaderId);

			// Navigate to Add Question tab (tab 1)
			setTabValue(1);

			// Refresh VQ list to show the newly created VQ
			PullSQEList();

		} catch (error) {
			setLoading(false);

			console.error("❌ Error in VQ creation process:", error);

			let errorMessage = "Failed to create VQ";
			if (error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error.message) {
				errorMessage = error.message;
			}

			toast.error(`Error creating VQ: ${errorMessage}`);
		}
	};


	// const handleDateChange = (newValue) => {
	// 	const currentDate = new Date();
	// 	// Set time to 00:00:00 for comparison
	// 	currentDate.setHours(0, 0, 0, 0);

	// 	if (newValue < currentDate) {

	// 		toast.error("The end date must be today or in the future.", { toastId: "Servicefuture" });

	// 		return; // Early return if the date is invalid
	// 	}

	// 	formik_SQE.setFieldValue("vqEndDate", newValue);
	// };
	const handleDateChange = (newValue) => {

		const currentDate = dayjs();

		// If the selected date is earlier than the current date and time, show the toast
		if (dayjs(newValue).isBefore(currentDate)) {
			toast.error("The end date must be today or in the future.", { toastId: "Servicetodayfuture" });
			return; // Early return if the date is invalid
		}

		formik_SQE.setFieldValue("vqEndDate", newValue);
	};

	// Helper function to validate VQ submission
	const validateVQSubmission = (values) => {
		const errors = [];

		if (!values.vqSubject || values.vqSubject.trim() === '') {
			errors.push("VQ Subject is required");
		}

		if (!values.vqDescription || values.vqDescription.trim() === '') {
			errors.push("VQ Description is required");
		}

		if (!values.vqEndDate) {
			errors.push("VQ End Date is required");
		}

		// if (!questionlist || questionlist.length === 0) {
		// 	errors.push("At least one question must be selected");
		// }

		if (!formik_SQE.values?.sqeServiceCategory || formik_SQE.values.sqeServiceCategory.length === 0) {
			errors.push("At least one service category must be selected");
		}

		return errors;
	};

	/* Example Question Structure from EventQuestionScreen:
	{
		id: 1,
		questionId: 1,
		questionDescription: "Income Tax Permanent Account Number",
		attachment: true,
		optionType: true,
		weightage: 20,
		mandatory: false,
		libraryId: 3,
		categoryId: 1,
		category: { id: 1, categoryName: "Company Information" },
		questionOption: [
			{
				id: 0,
				optionText: "Yes",
				weightage: 20,
				isAttachment: true
			},
			{
				id: 0,
				optionText: "No", 
				weightage: 0,
				isAttachment: false
			}
		]
	}
	*/



	{/* End Date */ }
	<div className="col-12 col-md-4 col-lg-4">
		<MobileDateTimePicker
			label="End Date/Time *"
			name="vqEndDate"
			id="vqEndDate"
			value={formik_SQE?.values?.vqEndDate ?? null}
			onChange={(newValue) => formik_SQE.setFieldValue("vqEndDate", newValue)}
			minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
			timezone={userDetail?.timeZone}
			format={getDateFormatPatteronLocale(userDetail)}
			ampm={userampm(userDetail)}
			disabled={currentVQStage === "Under Approval" || currentVQStage === "Qualified"}
			className="w-100 f14"
			slotProps={{
				textField: {
					variant: "outlined",
					size: "small",
					InputLabelProps: { shrink: true },
					error: formik_SQE.touched.vqEndDate && Boolean(formik_SQE.errors.vqEndDate),
					helperText: formik_SQE.touched.vqEndDate && formik_SQE.errors.vqEndDate,
					InputProps: {
						title: "This field is not editable",
					},
				},
				actionBar: {
					actions: ["clear", "cancel", "accept"],
				},
			}}
		/>
	</div>



	// <MobileDateTimePicker
	// 	variant="outlined"

	// 	label="End Date *"
	// 	size="small"
	// 	name="vqEndDate"
	// 	id="vqEndDate"
	// 	value={formik_SQE?.values?.vqEndDate ?? null}
	// 	className="w-100 f14"
	// 	readOnly
	// 	slotProps={{
	// 		textField: {
	// 			variant: "outlined",
	// 			size: "small",
	// 			InputLabelProps: { shrink: true },
	// 			error:
	// 				formik_SQE.touched.vqEndDate &&
	// 				Boolean(formik_SQE.errors.vqEndDate),
	// 			helperText:
	// 				formik_SQE.touched.vqEndDate &&
	// 				formik_SQE.errors.vqEndDate,
	// 			InputProps: {
	// 				title: "This field is not editable",
	// 			}
	// 		},
	// 		actionBar: {
	// 			actions: ["clear", "cancel", "accept"],
	// 		},
	// 	}}
	// 	onChange={handleDateChange}
	// 	disabled={currentVQStage === "Under Approval" || currentVQStage === "Qualified"}
	// />

	//questiontabcell

	const saveUpdatedData = useCallback(async (dataSQE) => {
		try {

			const res = await apiclient.postres(`/api/SQE/Update`, dataSQE.sqeHeader[0], atoken);

		} catch (error) {

			toast.error(`Error updating data: ${error.message}`);
		}
	}, [dataSQE, atoken]);

	const handleQuestionUpdate = useCallback((sqeHeaderDetails) => {

		const updateddata = dataSQE
		if (updateddata.sqeHeader[0]) {
			updateddata.sqeHeader[0].sqeHeaderDetails = sqeHeaderDetails;
		}

		setDataSQE(updateddata);
		saveUpdatedData(updateddata);
	}, [dataSQE, saveUpdatedData]);


	//  const [period, setPeriod] = useState(options[0]);
	const [period, setPeriod] = useState(null);


	//   const handlePeriodChange = (event) => {
	//     setPeriod(event.target.value);
	//   };


	const handleApprover = (booleanvalue) => {

		setApproverShow(booleanvalue)
	}

	const [isCustomPeriod, setIsCustomPeriod] = useState(false);

	const handleFrequencyChange = (event) => {
		const value = event.target.value;
		formik_SQE.setFieldValue('frequency', value);
		setIsCustomPeriod(value === 0); // Show custom input when "Custom Period" is selected
	};

	const handleCustomFrequencyChange = (event) => {
		const customValue = event.target.value;
		formik_SQE.setFieldValue('frequency', customValue); // Save custom frequency in the same field
	};



	// SAP Drawer state and functions
	const [Sapstate, setSapstate] = useState({
		addBankDrawer: false,
		openInvoiceApproved: false,
		qusDrawer: false,
		addSapDrawer: false
	});

	// const [stateFinancial, setStateFinancial] = useState({
	// 	addFinanceDrawer: false
	// });

	// SAP form states
	const [sapVendorAccountGroup, setSapVendorAccountGroup] = useState(null);
	const [sapPurchaseOrganization, setSapPurchaseOrganization] = useState(null);
	const [sapIncoterms, setSapIncoterms] = useState(null);
	const [sapSchemaGroup, setSapSchemaGroup] = useState(null);
	const [sapCompanyCode, setSapCompanyCode] = useState(null);
	const [sapReconciliationAccount, setSapReconciliationAccount] = useState(null);
	const [sapPaymentTerms, setSapPaymentTerms] = useState(null);
	const [sapAuthorizationGroup, setSapAuthorizationGroup] = useState(null);
	const [sapGstVendorClassification, setSapGstVendorClassification] = useState(null);
	const [sapWithholdingTax, setSapWithholdingTax] = useState(null);
	const [sapTaxDeductionSource, setSapTaxDeductionSource] = useState(null);
	const [sapWithholdingTaxCode, setSapWithholdingTaxCode] = useState(null);
	const [sapRecipientType, setSapRecipientType] = useState(null);
	const [sapCurrency, setSapCurrency] = useState(null);
	const [sapTaxClassification, setSapTaxClassification] = useState(null);
	const [sapPurchasingGroup, setSapPurchasingGroup] = useState(null);
	const [sapTermsOfPayment, setSapTermsOfPayment] = useState(null);
	const [sapMinorityIndicator, setSapMinorityIndicator] = useState(null);

	// Dummy data for SAP dropdowns
	const vendorAccountGroupOptions = [
		{ id: 1, name: "Z001 - Domestic Vendor" },
		{ id: 2, name: "Z002 - Foreign Vendor" },
		{ id: 3, name: "Z003 - Service Provider" },
		{ id: 4, name: "Z004 - Employee" }
	];

	const purchaseOrganizationOptions = [
		{ id: 1, name: "1000 - Company Code 1000" },
		{ id: 2, name: "2000 - Company Code 2000" },
		{ id: 3, name: "3000 - Company Code 3000" }
	];

	const incotermsOptions = [
		{ id: 1, name: "EXW - Ex Works" },
		{ id: 2, name: "FOB - Free On Board" },
		{ id: 3, name: "CIF - Cost, Insurance and Freight" },
		{ id: 4, name: "DDP - Delivered Duty Paid" }
	];

	const schemaGroupOptions = [
		{ id: 1, name: "01 - Standard Schema" },
		{ id: 2, name: "02 - Service Schema" },
		{ id: 3, name: "03 - Material Schema" }
	];

	const companyCodeOptions = [
		{ id: 1, name: "1000 - Head Office" },
		{ id: 2, name: "2000 - Branch Office" },
		{ id: 3, name: "3000 - Regional Office" }
	];

	const reconciliationAccountOptions = [
		{ id: 1, name: "160000 - Vendor Account" },
		{ id: 2, name: "160001 - Service Vendor" },
		{ id: 3, name: "160002 - Material Vendor" }
	];

	const paymentTermsOptions = [
		{ id: 1, name: "Z001 - Net 30 Days" },
		{ id: 2, name: "Z002 - Net 60 Days" },
		{ id: 3, name: "Z003 - Immediate Payment" },
		{ id: 4, name: "Z004 - 2/10 Net 30" }
	];

	const authorizationGroupOptions = [
		{ id: 1, name: "A01 - Standard Authorization" },
		{ id: 2, name: "A02 - Restricted Authorization" },
		{ id: 3, name: "A03 - Full Authorization" }
	];

	const gstVendorClassificationOptions = [
		{ id: 1, name: "REG - Regular" },
		{ id: 2, name: "COMP - Composition" },
		{ id: 3, name: "UIN - UIN Holder" },
		{ id: 4, name: "UNREG - Unregistered" }
	];

	const withholdingTaxOptions = [
		{ id: 1, name: "Yes" },
		{ id: 2, name: "No" }
	];

	const taxDeductionSourceOptions = [
		{ id: 1, name: "TDS - Tax Deducted at Source" },
		{ id: 2, name: "TCS - Tax Collected at Source" },
		{ id: 3, name: "No Tax Deduction" }
	];

	const withholdingTaxCodeOptions = [
		{ id: 1, name: "I1 - Professional Services" },
		{ id: 2, name: "I2 - Technical Services" },
		{ id: 3, name: "I3 - Contractual Services" },
		{ id: 4, name: "I4 - Others" }
	];

	const recipientTypeOptions = [
		{ id: 1, name: "IND - Individual" },
		{ id: 2, name: "HUF - Hindu Undivided Family" },
		{ id: 3, name: "COM - Company" },
		{ id: 4, name: "PART - Partnership" }
	];

	const currencyOptions = [
		{ id: 1, name: "INR - Indian Rupee" },
		{ id: 2, name: "USD - US Dollar" },
		{ id: 3, name: "EUR - Euro" },
		{ id: 4, name: "GBP - British Pound" }
	];

	const taxClassificationOptions = [
		{ id: 1, name: "TAX01 - Standard Tax" },
		{ id: 2, name: "TAX02 - Exempt" },
		{ id: 3, name: "TAX03 - Zero Rate" },
		{ id: 4, name: "TAX04 - Reverse Charge" }
	];

	const purchasingGroupOptions = [
		{ id: 1, name: "001 - Electronics" },
		{ id: 2, name: "002 - Mechanical" },
		{ id: 3, name: "003 - Services" },
		{ id: 4, name: "004 - Raw Materials" }
	];

	const termsOfPaymentOptions = [
		{ id: 1, name: "NET30 - Net 30 Days" },
		{ id: 2, name: "NET45 - Net 45 Days" },
		{ id: 3, name: "NET60 - Net 60 Days" },
		{ id: 4, name: "COD - Cash on Delivery" }
	];

	const minorityIndicatorOptions = [
		{ id: 1, name: "Y - Yes" },
		{ id: 2, name: "N - No" },
		{ id: 3, name: "NA - Not Applicable" }
	];

	const openSapModal = () => {
		setStateFinancial({ ...stateFinancial, ["addSapDrawer"]: true });
		clearSapDetails();
	};

	const clearSapDetails = () => {
		setSapVendorAccountGroup(null);
		setSapPurchaseOrganization(null);
		setSapIncoterms(null);
		setSapSchemaGroup(null);
		setSapCompanyCode(null);
		setSapReconciliationAccount(null);
		setSapPaymentTerms(null);
		setSapAuthorizationGroup(null);
		setSapGstVendorClassification(null);
		setSapWithholdingTax(null);
		setSapTaxDeductionSource(null);
		setSapWithholdingTaxCode(null);
		setSapRecipientType(null);
		setSapCurrency(null);
		setSapTaxClassification(null);
		setSapPurchasingGroup(null);
		setSapTermsOfPayment(null);
		setSapMinorityIndicator(null);
	};


	if (pageslug && !suppliercompleteDetails) {
		return <GridSkeleton />;
	}

	if (loadingPermissions) {
		return <GridSkeleton />;
	}



	// const showVerifyButton = currentTaxType === 'IN3';


	return (
		<>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				{/* Main content container with left/right layout like PurchaseRequest */}
				<div className="mainContainer d-flex">
					<div className={`leftContent ${approvershow ? "col-9" : "col-12"} d-flex flex-column`}>
						<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(103vh - 140px)' }}>
							{/* Header with BackButton, Stage Flow, and Action Buttons */}
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
								<div className="d-flex align-items-center">
									{!pathname.includes("invited-participants") ? (
										<BackButton title="Register Supplier" modal={true} />
									) : !isExtend ? (
										<BackButton title="Invited Supplier" modal={true} />
									) : (
										<BackButton title="Extend Supplier" modal={true} />
									)}
								</div>

								{/* Stage Flow - centered between title and buttons */}
								<div className="d-flex justify-content-center flex-grow-1">
									{value !== 2 && (
										<MemoizedEventStageFlow
											stagelist={pathname.includes("invited-participants") ? stageVIlist : stagelist}
											currentStage={currentStage}
										/>
									)}

									{value === 2 && sqeHeaderId && (
										<MemoizedEventStageFlow
											stagelist={vqStagelist}
											currentStage={currentVQStage}
										/>
									)}
								</div>

								{/* Action Buttons - Hide for Recent Queries tab */}
								{value != 3 && accessLevel?.contactdetails?.created != "None" && (
									(value == 0 && !showOnlyVQActions && (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false)) ||
									(value == 1 && !showOnlyVQActions && (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.CREATE) ?? false)) ||
									(value == 2) // Always show tab 2, action button controlled by renderCell logic
								) ? (


									// {/* {value != 3 && accessLevel?.contactdetails?.created != "None" && (
									// 	(value == 0 && !showOnlyVQActions && (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? true)) ||
									// 	(value == 1 && !showOnlyVQActions && (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.CREATE) ?? true)) ||
									// 	(value == 2) // Show on tab 2 for both VQ and non-VQ events
									// ) ? ( */}

									<div className="d-flex align-items-center gap-2">

										{/* ----------- EXTEND MODE BUTTONS ----------- */}
										{isExtend && !isExtendModeActive &&
											(value !== 2 || (value === 2 && tabValue >= 0)) &&     // FIXED HERE
											(value === 2 ? isEditing : true) && (
												<LoadingButton
													loading={progress}
													type="button"
													className="p-2 pt-1 pb-1"
													variant="contained"
													onClick={handleSubmit}
													disabled={value === 2 && currentVQStage && !["Draft"].includes(currentVQStage) && !isSaveVisible}
												>
													<span className="text-capitalize">
														{value === 0 && "Save & Continue"}
														{value === 1 && "Save Users Details"}
														{value === 2 && tabValue === 0 && "Save & Continue"}
														{value === 2 && tabValue === 1 && "Submit"}
													</span>
												</LoadingButton>
											)
										}

										{/* ----------- NORMAL MODE ----------- */}
										{!loading ? (
											!pathname.includes("invited-participants") &&
												!activityType &&
												!isExtend &&
												!isExtendModeActive ? (

												(value !== 2 || (value === 2 && tabValue >= 0)) &&      // FIXED HERE
												(value === 2 ? isEditing : true) && (

													value === 2 && tabValue === 2 ? (
														/** ---------------- PREVIEW TAB: SUBMIT DROPDOWN ---------------- */
														<>
															<ButtonGroup variant="contained" disabled={progress}>
																<LoadingButton
																	loading={progress}
																	variant="contained"
																	color="primary"
																	className="p-2 pt-1 pb-1"
																	onClick={async () => {
																		const validationErrors = validateVQSubmission(formik_SQE.values);
																		if (validationErrors.length > 0) {
																			toast.error(`Please fix: ${validationErrors.join(', ')}`);
																			return;
																		}

																		// Save questions first if there are any
																		if (questionlist && questionlist.length > 0) {
																			const newQuestions = questionlist.filter(q => !q.sqeHeaderDetailId);
																			if (newQuestions.length > 0) {
																				try {
																					await addQuestionsToVQ(sqeHeaderId, newQuestions);
																					toast.success(`Questions saved successfully!`);
																				} catch (error) {
																					console.error("❌ Error saving questions:", error);
																					toast.error(`Failed to save questions: ${error.message}`);
																					return;
																				}
																			}
																		}

																		await saveSQQuestionForSupplier(formik_SQE.values);
																		toast.success('Supplier Qualification submitted successfully!');
																	}}
																>
																	<span className="text-capitalize">Submit</span>
																</LoadingButton>

																<Button
																	size="small"
																	className="p-2 pt-1 pb-1"
																	aria-controls={submitMenuAnchor ? 'submit-menu' : undefined}
																	aria-haspopup="true"
																	aria-expanded={submitMenuAnchor ? 'true' : undefined}
																	onClick={(e) => setSubmitMenuAnchor(e.currentTarget)}
																>
																	<HiChevronDown />
																</Button>
															</ButtonGroup>

															<Menu
																id="submit-menu"
																anchorEl={submitMenuAnchor}
																open={Boolean(submitMenuAnchor)}
																onClose={() => setSubmitMenuAnchor(null)}
																MenuListProps={{ 'aria-labelledby': 'submit-button' }}
															>
																<MenuItem
																	onClick={async () => {
																		setSubmitMenuAnchor(null);
																		if (!formik_SQE.values.vqSubject ||
																			!formik_SQE.values.vqDescription ||
																			!formik_SQE.values.vqEndDate) {
																			toast.error("Please fill in all required fields (Subject, Description, End Date)");
																			return;
																		}
																		await saveSQQuestionForSupplier(formik_SQE.values);
																	}}
																	disabled={progress}
																>
																	Save as Draft
																</MenuItem>

																<MenuItem
																	onClick={async () => {
																		setSubmitMenuAnchor(null);
																		const validationErrors = validateVQSubmission(formik_SQE.values);
																		if (validationErrors.length > 0) {
																			toast.error(`Please fix: ${validationErrors.join(', ')}`);
																			return;
																		}

																		// Save questions first if there are any
																		if (questionlist && questionlist.length > 0) {
																			const newQuestions = questionlist.filter(q => !q.sqeHeaderDetailId);
																			if (newQuestions.length > 0) {
																				try {
																					await addQuestionsToVQ(sqeHeaderId, newQuestions);
																					toast.success(`Questions saved successfully!`);
																				} catch (error) {
																					console.error("❌ Error saving questions:", error);
																					toast.error(`Failed to save questions: ${error.message}`);
																					return;
																				}
																			}
																		}

																		await saveSQQuestionForSupplier(formik_SQE.values);
																		toast.success("Supplier Qualification submitted successfully!");
																	}}
																	disabled={progress}
																>
																	Submit Qualification
																</MenuItem>
															</Menu>
														</>
													) : (
														/** ---------------- OTHER TABS: SAVE BUTTON ---------------- */
														<LoadingButton
															loading={progress}
															type="button"
															className="p-2 pt-1 pb-1"
															variant="contained"
															onClick={handleSubmit}
															disabled={
																(value === 2 &&
																	currentVQStage &&
																	!["Draft"].includes(currentVQStage) &&
																	!isSaveVisible) ||
																currentVQStage === "Initiated"
															}
														>
															<span className="text-capitalize">
																{value === 0 && "Save & Continue"}
																{value === 1 && "Save Users Details"}
																{value === 2 && tabValue === 0 && "Save & Continue"}
																{value === 2 && tabValue === 1 && "Submit"}
																{/* {value === 2 && tabValue === 1 && "Save & Continue"} */}
															</span>
														</LoadingButton>
													)
												)

											) : (
												/** ----------- ACTION MODE ----------- */
												<>
													{activityId && (
														<Button
															type="button"
															onClick={toggleDrawer("openInvoiceApproved", true)}
															variant="contained"
															size="small"
															className="p-2 pt-1 pb-1 me-2"
															disabled={isExtend}
														>
															<span className="text-capitalize">Action</span>
														</Button>
													)}

													{isExtendModeActive && (
														<LoadingButton
															loading={progress}
															variant="contained"
															onClick={handleExtendSupplier}
														>
															<span className="text-capitalize">Extend Supplier</span>
														</LoadingButton>
													)}
												</>
											)

										) : (
											/** ---------- LOADING STATE ----------*/
											<Button variant="contained" className="p-2 pt-1 pb-1" size="small">
												<span className="text-capitalize">Save & Continue...</span>
											</Button>
										)}
									</div>







								) : null}
							</div>


							{/* Tab Navigation and Icons Header */}
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3">
								{/* Tab Navigation */}
								<Box sx={{
									flexGrow: 1,
									maxWidth: { xs: 280, sm: 480, md: '100%' },
								}}>
									<Tabs
										value={value}
										onChange={handleChange}
										textColor="primary"
										className="tabstheme"
										indicatorColor="primary"
										variant="scrollable"
										allowScrollButtonsMobile
									>
										{(loadingPermissions || permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ)) && (
											<Tab value={0} label={<span className="section-heading">Supplier Details</span>} />
										)}
										{(loadingPermissions || permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.READ)) && (
											<Tab value={1} label={<span className="section-heading">Supplier Users</span>} disabled={!pageslug} />
										)}
										{(loadingPermissions || permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.READ)) && (
											<Tab
												value={2}
												label={<span className="section-heading">Supplier Qualification</span>}
												disabled={!pageslug}
											/>
										)}
										{idFromURL && currentStage.trim() !== "Under Approval" && currentStage.trim() !== "Draft" && (loadingPermissions || (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ))) && (
											<Tab value={3} label={<span className="section-heading">Recent Queries</span>} disabled={!idFromURL} />
										)}
									</Tabs>
								</Box>

								{/* Top-right icons: History, Attachment, and Approval */}
								<div className="d-flex align-items-center gap-2">
									{/* Bank and Finance Details for all tabs */}
									{(value == 0 || value == 1 || value == 2) && pageslug && (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false) && (
										<>
											<div className="d-flex align-items-center gap-1">
												<Tooltip title="Bank Details">
													<IconButton
														color="primary"
														onClick={openBankModal}
														size="large"
														disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false)}
													>
														<RiBankLine />
													</IconButton>
												</Tooltip>
												{/* <span className="f12 text-muted">Bank Details</span> */}
											</div>
											<div className="d-flex align-items-center gap-1">
												<Tooltip title="Finance Details">
													<IconButton
														color="primary"
														onClick={openFinanceModal}
														size="large"
														disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false)}
													>
														<FaRegFileAlt />
													</IconButton>
												</Tooltip>
												{/* <span className="f12 text-muted">Financial Details</span> */}
											</div>
											<div className="d-flex align-items-center gap-1">
												<Tooltip title="ERP Details">
													<IconButton
														color="primary"
														onClick={openSapModal}
														size="large"
														disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false)}
													>
														<FaFileAlt />
													</IconButton>
												</Tooltip>
												{/* <span className="f12 text-muted">ERP Details</span> */}
											</div>
										</>
									)}

									<HistoryCell eventtype={eventtype} eventId={historyEventId} permissionManager={permissionManager}/>
									{/* <SelectApprovalsCell /> */}
									
									{/* Reinvite button for invited suppliers that need reinvitation */}
									{/* {suppliercompleteDetails?.parentId &&
										(suppliercompleteDetails?.stage === 'Invited' ||
											suppliercompleteDetails?.stage === 'Rejected' ||
											currentStage === 'Invited' ||
											currentStage === 'Rejected') && (
											<div className="d-flex align-items-center gap-1 me-2">
												<Tooltip title="Send invitation again to this supplier">
													<IconButton
														color="primary"
														onClick={handleReinviteSupplier}
														size="small"
														sx={{
															bgcolor: '#e3f2fd',
															'&:hover': { bgcolor: '#bbdefb' },
															border: '1px solid #2196f3'
														}}
													>
														<MailOutline />
													</IconButton>
												</Tooltip>
												<span className="f12 text-muted">Reinvite</span>
											</div>
										)} */}

									{/* Permission badges based on active tab - positioned in right corner */}
									{permissionManager && (
										<div className="d-flex align-items-center gap-1 ms-2">
											{/* <PersonOutlined className="text-muted" style={{ fontSize: '16px' }} /> */}
											{(() => {
												if (value === 0) {
													// Supplier Details permissions
													const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false;
													const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false;
													const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false;
													const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.REMOVE) ?? false;

													return (
														<>
															{/* {hasReadPermission && <span className="badge bg-success" style={{ fontSize: '10px' }}>Read</span>}
															{hasEditPermission && <span className="badge bg-warning ms-1" style={{ fontSize: '10px' }}>Edit</span>}
															{hasCreatePermission && <span className="badge bg-primary ms-1" style={{ fontSize: '10px' }}>Create</span>}
															{hasRemovePermission && <span className="badge bg-danger ms-1" style={{ fontSize: '10px' }}>Remove</span>} */}
														</>
													);
												} else if (value === 1) {
													// Supplier Users permissions
													const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.READ) || false;
													const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.EDIT) || false;
													const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.CREATE) || false;
													const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.REMOVE) || false;

													return (
														<>
															{/* {hasReadPermission && <span className="badge bg-success" style={{ fontSize: '10px' }}>Read</span>}
															{hasEditPermission && <span className="badge bg-warning ms-1" style={{ fontSize: '10px' }}>Edit</span>}
															{hasCreatePermission && <span className="badge bg-primary ms-1" style={{ fontSize: '10px' }}>Create</span>}
															{hasRemovePermission && <span className="badge bg-danger ms-1" style={{ fontSize: '10px' }}>Remove</span>} */}
														</>
													);
												} else if (value === 2) {
													// Supplier Qualification permissions
													const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.READ) || false;
													const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.EDIT) || false;
													const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.CREATE) || false;
													const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.REMOVE) || false;

													return (
														<>
															{/* {hasReadPermission && <span className="badge bg-success" style={{ fontSize: '10px' }}>Read</span>}
															{hasEditPermission && <span className="badge bg-warning ms-1" style={{ fontSize: '10px' }}>Edit</span>}
															{hasCreatePermission && <span className="badge bg-primary ms-1" style={{ fontSize: '10px' }}>Create</span>}
															{hasRemovePermission && <span className="badge bg-danger ms-1" style={{ fontSize: '10px' }}>Remove</span>} */}
														</>
													);
												} else if (value === 3) {
													// Recent Queries permissions
													const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false;

													return (
														<>
															{hasReadPermission && <span className="badge bg-success" style={{ fontSize: '10px' }}>Read</span>}
														</>
													);
												}
												return null;
											})()}
										</div>
									)}

									{
										(
											(value === 0 && pageslug) ||
											value === 1 ||
											(value === 2 && isEditing)
										) && (
											<Tooltip title="Show/Hide Approvers">
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
										)
									}



								</div>
							</div>

							{/* Tab Content */}
							<div className="flex-grow-1">
								{value == 0 ? (
									<>
										{/* Permission variables for Supplier Details tab */}
										{(() => {
											const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false;
											const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false;
											const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false;
											const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.REMOVE) ?? false;

											// FIXED: Handle both string and object formats for taxIdType
											const taxIdTypeValue = formik_companysetup.values.taxIdType;
											const resolvedTaxType = resolveTaxType(taxIdTypeValue);

											const isUnregistered = resolvedTaxType === "UNRG";
											const isTaxIdHidden = isUnregistered || !formik_companysetup.values.taxIdType?.taxType;
											const isRegistered = resolvedTaxType === "GST Registered" ||
												(resolvedTaxType && resolvedTaxType !== "UNRG");
											const hasPrefillledTaxId = formik_companysetup.values.taxId && formik_companysetup.values.taxId.trim() !== "";


											// Only lock if NOT unregistered
											const shouldLockTaxIdField =
												!isUnregistered &&
												istaxVerified &&
												isSupplierSaved;

											// Additional condition: Lock fields when registered and tax ID is saved (not just prefilled)
											// Only lock if NOT unregistered
											const shouldLockFieldsForPrefilledRegistered = isRegistered && hasPrefillledTaxId && isSupplierSaved && !isUnregistered;

											// Lock Tax ID field when GST is selected - ONLY in edit mode (not create mode) AND after save
											// Only lock if NOT unregistered
											const shouldDisableTaxIdForGST = isRegistered && pageslug && isSupplierSaved && !isUnregistered;

											// ✅ FIXED: Verify button visibility logic - handles both string and object formats
											const hasTaxId = formik_companysetup.values.taxId || taxId;
											const currentTaxType = resolvedTaxType || (typeof taxIdType === 'string' ? taxIdType : taxIdType?.taxType);
											const taxIdTypeObject = taxIdTypeValue || taxIdType;

											// 🎯 DIRECT CHECK: If taxType is IN3, show verify button
											// const isIN3TaxType = currentTaxType === 'IN3';
											const isNotUnregistered = currentTaxType && currentTaxType !== "UNRG";

											// Check for registered type in multiple ways
											const isRegisteredType = currentTaxType && currentTaxType !== "UNRG";

											// Also check for common GST tax type variations and object description
											const isGSTType = currentTaxType && (
												currentTaxType.includes("GST") ||
												currentTaxType.includes("GSTIN") ||
												currentTaxType === "GST Registered" ||
												currentTaxType === "GST" ||
												currentTaxType === "IN3" ||
												(taxIdTypeObject?.description && taxIdTypeObject.description.includes("GST")) ||
												currentTaxType !== "UNRG"
											);

											// Check if tax type object indicates it's not unregistered
											const hasRegisteredTaxType = taxIdTypeObject && (
												taxIdTypeObject.taxType !== "UNRG" ||
												(taxIdTypeObject.description && !taxIdTypeObject.description.toLowerCase().includes("unregistered"))
											);

											// 🚀 SIMPLIFIED CONDITION: Show verify button if ANY of these conditions are true
											const shouldShowVerifyButton = isIN3TaxType || isNotUnregistered || isRegisteredType || isGSTType || hasRegisteredTaxType;

											// Enhanced debug logging for troubleshooting


											// 🔄 Sync state variable with computed logic
											// const shouldHideVerifyButton = Boolean(
											//   (shouldLockTaxIdField ||
											//     shouldLockFieldsForPrefilledRegistered ||
											//     shouldDisableTaxIdForGST ||
											//     isExtend ||
											//     !formik_companysetup.values.country?.id ||
											//     (!hasEditPermission &&
											//       !(isIN3 &&
											//         istaxVerified &&
											//         formik_companysetup.values.taxIdType?.taxType !== "UNRG"))) &&
											//     currentStage?.trim() !== "Draft"
											// );



											return (
												<>
													{hasReadPermission ? (
														<div className="p-3 ps-2 pe-0 custom-fix">

															<form onSubmit={formik_companysetup.handleSubmit}>
																<div className="flex flex-col">
																	<Box sx={{ flexGrow: 1, paddingLeft: ".5rem", paddingRight: ".5rem", paddingTop: "16px", paddingBottom: "16px" }}>
																		<div className="row mt-2">
											<div className="col-12 col-md-4 mb-4" style={isTaxIdHidden ? {order: 1} : {}}>
																				<Autocomplete
																					// disabled={isExtend || !hasEditPermission}
																					disabled={
																						isExtend ||
																						shouldDisableTaxIdForGST ||
																						(!hasEditPermission && !(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))
																					}

																					disablePortal
																					id=""
																					size="small"
																					options={country_list ?? []}
																					fullWidth
																					renderInput={(params) => (
																						<TextField
																							{...params}
																							InputLabelProps={{
																								shrink: true,
																							}}
																							label="Country *"
																						/>
																					)}
																					getOptionLabel={(option) =>
																						option.countryName ?? ""
																					}
																					value={formik_companysetup.values.country}
																					onChange={async (e, newvalue) => {
																						if (newvalue) {
																							handlefieldonCountryKey(newvalue?.id);
																							formik_companysetup.setFieldValue(
																								"country",
																								newvalue
																							);
																							const tax_list = await handleTax(newvalue?.id, null);
																							handleStates(newvalue?.id, null);

																							//to set dialing code on country change 

																							setDialingCode(newvalue);
																							formik_companysetup.setFieldValue(
																								"DialingCode",
																								newvalue
																							);
																							dispatch({ type: actionTypes.SET_USERDIALINGCODE, value: newvalue?.dialingCode });

																							// Clear company details first
																							clearCompanyDetailsForCountry();

																							// Auto-select Unregistered ONLY if API returned empty (no tax types available)
																							const isIndia = newvalue?.countryKey === 'IN';
																							console.log("🔄 Country changed:", { isIndia, taxListLength: tax_list?.length });
																							
																							if (!isIndia) {
																								// For non-India: check if API returned empty (only Unregistered in list)
																								const hasOnlyUnregistered = tax_list?.length === 1 && tax_list[0]?.taxType === 'UNRG';
																								if (hasOnlyUnregistered) {
																									// API returned empty, auto-select Unregistered
																									console.log("✅ Auto-selecting Unregistered (API returned empty)");
																									formik_companysetup.setFieldValue('taxIdType', tax_list[0]);
																								} else {
																									// API returned data, don't auto-select anything
																									console.log("ℹ️ Not auto-selecting (API returned tax types)");
																								}
																								setShowVerifyButton(false);
																								setIN3(false);
																							} else {
																								// For India, taxIdType already cleared by clearCompanyDetailsForCountry
																								setShowVerifyButton(false);
																								setIN3(false);
																							}
																						} else {
																							// Country cleared - reset all dependent fields
																							formik_companysetup.setFieldValue("country", null);
																							formik_companysetup.setFieldValue("taxIdType", null);
																							formik_companysetup.setFieldValue("taxId", "");
																							formik_companysetup.setFieldValue("state", null);
																							formik_companysetup.setFieldValue("city", null);
																							formik_companysetup.setFieldValue("DialingCode", null);

																							setShowVerifyButton(false);
																							setIN3(false);
																							setTaxList([]);
																							setDialingCode(null);
																						}
																					}}
																				/>
																				{formik_companysetup.touched.country &&
																					formik_companysetup.errors.country ? (
																					<div className="f10 text-danger">
																						{formik_companysetup.errors.country}
																					</div>
																				) : null}
																			</div>

																						<div className="col-12 col-md-4 mb-4" style={isTaxIdHidden ? {order: 2} : {}}>
																				<Autocomplete
																					disabled={
																						isExtend ||
																						!formik_companysetup.values.country ||
																						!hasEditPermission ||
																						(resolvedTaxType === 'IN3' && isSupplierSaved && istaxVerified) ||
																						(
																							formik_companysetup.values.country?.countryKey === 'IN' && (
																								shouldLockTaxIdField ||
																								shouldLockFieldsForPrefilledRegistered ||
																								shouldDisableTaxIdForGST ||
																								(!hasEditPermission && !(isIN3 && isGSTActuallyVerified() && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))
																							)
																						) ||
																						(
																							formik_companysetup.values.country?.countryKey !== 'IN' &&
																							formik_companysetup.values.taxIdType?.taxType &&
																							formik_companysetup.values.taxIdType?.taxType !== "UNRG" &&
																							formik_companysetup.values.taxId?.trim()?.length > 0 &&
																							isSupplierSaved
																						)
																					}
																					disablePortal
																					id="taxIdType"
																					size="small"
																					options={tax_list ?? []}
																					fullWidth
																					isOptionEqualToValue={(option, value) => option.taxType === value?.taxType}
																					renderInput={(params) => {
																						// Determine if asterisk should be shown
																						const taxIdTypeValue = formik_companysetup.values.taxIdType;
																						const resolvedTaxType = resolveTaxType(taxIdTypeValue);
																						const isGSTSelected = resolvedTaxType === 'IN3';

																						return (
																							<TextField
																								{...params}
																								InputLabelProps={{
																									shrink: true,
																								}}
																								label={isGSTSelected ? "Tax Type*" : "Tax Type"}
																							/>
																						);
																					}}
																					getOptionLabel={(option) => option.description ?? ""}
																					value={formik_companysetup.values.taxIdType}
																					// 																onChange={(e, newValue) => {
																					//   // 🎯 SOLUTION: Handle both string and object formats properly
																					//   const taxIdTypeValue = formik_companysetup.values.taxIdType;
																					//   const resolvedTaxType = typeof taxIdTypeValue === "string" 
																					//     ? taxIdTypeValue 
																					//     : taxIdTypeValue?.taxType;

																					//   console.log("=== TAX TYPE CHANGE HANDLER (SOLUTION) ===");
																					//   console.log("Previous taxIdType value:", taxIdTypeValue);
																					//   console.log("Previous tax type (resolved):", resolvedTaxType);
																					//   console.log("New value received:", newValue);
																					//   console.log("New tax type:", newValue?.taxType);
																					//   console.log("showVerifyButton before change:", showVerifyButton);

																					//   if (newValue) {
																					//     // 🔧 Fix: Ensure dropdown always sets full object
																					//     formik_companysetup.setFieldValue("taxIdType", newValue);
																					//     setTaxIdType(newValue);

																					//     // //   Fix: Show verify if tax type is not UNRG
																					//     // const isRegistered = newValue?.taxType && newValue.taxType !== "UNRG";
																					//     // console.log("✅ SIMPLE: Setting showVerifyButton to:", isRegistered, "for tax type:", newValue?.taxType);
																					//     // setShowVerifyButton(isRegistered);

																					// 	const isRegistered =
																					//   isIN3 === true &&
																					//   newValue?.taxType &&
																					//   newValue.taxType !== "UNRG";

																					// setShowVerifyButton(isRegistered);



																					//     // 🔧 Fix: Clear previous taxId if switching from UNRG → registered
																					//     if (resolvedTaxType === "UNRG" && newValue?.taxType !== "UNRG") {
																					//       console.log("✅ SOLUTION: Clearing taxId - switching from UNRG to registered");
																					//       formik_companysetup.setFieldValue("taxId", "");
																					//       setTaxId("");
																					//       setIstaxVerified(false);
																					//     }

																					//     // Clear fields when switching to unregistered
																					//     if (newValue?.taxType === "UNRG") {
																					//       console.log("❌ SOLUTION: Clearing fields for unregistered tax type");
																					//       formik_companysetup.setFieldValue("taxId", "");
																					//       setTaxId("");
																					//       setIstaxVerified(false);
																					//     }
																					//   }

																					//   // Only clear tax verification if changing from registered to unregistered
																					//   // or if there was a previous verification
																					//   if (resolvedTaxType !== "UNRG" || istaxVerified) {
																					//     cleartaxVerification();
																					//   }

																					//   console.log("=== END TAX TYPE CHANGE HANDLER (SOLUTION) ===");
																					//   console.log("Final showVerifyButton state should be:", newValue?.taxType !== "UNRG");
																					//   }
																					// }
																					onChange={(e, newValue) => {
																						const prevTaxType = resolveTaxType(formik_companysetup.values.taxIdType);
																						const newTaxType = resolveTaxType(newValue);
																						const isIndia = formik_companysetup.values.country?.countryKey === 'IN';
																						// Clear Tax ID when switching to Unregistered
																						if (newTaxType === "UNRG" && prevTaxType !== "UNRG") {
																							formik_companysetup.setFieldValue("taxId", "");
																							setTaxId("");
																							setIstaxVerified(false);
																						}
																						handleTaxIdTypeChange(newValue);
																					}}


																				/>
																				{formik_companysetup.touched.taxIdType &&
																					formik_companysetup.errors.taxIdType ? (
																					<div className="text-danger">
																						{formik_companysetup.errors.taxIdType}
																					</div>
																				) : null}
																			</div>

																			{/* {isIN3 == true ? ( */}
																			{
																				(showVerifyButton && isIN3 && hasEditPermission) ? (
																					<>
																						<div className="col-12 col-md-4 mb-4">
																							{/* ✅ REFACTORED: Tax ID field with proper error handling and user interaction tracking */}
																							<TextField
																								error={taxIdError}
																								helperText={taxIdHelperText}
																								label={
																									(formik_companysetup.values.country?.countryKey === 'IN' && resolvedTaxType === 'IN3')
																										? 'Tax Id *'
																										: 'Tax Id'
																								}
																								name="taxId"
																								id="taxId"
																								variant="outlined"
																								size="small"
																								fullWidth
																								value={formik_companysetup.values.taxId}
																								InputLabelProps={{ shrink: true }}
																								inputProps={{ maxLength: 25 }}
																								disabled={Boolean(
																									// Only disable for unregistered if global disables apply
																									(isExtend || !formik_companysetup.values.country?.id || formik_companysetup.values.country?.countryKey !== 'IN' || !hasEditPermission) ? true :
																									// For registered, use the original disables
																									(resolvedTaxType !== 'UNRG' && (shouldLockTaxIdField || shouldLockFieldsForPrefilledRegistered || shouldDisableTaxIdForGST || (!hasEditPermission && !(isIN3 && isGSTActuallyVerified() && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))) && currentStage?.trim() !== "Draft")
																								)}
																								onChange={(e) => {
																									const newValue = e.target.value;
																									formik_companysetup.setFieldValue("taxId", newValue);
																									setTaxId(newValue);
																									setTaxIdChanged(newValue !== originalTaxId);

																									// ✅ SOLUTION STEP 3: Only reset verification if user CHANGED taxId from original
																									// This preserves verified state when modal/drawer opens with same taxId
																									if (istaxVerified && newValue !== originalTaxId) {
																										setIstaxVerified(false);
																										formik_companysetup.setFieldValue("taxVerified", false);
																										formik_companysetup.setFieldValue("gstnStatus", "");
																										setGstnStatus("");
																										
																									}

																									// Auto-verify when GST reaches 15 characters
																									if (isIN3 && newValue?.length >= 15 && taxIdType?.taxType !== "UNRG") {
																										setTimeout(() => {
																											if ((formik_companysetup.values.taxId || taxId) === newValue) {
																												handletaxVerification();
																											}
																										}, 1000);
																									}
																								}}
																								onBlur={() => {
																									// Mark field as touched for error display
																									formik_companysetup.setFieldTouched('taxId', true);

																									// Check for duplicate supplier if creating new
																									if (!pageslug && formik_companysetup.values.taxId) {
																										handleSupplierExist(formik_companysetup.values.taxId);
																									}
																								}}
																								InputProps={{
																									endAdornment: (
																										<InputAdornment position="end">
																											{/* Domain verification icon for new suppliers */}
																											{!pageslug && (
																												<IconButton
																													size="small"
																													onClick={() => handleSupplierExist(formik_companysetup.values.taxId)}
																												>
																													<MdDomainVerification />
																												</IconButton>
																											)}

																											{/* Character count */}
																											{formik_companysetup.values.taxId && (
																												<Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
																													{formik_companysetup.values.taxId.length}/25
																												</Typography>
																											)}

																											{/* ✅ GST Verify button - color based on verification status */}
																											{/* {showVerifyButton && isIN3 && hasEditPermission && ( */}
																											{showVerifyButton && isIN3 && hasEditPermission && !isGSTActuallyVerified() && (
																												<Typography
																													onClick={
																														Boolean(
																															(shouldLockTaxIdField ||
																																shouldLockFieldsForPrefilledRegistered ||
																																shouldDisableTaxIdForGST ||
																																isExtend ||
																																!formik_companysetup.values.country?.id ||
																																resolvedTaxType === "UNRG" ||
																																formik_companysetup.values.country?.countryKey !== 'IN' ||
																																(!hasEditPermission && !(isIN3 && isGSTActuallyVerified() && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))) &&
																															currentStage?.trim() !== "Draft"
																														) || loadingTax
																															? undefined
																															: isGSTActuallyVerified() ? cleartaxVerification : handletaxVerification
																													}
																													sx={{
																														color: isGSTActuallyVerified() ? '#4caf50' : '#2A68D3',
																														fontSize: '13px',
																														fontWeight: 600,
																														marginLeft: '8px',
																														cursor: Boolean(
																															(shouldLockTaxIdField ||
																																shouldLockFieldsForPrefilledRegistered ||
																																shouldDisableTaxIdForGST ||
																																isExtend ||
																																!formik_companysetup.values.country?.id ||
																																resolvedTaxType === "UNRG" ||
																																formik_companysetup.values.country?.countryKey !== 'IN' ||
																																(!hasEditPermission && !(isIN3 && isGSTActuallyVerified() && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))) &&
																															currentStage?.trim() !== "Draft"
																														) || loadingTax
																															? 'not-allowed'
																															: 'pointer',
																														opacity: Boolean(
																															(shouldLockTaxIdField ||
																																shouldLockFieldsForPrefilledRegistered ||
																																shouldDisableTaxIdForGST ||
																																isExtend ||
																																!formik_companysetup.values.country?.id ||
																																resolvedTaxType === "UNRG" ||
																																formik_companysetup.values.country?.countryKey !== 'IN' ||
																																(!hasEditPermission && !(isIN3 && isGSTActuallyVerified() && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))) &&
																															currentStage?.trim() !== "Draft"
																														) || loadingTax
																															? 0.5
																															: 1,
																														'&:hover': {
																															textDecoration: Boolean(
																																(shouldLockTaxIdField ||
																																	shouldLockFieldsForPrefilledRegistered ||
																																	shouldDisableTaxIdForGST ||
																																	isExtend ||
																																	!formik_companysetup.values.country?.id ||
																																	resolvedTaxType === "UNRG" ||
																																	formik_companysetup.values.country?.countryKey !== 'IN' ||
																																	(!hasEditPermission && !(isIN3 && isGSTActuallyVerified() && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))) &&
																																currentStage?.trim() !== "Draft"
																															) || loadingTax
																																? 'none'
																																: 'underline',
																														},
																													}}
																												>
																													{loadingTax ? 'Verifying...' : 'Verify'}
																												</Typography>
																											)}
																										</InputAdornment>
																									),
																								}}
																							/>

																							{/* File download button if Tax ID certificate uploaded */}
																							{uploadedFiletax1 && (
																								<span className="mt-2">
																									<Button
																										variant="text"
																										size="small"
																										className="text-capitalize font-normal"
																										onClick={() => handleDownloadFile(uploadedFiletax1, getFileName(uploadedFiletax1), atoken)}
																									>
																										{getFileName(uploadedFiletax1)}
																									</Button>
																								</span>
																							)}
																						</div>
																					</>
																				) : (
																					<>
																						{/* Hide Tax ID field entirely when Unregistered is selected */}
																						{!isUnregistered && formik_companysetup.values.taxIdType?.taxType && (
																						<div className="col-12 col-md-4 mb-4">
																							<TextField
																								disabled={
																									isExtend ||
																									!formik_companysetup.values.country?.id ||
																									!hasEditPermission ||
																									(
																										formik_companysetup.values.country?.countryKey !== 'IN' &&
																										formik_companysetup.values.taxIdType?.taxType !== "UNRG" &&
																										formik_companysetup.values.taxId?.trim()?.length > 0 &&
																										isSupplierSaved
																									)
																								}
																								id="taxId"
																								name="taxId"
																								label={
																									(formik_companysetup.values.country?.countryKey === 'IN' && formik_companysetup.values.taxIdType?.taxType === 'IN3')
																										? 'Tax Id *'
																										: 'Tax Id'
																								}
																								InputLabelProps={{
																									shrink: true,
																								}}
																								variant="outlined"
																								size="small"
																								fullWidth
																								placeholder=""
																								maxLength={25}
																								value={formik_companysetup.values.taxId}
																								onChange={(e) => {
																									const newValue = e?.target?.value;
																									// For non-India countries: always allow editing (no verification required)
																									setTaxId(newValue);
																									formik_companysetup.setFieldValue('taxId', newValue);
																									setTaxIdChanged(newValue !== originalTaxId);
																								}}
																								onBlur={!pageslug ? (e) => handleSupplierExist(e.target.value) : null}
																								InputProps={{
																									endAdornment: (
																										<InputAdornment position="end">
																											{!pageslug && (
																												<IconButton
																													size="small"
																													onClick={(e) => handleSupplierExist(e.target.value)}
																												>
																													<MdDomainVerification />
																												</IconButton>
																											)}
																										</InputAdornment>
																									),
																								}}
																							/>
																						</div>
																						)}
																					</>
																				)
																			}

																			{/* Tax Type 2 and Tax ID 2: Only show when NOT Unregistered and taxType2 exists */}
																			{!isUnregistered && formik_companysetup.values.taxIdType?.taxType2 && (
																			<>
																			<div className="col-12 col-md-6 mb-4">
																				<Autocomplete
																					disabled={
																						isExtend || 
																						!hasEditPermission || 
																						// Disable if taxType2 is empty for selected tax type
																						!formik_companysetup.values.taxIdType?.taxType2
																					}
																					disablePortal
																					id="taxId2Type"
																					size="small"
																					options={tax_list ?? []}
																					fullWidth
																					renderInput={(params) => (
																						<TextField
																							{...params}
																							InputLabelProps={{
																								shrink: true,
																							}}
																							label="Tax Type 2"
																						/>
																					)}
																					defaultValue={findObjByValueFromArray(
																						tax_list,
																						taxIdType,
																						"taxType"
																					)}
																					getOptionLabel={(option) =>
																						option.description2 ?? ""
																					}
																					value={formik_companysetup.values.taxIdType}
																					onChange={(e, newvalue) => {
																						formik_companysetup.setFieldValue(
																							`taxIdType`,
																							newvalue
																						);
																						setTaxId2Type(newvalue);
																					}}
																				/>
																			</div>
																			<div className="col-12 col-md-6 mb-4">
																				<TextFieldCell
																					disabled={
																						isExtend || 
																						!hasEditPermission ||
																						// Disable if taxType2 is empty for selected tax type
																						!formik_companysetup.values.taxIdType?.taxType2
																					}
																					id="taxId2"
																					name="taxId2"
																					label="Tax Id 2 "
																					placeholder=""
																					value={formik_companysetup.values.taxId2}
																					maxLength={25}
																					onChange={(e) => {
																						formik_companysetup.setFieldValue(
																							"taxId2",
																							e?.target?.value
																						);
																						setTaxId2(e?.target?.value);
																					}}
																					InputProps={{
																						readOnly:
																							(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")
																								? true
																								: false,
																						title: istaxVerified && formik_companysetup.values.taxIdType?.taxType !== "UNRG" ? "This field is auto-filled from tax verification" : "",
																						endAdornment: taxId2 && (
																							<InputAdornment position="end">
																								<Typography
																									variant="body2"
																									color="textSecondary"
																								>
																									{
																										formik_companysetup.values.taxId2
																											.length
																									}
																									/25
																								</Typography>
																							</InputAdornment>
																						),
																					}}
																				/>
																				{uploadedFiletax2 && (
																					<span>
																						<Button
																							variant="text"
																							size="small"
																							className="text-capitalize font-normal"
																							onClick={() =>
																								handleDownloadFile(
																									uploadedFiletax2,
																									getFileName(uploadedFiletax2),
																									atoken
																								)
																							}
																						>
																							{getFileName(uploadedFiletax2)}
																						</Button>
																					</span>
																				)}
																			</div>
																			</>
																			)}

																			{/* Tax ID 1 File Upload - show when Tax ID is visible */}
																			{!isUnregistered && formik_companysetup.values.taxIdType?.taxType && (
																			<div className={formik_companysetup.values.taxIdType?.taxType2 ? "col-12 col-md-6 col-lg-6 mb-3" : "col-12 col-md-12 col-lg-12 mb-3"}>
																				<label htmlFor="taxIdFile" className="f10 text-muted mb-0">Tax Id Attachment*</label>
																				<input
																					type="file"
																					id="taxIdFile"
																					name="taxIdFile"
																					className="form-control form-control-sm"
																					accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
																					disabled={isExtend || !hasEditPermission}
																					onChange={(e) =>
																						formik_companysetup.setFieldValue(
																							"taxIdFile",
																							e.target.files ? e.target.files[0] : null
																						)
																					}
																				/>
																				{formik_companysetup.values.taxIdFile && typeof formik_companysetup.values.taxIdFile === 'string' && (
																					<div className="mt-2 d-flex align-items-center gap-2">
																						<Typography variant="body2" color="textSecondary">
																							{getFileName(formik_companysetup.values.taxIdFile) || 'Download Tax Id File'}
																						</Typography>
																						<IconButton
																							color="primary"
																							size="small"
																							onClick={() =>
																								downloadFilesOnAzure(
																									formik_companysetup.values.taxIdFile,
																									getFileName(formik_companysetup.values.taxIdFile) || 'taxIdFile.pdf',
																									atoken
																								)
																							}
																						>
																							<HiDownload />
																						</IconButton>
																					</div>
																				)}
																			</div>
																			)}

																			{/* Tax ID 2 File Upload - show when Tax ID 2 is visible */}
																			{!isUnregistered && formik_companysetup.values.taxIdType?.taxType2 && (
																			<div className="col-12 col-md-6 col-lg-6 mb-4">
																				<label htmlFor="taxId2File" className="f10 text-muted mb-0">Tax Id 2 Attachment</label>
																				<input
																					type="file"
																					id="taxId2File"
																					name="taxId2File"
																					className="form-control form-control-sm"
																					accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
																					disabled={isExtend || !hasEditPermission}
																					onChange={(e) =>
																						formik_companysetup.setFieldValue(
																							"taxId2File",
																							e.target.files ? e.target.files[0] : null
																						)
																					}
																				/>
																				{formik_companysetup.values.taxId2File && typeof formik_companysetup.values.taxId2File === 'string' && (
																					<div className="mt-2 d-flex align-items-center gap-2">
																						<Typography variant="body2" color="textSecondary">
																							{getFileName(formik_companysetup.values.taxId2File) || 'Download Tax Id 2 File'}
																						</Typography>
																						<IconButton
																							color="primary"
																							size="small"
																							onClick={() =>
																								downloadFilesOnAzure(
																									formik_companysetup.values.taxId2File,
																									getFileName(formik_companysetup.values.taxId2File) || 'taxId2File.pdf',
																									atoken
																								)
																							}
																						>
																							<HiDownload />
																						</IconButton>
																					</div>
																				)}
																			</div>
																			)}

																			<div className={isTaxIdHidden ? "col-12 col-md-4 mb-4" : "col-12 col-md-6 mb-4"} style={isTaxIdHidden ? {order: 3} : {}}>

																				<TextFieldCell
																					disabled={
																						isExtend ||
																						!formik_companysetup.values.country ||
																						shouldDisableTaxIdForGST ||
																						(
																							!hasEditPermission &&
																							!(
																								isIN3 === true &&
																								istaxVerified === true &&
																								formik_companysetup.values.taxIdType?.taxType !== "UNRG"
																							)
																						)
																					}

																					id="companyName"
																					name="companyName"
																					label="Company Name *"
																					placeholder=""
																					inputProps={{ maxLength: 100 }}
																					value={formik_companysetup.values.companyName}
																					onChange={(e) => {
																						setCompanyName(e.target.value);
																						formik_companysetup.setFieldValue("companyName", e.target.value);
																					}}
																					autoComplete="off"
																					InputProps={{
																						readOnly:
																							shouldDisableTaxIdForGST ||
																							(isIN3 === true && istaxVerified === true && formik_companysetup.values.taxIdType?.taxType !== "UNRG") ||
																							(isIN3 === true && istaxVerified === true),

																						title:
																							!formik_companysetup.values.country
																								? "Select country to proceed"
																								: shouldDisableTaxIdForGST
																									? "This field is auto-filled from GST verification and cannot be edited"
																									: istaxVerified && formik_companysetup.values.taxIdType?.taxType !== "UNRG"
																										? "This field is auto-filled from tax verification"
																										: "This field is not editable",

																						endAdornment: formik_companysetup.values.companyName && (
																							<InputAdornment position="end">
																								<Typography variant="body2" color="textSecondary">
																									{formik_companysetup.values.companyName.length}/100
																								</Typography>
																							</InputAdornment>
																						),
																					}}

																					error={
																						formik_companysetup.touched.companyName &&
																						Boolean(formik_companysetup.errors.companyName)
																					}
																					helperText={
																						formik_companysetup.touched.companyName &&
																						formik_companysetup.errors.companyName
																					}
																				/>






																			</div>
																			<div className={isTaxIdHidden ? "col-12 col-md-4 mb-4" : "col-12 col-md-6 mb-4"} style={isTaxIdHidden ? {order: 4} : {}}>
																				<TextFieldCell
																					disabled={
																						isExtend ||
																						shouldDisableTaxIdForGST ||
																						(!hasEditPermission && !(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))
																					}
																					id="tradeName"
																					name="tradeName"
																					label="Trade Name"
																					placeholder=""
																					maxLength={100}
																					value={formik_companysetup.values.tradeName}
																					onChange={(e) => {
																						setTradeName(e?.target?.value);
																						formik_companysetup.setFieldValue(
																							`tradeName`,
																							e?.target?.value
																						);
																					}}
																					autoComplete="off"
																					// value={formik_companysetup.values.password}
																					// onChange={formik_companysetup.handleChange}
																					helperText={
																						formik_companysetup.touched.tradeName &&
																						formik_companysetup.errors.tradeName
																					}
																					error={
																						formik_companysetup.touched.tradeName &&
																						Boolean(formik_companysetup.errors.tradeName)
																					}
																					InputProps={{
																						readOnly:
																							(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")
																								? true
																								: false,
																						title: istaxVerified && formik_companysetup.values.taxIdType?.taxType !== "UNRG" ? "" : "",
																						endAdornment: tradeName && (
																							<InputAdornment position="end">
																								<Typography
																									variant="body2"
																									color="textSecondary"
																								>
																									{
																										formik_companysetup.values.tradeName
																											.length
																									}
																									/100
																								</Typography>
																							</InputAdornment>
																						),
																					}}
																				/>
																			</div>
																			{isIN3 == true && formik_companysetup.values.taxIdType?.taxType != "UNRG" ? (
																				<>
																					<div className="col-12 col-md-4 mb-4">
																						<TextFieldCell
																							disabled={isExtend || !hasEditPermission}
																							id="gstnStatus"
																							name="gstnStatus"
																							label="GSTN Status"
																							placeholder=""
																							maxLength={100}
																							value={
																								formik_companysetup.values.gstnStatus
																							}
																							onChange={(e) => {
																								formik_companysetup.setFieldValue(
																									"gstnStatus",
																									gstnStatus
																								);
																								setGstnStatus(e?.target?.value);
																							}}
																							InputProps={{
																								readOnly: true,
																								title: "This field is not editable",
																							}}
																						/>
																					</div>
																					<div className="col-12 col-md-4 mb-4">
																						<TextFieldCell
																							disabled={isExtend || !hasEditPermission}
																							id="eInvoiceStatus"
																							name="eInvoiceStatus"
																							label="E-Invoice Status"
																							placeholder=""
																							maxLength={100}
																							value={
																								formik_companysetup.values.eInvoiceStatus
																							}
																							onChange={(e) => {
																								seteInvoiceStatus(e?.target?.value);
																								formik_companysetup.setFieldValue(
																									`eInvoiceStatus`,
																									e?.target?.value
																								);
																							}}
																							InputProps={{
																								readOnly: true,
																								title: "This field is not editable",
																							}}
																							autoComplete="off"
																						/>
																					</div>
																					<div className="col-12 col-md-4 mb-4">
																						<TextFieldCell
																							disabled={isExtend || !hasEditPermission}
																							id="taxpayerType"
																							name="taxpayerType"
																							label="Taxpayer Type"
																							placeholder=""
																							maxLength={20}
																							value={
																								formik_companysetup.values.taxpayerType
																							}
																							onChange={(e) => {
																								formik_companysetup.setFieldValue(
																									`taxpayerType`,
																									e?.target?.value
																								);
																								setTaxpayerType(e?.target?.value);
																							}}
																							InputProps={{
																								readOnly: true,
																								title: "This field is not editable",
																							}}
																							autoComplete="off"
																						/>
																					</div>
																				</>
																			) : (
																				<></>
																			)}
																			<div className="col-12 col-md-12  mb-4" style={isTaxIdHidden ? {order: 7} : {}}>
																				<input
																					type="text"
																					className="d-none"
																					name="address"
																				/>
																				<TextFieldCell
																					disabled={
																						isExtend ||
																						shouldDisableTaxIdForGST ||
																						(!hasEditPermission && !(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG"))
																					}
																					id="address"
																					name="address"
																					label="Address"
																					placeholder=""
																					maxLength={100}
																					value={formik_companysetup.values.address}
																					onChange={(e) => {
																						setAddress(e?.target?.value);
																						formik_companysetup.setFieldValue(
																							'address',
																							e?.target?.value
																						);
																					}}
																					error={
																						formik_companysetup.touched.address &&
																						Boolean(formik_companysetup.errors.address)
																					}
																					helperText={
																						formik_companysetup.touched.address &&
																						formik_companysetup.errors.address
																					}
																					InputProps={{
																						readOnly:
																							(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")
																								? true
																								: false,
																						title: istaxVerified && formik_companysetup.values.taxIdType?.taxType !== "UNRG" ? "This field is auto-filled from tax verification" : "",
																						endAdornment: formik_companysetup.values
																							.address && (
																								<InputAdornment position="end">
																									<Typography
																										variant="body2"
																										color="textSecondary"
																									>
																										{
																											formik_companysetup.values.address
																												.length
																										}
																										/100
																									</Typography>
																								</InputAdornment>
																							),
																					}}
																				/>
																			</div>
																			<div className="col-12 col-md-4 mb-4" style={isTaxIdHidden ? {order: 5} : {}}>
																				<Autocomplete
																					disabled={
																						isExtend ||
																						shouldDisableTaxIdForGST ||
																						(!hasEditPermission && !(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")) ||
																						(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")
																					}
																					disablePortal
																					id="state"
																					name="state"
																					size="small"
																					options={state_list || []}
																					fullWidth
																					renderInput={(params) => (
																						<TextField
																							{...params}
																							InputLabelProps={{
																								shrink: true,
																							}}
																							label="State"
																						/>
																					)}
																					defaultValue={findObjByValueFromArray(
																						state_list,
																						formik_companysetup.values.state,
																						"stateName"
																					)}
																					getOptionLabel={(option) =>
																						option.stateName ?? ""
																					}
																					value={formik_companysetup.values.state}
																					onChange={(e, newvalue) => {
																						if (newvalue) {
																							//setCState(newvalue);
																							formik_companysetup.setFieldValue(
																								"state",
																								newvalue
																							);
																							handleCity(newvalue?.id, null);
																						}
																					}}
																					autoComplete="off"
																				/>
																				{formik_companysetup.touched.state &&
																					formik_companysetup.errors.state ? (
																					<div className="f10 text-danger">
																						{formik_companysetup.errors.state}
																					</div>
																				) : null}
																				{isIN3 && istaxVerified && formik_companysetup.values.taxIdType?.taxType !== "UNRG" && (
																					<div className="f10 text-info mt-1">
																					</div>
																				)}
																			</div>
																			<div className="col-12 col-md-4 mb-4" style={isTaxIdHidden ? {order: 6} : {}}>
																				<Autocomplete
																					disabled={
																						isExtend ||
																						!hasEditPermission ||
																						(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")
																					}
																					disablePortal
																					id=""
																					size="small"
																					options={city_list ?? []}
																					fullWidth
																					renderInput={(params) => (
																						<TextField
																							{...params}
																							InputLabelProps={{
																								shrink: true,
																							}}
																							label="City"
																						/>
																					)}
																					defaultValue={findObjByValueFromArray(
																						city_list,
																						city,
																						"cityName"
																					)}
																					getOptionLabel={(option) =>
																						option.cityName ?? ""
																					}
																					value={formik_companysetup.values.city}
																					onChange={(e, newvalue) => {
																						// setCity(newvalue);
																						formik_companysetup.setFieldValue(
																							"city",
																							newvalue
																						);
																					}}
																				/>
																			</div>

																			<div className="col-12 col-md-4 mb-4" style={isTaxIdHidden ? {order: 8} : {}}>
																				<input
																					type="text"
																					className="d-none"
																					name="zipCode"
																				/>
																				<TextFieldCell
																					disabled={isExtend || !hasEditPermission}
																					id="zipCode"
																					name="zipCode"
																					label="Postal Code"
																					placeholder=""
																					maxLength={6}
																					value={formik_companysetup.values.zipCode}
																					onChange={(e) => {
																						formik_companysetup.setFieldValue(
																							`zipCode`,
																							e?.target?.value
																						);
																						setZipCode(e?.target?.value);
																					}}
																					helperText={
																						formik_companysetup.touched.zipCode &&
																						formik_companysetup.errors.zipCode
																					}
																					error={
																						formik_companysetup.touched.zipCode &&
																						Boolean(formik_companysetup.errors.zipCode)
																					}
																					InputProps={{
																						readOnly:
																							(isIN3 == true && istaxVerified == true && formik_companysetup.values.taxIdType?.taxType !== "UNRG")
																								? true
																								: false,
																						title: istaxVerified && formik_companysetup.values.taxIdType?.taxType !== "UNRG" ? "This field is auto-filled from tax verification" : "",
																						endAdornment: (
																							<InputAdornment position="end">
																								<Typography
																									variant="body2"
																									color="textSecondary"
																								>
																									{
																										formik_companysetup.values.zipCode
																											?.length
																									}
																									/6
																								</Typography>
																							</InputAdornment>
																						),
																					}}
																				/>
																			</div>
																			<div className="col-12 col-md-2 mb-4" style={isTaxIdHidden ? {order: 9} : {}}>
																				<Autocomplete
																					disabled={isExtend || !hasEditPermission}
																					disablePortal
																					id=""
																					size="small"
																					options={country_list ?? []}
																					fullWidth
																					renderInput={(params) => (
																						<TextField
																							{...params}
																							InputLabelProps={{
																								shrink: true,
																							}}
																							label="Dialing Code"
																						/>
																					)}
																					defaultValue={findObjByValueFromArray(
																						country_list,
																						formik_companysetup.values.DialingCode ??
																						userdialingcode,
																						"dialingCode"
																					)}
																					getOptionLabel={(option) =>
																						option.dialingCode ?? ""
																					}
																					filterOptions={filteroptionDialingCode}
																					value={formik_companysetup.values.DialingCode}
																					onChange={(event, newValue) => {

																						setDialingCode(newValue);
																						formik_companysetup.setFieldValue(
																							"DialingCode",
																							newValue
																						);
																					}}

																				/>
																				{formik_companysetup.touched.DialingCode &&
																					formik_companysetup.errors.DialingCode ? (
																					<div className="f10 text-danger">
																						{formik_companysetup.errors.DialingCode}
																					</div>
																				) : null}

																			</div>
																			<div className="col-12 col-md-2 mb-4" style={isTaxIdHidden ? {order: 10} : {}}>
																				<input
																					type="text"
																					className="d-none"
																					name="hidden-phone"
																				/>
																				<TextFieldCell
																					disabled={isExtend || !hasEditPermission}
																					id="companyphoneNumber"
																					name="companyphoneNumber"
																					label="Company Phone"
																					placeholder=""
																					maxLength={15}
																					value={formik_companysetup.values.phoneNumber}
																					onChange={(e) => {
																						setphoneNumber(e?.target?.value);
																						formik_companysetup.setFieldValue(
																							`phoneNumber`,
																							e?.target?.value
																						);
																					}}
																					InputProps={{
																						endAdornment: (
																							<InputAdornment position="end">
																								<Typography
																									variant="body2"
																									color="textSecondary"
																								>
																									{
																										formik_companysetup.values.phoneNumber
																											?.length
																									}
																									/15
																								</Typography>
																							</InputAdornment>
																						),
																					}}
																				/>
																				{formik_companysetup.touched.phoneNumber &&
																					formik_companysetup.errors.phoneNumber ? (
																					<div className="f10 text-danger">
																						{formik_companysetup.errors.phoneNumber}
																					</div>
																				) : null}

																			</div>
																			<div className="col-12 col-md-4 mb-4" style={isTaxIdHidden ? {order: 11} : {}}>
																				<TextField
																					select
																					fullWidth
																					size="small"
																					label="MSME Registered"
																					name="msme"
																					value={formik_companysetup.values.msme || ''}
																					onChange={formik_companysetup.handleChange}
																				>
																					<MenuItem value="N">No</MenuItem>
																					<MenuItem value="Y">Yes</MenuItem>
																				</TextField>
																			</div>

																			{formik_companysetup.values.msme === 'Y' && (
																				<>


																					<div className="col-12 col-md-4 mb-4">
																						<TextFieldCell
																							disabled={isExtend || !hasEditPermission}
																							id="msmeNo"
																							name="msmeNo"
																							label="Udyam (MSME) Number"
																							placeholder="Enter Udyam Number"
																							maxLength={20}
																							value={formik_companysetup.values.msmeNo || ''}
																							onChange={(e) =>
																								formik_companysetup.setFieldValue('msmeNo', e.target.value)
																							}
																							autoComplete="off"
																						/>
																					</div>





																					<div className="col-12 col-md-4 mb-4">
																						<div className="d-flex align-items-center gap-3">
																							{/* Left label */}
																							<label htmlFor="msmeFile" className="form-label mb-0">
																								MSME Attachment :
																							</label>

																							{/* Right side choose file */}
																							<input
																								type="file"
																								id="msmeFile"
																								name="msmeFile"
																								accept="application/pdf,image/*"
																								className="form-control"
																								style={{ maxWidth: "220px" }}
																								disabled={isExtend || !hasEditPermission}
																								onChange={(e) =>
																									formik_companysetup.setFieldValue(
																										"msmeFile",
																										e.target.files ? e.target.files[0] : null
																									)
																								}
																							/>
																						</div>

																						{/* Selected / Prefilled file */}
																						{formik_companysetup.values.msmeFile && (
																							<div className="mt-2 d-flex align-items-center gap-2">
																								<Typography variant="body2" color="textSecondary">
																									{typeof formik_companysetup.values.msmeFile === "string"
																										? getFileName(formik_companysetup.values.msmeFile)
																										: formik_companysetup.values.msmeFile.name}
																								</Typography>

																								{typeof formik_companysetup.values.msmeFile === "string" && (
																									<IconButton
																										color="primary"
																										size="small"
																										onClick={() =>
																											downloadFilesOnAzure(
																												formik_companysetup.values.msmeFile,
																												getFileName(formik_companysetup.values.msmeFile),
																												atoken
																											)
																										}
																									>
																										<HiDownload />
																									</IconButton>
																								)}
																							</div>
																						)}
																					</div>

																					<div className="col-12 col-md-4 mb-4">
																						<TextFieldCell
																							disabled={isExtend || !hasEditPermission}
																							id="cinNo"
																							name="cinNo"
																							label="CIN Number"
																							placeholder="Enter CIN Number"
																							maxLength={21}
																							value={formik_companysetup.values.cinNo || ''}
																							onChange={(e) =>
																								formik_companysetup.setFieldValue('cinNo', e.target.value)
																							}
																							autoComplete="off"
																						/>
																					</div>






																				</>
																			)}
																		</div>
																	</Box>
																</div>
															</form>
														</div>

													) : (
														<Box sx={{ flexGrow: 1, p: 2 }}>
															<Alert severity="warning">
																You don't have permission to view Supplier Details.
															</Alert>
														</Box>
													)}
												</>
											);
										})()}
									</>
								) : (
									<></>
								)}
								{value == 1 ? (
									<>
										{/* Permission variables for Supplier Users tab*/}
										{(() => {

											const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.READ) ?? false;
											const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.EDIT) ?? false;
											const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.CREATE) ?? false;
											const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_USERS, ACTIONS.REMOVE) ?? false;

											return (
												<>
													{hasReadPermission ? (
														<>
															<div className="p-3 ps-2 pe-2 customer-fix" style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(103vh - 300px)' }}>
																<div className="row mt-2">
																	<Formik
																		innerRef={formikPrimaryContactRef}
																		enableReinitialize={true}
																		initialValues={suppliersContact}
																		validationSchema={validationSchemaprimarycontact}
																		onSubmit={(values) => {


																			registerSupplierUsers(values);
																		}}
																	>
																		{({ values, setFieldValue, errors, touched }) => (
																			<Form>
																				<FieldArray name="vendorPrimaryContact">
																					{({ remove, push }) => (
																						<div>
																							{values.vendorPrimaryContact.map(
																								(contact, index) => (
																									<>
																										{index == 1 && (
																											<div className="col-12 mb-3">
																												<Divider
																													textAlign="center"
																													light
																												>
																													Additional Users
																												</Divider>
																											</div>
																										)}
																										<div
																											className="row align-items-center"
																											key={index}
																										>
																											<div className="col-lg-3 col-12 mb-3">
																												<TextField
																													variant="outlined"
																													fullWidth
																													InputLabelProps={{
																														shrink: true,
																													}}
																													id={`Email-${index}`}
																													label="Official Email *"
																													value={contact.Email}
																													size="small"
																													name="Email"
																													onChange={(e) =>
																														handleInputChangePrimary(
																															e,
																															index,
																															setFieldValue
																														)
																													}
																													disabled={contact.id || !hasEditPermission}
																													error={Boolean(
																														touched
																															.vendorPrimaryContact?.[
																															index
																														]?.Email &&
																														errors
																															.vendorPrimaryContact?.[
																															index
																														]?.Email
																													)}
																													helperText={
																														touched
																															.vendorPrimaryContact?.[
																															index
																														]?.Email &&
																														errors
																															.vendorPrimaryContact?.[
																															index
																														]?.Email
																													}
																												/>
																											</div>
																											<div className="col-lg-3 col-12 mb-3">
																												<TextField
																													variant="outlined"
																													fullWidth
																													InputLabelProps={{
																														shrink: true,
																													}}
																													id={`ContactPerson-${index}`}
																													label="Contact Person"
																													value={contact.ContactPerson}
																													size="small"
																													name="ContactPerson"
																													disabled={!hasEditPermission}
																													error={Boolean(errors.vendorPrimaryContact?.[index]?.ContactPerson)}
																													helperText={errors.vendorPrimaryContact?.[index]?.ContactPerson}
																													onChange={(e) =>
																														handleInputChangePrimary(
																															e,
																															index,
																															setFieldValue
																														)
																													}
																													InputProps={{
																														endAdornment: contact.ContactPerson && (
																															<InputAdornment position="end">
																																<Typography
																																	variant="body2"
																																	color="textSecondary"
																																>
																																	{
																																		contact.ContactPerson
																																			.length
																																	}
																																	/50
																																</Typography>
																															</InputAdornment>
																														),
																													}}
																													inputProps={{
																														maxLength: 50, // Set the max length here
																													}}
																												/>
																											</div>
																											<div className="col-12 col-md-4 mb-4 mt-2">
																												<Autocomplete
																													multiple
																													disablePortal
																													id={`supplierUserCategories-${index}`}
																													size="small"
																													options={[...category_list, { id: "new", itemCategory: "Add New" }]}
																													fullWidth
																													getOptionLabel={(option) => option.itemCategory || ""}
																													value={contact.categories || []}
																													onChange={(event, newValue) =>
																														handleContactCategoryChange(event, newValue, index, setFieldValue)
																													}
																													onBlur={() =>
																														setFieldValue(
																															`vendorPrimaryContact.${index}.categories`,
																															contact.categories || []
																														)
																													}
																													filterSelectedOptions
																													renderInput={(params) => (
																														<TextField
																															{...params}
																															label="Item/Service Category *"
																															error={Boolean(
																																touched.vendorPrimaryContact?.[index]?.categories &&
																																errors.vendorPrimaryContact?.[index]?.categories
																															)}
																															helperText={
																																touched.vendorPrimaryContact?.[index]?.categories &&
																																errors.vendorPrimaryContact?.[index]?.categories
																															}
																														/>
																													)}
																													renderOption={(props, option) => (
																														<Box
																															component="li"
																															{...props}
																															style={
																																option.id === "new"
																																	? { fontStyle: "italic", color: "blue", cursor: "pointer" }
																																	: {}
																															}
																														>
																															{option.itemCategory}
																														</Box>
																													)}
																												/>
																											</div>
																											<div className="col-12 col-md-4 mb-4 pe-0">
																												<Autocomplete
																													id={`TimeZone-${index}`}
																													name="TimeZone"
																													size="small"
																													options={timezone_list ?? []}
																													fullWidth
																													getOptionLabel={(option) => option?.timezonelong ?? ""}
																													value={contact.TimeZone}
																													disabled={!hasEditPermission}
																													onChange={(event, newValue) =>
																														handleAutocompleteChange(
																															newValue,
																															"TimeZone",
																															index,
																															setFieldValue
																														)
																													}
																													renderInput={(params) => (
																														<TextField
																															{...params}
																															InputLabelProps={{
																																shrink: true,
																															}}
																															label="Preferred Time/Zone *"
																															error={
																																touched.vendorPrimaryContact?.[index]?.TimeZone &&
																																Boolean(errors.vendorPrimaryContact?.[index]?.TimeZone)
																															}
																															helperText={
																																touched.vendorPrimaryContact?.[index]?.TimeZone &&
																																errors.vendorPrimaryContact?.[index]?.TimeZone
																															}
																														/>
																													)}
																												/>
																											</div>

																											<div className="col-lg-6 col-12 mb-3 pe-4">
																												<div className="row">

																													<div className="col-md-3">
																														<Autocomplete
																															id={`DialingCode-${index}`}
																															size="small"
																															className="w-120"
																															options={country_list ?? []}
																															fullWidth
																															getOptionLabel={(option) => option.dialingCode ?? ""}
																															filterOptions={filteroptionDialingCode}
																															value={contact.DialingCode} // Bind value to the DialingCode field
																															onChange={(event, newValue) =>
																																handleAutocompleteChange(newValue, "DialingCode", index, setFieldValue)
																															}
																															disabled={!hasEditPermission}
																															renderInput={(params) => (
																																<TextField
																																	{...params}
																																	InputLabelProps={{
																																		shrink: true,
																																	}}
																																	label="Dialing Code" // Add * for mandatory indication
																																	error={Boolean(
																																		touched.vendorPrimaryContact?.[index]?.DialingCode &&
																																		errors.vendorPrimaryContact?.[index]?.DialingCode
																																	)}
																																	helperText={
																																		touched.vendorPrimaryContact?.[index]?.DialingCode &&
																																		errors.vendorPrimaryContact?.[index]?.DialingCode
																																	}
																																	sx={{
																																		'& .MuiFormHelperText-root': {
																																			width: '108%',
																																			marginLeft: "0px" // Optional: prevent it from overflowing
																																		},
																																	}}
																																/>
																															)}
																														/>
																													</div>

																													<div className="col-md-4">
																														<TextField
																															variant="outlined"
																															fullWidth
																															InputLabelProps={{
																																shrink: true,
																															}}
																															id={`PhoneNumber-${index}`}
																															label="Official Contact Number"
																															value={contact.PhoneNumber}
																															size="small"
																															name="PhoneNumber"
																															className="ms-3 customPhoneNumber"
																															disabled={!hasEditPermission}
																															onChange={(e) => {
																																let value = e.target.value.replace(/[^0-9]/g, '');

																																const dialingCode =
																																	contact.DialingCode?.dialingCode ||
																																	contact.DialingCode?.code ||
																																	contact.DialingCode?.label;

																																const maxLength =
																																	dialingCode === "+91" || dialingCode === "+1" ? 10 : 15;

																																value = value.slice(0, maxLength);

																																setFieldValue(
																																	`vendorPrimaryContact.${index}.PhoneNumber`,
																																	value
																																);
																																// ✅ ALSO update suppliersContact (THIS WAS MISSING)
																																setSupplierContact(prev => ({
																																	...prev,
																																	vendorPrimaryContact: prev.vendorPrimaryContact.map((c, i) =>
																																		i === index
																																			? { ...c, PhoneNumber: value }
																																			: c
																																	)
																																}));
																															}}
																															InputProps={{
																																endAdornment: contact.PhoneNumber && (
																																	<InputAdornment position="end">
																																		<Typography variant="body2" color="textSecondary">
																																			{contact.PhoneNumber.length}/
																																			{(contact.DialingCode?.dialingCode === "+91" ||
																																				contact.DialingCode?.code === "+91" ||
																																				contact.DialingCode?.label === "+91" ||
																																				contact.DialingCode?.dialingCode === "+1" ||
																																				contact.DialingCode?.code === "+1" ||
																																				contact.DialingCode?.label === "+1")
																																				? 10
																																				: 15}
																																		</Typography>
																																	</InputAdornment>
																																),
																															}}
																															inputProps={{
																																pattern: '[0-9]*',
																																inputMode: 'numeric',
																															}}
																															error={Boolean(
																																touched.vendorPrimaryContact?.[index]?.PhoneNumber &&
																																errors.vendorPrimaryContact?.[index]?.PhoneNumber
																															)}
																															helperText={
																																touched.vendorPrimaryContact?.[index]?.PhoneNumber &&
																																errors.vendorPrimaryContact?.[index]?.PhoneNumber
																															}
																														/>
																													</div>

																												</div>


																											</div>

																											{/* Item/Service Category - positioned next to TimeZone */}
																											{/* <div className="col-12 col-md-4 mb-4">
																					<Autocomplete
  multiple
  disablePortal
  id={`supplierUserCategories-${index}`}
  size="small"
//   options={[
//     ...(CategoryList || []),
//     { id: "new", itemCategory: "Add New" }
//   ]}
  options={[ ...category_list,  { id: "new", itemCategory: "Add New" }, ]}
  fullWidth
  renderInput={(params) => (
    <TextField {...params} label="Item/Service Category *" />
  )}
  getOptionLabel={(option) => option.itemCategory || ""}
  value={contact.categories || []}
  onChange={(event, newValue) =>
    handleContactCategoryChange(event, newValue, index, setFieldValue)
  }
  filterSelectedOptions
  renderOption={(props, option) => (
    <Box
      component="li"
      {...props}
      style={
        option.id === "new"
          ? { fontStyle: "italic", color: "blue", cursor: "pointer" }
          : {}
      }
    >
      {option.itemCategory}
    </Box>
  )}
/>

																							</div> */}


																											<div className="col-lg-2 col-12 mb-3 d-flex align-items-start pt-2 gap-1">
																												{values.vendorPrimaryContact
																													.length > 1 && (
																														<IconButton
																															onClick={() =>
																																handleRemoveContact(remove, index)
																															}
																															size="small"
																															color="error"
																															edge="start"
																															sx={{ mr: 0 }}
																															disabled={!hasRemovePermission}
																														>
																															<HiOutlineX className="f16 text-danger" />
																														</IconButton>
																													)}
																												{values.vendorPrimaryContact
																													.length -
																													1 ===
																													index &&
																													hasCreatePermission && !isExtendModeActive && (
																														<Button
																															disabled={false}
																															variant="text"
																															size="Medium"
																															className="text-capitalize text-primary font-normal"
																															onClick={() => handleAddContact(push)}
																														>
																															+ Add More
																														</Button>
																													)}
																											</div>
																											<div className="col-12 mb-4 d-flex justify-content-end">
																												<FormGroup row fullWidth>
																													<FormControlLabel
																														control={
																															<Checkbox
																																name="isActive"
																																id={`isActive-${index}`}
																																checked={
																																	contact.isActive
																																}
																																disabled={!hasEditPermission}
																																onChange={(e) => {
																																	setFieldValue(
																																		`vendorPrimaryContact.${index}.isActive`,
																																		e.target.checked
																																	);
																																	// Also update suppliersContact state
																																	setSupplierContact(prevState => ({
																																		...prevState,
																																		vendorPrimaryContact: prevState.vendorPrimaryContact.map((contact, i) =>
																																			i === index
																																				? { ...contact, isActive: e.target.checked }
																																				: contact
																																		)
																																	}));
																																}}
																															/>
																														}
																														label={
																															<span className="f14 muted">
																																Active
																															</span>
																														}
																													/>
																												</FormGroup>
																												{/* <FormGroup row fullWidth>
																													<FormControlLabel
																														control={
																															<Checkbox
																																name="isPrimary"
																																id={`isPrimary-${index}`}
																																checked={
																																	contact.isPrimary
																																}
																																disabled={!hasEditPermission}
																																onChange={(e) =>
																																	setFieldValue(
																																		`vendorPrimaryContact.${index}.isPrimary`,
																																		e.target.checked
																																	)
																																	
																																}
																															/>
																														}
																														label={
																															<span className="f14 muted">
																																Admin
																															</span>
																														}
																													/>
																	
																												</FormGroup> */}
																												<FormGroup row fullWidth>
																													<FormControlLabel
																														control={
																															<Checkbox
																																name="isPrimary"
																																id={`isPrimary-${index}`}
																																checked={contact.isPrimary}
																																disabled={!hasEditPermission}
																																onChange={(e) => {
																																	const value = e.target.checked;

																																	// ✅ Update Formik
																																	setFieldValue(`vendorPrimaryContact.${index}.isPrimary`, value);

																																	// ✅ Update suppliersContact state immediately
																																	setSupplierContact(prev => ({
																																		...prev,
																																		vendorPrimaryContact: prev.vendorPrimaryContact.map((c, i) =>
																																			i === index ? { ...c, isPrimary: value } : c
																																		)
																																	}));
																																}}
																															/>
																														}
																														label={<span className="f14 muted">Admin</span>}
																													/>
																												</FormGroup>


																											</div>

																										</div>
																									</>
																								)
																							)}
																							<div className="mt-3 text-start">
																								<span style={{ fontSize: '13px', color: 'red', fontWeight: 400 }}>
																									*All provided information, including the contact number is required to enable text notifications.
																								</span>
																							</div>
																						</div>
																					)}
																				</FieldArray>
																			</Form>
																		)}
																	</Formik>
																</div>
															</div>
														</>
													) : (
														<Box sx={{ flexGrow: 1, p: 2 }}>
															<Alert severity="warning">
																You don't have permission to view Supplier Users.
															</Alert>
														</Box>
													)}
												</>
											);
										})()}
									</>
								) : (
									<></>
								)}

								{value == 2 ? (
									<>
										{/* Permission variables for Supplier Qualification tab */}
										{(() => {
											const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.READ) ?? false;
											const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.EDIT) ?? false;
											const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.CREATE) ?? false;
											const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_QUALIFICATION, ACTIONS.REMOVE) ?? false;

											return (
												<>





													{hasReadPermission ? (
														<div>
															{isEditing ? (<>
																<div className="col-md-12 d-flex justify-content-between align-items-center mb-4">
																	<Button
																		variant="text"
																		onClick={handleBackButtonClick}
																		startIcon={<ArrowBackIcon />}
																		className="text-primary f9 text-capitalize"
																	>

																	</Button>

																	<div className="d-flex align-items-center gap-3">
																		<div>
																			<span className="qualified-label">Qualified Score:</span>
																			<span className="qualified-badge">{scores}</span>
																		</div>



																		{/* <div>
														<span className="f13 fw500 me-1 text-muted">Qualified Score:</span>
														<span className="f14 fw500 me-3 text-primary">{scores}</span>
													</div> */}
																	</div>
																</div>
																<div className="d-flex flex-column custom-fix pt-0">
																	<div className="mx-2">
																		{/* Tabs for Supplier Qualification */}
																		<Box sx={{ width: '100%' }}>
																			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
																				<Tabs value={tabValue} onChange={handleTabChange} aria-label="supplier qualification tabs">
																					<Tab label="📋 Supplier Qualification Details" />
																					<Tab label="Add Questions" />
																					{/* <Tab label="Preview" /> */}
																				</Tabs>
																			</Box>															{/* Tab 1: Supplier Qualification Details */}
																			<TabPanel value={tabValue} index={0}>
																				<form onSubmit={formik_SQE.handleSubmit}>
																					{/* First Row: Subject, End Date, Item/Service Category, and Frequency */}
																					<div className="row mb-4">
																						<div className="col-12 col-md-3 mb-3">
																							<TextFieldCell
																								id="vqSubject"
																								name="vqSubject"
																								label="Subject *"
																								placeholder=""
																								maxLength={100}
																								className="f14"
																								InputProps={{
																									readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission,
																									title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																									endAdornment: (
																										<InputAdornment position="end">
																											<Typography
																												variant="body2"
																												color="textSecondary"
																												className="f12"
																											>
																												{formik_SQE?.values?.vqSubject?.length}/100
																											</Typography>
																										</InputAdornment>
																									),
																								}}
																								value={formik_SQE?.values?.vqSubject}
																								onChange={(e) => {
																									formik_SQE.setFieldValue("vqSubject", e.target.value);
																								}}
																								error={
																									formik_SQE?.touched?.vqSubject &&
																									Boolean(formik_SQE.errors?.vqSubject)
																								}
																								helperText={
																									formik_SQE.touched?.vqSubject &&
																									formik_SQE.errors?.vqSubject
																								}
																								disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																							/>
																						</div>
																						<div className="col-12 col-md-3 mb-3">
																							<LocalizationProvider dateAdapter={AdapterDayjs}>
																								<MobileDateTimePicker
																									variant="outlined"
																									label="End Date *"
																									size="small"
																									name="vqEndDate"
																									id="vqEndDate"
																									value={formik_SQE?.values?.vqEndDate ?? null}
																									className="w-100 f14"
																									slotProps={{
																										textField: {
																											variant: "outlined",
																											size: "small",
																											className: "f14",
																											InputLabelProps: { shrink: true },
																											error:
																												formik_SQE.touched.vqEndDate &&
																												Boolean(formik_SQE.errors.vqEndDate),
																											helperText:
																												formik_SQE.touched.vqEndDate &&
																												formik_SQE.errors.vqEndDate,
																											InputProps: {
																												title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																											}
																										},
																										actionBar: {
																											actions: ["clear", "cancel", "accept"],
																										},
																									}}
																									onChange={handleDateChange}
																									disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																								/>
																							</LocalizationProvider>
																						</div>
																						<div className="col-12 col-md-3 mb-3">
																							<Autocomplete
																								limitTags={1}
																								multiple
																								disablePortal
																								id=""
																								size="small"
																								options={filteredOptions}
																								fullWidth
																								renderInput={(params) => (
																									<TextField
																										{...params}
																										InputLabelProps={{
																											shrink: true,
																										}}
																										label="Item/Service Category"
																										InputProps={{
																											...params.InputProps,
																											title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																										}}
																									/>
																								)}
																								InputProps={{
																									readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission,
																									title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																								}}
																								// getOptionLabel={(option) => option.categoryName}
																								getOptionLabel={(option) => option.categoryName || option.itemCategory || ""}

																								value={formik_SQE.values.sqeServiceCategory ?? []}
																								onChange={handleChangeItemCategory}
																								filterSelectedOptions
																								renderOption={(props, option) => (
																									<Box component="li" {...props}>
																										{option.categoryName || option.itemCategory}
																									</Box>
																								)}

																								// renderOption={(props, option) => (
																								// 	<Box
																								// 		component="li"
																								// 		{...props}
																								// 	>
																								// 		{option.categoryName}
																								// 	</Box>
																								// )}
																								disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																							/>
																						</div>
																						<div className="col-12 col-md-3 mb-3">
																							<TextField
																								id="frequency"
																								name="frequency"
																								select
																								className="w-100 f14"
																								size="small"
																								label="Frequency"
																								variant="outlined"
																								value={formik_SQE?.values?.frequency || ''}
																								onChange={handleFrequencyChange}
																								InputProps={{
																									readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission,
																									title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																								}}
																								disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																							>
																								<MenuItem value={30}>Monthly</MenuItem>
																								<MenuItem value={90}>Quarterly</MenuItem>
																								<MenuItem value={120}>Half-yearly</MenuItem>
																								<MenuItem value={0}>Custom Period</MenuItem>
																							</TextField>
																						</div>

																						{/* Custom Period field in a new row if needed */}
																						{isCustomPeriod && (
																							<div className="col-12 col-md-3 mb-3">
																								<TextField
																									id="customFrequency"
																									name="customFrequency"
																									type="number"
																									className="w-100 f14"
																									size="small"
																									label="Custom Frequency (days)"
																									variant="outlined"
																									value={formik_SQE?.values?.frequency || ''}
																									onChange={handleCustomFrequencyChange}
																									InputProps={{
																										readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission,
																										title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																									}}
																									disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																								/>
																							</div>
																						)}
																					</div>

																					{/* Second Row: Description */}
																					<div className="row mb-4">
																						<div className="col-12 mb-3">
																							<TextFieldCell
																								id="vqDescription"
																								name="vqDescription"
																								label="Description *"
																								placeholder=""
																								maxLength={1000}
																								multiline
																								rows={4}
																								InputProps={{
																									readOnly: currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission,
																									title: ((currentVQStage == "Under Approval" || currentVQStage == "Qualified") && "This field is not editable") || (!hasEditPermission && "You don't have permission to edit this field"),
																									endAdornment: formik_SQE?.values?.vqDescription && (
																										<InputAdornment position="end">
																											<Typography variant="body2" color="textSecondary">
																												{formik_SQE?.values?.vqDescription?.length}/1000
																											</Typography>
																										</InputAdornment>
																									),
																								}}
																								value={formik_SQE?.values?.vqDescription}
																								onChange={(e) => {
																									// Enforce the maxLength of 1000
																									if (e.target.value.length <= 1000) {
																										formik_SQE.setFieldValue("vqDescription", e.target.value);
																									}
																								}}
																								error={
																									formik_SQE.touched.vqDescription &&
																									Boolean(formik_SQE.errors.vqDescription)
																								}
																								helperText={
																									formik_SQE.touched.vqDescription && formik_SQE.errors.vqDescription
																								}
																								readOnly={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																								disabled={currentVQStage == "Under Approval" || currentVQStage == "Qualified" || !hasEditPermission}
																							/>
																						</div>
																					</div>
																				</form>
																			</TabPanel>

																			{/* Tab 2: Add Questions */}
																			<TabPanel value={tabValue} index={1} noPadding>
																				{/* Debug info for EventQuestionScreen */}
																			

																				{sqe && Number(sqe) > 0 ? (
																					<EventQuestionScreen
																						key={`vq-${sqe}-${selectedQuesionArray?.length || 0}`} // Force re-render when questions change
																						props={{
																							eventid: Number(sqe), // Ensure it's a number
																							vqHeaderId: sqeHeaderId, // VQ Header ID for API calls
																							vendorId: pageslug, // Add vendorId for API calls
																							customerId: customerid, // Customer ID for API calls
																							eventtype: "VQ",
																							librarytype: "QuestionLibrary",
																							action: currentVQStage == "Draft" ? true : false,
																							questionresponses: SqeList, // Pass full VQ data for supplier responses
																							currentStage: currentVQStage, // Pass current VQ stage for score input control
																							Version: 1,
																							companyName: formik_companysetup?.values.companyName,
																							CallbackSelectedQuestionList: CallbackSelectedQuestionList,
																							handleAddQuestionToVQ: handleAddQuestionToVQ, // Custom handler for adding questions
																							onSaveQuestion: handleAddQuestionToVQ, // Explicit save handler
																							apiEndpoint: "/api/SQE/AddQuestion", // Explicit API endpoint
																							token: atoken, // Authentication token
																							callback: () => {
																								navigate("/manage/manage-participants");
																							},
																							onAddQuestionFromLibrary: handleAddQuestionFromLibrary,
																							permissionManager: permissionManager
																						}}
																						ref={EventQuestionScreenRef}
																					/>
																				) : (
																					<div className="p-4 text-center">
																						<p className="text-muted">Please select a VQ from the list or create a new one to add questions.</p>
																					</div>
																				)}
																			</TabPanel>

																			{/* Tab 3: Preview & Submit */}
																			<TabPanel value={tabValue} index={2}>
																				<Box sx={{ p: 3 }}>
																					<Typography
																						sx={{
																							mb: 3,
																							color: '#1976d2',
																							fontWeight: 400,
																							fontSize: '14px' // set font size to 14px
																						}}
																					>
																						📝 Qualification Summary
																					</Typography>


																					{/* VQ Details Summary */}
																					<Card sx={{ mb: 3, boxShadow: 2 }}>
																						<CardHeader
																							title="Supplier Qualification Details"
																							sx={{ backgroundColor: '#ffffff', py: 1.5 }}
																							titleTypographyProps={{
																								fontSize: '14px',
																								fontWeight: 400,
																								color: 'inherit'
																							}}
																						/>

																						<CardContent>
																							<div className="row">
																								<div className="col-md-6 mb-3">
																									<Typography variant="body2" color="textSecondary"><strong>Subject:</strong></Typography>
																									<Typography variant="body1">{formik_SQE?.values?.vqSubject || 'Not specified'}</Typography>
																								</div>
																								<div className="col-md-6 mb-3">
																									<Typography variant="body2" color="textSecondary"><strong>End Date:</strong></Typography>
																									<Typography variant="body1">
																										{formik_SQE?.values?.vqEndDate
																											? dayjs(formik_SQE.values.vqEndDate).format('MMM DD, YYYY hh:mm A')
																											: 'Not specified'
																										}
																									</Typography>
																								</div>
																								<div className="col-md-6 mb-3">
																									<Typography variant="body2" color="textSecondary"><strong>Item/Service Category:</strong></Typography>
																									<Typography variant="body1">
																										{formik_SQE?.values?.sqeServiceCategory?.length > 0
																											? formik_SQE.values.sqeServiceCategory.map(cat => cat.categoryName || cat.itemCategory).join(', ')
																											: 'Not specified'
																										}
																									</Typography>
																								</div>
																								<div className="col-md-6 mb-3">
																									<Typography variant="body2" color="textSecondary"><strong>Frequency:</strong></Typography>
																									<Typography variant="body1">
																										{formik_SQE?.values?.frequency === 30 ? 'Monthly' :
																											formik_SQE?.values?.frequency === 90 ? 'Quarterly' :
																												formik_SQE?.values?.frequency === 120 ? 'Half-yearly' :
																													formik_SQE?.values?.frequency > 0 ? `${formik_SQE.values.frequency} days` :
																														'Not specified'
																										}
																									</Typography>
																								</div>
																								<div className="col-12">
																									<Typography variant="body2" color="textSecondary"><strong>Description:</strong></Typography>
																									<Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
																										{formik_SQE?.values?.vqDescription || 'Not specified'}
																									</Typography>
																								</div>
																							</div>
																						</CardContent>
																					</Card>

																					{/* Questions Summary */}
																					<Card sx={{ mb: 3, boxShadow: 2 }}>
																						<CardHeader
																							title={`Questions (${questionlist?.length || 0})`}
																							sx={{ backgroundColor: '#ffffff', py: 1.5 }}
																							titleTypographyProps={{
																								fontSize: '14px',
																								fontWeight: 400,
																								color: 'inherit'
																							}}
																						/>

																						<CardContent>
																							{questionlist && questionlist.length > 0 ? (
																								<div className="table-responsive">
																									<table className="table table-sm">
																										<thead>
																											<tr>
																												<th style={{ width: '50px' }}>#</th>
																												<th>Question</th>
																												<th style={{ width: '100px' }}>Category</th>
																												<th style={{ width: '80px' }}>Mandatory</th>
																												<th style={{ width: '80px' }}>Weightage</th>
																											</tr>
																										</thead>
																										<tbody>
																											{questionlist.map((question, index) => (
																												<tr key={index}>
																													<td>{index + 1}</td>
																													<td>{question.questionDescription}</td>
																													<td><span className="badge bg-secondary">{question.questionCategory || 'N/A'}</span></td>
																													<td>
																														{question.mandatory ?
																															<span className="badge bg-danger">Yes</span> :
																															<span className="badge bg-success">No</span>
																														}
																													</td>
																													<td>{question.weightage || 0}</td>
																												</tr>
																											))}
																										</tbody>
																									</table>
																								</div>
																							) : (
																								<Alert severity="info">No questions added yet. Go to "Add Questions" tab to add questions.</Alert>
																							)}
																						</CardContent>
																					</Card>


																				</Box>
																			</TabPanel>
																		</Box>

																	</div>
																</div>

															</>) : (<>
																<div className="row">
																	<div className="col-md-12 d-flex justify-content-end">
																		{hasCreatePermission && (
																			<Button variant="text" size="small" className="text-capitalize text-primary font-normal" onClick={handleAddClickSupplier}> + Add New</Button>
																		)}
																	</div>

																	{/* Debug info for VQ DataGrid */}

																	<div className="data-grid-wrapper" style={{ height: 400, overflowY: 'auto' }}>
																		<DataGrid
																			rows={SqeList}
																			getRowId={(row) => row.id}
																			columns={columns}
																			rowHeight={40}
																			columnHeaderHeight={40}
																			className="f13 border-0 consistent-datagrid"
																			disableRowSelectionOnClick
																			slots={{ toolbar: GridToolbar }}
																			onRowClick={handleRowClick}
																			slotProps={{
																				toolbar: {
																					showQuickFilter: true,
																				},
																			}}

																		/>
																	</div>

																</div>
															</>)}
														</div>
													) : (
														<Box sx={{ flexGrow: 1, p: 2 }}>
															<Alert severity="warning">
																You don't have permission to view Supplier Qualification.
															</Alert>
														</Box>
													)}
												</>
											);
										})()}
									</>
								) : (
									<></>
								)}




								{value == 3 && (
									<QueryList
										pageSlug={pageSlug}
										key={"QueryList"}
										accessLevel={accessLevel}
										fromEventPage={true}
										EventId={pageSlug}
									/>
								)}
							</div>
						</div>
					</div>

					{/* Right Content Area for Approval Workflow */}
					{approvershow && accessLevel?.workflow?.readed != 'None' && !(value === 2 && !sqeHeaderId) && (
						<div className="rightContent col-3 h-100">
							<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3 right-panel-container" style={{ maxHeight: '100%', overflow: 'hidden' }}>
								<div className="d-flex flex-column" style={{ height: '100%', maxHeight: '100%' }}>
									<div className="d-flex justify-content-between align-items-center border-bottom py-1 flex-shrink-0">
										<h6 className="page-heading text-dark-blue ms-2 mb-0">Approval Workflow</h6>
										<IconButton
											onClick={() => handleApprover(false)}
											size="small"
											className="text-muted"
										>
											<CloseIcon fontSize="small" />
										</IconButton>
									</div>
									<div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
										{/* VI (invited-participants) case */}
										{pathname.includes("invited-participants") && (
											<EventApprovalBox
												requestCell={requestVICell}
												handleEventAppList={handleEventAppList}
												wfupdate={wfupdate}
												action={stagearray.includes(currentStage)}
												stagelist={stageVIlist}
												permissionManager={permissionManager}
											/>
										)}

										{/* QR case */}
										{!pathname.includes("invited-participants") && value !== 2 && (
											<EventApprovalBox
												requestCell={requestCell}
												handleEventAppList={handleEventAppList}
												wfupdate={wfupdate}
												action={stagearray.includes(currentStage)}
												stagelist={stagelist}
												permissionManager={permissionManager}
											/>
										)}

										{/* VQ case */}
										{value === 2 && sqe && (
											<EventApprovalBox
												requestCell={requestVQCell}
												handleEventAppList={handleEventAppList}
												wfupdate={wfupdate}
												action={stagearray.includes(currentVQStage)}
												stagelist={vqStagelist}
												permissionManager={permissionManager}
											/>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</form>

			{/* Modals and Drawers */}
			<React.Fragment key="key2">
				<Drawer
					anchor="right"
					open={state["addBankDrawer"]}
				// onClose={toggleDrawer('addProductDrawer', false)}
				>
					<form onSubmit={formikBank.handleSubmit}>
						<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">
											Bank Details
										</div>
										<div>
											<IconButton
												onClick={toggleDrawer("addBankDrawer", false)}
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
									{(() => {
										// Local permission variables for Bank Details
										const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false;
										const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false;
										const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false;
										const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.REMOVE) ?? false;

										return (
											<>
												{permissionManager && (
													<div className="pb-0">
														{/* <Alert severity="info" className="mb-3">
															<div className="d-flex align-items-center">
																<PersonOutlined className="me-2" />
																Bank Details permissions:
																{hasReadPermission && <span className="badge bg-success ms-1">Read</span>}
																{hasEditPermission && <span className="badge bg-warning ms-1">Edit</span>}
																{hasCreatePermission && <span className="badge bg-primary ms-1">Create</span>}
																{hasRemovePermission && <span className="badge bg-danger ms-1">Remove</span>}
															</div>
														</Alert> */}
													</div>
												)}
												{hasReadPermission ? (
													<>
														{hasCreatePermission && !activityType && (
															<>
																<div className="row mt-2">
																	<div className="col-12 col-md-6 mb-4">
																		<TextFieldCell
																			id="accountHolderName"
																			name="accountHolderName"
																			label="Account Holder Name *"
																			placeholder=""
																			maxLength={100} // Set max length to 100 characters
																			disabled={true}
																			value={accounHolderName}
																			onChange={handleHolderNameChange}
																			InputProps={{
																				endAdornment: accounHolderName && (
																					<InputAdornment position="end">
																						<Typography
																							variant="body2"
																							color="textSecondary"
																						>
																							{
																								formikBank.values.accounHolderName
																									.length
																							}
																							/100
																						</Typography>
																					</InputAdornment>
																				),
																			}}
																		/>
																		{formikBank.errors.accounHolderName &&
																			formikBank.touched.accounHolderName && (
																				<div
																					className="error error-red f9"
																				>
																					{formikBank.errors.accounHolderName}
																				</div>
																			)}
																	</div>

																	<div className="col-12 col-md-6 mb-4">
																		<TextFieldCell
																			id="bankName"
																			name="bankName"
																			label="Name of Bank *"
																			placeholder=""
																			maxLength={100}
																			disabled={!hasEditPermission}
																			value={bankName}
																			onChange={handleBankNameChange}
																			InputProps={{
																				endAdornment: bankName && (
																					<InputAdornment position="end">
																						<Typography
																							variant="body2"
																							color="textSecondary"
																						>
																							{
																								formikBank.values.bankName
																									.length
																							}
																							/100
																						</Typography>
																					</InputAdornment>
																				),
																			}}
																		/>
																		{formikBank.errors.bankName &&
																			formikBank.touched.bankName && (
																				<div
																					className="error error-red f9"
																				>
																					{formikBank.errors.bankName}
																				</div>
																			)}
																	</div>

																	<div className="col-12 col-md-6 mb-3">
																		<TextFieldCell
																			id="bankAccountNumber"
																			name="bankAccountNumber"
																			label="Bank A/c No *"
																			placeholder=""
																			maxLength={15}
																			disabled={!hasEditPermission}
																			value={bankAccountNumber}
																			onChange={handleAccountChange}
																			InputProps={{
																				endAdornment: bankAccountNumber && (
																					<InputAdornment position="end">
																						<Typography
																							variant="body2"
																							color="textSecondary"
																						>
																							{
																								formikBank.values.bankAccountNumber
																									.length
																							}
																							/15
																						</Typography>
																					</InputAdornment>
																				),
																			}}
																		/>
																		{formikBank.errors.bankAccountNumber &&
																			formikBank.touched.bankAccountNumber && (
																				<div
																					className="error error-red f9"
																				>
																					{formikBank.errors.bankAccountNumber}
																				</div>
																			)}
																	</div>

																	<div className="col-12 col-md-6 mb-3">
																		<TextFieldCell
																			id="bankRoutingNumber"
																			name="bankRoutingNumber"
																			label={(formik_companysetup?.values?.country?.countryKey === 'IN' ? 'IFSC Code *' : 'SWIFT Code *')}
																			placeholder=""
																			maxLength={11}
																			disabled={!hasEditPermission}
																			value={bankRoutingNumber}
																			onChange={handleBankChange}
																			InputProps={{
																				endAdornment: bankRoutingNumber && (
																					<InputAdornment position="end">
																						<Typography
																							variant="body2"
																							color="textSecondary"
																						>
																							{
																								formikBank.values.bankRoutingNumber
																									.length
																							}
																							/11
																						</Typography>
																					</InputAdornment>
																				),
																			}}
																		/>
																		{formikBank.errors.bankRoutingNumber &&
																			formikBank.touched.bankRoutingNumber && (
																				<div
																					className="error error-red f9"
																				>
																					{formikBank.errors.bankRoutingNumber}
																				</div>
																			)}
																	</div>
																	<div className="col-12">
																		<div className="f12 mb-1">
																			Attach Cancelled Cheque *
																		</div>
																		<Form.Group controlId="formFile" className="">
																			<Form.Control
																				type="file"
																				size="sm"
																				accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
																				// onChange={handleAttachfileChange("cancelledCheckFile")}
																				onChange={handleBankfile}
																				ref={fileInputRef}
																				disabled={!hasEditPermission}
																			/>

																			{uploadedFileName && (
																				<div className="mt-2">
																					<span className="f13 fw500">Uploaded File:</span>
																					<Button
																						variant="text"
																						size="small"
																						className="text-capitalize font-normal"
																						onClick={() =>
																							downloadFilesOnAzure(
																								uploadedFileName,
																								getFileName(uploadedFileName),
																								atoken
																							)
																						}
																					>
																						{getFileName(uploadedFileName)}
																					</Button>
																				</div>
																			)}
																		</Form.Group>
																	</div>
																	<div className="text-end mt-3">
																		{!loading ? (
																			<Button
																				color="primary"
																				variant="contained"
																				size="small"
																				type="submit"
																				disabled={!hasCreatePermission}
																			>
																				Add
																			</Button>
																		) : (
																			<LoadingButton
																				className=""
																				loading
																				variant="contained"
																			>
																				Adding...
																			</LoadingButton>
																		)}
																	</div>
																</div>
																<hr className="" />
															</>
														)}
													</>
												) : (
													<Alert severity="warning" className="mb-3">
														You do not have permission to view Bank Details.
													</Alert>
												)}
												<div className="">
													<div className="row">
														<div className="col-12">
															<DataGrid
																getRowId={getRowIdBank}
																rows={BankList}
																// loading={gridloading}
																columns={columnsBank}
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
											</>
										);
									})()}
								</Box>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>
			<React.Fragment key="key3">
				<Drawer
					anchor="right"
					open={stateFinancial["addFinanceDrawer"]}
				// onClose={toggleDrawer('addProductDrawer', false)}
				>
					<Form onSubmit={formikFinance.handleSubmit}>
						<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">
											Financial Details
										</div>
										<div>
											<IconButton
												onClick={toggleDrawer("addFinanceDrawer", false)}
												size="small"
												edge="start"
												sx={{ mr: 1 }}
											>
												<HiOutlineX className="f20 text-white" />
											</IconButton>
										</div>
									</div>
								</Box>

								<Box sx={{ flexGrow: 1, p: 2 }}>
									{permissionManager && (
										<div className="pb-0">
											{/* <Alert severity="info" className="mb-3">
												<div className="d-flex align-items-center">
												
													Financial Details permissions:
													{(() => {
														const hasReadPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ);
														const hasEditPermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT);
														const hasCreatePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE);
														const hasRemovePermission = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.REMOVE);

														return (
															<>
																 {hasReadPermission && <span className="badge bg-success ms-1">Read</span>}
																{hasEditPermission && <span className="badge bg-warning ms-1">Edit</span>}
																{hasCreatePermission && <span className="badge bg-primary ms-1">Create</span>}
																{hasRemovePermission && <span className="badge bg-danger ms-1">Remove</span>} 
															</>
														);
													})()}
												</div>
											</Alert> */}
										</div>
									)}
									{(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.READ) ?? false) ? (
										<>
											{(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false) && !activityType && (
												<>
													<div className="row mt-2">
														<div className="col-12 col-md-4 ">
															<TextFieldCell
																id="financialYear"
																name="financialYear"
																label="Financial Year *"
																placeholder=""
																maxLength={4}
																disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false)}
																value={financialYear}
																onChange={(e) => {

																	const value = e.target.value;
																	if (/^\d{0,4}$/.test(value)) {
																		setfinancialYear(value);
																	}
																}}

															/>
															{formikFinance.errors.financialYear &&
																formikFinance.touched.financialYear && (
																	<div
																		className="error error-red f9"
																	>
																		{formikFinance.errors.financialYear}
																	</div>
																)}
														</div>
														<div className="col-12 col-md-4">
															<TextFieldCell
																id="turnover"
																name="turnover"
																label="Turnover*"
																placeholder=""
																maxLength={15}
																disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false)}
																value={turnover}
																onChange={handleTurnoverChange}
																InputProps={{
																	endAdornment: turnover && (
																		<InputAdornment position="end">
																			<Typography
																				variant="body2"
																				color="textSecondary"
																			>
																				{turnover?.length
																				}
																				/15
																			</Typography>
																		</InputAdornment>
																	),
																}}
															/>
															{formikFinance.errors.turnover &&
																formikFinance.touched.turnover && (
																	<div
																		className="error error-red"
																		style={{ fontSize: "9px" }}
																	>
																		{formikBank.errors.turnover}
																	</div>
																)}
														</div>
														<div className="col-12 col-md-4  mb-1">
															<Autocomplete
																disablePortal
																id="defaultCurrency"
																size="small"
																options={[...currency_list ?? [], { currencyNm: "Add New", id: "new" }]}
																fullWidth
																disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false)}
																renderInput={(params) => (
																	<TextField
																		{...params}
																		InputLabelProps={{
																			shrink: true,
																		}}
																		label="Currency *"
																	/>
																)}
																defaultValue={findObjByValueFromArray(
																	currency_list,
																	defaultCurrency,
																	"currencyList"
																)}
																getOptionLabel={(option) =>
																	option.currencyNm ?? ""
																}
																value={defaultCurrency}
																onChange={(e, newvalue) => {
																	if (newvalue && newvalue.id === "new") {
																		setOpenCurrencyModal(true);
																	} else {
																		setDefaultCurrency(newvalue);
																	}
																}}
																renderOption={(props, option) => (
																	<li {...props} key={option.id}>
																		{option.id === "new" ? (
																			<span style={{ fontWeight: "bold", color: "#1976d2" }}>
																				+ {option.currencyNm}
																			</span>
																		) : (
																			option.currencyNm
																		)}
																	</li>
																)}
															/>
															{formik.errors.defaultCurrency &&
																formik.touched.defaultCurrency && (
																	<div
																		className="error error-red"
																		style={{ fontSize: "9px" }}
																	>
																		{formik.errors.defaultCurrency}
																	</div>
																)}
														</div>

														<div className="col-12">
															<div className="f12 mb-1">Attachment *</div>
															<Form.Group controlId="formFile" className="">
																<Form.Control
																	type="file"
																	size="sm"
																	accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
																	// onChange={handleAttachfileChange("cancelledCheckFile")}
																	onChange={handleFinancefile}
																	ref={fileInputRef}
																	disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.EDIT) ?? false)}
																/>

																{uploadedFileName && (
																	<div className="mt-2">
																		Uploaded File:
																		<Button
																			variant="text"
																			size="small"
																			className="text-capitalize font-normal"
																			onClick={() =>
																				downloadFilesOnAzure(
																					uploadedFileName,
																					getFileName(uploadedFileName),
																					atoken
																				)
																			}
																		>
																			{getFileName(uploadedFileName)}
																		</Button>
																	</div>
																)}
															</Form.Group>
														</div>
														<div className="text-end mt-2">
															{!loading ? (
																<Button
																	color="primary"
																	variant="contained"
																	size="small"
																	type="submit"
																	disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.CREATE) ?? false)}
																>
																	Add
																</Button>
															) : (
																<LoadingButton
																	className=""
																	loading
																	variant="contained"
																>
																	Add...
																</LoadingButton>
															)}
														</div>
													</div>
													<hr className="" />
												</>
											)}
										</>
									) : (
										<Alert severity="warning" className="mb-3">
											You do not have permission to view Financial Details.
										</Alert>
									)}
									<div className="">
										<div className="row">
											<div className="col-12">
												<DataGrid
													getRowId={getRowIdFinance}
													rows={FinanceList}
													// loading={gridloading}
													columns={columnsFinance}
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
										{/* <div className="row">
                      <div className="col-12 mb-3 d-none d-lg-block">
                        <div className="row align-items-center p-2 rounded ms-0 me-0 mt-2 bggray">
                          <div className="col-12 col-md-11">
                            <div className="ps-2 pe-2">
                              <div className="row text-left">
                                <div className="col-lg col-md-4 col-12">
                                  <div className="text-muted f14 lingh14">
                                    Financial Year
                                  </div>
                                </div>
                                <div className="col-lg col-md-4 col-6">
                                  <div className="f14">
                                    <div className="text-muted f14 lingh14">
                                      Turnover
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex col-12 col-md-1 align-items-center text-end">
                            <div className="f14">
                              <div className="text-muted f14 lingh14"></div>
                            </div>
                          </div>
                        </div>

                        {FinanceList.map((finance, index) => (
                          <div key={index}>
                            <div className="row align-items-center p-0 pb-1 border-bottom ms-0 me-0 mt-2">
                              <div className="col-10 col-md-11">
                                <div className="ps-2 pe-2">
                                  <div className="row text-left">
                                    <div className="col-lg col-md-4 col-12">
                                      <div className="text-muted f14 lingh14">
                                        {finance.financialYear}
                                      </div>
                                    </div>
                                    <div className="col-lg col-md-4 col-12">
                                      <div className="f14">
                                        <div className="text-muted f14 lingh14">
                                          {finance.turnover}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex col-2 col-md-1 align-items-center justify-content-end text-end">
                                <IconButton
                                  size="medium"
                                  className="bg-white"
                                  onClick={() =>
                                    callbackfinancialdetails(finance)
                                  }
                                >
                                  <HiPencilAlt className="f16" />
                                </IconButton>
                                <IconButton size="medium" className="bg-white" onClick={()=>handleremovefinance(finance.id)}>
                                  <HiOutlineX className="f16 text-danger" />
                                </IconButton>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div> */}
									</div>
								</Box>
							</div>
						</Box>
					</Form>
				</Drawer>
			</React.Fragment>

			{/* SAP Partner Details Drawer */}
			<React.Fragment key="sapDrawer">
				<Drawer
					anchor="right"
					open={stateFinancial["addSapDrawer"]}
				// onClose={closeSapDrawer}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white" style={{ fontSize: '15px', fontWeight: 500 }}>
										ERP Details
									</div>

									<div className="me-3">
										<IconButton
											onClick={closeSapDrawer}
											size="small"
											edge="start"
											sx={{ mr: 1 }}
										>
											<HiOutlineX className="f20 text-white" />
										</IconButton>

									</div>
								</div>
							</Box>
							<div className="p-3">
								<div className="row">
									{/* Vendor Account Group */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Vendor Account Group</div>
										<Autocomplete
											size="small"
											options={vendorAccountGroupOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapVendorAccountGroup}
											onChange={(event, newValue) => setSapVendorAccountGroup(newValue)}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" />
											)}
										/>
									</div>


									{/* Purchase Organization */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Purchase Organization</div>
										<Autocomplete
											size="small"
											options={purchaseOrganizationOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapPurchaseOrganization}
											onChange={(event, newValue) => setSapPurchaseOrganization(newValue)}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" />
											)}
										/>
									</div>

									{/* Company Code */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Company Code</div>
										<Autocomplete
											size="small"
											options={companyCodeOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapCompanyCode}
											onChange={(event, newValue) => setSapCompanyCode(newValue)}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" />
											)}
										/>
									</div>

									{/* Currency */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Currency</div>
										<Autocomplete
											size="small"
											options={currencyOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapCurrency}
											onChange={(event, newValue) => setSapCurrency(newValue)}
											renderInput={(params) => (
												<TextField {...params} variant="outlined" />
											)}
										/>
									</div>


									{/* Payment Terms */}

									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Payment Terms</div>
										<Autocomplete
											size="small"
											options={paymentTermsOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapPaymentTerms}
											onChange={(event, newValue) => setSapPaymentTerms(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Incoterms */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Incoterms</div>
										<Autocomplete
											size="small"
											options={incotermsOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapIncoterms}
											onChange={(event, newValue) => setSapIncoterms(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Tax Classification */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Tax Classification</div>
										<Autocomplete
											size="small"
											options={taxClassificationOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapTaxClassification}
											onChange={(event, newValue) => setSapTaxClassification(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Reconciliation Account */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Reconciliation Account</div>
										<Autocomplete
											size="small"
											options={reconciliationAccountOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapReconciliationAccount}
											onChange={(event, newValue) => setSapReconciliationAccount(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>


									{/* Purchasing Group */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Purchasing Group</div>
										<Autocomplete
											size="small"
											options={purchasingGroupOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapPurchasingGroup}
											onChange={(event, newValue) => setSapPurchasingGroup(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Schema Group */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Schema Group</div>
										<Autocomplete
											size="small"
											options={schemaGroupOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapSchemaGroup}
											onChange={(event, newValue) => setSapSchemaGroup(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Terms of Payment */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Terms of Payment</div>
										<Autocomplete
											size="small"
											options={termsOfPaymentOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapTermsOfPayment}
											onChange={(event, newValue) => setSapTermsOfPayment(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Withholding Tax */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Withholding Tax</div>
										<Autocomplete
											size="small"
											options={withholdingTaxOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapWithholdingTax}
											onChange={(event, newValue) => setSapWithholdingTax(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

									{/* Minority Indicator */}
									<div className="col-sm-6 mb-3">
										<div className="small text-muted mb-1">Minority Indicator</div>
										<Autocomplete
											size="small"
											options={minorityIndicatorOptions}
											getOptionLabel={(option) => option?.name || ''}
											value={sapMinorityIndicator}
											onChange={(event, newValue) => setSapMinorityIndicator(newValue)}
											renderInput={(params) => <TextField {...params} variant="outlined" />}
										/>
									</div>

								</div>

								{/* Update Button */}
								<div className="d-flex justify-content-end mt-4">
									<Button
										variant="contained"
										color="primary"
										onClick={() => {
											// Handle SAP details update

											closeSapDrawer();
										}}
										disabled={!(permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIER_DETAILS, ACTIONS.UPDATE) ?? false)}
									>
										Update Supplier Details
									</Button>
								</div>
							</div>
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
										<div className="ms-3 text-white">
											Supplier Approval
										</div>
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
													<TextField
														id="isApproved"
														InputLabelProps={{
															shrink: true,
														}}
														name="isApproved"
														select
														className="mb-2"
														fullWidth
														size="small"
														label="Approver Status"
														variant="outlined"
														value={formik_ApproveReject.values.isApproved}
														onChange={(e) =>
															formik_ApproveReject.setFieldValue(
																"isApproved",
																e.target.value
															)
														}
													>
														<MenuItem value="true">Approve</MenuItem>
														<MenuItem value="false">Reject</MenuItem>
													</TextField>
												</div>

												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="approveComment"
														InputLabelProps={{
															shrink: true,
														}}
														name="approveComment"
														className="w-100 f14"
														size="small"
														label="Comment "
														variant="outlined"
														multiline
														rows={3}
														value={formik_ApproveReject?.values?.remarks}
														onChange={(e) =>
															formik_ApproveReject.setFieldValue(
																"remarks",
																e.target.value
															)
														}
														InputProps={{
															endAdornment: formik_ApproveReject?.values?.remarks && (
																<InputAdornment position="end">
																	<Typography
																		variant="body2"
																		color="textSecondary"
																	>
																		{
																			formik_ApproveReject?.values?.remarks
																				.length
																		}
																		/200
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
												loading={loadingprogress || formik_ApproveReject.isSubmitting}
												disabled={loadingprogress || formik_ApproveReject.isSubmitting}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
											>
												Save
											</LoadingButton>

											{/* {!loading ? (
												<Button
													loading={loadingprogress}
													color="primary"
													size="medium"
													className="text-white text-capitalize mb-3 mr-3"
													variant="contained"
													type="submit"
												>
													Save
												</Button>
											) : (
												<LoadingButton
													color="primary"
													size="medium"
													className="text-white text-capitalize mb-3 mr-3"
													variant="contained"
													type="submit"
												>
													Saving...
												</LoadingButton>
											)} */}
											{/* <LoadingButton
												// loading={loadingBids}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
											>
												<span>Save</span>
											</LoadingButton> */}
											{/* Add margin-bottom to create a gap */}
										</div>
									</div>
								</div>
							</div>
						</Box>
					</form>
				</Drawer>




			</React.Fragment>
			<React.Fragment key="key5">
				<Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
					<Box sx={{ width: { xs: 320, sm: 600, md: 900 } }}
						className="overflow-hidden">

					</Box>
				</Drawer>
			</React.Fragment>
			<>


				<Dialog
					// open={openModal}
					// onClose={handleCloseModal}
					open={openModal}
					onClose={handleDuplicateDialogClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
					PaperProps={{
						sx: {
							borderRadius: '16px',  // or 'var(--radius-default)' if you want
							border: '1px solid var(--vg-bg-grey)',
							paddingTop: '40px',
						}
					}}
				>
					{/* Cross icon absolutely positioned on top right of Paper */}
					<IconButton
						aria-label="close"
						onClick={handleCloseModal}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: 'var(--vz-header-item-color-dark)',
							zIndex: 1,
						}}
					>
						<CloseIcon />
					</IconButton>

					{/* Dialog Title text below cross icon */}
					<DialogTitle
						id="alert-dialog-title"
						className="textMedium text-dark-blue"
						sx={{ paddingTop: 0 }}
					>
						{isExternal ? (
							<>
								A supplier with Tax ID{" "}
								<span className="boldText">{formik_companysetup.values.taxId}</span> is
								already registered by an external company.
								<br />
								You can either{" "}
								<span className="boldText">extend the existing registration</span> or
								proceed by entering a different Tax ID.
							</>
						) : (
							<>
								A supplier with Tax ID{" "}
								<span className="boldText">{formik_companysetup.values.taxId}</span> is
								already registered within your company.
								<br />
								You can either{" "}
								<span
									className="text-primary pointer text-decoration-underline"
									onClick={() =>
										navigate(
											`/manage/manage-participants/register-participants/${isExternalID}`
										)
									}
								>
									review the existing record
								</span>{" "}
								or proceed by entering a different Tax ID.
							</>
						)}
					</DialogTitle>


					<DialogActions className="bg-white p-3">
						{isExternal ? (
							<Button
								variant="contained"
								size="large"
								className="textMedium text-capitalize rounded"
								style={{
									backgroundColor: 'var(--vz-primary-color)',
									color: '#fff',
									boxShadow: 'var(--box-shadow-default)',
									textTransform: 'none',
								}}
								startIcon={<HiPlusSm />}
								onClick={() =>
									navigate(
										`/manage/manage-participants/register-participants/${extendSupplierId}?&isExtend=Y`
									)
								}
							>
								Extend Registration
							</Button>
						) : null}
					</DialogActions>
				</Dialog>




				{/* <Dialog
					open={openModal}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<DialogTitle id="alert-dialog-title">
						{isExternal == true
							? `Supplier with Taxid ${formik_companysetup.values.taxId} is already registered by External Company. Click to Extend`
							: `Supplier with Taxid ${formik_companysetup.values.taxId} is already registered within Company. Click to Review`}
					</DialogTitle>

					<DialogActions>
						{isExternal == true ? (
							<Button
								variant='contained'
								size='large'
								startIcon={<HiPlusSm />}
								className='text-capitalize font-normal'
								onClick={() => navigate(`/manage/manage-participants/register-participants/${extendSupplierId}?&isExtend=Y`)}
							>Extend Supplier</Button>
						
						) : (
							<Button
								variant='text'
								size='large'
								startIcon={<HiPlusSm />}
								className='text-capitalize font-normal'
								onClick={() => navigate(`/manage/manage-participants/register-participants/${isExternalID}`)}

							>Review Supplier</Button>
						
						)}
					</DialogActions>
				</Dialog> */}
			</>
			<Modal
				size="lg"
				show={CategoryModal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW CATEGORY"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => CloseCategoryModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title><div className="d-flex align-items-center f14 text-white">
						Manage Category
					</div>

					</Modal.Title>
					<IconButton
						onClick={() => CloseCategoryModal()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						{/* <CategoryList 
							isModal={true} 
							onCategoryAdded={handleCategoryAdded}
						/> */}
						<AddPrItemCategory
							handleCategoryList={handleCategoryList}
						 isModal={true} 
						// onCategoryAdded={handleCategoryAdded}
						/>
					</div>
				</Modal.Body>
			</Modal>


			<Dialog
				open={confirmSQEDelete}
				onClose={() => handleCloseSQEDelete(false)}
			>
				<DialogTitle id="">{"Are you sure?"}</DialogTitle>
				<DialogContent className="min-width-300">
					<DialogContentText id="">
						Your unsaved data will be lossed. Do you want to continue ?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Buttonmui onClick={() => handleCloseSQEDelete(false)}>No</Buttonmui>
					<Buttonmui onClick={() => handleCloseSQEDelete(true)} autoFocus>
						Yes
					</Buttonmui>
				</DialogActions>
			</Dialog>
			{/* for hhandling vq questions */}
			<React.Fragment key="qusDrawertr">
				<Drawer anchor="right" open={state["qusDrawer"]}>
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
									idFromURL={sqe}
									callbackQuesAddCustom={callbackQuesAddCustom}
									libraryId={libraryId}
									questionforedit={questionforedit}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>

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
		</>
	);


	// const generalterms = [
	//   { label: "Domestic", year: 1952 },
	//   { label: "Title 2", year: 1995 },
	//   { label: "Title 3", year: 1948 },
	// ];
	// const questerms = [
	//   { label: "Question title 1", year: 1952 },
	//   { label: "Question title 2", year: 1995 },
	//   { label: "Question title 3", year: 1948 },
	// ];
}

export default RegisterSuppliers;

