import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import HistoryCell from "../../BaseCells/HistoryCell";
import {
	HiOutlineX,
	HiX,
	HiPlusSm,
	HiOutlineDotsHorizontal,
	HiPencilAlt,
	HiPlus,
	HiOutlinePencil,
	HiDotsVertical,
} from "react-icons/hi";
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
	createFilterOptions,
} from "@mui/material";
import { Badge, Dropdown, DropdownButton, Modal } from "react-bootstrap";
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
	downloadExcelTemplate,
} from "../../../utils/common";
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
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddProductsCell from "./AddProductsCell";
import { UOMMasterList } from "../../../utils/commerciallibrary";
import AddQuestionFormCell from "./AddQuestionFormCell";
import { toast } from "react-toastify";
import { StageFindAll } from "../../../utils/stagemaster";
import {
	BackButton,
	MemoizedEventStageFlow,
} from "../../../utils/common/component";
import NotFoundPage from "../../../components/NotAllowed";
import { ApiClient, api } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import AttachmentWorkFlow from "../../BaseCells/attachmentworkflow";
import {
	ChevronLeft,
	ChevronRight,
	Close,
	DoubleArrow,
	ExpandMore,
	KeyboardDoubleArrowLeft,
	KeyboardDoubleArrowRight,
	PushPinOutlined,
} from "@mui/icons-material";
import EventApprovalBox from "../../BaseCells/eventapprovalbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import SelectedSupplierCell from "./SelectedSupplierCell";
import EventQuestionCell from "../../BaseCells/EventQuestionCell";
import { sanitizeInput } from "../../../utils/common/santize";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { TbExchange } from "react-icons/tb";
import ERFIComparative from "./ERFIComparative";
import RFIGeneralPreview from "./RFIGeneralPreview";
import RFQActionDrawer from "../../../components/Reports/RFQActionDrawer";
import EventCommercialScreen from "../../../components/Event/EventCommercialScreen";
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import QueryList from "../../CommunucationHub/QueryList";
import { FastApiClient } from "../../../FastApiClient";
import EventRFIQuestion from "../../../components/Event/EventRFIQuestion";
import EventSuppliers from "../../../components/Event/EventSuppliers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const RequestForInformation = ({ claimType }) => {
	const fileInputRef = useRef(null);
	const location = useLocation();
	const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
	const checkedIcon = <CheckBoxIcon fontSize="small" />;

	const navigate = useNavigate();
	const [{ atoken, rtoken, customerid, roleClaims,customersuffix,userDetail }, dispatch] =
		useStateValue();
	const apiClient = new ApiClient(customersuffix);
	//ref
	const EventCommercialScreenRef = React.createRef();
	const EventQuestionScreenRef = React.createRef();

	
	const [currencyList, setCurrencyList] = useState([]);
	const [purchaseAllList, setPurchaseAllList] = useState([]);
	const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
	const [requisitionerList, setRequisitionerList] = useState([]);
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

	const updateEventLibraryId = (v) => {

		const { id } = v
		setLibraryId(id)
	}

	const handleCloseModal1 = () => setModal1(false);

	const handleChange = (event, newValue) => {


		setValue(newValue);
		if (newValue == "6") {
			if (tabshow)
				//setTabShow(false)

			if (approvershow)
				setApproverShow(false)
		}
		else {
			if (!approvershow)
				setApproverShow(true)
			// if (newValue == "5") {
			// 	setSelectedMenuItem("Save Suppliers")
			// }
			if (newValue == "7") {
				setSelectedMenuItem("Submit")
			}
			else {
				setSelectedMenuItem("Save & Continue")
			}
		}



	};

	useEffect(() => {
		if (value == "1" && idFromURL == null) {
			setApproverShow(false);
		}
		else if (value == 6) {
			setApproverShow(false);
		}
		else {

		}

	}, [value, idFromURL]);

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

	const getStageRefreshonPurchGroup = () => {
		StageFindAll(
			{
				EventType: "RFI",
				CustomerId: customerid,
				EventId: idFromURL ?? 0,
				OrgId: OrgId ?? 0,
				OrgGroupId: OrgGroupId ?? 0,
			},
			atoken
		).then((res) => {
			setStageList(res);
			const stagesarray = res?.map((item) => item.currentStage);
		});
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

	const toggleDrawerCallback = useCallback((anchor, open) => {
		setState({ ...state, [anchor]: open });
	}, []);

	const [requestCell, setRequestCell] = useState({
		EventId: 0,
		EventType: "RFI",
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
		EventType: "RFI",
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
		// description: yup.string().test("valid-desc", function (description) {

		// 		const descriptionobj = extractTextFromHTML(description);
		// 		// if(!description){
		// 		// 	return this.createError({
		// 		// 		path: "description",
		// 		// 		message: "Description is required", // Custom error message
		// 		// 	  });

		// 		// }

		// 	  if ( descriptionobj.trim().length < 1) {
		// 		// If the termandcondition is undefined, null, or empty, scroll to target and return an error
		// 		//scrollToTargetC("description");  // Scroll to the target element

		// 		return this.createError({
		// 		  path: "description",
		// 		  message: "Description is required", // Custom error message
		// 		});
		// 	  }
		// 	  return true; // Validation passes if termandcondition has content
		// 	}),		

		// termandcondition: yup.string().test("valid-tc", function (termandcondition) {
			
		// 	const termandconditionobj = extractTextFromHTML(termandcondition);
		// 	// if(!termandcondition){

		// 	// 	return this.createError({
		// 	// 		path: "termandcondition",
		// 	// 		message: "Terms & Condition is required", // Custom error message
		// 	// 	  });

		// 	// }
		//   if (termandconditionobj.trim().length < 1) {
		//     // If the termandcondition is undefined, null, or empty, scroll to target and return an error
		//     //scrollToTargetC("termandcondition");  // Scroll to the target element

		//     return this.createError({
		//       path: "termandcondition",
		//       message: "Terms & Condition is required", // Custom error message
		//     });
		//   }
		//   return true; // Validation passes if termandcondition has content
		// }),
		endDate: yup
			.date()
			.required("RFQ End Date/Time is required")
			.typeError("RFQ End Date/Time is required")
			.test(
				"valid-dates",
				function (endDate) {
					const { startDate } = this.parent; // Access other fields
					if (endDate < maxNow) {
						return this.createError({
							path: "endDate",
							message: "RFQ End Date/Time cannot be in the past",
						});
					}
					if (startDate && startDate > endDate) {
						return this.createError({
							path: "startDate",
							message: "Start Date cannot be greater than RFQ End Date",
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
				'is-greater-than-startDate',
				'Bid Open Date/Time must be greater than End Date/Time',
				function (value) {

					const { endDate, RFQType } = this.parent;
					if (RFQType === "closed" && endDate && value) {
						return value > endDate;
					}
					return true; // if sealedBid is false or dates are not defined, validation passes
				}
			)
		// .test(
		// 	'is-sealedbid',
		// 	'Bid Open Date/Time is required in Sealed Bid',
		// 	function (value) {

		// 		const { RFQType } = this.parent;
		// 		if (RFQType === "closed" && !value) {
		// 			return false;
		// 		}
		// 		return true; // if sealedBid is false or dates are not defined, validation passes
		// 	}
		// ),
	});

	const formik = useFormik({
		enableReinitialize: true,
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
			RFQType: "RFI",
			bidOpeningDate: null,
			boqReq: false,
			requisitioner: "",
			multicurrencytList: [],
			technicalApproval: "",
			IsMultiCurrency: false
		},
		validationSchema: validationSchema,

		onSubmit: async (values) => {

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
			
			const descriptionobj = extractTextFromHTML(formik?.values?.description);
			if ( descriptionobj.trim().length < 1){
                    formik.setFieldError("description",'Description is mandatory')
					return
			}

            const tncobj = extractTextFromHTML(formik?.values?.termandcondition);
			if ( tncobj.trim().length < 1){
                    formik.setFieldError("termandcondition",'Term and condition is mandatory')
					return
			}



			const currentdate = new Date();



			var data = {
				id: values?.id,
				customerId: customerid,
				openBy: customerid,
				subject: sanitizeInput(values.subject),
				description: sanitizeInput(values.description),
				baseCurrency: values.baseCurrency,
				startDate: values.startDate ? values.startDate?.toISOString() : currentdate.toISOString(),
				endDate: values.endDate?.toISOString(),
				purchOrgId: values.purchOrgId?.id != "" ? values.purchOrgId?.id : 0,
				purchGrpId: values.purchGrpId?.id != "" ? values.purchGrpId?.id : 0,
				termandcondition: sanitizeInput(values.termandcondition),
				rfqStatus: values.rfqStatus,
				openQuotes: values.RFQType == "closed" ? "N" : "Y",
				RFQType: values.RFQType,
				bidOpeningDate: values.bidOpeningDate ? values.bidOpeningDate?.toISOString() : null,
				boqReq: values.boqReq,
				requisitioner: values.requisitioner != "" ? values.requisitioner : "",
				multicurrencytList: values.IsMultiCurrency ? inputList : [],
				technicalApproval: values.technicalApproval,
				IsMultiCurrency: values.IsMultiCurrency,
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
					toast.success(`Event details have been updated successfully.`, {
						toastId: "rfqmanage_update"
					});
					setValue(4);
					setIdFromURL(data?.id)
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

					setIdFromURL(res.data);
					navigate(`/configuration/manage-rfi/${res.data}?tab=question`)
					setcommcurrencyList([
						{
							id: "0",
							baseCurrency: "",
							currencyConversion: "",
							rfqId: res.data,
						},
					]);


					updateRequestCell(res.data);

					const AttachFiles = attachmentforevent.map((x) => {

						x.eventId = res.data;
						x.createdById = userDetail?.id;
						x.createdByName = userDetail?.name;

						return x;
					});

					handlesaveAttachment(AttachFiles, res.data, atoken);


					toast.success(`event details have been added successfully.`, {
						toastId: "rfqmanage_update2"
					});
					setValue(4);
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
		// console.log('pagge', e)
		const { name, value } = e.target;
		const list = [...commcurrencyList];
		list[index][name] = value;
		setcommcurrencyList(list);
	};
	const handleRemoveClick = (index) => {
		const list = [...inputList];
		list.splice(index, 1);
		setInputList(list);
	};
	const handleRemoveCurrencyClick = (index) => {
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
		var data = {
			isActive: true,
		};
		getCurrency(data, atoken).then((res) => {
			setCurrencyList(res);
		});
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
				setPurchaseGroupAllList(res);
			}
		});
	};

	const [stagelist, setStageList] = useState(null);
	const [stagearray, setStagearray] = useState([`Draft`]);
	//useState([`Draft`,`Under Pre Approval`]);
	const [currentStage, setCurrentStage] = useState(`Draft`);
	const [tempDataEditData, setTempDataEditData] = useState(null);
	const [EventHeaderDetails, setEventHeaderDetails] = useState(null);
	const pullgetRFQManageFind = (Id) => {
		var data = {
			Id: Id,
		};

		getRFQManageFindById(data, atoken).then((res) => {

			if (res && res?.length > 0) {
				//console.log("res getRFQManageFindById", res);

				setEventHeaderDetails(res?.[0]);
				if (res?.[0]?.userAccess.length > 0) {
					const userAccess = res?.[0]?.userAccess.map(x => {
						return ({ ...x, claimValue: JSON.parse(x.claimValue) })
					})

					setAccessLevel(userAccess)

				}


				if (res?.[0]?.rfqParameters && res?.[0]?.rfqParameters?.length) {
					setrfqItemsList(res?.[0]?.rfqParameters);
				}
				// if(res[0]?.rfqVendorInvited && res[0]?.rfqVendorInvited.length > 0){
				// 	setSelectedSupplier(res[0]?.rfqVendorInvited)
				// }

				setTempDataEditData(res);

				if (res?.[0]?.id && res?.[0]?.id > 0) {
					formik.setFieldValue("id", res?.[0]?.id);
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

				// if (res?.[0]?.startDate) {
				// 	const startDate = checkUTC(res?.[0]?.startDate)
				// 	formik.setFieldValue("startDate", new Date(startDate));
				// 	formik_ApproveReject.setFieldValue("startDate", new Date(startDate));
				// }
				if (res?.[0]?.startDate) {
					const startDate = checkUTC(res?.[0]?.startDate);
					const currentDate = new Date();
				  
					// Only set startDate if it's greater than or equal to the current date
					if (new Date(startDate) >= currentDate) {
					  formik.setFieldValue("startDate", dayjs(startDate).tz(userDetail?.timeZone));;
					  formik_ApproveReject.setFieldValue("startDate", new Date(startDate));
					}
				}
				if (res?.[0]?.endDate) {
					const endDate = checkUTC(res?.[0]?.endDate)
					formik.setFieldValue("endDate", dayjs(endDate).tz(userDetail?.timeZone));
					formik_ApproveReject.setFieldValue("endDate", new Date(endDate));
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
					setInputList(res?.[0]?.multicurrencytList);
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

				if (res?.[0]?.bidOpeningDate) {
					const bidOpeningDate = checkUTC(res?.[0]?.bidOpeningDate)
					formik.setFieldValue(
						"bidOpeningDate",
						new Date(bidOpeningDate)
					);
				}
 
				if (res[0]?.stage) {
					setCurrentStage(res[0]?.stage);


				}


			}
		});
	};


	// const PullUserDesignation = async () => {
	// 	const res = await apiClient.getres(`/api/User/Find?${customerid}`, atoken);
	// 	const filteredList = res?.data?.filter(x => x != `Vendor`) ?? [];
	// 	// Add "None" option to the list
	// 	setRequisitionerList(['None', ...filteredList]);
	// };
	const PullUserDesignation = async () => {
		const url = `/api/User/Find?CustomerId=${customerid}`;
		const res = await apiClient.getres(url, atoken);

		// Use the response data directly and add "None" option to the list
		const userDesignations = res?.data?.result ?? [];  // Use the data as it is, no filtering

		// Add "None" option to the list
		setRequisitionerList(['None', ...userDesignations]);
	};


	const pullUOMMasterList = () => {
		var data = {
			CustomerId: customerid,
			IsActive: true,
		};
		UOMMasterList(data, atoken).then((res) => {
			setUOMMaster(res);
		});
	};

	const handleUomList = (array) => {
		setUOMMaster(array);
	};
	const pullRFQItemServiceFind = (refid) => {
		var data = {
			RFQId: refid,
			//CustomerId : customerid,
		};

		// console.log('request id pullRFQItemServiceFind', data);
		getRFQItemServiceFind(data, atoken).then((res) => {

			if (res && res?.length > 0) {

				setrfqItemsList(res);
			}
			else {
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
			EventType: "RFI",
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

	const saveRFQCommLibraryAdd = () => {

		const selectedCommTerms = commercialLibFind?.filter(
			(s) => s.isSelected == true
		);



		//to handle commercial currency on formula

		const commercialfieldlist = selectedCommTerms.filter(x => x.level === "item").map(x => x.fieldName);
		const selectedCommTermsItemLevel = selectedCommTerms.filter(x => x.level === "item");

		const isValid = selectedCommTermsItemLevel.some((x) => {
			if (x.formulavalue) {

				const fieldNameGroup = Array.from(x.fieldNameGroup.split(",")).filter(x => x != "Price");
				let notIncluded = fieldNameGroup.filter(element => !commercialfieldlist.includes(element));
				if (notIncluded.length == 1) {
					if (notIncluded[0]?.trim() == "") {
						notIncluded = [];
					}
				}
				if (notIncluded?.length > 0) {
					toast.error(`Required formula fields:[${notIncluded.join(",")}] missing for ${x.name}.Item added at item level must have all required fields included in formula.`, {
						toastId: "commercialtermerror"
					});
					return true; // Indicates a failure
				}
			}
			return false; // No failure found for this item
		});

		if (isValid) {
			return; // Early exit if validation failed
		}


		const hasUnfilledCurrency = selectedCommTerms.some((item) => {
			return item.valuetype === "Currency" && (!item.rfqTermCurrency || item.rfqTermCurrency?.length === 0);
		});

		if (hasUnfilledCurrency) {
			selectedCommTerms.forEach((item) => {

				if (item?.valuetype === "Currency") {
					if (!item.rfqTermCurrency) {
						item.rfqTermCurrency = [{
							id: "0",
							baseCurrency: formik?.values?.baseCurrency,
							currencyConversion: "1",
							rfqId: idFromURL,
						}]
					}
				}
			})

		}
		if (selectedCommTerms && selectedCommTerms?.length) {
			const hasEmptyLevel = selectedCommTerms.some((s) => !s.level);


			if (hasEmptyLevel) {
				toast.error("Please select Type for selected terms", {
					toastId: "rfqmanage_terms"
				});
			} else {
				RFQCommLibraryAdd(selectedCommTerms, idFromURL, atoken).then((res) => {
					if (res) {
						//console.log("RFQCommLibraryAdd -response ", res);
						toast.success(`Data Saved Successfully`, {
							toastId: "rfqmanage_comm"
						});
						if (idFromURL && idFromURL > 0) {
							pullgetRFQManageFind(idFromURL);
							setValue(4);
						}
					}
					else {
						toast.error(`Error  while saving data`, {

							toastId: "rfqerror_comm"
						});
					}



					//}
				});
			}
		} else {
			setValue(4);
		}
	};

	const saveRFQQuestionLibAdd = () => {
		//console.log("selectedQuesionArray", selectedQuesionArray);

		const QuesionArray = selectedQuesionArray?.map((obj) => ({
			id: 0,
			rfqId: idFromURL,
			questionId: obj?.id ? obj?.id : 0,
			questionDescription: obj?.questionDescription
				? obj?.questionDescription
				: "",
			questionRequirement: obj?.questionRequirement
				? obj?.questionRequirement
				: "",
			attachement: obj?.attachement ? obj?.attachement : false,
			attachedFileName: obj?.attachedFileName ? obj?.attachedFileName : "",
			optionType: obj?.optionType ? obj?.optionType : false,
			weightage: obj?.weightage ? obj?.weightage : 0,
			mandatory: obj?.mandatory ? obj?.mandatory : false,
			questionRequirement: obj?.questionRequirement
				? obj?.questionRequirement
				: "",
			isActive: obj?.isActive ? obj?.isActive : false,
			libraryId: obj?.libraryId ? obj?.libraryId : 0,
			libraryEntity: obj?.libraryEntity ? obj?.libraryEntity : "",
			questioncategoryId: obj?.questioncategoryId ? obj?.questioncategoryId : 0,
			questionCategory: obj?.questionCategory ? obj?.questionCategory : "",
			questionSubcategoryId: obj?.questionSubcategoryId
				? obj?.questionSubcategoryId
				: 0,
			questionSubCategory: obj?.questionSubCategory
				? obj?.questionSubCategory
				: "",
			//questionOption: obj?.questionOption && obj?.questionOption?.length > 0 ? obj?.questionOption : [],
			questionOption:
				obj?.questionOption && obj?.questionOption?.length > 0
					? obj.questionOption.map(({ id, ...rest }) => ({ ...rest }))
					: [],
			// rfqqUestion: obj?.questionDescription ? obj?.questionDescription : "",
		}));
		if (QuesionArray && QuesionArray?.length > 0) {
			//console.log("call QuesionArray api request", QuesionArray);
			setLoading(true)
			RFQQuestionLibAdd(QuesionArray, idFromURL, atoken).then((res) => {
				//console.log("RFQQuestionLibAdd -response ", res);
				toast.success(`Data Saved Successfully`, {
					toastId: "rfqmanage_Qlib"
				});
				//if (res && res > 0) {
				// reload temp data
				if (idFromURL && idFromURL > 0) {
					pullgetRFQManageFind(idFromURL);
					setValue(5);
					setLoading(false)
				}

				//}
			});
		} else {
			setValue(5);
		}
	};
	//to fetch master data alias list data
	useEffect(() => {

		if (atoken, customerid) {
			PullPurchaseOrgAll();
			PullUserDesignation();
			pullUOMMasterList();

		}

	}, [atoken, customerid]);


	useEffect(() => {

		const data = queryParams.get("CommId")?.trim();
		if (data) {
			dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
		}

		const pullMessageList = async () => {

			var data = {
				CustomerId: customerid,
				EventType: "RFI",
				EventId: pageSlug
			};
			const queryParams = buildQueryParams(data)
			const res = await apiClient.getres(`api/Communication/Find?${queryParams}`, atoken)

			if (res) {
				const data = res?.data?.result ?? []

				dispatch({ type: actionTypes.SET_Notificationlist, value: data });
			}


		}

		if (pageSlug) {
			pullMessageList()
		}




	}, []);
	useEffect(() => {

		if (formik.values.purchOrgId?.id) {
			PullPurchaseGroupAll(formik.values.purchOrgId?.id);
		}
	}, [formik.values.purchOrgId]);

	useEffect(() => {

		if (formik.values.purchGrpId) {
			getStageRefreshonPurchGroup();
		}
	}, [formik.values.purchGrpId]);

	useEffect(() => {

		pullgetCurrency();
	}, [atoken]);



	const { pageSlug, supplierid } = useParams();
	const [activityId, setActvityId] = useState(0);
	const [stageValue, setStageValue] = useState('');
	const [actionType, setActionType] = useState("");

	useEffect(() => {

		const params = new URLSearchParams(searchParams);
		const actionType = params.get("ActionType");
		const ActivityId = params.get("ActivityId");
		const StageValue = params.get("Stage");
		setActionType(actionType);

		if (actionType == "approval" && StageValue != "Under Pre Approval") {
			tabReport()
		}
		setActvityId(ActivityId ?? 0);
		setStageValue(StageValue ?? '');
		const newIdFromURL = pageSlug;
		//#eventid and eventtype
		dispatch({ type: actionTypes.SET_EVENTID, value: newIdFromURL ?? 0 });
		dispatch({ type: actionTypes.SET_EVENTTYPE, value: "RFI" });

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

		if (idFromURL && idFromURL > 0) {
			pullgetRFQManageFind(idFromURL);
		}
	}, [idFromURL, purchaseAllList, purchaseGroupAllList, location]);



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






			
			

			formik.handleSubmit();
		}
		// if (value == 2) {
		// 	if (rfqItemsList?.length < 1) {
		// 		toast.error("please add items to continue", {
		// 			toastId: "additems_error"
		// 		});
		// 		return;
		// 	}
		// 	setValue(3);
		// }
		// if (value == 3) {
		// 	//saveRFQCommLibraryAdd();

		// 	const res = await EventCommercialScreenRef?.current?.saveRFQCommercialLibrary();
		// 	if (res) {
		// 		setValue(4);
		// 	}
		// }
		if (value == 4) {
			const res = await EventQuestionScreenRef?.current?.saveEventQuestion();
			if (res) {
				setValue(5);
			}
			//saveRFQQuestionLibAdd();
		}

		if (value == 5) {
			saveSelectedSuppliers();
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
					navigate(`/configuration/manage-rfi`);
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
		//to check if workflow is required for particular stage
		const isStageRequired = stagelist?.filter((x) => x.wfname)
		for (const stage of isStageRequired) {
			const matchingWorkflow = approverInWorkflow.find(workflow => workflow.stage === stage.wfname);
			if (matchingWorkflow && matchingWorkflow.approvers.length == 0) {
				toast.info(`The stage workflow "${stage.wfname}" has no approvers.`);
				return false
			}
		}
		return true
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

		if (formik.values.endDate < currentDate) {
			toast.error("End date cannot be before the current date.", {
				toastId: "rfqenddate"
			});

			setValue(1)
			formik.handleSubmit()
			return false;
		}

		if (formik.values.startDate > formik.values.endDate) {
			toast.error("Start date cannot be after end date.", {
				toastId: "rfqenddate2"
			});
			setValue(1)
			return false;
		}

		// if (rfqItemsList?.length < 1) {
		// 	toast.error(`select atleast one item`, {
		// 		toastId: "supp_fail"
		// 	})
		// 	setValue(2)
		// 	return false;
		// }
		if (selectedSupplier?.length < 1) {
			toast.error(`select atleast one supplier`, {
				toastId: "supp_fail"
			})
			setValue(5)
			return false;
		}




		return true;
	}

	const handleRFQSubmit = async () => {
		setLoading(true)
		const isSubmit = handleErrorRFQSubmit();
		const isApprovers = checkApprovers();
		// if (!isSubmit) {
		// 	return;
		// }
		// if (!isApprovers) {
		// 	return;
		// }

		if (!isSubmit || !isApprovers) {
			setLoading(false);
			return;
		}

		

		const data = {
			activityId: activityId,
			RFQId:parseInt(idFromURL),
			CustomerId:customerid
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
		const enddate = formik.values.endDate.toISOString();
		const selectedsupp = InvitedSupplierModal(
			selectedSupplier,
			parseInt(idFromURL),
			enddate,
			parseInt(customerid)
		);

		const invitedSuppliers = {
			rfqVendorDetails: selectedsupp,
			activityId: parseInt(activityId),
			
		};

		const ressupp = await apiClient.postres(
			`/api/RFQVendorInvite/${idFromURL}/Add`,
			invitedSuppliers,
			atoken
		);

		if (!ressupp) {
			toast.error(" supplier not added successfully")
			return;
		}
		const res = await apiClient.postres(
			`/api/RFQManage/RFQSubmit`,
			datapayload,
			atoken
		);

		if (res) {
			toast.success("RFI Submitted Successfully", {
				toastId: "submit_error"
			});
			navigate(`/configuration/manage-rfi`);
		}
		setLoading(false);
	};

	useEffect(() => {

		if (
			(value == 1 || value == 6) &&
			idFromURL &&
			tempDataEditData &&
			tempDataEditData?.length > 0
		) {
			pullRFQItemServiceFind(idFromURL);
			pullLibraryOrgEntityFind();
			pullLibraryOrgEntityFindQues();
			getTotalSupplier();
		}
	}, [idFromURL, tempDataEditData, value]);
	const [tabloading, setTabLoading] = useState(false)
	useEffect(() => {

		// if (value == 2 && idFromURL) {
		// 	pullRFQItemServiceFind(idFromURL);
		// }
		// if (value == 3) {
		// 	pullLibraryOrgEntityFind();
		// }
		if (value == 4) {
			pullLibraryOrgEntityFindQues();
		}
		if (value == 5) {


			getTotalSupplier();
			getCategorylist();
		}
	}, [idFromURL, value]);


	//tab2

	

	const fastapiclient = new FastApiClient();


	const handleItemsUpload=async (file)=>{
		
		const data ={
			templateId :3,
			customerId :1,
			flagName :"RFQId",
			flagId :idFromURL,
			file:file
		}
		const host = window.location.host;      // buyer.pe.com
		const cleanHost = host.split(":")[0];   // remove port
		const tenant = cleanHost.split(".")[0];
		 const response = await fastapiclient.postresmultipart(`bulk-upload/excel-upload`,data, tenant)
		 if(response){
			
            const errorDetails = response.data?.error_details;
			if (Array.isArray(errorDetails) && errorDetails.length > 0) {
								const allErrors = errorDetails.join("\n");
								toast.error(`Errors encountered:\n${allErrors}`, { autoClose: false });
							}
			else {
								pullRFQItemServiceFind(idFromURL)
								toast.success("File uploaded successfully");
							}
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			
		 }
	}

	
	const downloadItemsExcel = async () => {
		await downloadExcelTemplate({
			customerId: customerid,
			templateId: 3,
			fileName: `RFI_template_${new Date().getTime()}.xlsx`,
			eventType: "RFI"
		});
	}
	
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [categoryList, setCategoryList] = useState([]);
	const getCategorylist = async () => {
		const res = await apiClient.getres(
			`/api/managevendors/${customerid}/categories`,
			atoken
		);
		if (res) {
			setCategoryList(res?.data);
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

			const ids = tempDataEditData[0].rfqVendorInvited.map((item) => item.vendorId);
			const contactids = tempDataEditData[0].rfqVendorInvited.map((item) => item.contactId);

			setttingSelectedSupplier(ids, true, res?.data, tempDataEditData[0].rfqVendorInvited, contactids);
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
			if (contactids.includes(supplier.contactId)) {
				const selectedVendor = selectedVendors?.find(v => v.contactId === supplier?.contactId);
				return { ...supplier, isSelected: value, rfqLoadingFactor: selectedVendor?.rfqLoadingFactor };
			}
			return supplier;
		});

		setTotalSupplier(updatedSuppliers);

		const selectedList = updatedSuppliers?.filter(
			(supplier) => supplier.isSelected
		);

		setSelectedSupplier(selectedList);
	};

	const [selectedSupplier, setSelectedSupplier] = useState([]);
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
				VendorId: x.id
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
		const selectedList = list?.filter((s) => s.isSelected == true);
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
			parseInt(customerid)
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
			setSelectedMenuItem("Submit")
			toast.success(`Suppliers saved successfully`, {
				toastId: "supplierinvitation_succ"
			});

		}
	};

	//loading factor code start
	const [storeVId, setStoreVId] = useState('');
	const [factorDesc, setFactorDesc] = useState('');
	const [loadingOn, setLoadingOn] = useState('');

	const queryParams = new URLSearchParams(location.search);
	const [factorType, setFactorType] = useState('');
	const [factorPerc, setFactorPerc] = useState(0);
	const [loadingAmount, setLoadingAmount] = useState(0);
	const [loadingFactors, setLoadingFactors] = useState([]);
	//console.log("loadingFactors::", loadingFactors)
	const [editIndex, setEditIndex] = useState(null);
	const [filteredLoadingFactors, setFilteredLoadingFactors] = useState([]);
	//console.log("filteredLoadingFactors::", filteredLoadingFactors)
	const [errors, setErrors] = useState({});


	const [approvershow, setApproverShow] = useState(true)
	const handleApprover = (booleanvalue) => {
		setApproverShow(booleanvalue)
	}



	const validationSchemaloading = yup.object({
		factorDesc: yup.string()
			.required('Reason of Loading Factor is required'),
		factorType: yup.string()
			.required('Loading Type is required'),
		// loadingOn: yup.string()
		// 	.required('Loading On is required')
	});



	const handleLoadingFactorClick = (vendor, index) => {

		const vendorId = vendor?.id;
		setStoreVId(vendorId);

		// Find all entries for the vendor in the rfqVendorInvited array
		//const vendorDataArray = tempDataEditData?.[0]?.rfqVendorInvited?.filter(v => v.vendorId === vendorId);


		//abheedev correction in handling loading factor
		const vendorDataArray = selectedSupplier?.filter(v => v.vendorId === vendorId);



		// Flatten the rfqLoadingFactor arrays from all found vendor entries
		let vendorLoadingFactors = vendorDataArray?.flatMap(vendorData => vendorData.rfqLoadingFactor) || [];
		if (!vendorLoadingFactors[0]) {
			vendorLoadingFactors = []
		}


		// Merge and remove duplicates by checking the factorId (or another unique key)
		const combinedLoadingFactors = [
			...vendorLoadingFactors,
			...loadingFactors?.filter(factor => factor.vendorId === vendorId)
		]?.filter((factor, index, self) =>
			index === self.findIndex((f) => (
				f.factorId === factor.factorId
			))
		);

		// Log the combined loading factors to verify the result before setting state
		//console.log("Combined Loading Factors After Merge:", combinedLoadingFactors);

		setFilteredLoadingFactors(vendorLoadingFactors);
		setFactorDesc('');
		setFactorType('');
		setLoadingOn('');
		setFactorPerc(0);
		setLoadingAmount(0);
		setErrors({});
		// Open the modal
		setLoadingModal(true);
	};

	const validateForm = (values) => {
		try {
			validationSchemaloading.validateSync(values, { abortEarly: false });
			return null; // No errors
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
			//factorPerc,
			...(factorType === 'A' ? { loadingAmount } : { factorPerc }),
			loadingOn
		};
		const validationErrors = validateForm(formValues);
		if (validationErrors) {
			setErrors(validationErrors);
			setLoadingUpdateBtn(false)
			return; // Stop further processing if there are validation errors
		}

		const newLoadingFactor = {
			rfqId: parseInt(idFromURL),
			version: 0,
			customerId: customerid,
			vendorId: storeVId,
			factorDesc: factorDesc,
			factorType: factorType,
			//factorPerc: parseFloat(factorPerc),
			...(factorType === 'A' ? { loadingAmount: parseFloat(loadingAmount) } : { factorPerc: parseFloat(factorPerc) }),
			loadingOn: "RFQ",
		};

		let updatedLoadingFactors;

		if (editIndex !== null) {
			updatedLoadingFactors = [...filteredLoadingFactors];
			updatedLoadingFactors[editIndex] = newLoadingFactor;
			setEditIndex(null); // Reset edit index after update
		} else {
			updatedLoadingFactors = [...filteredLoadingFactors, newLoadingFactor];
		}

		setLoadingFactors(updatedLoadingFactors);

		// Filter and update the factors for the current vendor
		const vendorLoadingFactors = updatedLoadingFactors?.filter(factor => factor.vendorId === storeVId);
		setFilteredLoadingFactors(vendorLoadingFactors);

		//for updating rfqloadingfactor into supplier
		const updatedSuppliers = selectedSupplier.map((supplier) => {
			if (supplier.id === storeVId) {
				const existingFactors = supplier.rfqLoadingFactor || [];
				if (editIndex !== null) {
					// Update the specific factor if in edit mode
					existingFactors[editIndex] = newLoadingFactor;
				} else {
					// Add a new loading factor
					existingFactors.push(newLoadingFactor);
				}
				return { ...supplier, rfqLoadingFactor: existingFactors };
			}
			return supplier;
		});

		setSelectedSupplier(updatedSuppliers);

		// Clear the form fields after adding or editing
		setFactorDesc('');
		setFactorType('');
		setFactorPerc(0);
		setLoadingOn('');
		setLoadingAmount('');
		setErrors({});
		setLoadingUpdateBtn(true)
	};

	const handleDeleteLoadingFactor = (index) => {
		// Remove the loading factor at the specified index
		const updatedLoadingFactors = filteredLoadingFactors?.filter((_, i) => i !== index);
		setLoadingFactors(updatedLoadingFactors);

		// Update the filtered loading factors for the currently selected vendor
		const vendorLoadingFactors = updatedLoadingFactors?.filter(factor => factor.vendorId === storeVId);
		setFilteredLoadingFactors(vendorLoadingFactors);

		const updatedSuppliers = selectedSupplier.map((supplier) => {
			if (supplier.id === storeVId) {
				// Initialize rfqLoadingFactor to an empty array if it is undefined
				const existingFactors = supplier.rfqLoadingFactor || [];
				// Filter out the loading factor at the specified index
				const updatedFactors = existingFactors?.filter((_, i) => i !== index);
				return { ...supplier, rfqLoadingFactor: updatedFactors };
			}
			return supplier;
		});

		setSelectedSupplier(updatedSuppliers);
	};
	const [loadingupdatebtn, setLoadingUpdateBtn] = useState(false)
	const handleEditLoadingFactor = (index) => {
		setLoadingUpdateBtn(true)
		// Check if loadingFactors array is defined and has the requested index
		if (filteredLoadingFactors && filteredLoadingFactors.length > index) {
			const factor = filteredLoadingFactors[index];
			setFactorDesc(factor.factorDesc || '');
			setFactorType(factor.factorType || '');
			//setFactorPerc(factor.factorPerc || 0);
			if (factor.factorType === 'A') {
				setLoadingAmount(factor.loadingAmount || 0); // Set loadingAmount for Absolute type
			} else {
				setFactorPerc(factor.factorPerc || 0); // Set factorPerc for Percentage type
			}
			setLoadingOn(factor.loadingOn || '');
			setEditIndex(index);
		} else if (tempDataEditData && tempDataEditData[0]?.rfqVendorInvited) {
			// Handle case when loading factors are coming from tempDataEditData
			const vendorData = tempDataEditData[0].rfqVendorInvited.find(v => v.vendorId === storeVId);
			if (vendorData && vendorData.rfqLoadingFactor && vendorData.rfqLoadingFactor.length > index) {
				const factor = vendorData.rfqLoadingFactor[index];
				setFactorDesc(factor.factorDesc || '');
				setFactorType(factor.factorType || '');
				setFactorPerc(factor.factorPerc || 0);
				setLoadingOn(factor.loadingOn || '');
				setEditIndex(index);
			}
		}
	};

	//loading factor code end

	const validationSchemaApprover = yup.object().shape({
		status: yup.string().required("status is required"),
		approveComment: yup.string().when('status', {
			is: 'Rejected',
			then: (schema) => schema.required("Reason is required for rejection"),
			otherwise: (schema) => schema.notRequired()
		})
	});
	const formik_ApproveReject = useFormik({
	enableReinitialize: true,
	initialValues: {
		rfqId: parseInt(idFromURL),
		status: stageValue === "Forwarded" ? "Forwarded" : "Approved",
		approveComment: "",
		activityId: parseInt(activityId),
		startDate: null,
		endDate: null
	},
	validationSchema: validationSchemaApprover,
	onSubmit: async (values) => {
		setLoading(true);

		// no need to send startdate and enddate in other case
		delete values?.startDate;
		delete values?.endDate;

		// FORWARDED CASE
		if (stageValue === "Forwarded") {
			const datapayload = getPayloadWithStage(
				"currentStage",
				stageValue,
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
				toast.success("RFQ Forwarded successfully", {
					toastId: "supplierforword_suc"
				});
				navigate("/app");
			}
			return;
		}

		// APPROVAL CASES
		const stageInfo = getStageInfo(currentStage, stagelist);

		const actionData = {
			customerId: parseInt(customerid),
			eventId: parseInt(idFromURL),
			eventType: "RFI",
			stageId: stageInfo?.currentStageId,
			IsApproved: values?.status === "Approved",
			activityId: parseInt(activityId),
			remarks: values?.approveComment,
			vendorId: supplierid ?? 0
		};

		const res = await apiClient.postres(
			`/api/ApprovalAction/ApprovalAction`,
			actionData,
			atoken
		);

		if (res) {
			toast.success("Action Taken Successfully", {
				toastId:
					stageValue === "Technical Approval"
						? "supplieraction_error"
						: stageValue === "Commercial Approval"
						? "supplierevent_error"
						: "supplierevent_error"
			});
			navigate("/app");
		}
	}
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

	//to update purchOrgId
	useEffect(() => {

		if (purchaseAllList && purchaseAllList.length > 0 && OrgId) {

			const updatedvalue = findObjByValueFromArray(purchaseAllList, OrgId, 'id')
			//console.log(purchaseAllList, OrgId, updatedvalue)
			formik.setFieldValue("purchOrgId", updatedvalue);
		}

		//to set default purchase group when purchase group length is 1 
		if (!idFromURL && purchaseAllList.length == 1) {
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

	}, [OrgGroupId, purchaseGroupAllList])


	useEffect(() => {

		handlePaginationSS();
		setTotalPageSS(Math.ceil(selectedSupplier?.length / pageCount));
	}, [pageSS, selectedSupplier]);




	//stage handling
	useEffect(() => {

		let urlparams = {};
		if (idFromURL) {

			urlparams = {
				EventType: "RFI",
				CustomerId: customerid,
				EventId: idFromURL,
				OrgId: formik.values.purchOrgId?.id,
				OrgGroupId: formik.values.purchGrpId?.id
			}

			getEventStages(urlparams);

		}
		else {
			urlparams = {
				EventType: "RFI",
				CustomerId: customerid,
				EventId: 0,
				OrgId: 0,
				OrgGroupId: 0
			}
			getEventStages(urlparams);
		}





	}, [formik.values.purchOrgId, formik.values.purchGrpId, idFromURL]);




	const getEventStages = async (urlparams) => {


		const queryParams = buildQueryParams(urlparams)
		const res = await apiClient.getres(`api/EventStage/EventStageFind?${queryParams}`, atoken);
		if (res?.data?.result.length > 0) {

			setStageList(res?.data?.result);
			const stagesarray = res?.data?.result?.map((item) => item.currentStage);

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
			// case 'item':
			// 	return setValue(2);
			case 'question':
				return setValue(4);
			case 'report':
				return tabReport();

			default:
				return '';
		}
	};

	const tabReport=()=>{
		setValue(6)
		//setTabShow(false)
		
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

	const handleClick = (event) => {
		// Handle the main button click
	};

	const handleMenuClick = (item) => {

		setSelectedMenuItem(item);
		setAnchorEl(null); // Close the menu after selection
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
	const handleMenuClose = () => {
		setAnchorEl(null);
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
			"eventType": "RFI",
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
				})
				return
			}

			if (selectedAction == "Surrogate RFQ") {
				const payload = {
					"name": values?.name,
					"vendorId": values?.supplier?.vendorId,
					"email": values?.email,
					"rfqId": pageSlug,
					"reason": values?.Reason,
					"stages": {
						"eventType": "RFI",
						"currentStage": "Surrogate",
						"nextStage": "Surrogate",
						"orgId": 0,
						"orgGroupId": 0
					}
				}

				const res = await apiClient.postres(`/api/RFQManage/RFQSurrogate`, payload, atoken)
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
				const rfqVendorDetails = {
					"rfqId": pageSlug,
					"emailId": v?.email,
					"remarks": values?.Reason,
					"vendorId": v?.vendorId,
					"contactId": v?.contactId,
					"customerId": customerid,
					"version": v?.lastVersion
				}

				const payload = {
					"rfqVendorDetails": [rfqVendorDetails],
					"supplierActionType": "Reminder",

				}
				const res = await apiClient.postres(`/api/RFQManage/${pageSlug}/RFQInvitationVersion`, payload, atoken)
				if (res) {
					setState({ ...state, ["surrogateDrawer"]: false })
					toast.success(`Reminder sent successfully`, {
						toastId: "surrogatetoast"
					})
					formik_Action.resetForm();
					return;

				}

			}

			else if (selectedAction == "Reopen Quotes") {

				const v = values?.supplier;
				const rfqVendorDetails = {
					"rfqId": pageSlug,
					"emailId": v?.email,
					"remarks": values?.Reason,
					"vendorId": v?.vendorId,
					"contactId": v?.contactId,
					"customerId": customerid,
					"version": v?.lastVersion
				}
				const payload = {
					"rfqVendorDetails": [rfqVendorDetails],
					"supplierActionType": "ReOpen",

				}
				const res = await apiClient.postres(`/api/RFQManage/${pageSlug}/RFQInvitationVersion`, payload, atoken)
				if (res) {
					setState({ ...state, ["surrogateDrawer"]: false })
					toast.success(`Quotes reopened successfully`, {
						toastId: "surrogatetoasts"
					})
					formik_Action.resetForm();
					return;

				}

			}





		},
	});

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
			status: "Draft",
			subject: formik?.values?.subject,
			description: formik?.values?.description
		}

		const res = await apiClient.postres(`/api/RFQManage/Update`, payload, atoken)

		if (res) {
			setCurrentStage("Draft")
			setValue(1)
			setApproverShow(true)
			handleCloseEventUpdate(false)
			return true
		}
		return false

	}, [formik])

	//
	const [confirmEventUpdate, setConfirmEventUpdate] = useState(false);
	const [confirmClearAllItems, setConfirmClearAllItems] = useState(false)
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
		navigate(`/configuration/manage-rfi`);

	}
	const handleButtonGroup = () => {

		switch (selectedMenuItem) {
			case "Submit":
				return handleRFQSubmit()
			case "Save & Continue":
				return handleSaveContinue()
			case "Save as Draft":
				return handleSaveasDraft()
			// case "Save Suppliers":
			// 	return handleSaveContinue()
			case "Save as Templates":
				return handleClickOpen()
			case "Cancel":
				return handleCancel()
			default:
				return ""
		}

	}

	const handleTab = (booleanvalue) => {

		//setTabShow(booleanvalue)

		if (booleanvalue) {
			setValue(1)
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

		if (filteredLoadingFactors.length < 1) {
			return
		}

		const res = await apiClient.postres(`/api/RFQManage/${idFromURL}/RFQLoadingFactor`, filteredLoadingFactors, atoken)
		if (res) {
			toast.success("loading Factor updated successfully", {
				toastId: "loading_factor_update"
			})
			setLoadingUpdateBtn(false)
			setLoadingModal(false)
		}

	}







	return (
		<>
			<div className="container-fluid penavbar">
				<div className="row">
					<div className="col-12 col-md-12 col-lg-12 p-0">
						<div className="d-md-flex justify-content-between align-items-center bg-white p-2 border-bottom">
							<BackButton title={idFromURL ? `RFI | ${idFromURL}` : `Request For Information`} modal={currentStage=="Draft"?true:false} />
							<div className="col-md-6" style={{ marginRight: "5rem" }}>
								<MemoizedEventStageFlow
									stagelist={stagelist}
									currentStage={currentStage}
								/>
							</div>
							<div>
								<div className="text-center d-flex ">

									{!loading ? (
										actionType && activityId ? (
											<Button type="button" size="small" className="p-2 pt-1 pb-1 me-2" variant="contained" onClick={toggleDrawer("openInvoiceApproved", true)}>
												<span className="text-capitalize">Action</span>
											</Button>
										) : (
											(
												<>

													{<ButtonGroup variant="contained">
														<Button
															variant="contained"
															className="p-2 pt-1 pb-1 "
															onClick={handleButtonGroup}
															// disabled={!stagearray.includes(currentStage) && (selectedMenuItem != "Cancel" && selectedMenuItem != "Save as Templates")}
															disabled={!stagearray.includes(currentStage)}
														>
															<span className="text-capitalize">{selectedMenuItem}</span>
														</Button>


														<>
															<Button
																variant="contained"
																className={`p-2 pt-1 pb-1  ${!stagearray.includes(currentStage) ? 'dropBtn' : ''}`}
																onClick={handleMenuOpen}
															>
																<ExpandMore />
															</Button>
															<Menu
																anchorEl={anchorEl}
																open={Boolean(anchorEl)}
																onClose={handleMenuClose}
															>
																{value == "7" && <MenuItem onClick={() => handleMenuClick('Submit')}>
																	<div

																	>
																		<span className="text-capitalize"
																			// onClick={handleRFQSubmit}
																			disabled={!stagearray.includes(currentStage) || selectedSupplier.length < 1}>Submit</span>
																	</div>
																</MenuItem>}
																{value != "7" && <MenuItem onClick={() => handleMenuClick('Save & Continue')}>
																	<div

																	>
																		<span className="text-capitalize"
																			//   onClick={handleSaveContinue}
																			disabled={!stagearray.includes(currentStage) || selectedSupplier.length < 1}>{value == 5 ? "Save Suppliers" : "Save & Continue"}</span>
																	</div>
																</MenuItem>}
																{stagearray.includes(currentStage) && <MenuItem onClick={() => handleMenuClick('Save as Draft')}>
																	<div

																	>
																		<span className="text-capitalize"
																		//   onClick={handleSaveContinue}
																		>Save as Draft</span>
																	</div>
																</MenuItem>}
																{idFromURL && <MenuItem onClick={() => handleMenuClick('Save as Templates')}>
																	<div

																	>
																		<span className="text-capitalize"
																		//   onClick={handleSaveContinue}
																		>Save as Templates</span>
																	</div>
																</MenuItem>}
																<MenuItem onClick={() => handleMenuClick('Cancel')} disabled={!pageSlug}>
																	<div

																	>
																		<span className="text-capitalize"
																		>Cancel</span>
																	</div>
																</MenuItem>

															</Menu>
														</>

													</ButtonGroup>}

												</>
											)
										)
									) : (

										<Button>
											{value == 6 ? "Submit..." : "Save & Continue..."}
											{/* <span className="text-capitalize">Save & Continue...</span> */}
										</Button>
									)}


									{idFromURL && <HistoryCell />}
									<AttachmentWorkFlow
										eventtype={`RFI`}
										eventid={idFromURL}
										action={stagearray.includes(currentStage)}
										handleattachmentforevent={handleattachmentforevent}
									/>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="container-fluid mt-8">
				<div className="row">
					<div className={ "col-12 col-md-7 col-lg-12 p-0 "}>
						<div className="d-flex flex-column ">

							<div className="flex-grow-1 bg-white m-2 rounded">
								<div className={tabshow ? "m-2  rounded d-flex align-items-baseline justify-content-between " : "d-none "}>
									<div className="d-flex align-items-baseline">
										{/* {value==6 &&  <Tooltip title="Show/Hide Tabs">
																					<IconButton
																						onClick={() => handleTab(!tabshow)}
																						size="small"
																						edge="start"
																						className="pointer "
																					>
																						<div className="tabExpand">
																							{!tabshow ? <KeyboardDoubleArrowRight className='f15 text-primary' /> : <KeyboardDoubleArrowLeft className='f15 text-primary' />}
										 
																						</div>
																					</IconButton>
										 
																				</Tooltip>} */}
										<div >
											{(
												<Box
													sx={{
														flexGrow: 1,
														maxWidth: { xs: 280, sm: 480, md: "100%" },
													}}
												>
													<Tabs
														value={value}
														onChange={handleChange}
														textColor="primary"
														className="tabstheme"
														indicatorColor="primary"
														variant={"scrollable"}
														allowScrollButtonsMobile
													>
														{<Tab value={1} label="General" />}
														{/* {<Tab value={2} label="Items/Services" disabled={!idFromURL} />}

														{<Tab value={3} label="Commercial Terms" disabled={!idFromURL} />} */}
														{ currentStage.trim() == "Draft" &&<Tab value={4} label="Questions" disabled={!idFromURL} />}
														{<Tab value={5} label="Suppliers" disabled={!idFromURL} />}


														{idFromURL && currentStage.trim() == "Draft" && <Tab value={7} label="Preview" disabled={!rfqpreview} />}
														{idFromURL && !(currentStage.trim() == "Under Pre Approval" || currentStage.trim() == "Draft") && <Tab value={6} label="Questions response" disabled={!idFromURL} />}
														{/* {(currentStage.trim() !="Under Pre Approval") && <Tab value={6} label="Report" disabled={!idFromURL} />} */}
														{/* {idFromURL && currentStage.trim() !== "Under Pre Approval" && currentStage.trim() !== "Draft" && (
															<Tab value={8} label="Queries" disabled={!idFromURL} />
														)} */}
													</Tabs>
												</Box>
											)}

										</div>


									</div>

									<div className="approverPlaceNew d-flex align-items-center">
										{!stagearray.includes(currentStage) && <RFQActionDrawer
											rfqid={idFromURL}
											categoryList={categoryList}
											selectedsupplier={selectedSupplier}
											enddate={formik?.values?.endDate?.toISOString()}
											activityId={activityId}
											handleDraftEvent={handleDraftEvent}
											rfqtype={formik?.values?.RFQType}
											EventHeaderDetails={EventHeaderDetails}
										/>}

										{/* <Tooltip title="Show/Hide Approvers">
											<IconButton
												onClick={() => handleApprover(!approvershow)}
												size="small"
												edge="start"
												className="pointer mt-1"
											>
												<div className={` ${approvershow ? 'approver' : 'approverCollapsed'}`}>
													{!approvershow ? <div className='sideSearch shadow-sm'> Approvers
													</div> : <PushPinOutlined className='f15 text-primary' />}

												</div>
											</IconButton>

										</Tooltip> */}

									</div>
								</div>

								{(value == 1 && stagearray.includes(currentStage)) && (
									<>
										{accessLevel?.find(x => x.claimType == "General")?.claimValue?.Read != "N" ?
											(
												<>
													<div className="">
														<div className="p-3 ps-2 pe-0 custom-fix">
															<form
																onSubmit={formik.handleSubmit}
																autoComplete="off"
															>
																<div className="row mt-2  mb-4">

																	<div className="col-12 mb-3">
																		<TextFieldCell
																			id="subject"
																			name="subject"
																			label="Subject *"
																			placeholder=""
																			maxLength={200}
																			value={formik.values.subject}
																			onChange={formik.handleChange}
																			error={
																				formik.touched.subject &&
																				Boolean(formik.errors.subject)
																			}
																			helperText={
																				formik.touched.subject &&
																				formik.errors.subject
																			}
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
																	</div>

																	<div className="col-12 mb-1">
																		<div className="f12 text-muted mb-1">
																			Description *
																		</div>
																		<ReactQuill
																			id="descriptionquill"
																			theme="snow"
																			preserveWhitespace
																			className=""
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

																		{formik.values.description && extractTextFromHTML(formik.values.description).length > 0 && (
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
{/* 
																	<div className="col-12 col-md-4 col-lg-4 mt-4 mb-2">
																		<Autocomplete
																			id="requisitioner"
																			name="requisitioner"
																			size="small"
																			className="w-100 f14"
																			options={requisitionerList ? requisitionerList.map(item => item.name) : []}  // Map the name field
																			getOptionLabel={(option) => option} // Since we're passing names directly, this is fine
																			value={formik.values.requisitioner}
																			onChange={(event, value) => {
																				if (value === 'None') {
																					formik.setFieldValue('requisitioner', ''); // Clear the selection
																				} else {
																					formik.setFieldValue('requisitioner', value);
																				}
																			}}
																			renderInput={(params) => (
																				<TextField
																					{...params}
																					label="Requisitioner"
																					variant="outlined"
																					error={formik.touched.requisitioner && Boolean(formik.errors.requisitioner)}
																					helperText={formik.touched.requisitioner && formik.errors.requisitioner}
																				/>
																			)}
																		/>
																	</div> */}


																	<LocalizationProvider
																		dateAdapter={AdapterDayjs}
																	>
																		<div className="col-12 col-md-6 col-lg-4 mt-4 mb-2">
																			<MobileDateTimePicker
																				variant="outlined"
																				label="Start Date/Time "
																				size="small"
																				name="startDate"
																				id="startDate"
																				timezone={userDetail?.timeZone}
																			  minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																				
																				// minTime={new Date()}
																				value={formik.values.startDate || null}
																				className="w-100 f14"
																				slotProps={{
																					textField: {
																						variant: "outlined",
																						size: "small",
																						InputLabelProps: { shrink: true },
																						error:
																							formik.touched.startDate &&
																							Boolean(formik.errors.startDate),
																						helperText:
																							formik.touched.startDate &&
																							formik.errors.startDate,
																					},
																					actionBar: {
																						actions: ["clear", "cancel", "accept"],
																					},
																				}}

																				onChange={(newValue) => {

																					formik.setFieldValue(
																						"startDate",
																						newValue
																					);
																				}}
																				format={getDateFormatPatteronLocale(userDetail)}
																				ampm={userampm(userDetail)}

																			/>
																		</div>
																		<div className="col-12 col-md-6 col-lg-4 mt-4">
																			<MobileDateTimePicker
																				variant="outlined"
																				label="End Date/Time *"
																				size="small"
																				name="endDate"
																				id="endDate"
																				timezone={userDetail?.timeZone}
																				minDateTime={dayjs(new Date().toISOString()).tz(userDetail?.timeZone)}
																				// minTime={new Date()}
																				value={formik.values.endDate}
																				className="w-100 f14 mb-4"
																				slotProps={{
																					textField: {
																						variant: "outlined",
																						size: "small",
																						InputLabelProps: { shrink: true },
																						error:
																							formik.touched.endDate &&
																							Boolean(formik.errors.endDate),
																						helperText:
																							formik.touched.endDate &&
																							formik.errors.endDate,
																					},
																					actionBar: {
																						actions: ["clear", "cancel", "accept"],
																					},
																				}}
																				onChange={(newValue) => {
																					formik.setFieldValue("endDate", newValue);
																				}}
																					format={getDateFormatPatteronLocale(userDetail)}
																					ampm={userampm(userDetail)}
																			// format="L hh:mm a"
																			/>
																		</div>
																	</LocalizationProvider>
																
																	{/* <div className="col-12 col-md-6 col-lg-4 mb-3">
																	<FormGroup>
																		<FormControlLabel
																			control={
																				<Checkbox
																					checked={formik.values.boqReq}
																				/>
																			}
																			id="boqReq"
																			label={
																				<span className="f14 muted">
																					BOQ Required
																				</span>
																			}
																			labelPlacement={"end"}
																			name="boqReq"
																			value={formik.values.boqReq}
																			onChange={formik.handleChange}
																		/>
																	</FormGroup>
																</div> */}
																	{/* <div className="col-12 mb-1">
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
																						userDetail?.defaultCurrency
																					);
																				}}
																			>
																				<FormControlLabel
																					value={false}
																					control={<Radio />}
																					label={
																						<span>
																							Base Currency{" "}
																							{userDetail &&
																								userDetail?.defaultCurrency ? (
																								<span className="f12 text-primary">
																									({userDetail?.defaultCurrency})
																								</span>
																							) : (
																								<span className="f12">(INR)</span>
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
																													<Autocomplete
																														id={"baseCurrency" + i}
																														name="baseCurrency"
																														options={currencyList?.filter(cl => cl.currencyNm !== (userDetail?.defaultCurrency || "INR")) || []}
																														getOptionLabel={(option) => option.currencyNm}
																														onChange={(event, value) => handleInputChange({ target: { value: value?.currencyNm, name: "baseCurrency" } }, i)}
																														value={currencyList?.find(cl => cl.currencyNm === x.baseCurrency) || null} // Set the value from the currency list
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
																															<MenuItem {...props} disabled={inputList?.some(item => item.baseCurrency === option.currencyNm)}>
																																{option.currencyNm}
																															</MenuItem>
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
																														// className={`w-100 ${x.currencyConversion <= 0 ? 'invalid-input' : ''}`} 
																														className={`w-100 ${x.baseCurrency && x.currencyConversion <= 0 ? 'invalid-input' : ''}`}
																														required

																														id={`currency-conversion-${i}`} // Ensure unique id for each field
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
																																	1
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
																																			""
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
																	</div> */}
																	<div className="col-12 mb-1">
																		<div className="f12 text-muted mb-1">
																			Terms & Conditions *
																			{/* <span><AttachmentWorkFlow
																			eventtype={`RFQ`}
																			eventid={idFromURL}
																			action={stagearray.includes(currentStage)}
																			handleattachmentforevent={handleattachmentforevent}
																		/></span> */}
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
																		{extractTextFromHTML(formik.values.termandcondition) && extractTextFromHTML(formik.values.termandcondition)?.length !=0 && <div
																			style={{
																				fontSize: "0.8em",
																				color: "grey",
																				textAlign: "end",
																			}}
																		>
																			{`${extractTextFromHTML(formik.values.termandcondition)?.length 
																				}/2000`}{" "}
																			{/* Display character count */}
																		</div>}
																		{formik.touched.termandcondition &&
																			Boolean(formik.errors.termandcondition) ? (
																			<>
																				<FormHelperText className="text-danger">
																					{formik.errors.termandcondition}
																				</FormHelperText>
																			</>
																		) : (
																			<></>
																		)}
																	</div>
																	{/* <div className="col-12 mb-4 d-flex">
																		<div className="col-12 col-md-2 col-lg-2 mt-4">
																			<FormGroup>
																				<FormControlLabel
																					control={
																						<Checkbox
																							checked={formik.values.RFQType === "closed"}
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
																					}}
																				/>
																			</FormGroup>
																		</div>

																		{formik.values.RFQType === "closed" && (
																			<div className="col-12 col-md-6 col-lg-4 mt-4 ms-0 ps-0">
																				<LocalizationProvider dateAdapter={AdapterDateFns}>
																					<MobileDateTimePicker
																						disabled={!(formik.values.RFQType === "closed")}
																						variant="outlined"
																						label={`Bid Open Date/Time`}
																						size="small"
																						name="bidOpeningDate"
																						id="bidOpeningDate"
																						minDate={new Date()}
																						value={formik.values.bidOpeningDate ?? null}
																						className="w-100 f14"
																						slotProps={{
																							textField: {
																								variant: "outlined",
																								size: "small",
																								InputLabelProps: { shrink: true },
																							},
																							actionBar: {
																								actions: ["clear", "cancel", "accept"],
																							},
																						}}
																						onChange={(newValue) => {
																							formik.setFieldValue("bidOpeningDate", newValue);
																						}}
																						format={getDateFormatPatteronLocale("en-GB")}
																					/>
																				</LocalizationProvider>
																			</div>
																		)}
																	</div> */}
																	<div className="mb-4"></div>
																	<div className="mb-4"></div>
																</div>
															</form>
														</div>
													</div>
												</>
											) :
											(
												<>
													<NotFoundPage
														heading={`You Are Not Authorized To View this tab`}
														body1={`contact your Administrator for more details...`}
													/>
												</>
											)}
									</>
								)}
								{(value == 1 && !stagearray.includes(currentStage)) && (
									<>
										{accessLevel?.find(x => x.claimType == "General")?.claimValue?.Read != "N" ? <RFIGeneralPreview formik={formik} inputList={inputList}
											purchaseAllList={purchaseAllList}
											purchaseGroupAllList={purchaseGroupAllList}
										/> : (
											<>
												<NotFoundPage
													heading={`You Are Not Authorized To View this tab`}
													body1={`contact your Administrator for more details...`}
												/>
											</>
										)}

									</>
								)}
								{/* {value == 2 ? (
									<div className="mb-5">
										<div className="p-3 pt-0">
											<div className="">
												<div className="text-end">
													{accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Create != "N" && <Button
														variant="text"
														size="small"
														startIcon={<HiPlusSm />}
														className="text-capitalize font-normal"
														onClick={toggleDrawer("addProductDrawer", true)}
														disabled={!stagearray.includes(currentStage)}
													>
														Add New
													</Button>}
													{rfqItemsList?.length > 0 && accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Create != "N" && (
														<Tooltip title="Clear All">
															<IconButton
																size="small"
																className="ms-2 me-3"
																color="error"
																onClick={() => {
																	setConfirmClearAllItems(true);
																}}
																disabled={!stagearray.includes(currentStage)}
															>
																<HiOutlineX />
															</IconButton>
														</Tooltip>
													)}
													
													{accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Create != "N" && <Dropdown align="end" className="d-inline-block">
														<Dropdown.Toggle
															as="div"
															id="gt"
															className="round-edit remove-tringle"
															role="button"
														>
															<IconButton
																size="medium"
																className="shadow-sm "
																disabled={!stagearray.includes(currentStage)}
															>
																<HiOutlineDotsHorizontal className="f17" />
															</IconButton>
														</Dropdown.Toggle>
														<Dropdown.Menu className="ddl-menu">
															<MenuItem
																className="f14"
																disabled={!stagearray.includes(currentStage)}
															>
																Pull ERP Data
															</MenuItem>
															<MenuItem
																className="f14"
																disabled={!stagearray.includes(currentStage)}
																onClick={() =>
																	document
																		.getElementById('itemuploadid')
																		.click()
																}
															>
																Excel Upload
															</MenuItem>
															<MenuItem
																className="f14"
																onClick={downloadItemsExcel}
															>
																Excel Template
															</MenuItem>
														</Dropdown.Menu>
													</Dropdown>}

												</div>
											</div>
											<div className="">
												{accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Create != "N" && <ProductitemCell
													action={stagearray.includes(currentStage)}
													itemsList={rfqItemsList}
													handleEditItem={handleEditItem}
													handleDeleteItem={handleDeleteItem}
													eventType='RFQ'
												/>}
												{accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Create == "N" && <NotFoundPage
													heading={`You Are Not Authorized To View these page`}
													body1={`contact your Administrator for view rights`}
												/>}
											</div>
										</div>
									</div>
								) : (
									<></>
								)} */}
								{/* {value == 3 ? (
									<>
										{accessLevel?.find(x => x.claimType == "Commercial Terms")?.claimValue?.Create != "N" && <EventCommercialScreen EventType="RFQ" EventId={idFromURL} LibraryType="CommercialLibrary" EventGeneralDetails={formik?.values} ref={EventCommercialScreenRef} Action={true} />}

										{accessLevel?.find(x => x.claimType == "Commercial Terms")?.claimValue?.Create == "N" && <NotFoundPage
											heading={`You Are Not Allowed To View these page`}
											body1={`contact your Administrator for view rights`}
										/>}
									</>

								) : (
									<></>
								)} */}
								{value == 4 ? (
									accessLevel?.find(x => x.claimType == "Questions")?.claimValue?.Create != "N" ? <div className="mb-5">
										{/* <EventQuestionCell
											action={stagearray.includes(currentStage)}
											selectedQuesionArray={selectedQuesionArray}
											handleSelectedQArray={handleSelectedQArray}
											handleSelectedEditQuestion={handleSelectedEditQuestion}
											questionLibraryDll={questionLibraryDll}
											toggleDrawer={toggleDrawerCallback}
											selectedQuesDll={selectedQuesDll}
											setSelectedQuesDll={setSelectedQuesDll}
											updateEventLibraryId={updateEventLibraryId}
										/> */}
										<EventRFIQuestion
											props={{
												eventid: idFromURL,
												eventtype: "RFI",
												librarytype: "QuestionLibrary",
												action: stagearray.includes(currentStage),
												supplierid: supplierid
												
											}}
											ref={EventQuestionScreenRef}
										/>
									</div> : <>
										<NotFoundPage
											heading={`You Are Not Allowed To View these page`}
											body1={`contact your Administrator for view rights`}
										/>
									</>


								) : (
									<></>
								)}
								{value == 5 && currentStage.trim() == "Draft" ? (
									<>

										{tabloading ? <GridSkeleton /> :
											<>
												{accessLevel?.find(x => x.claimType == "Invite Vendor")?.claimValue?.Create != "N" &&
													<div className="p-2 pt-0">
														{currentStage.trim() == "Draft" && <div className="row">
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
																						options={categoryList ?? []}
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
																							option.categoryName ?? ""
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
																							totalSupplier?.filter(
																								(x) => !x.isSelected
																							) ?? []
																						}
																						filterOptions={VendorfilterOptions}
																						getOptionLabel={(option) => ""}
																						renderOption={(
																							props,
																							option,
																							{ selected }
																						) => (
																							<li {...props}>
																								{currentStage == "Draft" && <Checkbox
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

																								handleSelectedSupplier(
																									newvalue,
																									e.target.checked
																								);
																							}
																						}}
																					/>
																				</div>



																			</div>
																		</div>

																	</div>
																</div>
															</div>
														</div>}
														<div className="row mt-3 item-Table">
															{currentStage.trim() == "Draft" &&  <div className="col-12 col-md-12 col-lg-6">
																<div className="bg-white rounded shadow-sm">
																	<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
																		<div className="p-2">
																			<div className="d-flex align-items-center">
																				Total Suppliers{" "}
																				<div className="supplierCount">
																					{
																						totalSupplier?.filter((x) => x.isShow)
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
																			{totalSupplier
																				?.filter((x) => x.isShow)
																				.slice(
																					(pageTS - 1) * pageCount,
																					pageTS * pageCount
																				)
																				.map((x, i) => (
																					<div
																						className="d-flex border-bottom align-items-center m-0 p-1 pt-0 pb-0"
																						key={i}
																					>
																						{!stagearray.includes(currentStage) &&

																							<Tooltip title={x?.contactPerson}>
																								<IconButton
																									size="medium"
																									className="bg-white ms-0 ps-0 pe-0 me-0"

																								>
																									<LiaUserSolid className="f17 text-primary" />
																								</IconButton>
																							</Tooltip>

																						}
																						<div className="flex-grow-1 ms-2 text-truncate">
																							<div className="text-truncate f12">
																								{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}
																							</div>
																						</div>
																						{stagearray.includes(currentStage) && (x?.isSelected == true ? (
																							<Checkbox
																								size="small"
																								checked={x?.isSelected}
																								onChange={(e) =>
																									handleSelectedSupplier(
																										x,
																										e.target.checked
																									)
																								}
																							/>
																						) : (
																							<Checkbox
																								size="small"
																								checked={false}
																								onChange={(e) =>
																									handleSelectedSupplier(
																										x,
																										e.target.checked
																									)
																								}
																							/>
																						))}

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
															</div>}
															<div className={`col-12 col-md-12 ${currentStage.trim() == "Draft"?"col-md-6 col-lg-6":"col-md-12 col-lg-12"} border-start`}>
																<div className="bg-white rounded shadow-sm">
																	<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
																		<div className="p-2">
																			<div className="d-flex align-items-center">
																			{currentStage.trim() == "Draft" ?	`Selected Suppliers`:`Event Suppliers`}{" "}
																				<div className="supplierCount">
																					{selectedSupplier?.length}
																				</div>
																			</div>

																		</div>
																		<div className="">

																			<>
																				{stagearray.includes(currentStage) && <LoadingButton
																					variant="text"
																					size="small"
																					className="me-2 rounded-pill"
																					onClick={clearALLSelectedSupplier}

																				>
																					<span className="text-capitalize">
																						Clear All
																					</span>
																				</LoadingButton>}
																			</>



																			
																		</div>
																	</div>
																	<hr className="m-0" />
																	<div className="row">
																		<div className="col-12">
																			{selectedSupplier
																				.slice(
																					(pageSS - 1) * pageCount,
																					pageSS * pageCount
																				)
																				.map((x, i) => 
																					{
																						
                                                                                        return (
																							<div
																						className="row border-bottom align-items-center m-0 p-1 pt-0 pb-0"
																						key={i}
																					>
																						<div className="col-md-10">
																							<div className="d-flex align-items-center ">
																								{stagearray.includes(currentStage) && (x?.isSelected == true ? (
																									<Checkbox
																										size="small"
																										checked={x?.isSelected}
																										onChange={(e) =>
																											handleSelectedSupplier(
																												x,
																												e.target.checked
																											)
																										}
																									/>
																								) : (
																									<Checkbox
																										size="small"
																										checked={false}
																										onChange={(e) =>
																											handleSelectedSupplier(
																												x,
																												e.target.checked
																											)
																										}
																									/>
																								))}
																								<div className="text-truncate f12">
																									{`${x?.contactPerson} | ${x?.email} | ${x?.companyName}`}
																								</div>
																							</div>
																						</div>
																						<div className="col-md-2 justify-content-end d-flex align-items-center">
																							<div className="col-md-4  d-flex align-items-center justify-content-end">
																								<DropdownButton
																									as={"div"}
																									key={"end7"}
																									id={`myacccmenu`}
																									className="supplieraccmenu "
																									drop={"start"}
																									variant="outlined"
																									style={{
																										backgroundColor: "white",
																										color: "#2182cde",
																									}}
																									title={
																										<Tooltip title={"Action"}>
																											<div
																												style={{
																													fontSize: "0.8125rem",
																													color: "#2A68D3",
																													fontWeight: "500",
																												}}
																											>
																												<HiDotsVertical />{" "}
																											</div>
																										</Tooltip>
																									}
																								>
																									<div className="shadow rounded min-width-200px">


																										<MenuItem className="f12 fw500" onClick={() => handleLoadingFactorClick(x, i)}>
																											Loading Factor
																										</MenuItem>

																										{!stagearray.includes(currentStage) && (
																											<MenuItem className="f12 fw500" onClick={() => handleSupplierAction(x, 'Reopen')}>
																												Re-Open Quote
																											</MenuItem>
																										)}
																										<MenuItem className="f12 fw500" onClick={() => handleSupplierAction(x, 'Reminder')}>
																											Send Reminder
																										</MenuItem>
																										<MenuItem className="f12 fw500" onClick={() => handleSupplierAction(x, 'Surrogate')}>
																											Surrogate Supplier
																										</MenuItem>
																									</div>
																								</DropdownButton>
																								{/* <Tooltip title="Loading Factor">
																						<IconButton
																							size="medium"
																							className="bg-white ms-0 ps-0 pe-0 me-0"
																							// onClick={() => setLoadingModal(true)}
																							onClick={() => handleLoadingFactorClick(x, i)}
																						>
																							<HiOutlineFilter className="f17 text-primary" />
																						</IconButton>
																					</Tooltip> */}
																							</div>

																							{stagearray.includes(currentStage) && <div className="col-md-4">
																								<IconButton
																									size="medium"
																									className="bg-white ms-0 ps-0 pe-0 me-0 pb-1"
																									onClick={() =>
																										clearSelectedSupplier(
																											x?.email,
																											false
																										)
																									}
																								>
																									<HiX className="f17 text-danger" />
																								</IconButton>
																							</div>}
																						</div>
																					</div>
																						)
																					}
																					
																				)}
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
															</div>
														</div>
													</div>}

												{accessLevel?.find(x => x.claimType == "Invite Vendor")?.claimValue?.Create == "N" &&
													<NotFoundPage
														heading={`You Are Not Allowed To View these page`}
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
								 <EventSuppliers
								 
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
								 
								 />
								}


								


								{value == 6 && <ERFIComparative key={"ERFQComparative"} accessLevel={accessLevel} handleTab={handleTab}

									actions={{
										rfqid: idFromURL,
										categoryList: categoryList,
										selectedsupplier: selectedSupplier,
										enddate: formik?.values?.endDate?.toISOString(),
										activityId: activityId,
										handleDraftEvent: handleDraftEvent,
										rfqtype: formik?.values?.RFQType,
										EventHeaderDetails: EventHeaderDetails,
										approvershow: approvershow,
										handleApprover: handleApprover
									}}
								/>}
								{value == 8 &&
									<QueryList
										pageSlug={pageSlug}
										key={"QueryList"}
										accessLevel={accessLevel}
									/>
								}
								{value == 7 && rfqpreview && (
									<div className="custom-fix">
										{accessLevel?.find(x => x.claimType == "General")?.claimValue?.Read != "N" &&
											<>
												<div className="fw600 f18 mb-2" id="generaldetails">
													General Details{" "}
													{stagearray.includes(currentStage) && (
														<IconButton
															size="small"
															className="bg-white"
															onClick={() => handletabEdit(1)}
														>
															<HiPencilAlt className="f17 text-primary" />
														</IconButton>
													)}
												</div>
												<RFIGeneralPreview formik={formik} inputList={inputList}
													purchaseAllList={purchaseAllList}
													purchaseGroupAllList={purchaseGroupAllList}
													customClassName="none"
												/>
											</>
										}

										{/* {accessLevel?.find(x => x.claimType == "Item Service")?.claimValue?.Read != "N" &&

											<>

												<div className="fw600 f18  mb-2" id="itemlist">
													RFQ Items Details{" "}
													{stagearray.includes(currentStage) && (
														<IconButton
															size="small"
															className="bg-white"
															onClick={() => handletabEdit(2)}
														>
															<HiPencilAlt className="f17 text-primary" />
														</IconButton>
													)}
												</div>
												<div className="">
													<ProductitemCell
														action={false}
														itemsList={rfqItemsList}
														handleEditItem={handleEditItem}
														handleDeleteItem={handleDeleteItem}
													/>
												</div>
											</>} */}

										{/* {
											accessLevel?.find(x => x.claimType == "Commercial Terms")?.claimValue?.Read != "N" &&

											<>
												<div
													className="fw600 f18 mt-4 mb-2"
													id="commercialtermprev"
												>
													RFQ Commercial Details
													{stagearray.includes(currentStage) && (
														<IconButton
															size="small"
															className="bg-white"
															onClick={() => handletabEdit(3)}
														>
															<HiPencilAlt className="f17 text-primary" />
														</IconButton>
													)}
												</div>
												<EventCommercialScreen EventType="RFQ" EventId={idFromURL} LibraryType="CommercialLibrary" EventGeneralDetails={formik?.values} ref={EventCommercialScreenRef} Action={false} />
											</>
										} */}

										{accessLevel?.find(x => x.claimType == "Questions")?.claimValue?.Read != "N" &&
											<>
												<div className="fw600 f18 mt-4 mb-2" id="rfqquestionprev">
													Questions
													{stagearray.includes(currentStage) && (
														<IconButton
															size="small"
															className="bg-white"
															onClick={() => handletabEdit(4)}
														>
															<HiPencilAlt className="f17 text-primary" />
														</IconButton>
													)}
												</div>
												<div className="">
													<div className="mb-5">
														{/* <EventQuestionCell
															action={false}
															selectedQuesionArray={selectedQuesionArray}
															handleSelectedQArray={handleSelectedQArray}
															questionLibraryDll={questionLibraryDll}
															toggleDrawer={toggleDrawer}
															selectedQuesDll={selectedQuesDll}
															setSelectedQuesDll={setSelectedQuesDll}
															updateEventLibraryId={updateEventLibraryId}
														/> */}
														<EventRFIQuestion
															props={{
																eventid: idFromURL,
																eventtype: "RFI",
																librarytype: "QuestionLibrary",
																action: false
															}}
															ref={EventQuestionScreenRef}
														/>
													</div>
												</div>
											</>
										}
										{

											accessLevel?.find(x => x.claimType == "Invite Vendor")?.claimValue?.Read != "N" &&
											<>
												<div className="fw600 f18 mt-4" id="invitedsupplierprev">
													Invited Suppliers
													{stagearray.includes(currentStage) && (
														<IconButton
															size="small"
															className="bg-white"
															onClick={() => handletabEdit(5)}
														>
															<HiPencilAlt className="f17 text-primary" />
														</IconButton>
													)}
												</div>
												<div className="row mb-4">
													<div className="col-12 mb-5">
														<SelectedSupplierCell
															selectedsupplier={selectedSupplier}
														/>
													</div>
												</div>
											</>
										}
									</div>
								)}
							</div>
						</div>



					</div>

					{/* {approvershow && <div className="col-12 col-md-5 col-lg-3 border-start p-0">

						<div className="d-flex flex-column min-vh-100">
							<div className="flex-grow-1">
								<div className="row">
									<div className="col-12">

									</div>
								</div>
								<div className="row">
									<div className="col-12 custom-fix">

										{accessLevel?.find(x => x.claimType == "Work Flow")?.claimValue?.Read != "N" && <EventApprovalBox
											requestCell={requestCell}
											handleEventAppList={handleEventAppList}
											wfupdate={wfupdate}
											action={stagearray.includes(currentStage)}
											stagelist={stagelist}
											accessLevel={accessLevel}
										/>}
										{accessLevel?.find(x => x.claimType == "Work Flow")?.claimValue?.Read == "N" && <NotFoundPage body1={`No Approver workflow rights`} />}
									</div>
								</div>
							</div>

						</div>
					</div>} */}
				</div>

			</div>

			<React.Fragment key="topaddProduct">
				<Drawer
					anchor="right"
					open={state["addProductDrawer"]}

				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
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
									handleUomList={handleUomList}
									action={stagearray.includes(currentStage)}
									accesslevel={accessLevel?.itemservice?.created}

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
									libraryId={libraryId}
									questionforedit={questionforedit}
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
												value={`${formik_Action.values.supplier?.contactPerson} | ${formik_Action.values.supplier?.email} | ${formik_Action.values.supplier?.companyName ||formik_Action.values.supplier?.tradeName  }`}

												disabled
											/>
										</div>
										{selectedAction == "Surrogate RFQ" &&
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
											type="submit"
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
														{stageValue != "Forwarded" && menuactionlist.filter(x => x.value != "Forwarded").map((x) => {

															return (<MenuItem value={x.value}>{x.label}</MenuItem>)

														})

														}
														{stageValue == "Forwarded" && menuactionlist.filter(x => x.value == "Forwarded").map((x) => {

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
												{/* {stageValue=="Under Pre Approval" && <LocalizationProvider
													dateAdapter={AdapterDateFns}
												>
													<div className="col-12 col-md-4 col-lg-12 mb-4">
														<MobileDateTimePicker
															variant="outlined"
															label="Start Date/Time "
															size="small"
															name="startDateaction"
															id="startDateaction"
															//minDate={new Date()}
															// minTime={new Date()}
															value={formik_ApproveReject.values.startDate}
															className="w-100 f14"
															slotProps={{
																textField: {
																	variant: "outlined",
																	size: "small",
																	InputLabelProps: { shrink: true },
																	error:
																		formik_ApproveReject.touched.startDate &&
																		Boolean(formik_ApproveReject.errors.startDate),
																	helperText:
																		formik_ApproveReject.touched.startDate &&
																		formik_ApproveReject.errors.startDate,
																},
																actionBar: {
																	actions: ["clear", "cancel", "accept"],
																},
															}}
															onChange={(newValue) => {
																formik_ApproveReject.setFieldValue(
																	"startDate",
																	newValue
																);
															}}
															format={getDateFormatPatteronLocale("en-GB")}
														// format="L hh:mm a"
														/>
													</div>
													<div className="col-12 col-md-4 col-lg-12 mb-4">
														<MobileDateTimePicker
															variant="outlined"
															label="End Date/Time "
															size="small"
															name="endDateaction"
															id="endDateaction"
															//minDate={new Date()}
															// minTime={new Date()}
															value={formik_ApproveReject.values.endDate}
															className="w-100 f14"
															slotProps={{
																textField: {
																	variant: "outlined",
																	size: "small",
																	InputLabelProps: { shrink: true },
																	error:
																		formik_ApproveReject.touched.endDate &&
																		Boolean(formik_ApproveReject.errors.endDate),
																	helperText:
																		formik_ApproveReject.touched.endDate &&
																		formik_ApproveReject.errors.endDate,
																},
																actionBar: {
																	actions: ["clear", "cancel", "accept"],
																},
															}}
															onChange={(newValue) => {
																formik_ApproveReject.setFieldValue(
																	"endDate",
																	newValue
																);
															}}
															format={getDateFormatPatteronLocale("en-GB")}
														// format="L hh:mm a"
														/>
													</div>
																
												</LocalizationProvider>} */}
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
									{/* Remove RadioGroup and FormControlLabel components */}

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
																	onChange={(e) =>
																		handleCurrencyInputChange(e, i)
																	}
																>
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

													{commcurrencyList?.length === 0 && (
														<div className="col-12">
															<Button
																variant="outlined"
																color="primary"
																onClick={handleAddCurrencyClick}
															>
																Add Currency Conversion
															</Button>
														</div>
													)}
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
					<TextField
						autoFocus
						margin="dense"
						label="Enter reason *"
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
			<Modal
				size="lg"
				show={purchaseOrgModal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW CATEGORY"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => ClosePurcgaseOrgModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">

						</div>
					</Modal.Title>
					<IconButton
						onClick={() => ClosePurcgaseOrgModal()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<PurchaseOrg isModal={true} handlepurchaseorgList={handlepurchaseorgList} />
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				size="lg"
				show={loadingModal}
				backdrop="static"
				keyboard={false}
				value={"Loading"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => CloseLoadingModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Loading Factor
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => CloseLoadingModal()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<div className="row">
							<div className="col-md-4">
								<TextField
									id="factorDesc"
									name="factorDesc"
									value={factorDesc}
									label="Reason Of Loading Factor"
									variant="outlined"
									onChange={(e) => {
										setFactorDesc(e?.target?.value)
									}}
									error={!!errors.factorDesc}
									helperText={errors.factorDesc}
									size="small"
								/>
							</div>
							<div className="col-md-4">
								<FormControl fullWidth>
									<InputLabel id="factorType">Loading Type</InputLabel>
									<Select
										labelId="factorType"
										id="factorType"
										name="factorType"
										value={factorType}
										label="Loading Type"
										onChange={(e) => {
											setFactorType(e?.target?.value)
										}}
										error={!!errors.factorType}
										size="small"
									>
										<MenuItem value='A'>Absolute</MenuItem>
										<MenuItem value='P'>Percentage</MenuItem>
									</Select>
									{errors.factorType &&
										<div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
											{errors.factorType}
										</div>
									}

								</FormControl>
							</div>
							<div className="col-md-4">
								{/* <TextField
									id="factorPerc"
									name="factorPerc"
									label=" Loading Factor"
									variant="outlined"
									value={factorPerc}
									onChange={(e) => {
										const value = e?.target?.value;
										const regex = /^[0-9]*\.?[0-9]*$/;
										if (regex.test(value)) {
											setFactorPerc(value);
										}
									}}
								/> */}
								{factorType === 'A' ? (
									<TextField
										id="loadingAmount"
										name="loadingAmount"
										label="Loading Amount"
										variant="outlined"
										value={loadingAmount}
										onChange={(e) => {
											const value = e?.target?.value;
											const regex = /^[0-9]*\.?[0-9]*$/;
											if (regex.test(value)) {
												setLoadingAmount(value);
											}
										}}
										inputProps={{
											maxLength: 5,
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
										size="small"
										error={!!errors.loadingAmount}
										helperText={errors.loadingAmount}
									/>
								) : (
									<TextField
										id="factorPerc"
										name="factorPerc"
										label="Loading Factor"
										variant="outlined"
										value={factorPerc}
										onChange={(e) => {
											const value = e?.target?.value;
											const regex = /^[0-9]*\.?[0-9]*$/;
											if (regex.test(value)) {
												setFactorPerc(value);
											}
										}}
										inputProps={{
											maxLength: 5,
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
										size="small"
										error={!!errors.factorPerc}
										helperText={errors.factorPerc}
									/>
								)}
							</div>
							{/* <div className="col-md-3">
								<FormControl fullWidth>
									<InputLabel id="loadingOn">Loading On</InputLabel>
									<Select
										labelId="loadingOn"
										id="loadingOn"
										name="loadingOn"
										value={loadingOn}
										label="Loading On"
										onChange={(e) => {
											setLoadingOn(e?.target?.value)
										}}
										error={!!errors.loadingOn}

									>
										<MenuItem value='rfq'>RFQ</MenuItem>
										<MenuItem value='item'>Item-WIse</MenuItem>
									</Select>
									{errors.loadingOn &&
										<div className="error-message" style={{ color: 'red', fontSize: '12px' }}>
											{errors.loadingOn}
										</div>
									}

								</FormControl>
							</div> */}

						</div>
						<div className="row mt-2">
							<div className="col-md-12 text-end">
								<Button variant="outlined" onClick={handleAddLoadingFactor}>
									<HiPlus />
								</Button>
							</div>
						</div>
						<div className="table-responsive">
							<table className="table table-striped">
								<thead className="bg-light">
									<tr>
										<th className="font-weight-light">Reason</th>
										<th className="font-weight-light">Loading Type</th>
										<th className="font-weight-light">Loading Factor</th>
										{/* <th className="font-weight-light">Loading Factor On</th> */}
										<th className="font-weight-light">Actions</th>
									</tr>
								</thead>
								<tbody>
									{filteredLoadingFactors?.map((factor, index) => (
										<tr key={index}>
											<td>{factor?.factorDesc}</td>
											<td>{factor.factorType === 'A' ? 'Absolute' : 'Percentage'}</td>

											{/* Conditionally display loadingAmount for Absolute type, and factorPerc for Percentage */}
											<td>
												{factor.factorType === 'A'
													? factor.loadingAmount
													: `${factor.factorPerc}%`
												}
											</td>

											{/* Conditionally display based on loadingOn */}
											{/* <td>{factor?.loadingOn === 'rfq' ? 'RFQ' : 'Item-Wise'}</td> */}

											<td>
												<HiOutlineX
													className="me-2"
													style={{ color: "#2A68D3" }}
													onClick={() => handleDeleteLoadingFactor(index)}
												/>
												<HiOutlinePencil
													style={{ color: "#2A68D3" }}
													onClick={() => handleEditLoadingFactor(index)}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{loadingupdatebtn && filteredLoadingFactors && filteredLoadingFactors.length > 0 && <div className="row mt-2">
								<div className="col-md-12 text-end">
									<LoadingButton

										variant="contained"
										type="button"
										color="primary"
										className="text-capitalize"
										size="small"
										onClick={updateSupplierLoadingFactor}
									>
										Update
									</LoadingButton>
								</div>
							</div>}

						</div>
					</div>
				</Modal.Body>
			</Modal>
			<Modal
				size="lg"
				show={purchaseOrgGrpModal}
				backdrop="static"
				keyboard={false}
				value={"Add NEW CATEGORY"}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => ClosePurcgaseOrgGrpModal()}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">

						</div>
					</Modal.Title>
					<IconButton
						onClick={() => ClosePurcgaseOrgGrpModal()}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<PurchaseOrgGrp />
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
						label="RFQ Template Title"
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
		</>
	);
};



export default RequestForInformation;
