import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useStateValue } from "../../../store";
import LoadingButton from "@mui/lab/LoadingButton";
import {
	MenuItem,
	Tooltip,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Box,
	Tab,
	Tabs,
	Menu,
	Typography,
	CircularProgress,
	Alert
} from "@mui/material";
import { DropdownButton, Fade, Modal, Table } from "react-bootstrap";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import {
	ChevronLeft,
	ChevronRight,
	CommentOutlined,
	ExpandMore,
	ExpandMoreOutlined,
	InfoOutlined,
	KeyboardDoubleArrowLeft,
	PushPinOutlined,
} from "@mui/icons-material";
import { InputAdornment, TextField, Dialog } from "@mui/material"
import {
	HiChevronDown,
	HiDotsVertical,
	HiOutlineX,
} from "react-icons/hi";
import { api, ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import {
	downloadFilesOnAzure,
	findStringByValueFromArray,
	getFileName,
	getStageInfo,
	sumArray,
	menuactionlist
} from "../../../utils/common";
import {
	buildQueryParams,
	formatDateViaLocale,
	formatDateViaTime,
	formattimeoption,
	renderHtmlAsText,
} from "../../../utils/common/utility";
import { GrAttachment } from "react-icons/gr";
import { MdOutlineOpenInFull, MdCloseFullscreen } from "react-icons/md";
import RFQSummary from "./RFQSummary";
import { FastApiClient } from "../../../FastApiClient";
import SupplierAttachmentCell from "./SupplierAttachmentCell";
import SupplierTechnicalResponses from "../../../components/Reports/SupplierTechnicalResponses";
import RFQActionDrawer from "../../../components/Reports/RFQActionDrawer";
import { FaComment } from "react-icons/fa";
import WhiteTooltip from "../../../components/whitetooltip";
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import { id } from "date-fns/locale";
import EventFinancialComparativeScreen from "../../../components/Event/EventFinancialComparativeScreen";
import EventCommercialComparativeScreen from "../../../components/Event/EventCommercialComparativeScreen";
import { MRT_ToggleFullScreenButton } from "material-react-table";
import ComparisonScreen from "../../../components/Event/ComparisonScreen/DEMO";
import { RFQSupplierQuestionsModal } from "../../../utils/modal";
import ExecutiveSummary from '../../../components/Event/ComparisonScreen/ExecutiveSummary';
import ComparativeAnalysis from '../../../components/Event/ComparisonScreen/ComparativeAnalysis';
import CommercialComparative from '../../../components/Event/ComparisonScreen/CommercialComparative';
import TechnicalComparative from '../../../components/Event/ComparisonScreen/TechnicalComparative';
import { rfqSummaryData, comparativeAnalysisData, commercialComparativeData, technicalComparativeData, tempData, tempCommercialData, tempTechnicalData } from '../../../components/Event/ComparisonScreen/data/mockData';
import SupplierIndividualReport from "../../../pages/Configuration/RequestForQuotation/SupplierIndividualReport";
import { use } from "react";
import LockIcon from "@mui/icons-material/Lock";
import styles from '../../../components/Event/ComparisonScreen/ExecutiveSummary.module.css';
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { parse } from "date-fns";
import TechnicalComparisonMaximizeView from './TechnicalComparisonMaximizeView';
import ApprovalConfirmDialog from '../../../components/RFQ/ApprovalConfirmDialog';
const ERFQComparative = ({ accessLevel, handleTab, actions, headerActionsRef, onSubTabChange }) => {

	const navigate = useNavigate();
	const location = useLocation();
	const [anchorEl, setAnchorEl] = useState(null); //state to handle  version dropdown open and close
	const [
		{ atoken, customerid, customersuffix, userDetail },
		dispatch, thousands_separators
	] = useStateValue();
	const [rfqItemsList, setrfqItemsList] = useState([]);
	const [rfqQuestionList, setRFQQuestionList] = useState([]) //it sets question of rfqs
	const [rfqItemCommercialList, setRfqItemCommercialList] = useState([]);
	const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
	const apiClient = new ApiClient(customersuffix);
	const [openSupplier, setOpenSupplier] = useState(false);
	const [openViewSupplier, setOpenViewSupplier] = useState(false);
	const [openPoDetail, setOpenPoDetail] = useState(false);
	const [openLoadingF, SetLoadingF] = useState(false);
	const handleCloseLoadingF = () => SetLoadingF(false);
	const [selectedLoadingF, SetSelectedLoadingF] = useState(null);
	const handleOpenLoadingF = (v) => {
		SetLoadingF(true);
		SetSelectedLoadingF(v);
	};
	const [selectedpodetails, setSelectedPODetails] = useState(null);
	const handleOpenPoDetail = (v) => {

		setOpenPoDetail(true);
		setSelectedPODetails(v);
	};
	const handleClosePoDetail = () => setOpenPoDetail(false);
	// Accordion state management - replacing tabs
	const [expandedFinancial, setExpandedFinancial] = useState(false);
	const [expandedCommercial, setExpandedCommercial] = useState(false);
	const [expandedTechnical, setExpandedTechnical] = useState(false);
	const [expandedSummary, setExpandedSummary] = useState(false);
	const [expandedSupplierAttachments, setExpandedSupplierAttachments] = useState(false);

	const handleAccordionChange = (panel) => (event, isExpanded) => {
		switch (panel) {
			case 'financial':
				setExpandedFinancial(isExpanded);
				break;
			case 'commercial':
				setExpandedCommercial(isExpanded);
				break;
			case 'technical':
				setExpandedTechnical(isExpanded);
				break;
			case 'summary':
				setExpandedSummary(isExpanded);
				break;
			case 'supplierAttachments':
				setExpandedSupplierAttachments(isExpanded);
				break;
			default:
				break;
		}
	};
	const [reInvite, setreInvite] = useState(0);
	const [isExpanded, setIsExpanded] = useState(false);

	const { pageSlug, supplierid } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();

	const [activityId, setActvityId] = useState(0);
	const [stageValue, setStageValue] = useState('');
	const [actionType, setActionType] = useState("");
	const [idFromURL, setIdFromURL] = useState(null);

	// Financial comparison data state
	const [financialComparisonData, setFinancialComparisonData] = useState(null);
	const [isLoadingFinancialData, setIsLoadingFinancialData] = useState(false);

	// Commercial comparison data state
	const [commercialComparisonData, setCommercialComparisonData] = useState(null);
	const [isLoadingCommercialData, setIsLoadingCommercialData] = useState(false);

	// Technical comparison data state
	const [technicalComparisonData, setTechnicalComparisonData] = useState(null);
	const [isLoadingTechnicalData, setIsLoadingTechnicalData] = useState(false);

	// General comparative report data state

	const [generalData, setGeneralData] = useState(null);
	const [isLoadingGeneralData, setIsLoadingGeneralData] = useState(false);
	useEffect(() => {

		const params = new URLSearchParams(searchParams);
		const actionType = params.get("ActionType");
		const ActivityId = params.get("ActivityId");
		const StageValue = params.get("Stage");
		setActionType(actionType);

		// if (actionType == "approval" ) {
		// 	tabReport()
		// }
		setActvityId(ActivityId ?? 0);
		setStageValue(StageValue ?? '');
		const newIdFromURL = pageSlug;
		setIdFromURL(newIdFromURL);
	}, [searchParams]);

	const [vendorItemAnalysis, setVendorItemAnalysis] = useState([]);
	const [vendorRanking, setVendorRanking] = useState([]);
	const [vendorCommercial, setVendorCommercial] = useState([]);
	const [version, setVersion] = useState(null);
	const [currentVersion, setCurrentVersion] = useState(0);
	const [linewiseItemLowest, setLineWiseItemLowest] = useState([]);
	const [supplierList, setSupplierList] = useState([]);
	const [QuestionResponses, setQuestionResponses] = useState([]);
	const [selectedVersion, setSelectedVersion] = useState(null);
	const RFQcomparativeReport = async () => {
		let VersionParam;
		let finalversionparam = false;
		if (version?.includes("x")) {
			VersionParam = version.split(".")[0];
			finalversionparam = true

		}
		else {
			VersionParam = version


		}
		var reqdata = {}
		if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
			reqdata = {
				rfqId: parseInt(pageSlug),
				Version: VersionParam,
				finalversion: finalversionparam,
				activityId: actions.activityId
			};
		}
		else {
			reqdata = {
				rfqId: parseInt(pageSlug),
				Version: VersionParam,
				finalversion: finalversionparam
			};
		}

		const queryParams = buildQueryParams(reqdata);
		const res = await apiClient.getres(
			`/api/RFQManage/RFQBenchmarking?${queryParams}`,
			atoken
		);
		if (res.status === 200) {

			let vendorItemAnalysisdata = res.data;
			if (!supplierid) {
				setVendorItemAnalysis(vendorItemAnalysisdata);
			}
			else {
				// when supplierid then filter his data only				
				const filteredsupplier = vendorItemAnalysisdata?.filter(x => x.id == supplierid)
				vendorItemAnalysisdata = filteredsupplier;

				setVendorItemAnalysis(vendorItemAnalysisdata);
				actions.filteredSupplier(filteredsupplier);
			}

			console.log("vendorItemAnalysisdata", vendorItemAnalysisdata)

			//in order to get linewise lowest  term 
			const data = vendorItemAnalysisdata?.filter(v => v?.submissionDate != null)[0]
			if (data) {

				const linewiselowest = JSON.parse(data?.vendorItemAnalysis);
				setLineWiseItemLowest(linewiselowest)
			}
			//in order to segregate supplierquestionresponses
			if (vendorItemAnalysisdata) {

				const vendorQuestionAns = vendorItemAnalysisdata?.map((v) => {

					let updatedvendorquestion;
					if (version != 0)
						updatedvendorquestion = JSON.parse(v?.vendorQuestionAns)?.filter(x => x.version == version)
					else {
						updatedvendorquestion = JSON.parse(v?.vendorQuestionAns)?.filter(x => x.version == currentVersion)
					}
					// Destructure only the fields you need
					return {
						...v,
						vendorQuestionAns: updatedvendorquestion,  // Only include the fields you need
					};
				});

				setQuestionResponses(vendorQuestionAns);
			}


			setIsLFUpdated(false);

		}
	};

	const GetEventSuppliers = async () => {
		const reqdata = {
			RFQId: parseInt(pageSlug),
			Version: version,

		};
		const queryParams = buildQueryParams(reqdata);
		const res = await apiClient.getres(
			`/api/RFQVendorInvite/Find?${queryParams}`,
			atoken
		);
		let vendorItemAnalysisdata;
		if (res.status === 200) {

			vendorItemAnalysisdata = res?.data?.result ?? [];
			setSupplierList(vendorItemAnalysisdata);
		}

	}
	useEffect(() => {
		if (actions.actionType == 'Forward') {
			GetEventSuppliers();
		}
	}, [actions.actionType])

	useEffect(() => {
		if (supplierList && supplierList?.length > 0 && actions.actionType == 'Forward') {
			const allNotClosed = supplierList.some(
				(supplier) => supplier.status == "Closed"
			);
			if (!allNotClosed) {
				toast.warning(`No Supplier has quoted so far. You can extend the end date of the RFQ and send reminder to them.`, {
					toastId: "no-supplier-quote",
					position: "top-center",
					autoClose: 3000,
				});
			}
		}
	}, [supplierList, actions.actionType])

	useEffect(() => {
		if (actions.rfqheaderversion) {
			setVersion(actions.rfqheaderversion.toString());
			setCurrentVersion(actions.rfqheaderversion);
		}


	}, [actions.rfqheaderversion, location])
	useEffect(() => {
		if (actions.nfaEventVersion) {
			setVersion(actions.nfaEventVersion.toString());
			setCurrentVersion(actions.nfaEventVersion);
		}
	}, [actions.nfaEventVersion])
	//useeffect
	useEffect(() => {
		if (version) getComparativedetailsVersionWise()
	}, [version, location]);






	const getComparativedetailsVersionWise = async () => {
		await pullRFQHeaderDetails();
		await RFQcomparativeReport();
	}
	const [isLFChanged, setIsLFUpdated] = useState(actions.isUpdated)

	useEffect(() => {
		setIsLFUpdated(actions.isUpdated)
	}, [actions.isUpdated])

	useEffect(() => {
		if (isLFChanged) {
			RFQcomparativeReport();
			fetchFinancialComparisonData(version);
		}
	}, [isLFChanged])



	const [rfqheaderdetails, setRFQHeaderDetails] = useState(null);
	const [totalItemSum, setTotalItemSum] = useState(0)
	const [versionhistory, setVersionhistory] = useState(actions.versionhistory)
	const [versionWiseData, setVersionWiseData] = useState(actions.RFQVersionHistory);


	useEffect(() => {
		if (versionhistory?.length) {
			const defaultVersion = versionhistory.find(v => v === "1.x") ?? versionhistory[0];
			if (defaultVersion) {
				setSelectedVersion(defaultVersion);
				handleVersionClick(defaultVersion); // optional: auto-load data
			}
		}
	}, [versionhistory]);
	const pullRFQHeaderDetails = async () => {

		let VersionParam;
		if (version?.includes("x")) {
			VersionParam = version.split(".")[0];


		}
		else {
			VersionParam = version

		}
		var data = {
			Id: pageSlug,
			Version: parseInt(version),

		};
		if (version == 0) {
			delete data?.Version;
		}

		const queryParams = buildQueryParams(data);
		const res = await apiClient.getres(
			`/api/RFQManage/FindById?${queryParams}`,
			atoken
		);

		if (res) {
			const result = Array.isArray(res?.data?.result) ? res.data.result : [];
			const header = result?.[0];
			setRFQHeaderDetails(result);

			if (!header) {
				setrfqItemsList([]);
				setTotalItemSum(0);
				setRfqItemCommercialList([]);
				setRFQQuestionList([]);
				setrfqOthersCommercialList([]);
				return;
			}

			if (header?.versionhistory?.length !== versionhistory?.length) {
				setVersionhistory(header.versionhistory);
			}

			const rfqParameters = Array.isArray(header?.rfqParameters) ? header.rfqParameters : [];
			setrfqItemsList(rfqParameters);
			const itemsumarr = sumArray(rfqParameters.map(x => x.targetPrice * x.quantity));
			setTotalItemSum(itemsumarr);

			setRfqItemCommercialList(
				(Array.isArray(header?.rfqItemCommercial) ? header.rfqItemCommercial : []).filter((x) => x.level === "item")
			);
			setRFQQuestionList(Array.isArray(header?.rfqQuestionMaster) ? header.rfqQuestionMaster : []);

			setrfqOthersCommercialList(
				Array.isArray(header?.rfqPackageCommercial) ? header.rfqPackageCommercial : []
			);
		}
	};
	//handle version change
	const handleVersionClick = (v) => {
		setVersion(v);
		setAnchorEl(null);
		// Refresh data for the currently active tab
		setTimeout(() => {
			switch (activeTab) {
				case 1: // Financial Comparison tab
					fetchFinancialComparisonData(v);
					break;
				case 2: // Commercial Comparison tab
					fetchCommercialComparisonData(v);
					break;
				case 3: // Technical Comparison tab
					fetchTechnicalComparisonData(v);
					break;
				default:
					// For Summary tab (case 0), no additional data fetching needed
					break;
			}
		}, 500); // Small delay to ensure version state is updated
	};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const [reInviteModal, setreInviteModal] = useState(false);
	//to handle reinvite or same reminder with same modal
	const [modalType, setModalType] = useState("");
	const handleModelType = (modeltype) => {
		switch (modeltype) {
			case "Reminder":
				return setModalType("Reminder")
			case "ReInvite":
				return setModalType("ReInvite")
			case "ExtendDate":
				return setModalType("ExtendDate")
			default:
				return ""
		}

	}


	const [searchQuery, setSearchQuery] = useState('');

	// Function to filter vendors based on name and email

	const [filteredVendors, setFilteredVendors] = useState([]);


	const [filteredReopenVendors, setFilteredReopenVendors] = useState([]);


	useEffect(() => {

		setFilteredVendors(vendorItemAnalysis?.map((x) => {
			return { ...x, reinviteremark: "", reinvitechecked: false, reInviteShow: true }
		}))
		setFilteredReopenVendors(vendorItemAnalysis?.map((x) => {
			return { ...x, reopenremark: "", reoepnchecked: false, reopenShow: true }
		}))
	}, [vendorItemAnalysis])
	useEffect(() => {

		const updatedVendors = filteredVendors?.map(v => {
			const matchesSearch =
				(v.tradeName && v.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(v.contactPerson && v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

			return {
				...v,
				reInviteShow: matchesSearch // Set isShow based on the search
			};
		});
		const updatedreopenVendors = filteredReopenVendors?.map(v => {
			const matchesSearch =
				(v.tradeName && v.tradeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(v.contactPerson && v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));

			return {
				...v,
				reopenShow: matchesSearch // Set isShow based on the search
			};
		});


		setFilteredVendors(updatedVendors);
		setFilteredReopenVendors(updatedreopenVendors);
	}, [searchQuery]);



	//handle surrogate and reopen quotes
	const [actionmodal, setActionModal] = useState({
		surrogateSupplierModal: false,
		reopenSupplierModal: false,
		extenddateSupplierModal: false,
		opensealedBid: false
	});



	const validationSchemaSurrogate = yup.object().shape({
		// surrogatename: yup
		// .string("Enter Surrogater Name")
		// .max(200, "Max 40 character")
		// .required("Surrogater Name is required"),
		surrogateemail: yup
			.string('Enter email')
			.required('Please enter your email')
			.email('Enter a valid email'),
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

			if (!values?.supplier) {
				toast.error(`Please Select Supplier`, {
					toastId: "surrogatetoasterror"
				})
				return
			}

			const payload = {
				"name": values?.surrogatename,
				"vendorId": values?.supplier?.vendorId,
				"email": values?.surrogateemail,
				"rfqId": pageSlug,
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
				setActionModal({ ...actionmodal, ["surrogateSupplierModal"]: false })
				toast.success(`suppliers surrogated successfully`, {
					toastId: "surrogatetoast"
				})
				formik_Surrogate.resetForm();

			}


		},
	});

	const [state, setState] = useState({
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
	};

	const handleApprovalActivity = (supplier, action) => {
		setState({ ...state, ["openInvoiceApproved"]: true });
		formik_ApproveReject.setFieldValue("vendorId", supplier?.id || supplier?.vendorId);
		if (action === 'Approve') formik_ApproveReject.setFieldValue("status", "Approved");
		if (action === 'Reject') formik_ApproveReject.setFieldValue("status", "Rejected");
	}



	const fastApiClient = new FastApiClient()

	// Helper function to check if suppliers have potentially submitted attachments
	// This can be customized based on your specific data structure
	const getSuppliersWithPotentialAttachments = () => {
		return vendorItemAnalysis?.filter(v => {
			// Basic checks
			if (!v?.submissionDate || !v?.tradeName || !v?.vendorId) {
				return false;
			}

			// More specific checks for submitted status
			// You can customize these conditions based on your data structure
			const hasSubmittedStatus = v?.status === "Submitted" || v?.status === "Complete";
			const hasValidSubmission = v?.submissionDate != null;

			// Return true only if supplier has actually completed submission
			return hasValidSubmission && (hasSubmittedStatus || v?.responseDate != null);
		}) || [];
	};

	const [tabshow, setTabShow] = useState(true)

	//sealed bid handling 
	const [progress, setProgress] = useState(false)

	// SupplierAttachment
	const [expandedSupplierAttachment, setExpandedSupplierAttachment] = useState(false);

	const handleSupplierAttachment = (panel) => (event, isExpanded) => {
		setExpandedSupplierAttachment(isExpanded ? panel : false); // Toggle the accordion
	};

	// useEffect(() => {
	// 	if(actions?.activityId && (actions?.currentStage == 'Open' || actions?.currentStage == 'Technical Approval'))
	// 	{
	// 		setExpandedTechnical(true);
	// 	} else {
	// 		setExpandedFinancial(true);
	// 	}
	// },[actions?.activityId,actions?.currentStage])

	useEffect(() => {
		if (actions.actionType == 'approval' || actions.actionType == 'Forward') {
			setExpandedSummary(true);
		}
	}, [actions.actionType])


	//to handle tabchange on the basis of access abheedev
	// useEffect(() => {
	// 	if (accessLevel?.find(x => x.claimType == "Item Commercial Responses")?.claimValue?.Read != "N") {
	// 		setValue(0)
	// 		return;
	// 	}
	// 	if (accessLevel?.find(x => x.claimType == "Package Commercial Responses")?.claimValue?.Read != "N") {
	// 		setValue(1)
	// 		return;
	// 	}

	// 	if (accessLevel?.find(x => x.claimType == "Question Responses")?.claimValue?.Read != "N") {
	// 		setValue(2)
	// 		return;
	// 	}

	// 	if (accessLevel?.find(x => x.claimType == "Approval Activity")?.claimValue?.Read != "N") {
	// 		setValue(3)
	// 		return;
	// 	}


	const [showcommercial, setShowCommercial] = useState(true);

	// }, [accessLevel])
	const supplierstatus = (x) => {

		if (x.status == "Open" && x.isTermsAccepted && x.packagePrice) {
			return "In Process"
		}
		else if (x.status == "Open" && x.isTermsAccepted && !x.packagePrice) {
			return "Intent to Participate"
		}
		else if (x.status != "Open") {
			return x.status
		}
		else {
			return "Not Started"
		}

	}

	const supplierdate = (x) => {

		if (x.status == "Open" && x.isTermsAccepted && x.packagePrice) {
			return formatDateViaLocale(x.acceptanceDate, userDetail)
		}
		else if (x.status == "Open" && x.isTermsAccepted && !x.packagePrice) {

			return formatDateViaLocale(x.acceptanceDate, userDetail)
		}
		else if (x.status != "Open") {
			return formatDateViaLocale(x.responseDate, userDetail)
		}
		else {
			return ""
		}

	}

	//to generate excel report for comparative report
	// API call to fetch financial comparison data
	const fetchFinancialComparisonData = async (v) => {
		setIsLoadingFinancialData(true);
		try {

			let VersionParam;
			let finalversionparam = false;
			if (v?.includes("x")) {
				VersionParam = v.split(".")[0];
				finalversionparam = true;
			} else {
				VersionParam = v;
			}

			var reqdata = {};
			if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
				reqdata = {
					rfqId: parseInt(pageSlug),
					Version: VersionParam,
					activityId: actions.activityId,
					finalversion: actions.isNFA ? true : finalversionparam
				};
			} else {
				reqdata = {
					rfqId: actions.rfqid,
					Version: VersionParam,
					finalversion: actions.isNFA ? true : finalversionparam
				};
			}

			const queryParams = buildQueryParams(reqdata);
			// Replace with your actual API endpoint for financial comparison data
			const res = await apiClient.getres(
				`/api/RFQManage/RFQFinancialData?${queryParams}`,
				atoken
			);

			if (res.status === 200) {
				// Transform the API response to match the expected tempData structure
				const transformedData = {
					suppliers: res.data.suppliers || [],
					items: res.data.items || [],
					packageCommercialTerms: res.data.packageCommercialTerms || [],
				};
				setFinancialComparisonData(transformedData);
				console.log("Financial comparison data fetched:", transformedData);
			} else {
				toast.error("Failed to fetch financial comparison data");
				// Fallback to mock data if API fails
				setFinancialComparisonData(tempData);
			}
		} catch (error) {
			console.error("Error fetching financial comparison data:", error);
			toast.error("Error fetching financial comparison data");
			// Fallback to mock data if API fails
			setFinancialComparisonData(tempData);
		} finally {
			setIsLoadingFinancialData(false);
		}
	};

	// API call to fetch commercial comparison data
	const fetchCommercialComparisonData = async (v) => {
		setIsLoadingCommercialData(true);
		try {
			let VersionParam;
			let finalversionparam = false;
			if (v?.includes("x")) {
				VersionParam = v.split(".")[0];
				finalversionparam = true;
			} else {
				VersionParam = v;
			}

			var reqdata = {};
			if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
				reqdata = {
					rfqId: parseInt(pageSlug),
					Version: VersionParam,
					activityId: actions.activityId,
					finalversion: actions.isNFA ? true : finalversionparam
				};
			} else {
				reqdata = {
					rfqId: actions.rfqid,
					Version: VersionParam,
					finalversion: actions.isNFA ? true : finalversionparam
				};
			}

			const queryParams = buildQueryParams(reqdata);
			// Replace with your actual API endpoint for commercial comparison data
			const res = await apiClient.getres(
				`/api/RFQManage/RFQCommercialData?${queryParams}`,
				atoken
			);

			if (res && res.status === 200 && res.data) {
				// Transform API response to match tempCommercialData structure if needed
				const transformedData = res.data;
				setCommercialComparisonData(transformedData);
			} else {
				// Fallback to mock data if API response is invalid
				setCommercialComparisonData(tempCommercialData);
			}
		} catch (error) {
			console.error("Error fetching commercial comparison data:", error);
			toast.error("Error fetching commercial comparison data");
			// Fallback to mock data if API fails
			setCommercialComparisonData(tempCommercialData);
		} finally {
			setIsLoadingCommercialData(false);
		}
	};

	// API call to fetch technical comparison data
	const fetchTechnicalComparisonData = async (v) => {
		setIsLoadingTechnicalData(true);
		try {

			let VersionParam;
			let finalversionparam = true;
			if (v?.includes("x")) {
				VersionParam = v.split(".")[0];
				finalversionparam = true;
			} else {
				VersionParam = v;
			}

			var reqdata = {};
			if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
				reqdata = {
					rfqId: parseInt(pageSlug),
					Version: VersionParam,
					finalversion: actions.isNFA ? true : finalversionparam,
					activityId: actions.activityId
				};
			} else {
				reqdata = {
					rfqId: actions.rfqid,
					Version: VersionParam,
					finalversion: actions.isNFA ? true : finalversionparam
				};
			}

			const queryParams = buildQueryParams(reqdata);
			// Replace with your actual API endpoint for technical comparison data
			const res = await apiClient.getres(
				`/api/RFQManage/RFQTechnicalData?${queryParams}`,
				atoken
			);

			if (res && res.status === 200 && res.data) {
				// Transform API response to match tempTechnicalData structure if needed
				const transformedData = res.data;
				setTechnicalComparisonData(transformedData);
			} else {
				// Fallback to mock data if API response is invalid
				setTechnicalComparisonData(tempTechnicalData);
			}
		} catch (error) {
			console.error("Error fetching technical comparison data:", error);
			toast.error("Error fetching technical comparison data");
			// Fallback to mock data if API fails
			setTechnicalComparisonData(tempTechnicalData);
		} finally {
			setIsLoadingTechnicalData(false);
		}
	};

	// API call to fetch general comparative report data
	const fetchGeneralData = async () => {
		setIsLoadingGeneralData(true);
		try {

			let VersionParam;
			let finalversionparam = false;
			if (version?.includes("x")) {
				VersionParam = version.split(".")[0];
				finalversionparam = true;
			} else {
				VersionParam = version;
			}

			var reqdata = {
				rfqId: actions.rfqid,
				Version: VersionParam,
				finalversion: actions.isNFA ? true : finalversionparam
			}

			const queryParams = buildQueryParams(reqdata);
			// Replace with your actual API endpoint for financial comparison data
			const res = await apiClient.getres(
				`/api/RFQManage/RFQSummaryData?${queryParams}`,
				atoken
			);

			if (res.status === 200) {
				// Transform the API response to match the expected tempData structure
				setGeneralData(res.data);
				console.log("General data fetched:", res.data);
			} else {
				toast.error("Failed to fetch general data");
				// Fallback to mock data if API fails
				setGeneralData(tempData);
			}
		} catch (error) {
			console.error("Error fetching general data:", error);
			toast.error("Error fetching general data");
			// Fallback to mock data if API fails
			setGeneralData(tempData);
		} finally {
			setIsLoadingGeneralData(false);
		}
	}

	//Excel Download function
	const generateComparativeReportExcel = useCallback(async () => {
		// Function to strip HTML tags
		const stripHtmlTags = (htmlString) => {
			if (!htmlString) return 'N/A';
			// Create a temporary div element to parse HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlString;
			// Get text content without HTML tags
			return tempDiv.textContent || tempDiv.innerText || 'N/A';
		};

		// Create a new Excel workbook
		const workbook = new ExcelJS.Workbook();

		// First sheet: General Details (simplified without colors)
		const worksheet = workbook.addWorksheet('General Details', {
			properties: { protected: true },
			pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
		});

		// Define simple styles without colors
		const headerStyle = {
			font: { bold: true, size: 12 },
			alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
			border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } },
		};
		const dataRowStyle = {
			alignment: { horizontal: 'left', vertical: 'top' },
			border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } },
		};
		const topHeaderStyle = {
			font: { bold: true, size: 18 },
			alignment: { horizontal: 'center', vertical: 'middle' },
		};
		const supplierdetails = vendorItemAnalysis.map((x) => {
			return {
				...x,
				vendorItemAnalysis: JSON.parse(x?.vendorItemAnalysis),
				vendorQuestionAns: JSON.parse(x?.vendorQuestionAns),
				vendorCommercial: JSON.parse(x?.vendorCommercial)
			}
		})

		// Add company name
		const companyName = 'procur[E]ngine';
		const companyRow = worksheet.addRow([companyName, '', '']);
		companyRow.eachCell((cell) => {
			cell.style = topHeaderStyle;
		});
		// Dynamically set width of column A based on company name
		const approxCharWidth = 2.5;
		const minWidth = 20;
		const companyColWidth = Math.max(minWidth, companyName?.length * approxCharWidth);
		worksheet.getColumn(1).width = companyColWidth;

		worksheet.addRow([
			`RFQ Comparative Report`,
			`Event Code: ${rfqheaderdetails[0]?.eventCode}`,
			`Printed on: ${formatDateViaLocale(new Date().toISOString(), userDetail)}`
		]).eachCell((cell) => {
			cell.style = {
				font: { italic: true, size: 12 },
				alignment: { horizontal: 'center', vertical: 'middle' },
			};
		});
		worksheet.addRow([]);

		// Purchase Org and Group
		const purchOrg = findStringByValueFromArray(
			actions.purchaseAllList,
			rfqheaderdetails[0]?.purchOrgId,
			'id',
			'orgName'
		);
		const purchGrp = findStringByValueFromArray(
			actions.purchaseGroupAllList,
			rfqheaderdetails[0]?.purchGrpId,
			'id',
			'groupName'
		);

		// General details header
		worksheet.addRow(['Subject', 'Start Date', 'End Date', 'Requisitioner', 'Purchase Org', 'Purchase Group'])
			.eachCell((cell) => cell.style = headerStyle);

		// General details data
		worksheet.addRow([
			rfqheaderdetails[0]?.subject ?? 'N/A',
			rfqheaderdetails[0]?.startDate ? formatDateViaLocale(rfqheaderdetails[0]?.startDate, userDetail) : 'N/A',
			rfqheaderdetails[0]?.endDate ? formatDateViaLocale(rfqheaderdetails[0]?.endDate, userDetail) : 'N/A',
			rfqheaderdetails[0]?.requisitioner ?? 'N/A',
			purchOrg ?? 'N/A',
			purchGrp ?? 'N/A',
		]).eachCell((cell) => cell.style = dataRowStyle);

		// Currency and version
		worksheet.addRow([]);
		worksheet.addRow(['Company Name', 'Created By', 'Base Currency', 'Multi-Currency', 'Stage', 'Current Version'])
			.eachCell((cell) => cell.style = headerStyle);
		worksheet.addRow([
			rfqheaderdetails[0]?.companyName ?? 'N/A',
			rfqheaderdetails[0]?.createdByName ?? '',
			rfqheaderdetails[0]?.baseCurrency ?? 'N/A',
			rfqheaderdetails[0]?.isMultiCurrency ? 'Yes' : 'No',
			rfqheaderdetails[0]?.stage ?? 'Draft',
			rfqheaderdetails[0]?.version ?? '1',
		]).eachCell((cell) => cell.style = dataRowStyle);

		worksheet.addRow([]);

		// Add Description header row
		worksheet.addRow(['Description', 'Terms & Condition']).eachCell((cell) => {
			cell.style = headerStyle;
		});

		const MAX_DISPLAY_LENGTH = 30;
		const fullDescription = stripHtmlTags(rfqheaderdetails[0]?.description) ?? 'N/A';
		const termandCondition = stripHtmlTags(rfqheaderdetails[0]?.termandCondition) ?? 'N/A';

		// Add the row with actual content
		const descRow = worksheet.addRow([fullDescription, termandCondition]);
		descRow.height = 30;

		descRow.eachCell((cell, colNumber) => {
			cell.style = dataRowStyle;
			cell.alignment = { wrapText: true, vertical: 'top' };

			// Set fixed width
			worksheet.getColumn(colNumber).width = MAX_DISPLAY_LENGTH;

			// Add note for Description (Column 1)
			if (colNumber === 1 && fullDescription?.length > MAX_DISPLAY_LENGTH) {
				cell.note = {
					texts: [
						{
							text: fullDescription,
							font: { size: 10, color: { argb: 'FF000000' } },
						},
					],
				};
			}

			// Add note for Terms & Condition (Column 2)
			if (colNumber === 2 && termandCondition?.length > MAX_DISPLAY_LENGTH) {
				cell.note = {
					texts: [
						{
							text: termandCondition,
							font: { size: 10, color: { argb: 'FF000000' } },
						},
					],
				};
			}
		});

		worksheet.columns.forEach((column, index) => {
			let maxLength = 10;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellLength = cell.value ? cell.value.toString()?.length : 0;
				maxLength = Math.max(maxLength, cellLength);
			});
			column.width = 28;
		});

		// Create placeholder sheets for Financial, Commercial, and Technical Details
		const financialSheet = workbook.addWorksheet('Financial Details');

		// Get unique supplier names
		const suppliers = supplierdetails?.map((v) => v.tradeName);
		const uniqueSuppliers = Array.from(new Set(suppliers));

		// Add header row with static fields and dynamic supplier columns
		const headerRow = ['SrNo', 'ItemCode', 'Short Name', 'ItemDescription', 'Quantity', 'UOM', 'Delivery Location', 'Target/Budget Price', 'Lowest Item Price', 'Savings (wrt Target Price)', 'Savings (wrt LPP)'];

		// Add supplier columns (2 columns per supplier: Unit Price, Amount)
		uniqueSuppliers.forEach(supplier => {
			headerRow.push(`${supplier}`);
			headerRow.push(''); // For Amount column
		});

		// Add Last PO Details main header
		headerRow.push('Last PO Details', '', '', '', '');

		const titleRow = financialSheet.addRow(headerRow);

		// Add second header row with supplier sub-headers and submission time
		const subHeaderRow = ['', '', '', '', '', '', '', '', '', '', '']; // Empty cells for static fields
		uniqueSuppliers.forEach(supplier => {
			// Find supplier details for submission time
			const supplierData = supplierdetails.find(s => s.tradeName === supplier);
			const submissionTime = supplierData?.submissionDate ?
				`Submission Time: ${formatDateViaLocale(supplierData.submissionDate, userDetail)}` :
				'Submission Time: N/A';

			subHeaderRow.push(submissionTime);
			subHeaderRow.push(''); // For Amount column
		});

		// Add empty cells for Last PO Details section in second row
		subHeaderRow.push('', '', '', '', '');

		const submissionTimeRow = financialSheet.addRow(subHeaderRow);

		// Add third header row with column names
		const colHeaderRow = ['', '', '', '', '', '', '', '', '', '', '']; // Empty cells for static fields
		uniqueSuppliers.forEach(supplier => {
			colHeaderRow.push('Unit Price');
			colHeaderRow.push('Amount');
		});

		// Add Last PO Details sub-headers
		colHeaderRow.push('Po No', 'PO Date', 'Supplier Name', 'Unit Rate', 'PO Value');

		const colTitleRow = financialSheet.addRow(colHeaderRow);

		// Merge supplier name cells (span across 2 columns for each supplier)
		uniqueSuppliers.forEach((supplier, index) => {
			const mergeStartCol = 10 + (index * 2); // Starting after the 9 static columns (columns A-I, including Delivery Location)
			const mergeEndCol = mergeStartCol + 1; // Span 2 columns

			// Merge supplier name in first row
			financialSheet.mergeCells(1, mergeStartCol, 1, mergeEndCol);

			// Merge submission time in second row
			financialSheet.mergeCells(2, mergeStartCol, 2, mergeEndCol);
		});

		// Merge "Last PO Details" header cell (span across 5 columns: Po No, PO Date, Supplier Name, Unit Rate, PO Value)
		const lastPoStartCol = 10 + (uniqueSuppliers?.length * 2); // After all supplier columns
		const lastPoEndCol = lastPoStartCol + 4; // Span 5 columns
		financialSheet.mergeCells(1, lastPoStartCol, 1, lastPoEndCol); // Merge "Last PO Details" in first row

		// Style all header rows
		titleRow.eachCell((cell) => {
			cell.style = headerStyle;
		});
		submissionTimeRow.eachCell((cell) => {
			cell.style = dataRowStyle;
		});
		colTitleRow.eachCell((cell) => {
			cell.style = headerStyle;
		});

		// Add item rows with commercial terms
		rfqItemsList?.forEach((item, i) => {
			const ItemLowest = linewiseItemLowest?.find(lowest => lowest.id === item.id);
			const savingsWrtTarget = (parseFloat(item?.targetPrice ?? 0) - parseFloat(ItemLowest?.ItemLowestQuotes ?? 0)).toFixed(2);
			const row = [
				i + 1, // SrNo
				item?.itemCode || 'N/A', // ItemCode
				item?.itemName || 'N/A', // Short Name
				item?.itemDesc || 'N/A', // ItemDescription
				parseFloat(item?.quantity) || 0, // Quantity as number
				item?.uom || 'N/A', // UOM
				item?.plant || 'N/A', // Delivery Location
				parseFloat(item?.targetPrice ?? item?.budgetPrice ?? 0), // Target/Budget Price as number
				parseFloat(ItemLowest?.ItemLowestQuotes ?? 0), // Lowest Item Price as number
				savingsWrtTarget, // Savings (wrt Target Price) as number
			];

			// Collect supplier prices to find the minimum for bold formatting
			const supplierPrices = [];
			const supplierData = [];

			uniqueSuppliers.forEach(supplierName => {
				const supplier = supplierdetails.find(s => s.tradeName === supplierName);
				if (supplier) {
					const supplierItem = supplier?.vendorItemAnalysis?.find(vendorItem => vendorItem.id === item.id);
					const unitPrice = parseFloat(supplierItem?.SupplierPrice ?? 0);
					const quantity = parseFloat(supplierItem?.Quantity ?? item?.quantity ?? 0);
					const amount = !isNaN(unitPrice) && !isNaN(quantity)
						? unitPrice * quantity
						: 0;

					supplierPrices.push(unitPrice > 0 ? unitPrice : Infinity); // Use Infinity for 0 prices to exclude from min
					supplierData.push({ unitPrice, amount });
				} else {
					supplierPrices.push(Infinity);
					supplierData.push({ unitPrice: 'N/A', amount: 'N/A' });
				}
			});

			// Find minimum price (excluding 0 and N/A values)
			const validPrices = supplierPrices.filter(price => price !== Infinity && price > 0);
			const minPrice = validPrices?.length > 0 ? Math.min(...validPrices) : null;

			// Add supplier data to row
			supplierData.forEach(data => {
				row.push(data.unitPrice === 'N/A' ? 'N/A' : data.unitPrice); // Store as number
				row.push(data.amount === 'N/A' ? 'N/A' : data.amount); // Store as number
			});

			// Add Last PO Details for this item
			row.push(item?.poNumber || 'N/A'); // Po No
			row.push(item?.poDate ? formatDateViaLocale(item.poDate, userDetail) : 'N/A'); // PO Date
			row.push(item?.poVendorName || 'N/A'); // Vendor Name
			row.push(item?.poUnitRate ? parseFloat(item.poUnitRate) : 'N/A'); // Unit Rate as number
			row.push(item?.poValue ? parseFloat(item.poValue) : 'N/A'); // PO Value as number

			const itemRow = financialSheet.addRow(row);

			// Apply styling with bold formatting for minimum price
			itemRow.eachCell((cell, colNumber) => {
				cell.style = dataRowStyle;

				// Bold formatting for minimum unit price columns
				const staticColumns = 9; // A to I (including Delivery Location)
				const supplierStartCol = staticColumns + 1; // Column J

				// Check if this is a unit price column (odd columns in supplier section)
				if (colNumber >= supplierStartCol && colNumber < supplierStartCol + (uniqueSuppliers?.length * 2)) {
					const supplierIndex = Math.floor((colNumber - supplierStartCol) / 2);
					const isUnitPriceCol = (colNumber - supplierStartCol) % 2 === 0;

					if (isUnitPriceCol && minPrice !== null && supplierData[supplierIndex].unitPrice === minPrice) {
						cell.style = {
							...dataRowStyle,
							font: { ...dataRowStyle.font, bold: true }
						};
					}
				}
			});

			// Get commercial terms for this item from rfqItemCommercialList
			const itemCommercialTerms = rfqItemCommercialList || [];

			// Get the commercial terms that exist across suppliers for this specific item
			const allCommercialTerms = new Set();
			uniqueSuppliers.forEach(supplierName => {
				const supplier = supplierdetails.find(s => s.tradeName === supplierName);
				if (supplier) {

					const supplierItem = supplier?.vendorItemAnalysis?.find(vendorItem => vendorItem.id === item.id);
					if (supplierItem?.CommercialItem && Array.isArray(supplierItem.CommercialItem)) {
						supplierItem.CommercialItem.forEach(commercialItem => {
							if (commercialItem.Name && commercialItem.IsNetPrice == 'N') {
								allCommercialTerms.add(commercialItem.Name);
							}
						});
					}
					// // Also check vendor commercial data if available
					// if (supplier.vendorCommercial && Array.isArray(supplier.vendorCommercial)) {
					// 	supplier.vendorCommercial.forEach(commercialItem => {
					// 		if (commercialItem.Name || commercialItem.name) {
					// 			allCommercialTerms.add(commercialItem.Name || commercialItem.name);
					// 		}
					// 	});
					// }
				}
			});

			// Add commercial term rows for this item
			Array.from(allCommercialTerms).forEach(termName => {
				const commercialRow = [
					'', // Empty SrNo
					'', // Empty ItemCode
					termName, // Commercial term name in Short Name column
					'', // Empty ItemDescription
					'', // Empty Quantity
					'', // Empty UOM
					'', // Empty Delivery Location
					'', // Empty Target/Budget Price
					'' // Empty Lowest Item Price
				];

				// Add supplier commercial data for this term
				uniqueSuppliers.forEach(supplierName => {
					const supplier = supplierdetails.find(s => s.tradeName === supplierName);
					if (supplier) {
						let commercialValue = '';
						// First check in supplier item commercial data
						const supplierItem = supplier?.vendorItemAnalysis?.find(vendorItem => vendorItem.id === item.id);
						if (supplierItem?.CommercialItem && Array.isArray(supplierItem.CommercialItem)) {
							const commercialItem = supplierItem.CommercialItem.find(comm => comm.Name === termName);
							commercialValue = commercialItem?.EnterCommValue || '';
						}

						// Store as number if it's a valid number, otherwise as string
						const numericValue = parseFloat(commercialValue);
						commercialRow.push(!isNaN(numericValue) && commercialValue !== '' ? numericValue : commercialValue); // Commercial value as number
						commercialRow.push(''); // Empty Amount column for commercial terms
					} else {
						commercialRow.push('', ''); // Empty for both columns if supplier not found
					}
				});

				// Add empty Last PO Details columns for commercial terms
				commercialRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

				const commercialRowElement = financialSheet.addRow(commercialRow);
				commercialRowElement.eachCell((cell) => {
					cell.style = {
						...dataRowStyle,
						font: { italic: true, size: 11 }, // Make commercial terms slightly different visually
						fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } } // Light gray background
					};
				});
			});
		});

		// Add package-level commercial terms from rfqOthersCommercialList
		const packageCommercialTerms = rfqOthersCommercialList?.filter(term =>
			(term.valuetype == "Currency" || term.valuetype == "Percentage") &&
			(term.name != term.grandTotalTermName)
		) || [];

		packageCommercialTerms.forEach(term => {
			const packageCommercialRow = [
				'', // Empty SrNo
				'', // Empty ItemCode
				term.name, // Commercial term name in Short Name column
				'', // Empty ItemDescription
				'', // Empty Quantity
				'', // Empty UOM
				'', // Empty Delivery Location
				'', // Empty Target/Budget Price
				'' // Empty Lowest Item Price
			];

			// Add supplier commercial data for this package-level term
			uniqueSuppliers.forEach(supplierName => {
				const supplier = supplierdetails.find(s => s.tradeName === supplierName);
				let commercialValue = '';

				if (supplier && supplier.vendorCommercial && Array.isArray(supplier.vendorCommercial)) {
					const vendorCommercialItem = supplier.vendorCommercial.find(comm =>
						(comm.TermsId === term.termsId) || (comm.TermsName === term.name) || (comm.Name === term.name)
					);
					commercialValue = vendorCommercialItem?.EnterCommValue || 0;
				}

				// Store as number if it's a valid number
				const numericValue = parseFloat(commercialValue);
				packageCommercialRow.push(!isNaN(numericValue) && commercialValue !== '' && commercialValue !== 0 ? numericValue : (commercialValue || 0)); // Commercial value as number
				packageCommercialRow.push(''); // Empty Amount column for commercial terms
			});

			// Add empty Last PO Details columns for package-level commercial terms
			packageCommercialRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

			const packageCommercialRowElement = financialSheet.addRow(packageCommercialRow);
			packageCommercialRowElement.eachCell((cell) => {
				cell.style = {
					...dataRowStyle,
					font: { italic: true, size: 11 }, // Make package commercial terms slightly different visually
					fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } } // Light blue background to distinguish from item-level terms
				};
			});
		});

		// Add Total row - Calculate target price total
		let targetPriceTotal = 0;
		rfqItemsList?.forEach((item) => {
			const targetPrice = item?.targetPrice ?? item?.budgetPrice ?? 0;
			if (!isNaN(targetPrice)) {
				targetPriceTotal += parseFloat(targetPrice);
			}
		});

		const totalRow = ['Total'];
		// Fill empty cells for static columns (2-7) - up to Delivery Location column
		for (let i = 2; i <= 7; i++) {
			totalRow.push('');
		}
		// Add target price total in column H (Target/Budget Price column) as number
		totalRow.push(targetPriceTotal);
		// Empty cell for column I (Lowest Item Price column)
		totalRow.push('');

		// Add totals for each supplier
		uniqueSuppliers.forEach(supplierName => {
			const supplier = supplierdetails.find(s => s.tradeName === supplierName);
			if (supplier) {
				// const vendorAmount = supplier?.vendorAmount || 0;
				// totalRow.push(''); // Empty for Unit Price column
				// totalRow.push(vendorAmount); // Total Amount as number
				const packagePrice = parseFloat(supplier?.packagePrice) || 0;
				totalRow.push(''); // Empty for Unit Price column
				totalRow.push(packagePrice); // Package price as number
			} else {
				totalRow.push('', '');
			}
		});

		// Add empty Last PO Details columns for totals row
		totalRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

		const totalRowElement = financialSheet.addRow(totalRow);
		// Merge cells for "Total" label across columns A-F (up to UOM only)
		financialSheet.mergeCells(totalRowElement.number, 1, totalRowElement.number, 6);
		totalRowElement.eachCell((cell) => {
			cell.style = headerStyle;
		});

		// Add Loading Factor row
		const loadingFactorRow = ['Loading Factor'];
		// Fill empty cells for static columns (2-9)
		for (let i = 2; i <= 9; i++) {
			loadingFactorRow.push('');
		}
		uniqueSuppliers.forEach(supplierName => {
			const supplier = supplierdetails.find(s => s.tradeName === supplierName);
			if (supplier) {
				const loadingAmount = parseFloat(supplier?.loadingAmount) || 0;
				loadingFactorRow.push(''); // Empty for Unit Price column
				loadingFactorRow.push(loadingAmount); // Loading Factor Amount as number
			} else {
				loadingFactorRow.push('', '');
			}
		});

		const loadingFactorRowElement = financialSheet.addRow(loadingFactorRow);
		// Merge cells for "Loading Factor" label across columns A-H
		financialSheet.mergeCells(loadingFactorRowElement.number, 1, loadingFactorRowElement.number, 8);
		loadingFactorRowElement.eachCell((cell) => {
			cell.style = dataRowStyle;
		});

		// // Add Loaded Price row
		// const loadedPriceRow = ['Loaded Price'];
		// // Fill empty cells for static columns (2-8)
		// for(let i = 2; i <= 8; i++) {
		// 	loadedPriceRow.push('');
		// }
		// uniqueSuppliers.forEach(supplierName => {
		// 	const supplier = supplierdetails.find(s => s.tradeName === supplierName);
		// 	if (supplier) {
		// 		const packagePrice = supplier?.packagePrice || 0;
		// 		loadedPriceRow.push(''); // Empty for Unit Price column
		// 		loadedPriceRow.push(thousands_separators(packagePrice)); // Loaded Price
		// 	} else {
		// 		loadedPriceRow.push('', '');
		// 	}
		// });

		// const loadedPriceRowElement = financialSheet.addRow(loadedPriceRow);
		// // Merge cells for "Loaded Price" label across columns A-H
		// financialSheet.mergeCells(loadedPriceRowElement.number, 1, loadedPriceRowElement.number, 8);
		// loadedPriceRowElement.eachCell((cell) => {
		// 	cell.style = dataRowStyle;
		// });

		// Add Amount (Incl. GST/VAT) row
		const amountInclRow = ['Amount'];
		// Fill empty cells for static columns (2-9)
		for (let i = 2; i <= 9; i++) {
			amountInclRow.push('');
		}
		uniqueSuppliers.forEach(supplierName => {
			const supplier = supplierdetails.find(s => s.tradeName === supplierName);
			if (supplier) {
				const vendorAmount = parseFloat(supplier?.vendorAmount) || 0;
				amountInclRow.push(''); // Empty for Unit Price column
				amountInclRow.push(vendorAmount); // Amount Incl as number
			} else {
				amountInclRow.push('', '');
			}
		});

		const amountInclRowElement = financialSheet.addRow(amountInclRow);
		// Merge cells for "Amount (Incl. GST/VAT)" label across columns A-H
		financialSheet.mergeCells(amountInclRowElement.number, 1, amountInclRowElement.number, 8);
		amountInclRowElement.eachCell((cell) => {
			cell.style = dataRowStyle;
		});

		// Add Commercial Rank row (footer only) - Show ranking in Amount column
		const commercialRankRow = ['Commercial Rank'];
		// Fill empty cells for static columns (2-9)
		for (let i = 2; i <= 9; i++) {
			commercialRankRow.push('');
		}
		uniqueSuppliers.forEach(supplierName => {
			const supplier = supplierdetails.find(s => s.tradeName === supplierName);
			if (supplier) {
				const ranking = supplier?.vendorRanking || 'N/A';
				commercialRankRow.push(''); // Empty for Unit Price column
				commercialRankRow.push(`L${ranking}`); // Commercial Ranking in Amount column
			} else {
				commercialRankRow.push('', '');
			}
		});

		const commercialRankRowElement = financialSheet.addRow(commercialRankRow);
		// Merge cells for "Commercial Rank" label across columns A-H
		financialSheet.mergeCells(commercialRankRowElement.number, 1, commercialRankRowElement.number, 8);
		commercialRankRowElement.eachCell((cell) => {
			cell.style = dataRowStyle;
		});

		// Auto-adjust column widths
		financialSheet.columns.forEach((column, index) => {
			let maxLength = 10;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellLength = cell.value ? cell.value.toString()?.length : 0;
				maxLength = Math.max(maxLength, cellLength);
			});
			if (index < 8) {
				if (index === 3) { // ItemDescription column
					column.width = 30;
				} else {
					column.width = Math.max(15, maxLength + 2);
				}
			} else {
				column.width = 18; // Fixed width for supplier columns
			}
		});

		const commercialSheet = workbook.addWorksheet('Commercial Details');

		// Get unique suppliers for commercial sheet
		const commercialSuppliers = supplierdetails?.map((v) => v.tradeName);
		const uniqueCommercialSuppliers = Array.from(new Set(commercialSuppliers));

		// Create header row for commercial sheet
		const commercialHeaderRow = ['SrNo', 'Commercial Term'];
		// Add supplier columns
		uniqueCommercialSuppliers.forEach(supplier => {
			commercialHeaderRow.push(`${supplier}`);
		});

		const commercialTitleRow = commercialSheet.addRow(commercialHeaderRow);
		commercialTitleRow.eachCell((cell) => {
			cell.style = headerStyle;
		});

		// Add supplier submission time row
		const commercialSubHeaderRow = ['', ''];
		uniqueCommercialSuppliers.forEach(supplier => {
			const supplierData = supplierdetails.find(s => s.tradeName === supplier);
			const submissionTime = supplierData?.submissionDate ?
				`Submission Time: ${formatDateViaLocale(supplierData.submissionDate, userDetail)}` :
				'Submission Time: N/A';
			commercialSubHeaderRow.push(submissionTime);
		});

		const commercialSubmissionTimeRow = commercialSheet.addRow(commercialSubHeaderRow);
		commercialSubmissionTimeRow.eachCell((cell) => {
			cell.style = dataRowStyle;
		});

		// Collect all unique commercial terms from all suppliers
		const allCommercialTerms = new Set();
		uniqueCommercialSuppliers.forEach(supplierName => {
			const supplier = supplierdetails.find(s => s.tradeName === supplierName);

			if (supplier && supplier.vendorCommercial && Array.isArray(supplier.vendorCommercial)) {
				supplier.vendorCommercial.forEach(commercial => {
					if (commercial.Name && commercial.Valuetype != 'Currency' && commercial.Valuetype != 'Percentage') {
						allCommercialTerms.add(commercial.TermsName || commercial.Name || commercial.name);
					}
				});
			}
		});

		// Add commercial term rows
		let commercialRowIndex = 1;
		Array.from(allCommercialTerms).forEach(termName => {
			const commercialRow = [
				commercialRowIndex++, // SrNo
				termName // Commercial Term
			];

			// Add supplier remarks for this commercial term
			uniqueCommercialSuppliers.forEach(supplierName => {
				const supplier = supplierdetails.find(s => s.tradeName === supplierName);
				let remarks = '';

				if (supplier && supplier.vendorCommercial && Array.isArray(supplier.vendorCommercial)) {
					const commercialTerm = supplier.vendorCommercial.find(comm =>
						(comm.TermsName === termName) || (comm.Name === termName) || (comm.name === termName)
					);
					remarks = commercialTerm?.Remarks || commercialTerm?.remarks || commercialTerm?.Response || '';
				}

				commercialRow.push(remarks || 'N/A');
			});

			const commercialRowElement = commercialSheet.addRow(commercialRow);
			commercialRowElement.eachCell((cell) => {
				cell.style = dataRowStyle;
			});
		});

		// Auto-adjust column widths for commercial sheet
		commercialSheet.columns.forEach((column, index) => {
			let maxLength = 10;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellLength = cell.value ? cell.value.toString()?.length : 0;
				maxLength = Math.max(maxLength, cellLength);
			});
			if (index === 0) {
				column.width = 10; // SrNo column
			} else if (index === 1) {
				column.width = Math.max(20, maxLength + 2); // Commercial Term column
			} else {
				column.width = Math.max(25, maxLength + 2); // Supplier columns
			}
		});

		const technicalSheet = workbook.addWorksheet('Technical Details');

		// Get unique suppliers for technical sheet
		const technicalSuppliers = supplierdetails?.map((v) => v.tradeName);
		const uniqueTechnicalSuppliers = Array.from(new Set(technicalSuppliers));

		// Create header row for technical sheet
		const technicalHeaderRow = ['SrNo', 'Questions', 'Requirement'];
		// Add supplier columns (2 columns per supplier: Answer and Score)
		uniqueTechnicalSuppliers.forEach(supplier => {
			technicalHeaderRow.push(`${supplier}`);
			technicalHeaderRow.push(''); // For Score column
		});

		const technicalTitleRow = technicalSheet.addRow(technicalHeaderRow);

		// Add submission time row
		const technicalSubHeaderRow = ['', '', ''];
		uniqueTechnicalSuppliers.forEach(supplier => {
			const supplierData = supplierdetails.find(s => s.tradeName === supplier);
			const submissionTime = supplierData?.submissionDate ?
				`Submission Time: ${formatDateViaLocale(supplierData.submissionDate, userDetail)}` :
				'Submission Time: N/A';
			technicalSubHeaderRow.push(submissionTime);
			technicalSubHeaderRow.push(''); // For Score column
		});

		const technicalSubmissionTimeRow = technicalSheet.addRow(technicalSubHeaderRow);

		// Add column labels row (Answer, Score)
		const technicalColHeaderRow = ['', '', ''];
		uniqueTechnicalSuppliers.forEach(supplier => {
			technicalColHeaderRow.push('Answer');
			technicalColHeaderRow.push('Score');
		});

		const technicalColTitleRow = technicalSheet.addRow(technicalColHeaderRow);

		// Merge supplier name cells (span across 2 columns for each supplier)
		uniqueTechnicalSuppliers.forEach((supplier, index) => {
			const mergeStartCol = 4 + (index * 2); // Starting after SrNo, Questions, and Requirement columns
			const mergeEndCol = mergeStartCol + 1; // Span 2 columns

			// Merge supplier name in first row
			technicalSheet.mergeCells(1, mergeStartCol, 1, mergeEndCol);

			// Merge submission time in second row
			technicalSheet.mergeCells(2, mergeStartCol, 2, mergeEndCol);
		});

		// Style header rows
		technicalTitleRow.eachCell((cell) => {
			cell.style = headerStyle;
		});
		technicalSubmissionTimeRow.eachCell((cell) => {
			cell.style = dataRowStyle;
		});
		technicalColTitleRow.eachCell((cell) => {
			cell.style = headerStyle;
		});

		// Collect all unique technical questions from all suppliers
		const allTechnicalQuestions = new Set();
		uniqueTechnicalSuppliers.forEach(supplierName => {
			const supplier = supplierdetails.find(s => s.tradeName === supplierName);
			if (supplier && supplier.vendorQuestionAns && Array.isArray(supplier.vendorQuestionAns)) {
				supplier.vendorQuestionAns.forEach(question => {
					if (question.questionDescription) {
						allTechnicalQuestions.add(question.questionDescription);
					}
				});
			}
		});

		// Add technical question rows
		let technicalRowIndex = 1;
		let totalScores = {}; // To calculate total scores per supplier

		// Initialize total scores
		uniqueTechnicalSuppliers.forEach(supplier => {
			totalScores[supplier] = 0;
		});

		Array.from(allTechnicalQuestions).forEach(questionText => {
			// Find requirement for this question from any supplier
			let questionRequirement = '';
			uniqueTechnicalSuppliers.forEach(supplierName => {
				const supplier = supplierdetails.find(s => s.tradeName === supplierName);
				if (supplier && supplier.vendorQuestionAns && Array.isArray(supplier.vendorQuestionAns)) {
					const questionAns = supplier.vendorQuestionAns.find(qa =>
						(qa.questionDescription === questionText)
					);
					if (questionAns?.questionRequirement && !questionRequirement) {
						questionRequirement = questionAns.questionRequirement;
					}
				}
			});

			const technicalRow = [
				technicalRowIndex++, // SrNo
				questionText, // Technical Question
				questionRequirement || '' // Requirement
			];

			// Add supplier answers and scores for this question
			uniqueTechnicalSuppliers.forEach(supplierName => {
				const supplier = supplierdetails.find(s => s.tradeName === supplierName);
				let answer = '';
				let score = '';

				if (supplier && supplier.vendorQuestionAns && Array.isArray(supplier.vendorQuestionAns)) {

					const questionAns = supplier.vendorQuestionAns.find(qa =>
						(qa.questionDescription === questionText)
					);
					if (questionAns?.vendorQuestOptions && questionAns?.vendorQuestOptions?.length > 0) {
						answer = questionAns?.vendorQuestOptions[0].questionoption || '';
						score = questionAns?.vendorQuestOptions[0].weightage || 0;
					}
					else {
						answer = questionAns?.answer || '';
						score = questionAns?.score || 0;
					}


					// Add to total score if it's a valid number
					if (score && !isNaN(score)) {
						totalScores[supplierName] += parseFloat(score);
					}
				}

				technicalRow.push(answer || 'N/A');
				technicalRow.push(score || 0);
			});

			const technicalRowElement = technicalSheet.addRow(technicalRow);
			technicalRowElement.eachCell((cell, colNumber) => {
				if (colNumber === 2) { // Technical Questions column (Column B)
					cell.style = {
						...dataRowStyle,
						alignment: { ...dataRowStyle.alignment, wrapText: true }
					};
				} else {
					cell.style = dataRowStyle;
				}
			});
		});

		// Add Total row
		const technicalTotalRow = ['', 'Total', ''];
		uniqueTechnicalSuppliers.forEach(supplierName => {
			technicalTotalRow.push(''); // Empty Answer column for total
			technicalTotalRow.push(totalScores[supplierName] || 0); // Total Score
		});

		const technicalTotalRowElement = technicalSheet.addRow(technicalTotalRow);
		technicalTotalRowElement.eachCell((cell) => {
			cell.style = headerStyle;
		});

		// Auto-adjust column widths for technical sheet
		technicalSheet.columns.forEach((column, index) => {
			let maxLength = 10;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellLength = cell.value ? cell.value.toString()?.length : 0;
				maxLength = Math.max(maxLength, cellLength);
			});
			if (index === 0) {
				column.width = 10; // SrNo column
			} else if (index === 1) {
				column.width = Math.max(30, maxLength + 2); // Technical Questions column
			} else if (index === 2) {
				column.width = Math.max(20, maxLength + 2); // Requirement column
			} else {
				column.width = Math.max(15, maxLength + 2); // Answer/Score columns
			}
		});

		// Write and download
		const buffer = await workbook.xlsx.writeBuffer();
		const file = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		saveAs(file, 'rfq-comparative-excel.xlsx');
	}, [rfqheaderdetails, userDetail, actions, vendorItemAnalysis, rfqItemCommercialList, rfqOthersCommercialList]);

	// New downloadExcel function with data fetching
	const downloadExcel = useCallback(async () => {
		// Function to strip HTML tags
		const stripHtmlTags = (htmlString) => {
			if (!htmlString) return 'N/A';
			// Create a temporary div element to parse HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlString;
			// Get text content without HTML tags
			return tempDiv.textContent || tempDiv.innerText || 'N/A';
		};

		// Ensure all comparison data is loaded before generating Excel
		let currentFinancialData = financialComparisonData;
		let currentCommercialData = commercialComparisonData;
		let currentTechnicalData = technicalComparisonData;

		// Fetch financial data if not already loaded
		if (!currentFinancialData) {
			try {
				await fetchFinancialComparisonData();
				// Note: We need to get the updated data from state after the fetch
				// Since useState is asynchronous, we'll fetch it directly in the function
				let VersionParam;
				let finalversionparam = false;
				if (version?.includes("x")) {
					VersionParam = version.split(".")[0];
					finalversionparam = true;
				} else {
					VersionParam = version;
				}

				var reqdata = {};
				if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
					reqdata = {
						rfqId: parseInt(pageSlug),
						Version: VersionParam,
						activityId: actions.activityId
					};
				} else {
					reqdata = {
						rfqId: parseInt(pageSlug),
						Version: VersionParam,
					};
				}

				const queryParams = buildQueryParams(reqdata);
				const res = await apiClient.getres(
					`/api/RFQManage/RFQFinancialData?${queryParams}`,
					atoken
				);

				if (res.status === 200) {
					const transformedData = {
						suppliers: res.data.suppliers || [],
						items: res.data.items || []
					};
					currentFinancialData = transformedData;
				}
			} catch (error) {
				console.error("Error fetching financial data for Excel:", error);
				// Use fallback data if available
				currentFinancialData = tempData;
			}
		}

		// Fetch commercial data if not already loaded
		if (!currentCommercialData) {
			try {
				let VersionParam;
				let finalversionparam = false;
				if (version?.includes("x")) {
					VersionParam = version.split(".")[0];
					finalversionparam = true;
				} else {
					VersionParam = version;
				}

				var reqdata = {};
				if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
					reqdata = {
						rfqId: parseInt(pageSlug),
						Version: VersionParam,
						activityId: actions.activityId
					};
				} else {
					reqdata = {
						rfqId: parseInt(pageSlug),
						Version: VersionParam,
					};
				}

				const queryParams = buildQueryParams(reqdata);
				const res = await apiClient.getres(
					`/api/RFQManage/RFQCommercialData?${queryParams}`,
					atoken
				);

				if (res && res.status === 200 && res.data) {
					currentCommercialData = res.data;
				}
			} catch (error) {
				console.error("Error fetching commercial data for Excel:", error);
				// Use fallback data if available
				currentCommercialData = tempCommercialData;
			}
		}

		// Fetch technical data if not already loaded
		if (!currentTechnicalData) {
			try {
				let VersionParam;
				let finalversionparam = false;
				if (version?.includes("x")) {
					VersionParam = version.split(".")[0];
					finalversionparam = true;
				} else {
					VersionParam = version;
				}

				var reqdata = {};
				if (actions.actionType == 'approval' && actions.activityId && actions.currentStage != 'Commercial Approval') {
					reqdata = {
						rfqId: parseInt(pageSlug),
						Version: VersionParam,
						activityId: actions.activityId
					};
				} else {
					reqdata = {
						rfqId: parseInt(pageSlug),
						Version: VersionParam,
					};
				}

				const queryParams = buildQueryParams(reqdata);
				const res = await apiClient.getres(
					`/api/RFQManage/RFQTechnicalData?${queryParams}`,
					atoken
				);

				if (res && res.status === 200 && res.data) {
					currentTechnicalData = res.data;
				}
			} catch (error) {
				console.error("Error fetching technical data for Excel:", error);
				// Use fallback data if available
				currentTechnicalData = tempTechnicalData;
			}
		}

		// Create a new Excel workbook
		const workbook = new ExcelJS.Workbook();

		// First sheet: General Details (simplified without colors)
		const worksheet = workbook.addWorksheet('General Details', {
			properties: { protected: true },
			pageSetup: { fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
		});

		// Define simple styles without colors
		const headerStyle = {
			font: { bold: true, size: 12 },
			alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
			border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } },
		};
		const dataRowStyle = {
			alignment: { horizontal: 'left', vertical: 'top' },
			border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } },
		};
		const topHeaderStyle = {
			font: { bold: true, size: 18 },
			alignment: { horizontal: 'center', vertical: 'middle' },
		};

		// Add company name
		const companyName = 'procur[E]ngine';
		const companyRow = worksheet.addRow([companyName, '', '']);
		companyRow.eachCell((cell) => {
			cell.style = topHeaderStyle;
		});
		// Dynamically set width of column A based on company name
		const approxCharWidth = 2.5;
		const minWidth = 20;
		const companyColWidth = Math.max(minWidth, companyName?.length * approxCharWidth);
		worksheet.getColumn(1).width = companyColWidth;

		worksheet.addRow([
			`RFQ Comparative Report`,
			`Event Code: ${rfqheaderdetails[0]?.eventCode}`,
			`Printed on: ${formatDateViaLocale(new Date().toISOString(), userDetail)}`
		]).eachCell((cell) => {
			cell.style = {
				font: { italic: true, size: 12 },
				alignment: { horizontal: 'center', vertical: 'middle' },
			};
		});
		worksheet.addRow([]);

		// Purchase Org and Group
		const purchOrg = findStringByValueFromArray(
			actions.purchaseAllList,
			rfqheaderdetails[0]?.purchOrgId,
			'id',
			'orgName'
		);
		const purchGrp = findStringByValueFromArray(
			actions.purchaseGroupAllList,
			rfqheaderdetails[0]?.purchGrpId,
			'id',
			'groupName'
		);

		// General details header
		worksheet.addRow(['Subject', 'Start Date', 'End Date', 'Requisitioner', 'Purchase Org', 'Purchase Group'])
			.eachCell((cell) => cell.style = headerStyle);

		// General details data
		worksheet.addRow([
			rfqheaderdetails[0]?.subject ?? 'N/A',
			rfqheaderdetails[0]?.startDate ? formatDateViaLocale(rfqheaderdetails[0]?.startDate, userDetail) : 'N/A',
			rfqheaderdetails[0]?.endDate ? formatDateViaLocale(rfqheaderdetails[0]?.endDate, userDetail) : 'N/A',
			rfqheaderdetails[0]?.requisitioner ?? 'N/A',
			purchOrg ?? 'N/A',
			purchGrp ?? 'N/A',
		]).eachCell((cell) => cell.style = dataRowStyle);

		// Currency and version
		worksheet.addRow([]);
		worksheet.addRow(['Company Name', 'Created By', 'Base Currency', 'Multi-Currency', 'Stage', 'Current Version'])
			.eachCell((cell) => cell.style = headerStyle);
		worksheet.addRow([
			rfqheaderdetails[0]?.companyName ?? 'N/A',
			rfqheaderdetails[0]?.createdByName ?? '',
			rfqheaderdetails[0]?.baseCurrency ?? 'N/A',
			rfqheaderdetails[0]?.isMultiCurrency ? 'Yes' : 'No',
			rfqheaderdetails[0]?.stage ?? 'Draft',
			rfqheaderdetails[0]?.version ?? '1',
		]).eachCell((cell) => cell.style = dataRowStyle);

		worksheet.addRow([]);

		// Add Description header row
		worksheet.addRow(['Description', 'Terms & Condition']).eachCell((cell) => {
			cell.style = headerStyle;
		});

		const MAX_DISPLAY_LENGTH = 30;
		const fullDescription = stripHtmlTags(rfqheaderdetails[0]?.description) ?? 'N/A';
		const termandCondition = stripHtmlTags(rfqheaderdetails[0]?.termandCondition) ?? 'N/A';

		// Add the row with actual content
		const descRow = worksheet.addRow([fullDescription, termandCondition]);
		descRow.height = 30;

		descRow.eachCell((cell, colNumber) => {
			cell.style = dataRowStyle;
			cell.alignment = { wrapText: true, vertical: 'top' };

			// Set fixed width
			worksheet.getColumn(colNumber).width = MAX_DISPLAY_LENGTH;

			// Add note for Description (Column 1)
			if (colNumber === 1 && fullDescription?.length > MAX_DISPLAY_LENGTH) {
				cell.note = {
					texts: [
						{
							text: fullDescription,
							font: { size: 10, color: { argb: 'FF000000' } },
						},
					],
				};
			}

			// Add note for Terms & Condition (Column 2)
			if (colNumber === 2 && termandCondition?.length > MAX_DISPLAY_LENGTH) {
				cell.note = {
					texts: [
						{
							text: termandCondition,
							font: { size: 10, color: { argb: 'FF000000' } },
						},
					],
				};
			}
		});

		worksheet.columns.forEach((column, index) => {
			let maxLength = 10;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellLength = cell.value ? cell.value.toString()?.length : 0;
				maxLength = Math.max(maxLength, cellLength);
			});
			column.width = 28;
		});

		// Create Financial Details sheet using tempData structure (matching original format)
		if (currentFinancialData) {

			const financialSheet = workbook.addWorksheet('Financial Details');

			// Get unique supplier names from tempData
			const suppliers = currentFinancialData.suppliers || [];
			const uniqueSuppliers = suppliers.map(s => s.companyName);
			const headerRow = [];
			// Add header row with static fields and dynamic supplier columns (matching original structure)
			if (actions.EventHeaderDetails?.boqReq == true) {
				headerRow.push('SrNo', 'SheetName', 'ItemCode', 'Short Name', 'ItemDescription', 'Quantity', 'UOM', 'Delivery Location', 'Target/Budget Price', 'Lowest Item Price', 'Savings in % (wrt Target Price)', 'Savings in % (wrt LPP)');
			}
			else {
				headerRow.push('SrNo', 'ItemCode', 'Short Name', 'ItemDescription', 'Quantity', 'UOM', 'Delivery Location', 'Target/Budget Price', 'Lowest Item Price', 'Savings in % (wrt Target Price)', 'Savings in % (wrt LPP)');
			}

			// Add supplier columns (2 columns per supplier: Unit Price, Amount)
			uniqueSuppliers.forEach(supplier => {
				headerRow.push(`${supplier}`);
				headerRow.push(''); // For Amount column
			});

			// Add Last PO Details main header
			headerRow.push('Last PO Details', '', '', '', '');

			const titleRow = financialSheet.addRow(headerRow);
			const subHeaderRow = [];
			// Add second header row with supplier sub-headers and submission time
			if (actions.EventHeaderDetails?.boqReq == true) {
				subHeaderRow.push('', '', '', '', '', '', '', '', '', '', '', '');
			}
			else {
				subHeaderRow.push('', '', '', '', '', '', '', '', '', '', '');
			}
			uniqueSuppliers.forEach((supplier, index) => {
				// Find supplier details for submission time
				const supplierData = suppliers[index];
				const submissionTime = supplierData?.responseDate ?
					`Submission Time: ${formatDateViaLocale(supplierData.responseDate, userDetail)}` :
					'Submission Time: N/A';

				subHeaderRow.push(submissionTime);
				subHeaderRow.push(''); // For Amount column
			});

			// Add empty cells for Last PO Details section in second row
			subHeaderRow.push('', '', '', '', '');

			const submissionTimeRow = financialSheet.addRow(subHeaderRow);
			const colHeaderRow = [];
			// Add third header row with column names
			if (actions.EventHeaderDetails?.boqReq == true) {
				colHeaderRow.push('', '', '', '', '', '', '', '', '', '', '', '');
			}
			else {
				colHeaderRow.push('', '', '', '', '', '', '', '', '', '', '');
			}
			uniqueSuppliers.forEach(supplier => {
				colHeaderRow.push('Unit Price');
				colHeaderRow.push('Amount');
			});

			// Add Last PO Details sub-headers
			colHeaderRow.push('Po No', 'PO Date', 'Supplier Name', 'Unit Rate', 'PO Value');

			const colTitleRow = financialSheet.addRow(colHeaderRow);

			// Merge supplier name cells (span across 2 columns for each supplier)
			uniqueSuppliers.forEach((supplier, index) => {
				var mergeStartCol = 0;
				if (actions.EventHeaderDetails?.boqReq == true) {
					mergeStartCol = 13 + (index * 2); // Starting after the 10 static columns (columns A-J, including Delivery Location)
				}
				else {
					mergeStartCol = 12 + (index * 2); // Starting after the 9 static columns (columns A-I, including Delivery Location)
				}
				const mergeEndCol = mergeStartCol + 1; // Span 2 columns

				// Merge supplier name in first row
				financialSheet.mergeCells(1, mergeStartCol, 1, mergeEndCol);

				// Merge submission time in second row
				financialSheet.mergeCells(2, mergeStartCol, 2, mergeEndCol);
			});
			var lastPoStartCol = 0;
			// Merge "Last PO Details" header cell (span across 5 columns: Po No, PO Date, Supplier Name, Unit Rate, PO Value)
			if (actions.EventHeaderDetails?.boqReq == true) {
				lastPoStartCol = 13 + (uniqueSuppliers?.length * 2);
			}
			else {
				lastPoStartCol = 12 + (uniqueSuppliers?.length * 2); // After all supplier columns
			}
			const lastPoEndCol = lastPoStartCol + 4; // Span 5 columns
			financialSheet.mergeCells(1, lastPoStartCol, 1, lastPoEndCol); // Merge "Last PO Details" in first row

			// Style all header rows
			titleRow.eachCell((cell) => {
				cell.style = headerStyle;
			});
			submissionTimeRow.eachCell((cell) => {
				cell.style = dataRowStyle;
			});
			colTitleRow.eachCell((cell) => {
				cell.style = headerStyle;
			});

			// Add item rows using tempData structure
			const items = currentFinancialData.items || [];
			items.forEach((item, i) => {
				// Calculate lowest item price
				let lowestPrice = Infinity;
				item.vendorItemDetails?.forEach(vendorDetail => {
					const unitPrice = parseFloat(vendorDetail?.itemPrice ?? 0);
					if (unitPrice > 0 && unitPrice < lowestPrice) {
						lowestPrice = unitPrice;
					}
				});
				if (lowestPrice === Infinity) lowestPrice = 0;
				const savingsWrtTargetPrice = parseFloat(item?.targetPrice ?? 0) && parseFloat(lowestPrice) ? ((parseFloat(item?.targetPrice ?? 0) - parseFloat(lowestPrice)) / parseFloat(item?.targetPrice ?? 0)) * 100 : 0;
				const savingsWrtLPP = parseFloat(lowestPrice) && parseFloat(item?.targetPrice ?? 0) ? ((parseFloat(item?.targetPrice ?? 0) - parseFloat(lowestPrice)) / parseFloat(lowestPrice)) * 100 : 0;
				const row = [];
				if (actions.EventHeaderDetails?.boqReq == true) {
					debugger
					row.push(
						item?.hierarchyCode, // SrNo
						item?.boqSheetName || 'N/A', // SheetName
						item?.itemCode || 'N/A', // ItemCode
						item?.itemName || 'N/A', // Short Name
						item?.itemDesc || 'N/A', // ItemDescription
						parseFloat(item?.quantity) || 0, // Quantity as number
						item?.uom || 'N/A', // UOM
						item?.plant || 'N/A', // Delivery Location - using default value like original
						parseFloat(item?.targetPrice ?? 0), // Target/Budget Price as number
						parseFloat(lowestPrice) || 0,// Lowest Item Price as number
						savingsWrtTargetPrice.toFixed(4), // Savings (wrt Target Price) as percentage
						savingsWrtLPP.toFixed(4) // Savings (wrt LPP) as percentage
					);
				}
				else {
					row.push(
						i + 1, // SrNo
						item?.itemCode || 'N/A', // ItemCode
						item?.itemName || 'N/A', // Short Name
						item?.itemDesc || 'N/A', // ItemDescription
						parseFloat(item?.quantity) || 0, // Quantity as number
						item?.uom || 'N/A', // UOM
						item?.plant || 'N/A', // Delivery Location - using default value like original
						parseFloat(item?.targetPrice ?? 0), // Target/Budget Price as number
						parseFloat(lowestPrice) || 0,// Lowest Item Price as number
						savingsWrtTargetPrice.toFixed(4), // Savings (wrt Target Price) as percentage
						savingsWrtLPP.toFixed(4) // Savings (wrt LPP) as percentage
					);
				}

				// Collect supplier prices to find the minimum for bold formatting
				const supplierPrices = [];
				const supplierData = [];

				// Process each supplier's data for this item
				uniqueSuppliers.forEach(supplierName => {
					const supplier = suppliers.find(s => s.companyName === supplierName);
					if (supplier) {
						const vendorDetail = item.vendorItemDetails?.find(vd => vd.vendorId === supplier.vendorId);
						if (vendorDetail) {
							const unitPrice = parseFloat(vendorDetail?.itemPrice ?? 0);
							const quantity = parseFloat(item?.quantity ?? 0);
							const amount = !isNaN(unitPrice) && !isNaN(quantity) ? unitPrice * quantity : 0;

							supplierPrices.push(unitPrice > 0 ? unitPrice : Infinity);
							supplierData.push({ unitPrice, amount });
						} else {
							supplierPrices.push(Infinity);
							supplierData.push({ unitPrice: 'N/A', amount: 'N/A' });
						}
					} else {
						supplierPrices.push(Infinity);
						supplierData.push({ unitPrice: 'N/A', amount: 'N/A' });
					}
				});

				// Find minimum price (excluding 0 and N/A values)
				const validPrices = supplierPrices.filter(price => price !== Infinity && price > 0);
				const minPrice = validPrices?.length > 0 ? Math.min(...validPrices) : null;

				// Add supplier data to row
				supplierData.forEach(data => {
					row.push(data.unitPrice === 'N/A' ? 'N/A' : data.unitPrice); // Store as number
					row.push(data.amount === 'N/A' ? 'N/A' : data.amount); // Store as number
				});

				// Add Last PO Details for this item (using default N/A values)
				row.push('N/A'); // Po No
				row.push('N/A'); // PO Date
				row.push('N/A'); // Vendor Name
				row.push('N/A'); // Unit Rate
				row.push('N/A'); // PO Value

				const itemRow = financialSheet.addRow(row);

				// Apply styling with bold formatting for minimum price
				itemRow.eachCell((cell, colNumber) => {
					cell.style = dataRowStyle;
					var staticColumns = 0;
					// Bold formatting for minimum unit price columns
					if (actions.EventHeaderDetails?.boqReq == true) {
						staticColumns = 12; // A to J (including Delivery Location)
					}
					else {
						staticColumns = 11; // A to I (including Delivery Location)
					}
					const supplierStartCol = staticColumns + 1; // Column J
					// Check if this is a unit price column (odd columns in supplier section)
					if (colNumber >= supplierStartCol && colNumber < supplierStartCol + (uniqueSuppliers?.length * 2)) {
						const supplierIndex = Math.floor((colNumber - supplierStartCol) / 2);
						const isUnitPriceCol = (colNumber - supplierStartCol) % 2 === 0;

						if (isUnitPriceCol && minPrice !== null && supplierData[supplierIndex].unitPrice === minPrice) {
							cell.style = {
								...dataRowStyle,
								font: { ...dataRowStyle.font, bold: true }
							};
						}
					}
				});

				// Get commercial terms for this item
				const allCommercialTerms = new Set();
				item.vendorItemDetails?.forEach(vendorDetail => {
					vendorDetail.vendorItemCommercials?.forEach(commercial => {
						if (commercial.name && commercial.name !== 'Total') {
							allCommercialTerms.add(commercial.name);
						}
					});
				});

				// Add commercial term rows for this item
				Array.from(allCommercialTerms).forEach(termName => {
					const commercialRow = [];
					if (actions.EventHeaderDetails?.boqReq == true) {
						commercialRow.push(
							'', // Empty SrNo
							'', // Empty SheetName
							'', // Empty ItemCode
							termName, // Commercial term name in Short Name column
							'', // Empty ItemDescription
							'', // Empty Quantity
							'', // Empty UOM
							'', // Empty Delivery Location
							'', // Empty Target/Budget Price
							'', // Empty Lowest Item Price
							'', // Empty Savings (wrt Target Price)
							'', // Empty Savings (wrt LPP)

						);
					}
					else {
						commercialRow.push(
							'', // Empty SrNo
							'', // Empty ItemCode
							termName, // Commercial term name in Short Name column
							'', // Empty ItemDescription
							'', // Empty Quantity
							'', // Empty UOM
							'', // Empty Delivery Location
							'', // Empty Target/Budget Price
							'', // Empty Lowest Item Price
							'', // Empty Savings (wrt Target Price)
							'', // Empty Savings (wrt LPP)

						);
					}
					// Add supplier commercial data for this term
					uniqueSuppliers.forEach(supplierName => {
						const supplier = suppliers.find(s => s.companyName === supplierName);
						let commercialValue = '';
						if (supplier) {
							// First check in supplier item commercial data
							const vendorDetail = item.vendorItemDetails?.find(vd => vd.vendorId === supplier.vendorId);
							if (vendorDetail?.vendorItemCommercials) {
								const commercialItem = vendorDetail.vendorItemCommercials.find(comm => comm.name === termName);
								commercialValue = commercialItem?.calculateCommValue || '';
							}
						}

						// Store as number if it's a valid number, otherwise as string
						const numericValue = parseFloat(commercialValue);
						commercialRow.push(!isNaN(numericValue) && commercialValue !== '' ? numericValue : commercialValue); // Commercial value as number
						commercialRow.push(''); // Empty Amount column for commercial terms
					});

					// Add empty Last PO Details columns for commercial terms
					commercialRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

					const commercialRowElement = financialSheet.addRow(commercialRow);
					commercialRowElement.eachCell((cell) => {
						cell.style = {
							...dataRowStyle,
							font: { italic: true, size: 11 }, // Make commercial terms slightly different visually
							fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } } // Light gray background
						};
					});
				});
			});

			// Add Total row - Calculate target price total
			let targetPriceTotal = 0;
			let totalLowestPrice = 0;
			items?.forEach((item) => {
				let lowestPrice = Infinity;
				item.vendorItemDetails?.forEach(vendorDetail => {
					const unitPrice = parseFloat(vendorDetail?.itemPrice ?? 0);
					if (unitPrice > 0 && unitPrice < lowestPrice) {
						lowestPrice = unitPrice;
					}
				});
				if (lowestPrice === Infinity) lowestPrice = 0;
				const targetPrice = item?.targetPrice ?? 0;
				if (!isNaN(targetPrice)) {
					targetPriceTotal += (parseFloat(targetPrice) * parseFloat(item?.quantity ?? 0));
				}
				if (!isNaN(lowestPrice)) {
					totalLowestPrice += (parseFloat(lowestPrice) * parseFloat(item?.quantity ?? 0));
				}
			});

			const totalRow = ['Total'];
			// Fill empty cells for static columns (2-7) - up to Delivery Location column
			if (actions.EventHeaderDetails?.boqReq == true) {
				for (let i = 2; i <= 8; i++) {
					totalRow.push('');
				}
			}
			else {
				for (let i = 2; i <= 7; i++) {
					totalRow.push('');
				}
			}
			// Add target price total in column H (Target/Budget Price column) as number
			totalRow.push(targetPriceTotal);
			// Empty cell for column I (Lowest Item Price column)
			totalRow.push(totalLowestPrice);
			totalRow.push(''); // Empty cell for Savings (wrt Target Price)
			totalRow.push(''); // Empty cell for Savings (wrt LPP)

			// Add totals for each supplier
			uniqueSuppliers.forEach(supplierName => {
				const supplier = suppliers.find(s => s.companyName === supplierName);
				if (supplier) {
					const packagePrice = parseFloat(supplier?.packagePrice) || 0;
					totalRow.push(''); // Empty for Unit Price column
					totalRow.push(packagePrice); // Package price as number
				} else {
					totalRow.push('', '');
				}
			});

			// Add empty Last PO Details columns for totals row
			totalRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

			const totalRowElement = financialSheet.addRow(totalRow);
			// Merge cells for "Total" label across columns A-F (up to UOM only)
			financialSheet.mergeCells(totalRowElement.number, 1, totalRowElement.number, 6);
			totalRowElement.eachCell((cell) => {
				cell.style = dataRowStyle;
			});

			// Add Loading Factor row
			const loadingFactorRow = ['Loading Factor'];
			// Fill empty cells for static columns (2-9)
			if (actions.EventHeaderDetails?.boqReq == true) {
				for (let i = 2; i <= 12; i++) {
					loadingFactorRow.push('');
				}
			}
			else {
				for (let i = 2; i <= 11; i++) {
					loadingFactorRow.push('');
				}
			}
			uniqueSuppliers.forEach(supplierName => {
				const supplier = suppliers.find(s => s.companyName === supplierName);
				if (supplier) {
					const loadingAmount = parseFloat(supplier?.loadingAmount) || 0;
					loadingFactorRow.push(''); // Empty for Unit Price column
					loadingFactorRow.push(loadingAmount); // Loading Factor Amount as number
				} else {
					loadingFactorRow.push('', '');
				}
			});

			// Add empty Last PO Details columns for loading factor row
			loadingFactorRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

			const loadingFactorRowElement = financialSheet.addRow(loadingFactorRow);
			// Merge cells for "Loading Factor" label across columns A-H
			if (actions.EventHeaderDetails?.boqReq == true) {
				financialSheet.mergeCells(loadingFactorRowElement.number, 1, loadingFactorRowElement.number, 12);
			}
			else {
				financialSheet.mergeCells(loadingFactorRowElement.number, 1, loadingFactorRowElement.number, 11);
			}
			loadingFactorRowElement.eachCell((cell) => {
				cell.style = dataRowStyle;
			});

			// Add Amount (Incl. GST/VAT) row
			const amountInclRow = ['Final Amount'];
			// Fill empty cells for static columns (2-9)
			if (actions.EventHeaderDetails?.boqReq == true) {
				for (let i = 2; i <= 12; i++) {
					amountInclRow.push('');
				}
			}
			else {
				for (let i = 2; i <= 11; i++) {
					amountInclRow.push('');
				}
			}
			uniqueSuppliers.forEach(supplierName => {
				const supplier = suppliers.find(s => s.companyName === supplierName);
				if (supplier) {
					const vendorAmount = parseFloat(supplier?.rfqVendorAmount) || 0;
					amountInclRow.push(''); // Empty for Unit Price column
					amountInclRow.push(vendorAmount); // Amount Incl as number
				} else {
					amountInclRow.push('', '');
				}
			});

			// Add empty Last PO Details columns for amount row
			amountInclRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

			const amountInclRowElement = financialSheet.addRow(amountInclRow);
			// Merge cells for "Amount" label across columns A-H
			if (actions.EventHeaderDetails?.boqReq == true) {
				financialSheet.mergeCells(amountInclRowElement.number, 1, amountInclRowElement.number, 12);
			}
			else {
				financialSheet.mergeCells(amountInclRowElement.number, 1, amountInclRowElement.number, 11);
			}
			amountInclRowElement.eachCell((cell) => {
				cell.style = dataRowStyle;
			});

			// Add Commercial Rank row (footer only) - Show ranking in Amount column
			const commercialRankRow = ['Commercial Rank'];
			// Fill empty cells for static columns (2-9)
			if (actions.EventHeaderDetails?.boqReq == true) {
				for (let i = 2; i <= 12; i++) {
					commercialRankRow.push('');
				}
			}
			else {
				for (let i = 2; i <= 11; i++) {
					commercialRankRow.push('');
				}
			}
			uniqueSuppliers.forEach(supplierName => {
				const supplier = suppliers.find(s => s.companyName === supplierName);
				if (supplier) {
					const ranking = supplier?.ranking || 'N/A';
					commercialRankRow.push(''); // Empty for Unit Price column
					commercialRankRow.push(`L${ranking}`); // Commercial Ranking in Amount column
				} else {
					commercialRankRow.push('', '');
				}
			});

			// Add empty Last PO Details columns for commercial rank row
			commercialRankRow.push('', '', '', '', ''); // Po No, PO Date, Vendor Name, Unit Rate, PO Value

			const commercialRankRowElement = financialSheet.addRow(commercialRankRow);
			// Merge cells for "Commercial Rank" label across columns A-H
			if (actions.EventHeaderDetails?.boqReq == true) {
				financialSheet.mergeCells(commercialRankRowElement.number, 1, commercialRankRowElement.number, 12);
			}
			else {
				financialSheet.mergeCells(commercialRankRowElement.number, 1, commercialRankRowElement.number, 11);
			}
			commercialRankRowElement.eachCell((cell) => {
				cell.style = dataRowStyle;
			});

			// Auto-adjust column widths
			financialSheet.columns.forEach((column, index) => {
				let maxLength = 10;
				column.eachCell({ includeEmpty: true }, (cell) => {
					const cellLength = cell.value ? cell.value.toString()?.length : 0;
					maxLength = Math.max(maxLength, cellLength);
				});
				if (index < 12) {
					if (index === (actions.EventHeaderDetails?.boqReq == true ? 4 : 3)) { // ItemDescription column
						column.width = 30;
					} else {
						column.width = Math.max(15, maxLength + 2);
					}
				} else {
					column.width = 18; // Fixed width for supplier columns
				}
			});
		}

		// Create Commercial Details sheet using tempCommercialData structure
		if (currentCommercialData) {
			const commercialSheet = workbook.addWorksheet('Commercial Details');

			// Get unique suppliers for commercial sheet
			const commercialSuppliers = currentCommercialData.suppliers || [];
			const uniqueCommercialSuppliers = commercialSuppliers.map(s => s.companyName);

			// Create header row for commercial sheet
			const commercialHeaderRow = ['SrNo', 'Commercial Term'];
			// Add supplier columns
			uniqueCommercialSuppliers.forEach(supplier => {
				commercialHeaderRow.push(`${supplier}`);
			});

			const commercialTitleRow = commercialSheet.addRow(commercialHeaderRow);
			commercialTitleRow.eachCell((cell) => {
				cell.style = headerStyle;
			});

			// Add supplier submission time row
			const commercialSubHeaderRow = ['', ''];
			uniqueCommercialSuppliers.forEach((supplier, index) => {
				const supplierData = commercialSuppliers[index];
				const submissionTime = supplierData?.responseDate ?
					`Submission Time: ${formatDateViaLocale(supplierData.responseDate, userDetail)}` :
					'Submission Time: N/A';
				commercialSubHeaderRow.push(submissionTime);
			});

			const commercialSubmissionTimeRow = commercialSheet.addRow(commercialSubHeaderRow);
			commercialSubmissionTimeRow.eachCell((cell) => {
				cell.style = dataRowStyle;
			});

			// Add commercial terms using tempCommercialData structure
			const packageCommercialTerms = currentCommercialData.packageCommercialTerms || [];
			packageCommercialTerms.forEach((term, index) => {
				const commercialRow = [index + 1, term.name];

				// Add supplier values for this commercial term
				uniqueCommercialSuppliers.forEach((supplierName, supplierIndex) => {
					const supplierData = commercialSuppliers[supplierIndex];
					let commercialValue = '';

					// Find the vendor response for this term
					const vendorResponse = term.vendorPackageCommercial?.find(vpc =>
						vpc.vendorId === supplierData.vendorId
					);

					commercialValue = vendorResponse?.remarks || vendorResponse?.calculateCommValue || 'N/A';
					commercialRow.push(commercialValue);
				});

				const commercialRowElement = commercialSheet.addRow(commercialRow);
				commercialRowElement.eachCell((cell) => {
					cell.style = dataRowStyle;
				});
			});

			// Auto-adjust column widths
			commercialSheet.columns.forEach((column, index) => {
				let maxLength = 10;
				column.eachCell({ includeEmpty: true }, (cell) => {
					const cellLength = cell.value ? cell.value.toString()?.length : 0;
					maxLength = Math.max(maxLength, cellLength);
				});
				column.width = Math.max(15, maxLength + 2);
			});
		}

		// Create Technical Details sheet using tempTechnicalData structure (matching original format)
		if (currentTechnicalData) {
			const technicalSheet = workbook.addWorksheet('Technical Details');

			// Get unique suppliers for technical sheet
			const technicalSuppliers = currentTechnicalData.suppliers || [];
			const uniqueTechnicalSuppliers = technicalSuppliers.map(s => s.companyName);

			// Create header row for technical sheet with Answer and Score columns for each supplier
			const technicalHeaderRow = ['SrNo', 'Questions', 'Requirement'];
			// Add supplier columns (2 columns per supplier: Answer, Score)
			uniqueTechnicalSuppliers.forEach(supplier => {
				technicalHeaderRow.push(`${supplier}`);
				technicalHeaderRow.push(''); // For Score column
			});

			const technicalTitleRow = technicalSheet.addRow(technicalHeaderRow);

			// Add supplier submission time row
			const technicalSubHeaderRow = ['', '', ''];
			uniqueTechnicalSuppliers.forEach((supplier, index) => {
				const supplierData = technicalSuppliers[index];
				const submissionTime = supplierData?.responseDate ?
					`Submission Time: ${formatDateViaLocale(supplierData.responseDate, userDetail)}` :
					'Submission Time: N/A';
				technicalSubHeaderRow.push(submissionTime);
				technicalSubHeaderRow.push(''); // For Score column
			});

			const technicalSubmissionTimeRow = technicalSheet.addRow(technicalSubHeaderRow);

			// Add third header row with Answer and Score labels
			const technicalColHeaderRow = ['', '', ''];
			uniqueTechnicalSuppliers.forEach(supplier => {
				technicalColHeaderRow.push('Answer');
				technicalColHeaderRow.push('Score');
			});

			const technicalColTitleRow = technicalSheet.addRow(technicalColHeaderRow);

			// Merge supplier name cells (span across 2 columns for each supplier)
			uniqueTechnicalSuppliers.forEach((supplier, index) => {
				const mergeStartCol = 4 + (index * 2); // Starting after the 3 static columns
				const mergeEndCol = mergeStartCol + 1; // Span 2 columns

				// Merge supplier name in first row
				technicalSheet.mergeCells(1, mergeStartCol, 1, mergeEndCol);

				// Merge submission time in second row
				technicalSheet.mergeCells(2, mergeStartCol, 2, mergeEndCol);
			});

			// Style all header rows
			technicalTitleRow.eachCell((cell) => {
				cell.style = headerStyle;
			});
			technicalSubmissionTimeRow.eachCell((cell) => {
				cell.style = dataRowStyle;
			});
			technicalColTitleRow.eachCell((cell) => {
				cell.style = headerStyle;
			});

			// Add technical questions using tempTechnicalData structure
			const questions = currentTechnicalData.questionDto || [];
			let totalScores = {}; // Track total scores per supplier

			// Initialize total scores for each supplier
			uniqueTechnicalSuppliers.forEach((supplierName, index) => {
				const supplierData = technicalSuppliers[index];
				totalScores[supplierData.vendorId] = 0;
			});

			questions.forEach((question, index) => {
				const questionRow = [
					index + 1,
					question.questionDescription || 'N/A',
					question.questionRequirement || 'N/A'
				];

				// Add supplier answers and scores for this question
				uniqueTechnicalSuppliers.forEach((supplierName, supplierIndex) => {
					const supplierData = technicalSuppliers[supplierIndex];
					let answer = 'No Response';
					let score = 0;

					// Find the vendor response for this question
					const vendorResponse = question.vendorQuestionResponse?.find(vqr =>
						vqr.vendorId === supplierData.vendorId
					);

					if (vendorResponse) {
						answer = vendorResponse.answer || 'No Response';
						score = vendorResponse.score !== undefined ? vendorResponse.score : 0;

						// Add to total score
						totalScores[supplierData.vendorId] += score;
					}

					questionRow.push(answer); // Answer column
					questionRow.push(score); // Score column as number
				});

				const questionRowElement = technicalSheet.addRow(questionRow);
				questionRowElement.eachCell((cell) => {
					cell.style = dataRowStyle;
				});
			});

			// Add Total row
			const totalRow = ['Total'];
			totalRow.push(''); // Empty Questions column
			totalRow.push(''); // Empty Requirement column

			// Add total scores for each supplier
			uniqueTechnicalSuppliers.forEach((supplierName, supplierIndex) => {
				const supplierData = technicalSuppliers[supplierIndex];
				const totalScore = totalScores[supplierData.vendorId] || 0;

				totalRow.push(''); // Empty Answer column
				totalRow.push(totalScore); // Total Score as number
			});

			const totalRowElement = technicalSheet.addRow(totalRow);
			totalRowElement.eachCell((cell) => {
				cell.style = headerStyle;
			});

			// Auto-adjust column widths
			technicalSheet.columns.forEach((column, index) => {
				let maxLength = 10;
				column.eachCell({ includeEmpty: true }, (cell) => {
					const cellLength = cell.value ? cell.value.toString()?.length : 0;
					maxLength = Math.max(maxLength, cellLength);
				});
				if (index === 1) { // Questions column
					column.width = 40;
				} else if (index === 2) { // Requirement column
					column.width = 30;
				} else if (index < 3) {
					column.width = Math.max(15, maxLength + 2);
				} else {
					// For supplier columns
					const isAnswerColumn = (index - 3) % 2 === 0;
					if (isAnswerColumn) {
						column.width = Math.max(25, maxLength + 2); // Wider for answers
					} else {
						column.width = 15; // Fixed width for scores
					}
				}
			});
		}

		// Generate Excel file and download
		const buffer = await workbook.xlsx.writeBuffer();
		const file = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
		saveAs(file, 'rfq-comparative-report-new.xlsx');
	}, [rfqheaderdetails, userDetail, actions, financialComparisonData, commercialComparisonData, technicalComparisonData, version, pageSlug, atoken, apiClient, fetchFinancialComparisonData]);


	// Function to handle Loading Factor
	const loadingFactor = useCallback(async (vendorId) => {
		const supplier = vendorItemAnalysis.find(s => s.vendorId == vendorId);
		if (supplier) {
			await actions.handleLoadingFactorNew(supplier);
		}
		// fetchFinancialComparisonData();
	}, [vendorItemAnalysis]);

	// Function to update score
	const updateScore = async (updatedvalue) => {

		const data = RFQSupplierQuestionsModal(updatedvalue, actions?.rfqid)
		if (data) {
			const res = await apiClient.postres(
				`/api/RFQVendorQuestion/${actions?.rfqid}/Update`,
				data,
				atoken
			);
			if (res) {
				toast.success("Score Updated Successfully", {
					toastId: "rvqsuc"
				});
				fetchTechnicalComparisonData(version);
			}
		}
	}
	const [openQuotes, setOpenQuotes] = useState(null);

	useEffect(() => {

		if (rfqheaderdetails && rfqheaderdetails?.length > 0) {

			const currentrfqversion = rfqheaderdetails[0].rfqVersionHistory.find((x) => x.version == rfqheaderdetails[0].version);
			if (currentrfqversion) {
				const openQuotes = currentrfqversion.openQuotes;
				setOpenQuotes(openQuotes);
			}
			else {
				setOpenQuotes('Y');
			}
		}
	}, [rfqheaderdetails])


	const [activeTab, setActiveTab] = useState(0);
	const [isMaximized, setIsMaximized] = useState(false);
	const [techScoreDirty, setTechScoreDirty] = useState(false);
	const techUpdateRef = useRef(null);
	const techResetRef = useRef(null);

	// Handle tab change
	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
		onSubTabChange?.(newValue);
		// Fetch RFQ Summary data when Executive Summary tab (index 0) is clicked
		if (newValue === 0 && !isLoadingGeneralData && (actions.rfqtype == "closed" && versionWiseData?.find(x => x.version == version)?.openQuotes == "Y" || actions.rfqtype != "closed")) {
			fetchGeneralData();
		}

		// Fetch financial comparison data when Financial Comparison tab (index 1) is clicked
		if (newValue === 1 && !isLoadingFinancialData && (actions.rfqtype == "closed" && versionWiseData?.find(x => x.version == version)?.openQuotes == "Y" || actions.rfqtype != "closed")) {
			fetchFinancialComparisonData(version);
		}

		// Fetch commercial comparison data when Commercial Comparison tab (index 2) is clicked
		if (newValue === 2 && !isLoadingCommercialData) {
			fetchCommercialComparisonData(version);
		}

		// Fetch technical comparison data when Technical Comparison tab (index 3) is clicked
		if (newValue === 3 && !isLoadingTechnicalData) {
			fetchTechnicalComparisonData(version);
		}
	};
	// Render content based on active tab
	const renderTabContent = () => {
		switch (activeTab) {
			case 0:
				const canReadSummary = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.READ) ?? false;
				const canEditSummary = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.EDIT) ?? false;
				const canCreateSummary = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.CREATE) ?? false;
				const canRemoveSummary = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.REMOVE) ?? false;

				// If no read permission, deny access completely
				if (!canReadSummary) {
					return (
						<div className="p-4">
							<Alert severity="error">
								<div className="d-flex align-items-center">
									<HiOutlineX className="me-2 f18" />
									Access Denied: You don't have permission to view RFQ Summary Tab.
								</div>
							</Alert>
						</div>
					);
				}
				if (isLoadingGeneralData) {
					return (
						<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
							<CircularProgress size={40} />
						</Box>
					);
				}
				if (actions.rfqtype == "closed" && versionWiseData?.find(x => x.version == version)?.openQuotes == "N") {
					return (
						<div className={styles.sectionLock}>
							<LockIcon className={styles.bigLockIcon} />
							<span className={styles.lockText}>RFQ Closed</span>
						</div>
					);
				}
				return <ExecutiveSummary data={generalData} />;
			case 1:
				const canReadFinancial = actions.permissionManager?.hasPermission(CLAIM_TYPES.FINANCIAL_RESPONSES, ACTIONS.READ) ?? false;
				const canEditFinancial = actions.permissionManager?.hasPermission(CLAIM_TYPES.FINANCIAL_RESPONSES, ACTIONS.EDIT) ?? false;
				const canCreateFinancial = actions.permissionManager?.hasPermission(CLAIM_TYPES.FINANCIAL_RESPONSES, ACTIONS.CREATE) ?? false;
				const canRemoveFinancial = actions.permissionManager?.hasPermission(CLAIM_TYPES.FINANCIAL_RESPONSES, ACTIONS.REMOVE) ?? false;

				// If no read permission, deny access completely
				if (!canReadFinancial) {
					return (
						<div className="p-4">
							<Alert severity="error">
								<div className="d-flex align-items-center">
									<HiOutlineX className="me-2 f18" />
									Access Denied: You don't have permission to view Financial Comparison Tab.
								</div>
							</Alert>
						</div>
					);
				}
				if (isLoadingFinancialData) {
					return (
						<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
							<CircularProgress size={40} />
						</Box>
					);
				}
				if (actions.rfqtype == "closed" && versionWiseData?.find(x => x.version == version)?.openQuotes == "N") {
					return (
						<div className={styles.sectionLock}>
							<LockIcon className={styles.bigLockIcon} />
							<span className={styles.lockText}>RFQ Closed</span>
						</div>
					);
				}
				return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><ComparativeAnalysis data={financialComparisonData} loadingFactor={loadingFactor} handleSupplierModalOpen={handleSupplierModalOpen} /></Box>;
			case 2:
				const canReadCommercial = actions.permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_RESPONSES, ACTIONS.READ) ?? false;
				const canEditCommercial = actions.permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_RESPONSES, ACTIONS.EDIT) ?? false;
				const canCreateCommercial = actions.permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_RESPONSES, ACTIONS.CREATE) ?? false;
				const canRemoveCommercial = actions.permissionManager?.hasPermission(CLAIM_TYPES.COMMERCIAL_RESPONSES, ACTIONS.REMOVE) ?? false;

				// If no read permission, deny access completely
				if (!canReadCommercial) {
					return (
						<div className="p-4">
							<Alert severity="error">
								<div className="d-flex align-items-center">
									<HiOutlineX className="me-2 f18" />
									Access Denied: You don't have permission to view Financial Comparison Tab.
								</div>
							</Alert>
						</div>
					);
				}
				if (isLoadingCommercialData) {
					return (
						<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
							<CircularProgress size={40} />
						</Box>
					);
				}
				return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}><CommercialComparative data={commercialComparisonData} handleSupplierModalOpen={handleSupplierModalOpen} /></Box>;
			case 3:
				const canReadTechnical = actions.permissionManager?.hasPermission(CLAIM_TYPES.TECHNICAL_RESPONSES, ACTIONS.READ) ?? false;
				const canEditTechnical = actions.permissionManager?.hasPermission(CLAIM_TYPES.TECHNICAL_RESPONSES, ACTIONS.EDIT) ?? false;
				const canCreateTechnical = actions.permissionManager?.hasPermission(CLAIM_TYPES.TECHNICAL_RESPONSES, ACTIONS.CREATE) ?? false;
				const canRemoveTechnical = actions.permissionManager?.hasPermission(CLAIM_TYPES.TECHNICAL_RESPONSES, ACTIONS.REMOVE) ?? false;

				// If no read permission, deny access completely
				if (!canReadTechnical) {
					return (
						<div className="p-4">
							<Alert severity="error">
								<div className="d-flex align-items-center">
									<HiOutlineX className="me-2 f18" />
									Access Denied: You don't have permission to view Financial Comparison Tab.
								</div>
							</Alert>
						</div>
					);
				}
				if (isLoadingTechnicalData) {
					return (
						<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
							<CircularProgress size={40} />
						</Box>
					);
				}
				return (
					<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
						<TechnicalComparative
							data={technicalComparisonData}
							updateScore={updateScore}
							handleApprovalActivity={handleApprovalActivity}
							actionType={actionType}
							activityId={activityId}
							handleSupplierModalOpen={handleSupplierModalOpen}
							isNFA={actions.isNFA}
							currentStage={actions.currentStage}
							onScoreDirtyChange={setTechScoreDirty}
							updateScoreRef={techUpdateRef}
							resetScoreRef={techResetRef}
						/>
					</Box>
				);
			default:
				const canReadSummaryDefault = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.READ) ?? false;
				const canEditSummaryDefault = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.EDIT) ?? false;
				const canCreateSummaryDefault = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.CREATE) ?? false;
				const canRemoveSummaryDefault = actions.permissionManager?.hasPermission(CLAIM_TYPES.RFQ_SUMMARY, ACTIONS.REMOVE) ?? false;

				// If no read permission, deny access completely
				if (!canReadSummaryDefault) {
					return (
						<div className="p-4">
							<Alert severity="error">
								<div className="d-flex align-items-center">
									<HiOutlineX className="me-2 f18" />
									Access Denied: You don't have permission to view RFQ Summary Tab.
								</div>
							</Alert>
						</div>
					);
				}
				if (actions.rfqtype == "closed" && versionWiseData?.find(x => x.version == version)?.openQuotes == "N") {
					return (
						<div className={styles.sectionLock}>
							<LockIcon className={styles.bigLockIcon} />
							<span className={styles.lockText}>RFQ Closed</span>
						</div>
					);
				}
				return <ExecutiveSummary data={generalData} />;
		}
	};

	// Technical Approval Logic
	const [loading, setLoading] = useState(false);
	const validationSchemaApprover = yup.object().shape({
		status: yup.string().required("status is required"),
		approveComment: yup.string().when('status', {
			is: 'Rejected',
			then: (schema) => schema.required("Reason is required for rejection"),
			otherwise: (schema) => schema.notRequired()
		})
	});
	const formik_ApproveReject = useFormik({
		initialValues: {
			rfqId: parseInt(idFromURL),
			status: actionType == "Forward" ? "Forward" : "Approved",
			approveComment: "",
			activityId: parseInt(activityId),
			startDate: null,
			endDate: null,
			vendorId: 0,
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {
			setLoading(true)
			//no need to send startdate and enddate in other case
			delete values?.startDate
			delete values?.endDate
			const currentDate = new Date();

			const stageInfo = getStageInfo(actions.currentStage, actions.stagelist);
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
				vendorId: supplierid ?? values?.vendorId ?? 0,
				eventSubject: actions.eventSubject ?? "",
				RecordCreatorId: actions.EventHeaderDetails?.createdById,

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
			setLoading(false)
		},
	});

	// Supplier Individual Summary Modal
	const [supplierModalOpen, setSupplierModalOpen] = useState(false);
	const [selectedVendorId, setSelectedVendorId] = useState(null);

	const handleSupplierModalOpen = useCallback(async (vendorId) => {
		setSelectedVendorId(vendorId);
		setSupplierModalOpen(true);
	}, [vendorItemAnalysis])

	useEffect(() => {
		if (actions?.rfqid && version) {
			fetchGeneralData();
		}
	}, [actions?.rfqid, version]);


	const actionButtons = actions.isNFA === false ? (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
			<RFQActionDrawer
				rfqid={actions?.rfqid}
				enddate={actions?.enddate}
				activityId={actions?.activityId}
				handleDraftEvent={actions?.handleDraftEvent}
				rfqtype={actions?.rfqtype}
				Version={actions?.rfqheaderversion}
				EventHeaderDetails={actions?.EventHeaderDetails}
				downloadExcel={downloadExcel}
				currentStage={actions?.currentStage}
			/>
			<button type="button"
				className="rfq-v2-tbtn rfq-v2-tbtn-export"
				onClick={handleClick}
				aria-controls={Boolean(anchorEl) ? "simple-menu-rfq" : undefined}
				aria-haspopup="true"
			>
				<span>Version {selectedVersion}</span>
				<span style={{ width: 1, alignSelf: 'stretch', background: '#e5e7eb', }} />
				<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<ExpandMore style={{ fontSize: 16 }} />
				</span>
			</button>
			<Menu
				id="simple-menu-rfq"
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				sx={{ maxWidth: 500 }}
			>
				{versionhistory && versionhistory.map((x) => (
					<MenuItem
						key={x}
						selected={x === selectedVersion}
						onClick={() => { setSelectedVersion(x); handleVersionClick(x); }}
					>
						{`Version ${x}`}
					</MenuItem>
				))}
			</Menu>
		</Box>
	) : null;

	return (

		<>
			{headerActionsRef?.current && ReactDOM.createPortal(actionButtons, headerActionsRef.current)}
			<Box sx={{
				display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden',
			}}>
				{/* Sticky Sub-Tab Navigation — styled to match main tabs */}
				<Box
					sx={{
						position: 'sticky',
						top: 0,
						zIndex: 100,
						borderBottom: 1,
						borderColor: 'divider',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingRight: 1,
						backgroundColor: "var(--vz-body-bg)",
					}}
				>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						textColor="primary"
						indicatorColor="primary"
						className="tabstheme"
						variant="scrollable"
						allowScrollButtonsMobile
						sx={{ flex: 1 }}
					>
						<Tab
							value={0}
							label={<span className="section-heading">RFQ Summary</span>}
						/>
						{(actions.actionType == 'approval' && (actions.currentStage == 'Open' || actions.currentStage == 'Technical Approval') ? actions.EventHeaderDetails.showPriceTech : true) &&
							(<Tab
								value={1}
								label={<span className="section-heading">Financial Comparison</span>}
							/>)
						}
						<Tab
							value={2}
							label={<span className="section-heading">Commercial Comparison</span>}
						/>
						<Tab
							value={3}
							label={<span className="section-heading">Technical Comparison</span>}
						/>
					</Tabs>
					{activeTab === 3 && !actions.isNFA && (
						<Box sx={{ display: 'flex', gap: 1, px: 1, alignItems: 'center', flexShrink: 0 }}>
							<Button
								size="small"
								variant="outlined"
								color="primary"
								disabled={!techScoreDirty}
								onClick={() => techResetRef.current?.()}
								sx={{ fontSize: '12px', textTransform: 'none', height: '30px' }}
							>
								Reset Score
							</Button>
							<Button
								size="small"
								variant="contained"
								color="primary"
								disabled={!techScoreDirty}
								onClick={() => techUpdateRef.current?.()}
								sx={{ fontSize: '12px', textTransform: 'none', height: '30px' }}
							>
								Update Score
							</Button>
						</Box>
					)}
					<button
						type="button"
						className="pe-icon-btn"
						title="Maximize"
						onClick={() => setIsMaximized(true)}
						style={{ marginLeft: '4px', marginRight: '4px', flexShrink: 0 }}
					>
						<MdOutlineOpenInFull style={{ fontSize: '14px' }} />
					</button>
				</Box>

				{/* Tab Content */}
				<Box sx={{
					backgroundColor: "#F5F5F5",
					marginTop: 0,
					paddingTop: 0,
					flex: 1,
					minHeight: 0,
					overflow: 'hidden',
				}}>
					{renderTabContent()}
				</Box>
			</Box>

			{/* ── Maximize / Full-screen Dialog ── */}
			<TechnicalComparisonMaximizeView
				open={isMaximized}
				onClose={() => setIsMaximized(false)}
				rfqCode={rfqheaderdetails?.[0]?.eventCode || `RFQ-${pageSlug}`}
				activeTab={activeTab}
				onTabChange={handleTabChange}
				actions={actions}
				techScoreDirty={techScoreDirty}
				techResetRef={techResetRef}
				techUpdateRef={techUpdateRef}
				renderTabContent={renderTabContent}
			/>

			<>
				{/* {PO modal} */}
				<Modal
					size="md"
					show={openPoDetail}
					backdrop="static"
					// keyboard={false}
					//  className=""
					// backdropClassName=""
					centered
					contentClassName="border-0 rounded"
					className="zindex1280"
					backdropClassName="zindex1280"
					onHide={() => handleClosePoDetail()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								PO Details
							</div>
						</Modal.Title>

						<IconButton
							onClick={() => handleClosePoDetail()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<div
								className="row"
								style={{
									paddingLeft: ".7rem",
									paddingRight: ".7rem",
									paddingTop: ".7rem",
								}}
							>
								{selectedpodetails?.poNumber && <Table striped bordered hover responsive className="mb-0 pb0">
									<thead>
										<tr>
											{/* <th className="f12 fw500">SrNo.</th> */}
											<th className="f12 fw500"> PO No</th>
											<th className="f12 fw500">PO Date </th>
											<th className="f12 fw500">Vendor Name</th>
											<th className="f12 fw500">Unit Rate</th>
											{/* <th className="f12 fw500">Po Value</th> */}
										</tr>
									</thead>
									<tbody>
										<tr>
											{/* <td className="f12 fw400">1</td> */}
											<td className="f12 fw400">{selectedpodetails?.poNumber}</td>
											<td className="f12 fw400">{selectedpodetails?.poDate}</td>
											<td className="f12 fw400">{selectedpodetails?.poVendorName}</td>
											{/* <td className="f12 fw400">{selectedpodetails?.poNumber}</td> */}
											<td className="f12 fw400">
												{selectedpodetails?.poUnitRate}{" "}
												<Tooltip title={"Base Currency"}>
													<span> {rfqheaderdetails && rfqheaderdetails[0]?.baseCurrency}  </span>
												</Tooltip>
											</td>
										</tr>
									</tbody>
								</Table>}
							</div>
						</div>
					</Modal.Body>
				</Modal>
				{/* Technical approval confirmation dialog */}
				<ApprovalConfirmDialog
					open={state["openInvoiceApproved"]}
					onClose={toggleDrawer("openInvoiceApproved", false, [])}
					onSubmit={formik_ApproveReject.handleSubmit}
					status={formik_ApproveReject.values?.status}
					stageName="Technical Approval"
					comment={formik_ApproveReject.values?.approveComment}
					onCommentChange={(val) => formik_ApproveReject.setFieldValue("approveComment", val)}
					zIndex={1500}
				/>
				{/* Approval Drawer — old flow, replaced by new Dialog popup in RequestForQuotation.js */}
				{/* <React.Fragment key="key4">
					<Drawer anchor="right" open={state["openInvoiceApproved"]}>
						<form onSubmit={formik_ApproveReject.handleSubmit} autoComplete="off">
							<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
								<div className="flex flex-col">
									<Box className="bgheaderCards">
										<div className="d-flex align-items-center justify-content-between pt-2 pb-2 mt-0">
											<div className="ms-3 text-white">Approval Action</div>
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
															label="Status"
															variant="outlined"
															value={formik_ApproveReject.values?.status}
															onChange={(e) => {

																formik_ApproveReject.setFieldValue(
																	"status",
																	e.target.value
																)
															}

															}

															error={
																formik_ApproveReject.touched.status &&
																Boolean(formik_ApproveReject.errors.status)
															}
															helperText={
																formik_ApproveReject.touched.status &&
																formik_ApproveReject.errors.status
															}
														>
															{actionType != "Forward" && menuactionlist.filter(x => x.value != "Forward").map((x) => {

																return (<MenuItem value={x.value}>{x.label}</MenuItem>)

															})

															}
															{actionType == "Forward" && menuactionlist.filter(x => x.value == "Forward").map((x) => {

																return (<MenuItem value={x.value}>{x.label}</MenuItem>)

															})

															}

														</TextField>
													</div>
													<div className="col-12 col-md-4 col-lg-12 mb-4">
														<TextField
															id="approveComment"
															InputLabelProps={{
																shrink: true,
															}}
															multiline
															rows={3}
															name="approveComment"
															className="w-100 f14"
															size="small"
															label="Comment "
															variant="outlined"
															inputProps={{ maxLength: 200 }}
															value={formik_ApproveReject?.values?.approveComment}
															onChange={(e) =>
																formik_ApproveReject.setFieldValue(
																	"approveComment",
																	e.target.value
																)
															}
															InputProps={{
																endAdornment: formik_ApproveReject?.values?.approveComment && (
																	<InputAdornment position="end">
																		<Typography variant="body2" color="textSecondary">
																			{formik_ApproveReject?.values?.approveComment?.length}/200
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
													loading={loading}
													color="primary"
													size="medium"
													className="text-white text-capitalize mb-3 mr-3"
													variant="contained"
													type="submit"
												>
													<span>Submit</span>
												</LoadingButton>

											</div>
										</div>
									</div>
								</div>
							</Box>
						</form>
					</Drawer>
				</React.Fragment> */}
				{/* Supplier Individual Report Modal */}
				<SupplierIndividualReport
					open={supplierModalOpen}
					onClose={() => setSupplierModalOpen(false)}
					vendorId={selectedVendorId}
					rfqid={actions?.rfqid}
					version={version}
					permissionManager={actions.permissionManager}
					isBoq={actions.EventHeaderDetails?.boqReq}
				/>
			</>
		</>
	);
};

export default ERFQComparative;


