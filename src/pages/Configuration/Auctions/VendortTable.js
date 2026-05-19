import React from 'react'
import { Tooltip, IconButton, TextField, Checkbox } from '@mui/material';
import { HiArrowDown, HiArrowUp, HiPencilAlt, HiX } from 'react-icons/hi';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

const VendortTable = ({ actions, auctionItem, actionsR, hasLoadingFactor }) => {
    return (
        <table className="vendors-table">
            <thead>
                <tr>
                    <th>Suppliers</th>
                    <th>Rank</th>
                    <th style={{ textAlign: "right" }}>Initial Quote</th>
                    <th style={{ textAlign: "right" }}>Latest Quote</th>
                    <th style={{ textAlign: "right" }}>Auction Value</th>
                    {hasLoadingFactor && <th style={{ textAlign: "right" }}>Loading Factor</th>}
                    {hasLoadingFactor && <th style={{ textAlign: "right" }}>Loaded Amount</th>}
                    <th style={{ textAlign: "right" }}>
                        {actions?.auctionManageData[0]?.bidTypeID == 1 || actions?.auctionManageData[0]?.bidTypeID == 5 ? (
                            <HiArrowUp className="text-success" />
                        ) : (
                            <HiArrowDown className="text-danger" />
                        )}
                        Start Price %
                    </th>
                    <th style={{ textAlign: "right" }}>
                        {actions?.auctionManageData[0]?.bidTypeID == 1 || actions?.auctionManageData[0]?.bidTypeID == 5 ? (
                            <HiArrowUp className="text-success" />
                        ) : (
                            <HiArrowDown className="text-danger" />
                        )}
                        Target Price %
                    </th>
                    <th style={{ textAlign: "right" }}>
                        {actions?.auctionManageData[0]?.bidTypeID == 1 || actions?.auctionManageData[0]?.bidTypeID == 5 ? (
                            <HiArrowUp className="text-success" />
                        ) : (
                            <HiArrowDown className="text-danger" />
                        )}
                        Last Invoice Price %
                    </th>
                </tr>
            </thead>
            <tbody>
                {actions?.allVendorParticipationDetails?.filter(
                    vendor => vendor.bidParameterId == auctionItem.bidParameterId
                )?.length > 0 &&
                    actions?.allVendorParticipationDetails
                        ?.filter(vendor => vendor.bidParameterId == auctionItem.bidParameterId)
                        ?.sort((a, b) => (a.restrictRemarks && !b.restrictRemarks ? 1 : !a.restrictRemarks && b.restrictRemarks ? -1 : 0))
                        ?.map((sq, i2) => {
                            if (sq?.vendorId) {
                                return (
                                    <tr key={`supplieritemlist${sq.vendorId}-${i2}`}>
                                        <td>
                                            {
                                                (actions?.auctionManageData[0]?.hideVendor === true && actions?.bidStatus === 'running') ? (
                                                    <Tooltip title="Supplier Name">{'Anonymous Supplier'}</Tooltip>
                                                ) : (
                                                    <Tooltip title="Supplier Name">
                                                        {sq.companyName}
                                                        {sq.selectedCurrency && ` (${sq.selectedCurrency})`}
                                                        {/* {actions?.auctionManageData[0]?.isMultiCurrency && 
                                                            (() => {
                                                                const vendorData = actions?.auctionManageData[0]?.bidVendorInvited?.find(v => v.vendorID === sq.vendorId);
                                                                return vendorData?.currency ? ` (${vendorData.currency})` : '';
                                                            })()
                                                        } */}
                                                    </Tooltip>
                                                )
                                            }
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <Tooltip title="Rank" style={{ color: actionsR?.getRankColor(sq.rankValue) }}>{sq.rankValue || "N/A"}</Tooltip>
                                               
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <Tooltip title="Restrict Vendor to Quote">
                                                {!(
                                                    actions?.auctionManageData[0]?.isReOpen === true ||
                                                    (actions?.auctionManageData[0]?.stage !== "Open" || actions?.auctionManageData[0]?.stage == "Running" || actions?.bidStatus == 'running')
                                                ) && (
                                                        <Checkbox
                                                            size="small"
                                                            onChange={() => actionsR?.handleCheckboxRestrict(sq.vendorId, sq.bidParameterId)}
                                                            checked={
                                                                (actionsR?.restrictVendorId == sq.vendorId && actionsR?.restrictParameterId == sq.bidParameterId) ||
                                                                !!(actionsR?.prebidValues.find(item => item.createdById == sq.vendorId && item.bidParameterId == sq.bidParameterId)?.restrictRemarks) ||
                                                                !!(sq?.restrictRemarks)
                                                            }
                                                            disabled={
                                                                !!(sq?.restrictRemarks) ||
                                                                (sq.quotedPrice !== undefined && sq.quotedPrice !== null && sq.quotedPrice !== 0) ||
                                                                actionsR?.prebidValues.some(
                                                                    (item) =>
                                                                        item.createdById === sq.vendorId &&
                                                                        item.bidParameterId === sq.bidParameterId &&
                                                                        item.quotedPrice !== undefined &&
                                                                        item.quotedPrice !== null
                                                                )
                                                            }
                                                        />
                                                    )}
                                            </Tooltip>
                                            {actionsR?.restrictVendorId == sq.vendorId && actionsR?.restrictParameterId == sq.bidParameterId ? (
                                                <TextField
                                                    value={(() => { const e = actionsR?.prebidValues.find(item => item.createdById == sq.vendorId && item.bidParameterId == sq.bidParameterId); return e !== undefined ? (e.restrictRemarks ?? '') : (sq?.restrictRemarks ?? ''); })()}
                                                    onChange={(e) => {
                                                        actionsR?.handleRestricttChange(e, sq);
                                                    }}
                                                    onBlur={() => actionsR?.handleBlur()}
                                                    type="text"
                                                    size="small"
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {actionsR?.prebidValues.find(item => item.createdById == sq.vendorId && item.bidParameterId == sq.bidParameterId)?.restrictRemarks
                                                        || sq?.restrictRemarks
                                                        || (sq?.initialPrice > 0 ? actionsR?.thousands_separators(sq.initialPrice) : (sq.initialPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))}
                                                    {(sq?.restrictRemarks) && !((actions?.auctionManageData[0]?.stage !== "Open" || actions?.auctionManageData[0]?.stage == "Running" || actions?.bidStatus == 'running')) && (
                                                        <Tooltip title="Remove Restrict Remark">
                                                            <span>
                                                                <HiX
                                                                    size={16}
                                                                    className="text-danger"
                                                                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                                    onClick={() => actionsR?.handleRemoveRestrictRemarks(sq?.id)}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {actionsR?.editingVendorId == sq.vendorId && actionsR?.editingParameterId == sq.bidParameterId ? (
                                                <TextField
                                                    value={(() => { const e = actionsR?.prebidValues.find(item => item.createdById == sq.vendorId && item.bidParameterId == sq.bidParameterId); return e !== undefined ? (e.quotedPrice ?? '') : (sq.quotedPrice || ''); })()}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value >= 0 || value === '') {
                                                            actionsR?.handlePriceChange(e, sq);
                                                        }
                                                    }}
                                                    onBlur={() => actionsR?.handleBlur()}
                                                    type="number"
                                                    size="small"
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {
                                                        actionsR?.prebidValues.find(item => item.createdById == sq.vendorId && item.bidParameterId == sq.bidParameterId)?.quotedPrice || (sq.quotedPrice && sq.quotedPrice !== 0 ? actionsR?.thousands_separators(sq.quotedPrice) : (sq.quotedPrice === null && sq.id > 0 ? 'Quoted' : 'Not Participated'))
                                                    }
                                                    {sq.rankValue !== null && actionsR?.slotStatus !== "Slot_Closed" && actions?.bidStatus !== null && !actions?.auctionManageData[0]?.hideVendor && sq.quotedPrice !== null && sq.quotedPrice !== undefined && (
                                                        <Tooltip title="Remove Quote">
                                                            <span>
                                                                <HiX
                                                                    size={18}
                                                                    className="text-danger"
                                                                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                                    onClick={() => actionsR?.handleOpenModalRemoveQuoteInStagger(sq?.quotedPrice, sq?.id)}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    {!(
                                                        actions?.auctionManageData[0]?.isReOpen === true ||
                                                        (actions?.auctionManageData[0]?.stage !== "Open" ||
                                                            actions?.auctionManageData[0]?.stage == "Running" || actions?.bidStatus == 'running')
                                                    ) && (
                                                            <HiPencilAlt
                                                                className="text-primary"
                                                                //style={{ cursor: 'pointer', marginLeft: '5px' }}
                                                                style={{
                                                                    marginLeft: '5px',
                                                                    cursor: sq?.restrictRemarks || actionsR?.prebidValues?.some(
                                                                        (item) =>
                                                                            item.createdById === sq.vendorId &&
                                                                            item.bidParameterId === sq.bidParameterId &&
                                                                            item.restrictRemarks
                                                                    )
                                                                        ? 'not-allowed'
                                                                        : 'pointer',
                                                                    pointerEvents: sq?.restrictRemarks || actionsR?.prebidValues?.some(
                                                                        (item) =>
                                                                            item.createdById === sq.vendorId &&
                                                                            item.bidParameterId === sq.bidParameterId &&
                                                                            item.restrictRemarks
                                                                    )
                                                                        ? 'none'
                                                                        : 'auto'
                                                                }}
                                                                onClick={() => actionsR?.handleEditPrice(sq.vendorId, sq.bidParameterId)}
                                                            />
                                                        )}
                                                </>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {/* {actionsR?.thousands_separators(sq?.quotedPrice * auctionItem?.quantity)} */}
                                            {((sq?.quotedPrice ?? 0) * (auctionItem?.quantity ?? '')) == 0
                                                //? 'N/A'
                                                ? 0
                                                : actionsR?.thousands_separators((sq?.quotedPrice ?? '') * (auctionItem?.quantity ?? ''))
                                            }
                                        </td>
                                        {hasLoadingFactor && <td style={{ textAlign: "right" }}>{actionsR?.thousands_separators(sq?.loadingFactors) || 0}</td>}
                                        {hasLoadingFactor && <td style={{ textAlign: "right" }}>{actionsR?.thousands_separators(sq?.loadedPrice) || 0}</td>}
                                        <td style={{ textAlign: "right" }}>
                                            {sq?.percRedStartPrice != null
                                                ? `${actionsR?.thousands_separators(Number(sq.percRedStartPrice).toFixed(2))}%`
                                                : "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {sq?.percRedTargetPrice != null
                                                ? `${actionsR?.thousands_separators(Number(sq.percRedTargetPrice).toFixed(2))}%`
                                                : "N/A"}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            {sq?.percRedLastInvPrice != null
                                                ? `${actionsR?.thousands_separators(Number(sq.percRedLastInvPrice).toFixed(2))}%`
                                                : "N/A"}
                                        </td>
                                    </tr>
                                );
                            }
                            return null;
                        })}
            </tbody>
        </table>
    );
}

export default VendortTable
