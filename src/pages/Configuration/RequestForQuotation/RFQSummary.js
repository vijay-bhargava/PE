import React, { useState, useEffect, useCallback } from "react";
import ExpandableTextCell from "../../../components/ExpandableTextCell";
import { useFormik } from "formik";
import * as yup from "yup";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useStateValue } from "../../../store";
import {
    Autocomplete,
    ButtonGroup,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    Input,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    createFilterOptions,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import {
    ChevronLeft,
    ChevronRight,
    CommentOutlined,
    Close,
    ExpandLess,
    ExpandMore,
    ExpandMoreOutlined,
    InfoOutlined,
    KeyboardDoubleArrowLeft,
    PushPinOutlined,
} from "@mui/icons-material";
import {
    HiChevronDown,
    HiDotsVertical,
    HiOutlineX,
} from "react-icons/hi";
import { api, ApiClient } from "../../../Apiclient";
import { toast } from "react-toastify";
import {
    downloadFilesOnAzure,
    findStringByValueFromArray,
    getFileName,

    sumArray,
} from "../../../utils/common";
import {
    buildQueryParams,
    formatDateViaLocale2,
    formatDateViaLocale,
    formatDateViaTime,
    formattimeoption,
    renderHtmlAsText,
} from "../../../utils/common/utility";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { GrAttachment } from "react-icons/gr";
import { FastApiClient } from "../../../FastApiClient";
import SupplierAttachmentCell from "./SupplierAttachmentCell";
import SupplierTechnicalResponses from "../../../components/Reports/SupplierTechnicalResponses";
import RFQActionDrawer from "../../../components/Reports/RFQActionDrawer";
import { FaComment } from "react-icons/fa";
import WhiteTooltip from "../../../components/whitetooltip";
import EventQuestionScreen from "../../../components/Event/EventQuestionScreen";
import { id } from "date-fns/locale";
import EventFinancialComparativeScreen from "../../../components/Event/EventFinancialComparativeScreen";
import EventCommercialComparativeScreen from "../../../components/Event/EventCommercialComparativeScreen";
import LockLoader from "../../../components/Loader/LockLoader";
import { MRT_ToggleFullScreenButton } from "material-react-table";
import EventSuppliers from "../../../components/Event/EventSuppliers";

const RFQSummary = ({ props }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null); //state to handle  version dropdown open and close
    const [
        { atoken, customerid, customersuffix, userDetail },
        dispatch, thousands_separators
    ] = useStateValue();
    const [data, setData] = useState(props.EventHeaderDetails);
    const [showTable, setShowTable] = useState(true);
    const [inputList, setInputList] = useState(props.inputList);
    

    return (
        <>
            <div className="overflow-y-auto max-h-70vh">
                <div className={``}>
                    <div className="row mt-2">
                        <div className="col-12 col-md-12">
                            <div className="f18" style={{ color: "black" }}>
                                <span className="f14 mb-1" style={{ fontWeight: "600" }}>RFQ Subject: </span>
                                <ExpandableTextCell text={data?.subject} fontSize={14} />
                            </div>
                        </div>
                        <hr className="mt-0 mb-2" />
                        <div className="row mt-3">
                            <div className="col-12 col-md-4">
                                <div>
                                    <div>
                                        <span
                                            className="f14   mb-1"
                                            style={{
                                                fontWeight: "600",
                                                color: "black",
                                            }}>
                                        Start Date/Time :
                                        </span>{" "}
                                        <span
                                            className="f14 mb-2"
                                            style={{
                                                fontWeight: "400",
                                            }}
                                        >                                       
                                        {formatDateViaLocale(data?.startDate,userDetail)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div>
                                    <div>
                                        <span className="f14 mb-1" style={{fontWeight: "600",color: "black",}}>
                                        End Date/Time :
                                        </span>{" "}
                                        <span className="f14 mb-2" style={{fontWeight: "400",}}>
                                        {formatDateViaLocale(data?.endDate,userDetail)}
                                        </span>
                                    </div>
                                </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div>
                                        <div>
                                            <span className="f14 mb-1" style={{fontWeight: "600",color: "black",}}>
                                                Requisitioner:
                                            </span>{" "}
                                            <span className="f14 mb-2"style={{fontWeight: "400",}}>
                                                {data?.requisitioner}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {data?.RFQType =="closed" && 
                                    <div className="col-12 col-md-4">
                                        <div>
                                            <div>
                                                <span className="f14 mb-1" style={{fontWeight: "600",color: "black",}}>
                                                    Bid Open Date/Time:
                                                </span>{" "}
                                                <span className="f14 mb-2" style={{fontWeight: "400",}}>
                                                    {data?.bidOpeningDate ? formatDateViaLocale(data?.bidOpeningDate,userDetail):""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>}
                                <div className="col-12 col-md-4">
                                    <div>
                                        <div>
                                            <span className="f14 mb-1"style={{fontWeight: "600",color: "black",}}>
                                                Sealed Bid:
                                            </span>{" "}
                                            <span className="f14 mb-2"style={{fontWeight: "400",}}>
                                                {data?.RFQType =="closed"? "Yes" : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div>
                                        <div>
                                            <span className="f14 mb-1"style={{fontWeight: "600",color: "black",}}>
                                                BOQ:
                                            </span>{" "}
                                            <span className="f14 mb-2"style={{fontWeight: "400",}}>
                                                {data?.boqReq ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {data?.baseCurrency == (userDetail?.defaultCurrency ?? "INR") && (
                                    <div className="col-12 col-md-4">
                                        <div>
                                            <span className="f14 mb-1"style={{fontWeight: "600",color: "black",}}>
                                                {" "}
                                                Base Currency:
                                            </span>{" "}
                                            <span className="f14 mb-2"style={{fontWeight: "400",}}>
                                            </span>
                                            <span className="f14 mb-2"style={{fontWeight: "400",}}>
                                                {userDetail?.defaultCurrency ? `${userDetail?.defaultCurrency}`: `INR`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {data?.IsMultiCurrency && (
                                    <>
                                        <div className="col-12 col-md-4">
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span
                                                    className="f14 mb-1"
                                                    style={{
                                                        fontWeight: "600",
                                                        color: "black",

                                                    }}
                                                >
                                                    Currency Mode:
                                                </span>
                                                <span
                                                    className="f14 mb-1  ms-1"
                                                    style={{
                                                        fontWeight: "400",

                                                    }}
                                                >
                                                    Multi Currency
                                                </span>
                                                <IconButton
                                                    onClick={() => setShowTable(!showTable)}
                                                    className="p-0"
                                                >
                                                    {showTable ? (
                                                        <ExpandLess />
                                                    ) : (
                                                        <ExpandMore />
                                                    )}
                                                </IconButton>
                                            </div>
                                            {showTable && (
                                                <div className='d-flex align-items-center'>
                                                <TableContainer  className='d-block'>
                                                    <Table
                                                        size="small"
                                                        className='d-block'
                                                        aria-label="a dense table"
                                                    >
                                                        <TableHead className='d-flex align-items-center justify-content-between'>
                                                            <TableRow >
                                                                <TableCell className='ps-0'>Currency</TableCell>
                                                                <TableCell align="right">
                                                                    Conversion Factor
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {inputList.map((row) => (
                                                                <TableRow
                                                                    key={row.name}
                                                                    sx={{
                                                                        "&:last-child td, &:last-child th":
                                                                        {
                                                                            border: 0,
                                                                        },
                                                                    }}
                                                                >
                                                                    <TableCell
                                                                        scope="row"
                                                                        className='ps-0'
                                                                        style={{width:"160px"}}
                                                                    >
                                                                        {row?.baseCurrency}
                                                                    </TableCell>
                                                                    <TableCell align="right" className=''>
                                                                        {row?.currencyConversion}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>

                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                <div className="col-12 col-md-4">
                                    <div>
                                        <div>
                                            <span
                                                className="f14   mb-1"
                                                style={{
                                                    fontWeight: "600",
                                                    color: "black",

                                                }}
                                            >
                                                Purchase Org:
                                            </span>{" "}
                                            <span
                                                className="f14 mb-2"
                                                style={{
                                                    fontWeight: "400",

                                                }}
                                            >
                                                {props.purchOrgId}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div>
                                        <div>
                                            <span
                                                className="f14   mb-1"
                                                style={{
                                                    fontWeight: "600",
                                                    color: "black",

                                                }}
                                            >
                                                Purchase Group:
                                            </span>{" "}
                                            <span
                                                className="f14 mb-2"
                                                style={{
                                                    fontWeight: "400",

                                                }}
                                            >
                                                {props.purchGrpId}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <hr className="mt-0 mb-4" />
                        <div className="col-12 col-md-12  mb-3">
                            <div
                                className="f14 mb-1"
                                style={{
                                    color: "black",
                                    fontWeight: "600",

                                }}
                            >
                                RFQ Description *
                            </div>
                            <textarea
                            className='w-100 f13 rounded formulaEditor'
                            readOnly
                            rows={4}
                            style={{ resize: 'none' }}
                            placeholder='RFQ Description'
                            value={data?.description?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
                        />
                        </div>
                        <div className="col-12">
                            <div
                                className="f14 mb-1"
                                style={{
                                    color: "black",
                                    fontWeight: "600",

                                }}
                            >
                                Terms & Conditions
                            </div>
                            <textarea
                            className='w-100 f13 rounded formulaEditor'
                            readOnly
                            rows={4}
                            style={{ resize: 'none' }}
                            placeholder='Terms & Conditions'
                            value={data?.termandcondition?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
                        />
                        </div>	
                    </div>
                </div>
                <div className="mt-0">
                    <EventSuppliers
                        updatesupplieronloading={props.updatesupplieronloading}
                        selectedSupplier={props.selectedSupplier}
                        stagearray={props.stagearray}
                        currentStage={props.currentStage}
                        handleSelectedSupplier={props.handleSelectedSupplier}
                        handleLoadingFactorClick={props.handleLoadingFactorClick}
                        handleSupplierAction={props.handleSupplierAction}
                        clearSelectedSupplier={props.clearSelectedSupplier}
                        pageSS={props.pageSS}
                        pageCount={props.pageCount}
                        totalpageSS={props.totalpageSS}
                        handlePaginationSS={props.handlePaginationSS}
                        issupplierraccesslevel={props.issupplierraccesslevel}
                        CurrentVersion={props.CurrentVersion}
                        versionhistory={props.versionhistory}
                        permissionManager={props.permissionManager}
                    />
                </div>
            </div>
        </>
    );
};

export default RFQSummary;


