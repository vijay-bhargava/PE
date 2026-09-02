import React, { useRef, useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { FormControl, MenuItem, Select, TextField } from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useCookies } from "react-cookie";
import { GetPOHeaderList } from "../../utils/pOToAccept";
import { useStateValue } from "../../store";
import { getEventStage } from "../../utils/common/utility";

const FilterCell = ({ handleFilterList, clearFilterList, setExportFilters }) => {
  const formRef = useRef();
  const [cookies] = useCookies(["patkn", "prtkn"]);
  const [{ atoken, customerid }] = useStateValue();

  const [poStatusList, setPoStatusList] = useState([]);
  const [invoiceStatusList, setInvoiceStatusList] = useState([]);
  const [poStatusLoaded, setPoStatusLoaded] = useState(false);
  const [invoiceStatusLoaded, setInvoiceStatusLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      POId: '',
      ItemNo: '',
      ItemName: '',
      ItemType: '',
      POStatus: '',
      InvoiceStatus: '',
      CreatedDate: null,
      InvoiceNo: ''
    },
    validationSchema: yup.object({}),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const queryParams = {};
        if (values.POStatus) queryParams.POStage = values.POStatus;
        if (values.POId) queryParams.POId = values.POId;
        if (values.ItemNo) queryParams.ItemNo = values.ItemNo;
        if (values.ItemName) queryParams.ItemName = values.ItemName;
        if (values.ItemType) queryParams.ItemType = values.ItemType;
        if (values.InvoiceNo) queryParams.InvoiceNo = values.InvoiceNo;
        if (values.InvoiceStatus) queryParams.InvoiceStage = values.InvoiceStatus;
        if (values.CreatedDate) queryParams.CreatedDate = values.CreatedDate.toISOString();

        const res = await GetPOHeaderList(queryParams, atoken);

        const exportPayload = {
          poId: values.POId || "",
          itemNo: values.ItemNo || "",
          itemName: values.ItemName || "",
          itemType: values.ItemType || "",
          poStage: values.POStatus || "",
          invoiceStage: values.InvoiceStatus || "",
          invoiceNo: values.InvoiceNo || "",
          createdDate: values.CreatedDate ? values.CreatedDate.toISOString() : ""
        };

        setExportFilters(exportPayload);
        handleFilterList(res || [], exportPayload);
      } catch (err) {
        console.error("Error fetching PO list:", err);
        handleFilterList([]);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleResetClick = () => {
    formik.resetForm();
    clearFilterList();
  };

  const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
    try {
      const res = await getEventStage({ CustomerId: customerid, IsActive: true, EventType: EventTypeId }, atoken);
      setList(res || []);
    } catch (err) {
      console.error("Error fetching event stage:", err);
      setList([]);
    } finally {
      setLoaded(true);
    }
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      ref={formRef}
      autoComplete="off"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Scrollable fields area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '8px' }}>
        <div className="row">

          {/* PO ID */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">PO ID</label>
            <TextField
              id="POId"
              name="POId"
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Enter PO ID"
              value={formik.values.POId}
              onChange={formik.handleChange}
            />
          </div>

          {/* Item No */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">Item No</label>
            <TextField
              id="ItemNo"
              name="ItemNo"
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Enter Item No"
              value={formik.values.ItemNo}
              onChange={formik.handleChange}
            />
          </div>

          {/* Item Name */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">Item Name</label>
            <TextField
              id="ItemName"
              name="ItemName"
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Enter Item Name"
              value={formik.values.ItemName}
              onChange={formik.handleChange}
            />
          </div>

          {/* Item Type */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">Item Type</label>
            <FormControl fullWidth size="small">
              <Select
                id="ItemType"
                name="ItemType"
                displayEmpty
                value={formik.values.ItemType}
                onChange={formik.handleChange}
              >
                <MenuItem value=""><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Select Item Type</em></MenuItem>
                <MenuItem value="Material">Material</MenuItem>
                <MenuItem value="Service">Service</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* PO Status */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">PO Status</label>
            <FormControl fullWidth size="small">
              <Select
                id="POStatus"
                name="POStatus"
                displayEmpty
                value={formik.values.POStatus}
                onChange={formik.handleChange}
                onOpen={() => {
                  if (!poStatusLoaded) pullGetEventStage("PO", setPoStatusList, setPoStatusLoaded);
                }}
              >
                <MenuItem value=""><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Select PO Status</em></MenuItem>
                {poStatusList.map(item => (
                  <MenuItem key={item.id} value={item.stageName}>{item.stageName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Invoice Status */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">Invoice Status</label>
            <FormControl fullWidth size="small">
              <Select
                id="InvoiceStatus"
                name="InvoiceStatus"
                displayEmpty
                value={formik.values.InvoiceStatus}
                onChange={formik.handleChange}
                onOpen={() => {
                  if (!invoiceStatusLoaded) pullGetEventStage("INV", setInvoiceStatusList, setInvoiceStatusLoaded);
                }}
              >
                <MenuItem value=""><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Select Invoice Status</em></MenuItem>
                {invoiceStatusList.map(item => (
                  <MenuItem key={item.id} value={item.stageName}>{item.stageName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Created Date */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">Created Date</label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <MobileDatePicker
                value={formik.values.CreatedDate}
                onChange={(val) => formik.setFieldValue("CreatedDate", val)}
                slotProps={{
                  textField: { variant: "outlined", size: "small", fullWidth: true, placeholder: "Select date" },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Invoice No */}
          <div className="col-12 mb-3">
            <label className="pe-field-label">Invoice No</label>
            <TextField
              id="InvoiceNo"
              name="InvoiceNo"
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Enter Invoice No"
              value={formik.values.InvoiceNo}
              onChange={formik.handleChange}
            />
          </div>

        </div>
      </div>

      {/* Fixed footer with action buttons */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        background: '#fff',
        flexShrink: 0,
      }}>
        <button
          type="button"
          className="pe-btn pe-btn--ghost"
          onClick={handleResetClick}
        >
          Reset
        </button>
        <button
          type="submit"
          className="pe-btn pe-btn--primary"
          disabled={submitting}
        >
          {submitting ? 'Searching...' : 'Apply'}
        </button>
      </div>
    </form>
  );
};

export default FilterCell;
