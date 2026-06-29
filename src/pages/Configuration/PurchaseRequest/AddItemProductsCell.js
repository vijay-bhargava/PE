import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Modal } from "react-bootstrap";

import TextFieldCell from '../../BaseCells/TextFieldCell'
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, IconButton, Autocomplete, Box, Tooltip } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useStateValue } from '../../../store'
import { LocalizationProvider, MobileDatePicker, DatePicker } from '@mui/x-date-pickers';
import { HiOutlineX, HiPencilAlt, HiPlusSm, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FindItemCategory, FindPlantStorage, PRItemServiceAdd, PRItemServiceUpdate, getItemCategory, getPRManageFind, getPlantStorage } from '../../../utils/purchaseRequest';
import { toast } from 'react-toastify';
import AddUpdateUom from '../../../utils/common/AddUpdateUom';
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import AddPrPlant from '../../../utils/common/AddPrPlant';
import AddEditItemType from '../../../utils/common/AddEditITemType';
import { api, ApiClient } from "../../../Apiclient";
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';
import { getFileName, uploadFilesOnAzure2, validateFileSize } from '../../../utils/common';
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
		var data = {
			CustomerId: customerid,
		};
		FindItemCategory(data, atoken).then((resp) => {

			setItemCatAllList(resp);
		});
	};
	const handleCategoryList = (array) => {
		setItemCatAllList(array);
	};

	const pullUOMMasterList = () => {
		var data = {
			CustomerId: customerid
		};
		UOMMasterList(data, atoken).then((res) => {

			setUOMMaster(res);
		});
	};

	const PullPlantStorage = () => {

		var data = {
			CustomerId: customerid,
		};
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
			console.error('pullItemTypeList error', err);
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

			if (!isSearch) {
				setGridloading(false);
			}
			setTotalCount(res?.pageMetadata?.totalCount || 0);
			if (isSearch) {
				setSearchDataLoaded(true);
			}

			if (res && res.result) {
				setItemList(res.result);
			} else {
				setItemList([]);
				setTotalCount(0);
			}
		} catch (err) {
			console.error('pullItemMaster error', err);
			setItemList([]);
			setTotalCount(0);
			setGridloading(false);
		}
	};

	const handleItemSelect = (event) => {
		const value = event.target.value;
		formik.setFieldValue('itemCode', value);
		if (!value) {
			// clear related fields
			formik.setFieldValue('itemName', '');
			formik.setFieldValue('itemCategory', '');
			formik.setFieldValue('itemDesc', '');
			formik.setFieldValue('uom', '');
			formik.setFieldValue('quantity', '');
			formik.setFieldValue('plant', '');
			formik.setFieldValue('targetPrice', '');
			return;
		}

		const selected = itemList.find((it) => String(it.itemCode) === String(value));
		if (selected) {
			formik.setFieldValue('itemName', selected.itemName ?? '');
			formik.setFieldValue('itemCategory', selected.itemCategory ?? '');
			formik.setFieldValue('itemDesc', selected.itemDesc ?? '');
			formik.setFieldValue('uom', selected.uom ?? '');
			formik.setFieldValue('quantity', selected.quantity ?? '');
			formik.setFieldValue('plant', selected.plant ?? '');
			formik.setFieldValue('targetPrice', selected.targetPrice ?? '');
			formik.setFieldValue('itemImage', selected.itemImage ?? '');
			formik.setFieldValue('itemFile', selected.itemFile ?? '');
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
						targetPrice: values?.targetPrice != '' ? values?.targetPrice : 0,
						quantity: values?.quantity != '' ? values?.quantity : 0,
						uom: values?.uom,
						deliveryDate: values?.deliveryDate || null,
						poNumber: values?.poNumber || '',
						poVendorName: values?.poVendorName || '',
						poUnitRate: values?.poUnitRate != '' ? values?.poUnitRate : 0,
						poDate: values?.poDate || null,
						poValue: values?.poValue != '' ? values?.poValue : 0,
						remarks: values?.remarks || '',
						itemImage: values?.itemImage || '',
						itemFile: values?.itemFile || '',
						itemType: values?.itemType || '',
						itemTypeId: values?.itemTypeId ? parseInt(values.itemTypeId) : 0
					};

					if (data && data?.id == 0) {
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
	// const handleUomChange = (e) => {
	//     const selectedValue = e.target.value;
	//     if (selectedValue === "new") {
	//         setUomModal(true);
	//     } else {
	//         const selectedOption = UOMMaster.find(option => option.uom === selectedValue);
	//         setuom(selectedOption?.uom);
	//         formik.setFieldValue("uom", selectedOption?.uom)
	//     }
	//     formik.setFieldValue(selectedValue);
	//     setuom(selectedValue);
	// };
	// const handleItemCategoryChange = (e) => {
	//     
	//     const selectedValue = e.target.value;

	//     if (selectedValue === "new") {
	//         setCategoryModal(true); // Open the modal or dialog for adding a new category
	//     } else {
	//         const selectedOption = itemCatAllList.find(option => option.categoryDescription === selectedValue);

	//         formik.setFieldValue("itemCategory", selectedOption?.categoryDescription);
	//         setcategory(selectedOption?.categoryDescription);
	//     }

	//     setcategory(selectedValue);
	// };

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
	// const handleItemPOSearch = async (value) => {
	//     
	//     const selectedValue =value

	//     const res = await apiClient.get(
	//         `api/poconfirm/Find?CustomerId=${parseInt(customerid)}&POCreationDetails_ItemDesc=${selectedValue}`,
	//         atoken
	//     );


	//    if (res) {
	//     console.log("poconfirm", res?.result);
	//     

	//     const lastElement = res?.result[res?.result?.length - 1]; // Get the last element
	//     formik.setFieldValue("poNumber", lastElement?.poNumber);
	//     formik.setFieldValue("poVendorName", lastElement?.vendorName);
	//     formik.setFieldValue("poValue", lastElement?.poAmount)
	//     formik.setFieldValue("poDate", lastElement?.pO_Date ? new Date(lastElement?.pO_Date) : null);
	//     const materialPONetPrice = lastElement?.poCreationDetails[0]?.materialPONetPrice;
	//     formik.setFieldValue("poUnitRate", materialPONetPrice ? parseFloat(materialPONetPrice) : 0);

	// }

	//   };
	const handleItemPOSearch = async (value) => {
		try {
			const selectedValue = value;

			const res = await apiClient.get(
				`api/poconfirm/Find?CustomerId=${parseInt(customerid)}&POCreationDetails_ItemDesc=${selectedValue}`,
				atoken
			);

			// Check if res?.result is defined and is an array
			if (Array.isArray(res?.result) && res?.result.length > 0) {
				console.log("poconfirm", res?.result);


				const lastElement = res?.result[res?.result?.length - 1]; // Get the last element
				formik.setFieldValue("poNumber", lastElement?.poNumber);
				formik.setFieldValue("poVendorName", lastElement?.vendorName);
				formik.setFieldValue("poValue", lastElement?.poAmount);
				formik.setFieldValue("poDate", lastElement?.pO_Date ? new Date(lastElement?.pO_Date) : null);

				const materialPONetPrice = lastElement?.poCreationDetails[0]?.materialPONetPrice;
				formik.setFieldValue("poUnitRate", materialPONetPrice ? parseFloat(materialPONetPrice) : 0);
			} else {
				console.warn("No results found or invalid result array");
			}
		} catch (error) {
			console.error("Error during API call or processing:", error);
		}
	};



	//file upload changes
	const handleItemImageChange = (event) => {

		if (!validateFileSize(event)) {
			event.target.value = ''; // Reset input
			return;
		}
		const file = event.target.files[0];
		if (file) {
			UploadItemImage(file);
		}
		event.target.value = ''; // Reset input to allow re-uploading the same file
	};

	const UploadItemImage = async (file) => {

		if (!file) {
			return;
		}

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
		if (file) {
			UploadItemAttachment(file);
		}
		event.target.value = ''; // Reset input to allow re-uploading the same file
	};

	const UploadItemAttachment = async (file) => {

		if (!file) {
			return;
		}

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
				<IconButton
					size="small"
					className="bg-white"
					onClick={() => handleEditItemMaster(params?.row)}
				>
					<HiPencilAlt className="f17 text-primary" />
				</IconButton>
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

	const handleAddSelectedItems = async () => {
		if (selectedRows.length === 0) {
			toast.warning('Please select at least one item');
			return;
		}

		for (const selectedItemCode of selectedRows) {
			const selectedItem = itemList.find((it) => String(it.itemCode) === String(selectedItemCode));
			if (!selectedItem) continue;

			const data = {
				id: 0,
				customerId: parseInt(customerid),
				prId: parseInt(idFromURL),
				itemName: selectedItem.itemName ?? '',
				itemCode: selectedItem.itemCode ?? '',
				erpSourceId: '',
				itemCategory: selectedItem.itemCategory ?? '',
				plant: selectedItem.plant ?? '',
				itemDesc: selectedItem.itemDesc ?? '',
				targetPrice: selectedItem.targetPrice ?? 0,
				quantity: selectedItem.quantity ?? 0,
				uom: selectedItem.uom ?? '',
				deliveryDate: null,
				poNumber: selectedItem.poNumber || '',
				poVendorName: selectedItem.poVendorName || '',
				poUnitRate: selectedItem.unitRate || 0,
				poDate: selectedItem.poDate ? new Date(selectedItem.poDate) : null,
				poValue: selectedItem.poValue || 0,
				remarks: '',
				itemImage: selectedItem.itemImage ?? '',
				itemFile: selectedItem.itemFile ?? ''
			};

			await PRItemServiceAdd(data, atoken);
		}

		toast.success(`${selectedRows.length} item(s) added successfully!`);
		setSelectedRows([]);
		callbackItemAdd(true);
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
	const isEditingPRItem = isFromPRItem && editItemMasterData && editItemMasterData?.id > 0;

	// Render the form for editing PR item
	const renderEditForm = () => (
		<div className="p-3">
			<form onSubmit={formik.handleSubmit} autoComplete="off">
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
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{ shrink: true }}
							size="small"
							className='f14'
							id="itemCode"
							name="itemCode"
							label="Item Code *"
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
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{ shrink: true }}
							size="small"
							className='f14'
							id="itemName"
							name="itemName"
							label="Item/Service Name *"
							inputProps={{ maxLength: 200 }}
							value={formik.values.itemName}
							onChange={formik.handleChange}
							error={formik.touched.itemName && Boolean(formik.errors.itemName)}
							helperText={formik.touched.itemName && formik.errors.itemName}
						/>
					</div>
					<div className='col-12 col-md-12 mb-4'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							multiline={true}
							rows={3}
							id="itemDesc"
							name="itemDesc"
							label="Description *"
							inputProps={{ maxLength: 2000 }}
							value={formik?.values?.itemDesc}
							onChange={formik.handleChange}
							error={formik.touched.itemDesc && Boolean(formik.errors.itemDesc)}
							helperText={formik.touched.itemDesc && formik.errors.itemDesc}
						/>
					</div>
					<div className='col-12 col-md-12 mb-4'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							multiline={true}
							rows={3}
							id="remarks"
							name="remarks"
							label="Remarks"
							inputProps={{ maxLength: 2000 }}
							value={formik?.values?.remarks}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-6 col-lg-4 mb-3'>
						<Autocomplete
							id="itemCategory"
							name="itemCategory"
							size="small"
							className='w-100 f14'
							sx={{ width: "100%" }}
							options={[
								...itemCatAllList,
								{ categoryDescription: "ADD NEW", id: "new" },
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
									{option.categoryDescription}
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									label="Item Category *"
									shrink={true}
									error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
									helperText={formik.touched.itemCategory && formik.errors.itemCategory}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-6 col-lg-4 mb-3'>
						<Autocomplete
							id="plant"
							name="plant"
							size="small"
							className='w-100 f14'
							sx={{ width: "100%" }}
							options={[
								...plantAllList,
								{ slDesc: "ADD ", slCode: "new" },
							]}
							value={
								(() => {
									// Clean any trailing dash from stored value
									const cleanPlantValue = formik.values.plant?.replace(/\s*-\s*$/, "").trim() || "";
									// Try to find exact match in plantAllList
									const foundOption = plantAllList.find(option => option.slDesc === cleanPlantValue);
									// Return found option or create fallback (for manually entered values)
									return foundOption || (cleanPlantValue ? { slDesc: cleanPlantValue, slCode: "" } : null);
								})()
							}
							getOptionLabel={(option) => {
								if (!option) return "";
								const code = option.slCode?.trim();
								// Only show dash if slCode exists and is not just "null" or "undefined" string
								if (code && code !== "null" && code !== "undefined") {
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
								const displayText = code && code !== "null" && code !== "undefined"
									? `${option.slDesc} - ${code}`
									: option.slDesc;

								return (
									<Box
										component="li"
										{...props}
										style={
											option.slCode === "new"
												? {
													fontStyle: "italic",
													color: "blue",
													cursor: "pointer",
													textDecoration: "underline",
												}
												: {}
										}
									>
										{displayText}
									</Box>
								);
							}}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									label="Plant"
									shrink={true}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								label="Delivery Date"
								value={formik.values.deliveryDate}
								onChange={(newValue) => handleDateChange(newValue, formik)}
								renderInput={(params) => (
									<TextField
										{...params}
										fullWidth
										size="small"
										InputLabelProps={{ shrink: true }}
										error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
										helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
									/>
								)}
							/>
						</LocalizationProvider>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<TextField
							InputLabelProps={{
								shrink: true,
							}}
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							id="quantity"
							name="quantity"
							label="Quantity *"
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
						<Autocomplete
							id="uom"
							name="uom"
							size="small"
							className='w-100 f14'
							options={[
								...UOMMaster,
								{ uom: "ADD NEW", id: "new" },
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
									{option.uom}
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									label="UOM *"
									error={formik.touched.uom && Boolean(formik.errors.uom)}
									helperText={formik.touched.uom && formik.errors.uom}
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<Autocomplete
							id="itemType"
							name="itemType"
							size="small"
							className='w-100 f14'
							options={[
								...itemTypeList,
								{ itemType: "ADD NEW", id: "new" },
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
									{option.itemType}
								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									label="Item Type"
								/>
							)}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<TextField
							id="targetPrice"
							name="targetPrice"
							InputLabelProps={{
								shrink: true,
							}}
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							label="Target/Budget Price"
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
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							label="Item Image"
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
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							label="Item Attachment"
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
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							id="poNumber"
							name="poNumber"
							label="PO Number"
							inputProps={{ maxLength: 100 }}
							value={formik.values.poNumber}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-6 mb-4'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							id="poVendorName"
							name="poVendorName"
							label="Supplier Name"
							inputProps={{ maxLength: 100 }}
							value={formik.values.poVendorName}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							id="poUnitRate"
							name="poUnitRate"
							label="Unit Rate"
							type="number"
							value={formik.values.poUnitRate}
							onChange={formik.handleChange}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DatePicker
								label="PO Date"
								value={formik.values.poDate}
								onChange={(newValue) => formik.setFieldValue('poDate', newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										fullWidth
										size="small"
										InputLabelProps={{ shrink: true }}
									/>
								)}
							/>
						</LocalizationProvider>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							id="poValue"
							name="poValue"
							label="PO Value"
							type="number"
							value={formik.values.poValue}
							onChange={formik.handleChange}
						/>
					</div>
				</div>
				<div className='text-end mt-3'>
					<LoadingButton
						variant='outlined'
						onClick={() => callbackItemAdd(false)}
						color='secondary'
						className='me-3 text-capitalize'
						size='small'
					>
						Cancel
					</LoadingButton>
					{action && (
						<LoadingButton
							loading={loadingSubmit}
							variant='contained'
							type="submit"
							color='primary'
							className='text-capitalize'
							size='small'
							disabled={loadingSubmit}
						>
							{editItemMasterData && editItemMasterData?.id > 0 ? 'Update' : 'Add'}
						</LoadingButton>
					)}
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
			<Modal
				size="lg"
				show={ItemTypeModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={CloseItemTypeModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">Item Type</div>
					</Modal.Title>
					<IconButton onClick={CloseItemTypeModal} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<AddEditItemType handleItemTypeList={handleItemTypeList} />
					</div>
				</Modal.Body>
			</Modal>

			<Modal
				size="xl"
				show={searchItemModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={CloseSearchItemModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">Search Item</div>
					</Modal.Title>
					<IconButton onClick={CloseSearchItemModal} size="small" edge="start">
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
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
								<LoadingButton
									variant="text"
									size="large"
									color="primary"
									onClick={() => {
										setEditItemMasterData(null);
										setItemMasterModal(true);
									}}
									startIcon={<HiPlusSm />}
									className="text-capitalize blue-text font-normal me-3"
								>
									Add New
								</LoadingButton>
							</div>
							<div className="data-grid-wrapper flex-grow-1" style={{ height: '400px', overflow: 'hidden' }}>
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
										if (model.page !== page) {
											setPage(model.page);
										}
										if (model.pageSize !== pageSize) {
											setPageSize(model.pageSize);
											setPage(0);
										}
										if (!searchMode) {
											const nextPageNumber = model.pageSize !== pageSize ? 1 : model.page + 1;
											pullItemMaster(nextPageNumber, model.pageSize, false);
										}
									}}
									filterModel={{
										items: [],
										quickFilterValues: quickFilterValue ? [quickFilterValue] : []
									}}
									rowHeight={35}
									columnHeaderHeight={35}
									style={{ width: '100%', height: '100%', border: 'none' }}
									className="f13 border-0 consistent-datagrid"
									disableDensitySelector
									checkboxSelection
									disableRowSelectionOnClick={false}
									rowSelectionModel={selectedRows}
									onRowSelectionModelChange={(newSelection) => {
										// Enforce single selection: keep only the most recently selected id
										try {
											if (Array.isArray(newSelection)) {
												if (newSelection.length > 0) {
													const last = newSelection[newSelection.length - 1];
													setSelectedRows([last]);
												} else {
													setSelectedRows([]);
												}
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
									slotProps={{
										toolbar: {
											showQuickFilter: false,
										},
									}}
								/>
							</div>
							<div className="col-12 d-flex justify-content-end mt-3">
								{selectedRows.length > 0 && (
									<LoadingButton
										variant='contained'
										onClick={handleSelectItemFromGrid}
										color='primary'
										className='text-capitalize'
										size='medium'
									>
										Select Item
									</LoadingButton>
								)}
							</div>
						</div>
					</div>
				</Modal.Body>
			</Modal>

			<Modal
				size="lg"
				show={itemMasterModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={CloseItemMasterModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title id="modal-heading">
						<div className="d-flex align-items-center f14 text-white">
							{editItemMasterData ? 'Edit Item ' : 'Add Item '}
						</div>
					</Modal.Title>
					<IconButton
						onClick={CloseItemMasterModal}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3">
						<form onSubmit={formik.handleSubmit} autoComplete="off">
							<div className='row mt-2'>
								<div className='col-12 col-md-6 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										id="itemCode"
										name="itemCode"
										label="Item Code *"
										inputProps={{ maxLength: 100 }}
										value={formik.values.itemCode}
										onChange={formik.handleChange}
										error={formik.touched.itemCode && Boolean(formik.errors.itemCode)}
										helperText={formik.touched.itemCode && formik.errors.itemCode}
									/>
								</div>
								<div className='col-12 col-md-6 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										id="itemName"
										name="itemName"
										label="Item/Service Name *"
										inputProps={{ maxLength: 200 }}
										value={formik.values.itemName}
										onChange={formik.handleChange}
										error={formik.touched.itemName && Boolean(formik.errors.itemName)}
										helperText={formik.touched.itemName && formik.errors.itemName}
									/>
								</div>
								<div className='col-12 col-md-12 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										multiline={true}
										rows={3}
										id="itemDesc"
										name="itemDesc"
										label="Description *"
										inputProps={{ maxLength: 2000 }}
										value={formik?.values?.itemDesc}
										onChange={formik.handleChange}
										error={formik.touched.itemDesc && Boolean(formik.errors.itemDesc)}
										helperText={formik.touched.itemDesc && formik.errors.itemDesc}
									/>
								</div>
								<div className='col-12 col-md-6 col-lg-4 mb-3'>
									<Autocomplete
										id="itemCategory"
										name="itemCategory"
										size="small"
										className='w-100 f14'
										sx={{ width: "100%" }}
										options={[
											...itemCatAllList,
											{ categoryDescription: "ADD NEW", id: "new" },
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
												{option.categoryDescription}
											</Box>
										)}
										renderInput={(params) => (
											<TextField
												variant="outlined"
												{...params}
												label="Item Category *"
												shrink={true}
												error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
												helperText={formik.touched.itemCategory && formik.errors.itemCategory}
											/>
										)}
									/>
								</div>
								<div className='col-12 col-md-6 col-lg-4 mb-3'>
									<Autocomplete
										id="plant"
										name="plant"
										size="small"
										className='w-100 f14'
										sx={{ width: "100%" }}
										options={[
											...plantAllList,
											{ slDesc: "ADD", slCode: "new" },
										]}
										value={
											plantAllList.find(option => option.slDesc === formik.values.plant)
											|| { slDesc: formik.values.plant, slCode: "" }
										}

										// ✅ FINAL SAFE FIX
										getOptionLabel={(option) => {
											const code = option.slCode?.trim();
											return code && code !== "null" && code !== "undefined"
												? `${option.slDesc} - ${code}`
												: option.slDesc;
										}}

										onOpen={() => {
											if (plantAllList.length === 0) {
												PullPlantStorage();
											}
										}}

										onChange={handlePlantChange}

										// ✅ SAME SAFE LOGIC HERE
										renderOption={(props, option) => {
											const code = option.slCode?.trim();

											return (
												<Box
													component="li"
													{...props}
													sx={
														option.slCode === "new"
															? {
																fontStyle: "italic",
																color: "blue",
																cursor: "pointer",
																textDecoration: "underline",
															}
															: {}
													}
												>
													{code && code !== "null" && code !== "undefined"
														? `${option.slDesc} - ${code}`
														: option.slDesc}
												</Box>
											);
										}}

										renderInput={(params) => (
											<TextField
												variant="outlined"
												{...params}
												label="Plant"
												InputLabelProps={{ shrink: true }}
											/>
										)}
									/>
								</div>
								<div className='col-12 col-md-4 mb-4'>
									<Autocomplete
										id="uom"
										name="uom"
										size="small"
										className='w-100 f14'
										options={[
											...UOMMaster,
											{ uom: "ADD NEW", id: "new" },
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
												{option.uom}
											</Box>
										)}
										renderInput={(params) => (
											<TextField
												variant="outlined"
												{...params}
												label="UOM *"
												error={formik.touched.uom && Boolean(formik.errors.uom)}
												helperText={formik.touched.uom && formik.errors.uom}
											/>
										)}
									/>
								</div>
								{/* PO Details Section */}
								<div className='col-12 mt-4 mb-4'>
									<h6 className='f14 text-secondary mb-0'>Last PO Details (Optional)</h6>
								</div>
								<div className='col-12 col-md-6 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										id="poNumber"
										name="poNumber"
										label="PO Number"
										inputProps={{ maxLength: 100 }}
										value={formik.values.poNumber}
										onChange={formik.handleChange}
									/>
								</div>
								<div className='col-12 col-md-6 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										id="poVendorName"
										name="poVendorName"
										label="Supplier Name"
										inputProps={{ maxLength: 100 }}
										value={formik.values.poVendorName}
										onChange={formik.handleChange}
									/>
								</div>
								<div className='col-12 col-md-4 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										id="unitRate"
										name="unitRate"
										label="Unit Rate"
										type="number"
										value={formik.values.unitRate}
										onChange={formik.handleChange}
									/>
								</div>
								<div className='col-12 col-md-4 mb-4'>
									<LocalizationProvider dateAdapter={AdapterDateFns}>
										<DatePicker
											label="PO Date"
											value={formik.values.poDate}
											onChange={(newValue) => formik.setFieldValue('poDate', newValue)}
											renderInput={(params) => (
												<TextField
													{...params}
													fullWidth
													size="small"
													InputLabelProps={{ shrink: true }}
												/>
											)}
										/>
									</LocalizationProvider>
								</div>
								<div className='col-12 col-md-4 mb-4'>
									<TextField
										fullWidth
										variant="outlined"
										InputLabelProps={{ shrink: true }}
										size="small"
										className='f14'
										id="poValue"
										name="poValue"
										label="PO Value"
										type="number"
										value={formik.values.poValue}
										onChange={formik.handleChange}
									/>
								</div>
							</div>
							<div className='text-end mt-3'>
								<LoadingButton
									variant='outlined'
									onClick={CloseItemMasterModal}
									color='secondary'
									className='me-3 text-capitalize'
									size='small'
								>
									Cancel
								</LoadingButton>
								<LoadingButton
									loading={loadingSubmit}
									variant='contained'
									type="submit"
									color='primary'
									className='text-capitalize'
									size='small'
									disabled={loadingSubmit}
								>
									{editItemMasterData && editItemMasterData?.id > 0 ? 'Update' : 'Add'}
								</LoadingButton>
							</div>
						</form>
					</div>
				</Modal.Body>
			</Modal>

			{/* Add Category Modal */}
			<Modal
				size="xl"
				show={CategoryModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={CloseCategoryModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title>
						<div className="d-flex align-items-center f14 text-white">
							Item Category
						</div>
					</Modal.Title>
					<IconButton
						onClick={CloseCategoryModal}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3" onClick={(e) => e.stopPropagation()}>
						<AddPrItemCategory
							isModal={true}
							handleCategoryList={handleCategoryList}
						/>
					</div>
				</Modal.Body>
			</Modal>

			{/* Add Plant Modal */}
			<Modal
				size="xl"
				show={PlantModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={ClosePlantModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title>
						<div className="d-flex align-items-center f14 text-white">
							Plant
						</div>
					</Modal.Title>
					<IconButton
						onClick={ClosePlantModal}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0">
					<div className="p-3" onClick={(e) => e.stopPropagation()}>
						<AddPrPlant
							isModal={true}
							handlePlantList={handlePlantList}
						/>
					</div>
				</Modal.Body>
			</Modal>

			{/* Add UOM Modal */}
			<Modal
				size="xl"
				show={UomModal}
				backdrop="static"
				keyboard={false}
				className="zindex1280"
				backdropClassName="zindex1280"
				centered
				contentClassName="border-0"
				onHide={CloseUomModal}
			>
				<Modal.Header className="pt-2 pb-2 bgheaderCards">
					<Modal.Title>
						<div className="d-flex align-items-center f14 text-white">
							UOM
						</div>
					</Modal.Title>
					<IconButton
						onClick={CloseUomModal}
						size="small"
						edge="start"
					>
						<HiOutlineX className="f20 text-white" />
					</IconButton>
				</Modal.Header>
				<Modal.Body className="p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
					<div className="p-3" onClick={(e) => e.stopPropagation()}>
						<AddUpdateUom
							isModal={true}
							handleUomList={handleUomList || ((list) => setUOMMaster(list))}
						/>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	)
}

export default AddItemProductsCell