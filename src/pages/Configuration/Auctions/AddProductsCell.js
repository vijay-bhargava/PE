import { useState } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Autocomplete, Box, IconButton, InputAdornment, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useStateValue } from '../../../store'
import { Modal } from "react-bootstrap";
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuctionItemServiceAdd, AuctionItemServiceUpdate } from '../../../utils/common/utility';
import AddUpdateUom from './AddUpdateUom';
import { HiOutlineX } from 'react-icons/hi';
import { sanitizeInput } from '../../../utils/common/santize';
import { toast } from 'react-toastify';
import { FindItemCategory, FindItemType } from '../../../utils/purchaseRequest';
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';
import { DecimalValueRegEx, getFileName, uploadFilesOnAzure2 } from '../../../utils/common';
import { UploadOutlined } from '@mui/icons-material';
import { ApiClient } from "../../../Apiclient";
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import { UOMMasterList } from '../../../utils/commerciallibrary';
import AddEditItemType from '../../../utils/common/AddEditITemType';

const AddProductsCell = ({ idFromURL, callbackItemAdd, itemEditTempData, handleUomList, tempDataForItemService, action }) => {
	const [{ atoken, customerid, customersuffix }] = useStateValue();
	const apiClient = new ApiClient(customersuffix);
	console.log('itemEditTempData', itemEditTempData)
	console.log('tempDataForItemService', tempDataForItemService)

	const bidTypeIDs = tempDataForItemService[0]?.bidTypeID;
	const bidSubTypeIds = tempDataForItemService[0]?.bidSubTypeId;
	const hasBidClosingTypeS = Array.isArray(tempDataForItemService) && tempDataForItemService.some(item => item?.bidClosingType === 'S');
	console.log('has a hasBidClosingTypeS', hasBidClosingTypeS)
	const [loadingSubmit, setLoadingSubmit] = useState(false)
	const [UomModal, setUomModal] = useState(false);
	const [uom, setuom] = useState("");
	const CloseUomModal = () => setUomModal(false);
	const validationSchema = yup.object().shape({
		itemName: yup
			.string('Enter Item/Service Name')
			.max(200, "Max 200 character")
			.required('Item/Service Name is required'),
		itemDesc: yup
			.string('Enter Description')
			.required('Description is required'),
		quantity: yup
			.string('Enter Quantity')
			.required('Quantity is required'),
		uom: yup
			.string('Select UOM')
			.required('UOM is required'),
		startPrice: yup
			.string('Enter Start Price')
			.required('Start Unit Price is required'),
		itemType: yup
			.string('Select Item Type')
			.required('Item Type is required'),
	});

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			itemName: itemEditTempData && itemEditTempData?.itemName ? itemEditTempData?.itemName : '',
			itemCode: itemEditTempData && itemEditTempData?.itemCode ? itemEditTempData?.itemCode : '',
			itemDesc: itemEditTempData && itemEditTempData?.itemDesc ? itemEditTempData?.itemDesc : '',
			remarks: itemEditTempData && itemEditTempData?.remarks ? itemEditTempData?.remarks : '',
			targetPrice: itemEditTempData && itemEditTempData?.targetPrice ? itemEditTempData?.targetPrice : '',
			quantity: itemEditTempData && itemEditTempData?.quantity ? itemEditTempData?.quantity : '',
			uom: itemEditTempData && itemEditTempData?.uom ? itemEditTempData?.uom : '',
			hidePrice: itemEditTempData && itemEditTempData?.hidePrice == true ? itemEditTempData?.hidePrice : false,
			startPrice: itemEditTempData && itemEditTempData?.startPrice ? itemEditTempData?.startPrice : '',
			showStartPrice: itemEditTempData && itemEditTempData?.showStartPrice == false ? itemEditTempData?.showStartPrice : true,
			ceilingPrice: itemEditTempData && itemEditTempData?.ceilingPrice ? itemEditTempData?.ceilingPrice : '',
			decreamentOn: itemEditTempData && itemEditTempData?.decreamentOn ? itemEditTempData?.decreamentOn : 'A',
			// maskL1Price: itemEditTempData && itemEditTempData?.maskL1Price ? itemEditTempData?.maskL1Price : false,
			maskL1Price: itemEditTempData?.maskL1Price !== undefined
				? itemEditTempData?.maskL1Price
				: (tempDataForItemService[0]?.bidSubTypeId === 83 ? true : false),
			groupNo: itemEditTempData && itemEditTempData?.groupNo ? itemEditTempData?.groupNo : 0,
			itemBidDuration: itemEditTempData && itemEditTempData?.itemBidDuration ? itemEditTempData?.itemBidDuration : 0,
			minimumDelta: itemEditTempData && itemEditTempData?.minimumDelta ? itemEditTempData?.minimumDelta : '',
			priceDecAmount: itemEditTempData && itemEditTempData?.priceDecAmount ? itemEditTempData?.priceDecAmount : '',
			priceDecFrq: itemEditTempData && itemEditTempData?.priceDecFrq ? itemEditTempData?.priceDecFrq : 1,
			hideVendor: itemEditTempData && itemEditTempData?.hideVendor ? itemEditTempData?.hideVendor : true,
			itemStatus: itemEditTempData && itemEditTempData?.itemStatus ? itemEditTempData?.itemStatus : '',
			noOfExtension: itemEditTempData && itemEditTempData?.noOfExtension ? itemEditTempData?.noOfExtension : 0,
			extensions: itemEditTempData && itemEditTempData?.extensions ? itemEditTempData?.extensions : 0,
			itemCategory: itemEditTempData && itemEditTempData?.itemCategory ? itemEditTempData?.itemCategory : '',
			itemType: itemEditTempData && itemEditTempData?.itemType ? itemEditTempData?.itemType : '',
			itemTypeId: itemEditTempData && itemEditTempData?.itemTypeId ? itemEditTempData?.itemTypeId : '',
			plant: itemEditTempData && itemEditTempData?.plant ? itemEditTempData?.plant : '',
			deliveryDate: itemEditTempData && itemEditTempData?.deliveryDate ? new Date(itemEditTempData?.deliveryDate) : null,
			itemFile: itemEditTempData && itemEditTempData?.itemFile ? itemEditTempData?.itemFile : "",
			itemImage: itemEditTempData && itemEditTempData?.itemImage ? itemEditTempData?.itemImage : "",
			poNumber: itemEditTempData && itemEditTempData?.poNumber ? itemEditTempData?.poNumber : '',
			poVendorName: itemEditTempData && itemEditTempData?.poVendorName ? itemEditTempData?.poVendorName : '',
			poUnitRate: itemEditTempData && itemEditTempData?.poUnitRate ? itemEditTempData?.poUnitRate : '',
			poDate: itemEditTempData && itemEditTempData?.poDate ? new Date(itemEditTempData?.poDate) : null,
			poValue: itemEditTempData && itemEditTempData?.poValue ? itemEditTempData?.poValue : ''
		},
		validationSchema: validationSchema,
		onSubmit: (values, { resetForm }) => {

			console.log('values', values)
			let finalItemBidDuration = values?.itemBidDuration !== '' && values?.itemBidDuration !== null ? values.itemBidDuration : 0;
			let itemStDate = "0001-01-01T00:00:00";
			let itemEndDate = "0001-01-01T00:00:00";
			const isDecrementBid = (bidTypeIDs == 2 || bidTypeIDs == 3 || bidTypeIDs == 4 || bidTypeIDs == 6);
			const isIncrementBid = (bidTypeIDs == 1 || bidTypeIDs == 5);
			const minimumDelta = formik.values.minimumDelta;
			const validatedDelta = isNaN(minimumDelta) || minimumDelta == "" ? 0 : parseFloat(minimumDelta);
			if ((validatedDelta <= 0 || isNaN(validatedDelta)) && tempDataForItemService[0]?.bidSubTypeId !== 82) {
				const bidTypeID = tempDataForItemService[0]?.bidTypeID;
				const errorMessage = (bidTypeID == 1 || bidTypeID == 5)
					? 'Minimum increment is required'
					: 'Minimum decrement is required';

				formik.setFieldError('minimumDelta', errorMessage);
				return;
			}

			if (formik.values.priceDecAmount <= 0 && tempDataForItemService[0]?.bidSubTypeId == 82) {
				formik.setFieldError('priceDecAmount', 'priceDecAmount cannot be less than 0');
				return;
			}

			if ((formik.values.itemBidDuration < 1 || (isNaN(formik.values.itemBidDuration))) && tempDataForItemService[0]?.bidClosingType == 'S') {
				formik.setFieldError('itemBidDuration', 'item bid duration is required');
				return;
			}

			if (bidSubTypeIds !== 82) {
				// const isDecrementBid = (bidTypeIDs == 2 || bidTypeIDs == 3 || bidTypeIDs == 4 || bidTypeIDs == 6);
				// const isIncrementBid = (bidTypeIDs == 1 || bidTypeIDs == 5);
				const minDelta = parseFloat(values.minimumDelta);
				const startPrice = parseFloat(values.startPrice);

				if (minDelta > startPrice) {
					if (isDecrementBid) {
						formik.setFieldError('minimumDelta', 'Minimum decrement should be less than Start Unit Price');
					} else if (isIncrementBid) {
						formik.setFieldError('minimumDelta', 'Minimum increment should be less than Start Unit Price');
					}
					return;
				}

				if (minDelta == startPrice && isDecrementBid) {
					formik.setFieldError('minimumDelta', 'Minimum decrement should not equal to Start Unit Price');
					return;
				}

				if (minDelta > 20 && values.decreamentOn == 'P') {
					if (isDecrementBid) {
						formik.setFieldError('minimumDelta', 'Minimum decrement should be less than 20%.');

					} else if (isIncrementBid) {
						formik.setFieldError('minimumDelta', 'Minimum increment should be less than 20%.');
					}
					return;
				}
			}

			if (bidSubTypeIds == 82) {

				const startPrice = parseFloat(values.startPrice);
				const ceilingPrice = parseFloat(values.ceilingPrice);
				const priceDecAmount = parseFloat(values.priceDecAmount);
				const priceDecFrq = parseInt(values.priceDecFrq || 1);

				if (priceDecAmount > startPrice) {
					if (isDecrementBid) {
						formik.setFieldError('priceDecAmount', 'Price increment amount should be less than Start Unit Price');
					} else if (isIncrementBid) {
						formik.setFieldError('priceDecAmount', 'Price decrement amount should be less than Start Unit Price');
					}
					return;
				}
				if (priceDecAmount > 20 && values.decreamentOn == 'P') {
					if (isDecrementBid) {
						formik.setFieldError('minimumDelta', 'Minimum decrement should be less than 20%.');

					} else if (isIncrementBid) {
						formik.setFieldError('minimumDelta', 'Minimum increment should be less than 20%.');
					}
					return;
				}
				if (startPrice >= ceilingPrice && bidTypeIDs == 2) {
					formik.setFieldError('startPrice', 'Start Price must be less than the Ceiling Price.');
					return;
				}
				if (startPrice <= ceilingPrice && bidTypeIDs == 1) {
					formik.setFieldError('startPrice', 'Start Price must be greater than the Floor Price.');
					return;
				}

				if (bidTypeIDs == 2) {

					const duration = Math.floor((ceilingPrice - startPrice) / priceDecAmount) + priceDecFrq;
					if (duration < 1) {
						toast.error(
							"Invalid bid duration: Please check Start Price, Ceiling Price, and Price Decrement Amount. " +
							"The formula (Ceiling Price - Start Price) ÷ Price Decrement + Frequency must result in at least 1.",
							{ toastId: "invalidBidDuration", autoClose: 5000 }
						);
						return;
					}
					finalItemBidDuration = duration > 0 ? duration : 0;
				}
				else if (bidTypeIDs == 1) {

					const duration = Math.floor((startPrice - ceilingPrice) / priceDecAmount) + priceDecFrq;
					if (duration < 1) {
						toast.error(
							"Invalid bid duration: Please check Start Price, Ceiling Price, and Price Decrement Amount. " +
							"The formula (Start Price - Floor Price) ÷ Price Decrement + Frequency must result in at least 1.",
							{ toastId: "invalidBidDuration", autoClose: 5000 }
						);
						return;
					}
					finalItemBidDuration = duration > 0 ? duration : 0;
				}
			}

			var data = {
				id: itemEditTempData && itemEditTempData?.id > 0 ? itemEditTempData?.id : 0,
				bidId: parseInt(idFromURL),
				itemName: sanitizeInput(values?.itemName),
				itemCode: sanitizeInput(values?.itemCode),
				remarks: sanitizeInput(values?.remarks),
				itemDesc: sanitizeInput(values?.itemDesc),
				targetPrice: values?.targetPrice != '' ? values?.targetPrice : 0,
				quantity: values?.quantity != '' ? values?.quantity : 0,
				uom: values?.uom,
				hidePrice: values?.hidePrice,
				startPrice: values?.startPrice != '' ? values?.startPrice : 0,
				showStartPrice: values?.showStartPrice,
				ceilingPrice: values?.ceilingPrice != '' ? values?.ceilingPrice : 0,
				decreamentOn: values?.decreamentOn,
				maskL1Price: values?.maskL1Price,
				groupNo: values?.groupNo,
				itemBidDuration: finalItemBidDuration,
				itemStDate: itemStDate,
				itemEndDate: itemEndDate,
				minimumDelta: values?.minimumDelta != '' ? values?.minimumDelta : 0,
				priceDecAmount: values?.priceDecAmount != '' ? values?.priceDecAmount : 0,
				priceDecFrq: values?.priceDecFrq,
				hideVendor: values?.hideVendor,
				itemStatus: values?.itemStatus,
				noOfExtension: values?.noOfExtension,
				extensions: values?.extensions,
				itemRefId: itemEditTempData && itemEditTempData?.itemRefId > 0 ? itemEditTempData?.itemRefId : 0,
				itemCategory: values?.itemCategory,
				itemType: values?.itemType,
				itemTypeId: values?.itemTypeId,
				plant: sanitizeInput(values?.plant),
				deliveryDate: values?.deliveryDate,
				itemImage: values?.itemImage,
				itemFile: values?.itemFile,
				poNumber: values?.poNumber,
				poVendorName: sanitizeInput(values?.poVendorName),
				poUnitRate: values?.poUnitRate != '' ? values?.poUnitRate : 0,
				poDate: values?.poDate,
				poValue: values?.poValue != '' ? values?.poValue : 0,
			};

			console.log('data request', data)
			setLoadingSubmit(true)
			if (data && data?.id == 0) {
				try {
					AuctionItemServiceAdd(data, atoken).then((res) => {
						setLoadingSubmit(false);
						if (res && res > 0) {
							callbackItemAdd(res, bidSubTypeIds == 82 ? finalItemBidDuration : null)
						}
					});
				} catch (error) {
					console.error("Error during form submission:", error);
					toast.error("An error occurred while saving the data. Please try again.", {
						toastId: "itemdelete1_error"
					});
					setLoadingSubmit(false);
				}
			}
			else {
				AuctionItemServiceUpdate(data, atoken).then((res) => {
					if (res && res > 0) {
						callbackItemAdd(res, bidSubTypeIds == 82 ? finalItemBidDuration : null)
					} else {
						toast.error("An error occurred while updating the data. Please try again.", {
							toastId: "itemdelete2_error"
						});
						setLoadingSubmit(false);
					}
				});
			}
		}
	});

	const handleUomChange = (event, value) => {
		if (value && value.id === "new") {
			setUomModal(true); // Open modal to add a new UOM
		} else {
			// Find the selected UOM in the UOMMaster list
			const selectedOption = UOMMaster.find(option => option.uom === value?.uom);

			// Set the selected UOM in both Formik and local state
			formik.setFieldValue("uom", selectedOption?.uom || "");
			setuom(selectedOption?.uom || "");
		}
	};

	const handleItemPOSearch = async (value) => {
		const selectedValue = value
		const res = await apiClient.get(
			`api/poconfirm/Find?CustomerId=${parseInt(customerid)}&POCreationDetails_ItemDesc=${selectedValue}`,
			atoken
		);

		if (res) {

			const lastElement = res.result[res.result.length - 1]; // Get the last element
			if (lastElement) {
				formik.setFieldValue("poNumber", lastElement?.poNumber);
				formik.setFieldValue("poVendorName", lastElement?.vendorName);
				formik.setFieldValue("poValue", lastElement?.poAmount)
				formik.setFieldValue("poDate", lastElement?.pO_Date ? new Date(lastElement?.pO_Date) : null);
				const materialPONetPrice = lastElement?.poCreationDetails[0]?.materialPONetPrice;
				formik.setFieldValue("poUnitRate", materialPONetPrice ? parseFloat(materialPONetPrice) : 0);
			}
		}

	};

	const [itemCatAllList, setItemCatAllList] = useState([]);
	const [UOMMaster, setUOMMaster] = useState([]);
	const [CategoryModal, setCategoryModal] = useState(false);
	const [itemTypeList, setItemTypeList] = useState([]);
	const [ItemTypeModal, setItemTypeModal] = useState(false);

	const PullItemCateogory = () => {
		var data = {
			CustomerId: customerid,
		};
		FindItemCategory(data, atoken).then((resp) => {
			setItemCatAllList(resp);
		});
	};

	const PullItemType = () => {

		var data = {
			CustomerId: customerid,
			IsActive: true
		};
		FindItemType(data, atoken).then((resp) => {
			// Ensure we only keep active item types
			const list = Array.isArray(resp) ? resp.filter(r => r?.isActive) : [];
			setItemTypeList(list);
		});
	};

	const handleCategoryList = (array) => {
		setItemCatAllList(array);
	};

	const handleItemTypeList = (array) => {
		// When receiving list updates (from modal), keep only active items
		const list = Array.isArray(array) ? array.filter(a => a?.isActive) : [];
		setItemTypeList(list);
	};

	const pullUOMMasterList = () => {
		var data = {
			CustomerId: customerid
		};
		UOMMasterList(data, atoken).then((res) => {
			setUOMMaster(res);
		});
	};

	const CloseCategoryModal = () => setCategoryModal(false);
	const CloseItemTypeModal = () => setItemTypeModal(false);
	const [category, setcategory] = useState("");
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
		if (value && value?.id === "new") {
			setItemTypeModal(true);
			return;
		}

		// value may already be the selected option object from options
		let selectedOption = null;
		if (value && value.id !== undefined) {
			selectedOption = value;
		} else if (value && value?.itemType) {
			selectedOption = itemTypeList?.find(option => option?.itemType === value?.itemType);
		}

		// Set the Formik value with both itemType and itemTypeId
		formik.setFieldValue("itemType", selectedOption?.itemType || "");
		formik.setFieldValue("itemTypeId", selectedOption?.id || "");
	};

	//file upload changes
	const handleItemImageChange = (event) => {
		const file = event.target.files[0];
		UploadItemImage(file);
	};

	const UploadItemImage = async (file) => {
		if (!file) {
			return;
		}
		// Define the data object for upload
		const data = {
			RequestedBy: "customer",
			EventType: "Auction",
			CustomerId: customerid,
			Description: "Itemimage",
		};

		// Upload the file to Azure and get the return path
		try {
			const url = await uploadFilesOnAzureURL(data, file, atoken);
			formik.setFieldValue("itemImage", url)
		} catch (error) {
			formik.setFieldValue("itemImage", "")
		}
	}
	const handleItemAttachmentChange = (event) => {
		const file = event.target.files[0];
		UploadItemAttachment(file);
	};

	const UploadItemAttachment = async (file) => {
		if (!file) {
			return;
		}
		const data = {
			RequestedBy: "customer",
			EventType: "Auction",
			CustomerId: customerid,
			Description: "Itemfile",
		};

		// Upload the file to Azure and get the return path
		try {
			const url = await uploadFilesOnAzure2(data, file, atoken);
			formik.setFieldValue("itemFile", url.blobName)
		} catch (error) {

			formik.setFieldValue("itemFile", "")
		}
	}


	return (
		<div>
			<form onSubmit={formik.handleSubmit} autoComplete="off">
				<div className='row mt-2'>
					<input
						id="itemimagefile"
						className="d-none"
						type="file"
						accept="image/jpeg,image/gif,image/png"
						onChange={handleItemImageChange}
					/>
					<input
						id="itemattachmentfile"
						className="d-none"
						type="file"
						onChange={handleItemAttachmentChange}
					/>
					<div className='col-12 col-md-6 mb-4'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							id="itemName"
							name="itemName"
							label="Item/Service Name *"
							onBlur={() => handleItemPOSearch(formik.values.itemName)}
							inputProps={{ maxLength: 100 }}
							value={formik.values.itemName}
							onChange={formik.handleChange}
							error={formik.touched.itemName && Boolean(formik.errors.itemName)}
							helperText={formik.touched.itemName && formik.errors.itemName}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.itemName?.length}/100
										</Typography>
									</InputAdornment>
								),
							}}
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
							id="itemCode"
							name="itemCode"
							label="Item Code"
							inputProps={{ maxLength: 50 }}
							value={formik.values.itemCode}
							onChange={formik.handleChange}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik?.values?.itemCode?.length}/50
										</Typography>
									</InputAdornment>
								),
							}}
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
							value={formik.values.itemDesc}
							onChange={formik.handleChange}
							error={formik.touched.itemDesc && Boolean(formik.errors.itemDesc)}
							helperText={formik.touched.itemDesc && formik.errors.itemDesc}
							disabled={!!itemEditTempData.itemRefId}
							InputProps={{
								endAdornment: formik.values.itemDesc && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.itemDesc.length}/2000
										</Typography>
									</InputAdornment>
								),
							}}
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
							label="Remark"
							inputProps={{ maxLength: 2000 }}
							value={formik.values.remarks}
							onChange={formik.handleChange}
							InputProps={{
								endAdornment: formik.values.remarks && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.remarks.length}/2000
										</Typography>
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className={`col-12 ${tempDataForItemService[0]?.bidSubTypeId == 82 ? 'col-md-6' : 'col-md-4'} mb-4`}>
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
							InputProps={{
								step: 0.0001, // Set the step to 0.01 to allow for two decimal places
								min: 0,
								max: 100,
							}}
							type="number"
							onChange={(e) => {
								if (DecimalValueRegEx.test(e.target.value)) {
									formik.setFieldValue("quantity", e.target.value);
								}
								else if (e.target.value === "") {
									formik.setFieldValue("quantity", '');
								}
							}}
							error={formik.touched.quantity && Boolean(formik.errors.quantity)}
							helperText={formik.touched.quantity && formik.errors.quantity}
						/>
					</div>
					<div className={`col-12 ${tempDataForItemService[0]?.bidSubTypeId == 82 ? 'col-md-6' : 'col-md-4'} mb-4`}>
						<Autocomplete
							id="uom"
							name="uom"
							size="small"
							className="w-100 f14"
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
							disabled={!!itemEditTempData.itemRefId} // Disable if itemRefId exists
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

					{tempDataForItemService[0]?.bidSubTypeId !== 82 && (
						<div className='col-12 col-md-4 mb-4'>
							<TextField
								id='maskL1Price'
								name="maskL1Price"
								select
								className="w-100 f14"
								size="small"
								label={tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5 ? "Show H1 Price *" : "Show L1 Price *"}
								variant="outlined"
								value={formik?.values?.maskL1Price}
								onChange={formik.handleChange}
							>
								<MenuItem value={false}>No</MenuItem>
								<MenuItem value={true}>Yes</MenuItem>
							</TextField>
						</div>
					)}

					<div className='col-12 col-md-6 mb-4'>
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
							label="Target Unit Price"
							value={formik.values.targetPrice}
							InputProps={{
								step: 0.0001, // Set the step to 0.01 to allow for two decimal places
								min: 0,
								max: 100,
							}}
							type="number"
							onChange={(e) => {
								if (DecimalValueRegEx.test(e.target.value)) {
									formik.setFieldValue("targetPrice", e.target.value);
								}
								else if (e.target.value === "") {
									formik.setFieldValue("targetPrice", '');
								}
							}}
						/>
					</div>

					<div className='col-12 col-md-6 mb-4'>
						<TextField
							name="hidePrice"
							id='hidePrice'
							select
							className="w-100 f14"
							size="small"
							label="Show Target Price *"
							variant="outlined"
							value={formik.values.hidePrice}
							onChange={formik.handleChange}
						>
							<MenuItem value={true}>
								Show
							</MenuItem>
							<MenuItem value={false}>
								Hide
							</MenuItem>
						</TextField>
					</div>

					<div className='col-12 col-md-6 mb-4'>
						<TextField
							id="startUnitPrice"
							name="startUnitPrice"
							InputLabelProps={{
								shrink: true,
							}}
							fullWidth
							variant="outlined"
							size="small"
							className='f14'
							label="Start Unit Price *"
							value={formik?.values?.startPrice}
							InputProps={{
								step: 0.0001, // Set the step to 0.01 to allow for two decimal places
								min: 0,
								max: 100,
							}}
							type="number"
							onChange={(e) => {
								if (DecimalValueRegEx.test(e.target.value)) {
									formik.setFieldValue("startPrice", e.target.value);
								}
								else if (e.target.value === "") {
									formik.setFieldValue("startPrice", '');
								}
							}}
							error={formik.touched.startPrice && Boolean(formik.errors.startPrice)}
							helperText={formik.touched.startPrice && formik.errors.startPrice}
						/>

					</div>

					<div className='col-12 col-md-6 mb-4'>
						{tempDataForItemService[0]?.bidSubTypeId == 82 ? (
							// Render ceilingPrice field if bidSubTypeId is 82
							<TextField
								id="ceilingPrice"
								name="ceilingPrice"
								InputLabelProps={{
									shrink: true,
								}}
								fullWidth
								variant="outlined"
								size="small"
								className='f14'
								label={tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5 ? "Floor Price *" : "Ceiling Price *"}
								value={formik?.values?.ceilingPrice}
								InputProps={{
									step: 0.0001,
									min: 0,
									max: 100,
								}}
								type="number"
								onChange={(e) => {
									if (DecimalValueRegEx.test(e.target.value)) {
										formik.setFieldValue("ceilingPrice", e.target.value);
									}
									else if (e.target.value === "") {
										formik.setFieldValue("ceilingPrice", '');
									}
								}}
							/>
						) : (
							<TextField
								id='showStartPrice'
								name="showStartPrice"
								select
								className="w-100 f14"
								size="small"
								label="Show Start Price *"
								variant="outlined"
								value={formik?.values?.showStartPrice}
								onChange={formik.handleChange}
							>
								<MenuItem value={true}>
									Show
								</MenuItem>
								<MenuItem value={false}>
									Hide
								</MenuItem>
							</TextField>
						)}
					</div>
					<div className='col-12 col-md-6 mb-4'>
						{tempDataForItemService[0]?.bidSubTypeId === 82 ? (
							<>
								<TextField
									id="priceDecAmount"
									name="priceDecAmount"
									InputLabelProps={{
										shrink: true,
									}}
									fullWidth
									variant="outlined"
									size="small"
									className='f14'
									label={
										tempDataForItemService[0]?.bidTypeID === 1 || tempDataForItemService[0]?.bidTypeID === 5
											? "Price Decrement Amount *"
											: "Price Increment Amount *"
									}
									value={formik?.values?.priceDecAmount}
									InputProps={{
										step: 0.0001, // Set the step to 0.01 to allow for two decimal places
										min: 0,
										//max: 100,
									}}
									type="number"
									onChange={(e) => {
										if (DecimalValueRegEx.test(e.target.value)) {
											formik.setFieldValue("priceDecAmount", e.target.value);
										}
										else if (e.target.value === "") {
											formik.setFieldValue("priceDecAmount", '');
										}
									}}
								/>
								{formik.errors.priceDecAmount && formik.touched.priceDecAmount && (
									<div className="error error-red" style={{ fontSize: '12px' }}>
										{formik.errors.priceDecAmount}
									</div>
								)}
							</>

						) : (
							<>
								<TextField
									id="minimumDelta"
									name="minimumDelta"
									InputLabelProps={{
										shrink: true,
									}}
									fullWidth
									variant="outlined"
									size="small"
									className='f14'
									label={
										tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5
											? "Minimum Increment *"
											: "Minimum Decrement *"
									}
									value={formik?.values?.minimumDelta}
									InputProps={{
										step: 0.0001, // Set the step to 0.01 to allow for two decimal places
										min: 0,
										//max: 100,
									}}
									type="number"
									onChange={(e) => {
										if (DecimalValueRegEx.test(e.target.value)) {
											formik.setFieldValue("minimumDelta", e.target.value);
										}
										else if (e.target.value === "") {
											formik.setFieldValue("minimumDelta", '');
										}
									}}
								/>
								{formik.errors.minimumDelta && formik.touched.minimumDelta && (
									<div className="error error-red" style={{ fontSize: '12px' }}>
										{formik.errors.minimumDelta}
									</div>
								)}
							</>
						)}
					</div>
					<div className='col-12 col-md-6 mb-4'>
						{tempDataForItemService[0]?.bidSubTypeId == 82 ? (
							<TextField
								id="priceDecFrq"
								name="priceDecFrq"
								InputLabelProps={{
									shrink: true,
								}}
								fullWidth
								variant="outlined"
								size="small"
								className='f14'
								label={tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5 ? "Price Decrement Frequency (in mins)*" : "Price Increment Frequency (in mins)*"}
								value={formik?.values?.priceDecFrq}
								InputProps={{
									min: 1,
									max: 10,
									step: 0,
								}}
								type="number"
								onChange={(e) => {
									const value = e.target.value;
									//const regex = /^[1-9]$|^10$/;
									if (DecimalValueRegEx.test(e.target.value)) {
										formik.setFieldValue("priceDecFrq", value);
									}
									else if (e.target.value === "") {
										formik.setFieldValue("priceDecFrq", 1);
									}
								}}
							/>
						) : (
							<TextField
								name="decreamentOn"
								select
								className="w-100 f14"
								size="small"
								label={tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5 ? "Increment On *" : "Decrement On *"}
								variant="outlined"
								value={formik?.values?.decreamentOn}
								onChange={formik.handleChange}
							>
								<MenuItem value='A'>
									Amt
								</MenuItem>
								<MenuItem value='P'>
									%age
								</MenuItem>
							</TextField>
						)}
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
							disabled={!!itemEditTempData.itemRefId} // Disable when itemRefId exists
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
									label="Item Category"
									shrink={true}
									error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
									helperText={formik.touched.itemCategory && formik.errors.itemCategory}
								/>
							)}
						/>
					</div>
					{/* added item type */}
					<div className='col-12 col-md-6 col-lg-4 mb-3'>
						<Autocomplete
							id="itemType"
							name="itemType"
							size="small"
							className='w-100 f14'
							sx={{ width: "100%" }}
							options={[
								...itemTypeList,
								{ itemType: "ADD NEW", id: "new" },
							]}
							value={
								itemTypeList.find(
									(option) => option.itemType === formik.values.itemType
								) || (formik.values.itemType ? { itemType: formik.values.itemType } : null)
							}
							isOptionEqualToValue={(option, value) =>
								(option?.id !== undefined && value?.id !== undefined)
									? option.id === value.id
									: option.itemType === value?.itemType
							}
							getOptionLabel={(option) => option?.itemType ?? ""}
							onOpen={() => {
								if (itemTypeList.length === 0) {
									PullItemType();
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
									label="Item Type *"
									shrink={true}
									error={formik.touched.itemType && Boolean(formik.errors.itemType)}
									helperText={formik.touched.itemType && formik.errors.itemType}
								/>
							)}
						/>
					</div>
					<div className='col-6 col-md-6 col-lg-4 mb-3'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							multiline={true}
							id="plant"
							name="plant"
							label="Delivery Location"
							inputProps={{ maxLength: 100 }}
							value={formik?.values?.plant}
							onChange={formik.handleChange}
							disabled={!!itemEditTempData.itemRefId} // Disable when itemRefId exists
							InputProps={{
								endAdornment: formik?.values?.plant && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik?.values?.plant.length}/100
										</Typography>
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className='col-6 col-md-6 col-lg-4 mb-3'>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<MobileDatePicker
								variant="outlined"
								label="Delivery Date"
								size="small"
								name='deliveryDate'
								id='deliveryDate'
								minDate={new Date()}
								value={formik.values.deliveryDate}
								className='w-100 f14'
								slotProps={{
									textField: {
										variant: 'outlined', size: 'small',
										InputLabelProps: { shrink: true },
									}
								}}
								onChange={newValue => {
									formik.setFieldValue('deliveryDate', newValue);
								}}
							/>
						</LocalizationProvider>

					</div>
					<div className='col-6 col-md-6 col-lg-4 mb-3'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14 pointer'
							id="itemImage"
							name="itemImage"
							label="Item Image "
							inputProps={{
								maxLength: 50,
								pattern: '[a-zA-Z0-9-/]*', // This will allow alphabets, numbers, "-" and "/"
							}}
							value={getFileName(formik?.values?.itemImage)}
							disabled={true}
							InputProps={{
								endAdornment: (
									<>
										{!formik?.values?.itemImage ? <Tooltip title="Upload Image" className='pointer'>
											<InputAdornment position="end" >
												<IconButton onClick={() => document.getElementById('itemimagefile').click()
												}>
													<UploadOutlined />
												</IconButton>
											</InputAdornment>
										</Tooltip> : <Tooltip title="remove Image" className='pointer'>
											<InputAdornment position="end">
												<IconButton onClick={() => formik.setFieldValue("itemImage", "")}>
													<HiOutlineX />
												</IconButton>
											</InputAdornment>
										</Tooltip>}
									</>
								),
							}}
						/>
					</div>
					<div className='col-6 col-md-6 col-lg-4 mb-3'>
						<TextField
							fullWidth
							variant="outlined"
							InputLabelProps={{
								shrink: true,
							}}
							size="small"
							className='f14'
							id="itemAttachment"
							name="itemAttachment"
							label="Item Attachment "
							inputProps={{
								maxLength: 50,
								pattern: '[a-zA-Z0-9-/]*', // This will allow alphabets, numbers, "-" and "/"
							}}
							value={getFileName(formik.values.itemFile)}


							disabled={true}
							InputProps={{
								endAdornment: (
									<>
										{!formik?.values?.itemFile ? <Tooltip title="Upload Attachment" className='pointer'>
											<InputAdornment position="end"  >
												<IconButton onClick={() => document.getElementById('itemattachmentfile').click()
												}>
													<UploadOutlined />
												</IconButton>

											</InputAdornment>
										</Tooltip> : <Tooltip title="Remove Attachment" className='pointer'>
											<InputAdornment position="end" >
												<IconButton onClick={() => formik.setFieldValue("itemFile", "")}>
													<HiOutlineX />
												</IconButton>

											</InputAdornment>
										</Tooltip>}
									</>
								),
							}}
						/>
					</div>
					{hasBidClosingTypeS && (
						<div className="col-12 col-md-4 mb-4">
							<TextField
								name="itemBidDuration"
								id="itemBidDuration"
								className="w-100 f14"
								size="small"
								label="Bid Duration (in mins) *"
								variant="outlined"
								value={formik?.values?.itemBidDuration || ''}
								//type='number'
								inputProps={{
									maxLength: 7,
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
								onChange={(e) => {
									const newDuration = e.target.value ? e.target.value : 0;
									formik.setFieldValue('itemBidDuration', newDuration);
								}}
							/>
							{formik.errors.itemBidDuration && formik.touched.itemBidDuration && (
								<div className="error error-red" style={{ fontSize: '12px' }}>
									{formik.errors.itemBidDuration}
								</div>
							)}
						</div>
					)}

				</div>
				<hr className='mt-0' />
				<div className='row mt-2'>
					<div className='col-span-12 mt-4 mb-4'>
						Last PO Details (Optional)
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
							id="poNumber"
							name="poNumber"
							label="PO Number"
							inputProps={{ maxLength: 20 }}
							value={formik?.values?.poNumber}
							onChange={formik.handleChange}
							InputProps={{
								endAdornment: formik.values?.poNumber && (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik?.values?.poNumber?.length}/20
										</Typography>
									</InputAdornment>
								),
							}}
						/>
					</div>
					<div className='col-12 col-md-8 mb-4'>
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
							label="Vendor Name"
							inputProps={{ maxLength: 100 }}
							value={formik.values.poVendorName}
							onChange={formik.handleChange}
						/>
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
							id="poUnitRate"
							name="poUnitRate"
							label="Unit Rate "
							value={formik.values.poUnitRate}
							type="number"
							onChange={(e) => {
								const regex = /^[0-9]*\.?[0-9]{0,2}$/;
								if (regex.test(e.target.value)) {
									formik.setFieldValue("poUnitRate", parseFloat(e.target.value));
								}
							}}
						/>
					</div>
					<div className='col-12 col-md-4 mb-4'>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<MobileDatePicker
								variant="outlined"
								label="PO Date"
								size="small"
								name='poDate'
								id='poDate'
								value={formik.values.poDate}
								className='w-100 f14'
								slotProps={{
									textField: {
										variant: 'outlined', size: 'small',
										InputLabelProps: { shrink: true },
									}
								}}
								onChange={newValue => {
									formik.setFieldValue('poDate', newValue);
								}}
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
							id="poValue"
							name="poValue"
							label="PO Value"
							value={formik.values.poValue}
							type="number"
							onChange={(e) => {
								const regex = /^[0-9]*\.?[0-9]{0,2}$/;
								if (regex.test(e.target.value)) {
									formik.setFieldValue("poValue", parseFloat(e.target.value));
								}
							}}
						/>
					</div>
				</div>
				{action && <div className='text-end'>
					<LoadingButton
						variant='outlined'
						onClick={() => formik.resetForm()}
						color='primary'
						className='me-3 text-capitalize'
						size='small'
					>
						Reset
					</LoadingButton>
					<LoadingButton
						loading={loadingSubmit}
						variant='contained'
						type="submit"
						color='primary'
						className='text-capitalize'
						size='small'
					>
						{itemEditTempData && itemEditTempData?.id > 0 ? 'Update' : 'Add'}
					</LoadingButton>
				</div>}
				<Modal
					size="lg"
					show={UomModal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW CATEGORY"}
					className="rfq-create-modal zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0 rounded-default"
					onHide={() => CloseUomModal()}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title><span style={{ fontSize: 14 }}>Manage UOM</span></Modal.Title>
						<button type="button" className="rfq-modal-close-btn" onClick={() => CloseUomModal()}>
							<HiOutlineX style={{ fontSize: 16 }} />
						</button>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddUpdateUom handleUomList={handleUomList} />
						</div>
					</Modal.Body>
				</Modal>
				<Modal
					size="lg"
					show={CategoryModal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW CATEGORY"}
					className="rfq-create-modal zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0 rounded-default"
					onHide={() => CloseCategoryModal()}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title><span style={{ fontSize: 14 }}>Manage Category</span></Modal.Title>
						<button type="button" className="rfq-modal-close-btn" onClick={() => CloseCategoryModal()}>
							<HiOutlineX style={{ fontSize: 16 }} />
						</button>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddPrItemCategory handleCategoryList={handleCategoryList} isModal={true} />
						</div>
					</Modal.Body>
				</Modal>
				{/* modal for item type */}
				<Modal
					size="lg"
					show={ItemTypeModal}
					backdrop="static"
					keyboard={false}
					value={"Add NEW ITEM TYPE"}
					className="rfq-create-modal zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0 rounded-default"
					onHide={() => CloseItemTypeModal()}
				>
					<Modal.Header className="pt-2 pb-2">
						<Modal.Title><span style={{ fontSize: 14 }}>Manage Item Type</span></Modal.Title>
						<button type="button" className="rfq-modal-close-btn" onClick={() => CloseItemTypeModal()}>
							<HiOutlineX style={{ fontSize: 16 }} />
						</button>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddEditItemType handleItemTypeList={handleItemTypeList} isModal={true} />
						</div>
					</Modal.Body>
				</Modal>
			</form>
		</div>
	)
}

export default AddProductsCell