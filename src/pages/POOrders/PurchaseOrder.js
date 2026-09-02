import {
	Alert,
	Autocomplete,
	Badge,
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Collapse,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
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
	HiOutlinePencilAlt,
	HiPlusSm,
	HiOutlineTrash,
	HiOutlineEye,
} from "react-icons/hi";
import DownloadIcon from "@mui/icons-material/Download";
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
	POShipInvoiceGRN,
	GetPOAttachments,
	GetPOVersion,
	GetPOCondition,
	GetPOCreationDetails,
	POAttachments,
	POConfirmOrder,
	PORejectOrder,
	GetPOHeaderList_Slug,
	POShipInvoiceHeader,
	POShipOrdrItem,
	UpdatePOAddresses,
	POCommercialFind,
} from "../../utils/purchaseOrder";
import { useFormik } from "formik";
import * as Yup from "yup";
import POItemList from "./POItemList";
import POPreview from './POPreview';
import AddGRNDialog from './AddGRNDialog';
import SESDialog from './SESDialog';
import AddASNDialog from './AddASNDialog';
import AddInvoiceDialog from './AddInvoiceDialog';
import useFormikOC, {
	useFormik_InvoiceAccepted,
	useFormik_GRNAccepted,
	useFormik_POConfirmOrder,
	useFormik_PORejectOrder,
	useFormik_POShipInvoiceHeader,
	useFormik_POShipOrdrItem,
} from "../../utils/pOToAccept/formik";
import { useCookies } from "react-cookie";
import ReceiptIcon from "@mui/icons-material/Receipt"; // Icon for "GRN"
import * as yup from 'yup';


import {
	onlyNumbers,
	downloadFilesOnAzure,
	uploadFilesOnAzure,
	onlyNumberdec,
	getFileName,
	getPayloadWithStage,
	fetchMasters,
	fetchStates,
	fetchCities,
	segregatedEventapprover,
	getApiErrorMessage,
} from "../../utils/common";
import { StageFindAll } from "../../utils/stagemaster";
import { actionTypes, useStateValue } from "../../store";
import {
	formatDateViaTimeZone,
	formatoption,
	getOnlyDateFormatPatternLocale,
	getCurrency,
	checkUTC,
	getEventApproversFind,
} from "../../utils/common/utility";
import { BackButton, MemoizedEventStageFlow } from "../../utils/common/component";
import GridSkeleton from "../../components/Skeleton/gridSkeleton";
import { ApiClient, api } from "../../Apiclient";
import { toast } from "react-toastify";
import EditIcon from '@mui/icons-material/Edit';


import { buildQueryParams } from "../../utils/purchaseRequest";
import { PermissionManager, CLAIM_TYPES, ACTIONS } from '../../utils/permissionManager';
import { LoadingButton } from "@mui/lab";
import { UOMMasterList } from "../../utils/commerciallibrary";

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

	// Anchor for the Save & Continue split-button dropdown (separate from anchorElAction)
	const [anchorElSaveContinue, setAnchorElSaveContinue] = useState(null);
	const openSaveContinueMenu = Boolean(anchorElSaveContinue);
	const handleOpenSaveContinueMenu = (e) => setAnchorElSaveContinue(e.currentTarget);
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
	// Item accordion + search state
	const [expandedItemIds, setExpandedItemIds] = useState(new Set());
	const [itemTableSearch, setItemTableSearch] = useState('');
	const toggleItemExpand = (id) => {
		setExpandedItemIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	};

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



	const [gRNDate, setGRNDate] = useState(null);

	const [currentStage, setCurrentStage] = useState("");
	// Single source of truth for "is this PO still in Draft" — used across the
	// PO Details tab (PO Number / Expiry Date editability) and other stage-gated UI.
	const isDraft = String(currentStage ?? "").toLowerCase().includes("draft");
	// Single source of truth for "is this PO Under Approval" — Add ASN / Add GRN /
	// Add SES / Add Invoice (tab buttons AND inline per-row actions) must be
	// hidden and unusable while the PO is in this stage.
	const isUnderApprovalStage = String(currentStage ?? "").toLowerCase().includes("under approval");
	const [currentInvStage, setCurrentInvStage] = useState("");
	const [approvershow, setApproverShow] = useState(false);

	// Debug: Track approvershow visibility
	useEffect(() => {
		// Approver visibility tracking
	}, [approvershow]);

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

	const initialValues_fetchPODetails = {
		// CustomerId:customerid,
		// pagenumber:1,
		POId: pageSlug,
	};

	const [ref_POHeaderId, setref_POHeaderId] = useState(0);
	const [Ref_ItemId, SetRef_ItemId] = useState(0);
	const [itemId, setitemId] = useState(0);

	const [eventType, setEvenType] = useState("PO");
	const [eventStage, setEventStage] = useState("");
	const [invStatus, setInvStatus] = useState("");
	const [nextEventStage, setNextEventStage] = useState('');
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

	const isServiceLineItem = (item) => String(item?.itemType ?? '').toLowerCase() === 'service';

	const getOrderedQty = (item) => Number(item?.orderedQuantity ?? item?.quantity ?? 0);

	const normalizeMatchKeys = (values) =>
		values.filter(v => v !== null && v !== undefined && v !== '').map(v => String(v));

	const getPOItemMatchKeys = (source) => normalizeMatchKeys([
		source?.id,
		source?.poCreationDetailId,
		source?.poItemId,
		source?.itemId,
		source?.poCreationId,
		source?.itemNo,
		source?.lineItemNo,
		source?.itemCode,
		source?.materialCode,
	]);

	const getDetailMatchKeys = (source) => normalizeMatchKeys([
		// creationDetailId is the primary/correct key linking an invoice (or other
		// event) detail row back to its originating PO line item's `id`. It is
		// checked first so it always wins over the weaker legacy fallback keys below.
		source?.creationDetailId,
		source?.poCreationDetailId,
		source?.poItemId,
		source?.itemId,
		source?.poCreationId,
		source?.itemNo,
		source?.lineItemNo,
		source?.itemCode,
		source?.materialCode,
	]);

	const matchesPOItem = (detail, item) => {
		const detailKeys = getDetailMatchKeys(detail);
		const itemKeys = getPOItemMatchKeys(item);
		return detailKeys.some(key => itemKeys.includes(key));
	};

	/** Strict primary-key match: an invoice detail belongs to a PO line item
	 *  only when detail.creationDetailId === item.id. Used for Invoice Preview. */
	const matchesByCreationDetailId = (detail, item) =>
		detail?.creationDetailId != null &&
		item?.id != null &&
		String(detail.creationDetailId) === String(item.id);

	const getDetailPoLineId = (detail) =>
		detail?.creationDetailId ?? detail?.poCreationDetailId ?? detail?.poItemId ?? null;

	const matchesByPoLineId = (detail, item) =>
		item?.id != null &&
		getDetailPoLineId(detail) != null &&
		String(getDetailPoLineId(detail)) === String(item.id);

	const sumMatchingDetails = (records, item, detailKeys, qtyKeys) =>
		(records ?? []).reduce((total, record) => {
			const details = detailKeys.flatMap(key => Array.isArray(record?.[key]) ? record[key] : []);
			return total + details.reduce((detailTotal, detail) => {
				if (!matchesPOItem(detail, item)) return detailTotal;
				const qty = qtyKeys.reduce((value, key) => value ?? detail?.[key], null);
				return detailTotal + Number(qty ?? 0);
			}, 0);
		}, 0);

	// IMPORTANT: `receivedQty` is the field the backend actually populates with
	// the cumulative already-ASN'd quantity for this PO item (same field the
	// "Received Qty" column in the Line Items table reads directly). It must be
	// included in this fallback chain — without it, whenever the shipmentDetails
	// match against allPOShipHeader fails to line up (e.g. dialog opened before
	// asnHeaders finished loading) AND the raw item object's own totalShipQty is
	// stale/zero, this evaluates to 0 and Remaining Qty is wrongly shown as the
	// full Ordered Qty instead of the true remainder (the ASN "Remaining Qty" bug).
	const getAsnCompletedQty = (item) => Math.max(
		sumMatchingDetails(allPOShipHeader, item, ['shipmentDetails'], ['shipQty', 'quantity']),
		Number(item?.receivedQty ?? item?.totalShipQty ?? item?.shippedQuantity ?? item?.asnQuantity ?? 0)
	);

	const getGrnCompletedQty = (item) => {
		const matchedQty = (poGrnList ?? []).reduce((total, header) => {
			const details = ['grnItem', 'grnItems']
				.flatMap(key => Array.isArray(header?.[key]) ? header[key] : []);
			return total + details.reduce((detailTotal, detail) => {
				const isMatch = item?.id != null && getDetailPoLineId(detail) != null
					? matchesByPoLineId(detail, item)
					: matchesPOItem(detail, item);
				if (!isMatch) return detailTotal;
				const qty = ['acceptedQty', 'receivedQty', 'quantity']
					.reduce((value, key) => value ?? detail?.[key], null);
				return detailTotal + Number(qty ?? 0);
			}, 0);
		}, 0);

		const fallbackQty = Number(
			item?.receivedQty ?? item?.acceptedQty ?? item?.totalGrnQty ?? item?.grnQuantity ?? 0
		);
		if ((poGrnList ?? []).length === 0) return fallbackQty;
		return matchedQty > 0 ? matchedQty : fallbackQty;
	};

	const getSesCompletedQty = (item) => Math.max(
		sumMatchingDetails(poSesList, item, ['sesItem', 'sesItems'], ['serviceQty', 'acceptedQty', 'quantity']),
		Number(item?.totalSesQty ?? item?.serviceQty ?? item?.acceptedQty ?? 0)
	);

	const isRejectedInvoiceRecord = (invoice) => {
		const stage = String(invoice?.stage ?? '').toLowerCase().trim();
		const status = String(invoice?.status ?? '').toLowerCase().trim();
		return stage === 'rejected' || stage === 'reject' || status === 'rejected' || status === 'reject';
	};

	const isRejectedInvoiceDetail = (detail) => {
		const stage = String(detail?.stage ?? '').toLowerCase().trim();
		const status = String(detail?.status ?? '').toLowerCase().trim();
		return stage === 'rejected' || stage === 'reject' || status === 'rejected' || status === 'reject';
	};

	const getInvoiceCompletedQty = (item) => {
		const matchedQty = (poInvoiceList ?? []).reduce((total, invoice) => {
			if (isRejectedInvoiceRecord(invoice)) return total;
			const details = ['invoiceDetails', 'invoiceItem', 'invoiceItems']
				.flatMap(key => Array.isArray(invoice?.[key]) ? invoice[key] : []);
			return total + details.reduce((detailTotal, detail) => {
				const isMatch = item?.id != null && detail?.creationDetailId != null
					? matchesByCreationDetailId(detail, item)
					: matchesPOItem(detail, item);
				if (!isMatch) return detailTotal;
				if (isRejectedInvoiceDetail(detail)) return detailTotal;
				const qty = ['invoiceQuantity', 'quantity', 'invoicedQty']
					.reduce((value, key) => value ?? detail?.[key], null);
				return detailTotal + Number(qty ?? 0);
			}, 0);
		}, 0);

		const fallbackQty = Number(
			item?.invoicedQty ?? item?.invoicedQuantity ?? item?.totalInvoiceQty ?? item?.invoiceQuantity ?? 0
		);
		if ((poInvoiceList ?? []).length === 0) return fallbackQty;
		return matchedQty > 0 ? matchedQty : fallbackQty;
	};

	const getCompletedQtyForAddMode = (mode, item) => {
		if (mode === 'ASN') return getAsnCompletedQty(item);
		if (mode === 'GRN') return getGrnCompletedQty(item);
		if (mode === 'SES') return getSesCompletedQty(item);
		if (mode === 'INVOICE') return getInvoiceCompletedQty(item);
		return 0;
	};

	const getRemainingQtyForAddMode = (mode, item) =>
		Math.max(getOrderedQty(item) - getCompletedQtyForAddMode(mode, item), 0);

	const isItemEligibleForAddMode = (mode, item) => {
		if (!mode || !item) return true;
		if ((mode === 'ASN' || mode === 'GRN') && isServiceLineItem(item)) return false;
		if (mode === 'SES' && !isServiceLineItem(item)) return false;
		return getRemainingQtyForAddMode(mode, item) > 0;
	};

	const getItemWithStageQuantity = (mode, item) => {
		const remainingQty = getRemainingQtyForAddMode(mode, item);
		if (mode === 'ASN') return { ...item, totalShipQty: getAsnCompletedQty(item) };
		if (mode === 'GRN') return { ...item, totalShipQty: getGrnCompletedQty(item) };
		if (mode === 'SES') return { ...item, totalSesQty: getSesCompletedQty(item) };
		if (mode === 'INVOICE') {
			const orderedQty = getOrderedQty(item);
			const invoicedQty = getInvoiceCompletedQty(item);
			return {
				...item,
				quantity: remainingQty,
				orderedQuantity: orderedQty,
				invoicedQty,
			};
		}
		return item;
	};

	const getEligibleItemsForAddMode = (mode, sourceItems = allPOItems) =>
		(sourceItems ?? [])
			.filter(item => isItemEligibleForAddMode(mode, item))
			.map(item => getItemWithStageQuantity(mode, item));

	const hasRemainingItemsForAddMode = (mode) =>
		allPOItems.length === 0 || getEligibleItemsForAddMode(mode).length > 0;

	const displayPOItems = useMemo(
		() => (allPOItems ?? []).map(item => ({
			...item,
			orderedQuantity: getOrderedQty(item),
			invoicedQty: getInvoiceCompletedQty(item),
		})),
		[allPOItems, poInvoiceList]
	);

	// Returns true if the given PO item appears in any shipment header marked as 'Shipped'.
	const isItemShipped = (item) => getAsnCompletedQty(item) >= getOrderedQty(item);

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
	const [showAddButtons] = useState(false); // Show "+ Add X" buttons on ASN/GRN/SES/Invoice tabs
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

	// Shipment (ASN) is only allowed once the PO has reached Confirmed or a later stage.
	const isShipmentAllowed = () => {
		const stage = String(currentStage ?? '').toLowerCase().trim();
		if (!stage) return false;
		if (stage.includes('not confirmed')) return false;
		const blocked = ['draft', 'under approval', 'sent to supplier', 'po sent'];
		if (blocked.some(s => stage.includes(s))) return false;
		return stage.includes('confirmed') || stage.includes('in process') || stage.includes('closed');
	};

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
		if (!hasRemainingItemsForAddMode(mode)) {
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
		if (originTab != null) setValue(originTab);
	};

	// Toggle a single line item's selection during the Add flow.
	const handleAddFlowToggleItem = (item, checked) => {
		if (checked && !isItemEligibleForAddMode(addFlowMode, item)) {
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
		setAddFlowSelectedItems(checked ? getEligibleItemsForAddMode(addFlowMode, allPOItems) : []);
	};

	// Next: validate the selection, then open the relevant existing
	// Drawer/Dialog with only the selected line items.
	const handleAddFlowNext = () => {
		if (addFlowSelectedItems.length === 0) {
			toast.warning('Please select at least one line item.');
			return;
		}
		const eligibleSelectedItems = getEligibleItemsForAddMode(addFlowMode, addFlowSelectedItems);
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
		const disabled = !hasRemainingItemsForAddMode(mode);
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

	// Open modal for adding item-level condition
	const handleOpenAddItemCondition = async (item) => {
		setIsAddingCondition(true);
		setEditingCondition(null);
		setIsItemConditionMode(true);
		setTargetItemForCondition(item);
		setCommercialTerms([]);
		setConditionForm({
			conditionType: "",
			conditionCategory: "",
			conditionRate: "",
			conditionValue: "",
			currency: "",
			calculationType: "",
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



	// Handle opening Add GRN Dialog
	const handleOpenAddGrnDialog = () => {
		if (selectedGrnItems.length === 0) {
			toast.warning('Please select at least one item.');
			return;
		}
		setAddGrnDialogOpen(true);
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

	// Handle GRN item selection in the GRN tab
	const handleToggleGrnItem = (item) => {
		setSelectedGrnItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				return prev.filter(i => i.id !== item.id);
			} else {
				return [...prev, item];
			}
		});
	};

	// Handle select all GRN items
	const handleSelectAllGrnItems = (event) => {
		if (event.target.checked) {
			setSelectedGrnItems(getEligibleItemsForAddMode('GRN'));
		} else {
			setSelectedGrnItems([]);
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

	// Handle opening Add SES Dialog (mirrors handleOpenAddGrnDialog)
	const handleOpenAddSesDialog = () => {
		if (selectedSesItems.length === 0) {
			toast.warning('Please select at least one item.');
			return;
		}
		setAddSesDialogOpen(true);
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
	// Handle SES item selection in the SES tab
	const handleToggleSesItem = (item) => {
		setSelectedSesItems(prev => {
			const isSelected = prev.some(i => i.id === item.id);
			if (isSelected) {
				return prev.filter(i => i.id !== item.id);
			} else {
				return [...prev, item];
			}
		});
	};

	// Handle select all SES items
	const handleSelectAllSesItems = (event) => {
		if (event.target.checked) {
			setSelectedSesItems(getEligibleItemsForAddMode('SES'));
		} else {
			setSelectedSesItems([]);
		}
	};

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

		if (current?.eventType != null && (current?.currentStage || current?.stageName)) {
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
			const detail = (invoiceRow?.creationDetailId != null
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

			const response = await apiClient.api.get(
				`/api/sesheader/downloadSES/${poId}`,
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

				// const filteredGRN = res?.filter((rowData) => {
				// 	return rowData.isActive == true && rowData.stageName == "GRN";
				// });
				// setGRNIsActive(filteredGRN);
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
						deliveryUpdates[it.id] != null
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
				poId,
				ver,
				atoken,
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
				if (poData?.customerId != null) {
					setPoCustomerId(poData.customerId);
				}

				if (poData?.version) {
					setLatestVersion(Number(poData.version));
				}
			}
		} catch (err) {
			// Error handling

			console.error("loadPOVersionData Error:", err);

			if (
				err?.name === 'CanceledError' ||
				err?.code === 'ERR_CANCELED'
			) {
				return;
			}

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

		if (actionTypeFromURL == "approval") {
			setValue(2);
		}
	}, [searchParams]);

	useEffect(() => {

		if (actionTypeFromURL == "approval") {
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
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);
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
			const res = await apiClient.getres(
				`/api/rolemanagement/GetUserRoleRights?${queryParams}`,
				atoken
			);
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

				return rowData.isActive == true && rowData.stageName == "GRN";
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
	const [requestApprover, setRequestApprover] = useState({
		// EventId: allPOShipHeader[0]?.InvoiceDetails[0]?.id ?? 0,
		EventId: allPOShipHeader[0]?.id ?? 0,
		EventType: "INV",
	});
	// const [requestApprover, setRequestApprover] = useState({
	// 	EventId: pageSlug,
	// 	EventType: "INV",
	// });

	const [stagearray, setStagearray] = useState([`Draft`, `PO Sent to Supplier`]);
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
						const stagelistworkflow = stagelist.filter(x => x.isActive).filter(x => x.wfname).map(x => x.wfname);
						const updatedvalue = segregatedEventapprover(res, stagelistworkflow);

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




	const [poOrderItems, setPOOrderItems] = useState([]);
	//checkbox to handle selection of items
	const [selectedItems, setSelectedItems] = useState([]);
	const [isAllItemChecked, setIsAllItemChecked] = useState(true);
	const handleAllItemChecked = (event) => {
		const checked = event.target.checked;
		setIsAllItemChecked(checked);
		setSelectedItems(checked ? allPOItems : []);
	};
	const onItemCheckboxChange = (item, isChecked) => {
		setSelectedItems((prevSelectedItems) => {
			if (isChecked) {
				return prevSelectedItems.some((selectedItem) => selectedItem.id === item.id)
					? prevSelectedItems
					: [...prevSelectedItems, item];
			}

			return prevSelectedItems.filter(
				(selectedItem) => selectedItem.id !== item.id
			);
		});
	};

	useEffect(() => {
		setIsAllItemChecked(allPOItems.length > 0 && selectedItems.length === allPOItems.length);
	}, [allPOItems, selectedItems]);

	const buildAsnDrawerPayload = (items) => {
		const normalizedItems = (items ?? []).filter(Boolean);
		const firstItem = normalizedItems[0];

		if (!firstItem) {
			return null;
		}

		if (normalizedItems.length === 1) {
			return firstItem;
		}

		return {
			...firstItem,
			id: 0,
			shipSlipId: '',
			shipNoticeType: '',
			carrierName: '',
			lrShipBillNumber: '',
			ewayBillNumber: '',
			shipMethod: '',
			serviceLevel: '',
			remarks: '',
			shippingDate: null,
			deliveryDate: null,
			invoiceAmount: null,
			invoiceDate: null,
			invoiceFile: '',
			invoiceId: 0,
			invoiceNo: '',
			invoicePath: '',
			shipmentDetails: normalizedItems,
		};
	};

	// Opens the Add ASN Dialog (POST /api/shipment/Add) for the given (possibly
	// multiple) selected line items. Mirrors handleOpenAddGrnDialog/handleOpenAddSesDialog —
	// only Material items with open (unshipped) quantity are eligible.
	const handleOpenAddAsnDrawer = (itemsToOpen = selectedItems) => {
		// if (!isShipmentAllowed()) {
		// 	toast.warning('Shipment is not allowed until the PO reaches the Confirmed stage.');
		// 	return;
		// }
		const normalizedItems = getEligibleItemsForAddMode(
			'ASN',
			Array.isArray(itemsToOpen) ? itemsToOpen : [itemsToOpen]
		);

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
		const normalizedItems = getEligibleItemsForAddMode('INVOICE', itemsForSelection);

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
			fetchPOHeaderList_Slug(pageSlug, selectedVersion);
			loadPOVersionData(pageSlug, selectedVersion);
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
				eventSubject: poSpecificDetails?.headerText ?? "",
				RecordCreatorId: POShipInvoiceHeader?.createdById ?? 0,
			}

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

		if (newValue == 0) {
			// Tab 0 – PO Details: reload header + conditions only.
			// DO NOT call ASN / GRN / SES / Invoice / Payment / Document APIs here.
			loadPOVersionData(pageSlug, selectedVersion);

		} else if (newValue == 1) {
			// Tab 1 – Line Items: fetch /api/pocreationdetail/Find on first open (or version change).
			if (poItemsLoadedVersionRef.current !== Number(selectedVersion) && !poItemsLoadingRef.current) {
				poItemsLoadedVersionRef.current = null;
				fetchPOCreationItems();
			}
			// Item expansion (Invoice/ASN/GRN per item) is handled inside each item row — DO NOT move here.

		} else if (newValue == 2) {
			// Tab 2 – ASN: loaded by useEffect via /api/shipment/Find?POId=...

		} else if (newValue == 3) {
			// Tab 3 – GRN (Material PO) or SES (Service PO): handled by dedicated useEffects above.
			// GRN: /api/grnheader/Find?poId=...&customerId=... (useEffect on value===3)
			// SES: /api/sesheader/Find?poId=... (useEffect on value===4, but shown as tab 3 for service POs)

		} else if (newValue == 4) {
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

		} else if (newValue == 5) {
			// Tab 5 – Invoice: handled by dedicated useEffect above (fires on value===5).
			// Uses /api/poinvoice/Find?poId=...&customerId=... where customerId comes from GetPOVersion.
			// Do NOT preload.

		} else if (newValue >= 6 && newValue <= 9) {
			// Tabs 6-9 – Payments, Documents, History, etc.

		} else if (newValue == 10) {
			// Preview tab
			loadPOVersionData(pageSlug, selectedVersion);
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

	const toggleDrawer = (anchor, open, dataSelect) => (event) => {

		//var nstagevalue = getNextStage(dataSelect);
		// const nstagevalue = getStageInfo(currentInvStage, allInvStageList);

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
	const [selectedRows, setSelectedRows] = React.useState([]);
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
		const isServiceRow = currentRow.shipmentDetails.some(item => isServiceItem(item));

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

		const res = await apiClient.postres(
			`/api/poinvoice/GRN`,
			data,
			atoken
		);
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
			field: "materialPOUnitPrice",
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
		return row.id;
	};

	const [selectedRow, setSelectedRow] = useState(null);

	const handleRowClick = (rows) => {
		// Prevent navigation to shipped history in draft mode
		if (String(currentStage ?? "").toLowerCase().includes("draft")) {
			return;
		}

		SetRef_ItemId(rows?.row?.id);
		setPOOrderItems(rows.row);
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
			renderCell: (params) => {
				const isRejected = isRejectedInvoiceRecord(params.row);
				return (
					<div
						style={{
							cursor: 'pointer',
							color: isRejected ? '#d32f2f' : 'inherit',
							fontWeight: isRejected ? 600 : 'normal',
							backgroundColor: isRejected ? '#ffebee' : 'transparent',
							padding: isRejected ? '2px 8px' : '0px',
							borderRadius: isRejected ? '4px' : '0px',
						}}
						onClick={(e) => {
							e.stopPropagation();
							handleInvoiceRowClick({ row: params.row, field: "status" });
						}}
					>
						{params?.formattedValue}
					</div>
				);
			},
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
			renderCell: (params) => {
				const isRejected = isRejectedInvoiceRecord(params.row);
				return (
					<div
						style={{
							cursor: 'pointer',
							color: isRejected ? '#d32f2f' : 'inherit',
							fontWeight: isRejected ? 600 : 'normal',
							backgroundColor: isRejected ? '#ffebee' : 'transparent',
							padding: isRejected ? '2px 8px' : '0px',
							borderRadius: isRejected ? '4px' : '0px',
						}}
						onClick={(e) => {
							e.stopPropagation();
							handleInvoiceRowClick({ row: params.row, field: "stage" });
						}}
					>
						{params?.formattedValue}
					</div>
				);
			},
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
			const currentDate = new Date();
			// if (isCurrentAfterBid && values?.IsApproved == true) {
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

	// ===== Invoice Approval via URL: /purchase-order/:invoiceId/:poId?ActionType=approval =====
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
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			{invShowActionButton && (
				<Button
					type="button"
					size="small"
					className="button-text text-white"
					variant="contained"
					onClick={() => {
						setapproveSaveDisable(false);
						setInvApprovalPanelView('action');
						setInvApprovalPanelShow(true);
					}}
				>
					Action
				</Button>
			)}
			<Tooltip title="Show/Hide Approvers">
				<IconButton
					onClick={() => {
						if (invApprovalPanelShow && invApprovalPanelView === 'approvers') {
							setInvApprovalPanelShow(false);
						} else {
							setInvApprovalPanelView('approvers');
							setInvApprovalPanelShow(true);
						}
					}}
					size="small"
					edge="start"
					className="pointer"
				>
					<div className="approverCircle shadow-sm">
						<PeopleAltIcon />
					</div>
				</IconButton>
			</Tooltip>
		</Box>
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

	return (
		<>
			<div className="mainContainer d-flex" style={{ overflow: 'hidden' }}>
				<div className={`leftContent ${approvershow ? "col-9" : "col-12"} d-flex flex-column`}>
					<div className="bg-white rounded-default shadow-sm p-3 w-100 flex-grow-1 d-flex flex-column" style={{ height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
						<div className="d-flex justify-content-between align-items-center border-bottom mb-3 pb-2" style={{ flexShrink: 0 }}>
							<div className="d-flex flex-column">
								<div className="d-flex align-items-center gap-2 mb-1">
									<BackButton
										title={
											<span className="page-heading">
												<span className="page-heading">
													Purchase Order :{" "}
													<span style={{ color: "#1976d2" }}>
														{poSpecificDetails?.externalSourcePONumber ||
															poSpecificDetails?.poNumber ||
															poSpecificDetails?.id}
													</span>
												</span>
											</span>
										}
										modal={true}
									/>
								</div>
								<div className="d-flex align-items-center gap-2 ms-5">
									{/* <Chip
										label={poSpecificDetails?.stage}
										color="success"
										size="small"
										sx={{ fontWeight: 500 }}
									/> */}
									<Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 1 }}>
										{/* PO Date: {formatDateViaTimeZone(
											stagedPODate ?? poSpecificDetails?.pO_Date ?? poSpecificDetails?.createdOn,
											"en-GB",
											formatoption
										)} */}
										{/* Supplier: {poSpecificDetails?.vendorName || ""} */}
										<br />
										{/* Company: {poSpecificDetails?.company || ""} */}
										{/* Company: {poSpecificDetails?.company ? <Tooltip title={poSpecificDetails?.company}><span style={{cursor: 'help'}}>{poSpecificDetails.company.length > 20 ? poSpecificDetails.company.substring(0, 20) + "....." : poSpecificDetails.company}</span></Tooltip> : ""} */}
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
							{/* {String(currentStage ?? "").toLowerCase().includes("draft") && (value === 0 || value === 1 || value === 3) && (
								// <div style={{ display: 'flex', alignItems: 'center' }}>
								// 	<LoadingButton
								// 		loading={savingPaymentTerm}
								// 		variant="contained"
								// 		size="small"
								// 		className="text-capitalize"
								// 		onClick={handleSaveAndContinue}
								// 		disabled={savingPaymentTerm}
								// 	>
								// 		{value === 3 ? 'PO Sent to Supplier' : 'Save & Continue'}
								// 	</LoadingButton>
								// </div>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{!loading && (
										(actionType != null && activityId !=null)  && String(currentStage ?? "").toLowerCase().includes("under approval") ? (
											<Button

												type="button"
												size="small"
												className="button-text text-white"
												variant="contained"
												onClick={toggleDrawer("openInvoiceApproved", true)}
											>
												Action
											</Button>
										) : (
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
										)
									)}
								</div>
							)} */}

							<div style={{ display: 'flex', alignItems: 'center' }}>
								{!loading && (
									String(currentStage ?? "").toLowerCase().includes("under approval") &&
										actionType != "" &&
										activityId != "" ? (
										<Button
											type="button"
											size="small"
											className="button-text text-white"
											variant="contained"
											onClick={toggleDrawer("openInvoiceApproved", true)}
										>
											Action
										</Button>
									) : (
										String(currentStage ?? "").toLowerCase().includes("draft") &&
										(value === 0 || value === 1 || value === 10) && (
											<div style={{ display: 'flex', alignItems: 'center' }}>
												<ButtonGroup variant="contained" size="small" disabled={savingPaymentTerm}>
													<LoadingButton
														loading={savingPaymentTerm}
														variant="contained"
														size="small"
														className="text-capitalize"
														onClick={() => {
															handleSaveAndContinue();
														}}
														disabled={savingPaymentTerm}
													>
														{value === 10 ? 'Submit' : 'Save & Continue'}
													</LoadingButton>
													<Button
														size="small"
														className="text-capitalize"
														onClick={handleOpenSaveContinueMenu}
														disabled={savingPaymentTerm}
														sx={{ px: 0.5, minWidth: 'auto' }}
													>
														<HiChevronDown />
													</Button>
												</ButtonGroup>
												<Menu
													anchorEl={anchorElSaveContinue}
													open={openSaveContinueMenu}
													onClose={handleCloseSaveContinueMenu}
												>
													<MenuItem onClick={openPOCancelDialog}>PO Cancel</MenuItem>
												</Menu>
											</div>
										)
									)
								)}
							</div>




						</div>
						{/* Content Area with Tabs */}
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
										{/* PO Details Tab - visibility gated by Roles/permissions (Buyer PO-specific) */}
										{(loadingPermissions || poPermissionManager?.hasPermission('PO Details', ACTIONS.READ)) && (
											<Tab
												value={0}
												label="PO Details"
												disabled={isPoDetailsReadDisabled}
											/>
										)}
										{/* Line Items Tab - now visible in Draft as well (per updated Draft-stage flow:
										    PO Details -> Line Items -> Preview, all as top-level tabs).
										    Still gated by Roles/permissions (Buyer PO-specific); count from dashboardCounts, matching Matrix PO */}
										{(loadingPermissions || poPermissionManager?.hasPermission('Items/Services', ACTIONS.READ)) && (
											<Tab
												value={1}
												label={`Line Items (${dashboardCounts.itemCount})`}
												disabled={isItemServicesReadDisabled}
											/>
										)}
										{/* ASN Tab - Only for Material line items (PO Line Item Type driven, not count-driven).
										    Tab stays visible even when asnCount is 0; the "(n)" suffix is only appended
										    once records exist, per dashboard display rule (no "ASN (0)"). */}
										{!String(currentStage ?? "").toLowerCase().includes("draft") &&
											hasMaterialLineItems &&
											Number(poCustomerId ?? customerid) !== 78 && (
												<Tab
													value={2}
													label={dashboardCounts.asnCount > 0 ? `ASN (${dashboardCounts.asnCount})` : 'ASN'}
												/>
											)}
										{/* GRN Tab - Only for Material line items (PO Line Item Type driven, not count-driven) */}
										{!String(currentStage ?? "").toLowerCase().includes("draft") &&
											hasMaterialLineItems && (
												<Tab
													value={3}
													label={dashboardCounts.grnCount > 0 ? `GRN (${dashboardCounts.grnCount})` : 'GRN'}
												/>
											)}
										{/* Service Entry Tab - Only for Service line items (PO Line Item Type driven, not count-driven) */}
										{!String(currentStage ?? "").toLowerCase().includes("draft") &&
											hasServiceLineItems && (
												<Tab
													value={4}
													label={dashboardCounts.sesCount > 0 ? `Service Entry (${dashboardCounts.sesCount})` : 'Service Entry'}
												/>
											)}
										{/* Invoices Tab - always available once not in draft; "(n)" suffix only when invoices exist */}
										{!String(currentStage ?? "").toLowerCase().includes("draft") && (
											<Tab
												value={5}
												label={dashboardCounts.invoiceCount > 0 ? `Invoices (${dashboardCounts.invoiceCount})` : 'Invoices'}
											/>
										)}
										{/* Advance Invoices Tab */}

										{/* Payments Tab (dashboardCounts-driven, matching Matrix PO) */}
										{!String(currentStage ?? "").toLowerCase().includes("draft") &&
											(
												<Tab
													value={7}
													label={`Payments (${dashboardCounts.paymentCount ?? 0})`}
												/>
											)}
										{/* Documents Tab */}
										{/* {!String(currentStage ?? "").toLowerCase().includes("draft") && (
											<Tab
												value={8}
												label="Documents (0)"
											/>
										)} */}
										{/* History Tab */}
										{/* {!String(currentStage ?? "").toLowerCase().includes("draft") && (
											<Tab
												value={9}
												label="History"
											/>
										)} */}
										{/* Preview tab - always available */}
										<Tab
											value={10}
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

								{/* History cell and Approver icons - aligned on the same row */}
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<HistoryCell eventtype="PO" eventId={pageSlug} permissionManager={poPermissionManager} />
									{pageSlug && (
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
									)}
								</Box>
							</Box>

							{/* Removed separate row for icons - now integrated above */}
							<Menu
								anchorEl={anchorElAction}
								open={openAction}
								onClose={handleCloseActionMenu}
							>
								{/* Menu items can go here if needed */}
							</Menu>

							{/* <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}> */}
							<div style={{
								flex: 1,
								minHeight: 0,        // important for flex containers
								overflowY: 'auto',   // vertical scroll
								overflowX: 'hidden',   // horizontal scroll only if absolutely necessary
							}}>

								{value == 0 ? (
									<>
										<div className="p-2">
											{/* PO Header Details - Editable in Draft */}
											<Grid container spacing={2}>
												<Grid item xs={12}>
													<Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'white' }}>
														<CardContent>
															{versionError && (
																<Box mb={2}>
																	<Alert severity="error" action={
																		<Button color="inherit" size="small" onClick={() => loadPOVersionData(pageSlug, selectedVersion)}>Retry</Button>
																	}>
																		{versionError}
																	</Alert>
																</Box>
															)}

															<Grid container spacing={2}>

																{/* LEFT SIDE */}
																<Grid item xs={12} md={6}>
																	<Box>

																		<Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
																			<Box display="flex" alignItems="center">

																				<Typography sx={{ color: '#666', width: 100 }}>
																					PO Number
																				</Typography>

																				{isDraft ? (
																					<TextField
																						size="small"
																						value={poNumberInput}
																						onChange={(e) => setPoNumberInput(e.target.value)}
																						placeholder="Enter PO Number"
																						sx={{ width: 200, '& .MuiOutlinedInput-input': { padding: '4px 8px', fontSize: 14 } }}
																					/>
																				) : (
																					<Typography sx={{ fontWeight: 400, color: '#1976d2' }}>
																						{poNumberInput ||
																							poSpecificDetails?.externalSourcePONumber ||
																							poSpecificDetails?.poNumber ||
																							'N/A'}
																					</Typography>
																				)}

																				{/* GAP added here */}
																				<Typography sx={{ color: '#666', fontSize: 12, ml: 2 }}>
																					Version
																				</Typography>

																				<TextField
																					select
																					size="small"
																					value={selectedVersion}
																					onChange={(e) => {
																						const v = Number(e.target.value);
																						if (!v || v <= 0) return; // ignore invalid
																						if (v === selectedVersion) return; // ignore same selection
																						setSelectedVersion(v);
																						loadPOVersionData(pageSlug, v);
																					}}
																					disabled={loadingVersion}
																					sx={{
																						width: 60,
																						ml: 0.5,
																						'& .MuiOutlinedInput-input': {
																							padding: '4px 6px',
																							fontSize: 12,
																						},
																						'& .MuiSelect-select': {
																							padding: '4px 24px 4px 6px !important',
																							fontSize: 12,
																						},
																					}}
																				>
																					{(Array.from({ length: (Number(latestVersion) > 0 ? Number(latestVersion) : 1) }, (_, i) => i + 1)).map(v => (
																						<MenuItem key={v} value={v}>{v}</MenuItem>
																					))}
																				</TextField>

																			</Box>
																		</Box>

																		<Box display="flex" mb={0.5}>
																			<Typography sx={{ color: '#666', width: 100 }}>
																				PO Date
																			</Typography>
																			<Typography>
																				{formatDateViaTimeZone(
																					stagedPODate ?? poSpecificDetails?.pO_Date ?? poSpecificDetails?.createdOn,
																					"en-GB",
																					formatoption
																				)}
																			</Typography>
																		</Box>
																		<Box display="flex" alignItems="center" mb={0.5}>
																			<Typography sx={{ color: '#666', width: 100 }}>
																				PO Amount
																			</Typography>

																			<Typography>
																				{Number(poSpecificDetails?.poAmount || 0).toLocaleString("en-IN")}
																			</Typography>

																			{poSpecificDetails?.currency && (
																				<>
																					<Typography sx={{ color: '#666', ml: 3 }}>
																						Currency
																					</Typography>

																					<Typography sx={{ ml: 1 }}>
																						{poSpecificDetails.currency}
																					</Typography>
																				</>
																			)}
																		</Box>
																		<Box display="flex" alignItems="center">
																			<Typography sx={{ color: '#666', width: 100 }}>
																				Expiry Date
																			</Typography>
																			{isDraft ? (
																				<TextField
																					type="date"
																					size="small"
																					value={expiryDate ? new Date(expiryDate).toISOString().slice(0, 10) : ''}
																					onChange={(e) => setExpiryDate(e.target.value ? new Date(e.target.value) : null)}
																					InputLabelProps={{ shrink: true }}
																					sx={{ width: 200, '& .MuiOutlinedInput-input': { padding: '4px 8px', fontSize: 14 } }}
																				/>
																			) : (
																				<Typography>
																					{expiryDate || poSpecificDetails?.expiryDate
																						? formatDateViaTimeZone(
																							expiryDate ?? poSpecificDetails?.expiryDate,
																							"en-GB",
																							formatoption
																						)
																						: ''}
																				</Typography>
																			)}
																		</Box>

																	</Box>
																</Grid>

																{/* RIGHT SIDE */}
																{/* RIGHT SIDE */}
																<Grid item xs={12} md={6}>
																	<Box>

																		<Box display="flex" mb={0.5}>
																			<Typography sx={{ color: '#666', width: 140 }}>
																				Supplier Company
																			</Typography>
																			<Typography>
																				{poSpecificDetails?.company || ''}
																			</Typography>
																		</Box>

																		<Box display="flex" mb={0.5}>
																			<Typography sx={{ color: '#666', width: 140 }}>
																				GST
																			</Typography>
																			<Typography>
																				{poSpecificDetails?.supplierGST || ''}
																			</Typography>
																		</Box>

																		<Box display="flex" mb={0.5}>
																			<Typography sx={{ color: '#666', width: 140 }}>
																				PAN
																			</Typography>
																			<Typography>
																				{poSpecificDetails?.panNumber || ''}
																			</Typography>
																		</Box>

																		{poSpecificDetails?.supplierAddress && (
																			<Box display="flex" mb={0.5}>
																				<Typography
																					sx={{
																						color: '#666',
																						width: 140,
																						flexShrink: 0
																					}}
																				>
																					Supplier Address
																				</Typography>

																				<Typography
																					sx={{
																						flex: 1,
																						minWidth: 0
																					}}
																				>
																					{(() => {
																						const address = poSpecificDetails.supplierAddress;
																						const commaIndex = address.indexOf(',');

																						if (commaIndex === -1) {
																							return address;
																						}

																						const firstLine = address.substring(0, commaIndex + 1).trim();
																						const secondLine = address.substring(commaIndex + 1).trim();

																						return (
																							<>
																								<span style={{ whiteSpace: 'nowrap' }}>
																									{firstLine}
																								</span>
																								<br />
																								<span>
																									{secondLine}
																								</span>
																							</>
																						);
																					})()}
																				</Typography>
																			</Box>
																		)}




																	</Box>
																</Grid>


															</Grid>

														</CardContent>
													</Card>
												</Grid>
											</Grid>
										</div>
										{!isPoDetailsReadDisabled ? (
											<>
												<div className="p-2">
													<div className="row g-3">

														<div className={poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 ? "col-12 col-md-6" : "col-12 col-md-6"}>
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
																						setBillToCountry(poSpecificDetails?.billToCountry || "");
																						// Pre-fill country/state/city objects for cascading dropdowns
																						const cObj = addressCountryOptions.find(o => o.countryName === poSpecificDetails?.billToCountry) ?? null;
																						setBillToCountryObj(cObj);
																						setBillToStateObj(null); setBillToCityObj(null); setBillStateOptions([]); setBillCityOptions([]);
																						if (cObj?.id) fetchStates(cObj.id, atoken).then(res => {
																							if (res) {
																								setBillStateOptions(res);
																								const sObj = res.find(o => o.stateName === poSpecificDetails?.billToState) ?? null;
																								setBillToStateObj(sObj);
																								if (sObj?.id) fetchCities(sObj.id, atoken).then(cr => {
																									if (cr) { setBillCityOptions(cr); setBillToCityObj(cr.find(o => o.cityName === poSpecificDetails?.billToCity) ?? null); }
																								});
																							}
																						});
																						setOpenEditBill(true);
																					}}>
																						<HiPencilAlt className="f17 text-primary" />
																					</IconButton>
																				</Tooltip>
																			</Box>
																		)}
																	</Box>

																	{poSpecificDetails?.billToAddress && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			{poSpecificDetails.billToAddress}
																		</Typography>
																	)}
																	{(poSpecificDetails?.billToCity || poSpecificDetails?.billToState) && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			{poSpecificDetails?.billToCity}
																			{poSpecificDetails?.billToState ? `, ${poSpecificDetails.billToState}` : ''}
																		</Typography>
																	)}
																	{poSpecificDetails?.billToCountry && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
																			{poSpecificDetails.billToCountry}
																		</Typography>
																	)}
																	{poSpecificDetails?.billToPhone && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			<strong>Phone:</strong> {poSpecificDetails.billToPhone}
																		</Typography>
																	)}
																	{poSpecificDetails?.billToEmail && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			<strong>E-Mail:</strong> {poSpecificDetails.billToEmail}
																		</Typography>
																	)}
																	{poSpecificDetails?.billToPAN && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			<strong>PAN:</strong> {poSpecificDetails.billToPAN}
																		</Typography>
																	)}
																	{poSpecificDetails?.billToGST && (
																		<Typography variant="body2" sx={{ color: '#666' }}>
																			<strong>GST:</strong> {poSpecificDetails.billToGST}
																		</Typography>
																	)}
																</CardContent>
															</Card>
														</div>

														<div className={poSpecificDetails?.poConditions && poSpecificDetails.poConditions.length > 0 ? "col-12 col-md-6" : "col-12 col-md-6"}>
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
																						setShipToCountry(poSpecificDetails?.shipToCountry || "");
																						// Pre-fill country/state/city objects for cascading dropdowns
																						const cObjS = addressCountryOptions.find(o => o.countryName === poSpecificDetails?.shipToCountry) ?? null;
																						setShipToCountryObj(cObjS);
																						setShipToStateObj(null); setShipToCityObj(null); setShipStateOptions([]); setShipCityOptions([]);
																						if (cObjS?.id) fetchStates(cObjS.id, atoken).then(res => {
																							if (res) {
																								setShipStateOptions(res);
																								const sObjS = res.find(o => o.stateName === poSpecificDetails?.shipToState) ?? null;
																								setShipToStateObj(sObjS);
																								if (sObjS?.id) fetchCities(sObjS.id, atoken).then(cr => {
																									if (cr) { setShipCityOptions(cr); setShipToCityObj(cr.find(o => o.cityName === poSpecificDetails?.shipToCity) ?? null); }
																								});
																							}
																						});
																						setOpenEditShip(true);
																					}}>
																						<HiPencilAlt className="f17 text-primary" />
																					</IconButton>
																				</Tooltip>
																			</Box>
																		)}
																	</Box>

																	{poSpecificDetails?.shipToAddress && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			{poSpecificDetails.shipToAddress}
																		</Typography>
																	)}
																	{(poSpecificDetails?.shipToCity || poSpecificDetails?.shipToState) && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			{poSpecificDetails?.shipToCity}
																			{poSpecificDetails?.shipToState ? `, ${poSpecificDetails.shipToState}` : ''}
																		</Typography>
																	)}
																	{poSpecificDetails?.shipToCountry && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
																			{poSpecificDetails.shipToCountry}
																		</Typography>
																	)}
																	{poSpecificDetails?.shipToPhone && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			<strong>Phone:</strong> {poSpecificDetails.shipToPhone}
																		</Typography>
																	)}
																	{poSpecificDetails?.shipToEmail && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			<strong>Email:</strong> {poSpecificDetails.shipToEmail}
																		</Typography>
																	)}
																	{poSpecificDetails?.shipToPAN && (
																		<Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
																			<strong>PAN:</strong> {poSpecificDetails.shipToPAN}
																		</Typography>
																	)}
																	{poSpecificDetails?.shipToGST && (
																		<Typography variant="body2" sx={{ color: '#666' }}>
																			<strong>GST:</strong> {poSpecificDetails.shipToGST}
																		</Typography>
																	)}
																</CardContent>
															</Card>
														</div>





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

												{/* PO Header Conditions Grid */}
												<div className="p-3">
													<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
														<Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
															<Box component="span" sx={{ width: 4, height: 24, bgcolor: '#1976d2', borderRadius: 1 }} />
															PO Conditions
														</Typography>
														{String(currentStage ?? "").toLowerCase().includes("draft") && (
															<Button
																variant="contained"
																size="small"
																startIcon={<span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>}
																onClick={handleOpenAddCondition}
															>
																Add New Condition
															</Button>
														)}
													</Box>
													<Box sx={{ width: '100%' }}>
														<DataGrid
															rows={(poSpecificDetails?.poConditions ?? []).filter(c => c.isHeaderCondition).map((c, i) => ({ ...c, _gridId: c.id ?? i }))}
															getRowId={(row) => row._gridId}
															columns={[
																{ field: 'conditionCategory', headerName: 'Condition Category', flex: 1, minWidth: 150 },
																{
																	field: 'conditionValue',
																	headerName: 'Value',
																	flex: 1,
																	minWidth: 200,
																	renderCell: (params) => {
																		const { conditionText, conditionValue } = params.row;
																		// Priority: conditionText (if non-empty) > conditionValue (including 0) > '-'
																		if (conditionText && conditionText.trim()) {
																			return conditionText;
																		}
																		if (conditionValue !== null && conditionValue !== undefined && conditionValue !== '') {
																			return conditionValue;
																		}
																		return '-';
																	}
																},
																...(String(currentStage ?? "").toLowerCase().includes("draft") ? [{

																	field: '_actions',
																	headerName: 'Actions',
																	width: 120,
																	sortable: false,
																	disableColumnMenu: true,
																	renderCell: (params) => (
																		<Box sx={{ display: 'flex', gap: 0.5 }}>
																			<Tooltip title="Edit Condition">
																				<IconButton
																					size="small"
																					onClick={() => {
																						const condition = params.row;
																						setIsAddingCondition(false);
																						setEditingCondition(condition);
																						setConditionForm({
																							conditionType: condition.conditionType || "",
																							conditionCategory: condition.conditionCategory || "",
																							conditionRate: condition.conditionRate ?? "",
																							conditionValue: condition.conditionValue ?? "",
																							currency: condition.currency || "",
																							calculationType: condition.calculationType || "",
																							conditionText: condition.conditionText || "",
																						});
																						setOpenEditCondition(true);
																					}}
																				>
																					<HiPencilAlt className="f17 text-primary" />
																				</IconButton>
																			</Tooltip>
																			<Tooltip title="Delete Condition">
																				<IconButton
																					size="small"
																					onClick={() => {
																						setConditionToDelete(params.row);
																						setDeleteConditionDialogOpen(true);
																					}}
																				>
																					<HiOutlineTrash className="f17 text-danger" />
																				</IconButton>
																			</Tooltip>
																		</Box>
																	),
																}] : []),
															]}
															autoHeight
															disableRowSelectionOnClick
															rowHeight={48}
															columnHeaderHeight={48}
															sx={{
																border: '1px solid #e0e0e0',
																borderRadius: 2,
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
															}}
														/>
													</Box>
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
											{addFlowMode && (
												<Box sx={{
													mb: 2, p: 1.5, borderRadius: 1,
													bgcolor: '#eef4ff', border: '1px solid #c7dcfb',
													display: 'flex', alignItems: 'center', justifyContent: 'space-between',
													flexWrap: 'wrap', gap: 1
												}}>
													<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1976d2' }}>
														Select line items for {ADD_FLOW_LABEL[addFlowMode]}
														{addFlowSelectedItems.length > 0 ? ` — ${addFlowSelectedItems.length} selected` : ''}
													</Typography>
													{addFlowSelectedItems.length > 0 && (
														<Box sx={{ display: 'flex', gap: 1 }}>
															<Button
																size="small"
																variant="outlined"
																onClick={cancelAddFlow}
																sx={{ textTransform: 'none' }}
															>
																Back
															</Button>
															<Button
																size="small"
																variant="contained"
																onClick={handleAddFlowNext}
																sx={{ textTransform: 'none' }}
															>
																Next
															</Button>
														</Box>
													)}
												</Box>
											)}
											<POItemList
												items={displayPOItems}
												shipments={allPOShipHeader}
												currentStage={currentStage}
												poId={pageSlug}
												customerId={poCustomerId ?? customerid}
												apiClient={apiClient}
												atoken={atoken}
												itemConditions={poSpecificDetails?.poItemConditions ?? []}
												selectionMode={!!addFlowMode}
												selectedItemIds={addFlowSelectedItems.map(i => i.id)}
												onToggleSelectItem={handleAddFlowToggleItem}
												onToggleSelectAll={handleAddFlowToggleAll}
												isItemSelectable={(item) => !addFlowMode || isItemEligibleForAddMode(addFlowMode, item)}
												isItemGrnAddAllowed={(item) => isItemEligibleForAddMode('GRN', item)}
												deliveryUpdates={deliveryUpdates}
												onEditDeliveryDate={(item, newDate) => {
													setDeliveryDialogRow(item);
													// Seed the confirm dialog with the date just picked inline
													// (fall back to the staged/saved date when not provided).
													setDeliveryDialogDate(
														newDate
															? new Date(newDate)
															: (deliveryUpdates[item.id] ?? (item.poDeliveryDate ? new Date(item.poDeliveryDate) : null))
													);
													setDeliveryDialogOpen(true);
												}}
												onAddASN={(canCreateAsn && !isUnderApprovalStage) ? ((item) => {
													handleOpenAddAsnDrawer([item]);
												}) : undefined}
												onAddGRN={(canCreateGrn && !isUnderApprovalStage) ? ((item) => {
													const eligibleItems = getEligibleItemsForAddMode('GRN', [item]);
													if (eligibleItems.length === 0) {
														toast.warning(NO_REMAINING_ITEM_MSG_GRN);
														return;
													}
													setPOOrderItems(item);
													SetRef_ItemId(item.id);
													setSelectedGrnItems(eligibleItems);
													setAddGrnDialogOpen(true);
												}) : undefined}
												// onAddInvoice={(item) => {
												// 	handleOpenAddInvoiceDrawer([item]);
												// }}
												onAddInvoice={
													(canCreateInvoice && !isUnderApprovalStage)
														? (item) => {
															handleOpenAddInvoiceDrawer([item]);
														}
														: undefined
												}
												onAddSES={(canCreateSes && !isUnderApprovalStage) ? ((item) => {
													const eligibleItems = getEligibleItemsForAddMode('SES', [item]);
													if (eligibleItems.length === 0) {
														toast.warning(NO_REMAINING_ITEM_MSG_SES);
														return;
													}
													setPOOrderItems(item);
													SetRef_ItemId(item.id);
													setSelectedSesItems(eligibleItems);
													setAddSesDialogOpen(true);
												}) : undefined}
												onPreviewSES={(ses) => {
													const matchedItem = allPOItems.find(it => String(it.id) === String(ses.poItemId));
													setSesDialogMode('preview');
													setSesPreviewData(ses);
													setSelectedSesItems(matchedItem ? [matchedItem] : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service'));
													setAddSesDialogOpen(true);
												}}
												onAddAdvanceInvoice={(item) => {
													setPOOrderItems(item);
													SetRef_ItemId(item.id);
													toggleDrawer("openCreateSheet", true, item)();
												}}
												onAddPayment={canCreatePayment ? ((item) => {
													setPOOrderItems(item);
													SetRef_ItemId(item.id);
													setPaymentTargetItem(item);
													resetPaymentForm();
													setOpenAddPaymentDrawer(true);
												}) : undefined}
												onViewInvoice={(invoice) => {
													handlePreviewInvoice(invoice);
												}}
												onViewASN={(asn) => {
													handlePreviewAsn(asn);
												}}
												onViewPayment={(payment) => {
													if (payment.invoiceHId || payment.invoiceHid) {
														fetchPaymentDetails(payment.invoiceHId || payment.invoiceHid);
													} else {
														toast.warning('No invoice associated with this payment.');
													}
												}}
												onDownloadInvoice={(invoice) => {
													if (invoice.invoicePath && invoice.invoiceFile) {
														downloadFilesOnAzure(
															invoice.invoicePath,
															getFileName(invoice.invoiceFile),
															atoken
														);
													} else {
														toast.warning('Invoice document not available for download.');
													}
												}}
											/>
										</div>
									) : (
										<div className="p-4">
											<Alert severity="error">
												<div className="d-flex align-items-center">
													<HiOutlineX className="me-2 f18" />
													Access Denied: You don't have permission to view Line Items.
												</div>
											</Alert>
										</div>
									)
								) : null}
								{value == 10 ? (
									// Preview content
									<div className="p-3">
										<POPreview
											poDetails={poSpecificDetails}
											poItems={allPOItems}
											atoken={atoken}
											requestCell={requestCell}
											stagelist={stagelist}
											customerid={customerid}
											customersuffix={customersuffix}
										/>
									</div>
								) : null}
								{/* ASN Tab Content */}
								{/* ASN Tab Content - Only for Material Items. Hidden entirely for customerId === 78. */}
								{value == 2 && Number(poCustomerId ?? customerid) !== 78 && allPOItems?.some(item => item.itemType?.toLowerCase() !== 'service') ? (
									<div className="p-3">
										<Box sx={{ mb: 4 }}>
											<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
												<Typography variant="h6" sx={{ fontWeight: 600 }}>ASN (Advanced Shipping Notice)</Typography>
												{!isShippedHistoryCreateDisabled && canCreateAsn && (
													renderAddFlowButton('ASN', 'Add ASN')
												)}
											</Box>
											<Box>
												{(poAsnList ?? allPOShipHeader)?.length > 0 ? (
													<TableContainer component={Paper} variant="outlined">
														<Table size="small">
															<TableHead>
																<TableRow>
																	<TableCell>ASN Number</TableCell>
																	<TableCell>Shipping Date</TableCell>
																	{/* <TableCell>Total Shipped Qty</TableCell> */}
																	<TableCell>Status</TableCell>
																	<TableCell align="center"></TableCell>
																</TableRow>
															</TableHead>
															<TableBody>
																{(poAsnList ?? allPOShipHeader).map((row, idx) => (
																	<TableRow key={row.id ?? idx} hover>
																		<TableCell>{row.shipSlipId ?? row.asnNumber ?? row.id ?? '—'}</TableCell>
																		<TableCell>{row.shippingDate ? formatDateViaTimeZone(row.shippingDate, 'en-GB', formatoption) : '—'}</TableCell>
																		{/* <TableCell>{row.quantity ?? '—'}</TableCell> */}
																		<TableCell>{row.status ?? '—'}</TableCell>
																		<TableCell align="center">
																			<IconButton
																				size="small"
																				sx={{ color: '#1976d2' }}
																				onClick={() => handlePreviewAsn(row)}
																			>
																				<HiOutlineEye />
																			</IconButton>
																		</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</TableContainer>
												) : (
													<Alert severity="info">No ASN records found.</Alert>
												)}
											</Box>
										</Box>


									</div>
								) : null}
								{/* GRN Tab Content - Only for Material Items */}
								{value == 3 && allPOItems?.some(item => item.itemType?.toLowerCase() !== 'service') ? (
									<div className="p-3">
										{/* Existing GRNs Section */}
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												mb: 2,
											}}
										>
											<Typography variant="h6" sx={{ fontWeight: 600 }}>
												GRN (Goods Receipt Note)
											</Typography>

											<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
												{/* {!isShippedHistoryCreateDisabled && canCreateGrn && (poAsnList?.length > 0) && (
            renderAddFlowButton("GRN", "Add GRN")
        )} */}
												{!isShippedHistoryCreateDisabled && canCreateGrn && (
													renderAddFlowButton("GRN", "Add GRN")
												)}

												<Tooltip title="Download GRN Report">
													{/* {poGrnList?.length > 0 && (
        <Tooltip title="Download GRN Report">
            <IconButton
                onClick={() => handleDownloadGrnReport(pageSlug)}
                disabled={loadingGrnReport}
            >
                <DownloadIcon sx={{ color: "#000" }} />
            </IconButton>
        </Tooltip>
    )} */}
												</Tooltip>
											</Box>
										</Box>
										<Box sx={{ mb: 4 }}>
											{/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
												<Typography variant="h6" sx={{ fontWeight: 600 }}>GRN (Goods Receipt Note)</Typography>
												{!isShippedHistoryCreateDisabled && canCreateGrn && (
													renderAddFlowButton('GRN', 'Add GRN')
												)}
											</Box> */}
											<Box>
												{poGrnList?.length > 0 ? (
													<TableContainer component={Paper} variant="outlined">
														<Table size="small">
															<TableHead>
																<TableRow>
																	<TableCell sx={{ width: 40 }} />
																	<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>GRN Number</TableCell>
																	<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>GRN Date</TableCell>
																	<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Invoice No.</TableCell>
																	<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Invoice Date</TableCell>
																	{/* <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Received Qty</TableCell> */}
																	<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>GRN Status</TableCell>
																	<TableCell sx={{ fontWeight: 600, fontSize: 12, width: 80 }}></TableCell>
																</TableRow>
															</TableHead>
															<TableBody>
																{poGrnList.flatMap((hdr, hIdx) => {
																	const items = Array.isArray(hdr.grnItem)
																		? hdr.grnItem
																		: (Array.isArray(hdr.grnItems) ? hdr.grnItems : []);

																	const headerKey = hdr.id ?? hdr.grnNumber ?? hIdx;

																	if (items.length === 0) {
																		return [
																			<TableRow key={`${headerKey}-empty`} hover>
																				<TableCell />
																				<TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
																					{hdr.grnNumber ?? '—'}
																				</TableCell>
																				<TableCell>
																					{hdr.grnDate ? formatDateViaTimeZone(hdr.grnDate, 'en-GB', formatoption) : '—'}
																				</TableCell>
																				<TableCell>{hdr.invoiceNo ?? '—'}</TableCell>
																				<TableCell>
																					{hdr.invoiceDate ? formatDateViaTimeZone(hdr.invoiceDate, 'en-GB', formatoption) : '—'}
																				</TableCell>
																				<TableCell colSpan={2} align="center" sx={{ color: '#999', fontSize: 12 }}>
																					No line items found for this GRN
																				</TableCell>
																				<TableCell>
																					<Tooltip title="Download GRN Report">
																						<IconButton
																							size="small"
																							onClick={() => handleDownloadIndividualGrnReport(hdr)}
																							disabled={downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId)}
																						>
																							{downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId) ? (
																								<CircularProgress size={18} />
																							) : (
																								<DownloadIcon sx={{ color: '#000' }} />
																							)}
																						</IconButton>
																					</Tooltip>
																				</TableCell>
																			</TableRow>
																		];
																	}

																	const rowKey = `${headerKey}`;
																	const isExpanded = expandedGrnHeaderIds.has(rowKey);

																	const receivedQty = items.reduce(
																		(sum, x) => sum + Number(x.receivedQty ?? 0),
																		0
																	);

																	const acceptedQty = items.reduce(
																		(sum, x) => sum + Number(x.acceptedQty ?? 0),
																		0
																	);

																	const rejectedQty = items.reduce(
																		(sum, x) => sum + Number(x.rejectedQty ?? 0),
																		0
																	);

																	return [
																		<React.Fragment key={rowKey}>
																			<TableRow hover>
																				<TableCell>
																					<IconButton
																						size="small"
																						onClick={() => toggleGrnHeaderExpand(rowKey)}
																					>
																						{isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
																					</IconButton>
																				</TableCell>

																				<TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>
																					{hdr.grnNumber ?? '—'}
																				</TableCell>

																				<TableCell>
																					{hdr.grnDate
																						? formatDateViaTimeZone(hdr.grnDate, 'en-GB', formatoption)
																						: '—'}
																				</TableCell>

																				<TableCell>{hdr.invoiceNo ?? '—'}</TableCell>
																				<TableCell>
																					{hdr.invoiceDate
																						? formatDateViaTimeZone(hdr.invoiceDate, 'en-GB', formatoption)
																						: '—'}
																				</TableCell>

																				{/* <TableCell>{receivedQty}</TableCell> */}
																				<TableCell>{hdr.grnStatus ?? '—'}</TableCell>
																				<TableCell>
																					<Tooltip title="Download GRN Report">
																						<IconButton
																							size="small"
																							onClick={() => handleDownloadIndividualGrnReport(hdr)}
																							disabled={downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId)}
																						>
																							{downloadingGrnId === (hdr.id ?? hdr.grnId ?? hdr.grnHId) ? (
																								<CircularProgress size={18} />
																							) : (
																								<DownloadIcon sx={{ color: '#000' }} />
																							)}
																						</IconButton>
																					</Tooltip>
																				</TableCell>
																				{/* <TableCell>{rejectedQty}</TableCell> */}
																			</TableRow>

																			<TableRow>
																				<TableCell
																					style={{ paddingBottom: 0, paddingTop: 0 }}
																					colSpan={7}
																				>
																					<Collapse in={isExpanded} timeout="auto" unmountOnExit>
																						<Box sx={{ m: 1, ml: 5 }}>
																							<Table size="small">
																								<TableHead>
																									<TableRow>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Code</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item No</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Name</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Description</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Ordered Qty</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Received Qty</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Accepted Qty</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Rejected Qty</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Remaining Qty</TableCell>
																										<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>UOM</TableCell>
																										{/* <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Status</TableCell> */}
																									</TableRow>
																								</TableHead>

																								<TableBody>
																									{items.map((gi, idx) => {
																										const poItem =
																											allPOItems.find(p => p.id === gi.poItemId) || {};

																										const orderedQty = Number(
																											gi.orderedQty ?? poItem.quantity ?? 0
																										);

																										// const receivedItemQty = Number(gi.receivedQty ?? 0);
																										const receivedItemQty = poItem.receivedQty ?? 0;
																										const acceptedItemQty = Number(gi.acceptedQty ?? 0);
																										const rejectedItemQty = Number(gi.rejectedQty ?? 0);
																										const remainingQty = Math.max(
																											receivedItemQty - acceptedItemQty,
																											0
																										);

																										const uom = gi.uom ?? poItem.uom ?? 'NOS';

																										return (
																											<TableRow key={gi.id ?? idx} hover>

																												<TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
																													{gi.itemCode ?? poItem.itemCode ?? '—'}
																												</TableCell>

																												<TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
																													{gi.lineItemNo ?? '—'}
																												</TableCell>

																												<TableCell>
																													{gi.itemName ?? poItem.itemName ?? '—'}
																												</TableCell>

																												<TableCell>
																													{gi.itemDescription ?? poItem.itemDesc ?? '—'}
																												</TableCell>

																												<TableCell>
																													{orderedQty} {uom}
																												</TableCell>

																												<TableCell>
																													{receivedItemQty} {uom}
																												</TableCell>

																												<TableCell>
																													{acceptedItemQty} {uom}
																												</TableCell>

																												<TableCell>
																													{rejectedItemQty} {uom}
																												</TableCell>

																												<TableCell>
																													<Chip
																														label={`${remainingQty} ${uom}`}
																														size="small"
																														sx={{
																															bgcolor: remainingQty > 0 ? '#e3f2fd' : '#f5f5f5',
																															color: remainingQty > 0 ? '#1976d2' : '#999',
																															fontWeight: 600,
																															fontSize: 11,
																														}}
																													/>
																												</TableCell>

																												<TableCell>
																													{uom}
																												</TableCell>

																												{/* <TableCell>
										<Chip
											label={hdr.grnStatus ?? gi.qcResult ?? 'Shipped'}
											size="small"
											sx={{
												bgcolor: '#f5f5f5',
												color: '#666',
												fontSize: 11
											}}
										/>
									</TableCell> */}

																											</TableRow>
																										);
																									})}
																								</TableBody>
																							</Table>
																						</Box>
																					</Collapse>
																				</TableCell>
																			</TableRow>
																		</React.Fragment>
																	];
																})}
															</TableBody>
														</Table>
													</TableContainer>
												) : (
													<Alert severity="info">No GRN records found for this PO.</Alert>
												)}
											</Box>
										</Box>


									</div>
								) : null}
								{/* Service Entry Tab Content - Only for Service Items */}
								{value == 4 && allPOItems?.some(item => item.itemType?.toLowerCase() === 'service') ? (
									<div className="p-3">
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
											<Typography variant="h6" sx={{ fontWeight: 600 }}>SES Details</Typography>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												{!isShippedHistoryCreateDisabled && canCreateSes && (
													renderAddFlowButton('SES', 'Add SES')
												)}
												{poSesList?.length > 0 && (
													<Tooltip title="Download SES Report">
														<IconButton
															onClick={() => handleDownloadSesReport(pageSlug)}
															disabled={loadingGrnReport}
														>
															<DownloadIcon sx={{ color: '#000' }} />
														</IconButton>
													</Tooltip>
												)}
											</Box>
										</Box>
										{poSesList?.length > 0 ? (
											<TableContainer component={Paper} variant="outlined">
												<Table size="small">
													<TableHead>
														<TableRow>
															<TableCell sx={{ width: 40 }} />
															<TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>SES Number</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Service Start Date</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Service End Date</TableCell>
															{/* <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Approval Status</TableCell> */}
															{/* <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Quantity</TableCell> */}
															{/* <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Accepted Quantity</TableCell> */}
															<TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8' }}>Service Amount</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#555', bgcolor: '#f8f8f8', textAlign: 'center' }}></TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{poSesList.flatMap((s, i) => {
															// The item-level breakdown is expected under `sesItem` (singular).
															const items = Array.isArray(s.sesItem)
																? s.sesItem
																: (Array.isArray(s.sesItems) ? s.sesItems : []);
															const headerKey = s.id ?? s.sesNumber ?? i;

															// If a header somehow has no items, still show it as a single row
															// rather than silently dropping it.
															if (items.length === 0) {
																return [
																	<TableRow key={`${headerKey}-empty`} hover>
																		<TableCell />
																		<TableCell sx={{ fontSize: 12 }}>
																			<Typography sx={{ color: '#1976d2', fontSize: 12 }}>{s.sesNumber ?? '—'}</Typography>
																		</TableCell>
																		<TableCell sx={{ fontSize: 12 }}>{s.servicePeriodFrom ? formatDateViaTimeZone(s.servicePeriodFrom, 'en-GB', formatoption) : '—'}</TableCell>
																		<TableCell sx={{ fontSize: 12 }}>{s.servicePeriodTo ? formatDateViaTimeZone(s.servicePeriodTo, 'en-GB', formatoption) : '—'}</TableCell>
																		{/* <TableCell sx={{ fontSize: 12 }}>
																				<Chip
																					label={s.approvalStatus ?? s.status ?? '—'}
																					size="small"
																					sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f5f5f5', color: '#616161' }}
																				/>
																			</TableCell> */}
																		<TableCell colSpan={4} align="center" sx={{ color: '#999', fontSize: 12 }}>
																			No line items found for this SES
																		</TableCell>
																	</TableRow>
																];
															}

															// One sesItem = one expandable parent row. Header info repeats per row.
															return items.map((si, idx) => {
																const rowKey = `${headerKey}-${si.id ?? idx}`;
																const isExpanded = expandedSesHeaderIds.has(rowKey);
																const poItem = allPOItems.find(p => p.id === si.poItemId) || {};
																const uom = si.uom ?? poItem.uom ?? '—';
																// Quantity tracking for the expanded line item view.
																const orderedQtyRaw = si.orderedQty ?? poItem.orderedQuantity ?? poItem.quantity;
																const orderedQty = orderedQtyRaw != null ? Number(orderedQtyRaw) : null;
																const receivedQty = poItem.receivedQty != null
																	? Number(poItem.receivedQty)
																	: null;
																// const receivedQty = si.serviceQty != null ? Number(si.serviceQty) : (si.quantity != null ? Number(si.quantity) : null);
																const acceptedQty = si.acceptedQty != null ? Number(si.acceptedQty) : null;
																const remainingQty = orderedQty != null ? Math.max(orderedQty - (acceptedQty ?? 0), 0) : null;

																return (
																	<React.Fragment key={rowKey}>
																		<TableRow hover>
																			<TableCell>
																				<IconButton
																					size="small"
																					onClick={() => toggleSesHeaderExpand(rowKey)}
																				>
																					{isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
																				</IconButton>
																			</TableCell>
																			<TableCell sx={{ fontSize: 12 }}>
																				<Typography sx={{ color: '#1976d2', fontSize: 12 }}>{s.sesNumber ?? '—'}</Typography>
																			</TableCell>
																			<TableCell sx={{ fontSize: 12 }}>{s.servicePeriodFrom ? formatDateViaTimeZone(s.servicePeriodFrom, 'en-GB', formatoption) : '—'}</TableCell>
																			<TableCell sx={{ fontSize: 12 }}>{s.servicePeriodTo ? formatDateViaTimeZone(s.servicePeriodTo, 'en-GB', formatoption) : '—'}</TableCell>
																			{/* <TableCell sx={{ fontSize: 12 }}>
																					<Chip
																						label={s.approvalStatus ?? s.status ?? '—'}
																						size="small"
																						sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#f5f5f5', color: '#616161' }}
																					/>
																				</TableCell> */}
																			{/* <TableCell sx={{ fontSize: 12 }}>{si.serviceQty ?? '—'}</TableCell> */}
																			{/* <TableCell sx={{ fontSize: 12 }}>{si.acceptedQty ?? '—'}</TableCell> */}
																			<TableCell sx={{ fontSize: 12 }}>{si.serviceAmount != null ? Number(si.serviceAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}</TableCell>
																			<TableCell sx={{ textAlign: 'center' }}>
																				<Button
																					size="small"

																					sx={{ textTransform: 'none', fontSize: 11, py: 0.25, px: 1 }}
																					onClick={() => {
																						// Header (s) must win for servicePeriodFrom/To, sesNumber, sesDate —
																						// those are null on the item (si), so spreading si last would blank
																						// them out. Item-only fields (poItemId, acceptedQty, serviceQty, ...)
																						// still come through since the header object has no such keys.
																						const sesPayload = { ...si, ...s };
																						const matchedItem = allPOItems.find(p => p.id === si.poItemId);
																						setSesDialogMode('preview');
																						setSesPreviewData(sesPayload);
																						setSelectedSesItems(matchedItem ? [matchedItem] : allPOItems.filter(item => item.itemType?.toLowerCase() === 'service'));
																						setAddSesDialogOpen(true);
																					}}
																				>

																					<HiOutlineEye
																						size={14}
																						style={{ color: '#1976d2' }}
																					/>
																				</Button>
																			</TableCell>
																		</TableRow>
																		<TableRow>
																			<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
																				<Collapse in={isExpanded} timeout="auto" unmountOnExit>
																					<Box sx={{ m: 1, ml: 5 }}>
																						<Table size="small">
																							<TableHead>
																								<TableRow>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Code</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item No</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Name</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Item Description</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Ordered Qty</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Received Qty</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Accepted Qty</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Remaining Qty</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>UOM</TableCell>
																									<TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Status</TableCell>
																								</TableRow>
																							</TableHead>

																							<TableBody>
																								<TableRow hover>
																									<TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
																										{poItem.itemCode ?? '—'}
																									</TableCell>

																									<TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>
																										{si.lineItemNo ?? si.itemNo ?? poItem.itemNo ?? '—'}
																									</TableCell>

																									<TableCell>
																										{si.itemName ?? poItem.itemName ?? '—'}
																									</TableCell>

																									<TableCell>
																										{si.itemDescription ?? poItem.itemDesc ?? poItem.materialDescription ?? '—'}
																									</TableCell>

																									<TableCell>
																										{orderedQty != null ? orderedQty : '—'}
																									</TableCell>

																									<TableCell>
																										{receivedQty != null ? receivedQty : '—'}
																									</TableCell>

																									<TableCell>
																										{acceptedQty != null ? acceptedQty : '—'}
																									</TableCell>

																									<TableCell>
																										{remainingQty != null ? remainingQty : '—'}
																									</TableCell>

																									<TableCell>
																										{uom}
																									</TableCell>

																									<TableCell>
																										<Chip
																											label={si.acceptanceStatus ?? s.approvalStatus ?? '—'}
																											size="small"
																											sx={{
																												fontSize: 11,
																												fontWeight: 600,
																												bgcolor:
																													String(si.acceptanceStatus ?? '').toLowerCase() === 'accepted'
																														? '#e8f5e9'
																														: '#f5f5f5',
																												color:
																													String(si.acceptanceStatus ?? '').toLowerCase() === 'accepted'
																														? '#2e7d32'
																														: '#616161',
																											}}
																										/>
																									</TableCell>
																								</TableRow>
																							</TableBody>
																						</Table>
																					</Box>
																				</Collapse>
																			</TableCell>
																		</TableRow>
																	</React.Fragment>
																);
															});
														})}
													</TableBody>
												</Table>
											</TableContainer>
										) : (
											<Alert severity="info">No SES records found for this PO.</Alert>
										)}

										{/* Line Items Section - reference list; selecting items for a new SES now
										    happens on the PO Line Items tab (unified Add ASN/GRN/SES/Invoice flow). */}

									</div>
								) : null}
								{/* Invoices Tab Content */}
								{value == 5 ? (
									<div className="p-3">
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												mb: 2,
											}}
										>
											<Typography variant="h6" sx={{ fontWeight: 600 }}>
												Invoices
											</Typography>

											{!isShippedHistoryCreateDisabled && canCreateInvoice && (
												renderAddFlowButton("INVOICE", "Add Invoice")
											)}
										</Box>

										<Box>
											{canReadInvoice ? (
												poInvoiceList?.length > 0 ? (
													<TableContainer component={Paper} variant="outlined">
														<Table size="small">
															<TableHead>
																<TableRow>
																	<TableCell>Invoice Number</TableCell>
																	<TableCell>Invoice Date</TableCell>
																	<TableCell>Invoice Amount</TableCell>
																	<TableCell>Status</TableCell>
																	<TableCell align="center"></TableCell>
																</TableRow>
															</TableHead>

															<TableBody>
																{poInvoiceList.map((row, idx) => (
																	<TableRow key={idx} hover>
																		<TableCell>{row.invoiceNo ?? "—"}</TableCell>
																		<TableCell>
																			{row.invoiceDate
																				? formatDateViaTimeZone(
																					row.invoiceDate,
																					"en-GB",
																					formatoption
																				)
																				: "—"}
																		</TableCell>
																		<TableCell>{row.invoiceAmount ?? "—"}</TableCell>
																		<TableCell>
																			<Typography
																				sx={{
																					color: row.stage?.trim().toLowerCase() === "rejected" ? "red" : "inherit",
																					// fontWeight: row.stage?.trim().toLowerCase() === "rejected" ? 400 : 400
																				}}
																			>
																				{row.stage ?? "—"}
																			</Typography>
																		</TableCell>
																		{/* <TableCell>{row.stage ?? "—"}</TableCell> */}
																		<TableCell align="center">
																			<IconButton
																				size="small"
																				sx={{ color: "#1976d2" }}
																				onClick={() => handlePreviewInvoice(row)}
																			>
																				<HiOutlineEye />
																			</IconButton>
																		</TableCell>
																	</TableRow>
																))}
															</TableBody>
														</Table>
													</TableContainer>
												) : (
													<Alert severity="info">No Invoice records found.</Alert>
												)
											) : null}
										</Box>
									</div>
								) : null}
								{/* Advance Invoices Tab Content */}
								{/* {value == 6 ? (
									<div className="p-3">
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
											<Typography variant="h6" sx={{ fontWeight: 600 }}>Advance Invoices</Typography>
											{!isShippedHistoryCreateDisabled && (
												<Button size="small" variant="text" startIcon={<HiPlusSm />} sx={{ textTransform: 'none', fontSize: 12, color: '#1976d2' }}>
													Add Advance Invoice
												</Button>
											)}
										</Box>
										<Alert severity="info">No Advance Invoice records found.</Alert>
									</div>
								) : null} */}
								{/* Payments Tab Content */}
								{value == 7 ? (
									<div className="p-3">
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
											<Typography variant="h6" sx={{ fontWeight: 600 }}>Payments</Typography>
											{!isShippedHistoryCreateDisabled && canCreatePayment && (
												<Button
													size="small"
													variant="text"
													startIcon={<HiPlusSm />}
													sx={{ textTransform: 'none', fontSize: 12, color: '#1976d2' }}
													onClick={async () => {
														setPaymentTargetItem(null);
														resetPaymentForm();
														// Ensure invoice list is available for the Linked Invoice dropdown
														if ((!poInvoiceList || poInvoiceList.length === 0) && pageSlug) {
															try {
																const cid = poCustomerId ?? customerid;
																const res = await apiClient.get(
																	`/api/poinvoice/Find?poId=${pageSlug}&customerId=${cid}`,
																	atoken
																);
																if (Array.isArray(res)) setPoInvoiceList(res);
															} catch (e) {
																console.error('Failed to fetch invoices for payment', e);
															}
														}
														setOpenAddPaymentDrawer(true);
													}}
												>
													Add Payment
												</Button>
											)}
										</Box>
										{loadingPayments ? (
											<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
												<CircularProgress size={28} />
											</Box>
										) : paymentError ? (
											<Alert
												severity="error"
												action={
													<Button
														color="inherit"
														size="small"
														onClick={() => { paymentLoadedRef.current = false; fetchPayments(); }}
													>
														Retry
													</Button>
												}
											>
												{paymentError}
											</Alert>
										) : poPaymentList?.length > 0 ? (

											<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
												<Table size="small">
													<TableHead>
														<TableRow>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>SAP Doc Number</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Payment Date</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Payment Method</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>UTR Number</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Bank Reference</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Amount</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Status</TableCell>
															<TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="center"></TableCell>
														</TableRow>
													</TableHead>
													<TableBody>
														{poPaymentList.map((payment, idx) => (

															<TableRow key={payment.id || idx} hover>
																<TableCell sx={{ fontSize: 12 }}>{payment.invoiceNo || ' '}</TableCell>
																<TableCell sx={{ fontSize: 12 }}>{payment.paymentDate ? formatDateViaTimeZone(payment.paymentDate, 'en-GB', formatoption) : ' '}</TableCell>
																<TableCell sx={{ fontSize: 12 }}>{payment.paymentMethod || ' '}</TableCell>
																<TableCell sx={{ fontSize: 12 }}>{payment.utrNumber || ' '}</TableCell>
																<TableCell sx={{ fontSize: 12 }}>{payment.bankReference || ' '}</TableCell>
																<TableCell sx={{ fontSize: 12 }}>{payment.paymentAmount ?? ' '}</TableCell>
																<TableCell sx={{ fontSize: 12 }}>
																	<Chip
																		label={payment.paymentStatus || 'Pending'}
																		size="small"
																		sx={{
																			bgcolor: payment.paymentStatus?.toLowerCase() === 'completed' ? '#e8f5e9' : '#f5f5f5',
																			color: payment.paymentStatus?.toLowerCase() === 'completed' ? '#2e7d32' : '#666',
																			fontWeight: 600,
																			fontSize: 11
																		}}
																	/>
																</TableCell>
																<TableCell align="center">
																	<Tooltip title="View">
																		<IconButton
																			size="small"
																			sx={{ color: '#1976d2' }}
																			onClick={() => {
																				setPaymentDetails({ ...payment, __source: 'paymentheader' });
																				setState(prevState => ({ ...prevState, openPaymentDetails: true }));
																			}}
																		>
																			<HiOutlineEye />
																		</IconButton>
																	</Tooltip>
																</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</TableContainer>
										) : (
											<Alert severity="info">No Payment records found for this PO.</Alert>
										)}
									</div>
								) : null}
								{/* Documents Tab Content */}
								{/* {value == 8 ? (
									<div className="p-3">
										<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Documents</Typography>
										<Alert severity="info">No documents available.</Alert>
									</div>
								) : null} */}
								{/* History Tab Content */}
								{/* {value == 9 ? (
									<div className="p-3">
										<Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>History</Typography>
										<Alert severity="info">No history available.</Alert>
									</div>
								) : null} */}
								{/* Original Shipped History - now removed, content split into tabs above */}
								{false && value == 2 ? (
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
																			<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
																				{!isServiceRow(row) && row.shipmentDetails?.some(item => item.grnNumber) && (
																					<>
																						<IconButton
																							size="small"
																							onClick={(e) => handleGrnMenuOpen(e, row)}
																							sx={{ color: '#1976d2' }}
																						>
																							<MoreVertIcon />
																						</IconButton>
																						<Menu
																							anchorEl={grnMenuAnchor}
																							open={Boolean(grnMenuAnchor)}
																							onClose={handleGrnMenuClose}
																						>
																							<MenuItem onClick={handleViewGrnReport} disabled={loadingGrnReport}>

																								View GRN Report
																							</MenuItem>
																							<MenuItem onClick={handleDownloadGrnReport} disabled={loadingGrnReport}>

																								Download GRN Report
																							</MenuItem>
																						</Menu>
																					</>
																				)}
																			</Box>
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
																										placeholder="GRN No"
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
																											// Check if item has qtyQcFailed from API
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
									{/* 1. Country */}
									<Autocomplete
										size="small"
										fullWidth
										sx={{ mt: 1 }}
										options={addressCountryOptions}
										getOptionLabel={(opt) => opt?.countryName ?? ""}
										value={billToCountryObj}
										isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
										onChange={async (e, val) => {
											setBillToCountryObj(val);
											setBillToCountry(val?.countryName ?? "");
											setBillToStateObj(null);
											setbillToState("");
											setBillToCityObj(null);
											setbillToCity("");
											setBillStateOptions([]);
											setBillCityOptions([]);
											if (val?.id) {
												const states = await fetchStates(val.id, atoken);
												if (states) setBillStateOptions(states);
											}
										}}
										renderInput={(params) => <TextField {...params} label="Country" />}
									/>
									{/* 2. State */}
									<Autocomplete
										size="small"
										fullWidth
										sx={{ mt: 1 }}
										options={billStateOptions}
										getOptionLabel={(opt) => opt?.stateName ?? ""}
										value={billToStateObj}
										isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
										onChange={async (e, val) => {
											setBillToStateObj(val);
											setbillToState(val?.stateName ?? "");
											setBillToCityObj(null);
											setbillToCity("");
											setBillCityOptions([]);
											if (val?.id) {
												const cities = await fetchCities(val.id, atoken);
												if (cities) setBillCityOptions(cities);
											}
										}}
										renderInput={(params) => <TextField {...params} label="State" />}
									/>
									{/* 3. City */}
									<Autocomplete
										size="small"
										fullWidth
										sx={{ mt: 1 }}
										options={billCityOptions}
										getOptionLabel={(opt) => opt?.cityName ?? ""}
										value={billToCityObj}
										isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
										onChange={(e, val) => {
											setBillToCityObj(val);
											setbillToCity(val?.cityName ?? "");
										}}
										renderInput={(params) => <TextField {...params} label="City" />}
									/>
									{/* 4. Address */}
									<TextField
										label="Address"
										fullWidth
										size="small"
										value={billToAddress}
										onChange={(e) => setbillToAddress(e.target.value)}
										margin="normal"
									/>
								</Box>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => setOpenEditBill(false)}>Cancel</Button>
								<Button variant="contained" onClick={async () => {
									const dataadd = {
										poId: pageSlug,
										billAddress: billToAddress,
										billCity: billToCityObj?.cityName ?? billToCity,
										billState: billToStateObj?.stateName ?? billToState,
										billToCountry: billToCountry,
										customerId: poSpecificDetails?.customerId,
										// Ship To fields as empty strings when updating Bill To
										shipAddress: "",
										shipCity: "",
										shipState: "",
										shipToCountry: ""
									};
									try {
										const res = await UpdatePOAddresses(dataadd, atoken);
										if (res) {
											// UpdatePOAddresses already toasts on success; update UI state
											setPoSpecificDetails((prev) => ({ ...prev, billToAddress: billToAddress, billToCity: dataadd.billCity, billToState: dataadd.billState, billToCountry: billToCountry }));
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
									{/* 1. Country */}
									<Autocomplete
										size="small"
										fullWidth
										sx={{ mt: 1 }}
										options={addressCountryOptions}
										getOptionLabel={(opt) => opt?.countryName ?? ""}
										value={shipToCountryObj}
										isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
										onChange={async (e, val) => {
											setShipToCountryObj(val);
											setShipToCountry(val?.countryName ?? "");
											setShipToStateObj(null);
											setshipToState("");
											setShipToCityObj(null);
											setshipToCity("");
											setShipStateOptions([]);
											setShipCityOptions([]);
											if (val?.id) {
												const states = await fetchStates(val.id, atoken);
												if (states) setShipStateOptions(states);
											}
										}}
										renderInput={(params) => <TextField {...params} label="Country" />}
									/>
									{/* 2. State */}
									<Autocomplete
										size="small"
										fullWidth
										sx={{ mt: 1 }}
										options={shipStateOptions}
										getOptionLabel={(opt) => opt?.stateName ?? ""}
										value={shipToStateObj}
										isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
										onChange={async (e, val) => {
											setShipToStateObj(val);
											setshipToState(val?.stateName ?? "");
											setShipToCityObj(null);
											setshipToCity("");
											setShipCityOptions([]);
											if (val?.id) {
												const cities = await fetchCities(val.id, atoken);
												if (cities) setShipCityOptions(cities);
											}
										}}
										renderInput={(params) => <TextField {...params} label="State" />}
									/>
									{/* 3. City */}
									<Autocomplete
										size="small"
										fullWidth
										sx={{ mt: 1 }}
										options={shipCityOptions}
										getOptionLabel={(opt) => opt?.cityName ?? ""}
										value={shipToCityObj}
										isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
										onChange={(e, val) => {
											setShipToCityObj(val);
											setshipToCity(val?.cityName ?? "");
										}}
										renderInput={(params) => <TextField {...params} label="City" />}
									/>
									{/* 4. Address */}
									<TextField label="Address" fullWidth size="small" value={shipToAddress} onChange={(e) => setshipToAddress(e.target.value)} margin="normal" />
								</Box>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => setOpenEditShip(false)}>Cancel</Button>
								<Button variant="contained" onClick={async () => {
									const dataadd = {
										poId: pageSlug,
										shipAddress: shipToAddress,
										shipCity: shipToCityObj?.cityName ?? shipToCity,
										shipState: shipToStateObj?.stateName ?? shipToState,
										shipToCountry: shipToCountry,
										customerId: poSpecificDetails?.customerId,
										// Bill To fields as empty strings when updating Ship To
										billAddress: "",
										billCity: "",
										billState: "",
										billToCountry: ""
									};
									try {
										const res = await UpdatePOAddresses(dataadd, atoken);
										if (res) {
											setPoSpecificDetails((prev) => ({ ...prev, shipToAddress: shipToAddress, shipToCity: dataadd.shipCity, shipToState: dataadd.shipState, shipToCountry: shipToCountry }));
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


						{/* Add / Edit PO Condition dialog */}
						<Dialog open={openEditCondition} onClose={() => { setOpenEditCondition(false); setIsAddingCondition(false); setIsItemConditionMode(false); setTargetItemForCondition(null); }} fullWidth maxWidth="sm">
							<DialogTitle>
								{isAddingCondition
									? (isItemConditionMode ? 'Add Item Condition' : 'Add New Condition')
									: (isItemConditionMode ? 'Edit Item Condition' : 'Edit PO Condition')}
							</DialogTitle>
							<DialogContent>
								{/* Info Alert for mutual exclusivity */}
								<Alert severity="info" sx={{ mt: 2, mb: 2 }}>
									<strong>Note:</strong> You can enter either a <strong>numeric value</strong> OR <strong>text description</strong>, but not both.
									Clear one field to use the other.
								</Alert>
								<Box component="form" sx={{ mt: 1 }}>
									{/* Condition Category — driven by POCommercialFind termNames */}
									<TextField
										label="Condition Category"
										fullWidth
										size="small"
										margin="normal"
										value={conditionForm.conditionCategory}
										onChange={(e) => setConditionForm(prev => ({ ...prev, conditionCategory: e.target.value }))}
									/>
									{/* Condition Value - Disabled if Condition Text has value */}
									<TextField
										label="Condition Value (Numeric)"
										fullWidth
										size="small"
										type="text"
										margin="normal"
										value={conditionForm.conditionValue}
										onChange={(e) => {
											// Only allow numeric input
											const value = e.target.value;
											if (value === '' || /^\d*\.?\d*$/.test(value)) {
												setConditionForm(prev => ({ ...prev, conditionValue: value }));
											}
										}}
										disabled={!!(conditionForm.conditionText && conditionForm.conditionText.trim())}
										helperText={
											conditionForm.conditionText && conditionForm.conditionText.trim()
												? "⚠️ Clear the Condition Text below to enter a numeric value here"
												: "Enter a numeric value OR use Condition Text below (not both)"
										}
										sx={{
											'& .MuiInputBase-input.Mui-disabled': {
												WebkitTextFillColor: '#999',
												cursor: 'not-allowed'
											}
										}}
									/>
									{/* Condition Text - Disabled if Condition Value has value */}
									<TextField
										label="Condition Text"
										fullWidth
										size="small"
										type="text"
										margin="normal"
										multiline
										rows={2}
										value={conditionForm.conditionText || ''}
										onChange={(e) => setConditionForm(prev => ({ ...prev, conditionText: e.target.value }))}
										disabled={!!(conditionForm.conditionValue && conditionForm.conditionValue.toString().trim())}
										helperText={
											conditionForm.conditionValue && conditionForm.conditionValue.toString().trim()
												? "⚠️ Clear the Condition Value above to enter text here"
												: "Enter text description OR use Condition Value above (not both)"
										}
										sx={{
											'& .MuiInputBase-input.Mui-disabled': {
												WebkitTextFillColor: '#999',
												cursor: 'not-allowed'
											}
										}}
									/>
								</Box>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => { setOpenEditCondition(false); setIsAddingCondition(false); setIsItemConditionMode(false); setTargetItemForCondition(null); }}>Cancel</Button>
								<Button
									variant="contained"
									disabled={savingCondition}
									onClick={async () => {
										// Validation: Ensure mutual exclusivity between conditionValue and conditionText
										const hasValue = conditionForm.conditionValue && conditionForm.conditionValue.toString().trim();
										const hasText = conditionForm.conditionText && conditionForm.conditionText.trim();

										if (hasValue && hasText) {
											toast.error('Cannot have both Condition Value and Condition Text. Please clear one field.');
											return;
										}

										if (!hasValue && !hasText) {
											toast.warning('Please enter either a Condition Value or Condition Text.');
											return;
										}

										setSavingCondition(true);
										try {
											if (isAddingCondition) {
												// Add New Condition (header or item level)
												const isItem = isItemConditionMode && targetItemForCondition;
												const payload = {
													id: 0,
													poHeaderId: parseInt(pageSlug),
													poItemId: isItem ? targetItemForCondition.id : 0,
													conditionType: conditionForm.conditionType,
													conditionCategory: conditionForm.conditionCategory,
													conditionRate: parseFloat(conditionForm.conditionRate) || 0,
													conditionValue: parseFloat(conditionForm.conditionValue) || 0,
													currency: conditionForm.currency,
													calculationType: conditionForm.calculationType,
													conditionText: conditionForm.conditionText || "",
													isHeaderCondition: !isItem,
												};
												const res = await apiClient.postres(`/api/pocondition/Add`, payload, atoken);
												if (res) {
													toast.success('PO Condition added successfully.');
													// Re-fetch conditions for the current version
													const conds = await GetPOCondition(pageSlug, selectedVersion, atoken, { signal: versionControllerRef.current?.signal });
													if (!(conds && conds.__cancelled)) {
														setPoSpecificDetails(prev => ({
															...prev,
															poConditions: (conds ?? []).filter(c => c.isHeaderCondition === true),
															poItemConditions: (conds ?? []).filter(c => c.isHeaderCondition === false),
														}));
													}
													setOpenEditCondition(false);
													setIsAddingCondition(false);
													setIsItemConditionMode(false);
													setTargetItemForCondition(null);
												}
											} else {
												// Edit Existing Condition
												if (!editingCondition) return;
												const isItem = editingCondition.isHeaderCondition === false;
												const payload = {
													id: editingCondition.id ?? 0,
													poHeaderId: editingCondition.poHeaderId ?? parseInt(pageSlug),
													poItemId: editingCondition.poItemId ?? 0,
													conditionType: conditionForm.conditionType,
													conditionCategory: conditionForm.conditionCategory,
													conditionRate: parseFloat(conditionForm.conditionRate) || 0,
													conditionValue: parseFloat(conditionForm.conditionValue) || 0,
													currency: conditionForm.currency,
													calculationType: conditionForm.calculationType,
													conditionText: conditionForm.conditionText || "",
													isHeaderCondition: !isItem,
												};
												const res = await apiClient.postres(`/api/pocondition/Update`, payload, atoken);
												if (res) {
													toast.success('PO Condition updated successfully.');
													// Re-fetch conditions for the current version
													const conds = await GetPOCondition(pageSlug, selectedVersion, atoken, { signal: versionControllerRef.current?.signal });
													if (!(conds && conds.__cancelled)) {
														setPoSpecificDetails(prev => ({
															...prev,
															poConditions: (conds ?? []).filter(c => c.isHeaderCondition === true),
															poItemConditions: (conds ?? []).filter(c => c.isHeaderCondition === false),
														}));
													}
													setOpenEditCondition(false);
													setIsItemConditionMode(false);
													setTargetItemForCondition(null);
												}
											}
										} catch (err) {
											const msg = err?.response?.data?.Message || (isAddingCondition ? 'Failed to add PO Condition.' : 'Failed to update PO Condition.');
											toast.error(msg);
										} finally {
											setSavingCondition(false);
										}
									}}
								>
									{savingCondition ? 'Saving...' : (isAddingCondition ? 'Add' : 'Save')}
								</Button>
							</DialogActions>
						</Dialog>

						{/* Delete PO Condition confirmation dialog */}
						<Dialog open={deleteConditionDialogOpen} onClose={() => { if (!isDeletingCondition) { setDeleteConditionDialogOpen(false); setConditionToDelete(null); } }} maxWidth="xs" fullWidth>
							<DialogTitle>Delete Condition</DialogTitle>
							<DialogContent>
								<Typography>Are you sure you want to delete this condition?</Typography>
							</DialogContent>
							<DialogActions>
								<Button onClick={() => { setDeleteConditionDialogOpen(false); setConditionToDelete(null); }} disabled={isDeletingCondition}>
									Cancel
								</Button>
								<Button variant="contained" color="error" onClick={handleDeleteCondition} disabled={isDeletingCondition}>
									{isDeletingCondition ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
								</Button>
							</DialogActions>
						</Dialog>

						<Dialog open={poCancelDialogOpen} onClose={closePOCancelDialog} maxWidth="xs" fullWidth>
							<DialogTitle>Cancel Purchase Order</DialogTitle>
							<DialogContent>
								<Typography sx={{ mb: 2 }}>Are you sure you want to cancel this PO? Please provide a reason.</Typography>
								<TextField
									autoFocus
									fullWidth
									required
									multiline
									rows={3}
									label="Reason / Comment"
									value={poCancelComment}
									onChange={(e) => {
										setPoCancelComment(e.target.value);
										if (poCancelError && e.target.value.trim()) setPoCancelError(null);
									}}
									error={Boolean(poCancelError)}
									helperText={poCancelError || ""}
									disabled={poCancelSubmitting}
									placeholder="Enter reason for cancelling this PO"
								/>
							</DialogContent>
							<DialogActions>
								<Button onClick={closePOCancelDialog} disabled={poCancelSubmitting}>
									Cancel
								</Button>
								<Button
									variant="contained"
									color="error"
									onClick={handlePOCancelConfirm}
									disabled={poCancelSubmitting || !poCancelComment.trim()}
								>
									{poCancelSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Save'}
								</Button>
							</DialogActions>
						</Dialog>

					</div>
				</div>

				{/* Right content - PO Approval Section */}
				<div className={`rightContent ${approvershow ? "col-3" : "d-none"}`}>
					<div className="bg-white shadow-sm rounded-default p-3 d-flex flex-column ms-3" style={{
						border: "1px solid #ddd",
						borderTop: "none",
						height: 'calc(100vh - 120px)',
						overflow: 'auto',
						scrollbarWidth: 'none', /* Firefox */
						msOverflowStyle: 'none' /* IE and Edge */
					}}>
						<style jsx>{`
								div::-webkit-scrollbar {
									display: none;
								}
							`}</style>
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
						<div className="flex-grow-1">
							{approvershow && (
								<EventApprovalBox
									requestCell={requestCell}
									handleEventAppList={handleEventAppList}
									wfupdate={wfupdate}
									action={stagearray.includes(currentStage)}
									stagelist={stagelist}
									Version={1}
									permissionManager={poPermissionManager}
									eventCode={poSpecificDetails?.poNumber}
									eventSubject={poSpecificDetails?.headerText}
									startDate={poSpecificDetails?.createdOn}
									endDate={poSpecificDetails?.deliveryDate}
									currentStage={currentStage}
								/>
							)}
						</div>
					</div>
				</div>
			</div>

			<React.Fragment key="top2">
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
											onClick={(event) => {
												toggleDrawer("openCreateSheet", false, allPOShipHeader)(event);
												// If this drawer was opened via the unified Add ASN/Invoice flow,
												// closing it returns the user to the line item selection step
												// (rather than fully exiting) so they can adjust their choice.
												if (addFlowMode === 'ASN' || addFlowMode === 'INVOICE') {
													setAddFlowStep('select');
													setValue(1);
												}
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
																									{selectedItem?.materialPOUnitPrice}
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
																												{item?.materialPOUnitPrice}
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
																												{item?.materialPOUnitPrice}
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
																							{poOrderItems?.materialPOUnitPrice}
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
																<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
																	<div className="mb-4 textblue f14">GRN Details</div>
																	<IconButton
																		size="small"
																		onClick={(e) => handleGrnMenuOpen(e, shipConfirmDetails)}
																		sx={{ color: '#1976d2', mt: '-16px' }}
																	>
																		<MoreVertIcon />
																	</IconButton>
																	<Menu
																		anchorEl={grnMenuAnchor}
																		open={Boolean(grnMenuAnchor)}
																		onClose={handleGrnMenuClose}
																	>
																		<MenuItem onClick={handleViewGrnReport} disabled={loadingGrnReport}>
																			View GRN Report
																		</MenuItem>

																		<MenuItem onClick={handleDownloadGrnReport} disabled={loadingGrnReport}>
																			Download GRN Report
																		</MenuItem>
																	</Menu>
																</Box>
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
																	eventSubject={poSpecificDetails?.headerText || ''}
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

			<React.Fragment key="approvePR">
				<Drawer anchor="right" open={state["openInvoiceApproved"]}>
					<form onSubmit={formik_POApproveReject.handleSubmit} autoComplete="off">
						<Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
							<div className="flex flex-col">
								<Box className="bgheaderCards">
									<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
										<div className="ms-3 text-white">
											Approval Action
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
														value={formik_POApproveReject.values.IsApproved}
														onChange={(e) =>
															formik_POApproveReject.setFieldValue(
																"IsApproved",
																e.target.value
															)
														}
													>
														<MenuItem value={true}>Approve</MenuItem>
														<MenuItem value={false}>Reject</MenuItem>
													</TextField>
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
														value={formik_POApproveReject?.values?.remarks}
														error={formik_POApproveReject.touched.remarks && Boolean(formik_POApproveReject.errors.remarks)}
														helperText={formik_POApproveReject.touched.remarks && formik_POApproveReject.errors.remarks}
														onChange={(e) =>
															formik_POApproveReject.setFieldValue(
																"remarks",
																e.target.value
															)
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
										<div className="mb-4 text-primary f14 fw-bold d-flex align-items-center">
											<MdReceipt className="me-2" size={20} />
											Payment Information
										</div>

										{paymentDetails.__source === 'paymentheader' ? (
											<div className="row">
												<div className="col-12 mb-3">
													<TextField
														id="invoiceNo"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="invoiceNo"
														className="w-100 f14"
														size="small"
														label="SAP Doc Number"
														variant="outlined"
														value={paymentDetails.invoiceNo || 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="paymentMethod"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="paymentMethod"
														className="w-100 f14"
														size="small"
														label="Payment Method"
														variant="outlined"
														value={paymentDetails.paymentMethod || 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="utrNumber"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="utrNumber"
														className="w-100 f14"
														size="small"
														label="UTR Number"
														variant="outlined"
														value={paymentDetails.utrNumber || 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="bankReference"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="bankReference"
														className="w-100 f14"
														size="small"
														label="Bank Reference"
														variant="outlined"
														value={paymentDetails.bankReference || 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="paymentCategory"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="paymentCategory"
														className="w-100 f14"
														size="small"
														label="Payment Category"
														variant="outlined"
														value={paymentDetails.paymentCategory || 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="paymentAmount"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="paymentAmount"
														className="w-100 f14"
														size="small"
														label="Amount"
														variant="outlined"
														value={paymentDetails.paymentAmount ?? 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="paymentStatus"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="paymentStatus"
														className="w-100 f14"
														size="small"
														label="Status"
														variant="outlined"
														value={paymentDetails.paymentStatus || 'N/A'}
													/>
												</div>

												<div className="col-12 mb-3">
													<TextField
														id="ph_paymentDate"
														InputLabelProps={{ shrink: true }}
														inputProps={{ readOnly: true }}
														name="ph_paymentDate"
														className="w-100 f14"
														size="small"
														label="Payment Date"
														variant="outlined"
														value={paymentDetails.paymentDate ? formatDateViaTimeZone(paymentDetails.paymentDate, "en-GB", formatoption) : 'N/A'}
													/>
												</div>

												{paymentDetails.sapPaymentDoc ? (
													<div className="col-12 mb-3">
														<TextField
															id="sapPaymentDoc"
															InputLabelProps={{ shrink: true }}
															inputProps={{ readOnly: true }}
															name="sapPaymentDoc"
															className="w-100 f14"
															size="small"
															label="SAP Payment Doc"
															variant="outlined"
															value={paymentDetails.sapPaymentDoc || 'N/A'}
														/>
													</div>
												) : null}
											</div>
										) : (
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
										)}
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

			{/* Add Payment Drawer */}
			<Drawer
				anchor="right"
				open={openAddPaymentDrawer}
				onClose={() => {
					setOpenAddPaymentDrawer(false);
					resetPaymentForm();
				}}
			>
				<Box sx={{ width: { xs: 320, sm: 420, md: 480 } }}>
					<div className="flex flex-col">
						<Box className="bgheaderCards">
							<div className="d-flex align-items-center justify-content-between pt-2 pb-2">
								<div className="ms-3 text-white">
									Add Payment
									{paymentTargetItem && (
										<span className="ms-2" style={{ fontSize: 12, opacity: 0.85 }}>
											— Item {paymentTargetItem.itemNo || paymentTargetItem.id}
										</span>
									)}
								</div>
								<div>
									<IconButton
										onClick={() => {
											setOpenAddPaymentDrawer(false);
											resetPaymentForm();
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
							<div className="row">
								{/* Linked Invoice */}
								<div className="col-12 mb-3">
									<TextField
										select
										label="Linked Invoice"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.invoiceId}
										onChange={(e) => handlePaymentFormChange('invoiceId', e.target.value)}
									>
										<MenuItem value="">— None —</MenuItem>
										{(poInvoiceList?.length > 0
											? poInvoiceList
											: allPOShipHeader.filter(s => s.invoiceNo && (s.invoiceHId || s.invoiceId))
										).map((s, idx) => {
											const invId = s.id ?? s.invoiceHId ?? s.invoiceId;
											return (
												<MenuItem key={invId || idx} value={invId}>
													{s.invoiceNo} {s.invoiceAmount || s.totaLInvoiceAmount ? `(${s.invoiceAmount || s.totaLInvoiceAmount})` : ''}
												</MenuItem>
											);
										})}
									</TextField>
								</div>

								{/* Payment Method */}
								<div className="col-12 mb-3">
									<TextField
										select
										label="Payment Method"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.paymentMethod}
										onChange={(e) => handlePaymentFormChange('paymentMethod', e.target.value)}
									>
										<MenuItem value="">— Select —</MenuItem>
										<MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
										<MenuItem value="NEFT">NEFT</MenuItem>
										<MenuItem value="RTGS">RTGS</MenuItem>
										<MenuItem value="IMPS">IMPS</MenuItem>
										<MenuItem value="UPI">UPI</MenuItem>
										<MenuItem value="Cheque">Cheque</MenuItem>
										<MenuItem value="Cash">Cash</MenuItem>
										<MenuItem value="Other">Other</MenuItem>
									</TextField>
								</div>

								{/* Payment Status */}
								<div className="col-12 mb-3">
									<TextField
										select
										label="Payment Status"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.paymentStatus}
										onChange={(e) => handlePaymentFormChange('paymentStatus', e.target.value)}
									>
										<MenuItem value="Pending">Pending</MenuItem>
										<MenuItem value="Completed">Completed</MenuItem>
										<MenuItem value="Failed">Failed</MenuItem>
										<MenuItem value="Cancelled">Cancelled</MenuItem>
									</TextField>
								</div>

								{/* Payment Category */}
								<div className="col-12 mb-3">
									<TextField
										label="Payment Category"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.paymentCategory}
										onChange={(e) => handlePaymentFormChange('paymentCategory', e.target.value)}
										inputProps={{ maxLength: 100 }}
									/>
								</div>

								{/* UTR Number */}
								<div className="col-12 mb-3">
									<TextField
										label="UTR Number"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.utrNumber}
										onChange={(e) => handlePaymentFormChange('utrNumber', e.target.value)}
										inputProps={{ maxLength: 100 }}
									/>
								</div>

								{/* Bank Reference */}
								<div className="col-12 mb-3">
									<TextField
										label="Bank Reference"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.bankReference}
										onChange={(e) => handlePaymentFormChange('bankReference', e.target.value)}
										inputProps={{ maxLength: 100 }}
									/>
								</div>

								{/* SAP Payment Doc */}
								<div className="col-12 mb-3">
									<TextField
										label="SAP Payment Doc"
										size="small"
										fullWidth
										InputLabelProps={{ shrink: true }}
										value={paymentForm.sapPaymentDoc}
										onChange={(e) => handlePaymentFormChange('sapPaymentDoc', e.target.value)}
										inputProps={{ maxLength: 100 }}
									/>
								</div>

								{/* Amount */}
								<div className="col-12 mb-3">
									<TextField
										label="Payment Amount *"
										size="small"
										fullWidth
										type="number"
										InputLabelProps={{ shrink: true }}
										value={paymentForm.paymentAmount}
										onChange={(e) => handlePaymentFormChange('paymentAmount', e.target.value)}
										inputProps={{ min: 0, step: '0.01' }}
									/>
								</div>

								{/* Retention Amount */}
								<div className="col-12 mb-3">
									<TextField
										label="Retention Amount"
										size="small"
										fullWidth
										type="number"
										InputLabelProps={{ shrink: true }}
										value={paymentForm.retentionAmount}
										onChange={(e) => handlePaymentFormChange('retentionAmount', e.target.value)}
										inputProps={{ min: 0, step: '0.01' }}
									/>
								</div>

								{/* Payment Date */}
								<div className="col-12 mb-3">
									<LocalizationProvider dateAdapter={AdapterDateFns}>
										<MobileDatePicker
											label="Payment Date *"
											value={paymentForm.paymentDate}
											onChange={(date) => handlePaymentFormChange('paymentDate', date)}
											slotProps={{
												textField: {
													size: 'small',
													fullWidth: true,
													InputLabelProps: { shrink: true },
												},
											}}
										/>
									</LocalizationProvider>
								</div>

								{/* Save Button */}
								<div className="col-12">
									<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
										<Button
											variant="outlined"
											size="small"
											sx={{ textTransform: 'none' }}
											onClick={() => {
												setOpenAddPaymentDrawer(false);
												resetPaymentForm();
											}}
										>
											Cancel
										</Button>
										<LoadingButton
											loading={savingPayment}
											variant="contained"
											size="small"
											sx={{ textTransform: 'none' }}
											onClick={handleSubmitPayment}
										>
											Save Payment
										</LoadingButton>
									</Box>
								</div>
							</div>
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

			{/* GRN Report Modal */}
			<Dialog
				open={grnReportModal}
				onClose={() => setGrnReportModal(false)}
				maxWidth="xl"
				fullWidth
			>
				<DialogTitle sx={{ padding: 0 }}>
					<IconButton
						aria-label="close"
						onClick={() => setGrnReportModal(false)}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
							zIndex: 1,
						}}
					>
						<HiOutlineX />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ padding: 0 }}>
					{loadingGrnReport ? (
						<div className="text-center py-4">
							<CircularProgress />
						</div>
					) : grnReportData.length > 0 ? (
						<div style={{
							padding: '40px',
							backgroundColor: '#fff',
							fontFamily: 'Arial, sans-serif'
						}}>
							{/* Document Border */}
							<div style={{
								border: '2px solid #000',
								padding: '20px'
							}}>
								{/* Company Header */}
								<div style={{
									borderBottom: '2px solid #000',
									paddingBottom: '10px',
									marginBottom: '10px',
									textAlign: 'center',
									fontWeight: 'bold',
									fontSize: '16px'
								}}>
									POSCO - India Pune Processing Center Pvt. Ltd.
								</div>

								{/* Document Title */}
								<div style={{
									borderBottom: '2px solid #000',
									padding: '8px 0',
									marginBottom: '15px',
									textAlign: 'center',
									fontWeight: 'bold',
									fontSize: '14px'
								}}>
									Goods Receipt Note
								</div>

								{/* Supplier Information */}
								<div style={{
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '15px',
									fontSize: '12px',
									padding: '10px 0'
								}}>
									<div style={{ flex: 1 }}>
										<span style={{ fontWeight: 'bold' }}>Supplier Name : </span>
										<span>{grnReportData[0]?.vendorCompany || ''}</span>
									</div>
									<div style={{ flex: 1 }}>
										<span style={{ fontWeight: 'bold' }}>Supplier Code : </span>
										<span>{grnReportData[0]?.vendorCode || ''}</span>
									</div>
									<div style={{ flex: 1 }}>
										<span style={{ fontWeight: 'bold' }}>GRN Date : </span>
										<span>
											{grnReportData[0]?.grnDate ? (() => {
												try {
													const dateObj = new Date(grnReportData[0].grnDate);
													return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB') : '';
												} catch (e) {
													return grnReportData[0].grnDate;
												}
											})() : ''}
										</span>
									</div>
								</div>

								{/* Invoice Number and GRN Number */}
								<div style={{
									display: 'flex',
									justifyContent: 'space-between',
									marginBottom: '15px',
									fontSize: '12px',
									padding: '5px 0'
								}}>
									<div style={{ flex: 1 }}>
										<span style={{ fontWeight: 'bold' }}>Invoice NO : </span>
										<span>{grnReportData[0]?.invoiceNo || ''}</span>
									</div>
									<div style={{ flex: 1 }}>
										<span style={{ fontWeight: 'bold' }}>GRN No : </span>
										<span>{grnReportData[0]?.grnNumber || ''}</span>
									</div>
									<div style={{ flex: 1 }}>
										<span style={{ fontWeight: 'bold' }}>Invoice Date : </span>
										<span>
											{grnReportData[0]?.invoiceDate ? (() => {
												try {
													const dateObj = new Date(grnReportData[0].invoiceDate);
													return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB') : '';
												} catch (e) {
													return grnReportData[0].invoiceDate;
												}
											})() : ''}
										</span>
									</div>
								</div>

								{/* Items Table */}
								<div style={{ marginBottom: '20px' }}>
									<table style={{
										width: '100%',
										fontSize: '11px',
										borderCollapse: 'collapse',
										border: '1px solid #000'
									}}>
										<thead>
											<tr style={{ backgroundColor: '#f0f0f0' }}>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Sr</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>PO NO LN</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>PO NUMBER</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>ITEM CODE</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>GRN NO</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>BATCH NUMBER</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>ITEM DESCRIPTION</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>UOM</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>REC QTY</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>APP QTY</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>REJ QTY</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>WHLO C</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>COST CENTER</th>
												<th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>GL ACCOUNT</th>
											</tr>
										</thead>
										<tbody>
											{grnReportData.map((item, index) => {
												// PO Line Number - API returns it formatted as "0001", "0002"
												const poLineNumber = item.poLn || '';

												return (
													<tr key={index}>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.sr || index + 1}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>
															{poLineNumber}
														</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.poNo || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.itemCode || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.grnNumber || grnReportData[0]?.grnNumber || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.batchNumber || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.itemDescription || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.uom || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.recQty ?? '0.00'}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.appQty ?? '0.00'}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{item.rejQty ?? '0.00'}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center' }}>{item.whLoc || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.costCenter || ''}</td>
														<td style={{ border: '1px solid #000', padding: '6px 4px' }}>{item.glAccount || ''}</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>

								{/* Inspection Remarks */}
								<div style={{ fontSize: '11px', marginBottom: '30px' }}>
									<div style={{ marginBottom: '8px' }}>
										<span style={{ fontWeight: 'bold' }}>INSPECTION REMARKS:</span>
									</div>
									<div style={{ marginBottom: '4px' }}>
										<span style={{ fontWeight: 'bold' }}>INSPECTION NUMBER:</span>
										<span style={{ marginLeft: '150px' }}>{grnReportData[0]?.inspectionNumber || ''}</span>
										{/* <span style={{ marginLeft: '50px', fontWeight: 'bold' }}>INSPECTION DATE:</span> */}
										<span style={{ marginLeft: '10px' }}>{grnReportData[0]?.inspectionDate || ''}</span>
									</div>
								</div>

								{/* Inspection Remarks Date & Prepared By */}
								<div style={{
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: '11px',
									marginBottom: '10px'
								}}>
									<div></div>
									<div style={{ textAlign: 'right' }}>
										<div><span style={{ fontWeight: 'bold' }}>DATE:</span> {grnReportData[0]?.date ? (() => {
											try {
												const dateObj = new Date(grnReportData[0].date);
												return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-GB') : '';
											} catch (e) {
												return grnReportData[0].date;
											}
										})() : ''}</div>
										<div><span style={{ fontWeight: 'bold' }}>Prepared By :</span> {grnReportData[0]?.createdByName || ''}</div>
									</div>
								</div>

								{/* Signature Section */}
								<div style={{
									display: 'flex',
									justifyContent: 'space-between',
									fontSize: '11px',
									marginTop: '40px',
									paddingTop: '20px'
								}}>
									<div style={{ textAlign: 'center', flex: 1 }}>
										<div style={{ marginBottom: '40px' }}></div>
										<div style={{ paddingTop: '5px' }}>
											<div style={{ fontWeight: 'bold' }}>Approved By</div>
											<div>(Store/QC)</div>
										</div>
									</div>
									<div style={{ textAlign: 'center', flex: 1 }}>
										<div style={{ marginBottom: '40px' }}></div>
										<div style={{ paddingTop: '5px' }}>
											<div style={{ fontWeight: 'bold' }}>Approved By</div>
											<div>(TL)</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-4">
							<p>No GRN report data available</p>
						</div>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							const printContent = document.querySelector('[style*="padding: 40px"]');
							if (printContent) {
								const printWindow = window.open('', '', 'height=800,width=1200');
								printWindow.document.write('<html><head><title>GRN Report</title>');
								printWindow.document.write('<style>@media print { @page { margin: 0.5in; } body { margin: 0; } }</style>');
								printWindow.document.write('</head><body>');
								printWindow.document.write(printContent.innerHTML);
								printWindow.document.write('</body></html>');
								printWindow.document.close();
								printWindow.print();
							}
						}}
						variant="outlined"
					>
						Print
					</Button>
					<Button onClick={() => setGrnReportModal(false)}>Close</Button>
				</DialogActions>
			</Dialog>

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
			<Dialog
				open={deliveryDialogOpen}
				onClose={() => {
					setDeliveryDialogOpen(false);
					setDeliveryDialogRow(null);
					setDeliveryDialogDate(null);
				}}
				fullWidth
				maxWidth="xs"
			>
				<DialogTitle>Edit Delivery Date</DialogTitle>
				<DialogContent>
					<Box sx={{ mt: 1 }}>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<MobileDatePicker
								label="Delivery Date"
								value={deliveryDialogDate}
								onChange={(newValue) => setDeliveryDialogDate(newValue)}
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
								format="dd/MM/yyyy"
							/>
						</LocalizationProvider>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setDeliveryDialogOpen(false);
							setDeliveryDialogRow(null);
							setDeliveryDialogDate(null);
						}}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
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
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default PurchaseOrder;