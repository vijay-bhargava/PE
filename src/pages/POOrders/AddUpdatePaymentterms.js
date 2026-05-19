import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import TextFieldCell from "../BaseCells/TextFieldCell";
import { LoadingButton } from "@mui/lab";
import "../../assets/css/base.css";
import { ApiClient } from "../../Apiclient";
import { HiPencilAlt } from "react-icons/hi";
import { useFormik } from "formik";
import * as yup from "yup";
import { actionTypes, useStateValue } from "../../store";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

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

  // ─── Validation ────────────────────────────────────────────────────────────
  const validationSchema = yup.object({
    termsOfPayment: yup.string().required("Please enter Terms of Payment"),
    paymentTerms: yup.string().required("Please enter Payment Terms"),
  });

  // ─── Formik ─────────────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: editRecordData?.id ? editRecordData.id : 0,
      termsOfPayment: editRecordData?.termsOfPayment
        ? editRecordData.termsOfPayment
        : termsOfPayment,
      paymentTerms: editRecordData?.paymentTerms
        ? editRecordData.paymentTerms
        : paymentTerms,
      isActive:
        editRecordData?.isActive !== undefined ? editRecordData.isActive : true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      if (editRecordData?.id > 0) {
        // ── UPDATE ──────────────────────────────────────────────────────────
        const data = {
          id: editRecordData.id,
          termsOfPayment: termsOfPayment,
          paymentTerms: paymentTerms,
          customerId: parseInt(customerid),
          isActive: isActive,
        };

        const res = await apiClient.postres(
          "/api/PaymentTerms/Update",
          data,
          atoken
        );

        if (res) {
          setLoading(false);
          pullPaymentTermsList();
          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          clearForm();
          toast.success("Payment Terms updated successfully!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
        } else {
          setLoading(false);
          toast.error("Failed to update Payment Terms.", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
        }
      } else {
        // ── ADD ─────────────────────────────────────────────────────────────
        const data = {
          id: 0,
          termsOfPayment: termsOfPayment,
          paymentTerms: paymentTerms,
          customerId: parseInt(customerid),
          isActive: isActive,
        };

        const res = await apiClient.postres(
          "/api/PaymentTerms/Add",
          data,
          atoken
        );

        if (res) {
          setLoading(false);
          pullPaymentTermsList();
          dispatch({ type: actionTypes.SET_MSGALERTTYPE, value: "success" });
          dispatch({
            type: actionTypes.SET_MSGALERTDATA,
            value: res?.data?.message,
          });
          dispatch({ type: actionTypes.SET_MSGALERT, value: true });
          clearForm();
          toast.success("Payment Terms added successfully!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
        } else {
          setLoading(false);
          toast.error("Failed to add Payment Terms.", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
        }
      }
    },
  });

  // ─── Fetch List ──────────────────────────────────────────────────────────────
  const pullPaymentTermsList = () => {
    setGridloading(true);
    apiClient
      .get(
        `/api/PaymentTerms/Find?CustomerId=${parseInt(customerid)}&IsActive=true`,
        atoken
      )
      .then((res) => {
        const list = res?.result ?? [];
        setPaymentTermsList(list);
        setGridloading(false);
        if (typeof handlePaymentTermsList === "function")
          handlePaymentTermsList(list);
      })
      .catch(() => {
        setGridloading(false);
      });
  };

  // ─── Edit callback from grid ─────────────────────────────────────────────────
  const callbackedit = useCallback((data) => {
    setTermsOfPayment(data.termsOfPayment);
    setPaymentTerms(data.paymentTerms);
    setIsActive(data.isActive);
    setEditRecordData(data);
  }, []);

  // ─── Clear form ──────────────────────────────────────────────────────────────
  const clearForm = () => {
    setEditRecordData(null);
    setTermsOfPayment("");
    setPaymentTerms("");
    setIsActive(true);
    formik.resetForm();
  };

  // ─── Grid columns ────────────────────────────────────────────────────────────
  const columns = [
    {
      field: "termsOfPayment",
      headerName: "Terms of Payment",
      width: 170,
    },
    {
      field: "paymentTerms",
      headerName: "Payment Terms",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (params.value ? "Active" : "InActive"),
    },
    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: (params) => (
        <IconButton
          size="small"
          className="bg-white"
          onClick={() => callbackedit(params?.row)}
        >
          <HiPencilAlt className="f17 text-primary" />
        </IconButton>
      ),
    },
  ];

  const getRowId = (row) => row.id;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="d-flex flex-row">
        <form onSubmit={formik.handleSubmit} autoComplete="off">
          <div className="row mt-4">
            {/* Terms of Payment */}
            <div className="col-12 col-md-12 mb-3">
              <TextFieldCell
                id="termsOfPayment"
                name="termsOfPayment"
                label="Terms of Payment*"
                placeholder=""
                value={termsOfPayment}
                maxLength={50}
                onChange={(e) => {
                  setTermsOfPayment(e.target.value);
                  formik.setFieldValue("termsOfPayment", e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <span style={{ fontSize: "0.75em", color: "#1976d2", whiteSpace: "nowrap" }}>
                        {termsOfPayment.length}/50
                      </span>
                    </InputAdornment>
                  ),
                }}
              />
              {formik.errors.termsOfPayment &&
                formik.touched.termsOfPayment && (
                  <div
                    className="error error-red"
                    style={{ fontSize: "9px" }}
                  >
                    {formik.errors.termsOfPayment}
                  </div>
                )}
            </div>

            {/* Payment Terms */}
            <div className="col-12 col-md-12 mb-3">
              <TextFieldCell
                id="paymentTerms"
                name="paymentTerms"
                label="Payment Terms*"
                placeholder=""
                value={paymentTerms}
                maxLength={500}
                onChange={(e) => {
                  setPaymentTerms(e.target.value);
                  formik.setFieldValue("paymentTerms", e.target.value);
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <span style={{ fontSize: "0.75em", color: "#1976d2", whiteSpace: "nowrap" }}>
                        {paymentTerms.length}/500
                      </span>
                    </InputAdornment>
                  ),
                }}
              />
              {formik.errors.paymentTerms && formik.touched.paymentTerms && (
                <div
                  className="error error-red"
                  style={{ fontSize: "9px" }}
                >
                  {formik.errors.paymentTerms}
                </div>
              )}
            </div>

            {/* Active checkbox */}
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isActive"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="col-12 text-end">
              {!loading ? (
                <>
                  <Button
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={clearForm}
                  >
                    Reset
                  </Button>
                  <span style={{ margin: "0 5px" }}></span>
                  <Button
                    color="success"
                    variant="outlined"
                    size="small"
                    type="submit"
                  >
                    Submit
                  </Button>
                </>
              ) : (
                <LoadingButton loading variant="contained">
                  Submit ...
                </LoadingButton>
              )}
            </div>
          </div>
        </form>

        {/* Grid */}
        <div className="col-12 col-md-8 col-lg-8 p-0 ms-4 border-start">
          <div className="d-flex flex-column min-vh-50">
            <div className="flex-grow-1 p-2">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-12 mb-3" style={{ height: "55vh" }}>
                    <DataGrid
                      getRowId={getRowId}
                      rows={paymentTermsList}
                      loading={gridloading}
                      columns={columns}
                      rowHeight={40}
                      columnHeaderHeight={40}
                      className="f13 border-0"
                      disableRowSelectionOnClick
                      slots={{ toolbar: GridToolbar }}
                      slotProps={{
                        toolbar: { showQuickFilter: true },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUpdatePaymentterms;
