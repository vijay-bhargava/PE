import {
    Box,
    Button,
    Checkbox,
    Drawer,
    FormControl,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { HiOutlineX, HiPlusSm } from "react-icons/hi";
import { useCallback } from "react";
import { LoadingButton } from "@mui/lab";
import * as yup from "yup";

import { DateTimePicker, DesktopDatePicker, LocalizationProvider, MobileDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useFormik } from "formik";
import TextFieldCell from "./TextFieldCell";
import { api, ApiClient } from "../../Apiclient";
import { actionTypes, useStateValue } from "../../store";
import { buildQueryParams } from "../../utils/purchaseRequest";
import { getEventStage } from "../../utils/common/utility";

const FilterAuctionCell = ({ handleFilterList, clearFilterList }) => {
    const [{ atoken, rtoken, customersuffix, customerid, userDetail }, dispatch] = useStateValue();
    const [auctionLoading, setAuctionLoading] = useState(false);
    useEffect(() => {

        if (userDetail && atoken)
            if (userDetail?.roleId) {
                getRoles()
            }
    }, [userDetail, atoken])

    const [listreadaccessLevel, setListReadAccessLevel] = useState('');
    const [auctionStatusLoaded, setAuctionStatusLoaded] = useState(false);
    const [auctionStatusList, setAuctionStatusList] = useState([]);

    const getRoles = async () => {
        const dataR = {
            roleId: parseInt(userDetail?.roleId),
            featureName: "Request for Quotation",
            claimType: "List",
        }

        const queryParams = buildQueryParams(dataR)
        const res = await apiClient.getres(`/api/auth/UserRoleClaim?${queryParams}`, atoken)
        if (res) {
            const data = res?.data
            console.log("My Roles & My Right")
            console.table(res?.data)
            dispatch({ type: actionTypes.SET_RoleClaims, value: data });
            const accessLevels = res?.data.map(item => {
                if ((item.claimType === 'List') && (item.claimValue === 'Read')) {
                    setListReadAccessLevel(item.accessLevel)
                }

            }).filter(item => item !== null);
            accessLevels.forEach(level => {
            });

        }

    }

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

    const apiClient = new ApiClient(customersuffix);

    const formik = useFormik({
        initialValues: {
            CustomerId: customerid,
            id: "",
            eventCode: "",
            subject: "",
            bidTypeID: "",
            stage: "",
            bidStDate: null,
            bidEndDate: null
        },
        validationSchema: yup.object({
            bidStDate: yup
                .date()
                .nullable(),
            bidEndDate: yup
                .date()
                .nullable()
                .typeError("End Date must be a valid date")
                .test("enddate-after-startdate", "End Date cannot be before the Start Date.", function (value) {
                    const { bidStDate } = this.parent;

                    if (bidStDate && value && value < bidStDate) {
                        return this.createError({
                            path: "bidEndDate",
                            message: "End Date cannot be before the Start Date.",
                        });
                    }
                    return true;
                }),
        }),
        onSubmit: (values, { setSubmitting }) => {
            const data = {
                CustomerId: customerid,
                Id: values.id,
                EventCode: values.eventCode,
                Subject: values.subject,
                BidTypeID: values?.bidTypeID,
                Stage: values.stage,
                BidStDate: values.bidStDate ? values.bidStDate.toISOString() : null,
                BidEndDate: values.bidEndDate ? values.bidEndDate.toISOString() : null,
                AccessLevel: listreadaccessLevel
            };

            handleAdvanchsearch(data, values); // Pass the search criteria
            setSubmitting(false);
        },
    });

    const handleAdvanchsearch = async (values, searchCriteria) => {

        let queryParams = buildQueryParams(values);
        setAuctionLoading(true);

        try {
            const res = await apiClient.get(`/api/AuctionManage/FindAdvnceSearch?${queryParams}`, atoken);

            if (res && res.result) {
                handleFilterList(res.result, searchCriteria);
            } else {
                console.log('No results found or empty response');
                handleFilterList([], searchCriteria);
            }
        } catch (error) {
            console.error('Error in filter search:', error);
            handleFilterList([], searchCriteria);
        }
        setAuctionLoading(false);
    };
    const clear = () => {
        formik.resetForm();
        clearFilterList();
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit(e);
                }}
                autoComplete="off" method="post"
            >
                <div className="d-flex flex-column min-vh-100">

                    <div className="flex-grow-1">
                        <div className="p-3">
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <TextFieldCell
                                        id="id"
                                        name="id"
                                        label="Auction ID"
                                        placeholder=""
                                        InputProps={{
                                            step: 1,
                                            min: 0,
                                            max: 100,
                                        }}
                                        type="number"
                                        value={formik?.values?.id}
                                        onChange={(e) => {
                                            const regex = /^\d{0,10}(\.\d{0,4})?$/;
                                            if (regex.test(e.target.value)) {
                                                formik?.setFieldValue("id", e.target?.value);
                                            }
                                        }}
                                    />
                                </div>
                                {/* <div className="col-12 mb-4">
                                    <TextFieldCell
                                        id="eventCode"
                                        name="eventCode"
                                        label="Event Code"
                                        placeholder=""
                                        type="text"
                                        value={formik?.values?.eventCode}
                                        onChange={(e) => {
                                            formik?.setFieldValue("eventCode", e.target?.value);
                                        }}
                                    />
                                </div> */}
                                <div className="col-12 mb-4">
                                    <TextFieldCell
                                        id="subject"
                                        name="subject"
                                        label="Subject"
                                        placeholder=""
                                        maxLength={200}
                                        value={formik?.values?.subject}
                                        onChange={(e) => {
                                            formik?.setFieldValue("subject", e.target?.value);
                                        }}
                                        InputProps={{
                                            endAdornment: formik?.values?.subject && (
                                                <InputAdornment position="end">
                                                    <Typography variant="body2" color="textSecondary">
                                                        {formik?.values?.subject?.length}/200
                                                    </Typography>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </div>
                                <div className="col-12 mb-4">
                                    <FormControl fullWidth>
                                        <InputLabel id="bidTypeID">Type</InputLabel>
                                        <Select
                                            labelId="bidTypeID"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            variant="outlined"
                                            size="small"
                                            id="bidTypeID"
                                            name="bidTypeID"
                                            value={formik?.values?.bidTypeID}
                                            label="Type"
                                            onChange={(e) => {
                                                formik?.setFieldValue("bidTypeID", e.target?.value);
                                            }}
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
                                <div className="col-12 mb-4">
                                    <FormControl fullWidth>
                                        <InputLabel id="stage">Status</InputLabel>
                                        <Select
                                            labelId="stage"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            variant="outlined"
                                            size="small"
                                            id="stage"
                                            name="stage"
                                            value={formik?.values?.stage}
                                            label="Status"
                                            onChange={(e) => {
                                                formik?.setFieldValue("stage", e.target?.value);
                                            }}
                                            SelectProps={{
                                                onOpen: () => {
                                                    if (!auctionStatusLoaded) pullGetEventStage("Auction", setAuctionStatusList, setAuctionStatusLoaded);
                                                }
                                            }}
                                        >
                                            {auctionStatusList.length
                                                ? auctionStatusList.map(item => (
                                                    <MenuItem key={item.id} value={item.stageName}>
                                                        {item.stageName}
                                                    </MenuItem>
                                                ))
                                                : <MenuItem disabled>No options available</MenuItem>}
                                        </Select>
                                    </FormControl>
                                </div>

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <div className="col-12 mb-4">
                                        <MobileDateTimePicker
                                            variant="outlined"
                                            label="Start Date/Time"
                                            size="small"
                                            name="bidStDate"
                                            id="bidStDate"
                                            value={formik.values.bidStDate}
                                            className="w-100 f14"
                                            slotProps={{
                                                textField: {
                                                    variant: "outlined",
                                                    size: "small",
                                                    InputLabelProps: { shrink: true },
                                                    error: formik.touched.bidStDate && Boolean(formik.errors.bidStDate),
                                                    helperText: formik.touched.bidStDate && formik.errors.bidStDate,
                                                },
                                                actionBar: {
                                                    actions: ["clear", "cancel", "accept"],
                                                },
                                            }}
                                            onChange={(newValue) => {
                                                formik.setFieldValue("bidStDate", newValue);
                                                if (newValue && formik.values.bidEndDate && newValue > formik.values.bidEndDate) {
                                                    formik.setFieldError("bidEndDate", "End Date cannot be earlier than Start Date");
                                                } else {
                                                    formik.setFieldError("bidEndDate", undefined);
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="col-12 mb-4">
                                        <MobileDateTimePicker
                                            variant="outlined"
                                            label="End Date/Time"
                                            size="small"
                                            name="bidEndDate"
                                            id="bidEndDate"
                                            value={formik.values.bidEndDate}
                                            className="w-100 f14"
                                            slotProps={{
                                                textField: {
                                                    variant: "outlined",
                                                    size: "small",
                                                    InputLabelProps: { shrink: true },
                                                    error: formik.touched.bidEndDate && Boolean(formik.errors.bidEndDate),
                                                    helperText: formik.touched.bidEndDate && formik.errors.bidEndDate,
                                                },
                                                actionBar: {
                                                    actions: ["clear", "cancel", "accept"],
                                                },
                                            }}
                                            onChange={(newValue) => {
                                                formik.setFieldValue("bidEndDate", newValue);
                                                if (newValue && formik.values.bidStDate && newValue < formik.values.bidStDate) {
                                                    formik.setFieldError("bidEndDate", "End Date cannot be earlier than Start Date");
                                                } else {
                                                    formik.setFieldError("bidEndDate", undefined);
                                                }
                                            }}
                                        />
                                    </div>
                                </LocalizationProvider>

                                <div className="col-12 text-end">
                                    <LoadingButton
                                        variant="text"
                                        color="primary"
                                        className="me-3 text-capitalize"
                                        size="small"
                                        onClick={clear}
                                    >
                                        Clear
                                    </LoadingButton>
                                    <LoadingButton
                                        loading={auctionLoading}
                                        variant="outlined"
                                        color="primary"
                                        className="text-capitalize"
                                        size="small"
                                        type="submit"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            console.log('Submit button clicked');
                                            formik.handleSubmit();
                                        }}
                                    >
                                        Submit
                                    </LoadingButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default FilterAuctionCell;
