// src/DetailsReport.js
import React, { useEffect, useState } from 'react';
import {
    Tabs,
    Tab, Paper, Typography, Button, Collapse, Tooltip, Menu, MenuItem, IconButton, Box, Drawer, TextField, InputAdornment
} from '@mui/material';
import { Modal, Table } from "react-bootstrap";
import { BackButton } from '../../../utils/common/component'; // Adjust the path as needed
import { Card } from 'react-bootstrap';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApiClient } from '../../../Apiclient';
import { buildQueryParams } from '../../../utils/purchaseRequest';
import { useStateValue } from '../../../store';
import { formatDateViaLocale, renderHtmlAsText } from '../../../utils/common/utility';
import { getPayloadWithStage, menuactionlist, sumArray } from '../../../utils/common';
import SupplierAttachmentCell from './SupplierAttachmentCell';
import { HiOutlineX } from 'react-icons/hi';
import AttachmentWorkFlow from '../../BaseCells/attachmentworkflow';
import { toast } from 'react-toastify';
import * as yup from "yup";
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import EventQuestionScreen from '../../../components/Event/EventQuestionScreen';
import EventFinancialComparativeScreen from '../../../components/Event/EventFinancialComparativeScreen';
import EventCommercialComparativeScreen from '../../../components/Event/EventCommercialComparativeScreen';

const EERFQIndividualReport = ({ accessLevel }) => {
    const navigate = useNavigate();
    const [{ atoken, rtoken, customerid, customersuffix, roleClaims, userDetail }, dispatch, thousands_separators] =
        useStateValue();
    const apiClient = new ApiClient(customersuffix);
    const [anchorEl, setAnchorEl] = useState(null);

    const { eventid, supplierid } = useParams();
    const [expanded, setExpanded] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);  // Track expanded rows

    const [version, setVersion] = useState("1");
    const [open, setOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const [activityId, setActvityId] = useState(0);
    const [stageValue, setStageValue] = useState('');
    const [actionType, setActionType] = useState("");
    const [stagelist, setStageList] = useState(null);
    const [versionhistory, setVersionhistory] = useState(null)
    const [rfqheader, setRFQHeader] = useState(null)
    const [supplierdetails, setSupplierDetails] = useState(null)
    const [rfqItemsList, setrfqItemsList] = useState([]);
    const [totalItemSum, setTotalItemSum] = useState(0)
    const [rfqItemCommercialList, setRfqItemCommercialList] = useState([]);
    const [rfqOthersCommercialList, setrfqOthersCommercialList] = useState([]);
    const [QuestionResponses, setQuestionResponses] = useState([])
    const [linewiseItemLowest, setLineWiseItemLowest] = useState([]);
    const [rfqQuestionList, setRFQQuestionList] = useState([])
    const [openLoadingF, SetLoadingF] = useState(false);
    const handleCloseLoadingF = () => SetLoadingF(false);
    const [selectedLoadingF, SetSelectedLoadingF] = useState(null);
    const handleOpenLoadingF = (v) => {
        SetLoadingF(true);
        SetSelectedLoadingF(v);
    };
    const [openPoDetail, setOpenPoDetail] = useState(false);
    const [selectedpodetails, setSelectedPODetails] = useState(null);
    const handleOpenPoDetail = (v) => {

        setOpenPoDetail(true);
        setSelectedPODetails(v);
    };
    const handleClosePoDetail = () => setOpenPoDetail(false);
    const [value, setValue] = useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    useEffect(() => {

        const params = new URLSearchParams(searchParams);
        const actionType = params.get("ActionType");
        const ActivityId = params.get("ActivityId");
        const StageValue = params.get("Stage");
        setActvityId(ActivityId ?? 0);
        setActionType(actionType);
        setStageValue(StageValue ?? '');
    }, [searchParams]);














    //useeffect
    useEffect(() => {
        if (version) getComparativedetailsVersionWise()
    }, [version]);

    const getComparativedetailsVersionWise = async () => {
        await pullRFQHeaderDetails();
        await RFQcomparativeReport();
    }

    const pullRFQHeaderDetails = async () => {

        let VersionParam;
        if (version?.includes("x")) {
            VersionParam = version.split(".")[0];


        }
        else {
            VersionParam = version

        }
        var data = {
            Id: eventid,
            Version: parseInt(version),

        };
        if (version == 0) {
            delete data?.Version;
        }

        const queryParams = buildQueryParams(data);
        const res = await apiClient.getres(
            `/api/RFQManage/FindById?${queryParams}`,
            atoken
        );
        // console.log('request id pullRFQItemServiceFind', data);
        if (res) {
            const result = Array.isArray(res?.data?.result) ? res.data.result : [];
            const header = result?.[0];
            setRFQHeader(result);

            if (!header) {
                setrfqItemsList([]);
                setTotalItemSum(0);
                setRfqItemCommercialList([]);
                setRFQQuestionList([]);
                setrfqOthersCommercialList([]);
                return;
            }

            if (header?.versionhistory?.length !== versionhistory?.length) {
                setVersionhistory(header.versionhistory);
            }

            const rfqParameters = Array.isArray(header?.rfqParameters) ? header.rfqParameters : [];
            setrfqItemsList(rfqParameters);
            const itemsumarr = sumArray(rfqParameters.map(x => x.targetPrice * x.quantity));
            setTotalItemSum(itemsumarr);

            setRfqItemCommercialList(
                (Array.isArray(header?.rfqItemCommercial) ? header.rfqItemCommercial : []).filter((x) => x.level === "item")
            );
            setRFQQuestionList(Array.isArray(header?.rfqQuestionMaster) ? header.rfqQuestionMaster : []);

            setrfqOthersCommercialList(
                Array.isArray(header?.rfqPackageCommercial) ? header.rfqPackageCommercial : []
            );
        }
    };


    const RFQcomparativeReport = async () => {

        let VersionParam;
        let finalversionparam = false;
        if (version?.includes("x")) {
            VersionParam = version.split(".")[0];
            finalversionparam = true

        }
        else {
            VersionParam = version


        }
        const reqdata = {
            rfqId: parseInt(eventid),
            Version: VersionParam,
            finalversion: finalversionparam
        };
        const queryParams = buildQueryParams(reqdata);
        const res = await apiClient.getres(
            `/api/RFQManage/RFQBenchmarking?${queryParams}`,
            atoken
        );
        if (res.status === 200) {
            
            let vendorItemAnalysisdata = res.data;
            if (!supplierid) {
               
                setSupplierDetails(vendorItemAnalysisdata);
            }
            else {
                // when supplierid then filter his data only				
                const filteredsupplier = vendorItemAnalysisdata?.filter(x => x.id == supplierid)
                vendorItemAnalysisdata = filteredsupplier;
                setSupplierDetails(vendorItemAnalysisdata);
            }


            //in order to segregate supplierquestionresponses
            if (vendorItemAnalysisdata && vendorItemAnalysisdata?.length > 0) {

                const vendorQuestionAns = vendorItemAnalysisdata?.map((v) => {

                    let updatedvendorquestion;
                    if (version != 0)
                        updatedvendorquestion = JSON.parse(v?.vendorQuestionAns)?.filter(x => x.version == version)
                    else {
                        updatedvendorquestion = JSON.parse(v?.vendorQuestionAns)?.filter(x => x.version == currentVersion)
                    }
                    // Destructure only the fields you need
                    return {
                        ...v,
                        vendorQuestionAns: updatedvendorquestion,  // Only include the fields you need
                    };
                });
                setQuestionResponses(vendorQuestionAns);
            }




        }
    };









    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleVersionClick = (v) => {
        setVersion(v ?? 0);
        setAnchorEl(null);
        console.log(`Selected Version: ${v}`);
    };
    const [currentVersion, setCurrentVersion] = useState(0);

    const [state, setState] = useState({
        openInvoiceApproved: false,
    });

    const toggleApprover = (anchor, open) => {

        setState({ ...state, [anchor]: open });

    };

    const validationSchemaApprover = yup.object().shape({
        status: yup.string().required("status is required"),
        approveComment: yup.string().when('status', {
            is: 'Rejected',
            then: (schema) => schema.required("Reason is required for rejection"),
            otherwise: (schema) => schema.notRequired()
        })
    });
    const [loading, setLoading] = useState(false);
    const formik_ApproveReject = useFormik({
        enableReinitialize: true,
        initialValues: {
            rfqId: parseInt(eventid),
            status: "Approved",
            approveComment: "",
            activityId: parseInt(activityId),
            startDate: null,
            endDate: null
        },
        validationSchema: validationSchemaApprover,
        onSubmit: async (values) => {
            setLoading(true)
            //no need to send startdate and enddate in other case
            delete values?.startDate
            delete values?.endDate
            const currentDate = new Date();







            const datapayload = getPayloadWithStage(
                "currentStage",
                stageValue,
                stagelist,
                values,
                "currentStage"
            );

            const res = await apiClient.postres(
                `/api/RFQManage/${eventid}/RFQEventApproval`,
                datapayload,
                atoken
            );
            if (res) {
                toast.success(`Action taken successfully`, {
                    toastId: "supplieraction_error"
                });
                navigate(`/app`);
            }



            setLoading(false)
        },
    });

    return (
        <div>
            {/* Header with Back Button */}
            <div className="d-flex justify-content-between minh50px align-items-center bg-white p-2 border-bottom">
                <BackButton title="RFQ Report Details" />
                <div className='action-wrap'>
                    {actionType && <Button type="button" size="small" className="p-2 pt-1 pb-1 me-2" variant="contained" onClick={() => toggleApprover("openInvoiceApproved", true)}>
                        <span className="text-capitalize">Action</span>
                    </Button>}

                    <AttachmentWorkFlow
                        eventtype={`RFQ`}
                        eventid={eventid}
                        action={false}
                        handleattachmentforevent={() => {

                        }}
                    />
                </div>
            </div>

            {/* Accordion Component */}
            <div className='custom-fix'>
                <Card className='mt-2 mx-1'>
                    <Card.Header className="d-flex justify-content-between bgheaderCards align-items-center">
                        <div className="col-md-9">
                            <div className="row justify-content-between">
                                <div className="text-lg col-md-12 text-white font-bold">RFQ Report Details</div>
                            </div>
                        </div>
                        <div className="col-md-3 ps-5 text-end d-flex justify-content-end align-items-center">
                            <div className="  me-0 pe-0 d-flex justify-content-end align-items-center text-end me-0 pe-0 ">

                                <Button
                                    aria-controls={Boolean(anchorEl) ? "simple-menu" : undefined}
                                    aria-haspopup="true"
                                    onClick={handleClick}
                                    variant="text"
                                    style={{ color: "white" }}
                                >
                                    <Tooltip title={"Version Control"}>
                                        <div
                                            style={{
                                                fontSize: "0.7125rem",
                                                color: "white",
                                                fontWeight: "500",
                                            }}
                                        >
                                            {version != 0 ? `Version ${version} X ` : `Final Version`}
                                            <ExpandMore />
                                        </div>
                                    </Tooltip>
                                </Button>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    {Array?.from({ length: currentVersion + 1 })?.map((_, i) => {

                                        if (i != 0) {
                                            return (<MenuItem onClick={() => handleVersionClick(i)}>Version {i}</MenuItem>)
                                        }

                                    })}



                                </Menu>
                            </div>
                            <Button
                                variant="standard"
                                className="cardBtn"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? <ExpandLess className="text-white" /> : <ExpandMore className="text-white" />}
                            </Button>
                        </div>
                    </Card.Header>

                    {/* Collapse to Show Expanded Information */}
                    <Collapse in={expanded}>
                        <Card.Body>
                            <div className='row mx-1'>
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Subject:</div>
                                    <div className='f12 fw400'>
                                        {rfqheader[0]?.subject ?? ""}
                                    </div>
                                </div>
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Ref No:</div>
                                    <div className='f12 fw400'>
                                        {rfqheader[0]?.refEventType ? `${rfqheader[0]?.refEventType}:${rfqheader[0]?.eventRef}` : "N/A"}
                                    </div>
                                </div>


                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Currency: </div>
                                    <div className='f12 fw400'>
                                        {rfqheader[0]?.baseCurrency}
                                    </div>
                                </div>
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Conversion Rate: </div>
                                    <div className='f12 fw400'>
                                        1
                                    </div>
                                </div>
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Start Date: </div>
                                    <div className='f12 fw400'>
                                        {rfqheader[0]?.startDate ? formatDateViaLocale(
                                            rfqheader[0]?.startDate,
                                            userDetail
                                        ) : ""}
                                    </div>
                                </div>
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>End Date:</div>
                                    <div className='f12 fw400'>
                                        {rfqheader[0]?.endDate ? formatDateViaLocale(
                                            rfqheader[0]?.endDate,
                                            userDetail
                                        ) : ""}
                                    </div>
                                </div>

                                {supplierdetails?.CompanyName && <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Supplier: </div>
                                    <div className='f12 fw400'>
                                        {supplierdetails?.CompanyName}
                                    </div>
                                </div>}
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>User: </div>
                                    <div className='f12 fw400'>
                                        {supplierdetails?.emailId}
                                    </div>
                                </div>
                                <div className='col-md-3 ms-0 ps-0'>
                                    <div className='f14 fw500'>Supplier Remark: </div>
                                    <div className='f12 fw400'>
                                        {supplierdetails?.remarks?.length > 20 ?
                                            <Tooltip title={supplierdetails.remarks}>
                                                {supplierdetails?.remarks ? `${supplierdetails.remarks.slice(0, 20)}...` : '-'}
                                            </Tooltip> : supplierdetails?.remarks ?? "N/A"}
                                    </div>
                                </div>
                                <div className='col-md-12 ms-0 ps-0'>
                                    <div className='f14 fw500'>Description: </div>
                                    <div className='f12 fw400'>
                                        {renderHtmlAsText(rfqheader[0]?.description)}
                                    </div>
                                </div>
                                <div className='col-md-12 ms-0 ps-0'>
                                    <div className='f14 fw500'>Terms & Condition: </div>
                                    <div className='f12 fw400'>
                                        {renderHtmlAsText(rfqheader[0]?.termandCondition)}
                                    </div>
                                </div>

                            </div>
                        </Card.Body>
                    </Collapse>
                </Card>
                <div className="container-fluid mt-2">
                    <div className="row justify-content-between align-items-baseline">
                        <div className="col-md-10 mb-2">
                            <div className={"col-12 col-md-12 col-lg-12 mb-2  "}>
                                <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>

                                    <Tabs
                                        onChange={handleChange}
                                        value={value}
                                        textColor="primary"
                                        indicatorColor="primary"
                                        aria-label=""
                                        selectionFollowsFocus
                                        className="ps-2 tabstheme scrollable-container"

                                    >
                                        {/* {accessLevel?.find(x => x.claimType == "Item Commercial Responses")?.claimValue?.Read != "N" && <Tab value={0} className="text-capitalize f12 fw500" label="Item Commercial Responses" />}
                                     {accessLevel?.find(x => x.claimType == "Package Commercial Responses")?.claimValue?.Read != "N" && <Tab value={1} className="text-capitalize f12 fw500" label="Package Commercial Responses" />} */}

                                        {accessLevel?.find(x => x.claimType == "Item Commercial Responses")?.claimValue?.Read != "N" && <Tab value={0} className="text-capitalize f12 fw500" label="Financial Responses" />}
                                        {accessLevel?.find(x => x.claimType == "Question Responses")?.claimValue?.Read != "N" && <Tab value={1} className="text-capitalize f12 fw500" label="Commercial Responses" />}
                                        {accessLevel?.find(x => x.claimType == "Question Responses")?.claimValue?.Read != "N" && <Tab value={2} className="text-capitalize f12 fw500" label="Technical Responses" />}

                                        {/* <Tab className="text-capitalize f12 fw500" label="Other Attachments" /> */}

                                        {/* <Tab
                                     className="text-capitalize"
                                     label="Item/Service Wise Comparision"
                                 /> */}
                                    </Tabs>
                                </Box>

                            </div>
                        </div>

                    </div>


                    {value == 0 &&
                        (
                            <>

                                <EventFinancialComparativeScreen
                                    rfqItemsList={rfqItemsList}
                                    linewiseItemLowest={linewiseItemLowest}
                                    vendorItemAnalysis={supplierdetails}
                                    rfqheaderdetails={rfqheader}
                                />

                            </>
                        )
                    }
                    {value == 1 &&
                        (
                            <>

                                <EventCommercialComparativeScreen
                                    rfqItemsList={rfqItemsList}

                                    vendorItemAnalysis={supplierdetails}

                                    rfqPackageCommercial={rfqheader[0]?.rfqPackageCommercial?.filter(x => x.valuetype != "Percentage" && x.valuetype != "Currency")}
                                />

                            </>
                        )
                    }

                    {value == 2 ? (

                        <EventQuestionScreen
                            props={{
                                eventid: eventid,
                                eventtype: "RFQ",
                                librarytype: "QuestionLibrary",
                                action: false,
                                Version: currentVersion,
                                questionresponses: QuestionResponses,
                                callback: () => {
                                    RFQcomparativeReport();
                                }
                            }}

                        />


                    ) : (
                        <></>
                    )}





                    <>






                        {/* {PO modal} */}
                        <Modal
                            size="md"
                            show={openPoDetail}
                            backdrop="static"
                            // keyboard={false}
                            //  className=""
                            // backdropClassName=""
                            centered
                            contentClassName="border-0 rounded"
                            className="zindex1280"
                            backdropClassName="zindex1280"
                            onHide={() => handleClosePoDetail()}
                        >
                            <Modal.Header className="pt-2 pb-2 bgheaderCards">
                                <Modal.Title id="modal-heading">
                                    <div className="d-flex align-items-center f14 text-white">
                                        PO Details
                                    </div>
                                </Modal.Title>

                                <IconButton
                                    onClick={() => handleClosePoDetail()}
                                    size="small"
                                    edge="start"
                                >
                                    <HiOutlineX className="text-white" />
                                </IconButton>
                            </Modal.Header>
                            <Modal.Body className="p-0">
                                <div className="p-3">
                                    <div
                                        className="row"
                                        style={{
                                            paddingLeft: ".7rem",
                                            paddingRight: ".7rem",
                                            paddingTop: ".7rem",
                                        }}
                                    >
                                        {selectedpodetails?.poNumber && <Table striped bordered hover responsive className="mb-0 pb0">
                                            <thead>
                                                <tr>
                                                    {/* <th className="f12 fw500">SrNo.</th> */}
                                                    <th className="f12 fw500"> PO No</th>
                                                    <th className="f12 fw500">PO Date </th>
                                                    <th className="f12 fw500">Vendor Name</th>
                                                    <th className="f12 fw500">Unit Rate</th>
                                                    {/* <th className="f12 fw500">Po Value</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {/* <td className="f12 fw400">1</td> */}
                                                    <td className="f12 fw400">{selectedpodetails?.poNumber}</td>
                                                    <td className="f12 fw400">{selectedpodetails?.poDate}</td>
                                                    <td className="f12 fw400">{selectedpodetails?.poVendorName}</td>
                                                    {/* <td className="f12 fw400">{selectedpodetails?.poNumber}</td> */}
                                                    <td className="f12 fw400">
                                                        {selectedpodetails?.poUnitRate}{" "}
                                                        <Tooltip title={"Base Currency"}>
                                                            <span> {rfqheader && rfqheader[0]?.baseCurrency}  </span>
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>}
                                    </div>
                                </div>
                            </Modal.Body>
                        </Modal>
                        {/* {loading factor modal} */}
                        <Modal
                            size="md"
                            show={openLoadingF}
                            backdrop="static"
                            // keyboard={false}
                            //  className=""
                            // backdropClassName=""
                            centered
                            contentClassName="border-0 rounded"
                            className="zindex1280"
                            backdropClassName="zindex1280"
                            onHide={() => handleCloseLoadingF()}
                        >
                            <Modal.Header className="pt-2 pb-2 bgheaderCards">
                                <Modal.Title id="modal-heading">
                                    <div className="d-flex align-items-center f14 text-white">
                                        Loading Factor
                                    </div>
                                </Modal.Title>

                                <IconButton
                                    onClick={() => handleCloseLoadingF()}
                                    size="small"
                                    edge="start"
                                >
                                    <HiOutlineX className="text-white" />
                                </IconButton>
                            </Modal.Header>
                            <Modal.Body className="p-0">
                                <div className="p-3">
                                    <div
                                        className="row"
                                        style={{
                                            paddingLeft: ".7rem",
                                            paddingRight: ".7rem",
                                            paddingTop: ".7rem",
                                        }}
                                    >
                                        <Table striped bordered hover responsive className="mb-0 pb0">
                                            <thead>
                                                <tr>
                                                    <th className="f12 fw500">Reason</th>
                                                    <th className="f12 fw500"> Loading Type</th>
                                                    <th className="f12 fw500">Loading Factor</th>
                                                    <th className="f12 fw500">Loading Factor Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedLoadingF &&
                                                    selectedLoadingF?.map((loading) => {
                                                        return (
                                                            <>
                                                                <tr>
                                                                    <td className="f12 fw400">
                                                                        {loading?.FactorDesc}
                                                                    </td>
                                                                    <td className="f12 fw400">
                                                                        {loading?.FactorType == "P"
                                                                            ? "Percentage"
                                                                            : "Absolute"}
                                                                    </td>
                                                                    <td className="f12 fw400">
                                                                        {loading?.FactorType == "P"
                                                                            ? loading?.FactorPerc
                                                                            : ""}
                                                                    </td>

                                                                    <td className="f12 fw400">
                                                                        {loading?.LoadingAmount}{" "}
                                                                        <Tooltip title={"Base Currency"}>
                                                                            <span> {rfqheader && rfqheader[0]?.baseCurrency}  </span>
                                                                        </Tooltip>
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        );
                                                    })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </Modal.Body>
                        </Modal>





                    </>
                </div>



                <Paper className="t mx-1 rounded  mb-2">
                    <div className='row m-2'>
                        {/*supplier Attachment */}
                        {<div className=" pt-1 pb-1 f14 fw500" > <strong>Supplier Attachments</strong></div>}
                        <SupplierAttachmentCell
                            eventid={eventid}
                            eventtype={`RFQ`}
                            satoken={atoken}
                            vendorid={supplierdetails?.vendorId}
                            action={false}
                        />
                    </div>

                </Paper>

            </div>
            <React.Fragment key="technicalapprovermodal">
                <Drawer anchor="right" open={state["openInvoiceApproved"]}>
                    <form onSubmit={formik_ApproveReject.handleSubmit} autoComplete="off">
                        <Box sx={{ width: { xs: 280, sm: 150, md: 150, lg: 380 } }}>
                            <div className="flex flex-col">
                                <Box className="bgheaderCards">
                                    <div className="d-flex align-items-center justify-content-between pt-2 pb-2">
                                        <div className="ms-3 text-white">Approval Action</div>
                                        <div>
                                            <IconButton
                                                onClick={() => toggleApprover("openInvoiceApproved", false, [])}
                                                size="small"
                                                edge="start"
                                                sx={{ mr: 1 }}
                                            >
                                                <HiOutlineX className="f20 text-white" />
                                            </IconButton>
                                        </div>
                                    </div>
                                </Box>
                                <div className="h50px"></div>
                                <div className="p-3">
                                    <div className="row ">
                                        <div className="col-12 col-md-12 col-lg-12">
                                            <div className="mb-4 textblue f14"></div>
                                            <div className="row">
                                                <div className="col-12 col-md-4 col-lg-12 mb-4">
                                                    <TextField
                                                        id="isApproved"
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        name="isApproved"
                                                        select
                                                        className="mb-2"
                                                        fullWidth
                                                        size="small"
                                                        label="Status"
                                                        variant="outlined"
                                                        value={formik_ApproveReject.values?.status}
                                                        onChange={(e) => {

                                                            formik_ApproveReject.setFieldValue(
                                                                "status",
                                                                e.target.value
                                                            )
                                                        }

                                                        }

                                                        error={
                                                            formik_ApproveReject.touched.status &&
                                                            Boolean(formik_ApproveReject.errors.status)
                                                        }
                                                        helperText={
                                                            formik_ApproveReject.touched.status &&
                                                            formik_ApproveReject.errors.status
                                                        }
                                                    >
                                                        {menuactionlist?.filter(x => x.value != "Forwarded").map((x) => {

                                                            return (<MenuItem value={x.value}>{x.label}</MenuItem>)

                                                        })

                                                        }


                                                    </TextField>
                                                </div>

                                                <div className="col-12 col-md-4 col-lg-12 mb-4">
                                                    <TextField
                                                        id="approveComment"
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        multiline
                                                        rows={3}
                                                        name="approveComment"
                                                        className="w-100 f14"
                                                        size="small"
                                                        label="Comment "
                                                        variant="outlined"
                                                        inputProps={{ maxLength: 200 }}
                                                        value={formik_ApproveReject?.values?.approveComment}
                                                        onChange={(e) =>
                                                            formik_ApproveReject.setFieldValue(
                                                                "approveComment",
                                                                e.target.value
                                                            )
                                                        }
                                                        InputProps={{
                                                            endAdornment: formik_ApproveReject?.values?.approveComment && (
                                                                <InputAdornment position="end">
                                                                    <Typography variant="body2" color="textSecondary">
                                                                        {formik_ApproveReject?.values?.approveComment?.length}/200
                                                                    </Typography>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />

                                                </div>
                                                {/* {stageValue=="Under Pre Approval" && <LocalizationProvider
                                                    dateAdapter={AdapterDateFns}
                                                >
                                                    <div className="col-12 col-md-4 col-lg-12 mb-4">
                                                        <MobileDateTimePicker
                                                            variant="outlined"
                                                            label="Start Date/Time "
                                                            size="small"
                                                            name="startDateaction"
                                                            id="startDateaction"
                                                            //minDate={new Date()}
                                                            // minTime={new Date()}
                                                            value={formik_ApproveReject.values.startDate}
                                                            className="w-100 f14"
                                                            slotProps={{
                                                                textField: {
                                                                    variant: "outlined",
                                                                    size: "small",
                                                                    InputLabelProps: { shrink: true },
                                                                    error:
                                                                        formik_ApproveReject.touched.startDate &&
                                                                        Boolean(formik_ApproveReject.errors.startDate),
                                                                    helperText:
                                                                        formik_ApproveReject.touched.startDate &&
                                                                        formik_ApproveReject.errors.startDate,
                                                                },
                                                                actionBar: {
                                                                    actions: ["clear", "cancel", "accept"],
                                                                },
                                                            }}
                                                            onChange={(newValue) => {
                                                                formik_ApproveReject.setFieldValue(
                                                                    "startDate",
                                                                    newValue
                                                                );
                                                            }}
                                                            format={getDateFormatPatteronLocale("en-GB")}
                                                        // format="L hh:mm a"
                                                        />
                                                    </div>
                                                    <div className="col-12 col-md-4 col-lg-12 mb-4">
                                                        <MobileDateTimePicker
                                                            variant="outlined"
                                                            label="End Date/Time "
                                                            size="small"
                                                            name="endDateaction"
                                                            id="endDateaction"
                                                            //minDate={new Date()}
                                                            // minTime={new Date()}
                                                            value={formik_ApproveReject.values.endDate}
                                                            className="w-100 f14"
                                                            slotProps={{
                                                                textField: {
                                                                    variant: "outlined",
                                                                    size: "small",
                                                                    InputLabelProps: { shrink: true },
                                                                    error:
                                                                        formik_ApproveReject.touched.endDate &&
                                                                        Boolean(formik_ApproveReject.errors.endDate),
                                                                    helperText:
                                                                        formik_ApproveReject.touched.endDate &&
                                                                        formik_ApproveReject.errors.endDate,
                                                                },
                                                                actionBar: {
                                                                    actions: ["clear", "cancel", "accept"],
                                                                },
                                                            }}
                                                            onChange={(newValue) => {
                                                                formik_ApproveReject.setFieldValue(
                                                                    "endDate",
                                                                    newValue
                                                                );
                                                            }}
                                                            format={getDateFormatPatteronLocale("en-GB")}
                                                        // format="L hh:mm a"
                                                        />
                                                    </div>
                                                                
                                                </LocalizationProvider>} */}
                                            </div>

                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 text-end">
                                            <LoadingButton
                                                loading={loading}
                                                color="primary"
                                                size="medium"
                                                className="text-white text-capitalize mb-3 mr-3"
                                                variant="contained"
                                                type="submit"
                                            >
                                                <span>Save</span>
                                            </LoadingButton>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Box>
                    </form>
                </Drawer>
            </React.Fragment>


        </div>
    );
};

export default EERFQIndividualReport;
