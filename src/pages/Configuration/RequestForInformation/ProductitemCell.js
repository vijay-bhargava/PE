import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Avatar, Button, Tooltip } from '@mui/material';
import * as React from 'react';
import { HiOutlineTrash, HiOutlineUserAdd, HiX, HiOutlineChevronDown, HiOutlineChevronUp, HiPencilAlt } from "react-icons/hi";
import { formatDateViaLocale, formatDateViaTimeZone } from '../../../utils/common/utility';
import { useStateValue } from '../../../store';
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import CommonTooltip from '../../../components/commonTooltip';


const ProductitemCell = ({ itemsList, handleEditItem, handleDeleteItem, tempDataForItemService, action, eventType }) => {
    console.log("itemsListitemsList", itemsList);
    console.log('proitemcell', tempDataForItemService);
    console.log('eventType::', eventType);
    const [{ atoken, rtoken, customerid, roleClaims, userDetail }, dispatch, thousands_separators] =
        useStateValue();
    const [openItems, setOpenItems] = React.useState({});
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleClose = (index) => {
        setOpenItems(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const hasErpId = Array.isArray(itemsList) && itemsList.some(item => item?.erpSourceId);

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Calculate the paginated items
    const paginatedItems = itemsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <div className='table-responsive item-Table'>
                <table className='itemstable stripped'>
                    <thead style={{ backgroundColor: '#0d6efd', color: 'white' }}>
                        <tr>
                            <th className='text-white fw500 f14'>S.No</th>
                            <th className='text-white fw500 f14'>Item Code</th>
                            <th className='text-white fw500 f14'>Item / Service</th>
                            <th className='text-white fw500 f14'>Quantity</th>
                            <th className='text-white fw500 f14'>Target Price</th>
                            {eventType == 'Auction' && <th className='text-white fw500 f14'>Start Price</th>}
                            {eventType == 'Auction' && <th className='text-white fw500 f14'>{tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5 ? 'Min Increment' : 'Min Decrement'}</th>}
                            {eventType == 'Auction' && <th className='text-white fw500 f14'>{tempDataForItemService[0]?.bidTypeID == 1 || tempDataForItemService[0]?.bidTypeID == 5 ? 'Increment On' : 'Decrement On'}</th>}
                            {eventType == 'Auction' && tempDataForItemService[0]?.bidClosingType == 'S' && <th className='text-white fw500 f14'>Item Duration</th>}
                            {eventType == 'RFQ' && <th className='text-white fw500 f14'>Delivey Location</th>}
                            {hasErpId && <th className='text-white fw500 f14'>External SourceId</th>}
                            {<th className='text-white fw500 f14'>{action ? 'Actions' : "Actions"}</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.length > 0 && paginatedItems.map((item, index) => (
                            <React.Fragment key={index}>
                                <tr className={index % 2 === 0 ? 'even' : 'odd'}>
                                    <td className='f14' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{page * rowsPerPage + index + 1}</td>
                                    <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <CommonTooltip title={item?.itemCode || ''} placement="bottom">
                                            <span>{item?.itemCode}</span>
                                        </CommonTooltip>
                                    </td>
                                    <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <CommonTooltip title={item?.itemName || ''} placement="bottom">
                                            <span>{item?.itemName}</span>
                                        </CommonTooltip>
                                    </td>
                                    <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{thousands_separators(item?.quantity)} {item?.uom}</td>
                                    <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{thousands_separators(item?.targetPrice)}</td>
                                    {eventType == 'Auction' && <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{thousands_separators(item?.startPrice)}</td>}
                                    {eventType == 'Auction' && <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{thousands_separators(item?.minimumDelta)}</td>}
                                    {eventType == 'Auction' && <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{item?.decreamentOn == 'A' ? 'Amt' : '%age'}</td>}
                                    {eventType == 'Auction' && tempDataForItemService[0]?.bidClosingType == 'S' && <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{item?.itemBidDuration}</td>}
                                    {eventType == 'RFQ' && <td className='f14 productTd' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{item?.plant}</td>}
                                    {hasErpId && <td className='f14' onClick={() => handleEditItem(item)} style={{ cursor: "pointer" }}>{item?.erpSourceId}</td>}
                                    <td className='f14'>
                                        <IconButton size='small' onClick={() => handleClose(index)}>
                                            {openItems[index] ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                        </IconButton>

                                        {action && <IconButton size='small'
                                            onClick={() => handleDeleteItem(item?.id)}
                                            disabled={itemsList[0]?.bidId && tempDataForItemService[0]?.stage !== 'Draft'}
                                        >
                                            <HiX className='text-danger' />
                                        </IconButton>}
                                    </td>
                                </tr>
                                {openItems[index] && (
                                    <>
                                        <tr>
                                            <td colSpan={action ? 8 : 7}>
                                                <div className='details d-flex justify-content-between align-items-center'>
                                                    <div className='col-md-7'>
                                                        <div className='description f14'>
                                                            <div className=' productTdDesc'>Description: {item?.itemDesc}</div>
                                                        </div>


                                                    </div>
                                                    <div className='col-md-5'>
                                                        <div className='description f14 align-items-center d-flex '>
                                                            <div className='description col-md-3'>

                                                                Attachment :
                                                            </div>
                                                            <div className='text-truncate'>

                                                                <Button
                                                                    variant="text"
                                                                    size="small"
                                                                    className="attached-file-name pointer text-truncate"
                                                                    onClick={() => downloadFilesOnAzure(item?.itemFile, getFileName(item?.itemFile), atoken)}
                                                                >
                                                                    {getFileName(item?.itemFile)}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </td>

                                        </tr>
                                        {item?.itemCategory && <tr>

                                            <td colSpan={action ? 8 : 7}>
                                                <div className='details'>
                                                    <div className='description f14 productTdDesc'>
                                                        Category: {item?.itemCategory}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>}
                                        {item?.itemImage && <tr>
                                            <td colSpan={action ? 8 : 7}>
                                                <div className='details'>
                                                    <div className='description f14 productTdDesc' style={{ display: 'flex', alignItems: 'center' }}>
                                                        Image : {<Avatar
                                                            alt="Logo"
                                                            src={item?.itemImage}
                                                            sx={{
                                                                width: 50,
                                                                height: 50,
                                                                marginLeft: 2,
                                                                borderRadius: 0
                                                            }}
                                                            imgProps={{
                                                                style: {
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'fill',

                                                                },
                                                            }}
                                                        />}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>}
                                        <tr>
                                            <td colSpan={action ? 8 : 7}>
                                                <div className='last-po-details d-flex justify-content-between'>
                                                    {/* <div className='f14'>PO No.: {item?.poNo}</div> */}
                                                    <div className='f14'>PO No.: {item?.poNumber}</div>
                                                    <div className='f14'>PO Date: {item?.poDate ? formatDateViaLocale(item?.poDate, userDetail) : ""}</div>
                                                    <div className='f14'>Supplier Name: {item?.poVendorName}</div>
                                                    <div className='f14'>Unit Rate: {item?.poUnitRate}</div>
                                                    <div className='f14'>PO Value: {item?.poValue}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <TablePagination
                rowsPerPageOptions={[10]}
                component="div"
                count={itemsList.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

export default ProductitemCell;
