import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import HistoryCell from "../../BaseCells/HistoryCell";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

// Permission Management Imports
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { Button, Menu, Tooltip, createFilterOptions } from "@mui/material";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import "react-quill/dist/quill.snow.css";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import {
	InvitedSupplierModal,
	findObjByValueFromArray,
	getPayloadWithStage,
	getStageInfo,
	handlesaveAttachment,
	mapQuestionsToSubcategories,
	downloadExcelTemplate,
	downloadEventExcelTemplate,
	getApiErrorMessage,
	attachmentmodalforevent,
	eventattachmentmodal,
	filequeryparam,
	getPayloadWithFilePath,
} from "../../../utils/common";
import { uploadFilesOnAzure } from "../../../utils/documentlibrary";
import { actionTypes, useStateValue } from "../../../store";
import {
	OrgGroupMasterList,
	RFQItemServiceDelete,
	checkUTC,
	extractTextFromHTML,
	getCurrency,
	getLibraryOrgEntityFind,
	getPurchaseOrgList,
	getQuestionsLibFind,
	getRFQItemServiceFind,
	getRFQManageFindById,
	scrollToTargetC,
} from "../../../utils/common/utility";
import { toast } from "react-toastify";
import { MemoizedEventStageFlow } from "../../../utils/common/component";
import { ApiClient } from "../../../Apiclient";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import AttachmentWorkFlow from "../../BaseCells/attachmentworkflow";
import { sanitizeInput } from "../../../utils/common/santize";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { FastApiClient } from "../../../FastApiClient";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import RFQItemsTab from "./RFQItemsTab";
import RFQSupplierTab from "./RFQSupplierTab";
import RFQGeneralTab from "./RFQGeneralTab";
import RFQWorkflowPanel from "./RFQWorkflowPanel";
import RFQCommercialTab from "./RFQCommercialTab";
import RFQQuestionsTab from "./RFQQuestionsTab";
import RFQQueryTab from "./RFQQueryTab";
import RFQAllocationTab from "./RFQAllocationTab";
import RFQComparativeTab from "./RFQComparativeTab";
import RFQPreviewTab from "./RFQPreviewTab";
import RFQDrawers from "./RFQDrawers";

dayjs.extend(utc);
dayjs.extend(timezone);

const RequestForQuotation = ({ claimType, breadcrumb }) => {
	const fileInputRef = useRef(null);
	const location = useLocation();
	const navigate = useNavigate();

	const [{ atoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
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
		if (newValue !== 6 && newValue !== "6") setRfqActionsPortalReady(false);
		if (newValue === "6") {
			// if (tabshow)
			// 	setTabShow(false)

			if (approvershow)
				setApproverShow(false)
		}
		else {
			if (newValue === "7") {
				setSelectedMenuItem("Publish RFQ")
				setApproverShow(true)
			}
			else if (newValue === "9") {
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

	const [iscomercialeditDisabled, setIsComercialEditDisabled] = useState(true);
	const [isquestioneditDisabled, setIsQuestionEditDisabled] = useState(true);
	const [issupplierreadDisabled, setIsSupplierReadDisabled] = useState(false);
	const [issupplierraccesslevel, Setissupplierraccesslevel] = useState('');
	const [isHistoryreadDisabled, setisHistoryReadDisabled] = useState(true);
	const [isworkreadDisabled, setisworkReadDisabled] = useState(true);

	// Question category states
	const [allDataList, setAllDataList] = useState([]);
	const [QuestionCategoryList, setQuestionCategoryList] = useState([]);
	const [uncategorizedQuestions, setUncategorizedQuestions] = useState([]);

	const getAuditHistoryRoles = async () => {
		const dataR = {
			roleId: parseInt(userDetail?.roleId),
			featureName: "Request for Quotation",
			claimType: "Audit History",
		};
		const queryParams = buildQueryParams(dataR);
		const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken);
		if (res) {
			const data = res?.data;
			dispatch({ type: actionTypes.SET_RoleClaims, value: data });
		}
		res?.data?.map(item => {
			if (item.claimType === 'Audit History' && item.claimValue === 'Read' && item.accessLevel === 'None') {
				setisHistoryReadDisabled(false);
			}
		});
	};

	const getworkflowRoles = async () => {
		const dataR = {
			roleId: parseInt(userDetail?.roleId),
			featureName: "Request for Quotation",
			claimType: "Work Flow",
		};
		const queryParams = buildQueryParams(dataR);
		const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken);
		if (res) {
			const data = res?.data;
			dispatch({ type: actionTypes.SET_RoleClaims, value: data });
		}
		res?.data?.map(item => {
			if (item.claimType === 'Work Flow' && item.claimValue === 'Read' && item.accessLevel === 'None') {
				setisworkReadDisabled(false);
			}
		});
	};

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
		}),
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
				purchOrgId: values.purchOrgId?.id !== "" ? values.purchOrgId?.id : 0,
				purchGrpId: values.purchGrpId?.id !== "" ? values.purchGrpId?.id : 0,
				termandcondition: sanitizeInput(values.termandcondition),
				rfqStatus: values.rfqStatus,
				openQuotes: values.RFQType === "closed" ? "N" : "Y",
				RFQType: values.RFQType,
				bidOpeningDate: (values.bidOpeningDate && values.RFQType === "closed") ? values.bidOpeningDate?.toISOString() : null,
				boqReq: values.boqReq,
				requisitioner: values.requisitioner !== "" ? values.requisitioner : "",
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
			try {
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
			} catch (error) {
				setLoading(false);
				toast.error(getApiErrorMessage(error), { toastId: 'rfqmanage_save_error' });
			}
		},
	});

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

	const handleRemoveClick = (index) => {
		if (!inputList || !Array.isArray(inputList) || index < 0 || index >= inputList.length) {
			return;
		}
		const list = [...inputList];
		list.splice(index, 1);
		setInputList(list);
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

	const handleCurrencyInputChange = (e, index) => {
		const { name, value } = e.target;
		if (!commcurrencyList || !Array.isArray(commcurrencyList) || index < 0 || index >= commcurrencyList.length) return;
		const list = [...commcurrencyList];
		if (!list[index]) list[index] = {};
		list[index][name] = value;
		setcommcurrencyList(list);
	};

	const handleRemoveCurrencyClick = (index) => {
		if (!commcurrencyList || !Array.isArray(commcurrencyList) || index < 0 || index >= commcurrencyList.length) return;
		const list = [...commcurrencyList];
		list.splice(index, 1);
		setcommcurrencyList(list);
	};

	const handleAddCurrencyClick = () => {
		setcommcurrencyList([
			...commcurrencyList,
			{ id: "0", baseCurrency: "", currencyConversion: "", rfqId: idFromURL },
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
			if (res !== "" && res !== undefined) {
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
					const sameVersion = res?.[0]?.rfqVersionHistory?.find(x => x.version === res?.[0]?.version);
					setOpenQuotes(sameVersion?.openQuotes === "Y" ? true : false);
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

				if (res?.[0]?.baseCurrency && res?.[0]?.baseCurrency !== "") {
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
				if (res?.[0]?.technicalApproval && res?.[0]?.technicalApproval !== "") {
					formik.setFieldValue(
						"technicalApproval",
						res?.[0]?.technicalApproval
					);
				}

				if (res?.[0]?.termandCondition) {
					formik.setFieldValue("termandcondition", res?.[0]?.termandCondition);
				}
				if (res?.[0]?.openQuotes) {
					const value = res?.[0]?.openQuotes === "N" ? true : false
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
					dispatch({ type: actionTypes.SET_STAGE, value: res[0]?.stage });
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
							(x) => x.id === uniqueMappedRecords?.[0]
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

					if (x.id === questionforedit.id) {
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
			if (value === "item") {
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
			if (value === "item") {
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
			if (x.termsId === selectedcommercialterm?.termsId) {
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

	//to fetch master data alias list data
	useEffect(() => {
		if (atoken, customerid) {
			PullPurchaseOrgAll();
		}
	}, [atoken, customerid]);


	useEffect(() => {
		const data = queryParams.get("CommId")?.trim();
		if (data) {
			dispatch({ type: actionTypes.SET_CommId, value: parseInt(data) });
		}
	}, []);

	useEffect(() => {
		if (formik.values.purchOrgId?.id) {
			PullPurchaseGroupAll(formik.values.purchOrgId?.id);
		}
		if (!formik.values.purchOrgId?.id) {
			setPurchaseGroupAllList([])
		}
	}, [formik.values.purchOrgId]);

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
		if ((actionTypeParam === "approval" || actionTypeParam === "Forward") && newIdFromURL && newIdFromURL !== "add") {
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
		if (value === 1) {

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
		if (value === 2) {
			if (rfqItemsList?.length < 1) {
				toast.error("please add items to continue", {
					toastId: "additems_error"
				});
				return;
			}
			setValue(3);
		}
		if (value === 3) {
			//saveRFQCommLibraryAdd();

			const res = await EventCommercialScreenRef?.current?.saveRFQCommercialLibrary();
			if (res) {
				setValue(4);
			}
		}
		if (value === 4) {
			const res = await EventQuestionScreenRef?.current?.saveEventQuestion();
			if (res) {
				setValue(5);
			}
			//saveRFQQuestionLibAdd();
		}

		if (value === 5) {
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

			const matchingWorkflow = approverInWorkflow?.find(workflow => workflow.stage === stage.wfname);

			if (!matchingWorkflow) {
				toast.error(`No workflow found for stage "${stage.wfname}".`);
				return false;
			}

			// if ((!matchingWorkflow.approvers || matchingWorkflow.approvers.length === 0) && stage.required) {
			if ((matchingWorkflow.approvers && matchingWorkflow.approvers.length === 0)) {
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

		try {
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
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: 'rfq_submit_error' });
		} finally {
			setLoading(false);
		}
	};

	// useEffect(() => {

	// 	if (
	// 		(value === 1 || value === 6) &&
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

		if (value === 2 && idFromURL) {
			// Only call if pullgetRFQManageFind has already completed (tempDataEditData is set).
			// If tempDataEditData is not yet loaded, pullgetRFQManageFind will call
			// pullRFQItemServiceFind(id, version) directly once it finishes — no duplicate needed.
			// This prevents a race where the no-version call overwrites correctly loaded items.
			if (tempDataEditData && tempDataEditData.length > 0) {
				const resolvedVersion = tempDataEditData?.[0]?.version || formik?.values?.Version;
				pullRFQItemServiceFind(idFromURL, resolvedVersion);
			}
		}
		if (value === 3) {
			pullLibraryOrgEntityFind();
		}
		if (value === 4) {
			pullLibraryOrgEntityFindQues();
		}
		if (value === 5) {


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

	const downloadEventItemsExcel = async () => {
		await downloadEventExcelTemplate({
			eventType: 'RFQ',
			eventId: idFromURL,
			customerId: customerid,
			templateId: 3,
			fileName: `RFQ_Event_template_${new Date().getTime()}.xlsx`,
		});
	};

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

	const pullCategoryList = async (value) => {
		var data = {
			CustomerId: customerid,
			LibraryId: value?.id ? value?.id : value,
		};
		setLoading(true);
		const queryParams = Object.entries(data)
			?.filter(([key, val]) => val !== null && val !== undefined && val !== "")
			.map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
			.join("&");

		const res = await apiClient.getres(`/api/QCategory/Find?${queryParams}`, atoken);
		const res2 = await apiClient.getres(`/api/QuestionsLib/Find?${queryParams}`, atoken);
		const categories = res?.data?.result;
		const questions = res2?.data?.result;
		setAllDataList(questions);
		const result = mapQuestionsToSubcategories(categories, questions);
		if (res !== "" && res !== undefined) {
			setQuestionCategoryList(result);
		}
		const uncategorized = questions?.filter(question => !question.questionCategory);
		setUncategorizedQuestions(uncategorized);
		setLoading(false);
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

			const ids = tempDataEditData[0].rfqVendorInvited?.filter(x => x.version === formik?.values?.Version).map((item) => item.vendorId);
			const contactids = tempDataEditData[0].rfqVendorInvited.filter(x => x.version === formik?.values?.Version).map((item) => item.contactId);

			setttingSelectedSupplier(ids, true, res?.data, tempDataEditData[0].rfqVendorInvited?.filter(x => x.version === formik?.values?.Version), contactids);
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
		const selectedList = list?.filter((s) => s?.isSelected === true);

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
	const [storeVId, setStoreVId] = useState('');
	const [filteredLoadingFactors, setFilteredLoadingFactors] = useState([]);
	const [loadingFactors, setLoadingFactors] = useState([]);
	const [factorDesc, setFactorDesc] = useState('');
	const [loadingOn, setLoadingOn] = useState('');
	const [factorType, setFactorType] = useState('');
	const [factorPerc, setFactorPerc] = useState(0);
	const [loadingAmount, setLoadingAmount] = useState(0);
	const [editIndex, setEditIndex] = useState(null);
	const [errors, setErrors] = useState({});
	const [loadingupdatebtn, setLoadingUpdateBtn] = useState(false);
	const [isUpdated, setIsUpdated] = useState(false);
	const [loadingModal, setLoadingModal] = useState(false);

	const validationSchemaloading = yup.object({
		factorDesc: yup.string().required('Reason of Loading Factor is required'),
		factorType: yup.string().required('Loading Type is required'),
	});

	const validateLoadingForm = (values) => {
		try {
			validationSchemaloading.validateSync(values, { abortEarly: false });
			return null;
		} catch (err) {
			return err.inner.reduce((acc, error) => {
				acc[error.path] = error.message;
				return acc;
			}, {});
		}
	};

	const handleAddLoadingFactor = () => {
		setLoadingUpdateBtn(true);
		const formValues = {
			factorDesc,
			factorType,
			...(factorType === 'A' ? { loadingAmount } : { factorPerc }),
			loadingOn,
		};
		const validationErrors = validateLoadingForm(formValues);
		if (validationErrors) {
			setErrors(validationErrors);
			setLoadingUpdateBtn(false);
			return;
		}

		const newLoadingFactor = {
			rfqId: parseInt(idFromURL),
			version: formik?.values?.Version,
			customerId: customerid,
			vendorId: storeVId,
			factorDesc,
			factorType,
			...(factorType === 'A' ? { loadingAmount: parseFloat(loadingAmount) } : { factorPerc: parseFloat(factorPerc) }),
			loadingOn: "RFQ",
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
		const vendorLoadingFactors = updatedLoadingFactors?.filter(f => f.vendorId === storeVId);
		setFilteredLoadingFactors(vendorLoadingFactors ?? []);

		const updatedSuppliers = selectedSupplier.map(supplier => {
			if (supplier.id === storeVId) {
				const existingFactors = supplier.rfqLoadingFactor || [];
				if (editIndex !== null) {
					existingFactors[editIndex] = newLoadingFactor;
				} else {
					existingFactors.push(newLoadingFactor);
				}
				return { ...supplier, rfqLoadingFactor: existingFactors };
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
		const updatedLoadingFactors = filteredLoadingFactors?.filter((_, i) => i !== index);
		setLoadingFactors(updatedLoadingFactors);
		const vendorLoadingFactors = updatedLoadingFactors?.filter(f => f.vendorId === storeVId);
		setFilteredLoadingFactors(vendorLoadingFactors ?? []);

		const updatedSuppliers = selectedSupplier.map(supplier => {
			if (supplier.id === storeVId) {
				const existingFactors = supplier.rfqLoadingFactor || [];
				const updatedFactors = existingFactors?.filter((_, i) => i !== index);
				return { ...supplier, rfqLoadingFactor: updatedFactors };
			}
			return supplier;
		});
		setSelectedSupplier(updatedSuppliers);
	};

	const handleEditLoadingFactor = (index) => {
		setLoadingUpdateBtn(true);
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
		}
	};

	const updateSupplierLoadingFactor = async () => {
		try {
			setIsUpdated(false);
			filteredLoadingFactors.forEach(x => { x.id = 0; });
			const data = { VendorId: storeVId, Version: formik?.values?.Version };
			const queryParamsLF = buildQueryParams(data);
			const res = await apiClient.postres(
				`/api/RFQManage/${idFromURL}/RFQLoadingFactor?${queryParamsLF}`,
				filteredLoadingFactors,
				atoken
			);
			if (res) {
				toast.success("Loading factor updated successfully", { toastId: "loading_factor_update" });
				setLoadingUpdateBtn(false);
				setLoadingModal(false);
				setupdatesupplieronloading(1);
				setIsUpdated(true);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "loading_factor_error" });
		} finally {
			setLoadingUpdateBtn(false);
		}
	};
	const rfqReportActionsRef = useRef(null);
	const [rfqActionsPortalReady, setRfqActionsPortalReady] = useState(false);
	const [erfqActiveSubTab, setErfqActiveSubTab] = useState(0);
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
			status: actionType === "Forward" ? "Forward" : "Approved",
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

			if (actionType === 'Forward') {
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
			if (values?.status === "Approved") {
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

			if (actionType === 'approval') {
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

	//pagination for total suppliers
	const [pageTS, setPageTS] = React.useState(1);

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
		if (!idFromURL && purchaseAllList && purchaseAllList.length === 1) {
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
		if (!idFromURL && purchaseGroupAllList && purchaseGroupAllList.length === 1) {
			formik.setFieldValue("purchGrpId", purchaseGroupAllList[0])
		}

	}, [OrgGroupId, purchaseGroupAllList])

	useEffect(() => {

		handlePaginationSS();
		setTotalPageSS(Math.ceil(selectedSupplier?.length / pageCount));
	}, [pageSS, selectedSupplier]);

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

		if (accessLevel?.find(x => x.claimType === "Work Flow")?.claimValue?.Read === "N") {
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

	// ── Right panel: Attachments tab state ──────────────────────────────────
	const [panelSavedAttach, setPanelSavedAttach] = useState([]);
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
			const updated = panelSavedAttach.filter((_, i) => i === index);
			setPanelSavedAttach(updated);
			handleattachmentforevent(updated);
		}
	};

	const handleMenuClick = (item) => {

		if (item !== "Save as Templates" && item !== "Cancel" && item !== "Approverforward") {
			setSelectedMenuItem(item);
		}

		setAnchorEl(null); // Close the menu after selection
		handleSelectButtonGroup(item)
	};

	const [selectedMenuItem, setSelectedMenuItem] = useState("Save & Continue");
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
		validationSchema: selectedAction === "Surrogate RFQ" ? validationSchemaSurrogate : "",
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
		if (action === "Surrogate") {
			setSelectedAction("Surrogate RFQ")
		}
		else if (action === "Reminder") {
			setSelectedAction("Send Reminder")
		}
		else if (action === "Reopen") {

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

	const isNewRFQ = !idFromURL || idFromURL === "add";
	const isSaveContinueHeaderDisabled =
		loading ||
		(value === 9
			? currentStage !== "Allocation"
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
											{currentStage === 'Allocation' && value === "9" && (
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
											{currentStage === 'Allocation' && value === "9" && (
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
									{idFromURL && currentStage.trim() === "Draft" && (
										<Tab
											value={7}
											label={<span className="section-heading">Preview</span>}
											disabled={!rfqpreview}
										/>
									)}
									{idFromURL && (
										(currentStage.trim() !== "Under Pre Approval" && currentStage.trim() !== "Draft") ||
										formik?.values?.Version !== 1
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
									{idFromURL && (currentStage.trim() === "Allocation" || currentStage.trim() === "Awarded") && stagelist?.some(item => item.currentStage === "Allocation") && (
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
						<div className="flex-grow-1 hidden-scrollbar" style={{ overflowY: value === 2 || value === 5 || value === 6 || value === 8 || value === 9 ? 'hidden' : 'auto', padding: value === 6 || value === 8 || value === 9 ? '0' : '20px 16px 16px', display: value === 2 || value === 5 || value === 6 || value === 8 || value === 9 ? 'flex' : 'block', flexDirection: value === 2 || value === 5 || value === 6 || value === 8 || value === 9 ? 'column' : undefined }}>
							{/* General Tab Content */}
							{value === 1 && (
								<RFQGeneralTab
									canRead={effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.READ) ?? false}
									canEdit={effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.EDIT) ?? false}
									canCreate={effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.CREATE) ?? false}
									canRemove={effectivePermissionManager?.hasPermission(CLAIM_TYPES.GENERAL, ACTIONS.REMOVE) ?? false}
									showGeneralAccessDenied={showGeneralAccessDenied}
									formik={formik}
									inputList={inputList}
									loadRequisitioner={loadRequisitioner}
									requisitionerList={requisitionerList}
									purchaseAllList={purchaseAllList}
									purchaseGroupAllList={purchaseGroupAllList}
									stagelist={stagelist}
									currencyList={currencyList}
									loadCurrency={loadCurrency}
									stagearray={stagearray}
									currentStage={currentStage}
									idFromURL={idFromURL}
									userDetail={userDetail}
									attachmentforevent={attachmentforevent}
									handleRequisitionerChange={handleRequisitionerChange}
									PullUserDesignation={PullUserDesignation}
									handleBaseCurrency={handleBaseCurrency}
									pullgetCurrency={pullgetCurrency}
									handleInputChange={handleInputChange}
									handleAddClick={handleAddClick}
									handleRemoveClick={handleRemoveClick}
									handletabEdit={handletabEdit}
									setApproverShow={setApproverShow}
									setWorkflowPanelTab={setWorkflowPanelTab}
									setPurchaseOrgModal={setPurchaseOrgModal}
									setPurchaseGroupAllList={setPurchaseGroupAllList}
									setPurchaseOrgGrpModal={setPurchaseOrgGrpModal}
									setOpenCurrencyModal={setOpenCurrencyModal}
								/>
							)}

							{/* Items/Services Tab Content */}
							{value === 2 && (
								<div className="rfq-items-tab-content" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
									<RFQItemsTab
										loadingPermissions={loadingPermissions}
										canRead={effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.READ) ?? false}
										canEdit={effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.EDIT) ?? false}
										canCreate={effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.CREATE) ?? false}
										canRemove={effectivePermissionManager?.hasPermission(CLAIM_TYPES.ITEM_SERVICE, ACTIONS.REMOVE) ?? false}
										stagearray={stagearray}
										currentStage={currentStage}
										rfqItemsList={rfqItemsList}
										boqReq={formik.values.boqReq}
										idFromURL={idFromURL}
										rfqVersion={formik?.values?.Version}
										downloadItemsExcel={downloadItemsExcel}
										downloadEventItemsExcel={downloadEventItemsExcel}
										setConfirmClearAllItems={setConfirmClearAllItems}
										toggleDrawer={toggleDrawer}
										handleEditItem={handleEditItem}
										handleDeleteItem={handleDeleteItem}
										pullRFQItemServiceFind={pullRFQItemServiceFind}
									/>
								</div>
							)}

							{/* Commercial Terms Tab Content */}
							{value === 3 && (
								<RFQCommercialTab
									effectivePermissionManager={effectivePermissionManager}
									idFromURL={idFromURL}
									formik={formik}
									stagearray={stagearray}
									currentStage={currentStage}
									currencyList={currencyList}
									EventCommercialScreenRef={EventCommercialScreenRef}
									iscomercialeditDisabled={iscomercialeditDisabled}
								/>
							)}

							{/* Questions Tab Content */}
							{value === 4 && (
								<RFQQuestionsTab
									idFromURL={idFromURL}
									supplierid={supplierid}
									formik={formik}
									stagearray={stagearray}
									currentStage={currentStage}
									isquestioneditDisabled={isquestioneditDisabled}
									stagelist={stagelist}
									permissionManager={permissionManager}
									requestCell={requestCell}
									EventQuestionScreenRef={EventQuestionScreenRef}
								/>
							)}

							{value === 5 && (
								<RFQSupplierTab
									tabloading={tabloading}
									issupplierreadDisabled={issupplierreadDisabled}
									effectivePermissionManager={effectivePermissionManager}
									permissionManager={permissionManager}
									categoryList={categoryList}
									selectedCategory={selectedCategory}
									totalSupplier={totalSupplier}
									selectedSupplier={selectedSupplier}
									stagearray={stagearray}
									currentStage={currentStage}
									pageTS={pageTS}
									pageCount={pageCount}
									pageSS={pageSS}
									setPageTS={setPageTS}
									setPageSS={setPageSS}
									setPageCount={setPageCount}
									setSelectedCategory={setSelectedCategory}
									handleSupplierWithCategory={handleSupplierWithCategory}
									handleSelectedSupplier={handleSelectedSupplier}
									clearALLSelectedSupplier={clearALLSelectedSupplier}
									clearSelectedSupplier={clearSelectedSupplier}
									handleLoadingFactorClick={handleLoadingFactorClick}
									handleSupplierAction={handleSupplierAction}
									getCategorylist={getCategorylist}
									updatesupplieronloading={updatesupplieronloading}
									totalpageSS={totalpageSS}
									handlePaginationSS={handlePaginationSS}
									issupplierraccesslevel={issupplierraccesslevel}
									EventHeaderDetails={EventHeaderDetails}
									formik={formik}
								/>
							)}
							{value === 6 && idFromURL && idFromURL !== "add" && !isNaN(parseInt(idFromURL)) && (
								<RFQComparativeTab
									idFromURL={idFromURL}
									accessLevel={accessLevel}
									handleTab={handleTab}
									headerActionsRef={rfqActionsPortalReady ? rfqReportActionsRef : null}
									onSubTabChange={setErfqActiveSubTab}
									categoryList={categoryList}
									selectedSupplier={selectedSupplier}
									formik={formik}
									activityId={activityId}
									actionType={actionType}
									handleDraftEvent={handleDraftEvent}
									openQuotes={openQuotes}
									EventHeaderDetails={EventHeaderDetails}
									approvershow={approvershow}
									handleApprover={handleApprover}
									purchaseAllList={purchaseAllList}
									purchaseGroupAllList={purchaseGroupAllList}
									currentStage={currentStage}
									handlefilteredSupplier={handlefilteredSupplier}
									stagelist={stagelist}
									inputList={inputList}
									updatesupplieronloading={updatesupplieronloading}
									stagearray={stagearray}
									handleSelectedSupplier={handleSelectedSupplier}
									handleLoadingFactorClick={handleLoadingFactorClick}
									handleSupplierAction={handleSupplierAction}
									clearSelectedSupplier={clearSelectedSupplier}
									pageSS={pageSS}
									pageCount={pageCount}
									totalpageSS={totalpageSS}
									handlePaginationSS={handlePaginationSS}
									issupplierraccesslevel={issupplierraccesslevel}
									handleLoadingFactorNew={handleLoadingFactorNew}
									isUpdated={isUpdated}
									permissionManager={permissionManager}
								/>
							)}

							{value === 8 && (
								<RFQQueryTab
									pageSlug={pageSlug}
									accessLevel={accessLevel}
									permissionManager={permissionManager}
								/>
							)}
							{value === 9 && (
								<RFQAllocationTab
									idFromURL={idFromURL}
									formik={formik}
									effectivePermissionManager={effectivePermissionManager}
									NFASOBRFQRef={NFASOBRFQRef}
								/>
							)}
							{value === 7 && (
								<RFQPreviewTab
									rfqpreview={rfqpreview}
									showGeneralAccessDenied={showGeneralAccessDenied}
									idFromURL={idFromURL}
									formik={formik}
									inputList={inputList}
									purchaseAllList={purchaseAllList}
									purchaseGroupAllList={purchaseGroupAllList}
									stagearray={stagearray}
									currentStage={currentStage}
									accessLevel={accessLevel}
									rfqItemsList={rfqItemsList}
									currencyList={currencyList}
									supplierid={supplierid}
									stagelist={stagelist}
									permissionManager={permissionManager}
									requestCell={requestCell}
									selectedSupplier={selectedSupplier}
									handletabEdit={handletabEdit}
									EventCommercialScreenRef={EventCommercialScreenRef}
									EventQuestionScreenRef={EventQuestionScreenRef}
									isquestioneditDisabled={isquestioneditDisabled}
									effectivePermissionManager={effectivePermissionManager}
									handleEditItem={handleEditItem}
									handleDeleteItem={handleDeleteItem}
								/>
							)}
						</div>
					</div>
				</div>

				{/* Right content - Approval Section */}
				<RFQWorkflowPanel
					approvershow={approvershow}
					workflowPanelTab={workflowPanelTab}
					setWorkflowPanelTab={setWorkflowPanelTab}
					actionType={actionType}
					currentStage={currentStage}
					normalizedCurrentStage={normalizedCurrentStage}
					stagearray={stagearray}
					formik_ApproveReject={formik_ApproveReject}
					toggleDrawer={toggleDrawer}
					requestCell={requestCell}
					handleEventAppList={handleEventAppList}
					wfupdate={wfupdate}
					stagelist={stagelist}
					accessLevel={accessLevel}
					permissionManager={permissionManager}
					effectivePermissionManager={effectivePermissionManager}
					tempDataEditData={tempDataEditData}
					formik={formik}
					userDetail={userDetail}
					atoken={atoken}
					historyLoading={historyLoading}
					historyGraph={historyGraph}
					historyAudit={historyAudit}
					panelAttachLoading={panelAttachLoading}
					panelAttachDesc={panelAttachDesc}
					setPanelAttachDesc={setPanelAttachDesc}
					panelAttachError={panelAttachError}
					setPanelAttachError={setPanelAttachError}
					panelAttachFile={panelAttachFile}
					setPanelAttachFile={setPanelAttachFile}
					panelSavedAttach={panelSavedAttach}
					setPanelSavedAttach={setPanelSavedAttach}
					panelHasCheckboxChanged={panelHasCheckboxChanged}
					setPanelHasCheckboxChanged={setPanelHasCheckboxChanged}
					panelIsUpdating={panelIsUpdating}
					panelAttachAdding={panelAttachAdding}
					panelFileInputRef={panelFileInputRef}
					addPanelAttachment={addPanelAttachment}
					deletePanelAttachment={deletePanelAttachment}
					updatePanelAttachments={updatePanelAttachments}
					handleattachmentforevent={handleattachmentforevent}
				/>
			</div>

			<RFQDrawers
				state={state}
				toggleDrawer={toggleDrawer}
				stagearray={stagearray}
				currentStage={currentStage}
				formik={formik}
				idFromURL={idFromURL}
				itemEditTempData={itemEditTempData}
				UOMMaster={UOMMaster}
				callbackItemAdd={callbackItemAdd}
				handleUomList={handleUomList}
				accessLevel={accessLevel}
				callbackQuesAddCustom={callbackQuesAddCustom}
				libraryId={libraryId}
				questionforedit={questionforedit}
				selectedAction={selectedAction}
				formik_Action={formik_Action}
				formik_ApproveReject={formik_ApproveReject}
				normalizedCurrentStage={normalizedCurrentStage}
				confirmDelete={confirmDelete}
				handleCloseDelete={handleCloseDelete}
				removeItem={removeItem}
				removeItemData={removeItemData}
				modalcancelOpen={modalcancelOpen}
				handleCancelRFQModal={handleCancelRFQModal}
				cancelReason={cancelReason}
				handleCancelInputChange={handleCancelInputChange}
				rfqerror={rfqerror}
				purchaseOrgModal={purchaseOrgModal}
				ClosePurcgaseOrgModal={ClosePurcgaseOrgModal}
				handlepurchaseorgList={handlepurchaseorgList}
				loadingModal={loadingModal}
				CloseLoadingModal={CloseLoadingModal}
				storeVId={storeVId}
				filteredLoadingFactors={filteredLoadingFactors}
				setupdatesupplieronloading={setupdatesupplieronloading}
				setIsUpdated={setIsUpdated}
				factorDesc={factorDesc}
				setFactorDesc={setFactorDesc}
				factorType={factorType}
				setFactorType={setFactorType}
				factorPerc={factorPerc}
				setFactorPerc={setFactorPerc}
				loadingAmount={loadingAmount}
				setLoadingAmount={setLoadingAmount}
				loadingOn={loadingOn}
				setLoadingOn={setLoadingOn}
				loadingFactorErrors={errors}
				loadingupdatebtn={loadingupdatebtn}
				handleAddLoadingFactor={handleAddLoadingFactor}
				handleDeleteLoadingFactor={handleDeleteLoadingFactor}
				handleEditLoadingFactor={handleEditLoadingFactor}
				updateSupplierLoadingFactor={updateSupplierLoadingFactor}
				purchaseOrgGrpModal={purchaseOrgGrpModal}
				ClosePurcgaseOrgGrpModal={ClosePurcgaseOrgGrpModal}
				open={open}
				handleClose={handleClose}
				TemplateTitle={TemplateTitle}
				setTemplateTitle={setTemplateTitle}
				handleSaveTemplate={handleSaveTemplate}
				confirmEventUpdate={confirmEventUpdate}
				handleCloseEventUpdate={handleCloseEventUpdate}
				loading={loading}
				handleDraftEvent={handleDraftEvent}
				fileInputRef={fileInputRef}
				handleFileChange={handleFileChange}
				confirmClearAllItems={confirmClearAllItems}
				handleClearAllItems={handleClearAllItems}
				modal1={modal1}
				handleCloseModal1={handleCloseModal1}
				currencyList={currencyList}
				loadCurrency={loadCurrency}
				pullgetCurrency={pullgetCurrency}
				setOpenCurrencyModal={setOpenCurrencyModal}
				isUploading={isUploading}
				OpenCurrencyModal={OpenCurrencyModal}
				CloseCurrencyModal={CloseCurrencyModal}
				handleCurrencyList={handleCurrencyList}
			/>
		</>
	);
};

export default RequestForQuotation;
