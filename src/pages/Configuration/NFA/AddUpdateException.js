import React, { useState, useEffect, useCallback } from "react";
import {
  Autocomplete, Box, FormControl, MenuItem, Select, TextField,
  InputAdornment, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue } from "../../../store";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../../utils/common";
import { ApiClient } from "../../../Apiclient";
import { getPurchaseOrgList, OrgGroupMasterList } from "../../../utils/commerciallibrary";
import MasterFormPanel, { MfpEditBtn } from "../../../components/MasterFormPanel/MasterFormPanel";
import PEModal from "../../../components/PEModal";
import PurchaseOrg from "../../../utils/common/PurchaseOrg";
import PurchaseOrgGrp from "../../../utils/common/PurchaseOrgGrp";

const addNewClass = (props, isNew) => ({
  ...props,
  className: (props.className || '') + (isNew ? ' dropdown-add-new' : ''),
});

const AddUpdateexception = ({ handleExceptionList, isModal = false }) => {
  const [{ atoken, customerid, customersuffix }] = useStateValue();
  const apiClient = new ApiClient(customersuffix);

  const [exceptionList, setExceptionList] = useState([]);
  const [editRecordData, setEditRecordData] = useState(null);
  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [gridloading, setGridloading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [purchaseOrgModal, setPurchaseOrgModal] = useState(false);
  const [purchaseOrgGrpModal, setPurchaseOrgGrpModal] = useState(false);

  const validationSchema = yup.object({
    exception: yup.string().required("Please enter exception"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id || 0,
      exception: editRecordData?.exception || "",
      purchOrgId: null,
      purchGrpId: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const trimmed = values.exception?.trim();
      if (!trimmed) { toast.error("Exception value is required"); return; }
      setLoading(true);
      try {
        const data = {
          id: editRecordData?.id || 0,
          customerId: customerid,
          exception: trimmed,
          purchOrgId: values.purchOrgId?.id || 0,
          purchGrpId: values.purchGrpId?.id || 0,
          isActive,
        };
        const endpoint = editRecordData?.id > 0 ? '/api/NFACondition/Update' : '/api/NFACondition/Add';
        const res = await apiClient.post(endpoint, data, atoken);
        if (res) {
          toast.success(editRecordData?.id > 0 ? "Exception updated successfully!" : "Exception added successfully!", { toastId: "ExceptionSave" });
          await pullExceptionList();
          clearForm();
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error), { toastId: "exception_error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const clearForm = () => {
    setEditRecordData(null);
    setIsActive(true);
    setPurchaseGroupAllList([]);
    formik.resetForm();
  };

  const pullExceptionList = async () => {
    try {
      const res = await apiClient.get(`/api/NFACondition/Find?CustomerId=${customerid}`, atoken);
      if (res) {
        setExceptionList(res?.result ?? []);
        if (typeof handleExceptionList === 'function') handleExceptionList(res?.result ?? []);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error), { toastId: "exception_fetch_error" });
    } finally {
      setGridloading(false);
    }
  };

  const pullPurchaseOrgAll = useCallback(() => {
    getPurchaseOrgList({ CustomerId: customerid, IsActive: "true" }, atoken).then((resp) => {
      setPurchaseAllList(resp ?? []);
    });
  }, [customerid, atoken]);

  const pullPurchaseGroupAll = useCallback((orgMstId) => {
    if (!orgMstId) return;
    OrgGroupMasterList({ CustomerId: customerid, OrgMstId: Number(orgMstId) }, atoken).then((res) => {
      if (res) setPurchaseGroupAllList(res);
    });
  }, [customerid, atoken]);

  useEffect(() => {
    pullExceptionList();
    pullPurchaseOrgAll();
  }, []);

  useEffect(() => {
    if (editRecordData && purchaseAllList.length > 0) {
      setIsActive(editRecordData?.isActive ?? true);
      const selectedOrg = purchaseAllList.find(o => o.id === editRecordData.purchOrgId);
      if (selectedOrg) {
        formik.setFieldValue("purchOrgId", selectedOrg);
        pullPurchaseGroupAll(selectedOrg.id);
      }
    }
  }, [editRecordData, purchaseAllList]);

  useEffect(() => {
    if (purchaseGroupAllList.length > 0 && editRecordData?.purchGrpId > 0) {
      const selectedGrp = purchaseGroupAllList.find(o => o.id === editRecordData.purchGrpId);
      if (selectedGrp) formik.setFieldValue("purchGrpId", selectedGrp);
    }
  }, [purchaseGroupAllList]);

  const callbackedit = useCallback((data) => {
    clearForm();
    setEditRecordData(data);
  }, []);

  const columns = [
    { field: "exception", headerName: "Exception", flex: 2, minWidth: 140 },
    {
      field: "isActive", headerName: "Status", flex: 1, minWidth: 100,
      renderCell: (params) => (
        <span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "action", headerName: "Action", width: 80, sortable: false,
      renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params?.row)} />,
    },
  ];

  return (
    <div
      className={`bg-white rounded-default w-100 d-flex flex-column`}
      style={!isModal ? { height: "90vh" } : { height: "100%" }}
    >
      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="Exception"
          isModal={true}
          onReset={clearForm}
          onSubmit={formik.handleSubmit}
          loading={loading}
          columns={columns}
          rows={exceptionList}
          gridLoading={gridloading}
          getRowId={(row) => row.id}
        >
          {/* Exception Name */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">Exception <span className="rfq-required-star">*</span></label>
            <TextField
              id="exception" name="exception" variant="outlined" size="small" fullWidth
              placeholder="Enter exception name"
              value={formik.values.exception}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ maxLength: 50 }}
              InputProps={{
                endAdornment: formik.values.exception ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">{formik.values.exception.length}/50</Typography>
                  </InputAdornment>
                ) : null,
              }}
              error={formik.touched.exception && Boolean(formik.errors.exception)}
              helperText={formik.touched.exception && formik.errors.exception}
            />
          </div>

          {/* Purchase Org */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">Purchase Org</label>
            <Autocomplete
              id="purchOrgId" size="small"
              options={[{ id: 'new', orgName: 'ADD NEW' }, ...purchaseAllList]}
              value={formik.values.purchOrgId || null}
              getOptionLabel={(o) => o?.orgName ?? ''}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              onChange={(e, value) => {
                if (value?.id === 'new') { setPurchaseOrgModal(true); return; }
                formik.setFieldValue('purchOrgId', value);
                formik.setFieldValue('purchGrpId', null);
                setPurchaseGroupAllList([]);
                if (value?.id) pullPurchaseGroupAll(value.id);
              }}
              renderOption={(props, option) => (
                <Box component="li" {...addNewClass(props, option.id === 'new')}>{option.orgName}</Box>
              )}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select purchase org" />}
            />
          </div>

          {/* Purchase Group */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label">Purchase Group</label>
            <Autocomplete
              id="purchGrpId" size="small"
              options={purchaseGroupAllList.length > 0 ? [{ id: 'new', groupName: 'ADD NEW' }, ...purchaseGroupAllList] : []}
              value={formik.values.purchGrpId || null}
              getOptionLabel={(o) => o?.groupName ?? ''}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              onChange={(e, value) => {
                if (value?.id === 'new') { setPurchaseOrgGrpModal(true); return; }
                formik.setFieldValue('purchGrpId', value);
              }}
              renderOption={(props, option) => (
                <Box component="li" {...addNewClass(props, option.id === 'new')}>{option.groupName}</Box>
              )}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select purchase group" />}
            />
          </div>

          {/* Status */}
          <div className="mfp-field mfp-field--sm">
            <label className="pe-field-label">Status</label>
            <FormControl fullWidth size="small">
              <Select variant="outlined" size="small" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </MasterFormPanel>
      </div>

      <PEModal open={purchaseOrgModal} onClose={() => setPurchaseOrgModal(false)} size="lg" title="Add Purchase Organization">
        <div className="p-3">
          <PurchaseOrg isModal handlepurchaseorgList={(list) => setPurchaseAllList(list ?? [])} />
        </div>
      </PEModal>

      <PEModal open={purchaseOrgGrpModal} onClose={() => setPurchaseOrgGrpModal(false)} size="lg" title="Add Purchase Group">
        <div className="p-3">
          <PurchaseOrgGrp isModal />
        </div>
      </PEModal>
    </div>
  );
};

export default AddUpdateexception;
