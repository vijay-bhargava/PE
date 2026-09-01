import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Autocomplete, Box, IconButton, InputAdornment, TextField, Tooltip, Typography,
} from '@mui/material';
import { LocalizationProvider, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { UploadOutlined } from '@mui/icons-material';
import { HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useStateValue } from '../../../store';
import { ApiClient } from '../../../Apiclient';
import { sanitizeInput } from '../../../utils/common/santize';
import { getApiErrorMessage, validateFileSize, uploadFilesOnAzure2 } from '../../../utils/common';
import { uploadFilesOnAzureURL } from '../../../utils/manageParticipants';

export const NFA_ADD_PRODUCT_FORM_ID = 'nfa-add-product-form';

const validationSchema = yup.object().shape({
  itemName: yup.string().max(200, 'Max 200 characters').required('Item/Service Name is required'),
  itemDesc: yup.string().required('Description is required'),
  quantity: yup.number().min(0.01, 'Quantity must be greater than 0').required('Quantity is required').nullable(),
  uom: yup.string().required('UoM is required'),
  itemType: yup.string().required('Item Type is required'),
  plant: yup.string().required('Plant is required'),
});

const addNewClass = (props, option, idField = 'id') => ({
  ...props,
  className: (props.className || '') + (option[idField] === 'new' ? ' dropdown-add-new' : ''),
});

/**
 * Pure form component — owns no modal state.
 * All ADD NEW modals live in the parent (NFASOBEventBoxRFQ) outside the drawer.
 */
const NFAAddProductCell = ({
  nfaId,
  itemEditTempData,
  callbackItemAdd,
  action,
  // lists (managed by parent)
  categoryList = [],
  itemTypeList = [],
  plantList = [],
  uomList = [],
  // lazy loaders
  onLoadCategoryList,
  onLoadItemTypeList,
  onLoadPlantList,
  onLoadUomList,
  // modal openers (rendered at parent level, outside the drawer)
  onOpenCategoryModal,
  onOpenItemTypeModal,
  onOpenPlantModal,
  onOpenUomModal,
}) => {
  const [{ atoken, customerid, customersuffix }] = useStateValue();
  const apiClient = new ApiClient(customersuffix);

  const isEdit = itemEditTempData?.id > 0;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      itemName: itemEditTempData?.itemName || '',
      itemCode: itemEditTempData?.itemCode || '',
      itemCategory: itemEditTempData?.itemCategory || '',
      itemType: itemEditTempData?.itemType || '',
      itemTypeId: itemEditTempData?.itemTypeId || '',
      itemDesc: itemEditTempData?.itemDesc || '',
      remarks: itemEditTempData?.remarks || '',
      uom: itemEditTempData?.uom || '',
      plant: itemEditTempData?.plant || '',
      quantity: itemEditTempData?.quantity || '',
      targetPrice: itemEditTempData?.targetPrice || '',
      deliveryDate: itemEditTempData?.deliveryDate ? new Date(itemEditTempData.deliveryDate) : null,
      itemImage: itemEditTempData?.itemImage || '',
      itemFile: itemEditTempData?.itemFile || '',
      version: itemEditTempData?.version || 1,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        id: itemEditTempData?.id || 0,
        nfaId: parseInt(nfaId),
        customerId: customerid,
        itemName: sanitizeInput(values.itemName),
        itemCode: sanitizeInput(values.itemCode),
        itemCategory: sanitizeInput(values.itemCategory),
        itemType: sanitizeInput(values.itemType),
        itemTypeId: values.itemTypeId,
        itemDesc: sanitizeInput(values.itemDesc),
        remarks: sanitizeInput(values.remarks),
        uom: values.uom,
        plant: sanitizeInput(values.plant),
        quantity: parseFloat(values.quantity),
        targetPrice: parseFloat(values.targetPrice) || 0,
        deliveryDate: values.deliveryDate ? new Date(values.deliveryDate).toISOString().split('T')[0] : null,
        itemImage: values.itemImage || '',
        itemFile: values.itemFile || '',
        version: values.version || 1,
      };

      const endpoint = isEdit
        ? '/api/NFAItemService/Update'
        : `/api/NFAItemService/${nfaId}/AddItems`;
      const requestPayload = isEdit ? payload : [payload];

      try {
        const response = await apiClient.postres(endpoint, requestPayload, atoken);
        if (response.status === 200 || response.status === 201) {
          toast.success(isEdit ? 'Item updated successfully' : 'Item added successfully');
          resetForm();
          callbackItemAdd?.();
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error), { toastId: 'nfa_save_item_error' });
      }
    },
  });

  const handleItemImageChange = async (e) => {
    if (!validateFileSize(e)) return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFilesOnAzureURL(
        { RequestedBy: 'customer', EventType: 'NFA', EventId: nfaId, CustomerId: customerid, Description: 'ItemImage' },
        file, atoken
      );
      formik.setFieldValue('itemImage', url);
    } catch { formik.setFieldValue('itemImage', ''); }
  };

  const handleItemAttachmentChange = async (e) => {
    if (!validateFileSize(e)) return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFilesOnAzure2(
        { RequestedBy: 'customer', EventType: 'NFA', CustomerId: customerid, Description: 'Itemfile' },
        file, atoken
      );
      formik.setFieldValue('itemFile', url.blobName);
    } catch { formik.setFieldValue('itemFile', ''); }
  };

  return (
    <div>
      <form id={NFA_ADD_PRODUCT_FORM_ID} onSubmit={formik.handleSubmit} autoComplete="off">
        <input id="nfa-itemimagefile" className="d-none" type="file"
          accept="image/jpeg,image/gif,image/png" onChange={handleItemImageChange} />
        <input id="nfa-itemattachmentfile" className="d-none" type="file"
          onChange={handleItemAttachmentChange} />

        <div className="row mt-2">
          {/* Item/Service Name */}
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Item/Service Name <span className="rfq-required-star">*</span></label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              id="itemName" name="itemName" disabled={!action}
              inputProps={{ maxLength: 200 }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik.values.itemName.length}/200</Typography></InputAdornment> }}
              value={formik.values.itemName}
              onChange={formik.handleChange}
              error={formik.touched.itemName && Boolean(formik.errors.itemName)}
              helperText={formik.touched.itemName && formik.errors.itemName}
            />
          </div>

          {/* Item Code */}
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Item Code</label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              id="itemCode" name="itemCode" disabled={!action}
              inputProps={{ maxLength: 50 }}
              InputProps={{ endAdornment: formik.values.itemCode ? <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik.values.itemCode.length}/50</Typography></InputAdornment> : null }}
              value={formik.values.itemCode}
              onChange={formik.handleChange}
            />
          </div>

          {/* Description */}
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Description <span className="rfq-required-star">*</span></label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              multiline rows={3} id="itemDesc" name="itemDesc" disabled={!action}
              inputProps={{ maxLength: 2000 }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik.values.itemDesc.length}/2000</Typography></InputAdornment> }}
              value={formik.values.itemDesc}
              onChange={formik.handleChange}
              error={formik.touched.itemDesc && Boolean(formik.errors.itemDesc)}
              helperText={formik.touched.itemDesc && formik.errors.itemDesc}
            />
          </div>

          {/* Remarks */}
          <div className="col-12 col-md-6 mb-3">
            <label className="pe-field-label">Remarks</label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              multiline rows={3} id="remarks" name="remarks" disabled={!action}
              inputProps={{ maxLength: 2000 }}
              InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="body2" color="textSecondary">{formik.values.remarks.length}/2000</Typography></InputAdornment> }}
              value={formik.values.remarks}
              onChange={formik.handleChange}
            />
          </div>

          {/* Item Category */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">Item Category</label>
            <Autocomplete size="small" className="w-100 f14" disabled={!action}
              options={[{ categoryDescription: 'ADD NEW', id: 'new' }, ...categoryList]}
              value={categoryList.find(o => o.categoryDescription === formik.values.itemCategory) || { categoryDescription: formik.values.itemCategory }}
              getOptionLabel={(o) => o.categoryDescription ?? ''}
              isOptionEqualToValue={(o, v) => o.categoryDescription === v?.categoryDescription}
              onOpen={() => { if (categoryList.length === 0) onLoadCategoryList?.(); }}
              onChange={(e, value) => {
                if (value?.id === 'new') { onOpenCategoryModal?.(); return; }
                formik.setFieldValue('itemCategory', value?.categoryDescription || '');
              }}
              renderOption={(props, option) => (
                <Box component="li" {...addNewClass(props, option)}>{option.categoryDescription}</Box>
              )}
              renderInput={(params) => <TextField variant="outlined" {...params} />}
            />
          </div>

          {/* Item Type */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">Item Type <span className="rfq-required-star">*</span></label>
            <Autocomplete size="small" className="w-100 f14" disabled={!action}
              options={[{ itemType: 'ADD NEW', id: 'new' }, ...itemTypeList]}
              value={itemTypeList.find(o => o.itemType === formik.values.itemType) || { itemType: formik.values.itemType }}
              isOptionEqualToValue={(o, v) => o?.id !== undefined && v?.id !== undefined ? o.id === v.id : o.itemType === v?.itemType}
              getOptionLabel={(o) => o?.itemType ?? ''}
              onOpen={() => { if (itemTypeList.length === 0) onLoadItemTypeList?.(); }}
              onChange={(e, value) => {
                if (value?.id === 'new') { onOpenItemTypeModal?.(); return; }
                formik.setFieldValue('itemType', value?.itemType || '');
                formik.setFieldValue('itemTypeId', value?.id || '');
              }}
              renderOption={(props, option) => (
                <Box component="li" {...addNewClass(props, option)}>{option.itemType}</Box>
              )}
              renderInput={(params) => (
                <TextField variant="outlined" {...params}
                  error={formik.touched.itemType && Boolean(formik.errors.itemType)}
                  helperText={formik.touched.itemType && formik.errors.itemType}
                />
              )}
            />
          </div>

          {/* Plant */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">Plant <span className="rfq-required-star">*</span></label>
            <Autocomplete size="small" className="w-100 f14" disabled={!action}
              options={[{ slDesc: 'ADD NEW', slCode: 'new' }, ...plantList]}
              value={plantList.find(o => o.slDesc === formik.values.plant) || { slDesc: formik.values.plant, slCode: '' }}
              getOptionLabel={(o) => o.slCode?.trim() && o.slCode !== 'new' ? `${o.slDesc} - ${o.slCode.trim()}` : o.slDesc}
              isOptionEqualToValue={(o, v) => o.slDesc === v?.slDesc}
              onOpen={() => { if (plantList.length === 0) onLoadPlantList?.(); }}
              onChange={(e, value) => {
                if (value?.slCode === 'new') { onOpenPlantModal?.(); return; }
                formik.setFieldValue('plant', value?.slCode?.trim() ? `${value.slDesc} - ${value.slCode.trim()}` : (value?.slDesc || ''));
              }}
              renderOption={(props, option) => (
                <Box component="li" {...addNewClass(props, option, 'slCode')}>
                  {option.slCode?.trim() && option.slCode !== 'new' ? `${option.slDesc} - ${option.slCode.trim()}` : option.slDesc}
                </Box>
              )}
              renderInput={(params) => (
                <TextField variant="outlined" {...params}
                  error={formik.touched.plant && Boolean(formik.errors.plant)}
                  helperText={formik.touched.plant && formik.errors.plant}
                />
              )}
            />
          </div>

          {/* Delivery Date */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">Delivery Date</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                value={formik.values.deliveryDate}
                disabled={!action}
                className="w-100 f14"
                slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                onChange={(v) => formik.setFieldValue('deliveryDate', v)}
              />
            </LocalizationProvider>
          </div>

          {/* Quantity */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">Quantity <span className="rfq-required-star">*</span></label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              id="quantity" name="quantity" type="number" disabled={!action}
              value={formik.values.quantity}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^[0-9]{1,8}(\.[0-9]{0,4})?$/.test(v)) formik.setFieldValue('quantity', v);
              }}
              error={formik.touched.quantity && Boolean(formik.errors.quantity)}
              helperText={formik.touched.quantity && formik.errors.quantity}
            />
          </div>

          {/* UOM */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">UOM <span className="rfq-required-star">*</span></label>
            <Autocomplete size="small" className="w-100 f14" disabled={!action}
              options={[{ uom: 'ADD NEW', id: 'new' }, ...uomList]}
              value={uomList.find(o => o.uom === formik.values.uom) || { uom: formik.values.uom }}
              getOptionLabel={(o) => o.uom ?? ''}
              isOptionEqualToValue={(o, v) => o.uom === v?.uom}
              onOpen={() => { if (uomList.length === 0) onLoadUomList?.(); }}
              onChange={(e, value) => {
                if (value?.id === 'new') { onOpenUomModal?.(); return; }
                formik.setFieldValue('uom', value?.uom || '');
              }}
              renderOption={(props, option) => (
                <Box component="li" {...addNewClass(props, option)}>{option.uom}</Box>
              )}
              renderInput={(params) => (
                <TextField variant="outlined" {...params}
                  error={formik.touched.uom && Boolean(formik.errors.uom)}
                  helperText={formik.touched.uom && formik.errors.uom}
                />
              )}
            />
          </div>

          {/* Target/Budget Price */}
          <div className="col-12 col-md-4 mb-3">
            <label className="pe-field-label">Target/Budget Price</label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              id="targetPrice" name="targetPrice" type="number" disabled={!action}
              value={formik.values.targetPrice}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^\d{0,10}(\.\d{0,4})?$/.test(v)) formik.setFieldValue('targetPrice', v);
              }}
            />
          </div>

          {/* Item Image */}
          <div className="col-6 col-md-4 mb-3">
            <label className="pe-field-label">Item Image</label>
            <TextField fullWidth variant="outlined" size="small" className="f14 pointer"
              value={formik.values.itemImage ? (typeof formik.values.itemImage === 'string' ? formik.values.itemImage.split('/').pop() : formik.values.itemImage.name) : ''}
              disabled
              InputProps={{
                endAdornment: (
                  <>
                    {!formik.values.itemImage ? (
                      <Tooltip title="Upload Image">
                        <InputAdornment position="end">
                          <IconButton onClick={() => document.getElementById('nfa-itemimagefile').click()} disabled={!action}>
                            <UploadOutlined />
                          </IconButton>
                        </InputAdornment>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Remove Image">
                        <InputAdornment position="end">
                          <IconButton onClick={() => formik.setFieldValue('itemImage', '')} disabled={!action}>
                            <HiOutlineX />
                          </IconButton>
                        </InputAdornment>
                      </Tooltip>
                    )}
                  </>
                ),
              }}
            />
          </div>

          {/* Item Attachment */}
          <div className="col-6 col-md-4 mb-3">
            <label className="pe-field-label">Item Attachment</label>
            <TextField fullWidth variant="outlined" size="small" className="f14"
              value={formik.values.itemFile ? (typeof formik.values.itemFile === 'string' ? formik.values.itemFile.split('/').pop() : formik.values.itemFile.name) : ''}
              disabled
              InputProps={{
                endAdornment: (
                  <>
                    {!formik.values.itemFile ? (
                      <Tooltip title="Upload Attachment">
                        <InputAdornment position="end">
                          <IconButton onClick={() => document.getElementById('nfa-itemattachmentfile').click()} disabled={!action}>
                            <UploadOutlined />
                          </IconButton>
                        </InputAdornment>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Remove Attachment">
                        <InputAdornment position="end">
                          <IconButton onClick={() => formik.setFieldValue('itemFile', '')} disabled={!action}>
                            <HiOutlineX />
                          </IconButton>
                        </InputAdornment>
                      </Tooltip>
                    )}
                  </>
                ),
              }}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default NFAAddProductCell;
