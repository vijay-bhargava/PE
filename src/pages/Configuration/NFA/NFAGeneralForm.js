import React from 'react';
import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import TextFieldCell from '../../BaseCells/TextFieldCell';

const addNewClass = (props, isNew) => ({
  ...props,
  className: (props.className || '') + (isNew ? ' dropdown-add-new' : ''),
});

const NFAGeneralForm = ({
  formik,
  canEdit,
  canCreate,
  eventTypes,
  eventDetailsList,
  purchaseAllList,
  purchaseGroupAllList,
  nfaSpendList,
  nfaCategoryList,
  nfaProject,
  exception,
  handleModalToggle,
  handleOpenSpendModal,
  handleOpenProjectModal,
  handleOpenExceptionModal,
  setEventDetailsList,
  setTempnfaEventId,
  setPurchaseGroupAllList,
}) => (
  <div style={{ padding: '16px' }}>
    <form onSubmit={formik.handleSubmit} autoComplete="off">
      <div className="row mt-2">

        {/* Event Type & Details */}
        <div className="col-12 col-md-6 col-lg-6 mb-3">
          <label className="pe-field-label">Event Type</label>
          <Autocomplete
            id="nfaEventType"
            size="small"
            options={[...eventTypes]}
            value={formik?.values?.nfaEventType}
            getOptionLabel={(o) => o?.eventType ?? ''}
            disabled={!canEdit}
            onChange={(e, value) => {
              formik.setFieldValue('nfaEventType', value);
              formik.setFieldValue('nfaEventId', null);
              setEventDetailsList([]);
              setTempnfaEventId(0);
            }}
            renderOption={(props, option) => <Box component="li" {...props}>{option?.eventType}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select event type" />}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6 mb-3">
          <label className="pe-field-label">Event Details</label>
          <Autocomplete
            id="nfaEventId"
            size="small"
            options={[...eventDetailsList]}
            value={formik?.values?.nfaEventId}
            getOptionLabel={(o) => o?.subject ?? ''}
            disabled={!canEdit}
            onChange={(e, value) => formik.setFieldValue('nfaEventId', value)}
            renderOption={(props, option) => <Box component="li" {...props}>{option?.subject}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select event" />}
          />
        </div>

        {/* Subject */}
        <div className="col-12 mb-3">
          <label className="pe-field-label">NFA Subject <span className="rfq-required-star">*</span></label>
          <TextFieldCell
            id="nfaSubject"
            name="nfaSubject"
            placeholder=""
            maxLength={100}
            disabled={!canEdit}
            InputProps={{
              endAdornment:
                <InputAdornment position="end">
                  <Typography variant="body2" color="textSecondary">{formik?.values?.nfaSubject?.length || 0}/100</Typography>
                </InputAdornment>
            }}
            value={formik?.values?.nfaSubject} onChange={(e) => formik.setFieldValue('nfaSubject', e.target.value)}
            error={formik.touched.nfaSubject && Boolean(formik.errors.nfaSubject)}
            helperText={formik.touched.nfaSubject && formik.errors.nfaSubject}
          />
        </div>

        {/* Description */}
        <div className="col-12 mb-3">
          <label className="pe-field-label">NFA Description <span className="rfq-required-star">*</span></label>
          <div className={`rfq-dv2-quill-field${formik.touched.nfaDescription && formik.errors.nfaDescription ? ' rfq-dv2-quill-error' : ''}`}>
            <ReactQuill
              theme="snow"
              value={formik.values.nfaDescription || ''}
              readOnly={!canEdit}
              placeholder="Enter NFA description..."
              style={{ backgroundColor: !canEdit ? '#f5f5f5' : 'white' }}
              onChange={(content) => {
                formik.setFieldValue('nfaDescription', content);
                if (!formik.touched.nfaDescription) formik.setFieldTouched('nfaDescription', true);
              }}
            />
          </div>
          {formik.touched.nfaDescription && formik.errors.nfaDescription && <span className="rfq-field-error">{formik.errors.nfaDescription}</span>}
        </div>

        {/* Purchase Org, Group & Type of Spend */}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="pe-field-label">Purchase Org</label>
          <Autocomplete id="purchOrgId" size="small"
            options={[{ id: 'new', orgName: 'ADD NEW' }, ...purchaseAllList]}
            value={formik?.values?.purchOrgId}
            getOptionLabel={(o) => o?.orgName ?? ''}
            disabled={!canEdit}
            onChange={(e, value) => {
              if (value?.id === 'new') {
                if (!canCreate) {
                  toast.error("You don't have permission to create new purchase organizations");
                  return;
                }
                handleModalToggle('purchaseOrg', true);
                formik.setFieldValue('purchGrpId', null);
                return;
              }
              formik.setFieldValue('purchOrgId', value);
              formik.setFieldValue('purchGrpId', null);
              setPurchaseGroupAllList([]);
            }}
            renderOption={(props, option) => <Box component="li" {...addNewClass(props, option.id === 'new')}>{option?.orgName}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select purchase org" />}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="pe-field-label">Purchase Group</label>
          <Autocomplete id="purchGrpId"
            size="small"
            options={[{ id: 'new', groupName: 'ADD NEW' }, ...purchaseGroupAllList]}
            value={formik?.values?.purchGrpId}
            getOptionLabel={(o) => o?.groupName ?? ''}
            disabled={!canEdit}
            onChange={(e, value) => {
              if (value?.id === 'new') {
                if (!canCreate) {
                  toast.error("You don't have permission to create new purchase groups");
                  return;
                } handleModalToggle('purchaseOrgGrp', true);
                return;
              }
              formik.setFieldValue('purchGrpId', value);
            }}
            renderOption={(props, option) => <Box component="li" {...addNewClass(props, option.id === 'new')}>{option?.groupName}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select purchase group" />}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="pe-field-label">Type of Spend</label>
          <Autocomplete id="spendId" size="small"
            options={[{ id: 'new', spend: 'ADD NEW' }, ...nfaSpendList]}
            value={formik?.values?.spendId}
            getOptionLabel={(o) => o?.spend ?? ''} disabled={!canEdit}
            onChange={(e, newValue) => {
              if (newValue?.id === 'new') {
                if (!canCreate) {
                  toast.error("You don't have permission to create new spend types");
                  return;
                }
                handleOpenSpendModal();
              } else { formik.setFieldValue('spendId', newValue); }
            }}
            renderOption={(props, option) => <Box component="li" {...addNewClass(props, option.id === 'new')}>{option?.spend}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select spend type" />}
          />
        </div>

        {/* Category, Project & Exception */}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="pe-field-label">Category</label>
          <Autocomplete
            id="categoryId"
            size="small"
            options={[{ id: 'new', categoryName: 'ADD NEW' }, ...nfaCategoryList]}
            value={formik?.values?.categoryId}
            getOptionLabel={(o) => o?.categoryName ?? ''}
            disabled={!canEdit}
            onChange={(e, value) => formik.setFieldValue('categoryId', value)}
            renderOption={(props, option) => <Box component="li" {...props}>{option?.categoryName}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select category" />}
          />
        </div>
        {formik?.values?.categoryId?.id === 2 && (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="pe-field-label">Project Name</label>
            <TextFieldCell
              id="projectName"
              name="projectName"
              placeholder=""
              maxLength={100}
              disabled={!canEdit}
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary">{formik?.values?.projectName?.length || 0}/100</Typography>
                  </InputAdornment>
              }}
              value={formik?.values?.projectName}
              onChange={(e) => formik.setFieldValue('projectName', e.target.value)}
            />
          </div>
        )}
        {formik?.values?.categoryId?.id === 1 && (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="pe-field-label">Project Name</label>
            <Autocomplete id="projectId" size="small"
              options={[{ id: 'new', project: 'ADD NEW' }, ...nfaProject,]}
              value={formik?.values?.projectId}
              getOptionLabel={(o) => o?.project ?? ''}
              disabled={!canEdit}
              onChange={(e, newValue) => {
                if (newValue?.id === 'new') {
                  if (!canCreate) {
                    toast.error("You don't have permission to create new projects");
                    return;
                  }
                  handleOpenProjectModal();
                } else { formik.setFieldValue('projectId', newValue); }
              }}
              renderOption={(props, option) => <Box component="li" {...addNewClass(props, option.id === 'new')}>{option?.project}</Box>}
              renderInput={(params) => <TextField {...params}
                variant="outlined"
                placeholder="Select project" />
              }
            />
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="pe-field-label">Exception</label>
          <Autocomplete id="exceptionId" size="small"
            options={[{ id: 'new', exception: 'ADD NEW' }, ...exception]}
            value={formik?.values?.exceptionId}
            getOptionLabel={(o) => o?.exception ?? ''}
            disabled={!canEdit}
            onChange={(e, newValue) => {
              if (newValue?.id === 'new') {
                if (!canCreate) {
                  toast.error("You don't have permission to create new exceptions");
                  return;
                }
                handleOpenExceptionModal();
              } else { formik.setFieldValue('exceptionId', newValue); }
            }}
            renderOption={(props, option) => <Box component="li" {...addNewClass(props, option.id === 'new')}>{option?.exception}</Box>}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select exception" />}
          />
        </div>

        {/* Remarks */}
        <div className="col-12 mb-3">
          <label className="pe-field-label">Remarks</label>
          <div className={`rfq-dv2-quill-field${formik.touched.remarks && formik.errors.remarks ? ' rfq-dv2-quill-error' : ''}`}>
            <ReactQuill theme="snow"
              value={formik.values.remarks || ''}
              readOnly={!canEdit}
              placeholder="Enter remarks..."
              style={{ backgroundColor: !canEdit ? '#f5f5f5' : 'white' }}
              onChange={(content) => {
                formik.setFieldValue('remarks', content);
                if (!formik.touched.remarks) formik.setFieldTouched('remarks', true);
              }}
            />
          </div>
          {formik.touched.remarks && formik.errors.remarks && <span className="rfq-field-error">{formik.errors.remarks}</span>}
        </div>
      </div>
    </form>
  </div>
);

export default NFAGeneralForm;
