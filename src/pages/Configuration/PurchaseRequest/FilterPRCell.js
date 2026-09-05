import {
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useFormik } from "formik";
import * as yup from "yup";
import { useStateValue } from "../../../store";
import { getPRAdvanceFind } from "../../../utils/purchaseRequest";
import { toast } from "react-toastify";

const PR_STAGES = [
  "Draft",
  "Under Approval",
  "Approved",
  "Partially Consumed",
  "Consumed",
  "Cancel",
  "Close",
];

const FilterPRCell = ({ handleFilterList, clearFilterList }) => {
  const [{ atoken, customerid }] = useStateValue();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      PRSubject: "",
      PRNumber: "",
      CreatedByName: "",
      stage: "",
      PRItems_ItemName: "",
      StartDate: null,
      EndDate: null,
    },
    validationSchema: yup.object({
      EndDate: yup
        .date()
        .nullable()
        .typeError("End Date must be a valid date")
        .test(
          "enddate-after-startdate",
          "End Date cannot be before the Start Date.",
          function (value) {
            const { StartDate } = this.parent;
            if (StartDate && value && value < StartDate) {
              return this.createError({
                path: "EndDate",
                message: "End Date cannot be before the Start Date.",
              });
            }
            return true;
          }
        ),
    }),
    onSubmit: async (values) => {
      const payload = {
        CustomerId: customerid,
      };
      if (values.PRSubject) payload.PRSubject = values.PRSubject;
      if (values.PRNumber) payload.PRNumber = values.PRNumber;
      if (values.CreatedByName) payload.CreatedByName = values.CreatedByName;
      if (values.stage) payload.stage = values.stage;
      if (values.PRItems_ItemName) payload.PRItems_ItemName = values.PRItems_ItemName;
      if (values.StartDate) payload.fromDate = values.StartDate.toISOString();
      if (values.EndDate) payload.toDate = values.EndDate.toISOString();

      setLoading(true);
      try {
        const response = await getPRAdvanceFind(payload, atoken);
        if (response === undefined) {
          toast.error("Filter request failed. Please try again.", { toastId: "filterpr_error" });
          handleFilterList([]);
        } else {
          const list = Array.isArray(response) ? response : (response?.result ?? []);
          handleFilterList(list);
        }
      } catch (error) {
        toast.error("Failed to apply filter.", { toastId: "filterpr_error" });
        handleFilterList([]);
      } finally {
        setLoading(false);
      }
    },
  });

  const clear = () => {
    formik.resetForm();
    clearFilterList();
  };

  return (
    <form
      className="rfq-v2-filter-body"
      onSubmit={formik.handleSubmit}
      autoComplete="off"
    >
      {/* ── Scrollable fields ── */}
      <div className="rfq-v2-filter-fields">

        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-prSubject">
            PR Subject
          </label>
          <TextField
            id="filter-prSubject"
            placeholder="Enter PR subject"
            size="small"
            fullWidth
            variant="outlined"
            className="rfq-v2-filter-field"
            value={formik.values.PRSubject}
            onChange={(e) => formik.setFieldValue("PRSubject", e.target.value)}
          />
        </div>

        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-prNumber">
            PR Number
          </label>
          <TextField
            id="filter-prNumber"
            placeholder="Enter PR number"
            size="small"
            fullWidth
            variant="outlined"
            className="rfq-v2-filter-field"
            value={formik.values.PRNumber}
            onChange={(e) => formik.setFieldValue("PRNumber", e.target.value)}
          />
        </div>

        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-createdBy">
            Created By
          </label>
          <TextField
            id="filter-createdBy"
            placeholder="Enter creator name"
            size="small"
            fullWidth
            variant="outlined"
            className="rfq-v2-filter-field"
            value={formik.values.CreatedByName}
            onChange={(e) => formik.setFieldValue("CreatedByName", e.target.value)}
          />
        </div>

        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-stage">
            Status
          </label>
          <FormControl fullWidth size="small" variant="outlined" className="rfq-v2-filter-field">
            <Select
              id="filter-stage"
              value={formik.values.stage}
              onChange={(e) => formik.setFieldValue("stage", e.target.value)}
              displayEmpty
              renderValue={(selected) =>
                selected ? selected : <span style={{ color: "#9ca3af" }}>Select status</span>
              }
            >
              <MenuItem value="">All</MenuItem>
              {PR_STAGES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-itemName">
            Item Name
          </label>
          <TextField
            id="filter-itemName"
            placeholder="Enter item name"
            size="small"
            fullWidth
            variant="outlined"
            className="rfq-v2-filter-field"
            value={formik.values.PRItems_ItemName}
            onChange={(e) => formik.setFieldValue("PRItems_ItemName", e.target.value)}
          />
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="rfq-v2-filter-row-half">
            <div>
              <label className="rfq-v2-filter-label" htmlFor="filter-startDate">
                Created From
              </label>
              <MobileDateTimePicker
                value={formik.values.StartDate}
                onChange={(v) => formik.setFieldValue("StartDate", v)}
                slotProps={{
                  textField: {
                    id: "filter-startDate",
                    variant: "outlined",
                    size: "small",
                    fullWidth: true,
                    placeholder: "Start date",
                    className: "rfq-v2-filter-field",
                  },
                }}
              />
            </div>
            <div>
              <label className="rfq-v2-filter-label" htmlFor="filter-endDate">
                Created To
              </label>
              <MobileDateTimePicker
                value={formik.values.EndDate}
                onChange={(v) => formik.setFieldValue("EndDate", v)}
                slotProps={{
                  textField: {
                    id: "filter-endDate",
                    variant: "outlined",
                    size: "small",
                    fullWidth: true,
                    placeholder: "End date",
                    className: "rfq-v2-filter-field",
                    error: !!formik.errors.EndDate,
                    helperText: formik.errors.EndDate,
                  },
                }}
              />
            </div>
          </div>
        </LocalizationProvider>

      </div>

      {/* ── Sticky footer ── */}
      <div className="rfq-v2-filter-footer">
        <button
          type="button"
          className="rfq-v2-filter-btn-reset"
          onClick={clear}
        >
          Reset
        </button>
        <LoadingButton
          type="submit"
          loading={loading}
          className="rfq-v2-filter-btn-apply"
          disableElevation
        >
          Apply
        </LoadingButton>
      </div>
    </form>
  );
};

export default FilterPRCell;
