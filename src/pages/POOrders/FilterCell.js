import React, { useRef, useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { LoadingButton } from "@mui/lab";
import { TextField, MenuItem } from '@mui/material';
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

  const validationSchema = yup.object({});
  const formik = useFormik({
    initialValues: {
      POId: '',
      ItemNo: '',
      ItemName: '', // <-- added here
      ItemType: '',
      POStatus: '',
      InvoiceStatus: '',
      CreatedDate: null,
      InvoiceNo: ''
    },
    validationSchema,
    onSubmit: (values) => {
      const queryParams = {};
      if (values.POStatus) queryParams.POStage = values.POStatus;
      if (values.POId) queryParams.POId = values.POId;
      if (values.ItemNo) queryParams.ItemNo = values.ItemNo;
      if (values.ItemName) queryParams.ItemName = values.ItemName; // <-- added here
      if (values.ItemType) queryParams.ItemType = values.ItemType;
      if (values.InvoiceNo) queryParams.InvoiceNo = values.InvoiceNo;
      if (values.InvoiceStatus) queryParams.InvoiceStage = values.InvoiceStatus;
      if (values.CreatedDate) queryParams.CreatedDate = values.CreatedDate.toISOString();

      GetPOHeaderList(queryParams, atoken)
        // .then(res => handleFilterList(res || []))
        .then(res => {

          const exportPayload = {
            poId: values.POId || "",
            itemNo: values.ItemNo || "",
            itemName: values.ItemName || "",
            itemType: values.ItemType || "",
            poStage: values.POStatus || "",
            invoiceStage: values.InvoiceStatus || "",
            invoiceNo: values.InvoiceNo || "",
            createdDate: values.CreatedDate
              ? values.CreatedDate.toISOString()
              : ""
          };

          setExportFilters(exportPayload);

          handleFilterList(res || [], exportPayload);

        })
        .catch(err => {
          console.error("Error fetching PO list:", err);
          handleFilterList([]);
        });
    }
  });


  // const formik = useFormik({
  //   initialValues: {
  //     POId: '',
  //     ItemNo: '',
  //     ItemType: '',
  //     POStatus: '',
  //     InvoiceStatus: '',
  //     CreatedDate: null,
  //     InvoiceNo: ''
  //   },
  //   validationSchema,
  //   onSubmit: (values) => {
  //     const queryParams = {};
  //     if (values.POStatus) queryParams.POStage = values.POStatus;
  //     if (values.POId) queryParams.POId = values.POId;
  //     if (values.ItemNo) queryParams.ItemNo = values.ItemNo;
  //     if (values.ItemType) queryParams.ItemType = values.ItemType;
  //     if (values.InvoiceNo) queryParams.InvoiceNo = values.InvoiceNo;
  //     if (values.InvoiceStatus) queryParams.InvoiceStage = values.InvoiceStatus;
  //     if (values.CreatedDate) queryParams.CreatedDate = values.CreatedDate.toISOString();

  //     GetPOHeaderList(queryParams, atoken)
  //       .then(res => handleFilterList(res || []))
  //       .catch(err => {
  //         console.error("Error fetching PO list:", err);
  //         handleFilterList([]);
  //       });
  //   }
  // });

  const handleResetClick = () => {
    formik.resetForm();
    clearFilterList();
  };

  const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
    const data = { CustomerId: customerid, IsActive: true, EventType: EventTypeId };
    try {
      const res = await getEventStage(data, atoken);

      // const resultArray = Array.isArray(res?.data)
      //   ? res.data
      //   : Array.isArray(res?.data?.result)
      //   ? res.data.result
      //   : [];
      setList(res || []);
    } catch (err) {
      console.error("Error fetching event stage:", err);
      setList([]);
    } finally {
      setLoaded(true);
    }
  };

  return (
    <div className="rightContent">
      <div className="bg-white p-3" style={{ border: "none" }}>
        <form onSubmit={formik.handleSubmit} ref={formRef} autoComplete="off">
          <div className="row">
            {/* PO ID */}
            <div className="col-12 mb-3">
              <TextField
                id="POId"
                name="POId"
                label="PO ID"
                fullWidth
                size="small"
                variant="outlined"
                value={formik.values.POId}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            {/* Item No */}
            <div className="col-12 mb-3">
              <TextField
                id="ItemNo"
                name="ItemNo"
                label="Item No"
                fullWidth
                size="small"
                variant="outlined"
                value={formik.values.ItemNo}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            {/* Item Name */}
            <div className="col-12 mb-2">
              <TextField
                id="ItemName"
                name="ItemName"
                label="Item Name"
                fullWidth
                size="small"
                variant="outlined"
                value={formik.values.ItemName}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            {/* Item Type */}
            <div className="col-12 mb-2">
              <TextField
                id="ItemType"
                name="ItemType"
                select
                fullWidth
                size="small"
                label="Item Type"
                variant="outlined"
                value={formik.values.ItemType}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Material">Material</MenuItem>
                <MenuItem value="Service">Service</MenuItem>
              </TextField>
            </div>

            {/* PO Status */}
            <div className="col-12 mb-2">
              <TextField
                id="POStatus"
                name="POStatus"
                select
                fullWidth
                size="small"
                label="PO Status"
                variant="outlined"
                value={formik.values.POStatus}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  onOpen: () => {
                    if (!poStatusLoaded) pullGetEventStage("PO", setPoStatusList, setPoStatusLoaded);
                  }
                }}
              >
                {poStatusList.length
                  ? poStatusList.map(item => (
                    <MenuItem key={item.id} value={item.stageName}>
                      {item.stageName}
                    </MenuItem>
                  ))
                  : <MenuItem disabled>No options available</MenuItem>}
              </TextField>
            </div>

            {/* Invoice Status */}
            <div className="col-12 mb-2">
              <TextField
                id="InvoiceStatus"
                name="InvoiceStatus"
                select
                fullWidth
                size="small"
                label="Invoice Status"
                variant="outlined"
                value={formik.values.InvoiceStatus}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  onOpen: () => {

                    if (!invoiceStatusLoaded) pullGetEventStage("INV", setInvoiceStatusList, setInvoiceStatusLoaded);
                  }
                }}
              >
                {invoiceStatusList.length
                  ? invoiceStatusList.map(item => (
                    <MenuItem key={item.id} value={item.stageName}>
                      {item.stageName}
                    </MenuItem>
                  ))
                  : <MenuItem disabled>No options available</MenuItem>}
              </TextField>
            </div>

            {/* Created Date */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div className="col-12 mb-3">
                <MobileDatePicker
                  label="Created Date"
                  value={formik.values.CreatedDate}
                  onChange={(newValue) => formik.setFieldValue("CreatedDate", newValue)}
                  slotProps={{
                    textField: { variant: "outlined", size: "small", fullWidth: true, InputLabelProps: { shrink: true } },
                  }}
                />
              </div>
            </LocalizationProvider>

            {/* Invoice No */}
            <div className="col-12 mb-2">
              <TextField
                id="InvoiceNo"
                name="InvoiceNo"
                label="Invoice No"
                fullWidth
                size="small"
                variant="outlined"
                value={formik.values.InvoiceNo}
                onChange={formik.handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            {/* Buttons */}
            <div className="col-12 text-end">
              <LoadingButton variant="contained" color="primary" className="me-3" onClick={handleResetClick}>
                Clear
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                color="primary"
                onClick={(e) => { e.preventDefault(); formik.handleSubmit(); }}
              >
                Submit
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterCell;
