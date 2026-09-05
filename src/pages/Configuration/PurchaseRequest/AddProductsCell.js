import React, { useState, useEffect } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Modal } from "react-bootstrap";
import TextFieldCell from '../../BaseCells/TextFieldCell'
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, IconButton, Autocomplete, Box, Tooltip } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useStateValue } from '../../../store'
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { HiOutlineX } from 'react-icons/hi';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FindItemCategory, FindPlantStorage, PRItemServiceAdd, PRItemServiceUpdate, getItemCategory, getPRManageFind, getPlantStorage } from '../../../utils/purchaseRequest';
import { toast } from 'react-toastify';
import AddUpdateUom from '../../../utils/common/AddUpdateUom';
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import AddPrPlant from '../../../utils/common/AddPrPlant';
import { api, ApiClient } from "../../../Apiclient";
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';
import { getFileName, uploadFilesOnAzure2, validateFileSize } from '../../../utils/common';
import { UploadOutlined } from '@mui/icons-material';
import { UOMMasterList } from '../../../utils/commerciallibrary';

const AddProductsCell = ({ idFromURL, callbackItemAdd, itemEditTempData, handleUomList, action }) => {
	const [{ atoken, rtoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
	const apiClient = new ApiClient(customersuffix);

	const [itemCatAllList, setItemCatAllList] = useState([]);
	const [plantAllList, setPlantAllList] = useState([]);
	const [itemList, setItemList] = useState([]);
	const [UOMMaster, setUOMMaster] = useState([]);
	const [uom, setuom] = useState("");
	const [category, setcategory] = useState("");
	const [Plant, setPlant] = useState("");
	const [UomModal, setUomModal] = useState(false);
	const [CategoryModal, setCategoryModal] = useState(false);
	const [PlantModal, setPlantModal] = useState(false);
	const CloseUomModal = () => setUomModal(false);
	const CloseCategoryModal = () => setCategoryModal(false);
	const ClosePlantModal = () => setPlantModal(false);
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

	const pullItemMaster = async () => {
		try {
			const res = await apiClient.get(`api/ItemMaster/Find?CustomerId=${customerid}`, atoken);
			if (res && res.result) {
				setItemList(res.result);
			} else {
				setItemList([]);
			}
		} catch (err) {
			console.error('pullItemMaster error', err);
			setItemList([]);
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
		if (customerid) pullItemMaster();
	}, [customerid]);

	const [loadingSubmit, setLoadingSubmit] = useState(false)

	const validationSchema = yup.object().shape({
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
		quantity: yup.number()
			.min(0.01, 'Quantity must be greater than 0') // Ensure quantity is greater than 0
			.required('Quantity is required')
			.nullable(),
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
			itemName: itemEditTempData && itemEditTempData?.itemName ? itemEditTempData?.itemName : '',
			itemCode: itemEditTempData && itemEditTempData?.itemCode ? itemEditTempData?.itemCode : '',
			itemCategory: itemEditTempData && itemEditTempData?.itemCategory ? itemEditTempData?.itemCategory : '',
			plant: itemEditTempData && itemEditTempData?.plant ? itemEditTempData?.plant : '',
			itemDesc: itemEditTempData && itemEditTempData?.itemDesc ? itemEditTempData?.itemDesc : '',
			targetPrice: itemEditTempData && itemEditTempData?.targetPrice ? itemEditTempData?.targetPrice : '',
			quantity: itemEditTempData && itemEditTempData?.quantity ? itemEditTempData?.quantity : '',
			uom: itemEditTempData && itemEditTempData?.uom ? itemEditTempData?.uom : '',
			deliveryDate: itemEditTempData && itemEditTempData?.deliveryDate ? new Date(itemEditTempData?.deliveryDate) : null,
			poNumber: itemEditTempData && itemEditTempData?.poNumber ? itemEditTempData?.poNumber : '',
			poVendorName: itemEditTempData && itemEditTempData?.poVendorName ? itemEditTempData?.poVendorName : '',
			poUnitRate: itemEditTempData && itemEditTempData?.poUnitRate ? itemEditTempData?.poUnitRate : '',
			poDate: itemEditTempData && itemEditTempData?.poDate ? new Date(itemEditTempData?.poDate) : null,
			poValue: itemEditTempData && itemEditTempData?.poValue ? itemEditTempData?.poValue : '',
			remarks: itemEditTempData && itemEditTempData?.remarks ? itemEditTempData?.remarks : '',
			itemFile: itemEditTempData && itemEditTempData?.itemFile ? itemEditTempData?.itemFile : "",
			itemImage: itemEditTempData && itemEditTempData?.itemImage ? itemEditTempData?.itemImage : ""
		},
		validationSchema: validationSchema,
		onSubmit: async (values, { resetForm }) => {
			if (loadingSubmit) return; // Prevent multiple submissions
			setLoadingSubmit(true)

			console.log('values', values)

			// Fetch existing PR items using getPRManageFind
			const existingPRData = await getPRManageFind({ Id: idFromURL }, atoken);
			if (!existingPRData || existingPRData.length === 0) {
				toast.error("Failed to fetch existing PR data.");
				setLoadingSubmit(false);
				return;
			}

			// Collect all prItems from all existing PR data entries
			const existingPRItems = [];
			for (let i = 0; i < existingPRData.length; i++) {
				if (existingPRData[i].prItems && existingPRData[i].prItems.length > 0) {
					existingPRItems.push(...existingPRData[i].prItems);
				}
			}

			// Check for duplicate itemCode in the form values and existing PR items
			const originalItemCode = itemEditTempData?.itemCode;
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
				return; // Stop processing further
			}

			var data = {
				id: itemEditTempData && itemEditTempData?.id > 0 ? itemEditTempData?.id : 0,
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
				deliveryDate: values?.deliveryDate,
				poNumber: values?.poNumber,
				poVendorName: values?.poVendorName,
				poUnitRate: values?.poUnitRate != '' ? values?.poUnitRate : 0,
				poDate: values?.poDate,
				poValue: values?.poValue != '' ? values?.poValue : 0,
				remarks: values?.remarks,
				itemImage: values?.itemImage,
				itemFile: values?.itemFile
			};
			console.log('data request', data)
			if (data && data?.id == 0) {

				PRItemServiceAdd(data, atoken).then((res) => {

					setLoadingSubmit(false);
					if (res && res > 0) {
						// toast.success("Item/Services Added Successfully!", {
						//     toastId: "cheSuccessfullyPass"
						// });
						callbackItemAdd(res)
					}
				});
			}
			else {

				PRItemServiceUpdate(data, atoken).then((res) => {

					setLoadingSubmit(false);
					if (res && res > 0) {
						// toast.success("Item/Services Updated Successfully!", {
						//    toastId: "ServiceUpdPassword"
						// });
						callbackItemAdd(res)
					}
				});
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
		} else {
			// Find the selected plant from the list
			const selectedOption = plantAllList.find(option => option.slDesc === value?.slDesc);

			// Set the form field value and local state

			formik.setFieldValue("plant", selectedOption ? `${selectedOption.slDesc} - ${selectedOption.slCode?.trim()}` : value);
			setPlant(selectedOption ? `${selectedOption.slDesc} - ${selectedOption.slCode?.trim()}` : value);

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
			return;
		}
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
			EventType: "PR",
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
		if (!validateFileSize(event)) {
			return;
		}
		const file = event.target.files[0];
		UploadItemAttachment(file);
	};

	const UploadItemAttachment = async (file) => {

		if (!file) {
			return;
		}
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
							select
							fullWidth
							size="small"
							label="Item Code"
							name="itemCode"
							value={formik.values.itemCode}
							onChange={handleItemSelect}
							SelectProps={{
								native: false,
							}}
						>
							{itemList && itemList.length > 0 ? (
								itemList.map((item) => (
									<MenuItem key={item.id} value={item.itemCode}>
										{item.itemCode} - {item.itemName}
									</MenuItem>
								))
							) : (
								<MenuItem value="">No items</MenuItem>
							)}
						</TextField>
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
							id="itemName"
							name="itemName"
							label="Item/Service Name *"
							onBlur={() => handleItemPOSearch(formik.values.itemName)}
							inputProps={{ maxLength: 100 }}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.itemName.length}/100
										</Typography>
									</InputAdornment>
								),
							}}
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
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik?.values?.itemDesc?.length}/2000
										</Typography>
									</InputAdornment>
								),
							}}
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
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik?.values?.remarks?.length}/2000
										</Typography>
									</InputAdornment>
								),
							}}
							value={formik?.values?.remarks}
							onChange={formik.handleChange}
						/>
					</div>

					{/* <div className='col-12 col-md-6 col-lg-4 mb-3'>
                        <TextField
                            id="itemCategory"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            name="itemCategory"
                            select
                            className='w-100 f14'
                            size="small"
                            label="Item Category *"
                            variant="outlined"
                            value={formik?.values?.itemCategory}
                            onChange={handleItemCategoryChange}
       error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
                            helperText={formik.touched.itemCategory && formik.errors.itemCategory}
                        >

                            {itemCatAllList && itemCatAllList?.map((option, i) => (
                                <MenuItem key={i} value={option?.categoryDescription}>
                                    {option?.categoryDescription}
                                </MenuItem>
                            ))}
                            <MenuItem
                                value={"new"}
                                className="bggray"
                                style={{
                                    color: "blue",
                                    fontSize: "13PX",
                                    fontStyle: "italic",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}

                            >
                                <ins>ADD NEW</ins>
                            </MenuItem>
                        </TextField>
                    </div> */}
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
							//value={itemCatAllList.find(option => option.categoryDescription === formik.values.itemCategory) || null} // Set the value correctly
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
								{ slDesc: "ADD ", slCode: "new" }, // Add an "ADD NEW" option
							]}
							// value={plantAllList.find(option => `${option.slDesc} - ${option.slCode?.trim()}` === formik.values.plant) || null}
							// getOptionLabel={(option) => `${option.slDesc} - ${option.slCode?.trim()}`}
							value={
								plantAllList.find(option => option.slDesc === formik.values.plant)
								|| { slDesc: formik.values.plant, slCode: "" }
							}
							getOptionLabel={(option) =>
								option.slCode?.trim() ? `${option.slDesc} - ${option.slCode.trim()}` : option.slDesc
							}
							onOpen={() => {
								if (plantAllList.length === 0) {
									PullPlantStorage();
								}
							}}

							onChange={handlePlantChange}
							renderOption={(props, option) => (
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

									{`${option.slDesc}  ${option.slCode?.trim() ?? ""}`}


								</Box>
							)}
							renderInput={(params) => (
								<TextField
									variant="outlined"
									{...params}
									label="Plant"
									shrink={true}
								//error={formik.touched.plant && Boolean(formik.errors.plant)}
								//helperText={formik.touched.plant && formik.errors.plant}
								/>
							)}
						/>
					</div>

					<div className='col-12 col-md-4 mb-4'>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<MobileDatePicker
								variant="outlined"
								label="Delivery Date"
								size="small"
								name='deliveryDate'
								id='deliveryDate'
								value={formik?.values?.deliveryDate}
								className='w-100 f14'
								slotProps={{
									textField: {
										variant: 'outlined', size: 'small',
										InputLabelProps: { shrink: true },
										error: formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate),
										helperText: formik.touched.deliveryDate && formik.errors.deliveryDate
									}
								}}
								// onChange={newValue => {
								//     formik.setFieldValue('deliveryDate', newValue);
								// }}
								onChange={newValue => handleDateChange(newValue, formik)}
							//   format="L hh:mm a"
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
							InputProps={{
								step: 0.01, // Set the step to 0.01 to allow for two decimal places
								min: 0,
								max: 100,

							}}
							type="number"


							// onChange={(e) => {
							//     const value = e.target.value;
							//     if (value === "" || /^[0-9]*\.?[0-9]{0,4}$/.test(value)) {
							//         // Only update if the value is valid and greater than 0, or empty (for backspace)
							//         if (value !== "" && parseFloat(value) > 0) {
							//             formik.setFieldValue("quantity", parseFloat(value));
							//         } else if (value === "") {
							//             // Allow clearing the value (empty input when backspacing)
							//             formik.setFieldValue("quantity", "");
							//         }
							//     }
							// }}
							onChange={(e) => {
								const value = e.target.value;
								// Regex to allow up to 7 digits in total, including up to 4 digits after the decimal point
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
					{/* <div className='col-12 col-md-4 mb-4'>
                        <TextField
                            id="uom"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            name="uom"
                            select
                            className='w-100 f14'
                            size="small"
                            label="UOM *"
                            variant="outlined"
                            value={formik.values.uom}
                            onChange={handleUomChange}
                            error={formik.touched.uom && Boolean(formik.errors.uom)}
                            helperText={formik.touched.uom && formik.errors.uom}>
                            {UOMMaster && UOMMaster?.map((option, i) => (
                                <MenuItem key={i} value={option?.uom}>
                                    {option?.uom}
                                </MenuItem>
                            ))}
                            <MenuItem
                                value={"new"}
                                className="bggray"
                                style={{
                                    color: "blue",
                                    fontSize: "13PX",
                                    fontStyle: "italic",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}

                            >
                                <ins>ADD NEW</ins>
                            </MenuItem>
                        </TextField>
                    </div> */}
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
							//value={UOMMaster.find(option => option.uom === formik.values.uom) || null}
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
							InputProps={{
								step: 0.01,
								min: 0,
								max: 100,
							}}
							type="number"
							// onChange={(e) => {
							//     const regex = /^[0-9]*\.?[0-9]{0,4}$/;
							//     if (regex.test(e.target.value)) {
							//         formik.setFieldValue("targetPrice", parseFloat(e.target.value));
							//     }
							// }}
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
					{/* <div className='col-6 col-md-6 col-lg-4 mb-3'>
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
                            // onChange={formik.handleChange}

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
                    </div> */}
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
							// onChange={formik.handleChange}

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
												<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => formik.setFieldValue("itemImage", "")}>
													<HiOutlineX />
												</button>
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
												<button type="button" className="pe-icon-btn pe-icon-btn--delete" onClick={() => formik.setFieldValue("itemFile", "")}>
													<HiOutlineX />
												</button>

											</InputAdornment>
										</Tooltip>}
									</>
								),
							}}
						/>
					</div>

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
							value={formik.values.poNumber}
							inputProps={{ maxLength: 100 }}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.poNumber.length}/100
										</Typography>
									</InputAdornment>
								),
							}}
							onChange={formik.handleChange}
							error={formik.touched.poNumber && Boolean(formik.errors.poNumber)}
							helperText={formik.touched.poNumber && formik.errors.poNumber}
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
							label="Supplier Name"
							value={formik.values.poVendorName}
							inputProps={{ maxLength: 100 }}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<Typography variant="body2" color="textSecondary">
											{formik.values.poVendorName.length}/100
										</Typography>
									</InputAdornment>
								),
							}}
							onChange={formik.handleChange}
							error={formik.touched.poVendorName && Boolean(formik.errors.poVendorName)}
							helperText={formik.touched.poVendorName && formik.errors.poVendorName}
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
							// value={formik.values.unitRate}
							value={formik.values.poUnitRate}
							InputProps={{
								step: 0.01, // Set the step to 0.01 to allow for two decimal places
								min: 0,
								max: 100,
							}}
							type="number"
							onChange={(e) => {
								const regex = /^[0-9]*\.?[0-9]{0,4}$/;
								if (regex.test(e.target.value)) {
									formik.setFieldValue("poUnitRate", parseFloat(e.target.value));
								}
							}}
							error={formik.touched.poUnitRate && Boolean(formik.errors.poUnitRate)}
							helperText={formik.touched.poUnitRate && formik.errors.poUnitRate}
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
										error: formik.touched.poDate && Boolean(formik.errors.poDate),
										helperText: formik.touched.poDate && formik.errors.poDate
									}
								}}
								onChange={newValue => {
									formik.setFieldValue('poDate', newValue);
								}}
							//   format="L hh:mm a"
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
							InputProps={{
								step: 0.01, // Set the step to 0.01 to allow for two decimal places
								min: 0,
								max: 100,
							}}
							type="number"
							onChange={(e) => {
								const regex = /^[0-9]*\.?[0-9]{0,4}$/;
								if (regex.test(e.target.value)) {
									formik.setFieldValue("poValue", parseFloat(e.target.value));
								}
							}}
							error={formik.touched.poValue && Boolean(formik.errors.poValue)}
							helperText={formik.touched.poValue && formik.errors.poValue}
						/>
					</div>
				</div>
				{action && <div className='text-end'>
					<LoadingButton
						// loading
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
						disabled={loadingSubmit}
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
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => CloseUomModal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								Manage  UOM
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => CloseUomModal()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="f20 text-white" />
						</IconButton>
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
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					contentClassName="border-0"
					onHide={() => CloseCategoryModal()}
				>
					<Modal.Header className="pt-2 pb-2 bgheaderCards">
						<Modal.Title id="modal-heading">
							<div className="d-flex align-items-center f14 text-white">
								Manage Item Category
							</div>
						</Modal.Title>
						<IconButton
							onClick={() => CloseCategoryModal()}
							size="small"
							edge="start"
						>
							<HiOutlineX className="f20 text-white" />
						</IconButton>
					</Modal.Header>
					<Modal.Body className="p-0">
						<div className="p-3">
							<AddPrItemCategory handleCategoryList={handleCategoryList} />
						</div>
					</Modal.Body>
				</Modal>
				<Modal
					show={PlantModal}
					backdrop="static"
					keyboard={false}
					className="zindex1280"
					backdropClassName="zindex1280"
					centered
					dialogClassName="modal-custom-mdlg"
					onHide={() => ClosePlantModal()}
				>
					<Modal.Body className="p-0 d-flex flex-column">
						<div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
							<span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Manage Plant</span>
							<IconButton onClick={() => ClosePlantModal()} size="small" className="modal-close-btn">
								<HiOutlineX className="f20" style={{ color: 'var(--pe-text, #1f2937)' }} />
							</IconButton>
						</div>
						<div className="p-3 flex-grow-1 d-flex flex-column" style={{ minHeight: 0, overflow: 'hidden' }}>
							<AddPrPlant handlePlantList={handlePlantList} isModal={true} />
						</div>
					</Modal.Body>
				</Modal>
			</form>
		</div>
	)
}

export default AddProductsCell