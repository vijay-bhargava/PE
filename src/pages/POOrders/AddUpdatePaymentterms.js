import React, { useState, useEffect, useCallback } from "react";
import {
  FormControl, InputAdornment, MenuItem,
  Select, TextField, Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../store";
import { toast } from "react-toastify";
import { ApiClient } from "../../Apiclient";
import MasterFormPanel, { MfpEditBtn } from "../../components/MasterFormPanel/MasterFormPanel";

const AddUpdatePaymentterms = ({ handlePaymentTermsList }) => {
  const [{ atoken, customerid, customersuffix }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);

  const [termsOfPayment, setTermsOfPayment] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editRecordData, setEditRecordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridloading, setGridloading] = useState(true);
  const [paymentTermsList, setPaymentTermsList] = useState([]);

  useEffect(() => {
    pullPaymentTermsList();
  }, []);

  const validationSchema = yup.object({
    termsOfPayment: yup.string().required("Please enter Terms of Payment"),
    paymentTerms: yup.string().required("Please enter Payment Terms"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id ?? 0,
      termsOfPayment: editRecordData?.termsOfPayment ?? termsOfPayment,
      paymentTerms: editRecordData?.paymentTerms ?? paymentTerms,
      isActive: editRecordData?.isActive !== undefined ? editRecordData.isActive : true,
    },
    validationSchema,
    onSubmit: async () => {
      if (!termsOfPayment) { toast.error("Please enter Terms of Payment.", { toastId: "top-req" }); return; }
      if (!paymentTerms) { toast.error("Please enter Payment Terms.", { toastId: "pt-req" }); return; }

      setLoading(true);
      const data = {
        id: editRecordData?.id ?? 0,
        termsOfPayment,
        paymentTerms,
        customerId: parseInt(customerid),
        isActive,
      };
      const endpoint = editRecordData?.id > 0 ? "/api/PaymentTerms/Update" : "/api/PaymentTerms/Add";
      const res = await apiClient.postres(endpoint, data, atoken);
      if (res) {
        setLoading(false);
        pullPaymentTermsList();
        dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
        dispatch({ type: actionTypes.SET_MSGALERTDATA, value: res?.data?.message });
        dispatch({ type: actionTypes.SET_MSGALERT, value: true });
        resetForm();
        toast.success(editRecordData?.id > 0 ? "Payment Terms updated successfully!" : "Payment Terms added successfully!");
      } else {
        setLoading(false);
        toast.error("Failed to save Payment Terms.");
      }
    },
  });

  const pullPaymentTermsList = () => {
    setGridloading(true);
    apiClient
      .get(`/api/PaymentTerms/Find?CustomerId=${parseInt(customerid)}&IsActive=true`, atoken)
      .then((res) => {
        const list = res?.result ?? [];
        setPaymentTermsList(list);
        setGridloading(false);
        if (typeof handlePaymentTermsList === "function") handlePaymentTermsList(list);
      })
      .catch(() => setGridloading(false));
  };

  const callbackedit = useCallback((data) => {
    setTermsOfPayment(data.termsOfPayment);
    setPaymentTerms(data.paymentTerms);
    setIsActive(data.isActive);
    setEditRecordData(data);
  }, []);

  const resetForm = () => {
    setTermsOfPayment("");
    setPaymentTerms("");
    setIsActive(true);
    setEditRecordData(null);
    formik.resetForm();
  };

  const columns = [
    { field: "termsOfPayment", headerName: "Terms of Payment", flex: 1, minWidth: 130 },
    { field: "paymentTerms", headerName: "Payment Terms", flex: 2, minWidth: 180 },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className={`badge-status ${params.value ? "badge-active" : "badge-inactive"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => <MfpEditBtn onClick={() => callbackedit(params?.row)} />,
    },
  ];

  return (
    <div className="bg-white rounded-default w-100 d-flex flex-column p-0" style={{ height: "100%" }}>
      <div className="flex-grow-1" style={{ minHeight: 0 }}>
        <MasterFormPanel
          title="Payment Terms"
          isModal={true}
          onReset={resetForm}
          onSubmit={formik.handleSubmit}
          loading={loading}
          columns={columns}
          rows={paymentTermsList}
          gridLoading={gridloading}
          getRowId={(row) => row.id}
        >
          {/* Terms of Payment */}
          <div className="mfp-field mfp-field--md">
            <label className="pe-field-label"> Terms of Payment <span className="rfq-required-star">*</span></label>
            <TextField
              id="termsOfPayment"
              name="termsOfPayment"
              variant="outlined"
              size="small"
              fullWidth
              placeholder="e.g. Z040"
              label={null}
              value={termsOfPayment}
              onChange={(e) => {
                setTermsOfPayment(e.target.value);
                formik.setFieldValue("termsOfPayment", e.target.value);
              }}
              inputProps={{ maxLength: 50 }}
              InputProps={{
                endAdornment: termsOfPayment ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {termsOfPayment.length}/50
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
            {formik.errors.termsOfPayment && formik.touched.termsOfPayment && (
              <div className="error error-red" style={{ fontSize: "9px" }}>
                {formik.errors.termsOfPayment}
              </div>
            )}
          </div>

          {/* Payment Terms */}
          <div className="mfp-field mfp-field--lg">
            <label className="pe-field-label"> Payment Terms <span className="rfq-required-star">*</span></label>
            <TextField
              id="paymentTerms"
              name="paymentTerms"
              variant="outlined"
              size="small"
              fullWidth
              placeholder="e.g. 90% Agt. receipt of material within 30 days..."
              label={null}
              value={paymentTerms}
              onChange={(e) => {
                setPaymentTerms(e.target.value);
                formik.setFieldValue("paymentTerms", e.target.value);
              }}
              inputProps={{ maxLength: 500 }}
              InputProps={{
                endAdornment: paymentTerms ? (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="textSecondary">
                      {paymentTerms.length}/500
                    </Typography>
                  </InputAdornment>
                ) : null,
              }}
            />
            {formik.errors.paymentTerms && formik.touched.paymentTerms && (
              <div className="error error-red" style={{ fontSize: "9px" }}>
                {formik.errors.paymentTerms}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mfp-field mfp-field--sm">
            <label className="pe-field-label">Status</label>
            <FormControl fullWidth size="small">
              <Select
                variant="outlined"
                size="small"
                value={isActive}
                onChange={(e) => setIsActive(e.target.value)}
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </MasterFormPanel>
      </div>
    </div>
  );
};

export default AddUpdatePaymentterms;
