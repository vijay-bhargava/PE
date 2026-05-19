
import { LoadingButton } from "@mui/lab";
import {
	Alert,
	Badge,
	Box,
	Button,
	Checkbox,
	Chip,
	Drawer,
	IconButton,
    Menu,
	MenuItem,
	Tab,
	Tabs,
	TextField,
	ButtonGroup,
	InputAdornment,
	Typography,
	Stack,
	Tooltip,
	FormControlLabel,
	CardContent,
	Card,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Grid
} from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { DateField, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import SelectApprovalsCell from "../BaseCells/SelectApprovalsCell";
import HistoryCell from "../BaseCells/HistoryCell";
import EventApprovalBox from "../BaseCells/eventapprovalbox";
import { Form, Modal } from "react-bootstrap";
import AddUpdatePaymentterms from "./AddUpdatePaymentterms";
import {
	HiOutlineCollection,
	HiOutlineLink,
	HiOutlineX,
	HiPencilAlt,
	HiChevronDown,
	HiOutlineChevronUp,
	HiOutlineChevronDown,
	HiOutlinePencilAlt
} from "react-icons/hi";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { MdReceipt } from "react-icons/md";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import {
	Link,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import {
	POShipInvoiceAcceptGRN,
	POShipInvoiceApproval,
	POShipInvoiceGRN,
	GetPOAttachments,
	GetPOShipHeaderList,
	GetPODetails,
	POAttachments,
	POConfirmOrder,
	PORejectOrder,
	GetPOHeaderList_Slug,
	POShipHeader,
	POShipInvoiceHeader,
	POShipOrdrItem,
	UpdatePOAddresses,
} from "../../utils/purchaseOrder";
import { useFormik } from "formik";
import * as Yup from "yup";
import POItemList from "./POItemList";
import POPreview from './POPreview';
import useFormikOC, {
	useFormik_InvoiceAccepted,
	useFormik_GRNAccepted,
	useFormik_POAttachments,
	useFormik_POConfirmOrder,
	useFormik_PORejectOrder,
	useFormik_POShipHeader,
	useFormik_POShipInvoiceHeader,
	useFormik_POShipOrdrItem,
} from "../../utils/pOToAccept/formik";
import formik_POConfirmOrder from "../../utils/pOToAccept/formik";
import { useCookies } from "react-cookie";
import ReceiptIcon from "@mui/icons-material/Receipt"; // Icon for "GRN"



import {
	onlyNumbers,
	downloadFilesOnAzure,
	onlyNumberdec,
	getFileName,
	getPayloadWithStage,
} from "../../utils/common";
import { StageFindAll } from "../../utils/stagemaster";
import { useStateValue } from "../../store";
import {
	formatDateViaTimeZone,
	formatoption,
	getOnlyDateFormatPatternLocale,
} from "../../utils/common/utility";
import { BackButton, MemoizedEventStageFlow } from "../../utils/common/component";
import GridSkeleton from "../../components/Skeleton/gridSkeleton";
import { ApiClient, api } from "../../Apiclient";
import { toast } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';


import { buildQueryParams } from "../../utils/purchaseRequest";
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';

const PurchaseOrder = () => {
	const [cookies] = useCookies(["patkn", "prtkn"]);
	//const { pageSlug } = useParams();
	const { pageSlug, poId } = useParams();
	// Set license key for development/evaluation

	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const domain = process.env.REACT_APP_API_CALL;
	const apiClient = new ApiClient(api);
	const [{ atoken, rtoken, customerid, userDetail ,eventCode }, dispatch] = useStateValue();
	//const [poSpecificDetails] = useState(location.state); //To get Data object from sending Component link
	const [poSpecificDetails, setPoSpecificDetails] = useState();

	// Address edit dialog state
	const [openEditBill, setOpenEditBill] = useState(false);
	const [openEditShip, setOpenEditShip] = useState(false);

	// PO Condition edit modal state
	const [openEditCondition, setOpenEditCondition] = useState(false);
	const [editingCondition, setEditingCondition] = useState(null);
	const [conditionForm, setConditionForm] = useState({
		conditionType: "",
		conditionCategory: "",
		conditionRate: "",
		conditionValue: "",
		currency: "",
		calculationType: "",
	});
	const [savingCondition, setSavingCondition] = useState(false);

	const [billToAddress, setbillToAddress] = useState("");
	const [billToCity, setbillToCity] = useState("");
	const [billToState, setbillToState] = useState("");

	const [shipToAddress, setshipToAddress] = useState("");
	const [shipToCity, setshipToCity] = useState("");
	const [shipToState, setshipToState] = useState("");

	

	const [gRNDate, setGRNDate] = useState(null);

	const [currentStage, setCurrentStage] = useState("");
	const [currentInvStage, setCurrentInvStage] = useState("");
	const [approvershow, setApproverShow] = useState(false);

	// Permission managers for PO and INV
	const [poPermissionManager, setPoPermissionManager] = useState(null);
	const [invPermissionManager, setInvPermissionManager] = useState(null);

	// Permission loading state: don't render the page until permissions resolved
	const [loadingPermissions, setLoadingPermissions] = useState(true);
	const permissionsLoadedRef = useRef({ po: false, inv: false });

	const markPermissionLoaded = (key) => {
		permissionsLoadedRef.current[key] = true;
		if (permissionsLoadedRef.current.po && permissionsLoadedRef.current.inv) {
			setLoadingPermissions(false);
		}
	};

	// Permission-based disabled states for PO Details
	const [isPoDetailsReadDisabled, setIsPoDetailsReadDisabled] = useState(true);
	const [isPoDetailsEditDisabled, setIsPoDetailsEditDisabled] = useState(true);
	const [isPoDetailsCreateDisabled, setIsPoDetailsCreateDisabled] = useState(true);

	// Permission-based disabled states for Item/Services
	const [isItemServicesReadDisabled, setIsItemServicesReadDisabled] = useState(true);
	const [isItemServicesEditDisabled, setIsItemServicesEditDisabled] = useState(true);
	const [isItemServicesCreateDisabled, setIsItemServicesCreateDisabled] = useState(true);
	const [isItemServicesRemoveDisabled, setIsItemServicesRemoveDisabled] = useState(true);

	// Permission-based disabled states for Shipped History
	const [isShippedHistoryReadDisabled, setIsShippedHistoryReadDisabled] = useState(true);
	const [isShippedHistoryEditDisabled, setIsShippedHistoryEditDisabled] = useState(true);
	const [isShippedHistoryCreateDisabled, setIsShippedHistoryCreateDisabled] = useState(true);

	// Permission-based disabled states for Work Flow
	const [isWorkflowReadDisabled, setIsWorkflowReadDisabled] = useState(true);
	const [isWorkflowEditDisabled, setIsWorkflowEditDisabled] = useState(true);

	// Permission-based disabled states for Audit History
	const [isAuditHistoryReadDisabled, setIsAuditHistoryReadDisabled] = useState(true);

	const fetchPOHeaderList_Slug = (pageSlug) => {
		GetPOHeaderList_Slug(pageSlug, atoken).then((res) => {

			if (res) {
				// Normalize condition property name: API returns `poHeaderConditions`
				// but components expect `poConditions`.
				// Only include conditions where isHeaderCondition is true.
				const rawConditions = res?.poConditions ?? res?.poHeaderConditions ?? [];
				const mapped = {
					...res,
					poConditions: rawConditions.filter(c => c.isHeaderCondition === true),
				};

				setPoSpecificDetails(mapped);
				setCurrentStage(mapped?.stage);
			}
		});
	};

	const initialValues_fetchPODetails = {
		// CustomerId:customerid,
		// pagenumber:1,
		POId: pageSlug,
	};

	const [ref_POHeaderId, setref_POHeaderId] = useState(0);
	const [Ref_ItemId, SetRef_ItemId] = useState(0);
	const [itemId, setitemId] = useState(0);

	const initialValues_fetchPOShipHeader = {
		CustomerId: customerid,
		//pagenumber:1,
		//POHeaderId:ref_POHeaderId,
		POId: pageSlug, // pageSlug is the PO ID (228 in the URL)
		//ref_ItemId :Ref_ItemId,
		//ConfirmNo:'',
		//ShipNo:'',
		//status:''
	};

	const [eventType, setEvenType] = useState("PO");
	const [eventStage, setEventStage] = useState("");
	const [invStatus, setInvStatus] = useState("");
	const [nextEventStage, setNextEventStage] = useState('');
	const [eventId, setEventId] = useState(pageSlug);

	const [allPOShipHeader, setallPOShipHeader] = useState([]);

	const [allPOItems, setAllPOItems] = useState([]);

	// Delivery date edit state
	const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
	const [deliveryDialogRow, setDeliveryDialogRow] = useState(null);
	const [deliveryDialogDate, setDeliveryDialogDate] = useState(null);
	const [deliveryUpdates, setDeliveryUpdates] = useState({}); // itemId -> Date

	// PO Number inline edit state
	const [editingPONumber, setEditingPONumber] = useState(false);
	const [poNumberInput, setPoNumberInput] = useState('');

	// PO Date edit dialog state
	const [poDateDialogOpen, setPoDateDialogOpen] = useState(false);
	const [poDateDialogValue, setPoDateDialogValue] = useState(null);
	const [stagedPODate, setStagedPODate] = useState(null);

	// Expiry Date state
	const [expiryDate, setExpiryDate] = useState(null);


	// Payment terms state
	const [paymentTermsOptions, setPaymentTermsOptions] = useState([]);
	const [selectedPaymentTermId, setSelectedPaymentTermId] = useState(null);
	const [paymentTermsLoading, setPaymentTermsLoading] = useState(false);
	const [savingPaymentTerm, setSavingPaymentTerm] = useState(false);
	const [paymentTermModal, setPaymentTermModal] = useState(false);
	const paymentTermsFieldRef = useRef(null);
	
	// Track if Tab 0 (PO Details) is completed in draft mode
	const [isTab0Complete, setIsTab0Complete] = useState(false);

	// Action menu state (top-right)
	const [anchorElAction, setAnchorElAction] = useState(null);
	const openAction = Boolean(anchorElAction);
	const handleOpenActionMenu = (e) => setAnchorElAction(e.currentTarget);
	const handleCloseActionMenu = () => setAnchorElAction(null);

	// Generate PDF for the PO before submitting to supplier
	const generatePdf = async () => {
		try {
			debugger;
			const res = await apiClient.getres(`/api/poconfirm/${pageSlug}/GeneratePdf`, atoken);
			if (res) {
				return true;
			}
			toast.error('Failed to generate PO PDF.');
			return false;
		} catch (err) {
			console.error('GeneratePdf', err);
			toast.error('Failed to generate PO PDF.');
			return false;
		}
	};

	const handleSaveAndContinue = async () => {
		handleCloseActionMenu();
		// Tab-aware Save & Continue
		if (value === 0) {
			// PO Details tab - Payment Terms API
			if (!selectedPaymentTermId) {
				toast.error("Please select payment terms.");
				// Focus on payment terms field
				setTimeout(() => {
					if (paymentTermsFieldRef.current) {
						paymentTermsFieldRef.current.focus();
					}
				}, 100);
				return;
			}
			setSavingPaymentTerm(true);
			try {
				const sel = paymentTermsOptions.find(p => (p.id ?? p.paymentTermsId ?? p.paymentTermId) == selectedPaymentTermId);
				const payload = {
					poId: parseInt(pageSlug),
					customerId: parseInt(poSpecificDetails?.customerId ?? customerid),
					newPaymentTerms: sel?.paymentTerms || sel?.termsOfPayment || sel?.paymentTerm || "",
					poNumber: poNumberInput || poSpecificDetails?.poNumber || "",
					poDate: (stagedPODate ?? (poSpecificDetails?.pO_Date ? new Date(poSpecificDetails.pO_Date) : new Date())).toISOString(),
					expiryDate: (expiryDate ?? (poSpecificDetails?.confirmedDelDate ? new Date(poSpecificDetails.confirmedDelDate) : null))?.toISOString() || null,
				};
				const resp = await apiClient.postres(`/api/poconfirm/PaymentTermsUpdate`, payload, atoken);
				if (resp) {
					toast.success("Payment terms updated.");
					fetchPOHeaderList_Slug(pageSlug);
					fetchPODetails(initialValues_fetchPODetails);
					// Mark Tab 0 as complete
					setIsTab0Complete(true);
					// Navigate to next tab
					setValue(1);
				}
			} catch (err) {
				console.error('save payment terms', err);
				toast.error("Failed to save payment terms.");
			} finally {
				setSavingPaymentTerm(false);
			}
		} else if (value === 1) {
			// Items/Services tab - Delivery Date API
			const missing = allPOItems.filter(it => {
				const dt = deliveryUpdates[it.id] ?? it.poDeliveryDate ?? it.PoDeliveryDate ?? it.deliveryDate;
				return !dt;
			});
			if (missing.length > 0) {
				toast.error('Please fill delivery date.');
				// Open delivery date dialog for first item with missing date
				const firstMissing = missing[0];
				setDeliveryDialogRow(firstMissing);
				setDeliveryDialogDate(new Date());
				setDeliveryDialogOpen(true);
				return;
			}
			setSavingPaymentTerm(true);
			try {
				const payload = allPOItems.map(it => ({
					poId: parseInt(pageSlug),
					itemId: it.id,
					customerId: customerid,
					newDeliveryDate: (new Date(deliveryUpdates[it.id] ?? it.poDeliveryDate)).toISOString()
				}));
				const res = await apiClient.postres(`/api/poconfirm/DeliverydateUpdate`, payload, atoken);
				if (res) {
					toast.success('Delivery dates updated.');
					fetchPODetails(initialValues_fetchPODetails);
					setDeliveryUpdates({}); // clear staged edits
					// Navigate to Preview tab (skip Shipped History in Draft)
					setValue(3);
				}
			} catch (err) {
				console.error('DeliverydateUpdate', err);
				toast.error('Failed to update delivery dates.');
			} finally {
				setSavingPaymentTerm(false);
			}
		} else if (value === 3) {
			// Preview tab - Submit PO
			setSavingPaymentTerm(true);
			try {
				// Step 1: Generate PDF (to be enabled when PO is sent to supplier)
				const pdfSuccess = await generatePdf();
				if (!pdfSuccess) {
					setSavingPaymentTerm(false);
					return;
				}

				// Submit PO
				const d = poSpecificDetails ?? {};
				const payload = {
					id: d.id ?? parseInt(pageSlug),
					vendorId: d.vendorId ?? 0,
					sobId: d.sobId ?? 0,
					documentType: d.documentType ?? "",
					purchaseOrg: d.purchaseOrg ?? "",
					purchaseGrp: d.purchaseGrp ?? "",
					incoTerms: d.incoTerms ?? "",
					payTerms: d.payTerms ?? "",
					currency: d.currency ?? "",
					headerText: d.headerText ?? "",
					modeOfDispatch: d.modeOfDispatch ?? "",
					placeOfDelivery: d.placeOfDelivery ?? "",
					termsOfPayment: d.termsOfPayment ?? "",
					priceBasis: d.priceBasis ?? "",
					specialInstruction: d.specialInstruction ?? "",
					billingAddr: d.billingAddr ?? "",
					warranty: d.warranty ?? "",
					taxCode: d.taxCode ?? "",
					invoicingParty: d.invoicingParty ?? "",
					externalSourcePONumber: d.externalSourcePONumber ?? "",
					partnerNumber: d.partnerNumber ?? "",
					responseJSON: d.responseJSON ?? "",
					eventId: d.eventId ?? parseInt(pageSlug),
					eventType: d.eventType ?? "PO",
					unitPrice: d.unitPrice ?? "",
					vendorAccGrp: d.vendorAccGrp ?? "",
					coCd: d.coCd ?? "",
					reconAcc: d.reconAcc ?? "",
					checkDoubleInvoice: d.checkDoubleInvoice ?? "",
					witholdingTaxType: d.witholdingTaxType ?? "",
					subjectToTds: d.subjectToTds ?? "",
					typeOfRecepient: d.typeOfRecepient ?? "",
					witholdingTaxCode: d.witholdingTaxCode ?? "",
					schemaGrp: d.schemaGrp ?? "",
					authGroup: d.authGroup ?? "",
					gstVendClass: d.gstVendClass ?? "",
					grBasedInvoiceLogic: d.grBasedInvoiceLogic ?? "",
					confirmationNo: d.confirmationNo ?? "",
					supplierRef: d.supplierRef ?? "",
					shippingCost: d.shippingCost ?? 0,
					confirmedDelDate: d.confirmedDelDate ?? new Date().toISOString(),
					confirmedShipDate: d.confirmedShipDate ?? new Date().toISOString(),
					supplierRemarks: d.supplierRemarks ?? "",
					poAmount: d.poAmount ?? 0,
					paidAmount: d.paidAmount ?? 0,
					vendorName: d.vendorName ?? "",
					billToAddress: d.billToAddress ?? "",
					billToCity: d.billToCity ?? "",
					billToState: d.billToState ?? "",
					bllToZipCode: d.bllToZipCode ?? "",
					billToPhone: d.billToPhone ?? "",
					billToEmail: d.billToEmail ?? "",
					company: d.company ?? "",
					shipToAddress: d.shipToAddress ?? "",
					shipToCity: d.shipToCity ?? "",
					shipToState: d.shipToState ?? "",
					shipToZipCode: d.shipToZipCode ?? "",
					shipToPhone: d.shipToPhone ?? "",
					shipToEmail: d.shipToEmail ?? "",
					poType: d.poType ?? "",
					poDocumentFilePath: d.poDocumentFilePath ?? "",
					poDocumentFileName: d.poDocumentFileName ?? "",
					poCofirmationDate: d.poCofirmationDate ?? new Date().toISOString(),
					stage: "PO Sent to Supplier",
					rejectionReason: d.rejectionReason ?? "",
					rejctionDate: d.rejctionDate ?? new Date().toISOString(),
					reqDeliveryDate: d.reqDeliveryDate ?? new Date().toISOString(),
					pO_Date: d.pO_Date ?? new Date().toISOString(),
					poNumber: d.poNumber ?? "",
					customerId: customerid ?? d.customerId ?? 0,
					createdById: d.createdById ?? userDetail?.id ?? 0,
					createdByName: d.createdByName ?? userDetail?.name ?? "",
				};
				const res = await apiClient.postres(`/api/poconfirm/POSubmit`, payload, atoken);
				if (res) {
					toast.success('PO submitted successfully.');
					// Reload the page after successful submission
					setTimeout(() => {
						window.location.reload();
					}, 500);
				}
			} catch (err) {
				console.error('POSubmit', err);
				toast.error('Failed to submit PO.');
			} finally {
				setSavingPaymentTerm(false);
			}
		}
	};

	const fetchPODetails = useCallback(async () => {
		try {
			const res = await GetPODetails(pageSlug, itemId, atoken);
			if (res) {
				// Ensure DataGrid expects `itemNo` mapped from `itemCode`
				const mapped = Array.isArray(res)
					? res.map(r => ({ ...r, itemNo: r.itemCode }))
					: res;
				setAllPOItems(mapped);
				setSelectedItems(mapped);
				setEventId(res?.id);
			}
		} catch (error) {
			// Handle error
		}
	}, [pageSlug, cookies]);

	const fetchPaymentTerms = useCallback(async () => {
		if (!customerid) return;
		setPaymentTermsLoading(true);
		try {
			const res = await apiClient.getres(`/api/PaymentTerms/Find?CustomerId=${customerid}&IsActive=true`, atoken);
			let data = res?.data ?? res;
			// support responses with .result
			if (data?.result) data = data.result;
			if (Array.isArray(data)) setPaymentTermsOptions(data);
			else setPaymentTermsOptions([]);
		} catch (err) {
			console.error('fetchPaymentTerms', err);
		} finally {
			setPaymentTermsLoading(false);
		}
	}, [customerid, atoken]);

	useEffect(() => {
		fetchPaymentTerms();
	}, [fetchPaymentTerms]);

	// initialize selected payment term if header has value
	useEffect(() => {
		if (!poSpecificDetails || paymentTermsOptions.length === 0) return;
		// prefer an explicit id if present
		const headerId = poSpecificDetails?.paymentTermsId ?? poSpecificDetails?.paymentTermId ?? null;
		if (headerId) {
			setSelectedPaymentTermId(headerId);
			return;
		}
		// try to match by label
		const matched = paymentTermsOptions.find(p => (p.paymentTerms || p.termsOfPayment || p.paymentTerm || '').trim() === (poSpecificDetails?.termsOfPayment || '').trim());
		if (matched) setSelectedPaymentTermId(matched.id ?? matched.paymentTermsId ?? matched.paymentTermId ?? null);
	}, [poSpecificDetails, paymentTermsOptions]);

	// Initialize PO Number and dates from poSpecificDetails
	useEffect(() => {
		if (poSpecificDetails) {
			if (poSpecificDetails.poNumber && !poNumberInput) {
				setPoNumberInput(poSpecificDetails.poNumber);
			}
			if (poSpecificDetails.pO_Date && !stagedPODate) {
				setStagedPODate(new Date(poSpecificDetails.pO_Date));
			}
			if (poSpecificDetails.confirmedDelDate && !expiryDate) {
				setExpiryDate(new Date(poSpecificDetails.confirmedDelDate));
			}
		}
	}, [poSpecificDetails]);

	// Reset or set Tab 0 completion based on stage and payment terms
	useEffect(() => {
		const isDraft = String(currentStage ?? "").toLowerCase().includes("draft");
		if (!isDraft) {
			// If not in draft, allow all tabs
			setIsTab0Complete(true);
		} else if (selectedPaymentTermId || poSpecificDetails?.termsOfPayment) {
			// If in draft but payment terms already exist, mark as complete
			setIsTab0Complete(true);
		} else {
			// In draft with no payment terms, mark as incomplete
			setIsTab0Complete(false);
		}
	}, [currentStage, selectedPaymentTermId, poSpecificDetails?.termsOfPayment]);

	const queryParams = new URLSearchParams(location.search);
	const [activityId, setActivityId] = useState(
		queryParams.get("ActivityId")?.trim()
	);

	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		const ActivityId = params.get("ActivityId");
		setActivityId(ActivityId ?? 0);
	}, [searchParams]);


	const [actionTypeFromURL, setActionTypeFromURL] = useState("");
	useEffect(() => {
		const getIdFromSearchParams = () => {

			const params = new URLSearchParams(searchParams);
			return params?.get("ActionType");
		};

		const newIdFromURL = getIdFromSearchParams();
		setActionTypeFromURL(newIdFromURL);

		if (actionTypeFromURL == "approval") {
			setValue(2);
		}
	}, [searchParams]);

	useEffect(() => {

		if (actionTypeFromURL == "approval") {
			setValue(2);
		}
		fetchPOHeaderList_Slug(pageSlug);
		fetchPODetails(initialValues_fetchPODetails);
	}, []);

	// Get user role rights for Purchase Order
	const getUserRoleRightsForPO = async () => {
		const obj = {
			FeatureName: "Purchase Order",
			UserId: userDetail?.id,
			CreatedById: userDetail?.id
		};
		const queryParams = buildQueryParams(obj);
		try {
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);
			if (res) {
				const permManager = new PermissionManager(res?.data);
				setPoPermissionManager(permManager);
			}
		} catch (err) {
			console.error("getUserRoleRightsForPO", err);
		} finally {
			markPermissionLoaded('po');
		}
	};

	// Get user role rights for Invoice
	const getUserRoleRightsForInvoice = async () => {
		const obj = {
			FeatureName: "Invoice",
			UserId: userDetail?.id,
			CreatedById: userDetail?.id
		};
		const queryParams = buildQueryParams(obj);
		try {
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);
			if (res) {
				const permManager = new PermissionManager(res?.data);
				setInvPermissionManager(permManager);
			}
		} catch (err) {
			console.error("getUserRoleRightsForInvoice", err);
		} finally {
			markPermissionLoaded('inv');
		}
	};

	//  Apply permissions when permissionManager is ready
	useEffect(() => {
		if (poPermissionManager) {
			applyPermissions();
		}
	}, [poPermissionManager]);

	// Function to apply permissions based on permissionManager
	const applyPermissions = () => {
		if (!poPermissionManager) return;

		// PO Details permissions
		setIsPoDetailsReadDisabled(
			!poPermissionManager.hasPermission('PO Details', ACTIONS.READ)
		);
		setIsPoDetailsEditDisabled(
			!poPermissionManager.hasPermission('PO Details', ACTIONS.EDIT)
		);
		setIsPoDetailsCreateDisabled(
			!poPermissionManager.hasPermission('PO Details', ACTIONS.CREATE)
		);

		// Item/Services permissions
		setIsItemServicesReadDisabled(
			!poPermissionManager.hasPermission('Items/Services', ACTIONS.READ)
		);
		setIsItemServicesEditDisabled(
			!poPermissionManager.hasPermission('Items/Services', ACTIONS.EDIT)
		);
		setIsItemServicesCreateDisabled(
			!poPermissionManager.hasPermission('Items/Services', ACTIONS.CREATE)
		);
		setIsItemServicesRemoveDisabled(
			!poPermissionManager.hasPermission('Items/Services', ACTIONS.REMOVE)
		);

		// Shipped History permissions
		setIsShippedHistoryReadDisabled(
			!poPermissionManager.hasPermission('Shipped History', ACTIONS.READ)
		);
		setIsShippedHistoryEditDisabled(
			!poPermissionManager.hasPermission('Shipped History', ACTIONS.EDIT)
		);
		setIsShippedHistoryCreateDisabled(
			!poPermissionManager.hasPermission('Shipped History', ACTIONS.CREATE)
		);

		// Work Flow permissions
		setIsWorkflowReadDisabled(
			!poPermissionManager.hasPermission('Work Flow', ACTIONS.READ)
		);
		setIsWorkflowEditDisabled(
			!poPermissionManager.hasPermission('Work Flow', ACTIONS.EDIT)
		);

		// Audit History permissions
		setIsAuditHistoryReadDisabled(
			!poPermissionManager.hasPermission('Audit History', ACTIONS.READ)
		);
	};

	// Fetch role rights on component mount
	useEffect(() => {
		getUserRoleRightsForPO();
		getUserRoleRightsForInvoice();
	}, [userDetail?.id]);

	const [stagelist, setStageList] = useState([]);

	const [allInvStageList, setAllInvStageList] = useState(null);

	const [invStagelist, setInvStageList] = useState(null);
	const [GRNIsActive, setGRNIsActive] = useState([]);

	useEffect(() => {
		if (eventType)
			StageFindAll(
				{ EventType: eventType, CustomerId: customerid, EventId: eventId },
				atoken
			).then((res) => {

				const result = res?.filter((item) => item.stageSeq > 0)
				setStageList(result);

				// const filteredGRN = res?.filter((rowData) => {
				// 	return rowData.isActive == true && rowData.stageName == "GRN";
				// });
				// setGRNIsActive(filteredGRN);
			});

		FetchPOShipHeaderList(initialValues_fetchPOShipHeader);
	}, [customerid, eventType]);

	useEffect(() => {
		StageFindAll(
			{ EventType: "INV", CustomerId: customerid, EventId: eventId },
			atoken
		).then((res) => {

			setAllInvStageList(res);
			const result = res?.filter((item) => item.stageSeq > 0)
			setInvStageList(result);

			const filteredGRN = res?.filter((rowData) => {

				return rowData.isActive == true && rowData.stageName == "GRN";
			});
			setGRNIsActive(filteredGRN);
		});

		FetchPOAttachments(initialValues_fetchPOAttachments);
	}, []);
	const [requestApprover, setRequestApprover] = useState({
		// EventId: allPOShipHeader[0]?.InvoiceDetails[0]?.id ?? 0,
		EventId: allPOShipHeader[0]?.id ?? 0,
		EventType: "INV",
	});
	const FetchPOShipHeaderList = useCallback(async () => {
		try {





			const resultds = await GetPOShipHeaderList(
				initialValues_fetchPOShipHeader,
				atoken
			);



			if (resultds.length > 0) {
				// Map data to ensure unique IDs for DataGrid (using invoiceId as unique identifier)
				let mappedData = resultds.map((item) => ({
					...item,
					uniqueRowId: `${item.id}-${item.invoiceId}`, // Create unique ID for DataGrid
				}));




				// Filter by invoiceId when ActionType=approval
				// Route is /purchase-order/:poId/:pageSlug, so poId = 273 (invoice ID to filter)
				if (actionTypeFromURL === "approval" && poId) {

					mappedData = mappedData.filter((item) => {
						const match = item.invoiceId?.toString() === poId?.toString();

						return match;
					});

				}

				setallPOShipHeader(mappedData);
				//setEvenType("INV");

				setEventStage(mappedData[0]?.stage || resultds[0]?.stage);
				setCurrentInvStage(mappedData[0]?.stage || resultds[0]?.stage);
				// setRequestApprover({ EventId: pageSlug, EventType: "INV" });
				// setRequestCell({
				// 	EventId: pageSlug,
				// 	EventType: "INV",
				// 	SortingColumn: "ApproverSeq",
				// 	//IsAscending:"True"
				// })

				// setRequestApprover({ EventId: allPOShipHeader[0]?.InvoiceDetails[0]?.id ?? 0, EventType: "INV" });
				setRequestApprover({ EventId: allPOShipHeader[0]?.id ?? 0, EventType: "INV" });
				setRequestCell({
					// EventId: allPOShipHeader[0]?.id ?? 0,
					EventId: poId ?? 0,
					EventType: "INV",
					SortingColumn: "ApproverSeq",
					CustomerId: customerid
				})
				//updateRequestCell(pageSlug)
				//setEventId(resultds[0]?.id)
				//setRequestApprover({EventId: eventId ? eventId: pageSlug, EventType:eventType})
			}
		} catch (error) {
			// Handle error
		}
	}, [initialValues_fetchPOShipHeader, cookies, eventStage, requestApprover, actionTypeFromURL, pageSlug]);
	// Re-fetch shipment data when actionTypeFromURL changes (for approval filtering)
	useEffect(() => {
		if (actionTypeFromURL) {

			FetchPOShipHeaderList();
		}
	}, [actionTypeFromURL, FetchPOShipHeaderList]);

	// const [requestApprover, setRequestApprover] = useState({
	// 	EventId: pageSlug,
	// 	EventType: "INV",
	// });

	const [stagearray, setStagearray] = useState([`PO Sent to Supplier`]);
	const [requestCell, setRequestCell] = useState({
		EventId: pageSlug,
		EventType: "PO",
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
	const [eventAppList, setEventAppList] = useState([]);
	const [wfupdate, setwfUpdate] = useState([false]);
	const handleEventAppList = useCallback((arr) => {
		setEventAppList(arr);
	}, []);
	const [shipConfirmDetails, setShipConfirmDetails] = useState(null);
	const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
	// Memoize the requestCell for INV to prevent unnecessary re-renders
	// Use the selected invoice ID instead of pageSlug
	const requestCellINV = useMemo(() => ({
		EventId: shipConfirmDetails?.invoiceId || selectedInvoiceId || 0,
		EventType: "INV",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
	}), [shipConfirmDetails, selectedInvoiceId, customerid]);

	const getNextStage = (dataSelect) => {

		// const filteredStage = invStagelist?.filter((rowData) => {
		// 	return rowData.isActive == true && rowData.stageName == dataSelect[0]?.stage;
		// });
		// const filterednextStage = invStagelist?.filter((rowData) => {
		// 	return rowData.isActive == true && rowData.stageSeq == filteredStage[0]?.stageSeq + 1;
		// });
		// setNextEventStage(filterednextStage[0]?.stageName);
		// return filterednextStage[0]?.stageName;

		const orderedStages = allInvStageList
			.filter(stage => stage.isActive)
			.sort((a, b) => {
				return a.stageSeq - b.stageSeq || a.id - b.id;
			});

		const currentStageName = dataSelect[0]?.stage?.trim().toLowerCase();

		const currentIndex = orderedStages.findIndex(
			stage => stage.stageName.trim().toLowerCase() === currentStageName
		);

		const nextStageName = orderedStages[currentIndex + 1]?.stageName;

		setNextEventStage(nextStageName || "");
		return nextStageName || "";
	};

	// const requestApprover = {
	//   EventId: eventId ? eventId: pageSlug,
	//   EventType:eventType

	// };




	//console.log("shipConfirmDetails::", shipConfirmDetails)
	const [poOrderItems, setPOOrderItems] = useState([]);
	//checkbox to handle selection of items
	const [selectedItems, setSelectedItems] = useState([]);
	const [isAllItemChecked, setIsAllItemChecked] = useState(true);
	const handleAllItemChecked = () => {
		setIsAllItemChecked(!isAllItemChecked);
		if (!isAllItemChecked) {
			// Select all items
			setSelectedItems(allPOItems);
		} else {
			// Deselect all items
			setSelectedItems([]);
		}
	};
	const onItemCheckboxChange = (item, isChecked) => {
		isChecked == true
			? setSelectedItems((prevSelectedItems) => [...prevSelectedItems, item])
			: setSelectedItems((prevSelectedItems) =>
				prevSelectedItems.filter(
					(selectedItem) => selectedItem.id !== item.id
				)
			);
	};

	const [selectAttachedFile, setSelectAttachedFile] = useState([]);
	const [selectPOAttachedFile, setSelectPoAttachedFile] = useState([]);

	const [fileType, setFileType] = React.useState("");
	const initialValues_fetchPOAttachments = {
		CustomerId: poSpecificDetails?.CustomerId,
		POHeaderId: pageSlug,
		POId: pageSlug,
		FileType: fileType,
	};

	const FetchPOAttachments = useCallback(async () => {
		try {
			const resultds = await GetPOAttachments(
				initialValues_fetchPOAttachments,
				atoken
			);

			if (resultds) {
				//console.log(resultds);

				setSelectAttachedFile(resultds);
				const filtered2 = resultds.filter((poattached) => {
					return poattached.fileType === "poconfirm";
				});

				setSelectPoAttachedFile(filtered2);
				// console.log('selectPOAttachedFile ', filtered2);
			}
		} catch (error) {
			// Handle error
		}
	}, [initialValues_fetchPOAttachments, cookies]);

	//for handling attachment Api
	const [attachmentfilters, setAttachmentFilters] = useState({
		id: 0,
		poHeaderId: pageSlug,
		poAttachmentDescription: "",
		poAttachment: "",
		fileType: "po_confirm_tab",
	});
	const handleAttachfileChange = (field) => (event) => {
		setAttachmentFilters((prevFilters) => ({
			...prevFilters,
			[field]: event.target.files[0].name.trim(),
		}));
	};

	const [showAttach, setShowAttach] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleAttachinputChange = (field) => (event) => {
		setAttachmentFilters((prevFilters) => ({
			...prevFilters,
			[field]: event.target.value,
		}));
	};

	//Formik Hooks
	const formik_PORejectOrder = useFormik_PORejectOrder(
		(values) => {
			PORejectOrder(values, stagelist, atoken).then(() => {
				setState({ ...state, openOrderReject: false });
			});
		},
		{
			poId: pageSlug,
		}
	);

	const formik_GRNAccepted = useFormik_GRNAccepted((values) => {
		POShipInvoiceGRN(
			pageSlug,
			selectedInvoiceRows,
			values,
			//invStagelist,
			allInvStageList,
			atoken
		).then(() => {
			
			setGrnSaveDisable(false);
			FetchPOShipHeaderList(initialValues_fetchPOShipHeader);
			fetchPOHeaderList_Slug(pageSlug);
			fetchPODetails(initialValues_fetchPODetails);
			setState({ ...state, openOrderGRNSubmit: false });

		});
	}, {});

	// const formik_InvoiceAccepted = useFormik_InvoiceAccepted((values) => {

	// 	POShipInvoiceApproval(
	// 		pageSlug,
	// 		selectedInvoiceRows,
	// 		values,
	// 		invStagelist,
	// 		activityId,
	// 		atoken
	// 	).then(() => {

	// 		setapproveSaveDisable(false);
	// 		FetchPOShipHeaderList(initialValues_fetchPOShipHeader);
	// 		fetchPOHeaderList_Slug(pageSlug);
	// 		fetchPODetails(initialValues_fetchPODetails);
	// 		setState({ ...state, openInvoiceApproved: false });
	// 		setActionTypeFromURL('');

	// 	});
	// }, {});


	const validationSchemaApprover = Yup.object().shape({
		// approveComment: yup.string().required("reason is required"),
		approveComment: Yup.string().required("reason is required")
	});
	const formik_InvoiceAccepted = useFormik({
		enableReinitialize: true,
		initialValues: {
			customerId: parseInt(customerid),
			eventId: parseInt(pageSlug),
			eventType: "Auction",
			status: true,
			vendorId: 0,
			remarks: "",
			activityId: parseInt(activityId),
			stageId: 0,
		},
		validationSchema: validationSchemaApprover,
		onSubmit: async (values) => {

			setLoading(true)
			const actionData = {
				customerId: parseInt(customerid),
				eventId: parseInt(poId),
				eventType: "INV",
				stageId: nstagevalue?.currentStageId,
				IsApproved: values?.status,
				activityId: parseInt(activityId),
				remarks: values?.approveComment,
				vendorId: 0,
				RecordCreatorId: shipCreatedById
			}

			console.log("actionData::", actionData);
			const res = await apiClient.postres(
				`/api/ApprovalAction/ApprovalAction`,
				actionData,
				atoken
			);

			if (res) {
				toast.success(`Invoice Approve Successfully.`);
				navigate(`/app`);
			}
			setLoading(false)
		},
	});

	const formik_POConfirmOrder = useFormik_POConfirmOrder(
		(values) => {
			POConfirmOrder(values, stagelist, atoken).then(() => {
				setState({ ...state, openOrderConfirm: false });
			});
		},
		{
			poId: pageSlug,
			ConfirmationNo: poSpecificDetails?.confirmationNo,
			SupplierRef: poSpecificDetails?.supplierRef,
			ConfirmedShipDate: new Date(poSpecificDetails?.confirmedShipDate),
			ConfirmedDelDate: new Date(poSpecificDetails?.confirmedDelDate),
			ShippingCost: poSpecificDetails?.shippingCost,
			Remarks: poSpecificDetails?.supplierRemarks,
		}
	);

	const formik_POShipHeader = useFormik_POShipHeader(
		(values) => {
			POShipHeader(values, stagelist, atoken);
		},
		{
			poId: pageSlug,
			customerId: poSpecificDetails?.customerId,
		}
	);

	const formik_POShipOrdrItem = useFormik_POShipOrdrItem((values) => {
		POShipOrdrItem(values, stagelist, atoken);
	});

	const formik_POShipInvoiceHeader = useFormik_POShipInvoiceHeader((values) => {
		POShipInvoiceHeader(values, stagelist, atoken);
	});

	const formik_POAttachments = useFormik_POAttachments((values) => {
		POAttachments(values, atoken);
	});

	//page related  state and function
	const [value, setValue] = React.useState(0);
	const handleChange = (event, newValue) => {
		// In draft mode, prevent navigation away from Tab 0 until payment terms are saved
		const isDraft = String(currentStage ?? "").toLowerCase().includes("draft");
		if (isDraft && value === 0 && newValue !== 0 && !isTab0Complete) {
			toast.warning("Please Fill PO Details");
			return;
		}
		
		if (newValue == 0) {
			fetchPOHeaderList_Slug(pageSlug);
			fetchPODetails(initialValues_fetchPODetails);
		} else if (newValue == 1) {
			fetchPODetails(initialValues_fetchPODetails);
		} else {
			FetchPOShipHeaderList(initialValues_fetchPOShipHeader);
		}
		setValue(newValue);
	};

	const [tabShipsNotice, setTabShipsNotice] = React.useState(0);
	const handleTabShipsNotice = (event, newValue) => {
		setTabShipsNotice(newValue);
	};
	const handleNextTabShipsNotice = (value) => {
		setTabShipsNotice(value);
	};

	const [grnSaveDisable, setGrnSaveDisable] = React.useState(false);

	const [approveSaveDisable, setapproveSaveDisable] = React.useState(false);

	useEffect(() => {

		getStageInfo(currentInvStage, allInvStageList)
	}, [currentInvStage, allInvStageList]);

		// Set eventType and eventId in Redux and pull message count for PO messaging
	useEffect(() => {
		if (eventId) {
			dispatch({ type: 'SET_EVENTID', value: eventId });
			dispatch({ type: 'SET_EVENTTYPE', value: 'PO' });
		}
	}, [eventId, dispatch]);

	useEffect(() => {
		if (userDetail?.id && eventType && eventId) {
			if (typeof window.pullMessageCount === 'function') {
				window.pullMessageCount({
					UserId: userDetail.id,
					EventType: eventType,
					EventId: eventId,
					IsVenderYN: 'N',
					atoken,
					dispatch
				});
			}
		}
	}, [userDetail, atoken, eventType, eventId, dispatch]);
	const getStageInfo = (currentStage, stageList) => {

		if (!stageList || stageList.length === 0) return null;

		const currentStageObj = stageList.find(stage => stage.stageName === currentStage);
		if (!currentStageObj) return null; // If current stage is not found

		const currentIndex = stageList.findIndex(item => item.stageName === currentStageObj.stageName);

		const nextStageObj = currentIndex !== -1 ? stageList[currentIndex + 1] : undefined;
		const prevStageObj = currentIndex > 0 ? stageList[currentIndex - 1] : undefined;

		return {
			prevStage: prevStageObj ? prevStageObj.stageName : null,
			prevStageId: prevStageObj ? prevStageObj.stageId : null,
			currentStage: currentStageObj.stageName,
			currentStageId: currentStageObj.stageId,
			nextStage: nextStageObj ? nextStageObj.stageName : null,
			nextStageId: nextStageObj ? nextStageObj.stageId : null
		};
	};
	const nstagevalue = getStageInfo(currentInvStage, allInvStageList);
	console.log("nstagevalue::", nstagevalue)
	const toggleDrawer = (anchor, open, dataSelect) => (event) => {

		//var nstagevalue = getNextStage(dataSelect);
		// const nstagevalue = getStageInfo(currentInvStage, allInvStageList);

		if (
			event.type === "keydown" &&
			(event.key === "Tab" || event.key === "Shift")
		) {
			return;
		}
		if (!open) {
			SetRef_ItemId(0);
		}
		setState({ ...state, [anchor]: open });
		if (anchor === "openCreateSheet") {

			setShipConfirmDetails(dataSelect);

			//console.log("shipConfirmDetails" , dataSelect);
		}
		;


		if (anchor == "openInvoiceApproved") {

			if (nstagevalue?.nextStage == 'Under Approval') {
				setGrnSaveDisable(false);
				setapproveSaveDisable(false);
			}
			// const allowedINVStages = [
			// 	undefined,
			// 	"",
			// 	"Partialy Shipped",
			// 	"Shipped",
			// 	"GRN",
			// 	"Invoice Raised",
			// 	"Under Approval",
			// 	"Pending for Payment",
			// 	"Paid"
			// ];

			// if (nstagevalue == 'Invoice Raised') {
			// if (nstagevalue?.nextStage == 'Invoice Raised') {
			// 	setGrnSaveDisable(false);
			// }
			// else {
			// 	
			// 	setapproveSaveDisable(true);
			// 	// if (!allowedINVStages.includes(nstagevalue)) {
			// 	if (!allowedINVStages.includes(nstagevalue?.nextStage)) {
			// 		toast("Stage of Event is not valid for Invoice Approval!", {
			// 			hideProgressBar: true,
			// 			autoClose: 1000,
			// 			type: "success",
			// 		});
			// 	}
			// }

			// if (dataSelect[0]?.stage == 'Invoice Raised') {
			// 	setapproveSaveDisable(false);
			// }
			// else {
			// 	setapproveSaveDisable(true);
			// 	toast("Stage of Event is not valid for Invoice Approval!", {
			// 		hideProgressBar: true,
			// 		autoClose: 1000,
			// 		type: "success",
			// 	});
			// }
		}

		if (anchor == "openOrderGRNSubmit") {


			// const allowedStages = [
			// 	undefined,
			// 	"",
			// 	"Partialy Shipped",
			// 	"Shipped",
			// 	"GRN",
			// 	"Invoice Raised",
			// 	"Under Approval",
			// 	"Pending for Payment",
			// 	"Paid"
			// ];
			// 
			// // if (nstagevalue == 'GRN') {
			// if (nstagevalue?.nextStage == 'GRN') {
			// 	setGrnSaveDisable(false);
			// }
			// else {

			// 	setGrnSaveDisable(true);
			// 	// if (!allowedStages.includes(nstagevalue)) {
			// 	if (!allowedStages.includes(nstagevalue?.nextStage)) {
			// 		toast("Stage of Event is not valid for GRN!", {
			// 			hideProgressBar: true,
			// 			autoClose: 1000,
			// 			type: "success",
			// 		});
			// 	}
			// }

			// if (nstagevalue?.currentStage == 'GRN') {
			if (nstagevalue?.currentStage == 'Shipped') {
				setGrnSaveDisable(false);
				setapproveSaveDisable(false);
			}
			else {
				setGrnSaveDisable(true);
				setapproveSaveDisable(false);
			}

			if (
				dataSelect &&
				dataSelect[0]?.grnNumber != "" &&
				dataSelect[0]?.grnNumber != null &&
				dataSelect[0]?.grnNumber != undefined
			) {
				//setGrnSaveDisable(true);
				formik_GRNAccepted.setFieldValue(
					"grnDate",
					new Date(dataSelect[0]?.grnDate)
				);
			}
			formik_GRNAccepted.setFieldValue("grnNumber", dataSelect[0]?.grnNumber);
			formik_GRNAccepted.setFieldValue("grnAmount", dataSelect[0]?.grnAmount);
			formik_GRNAccepted.setFieldValue("grnQuantity", dataSelect[0]?.grnQuantity);
		}
	};

	const [returnfileName, setReturnfileName] = useState("");
	const handleAddClick = async (attachmentfilters) => {
		let retunvalue = await POAttachments(attachmentfilters, cookies);

		setReturnfileName(retunvalue.data);
		retunvalue ? setShowAttach(true) : setShowAttach(false);
		//setInputList([...inputList, { id: "", name: "", deleteFlag: false }]);
	};

	const [state, setState] = useState({
		openCreateSheet: false,
		openOrderConfirm: false,
		openOrderReject: false,
		openPaymentDetails: false,
	});
	//console.log(poSpecificDetails);
	const [selectedRows, setSelectedRows] = React.useState([]);
	const [selectedInvoiceRows, setSelectedInvoiceRows] = React.useState([]);
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [loadingPayment, setLoadingPayment] = useState(false);
	const [openRows, setOpenRows] = useState({});
	const [selectedItemIds, setSelectedItemIds] = useState(new Set());
	const [itemInputs, setItemInputs] = useState({});
	const [validationErrors, setValidationErrors] = useState({});
	const [disableGrnBtn, setDisableGrnBtn] = useState(false);
	const expandedRowRefs = useRef({});

	console.log("selectedItemIds:::::::", selectedItemIds)

	// const handleToggleRow = (rowId) => {
	// 	setOpenRows((prev) => ({
	// 		...prev,
	// 		[rowId]: !prev[rowId],
	// 	}));
	// };

	// const handleToggleRow = (rowId) => {
	// 	setOpenRows((prev) => {
	// 		const isCurrentlyOpen = !!prev[rowId];
	// 		const next = { ...prev, [rowId]: !isCurrentlyOpen };

	// 		// If closing the row → reset inputs + checkboxes
	// 		if (isCurrentlyOpen) {
	// 			// 1. Find all shipment items for that row
	// 			const row = allPOShipHeader.find(r => r.id === rowId);
	// 			if (row?.shipmentDetails?.length) {
	// 				const itemIds = row.shipmentDetails.map(item => item.id);

	// 				// 2. Clear itemInputs for those items
	// 				setItemInputs(prevInputs => {
	// 					const nextInputs = { ...prevInputs };
	// 					itemIds.forEach(id => {
	// 						delete nextInputs[id]; // remove saved values
	// 					});
	// 					return nextInputs;
	// 				});

	// 				// 3. Uncheck checkboxes for those items
	// 				setSelectedItemIds(prevSet => {
	// 					const nextSet = new Set(prevSet);
	// 					itemIds.forEach(id => nextSet.delete(id));
	// 					return nextSet;
	// 				});

	// 				// 4. Also clear validation errors for those items
	// 				setValidationErrors(prevErrors => {
	// 					const nextErrors = { ...prevErrors };
	// 					itemIds.forEach(id => {
	// 						delete nextErrors[id];
	// 					});
	// 					return nextErrors;
	// 				});
	// 			}
	// 		}
	// 		return next;
	// 	});
	// };
	const getValidationStyle = (isValid) => {
		// null / undefined → normal text
		if (isValid === null || isValid === undefined) {
			return {
				color: 'inherit',
			};
		}

		// true → green text
		if (isValid === true) {
			return {
				color: '#4caf50', // green
				fontWeight: 600,
			};
		}

		// false → red text
		return {
			color: '#f44336', // red
			fontWeight: 600,
		};
	};

	// const getValidationStyle = (isValid) => {
	// 	// null or undefined → no color
	// 	if (isValid === null || isValid === undefined) {
	// 		return {
	// 			backgroundColor: 'transparent',
	// 			border: '1px solid transparent',
	// 			color: 'inherit',
	// 		};
	// 	}

	// 	// true → green
	// 	if (isValid === true) {
	// 		return {
	// 			backgroundColor: '#e8f5e9', // light green
	// 			border: '1px solid #4caf50',
	// 			color: '#4caf50',
	// 		};
	// 	}

	// 	// false → red
	// 	return {
	// 		backgroundColor: '#ffebee', // light red
	// 		border: '1px solid #f44336',
	// 		color: '#f44336',
	// 	};
	// };



	const handleToggleRow = (rowId) => {
		console.log('🔵 handleToggleRow called with rowId:', rowId);

		setOpenRows((prev) => {
			const isCurrentlyOpen = !!prev[rowId];
			console.log('📊 Current openRows state:', prev);
			console.log('📌 Row', rowId, 'is currently:', isCurrentlyOpen ? 'OPEN' : 'CLOSED');

			const next = {};

			if (!isCurrentlyOpen) {
				console.log('✅ OPENING row:', rowId);

				// 👉 Close all other rows and clear their data
				allPOShipHeader.forEach(r => {
					if (prev[r.uniqueRowId]) {
						console.log('🔴 Closing other row:', r.uniqueRowId);
						// If it was open before, clear its data
						if (r?.shipmentDetails?.length) {
							const itemIds = r.shipmentDetails.map(item => item.id);

							setItemInputs(prevInputs => {
								const nextInputs = { ...prevInputs };
								itemIds.forEach(id => delete nextInputs[id]);
								return nextInputs;
							});

							setSelectedItemIds(prevSet => {
								const nextSet = new Set(prevSet);
								itemIds.forEach(id => nextSet.delete(id));
								return nextSet;
							});

							setValidationErrors(prevErrors => {
								const nextErrors = { ...prevErrors };
								itemIds.forEach(id => delete nextErrors[id]);
								return nextErrors;
							});
						}
					}
				});

				// 👉 Open the current row and auto-select all its items
				next[rowId] = true;
				const row = allPOShipHeader.find(r => r.uniqueRowId === rowId);
				console.log('🔍 Found row:', row ? 'YES' : 'NO', 'Shipment details count:', row?.shipmentDetails?.length || 0);

				if (row?.shipmentDetails?.length) {
					const itemIds = row.shipmentDetails.map(item => item.id);
					console.log('📦 Auto-selecting items:', itemIds);
					setSelectedItemIds(prevSet => {
						const nextSet = new Set(prevSet);
						itemIds.forEach(id => nextSet.add(id));
						return nextSet;
					});
				}
			} else {
				console.log('❌ CLOSING row:', rowId);
				// 👉 If clicking to close the same row, just close & clear
				next[rowId] = false;
				const row = allPOShipHeader.find(r => r.uniqueRowId === rowId);
				if (row?.shipmentDetails?.length) {
					const itemIds = row.shipmentDetails.map(item => item.id);

					setItemInputs(prevInputs => {
						const nextInputs = { ...prevInputs };
						itemIds.forEach(id => delete nextInputs[id]);
						return nextInputs;
					});

					setSelectedItemIds(prevSet => {
						const nextSet = new Set(prevSet);
						itemIds.forEach(id => nextSet.delete(id));
						return nextSet;
					});

					setValidationErrors(prevErrors => {
						const nextErrors = { ...prevErrors };
						itemIds.forEach(id => delete nextErrors[id]);
						return nextErrors;
					});
				}
			}

			return next;
		});

		// Scroll to expanded row after state update
		if (!openRows[rowId]) {
			setTimeout(() => {
				const expandedElement = expandedRowRefs.current[rowId];
				if (expandedElement) {
					expandedElement.scrollIntoView({
						behavior: 'smooth',
						block: 'nearest',
						inline: 'nearest'
					});
				}
			}, 100);
		}
	};


	const handleSelectAllRow = (rowId, checked) => {
		const row = allPOShipHeader.find(r => r.uniqueRowId === rowId || r.id === rowId);
		if (!row?.shipmentDetails) return;

		const itemIds = row.shipmentDetails.map(item => item.id);

		setSelectedItemIds(prev => {
			const next = new Set(prev);
			if (checked) {
				itemIds.forEach(id => next.add(id));
			} else {
				itemIds.forEach(id => next.delete(id));
			}
			return next;
		});
	};


	const handleCheckboxChange = (itemId, checked) => {

		setSelectedItemIds((prev) => {
			const updated = new Set(prev);
			checked ? updated.add(itemId) : updated.delete(itemId);
			return updated;
		});
	};

	// const handleItemInputChange = (itemId, field, value) => {
	// 	setItemInputs((prev) => ({
	// 		...prev,
	// 		[itemId]: {
	// 			...prev[itemId],
	// 			[field]: value,
	// 		},
	// 	}));
	// };

	// const handleItemInputChange = (itemId, field, value) => {

	// 	setItemInputs((prev) => {
	// 		const updatedItem = {
	// 			...prev[itemId],
	// 			[field]: value,
	// 		};

	// 		// if the user changes the `qty`, update the qtyQcFailed
	// 		if (field === 'qty') {
	// 			// const shipQty = allPOShipHeader
	// 			// 	.flatMap((row) =>
	// 			// 		// row.InvoiceDetails?.flatMap((detail) => detail.shipmentDetails ?? []) ?? []
	// 			// 		row.shipmentDetails?.flatMap((detail) => detail.shipmentDetails ?? []) ?? []
	// 			// 	)
	// 			// 	.find((item) => item.id === itemId)?.shipQty;
	// 			const shipQty = allPOShipHeader
	// 				.flatMap(row => row.shipmentDetails ?? [])
	// 				.find(item => item.id === itemId)?.shipQty;
	// 			if (shipQty !== undefined) {
	// 				updatedItem.qtyQcFailed = Number(shipQty) > Number(value) ? Number(shipQty) - Number(value) : 0;
	// 			}
	// 		}

	// 		return {
	// 			...prev,
	// 			[itemId]: updatedItem,
	// 		};
	// 	});
	// };

	// const handleItemInputChange = (itemId, field, value) => {
	// 	setItemInputs((prev) => {
	// 		let updatedValue = value;

	// 		const updatedItem = {
	// 			...prev[itemId],
	// 			[field]: updatedValue,
	// 		};

	// 		if (field === 'qty') {
	// 			const shipQty = allPOShipHeader
	// 				.flatMap(row => row.shipmentDetails ?? [])
	// 				.find(item => item.id === itemId)?.shipQty;

	// 			if (shipQty !== undefined) {
	// 				if (Number(updatedValue) > Number(shipQty)) {
	// 					updatedValue = shipQty;
	// 					updatedItem[field] = shipQty;
	// 				}

	// 				// update QC Failed
	// 				updatedItem.qtyQcFailed =
	// 					Number(shipQty) > Number(updatedValue)
	// 						? Number(shipQty) - Number(updatedValue)
	// 						: 0;
	// 			}
	// 		}

	// 		return {
	// 			...prev,
	// 			[itemId]: updatedItem,
	// 		};
	// 	});
	// };


	const fieldToErrorKey = {
		grnno: "grnNumber",
		amount: "grnAmount",
		qty: "grnQuantity",
		qcFailed: "qcFailed",
		grnDate: "grnDate",
	};

	const handleItemInputChange = (itemId, field, value) => {
		const errorKey = fieldToErrorKey[field] || field;

		// get shipQty once (used for clamp + validation context)
		const shipQty = allPOShipHeader
			.flatMap(row => row.shipmentDetails ?? [])
			.find(item => item.id === itemId)?.shipQty;

		setItemInputs(prev => {
			let updatedValue = value;
			const prevItem = prev[itemId] || {};
			const updatedItem = { ...prevItem, [field]: updatedValue };

			if (field === "qty") {
				if (shipQty !== undefined) {
					if (Number(updatedValue) > Number(shipQty)) {
						updatedValue = shipQty;
						updatedItem[field] = shipQty;
					}
					// Only auto-calculate if user hasn't manually set qcFailed
					if (prevItem.qcFailedManual !== true) {
						updatedItem.qcFailed =
							Number(shipQty) > Number(updatedValue)
								? Number(shipQty) - Number(updatedValue)
								: 0;
					}
				}
			}

			// Mark qcFailed as manually edited
			if (field === "qcFailed") {
				updatedItem.qcFailedManual = true;
			}

			// Build a snapshot for field-level validation
			const snapshot = {
				grnNumber: field === "grnno" ? updatedItem.grnno : (prevItem?.grnno ?? ""),
				grnAmount: field === "amount" ? updatedItem.amount : (prevItem?.amount ?? ""),
				grnQuantity: field === "qty" ? updatedItem.qty : (prevItem?.qty ?? ""),
				qcFailed: field === "qcFailed" ? updatedItem.qcFailed : (prevItem?.qcFailed ?? 0),
				grnDate: field === "grnDate" ? updatedItem.grnDate : (prevItem?.grnDate ?? ""),
			};

			// Validate just the changed field; clear/set only that field's error
			validationSchema_GRNAccepted
				.validateAt(errorKey, snapshot, { context: { shipQty, grnQuantity: snapshot.grnQuantity } })
				.then(() => {
					setValidationErrors(prevErrors => {
						if (!prevErrors[itemId]) return prevErrors;
						const next = { ...prevErrors, [itemId]: { ...prevErrors[itemId] } };
						delete next[itemId][errorKey];
						if (Object.keys(next[itemId]).length === 0) delete next[itemId];
						return next;
					});
				})
				.catch(err => {
					setValidationErrors(prevErrors => ({
						...prevErrors,
						[itemId]: { ...(prevErrors[itemId] || {}), [errorKey]: err.message },
					}));
				});

			return { ...prev, [itemId]: updatedItem };
		});
	};


	const validationSchema_GRNAccepted = Yup.object().shape({
		grnNumber: Yup.string()
			.required("GRN no is required"),
		// grnAmount: Yup.number()
		// 	.typeError("Amount must be a number")
		// 	.positive("Amount must be positive")
		// 	.required("GRN Amount is required"),
		grnQuantity: Yup.number()
			.typeError("Qty must be a number")
			.positive("Qty must be positive")
			.required("Qty is required")
			.test("max-shipQty", "GRN Qty cannot exceed shipped qty", function (value) {
				const { shipQty } = this.options.context || {};
				return !shipQty || value <= shipQty;
			}),
		qcFailed: Yup.number()
			.typeError("QC Failed must be a number")
			.min(0, "QC Failed cannot be negative")
			.test("max-qcFailed", "Input exceeds the maximum allowed.", function (value) {
				const { shipQty, grnQuantity } = this.options.context || {};
				if (!value || !shipQty || !grnQuantity) return true;
				const maxQcFailed = Number(shipQty) - Number(grnQuantity);
				return value <= maxQcFailed;
			})
			.nullable(),
		grnDate: Yup.date()
			.typeError("Please enter a valid date")
			.required("Date is required"),
	});


	const handleSubmitGRN = async (rowId) => {

		// Find the specific row's shipment details
		const currentRow = allPOShipHeader.find(r => r.uniqueRowId === rowId);
		if (!currentRow?.shipmentDetails) {
			toast.error("No shipment details found for this row.");
			return;
		}

		// Check if this row is for service items
		const isServiceRow = currentRow.shipmentDetails.some(item => isServiceItem(item));

		// Get item IDs only from this row
		const rowItemIds = currentRow.shipmentDetails.map(item => item.id);
		const selectedIdsArray = rowItemIds.filter(id => selectedItemIds.has(id));

		if (selectedIdsArray.length === 0) {
			toast.error(`Please select at least one item to ${isServiceRow ? 'approve' : 'submit GRN'}.`);
			return;
		}

		//console.log("Selected Item IDs:", selectedIdsArray);
		let allErrors = {};

		// Only validate for material items (not for service items)
		if (!isServiceRow) {
			for (const itemId of selectedIdsArray) {
				const input = itemInputs[itemId] || {};

				try {
					await validationSchema_GRNAccepted.validate(
						{
							grnNumber: input?.grnno,
							grnAmount: 0,
							grnQuantity: input?.qty,
							grnDate: input?.grnDate,
						},
						{ abortEarly: false }
					);
				} catch (error) {
					if (error.inner && error.inner.length > 0) {
						allErrors[itemId] = {};
						error.inner.forEach((err) => {
							allErrors[itemId][err.path] = err.message;
						});
					}
				}
			}

			if (Object.keys(allErrors).length > 0) {
				setValidationErrors(allErrors);
				toast.error("Please fill in GRN Date, GRN No, and Quantity for all selected items.");
				return;
			}
		}

		// Clear validation errors on success
		setValidationErrors({});

		// Build payload only for selected items in this row
		const payload = selectedIdsArray.map((itemId) => {
			const input = itemInputs[itemId];
			const item = currentRow.shipmentDetails.find(detail => detail.id === itemId);

			const stageData = allInvStageList.find(s => s.currentStage === currentInvStage) || null;

			if (isServiceRow) {
				// For service items: GRN number not mandatory, use service end date as GRN date
				return {
					"id": currentRow?.id,
					"batchId": itemId,
					"poId": currentRow?.poId,
					"grnQuantity": parseFloat(input?.qty || item?.shipQty || 0),
					"qtyQcFailed": 0,
					"grnNumber": input?.grnno || "",
					"grnAmount": 0,
					"grnDate": item?.serviceEndDate || new Date().toISOString(),
					"customerId": currentRow?.customerId,
					"stage": currentInvStage,
					"itemNo": item?.itemNo || "",
					"stages": stageData
				};
			} else {
				// For material items: existing validation applies
				// Determine QC Failed: manual, input, or auto-calc
				let qtyQcFailed = 0;
				if (input.qcFailedManual) {
					qtyQcFailed = parseFloat(input.qcFailed) || 0;
				} else if (input.qcFailed !== undefined) {
					qtyQcFailed = parseFloat(input.qcFailed) || 0;
				} else if (item.shipQty !== undefined && input.qty !== undefined) {
					qtyQcFailed = Number(item.shipQty) > Number(input.qty) ? Number(item.shipQty) - Number(input.qty) : 0;
				}
				return {
					"id": currentRow?.id,
					"batchId": itemId,
					"poId": currentRow?.poId,
					"grnQuantity": parseFloat(input.qty),
					"qtyQcFailed": qtyQcFailed,
					"grnNumber": input.grnno,
					"grnAmount": 0,
					"grnDate": input.grnDate,
					"customerId": currentRow?.customerId,
					"stage": currentInvStage,
					"itemNo": item?.itemNo || "",
					"stages": stageData
				};
			}
		});
		console.log("PayloadforAPI:", payload);
		;
		const data = getPayloadWithStage('currentStage', currentInvStage, allInvStageList, payload, 'currentStage');

		const res = await apiClient.postres(
			`/api/poinvoice/GRN`,
			data,
			atoken
		);
		if (res) {
			toast.success(`${isServiceRow ? 'Service approved' : 'GRN submitted'} successfully.`);
			setDisableGrnBtn(true);
			FetchPOShipHeaderList(initialValues_fetchPOShipHeader)
		}
		else {
			toast.error(`${isServiceRow ? 'Service approval' : 'GRN submission'} failed.`);
			setDisableGrnBtn(false);
		}
	};

	// Fetch payment details
	const fetchPaymentDetails = async (invoiceHId) => {
		try {
			setState(prevState => ({ ...prevState, openPaymentDetails: true }));
			setLoadingPayment(true);
			const response = await apiClient.get(`/api/poinvoice/InvoicePaymentDetails?invoiceHid=${invoiceHId}`, {
				headers: {
					Authorization: `Bearer ${atoken}`,
				},
			});
			;
			console.log("Payment Details Response:", response.data);
			console.log("Type of response.data:", typeof response.data, "Is Array:", Array.isArray(response.data));
			setPaymentDetails(response);
		} catch (error) {
			console.error("Error fetching payment details:", error);
			toast.error("Failed to fetch payment details");
			setPaymentDetails(null);
		} finally {
			setLoadingPayment(false);
		}
	};

	// console.log('selectedRows', selectedRows)
	const columns = [
		{
			field: "itemNo",
			headerName: "Item Number",
			width: 100,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={() => handleRowClick(params)}
					className="textLigblue"
				>
					{params?.formattedValue}
				</div>
			)
		},
		{
			field: "itemType",
			headerName: "Item Type",
			width: 100,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "itemDesc",
			headerName: "Item Desc",
			width: 300,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "poDeliveryDate",
			headerName: "PO Delivery Date",
			flex: 1.3,
			minWidth: 150,
			renderCell: (params) => {
				const formattedDate = params?.value
					? formatDateViaTimeZone(params.value, "en-GB", formatoption)
					: "Not Confirmed";
				const itemId = params.row?.id;
				const stagedDate = deliveryUpdates[itemId];
				const display = stagedDate ? formatDateViaTimeZone(stagedDate, "en-GB", formatoption) : formattedDate;
				return (
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-between' }}>
						<div style={{ cursor: 'pointer' }} onClick={() => { /* no-op click */ }}>
							{display}
						</div>
						<IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeliveryDialogRow(params.row); setDeliveryDialogDate(params.value ? new Date(params.value) : null); setDeliveryDialogOpen(true); }}>
						<HiPencilAlt className="f17 text-primary" />
						</IconButton>
					</div>
				);
			}
		}
		,

		{
			field: "quantity",
			headerName: "Quantity",
			width: 100,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "uom",
			headerName: "UOM",
			width: 100,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "materialPONetPrice",
			headerName: "PO Unit Price",
			width: 100,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "totalAmount",
			headerName: "Total Amount",
			width: 100,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}

				>
					{params?.formattedValue}
				</div>
			)
		},
		{
			field: "totalShipQty",
			headerName: "Total Ship Quantity",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue ?? 0}
				</div>
			)
		},
		{
			field: "status",
			headerName: "Status",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue ?? "Not Confirmed"}
				</div>
			)
		},
		{
			field: "plantName",
			headerName: "Plant",
			width: 250,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer', color: '#1976d2' }}
					onClick={() => handleRowClick(params)}
				>
					{params?.formattedValue}
				</div>
			),
		},

	];
	const getRowId = (row) => {
		//console.log('getrowid', row.id)
		return row.id;
	};

	const [selectedRow, setSelectedRow] = useState(null);

	const handleRowClick = (rows) => {
		// Prevent navigation to shipped history in draft mode
		if (String(currentStage ?? "").toLowerCase().includes("draft")) {
			return;
		}

		SetRef_ItemId(rows?.row?.id);
		console.log("handleRowClick ", rows.row);
		setPOOrderItems(rows.row);
		FetchPOShipHeaderList(initialValues_fetchPOShipHeader);
		setValue(2);
	};

	// Helper function to check if a row contains service items
	const isServiceRow = (row) => {
		return row?.shipmentDetails?.some(shipItem => {
			const poItem = allPOItems?.find(po => po.itemNo === shipItem.itemNo);
			return poItem?.itemType?.toLowerCase() === 'service';
		});
	};

	// Helper function to check if an individual item is a service
	const isServiceItem = (item) => {
		// Return false if item is null/undefined
		if (!item) {
			return false;
		}
		// First check if itemType is directly on the item
		if (item?.itemType) {
			return item.itemType.toLowerCase() === 'service';
		}
		// Otherwise, look it up from allPOItems by itemNo
		if (!item.itemNo || !allPOItems || allPOItems.length === 0) {
			return false;
		}
		const poItem = allPOItems.find(po => po.itemNo === item.itemNo);
		return poItem?.itemType?.toLowerCase() === 'service';
	};

	const renderMappingIcon = (value, reason = '') => {
		if (value === null || value === undefined) {
			return null;
		}

		const icon = value === true ? (
			<svg width="30" height="30" viewBox="0 0 40 40">
				<circle cx="20" cy="20" r="15" fill="#4caf50" />
				<path d="M14 20 L18 24 L26 16" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		) : (
			<svg width="30" height="30" viewBox="0 0 40 40">
				<circle cx="20" cy="20" r="15" fill="#f44336" />
				<path d="M15 15 L25 25 M25 15 L15 25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
			</svg>
		);

		// If no reason provided, just show the icon
		if (!reason) {
			return icon;
		}

		// Wrap icon in tooltip with reason
		return (
			<Tooltip
				title={reason}
				arrow
				placement="top"
				sx={{
					'& .MuiTooltip-tooltip': {
						fontSize: '0.875rem',
						maxWidth: 300,
						backgroundColor: value ? '#4caf50' : '#f44336',
					},
					'& .MuiTooltip-arrow': {
						color: value ? '#4caf50' : '#f44336',
					}
				}}
			>
				<div style={{ display: 'inline-flex', cursor: 'help' }}>
					{icon}
				</div>
			</Tooltip>
		);
	};

	const POInvoiicecolumns = [
		{
			field: "shippingDate",
			headerName: "Shipping Date",
			width: 150,
			renderCell: (params) => (
				<div
					className="textLigblue"
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "shippingDate" });

					}}
				>
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
			field: "deliveryDate",
			headerName: "Delivery Date",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "deliveryDate" });
					}}
				>
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
			field: "status",
			headerName: "Status",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "status" });
					}}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "invoiceNo",
			headerName: "Invoice Number",
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "invoiceNo" });
					}}
				>
					{params?.formattedValue}
				</div>
			),
			width: 150,
		},
		{
			field: "invoiceAmount",
			headerName: "Invoice Amount",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "invoiceAmount" });
					}}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "invoiceDate",
			headerName: "Invoice Date",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "invoiceDate" });
					}}
				>
					{params?.formattedValue
						? formatDateViaTimeZone(
							params?.formattedValue,
							"en-GB",
							formatoption
						)
						: ""}
				</div>
			),
		},
		{
			field: "stage",
			headerName: "Invoice Status",
			width: 150,
			renderCell: (params) => (
				<div
					style={{ cursor: 'pointer' }}
					onClick={(e) => {
						e.stopPropagation();
						handleInvoiceRowClick({ row: params.row, field: "stage" });
					}}
				>
					{params?.formattedValue}
				</div>
			),
		},
		{
			field: "payment",
			headerName: "Payment",
			width: 100,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) => (
				params.row.stage === "Paid" && params.row.invoiceHId ? (
					<IconButton
						size="small"
						color="primary"
						onClick={(e) => {
							e.stopPropagation();
							fetchPaymentDetails(params.row.invoiceHId);
						}}
						disabled={loadingPayment}
					>
						<MdReceipt size={20} />
					</IconButton>
				) : null
			),
		},
		// {
		// 	field: "viewItem",
		// 	headerName: "Invoice Detail",
		// 	width: 100,
		// 	renderCell: (params) => (
		// 		// <Chip
		// 		// 	icon={<HiOutlineLink />}
		// 		// 	size="small"
		// 		// 	color="primary"
		// 		// 	className="ps-1"
		// 		// 	variant="outlined"
		// 		// 	label="View"
		// 		// 	as={Link}
		// 		// >
		// 		// 	<Link to={handleInvoiceRowClick} state={params?.row} className="textLigblue">
		// 		// 		{params?.formattedValue}
		// 		// 	</Link>
		// 		// </Chip>
		// 		<Chip
		// 			icon={<HiOutlineLink />}
		// 			size="small"
		// 			color="primary"
		// 			className="ps-1"
		// 			variant="outlined"
		// 			label="View"
		// 			onClick={(e) => {
		// 				e.stopPropagation(); // don't trigger row selection
		// 				handleInvoiceRowClick({ row: params.row, field: "viewItem" });
		// 			}}
		// 		/>
		// 	),
		// },
		{
			field: "invoiceFile",
			headerName: "Invoice Attachment",
			width: 150,
			renderCell: (params) => (
				params.formattedValue ? <Chip
					icon={<HiOutlineLink />}
					size="small"
					color="primary"
					className="ps-1"
					variant="outlined"
					label="Download"
					as={Link}
				></Chip> : <>No attachments</>
			),
		},
		{
			field: "manageGRN",
			headerName: "Manage GRN",
			width: 120,
			sortable: false,
			disableColumnMenu: true,
			renderCell: (params) => (
				<Button
					variant="outlined"
					size="small"
					color="primary"
					disabled={isShippedHistoryEditDisabled}
					startIcon={openRows[params.row.uniqueRowId] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
					onClick={(e) => {

						e.stopPropagation();
						setInvStatus(params.row.status);
						handleToggleRow(params.row.uniqueRowId);
						setSelectedInvoiceRows([params.row]);
						setDisableGrnBtn(false);
						console.log('✅ Button click handler completed');
					}}
				>
					{openRows[params.row.uniqueRowId] ? "" : ""}
				</Button>
			),
		},

	];


	const [shipCreatedById, setShipCreatedById] = useState(0);

	const handleApprover = (show) => {
		setApproverShow(show);
	};

	const handleInvoiceRowClick = (rows) => {

		setApproverShow(true);
		setCurrentInvStage(rows?.row?.stage);
		var anchor = "openCreateSheet";

		if (
			rows.field == "shippingDate" ||
			rows.field == "deliveryDate" ||
			rows.field == "invoiceNo" ||
			rows.field == "status" ||
			rows.field == "invoiceAmount" ||
			rows.field == "invoiceDate" ||
			rows.field == "stage" ||
			rows.field == "viewItem"
		) {
			console.log("rows.row  ", rows.row);

			setSelectedInvoiceId(rows?.row?.invoiceId);
			setShipCreatedById(rows?.row?.createdById);
			setCurrentInvStage(rows?.row?.stage);
			setShipConfirmDetails(rows.row);
			toggleDrawer("openCreateSheet", true, rows.row);
			setState({ ...state, [anchor]: true });
			setTabShipsNotice(0);
		}
		else if (rows.field == "invoiceFile") {

			downloadFilesOnAzure(rows.row.invoicePath, atoken);
			// downloadFilesOnAzure(rows.row.invoicePath + "/" + rows.row.invoiceFile, atoken);
		}
	};

	if (loadingPermissions || !invStagelist) {
		return (
			<GridSkeleton />
		)
	}
	return (
		<>
			<div className="mainContainer d-flex" style={{ overflow: 'hidden' }}>
				<div className="leftContent col-12 d-flex flex-column">
					<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
						<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2" style={{ flexShrink: 0 }}>
							<div className="d-flex flex-column">
								<div className="d-flex align-items-center gap-2 mb-1">
	<BackButton
		title={
			<span className="page-heading">
				Purchase Order: {poNumberInput || poSpecificDetails?.poNumber || ''}
			</span>
		}
		modal={true}
	/>
</div>
								<div className="d-flex align-items-center gap-2 ms-5">
									<Chip
										label={poSpecificDetails?.stage}
										color="success"
										size="small"
										sx={{ fontWeight: 500 }}
									/>
									<Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 1 }}>
										PO Date: {formatDateViaTimeZone(
											stagedPODate ?? poSpecificDetails?.pO_Date ?? poSpecificDetails?.createdOn,
											"en-GB",
											formatoption
										)}
										{/* {String(currentStage ?? "").toLowerCase().includes("draft") && (
											<IconButton 
												size="small" 
												onClick={() => {
													setPoDateDialogValue(stagedPODate ?? (poSpecificDetails?.pO_Date ? new Date(poSpecificDetails.pO_Date) : new Date(poSpecificDetails?.createdOn)));
													setPoDateDialogOpen(true);
												}}
											>
												<HiPencilAlt className="f17 text-primary" />
											</IconButton>
										)} */}
									</Typography>
								</div>
							</div>
							{/* Stage Flow - centered */}
							<div className="d-flex justify-content-center flex-grow-1">
								<MemoizedEventStageFlow
									stagelist={stagelist}
									currentStage={currentStage}
								/>
							</div>
							{/* Save & Continue - right side, Draft only, tab-aware */}
						{String(currentStage ?? "").toLowerCase().includes("draft") && (value === 0 || value === 1 || value === 3) && (
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<LoadingButton
									loading={savingPaymentTerm}
									variant="contained"
									size="small"
									className="text-capitalize"
									onClick={handleSaveAndContinue}
									disabled={savingPaymentTerm}
								>
									{value === 3 ? 'PO Sent to Supplier' : 'Save & Continue'}
								</LoadingButton>
							</div>
						)}
						</div>						{/* Content Area with Tabs */}
						<div className="flex-grow-1" style={{ overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
							<Box
								sx={{
									flexGrow: 0,
									flexShrink: 0,
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									maxWidth: "100%",
									mb: 2,
									gap: 2
								}}
							>
								{/* Tabs on the left */}
								<Box sx={{ flexGrow: 1, minWidth: 0 }}>
									<Tabs
										value={value}
										onChange={handleChange}
										textColor="primary"
										className="tabstheme"
										indicatorColor="primary"
										variant="scrollable"
										allowScrollButtonsMobile
									>
										{(loadingPermissions || poPermissionManager?.hasPermission('PO Details', ACTIONS.READ)) && (
											<Tab 
												value={0} 
												label="PO Details" 
												disabled={isPoDetailsReadDisabled}
											/>
										)}
										{(loadingPermissions || poPermissionManager?.hasPermission('Items/Services', ACTIONS.READ)) && (
											<Tab 
												value={1} 
												label="Items/Services" 
												disabled={isItemServicesReadDisabled}
											/>
										)}
										{(loadingPermissions || poPermissionManager?.hasPermission('Shipped History', ACTIONS.READ)) && !String(currentStage ?? "").toLowerCase().includes("draft") && (
											<Tab 
												value={2} 
												label={`Shipped History (${allPOShipHeader?.length ?? 0})`} 
												disabled={isShippedHistoryReadDisabled}
											/>
										)}
										{/* Preview tab - always available */}
										<Tab
											value={3}
											label="Preview"
										/>
									</Tabs>
								</Box>

								{/* PO Document Attachment on the right */}
								{poSpecificDetails?.poDocumentFileName && (
									<Box 
										sx={{ 
											display: 'flex', 
											alignItems: 'center', 
											gap: 1,
											px: 2,
											py: 1,
											
											borderRadius: 1,
											
											cursor: 'pointer',
											transition: 'all 0.2s',
											// '&:hover': {
											// 	backgroundColor: '#e3f2fd',
											// 	borderColor: '#1976d2',
											// }
										}}
										onClick={() => {
											if (poSpecificDetails?.poDocumentFilePath) {
												downloadFilesOnAzure(
													poSpecificDetails.poDocumentFilePath,
													poSpecificDetails.poDocumentFileName,
													atoken
												);
											}
										}}
									>
										<Chip
											icon={<HiOutlineLink />}
											label={poSpecificDetails.poDocumentFileName}
											size="small"
											color="primary"
											variant="outlined"
											sx={{ 
												maxWidth: '200px',
												'& .MuiChip-label': {
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap'
												}
											}}
										/>
										<Tooltip title="Download PO Document">
											<IconButton size="small" color="primary">
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
													<polyline points="7 10 12 15 17 10"></polyline>
													<line x1="12" y1="15" x2="12" y2="3"></line>
												</svg>
											</IconButton>
										</Tooltip>
									</Box>
								)}
							</Box>

								{/* History cell and actions - placed below Tabs for visibility */}
								<div className="d-flex justify-content-end align-items-center mb-2" style={{ gap: 8 }}>
									<HistoryCell eventtype="PO" eventId={pageSlug} permissionManager={poPermissionManager} />
									{/* <IconButton size="small" onClick={handleOpenActionMenu}>
										<MoreVertIcon />
									</IconButton> */}
									<Menu
										anchorEl={anchorElAction}
										open={openAction}
										onClose={handleCloseActionMenu}
									>
										{/* Menu items can go here if needed */}
									</Menu>
								</div>
							{/* <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}> */}
							<div style={{
								flex: 1,
								minHeight: 0,        // important for flex containers
								overflowY: 'auto',   // vertical scroll
								overflowX: 'hidden',   // horizontal scroll only if absolutely necessary
							}}>

{value == 0 ? (
								<>
									<div className="p-3">
	{/* PO Header Details - Editable in Draft */}
	<div className="row mb-4">
		<div className="col-12">
			<Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white' }}>
				<CardContent>
					<Typography
						variant="h6"
						sx={{
							color: '#1976d2',
							fontWeight: 600,
							mb: 3,
							display: 'flex',
							alignItems: 'center',
							gap: 1
						}}
					>
						<Box
							component="span"
							sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}
						></Box>
						Purchase Order Details
					</Typography>

					<Grid container spacing={2}>
						{/* PO Number */}
						<Grid item xs={12} md={4}>
							{String(currentStage ?? "").toLowerCase().includes("draft") ? (
								<TextField
									fullWidth
									size="small"
									label="PO Number"
									value={poNumberInput || poSpecificDetails?.poNumber || ''}
									onChange={(e) => setPoNumberInput(e.target.value)}
									placeholder="Enter PO Number"
								/>
							) : (
								<Box>
									<Typography
										variant="caption"
										sx={{ color: '#666', display: 'block', mb: 0.5 }}
									>
										PO Number
									</Typography>
									<Typography variant="body1" sx={{ fontWeight: 600 }}>
										{poNumberInput || poSpecificDetails?.poNumber || 'N/A'}
									</Typography>
								</Box>
							)}
						</Grid>

						{/* PO Date */}
						<Grid item xs={12} md={4}>
							{String(currentStage ?? "").toLowerCase().includes("draft") ? (
								<LocalizationProvider dateAdapter={AdapterDateFns}>
									<MobileDatePicker
										label="PO Date"
										value={
											stagedPODate ??
											(poSpecificDetails?.pO_Date
												? new Date(poSpecificDetails.pO_Date)
												: new Date())
										}
										onChange={(newVal) => setStagedPODate(newVal)}
										slotProps={{
											textField: { fullWidth: true, size: "small" }
										}}
									/>
								</LocalizationProvider>
							) : (
								<Box>
									<Typography
										variant="caption"
										sx={{ color: '#666', display: 'block', mb: 0.5 }}
									>
										PO Date
									</Typography>
									<Typography variant="body1" sx={{ fontWeight: 600 }}>
										{formatDateViaTimeZone(
											stagedPODate ??
												poSpecificDetails?.pO_Date ??
												poSpecificDetails?.createdOn,
											"en-GB",
											formatoption
										)}
									</Typography>
								</Box>
							)}
						</Grid>

						{/* Expiry Date */}
						<Grid item xs={12} md={4}>
							{String(currentStage ?? "").toLowerCase().includes("draft") ? (
								<LocalizationProvider dateAdapter={AdapterDateFns}>
									<MobileDatePicker
										label="Expiry Date"
										value={
											expiryDate ??
											(poSpecificDetails?.confirmedDelDate
												? new Date(poSpecificDetails.confirmedDelDate)
												: null)
										}
										onChange={(newVal) => setExpiryDate(newVal)}
										slotProps={{
											textField: { fullWidth: true, size: "small" }
										}}
									/>
								</LocalizationProvider>
							) : (
								<Box>
									<Typography
										variant="caption"
										sx={{ color: '#666', display: 'block', mb: 0.5 }}
									>
										Expiry Date
									</Typography>
									<Typography variant="body1" sx={{ fontWeight: 600 }}>
										{expiryDate || poSpecificDetails?.confirmedDelDate
											? formatDateViaTimeZone(
													expiryDate ?? poSpecificDetails?.confirmedDelDate,
													"en-GB",
													formatoption
											  )
											: ''}
									</Typography>
								</Box>
							)}
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
									{!isPoDetailsReadDisabled ? (
									<>
										<div className="p-3">
											<div className="row g-3">

												<div className={poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 ? "col-12 col-md-4" : "col-12 col-md-6"}>
													<Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
														<CardContent>
															<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
																<Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
																	<Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
																	Bill To:
																</Typography>
																{String(currentStage ?? "").toLowerCase().includes("draft") && (
																	<Box>
																		<Tooltip title="Edit Bill To">
																			<IconButton size="small" onClick={() => {
																				setbillToAddress(poSpecificDetails?.billToAddress || "");
																				setbillToCity(poSpecificDetails?.billToCity || "");
																				setbillToState(poSpecificDetails?.billToState || "");
																				setOpenEditBill(true);
																			}}>
																				 <HiPencilAlt className="f17 text-primary" />
																			</IconButton>
																		</Tooltip>
																	</Box>
																)}
															</Box>
														
															<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																{poSpecificDetails?.billToAddress}
															</Typography>
														<Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
    {poSpecificDetails?.billToCity}
    {poSpecificDetails?.billToState ? `, ${poSpecificDetails.billToState}` : ''}
</Typography>
															<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																<strong>Phone:</strong> {poSpecificDetails?.billToPhone}
															</Typography>
															<Typography variant="body2" sx={{ color: '#666' }}>
																<strong>E-Mail:</strong> {poSpecificDetails?.billToEmail}
															</Typography>
														</CardContent>
													</Card>
												</div>

												<div className={poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 ? "col-12 col-md-4" : "col-12 col-md-6"}>
													<Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
														<CardContent>
															<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
																<Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
																	<Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
																	Ship To:
																</Typography>
																{String(currentStage ?? "").toLowerCase().includes("draft") && (
																	<Box>
																		<Tooltip title="Edit Ship To">
																			<IconButton size="small" onClick={() => {
																				setshipToAddress(poSpecificDetails?.shipToAddress || "");
																				setshipToCity(poSpecificDetails?.shipToCity || "");
																				setshipToState(poSpecificDetails?.shipToState || "");
																				setOpenEditShip(true);
																			}}>
																				 <HiPencilAlt className="f17 text-primary" />
																			</IconButton>
																		</Tooltip>
																	</Box>
																)}
															</Box>
															
															<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																{poSpecificDetails?.shipToAddress}
															</Typography>
																<Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
    {poSpecificDetails?.shipToCity}
    {poSpecificDetails?.shipToState ? `, ${poSpecificDetails.shipToState}` : ''}
</Typography>
															<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																<strong>Phone:</strong> {poSpecificDetails?.shipToPhone}
															</Typography>
															<Typography variant="body2" sx={{ color: '#666' }}>
																<strong>Email:</strong> {poSpecificDetails?.shipToEmail}
															</Typography>
														</CardContent>
													</Card>
												</div>

	{poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 && (
  <div className="col-12 col-md-4">
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#1976d2',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }} />
            PO Conditions:
          </Typography>
          {poSpecificDetails.poConditions.length === 1 && String(currentStage ?? "").toLowerCase().includes("draft") && (
            <Box>
              <Tooltip title="Edit Condition">
                <IconButton
                  size="small"
                  onClick={() => {
                    const condition = poSpecificDetails.poConditions[0];
                    setEditingCondition(condition);
                    setConditionForm({
                      conditionType: condition.conditionType || "",
                      conditionCategory: condition.conditionCategory || "",
                      conditionRate: condition.conditionRate ?? "",
                      conditionValue: condition.conditionValue ?? "",
                      currency: condition.currency || "",
                      calculationType: condition.calculationType || "",
                    });
                    setOpenEditCondition(true);
                  }}
                >
                  <HiPencilAlt className="f17 text-primary" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Stack spacing={2}>
          {poSpecificDetails.poConditions.map((condition, index) => (
            <Box key={index}>
              {/* For multiple conditions, show per-condition edit icon inline with index label */}
              {poSpecificDetails.poConditions.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic', fontSize: '0.75rem' }}>
                    Condition {index + 1}
                  </Typography>
                  {String(currentStage ?? "").toLowerCase().includes("draft") && (
                    <Tooltip title="Edit Condition">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingCondition(condition);
                          setConditionForm({
                            conditionType: condition.conditionType || "",
                            conditionCategory: condition.conditionCategory || "",
                            conditionRate: condition.conditionRate ?? "",
                            conditionValue: condition.conditionValue ?? "",
                            currency: condition.currency || "",
                            calculationType: condition.calculationType || "",
                          });
                          setOpenEditCondition(true);
                        }}
                      >
                        <HiPencilAlt className="f15 text-primary" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
              {/* Stack for each condition with spacing between fields */}
              <Stack spacing={0.7}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Type:</strong> {condition.conditionType || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Category:</strong> {condition.conditionCategory || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Rate:</strong> {condition.conditionRate || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Value:</strong> {condition.conditionValue || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Currency:</strong> {condition.currency || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Level:</strong> {condition.isHeaderCondition ? 'Header Level' : 'Item Level'}
                </Typography>
              </Stack>

              {/* Divider between conditions */}
              {index < poSpecificDetails.poConditions.length - 1 && (
                <Divider sx={{ mt: 1.5 }} />
              )}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  </div>
)}



												<div className="col-12 col-md-6">
													<Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
														<CardContent>
															<Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
																<Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
																Payment Terms:
															</Typography>
															<Box>
																<TextField
																	select
																	fullWidth
																	size="small"
																	label="Payment Terms"
																	value={selectedPaymentTermId ?? ""}
																	inputRef={paymentTermsFieldRef}
																	onChange={(e) => {
																		if (e.target.value === "__add_new__") {
																			setPaymentTermModal(true);
																			return;
																		}
																		setSelectedPaymentTermId(e.target.value);
																	}}
																	disabled={!poSpecificDetails || paymentTermsLoading || !String(currentStage ?? "").toLowerCase().includes("draft")}
																>
																	<MenuItem value="">-- Select --</MenuItem>
																	{paymentTermsOptions.map((opt) => (
																		<MenuItem key={opt.id ?? opt.paymentTermsId ?? opt.paymentTermId} value={opt.id ?? opt.paymentTermsId ?? opt.paymentTermId}>
																			{opt.paymentTerms || opt.termsOfPayment || opt.paymentTerm || opt.paymentTermsName}
																		</MenuItem>
																	))}
																	<MenuItem
																		value="__add_new__"
																		sx={{
																			color: 'primary.main',
																			fontStyle: 'italic',
																			textDecoration: 'underline',
																			cursor: 'pointer',
																			'&.Mui-selected, &.Mui-selected:hover': {
																				backgroundColor: 'transparent',
																			},
																		}}
																	>
																		ADD NEW
																	</MenuItem>
																</TextField>

																{/* Save & Continue moved to top-right action menu */}
															</Box>
														</CardContent>
													</Card>
												</div>
												<div className="col-12 col-md-6">
													<Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
														<CardContent>
															<Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
																<Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }}></Box>
																Confirmation Details:
															</Typography>
															<Stack spacing={1.5}>
																{poSpecificDetails?.confirmationNo && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Confirmation No:</strong> {poSpecificDetails?.confirmationNo}
																	</Typography>
																)}
																{poSpecificDetails?.confirmedDelDate && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Confirmed Date:</strong>{" "}
																		{formatDateViaTimeZone(
																			poSpecificDetails?.confirmedDelDate,
																			"en-GB",
																			formatoption
																		)}
																	</Typography>
																)}

																{poSpecificDetails?.supplierRef && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Supplier Ref:</strong> {poSpecificDetails?.supplierRef}
																	</Typography>
																)}
																{poSpecificDetails?.shippingCost && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Shipping Cost:</strong> {poSpecificDetails?.shippingCost}
																	</Typography>
																)}
																{poSpecificDetails?.confirmedShipDate && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Shipping Date:</strong>{" "}
																		{formatDateViaTimeZone(
																			poSpecificDetails?.confirmedShipDate,
																			"en-GB",
																			formatoption
																		)}
																	</Typography>
																)}
																{poSpecificDetails?.reqDeliveryDate && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Requested Delivery Date:</strong>{" "}
																		{formatDateViaTimeZone(
																			poSpecificDetails?.reqDeliveryDate,
																			"en-GB",
																			formatoption
																		)}
																	</Typography>
																)}
																{/* {poSpecificDetails?.confirmedDelDate && (
																	<Typography variant="body2" sx={{ color: '#666' }}>
																		<strong>Delivery Date:</strong>{" "}
																		{formatDateViaTimeZone(
																			poSpecificDetails?.confirmedDelDate,
																			"en-GB",
																			formatoption
																		)}
																	</Typography>
																)} */}

																{selectPOAttachedFile?.map(
																	(SingleRowComponent, index) => (
																		<>
																			{SingleRowComponent.filePath ? (
																				<span className="fw600 textLigblue" key={index}>
																					<Button
																						variant="text"
																						size="small"
																						className="text-capitalize font-normal textLigblue"
																						as={Link}
																						onClick={() =>
																							downloadFilesOnAzure(
																								SingleRowComponent?.filePath,
																								getFileName(SingleRowComponent?.filePath),
																								atoken
																							)
																						}
																					>
																						{SingleRowComponent?.poAttachment}
																					</Button>
																					<br />
																				</span>
																			) : (
																				<></>
																			)}

																		</>
																	)
																)}
															</Stack>
														</CardContent>
													</Card>
												</div>
											</div>
										</div>
									</>
								) : (
									<div className="p-4">
										<Alert severity="error">
											<div className="d-flex align-items-center">
												<HiOutlineX className="me-2 f18" />
												Access Denied: You don't have permission to view PO Details.
											</div>
										</Alert>
									</div>
								)
							}
							</>
						) : null}
							{value == 1 ? (
								!isItemServicesReadDisabled ? (
									<div className="p-3">
										<Box sx={{ width: '100%' }}>
											<DataGrid
												onCellClick={handleRowClick}
												getRowId={getRowId}
												rows={allPOItems}
												columns={columns}
												autoHeight
												getRowClassName={(params) =>
													setSelectedRow(params.row)
												}
												rowHeight={48}
												columnHeaderHeight={56}
												disableRowSelectionOnClick
												sx={{
													border: 'none',
													'& .MuiDataGrid-columnHeaders': {
														backgroundColor: '#f5f5f5',
														fontSize: '0.875rem',
														fontWeight: 600,
														color: '#333',
													},
													'& .MuiDataGrid-cell': {
														fontSize: '0.875rem',
														borderBottom: '1px solid #f0f0f0',
													},
													'& .MuiDataGrid-row:hover': {
														backgroundColor: '#f9f9f9',
													},
												}}
												onRowSelectionModelChange={(ids) => {
													const selectedIDs = new Set(ids);
													const selectedRows = allPOItems?.filter((row) =>
														selectedIDs.has(row.id)
													);
													setSelectedRows(selectedRows);
												}}
												slots={{ toolbar: GridToolbar }}
												slotProps={{
													toolbar: {
														showQuickFilter: true,
													},
												}}
											/>
										</Box>

											{/* Delivery date editor dialog */}
											<Dialog open={deliveryDialogOpen} onClose={() => setDeliveryDialogOpen(false)}>
												<DialogTitle>Edit Delivery Date</DialogTitle>
												<DialogContent>
													<LocalizationProvider dateAdapter={AdapterDateFns}>
														<MobileDatePicker
															disablePast={false}
															value={deliveryDialogDate}
															onChange={(newVal) => setDeliveryDialogDate(newVal)}
															onAccept={(newVal) => {
																// Auto-save when OK is clicked on calendar
																if (deliveryDialogRow) {
																	setDeliveryUpdates(prev => ({ ...prev, [deliveryDialogRow.id]: newVal }));
																}
																setDeliveryDialogOpen(false);
															}}
															renderInput={(params) => (
																<TextField {...params} size="small" fullWidth />
															)}
															minDate={new Date()}
														/>
													</LocalizationProvider>
												</DialogContent>
												<DialogActions>
													<Button onClick={() => setDeliveryDialogOpen(false)}>Cancel</Button>
												</DialogActions>
											</Dialog>
									</div>
								) : (
									<div className="p-4">
										<Alert severity="error">
											<div className="d-flex align-items-center">
												<HiOutlineX className="me-2 f18" />
												Access Denied: You don't have permission to view Items/Services.
											</div>
										</Alert>
									</div>
								)
						) : null}
						{value == 3 ? (
							// Preview content
							<div className="p-3">
								<POPreview 
									poDetails={poSpecificDetails} 
									poItems={allPOItems}
									atoken={atoken}
								requestCell={requestCell}
								stagelist={stagelist}
								customerid={customerid}
								/>
							</div>
						) : null}
						{value == 2 ? (
								!isShippedHistoryReadDisabled ? (
									<>
										<div className="row">
											<div className=" pe-4">
												<div className="">
													<div className="text-end">
														{/* Stack used for consistent spacing and alignment */}
														<Stack direction="row" spacing={2} justifyContent="flex-end">
															{/* <Tooltip title="Approve or take action on selected invoice">
																<span>
																	<Button
																		variant="contained"
																		color="primary"
																		size="small"
																		startIcon={<CheckCircleIcon />}
																		className="text-capitalize font-normal"
																		onClick={toggleDrawer("openInvoiceApproved", true, selectedInvoiceRows)}
																	>
																		Action
																	</Button>
																</span>
															</Tooltip> */}
														</Stack>
													</div>
												</div>
											</div>
											<div className="p-3">
												{/* Custom expandable table structure */}
												<Box sx={{ width: '100%', overflow: 'hidden' }}>
													{/* Table Header */}
													<Box sx={{
														display: 'flex',

														backgroundColor: '#f5f5f5',
														borderBottom: '2px solid #e0e0e0',
														fontWeight: 600,
														fontSize: '0.875rem',
														color: '#666',
														padding: '12px 8px'
													}}>
														<Box sx={{ flex: '0 0 13%', minWidth: '110px' }}>Shipping Date</Box>
														<Box sx={{ flex: '0 0 13%', minWidth: '110px' }}>Delivery Date</Box>
														<Box sx={{ flex: '0 0 10%', minWidth: '85px' }}>Status</Box>
														<Box sx={{ flex: '0 0 15%', minWidth: '120px' }}>Invoice Number</Box>
														<Box sx={{ flex: '0 0 13%', minWidth: '110px' }}>Invoice Amount</Box>
														<Box sx={{ flex: '0 0 12%', minWidth: '100px' }}>Invoice Date</Box>
														<Box sx={{ flex: '0 0 14%', minWidth: '110px' }}>Invoice Status</Box>
														<Box sx={{ flex: '0 0 5%', minWidth: '50px', textAlign: 'center' }}>Show GRN/SES</Box>
													</Box>													{/* Table Rows */}
													{allPOShipHeader.map((row) => (
														<Box key={row.uniqueRowId || row.id}>
															{/* Main Row */}
															<Box sx={{
																display: 'flex',
																backgroundColor: '#fff',
																borderBottom: '1px solid #e0e0e0',
																'&:hover': { backgroundColor: '#ffffff' },
																fontSize: '0.875rem',
																padding: '12px 8px',
																alignItems: 'center'
															}}>
																<Box
																	sx={{ flex: '0 0 13%', minWidth: '110px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "shippingDate" });
																	}}
																>
																	{row.shippingDate ? formatDateViaTimeZone(row.shippingDate, "en-GB", formatoption) : "NA"}
																</Box>
																<Box
																	sx={{ flex: '0 0 13%', minWidth: '110px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "deliveryDate" });
																	}}
																>
																	{row.deliveryDate ? formatDateViaTimeZone(row.deliveryDate, "en-GB", formatoption) : "NA"}
																</Box>
																<Box
																	sx={{ flex: '0 0 10%', minWidth: '85px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "status" });
																	}}
																>
																	{row.status}
																</Box>
																<Box
																	sx={{ flex: '0 0 15%', minWidth: '120px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "invoiceNo" });
																	}}
																>
																	{row.invoiceNo}
																</Box>
																<Box
																	sx={{ flex: '0 0 13%', minWidth: '110px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "invoiceAmount" });
																	}}
																>
																	{row.invoiceAmount}
																</Box>
																<Box
																	sx={{ flex: '0 0 12%', minWidth: '100px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "invoiceDate" });
																	}}
																>
																	{row.invoiceDate ? formatDateViaTimeZone(row.invoiceDate, "en-GB", formatoption) : ""}
																</Box>
																<Box
																	sx={{ flex: '0 0 14%', minWidth: '110px', color: '#1976d2', cursor: 'pointer' }}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleInvoiceRowClick({ row: row, field: "stage" });
																	}}
																>
																	{row.stage}
																	{row.stage === "Paid" && row.invoiceHId && (
																		<IconButton
																			size="small"
																			color="primary"
																			onClick={(e) => {
																				e.stopPropagation();
																				fetchPaymentDetails(row.invoiceHId);
																			}}
																			disabled={loadingPayment}
																		>
																			<MdReceipt size={20} />
																		</IconButton>
																	)}
																</Box>

																<Box sx={{ flex: '0 0 5%', minWidth: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
																	<IconButton
																		size="small"
																		color="primary"
																		onClick={(e) => {
																			e.stopPropagation();
																			setInvStatus(row.status);
																			handleToggleRow(row.uniqueRowId);
																			setSelectedInvoiceRows([row]);
																			setDisableGrnBtn(false);
																			console.log('✅ Button click handler completed');
																		}}
																	>
																		{openRows[row.uniqueRowId] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
																	</IconButton>
																</Box>
															</Box>

															{/* Expanded GRN Details Row */}
															{openRows[row.uniqueRowId] && (
																<Box sx={{
																	backgroundColor: '#fafafa',
																	borderBottom: '2px solid #e0e0e0',
																	p: 3
																}}>
																	{/* GRN/SEC Details Header with Submit/Approve Button */}
																	<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
																		<Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 500, fontSize: '14px' }}>
																			{isServiceRow(row) ? 'SES DETAILS' : 'GRN DETAILS'}
																		</Typography>
																		<Tooltip title={isServiceRow(row) ? "Approve selected service items" : "Submit GRN for selected items in this row"}>
																			<span>
																				<Button
																					variant="contained"
																					color="primary"
																					size="small"
																					className="text-capitalize font-normal"
																					onClick={(e) => {
																						e.stopPropagation();
																						handleSubmitGRN(row.uniqueRowId);
																					}}
																					disabled={
																						!row.shipmentDetails?.some(item => selectedItemIds.has(item.id)) ||
																						disableGrnBtn ||
																						!["Shipped", "Partialy Shipped"].includes(invStatus)
																					}
																				>
																					{isServiceRow(row) ? 'Approve' : 'Submit GRN'}
																				</Button>
																			</span>
																		</Tooltip>
																	</Box>																	{/* GRN Details Table */}
																	<Box sx={{ width: '100%', overflow: 'hidden' }}>
																		{/* Header Row */}
																		<div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '8px 4px', borderRadius: '4px', fontWeight: 600, borderBottom: '2px solid #1976d2', marginBottom: '4px', fontSize: '0.75rem' }}>
																			<div style={{ flex: '0 0 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
																				<Checkbox
																					size="small"
																					checked={row.shipmentDetails?.every(item => selectedItemIds.has(item.id)) || false}
																					indeterminate={
																						row.shipmentDetails?.some(item => selectedItemIds.has(item.id)) &&
																						!row.shipmentDetails?.every(item => selectedItemIds.has(item.id))
																					}
																					onChange={(e) => {
																						e.stopPropagation();
																						handleSelectAllRow(row.uniqueRowId, e.target.checked);
																					}}
																				/>
																			</div>
																			<div style={{ flex: '0 0 7%', minWidth: '80px', textAlign: 'center' }}>Item No</div>
																			{!isServiceRow(row) && <div style={{ flex: '0 0 6%', minWidth: '70px', textAlign: 'center' }}>Batch ID</div>}
																			{/* {!isServiceRow(row) && <div style={{ flex: '0 0 5%', minWidth: '65px', textAlign: 'center' }}>PO Quantity</div>} */}
																			<div style={{ flex: '0 0 5%', minWidth: '65px', textAlign: 'center' }}>PO Quantity</div>
																			<div style={{ flex: '0 0 5%', minWidth: '65px', textAlign: 'center' }}>PO Rate</div>
																			<div style={{ flex: '0 0 4%', minWidth: '50px', textAlign: 'center' }}>UOM</div>
																			{/* {!isServiceRow(row) && <div style={{ flex: '0 0 5%', minWidth: '30px', textAlign: 'center' }}>Ship Qty</div>} */}
																			<div style={{ flex: '0 0 5%', minWidth: '30px', textAlign: 'center' }}>Ship Qty</div>
																			<div style={{ flex: '0 0 5%', minWidth: '30px', textAlign: 'center' }}>Invoice Qty</div>
																			<div style={{ flex: '0 0 5%', minWidth: '30px', textAlign: 'center' }}>Invoice Amount</div>

																			{!isServiceRow(row) && <div style={{ flex: '0 0 8%', minWidth: '100px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>GRN No</div>}
																			{!isServiceRow(row) && <div style={{ flex: '0 0 5%', minWidth: '65px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>GRN Qty</div>}
																			{!isServiceRow(row) && <div style={{ flex: '0 0 8%', minWidth: '95px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>GRN Date</div>}
																			{!isServiceRow(row) && <div style={{ flex: '0 0 5%', minWidth: '65px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>QC Failed</div>}
																			

																			{isServiceRow(row) && <div style={{ flex: '0 0 10%', minWidth: '120px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>Service Start Date</div>}
																			{isServiceRow(row) && <div style={{ flex: '0 0 10%', minWidth: '120px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>Service End Date</div>}
																			{isServiceRow(row) && <div style={{ flex: '0 0 10%', minWidth: '120px', textAlign: 'center', paddingLeft: '4px', paddingRight: '4px' }}>Service Attachment</div>}
																			<div style={{ flex: '0 0 12%', minWidth: '60px', textAlign: 'center' }}>Matching Status</div>

																		</div>																		{/* Data Rows */}
																		{row.shipmentDetails?.map((item) => {
																			const itemId = item.id;
																			const defaultInput = {
																				grnno: item.grnNumber ?? '',
																				qty: item.grnQuantity ?? '',
																				amount: item.grnAmount ?? '',
																				grnDate: item.grnDate ? item.grnDate.slice(0, 10) : '',
																				qcFailed: 0,
																			};

																			const input = itemInputs[itemId] ?? defaultInput;


																			// Auto-calculate QC Failed only if not manually set
																			// const autoQcFailed = input.qty && item.shipQty && Number(item.shipQty) > Number(input.qty)
																			// 		? Number(item.shipQty) - Number(input.qty)
																			// 		: 0;
																			// // If GRN submit is not disabled, show API value; else show manual or auto-calc
																			// const isDisabled = !!(
																			// 		item.grnNumber &&
																			// 		item.grnQuantity &&
																			// 		item.grnAmount &&
																			// 		item.grnDate
																			// );
																			// let displayQcFailed;
																			// console.log('QC Failed Debug:', {
																			// 	itemId,
																			// 	isDisabled,
																			// 	itemQtyQcFailed: item.qtyQcFailed,
																			// 	input,
																			// 	autoQcFailed,
																			// });
																			// if (item.qtyQcFailed !== undefined && item.qtyQcFailed !== null) {
																			// 	displayQcFailed = item.qtyQcFailed;
																			// 	console.log('Using API value for QC Failed:', displayQcFailed);
																			// } else {
																			// 	displayQcFailed = input.qcFailedManual ? input.qcFailed : (input.qcFailed !== undefined ? input.qcFailed : autoQcFailed);
																			// 	console.log('Using manual/auto value for QC Failed:', displayQcFailed);
																			// }
																			// Auto-calculate QC Failed only if not manually set
																			const autoQcFailed = input.qty && item.shipQty && Number(item.shipQty) > Number(input.qty)
																				? Number(item.shipQty) - Number(input.qty)
																				: 0;
																			// Use manually entered value if user has edited it, otherwise use auto-calculated
																			const displayQcFailed = input.qcFailedManual ? input.qcFailed : (input.qcFailed !== undefined ? input.qcFailed : autoQcFailed); const isDisabled = !!(
																				item.grnNumber &&
																				item.grnQuantity &&
																				item.grnAmount &&
																				item.grnDate
																			);
																			const finalDisabled = isDisabled || !selectedItemIds.has(itemId);
																			const isService = isServiceItem(item);

																			return (
																				<div key={itemId} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '4px', borderRadius: '4px', marginBottom: '2px', border: '1px solid #e0e0e0', fontSize: '0.75rem' }}>
																					<div style={{ flex: '0 0 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
																						<Checkbox
																							size="small"
																							checked={selectedItemIds.has(itemId)}
																							onChange={(e) => {
																								e.stopPropagation();
																								handleCheckboxChange(itemId, e.target.checked);
																							}}
																							disabled={isDisabled}
																						/>
																					</div>
																					{/* <div style={{ flex: '0 0 7%', minWidth: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.itemNo ?? ''}</div> */}
																					<Tooltip title={item.invItemMatchResion || ''} arrow>
																						<div
																							style={{
																								flex: '0 0 7%',
																								minWidth: '80px',
																								display: 'flex',
																								justifyContent: 'center',
																								alignItems: 'center',
																								fontSize: '0.75rem',
																								padding: '2px 4px',
																								borderRadius: '4px',
																								...getValidationStyle(item.isItemMapped),
																							}}
																						>
																							{item.itemNo ?? ''}
																						</div>
																					</Tooltip>


																					{!isService && <div style={{ flex: '0 0 6%', minWidth: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.batchId}</div>}
																					{/* {!isService && <div style={{ flex: '0 0 5%', minWidth: '65px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.poQuantity}</div>} */}
																					<div style={{ flex: '0 0 5%', minWidth: '65px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.poQuantity}</div>
																					<div style={{ flex: '0 0 5%', minWidth: '65px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.pOunitPrice}</div>
																					<div style={{ flex: '0 0 4%', minWidth: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.uom}</div>
																					{/* {!isService && <div style={{ flex: '0 0 5%', minWidth: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.shipQty}</div>} */}
																					<div style={{ flex: '0 0 5%', minWidth: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>{item.shipQty}</div>
																					<Tooltip title={item.invQtyMatchResion || ''} arrow>
																						<div style={{ flex: '0 0 5%', minWidth: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', ...getValidationStyle(item.isQuantityMapped, item.invQtyMatchResion) }}>
																							{item.invoiceItemQuantity}
																						</div>
																					</Tooltip>
																					<div style={{ width: 8 }} />
																					<Tooltip title={item.invAmountMatchResion || ''} arrow>
																						<div style={{ flex: '0 0 5%', minWidth: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', ...getValidationStyle(item.isInvoiceAmountMapped, item.invAmountMatchResion) }}>
																							{item.invoiceAmount}
																						</div>
																					</Tooltip>
																					{!isService && (
																						<>
																							<div style={{ flex: '0 0 8%', minWidth: '100px', paddingLeft: '4px', paddingRight: '4px' }}>
																								<TextField
																									placeholder="GRN No *"
																									fullWidth
																									size="small"
																									sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '6px 8px' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
																									value={input.grnno}
																									onChange={(e) => handleItemInputChange(itemId, 'grnno', e.target.value)}
																									error={!!validationErrors[itemId]?.grnNumber}
																									helperText={validationErrors[itemId]?.grnNumber}
																									InputProps={{ readOnly: isDisabled }}
																									onClick={(e) => e.stopPropagation()}
																								/>
																							</div>
																							<div style={{ flex: '0 0 5%', minWidth: '65px', paddingLeft: '4px', paddingRight: '4px' }}>
																								<Tooltip title={item.grnQuantityMapResion || ''} arrow>
																									<TextField
																										placeholder="Qty *"
																										type="number"
																										fullWidth
																										size="small"
																										value={input.qty ?? ''}
																										onChange={(e) => handleItemInputChange(itemId, 'qty', e.target.value)}
																										error={!!validationErrors[itemId]?.grnQuantity}
																										helperText={validationErrors[itemId]?.grnQuantity}
																										InputProps={{ readOnly: finalDisabled }}
																										onClick={(e) => e.stopPropagation()}
																										sx={{
																											'& .MuiInputBase-input': {
																												fontSize: '0.75rem',
																												padding: '6px 8px',
																												...getValidationStyle(item.isGRNQuantityMapped, item.grnQuantityMapResion)
																											},
																											'& .MuiInputLabel-root': { fontSize: '0.75rem' }
																										}}
																									/>
																								</Tooltip>
																							</div>																							<div style={{ flex: '0 0 8%', minWidth: '95px', paddingLeft: '4px', paddingRight: '4px' }}>
																								<TextField
																									placeholder="Date *"
																									type="date"
																									fullWidth
																									size="small"
																									InputLabelProps={{ shrink: true }}
																									value={input.grnDate}
																									onChange={(e) => handleItemInputChange(itemId, 'grnDate', e.target.value)}
																									error={!!validationErrors[itemId]?.grnDate}
																									helperText={validationErrors[itemId]?.grnDate}
																									InputProps={{ readOnly: finalDisabled }}
																									onClick={(e) => e.stopPropagation()}
																									sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '6px 8px' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
																								/>
																							</div>
																							{/* QC Failed Column */}
																							{!isService && (
																								<div
																									style={{
																										flex: '0 0 5%',
																										minWidth: '80px',
																										paddingLeft: '4px',
																										paddingRight: '4px',
																										display: 'flex',
																										justifyContent: 'center',
																										alignItems: 'center',
																									}}
																								>
																									{(() => {
																										// Debugging
																										console.log('itemId:', itemId, 'qtyQcFailed:', item.qtyQcFailed, 'displayQcFailed:', displayQcFailed);
																										; // <--  will pause execution here in browser DevTools

																										if (item.qtyQcFailed > 0) {
																											return (
																												<div
																													className="text-center"
																													style={{
																														width: '100%',
																														color: '#d32f2f', // red if > 0
																														fontWeight: 600,
																														padding: '4px',
																													}}
																												>
																													{item.qtyQcFailed}
																												</div>
																											);
																										} else {
																											return (
																												<TextField
																													placeholder="QC Failed"
																													type="number"
																													fullWidth
																													size="small"
																													value={displayQcFailed}
																													onChange={(e) => handleItemInputChange(itemId, 'qcFailed', e.target.value)}
																													error={!!validationErrors[itemId]?.qcFailed}
																													helperText={validationErrors[itemId]?.qcFailed}
																													InputProps={{ readOnly: finalDisabled }}
																													onClick={(e) => e.stopPropagation()}
																													sx={{
																														'& .MuiInputBase-input': { fontSize: '0.75rem', padding: '6px 8px' },
																														'& .MuiInputLabel-root': { fontSize: '0.75rem' },
																													}}
																												/>
																											);
																										}
																									})()}
																								</div>
																							)}


																							{/* <div style={{ flex: '0 0 5%', minWidth: '65px', paddingLeft: '4px', paddingRight: '4px' }}>
																								<TextField
																									placeholder="QC Failed"
																									type="number"
																									fullWidth
																									size="small"
																									value={displayQcFailed}
																									onChange={(e) => handleItemInputChange(itemId, 'qcFailed', e.target.value)}
																									error={!!validationErrors[itemId]?.qcFailed}
																									helperText={validationErrors[itemId]?.qcFailed}
																									InputProps={{ readOnly: finalDisabled }}
																									onClick={(e) => e.stopPropagation()}
																									sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem', padding: '6px 8px' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
																								/>
																							</div> */}
																						</>
																					)}																					{/* Service-specific fields */}

																					{isService && (
																						<>
																							<div style={{ flex: '0 0 10%', minWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', paddingLeft: '4px', paddingRight: '4px' }}>
																								{item.serviceStartDate ? formatDateViaTimeZone(item.serviceStartDate, "en-GB", formatoption) : 'N/A'}
																							</div>
																							<div style={{ flex: '0 0 10%', minWidth: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', paddingLeft: '4px', paddingRight: '4px' }}>
																								{item.serviceEndDate ? formatDateViaTimeZone(item.serviceEndDate, "en-GB", formatoption) : 'N/A'}
																							</div>
																							<div style={{ flex: '0 0 10%', minWidth: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', paddingLeft: '4px', paddingRight: '4px' }}>
																								{item.shipfile ? (
																									<Button
																										variant="text"
																										size="small"
																										className="text-capitalize font-normal"
																										as={Link}
																										onClick={() =>
																											downloadFilesOnAzure(
																												item.shipfilePath,
																												item.shipfile,
																												atoken
																											)
																										}
																									>
																										Download
																									</Button>
																								) : 'No attachment'}
																							</div>
																						</>
																					)}
                                                                                    <div style={{ flex: '0 0 15%', minWidth: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', fontSize: '0.75rem', padding: '4px' }}>
																						{item.matchingReason && item.matchingReason.split(',').map((reason, index) => {
																							const trimmedReason = reason.trim();
																							const lowerReason = trimmedReason.toLowerCase();
																							const color = lowerReason.includes('inconsistent') ? 'red' : lowerReason.includes('consistent') ? 'green' : 'inherit';
																							return (
																								<div key={index} style={{ marginBottom: index < item.matchingReason.split(',').length - 1 ? '4px' : '0', color: color }}>
																									{trimmedReason}
																								</div>
																							);
																						})}
																					</div>
																				</div>
																			);
																		})}
																	</Box>
																</Box>
															)}
														</Box>
													))}
												</Box>
											</div>
										</div>

									</>
								) : (
									<div className="p-4">
										<Alert severity="error">
											<div className="d-flex align-items-center">
												<HiOutlineX className="me-2 f18" />
												Access Denied: You don't have permission to view Shipped History.
											</div>
										</Alert>
									</div>
								)
							) : null}
							</div>
						</div>

						{/* Edit Bill To dialog */}
						<Dialog open={openEditBill} onClose={() => setOpenEditBill(false)} fullWidth maxWidth="sm">
							<DialogTitle>Edit Bill To</DialogTitle>
							<DialogContent>
								<Box component="form" sx={{ mt: 1 }}>
									<TextField
										label="Address"
										fullWidth
										size="small"
										value={billToAddress}
										onChange={(e) => setbillToAddress(e.target.value)}
										margin="normal"
									/>
									<Box sx={{ display: 'flex', gap: 1 }}>
										<TextField label="City" size="small" fullWidth value={billToCity} onChange={(e) => setbillToCity(e.target.value)} />
										<TextField label="State" size="small" fullWidth value={billToState} onChange={(e) => setbillToState(e.target.value)} />
									</Box>
								</Box>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => setOpenEditBill(false)}>Cancel</Button>
																		<Button variant="contained" onClick={async () => {
																			const dataadd = {
																				poId: pageSlug,
																				billAddress: billToAddress,
																				billCity: billToCity,
																				billState: billToState,
																				customerId: poSpecificDetails?.customerId
																			};
																			try {
																				const res = await UpdatePOAddresses(dataadd, atoken);
																				if (res) {
																					// UpdatePOAddresses already toasts on success; update UI state
																					setPoSpecificDetails((prev) => ({ ...prev, billToAddress: billToAddress, billToCity: billToCity, billToState: billToState }));
																				}
																			} catch (err) {
																				if (err?.response?.data?.Message) toast(err.response.data.Message, { hideProgressBar: true, autoClose: 1200, type: 'error' });
																			}
																			setOpenEditBill(false);
																		}}>
									Save
								</Button>
							</DialogActions>
						</Dialog>

						{/* Edit Ship To dialog */}
						<Dialog open={openEditShip} onClose={() => setOpenEditShip(false)} fullWidth maxWidth="sm">
							<DialogTitle>Edit Ship To</DialogTitle>
							<DialogContent>
								<Box component="form" sx={{ mt: 1 }}>
									<TextField label="Address" fullWidth size="small" value={shipToAddress} onChange={(e) => setshipToAddress(e.target.value)} margin="normal" />
									<Box sx={{ display: 'flex', gap: 1 }}>
										<TextField label="City" size="small" fullWidth value={shipToCity} onChange={(e) => setshipToCity(e.target.value)} />
										<TextField label="State" size="small" fullWidth value={shipToState} onChange={(e) => setshipToState(e.target.value)} />
									</Box>
								</Box>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => setOpenEditShip(false)}>Cancel</Button>
																		<Button variant="contained" onClick={async () => {
																			const dataadd = {
																				poId: pageSlug,
																				shipAddress: shipToAddress,
																				shipcity: shipToCity,
																				shipState: shipToState,
																				customerId: poSpecificDetails?.customerId
																			};
																			try {
																				const res = await UpdatePOAddresses(dataadd, atoken);
																				if (res) {
																					setPoSpecificDetails((prev) => ({ ...prev, shipToAddress: shipToAddress, shipToCity: shipToCity, shipToState: shipToState }));
																				}
																			} catch (err) {
																				if (err?.response?.data?.Message) toast(err.response.data.Message, { hideProgressBar: true, autoClose: 1200, type: 'error' });
																			}
																			setOpenEditShip(false);
																		}}>
									Save
								</Button>
							</DialogActions>
						</Dialog>

					{/* Edit PO Condition dialog */}
					<Dialog open={openEditCondition} onClose={() => setOpenEditCondition(false)} fullWidth maxWidth="sm">
						<DialogTitle>Edit PO Condition</DialogTitle>
						<DialogContent>
							<Box component="form" sx={{ mt: 1 }}>
								<Box sx={{ display: 'flex', gap: 1 }}>
									<TextField
										label="Condition Type"
										fullWidth
										size="small"
										margin="normal"
										value={conditionForm.conditionType}
										onChange={(e) => setConditionForm(prev => ({ ...prev, conditionType: e.target.value }))}
									/>
									<TextField
										label="Condition Category"
										fullWidth
										size="small"
										margin="normal"
										value={conditionForm.conditionCategory}
										onChange={(e) => setConditionForm(prev => ({ ...prev, conditionCategory: e.target.value }))}
									/>
								</Box>
								<Box sx={{ display: 'flex', gap: 1 }}>
									<TextField
										label="Condition Rate"
										fullWidth
										size="small"
										type="number"
										margin="normal"
										value={conditionForm.conditionRate}
										onChange={(e) => setConditionForm(prev => ({ ...prev, conditionRate: e.target.value }))}
									/>
									<TextField
										label="Condition Value"
										fullWidth
										size="small"
										type="number"
										margin="normal"
										value={conditionForm.conditionValue}
										onChange={(e) => setConditionForm(prev => ({ ...prev, conditionValue: e.target.value }))}
									/>
								</Box>
								<Box sx={{ display: 'flex', gap: 1 }}>
									<TextField
										label="Currency"
										fullWidth
										size="small"
										margin="normal"
										value={conditionForm.currency}
										onChange={(e) => setConditionForm(prev => ({ ...prev, currency: e.target.value }))}
									/>
									<TextField
										label="Calculation Type"
										fullWidth
										size="small"
										margin="normal"
										value={conditionForm.calculationType}
										onChange={(e) => setConditionForm(prev => ({ ...prev, calculationType: e.target.value }))}
									/>
								</Box>
							</Box>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setOpenEditCondition(false)}>Cancel</Button>
							<Button
								variant="contained"
								disabled={savingCondition}
								onClick={async () => {
									if (!editingCondition) return;
									setSavingCondition(true);
									try {
										const payload = {
											id: editingCondition.id ?? 0,
											poHeaderId: editingCondition.poHeaderId ?? parseInt(pageSlug),
											poItemId: editingCondition.poItemId ?? null,
											conditionType: conditionForm.conditionType,
											conditionCategory: conditionForm.conditionCategory,
											conditionRate: parseFloat(conditionForm.conditionRate) || 0,
											conditionValue: parseFloat(conditionForm.conditionValue) || 0,
											currency: conditionForm.currency,
											calculationType: conditionForm.calculationType,
										};
										const res = await apiClient.postres(`/api/poconfirm/POConditionUpdate`, payload, atoken);
										if (res) {
											toast.success('PO Condition updated successfully.');
											// Update local state to reflect the change immediately
											setPoSpecificDetails(prev => ({
												...prev,
												poConditions: prev.poConditions.map(c =>
													c.id === editingCondition.id
														? { ...c, ...conditionForm, conditionRate: parseFloat(conditionForm.conditionRate) || 0, conditionValue: parseFloat(conditionForm.conditionValue) || 0 }
														: c
												)
											}));
											setOpenEditCondition(false);
										}
									} catch (err) {
										const msg = err?.response?.data?.Message || 'Failed to update PO Condition.';
										toast.error(msg);
									} finally {
										setSavingCondition(false);
									}
								}}
							>
								{savingCondition ? 'Saving...' : 'Save'}
							</Button>
						</DialogActions>
					</Dialog>

				</div>
			</div>
		</div>			<React.Fragment key="top2">
				<Drawer
					anchor="right"
					open={state["openCreateSheet"]}
				// onClose={toggleDrawer('openCreateSheet', false)}
				>
					<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1080 } }}>
						<div className="flex flex-col">
							<Box className="bgheaderCards">
								<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
									<div className="ms-3 text-white">
										{shipConfirmDetails?.shipmentDetails?.some(item => isServiceItem(item))
											? "Create Service Sheet"
											: "Shipment/Invoice"}
									</div>
									<div>
										<IconButton
											onClick={toggleDrawer(
												"openCreateSheet",
												false,
												allPOShipHeader
											)}
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
							<div className="row g-0" style={{ overflow: 'hidden' }}>
								{/* <div className="col-8"> */}
								{/* <div className="col-12"> */}
								{(() => {
									// Check if invoice data exists
									const hasInvoiceData = shipConfirmDetails?.invoiceAmount ||
										shipConfirmDetails?.invoiceDate ||
										shipConfirmDetails?.invoiceFile ||
										shipConfirmDetails?.invoiceId ||
										shipConfirmDetails?.invoiceNo ||
										shipConfirmDetails?.invoicePath;
									return null;
								})()}
								<div className={["Under Approval", "Pending for Payment", "Paid"].includes(currentInvStage) && (shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) ? "col-8" : "col-12"}>
									<Box sx={{ flexGrow: 1, p: 2 }}>
										<div className="mb-3">
											<div className="row">
												{(shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) && (
													<div className="col-md-12">
														<MemoizedEventStageFlow
															stagelist={invStagelist}
															currentStage={currentInvStage}
														/>
													</div>
												)}
												<div className="col-12">
													<Box sx={{ width: "100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
														<Tabs
															onChange={handleTabShipsNotice}
															value={tabShipsNotice}
															aria-label="Tabs where selection follows focus"
															selectionFollowsFocus
														>
															<Tab
																className="text-capitalize"
																label={shipConfirmDetails?.shipmentDetails?.some(item => isServiceItem(item))
																	? "Service Sheet Header"
																	: "Ship Notice Header"}
															/>
															<Tab
																className="text-capitalize"
																label="Order Items"
															/>
															<Tab
																className="text-capitalize"
																label="Invoice Details"
															/>
															{/* <Tab
														className="text-capitalize"
														label="Attachments"
													/> */}
														</Tabs>
														{/* Invoice Audit History Icon - Only visible when Invoice Details tab is active */}
														{tabShipsNotice === 2 && shipConfirmDetails?.invoiceId && (
															<Box sx={{ display: 'flex', alignItems: 'center' }}>
																<HistoryCell eventtype="INV" eventId={shipConfirmDetails.invoiceId} permissionManager={invPermissionManager} />
															</Box>
														)}
													</Box>
												</div>
											</div>
										</div>
										<hr />
										{tabShipsNotice == 0 ? (
											<>
												{isServiceItem(shipConfirmDetails?.shipmentDetails?.[0]) ? (
													// Service Sheet Header
													<div className="row">
														<div className="col-12 col-md-6 col-lg-6 mb-4">
															<TextField
																id="serviceSheetNo"
																InputLabelProps={{ shrink: true }}
																name="serviceSheetNo"
																className="w-100 f14"
																size="small"
																label="Service Sheet No *"
																variant="outlined"
																value={shipConfirmDetails?.shipSlipId}
																InputProps={{ readOnly: true }}
															/>
														</div>
														<div className="col-12 col-md-6 col-lg-6 mb-4">
															<TextField
																label="Service Sheet Date *"
																variant="outlined"
																size="small"
																className="w-100 f14"
																InputLabelProps={{ shrink: true }}
																value={
																	shipConfirmDetails?.serviceSheetDate
																		? formatDateViaTimeZone(shipConfirmDetails.serviceSheetDate, "en-GB", formatoption)
																		: shipConfirmDetails?.shippingDate
																			? formatDateViaTimeZone(shipConfirmDetails.shippingDate, "en-GB", formatoption)
																			: ''
																}
																inputProps={{ readOnly: true }}
															/>
														</div>
													</div>
												) : (
													<>
														{/* <div className="p-2">
															<div className="row ">
														<div className="col-12 col-md-3">
															<div className="f12 text-muted mb-1">
																<span className="fw600">From:</span>
																<div className="f09pt mb-1">
																	<span> {poSpecificDetails?.company}</span>
																	<br />
																	<span>{poSpecificDetails?.shipToAddress}</span>
																	<br />
																	{poSpecificDetails?.shipToCity},
																	{poSpecificDetails?.shipToState}
																</div>
																<div className="">
																	<span>Phone: </span>
																	{poSpecificDetails?.shipToPhone}
																</div>

																<div className="">
																	<span>Email: </span>
																	{poSpecificDetails?.shipToEmail}
																</div>
															</div>
														</div>
														<div className="col-12 col-md-3">
															<div className="f12 text-muted mb-1">
																<span className="fw600">To:</span>
																<br />
																<span> {poSpecificDetails?.vendorName}</span>
																<br />
																<div className="f09pt mb-1">
																	<span>{poSpecificDetails?.billToAddress}</span>
																	<br />
																	{poSpecificDetails?.billToCity},
																	{poSpecificDetails?.billToState}
																</div>
																<div className="">
																	<span>Phone: </span>
																	{poSpecificDetails?.billToPhone}
																</div>
																<div className="">
																	<span>E-Mail: </span>
																	{poSpecificDetails?.billToEmail}
																</div>
															</div>
														</div>
														<div className="col-12 col-md-3">
															<div className="f09pt">
															</div>
														</div>
														<div className="col-12 col-md-3">
															<div className="f09pt">
																<div>
																	<div className="fw600">Purchase Order</div>
																	<div className="text-success">
																		{currentStage}
																	</div>
																</div>
																<div className="f09pt mb-1 mt-2">
																	<span className="fw600">
																		{poSpecificDetails?.poNumber}
																	</span>
																	<br />
																</div>
															</div>
														</div>
													</div>
												</div>
												<hr className="" /> */}
														{/*shipConfirmDetails?.map((selectedItem, index) => (*/}
														<div className="row ">
															<div className="col-12 col-md-8 col-lg-8">
																<div className="mb-4 textblue f14">Shipping</div>

																<div className="row">
																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="packingSlipId"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="packingSlipId"
																			className="w-100 f14"
																			size="small"
																			label="Packing Slip ID *"
																			variant="outlined"
																			value={shipConfirmDetails?.shipSlipId}
																		/>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="status"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="status"
																			className="w-100 f14"
																			size="small"
																			label="Ship Notice Type"
																			variant="outlined"
																			value={shipConfirmDetails?.shipNoticeType}
																		></TextField>
																	</div>
																	<div className="col-12 col-md-12 col-lg-6 mb-4">
																		<TextField
																			label="Shipping Date *"
																			variant="outlined"
																			size="small"
																			className="w-100 f14"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			value={
																				shipConfirmDetails?.shippingDate
																					? formatDateViaTimeZone(shipConfirmDetails.shippingDate, "en-GB", formatoption)
																					: ''
																			}
																			inputProps={{ readOnly: true }}
																		/>
																	</div>
																	<div className="col-12 col-md-12 col-lg-6 mb-4">
																		<TextField
																			label="Delivery Date *"
																			variant="outlined"
																			size="small"
																			className="w-100 f14"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			value={
																				shipConfirmDetails?.deliveryDate
																					? formatDateViaTimeZone(shipConfirmDetails.deliveryDate, "en-GB", formatoption)
																					: ''
																			}
																			inputProps={{ readOnly: true }}
																		/>
																	</div>

																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="ewayBillNumber"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="ewayBillNumber"
																			className="w-100 f14"
																			size="small"
																			label="Eway Bill No. *"
																			variant="outlined"
																			value={shipConfirmDetails?.ewayBillNumber}
																		/>
																	</div>
																</div>
															</div>
															<div className="col-12 col-md-8 col-lg-4">
																<div className="mb-4 textblue f14">Tracking</div>
																<div className="row">
																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="carrierName"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="carrierName"
																			className="w-100 f14"
																			size="small"
																			label="Carrier Name"
																			variant="outlined"
																			value={shipConfirmDetails?.carrierName}
																		></TextField>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="serviceLevel"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="serviceLevel"
																			className="w-100 f14"
																			size="small"
																			label="Service Level"
																			variant="outlined"
																			value={shipConfirmDetails?.serviceLevel}
																		/>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="lrShipBillNumber"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="lrShipBillNumber"
																			className="w-100 f14"
																			size="small"
																			label="AWB/LR/Shipping Bill Number *"
																			variant="outlined"
																			value={shipConfirmDetails?.lrShipBillNumber}
																		/>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-4">
																		<TextField
																			id="shipMethod"
																			InputLabelProps={{
																				shrink: true,
																			}}
																			name="shipMethod"
																			className="w-100 f14"
																			size="small"
																			label="Shipping Method"
																			variant="outlined"
																			value={shipConfirmDetails?.shipMethod}
																		></TextField>
																	</div>
																</div>
															</div>
														</div>
														{/*  ))}*/}
													</>
												)}
											</>
										) : (
											<></>
										)}

										{tabShipsNotice == 1 ? (
											<>
												<form
													onSubmit={formik_POShipOrdrItem.handleSubmit}
													autoComplete="off"
												>
													<div className="row">
														<div className="col-12 mb-3 ">
															{shipConfirmDetails &&
																shipConfirmDetails?.shipmentDetails?.length >
																0 ? (
																<>
																	{/* {shipConfirmDetails?.shipmentDetails?.map(
																		(selectedItem, index) => (
																			<div key={index}>
																				<div className="row border-bottom f12 mb-2 pt-0 pb-3">
																					<div className="col-12">
																						<div className="row">
																							<div className="col-12 col-md-2">
																								<div>
																									<span className="text-muted">
																										Item No:
																									</span>
																									<br />
																									{selectedItem?.itemNo}
																								</div>
																							</div>
																							<div className="col-12 col-md-4">
																								<div>
																									<span className="text-muted">
																										Description:
																									</span>
																									<br />
																									{selectedItem?.itemDesc}
																								</div>
																							</div>
																						</div>
																					</div>
																					<div className="col-12 mt-1">
																						<div className="row">
																							<div className="col-12 col-md-2">
																								<div>
																									<span className="text-muted">
																										Qty:
																									</span>
																									<br />
																									<span className="fw600">
																										{selectedItem?.quantity}
																									</span>
																								</div>
																							</div>
																							<div className="col-12 col-md-2">
																								<div>
																									<span className="text-muted">
																										Unit:
																									</span>
																									<br />
																									{selectedItem?.uom}
																								</div>
																							</div>
																							<div className="col-12 col-md-2">
																								<div>
																									<span className="text-muted">
																										Net Price :
																									</span>
																									<br />
																									{selectedItem?.materialPONetPrice}
																								</div>
																							</div>

																						</div>
																					</div>
																					<div className="col-12 mt-1 bggray pt-2 pb-2">
																						<div className="row">
																							<div className="col-12 mt-4">
																								{shipConfirmDetails?.shipmentDetails?.map(
																									(shipItem, i) => {
																										return (
																											<div
																												className="row  d-flex align-items-center w-100 mb-3"
																												key={i}
																											>
																												<div className="col-12 col-md-2 col-lg-3">
																													<TextField
																														id={shipItem.batchId}
																														InputLabelProps={{
																															shrink: true,
																														}}
																														name="shipQty"
																														className="w-100 f14"
																														size="small"
																														label="Ship Qty *"
																														variant="outlined"
																														value={shipItem.shipQty}
																													/>
																												</div>
																												<div className="col-12 col-md-2 col-lg-3">
																													<TextField
																														id={shipItem.batchId}
																														InputLabelProps={{
																															shrink: true,
																														}}
																														name="packingSlipId"
																														className="w-100 f14"
																														size="small"
																														label="Supplier Batch Id"
																														variant="outlined"
																														value={shipItem.batchId}
																													/>
																												</div>

																												<div className="col-12 col-md-2 col-lg-2">

																												</div>
																											</div>
																										);
																									}
																								)}
																							</div>
																						</div>
																					</div>
																				</div>
																			</div>
																		)
																	)} */}
																	{shipConfirmDetails &&
																		shipConfirmDetails?.shipmentDetails?.length > 0 ? (
																		<>
																			{Object.values(
																				shipConfirmDetails?.shipmentDetails.reduce((acc, detail) => {
																					if (!acc[detail?.itemNo]) {
																						acc[detail?.itemNo] = {
																							...detail,
																							batches: [],
																						};
																					}
																					acc[detail?.itemNo].batches.push({
																						id: detail.id,
																						batchId: detail.batchId,
																						shipQty: detail.shipQty,
																					});
																					return acc;
																				}, {})
																			).map((item, index) => (
																				<div key={index}>
																					<div className="row border-bottom f12 mb-2 pt-0 pb-3">
																						<div className="col-12">
																							<div className="row">
																								<div className="col-12 col-md-2">
																									<div>
																										<span className="text-muted">Item No:</span>
																										<br />
																										{item?.itemNo}
																									</div>
																								</div>
																								<div className="col-12 col-md-4">
																									<div>
																										<span className="text-muted">Description:</span>
																										<br />
																										{item?.itemDesc}
																									</div>
																								</div>
																							</div>
																						</div>
																						<div className="col-12 mt-1">
																							<div className="row">
																								{isServiceItem(item) ? (
																									// Service item - show UOM, Unit Price, Delivery Date
																									<>
																										<div className="col-12 col-md-2">
																											<div>
																												<span className="text-muted">UOM:</span>
																												<br />
																												{item?.uom}
																											</div>
																										</div>
																										<div className="col-12 col-md-2">
																											<div>
																												<span className="text-muted">Unit Price:</span>
																												<br />
																												{item?.materialPONetPrice}
																											</div>
																										</div>
																										<div className="col-12 col-md-3">
																											<div>
																												<span className="text-muted">Delivery Date:</span>
																												<br />
																												{item?.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'N/A'}
																											</div>
																										</div>
																									</>
																								) : (
																									// Material item - show Qty, Unit, Net Price
																									<>
																										<div className="col-12 col-md-2">
																											<div>
																												<span className="text-muted">Qty:</span>
																												<br />
																												<span className="fw600">{item?.quantity}</span>
																											</div>
																										</div>
																										<div className="col-12 col-md-2">
																											<div>
																												<span className="text-muted">Unit:</span>
																												<br />
																												{item?.uom}
																											</div>
																										</div>
																										<div className="col-12 col-md-2">
																											<div>
																												<span className="text-muted">Net Price :</span>
																												<br />
																												{item?.materialPONetPrice}
																											</div>
																										</div>
																									</>
																								)}
																							</div>
																						</div>

																						{/* Batch rows */}
																						<div className="col-12 mt-1 bggray pt-2 pb-2">
																							<div className="row">
																								<div className="col-12 mt-4">
																									{isServiceItem(item) ? (
																										// Service item fields - single row layout
																										<div className="row mb-3">
																											<div className="col-12 col-md-2">
																												<div>
																													<span className="text-muted">Total Item Due Qty:</span>
																													<br />
																													<span className="fw600">{item?.quantity}</span>
																												</div>
																											</div>
																											{item.batches.map((batch, i) => {
																												// Find the full detail for this batch to get service dates
																												const batchDetail = shipConfirmDetails?.shipmentDetails?.find(d => d.id === batch.id);
																												return (
																													<React.Fragment key={batch.id}>
																														<div className="col-12 col-md-3">
																															<TextField
																																label="Service Start Date"
																																variant="outlined"
																																size="small"
																																className="w-100 f14"
																																InputLabelProps={{ shrink: true }}
																																value={batchDetail?.serviceStartDate ? formatDateViaTimeZone(batchDetail.serviceStartDate, "en-GB", formatoption) : ''}
																																inputProps={{ readOnly: true }}
																															/>
																														</div>
																														<div className="col-12 col-md-3">
																															<TextField
																																label="Service End Date"
																																variant="outlined"
																																size="small"
																																className="w-100 f14"
																																InputLabelProps={{ shrink: true }}
																																value={batchDetail?.serviceEndDate ? formatDateViaTimeZone(batchDetail.serviceEndDate, "en-GB", formatoption) : ''}
																																inputProps={{ readOnly: true }}
																															/>
																														</div>
																														<div className="col-12 col-md-4">
																															{batchDetail?.shipfile ? (
																																<Button
																																	variant="outlined"
																																	size="small"
																																	startIcon={<HiOutlineLink />}
																																	onClick={() => {
																																		if (batchDetail?.shipfilePath) {
																																			downloadFilesOnAzure(batchDetail.shipfilePath, getFileName(batchDetail.shipfile), atoken);
																																		}
																																	}}
																																	className="f14"
																																>
																																	Service Attachment
																																</Button>
																															) : (
																																<span className="text-muted f14">No attachment</span>
																															)}
																														</div>
																													</React.Fragment>
																												);
																											})}
																										</div>
																									) : (
																										// Material item fields
																										item.batches.map((batch, i) => (
																											<div
																												className="row d-flex align-items-center w-100 mb-3"
																												key={batch.id}
																											>
																												<div className="col-12 col-md-2 col-lg-3">
																													<TextField
																														id={batch.batchId}
																														InputLabelProps={{ shrink: true }}
																														name="shipQty"
																														className="w-100 f14"
																														size="small"
																														label="Ship Qty *"
																														variant="outlined"
																														value={batch.shipQty}
																														InputProps={{ readOnly: true }}
																													/>
																												</div>
																												<div className="col-12 col-md-2 col-lg-3">
																													<TextField
																														id={batch.batchId}
																														InputLabelProps={{ shrink: true }}
																														name="packingSlipId"
																														className="w-100 f14"
																														size="small"
																														label="Supplier Batch Id"
																														variant="outlined"
																														value={batch.batchId}
																														InputProps={{ readOnly: true }}
																													/>
																												</div>
																												<div className="col-12 col-md-2 col-lg-2"></div>
																											</div>
																										))
																									)}
																								</div>
																							</div>
																						</div>
																					</div>
																				</div>
																			))}
																		</>
																	) : null}

																</>
															) : (
																<>
																	<div key={1}>
																		<div className="row border-bottom f12 mb-2 pt-0 pb-3">
																			<div className="col-12">
																				<div className="row">
																					<div className="col-12 col-md-2">
																						<div>
																							<span className="text-muted">
																								Item No:
																							</span>
																							<br />
																							{poOrderItems?.itemNo}
																						</div>
																					</div>
																					<div className="col-12 col-md-4">
																						<div>
																							<span className="text-muted">
																								Description:
																							</span>
																							<br />
																							{poOrderItems?.itemDesc}
																						</div>
																					</div>

																					<div className="col-12 col-md-2">
																						<div>
																							<span className="text-muted"></span>
																						</div>
																					</div>

																					<div className="col-12 col-md-2">

																					</div>
																				</div>
																			</div>
																			<div className="col-12 mt-1">
																				<div className="row">
																					<div className="col-12 col-md-2">
																						<div>
																							<span className="text-muted">
																								Qty:
																							</span>
																							<br />
																							<span className="fw600">
																								{poOrderItems?.quantity}
																							</span>
																						</div>
																					</div>
																					<div className="col-12 col-md-2">
																						<div>
																							<span className="text-muted">
																								Unit:
																							</span>
																							<br />
																							{poOrderItems?.uom}
																						</div>
																					</div>
																					<div className="col-12 col-md-2">
																						<div>
																							<span className="text-muted">
																								Net Price :
																							</span>
																							<br />
																							{poOrderItems?.materialPONetPrice}
																						</div>
																					</div>

																				</div>
																			</div>
																			<div className="col-12 mt-1 bggray pt-2 pb-2">
																				<div className="row">
																					<div className="col-12 mt-4">
																						{poOrderItems.shipmentDetails?.map(
																							(shipItem, i) => {
																								return (
																									<div
																										className="row  d-flex align-items-center w-100 mb-3"
																										key={i}
																									>
																										<div className="col-12 col-md-2 col-lg-3">
																											<TextField
																												id={shipItem.batchId}
																												InputLabelProps={{
																													shrink: true,
																												}}
																												name="shipQty"
																												className="w-100 f14"
																												size="small"
																												label="Ship Qty *"
																												variant="outlined"
																												value={shipItem.shipQty}
																											/>
																										</div>
																										<div className="col-12 col-md-2 col-lg-3">
																											<TextField
																												id={shipItem.batchId}
																												InputLabelProps={{
																													shrink: true,
																												}}
																												name="packingSlipId"
																												className="w-100 f14"
																												size="small"
																												label="Supplier Batch Id"
																												variant="outlined"
																												value={shipItem.batchId}
																											/>
																										</div>

																										<div className="col-12 col-md-2 col-lg-2">
																											{/* <Button
																									variant='text'
																									size='small'
																									className='text-capitalize font-normal'
																									onClick={()=>handleItemViewClik(shipConfirmDetails.id)}
																									>
																										View
																									</Button>                         */}
																										</div>
																									</div>
																								);
																							}
																						)}
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>
																	{/* ))} */}
																</>
															)}
														</div>
													</div>
												</form>
											</>
										) : (
											<></>
										)}

										{tabShipsNotice == 2 ? (
											<>
												<form
													onSubmit={formik_POShipInvoiceHeader.handleSubmit}
													autoComplete="off"
												>
													<div className="row ">
														<div className="col-12 col-md-12 col-lg-12">
															<div className="mb-4 textblue f14">
																Invoice Details
															</div>
															<div className="row">
																<div className="col-12 col-md-12 col-lg-12">
																	<div className="row">
																		<div className="col-12 col-md-12 col-lg-4 mb-4">
																			<TextField
																				id="poId"
																				InputLabelProps={{
																					shrink: true,
																				}}
																				name="poId"
																				className="w-100 f14"
																				size="small"
																				label="Purchase Order *"
																				variant="outlined"
																				value={poSpecificDetails?.poNumber}
																			/>
																		</div>
																		<div className="col-12 col-md-12 col-lg-4 mb-4">
																			<TextField
																				id="invoiceNo"
																				InputLabelProps={{
																					shrink: true,
																				}}
																				name="invoiceNo"
																				className="w-100 f14"
																				size="small"
																				label="Invoice No *"
																				variant="outlined"
																				value={shipConfirmDetails?.invoiceNo}
																			/>
																		</div>
																		<div className="col-12 col-md-12 col-lg-4 mb-4">
																			<TextField
																				id="invoiceAmount"
																				InputLabelProps={{
																					shrink: true,
																				}}
																				name="invoiceAmount"
																				className="w-100 f14"
																				size="small"
																				label="Invoice Amount *"
																				variant="outlined"
																				value={shipConfirmDetails?.invoiceAmount}
																				readOnly={true}
																			/>
																		</div>
																		<div className="col-12 col-md-12 col-lg-6 mb-4">
																			<LocalizationProvider
																				dateAdapter={AdapterDateFns}
																			>
																				<DateField
																					label="Invoice Date"
																					variant="outlined"
																					size="small"
																					className="w-100 f14"
																					InputLabelProps={{
																						shrink: true,
																					}}
																					value={
																						shipConfirmDetails &&
																							shipConfirmDetails?.invoiceDate
																							? new Date(
																								shipConfirmDetails?.invoiceDate
																							)
																							: null
																					}
																					format="dd/MM/yyyy"
																				/>
																			</LocalizationProvider>
																		</div>
																		<div className="col-12 col-md-12 col-lg-6 ">
																			<TextField
																				id="supplierTaxId"
																				InputLabelProps={{
																					shrink: true,
																				}}
																				name="supplierTaxId"
																				className="w-100 f14"
																				size="small"
																				label="Supplier Tax ID"
																				variant="outlined"
																				value={poSpecificDetails?.payTerms}
																			/>
																		</div>
																		<div className="col-12 col-md-12 col-lg-12 mb-4">
																			<TextField
																				id="ServiceDesc"
																				InputLabelProps={{
																					shrink: true,
																				}}
																				name="ServiceDesc"
																				className="w-100 f14"
																				size="small"
																				label="Service Description"
																				variant="outlined"
																				value={shipConfirmDetails?.serviceLevel}
																				multiline
																				rows={3}
																			/>
																		</div>

																		<div className="col-12 col-md-12 col-lg-12 mb-2 f12">
																			<br />
																			<Button
																				variant="text"
																				size="small"
																				className="text-capitalize font-normal"
																				onClick={(e) => {
																					e.preventDefault();
																					downloadFilesOnAzure(
																						shipConfirmDetails?.invoicePath,
																						getFileName(
																							shipConfirmDetails?.invoiceFile
																						),
																						atoken
																					);
																				}}
																			>
																				{getFileName(shipConfirmDetails?.invoiceFile)}
																			</Button>
																		</div>
																		{/*<div className="col-12 col-md-12 col-lg-12 mb-2 f12">
																	<div>
																	<span className="fw600">Subtotal:</span>:
																	1,0000.00 INR
																	</div>
																	<div>
																	<span className="fw600">Total Tax:</span>:
																	180.00 INR
																	</div>
																	<div>
																	<span className="fw600">
																		Total Gross Amount:
																	</span>
																	: 1,180.00 INR
																	</div>
																	<div>
																	<span className="fw600">
																		Total Net Amount:
																	</span>
																	: 1,180.00 INR
																	</div>
																	<div className="fw600">
																	<span className="">Amount Due:</span>:
																	1,180.00 INR
																	</div>
																</div> */}
																	</div>
																</div>
															</div>
														</div>
														{shipConfirmDetails?.grnNumber != "" &&
															shipConfirmDetails?.grnNumber != null ? (
															<div className="col-12 col-md-8 col-lg-4">
																<div className="mb-4 textblue f14">GRN Details</div>
																<div className="row f12">
																	<div className="col-12 col-md-12 col-lg-12 mb-2">
																		<div>
																			<span className="fw600">GRN:</span>
																		</div>
																		<div>{shipConfirmDetails?.grnNumber}</div>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-2">
																		<div>
																			<span className="fw600">GRN Date:</span>
																		</div>
																		<div>
																			{formatDateViaTimeZone(
																				shipConfirmDetails?.grnDate,
																				"en-GB",
																				formatoption
																			)}
																		</div>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-2">
																		<div>
																			<span className="fw600">GRN Quantity:</span>
																		</div>
																		<div>{shipConfirmDetails?.grnQuantity}</div>
																	</div>
																	<div className="col-12 col-md-12 col-lg-12 mb-2">
																		<div>
																			<span className="fw600">GRN Amount:</span>
																		</div>
																		<div>
																			<span className="text-muted">
																				<div>{shipConfirmDetails?.grnAmount}</div>
																			</span>
																		</div>
																	</div>
																</div>
															</div>
														) : (
															<></>
														)}
														<div className="col-12 col-md-8 col-lg-4">
															<div className="row">
																<div className="col-12 col-md-12 col-lg-12 mb-2 f12 border-bottom">
																	<br />
																	<span class="fw600">Terms & Condition :</span>
																	<span>{poSpecificDetails?.termsOfPayment}</span>
																</div>

															</div>
														</div>
													</div>
												</form>
											</>
										) : (
											<></>
										)}

										{tabShipsNotice == 3 ? (
											<>
												<div className="">
													<div className="row bggray p-1 pt-1 mb-1">
														<div className="col-12 col-md-3">File Type</div>
														<div className="col-12 col-md-3">Description</div>

														<div className="col-12 col-md-3">File Name</div>
													</div>
													{selectAttachedFile?.map((SingleRowComponent, index) => (
														<>
															{SingleRowComponent.poAttachment != "" ? (
																<div
																	className="row  p-1 pt-1 mb-1 border-bottom"
																	key={index}
																>
																	<div className="col-12 col-md-3">
																		{SingleRowComponent?.fileType}
																	</div>
																	<div className="col-12 col-md-3">
																		{SingleRowComponent?.poAttachmentDescription}
																	</div>

																	<div className="col-12 col-md-3">
																		{/* <Link
																	to={downloadFilesOnAzure(
																		SingleRowComponent?.filePath +
																			"/" +
																			SingleRowComponent?.poAttachment,
																		SingleRowComponent?.poAttachment,
																		atoken
																	)}
																>
																	Download
																</Link> */}

																		<Button
																			variant="text"
																			size="small"
																			className="text-capitalize font-normal"
																			as={Link}
																			onClick={() =>
																				downloadFilesOnAzure(
																					SingleRowComponent?.filePath +
																					"/" +
																					SingleRowComponent?.poAttachment,
																					SingleRowComponent?.poAttachment,
																					atoken
																				)
																			}
																		>
																			{SingleRowComponent?.poAttachment}
																		</Button>
																	</div>
																</div>
															) : (
																<></>
															)}
														</>
													))}
												</div>
											</>
										) : (
											<></>
										)}
									</Box>
								</div>
								{["Under Approval", "Pending for Payment", "Paid"].includes(currentInvStage) && (shipConfirmDetails?.invoiceAmount || shipConfirmDetails?.invoiceDate || shipConfirmDetails?.invoiceFile || shipConfirmDetails?.invoiceId || shipConfirmDetails?.invoiceNo || shipConfirmDetails?.invoicePath) && (
									<div className="col-4" style={{ overflowX: 'hidden', borderLeft: '2px solid #e0e0e0' }}>
										{!activityId ? (
											<div className="p-0">
												<div className="d-flex flex-column min-vh-100">
													<div className="flex-grow-1">
														<div className="row">
															<div className="col-12">
																<div className="section-heading mb-3 pb-2 border-bottom mt-2 ps-2">Approval Workflow</div>
																<EventApprovalBox
																	requestCell={requestCellINV}
																	handleEventAppList={handleEventAppList}
																	wfupdate={wfupdate}
																	action={stagearray.includes(currentInvStage)}
																	stagelist={invStagelist}
																	Version={1}
																	permissionManager={invPermissionManager}
																	eventCode={shipConfirmDetails?.invoiceNo || poSpecificDetails?.poNumber}
																	eventSubject={poSpecificDetails?.subject || ''}
																	startDate={poSpecificDetails?.createdOn}
																	endDate={poSpecificDetails?.deliveryDate}
																	currentStage={currentInvStage}
																/>
															</div>
														</div>
													</div>

													<div className="row">
														<div className="col-12 mb-2">
															<div className="d-flex bg-white rounded p-2 shadow-sm align-items-center ">
																<div className="me-2 ">
																	<HiOutlineCollection className="f14" />
																</div>
																<div className="flex-grow-1">Invoices</div>
																<Badge pill bg="warning" text="dark">
																	{allPOShipHeader?.length ?? 0}
																</Badge>
															</div>
														</div>
													</div>
												</div>
											</div>
										) : (
											selectedInvoiceId?.toString() === poId?.toString() && (
												<form
													onSubmit={formik_InvoiceAccepted.handleSubmit}
													autoComplete="off"
												>
													<Box sx={{ width: '100%', maxWidth: '100%' }}>
														<div className="flex flex-col">
															<Box>
																<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
																	<div className="ms-3 w-100 f14">Approval Action</div>
																</div>
															</Box>
															<div className="h50px"></div>
															<div className="p-1">
																<div className="">
																	<div className="col-12 col-md-12 col-lg-12">
																		<div className="mb-4 textblue f14"></div>
																		<div className="row">
																			<div className="col-12 col-md-4 col-lg-12 mb-4">
																				<TextField
																					id="status"
																					InputLabelProps={{ shrink: true }}
																					name="status"
																					select
																					className="mb-2"
																					fullWidth
																					size="small"
																					label="Invoice Status *"
																					variant="outlined"
																					value={formik_InvoiceAccepted.values.status}
																					onChange={formik_InvoiceAccepted.handleChange}
																				>
																					<MenuItem value={true}>Approve</MenuItem>
																					<MenuItem value={false}>Reject</MenuItem>
																					{/* <MenuItem value="Approved">Approve</MenuItem>
																			<MenuItem value="Rejected">Revert</MenuItem> */}
																				</TextField>
																				{
																					formik_InvoiceAccepted.errors.status ? (
																						<div style={{ color: "red" }}>
																							{formik_InvoiceAccepted.errors.status}
																						</div>
																					) : null}
																			</div>

																			<div className="col-12 col-md-4 col-lg-12 mb-4">
																				<TextField
																					id="approveComment"
																					InputLabelProps={{ shrink: true }}
																					name="approveComment"
																					className="w-100 f14"
																					size="small"
																					label="Comment *"
																					variant="outlined"
																					value={formik_InvoiceAccepted?.values?.approveComment}
																					onChange={formik_InvoiceAccepted.handleChange}
																				/>
																				{
																					formik_InvoiceAccepted.errors.approveComment ? (
																						<div style={{ color: "red" }}>
																							{formik_InvoiceAccepted.errors.approveComment}
																						</div>
																					) : null}
																			</div>
																		</div>
																	</div>
																</div>
																<div className="row">
																	<div className="col-12 text-end">
																		<LoadingButton
																			color="primary"
																			size="medium"
																			className="text-white text-capitalize mb-3 mr-3"
																			variant="contained"
																			type="submit"
																			disabled={approveSaveDisable}
																			loading={loading}
																		>
																			<span>Save</span>
																		</LoadingButton>
																	</div>
																</div>
															</div>
														</div>
													</Box>
												</form>
											)
										)}
									</div>
								)}

								{/* <div className="col-4" style={{ backgroundColor: '#f8f8f8ff' }}>
									<form
										onSubmit={formik_InvoiceAccepted.handleSubmit}
										autoComplete="off"
									>
										<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
											<div className="flex flex-col">
												<div className="p-3">
													<div className="row ">
														<div className="col-12 col-md-12 col-lg-12">
															<div className="mb-4 textblue f14"></div>
															<div className="row">
																<div className="col-12 col-md-4 col-lg-12 mb-4">
																	<TextField
																		id="status"
																		InputLabelProps={{
																			shrink: true,
																		}}
																		name="status"
																		select
																		className="mb-2"
																		fullWidth
																		size="small"
																		label="Invoice Status"
																		variant="outlined"
																		value={formik_InvoiceAccepted.values.status}
																		onChange={formik_InvoiceAccepted.handleChange}
																	>
																		<MenuItem value="Approved">Approve</MenuItem>
																		<MenuItem value="Rejected">Revert</MenuItem>
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
																		value={
																			formik_InvoiceAccepted?.values?.approveComment
																		}
																		onChange={formik_InvoiceAccepted.handleChange}
																	/>
																</div>
															</div>

															<hr className="mt-0" />
														</div>
													</div>
													<div className="row">
														<div className="col-12 text-end">
															<LoadingButton
																color="primary"
																size="medium"
																className="text-white text-capitalize mb-3 mr-3"
																variant="contained"
																type="submit"
																disabled={approveSaveDisable}
															>
																<span>Save</span>
															</LoadingButton>
														</div>
													</div>
												</div>
											</div>
										</Box>
									</form>
								</div> */}
							</div>
						</div>
					</Box>
				</Drawer>
			</React.Fragment >
			<React.Fragment key="top">
				<Drawer
					anchor="right"
					open={state["openOrderConfirm"]}
				// onClose={toggleDrawer('openCreateSheet', false)}
				>
					<form
						onSubmit={formik_POConfirmOrder.handleSubmit}
						autoComplete="off"
					>
						<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1080 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">Confirm Entire Order</div>
										<div>
											<IconButton
												onClick={toggleDrawer(
													"openOrderConfirm",
													false,
													allPOShipHeader
												)}
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
											<div className="mb-4 textblue f14">
												Order Confirmation Header
											</div>
											<div className="row">
												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<TextField
														id="POId"
														InputLabelProps={{
															shrink: true,
														}}
														inputProps={{
															readOnly: true,
															title: "This field is not editable",
														}}
														name="POId"
														className="w-100 f14"
														size="small"
														label="Associated Purchase Order*"
														variant="outlined"
														value={poSpecificDetails?.id}
													// onChange={(e) => {
													//     formik.setFieldValue('packingSlipId', e.target.value);
													// }}
													/>
												</div>

												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<TextField
														id="Company"
														InputLabelProps={{
															shrink: true,
														}}
														inputProps={{
															readOnly: true,
															title: "This field is not editable",
														}}
														name="Company"
														className="w-100 f14"
														size="small"
														label="Customer"
														variant="outlined"
														value={poSpecificDetails?.company}
													// onChange={(e) => {
													//     formik.setFieldValue('packingSlipId', e.target.value);
													// }}
													/>
												</div>
												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<TextField
														id="ConfirmationNo"
														InputLabelProps={{
															shrink: true,
														}}
														name="ConfirmationNo"
														className="w-100 f14"
														size="small"
														label="Confirmation *"
														variant="outlined"
														value={formik_POConfirmOrder.values?.ConfirmationNo}
														onChange={formik_POConfirmOrder.handleChange}
													// onChange={(e) => {
													//     formik.setFieldValue('ConfirmationNo', e.target.value);
													// }}
													/>
												</div>
												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<TextField
														id="SupplierRef"
														InputLabelProps={{
															shrink: true,
														}}
														name="SupplierRef"
														className="w-100 f14"
														size="small"
														label="Supplier Reference"
														variant="outlined"
														value={formik_POConfirmOrder.values?.SupplierRef}
														onChange={formik_POConfirmOrder.handleChange}
													// onChange={(e) => {
													//     formik.setFieldValue('packingSlipId', e.target.value);
													// }}
													/>
												</div>
											</div>
											<hr className="mt-0" />
											<div className="mb-4 textblue f14">
												Shipping and Tax Information
											</div>
											<div className="row">
												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<LocalizationProvider dateAdapter={AdapterDateFns}>
														<DateField
															label="Est. Shipping Date *"
															variant="outlined"
															size="small"
															className="w-100 f14"
															InputLabelProps={{
																shrink: true,
															}}
															value={
																formik_POConfirmOrder.values?.ConfirmedShipDate
															}
															format={getOnlyDateFormatPatternLocale(userDetail)}
														/>
													</LocalizationProvider>
													{formik_POConfirmOrder.touched.ConfirmedShipDate &&
														formik_POConfirmOrder.errors.ConfirmedShipDate ? (
														<div style={{ color: "red" }}>
															{formik_POConfirmOrder.errors.ConfirmedShipDate}
														</div>
													) : null}
												</div>
												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<LocalizationProvider dateAdapter={AdapterDateFns}>
														<DateField
															label="Est. Delivery Date *"
															variant="outlined"
															size="small"
															className="w-100 f14"
															InputLabelProps={{
																shrink: true,
															}}
															value={
																formik_POConfirmOrder.values?.confirmedDelDate
															}
															format={getOnlyDateFormatPatternLocale(userDetail)}
														/>
													</LocalizationProvider>
													{formik_POConfirmOrder.touched.ConfirmedDelDate &&
														formik_POConfirmOrder.errors.ConfirmedDelDate ? (
														<div style={{ color: "red" }}>
															{formik_POConfirmOrder.errors.ConfirmedDelDate}
														</div>
													) : null}
												</div>
												<div className="col-12 col-md-4 col-lg-3 mb-4">
													<TextField
														id="ShippingCost"
														InputLabelProps={{
															shrink: true,
														}}
														name="ShippingCost"
														className="w-100 f14"
														size="small"
														label="Est. Shipping Cost"
														variant="outlined"
														value={formik_POConfirmOrder.values?.ShippingCost}
														onChange={(e) => {
															//console.log(formik_POConfirmOrder.errors.ShippingCost)
															formik_POConfirmOrder?.setFieldValue(
																"ShippingCost",
																e.target.value
															);
														}}
													/>
													{formik_POConfirmOrder.touched.ShippingCost &&
														formik_POConfirmOrder.errors.ShippingCost ? (
														<div style={{ color: "red" }}>
															{formik_POConfirmOrder.errors.ShippingCost}
														</div>
													) : null}
												</div>
												<div className="col-12 col-md-4 col-lg-3 mb-4"></div>
												<div className="col-12 mb-4">
													<TextField
														id="Remarks"
														InputLabelProps={{
															shrink: true,
														}}
														rows={2}
														multiline
														name="Remarks"
														className="w-100 f14"
														size="small"
														label="Comments"
														variant="outlined"
														value={formik_POConfirmOrder.values?.Remarks}
														onChange={(e) => {
															formik_POConfirmOrder.setFieldValue(
																"Remarks",
																e.target.value
															);
														}}
													/>
												</div>
											</div>
											<hr className="mt-0" />
											<div className="mb-4 textblue f14">Attachments</div>

											{showAttach && (
												<div className="row align-items-center p-0 pb-1 border-bottom ms-0 me-0 pt-1 pb-1">
													<div className="col-12 col-md-10">
														<div className="row text-left f12 lingh14 text-muted">
															<div className="col-lg-4 col-md-2 col-12">
																<div>
																	<a href={`${returnfileName}`} target="_blank">
																		{attachmentfilters?.poAttachmentDescription}
																	</a>
																</div>
															</div>

														</div>
													</div>
													<div className="d-flex col-12 col-md-2 align-items-center justify-content-end">
														<IconButton size="small" className="bg-white ms-2">
															<HiOutlineX className="f17 text-danger" />
														</IconButton>
													</div>
												</div>
											)}

											<div className="row bggray p-2 pt-3 mb-3">
												<div className="col-12 col-md-5">
													<Form.Group controlId="formFile" className="">
														<Form.Control
															// onChange={userAttachment}
															// onChange={(e) => setFileName(e.target.files[0])}
															name="poAttachment"
															type="file"
															size="md"
															accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
															// value={attachmentfilters?.poAttachment}
															onChange={handleAttachfileChange("POAttachment")}
															// onChange={handleFileChange}
															isInvalid={"Unsupported Format"}
														/>
														<Form.Text id="filiploadtext" muted className="f10">
															(\.docx|\.doc|\.jpg|\.jpeg|\.png|\.pdf|\.xlsx),
															Max Size: 10 mb
														</Form.Text>
													</Form.Group>
												</div>
												{/* <div className="col-12 col-md-5">
                        <LoadingButton
                          // loading
                          type="button"
                          variant="outlined"
                          color="primary"
                          className="text-capitalize"
                          onClick={()=>{handleAddClick(attachmentfilters)
                             
                          }}
                        >
                          Add Attachment
                        </LoadingButton>
                      </div> */}
											</div>
										</div>
									</div>
									{/* <div className="row">
                          <div className="col-12 text-end">
                            <LoadingButton
                              // loading={loadingBids}
                              color="primary"
                              size="medium"
                              className="text-white text-capitalize mb-3 mr-3"
                              variant="contained"
                              type="submit"
                              disabled={poSpecificDetails?.status=='Confirmed' ?false:false}
                            >
                              <span>Save</span>
                            </LoadingButton>
                            
                          </div>
                </div>
                 */}
								</div>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>
			<React.Fragment key="top3">
				<Drawer
					anchor="right"
					open={state["openOrderReject"]}
				// onClose={toggleDrawer('openCreateSheet', false)}
				>
					<form onSubmit={formik_PORejectOrder.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 480, md: 720, lg: 1080 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">Reject Entire Order</div>
										<div>
											<IconButton
												onClick={toggleDrawer(
													"openOrderReject",
													false,
													allPOShipHeader
												)}
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
											<div className="mb-4 textblue f14">
												Order Rejection Header
											</div>
											<div className="row">
												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="rejectionReason"
														InputLabelProps={{
															shrink: true,
														}}
														multiline
														rows={3}
														name="rejectionReason"
														className="w-100 f14"
														size="small"
														label="Reason"
														variant="outlined"
														value={formik_PORejectOrder.values?.rejectionReason}
														onChange={(e) => {
															//console.log(formik_PORejectOrder.errors.rejectionReason)
															formik_PORejectOrder?.setFieldValue(
																"rejectionReason",
																e.target.value
															);
														}}
													/>
												</div>
											</div>
											<hr className="mt-0" />
										</div>
									</div>
									<div className="row">
										<div className="col-12 text-end">
											<LoadingButton
												// loading={loadingBids}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
											>
												<span>Save</span>
											</LoadingButton>
											{/* Add margin-bottom to create a gap */}
										</div>
									</div>
								</div>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>

			<React.Fragment key="top4">
				<Drawer
					anchor="right"
					open={state["openOrderGRNSubmit"]}
				// onClose={toggleDrawer('openCreateSheet', false)}
				>
					<form onSubmit={formik_GRNAccepted.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">GRN Submit</div>
										<div>
											<IconButton
												onClick={toggleDrawer("openOrderGRNSubmit", false, [])}
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
														id="grnNumber"
														InputLabelProps={{
															shrink: true,
														}}
														name="grnNumber"
														className="w-100 f14"
														size="small"
														label="GRN No *"
														variant="outlined"
														value={formik_GRNAccepted?.values?.grnNumber}
														onChange={formik_GRNAccepted.handleChange}
														inputProps={{
															maxLength: 25,
														}}
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<Typography variant="body2" color="textSecondary">
																		{formik_GRNAccepted?.values?.grnNumber?.length}/25
																	</Typography>
																</InputAdornment>
															),
														}}
													/>
													{formik_GRNAccepted.touched.grnNumber &&
														formik_GRNAccepted.errors.grnNumber ? (
														<div style={{ color: "red" }}>
															{formik_GRNAccepted.errors.grnNumber}
														</div>
													) : null}
												</div>

												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="grnAmount"
														InputLabelProps={{
															shrink: true,
														}}
														name="grnAmount"
														className="w-100 f14"
														size="small"
														label="GRN Amount *"
														variant="outlined"
														value={formik_GRNAccepted?.values?.grnAmount}
														onChange={formik_GRNAccepted.handleChange}
														inputProps={{
															maxLength: 25,
														}}
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<Typography variant="body2" color="textSecondary">
																		{formik_GRNAccepted?.values?.grnAmount?.length}/25
																	</Typography>
																</InputAdornment>
															),
														}}
														onInput={(e) => onlyNumberdec(e)}
													/>
													{formik_GRNAccepted.touched.grnAmount &&
														formik_GRNAccepted.errors.grnAmount ? (
														<div style={{ color: "red" }}>
															{formik_GRNAccepted.errors.grnAmount}
														</div>
													) : null}
												</div>
												<div className="col-12 col-md-4 col-lg-12 mb-4">
													<TextField
														id="grnQuantity"
														InputLabelProps={{
															shrink: true,
														}}
														name="grnQuantity"
														className="w-100 f14"
														size="small"
														label="GRN Quantity *"
														variant="outlined"
														value={formik_GRNAccepted?.values?.grnQuantity}
														onChange={formik_GRNAccepted.handleChange}
														onInput={(e) => onlyNumbers(e)}
														inputProps={{
															maxLength: 15,
														}}
														InputProps={{
															endAdornment: (
																<InputAdornment position="end">
																	<Typography variant="body2" color="textSecondary">
																		{formik_GRNAccepted?.values?.grnQuantity?.length}/15
																	</Typography>
																</InputAdornment>
															),
														}}
													/>
													{formik_GRNAccepted.touched.grnQuantity &&
														formik_GRNAccepted.errors.grnQuantity ? (
														<div style={{ color: "red" }}>
															{formik_GRNAccepted.errors.grnQuantity}
														</div>
													) : null}
												</div>
											</div>

											<div className="col-12 col-md-4 col-lg-12 mb-4">
												<LocalizationProvider dateAdapter={AdapterDateFns}>
													<MobileDatePicker
														label="GRN Date"
														disablePast
														minDate={new Date()}
														value={formik_GRNAccepted.values?.grnDate}
														name="grnDate"
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
														onChange={(newValue) => {
															formik_GRNAccepted.setFieldValue(
																"grnDate",
																newValue
															);
														}}
														format="dd/MM/yyyy"
														renderInput={(params) => (
															<TextField variant="standard" {...params} />
														)}
													/>
												</LocalizationProvider>

												{formik_GRNAccepted.touched.grnDate &&
													formik_GRNAccepted.errors.grnDate ? (
													<div style={{ color: "red" }}>
														{formik_GRNAccepted.errors.grnDate}
													</div>
												) : null}
											</div>
										</div>
									</div>
									<div className="row">
										<div className="col-12 text-end">
											<LoadingButton
												// loading={loadingBids}
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
												disabled={grnSaveDisable || isShippedHistoryEditDisabled}
											>
												<span>Save</span>
											</LoadingButton>
											{/* Add margin-bottom to create a gap */}
										</div>
									</div>
								</div>
							</div>
						</Box>
					</form>
				</Drawer>
			</React.Fragment>

			{/* <React.Fragment key="top5">
				<Drawer
					anchor="right"
					open={state["openInvoiceApproved"]}
				>
					<form
						onSubmit={formik_InvoiceAccepted.handleSubmit}
						autoComplete="off"
					>
						<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">Invoice Details</div>
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
														id="status"
														InputLabelProps={{
															shrink: true,
														}}
														name="status"
														select
														className="mb-2"
														fullWidth
														size="small"
														label="Invoice Status"
														variant="outlined"
														value={formik_InvoiceAccepted.values.status}
														onChange={formik_InvoiceAccepted.handleChange}
													>
														<MenuItem value="Approved">Approve</MenuItem>
														<MenuItem value="Rejected">Revert</MenuItem>
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
														value={
															formik_InvoiceAccepted?.values?.approveComment
														}
														onChange={formik_InvoiceAccepted.handleChange}
													/>
												</div>
											</div>

											<hr className="mt-0" />
										</div>
									</div>
									<div className="row">
										<div className="col-12 text-end">
											<LoadingButton
												color="primary"
												size="medium"
												className="text-white text-capitalize mb-3 mr-3"
												variant="contained"
												type="submit"
												disabled={approveSaveDisable}
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
			</React.Fragment> */}

			{/* Payment Details Drawer */}
			<Drawer
				anchor="right"
				open={state.openPaymentDetails}
				onClose={() => {
					setState(prevState => ({ ...prevState, openPaymentDetails: false }));
					setPaymentDetails(null);
				}}
			>
				<Box sx={{ width: { xs: 320, sm: 400, md: 480 } }}>
					<div className="flex flex-col">
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">Payment Details</div>
								<div>
									<IconButton
										onClick={() => {
											setState(prevState => ({ ...prevState, openPaymentDetails: false }));
											setPaymentDetails(null);
										}}
										size="small"
										edge="start"
										sx={{ mr: 1 }}
									>
										<HiOutlineX className="f20 text-white" />
									</IconButton>
								</div>
							</div>
						</Box>

						<div className="p-4">
							{console.log("Drawer State - loadingPayment:", loadingPayment, "paymentDetails:", paymentDetails)}
							{loadingPayment ? (
								<div className="text-center py-5">
									<div className="spinner-border text-primary" role="status">
										<span className="visually-hidden">Loading...</span>
									</div>
									<div className="mt-2">Loading payment details...</div>
								</div>
							) : paymentDetails ? (
								<div className="row">
									<div className="col-12 mb-4">
										<div className="mb-4 textblue f14 fw-bold d-flex align-items-center">
											<MdReceipt className="me-2" size={20} />
											Payment Information
										</div>

										<div className="row">
											<div className="col-12 mb-3">
												<TextField
													id="bankName"
													InputLabelProps={{
														shrink: true,
													}}
													inputProps={{
														readOnly: true,
													}}
													name="bankName"
													className="w-100 f14"
													size="small"
													label="Bank Name"
													variant="outlined"
													value={paymentDetails.bankName || paymentDetails.BankName || 'N/A'}
												/>
											</div>

											<div className="col-12 mb-3">
												<TextField
													id="transactionID"
													InputLabelProps={{
														shrink: true,
													}}
													inputProps={{
														readOnly: true,
													}}
													name="transactionID"
													className="w-100 f14"
													size="small"
													label="Transaction ID"
													variant="outlined"
													value={paymentDetails.transactionID || paymentDetails.TransactionID || paymentDetails.transactionId || paymentDetails.TransactionId || 'N/A'}
												/>
											</div>

											<div className="col-12 mb-3">
												<TextField
													id="amount"
													InputLabelProps={{
														shrink: true,
													}}
													inputProps={{
														readOnly: true,
													}}
													name="amount"
													className="w-100 f14"
													size="small"
													label="Amount"
													variant="outlined"
													value={paymentDetails.amount || paymentDetails.Amount || 'N/A'}
												/>
											</div>

											<div className="col-12 mb-3">
												<TextField
													id="paymentDate"
													InputLabelProps={{
														shrink: true,
													}}
													inputProps={{
														readOnly: true,
													}}
													name="paymentDate"
													className="w-100 f14"
													size="small"
													label="Payment Date"
													variant="outlined"
													value={
														(paymentDetails.paymentDate || paymentDetails.PaymentDate)
															? formatDateViaTimeZone(paymentDetails.paymentDate || paymentDetails.PaymentDate, "en-GB", formatoption)
															: 'N/A'
													}
												/>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="text-center py-5 text-muted">
									No payment details available
								</div>
							)}
						</div>
					</div>
				</Box>
			</Drawer>

			{/* Payment Terms - Add New Modal */}
			<Modal
				size="xl"
				show={paymentTermModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={() => setPaymentTermModal(false)}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							Manage Payment Terms
						</div>
					</Modal.Title>
					<IconButton
						onClick={() => setPaymentTermModal(false)}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddUpdatePaymentterms
							handlePaymentTermsList={(list) => {
								setPaymentTermsOptions(list);
							}}
						/>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
};

export default PurchaseOrder;
