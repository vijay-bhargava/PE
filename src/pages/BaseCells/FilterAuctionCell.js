import {
    FormControl,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useFormik } from "formik";
import * as yup from "yup";
import { ApiClient } from "../../Apiclient";
import { useStateValue } from "../../store";
import { buildQueryParams } from "../../utils/purchaseRequest";
import { getEventStage } from "../../utils/common/utility";

const FilterAuctionCell = ({ handleFilterList, clearFilterList }) => {
    const [{ atoken, customerid, customersuffix, userDetail }] = useStateValue();
    const [auctionLoading, setAuctionLoading] = useState(false);
    const [auctionStatusLoaded, setAuctionStatusLoaded] = useState(false);
    const [auctionStatusList, setAuctionStatusList] = useState([]);

    const apiClient = new ApiClient(customersuffix);

    useEffect(() => {
        if (!auctionStatusLoaded) {
            pullGetEventStage("Auction", setAuctionStatusList, setAuctionStatusLoaded);
        }
    }, [auctionStatusLoaded]);

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

    const formik = useFormik({
        initialValues: {
            CustomerId: customerid,
            id: "",
            eventCode: "",
            subject: "",
            bidTypeID: "",
            stage: "",
            bidStDate: null,
            bidEndDate: null,
        },
        validationSchema: yup.object({
            bidStDate: yup.date().nullable(),
            bidEndDate: yup
                .date()
                .nullable()
                .typeError("End Date must be a valid date")
                .test("enddate-after-startdate", "End Date cannot be before the Start Date.", function (value) {
                    const { bidStDate } = this.parent;
                    if (bidStDate && value && value < bidStDate) {
                        return this.createError({ path: "bidEndDate", message: "End Date cannot be before the Start Date." });
                    }
                    return true;
                }),
        }),
        onSubmit: (values) => {
            const data = {
                CustomerId: customerid,
                Id: values.id,
                EventCode: values.eventCode,
                Subject: values.subject,
                BidTypeID: values.bidTypeID,
                Stage: values.stage,
                BidStDate: values.bidStDate ? values.bidStDate.toISOString() : null,
                BidEndDate: values.bidEndDate ? values.bidEndDate.toISOString() : null,
            };
            handleAdvanchsearch(data, values);
        },
    });

    const handleAdvanchsearch = async (values, searchCriteria) => {
        const filteredValues = Object.entries(values)
            .filter(([, value]) => value !== null && value !== undefined && value !== "" && value !== 0)
            .reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {});

        const queryParams = buildQueryParams(filteredValues);
        setAuctionLoading(true);

        try {
            const res = await apiClient.get(`/api/AuctionManage/Find?${queryParams}`, atoken);
            if (res) {
                const list = Array.isArray(res) ? res : (res?.result ?? []);
                handleFilterList(list, searchCriteria);
            } else {
                handleFilterList([], searchCriteria);
            }
        } catch (error) {
            console.error("Error in filter search:", error);
            handleFilterList([], searchCriteria);
        }

        setAuctionLoading(false);
    };

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

                {/* Auction ID */}
                <div>
                    <label className="rfq-v2-filter-label" htmlFor="filter-auction-id">
                        Auction ID
                    </label>
                    <TextField
                        id="filter-auction-id"
                        name="id"
                        type="number"
                        placeholder="Enter auction ID"
                        size="small"
                        fullWidth
                        variant="outlined"
                        className="rfq-v2-filter-field"
                        value={formik.values.id}
                        onChange={(e) => {
                            const regex = /^\d{0,10}$/;
                            if (regex.test(e.target.value)) {
                                formik.setFieldValue("id", e.target.value);
                            }
                        }}
                    />
                </div>

                {/* Subject */}
                <div>
                    <label className="rfq-v2-filter-label" htmlFor="filter-auction-subject">
                        Subject
                    </label>
                    <TextField
                        id="filter-auction-subject"
                        name="subject"
                        placeholder="Enter subject"
                        size="small"
                        fullWidth
                        variant="outlined"
                        className="rfq-v2-filter-field"
                        value={formik.values.subject}
                        onChange={(e) => formik.setFieldValue("subject", e.target.value)}
                        inputProps={{ maxLength: 200 }}
                    />
                </div>

                {/* Auction Type */}
                <div>
                    <label className="rfq-v2-filter-label" htmlFor="filter-auction-type">
                        Auction Type
                    </label>
                    <FormControl fullWidth size="small" variant="outlined" className="rfq-v2-filter-field">
                        <Select
                            id="filter-auction-type"
                            value={formik.values.bidTypeID}
                            onChange={(e) => formik.setFieldValue("bidTypeID", e.target.value)}
                            displayEmpty
                            renderValue={(selected) =>
                                selected ? {
                                    1: 'Forward Auction', 2: 'Reverse Auction', 3: 'Freight Auction',
                                    4: 'Formula Based Auction', 5: 'French Forward Auction', 6: 'French Reverse Auction',
                                }[selected] || selected : <span style={{ color: '#9ca3af' }}>Select type</span>
                            }
                        >
                            <MenuItem value={1}>Forward Auction</MenuItem>
                            <MenuItem value={2}>Reverse Auction</MenuItem>
                            <MenuItem value={3}>Freight Auction</MenuItem>
                            <MenuItem value={4}>Formula Based Auction</MenuItem>
                            <MenuItem value={5}>French Forward Auction</MenuItem>
                            <MenuItem value={6}>French Reverse Auction</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* Status */}
                <div>
                    <label className="rfq-v2-filter-label" htmlFor="filter-auction-stage">
                        Status
                    </label>
                    <FormControl fullWidth size="small" variant="outlined" className="rfq-v2-filter-field">
                        <Select
                            id="filter-auction-stage"
                            value={formik.values.stage}
                            onChange={(e) => formik.setFieldValue("stage", e.target.value)}
                            displayEmpty
                            renderValue={(selected) =>
                                selected ? selected : <span style={{ color: '#9ca3af' }}>Select status</span>
                            }
                        >
                            {auctionStatusList.length > 0
                                ? auctionStatusList.map((item) => (
                                    <MenuItem key={item.id} value={item.stageName}>
                                        {item.stageName}
                                    </MenuItem>
                                ))
                                : <MenuItem disabled>No options available</MenuItem>}
                        </Select>
                    </FormControl>
                </div>

                {/* Start Date | End Date — side by side */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="rfq-v2-filter-row-half">
                        <div>
                            <label className="rfq-v2-filter-label" htmlFor="filter-auction-startDate">
                                Start Date
                            </label>
                            <MobileDateTimePicker
                                value={formik.values.bidStDate}
                                onChange={(newValue) => formik.setFieldValue("bidStDate", newValue)}
                                slotProps={{
                                    textField: {
                                        id: "filter-auction-startDate",
                                        variant: "outlined",
                                        size: "small",
                                        fullWidth: true,
                                        placeholder: "Start date",
                                        className: "rfq-v2-filter-field",
                                        error: !!formik.errors.bidStDate,
                                        helperText: formik.errors.bidStDate,
                                    },
                                    actionBar: { actions: ["clear", "cancel", "accept"] },
                                }}
                            />
                        </div>
                        <div>
                            <label className="rfq-v2-filter-label" htmlFor="filter-auction-endDate">
                                End Date
                            </label>
                            <MobileDateTimePicker
                                value={formik.values.bidEndDate}
                                onChange={(newValue) => formik.setFieldValue("bidEndDate", newValue)}
                                slotProps={{
                                    textField: {
                                        id: "filter-auction-endDate",
                                        variant: "outlined",
                                        size: "small",
                                        fullWidth: true,
                                        placeholder: "End date",
                                        className: "rfq-v2-filter-field",
                                        error: !!formik.errors.bidEndDate,
                                        helperText: formik.errors.bidEndDate,
                                    },
                                    actionBar: { actions: ["clear", "cancel", "accept"] },
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
                    loading={auctionLoading}
                    className="rfq-v2-filter-btn-apply"
                    disableElevation
                >
                    Apply
                </LoadingButton>
            </div>
        </form>
    );
};

export default FilterAuctionCell;
