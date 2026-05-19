import React from 'react'
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Switch, Tooltip, IconButton, MenuItem } from '@mui/material';
import { HiChevronLeft, HiChevronRight, HiDotsVertical, HiPencilAlt } from 'react-icons/hi';
import { ExpandLess, ExpandMore, UnfoldLess, UnfoldMore } from '@mui/icons-material';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import { DropdownButton } from 'react-bootstrap';
import VendortTable from './VendortTable';
const RenderTable = ({ actions, actionsR }) => {

    return (
        <>
            <div className='d-flex justify-content-between minh50px align-items-center p-2 border-bottom'>
                <Button className='stagger-custom-button' onClick={actionsR?.handlePrevious} disabled={actionsR?.currentTableIndex == 0}>
                    <HiChevronLeft />
                </Button>
                <div className='f14 fw500 d-flex align-items-center'>
                    {`(Slot ${actionsR?.currentTableIndex + 1} of ${actions?.totalCount} )`} Remaining Time :
                    <div className='text-danger'>
                        {actionsR?.showRemainingTime
                            ? actionsR?.timeRemainingForGrp
                            : actionsR?.slotStatus}
                    </div>
                    <div className="ms-3 pointer">
                        {!actionsR?.showRemainingTime &&
                            actionsR?.slotStatus !== "Slot_Closed" &&
                            actionsR?.filteredItems[0]?.itemStatus !== "Paused" &&
                            actionsR?.filteredItems[0]?.itemStatus !== "Close" &&
                            actionsR?.filteredItems[0]?.groupNo !== 1 ? (
                            <PauseCircleOutlineOutlinedIcon onClick={actionsR?.handleOpenModal} />
                        ) : (
                            actions?.auctionManageData?.[0]?.stage === "Paused" &&
                            (() => {
                                // const bidItems = actions?.auctionManageData?.[0]?.bidParamater ?? [];
                                const bidItems = actions?.lineItemsPerPage ?? [];
                                const currentItem = actionsR?.filteredItems[0];

                                // Find index of current item in bidParamater
                                // const currentIndex = bidItems.findIndex(item => item.id === currentItem?.id);
                                const currentIndex = bidItems.findIndex(item => item.bidParameterId === currentItem?.bidParameterId);

                                // Check if previous item is "Close"
                                const prevItem = bidItems[currentIndex - 1];
                                if (prevItem?.itemStatus === "Close" && currentItem?.itemStatus !== "Close") {
                                    return (
                                        <PlayCircleFilledWhiteOutlinedIcon onClick={actionsR?.handleOpenModalForReopen} />
                                    );
                                }
                                return null;
                            })()
                        )}
                    </div>
                </div>
                <div>
                    <Button className='stagger-custom-button' onClick={actionsR?.handleNext} disabled={actionsR?.currentTableIndex == actionsR?.uniqueGroupCount - 1}>
                        <HiChevronRight />
                    </Button>
                </div>
            </div>
            <TableContainer component={Paper} className="mt-2 mb-5" style={{ overflowX: "hidden" }}>
                <Table className='items-table table-striped'>
                    <TableHead className="headBidTable">
                        <TableRow className="rowBidTable">
                            <TableCell className="cellBidtable">S.No</TableCell>
                            <TableCell className="cellBidtable">Item / Service</TableCell>
                            {actions?.expandedItemIds.length === 0 && (
                                <th className='text-white fw500 f14'>
                                    {actions?.auctionManageData[0]?.bidTypeID == 1 || actions?.auctionManageData[0]?.bidTypeID == 5 ? "H1 Rank" : "L1 Rank"}
                                </th>
                            )}
                            <TableCell className="cellBidtable">Qty</TableCell>
                            <TableCell className="cellBidtable">Target Price</TableCell>
                            <th className='text-white fw500 f14'>Show Target Price</th>
                            <TableCell className="cellBidtable">
                                {actions?.auctionManageData[0]?.bidTypeID == 1 || actions?.auctionManageData[0]?.bidTypeID == 5 ? "Show H1 Price" : "Show L1 Price"}
                            </TableCell>
                            <TableCell className="cellBidtable">Show Start Price</TableCell>
                            <TableCell className="cellBidtable">Start Unit Price</TableCell>
                            <TableCell className="cellBidtable">
                                {actions?.auctionManageData[0]?.bidTypeID == 1 || actions?.auctionManageData[0]?.bidTypeID == 5 ? "Min.Increment" : "Min.Decrement"}
                            </TableCell>
                            <TableCell
                                className=" d-flex justify-content-end align-items-center"
                                style={{ textAlign: "right" }}
                            >
                                <Tooltip
                                    title={actions?.expandAll ? "Collapse All" : "Expand All"}
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                fontSize: '0.8rem',
                                                padding: '8px 12px'
                                            }
                                        }
                                    }}
                                >
                                    <span
                                        onClick={actions?.expandAll ? () => actions?.handleCollapseAll(actions?.setExpandAll) : () => actions?.handleExpandAll(actions?.setExpandAll)}
                                        style={{
                                            fontSize: "18px",
                                            cursor: "pointer",
                                            color: "white",
                                            fontWeight: "400",
                                            marginRight: "8px",
                                        }}
                                    >
                                        {actions?.expandAll ? <UnfoldLess /> : <UnfoldMore />}
                                    </span>
                                </Tooltip>
                                <DropdownButton
                                    as={"div"}
                                    key={"end7"}
                                    id={`myacccmenu`}
                                    className="sidebaraccmenu pe-0  "
                                    drop={"bottom"}
                                    title={
                                        <Tooltip
                                            title={"Bid Control"}
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        fontSize: '0.8rem',
                                                        padding: '8px 12px'
                                                    }
                                                }
                                            }}
                                        >
                                            <div>
                                                <HiDotsVertical />
                                            </div>
                                        </Tooltip>
                                    }
                                >
                                    <span className="shadow rounded min-width-200px">
                                        <MenuItem
                                            className="p-2"
                                            onClick={() => actions?.handleShowAddVendorModal("AddSuppliers")}
                                            disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage)}
                                        >
                                            <span className="f13 fw400">Add Suppliers</span>
                                        </MenuItem>
                                        <MenuItem
                                            className="p-2"
                                            onClick={() => actions?.handleShowSendReminderModal("Reminder")}
                                            disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage)}
                                        >
                                            <span className="f13 fw400">Send Reminder</span>
                                        </MenuItem>
                                        <MenuItem
                                            className="p-2"
                                            onClick={() => actions?.handleShowReOpenModal("Reopened")}
                                            // disabled={["Running", "Paused"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus == "running"}
                                            disabled={["Paused"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus == "running"}
                                        >
                                            <span className="f13 fw400">Auction Open</span>
                                        </MenuItem>
                                        <MenuItem
                                            className="p-2"
                                            onClick={() => {
                                                actions?.setActionModal({ ...actions?.actionmodal, ["surrogateSupplierModal"]: true });
                                            }}
                                            disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus == "running"}
                                        >
                                            <span className="f13 fw400">Surrogate Supplier</span>
                                        </MenuItem>
                                        <MenuItem
                                            className={`p-2 ${actions?.bidStatus === "running" ? "disabled-menu-item" : ""}`}
                                            onClick={() => actions?.bidStatus !== "running" && actions?.handleCancel()}
                                            disabled={["Close", "Paused", "Awarded"].includes(actions?.auctionManageData[0]?.stage) || actions?.bidStatus === "running"}
                                        >
                                            <span className="f13 fw400">Cancel Auction</span>
                                        </MenuItem>
                                        <MenuItem
                                            className={`p-2 ${actions?.bidStatus === "running" ? "disabled-menu-item" : ""}`}
                                            onClick={actionsR?.submitPrebid}
                                            disabled={
                                                actions?.bidStatus == "running" ||
                                                actions?.allVendorParticipationDetails?.some((item) => item.isPrePrice === true || item?.id > 0) ||
                                                (actions?.auctionManageData[0]?.stage && actions?.auctionManageData[0]?.stage !== "Open")
                                            }
                                        >
                                            <span className="f13 fw400">Prebid / Restrict Vendors</span>
                                        </MenuItem>
                                    </span>
                                </DropdownButton>
                            </TableCell>
                            {/* <TableCell className="cellBidtable">Actions</TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actionsR?.filteredItems.map((item, index) => (
                            <React.Fragment key={item.bidParameterId}>
                                <TableRow>
                                    <TableCell>{index + 1}</TableCell>
                                    <Tooltip
                                        title="Open Graph"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    fontSize: '0.8rem',
                                                    padding: '8px 12px'
                                                }
                                            }
                                        }}
                                    >
                                        <TableCell
                                            className="fw-bold f13 text-primary"
                                            style={{
                                                cursor: "pointer",
                                                maxWidth: "150px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
                                            onClick={() => actionsR?.OpenModal(actionsR?.filteredItems, index)}
                                        >
                                            {item.itemName}
                                        </TableCell>
                                    </Tooltip>
                                    {actions?.expandedItemIds.length === 0 && (
                                        <TableCell className="f13 fw500 productTd text-primary">
                                            {(() => {
                                                const linkedVendors = actions?.allVendorParticipationDetails.filter(vendor => vendor.bidParameterId === item.bidParameterId);
                                                const targetRank = actions?.auctionManageData[0]?.bidTypeID === 1 || actions?.auctionManageData[0]?.bidTypeID === 5 ? "H1" : "L1";
                                                const vendor = linkedVendors.find(vendor => vendor.rankValue === targetRank);
                                                return vendor ? vendor.companyName : <span className="text-danger">N/A</span>;
                                            })()}
                                        </TableCell>
                                    )}
                                    <TableCell className='text-primary'>{actionsR?.thousands_separators(item.quantity)} <span className='ms-1'>{item.uom}</span></TableCell>
                                    <TableCell className='text-primary'>{actionsR?.thousands_separators(item?.targetPrice)}</TableCell>
                                    <TableCell className='text-primary'>
                                        <Switch
                                            checked={item?.hidePrice}
                                            inputProps={{ "aria-label": "controlled" }}
                                            classes={{
                                                thumb: "MuiSwitch-thumb",
                                                switchBase: "MuiSwitch-switchBase",
                                                checked: "Mui-checked",
                                            }}
                                            onChange={(e) => {
                                                const newValue = e.target.checked;
                                                actions?.handleSubmit('hidePrice', null, newValue, item?.bidParameterId);
                                            }}
                                            disabled={actions?.bidStatus !== "not_started" || actions?.auctionManageData[0]?.stage == 'Close'}
                                        />
                                    </TableCell>
                                    <TableCell className='text-primary'>
                                        <Switch
                                            checked={item?.maskL1Price}
                                            inputProps={{ "aria-label": "controlled" }}
                                            classes={{
                                                thumb: "MuiSwitch-thumb",
                                                switchBase: "MuiSwitch-switchBase",
                                                checked: "Mui-checked",
                                            }}
                                            onChange={(e) => {
                                                const newValue = e.target.checked;
                                                actions?.handleSubmit('maskL1Price', null, newValue, item?.bidParameterId);
                                            }}
                                            disabled={actions?.auctionManageData[0]?.stage == 'Close' || actionsR?.slotStatus == 'Slot_Closed'}
                                        />
                                    </TableCell>
                                    <TableCell className='text-primary'>
                                        <Switch
                                            checked={item?.showStartPrice}
                                            inputProps={{ "aria-label": "controlled" }}
                                            classes={{
                                                thumb: "MuiSwitch-thumb",
                                                switchBase: "MuiSwitch-switchBase",
                                                checked: "Mui-checked",
                                            }}
                                            onChange={(e) => {
                                                const newValue = e.target.checked;
                                                actions?.handleSubmit('showStartPrice', 0, newValue, item?.bidParameterId);
                                            }}
                                            disabled={actions?.auctionManageData[0]?.stage == 'Close' || actionsR?.slotStatus == 'Slot_Closed'}
                                        />
                                    </TableCell>
                                    <TableCell className='text-primary'>
                                        {actionsR?.thousands_separators(item?.startPrice)}
                                        {/* {actions?.auctionManageData[0]?.stage !== 'Close' && ( */}
                                        {!(
                                            actions?.auctionManageData[0]?.stage === 'Close' ||
                                            actionsR?.slotStatus === 'Slot_Closed'
                                        ) && (
                                                <HiPencilAlt
                                                    onClick={() => actions?.handleOpen('startPrice', index, item?.bidParameterId)}
                                                    className="text-primary"
                                                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                />
                                            )}
                                    </TableCell>
                                    <TableCell className='text-primary'>
                                        {actionsR?.thousands_separators(item?.minimumDelta)}
                                        {/* {actions?.auctionManageData[0]?.stage !== 'Close' && ( */}
                                        {!(
                                            actions?.auctionManageData[0]?.stage === 'Close' ||
                                            actionsR?.slotStatus === 'Slot_Closed'
                                        ) && (
                                                <HiPencilAlt
                                                    onClick={() => actions?.handleOpen('minimumDelta', index, item?.bidParameterId)}
                                                    className="text-primary"
                                                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                />
                                            )}
                                    </TableCell>
                                    <TableCell className='text-primary'>
                                        <IconButton onClick={actions?.expandAll ? () => actions?.handleCollapseAll(actions?.setExpandAll) : () => actions?.handleExpandAll(actions?.setExpandAll)}>
                                            {actions?.expandedItemIds.includes(item.bidParameterId) ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-none p-0">
                                    {actions?.expandedItemIds.includes(item.bidParameterId) && (
                                        <TableCell colSpan={10} className='p-0'>
                                            <VendortTable
                                                actions={actions}
                                                actionsR={actionsR}
                                                hasLoadingFactor={actions?.hasLoadingFactor}
                                                key={item.bidParameterId} auctionItem={item} />
                                        </TableCell>
                                    )}
                                </TableRow>

                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
                <div className='row mb-3'>
                    <div className='col-md-12 text-end mt-3 d-flex justify-content-end'>
                        <Pagination
                            count={actions?.totalCount}
                            page={actionsR?.currentTableIndex + 1}
                            onChange={(event, page) => {
                                const totalPages = actions?.totalCount; // or whatever logic gives total pages
                                actionsR?.setCurrentTableIndex?.(page - 1);
                                // Call your function
                                actionsR?.callbackPagination(page, 10);
                            }}
                            variant='outlined'
                        />
                    </div>
                </div>
            </TableContainer>
        </>
    );
}

export default RenderTable
