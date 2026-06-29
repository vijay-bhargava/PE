import React, { useState, useRef, useEffect } from 'react'
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Autocomplete, Box, IconButton, InputAdornment, MenuItem, TextField, Tooltip, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useStateValue } from '../../../store'
import { Modal } from "react-bootstrap";
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { RFQItemServiceAdd, RFQItemServiceUpdate } from '../../../utils/common/utility';

import { HiOutlineX, HiXCircle, HiOutlineSearch, HiPlusSm, HiPencilAlt } from 'react-icons/hi';
import AddUpdateUom from '../../../utils/common/AddUpdateUom';
import { sanitizeInput } from '../../../utils/common/santize';
import { toast } from 'react-toastify';
import { api, ApiClient } from "../../../Apiclient";
import { FindItemCategory, FindItemType } from '../../../utils/purchaseRequest';
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import { UploadOutlined } from '@mui/icons-material';
import { getFileName, uploadFilesOnAzure, uploadFilesOnAzure2, validateFileSize } from '../../../utils/common';
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';
import { UOMMasterList } from '../../../utils/commerciallibrary';
import AddEditItemType from '../../../utils/common/AddEditITemType';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const AddProductsCell = ({ idFromURL, callbackItemAdd, itemEditTempData, action, accesslevel, Version }) => {
  const [{ atoken, rtoken, customerid, customersuffix, userDetail }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [UomModal, setUomModal] = useState(false);
  const [uom, setuom] = useState("");
  const [itemFile, setitemFile] = useState("");
  const [attachedFileName, setAttachedFileName] = useState('');
  const [itemImage, setitemImage] = useState("");

  const [UOMMaster, setUOMMaster] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [searchItemModal, setSearchItemModal] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [gridloading, setGridloading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [debouncedQuickFilterValue, setDebouncedQuickFilterValue] = useState('');
  const [searchDataLoaded, setSearchDataLoaded] = useState(false);

  const fileInputRef = useRef(null);

  const fetchSuppliers = async () => {
    try {
      console.log('Fetching suppliers for CustomerId:', customerid);
      const res = await apiClient.get(
        `api/managevendors/GetVendorUsers?CustomerId=${customerid}`,
        atoken
      );

      console.log('Raw API response:', res);

      // Check if we got a valid response 
      if (!res) {
        console.error('No response received from API');
        throw new Error('No response from API');
      }

      // Check if res.result exists and is an array
      if (Array.isArray(res.data)) {
        console.log('Setting supplier list with:', res.data);
        setSupplierList(res.data);
      } else {
        console.warn('Unexpected response format:', res);
        setSupplierList([]);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers. Please try again.", {
        toastId: "supplier_fetch_error"
      });
      setSupplierList([]);
    }
  };

  // Fetch suppliers when component mounts
  useEffect(() => {
    fetchSuppliers();
  }, []);

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

  const CloseUomModal = () => setUomModal(false);

  // Removed useEffect for PullItemCateogory - now called only on user interaction
  const validationSchema = yup.object().shape({
    itemName: yup
      .string('Enter Item/Service Name')
      .max(200, "Max 200 character")
      .required('Item/Service Name is required'),
    // itemCode: yup
    //     .string('Enter Item')
    //     .required('Item Code is required'),
    itemDesc: yup
      .string('Enter Description')
      .required('Description is required'),

    quantity: yup.number()
      .min(0.01, 'Quantity must be greater than 0') // Ensure quantity is greater than 0
      .required('Quantity is required')
      .nullable(),
    uom: yup
      .string('Enter uom')
      .required('UoM is required'),
    // plant: yup
    //   .string('Enter Delivery Location')
    //   .required('Delivery Location is required'),
    itemType: yup
      .string('Select Item Type')
      .required('Item Type is required'),
    // delivaryInDays: yup
    //   .string('Enter delivery days')
    //   .required('Delivery Day is required'),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      itemName: itemEditTempData && itemEditTempData?.itemName ? itemEditTempData?.itemName : '',
      itemCode: itemEditTempData && itemEditTempData?.itemCode ? itemEditTempData?.itemCode : '',
      itemCategory: itemEditTempData && itemEditTempData?.itemCategory ? itemEditTempData?.itemCategory : '',
      itemType: itemEditTempData && itemEditTempData?.itemType ? itemEditTempData?.itemType : '',
      itemTypeId: itemEditTempData && itemEditTempData?.itemTypeId ? itemEditTempData?.itemTypeId : '',
      remarks: itemEditTempData && itemEditTempData?.remarks ? itemEditTempData?.remarks : '',
      itemDesc: itemEditTempData && itemEditTempData?.itemDesc ? itemEditTempData?.itemDesc : '',
      targetPrice: itemEditTempData && itemEditTempData?.targetPrice ? itemEditTempData?.targetPrice : '',
      quantity: itemEditTempData && itemEditTempData?.quantity ? itemEditTempData?.quantity : '',
      uom: itemEditTempData && itemEditTempData?.uom ? itemEditTempData?.uom : '',
      plant: itemEditTempData && itemEditTempData?.plant ? itemEditTempData?.plant : '',
      deliveryDate: itemEditTempData && itemEditTempData?.deliveryDate ? new Date(itemEditTempData?.deliveryDate) : null,
      poNumber: itemEditTempData && itemEditTempData?.poNumber ? itemEditTempData?.poNumber : '',
      poVendorName: itemEditTempData && itemEditTempData?.poVendorName ? itemEditTempData?.poVendorName : '',
      poUnitRate: itemEditTempData && itemEditTempData?.poUnitRate ? itemEditTempData?.poUnitRate : '',
      poDate: itemEditTempData && itemEditTempData?.poDate ? new Date(itemEditTempData?.poDate) : null,
      poValue: itemEditTempData && itemEditTempData?.poValue ? itemEditTempData?.poValue : '',
      itemFile: itemEditTempData && itemEditTempData?.itemFile ? itemEditTempData?.itemFile : "",
      itemImage: itemEditTempData && itemEditTempData?.itemImage ? itemEditTempData?.itemImage : "",

    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {

      var data = {
        id: itemEditTempData && itemEditTempData?.id > 0 ? itemEditTempData?.id : 0,
        customerId: customerid,
        rfqId: parseInt(idFromURL),
        itemName: sanitizeInput(values?.itemName),
        itemCode: sanitizeInput(values?.itemCode),
        remarks: sanitizeInput(values?.remarks),
        itemDesc: sanitizeInput(values?.itemDesc),
        targetPrice: values?.targetPrice != '' ? values?.targetPrice : 0,
        quantity: values?.quantity != '' ? values?.quantity : 0,
        uom: values?.uom,
        plant: sanitizeInput(values?.plant),
        deliveryDate: values?.deliveryDate,
        poNumber: values?.poNumber,
        poVendorName: sanitizeInput(values?.poVendorName),
        poUnitRate: values?.poUnitRate != '' ? values?.poUnitRate : 0,
        poDate: values?.poDate,
        poValue: values?.poValue != '' ? values?.poValue : 0,
        itemRefId: itemEditTempData && itemEditTempData?.itemRefId > 0 ? itemEditTempData?.itemRefId : 0,
        itemCategory: values?.itemCategory,
        itemType: values?.itemType,
        itemTypeId: values?.itemTypeId,
        itemImage: values?.itemImage,
        itemFile: values?.itemFile,
        Version: Version

      };


      setLoadingSubmit(true)
      if (data && data?.id == 0) {
        try {
          RFQItemServiceAdd(data, atoken, accesslevel).then((res) => {
            setLoadingSubmit(false);
            if (res && res > 0) {
              callbackItemAdd(res)
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
        RFQItemServiceUpdate(data, atoken).then((res) => {
          setLoadingSubmit(false);
          if (res && res > 0) {
            callbackItemAdd(res)
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
      setUomModal(true);
    } else {
      const selectedOption = UOMMaster.find(option => option.uom === value?.uom);
      formik.setFieldValue("uom", selectedOption?.uom || "");
      setuom(selectedOption?.uom || "");
    }
  };


  // const handleUomChange = (e) => {
  //   const selectedValue = e.target.value;
  //   if (selectedValue === "new") {
  //     setUomModal(true);
  //   } else {
  //     const selectedOption = UOMMaster.find(option => option.uom === selectedValue);
  //     setuom(selectedOption?.uom);
  //     formik.setFieldValue("uom", selectedOption?.uom)
  //   }
  //   formik.setFieldValue(selectedValue);
  //   setuom(selectedValue);
  // };
  const handleDeliveryChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      formik.setFieldValue(e.target.name, value);
    }
  };

  const handleSupplierSelection = (event, value) => {
    if (value) {
      formik.setFieldValue("poVendorName", value.companyName);
    } else {
      formik.setFieldValue("poVendorName", "");
    }
  };

  const handleItemPOSearch = async (value) => {
    const selectedValue = value

    const res = await apiClient.get(
      `api/poconfirm/Find?CustomerId=${parseInt(customerid)}&POCreationDetails_ItemDesc=${selectedValue}`,
      atoken
    );


    //   if(res) {
    //     console.log("poconfirm",res?.result);


    //     formik.setFieldValue("poNumber", res?.result[0].poNumber);
    //     formik.setFieldValue("poVendorName", res?.result[0]?.vendorName);      
    //     //formik.setFieldValue("poUnitRate", res?.result?[0]?.poCreationDetails[0].materialPONetPrice);
    //    // formik.setFieldValue("poDate", res?.result[0]?.pO_Date);      
    //     formik.setFieldValue("poValue", res?.result[0]?.poAmount);
    //  }
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
  const handleCategoryList = (array) => {
    setItemCatAllList(array);
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

  const handleItemTypeList = (array) => {
    // When receiving list updates (from modal), keep only active items
    const list = Array.isArray(array) ? array.filter(a => a?.isActive) : [];
    setItemTypeList(list);
  };

  const CloseCategoryModal = () => setCategoryModal(false);
  const CloseItemTypeModal = () => setItemTypeModal(false);
  const [category, setcategory] = useState("");


  const handleItemCategoryChange = (event, value) => {
    // API call is now handled in onOpen event of Autocomplete
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
    if (value && value.id === "new") {
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

  //   const handleItemCategoryChange = (event, value) => {
  //     if (value && value.id === "new") {
  //         setCategoryModal(true); 
  //         setcategory(""); 
  //     } else {
  //         const selectedOption = itemCatAllList.find(option => option.categoryDescription === value?.categoryDescription);

  //         // Set the Formik value and local state
  //         formik.setFieldValue("itemCategory", selectedOption?.categoryDescription || "");
  //         setcategory(selectedOption?.categoryDescription || "");
  //     }
  // };

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
      EventType: "RFQ",
      EventId: idFromURL,
      CustomerId: customerid,
      Description: "ItemImage",
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
      EventType: "RFQ",
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

  const itemColumns = [
    { field: "itemCode", headerName: "Item Code", width: 150 },
    { field: "itemName", headerName: "Item Name", width: 200 },
    { field: "itemType", headerName: "Item Type", width: 150 },
    { field: "itemCategory", headerName: "Category", width: 150 },
    { field: "uom", headerName: "UOM", width: 100 },
    { field: "plant", headerName: "Plant", width: 150 },
  ];

  const getRowId = (row) => row.itemCode || row.id;

  const handleSelectItemFromGrid = () => {
    if (selectedRows.length === 0) {
      toast.warning('Please select at least one item');
      return;
    }
    const selectedItemCode = selectedRows[0];
    const selectedItem = itemList.find((it) => String(it.itemCode) === String(selectedItemCode));
    if (selectedItem) {
      formik.setFieldValue('itemCode', selectedItem.itemCode ?? '');
      formik.setFieldValue('itemName', selectedItem.itemName ?? '');
      formik.setFieldValue('itemType', selectedItem.itemType ?? '');
      formik.setFieldValue('itemTypeId', selectedItem.itemTypeId ?? '');
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
    }
    setSearchItemModal(false);
    setSelectedRows([]);
  };

  return (

    <div>
      <form id="add-product-form" onSubmit={formik.handleSubmit} autoComplete="off">
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
              inputProps={{
                maxLength: 50,
                pattern: '[a-zA-Z0-9-/]*', // This will allow alphabets, numbers, "-" and "/"
              }}

              value={formik.values.itemCode}
              // onChange={formik.handleChange}
              onChange={(e) => {
                // Only allow valid characters (alphanumeric, - and /)
                const value = e.target.value;
                const regex = /^[a-zA-Z0-9-/]*$/;
                if (regex.test(value)) {
                  formik.handleChange(e);
                }
              }}
              //error={formik.touched.itemCode && Boolean(formik.errors.itemCode)}
              //helperText={formik.touched.itemCode && formik.errors.itemCode}
              disabled={!!itemEditTempData.itemRefId} // Disable when itemRefId exists
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {formik.values.itemCode && (
                      <Typography variant="body2" color="textSecondary" className="me-1">
                        {formik.values.itemCode.length}/50
                      </Typography>
                    )}
                    {!itemEditTempData.itemRefId && (
                      <Tooltip title="Search Item">
                        <IconButton
                          size="small"
                          onClick={() => {
                            pullItemMaster(1, pageSize);
                            if (itemTypeList.length === 0) PullItemType();
                            setSearchItemModal(true);
                          }}
                        >
                          <HiOutlineSearch className="f14 text-primary" />
                        </IconButton>
                      </Tooltip>
                    )}
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
              onBlur={() => handleItemPOSearch(formik.values.itemName)}
              inputProps={{ maxLength: 200 }}
              value={formik.values.itemName}
              onChange={formik.handleChange}
              error={formik.touched.itemName && Boolean(formik.errors.itemName)}
              helperText={formik.touched.itemName && formik.errors.itemName}
              InputProps={{
                endAdornment: formik.values.itemName && (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                      {formik.values.itemName.length}/200
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
            {/* <div
																	style={{
																		fontSize: "0.8em",
																		color: "blue",
																		textAlign: "end",
																	}}
																>
																	{`${formik.values.shortName?.length}/100`}{" "}
																	
																</div> */}
          </div>

          {/* <div className='col-12 col-md-4 mb-4'>
                        <TextField
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            size="small"
                            className='f14'
                            id="remark"
                            name="remark"
                            label="Remarks"
                            inputProps={{ maxLength: 200 }}
                            value={formik.values.remark}
                            onChange={formik.handleChange}
                            error={formik.touched.remark && Boolean(formik.errors.remark)}
                            helperText={formik.touched.remark && formik.errors.remark}
                            InputProps={{
                                endAdornment: formik.values.remark && (
                                  <InputAdornment position="end">
                                    <Typography variant="body2" color="textSecondary">
                                      {formik.values.remark.length}/200
                                    </Typography>
                                  </InputAdornment>
                                ),
                              }}
                        />
                     
                    </div> */}
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

          <div className='col-12 col-md-6 mb-4'>
            <label className="pe-field-label">Remark</label>
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
              value={formik.values.remarks}
              onChange={formik.handleChange}
              error={formik.touched.remarks && Boolean(formik.errors.remarks)}
              helperText={formik.touched.remarks && formik.errors.remarks}
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
              disabled={!!itemEditTempData.itemRefId} // Disable when itemRefId exists
              InputProps={{
                step: 0.0001, // Set the step to 0.01 to allow for two decimal places
                min: 0,
                max: 100,
              }}
              type="number"
              // onChange={(e) => {
              //   const regex = /^[0-9]*\.?[0-9]{0,4}$/;
              //   if (regex.test(e.target.value)) {
              //     formik.setFieldValue("targetPrice", parseFloat(e.target.value));
              //   }
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
              disabled={!!itemEditTempData.itemRefId} // Disable when itemRefId exists
              InputProps={{
                step: 0.0001,
                min: 0,
                max: 100,
              }}
              type="number"
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
              //value={UOMMaster.find(option => option.uom === formik.values.uom) || null}
              getOptionLabel={(option) => option.uom ?? ""}
              onOpen={() => {
                // Call API when dropdown opens
                if (UOMMaster.length === 0) {
                  pullUOMMasterList();
                }
              }}
              onChange={handleUomChange}
              disabled={!!itemEditTempData.itemRefId} // Disable if itemRefId exists
              renderOption={(props, option) => (
                <Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
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
              //value={itemCatAllList.find(option => option.categoryDescription === formik.values.itemCategory) || null} // Set the value correctly
              getOptionLabel={(option) => option.categoryDescription ?? ""}
              onOpen={() => {
                // Call API when dropdown opens
                if (itemCatAllList.length === 0) {
                  PullItemCateogory();
                }
              }}
              onChange={handleItemCategoryChange}
              renderOption={(props, option) => (
                <Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>

                  {option.categoryDescription}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  {...params}
                  shrink={true}
                  error={formik.touched.itemCategory && Boolean(formik.errors.itemCategory)}
                  helperText={formik.touched.itemCategory && formik.errors.itemCategory}
                />
              )}
            />
          </div>
          {/* added item type */}
          <div className='col-12 col-md-6 col-lg-4 mb-3'>
            <label className="pe-field-label">Item Type <span className="rfq-required-star">*</span></label>
            <Autocomplete
              id="itemType"
              name="itemType"
              size="small"
              className='w-100 f14'
              sx={{ width: "100%" }}
              options={[
                { itemType: "ADD NEW", id: "new" },
                ...itemTypeList,
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
                <Box component="li" {...props} className={(props.className || "") + (option.id === "new" ? " dropdown-add-new" : "")}>
                  {option.itemType}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  {...params}
                  shrink={true}
                  error={formik.touched.itemType && Boolean(formik.errors.itemType)}
                  helperText={formik.touched.itemType && formik.errors.itemType}
                />
              )}
            />
          </div>
          <div className='col-6 col-md-6 col-lg-4 mb-3'>
            <label className="pe-field-label">Delivery Location</label>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              className='f14'
              multiline={true}
              id="plant"
              name="plant"
              inputProps={{ maxLength: 100 }}
              value={formik?.values?.plant}
              onChange={formik.handleChange}
              error={formik.touched.plant && Boolean(formik.errors.plant)}
              helperText={formik.touched.plant && formik.errors.plant}
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
            <label className="pe-field-label">Delivery Date</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                variant="outlined"
                size="small"
                name='deliveryDate'
                id='deliveryDate'
                minDate={new Date()}
                value={formik.values.deliveryDate}
                className='w-100 f14'
                slotProps={{
                  textField: {
                    variant: 'outlined', size: 'small',
                    InputLabelProps: { shrink: false },
                    error: formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate),
                    helperText: formik.touched.deliveryDate && formik.errors.deliveryDate
                  }
                }}
                onChange={newValue => {
                  formik.setFieldValue('deliveryDate', newValue);
                }}
              //   format="L hh:mm a"
              />
            </LocalizationProvider>

          </div>


          <div className='col-6 col-md-6 col-lg-4 mb-3'>
            <label className="pe-field-label">Item Image</label>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              className='f14 pointer'
              id="itemImage"
              name="itemImage"
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
          </div>
          <div className='col-6 col-md-6 col-lg-4 mb-3'>
            <label className="pe-field-label">Item Attachment</label>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              className='f14'
              id="itemAttachment"
              name="itemAttachment"
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


          {/* <div className="col-6 col-md-6 mb-4">
					<div className="f13 mb-1">Item Image</div>
					<Form.Group controlId="formFile" className="">
						<Form.Control
							type="file"
							size="sm"
							accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							onChange={(e) => handleFileInputChange(e, setimgBG1, setErrorBG1)}
						/>
						{errorBG1 && <div className="text-danger" style={{ fontSize: "15px" }}>{errorBG1}</div>}
						{imgBG1 && (
							<div style={{ position: 'relative', top: "5px" }}>
								<Stack>
									<Avatar
										alt="BG1"
										//src={imgBG1}
										sx={{
											width: 35,
											height: 35,
										}}
										imgProps={{
											style: {
												width: "100%",
												height: "100%",
												objectFit: "fill",
											},
										}}
									/>
								</Stack>
								<IconButton
									
									style={{
										position: 'absolute',
										top: '0px',
										left: '20px',
										padding: '0px 10px',
										zIndex: '1',
										color: "rgba(220, 53, 69)"
									}}
									size="small"
								
									sx={{ mr: 1 }}
								>
									<HiOutlineX className="f20" />
								</IconButton>
							</div>
						)}
					</Form.Group>
				</div> */}
          {/* <div className=" col-6 col-md-6 mb-4">
        <div className="f13 mb-1">Item Attachment</div>

              <Form.Group controlId="formFile" className="">
            <Form.Control
              type="file"
              size="sm"
              accept=".docx,.doc,image/jpeg,image/gif,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            
              onChange={(e) => handleFileUpload(e)}
              ref={fileInputRef}
            />
          </Form.Group>
          <div
            className="col-12 col-md-6 "
            style={{ color: "blue", fontStyle: "italic" }}
          >
            <div id="attachedFileName">
            {itemFile && (
            <div className="d-flex align-items-center justify-content-start mt-2">
              <Button
                variant="text"
                size="small"
                className="attached-file-name"
              >
                {attachedFileName}
              </Button>
              <IconButton
                size="medium"
                className="bg-white ml-2"
             
                onClick={Handleremove}// Clear filename on click
              >
                <HiOutlineX className="f16 text-danger" />
              </IconButton>
            </div>
          )}
            </div>
          </div>
              </div> */}
        </div>
        <hr className='mt-0' />
        <div className='row mt-2'>
          <div className='col-12 mt-4 mb-4 font-bold'>
            Last PO Details (Optional)
          </div>
          <div className='col-12 col-md-4 mb-4'>
            <label className="pe-field-label">PO Number</label>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              className='f14'
              id="poNumber"
              name="poNumber"
              inputProps={{ maxLength: 20 }}
              value={formik?.values?.poNumber}
              onChange={formik?.handleChange}
              error={formik.touched.poNumber && Boolean(formik.errors.poNumber)}
              helperText={formik.touched.poNumber && formik.errors.poNumber}
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
          <div className='col-12 col-md-4 mb-4'>
            <label className="pe-field-label">Supplier Name</label>
            <Autocomplete
              fullWidth
              size="small"
              id="poVendorName"
              className="f14"
              freeSolo
              selectOnFocus
              clearOnBlur={false}
              options={[
                { contactPerson: "Others", companyName: "", id: "others" },
                ...supplierList
              ]}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if (!option) return '';
                if (option.id === "others") return "Others (Enter manually)";
                const contactPerson = option.contactPerson || '';
                const companyName = option.companyName || '';
                return companyName ? `${contactPerson} — ${companyName}` : contactPerson;
              }}
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                if (typeof value === 'string') return option.contactPerson === value;
                return (
                  option.contactPerson === value.contactPerson &&
                  option.companyName === value.companyName
                );
              }}
              inputValue={formik.values.poVendorName || ""}
              value={
                supplierList.find(s => s.contactPerson === formik.values.poVendorName) ||
                formik.values.poVendorName ||
                null
              }
              onInputChange={(event, newInputValue, reason) => {
                // Allow typing manually and update formik
                if (reason === 'input') {
                  formik.setFieldValue('poVendorName', newInputValue);
                }
              }}
              onChange={(event, newValue) => {
                if (!newValue) {
                  formik.setFieldValue('poVendorName', '');
                } else if (typeof newValue === 'string') {
                  formik.setFieldValue('poVendorName', newValue);
                } else if (newValue.id === "others") {
                  // Selecting 'Others' just clears current input for manual entry
                  formik.setFieldValue('poVendorName', '');
                } else {
                  formik.setFieldValue('poVendorName', newValue.contactPerson);
                }
              }}
              onOpen={() => {
                if (supplierList.length === 0) {
                  fetchSuppliers();
                }
              }}
              loading={supplierList.length === 0}
              loadingText="Loading suppliers..."
              noOptionsText="No suppliers found"
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  style={
                    option.id === "others"
                      ? { fontStyle: 'italic', borderBottom: '1px solid #eee', color: '#1976d2' }
                      : {}
                  }
                >
                  {option.id === "others"
                    ? "Others"
                    : option.companyName
                      ? `${option.contactPerson} — ${option.companyName}`
                      : option.contactPerson}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  error={formik.touched.poVendorName && Boolean(formik.errors.poVendorName)}
                  helperText={formik.touched.poVendorName && formik.errors.poVendorName}
                  placeholder={
                    formik.values.poVendorName === "" && params.focused
                      ? "Enter supplier name"
                      : ""
                  }
                />
              )}
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
              value={formik?.values?.poUnitRate}
              InputProps={{ step: 0.0001, min: 0, max: 100 }}
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
            <label className="pe-field-label">PO Date</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                variant="outlined"
                size="small"
                name='poDate'
                id='poDate'
                value={formik.values.poDate}
                className='w-100 f14'
                slotProps={{
                  textField: {
                    variant: 'outlined', size: 'small',
                    InputLabelProps: { shrink: false },
                    error: formik.touched.poDate && Boolean(formik.errors.poDate),
                    helperText: formik.touched.poDate && formik.errors.poDate
                  }
                }}
                onChange={newValue => {
                  formik.setFieldValue('poDate', newValue);
                }}
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
              value={formik.values.poValue}
              InputProps={{ step: 0.001, min: 0, max: 100 }}
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

        <Modal
          size="xl"
          show={searchItemModal}
          backdrop="static"
          keyboard={false}
          className="zindex1400"
          backdropClassName="zindex1400"
          centered
          contentClassName="border-0"
          onHide={() => { setSearchItemModal(false); setSelectedRows([]); setQuickFilterValue(''); setSearchMode(false); setSearchDataLoaded(false); setPage(0); }}
        >
          <Modal.Header className="pt-2 pb-2 bgheaderCards">
            <Modal.Title id="modal-heading">
              <div className="d-flex align-items-center f14 text-white">Search Item</div>
            </Modal.Title>
            <IconButton onClick={() => { setSearchItemModal(false); setSelectedRows([]); setQuickFilterValue(''); setSearchMode(false); setSearchDataLoaded(false); setPage(0); }} size="small" edge="start">
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
                    slotProps={{ toolbar: { showQuickFilter: false } }}
                  />
                </div>
                <div className="col-12 d-flex justify-content-end mt-3">
                  {selectedRows.length > 0 && (
                    <LoadingButton
                      variant="contained"
                      onClick={handleSelectItemFromGrid}
                      color="primary"
                      className="text-capitalize"
                      size="medium"
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
          dialogClassName="modal-custom-mdlg"
          show={UomModal}
          backdrop="static"
          keyboard={false}
          value={"Add NEW CATEGORY"}
          className="zindex1400"
          backdropClassName="zindex1400"
          centered
          contentClassName="border-0"
          onHide={() => CloseUomModal()}
        >
          <Modal.Body className="p-0 d-flex flex-column" style={{ height: '78vh', overflow: 'hidden' }}>
            <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
              <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Manage UOM</span>
              <IconButton onClick={() => CloseUomModal()} size="small">
                <HiOutlineX className="f20" style={{ color: 'var(--pe-text, #1f2937)' }} />
              </IconButton>
            </div>
            <div className="p-3">
              <AddUpdateUom handleUomList={handleUomList} isModal={true} />
            </div>
          </Modal.Body>
        </Modal>
        <Modal
          size="lg"
          show={CategoryModal}
          backdrop="static"
          keyboard={false}
          value={"Add NEW CATEGORY"}
          className="zindex1400"
          backdropClassName="zindex1400"
          centered
          contentClassName="border-0"
          onHide={() => CloseCategoryModal()}
        >
          <Modal.Body className="p-0 d-flex flex-column" style={{ height: '78vh', overflow: 'hidden' }}>
            <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
              <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}>Manage Item Category</span>
              <IconButton onClick={() => CloseCategoryModal()} size="small">
                <HiOutlineX className="f20" style={{ color: 'var(--pe-text, #1f2937)' }} />
              </IconButton>
            </div>
            <div className="p-3 flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
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
          // value={"Add NEW ITEM TYPE"}
          className="zindex1400"
          backdropClassName="zindex1400"
          centered
          contentClassName="border-0"
          onHide={() => CloseItemTypeModal()}
        >
          <Modal.Body className="p-0 d-flex flex-column" style={{ height: '78vh', overflow: 'hidden' }}>
            <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom bg-white flex-shrink-0">
              <span className="f16 fw-bold" style={{ color: 'var(--pe-text, #1f2937)' }}> Manage Item Type</span>
              <IconButton onClick={() => CloseItemTypeModal()} size="small">
                <HiOutlineX className="f20" style={{ color: 'var(--pe-text, #1f2937)' }} />
              </IconButton>
            </div>
            <div className="p-3 flex-grow-1" style={{ minHeight: 0, overflow: 'hidden' }}>
              <AddEditItemType handleItemTypeList={handleItemTypeList} isModal={true} />
            </div>
          </Modal.Body>
        </Modal>
      </form>
    </div>
  )
}

export default AddProductsCell
