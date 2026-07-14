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
import { PETable } from "../../../../components/RFQ/PETable";

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

const ItemDetails = ({
    rfqItemsList,
    linewiseItemLowest,
    vendorItemAnalysis,
    rfqheaderdetails,
    openQuotes,
    showcommercial = true, // Default to true to always show commercial terms
    handleLoadingFactorNew,
    handleSupplierAction,
    handleLoadingFactorClick,
    currentStage,
    stagearray,
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
            return <div>{params.row.serialNo}</div>;
            },
        },
        {
            field: "itemCode",
            headerName: "Item Code",
            flex: 1,
            minWidth: 150,
            renderCell: (params) =>
            params.row.isDetailRow ? null : (
                <div className="content-text">{params.row.itemCode || "N/A"}</div>
            ),
        },
        {
            field: "itemName",
            headerName: "Item Name",
            flex: 2,
            minWidth: 200,
            renderCell: (params) => {
                if (params.row.isDetailRow && params.row.detailType === "commercial") {
                    const comm = params.row.commercialData;
                    return (
                        <div className="content-text detail-row-content">
                        <span className="detail-row-label">{comm.Name}:</span>
                        </div>
                    );
                }
                return <div className="content-text">{params.row.itemName}</div>;
            // return <div className="content-text">{params.row.itemName}</div>;
            },
        },
        {
            field: "quantity",
            headerName: "Quantity",
            flex: 1,
            minWidth: 150,
            renderCell: (params) => 
                 params.row.isDetailRow ? null : (
                <div className="content-text">{`${thousands_separators(params.row.quantity)} (${params.row.uom})`}</div>
            ),
            // return (
            //     <div className="content-text">
            //         {`${thousands_separators(params.row.quantity)} ${params.row.uom}`}
            //     {/* {thousands_separators(params.row.quantity)} ({params.row.uom}) */}
            //     </div>
            // );
            
        },
        {
            field: "supplierPrice",
            headerName: "Supplier Price",
            flex: 1,
            minWidth: 180,
            renderCell: (params) =>{
                if (params.row.isDetailRow && params.row.detailType === "commercial") {
                    const comm = params.row.commercialData;
                    return (
                        <div className="content-text detail-row-content">
                        {comm.EnterCommValue}
                        {comm.valuetype === "Percentage" ? "%" : ""}
                        </div>
                    );
                }
                return <div className="content-text">{thousands_separators(params.row.supplierPrice)}</div>;
            },
            
        },
        {
            field: "amount",
            headerName: "Amount",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                return (
                    <div className="content-text">
                    {thousands_separators(params.row.amount)}
                    </div>
                )
            }
        },
        {
            field: "vendorRemarks",
            headerName: "Remarks",
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                
                return (
                    <div className="content-text">{params.row.vendorRemarks}</div>
                )
            }
        },
        {
            field: "actions",
            headerName: "",
            flex: 1,
            minWidth: 120,
            sortable: false,
            renderCell: (params) => {
                if (params.row.isDetailRow) return null;

                return (
                    <div className="d-flex align-items-center gap-2">
                        {/* Accordion button */}
                        <Tooltip title={expandedRows[params.row?.id || params.row?.itemId] ? "Collapse Details" : "Expand Details"}>
                            <IconButton
                                size="small"
                                onClick={() => handleRowExpand(params.row?.id || params.row?.itemId)}
                                className="text-secondary"
                            >
                                {expandedRows[params.row?.id || params.row?.itemId] ?
                                    <HiOutlineChevronUp /> : <HiOutlineChevronDown />
                                }
                            </IconButton>
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        if (vendorItemAnalysis) {
            
            const supplierPrices = vendorItemAnalysis?.map((v) => {
                return {
                    ...v,
                    vendorItemAnalysis: JSON.parse(v?.vendorItemAnalysis), // Only include the fields you need
                };
            });
            if(supplierPrices[0]?.vendorItemAnalysis){
                setSupplierPrices(supplierPrices[0].vendorItemAnalysis);
            }
            if(supplierPrices[0]?.vendorCommercial){
                setSupplierCommercials(supplierPrices[0].vendorCommercial);
            }
        }
    }, [vendorItemAnalysis]);

    const mergedData = rfqItemsList.map((item, index) => {
        const extra = supplierPrices.find(d => d.id === item.id);
        const supplierPrice = extra ? parseFloat(extra.SupplierPrice) : 0;
        const quantity = item.quantity || 0;
        const vendorRemarks = extra ? extra.VendorRemarks : "";
        return {
            id: item.id,
            serialNo: index + 1,
            itemCode: item.itemCode || "N/A",
            itemName: item.itemName,
            quantity: quantity,
            uom: item.uom,
            supplierPrice: supplierPrice,
            amount: supplierPrice * quantity,
            vendorRemarks: vendorRemarks,
            CommercialItem: extra?.CommercialItem
        };
    });
    const getExpandedRowId = (row) => {
        return row?.id;
    };
    const handleRowExpand = (rowId) => {
        console.log('Expanding row:', rowId);
        console.log('Current expanded rows:', expandedRows);
        setExpandedRows(prev => {
            const newState = {
                ...prev,
                [rowId]: !prev[rowId]
            };
            console.log('New expanded rows state:', newState);
            return newState;
        });
    };

    const createExpandedRows = () => {
        const expandedRowsList = [];
        
        mergedData?.forEach((item, index) => {
            const serialNo = index + 1;
            const rowId = item?.id || item?.itemId;

            // Add the main row
            expandedRowsList.push({
            ...item,
            serialNo: serialNo,
            isDetailRow: false,
            detailType: null,
            parentId: rowId,
            originalIndex: index,
            });
            // Add detail rows if expanded
            if (expandedRows[rowId]) {
            // If item has CommercialItem list, map them into detail rows
            if (Array.isArray(item.CommercialItem) && item.CommercialItem?.length > 0) {
                item.CommercialItem
                .filter((comm) => comm.IsNetPrice != "Y") 
                .forEach((comm, commIndex) => {
                expandedRowsList.push({
                    id: `detail-${rowId}-${commIndex}`,
                    serialNo: "",
                    isDetailRow: true,
                    detailType: "commercial",
                    parentId: rowId,
                    parentData: item,
                    commercialData: comm, // attach this commercial term
                    originalIndex: index,
                    itemCode: "",
                    itemName: "",
                });
                });
            } else {
                // Fallback (if no commercial items exist, keep a single detail row)
                expandedRowsList.push({
                id: `detail-${rowId}`,
                serialNo: "",
                isDetailRow: true,
                detailType: "combined",
                parentId: rowId,
                parentData: item,
                originalIndex: index,
                itemCode: "",
                itemName: "",
                });
            }
            } else {
            console.log(`NOT adding detail rows for item ${rowId} - not expanded`);
            }
        });

        console.log("Final expanded rows list:", expandedRowsList);
        return expandedRowsList;
    };

    return (
        <div className="product-cell-container">
            <div className="product-cell-datagrid-wrapper">
                <PETable
                    rows={createExpandedRows()}
                    columns={columns}
                    getRowId={getExpandedRowId}
                    pageSize={10}
                    getRowHeight={(params) => params.model.isDetailRow ? 45 : 40}
                    columnHeaderHeight={40}
                    className="consistent-datagrid bg-white borderless-datagrid"
                    disableColumnMenu
                    disableColumnSorting
                    sortingOrder={[]}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                    autoHeight
                />
            </div>
        </div>
    );
};

export default ItemDetails;
