import React from 'react';
import {
  Alert, Autocomplete, Box, Checkbox, FormControlLabel,
  FormGroup, InputAdornment, TextField, Typography,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import TextFieldCell from '../../BaseCells/TextFieldCell';
import { extractTextFromHTML } from '../../../utils/common/utility';

const PRGeneralTab = ({
  canRead,
  canEdit,
  formik,
  loadRequisitioner,
  requisitionerList,
  purchaseAllList,
  purchaseGroupAllList,
  setPurchaseGroupAllList,
  userDetail,
  handleRequisitionerChange,
  PullUserDesignation,
  setPurchaseOrgModal,
  setPurchaseOrgGrpModal,
  setOrgGroupId,
}) => {
  if (!canRead) {
    return (
      <div className="p-3">
        <Alert severity="warning">You don't have permission to view General data.</Alert>
      </div>
    );
  }

  const orgOptions = (() => {
    if (userDetail?.roleId !== 1 && userDetail?.purchOrgId) {
      const userOrg = (purchaseAllList || []).find(o => o.id === userDetail.purchOrgId);
      return userOrg ? [userOrg] : [];
    }
    return [{ id: 'new', orgName: 'ADD NEW' }, ...(purchaseAllList || [])];
  })();

  return (
    <div>
      <form id="pr-general-form" onSubmit={formik.handleSubmit} autoComplete="off">
        <div className="row">

          {/* PR Subject */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">PR Subject <span className="rfq-required-star">*</span></label>
            <TextFieldCell
              id="prSubject"
              name="prSubject"
              placeholder=""
              maxLength={100}
              disabled={!canEdit}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary" style={{ fontSize: 11 }}>
                      {formik?.values?.prSubject?.length || 0}/100
                    </Typography>
                  </InputAdornment>
                ),
              }}
              value={formik?.values?.prSubject || ''}
              onChange={(e) => formik.setFieldValue('prSubject', e.target.value)}
              error={formik.touched.prSubject && Boolean(formik.errors.prSubject)}
              helperText={formik.touched.prSubject && formik.errors.prSubject}
            />
          </div>

          {/* PR Number */}
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="pe-field-label">PR Number</label>
            <TextFieldCell
              id="prNumber"
              name="prNumber"
              placeholder=""
              maxLength={20}
              disabled={!canEdit}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="textSecondary" style={{ fontSize: 11 }}>
                      {formik?.values?.prNumber?.length || 0}/20
                    </Typography>
                  </InputAdornment>
                ),
              }}
              value={formik.values?.prNumber || ''}
              onChange={(e) => formik.setFieldValue('prNumber', e.target.value)}
              error={formik.touched?.prNumber && Boolean(formik.errors?.prNumber)}
              helperText={formik.touched?.prNumber && formik.errors?.prNumber}
            />
          </div>

          {/* PR Description */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">
              PR Description <span className="rfq-required-star">*</span>
            </label>
            <div className={`rfq-dv2-quill-field${formik.touched?.prDescription && formik.errors?.prDescription ? ' rfq-dv2-quill-error' : ''}`}>
              <ReactQuill
                theme="snow"
                preserveWhitespace
                readOnly={!canEdit}
                value={formik.values.prDescription || ''}
                onChange={(val) => {
                  const text = extractTextFromHTML(val);
                  if (text.length <= 2000) {
                    formik.setFieldValue('prDescription', val);
                  } else {
                    toast.error('Description greater than 2000 characters is not allowed', { toastId: 'descerr' });
                  }
                }}
                style={{ backgroundColor: !canEdit ? '#f5f5f5' : 'white' }}
              />
            </div>
            {formik.values.prDescription !== undefined && (
              <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'end', marginTop: 2 }}>
                {extractTextFromHTML(formik.values.prDescription).length}/2000
              </div>
            )}
            {formik.touched?.prDescription && Boolean(formik.errors?.prDescription) && (
              <span className="rfq-field-error">{formik.errors.prDescription}</span>
            )}
          </div>

          {/* Requisitioner */}
          <div className="col-12 col-md-4 col-lg-4 mb-3">
            <label className="pe-field-label">Requisitioner</label>
            <Autocomplete
              id="requisitioner"
              size="small"
              loading={loadRequisitioner}
              options={requisitionerList ? requisitionerList.map(i => i.name) : []}
              getOptionLabel={(o) => o}
              value={formik.values.requisitioner || ''}
              disabled={!canEdit}
              onChange={(e, val) => handleRequisitionerChange(val)}
              onOpen={PullUserDesignation}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  error={formik.touched.requisitioner && Boolean(formik.errors.requisitioner)}
                  helperText={formik.touched.requisitioner && formik.errors.requisitioner}
                />
              )}
            />
          </div>

          {/* Purchase Org */}
          <div className="col-12 col-md-4 col-lg-4 mb-3">
            <label className="pe-field-label">Purchase Org</label>
            <Autocomplete
              id="purchOrgId"
              size="small"
              options={orgOptions}
              value={formik.values.purchOrgId || null}
              disabled={!canEdit}
              getOptionLabel={(o) => o.orgName ?? ''}
              onChange={(e, val) => {
                if (val?.id === 'new') {
                  setPurchaseOrgModal(true);
                  formik.setFieldValue('purchGrpId', null);
                  return;
                }
                formik.setFieldValue('purchOrgId', val ?? null);
                formik.setFieldValue('purchGrpId', null);
                if (!val) setPurchaseGroupAllList([]);
                setOrgGroupId(val?.id || 0);
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} className={(props.className || '') + (option.id === 'new' ? ' dropdown-add-new' : '')}>
                  {option.orgName}
                </Box>
              )}
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
          </div>

          {/* Purchase Group */}
          <div className="col-12 col-md-4 col-lg-4 mb-3">
            <label className="pe-field-label">Purchase Group</label>
            <Autocomplete
              id="purchGrpId"
              size="small"
              options={[{ id: 'new', groupName: 'ADD NEW' }, ...(purchaseGroupAllList || [])]}
              getOptionLabel={(o) => o?.groupName ?? ''}
              value={formik.values?.purchGrpId || null}
              disabled={!canEdit}
              onChange={(e, val) => {
                if (val?.id === 'new') { setPurchaseOrgGrpModal(true); return; }
                formik.setFieldValue('purchGrpId', val ?? null);
                setOrgGroupId(val?.id || 0);
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} className={(props.className || '') + (option.id === 'new' ? ' dropdown-add-new' : '')}>
                  {option.groupName}
                </Box>
              )}
              renderInput={(params) => <TextField {...params} variant="outlined" />}
            />
          </div>

          {/* BOQ */}
          <div className="col-12 col-md-4 col-lg-4 mb-3 d-flex align-items-end">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.isBoq === true}
                    disabled={!canEdit}
                    onChange={(e) => formik.setFieldValue('isBoq', e.target.checked)}
                  />
                }
                label={<span className="f14" style={{ color: '#374151' }}>BOQ</span>}
              />
            </FormGroup>
          </div>

        </div>
      </form>
    </div>
  );
};

export default PRGeneralTab;
