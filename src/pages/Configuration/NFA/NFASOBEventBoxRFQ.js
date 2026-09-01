import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useStateValue } from "../../../store";
import {
	Autocomplete, Box, IconButton,
	TextField, MenuItem, Select,
	FormControl, Alert, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { buildQueryParams, getCurrency } from "../../../utils/common/utility";
import { ApiClient } from '../../../Apiclient';
import { DecimalValueRegEx, getApiErrorMessage } from '../../../utils/common';
import {
	HiOutlineX, HiPlusSm, HiOutlineUserAdd,
	HiPencilAlt, HiOutlineInformationCircle, HiOutlineTrash
} from "react-icons/hi";
import PEModal from "../../../components/PEModal";
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import { PETableSimple } from "../../../components/RFQ/PETable";
import { PEPagination } from "../../../components/RFQ/PEPagination";
import { toast } from "react-toastify";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
// Permission Management Imports
import { CLAIM_TYPES, ACTIONS } from '../../../utils/permissionManager';
import { UOMMasterList } from '../../../utils/commerciallibrary';
import { FindItemCategory, FindItemType, FindPlantStorage } from '../../../utils/purchaseRequest';
import AddEditItemType from '../../../utils/common/AddEditITemType';
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import AddPrPlant from '../../../utils/common/AddPrPlant';
import AddUpdateUom from '../../../utils/common/AddUpdateUom';
import NFAAddProductCell, { NFA_ADD_PRODUCT_FORM_ID } from './NFAAddProductCell';
import AddEditCurrency from '../../../utils/common/AddEditCurrency';

const NFASOBEventBoxRFQ = forwardRef(({ props }, NFASOBRFQRef) => {
	const [{ atoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);

	// Extract permission props
	const { permissionManager, canRead, canEdit, canCreate, canRemove } = props;

	// Permission checks for Event Details
	const eventDetailsCanRead = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.READ) ?? true;
	const eventDetailsCanEdit = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.EDIT) ?? true;
	const eventDetailsCanCreate = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.CREATE) ?? true;
	const eventDetailsCanRemove = permissionManager?.hasPermission(CLAIM_TYPES.EVENT_DETAILS, ACTIONS.REMOVE) ?? true;

	// Check if current stage is Draft - only allow edits in Draft stage
	const isDraftStage = props.currentStage?.trim() === "Draft";

	const [basisOf, setBasisOf] = useState(""); // Dropdown state for "Basis of"
	const [valueType, setValueType] = useState(""); // State for value type dropdown
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [value, setValue] = useState('0')
	const [categoryList, setCategoryList] = useState([]);
	const [itemTypeList, setItemTypeList] = useState([]);
	const [ItemTypeModal, setItemTypeModal] = useState(false);
	const [selectedSupplier, setSelectedSupplier] = useState([]);
	const [vendorPackages, setVendorPackages] = useState([]);
	// console.log('VP',vendorPackages);
	const [items, setItems] = useState([]);
	const [allocationErrors, setAllocationErrors] = useState({});
	const [totalQuantity, setTotalQuantity] = useState(0);
	const [budgetStatus, setBudgetStatus] = useState("");
	const [saving, setSaving] = useState(0);
	const [openDrawer, setOpenDrawer] = useState({
		addsupplier: false,
		additem: false
	});
	const [newItemData, setNewItemData] = useState({
		itemName: '',
		itemCode: '',
		itemCategory: '',
		itemType: '',
		itemTypeId: '',
		itemDesc: '',
		uom: '',
		quantity: '',
		targetPrice: 0,
		plant: '',
		deliveryDate: '',
		remarks: '',
		itemImage: null,
		itemFile: null,
		version: props.nfaEventVersion || 0,
		nfaId: props.nfaEventId || 0
	});
	const [itemCategoryList, setItemCategoryList] = useState([]);
	const [uomList, setUomList] = useState([]);
	const [plantList, setPlantList] = useState([]);
	const [addItemTypeList, setAddItemTypeList] = useState([]);
	// modals for Add Item drawer (rendered outside drawer to avoid z-index issues)
	const [addItemCategoryModal, setAddItemCategoryModal] = useState(false);
	const [addItemTypeModal, setAddItemTypeModal] = useState(false);
	const [addItemPlantModal, setAddItemPlantModal] = useState(false);
	const [addItemUomModal, setAddItemUomModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [supplierSearchText, setSupplierSearchText] = useState('');
	const [remainingSupplier, setRemainingSupplier] = useState([]);
	const [newSupplier, setNewSupplier] = useState([]);
	//pagination for total suppliers
	const [pageTS, setPageTS] = React.useState(1);
	const [totalpageTS, setTotalPageTS] = React.useState(3);
	const [pageCount, setPageCount] = React.useState(10);
	const [pageSS, setPageSS] = React.useState(1);
	const [totalpageSS, setTotalPageSS] = React.useState(
		Math.ceil(newSupplier / pageCount)
	);
	const [loading, setLoading] = useState(false)
	const [expandedItems, setExpandedItems] = useState({}); // Track expanded items
	const [currencyList, setCurrencyList] = useState([]);
	const [budget, setBudget] = useState(props?.nfaBudget);
	const [totalAmount, setTotalAmount] = useState(props?.nfaAmount);
	const [OpenCurrencyModal, setOpenCurrencyModal] = useState(false);
	const [currency, setCurrency] = useState(props?.nfaCurrency);

	const CloseCurrencyModal = () => {
		setOpenCurrencyModal(false);
	};

	const handleCurrencyList = () => {
		pullgetCurrency();
	};

	const handlePaginationTS = (event, value) => {
		if (value) {
			setPageTS(value);
		}
	};

	const handlePaginationSS = (event, value) => {
		if (value) {
			setPageSS(value);
		}
	};

	useEffect(() => {
		handlePaginationTS();
		setTotalPageTS(
			Math.ceil(remainingSupplier?.length / pageCount)
		);
	}, [pageTS, remainingSupplier]);

	useEffect(() => {
		handlePaginationSS();
		setTotalPageSS(Math.ceil(newSupplier?.length / pageCount));
	}, [pageSS, newSupplier]);

	//in order to handle event from parent component
	useImperativeHandle(NFASOBRFQRef, () => ({
		saveSOBDetails: async () => {
			try {
				const validItemIds = new Set(items.map(i => i.parentId ?? i.id));
				const data = vendorPackages
					.filter(vendor => basisOf !== "item" || validItemIds.has(vendor.itemId))
					.map((vendor) => ({
						id: 0,
						vendorId: vendor.vendorId,
						companyName: vendor.companyName,
						initialPrice: vendor.initialPrice ?? 0,
						finalPrice: vendor.finalPrice !== "" ? parseFloat(vendor.finalPrice) : 0,
						nfaEventId: props.nfaEventId,
						nfaEventType: props.nfaEventType,
						packageRank: vendor.packageRank,
						allocation: parseFloat(vendor.allocation || 0),
						newVendor: vendor.newVendor || false,
						nfaId: props.eventId,
						itemId: basisOf === "item" ? (vendor.itemId || 0) : 0,
						customerId: customerid,
						version: props.Version,
						allocationOn: basisOf,
						valueType: valueType,
						totalPrice: parseFloat(vendor.totalPrice || 0),
						remarks: vendor.remarks || ""
					}));

				if (basisOf === "item") {
					const itemAllocationMap = {};
					data.forEach((item) => {
						if (!itemAllocationMap[item.itemId]) {
							itemAllocationMap[item.itemId] = {
								itemName: items.find(i => i.itemId === item.itemId)?.itemName || `Item ${item.itemId}`,
								totalAllocation: 0
							};
						}
						itemAllocationMap[item.itemId].totalAllocation += item.allocation;
					});
					const invalidItems = Object.values(itemAllocationMap)
						.filter(item => item.totalAllocation <= 0)
						.map(item => item.itemName);
					if (invalidItems.length > 0) {
						toast.error(`Please allocate at least one supplier for all the item(s)`, { toastId: "allocation_validation_error" });
						return false;
					}
				}

				const res = await apiClient.postres(`/api/NFASOBDetails/${props.eventId}/Add?EventType=NFA`, data, atoken);
				if (res) {
					toast.success("Allocation Saved Successfully", { toastId: "QS" });
					return true;
				}
				return false;
			} catch (error) {
				toast.error(getApiErrorMessage(error), { toastId: "sob_save_error" });
				return false;
			}
		}
	}));

	// Fetch existing SOB details if any
	const getSOBDetails = async (data) => {
		try {
			const params = {
				NFAId: props.eventId,
				EventId: props.nfaEventId,
				EventType: props.nfaEventType || '0',
				BasisOf: data ? data : "",
				Version: props.eventId !== null && props.eventId !== 0 ? props.Version : props.nfaEventVersion ?? 1,
			};
			const queryParams = buildQueryParams(params);
			const res = await apiClient.getres(`/api/NFAManage/GetItemWiseData?${queryParams}`, atoken);
			if (res) {
				setItems(res?.data?.items || []);
				setVendorPackages(res?.data?.packageWiseData || []);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "sob_fetch_error" });
		}
	};

	const pullgetCurrency = useCallback(() => {
		const data = {
			isActive: true,
		};
		getCurrency(data, atoken).then((res) => {
			setCurrencyList(res);
		});
	}, [atoken]);

	useEffect(() => {
		getTotalSupplier();
		getCategorylist();
	}, [])

	useEffect(() => {
		if (currencyList.length === 0) {
			pullgetCurrency();
		}
	}, [atoken, customerid]);

	useEffect(() => {
		getSOBDetails();
		if (props.nfaEventType && props.nfaEventId && props.nfaEventVersion) {
			setItems([]);
			setVendorPackages([]);
			setValue(props.nfaEventType);
			// pullRFQHeaderDetails();
		}
	}, [props.nfaEventType, props.nfaEventId, props.nfaEventVersion])

	useEffect(() => {
		if (Array.isArray(vendorPackages) && vendorPackages.length > 0) {

			if (vendorPackages[0]?.allocationOn) {
				setBasisOf(vendorPackages[0]?.allocationOn);
			}
			if (vendorPackages[0]?.valueType) {
				setValueType(vendorPackages[0]?.valueType);
			}
			handleTotalAmount();
		}
	}, [vendorPackages])

	// Handle allocation change
	const handleAllocationChangePackage = (vendorId, value) => {
		// Allow only numbers and up to 4 decimal places
		if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
			const finalPrice = parseFloat(vendorPackages.find(pkg => pkg.vendorId === vendorId)?.finalPrice) || 0;
			const updatedPackages = vendorPackages.map(pkg =>
				pkg.vendorId === vendorId
					? {
						...pkg, allocation: value,
						totalPrice: (valueType === 'percentage' ? ((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) : (parseFloat(value || 0)).toFixed(4))
					} // keep as string
					: pkg
			);

			// Calculate new total based on updated values
			const newTotal = updatedPackages.reduce((sum, v) => {
				const val = parseFloat(v.allocation);
				return sum + (isNaN(val) ? 0 : val);
			}, 0);

			// Error checking based on valueType
			let errorMsg = '';
			if (valueType === 'percentage' && newTotal > 100) {
				errorMsg = 'Total allocation cannot exceed 100%';
			} else if (valueType === 'absolute' && newTotal > totalQuantity && totalQuantity !== 0) {
				errorMsg = `Total allocation cannot exceed ${totalQuantity}`;
			}

			// Set error message for this vendor
			setAllocationErrors(errors => ({
				...errors,
				[vendorId]: errorMsg
			}));

			// Prevent state update if error exists
			if (errorMsg) return;

			// Set the updated allocations
			setVendorPackages(updatedPackages);
		}
	};

	const handleAllocationChangeItem = (itemId, vendorId, value) => {
		// Allow only numbers and up to 4 decimal places
		if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
			// Find the vendor package for this specific item and vendor
			const vendorPackage = vendorPackages.find(pkg => pkg.vendorId === vendorId && pkg.itemId === itemId);
			const currentItem = items.find(item => item.id === itemId);
			const itemQuantity = currentItem?.quantity || 0;
			const finalPrice = parseFloat(vendorPackage?.finalPrice) * parseFloat(itemQuantity) || 0;
			// Get the item details to check quantity for absolute allocation
			// Update the specific vendor package for this item
			const updatedPackages = vendorPackages.map(pkg =>
				pkg.vendorId === vendorId && pkg.itemId === itemId
					? {
						...pkg,
						allocation: value,
						totalPrice: (valueType === 'percentage' ?
							((parseFloat(value || 0) / 100) * finalPrice).toFixed(4) :
							((finalPrice / itemQuantity) * parseFloat(value || 0)).toFixed(4))
					}
					: pkg
			);

			// Calculate total allocation for this specific item across all vendors
			const itemVendorPackages = updatedPackages.filter(pkg => pkg.itemId === itemId);
			const newTotal = itemVendorPackages.reduce((sum, v) => {
				const val = parseFloat(v.allocation);
				return sum + (isNaN(val) ? 0 : val);
			}, 0);

			// Error checking based on valueType for this specific item
			let errorMsg = '';
			if (valueType === 'percentage' && newTotal > 100) {
				errorMsg = 'Total allocation for this item cannot exceed 100%';
			} else if (valueType === 'absolute' && newTotal > itemQuantity && itemQuantity !== 0) {
				errorMsg = `Total allocation for this item cannot exceed ${itemQuantity}`;
			}

			// Set error message for this vendor (using a composite key for item-specific errors)
			const errorKey = `${vendorId}-${itemId}`;
			setAllocationErrors(errors => ({
				...errors,
				[errorKey]: errorMsg
			}));

			// Prevent state update if error exists
			if (errorMsg) return;

			// Clear any existing error for this vendor-item combination
			setAllocationErrors(errors => {
				const newErrors = { ...errors };
				delete newErrors[errorKey];
				return newErrors;
			});

			// Update the vendor packages state
			setVendorPackages(updatedPackages);
		}
	}

	const handleTotalAmount = () => {
		const total = vendorPackages.map(pkg => parseFloat(pkg.totalPrice) || 0).reduce((sum, val) => sum + val, 0);
		setTotalAmount(total);
		if (props?.amount !== total) {
			props?.updateAmount(total);
		}
	}

	const handleNewSupplierPrice = (vendorId, value, itemId = null) => {
		if (value === '' || /^\d*\.?\d{0,4}$/.test(value)) {
			const updatedPackages = vendorPackages.map(pkg => {
				const isMatched =
					basisOf === 'item' && itemId !== null
						? (pkg.vendorId === vendorId && pkg.itemId === itemId)
						: (pkg.vendorId === vendorId);

				if (!isMatched) return pkg;

				const currentItem = items.find(item => (item.parentId ?? item.id) === pkg.itemId);
				const itemQuantity = currentItem?.quantity || 0;
				const finalPrice = (parseFloat(value) || 0) * itemQuantity;
				const allocation = parseFloat(pkg.allocation) || 0;

				return {
					...pkg,
					finalPrice: value,
					totalPrice:
						value === '' || allocation === 0
							? ''
							: (
								valueType === 'percentage'
									? ((allocation / 100) * finalPrice)
									: ((finalPrice / itemQuantity) * allocation)
							).toFixed(4)
				};
			});
			setVendorPackages(updatedPackages);
		}
	}

	const handleBasisOfChange = async (event) => {
		setBasisOf(event.target.value);
		setVendorPackages([]); // reset old data
		setItems([]);
		if (event.target.value === 'package') {
			setValueType('percentage');
		}
		else {
			setValueType('absolute');
		}
		await getSOBDetails(event.target.value);
	};

	const handleValueTypeChange = (event) => {
		setValueType(event.target.value);

		// Reset all allocations to 0 when value type changes
		setVendorPackages(prevPackages => {
			return prevPackages.map(vendor => ({
				...vendor,
				valueType: event.target.value,
				allocation: 0,
				totalPrice: 0
			}));
		});

		// Clear any existing allocation errors
		setAllocationErrors({});
	};

	// Handle expand/collapse for items
	const handleItemExpand = (itemId) => {
		setExpandedItems(prev => ({
			...prev,
			[itemId]: !prev[itemId]
		}));
	};

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

	const CloseItemTypeModal = () => setItemTypeModal(false);

	const handleItemTypeList = (array) => {
		// When receiving list updates (from modal), keep only active items
		const list = Array.isArray(array) ? array.filter(a => a?.isActive) : [];
		setItemTypeList(list);
	};

	// Fetch item categories for dropdown
	const getItemCategoryList = async () => {
		var data = {
			CustomerId: customerid,
		};
		FindItemCategory(data, atoken).then((resp) => {

			setItemCategoryList(resp);
		});
	};

	// Fetch UOM list for dropdown
	const getUomList = async () => {
		var data = {
			CustomerId: customerid
		};
		UOMMasterList(data, atoken).then((res) => {
			setUomList(res);
		});
	};

	// Fetch Plant list for dropdown
	const getPlantList = async () => {
		var data = {
			CustomerId: customerid,
		};
		FindPlantStorage(data, atoken).then((resp) => {
			setPlantList(resp);
		});
	};

	const getAddItemTypeList = () => {
		FindItemType({ CustomerId: customerid, IsActive: true }, atoken).then((resp) => {
			setAddItemTypeList(Array.isArray(resp) ? resp.filter(r => r?.isActive) : []);
		});
	};

	const toggleDrawer = (anchor, open) => {
		setOpenDrawer({ ...openDrawer, [anchor]: open });

		// Fetch dropdown data when opening add item drawer
		if (anchor === 'additem' && open) {
			getItemCategoryList();
			getUomList();
			getPlantList();
		}
		// Reset add-item lists when drawer closes so they reload fresh next open
		if (anchor === 'additem' && !open) {
			setAddItemTypeList([]);
		}
	};

	const handleSupplierWithCategory = async (selectedCategory) => {
		const obj = {
			CustomerId: customerid,
			Advance: "Advance",
			CategoryId: selectedCategory?.id,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);
		if (res && res?.data?.length > 0) {
			// Extract the emails from selectedSupplier
			const selectedSupplierEmails = selectedSupplier.map((item) => item.emailId);
			const newSupplierEmails = newSupplier.map((item) => item.email);
			// Filter the suppliers from the API response that are not in selectedSupplier
			const filteredSuppliers = res.data.filter((supplier) => {
				return !selectedSupplierEmails.includes(supplier.email) &&
					!newSupplierEmails.includes(supplier.email);
			});
			setRemainingSupplier(filteredSuppliers);
		} else {
			// Reset totalSuppliers if no results are returned
			setRemainingSupplier([]);
		}
	};

	const getTotalSupplier = async () => {
		const obj = {
			CustomerId: customerid,
			//Advance: `Advance`,
		};
		const queryParams = buildQueryParams(obj);

		const res = await apiClient.getres(
			`/api/managevendors/GetVendorUsers?${queryParams}`,
			atoken
		);

		if (res) {
			// Extract the emails from selectedSupplier and newSupplier
			const selectedSupplierEmails = selectedSupplier.map((item) => item.emailId);
			const newSupplierEmails = newSupplier.map((item) => item.email);
			// Filter the suppliers from the API response that are not in selectedSupplier or newSupplier
			const filteredSuppliers = res.data.filter((supplier) => {
				return (
					!selectedSupplierEmails.includes(supplier.email) &&
					!newSupplierEmails.includes(supplier.email)
				);
			});
			setRemainingSupplier(filteredSuppliers);
		}
	};

	const handleCheckRemainingSupplier = (supplier) => {
		// Find the supplier index in remainingSupplier
		const supplierIndex = remainingSupplier.findIndex(
			(item) => item.contactId === supplier.contactId
		);

		// Check if supplier already exists in newSupplier
		const isAlreadyInNewSupplier = newSupplier.some(
			(item) => item.contactId === supplier.contactId
		);

		if (isAlreadyInNewSupplier) {
			toast.info("User from this Supplier is already added", {
				toastId: "supplier_info"
			});
			return;
		}

		// If supplier exists in remainingSupplier, remove and add it to newSupplier
		if (supplierIndex !== -1) {
			const updatedRemainingSupplier = [...remainingSupplier];
			const updatedNewSupplier = [...newSupplier];

			// Remove the supplier from remainingSupplier
			const [removedSupplier] = updatedRemainingSupplier.splice(supplierIndex, 1);

			// Add the removed supplier to newSupplier
			updatedNewSupplier.push(removedSupplier);

			// Update the state
			setRemainingSupplier(updatedRemainingSupplier);
			setNewSupplier(updatedNewSupplier);
		}
	};

	const handleClearRemainingSupplier = (supplier) => {
		setSelectedCategory(null)
		// Find the supplier index in newSupplier
		const supplierIndex = newSupplier.findIndex(
			(item) => item.contactId === supplier.contactId
		);

		// If supplier exists in newSupplier, remove and add it back to remainingSupplier
		if (supplierIndex !== -1) {
			const updatedNewSupplier = [...newSupplier];
			const updatedRemainingSupplier = [...remainingSupplier];

			// Remove the supplier from newSupplier
			const [removedSupplier] = updatedNewSupplier.splice(supplierIndex, 1);

			// Add the removed supplier back to remainingSupplier
			updatedRemainingSupplier.push(removedSupplier);

			// Update the state
			setNewSupplier(updatedNewSupplier);
			setRemainingSupplier(updatedRemainingSupplier);
		}
	};
	//Handle update button of add new supplier
	const handleSaveNewSupplier = async () => {
		setLoading(true)

		if (basisOf === 'package') {
			// For package-wise, add suppliers as before
			const updated = newSupplier.map((vendor, index) => ({
				vendorId: vendor.vendorId,
				companyName: vendor.companyName,
				initialPrice: 0, // to be filled later
				finalPrice: '',
				priceReduction: '',
				packageRank: `NA`,
				allocation: '',
				total: '',
				newVendor: true
			}));
			setVendorPackages(prev => [...prev, ...updated]);
		} else {
			// For item-wise, add suppliers to ALL items
			const updated = [];
			items.forEach(item => {
				newSupplier.forEach(vendor => {
					updated.push({
						vendorId: vendor.vendorId,
						companyName: vendor.companyName,
						initialPrice: 0, // to be filled later
						finalPrice: '',
						priceReduction: '',
						packageRank: `NA`,
						allocation: '',
						totalPrice: '',
						newVendor: true,
						itemId: item.id // Associate with specific item
					});
				});
			});
			setVendorPackages(prev => [...prev, ...updated]);
		}

		setLoading(false)
		setNewSupplier([]);
		toggleDrawer("addsupplier", false)
	};

	const handleRemoveSupplier = (vendorId) => {
		const updatedPackages = vendorPackages.filter(pkg => pkg.vendorId !== vendorId);
		setVendorPackages(updatedPackages);
		setSelectedSupplier(prev => prev.filter(id => id !== vendorId));
	};

	// Handle add item form field changes
	const handleItemFieldChange = (field, value) => {
		setNewItemData(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Handle file changes
	const handleItemFileChange = (field, file) => {
		setNewItemData(prev => ({
			...prev,
			[field]: file
		}));
	};

	// Handle add item form reset
	const handleResetItemForm = () => {
		setNewItemData({
			itemName: '',
			itemCode: '',
			itemCategory: '',
			itemType: '',
			itemTypeId: '',
			itemDesc: '',
			uom: '',
			quantity: '',
			targetPrice: 0,
			plant: '',
			deliveryDate: '',
			remarks: '',
			itemImage: null,
			itemFile: null,
			version: 1
		});
	};

	// Handle save new item (Add or Update)
	const handleSaveNewItem = async () => {
		// Validation
		if (!newItemData.itemName || !newItemData.quantity || !newItemData.uom || !newItemData.plant || !newItemData.itemType) {
			toast.error('Please fill all required fields');
			return;
		}

		setLoading(true);
		try {

			const payload = {
				id: newItemData.id || 0, // 0 for new items, actual id for updates
				nfaId: props.eventId,
				itemCode: newItemData.itemCode,
				itemName: newItemData.itemName,
				itemCategory: newItemData.itemCategory,
				itemType: newItemData.itemType,
				itemTypeId: newItemData.itemTypeId,
				itemDesc: newItemData.itemDesc,
				uom: newItemData.uom,
				quantity: parseFloat(newItemData.quantity),
				targetPrice: parseFloat(newItemData.targetPrice) || 0,
				version: newItemData.version || 1,
				plant: newItemData.plant,
				deliveryDate: newItemData.deliveryDate || null,
				remarks: newItemData.remarks,
				customerId: customerid,
				itemImage: newItemData.itemImage || '',
				itemFile: newItemData.itemFile || ''
			};

			// Determine if it's an update or add operation
			const isUpdate = newItemData.id && newItemData.id > 0;
			const endpoint = isUpdate
				? `/api/NFAItemService/Update`
				: `/api/NFAItemService/${props.eventId}/AddItems`;

			// For AddItems, wrap payload in array; for Update, send single object
			const requestPayload = isUpdate ? payload : [payload];

			const response = await apiClient.postres(
				endpoint,
				requestPayload,
				atoken
			);

			if (response.status === 200 || response.status === 201) {
				toast.success(isUpdate ? 'Item updated successfully' : 'Item added successfully');
				// Refresh the SOB details to get updated items
				await getSOBDetails(basisOf);
				handleResetItemForm();
				toggleDrawer("additem", false);
			}
		} catch (error) {
			console.error('Error saving item:', error);
			toast.error(getApiErrorMessage(error), { toastId: "save_item_error" });
		} finally {
			setLoading(false);
		}
	};

	const handleSaveUpdateItem = async () => {
		if (!newItemData.itemName || !newItemData.quantity || !newItemData.uom || !newItemData.plant || !newItemData.itemType) {
			toast.error('Please fill all required fields');
			return;
		}
		if (!newItemData.id || newItemData.id === 0) {
			await handleSaveNewItem();
			return;
		}
		setLoading(true);
		try {
			const payload = {
				id: newItemData.id,
				nfaId: props.eventId || props.nfaEventId,
				itemCode: newItemData.itemCode,
				itemName: newItemData.itemName,
				itemCategory: newItemData.itemCategory,
				itemType: newItemData.itemType,
				itemTypeId: newItemData.itemTypeId,
				itemDesc: newItemData.itemDesc,
				uom: newItemData.uom,
				quantity: parseFloat(newItemData.quantity),
				targetPrice: parseFloat(newItemData.targetPrice) || 0,
				version: newItemData.version || 1,
				plant: newItemData.plant,
				deliveryDate: newItemData.deliveryDate || null,
				remarks: newItemData.remarks,
				customerId: customerid,
				itemImage: newItemData.itemImage || '',
				itemFile: newItemData.itemFile || ''
			};
			const response = await apiClient.postres(`/api/NFAItemService/Update`, payload, atoken);
			if (response.status === 200 || response.status === 201) {
				toast.success('Item updated successfully');
				const updatedVendorPackages = vendorPackages.map(pkg =>
					pkg.itemId === newItemData.id
						? { ...pkg, allocation: 0, totalPrice: 0 }
						: pkg
				);
				setVendorPackages(updatedVendorPackages);
				await getSOBDetails(basisOf);
				handleResetItemForm();
				toggleDrawer("additem", false);
			}
		} catch (error) {
			toast.error(getApiErrorMessage(error), { toastId: "update_item_error" });
		} finally {
			setLoading(false);
		}
	};

	// Handle edit item - open drawer with prefilled data
	const handleEditItem = (item) => {
		setNewItemData({
			id: item.id,
			itemName: item.itemName || '',
			itemCode: item.itemCode || '',
			itemCategory: item.itemCategory || '',
			itemType: item.itemType || '',
			itemTypeId: item.itemTypeId || '',
			itemDesc: item.itemDesc || '',
			uom: item.uom || '',
			quantity: item.quantity || '',
			targetPrice: item.targetPrice || 0,
			plant: item.plant || '',
			deliveryDate: item.deliveryDate || '',
			remarks: item.remarks || '',
			itemImage: null,
			itemFile: null,
			version: item.version || props.nfaEventVersion || 0,
			nfaId: item.nfaId || props.nfaEventId || 0
		});
		toggleDrawer("additem", true);
	};

	// Handle delete item
	const handleDeleteItem = async (itemId) => {
		if (!window.confirm('Are you sure you want to delete this item?')) {
			return;
		}

		setLoading(true);
		try {
			const response = await apiClient.postres(
				`/api/NFAItemService/${itemId}/DeleteAll`,
				{},
				atoken
			);

			if (response) {
				toast.success('Item deleted successfully');
				setItems(prev => prev.filter(i => i.id !== itemId));
			}
		} catch (error) {
			console.error('Error deleting item:', error);
			toast.error('Failed to delete item');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (items.length > 0 && vendorPackages.length > 0) {
			console.log('item', items);
			console.log('vendor', vendorPackages);
		}
	}, [items, vendorPackages]);

	//For Budget Status Calculation
	useEffect(() => {
		let newBudgetStatus = "";
		let newSaving = parseFloat(props.nfaBudget || "0") - parseFloat(props.nfaAmount || "0");
		if (props.nfaAmount === 0) {
			newBudgetStatus = "";
		}
		else {
			if (newSaving >= 0) {
				newBudgetStatus = "Within Budget";
			}
			else if (newSaving < 0 && props.nfaBudget !== 0) {
				newBudgetStatus = "Outside Budget";
			}
			else if (props.nfaBudget === 0) {
				newBudgetStatus = "Not Budgeted";
				newSaving = 0;
			}
			else {
				newBudgetStatus = "";
			}
		}
		setBudgetStatus(newBudgetStatus);
		// formik.setFieldValue("budgetStatus", newBudgetStatus);
		setSaving(newSaving);
		// formik.setFieldValue("nfaSaving", newSaving);

	}, [props.nfaAmount, props.nfaBudget])

	useEffect(() => {
		if (props?.nfaBudget !== budget) {
			props?.updateBudget(budget);
		}
	}, [budget])

	useEffect(() => {
		if (props?.amount !== totalAmount) {
			props?.updateAmount(totalAmount);
		}
	}, [totalAmount])

	useEffect(() => {
		if (currency && props?.nfaCurrency !== currency) {
			props?.updateCurrency(currency);
		}
	}, [currency])

	// Function to handle Excel file upload
	const handleUploadExcel = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			const workbook = new ExcelJS.Workbook();
			const arrayBuffer = await file.arrayBuffer();
			await workbook.xlsx.load(arrayBuffer);

			const worksheet = workbook.getWorksheet('SOB Data');
			if (!worksheet) {
				toast.error('Invalid Excel file. Sheet "SOB Data" not found.');
				return;
			}

			// Create a map to store updated values
			const updatedValues = {};
			const excelItemIds = new Set();
			const excelVendorIds = new Set();
			let excelValueType = '';

			// Read data from Excel (starting from row 2, skipping header)
			worksheet.eachRow((row, rowNumber) => {
				if (rowNumber === 1) return; // Skip header row

				const itemId = row.getCell('A').value; // ItemId (hidden column)
				const vendorId = row.getCell('F').value; // VendorId (hidden column)
				const finalPrice = row.getCell('J').value; // FinalPrice
				const allocation = row.getCell('L').value; // Allocation
				const valueTypeFromExcel = row.getCell('M').value; // ValueType

				// Collect itemIds and vendorIds from Excel
				if (itemId) excelItemIds.add(itemId);
				if (vendorId) excelVendorIds.add(vendorId);

				// Get valueType from first data row
				if (rowNumber === 2 && valueTypeFromExcel) {
					excelValueType = valueTypeFromExcel.toLowerCase();
				}

				if (itemId && vendorId) {
					const key = `${itemId}_${vendorId}`;
					updatedValues[key] = {
						finalPrice: finalPrice !== null && finalPrice !== undefined ? parseFloat(finalPrice) : 0,
						allocation: allocation !== null && allocation !== undefined ? parseFloat(allocation) : 0
					};
				}
			});

			console.log('Updated values from Excel:', updatedValues);

			// Validation 1: Check if valueType in UI matches Excel
			if (excelValueType && excelValueType !== valueType.toLowerCase()) {
				toast.error(`Value Type mismatch! The Excel file has "${excelValueType}" but UI has "${valueType}". Please download the Excel again as the Value Type has been changed.`);
				event.target.value = '';
				return;
			}

			// Validation 2: Check if all itemIds in Excel match items in UI
			const uiItemIds = new Set(items.map(item => item.id));
			const missingItemsInUI = [...excelItemIds].filter(id => !uiItemIds.has(id));
			const missingItemsInExcel = [...uiItemIds].filter(id => !excelItemIds.has(id));

			if (missingItemsInUI.length > 0 || missingItemsInExcel.length > 0) {
				toast.error('Item mismatch detected! The items in the Excel file do not match the current items in the UI. Please download the Excel again.');
				event.target.value = '';
				return;
			}

			// Validation 3: Check if vendor count matches (detect if new vendors were added)
			const uiVendorItemCombinations = new Set(
				vendorPackages.map(vp => `${vp.itemId}_${vp.vendorId}`)
			);
			const excelVendorItemCombinations = new Set(Object.keys(updatedValues));

			// Check if counts match
			if (uiVendorItemCombinations.size !== excelVendorItemCombinations.size) {
				toast.error('Vendor count mismatch! New vendors have been added or removed in the UI. Please download the Excel again as the number of vendors has changed.');
				event.target.value = '';
				return;
			}

			// Check if all combinations in UI exist in Excel
			for (const combo of uiVendorItemCombinations) {
				if (!excelVendorItemCombinations.has(combo)) {
					toast.error('Vendor mismatch detected! The vendors in the Excel file do not match the current vendors in the UI. Please download the Excel again.');
					event.target.value = '';
					return;
				}
			}

			// Validate allocations per item before updating
			const itemAllocationSums = {};
			const itemMap = {};

			// Build item map for quick lookup
			items.forEach(item => {
				itemMap[item.id] = item;
				itemAllocationSums[item.id] = 0;
			});

			// Calculate sum of allocations per item from Excel data
			Object.keys(updatedValues).forEach(key => {
				const [itemId, vendorId] = key.split('_').map(Number);
				const allocation = updatedValues[key].allocation;

				if (itemAllocationSums[itemId] !== undefined) {
					itemAllocationSums[itemId] += allocation;
				}
			});

			// Validate based on valueType
			let validationFailed = false;
			let errorMessage = '';

			for (const [itemId, totalAllocation] of Object.entries(itemAllocationSums)) {
				const item = itemMap[itemId];
				if (!item) continue;

				if (valueType === 'percentage' && totalAllocation > 100) {
					validationFailed = true;
					errorMessage = `Allocation validation failed for item "${item.itemName}": Total allocation (${totalAllocation.toFixed(2)}%) exceeds 100%.`;
					break;
				} else if (valueType === 'absolute' && totalAllocation > item.quantity) {
					validationFailed = true;
					errorMessage = `Allocation validation failed for item "${item.itemName}": Total allocation (${totalAllocation.toFixed(2)}) exceeds item quantity (${item.quantity}).`;
					break;
				}
			}

			// If validation fails, show error and don't update
			if (validationFailed) {
				toast.error(errorMessage);
				event.target.value = ''; // Clear the file input
				return;
			}

			// Update vendorPackages state with new values
			setVendorPackages(prevPackages => {
				return prevPackages.map(vendor => {
					const key = `${vendor.itemId}_${vendor.vendorId}`;
					if (updatedValues[key]) {
						const updated = {
							...vendor,
							finalPrice: updatedValues[key].finalPrice,
							allocation: updatedValues[key].allocation
						};

						// Recalculate price reduction and total price
						const initialPrice = vendor.initialPrice || 0;
						const finalPrice = updatedValues[key].finalPrice;
						const allocation = updatedValues[key].allocation;

						// Only calculate price reduction if initialPrice is not 0 (not 'Not Quoted')
						updated.priceReduction = initialPrice !== 0 ? initialPrice - finalPrice : '';

						// Get item quantity for absolute calculation
						const currentItem = items.find(item => item.id === vendor.itemId);
						const itemQuantity = currentItem?.quantity || 0;

						// Calculate totalPrice based on valueType (same logic as handleAllocationChangeItem)
						// For percentage: (allocation / 100) * finalPrice
						// For absolute: (finalPrice / itemQuantity) * allocation
						updated.totalPrice = valueType === 'percentage'
							? ((allocation / 100) * finalPrice).toFixed(4)
							: ((finalPrice / itemQuantity) * allocation).toFixed(4);

						return updated;
					}
					return vendor;
				});
			});

			toast.success('Excel data uploaded and applied successfully!');

			// Clear the file input
			event.target.value = '';
		} catch (error) {
			console.error('Error reading Excel file:', error);
			toast.error('Failed to read Excel file. Please check the file format.');
		}
	};

	// Function to download Excel with items and vendor packages data
	const handleDownloadExcel = async () => {
		try {
			console.log('Items:', items);
			console.log('VendorPackages:', vendorPackages);

			// Use actual data or fallback to temp data for testing
			// const itemsData = items.length > 0 ? items : tempItemData;
			// const vendorData = vendorPackages.length > 0 ? vendorPackages : tempVendorPackagesData;
			const itemsData = items;
			const vendorData = vendorPackages;

			// IMPORTANT: Sort vendorPackages first by itemId, then by vendorId
			const sortedVendorData = [...vendorData].sort((a, b) => {
				if (a.itemId !== b.itemId) {
					return a.itemId - b.itemId; // Sort by itemId first
				}
				return a.vendorId - b.vendorId; // Then by vendorId
			});

			console.log('Sorted Vendor Data:', sortedVendorData);

			const workbook = new ExcelJS.Workbook();
			const worksheet = workbook.addWorksheet('SOB Data');

			// Define columns (Total column removed, ValueType added)
			worksheet.columns = [
				{ header: 'ItemId', key: 'itemId', width: 10 },
				{ header: 'ItemCode', key: 'itemCode', width: 15 },
				{ header: 'ItemName', key: 'itemName', width: 25 },
				{ header: 'UOM', key: 'uom', width: 12 },
				{ header: 'Quantity', key: 'quantity', width: 12 },
				{ header: 'VendorId', key: 'vendorId', width: 10 },
				{ header: 'VendorName', key: 'vendorName', width: 30 },
				{ header: 'Rank', key: 'rank', width: 10 },
				{ header: 'InitialPrice', key: 'initialPrice', width: 15 },
				{ header: 'FinalPrice', key: 'finalPrice', width: 15 },
				{ header: 'PriceReduction', key: 'priceReduction', width: 15 },
				{ header: 'Allocation', key: 'allocation', width: 12 },
				{ header: 'ValueType', key: 'valueType', width: 15 },
			];

			// Hide ItemId (Column A) and VendorId (Column F) columns
			worksheet.getColumn('A').hidden = true; // ItemId
			worksheet.getColumn('F').hidden = true; // VendorId

			// Style the header row
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFD3D3D3' }
			};

			// Prepare data rows - directly map from sorted vendor data
			const dataRows = [];

			// Create a map of items for quick lookup
			const itemMap = {};
			itemsData.forEach(item => {
				itemMap[item.id] = item;
			});

			// Track unique item-vendor combinations to avoid duplicates
			const seenCombinations = new Set();

			sortedVendorData.forEach((vendorPackage) => {
				const item = itemMap[vendorPackage.itemId];
				if (!item) {
					console.log(`Item not found for vendorPackage with itemId: ${vendorPackage.itemId}`);
					return;
				}

				// Create unique key for item-vendor combination
				const combinationKey = `${vendorPackage.itemId}_${vendorPackage.vendorId}`;

				// Skip if we've already added this combination
				if (seenCombinations.has(combinationKey)) {
					console.log(`Skipping duplicate: Item ${vendorPackage.itemId}, Vendor ${vendorPackage.vendorId}`);
					return;
				}

				seenCombinations.add(combinationKey);

				const allocation = vendorPackage.allocation || 0;
				const finalPrice = vendorPackage.finalPrice || 0;
				const initialPrice = vendorPackage.initialPrice || 0;
				const priceReduction = initialPrice !== 0 ? initialPrice - finalPrice : 0;

				dataRows.push({
					itemId: item.id || '',
					itemCode: item.itemCode || '',
					itemName: item.itemName || '',
					uom: item.uom || '',
					quantity: item.quantity || 0,
					vendorId: vendorPackage.vendorId || '',
					vendorName: vendorPackage.companyName || '',
					rank: vendorPackage.packageRank || 'NA',
					initialPrice: initialPrice,
					finalPrice: finalPrice,
					priceReduction: priceReduction,
					allocation: allocation,
					valueType: valueType || vendorPackage.valueType || ''
				});
			});

			console.log('Total rows to export:', dataRows.length);
			console.log('Data rows:', dataRows);

			// Add rows to worksheet
			dataRows.forEach(row => {
				worksheet.addRow(row);
			});

			// Auto-fit columns and set alignment
			worksheet.columns.forEach(column => {
				if (column.header) {
					column.alignment = { vertical: 'middle', horizontal: 'left' };
				}
			});

			// Lock header row (row 1)
			worksheet.getRow(1).eachCell((cell) => {
				cell.protection = { locked: true };
			});

			// Updated Column mapping (Total column removed, ValueType added, ItemId and VendorId hidden):
			// A=ItemId (Hidden), B=ItemCode, C=ItemName, D=UOM, E=Quantity, F=VendorId (Hidden), 
			// G=VendorName, H=Rank, I=InitialPrice, J=FinalPrice, K=PriceReduction, L=Allocation, M=ValueType

			// Loop through all data rows (starting from row 2)
			for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
				const row = worksheet.getRow(rowNum);

				// Lock columns A to I (ItemId to InitialPrice) - Always locked
				['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(col => {
					const cell = row.getCell(col);
					cell.protection = { locked: true };
				});

				// Column J (FinalPrice) - Unlock only if value is 0, otherwise lock
				const finalPriceCell = row.getCell('J');
				const finalPriceValue = finalPriceCell.value;
				if (finalPriceValue === 0 || finalPriceValue === '0') {
					finalPriceCell.protection = { locked: false };
				} else {
					finalPriceCell.protection = { locked: true };
				}

				// Column K (PriceReduction) - Always locked
				const priceReductionCell = row.getCell('K');
				priceReductionCell.protection = { locked: true };

				// Column L (Allocation) - Always unlocked (editable)
				const allocationCell = row.getCell('L');
				allocationCell.protection = { locked: false };

				// Column M (ValueType) - Always locked (read-only)
				const valueTypeCell = row.getCell('M');
				valueTypeCell.protection = { locked: true };
			}

			// Protect the worksheet with a password
			// Users can edit unlocked cells but cannot modify locked cells
			worksheet.protect('SOB2024', {
				selectLockedCells: true,
				selectUnlockedCells: true,
				formatCells: false,
				formatColumns: false,
				formatRows: false,
				insertRows: false,
				insertColumns: false,
				deleteRows: false,
				deleteColumns: false,
				sort: false,
				autoFilter: false,
				pivotTables: false
			});

			// Generate Excel file
			const buffer = await workbook.xlsx.writeBuffer();
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});

			// Download file
			const fileName = `SOB_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
			saveAs(blob, fileName);

			toast.success('Excel file downloaded successfully!');
		} catch (error) {
			console.error('Error generating Excel:', error);
			toast.error('Failed to generate Excel file');
		}
	};

	// Show permission denied if no read access (after all hooks)
	if (!eventDetailsCanRead) {
		return (
			<div className="p-3">
				<Alert severity="warning" icon={<HiOutlineInformationCircle />}>
					You do not have permission to view Event Details. Required permission: Event Details - Read
				</Alert>
			</div>
		);
	}

	const itemTableColumns = [
		{ key: 'sno', label: 'S.No', width: 60 },
		{ key: 'itemCode', label: 'Item Code' },
		{ key: 'itemName', label: 'Item / Service' },
		{ key: 'quantity', label: 'Quantity', renderCell: (_, row) => `${row.quantity}${row.uom ? ` (${row.uom})` : ''}` },
		{ key: 'targetPrice', label: 'Target Price', renderCell: (v) => v || 0 },
		{ key: 'uom', label: 'UOM' },
		{ key: 'plant', label: 'Plant' },
		{
			key: '__actions__', label: 'Actions', width: 120,
			renderCell: (_, row) => (
				<div className="d-flex align-items-center gap-1">
					{props?.nfaEventType !== 'RFQ' && props?.nfaEventType !== 'Auction' && props?.nfaEventType !== 'PR' && isDraftStage && eventDetailsCanEdit && (
						<Tooltip title="Edit Item">
							<IconButton size="small" onClick={() => handleEditItem(row)} className="text-primary"><HiPencilAlt /></IconButton>
						</Tooltip>
					)}
					{props?.nfaEventType !== 'RFQ' && props?.nfaEventType !== 'Auction' && props?.nfaEventType !== 'PR' && isDraftStage && eventDetailsCanRemove && (
						<Tooltip title="Delete Item">
							<IconButton size="small" onClick={() => handleDeleteItem(row.id)} className="text-danger"><HiOutlineTrash /></IconButton>
						</Tooltip>
					)}
					<Tooltip title={expandedItems[row.id] ? "Collapse Details" : "Expand Details"}>
						<IconButton size="small" onClick={() => handleItemExpand(row.id)} disabled={!eventDetailsCanRead}
							sx={{ transition: 'transform 0.3s', transform: expandedItems[row.id] ? 'rotate(180deg)' : 'none' }}>
							<ExpandMoreIcon />
						</IconButton>
					</Tooltip>
				</div>
			),
		},
	];

	const packageTableColumns = [
		{ key: 'sno', label: 'S.No', width: 60 },
		{ key: 'companyName', label: 'Vendor Details' },
		{ key: 'packageRank', label: 'Package Rank', width: 120 },
		{ key: 'initialPrice', label: 'Initial Price', width: 120, renderCell: (v) => v !== 0 ? v : 'Not Quoted' },
		{
			key: 'finalPrice', label: 'Final Price', width: 150,
			renderCell: (v, row) => !row.newVendor ? (v !== 0 ? v : 'Not Quoted') : (
				<TextField fullWidth variant="outlined" size="small" className="f14"
					type="number" inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
					value={row.finalPrice ?? ''}
					onChange={(e) => handleNewSupplierPrice(row.vendorId, e.target.value)}
					disabled={!isDraftStage || !eventDetailsCanEdit} />
			),
		},
		{ key: 'priceReduction', label: 'Price Reduction', width: 130 },
		{
			key: 'allocation', label: 'Allocation', width: 150,
			renderCell: (v, row) => (
				<TextField fullWidth variant="outlined" size="small" className="f14"
					type="number" inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
					value={row.allocation ?? ''}
					onChange={(e) => handleAllocationChangePackage(row.vendorId, e.target.value)}
					error={Boolean(allocationErrors[row.vendorId])}
					helperText={allocationErrors[row.vendorId]}
					disabled={!isDraftStage || !eventDetailsCanEdit} />
			),
		},
		{ key: 'totalPrice', label: 'Total', width: 120 },
	];

	return (
		<div>
			<div className="row mb-2">
				<div className="col-12 col-md-4 col-lg-2 mb-3">
					<label className="pe-field-label">Amount <span className="rfq-required-star">*</span></label>
					<TextField fullWidth variant="outlined" size="small" className="f14"
						id="nfaAmount" name="nfaAmount" value={totalAmount} disabled type="number"
					/>
				</div>
				<div className="col-12 col-md-4 col-lg-2 mb-3">
					<label className="pe-field-label">Budget <span className="rfq-required-star">*</span></label>
					<TextField fullWidth variant="outlined" size="small" className="f14"
						id="nfaBudget" name="nfaBudget" value={props.nfaBudget}
						disabled={!canEdit} type="number"
						onChange={(e) => {
							if (DecimalValueRegEx.test(e.target.value)) setBudget(e.target.value);
							else if (e.target.value === "") setBudget('');
						}}
					/>
				</div>
				<div className="col-12 col-md-4 col-lg-2 mb-3">
					<label className="pe-field-label">Currency <span className="rfq-required-star">*</span></label>
					<Autocomplete
						id="nfaCurrency" size="small"
						options={[
							...(currencyList?.filter(cl => cl.currencyNm !== (userDetail?.defaultCurrency || "INR")) || []),
							{ currencyNm: "Add New", id: "new" }
						]}
						getOptionLabel={(option) => option.currencyNm ?? (userDetail?.defaultCurrency || "INR")}
						disabled={!canEdit}
						onChange={(e, value) => {
							if (value && value.id === "new") setOpenCurrencyModal(true);
						}}
						value={props?.nfaCurrency || null}
						isOptionEqualToValue={(option, value) => {
							if (!value) return false;
							if (option.id === "new") return false;
							return option.currencyNm === value.currencyNm || option.id === value.id;
						}}
						renderInput={(params) => (
							<TextField {...params} variant="outlined" size="small" className="w-100 f14" />
						)}
						renderOption={(props, option) => (
							<Box component="li" {...props} key={option.id || option.currencyNm}
								style={option.id === "new" ? { fontStyle: "italic", color: "blue", cursor: "pointer", textDecoration: "underline" } : {}}
							>
								{option.currencyNm}
							</Box>
						)}
						noOptionsText="No options"
					/>
				</div>
				<div className="col-12 col-md-4 col-lg-3 mb-3">
					<label className="pe-field-label">Budget Status</label>
					<TextField fullWidth variant="outlined" size="small" className="f14"
						id="budgetStatus" name="budgetStatus" value={budgetStatus} disabled
					/>
				</div>
				<div className="col-12 col-md-4 col-lg-3 mb-3">
					<label className="pe-field-label">Saving</label>
					<TextField fullWidth variant="outlined" size="small" className="f14"
						id="nfaSaving" name="nfaSaving" value={saving} disabled
					/>
				</div>
			</div>
			<div className="row mb-2">
				<div className="col-12 col-md-6 mb-3">
					<label className="pe-field-label">Basis of</label>
					<FormControl fullWidth size="small">
						<Select
							id="basis-of-select"
							value={basisOf}
							onChange={handleBasisOfChange}
							disabled={!isDraftStage}
						>
							<MenuItem value="package">Package</MenuItem>
							<MenuItem value="item">Item</MenuItem>
						</Select>
					</FormControl>
				</div>
				<div className="col-12 col-md-6 mb-3">
					<label className="pe-field-label">Value Type</label>
					<FormControl fullWidth size="small">
						<Select
							id="value-type-select"
							value={valueType}
							onChange={handleValueTypeChange}
							disabled={!isDraftStage || !eventDetailsCanEdit || basisOf === 'package'}
						>
							<MenuItem value="absolute">Absolute</MenuItem>
							<MenuItem value="percentage">Percentage</MenuItem>
						</Select>
					</FormControl>
				</div>
			</div>
			<div className="rfq-v2-event-drawer-actions mb-3">
				{basisOf === 'item' && (
					<>
						<button
							type="button"
							className="pe-btn pe-btn--secondary"
							onClick={handleDownloadExcel}
							disabled={items.length === 0 || vendorPackages.length === 0}
						>
							Download Excel
						</button>
						<label className={`pe-btn pe-btn--secondary${(!isDraftStage || !eventDetailsCanEdit || items.length === 0) ? ' disabled' : ''}`} style={{ cursor: (!isDraftStage || !eventDetailsCanEdit || items.length === 0) ? 'not-allowed' : 'pointer', opacity: (!isDraftStage || !eventDetailsCanEdit || items.length === 0) ? 0.5 : 1 }}>
							Upload Excel
							<input type="file" hidden accept=".xlsx, .xls" onChange={handleUploadExcel} disabled={!isDraftStage || !eventDetailsCanEdit || items.length === 0} />
						</label>
					</>
				)}
				{basisOf === 'item' && props?.nfaEventType !== 'RFQ' && props?.nfaEventType !== 'Auction' && props?.nfaEventType !== 'PR' && (
					<button
						type="button"
						className="pe-btn pe-btn--primary"
						onClick={() => toggleDrawer("additem", true)}
						disabled={!isDraftStage || !eventDetailsCanCreate}
					>
						<HiPlusSm /> Add Items
					</button>
				)}
				<button
					type="button"
					className="pe-btn pe-btn--primary"
					onClick={() => toggleDrawer("addsupplier", true)}
					disabled={!isDraftStage || !eventDetailsCanCreate}
				>
					<HiPlusSm /> Add More Suppliers
				</button>
			</div>
			{basisOf === 'item' && (
				<PETableSimple
					columns={itemTableColumns}
					rows={items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, i) => ({ ...item, sno: page * rowsPerPage + i + 1 }))}
					getRowKey={(row) => row.id}
					expandedKeys={new Set(Object.keys(expandedItems).filter(k => expandedItems[k]).map(k => Number(k)))}
					onExpandToggle={(key) => handleItemExpand(key)}
					getExpandContent={(row) => {
						const vendors = vendorPackages.filter(vp => vp.itemId === row.id);
						return (
							<PETableSimple
								columns={[
									{ key: 'sno', label: '', width: 60 },
									{ key: 'companyName', label: 'Vendor Details' },
									{ key: 'packageRank', label: 'Item Rank', width: 120 },
									{ key: 'initialPrice', label: 'Initial Price', width: 120, renderCell: (v) => v !== 0 ? v : 'Not Quoted' },
									{
										key: 'finalPrice', label: 'Final Price', width: 150,
										renderCell: (v, vrow) => !vrow.newVendor ? (v !== 0 ? v : 'Not Quoted') : (
											<TextField fullWidth variant="outlined" size="small" className="f14"
												type="number" inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
												value={vrow.finalPrice ?? ''}
												onChange={(e) => handleNewSupplierPrice(vrow.vendorId, e.target.value, row.id)}
												disabled={!isDraftStage || !eventDetailsCanEdit} />
										),
									},
									{ key: 'priceReduction', label: 'Price Reduction', width: 130, renderCell: (v) => v || '' },
									{
										key: 'allocation', label: 'Allocation', width: 150,
										renderCell: (v, vrow) => (
											<TextField fullWidth variant="outlined" size="small" className="f14"
												type="number" inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.]?[0-9]*' }}
												value={vrow.allocation ?? ''}
												onChange={(e) => handleAllocationChangeItem(row.id, vrow.vendorId, e.target.value)}
												error={Boolean(allocationErrors[`${vrow.vendorId}-${row.id}`])}
												helperText={allocationErrors[`${vrow.vendorId}-${row.id}`]}
												disabled={!isDraftStage || !eventDetailsCanEdit} />
										),
									},
									{ key: 'totalPrice', label: 'Total', width: 120, renderCell: (v) => v || '' },
								]}
								rows={vendors.map((v, i) => ({ ...v, sno: i + 1 }))}
								getRowKey={(r) => r.vendorId}
								wrapperStyle={{ borderRadius: 0, border: 'none', borderTop: '1px solid #e5e7eb' }}
							/>
						);
					}}
					wrapperStyle={{ marginBottom: 16 }}
				/>
			)}
			{basisOf === 'package' && (
				<PETableSimple
					columns={packageTableColumns}
					rows={vendorPackages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, i) => ({ ...item, sno: page * rowsPerPage + i + 1 }))}
					getRowKey={(row) => row.vendorId}
					wrapperStyle={{ marginBottom: 16 }}
				/>
			)}

			<React.Fragment key="top">
				{/* Add New Supplier — Bottom Drawer */}
				<CommonBottomDrawer
					open={openDrawer.addsupplier}
					onClose={() => toggleDrawer("addsupplier", false)}
					title="Add New Supplier"
					bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px', gap: '12px' }}
					actions={<>
						<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={() => toggleDrawer("addsupplier", false)}>Close</button>
						<button type="button" className="pe-btn pe-btn--primary" onClick={handleSaveNewSupplier} disabled={!isDraftStage || !eventDetailsCanEdit}>Update</button>
					</>}
				>
					{/* Filters row */}
					<div className="rfq-v2-drawer-form" style={{ flexShrink: 0 }}>
						<div className="rfq-v2-drawer-grid">
							<div className="rfq-v2-drawer-field">
								<span className="rfq-v2-drawer-label">Category</span>
								<Autocomplete
									size="small"
									options={categoryList ?? []}
									fullWidth
									renderInput={(params) => <TextField {...params} placeholder="Select category" />}
									getOptionLabel={(option) => option.categoryName ?? ""}
									isOptionEqualToValue={(option, value) => option.id === value?.id}
									value={selectedCategory}
									onChange={(e, newvalue) => {
										setSelectedCategory(newvalue);
										setSupplierSearchText('');
										handleSupplierWithCategory(newvalue);
									}}
								/>
							</div>
							<div className="rfq-v2-drawer-field">
								<span className="rfq-v2-drawer-label">Search Supplier</span>
								<TextField
									size="small"
									fullWidth
									placeholder="Search by name or email..."
									value={supplierSearchText}
									onChange={(e) => { setSupplierSearchText(e.target.value); setPageTS(1); }}
								/>
							</div>
						</div>
					</div>

					{/* Two-column supplier lists */}
					{(() => {
						const filteredRemaining = (remainingSupplier ?? []).filter(x => {
							if (!supplierSearchText) return true;
							const q = supplierSearchText.toLowerCase();
							return (
								(x?.contactPerson ?? '').toLowerCase().includes(q) ||
								(x?.email ?? '').toLowerCase().includes(q) ||
								(x?.companyName ?? '').toLowerCase().includes(q)
							);
						});
						const pagedRemaining = filteredRemaining.slice((pageTS - 1) * pageCount, pageTS * pageCount);
						const pagedNew = (newSupplier ?? []).slice((pageSS - 1) * pageCount, pageSS * pageCount);

						return (
							<div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
								{/* Remaining Suppliers */}
								<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
										<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Remaining Suppliers</span>
										<span style={{ background: '#2A68D3', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{filteredRemaining.length}</span>
										{selectedCategory && (
											<span style={{ background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '11px', fontWeight: 600, padding: '1px 8px' }}>{selectedCategory?.categoryName}</span>
										)}
									</div>
									<div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
										{pagedRemaining.length === 0 ? (
											<div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No suppliers found</div>
										) : pagedRemaining.map((x, i) => (
											<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
												<button type="button" className="pe-icon-btn pe-icon-btn--add" style={{ flexShrink: 0 }} onClick={() => handleCheckRemainingSupplier(x)} disabled={!isDraftStage || !eventDetailsCanCreate}>
													<HiOutlineUserAdd />
												</button>
												<div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
													<span style={{ fontWeight: 500 }}>{x?.contactPerson}</span>
													{' | '}{x?.email}
													{' | '}<span style={{ color: '#6b7280' }}>{x?.companyName}</span>
												</div>
											</div>
										))}
									</div>
									<PEPagination page={pageTS} pageSize={pageCount} totalRows={filteredRemaining.length} onPageChange={setPageTS} onPageSizeChange={(n) => { setPageCount(n); setPageTS(1); }} />
								</div>

								{/* New Suppliers */}
								<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0 }}>
										<span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>New Suppliers</span>
										<span style={{ background: '#2A68D3', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 700, padding: '1px 7px' }}>{newSupplier?.length ?? 0}</span>
									</div>
									<div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
										{pagedNew.length === 0 ? (
											<div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No suppliers added yet</div>
										) : pagedNew.map((x, i) => (
											<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
												<button type="button" className="pe-icon-btn pe-icon-btn--delete" style={{ flexShrink: 0 }} onClick={() => handleClearRemainingSupplier(x)} disabled={!isDraftStage || !eventDetailsCanRemove}>
													<HiOutlineX />
												</button>
												<div style={{ fontSize: '12px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
													<span style={{ fontWeight: 500 }}>{x?.contactPerson}</span>
													{' | '}{x?.email}
													{' | '}<span style={{ color: '#6b7280' }}>{x?.companyName}</span>
												</div>
											</div>
										))}
									</div>
									<PEPagination page={pageSS} pageSize={pageCount} totalRows={newSupplier?.length ?? 0} onPageChange={setPageSS} onPageSizeChange={(n) => { setPageCount(n); setPageSS(1); }} />
								</div>
							</div>
						);
					})()}
				</CommonBottomDrawer>

				{/* Add Product — Bottom Drawer */}
				<CommonBottomDrawer
					open={openDrawer.additem}
					onClose={() => toggleDrawer("additem", false)}
					title={newItemData?.id > 0 ? 'Edit Product / Service' : 'Add Product / Service'}
					bodyStyle={{ overflowY: 'auto', padding: '16px' }}
					actions={
						<>
							<button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={() => toggleDrawer("additem", false)}>Cancel</button>
							{isDraftStage && eventDetailsCanCreate && (
								<>
									<button type="reset" form={NFA_ADD_PRODUCT_FORM_ID} className="pe-btn pe-btn--secondary">Reset</button>
									<button type="submit" form={NFA_ADD_PRODUCT_FORM_ID} className="pe-btn pe-btn--primary">
										{newItemData?.id > 0 ? 'Update' : 'Add'}
									</button>
								</>
							)}
						</>
					}
				>
					<NFAAddProductCell
						nfaId={props.eventId}
						itemEditTempData={newItemData?.id > 0 ? newItemData : null}
						callbackItemAdd={() => { getSOBDetails(basisOf); toggleDrawer("additem", false); }}
						action={isDraftStage && eventDetailsCanCreate}
						categoryList={Array.isArray(itemCategoryList) ? itemCategoryList : []}
						itemTypeList={addItemTypeList}
						plantList={Array.isArray(plantList) ? plantList : []}
						uomList={Array.isArray(uomList) ? uomList : []}
						onLoadCategoryList={getItemCategoryList}
						onLoadItemTypeList={getAddItemTypeList}
						onLoadPlantList={getPlantList}
						onLoadUomList={getUomList}
						onOpenCategoryModal={() => setAddItemCategoryModal(true)}
						onOpenItemTypeModal={() => setAddItemTypeModal(true)}
						onOpenPlantModal={() => setAddItemPlantModal(true)}
						onOpenUomModal={() => setAddItemUomModal(true)}
					/>
				</CommonBottomDrawer>

				{/* Add-item modals — rendered OUTSIDE the drawer so they are not affected by drawer z-index or event handling */}
				<PEModal
					open={addItemCategoryModal}
					size="lg"
					title="Manage Item Category"
					onClose={() => setAddItemCategoryModal(false)}
					bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
					bodyClassName="d-flex flex-column"
				>
					<AddPrItemCategory
						isModal
						handleCategoryList={(list) => {
							setItemCategoryList(Array.isArray(list) ? list : []);
						}}
					/>
				</PEModal>
				<PEModal
					open={addItemTypeModal}
					size="lg"
					title="Manage Item Type"
					onClose={() => setAddItemTypeModal(false)}
					bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
					bodyClassName="d-flex flex-column"
				>
					<AddEditItemType
						isModal
						handleItemTypeList={(list) => {
							setAddItemTypeList(Array.isArray(list) ? list.filter(r => r?.isActive) : []);
						}}
					/>
				</PEModal>
				<PEModal
					open={addItemPlantModal}
					size="lg"
					title="Manage Plant"
					onClose={() => setAddItemPlantModal(false)}
					bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
					bodyClassName="d-flex flex-column"
				>
					<AddPrPlant
						isModal
						handlePlantList={(list) => {
							setPlantList(Array.isArray(list) ? list : []);
						}}
					/>
				</PEModal>
				<PEModal
					open={addItemUomModal}
					size="lg"
					title="Manage UOM"
					onClose={() => setAddItemUomModal(false)}
					bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
					bodyClassName="d-flex flex-column"
				>
					<AddUpdateUom
						isModal
						handleUomList={(list) => {
							setUomList(Array.isArray(list) ? list : []);
						}}
					/>
				</PEModal>

			</React.Fragment>
			{/* modal for item type */}
			<PEModal
				open={ItemTypeModal}
				size="lg"
				title="Manage Item Type"
				onClose={CloseItemTypeModal}
			>
				<AddEditItemType
					handleItemTypeList={handleItemTypeList}
					isModal={true}
				/>
			</PEModal>
			<PEModal
				open={OpenCurrencyModal}
				size="lg"
				title="Manage Currency"
				onClose={CloseCurrencyModal}
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
			>
				<AddEditCurrency handleCurrencyList={handleCurrencyList} />
			</PEModal>
		</div>
	);
});

export default NFASOBEventBoxRFQ;
