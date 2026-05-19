import { Avatar, Button, Chip, IconButton } from '@mui/material';
import * as React from 'react';
import { HiOutlineTrash, HiOutlineUserAdd, HiX, HiOutlineChevronDown, HiOutlineChevronUp, HiPencilAlt } from "react-icons/hi";
import { formatDateViaTimeZone } from '../../../utils/common/utility';
import { downloadFilesOnAzure, getFileName } from '../../../utils/common';
import { useStateValue } from '../../../store';

const PRProductItemCell = ({ prItemsList, handleEditItem, handleDeleteItem, action,eventType }) => {
    const [openItems, setOpenItems] = React.useState({});
    console.log("eventType::",eventType)
    const [{ atoken, rtoken, customerid, roleClaims, userDetail }, dispatch,thousands_separators] =
    useStateValue();
    const handleClose = (index) => {
        setOpenItems(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const hasEventId = prItemsList.some(item => item?.eventId);
    const hasEventType = prItemsList.some(item => item?.eventType);

    return (
        <div className=''>
            <div className='table-responsive item-Table'>
                <table className='itemstable table-striped'>
                    <thead className='rounded' style={{ backgroundColor: '#1f78ce' }}>
                        <tr className='rounded'>
                            <th className='text-white fw500 f14'>S.No</th>
                            <th className='text-white fw500 f14'>Item Code</th>
                            <th className='text-white fw500 f14'>Item / Service</th>
                            <th className='text-white fw500 f14'>Quantity</th>
                            {/* <th className='text-white fw500 f14'>UOM</th> */}
                            <th className='text-white fw500 f14'>Target Price</th>
                            {hasEventId && <th className='text-white fw500 f14'>Event ID</th>}
                            {hasEventType && <th className='text-white fw500 f14'>Event Type</th>}
                            {action && <th className='text-white fw500 f14'>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {prItemsList && prItemsList.length > 0 && prItemsList.map((item, index) => (
                            <React.Fragment key={index}>
                                <tr className={index % 2 === 0 ? 'even' : 'odd'}>
                                    <td className='f14'>{index + 1}</td>
                                    <td className='text-truncate f14' onClick={() => handleEditItem(item)} style={{cursor:"pointer"}}>{item?.itemCode}</td>
                                    {/* <td className='f14'>{item?.shortName || item?.itemName}</td> */}
                                    <td className='f14' onClick={() => handleEditItem(item)} style={{cursor:"pointer"}}>{item?.itemName}</td>
                                    {/* <td className='f14'>{item?.quantity || item?.qty}</td> */}
                                    <td className='f14' onClick={() => handleEditItem(item)} style={{cursor:"pointer"}}>{thousands_separators(item?.quantity)} ({item?.uom})</td>
                                    {/* <td className='f14' onClick={() => handleEditItem(item)} style={{cursor:"pointer"}}>{thousands_separators(item?.quantity)} {item?.uom}</td> */}
                                    <td className='f14' onClick={() => handleEditItem(item)} style={{cursor:"pointer"}}>{thousands_separators(item?.targetPrice)}</td>
                                    {item?.eventId !== undefined && item?.eventId !== null && item.eventId !== "0" && item.eventId !== 0 ? (
                                        <td className='f14' onClick={() => handleEditItem(item)} style={{cursor:"pointer"}}>{item.eventId}</td>
                                    ) : (
                                        <td className='f14'></td>
                                    )}
                                    {item?.eventType && <td className='f14'>{item?.eventType}</td>}
                                    {action && (
                                        <td className='f14'>
                                            <IconButton size='small' onClick={() => handleClose(index)}>
                                                {openItems[index] ? <HiOutlineChevronUp className='f17' /> : <HiOutlineChevronDown className='f17' />}
                                            </IconButton>
                                            <IconButton size='small' onClick={() => handleDeleteItem(item?.id)}>
                                                <HiX className='f17 text-danger' />
                                            </IconButton>
                                        </td>
                                    )}
                                </tr>
                                {openItems[index] && (
                                   <>
                                   <tr>
                                            <td colSpan={action ? 8 : 7}>
                                                <div className='details'>
                                                    <div className='description f14 productTdDesc'>
                                                        Description: {item?.itemDesc}
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
                                        {item?.itemFile &&<tr>
                                            <td colSpan={action ? 8 : 7}>
                                                <div className='details'>
                                                    <div className='description f14 productTdDesc'>
                                                         Attachment :
                                                        <Button
                               variant="text"
                               size="small"
                               className="attached-file-name pointer"
                               onClick={()=>downloadFilesOnAzure(item?.itemFile,getFileName(item?.itemFile),atoken)}
                           >
                               {getFileName(item?.itemFile)}
                           </Button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>}
                                   <tr>
                                        <td colSpan={action ? 8 : 6}>
                                          
                                            <div className='row'>
                                                <div className='col-12 f12'>Last PO Details</div>
                                            </div>
                                            <div className='row'>
                                                <div className='col-lg text-truncate'>
                                                    <div className='f12 text-muted'>PO No.</div>
                                                    <div className='f12 text-truncate'>{item?.poNumber}</div>
                                                </div>
                                                <div className='col-lg'>
                                                    <div className='f12 text-muted'>PO Date</div>
                                                    <div className='f12'>{formatDateViaTimeZone(item?.poDate)}</div>
                                                </div>
                                                <div className='col-lg text-truncate'>
                                                    <div className='f12 text-muted'>Supplier Name</div>
                                                    <div className='f12 text-truncate'>{item?.poVendorName}</div>
                                                </div>
                                                <div className='col-lg'>
                                                    <div className='f12 text-muted'>Unit Rate</div>
                                                    <div className='f12'>{item?.unitRate}</div>
                                                </div>
                                                <div className='col-lg'>
                                                    <div className='f12 text-muted'>PO Value</div>
                                                    <div className='f12'>{item?.poValue}</div>
                                                </div>
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
        </div>
    );
}

export default PRProductItemCell;
