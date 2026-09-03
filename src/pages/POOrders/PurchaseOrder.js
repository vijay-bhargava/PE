import {
	Box, Button, Menu, MenuItem, Tab, Tabs,
	TextField, InputAdornment, Typography, Tooltip,
} from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import EventApprovalBox from "../BaseCells/eventapprovalbox";
import AddUpdatePaymentterms from "./AddUpdatePaymentterms";
import { HiOutlineLink, HiPlusSm, } from "react-icons/hi";
import {
	useLocation, useNavigate,
	useParams, useSearchParams,
} from "react-router-dom";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import {
	POShipInvoiceGRN, GetPOAttachments, GetPOVersion,
	GetPOCondition, GetPOCreationDetails, POConfirmOrder,
	PORejectOrder, GetPOHeaderList_Slug, POShipInvoiceHeader,
	POShipOrdrItem, POCommercialFind,
} from "../../utils/purchaseOrder";
import { useFormik } from "formik";
import * as Yup from "yup";
import AddGRNDialog from './AddGRNDialog';
import SESDialog from './SESDialog';
import AddASNDialog from './AddASNDialog';
import AddInvoiceDialog from './AddInvoiceDialog';
import {
	useFormik_GRNAccepted, useFormik_POConfirmOrder,
	useFormik_PORejectOrder, useFormik_POShipInvoiceHeader,
	useFormik_POShipOrdrItem,
} from "../../utils/pOToAccept/formik";
import { useCookies } from "react-cookie";
import * as yup from 'yup';
import {
	downloadFilesOnAzure, getPayloadWithStage,
	fetchMasters, getApiErrorMessage,
} from "../../utils/common";
import { StageFindAll } from "../../utils/stagemaster";
import { useStateValue } from "../../store";
import { formatoption, getCurrency, getEventApproversFind } from "../../utils/common/utility";
import GridSkeleton from "../../components/Skeleton/gridSkeleton";
import PEModal from "../../components/PEModal";
import { ApiClient, api } from "../../Apiclient";
import { toast } from "react-toastify";

import { buildQueryParams } from "../../utils/purchaseRequest";
import { PermissionManager, ACTIONS } from '../../utils/permissionManager';
import { LoadingButton } from "@mui/lab";
import { UOMMasterList } from "../../utils/commerciallibrary";
import PODetailsTab from './tabs/PODetailsTab';
import LineItemsTab from './tabs/LineItemsTab';
import PreviewTab from './tabs/PreviewTab';
import ASNTab from './tabs/ASNTab';
import GRNTab from './tabs/GRNTab';
import ServiceEntryTab from './tabs/ServiceEntryTab';
import InvoicesTab from './tabs/InvoicesTab';
import PaymentsTab from './tabs/PaymentsTab';
import PODetailsDialogs from './tabs/PODetailsDialogs';
import PODrawers from './tabs/PODrawers';
import GRNReportModal from './GRNReportModal';
import {
	getOrderedQty, matchesPOItem, isRejectedInvoiceRecord,
	isRejectedInvoiceDetail, getStageInfo, getInvoiceCompletedQty,
	isItemEligibleForAddMode, getEligibleItemsForAddMode,
	hasRemainingItemsForAddMode, isServiceRow, isServiceItem,
} from '../../utils/purchaseOrder/poHelpers';
import '../../assets/css/manage-rfq-v2.css';
import '../../assets/css/rfq-detail-v2.css';
import '../../assets/css/rfq-modern.css';
import '../../assets/css/design-system.css';

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
	const [{ atoken, rtoken, customerid, userDetail, eventCode, customersuffix }, dispatch] = useStateValue();
	//const [poSpecificDetails] = useState(location.state); //To get Data object from sending Component link
	const [poSpecificDetails, setPoSpecificDetails] = useState();
	const [poHeaderInfo, setPoHeaderInfo] = useState(null);

	// Address edit dialog state
	const [openEditBill, setOpenEditBill] = useState(false);
	const [openEditShip, setOpenEditShip] = useState(false);

	// PO Cancel dialog state (Draft stage only, triggered from Save & Continue dropdown)
	const [poCancelDialogOpen, setPoCancelDialogOpen] = useState(false);
	const [poCancelComment, setPoCancelComment] = useState("");
	const [poCancelSubmitting, setPoCancelSubmitting] = useState(false);
	const [poCancelError, setPoCancelError] = useState(null);

	// Status pill → stage flow popup
	const [statusAnchorEl, setStatusAnchorEl] = React.useState(null);
	const handleStatusMenuOpen = (event) => setStatusAnchorEl(event.currentTarget);
	const handleStatusMenuClose = () => setStatusAnchorEl(null);

	// Anchor for the Save & Continue split-button dropdown (separate from anchorElAction)
	const [anchorElSaveContinue, setAnchorElSaveContinue] = useState(null);
	const handleCloseSaveContinueMenu = () => setAnchorElSaveContinue(null);

	// PO Condition edit modal state
	const [openEditCondition, setOpenEditCondition] = useState(false);
	const [editingCondition, setEditingCondition] = useState(null);

	const openPOCancelDialog = () => {
		handleCloseSaveContinueMenu();
		setPoCancelError(null);
		// NOTE: comment is intentionally NOT cleared here, so if a previous
		// attempt failed and the user reopens the dialog, their text is preserved.
		setPoCancelDialogOpen(true);
	};

	const closePOCancelDialog = () => {
		if (poCancelSubmitting) return; // don't allow closing mid-request
		setPoCancelDialogOpen(false);
		setPoCancelError(null);
		// Comment is preserved intentionally (cleared only on success).
	};

	const handlePOCancelConfirm = async () => {
		if (poCancelSubmitting) return; // guard against duplicate clicks
		const trimmedComment = poCancelComment.trim();
		if (!trimmedComment) {
			setPoCancelError("Reason/Comment is required.");
			return;
		}

		setPoCancelSubmitting(true);
		setPoCancelError(null);
		try {
			const queryParams = new URLSearchParams({
				poId: pageSlug,
				Status: "Cancel", // fixed value — must always be "Cancel"
				Comment: trimmedComment,
			}).toString();

			const res = await apiClient.postres(
				`/api/poconfirm/POCancel?${queryParams}`,
				{},
				atoken
			);

			if (res) {
				toast.success("PO cancelled successfully.");
				setPoCancelDialogOpen(false);
				setPoCancelComment(""); // clear only on success
				setPoCancelError(null);
				// Refresh PO status/stage so the stage flow + Save & Continue
				// visibility (which is gated on isDraft) update immediately.
				fetchPOHeaderList_Slug(pageSlug, selectedVersion);
				await loadPOVersionData(pageSlug, selectedVersion);
			} else {
				setPoCancelError("Failed to cancel PO — no response from server.");
			}
		} catch (err) {
			const msg = err?.response?.data?.Message || "Failed to cancel PO.";
			setPoCancelError(msg);
			toast.error(msg);
			// comment is preserved (not cleared) so the user doesn't retype it
		} finally {
			setPoCancelSubmitting(false);
		}
	};

	const [conditionForm, setConditionForm] = useState({
		conditionType: "",
		conditionCategory: "",
		conditionRate: "",
		conditionValue: "",
		currency: "",
		calculationType: "",
		conditionText: "",
	});
	const [savingCondition, setSavingCondition] = useState(false);
	const [isAddingCondition, setIsAddingCondition] = useState(false);
	// Delete condition state
	const [deleteConditionDialogOpen, setDeleteConditionDialogOpen] = useState(false);
	const [conditionToDelete, setConditionToDelete] = useState(null);
	const [isDeletingCondition, setIsDeletingCondition] = useState(false);
	const [currencyOptions, setCurrencyOptions] = useState([]);
	const [commercialTerms, setCommercialTerms] = useState([]);
	// Item-level condition state
	const [isItemConditionMode, setIsItemConditionMode] = useState(false);
	const [targetItemForCondition, setTargetItemForCondition] = useState(null);

	const [billToAddress, setbillToAddress] = useState("");
	const [billToCity, setbillToCity] = useState("");
	const [billToState, setbillToState] = useState("");
	const [billToCountry, setBillToCountry] = useState("");

	const [shipToAddress, setshipToAddress] = useState("");
	const [shipToCity, setshipToCity] = useState("");
	const [shipToState, setshipToState] = useState("");
	const [shipToCountry, setShipToCountry] = useState("");

	// Country list for Bill To / Ship To dropdowns
	const [addressCountryOptions, setAddressCountryOptions] = useState([]);
	useEffect(() => {
		if (!atoken || !customerid) return;
		fetchMasters(atoken, customerid).then((res) => {
			if (res?.countryList) setAddressCountryOptions(res.countryList);
		}).catch(e => { });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [atoken, customerid]);

	// Dependent dropdown lists for address dialogs
	const [billStateOptions, setBillStateOptions] = useState([]);
	const [billCityOptions, setBillCityOptions] = useState([]);
	const [shipStateOptions, setShipStateOptions] = useState([]);
	const [shipCityOptions, setShipCityOptions] = useState([]);
	const [billToCountryObj, setBillToCountryObj] = useState(null);
	const [billToStateObj, setBillToStateObj] = useState(null);
	const [billToCityObj, setBillToCityObj] = useState(null);
	const [shipToCountryObj, setShipToCountryObj] = useState(null);
	const [shipToStateObj, setShipToStateObj] = useState(null);
	const [shipToCityObj, setShipToCityObj] = useState(null);

	const [currentStage, setCurrentStage] = useState("");
	// Single source of truth for "is this PO still in Draft" — used across the
	// PO Details tab (PO Number / Expiry Date editability) and other stage-gated UI.
	const isDraft = String(currentStage ?? "").toLowerCase().includes("draft");
	// Single source of truth for "is this PO Under Approval" — Add ASN / Add GRN /
	// Add SES / Add Invoice (tab buttons AND inline per-row actions) must be
	// hidden and unusable while the PO is in this stage.
	const isUnderApprovalStage = String(currentStage ?? "").toLowerCase().includes("under approval");
	const [currentInvStage, setCurrentInvStage] = useState("");
	const [workflowPanelTab, setWorkflowPanelTab] = useState('workflow');
	const [historyAudit, setHistoryAudit] = useState([]);
	const [historyGraph, setHistoryGraph] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);

	useEffect(() => {
		if (workflowPanelTab === 'history' && pageSlug) {
			fetchPanelHistory();
		}
	}, [workflowPanelTab, pageSlug]);

	const fetchPanelHistory = async () => {
		if (!pageSlug) return;
		setHistoryLoading(true);
		const params = new URLSearchParams({ CustomerId: customerid, EventType: 'PO', EventId: pageSlug }).toString();
		const res = await new ApiClient(customersuffix).getres(`api/ReportConfig/AuditReport?${params}`, atoken);
		if (res?.data) {
			setHistoryAudit(res.data?.changeAudit || []);
			setHistoryGraph(res.data?.stategraph || []);
		}
		setHistoryLoading(false);
	};

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

	const fetchPOHeaderList_Slug = (pageSlug, version) => {
		const ver = version ?? selectedVersion ?? 1;
		GetPOHeaderList_Slug(pageSlug, atoken, ver).then((res) => {

			if (res) {
				// Normalize condition property name: API returns `poHeaderConditions`
				// but components expect `poConditions` (header) and `poItemConditions` (item-level).
				const rawConditions = res?.poConditions ?? res?.poHeaderConditions ?? [];
				const mapped = {
					...res,
					poConditions: rawConditions.filter(c => c.isHeaderCondition === true),
					poItemConditions: rawConditions.filter(c => c.isHeaderCondition === false),
				};

				// keep header metadata separate - do not populate PO details from this call
				setPoHeaderInfo(mapped);
			}
		});
	};

	const [Ref_ItemId, SetRef_ItemId] = useState(0);
	const [eventType, setEvenType] = useState("PO");
	const [invStatus, setInvStatus] = useState("");
	const [eventId, setEventId] = useState(pageSlug);
	const [allPOShipHeader, setallPOShipHeader] = useState([]);

	const [poInvoiceList, setPoInvoiceList] = useState([]);
	const [poGrnList, setPoGrnList] = useState([]);
	const [poSesList, setPoSesList] = useState([]);
	// Track which GRN / SES header rows are expanded to show their line items.
	const [expandedGrnHeaderIds, setExpandedGrnHeaderIds] = useState(new Set());
	const [expandedSesHeaderIds, setExpandedSesHeaderIds] = useState(new Set());

	const toggleGrnHeaderExpand = (id) => {
		setExpandedGrnHeaderIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	};
	const toggleSesHeaderExpand = (id) => {
		setExpandedSesHeaderIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	};

	// Dashboard counts (drives tab visibility/labels) — same shape/source as Matrix PO,
	// populated from GetPOVersion's dashboardCounts payload in loadPOVersionData.
	const [dashboardCounts, setDashboardCounts] = useState({
		itemCount: 0,
		asnCount: 0,
		grnCount: 0,
		sesCount: 0,
		invoiceCount: 0,
		paymentCount: 0
	});

	// customerId derived from GetPOVersion response — do NOT hardcode.
	const [poCustomerId, setPoCustomerId] = useState(null);

	// ASN cache: null = not loaded yet, array = loaded
	const [poAsnList, setPoAsnList] = useState(null);
	const asnLoadedRef = useRef(false);

	// Refresh ASN data (used after ASN create and on ASN tab).
	const refreshShipmentData = useCallback(async () => {
		if (!pageSlug) return;
		try {
			const res = await apiClient.get(`/api/shipment/Find?POId=${pageSlug}`, atoken);
			const list = Array.isArray(res) ? res : [];
			setPoAsnList(list);
			setallPOShipHeader(list);
			asnLoadedRef.current = true;
		} catch (e) {
			console.error('Failed to refresh ASN list', e);
			setPoAsnList([]);
			asnLoadedRef.current = false;
		}
	}, [pageSlug, atoken]);

	// Current tab index for the Purchase Order page
	const [value, setValue] = React.useState(0);

	// Fetch ASN headers using /api/shipment/Find?POId=... as soon as the PO is
	// known, and again whenever the ASN tab is (re)opened for freshness.
	// IMPORTANT: this must NOT be gated behind "ASN tab opened" only — Add GRN /
	// Add SES button visibility depends on knowing whether ASN is already
	// completed for the PO, and that check can happen from any tab (Line Items,
	// GRN tab, SES tab) before the user ever visits the ASN tab. Loading this
	// only on value === 2 left poAsnList/allPOShipHeader empty (and therefore
	// the "ASN completed" check false) whenever a user navigated straight to
	// another tab, which is why Add SES/Add GRN stayed hidden despite the
	// user having the correct role/claimValue permission.
	useEffect(() => {
		if (!pageSlug) return;
		if (value === 2 || !asnLoadedRef.current) {
			refreshShipmentData();
		}
	}, [value, pageSlug, refreshShipmentData]);

	// Fetch PO GRN headers using /api/grnheader/Find?poId=...&customerId=... when GRN tab is opened.
	// customerId is read from GetPOVersion (stored in poCustomerId). Do NOT preload.
	useEffect(() => {
		const fetchGrns = async () => {
			if (!pageSlug) return;
			try {
				const cid = poCustomerId ?? customerid;
				const res = await apiClient.get(
					`/api/grnheader/Find?poId=${pageSlug}&customerId=${cid}`,
					atoken
				);
				if (Array.isArray(res)) setPoGrnList(res);
			} catch (e) {
				console.error('Failed to fetch PO GRNs', e);
			}
		};

		if (value === 3) fetchGrns();
	}, [value, pageSlug, atoken, poCustomerId]);

	const [allPOItems, setAllPOItems] = useState([]);
	const NO_REMAINING_ITEM_MSG = 'No remaining item for adding.';
	// Mode-specific "no remaining quantity" messages (GRN vs SES use distinct copy
	// per the required validation text; ASN/INVOICE keep the generic message).
	const NO_REMAINING_ITEM_MSG_GRN = 'No Remaining Item For Add';
	const NO_REMAINING_ITEM_MSG_SES = 'No Remaining Item To Add';
	const getNoRemainingItemMsg = (mode) => {
		if (mode === 'GRN') return NO_REMAINING_ITEM_MSG_GRN;
		if (mode === 'SES') return NO_REMAINING_ITEM_MSG_SES;
		return NO_REMAINING_ITEM_MSG;
	};

	// Thin wrappers that bind the imported pure helpers to local state
	const _state = () => ({ allPOShipHeader, poGrnList, poSesList, poInvoiceList });
	const _isItemEligibleForAddMode = (mode, item) => isItemEligibleForAddMode(mode, item, _state());
	const _getEligibleItemsForAddMode = (mode, sourceItems = allPOItems) => getEligibleItemsForAddMode(mode, sourceItems, _state());
	const _hasRemainingItemsForAddMode = (mode) => hasRemainingItemsForAddMode(mode, allPOItems, _state());
	const _isServiceRow = (row) => isServiceRow(row, allPOItems);
	const _isServiceItem = (item) => isServiceItem(item, allPOItems);

	const displayPOItems = useMemo(
		() => (allPOItems ?? []).map(item => ({
			...item,
			orderedQuantity: getOrderedQty(item),
			invoicedQty: getInvoiceCompletedQty(item, poInvoiceList),
		})),
		[allPOItems, poInvoiceList]
	);

	// Delivery date edit state
	const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
	const [deliveryDialogRow, setDeliveryDialogRow] = useState(null);
	const [deliveryDialogDate, setDeliveryDialogDate] = useState(null);
	const [deliveryUpdates, setDeliveryUpdates] = useState({}); // itemId -> Date

	// PO Number inline edit state
	const [poNumberInput, setPoNumberInput] = useState('');

	// PO Date edit dialog state
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
	const handleCloseActionMenu = () => setAnchorElAction(null);

	// GRN Report state variables
	const [grnMenuAnchor, setGrnMenuAnchor] = useState(null);
	const [grnReportModal, setGrnReportModal] = useState(false);
	const [grnReportData, setGrnReportData] = useState([]);
	const [loadingGrnReport, setLoadingGrnReport] = useState(false);
	const [downloadingGrnId, setDownloadingGrnId] = useState(null);
	const [loadingSesReport, setLoadingSesReport] = useState(false);

	const [openGrnMenu, setOpenGrnMenu] = useState(null);
	const [currentGrnRow, setCurrentGrnRow] = useState(null);

	// Add GRN Dialog state
	const [addGrnDialogOpen, setAddGrnDialogOpen] = useState(false);
	const [selectedGrnItems, setSelectedGrnItems] = useState([]);

	// Add SES Dialog state (mirrors Add GRN Dialog state/pattern)
	const [addSesDialogOpen, setAddSesDialogOpen] = useState(false);
	const [selectedSesItems, setSelectedSesItems] = useState([]);
	const [sesDialogMode, setSesDialogMode] = useState('add'); // 'add' | 'preview'
	const [sesPreviewData, setSesPreviewData] = useState(null);

	// Add ASN Dialog state (mirrors Add GRN/SES Dialog state/pattern) — POST /api/shipment/Add
	const [addAsnDialogOpen, setAddAsnDialogOpen] = useState(false);
	const [selectedAsnItems, setSelectedAsnItems] = useState([]);
	const [asnDialogMode, setAsnDialogMode] = useState('add'); // 'add' | 'preview'
	const [asnPreviewData, setAsnPreviewData] = useState(null);

	// Add Invoice Dialog state (mirrors Add GRN/SES Dialog state/pattern) — POST /api/poinvoice/Invoice
	const [addInvoiceDialogOpen, setAddInvoiceDialogOpen] = useState(false);
	const [selectedInvoiceItems, setSelectedInvoiceItems] = useState([]);
	const [invoiceDialogMode, setInvoiceDialogMode] = useState('add'); // 'add' | 'preview'
	const [invoicePreviewData, setInvoicePreviewData] = useState(null);
	// Invoice approval via two-ID URL (/purchase-order/:invoiceId/:poId?ActionType=approval)
	const [invApprovalApprovers, setInvApprovalApprovers] = useState([]);
	const [invApprovalPanelShow, setInvApprovalPanelShow] = useState(false);
	// Which view the right-side panel of the Invoice Preview shows: 'approvers' | 'action'
	const [invApprovalPanelView, setInvApprovalPanelView] = useState('approvers');
	const invApprovalOpenedRef = useRef(false);

	// ─────────────────────────────────────────────────────────────────
	// Unified Add ASN / Add GRN / Add SES / Add Invoice flow.
	// Clicking "+ Add X" on the ASN/GRN/SES/Invoice tab navigates to the
	// PO Line Items tab, turns on checkboxes there (hidden otherwise),
	// and shows Next/Back once at least one item is selected. Next opens
	// the existing Shipment Drawer (ASN/Invoice) or GRN/SES Dialog with
	// only the selected items. Back (and cancelling the drawer/dialog)
	// returns to the line item selection so the choice can be adjusted.
	// ─────────────────────────────────────────────────────────────────
	const hasCreatePermission = useCallback((claimTypes, action = ACTIONS.CREATE) => {
		if (!poPermissionManager) return false;

		const claimTypeList = Array.isArray(claimTypes) ? claimTypes : [claimTypes];
		const actionKey = String(action || '').charAt(0).toUpperCase() + String(action || '').slice(1);

		const exactMatch = claimTypeList.some((claimType) => poPermissionManager.hasPermission(claimType, action));
		if (exactMatch) return true;

		return (poPermissionManager.userAccess ?? []).some((access) => {
			const claimType = String(access?.claimType ?? '').trim();
			const normalizedClaimType = claimType.toLowerCase();
			const matchesClaim = claimTypeList.some((claimTypeOption) => {
				const normalizedOption = String(claimTypeOption ?? '').trim().toLowerCase();
				return normalizedClaimType === normalizedOption || normalizedClaimType.includes(normalizedOption);
			});

			if (!matchesClaim) return false;

			const claimValue = typeof access?.claimValue === 'string'
				? (() => {
					try {
						return JSON.parse(access.claimValue);
					} catch (error) {
						return {};
					}
				})()
				: (access?.claimValue ?? {});

			return claimValue?.[actionKey] === 'Y';
		});
	}, [poPermissionManager]);

	const canCreateAsn = useMemo(() => hasCreatePermission('ASN', ACTIONS.CREATE), [hasCreatePermission]);
	const canCreateGrn = useMemo(() => hasCreatePermission('GRN', ACTIONS.CREATE), [hasCreatePermission]);
	const canCreateSes = useMemo(() => hasCreatePermission('SES', ACTIONS.CREATE), [hasCreatePermission]);
	const canCreatePayment = useMemo(() => hasCreatePermission(['Payment', 'Payments'], ACTIONS.CREATE), [hasCreatePermission]);
	const canReadInvoice = useMemo(() => invPermissionManager?.hasPermission('List', ACTIONS.READ) ?? false, [invPermissionManager]);
	const canCreateInvoice = useMemo(() => invPermissionManager?.hasPermission('List', ACTIONS.CREATE) ?? false, [invPermissionManager]);

	const ADD_FLOW_ORIGIN_TAB = { ASN: 2, GRN: 3, SES: 4, INVOICE: 5 };
	const ADD_FLOW_LABEL = { ASN: 'ASN', GRN: 'GRN', SES: 'SES', INVOICE: 'Invoice' };

	const [addFlowMode, setAddFlowMode] = useState(null); // null | 'ASN' | 'GRN' | 'SES' | 'INVOICE'
	const [addFlowStep, setAddFlowStep] = useState('select'); // 'select' | 'confirm'
	const [addFlowSelectedItems, setAddFlowSelectedItems] = useState([]);
	const [addFlowOriginTab, setAddFlowOriginTab] = useState(null);
	const [poPaymentList, setPoPaymentList] = useState([]);
	const [loadingPayments, setLoadingPayments] = useState(false);
	const [paymentError, setPaymentError] = useState(null);
	const [openAddPaymentDrawer, setOpenAddPaymentDrawer] = useState(false);

	// Payment tab lazy cache flag
	const paymentLoadedRef = useRef(false);

	// Fetch PO payments using /api/paymentheader/Find when Payments tab is opened (lazy, cached via paymentLoadedRef)
	const fetchPayments = useCallback(async () => {
		if (!pageSlug) return;
		setLoadingPayments(true);
		setPaymentError(null);
		try {
			const res = await apiClient.get(`/api/paymentheader/Find?POId=${pageSlug}`, atoken);
			if (Array.isArray(res)) {
				setPoPaymentList(res);
				paymentLoadedRef.current = true;
			} else {
				setPoPaymentList([]);
				paymentLoadedRef.current = true;
			}
		} catch (e) {
			console.error('Failed to fetch PO payments', e);
			setPaymentError(e?.message || 'Failed to load payment data.');
			setPoPaymentList([]);
		} finally {
			setLoadingPayments(false);
		}
	}, [pageSlug, atoken]);

	// Trigger fetchPayments when Payment tab (value === 6) is opened
	useEffect(() => {
		if (value !== 7 || !pageSlug || paymentLoadedRef.current) return;

		fetchPayments();
	}, [value, pageSlug, fetchPayments]);

	// Start the flow from a tab's "+ Add X" button.
	const startAddFlow = (mode) => {
		// if (mode === 'ASN' && !isShipmentAllowed()) {
		// 	toast.warning('Shipment is not allowed until the PO reaches the Confirmed stage.');
		// 	return;
		// }
		if (isUnderApprovalStage) {
			toast.warning('Not allowed while the PO is Under Approval.');
			return;
		}
		if (!_hasRemainingItemsForAddMode(mode)) {
			toast.warning(getNoRemainingItemMsg(mode));
			return;
		}
		setAddFlowMode(mode);
		setAddFlowStep('select');
		setAddFlowSelectedItems([]);
		setAddFlowOriginTab(ADD_FLOW_ORIGIN_TAB[mode]);
		setValue(1); // navigate to PO Line Items tab
	};

	// Cancel the flow entirely and return to the tab it started from.
	const cancelAddFlow = () => {
		const originTab = addFlowOriginTab;
		setAddFlowMode(null);
		setAddFlowStep('select');
		setAddFlowSelectedItems([]);
		if (originTab !== null) setValue(originTab);
	};

	// Toggle a single line item's selection during the Add flow.
	const handleAddFlowToggleItem = (item, checked) => {
		if (checked && !_isItemEligibleForAddMode(addFlowMode, item)) {
			toast.warning(getNoRemainingItemMsg(addFlowMode));
			return;
		}
		setAddFlowSelectedItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (checked && !isSelected) return [...prev, item];
			if (!checked && isSelected) return prev.filter(i => i.id !== item.id);
			return prev;
		});
	};

	// Select/deselect all line items during the Add flow.
	const handleAddFlowToggleAll = (checked) => {
		setAddFlowSelectedItems(checked ? _getEligibleItemsForAddMode(addFlowMode, allPOItems) : []);
	};

	// Next: validate the selection, then open the relevant existing
	// Drawer/Dialog with only the selected line items.
	const handleAddFlowNext = () => {
		if (addFlowSelectedItems.length === 0) {
			toast.warning('Please select at least one line item.');
			return;
		}
		const eligibleSelectedItems = _getEligibleItemsForAddMode(addFlowMode, addFlowSelectedItems);
		if (eligibleSelectedItems.length === 0) {
			toast.warning(getNoRemainingItemMsg(addFlowMode));
			return;
		}
		if (addFlowMode === 'ASN') {
			// if (!isShipmentAllowed()) {
			// 	toast.warning('Shipment is not allowed until the PO reaches the Confirmed stage.');
			// 	return;
			// }
			handleOpenAddAsnDrawer(eligibleSelectedItems);
		} else if (addFlowMode === 'INVOICE') {
			handleOpenAddInvoiceDrawer(eligibleSelectedItems);
		} else if (addFlowMode === 'GRN') {
			setSelectedGrnItems(eligibleSelectedItems);
			setAddGrnDialogOpen(true);
		} else if (addFlowMode === 'SES') {
			setSelectedSesItems(eligibleSelectedItems);
			setAddSesDialogOpen(true);
		}
		setAddFlowStep('confirm');
	};

	const renderAddFlowButton = (mode, label) => {
		// Under Approval: Add ASN / Add GRN / Add SES / Add Invoice must not be visible.
		if (isUnderApprovalStage) return null;
		const disabled = !_hasRemainingItemsForAddMode(mode);
		const noRemainingMsg = getNoRemainingItemMsg(mode);
		const handleDisabledClick = () => {
			if (disabled) toast.warning(noRemainingMsg);
		};

		return (
			<Tooltip title={disabled ? noRemainingMsg : ''}>
				<Box component="span" onClick={handleDisabledClick} sx={{ display: 'inline-flex' }}>
					<Button
						size="small"
						variant="text"
						startIcon={<HiPlusSm />}
						disabled={disabled}
						sx={{
							textTransform: 'none',
							fontSize: 12,
							color: '#1976d2',
							'&.Mui-disabled': { color: '#9e9e9e' },
						}}
						onClick={() => startAddFlow(mode)}
					>
						{label}
					</Button>
				</Box>
			</Tooltip>
		);
	};

	// Generate PDF for the PO before submitting to supplier
	const generatePdf = async () => {
		try {
			const res = await apiClient.getres(`/api/poconfirm/${pageSlug}/GeneratePdf`, atoken);
			if (res) {
				return true;
			}
			toast.error('Failed to generate PO PDF.');
			return false;
		} catch (err) {
			toast.error('Failed to generate PO PDF.');
			return false;
		}
	};

	// Open modal in "Add New Condition" mode with commercial terms from POCommercialFind
	const handleOpenAddCondition = async () => {
		setIsAddingCondition(true);
		setEditingCondition(null);
		setIsItemConditionMode(false);
		setTargetItemForCondition(null);
		setCommercialTerms([]);
		setConditionForm({
			conditionType: "",
			conditionCategory: "",
			conditionRate: "",
			conditionValue: "",
			currency: "",
			calculationType: "",
			conditionText: "",
		});
		setOpenEditCondition(true);
		// Fetch commercial terms using eventId (RfqId) from PO header
		const rfqId = poSpecificDetails?.eventId;
		if (rfqId) {
			try {
				const data = await POCommercialFind(rfqId, false, atoken);
				if (Array.isArray(data) && data.length > 0) {
					setCommercialTerms(data);
				}
			} catch (_err) {
				// best-effort; silently ignore
			}
		}
	};

	// Delete PO Condition
	const handleDeleteCondition = async () => {
		if (!conditionToDelete) return;
		setIsDeletingCondition(true);
		try {
			const res = await apiClient.postres(`/api/pocondition/Delete?ConditionId=${conditionToDelete.id}`, {}, atoken);
			if (res) {
				toast.success('Condition deleted successfully.');
				// Re-fetch conditions for the current version to keep state in sync
				const conds = await GetPOCondition(pageSlug, selectedVersion, atoken, { signal: versionControllerRef.current?.signal });
				if (!(conds && conds.__cancelled)) {
					setPoSpecificDetails(prev => ({
						...prev,
						poConditions: (conds ?? []).filter(c => c.isHeaderCondition === true),
						poItemConditions: (conds ?? []).filter(c => c.isHeaderCondition === false),
					}));
				}
				setDeleteConditionDialogOpen(false);
				setConditionToDelete(null);
			}
		} catch (err) {
			const msg = err?.response?.data?.Message || 'Failed to delete condition.';
			toast.error(msg);
		} finally {
			setIsDeletingCondition(false);
		}
	};

	// GRN Menu Handlers
	const handleGrnMenuOpen = (event, row) => {
		setGrnMenuAnchor(event.currentTarget);
		setOpenGrnMenu(event.currentTarget);
		setCurrentGrnRow(row);
	};

	const handleGrnMenuClose = () => {
		setGrnMenuAnchor(null);
		setOpenGrnMenu(null);
		setCurrentGrnRow(null);
	};

	// Fetch GRN Report Data
	// Fetch GRN Report data for specific shipment
	const fetchGrnReport = async (shipmentId) => {
		try {
			setLoadingGrnReport(true);
			const queryParams = buildQueryParams({
				CustomerId: customerid,
				POId: pageSlug,
				...(shipmentId && { Shipid: shipmentId })
			});
			const res = await apiClient.getres(`/api/poinvoice/GRNReport?${queryParams}`, atoken);
			if (res?.data?.result) {
				// API already filters by Shipid, so use result directly
				setGrnReportData(res.data.result);
				return res.data.result;
			}
			return [];
		} catch (error) {
			toast.error('Failed to fetch GRN report');
			return [];
		} finally {
			setLoadingGrnReport(false);
		}
	};

	// Handle View GRN Report
	// View GRN Report for specific shipment
	const handleViewGrnReport = async () => {
		const shipmentId = currentGrnRow?.id;
		handleGrnMenuClose();
		await fetchGrnReport(shipmentId);
		setGrnReportModal(true);
	};

	// Handle closing Add GRN Dialog
	const handleCloseAddGrnDialog = () => {
		setAddGrnDialogOpen(false);
		setSelectedGrnItems([]); // Clear selection when closing
		// If this dialog was opened via the unified Add flow and is still active
		// (i.e. the user cancelled rather than successfully submitted — a
		// successful submit already clears addFlowMode in handleSubmitGrn),
		// return to the line item selection step so they can adjust their choice.
		if (addFlowMode === 'GRN') {
			setAddFlowStep('select');
			setValue(1);
		}
	};

	// Handle GRN submission from dialog — POST /api/grnheader/Add.
	// grnData.grnItem already contains only the selected line items (built in AddGRNDialog).
	const handleSubmitGrn = async (grnData) => {
		try {
			const cid = poCustomerId ?? customerid;
			const payload = {
				grnNumber: grnData.grnNumber,
				poId: parseInt(pageSlug),
				customerId: cid,
				vendorId: poSpecificDetails?.vendorId ?? 0,
				plantId: poSpecificDetails?.plantId ?? 0,
				grnDate: grnData.grnDate ? new Date(grnData.grnDate).toISOString() : new Date().toISOString(),
				invoiceNo: grnData.invoiceNo ?? '',
				invoiceDate: grnData.invoiceDate ? new Date(grnData.invoiceDate).toISOString() : null,
				grnStatus: 'GRN',
				createdById: userDetail?.id ?? 0,
				createdByName: userDetail?.name ?? '',
				// Only the selected line items are sent in grnItem.
				grnItem: (grnData.grnItem ?? []).map(it => ({
					poItemId: it.poItemId,
					customerId: cid,
					receivedQty: it.receivedQty,
					acceptedQty: it.acceptedQty,
					rejectedQty: it.rejectedQty,
					lineItemNo: it.lineItemNo,
					itemCode: it.itemCode,
				})),
			};

			await apiClient.postres(`/api/grnheader/Add`, payload, atoken);

			// Refresh GRN list (same endpoint/pattern as the GRN tab's own fetch) and PO data.
			try {
				const res = await apiClient.get(`/api/grnheader/Find?poId=${pageSlug}&customerId=${cid}`, atoken);
				if (Array.isArray(res)) setPoGrnList(res);
			} catch (e) {
				console.error('Failed to refresh GRN list', e);
			}
			await fetchPOHeaderList_Slug(pageSlug, selectedVersion);
			await loadPOVersionData(pageSlug, selectedVersion);
			// Refresh PO line items (quantities/grnSesStatus/eligibility) using the
			// existing PO Creation Detail API so Add GRN/Add SES buttons and
			// remaining-quantity displays reflect this GRN immediately.
			await fetchPOCreationItems();

			toast.success('GRN created successfully for the selected items');

			// If this GRN was created via the unified Add flow, the flow is now
			// complete — exit selection mode entirely (the dialog's own onClose,
			// fired right after this, will see addFlowMode already cleared and
			// simply close instead of returning to the selection step).
			if (addFlowMode === 'GRN') {
				setAddFlowMode(null);
				setAddFlowStep('select');
				setAddFlowSelectedItems([]);
			}
		} catch (error) {
			toast.error('Failed to create GRN');
			throw error;
		}
	};

	// Handle closing Add SES Dialog
	const handleCloseAddSesDialog = () => {
		setAddSesDialogOpen(false);
		setSelectedSesItems([]);
		setSesDialogMode('add');
		setSesPreviewData(null);
		if (addFlowMode === 'SES') {
			setAddFlowStep('select');
			setValue(1);
		}
	};

	const [UOMMaster, setUOMMaster] = useState([]);
	const pullUOMMasterList = () => {
		var data = {
			CustomerId: customerid,
			IsActive: true

		};

		UOMMasterList(data, atoken).then((res) => {
			// API has been observed to return either a bare array or a wrapper
			// object like { data: [...] } / { result: [...] } — normalize so the
			// Invoice dialog's UOM dropdown always receives a plain array.
			const list = Array.isArray(res) ? res : (res?.data ?? res?.result ?? res?.uomList ?? []);
			setUOMMaster(Array.isArray(list) ? list : []);
		}).catch((err) => {
			console.error('Failed to load UOM master list', err);
			setUOMMaster([]);
		});
	};

	// NOTE: this was previously defined but never called anywhere, which meant
	// the UOM dropdown in Add Invoice was always empty. Fetch it once we have
	// the customer/auth context.
	useEffect(() => {
		if (!atoken || !customerid) return;
		pullUOMMasterList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [atoken, customerid]);

	// Handle SES submission from dialog — POST /api/sesheader/Add.
	// sesData.sesItem already contains only the selected line items (built in SESDialog).
	const handleSubmitSes = async (sesData) => {
		try {
			const cid = poCustomerId ?? customerid;
			const payload = {
				sesNumber: sesData.sesNumber,
				poId: parseInt(pageSlug),
				customerId: cid,
				vendorId: poSpecificDetails?.vendorId ?? 0,
				sesDate: sesData.sesDate ? new Date(sesData.sesDate).toISOString() : new Date().toISOString(),
				servicePeriodFrom: sesData.servicePeriodFrom ? new Date(sesData.servicePeriodFrom).toISOString() : null,
				servicePeriodTo: sesData.servicePeriodTo ? new Date(sesData.servicePeriodTo).toISOString() : null,
				approvalStatus: 'Pending',
				createdById: userDetail?.id ?? 0,
				createdByName: userDetail?.name ?? '',
				// Only the selected line items are sent in sesItem.
				sesItem: (sesData.sesItem ?? []).map(it => ({
					poItemId: it.poItemId,
					customerId: cid,
					serviceQty: it.serviceQty,
					acceptedQty: it.acceptedQty,
					serviceAmount: it.serviceAmount,
					lineItemNo: it.lineItemNo,
					itemCode: it.itemCode,
					// Each service line carries its own period + delivery date (set per line item/line in SESDialog).
					serviceStartDate: it.serviceStartDate ? new Date(it.serviceStartDate).toISOString() : null,
					serviceEndDate: it.serviceEndDate ? new Date(it.serviceEndDate).toISOString() : null,
					deliveryDate: it.deliveryDate ? new Date(it.deliveryDate).toISOString() : null,
				})),
			};

			await apiClient.postres(`/api/sesheader/Add`, payload, atoken);

			// Refresh SES list (same endpoint/pattern as the existing SES fetch) and PO data.
			try {
				const res = await apiClient.get(`/api/sesheader/Find?poId=${pageSlug}&customerId=${customerid}`, atoken);
				if (Array.isArray(res)) setPoSesList(res);
			} catch (e) {
				console.error('Failed to refresh SES list', e);
			}
			await fetchPOHeaderList_Slug(pageSlug, selectedVersion);
			await loadPOVersionData(pageSlug, selectedVersion);
			// Refresh PO line items (quantities/grnSesStatus/eligibility) using the
			// existing PO Creation Detail API so Add GRN/Add SES buttons and
			// remaining-quantity displays reflect this SES immediately.
			await fetchPOCreationItems();

			toast.success('SES created successfully for the selected items');

			// If this SES was created via the unified Add flow, the flow is now
			// complete — exit selection mode entirely (the dialog's own onClose,
			// fired right after this, will see addFlowMode already cleared and
			// simply close instead of returning to the selection step).
			if (addFlowMode === 'SES') {
				setAddFlowMode(null);
				setAddFlowStep('select');
				setAddFlowSelectedItems([]);
			}
		} catch (error) {
			toast.error('Failed to create SES');
			throw error;
		}
	};

	// Handle closing Add ASN Dialog (mirrors handleCloseAddGrnDialog/handleCloseAddSesDialog)
	const handleCloseAddAsnDialog = () => {
		setAddAsnDialogOpen(false);
		setSelectedAsnItems([]);
		setAsnDialogMode('add');
		setAsnPreviewData(null);
		if (addFlowMode === 'ASN') {
			setAddFlowStep('select');
			setValue(1);
		}
	};

	// Handle ASN submission from dialog — POST /api/shipment/Add.
	// asnData.shipmentDetails already contains only the selected line items (built in AddASNDialog).
	const handleSubmitAsn = async (asnData) => {
		// if (!isShipmentAllowed()) {
		// 	toast.warning('Shipment is not allowed until the PO reaches the Confirmed stage.');
		// 	throw new Error('Shipment not allowed');
		// }
		try {
			const cid = poCustomerId ?? customerid;
			const payload = {
				poId: parseInt(pageSlug),
				vendorId: poSpecificDetails?.vendorId ?? 0,
				customerId: cid,

				shipSlipId: asnData.shipSlipId,
				shipNoticeType: asnData.shipNoticeType ?? '',
				carrierName: asnData.carrierName ?? '',
				lrShipBillNumber: asnData.lrShipBillNumber ?? '',
				ewayBillNumber: asnData.ewayBillNumber ?? '',
				shipMethod: asnData.shipMethod ?? '',
				serviceLevel: asnData.serviceLevel ?? '',
				remarks: asnData.remarks ?? '',

				status: 'Shipped',
				shipTypeStatus: 'ASN',

				// ADD THIS
				stages: {
					eventType: "INV",
					currentStage: "Invoice Raised",
					nextStage: "Under Approval",
					orgId: 0,
					orgGroupId: 0
				},

				shippingDate: asnData.shippingDate
					? new Date(asnData.shippingDate).toISOString()
					: new Date().toISOString(),

				reqDeliveryDate: asnData.deliveryDate
					? new Date(asnData.deliveryDate).toISOString()
					: null,

				deliveryDate: asnData.deliveryDate
					? new Date(asnData.deliveryDate).toISOString()
					: null,

				quantity: (asnData.shipmentDetails ?? [])
					.reduce((sum, d) => sum + Number(d.shipQty ?? 0), 0),

				createdById: userDetail?.id ?? 0,
				createdByName: userDetail?.name ?? '',

				shipmentDetails: (asnData.shipmentDetails ?? []).map(d => ({
					customerId: cid,
					poId: parseInt(pageSlug),
					poCreationDetailId: d.poCreationDetailId,
					itemNo: d.itemNo,
					shipQty: d.shipQty,
					batchId: d.batchId,
					deliveryDate: d.deliveryDate
						? new Date(d.deliveryDate).toISOString()
						: null,
					createdById: userDetail?.id ?? 0,
				})),
			};

			await apiClient.postres(`/api/shipment/Add`, payload, atoken);

			// Refresh shipment data immediately so ASN tab and line-item expansion reflect the new record.
			await refreshShipmentData();
			await fetchPOHeaderList_Slug(pageSlug, selectedVersion);
			await loadPOVersionData(pageSlug, selectedVersion);

			toast.success('ASN created successfully for the selected items');

			// If this ASN was created via the unified Add flow, the flow is now
			// complete — exit selection mode entirely (the dialog's own onClose,
			// fired right after this, will see addFlowMode already cleared and
			// simply close instead of returning to the selection step).
			if (addFlowMode === 'ASN') {
				setAddFlowMode(null);
				setAddFlowStep('select');
				setAddFlowSelectedItems([]);
			}
		} catch (error) {
			toast.error('Failed to create ASN');
			throw error;
		}
	};

	// Handle closing Add Invoice Dialog (mirrors handleCloseAddGrnDialog/handleCloseAddSesDialog)
	const handleCloseAddInvoiceDialog = () => {
		setAddInvoiceDialogOpen(false);
		setSelectedInvoiceItems([]);
		setInvoiceDialogMode('add');
		setInvoicePreviewData(null);
		setInvApprovalPanelShow(false);
		setInvApprovalPanelView('approvers');
		if (addFlowMode === 'INVOICE') {
			setAddFlowStep('select');
			setValue(1);
		}
	};

	// Build stages object for /api/poinvoice/Add from invoice stage list.
	const buildInvoiceStagesPayload = () => {
		const list = Array.isArray(allInvStageList) ? allInvStageList : (Array.isArray(invStagelist) ? invStagelist : []);
		const stageName = currentInvStage || 'Under Approval';
		const currentIdx = list.findIndex(s => s.currentStage === stageName || s.stageName === stageName);
		const current = currentIdx >= 0 ? list[currentIdx] : (list.find(s => s.isActive) ?? list[0]);
		const next = currentIdx >= 0 && currentIdx < list.length - 1 ? list[currentIdx + 1] : null;

		if (current?.eventType !== null && (current?.currentStage || current?.stageName)) {
			return {
				eventType: current.eventType ?? 'INV',
				currentStage: current.currentStage ?? current.stageName ?? stageName,
				nextStage: current.nextStage ?? next?.currentStage ?? next?.stageName ?? '',
				orgId: Number(current.orgId ?? 0),
				orgGroupId: Number(current.orgGroupId ?? 0),
			};
		}

		const stageInfo = getStageInfo(stageName, list);
		return {
			eventType: 'INV',
			currentStage: stageInfo?.currentStage ?? stageName,
			nextStage: stageInfo?.nextStage ?? '',
			orgId: 0,
			orgGroupId: 0,
		};
	};

	// Handle Invoice submission from dialog — POST /api/poinvoice/Add.
	// Backend expects a plain JSON array: [{ invoiceNo, poId, ... }]
	const handleSubmitInvoice = async (invoicePayload) => {
		try {
			const rawItem = Array.isArray(invoicePayload) ? invoicePayload[0] : invoicePayload;
			if (!rawItem) {
				throw new Error('Invoice data is missing');
			}

			if (!(rawItem.filePath || '').trim() || !(rawItem.fileName || '').trim()) {
				toast.error('Please upload the invoice attachment');
				return;
			}

			const stages = buildInvoiceStagesPayload();

			const payload = [{
				invoiceNo: rawItem.invoiceNo ?? '',
				poId: Number(rawItem.poId) || parseInt(pageSlug) || 0,
				poCreationId: Number(rawItem.poCreationId) || 0,
				shipHId: Number(rawItem.shipHId) || 0,
				filePath: rawItem.filePath || '',
				fileName: rawItem.fileName || '',
				invoiceDate: rawItem.invoiceDate
					? new Date(rawItem.invoiceDate).toISOString()
					: new Date().toISOString(),
				totaLInvoiceAmount: Number(rawItem.totaLInvoiceAmount ?? 0),
				supplierTaxId: rawItem.supplierTaxId ?? '',
				serviceDesc: rawItem.serviceDesc ?? '',
				stages: rawItem.stages ?? stages,
				customerId: Number(rawItem.customerId) || poCustomerId || customerid || 0,

				headerCondition: (rawItem.headerCondition ?? []).map(c => ({
					conditionType: c.conditionType || '',
					conditionValue: Number(c.conditionValue || 0),
					currency: c.currency || 'INR',
					calculationType: c.calculationType || 'Absolute',
					conditionRate: Number(c.conditionRate || 0),
				})),

				invoiceItem: (rawItem.invoiceItem ?? []).map(it => ({
					invoiceNo: rawItem.invoiceNo ?? '',
					pOid: Number(it.pOid) || parseInt(pageSlug) || 0,
					poCreationId: Number(it.poCreationId) || 0,
					shipHId: Number(it.shipHId) || 0,
					invoiceQuantity: Number(it.invoiceQuantity || 0),
					itemAmount: Number(it.itemAmount || 0),
					itemCode: it.itemCode || '',
					itemDesc: it.itemDesc || '',
					lineItemNo: it.lineItemNo || '',
					uom: it.uom || '',

					itemCondition: (it.itemCondition ?? []).map(c => ({
						conditionType: c.conditionType || '',
						conditionValue: Number(c.conditionValue || 0),
						currency: c.currency || 'INR',
						calculationType: c.calculationType || 'Absolute',
						conditionRate: Number(c.conditionRate || 0),
					})),
				})),
			}];


			const response = await apiClient.postres(`/api/poinvoice/Add`, payload, atoken);

			try {
				const cid = poCustomerId ?? customerid;
				const res = await apiClient.get(`/api/poinvoice/Find?poId=${pageSlug}&customerId=${cid}`, atoken);
				if (Array.isArray(res)) setPoInvoiceList(res);
			} catch (e) {
				console.error('Failed to refresh Invoice list', e);
			}

			await fetchPOHeaderList_Slug(pageSlug, selectedVersion);
			await loadPOVersionData(pageSlug, selectedVersion);

			toast.success('Invoice created successfully for the selected items');

			if (addFlowMode === 'INVOICE') {
				setAddFlowMode(null);
				setAddFlowStep('select');
				setAddFlowSelectedItems([]);
			}

			return response?.data ?? (Array.isArray(response) ? response[0] : response);

		} catch (error) {

			toast.error(getApiErrorMessage(error), {
				toastId: 'invoice_create_error',
			});

		}
	};

	// Preview an ASN — opens the same Add ASN dialog in read-only preview mode.
	const handlePreviewAsn = (asnRow) => {
		const detailIds = (asnRow?.shipmentDetails ?? []).map(d => d.poCreationDetailId ?? d.poItemId);
		const matchedItems = allPOItems.filter(it =>
			detailIds.some(id => String(id) === String(it.id))
		);
		setAsnDialogMode('preview');
		setAsnPreviewData(asnRow);
		setSelectedAsnItems(matchedItems.length > 0 ? matchedItems : allPOItems.filter(item => item.itemType?.toLowerCase() !== 'service'));
		setAddAsnDialogOpen(true);
	};
	const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

	// Preview an Invoice — opens the same Add Invoice dialog in read-only preview mode.
	// The dialog itself matches header.invoiceDetails[].creationDetailId against each
	// PO line item's `id` (the primary/correct key), so we simply hand it the full PO
	// item pool here rather than pre-guessing a single matched item.
	const handlePreviewInvoice = async (invoiceRow) => {
		try {
			const cid = poCustomerId ?? customerid;
			const res = await apiClient.get(`/api/poinvoice/Find?poId=${pageSlug}&customerId=${cid}`, atoken);
			const list = Array.isArray(res) ? res : [];
			const header = list.find(r => r.id === (invoiceRow?._header?.id ?? invoiceRow?.id)) ?? invoiceRow?._header ?? invoiceRow;
			const details = Array.isArray(header?.invoiceDetails) && header.invoiceDetails.length > 0
				? header.invoiceDetails
				: [invoiceRow].filter(Boolean);
			const detail = (invoiceRow?.creationDetailId !== null
				? details.find(d => String(d.creationDetailId) === String(invoiceRow.creationDetailId))
				: null) ?? details[0] ?? invoiceRow;

			// Preview conditions must come from FindInvoiceCondition, not from the Invoice Find API response.
			let conditions = [];
			try {
				const invoiceHid = header?.id ?? invoiceRow?._header?.id ?? invoiceRow?.id;
				const condRes = await apiClient.get(
					`/api/poinvoice/FindInvoiceCondition?poid=${pageSlug}&invoiceHid=${invoiceHid}`,
					atoken
				);
				conditions = Array.isArray(condRes) ? condRes : (condRes ? [condRes] : []);
			} catch (condError) {
				console.error('Failed to fetch invoice conditions', condError);
				conditions = [];
			}

			setInvoiceDialogMode('preview');
			setInvoicePreviewData({ header, detail, conditions });
			setSelectedInvoiceItems(allPOItems);
			if (header?.stage) setCurrentInvStage(header.stage);
			if (header?.id) setSelectedInvoiceId(header.id);
			setAddInvoiceDialogOpen(true);
		} catch (error) {
			console.error('Failed to fetch invoice details', error);
			const fallbackHeader = invoiceRow?._header ?? invoiceRow;
			setInvoiceDialogMode('preview');
			setInvoicePreviewData({ header: fallbackHeader, detail: invoiceRow, conditions: [] });
			setSelectedInvoiceItems(allPOItems);
			if (fallbackHeader?.stage) setCurrentInvStage(fallbackHeader.stage);
			if (fallbackHeader?.id) setSelectedInvoiceId(fallbackHeader.id);
			setAddInvoiceDialogOpen(true);
		}
	};

	// Handle Download GRN Report for specific shipment
	const handleDownloadGrnReport = async () => {
		handleGrnMenuClose();

		if (!pageSlug) {
			toast.error("No PO selected for GRN download");
			return;
		}

		try {
			setLoadingGrnReport(true);

			const response = await apiClient.api.get(
				`/api/grnheader/downloadGRN/${pageSlug}`,
				{
					headers: {
						Authorization: `Bearer ${atoken}`,
					},
					responseType: "blob",
				}
			);

			if (response?.data) {
				const blob = new Blob([response.data], {
					type: "application/pdf",
				});

				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;

				const timestamp = new Date()
					.toISOString()
					.replace(/[-:]/g, "")
					.replace("T", "")
					.split(".")[0];

				link.download = `GRN_PO${pageSlug}_${timestamp}.pdf`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
				toast.success("GRN report downloaded successfully");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to download GRN report");
		} finally {
			setLoadingGrnReport(false);
		}
	};

	const handleDownloadIndividualGrnReport = async (grnRow) => {
		const grnId = grnRow?.id ?? grnRow?.grnId ?? grnRow?.grnHId;

		if (!pageSlug) {
			toast.error("No PO selected for GRN download");
			return;
		}

		if (!grnId) {
			toast.error("GRN ID not found");
			return;
		}

		try {
			setDownloadingGrnId(grnId);

			const response = await apiClient.api.get(
				`/api/grnheader/downloadGRN/${pageSlug}?grnid=${grnId}`,
				{
					headers: {
						Authorization: `Bearer ${atoken}`,
					},
					responseType: "blob",
				}
			);

			if (response?.data) {
				const blob = new Blob([response.data], {
					type: "application/pdf",
				});

				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;

				const grnLabel = String(grnRow?.grnNumber ?? grnId).replace(/[/\\?%*:|"<>]/g, "_");
				link.download = `GRN_${grnLabel}.pdf`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
				toast.success("GRN report downloaded successfully");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to download GRN report");
		} finally {
			setDownloadingGrnId(null);
		}
	};

	const handleDownloadSesReport = async (poId) => {

		if (!poId) {
			toast.error("No PO selected for SES download");
			return;
		}

		try {
			setLoadingSesReport(true);
			const response = await apiClient.api.get(`/api/sesheader/downloadSES/${poId}`,
				{
					headers: { Authorization: `Bearer ${atoken}`, },
					responseType: "blob",
				}
			);

			if (response?.data) {
				const blob = new Blob([response.data], {
					type: "application/pdf",
				});

				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;

				const timestamp = new Date()
					.toISOString()
					.replace(/[-:]/g, "")
					.replace("T", "")
					.split(".")[0];

				link.download = `SES_PO${poId}_${timestamp}.pdf`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
				toast.success("SES report downloaded successfully");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to download SES report");
		} finally {
			setLoadingSesReport(false);
		}
	};

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
			});
	}, [customerid, eventType]);

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
				const sel = paymentTermsOptions.find(p => (p.id ?? p.paymentTermsId ?? p.paymentTermId) === selectedPaymentTermId);
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
					fetchPOHeaderList_Slug(pageSlug, selectedVersion);
					await loadPOVersionData(pageSlug, selectedVersion);
					// Mark Tab 0 as complete
					setIsTab0Complete(true);
					// Navigate to next tab
					setValue(1);
				}
			} catch (err) {
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
					// FIX: loadPOVersionData() only reloads the PO header/conditions —
					// it does NOT re-fetch allPOItems (that list is loaded once per
					// version via a separate, cached effect). If we clear
					// deliveryUpdates without also updating allPOItems, the saved
					// dates disappear from local state even though they were
					// persisted successfully, causing the Preview-tab validation to
					// incorrectly report the delivery date as missing.
					// Merge the just-saved dates into allPOItems BEFORE clearing the
					// staged edits, so the item list stays in sync with the backend.
					setAllPOItems(prevItems => prevItems.map(it => (
						deliveryUpdates[it.id] !== null
							? { ...it, poDeliveryDate: deliveryUpdates[it.id] }
							: it
					)));
					await loadPOVersionData(pageSlug, selectedVersion);
					setDeliveryUpdates({}); // safe to clear now — allPOItems already reflects the saved dates
					// Navigate to Preview tab (skip Shipped History in Draft)
					setValue(10);
				}
			} catch (err) {
				toast.error('Failed to update delivery dates.');
			} finally {
				setSavingPaymentTerm(false);
			}
		} else if (value === 10) {
			// 🔥 CRITICAL FIX: Use ref instead of state to get latest approvers
			const latestApprovers = eventAppListRef.current?.length > 0 ? eventAppListRef.current : eventAppList;

			// Check if approval workflow is configured for any stage
			const hasWorkflowConfigured = stagelist?.some(stage => stage.isActive && stage.wfname);

			// CRITICAL CHECK: Only require approvers if workflow is configured
			if (hasWorkflowConfigured && (!latestApprovers || latestApprovers.length === 0)) {

				toast.error('Please add approvers before submitting. Approval workflow is configured but no approvers are assigned.');
				setSavingPaymentTerm(false);
				return;
			}

			// If no workflow configured, allow submission without approvers
			if (!hasWorkflowConfigured) {
				// proceed without approvers
			}

			const missing = allPOItems.filter(it => {
				const dt = deliveryUpdates[it.id] ?? it.poDeliveryDate ?? it.PoDeliveryDate ?? it.deliveryDate;
				return !dt;
			});
			if (missing.length > 0) {
				toast.error('Please fill delivery date.');
				// Optionally, open delivery date dialog for first missing item
				const firstMissing = missing[0];
				setDeliveryDialogRow(firstMissing);
				setDeliveryDialogDate(new Date());
				setDeliveryDialogOpen(true);
				setSavingPaymentTerm(false);
				return;
			}
			// Preview tab - Submit PO
			setSavingPaymentTerm(true);
			try {
				// Step 1: Generate PDF (to be enabled when PO is sent to supplier)
				const stageInfo = getStageInfo(currentStage, stagelist);
				// Get next stage
				const nextEventStage = stageInfo?.nextStage ?? currentStage;
				const pdfSuccess = await generatePdf();
				if (!pdfSuccess) {
					setSavingPaymentTerm(false);
					return;
				}
				// Submit PO
				const d = poSpecificDetails ?? {};

				// 🔥 CRITICAL FIX: Use latestApprovers (from ref) instead of state
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
					//stage: "PO Sent to Supplier",
					stage: nextEventStage,
					rejectionReason: d.rejectionReason ?? "",
					rejctionDate: d.rejctionDate ?? new Date().toISOString(),
					reqDeliveryDate: d.reqDeliveryDate ?? new Date().toISOString(),
					pO_Date: d.pO_Date ?? new Date().toISOString(),
					poNumber: d.poNumber ?? "",
					customerId: customerid ?? d.customerId ?? 0,
					createdById: d.createdById ?? userDetail?.id ?? 0,
					createdByName: d.createdByName ?? userDetail?.name ?? "",
					approvers: latestApprovers || [],
					eventApprovalList: latestApprovers || [], // Alternative field name in case backend expects this
				};

				const res = await apiClient.postres(`/api/poconfirm/POSubmit`, payload, atoken);

				if (res) {
					toast.success('PO submitted successfully.');
					// Reload the page after successful submission
					setTimeout(() => {
						window.location.reload();
					}, 500);
				} else {
					toast.error('Failed to submit PO - No response from server.');
				}
			} catch (err) {
				toast.error('Failed to submit PO.');
			} finally {
				setSavingPaymentTerm(false);
			}
		}
	};

	// Versioning state for GetPOVersion
	const [latestVersion, setLatestVersion] = useState(1);
	const [selectedVersion, setSelectedVersion] = useState(1);
	const [loadingVersion, setLoadingVersion] = useState(false);
	const [versionError, setVersionError] = useState(null);
	const versionControllerRef = useRef(null);

	// track which version's PO items we've loaded to avoid duplicate calls
	const poItemsLoadedVersionRef = useRef(null);
	// guard to prevent concurrent/duplicate PO items fetches
	const poItemsLoadingRef = useRef(false);
	const prevItemCountRef = useRef(0);
	const [loadingPoItems, setLoadingPoItems] = useState(false);

	// Fetch PO line items for the Line Items tab (reused on tab open and when counts go stale).
	const fetchPOCreationItems = useCallback(async () => {
		if (!pageSlug || poItemsLoadingRef.current) return;
		poItemsLoadingRef.current = true;
		setLoadingPoItems(true);
		try {
			const items = await GetPOCreationDetails(
				pageSlug,
				selectedVersion,
				atoken,
				{ signal: versionControllerRef.current?.signal }
			);
			if (items && items.__cancelled) return;
			if (Array.isArray(items)) {
				const mapped = items.map(i => ({ ...i, itemNo: i.itemNo ?? i.lineItemNo ?? i.itemCode }));
				setAllPOItems(mapped);
				setSelectedItems(mapped);
				poItemsLoadedVersionRef.current = Number(selectedVersion);
			} else {
				setAllPOItems([]);
				setSelectedItems([]);
				poItemsLoadedVersionRef.current = Number(selectedVersion);
			}
		} catch (err) {
			console.error('Error fetching PO creation details', err);
		} finally {
			poItemsLoadingRef.current = false;
			setLoadingPoItems(false);
		}
	}, [pageSlug, selectedVersion, atoken]);

	const loadPOVersionData = useCallback(async (poId, version) => {

		if (!poId) return;

		const ver = Number(version) || 1;

		try {
			if (versionControllerRef.current) {
				versionControllerRef.current.abort();
			}
		} catch (e) {
			console.error("Abort Error:", e);
		}

		versionControllerRef.current = new AbortController();
		setLoadingVersion(true);
		setVersionError(null);

		try {
			const res = await GetPOVersion(
				poId, ver, atoken,
				{ signal: versionControllerRef.current.signal }
			);

			if (res && res.__cancelled) return;

			if (!res) {
				// No response case
				setPoSpecificDetails(null);
				setAllPOItems([]);
				setSelectedItems([]);
				setEventId(null);
				setCurrentStage('');
				setVersionError('PO data not available.');
				setDashboardCounts({
					itemCount: 0,
					asnCount: 0,
					grnCount: 0,
					sesCount: 0,
					paymentCount: 0,
					invoiceCount: 0
				});

			} else {
				const poData = res?.poData ?? {};

				// Dashboard Counts
				setDashboardCounts({
					itemCount: res?.dashboardCounts?.itemCount ?? 0,
					asnCount: res?.dashboardCounts?.asnCount ?? 0,
					grnCount: res?.dashboardCounts?.grnCount ?? 0,
					sesCount: res?.dashboardCounts?.sesCount ?? 0,
					paymentCount: res?.dashboardCounts?.paymentCount ?? 0,
					invoiceCount: res?.dashboardCounts?.invoiceCount ?? 0
				});

				// Before GetPOCondition API
				const conditions = await GetPOCondition(
					poId,
					ver,
					atoken,
					{ signal: versionControllerRef.current.signal }
				);

				// After GetPOCondition response
				if (conditions && conditions.__cancelled) return;

				const mapped = {
					...poData,
					poConditions: (conditions ?? []).filter(
						c => c.isHeaderCondition === true
					),
					poItemConditions: (conditions ?? []).filter(
						c => c.isHeaderCondition === false
					),
				};
				// Before state updates
				setPoSpecificDetails(mapped);

				setEventId(poData?.id ?? poId);
				setCurrentStage(poData?.stage ?? '');
				if (poData?.customerId !== null) {
					setPoCustomerId(poData.customerId);
				}

				if (poData?.version) {
					setLatestVersion(Number(poData.version));
				}
			}
		} catch (err) {
			// Error handling
			if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') { return; }
			setVersionError(err?.message || 'Failed to load PO data.');
		} finally {
			// Finally block
			setLoadingVersion(false);
		}
	}, [atoken]);

	// clear loaded-items marker when version changes so tab will refetch
	useEffect(() => {
		poItemsLoadedVersionRef.current = null;
		paymentLoadedRef.current = false;
	}, [selectedVersion]);

	// Auto-refresh line items when dashboard count changes but the cached list is empty/stale.
	useEffect(() => {
		// if (value !== 1 || !pageSlug) return;
		if (!pageSlug) return;
		const count = dashboardCounts.itemCount ?? 0;
		const loadedCount = allPOItems.length;
		const versionMismatch = poItemsLoadedVersionRef.current !== Number(selectedVersion);
		const countBouncedFromZero = prevItemCountRef.current === 0 && count > 0;
		prevItemCountRef.current = count;
		const needsRefresh = versionMismatch || (count > 0 && loadedCount === 0) || countBouncedFromZero;
		if (needsRefresh && !poItemsLoadingRef.current) {
			poItemsLoadedVersionRef.current = null;
			fetchPOCreationItems();
		}
	}, [value, pageSlug, selectedVersion, dashboardCounts.itemCount, allPOItems.length, fetchPOCreationItems]);

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
			// handle error silently
		} finally {
			setPaymentTermsLoading(false);
		}
	}, [customerid, atoken]);

	useEffect(() => {
		fetchPaymentTerms();
	}, [fetchPaymentTerms]);

	useEffect(() => {
		getCurrency({ isActive: true }, atoken).then((res) => {
			if (res) setCurrencyOptions(res);
		});
	}, [atoken]);

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
			setIsTab0Complete(true);
		} else if (selectedPaymentTermId || poSpecificDetails?.termsOfPayment) {
			setIsTab0Complete(true);
		} else {
			setIsTab0Complete(false);
		}
	}, [currentStage, selectedPaymentTermId, poSpecificDetails?.termsOfPayment]);
	const queryParams = new URLSearchParams(location.search);
	const [actionType, setActionType] = useState("");
	const [activityId, setActivityId] = useState(
		queryParams.get("ActivityId")?.trim()
	);
	useEffect(() => {
		const params = new URLSearchParams(searchParams);
		const ActivityId = params.get("ActivityId");
		const actionType = params.get("ActionType");
		setActivityId(ActivityId ?? 0);
		setActionType(actionType ?? "");
	}, [searchParams]);

	// If header metadata contains a version and no version was provided via navigation state,
	// use it as the latest version and load that version.
	useEffect(() => {
		if (location?.state?.version) return; // already initialized from state
		const headerVersion = poHeaderInfo?.version ?? poHeaderInfo?.Version ?? null;
		const v = Number(headerVersion) > 0 ? Number(headerVersion) : null;
		if (v && v !== selectedVersion) {
			setLatestVersion(v);
			setSelectedVersion(v);
			loadPOVersionData(pageSlug, v);
		}
	}, [poHeaderInfo]);


	const [actionTypeFromURL, setActionTypeFromURL] = useState("");
	useEffect(() => {
		const getIdFromSearchParams = () => {

			const params = new URLSearchParams(searchParams);
			return params?.get("ActionType");
		};

		const newIdFromURL = getIdFromSearchParams();
		setActionTypeFromURL(newIdFromURL);

		if (actionTypeFromURL === "approval") {
			setValue(2);
		}
	}, [searchParams]);

	useEffect(() => {

		if (actionTypeFromURL === "approval") {
			setValue(2);
		}
		// Determine initial version: prefer value from POSearch (passed via location.state),
		// fall back to 1 when undefined or invalid.
		const initialVersionRaw = location?.state?.version ?? 1;
		const initialVersion = Number(initialVersionRaw) > 0 ? Number(initialVersionRaw) : 1;
		setLatestVersion(initialVersion);
		setSelectedVersion(initialVersion);
		// Fetch header metadata (slug) - do not use it to populate details
		fetchPOHeaderList_Slug(pageSlug, initialVersion);
		// Load PO details for the selected version
		loadPOVersionData(pageSlug, initialVersion);
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
			const res = await apiClient.getres(`/api/rolemanagement/GetUserRoleRights?${queryParams}`, atoken);
			if (res) {
				const permManager = new PermissionManager(res?.data);
				setPoPermissionManager(permManager);
			}
		} catch (err) {
			// handle error silently
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
			const res = await apiClient.getres(`/api/rolemanagement/GetUserRoleRights?${queryParams}`, atoken);
			if (res) {
				const permManager = new PermissionManager(res?.data);
				setInvPermissionManager(permManager);
			}
		} catch (err) {
			// handle error silently
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

	useEffect(() => {
		StageFindAll(
			{ EventType: "INV", CustomerId: customerid, EventId: eventId },
			atoken
		).then((res) => {

			setAllInvStageList(res);
			const result = res?.filter((item) => item.stageSeq > 0)
			setInvStageList(result);
			const filteredGRN = res?.filter((rowData) => {
				return rowData.isActive === true && rowData.stageName === "GRN";
			});
			setGRNIsActive(filteredGRN);
		});

		FetchPOAttachments(initialValues_fetchPOAttachments);
	}, []);

	// Refresh INV stage graph for the specific invoice when Invoice Preview opens
	// (EventStageFind?EventType=INV&CustomerId=...&EventId=<invoiceId>)
	useEffect(() => {
		if (!addInvoiceDialogOpen || invoiceDialogMode !== 'preview' || !atoken || !customerid) return;
		const invoiceEventId =
			invoicePreviewData?.header?.id ??
			invoicePreviewData?.header?.invoiceHId ??
			invoicePreviewData?.header?.invoiceId ??
			selectedInvoiceId;
		if (!invoiceEventId) return;

		StageFindAll(
			{ EventType: "INV", CustomerId: customerid, EventId: invoiceEventId },
			atoken
		).then((res) => {
			if (!res) return;
			setAllInvStageList(res);
			const result = res?.filter((item) => item.stageSeq > 0);
			setInvStageList(result);
		}).catch(() => { /* keep existing inv stage list on failure */ });
	}, [addInvoiceDialogOpen, invoiceDialogMode, invoicePreviewData?.header?.id, selectedInvoiceId, customerid, atoken]);

	const [stagearray, setStagearray] = useState([`Draft`, `PO Sent to Supplier`]);
	const [requestCell, setRequestCell] = useState({
		EventId: pageSlug,
		EventType: "PO",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
		//IsAscending:"True"
	});

	const [eventAppList, setEventAppList] = useState([]);
	const [wfupdate, setwfUpdate] = useState([false]);

	// 🔥 CRITICAL FIX: Use ref to store latest approvers to avoid stale closure
	const eventAppListRef = useRef([]);

	// Debug: Track eventAppList changes
	useEffect(() => {
		// 🔥 CRITICAL: Update ref whenever state changes to avoid stale closures
		eventAppListRef.current = eventAppList;
	}, [eventAppList]);

	const handleEventAppList = useCallback((arr) => {
		// 🔥 CRITICAL: Update both state AND ref immediately
		eventAppListRef.current = arr;
		setEventAppList(arr);
	}, [eventAppList]); // ⚠️ Including eventAppList in deps to track previous state

	// Fetch approvers on mount to ensure they're loaded even if drawer isn't opened
	useEffect(() => {
		const fetchApproversOnMount = async () => {
			if (requestCell?.EventId > 0 && stagelist?.length > 0 && atoken) {
				try {
					const dataRequest = { ...requestCell, Version: 1 };
					const res = await getEventApproversFind(dataRequest, atoken);

					if (res && res.length > 0) {
						// Update both ref and state
						eventAppListRef.current = res;
						setEventAppList(res);
					}
				} catch (error) {
					// handle error silently
				}
			}
		};

		fetchApproversOnMount();
	}, [requestCell?.EventId, stagelist, atoken]);

	const [shipConfirmDetails, setShipConfirmDetails] = useState(null);
	// Memoize the requestCell for INV to prevent unnecessary re-renders
	// Use the selected invoice ID instead of pageSlug
	const requestCellINV = useMemo(() => ({
		EventId: shipConfirmDetails?.invoiceId || selectedInvoiceId || 0,
		EventType: "INV",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid
	}), [shipConfirmDetails, selectedInvoiceId, customerid]);

	const [poOrderItems, setPOOrderItems] = useState([]);
	//checkbox to handle selection of items
	const [selectedItems, setSelectedItems] = useState([]);
	const [isAllItemChecked, setIsAllItemChecked] = useState(true);

	useEffect(() => {
		setIsAllItemChecked(allPOItems.length > 0 && selectedItems.length === allPOItems.length);
	}, [allPOItems, selectedItems]);

	// Opens the Add ASN Dialog (POST /api/shipment/Add) for the given (possibly
	// multiple) selected line items. Mirrors handleOpenAddGrnDialog/handleOpenAddSesDialog —
	// only Material items with open (unshipped) quantity are eligible.
	const handleOpenAddAsnDrawer = (itemsToOpen = selectedItems) => {
		// if (!isShipmentAllowed()) {
		// 	toast.warning('Shipment is not allowed until the PO reaches the Confirmed stage.');
		// 	return;
		// }
		const normalizedItems = _getEligibleItemsForAddMode('ASN', Array.isArray(itemsToOpen) ? itemsToOpen : [itemsToOpen]);

		if (normalizedItems.length === 0) {
			toast.warning(NO_REMAINING_ITEM_MSG);
			return;
		}
		setAsnDialogMode('add');
		setAsnPreviewData(null);
		setSelectedAsnItems(normalizedItems);
		setAddAsnDialogOpen(true);
	};

	// Opens the Add Invoice Dialog (POST /api/poinvoice/Invoice) for only the
	// selected line items that still have uninvoiced quantity.
	const handleOpenAddInvoiceDrawer = (itemsToOpen = []) => {
		const itemsForSelection = Array.isArray(itemsToOpen) ? itemsToOpen : [itemsToOpen];
		const normalizedItems = _getEligibleItemsForAddMode('INVOICE', itemsForSelection);

		// Check if there are any rejected invoices/items
		const hasRejectedInvoices = (poInvoiceList || []).some(invoice => {
			if (isRejectedInvoiceRecord(invoice)) return true;
			const items = invoice?.invoiceDetails || invoice?.invoiceItem || invoice?.invoiceItems || [];
			return items.some(isRejectedInvoiceDetail);
		});

		const rejectedSelectedItems = itemsForSelection.filter(item =>
			(poInvoiceList || []).some(invoice => {
				const details = ['invoiceDetails', 'invoiceItem', 'invoiceItems']
					.flatMap(key => Array.isArray(invoice?.[key]) ? invoice[key] : []);
				return details.some(detail => matchesPOItem(detail, item) && isRejectedInvoiceDetail(detail));
			})
		);

		const itemsToOpenFinal = normalizedItems.length > 0 ? normalizedItems : rejectedSelectedItems;

		if (itemsToOpenFinal.length === 0 && !hasRejectedInvoices) {
			toast.warning(NO_REMAINING_ITEM_MSG);
			return;
		}
		setInvoiceDialogMode('add');
		setInvoicePreviewData(null);
		setSelectedInvoiceItems(itemsToOpenFinal);
		setAddInvoiceDialogOpen(true);
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
				setSelectAttachedFile(resultds);
				const filtered2 = resultds.filter((poattached) => {
					return poattached.fileType === "poconfirm";
				});

				setSelectPoAttachedFile(filtered2);
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

	//Formik Hooks
	const formik_PORejectOrder = useFormik_PORejectOrder(
		(values) => {
			PORejectOrder(values, stagelist, atoken).then(() => {
				setState({ ...state, openOrderReject: false });
			});
		},
		{ poId: pageSlug, }
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
			fetchPOHeaderList_Slug(pageSlug, selectedVersion);
			loadPOVersionData(pageSlug, selectedVersion);
			setState({ ...state, openOrderGRNSubmit: false });
		});
	}, {});

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
				eventSubject: poSpecificDetails?.headerText ?? "",
				RecordCreatorId: POShipInvoiceHeader?.createdById ?? 0,
			}

			const res = await apiClient.postres(`/api/ApprovalAction/ApprovalAction`, actionData, atoken);

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

	const formik_POShipOrdrItem = useFormik_POShipOrdrItem((values) => {
		POShipOrdrItem(values, stagelist, atoken);
	});

	const formik_POShipInvoiceHeader = useFormik_POShipInvoiceHeader((values) => {
		POShipInvoiceHeader(values, stagelist, atoken);
	});

	//page related  state and function

	// Fetch PO invoices using /api/poinvoice/Find?poId=...&customerId=... when Invoice tab is opened.
	// customerId is read from GetPOVersion (poCustomerId). Do NOT preload.
	useEffect(() => {
		const fetchInvoices = async () => {
			if (!pageSlug) return;
			try {
				const cid = poCustomerId ?? customerid;
				const res = await apiClient.get(
					`/api/poinvoice/Find?poId=${pageSlug}&customerId=${cid}`,
					atoken
				);
				// res may be an array of invoice headers
				if (Array.isArray(res)) setPoInvoiceList(res);
			} catch (e) {
				console.error('Failed to fetch PO invoices', e);
			}
		};

		if (value === 5) {
			fetchInvoices();
		}
	}, [value, pageSlug, atoken, poCustomerId]);

	const handleChange = (event, newValue) => {
		// In draft mode, prevent navigation away from Tab 0 until payment terms are saved
		const isDraft = String(currentStage ?? "").toLowerCase().includes("draft");
		if (isDraft && value === 0 && newValue !== 0 && !isTab0Complete) {
			toast.warning("Please Fill PO Details");
			return;
		}

		// Manually switching to a different tab while an Add ASN/GRN/SES/Invoice
		// selection flow is in progress cancels that flow (checkboxes are only
		// meaningful on the Line Items tab as part of the flow).
		if (addFlowMode && newValue !== 1) {
			setAddFlowMode(null);
			setAddFlowStep('select');
			setAddFlowSelectedItems([]);
		}

		if (newValue === 0) {
			// Tab 0 – PO Details: reload header + conditions only.
			// DO NOT call ASN / GRN / SES / Invoice / Payment / Document APIs here.
			loadPOVersionData(pageSlug, selectedVersion);

		} else if (newValue === 1) {
			// Tab 1 – Line Items: fetch /api/pocreationdetail/Find on first open (or version change).
			if (poItemsLoadedVersionRef.current !== Number(selectedVersion) && !poItemsLoadingRef.current) {
				poItemsLoadedVersionRef.current = null;
				fetchPOCreationItems();
			}
			// Item expansion (Invoice/ASN/GRN per item) is handled inside each item row — DO NOT move here.

		} else if (newValue === 2) {
			// Tab 2 – ASN: loaded by useEffect via /api/shipment/Find?POId=...

		} else if (newValue === 3) {
			// Tab 3 – GRN (Material PO) or SES (Service PO): handled by dedicated useEffects above.
			// GRN: /api/grnheader/Find?poId=...&customerId=... (useEffect on value===3)
			// SES: /api/sesheader/Find?poId=... (useEffect on value===4, but shown as tab 3 for service POs)

		} else if (newValue === 4) {
			// Tab 4 – SES (Service PO only): fetch /api/sesheader/Find?poId=...
			// (For material POs this tab is hidden; shown only when it's a service PO.)
			const fetchSes = async () => {
				if (!pageSlug) return;
				try {
					const res = await apiClient.get(`/api/sesheader/Find?poId=${pageSlug}&customerId=${customerid}`, atoken);
					if (Array.isArray(res)) setPoSesList(res);
				} catch (e) {
					console.error('Failed to fetch PO SES list', e);
				}
			};
			fetchSes();

		} else if (newValue === 5) {
			// Tab 5 – Invoice: handled by dedicated useEffect above (fires on value===5).
			// Uses /api/poinvoice/Find?poId=...&customerId=... where customerId comes from GetPOVersion.
			// Do NOT preload.

		} else if (newValue >= 6 && newValue <= 9) {
			// Tabs 6-9 – Payments, Documents, History, etc.
		} else if (newValue === 10) {
			// Preview tab
			loadPOVersionData(pageSlug, selectedVersion);
		}
		setValue(newValue);
	};

	const [tabShipsNotice, setTabShipsNotice] = React.useState(0);
	const handleTabShipsNotice = (event, newValue) => {
		setTabShipsNotice(newValue);
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

	const nstagevalue = getStageInfo(currentInvStage, allInvStageList);

	const toggleDrawer = (anchor, open, dataSelect) => (event) => {

		if (
			event?.type === "keydown" &&
			(event?.key === "Tab" || event?.key === "Shift")
		) {
			return;
		}
		if (!open) {
			SetRef_ItemId(0);
		}
		setState({ ...state, [anchor]: open });
		if (anchor === "openCreateSheet") {
			setShipConfirmDetails(dataSelect);
		};

		if (anchor === "openInvoiceApproved") {
			if (nstagevalue?.nextStage === 'Under Approval') {
				setGrnSaveDisable(false);
				setapproveSaveDisable(false);
			}
		}

		if (anchor === "openOrderGRNSubmit") {
			if (nstagevalue?.currentStage === 'Shipped') {
				setGrnSaveDisable(false);
				setapproveSaveDisable(false);
			}
			else {
				setGrnSaveDisable(true);
				setapproveSaveDisable(false);
			}

			if (
				dataSelect &&
				dataSelect[0]?.grnNumber !== "" &&
				dataSelect[0]?.grnNumber !== null &&
				dataSelect[0]?.grnNumber !== undefined
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

	const [state, setState] = useState({
		openCreateSheet: false,
		openOrderConfirm: false,
		openOrderReject: false,
		openPaymentDetails: false,
	});
	const [selectedInvoiceRows, setSelectedInvoiceRows] = React.useState([]);
	const [paymentDetails, setPaymentDetails] = useState(null);
	const [loadingPayment, setLoadingPayment] = useState(false);

	// Add Payment drawer state
	const [savingPayment, setSavingPayment] = useState(false);
	const [paymentTargetItem, setPaymentTargetItem] = useState(null);
	const [paymentForm, setPaymentForm] = useState({
		invoiceId: '',
		paymentAmount: '',
		paymentDate: null,
		paymentMethod: '',
		paymentStatus: 'Pending',
		paymentCategory: '',
		utrNumber: '',
		bankReference: '',
		sapPaymentDoc: '',
		retentionAmount: '',
	});

	const handlePaymentFormChange = (field, value) => {
		setPaymentForm(prev => ({ ...prev, [field]: value }));
	};

	const resetPaymentForm = () => {
		setPaymentForm({
			invoiceId: '',
			paymentAmount: '',
			paymentDate: null,
			paymentMethod: '',
			paymentStatus: 'Pending',
			paymentCategory: '',
			utrNumber: '',
			bankReference: '',
			sapPaymentDoc: '',
			retentionAmount: '',
		});
		setPaymentTargetItem(null);
	};
	const [openRows, setOpenRows] = useState({});
	const [selectedItemIds, setSelectedItemIds] = useState(new Set());
	const [itemInputs, setItemInputs] = useState({});
	const [validationErrors, setValidationErrors] = useState({});
	const [disableGrnBtn, setDisableGrnBtn] = useState(false);
	const expandedRowRefs = useRef({});

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

	const handleToggleRow = (rowId) => {

		setOpenRows((prev) => {
			const isCurrentlyOpen = !!prev[rowId];
			const next = {};

			if (!isCurrentlyOpen) {
				// 👉 Close all other rows and clear their data
				allPOShipHeader.forEach(r => {
					if (prev[r.uniqueRowId]) {

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

				if (row?.shipmentDetails?.length) {
					const itemIds = row.shipmentDetails.map(item => item.id);
					setSelectedItemIds(prevSet => {
						const nextSet = new Set(prevSet);
						itemIds.forEach(id => nextSet.add(id));
						return nextSet;
					});
				}
			} else {
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
		grnNumber: Yup.string().nullable().optional(),
		grnAmount: Yup.number()
			.typeError("Amount must be a number")
			.min(0, "Amount cannot be negative")
			.nullable()
			.optional(),
		grnQuantity: Yup.number()
			.typeError("Qty must be a number")
			.positive("Qty must be positive")
			.required("Qty is required")
			.test("max-shipQty", "GRN Qty cannot exceed shipped qty", function (value) {
				const { shipQty } = this.options.context || {};
				return !shipQty || value <= shipQty;
			})
		,
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
		const isServiceRow = currentRow.shipmentDetails.some(item => _isServiceItem(item));

		// Get item IDs only from this row
		const rowItemIds = currentRow.shipmentDetails.map(item => item.id);
		const selectedIdsArray = rowItemIds.filter(id => selectedItemIds.has(id));

		if (selectedIdsArray.length === 0) {
			toast.error(`Please select at least one item to ${isServiceRow ? 'approve' : 'submit GRN'}.`);
			return;
		}

		let allErrors = {};

		// Only validate for material items (not for service items)
		if (!isServiceRow) {
			for (const itemId of selectedIdsArray) {
				const item = currentRow.shipmentDetails.find(detail => detail.id === itemId);
				const input = itemInputs[itemId] || {};
				const shipQty = item?.shipQty;

				// Use input values if they exist, otherwise fall back to item's database values
				const grnNumber = input?.grnno ?? item?.grnNumber ?? "";
				const grnAmount = input?.amount ?? item?.grnAmount ?? 0;
				const grnQuantity = input?.qty ?? item?.grnQuantity ?? "";
				const qcFailed = input?.qcFailed ?? 0;
				const grnDate = input?.grnDate ?? (item?.grnDate ? item.grnDate.slice(0, 10) : "");

				try {
					await validationSchema_GRNAccepted.validate(
						{
							grnNumber,
							grnAmount,
							grnQuantity,
							qcFailed,
							grnDate,
						},
						{
							abortEarly: false,
							context: { shipQty, grnQuantity }
						}
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
				toast.error("Please fill in required fields: GRN Date and Quantity for all selected items.");
				return;
			}
		}

		// Clear validation errors on success
		setValidationErrors({});

		// Build payload only for selected items in this row
		const payload = selectedIdsArray.map((itemId) => {
			const input = itemInputs[itemId] || {};
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
				// For material items: use input values if available, otherwise fall back to existing database values
				const grnQuantity = input?.qty ?? item?.grnQuantity ?? 0;
				const grnNumber = input?.grnno ?? item?.grnNumber ?? "";
				const grnDate = input?.grnDate ?? (item?.grnDate ? item.grnDate.slice(0, 10) : "");

				// Determine QC Failed: manual, input, or auto-calc
				let qtyQcFailed = 0;
				if (input.qcFailedManual) {
					qtyQcFailed = parseFloat(input.qcFailed) || 0;
				} else if (input.qcFailed !== undefined) {
					qtyQcFailed = parseFloat(input.qcFailed) || 0;
				} else if (item.shipQty !== undefined && grnQuantity) {
					qtyQcFailed = Number(item.shipQty) > Number(grnQuantity) ? Number(item.shipQty) - Number(grnQuantity) : 0;
				}

				return {
					"id": currentRow?.id,
					"batchId": itemId,
					"poId": currentRow?.poId,
					"grnQuantity": parseFloat(grnQuantity),
					"qtyQcFailed": qtyQcFailed,
					"grnNumber": grnNumber,
					"grnAmount": 0,
					"grnDate": grnDate,
					"customerId": currentRow?.customerId,
					"stage": currentInvStage,
					"itemNo": item?.itemNo || "",
					"stages": stageData
				};
			}
		});

		const data = getPayloadWithStage('currentStage', currentInvStage, allInvStageList, payload, 'currentStage');

		const res = await apiClient.postres(`/api/poinvoice/GRN`, data, atoken);
		if (res) {
			toast.success(`${isServiceRow ? 'Service approved' : 'GRN submitted'} successfully.`);
			setDisableGrnBtn(true);
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


			setPaymentDetails(response);
		} catch (error) {

			toast.error("Failed to fetch payment details");
			setPaymentDetails(null);
		} finally {
			setLoadingPayment(false);
		}
	};

	// Handle Add Payment submission — POST /api/paymentheader/Add
	const handleSubmitPayment = async () => {
		if (!paymentForm.paymentAmount || !paymentForm.paymentDate) {
			toast.warning('Please fill in required fields: Amount and Payment Date.');
			return;
		}
		try {
			setSavingPayment(true);
			const selectedInvoice = (poInvoiceList || []).find(
				(inv) => String(inv.id ?? inv.invoiceHId ?? inv.invoiceId) === String(paymentForm.invoiceId)
			);
			const now = new Date().toISOString();
			const paymentDateIso = paymentForm.paymentDate instanceof Date
				? paymentForm.paymentDate.toISOString()
				: new Date(paymentForm.paymentDate).toISOString();

			const payload = {
				id: 0,
				sapPaymentDoc: paymentForm.sapPaymentDoc || '',
				invoiceId: paymentForm.invoiceId ? parseInt(paymentForm.invoiceId, 10) : 0,
				vendorId: poSpecificDetails?.vendorId ?? 0,
				customerId: parseInt(poCustomerId ?? customerid, 10) || 0,
				version: selectedVersion || 0,
				paymentDate: paymentDateIso,
				paymentAmount: parseFloat(paymentForm.paymentAmount) || 0,
				paymentStatus: paymentForm.paymentStatus || 'Pending',
				utrNumber: paymentForm.utrNumber || '',
				bankReference: paymentForm.bankReference || '',
				paymentMethod: paymentForm.paymentMethod || '',
				paymentCategory: paymentForm.paymentCategory || '',
				retentionAmount: paymentForm.retentionAmount ? parseFloat(paymentForm.retentionAmount) : 0,
				createdById: userDetail?.id ?? 0,
				createdByName: userDetail?.name ?? '',
				createdOn: now,
				modifiedBy: userDetail?.id ?? 0,
				modifiedByName: userDetail?.name ?? '',
				modifiedOn: now,
				externalSourcePONumber: poSpecificDetails?.externalSourcePONumber || poSpecificDetails?.poNumber || '',
				invoiceNo: selectedInvoice?.invoiceNo || '',
				partnerNumber: poSpecificDetails?.partnerNumber || '',
				poId: parseInt(pageSlug, 10) || 0,
			};
			const res = await apiClient.postres(`/api/paymentheader/Add`, payload, atoken);
			if (res) {
				toast.success('Payment added successfully.');
				setOpenAddPaymentDrawer(false);
				resetPaymentForm();
				paymentLoadedRef.current = false;
				await fetchPayments();
				setDashboardCounts((prev) => ({
					...prev,
					paymentCount: (prev?.paymentCount ?? 0) + 1,
				}));
			} else {
				toast.error('Failed to add payment. Please try again.');
			}
		} catch (error) {
			toast.error('Failed to add payment. Please try again.');
		} finally {
			setSavingPayment(false);
		}
	};

	const [shipCreatedById, setShipCreatedById] = useState(0);

	const handleInvoiceRowClick = (rows) => {
		setCurrentInvStage(rows?.row?.stage);
		var anchor = "openCreateSheet";

		if (
			rows.field === "shippingDate" ||
			rows.field === "deliveryDate" ||
			rows.field === "invoiceNo" ||
			rows.field === "status" ||
			rows.field === "invoiceAmount" ||
			rows.field === "invoiceDate" ||
			rows.field === "stage" ||
			rows.field === "viewItem"
		) {
			setSelectedInvoiceId(rows?.row?.invoiceId);
			setShipCreatedById(rows?.row?.createdById);
			setCurrentInvStage(rows?.row?.stage);
			setShipConfirmDetails(rows.row);
			toggleDrawer("openCreateSheet", true, rows.row);
			setState({ ...state, [anchor]: true });
			setTabShipsNotice(0);
		}
		else if (rows.field === "invoiceFile") {
			downloadFilesOnAzure(rows.row.invoicePath, atoken);
		}
	};

	const stageInfo = getStageInfo(currentStage, stagelist);

	const validationSchemaApproverFORPO = yup.object().shape({
		remarks: yup.string().when('IsApproved', {
			is: false,
			then: (schema) => schema.required("Reason is required for rejection"),
			otherwise: (schema) => schema.notRequired()
		})
	});

	const formik_POApproveReject = useFormik({
		enableReinitialize: true,
		initialValues: {
			customerId: parseInt(customerid),
			eventId: parseInt(pageSlug),
			eventType: "PO",
			IsApproved: true,
			remarks: "",
			activityId: parseInt(activityId),
			stageId: 0,
			recordCreatorId: 0
		},
		validationSchema: validationSchemaApproverFORPO,
		onSubmit: async (values) => {

			setLoading(true)
			// if (isCurrentAfterBid && values?.IsApproved === true) {
			//     toast.info("Start date of auction is passsed.Please revert to send back to creator for edit pr.");
			//     setLoading(false);
			//     return;
			// }
			// Invoice approval URL (/purchase-order/:invoiceId/:poId?ActionType=approval):
			// same approval component/flow, but the event is the Invoice (EventType INV).
			const isInvApproval = Boolean(poId) && actionTypeFromURL === "approval";
			const actionData = isInvApproval
				? {
					customerId: parseInt(customerid),
					eventId: parseInt(poId),
					eventType: "INV",
					stageId: nstagevalue?.currentStageId,
					emailTemplateId: 15,
					isApproved: values?.IsApproved,
					remarks: values?.remarks,
					activityId: parseInt(activityId),
					vendorId: 0,
					recordCreatorId: poInvoiceList?.[0]?.createdById
				}
				: {
					customerId: parseInt(customerid),
					eventId: parseInt(pageSlug),
					eventType: "PO",
					stageId: stageInfo?.currentStageId,
					IsApproved: values?.IsApproved,
					activityId: parseInt(activityId),
					remarks: values?.remarks,
					eventSubject: poSpecificDetails?.headerText ?? "",
					RecordCreatorId: userDetail?.id
				};

			const res = await apiClient.postres(
				`/api/ApprovalAction/ApprovalAction`, actionData, atoken
			);
			if (res) {
				toast.success(`Action Taken Successfully.`);
				navigate(`/app`);
			}
			setLoading(false)
		},
	});

	// ====== Invoice Approval via URL: /purchase-order/:invoiceId/:poId?ActionType=approval ======
	// (poId param = Invoice ID, pageSlug = PO ID). The PO approval flow (single-ID URL) is untouched.
	const isInvoiceApprovalUrl = Boolean(poId) && actionTypeFromURL === "approval";

	// The invoice whose approvers should be shown: the invoice currently open in
	// the preview dialog (falls back to the URL invoice id on the approval URL).
	const previewedInvoiceId =
		(invoiceDialogMode === 'preview' ? invoicePreviewData?.header?.id : null) ??
		(isInvoiceApprovalUrl ? poId : null);

	// Load invoice approvers whenever an Invoice Preview opens.
	// EventId must be the Invoice ID, EventType INV. The green approval icon
	// depends only on this returning data (not on ActivityId).
	useEffect(() => {
		if (!addInvoiceDialogOpen || !previewedInvoiceId || !atoken || !customerid) {
			setInvApprovalApprovers([]);
			return;
		}
		const dataRequest = {
			EventId: previewedInvoiceId,
			EventType: "INV",
			SortingColumn: "ApproverSeq",
			CustomerId: customerid,
			Version: 1,
		};
		getEventApproversFind(dataRequest, atoken)
			.then((res) => setInvApprovalApprovers(Array.isArray(res) ? res : []))
			.catch(() => setInvApprovalApprovers([]));
	}, [addInvoiceDialogOpen, previewedInvoiceId, customerid, atoken]);

	// Build a dialog-compatible line item from an invoice detail row so the
	// preview can render even when the PO line items are not loaded/matching.
	const buildItemFromInvoiceDetail = (d, i) => ({
		// Prefer creationDetailId (the primary key linking an invoice detail back
		// to its PO line item's `id`) so this synthesized row still matches
		// correctly inside AddInvoiceDialog's own creationDetailId-based lookup.
		id: d?.creationDetailId ?? d?.itemId ?? d?.id ?? `inv-detail-${i}`,
		itemNo: d?.lineItemNo ?? d?.itemNo ?? d?.itemCode ?? i + 1,
		itemDesc: d?.itemDesc ?? d?.itemServiceName ?? d?.materialDescription ?? '',
		materialCode: d?.itemCode ?? d?.materialCode ?? '',
		quantity: d?.orderedQuantity ?? d?.quantity ?? d?.invoiceQuantity ?? '',
		uom: d?.uom ?? '',
		materialPOUnitPrice: d?.materialPOUnitPrice ?? d?.itemAmount ?? 0,
		itemType: d?.itemType ?? '',
	});

	// Open the Invoice Preview directly with data from /api/poinvoice/Find.
	useEffect(() => {
		if (!isInvoiceApprovalUrl || !atoken) return;
		if (invApprovalOpenedRef.current) return;
		const cid = poCustomerId ?? customerid;
		if (!cid) return;
		invApprovalOpenedRef.current = true;
		(async () => {
			try {
				const res = await apiClient.get(`/api/poinvoice/Find?poId=${pageSlug}&customerId=${cid}`, atoken);
				const list = Array.isArray(res) ? res : [];
				const header = list.find((h) =>
					String(h.id) === String(poId) ||
					String(h.invoiceHId ?? h.invoiceHid ?? "") === String(poId) ||
					String(h.invoiceId ?? "") === String(poId)
				);
				if (!header) {
					toast.error("Invoice not found for approval");
					return;
				}
				setPoInvoiceList(list);
				if (header.stage) setCurrentInvStage(header.stage);
				setShipCreatedById(header.createdById ?? header.createdBy ?? 0);
				setSelectedInvoiceId(header.id);

				const details = Array.isArray(header?.invoiceDetails) ? header.invoiceDetails : [];
				const detail = details[0] ?? header;

				// Make sure PO line items are available; on the approval URL the
				// Line Items tab has never been opened, so fetch them here.
				let poItems = Array.isArray(allPOItems) ? allPOItems : [];
				if (poItems.length === 0) {
					try {
						const items = await GetPOCreationDetails(pageSlug, selectedVersion || 1, atoken);
						if (Array.isArray(items) && !items.__cancelled) {
							poItems = items.map(i => ({ ...i, itemNo: i.itemNo ?? i.lineItemNo ?? i.itemCode }));
							setAllPOItems(poItems);
						}
					} catch (itemsError) {
						console.error('Failed to fetch PO line items for invoice preview', itemsError);
					}
				}

				// Prefer real PO line items matched by the primary key
				// (detail.creationDetailId === poItem.id); otherwise build rows
				// straight from the invoice's own details so the preview is never empty.
				let itemsForPreview = (details.length > 0 ? details : [detail])
					.map((d, i) => {
						const matched = poItems.find((it) => String(it.id) === String(d?.creationDetailId));
						return matched ?? buildItemFromInvoiceDetail(d, i);
					})
					.filter(Boolean);
				if (itemsForPreview.length === 0) itemsForPreview = poItems;

				let conditions = [];
				try {
					const condRes = await apiClient.get(
						`/api/poinvoice/FindInvoiceCondition?poid=${pageSlug}&invoiceHid=${header.id}`,
						atoken
					);
					conditions = Array.isArray(condRes) ? condRes : (condRes ? [condRes] : []);
				} catch (condError) {
					conditions = [];
				}
				setInvoiceDialogMode("preview");
				setInvoicePreviewData({ header, detail, conditions });
				setSelectedInvoiceItems(itemsForPreview);
				setAddInvoiceDialogOpen(true);
			} catch (error) {
				console.error("Failed to load invoice for approval", error);
				toast.error("Failed to load invoice details");
			}
		})();
	}, [isInvoiceApprovalUrl, atoken, poCustomerId, customerid]);

	const requestCellInvoiceApproval = useMemo(() => ({
		EventId: previewedInvoiceId ? parseInt(previewedInvoiceId) : 0,
		EventType: "INV",
		SortingColumn: "ApproverSeq",
		CustomerId: customerid,
	}), [previewedInvoiceId, customerid]);

	if (loadingPermissions || !invStagelist) {
		return (
			<GridSkeleton />
		)
	}

	// Invoice Preview approval UI (mirrors the PO preview approval experience):
	// - green approver icon: shown whenever EventApproversFind returned approvers for the
	//   previewed invoice (independent of ActivityId); shows the Approver List in the
	//   right-side panel (click again to hide the panel).
	// - blue Action button: only when ActionType=approval AND ActivityId are present;
	//   shows the Approval Action screen in the SAME right-side panel (no drawer/dialog).
	const invHasApprovers = invApprovalApprovers.length > 0;
	const invShowActionButton = isInvoiceApprovalUrl && Boolean(activityId) && activityId !== 0 && activityId !== "0";

	const invoiceApprovalHeaderActions = invHasApprovers ? (
		<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
			{invShowActionButton && (
				<button
					type="button"
					className="pe-btn pe-btn--primary"
					style={{ padding: '4px 14px', fontSize: 13 }}
					onClick={() => {
						setapproveSaveDisable(false);
						setInvApprovalPanelView('action');
						setInvApprovalPanelShow(true);
					}}
				>
					Action
				</button>
			)}
			<button
				type="button"
				className="pe-icon-btn pe-icon-btn--view"
				title="Show/Hide Approvers"
				style={{ marginLeft: 10 }}
				onClick={() => {
					if (invApprovalPanelShow && invApprovalPanelView === 'approvers') {
						setInvApprovalPanelShow(false);
					} else {
						setInvApprovalPanelView('approvers');
						setInvApprovalPanelShow(true);
					}
				}}
			>
				<PeopleAltIcon style={{ fontSize: 18 }} />
			</button>
		</div>
	) : null;

	// Right-side approval panel shown inside the Invoice Preview dialog.
	// Hosts both views (Approver List / Approval Action) in the same location.
	const invoiceApprovalPanel = (invHasApprovers && invApprovalPanelShow) ? (
		invApprovalPanelView === 'action' ? (
			<form onSubmit={formik_POApproveReject.handleSubmit} autoComplete="off">
				<div className="section-heading mb-3 pb-2 border-bottom mt-2 ps-2">Approval Action</div>
				<div className="p-2">
					<div className="mb-4">
						<TextField
							id="IsApproved"
							InputLabelProps={{ shrink: true }}
							name="IsApproved"
							select
							className="mb-2"
							fullWidth
							size="small"
							label="Status"
							variant="outlined"
							value={formik_POApproveReject.values.IsApproved}
							onChange={(e) =>
								formik_POApproveReject.setFieldValue("IsApproved", e.target.value)
							}
						>
							<MenuItem value={true}>Approve</MenuItem>
							<MenuItem value={false}>Reject</MenuItem>
						</TextField>
					</div>
					<div className="mb-4">
						<TextField
							id="remarks"
							InputLabelProps={{ shrink: true }}
							multiline
							rows={3}
							name="remarks"
							className="w-100 f14"
							size="small"
							label="Comment "
							variant="outlined"
							inputProps={{ maxLength: 200 }}
							value={formik_POApproveReject?.values?.remarks}
							error={formik_POApproveReject.touched.remarks && Boolean(formik_POApproveReject.errors.remarks)}
							helperText={formik_POApproveReject.touched.remarks && formik_POApproveReject.errors.remarks}
							onChange={(e) =>
								formik_POApproveReject.setFieldValue("remarks", e.target.value)
							}
							InputProps={{
								endAdornment: formik_POApproveReject?.values?.remarks && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik_POApproveReject?.values?.remarks?.length}/200
										</Typography>
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className="text-end">
						<LoadingButton
							loading={loading}
							color="primary"
							size="medium"
							className="text-white text-capitalize mb-3"
							variant="contained"
							type="submit"
							disabled={approveSaveDisable}
						>
							<span>Save</span>
						</LoadingButton>
					</div>
				</div>
			</form>
		) : (
			<div>
				<div className="section-heading mb-3 pb-2 border-bottom mt-2 ps-2">Approval Workflow</div>
				<EventApprovalBox
					requestCell={requestCellInvoiceApproval}
					handleEventAppList={handleEventAppList}
					wfupdate={wfupdate}
					action={false}
					stagelist={invStagelist}
					Version={1}
					permissionManager={invPermissionManager}
					eventCode={invoicePreviewData?.header?.invoiceNo || poSpecificDetails?.poNumber}
					eventSubject={poSpecificDetails?.headerText || ""}
					startDate={poSpecificDetails?.createdOn}
					endDate={poSpecificDetails?.deliveryDate}
					currentStage={invoicePreviewData?.header?.stage ?? currentInvStage}
				/>
			</div>
		)
	) : null;

	// PO Line Item Type driven visibility (MATERIAL -> GRN/ASN, SERVICE -> SES).
	// Derived from allPOItems so the tabs reflect what's actually on the PO,
	// independent of whether any GRN/SES/ASN record has been created yet —
	// this is what lets the tab show up with a plain label (no "(0)") instead
	// of being hidden until the first record exists.
	const hasMaterialLineItems = Array.isArray(allPOItems) &&
		allPOItems.some(item => item?.itemType?.toLowerCase() !== 'service');
	const hasServiceLineItems = Array.isArray(allPOItems) &&
		allPOItems.some(item => item?.itemType?.toLowerCase() === 'service');

	const poStatusSteps = Array.isArray(stagelist) && stagelist.length > 0
		? stagelist.map(s => s.stageName || s.currentStage).filter(Boolean)
		: ["Draft"];
	const normalizedCurrentStage = (currentStage || "Draft").trim();
	const currentStatusIndex = Math.max(
		0,
		poStatusSteps.findIndex(s => s.toLowerCase() === normalizedCurrentStage.toLowerCase())
	);

	return (
		<div className="rfq-detail-v2-shell">
			<div className="mainContainer d-flex rfq-modern-shell">
				<div className="leftContent d-flex flex-column">

					{/* ── Page header ── */}
					<div className="rfq-dv2-page-head border-bottom mb-3" style={{ flexShrink: 0 }}>

						{/* Row 1: breadcrumb + action buttons */}
						<div className="rfq-dv2-head-top">
							<nav className="rfq-dv2-breadcrumb" aria-label="breadcrumb">
								<span className="rfq-dv2-breadcrumb-link" onClick={() => navigate('/app')} role="button" tabIndex={0}>
									Home
								</span>
								<span className="rfq-dv2-sep">/</span>
								<span className="rfq-dv2-breadcrumb-link" onClick={() => navigate('/PO/POlist')} role="button" tabIndex={0}>
									Purchase Orders
								</span>
								<span className="rfq-dv2-sep">/</span>
								<span className="rfq-dv2-breadcrumb-current">
									PO - {poSpecificDetails?.externalSourcePONumber || poSpecificDetails?.poNumber || poSpecificDetails?.id || 'PO Detail'}
								</span>
							</nav>

							<div className="rfq-dv2-actions">
								{poSpecificDetails?.poDocumentFileName && (
									<button type="button" className="pe-btn pe-btn--outline"
										onClick={() => poSpecificDetails?.poDocumentFilePath && downloadFilesOnAzure(poSpecificDetails.poDocumentFilePath, poSpecificDetails.poDocumentFileName, atoken)}>
										<HiOutlineLink style={{ fontSize: 14, marginRight: 6 }} />
										Download PO
									</button>
								)}
								{!loading && (
									String(currentStage ?? "").toLowerCase().includes("under approval") &&
										actionType !== "" && activityId !== "" ? (
										<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--primary"
											onClick={toggleDrawer("openInvoiceApproved", true)}>
											Action
										</button>
									) : (
										isDraft && (value === 0 || value === 1 || value === 10) && (
											<>
												<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--ghost"
													onClick={openPOCancelDialog} disabled={savingPaymentTerm}>
													PO Cancel
												</button>
												<button type="button" className="rfq-dv2-action-btn rfq-dv2-action-btn--primary"
													onClick={handleSaveAndContinue} disabled={savingPaymentTerm}>
													{savingPaymentTerm ? 'Saving...' : (value === 10 ? 'Submit' : 'Save & Continue')}
												</button>
											</>
										)
									)
								)}
							</div>
						</div>

						{/* Meta row with status pill */}
						<div className="rfq-dv2-head-bottom">
							<div className="rfq-dv2-meta-row">
								<span className="rfq-dv2-meta-item">
									<span className="rfq-dv2-meta-label">Status</span>
									<button
										type="button"
										className={`rfq-dv2-status-pill${normalizedCurrentStage.toLowerCase() === 'draft' ? ' is-draft' : ''}`}
										onClick={handleStatusMenuOpen}
									>
										<span className="rfq-dv2-status-dot" />
										{normalizedCurrentStage}
									</button>
									<Menu
										anchorEl={statusAnchorEl}
										open={Boolean(statusAnchorEl)}
										onClose={handleStatusMenuClose}
										classes={{ paper: 'rfq-dv2-status-menu-paper' }}
										anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
										transformOrigin={{ vertical: 'top', horizontal: 'left' }}
										PaperProps={{ style: { width: 260, minWidth: 260, maxWidth: 260, overflow: 'hidden' } }}
									>
										<div className="rfq-dv2-status-menu">
											<div className="rfq-dv2-status-menu-title">PO Status</div>
											<div className="rfq-dv2-status-menu-list">
												{poStatusSteps.map((step, index) => {
													const stepClass = index < currentStatusIndex ? '' : index === currentStatusIndex ? 'is-current' : 'is-future';
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
								</span>
							</div>
						</div>
					</div>

					<div className="rounded-default shadow-sm w-100 flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden', minHeight: 0, borderRadius: '8px 8px 0 0 !important' }}>

						{/* ── Tabs + Content ── */}
						<div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden', borderRadius: '8px 8px 0 0 !important' }}>

							{/* Tab bar */}
							<div className="d-flex align-items-center po-tab-bar" style={{ flexShrink: 0, borderRadius: '8px 8px 0 0 !important' }}>
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
										<Tab value={0} label={<span className="section-heading">PO Details</span>} disabled={isPoDetailsReadDisabled} />)}
									{(loadingPermissions || poPermissionManager?.hasPermission('Items/Services', ACTIONS.READ)) && (
										<Tab value={1} label={<span className="section-heading">Line Items {dashboardCounts.itemCount > 0 ? `(${dashboardCounts.itemCount})` : ''}</span>} disabled={isItemServicesReadDisabled} />)}
									{!isDraft && hasMaterialLineItems && Number(poCustomerId ?? customerid) !== 78 && (
										<Tab value={2} label={<span className="section-heading">{dashboardCounts.asnCount > 0 ? `ASN (${dashboardCounts.asnCount})` : 'ASN'}</span>} />)}
									{!isDraft && hasMaterialLineItems && (
										<Tab value={3} label={<span className="section-heading">{dashboardCounts.grnCount > 0 ? `GRN (${dashboardCounts.grnCount})` : 'GRN'}</span>} />)}
									{!isDraft && hasServiceLineItems && (
										<Tab value={4} label={<span className="section-heading">{dashboardCounts.sesCount > 0 ? `Service Entry (${dashboardCounts.sesCount})` : 'Service Entry'}</span>} />)}
									{!isDraft && (
										<Tab value={5} label={<span className="section-heading">{dashboardCounts.invoiceCount > 0 ? `Invoices (${dashboardCounts.invoiceCount})` : 'Invoices'}</span>} />)}
									{!isDraft && (
										<Tab value={7} label={<span className="section-heading">Payments {dashboardCounts.paymentCount > 0 ? `(${dashboardCounts.paymentCount})` : ''}</span>} />)}
									<Tab value={10} label={<span className="section-heading">Preview</span>} />
								</Tabs>
							</div>

							<Menu anchorEl={anchorElAction} open={openAction} onClose={handleCloseActionMenu} />

							{/* Scrollable tab content */}
							<div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>

								{value === 0 && (
									<PODetailsTab
										versionError={versionError}
										loadPOVersionData={loadPOVersionData}
										pageSlug={pageSlug}
										selectedVersion={selectedVersion}
										latestVersion={latestVersion}
										loadingVersion={loadingVersion}
										setSelectedVersion={setSelectedVersion}
										isDraft={isDraft}
										poNumberInput={poNumberInput}
										setPoNumberInput={setPoNumberInput}
										poSpecificDetails={poSpecificDetails}
										stagedPODate={stagedPODate}
										expiryDate={expiryDate}
										setExpiryDate={setExpiryDate}
										currentStage={currentStage}
										addressCountryOptions={addressCountryOptions}
										atoken={atoken}
										setbillToAddress={setbillToAddress}
										setbillToCity={setbillToCity}
										setbillToState={setbillToState}
										setBillToCountry={setBillToCountry}
										setBillToCountryObj={setBillToCountryObj}
										setBillToStateObj={setBillToStateObj}
										setBillToCityObj={setBillToCityObj}
										setBillStateOptions={setBillStateOptions}
										setBillCityOptions={setBillCityOptions}
										setOpenEditBill={setOpenEditBill}
										setshipToAddress={setshipToAddress}
										setshipToCity={setshipToCity}
										setshipToState={setshipToState}
										setShipToCountry={setShipToCountry}
										setShipToCountryObj={setShipToCountryObj}
										setShipToStateObj={setShipToStateObj}
										setShipToCityObj={setShipToCityObj}
										setShipStateOptions={setShipStateOptions}
										setShipCityOptions={setShipCityOptions}
										setOpenEditShip={setOpenEditShip}
										selectedPaymentTermId={selectedPaymentTermId}
										paymentTermsFieldRef={paymentTermsFieldRef}
										setPaymentTermModal={setPaymentTermModal}
										paymentTermsOptions={paymentTermsOptions}
										paymentTermsLoading={paymentTermsLoading}
										setSelectedPaymentTermId={setSelectedPaymentTermId}
										selectPOAttachedFile={selectPOAttachedFile}
										handleOpenAddCondition={handleOpenAddCondition}
										setIsAddingCondition={setIsAddingCondition}
										setEditingCondition={setEditingCondition}
										setConditionForm={setConditionForm}
										setOpenEditCondition={setOpenEditCondition}
										setConditionToDelete={setConditionToDelete}
										setDeleteConditionDialogOpen={setDeleteConditionDialogOpen}
										isPoDetailsReadDisabled={isPoDetailsReadDisabled}
									/>
								)}

								{value === 1 && (
									<LineItemsTab
										isItemServicesReadDisabled={isItemServicesReadDisabled}
										addFlowMode={addFlowMode}
										ADD_FLOW_LABEL={ADD_FLOW_LABEL}
										addFlowSelectedItems={addFlowSelectedItems}
										cancelAddFlow={cancelAddFlow}
										handleAddFlowNext={handleAddFlowNext}
										displayPOItems={displayPOItems}
										allPOShipHeader={allPOShipHeader}
										currentStage={currentStage}
										pageSlug={pageSlug}
										poCustomerId={poCustomerId}
										customerid={customerid}
										apiClient={apiClient}
										atoken={atoken}
										poSpecificDetails={poSpecificDetails}
										isItemEligibleForAddMode={_isItemEligibleForAddMode}
										handleAddFlowToggleItem={handleAddFlowToggleItem}
										handleAddFlowToggleAll={handleAddFlowToggleAll}
										deliveryUpdates={deliveryUpdates}
										setDeliveryDialogRow={setDeliveryDialogRow}
										setDeliveryDialogDate={setDeliveryDialogDate}
										setDeliveryDialogOpen={setDeliveryDialogOpen}
										canCreateAsn={canCreateAsn}
										isUnderApprovalStage={isUnderApprovalStage}
										handleOpenAddAsnDrawer={handleOpenAddAsnDrawer}
										canCreateGrn={canCreateGrn}
										getEligibleItemsForAddMode={_getEligibleItemsForAddMode}
										NO_REMAINING_ITEM_MSG_GRN={NO_REMAINING_ITEM_MSG_GRN}
										setPOOrderItems={setPOOrderItems}
										SetRef_ItemId={SetRef_ItemId}
										setSelectedGrnItems={setSelectedGrnItems}
										setAddGrnDialogOpen={setAddGrnDialogOpen}
										canCreateInvoice={canCreateInvoice}
										handleOpenAddInvoiceDrawer={handleOpenAddInvoiceDrawer}
										canCreateSes={canCreateSes}
										NO_REMAINING_ITEM_MSG_SES={NO_REMAINING_ITEM_MSG_SES}
										setSelectedSesItems={setSelectedSesItems}
										setAddSesDialogOpen={setAddSesDialogOpen}
										allPOItems={allPOItems}
										setSesDialogMode={setSesDialogMode}
										setSesPreviewData={setSesPreviewData}
										toggleDrawer={toggleDrawer}
										setValue={setValue}
										canCreatePayment={canCreatePayment}
										setPaymentTargetItem={setPaymentTargetItem}
										resetPaymentForm={resetPaymentForm}
										setOpenAddPaymentDrawer={setOpenAddPaymentDrawer}
										handlePreviewInvoice={handlePreviewInvoice}
										handlePreviewAsn={handlePreviewAsn}
										fetchPaymentDetails={fetchPaymentDetails}
									/>
								)}

								{value === 10 && (
									<PreviewTab
										poSpecificDetails={poSpecificDetails}
										allPOItems={allPOItems}
										atoken={atoken}
										requestCell={requestCell}
										stagelist={stagelist}
										customerid={customerid}
										customersuffix={customersuffix}
									/>
								)}
								{/* ASN Tab Content */}
								{value === 2 && Number(poCustomerId ?? customerid) !== 78 && allPOItems?.some(item => item.itemType?.toLowerCase() !== 'service') && (
									<ASNTab
										poCustomerId={poCustomerId}
										customerid={customerid}
										allPOItems={allPOItems}
										isShippedHistoryCreateDisabled={isShippedHistoryCreateDisabled}
										canCreateAsn={canCreateAsn}
										renderAddFlowButton={renderAddFlowButton}
										poAsnList={poAsnList}
										allPOShipHeader={allPOShipHeader}
										formatoption={formatoption}
										handlePreviewAsn={handlePreviewAsn}
									/>
								)}

								{/* GRN Tab Content - Only for Material Items */}
								{value === 3 && allPOItems?.some(item => item.itemType?.toLowerCase() !== 'service') && (
									<GRNTab
										allPOItems={allPOItems}
										isShippedHistoryCreateDisabled={isShippedHistoryCreateDisabled}
										canCreateGrn={canCreateGrn}
										renderAddFlowButton={renderAddFlowButton}
										poGrnList={poGrnList}
										expandedGrnHeaderIds={expandedGrnHeaderIds}
										toggleGrnHeaderExpand={toggleGrnHeaderExpand}
										formatoption={formatoption}
										handleDownloadIndividualGrnReport={handleDownloadIndividualGrnReport}
										downloadingGrnId={downloadingGrnId}
									/>
								)}

								{/* Service Entry Tab Content - Only for Service Items */}
								{value === 4 && allPOItems?.some(item => item.itemType?.toLowerCase() === 'service') && (
									<ServiceEntryTab
										allPOItems={allPOItems}
										isShippedHistoryCreateDisabled={isShippedHistoryCreateDisabled}
										canCreateSes={canCreateSes}
										renderAddFlowButton={renderAddFlowButton}
										poSesList={poSesList}
										pageSlug={pageSlug}
										loadingGrnReport={loadingGrnReport}
										handleDownloadSesReport={handleDownloadSesReport}
										expandedSesHeaderIds={expandedSesHeaderIds}
										toggleSesHeaderExpand={toggleSesHeaderExpand}
										formatoption={formatoption}
										setSesDialogMode={setSesDialogMode}
										setSesPreviewData={setSesPreviewData}
										setSelectedSesItems={setSelectedSesItems}
										setAddSesDialogOpen={setAddSesDialogOpen}
									/>
								)}

								{/* Invoices Tab Content */}
								{value === 5 && (
									<InvoicesTab
										isShippedHistoryCreateDisabled={isShippedHistoryCreateDisabled}
										canCreateInvoice={canCreateInvoice}
										renderAddFlowButton={renderAddFlowButton}
										canReadInvoice={canReadInvoice}
										poInvoiceList={poInvoiceList}
										formatoption={formatoption}
										handlePreviewInvoice={handlePreviewInvoice}
									/>
								)}

								{value === 7 && (
									<PaymentsTab
										isShippedHistoryCreateDisabled={isShippedHistoryCreateDisabled}
										canCreatePayment={canCreatePayment}
										setPaymentTargetItem={setPaymentTargetItem}
										resetPaymentForm={resetPaymentForm}
										poInvoiceList={poInvoiceList}
										pageSlug={pageSlug}
										poCustomerId={poCustomerId}
										customerid={customerid}
										apiClient={apiClient}
										atoken={atoken}
										setPoInvoiceList={setPoInvoiceList}
										setOpenAddPaymentDrawer={setOpenAddPaymentDrawer}
										loadingPayments={loadingPayments}
										paymentError={paymentError}
										paymentLoadedRef={paymentLoadedRef}
										fetchPayments={fetchPayments}
										poPaymentList={poPaymentList}
										formatoption={formatoption}
										setPaymentDetails={setPaymentDetails}
										setState={setState}
									/>
								)}

							</div>
						</div>

						<PODetailsDialogs
							openEditBill={openEditBill}
							setOpenEditBill={setOpenEditBill}
							addressCountryOptions={addressCountryOptions}
							billToCountryObj={billToCountryObj}
							setBillToCountryObj={setBillToCountryObj}
							setBillToCountry={setBillToCountry}
							billStateOptions={billStateOptions}
							setBillStateOptions={setBillStateOptions}
							billToStateObj={billToStateObj}
							setBillToStateObj={setBillToStateObj}
							billCityOptions={billCityOptions}
							setBillCityOptions={setBillCityOptions}
							billToCityObj={billToCityObj}
							setBillToCityObj={setBillToCityObj}
							setbillToState={setbillToState}
							setbillToCity={setbillToCity}
							billToAddress={billToAddress}
							setbillToAddress={setbillToAddress}
							billToCity={billToCity}
							billToState={billToState}
							billToCountry={billToCountry}
							atoken={atoken}
							pageSlug={pageSlug}
							poSpecificDetails={poSpecificDetails}
							setPoSpecificDetails={setPoSpecificDetails}
							openEditShip={openEditShip}
							setOpenEditShip={setOpenEditShip}
							shipToCountryObj={shipToCountryObj}
							setShipToCountryObj={setShipToCountryObj}
							setShipToCountry={setShipToCountry}
							shipStateOptions={shipStateOptions}
							setShipStateOptions={setShipStateOptions}
							shipToStateObj={shipToStateObj}
							setShipToStateObj={setShipToStateObj}
							shipCityOptions={shipCityOptions}
							setShipCityOptions={setShipCityOptions}
							shipToCityObj={shipToCityObj}
							setShipToCityObj={setShipToCityObj}
							setshipToState={setshipToState}
							setshipToCity={setshipToCity}
							shipToAddress={shipToAddress}
							setshipToAddress={setshipToAddress}
							shipToCity={shipToCity}
							shipToState={shipToState}
							shipToCountry={shipToCountry}
							openEditCondition={openEditCondition}
							setOpenEditCondition={setOpenEditCondition}
							isAddingCondition={isAddingCondition}
							setIsAddingCondition={setIsAddingCondition}
							isItemConditionMode={isItemConditionMode}
							setIsItemConditionMode={setIsItemConditionMode}
							targetItemForCondition={targetItemForCondition}
							setTargetItemForCondition={setTargetItemForCondition}
							conditionForm={conditionForm}
							setConditionForm={setConditionForm}
							savingCondition={savingCondition}
							setSavingCondition={setSavingCondition}
							editingCondition={editingCondition}
							selectedVersion={selectedVersion}
							versionControllerRef={versionControllerRef}
							apiClient={apiClient}
							deleteConditionDialogOpen={deleteConditionDialogOpen}
							setDeleteConditionDialogOpen={setDeleteConditionDialogOpen}
							isDeletingCondition={isDeletingCondition}
							setConditionToDelete={setConditionToDelete}
							handleDeleteCondition={handleDeleteCondition}
							poCancelDialogOpen={poCancelDialogOpen}
							closePOCancelDialog={closePOCancelDialog}
							poCancelComment={poCancelComment}
							setPoCancelComment={setPoCancelComment}
							poCancelError={poCancelError}
							setPoCancelError={setPoCancelError}
							poCancelSubmitting={poCancelSubmitting}
							handlePOCancelConfirm={handlePOCancelConfirm}
						/>

					</div>
				</div>

				{/* Right panel — always visible */}
				{pageSlug && (
					<div className="rightContent">
						<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column approver-panel" style={{ overflow: 'hidden' }}>
							{/* Panel tab headers */}
							<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2 flex-shrink-0 rfq-dv2-workflow-head">
								<div className="rfq-dv2-workflow-tabs">
									<button type="button" className={`rfq-dv2-workflow-tab ${workflowPanelTab === 'workflow' ? 'active' : ''}`} onClick={() => setWorkflowPanelTab('workflow')}>
										Approval Workflow
									</button>
									<button type="button" className={`rfq-dv2-workflow-tab ${workflowPanelTab === 'history' ? 'active' : ''}`} onClick={() => setWorkflowPanelTab('history')}>
										View History
									</button>
								</div>
							</div>
							<div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
								{workflowPanelTab === 'workflow' && (
									<EventApprovalBox
										requestCell={requestCell}
										handleEventAppList={handleEventAppList}
										wfupdate={wfupdate}
										stagelist={stagelist}
										currentStage={currentStage}
										eventCode={poSpecificDetails?.poNumber}
										eventSubject={poSpecificDetails?.headerText || ''}
										startDate={poSpecificDetails?.createdOn}
										endDate={poSpecificDetails?.deliveryDate}
									/>
								)}
								{workflowPanelTab === 'history' && (
									<div className="rfq-dv2-history-track">
										{historyLoading ? (
											<div className="rfq-dv2-panel-loading">Loading history…</div>
										) : historyGraph.length === 0 && historyAudit.length === 0 ? (
											<div className="rfq-dv2-panel-empty">No history found.</div>
										) : (
											<>
												{historyGraph.length > 0 && (
													<div className="rfq-dv2-stage-graph">
														{historyGraph.map((stage, i) => {
															const name = stage.approverName ?? stage.modifiedByName ?? 'Unknown';
															const date = stage.stageDone || stage.modifiedOn || '';
															return (
																<React.Fragment key={i}>
																	{i > 0 && (
																		<div className="rfq-dv2-stage-graph-arrow">
																			<span className="rfq-dv2-stage-arrow-icon">→</span>
																		</div>
																	)}
																	<div className="rfq-dv2-stage-graph-node">
																		<span className="rfq-dv2-stage-graph-badge">
																			<span className="rfq-dv2-stage-check">✓</span>
																			{stage.currentStage?.toUpperCase()}
																		</span>
																		<span className="rfq-dv2-stage-graph-user">{name}</span>
																		<span className="rfq-dv2-stage-graph-date">{date}</span>
																	</div>
																</React.Fragment>
															);
														})}
													</div>
												)}
											</>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				)}

			</div>{/* end mainContainer rfq-modern-shell */}

			<PODrawers
				state={state}
				toggleDrawer={toggleDrawer}
				shipConfirmDetails={shipConfirmDetails}
				isServiceItem={_isServiceItem}
				addFlowMode={addFlowMode}
				setAddFlowStep={setAddFlowStep}
				setValue={setValue}
				formatoption={formatoption}
				invStagelist={invStagelist}
				currentInvStage={currentInvStage}
				tabShipsNotice={tabShipsNotice}
				handleTabShipsNotice={handleTabShipsNotice}
				invPermissionManager={invPermissionManager}
				formik_POShipOrdrItem={formik_POShipOrdrItem}
				formik_POShipInvoiceHeader={formik_POShipInvoiceHeader}
				formik_InvoiceAccepted={formik_InvoiceAccepted}
				poSpecificDetails={poSpecificDetails}
				atoken={atoken}
				allPOShipHeader={allPOShipHeader}
				allPOItems={allPOItems}
				selectedItemIds={selectedItemIds}
				invStatus={invStatus}
				openRows={openRows}
				handleToggleRow={handleToggleRow}
				handleSelectAllRow={handleSelectAllRow}
				handleCheckboxChange={handleCheckboxChange}
				handleItemInputChange={handleItemInputChange}
				itemInputs={itemInputs}
				validationErrors={validationErrors}
				isServiceRow={_isServiceRow}
				getValidationStyle={getValidationStyle}
				handleSubmitGRN={handleSubmitGRN}
				disableGrnBtn={disableGrnBtn}
				grnMenuAnchor={grnMenuAnchor}
				handleGrnMenuOpen={handleGrnMenuOpen}
				handleGrnMenuClose={handleGrnMenuClose}
				handleViewGrnReport={handleViewGrnReport}
				handleDownloadGrnReport={handleDownloadGrnReport}
				loadingGrnReport={loadingGrnReport}
				setInvStatus={setInvStatus}
				setSelectedInvoiceRows={setSelectedInvoiceRows}
				setDisableGrnBtn={setDisableGrnBtn}
				handleInvoiceRowClick={handleInvoiceRowClick}
				loadingPayment={loadingPayment}
				fetchPaymentDetails={fetchPaymentDetails}
				requestCellINV={requestCellINV}
				handleEventAppList={handleEventAppList}
				wfupdate={wfupdate}
				stagearray={stagearray}
				activityId={activityId}
				selectedInvoiceId={selectedInvoiceId}
				poId={poId}
				selectAttachedFile={selectAttachedFile}
				returnfileName={returnfileName}
				attachmentfilters={attachmentfilters}
				handleAttachfileChange={handleAttachfileChange}
				showAttach={showAttach}
				approveSaveDisable={approveSaveDisable}
				loading={loading}
				poOrderItems={poOrderItems}
				formik_POConfirmOrder={formik_POConfirmOrder}
				userDetail={userDetail}
				formik_PORejectOrder={formik_PORejectOrder}
				formik_GRNAccepted={formik_GRNAccepted}
				grnSaveDisable={grnSaveDisable}
				isShippedHistoryEditDisabled={isShippedHistoryEditDisabled}
				formik_POApproveReject={formik_POApproveReject}
				setState={setState}
				currentStage={currentStage}
				paymentDetails={paymentDetails}
				setPaymentDetails={setPaymentDetails}
				openAddPaymentDrawer={openAddPaymentDrawer}
				setOpenAddPaymentDrawer={setOpenAddPaymentDrawer}
				resetPaymentForm={resetPaymentForm}
				paymentTargetItem={paymentTargetItem}
				paymentForm={paymentForm}
				handlePaymentFormChange={handlePaymentFormChange}
				poInvoiceList={poInvoiceList}
				savingPayment={savingPayment}
				handleSubmitPayment={handleSubmitPayment}
				requestCell={requestCell}
				stagelist={stagelist}
				poPermissionManager={poPermissionManager}
			/>

			{/* Payment Terms - Add/Edit Modal */}
			<PEModal
				open={paymentTermModal}
				onClose={() => setPaymentTermModal(false)}
				title="Manage Payment Terms"
				size="lg"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
			>
				<div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
					<AddUpdatePaymentterms
						handlePaymentTermsList={(list) => {
							setPaymentTermsOptions(list);
						}}
					/>
				</div>
			</PEModal>

			{/* GRN Report Modal */}
			<GRNReportModal
				open={grnReportModal}
				onClose={() => setGrnReportModal(false)}
				data={grnReportData}
				loading={loadingGrnReport}
			/>

			{/* Add GRN Dialog */}
			<AddGRNDialog
				open={addGrnDialogOpen}
				onClose={handleCloseAddGrnDialog}
				poDetails={poSpecificDetails}
				lineItems={selectedGrnItems.length > 0 ? selectedGrnItems : allPOItems}
				onSubmit={handleSubmitGrn}
				existingGrnNumbers={poGrnList}
			/>

			{/* Add SES Dialog */}
			<SESDialog
				open={addSesDialogOpen}
				onClose={handleCloseAddSesDialog}
				poDetails={poSpecificDetails}
				lineItems={selectedSesItems.length > 0 ? selectedSesItems : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service')}
				onSubmit={handleSubmitSes}
				mode={sesDialogMode}
				previewData={sesPreviewData}
			/>

			{/* Add ASN Dialog */}
			<AddASNDialog
				open={addAsnDialogOpen}
				onClose={handleCloseAddAsnDialog}
				poDetails={poSpecificDetails}
				lineItems={selectedAsnItems.length > 0 ? selectedAsnItems : allPOItems.filter(item => item.itemType?.toLowerCase() !== 'service')}
				asnHeaders={allPOShipHeader}
				onSubmit={handleSubmitAsn}
				mode={asnDialogMode}
				previewData={asnPreviewData}
			/>

			{/* Add Invoice Dialog */}
			<AddInvoiceDialog
				open={addInvoiceDialogOpen}
				onClose={handleCloseAddInvoiceDialog}
				poDetails={poSpecificDetails}
				lineItems={selectedInvoiceItems.length > 0 ? selectedInvoiceItems : allPOItems}

				// lineItems={allPOItems}
				initialSelectedItems={selectedInvoiceItems}
				onSubmit={handleSubmitInvoice}
				uomOptions={UOMMaster}
				mode={invoiceDialogMode}
				previewData={invoicePreviewData}
				stagesPayload={buildInvoiceStagesPayload()}
				atoken={atoken}
				customerid={poCustomerId ?? customerid}
				userName={userDetail?.name ?? ''}
				approvalPanel={invoiceApprovalPanel}
				headerActions={invoiceApprovalHeaderActions}
				stagelist={invStagelist}
				currentStage={invoicePreviewData?.header?.stage ?? currentInvStage}
			/>

			{/* Edit Delivery Date Dialog */}
			<PEModal
				open={deliveryDialogOpen}
				onClose={() => {
					setDeliveryDialogOpen(false);
					setDeliveryDialogRow(null);
					setDeliveryDialogDate(null);
				}}
				title="Edit Delivery Date"
				size="xs"
				footer={
					<>
						<button
							type="button"
							className="pe-btn pe-btn--outline"
							onClick={() => {
								setDeliveryDialogOpen(false);
								setDeliveryDialogRow(null);
								setDeliveryDialogDate(null);
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							className="pe-btn pe-btn--primary"
							disabled={!deliveryDialogRow || !deliveryDialogDate}
							onClick={() => {
								if (deliveryDialogRow) {
									setDeliveryUpdates((prev) => ({
										...prev,
										[deliveryDialogRow.id]: deliveryDialogDate,
									}));
								}
								setDeliveryDialogOpen(false);
								setDeliveryDialogRow(null);
								setDeliveryDialogDate(null);
							}}
						>
							Save
						</button>
					</>
				}
			>
				<div style={{ padding: '8px 0' }}>
					<label className="pe-field-label">Delivery Date</label>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<MobileDatePicker
							value={deliveryDialogDate}
							onChange={(newValue) => setDeliveryDialogDate(newValue)}
							slotProps={{
								textField: {
									variant: "outlined",
									fullWidth: true,
									size: "small",
									InputLabelProps: { shrink: true },
								},
								actionBar: { actions: ["clear", "cancel", "accept"] },
							}}
							format="dd/MM/yyyy"
						/>
					</LocalizationProvider>
				</div>
			</PEModal>
		</div>
	);
};

export default PurchaseOrder;
