import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import HistoryCell from "../../BaseCells/HistoryCell";
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import ApprovalConfirmDialog from '../../../components/RFQ/ApprovalConfirmDialog';
import {
	Alert, Card,
	CardHeader,
	CardContent,
} from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
	HiOutlineX,
	HiX,
	HiPlusSm,
	HiOutlineDotsHorizontal,
	HiPencilAlt,
	HiPlus,
	HiOutlinePencil,
	HiDotsVertical,
	HiDotsHorizontal,
	HiOutlineInformationCircle,
	HiDownload,
	HiOutlineArrowRight,
} from "react-icons/hi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { LiaUserSolid } from "react-icons/lia";
import {
	Autocomplete,
	Button,
	ButtonGroup,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	FormLabel,
	Input,
	InputAdornment,
	InputLabel,
	Menu,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Stack,
	TextField,
	Tooltip,
	Typography,
	Badge,
	createFilterOptions,
} from "@mui/material";
import { Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { Badge as BadgeStrap } from "react-bootstrap";

import Drawer from "@mui/material/Drawer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import TextFieldCell from "../../BaseCells/TextFieldCell";
import LoadingButton from "@mui/lab/LoadingButton";
import ProductitemCell from "./ProductitemCell";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import {
	IntegerRegex,
	InvitedSupplierModal,
	findObjByValueFromArray,
	findObjListByValueFromArray,
	getPayloadWithStage,
	getStageInfo,
	handlesaveAttachment,
	mapQuestionsToSubcategories,
	menuactionlist,
	pullMessageCount,
	downloadExcelTemplate,
	downloadFilesOnAzure,
	attachmentmodalforevent,
	eventattachmentmodal,
	filequeryparam,
	getFileName,
	validateFileSize,
	getPayloadWithFilePath,
} from "../../../utils/common";
import { uploadFilesOnAzure } from "../../../utils/documentlibrary";
import { actionTypes, useStateValue } from "../../../store";
import {
	OrgGroupMasterList,
	RFQCommLibraryAdd,
	RFQItemServiceDelete,
	RFQQuestionLibAdd,
	checkRFQLineItems,
	checkUTC,
	downloadSampleEvent,
	extractTextFromHTML,
	formatDateViaLocale,
	formatDateViaTime,
	formattimeoption,
	getCurrency,
	getDateFormatPatteronLocale,
	getLibraryOrgEntityFind,
	getPurchaseOrgList,
	getQuestionsLibFind,
	getRFQItemServiceFind,
	getRFQManageFindById,
	handleFileUploadItem,
	scrollToTarget,
	scrollToTargetC,
	userampm,
} from "../../../utils/common/utility";

import { DateTimePicker, LocalizationProvider, MobileDateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddProductsCell from "./AddProductsCell";
import BoqScreen from "./BoqScreen";
import { UOMMasterList } from "../../../utils/commerciallibrary";
import AddQuestionFormCell from "./AddQuestionFormCell";
import { toast } from "react-toastify";
import { StageFindAll } from "../../../utils/stagemaster";
import {
	MemoizedEventStageFlow,
} from "../../../utils/common/component";
import NotFoundPage from "../../../components/NotAllowed";
import { ApiClient, api } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import AttachmentWorkFlow from "../../BaseCells/attachmentworkflow";
import {
	Close,
	KeyboardArrowDownOutlined,
} from "@mui/icons-material";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import SearchIcon from "@mui/icons-material/Search";
import SelectedSupplierCell from "./SelectedSupplierCell";
import EventQuestionCell from "../../BaseCells/EventQuestionCell";
import { sanitizeInput } from "../../../utils/common/santize";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import LoadingFactor from "./LoadingFactor";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { TbExchange } from "react-icons/tb";
import { PiWarningDiamondFill } from "react-icons/pi";
import ERFQComparative from "./ERFQComparative";
import RFQGeneralPreview from "./RFQGeneralPreview";
import RFQActionDrawer from "../../../components/Reports/RFQActionDrawer";
import EventCommercialScreen from "../../../components/Event/EventCommercialScreen";
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import EventAllocationScreen from "../../../components/Event/EventAllocationScreen";
import QueryList from "../../CommunucationHub/QueryList";
import { FastApiClient } from "../../../FastApiClient";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import EventSuppliers from "../../../components/Event/EventSuppliers";
import { FaPaperclip } from "react-icons/fa";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import NFASOBEventBoxRFQ from "../NFA/NFASOBEventBoxRFQ"
import { current } from "@reduxjs/toolkit";
import AddEditCurrency from "../../../utils/common/AddEditCurrency";

dayjs.extend(utc);
dayjs.extend(timezone);

const RequestForQuotation = ({ claimType, breadcrumb }) => {
	const fileInputRef = useRef(null);
	const location = useLocation();
	const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
	const checkedIcon = <CheckBoxIcon fontSize="small" />;

	const navigate = useNavigate();

	const [{ atoken, rtoken, customerid, roleClaims, customersuffix, userDetail, eventType, eventId, eventCode }, dispatch] =
		useStateValue();
	const apiClient = new ApiClient(customersuffix);
	//ref
	const EventCommercialScreenRef = useRef(null);
	const EventQuestionScreenRef = useRef(null);
	const attachmentdrawerref = useRef()
	//Currency List
	const [currencyList, setCurrencyList] = useState([]);
	const [loadCurrency, setLoadCurrency] = useState(false);
	const [currencyListLoaded, setCurrencyListLoaded] = useState(false);
	const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);

	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
	//Requisitioner List
	const [requisitionerList, setRequisitionerList] = useState([]);
	const [loadRequisitioner, setLoadRequisitioner] = useState(false);
	const [requisitionerListLoaded, setRequisitionerListLoaded] = useState(false);

	const [searchParams, setSearchParams] = useSearchParams();
	const [UOMMaster, setUOMMaster] = useState([]);
	const [rfqItemsList, setrfqItemsList] = useState([]);
	const [generaltermsDDl, setGeneraltermsDDl] = useState([]);
	const [commercialLibFind, setCommercialLibFind] = useState([]);
	const [idFromURL, setIdFromURL] = useState(null);
	const [value, setValue] = React.useState(1);
	const [OrgId, setOrgId] = useState(0);
	const [OrgGroupId, setOrgGroupId] = useState(0);
	const [modal1, setModal1] = useState(false);
	const [libraryId, setLibraryId] = useState()
	const [openQuotes, setOpenQuotes] = useState(true);
	// RequestForQuotation.jsx (Parent)
	const [attachmentCount, setAttachmentCount] = useState(0);
	const NFASOBRFQRef = useRef(null);
	// Permission Management State
	const [permissionManager, setPermissionManager] = useState(null);
	const [loadingPermissions, setLoadingPermissions] = useState(true);


	const updateEventLibraryId = (v) => {
		const { id } = v
		setLibraryId(id)
	}

	const handleCloseModal1 = () => setModal1(false);

	// Currency Modal Handlers
	const CloseCurrencyModal = () => {
		console.log("CloseCurrencyModal called");
		setOpenCurrencyModal(false);
	};

	const handleCurrencyList = (list) => {
		console.log("handleCurrencyList called with:", list);
		setCurrencyList(list);
	};

	const handleChange = (event, newValue) => {

		//getRoles(newValue);
		setValue(newValue);
		if (newValue != 6 && newValue != "6") setRfqActionsPortalReady(false);
		if (newValue == "6") {
			// if (tabshow)
			// 	setTabShow(false)

			if (approvershow)
				setApproverShow(false)
		}
		else {
			if (newValue == "7") {
				setSelectedMenuItem("Publish RFQ")
				setApproverShow(true)
			}
			else if (newValue == "9") {
				setSelectedMenuItem("Save")
			}
			else {
				setSelectedMenuItem("Save & Continue")
			}
		}



	};

	// Note: pullMessageCount now handled automatically by MessageCell component on location change
	// useEffect(() => {
	// 	if (userDetail?.id && eventType && eventId) {
	// 		pullMessageCount({
	// 			UserId: userDetail.id,
	// 			EventType: eventType,
	// 			EventId: eventId,
	// 			IsVenderYN: "N",
	// 			atoken,
	// 			dispatch
	// 		});
	// 	}
	// }, [userDetail, eventType, eventId]);


	useEffect(() => {
		if (idFromURL !== null) {
			setApproverShow(true);
		}
	}, [value, idFromURL]);



	const [isgeneditdisable, setIsGenEditDisable] = useState(true);
	const [isgrnreadDisabled, setIGenReadDisabled] = useState();
	const [isitemreadDisabled, setIItemReadDisabled] = useState(true);
	const [isitemeditDisabled, setIsitemEditDisabled] = useState(true);
	const [isitemcreateDisabled, setIsitemcreateDisabled] = useState(true);
	const [ismanagereadDisabled, setIsManageReadDisabled] = useState(true);
	const [isquerieseadDisabled, setIsQueriesReadDisabled] = useState(true);
	const [iscomercialseadDisabled, setIsComercialReadDisabled] = useState(true);
	const [iscomercialeditDisabled, setIsComercialEditDisabled] = useState(true);
	const [iscomercialcreateDisabled, setIsComercialCreateDisabled] = useState(true);
	const [isquestionreadDisabled, setIQuestionReadDisabled] = useState(true);
	const [isquestioneditDisabled, setIsQuestionEditDisabled] = useState(true);
	const [isquestioncreateitDisabled, setIQuestionCreateDisabled] = useState(true);
	const [issuppliercreateitDisabled, setIsSupplierCreateDisabled] = useState(true);
	const [issuppliereditDisabled, setIsSupplierEditDisabled] = useState(true);
	const [issupplierreadDisabled, setIsSupplierReadDisabled] = useState(false);
	const [issupplierraccesslevel, Setissupplierraccesslevel] = useState('');

	const [isworkreadDisabled, setisworkReadDisabled] = useState(true);
	const [isHistoryreadDisabled, setisHistoryReadDisabled] = useState(true);

	const getAuditHistoryRoles = async () => {
		const dataR = {
			roleId: parseInt(userDetail?.roleId),
			featureName: "Request for Quotation",
			claimType: "Audit History",
		}

		const queryParams = buildQueryParams(dataR)
		const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken)
		if (res) {
			const data = res?.data
			console.log("My Roles & My Right")
			console.table(res?.data)
			dispatch({ type: actionTypes.SET_RoleClaims, value: data });
		}
		const accessLevels = res?.data.map(item => {
			if (item.claimType === 'Audit History' && item.claimValue === 'Read' && item.accessLevel === 'None') {
				setisHistoryReadDisabled(false);
			}
		}).filter(item => item !== null); // Filter out null values
	}

	const getworkflowRoles = async () => {
		const dataR = {
			roleId: parseInt(userDetail?.roleId),
			featureName: "Request for Quotation",
			claimType: "Work Flow",
		}

		const queryParams = buildQueryParams(dataR)
		const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken)
		if (res) {
			const data = res?.data
			console.log("My Roles & My Right")
			console.table(res?.data)
			dispatch({ type: actionTypes.SET_RoleClaims, value: data });
		}
		const accessLevels = res?.data.map(item => {

			if (item.claimType === 'Work Flow' && item.claimValue === 'Read' && item.accessLevel === 'None') {
				setisworkReadDisabled(false);
			}
		}).filter(item => item !== null); // Filter out null values
	}
	useEffect(() => {
		getUserRoleRights();
	}, []);

	// After permissions load, ensure current tab is accessible — if not, auto-select first accessible tab
	useEffect(() => {
		if (skipAutoTabCheckRef.current) {
			skipAutoTabCheckRef.current = false;
			return;
		}
		if (loadingPermissions) return;

		const canView = (tab) => {
			// Treat 'add' or falsy idFromURL as "no saved RFQ yet"
			const hasExistingId = !!idFromURL && idFromURL !== "add" && !isNaN(parseInt(idFromURL));
			if (tab === 1)
				return (
					(permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false) ||
					(permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false) ||
					(permissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false)
				);
			if (tab === 2) return (permissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false) && hasExistingId;
			if (tab === 3) return (permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.READ) ?? false) && hasExistingId;
			if (tab === 4) return (permissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? false) && hasExistingId;
			if (tab === 5) return (permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false) && hasExistingId;
			return true;
		};

		if (!canView(value)) {
			const order = [1, 2, 3, 4, 5, 6, 7, 9];
			const first = order.find(t => canView(t));
			if (first) setValue(first);
		}
	}, [loadingPermissions, permissionManager, idFromURL, value]);

	const [loading, setLoading] = useState(false);
	const [allDataList, setAllDataList] = useState([]);
	const [QuestionCategoryList, setQuestionCategoryList] = useState([]);
	const [uncategorizedQuestions, setUncategorizedQuestions] = useState([]);
	const pullCategoryList = async (value) => {
		var data = {
			CustomerId: customerid,
			LibraryId: value?.id ? value?.id : value,
		};
		setLoading(true);
		const queryParams = Object.entries(data)
			?.filter(
				([key, value]) => value !== null && value !== undefined && value !== ""
			)
			.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
			.join("&");

		const res = await apiClient.getres(
			`/api/QCategory/Find?${queryParams}`,
			atoken
		);
		const res2 = await apiClient.getres(
			`/api/QuestionsLib/Find?${queryParams}`,
			atoken
		);
		const categories = res?.data?.result;
		const questions = res2?.data?.result;
		setAllDataList(questions);
		//console.log("questionsquestionsquestions::", questions);
		const result = mapQuestionsToSubcategories(categories, questions);

		if (res != "" && res != undefined) {
			setQuestionCategoryList(result);
		}

		// Filter out uncategorized questions and set state
		const uncategorizedQuestions = questions?.filter(
			(question) => !question.questionCategory
		);
		setUncategorizedQuestions(uncategorizedQuestions);
		setLoading(false);
	};

	// const getStageRefreshonPurchGroup = () => {
	// 	StageFindAll(
	// 		{
	// 			EventType: "RFQ",
	// 			CustomerId: customerid,
	// 			EventId: idFromURL ?? 0,
	// 			OrgId: OrgId ?? 0,
	// 			OrgGroupId: OrgGroupId ?? 0,
	// 		},
	// 		atoken
	// 	).then((res) => {

	// 		const result = res?.filter((item) => item.stageSeq > 0);
	// 		setStageList(result);
	// 		// setStageList(res);
	// 		const stagesarray = res?.map((item) => item.currentStage);
	// 	});
	// };


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

	const toggleDrawerCallback = useCallback((anchor, open) => {
		setState({ ...state, [anchor]: open });
	}, []);

	const [requestCell, setRequestCell] = useState({
		EventId: 0,
		EventType: "RFQ",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
		//IsAscending:"True"
	});
	const updateRequestCell = (newEventId) => {
		setRequestCell((prevState) => ({
			...prevState,
			EventId: newEventId,
		}));
	};

	const requestApprover = {
		EventId: idFromURL ?? 0,
		EventType: "RFQ",
	};
	const [width, setWidth] = useState(0);

	//role management
	const [accessLevel, setAccessLevel] = useState([]);



	//   general tab form
	const [invalidCurrencyConversion, setInvalidCurrencyConversion] = useState(false);

	const maxNow = new Date();
	const validationSchema = yup.object().shape({
		subject: yup
			.string("Enter RFQ Subject")
			.max(200, "Max 200 character")
			.required("RFQ Subject is required"),
		description: yup.string().test("valid-desc", function (description) {
			const { termandcondition } = this.parent;
			const termandconditionobj = extractTextFromHTML(termandcondition ?? "");
			const descriptionobj = extractTextFromHTML(description ?? "");


			if (descriptionobj.trim().length < 1) {
				// If the termandcondition is undefined, null, or empty, scroll to target and return an error


				return this.createError({
					path: "description",
					message: "Description is required", // Custom error message
				});
				scrollToTargetC("description")

			}
			return true;
			// Validation passes if termandcondition has content
			// if (termandconditionobj.trim().length < 1) {
			// 	// If the termandcondition is undefined, null, or empty, scroll to target and return an error


			// 	return this.createError({
			// 		path: "termandcondition",
			// 		message: "Terms && Condition is required is required", // Custom error message
			// 	});
			// 			scrollToTargetC("termandcondition")
			// 			return true; 
			// }


		}),

		// termandcondition: yup.string().test("valid-tc", function (termandcondition) {

		//      const { description } = this.parent;
		// 	const termandconditionobj = extractTextFromHTML(termandcondition ?? "");
		// 	const descriptionobj = extractTextFromHTML(description ?? "");

		// 	if (termandconditionobj.trim().length < 1 && descriptionobj.trim().length > 0) {
		// 		// If the termandcondition is undefined, null, or empty, scroll to target and return an error
		// 	//	scrollToTargetC("termandcondition");  // Scroll to the target element

		// 		return this.createError({
		// 			path: "termandcondition",
		// 			message: "Terms & Condition is required", // Custom error message
		// 		});
		// 	}
		// 	return true; // Validation passes if termandcondition has content
		// }),
		startDate: yup
			.date()
			.nullable()
			.typeError("RFQ Start Date/Time must be a valid date")
			.test(
				"valid-start-date",
				function (startDate) {
					// Start date is optional, but if provided, it should not be in the past
					if (startDate && startDate < maxNow) {
						return this.createError({
							path: "startDate",
							message: "RFQ Start Date/Time cannot be in the past",
						});
					}
					return true; // Validation passes
				}
			),
		endDate: yup
			.date()
			.required("RFQ End Date/Time is required")
			.typeError("RFQ End Date/Time is required")
			.test(
				"valid-dates",
				function (endDate) {
					const { startDate } = this.parent; // Access other fields
					if (!endDate) {
						return this.createError({
							path: "endDate",
							message: "RFQ End Date/Time is required",
						});
					}
					if (endDate < maxNow) {
						return this.createError({
							path: "endDate",
							message: "RFQ End Date/Time cannot be in the past",
						});
					}
					if (startDate && endDate < startDate) {
						return this.createError({
							path: "endDate",
							message: "RFQ End Date/Time must be greater than Start Date",
						});
					}
					return true; // Validation passes
				}
			),
		bidOpeningDate: yup
			.date()
			.nullable()
			.typeError("Bid Open Date/Time is required")
			.test(
				'Bid Open Date/Time must be greater than End Date/Time',
				function (bidOpeningDate) {
					const { endDate, RFQType } = this.parent;
					if (RFQType === "closed" && endDate && bidOpeningDate) {
						if (bidOpeningDate < endDate) {
							return this.createError({
								path: "bidOpeningDate",
								message: "Bid Opening Date must not precede the end date",
							});
						}
					}
					return true; // if sealedBid is false or dates are not defined, validation passes
				}
			),
		purchGrpId: yup.mixed().nullable().test("purchase-group-required", "Purchase Group is required", function (value) {
			const { purchOrgId } = this.parent;
			if (purchOrgId?.id > 0 && (!value || !value.id)) {
				return false;
			}
			return true;
		}),
		termandcondition: yup.string().test("valid-tc", "Terms & Conditions is required", function (value) {
			const text = extractTextFromHTML(value ?? "");
			if (text.trim().length < 1) {
				return this.createError({ message: "Terms & Conditions is required" });
			}
			return true;
		}),
	});


	//Formik Initialisation
	const formik = useFormik({
		initialValues: {
			id: 0,
			subject: "",
			description: "",
			baseCurrency:
				userDetail && userDetail?.defaultCurrency
					? userDetail?.defaultCurrency
					: "INR",
			startDate: null,
			endDate: null,
			purchOrgId: "",
			purchGrpId: "",
			termandcondition: "",
			rfqStatus: "New",
			sealedBid: false,
			RFQType: "open",
			bidOpeningDate: null,
			boqReq: false,
			requisitioner: userDetail.name ? userDetail.name : "",
			multicurrencytList: [],
			technicalApproval: "",
			IsMultiCurrency: false,
			Version: 1,
			showPriceTech: false,
			RFQVersionHistory: [{

				version: 1,
				bidOpeningDate: null,
				autoOpenEnabled: false
			}]
		},
		validationSchema: validationSchema,

		onSubmit: async (values) => {


			const descriptionobj = extractTextFromHTML(formik?.values?.description);
			if (descriptionobj.trim().length < 1) {
				formik.setFieldError("description", 'Description is mandatory')
				scrollToTargetC("description")
				return
			}

			const tncobj = extractTextFromHTML(formik?.values?.termandcondition ?? "");
			if (tncobj.trim().length < 1) {
				formik.setFieldError("termandcondition", 'Term and condition is mandatory')
				scrollToTargetC("termandcondition")
				return
			}

			//attachment handling 
			if (attachmentforevent && attachmentforevent.length > 0) {
				const missingRequiredAttachment = attachmentforevent?.some((file) => file.required && !file.fileNamePath);

				if (missingRequiredAttachment) {
					toast.info("If a document is required, you will need to upload the attachment. However, if it is not necessary, please delete the attachment", {
						toastid: "abhierror"
					});
					return;
				}

			}
			//currency handling 
			setInvalidCurrencyConversion(false);
			if (formik.values.IsMultiCurrency) {
				const invalidCurrencyItem = inputList.some(item => !item.baseCurrency);
				if (invalidCurrencyItem) {
					toast.error("Please select a currency for each entry before proceeding.");
					return;
				}
				const invalidConversionFactor = inputList && Array.isArray(inputList) && inputList.some(item => {
					if (!item || typeof item !== 'object') return false;
					const conversion = item.currencyConversion;
					if (!conversion || conversion === '') return false;
					const factor = parseFloat(conversion);
					return isNaN(factor) || factor <= 0;
				});
				if (invalidConversionFactor) {

					toast.error("Currency conversion factor must be greater than 0.");
					setInvalidCurrencyConversion(true);
					return;
				}
			}




			const currentdate = new Date();
			const RFQVersionHistory = values?.RFQVersionHistory.map(x => {
				return {
					...x, bidOpeningDate: x.bidOpeningDate ? x.bidOpeningDate?.toISOString() : null, id: x.id
				}
			})

			var data = {
				id: values?.id,
				customerId: customerid,
				openBy: customerid,
				subject: sanitizeInput(values.subject),
				description: sanitizeInput(values.description),
				baseCurrency: values.baseCurrency,
				startDate: values?.startDate ? values?.startDate?.toISOString() : null,
				endDate: values?.endDate?.toISOString(),
				purchOrgId: values.purchOrgId?.id != "" ? values.purchOrgId?.id : 0,
				purchGrpId: values.purchGrpId?.id != "" ? values.purchGrpId?.id : 0,
				termandcondition: sanitizeInput(values.termandcondition),
				rfqStatus: values.rfqStatus,
				openQuotes: values.RFQType == "closed" ? "N" : "Y",
				RFQType: values.RFQType,
				bidOpeningDate: (values.bidOpeningDate && values.RFQType == "closed") ? values.bidOpeningDate?.toISOString() : null,
				boqReq: values.boqReq,
				requisitioner: values.requisitioner != "" ? values.requisitioner : "",
				multicurrencytList: values.IsMultiCurrency ? inputList : [],
				technicalApproval: values.technicalApproval,
				IsMultiCurrency: values.IsMultiCurrency,
				Version: values?.Version,
				showPriceTech: values?.showPriceTech,
				RFQVersionHistory: RFQVersionHistory
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
			//console.log("RGQdatapayloaddatapayload", datapayload)
			if (data?.id > 0) {

				const res = await apiClient.postres(
					`/api/RFQManage/Update`,
					datapayload,
					atoken
				);
				if (res) {
					toast.success(`RFQ details have been updated successfully.`, {
						toastId: "rfqmanage_update"
					});
					// record saved id to avoid race with state updates
					lastSavedIdRef.current = data?.id;
					setIdFromURL(data?.id)
					skipAutoTabCheckRef.current = true;
					setValue(2);
					//setLoading(false)
				}
				setLoading(false)
			}
			else {
				const res = await apiClient.postres(
					`/api/RFQManage/Add`,
					datapayload,
					atoken
				);

				if (res) {
					// record saved id so parent flow can use it immediately
					lastSavedIdRef.current = res.data;
					setIdFromURL(res.data);
					navigate(`/configuration/manage-rfq/${res.data}?tab=item`)
					setcommcurrencyList([
						{
							id: "0",
							baseCurrency: "",
							currencyConversion: "",
							rfqId: res.data,
						},
					]);


					updateRequestCell(res.data);

					const AttachFiles = attachmentforevent?.map((x) => {

						x.eventId = res.data;
						x.createdById = userDetail?.id;
						x.createdByName = userDetail?.name;

						return x;
					});

					handlesaveAttachment(AttachFiles, res.data, atoken);


					toast.success(`RFQ details have been added successfully.`, {
						toastId: "rfqmanage_update2"
					});
					skipAutoTabCheckRef.current = true;
					setValue(2);
					setLoading(false)
				}
				else {
					setLoading(false)
					toast.error("Error while saving data", {
						toastId: "rfqmanage_error"
					});
				}
			}

		},
	});

	const stripHtmlTags = (html) => {
		return html.replace(/<\/?[^>]+(>|$)/g, ""); // Regex to remove HTML tags
	};

	const [inputList, setInputList] = useState([
		{ id: "0", baseCurrency: "", currencyConversion: "" },
	]);
	const [commcurrencyList, setcommcurrencyList] = useState([
		{ id: "0", baseCurrency: formik.values.baseCurrency, currencyConversion: "1", rfqId: idFromURL },
	]);


	const handleInputChange = (e, index, fieldname) => {
		let { name, value } = e.target;

		if (fieldname === "currencyConversion") {
			// Regex to allow only numbers with up to 6 decimal places for more precision
			const DecimalRegex = /^[0-9]*\.?[0-9]{0,6}$/;

			// If the input doesn't match the regex, do not update the input
			if (value && !DecimalRegex.test(value)) {
				return;  // Prevent input from being set if it exceeds 6 decimals
			}

			// Only prevent negative values, allow positive decimals including small ones like 0.001
			if (value && !isNaN(parseFloat(value)) && parseFloat(value) < 0) {
				return; // Prevent negative values but allow positive decimals and zero
			}
		}

		// Defensive check to ensure inputList and the specific index exist
		if (!inputList || !Array.isArray(inputList) || index < 0 || index >= inputList.length) {
			return;
		}

		const list = [...inputList];

		// Ensure the object at the index exists
		if (!list[index]) {
			list[index] = {};
		}

		list[index][name] = value;
		setInputList(list);
	};



	const handleCurrencyInputChange = (e, index) => {
		// console.log('pagge', e)
		const { name, value } = e.target;

		// Defensive check for commcurrencyList
		if (!commcurrencyList || !Array.isArray(commcurrencyList) || index < 0 || index >= commcurrencyList.length) {
			return;
		}

		const list = [...commcurrencyList];

		// Ensure the object at the index exists
		if (!list[index]) {
			list[index] = {};
		}

		list[index][name] = value;
		setcommcurrencyList(list);
	};
	const handleRemoveClick = (index) => {
		if (!inputList || !Array.isArray(inputList) || index < 0 || index >= inputList.length) {
			return;
		}
		const list = [...inputList];
		list.splice(index, 1);
		setInputList(list);
	};
	const handleRemoveCurrencyClick = (index) => {
		if (!commcurrencyList || !Array.isArray(commcurrencyList) || index < 0 || index >= commcurrencyList.length) {
			return;
		}
		const list = [...commcurrencyList];
		list.splice(index, 1);
		setcommcurrencyList(list);
	};
	const handleAddClick = () => {
		setInputList([
			...inputList,
			{
				id: "0",
				baseCurrency: "",
				currencyConversion: "",
				rfqId: formik?.values?.id,
			},
		]);
	};
	const handleAddCurrencyClick = () => {
		setcommcurrencyList([
			...commcurrencyList,
			{
				id: "0",
				baseCurrency: "",
				currencyConversion: "",
				rfqId: idFromURL,
			},
		]);
	};

	const pullgetCurrency = () => {
		if (currencyListLoaded || loadCurrency) {
			return;
		}
		setLoadCurrency(true);
		var data = {
			isActive: true,
		};
		try {
			getCurrency(data, atoken).then((res) => {
				setCurrencyList(res);
				setCurrencyListLoaded(true);
			});
		} catch (error) {
			console.error('Error fetching Currency List:', error);
			toast.error('Failed to load Currency List');
		} finally {
			setLoadCurrency(false);
		}

	};

	const PullPurchaseOrgAll = () => {
		var data = {
			CustomerId: customerid,
			IsActive: "true"
		};
		getPurchaseOrgList(data, atoken).then((resp) => {

			setPurchaseAllList(resp ?? []);
		});
	};
	const handlepurchaseorgList = (array) => {
		setPurchaseAllList(array);
	};
	const PullPurchaseGroupAll = (orgMstId) => {

		var data = {
			CustomerId: customerid,
			OrgMstId: orgMstId,
		};
		OrgGroupMasterList(data, atoken).then((res) => {
			if (res != "" && res != undefined) {
				setPurchaseGroupAllList(res || []);
			}
		});
	};

	const [stagelist, setStageList] = useState(null);
	const [stagearray, setStagearray] = useState([`Draft`]);
	//useState([`Draft`,`Under Pre Approval`]);
	const [currentStage, setCurrentStage] = useState(`Draft`);
	const [tempDataEditData, setTempDataEditData] = useState(null);
	const skipAutoTabCheckRef = useRef(false);
	// Ref to hold last saved id (set inside formik onSubmit) to avoid race with state updates
	const lastSavedIdRef = useRef(null);
	// Effective permission manager prefers event-level `userAccess` when available
	const effectivePermissionManager = React.useMemo(() => {
		if (
			tempDataEditData &&
			tempDataEditData[0] &&
			Array.isArray(tempDataEditData[0].userAccess) &&
			tempDataEditData[0].userAccess.length > 0
		) {
			return new PermissionManager(tempDataEditData[0].userAccess);
		}

		return permissionManager;
	}, [permissionManager, tempDataEditData]);

	// Early general-permission check: when permissions finished loading,
	// decide whether to show an immediate Access Denied for General tab.
	const canReadEarly = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
	const canCreateEarly = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
	const showGeneralAccessDenied = !loadingPermissions && !canReadEarly && !canCreateEarly;


	const [EventHeaderDetails, setEventHeaderDetails] = useState(null);
	const pullgetRFQManageFind = (Id) => {
		var data = {
			Id: Id,
		};

		getRFQManageFindById(data, atoken).then((res) => {
			if (res && res?.length > 0) {
				//console.log("res getRFQManageFindById", res);

				// Set tempDataEditData FIRST so the component always exits skeleton state
				setTempDataEditData(res);

				setEventHeaderDetails(res?.[0]);
				dispatch({ type: actionTypes.SET_EVENTCODE, value: res[0]?.eventCode });

				if (res?.[0]?.userAccess?.length > 0) {
					try {
						const userAccess = res?.[0]?.userAccess.map(x => {
							return ({ ...x, claimValue: typeof x.claimValue === 'string' ? JSON.parse(x.claimValue) : x.claimValue })
						})
						setAccessLevel(userAccess)
					} catch (e) {
						console.warn("[RFQ] userAccess parse failed, using raw:", e.message);
						setAccessLevel(res?.[0]?.userAccess);
					}

					// Initialize Permission Manager with RFQ-level userAccess
					const permManager = new PermissionManager(res?.[0]?.userAccess);
					setPermissionManager(permManager);
				}

				if (res?.[0]?.id && res?.[0]?.id > 0) {
					formik.setFieldValue("id", res?.[0]?.id);
				}
				if (res?.[0]?.version && res?.[0]?.version > 0) {
					formik.setFieldValue("Version", res?.[0]?.version);
					const sameVersion = res?.[0]?.rfqVersionHistory?.find(x => x.version == res?.[0]?.version);
					setOpenQuotes(sameVersion?.openQuotes == "Y" ? true : false);
					// Reload items with the confirmed version (avoids stale formik value race)
					pullRFQItemServiceFind(Id, res?.[0]?.version);
				}





				if (res?.[0]?.subject) {
					formik.setFieldValue("subject", res?.[0]?.subject);
				}
				if (res?.[0]?.description) {
					formik.setFieldValue("description", res?.[0]?.description);
				}
				if (res?.[0]?.requisitioner) {
					formik.setFieldValue("requisitioner", res?.[0]?.requisitioner);
				}



				if (res?.[0]?.startDate) {


					const startDate = checkUTC(res?.[0]?.startDate)
					const currentDate = new Date();
					formik.setFieldValue("startDate", dayjs(startDate).tz(userDetail?.timeZone));
					if (new Date(startDate) >= currentDate) {
						formik_ApproveReject.setFieldValue("startDate", new Date(startDate));

					}

				}
				if (res?.[0]?.endDate) {

					const endDate = checkUTC(res?.[0]?.endDate)



					formik.setFieldValue("endDate", dayjs(endDate).tz(userDetail?.timeZone));


					formik_ApproveReject.setFieldValue("endDate", new Date(endDate));
				}
				if (res?.[0]?.bidOpeningDate) {
					const bidOpeningDate = checkUTC(res?.[0]?.bidOpeningDate)
					formik.setFieldValue("bidOpeningDate", dayjs(bidOpeningDate).tz(userDetail?.timeZone));
				}
				if (res?.[0]?.purchOrgId && res?.[0]?.purchOrgId > 0) {
					setOrgId(res?.[0]?.purchOrgId)
				}
				if (res?.[0]?.purchGrpId && res?.[0]?.purchGrpId > 0) {
					setOrgGroupId(res?.[0]?.purchGrpId)
				}
				if (res?.[0]?.boqReq) {
					formik.setFieldValue("boqReq", res?.[0]?.boqReq);
				}

				if (res?.[0]?.baseCurrency && res?.[0]?.baseCurrency != "") {
					formik.setFieldValue("baseCurrency", res?.[0]?.baseCurrency);
				}

				formik.setFieldValue("IsMultiCurrency", res?.[0]?.isMultiCurrency ?? false);




				if (
					res?.[0]?.multicurrencytList &&
					res?.[0]?.multicurrencytList?.length && res?.[0]?.isMultiCurrency
				) {
					// Ensure we have valid data before setting
					const currencyList = res[0].multicurrencytList.filter(item => item && typeof item === 'object');
					if (currencyList.length > 0) {
						setInputList(currencyList);
						formik.setFieldValue("multicurrencylist", currencyList);
					}
				}
				if (res?.[0]?.technicalApproval && res?.[0]?.technicalApproval != "") {
					formik.setFieldValue(
						"technicalApproval",
						res?.[0]?.technicalApproval
					);
				}

				if (res?.[0]?.termandCondition) {
					formik.setFieldValue("termandcondition", res?.[0]?.termandCondition);
				}
				if (res?.[0]?.openQuotes) {
					const value = res?.[0]?.openQuotes == "N" ? true : false
					formik.setFieldValue("sealedBid", value);
				}

				if (res?.[0]?.rfqType) {

					formik.setFieldValue("RFQType", res?.[0]?.rfqType);
				}

				if (res[0]?.rfqVersionHistory && res[0]?.rfqVersionHistory?.length > 0) {


					const rfqVersionHistorydata = res[0]?.rfqVersionHistory.map((item) => {
						const bidOpeningDate = checkUTC(item.bidOpeningDate)
						return {
							...item,
							bidOpeningDate: bidOpeningDate ? dayjs(item.bidOpeningDate).tz(userDetail?.timeZone) : null
						}
					})

					formik.setFieldValue("RFQVersionHistory", rfqVersionHistorydata);

				}




				if (res[0]?.stage) {
					setCurrentStage(res[0]?.stage);


				}


			}
		});
	};

	// Fetch Requisitioner List
	const PullUserDesignation = async () => {
		if (requisitionerListLoaded || loadRequisitioner) {
			return; // Don't fetch if already loaded or currently loading
		}
		setLoadRequisitioner(true);
		try {
			const url = `/api/User/Find?CustomerId=${customerid}`;
			const res = await apiClient.getres(url, atoken);

			// Use the response data directly and add "None" option to the list
			const userDesignations = res?.data?.result ?? [];  // Use the data as it is, no filtering
			// Add "None" option to the list
			setRequisitionerList(['None', ...userDesignations]);
			setRequisitionerListLoaded(true);
		} catch (error) {
			console.error('Error fetching user designations:', error);
			toast.error('Failed to load user designations list');
		}
		finally {
			setLoadRequisitioner(false);
		}

	};

	// Fetch UOM List 
	// const pullUOMMasterList = () => {
	// 	var data = {
	// 		CustomerId: customerid,
	// 		IsActive: true,
	// 	};
	// 	UOMMasterList(data, atoken).then((res) => {
	// 		setUOMMaster(res);
	// 	});
	// };

	const handleUomList = (array) => {
		setUOMMaster(array);
	};
	// versionOverride: pass an explicit version when calling right after pullgetRFQManageFind
	// (avoids stale formik.values.Version due to async setFieldValue)
	const pullRFQItemServiceFind = (refid, versionOverride) => {
		const ver = versionOverride !== undefined
			? parseInt(versionOverride)
			: parseInt(formik?.values?.Version);
		var data = {
			RFQId: refid,
			// undefined is excluded from query params by the builder → server uses default behavior.
			// Do NOT fall back to 1: that would filter to version-1 items only on multi-version RFQs.
			Version: isNaN(ver) ? undefined : ver,
			CustomerId: customerid,
		};

		getRFQItemServiceFind(data, atoken).then((res) => {
			if (res && res?.length > 0) {
				setrfqItemsList(res);
			} else {
				setrfqItemsList([]);
			}
		});
	};

	const [selectedCommercalDll, setSelectedCommercalDll] = useState([]);
	const pullLibraryOrgEntityFind = () => {
		var data = {
			CustomerId: customerid,
			LibraryType: "CommercialLibrary",
			EventType: "RFQ",
			IsActive: true
		};
		//console.log("request id getLibraryOrgEntityFind", data);
		getLibraryOrgEntityFind(data, atoken).then((res) => {

			//console.log("response getLibraryOrgEntityFind", res);
			if (res && res?.length > 0) {
				setGeneraltermsDDl(res);
				console.log(
					"tempDataEditData?-----0--0-0-0-",
					tempDataEditData?.[0]?.rfqTermsCondition
				);
				if (
					tempDataEditData?.[0] &&
					tempDataEditData?.[0]?.rfqTermsCondition &&
					tempDataEditData?.[0]?.rfqTermsCondition?.length &&
					res?.length
				) {
					const mappedRecords = tempDataEditData?.[0]?.rfqTermsCondition?.map(
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

	const [questionLibraryDll, setQuestionLibraryDll] = useState(null);
	const [selectedQuesionArray, setSelectedQuesionArray] = useState([]);
	const pullLibraryOrgEntityFindQues = () => {
		var data = {
			CustomerId: customerid,
			LibraryType: "QuestionLibrary",
			EventType: "RFQ",
			IsActive: true
		};

		getLibraryOrgEntityFind(data, atoken).then((res) => {

			if (res && res?.length > 0) {
				setQuestionLibraryDll(res);

				// set old  rfqQuestionMaster
				if (
					tempDataEditData?.[0] &&
					tempDataEditData?.[0]?.rfqQuestionMaster &&
					tempDataEditData?.[0]?.rfqQuestionMaster?.length
				) {

					const mappedRecordsDll =
						tempDataEditData?.[0]?.rfqQuestionMaster?.map((item) => {
							const record = res?.find(
								(record) => record.id === item?.libraryId
							);
							//console.log("recorddd" + JSON.stringify(record));
							return record?.id;
						});
					const uniqueMappedRecords = Array.from(new Set(mappedRecordsDll));
					//console.log("uniqueMappedRecords", uniqueMappedRecords?.[0]);

					if (uniqueMappedRecords && uniqueMappedRecords?.length) {
						const updatedrecord = res?.filter(
							(x) => x.id == uniqueMappedRecords?.[0]
						);


						if (updatedrecord?.length > 0) {

							setSelectedQuesDll(updatedrecord[0]);
							const { id } = updatedrecord[0]

							setLibraryId(id)
						}
					}

					setSelectedQuesionArray(tempDataEditData?.[0]?.rfqQuestionMaster);
				}
			}
		});
	};

	//to set question for edit
	const [questionforedit, setQuestionForEdit] = useState(null);
	const handleSelectedEditQuestion = (question) => {

		setQuestionForEdit(question)
		setState({ ...state, qusDrawer: true })
	}
	const handleSelectedQArray = (value) => {

		setSelectedQuesionArray(value);
	};

	const pullCommercialLibFind = async (selectedItems) => {
		//console.log("selectedItems", selectedItems?.id);
		var data = {
			CustomerId: customerid,
			LibraryId: selectedItems?.id, // change when multiselect complated
			IsActive: true
		};
		//console.log("request id getCommercialLibFind", data);
		const queryParams = Object?.entries(data)
			?.filter(
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
				rfqId: idFromURL,
				termsId: item?.id,
			}));
			//console.log("modifiedRes", modifiedRes);
			setCommercialLibFind(modifiedRes);
			//here we update old selected commerical terms value
			// condition check here
			if (
				tempDataEditData?.[0] &&
				tempDataEditData?.[0]?.rfqTermsCondition &&
				tempDataEditData?.[0]?.rfqTermsCondition?.length &&
				modifiedRes?.length
			) {


				const updatedArray = modifiedRes?.map((item) => {

					const matchingItem = tempDataEditData?.[0]?.rfqTermsCondition?.find(
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
							rfqTermCurrency: matchingItem?.rfqTermCurrency,
						};
					}
					return item;
				});
				//console.log("updatedArray", updatedArray);
				setCommercialLibFind(updatedArray);
			}
		}
	};

	const [selectedQuesDll, setSelectedQuesDll] = useState();
	const pullQuestionsLibFind = (selectedItem) => {
		//console.log("selectedItems", selectedItem);
		var data = {
			CustomerId: customerid,
			LibraryId: selectedItem?.id,
		};
		//console.log("request id getCommercialLibFind", data);
		getQuestionsLibFind(data, atoken).then((res) => {
			//console.log("response getCommercialLibFind", res);
			if (res && res?.length > 0) {

				setSelectedQuesionArray(res);
				// setCommercialLibFind(res)
			}
		});
	};

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


	const [selectedcommercialterm, setSelectedCommercialTerm] = useState(null);
	//it is for opening modal of commercial term currency
	const handleChangeCom = (index, value, x, openmodal) => {

		const item = commercialLibFind[index];
		if (openmodal) {
			setModal1(true)
		}
		// Check if the valuetype is "Currency" to open the modal
		if (item.valuetype === "Currency") {
			const list = [...commercialLibFind];
			if (value) {
				list[index]["level"] = value;
			}

			//to handle selected dependent formula field
			if (value == "item") {
				const selectedFieldGroup = list[index].fieldNameGroup.split(',');
				// Iterate through the list to update dependent fields
				list.forEach(item => {
					if (selectedFieldGroup.includes(item.fieldName)) {
						item.isSelected = true; // Set isSelected to the same value
						item.level = "item"
					}
				});


			}

			setCommercialLibFind(list);
			// set object for commecial  term

			setSelectedCommercialTerm(x);
			if (x?.rfqTermCurrency && x?.rfqTermCurrency?.length > 0) {
				setcommcurrencyList(x?.rfqTermCurrency);
			}
			//setModal1(true);

		} else {
			const list = [...commercialLibFind];
			list[index]["level"] = value;

			//to handle selected dependent formula field
			if (value == "item") {
				const selectedFieldGroup = list[index].fieldNameGroup.split(',');
				// Iterate through the list to update dependent fields
				list.forEach(item => {
					if (selectedFieldGroup.includes(item.fieldName)) {
						item.isSelected = true; // Set isSelected to the same value
						item.level = "item"
					}
				});


			}
			// Get the fieldNameGroup of the selected item

			setCommercialLibFind(list);
			setModal1(false);
		}
	};
	//to handle multicurrency submit modal for commercial term
	const handlecurrencytermmodal = () => {
		//console.log();
		const updatedlist = commercialLibFind.map((x, i) => {
			if (x.termsId == selectedcommercialterm?.termsId) {
				x.rfqTermCurrency = commcurrencyList;
			}
			return x;
		});
		setCommercialLibFind(updatedlist);
		setModal1(false);
		setSelectedCommercialTerm(null);
		setcommcurrencyList([
			{ id: "0", baseCurrency: "", currencyConversion: "" },
		]);
	};

	const handleChangeComQues = (index, value) => {

		const list = [...commercialLibFind];
		list[index]["requirement"] = value;
		setCommercialLibFind(list);
	};



	//to autoselect required formula field
	const handleComItemCheck = (index, value) => {

		const list = [...commercialLibFind];



		// Set isSelected for the selected item
		list[index]["isSelected"] = value;





		setCommercialLibFind(list);
	};


	const handleComItemAllCheck = (value) => {

		//console.log("value", value);
		const list = commercialLibFind?.map((component) => ({
			...component,
			isSelected: value,
		}));
		setCommercialLibFind(list);
	};

	const [itemEditTempData, setItemEditTempData] = useState([]);
	const handleEditItem = useCallback((dataItem) => {
		//console.log("dataItem", dataItem);
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
			pullRFQItemServiceFind(idFromURL);
		},
		[idFromURL]
	);

	const callbackItemAdd = useCallback(
		(pass) => {
			setState({ ...state, addProductDrawer: false });
			setItemEditTempData([]);
			pullRFQItemServiceFind(idFromURL);
		},
		[idFromURL]
	);

	const removeItemData = (value) => {
		var data = {
			// RFQId: Number(idFromURL),
			id: Number(value),
		};

		RFQItemServiceDelete(data, atoken).then((res) => {
			// console.log('response RFQItemServiceDelete', res);
			if (res) {
				pullRFQItemServiceFind(idFromURL);
				setRemoveItem(null);
				setConfirmDelete(false);
			}
		});
	};

	// const saveRFQCommLibraryAdd = () => {

	// 	const selectedCommTerms = commercialLibFind?.filter(
	// 		(s) => s.isSelected == true
	// 	);



	// 	//to handle commercial currency on formula

	// 	const commercialfieldlist = selectedCommTerms.filter(x => x.level === "item").map(x => x.fieldName);
	// 	const selectedCommTermsItemLevel = selectedCommTerms.filter(x => x.level === "item");

	// 	const isValid = selectedCommTermsItemLevel.some((x) => {
	// 		if (x.formulavalue) {

	// 			const fieldNameGroup = Array.from(x.fieldNameGroup.split(",")).filter(x => x != "Price");
	// 			let notIncluded = fieldNameGroup.filter(element => !commercialfieldlist.includes(element));
	// 			if (notIncluded.length == 1) {
	// 				if (notIncluded[0]?.trim() == "") {
	// 					notIncluded = [];
	// 				}
	// 			}
	// 			if (notIncluded?.length > 0) {
	// 				toast.error(`Required formula fields:[${notIncluded.join(",")}] missing for ${x.name}.Item added at item level must have all required fields included in formula.`, {
	// 					toastId: "commercialtermerror"
	// 				});
	// 				return true; // Indicates a failure
	// 			}
	// 		}
	// 		return false; // No failure found for this item
	// 	});

	// 	if (isValid) {
	// 		return; // Early exit if validation failed
	// 	}


	// 	const hasUnfilledCurrency = selectedCommTerms.some((item) => {
	// 		return item.valuetype === "Currency" && (!item.rfqTermCurrency || item.rfqTermCurrency?.length === 0);
	// 	});

	// 	if (hasUnfilledCurrency) {
	// 		selectedCommTerms.forEach((item) => {

	// 			if (item?.valuetype === "Currency") {
	// 				if (!item.rfqTermCurrency) {
	// 					item.rfqTermCurrency = [{
	// 						id: "0",
	// 						baseCurrency: formik?.values?.baseCurrency,
	// 						currencyConversion: "1",
	// 						rfqId: idFromURL,
	// 					}]
	// 				}
	// 			}
	// 		})

	// 	}
	// 	if (selectedCommTerms && selectedCommTerms?.length) {
	// 		const hasEmptyLevel = selectedCommTerms.some((s) => !s.level);


	// 		if (hasEmptyLevel) {
	// 			toast.error("Please select Type for selected terms", {
	// 				toastId: "rfqmanage_terms"
	// 			});
	// 		} else {
	// 			RFQCommLibraryAdd(selectedCommTerms, idFromURL, atoken).then((res) => {
	// 				if (res) {
	// 					//console.log("RFQCommLibraryAdd -response ", res);
	// 					toast.success(`Data Saved Successfully`, {
	// 						toastId: "rfqmanage_comm"
	// 					});
	// 					if (idFromURL && idFromURL > 0) {
	// 						pullgetRFQManageFind(idFromURL);
	// 						setValue(4);
	// 					}
	// 				}
	// 				else {
	// 					toast.error(`Error  while saving data`, {

	// 						toastId: "rfqerror_comm"
	// 					});
	// 				}



	// 				//}
	// 			});
	// 		}
	// 	} else {
	// 		setValue(4);
	// 	}
	// };

	// const saveRFQQuestionLibAdd = () => {
	// 	//console.log("selectedQuesionArray", selectedQuesionArray);

	// 	const QuesionArray = selectedQuesionArray?.map((obj) => ({
	// 		id: 0,
	// 		rfqId: idFromURL,
	// 		questionId: obj?.id ? obj?.id : 0,
	// 		questionDescription: obj?.questionDescription
	// 			? obj?.questionDescription
	// 			: "",
	// 		questionRequirement: obj?.questionRequirement
	// 			? obj?.questionRequirement
	// 			: "",
	// 		attachement: obj?.attachement ? obj?.attachement : false,
	// 		attachedFileName: obj?.attachedFileName ? obj?.attachedFileName : "",
	// 		optionType: obj?.optionType ? obj?.optionType : false,
	// 		weightage: obj?.weightage ? obj?.weightage : 0,
	// 		mandatory: obj?.mandatory ? obj?.mandatory : false,
	// 		questionRequirement: obj?.questionRequirement
	// 			? obj?.questionRequirement
	// 			: "",
	// 		isActive: obj?.isActive ? obj?.isActive : false,
	// 		libraryId: obj?.libraryId ? obj?.libraryId : 0,
	// 		libraryEntity: obj?.libraryEntity ? obj?.libraryEntity : "",
	// 		questioncategoryId: obj?.questioncategoryId ? obj?.questioncategoryId : 0,
	// 		questionCategory: obj?.questionCategory ? obj?.questionCategory : "",
	// 		questionSubcategoryId: obj?.questionSubcategoryId
	// 			? obj?.questionSubcategoryId
	// 			: 0,
	// 		questionSubCategory: obj?.questionSubCategory
	// 			? obj?.questionSubCategory
	// 			: "",
	// 		//questionOption: obj?.questionOption && obj?.questionOption?.length > 0 ? obj?.questionOption : [],
	// 		questionOption:
	// 			obj?.questionOption && obj?.questionOption?.length > 0
	// 				? obj.questionOption.map(({ id, ...rest }) => ({ ...rest }))
	// 				: [],
	// 		// rfqqUestion: obj?.questionDescription ? obj?.questionDescription : "",
	// 	}));
	// 	if (QuesionArray && QuesionArray?.length > 0) {
	// 		//console.log("call QuesionArray api request", QuesionArray);
	// 		setLoading(true)
	// 		RFQQuestionLibAdd(QuesionArray, idFromURL, atoken).then((res) => {
	// 			//console.log("RFQQuestionLibAdd -response ", res);
	// 			toast.success(`Data Saved Successfully`, {
	// 				toastId: "rfqmanage_Qlib"
	// 			});
	// 			//if (res && res > 0) {
	// 			// reload temp data
	// 			if (idFromURL && idFromURL > 0) {
	// 				pullgetRFQManageFind(idFromURL);
	// 				setValue(5);
	// 				setLoading(false)
	// 			}

	// 			//}
	// 		});
	// 	} else {
	// 		setValue(5);
	// 	}
	// };
	//to fetch master data alias list data
	useEffect(() => {

		if (atoken, customerid) {
			PullPurchaseOrgAll();
			// PullUserDesignation();
			// pullUOMMasterList();

		}

	}, [atoken, customerid]);


	useEffect(() => {

		const data = queryParams.get("CommId")?.trim();
		if (data) {
			dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
		}

		// const pullMessageList = async () => {

		// 	var data = {
		// 		CustomerId: customerid,
		// 		SortingColumn: "Id",
		// 		EventId: pageSlug,
		// 		EventType: "RFQ",
		// 		CommDetails_CommParticipantUser_UserId: userDetail?.id,

		// 	};
		// 	const queryParams = buildQueryParams(data)
		// 	const res = await apiClient.getres(`api/Communication/FindByCommId?${queryParams}`, atoken)

		// 	if (res) {
		// 		const data = res?.data?.result ?? []

		// 		dispatch({ type: actionTypes.SET_Notificationlist, value: data });
		// 	}


		// }

		// if (pageSlug) {
		// 	pullMessageList() // Removed automatic call - now triggered only on bell icon click
		// }




	}, []);
	useEffect(() => {

		if (formik.values.purchOrgId?.id) {
			PullPurchaseGroupAll(formik.values.purchOrgId?.id);
		}
		if (!formik.values.purchOrgId?.id) {
			setPurchaseGroupAllList([])
		}
	}, [formik.values.purchOrgId]);

	// useEffect(() => {

	// 	if (formik.values.purchGrpId && idFromURL) {
	// 		getStageRefreshonPurchGroup();
	// 	}
	// }, [formik.values.purchGrpId, idFromURL]);

	// useEffect(() => {

	// 	pullgetCurrency();
	// }, [atoken]);



	const { pageSlug, supplierid } = useParams();

	// If we're on the create route, ensure the main tab stays on General
	useEffect(() => {
		if (pageSlug === "add") {
			skipAutoTabCheckRef.current = true;
			setValue(1);
		}
	}, [pageSlug]);

	// Debug: log permission/tab state to help diagnose blank General tab (safe: pageSlug is declared)
	useEffect(() => {
		try {
			console.log("RFQ Debug:", {
				pageSlug,
				idFromURL,
				value,
				loadingPermissions,
				showGeneralAccessDenied,
				canReadEarly,
				canCreateEarly,
				stagearray,
				currentStage
			});
		} catch (e) {
			console.error("RFQ Debug error", e);
		}
	}, [pageSlug, idFromURL, value, loadingPermissions, showGeneralAccessDenied, canReadEarly, canCreateEarly, stagearray, currentStage]);

	// If the user has no General READ or CREATE permission, ensure General tab is active
	useEffect(() => {
		if (showGeneralAccessDenied && value !== 1) {
			skipAutoTabCheckRef.current = true;
			setValue(1);
		}
	}, [showGeneralAccessDenied, value]);
	const [activityId, setActvityId] = useState(0);
	const [stageValue, setStageValue] = useState('');
	const [actionType, setActionType] = useState("");

	useEffect(() => {

		const params = new URLSearchParams(searchParams);
		const actionTypeParam = params.get("ActionType");
		const ActivityId = params.get("ActivityId");
		const StageValue = params.get("Stage");
		setActionType(actionTypeParam);
		const newIdFromURL = pageSlug;

		// Only switch to the summary/report view for approval/forward actions when
		// we have an existing RFQ id (not when creating a new one)
		if ((actionTypeParam == "approval" || actionTypeParam == "Forward") && newIdFromURL && newIdFromURL !== "add") {
			setValue(6);
		}

		setActvityId(ActivityId ?? 0);
		setStageValue(StageValue ?? '');
		//#eventid and eventtype
		dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "RFQ" });

		setIdFromURL(newIdFromURL);
		setcommcurrencyList([
			{
				id: "0",
				baseCurrency: "",
				currencyConversion: "",
				rfqId: newIdFromURL,
			},
		]);

		updateRequestCell(newIdFromURL);
	}, [searchParams]);


	useEffect(() => {

		if (idFromURL && idFromURL > 0 && purchaseAllList && purchaseGroupAllList && requisitionerList) {
			pullgetRFQManageFind(idFromURL);
		}

		else {

			if (userDetail?.name) {
				const foundOrg = purchaseAllList?.find(org => org.id === userDetail.purchOrgId);
				formik.setFieldValue("purchOrgId", foundOrg ?? null);

				const userOrgGroup = userDetail.purchGrpId;
				if (userOrgGroup?.length > 0) {
					const foundGroup = purchaseGroupAllList?.find(grp => grp.id === userOrgGroup[0].orgGroupId);
					formik.setFieldValue("purchGrpId", foundGroup ?? null);
				} else {
					formik.setFieldValue("purchGrpId", null);
				}
			}
		}
	}, [idFromURL, purchaseAllList, location, requisitionerList]);



	useEffect(() => {
		pullgetCurrency();
	}, [atoken]);



	const saveRFQLineItems = async (exceldata) => {
		const data = exceldata?.map((rfqitem, index) => {
			const i = (rfqItemsList?.length + index + 1).toString();
			return {
				...rfqitem,
				customerId: customerid,
				rfqId: idFromURL,
				poDate: new Date(rfqitem?.poDate),
				srno: i,
			};
		});


		const res = await apiClient.postres(
			`/api/RFQItemService/${idFromURL}/AddItems`,
			data,
			atoken
		);

		if (res) {
			callbackItemAdd(res);
			toast.success("Data Saved successfully", {
				toastId: "RFQItemService_add"
			});
		}
	};

	const handleSaveContinue = async () => {
		if (value == 1) {

			const currentDate = new Date();
			if (formik.values.IsMultiCurrency) {
				if (inputList?.length === 0) {
					toast.error("Please add multi-currency details.", {
						toastId: "multicurrency_error"
					});
					return;
				}
			}

			// Prevent auto-selection effect from overriding our programmatic navigation
			skipAutoTabCheckRef.current = true;

			// Validate the form first
			const errors = await formik.validateForm();

			// If there are validation errors, mark all fields as touched and stop
			if (Object.keys(errors).length > 0) {
				// Mark all fields as touched to show validation errors
				formik.setTouched({
					subject: true,
					description: true,
					endDate: true,
					bidOpeningDate: true,
					purchOrgId: true,
					purchGrpId: true,
					termandcondition: true,
				});

				toast.error("Please fill all required fields.", { toastId: "rfq_validation_error" });
				return;
			}

			// Submit the form and wait for onSubmit to complete (so idFromURL is set)
			await formik.submitForm();

			// Only advance to Items/Services if submission was successful
			// The onSubmit handler will set setValue(2) if successful
		}
		if (value == 2) {
			if (rfqItemsList?.length < 1) {
				toast.error("please add items to continue", {
					toastId: "additems_error"
				});
				return;
			}
			setValue(3);
		}
		if (value == 3) {
			//saveRFQCommLibraryAdd();

			const res = await EventCommercialScreenRef?.current?.saveRFQCommercialLibrary();
			if (res) {
				setValue(4);
			}
		}
		if (value == 4) {
			const res = await EventQuestionScreenRef?.current?.saveEventQuestion();
			if (res) {
				setValue(5);
			}
			//saveRFQQuestionLibAdd();
		}

		if (value == 5) {
			saveSelectedSuppliers();
			setApproverShow(true)
		}

	};

	const [modalcancelOpen, setModalCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const [rfqerror, setRfqError] = useState("");

	const handleCancel = () => {
		setModalCancelOpen(true);
	}

	const handleCancelRFQModal = async (confirm) => {
		if (confirm) {
			if (!cancelReason.trim()) {
				setRfqError("This field is required.");
				return;
			}
			else {
				const cancelbuttonvalue = {
					rfqId: parseInt(pageSlug),
					Status: "Cancel",
					Comment: cancelReason,
				}
				const queryParams = buildQueryParams(cancelbuttonvalue)
				const res = await apiClient.postres(`/api/RFQManage/RFQCancel?${queryParams}`, null, atoken);
				if (res) {
					toast.success(`RFQ Cancel successfully.`, {
						toastId: "Cancel_error"
					});
					navigate(`/configuration/manage-rfq`);
				}
			}
		} else {
			setModalCancelOpen(false);
			setCancelReason("");
			setRfqError("");
		}
	};

	const handleCancelInputChange = (e) => {
		setCancelReason(e.target.value);
		if (e.target.value.trim()) {
			setRfqError("");
		}
	};


	const handlecheckpreview = async () => {
		//to check formik validity dynamically
		if (!formik.isValid) {
			toast.error("Please make sure all required fields are properly filled.", {
				toastId: "preview_error"
			});
			setValue(1);
			return false;
		}

		return true;
	};

	const checkApprovers = () => {

		if (!stagelist || stagelist.length === 0) {
			toast.error("Error: No stages found in workflow.");
			return false;
		}
		const isStageRequired = stagelist.filter((x) => x.required && x.wfId > 0);


		for (const stage of isStageRequired) {

			const matchingWorkflow = approverInWorkflow?.find(workflow => workflow.stage == stage.wfname);

			if (!matchingWorkflow) {
				toast.error(`No workflow found for stage "${stage.wfname}".`);
				return false;
			}

			// if ((!matchingWorkflow.approvers || matchingWorkflow.approvers.length == 0) && stage.required) {
			if ((matchingWorkflow.approvers && matchingWorkflow.approvers.length == 0)) {
				toast.error(`The mandatory  workflow "${stage.wfname}" has no approvers.`);
				return false;
			}

		}
		return true;
	};

	const handleErrorRFQSubmit = () => {

		const currentDate = new Date();

		if (!formik.values.startDate) {
			formik.values.startDate = currentDate;
		}

		if (stagearray.includes(currentStage)) {
			if (formik.values.startDate < currentDate) {
				formik.values.startDate = currentDate;
			}
		}

		if (formik.values?.endDate?.toISOString() < currentDate.toISOString()) {
			toast.error("End date cannot be before the current date.", {
				toastId: "rfqenddate"
			});

			setValue(1)
			setApproverShow(false)
			formik.handleSubmit()
			return false;
		}

		if (formik.values?.startDate > formik.values?.endDate) {
			toast.error("Start date cannot be after end date.", {
				toastId: "rfqenddate2"
			});
			setValue(1)
			setApproverShow(false)
			return false;
		}

		if (rfqItemsList?.length < 1) {
			toast.error(`select atleast one item`, {
				toastId: "supp_fail"
			})
			setValue(2)
			setApproverShow(false)
			return false;
		}
		if (selectedSupplier?.length < 1) {
			toast.error(`select atleast one supplier`, {
				toastId: "supp_fail"
			})
			setValue(5)
			setApproverShow(false)
			return false;
		}




		return true;
	}

	const handleRFQSubmit = async () => {

		setLoading(true)
		const isSubmit = handleErrorRFQSubmit();
		if (!isSubmit) {
			setLoading(false);
			return;
		}

		const isApprovers = checkApprovers();
		if (!isApprovers) {
			setLoading(false);
			return;
		}



		const data = {
			activityId: activityId,
			RFQId: parseInt(idFromURL),
			CustomerId: customerid,
			Version: formik?.values?.Version
		};
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
		const enddate = formik.values.endDate.toISOString();

		const selectedsupp = InvitedSupplierModal(
			selectedSupplier,
			parseInt(idFromURL),
			enddate,
			parseInt(customerid),
			userDetail,
			formik?.values?.Version
		);

		const invitedSuppliers = {
			rfqVendorDetails: selectedsupp,
			activityId: parseInt(activityId),
			RFQId: parseInt(idFromURL),
			CurrentStage: currentStage

		};

		const ressupp = await apiClient.postres(
			`/api/RFQVendorInvite/${idFromURL}/Add`,
			invitedSuppliers,
			atoken
		);



		const res = await apiClient.postres(
			`/api/RFQManage/RFQSubmit`,
			datapayload,
			atoken
		);

		if (res) {
			toast.success("RFQ Published Successfully", {
				toastId: "submit_published"
			});
			navigate(`/configuration/manage-rfq`);
		}
		setLoading(false);
	};

	// useEffect(() => {

	// 	if (
	// 		(value == 1 || value == 6) &&
	// 		idFromURL &&
	// 		tempDataEditData &&
	// 		tempDataEditData?.length > 0
	// 	) {
	// 		// pullRFQItemServiceFind(idFromURL);
	// 		pullLibraryOrgEntityFind();
	// 		pullLibraryOrgEntityFindQues();
	// 		// getTotalSupplier();
	// 	}
	// }, [idFromURL, tempDataEditData, value]);
	const [tabloading, setTabLoading] = useState(false)
	const [isUploading, setIsUploading] = useState(false);

	useEffect(() => {

		if (value == 2 && idFromURL) {
			// Only call if pullgetRFQManageFind has already completed (tempDataEditData is set).
			// If tempDataEditData is not yet loaded, pullgetRFQManageFind will call
			// pullRFQItemServiceFind(id, version) directly once it finishes — no duplicate needed.
			// This prevents a race where the no-version call overwrites correctly loaded items.
			if (tempDataEditData && tempDataEditData.length > 0) {
				const resolvedVersion = tempDataEditData?.[0]?.version || formik?.values?.Version;
				pullRFQItemServiceFind(idFromURL, resolvedVersion);
			}
		}
		if (value == 3) {
			pullLibraryOrgEntityFind();
		}
		if (value == 4) {
			pullLibraryOrgEntityFindQues();
		}
		if (value == 5) {


			getTotalSupplier();
			// getCategorylist();
		}
	}, [idFromURL, value]);


	//tab2



	const fastapiclient = new FastApiClient();


	const handleItemsUpload = async (file) => {

		const data = {
			templateId: 3,
			customerId: parseInt(customerid),
			flagName: "RFQId",
			flagId: idFromURL,
			file: file,
			createdById: userDetail?.id,
			createdByName: userDetail?.name
		}
		setIsUploading(true); // Start loader
		try {
			const host = window.location.host;      // buyer.pe.com
			const cleanHost = host.split(":")[0];   // remove port
			const tenant = cleanHost.split(".")[0];
			const response = await fastapiclient.postresmultipart(`bulk-upload/excel-upload`, data, tenant)
			if (response) {

				const errorDetails = response.data?.error_details;
				// if (Array.isArray(errorDetails) && errorDetails.length > 0) {
				// 	const allErrors = errorDetails.join("\n");
				// 	toast.error(`Errors encountered:\n${allErrors}`, { autoClose: false });
				// }
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
								<div
									key={index}
									style={{
										marginBottom: '4px',
										//whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}
								>
									<strong>{field}</strong> is missing in rows: {Array.from(rows).sort((a, b) => a - b).join(', ')}
								</div>
							))}
						</div>
					);

					toast.error(formattedErrorElement, {
						autoClose: true,
						style: {
							maxHeight: '300px',
							overflowY: 'auto',
							maxWidth: '90vw',
							width: 'auto',
							whiteSpace: 'normal',
							lineHeight: '1.5',
						},
					});
				}
				else {
					toast.success("File uploaded successfully");
				}
				pullRFQItemServiceFind(idFromURL);
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
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
	}


	const downloadItemsExcel = async () => {
		await downloadExcelTemplate({
			customerId: customerid,
			templateId: 3,
			fileName: `RFQ_template_${new Date().getTime()}.xlsx`,
			eventType: "RFQ"
		});
	}

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

	const getUserRoleRights = async () => {
		const obj = {
			FeatureName: "Request for Quotation",
			UserId: userDetail?.id,
			CreatedById: userDetail?.id
		}
		const queryParams = buildQueryParams(obj);

		try {
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);

			if (res?.data) {
				const permManager = new PermissionManager(Array.isArray(res.data) ? res.data : []);
				setPermissionManager(permManager);
			}
		} catch (e) {
			console.warn("[RFQ] getUserRoleRights failed:", e.message);
		} finally {
			setLoadingPermissions(false);
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
			const resetSuppliers = totalSupplier?.map((supplier) => ({
				...supplier, isShow: false,
			}));

			const updatedSuppliers = resetSuppliers?.map((supplier) => {
				if (emails.includes(supplier.email)) {
					return { ...supplier, isShow: true };
				}
				return supplier;
			});
			setTotalSupplier(updatedSuppliers);
		} else {
			const resetSuppliers = totalSupplier?.map((supplier) => ({
				...supplier, isShow: false,
			}));
			setTotalSupplier(resetSuppliers);
		}
	};

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

		if (Array.isArray(tempDataEditData) && tempDataEditData.length > 0 && Array.isArray(tempDataEditData[0]?.rfqVendorInvited) && tempDataEditData[0]?.rfqVendorInvited.length > 0) {

			const ids = tempDataEditData[0].rfqVendorInvited?.filter(x => x.version == formik?.values?.Version).map((item) => item.vendorId);
			const contactids = tempDataEditData[0].rfqVendorInvited.filter(x => x.version == formik?.values?.Version).map((item) => item.contactId);

			setttingSelectedSupplier(ids, true, res?.data, tempDataEditData[0].rfqVendorInvited?.filter(x => x.version == formik?.values?.Version), contactids);
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
				return { ...supplier, isSelected: value, rfqLoadingFactor: selectedVendor?.rfqLoadingFactor };
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

		console.log("selectedList ", selectedList)
		setSelectedSupplier(selectedList);
	};

	const [selectedSupplier, setSelectedSupplier] = useState([]);
	console.log("selectedSupplier::", selectedSupplier)
	const [matchedSuppliers, setMatchedSuppliers] = useState([]);
	const handlefilteredSupplier = (data) => {
		setMatchedSuppliers(data);
	}
	const handleSelectedSupplier = async (row, value) => {
		if (!value && row.id) {
			const data = {
				RFQId: idFromURL,
				VendorId: row.id
			}
			const queryparam = buildQueryParams(data);
			const res = await apiClient.put(`/api/RFQVendorInvite/Delete?${queryparam}`, null, atoken)
			if (res) {
				toast.error("Supplier removed Successfully", {
					toastId: "abheedel"
				})

			}
		}
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
	const [selectAll, setSelectAll] = useState(true);
	const handleSelectAllSuppliers = (selectAll) => {
		const updatedList = totalSupplier?.map((supplier) => ({
			...supplier,
			isSelected: selectAll,
		}));
		setTotalSupplier(updatedList);

		setSelectedSupplier(selectAll ? updatedList : []);
	};

	const clearSelectedSupplier = async (x, value) => {

		//delete supplier from table
		if (x.id) {
			const data = {
				RFQId: idFromURL,
				VendorId: x.id,
				Version: formik?.values?.Version
			}
			const queryparam = buildQueryParams(data);
			const res = await apiClient.put(`/api/RFQVendorInvite/Delete?${queryparam}`, null, atoken)
			if (res) {
				toast.error("Supplier removed Successfully", {
					toastId: "abheedel"
				})

			}
		}
		const email = x?.email;
		const index = totalSupplier.findIndex(
			(supplier) => supplier.email === email
		);
		const list = [...totalSupplier];
		list[index]["isSelected"] = value;
		setTotalSupplier(list);
		const selectedList = list?.filter((s) => s?.isSelected == true);

		setSelectedSupplier(selectedList);
	};

	const clearALLSelectedSupplier = async () => {

		//to remove all  supplier from given event 
		const data = {
			RFQId: idFromURL

		}
		const queryparam = buildQueryParams(data);
		const res = await apiClient.put(`/api/RFQVendorInvite/Delete?${queryparam}`, null, atoken)
		if (res) {
			toast.error("All Suppliers removed Successfully From Event", {
				toastId: "abheedel"
			})

		}


		const list = totalSupplier?.map((item) => ({ ...item, isSelected: false }));
		setTotalSupplier(list);

		setSelectedSupplier([]);



	};
	const saveSelectedSuppliers = async () => {
		const enddate = formik?.values?.endDate?.toISOString();
		const data = InvitedSupplierModal(
			selectedSupplier,
			parseInt(idFromURL),
			enddate,
			parseInt(customerid),
			userDetail,
			formik?.values?.Version
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
			RFQId: parseInt(idFromURL),
			CurrentStage: currentStage
		};

		const res = await apiClient.postres(
			`/api/RFQVendorInvite/${idFromURL}/Add`,
			invitedSuppliers,
			atoken
		);

		if (res) {

			pullgetRFQManageFind(idFromURL)
			setRFQPreview(true)
			setValue(7)

			setSelectedMenuItem("Publish RFQ")
			toast.success(`Suppliers saved successfully`, {
				toastId: "supplierinvitation_succ"
			});

		}
	};


	// loading factor modal state
	const [supplierRowMenuAnchor, setSupplierRowMenuAnchor] = useState(null); // { el, vendor }
	const [storeVId, setStoreVId] = useState('');
	const [filteredLoadingFactors, setFilteredLoadingFactors] = useState([]);
	const rfqReportActionsRef = useRef(null);
	const [rfqActionsPortalReady, setRfqActionsPortalReady] = useState(false);
	const [erfqActiveSubTab, setErfqActiveSubTab] = useState(0);
	const [isUpdated, setIsUpdated] = useState(false);
	const [approvershow, setApproverShow] = useState(true);
	const handleApprover = (booleanvalue) => setApproverShow(booleanvalue);

	const queryParams = new URLSearchParams(location.search);

	const handleLoadingFactorClick = (vendor) => {
		setStoreVId(vendor?.vendorId);
		setupdatesupplieronloading(0);
		setFilteredLoadingFactors(vendor?.rfqLoadingFactor ?? []);
		setLoadingModal(true);
	};

	const handleLoadingFactorNew = (vendor) => {
		const newFactors = JSON.parse(vendor?.loadingFactors ?? '[]').map((item) => ({
			rfqId: parseInt(idFromURL),
			version: vendor.version,
			customerId: vendor.customerId,
			vendorId: vendor?.vendorId,
			factorDesc: item.FactorDesc,
			factorType: item.FactorType,
			...(item.FactorType === 'A'
				? { loadingAmount: parseFloat(item.LoadingAmount) }
				: { factorPerc: parseFloat(item.FactorPerc) }),
			loadingOn: 'RFQ',
		}));
		setStoreVId(vendor?.vendorId);
		setupdatesupplieronloading(0);
		setFilteredLoadingFactors(newFactors);
		setLoadingModal(true);
	};

	const validationSchemaApprover = yup.object().shape({
		status: yup.string().required("status is required"),
	});
	const formik_ApproveReject = useFormik({
		enableReinitialize: true,
		initialValues: {
			rfqId: parseInt(idFromURL),
			status: actionType == "Forward" ? "Forward" : "Approved",
			approveComment: "",
			activityId: parseInt(activityId),
			startDate: null,
			endDate: null
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {
			setLoading(true)
			//no need to send startdate and enddate in other case
			delete values?.startDate
			delete values?.endDate
			const currentDate = new Date();

			if (actionType == 'Forward') {
				const datapayload = getPayloadWithStage(
					"currentStage",
					currentStage,
					stagelist,
					values,
					"currentStage"
				);
				const res = await apiClient.postres(
					`/api/RFQManage/RFQForward`,
					datapayload,
					atoken
				);
				if (res) {
					toast.success(`RFQ Forwarded successfully`, {
						toastId: "supplierforword_suc"
					});
					navigate(`/app`);
				}


				setLoading(false)
				return
			}

			const stageInfo = getStageInfo(currentStage, stagelist);

			let IsApproved = false;
			if (values?.status == "Approved") {
				IsApproved = true
			}
			else {
				IsApproved = false
			}

			const actionData = {
				customerId: parseInt(customerid),
				eventId: parseInt(idFromURL),
				eventType: "RFQ",
				stageId: stageInfo?.currentStageId,
				IsApproved: IsApproved,
				activityId: parseInt(activityId),
				remarks: values?.approveComment,
				vendorId: supplierid ?? 0,
				eventSubject: formik?.values?.subject ?? "",
				RecordCreatorId: EventHeaderDetails?.createdById,

			}

			if (actionType == 'approval') {



				const res = await apiClient.postres(
					`/api/ApprovalAction/ApprovalAction`,
					actionData,
					atoken
				);
				if (res) {
					toast.success(`Action Taken Successfully`, {
						toastId: "supplieraction_error"
					});
					navigate(`/app`);
				}

			}


			else {



				const res = await apiClient.postres(
					`/api/ApprovalAction/ApprovalAction`,
					actionData,
					atoken
				);
				if (res) {
					toast.success(`Action taken successfully`, {
						toastId: "supplierevent_error"
					});
					navigate(`/app`);
				}

			}
			setLoading(false)
		},
	});

	const [eventAppList, setEventAppList] = useState([]);
	const [wfupdate, setwfUpdate] = useState([false]);
	//to get approvers in each workflow to handle required/not required state handling
	const [approverInWorkflow, setApproverInWorkflow] = useState([])
	const handleEventAppList = useCallback((arr, updatedvalue) => {

		setEventAppList(arr);
		setApproverInWorkflow(updatedvalue)
	}, []);
	const handleWorkFlowUpdate = useCallback(() => {
		setwfUpdate((prev) => !prev);
	}, []);


	const VendorfilterOptions = createFilterOptions({
		matchFrom: "any",
		stringify: (option) => `${option.contactPerson} ${option.email} `,
	});

	const [pageCount, setPageCount] = React.useState(10);
	const [supplierSearchQuery, setSupplierSearchQuery] = React.useState("");

	const supplierMatchesSearch = (x) => {
		if (!supplierSearchQuery?.trim()) return true;
		const q = supplierSearchQuery.toLowerCase();
		return (
			x?.contactPerson?.toLowerCase().includes(q) ||
			x?.email?.toLowerCase().includes(q) ||
			x?.companyName?.toLowerCase().includes(q)
		);
	};

	//pagination for total suppliers
	const [pageTS, setPageTS] = React.useState(1);
	const [totalpageTS, setTotalPageTS] = React.useState(3);
	useEffect(() => {
		handlePaginationTS();
		setTotalPageTS(
			Math.ceil(totalSupplier?.filter((x) => x.isShow && supplierMatchesSearch(x))?.length / pageCount)
		);
	}, [pageTS, totalSupplier, supplierSearchQuery]);

	useEffect(() => { setPageTS(1); }, [supplierSearchQuery]);

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

	//to update purchOrgId
	useEffect(() => {

		if (purchaseAllList && purchaseAllList.length > 0 && OrgId) {

			const updatedvalue = findObjByValueFromArray(purchaseAllList, OrgId, 'id')
			//console.log(purchaseAllList, OrgId, updatedvalue)
			formik.setFieldValue("purchOrgId", updatedvalue);
		}

		//to set default purchase group when purchase group length is 1 
		if (!idFromURL && purchaseAllList && purchaseAllList.length == 1) {
			formik.setFieldValue("purchOrgId", purchaseAllList[0])
		}

	}, [OrgId, purchaseAllList])
	//to update purchGrpId
	useEffect(() => {

		if (purchaseGroupAllList && purchaseGroupAllList.length > 0 && OrgGroupId) {
			const updatedvalue = findObjByValueFromArray(purchaseGroupAllList, OrgGroupId, 'id')
			//console.log(purchaseGroupAllList,OrgGroupId,updatedvalue)
			formik.setFieldValue("purchGrpId", updatedvalue);
		}
		//to set default purchase group when purchase group length is 1 
		if (!idFromURL && purchaseGroupAllList && purchaseGroupAllList.length == 1) {
			formik.setFieldValue("purchGrpId", purchaseGroupAllList[0])
		}

	}, [OrgGroupId, purchaseGroupAllList])


	useEffect(() => {

		handlePaginationSS();
		setTotalPageSS(Math.ceil(selectedSupplier?.length / pageCount));
	}, [pageSS, selectedSupplier]);




	//stage handling
	// useEffect(() => {
	// 	let urlparams = {};
	// 	if (idFromURL) {
	// 		
	// 		urlparams = {
	// 			EventType: "RFQ",
	// 			CustomerId: customerid,
	// 			EventId: idFromURL,
	// 			OrgId: formik.values.purchOrgId?.id || 0,
	// 			OrgGroupId: formik.values.purchGrpId?.id || 0,
	// 			Version: parseInt(formik?.values?.Version)
	// 		}

	// 		getEventStages(urlparams);

	// 	}
	// 	else {
	// 		urlparams = {
	// 			EventType: "RFQ",
	// 			CustomerId: customerid,
	// 			EventId: 0,
	// 			OrgId: 0,
	// 			OrgGroupId: 0,

	// 		}
	// 		getEventStages(urlparams);
	// 	}
	// }, [idFromURL]);

	useEffect(() => {
		const urlparams = {
			EventType: "RFQ",
			CustomerId: customerid,
			EventId: idFromURL || 0,
			OrgId: idFromURL ? (formik.values.purchOrgId?.id || 0) : 0,
			OrgGroupId: idFromURL ? (formik.values.purchGrpId?.id || 0) : 0,
			Version: parseInt(formik?.values?.Version) || 1,
		};

		// If no idFromURL, drop Version (since it won’t be relevant)
		if (idFromURL) {
			getEventStages(urlparams);
		}
	}, [idFromURL]); // ✅ runs once on mount, and again when idFromURL changes

	useEffect(() => {
		if (stagelist && stagelist.length > 0) {
			return;
		}
		// pageSlug is synchronously available from useParams() at mount time.
		// idFromURL cannot be used here because it starts as null and is set via
		// setIdFromURL() inside another useEffect — so it's always null when this runs.
		// When an existing RFQ is open, the [idFromURL] effect fetches event-specific stages.
		// Running this generic (EventId: 0) call in parallel races and can overwrite the
		// correct stagelist with template stages, causing wrong stage display in both the
		// status dropdown and workflow panel (EventApprovalBox also receives stagelist).
		if (pageSlug && pageSlug !== 'add') {
			return;
		}
		const urlparams = {
			EventType: "RFQ",
			CustomerId: customerid,
			EventId: 0,
			OrgId: 0,
			OrgGroupId: 0,
		}
		getEventStages(urlparams);
	}, [])



	const getEventStages = async (urlparams) => {
		const queryParams = buildQueryParams(urlparams)
		const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
		if (res?.data?.result.length > 0) {

			const result = res?.data?.result?.filter((item) => item.stageSeq > 0)

			setStageList(result);

			// stagearray intentionally stays ['Draft'] — it represents editable stages only,
			// not all workflow stages. Overwriting it from EventStageFind breaks the
			// read-only vs editable branch logic in the Overview tab.
			// const stagesarray = result?.map((item) => item.currentStage);
		}
	}






	//handle as per role
	useEffect(() => {

		if (accessLevel?.find(x => x.claimType == "Work Flow")?.claimValue?.Read == "N") {
			setApproverShow(false)
		}
	}, [])



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
				skipAutoTabCheckRef.current = true;
				return setValue(2);
			case 'report':
				return tabReport();

			default:
				return '';
		}
	};

	const tabReport = () => {
		// Don't open the summary/report view when creating a new RFQ (pageSlug === 'add' or no id yet)
		if (pageSlug === "add" || idFromURL === "add" || !idFromURL) {
			return;
		}
		setValue(6);
		setTabShow(false);

	}

	const handlePaginationSS = (event, value) => {
		if (value) {
			setPageSS(value);
		}
	};
	const [showTable, setShowTable] = useState(false);
	const [rfqpreview, setRFQPreview] = useState(true);

	const handleClearAll = async () => {
		setConfirmClearAllItems(false);
		const res = await apiClient.postres(
			`/api/RFQItemService/${idFromURL}/DeleteAll`,
			null,
			atoken
		);
		if (res) {
			toast.success(`rfq items deleted successfully`, {
				toastId: "itemdelete_error"
			});
			setrfqItemsList([]);
		}
	};

	// to save attachment as rfq created related to attachment workflow
	const [attachmentforevent, setAttachmentforEvent] = useState(null);
	const handleattachmentforevent = useCallback((data) => {
		setAttachmentforEvent(data);
	}, []);
	const handleAttachmentCount = (count) => {

		setAttachmentCount(count);
	};

	// Debug: Track modal state changes
	useEffect(() => {
		console.log("OpenCurrencyModal state changed to:", OpenCurrencyModal);
	}, [OpenCurrencyModal]);

	useEffect(() => {
		console.log("modal1 state changed to:", modal1);
	}, [modal1]);

	useEffect(() => {

		console.log("Attachments:", attachmentforevent);
	}, [attachmentforevent]);
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		handleItemsUpload(file);
	};
	//to handle edit from preview page
	const handletabEdit = (value) => {
		setRFQPreview(true);
		setValue(value);
	};

	const [open, setOpen] = React.useState(false);
	const handleClose = () => {
		setOpen(false);
	};
	const handleClickOpen = () => {

		setOpen(true);
	};
	const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
	const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);
	const [loadingModal, setLoadingModal] = useState(false);
	const ClosePurcgaseOrgModal = () => setPurchaseOrgModal(false);
	const ClosePurcgaseOrgGrpModal = () => setPurchaseOrgGrpModal(false);
	const [age, setAge] = React.useState('');

	const [anchorEl, setAnchorEl] = React.useState(null);
	const [statusAnchorEl, setStatusAnchorEl] = React.useState(null);
	const [workflowPanelTab, setWorkflowPanelTab] = useState("workflow");

	// ── Fetch right-panel tab data when tab switches ─────────────────────────
	// NOTE: must be AFTER workflowPanelTab declaration to avoid temporal dead zone
	useEffect(() => {
		if (!approvershow) return;
		if (workflowPanelTab === 'history' && idFromURL) {
			fetchPanelHistory();
		}
		if (workflowPanelTab === 'attachments') {
			fetchPanelAttachments();
		}
	}, [workflowPanelTab, approvershow, idFromURL]);

	// ── Right panel: History tab state ──────────────────────────────────────
	const [historyAudit, setHistoryAudit] = useState([]);
	const [historyGraph, setHistoryGraph] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historySelectedItem, setHistorySelectedItem] = useState(null);

	const fetchPanelHistory = async () => {
		if (!idFromURL) return;
		setHistoryLoading(true);
		const params = new URLSearchParams({ CustomerId: customerid, EventType: 'RFQ', EventId: idFromURL }).toString();
		const res = await apiClient.getres(`api/ReportConfig/AuditReport?${params}`, atoken);
		if (res?.data) {
			const audit = res.data?.changeAudit || [];
			const graph = res.data?.stategraph || [];
			setHistoryAudit(audit);
			setHistoryGraph(graph);
			if (audit.length > 0) {
				const latest = [...audit].sort((a, b) => new Date(b.actionDate) - new Date(a.actionDate))[0];
				setHistorySelectedItem(latest);
			}
		}
		setHistoryLoading(false);
	};

	const getHistoryInitials = (name) => {
		if (!name) return '?';
		return name.split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);
	};

	// ── Right panel: Attachments tab state ──────────────────────────────────
	const [panelSavedAttach, setPanelSavedAttach] = useState([]);
	const [panelNewFiles, setPanelNewFiles] = useState([]);
	const [panelAttachLoading, setPanelAttachLoading] = useState(false);
	const [panelAttachDesc, setPanelAttachDesc] = useState('');
	const [panelAttachFile, setPanelAttachFile] = useState(null);
	const [panelAttachError, setPanelAttachError] = useState('');
	const [panelAttachAdding, setPanelAttachAdding] = useState(false);
	const [panelHasCheckboxChanged, setPanelHasCheckboxChanged] = useState(false);
	const [panelIsUpdating, setPanelIsUpdating] = useState(false);
	const panelFileInputRef = useRef(null);

	const fetchPanelAttachments = async () => {
		setPanelAttachLoading(true);
		setPanelHasCheckboxChanged(false);
		if (idFromURL) {
			const params = buildQueryParams({ EventType: 'RFQ', EventId: idFromURL, VendorId: 0 });
			const res = await apiClient.getres(`/api/eventattachment/Find?${params}`, atoken);
			const resData = res?.data?.result || [];
			if (resData.length > 0) {
				const mapped = attachmentmodalforevent(resData, idFromURL, 'RFQ');
				setPanelSavedAttach(mapped);
				handleattachmentforevent(mapped);
				handleAttachmentCount(mapped.length);
			} else {
				setPanelSavedAttach([]);
				handleattachmentforevent([]);
				handleAttachmentCount(0);
			}
		} else {
			const payload = buildQueryParams({ CustomerId: customerid, eventtype: 'RFQ', isactive: 'true' });
			const res = await apiClient.getres(`/api/Doclib/Find?${payload}`, atoken);
			const resData = res?.data?.result || [];
			if (resData.length > 0) {
				const mapped = eventattachmentmodal(resData, 0, 'RFQ');
				setPanelSavedAttach(mapped);
				handleattachmentforevent(mapped);
				handleAttachmentCount(mapped.length);
			} else {
				setPanelSavedAttach([]);
				handleattachmentforevent([]);
				handleAttachmentCount(0);
			}
		}
		setPanelAttachLoading(false);
	};

	const addPanelAttachment = async () => {
		const descToUse = panelAttachDesc.trim();
		if (!descToUse) {
			setPanelAttachError('Please enter a description for the attachment.');
			return;
		}
		if (!panelAttachFile?.file) {
			setPanelAttachError('Please choose a file to upload.');
			return;
		}
		setPanelAttachError('');
		setPanelAttachAdding(true);
		try {
			const filedata = filequeryparam({ EventType: 'RFQ', EventId: idFromURL, Description: 'General', CustomerId: customerid });
			const path = await uploadFilesOnAzure(filedata, panelAttachFile.file, atoken);
			if (!path) return;
			const payload = getPayloadWithFilePath('fileNamePath', path, {
				eventId: idFromURL, eventType: 'RFQ',
				attachmentDescription: descToUse,
				attachment: panelAttachFile.file.name,
				docRefId: 0, createdById: userDetail?.id, createdByName: userDetail?.name,
			});
			const res = await apiClient.postres(`/api/eventattachment/${idFromURL}/AddMultiple`, { attachments: [payload] }, atoken);
			if (res) {
				setPanelAttachDesc('');
				setPanelAttachFile(null);
				if (panelFileInputRef.current) panelFileInputRef.current.value = '';
				fetchPanelAttachments();
			}
		} catch (e) {
			setPanelAttachError('Upload failed. Please try again.');
		} finally {
			setPanelAttachAdding(false);
		}
	};

	const updatePanelAttachments = async () => {
		if (!panelSavedAttach.length) return;
		setPanelIsUpdating(true);
		try {
			const files = panelSavedAttach.map(x => ({
				...x,
				eventId: idFromURL,
				createdById: userDetail?.id,
				createdByName: userDetail?.name,
			}));
			const res = await apiClient.postres(`/api/eventattachment/UpdateAttachments`, files, atoken);
			if (res) {
				toast.success('Attachments updated successfully.', { toastId: 'panel_attach_update' });
				setPanelHasCheckboxChanged(false);
			}
		} catch (e) {
			toast.error('Failed to update attachments.');
		} finally {
			setPanelIsUpdating(false);
		}
	};

	const deletePanelAttachment = async (index, id) => {
		const res = await apiClient.postres(`/api/eventattachment/${id}/Delete`, null, atoken);
		if (res) {
			const updated = panelSavedAttach.filter((_, i) => i !== index);
			setPanelSavedAttach(updated);
			handleattachmentforevent(updated);
		}
	};

	const handleClick = (event) => {
		// Handle the main button click
		console.log("Main button clicked");
	};

	const handleMenuClick = (item) => {

		if (item != "Save as Templates" && item != "Cancel" && item != "Approverforward") {
			setSelectedMenuItem(item);
		}

		setAnchorEl(null); // Close the menu after selection
		handleSelectButtonGroup(item)
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleStatusMenuOpen = (event) => {
		setStatusAnchorEl(event.currentTarget);
	};

	const handleStatusMenuClose = () => {
		setStatusAnchorEl(null);
	};
	// RFQ Template Title
	const [TemplateTitle, setTemplateTitle] = useState("")

	const handleSaveTemplate = async () => {

		if (!TemplateTitle.trim()) {
			toast.error("please enter valid name")
			return "";
		}
		if (!idFromURL) {
			toast.error("RFQ ID must be there to create template")
			return "";
		}

		const data = {
			"templateTitle": TemplateTitle.trim(),
			"subject": formik?.values?.subject.trim(),
			"eventType": "RFQ",
			"eventId": idFromURL,
			"customerId": customerid
		}
		const res = await apiClient.postres("/api/EventTemplate/Add", data, atoken)
		if (res) {
			toast.success("Template saved successfully")
			setOpen(false)
		}
	}

	const handleSelectChange = (event) => {
		setAge(event.target.value);
	};
	const CloseLoadingModal = () => setLoadingModal(false);

	//all actions related to supplier 
	const [selectedAction, setSelectedAction] = useState("")
	const validationSchemaSurrogate = yup.object().shape({

		email: yup
			.string('Enter email')
			.required('Please enter your email')
			.email('Enter a valid email'),
	});
	// 	const formik_Action = useFormik({
	// 		enableReinitialize: true,
	// 		initialValues: {
	// 			supplier: null,
	// 			name: "",
	// 			email: "",
	// 			Reason: ""
	// 		},
	// 		validationSchema: selectedAction == "Surrogate RFQ" ? validationSchemaSurrogate : "",
	// 			onSubmit: async (values) => {
	// 	if (!values?.supplier) {
	// 		toast.error(`Please Select Supplier`, {
	// 			toastId: "surrogatetoasterror"
	// 		});
	// 		return;
	// 	}

	// 	const v = values?.supplier;

	// 	// Common structure
	// 	const rfqVendorDetails = {
	// 		rfqId: pageSlug,
	// 		emailId: v?.email,
	// 		remarks: values?.Reason,
	// 		vendorId: v?.vendorId,
	// 		contactId: v?.contactId,
	// 		customerId: customerid,
	// 		version: v?.lastVersion
	// 	};

	// 	if (selectedAction == "Surrogate RFQ") {
	// 		const payload = {
	// 			name: values?.name,
	// 			vendorId: v?.vendorId,
	// 			VendorDetailId: v?.id,
	// 			email: values?.email,
	// 			rfqId: pageSlug,
	// 			reason: values?.Reason,
	// 			stages: {
	// 				eventType: "RFQ",
	// 				currentStage: "Surrogate",  // Action-specific value
	// 				nextStage: "Surrogate",
	// 				orgId: 0,
	// 				orgGroupId: 0
	// 			},
	// 			supplierActionType: "" // always empty
	// 		};

	// 		const res = await apiClient.postres(`/api/RFQManage/RFQSurrogate`, payload, atoken);
	// 		if (res) {
	// 			setState({ ...state, surrogateDrawer: false });
	// 			toast.success(`Suppliers surrogated successfully`, { toastId: "surrogatetoast" });
	// 			formik_Action.resetForm();
	// 		}

	// 	} else {
	// 		const currentStage =
	// 			selectedAction === "Send Reminder" ? "Reminder" :
	// 			selectedAction === "Reopen Quotes" ? "Re open" : "";

	// 		const payload = {
	// 			rfqVendorDetails: [rfqVendorDetails],
	// 			supplierActionType: "", // always empty
	// 			stages: {
	// 				eventType: "RFQ",
	// 				currentStage, // dynamic value: Reminder or Reopen
	// 				nextStage: currentStage,
	// 				orgId: 0,
	// 				orgGroupId: 0
	// 			}
	// 		};

	// 		const res = await apiClient.postres(`/api/RFQManage/${pageSlug}/RFQInvitationVersion`, payload, atoken);
	// 		if (res) {
	// 			setState({ ...state, surrogateDrawer: false });
	// 			toast.success(
	// 				currentStage === "Reminder"
	// 					? "Reminder sent successfully"
	// 					: "Quotes reopened successfully",
	// 				{ toastId: "surrogatetoast" }
	// 			);
	// 			formik_Action.resetForm();
	// 		}
	// 	}
	// },

	// 	});

	// 


	// 		if (!values?.supplier) {
	// 			toast.error(`Please Select Supplier`, {
	// 				toastId: "surrogatetoasterror"
	// 			})
	// 			return
	// 		}

	// 		if (selectedAction == "Surrogate RFQ") {
	// 			const payload = {
	// 				"name": values?.name,
	// 				"vendorId": values?.supplier?.vendorId,
	// 				"VendorDetailId": values?.supplier?.id,
	// 				"email": values?.email,
	// 				"rfqId": pageSlug,
	// 				"reason": values?.Reason,
	// 				"stages": {
	// 					"eventType": "RFQ",
	// 					"currentStage": "Surrogate",
	// 					"nextStage": "Surrogate",
	// 					"orgId": 0,
	// 					"orgGroupId": 0
	// 				}
	// 			}

	// 			const res = await apiClient.postres(`/api/RFQManage/RFQSurrogate`, payload, atoken)
	// 			if (res) {
	// 				setState({ ...state, ["surrogateDrawer"]: false })
	// 				toast.success(`suppliers surrogated successfully`, {
	// 					toastId: "surrogatetoast"
	// 				})
	// 				formik_Action.resetForm();
	// 				return;

	// 			}

	// 		}
	// 		else if (selectedAction == "Send Reminder") {

	// 			const v = values?.supplier;
	// 			const rfqVendorDetails = {
	// 				"rfqId": pageSlug,
	// 				"emailId": v?.email,
	// 				"remarks": values?.Reason,
	// 				"vendorId": v?.vendorId,
	// 				"contactId": v?.contactId,
	// 				"customerId": customerid,
	// 				"version": v?.lastVersion
	// 			}

	// 			const payload = {
	// 				"rfqVendorDetails": [rfqVendorDetails],
	// 				"supplierActionType": "Reminder",

	// 			}
	// 			const res = await apiClient.postres(`/api/RFQManage/${pageSlug}/RFQInvitationVersion`, payload, atoken)
	// 			if (res) {
	// 				setState({ ...state, ["surrogateDrawer"]: false })
	// 				toast.success(`Reminder sent successfully`, {
	// 					toastId: "surrogatetoast"
	// 				})
	// 				formik_Action.resetForm();
	// 				return;

	// 			}

	// 		}

	// 		else if (selectedAction == "Reopen Quotes") {

	// 			const v = values?.supplier;
	// 			const rfqVendorDetails = {
	// 				"rfqId": pageSlug,
	// 				"emailId": v?.email,
	// 				"remarks": values?.Reason,
	// 				"vendorId": v?.vendorId,
	// 				"contactId": v?.contactId,
	// 				"customerId": customerid,
	// 				"version": v?.lastVersion
	// 			}
	// 			const payload = {
	// 				"rfqVendorDetails": [rfqVendorDetails],
	// 				"supplierActionType": "ReOpen",

	// 			}
	// 			const res = await apiClient.postres(`/api/RFQManage/${pageSlug}/RFQInvitationVersion`, payload, atoken)
	// 			if (res) {
	// 				setState({ ...state, ["surrogateDrawer"]: false })
	// 				toast.success(`Quotes reopened successfully`, {
	// 					toastId: "surrogatetoasts"
	// 				})
	// 				formik_Action.resetForm();
	// 				return;

	// 			}

	// 		}





	// 	},
	// });
	const formik_Action = useFormik({
		enableReinitialize: true,
		initialValues: {
			supplier: null,
			name: "",
			email: "",
			Reason: ""
		},
		validationSchema: selectedAction == "Surrogate RFQ" ? validationSchemaSurrogate : "",
		onSubmit: async (values) => {
			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				});
				return;
			}

			const v = values?.supplier;

			// Common structure
			const rfqVendorDetails = {
				rfqId: pageSlug,
				emailId: v?.emailId,
				remarks: values?.Reason,
				vendorId: v?.vendorId,
				contactId: v?.contactId,
				customerId: customerid,
				version: v?.lastVersion
			};

			let currentStage = "";
			if (selectedAction === "Surrogate RFQ") {
				currentStage = "Surrogate";
			} else if (selectedAction === "Reopen Quotes") {
				currentStage = "Re Open";
			} else if (selectedAction === "Send Reminder") {
				currentStage = "Send Reminder";
			}

			if (selectedAction === "Surrogate RFQ") {
				const payload = {
					name: values?.name,
					vendorId: v?.vendorId,
					VendorDetailId: v?.id,
					email: values?.email,
					rfqId: pageSlug,
					reason: values?.Reason,
					currentStage: currentStage,
					stages: {
						"eventType": "RFQ",
						"currentStage": "Surrogate",
						"nextStage": "Surrogate",
						"orgId": 0,
						"orgGroupId": 0
					}
				};

				const res = await apiClient.postres(`/api/RFQManage/RFQSurrogate`, payload, atoken);
				if (res) {
					setState({ ...state, surrogateDrawer: false });
					toast.success(`Suppliers surrogated successfully`, { toastId: "surrogatetoast" });
					formik_Action.resetForm();
				}
			} else {
				const payload = {
					rfqVendorDetails: [rfqVendorDetails],
					supplierActionType: "", // always empty
					currentStage: currentStage
				};

				const res = await apiClient.postres(`/api/RFQManage/${pageSlug}/RFQInvitationVersion`, payload, atoken);
				if (res) {
					setState({ ...state, surrogateDrawer: false });
					toast.success(
						currentStage === "Send Reminder"
							? "Reminder sent successfully"
							: "Quotes reopened successfully",
						{ toastId: "surrogatetoast" }
					);
					formik_Action.resetForm();
				}
			}
		}
	});

	useEffect(() => {
		if (formik?.values) {
			console.log("formik values changed:", formik);
		}
	}, [formik])
	const [tabshow, setTabShow] = useState(true)
	const handleSupplierSurrogate = (v, action) => {

		setState({ ...state, surrogateDrawer: true });
		if (action == "Surrogate") {
			setSelectedAction("Surrogate RFQ")
		}
		else if (action == "Reminder") {
			setSelectedAction("Send Reminder")
		}
		else if (action == "Reopen") {

			setSelectedAction("Reopen Quotes")
		}

		formik_Action.setFieldValue("supplier", v)
	}

	const handleSupplierAction = (v, action) => {

		switch (action) {
			case "Surrogate":
				return handleSupplierSurrogate(v, action)
			case "Reminder":
				return handleSupplierSurrogate(v, action)
			case "Reopen":
				return handleSupplierSurrogate(v, action)
			default:
				return null;
		}
	};

	//

	const handleDraftEvent = useCallback(async () => {

		const payload = {
			id: pageSlug,
			stage: "Draft",
			subject: formik?.values?.subject,
			description: formik?.values?.description,
			Version: formik?.values?.Version + 1,


		}

		const res = await apiClient.postres(`/api/RFQManage/Update`, payload, atoken)

		if (res) {
			setCurrentStage("Draft")
			setValue(1)
			pullgetRFQManageFind(idFromURL)
			setApproverShow(true)
			handleCloseEventUpdate(false)
			return true
		}
		return false

	}, [formik])

	//
	const [confirmEventUpdate, setConfirmEventUpdate] = useState(false);
	const [confirmClearAllItems, setConfirmClearAllItems] = useState(false)
	const [updatesupplieronloading, setupdatesupplieronloading] = useState(1)
	const handleCloseEventUpdate = (value) => {

		setConfirmEventUpdate(false);


	};
	const handleOpenEventUpdate = useCallback((value) => {

		setConfirmEventUpdate(true);


	}, []);


	if (pageSlug && !tempDataEditData) {
		return (
			<GridSkeleton />
		)
	}
	//##
	const handleSaveasDraft = async () => {
		await handleSaveContinue()
		navigate(`/configuration/manage-rfq`);

	}
	const handleButtonGroup = () => {

		switch (selectedMenuItem) {
			case "Publish RFQ":
				return handleRFQSubmit()
			case "Save & Continue":
				return handleSaveContinue()
			case "Save as Draft":
				return handleSaveasDraft()
			case "Save as Templates":
				return handleClickOpen()
			case "Cancel":
				return handleCancel()
			case "Save":
				return handleSaveAllocation()
			case "Save & Close":
				return handleSaveAndClose()
			default:
				return ""
		}

	}

	const handleApproverForward = async () => {

		const values = {
			rfqId: parseInt(idFromURL),
			status: "Forward",
			approveComment: "",
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
			`/api/RFQManage/RFQForward`,
			datapayload,
			atoken
		);
		if (res) {
			toast.success(`RFQ Forwarded successfully`, {
				toastId: "supplierforword_commerciak"
			});
			navigate(`/app`);
		}

	}

	const handleSelectButtonGroup = (selectedMenuItem) => {

		switch (selectedMenuItem) {

			case "Save as Templates":
				return handleClickOpen()
			case "Cancel":
				return handleCancel()
			case "Approverforward":
				return handleApproverForward()
			case "Save":
				return handleSaveAllocation()
			case "Save & Close":
				return handleSaveAndClose()
			case "Create NFA":
				return handleCreateNFA()
			case "Send Mail to suppliers":
				return handleSendMailtoSuppliers()
			case "Save as Draft":
				return handleSaveasDraft()
			case "Publish RFQ":
				return handleRFQSubmit()
			default:
				return ""
		}

	}

	const handleCreateNFA = () => {
		//logic for create nfa
	}
	const handleSendMailtoSuppliers = async () => {
		//logic for send mail to suppliers

		// const data = {
		// 	rfqid: idFromURL,
		// 	stage: "RFQ Close Email",
		// }
		// const queryParams = buildQueryParams(data)
		const res = await apiClient.getres(
			`/api/RFQManage/RFQCloseEmail?rfqid=${idFromURL}&stage=RFQ Close Email`,
			atoken
		);
		if (res) {
			toast.success(`Email sent successfully`, {
				toastId: "emailsent_successfully"
			});
			// navigate(`/App`);
		}
	}

	const handleSaveAllocation = async () => {
		//logic for save allocation
		const res = await NFASOBRFQRef?.current?.saveSOBDetails();
	}
	const handleSendAllocationEmail = async () => {

		const data = {
			eventId: idFromURL,
			eventType: "RFQ",
		}
		const queryParams = buildQueryParams(data)

		const res = await apiClient.postres(
			`/api/NFAManage/SendSOBEmail`,
			queryParams,
			atoken
		);
	}

	const handleSaveAndClose = async () => {
		//logic for save and close
		const res1 = await NFASOBRFQRef?.current?.saveSOBDetails();
		if (res1) {
			handleSendAllocationEmail();
			handleApproverForward();
		}
	}

	const handleTab = (booleanvalue) => {

		// setTabShow(booleanvalue)

		// if (booleanvalue) {
		// 	setValue(1)
		// }


	}

	const handleClearAllItems = (value) => {
		if (value) {
			handleClearAll()


		} else {
			setConfirmClearAllItems(false);
		}
	};




	const handleBaseCurrency = () => {
		console.log("handleBaseCurrency called, loading currencies...");
		if (currencyList.length === 0 && !loadCurrency) {
			pullgetCurrency();
		}
		setModal1(true);
	}
	const handleRequisitionerChange = (value) => {
		if (value === null) {
			formik.setFieldValue('requisitioner', '');
			formik.setFieldValue('purchOrgId', null);
			formik.setFieldValue('purchGrpId', null);
			return;
		}

		const selectedRequisitioner = requisitionerList?.find(item => item.name === value);
		if (selectedRequisitioner) {
			formik.setFieldValue('requisitioner', selectedRequisitioner.name);

			const foundOrg = purchaseAllList?.find(org => org.id === selectedRequisitioner.orgId);
			formik.setFieldValue('purchOrgId', foundOrg ?? null);

			const userOrgGroup = selectedRequisitioner.userOrgGroup;
			if (userOrgGroup?.length > 0) {
				const foundGroup = purchaseGroupAllList?.find(grp => grp.id === userOrgGroup[0].orgGroupId);
				formik.setFieldValue('purchGrpId', foundGroup ?? null);
			} else {
				formik.setFieldValue('purchGrpId', null);
			}
		}
	};

	// Derive dropdown steps from the same stagelist used by the horizontal stepper
	const rfqStatusSteps = Array.isArray(stagelist) && stagelist.length > 0
		? stagelist.map(s => s.stageName || s.currentStage).filter(Boolean)
		: ["Draft"];

	const normalizedCurrentStage = (currentStage || "Draft").trim();
	const currentStatusIndex = Math.max(
		0,
		rfqStatusSteps.findIndex(
			(step) => step.toLowerCase() === normalizedCurrentStage.toLowerCase()
		)
	);

	const formatRfqDateTime = (value) => {
		if (!value) return "-";
		const parsed = dayjs(value);
		return parsed.isValid() ? parsed.format("DD-MM-YY HH:mm") : "-";
	};

	const rfqTitle =
		formik?.values?.subject ||
		tempDataEditData?.[0]?.subject ||
		"Purchase Requisition for production";

	const isNewRFQ = !idFromURL || idFromURL === "add";
	const isSaveContinueHeaderDisabled =
		loading ||
		(value == 9
			? currentStage != "Allocation"
			: isNewRFQ
				? false
				: !stagearray.includes(currentStage));
	const showTabSaveContinue =
		!actionType &&
		(isNewRFQ || normalizedCurrentStage.toLowerCase() === "draft");

	//##return
	return (
		<>
			<div className="mainContainer d-flex rfq-modern-shell">
				<div className="leftContent d-flex flex-column">
					<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0 }}>
						<div className="rfq-dv2-page-head border-bottom mb-3" style={{ flexShrink: 0 }}>
							{/* ── Row 1: breadcrumb + action buttons ── */}
							<div className="rfq-dv2-head-top">
								{breadcrumb}
								{/* Action Buttons */}
								<div className="rfq-dv2-actions">
									{!loading ? (
										<>
											{/* Cancel — always first */}
											<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--ghost" onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
												Cancel
											</button>

											{/* Secondary actions */}
											{stagearray.includes(currentStage) && (
												<button type="button" className="rfq-dv2-action-btn pe-btn--secondary" onClick={() => handleMenuClick('Save as Draft')}>
													Save as Draft
												</button>
											)}
											{idFromURL && currentStage && currentStage !== 'Draft' && (
												<button type="button" className="rfq-dv2-action-btn pe-btn--secondary" onClick={() => handleMenuClick('Save as Templates')}>
													Save as Template
												</button>
											)}
											{currentStage === 'Allocation' && value == "9" && (
												<button type="button" className="rfq-dv2-action-btn pe--secondary" onClick={() => handleMenuClick('Save & Close')}>
													Save &amp; Close
												</button>
											)}
											{currentStage === 'Awarded' && (
												<button type="button" className="rfq-dv2-action-btn pe-btn--secondary" onClick={() => handleMenuClick('Send Mail to suppliers')}>
													Send Mail to suppliers
												</button>
											)}
											{currentStage === 'Awarded' && (
												<button type="button" className="rfq-dv2-action-btn pe-btn--secondary" onClick={() => handleMenuClick('Create NFA')}>
													Create NFA
												</button>
											)}
											{idFromURL && currentStage && currentStage !== 'Draft' && (() => {
												const stageInfo = getStageInfo(currentStage, stagelist);
												if (!actionType && (currentStage === 'Technical Approval' || (currentStage === 'Forward for Approval' && stageInfo?.nextStage !== 'Technical Approval'))) {
													return (
														<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--secondary" onClick={() => handleMenuClick('Approverforward')}>
															Forward for approval
														</button>
													);
												}
												return null;
											})()}

											{/* Primary action — always last */}
											{value === 7 && (
												<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--primary" onClick={() => handleMenuClick('Publish RFQ')}>
													Publish RFQ
												</button>
											)}
											{currentStage === 'Draft' && value !== 7 && (
												<button
													type="button"
													className="rfq-dv2-action-btn rfq-dv2-action-btn--primary"
													onClick={handleButtonGroup}
													disabled={(!idFromURL || idFromURL === 'add') ? false : !stagearray.includes(currentStage)}
												>
													{value === 5 ? "Save Suppliers" : "Save & Continue"}
												</button>
											)}
											{currentStage === 'Allocation' && value == "9" && (
												<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--primary" onClick={() => handleMenuClick('Save')}>
													Save
												</button>
											)}
										</>
									) : (
										<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--primary" disabled>
											{value === 6 ? "Publishing..." : "Saving..."}
										</button>
									)}
								</div>
							</div>

							{/* Stage flow — visible in non-v2 layout, hidden via CSS in v2 shell */}
							<div className="rfq-dv2-stage-flow-wrap">
								<MemoizedEventStageFlow
									stagelist={stagelist}
									currentStage={currentStage}
								/>
							</div>

							{/* ── Row 2: meta info ── */}
							<div className="rfq-dv2-head-bottom">
								<div className="rfq-dv2-meta-row">
									<span className="rfq-dv2-meta-item">
										<span className="rfq-dv2-meta-label">Status</span>
										<button
											type="button"
											className={`rfq-dv2-status-pill ${normalizedCurrentStage.toLowerCase() === "draft" ? "is-draft" : ""}`}
											onClick={handleStatusMenuOpen}
										>
											<span className="rfq-dv2-status-dot" />
											{normalizedCurrentStage}
										</button>
									</span>
									{formik?.values?.endDate && (
										<span className="rfq-dv2-meta-item">
											<span className="rfq-dv2-meta-label">End Date/Time:</span>{" "}
											<span className="rfq-dv2-meta-value">{formatRfqDateTime(formik?.values?.endDate)}</span>
										</span>
									)}
									<span className="rfq-dv2-meta-item">
										<span className="rfq-dv2-meta-label">Requisitioner:</span>{" "}
										<span className="rfq-dv2-meta-value">{formik?.values?.requisitioner || "-"}</span>
									</span>
								</div>
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
										<div className="rfq-dv2-status-menu-title">RFQ Status</div>
										<div className="rfq-dv2-status-menu-list">
											{rfqStatusSteps.map((step, index) => {
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

						{/* Tab Navigation and Icons Header */}
						<div className="d-flex justify-content-between align-items-center border-bottom mb-3 bg-grey" style={{ flexShrink: 0 }}>
							{/* Tab Navigation */}
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
									{!actionType && (
										<Tab value={1} label={<span className="section-heading">General</span>} />
									)}
									{!actionType && (
										<Tab
											value={2}
											label={<span className="section-heading">Items/Services</span>}
											disabled={!idFromURL}
										/>
									)}
									{!actionType && (loadingPermissions || (effectivePermissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.READ) ?? false)) && (
										<Tab
											value={3}
											label={<span className="section-heading">Commercial Terms</span>}
											disabled={!idFromURL}
										/>
									)}
									{!actionType && (loadingPermissions || (effectivePermissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? false)) && (
										<Tab
											value={4}
											label={<span className="section-heading">Questions</span>}
											disabled={!idFromURL}
										/>
									)}
									{!actionType && (loadingPermissions || (effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false)) && (
										<Tab
											value={5}
											label={<span className="section-heading">Suppliers</span>}
											disabled={!idFromURL}
										/>
									)}
									{idFromURL && currentStage.trim() == "Draft" && (
										<Tab
											value={7}
											label={<span className="section-heading">Preview</span>}
											disabled={!rfqpreview}
										/>
									)}
									{idFromURL && (
										(currentStage.trim() !== "Under Pre Approval" && currentStage.trim() !== "Draft") ||
										formik?.values?.Version != 1
									) && (
											<Tab
												value={6}
												label={<span className="section-heading">Report</span>}
												disabled={!idFromURL}
											/>
										)}
									{idFromURL && currentStage.trim() !== "Under Pre Approval" && currentStage.trim() !== "Draft" && (
										<Tab
											value={8}
											label={<span className="section-heading">Queries</span>}
											disabled={!idFromURL}
										/>
									)}
									{idFromURL && (currentStage.trim() == "Allocation" || currentStage.trim() == "Awarded") && stagelist?.some(item => item.currentStage == "Allocation") && (
										<Tab
											value={9}
											label={<span className="section-heading">Allocation</span>}
											disabled={!idFromURL}
										/>
									)}
								</Tabs>
							</Box>

							{false && showTabSaveContinue && (
								<div className="rfq-dv2-tab-save-action">
									<Button
										type="button"
										size="small"
										className="rfq-dv2-save-continue-btn"
										onClick={handleSaveContinue}
										disabled={isSaveContinueHeaderDisabled}
									>
										{value === 5 ? "Save Suppliers" : "Save & Continue"}
									</Button>
								</div>
							)}

							{value === 6 && <div ref={(el) => { rfqReportActionsRef.current = el; if (el && !rfqActionsPortalReady) setRfqActionsPortalReady(true); }} style={{ display: 'flex', alignItems: 'center' }} />}

							{/* Top-right icons: History, Attachment, and Approval */}
							{/* <div className="d-flex align-items-center gap-2"> */}
							<div className="d-flex align-items-center gap-2 rfq-dv2-tab-actions" aria-hidden="true">
								{(
									<AttachmentWorkFlow
										eventtype={`RFQ`}
										eventid={idFromURL}
										action={stagearray.includes(currentStage)}
										handleattachmentforevent={handleattachmentforevent}
										ref={attachmentdrawerref}
										onCountChange={handleAttachmentCount}
										permissionManager={effectivePermissionManager}
									/>
								)}

								{idFromURL && (
									<HistoryCell eventtype={`RFQ`} eventId={idFromURL}
										permissionManager={effectivePermissionManager}
									/>

								)}
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
								</Tooltip>)}

							</div>
						</div>

						{/* Tab Content */}
						<div className="flex-grow-1 hidden-scrollbar" style={{ overflowY: value === 5 || value === 6 ? 'hidden' : 'auto', padding: value === 6 ? '0' : '20px 16px 16px', display: value === 6 ? 'flex' : 'block', flexDirection: value === 6 ? 'column' : undefined }}>
							{/* General Tab Content */}
							{value === 1 && (
								<div>
									{showGeneralAccessDenied && (
										<div className="p-4">
											<Alert severity="error">
												<div className="d-flex align-items-center">
													<HiOutlineX className="me-2 f18" />
													Access Denied: You don't have permission to view General settings.
												</div>
											</Alert>
										</div>
									)}
									{!showGeneralAccessDenied && stagearray.includes(currentStage) ? (
										<>
											{/* Permission Control for General Tab */}
											{(() => {
												const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
												const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false;
												const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
												const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? false;

												return (
													<div>
														{/* Permission Status Alert */}
														<div className="row mb-3">
															<div className="col-12">
																<label className="pe-field-label">RFQ Subject <span className="rfq-required-star">*</span></label>
																<TextField
																	fullWidth
																	size="small"
																	variant="outlined"
																	name="subject"
																	id="subject"
																	value={formik.values.subject}
																	onChange={formik.handleChange}
																	onBlur={formik.handleBlur}
																	error={formik.touched.subject && Boolean(formik.errors.subject)}
																	helperText={formik.touched.subject && formik.errors.subject}
																	disabled={!canEdit}
																	className="w-100 f14"
																	autoComplete="off"
																/>
															</div>
														</div>
														<div className="row mb-3">
															<div className="col-12">
																<label className="pe-field-label">RFQ Description <span className="rfq-required-star">*</span></label>
																<div className={`rfq-dv2-quill-field${formik.touched.description && formik.errors.description ? ' rfq-dv2-quill-error' : ''}`}>
																	<ReactQuill
																		theme="snow"
																		value={formik.values.description || ''}
																		onChange={(content) => {
																			formik.setFieldValue('description', content);
																			if (!formik.touched.description) formik.setFieldTouched('description', true);
																		}}
																		readOnly={!canEdit}
																		placeholder="Enter description..."
																		style={{ backgroundColor: !canEdit ? '#f5f5f5' : 'white' }}
																	/>
																</div>
																{formik.touched.description && formik.errors.description && (
																	<span className="rfq-field-error">{formik.errors.description}</span>
																)}
															</div>
														</div>

														<LocalizationProvider dateAdapter={AdapterDayjs}>
															<div className="row mt-4 mb-2">
																{/* Requisitioner */}
																<div className="col-12 col-md-4 col-lg-4 rfq-dv2-requisitioner-field">
																	<label className="pe-field-label">Requisitioner</label>
																	<Autocomplete
																		id="requisitioner"
																		name="requisitioner"
																		size="small"
																		className="w-100 f14"
																		loading={loadRequisitioner}
																		onOpen={() => {
																			// Call pullUsersList when dropdown opens
																			PullUserDesignation();
																		}}
																		options={requisitionerList ? requisitionerList.map(item => item.name) : []}
																		getOptionLabel={(option) => option}
																		value={formik.values.requisitioner || ''}
																		onChange={(event, value) => handleRequisitionerChange(value)}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				error={formik.touched.requisitioner && Boolean(formik.errors.requisitioner)}
																				helperText={formik.touched.requisitioner && formik.errors.requisitioner}
																			/>
																		)}
																	/>
																</div>

																{/* Start Date */}
																<div className="col-12 col-md-4 col-lg-4 rfq-dv2-start-field">
																	<label className="pe-field-label">Start Date/Time</label>
																	<MobileDateTimePicker
																		name="startDate"
																		id="startDate"
																		value={formik.values?.startDate}
																		onChange={(newValue) => formik.setFieldValue("startDate", newValue)}
																		minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																		timezone={userDetail?.timeZone}
																		format={getDateFormatPatteronLocale(userDetail)}
																		ampm={userampm(userDetail)}
																		className="w-100 f14"
																		slotProps={{
																			textField: {
																				variant: "outlined",
																				size: "small",
																				error: formik.touched?.startDate && Boolean(formik.errors?.startDate),
																				helperText: formik.touched?.startDate && formik.errors?.startDate,
																			},
																			actionBar: {
																				actions: ["clear", "cancel", "accept"],
																			},
																		}}
																	/>
																</div>

																{/* End Date */}
																<div className="col-12 col-md-4 col-lg-4 rfq-dv2-end-field">
																	<label className="pe-field-label">End Date/Time <span className="rfq-required-star">*</span></label>
																	<MobileDateTimePicker
																		name="endDate"
																		id="endDate"
																		value={formik.values.endDate}
																		onChange={(newValue) => formik.setFieldValue("endDate", newValue)}
																		minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																		timezone={userDetail?.timeZone}
																		format={getDateFormatPatteronLocale(userDetail)}
																		ampm={userampm(userDetail)}
																		className="w-100 f14"
																		slotProps={{
																			textField: {
																				variant: "outlined",
																				size: "small",
																				error: formik.touched.endDate && Boolean(formik.errors.endDate),
																				helperText: formik.touched.endDate && formik.errors.endDate,
																			},
																			actionBar: {
																				actions: ["clear", "cancel", "accept"],
																			},
																		}}
																	/>
																</div>
															</div>
														</LocalizationProvider>

														<div className="row mt-4 mb-2 align-items-center">
															{/* Purchase Org */}
															{purchaseAllList && (
																<div className="col-12 col-md-4 col-lg-4 mb-2 rfq-dv2-purchase-org-field">
																	<label className="pe-field-label">Purchase Org</label>
																	<Autocomplete
																		id="purchOrgId"
																		name="purchOrgId"
																		size="small"
																		className="w-100 f14"
																		options={(() => {
																			// If user is non-admin (roleId !== 1), show only their assigned org
																			if (userDetail?.roleId !== 1 && userDetail?.purchOrgId) {
																				const userOrg = purchaseAllList.find(org => org.id === userDetail.purchOrgId);
																				return userOrg ? [userOrg] : [];
																			}
																			// If admin (roleId === 1), show all orgs + "Add New"
																			return [{ id: "new", orgName: "ADD NEW" }, ...purchaseAllList];
																		})()}
																		value={formik.values.purchOrgId}
																		getOptionLabel={(option) => option.orgName ?? ""}
																		onChange={(e, value) => {
																			if (value?.id === "new") {
																				setPurchaseOrgModal(true);
																				formik.setFieldValue("purchGrpId", null);
																				return;
																			}
																			if (value) {
																				formik.setFieldValue("purchOrgId", value);
																				formik.setFieldValue("purchGrpId", null);
																			} else {
																				formik.setFieldValue("purchOrgId", null);
																				formik.setFieldValue("purchGrpId", null);
																			}
																			setPurchaseGroupAllList([]);
																		}}
																		renderOption={(props, option) => (
																			<Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
																				{option.orgName}
																			</Box>
																		)}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																			/>
																		)}
																	/>
																</div>
															)}

															{/* Purchase Group */}
															{purchaseGroupAllList && (
																<div className="col-12 col-md-4 col-lg-4 mb-2 rfq-dv2-purchase-group-field">
																	<label className="pe-field-label">Purchase Group <span className="rfq-required-star">*</span></label>
																	<Autocomplete
																		id="purchGrpId"
																		name="purchGrpId"
																		size="small"
																		className="w-100 f14"
																		options={[
																			{ id: "new", groupName: "ADD NEW" },
																			...purchaseGroupAllList,
																		]}
																		value={formik.values?.purchGrpId}
																		getOptionLabel={(option) => option?.groupName ?? ""}
																		onChange={(e, value) => {
																			if (value?.id === "new") {
																				setPurchaseOrgGrpModal(true);
																				return;
																			}
																			formik.setFieldValue("purchGrpId", value);
																		}}
																		renderOption={(props, option) => (
																			<Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
																				{option.groupName}
																			</Box>
																		)}
																		renderInput={(params) => (
																			<TextField
																				{...params}
																				variant="outlined"
																				error={formik.touched.purchGrpId && Boolean(formik.errors.purchGrpId)}
																				helperText={formik.touched.purchGrpId && formik.errors.purchGrpId}
																			/>
																		)}
																	/>
																</div>
															)}
															{/* Show Price to Technical Approver */}
															{stagelist?.some(item => item.currentStage == "Technical Approval") &&
																(<div className="col-12 col-md-4 col-lg-4 mb-2 mt-3">
																	<FormGroup>
																		<FormControlLabel
																			control={
																				<Checkbox
																					//disabled={false}
																					checked={formik?.values?.showPriceTech == true}
																				/>
																			}
																			id="sealedBid"
																			label={<span className="f13 muted">Show Price to Technical Approver</span>}
																			labelPlacement={"end"}
																			name="sealedBid"
																			value={formik.values.showPriceTech}
																			onChange={(e) => {
																				const newValue = e.target.checked ? true : false;
																				formik.setFieldValue("showPriceTech", newValue);
																			}}
																		/>
																	</FormGroup>
																</div>)
															}
														</div>

														<div className="col-12 mb-1 rfq-dv2-terms-field">
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
																	value={formik.values.IsMultiCurrency}
																	onChange={(e) => {

																		formik.setFieldValue(
																			"IsMultiCurrency",
																			e.target.value == "true" ? true : false
																		);
																		formik.setFieldValue(
																			"baseCurrency",
																			formik?.values?.baseCurrency || userDetail?.defaultCurrency
																		);
																	}}
																>
																	<FormControlLabel
																		value={false}
																		control={<Radio />}
																		label={
																			<span >
																				Base Currency{" "}
																				{userDetail &&
																					userDetail?.defaultCurrency ? (
																					<span className="f12 text-primary pointer" onClick={handleBaseCurrency}>
																						({`${formik?.values?.baseCurrency || userDetail?.defaultCurrency}`})
																					</span>
																				) : (
																					<span></span>
																				)}
																			</span>
																		}
																	/>
																	<FormControlLabel
																		value={true}
																		control={<Radio />}
																		label="Multiple Currency"
																	/>
																</RadioGroup>
															</FormControl>
															{
																formik.values.IsMultiCurrency ? (
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
																										<label className="pe-field-label">Select Currency <span className="rfq-required-star">*</span></label>
																										<Autocomplete
																											id={"baseCurrency" + i}
																											name="baseCurrency"
																											options={[
																												{ currencyNm: "ADD NEW", id: "new" },
																												...(currencyList?.filter(cl => cl.currencyNm !== (formik?.values?.baseCurrency || userDetail?.defaultCurrency)) || []),
																											]}
																											getOptionLabel={(option) => option.currencyNm}
																											loading={loadCurrency}
																											onOpen={() => {
																												// Call pullgetCurrency when dropdown opens
																												if (currencyList.length === 0)
																													pullgetCurrency();
																											}}
																											onChange={(event, value) => {
																												if (value && value.id === "new") {
																													setOpenCurrencyModal(true);
																												} else {
																													handleInputChange({ target: { value: value ? value?.currencyNm : "", name: "baseCurrency" } }, i);
																												}
																											}}
																											//value={currencyList?.find(cl => cl.currencyNm === x.baseCurrency) || null} // Set the value from the currency list
																											value={
																												currencyList.find(
																													(option) => option.currencyNm === x.baseCurrency
																												) || { currencyNm: x.baseCurrency }
																											}
																											renderInput={(params) => (
																												<TextField
																													{...params}
																													name="baseCurrency"
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
																										/>

																									</div>
																									<div className="col-lg-4 col-12">
																										<label className="pe-field-label">Conversion Factor <span className="rfq-required-star">*</span></label>
																										<TextField
																											variant="outlined"

																											className={`w-100 ${x && x.baseCurrency && x.currencyConversion && !isNaN(parseFloat(x.currencyConversion)) && parseFloat(x.currencyConversion) <= 0 ? 'invalid-input' : ''}`}
																											required

																											id={`currency-conversion-${i}`}
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
																												<button
																													type="button"
																													className="pe-icon-btn pe-icon-btn--delete"
																													disabled={
																														inputList?.length ==
																														1
																													}
																													onClick={() =>
																														handleRemoveClick(i)
																													}
																												>
																													<HiOutlineX />
																												</button>
																											</div>
																										</>
																									) : (
																										<>
																											{inputList.length !==
																												1 && (
																													<div className="col-lg-1 col-6 ms-0 ps-0 ">
																														<button
																															type="button"
																															className="pe-icon-btn pe-icon-btn--delete"
																															onClick={() =>
																																handleRemoveClick(
																																	i
																																)
																															}
																														>
																															<HiOutlineX />
																														</button>
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
																																(x.currencyConversion ==
																																	"") ||
																																(x.baseCurrency ==
																																	"")

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
															<div className="rfq-dv2-quill-field-header">
																<span>Terms & Conditions <span className="rfq-required-star">*</span></span>
																{idFromURL && (
																	<span>
																		<Tooltip title="Attachments">
																			<IconButton
																				size="small"
																				className="border-primary  bg-white"
																				onClick={() => {
																					setApproverShow(true);
																					setWorkflowPanelTab("attachments");
																				}}
																			>
																				<Badge
																					style={{ padding: "0px 4px", fontSize: "10px" }}
																					// badgeContent={attachmentCount}
																					// color={attachmentCount > 0 ? "success" : "info"}
																					badgeContent={attachmentforevent?.filter(a => a.fileType === "TC").length || 0}
																					color={attachmentforevent?.some(a => a.fileType === "TC") ? "success" : "info"}
																				>
																					<FilePresentIcon className="f16" />
																				</Badge>
																			</IconButton>
																		</Tooltip>
																	</span>
																)}
															</div>
															<ReactQuill
																id="termandcondition"
																theme="snow"
																preserveWhitespace
																className=""
																value={formik.values.termandcondition}
																onChange={(value) => {
																	const termandcondition = extractTextFromHTML(value);
																	const length = termandcondition.length;
																	if (length <= 2000) {
																		formik.setFieldValue(
																			"termandcondition",
																			value
																		);
																	} else {
																		formik.setFieldValue(
																			"termandcondition",
																			formik.values.termandcondition
																		);
																		toast.error('Term and Condition greater than 2000 character is not allowed', {
																			toastId: "t&cerr"
																		});
																	}
																}}

															/>
															{formik.values.termandcondition != "0" && extractTextFromHTML(formik.values.termandcondition)?.length != "0" && <div
																style={{
																	fontSize: "0.8em",
																	color: "grey",
																	textAlign: "end",
																}}
															>
																{`${extractTextFromHTML(formik.values.termandcondition)?.length || ""
																	}/2000`}{" "}

															</div>}
															{formik.touched.termandcondition && formik.errors.termandcondition && (
																<span className="rfq-field-error">{formik.errors.termandcondition}</span>
															)}
														</div>
														<div className="col-12 mb-4 d-flex align-items-center rfq-dv2-toggle-section">
															<div className="col-12 col-md-2 col-lg-2 mt-3">
																<FormGroup>
																	<FormControlLabel
																		control={
																			<Checkbox
																				//disabled={false}
																				checked={formik?.values?.RFQType == "closed"}
																			/>
																		}
																		id="sealedBid"
																		label={<span className="f14 muted">Sealed Bid</span>}
																		labelPlacement={"end"}
																		name="sealedBid"
																		value={formik.values.RFQType}
																		onChange={(e) => {
																			const newValue = e.target.checked ? "closed" : "open";
																			formik.setFieldValue("RFQType", newValue);

																			if (newValue === "open") {
																				formik.setFieldValue("bidOpeningDate", null);
																			}

																			//versionhistoryhandling
																			const currentVersion = formik.values.Version;
																			const updatedHistory = [...(formik.values.RFQVersionHistory || [])];

																			const index = updatedHistory?.findIndex(
																				(entry) => entry.version === currentVersion
																			);
																			if (newValue === "open") {
																				if (index !== -1) {
																					// Update existing version entry
																					updatedHistory[index].bidOpeningDate = null;
																					updatedHistory[index].OpenQuotes = 'Y';
																					updatedHistory[index].autoOpenEnabled = false;
																				}
																			}
																			else {
																				if (index !== -1) {
																					// Update existing version entry

																					updatedHistory[index].OpenQuotes = 'N';
																				}
																			}
																		}}
																	/>
																</FormGroup>
															</div>
															<div className="col-12 col-md-2 col-lg-2 ms-3 mt-3">
																<FormGroup>
																	<FormControlLabel
																		control={
																			<Checkbox
																				checked={formik.values.boqReq === true}
																			/>
																		}
																		id="boqReq"
																		label={<span className="f14 muted">BOQ</span>}
																		labelPlacement={"end"}
																		name="boqReq"
																		onChange={(e) => formik.setFieldValue("boqReq", e.target.checked)}
																	/>
																</FormGroup>
															</div>
															{formik.values.RFQType == "closed" && (
																<>
																	<div className="col-12 col-md-6 col-lg-4 ms-0 ps-0 me-2">
																		<LocalizationProvider dateAdapter={AdapterDayjs}>
																			<label className="pe-field-label">Bid Open Date/Time</label>
																			<MobileDateTimePicker
																				disabled={!(formik.values.RFQType === "closed")}
																				variant="outlined"
																				size="small"
																				name="bidOpeningDate"
																				id="bidOpeningDate"
																				timezone={userDetail?.timeZone}
																				minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																				//value={formik.values.bidOpeningDate ?? null}
																				value={formik.values?.bidOpeningDate}
																				className="w-100 f14 "
																				slotProps={{
																					textField: {
																						variant: "outlined",
																						size: "small",
																						error: formik.touched.bidOpeningDate && Boolean(formik.errors.bidOpeningDate),
																						helperText: formik.touched.bidOpeningDate && formik.errors.bidOpeningDate,
																					},
																					actionBar: {
																						actions: ["clear", "cancel", "accept"],
																					},
																				}}
																				onChange={(newValue) => {
																					formik.setFieldValue("bidOpeningDate", newValue);

																					const currentVersion = formik.values.Version;
																					const updatedHistory = [...(formik.values.RFQVersionHistory || [])];

																					const index = updatedHistory?.findIndex(
																						(entry) => entry.version == currentVersion
																					);

																					if (index !== -1) {
																						// Update existing version entry
																						updatedHistory[index].bidOpeningDate = newValue;
																					}


																					formik.setFieldValue("RFQVersionHistory", updatedHistory);
																				}}


																				format={getDateFormatPatteronLocale(userDetail)}
																				ampm={userampm(userDetail)}

																			/>
																		</LocalizationProvider>
																	</div>
																	{/* <div className="col-12 col-md-6 col-lg-4 mt-4 me-2">
																		<FormGroup>
																			<FormControlLabel
																				control={
																					<Checkbox
																						checked={formik.values.RFQVersionHistory?.find(x => x.version == formik.values?.Version)?.autoOpenEnabled == true}
																					/>
																				}
																				id="AutoOpenEnabled"
																				label={<span className="f14 muted ">Auto Open</span>}
																				labelPlacement={"end"}
																				name="Auto Open Enabled"
																				value={formik.values.RFQVersionHistory?.find(x => x.version == formik.values?.Version)?.autoOpenEnabled == true}
																				onChange={(e) => {

																					const newValue = e.target.checked ? true : false;

																					const currentVersion = formik.values.Version;
																					const updatedHistory = [...(formik.values.RFQVersionHistory || [])];

																					const index = updatedHistory?.findIndex(
																						(entry) => entry.version === currentVersion
																					);

																					if (index !== -1) {
																						// Update existing version entry
																						updatedHistory[index].autoOpenEnabled = newValue;
																					}

																					formik.setFieldValue("RFQVersionHistory", updatedHistory);
																				}}
																			/>
																		</FormGroup>
																	</div> */}
																</>
															)}
														</div>
													</div>
												);
											})()}
										</>
									) : (
										(() => {
											const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false;
											const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false;
											const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false;
											const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? false;
											if (showGeneralAccessDenied || !idFromURL || idFromURL === 'add') {
												return null;
											}

											return (
												<RFQGeneralPreview
													formik={formik}
													inputList={inputList}
													purchaseAllList={purchaseAllList}
													purchaseGroupAllList={purchaseGroupAllList}
													stagearray={stagearray}
													currentStage={currentStage}
													handletabEdit={handletabEdit}
												/>
											);
										})()
									)}
								</div>
							)}

							{/* Items/Services Tab Content */}
							{value === 2 && (
								<div className="rfq-items-tab-content">
									{(() => {
										// Permission control for Items/Services tab
										const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false;
										const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.EDIT) ?? false;
										const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.CREATE) ?? false;
										const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.REMOVE) ?? false;

										// If permissions finished loading and no read permission, deny access completely
										if (!loadingPermissions && !canRead) {
											return (
												<div className="p-4">
													<Alert severity="error">
														<div className="d-flex align-items-center">
															<HiOutlineX className="me-2 f18" />
															Access Denied: You don't have permission to view Items/Services.
														</div>
													</Alert>
												</div>
											);
										}

										if (formik.values.boqReq === true) {
											return (
												<BoqScreen
													idFromURL={idFromURL}
													eventType="RFQ"
													CurrentVersion={formik?.values?.Version}
													stage={currentStage}
													boqReq={formik.values.boqReq}
													onUploadSuccess={() => {
														pullRFQItemServiceFind(idFromURL);
													}}
												/>
											);
										}
										return (
											<div>
												{/* Permission Alert for Items/Services Tab */}
												{permissionManager && (
													<div className="pb-0"></div>
												)}

												<div className="p-3 pt-0">
													{/* Items/Services toolbar */}
													<div className="rfq-items-toolbar">
														{/* <div className="rfq-items-toolbar-left">
															<span className="rfq-items-count">
																{rfqItemsList?.length > 0 ? `${rfqItemsList.length} item${rfqItemsList.length !== 1 ? 's' : ''}` : ''}
															</span>
														</div> */}
														<div className="rfq-items-toolbar-right">
															{rfqItemsList?.length > 0 && canRemove && (
																<>
																	<button
																		type="button"
																		className="pe-btn pe-btn--ghost"
																		onClick={() => setConfirmClearAllItems(true)}
																		disabled={!stagearray.includes(currentStage)}
																	>
																		Clear
																	</button>
																	<span className="rfq-items-divider" />
																</>
															)}
															<button
																type="button"
																className="pe-btn pe-btn--secondary"
																disabled={(!stagearray.includes(currentStage)) || !canCreate}
															>
																Pull PR Data
															</button>
															<span className="rfq-items-divider" />
															<button
																type="button"
																className="pe-btn pe-btn--secondary"
																disabled={(!stagearray.includes(currentStage)) || !canCreate}
																onClick={() => canCreate && document.getElementById('itemuploadid').click()}
															>
																<span>Excel Upload</span>
																<span className="rfq-question-action-chevron"><KeyboardArrowDownOutlined style={{ fontSize: 16 }} /></span>
															</button>
															<button
																type="button"
																className="pe-btn pe-btn--secondary"
																disabled={(!stagearray.includes(currentStage)) || !canRead}
																onClick={downloadItemsExcel}
															>
																Export Line Items
															</button>
															<span className="rfq-items-divider" />
															<button
																type="button"
																className="pe-btn pe-btn--primary"
																onClick={toggleDrawer("addProductDrawer", true)}
																disabled={(!stagearray.includes(currentStage)) || !canCreate}
															>
																<HiPlusSm /> Items/Services
															</button>
														</div>
													</div>
													<div className="">
														<ProductitemCell
															action={stagearray.includes(currentStage) && canEdit}
															itemsList={rfqItemsList}
															handleEditItem={canEdit ? handleEditItem : () => { }}
															handleDeleteItem={canRemove ? handleDeleteItem : () => { }}
															eventType="RFQ"
															CurrentVersion={formik?.values?.Version}
															readOnly={!canEdit}
															showEditButton={canEdit}
															showDeleteButton={canRemove}
														/>
													</div>
												</div>
											</div>
										);
									})()}
								</div>
							)}

							{/* Commercial Terms Tab Content */}
							{value === 3 && (
								<div>
									{(() => {
										const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.READ) ?? false;
										const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.EDIT) ?? false;
										const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.CREATE) ?? false;
										const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_TERMS, ACTIONS.REMOVE) ?? false;

										// Show permission status
										return (
											<>
												{effectivePermissionManager && (
													<div className="pb-0"></div>
												)}
												<EventCommercialScreen
													EventType="RFQ"
													EventId={idFromURL}
													LibraryType="CommercialLibrary"
													EventGeneralDetails={formik?.values}
													ref={EventCommercialScreenRef}
													Action={stagearray.includes(currentStage)}
													Version={formik?.values?.Version}
													currencyList={currencyList}
													commercialedit={iscomercialeditDisabled}
													permissionManager={effectivePermissionManager}
												/>
											</>
										);
									})()}
								</div>
							)}

							{/* Questions Tab Content */}
							{value === 4 && (
								<div>
									{(() => {
										const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.READ) ?? false;
										const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.EDIT) ?? false;
										const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.CREATE) ?? false;
										const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.QUESTIONS, ACTIONS.REMOVE) ?? false;

										// Show permission status
										return (
											<>
												{effectivePermissionManager && (
													<div className="pb-0"></div>
												)}
												<EventQuestionScreen
													props={{
														eventid: idFromURL,
														eventtype: "RFQ",
														librarytype: "QuestionLibrary",
														action: stagearray.includes(currentStage),
														supplierid: supplierid,
														Version: formik?.values?.Version,
														editquestion: isquestioneditDisabled,
														stagelist: stagelist,
														permissionManager: permissionManager,
														requestCell: requestCell
													}}
													ref={EventQuestionScreenRef}
												/>
											</>
										);
									})()}
								</div>
							)}


							{value == 5 && currentStage.trim() == "Draft" ? (
								<>
									{(() => {
										const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
										const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.EDIT) ?? false;
										const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false;
										const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;

										// Show permission status
										return (
											<>
												{effectivePermissionManager && (
													<div className="pb-0"></div>
												)}
											</>
										);
									})()}

									{tabloading ? <GridSkeleton /> :
										<>
											{issupplierreadDisabled === false &&
												<div className="sup-two-col">
													{/* Left column — Select Suppliers */}
													<div className="sup-col-left">
														<div className="sup-col-header">
															<div className="d-flex align-items-center gap-2">
																<span className="sup-col-title">Select Suppliers</span>
																<span className="sup-col-count">
																	Total Suppliers: {totalSupplier?.filter((x) => x.isShow && supplierMatchesSearch(x))?.length ?? 0}
																</span>
																{selectedCategory && (
																	<Badge pill bg="success" text="dark">
																		{selectedCategory?.categoryName}
																	</Badge>
																)}
															</div>
														</div>

														<div className="sup-filters">
															<div className="sup-filter-field">
																<Autocomplete
																	disablePortal
																	size="small"
																	options={categoryList ?? []}
																	fullWidth
																	className="sup-filter-control"
																	popupIcon={<KeyboardArrowDownOutlined style={{ fontSize: 16 }} />}
																	renderInput={(params) => <TextField {...params} placeholder="Sort by Category - All" />}
																	onOpen={() => { if (categoryList.length === 0) getCategorylist(); }}
																	getOptionLabel={(option) => option.itemCategory ?? ""}
																	value={selectedCategory}
																	onChange={(e, newvalue) => {
																		setSelectedCategory(newvalue);
																		handleSupplierWithCategory(newvalue);
																	}}
																/>
															</div>
															<div className="sup-filter-field">
																<TextField
																	id="searchvendorbyname"
																	placeholder="Search Suppliers"
																	size="small"
																	fullWidth
																	className="sup-filter-control"
																	value={supplierSearchQuery}
																	onChange={(e) => setSupplierSearchQuery(e.target.value)}
																	InputProps={{
																		endAdornment: supplierSearchQuery ? (
																			<IconButton size="small" onClick={() => setSupplierSearchQuery("")} style={{ padding: 2 }}>
																				<HiOutlineX style={{ fontSize: 16, color: '#9ca3af' }} />
																			</IconButton>
																		) : (
																			<SearchIcon style={{ fontSize: 18, color: '#9ca3af' }} />
																		),
																	}}
																/>
															</div>
														</div>

														<div className="sup-list">
															{(() => {
																const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
																if (!canRead) {
																	return (
																		<div className="p-3">
																			<Alert severity="warning">You don't have permission to view suppliers data.</Alert>
																		</div>
																	);
																}
																return totalSupplier
																	?.filter((x) => x.isShow && supplierMatchesSearch(x))
																	.slice((pageTS - 1) * pageCount, pageTS * pageCount)
																	.map((x, i) => (
																		<div className="sup-list-item" key={i}>
																			{stagearray.includes(currentStage) && (() => {
																				const canCreate = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false;
																				const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
																				return x?.isSelected == true ? (
																					<Checkbox className="sup-row-checkbox" size="small" checked disabled={!canRemove} onChange={(e) => handleSelectedSupplier(x, e.target.checked)} />
																				) : (
																					<Checkbox className="sup-row-checkbox" size="small" checked={false} disabled={!canCreate} onChange={(e) => handleSelectedSupplier(x, e.target.checked)} />
																				);
																			})()}
																			<div className="sup-row-copy">
																				<span>{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}</span>
																			</div>
																		</div>
																	));
															})()}
														</div>
														<div className="sup-pagination">
															{(() => {
																const totalItems = totalSupplier?.filter((x) => x.isShow && supplierMatchesSearch(x))?.length ?? 0;
																const totalPages = Math.ceil(totalItems / pageCount) || 1;
																const from = totalItems === 0 ? 0 : (pageTS - 1) * pageCount + 1;
																const to = Math.min(pageTS * pageCount, totalItems);
																return (
																	<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', padding: '5px 12px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0, minHeight: '44px' }}>
																		<span style={{ fontSize: "12px", color: "#6b7280" }}>Rows per page:</span>
																		<select value={pageCount} onChange={e => { setPageCount(Number(e.target.value)); setPageTS(1); }} style={{ fontSize: "12px", color: "#374151", border: "none", borderRadius: "4px", padding: "2px 4px", background: "#fff", cursor: "pointer" }}>
																			{[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
																		</select>
																		<span style={{ fontSize: "12px", color: "#6b7280" }}>{from}–{to} of {totalItems}</span>
																		<button onClick={() => setPageTS(p => Math.max(1, p - 1))} disabled={pageTS === 1} style={{ background: "none", border: "none", cursor: pageTS === 1 ? "default" : "pointer", color: pageTS === 1 ? "#d1d5db" : "#374151", fontSize: "16px", padding: "2px 4px", lineHeight: 1 }}>‹</button>
																		<button onClick={() => setPageTS(p => Math.min(totalPages, p + 1))} disabled={pageTS >= totalPages} style={{ background: "none", border: "none", cursor: pageTS >= totalPages ? "default" : "pointer", color: pageTS >= totalPages ? "#d1d5db" : "#374151", fontSize: "16px", padding: "2px 4px", lineHeight: 1 }}>›</button>
																	</div>);
															})()}
														</div>
													</div>

													{/* Right column — Selected Suppliers */}
													<div className="sup-col-right">
														<div className="sup-col-header">
															<div className="d-flex align-items-center gap-2">
																<span className="sup-col-title">Selected Suppliers</span>
																<span className="sup-col-count">Total Suppliers: {selectedSupplier?.length ?? 0}</span>
															</div>
														</div>

														<div className="sup-filters sup-filters-right">
															{stagearray.includes(currentStage) && (() => {
																const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
																return <button type="button" className="sup-clear-button" onClick={clearALLSelectedSupplier} disabled={!canRemove}>Clear</button>;
															})()}
														</div>

														<div className="sup-list">
															{(() => {
																const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
																if (!canRead) {
																	return (
																		<div className="p-3">
																			<Alert severity="warning">You don't have permission to view selected suppliers.</Alert>
																		</div>
																	);
																}
																return selectedSupplier
																	.slice((pageSS - 1) * pageCount, pageSS * pageCount)
																	.map((x, i) => (
																		<div className="sup-list-item" key={i}>
																			{stagearray.includes(currentStage) && (() => {
																				const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
																				return (
																					<Checkbox
																						className="sup-row-checkbox"
																						size="small"
																						checked
																						disabled={!canRemove}
																						onChange={(e) => handleSelectedSupplier(x, e.target.checked)}
																					/>
																				);
																			})()}
																			<div className="sup-row-copy">
																				<span>{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}</span>
																			</div>
																			<div className="sup-row-actions">
																				<Tooltip title="Action">
																					<IconButton
																						size="small"
																						className="sup-action-btn"
																						onClick={(e) => setSupplierRowMenuAnchor({ el: e.currentTarget, vendor: x })}
																					>
																						<HiDotsHorizontal style={{ fontSize: 16, color: '#374151' }} />
																					</IconButton>
																				</Tooltip>
																				<Menu
																					anchorEl={supplierRowMenuAnchor?.vendor === x ? supplierRowMenuAnchor?.el : null}
																					open={supplierRowMenuAnchor?.vendor === x && Boolean(supplierRowMenuAnchor?.el)}
																					onClose={() => setSupplierRowMenuAnchor(null)}
																					sx={{ maxWidth: 500 }}
																				>
																					{x.id != 0 && (
																						<MenuItem className="f12 fw500" onClick={() => { setSupplierRowMenuAnchor(null); handleLoadingFactorClick(x, i); }}>
																							Loading Factor
																						</MenuItem>
																					)}
																					{!stagearray.includes(currentStage) && (
																						<MenuItem className="f12 fw500" onClick={() => { setSupplierRowMenuAnchor(null); handleSupplierAction(x, 'Reopen'); }}>
																							Re-Open Quote
																						</MenuItem>
																					)}
																				</Menu>
																				{stagearray.includes(currentStage) && (() => {
																					const canRemove = permissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;
																					return (
																						<button type="button" className="pe-icon-btn pe-icon-btn--delete" disabled={!canRemove} onClick={() => clearSelectedSupplier(x, false)}>
																							<RiDeleteBin6Line />
																						</button>
																					);
																				})()}
																			</div>
																		</div>
																	));
															})()}
														</div>
														<div className="sup-pagination">
															{(() => {
																const totalItems = selectedSupplier?.length ?? 0;
																const totalPages = Math.ceil(totalItems / pageCount) || 1;
																const from = totalItems === 0 ? 0 : (pageSS - 1) * pageCount + 1;
																const to = Math.min(pageSS * pageCount, totalItems);
																return (
																	<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', padding: '5px 12px', borderTop: '1px solid #e5e7eb', background: '#fff', flexShrink: 0, minHeight: '44px' }}>
																		<span style={{ fontSize: "12px", color: "#6b7280" }}>Rows per page:</span>
																		<select value={pageCount} onChange={e => { setPageCount(Number(e.target.value)); setPageSS(1); }} style={{ fontSize: "12px", color: "#374151", border: "none", borderRadius: "4px", padding: "2px 4px", background: "#fff", cursor: "pointer" }}>
																			{[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
																		</select>
																		<span style={{ fontSize: "12px", color: "#6b7280" }}>{from}–{to} of {totalItems}</span>
																		<button onClick={() => setPageSS(p => Math.max(1, p - 1))} disabled={pageSS === 1} style={{ background: "none", border: "none", cursor: pageSS === 1 ? "default" : "pointer", color: pageSS === 1 ? "#d1d5db" : "#374151", fontSize: "16px", padding: "2px 4px", lineHeight: 1 }}>‹</button>
																		<button onClick={() => setPageSS(p => Math.min(totalPages, p + 1))} disabled={pageSS >= totalPages} style={{ background: "none", border: "none", cursor: pageSS >= totalPages ? "default" : "pointer", color: pageSS >= totalPages ? "#d1d5db" : "#374151", fontSize: "16px", padding: "2px 4px", lineHeight: 1 }}>›</button>
																	</div>);
															})()}
														</div>
													</div>
												</div>}

											{((value === 5) && issupplierreadDisabled === true) &&
												<NotFoundPage
													heading={`You Are Not Allowed To View Supplier Tab`}
													body1={`contact your Administrator for view rights`}
												/>
											}
										</>
									}
								</>
							) : (
								<></>
							)}
							{/* {to handle supplier after rfq submitted} */}
							{value == 5 && currentStage.trim() != "Draft" &&
								<>
									{(() => {
										const canRead = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.READ) ?? false;
										const canEdit = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.EDIT) ?? false;
										const canCreate = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.CREATE) ?? false;
										const canRemove = effectivePermissionManager?.hasPermission(CLAIM_TYPES.SUPPLIERS, ACTIONS.REMOVE) ?? false;

										// Show permission status
										return (
											<>
												{effectivePermissionManager && (
													<div className="pb-0"></div>
												)}
											</>
										);
									})()}

									<EventSuppliers
										updatesupplieronloading={updatesupplieronloading}
										selectedSupplier={selectedSupplier}
										stagearray={stagearray}
										currentStage={currentStage}
										handleSelectedSupplier={handleSelectedSupplier}
										handleLoadingFactorClick={handleLoadingFactorClick}
										handleSupplierAction={handleSupplierAction}
										clearSelectedSupplier={clearSelectedSupplier}
										pageSS={pageSS}
										pageCount={pageCount}
										totalpageSS={totalpageSS}
										handlePaginationSS={handlePaginationSS}
										issupplierraccesslevel={issupplierraccesslevel}
										CurrentVersion={formik?.values?.Version}
										versionhistory={EventHeaderDetails?.versionhistory}
										permissionManager={effectivePermissionManager}

									/>
								</>
							}
							{value == 6 && idFromURL && idFromURL !== "add" && !isNaN(parseInt(idFromURL)) &&

								<ERFQComparative
									key={"ERFQComparative"}
									accessLevel={accessLevel}
									handleTab={handleTab}
									headerActionsRef={rfqActionsPortalReady ? rfqReportActionsRef : null}
									onSubTabChange={setErfqActiveSubTab}
									actions={{
										rfqid: idFromURL,
										categoryList: categoryList,
										selectedsupplier: selectedSupplier,
										enddate: formik?.values?.endDate?.toISOString(),
										activityId: activityId,
										actionType: actionType,
										handleDraftEvent: handleDraftEvent,
										rfqtype: formik?.values?.RFQType,
										sealedBid: openQuotes,
										EventHeaderDetails: EventHeaderDetails,
										approvershow: approvershow,
										handleApprover: handleApprover,
										rfqheaderversion: formik?.values?.Version,
										purchaseAllList: purchaseAllList,
										purchaseGroupAllList: purchaseGroupAllList,
										currentStage: currentStage,
										filteredSupplier: handlefilteredSupplier,
										stagelist: stagelist,
										eventSubject: formik?.values?.subject,
										inputList: inputList,
										purchOrgId: formik.values?.purchOrgId,
										purchGrpId: formik.values?.purchGrpId,
										updatesupplieronloading: updatesupplieronloading,
										stagearray: stagearray,
										handleSelectedSupplier: handleSelectedSupplier,
										handleLoadingFactorClick: handleLoadingFactorClick,
										handleSupplierAction: handleSupplierAction,
										clearSelectedSupplier: clearSelectedSupplier,
										pageSS: pageSS,
										pageCount: pageCount,
										totalpageSS: totalpageSS,
										handlePaginationSS: handlePaginationSS,
										issupplierraccesslevel: issupplierraccesslevel,
										versionhistory: EventHeaderDetails?.versionhistory,
										RFQVersionHistory: formik?.values?.RFQVersionHistory,
										handleLoadingFactorNew: handleLoadingFactorNew,
										isUpdated: isUpdated,
										permissionManager: permissionManager,
										isNFA: false
									}}
								/>}

							{value == 8 &&
								<QueryList
									pageSlug={pageSlug}
									key={"QueryList"}
									accessLevel={accessLevel}
									fromEventPage={true} // or better: fromEventPage={true}
									EventId={pageSlug} // assuming pageSlug is RFQ ID
									EventType={"RFQ"} // set the event type
									permissionManager={permissionManager}
								/>
							}
							{value == 9 &&
								<EventAllocationScreen
									props={{
										eventId: idFromURL,
										nfaEventId: idFromURL,
										nfaEventType: 'RFQ',
										Version: formik?.values?.Version,
										nfaEventVersion: formik?.values?.Version,
										currentStage: "Allocation",
										permissionManager: effectivePermissionManager
									}}
									ref={NFASOBRFQRef}
								/>
							}
							{value == 7 && rfqpreview && !showGeneralAccessDenied && idFromURL && idFromURL !== 'add' && (
								<div className="rfq-preview-scroll-area">
									{accessLevel?.find(x => x.claimType == "General")?.claimValue?.Read != "N" &&
										<>
											<div className="rfq-preview-section-card mb-3">
												<div className="rfq-preview-card-body">
													<div className="d-flex justify-content-between align-items-center mb-3" id="generaldetails">
														<div className="rfq-preview-section-title"><ArticleOutlinedIcon className="rfq-preview-section-icon" />RFQ General Details</div>
														{/* <h5 className="preview-section-heading text-dark-blue mb-0">RFQ General Details</h5> */}
														{stagearray.includes(currentStage) && (
															<button
																type="button"
																className="pe-icon-btn pe-icon-btn--edit"
																onClick={() => handletabEdit(1)}
															>
																<HiPencilAlt />
															</button>
														)}
													</div>

													<RFQGeneralPreview formik={formik} inputList={inputList}
														purchaseAllList={purchaseAllList}
														purchaseGroupAllList={purchaseGroupAllList}
														customClassName="none"
													/>
												</div>
											</div>
										</>
									}

									{accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Read !== "N" && (
										<>
											{/* === SAME STYLE AS RFQ GENERAL DETAILS === */}
											<div className="d-flex justify-content-between align-items-center mb-3" id="rfqitemsdetails">
												<div className="rfq-preview-section-title"><ListAltOutlinedIcon className="rfq-preview-section-icon" />RFQ Items Details</div>

												{stagearray.includes(currentStage) && (
													<button
														type="button"
														className="pe-icon-btn pe-icon-btn--edit"
														onClick={() => handletabEdit(2)}
													>
														<HiPencilAlt />
													</button>
												)}
											</div>

											{/* CARD WITHOUT HEADER */}
											<div className="rfq-preview-section-card mb-3">
												<div className="rfq-preview-card-body">
													{formik.values.boqReq === true ? (
														<BoqScreen
															idFromURL={idFromURL}
															eventType="RFQ"
															CurrentVersion={formik?.values?.Version}
															stage={currentStage}
															boqReq={formik.values.boqReq}
															readOnly={true}
														/>
													) : (
														<ProductitemCell
															action={false}
															itemsList={rfqItemsList}
															handleEditItem={handleEditItem}
															handleDeleteItem={handleDeleteItem}
														/>
													)}
												</div>
											</div>
										</>
									)}

									{
										accessLevel?.find(x => x.claimType == "Commercial Terms")?.claimValue?.Read !== "N" && (
											<>

												{/* === SAME STYLE HEADING LIKE “RFQ General Details” === */}
												<div className="d-flex justify-content-between align-items-center mb-3" id="rfqcommercialdetails">
													<div className="rfq-preview-section-title"><ReceiptLongOutlinedIcon className="rfq-preview-section-icon" />RFQ Commercial Details</div>

													{stagearray.includes(currentStage) && (
														<button
															type="button"
															className="pe-icon-btn pe-icon-btn--edit"
															onClick={() => handletabEdit(3)}
														>
															<HiPencilAlt />
														</button>
													)}
												</div>

												{/* === CARD WITHOUT HEADER === */}
												<div className="rfq-preview-section-card mb-3">
													<div className="rfq-preview-card-body">

														{/* Component Body */}
														<EventCommercialScreen
															EventType="RFQ"
															EventId={idFromURL}
															LibraryType="CommercialLibrary"
															Version={formik?.values?.Version}
															EventGeneralDetails={formik?.values}
															Action={false}
															currencyList={currencyList}
															ref={EventCommercialScreenRef}
															permissionManager={effectivePermissionManager}
														/>
													</div>
												</div>
											</>
										)
									}

									{
										accessLevel?.find(x => x.claimType == "Questions")?.claimValue?.Read !== "N" && (
											<>
												{/* === SAME STYLE HEADING LIKE OTHER SECTIONS === */}
												<div className="d-flex justify-content-between align-items-center mb-3" id="rfqquestions">
													<div className="rfq-preview-section-title"><HelpOutlineOutlinedIcon className="rfq-preview-section-icon" />RFQ Questions</div>

													{stagearray.includes(currentStage) && (
														<button
															type="button"
															className="pe-icon-btn pe-icon-btn--edit"
															onClick={() => handletabEdit(4)}
														>
															<HiPencilAlt />
														</button>
													)}
												</div>

												{/* === CARD WITHOUT HEADER === */}
												<div className="rfq-preview-section-card mb-3">
													<div className="rfq-preview-card-body">

														{/* Component */}
														<EventQuestionScreen
															props={{
																eventid: idFromURL,
																eventtype: "RFQ",
																librarytype: "QuestionLibrary",
																action: false,
																supplierid: supplierid,
																Version: formik?.values?.Version,
																editquestion: isquestioneditDisabled,
																stagelist: stagelist,
																permissionManager: permissionManager,
																requestCell: requestCell
															}}
															ref={EventQuestionScreenRef}
														/>
													</div>
												</div>
											</>
										)
									}

									{
										accessLevel?.find(x => x.claimType == "Invite Vendor")?.claimValue?.Read !== "N" && (
											<>
												{/* === SAME STYLE HEADING LIKE OTHER SECTIONS === */}
												<div className="d-flex justify-content-between align-items-center mb-3" id="invitedsuppliers">
													<div className="rfq-preview-section-title"><GroupOutlinedIcon className="rfq-preview-section-icon" />Invited Suppliers</div>

													{stagearray.includes(currentStage) && (
														<button
															type="button"
															className="pe-icon-btn pe-icon-btn--edit"
															onClick={() => handletabEdit(5)}
														>
															<HiPencilAlt />
														</button>
													)}
												</div>

												{/* === CARD WITHOUT HEADER === */}
												<div className="rfq-preview-section-card mb-3">
													<div className="rfq-preview-card-body">
														<div className="row">
															<div className="col-12">
																<SelectedSupplierCell selectedsupplier={selectedSupplier} />
															</div>
														</div>
													</div>
												</div>
											</>
										)
									}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right content - Approval Section */}
				<div className={`rightContent ${approvershow ? "" : "d-none"}`}>
					<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column approver-panel" style={{ overflow: 'hidden' }}>
						<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2 flex-shrink-0 rfq-dv2-workflow-head">
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
						</div>
						{/* Approve/Reject/Forward action panel — only when URL has ActionType param (same as prod) */}
						{/* Hidden when stage is Technical Approval — that stage uses inline per-vendor Approve/Reject in Technical Comparison tab */}
						{workflowPanelTab === "workflow" && (actionType === "approval" || actionType === "Forward") && currentStage !== 'Technical Approval' && (
							<div className="rfq-dv2-workflow-action-panel">
								<div className="rfq-dv2-workflow-alert">
									<PiWarningDiamondFill className="rfq-dv2-workflow-alert-icon" />
									<span>
										{actionType === "Forward"
											? `Forward for Approval required for You`
											: `${normalizedCurrentStage} required for You`}
									</span>
								</div>
								<div className="rfq-dv2-workflow-actions">
									{actionType === "approval" && (
										<>
											<button
												type="button"
												className="rfq-dv2-workflow-btn rfq-dv2-workflow-approve"
												onClick={(event) => {
													formik_ApproveReject.setFieldValue("status", "Approved");
													toggleDrawer("openInvoiceApproved", true)(event);
												}}
											>
												Approve
											</button>
											<button
												type="button"
												className="rfq-dv2-workflow-btn rfq-dv2-workflow-reject"
												onClick={(event) => {
													formik_ApproveReject.setFieldValue("status", "Rejected");
													toggleDrawer("openInvoiceApproved", true)(event);
												}}
											>
												Reject
											</button>
										</>
									)}
									{actionType === "Forward" && (
										<button
											type="button"
											className="rfq-dv2-workflow-btn rfq-dv2-workflow-approve"
											onClick={(event) => {
												formik_ApproveReject.setFieldValue("status", "Forward");
												toggleDrawer("openInvoiceApproved", true)(event);
											}}
										>
											Forward
										</button>
									)}
								</div>
							</div>
						)}
						<div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
							{approvershow && workflowPanelTab === "workflow" && (
								<EventApprovalBox
									requestCell={requestCell}
									handleEventAppList={handleEventAppList}
									wfupdate={wfupdate}
									action={true}
									stagelist={stagelist}
									accessLevel={accessLevel}
									Version={parseInt(formik?.values?.Version)}
									permissionManager={permissionManager}
									eventCode={tempDataEditData?.[0]?.eventCode}
									eventSubject={tempDataEditData?.[0]?.subject}
									startDate={tempDataEditData?.[0]?.startDate}
									endDate={tempDataEditData?.[0]?.endDate}
									currentStage={currentStage}
								/>
							)}
							{/* ── History Tab ── */}
							{approvershow && workflowPanelTab === "history" && (
								<div className="rfq-dv2-history-track">
									{historyLoading ? (
										<div className="rfq-dv2-panel-loading">Loading history…</div>
									) : historyGraph.length === 0 && historyAudit.length === 0 ? (
										<div className="rfq-dv2-panel-empty">No history found.</div>
									) : (
										<>
											{/* State Graph */}
											{historyGraph.length > 0 && (
												<div className="rfq-dv2-stage-graph">
													{historyGraph.map((stage, i) => {
														const name = stage.approverName ?? stage.modifiedByName ?? 'Unknown';
														const date = stage.stageDone
															? formatDateViaLocale(stage.stageDone, userDetail)
															: formatDateViaLocale(stage.modifiedOn, userDetail);
														return (
															<React.Fragment key={i}>
																{/* → arrow between boxes */}
																{i > 0 && (
																	<div className="rfq-dv2-stage-graph-arrow">
																		<span className="rfq-dv2-stage-arrow-icon">→</span>
																	</div>
																)}
																<div className="rfq-dv2-stage-graph-node">
																	{/* ✓ Stage badge */}
																	<span className="rfq-dv2-stage-graph-badge">
																		<span className="rfq-dv2-stage-check">✓</span>
																		{stage.currentStage?.toUpperCase()}
																	</span>
																	{/* Name */}
																	<span className="rfq-dv2-stage-graph-user">{name}</span>
																	{/* Date */}
																	<span className="rfq-dv2-stage-graph-date">{date}</span>
																</div>
															</React.Fragment>
														);
													})}
												</div>
											)}

											{/* Change History List — temporarily hidden */}
											{/* TODO: re-enable when needed
											{historyAudit.length > 0 && (
												<div className="rfq-dv2-history-list">
													...
												</div>
											)}
											*/}
										</>
									)}
								</div>
							)}

							{/* ── Attachments Tab ── */}
							{approvershow && workflowPanelTab === "attachments" && (
								<div className="rfq-dv2-attachments-panel">
									{panelAttachLoading ? (
										<div className="rfq-dv2-panel-loading">Loading attachments…</div>
									) : (
										<>
											{/* ── Add new file section ── same guard as prod AttachmentWorkFlow ── */}
											{stagearray.includes(currentStage) && (effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.CREATE) ?? false) && (
												<div className="rfq-dv2-attach-add-section">
													{/* Description textarea */}
													<textarea
														className="rfq-dv2-attach-desc-input"
														placeholder="Attachment Description"
														rows={4}
														value={panelAttachDesc}
														onChange={e => {
															setPanelAttachDesc(e.target.value.replace(/'/g, ''));
															if (panelAttachError) setPanelAttachError('');
														}}
													/>

													{/* File picker zone */}
													<label className="rfq-dv2-file-zone">
														<input
															type="file"
															ref={panelFileInputRef}
															style={{ display: 'none' }}
															accept=".docx,.doc,.jpeg,.jpg,.gif,.png,.pdf,.xlsx"
															onChange={e => {
																if (validateFileSize(e)) {
																	setPanelAttachFile({ file: e.target.files[0] });
																	if (panelAttachError) setPanelAttachError('');
																} else {
																	setPanelAttachFile(null);
																}
															}}
														/>
														{panelAttachFile ? (
															<div className="rfq-dv2-file-chip">
																<HiDownload className="rfq-dv2-file-chip-icon" />
																<span className="rfq-dv2-file-chip-name">{panelAttachFile.file.name}</span>
																<button
																	type="button"
																	className="rfq-dv2-file-chip-clear"
																	onClick={e => { e.preventDefault(); e.stopPropagation(); setPanelAttachFile(null); if (panelFileInputRef.current) panelFileInputRef.current.value = ''; }}
																>
																	<HiOutlineX />
																</button>
															</div>
														) : (
															<div className="rfq-dv2-file-zone-empty">
																<HiPlusSm className="rfq-dv2-file-zone-icon" />
																<span>Click to choose file</span>
																<span className="rfq-dv2-file-zone-hint">pdf, doc, xlsx, png…</span>
															</div>
														)}
													</label>

													{panelAttachError && (
														<div className="rfq-dv2-attach-error">{panelAttachError}</div>
													)}

													{/* Add button */}
													<button
														type="button"
														className="rfq-dv2-add-file-btn"
														onClick={addPanelAttachment}
														disabled={panelAttachAdding}
													>
														<HiPlusSm />
														{panelAttachAdding ? 'Adding…' : 'Add new file'}
													</button>
												</div>
											)}

											{/* ── File rows ── */}
											{panelSavedAttach.length === 0 ? (
												<div className="rfq-dv2-panel-empty">No attachments yet.</div>
											) : (
												<div className="rfq-dv2-attach-list">
													{panelSavedAttach.map((item, i) => (
														<div key={i} className="rfq-dv2-file-row">
															{/* Checkbox */}
															<Checkbox
																size="small"
																className="rfq-dv2-file-tc"
																checked={item.fileType === 'TC'}
																disabled={
																	!stagearray.includes(currentStage) ||
																	!(effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.EDIT) ?? false)
																}
																onChange={e => {
																	const updated = panelSavedAttach.map((a, idx) =>
																		idx === i ? { ...a, fileType: e.target.checked ? 'TC' : '' } : a
																	);
																	setPanelSavedAttach(updated);
																	handleattachmentforevent(updated);
																	setPanelHasCheckboxChanged(true);
																}}
															/>
															{/* Description (bold) + filename stacked */}
															<div className="rfq-dv2-file-meta">
																<span className="rfq-dv2-file-desc-text" title={item.attachmentDescription}>
																	{item.attachmentDescription || '—'}
																</span>
																<span className="rfq-dv2-file-name-text" title={getFileName(item.fileNamePath)}>
																	{getFileName(item.fileNamePath)}
																</span>
															</div>
															{/* Download */}
															<button
																type="button"
																className="pe-icon-btn pe-icon-btn--download"
																aria-label="Download"
																onClick={() => downloadFilesOnAzure(item.fileNamePath, getFileName(item.fileNamePath), atoken)}
															>
																<HiDownload />
															</button>
															{/* Delete */}
															{stagearray.includes(currentStage) && !item.required && (effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.REMOVE) ?? false) && (
																<button
																	type="button"
																	className="pe-icon-btn pe-icon-btn--delete"
																	aria-label="Delete"
																	onClick={() => deletePanelAttachment(i, item.id)}
																>
																	<HiOutlineX />
																</button>
															)}
														</div>
													))}
												</div>
											)}

											{/* ── Update button — same guard as prod: action + READ + EDIT + hasCheckboxChanged ── */}
											{stagearray.includes(currentStage) &&
												panelHasCheckboxChanged &&
												panelSavedAttach.length > 0 &&
												(effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.READ) ?? false) &&
												(effectivePermissionManager?.hasPermission(CLAIM_TYPES.DOCUMENT_LIBRARY, ACTIONS.EDIT) ?? false) && (
													<div className="rfq-dv2-attach-update-row">
														<button
															type="button"
															className="rfq-dv2-attach-update-btn"
															onClick={updatePanelAttachments}
															disabled={panelIsUpdating}
														>
															{panelIsUpdating ? 'Updating…' : 'Update'}
														</button>
													</div>
												)}
										</>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{state["addProductDrawer"] && (
				<div className="rfq-v2-event-drawer-backdrop" onClick={toggleDrawer("addProductDrawer", false)}>
					<section className="rfq-v2-event-drawer" onClick={e => e.stopPropagation()}>
						<header className="rfq-v2-event-drawer-header">
							<h2 className="rfq-v2-event-drawer-title">{itemEditTempData?.id > 0 ? 'Edit Product / Service' : 'Add Product / Service'}</h2>
							<div className="rfq-v2-event-drawer-actions">
								<button type="button" className="pe-btn pe-btn--ghost" onClick={toggleDrawer("addProductDrawer", false)}>Cancel</button>
								{stagearray.includes(currentStage) && (
									<>
										<button type="reset" form="add-product-form" className="pe-btn pe-btn--secondary">Reset</button>
										<button type="submit" form="add-product-form" className="pe-btn pe-btn--primary">{itemEditTempData?.id > 0 ? 'Update' : 'Add'}</button>
									</>
								)}
							</div>
						</header>
						<div className="rfq-v2-event-drawer-body" style={{ overflowY: 'auto' }}>
							<AddProductsCell
								idFromURL={idFromURL}
								UOMMaster={UOMMaster}
								callbackItemAdd={callbackItemAdd}
								itemEditTempData={itemEditTempData}
								handleUomList={handleUomList}
								action={stagearray.includes(currentStage)}
								accesslevel={accessLevel?.itemservice?.created}
								Version={formik?.values?.Version}
							/>
						</div>
					</section>
				</div>
			)}
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
									libraryId={libraryId}
									questionforedit={questionforedit}
								/>
							</Box>
						</div>
					</Box>
				</Drawer>
			</React.Fragment>
			{state["surrogateDrawer"] && (
				<div className="rfq-v2-event-drawer-backdrop" onClick={toggleDrawer("surrogateDrawer", false)}>
					<section className="rfq-v2-event-drawer" onClick={e => e.stopPropagation()}>
						<header className="rfq-v2-event-drawer-header">
							<h2 className="rfq-v2-event-drawer-title">{selectedAction}</h2>
							<div className="rfq-v2-event-drawer-actions">
								<button type="button" className="pe-btn pe-btn--ghost" onClick={toggleDrawer("surrogateDrawer", false)}>Cancel</button>
								<button type="button" className="pe-btn pe-btn--secondary" onClick={() => formik_Action.resetForm()}>Reset</button>
								<button type="submit" form="surrogate-action-form" className="pe-btn pe-btn--primary">Submit</button>
							</div>
						</header>
						<div className="rfq-v2-event-drawer-body">
							<form id="surrogate-action-form" onSubmit={formik_Action.handleSubmit} autoComplete="off">
								<div className="row">
									<div className="col-12 mb-4">
										<label className="pe-field-label">Supplier <span className="rfq-required-star">*</span></label>
										<TextField
											fullWidth size="small" variant="outlined" id="supplierselected" name="supplierselected"
											value={`${formik_Action.values.supplier?.contactPerson} | ${formik_Action.values.supplier?.emailId} | ${formik_Action.values.supplier?.companyName}`}
											disabled className="f14" autoComplete="off"
										/>
									</div>
									{selectedAction === "Surrogate RFQ" && (
										<>
											<div className="col-12 col-md-6 mb-4">
												<label className="pe-field-label">Surrogator Name</label>
												<TextField
													fullWidth size="small" variant="outlined"
													id="name" name="name" className="f14" autoComplete="off"
													inputProps={{ maxLength: 100 }}
													value={formik_Action.values.name}
													onChange={(e) => formik_Action.setFieldValue("name", e.target?.value)}
													error={formik_Action.touched.name && Boolean(formik_Action.errors.name)}
													helperText={formik_Action.touched.name && formik_Action.errors.name}
												/>
											</div>
											<div className="col-12 col-md-6 mb-4">
												<label className="pe-field-label">Surrogator Email <span className="rfq-required-star">*</span></label>
												<TextField
													fullWidth size="small" variant="outlined"
													id="email" name="email" className="f14" autoComplete="off"
													inputProps={{ maxLength: 100 }}
													value={formik_Action.values.email}
													onChange={(e) => formik_Action.setFieldValue("email", e.target?.value)}
													error={formik_Action.touched.email && Boolean(formik_Action.errors.email)}
													helperText={formik_Action.touched.email && formik_Action.errors.email}
												/>
											</div>
										</>
									)}
									<div className="col-12 mb-4">
										<label className="pe-field-label">Remark</label>
										<TextField
											fullWidth size="small" variant="outlined" multiline rows={4}
											id="Reason" name="Reason" className="f14" autoComplete="off"
											inputProps={{ maxLength: 200 }}
											value={formik_Action.values.Reason}
											onChange={(e) => formik_Action.setFieldValue("Reason", e.target?.value)}
											error={formik_Action.touched.Reason && Boolean(formik_Action.errors.Reason)}
											helperText={formik_Action.touched.Reason && formik_Action.errors.Reason}
										/>
									</div>
								</div>
							</form>
						</div>
					</section>
				</div>
			)}
			<React.Fragment key="key4">

				<ApprovalConfirmDialog
					open={state["openInvoiceApproved"]}
					onClose={toggleDrawer("openInvoiceApproved", false, [])}
					onSubmit={formik_ApproveReject.handleSubmit}
					status={formik_ApproveReject.values?.status}
					stageName={normalizedCurrentStage}
					comment={formik_ApproveReject.values?.approveComment}
					onCommentChange={(val) => formik_ApproveReject.setFieldValue("approveComment", val)}
				/>
			</React.Fragment>

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
			<Dialog open={modalcancelOpen} onClose={() => handleCancelRFQModal(false)}>
				<DialogTitle>{"Are you sure?"}</DialogTitle>
				<DialogContent style={{ minWidth: "300px" }}>
					<DialogContentText>
						Do you want to cancel this rfq? Unsaved changes will be lost.
					</DialogContentText>
					<label className="pe-field-label">Enter reason <span className="rfq-required-star">*</span></label>
					<TextField
						autoFocus
						margin="dense"
						type="text"
						fullWidth
						value={cancelReason}
						onChange={handleCancelInputChange}
						error={Boolean(rfqerror)} // Show error state
						helperText={rfqerror} // Display error message
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => handleCancelRFQModal(false)}>No</Button>
					<Button onClick={() => handleCancelRFQModal(true)} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
			{/* <Modal
				size="xl"
				show={purchaseOrgModal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW CATEGORY"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => ClosePurcgaseOrgModal()}
			> */}
			<Modal
				show={purchaseOrgModal}
				dialogClassName="modal-custom-mdlg"
				className="zindex1280"
				backdropClassName="zindex1280"
				backdrop="static"
				keyboard={false}
				centered
				onHide={ClosePurcgaseOrgModal}
			>
				<Modal.Body className="p-0 d-flex flex-column">
					<div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
						<span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Purchase Organization</span>
						<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => ClosePurcgaseOrgModal()}>
							<HiOutlineX />
						</button>
					</div>
					<div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
						<PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				show={loadingModal}
				dialogClassName="modal-custom-mdlg"
				className="zindex1280"
				backdropClassName="zindex1280"
				backdrop="static"
				keyboard={false}
				centered
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
						<LoadingFactor
							isModal={true}
							rfqId={idFromURL}
							version={formik?.values?.Version}
							vendorId={storeVId}
							initialFactors={filteredLoadingFactors}
							baseCurrency={formik?.values?.baseCurrency}
							onSubmitSuccess={() => { setupdatesupplieronloading(1); setIsUpdated(true); }}
						/>
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				show={purchaseOrgGrpModal}
				dialogClassName="modal-custom-mdlg"
				backdrop="static"
				keyboard={false}
				centered
				contentClassName="border-0"
				onHide={ClosePurcgaseOrgGrpModal}
			>
				<Modal.Body className="p-0 d-flex flex-column" style={{ height: '78vh', overflow: 'hidden' }}>
					<div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
						<span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Purchase Group</span>
						<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={() => ClosePurcgaseOrgGrpModal()}>
							<HiOutlineX />
						</button>
					</div>
					<div className="p-3 flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
						<PurchaseOrgGrp isModal />
					</div>
				</Modal.Body>
			</Modal>

			{/* ── Save as Template modal ── */}
			<Modal
				show={open}
				backdrop="static"
				keyboard={false}
				className="zindex10002 rfq-create-modal"
				backdropClassName="zindex10002"
				centered
				contentClassName="border-0 rounded-default"
				onHide={handleClose}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title>
						<span style={{ fontSize: 14 }}>Save as Template</span>
					</Modal.Title>
					<button type="button" className="pe-icon-btn pe-icon-btn--close" onClick={handleClose}>
						<HiOutlineX style={{ fontSize: 16 }} />
					</button>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<label className="pe-field-label" htmlFor="rfqTemplateTitle">RFQ Template Title</label>
						<TextField
							id="rfqTemplateTitle"
							fullWidth
							size="small"
							variant="outlined"
							autoComplete="off"
							inputProps={{ maxLength: 100 }}
							value={TemplateTitle}
							onChange={(e) => setTemplateTitle(e.target.value)}
						/>
						<div className="col-12 mt-4 d-flex justify-content-end gap-2">
							<button type="button" className="pe-btn pe-btn--ghost" onClick={handleClose}>Cancel</button>
							<button type="button" className="pe-btn pe-btn--primary" onClick={handleSaveTemplate} disabled={!idFromURL}>Save</button>
						</div>
					</div>
				</Modal.Body>
			</Modal>
			{confirmEventUpdate && (
				<Dialog open={confirmEventUpdate} onClose={() => handleCloseEventUpdate(false)}>
					<DialogTitle>{"Are you sure?"}</DialogTitle>
					<DialogContent style={{ minWidth: "300px" }}>
						<DialogContentText>
							Are you sure you want to update the event? This action may trigger a reinitiation of the RFQ process.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => handleCloseEventUpdate(false)}>Cancel</Button>
						<LoadingButton
							loading={loading}
							onClick={handleDraftEvent} autoFocus>
							Yes
						</LoadingButton>
					</DialogActions>
				</Dialog>

			)}

			<input className="d-none" id="itemuploadid" ref={fileInputRef} type="file" onChange={handleFileChange} />

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

			{/* {basecurrency} */}
			<Modal
				size="sm"
				show={modal1}
				backdrop="static"
				keyboard={false}
				centered
				className="zindex1270 rfq-create-modal"
				backdropClassName="zindex1270"
				contentClassName="border-0 rounded-default"
				onHide={() => handleCloseModal1()}
			>
				<Modal.Header className="pt-2 pb-2">
					<Modal.Title>
						<span style={{ fontSize: 14 }}>Select Base Currency</span>
					</Modal.Title>
					<button type="button" className="rfq-modal-close-btn" onClick={() => handleCloseModal1()}>
						<HiOutlineX style={{ fontSize: 16 }} />
					</button>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<label className="pe-field-label">Select Currency <span className="rfq-required-star">*</span></label>
						<TextField
							id="basecurrencymodal"
							name="baseCurrency"
							select
							className="w-100 f14"
							size="small"
							variant="outlined"
							SelectProps={{
								onOpen: () => {
									if (currencyList.length === 0 && !loadCurrency) {
										pullgetCurrency();
									}
								}
							}}
							value={formik?.values?.baseCurrency}
							onChange={(e) => {
								const newValue = e.target?.value;
								if (newValue === "new") {
									handleCloseModal1();
									setTimeout(() => { setOpenCurrencyModal(true); }, 100);
									return;
								}
								formik.setFieldValue("baseCurrency", newValue);
								handleCloseModal1();
							}}
						>
							{loadCurrency ? (
								<MenuItem>Loading...</MenuItem>
							) : [
								...(currencyList || []).map((option) => (
									<MenuItem key={option.id} value={option?.currencyNm}>
										{option?.currencyNm}
									</MenuItem>
								)),
								<MenuItem key="new" value="new" className="dropdown-add-new">
									Add New
								</MenuItem>
							]}
						</TextField>
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

			{/* Currency Modal */}
			<Modal
				size="md"
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
};

export default RequestForQuotation;
