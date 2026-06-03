import {
  Autocomplete,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useStateValue } from "../../../store";
import { ApiClient } from "../../../Apiclient";
import { useFormik } from "formik";
import * as yup from "yup";
import { buildQueryParams } from "../../../utils/purchaseRequest";
import { OrgGroupMasterList } from "../../../utils/commerciallibrary";
import { getPurchaseOrgList, getEventStage } from "../../../utils/common/utility";

const FilterRFQCell = ({ handleFilterList, clearFilterList }) => {
  const [{ atoken, customerid, customersuffix }] = useStateValue();
  const [rfqLoading, setRfqLoading] = useState(false);

  const apiClient = new ApiClient(customersuffix);

  const formik = useFormik({
    initialValues: {
      CustomerId: customerid,
      eventCode: "",
      Subject: "",
      stage: "",
      StartDate: null,
      EndDate: null,
      purchOrgId: null,
      purchGrpId: null,
    },
    validationSchema: yup.object({
      StartDate: yup.date().nullable(),
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

    onSubmit: (values) => {
      const PurchOrgId = values.purchOrgId?.id || 0;
      const PurchGrpId = values.purchGrpId?.id || 0;
      const data = {
        CustomerId: customerid,
        eventCode: values.eventCode,
        Subject: values.Subject,
        Stage: values.stage,
        StartDate: values.StartDate ? values.StartDate.toISOString() : null,
        EndDate: values.EndDate ? values.EndDate.toISOString() : null,
        PurchOrgId,
        PurchGrpId,
      };
      handleAdvanchsearch(data);
    },
  });

  const handleAdvanchsearch = async (values) => {
    const filteredValues = Object.entries(values)
      .filter(([, value]) => value !== null && value !== undefined && value !== "" && value !== 0)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const queryParams = buildQueryParams(filteredValues);

    setRfqLoading(true);

    try {
      const res = await apiClient.get(
        `/api/RFQManage/FindAdvnceSearch?${queryParams}`,
        atoken
      );

      if (res) {
        handleFilterList(res?.result);
      } else {
        handleFilterList([]);
      }
    } catch (error) {
      console.error(error);
      handleFilterList([]);
    }

    setRfqLoading(false);
  };

  const clear = () => {
    formik.resetForm();
    clearFilterList();
  };

  const [purchaseAllList, setPurchaseAllList] = useState([]);
  const [purchaseGroupAllList, setPurchaseGroupAllList] = useState([]);
  const [rfqStatusLoaded, setRfqStatusLoaded] = useState(false);
  const [rfqStatusList, setRfqStatusList] = useState([]);

  useEffect(() => {
    if (!rfqStatusLoaded) {
      pullGetEventStage("RFQ", setRfqStatusList, setRfqStatusLoaded);
    }
  }, [rfqStatusLoaded]);

  const PullPurchaseOrgAll = () => {
    const data = { CustomerId: customerid, IsActive: "true" };
    getPurchaseOrgList(data, atoken).then((resp) => {
      if (resp) {
        setPurchaseAllList(resp);
      }
    });
  };

  const PullPurchaseGroupAll = (orgMstId) => {
    const data = { CustomerId: customerid, OrgMstId: orgMstId, IsActive: "true" };
    OrgGroupMasterList(data, atoken).then((res) => {
      if (res !== "" && res !== undefined) {
        setPurchaseGroupAllList(res);
      }
    });
  };

  const pullGetEventStage = async (EventTypeId, setList, setLoaded) => {
    const data = { CustomerId: customerid, IsActive: true, EventType: EventTypeId };
    try {
      const res = await getEventStage(data, atoken);
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
      className="rfq-v2-filter-body"
      onSubmit={formik.handleSubmit}
      autoComplete="off"
    >
      {/* ── Scrollable fields area ── */}
      <div className="rfq-v2-filter-fields">

        {/* Event Code */}
        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-eventCode">
            Event Code
          </label>
          <TextField
            id="filter-eventCode"
            name="eventCode"
            placeholder="Enter event code"
            size="small"
            fullWidth
            variant="outlined"
            className="rfq-v2-filter-field"
            value={formik.values.eventCode}
            onChange={(e) => formik.setFieldValue("eventCode", e.target.value)}
          />
        </div>

        {/* Subject */}
        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-subject">
            Subject
          </label>
          <TextField
            id="filter-subject"
            name="subject"
            placeholder="Enter subject"
            size="small"
            fullWidth
            variant="outlined"
            className="rfq-v2-filter-field"
            value={formik.values.Subject}
            onChange={(e) => formik.setFieldValue("Subject", e.target.value)}
            inputProps={{ maxLength: 200 }}
          />
        </div>

        {/* Status */}
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
              {rfqStatusList.length > 0
                ? rfqStatusList.map((item) => (
                  <MenuItem key={item.id} value={item.stageName}>
                    {item.stageName}
                  </MenuItem>
                ))
                : (
                  <MenuItem disabled>No options available</MenuItem>
                )}
            </Select>
          </FormControl>
        </div>

        {/* Start Date | End Date — side by side */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="rfq-v2-filter-row-half">
            <div>
              <label className="rfq-v2-filter-label" htmlFor="filter-startDate">
                Start Date
              </label>
              <MobileDateTimePicker
                value={formik.values.StartDate}
                onChange={(newValue) => formik.setFieldValue("StartDate", newValue)}
                slotProps={{
                  textField: {
                    id: "filter-startDate",
                    variant: "outlined",
                    size: "small",
                    fullWidth: true,
                    placeholder: "Start date",
                    className: "rfq-v2-filter-field",
                    error: !!formik.errors.StartDate,
                    helperText: formik.errors.StartDate,
                  },
                }}
              />
            </div>

            <div>
              <label className="rfq-v2-filter-label" htmlFor="filter-endDate">
                End Date
              </label>
              <MobileDateTimePicker
                value={formik.values.EndDate}
                onChange={(newValue) => formik.setFieldValue("EndDate", newValue)}
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

        {/* Purchase Org */}
        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-purchOrgId">
            Purchase Org
          </label>
          <Autocomplete
            id="filter-purchOrgId"
            options={purchaseAllList}
            getOptionLabel={(option) => option?.orgName ?? ""}
            value={formik.values.purchOrgId}
            onChange={(e, value) => {
              formik.setFieldValue("purchOrgId", value);
              formik.setFieldValue("purchGrpId", null);
            }}
            onOpen={() => {
              if (!purchaseAllList || purchaseAllList.length === 0) {
                PullPurchaseOrgAll();
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select purchase org"
                variant="outlined"
                size="small"
                className="rfq-v2-filter-field"
              />
            )}
          />
        </div>

        {/* Purchase Group */}
        <div>
          <label className="rfq-v2-filter-label" htmlFor="filter-purchGrpId">
            Purchase Group
          </label>
          <Autocomplete
            id="filter-purchGrpId"
            options={purchaseGroupAllList}
            getOptionLabel={(option) => option?.groupName ?? ""}
            value={formik.values.purchGrpId}
            onChange={(e, value) => formik.setFieldValue("purchGrpId", value)}
            onOpen={() => {
              if (
                formik?.values?.purchOrgId?.id &&
                (!purchaseGroupAllList || purchaseGroupAllList.length === 0)
              ) {
                PullPurchaseGroupAll(formik.values.purchOrgId.id);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select purchase group"
                variant="outlined"
                size="small"
                className="rfq-v2-filter-field"
                style={{
                  background: formik.values.purchOrgId ? "#fff" : "#f9fafb",
                }}
              />
            )}
          />
        </div>
      </div>

      {/* ── Sticky footer: Reset + Apply ── */}
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
          loading={rfqLoading}
          className="rfq-v2-filter-btn-apply"
          disableElevation
        >
          Apply
        </LoadingButton>
      </div>
    </form>
  );
};

export default FilterRFQCell;
