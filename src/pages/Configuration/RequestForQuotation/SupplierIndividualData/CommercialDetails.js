import React, { useEffect, useState } from "react";
import { useStateValue } from "../../../../store";
import { HiOutlineTrash, HiPencilAlt, HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";

import {
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Collapse,
    tableCellClasses,
    MenuItem
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { DropdownButton, Modal } from "react-bootstrap";
import { CommentOutlined, InfoOutlined, ExpandMore, ExpandLess } from "@mui/icons-material";
import LaunchIcon from '@mui/icons-material/Launch';
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { HiDotsVertical, HiX } from 'react-icons/hi';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import { MdCloseFullscreen, MdFullscreen } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { formatDateViaLocale } from "../../../../utils/common/utility";
import { FaUserLock } from "react-icons/fa";
import EventQuoteSealed from "../../../../components/Event/EventQuoteSealed";
// import SupplierIndividualReport from "../../pages/Configuration/RequestForQuotation/SupplierIndividualReport";
import WhiteTooltip from '../../../../components/whitetooltip';
import { DataGrid } from "@mui/x-data-grid";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // [`&.${tableCellClasses.head}`]: {
  //   backgroundColor: 'rgb(26, 39, 66)',
  //   color: theme.palette.common.white,
  // },
  [`&.${tableCellClasses.root}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  border: `1px solid rgba(224, 224, 224, 1)`,
  // '&:nth-of-type(odd)': {
  //   backgroundColor: theme.palette.action.hover,
  // },
  // hide last border
  // '&:last-child td, &:last-child th': {
  //   border: 0,
  // },
}));

const CommercialDetails = ({
    rfqItemsList,
    vendorItemAnalysis,
    rfqPackageCommercial,
    rfqheaderdetails,
    openQuotes ,// Default to true to always show commercial terms
    vendorId,
    permissionManager
}) => {
    const [
        {
            atoken,
            rtoken,
            customerid,
            usertimezone,
            customersuffix,
            userdialingcode,
            roleClaims,
            userDetail,
        },
        dispatch,
        thousands_separators,
    ] = useStateValue();
    const { pageSlug, supplierid } = useParams();
    const navigate = useNavigate();
    const [supplierPrices,setSupplierPrices] = useState([]);
    const [supplierCommercials,setSupplierCommercials] = useState([]);
    const [expandedRows, setExpandedRows] = React.useState({});

    const columns = [
        {
            field: "serialNo",
            headerName: "S.No",
            width: 100,
            renderCell: (params) => {
            return <div>{params?.row?.serialNo}</div>;
            },
        },
        {
            field: "termName",
            headerName: "Term Name",
            flex: 1,
            minWidth: 150,
            renderCell: (params) =>
            {
                return (
                    <div className="content-text">{params?.row?.itemName || "N/A"}</div>
                )
            }

        },
        {
            field: "response",
            headerName: "Response",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <div className="content-text">
                    {params?.row?.response || "N/A"}
                    </div>
                )
            }
        },
    ];

    // useEffect(() => {
    //     if (vendorItemAnalysis) {
    //         
    //         const supplierPrices = vendorItemAnalysis?.map((v) => {
    //             return {
    //                 ...v,
    //                 vendorCommercial: JSON.parse(v?.vendorCommercial), // Only include the fields you need
    //             };
    //         });
    //         if(supplierPrices[0]?.vendorCommercial){
    //             setSupplierCommercials(supplierPrices[0]?.vendorCommercial?.filter(x => x.Valuetype != "Percentage" && x.Valuetype != "Currency"));
    //         }
    //     }
    // }, [vendorItemAnalysis]);

    useEffect(() => {
        if (!vendorItemAnalysis || !vendorItemAnalysis.length) return;

        const supplierPrices = vendorItemAnalysis.map((v) => {
            const parsedCommercial = v.vendorCommercial
            ? JSON.parse(v.vendorCommercial)
            : [];

            // ✅ Add Supplier Remarks as a new term
            const supplierRemarksTerm = {
            TermsId: "SUP_REMARKS",
            Name: "Other Remarks",
            Remarks: v.otherRemarks || "",   // or any remarks field you want
            FieldName: "supplier_remarks",
            Formulavalue: "",
            CommValue: "",
            EnterCommValue: "",
            Valuetype: "",
            IsNetPrice: "N"
            };

            return {
            ...v,
            vendorCommercial: [...parsedCommercial, supplierRemarksTerm]
            };
        });

        if (supplierPrices[0]?.vendorCommercial) {
            setSupplierCommercials(
            supplierPrices[0].vendorCommercial.filter(
                x => x.Valuetype !== "Percentage" && x.Valuetype !== "Currency"
            )
            );
        }
        }, [vendorItemAnalysis]);

    const mergedData = supplierCommercials?.map((item, index) => {
        return {
            id: item?.TermsId,
            serialNo: index + 1,
            itemName: item?.Name,
            response: item?.Remarks,
        };
    });

    return (
        <div className="product-cell-container">
            <div className="product-cell-datagrid-wrapper">
                <DataGrid
                    sx={{
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontSize: "14px",
                        },
                    }}
                    rows={mergedData}
                    columns={columns}
                    pageSize={10}
                    columnHeaderHeight={40}
                    className="consistent-datagrid bg-white borderless-datagrid"
                    disableRowSelectionOnClick
                    disableColumnMenu
                    disableColumnSorting
                    sortingOrder={[]}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    autoHeight
                    hideFooterSelectedRowCount
                />
            </div>
        </div>
    );
};

export default CommercialDetails;
