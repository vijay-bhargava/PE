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

import { HiOutlineX, HiXCircle } from 'react-icons/hi';
import AddUpdateUom from '../../../utils/common/AddUpdateUom';
import { sanitizeInput } from '../../../utils/common/santize';
import { toast } from 'react-toastify';
import { api, ApiClient } from "../../../Apiclient";
import { FindItemCategory } from '../../../utils/purchaseRequest';
import AddPrItemCategory from '../../../utils/common/AddPrItemCategory';
import { UploadOutlined } from '@mui/icons-material';
import { getFileName, uploadFilesOnAzure, uploadFilesOnAzure2, validateFileSize } from '../../../utils/common';
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';

const AddProductsCell = ({ idFromURL, UOMMaster, callbackItemAdd, itemEditTempData, handleUomList ,action,accesslevel}) => {
  const [{ atoken, rtoken, customerid,customersuffix, userDetail }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [UomModal, setUomModal] = useState(false);
  const [uom, setuom] = useState("");
  const [itemFile, setitemFile] = useState("");
  const [attachedFileName, setAttachedFileName] = useState('');
  const [itemImage, setitemImage] = useState("");
  const fileInputRef = useRef(null);
  const CloseUomModal = () => setUomModal(false);

  useEffect(() => {
    PullItemCateogory();
 
}, [atoken, customerid]);
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
    plant: yup
      .string('Enter Delivery Location')
      .required('Delivery Location is required'),
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
      itemImage: itemEditTempData && itemEditTempData?.itemImage ? itemEditTempData?.itemImage : ""
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
        itemCategory:values?.itemCategory,
        itemImage: values?.itemImage,
        itemFile: values?.itemFile
        
      };


      setLoadingSubmit(true)
      if (data && data?.id == 0) {
        try {
          RFQItemServiceAdd(data, atoken,accesslevel).then((res) => {
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
  
  const handleItemPOSearch = async (value) => {
    
    const selectedValue =value
 
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
    if(lastElement){
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
  const CloseCategoryModal = () => setCategoryModal(false);
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

//file upload changes
const handleItemImageChange = (event) => {
  
  if (!validateFileSize(event)) {
    return;
}
  const file = event.target.files[0];
  UploadItemImage(file);
};

const UploadItemImage=async (file)=>{
  
  if(!file){
    return;
  }
  // Define the data object for upload
  const data = {
    RequestedBy: "customer",
    EventType: "RFQ",
    CustomerId: customerid,
    Description: "Itemimage",
  };

  // Upload the file to Azure and get the return path
  try {
    
    const url = await uploadFilesOnAzureURL(data, file, atoken);
    formik.setFieldValue("itemImage",url)
  } catch (error) {
   
    formik.setFieldValue("itemImage","")
  }

}
const handleItemAttachmentChange = (event) => {
  if (!validateFileSize(event)) {
    return;
}
  const file = event.target.files[0];
  UploadItemAttachment(file);
};

const UploadItemAttachment=async (file)=>{
  
  if(!file){
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
    formik.setFieldValue("itemFile",url.blobName)
  } catch (error) {
   
    formik.setFieldValue("itemFile","")
  }

}

  return (
   
    <div>
      <form onSubmit={formik.handleSubmit} autoComplete="off">
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
              label="Item Code "
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
                endAdornment: formik.values.itemCode && (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                      {formik.values.itemCode.length}/50
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />

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
              disabled={!!itemEditTempData.itemRefId} // Disable when itemRefId exists
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
  <Autocomplete
    id="uom"
    name="uom"
    size="small"
    className='w-100 f14'
    options={[
      ...UOMMaster,
      { uom: "ADD NEW", id: "new" },
    ]}
    value={UOMMaster.find(option => option.uom === formik.values.uom) || null}
    getOptionLabel={(option) => option.uom ?? ""}
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
    value={itemCatAllList.find(option => option.categoryDescription === formik.values.itemCategory) || null} // Set the value correctly
    getOptionLabel={(option) => option.categoryDescription ?? ""}
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
              label="Delivery Location *"
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
       {!formik?.values?.itemImage ?<Tooltip title="Upload Image" className='pointer'>
          <InputAdornment position="end" >
          <IconButton onClick={() =>document.getElementById('itemimagefile').click()
    }>
       <UploadOutlined/>
       </IconButton>
          </InputAdornment>
          </Tooltip>:<Tooltip title="remove Image" className='pointer'>
          <InputAdornment position="end">
          <IconButton onClick={() => formik.setFieldValue("itemImage","")}>
          <HiOutlineX/>
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
         {!formik?.values?.itemFile ?<Tooltip title="Upload Attachment" className='pointer'>
          <InputAdornment position="end"  >
       <IconButton onClick={() =>document.getElementById('itemattachmentfile').click()
    }>
       <UploadOutlined/>
       </IconButton>
           
          </InputAdornment>
          </Tooltip>:<Tooltip title="Remove Attachment" className='pointer'>
          <InputAdornment position="end" >
          <IconButton onClick={() => formik.setFieldValue("itemFile","")}>
          <HiOutlineX/>
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
          <div className='col-span-12 mt-2 mb-4'>
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
              inputProps={{ maxLength: 100 }}
              value={formik?.values?.poVendorName}
              onChange={formik?.handleChange}
              error={formik.touched.poVendorName && Boolean(formik.errors.poVendorName)}
              helperText={formik.touched.poVendorName && formik.errors.poVendorName}
              InputProps={{
                endAdornment: formik.values.poVendorName && (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">
                      {formik?.values?.poVendorName?.length}/100
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
																	{`${formik.values.poVendorName?.length}/100`}{" "}
																
																</div> */}
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
              value={formik?.values?.poUnitRate}
              InputProps={{
                step: 0.0001, // Set the step to 0.01 to allow for two decimal places
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
                step: 0.001, // Set the step to 0.01 to allow for two decimal places
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
      </form>
    </div>
  )
}

export default AddProductsCell