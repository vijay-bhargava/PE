import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import PEModal from '../../../components/PEModal';
import {
	InputAdornment, TextField, IconButton,
	Autocomplete, Box, Tooltip
} from '@mui/material'
import { useStateValue } from '../../../store'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { HiPencilAlt, HiPlusSm, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
	FindItemCategory, FindPlantStorage, PRItemServiceAdd,
	PRItemServiceUpdate, getPRManageFind
} from '../../../utils/purchaseRequest';
import { toast } from 'react-toastify';
import AddUpdateUom from '../../../utils/common/AddUpdateUom';
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import AddPrPlant from '../../../utils/common/AddPrPlant';
import AddEditItemType from '../../../utils/common/AddEditITemType';
import { ApiClient } from "../../../Apiclient";
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';
import { uploadFilesOnAzure2, validateFileSize } from '../../../utils/common';
import { UploadOutlined } from '@mui/icons-material';
import { UOMMasterList } from '../../../utils/commerciallibrary';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const AddItemProductsCell = ({ idFromURL, callbackItemAdd, itemEditTempData, handleUomList, action }) => {
	const [{ atoken, rtoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);

	const [itemCatAllList, setItemCatAllList] = useState([]);
	const [itemTypeList, setItemTypeList] = useState([]);
	const [plantAllList, setPlantAllList] = useState([]);
	const [itemList, setItemList] = useState([]);
	const [UOMMaster, setUOMMaster] = useState([]);
	const [uom, setuom] = useState("");
	const [category, setcategory] = useState("");
	const [Plant, setPlant] = useState("");
	const [UomModal, setUomModal] = useState(false);
	const [CategoryModal, setCategoryModal] = useState(false);
	const [PlantModal, setPlantModal] = useState(false);
	const [ItemTypeModal, setItemTypeModal] = useState(false);
	const [gridloading, setGridloading] = useState(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [itemMasterModal, setItemMasterModal] = useState(false);
	const [editItemMasterData, setEditItemMasterData] = useState(null);
	const [isFromPRItem, setIsFromPRItem] = useState(false);
	const [searchItemModal, setSearchItemModal] = useState(false);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [searchMode, setSearchMode] = useState(false);
	const [quickFilterValue, setQuickFilterValue] = useState('');
	const [debouncedQuickFilterValue, setDebouncedQuickFilterValue] = useState('');
	const [searchDataLoaded, setSearchDataLoaded] = useState(false);
	// When the parent (PurchaseRequest) passes an item to edit, use it to
	// prefill this drawer's form. PurchaseRequest passes `itemEditTempData`.
	useEffect(() => {
		try {
			if (itemEditTempData && Object.keys(itemEditTempData).length > 0) {
				// Clean any trailing dash from plant value (legacy data issue)
				const cleanedData = {
					...itemEditTempData,
					plant: itemEditTempData.plant?.replace(/\s*-\s*$/, "").trim() || ""
				};
				setEditItemMasterData(cleanedData);
				setIsFromPRItem(true);
				// Load all required lists for edit mode to ensure Autocomplete dropdowns can match saved values
				if (itemTypeList.length === 0) pullItemTypeList();
				if (itemCatAllList.length === 0) PullItemCateogory();
				if (UOMMaster.length === 0) pullUOMMasterList();
				if (plantAllList.length === 0) PullPlantStorage();
			} else {
				setEditItemMasterData(null);
				setIsFromPRItem(false);
			}
		} catch (e) {
			// defensive: if itemEditTempData is not an object, ignore
			setEditItemMasterData(null);
			setIsFromPRItem(false);
		}
	}, [itemEditTempData]);

	const [uploadingImage, setUploadingImage] = useState(false);
	const [uploadingAttachment, setUploadingAttachment] = useState(false);
	const CloseUomModal = () => setUomModal(false);
	const CloseCategoryModal = () => setCategoryModal(false);
	const ClosePlantModal = () => setPlantModal(false);
	const CloseItemTypeModal = () => setItemTypeModal(false);

	const PullItemCateogory = () => {
		var data = { CustomerId: customerid, };
		FindItemCategory(data, atoken).then((resp) => {
			setItemCatAllList(resp);
		});
	};

	const handleCategoryList = (array) => {
		setItemCatAllList(array);
	};

	const pullUOMMasterList = () => {
		var data = { CustomerId: customerid };
		UOMMasterList(data, atoken).then((res) => {
			setUOMMaster(res);
		});
	};

	const PullPlantStorage = () => {
		var data = { CustomerId: customerid, };
		FindPlantStorage(data, atoken).then((resp) => {
			setPlantAllList(resp);
		});
	};

	const handlePlantList = (array) => {
		setPlantAllList(array);
	};

	const pullItemTypeList = async () => {
		try {
			if (!customerid) return;
			const res = await apiClient.get(`api/ItemType/Find?CustomerId=${customerid}`, atoken);
			if (Array.isArray(res)) {
				setItemTypeList(res);
			} else if (res && res.result) {
				setItemTypeList(res.result);
			} else {
				setItemTypeList([]);
			}
		} catch (err) {
			setItemTypeList([]);
		}
	};

	const handleItemTypeList = (array) => {
		setItemTypeList(array);
	};

	const pullItemMaster = async (pageNumber = 1, pageSizeVal = 10, isSearch = false) => {
		try {
			setGridloading(!isSearch);
			if (!isSearch) {
				setSearchDataLoaded(false);
			}

			// If in search mode, fetch all records with a large page size
			const effectivePageSize = isSearch ? 10000 : pageSizeVal;
			const effectivePageNumber = isSearch ? 1 : pageNumber;

			let apiUrl = `api/ItemMaster/Find?CustomerId=${customerid}&pageNumber=${effectivePageNumber}&pageSize=${effectivePageSize}`;
			const res = await apiClient.get(apiUrl, atoken);

			if (!isSearch) { setGridloading(false); }
			setTotalCount(res?.pageMetadata?.totalCount || 0);
			if (isSearch) { setSearchDataLoaded(true); }

			if (res && res.result) { setItemList(res.result); }
			else {
				setItemList([]);
				setTotalCount(0);
			}
		} catch (err) {
			setItemList([]);
			setTotalCount(0);
			setGridloading(false);
		}
	};

	useEffect(() => {
		if (customerid) pullItemMaster(1, pageSize, false);
	}, [customerid]);

	// Load initial data when modal opens
	useEffect(() => {
		if (searchItemModal && itemList.length === 0) {
			pullItemMaster(1, pageSize, false);
		}
	}, [searchItemModal]);

	// Debounce quick filter value
	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			setDebouncedQuickFilterValue(quickFilterValue);
		}, 400);
		return () => clearTimeout(debounceTimer);
	}, [quickFilterValue]);

	// Handle search mode activation
	useEffect(() => {
		const hasSearchText = debouncedQuickFilterValue.trim() !== '';

		if (hasSearchText) {
			if (!searchMode) {
				setSearchMode(true);
				setPage(0);
			}
			if (!searchDataLoaded) {
				pullItemMaster(1, pageSize, true);
			}
			return;
		}

		if (searchMode) {
			setSearchMode(false);
			setPage(0);
			pullItemMaster(1, pageSize, false);
		}
	}, [debouncedQuickFilterValue, searchMode, searchDataLoaded, pageSize]);

	const [loadingSubmit, setLoadingSubmit] = useState(false)

	const validationSchema = yup.object().shape({
		itemCode: yup
			.string('Enter Item Code')
			.required('Item Code is required'),
		itemName: yup
			.string('Enter Item/Service Name')
			.required('Item/Service Name is required'),
		itemCategory: yup
			.string('Select Item Category')
			.required('Item Category is required'),
		// plant: yup
		//     .string('Select Plant')
		//     .required('Plant is required'),
		itemDesc: yup
			.string('Enter Description')
			.required('Description is required'),
		// quantity: yup
		//     .string('Enter Quantity')
		//     .required('Quantity is required'),
		// Quantity is required only when editing/adding items to a PR.
		// For ItemMaster modal we keep it optional so the minimal ItemMaster payload can be submitted.
		quantity: yup.number()
			.typeError('Quantity is required')
			.required('Quantity is required')
			.min(0.01, 'Quantity must be greater than 0'),
		uom: yup
			.string('Select UOM')
			.required('UOM is required'),
		// deliveryDate: yup
		//     .string('Select Delivery Date')
		//     .required('Delivery Date is required'),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			itemName: editItemMasterData && editItemMasterData?.itemName ? editItemMasterData?.itemName : '',
			itemCode: editItemMasterData && editItemMasterData?.itemCode ? editItemMasterData?.itemCode : '',
			itemCategory: editItemMasterData && editItemMasterData?.itemCategory ? editItemMasterData?.itemCategory : '',
			plant: editItemMasterData && editItemMasterData?.plant ? editItemMasterData?.plant : '',
			itemDesc: editItemMasterData && editItemMasterData?.itemDesc ? editItemMasterData?.itemDesc : '',
			targetPrice: editItemMasterData && editItemMasterData?.targetPrice ? editItemMasterData?.targetPrice : '',
			quantity: editItemMasterData && editItemMasterData?.quantity ? editItemMasterData?.quantity : '',
			uom: editItemMasterData && editItemMasterData?.uom ? editItemMasterData?.uom : '',
			deliveryDate: editItemMasterData && editItemMasterData?.deliveryDate ? new Date(editItemMasterData?.deliveryDate) : null,
			poNumber: editItemMasterData && editItemMasterData?.poNumber ? editItemMasterData?.poNumber : '',
			poVendorName: editItemMasterData && editItemMasterData?.poVendorName ? editItemMasterData?.poVendorName : '',
			poUnitRate: editItemMasterData && editItemMasterData?.poUnitRate ? editItemMasterData?.poUnitRate : '',
			poDate: editItemMasterData && editItemMasterData?.poDate ? new Date(editItemMasterData?.poDate) : null,
			poValue: editItemMasterData && editItemMasterData?.poValue ? editItemMasterData?.poValue : '',
			unitRate: editItemMasterData?.unitRate || 0,
			remarks: editItemMasterData && editItemMasterData?.remarks ? editItemMasterData?.remarks : '',
			itemFile: editItemMasterData && editItemMasterData?.itemFile ? editItemMasterData?.itemFile : "",
			itemImage: editItemMasterData && editItemMasterData?.itemImage ? editItemMasterData?.itemImage : "",
			itemType: editItemMasterData && editItemMasterData?.itemType ? editItemMasterData?.itemType : '',
			itemTypeId: editItemMasterData && editItemMasterData?.itemTypeId ? editItemMasterData?.itemTypeId : 0
		},
		validationSchema: validationSchema,
		onSubmit: async (values, { resetForm }) => {
			if (loadingSubmit) return; // Prevent multiple submissions
			setLoadingSubmit(true)

			try {
				// Use PRItemService when submitting from the inline PR drawer (itemMasterModal is closed).
				// Use ItemMaster APIs when submitting from the ItemMaster modal (itemMasterModal is open).
				if (idFromURL && !itemMasterModal) {
					// Ensure quantity is provided for PR items (ItemMaster modal may leave this empty)
					// if (values?.quantity === '' || values?.quantity === null || values?.quantity === undefined || parseFloat(values?.quantity) <= 0) {
					//     toast.error('Quantity is required for PR items');
					//     setLoadingSubmit(false);
					//     return;
					// }
					// Fetch existing PR data to validate duplicate item codes
					const existingPRData = await getPRManageFind({ Id: idFromURL }, atoken);
					if (!existingPRData || existingPRData.length === 0) {
						toast.error("Failed to fetch existing PR data.");
						setLoadingSubmit(false);
						return;
					}

					const existingPRItems = [];
					for (let i = 0; i < existingPRData.length; i++) {
						if (existingPRData[i].prItems && existingPRData[i].prItems.length > 0) {
							existingPRItems.push(...existingPRData[i].prItems);
						}
					}

					// Prevent duplicate itemCode across PR items (except for the item being edited)
					const originalItemCode = editItemMasterData?.itemCode;
					const itemCodeTracker = {};
					for (let item of existingPRItems) {
						if (item.itemCode !== originalItemCode) {
							itemCodeTracker[item.itemCode] = true;
						}
					}

					const itemCode = values.itemCode;
					if (itemCode && itemCodeTracker[itemCode]) {
						toast.error(`Duplicate item code '${itemCode}' found. Please ensure all item codes are unique.`);
						setLoadingSubmit(false);
						return;
					}

					const data = {
						id: editItemMasterData && editItemMasterData?.id > 0 ? editItemMasterData?.id : 0,
						customerId: parseInt(customerid),
						prId: parseInt(idFromURL),
						itemName: values?.itemName,
						itemCode: values?.itemCode,
						erpSourceId: "",
						itemCategory: values?.itemCategory,
						plant: values?.plant ?? '',
						itemDesc: values?.itemDesc,
						targetPrice: values?.targetPrice !== '' ? values?.targetPrice : 0,
						quantity: values?.quantity !== '' ? values?.quantity : 0,
						uom: values?.uom,
						deliveryDate: values?.deliveryDate || null,
						poNumber: values?.poNumber || '',
						poVendorName: values?.poVendorName || '',
						poUnitRate: values?.poUnitRate !== '' ? values?.poUnitRate : 0,
						poDate: values?.poDate || null,
						poValue: values?.poValue !== '' ? values?.poValue : 0,
						remarks: values?.remarks || '',
						itemImage: values?.itemImage || '',
						itemFile: values?.itemFile || '',
						itemType: values?.itemType || '',
						itemTypeId: values?.itemTypeId ? parseInt(values.itemTypeId) : 0
					};

					if (data && data?.id === 0) {
						const res = await PRItemServiceAdd(data, atoken);
						setLoadingSubmit(false);
						if (res && res > 0) {
							callbackItemAdd(res);
						}
					} else {
						const res = await PRItemServiceUpdate(data, atoken);
						setLoadingSubmit(false);
						if (res && res > 0) {
							callbackItemAdd(res);
						}
					}
				} else {
					// Fallback: operate on ItemMaster (existing behavior)
					// Prepare payload with ONLY allowed fields for ItemMaster Add/Update
					const itemMasterPayload = {
						id: editItemMasterData && editItemMasterData?.id ? editItemMasterData?.id : 0,
						ItemCode: values?.itemCode || "",
						ItemName: values?.itemName || "",
						ItemCategory: values?.itemCategory || "",
						UOM: values?.uom || "",
						Plant: values?.plant ?? "",
						ItemDesc: values?.itemDesc || "",
						poNumber: values?.poNumber || "",
						poVendorName: values?.poVendorName || "",
						poDate: values?.poDate || null,
						unitRate: values?.unitRate || 0,
						poValue: values?.poValue || 0
					};

					const isItemMasterEdit = editItemMasterData && editItemMasterData?.id > 0;

					if (!isItemMasterEdit) {
						const res = await apiClient.post('api/ItemMaster/Add', itemMasterPayload, atoken);
						setLoadingSubmit(false);
						if (res !== '' && res !== false) {
							toast.success("Item added successfully!");
							setItemMasterModal(false);
							setEditItemMasterData(null);
							resetForm();
							pullItemMaster(); // Refresh the list
						} else {
							toast.error('Failed to add item');
						}
					} else {
						const res = await apiClient.post('api/ItemMaster/Update', itemMasterPayload, atoken);
						setLoadingSubmit(false);
						// Close modal and return to search grid immediately after Update, same as Add
						setItemMasterModal(false);
						setEditItemMasterData(null);
						resetForm();
						setIsFromPRItem(false);
						setSearchItemModal(true); // Return to item search grid
						// Treat any non-empty and non-false response as success (handles numeric 0 or object responses)
						if (res !== '' && res !== false) {
							toast.success("Item updated successfully!");
							pullItemMaster(); // Refresh the list
						} else {
							toast.error('Failed to update item');
						}
					}
				}
			} catch (error) {
				setLoadingSubmit(false);
				toast.error(error?.message || "An error occurred");
			}
		}
	});

	const handleItemCategoryChange = (event, value) => {
		if (value && value.id === "new") {
			setCategoryModal(true);
			setcategory("");
		} else {
			const selectedOption = itemCatAllList.find(option => option.categoryDescription === value?.categoryDescription);

			// Set the Formik value and local state
			formik.setFieldValue("itemCategory", selectedOption?.categoryDescription || "");
			setcategory(selectedOption?.categoryDescription || "");
		}
	};
	const handleItemTypeChange = (event, value) => {
		if (value && value.id === 'new') {
			setItemTypeModal(true);
		} else if (value) {
			formik.setFieldValue('itemType', value.itemType || '');
			formik.setFieldValue('itemTypeId', value.id || 0);
		} else {
			formik.setFieldValue('itemType', '');
			formik.setFieldValue('itemTypeId', 0);
		}
	};
	const handleUomChange = (event, value) => {
		if (value && value.id === "new") {
			setUomModal(true);
		} else {
			const selectedOption = UOMMaster.find(option => option.uom === value?.uom);
			setuom(selectedOption?.uom);
			formik.setFieldValue("uom", selectedOption?.uom || "");
		}
	};

	const handlePlantChange = (event, value) => {
		if (value && value.slCode === "new") {
			// Open the modal or dialog for adding a new plant
			setPlantModal(true);
		} else if (value) {
			// Store only slDesc in formik (not the concatenated value with dash)
			const plantValue = value.slDesc || "";
			formik.setFieldValue("plant", plantValue);
			setPlant(plantValue);
		} else {
			// Clear the field if value is null
			formik.setFieldValue("plant", "");
			setPlant("");
		}
	};

	const handleDateChange = (newValue, formik) => {
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0); // Set to the start of the day for comparison
		// Check if the selected date is before today
		if (newValue < currentDate) {
			toast.error("You can't select a past date. Please select today or a future date.");
			return;
		}
		// Set the field value if the date is valid
		formik.setFieldValue('deliveryDate', newValue);
	};

	//file upload changes
	const handleItemImageChange = (event) => {

		if (!validateFileSize(event)) {
			event.target.value = ''; // Reset input
			return;
		}
		const file = event.target.files[0];
		if (file) { UploadItemImage(file); }
		event.target.value = ''; // Reset input to allow re-uploading the same file
	};

	const UploadItemImage = async (file) => {
		if (!file) { return; }
		setUploadingImage(true);
		// Define the data object for upload
		const data = {
			RequestedBy: "customer",
			EventType: "PR",
			CustomerId: customerid,
			Description: "Itemimage",
		};

		// Upload the file to Azure and get the return path
		try {
			const url = await uploadFilesOnAzureURL(data, file, atoken);
			formik.setFieldValue("itemImage", url);
			toast.success("Item image uploaded successfully!");
		} catch (error) {
			console.error("Image upload error:", error);
			formik.setFieldValue("itemImage", "");
			toast.error("Failed to upload item image. Please try again.");
		} finally {
			setUploadingImage(false);
		}
	}
	const handleItemAttachmentChange = (event) => {
		if (!validateFileSize(event)) {
			event.target.value = ''; // Reset input
			return;
		}
		const file = event.target.files[0];
		if (file) { UploadItemAttachment(file); }
		event.target.value = ''; // Reset input to allow re-uploading the same file
	};

	const UploadItemAttachment = async (file) => {
		if (!file) { return; }
		setUploadingAttachment(true);
		// Define the data object for upload
		const data = {
			RequestedBy: "customer",
			EventType: "PR",
			CustomerId: customerid,
			Description: "Itemfile",
		};

		// Upload the file to Azure and get the return path
		try {
			const url = await uploadFilesOnAzure2(data, file, atoken);
			formik.setFieldValue("itemFile", url.blobName);
			toast.success("Item attachment uploaded successfully!");
		} catch (error) {
			console.error("Attachment upload error:", error);
			formik.setFieldValue("itemFile", "");
			toast.error("Failed to upload item attachment. Please try again.");
		} finally {
			setUploadingAttachment(false);
		}
	}

	// DataGrid columns configuration
	const itemColumns = [
		{
			field: "itemCode",
			headerName: "Item Code",
			width: 150,
		},
		{
			field: "itemName",
			headerName: "Item Name",
			width: 200,
		},
		{
			field: "itemType",
			headerName: "Item Type",
			width: 150,
		},
		{
			field: "itemCategory",
			headerName: "Category",
			width: 150,
		},
		{
			field: "uom",
			headerName: "UOM",
			width: 100,
		},

		{
			field: "plant",
			headerName: "Plant",
			width: 150,
		},

		{
			field: "action",
			headerName: "Action",
			width: 80,
			renderCell: (params) => (
				<button
					className="pe-icon-btn pe-icon-btn--edit"
					onClick={() => handleEditItemMaster(params?.row)}
				>
					<HiPencilAlt />
				</button>
			)
		}
	];

	const handleEditItemMaster = (item) => {
		// Editing from the ItemMaster grid: treat as item-master edit, not PR edit
		setIsFromPRItem(false);
		setEditItemMasterData(item);
		setItemMasterModal(true);
	};

	const getRowId = (row) => {
		return row.itemCode || row.id;
	};

	const CloseItemMasterModal = () => {
		setItemMasterModal(false);
		setEditItemMasterData(null);
		setUploadingImage(false);
		setUploadingAttachment(false);
		formik.resetForm();
		setIsFromPRItem(false);
	};

	const CloseSearchItemModal = () => {
		setSearchItemModal(false);
		setSelectedRows([]);
		setQuickFilterValue('');
		setSearchMode(false);
		setSearchDataLoaded(false);
		setPage(0);
	};

	const handleSelectItemFromGrid = () => {
		if (selectedRows.length === 0) {
			toast.warning('Please select at least one item');
			return;
		}
		// Pre-fill form with first selected item
		const selectedItemCode = selectedRows[0];
		const selectedItem = itemList.find((it) => String(it.itemCode) === String(selectedItemCode));
		if (selectedItem) {
			formik.setFieldValue('itemCode', selectedItem.itemCode ?? '');
			formik.setFieldValue('itemName', selectedItem.itemName ?? '');
			formik.setFieldValue('itemType', selectedItem.itemType ?? '');
			formik.setFieldValue('itemTypeId', selectedItem.itemTypeId ?? 0);
			formik.setFieldValue('itemCategory', selectedItem.itemCategory ?? '');
			formik.setFieldValue('itemDesc', selectedItem.itemDesc ?? '');
			formik.setFieldValue('uom', selectedItem.uom ?? '');
			formik.setFieldValue('plant', selectedItem.plant ?? '');
			formik.setFieldValue('targetPrice', selectedItem.targetPrice ?? '');
			formik.setFieldValue('itemImage', selectedItem.itemImage ?? '');
			formik.setFieldValue('itemFile', selectedItem.itemFile ?? '');
			// Prefill PO fields from Item Master (unitRate → poUnitRate)
			formik.setFieldValue('poNumber', selectedItem.poNumber || '');
			formik.setFieldValue('poVendorName', selectedItem.poVendorName || '');
			formik.setFieldValue('poDate', selectedItem.poDate ? new Date(selectedItem.poDate) : null);
			formik.setFieldValue('poUnitRate', selectedItem.unitRate || 0);
			formik.setFieldValue('poValue', selectedItem.poValue || 0);
			// Auto-fill quantity if available, otherwise leave for user input
			if (selectedItem.quantity) {
				formik.setFieldValue('quantity', selectedItem.quantity);
			}
		}
		CloseSearchItemModal();
	};

	// When editing an existing PR item (itemEditTempData passed from parent),
	// show ONLY the form. Otherwise show the grid view.
	// Only treat as PR-item edit (render drawer inline) when the data
	// originated from the parent PR (itemEditTempData). Edits from the
	// ItemMaster grid should open the modal instead.

	// Render the form for editing PR item
	const renderEditForm = () => (
		<div className="">
			<form id="add-pr-product-form" onSubmit={formik.handleSubmit} autoComplete="off">
				<input
					id="itemimagefile_modal"
					className="d-none"
					type="file"
					accept="image/jpeg,image/gif,image/png"
					onChange={handleItemImageChange}
				/>
				<input
					id="itemattachmentfile_modal"
					className="d-none"
					type="file"
					onChange={handleItemAttachmentChange}
				/>
				<div className='row mt-2'>
					<div className='col-12 col-md-6 mb-4'>
						<label className="pe-field-label">Item Code</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="itemCode"
							name="itemCode"
							inputProps={{ maxLength: 100 }}
							value={formik.values.itemCode}
							onChange={formik.handleChange}
							error={formik.touched.itemCode && Boolean(formik.errors.itemCode)}
							helperText={formik.touched.itemCode && formik.errors.itemCode}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Tooltip title="Search Item">
											<IconButton size="small" onClick={() => {
												pullItemMaster();
												if (itemTypeList.length === 0) pullItemTypeList();
												setSearchItemModal(true);
											}}>
												<HiOutlineSearch className="f14 text-primary" />
											</IconButton>
										</Tooltip>
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className='col-12 col-md-6 mb-4'>
						<label className="pe-field-label">Item / Service Name <span className="rfq-required-star">*</span></label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="itemName"
							name="itemName"
							inputProps={{ maxLength: 200 }}
							value={formik.values.itemName}
							onChange={formik.handleChange}
							error={formik.touched.itemName && Boolean(formik.errors.itemName)}
							helperText={formik.touched.itemName && formik.errors.itemName}
						/>
					</div>
					<div className='col-12 col-md-6 mb-4'>
						<label className="pe-field-label">Description <span className="rfq-required-star">*</span></label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							multiline={true}
							rows={3}
							id="itemDesc"
							name="itemDesc"
							inputProps={{ maxLength: 2000 }}
							value={formik?.values?.itemDesc}
							onChange={formik.handleChange}
							error={formik.touched.itemDesc && Boolean(formik.errors.itemDesc)}
							helperText={formik.touched.itemDesc && formik.errors.itemDesc}
						/>
					</div>
					<div className='col-12 col-md-6 mb-4'>
						<label className="pe-field-label">Remarks</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							multiline={true}
							rows={3}
							id="remarks"
							name="remarks"
							inputProps={{ maxLength: 2000 }}
							value={formik?.values?.remarks}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-6 col-lg-4 mb-3'>
						<label className="pe-field-label">Item Category</label>
						<Autocomplete
							id="itemCategory"
							name="itemCategory"
							size="small"
							className='w-100 f14'
							sx={{ width: "100%" }}
							options={[
								{ categoryDescription: "ADD NEW", id: "new" },
								...itemCatAllList,
							]}
							value={
								itemCatAllList.find(
									(option) => option.categoryDescription === formik.values.itemCategory
								) || { categoryDescription: formik.values.itemCategory }
							}
							getOptionLabel={(option) => option.categoryDescription ?? ""}
							onOpen={() => {
								if (itemCatAllList.length === 0) {
									PullItemCateogory();
								}
							}}
							onChange={handleItemCategoryChange}
							renderOption={(props, option) => (
								<Box
									component="li"
									{...props}
									className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}
								>
									{option.categoryDescription}
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
									helperText={formik.touched.itemCategory && formik.errors.itemCategory}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-6 col-lg-4 mb-3'>
						<label className="pe-field-label">Delivery Location</label>
						<Autocomplete
							id="plant"
							name="plant"
							size="small"
							className='w-100 f14'
							sx={{ width: "100%" }}
							options={[
								{ slDesc: "ADD NEW", slCode: "new" },
								...plantAllList,
							]}
							value={
								(() => {
									const cleanPlantValue = formik.values.plant?.replace(/\s*-\s*$/, "").trim() || "";
									const foundOption = plantAllList.find(option => option.slDesc === cleanPlantValue);
									return foundOption || (cleanPlantValue ? { slDesc: cleanPlantValue, slCode: "" } : null);
								})()
							}
							getOptionLabel={(option) => {
								if (!option) return "";
								const code = option.slCode?.trim();
								if (code && code !== "null" && code !== "undefined" && code !== "new") {
									return `${option.slDesc} - ${code}`;
								}
								return option.slDesc || "";
							}}
							onOpen={() => {
								if (plantAllList.length === 0) {
									PullPlantStorage();
								}
							}}
							onChange={handlePlantChange}
							renderOption={(props, option) => {
								const code = option.slCode?.trim();
								const displayText = code && code !== "null" && code !== "undefined" && code !== "new"
									? `${option.slDesc} - ${code}`
									: option.slDesc;
								return (
									<Box
										component="li"
										{...props}
										className={(props.className || "") + (option.slCode === "new" ? " dropdown-add-new" : "")}
									>
										{displayText}
									</Box>
								);
							}}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									error={formik.touched.plant && Boolean(formik.errors.plant)}
									helperText={formik.touched.plant && formik.errors.plant}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Delivery Date</label>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								value={formik.values.deliveryDate}
								onChange={(newValue) => handleDateChange(newValue, formik)}
								className='w-100 f14'
								renderInput={(params) => (
									<TextField
										{...params}
										fullWidth
										size="small"
										error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
										helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
									/>
								)}
							/>
						</LocalizationProvider>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Quantity <span className="rfq-required-star">*</span></label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="quantity"
							name="quantity"
							value={formik.values.quantity}
							type="number"
							onChange={(e) => {
								const value = e.target.value;
								if (value === "" || /^[0-9]{1,8}(\.[0-9]{0,4})?$/.test(value)) {
									if (value !== "" && parseFloat(value) > 0) {
										formik.setFieldValue("quantity", parseFloat(value));
									} else if (value === "") {
										formik.setFieldValue("quantity", "");
									}
								}
							}}
							error={formik.touched.quantity && Boolean(formik.errors.quantity)}
							helperText={formik.touched.quantity && formik.errors.quantity}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">UOM <span className="rfq-required-star">*</span></label>
						<Autocomplete
							id="uom"
							name="uom"
							size="small"
							className='w-100 f14'
							options={[
								{ uom: "ADD NEW", id: "new" },
								...UOMMaster,
							]}
							value={
								UOMMaster.find(
									(option) => option.uom === formik.values.uom
								) || { uom: formik.values.uom }
							}
							getOptionLabel={(option) => option.uom ?? ""}
							onOpen={() => {
								if (UOMMaster.length === 0) {
									pullUOMMasterList();
								}
							}}
							onChange={handleUomChange}
							renderOption={(props, option) => (
								<Box
									component="li"
									{...props}
									className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}
								>
									{option.uom}
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									error={formik.touched.uom && Boolean(formik.errors.uom)}
									helperText={formik.touched.uom && formik.errors.uom}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Item Type</label>
						<Autocomplete
							id="itemType"
							name="itemType"
							size="small"
							className='w-100 f14'
							options={[
								{ itemType: "ADD NEW", id: "new" },
								...itemTypeList,
							]}
							value={
								itemTypeList.find(
									(option) => option.itemType === formik.values.itemType
								) || (formik.values.itemType ? { itemType: formik.values.itemType } : null)
							}
							getOptionLabel={(option) => option.itemType ?? ""}
							onOpen={() => {
								if (itemTypeList.length === 0) {
									pullItemTypeList();
								}
							}}
							onChange={handleItemTypeChange}
							renderOption={(props, option) => (
								<Box
									component="li"
									{...props}
									className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}
								>
									{option.itemType}
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Target / Budget Price</label>
						<TextField
							id="targetPrice"
							name="targetPrice"
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							value={formik.values.targetPrice}
							type="number"
							onChange={(e) => {
								const regex = /^\d{0,10}(\.\d{0,4})?$/;
								if (regex.test(e.target.value)) {
									formik.setFieldValue("targetPrice", parseFloat(e.target.value));
								}
							}}
							error={formik.touched.targetPrice && Boolean(formik.errors.targetPrice)}
							helperText={formik.touched.targetPrice && formik.errors.targetPrice}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Item Image</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							value={uploadingImage ? 'Uploading...' : (formik.values.itemImage ? formik.values.itemImage.split('/').pop() : '')}
							placeholder="No file selected"
							disabled={uploadingImage}
							InputProps={{
								readOnly: true,
								endAdornment: (
									<InputAdornment position="end">
										<Tooltip title="Upload Image">
											<IconButton
												size="small"
												onClick={() => document.getElementById('itemimagefile_modal').click()}
												className="text-primary"
												disabled={uploadingImage}
											>
												<UploadOutlined className='f17' />
											</IconButton>
										</Tooltip>
										{formik.values.itemImage && !uploadingImage && (
											<Tooltip title="Remove Image">
												<IconButton
													size="small"
													onClick={() => {
														formik.setFieldValue('itemImage', '');
														toast.info('Item image removed');
													}}
													className="text-danger"
												>
													<HiOutlineTrash className='f17' />
												</IconButton>
											</Tooltip>
										)}
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Item Attachment</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							value={uploadingAttachment ? 'Uploading...' : (formik.values.itemFile ? formik.values.itemFile.split('/').pop() : '')}
							placeholder="No file selected"
							disabled={uploadingAttachment}
							InputProps={{
								readOnly: true,
								endAdornment: (
									<InputAdornment position="end">
										<Tooltip title="Upload Attachment">
											<IconButton
												size="small"
												onClick={() => document.getElementById('itemattachmentfile_modal').click()}
												className="text-primary"
												disabled={uploadingAttachment}
											>
												<UploadOutlined className='f17' />
											</IconButton>
										</Tooltip>
										{formik.values.itemFile && !uploadingAttachment && (
											<Tooltip title="Remove Attachment">
												<IconButton
													size="small"
													onClick={() => {
														formik.setFieldValue('itemFile', '');
														toast.info('Item attachment removed');
													}}
													className="text-danger"
												>
													<HiOutlineTrash className='f17' />
												</IconButton>
											</Tooltip>
										)}
									</InputAdornment>
								),
							}}
						/>
					</div>

					{/* Last PO Details Section */}
					<div className='col-12 mt-4 mb-4'>
						<h6 className='f14 text-secondary mb-0'>Last PO Details (Optional)</h6>
					</div>
					<div className='col-12 col-md-6 mb-4'>
						<label className="pe-field-label">PO Number</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="poNumber"
							name="poNumber"
							inputProps={{ maxLength: 100 }}
							value={formik.values.poNumber}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-6 mb-4'>
						<label className="pe-field-label">Supplier Name</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="poVendorName"
							name="poVendorName"
							inputProps={{ maxLength: 100 }}
							value={formik.values.poVendorName}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">Unit Rate</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="poUnitRate"
							name="poUnitRate"
							type="number"
							value={formik.values.poUnitRate}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">PO Date</label>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								value={formik.values.poDate}
								onChange={(newValue) => formik.setFieldValue('poDate', newValue)}
								className='w-100 f14'
								renderInput={(params) => (
									<TextField
										{...params}
										fullWidth
										size="small"
									/>
								)}
							/>
						</LocalizationProvider>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<label className="pe-field-label">PO Value</label>
						<TextField
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="poValue"
							name="poValue"
							type="number"
							value={formik.values.poValue}
							onChange={formik.handleChange}
						/>
					</div>
				</div>
			</form>
		</div>
	);

	// Always show the form for both adding and editing PR items
	return (
		<div className="d-flex flex-row">
			<div className="col-12 p-0">
				{renderEditForm()}
			</div>
			<PEModal
				open={ItemTypeModal}
				onClose={CloseItemTypeModal}
				size="md"
				title="Item Type"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
				footer={
					<button type="button" className="pe-btn pe-btn--secondary" onClick={CloseItemTypeModal}>Close</button>
				}
			>
				<AddEditItemType handleItemTypeList={handleItemTypeList} />
			</PEModal>

			{/* Search Item Modal */}
			<PEModal
				open={searchItemModal}
				onClose={CloseSearchItemModal}
				size="lg"
				title="Search Item"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
				footer={
					selectedRows.length > 0 ? (
						<button type="button" className="pe-btn pe-btn--primary" onClick={handleSelectItemFromGrid}>
							Select Item
						</button>
					) : (
						<button type="button" className="pe-btn pe-btn--secondary" onClick={CloseSearchItemModal}>Close</button>
					)
				}
			>
				<div className="row">
					<div className="col-12 mb-3">
						<TextField
							fullWidth
							placeholder="Search by Item Code, Name, or Category..."
							size="small"
							value={quickFilterValue}
							onChange={(e) => {
								setQuickFilterValue(e.target.value);
								setPage(0);
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<HiOutlineSearch className="f14 text-muted" />
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className="col-12 mb-3 d-flex justify-content-end align-items-center">
						<button type="button" className="pe-btn pe-btn--ghost" onClick={() => {
							setEditItemMasterData(null);
							setItemMasterModal(true);
						}}>
							<HiPlusSm /> Add New
						</button>
					</div>
					<div className="col-12" style={{ height: '400px' }}>
						<DataGrid
							getRowId={getRowId}
							rows={itemList}
							loading={gridloading && !searchMode}
							columns={itemColumns}
							pagination
							paginationMode={searchMode ? "client" : "server"}
							pageSizeOptions={[10, 25, 50, 100]}
							rowCount={searchMode ? itemList.length : totalCount}
							paginationModel={{ page: page, pageSize: pageSize }}
							onPaginationModelChange={(model) => {
								if (model.page !== page) setPage(model.page);
								if (model.pageSize !== pageSize) { setPageSize(model.pageSize); setPage(0); }
								if (!searchMode) {
									const nextPageNumber = model.pageSize !== pageSize ? 1 : model.page + 1;
									pullItemMaster(nextPageNumber, model.pageSize, false);
								}
							}}
							filterModel={{ items: [], quickFilterValues: quickFilterValue ? [quickFilterValue] : [] }}
							rowHeight={35}
							columnHeaderHeight={35}
							style={{ width: '100%', height: '100%', border: 'none' }}
							className="f13 border-0 consistent-datagrid"
							disableDensitySelector
							checkboxSelection
							disableRowSelectionOnClick={false}
							rowSelectionModel={selectedRows}
							onRowSelectionModelChange={(newSelection) => {
								try {
									if (Array.isArray(newSelection)) {
										setSelectedRows(newSelection.length > 0 ? [newSelection[newSelection.length - 1]] : []);
									} else if (newSelection) {
										setSelectedRows([newSelection]);
									} else {
										setSelectedRows([]);
									}
								} catch (e) {
									setSelectedRows([]);
								}
							}}
							slots={{ toolbar: GridToolbar }}
							slotProps={{ toolbar: { showQuickFilter: false } }}
						/>
					</div>
				</div>
			</PEModal>

			{/* Add/Edit Item Master Modal */}
			<PEModal
				open={itemMasterModal}
				onClose={CloseItemMasterModal}
				size="md"
				title={editItemMasterData ? 'Edit Item' : 'Add Item'}
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
				footer={
					<>
						<button type="button" className="pe-btn pe-btn--secondary" onClick={CloseItemMasterModal}>Cancel</button>
						<button type="submit" form="item-master-form" className="pe-btn pe-btn--primary" disabled={loadingSubmit}>
							{editItemMasterData?.id > 0 ? 'Update' : 'Add'}
						</button>
					</>
				}
			>
				<form id="item-master-form" onSubmit={formik.handleSubmit} autoComplete="off">
					<div className='row mt-2'>
						<div className='col-12 col-md-6 mb-4'>
							<label className="pe-field-label">Item Code</label>
							<TextField fullWidth variant="outlined" size="small" className='f14'
								id="itemCode" name="itemCode" inputProps={{ maxLength: 100 }}
								value={formik.values.itemCode} onChange={formik.handleChange}
								error={formik.touched.itemCode && Boolean(formik.errors.itemCode)}
								helperText={formik.touched.itemCode && formik.errors.itemCode}
							/>
						</div>
						<div className='col-12 col-md-6 mb-4'>
							<label className="pe-field-label">Item / Service Name <span className="rfq-required-star">*</span></label>
							<TextField fullWidth variant="outlined" size="small" className='f14'
								id="itemName" name="itemName" inputProps={{ maxLength: 200 }}
								value={formik.values.itemName} onChange={formik.handleChange}
								error={formik.touched.itemName && Boolean(formik.errors.itemName)}
								helperText={formik.touched.itemName && formik.errors.itemName}
							/>
						</div>
						<div className='col-12 col-md-6 mb-4'>
							<label className="pe-field-label">Description <span className="rfq-required-star">*</span></label>
							<TextField fullWidth variant="outlined" size="small" className='f14' multiline rows={3}
								id="itemDesc" name="itemDesc" inputProps={{ maxLength: 2000 }}
								value={formik?.values?.itemDesc} onChange={formik.handleChange}
								error={formik.touched.itemDesc && Boolean(formik.errors.itemDesc)}
								helperText={formik.touched.itemDesc && formik.errors.itemDesc}
							/>
						</div>
						<div className='col-12 col-md-6 col-lg-4 mb-3'>
							<label className="pe-field-label">Item Category</label>
							<Autocomplete id="itemCategory" name="itemCategory" size="small" className='w-100 f14'
								options={[...itemCatAllList, { categoryDescription: "ADD NEW", id: "new" }]}
								value={itemCatAllList.find(o => o.categoryDescription === formik.values.itemCategory) || { categoryDescription: formik.values.itemCategory }}
								getOptionLabel={(option) => option.categoryDescription ?? ""}
								onOpen={() => { if (itemCatAllList.length === 0) PullItemCateogory(); }}
								onChange={handleItemCategoryChange}
								renderOption={(props, option) => (
									<Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
										{option.categoryDescription}
									</Box>
								)}
								renderInput={(params) => (
									<TextField variant="outlined" {...params}
										error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
										helperText={formik.touched.itemCategory && formik.errors.itemCategory}
									/>
								)}
							/>
						</div>
						<div className='col-12 col-md-6 col-lg-4 mb-3'>
							<label className="pe-field-label">Delivery Location</label>
							<Autocomplete id="plant" name="plant" size="small" className='w-100 f14'
								options={[...plantAllList, { slDesc: "ADD NEW", slCode: "new" }]}
								value={plantAllList.find(o => o.slDesc === formik.values.plant) || { slDesc: formik.values.plant, slCode: "" }}
								getOptionLabel={(option) => {
									const code = option.slCode?.trim();
									return code && code !== "null" && code !== "undefined" && code !== "new" ? `${option.slDesc} - ${code}` : option.slDesc || "";
								}}
								onOpen={() => { if (plantAllList.length === 0) PullPlantStorage(); }}
								onChange={handlePlantChange}
								renderOption={(props, option) => {
									const code = option.slCode?.trim();
									return (
										<Box component="li" {...props} className={(props.className || "") + (option.slCode === "new" ? " dropdown-add-new" : "")}>
											{code && code !== "null" && code !== "undefined" && code !== "new" ? `${option.slDesc} - ${code}` : option.slDesc}
										</Box>
									);
								}}
								renderInput={(params) => <TextField variant="outlined" {...params} />}
							/>
						</div>
						<div className='col-12 col-md-4 mb-4'>
							<label className="pe-field-label">UOM <span className="rfq-required-star">*</span></label>
							<Autocomplete id="uom" name="uom" size="small" className='w-100 f14'
								options={[...UOMMaster, { uom: "ADD NEW", id: "new" }]}
								value={UOMMaster.find(o => o.uom === formik.values.uom) || { uom: formik.values.uom }}
								getOptionLabel={(option) => option.uom ?? ""}
								onOpen={() => { if (UOMMaster.length === 0) pullUOMMasterList(); }}
								onChange={handleUomChange}
								renderOption={(props, option) => (
									<Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
										{option.uom}
									</Box>
								)}
								renderInput={(params) => (
									<TextField variant="outlined" {...params}
										error={formik.touched.uom && Boolean(formik.errors.uom)}
										helperText={formik.touched.uom && formik.errors.uom}
									/>
								)}
							/>
						</div>
						<div className='col-12 mt-2 mb-3'>
							<h6 className='f14 text-secondary mb-0'>Last PO Details (Optional)</h6>
						</div>
						<div className='col-12 col-md-6 mb-4'>
							<label className="pe-field-label">PO Number</label>
							<TextField fullWidth variant="outlined" size="small" className='f14'
								id="poNumber" name="poNumber" inputProps={{ maxLength: 100 }}
								value={formik.values.poNumber} onChange={formik.handleChange}
							/>
						</div>
						<div className='col-12 col-md-6 mb-4'>
							<label className="pe-field-label">Supplier Name</label>
							<TextField fullWidth variant="outlined" size="small" className='f14'
								id="poVendorName" name="poVendorName" inputProps={{ maxLength: 100 }}
								value={formik.values.poVendorName} onChange={formik.handleChange}
							/>
						</div>
						<div className='col-12 col-md-4 mb-4'>
							<label className="pe-field-label">Unit Rate</label>
							<TextField fullWidth variant="outlined" size="small" className='f14'
								id="unitRate" name="unitRate" type="number"
								value={formik.values.unitRate} onChange={formik.handleChange}
							/>
						</div>
						<div className='col-12 col-md-4 mb-4'>
							<label className="pe-field-label">PO Date</label>
							<LocalizationProvider dateAdapter={AdapterDateFns}>
								<DatePicker value={formik.values.poDate}
									onChange={(newValue) => formik.setFieldValue('poDate', newValue)}
									renderInput={(params) => <TextField {...params} fullWidth size="small" />}
								/>
							</LocalizationProvider>
						</div>
						<div className='col-12 col-md-4 mb-4'>
							<label className="pe-field-label">PO Value</label>
							<TextField fullWidth variant="outlined" size="small" className='f14'
								id="poValue" name="poValue" type="number"
								value={formik.values.poValue} onChange={formik.handleChange}
							/>
						</div>
					</div>
				</form>
			</PEModal>

			{/* Add Category Modal */}
			<PEModal
				open={CategoryModal}
				onClose={CloseCategoryModal}
				size="lg"
				title="Item Category"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
				footer={
					<button type="button" className="pe-btn pe-btn--secondary" onClick={CloseCategoryModal}>Close</button>
				}
			>
				<AddPrItemCategory isModal={true} handleCategoryList={handleCategoryList} />
			</PEModal>

			{/* Add Plant Modal */}
			<PEModal
				open={PlantModal}
				onClose={ClosePlantModal}
				size="lg"
				title="Delivery Location"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
				footer={
					<button type="button" className="pe-btn pe-btn--secondary" onClick={ClosePlantModal}>Close</button>
				}
			>
				<AddPrPlant isModal={true} handlePlantList={handlePlantList} />
			</PEModal>

			{/* Add UOM Modal */}
			<PEModal
				open={UomModal}
				onClose={CloseUomModal}
				size="lg"
				title="UOM"
				bodyStyle={{ padding: 0, height: '78vh', overflow: 'hidden' }}
				bodyClassName="d-flex flex-column"
				footer={
					<button type="button" className="pe-btn pe-btn--secondary" onClick={CloseUomModal}>Close</button>
				}
			>
				<AddUpdateUom isModal={true} handleUomList={handleUomList || ((list) => setUOMMaster(list))} />
			</PEModal>
		</div>
	)
}

export default AddItemProductsCell